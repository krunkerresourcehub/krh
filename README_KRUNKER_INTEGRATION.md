# Connect Krunker Account — implementation notes

This documents the "Connect Krunker Account" feature: ownership
verification via Krunker Social Feed, profile sync, and display of
stats/maps/mods. Read this before touching
`supabase/functions/_shared/krunker-providers.ts` or the verification
flow — it explains *why* several pieces are deliberately left
unsupported rather than faked.

## 0. Important caveat on this whole document

This feature was implemented and researched from an environment with
**no network access to krunker.io or social.krunker.io** (outbound
requests are restricted to an allowlist that does not include
Krunker's domains). Every claim below comes from reading public
documentation/source of the projects listed in the task brief, via
web search — **nothing here was executed against Krunker's real
servers.** Treat every "should work" as unverified until someone with
network access actually runs it. This is exactly the situation
section 12 of the brief anticipates ("if a required capability cannot
be verified, implement... a truthful unsupported or pending state").

## 1. What KRH already had

- `public.profiles.krunker_username` — a free-text field the user
  types into Account Settings (`sql/require_krunker_username.sql`
  even makes it `NOT NULL`). It is **not** ownership proof; it's left
  untouched by this feature. The new, verified connection lives in a
  separate table (`krunker_connections`) so the two can't be confused.
- No Supabase Edge Functions existed anywhere in the repo — KRH's
  entire backend today is Postgres (RLS + `security definer`
  triggers/functions, e.g. `sql/add_rate_limiting.sql`) called
  directly from the static frontend via `@supabase/supabase-js`.
  Postgres alone cannot make outbound HTTPS/WebSocket calls to
  Krunker without extensions this project doesn't use, so this
  feature introduces **Supabase Edge Functions** as the trusted
  backend for the parts that need to call out to Krunker or handle
  the verification secret — the same trust boundary the rest of KRH
  already relies on (service role key, never sent to the browser),
  just running on Deno instead of inside a Postgres trigger.

## 2. Research per source in the brief

| Source | A. Public profile lookup | B. Stats | C. Stable ID / username | D. Maps created | E. Mods created | F. Social Feed posts | G. Search a specific post/code | H. Official OAuth |
|---|---|---|---|---|---|---|---|---|
| `pkg.go.dev/github.com/somonox/KrunkerAPI` | Not confirmed — package page did not surface usable endpoint docs in search. Not tested. | Not confirmed | Not confirmed | Not confirmed | Not confirmed | Not confirmed | Not confirmed | No |
| `github.com/fasetto/krunker.io` | Not confirmed | Not confirmed | Not confirmed | Not confirmed | Not confirmed | Not confirmed | Not confirmed | No |
| `github.com/timothyac/krunker-api` (npm `krunker-api`) | Describes itself as pulling **match** information, not player/social profile data. | No | No | No | No | No | No | No |
| `github.com/kiprasvitas/Krunker-API` | Could not locate a distinct, testable source separate from the `krunker.io.js`/`krunker.js` npm wrappers below during research; treat as unverified/duplicate of those. | — | — | — | — | — | — | No |
| Related unofficial wrappers found during research: npm `krunker.io`, `krunker.io.js`, `krunker.js` | **Yes, claimed** — `fetchPlayer`/`getUser(username)` against the Social page. Unmaintained-looking, last-published dates not confirmed current, **not executed**. | **Yes, claimed** — level, score, kills, deaths, K/D, W/L, playtime helpers. Unverified. | Username only in the examples found; no stable numeric/opaque id confirmed. | Not documented in what was found. | `krunker.io.js` mentions a `getMod()` lookup by name — that's *looking up a known mod*, not "mods created by a player." Not the same capability. | No | No | No |
| Community WebSocket gist (`hitthemoney/...`) | **Documented protocol**: `wss://social.krunker.io/ws`, msgpack-encoded. Request `["r","profile",<username>,null]` → response `["0","profile",username,profile-data,map-data,mod-data,...]`. Requires spoofing `Origin: https://krunker.io` on the handshake ("won't work in browser"), and hCaptcha/reCaptcha gates some actions. This is the closest thing to a real spec found. | Implied via `profile-data` (undocumented shape) | Implied via `profile-data` (undocumented shape) | Implied via `map-data` field — **shape and "authored vs. played" semantics not documented** | Implied via `mod-data` field — **shape and "authored vs. played" semantics not documented** | **No read/search API described** — the doc explains how to *discover* packet formats by sniffing traffic, not a way to fetch/search a specific user's feed posts | **Not found** | No |

**Bottom line:**
- **Nothing found gives KRH a safe, documented way to search a
  specific Krunker account's Social Feed for a post and confirm its
  true author.** That's exactly the capability the "post a
  verification code" flow depends on. Per the brief's own instruction
  ("do not fabricate endpoints... if a community API is outdated or
  undocumented, report that clearly"), this feature ships **without**
  automatic verification. See `UnavailableSocialFeedProvider` in
  `supabase/functions/_shared/krunker-providers.ts`.
- The `["r","profile",username,null]` WebSocket request is the one
  piece with an actual documented shape, so a **stats/maps/mods**
  provider is scaffolded around it in
  `ExperimentalWebSocketProfileProvider` — but it's shipped **disabled
  by default** (`KRUNKER_VERIFY_PROVIDERS_EXPERIMENTAL` env var, unset
  = off) because: (a) it's never been run against the real server,
  (b) Deno's standard `WebSocket` cannot set the `Origin` header the
  protocol doc says is required, so it will likely fail outright as
  written, and (c) the map/mod authorship semantics aren't confirmed,
  so `getMapsCreatedBy`/`getModsCreatedBy` return `unsupported`
  unconditionally even when the flag is on, until someone confirms
  the real field shapes.

## 3. What the feature actually does today

- **Connect flow**: enter username → generate `KRH-VERIFY-XXXXXXXX`
  token (16 chars, cryptographically random, shown once) → post it on
  Krunker Social Feed → click **Verify Account**.
- **Verification result today is always "pending" with an honest
  explanation** ("Automatic Social Feed verification isn't available
  yet..."), because of the research above. The connection row, the
  provider interface, and the whole flow are built and ready — the
  only missing piece is a verified way to read Krunker Social Feed,
  which should be dropped into `getSocialFeedProvider()` when one is
  confirmed safe. No admin-approval shortcut was added that would
  fake proof of ownership (the brief explicitly disallows that).
- **Stats/maps/mods sync**: implemented, but with maps/mods
  unconditionally `unsupported` and stats behind the experimental
  flag (off by default) — see above. With the flag off, `Sync Now`
  will complete but everything reports `unsupported`/`unavailable`
  rather than fabricated numbers.
- **Disconnect**, **rate limiting**, **RLS**, **one active connection
  per user**, **one verified Krunker account per KRH user**: fully
  implemented and not dependent on any external API (see
  `sql/add_krunker_connected_accounts.sql`).

## 4. Files

**New:**
- `sql/add_krunker_connected_accounts.sql` — schema, RLS, rate limits.
- `supabase/functions/_shared/http.ts`, `_shared/auth.ts`,
  `_shared/krunker-providers.ts`
- `supabase/functions/create-krunker-verification/index.ts`
- `supabase/functions/verify-krunker-account/index.ts`
- `supabase/functions/sync-krunker-profile/index.ts`
- `supabase/functions/disconnect-krunker-account/index.ts`
- `community/krunker-connect.js`
- `README_KRUNKER_INTEGRATION.md` (this file)

**Modified:**
- `community/account-settings.html` — added the "Connected Accounts"
  card (all states: disconnected / connecting / pending / verified /
  expired-failed) and its script logic.
- `community/profile.html` — added a read-only "Krunker Profile" card
  shown only for verified connections with `show_on_public_profile =
  true`, sourced from RLS-public columns only.

Nothing else was touched — no unrelated refactors, no changes to
existing auth, posts, moderation, or messaging code.

## 5. Setup required to actually deploy this

1. Run `sql/add_krunker_connected_accounts.sql` once in the Supabase
   SQL Editor (idempotent, like the rest of `sql/`).
2. Deploy the four functions in `supabase/functions/` (Supabase CLI:
   `supabase functions deploy create-krunker-verification` etc., or
   via the dashboard).
3. Set these Edge Function secrets (`supabase secrets set ...`):
   - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` — already exist for
     the project; the service role key must **never** be put in the
     frontend.
   - `SUPABASE_ANON_KEY` — used only to validate the caller's JWT.
   - `KRUNKER_VERIFY_PROVIDERS_EXPERIMENTAL` — leave unset (off) until
     someone has verified `ExperimentalWebSocketProfileProvider`
     against the real krunker.io backend. Setting it to `1` will
     attempt the WebSocket call described in section 2.
4. In `supabase/functions/_shared/http.ts`, update `ALLOWED_ORIGINS`
   to the actual GitHub Pages / custom domain(s) KRH is served from.
5. No changes needed to `community/supabase-client.js`'s existing
   `SUPABASE_URL`/`SUPABASE_ANON_KEY` — the new frontend code reuses them.

## 5.5 Follow-up hardening pass (after initial implementation)

A second review pass made three changes, none of which affect the
setup steps above:

- **Column-level RLS gap closed.** RLS policies control which *rows*
  are visible, not which *columns* — a default table-level `SELECT`
  grant still exposes every column of a visible row. Fixed two
  instances: `krunker_verification_challenges` now grants
  `authenticated` an explicit safe column list (excludes
  `token_hash`), and public visibility into `krunker_connections`
  moved off a row policy entirely and onto a new
  `krunker_connections_public` view whose column list *is* the access
  control (`id, krh_user_id, krunker_username, verified_at` only —
  nothing about sync status/errors/internals). `getPublicKrunkerConnection()`
  in `community/krunker-connect.js` now reads that view instead of the
  base table.
- **`supabase/functions/deno.json`** and
  **`supabase/functions/_shared/auth.test.ts`** added, so `deno check`
  and `deno test` (see section 6) are actually runnable by whoever
  deploys this, instead of "no test runner configured."
- **`ExperimentalWebSocketProfileProvider` comments trimmed.** The
  original comments described a *future* version of that provider
  that would spoof the `Origin` handshake header and handle Krunker's
  captcha to get past the checks that currently block this. That's
  not a gap to fill in later — it's not implemented, and the comments
  now say so directly instead of reading as a roadmap toward it.

## 6. Tests, lint, type-check

This is a static-HTML + Supabase project with no test runner, linter,
or type-check command configured anywhere in the *rest* of the repo
(no `package.json`, no CI config). Section 11 of the brief asks to
"run the existing lint/type-check/test commands" — there were none to
run for this stack.

What was actually verified, from an environment without a `deno`
binary available:
- `npx tsc --noEmit` against each Edge Function and `_shared/*.ts`,
  loosely (no Deno lib types) — every error reported is an expected
  Deno-ism (`.ts`-suffixed imports, the `Deno` global), not a real bug.
- `node --check` on `community/krunker-connect.js` and every inline
  `<script>` block in `account-settings.html`/`profile.html` — all
  parse clean.
- `supabase/functions/_shared/auth.test.ts` (new) covers the
  network-free pure functions — token format/uniqueness, the SHA-256
  known vector, constant-time comparison, username
  normalization/validation — but has **not** been run with `deno
  test`, since no `deno` binary was available here. `deno check` /
  `deno test` (via `supabase/functions/deno.json`'s tasks) are the
  next actual verification step for whoever deploys this.
- No RLS policy or Edge Function was exercised against a live
  Supabase project
in this environment (no Deno runtime / network access available
here). If Deno tooling is available in your environment, that would
be the natural next step:
```
deno check supabase/functions/**/*.ts
```
Manual test scenarios worth running by hand once deployed: full
connect → pending → disconnect cycle; two browser sessions trying to
connect the same Krunker username (second should get
`already_connected`/`account_already_linked`); rapid-clicking
"Generate New Code" more than 5 times in 15 minutes (should hit the
DB rate-limit trigger); verifying `krunker_profile_cache` and
`krunker_connections` are unreadable for a second, unrelated logged-in
user via the Supabase client directly (RLS check).

## 7. Known limitations (restated from section 2-3 above)

- Social Feed ownership verification is **not automatic yet** —
  every new connection stays `pending` until a safe read method for
  Krunker Social Feed is confirmed and wired into
  `getSocialFeedProvider()`.
- Stats sync is experimental and off by default; maps/mods sync is
  unsupported unconditionally, pending confirmation of what
  `map-data`/`mod-data` in the WebSocket profile response actually
  contain and whether they distinguish "created by" from "played by".
- `krunker_connections.krunker_user_id` will stay `null` in practice
  until a provider confirms a stable Krunker account id field.
- Username uniqueness enforcement (`krunker_username_normalized`) is
  a best-effort substitute for a stable id — see the comment in the
  SQL migration about renamed accounts.
