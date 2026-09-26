-- =========================================================
--  Fix: honest "unsupported" vs "failed" for Krunker profile sync
--  Run this ONCE in Supabase Dashboard > SQL Editor. Rerunnable.
--
--  WHY
--  ---
--  supabase/functions/sync-krunker-profile pulls stats/maps/mods via
--  the providers in _shared/krunker-providers.ts. Right now those
--  providers are intentionally disabled by default
--  (KRUNKER_VERIFY_PROVIDERS_EXPERIMENTAL is unset) because the only
--  known way to read that data is Krunker's internal WebSocket
--  protocol, which requires spoofing an Origin header a real browser
--  can't send and getting past an hCaptcha/reCaptcha gate — not
--  something KRH should build a workaround for (see the long comment
--  at the top of krunker-providers.ts).
--
--  Every provider call therefore returns status "unsupported", not an
--  error — but the old logic in sync-krunker-profile only knew about
--  "available"/"temporarily_failed", so "unsupported" fell through to
--  last_sync_status = 'failed', showing users a scary "(last sync
--  failed)" for something that was never going to work in the first
--  place, by design, not because anything broke. This adds a distinct
--  'unsupported' status so the UI can say that honestly instead.
-- =========================================================

alter table public.krunker_connections drop constraint if exists krunker_connections_last_sync_status_check;
alter table public.krunker_connections add constraint krunker_connections_last_sync_status_check
  check (last_sync_status in ('idle','success','partial','failed','unsupported'));
