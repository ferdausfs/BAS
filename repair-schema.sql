-- Repair script: drops existing public tables so the full schema can be re-applied cleanly.
-- Run this first, then run supabase-schema.sql immediately after.
-- WARNING: This deletes any existing data in these tables. Auth users are NOT affected.

drop table if exists products cascade;
drop table if exists orders cascade;
drop table if exists gallery_items cascade;
drop table if exists reviews cascade;
drop table if exists profiles cascade;
drop table if exists app_settings cascade;
