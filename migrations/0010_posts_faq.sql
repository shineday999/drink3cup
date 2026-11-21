-- Wave 37.1: per-post FAQ JSON-LD (4 locale template)
ALTER TABLE posts ADD COLUMN faq TEXT DEFAULT '{}';
