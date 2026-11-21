// Email integration — Cloudflare Email Service API
// 計畫書 Phase 5+ 改用 Cloudflare Email Service(原本是 Resend,但用戶改用自己的 mail server 0061qwen.cc.cd)
// 需要在 CF Dashboard → Email → Sending 驗證 0061qwen.cc.cd 域 + 設 DKIM
// F-05: universal safe() HTML escape for email templates

import { env } from "cloudflare:workers";

interface EmailEnv {
  CF_API_TOKEN?: string;
  CF_ACCOUNT_ID?: string;
  EMAIL_FROM?: string;
  EMAIL_REPLY_TO?: string;
}

export interface EmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

const DEFAULT_FROM = "OxHorseCraft <oxsupport@0061qwen.cc.cd>";
const DEFAULT_REPLY_TO = "oxsupport@0061qwen.cc.cd";

// F-05: universal HTML escape — 所有 email template 插值都過 safe()
const HTML_ESCAPE_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};
export function safe(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value).replace(/[&<>"']/g, (ch) => HTML_ESCAPE_MAP[ch] ?? ch);
}

export async function sendEmail(
  env: EmailEnv,
  params: EmailParams,
): Promise<{ ok: boolean; id?: string; error?: string }> {
  if (!env.CF_API_TOKEN || !env.CF_ACCOUNT_ID) {
    console.warn("[email] CF_API_TOKEN / CF_ACCOUNT_ID not set, skipping send");
    console.log(`[email] To: ${params.to}`);
    console.log(`[email] Subject: ${params.subject}`);
    return { ok: false, error: "no_credentials" };
  }

  const url = `https://api.cloudflare.com/client/v4/accounts/${env.CF_ACCOUNT_ID}/email/sending`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.CF_API_TOKEN}`,
    },
    body: JSON.stringify({
      from: env.EMAIL_FROM ?? DEFAULT_FROM,
      to: params.to,
      subject: params.subject,
      html: params.html,
      text: params.text,
      reply_to: params.replyTo ?? env.EMAIL_REPLY_TO ?? DEFAULT_REPLY_TO,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error(`[email] CF Email Service error ${res.status}: ${body}`);
    return { ok: false, error: `cf_email_${res.status}` };
  }
  const data = (await res.json()) as { result?: { id?: string } };
  return data.result?.id ? { ok: true, id: data.result.id } : { ok: true };
}

export function emailEnvFromContext(): EmailEnv {
  return env ?? {};
}

export function orderConfirmationEmail(
  orderId: string,
  customerName: string,
  itemsSummary: string,
): { subject: string; html: string; text: string } {
  const subject = `預訂單確認 #${safe(orderId)}`;
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #1A2E1A; font-family: Georgia, serif;">感謝您的預訂</h2>
      <p>${safe(customerName)} 您好,</p>
      <p>我們已收到您的預訂單 <strong>${safe(orderId)}</strong>。</p>
      <p>${safe(itemsSummary)}</p>
      <p>客服將在 1-2 個工作天內與您聯繫,確認運費與付款方式。</p>
      <hr style="border: none; border-top: 1px solid #DCE5DC; margin: 24px 0;" />
      <p style="color: #8A938A; font-size: 12px;">
        OxHorseCraft · 森林系手作品牌 · oxsupport@0061qwen.cc.cd
      </p>
    </div>
  `;
  const text = `感謝您的預訂 #${orderId}。${customerName} 您好,我們已收到您的預訂單。客服將在 1-2 個工作天內與您聯繫。`;
  return { subject, html, text };
}

export function contactNotificationEmail(
  name: string,
  email: string,
  message: string,
): { subject: string; html: string; text: string } {
  const subject = `新聯絡表單:${safe(name)}`;
  // F-05: 先 safe() 再 replace \n → <br>,避免 \n 注入 HTML
  const safeMessage = safe(message).replace(/\n/g, "<br>");
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #1A2E1A;">新訊息</h2>
      <p><strong>${safe(name)}</strong> (${safe(email)}) 留言:</p>
      <blockquote style="border-left: 3px solid #C9925B; padding-left: 12px; color: #4A5748;">
        ${safeMessage}
      </blockquote>
      <p style="color: #8A938A; font-size: 12px;">Reply directly to this email to respond.</p>
    </div>
  `;
  const text = `新訊息 from ${name} (${email}): ${message}`;
  return { subject, html, text };
}

export function welcomeNewsletterEmail(
  email: string,
  locale: string,
  siteName: string,
): { subject: string; html: string; text: string } {
  // Wave 30.3: siteName 從 siteSettings 拿(4-tier fallback 在 caller 端算好傳入)
  const safeName = safe(siteName);
  const safeEmail = safe(email);
  const subjects: Record<string, string> = {
    "zh-Hans": `歡迎來到 ${safeName} · 來自森林的慢信`,
    en: `Welcome to ${safeName} · Letters from the forest`,
    "ms-MY": `Selamat datang ke ${safeName} · Surat dari hutan`,
    "id-ID": `Selamat datang di ${safeName} · Surat dari hutan`,
  };
  const bodies: Record<string, { html: string; text: string }> = {
    "zh-Hans": {
      html: `<p>${safeEmail} 您好,</p>
        <p>感謝訂閱 ${safeName}。我們每季會寄一封慢信,分享新作、調香實驗,以及森林系手作工作室的日常。</p>
        <p>若您願意,也可以從 <a href="https://cnamber.ccwu.cc/quiz">風格測驗</a> 開始,讓我們更了解您喜歡的氣味。</p>
        <p>—— ${safeName} · 森林系手作</p>`,
      text: `${email} 您好,感謝訂閱 ${safeName}。我們每季會寄一封慢信,分享新作、調香實驗,以及森林系手作工作室的日常。`,
    },
    en: {
      html: `<p>Hello ${safeEmail},</p>
        <p>Thanks for subscribing to ${safeName}. We send one slow letter each season — new work, scent experiments, and quiet notes from the studio.</p>
        <p>If you'd like, you can also start with our <a href="https://cnamber.ccwu.cc/quiz">style quiz</a> so we can learn the scents you love.</p>
        <p>— ${safeName} · forest handcraft</p>`,
      text: `Hello ${email}, thanks for subscribing to ${safeName}. We send one slow letter each season — new work, scent experiments, and quiet notes from the studio.`,
    },
    "ms-MY": {
      html: `<p>Helo ${safeEmail},</p>
        <p>Terima kasih kerana melanggan ${safeName}. Kami akan mengirim satu surat perlahan setiap musim — karya baru, eksperimen wangian, dan catatan tenang dari studio.</p>
        <p>— ${safeName} · kraf hutan</p>`,
      text: `Helo ${email}, terima kasih kerana melanggan ${safeName}.`,
    },
    "id-ID": {
      html: `<p>Halo ${safeEmail},</p>
        <p>Terima kasih telah berlangganan ${safeName}. Kami mengirim satu surat perlahan setiap musim — karya baru, eksperimen wewangian, dan catatan tenang dari studio.</p>
        <p>— ${safeName} · kerajinan hutan</p>`,
      text: `Halo ${email}, terima kasih telah berlangganan ${safeName}.`,
    },
  };
  const subject = subjects[locale] ?? subjects["en"] ?? "";
  const body = bodies[locale] ?? bodies["en"] ?? { html: "", text: "" };
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #1A2E1A; font-family: Georgia, serif;">${safeName}</h2>
      ${body.html}
      <hr style="border: none; border-top: 1px solid #DCE5DC; margin: 24px 0;" />
      <p style="color: #8A938A; font-size: 12px;">
        ${safeName} · 森林系琥珀 + 香品 · oxsupport@0061qwen.cc.cd
      </p>
    </div>
  `;
  return { subject, html, text: body.text };
}
