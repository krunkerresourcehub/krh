# Setup Guide — Account & Role System

Your site is **static** (just HTML/JS, hosted on GitHub Pages). To make the
login/role system actually secure (not just localStorage, which can easily
be tampered with via the browser console), everything runs through
**Supabase** — a free backend (database + auth + Discord OAuth built in).

## 1. Create a Supabase project
1. Go to https://supabase.com → Sign up (you can use GitHub) → **New Project**.
2. Give it any name, set a database password (save it somewhere safe), and
   pick the closest region (Singapore is closest to Indonesia/Southeast Asia).
3. Wait ~2 minutes for the project to finish being created.

## 2. Run the database schema
1. In the Supabase sidebar, open **SQL Editor**.
2. Copy the entire contents of `sql/schema.sql` (in this folder), paste it
   in, and click **Run**.
3. This creates the `profiles` table (user data) and `posts` table
   (posts), plus security rules (RLS) that actually lock down who can do
   what.

## 3. Get your URL & API Key
1. Sidebar → **Project Settings** → **API**.
2. Copy the **Project URL** and the key named **publishable** (in newer
   projects, Supabase renamed "anon public" to "publishable" — same
   function, safe to use in public-facing code).
3. Open `community/supabase-client.js` and fill in the first two lines.

⚠️ **NEVER** use the key named **secret** (formerly called
"service_role") in any file that goes into the site/repo. That key can
access the entire database without limits, bypassing all security rules
(RLS). Your site is static and doesn't need that key at all — keep it
somewhere safe, never in the code.

## 4. Set up Discord OAuth (for identity verification at signup)
1. Go to https://discord.com/developers/applications → **New Application**.
2. Go to the **OAuth2** tab → note down the **Client ID** and
   **Client Secret**.
3. Under **OAuth2 > Redirects**, add the redirect URL from Supabase
   (format: `https://xxxxxxxx.supabase.co/auth/v1/callback` — you can copy
   it in the next step).
4. Back in Supabase → **Authentication** → **Providers** → find **Discord**
   → enable it → paste the Client ID & Client Secret from Discord → Save.
5. In Supabase → **Authentication** → **URL Configuration**, add your
   site's domain (e.g. `https://username.github.io`) to **Redirect URLs**,
   so that after connecting Discord it redirects back to your site.

## 5. Disable email confirmation (optional, lets users log in right away)
By default, Supabase requires users to click a confirmation link in their
email before they can log in. If your site doesn't have its own email
server yet and you want users to be able to use their account right away:
1. **Authentication** → **Providers** → **Email** → turn off **Confirm email**.

If you want to keep it on (safer against spam accounts), just leave the
default enabled.

## 6. Enable Password Reset (Forgot Password)
The `login.html` page now has a "Forgot your password?" link that sends a
reset email via Supabase. To make the link redirect back to your own site
(not Supabase's default localhost):
1. Supabase → **Authentication** → **URL Configuration**.
2. Under **Redirect URLs**, make sure your site's domain is already there
   (it should have been added in step 4.5 above) — if your site is on
   GitHub Pages, this automatically covers
   `community/reset-password.html` too.
3. Done — users can just click "Forgot your password?" on the login page,
   enter their email, and follow the link sent to their inbox.

## 7. Set the first Developer
The Developer role (the highest role) **cannot** be granted from the web
panel — this is intentional, so no one can escalate themselves to
Developer through an exploit.

1. Sign up your first account through the website
   (`community/signup.html`) as usual.
2. Go back to Supabase → **SQL Editor**, and run:
   ```sql
   update public.profiles set role = 'developer' where username = 'YOUR_USERNAME';
   ```
3. Your account can now access `community/developer.html` to
   promote/demote Admins.

## 8. Deploy
Push all the files (including the `community/` and `sql/` folders) to
GitHub Pages as usual. `sql/schema.sql` is fine to keep in the repo (it's
just the database structure, not secret data) — but if you want to keep
things tidier, you can also store it outside the published folder.

## User flow summary
- **Not logged in** → can only view published posts (view only).
- **Sign up** → connect Discord first (identity verification) → fill in
  name, username, email, password, date of birth, gender, Krunker
  username → account created.
- **Regular user** (logged in) → can create posts, publish/unpublish,
  edit, and delete posts **they own**.
- **Admin** → can publish/unpublish & delete **anyone's** posts, but
  cannot manage user roles.
- **Developer** → all Admin abilities + can promote/demote Admins via
  `community/developer.html`.

## Custom Crosshair Maker & the Crosshairs tab
- `crosshair-maker.html` (in the root, not in `community/`) — a tool for
  building your own crosshair (color, thickness, length, gap, dot,
  outline, T-style), with a live canvas preview and a **Copy Code**
  button to copy the result.
- `community/crosshairs.html` — a gallery of crosshairs posted by other
  users. Anyone can view it (no login required), but only logged-in users
  can **post their own crosshair**. The "Post this Crosshair" button in
  the Crosshair Maker automatically brings the code here.
- This uses the same `posts` table as the regular post system, just
  distinguished by the `category` column (`general` or `crosshair`). If
  your Supabase project **already had the schema run before this
  feature was added**, run this addition in the SQL Editor:
  ```sql
  alter table public.posts add column if not exists category text not null default 'general' check (category in ('general','crosshair'));
  ```
  If you're setting up from scratch, just run the latest version of
  `sql/schema.sql` — this column is already included there.

## Overlay & Icons Sections (Crosshair)
- **Overlay** is now just a folder — containing two subtabs:
  `Damage Overlays` and `Game Overlays`.
- **Icons** has four subtabs: `Kill`, `Death`, `Ammo`, `Streak Counter`.
- All six of those subtabs use `community/image-section.html` — the post
  form has **Name**, **upload 1 image (PNG)**, and **Description**. The
  image goes into the `crosshairs` bucket, and the data is stored in the
  `content` column as JSON: `{ file_url, description }`.
- Before using this, run `sql/add_overlay_category.sql` in the Supabase
  SQL Editor so the new category passes the constraint.

## Files you need to fill in
- `community/supabase-client.js` → Supabase URL & anon key (required).

All other code is ready to use as-is, no further changes needed.

## History Logs (staff action audit trail)
- **You must run `sql/add_history_logs.sql`** in the Supabase SQL Editor
  first. If you don't, the History Logs page will show an error message.
- Page location: `community/logs.html`; the link automatically appears in
  the topnav Dashboard / Admin Panel / Developer Panel, **for admins and
  developers only**.
- What gets logged automatically:
  - Posts: publish, unpublish, edit (staff editing another user's post),
    delete
  - Users: ban, unban, warn
  - Roles: granting / revoking Admin
  - Ban appeals: approve, reject
  - Comments: deleting another user's comment
  Actions on one's own content (editing/deleting your own post) are
  **not** logged — this is a moderation log, not a personal activity log.
- The table is **append-only**: there are no UPDATE/DELETE policies at
  all, so logs cannot be edited or deleted through the website — not even
  by a developer. If you want to clean up old logs, there's a manual
  query for that at the bottom of `sql/add_history_logs.sql`.
- The log stores a **snapshot** of the username and post title, so
  entries remain readable even if the post has since been deleted or the
  account no longer exists.
- **Performance note**: the logs page only fetches 25 rows per page, and
  all filtering/sorting/paging is done in the database. If you've
  previously run an older version of this SQL file, **re-run**
  `sql/add_history_logs.sql` — the index & policies get updated, and your
  data stays safe.
- Want to add a new action type? Add the action name to
  `check (action in (...))` in the SQL, then to `LOG_ACTIONS`
  (`supabase-client.js`) and `describe()` (`logs.html`) for the label and
  message text.

## Rate Limiting (anti-spam for posts & comments)
- **You must run `sql/add_rate_limiting.sql`** in the Supabase SQL
  Editor.
- Blocks posts within <20 seconds and comments within <5 seconds of the
  user's last one. This is enforced at the **database** level (trigger),
  not just in JS — so it still blocks even if someone calls the Supabase
  API directly via a script, bypassing the website entirely.
- Admins and developers are exempt from this limit.
- If the limit is hit, an error message automatically appears in the
  form's message box (post/comment) — no further code changes needed.

## Upload Size Limit (crosshair images, CSS files & previews, other file
posts)
- Already active automatically, no extra setup needed.
- The limit is per **file type**, not per role: regular files (images,
  .txt, .css, .js, etc.) max **5MB**. **.zip** files specifically (used
  in the Mods — Mods Files category) max **30MB**.
- This is validated client-side (JS) — enough to catch accidental
  oversized uploads and prevent unnecessary storage waste from normal
  use. This is NOT a security measure (someone determined could still
  upload directly via the API), so if storage abuse becomes a real
  problem, also add size limits in **Supabase Dashboard > Storage >
  (bucket) > Settings** for each bucket (`crosshairs`, `post-files`,
  `post-previews`) so it's enforced server-side too.
- Want to change the numbers? Edit `UPLOAD_MAX_BYTES_DEFAULT` and
  `UPLOAD_MAX_BYTES_ZIP` in `community/supabase-client.js`.

## CAPTCHA / Anti-Bot on Signup (optional, but recommended)
Signup already requires connecting Discord first as step 1, which is
already a fairly big barrier for ordinary bots. If you want to add
another layer (e.g. as the site becomes more well-known and starts
getting real bot registrations):
1. Go to https://dash.cloudflare.com/?to=/:account/turnstile → create a
   new widget (Cloudflare Turnstile, free). Any domain is fine for
   testing.
2. Copy the **Site Key**, and paste it into `TURNSTILE_SITE_KEY` near the
   top of the script in `community/signup.html`.
3. Copy the **Secret Key**, and paste it in Supabase Dashboard →
   **Authentication** → **Settings** → **Bot and Abuse Protection** →
   enable **Turnstile** → paste the secret key there → Save.
4. Done — Supabase verifies the token server-side, your site doesn't need
   any extra backend. If `TURNSTILE_SITE_KEY` is left empty, signup works
   as normal without a captcha (current default).

## Security Hardening (Required — personal data, storage, chat rate
limiting)
- **You must run `sql/fix_security_issues.sql`** in the Supabase SQL
  Editor, AFTER all the other `sql/*.sql` files have been run at least
  once. Safe to run multiple times.
- This fixes 3 things:
  1. **Personal data leaking publicly** — previously `birthdate`,
     `gender`, `discord_id`, `discord_username`, `ban_reason`,
     `banned_at`, and `banned_by` were readable by anyone (including
     logged-out visitors, and directly via the Supabase API without even
     opening the site) because they lived in the public `profiles`
     table. These fields have now been moved to a new `profile_private`
     table, readable only by the account owner or staff
     (admin/developer).
  2. **Banned users could still upload files** — uploads to the
     `avatars`, `crosshairs`, and `post-files` buckets are now blocked
     while an account is banned (uploading ban-appeal proof is still
     allowed, as intended).
  3. **DMs & Public Chat had no rate limit** — now limited to 1 message
     every 2 seconds per user (enforced at the database level, not just
     JS), same as the post/comment rate limit. Admins and developers are
     exempt.
- After running this file, `community/supabase-client.js`,
  `signup.html`, `account-settings.html`, and `developer.html` in this
  repo have already been updated to read/write to `profile_private` —
  no further code changes needed.
- **You must also run `sql/fix_dm_update_policies.sql`** in the Supabase
  SQL Editor, AFTER `sql/add_direct_messages.sql` has been run. Safe to
  run multiple times. This fixes the UPDATE policy on `messages` &
  `conversations`, which was only meant to mark messages as "read" /
  update `last_message_at`, but didn't lock down the other columns — so
  one of the DM participants could change the content of an already-sent
  message, change who appears as the sender (framing), or change who the
  conversation is with. This file adds a trigger that locks those
  columns down so that only `read` (on messages) can actually be changed
  via an update.
- **Recommended (optional, defense-in-depth):
  `sql/fix_storage_mime_types.sql`** — every upload form on this site
  only checks the file extension in JS (easily bypassed by calling the
  Supabase API directly), and none of the storage RLS policies lock down
  file type/size server-side. This file sets MIME type + size limits
  directly at the Supabase bucket level (a native feature, not a hack).
  If you get a "column does not exist" error, it means your Supabase
  version doesn't support that column yet — it's safe to skip for now.
