-- =========================================================
--  Migration: Preview image storage for CSS posts (and similar
--  posts that need multiple preview screenshots)
--  Run this ONCE in Supabase Dashboard > SQL Editor
--
--  Versi RERUNNABLE — aman dijalankan berkali-kali.
-- =========================================================

insert into storage.buckets (id, name, public)
values ('post-previews', 'post-previews', true)
on conflict (id) do update
set public = true;

drop policy if exists "post_previews_public_read" on storage.objects;
create policy "post_previews_public_read"
on storage.objects for select
using (bucket_id = 'post-previews');

drop policy if exists "post_previews_insert_own" on storage.objects;
create policy "post_previews_insert_own"
on storage.objects for insert
with check (
  bucket_id = 'post-previews'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "post_previews_update_own" on storage.objects;
create policy "post_previews_update_own"
on storage.objects for update
using (
  bucket_id = 'post-previews'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "post_previews_delete_own" on storage.objects;
create policy "post_previews_delete_own"
on storage.objects for delete
using (
  bucket_id = 'post-previews'
  and (storage.foldername(name))[1] = auth.uid()::text
);
