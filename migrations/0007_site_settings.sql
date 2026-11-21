-- mycafe site_settings: admin-managed key+locale text rows
-- 2026-10-02 Wave 28.7: site_name (4 locale) + theme + sub_theme (4 locale each)
-- INSERT OR IGNORE 對 prod 已有 site_name rows idempotent。

CREATE TABLE IF NOT EXISTS site_settings (
  key        TEXT NOT NULL,
  locale     TEXT NOT NULL,
  value      TEXT NOT NULL DEFAULT '',
  updated_at INTEGER NOT NULL,
  updated_by TEXT,
  PRIMARY KEY (key, locale)
);

CREATE INDEX IF NOT EXISTS idx_site_settings_key ON site_settings(key);

INSERT OR IGNORE INTO site_settings (key, locale, value, updated_at, updated_by) VALUES
  ('site_name', 'zh-Hant', '牛马得饰',     strftime('%s','now'), 'seed'),
  ('site_name', 'en',      'OxHorseCraft', strftime('%s','now'), 'seed'),
  ('site_name', 'ms-MY',   'OxHorseCraft', strftime('%s','now'), 'seed'),
  ('site_name', 'id-ID',   'OxHorseCraft', strftime('%s','now'), 'seed'),
  ('theme',     'zh-Hant', '森林系',         strftime('%s','now'), 'seed'),
  ('theme',     'en',      'Forest',         strftime('%s','now'), 'seed'),
  ('theme',     'ms-MY',   'Hutan',          strftime('%s','now'), 'seed'),
  ('theme',     'id-ID',   'Hutan',          strftime('%s','now'), 'seed'),
  ('sub_theme', 'zh-Hant', '暖色',           strftime('%s','now'), 'seed'),
  ('sub_theme', 'en',      'Warm palette',   strftime('%s','now'), 'seed'),
  ('sub_theme', 'ms-MY',   'Palet hangat',   strftime('%s','now'), 'seed'),
  ('sub_theme', 'id-ID',   'Palet hangat',   strftime('%s','now'), 'seed');
