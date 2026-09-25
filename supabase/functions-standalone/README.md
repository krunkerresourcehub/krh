# Standalone function builds

Self-contained copies of the Edge Functions under `supabase/functions/`,
with the `_shared/` imports inlined, for pasting directly into the
Supabase Dashboard's function editor (which doesn't support a shared
folder across functions). If you deploy with the Supabase CLI instead,
use `supabase/functions/` — that tree is the source of truth. These
are generated copies and can drift if you edit the CLI versions
without updating these too.

See `../../SETUP_VERIFIKASI_OTOMATIS.md` for the automated
(GitHub Actions) verification setup that added
`krunker-verification-callback.ts` and the extra logic in
`verify-krunker-account.ts`.
