-- =========================================================
--  Migration: Custom Theme Settings (accent color, gradient,
--  background) — powers community/settings.html
--  Run this ONCE in Supabase Dashboard > SQL Editor
--  (only needed if you already ran the original schema.sql
--   and now want theme customization on top of it)
--
--  Versi RERUNNABLE — aman dijalankan berkali-kali.
-- =========================================================

-- 1. Add theme_settings column to profiles.
--    Stored as jsonb so the shape can grow later without more
--    migrations. Example value:
--    {
--      "accent": "#ff6b9d",
--      "gradient": { "enabled": true, "angle": 135, "stops": ["#ff6b9d","#b895ff","#3fe0d8"] },
--      "background": { "type": "default", "solid": "#120c28", "gradient": {...}, "image_url": null, "dim": 0.35 }
--    }
alter table public.profiles
  add column if not exists theme_settings jsonb;

-- Note: no new RLS policy needed for this column.
-- The existing "profiles_update_self" policy already lets a user
-- update any field on their own row (as long as they don't change
-- their own role), so theme_settings updates are already covered.

-- 2. Create a public storage bucket for custom background images
insert into storage.buckets (id, name, public)
values ('backgrounds', 'backgrounds', true)
on conflict (id) do update
set public = true;

-- 3. Storage policies: anyone can view backgrounds (public bucket),
--    but a user can only upload/update/delete files inside their
--    OWN folder (named after their user id) within the bucket.

drop policy if exists "backgrounds_public_read" on storage.objects;
create policy "backgrounds_public_read"
on storage.objects for select
using (bucket_id = 'backgrounds');

drop policy if exists "backgrounds_insert_own" on storage.objects;
create policy "backgrounds_insert_own"
on storage.objects for insert
with check (
  bucket_id = 'backgrounds'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "backgrounds_update_own" on storage.objects;
create policy "backgrounds_update_own"
on storage.objects for update
using (
  bucket_id = 'backgrounds'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "backgrounds_delete_own" on storage.objects;
create policy "backgrounds_delete_own"
on storage.objects for delete
using (
  bucket_id = 'backgrounds'
  and (storage.foldername(name))[1] = auth.uid()::text
);
