-- 後台產品重寫 1.1：分類表（products.category 維持文字代碼，不加外鍵）
CREATE TABLE IF NOT EXISTS product_categories (
  code        TEXT PRIMARY KEY,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  names       TEXT NOT NULL DEFAULT '{}',
  created_at  INTEGER NOT NULL DEFAULT (unixepoch())
);

INSERT OR IGNORE INTO product_categories (code, sort_order, names) VALUES
  ('jewelry', 1, '{"zh-Hans":"首饰","en":"Jewelry"}'),
  ('incense', 2, '{"zh-Hans":"香品","en":"Incense"}');
