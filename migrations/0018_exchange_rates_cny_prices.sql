-- 價格改以人民幣（CNY）記錄 + 匯率表
--
-- 1) exchange_rates：基準幣別是人民幣，per_cny = 「1 人民幣可換多少該貨幣」。
--    由後台「汇率」頁維護；前台各語言依它換算顯示價格（src/lib/format.ts、src/lib/rates.ts）。
-- 2) 把現有商品的美元價格換成人民幣價格（依舊匯率 7.2，四捨五入到整數元，單位：分）。
--    美元列先保留，確認前後台都正常後，再用後續遷移清掉。

CREATE TABLE IF NOT EXISTS exchange_rates (
  currency   TEXT PRIMARY KEY,
  per_cny    REAL NOT NULL CHECK (per_cny > 0),
  updated_at INTEGER NOT NULL
);

-- 預設值由舊的美元基準表換算而來（USD=1 / CNY=7.2 / MYR=4.6 / IDR=15700 / AED=3.67 / SAR=3.75 / TWD=32）
INSERT OR IGNORE INTO exchange_rates (currency, per_cny, updated_at) VALUES
  ('CNY', 1,        CAST(strftime('%s', 'now') AS INTEGER)),
  ('USD', 0.138889, CAST(strftime('%s', 'now') AS INTEGER)),
  ('MYR', 0.638889, CAST(strftime('%s', 'now') AS INTEGER)),
  ('IDR', 2180.56,  CAST(strftime('%s', 'now') AS INTEGER)),
  ('AED', 0.509722, CAST(strftime('%s', 'now') AS INTEGER)),
  ('SAR', 0.520833, CAST(strftime('%s', 'now') AS INTEGER)),
  ('TWD', 4.444444, CAST(strftime('%s', 'now') AS INTEGER));

-- 沒有人民幣價格的規格：由美元價格換算出一筆（已經有人民幣價格的不動）
INSERT INTO product_prices (variant_id, currency, amount, tax_included)
SELECT p.variant_id, 'CNY', CAST(ROUND(p.amount * 7.2 / 100.0) AS INTEGER) * 100, p.tax_included
  FROM product_prices p
 WHERE p.currency = 'USD'
   AND NOT EXISTS (
     SELECT 1 FROM product_prices c
      WHERE c.variant_id = p.variant_id AND c.currency = 'CNY'
   );

-- price_base（等 6.5 移除前仍是 NOT NULL 欄位）同步成人民幣「元」字串
UPDATE product_variants
   SET price_base = printf('%.2f', (
     SELECT c.amount FROM product_prices c
      WHERE c.variant_id = product_variants.id AND c.currency = 'CNY'
   ) / 100.0)
 WHERE EXISTS (
   SELECT 1 FROM product_prices c
    WHERE c.variant_id = product_variants.id AND c.currency = 'CNY'
 );
