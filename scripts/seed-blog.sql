-- cnamber-store blog seed — 3 篇 sample 文章,4 語翻譯
-- 用法:wrangler d1 execute DB --local --file=./scripts/seed-blog.sql
--       wrangler d1 execute DB --remote --file=./scripts/seed-blog.sql(上線)

INSERT INTO posts (id, slug, status, category, cover_image_url, author_email, published_at, created_at, updated_at) VALUES
  ('post_baltic_origin', 'baltic-amber-origin', 'published', 'material', NULL, 'shineday999@gmail.com', 1700100000, 1700100000, 1700100000),
  ('post_forest_stillness', 'forest-stillness-philosophy', 'published', 'culture', NULL, 'shineday999@gmail.com', 1700200000, 1700200000, 1700200000),
  ('post_yunnan_agarwood', 'yunnan-agarwood-slow-craft', 'published', 'craft', NULL, 'shineday999@gmail.com', 1700300000, 1700300000, 1700300000);

-- post 1: 波羅的海琥珀的形成與產地(material)
INSERT INTO post_translations (post_id, locale, title, excerpt, body_markdown) VALUES
  ('post_baltic_origin', 'zh-Hans', '波羅的海琥珀:凝結四千萬年的森林之光',
   '從波羅的海的沙灘到您的頸間,每一顆琥珀都藏著一段地質故事。',
   '## 什麼是琥珀

琥珀是遠古松科植物分泌的樹脂,在地層的壓力與時間的作用下,經歷**聚合作用**轉化為有機寶石。

## 波羅的海琥珀的獨特之處

波羅的海沿岸(立陶宛、拉脫維亞、波蘭、丹麥)是全球琥珀產量最高的區域,其特點:

- **琥珀酸含量 3-8%**(被稱為「北方之金」)
- 形成年代約 **4,400 萬年前**(始新世)
- 含有微型氣泡,在光線下呈現溫潤的蜂蜜色

## 與其他產區的對比

| 產區 | 年代 | 特徵 |
|---|---|---|
| 波羅的海 | 4,400 萬年 | 琥珀酸高、暖色調 |
| 緬甸胡康河谷 | 9,900 萬年 | 深紅色、年代久遠 |
| 多米尼加 | 1,500-4,000 萬年 | 藍珀稀有、UV 螢光 |
| 中國撫順 | 5,000-6,000 萬年 | 資源近枯、收藏價值 |

## 我們的挑選標準

- 不接受人工優化(熱處理、加壓)
- 接受肉眼 + 強光透視檢查裂紋與雜質
- 每件作品附產地與年代資訊卡

森林的光,凝固在您頸間的,是時間本身。'),
  ('post_baltic_origin', 'en', 'Baltic Amber: 44 Million Years of Forest Light',
   'From Baltic shores to your neckline, each amber carries a geological story.',
   '## What is amber

Amber is fossilized tree resin, transformed by **polymerization** under millions of years of geological pressure.

## What makes Baltic amber special

The Baltic coast (Lithuania, Latvia, Poland, Denmark) produces 80%+ of world amber:

- **3-8% succinic acid content** (hence "gold of the north")
- **~44 million years old** (Eocene epoch)
- Contains microscopic bubbles giving warm honey color

## Comparison with other regions

| Region | Age | Character |
|---|---|---|
| Baltic | 44 M yr | High succinic, warm tones |
| Myanmar Hukawng | 99 M yr | Deep red, ancient |
| Dominican | 15-40 M yr | Blue amber rare, UV fluorescent |
| China Fushun | 50-60 M yr | Near-depleted, collectible |

## Our selection criteria

- No enhancement (heat, pressure)
- Visual + bright-light inspection for cracks and inclusions
- Each piece ships with origin and age documentation card

The light of forests, frozen in your neckline, is time itself.'),
  ('post_baltic_origin', 'ms-MY', 'Ambar Baltik: 44 Juta Tahun Cahaya Hutan',
   'Dari pantai Baltik ke leher anda, setiap ambar membawa kisah geologi.',
   '## Apa itu ambar

Ambar ialah resin pokok yang membatu, ditransformasi oleh **polimerisasi** di bawah tekanan geologi jutaan tahun.

## Apa yang menjadikan ambar Baltik istimewa

Pantai Baltik (Lithuania, Latvia, Poland, Denmark) menghasilkan 80%+ ambar dunia:

- Kandungan asid suksinik 3-8% (oleh itu "emas utara")
- ~44 juta tahun (era Eosen)
- Mengandungi gelembung mikro memberikan warna madu hangat

## Perbandingan dengan kawasan lain

| Kawasan | Umur | Ciri |
|---|---|---|
| Baltik | 44 J tahun | Asid suksinik tinggi, warna hangat |
| Myanmar Hukawng | 99 J tahun | Merah tua, purba |
| Dominika | 15-40 J tahun | Ambar biru jarang, pendarfluor UV |
| China Fushun | 50-60 J tahun | Hampir habis, boleh dikumpul |

## Kriteria pemilihan kami

- Tiada peningkatan (haba, tekanan)
- Pemeriksaan visual + cahaya terang untuk rekahan dan kemasukan
- Setiap karya dihantar dengan kad dokumentasi asal dan umur

Cahaya hutan, dibekukan di leher anda, ialah masa itu sendiri.'),
  ('post_baltic_origin', 'id-ID', 'Amber Baltik: 44 Juta Tahun Cahaya Hutan',
   'Dari pantai Baltik ke leher Anda, setiap amber membawa kisah geologis.',
   '## Apa itu amber

Amber adalah resin pohon yang membatu, bertransformasi oleh **polimerisasi** di bawah tekanan geologis jutaan tahun.

## Apa yang membuat amber Baltik istimewa

Pantai Baltik (Lithuania, Latvia, Poland, Denmark) menghasilkan 80%+ amber dunia:

- Kandungan asam suksinat 3-8% (maka "emas utara")
- ~44 juta tahun (kala Eosen)
- Mengandung gelembung mikro memberi warna madu hangat

## Perbandingan dengan kawasan lain

| Kawasan | Usia | Ciri |
|---|---|---|
| Baltik | 44 J tahun | Asam suksinat tinggi, warna hangat |
| Myanmar Hukawng | 99 J tahun | Merah tua, kuno |
| Dominika | 15-40 J tahun | Amber biru langka, fluoresensi UV |
| China Fushun | 50-60 J tahun | Hampir habis, bisa dikoleksi |

## Kriteria pemilihan kami

- Tanpa peningkatan (panas, tekanan)
- Inspeksi visual + cahaya terang untuk retakan dan inklusi
- Setiap karya dikirim dengan kartu dokumentasi asal dan usia

Cahaya hutan, dibekukan di leher Anda, adalah waktu itu sendiri.');

-- post 2: 森林靜物美學(culture)
INSERT INTO post_translations (post_id, locale, title, excerpt, body_markdown) VALUES
  ('post_forest_stillness', 'zh-Hans', '森林靜物:我們的攝影美學',
   '為什麼我們的產品照不擺滿道具?只讓自然光、紋理、留白說話。',
   '## 借鏡歐美靜物電影

從 Wes Anderson 的對稱構圖,到 Steve McCurry 的自然光,歐美靜物攝影給我們的核心啟發是:**讓物件自己說話**。

## 我們的拍攝原則

1. **不堆道具**:一片木質托盤、一塊亞麻布、一個陶器足矣
2. **自然光優先**:窗邊斜射光,色溫 5500K
3. **淺景深**:f/2.8 讓主體清晰、背景柔和
4. **保留紋理**:材質的紋路是真實感的來源,後製不抹平
5. **大量留白**:東方禪意,讓眼睛休息

## 後製原則

- 降低飽和 5-10%
- 提高暖色調
- 永遠保留細節,不過度銳化
- 對比略壓低,讓畫面更安靜

## 拍過最難的一張

是撫順琥珀戒指。琥珀的反光會把旁邊木紋反射進去,我們用黑卡紙遮擋反射,調了 4 個小時,只為了那束光落在指環上的角度剛好。'),
  ('post_forest_stillness', 'en', 'Forest Stillness: Our Photography Aesthetic',
   'Why our product photos do not crowd props — only natural light, texture, and breathing room.',
   '## Borrowing from European still-life cinema

From Wes Anderson''s symmetrical compositions to Steve McCurry''s natural light, the core lesson from Western still-life photography: **let the object speak for itself**.

## Our shooting principles

1. **No prop clutter** — one wooden tray, one linen cloth, one ceramic vessel
2. **Natural light first** — angled window light at 5500K color temperature
3. **Shallow depth of field** — f/2.8 keeps subject sharp, background soft
4. **Preserve texture** — material grain is the source of authenticity, never smoothed in post
5. **Generous breathing room** — Eastern zen, let the eye rest

## Post-processing rules

- Desaturate 5-10%
- Slightly warmer
- Always preserve detail, never over-sharpen
- Lower contrast for a quieter image

## The hardest shot we have taken

It was the Fushun amber ring. The amber''s reflection pulls in the adjacent wood grain. We used a black card to block the reflection, adjusted for four hours — all for that single beam of light hitting the ring at exactly the right angle.'),
  ('post_forest_stillness', 'ms-MY', 'Keheningan Hutan: Estetik Fotografi Kami',
   'Mengapa foto produk kami tidak bertimbun prop — hanya cahaya semula jadi, tekstur, dan ruang bernafas.',
   '## Meminjam daripada sinema still-life Eropah

Daripada komposisi simetri Wes Anderson hingga cahaya semula jadi Steve McCurry, pengajaran teras daripada fotografi still-life Barat: **biarkan objek itu bercakap untuk dirinya sendiri**.

## Prinsip penggambaran kami

1. **Tiada prop bertimbun** — satu dulang kayu, satu kain linen, satu bekas seramik
2. **Cahaya semula jadi didahulukan** — cahaya tingkap bersudut pada suhu warna 5500K
3. **Kedalaman medan cetek** — f/2.8 memastikan subjek tajam, latar belakang lembut
4. **Kekalkan tekstur** — butiran bahan ialah sumber keaslian, tidak pernah dilicinkan dalam pasca
5. **Ruang bernafas yang banyak** — zen Timur, biarkan mata berehat

## Peraturan pasca-pemprosesan

- Kurangkan ketepuan 5-10%
- Agak lebih hangat
- Sentiasa kekalkan butiran, tidak pernah terlalu tajam
- Kurangkan kontras untuk imej yang lebih senyap

## Gambar paling sukar yang pernah kami ambil

Iaitu cincin ambar Fushun. Pantulan ambar itu menarik masuk butiran kayu bersebelahan. Kami menggunakan kad hitam untuk menyekat pantulan, melaraskan selama empat jam — semua untuk satu pancaran cahaya yang memukul cincin pada sudut yang betul-betul tepat.'),
  ('post_forest_stillness', 'id-ID', 'Keheningan Hutan: Estetika Fotografi Kami',
   'Mengapa foto produk kami tidak bertumpuk prop — hanya cahaya alami, tekstur, dan ruang bernapas.',
   '## Meminjam dari sinema still-life Eropa

Dari komposisi simetris Wes Anderson hingga cahaya alami Steve McCurry, pelajaran inti dari fotografi still-life Barat: **biarkan objek berbicara untuk dirinya sendiri**.

## Prinsip pemotretan kami

1. **Tanpa prop bertumpuk** — satu nampan kayu, satu kain linen, satu bejana keramik
2. **Cahaya alami didahulukan** — cahaya jendela bersudut pada suhu warna 5500K
3. **Kedalaman medan cetek** — f/2.8 menjaga subjek tajam, latar belakang lembut
4. **Pertahankan tekstur** — butiran bahan adalah sumber keaslian, tidak pernah dihaluskan dalam pasca
5. **Ruang bernapas yang banyak** — zen Timur, biarkan mata beristirahat

## Aturan pasca-pemrosesan

- Kurangi saturasi 5-10%
- Agak lebih hangat
- Selalu pertahankan detail, tidak pernah terlalu tajam
- Turunkan kontras untuk gambar yang lebih tenang

## Gambar tersulit yang pernah kami ambil

Ialah cincin amber Fushun. Pantulan amber itu menarik masuk butiran kayu bersebelahan. Kami menggunakan kad hitam untuk menyekat pantulan, melaras selama empat jam — semua untuk satu pancaran cahaya yang memukul cincin pada sudut yang betul-betul tepat.');

-- post 3: 雲南沉香的慢工藝(craft)
INSERT INTO post_translations (post_id, locale, title, excerpt, body_markdown) VALUES
  ('post_yunnan_agarwood', 'zh-Hans', '雲南沉香:慢的工藝',
   '從受傷的樹木到能點燃的香,沉香需要 30 年以上。',
   '## 沉香是什麼

沉香不是一種樹,而是**受傷樹木的回應**。當瑞香科樹木被蟲蛀、雷擊、火傷後,會分泌樹脂包裹傷口,經數十年轉化,才形成沉香。

## 為什麼雲南特別

雲南的熱帶雨林氣候溫潤,**菌種豐富**,加上原始林多、樹木生長慢,結出的沉香密度高、香氣沉穩:

- **前調**:清涼、帶草本
- **中調**:蜜甜、溫潤
- **後調**:木質、帶奶香

## 一根線香的誕生

1. **採集**:僅取結香部分,保留母樹
2. **陰乾**:3-6 個月,讓水分緩慢蒸發
3. **研磨**:石磨低速,避免高溫破壞芳香分子
4. **篩選**:分 60-200 目,粗細不同用途不同
5. **配比**:沉香為主,加少量檀香、丁香、龍腦調和
6. **成形**:手工搓製成線狀或塔狀

## 我們堅持的

**慢**。

一根線香從原料到成品,至少需要 8 個月。機器量產可以壓到 1 小時,但香氣層次差很多。

我們寧可少做一點,也要讓點香的人,聞得到山林的呼吸。'),
  ('post_yunnan_agarwood', 'en', 'Yunnan Agarwood: The Slow Craft',
   'From wounded trees to lit incense — agarwood takes over 30 years to form.',
   '## What agarwood is

Agarwood is not a tree species. It is a tree''s **wound response**: when Aquilaria trees are attacked by insects, lightning, or fire, they secrete resin to seal the wound. Over decades, that resin transforms into agarwood.

## Why Yunnan is special

Yunnan''s tropical rainforests have:

- **Warm, humid climate**
- **Rich fungal biodiversity**
- **Slow-growing old-growth forests**

These produce denser, more layered fragrance:

- **Top note**: cool, herbal
- **Heart note**: honey, mellow
- **Base note**: woody, milky

## Birth of one incense stick

1. **Harvest** — only the resin-bearing parts, leave the mother tree alive
2. **Air-dry** — 3-6 months for moisture to leave slowly
3. **Grind** — stone mill at low speed, never high heat
4. **Sieve** — 60 to 200 mesh, different uses for different grades
5. **Blend** — agarwood base + small amounts of sandalwood, clove, borneol
6. **Shape** — hand-rolled into stick or coil form

## What we insist on

**Slowness**.

One incense stick, raw material to finished product, takes at least eight months. Machine production can compress this to one hour — but the fragrance layers suffer.

We would rather make fewer, than have the person lighting it not smell the breath of the mountains.'),
  ('post_yunnan_agarwood', 'ms-MY', 'Gaharu Yunnan: Kraf Perlahan',
   'Dari pokok yang cedera kepada kemenyan yang menyala — gaharu mengambil masa lebih 30 tahun untuk terbentuk.',
   '## Apa itu gaharu

Gaharu bukan spesies pokok. Ia ialah **tindak balas luka** pokok: apabila pokok Aquilaria diserang serangga, kilat, atau api, mereka merembes resin untuk menutup luka. Berdekad-dekad kemudian, resin itu bertransformasi menjadi gaharu.

## Mengapa Yunnan istimewa

Hutan hujan tropika Yunnan mempunyai:

- Iklim hangat dan lembap
- Biodiversiti kulat yang kaya
- Hutan tua yang tumbuh perlahan

Ini menghasilkan wangian yang lebih padat dan berlapis:

- Nota atas: sejuk, herba
- Nota tengah: madu, lembut
- Nota asas: berkayu, seperti susu

## Kelahiran sebatang kemenyan

1. Tuai — hanya bahagian berresin, biarkan pokok ibu hidup
2. Keringkan udara — 3-6 bulan untuk kelembapan keluar perlahan
3. Kisar — kilang batu pada kelajuan rendah, tidak pernah haba tinggi
4. Ayak — 60 hingga 200 mesh, kegunaan berbeza untuk gred berbeza
5. Campur — asas gaharu + sedikit kayu cendana, cengkih, borneol
6. Bentuk — digulung tangan menjadi batang atau gegelung

## Apa yang kami tegaskan

**Perlahan**.

Sebatang kemenyan, bahan mentah hingga produk siap, mengambil masa sekurang-kurangnya lapan bulan. Pengeluaran mesin boleh memampatkan ini kepada satu jam — tetapi lapisan wangian menderita.

Kami lebih rela membuat lebih sedikit, daripada orang yang menyalakannya tidak mencium nafas gunung.'),
  ('post_yunnan_agarwood', 'id-ID', 'Gaharu Yunnan: Kerajinan Lambat',
   'Dari pohon yang terluka ke dupa yang menyala — gaharu butuh lebih dari 30 tahun untuk terbentuk.',
   '## Apa itu gaharu

Gaharu bukan spesies pohon. Ini adalah **respons luka** pohon: ketika pohon Aquilaria diserang serangga, petir, atau api, mereka mengeluarkan resin untuk menutup luka. Selama puluhan tahun, resin itu bertransformasi menjadi gaharu.

## Mengapa Yunnan istimewa

Hutan hujan tropis Yunnan memiliki:

- Iklim hangat dan lembap
- Biodiversitas jamur yang kaya
- Hutan tua yang tumbuh lambat

Ini menghasilkan wewangian yang lebih padat dan berlapis:

- Nada atas: sejuk, herbal
- Nada tengah: madu, lembut
- Nada dasar: kayu, seperti susu

## Kelahiran sebatang dupa

1. Panen — hanya bagian yang ber-resin, biarkan pohon induk hidup
2. Keringkan udara — 3-6 bulan agar kelembapan keluar perlahan
3. Giling — gilingan batu pada kecepatan rendah, tidak pernah panas tinggi
4. Ayak — 60 hingga 200 mesh, kegunaan berbeza untuk gred berbeza
5. Campur — asas gaharu + sedikit cendana, cengkeh, borneol
6. Bentuk — digulung tangan menjadi batang atau kumparan

## Apa yang kami tegaskan

**Kelambatan**.

Sebatang dupa, bahan mentah hingga produk jadi, memakan masa setidaknya lapan bulan. Produksi mesin dapat memampatkan ini menjadi satu jam — tetapi lapisan wewangian menderita.

Kami lebih rela membuat lebih sedikit, daripada orang yang menyalakannya tidak mencium napas gunung.');

-- 重新 fix published_at 為合理日期(2024 年底,顯示是最近文章)
UPDATE posts SET published_at = 1735000000 WHERE id IN ('post_baltic_origin', 'post_forest_stillness', 'post_yunnan_agarwood');