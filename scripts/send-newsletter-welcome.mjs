#!/usr/bin/env node
// scripts/send-newsletter-welcome.mjs — Wave 30.2
// Batch send welcome emails to pending newsletter_subscribers via Gmail SMTP.
// 從 D1 撈 status='active' AND welcome_sent_at IS NULL,用 nodemailer 寄
// 寄成功就 UPDATE welcome_sent_at = now(),dedupe 防重寄。
//
// Usage:  node scripts/send-newsletter-welcome.mjs
//         (需在 mycafe 專案根目錄跑,NODE_PATH 指到 nodemailer 模組)
//
// Why batch (非 realtime):
//   - CF Pages Workers 不能跑 raw SMTP(免費方案無 TCP socket)
//   - CF Email Service 走 HTTP API 但 secret 設置卡 token 權限問題
//   - nodemailer + Gmail SMTP 100% reliable 但要 Node runtime → 走 batch
//   - 訂閱當下 D1 入庫,跑這個 script 就寄,延遲以分鐘級
import nodemailer from "nodemailer";
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

// Load SMTP creds from Hermes .env
const envText = readFileSync(
  "/data2/hermes-profiles/profiles/xiaxiq/.env",
  "utf-8",
);
const env = {};
for (const line of envText.split("\n")) {
  const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.+)$/);
  if (m) env[m[1]] = m[2].trim();
}

const SMTP_HOST = env.EMAIL_SMTP_HOST;
const SMTP_PORT = parseInt(env.EMAIL_SMTP_PORT || "587", 10);
const SMTP_USER = env.EMAIL_ADDRESS;
const SMTP_PASS = env.EMAIL_PASSWORD;
const GOOGLE_CLIENT_ID = env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REFRESH_TOKEN = env.GOOGLE_REFRESH_TOKEN;

if (
  !SMTP_HOST ||
  !SMTP_USER ||
  !GOOGLE_CLIENT_ID ||
  !GOOGLE_CLIENT_SECRET ||
  !GOOGLE_REFRESH_TOKEN
) {
  console.error(
    "Missing SMTP creds in /data2/hermes-profiles/profiles/xiaxiq/.env",
  );
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465,
  auth: {
    type: "OAuth2",
    user: SMTP_USER,
    clientId: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    refreshToken: GOOGLE_REFRESH_TOKEN,
  },
});

function d1(sql) {
  const out = execSync(
    `npx wrangler d1 execute DB --remote --json --command ${JSON.stringify(sql)}`,
    { encoding: "utf-8" },
  );
  const m = out.match(/\[[\s\S]*\]/);
  if (!m) throw new Error("no JSON in wrangler output");
  return JSON.parse(m[0])[0].results;
}

// Wave 30.3: 抓 site_settings 拿 siteName(4-tier fallback per subscriber locale)
const siteNameRows = d1(
  "SELECT locale, value FROM site_settings WHERE key = 'site_name'",
);
const siteNameMap = {};
for (const r of siteNameRows) siteNameMap[r.locale] = r.value;
function siteNameFor(locale) {
  return (
    siteNameMap[locale] ??
    siteNameMap["zh-Hant"] ??
    siteNameMap["en"] ??
    "mycafe"
  );
}

const subjects = {
  "zh-Hant": (n) => `歡迎訂閱 ${n}`,
  en: (n) => `Welcome to ${n}`,
  "ms-MY": (n) => `Selamat datang ke ${n}`,
  "id-ID": (n) => `Selamat datang di ${n}`,
};

const bodies = {
  "zh-Hant": (e, n) =>
    `${e} 您好,

感謝訂閱 ${n}。我們會不定期寄出新豆上架、沖煮小技巧與產地介紹,內容力求實用、好懂。

不確定從哪一包豆子開始?可以先做 1 分鐘的口味測驗,我們會依你的喜好推薦:
https://mycafe.de5.net/quiz

有任何問題,歡迎直接回信或到聯絡頁留言,我們會在一到兩個工作天內回覆。

${n}
https://mycafe.de5.net/`,
  en: (e, n) =>
    `Hello ${e},

Thanks for subscribing to ${n}. We occasionally send news about new beans, practical brewing tips and coffee origins, always written to be clear and useful.

Not sure which coffee to try first? Take our one-minute taste quiz and we will suggest a match:
https://mycafe.de5.net/en/quiz

If you have any questions, just reply to this email or use our contact page. We reply within one to two business days.

${n}
https://mycafe.de5.net/en`,
  "ms-MY": (e, n) =>
    `Helo ${e},

Terima kasih kerana melanggan ${n}. Kami akan sesekali menghantar berita biji kopi baharu, petua menyeduh yang praktikal dan maklumat asal kopi, ditulis dengan jelas dan berguna.

Tidak pasti biji kopi mana untuk dicuba dahulu? Cuba kuiz citarasa seminit kami dan kami akan mencadangkan yang sesuai:
https://mycafe.de5.net/ms-MY/quiz

Jika ada sebarang soalan, balas e-mel ini atau gunakan halaman hubungi kami. Kami membalas dalam masa satu hingga dua hari bekerja.

${n}
https://mycafe.de5.net/ms-MY`,
  "id-ID": (e, n) =>
    `Halo ${e},

Terima kasih telah berlangganan ${n}. Sesekali kami akan mengirim kabar biji kopi baru, tips menyeduh yang praktis, dan informasi asal kopi, ditulis dengan jelas dan bermanfaat.

Belum tahu mau mulai dari biji kopi yang mana? Coba kuis selera satu menit kami dan kami akan merekomendasikan yang cocok:
https://mycafe.de5.net/id-ID/quiz

Jika ada pertanyaan, balas email ini atau gunakan halaman kontak. Kami membalas dalam satu hingga dua hari kerja.

${n}
https://mycafe.de5.net/id-ID`,
};

const subs = d1(
  "SELECT id, email, locale FROM newsletter_subscribers WHERE status='active' AND welcome_sent_at IS NULL ORDER BY created_at ASC",
);
console.log(`Pending: ${subs.length} subscriber(s)`);

let sent = 0;
let failed = 0;
for (const s of subs) {
  const locale = s.locale in subjects ? s.locale : "en";
  const name = siteNameFor(locale);
  try {
    await transporter.sendMail({
      from: `"${name}" <${SMTP_USER}>`,
      to: s.email,
      subject: subjects[locale](name),
      text: bodies[locale](s.email, name),
    });
    const now = Math.floor(Date.now() / 1000);
    d1(
      `UPDATE newsletter_subscribers SET welcome_sent_at = ${now} WHERE id = '${s.id}'`,
    );
    sent++;
    console.log(`  ✓ ${s.email.padEnd(40)} (${locale})`);
  } catch (e) {
    failed++;
    console.error(`  ✗ ${s.email}: ${e.message}`);
  }
}

console.log(`\nDone: ${sent} sent, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
