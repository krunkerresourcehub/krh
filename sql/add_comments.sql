-- =========================================================
--  Migration: Post Comments
--  Run this ONCE in Supabase Dashboard > SQL Editor.
--  Versi RERUNNABLE — aman dijalankan berkali-kali.
-- =========================================================

create table if not exists public.comments (
  id          uuid primary key default gen_random_uuid(),
  post_id     uuid not null references public.posts(id) on delete cascade,
  author_id   uuid not null references public.profiles(id) on delete cascade,
  content     text not null,
  created_at  timestamptz not null default now()
);

alter table public.comments enable row level security;

-- Anyone (including logged-out visitors) can read comments on a published post
drop policy if exists "comments_public_read" on public.comments;
create policy "comments_public_read"
on public.comments for select
using (
  exists (select 1 from public.posts p where p.id = post_id and p.status = 'published')
);

-- A logged-in user can comment on a published post, only as themselves,
-- and only if they're not banned.
drop policy if exists "comments_insert_own" on public.comments;
create policy "comments_insert_own"
on public.comments for insert
with check (
  auth.uid() = author_id
  and not coalesce((select banned from public.profiles where id = auth.uid()), false)
  and exists (select 1 from public.posts p where p.id = post_id and p.status = 'published')
);

-- A user can delete their own comment
drop policy if exists "comments_delete_own" on public.comments;
create policy "comments_delete_own"
on public.comments for delete
using (auth.uid() = author_id);

-- Admin & developer can delete any comment (moderation)
drop policy if exists "comments_delete_staff" on public.comments;
create policy "comments_delete_staff"
on public.comments for delete
using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','developer'))
);

-- Helpful index for loading a post's comments in order
create index if not exists comments_post_id_created_at_idx
  on public.comments (post_id, created_at);
