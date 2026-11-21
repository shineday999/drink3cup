-- cnamber-store admin_users: 密碼異動 audit 欄位
-- 2026-10-05: 配合 /api/admin/change-password 上線
-- 兩個欄位 nullable,舊 admin 帳號不補,first change 時自動寫入

ALTER TABLE admin_users ADD COLUMN password_changed_at INTEGER;
ALTER TABLE admin_users ADD COLUMN password_changed_ip TEXT;
