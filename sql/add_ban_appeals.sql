-- =========================================================
--  Migration: Ban Appeals ("open a ticket" for a banned account)
--  Run this ONCE in Supabase Dashboard > SQL Editor.
--  Versi RERUNNABLE — aman dijalankan berkali-kali.
--
--  A banned account is locked to community/banned.html and can't write
--  to anything else (see add_ban_system.sql) — EXCEPT this table, which
--  is the one thing a banned user is deliberately allowed to insert into
--  so they can file an appeal. Reviewing/approving/rejecting an appeal
--  is developer-only, same restriction as banning/unbanning itself.
-- =========================================================

-- ---------- 1. Table: ban_appeals ----------
create table if not exists public.ban_appeals (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references public.profiles(id) on delete cascade,

  -- snapshot of what the user typed at appeal time (kept even if their
  -- profile/ban is later changed, so the ticket still reads sensibly)
  username          text not null,
  ban_reason        text not null,
  message           text not null, -- "why we should revoke your ban"
  krunker_username  text,
  discord_id        text,
  discord_username  text,

  -- array of { url, name, type, size } — screenshots, docs, txt, md, etc.
  proof_files       jsonb not null default '[]'::jsonb,

  status            text not null default 'pending' check (status in ('pending','approved','rejected')),
  reviewed_by       uuid references public.profiles(id) on delete set null,
  reviewed_at       timestamptz,
  reviewer_note     text,

  created_at        timestamptz not null default now()
);

-- Only one open ticket per user at a time (mirrors a Discord-style ticket —
-- you can't spam five appeals while one is still pending).
create unique index if not exists ban_appeals_one_pending_per_user
  on public.ban_appeals (user_id)
  where (status = 'pending');

create index if not exists ban_appeals_user_id_idx on public.ban_appeals (user_id, created_at desc);
create index if not exists ban_appeals_status_idx on public.ban_appeals (status, created_at desc);

alter table public.ban_appeals enable row level security;

-- A user can read their own appeals (to show "pending" / "rejected" status).
drop policy if exists "ban_appeals_read_own" on public.ban_appeals;
create policy "ban_appeals_read_own"
on public.ban_appeals for select
using (auth.uid() = user_id);

-- Developers can read every appeal.
drop policy if exists "ban_appeals_read_developer" on public.ban_appeals;
create policy "ban_appeals_read_developer"
on public.ban_appeals for select
using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'developer')
);

-- Only a currently-banned user can file a ticket for themselves.
drop policy if exists "ban_appeals_insert_own" on public.ban_appeals;
create policy "ban_appeals_insert_own"
on public.ban_appeals for insert
with check (
  auth.uid() = user_id
  and coalesce((select banned from public.profiles where id = auth.uid()), false)
);

-- Only a developer can update a ticket (approve/reject/leave a note).
drop policy if exists "ban_appeals_update_developer" on public.ban_appeals;
create policy "ban_appeals_update_developer"
on public.ban_appeals for update
using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'developer')
)
with check (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'developer')
);

-- ---------- 2. Let the review outcome reach the user's inbox ----------
alter table public.notifications drop constraint if exists notifications_type_check;
alter table public.notifications add constraint notifications_type_check check (type in (
  'post_like','post_dislike','post_comment',
  'comment_reply','comment_like','comment_dislike',
  'post_edited','post_deleted','warned','banned','unbanned','new_follower',
  'appeal_rejected'
  -- (no 'appeal_submitted' — developers see new tickets directly in the
  -- Developer Panel's Ban Appeals list, and 'approved' just triggers the
  -- normal 'unbanned' notification instead of a second one.)
));

-- ---------- 3. Storage bucket for appeal proof files ----------
-- Public bucket, same convention as post-files / post-previews / crosshair
-- storage elsewhere in this app — object path is scoped to the uploader's
-- own folder, and (like post-files) uploads are allowed even while banned,
-- since filing an appeal is the one thing a banned account may still do.
insert into storage.buckets (id, name, public)
values ('ban-appeal-proofs', 'ban-appeal-proofs', true)
on conflict (id) do update
set public = true;

drop policy if exists "ban_appeal_proofs_public_read" on storage.objects;
drop policy if exists "ban_appeal_proofs_insert_own" on storage.objects;
drop policy if exists "ban_appeal_proofs_delete_own" on storage.objects;

create policy "ban_appeal_proofs_public_read"
on storage.objects
for select
to public
using (
  bucket_id = 'ban-appeal-proofs'
);

create policy "ban_appeal_proofs_insert_own"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'ban-appeal-proofs'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "ban_appeal_proofs_delete_own"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'ban-appeal-proofs'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);
