-- 清空商品與相關測試資料（全部是測試資料，直接清）
-- 依外鍵順序：子表在前
PRAGMA defer_foreign_keys = on;
DELETE FROM reviews;
DELETE FROM orders;
DELETE FROM product_prices;
DELETE FROM product_variants;
DELETE FROM product_translations;
DELETE FROM products;
