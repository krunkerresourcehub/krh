-- =========================================================
--  Set the knlvx_aura account to Developer (highest role)
--  Run this in Supabase Dashboard > SQL Editor AFTER this
--  account has already signed up via community/signup.html.
--
--  Safe to run multiple times (idempotent) — if the account
--  is already a developer, this query doesn't change anything.
--
--  Note: the 'developer' role deliberately cannot be granted
--  through the web panel (community/developer.html), which is
--  why it has to be done via manual SQL like this.
--
--  IMPORTANT: this matches on the "username" column (from
--  Account Settings > Username), NOT "krunker_username".
--  Double-check the correct username in community/settings.html
--  if it turns out to differ from what's used here.
-- =========================================================

update public.profiles
set role = 'developer'
where username = 'knlvx_aura'
  and role <> 'developer';

-- Check the result:
select id, username, display_name, role
from public.profiles
where username = 'knlvx_aura';
