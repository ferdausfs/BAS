-- BAS2 incremental schema patch for existing Supabase projects
-- Run this AFTER supabase-schema.sql and BEFORE admin-rls-fix.sql

alter table products
  add column if not exists data jsonb;

alter table profiles
  add column if not exists email text,
  add column if not exists is_admin boolean not null default false,
  add column if not exists district text,
  add column if not exists gps_lat double precision,
  add column if not exists gps_lng double precision,
  add column if not exists location_address text,
  add column if not exists location_verified boolean not null default false;

create table if not exists banners (
  id text primary key,
  title text not null default '',
  subtitle text not null default '',
  image text not null,
  tag text not null default 'Shop Now',
  color text not null default '#FFE2E7',
  type text not null default 'new_item' check (type in ('discount', 'new_item', 'notice')),
  promo_code text,
  product_id text references products(id) on delete set null,
  notice_text text,
  link text,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table banners enable row level security;

drop policy if exists "Public read banners" on banners;
create policy "Public read banners" on banners for select using (active = true);

drop policy if exists "Admin manage banners" on banners;
create policy "Admin manage banners" on banners for all to authenticated using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

insert into storage.buckets (id, name, public) values ('banner-images', 'banner-images', true) on conflict do nothing;
insert into storage.buckets (id, name, public) values ('review-images', 'review-images', true) on conflict do nothing;

-- storage.objects policies
-- banner images
 drop policy if exists "Public read banner images" on storage.objects;
create policy "Public read banner images" on storage.objects
  for select using (bucket_id = 'banner-images');

drop policy if exists "Auth upload banner images" on storage.objects;
create policy "Auth upload banner images" on storage.objects
  for insert to authenticated with check (bucket_id = 'banner-images');

-- review images
 drop policy if exists "Public read review images" on storage.objects;
create policy "Public read review images" on storage.objects
  for select using (bucket_id = 'review-images');

drop policy if exists "Auth upload review images" on storage.objects;
create policy "Auth upload review images" on storage.objects
  for insert to authenticated with check (bucket_id = 'review-images');

-- optional seed rows for settings documents used by the app
insert into app_settings (key, value) values
  ('site_settings', '{}'::jsonb),
  ('admin_settings', '{}'::jsonb)
on conflict (key) do nothing;
