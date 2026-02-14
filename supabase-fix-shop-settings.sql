-- הרץ ב-Supabase: SQL Editor → New Query → הדבק והרץ
-- מתקן את טבלת shop_settings (עמודת key ועמודות נוספות)

-- אם יש עמודה key עם NOT NULL – מאפשרים null או מגדירים ברירת מחדל
ALTER TABLE shop_settings ALTER COLUMN "key" DROP NOT NULL;
-- אם השם של העמודה עם מקף/תווים: ALTER COLUMN key DROP NOT NULL;

ALTER TABLE shop_settings ADD COLUMN IF NOT EXISTS best_seller_ids BIGINT[] DEFAULT '{}';
ALTER TABLE shop_settings ADD COLUMN IF NOT EXISTS dont_miss_ids BIGINT[] DEFAULT '{}';
ALTER TABLE shop_settings ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- עדכון שורה קיימת (id=1) אם יש כבר רשומה
UPDATE shop_settings SET best_seller_ids = '{}', dont_miss_ids = '{}' WHERE id = 1;

-- אם אין שורת ברירת מחדל – הוספה (רק אם אין רשומה עם id=1)
INSERT INTO shop_settings (id, best_seller_ids, dont_miss_ids)
SELECT 1, '{}', '{}'
WHERE NOT EXISTS (SELECT 1 FROM shop_settings WHERE id = 1);

-- ===========================================
-- אם קיבלת "new row violates row-level security policy"
-- הרץ את הבלוק הזה – מאפשר למשתמשים מחוברים (Auth) גישה:
-- ===========================================
DROP POLICY IF EXISTS "Allow authenticated read settings" ON shop_settings;
DROP POLICY IF EXISTS "Allow authenticated insert settings" ON shop_settings;
DROP POLICY IF EXISTS "Allow authenticated update settings" ON shop_settings;
CREATE POLICY "Allow authenticated read settings" ON shop_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert settings" ON shop_settings FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update settings" ON shop_settings FOR UPDATE TO authenticated USING (true);
