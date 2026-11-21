-- 示範商品（新結構）：2 個商品、各 2 個變體、4 種語言、3 種幣別（金額為最小單位）
-- 假設 created_at / updated_at 為 Unix 秒
INSERT INTO products (id, category, subcategory, slug, status, created_at, updated_at, image_url, tags, faq) VALUES
  ('prod_demo_pendant', 'jewelry', 'pendant', 'fushun-amber-pendant', 'active',
   CAST(strftime('%s','now') AS INTEGER), CAST(strftime('%s','now') AS INTEGER), NULL, 'calm,classic,gift', '{}'),
  ('prod_demo_incense', 'incense', 'stick', 'calm-sleep-incense-stick', 'active',
   CAST(strftime('%s','now') AS INTEGER), CAST(strftime('%s','now') AS INTEGER), NULL, 'anxiety,calm,relax,sleep,stick,woody,evening,bedtime', '{}');

INSERT INTO product_translations (product_id, locale, name, description, short_description, story, meta_title, meta_description) VALUES
  ('prod_demo_pendant', 'zh-Hant', '抚顺琥珀吊坠', '以抚顺琥珀手工打磨的吊坠，温润通透。', '手工打磨琥珀吊坠', NULL, NULL, NULL),
  ('prod_demo_pendant', 'en',      'Fushun Amber Pendant', 'A hand-polished pendant made from Fushun amber, warm and translucent.', 'Hand-polished amber pendant', NULL, NULL, NULL),
  ('prod_demo_pendant', 'ms-MY',   'Loket Ambar Fushun', 'Loket ambar Fushun yang digilap dengan tangan.', 'Loket ambar digilap tangan', NULL, NULL, NULL),
  ('prod_demo_pendant', 'id-ID',   'Liontin Amber Fushun', 'Liontin amber Fushun yang dipoles dengan tangan.', 'Liontin amber poles tangan', NULL, NULL, NULL),
  ('prod_demo_incense', 'zh-Hant', '安神助眠线香', '以木质与树脂香调调配的线香，适合睡前使用。', '睡前线香', NULL, NULL, NULL),
  ('prod_demo_incense', 'en',      'Calm & Sleep Incense Sticks', 'Incense sticks blending woody and resin notes, ideal before bedtime.', 'Bedtime incense sticks', NULL, NULL, NULL),
  ('prod_demo_incense', 'ms-MY',   'Colok Wangian Tenang & Tidur', 'Colok wangian dengan nota kayu dan resin, sesuai sebelum tidur.', 'Colok wangian waktu tidur', NULL, NULL, NULL),
  ('prod_demo_incense', 'id-ID',   'Dupa Batang Tenang & Tidur', 'Dupa batang beraroma kayu dan resin, cocok sebelum tidur.', 'Dupa batang sebelum tidur', NULL, NULL, NULL);

INSERT INTO product_variants (id, product_id, sku, attributes, stock, weight_grams, price_base, image_urls) VALUES
  ('var_demo_pendant_s', 'prod_demo_pendant', 'AMB-PEND-S', '{"size":"S"}', 10, 8,  '128.00', '[]'),
  ('var_demo_pendant_m', 'prod_demo_pendant', 'AMB-PEND-M', '{"size":"M"}', 6,  12, '188.00', '[]'),
  ('var_demo_incense_20', 'prod_demo_incense', 'INC-STK-20', '{"count":"20"}', 50, 40, '18.00', '[]'),
  ('var_demo_incense_40', 'prod_demo_incense', 'INC-STK-40', '{"count":"40"}', 40, 80, '32.00', '[]');

INSERT INTO product_prices (variant_id, currency, amount, tax_included) VALUES
  ('var_demo_pendant_s',  'USD', 12800, 0), ('var_demo_pendant_s',  'CNY', 92000, 0), ('var_demo_pendant_s',  'MYR', 59000, 0),
  ('var_demo_pendant_m',  'USD', 18800, 0), ('var_demo_pendant_m',  'CNY', 135000, 0), ('var_demo_pendant_m', 'MYR', 86500, 0),
  ('var_demo_incense_20', 'USD', 1800,  0), ('var_demo_incense_20', 'CNY', 13000, 0), ('var_demo_incense_20', 'MYR', 8300, 0),
  ('var_demo_incense_40', 'USD', 3200,  0), ('var_demo_incense_40', 'CNY', 23000, 0), ('var_demo_incense_40', 'MYR', 14800, 0);
