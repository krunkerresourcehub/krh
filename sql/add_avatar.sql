-- =========================================================
--  Migration: Avatar / Profile Picture support
--  Run this ONCE in Supabase Dashboard > SQL Editor
--  (only needed if you already ran the original schema.sql
--   and now want to add avatars on top of it)
--
--  Versi RERUNNABLE — aman dijalankan berkali-kali.
-- =========================================================

-- 1. Add avatar_url column to profiles
alter table public.profiles
  add column if not exists avatar_url text;

-- Note: no new RLS policy needed for this column.
-- The existing "profiles_update_self" policy already lets a user
-- update any field on their own row (as long as they don't change
-- their own role), so avatar_url updates are already covered.

-- 2. Create a public storage bucket for avatars
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update
set public = true;

-- 3. Storage policies: anyone can view avatars (public bucket),
--    but a user can only upload/update/delete files inside their
--    OWN folder (named after their user id) within the bucket.

drop policy if exists "avatars_public_read" on storage.objects;
create policy "avatars_public_read"
on storage.objects for select
using (bucket_id = 'avatars');

drop policy if exists "avatars_insert_own" on storage.objects;
create policy "avatars_insert_own"
on storage.objects for insert
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "avatars_update_own" on storage.objects;
create policy "avatars_update_own"
on storage.objects for update
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "avatars_delete_own" on storage.objects;
create policy "avatars_delete_own"
on storage.objects for delete
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);
