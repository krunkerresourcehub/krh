-- =========================================================
--  Migration: Comment Replies, Comment Reactions & Notifications (Inbox)
--  Run this ONCE in Supabase Dashboard > SQL Editor.
--  Versi RERUNNABLE — aman dijalankan berkali-kali.
-- =========================================================

-- ---------- 1. Comment replies (threaded comments) ----------
alter table public.comments
  add column if not exists parent_id uuid references public.comments(id) on delete cascade;

create index if not exists comments_parent_id_idx on public.comments (parent_id);

-- ---------- 2. Comment likes / dislikes ----------
create table if not exists public.comment_reactions (
  id          uuid primary key default gen_random_uuid(),
  comment_id  uuid not null references public.comments(id) on delete cascade,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  type        text not null check (type in ('like','dislike')),
  created_at  timestamptz not null default now(),
  unique (comment_id, user_id)
);

alter table public.comment_reactions enable row level security;

drop policy if exists "comment_reactions_public_read" on public.comment_reactions;
create policy "comment_reactions_public_read"
on public.comment_reactions for select
using (true);

-- Only as yourself, and only if you're not banned.
-- (Defined here directly, not just re-applied later by add_ban_system.sql,
--  so it survives even if this file is re-run after add_ban_system.sql.)
drop policy if exists "comment_reactions_insert_own" on public.comment_reactions;
create policy "comment_reactions_insert_own"
on public.comment_reactions for insert
with check (
  auth.uid() = user_id
  and not coalesce((select banned from public.profiles where id = auth.uid()), false)
);

drop policy if exists "comment_reactions_update_own" on public.comment_reactions;
create policy "comment_reactions_update_own"
on public.comment_reactions for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "comment_reactions_delete_own" on public.comment_reactions;
create policy "comment_reactions_delete_own"
on public.comment_reactions for delete
using (auth.uid() = user_id);

create index if not exists comment_reactions_comment_id_idx on public.comment_reactions (comment_id);

-- ---------- 3. Notifications (the "inbox") ----------
create table if not exists public.notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade, -- recipient
  type        text not null check (type in (
    'post_like','post_dislike','post_comment',
    'comment_reply','comment_like','comment_dislike',
    'post_edited','post_deleted','warned'
  )),
  actor_id    uuid references public.profiles(id) on delete set null, -- who triggered it
  post_id     uuid references public.posts(id) on delete set null,
  post_title  text, -- snapshot, so the notification still makes sense after a post is deleted
  comment_id  uuid references public.comments(id) on delete set null,
  reason      text, -- edit/delete reason, or the warning message
  read        boolean not null default false,
  created_at  timestamptz not null default now()
);

alter table public.notifications enable row level security;

-- You can only read your own inbox
drop policy if exists "notifications_read_own" on public.notifications;
create policy "notifications_read_own"
on public.notifications for select
using (auth.uid() = user_id);

-- Anyone logged in can generate an ordinary notification (like, dislike,
-- comment, reply) for someone else, but only as themselves as the actor.
-- The moderation types (post_edited / post_deleted / warned) can only be
-- inserted by an admin or developer, so a regular user can never spoof a
-- fake staff warning into someone else's inbox.
drop policy if exists "notifications_insert_scoped" on public.notifications;
create policy "notifications_insert_scoped"
on public.notifications for insert
with check (
  (actor_id is null or actor_id = auth.uid())
  and (
    type in ('post_like','post_dislike','post_comment','comment_reply','comment_like','comment_dislike')
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','developer'))
  )
);

-- Recipient can mark their own notifications read / delete them
drop policy if exists "notifications_update_own" on public.notifications;
create policy "notifications_update_own"
on public.notifications for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "notifications_delete_own" on public.notifications;
create policy "notifications_delete_own"
on public.notifications for delete
using (auth.uid() = user_id);

create index if not exists notifications_user_id_created_at_idx
  on public.notifications (user_id, created_at desc);
