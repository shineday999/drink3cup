-- mycafe D1 schema — initial migration
-- 計劃書 §5 D1 資料模型(13 表)

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  subcategory TEXT,
  slug TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);

CREATE TABLE IF NOT EXISTS product_translations (
  product_id TEXT NOT NULL,
  locale TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  short_description TEXT,
  story TEXT,
  meta_title TEXT,
  meta_description TEXT,
  PRIMARY KEY (product_id, locale),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS product_variants (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  sku TEXT NOT NULL UNIQUE,
  attributes TEXT NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  weight_grams INTEGER,
  price_base TEXT NOT NULL,
  image_urls TEXT NOT NULL,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS product_prices (
  variant_id TEXT NOT NULL,
  currency TEXT NOT NULL,
  amount INTEGER NOT NULL,
  tax_included INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (variant_id, currency),
  FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  parent_id TEXT,
  slug TEXT NOT NULL,
  display_order INTEGER,
  FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);

CREATE TABLE IF NOT EXISTS category_translations (
  category_id TEXT NOT NULL,
  locale TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  PRIMARY KEY (category_id, locale),
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS quiz_rules (
  id TEXT PRIMARY KEY,
  quiz_type TEXT NOT NULL,
  attributes TEXT NOT NULL,
  product_ids TEXT NOT NULL,
  weights TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_quiz_rules_type ON quiz_rules(quiz_type);

-- 後台管理員
CREATE TABLE IF NOT EXISTS admin_users (
  email TEXT PRIMARY KEY,
  role TEXT NOT NULL DEFAULT 'editor',
  display_name TEXT,
  created_at INTEGER NOT NULL,
  last_login_at INTEGER
);

-- 訂單
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  customer_email TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  shipping_address TEXT NOT NULL,
  locale TEXT NOT NULL,
  items TEXT NOT NULL,
  subtotal INTEGER NOT NULL,
  currency TEXT NOT NULL,
  shipping_fee INTEGER NOT NULL DEFAULT 0,
  total INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_status TEXT NOT NULL DEFAULT 'unpaid',
  notes TEXT,
  tracking_number TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);

-- 部落格文章
CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'draft',
  category TEXT,
  cover_image_url TEXT,
  author_email TEXT,
  published_at INTEGER,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_published ON posts(published_at DESC);

CREATE TABLE IF NOT EXISTS post_translations (
  post_id TEXT NOT NULL,
  locale TEXT NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  body_markdown TEXT NOT NULL,
  meta_title TEXT,
  meta_description TEXT,
  PRIMARY KEY (post_id, locale),
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

-- 評價
CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  order_id TEXT,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  content TEXT NOT NULL,
  image_urls TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  locale TEXT,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);

-- Quiz 結果
CREATE TABLE IF NOT EXISTS quiz_results (
  id TEXT PRIMARY KEY,
  user_email TEXT,
  quiz_type TEXT NOT NULL,
  answers TEXT NOT NULL,
  recommended_product_ids TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_quiz_results_email ON quiz_results(user_email);
CREATE INDEX IF NOT EXISTS idx_quiz_results_type ON quiz_results(quiz_type);

-- 客戶訊息
CREATE TABLE IF NOT EXISTS inquiries (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  locale TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);