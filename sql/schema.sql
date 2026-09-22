-- =========================================================
--  Krunker Resource Hub — Account / Role / Post system
--  Run this entire file in Supabase Dashboard > SQL Editor
--  RERUNNABLE version — safe to run multiple times, won't
--  throw an "already exists" error even if the tables/policies
--  already exist.
-- =========================================================

-- ---------- 1. Table: profiles ----------
-- One row per user, created manually at signup (not via trigger),
-- so all the extra fields (name, date of birth, etc.) are filled in
-- right away.
-- NOTE: birthdate, gender, discord_id, discord_username (and, once you
-- run add_ban_system.sql, ban_reason/banned_at/banned_by) do NOT live
-- here — they go in public.profile_private, a table only the row's
-- owner or staff can read. This table is public-readable (see the
-- policy below), so it only ever holds non-sensitive fields.
-- See sql/fix_security_issues.sql.
create table if not exists public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  username        text unique not null,
  display_name    text not null,
  krunker_username text,
  role            text not null default 'user' check (role in ('user','admin','developer')),
  created_at      timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Everyone (including logged-out visitors) can view basic profile info
-- (needed so a post's author name can be shown in the public feed)
drop policy if exists "profiles_public_read" on public.profiles;
create policy "profiles_public_read"
on public.profiles for select
using (true);

-- Users can only create a profile for themselves, role must be 'user'
drop policy if exists "profiles_insert_self" on public.profiles;
create policy "profiles_insert_self"
on public.profiles for insert
with check (auth.uid() = id and role = 'user');

-- Users can update their own profile, BUT CANNOT change their own role
drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self"
on public.profiles for update
using (auth.uid() = id)
with check (
  auth.uid() = id
  and role = (select role from public.profiles where id = auth.uid())
);

-- Developers can update anyone's profile (including changing role -> admin/dev)
drop policy if exists "profiles_update_by_developer" on public.profiles;
create policy "profiles_update_by_developer"
on public.profiles for update
using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'developer')
)
with check (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'developer')
);


-- ---------- 2. Table: posts ----------
create table if not exists public.posts (
  id          uuid primary key default gen_random_uuid(),
  author_id   uuid not null references public.profiles(id) on delete cascade,
  title       text not null,
  content     text not null,
  status      text not null default 'draft' check (status in ('draft','published')),
  category    text not null default 'crosshair' check (category in (
    'crosshair','crosshair-scope','crosshair-hitmarker',
    'crosshair-overlay-damage','crosshair-overlay-game',
    'crosshair-icons-kill','crosshair-icons-death','crosshair-icons-ammo','crosshair-icons-streak',
    'settings-ready','css-ready',
    'maps-official-infected','maps-official-tdm','maps-custom-parkour',
    'mods-files','scripts-userscript-legal','scripts-userscript-hack','scripts-krunkscript-usable'
  )),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- If the posts table was already created BEFORE the category column
-- existed, just run this (safe to run multiple times):
-- alter table public.posts add column if not exists category text not null default 'crosshair' check (category in (
--   'crosshair','crosshair-scope','crosshair-hitmarker',
--   'crosshair-overlay-damage','crosshair-overlay-game',
--   'crosshair-icons-kill','crosshair-icons-death','crosshair-icons-ammo','crosshair-icons-streak',
--   'settings-ready','css-ready',
--   'maps-official-infected','maps-official-tdm','maps-custom-parkour',
--   'mods-files','scripts-userscript-legal','scripts-userscript-hack','scripts-krunkscript-usable'
-- ));

alter table public.posts enable row level security;

-- Published posts can be read by anyone (including logged-out visitors)
drop policy if exists "posts_public_read_published" on public.posts;
create policy "posts_public_read_published"
on public.posts for select
using (status = 'published');

-- Authors can read their own draft posts
drop policy if exists "posts_owner_read_own" on public.posts;
create policy "posts_owner_read_own"
on public.posts for select
using (auth.uid() = author_id);

-- Admins & developers can read ALL posts (including other users' drafts)
drop policy if exists "posts_staff_read_all" on public.posts;
create policy "posts_staff_read_all"
on public.posts for select
using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','developer'))
);

-- Only logged-in users who already have a profile can create posts,
-- and author_id must be themselves
drop policy if exists "posts_insert_own" on public.posts;
create policy "posts_insert_own"
on public.posts for insert
with check (auth.uid() = author_id);

-- Authors can edit their own posts
drop policy if exists "posts_update_own" on public.posts;
create policy "posts_update_own"
on public.posts for update
using (auth.uid() = author_id)
with check (auth.uid() = author_id);

-- Admins & developers can edit (e.g. publish/unpublish) anyone's posts
drop policy if exists "posts_update_staff" on public.posts;
create policy "posts_update_staff"
on public.posts for update
using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','developer'))
);

-- Authors can delete their own posts
drop policy if exists "posts_delete_own" on public.posts;
create policy "posts_delete_own"
on public.posts for delete
using (auth.uid() = author_id);

-- Admins & developers can delete anyone's posts
drop policy if exists "posts_delete_staff" on public.posts;
create policy "posts_delete_staff"
on public.posts for delete
using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','developer'))
);

-- auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_posts_updated_at on public.posts;
create trigger trg_posts_updated_at
before update on public.posts
for each row execute function public.set_updated_at();

-- =========================================================
-- IMPORTANT NOTES
-- =========================================================
-- 1. The FIRST Developer must be set manually via the SQL Editor, e.g.:
--      update public.profiles set role = 'developer' where username = 'YOUR_USERNAME';
--    Run this AFTER you've signed up your first account through the website.
--    (See also sql/set_developer.sql — already set up for the knlvx_aura account.)
--
-- 2. After that, the Developer can promote/demote Admins through the
--    /community/developer.html page (no more SQL needed).
--
-- 3. The 'developer' role CANNOT be granted from the web panel
--    (deliberately), so no admin can escalate themselves to developer.
--    To add a new developer, run the SQL update above manually.
