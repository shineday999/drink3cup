-- mycafe 咖啡種子資料(示範內容,可於後台修改)
-- 分類代碼沿用現有路由:jewelry = 咖啡豆、incense = 沖煮器具(S06 再改名為 beans / brewing)

-- ===== 清除舊資料 =====
DELETE FROM reviews;
DELETE FROM product_categories;
DELETE FROM product_prices;
DELETE FROM product_variants;
DELETE FROM product_translations;
DELETE FROM products;
DELETE FROM post_translations;
DELETE FROM posts;

-- ===== 商品 =====
INSERT INTO products (id, category, subcategory, slug, status, created_at, updated_at) VALUES
  ('prod_eth_yirgacheffe', 'jewelry', 'single-origin', 'ethiopia-yirgacheffe-washed', 'active', strftime('%s','now'), strftime('%s','now')),
  ('prod_col_huila',       'jewelry', 'single-origin', 'colombia-huila-washed',        'active', strftime('%s','now'), strftime('%s','now')),
  ('prod_tw_alishan',      'jewelry', 'single-origin', 'taiwan-alishan-light-roast',   'active', strftime('%s','now'), strftime('%s','now')),
  ('prod_blend_house',     'jewelry', 'blend',         'three-cups-house-blend',       'active', strftime('%s','now'), strftime('%s','now')),
  ('prod_v60',             'incense', 'dripper',       'v60-pour-over-dripper-02',     'active', strftime('%s','now'), strftime('%s','now')),
  ('prod_kettle',          'incense', 'kettle',        'gooseneck-kettle-600ml',       'active', strftime('%s','now'), strftime('%s','now')),
  ('prod_grinder',         'incense', 'grinder',       'manual-coffee-grinder',        'active', strftime('%s','now'), strftime('%s','now'));

INSERT INTO product_translations (product_id, locale, name, description, short_description, story) VALUES
  ('prod_eth_yirgacheffe', 'zh-Hant', '衣索比亞 耶加雪菲 水洗 G1', '來自耶加雪菲的水洗處理豆,花香與柑橘酸質明亮,尾韻乾淨帶茶感。建議手沖,水溫 90–92°C。', '花香柑橘、乾淨明亮的水洗豆', '耶加雪菲位於衣索比亞南部高海拔產區,被視為咖啡的故鄉之一。'),
  ('prod_eth_yirgacheffe', 'en', 'Ethiopia Yirgacheffe Washed G1', 'Washed-process beans from Yirgacheffe with bright floral and citrus notes and a clean, tea-like finish. Best brewed as pour-over at 90-92C.', 'Floral, citrusy and clean washed coffee', 'Yirgacheffe sits at high altitude in southern Ethiopia, widely regarded as a birthplace of coffee.'),
  ('prod_eth_yirgacheffe', 'ms-MY', 'Ethiopia Yirgacheffe Basuh G1', 'Biji proses basuh dari Yirgacheffe dengan nota bunga dan sitrus yang cerah serta penghujung bersih seperti teh. Sesuai diseduh secara tuang pada suhu 90-92C.', 'Kopi basuh berbunga, sitrus dan bersih', 'Yirgacheffe terletak di tanah tinggi selatan Ethiopia dan dianggap salah satu tempat kelahiran kopi.'),
  ('prod_eth_yirgacheffe', 'id-ID', 'Ethiopia Yirgacheffe Washed G1', 'Biji proses basah dari Yirgacheffe dengan aroma bunga dan sitrus yang cerah serta akhir rasa bersih seperti teh. Cocok diseduh manual pada suhu 90-92C.', 'Kopi washed beraroma bunga, sitrus dan bersih', 'Yirgacheffe berada di dataran tinggi Ethiopia selatan dan dianggap sebagai salah satu tempat lahirnya kopi.'),

  ('prod_col_huila', 'zh-Hant', '哥倫比亞 薇拉 水洗', '焦糖與紅蘋果的甜感,中等酸質,口感圓潤平衡,適合每天喝的一款。', '焦糖甜感、圓潤平衡', '薇拉位於哥倫比亞南部安地斯山區,小農莊園遍布,是精品咖啡的主要產區。'),
  ('prod_col_huila', 'en', 'Colombia Huila Washed', 'Sweet caramel and red apple, medium acidity, round and balanced. An easy everyday cup.', 'Caramel sweetness, round and balanced', 'Huila lies in the southern Andes of Colombia, home to many smallholder farms and a key specialty coffee region.'),
  ('prod_col_huila', 'ms-MY', 'Colombia Huila Basuh', 'Kemanisan karamel dan epal merah, keasidan sederhana, bulat dan seimbang. Pilihan mudah untuk minuman harian.', 'Manis karamel, bulat dan seimbang', 'Huila terletak di Andes selatan Colombia, rumah kepada banyak ladang pekebun kecil dan kawasan utama kopi istimewa.'),
  ('prod_col_huila', 'id-ID', 'Colombia Huila Washed', 'Manis karamel dan apel merah, keasaman sedang, bulat dan seimbang. Pilihan mudah untuk dinikmati setiap hari.', 'Manis karamel, bulat dan seimbang', 'Huila terletak di Andes selatan Kolombia, rumah bagi banyak kebun petani kecil dan wilayah utama kopi spesialti.'),

  ('prod_tw_alishan', 'zh-Hant', '台灣 阿里山 淺焙', '產自嘉義阿里山海拔 1,200 公尺以上,茶香、蜂蜜與柑橘的甜感,酸質柔和。', '茶香蜂蜜、柔和酸質的台灣豆', '阿里山的雲霧與日夜溫差,讓咖啡櫻桃緩慢成熟,風味細緻。'),
  ('prod_tw_alishan', 'en', 'Taiwan Alishan Light Roast', 'Grown above 1,200 m in Alishan, Chiayi, with tea-like aroma, honey and citrus sweetness and a gentle acidity.', 'Tea-like, honeyed Taiwan coffee with soft acidity', 'Alishan mist and big day-night temperature swings let the cherries ripen slowly for a delicate flavour.'),
  ('prod_tw_alishan', 'ms-MY', 'Taiwan Alishan Panggang Ringan', 'Ditanam pada ketinggian lebih 1,200 m di Alishan, Chiayi, dengan aroma seperti teh, kemanisan madu dan sitrus serta keasidan lembut.', 'Kopi Taiwan beraroma teh dan madu, keasidan lembut', 'Kabus Alishan dan perbezaan suhu siang malam yang besar membolehkan ceri masak perlahan untuk rasa yang halus.'),
  ('prod_tw_alishan', 'id-ID', 'Taiwan Alishan Light Roast', 'Ditanam di ketinggian di atas 1.200 m di Alishan, Chiayi, beraroma teh, manis madu dan sitrus dengan keasaman lembut.', 'Kopi Taiwan beraroma teh dan madu, keasaman lembut', 'Kabut Alishan dan perbedaan suhu siang-malam yang besar membuat buah kopi matang perlahan sehingga rasanya halus.'),

  ('prod_blend_house', 'zh-Hant', '喝三杯 招牌配方豆', '中深焙配方,堅果、可可與焦糖,適合義式與牛奶咖啡,醇厚不苦澀。', '堅果可可、適合拿鐵的配方豆', '「喝三杯」的起點:一杯醒腦、一杯陪伴、一杯放鬆。'),
  ('prod_blend_house', 'en', 'Three Cups House Blend', 'Medium-dark roast with nuts, cocoa and caramel. Great for espresso and milk drinks, full-bodied without bitterness.', 'Nutty, cocoa house blend for lattes', 'Where Three Cups began: one to wake up, one for company, one to unwind.'),
  ('prod_blend_house', 'ms-MY', 'Adunan Rumah Tiga Cawan', 'Panggang sederhana gelap dengan kacang, koko dan karamel. Sesuai untuk espresso dan minuman bersusu, pekat tanpa rasa pahit.', 'Adunan rumah berkacang dan koko untuk latte', 'Permulaan Tiga Cawan: satu untuk bangun, satu untuk berteman, satu untuk berehat.'),
  ('prod_blend_house', 'id-ID', 'Racikan Rumah Tiga Cangkir', 'Sangrai medium-gelap dengan aroma kacang, kakao dan karamel. Cocok untuk espreso dan minuman susu, pekat tanpa pahit.', 'Racikan rumah beraroma kacang dan kakao untuk latte', 'Awal mula Tiga Cangkir: satu untuk bangun, satu untuk menemani, satu untuk bersantai.'),

  ('prod_v60', 'zh-Hant', 'V60 手沖濾杯 02', '螺旋肋骨與大單孔設計,水流順暢,可透過注水方式調整風味。適合 1–4 杯。', '1–4 杯的經典手沖濾杯', '手沖入門器具,簡單,但每一次注水都能影響風味。'),
  ('prod_v60', 'en', 'V60 Pour-Over Dripper 02', 'Spiral ribs and a large single hole keep the flow smooth and let your pouring technique shape the flavour. Suits 1-4 cups.', 'Classic dripper for 1-4 cups', 'A beginner-friendly brewer: simple, yet every pour changes the cup.'),
  ('prod_v60', 'ms-MY', 'Penitis Tuang V60 02', 'Rusuk lingkar dan satu lubang besar menjadikan aliran lancar dan teknik tuangan anda membentuk rasa. Sesuai untuk 1-4 cawan.', 'Penitis klasik untuk 1-4 cawan', 'Alat mesra pemula: ringkas, namun setiap tuangan mengubah rasa.'),
  ('prod_v60', 'id-ID', 'Dripper V60 02', 'Rusuk spiral dan satu lubang besar membuat aliran lancar sehingga teknik tuang Anda membentuk rasa. Cocok untuk 1-4 cangkir.', 'Dripper klasik untuk 1-4 cangkir', 'Alat seduh ramah pemula: sederhana, tetapi setiap tuangan mengubah rasa.'),

  ('prod_kettle', 'zh-Hant', '細口手沖壺 600ml', '鵝頸細口設計,出水穩定好控制,適合手沖練習與日常使用。', '出水穩定的鵝頸手沖壺', '穩定的水流,是手沖的第一步。'),
  ('prod_kettle', 'en', 'Gooseneck Pour-Over Kettle 600ml', 'Gooseneck spout for a steady, controllable pour. Ideal for practice and daily brewing.', 'Gooseneck kettle with steady flow', 'A steady stream is the first step of pour-over.'),
  ('prod_kettle', 'ms-MY', 'Cerek Leher Angsa 600ml', 'Muncung leher angsa untuk tuangan yang stabil dan terkawal. Sesuai untuk latihan dan seduhan harian.', 'Cerek leher angsa dengan aliran stabil', 'Aliran yang stabil ialah langkah pertama menuang kopi.'),
  ('prod_kettle', 'id-ID', 'Ketel Leher Angsa 600ml', 'Corong leher angsa untuk tuangan yang stabil dan mudah dikontrol. Cocok untuk latihan dan seduh harian.', 'Ketel leher angsa dengan aliran stabil', 'Aliran air yang stabil adalah langkah pertama menyeduh manual.'),

  ('prod_grinder', 'zh-Hant', '手搖磨豆機', '金屬錐刀,研磨度可調,從義式到手沖都能應付。新鮮現磨,香氣差很多。', '可調研磨度的手搖磨豆機', '現磨,是讓一杯咖啡變好最簡單的方法。'),
  ('prod_grinder', 'en', 'Manual Coffee Grinder', 'Metal burrs with adjustable grind size, from espresso to pour-over. Freshly ground makes a real difference.', 'Manual grinder with adjustable grind size', 'Grinding fresh is the simplest way to a better cup.'),
  ('prod_grinder', 'ms-MY', 'Pengisar Kopi Manual', 'Mata pengisar logam dengan saiz kisaran boleh laras, dari espresso hingga tuang. Kisaran segar membuat perbezaan besar.', 'Pengisar manual dengan saiz kisaran boleh laras', 'Kisar segar ialah cara paling mudah untuk secawan kopi yang lebih baik.'),
  ('prod_grinder', 'id-ID', 'Penggiling Kopi Manual', 'Mata gerinda logam dengan ukuran giling yang dapat diatur, dari espreso hingga seduh manual. Giling segar membuat perbedaan besar.', 'Penggiling manual dengan ukuran giling dapat diatur', 'Menggiling segar adalah cara paling mudah untuk secangkir kopi yang lebih baik.');

-- ===== 規格與價格(新台幣,單位:分)=====
INSERT INTO product_variants (id, product_id, sku, attributes, stock, weight_grams, price_base, image_urls) VALUES
  ('var_eth_200',     'prod_eth_yirgacheffe', 'ETH-YIR-200', '{"weight":"200g"}', 30, 200, '520.00',  '[]'),
  ('var_col_200',     'prod_col_huila',       'COL-HUI-200', '{"weight":"200g"}', 30, 200, '480.00',  '[]'),
  ('var_tw_200',      'prod_tw_alishan',      'TW-ALI-200',  '{"weight":"200g"}', 20, 200, '680.00',  '[]'),
  ('var_blend_200',   'prod_blend_house',     'BLD-HSE-200', '{"weight":"200g"}', 40, 200, '420.00',  '[]'),
  ('var_v60_std',     'prod_v60',             'V60-02-STD',  '{"size":"02"}',     15, 350, '680.00',  '[]'),
  ('var_kettle_600',  'prod_kettle',          'KET-600',     '{"size":"600ml"}',  10, 600, '1280.00', '[]'),
  ('var_grinder_std', 'prod_grinder',         'GRD-MAN-STD', '{"size":"standard"}', 8, 900, '1980.00', '[]');

INSERT INTO product_prices (variant_id, currency, amount, tax_included) VALUES
  ('var_eth_200',     'TWD', 52000,  1),
  ('var_col_200',     'TWD', 48000,  1),
  ('var_tw_200',      'TWD', 68000,  1),
  ('var_blend_200',   'TWD', 42000,  1),
  ('var_v60_std',     'TWD', 68000,  1),
  ('var_kettle_600',  'TWD', 128000, 1),
  ('var_grinder_std', 'TWD', 198000, 1);

-- 其他幣別依後台匯率表(1 TWD = ? 該幣別)換算
INSERT OR REPLACE INTO product_prices (variant_id, currency, amount, tax_included)
SELECT p.variant_id, r.currency, CAST(ROUND(p.amount * r.per_cny) AS INTEGER), 1
  FROM product_prices p
  JOIN exchange_rates r ON r.currency != 'TWD'
 WHERE p.currency = 'TWD';

-- ===== 知識文章 =====
INSERT INTO posts (id, slug, status, category, cover_image_url, author_email, published_at, created_at, updated_at) VALUES
  ('post_ethiopia_origin', 'ethiopia-coffee-origin', 'published', 'material', NULL, 'weider@0061qwen.cc.cd', strftime('%s','now'), strftime('%s','now'), strftime('%s','now')),
  ('post_washed_natural',  'washed-vs-natural',      'published', 'craft',    NULL, 'weider@0061qwen.cc.cd', strftime('%s','now'), strftime('%s','now'), strftime('%s','now')),
  ('post_v60_guide',       'v60-pour-over-guide',    'published', 'craft',    NULL, 'weider@0061qwen.cc.cd', strftime('%s','now'), strftime('%s','now'), strftime('%s','now'));

INSERT INTO post_translations (post_id, locale, title, excerpt, body_markdown) VALUES
  ('post_ethiopia_origin', 'zh-Hant', '衣索比亞:咖啡的故鄉', '從卡法森林到耶加雪菲,認識咖啡最初的產地。',
   '## 咖啡從哪裡來

衣索比亞被廣泛認為是阿拉比卡咖啡的起源地,至今仍保有大量原生品種。

## 耶加雪菲的風味

高海拔搭配水洗處理,帶來花香、柑橘與茶感的明亮風味。

## 怎麼喝

建議用 V60 手沖,水溫 90–92°C,粉水比約 1:15。'),
  ('post_ethiopia_origin', 'en', 'Ethiopia: The Birthplace of Coffee', 'From the Kaffa forests to Yirgacheffe, meet coffee''s original home.',
   '## Where coffee comes from

Ethiopia is widely regarded as the origin of Arabica coffee and still holds a huge diversity of native varieties.

## The Yirgacheffe profile

High altitude and washed processing give bright floral, citrus and tea-like flavours.

## How to brew

Use a V60 at 90-92C with a coffee-to-water ratio of about 1:15.'),
  ('post_ethiopia_origin', 'ms-MY', 'Ethiopia: Tempat Kelahiran Kopi', 'Dari hutan Kaffa ke Yirgacheffe, kenali asal usul kopi.',
   '## Dari mana kopi datang

Ethiopia dianggap sebagai asal kopi Arabika dan masih mempunyai kepelbagaian varieti asli yang besar.

## Profil Yirgacheffe

Altitud tinggi dan proses basuh memberi rasa bunga, sitrus dan seperti teh yang cerah.

## Cara menyeduh

Gunakan V60 pada suhu 90-92C dengan nisbah kopi kepada air sekitar 1:15.'),
  ('post_ethiopia_origin', 'id-ID', 'Ethiopia: Tanah Kelahiran Kopi', 'Dari hutan Kaffa hingga Yirgacheffe, kenali asal mula kopi.',
   '## Dari mana kopi berasal

Ethiopia dianggap sebagai asal kopi Arabika dan masih memiliki keragaman varietas asli yang besar.

## Profil Yirgacheffe

Ketinggian dan proses washed menghasilkan rasa bunga, sitrus dan seperti teh yang cerah.

## Cara menyeduh

Gunakan V60 pada suhu 90-92C dengan rasio kopi dan air sekitar 1:15.'),

  ('post_washed_natural', 'zh-Hant', '水洗 vs 日曬:處理法如何改變風味', '同一顆咖啡豆,處理方式不同,杯中風味差很多。',
   '## 水洗

去除果肉後發酵、洗淨再乾燥,風味乾淨、酸質明亮。

## 日曬

帶著果肉直接曬乾,甜感與果香更濃,口感也更厚實。

## 怎麼選

喜歡清爽乾淨選水洗,喜歡濃郁果香選日曬。'),
  ('post_washed_natural', 'en', 'Washed vs Natural: How Processing Changes Flavour', 'The same bean tastes very different depending on how it is processed.',
   '## Washed

The pulp is removed, then the beans are fermented, washed and dried, giving a clean, bright cup.

## Natural

The beans are dried with the fruit still on, giving more sweetness, fruitiness and body.

## How to choose

Pick washed for clean and crisp, natural for rich fruit.'),
  ('post_washed_natural', 'ms-MY', 'Basuh vs Semula Jadi: Bagaimana Pemprosesan Mengubah Rasa', 'Biji yang sama boleh berbeza rasa mengikut cara ia diproses.',
   '## Basuh

Isi buah dibuang, kemudian biji ditapai, dibasuh dan dikeringkan, menghasilkan secawan yang bersih dan cerah.

## Semula jadi

Biji dikeringkan bersama buahnya, memberi lebih kemanisan, rasa buah dan tekstur pekat.

## Cara memilih

Pilih basuh untuk rasa bersih dan segar, semula jadi untuk rasa buah yang pekat.'),
  ('post_washed_natural', 'id-ID', 'Washed vs Natural: Bagaimana Proses Mengubah Rasa', 'Biji yang sama bisa terasa sangat berbeda tergantung prosesnya.',
   '## Washed

Daging buah dibuang, lalu biji difermentasi, dicuci dan dikeringkan sehingga rasanya bersih dan cerah.

## Natural

Biji dikeringkan bersama buahnya sehingga lebih manis, beraroma buah dan bertekstur tebal.

## Cara memilih

Pilih washed untuk rasa bersih dan segar, natural untuk rasa buah yang pekat.'),

  ('post_v60_guide', 'zh-Hant', 'V60 手沖入門:四個步驟', '15 克粉、225 克水,三分鐘內完成一杯手沖。',
   '## 準備

15 克中細研磨的咖啡粉、225 克 90–92°C 的熱水。

## 悶蒸

先注入約 30 克水,等待 30 秒,讓咖啡粉排氣。

## 注水

分段繞圈注入,直到總水量 225 克。

## 完成

總時間約 2 分 30 秒到 3 分鐘。太酸就磨細一點,太苦就磨粗一點。'),
  ('post_v60_guide', 'en', 'V60 Pour-Over Basics in Four Steps', '15 g of coffee, 225 g of water, a great cup in three minutes.',
   '## Prepare

15 g of medium-fine ground coffee and 225 g of water at 90-92C.

## Bloom

Pour about 30 g of water and wait 30 seconds so the grounds can degas.

## Pour

Pour in slow circles in stages until you reach 225 g.

## Finish

Total time is about 2:30 to 3:00. Too sour? Grind finer. Too bitter? Grind coarser.'),
  ('post_v60_guide', 'ms-MY', 'Asas Tuang V60 dalam Empat Langkah', '15 g kopi, 225 g air, secawan kopi hebat dalam tiga minit.',
   '## Sediakan

15 g kopi kisaran sederhana halus dan 225 g air pada suhu 90-92C.

## Kembang

Tuang kira-kira 30 g air dan tunggu 30 saat supaya serbuk melepaskan gas.

## Tuang

Tuang dalam bulatan perlahan secara berperingkat sehingga mencapai 225 g.

## Siap

Jumlah masa kira-kira 2:30 hingga 3:00. Terlalu masam? Kisar lebih halus. Terlalu pahit? Kisar lebih kasar.'),
  ('post_v60_guide', 'id-ID', 'Dasar Seduh V60 dalam Empat Langkah', '15 g kopi, 225 g air, secangkir kopi enak dalam tiga menit.',
   '## Persiapan

15 g kopi giling medium-halus dan 225 g air bersuhu 90-92C.

## Mekar

Tuang sekitar 30 g air dan tunggu 30 detik agar bubuk kopi melepaskan gas.

## Tuang

Tuang dengan gerakan melingkar perlahan secara bertahap hingga mencapai 225 g.

## Selesai

Total waktu sekitar 2:30 hingga 3:00. Terlalu asam? Giling lebih halus. Terlalu pahit? Giling lebih kasar.');
