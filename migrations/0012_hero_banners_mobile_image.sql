-- Wave 65: hero_banners 加 mobile_image_url column
-- 真實 responsive LCP 縮小 (mobile 768w webp/jpeg variant)
-- Admin 上傳 mobile variant 時,R2 put banners/{id}/mobile-{ts}.{ext}
-- Frontend HomeContent.astro <picture> mobile source 用 mobile_image_url (fallback 原圖)
ALTER TABLE hero_banners ADD COLUMN mobile_image_url TEXT;
