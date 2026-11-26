-- S32: 知識文章(產地、處理法、烘焙度、研磨、手沖、保存、器具選購),四語言
INSERT OR REPLACE INTO posts (id, slug, status, category, cover_image_url, author_email, published_at, created_at, updated_at, faq) VALUES ('kb-coffee-origins-guide', 'coffee-origins-guide', 'published', NULL, NULL, NULL, 1795702180, 1795702180, 1795702180, '{"zh-Hant": [{"q": "同一個國家的咖啡味道會一樣嗎?", "a": "不一定。莊園的海拔、品種與處理法不同,風味就會有差異。"}, {"q": "海拔越高越好嗎?", "a": "一般來說,高海拔的咖啡生長較慢、風味較複雜,但還是要看整體品質與處理方式。"}, {"q": "怎麼看懂豆子包裝上的產地資訊?", "a": "通常會標示國家、產區、莊園、海拔、品種與處理法,資訊越完整,越能預期風味。"}], "en": [{"q": "Do coffees from the same country taste the same?", "a": "Not necessarily. Differences in farm elevation, variety, and processing method lead to distinct flavor profiles."}, {"q": "Is higher elevation always better?", "a": "Generally, higher elevations result in slower growth and more complex flavors, but overall quality and processing methods are also crucial."}, {"q": "How do I read origin information on coffee packaging?", "a": "Labels typically list the country, region, farm, elevation, variety, and processing method. More complete information helps you anticipate the flavor."}], "ms-MY": [{"q": "Adakah rasa kopi dari negara yang sama sama?", "a": "Tidak semestinya. Perbezaan ketinggian ladang, varieti, dan kaedah pemprosesan akan menghasilkan perbezaan rasa."}, {"q": "Adakah ketinggian yang lebih tinggi lebih baik?", "a": "Secara umumnya, kopi yang tumbuh di ketinggian yang lebih tinggi mempunyai pertumbuhan yang lebih perlahan dan rasa yang lebih kompleks, tetapi kualiti keseluruhan dan kaedah pemprosesan juga perlu dipertimbangkan."}, {"q": "Bagaimana untuk memahami maklumat asal usul pada pembungkusan biji kopi?", "a": "Biasanya, ia akan menunjukkan negara, kawasan, ladang, ketinggian, varieti, dan kaedah pemprosesan. Maklumat yang lebih lengkap membolehkan anda meramalkan rasa dengan lebih tepat."}], "id-ID": [{"q": "Apakah rasa kopi dari negara yang sama selalu sama?", "a": "Tidak selalu. Perbedaan ketinggian, varietas, dan metode pengolahan di setiap kebun akan menghasilkan perbedaan rasa."}, {"q": "Apakah semakin tinggi ketinggian, semakin baik?", "a": "Umumnya, kopi yang tumbuh di ketinggian lebih tinggi tumbuh lebih lambat dan memiliki rasa yang lebih kompleks, tetapi kualitas keseluruhan dan cara pengolahan juga perlu dipertimbangkan."}, {"q": "Bagaimana cara membaca informasi asal di kemasan biji kopi?", "a": "Biasanya tertera negara, daerah, kebun, ketinggian, varietas, dan metode pengolahan. Semakin lengkap informasinya, semakin mudah memperkirakan rasanya."}]}');
INSERT OR REPLACE INTO post_translations (post_id, locale, title, excerpt, body_markdown) VALUES ('kb-coffee-origins-guide', 'zh-Hant', '咖啡產地入門:從非洲到中南美洲,味道怎麼不一樣', '產地決定咖啡的基本風味方向:非洲偏花果香與明亮酸質,中南美洲偏堅果與巧克力,亞洲偏草本與厚實口感。', '咖啡的味道,有一大部分在豆子還是種子時就決定了。海拔、氣候、土壤與品種,共同塑造每個產地的風味方向。

## 非洲:花香與果酸

衣索比亞、肯亞等產區,常見茉莉花、柑橘、莓果般的香氣與明亮的酸質,適合喜歡清爽果香的人。

## 中南美洲:平衡與甜感

巴西、哥倫比亞、瓜地馬拉等產區,多帶堅果、可可與焦糖的甜感,口感圓潤平衡,是日常飲用與配方豆常見的選擇。

## 亞洲:厚實與草本

印尼等產區,常有草本、香料與厚實的口感,酸質偏低。台灣也有精品咖啡產區。

## 怎麼選

以上只是大方向,同一國家不同莊園、不同處理法,風味也會有差異。建議看包裝上的產地、海拔與處理法,先挑一支喜歡的,再逐步探索。');
INSERT OR REPLACE INTO post_translations (post_id, locale, title, excerpt, body_markdown) VALUES ('kb-coffee-origins-guide', 'en', 'A Beginner''s Guide to Coffee Origins: How Flavors Differ from Africa to the Americas', 'Origin shapes the fundamental flavor profile: Africa leans toward floral and fruity notes with bright acidity, the Americas favor nutty and chocolatey tones, and Asia offers herbal notes and a full body.', 'Much of a coffee''s character is determined while the bean is still a seed. Elevation, climate, soil, and variety collectively shape the flavor direction of each origin.

## Africa: Floral and Fruity

Regions like Ethiopia and Kenya often feature jasmine, citrus, and berry aromas with bright acidity, making them ideal for those who enjoy refreshing fruit notes.

## The Americas: Balanced and Sweet

Origins such as Brazil, Colombia, and Guatemala typically offer nutty, cocoa, and caramel sweetness. With a smooth, balanced body, these coffees are common choices for daily drinking and espresso blends.

## Asia: Full-Bodied and Herbal

Regions like Indonesia often present herbal and spicy notes with a heavy body and lower acidity. Taiwan also has specialty coffee growing regions.

## How to Choose

These are broad generalizations. Flavors can vary significantly between different farms and processing methods within the same country. Look for origin, elevation, and processing details on the packaging. Start with a coffee you enjoy, then explore gradually.');
INSERT OR REPLACE INTO post_translations (post_id, locale, title, excerpt, body_markdown) VALUES ('kb-coffee-origins-guide', 'ms-MY', 'Pengenalan Asal Usul Kopi: Dari Afrika hingga Amerika Tengah dan Selatan, Bagaimana Perbezaan Rasanya', 'Asal usul menentukan arah rasa asas kopi: Afrika cenderung kepada aroma bunga dan buah dengan keasidan yang cerah, Amerika Tengah dan Selatan cenderung kepada kacang dan coklat, manakala Asia cenderung kepada herba dan tekstur yang tebal.', 'Sebahagian besar rasa kopi telah ditentukan ketika biji kopi masih berupa benih. Ketinggian, iklim, tanah, dan varieti bersama-sama membentuk arah rasa setiap asal usul.

## Afrika: Aroma Bunga dan Keasidan Buah

Di kawasan pengeluaran seperti Ethiopia dan Kenya, aroma seperti bunga melati, sitrus, dan beri sering ditemui, disertai keasidan yang cerah. Sesuai untuk mereka yang menyukai kesegaran aroma buah.

## Amerika Tengah dan Selatan: Keseimbangan dan Manis

Di kawasan seperti Brazil, Colombia, dan Guatemala, rasa manis seperti kacang, koko, dan karamel sering hadir. Teksturnya lembut dan seimbang, menjadikannya pilihan biasa untuk minuman harian dan biji kopi campuran.

## Asia: Tekstur Tebal dan Herba

Di kawasan seperti Indonesia, rasa herba, rempah, dan tekstur yang tebal sering ditemui, dengan keasidan yang rendah. Taiwan juga mempunyai kawasan pengeluaran kopi premium.

## Cara Memilih

Ini hanyalah arah umum. Di negara yang sama, perbezaan antara ladang dan kaedah pemprosesan akan menghasilkan perbezaan rasa. Disarankan untuk melihat maklumat asal usul, ketinggian, dan kaedah pemprosesan pada pembungkusan, pilih satu yang anda suka, dan terokai secara beransur-ansur.');
INSERT OR REPLACE INTO post_translations (post_id, locale, title, excerpt, body_markdown) VALUES ('kb-coffee-origins-guide', 'id-ID', 'Pengenalan Asal Biji Kopi: Dari Afrika hingga Amerika Tengah dan Selatan, Bagaimana Perbedaannya?', 'Asal biji menentukan arah rasa dasar kopi: Afrika cenderung beraroma bunga dan buah dengan keasaman cerah, Amerika Tengah dan Selatan cenderung bernuansa kacang dan cokelat, sedangkan Asia cenderung beraroma herbal dengan tekstur yang tebal.', 'Rasa kopi sebagian besar sudah ditentukan saat biji masih berupa benih. Ketinggian, iklim, tanah, dan varietas bersama-sama membentuk arah rasa setiap daerah penghasil.

## Afrika: Aroma Bunga dan Keasaman Buah

Di daerah penghasil seperti Ethiopia dan Kenya, aroma seperti bunga melati, jeruk, dan beri sering ditemukan dengan keasaman yang cerah, cocok untuk mereka yang menyukai rasa buah yang segar.

## Amerika Tengah dan Selatan: Keseimbangan dan Manis

Di daerah penghasil seperti Brasil, Kolombia, dan Guatemala, rasa manis seperti kacang, kakao, dan karamel sering hadir. Teksturnya halus dan seimbang, menjadikannya pilihan umum untuk konsumsi harian dan campuran kopi.

## Asia: Tekstur Tebal dan Herbal

Di daerah penghasil seperti Indonesia, rasa herbal, rempah, dan tekstur tebal sering ditemukan dengan keasaman yang rendah. Taiwan juga memiliki daerah penghasil kopi spesialti.

## Cara Memilih

Semua di atas hanyalah arah umum. Di negara yang sama, rasa dapat berbeda tergantung pada kebun dan metode pengolahan. Disarankan untuk memperhatikan asal, ketinggian, dan metode pengolahan pada kemasan, pilih satu yang disukai, lalu jelajahi secara bertahap.');
INSERT OR REPLACE INTO posts (id, slug, status, category, cover_image_url, author_email, published_at, created_at, updated_at, faq) VALUES ('kb-washed-vs-natural-process', 'washed-vs-natural-process', 'published', NULL, NULL, NULL, 1795702180, 1795702180, 1795702180, '{"zh-Hant": [{"q": "日曬的咖啡會比較酸嗎?", "a": "不一定。日曬通常酸質較柔和、果香更濃,但仍要看豆子本身與烘焙度。"}, {"q": "水洗比日曬好嗎?", "a": "沒有誰比較好,只是風味方向不同,依個人喜好選擇即可。"}, {"q": "蜜處理有加蜂蜜嗎?", "a": "沒有。「蜜」指的是保留在豆子上的果膠,黏稠像蜜。"}], "en": [{"q": "Is natural process coffee more acidic?", "a": "Not necessarily. Natural process usually has softer acidity and stronger fruitiness, but it still depends on the bean itself and the roast level."}, {"q": "Is washed process better than natural?", "a": "Neither is better; they simply offer different flavor profiles. Choose based on your personal preference."}, {"q": "Does honey process add honey?", "a": "No. ''Honey'' refers to the mucilage left on the bean, which is sticky like honey."}], "ms-MY": [{"q": "Adakah kopi natural lebih masam?", "a": "Tidak semestinya. Kopi natural biasanya mempunyai keasaman yang lebih lembut dan aroma buah yang lebih kuat, tetapi ia masih bergantung pada jenis biji dan tahap pembakaran."}, {"q": "Adakah washing lebih baik daripada natural?", "a": "Tiada yang lebih baik, hanya arah rasa yang berbeza. Sila pilih berdasarkan citarasa peribadi anda."}, {"q": "Adakah madu ditambah dalam honey processing?", "a": "Tidak. ''Madu'' merujuk kepada lapisan berlendir yang dibiarkan pada biji kopi, yang mempunyai konsistensi seperti madu."}], "id-ID": [{"q": "Apakah kopi natural lebih asam?", "a": "Tidak selalu. Natural biasanya memiliki keasaman yang lebih lembut dan aroma buah yang lebih kuat, tetapi tetap bergantung pada biji itu sendiri dan tingkat sangrai."}, {"q": "Apakah washed lebih baik dari natural?", "a": "Tidak ada yang lebih baik, hanya arah rasanya yang berbeda. Pilih sesuai selera pribadi."}, {"q": "Apakah honey berarti ada madu yang ditambahkan?", "a": "Tidak. ''Honey'' merujuk pada lendir buah yang dibiarkan menempel di biji, yang teksturnya lengket seperti madu."}]}');
INSERT OR REPLACE INTO post_translations (post_id, locale, title, excerpt, body_markdown) VALUES ('kb-washed-vs-natural-process', 'zh-Hant', '水洗 vs 日曬:處理法如何改變一杯咖啡的風味', '處理法是咖啡果實變成生豆的方式:水洗乾淨明亮,日曬果香濃郁,蜜處理則甜感圓潤。', '咖啡豆其實是咖啡果實裡的種子。採收後,要先去除果肉並乾燥,才會成為我們看到的生豆。這個步驟稱為處理法,對風味影響很大。

## 水洗法

先去除果皮與果肉,再經過發酵與水洗後乾燥。風味乾淨、明亮,能清楚呈現產地特色。

## 日曬法

整顆果實直接曬乾,再脫去果皮。果肉的糖分與風味會滲入豆子,帶來明顯的莓果、熱帶水果香氣與厚實口感。

## 蜜處理

去除果皮後,保留部分果膠再乾燥,甜感與酸質介於水洗與日曬之間,口感圓潤。

## 怎麼選

喜歡乾淨清爽,選水洗;喜歡果香濃郁,選日曬;想要平衡的甜感,選蜜處理。');
INSERT OR REPLACE INTO post_translations (post_id, locale, title, excerpt, body_markdown) VALUES ('kb-washed-vs-natural-process', 'en', 'Washed vs. Natural: How Processing Shapes the Flavor of Your Coffee', 'Processing is how coffee cherries become green beans: washed for clean brightness, natural for rich fruitiness, and honey for rounded sweetness.', 'Coffee beans are actually the seeds inside the coffee cherry. After harvest, the fruit must be removed and dried to become the green beans we know. This step, called processing, has a significant impact on flavor.

## Washed Process

The skin and pulp are removed first, followed by fermentation, washing, and drying. The flavor is clean and bright, clearly highlighting the origin''s characteristics.

## Natural Process

The whole cherry is dried directly, and the skin is removed later. Sugars and flavors from the fruit seep into the bean, bringing distinct berry and tropical fruit aromas with a full body.

## Honey Process

The skin is removed, but some mucilage is left on the bean before drying. The sweetness and acidity fall between washed and natural, resulting in a rounded mouthfeel.

## How to Choose

If you prefer a clean and refreshing cup, choose washed. If you enjoy rich fruitiness, choose natural. If you want a balanced sweetness, choose honey.');
INSERT OR REPLACE INTO post_translations (post_id, locale, title, excerpt, body_markdown) VALUES ('kb-washed-vs-natural-process', 'ms-MY', 'Washing vs Natural: Bagaimana Proses Pengolahan Mengubah Rasa Secawan Kopi', 'Proses pengolahan ialah cara buah kopi menjadi biji kopi hijau: washing bersih dan cerah, natural kaya dengan aroma buah, manakala honey processing memberikan rasa manis yang lembut.', 'Biji kopi sebenarnya ialah benih di dalam buah kopi. Selepas dituai, kulit dan daging buah perlu dibuang serta dikeringkan sebelum menjadi biji kopi hijau yang kita lihat. Langkah ini dipanggil proses pengolahan, dan ia memberi kesan besar kepada rasa.

## Washing

Kulit dan daging buah dibuang terlebih dahulu, kemudian melalui proses fermentasi dan pencucian sebelum dikeringkan. Rasanya bersih dan cerah, membolehkan ciri khas asal usul kopi untuk tampil dengan jelas.

## Natural

Buah kopi dikeringkan secara keseluruhan, kemudian kulitnya dibuang. Gula dan rasa dari daging buah meresap ke dalam biji, membawa aroma beri dan buah tropika yang ketara serta tekstur yang tebal.

## Honey Processing

Selepas kulit dibuang, sebahagian daripada lapisan berlendir (mesocarp) dibiarkan sebelum dikeringkan. Rasa manis dan keasamannya berada di antara washing dan natural, dengan tekstur yang lembut dan bulat.

## Cara Memilih

Jika anda suka rasa yang bersih dan segar, pilih washing. Jika anda suka aroma buah yang kuat, pilih natural. Jika anda mahukan keseimbangan rasa manis, pilih honey processing.');
INSERT OR REPLACE INTO post_translations (post_id, locale, title, excerpt, body_markdown) VALUES ('kb-washed-vs-natural-process', 'id-ID', 'Washing vs Natural: Bagaimana Metode Pengolahan Mengubah Rasa Secangkir Kopi', 'Metode pengolahan adalah cara buah kopi menjadi biji hijau: washed bersih dan cerah, natural kaya aroma buah, honey memiliki rasa manis yang lembut.', 'Biji kopi sebenarnya adalah biji di dalam buah kopi. Setelah panen, daging buah harus dihilangkan dan dikeringkan agar menjadi biji hijau yang kita kenal. Langkah ini disebut metode pengolahan, yang sangat memengaruhi rasa.

## Metode Washed

Kulit dan daging buah dihilangkan terlebih dahulu, lalu difermentasi, dicuci, dan dikeringkan. Rasanya bersih dan cerah, mampu menampilkan karakteristik asal dengan jelas.

## Metode Natural

Buah utuh dikeringkan langsung, lalu kulitnya dihilangkan. Gula dan rasa dari daging buah meresap ke dalam biji, menghadirkan aroma beri dan buah tropis yang kuat serta tekstur yang tebal.

## Metode Honey

Setelah kulit dihilangkan, sebagian lendir buah (mucilage) dibiarkan menempel sebelum dikeringkan. Rasa manis dan keasamannya berada di antara washed dan natural, dengan tekstur yang lembut.

## Cara Memilih

Jika Anda suka rasa bersih dan segar, pilih washed; jika suka aroma buah yang kuat, pilih natural; jika menginginkan keseimbangan rasa manis, pilih honey.');
INSERT OR REPLACE INTO posts (id, slug, status, category, cover_image_url, author_email, published_at, created_at, updated_at, faq) VALUES ('kb-roast-levels-explained', 'roast-levels-explained', 'published', NULL, NULL, NULL, 1795702180, 1795702180, 1795702180, '{"zh-Hant": [{"q": "深焙咖啡的咖啡因比較少嗎?", "a": "差異不大。烘焙度對咖啡因含量影響有限,主要差別在風味。"}, {"q": "淺焙會很酸嗎?", "a": "淺焙的酸質較明顯,但好的酸質像水果的清爽感。如果不習慣,可以先從中焙開始。"}, {"q": "包裝上的烘焙度怎麼看?", "a": "通常標示淺、中、深,不同店家的標準略有不同,建議搭配風味描述一起參考。"}], "en": [{"q": "Does dark roast coffee have less caffeine?", "a": "The difference is minimal. Roast level has a limited impact on caffeine content; the main variation is in flavor."}, {"q": "Is light roast very acidic?", "a": "Light roasts have more pronounced acidity, but good acidity feels like the refreshing tang of fruit. If you are not used to it, start with a medium roast."}, {"q": "How do I read the roast level on the packaging?", "a": "Labels usually indicate light, medium, or dark. Standards vary slightly between roasters, so it is best to read the flavor descriptions alongside the roast level."}], "ms-MY": [{"q": "Apakah kopi panggang gelap memiliki lebih sedikit kafein?", "a": "Perbedaannya tidak signifikan. Tahap panggang memiliki pengaruh terbatas pada kandungan kafein; perbedaan utamanya terletak pada rasa."}, {"q": "Apakah kopi panggang ringan sangat asam?", "a": "Keasaman pada panggang ringan lebih menonjol, tetapi keasaman yang baik terasa seperti kesegaran buah. Jika belum terbiasa, mulailah dengan panggang sederhana."}, {"q": "Bagaimana cara membaca tingkat panggang pada kemasan?", "a": "Biasanya ditandai sebagai ringan, sederhana, atau gelap. Standar setiap kedai mungkin sedikit berbeda, jadi disarankan untuk merujuk juga pada deskripsi rasanya."}], "id-ID": [{"q": "Apakah kopi sangrai gelap memiliki lebih sedikit kafein?", "a": "Perbedaannya tidak signifikan. Tingkat sangrai memiliki pengaruh terbatas pada kadar kafein; perbedaan utamanya terletak pada rasa."}, {"q": "Apakah kopi sangrai ringan sangat asam?", "a": "Keasaman pada sangrai ringan lebih menonjol, tetapi asam yang baik terasa seperti kesegaran buah. Jika belum terbiasa, Anda bisa mulai dari sangrai sedang."}, {"q": "Bagaimana cara membaca tingkat sangrai pada kemasan?", "a": "Biasanya ditandai sebagai ringan, sedang, atau gelap. Standar setiap toko mungkin sedikit berbeda, jadi disarankan untuk merujuk juga pada deskripsi rasanya."}]}');
INSERT OR REPLACE INTO post_translations (post_id, locale, title, excerpt, body_markdown) VALUES ('kb-roast-levels-explained', 'zh-Hant', '淺焙、中焙、深焙:烘焙度怎麼影響風味', '烘焙越淺,酸質與花果香越明顯;烘焙越深,苦甜與焦糖感越明顯。中焙通常酸甜最平衡。', '生豆經過烘焙,才會產生咖啡的香氣與風味。烘焙的深淺,是決定一杯咖啡口味的關鍵之一。

## 淺焙

保留產地特色,酸質明亮,常有花香與果香,口感清爽。

## 中焙

酸甜平衡,帶有堅果、焦糖與可可風味,是接受度最高的選擇。

## 深焙

苦甜厚實,酸質低,帶有焦糖、巧克力與煙燻感,適合搭配牛奶。

## 怎麼選

依個人口味與沖煮方式決定。手沖偏好淺焙到中焙;義式或加奶的飲品,常選中焙到深焙。');
INSERT OR REPLACE INTO post_translations (post_id, locale, title, excerpt, body_markdown) VALUES ('kb-roast-levels-explained', 'en', 'Light, Medium, and Dark Roasts: How Roast Level Shapes Flavor', 'Lighter roasts highlight acidity and floral or fruity notes, while darker roasts emphasize bittersweet and caramel tones. Medium roasts typically offer the best balance of sweet and sour.', 'Green beans develop their aroma and flavor only through roasting. The roast level is a key factor in determining the taste of your cup.

## Light Roast

Preserves origin characteristics with bright acidity, often featuring floral and fruity notes for a clean, refreshing finish.

## Medium Roast

Balances sweetness and acidity with notes of nuts, caramel, and cocoa. This is the most widely appreciated choice.

## Dark Roast

Offers a rich, bittersweet profile with low acidity, featuring caramel, chocolate, and smoky notes. It pairs well with milk.

## How to Choose

Decide based on personal taste and brewing method. Pour-over enthusiasts often prefer light to medium roasts, while espresso or milk-based drinks are commonly made with medium to dark roasts.');
INSERT OR REPLACE INTO post_translations (post_id, locale, title, excerpt, body_markdown) VALUES ('kb-roast-levels-explained', 'ms-MY', 'Panggang Ringan, Sederhana, dan Gelap: Bagaimana Tahap Panggang Mempengaruhi Rasa', 'Semakin ringan panggangannya, semakin jelas keasaman dan aroma bunga serta buah. Semakin gelap, semakin kuat rasa pahit-manis dan karamel. Panggang sederhana biasanya menawarkan keseimbangan asam dan manis yang paling baik.', 'Biji kopi mentah perlu dipanggang untuk menghasilkan aroma dan rasa kopi. Tahap kegelapan panggang adalah salah satu faktor utama yang menentukan profil rasa secangkir kopi.

## Panggang Ringan

Menonjolkan ciri khas asal biji, dengan keasaman yang cerah, sering disertai aroma bunga dan buah, serta sensasi di mulut yang segar.

## Panggang Sederhana

Keseimbangan antara asam dan manis, dengan sentuhan rasa kacang, karamel, dan kakao. Ini adalah pilihan yang paling mudah diterima.

## Panggang Gelap

Rasa pahit-manis yang pekat, keasaman rendah, dengan nuansa karamel, cokelat, dan asap. Cocok untuk dicampur dengan susu.

## Cara Memilih

Tentukan berdasarkan selera pribadi dan metode seduh. Untuk seduh manual (pour-over), panggang ringan hingga sederhana lebih disarankan. Untuk espresso atau minuman ber-susu, panggang sederhana hingga gelap biasanya lebih sesuai.');
INSERT OR REPLACE INTO post_translations (post_id, locale, title, excerpt, body_markdown) VALUES ('kb-roast-levels-explained', 'id-ID', 'Sangrai Ringan, Sedang, dan Gelap: Bagaimana Tingkat Sangrai Mempengaruhi Rasa', 'Semakin ringan sangrainya, semakin jelas keasaman dan aroma bunga serta buah. Semakin gelap, semakin terasa pahit-manis dan rasa karamel. Sangrai sedang biasanya menawarkan keseimbangan asam-manis yang paling baik.', 'Biji kopi mentah baru menghasilkan aroma dan rasa setelah disangrai. Tingkat kegelapan sangrai adalah salah satu penentu utama profil rasa secangkir kopi.

## Sangrai Ringan

Menjaga karakteristik asal, dengan keasaman yang cerah, sering kali memiliki aroma bunga dan buah, serta sensasi di mulut yang segar.

## Sangrai Sedang

Keseimbangan asam dan manis, dengan nuansa kacang, karamel, dan kakao. Ini adalah pilihan yang paling mudah diterima.

## Sangrai Gelap

Rasa pahit-manis yang pekat, keasaman rendah, dengan nuansa karamel, cokelat, dan asap. Cocok untuk dicampur dengan susu.

## Cara Memilih

Tentukan berdasarkan preferensi pribadi dan metode seduh. Untuk seduh manual (pour-over), sangrai ringan hingga sedang lebih disukai. Untuk espresso atau minuman dengan susu, sangrai sedang hingga gelap sering kali menjadi pilihan.');
INSERT OR REPLACE INTO posts (id, slug, status, category, cover_image_url, author_email, published_at, created_at, updated_at, faq) VALUES ('kb-grind-size-guide', 'grind-size-guide', 'published', NULL, NULL, NULL, 1795702180, 1795702180, 1795702180, '{"zh-Hant": [{"q": "研磨粗細不一致會怎樣?", "a": "粉粒大小不均,會讓萃取不平均,同時出現酸澀與苦味。選擇品質穩定的磨豆機會有幫助。"}, {"q": "咖啡粉可以事先磨好嗎?", "a": "可以,但香氣流失很快,建議喝之前再現磨。"}, {"q": "手搖磨豆機要磨幾圈?", "a": "依機型而不同。建議記錄刻度或圈數,再依味道微調。"}], "en": [{"q": "What happens if the grind size is inconsistent?", "a": "Uneven particle sizes lead to uneven extraction, resulting in a mix of sour, astringent, and bitter notes. A grinder with consistent performance helps."}, {"q": "Can I grind coffee in advance?", "a": "Yes, but aromas dissipate quickly. It is best to grind just before brewing."}, {"q": "How many turns should I use with a hand grinder?", "a": "It varies by model. Record the dial setting or number of turns, then adjust based on taste."}], "ms-MY": [{"q": "Apa yang berlaku jika tahap pengisaran tidak seragam?", "a": "Saiz partikel yang tidak sekata menyebabkan ekstraksi tidak seimbang, menghasilkan rasa masam, astringen dan pahit secara serentak. Memilih pengisar kopi yang stabil kualitinya akan membantu."}, {"q": "Bolehkah serbuk kopi digiling terlebih dahulu?", "a": "Boleh, tetapi aroma hilang dengan cepat. Disarankan untuk mengisar semula sebelum minum."}, {"q": "Berapa pusingan untuk pengisar kopi manual?", "a": "Bergantung pada model mesin. Disarankan untuk merekodkan penanda atau bilangan pusingan, kemudian laraskan halus berdasarkan rasa."}], "id-ID": [{"q": "Apa yang terjadi jika ukuran gilingan tidak seragam?", "a": "Ukuran partikel yang tidak merata menyebabkan ekstraksi tidak seimbang, sehingga rasa asam, sepat, dan pahit muncul bersamaan. Memilih penggiling kopi dengan kualitas stabil akan sangat membantu."}, {"q": "Bisakah bubuk kopi digiling sebelumnya?", "a": "Bisa, tetapi aroma cepat hilang. Disarankan untuk menggilingnya sesaat sebelum diseduh."}, {"q": "Berapa kali putaran untuk penggiling manual?", "a": "Tergantung pada model mesin. Disarankan untuk mencatat skala atau jumlah putaran, lalu sesuaikan berdasarkan rasa."}]}');
INSERT OR REPLACE INTO post_translations (post_id, locale, title, excerpt, body_markdown) VALUES ('kb-grind-size-guide', 'zh-Hant', '咖啡研磨粗細指南:不同沖煮方式怎麼選', '沖煮時間越短,研磨越細;沖煮時間越長,研磨越粗。義式最細,手沖中等,法式濾壓與冷萃最粗。', '研磨粗細會直接影響萃取速度。粉越細,水越難通過,萃取越多;粉越粗,水流越快,萃取越少。

## 基本原則

沖煮時間短就磨細,沖煮時間長就磨粗。

## 常見對照

義式濃縮需要很細,約像細砂糖;手沖與濾杯為中等,約像粗砂糖或海鹽;法式濾壓與冷萃要磨粗,約像粗海鹽。

## 怎麼微調

太苦、太澀,就磨粗一點;太酸、太淡薄,就磨細一點。每次只調整一格,比較容易找出差異。');
INSERT OR REPLACE INTO post_translations (post_id, locale, title, excerpt, body_markdown) VALUES ('kb-grind-size-guide', 'en', 'Coffee Grind Size Guide: Choosing the Right Grind for Different Methods', 'Shorter brew times require finer grinds; longer times require coarser grinds. Espresso is the finest, pour-over is medium, and French press and cold brew are the coarsest.', 'Grind size directly affects extraction speed. Finer grounds slow water flow, increasing extraction; coarser grounds speed up flow, reducing extraction.

## Basic Principle

Grind finer for short brew times and coarser for long brew times.

## Common Comparisons

Espresso requires a very fine grind, similar to fine sugar. Pour-over and drip methods use a medium grind, similar to coarse sugar or sea salt. French press and cold brew require a coarse grind, similar to coarse sea salt.

## How to Adjust

If the coffee tastes too bitter or astringent, grind coarser. If it tastes too sour or weak, grind finer. Adjust by one setting at a time to easily identify the difference.');
INSERT OR REPLACE INTO post_translations (post_id, locale, title, excerpt, body_markdown) VALUES ('kb-grind-size-guide', 'ms-MY', 'Panduan Tahap Pengisar Kopi: Cara Memilih untuk Kaedah Seduhan Berbeza', 'Makin singkat masa seduhan, makin halus gilingan; makin lama masa seduhan, makin kasar gilingan. Espresso paling halus, seduhan manual sederhana, French press dan cold brew paling kasar.', 'Tahap pengisaran mempengaruhi kelajuan ekstraksi secara langsung. Semakin halus serbuk, semakin sukar air untuk melalui, semakin banyak ekstraksi; semakin kasar serbuk, aliran air lebih cepat, ekstraksi lebih sedikit.

## Prinsip Asas

Giling halus untuk masa seduhan singkat, giling kasar untuk masa seduhan panjang.

## Perbandingan Umum

Espresso memerlukan gilingan sangat halus, seperti gula halus; seduhan manual dan corong penapis sederhana, seperti gula kasar atau garam laut; French press dan cold brew memerlukan gilingan kasar, seperti garam laut kasar.

## Cara Pelarasan Halus

Jika terlalu pahit atau astringen, giling sedikit lebih kasar; jika terlalu masam atau nipis, giling sedikit lebih halus. Laraskan satu langkah pada satu masa untuk memudahkan perbezaan dikenal pasti.');
INSERT OR REPLACE INTO post_translations (post_id, locale, title, excerpt, body_markdown) VALUES ('kb-grind-size-guide', 'id-ID', 'Panduan Ukuran Gilingan Kopi: Cara Memilih untuk Metode Seduh Berbeda', 'Semakin singkat waktu seduh, semakin halus gilingannya; semakin lama waktu seduh, semakin kasar gilingannya. Espresso paling halus, manual brew sedang, French press dan cold brew paling kasar.', 'Ukuran gilingan secara langsung memengaruhi kecepatan ekstraksi. Semakin halus bubuknya, semakin sulit air melaluinya, sehingga ekstraksi lebih banyak; semakin kasar bubuknya, aliran air lebih cepat, sehingga ekstraksi lebih sedikit.

## Prinsip Dasar

Seduh singkat gunakan gilingan halus, seduh panjang gunakan gilingan kasar.

## Perbandingan Umum

Espresso membutuhkan gilingan sangat halus, sekitar seperti gula pasir halus; manual brew dan dripper menggunakan gilingan sedang, sekitar seperti gula pasir kasar atau garam laut; French press dan cold brew memerlukan gilingan kasar, sekitar seperti garam laut kasar.

## Cara Penyesuaian

Jika terlalu pahit atau sepat, giling sedikit lebih kasar; jika terlalu asam atau tipis, giling sedikit lebih halus. Sesuaikan hanya satu tingkat setiap kali agar perbedaan lebih mudah dikenali.');
INSERT OR REPLACE INTO posts (id, slug, status, category, cover_image_url, author_email, published_at, created_at, updated_at, faq) VALUES ('kb-pour-over-v60-basics', 'pour-over-v60-basics', 'published', NULL, NULL, NULL, 1795702180, 1795702180, 1795702180, '{"zh-Hant": [{"q": "沒有電子秤可以沖手沖嗎?", "a": "可以,但粉水比比較難穩定。建議使用電子秤,每次的味道會更一致。"}, {"q": "濾紙一定要先沖濕嗎?", "a": "建議先沖濕,可去除紙味並預熱器具。"}, {"q": "沖出來太淡怎麼辦?", "a": "可以把研磨調細、減少水量,或稍微延長悶蒸與萃取時間。"}], "en": [{"q": "Can I pour over without a digital scale?", "a": "Yes, but it is harder to keep the ratio consistent. A digital scale is recommended for more uniform results."}, {"q": "Do I have to wet the filter first?", "a": "It is recommended. Wetting the filter removes paper taste and preheats the equipment."}, {"q": "What if the coffee tastes too weak?", "a": "Try grinding finer, using less water, or slightly extending the bloom and extraction time."}], "ms-MY": [{"q": "Bolehkah melakukan seduhan manual tanpa penimbang digital?", "a": "Boleh, tetapi nisbah kopi dan air sukar untuk dikekalkan. Disyorkan menggunakan penimbang digital untuk mendapatkan rasa yang lebih konsisten setiap kali."}, {"q": "Adakah kertas penapis perlu dibasahkan terlebih dahulu?", "a": "Disyorkan untuk dibasahkan terlebih dahulu bagi menghilangkan bau kertas dan memanaskan peralatan."}, {"q": "Apa yang perlu dilakukan jika hasil seduhan terlalu cair?", "a": "Anda boleh melaraskan tumbukan menjadi lebih halus, mengurangkan jumlah air, atau memperpanjang sedikit masa perendaman awal dan pengekstrakan."}], "id-ID": [{"q": "Bisa menyeduh pour over tanpa timbangan digital?", "a": "Bisa, tetapi rasio bubuk air sulit dijaga stabil. Disarankan menggunakan timbangan digital agar rasa lebih konsisten setiap kali."}, {"q": "Apakah kertas saring harus dibasahi terlebih dahulu?", "a": "Disarankan untuk membakainya terlebih dahulu guna menghilangkan rasa kertas dan menghangatkan alat."}, {"q": "Bagaimana jika hasil seduhan terlalu encer?", "a": "Anda bisa mengatur gilingan lebih halus, mengurangi jumlah air, atau memperpanjang waktu blooming dan ekstraksi sedikit."}]}');
INSERT OR REPLACE INTO post_translations (post_id, locale, title, excerpt, body_markdown) VALUES ('kb-pour-over-v60-basics', 'zh-Hant', '手沖入門:V60 濾杯的基本流程', '用 1:15 的粉水比、約 90 度的水溫,先悶蒸約 30 秒再分段注水,新手也能沖出乾淨好喝的咖啡。', 'V60 是常見的錐形濾杯,操作簡單、風味乾淨,很適合入門。

## 準備

約 15 克中等研磨的咖啡粉、240 毫升約 90 度的熱水、濾紙與電子秤。濾紙先用熱水沖濕,可去除紙味並預熱器具。

## 悶蒸

先注入約 30 毫升的水,讓粉全部濕潤,靜置約 30 秒。

## 注水

以畫圈方式分兩到三次注水,總水量約 240 毫升,整體時間約 2 分 30 秒到 3 分鐘。

## 調整

太苦,就磨粗一點或降低水溫;太酸,就磨細一點或提高水溫。');
INSERT OR REPLACE INTO post_translations (post_id, locale, title, excerpt, body_markdown) VALUES ('kb-pour-over-v60-basics', 'en', 'Pour-Over Basics: The V60 Workflow', 'Using a 1:15 ratio and water at about 90 degrees, bloom for 30 seconds, then pour in stages. Even beginners can brew a clean, enjoyable cup.', 'The V60 is a common conical dripper. It is simple to use and produces a clean flavor, making it ideal for beginners.

## Preparation

Use about 15 grams of medium-ground coffee, 240 milliliters of water at about 90 degrees, a filter, and a digital scale. Wet the filter with hot water first to remove paper taste and preheat the equipment.

## Bloom

Pour about 30 milliliters of water to wet all the grounds, then let it sit for about 30 seconds.

## Pouring

Pour in two to three stages using a circular motion. The total water volume should be about 240 milliliters, with a total time of about 2 minutes 30 seconds to 3 minutes.

## Adjustments

If it is too bitter, grind coarser or lower the water temperature. If it is too sour, grind finer or raise the water temperature.');
INSERT OR REPLACE INTO post_translations (post_id, locale, title, excerpt, body_markdown) VALUES ('kb-pour-over-v60-basics', 'ms-MY', 'Permulaan Seduhan Manual: Alur Asas V60', 'Dengan nisbah kopi dan air 1:15 serta suhu air sekitar 90 darjah, lakukan perendaman awal selama kira-kira 30 saat sebelum menuang air secara berperingkat. Pemula pun boleh menghasilkan kopi yang bersih dan enak.', 'V60 ialah corong penapis kon yang biasa digunakan. Ia mudah dioperasikan dan menghasilkan rasa yang bersih, sangat sesuai untuk pemula.

## Persiapan

Kira-kira 15 gram kopi tumbuk sederhana, 240 mililiter air panas sekitar 90 darjah, kertas penapis, dan penimbang digital. Basahkan kertas penapis dengan air panas terlebih dahulu untuk menghilangkan bau kertas dan memanaskan peralatan.

## Perendaman Awal

Tuang kira-kira 30 mililiter air untuk membasahi semua serbuk kopi, kemudian biarkan selama kira-kira 30 saat.

## Menuang Air

Tuang air secara berperingkat dua hingga tiga kali dengan gerakan melingkar. Jumlah air keseluruhan kira-kira 240 mililiter, dengan masa keseluruhan sekitar 2 minit 30 saat hingga 3 minit.

## Pelarasan

Jika terlalu pahit, tumbuk lebih kasar atau kurangkan suhu air. Jika terlalu masam, tumbuk lebih halus atau naikkan suhu air.');
INSERT OR REPLACE INTO post_translations (post_id, locale, title, excerpt, body_markdown) VALUES ('kb-pour-over-v60-basics', 'id-ID', 'Memulai Pour Over: Alur Dasar V60', 'Dengan rasio bubuk air 1:15 dan suhu air sekitar 90 derajat, lakukan blooming selama 30 detik lalu tuang air secara bertahap. Pemula pun bisa menyeduh kopi yang bersih dan enak.', 'V60 adalah dripper kerucut yang umum digunakan. Operasinya sederhana dengan rasa yang bersih, sehingga sangat cocok untuk pemula.

## Persiapan

Siapkan sekitar 15 gram bubuk kopi gilingan sedang, 240 ml air panas sekitar 90 derajat, kertas saring, dan timbangan digital. Basahi kertas saring dengan air panas terlebih dahulu untuk menghilangkan rasa kertas dan menghangatkan alat.

## Blooming

Tuang sekitar 30 ml air untuk membasahi seluruh bubuk, lalu diamkan selama sekitar 30 detik.

## Penyerapan

Tuang air secara melingkar dalam dua hingga tiga tahap. Total volume air sekitar 240 ml, dengan waktu keseluruhan sekitar 2 menit 30 detik hingga 3 menit.

## Penyesuaian

Jika terlalu pahit, giling lebih kasar atau turunkan suhu air. Jika terlalu asam, giling lebih halus atau naikkan suhu air.');
INSERT OR REPLACE INTO posts (id, slug, status, category, cover_image_url, author_email, published_at, created_at, updated_at, faq) VALUES ('kb-storing-coffee-beans', 'storing-coffee-beans', 'published', NULL, NULL, NULL, 1795702180, 1795702180, 1795702180, '{"zh-Hant": [{"q": "咖啡豆出油正常嗎?", "a": "深焙豆表面常會出油,沒有油耗味或異味就可以安心飲用。"}, {"q": "咖啡粉可以保存多久?", "a": "磨成粉後香氣流失很快,建議磨好後盡快喝完。"}, {"q": "一次該買多少咖啡豆?", "a": "買 2 到 4 週內能喝完的份量,風味最好。"}], "en": [{"q": "Is it normal for coffee beans to get oily?", "a": "Surface oil is common on dark roasts. If there is no rancid or off smell, the beans are safe to drink."}, {"q": "How long does ground coffee last?", "a": "Ground coffee loses aroma quickly. It is best to consume it as soon as possible after grinding."}, {"q": "How much coffee should I buy at once?", "a": "Purchase only what you can finish within 2 to 4 weeks for the best flavor."}], "ms-MY": [{"q": "Adakah normal jika biji kopi berminyak?", "a": "Permukaan biji kopi panggang gelap sering mengeluarkan minyak. Ia selamat diminum selagi tiada bau minyak atau bau asing."}, {"q": "Berapa lama serbuk kopi boleh disimpan?", "a": "Aroma hilang dengan cepat selepas digiling. Sebaiknya habiskan segera setelah digiling."}, {"q": "Berapa banyak biji kopi yang perlu dibeli?", "a": "Beli kuantiti yang dapat dihabiskan dalam masa 2 hingga 4 minggu untuk mendapatkan rasa terbaik."}], "id-ID": [{"q": "Apakah normal jika biji kopi berminyak?", "a": "Biji kopi roasting gelap sering mengeluarkan minyak di permukaannya. Selama tidak ada bau tengik atau asing, aman untuk diminum."}, {"q": "Berapa lama bubuk kopi bisa disimpan?", "a": "Aroma hilang dengan cepat setelah digiling. Sebaiknya segera diminum setelah digiling."}, {"q": "Berapa banyak biji kopi yang harus dibeli sekaligus?", "a": "Beli jumlah yang cukup untuk 2 hingga 4 minggu ke depan agar rasanya tetap terbaik."}]}');
INSERT OR REPLACE INTO post_translations (post_id, locale, title, excerpt, body_markdown) VALUES ('kb-storing-coffee-beans', 'zh-Hant', '咖啡豆怎麼保存才新鮮', '密封、避光、陰涼乾燥,並在開封後 2 到 4 週內喝完。不建議每天進出冰箱。', '咖啡豆最怕空氣、光線、濕氣與高溫。保存得當,才能留住香氣。

## 保存原則

放在密封容器或有單向排氣閥的夾鏈袋中,避光,放在陰涼乾燥處,遠離爐火與窗邊。

## 冷藏與冷凍

從冰箱取出時容易產生水氣,不建議每天進出。如果一次買得多,可以分成小包密封冷凍,取出後不要再放回去。

## 賞味期

烘焙後約兩週到一個月風味最好,開封後盡量在 2 到 4 週內喝完。');
INSERT OR REPLACE INTO post_translations (post_id, locale, title, excerpt, body_markdown) VALUES ('kb-storing-coffee-beans', 'en', 'How to Keep Coffee Beans Fresh', 'Store in a sealed, light-proof container in a cool, dry place. Consume within 2 to 4 weeks of opening. Avoid frequent trips to the fridge.', 'Coffee beans are most vulnerable to air, light, moisture, and heat. Proper storage preserves their aroma.

## Storage Principles

Keep beans in an airtight container or a zip-lock bag with a one-way valve. Store in a cool, dry, dark place, away from heat sources and windows.

## Refrigeration and Freezing

Condensation forms when beans are removed from the fridge, so avoid daily cycling. If buying in bulk, divide into small sealed portions and freeze. Do not refreeze once thawed.

## Best By Date

Flavor peaks about two weeks to one month after roasting. Once opened, aim to finish the beans within 2 to 4 weeks.');
INSERT OR REPLACE INTO post_translations (post_id, locale, title, excerpt, body_markdown) VALUES ('kb-storing-coffee-beans', 'ms-MY', 'Cara Menyimpan Biji Kopi Agar Segar', 'Tutup rapat, elakkan cahaya, simpan di tempat sejuk dan kering, serta habiskan dalam masa 2 hingga 4 minggu selepas dibuka. Elakkan memasukkan ke dalam peti ais setiap hari.', 'Biji kopi paling terdedah kepada udara, cahaya, kelembapan, dan haba. Penyimpanan yang betul dapat mengekalkan aromanya.

## Prinsip Penyimpanan

Simpan dalam bekas kedap udara atau beg zip yang mempunyai injap pelepasan satu arah. Elakkan cahaya dan letakkan di tempat yang sejuk serta kering, jauh dari dapur dan tingkap.

## Peti Ais dan Pembekuan

Pengambilan dari peti ais sering menyebabkan pembentukan wap air, jadi elakkan pergerakan harian. Jika membeli dalam kuantiti besar, bahagikan kepada paket kecil, tutup rapat, dan bekukan. Jangan letakkan semula selepas dikeluarkan.

## Tempoh Kegunaan

Rasa terbaik adalah dalam masa dua minggu hingga sebulan selepas pembakaran. Cuba habiskan dalam masa 2 hingga 4 minggu selepas dibuka.');
INSERT OR REPLACE INTO post_translations (post_id, locale, title, excerpt, body_markdown) VALUES ('kb-storing-coffee-beans', 'id-ID', 'Cara Menyimpan Biji Kopi agar Tetap Segar', 'Simpan dalam wadah kedap udara, jauhkan dari cahaya, dan letakkan di tempat sejuk serta kering. Selesaikan dalam 2 hingga 4 minggu setelah dibuka. Hindari memasukkan dan mengeluarkan dari kulkas setiap hari.', 'Biji kopi sangat rentan terhadap udara, cahaya, kelembapan, dan suhu tinggi. Penyimpanan yang tepat akan menjaga aromanya.

## Prinsip Penyimpanan

Simpan dalam wadah kedap udara atau kantong ritsleting dengan katup satu arah. Jauhkan dari cahaya dan letakkan di tempat sejuk serta kering, jauh dari kompor dan jendela.

## Kulkas dan Freezer

Mengeluarkan dari kulkas sering menyebabkan kondensasi, jadi hindari membuka dan menutup setiap hari. Jika membeli dalam jumlah banyak, bagi menjadi paket kecil, simpan di freezer, dan jangan kembalikan setelah dikeluarkan.

## Masa Simpan

Rasa terbaik adalah sekitar dua minggu hingga satu bulan setelah roasting. Usahakan untuk menghabiskan dalam 2 hingga 4 minggu setelah kemasan dibuka.');
INSERT OR REPLACE INTO posts (id, slug, status, category, cover_image_url, author_email, published_at, created_at, updated_at, faq) VALUES ('kb-choosing-brewing-equipment', 'choosing-brewing-equipment', 'published', NULL, NULL, NULL, 1795702180, 1795702180, 1795702180, '{"zh-Hant": [{"q": "預算有限,先買什麼?", "a": "先買電子秤與濾杯,咖啡豆可以請店家代磨。"}, {"q": "濾紙和金屬濾網哪個好?", "a": "濾紙口感乾淨,金屬濾網保留較多油脂、口感更厚實,依喜好選擇。"}, {"q": "一定要買手沖壺嗎?", "a": "細口壺比較容易控制水流,新手建議使用。"}], "en": [{"q": "On a budget, what should I buy first?", "a": "Start with a scale and dripper. You can ask the shop to grind your beans."}, {"q": "Paper filters or metal mesh?", "a": "Paper filters yield a cleaner cup. Metal mesh retains more oils for a heavier body. Choose based on preference."}, {"q": "Do I need a gooseneck kettle?", "a": "A gooseneck kettle helps control water flow. It is recommended for beginners."}], "ms-MY": [{"q": "Jika bajet terhad, apa yang perlu dibeli dahulu?", "a": "Beli timbangan digital dan dripper dahulu; biji kopi boleh diminta digiling oleh kedai."}, {"q": "Mana yang lebih baik, kertas penapis atau penapis logam?", "a": "Kertas penapis memberikan rasa yang bersih, manakala penapis logam mengekalkan lebih banyak minyak dan rasa yang lebih pekat. Pilih mengikut citarasa anda."}, {"q": "Adakah kettle wajib dibeli?", "a": "Kettle dengan mulut nipis memudahkan kawalan aliran air, jadi disyorkan untuk pemula."}], "id-ID": [{"q": "Jika anggaran terbatas, apa yang harus dibeli dulu?", "a": "Beli timbangan digital dan dripper terlebih dahulu. Biji kopi bisa diminta digiling oleh toko."}, {"q": "Mana yang lebih baik, kertas saring atau filter logam?", "a": "Kertas saring menghasilkan rasa yang bersih, sedangkan filter logam mempertahankan lebih banyak minyak sehingga rasanya lebih tebal. Pilih sesuai selera."}, {"q": "Apakah harus membeli kettle khusus?", "a": "Kettle dengan mulut kecil lebih mudah untuk mengontrol aliran air, sehingga disarankan untuk pemula."}]}');
INSERT OR REPLACE INTO post_translations (post_id, locale, title, excerpt, body_markdown) VALUES ('kb-choosing-brewing-equipment', 'zh-Hant', '新手怎麼選沖煮器具', '從濾杯、手沖壺、電子秤開始;常喝咖啡再加入磨豆機。選自己用得順手的工具最重要。', '器具種類很多,不需要一次買齊。先從基本組合開始,再依需求慢慢增加。

## 基本組合

濾杯、濾紙、手沖壺與電子秤,是手沖的基本配備。

## 磨豆機

現磨的香氣差異明顯。手搖磨豆機價格親民、體積小;電動磨豆機省力又快速。

## 其他沖煮方式

法式濾壓壺操作簡單、口感厚實;愛樂壓風味乾淨且容易上手;摩卡壺可做出濃厚的咖啡。

## 清潔

每次使用後用清水沖洗,定期用溫水與少量中性洗劑清洗,完全晾乾再收納。');
INSERT OR REPLACE INTO post_translations (post_id, locale, title, excerpt, body_markdown) VALUES ('kb-choosing-brewing-equipment', 'en', 'Choosing Your First Brewing Gear', 'Start with a dripper, kettle, and scale. Add a grinder later. Choose tools that feel right for you.', 'There are many options, so you don''t need to buy everything at once. Begin with the basics and expand as needed.

## The Basics

A dripper, filters, kettle, and scale are the essentials for pour-over.

## Grinders

Freshly ground beans make a clear difference. Hand grinders are affordable and compact; electric grinders are faster and easier.

## Other Methods

French presses are simple and produce a full body. AeroPress offers a clean cup and is easy to use. Moka pots brew strong, concentrated coffee.

## Cleaning

Rinse with water after each use. Periodically wash with warm water and mild detergent, then dry completely before storing.');
INSERT OR REPLACE INTO post_translations (post_id, locale, title, excerpt, body_markdown) VALUES ('kb-choosing-brewing-equipment', 'ms-MY', 'Bagaimana Pemula Memilih Peralatan Seduh', 'Mulakan dengan dripper, kettle, dan timbangan digital; tambah pengisar biji kopi jika sudah biasa minum. Yang paling penting ialah memilih alat yang selesa digunakan.', 'Terdapat banyak jenis peralatan, jadi tidak perlu membeli semuanya sekaligus. Mulakan dengan set asas, kemudian tambah mengikut keperluan.

## Set Asas

Dripper, kertas penapis, kettle, dan timbangan digital adalah peralatan asas untuk seduh manual.

## Pengisar Biji Kopi

Perbezaan aroma biji kopi yang digiling segar sangat ketara. Pengisar manual lebih berpatutan dan ringkas; pengisar elektrik lebih jimat tenaga dan pantas.

## Kaedah Seduh Lain

French press mudah digunakan dan menghasilkan rasa yang pekat; AeroPress memberikan rasa yang bersih dan mudah dipelajari; moka pot boleh menghasilkan kopi yang kuat.

## Pembersihan

Bilas dengan air bersih selepas setiap penggunaan. Bersihkan secara berkala dengan air suam dan sedikit detergen neutral, kemudian keringkan sepenuhnya sebelum disimpan.');
INSERT OR REPLACE INTO post_translations (post_id, locale, title, excerpt, body_markdown) VALUES ('kb-choosing-brewing-equipment', 'id-ID', 'Cara Memilih Alat Seduh untuk Pemula', 'Mulai dari dripper, kettle, dan timbangan digital; tambahkan grinder jika sudah rutin minum kopi. Yang terpenting adalah memilih alat yang nyaman digunakan.', 'Jenis alatnya banyak, tidak perlu dibeli sekaligus. Mulailah dari set dasar, lalu tambahkan sesuai kebutuhan.

## Set Dasar

Dripper, kertas saring, kettle, dan timbangan digital adalah perlengkapan dasar untuk manual brew.

## Grinder

Perbedaan aroma dari biji yang digiling segar cukup jelas. Grinder manual harganya terjangkau dan ukurannya kecil; grinder listrik lebih hemat tenaga dan cepat.

## Metode Seduh Lain

French press mudah dioperasikan dengan rasa yang tebal; AeroPress menghasilkan rasa yang bersih dan mudah dipelajari; moka pot bisa membuat kopi yang pekat.

## Pembersihan

Bilas dengan air bersih setelah setiap penggunaan. Bersihkan secara berkala dengan air hangat dan sedikit deterjen netral, lalu keringkan sepenuhnya sebelum disimpan.');
