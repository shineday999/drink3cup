import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { setSessionCookie, verifyPassword } from "../../../lib/auth";

// 登入限流：同 IP 15 分鐘內失敗 5 次即鎖定 15 分鐘。
// 計數存在 KV（SESSION），跨 Worker 實例、重新部署都有效。
// KV 為最終一致，極短時間內的並發請求可能少算幾次，足以擋住暴力破解。
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;
const LOCKOUT_MS = 15 * 60 * 1000;
const KV_TTL_SECONDS = Math.ceil(Math.max(WINDOW_MS, LOCKOUT_MS) / 1000);

interface AttemptRecord {
  count: number;
  firstAt: number;
  lockedUntil: number;
}

const attemptKey = (ip: string) => `login-rl:${ip}`;

async function readAttempts(
  kv: KVNamespace,
  ip: string,
): Promise<AttemptRecord | null> {
  try {
    return await kv.get<AttemptRecord>(attemptKey(ip), "json");
  } catch (err) {
    console.warn("[admin login] rate-limit read failed", err);
    return null;
  }
}

async function checkRateLimit(
  kv: KVNamespace | undefined,
  ip: string,
): Promise<{ allowed: boolean; retryAfter?: number }> {
  if (!kv) return { allowed: true };
  const rec = await readAttempts(kv, ip);
  if (rec && rec.lockedUntil > Date.now()) {
    return {
      allowed: false,
      retryAfter: Math.ceil((rec.lockedUntil - Date.now()) / 1000),
    };
  }
  return { allowed: true };
}

async function recordFailure(
  kv: KVNamespace | undefined,
  ip: string,
): Promise<void> {
  if (!kv) return;
  const now = Date.now();
  const prev = await readAttempts(kv, ip);
  const rec: AttemptRecord =
    !prev || now - prev.firstAt > WINDOW_MS
      ? { count: 1, firstAt: now, lockedUntil: 0 }
      : { ...prev, count: prev.count + 1 };
  if (rec.count >= MAX_ATTEMPTS) rec.lockedUntil = now + LOCKOUT_MS;
  try {
    await kv.put(attemptKey(ip), JSON.stringify(rec), {
      expirationTtl: KV_TTL_SECONDS,
    });
  } catch (err) {
    console.warn("[admin login] rate-limit write failed", err);
  }
}

async function clearAttempts(
  kv: KVNamespace | undefined,
  ip: string,
): Promise<void> {
  if (!kv) return;
  try {
    await kv.delete(attemptKey(ip));
  } catch (err) {
    console.warn("[admin login] rate-limit clear failed", err);
  }
}

interface AdminRow {
  email: string;
  role: string;
  password_hash: string | null;
}

// F-04: empty input guard
// F-07: 不洩漏 email 是否存在(無論 email 找不到或密碼錯都回相同 "invalid")
export const POST: APIRoute = async (ctx) => {
  const form = await ctx.request.formData();
  const email = String(form.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(form.get("password") ?? "");
  // 只信任 Cloudflare 注入的 CF-Connecting-IP，不採用可偽造的 X-Forwarded-For
  const ip = ctx.request.headers.get("CF-Connecting-IP") ?? "unknown";
  const kv = env?.SESSION;
  const rl = await checkRateLimit(kv, ip);
  if (!rl.allowed) {
    return new Response(`Too many attempts. Try again in ${rl.retryAfter}s.`, {
      status: 429,
      headers: { "Retry-After": String(rl.retryAfter) },
    });
  }
  const redirectTo = String(form.get("redirect") ?? "/admin");

  if (!email || !password) {
    return ctx.redirect("/admin/login?error=empty", 303);
  }
  const db = env?.DB;
  if (!db) {
    return ctx.redirect("/admin/login?error=server", 303);
  }

  const row = await db
    .prepare(
      "SELECT email, role, password_hash FROM admin_users WHERE email = ?",
    )
    .bind(email)
    .first<AdminRow>();

  const ok = row ? await verifyPassword(password, row.password_hash) : false;
  if (!ok || !row) {
    // F-08: log failed attempt (含 IP + email,不含密碼)
    const clientIp = ctx.request.headers.get("cf-connecting-ip") ?? "?";
    console.warn(`[admin login] failed email=${email} ip=${clientIp}`);
    await recordFailure(kv, ip);
    return ctx.redirect("/admin/login?error=invalid", 303);
  }

  await setSessionCookie(ctx, row.email);
  await clearAttempts(kv, ip);

  // F-09: 更新 last_login_at / last_login_ip
  const now = Math.floor(Date.now() / 1000);
  await db
    .prepare(
      "UPDATE admin_users SET last_login_at = ?, last_login_ip = ? WHERE email = ?",
    )
    .bind(now, ip, row.email)
    .run();

  // F-10: redirect 路徑檢查(只能相對路徑,不能 // 開頭,不能跳外站)
  const safeRedirect =
    redirectTo.startsWith("/") && !redirectTo.startsWith("//")
      ? redirectTo
      : "/admin";
  return ctx.redirect(safeRedirect, 303);
};
