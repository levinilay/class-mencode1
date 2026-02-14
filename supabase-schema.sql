-- ===========================================
-- Class-Man | Supabase Schema
-- Run this in Supabase SQL Editor
-- Dashboard → SQL Editor → New Query
-- ===========================================

-- Products table (id, name, price, image, description + extras for full site)
CREATE TABLE IF NOT EXISTS products (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL DEFAULT 0,
  image TEXT DEFAULT '',
  description TEXT DEFAULT '',
  category TEXT DEFAULT 'shirts',
  material TEXT DEFAULT '',
  color TEXT DEFAULT '',
  sizes TEXT DEFAULT 'S, M, L, XL',
  features TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shop settings (best sellers, don't miss) – id must be BIGINT for compatibility
CREATE TABLE IF NOT EXISTS shop_settings (
  id BIGINT PRIMARY KEY DEFAULT 1,
  best_seller_ids BIGINT[] DEFAULT '{}',
  dont_miss_ids BIGINT[] DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default settings row
INSERT INTO shop_settings (id, best_seller_ids, dont_miss_ids)
VALUES (1, '{}', '{}')
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security (optional - allows public read/write with anon key)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_settings ENABLE ROW LEVEL SECURITY;

-- Policies: allow anon read/write (for frontend-only admin)
CREATE POLICY "Allow anon read products" ON products FOR SELECT USING (true);
CREATE POLICY "Allow anon insert products" ON products FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update products" ON products FOR UPDATE USING (true);
CREATE POLICY "Allow anon delete products" ON products FOR DELETE USING (true);

CREATE POLICY "Allow anon read settings" ON shop_settings FOR SELECT USING (true);
CREATE POLICY "Allow anon update settings" ON shop_settings FOR UPDATE USING (true);
CREATE POLICY "Allow anon insert settings" ON shop_settings FOR INSERT WITH CHECK (true);

-- ===========================================
-- אם קיבלת "Could not find best_seller_ids in schema cache"
-- הרץ רק את הבלוק הזה (הטבלה קיימת אבל בלי העמודות):
-- ===========================================
-- ALTER TABLE shop_settings ADD COLUMN IF NOT EXISTS best_seller_ids BIGINT[] DEFAULT '{}';
-- ALTER TABLE shop_settings ADD COLUMN IF NOT EXISTS dont_miss_ids BIGINT[] DEFAULT '{}';
-- ALTER TABLE shop_settings ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
-- INSERT INTO shop_settings (id, best_seller_ids, dont_miss_ids) VALUES (1, '{}', '{}') ON CONFLICT (id) DO NOTHING;
