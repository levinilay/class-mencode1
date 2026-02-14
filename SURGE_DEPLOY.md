# פרסום ב-Surge והתחברות לאדמין

הפרויקט מחובר ל-Supabase **רק עם anon key** (בטוח בדף; אין שימוש ב-Service Role Key).

## 1. העלאה ל-Surge

```bash
cd /path/to/man-class
surge . your-site.surge.sh
```

האתר יהיה זמין ב־`https://your-site.surge.sh`.

## 2. הגדרה ב-Supabase (פעם אחת)

1. **Authentication → URL Configuration**
   - **Site URL**: `https://your-site.surge.sh` (או הכתובת המדויקת של האתר ב-Surge).

2. **Authentication → Providers → Email**
   - כבה **Confirm email** כדי להתחבר בלי אימות אימייל.

3. **Authentication → Users → Add user**
   - **Create new user**: הזן אימייל וסיסמה (תזכור אותם).

## 3. כניסה לאדמין

1. גלוש ל־`https://your-site.surge.sh/admin.html`.
2. הזן את **אותו אימייל וסיסמה** שיצרת ב-Users.
3. לחץ כניסה.

האתר רץ על HTTPS; החיבור ל-Supabase נעשה מהדפדפן עם ה-anon key בלבד.
