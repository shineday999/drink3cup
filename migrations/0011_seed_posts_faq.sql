-- Wave 37.1: seed 3 published posts with 4-locale FAQ JSON template
UPDATE posts
SET faq = json_object(
  'zh-Hant', json_array(
    json_object('q', '這篇文章談什麼?', 'a', '從森林、琥珀、香三條線,談材質與工藝的細節。'),
    json_object('q', '可以引用嗎?', 'a', '可以,請註明出處 喝三杯咖啡 與原文連結。'),
    json_object('q', '有商品推薦嗎?', 'a', '文章結尾如有「相關作品」連結,是我們挑選的搭配,可從那裡看。'),
    json_object('q', '想看更多?', 'a', '從 /story、/vision、/craft 開始,慢慢走。')
  ),
  'en', json_array(
    json_object('q', 'What does this article cover?', 'a', 'Forest, amber, and scent — material and craft, slowly.'),
    json_object('q', 'May I quote?', 'a', 'Yes — please credit mycafe and link back.'),
    json_object('q', 'Product recommendations?', 'a', 'If the article ends with a "related works" link, those are our picks.'),
    json_object('q', 'Where to start?', 'a', 'From /story, /vision, /craft — one quiet step at a time.')
  ),
  'ms-MY', json_array(
    json_object('q', 'Apakah topik artikel ini?', 'a', 'Hutan, amber, dan wangi — bahan dan kraf, dengan perlahan.'),
    json_object('q', 'Boleh saya petik?', 'a', 'Boleh — sila kredit mycafe dan pautkan kembali.'),
    json_object('q', 'Cadangan produk?', 'a', 'Jika artikel diakhiri dengan pautan "karya berkaitan", itu pilihan kami.'),
    json_object('q', 'Di mana nak mula?', 'a', 'Dari /story, /vision, /craft — satu langkah perlahan.')
  ),
  'id-ID', json_array(
    json_object('q', 'Apa yang dibahas artikel ini?', 'a', 'Hutan, amber, dan wangi — bahan dan kerajinan, pelan-pelan.'),
    json_object('q', 'Boleh saya kutip?', 'a', 'Boleh — mohon kredit mycafe dan tautan balik.'),
    json_object('q', 'Rekomendasi produk?', 'a', 'Jika artikel diakhiri tautan "karya terkait", itu pilihan kami.'),
    json_object('q', 'Mulai dari mana?', 'a', 'Dari /story, /vision, /craft — satu langkah tenang.')
  )
)
WHERE status = 'published';
