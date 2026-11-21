-- 後台產品重寫 1.2：同一變體同一幣別只能有一筆價格；補查詢索引
DELETE FROM product_prices
 WHERE rowid NOT IN (
   SELECT MIN(rowid) FROM product_prices GROUP BY variant_id, currency
 );

CREATE UNIQUE INDEX IF NOT EXISTS idx_product_prices_variant_currency
  ON product_prices (variant_id, currency);
CREATE INDEX IF NOT EXISTS idx_product_variants_product
  ON product_variants (product_id);
CREATE INDEX IF NOT EXISTS idx_products_status_category
  ON products (status, category);
