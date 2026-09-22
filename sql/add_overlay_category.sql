-- =========================================================
--  Migration: Crosshair > Overlay (Damage / Game) + Icons
--  (Kill, Death, Ammo, Streak Counter)
--
--  Run this ONCE in Supabase Dashboard > SQL Editor.
--  RERUNNABLE version — safe to run multiple times.
--
--  All these sections use a single image upload per post via
--  community/image-section.html, so the image goes into the
--  `crosshairs` bucket that already exists. If that bucket
--  hasn't been created yet, also run sql/add_crosshair_storage.sql.
-- =========================================================

-- Widen the allowed category list so the new sections pass the check.
alter table public.posts drop constraint if exists posts_category_check;

alter table public.posts
  add constraint posts_category_check check (category in (
    'crosshair','crosshair-scope','crosshair-hitmarker',
    'crosshair-overlay-damage','crosshair-overlay-game',
    'crosshair-icons-kill','crosshair-icons-death','crosshair-icons-ammo','crosshair-icons-streak',
    'settings-ready','css-ready',
    'maps-official-infected','maps-official-tdm','maps-custom-parkour',
    'mods-files','scripts-userscript-legal','scripts-userscript-hack','scripts-krunkscript-usable'
  ));

-- Make sure the image bucket used by these sections exists and is public.
insert into storage.buckets (id, name, public)
values ('crosshairs', 'crosshairs', true)
on conflict (id) do update
set public = true;
