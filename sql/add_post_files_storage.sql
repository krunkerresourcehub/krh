-- =========================================================
-- Migration: Generic file upload support
-- =========================================================

-- 1. Create or ensure the bucket is public
insert into storage.buckets (id, name, public)
values ('post-files', 'post-files', true)
on conflict (id) do update
set public = true;

-- 2. Replace existing policies so this migration is rerunnable
drop policy if exists "post_files_public_read"
on storage.objects;

drop policy if exists "post_files_insert_own"
on storage.objects;

drop policy if exists "post_files_update_own"
on storage.objects;

drop policy if exists "post_files_delete_own"
on storage.objects;

-- Public read access
create policy "post_files_public_read"
on storage.objects
for select
to public
using (
  bucket_id = 'post-files'
);

-- Users can upload only inside their own folder
create policy "post_files_insert_own"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'post-files'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

-- Users can update only their own files and cannot move them
-- outside their own folder
create policy "post_files_update_own"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'post-files'
  and (storage.foldername(name))[1] = (select auth.uid())::text
)
with check (
  bucket_id = 'post-files'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

-- Users can delete only files in their own folder
create policy "post_files_delete_own"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'post-files'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);