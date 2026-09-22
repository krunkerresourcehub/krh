-- =========================================================
--  Migration: Profile Bio & Follow System
--  Run this ONCE in Supabase Dashboard > SQL Editor.
--  Versi RERUNNABLE — aman dijalankan berkali-kali.
-- =========================================================

-- ---------- 1. Bio field ----------
alter table public.profiles add column if not exists bio text;

-- ---------- 2. Follows ----------
create table if not exists public.follows (
  id            uuid primary key default gen_random_uuid(),
  follower_id   uuid not null references public.profiles(id) on delete cascade, -- who's following
  following_id  uuid not null references public.profiles(id) on delete cascade, -- who's being followed
  created_at    timestamptz not null default now(),
  unique (follower_id, following_id),
  check (follower_id <> following_id) -- can't follow yourself
);

alter table public.follows enable row level security;

-- Follower/following lists and counts are public, like Instagram.
drop policy if exists "follows_public_read" on public.follows;
create policy "follows_public_read"
on public.follows for select
using (true);

-- Only as yourself, and only if you're not banned.
drop policy if exists "follows_insert_own" on public.follows;
create policy "follows_insert_own"
on public.follows for insert
with check (
  auth.uid() = follower_id
  and not coalesce((select banned from public.profiles where id = auth.uid()), false)
);

-- Unfollow — only your own follow row.
drop policy if exists "follows_delete_own" on public.follows;
create policy "follows_delete_own"
on public.follows for delete
using (auth.uid() = follower_id);

create index if not exists follows_follower_id_idx on public.follows (follower_id);
create index if not exists follows_following_id_idx on public.follows (following_id);

-- ---------- 3. New notification type: someone followed you ----------
alter table public.notifications drop constraint if exists notifications_type_check;
alter table public.notifications add constraint notifications_type_check check (type in (
  'post_like','post_dislike','post_comment',
  'comment_reply','comment_like','comment_dislike',
  'post_edited','post_deleted','warned','banned','unbanned','new_follower'
));

drop policy if exists "notifications_insert_scoped" on public.notifications;
create policy "notifications_insert_scoped"
on public.notifications for insert
with check (
  (actor_id is null or actor_id = auth.uid())
  and (
    type in ('post_like','post_dislike','post_comment','comment_reply','comment_like','comment_dislike','new_follower')
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','developer'))
  )
);
