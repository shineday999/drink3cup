-- cnamber-store: hero_banners table for admin-managed home page banner slideshow
-- 2026-10-02 Wave 26: front-end admin banner editor + 15s fade in/out slideshow

CREATE TABLE IF NOT EXISTS hero_banners (
  id TEXT PRIMARY KEY,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_hero_banners_active ON hero_banners(active, sort_order);
