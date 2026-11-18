-- Update: adds "Our Mission" / "Our Vision" to the About page and sets the social links.
-- Run once in Supabase → SQL Editor. Safe to re-run.

alter table public.settings add column if not exists mission_title text default 'Our Mission';
alter table public.settings add column if not exists mission_content text default '';
alter table public.settings add column if not exists vision_title text default 'Our Vision';
alter table public.settings add column if not exists vision_content text default '';

update public.settings set
  whatsapp       = '923022367656',
  facebook_url   = 'https://www.facebook.com/share/19rasTYDNP/',
  instagram_url  = 'https://www.instagram.com/mobile_island_offical',
  mission_title  = 'Our Mission',
  mission_content = 'To make the latest smartphones easy and affordable for everyone — with 100% genuine, PTA-approved phones, honest prices, official warranty and after-sales support you can count on. Ordering should be as simple as sending a WhatsApp message.',
  vision_title   = 'Our Vision',
  vision_content = 'To become Pakistan''s most trusted mobile phone destination — known for authenticity, transparent pricing and caring customer service, both in our shop and online.'
where id = 1;

select whatsapp, facebook_url, instagram_url, mission_title, vision_title from public.settings;
