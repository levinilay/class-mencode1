-- ===========================================
-- Class-Man | הדדיות: מוצר לא יופיע בשתי הרשימות
-- הרץ ב-Supabase: SQL Editor → New Query → הדבק והרץ
-- אם מקבל שגיאת תחביר: החלף EXECUTE FUNCTION ב־EXECUTE PROCEDURE
-- ===========================================
-- מונע שמוצר יהיה גם ב-best_seller_ids וגם ב-dont_miss_ids.
-- עדיפות: best_seller_ids – אם מוצר בשתיהן, הוא יישאר רק ב-best_seller_ids.

CREATE OR REPLACE FUNCTION shop_settings_mutual_exclusion()
RETURNS TRIGGER AS $$
BEGIN
  -- הסרת best_seller_ids מ-dont_miss_ids (מוצר שמופיע בשתיהן נשאר רק ב-best_seller_ids)
  NEW.dont_miss_ids := COALESCE(
    (SELECT array_agg(x)
     FROM unnest(COALESCE(NEW.dont_miss_ids, ARRAY[]::bigint[])) x
     WHERE NOT (x = ANY(COALESCE(NEW.best_seller_ids, ARRAY[]::bigint[])))),
    ARRAY[]::bigint[]
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_shop_settings_mutual_exclusion ON shop_settings;
CREATE TRIGGER trg_shop_settings_mutual_exclusion
  BEFORE INSERT OR UPDATE
  ON shop_settings
  FOR EACH ROW
  EXECUTE FUNCTION shop_settings_mutual_exclusion();

-- ניקוי חד-פעמי: הסרת מוצרים מ-dont_miss_ids שמופיעים גם ב-best_seller_ids
UPDATE shop_settings
SET dont_miss_ids = COALESCE(
  (SELECT array_agg(x)
   FROM unnest(COALESCE(dont_miss_ids, ARRAY[]::bigint[])) x
   WHERE NOT (x = ANY(COALESCE(best_seller_ids, ARRAY[]::bigint[])))),
  ARRAY[]::bigint[]
)
WHERE id = 1;
