-- Secure admin access for BAS2
-- Run this AFTER supabase-schema.sql and bas2-supabase-patch.sql

alter table profiles
  add column if not exists is_admin boolean not null default false,
  add column if not exists email text,
  add column if not exists district text,
  add column if not exists gps_lat double precision,
  add column if not exists gps_lng double precision,
  add column if not exists location_address text,
  add column if not exists location_verified boolean not null default false;

create or replace function public.is_admin_user()
returns boolean as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid() and is_admin = true
  );
$$ language sql security definer stable set search_path = public;

-- products
alter table public.products enable row level security;
drop policy if exists "Public read approved products" on public.products;
create policy "Public read approved products" on public.products
  for select using (approved = true or public.is_admin_user());

drop policy if exists "Admin manage products" on public.products;
create policy "Admin manage products" on public.products
  for all to authenticated
  using (public.is_admin_user())
  with check (public.is_admin_user());

-- orders
alter table public.orders enable row level security;
drop policy if exists "Anyone place order" on public.orders;
create policy "Anyone place order" on public.orders
  for insert with check (true);

drop policy if exists "Users read own orders" on public.orders;
create policy "Users read own orders" on public.orders
  for select to authenticated
  using (user_id = auth.uid() or public.is_admin_user());

drop policy if exists "Admin update orders" on public.orders;
create policy "Admin update orders" on public.orders
  for update to authenticated
  using (public.is_admin_user())
  with check (public.is_admin_user());

-- gallery
alter table public.gallery_items enable row level security;
drop policy if exists "Public read gallery" on public.gallery_items;
create policy "Public read gallery" on public.gallery_items for select using (true);

drop policy if exists "Admin manage gallery" on public.gallery_items;
create policy "Admin manage gallery" on public.gallery_items
  for all to authenticated
  using (public.is_admin_user())
  with check (public.is_admin_user());

-- banners
alter table public.banners enable row level security;
drop policy if exists "Public read banners" on public.banners;
create policy "Public read banners" on public.banners
  for select using (active = true or public.is_admin_user());

drop policy if exists "Admin manage banners" on public.banners;
create policy "Admin manage banners" on public.banners
  for all to authenticated
  using (public.is_admin_user())
  with check (public.is_admin_user());

-- reviews
alter table public.reviews enable row level security;
drop policy if exists "Public read approved reviews" on public.reviews;
create policy "Public read approved reviews" on public.reviews
  for select using (approved = true or public.is_admin_user());

drop policy if exists "Auth insert review" on public.reviews;
create policy "Auth insert review" on public.reviews
  for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Admin manage reviews" on public.reviews;
create policy "Admin manage reviews" on public.reviews
  for all to authenticated
  using (public.is_admin_user())
  with check (public.is_admin_user());

-- profiles
alter table public.profiles enable row level security;
drop policy if exists "Users read own profile" on public.profiles;
create policy "Users read own profile" on public.profiles
  for select to authenticated
  using (auth.uid() = id or public.is_admin_user());

drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile" on public.profiles
  for update to authenticated
  using (auth.uid() = id or public.is_admin_user())
  with check (auth.uid() = id or public.is_admin_user());

drop policy if exists "Users insert own profile" on public.profiles;
create policy "Users insert own profile" on public.profiles
  for insert to authenticated
  with check (auth.uid() = id or public.is_admin_user());

-- app settings
alter table public.app_settings enable row level security;
drop policy if exists "Public read settings" on public.app_settings;
create policy "Public read settings" on public.app_settings
  for select to anon, authenticated using (true);

drop policy if exists "Admin update settings" on public.app_settings;
create policy "Admin update settings" on public.app_settings
  for all to authenticated
  using (public.is_admin_user())
  with check (public.is_admin_user());

-- storage buckets
 drop policy if exists "Auth upload product images" on storage.objects;
create policy "Auth upload product images" on storage.objects
  for insert to authenticated with check (bucket_id = 'product-images' and public.is_admin_user());

 drop policy if exists "Auth upload gallery images" on storage.objects;
create policy "Auth upload gallery images" on storage.objects
  for insert to authenticated with check (bucket_id = 'gallery' and public.is_admin_user());

 drop policy if exists "Auth upload banner images" on storage.objects;
create policy "Auth upload banner images" on storage.objects
  for insert to authenticated with check (bucket_id = 'banner-images' and public.is_admin_user());

 drop policy if exists "Auth upload review images" on storage.objects;
create policy "Auth upload review images" on storage.objects
  for insert to authenticated with check (bucket_id = 'review-images');

 drop policy if exists "Auth upload payment screenshots" on storage.objects;
create policy "Auth upload payment screenshots" on storage.objects
  for insert to anon, authenticated with check (bucket_id = 'payment-screenshots');

 drop policy if exists "Admin read payment screenshots" on storage.objects;
create policy "Admin read payment screenshots" on storage.objects
  for select to authenticated using (bucket_id = 'payment-screenshots' and public.is_admin_user());
