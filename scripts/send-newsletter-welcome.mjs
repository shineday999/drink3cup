#!/usr/bin/env node
// scripts/send-newsletter-welcome.mjs — Wave 30.2
// Batch send welcome emails to pending newsletter_subscribers via Gmail SMTP.
// 從 D1 撈 status='active' AND welcome_sent_at IS NULL,用 nodemailer 寄
// 寄成功就 UPDATE welcome_sent_at = now(),dedupe 防重寄。
//
// Usage:  node scripts/send-newsletter-welcome.mjs
//         (需在 cnamber-store 專案根目錄跑,NODE_PATH 指到 nodemailer 模組)
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
    "cnamber-store"
  );
}

const subjects = {
  "zh-Hant": (n) => `歡迎來到 ${n} · 來自森林的慢信`,
  en: (n) => `Welcome to ${n} · Letters from the forest`,
  "ms-MY": (n) => `Selamat datang ke ${n} · Surat dari hutan`,
  "id-ID": (n) => `Selamat datang di ${n} · Surat dari hutan`,
};

const bodies = {
  "zh-Hant": (e, n) =>
    `${e} 您好,

感謝訂閱 ${n}。我們每季會寄一封慢信,分享新作、調香實驗,以及森林系手作工作室的日常。

若您願意,也可以從我們的風格測驗開始,讓我們更了解您喜歡的氣味:
https://cnamber.ccwu.cc/quiz

—— ${n} · 森林系手作
https://cnamber.ccwu.cc/`,
  en: (e, n) =>
    `Hello ${e},

Thanks for subscribing to ${n}. We send one slow letter each season — new work, scent experiments, and quiet notes from the studio.

If you'd like, you can also start with our style quiz so we can learn the scents you love:
https://cnamber.ccwu.cc/quiz

— ${n} · forest handcraft
https://cnamber.ccwu.cc/`,
  "ms-MY": (e, n) =>
    `Helo ${e},

Terima kasih kerana melanggan ${n}. Kami akan mengirim satu surat perlahan setiap musim — karya baru, eksperimen wangian, dan catatan tenang dari studio.

— ${n} · kraf hutan
https://cnamber.ccwu.cc/`,
  "id-ID": (e, n) =>
    `Halo ${e},

Terima kasih telah berlangganan ${n}. Kami mengirim satu surat perlahan setiap musim — karya baru, eksperimen wewangian, dan catatan tenang dari studio.

— ${n} · kerajinan hutan
https://cnamber.ccwu.cc/`,
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
