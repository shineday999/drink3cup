-- cnamber-store products.faq column
-- 2026-10-04 Wave 36 Phase 2.4.c: per-product FAQ JSON for FAQPage structured data
ALTER TABLE products ADD COLUMN faq TEXT DEFAULT '{}';
