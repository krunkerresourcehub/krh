-- =========================================================
--  Migration: Account Ban System
--  Run this ONCE in Supabase Dashboard > SQL Editor.
--  Versi RERUNNABLE — aman dijalankan berkali-kali.
--
--  Only the 'developer' role can ban/unban (enforced below by reusing
--  the existing "profiles_update_by_developer" policy, which already
--  restricts full-profile updates to role = 'developer' only — admins
--  cannot ban/unban).
-- =========================================================

-- ---------- 1. Ban fields on profiles ----------
alter table public.profiles add column if not exists banned boolean not null default false;
alter table public.profiles add column if not exists ban_reason text;
alter table public.profiles add column if not exists banned_at timestamptz;
alter table public.profiles add column if not exists banned_by uuid references public.profiles(id) on delete set null;

-- Widen the notifications type list so bans get their own clear message
-- instead of being lumped in with generic 'warned' notices.
alter table public.notifications drop constraint if exists notifications_type_check;
alter table public.notifications add constraint notifications_type_check check (type in (
  'post_like','post_dislike','post_comment',
  'comment_reply','comment_like','comment_dislike',
  'post_edited','post_deleted','warned','banned','unbanned'
));

-- ---------- 2. Block a banned account from doing ANYTHING that writes data ----------
-- (The account stays signed in on purpose — client-side, supabase-client.js
--  redirects it to community/banned.html the moment its profile loads with
--  banned = true, and every other page does the same check, so it never
--  reaches a page it could browse, post, or log out from. These policy
--  updates are the server-side backstop, so writes stay blocked even if
--  that client-side redirect is ever bypassed.)

-- Banned users can no longer edit their own profile/settings.
drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self"
on public.profiles for update
using (
  auth.uid() = id
  and not coalesce((select banned from public.profiles where id = auth.uid()), false)
)
with check (
  auth.uid() = id
  and role = (select role from public.profiles where id = auth.uid())
);

-- Banned users can no longer create or edit posts.
drop policy if exists "posts_insert_own" on public.posts;
create policy "posts_insert_own"
on public.posts for insert
with check (
  auth.uid() = author_id
  and not coalesce((select banned from public.profiles where id = auth.uid()), false)
);

drop policy if exists "posts_update_own" on public.posts;
create policy "posts_update_own"
on public.posts for update
using (
  auth.uid() = author_id
  and not coalesce((select banned from public.profiles where id = auth.uid()), false)
)
with check (auth.uid() = author_id);

-- Banned users can no longer comment or reply.
drop policy if exists "comments_insert_own" on public.comments;
create policy "comments_insert_own"
on public.comments for insert
with check (
  auth.uid() = author_id
  and not coalesce((select banned from public.profiles where id = auth.uid()), false)
  and exists (select 1 from public.posts p where p.id = post_id and p.status = 'published')
);

-- Banned users can no longer like/dislike posts.
drop policy if exists "reactions_insert_own" on public.post_reactions;
create policy "reactions_insert_own"
on public.post_reactions for insert
with check (
  auth.uid() = user_id
  and not coalesce((select banned from public.profiles where id = auth.uid()), false)
);

drop policy if exists "reactions_update_own" on public.post_reactions;
create policy "reactions_update_own"
on public.post_reactions for update
using (auth.uid() = user_id)
with check (
  auth.uid() = user_id
  and not coalesce((select banned from public.profiles where id = auth.uid()), false)
);

-- Banned users can no longer like/dislike comments.
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
with check (
  auth.uid() = user_id
  and not coalesce((select banned from public.profiles where id = auth.uid()), false)
);

-- Banned users can no longer save/favorite posts.
drop policy if exists "saves_insert_own" on public.post_saves;
create policy "saves_insert_own"
on public.post_saves for insert
with check (
  auth.uid() = user_id
  and not coalesce((select banned from public.profiles where id = auth.uid()), false)
);
