-- Run this if your `posts` table already exists. This widens/updates the
-- `category` constraint to allow posting under Crosshair, Ready Settings,
-- Ready CSS, the Maps sub-sections, Mods Files, and the Scripts
-- sub-sections (including the newer Usable KrunkScripts) — and drops the
-- old 'general' category entirely.
--
-- Safe to run again any time the allowed category list changes — every
-- step here is idempotent.

-- 1. Make sure the column exists at all (no-op if it's already there).
alter table public.posts
  add column if not exists category text not null default 'crosshair';

-- 2. Migrate any existing 'general' posts to 'crosshair' before we forbid
--    the value (skip this line if you'd rather delete them instead).
update public.posts set category = 'crosshair' where category = 'general';

-- 3. Change the column default (new posts always send an explicit
--    category anyway, so this is mostly a formality).
alter table public.posts alter column category set default 'crosshair';

-- 4. Drop the old constraint (name may differ — check with \d posts in
--    Supabase SQL editor if this doesn't match; it's usually
--    "<table>_<column>_check").
alter table public.posts drop constraint if exists posts_category_check;

-- 5. Re-add it with the full list of allowed categories ('general' removed,
--    'scripts-krunkscript-usable' added).
alter table public.posts
  add constraint posts_category_check check (category in (
    'crosshair','crosshair-scope','crosshair-hitmarker',
    'crosshair-overlay-damage','crosshair-overlay-game',
    'crosshair-icons-kill','crosshair-icons-death','crosshair-icons-ammo','crosshair-icons-streak',
    'settings-ready','css-ready',
    'maps-official-infected','maps-official-tdm','maps-custom-parkour',
    'mods-files','scripts-userscript-legal','scripts-userscript-hack','scripts-krunkscript-usable'
  ));
