-- cnamber-store seed data — Phase 5 demo products
-- 用法:wrangler d1 execute DB --local --file=./scripts/seed.sql
--       wrangler d1 execute DB --remote --file=./scripts/seed.sql(上線後)

-- 預先計算的時間戳(reproducible seed)
-- 共 7 個產品:4 飾品 + 3 香品

-- ============================================================
-- 飾品
-- ============================================================

INSERT INTO products (id, category, subcategory, slug, status, created_at, updated_at) VALUES
  ('prod_pendant_baltic', 'jewelry', 'necklace', 'baltic-amber-pendant', 'active', 1700000000, 1700000000),
  ('prod_bracelet_dom', 'jewelry', 'bracelet', 'dominican-blue-bracelet', 'active', 1700000000, 1700000000),
  ('prod_earring_burmese', 'jewelry', 'earring', 'burmese-amber-earrings', 'active', 1700000000, 1700000000),
  ('prod_ring_fushun', 'jewelry', 'ring', 'fushun-amber-ring', 'active', 1700000000, 1700000000);

-- 飾品 4 語翻譯
INSERT INTO product_translations (product_id, locale, name, description, short_description, story) VALUES
  -- 波羅的海蜜蠟吊墜
  ('prod_pendant_baltic', 'zh-Hans', '波羅的海蜜蠟吊墜', '波羅的海蜜蠟,色澤溫潤通透,搭配手工銀鍊,適合日常佩戴。', '波羅的海蜜蠟吊墜', '波羅的海琥珀含琥珀酸 3-8%,被中世紀歐洲人稱為「北方之金」。'),
  ('prod_pendant_baltic', 'en', 'Baltic Honey Amber Pendant', 'Baltic honey amber, warm and translucent, with hand-set silver chain. Perfect for everyday wear.', 'Baltic honey amber pendant', 'Baltic amber contains 3-8% succinic acid, once called "the gold of the north" by medieval Europeans.'),
  ('prod_pendant_baltic', 'ms-MY', 'Liontin Ambar Madu Baltik', 'Ambar madu Baltik, hangat dan lutsinar, dengan rantai perak buatan tangan. Sesuai untuk pemakaian harian.', 'Liontin ambar Baltik', 'Ambar Baltik mengandungi asid suksinik 3-8%, dahulunya dikenali sebagai "emas utara" oleh orang Eropah Zaman Pertengahan.'),
  ('prod_pendant_baltic', 'id-ID', 'Liontin Amber Madu Baltik', 'Amber madu Baltik, hangat dan tembus cahaya, dengan rantai perak buatan tangan. Cocok untuk pemakaian sehari-hari.', 'Liontin amber Baltik', 'Amber Baltik mengandung asam suksinat 3-8%, dulu disebut "emas utara" oleh orang Eropa Abad Pertengahan.'),
  -- 多米尼加藍珀手串
  ('prod_bracelet_dom', 'zh-Hans', '多米尼加藍珀手串', '多米尼加藍珀,紫外線下透出幽藍螢光,珠徑 8mm,彈性手圍。', '多米尼加藍珀手串', '藍珀產量稀少,被視為琥珀中的珍品。'),
  ('prod_bracelet_dom', 'en', 'Dominican Blue Amber Bracelet', 'Dominican blue amber showing ethereal blue fluorescence under UV. 8mm beads, elastic wrist.', 'Dominican blue amber bracelet', 'Blue amber is extremely scarce and considered a prized variety of amber.'),
  ('prod_bracelet_dom', 'ms-MY', 'Gelang Ambar Biru Dominika', 'Ambar biru Dominika yang menunjukkan pendarfluor biru etereal di bawah UV. Manik 8mm, pergelangan elastik.', 'Gelang ambar biru', 'Ambar biru sangat jarang dan dianggap varieti ambar yang dihargai.'),
  ('prod_bracelet_dom', 'id-ID', 'Gelang Amber Biru Dominika', 'Amber biru Dominika menunjukkan fluoresensi biru yang halus di bawah UV. Butiran 8mm, pergelangan elastis.', 'Gelang amber biru', 'Amber biru sangat langka dan dianggap varietas amber yang berharga.'),
  -- 緬甸琥珀耳環
  ('prod_earring_burmese', 'zh-Hans', '緬甸琥珀耳環', '緬甸胡康河谷琥珀,深紅色澤,925 銀耳勾。', '緬甸琥珀耳環', '緬甸琥珀年代久遠,可追溯至白堊紀中期。'),
  ('prod_earring_burmese', 'en', 'Burmese Amber Earrings', 'Burmese amber from Hukawng Valley, deep red tone, 925 silver ear hooks.', 'Burmese amber earrings', 'Burmese amber dates back to the mid-Cretaceous period.'),
  ('prod_earring_burmese', 'ms-MY', 'Anting-anting Ambar Burma', 'Ambar Burma dari Lembah Hukawng, warna merah gelap, cangkuk telinga perak 925.', 'Anting ambar Burma', 'Ambar Burma berasal dari tempoh Kapur pertengahan.'),
  ('prod_earring_burmese', 'id-ID', 'Anting Amber Myanmar', 'Amber Myanmar dari Lembah Hukawng, warna merah tua, kait telinga perak 925.', 'Anting amber Myanmar', 'Amber Myanmar berasal dari periode Kapur tengah.'),
  -- 撫順琥珀戒指
  ('prod_ring_fushun', 'zh-Hans', '撫順琥珀戒指', '中國遼寧撫順琥珀,色澤深沉,925 銀戒托,可調整戒圍。', '撫順琥珀戒指', '撫順琥珀資源已近枯竭,具收藏價值。'),
  ('prod_ring_fushun', 'en', 'Fushun Amber Ring', 'Amber from Liaoning Fushun, China, with deep color tone. 925 silver adjustable band.', 'Fushun amber ring', 'Fushun amber is increasingly rare and has collectible value.'),
  ('prod_ring_fushun', 'ms-MY', 'Cincin Ambar Fushun', 'Ambar dari Liaoning Fushun, China, dengan warna gelap. Jalur perak 925 boleh laras.', 'Cincin ambar Fushun', 'Ambar Fushun semakin jarang dan mempunyai nilai koleksi.'),
  ('prod_ring_fushun', 'id-ID', 'Cincin Amber Fushun', 'Amber dari Liaoning Fushun, Tiongkok, dengan warna gelap. Band perak 925 yang bisa disesuaikan.', 'Cincin amber Fushun', 'Amber Fushun semakin langka dan memiliki nilai koleksi.');

-- ============================================================
-- 香品
-- ============================================================

INSERT INTO products (id, category, subcategory, slug, status, created_at, updated_at) VALUES
  ('prod_incense_yunnan', 'incense', 'stick', 'yunnan-agarwood-sticks', 'active', 1700000000, 1700000000),
  ('prod_balm_sandalwood', 'incense', 'balm', 'sandalwood-balm', 'active', 1700000000, 1700000000),
  ('prod_oil_hinoki', 'incense', 'oil', 'hinoki-cypress-oil', 'active', 1700000000, 1700000000);

-- 香品 4 語翻譯
INSERT INTO product_translations (product_id, locale, name, description, short_description, story) VALUES
  -- 雲南沉香線香
  ('prod_incense_yunnan', 'zh-Hans', '雲南沉香線香', '雲南產區沉香,約 30 分鐘燃燒,煙氣細膩通透,適合冥想、讀書。', '雲南沉香線香(30 分裝)', '雲南沉香被譽為「植物中的鑽石」,需樹齡 30 年以上才可能結香。'),
  ('prod_incense_yunnan', 'en', 'Yunnan Agarwood Sticks', 'Agarwood from Yunnan, ~30 minute burn. Smoke is delicate and translucent. Suited for meditation and reading.', 'Yunnan agarwood sticks (30-min)', 'Yunnan agarwood is called "the diamond of plants" — only trees over 30 years old can produce resin.'),
  ('prod_incense_yunnan', 'ms-MY', 'Batang Kemenyan Yunnan', 'Kemenyan dari Yunnan, pembakaran ~30 minit. Asap halus dan lutsinar. Sesuai untuk meditasi dan membaca.', 'Batang kemenyan Yunnan (30-min)', 'Kemenyan Yunnan digelar "berlian tumbuhan" — hanya pokok lebih 30 tahun boleh menghasilkan resin.'),
  ('prod_incense_yunnan', 'id-ID', 'Batang Dupa Gaharu Yunnan', 'Gaharu dari Yunnan, pembakaran ~30 menit. Asapnya halus dan tembus cahaya. Cocok untuk meditasi dan membaca.', 'Batang dupa Yunnan (30-menit)', 'Gaharu Yunnan disebut "berlian dari tanaman" — hanya pohon berusia lebih dari 30 tahun yang bisa menghasilkan resin.'),
  -- 檀香香膏
  ('prod_balm_sandalwood', 'zh-Hans', '檀香香膏', '印度邁索爾老山檀香精油與蜂蠟調製,隨身攜帶,塗於脈搏處。', '檀香香膏', '邁索爾老山檀香被譽為「檀香之王」,需 30 年以上樹齡。'),
  ('prod_balm_sandalwood', 'en', 'Sandalwood Balm', 'Mysore aged sandalwood essential oil blended with beeswax. Portable, apply on pulse points.', 'Sandalwood balm', 'Mysore aged sandalwood is called "the king of sandalwood" — trees must be over 30 years old.'),
  ('prod_balm_sandalwood', 'ms-MY', 'Balsem Kayu Cendana', 'Minyak pati kayu cendana tua Mysore dicampur dengan lilin lebah. Mudah alih, sapukan pada titik nadi.', 'Balsem cendana', 'Kayu cendana tua Mysore digelar "raja kayu cendana" — pokok mesti melebihi 30 tahun.'),
  ('prod_balm_sandalwood', 'id-ID', 'Balsem Cendana', 'Minyak esensial cendana tua Mysore dicampur dengan lilin lebah. Portabel, oleskan pada titik nadi.', 'Balsem cendana', 'Cendana tua Mysore disebut "raja cendana" — pohon harus berusia lebih dari 30 tahun.'),
  -- 檜木精油
  ('prod_oil_hinoki', 'zh-Hans', '檜木精油', '台灣檜木精油,清涼通透,適合擴香、泡澡、空間淨化。', '檜木精油(10ml)', '台灣檜木因禁伐政策已停產,此批為合法庫存。'),
  ('prod_oil_hinoki', 'en', 'Hinoki Cypress Oil', 'Taiwan hinoki cypress essential oil, cool and translucent. Use in diffuser, bath, or for space clearing.', 'Hinoki cypress oil (10ml)', 'Taiwan hinoki cypress is no longer harvested due to logging bans — this batch is from legal inventory.'),
  ('prod_oil_hinoki', 'ms-MY', 'Minyak Cypress Hinoki', 'Minyak pati cypress Hinoki Taiwan, sejuk dan lutsinar. Gunakan dalam penyebar, mandi, atau untuk pembersihan ruang.', 'Minyak hinoki (10ml)', 'Cypress Hinoki Taiwan tidak lagi dituai disebabkan larangan pembalakan — kumpulan ini daripada inventori sah.'),
  ('prod_oil_hinoki', 'id-ID', 'Minyak Cypress Hinoki', 'Minyak esensial hinoki Taiwan, sejuk dan tembus cahaya. Gunakan dalam diffuser, mandi, atau pembersihan ruang.', 'Minyak hinoki (10ml)', 'Hinoki Taiwan tidak lagi dipanen karena larangan penebangan — batch ini dari inventaris legal.');

-- ============================================================
-- Variants(每產品 1-2 個)
-- ============================================================

INSERT INTO product_variants (id, product_id, sku, attributes, stock, weight_grams, price_base, image_urls) VALUES
  ('var_pendant_baltic_s', 'prod_pendant_baltic', 'BAL-PEN-S', '{"size":"small"}', 8, 5, '85.00', '[]'),
  ('var_pendant_baltic_m', 'prod_pendant_baltic', 'BAL-PEN-M', '{"size":"medium"}', 5, 7, '120.00', '[]'),
  ('var_bracelet_dom_std', 'prod_bracelet_dom', 'DOM-BRA-STD', '{"size":"standard"}', 3, 25, '380.00', '[]'),
  ('var_earring_burmese_std', 'prod_earring_burmese', 'BUR-EAR-STD', '{"size":"standard"}', 6, 8, '160.00', '[]'),
  ('var_ring_fushun_55', 'prod_ring_fushun', 'FUS-RIN-55', '{"ring_size":"55"}', 2, 6, '220.00', '[]'),
  ('var_ring_fushun_60', 'prod_ring_fushun', 'FUS-RIN-60', '{"ring_size":"60"}', 2, 6, '220.00', '[]'),
  ('var_incense_yunnan_box', 'prod_incense_yunnan', 'YUN-INC-BOX', '{"pack":"30 sticks"}', 12, 50, '180.00', '[]'),
  ('var_balm_sandalwood_5g', 'prod_balm_sandalwood', 'SAN-BAL-5G', '{"size":"5g"}', 15, 15, '95.00', '[]'),
  ('var_oil_hinoki_10ml', 'prod_oil_hinoki', 'HIN-OIL-10ML', '{"size":"10ml"}', 7, 35, '240.00', '[]');

-- ============================================================
-- 多幣別定價(USD base + USD/MYR/SGD/IDR/AED/SAR)
-- ============================================================

INSERT INTO product_prices (variant_id, currency, amount, tax_included) VALUES
  -- 波羅的海吊墜 85 USD
  ('var_pendant_baltic_s', 'USD', 8500, 1),
  ('var_pendant_baltic_s', 'MYR', 39500, 1),
  ('var_pendant_baltic_s', 'IDR', 134000000, 1),
  ('var_pendant_baltic_s', 'AED', 31200, 1),
  ('var_pendant_baltic_s', 'SAR', 31900, 1),
  ('var_pendant_baltic_m', 'USD', 12000, 1),
  ('var_pendant_baltic_m', 'MYR', 55800, 1),
  ('var_pendant_baltic_m', 'IDR', 190000000, 1),
  ('var_pendant_baltic_m', 'AED', 44100, 1),
  ('var_pendant_baltic_m', 'SAR', 45100, 1),
  -- 多米尼加藍珀手串 380 USD
  ('var_bracelet_dom_std', 'USD', 38000, 1),
  ('var_bracelet_dom_std', 'MYR', 176700, 1),
  ('var_bracelet_dom_std', 'IDR', 600000000, 1),
  ('var_bracelet_dom_std', 'AED', 139700, 1),
  ('var_bracelet_dom_std', 'SAR', 142600, 1),
  -- 緬甸琥珀耳環 160 USD
  ('var_earring_burmese_std', 'USD', 16000, 1),
  ('var_earring_burmese_std', 'MYR', 74400, 1),
  ('var_earring_burmese_std', 'IDR', 253000000, 1),
  ('var_earring_burmese_std', 'AED', 58800, 1),
  ('var_earring_burmese_std', 'SAR', 60100, 1),
  -- 撫順琥珀戒指 220 USD
  ('var_ring_fushun_55', 'USD', 22000, 1),
  ('var_ring_fushun_55', 'MYR', 102300, 1),
  ('var_ring_fushun_55', 'IDR', 348000000, 1),
  ('var_ring_fushun_55', 'AED', 80900, 1),
  ('var_ring_fushun_55', 'SAR', 82600, 1),
  ('var_ring_fushun_60', 'USD', 22000, 1),
  ('var_ring_fushun_60', 'MYR', 102300, 1),
  ('var_ring_fushun_60', 'IDR', 348000000, 1),
  ('var_ring_fushun_60', 'AED', 80900, 1),
  ('var_ring_fushun_60', 'SAR', 82600, 1),
  -- 雲南沉香線香 180 USD
  ('var_incense_yunnan_box', 'USD', 18000, 1),
  ('var_incense_yunnan_box', 'MYR', 83700, 1),
  ('var_incense_yunnan_box', 'IDR', 285000000, 1),
  ('var_incense_yunnan_box', 'AED', 66100, 1),
  ('var_incense_yunnan_box', 'SAR', 67600, 1),
  -- 檀香香膏 95 USD
  ('var_balm_sandalwood_5g', 'USD', 9500, 1),
  ('var_balm_sandalwood_5g', 'MYR', 44100, 1),
  ('var_balm_sandalwood_5g', 'IDR', 150000000, 1),
  ('var_balm_sandalwood_5g', 'AED', 34900, 1),
  ('var_balm_sandalwood_5g', 'SAR', 35700, 1),
  -- 檜木精油 240 USD
  ('var_oil_hinoki_10ml', 'USD', 24000, 1),
  ('var_oil_hinoki_10ml', 'MYR', 111600, 1),
  ('var_oil_hinoki_10ml', 'IDR', 380000000, 1),
  ('var_oil_hinoki_10ml', 'AED', 88200, 1),
  ('var_oil_hinoki_10ml', 'SAR', 90100, 1);

-- ============================================================
-- Quiz rules(Phase 5 簡化版 — tag-based matching)
-- ============================================================

INSERT INTO quiz_rules (id, quiz_type, attributes, product_ids, weights) VALUES
  ('quiz_jewelry_oval_cool_calm', 'jewelry', '{"face_shape":"oval","skin_tone":"cool","personality":"calm"}',
   '["prod_pendant_baltic","prod_earring_burmese"]', '{"prod_pendant_baltic":5,"prod_earring_burmese":3}'),
  ('quiz_jewelry_round_warm_fresh', 'jewelry', '{"face_shape":"round","skin_tone":"warm","personality":"fresh"}',
   '["prod_bracelet_dom","prod_ring_fushun"]', '{"prod_bracelet_dom":4,"prod_ring_fushun":3}'),
  ('quiz_incense_anxiety_relax', 'incense', '{"concerns":["anxiety"],"goals":["relax","sleep"]}',
   '["prod_incense_yunnan","prod_oil_hinoki"]', '{"prod_incense_yunnan":5,"prod_oil_hinoki":4}'),
  ('quiz_incense_focus_meditate', 'incense', '{"concerns":["focus"],"goals":["meditate","focus"]}',
   '["prod_incense_yunnan","prod_balm_sandalwood"]', '{"prod_incense_yunnan":4,"prod_balm_sandalwood":3}');

-- ============================================================
-- 一個 sample inquiry(讓後台 inquiries 頁有資料可看)
-- ============================================================

INSERT INTO inquiries (id, name, email, phone, subject, message, locale, status, created_at) VALUES
  ('inq_demo_001', '示範客戶', 'demo@example.com', '+60123456789', '詢問運費', '請問運到馬來西亞大約多少運費?謝謝!', 'zh-Hans', 'new', 1700000000);