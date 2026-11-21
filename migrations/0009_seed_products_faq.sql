-- cnamber-store products.faq default seed
-- 2026-10-04 Wave 36 Phase 2.4.c: 4 Q&A × 4 locale JSON template for all active products
UPDATE products SET faq = '{
  "zh-Hant": [
    {"q": "預訂制下單流程?", "a": "點預訂按鈕,我們會在一到兩個工作天內 email 確認材料、運送與付款細節。"},
    {"q": "多久會出貨?", "a": "下單確認後 7-14 個工作天,視材料與工時而定。"},
    {"q": "國際運費?", "a": "依目的地與重量報價,APAC 七到十四天,其他地區十四到二十一天。"},
    {"q": "退換貨政策?", "a": "出貨前可取消,出貨後七天內如有瑕疵可換貨。"}
  ],
  "en": [
    {"q": "Pre-order process?", "a": "Click Reserve. We will email within one to two working days to confirm materials, shipping, and payment."},
    {"q": "When will it ship?", "a": "Seven to fourteen working days after order confirmation, depending on materials and craft time."},
    {"q": "International shipping?", "a": "Quoted by destination and weight. APAC seven to fourteen days, others fourteen to twenty-one days."},
    {"q": "Return policy?", "a": "Cancel before shipping. Defects within seven days of receipt can be exchanged."}
  ],
  "ms-MY": [
    {"q": "Proses tempahan?", "a": "Klik butang Tempah. Kami akan emel dalam satu hingga dua hari bekerja untuk sahkan bahan, penghantaran, dan pembayaran."},
    {"q": "Bilakah ia dihantar?", "a": "Tujuh hingga empat belas hari bekerja selepas pengesahan, bergantung pada bahan dan masa kraftangan."},
    {"q": "Penghantaran antarabangsa?", "a": "Dikutip mengikut destinasi dan berat. APAC tujuh hingga empat belas hari, lain empat belas hingga dua puluh satu hari."},
    {"q": "Polisi pemulangan?", "a": "Batal sebelum penghantaran. Kecacatan dalam tujuh hari boleh ditukar."}
  ],
  "id-ID": [
    {"q": "Proses pemesanan?", "a": "Klik tombol Pesan. Kami akan email dalam satu hingga dua hari kerja untuk konfirmasi bahan, pengiriman, dan pembayaran."},
    {"q": "Kapan dikirim?", "a": "Tujuh hingga empat belas hari kerja setelah konfirmasi pesanan, tergantung bahan dan waktu pengerjaan."},
    {"q": "Pengiriman internasional?", "a": "Dikutip berdasarkan tujuan dan berat. APAC tujuh hingga empat belas hari, lain empat belas hingga dua puluh satu hari."},
    {"q": "Kebijakan pengembalian?", "a": "Batalkan sebelum pengiriman. Cacat dalam tujuh hari bisa ditukar."}
  ]
}' WHERE status = 'active';
