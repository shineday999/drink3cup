-- S06:分類代碼 jewelry/incense 改名為 beans/brewing,並補上示範商品的測驗標籤
CREATE TABLE IF NOT EXISTS site_categories (
  code       TEXT PRIMARY KEY,
  sort_order INTEGER NOT NULL DEFAULT 0,
  titles     TEXT NOT NULL DEFAULT '{}',
  descs      TEXT NOT NULL DEFAULT '{}',
  updated_at INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS site_images (
  key        TEXT PRIMARY KEY,
  url        TEXT NOT NULL,
  url_small  TEXT,
  updated_at INTEGER NOT NULL
);

UPDATE products SET category = 'beans' WHERE category = 'jewelry';
UPDATE products SET category = 'brewing' WHERE category = 'incense';

UPDATE product_categories SET code = 'beans', names = '{"zh-Hant":"咖啡豆","en":"Coffee Beans"}' WHERE code = 'jewelry';
UPDATE product_categories SET code = 'brewing', names = '{"zh-Hant":"沖煮器具","en":"Brewing Equipment"}' WHERE code = 'incense';

UPDATE site_categories SET code = 'beans' WHERE code = 'jewelry';
UPDATE site_categories SET code = 'brewing' WHERE code = 'incense';

UPDATE site_images SET key = 'cat_beans' WHERE key = 'cat_jewelry';
UPDATE site_images SET key = 'cat_brewing' WHERE key = 'cat_incense';

UPDATE products SET tags = 'light_roast,fruity,floral,pour_over,acid_high,ethiopia' WHERE slug = 'ethiopia-yirgacheffe-washed' AND tags = '';
UPDATE products SET tags = 'medium_roast,caramel,nutty,pour_over,immersion,acid_mid,colombia' WHERE slug = 'colombia-huila-washed' AND tags = '';
UPDATE products SET tags = 'light_roast,floral,caramel,pour_over,acid_mid,taiwan' WHERE slug = 'taiwan-alishan-light-roast' AND tags = '';
UPDATE products SET tags = 'dark_roast,chocolate,nutty,espresso,acid_low,blend' WHERE slug = 'three-cups-house-blend' AND tags = '';
UPDATE products SET tags = 'dripper,pour_over,beginner,intermediate,budget_low,solo,pair' WHERE slug = 'v60-pour-over-dripper-02' AND tags = '';
UPDATE products SET tags = 'kettle,pour_over,intermediate,budget_mid,solo,pair' WHERE slug = 'gooseneck-kettle-600ml' AND tags = '';
UPDATE products SET tags = 'grinder,pour_over,espresso,immersion,intermediate,budget_mid,solo' WHERE slug = 'manual-coffee-grinder' AND tags = '';
