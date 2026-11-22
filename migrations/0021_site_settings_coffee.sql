-- S27:站名與主題標籤改為咖啡品牌(原本 en / ms-MY / id-ID 還是舊品牌名)
UPDATE site_settings SET value = 'Three Cups Coffee' WHERE key = 'site_name' AND locale IN ('en', 'ms-MY', 'id-ID');
UPDATE site_settings SET value = '精品咖啡' WHERE key = 'theme' AND locale = 'zh-Hant';
UPDATE site_settings SET value = 'Specialty coffee' WHERE key = 'theme' AND locale = 'en';
UPDATE site_settings SET value = 'Kopi istimewa' WHERE key = 'theme' AND locale = 'ms-MY';
UPDATE site_settings SET value = 'Kopi spesial' WHERE key = 'theme' AND locale = 'id-ID';
UPDATE site_settings SET value = '慢慢來' WHERE key = 'sub_theme' AND locale = 'zh-Hant';
UPDATE site_settings SET value = 'Slow and steady' WHERE key = 'sub_theme' AND locale = 'en';
UPDATE site_settings SET value = 'Perlahan-lahan' WHERE key = 'sub_theme' AND locale = 'ms-MY';
UPDATE site_settings SET value = 'Pelan-pelan' WHERE key = 'sub_theme' AND locale = 'id-ID';
