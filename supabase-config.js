/**
 * Supabase Configuration (Frontend only – anon key בלבד)
 * ========================================================
 * מתאים ל־HTTPS (למשל surge.sh). אל תשתמש ב־Service Role Key בדף – רק כאן.
 * הערכים: https://app.supabase.com → Project → Settings → API
 *   - Project URL → SUPABASE_URL
 *   - anon public key → SUPABASE_ANON_KEY
 * אחרי העלאה ל־Surge: ב־Supabase → Authentication → URL Configuration
 *   הגדר Site URL ל־https://האתר-שלך.surge.sh
 */
(function () {
  var url = 'https://jrqixpnsdcghbosxzmli.supabase.co';
  var key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpycWl4cG5zZGNnaGJvc3h6bWxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwNjc3MTAsImV4cCI6MjA4NjY0MzcxMH0.pRtRBw3zb_byNntPv3Zlk7wnnGvu8k4FkKehUf6FRMo';
  window.SUPABASE_URL = (url && typeof url === 'string') ? url.replace(/\/+$/, '') : '';
  window.SUPABASE_ANON_KEY = (key && typeof key === 'string') ? key.trim() : '';
  window.USE_SUPABASE = !!(window.SUPABASE_URL && window.SUPABASE_ANON_KEY);
})();
