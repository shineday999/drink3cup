-- 後台「分類圖片」：首頁「两条手作路線」兩張圖的網址。
-- 注意：API 也會 CREATE TABLE IF NOT EXISTS，所以不套用這支 migration 也能運作；保留它是為了讓 schema 有紀錄。
CREATE TABLE IF NOT EXISTS site_images (
  key        TEXT PRIMARY KEY,
  url        TEXT NOT NULL,
  url_small  TEXT,
  updated_at INTEGER NOT NULL
);
