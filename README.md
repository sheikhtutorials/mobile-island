# Mobile Island — Mobile Phone Shop

Next.js 16 (App Router) + Tailwind CSS v4 + Supabase (Postgres, Auth, Storage).
Every piece of content on the site is edited from `/admin`: products, categories, brands, banners, prices, stock and site settings.

## 1. Supabase setup
1. Create a project at https://supabase.com (pick the region closest to your customers). Save the database password somewhere safe.
2. **SQL Editor → New query** → paste all of `supabase/schema.sql` → **Run**.
   This creates the tables, security rules, the public `media` storage bucket and the seed data (6 phones, 3 categories, 4 brands, 2 banners, settings).
3. **Authentication → Users → Add user → Create new user**: enter your email and password and tick *Auto Confirm User*.
4. Back in the SQL Editor, make that user an admin:
   ```sql
   insert into public.admins (email) values ('you@example.com');
   ```
5. (Recommended) **Authentication → Sign In / Providers → Email**: turn off *Allow new users to sign up*.
   Even with sign-up on, only emails in `admins` can change anything.
6. **Project Settings → API**: copy the **Project URL** and the **anon public** key.

## 2. Run locally
```bash
cp .env.example .env.local   # then paste your URL + anon key
npm install
npm run dev                  # http://localhost:3000  (admin: /admin)
```

## 3. Push to GitHub
Create an empty repo on github.com (no README), then:
```bash
git remote add origin https://github.com/<you>/mobile-island.git
git push -u origin main
```

## 4. Deploy on Vercel
1. https://vercel.com/new → import the GitHub repo (framework: Next.js is detected automatically).
2. Under **Environment Variables**, add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Click **Deploy**. Every later `git push` redeploys the site.
4. In Supabase → **Authentication → URL Configuration**, set *Site URL* to your Vercel URL.

## Notes
- Seed images live in `public/seed/`. Replace them by uploading real photos in the admin panel.
- WhatsApp number in Settings: digits only, with the country code (e.g. `923001234567`).
- Map: on Google Maps, open **Share → Embed a map** and paste only the `src` URL into Settings.
