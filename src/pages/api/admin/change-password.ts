// /api/admin/change-password — POST handler
// Admin 從右上角 modal 改自己的密碼。
// current_password re-verify before update(防 stolen-cookie 改密碼)
// min 8 / max 128 chars(new 跟 current 必須不同;confirm 必須 == new)
// 同 IP 5 次/15 分鐘 lockout(KV 計數,見 src/lib/rate-limit.ts)
// 成功更新 password_hash + password_changed_at + password_changed_ip
// 安全 redirect(只允許 / 開頭且非 // 開頭,防 open-redirect)
import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { getDB } from "../../../lib/db";
import { hashPassword, verifyPassword } from "../../../lib/auth";
import { createRateLimiter } from "../../../lib/rate-limit";

const limiter = createRateLimiter({
  prefix: "change-pw-rl",
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000,
  lockoutMs: 15 * 60 * 1000,
});

const MIN_LEN = 8;
const MAX_LEN = 128;

function safeRedirect(
  input: FormDataEntryValue | null,
  fallback: string,
): string {
  const raw = String(input ?? "").trim();
  if (raw.startsWith("/") && !raw.startsWith("//")) return raw;
  return fallback;
}

interface AdminRow {
  email: string;
  password_hash: string | null;
}

export const POST: APIRoute = async (ctx) => {
  if (!ctx.locals.admin) {
    return new Response("Unauthorized", { status: 401 });
  }

  const form = await ctx.request.formData();
  const current = String(form.get("current_password") ?? "");
  const next = String(form.get("new_password") ?? "");
  const confirm = String(form.get("confirm_password") ?? "");
  const redirectTo = safeRedirect(form.get("redirect"), "/admin");
  // 只信任 Cloudflare 注入的 CF-Connecting-IP,不採用可偽造的 X-Forwarded-For
  const ip = ctx.request.headers.get("CF-Connecting-IP") ?? "unknown";
  const kv = env?.SESSION;

  // 1. Rate limit
  const rl = await limiter.check(kv, ip);
  if (!rl.allowed) {
    return new Response(`Too many attempts. Try again in ${rl.retryAfter}s.`, {
      status: 429,
      headers: { "Retry-After": String(rl.retryAfter) },
    });
  }

  // 2. 驗證(順序:空 → 長度 → 跟舊的一樣 → 一致性 → current 正確)
  if (!current || !next || !confirm) {
    await limiter.recordFailure(kv, ip);
    return ctx.redirect(`${redirectTo}?pw_error=empty`, 303);
  }
  if (next.length < MIN_LEN || next.length > MAX_LEN) {
    await limiter.recordFailure(kv, ip);
    return ctx.redirect(`${redirectTo}?pw_error=too_short`, 303);
  }
  if (next === current) {
    await limiter.recordFailure(kv, ip);
    return ctx.redirect(`${redirectTo}?pw_error=same_as_current`, 303);
  }
  if (next !== confirm) {
    await limiter.recordFailure(kv, ip);
    return ctx.redirect(`${redirectTo}?pw_error=mismatch`, 303);
  }

  // 3. re-verify current password(防 stolen-cookie 改密碼)
  const db = getDB();
  const row = await db
    .prepare("SELECT email, password_hash FROM admin_users WHERE email = ?")
    .bind(ctx.locals.admin.email)
    .first<AdminRow>();
  if (!row) {
    // email 不存在(理論上不可能 — middleware 已確認 admin session)
    await limiter.recordFailure(kv, ip);
    return new Response("Server error", { status: 500 });
  }
  const ok = await verifyPassword(current, row.password_hash);
  if (!ok) {
    await limiter.recordFailure(kv, ip);
    console.warn(
      `[admin change-password] wrong current email=${ctx.locals.admin.email} ip=${ip}`,
    );
    return ctx.redirect(`${redirectTo}?pw_error=wrong_current`, 303);
  }

  // 4. 寫新密碼 + audit
  const newHash = await hashPassword(next);
  const now = Math.floor(Date.now() / 1000);
  await db
    .prepare(
      "UPDATE admin_users SET password_hash = ?, password_changed_at = ?, password_changed_ip = ? WHERE email = ?",
    )
    .bind(newHash, now, ip, ctx.locals.admin.email)
    .run();

  await limiter.clear(kv, ip);
  console.log(
    `[admin change-password] success email=${ctx.locals.admin.email} ip=${ip} at=${now}`,
  );

  return ctx.redirect(`${redirectTo}?password_changed=1`, 303);
};
