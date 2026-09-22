-- =========================================================
--  Migration: Security Hardening (2026)
--  Run this ONCE in Supabase Dashboard > SQL Editor, AFTER
--  schema.sql and every other file in sql/ has already been run
--  at least once (this migration only alters/extends what those
--  create). Versi RERUNNABLE — aman dijalankan berkali-kali.
--
--  Fixes 3 issues:
--   A. profiles table leaked PII (birthdate, gender, discord_id,
--      discord_username, ban_reason, banned_at, banned_by) to
--      ANYONE — including logged-out visitors and anyone calling
--      the Supabase REST API directly with the public anon key —
--      because "profiles_public_read" is a row-level policy
--      (using true) and Postgres RLS can't restrict individual
--      columns. Fix: move those columns to a new profile_private
--      table that only the row's owner or staff can read.
--   B. Banned users could still upload files to the avatars /
--      crosshairs / post-files storage buckets (the "no writes"
--      rule from add_ban_system.sql never reached storage.objects).
--   C. Direct messages and public chat had no rate limiting,
--      unlike posts/comments (see add_rate_limiting.sql).
-- =========================================================


-- =========================================================
--  A. Split sensitive personal fields out of public.profiles
-- =========================================================

create table if not exists public.profile_private (
  id                uuid primary key references public.profiles(id) on delete cascade,
  birthdate         date,
  gender            text check (gender in ('male','female','other','prefer_not_to_say')),
  discord_id        text,
  discord_username  text,
  ban_reason        text,
  banned_at         timestamptz,
  banned_by         uuid references public.profiles(id) on delete set null
);

alter table public.profile_private enable row level security;

-- Backfill from the old columns on profiles (no-op / harmless if those
-- columns were already removed by a previous run of this file).
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'birthdate'
  ) then
    insert into public.profile_private (id, birthdate, gender, discord_id, discord_username, ban_reason, banned_at, banned_by)
    select id, birthdate, gender, discord_id, discord_username, ban_reason, banned_at, banned_by
    from public.profiles
    on conflict (id) do nothing;
  end if;
end $$;

-- Only the row's owner, or staff (admin/developer), can read this table.
drop policy if exists "profile_private_select_self_or_staff" on public.profile_private;
create policy "profile_private_select_self_or_staff"
on public.profile_private for select
using (
  auth.uid() = id
  or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','developer'))
);

-- A user creates their own row once, at signup.
drop policy if exists "profile_private_insert_self" on public.profile_private;
create policy "profile_private_insert_self"
on public.profile_private for insert
with check (auth.uid() = id);

-- A user can update their own birthdate/gender/discord fields, but NOT
-- their own ban fields (mirrors the "can't change my own role" trick
-- used on profiles_update_self in schema.sql — ban_reason/banned_at/
-- banned_by must stay exactly what they already were).
drop policy if exists "profile_private_update_self" on public.profile_private;
create policy "profile_private_update_self"
on public.profile_private for update
using (auth.uid() = id)
with check (
  auth.uid() = id
  and ban_reason is not distinct from (select ban_reason from public.profile_private where id = auth.uid())
  and banned_at is not distinct from (select banned_at from public.profile_private where id = auth.uid())
  and banned_by is not distinct from (select banned_by from public.profile_private where id = auth.uid())
);

-- Only developers can set/clear ban fields on anyone's row (mirrors the
-- developer-only ban/unban restriction in add_ban_system.sql).
drop policy if exists "profile_private_update_developer" on public.profile_private;
create policy "profile_private_update_developer"
on public.profile_private for update
using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'developer')
)
with check (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'developer')
);

-- Now drop the sensitive columns from the public-facing profiles table.
-- "banned" (the boolean) stays on profiles — it's harmless as a public
-- flag and is already embedded into public post/appeal queries.
alter table public.profiles drop column if exists birthdate;
alter table public.profiles drop column if exists gender;
alter table public.profiles drop column if exists discord_id;
alter table public.profiles drop column if exists discord_username;
alter table public.profiles drop column if exists ban_reason;
alter table public.profiles drop column if exists banned_at;
alter table public.profiles drop column if exists banned_by;


-- =========================================================
--  B. Block banned users from uploading to storage
-- =========================================================

drop policy if exists "avatars_insert_own" on storage.objects;
create policy "avatars_insert_own"
on storage.objects for insert
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
  and not coalesce((select banned from public.profiles where id = auth.uid()), false)
);

drop policy if exists "crosshairs_insert_own" on storage.objects;
create policy "crosshairs_insert_own"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'crosshairs'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and not coalesce((select banned from public.profiles where id = auth.uid()), false)
);

drop policy if exists "post_files_insert_own" on storage.objects;
create policy "post_files_insert_own"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'post-files'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and not coalesce((select banned from public.profiles where id = auth.uid()), false)
);
-- Note: ban-appeal-proofs is deliberately NOT patched here — filing an
-- appeal (and its proof uploads) is the one thing a banned account is
-- meant to still be able to do, per add_ban_appeals.sql.


-- =========================================================
--  C. Rate limit DMs and public chat (same pattern as posts/comments
--     in add_rate_limiting.sql — enforced in the DB, not just in JS,
--     since client-side checks are trivial to bypass by calling the
--     Supabase API directly)
-- =========================================================

create or replace function public.enforce_message_rate_limit()
returns trigger language plpgsql security definer as $$
declare
  v_role text;
  v_last timestamptz;
begin
  select role into v_role from public.profiles where id = new.sender_id;
  if v_role in ('admin','developer') then
    return new;
  end if;

  select max(created_at) into v_last from public.messages where sender_id = new.sender_id;
  if v_last is not null and now() - v_last < interval '2 seconds' then
    raise exception 'You are sending messages too fast. Please slow down a bit.'
      using errcode = 'P0001';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_messages_rate_limit on public.messages;
create trigger trg_messages_rate_limit
before insert on public.messages
for each row execute function public.enforce_message_rate_limit();


create or replace function public.enforce_public_chat_rate_limit()
returns trigger language plpgsql security definer as $$
declare
  v_role text;
  v_last timestamptz;
begin
  select role into v_role from public.profiles where id = new.sender_id;
  if v_role in ('admin','developer') then
    return new;
  end if;

  select max(created_at) into v_last from public.public_messages where sender_id = new.sender_id;
  if v_last is not null and now() - v_last < interval '2 seconds' then
    raise exception 'You are sending messages too fast. Please slow down a bit.'
      using errcode = 'P0001';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_public_chat_rate_limit on public.public_messages;
create trigger trg_public_chat_rate_limit
before insert on public.public_messages
for each row execute function public.enforce_public_chat_rate_limit();
