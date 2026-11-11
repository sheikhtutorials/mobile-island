-- =====================================================================
-- Mobile Island — database schema, security policies, storage & seed
-- Run this whole file once in Supabase → SQL Editor → New query → Run
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------- Admins (who may use /admin) ----------
create table if not exists public.admins (
  email text primary key,
  created_at timestamptz default now()
);

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.admins
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

-- ---------- Site settings (single row, id = 1) ----------
create table if not exists public.settings (
  id int primary key default 1 check (id = 1),
  site_name text not null default 'Mobile Island',
  tagline text default '',
  logo_url text default '',
  phone text default '',
  whatsapp text default '',            -- digits with country code, e.g. 923001234567
  email text default '',
  address text default '',
  map_embed_url text default '',       -- Google Maps "Embed a map" src URL
  instagram_url text default '',
  facebook_url text default '',
  tiktok_url text default '',
  opening_hours text default '',
  currency text default 'Rs.',
  whatsapp_message text default 'Hi! I want to order: {product} ({price})',
  about_title text default 'About Us',
  about_content text default '',
  about_image_url text default '',
  featured_title text default 'Featured Phones',
  footer_text text default '',
  footer_credit text default '',
  updated_at timestamptz default now()
);

-- ---------- Categories ----------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- ---------- Brands ----------
create table if not exists public.brands (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  logo_url text default '',
  sort_order int default 0,
  created_at timestamptz default now()
);

-- ---------- Products ----------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  brand_id uuid references public.brands(id) on delete set null,
  category_id uuid references public.categories(id) on delete set null,
  short_description text default '',
  description text default '',
  price numeric(12,2) not null default 0,
  compare_price numeric(12,2),
  stock_status text not null default 'in_stock'
    check (stock_status in ('in_stock','low_stock','out_of_stock','pre_order')),
  is_featured boolean default false,
  is_active boolean default true,
  images text[] default '{}',
  specs jsonb default '[]'::jsonb,     -- [{ "label": "RAM", "value": "8 GB" }, ...]
  sort_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists products_brand_idx on public.products(brand_id);
create index if not exists products_category_idx on public.products(category_id);

-- ---------- Homepage banners ----------
create table if not exists public.banners (
  id uuid primary key default gen_random_uuid(),
  title text default '',
  subtitle text default '',
  image_url text default '',
  cta_text text default '',
  cta_link text default '',
  sort_order int default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- ---------- Row Level Security ----------
alter table public.admins     enable row level security;
alter table public.settings   enable row level security;
alter table public.categories enable row level security;
alter table public.brands     enable row level security;
alter table public.products   enable row level security;
alter table public.banners    enable row level security;

do $$
declare t text;
begin
  foreach t in array array['settings','categories','brands','banners'] loop
    execute format('drop policy if exists "public read" on public.%I', t);
    execute format('create policy "public read" on public.%I for select using (true)', t);
    execute format('drop policy if exists "admin write" on public.%I', t);
    execute format('create policy "admin write" on public.%I for all using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $$;

drop policy if exists "public read" on public.products;
create policy "public read" on public.products for select using (is_active or public.is_admin());
drop policy if exists "admin write" on public.products;
create policy "admin write" on public.products for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin read self" on public.admins;
create policy "admin read self" on public.admins for select using (public.is_admin());

-- ---------- Storage bucket for images ----------
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do update set public = true;

drop policy if exists "media public read" on storage.objects;
create policy "media public read" on storage.objects for select using (bucket_id = 'media');
drop policy if exists "media admin insert" on storage.objects;
create policy "media admin insert" on storage.objects for insert with check (bucket_id = 'media' and public.is_admin());
drop policy if exists "media admin update" on storage.objects;
create policy "media admin update" on storage.objects for update using (bucket_id = 'media' and public.is_admin());
drop policy if exists "media admin delete" on storage.objects;
create policy "media admin delete" on storage.objects for delete using (bucket_id = 'media' and public.is_admin());

-- =====================================================================
-- SEED DATA (safe to re-run)
-- =====================================================================
insert into public.settings (id, site_name, tagline, phone, whatsapp, email, address,
  map_embed_url, instagram_url, facebook_url, opening_hours, currency,
  about_title, about_content, footer_text, footer_credit)
values (1, 'Mobile Island', 'Latest smartphones. Best prices. Genuine warranty.',
  '+92 300 1234567', '923001234567', 'info@mobileisland.pk',
  'Shop #12, Main Boulevard, Lahore, Pakistan',
  'https://www.google.com/maps?q=Lahore%20Pakistan&output=embed',
  'https://instagram.com/', 'https://facebook.com/', 'Mon – Sat: 11am – 10pm',
  'Rs.', 'About Mobile Island',
  E'Mobile Island is your trusted destination for brand-new and PTA-approved smartphones.\n\nWe stock the latest devices from Apple, Samsung, Xiaomi and more, with official warranty, honest prices and friendly after-sales support. Order on WhatsApp and get fast delivery across the country.',
  'Genuine phones • Official warranty • Nationwide delivery',
  'M. Khizar Khan — BCS-M/SP-24/01')
on conflict (id) do nothing;

insert into public.categories (name, slug, sort_order) values
  ('Flagship', 'flagship', 1),
  ('Mid-Range', 'mid-range', 2),
  ('Budget', 'budget', 3)
on conflict (slug) do nothing;

insert into public.brands (name, slug, sort_order) values
  ('Apple', 'apple', 1),
  ('Samsung', 'samsung', 2),
  ('Xiaomi', 'xiaomi', 3),
  ('Infinix', 'infinix', 4)
on conflict (slug) do nothing;

insert into public.banners (title, subtitle, image_url, cta_text, cta_link, sort_order)
select * from (values
  ('New Arrivals Are Here', 'Flagship phones with official warranty — order on WhatsApp in seconds.', '/seed/banner-1.svg', 'Shop Now', '/products', 1),
  ('Big Savings on Mid-Range', 'Powerful phones that won''t break the bank.', '/seed/banner-2.svg', 'View Deals', '/products?category=mid-range', 2)
) as v(title, subtitle, image_url, cta_text, cta_link, sort_order)
where not exists (select 1 from public.banners);

insert into public.products (name, slug, brand_id, category_id, short_description, description,
  price, compare_price, stock_status, is_featured, images, specs, sort_order)
select v.name, v.slug, b.id, c.id, v.short_description, v.description, v.price, v.compare_price,
  v.stock_status, v.is_featured, v.images, v.specs::jsonb, v.sort_order
from (values
  ('iPhone 15 Pro Max', 'iphone-15-pro-max', 'apple', 'flagship',
   'Titanium design, A17 Pro chip, 5x telephoto.',
   'The most powerful iPhone yet with a lightweight titanium design, A17 Pro chip and a pro camera system with 5x optical zoom.',
   449999, 479999, 'in_stock', true, array['/seed/phone-1.svg'],
   '[{"label":"Display","value":"6.7\" Super Retina XDR, 120Hz"},{"label":"Chip","value":"A17 Pro"},{"label":"Storage","value":"256 GB"},{"label":"Camera","value":"48MP + 12MP + 12MP"},{"label":"Battery","value":"4441 mAh"},{"label":"PTA","value":"Approved"}]', 1),
  ('Samsung Galaxy S24 Ultra', 'samsung-galaxy-s24-ultra', 'samsung', 'flagship',
   'Galaxy AI, built-in S Pen, 200MP camera.',
   'Unleash new levels of creativity with Galaxy AI, a 200MP camera and the built-in S Pen, all in a titanium frame.',
   399999, 429999, 'in_stock', true, array['/seed/phone-2.svg'],
   '[{"label":"Display","value":"6.8\" Dynamic AMOLED 2X, 120Hz"},{"label":"Chip","value":"Snapdragon 8 Gen 3"},{"label":"RAM / Storage","value":"12 GB / 256 GB"},{"label":"Camera","value":"200MP + 50MP + 12MP + 10MP"},{"label":"Battery","value":"5000 mAh"},{"label":"PTA","value":"Approved"}]', 2),
  ('Xiaomi 14', 'xiaomi-14', 'xiaomi', 'flagship',
   'Leica optics in a compact flagship.',
   'Compact flagship co-engineered with Leica, featuring Snapdragon 8 Gen 3 and 90W HyperCharge.',
   219999, null, 'low_stock', true, array['/seed/phone-3.svg'],
   '[{"label":"Display","value":"6.36\" AMOLED, 120Hz"},{"label":"Chip","value":"Snapdragon 8 Gen 3"},{"label":"RAM / Storage","value":"12 GB / 256 GB"},{"label":"Camera","value":"50MP Leica triple"},{"label":"Battery","value":"4610 mAh, 90W"}]', 3),
  ('Samsung Galaxy A55', 'samsung-galaxy-a55', 'samsung', 'mid-range',
   'Awesome display, metal frame, IP67.',
   'A premium mid-ranger with a metal frame, IP67 water resistance and a vivid Super AMOLED display.',
   129999, 139999, 'in_stock', true, array['/seed/phone-4.svg'],
   '[{"label":"Display","value":"6.6\" Super AMOLED, 120Hz"},{"label":"Chip","value":"Exynos 1480"},{"label":"RAM / Storage","value":"8 GB / 256 GB"},{"label":"Camera","value":"50MP + 12MP + 5MP"},{"label":"Battery","value":"5000 mAh"}]', 4),
  ('Redmi Note 13 Pro', 'redmi-note-13-pro', 'xiaomi', 'mid-range',
   '200MP camera and 67W turbo charging.',
   'Flagship-level 200MP camera, 1.5K AMOLED display and 67W turbo charging at a mid-range price.',
   84999, null, 'pre_order', true, array['/seed/phone-5.svg'],
   '[{"label":"Display","value":"6.67\" 1.5K AMOLED, 120Hz"},{"label":"Chip","value":"Snapdragon 7s Gen 2"},{"label":"RAM / Storage","value":"8 GB / 256 GB"},{"label":"Camera","value":"200MP + 8MP + 2MP"},{"label":"Battery","value":"5100 mAh, 67W"}]', 5),
  ('Infinix Hot 40', 'infinix-hot-40', 'infinix', 'budget',
   'Big battery, big screen, small price.',
   'Everyday performance with a 6.78" 90Hz display, 5000 mAh battery and 33W fast charging.',
   38999, 42999, 'out_of_stock', false, array['/seed/phone-6.svg'],
   '[{"label":"Display","value":"6.78\" FHD+, 90Hz"},{"label":"Chip","value":"Helio G88"},{"label":"RAM / Storage","value":"8 GB / 256 GB"},{"label":"Camera","value":"50MP AI"},{"label":"Battery","value":"5000 mAh, 33W"}]', 6)
) as v(name, slug, brand_slug, category_slug, short_description, description, price, compare_price,
       stock_status, is_featured, images, specs, sort_order)
join public.brands b on b.slug = v.brand_slug
join public.categories c on c.slug = v.category_slug
on conflict (slug) do nothing;

-- =====================================================================
-- FINAL STEP: make yourself an admin (use the email of the user you
-- create in Authentication → Users). Uncomment, edit and run:
-- insert into public.admins (email) values ('you@example.com');
-- =====================================================================
