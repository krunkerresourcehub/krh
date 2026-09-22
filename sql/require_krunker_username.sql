-- =========================================================
--  Make krunker_username REQUIRED at the database level.
--
--  signup.html and account-settings.html already require this
--  field in the browser, but that's only enforced client-side —
--  anyone calling the Supabase REST API directly with the public
--  anon key could still leave it empty. This migration closes
--  that gap with a real NOT NULL constraint.
--
--  Safe to run multiple times (idempotent).
-- =========================================================

-- 1. Backfill any existing rows that don't have one yet, so the
--    NOT NULL constraint below doesn't fail on old accounts.
--    Falls back to their site username, prefixed so it's obviously
--    a placeholder — review these afterwards with the SELECT at
--    the bottom and ask affected users to set their real one in
--    Account Settings.
update public.profiles
set krunker_username = 'unset-' || username
where krunker_username is null or btrim(krunker_username) = '';

-- 2. Lock the column so it can never be null going forward.
alter table public.profiles
  alter column krunker_username set not null;

-- Check which accounts got the placeholder (i.e. didn't have a
-- Krunker username on file before this migration ran):
select id, username, krunker_username, created_at
from public.profiles
where krunker_username like 'unset-%'
order by created_at desc;
