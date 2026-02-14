# Class-Man | Supabase Setup Guide

This guide explains how to connect your Class-Man e-commerce site to Supabase for product storage. The site works in two modes:

- **Supabase mode**: When `SUPABASE_URL` and `SUPABASE_ANON_KEY` are set in `supabase-config.js`
- **localStorage mode**: When config is empty (fallback, no backend)

---

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/log in
2. Click **New Project**
3. Choose a name, password, and region
4. Wait for the project to be created

---

## 2. Get Your Credentials

1. In the Supabase dashboard, go to **Settings** → **API**
2. Copy:
   - **Project URL** (e.g. `https://abcdefgh.supabase.co`)
   - **anon public** key (under "Project API keys")

---

## 3. Configure the Site

Open `supabase-config.js` and replace the empty values:

```javascript
// REPLACE with your Supabase project URL
window.SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co';

// REPLACE with your Supabase anon/public key
window.SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

---

## 4. Create the Database Tables

1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Paste the contents of `supabase-schema.sql`
4. Click **Run**

This creates:
- `products` table: id, name, price, image, description, category, material, color, sizes, features
- `shop_settings` table: best sellers and "don't miss" product IDs

---

## 5. Files Modified

| File | Changes |
|------|---------|
| `supabase-config.js` | **NEW** – Supabase URL and anon key |
| `supabase-products.js` | **NEW** – Supabase CRUD layer |
| `supabase-schema.sql` | **NEW** – SQL to create tables |
| `products.js` | Uses Supabase when config is set; falls back to localStorage |
| `admin.js` | Async add/edit/delete; init from Supabase; loading states |
| `admin-category.js` | Async CRUD; init from Supabase; loading states |
| `admin-categories.js` | Init from Supabase; loading state |
| `shop.js` | Init from Supabase before rendering products |
| `categories.js` | Init from Supabase before rendering |
| `category.js` | Init from Supabase before rendering |
| `product.js` | Init from Supabase before rendering product detail |
| `index.html`, `admin.html`, `categories.html`, `category.html`, `product.html`, `admin-categories.html`, `admin-category.html` | Added script tags for Supabase |
| `admin-styles.css` | Added `.loading` styles |

---

## 6. Script Load Order (in HTML)

```html
<script src="supabase-config.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="supabase-products.js"></script>
<script src="products.js"></script>
<!-- ... other scripts ... -->
```

---

## 7. Surge Hosting

The site is fully static and works with Surge:

```bash
surge ./man-class your-site.surge.sh
```

Supabase runs in the cloud, so no server is needed. The browser loads products from Supabase on each page visit.

---

## 8. Admin Panel & Supabase Auth

If your `products` table has RLS policies that require `auth.role() = 'authenticated'`:

1. **Create an Admin User in Supabase**:
   - In Supabase dashboard, go to **Authentication** → **Users**
   - Click **Add user** → **Create new user**
   - Enter email and password (e.g. `admin@classman.co.il` / your chosen password)

2. **Log in to Admin Panel**:
   - Open `admin.html`
   - Enter the **email** and **password** you created in Supabase
   - The site uses Supabase Auth – after sign-in, insert/update/delete will work

3. **Without Supabase Auth** (localStorage mode or public RLS):
   - Only the password field is shown; use the password in `admin.js` (e.g. `4934988`)

---

## 9. Troubleshooting

- **Products not loading**: Check the browser console (F12) for errors. Ensure Supabase URL and key are correct.
- **CORS errors**: Supabase allows browser requests by default. If you see CORS errors, verify your project URL.
- **Empty products**: Run the SQL schema in Supabase. Add products via the Admin Panel.
- **Fallback to localStorage**: If `SUPABASE_URL` or `SUPABASE_ANON_KEY` is empty, the site uses localStorage and no backend.
- **Insert requires auth**: If you get "INSERT policy requires auth.role() = 'authenticated'", create an admin user in Supabase Auth (Authentication → Users) and log in with that email/password on admin.html.
