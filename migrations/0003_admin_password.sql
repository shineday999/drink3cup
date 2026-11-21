-- mycafe admin_users: add local password + login audit columns
-- 2026-10-01: Phase 5 OTP / local email+password login replaces Cloudflare Access dependency
-- last_login_at already exists in 0001_initial.sql

ALTER TABLE admin_users ADD COLUMN password_hash TEXT NOT NULL DEFAULT '';
ALTER TABLE admin_users ADD COLUMN last_login_ip TEXT;