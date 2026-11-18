-- Update: Add-to-cart orders. Run once in Supabase → SQL Editor. Safe to re-run.

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_no bigint generated always as identity (start with 1001) unique,
  customer_name text not null,
  phone text not null,
  city text default '',
  address text not null,
  notes text default '',
  items jsonb not null default '[]'::jsonb,   -- [{product_id, name, price, qty, image}]
  total numeric(12,2) not null default 0,
  status text not null default 'new'
    check (status in ('new','confirmed','delivered','cancelled')),
  created_at timestamptz default now()
);
create index if not exists orders_created_idx on public.orders(created_at desc);

alter table public.orders enable row level security;
drop policy if exists "admin all" on public.orders;
create policy "admin all" on public.orders for all using (public.is_admin()) with check (public.is_admin());
-- No public insert policy: customers can only create orders through place_order() below,
-- which takes prices from the products table (a customer cannot change prices).

create or replace function public.place_order(
  p_name text, p_phone text, p_city text, p_address text, p_notes text, p_items jsonb
) returns table (out_order_no bigint, out_total numeric)
language plpgsql security definer set search_path = public
as $$
declare
  v_items jsonb := '[]'::jsonb;
  v_total numeric := 0;
  v_no bigint;
  r record;
begin
  if coalesce(trim(p_name), '') = '' or coalesce(trim(p_phone), '') = '' or coalesce(trim(p_address), '') = '' then
    raise exception 'Name, phone and address are required';
  end if;
  if length(p_name) > 100 or length(p_phone) > 30 or length(p_address) > 500
     or length(coalesce(p_city, '')) > 100 or length(coalesce(p_notes, '')) > 1000 then
    raise exception 'Input is too long';
  end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 or jsonb_array_length(p_items) > 30 then
    raise exception 'Your cart is empty';
  end if;

  for r in
    select p.id, p.name, p.price, p.images[1] as image,
           least(greatest(coalesce((i->>'qty')::int, 1), 1), 20) as qty
    from jsonb_array_elements(p_items) i
    join public.products p on p.id = (i->>'product_id')::uuid
    where p.is_active and p.stock_status <> 'out_of_stock'
  loop
    v_items := v_items || jsonb_build_object('product_id', r.id, 'name', r.name, 'price', r.price, 'qty', r.qty, 'image', r.image);
    v_total := v_total + r.price * r.qty;
  end loop;

  if jsonb_array_length(v_items) = 0 then
    raise exception 'These items are no longer available';
  end if;

  insert into public.orders (customer_name, phone, city, address, notes, items, total)
  values (trim(p_name), trim(p_phone), trim(coalesce(p_city, '')), trim(p_address), trim(coalesce(p_notes, '')), v_items, v_total)
  returning order_no into v_no;

  return query select v_no, v_total;
end;
$$;

grant execute on function public.place_order(text, text, text, text, text, jsonb) to anon, authenticated;

select 'orders ready' as status;
