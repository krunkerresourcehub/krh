-- =========================================================
--  Migration: Connect Krunker Account (ownership verification
--  via Krunker Social Feed + profile/stat/map/mod sync)
--  Run this ONCE in Supabase Dashboard > SQL Editor.
--  RERUNNABLE version — safe to run multiple times.
--
--  WHY THIS SHAPE
--  ---------------
--  `profiles.krunker_username` already exists, but it's just a
--  free-text field the user types in on Account Settings — it is
--  NOT proof of ownership (see sql/require_krunker_username.sql).
--  This migration adds a SEPARATE, verified connection on top of
--  it. `profiles.krunker_username` is left untouched.
--
--  All writes to these tables happen from the trusted backend
--  (Supabase Edge Functions, using the service role key — see
--  supabase/functions/), never directly from the browser. RLS
--  below only grants SELECT to the owning user; there are no
--  client-facing INSERT/UPDATE/DELETE policies at all, which is
--  what actually prevents a user from marking their own
--  connection "verified" (a permissive-but-buggy policy would be
--  a real vulnerability here, so the safe default is "no policy
--  = no access" and let the service role, which bypasses RLS,
--  do all the writing).
-- =========================================================

-- ---------- 1. Table: krunker_connections ----------
create table if not exists public.krunker_connections (
  id                          uuid primary key default gen_random_uuid(),
  krh_user_id                 uuid not null references public.profiles(id) on delete cascade,
  provider                    text not null default 'krunker' check (provider = 'krunker'),
  krunker_user_id             text,                 -- stable account id, if a provider ever exposes one
  krunker_username            text not null,        -- as typed/displayed
  krunker_username_normalized text not null,        -- lower(trim(...)), used for uniqueness/lookups
  verification_status         text not null default 'pending'
                               check (verification_status in ('pending','verified','expired','failed','disconnected')),
  verified_at                 timestamptz,
  connected_at                timestamptz,
  last_synced_at              timestamptz,
  last_sync_status            text check (last_sync_status in ('idle','success','partial','failed')),
  last_sync_error             text,                 -- sanitized (no secrets, no raw upstream errors)
  show_on_public_profile      boolean not null default true,
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now()
);

alter table public.krunker_connections enable row level security;

-- A KRH user may have at most one ACTIVE (pending or verified)
-- connection at a time. They can always disconnect and start a
-- new one — old disconnected/expired/failed rows are kept for
-- history and don't count against this.
drop index if exists krunker_connections_one_active_per_user;
create unique index krunker_connections_one_active_per_user
  on public.krunker_connections (krh_user_id)
  where verification_status in ('pending', 'verified');

-- A given Krunker account can be VERIFIED-linked to only one KRH
-- user at a time (prevents account-sharing/impersonation confusion).
-- Falls back to normalized username since no stable Krunker account
-- id is confirmed available yet (see README_KRUNKER_INTEGRATION.md).
-- LIMITATION: Krunker usernames are not guaranteed immutable, so if
-- a Krunker account is renamed and a *different* person later takes
-- the old name, the old verified row (now stale) could momentarily
-- block them — the sync job below detects and expires stale rows,
-- and staff can always clear one manually.
drop index if exists krunker_connections_unique_verified_username;
create unique index krunker_connections_unique_verified_username
  on public.krunker_connections (krunker_username_normalized)
  where verification_status = 'verified';

-- Same idea, but on the stable id, whenever one is actually available.
drop index if exists krunker_connections_unique_verified_id;
create unique index krunker_connections_unique_verified_id
  on public.krunker_connections (krunker_user_id)
  where verification_status = 'verified' and krunker_user_id is not null;

-- Owner can read their own connection(s) (settings page, connected
-- profile page). No client-side write policy exists on purpose —
-- see the note at the top of this file.
drop policy if exists "krunker_connections_owner_read" on public.krunker_connections;
create policy "krunker_connections_owner_read"
on public.krunker_connections for select
using (auth.uid() = krh_user_id);

-- Staff (admin/developer) can read all connections, for support/moderation.
drop policy if exists "krunker_connections_staff_read" on public.krunker_connections;
create policy "krunker_connections_staff_read"
on public.krunker_connections for select
using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','developer'))
);

-- Deliberately NO public/anon row policy on the base table. RLS
-- governs which ROWS are visible, not which COLUMNS — a row policy
-- here would still leave every column (last_sync_error,
-- verification_status internals, etc.) reachable by anyone who can
-- see the row, via the role's ordinary table-level SELECT grant.
-- Instead, public visibility is served entirely through the view
-- below, whose column list IS the access control.

drop trigger if exists trg_krunker_connections_updated_at on public.krunker_connections;
create trigger trg_krunker_connections_updated_at
before update on public.krunker_connections
for each row execute function public.set_updated_at();

-- The owner CAN update their own row directly from the browser, but
-- ONLY the one non-sensitive preference column below — everything
-- else (verification_status, krunker_user_id, timestamps, etc.) must
-- go through the Edge Functions. RLS is row-level, not column-level,
-- so the actual restriction here is the column-level GRANT: an
-- UPDATE touching any other column is rejected by Postgres itself,
-- independent of the USING/WITH CHECK clauses below.
revoke update on public.krunker_connections from authenticated;
grant update (show_on_public_profile) on public.krunker_connections to authenticated;

drop policy if exists "krunker_connections_owner_update_visibility" on public.krunker_connections;
create policy "krunker_connections_owner_update_visibility"
on public.krunker_connections for update
using (auth.uid() = krh_user_id)
with check (auth.uid() = krh_user_id);

-- Public-safe view: the ONLY way anyone other than the owner/staff
-- reads anything about a connection. The column list below (not an
-- RLS policy) is what keeps last_sync_error, verification_status
-- internals, krunker_user_id, etc. away from other users — a wider
-- `select *` here can never leak more than these four columns,
-- because they're the only ones the view exposes. Runs with the
-- view owner's privileges (bypassing the base table's RLS, same as
-- Supabase's service role does), so the WHERE clause below — not a
-- table policy — is what enforces "verified + opted-in" visibility.
-- community/krunker-connect.js's getPublicKrunkerConnection() reads
-- this view, never the base table, for anyone but the signed-in owner.
drop view if exists public.krunker_connections_public;
create view public.krunker_connections_public
with (security_invoker = false) as
select id, krh_user_id, krunker_username, verified_at
from public.krunker_connections
where verification_status = 'verified' and show_on_public_profile = true;

grant select on public.krunker_connections_public to anon, authenticated;


-- ---------- 2. Table: krunker_verification_challenges ----------
create table if not exists public.krunker_verification_challenges (
  id                            uuid primary key default gen_random_uuid(),
  krh_user_id                   uuid not null references public.profiles(id) on delete cascade,
  connection_id                 uuid references public.krunker_connections(id) on delete cascade,
  requested_username             text not null,
  requested_username_normalized  text not null,
  token_hash                    text not null,      -- sha256(token), never the raw token
  status                         text not null default 'pending'
                                 check (status in ('pending','used','expired','superseded')),
  expires_at                    timestamptz not null,
  used_at                       timestamptz,
  attempt_count                 integer not null default 0,
  created_at                    timestamptz not null default now()
);

alter table public.krunker_verification_challenges enable row level security;

create index if not exists krunker_challenges_krh_user_idx
  on public.krunker_verification_challenges (krh_user_id, status);

-- Owner can see that a challenge exists / its expiry / status, to
-- drive the countdown UI — but never token_hash-adjacent internals
-- beyond what's listed here (application code should select an
-- explicit column list, not `select *`, when showing this to the UI).
drop policy if exists "krunker_challenges_owner_read" on public.krunker_verification_challenges;
create policy "krunker_challenges_owner_read"
on public.krunker_verification_challenges for select
using (auth.uid() = krh_user_id);

-- No insert/update/delete policy for anon/authenticated: challenges
-- are only ever created/consumed by the create-krunker-verification
-- and verify-krunker-account Edge Functions via the service role.

-- Column-level lockdown: RLS above governs which ROWS are visible,
-- not which COLUMNS — a default `grant select on table` still lets
-- an owner read every column of their own visible rows, including
-- token_hash. The token hash isn't the raw secret, but there's no
-- reason to ever ship it to a browser (constant-time comparison only
-- ever needs to happen server-side, in verify-krunker-account), so
-- revoke the blanket grant and re-grant only the columns the
-- countdown/status UI actually needs.
revoke select on public.krunker_verification_challenges from authenticated;
grant select (
  id, krh_user_id, connection_id, requested_username,
  requested_username_normalized, status, expires_at, used_at,
  attempt_count, created_at
) on public.krunker_verification_challenges to authenticated;


-- ---------- 3. Table: krunker_profile_cache ----------
create table if not exists public.krunker_profile_cache (
  connection_id     uuid primary key references public.krunker_connections(id) on delete cascade,
  stats             jsonb,
  stats_status      text not null default 'unavailable'
                    check (stats_status in ('available','unavailable','unsupported','temporarily_failed','stale')),
  maps              jsonb not null default '[]'::jsonb,
  maps_status       text not null default 'unavailable'
                    check (maps_status in ('available','unavailable','unsupported','temporarily_failed','stale')),
  mods              jsonb not null default '[]'::jsonb,
  mods_status       text not null default 'unavailable'
                    check (mods_status in ('available','unavailable','unsupported','temporarily_failed','stale')),
  source_provider   text,                -- which provider produced this (for debugging/audit)
  last_synced_at    timestamptz,
  cache_expires_at  timestamptz,
  updated_at        timestamptz not null default now()
);

alter table public.krunker_profile_cache enable row level security;

drop policy if exists "krunker_profile_cache_owner_read" on public.krunker_profile_cache;
create policy "krunker_profile_cache_owner_read"
on public.krunker_profile_cache for select
using (
  exists (
    select 1 from public.krunker_connections c
    where c.id = krunker_profile_cache.connection_id and c.krh_user_id = auth.uid()
  )
);

-- Unlike krunker_connections, this table doesn't need the view
-- treatment above: every column here (stats/maps/mods JSON,
-- source_provider, timestamps) is already meant to be shown on a
-- public profile once verified+opted-in — there's no owner-only
-- secret or internal error message living in this table to leak via
-- a wider `select *`.
drop policy if exists "krunker_profile_cache_public_read" on public.krunker_profile_cache;
create policy "krunker_profile_cache_public_read"
on public.krunker_profile_cache for select
using (
  exists (
    select 1 from public.krunker_connections c
    where c.id = krunker_profile_cache.connection_id
      and c.verification_status = 'verified'
      and c.show_on_public_profile = true
  )
);

drop trigger if exists trg_krunker_profile_cache_updated_at on public.krunker_profile_cache;
create trigger trg_krunker_profile_cache_updated_at
before update on public.krunker_profile_cache
for each row execute function public.set_updated_at();


-- ---------- 4. Rate limiting for verification + sync ----------
-- Mirrors the pattern in sql/add_rate_limiting.sql: enforced in the
-- database via trigger, not just in the Edge Function, so it can't
-- be bypassed by calling the table directly. The Edge Functions
-- insert challenge rows themselves, so this trigger caps how often
-- a given KRH user can request a new verification code.
create or replace function public.enforce_krunker_challenge_rate_limit()
returns trigger language plpgsql security definer as $$
declare
  v_recent_count int;
begin
  select count(*) into v_recent_count
  from public.krunker_verification_challenges
  where krh_user_id = new.krh_user_id
    and created_at > now() - interval '15 minutes';

  if v_recent_count >= 5 then
    raise exception 'Too many verification code requests. Please wait a few minutes and try again.'
      using errcode = 'P0001';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_krunker_challenge_rate_limit on public.krunker_verification_challenges;
create trigger trg_krunker_challenge_rate_limit
before insert on public.krunker_verification_challenges
for each row execute function public.enforce_krunker_challenge_rate_limit();

create or replace function public.enforce_krunker_sync_rate_limit()
returns trigger language plpgsql security definer as $$
begin
  if old.last_synced_at is not null and new.last_synced_at is not null
     and new.last_synced_at > old.last_synced_at
     and old.last_synced_at > now() - interval '2 minutes' then
    raise exception 'Please wait a bit before syncing again.'
      using errcode = 'P0001';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_krunker_sync_rate_limit on public.krunker_connections;
create trigger trg_krunker_sync_rate_limit
before update of last_synced_at on public.krunker_connections
for each row execute function public.enforce_krunker_sync_rate_limit();


-- ---------- 5. Housekeeping ----------
-- Expire stale pending challenges/connections. Call this periodically
-- (e.g. from a Supabase Cron job / pg_cron, or opportunistically at
-- the top of create-krunker-verification) — it's just a plain
-- function, not wired to a schedule by this migration.
create or replace function public.expire_stale_krunker_records()
returns void language plpgsql security definer as $$
begin
  update public.krunker_verification_challenges
  set status = 'expired'
  where status = 'pending' and expires_at < now();

  update public.krunker_connections
  set verification_status = 'expired'
  where verification_status = 'pending'
    and connected_at is null
    and created_at < now() - interval '1 day';
end;
$$;

-- =========================================================
-- IMPORTANT NOTES
-- =========================================================
-- 1. This migration does NOT grant the client any way to write to
--    these three tables. All mutations go through the Edge
--    Functions in supabase/functions/ (create-krunker-verification,
--    verify-krunker-account, sync-krunker-profile,
--    disconnect-krunker-account), which authenticate the caller via
--    their Supabase Auth JWT and then use the service role key to
--    perform the actual write. This is the same trust boundary the
--    rest of KRH already relies on for anything RLS alone can't
--    express (see sql/add_rate_limiting.sql, sql/add_ban_system.sql).
-- 2. `krunker_connections_public` is a VIEW, not a table — it has no
--    RLS of its own (views can't have RLS policies) and instead
--    encodes both the row filter and the safe column list directly
--    in its definition, running with the view owner's privileges.
--    If you ever add a column to krunker_connections that's fine to
--    show publicly, you must also add it to this view explicitly —
--    it is intentionally NOT `select *`.
-- 3. `krunker_connections.krunker_user_id` is nullable and, as of
--    this migration, effectively always null — no verified provider
--    currently returns a stable Krunker account id (see
--    README_KRUNKER_INTEGRATION.md). It's kept in the schema so a
--    future provider can populate it without another migration.
