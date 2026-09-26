-- =========================================================
--  Migration: Manual review for Krunker verification
--  Run this ONCE in Supabase Dashboard > SQL Editor.
--  RERUNNABLE version — safe to run multiple times.
--
--  WHY
--  ---
--  The original plan (see sql/add_krunker_connected_accounts.sql)
--  was to check the posted code automatically via a GitHub Actions
--  headless browser. That doesn't work: Krunker's Social Feed page
--  serves a "SECURITY CHALLENGE / Protected by ALTCHA" anti-bot wall
--  to any automated browser, so the check could never see real
--  content. Rather than try to defeat that (not something KRH should
--  be doing to a third-party site), verification is now reviewed by
--  a human KRH admin/developer instead. This migration adds the two
--  columns that flow needs:
--    - krunker_verification_challenges.review_requested_at — set when
--      the user clicks "Request Review" after posting their code.
--    - krunker_connections.verification_note — optional short note
--      an admin leaves when they can't approve yet (shown to the user).
--
--  As with the rest of this feature, all WRITES to these columns
--  happen from the trusted backend (Edge Functions with the service
--  role key) — see supabase/functions/verify-krunker-account and
--  supabase/functions/admin-review-krunker-verification.
-- =========================================================

alter table public.krunker_verification_challenges
  add column if not exists review_requested_at timestamptz;

alter table public.krunker_connections
  add column if not exists verification_note text;

-- Let the owner's own page read the new challenge column (it already
-- had a column-level grant restricting it to a safe list — see
-- sql/add_krunker_connected_accounts.sql — so the new column needs
-- to be added to that allow-list explicitly, same as every other
-- column there).
grant select (review_requested_at) on public.krunker_verification_challenges to authenticated;

-- Staff (admin/developer) need to see PENDING challenges across ALL
-- users to run the review queue — krunker_connections already has an
-- equivalent staff policy, but krunker_verification_challenges only
-- ever had an owner-read policy until now.
drop policy if exists "krunker_challenges_staff_read" on public.krunker_verification_challenges;
create policy "krunker_challenges_staff_read"
on public.krunker_verification_challenges for select
using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','developer'))
);

-- ---------- Audit log support ----------
-- community/admin.html logs approve/reject decisions via logAction()
-- into public.activity_logs (see sql/add_history_logs.sql), whose
-- `action` and `target_type` columns are locked down with CHECK
-- constraints — so the two new action names and the new target_type
-- used by the Krunker review queue need to be added to those
-- constraints, or every logged approval/rejection would silently fail
-- to insert (logAction() is fire-and-forget on purpose, so a failed
-- insert wouldn't block the actual approve/reject — it just wouldn't
-- show up in History Logs, which defeats the point of logging it).
alter table public.activity_logs drop constraint if exists activity_logs_action_check;
alter table public.activity_logs add constraint activity_logs_action_check check (action in (
  'post_publish','post_unpublish','post_delete','post_edit',
  'user_ban','user_unban','user_warn',
  'role_grant_admin','role_revoke_admin',
  'appeal_approve','appeal_reject',
  'comment_delete',
  'krunker_verification_approve','krunker_verification_reject'
));

alter table public.activity_logs drop constraint if exists activity_logs_target_type_check;
alter table public.activity_logs add constraint activity_logs_target_type_check check (target_type in (
  'post','user','appeal','comment','krunker_connection'
));

-- ---------- Inbox notifications ----------
-- Adds three new notification types (see sql/add_notifications_and_comment_features.sql
-- for the base table, extended several times since — most recently by
-- sql/add_ban_appeals.sql, whose full list is carried forward here
-- plus the three new ones at the end):
--   krunker_verified — admin approved (see admin-review-krunker-verification)
--   krunker_rejected — admin rejected, `reason` holds their note
--   krunker_expired  — the 7-day window (see CHALLENGE_TTL_MINUTES /
--                       REVIEW_EXTENSION_MS in the Edge Functions) ran
--                       out with nobody having approved it yet; sent
--                       by the sweep function below, not from a
--                       client request.
alter table public.notifications drop constraint if exists notifications_type_check;
alter table public.notifications add constraint notifications_type_check check (type in (
  'post_like','post_dislike','post_comment',
  'comment_reply','comment_like','comment_dislike',
  'post_edited','post_deleted','warned','banned','unbanned','new_follower',
  'appeal_rejected',
  'krunker_verified','krunker_rejected','krunker_expired'
));

-- ---------- Expiry sweep ----------
-- Replaces the old expire_stale_krunker_records() from
-- sql/add_krunker_connected_accounts.sql, which (a) was never actually
-- scheduled anywhere and (b) hard-coded a 1-day cutoff that no longer
-- matches the 7-day review window. This version also notifies the
-- user when their code expires while still stuck on "pending" —
-- i.e. nobody approved OR rejected it in time.
drop function if exists public.expire_stale_krunker_records();

create or replace function public.expire_and_notify_stale_krunker_verifications()
returns void language plpgsql security definer as $$
declare
  rec record;
begin
  -- Still-pending connections whose active challenge's expires_at (kept
  -- rolling forward by verify-krunker-account every time "Request
  -- Review" is clicked) has finally passed with no admin decision.
  for rec in
    select c.id as connection_id, c.krh_user_id, c.krunker_username, ch.id as challenge_id
    from public.krunker_connections c
    join public.krunker_verification_challenges ch
      on ch.connection_id = c.id and ch.status = 'pending'
    where c.verification_status = 'pending'
      and ch.expires_at < now()
  loop
    update public.krunker_verification_challenges set status = 'expired' where id = rec.challenge_id;
    update public.krunker_connections set verification_status = 'expired' where id = rec.connection_id;
    insert into public.notifications (user_id, type, reason)
    values (
      rec.krh_user_id,
      'krunker_expired',
      format('Your verification code for "%s" expired before a KRH team member could review it. Go to Account Settings to generate a new one and request review again.', rec.krunker_username)
    );
  end loop;

  -- Safety net for any other pending challenge past expiry that the
  -- loop above didn't touch (e.g. its connection already moved to a
  -- different state through some other path) — just stops it from
  -- showing as an active code, no notification needed since the user
  -- didn't have a live 'pending' connection waiting on it.
  update public.krunker_verification_challenges
    set status = 'expired'
    where status = 'pending' and expires_at < now();
end;
$$;

-- Run the sweep hourly. This needs the pg_cron extension, which is
-- available on most Supabase plans under Database > Extensions but
-- not universally — if the next two statements error out for you,
-- skip them and instead go to Database > Cron Jobs in the dashboard
-- and schedule `select public.expire_and_notify_stale_krunker_verifications();`
-- from there (same effect, no SQL needed).
create extension if not exists pg_cron;

do $$
begin
  perform cron.unschedule('expire-krunker-verifications-hourly');
exception when others then
  null; -- job didn't exist yet, nothing to unschedule
end;
$$;

select cron.schedule(
  'expire-krunker-verifications-hourly',
  '0 * * * *',
  $$select public.expire_and_notify_stale_krunker_verifications();$$
);

-- =========================================================
-- IMPORTANT NOTES
-- =========================================================
-- 1. The raw verification code is still NEVER stored anywhere after
--    it's first shown to the user (only its sha256 hash is kept) —
--    this migration doesn't change that. A reviewing admin therefore
--    can't byte-for-byte compare the code; instead they open the
--    user's PUBLIC Krunker Social Feed themselves (a link is provided
--    in the admin panel) and confirm a post matching the pattern
--    KRH-VERIFY-XXXXXXXXXXXXXXXX, authored by that exact Krunker
--    username, appears there after the code's created_at timestamp.
--    Posting to a Krunker account's own Social Feed requires being
--    logged into that account, which is what actually proves
--    ownership here — the random code's job is just to keep each
--    review tied to a fresh, single-use post rather than a stale or
--    reused screenshot.
-- 2. This does not remove krunker_connections.verification_status's
--    'failed' value or any existing rows — admins reject back to
--    'pending' (with verification_note set) so the user can simply
--    post an updated code and request review again, rather than
--    having to fully disconnect and reconnect.
-- =========================================================
