// 後臺認證 — 本地 email+password 登入 + session JWT cookie
// 取代 2026-10-01 之前的 Cloudflare Access 流程(已拔除)
// F-01: bcryptjs verify password against admin_users.password_hash (cost 12)
// F-02: jose HS256 簽 session JWT cookie,12h exp
// F-03: HttpOnly + Secure(prod) + SameSite=Lax cookie
// F-04: SESSION_SECRET 從 Pages env 拿(>= 32 chars),缺則拒絕所有 admin 請求
// F-05: 每次請求以 D1 admin_users.email 重查,移除 admin 後立即失效
// F-06: role 一律為 super_admin(保留欄位相容性)

import type { APIContext } from "astro";
import { env } from "cloudflare:workers";
import { jwtVerify, SignJWT } from "jose";
import bcrypt from "bcryptjs";

export interface AdminSession {
  email: string;
  role: "super_admin";
  displayName: string;
}

const SESSION_COOKIE = "mycafe_admin_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 12; // 12h
const BCRYPT_COST = 12;

interface AdminRow {
  email: string;
  role: string;
  display_name: string | null;
  password_hash: string | null;
}

async function getSessionKey(): Promise<Uint8Array | null> {
  const secret =
    typeof env.SESSION_SECRET === "string" && env.SESSION_SECRET.length >= 32
      ? env.SESSION_SECRET
      : null;
  if (!secret) return null;
  return new TextEncoder().encode(secret);
}

export async function hashPassword(pw: string): Promise<string> {
  return bcrypt.hash(pw, BCRYPT_COST);
}

export async function verifyPassword(
  pw: string,
  hash: string | null,
): Promise<boolean> {
  if (!hash || hash.length === 0) return false;
  return bcrypt.compare(pw, hash);
}

export async function setSessionCookie(
  ctx: APIContext,
  email: string,
): Promise<void> {
  const key = await getSessionKey();
  if (!key) throw new Error("SESSION_SECRET not configured");

  const token = await new SignJWT({ email, role: "super_admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(key);

  ctx.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export function clearSessionCookie(ctx: APIContext): void {
  ctx.cookies.delete(SESSION_COOKIE, { path: "/" });
}

export async function getAdminFromContext(
  ctx: APIContext,
): Promise<AdminSession | null> {
  const key = await getSessionKey();
  if (!key) return null;

  const cookie = ctx.cookies.get(SESSION_COOKIE)?.value;
  if (!cookie) return null;

  let email: string | null = null;
  try {
    const { payload } = await jwtVerify(cookie, key);
    email = typeof payload.email === "string" ? payload.email : null;
  } catch {
    return null;
  }
  if (!email) return null;
  const db = env.DB;
  if (!db) return null;

  // F-05: 重新查 D1 確認 email 仍存在 + 有 password_hash(防止 cookie 還有效但 user 已被拔除)
  const row = await db
    .prepare(
      "SELECT email, role, display_name, password_hash FROM admin_users WHERE email = ?",
    )
    .bind(email)
    .first<AdminRow>();
  if (!row || !row.password_hash) return null;

  return {
    email: row.email,
    role: "super_admin",
    displayName: row.display_name ?? row.email.split("@")[0] ?? row.email,
  };
}

export async function requireAdmin(ctx: APIContext): Promise<AdminSession> {
  const session = await getAdminFromContext(ctx);
  if (!session) {
    throw new Response("Unauthorized", { status: 401 });
  }
  return session;
}
