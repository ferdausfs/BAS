-- Repair orders table + RLS policies from scratch
-- WARNING: This deletes any existing orders data.

drop table if exists orders cascade;

create table orders (
  id text primary key,
  user_id uuid references auth.users(id),
  customer_name text not null,
  customer_phone text not null,
  customer_address text not null,
  delivery_date text not null,
  delivery_time text not null,
  payment_method text not null default 'cod',
  payment_screenshot text,
  items jsonb not null default '[]',
  subtotal integer not null default 0,
  discount integer not null default 0,
  delivery_fee integer not null default 60,
  total integer not null default 0,
  status text not null default 'pending',
  promo_code text,
  created_at timestamptz not null default now(),
  district text,
  gps_lat double precision,
  gps_lng double precision,
  location_address text,
  location_verified boolean default false
);

create index idx_orders_district on orders(district);
create index idx_orders_created_at on orders(created_at desc);

alter table orders enable row level security;

create policy "Anyone place order" on orders for insert to anon, authenticated with check (true);
create policy "Users read own orders" on orders for select to authenticated using (true);
create policy "Admin update orders" on orders for update to authenticated using (true);
