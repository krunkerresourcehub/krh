-- =========================================================
--  Migration: automated Krunker Social Feed check via a
--  GitHub Actions headless-browser callback.
--  Run this ONCE in Supabase Dashboard > SQL Editor.
--  RERUNNABLE — safe to run multiple times.
--
--  WHY THIS SHAPE
--  ---------------
--  This does NOT change verification_status's allowed values —
--  a connection stays 'pending' while an automated check is in
--  flight, exactly like before. The new columns are just
--  bookkeeping so we don't spam GitHub Actions on rapid clicks
--  and so a failed/negative check leaves a breadcrumb for
--  support instead of silently doing nothing.
-- =========================================================

alter table public.krunker_verification_challenges
  add column if not exists last_check_requested_at timestamptz;

alter table public.krunker_connections
  add column if not exists last_auto_check_at timestamptz,
  add column if not exists last_auto_check_result text;

-- The owner-facing column grant on krunker_verification_challenges
-- (see sql/add_krunker_connected_accounts.sql) is an explicit column
-- list, not `select *` — add the new column to it so the
-- countdown/status UI can read it without also exposing token_hash.
-- (Column-level GRANTs in Postgres are additive, so this does not
-- remove any previously granted column.)
grant select (last_check_requested_at)
  on public.krunker_verification_challenges to authenticated;
