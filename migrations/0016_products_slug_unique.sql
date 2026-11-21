-- 後台產品重寫 1.4 前置：products.slug 原本沒有唯一限制（schema dump 確認），補上唯一索引
-- 若既有資料有重複 slug 會失敗；目前皆為測試資料，先執行 scripts/reset-products.sql 即可
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_slug_unique ON products (slug);
