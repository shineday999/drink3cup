import type { APIRoute } from "astro";
import { getDB, genId } from "../../../lib/db";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_LOCALES = new Set(["zh-Hans", "en", "ms-MY", "id-ID"]);

export const POST: APIRoute = async (ctx) => {
  const form = await ctx.request.formData();
  const email = String(form.get("email") ?? "")
    .trim()
    .toLowerCase();
  const localeRaw = String(
    form.get("locale") ?? ctx.locals.locale ?? "zh-Hans",
  );
  const locale = ALLOWED_LOCALES.has(localeRaw) ? localeRaw : "zh-Hans";

  if (!EMAIL_RE.test(email) || email.length > 254) {
    return new Response("Invalid email", { status: 400 });
  }

  const db = getDB();
  const id = genId("sub");
  const now = Math.floor(Date.now() / 1000);

  try {
    // INSERT OR IGNORE: dedupe 同 email 不重複 row
    // welcome 信寄送由 scripts/send-newsletter-welcome.mjs (Wave 30.5 OAuth2 SMTP) 處理
    // Workers 無法 raw TCP → /api/newsletter 不寄 re,只 render D1 INSERT → batch sender 撈 welcome_sent_at IS NULL 補寄
    await db
      .prepare(
        "INSERT OR IGNORE INTO newsletter_subscribers (id, email, locale, status, source, created_at, updated_at) VALUES (?, ?, ?, 'active', 'footer_form', ?, ?)",
      )
      .bind(id, email, locale, now, now)
      .run();
  } catch (e) {
    console.error("[newsletter] insert failed", e);
    return new Response("DB error", { status: 500 });
  }

  // 303 redirect 回首頁帶 subscribed=1 query → Footer 顯示成功訊息
  return ctx.redirect("/?subscribed=1", 303);
};
