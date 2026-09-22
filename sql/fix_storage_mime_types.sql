-- =========================================================
--  Migration: Restrict storage bucket uploads by MIME type & size
--  Run this ONCE in Supabase Dashboard > SQL Editor, AFTER all the
--  bucket-creating files in sql/ have been run at least once.
--  Versi RERUNNABLE — aman dijalankan berkali-kali.
--
--  WHY: every upload form in community/*.html only checks file
--  extension in JS before uploading ("only .txt/.js allowed", etc).
--  That check is trivial to bypass by calling the Supabase Storage
--  API directly, and none of the storage.objects RLS policies in
--  sql/add_*_storage.sql restrict file type or size at all — they
--  only check bucket_id + folder ownership + ban status. This
--  migration uses Supabase's native bucket-level
--  allowed_mime_types / file_size_limit settings so the restriction
--  is enforced server-side, the same way the app already scopes
--  uploads to the uploader's own folder.
--
--  NOTE: requires a Supabase project recent enough to have the
--  allowed_mime_types / file_size_limit columns on storage.buckets.
--  If this errors with "column does not exist", your project is on
--  an older storage version — skip this file for now.
-- =========================================================

-- Images only, 5MB (matches UPLOAD_MAX_BYTES_DEFAULT in supabase-client.js)
update storage.buckets set
  allowed_mime_types = array['image/png','image/jpeg','image/webp','image/gif'],
  file_size_limit = 5242880
where id in ('avatars','crosshairs','post-previews','backgrounds');

-- Maps / scripts (txt, js, json) + Mods (zip). Shared bucket across several
-- categories with different extensions, so the allow-list covers all of
-- them; zip still gets the wider 30MB cap via file_size_limit here (client
-- already separately caps non-zip uploads at 5MB in JS, this is just the
-- server-side ceiling so nothing over 30MB gets in regardless of type).
update storage.buckets set
  allowed_mime_types = array['text/plain','application/javascript','text/javascript','application/json','application/zip','application/x-zip-compressed'],
  file_size_limit = 31457280
where id = 'post-files';

-- Ban appeal proof: screenshots + text/markdown/PDF docs, 5MB
update storage.buckets set
  allowed_mime_types = array['image/png','image/jpeg','image/webp','image/gif','text/plain','text/markdown','application/pdf'],
  file_size_limit = 5242880
where id = 'ban-appeal-proofs';
