-- =========================================================
--  Migration: Image attachments for Direct Messages
--  Run this ONCE in Supabase Dashboard > SQL Editor, AFTER
--  add_direct_messages.sql and fix_dm_update_policies.sql have
--  already been run.
--  Versi RERUNNABLE — aman dijalankan berkali-kali.
-- =========================================================

-- 1. Add the column that stores the uploaded image's public URL.
--    content stays "not null" — an image-only message is sent
--    with content = '' (empty string), not null.
alter table public.messages
  add column if not exists image_url text;

-- 2. Storage bucket for DM screenshots/images.
insert into storage.buckets (id, name, public)
values ('dm-images', 'dm-images', true)
on conflict (id) do update
set public = true;

drop policy if exists "dm_images_public_read" on storage.objects;
create policy "dm_images_public_read"
on storage.objects for select
using (bucket_id = 'dm-images');

-- Users can only upload into their own folder (path: <uid>/...),
-- same pattern as post-previews / post-files.
drop policy if exists "dm_images_insert_own" on storage.objects;
create policy "dm_images_insert_own"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'dm-images'
  and (storage.foldername(name))[1] = auth.uid()::text
  and not coalesce((select banned from public.profiles where id = auth.uid()), false)
);

drop policy if exists "dm_images_update_own" on storage.objects;
create policy "dm_images_update_own"
on storage.objects for update
to authenticated
using (bucket_id = 'dm-images' and (storage.foldername(name))[1] = auth.uid()::text)
with check (bucket_id = 'dm-images' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "dm_images_delete_own" on storage.objects;
create policy "dm_images_delete_own"
on storage.objects for delete
to authenticated
using (bucket_id = 'dm-images' and (storage.foldername(name))[1] = auth.uid()::text);

-- 3. Extend the existing "no editing a message after it's sent" trigger
--    (from fix_dm_update_policies.sql) so image_url can't be swapped
--    out later either — only `read` is allowed to change post-insert.
create or replace function public.lock_message_fields()
returns trigger language plpgsql as $$
begin
  new.content := old.content;
  new.image_url := old.image_url;
  new.sender_id := old.sender_id;
  new.conversation_id := old.conversation_id;
  new.created_at := old.created_at;
  return new;
end;
$$;
-- trigger itself is unchanged (already created by fix_dm_update_policies.sql),
-- re-running create or replace on the function above is enough.
