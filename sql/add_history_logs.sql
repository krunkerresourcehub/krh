-- =========================================================
--  Migration: History Logs (Audit Trail)
--  Run this in Supabase Dashboard > SQL Editor.
--  RERUNNABLE version — safe to run multiple times.
--
--  If you've ALREADY run a previous version: just run this
--  file again as-is. Every change uses "if not exists" /
--  "create or replace" / "drop policy if exists", so your
--  data is safe and only the policies + indexes get upgraded.
--
--  This table records every staff (admin/developer) action:
--  publish/unpublish/delete/edit post, ban/unban user,
--  grant/revoke admin role, approve/reject ban appeal, warn
--  user, delete comment.
--
--  IMPORTANT: this table is deliberately APPEND-ONLY.
--  There are no UPDATE or DELETE policies, so logs cannot be
--  changed or deleted through the website — not even by a
--  developer. If you genuinely need to clean up old logs, see
--  the "LOG CLEANUP" section at the very bottom of this file.
-- =========================================================

-- ---------- 1. Table: activity_logs ----------
create table if not exists public.activity_logs (
  id                 uuid primary key default gen_random_uuid(),

  -- Who performed the action. Snapshotted (username/display_name/role
  -- stored as text) so the log stays readable even if the account is
  -- later deleted or its role changes.
  actor_id           uuid references public.profiles(id) on delete set null,
  actor_username     text,
  actor_display_name text,
  actor_role         text,

  action             text not null check (action in (
    'post_publish','post_unpublish','post_delete','post_edit',
    'user_ban','user_unban','user_warn',
    'role_grant_admin','role_revoke_admin',
    'appeal_approve','appeal_reject',
    'comment_delete'
  )),

  -- The object the action was taken on. target_id is deliberately
  -- TEXT (not a FK) so a log for a since-deleted post still keeps
  -- its original id.
  target_type        text check (target_type in ('post','user','appeal','comment')),
  target_id          text,
  target_label       text,   -- snapshot: post title / username
  target_user_id     uuid references public.profiles(id) on delete set null,

  reason             text,   -- ban reason / reject note / warning message
  meta               jsonb not null default '{}'::jsonb,
  created_at         timestamptz not null default now()
);

alter table public.activity_logs enable row level security;

-- ---------- 2. Helper: is_staff() ----------
-- IMPORTANT FOR PERFORMANCE. If the RLS policy were written directly
-- as "exists (select 1 from profiles ...)", that subquery would get
-- re-evaluated while scanning every row.
--
-- Wrapped as a STABLE function instead, then called as
-- "(select is_staff())" in the policy, so the result is computed
-- ONCE per query (becomes an InitPlan) — not once per row.
--
-- SECURITY DEFINER is used so this role check isn't itself subject
-- to the profiles table's own RLS (avoiding nested policy evaluation).
create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('admin','developer')
  );
$$;

create or replace function public.is_active_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role in ('admin','developer')
      and not coalesce(p.banned, false)
  );
$$;

revoke execute on function public.is_staff()        from public, anon;
revoke execute on function public.is_active_staff() from public, anon;
grant  execute on function public.is_staff()        to authenticated;
grant  execute on function public.is_active_staff() to authenticated;

-- ---------- 3. Indexes ----------
-- The logs page ALWAYS orders by created_at desc, so the index is
-- also built in descending order so it can be read directly without
-- an extra sort step.
create index if not exists activity_logs_created_at_idx on public.activity_logs (created_at desc);

-- COMPOSITE index for the two most commonly used filters.
-- Filtering + sorting is served by a single index this way, much
-- cheaper than a single-column index that would still need to
-- re-sort afterward.
create index if not exists activity_logs_action_created_idx on public.activity_logs (action, created_at desc);
create index if not exists activity_logs_actor_created_idx  on public.activity_logs (actor_id, created_at desc);
create index if not exists activity_logs_target_user_idx    on public.activity_logs (target_user_id);

-- The old single-column indexes are now covered by the composite
-- indexes above — dropped so each INSERT doesn't have to maintain
-- duplicate indexes.
drop index if exists public.activity_logs_action_idx;
drop index if exists public.activity_logs_actor_id_idx;
drop index if exists public.activity_logs_target_user_id_idx;

-- Index for the Search feature (ILIKE '%word%').
-- Without this, every search would be a full table scan. pg_trgm
-- lets a partial search like that still use an index.
create extension if not exists pg_trgm;
create index if not exists activity_logs_search_idx
  on public.activity_logs using gin (
    (coalesce(target_label,'') || ' ' || coalesce(reason,'')) gin_trgm_ops
  );

-- ---------- 4. RLS: who can READ ----------
-- Admins & developers only. Regular users cannot see the logs at all.
drop policy if exists "activity_logs_staff_read" on public.activity_logs;
create policy "activity_logs_staff_read"
on public.activity_logs for select
using ( (select public.is_staff()) );

-- (OPTIONAL) If you later want users to be able to see the
-- moderation history taken against themselves, remove the comment
-- block below:
--
-- drop policy if exists "activity_logs_read_own_target" on public.activity_logs;
-- create policy "activity_logs_read_own_target"
-- on public.activity_logs for select
-- using (target_user_id = (select auth.uid()));

-- ---------- 5. RLS: who can WRITE ----------
-- Staff only, and actor_id MUST be themselves, so no one can write a
-- log entry on someone else's behalf. Banned accounts are blocked too.
drop policy if exists "activity_logs_staff_insert" on public.activity_logs;
create policy "activity_logs_staff_insert"
on public.activity_logs for insert
with check (
  (select auth.uid()) = actor_id
  and (select public.is_active_staff())
);

-- There is DELIBERATELY no policy for update & delete.
-- Without a policy, RLS automatically rejects every UPDATE/DELETE from the client.

-- ---------- 6. RPC: summary stats ----------
-- The four numbers shown at the top of the logs page are computed in
-- the database in ONE query (a single scan), instead of pulling
-- thousands of rows into the browser just to count them in
-- JavaScript.
--
-- Deliberately WITHOUT security definer, so RLS still applies: if
-- the caller isn't staff, they see zero rows and the result is 0.
create or replace function public.activity_log_stats()
returns table (total bigint, last_24h bigint, last_7d bigint, staff_active bigint)
language sql
stable
set search_path = public
as $$
  select
    count(*),
    count(*) filter (where created_at > now() - interval '24 hours'),
    count(*) filter (where created_at > now() - interval '7 days'),
    count(distinct actor_id)
  from public.activity_logs;
$$;

revoke execute on function public.activity_log_stats() from public, anon;
grant  execute on function public.activity_log_stats() to authenticated;

-- =========================================================
--  LOG CLEANUP (run manually in the SQL Editor if needed)
-- =========================================================
-- More logs = a slower count(*) in the stats cards.
-- If the table grows to hundreds of thousands of rows, trim the old ones:
--
--   delete from public.activity_logs where created_at < now() - interval '1 year';
--
-- Clear all logs:
--   truncate table public.activity_logs;
--
-- After a large delete, clean up the table:
--   vacuum analyze public.activity_logs;
