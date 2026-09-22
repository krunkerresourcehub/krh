-- =========================================================
--  Migration: Rate limiting for posts & comments
--  Run this ONCE in Supabase Dashboard > SQL Editor.
--  RERUNNABLE version — safe to run multiple times.
--
--  Why this matters: a cooldown validated only in JS (client-side)
--  is easy to bypass — someone can just call the Supabase API
--  directly from the console/a script, without going through the
--  website at all. That's why the enforcement lives in the
--  database via a trigger, not in JS.
--  Admins & developers are exempt (not subject to the limit),
--  since they sometimes need to publish/moderate quickly and
--  repeatedly.
-- =========================================================

-- ---------- Posts: minimum 20 seconds between posts per user ----------
create or replace function public.enforce_post_rate_limit()
returns trigger language plpgsql security definer as $$
declare
  v_role text;
  v_last timestamptz;
begin
  select role into v_role from public.profiles where id = new.author_id;

  -- Staff (admin/developer) are exempt from the rate limit
  if v_role in ('admin','developer') then
    return new;
  end if;

  select max(created_at) into v_last
  from public.posts
  where author_id = new.author_id;

  if v_last is not null and now() - v_last < interval '20 seconds' then
    raise exception 'You are posting too fast. Please wait a few seconds and try again.'
      using errcode = 'P0001';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_posts_rate_limit on public.posts;
create trigger trg_posts_rate_limit
before insert on public.posts
for each row execute function public.enforce_post_rate_limit();


-- ---------- Comments: minimum 5 seconds between comments per user ----------
create or replace function public.enforce_comment_rate_limit()
returns trigger language plpgsql security definer as $$
declare
  v_role text;
  v_last timestamptz;
begin
  select role into v_role from public.profiles where id = new.author_id;

  if v_role in ('admin','developer') then
    return new;
  end if;

  select max(created_at) into v_last
  from public.comments
  where author_id = new.author_id;

  if v_last is not null and now() - v_last < interval '5 seconds' then
    raise exception 'You are commenting too fast. Please slow down a bit.'
      using errcode = 'P0001';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_comments_rate_limit on public.comments;
create trigger trg_comments_rate_limit
before insert on public.comments
for each row execute function public.enforce_comment_rate_limit();

-- =========================================================
-- NOTE
-- =========================================================
-- The cooldown is intentionally short (20 seconds for posts, 5
-- seconds for comments) — enough to neutralize spam-click scripts,
-- without getting in the way of someone using the site normally.
-- To change it, edit the numbers in "interval '20 seconds'" /
-- "interval '5 seconds'" above and re-run this file (safe, won't
-- throw a duplicate error).
