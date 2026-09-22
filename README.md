# Krunker Resource Hub

**Krunker Resource Hub (KRH)** is a community-driven resource website for the
browser game [Krunker.io](https://krunker.io). It brings together crosshairs,
custom CSS themes, settings files, maps, mods, and scripts made by the
community, alongside a set of in-browser tools that let players build their
own resources without writing a single line of code.

The site is built as a **static website** (plain HTML, CSS, and JavaScript)
designed to be hosted for free on **GitHub Pages**, with all dynamic
functionality — accounts, roles, posts, moderation, messaging — powered by
**[Supabase](https://supabase.com)** as the backend (PostgreSQL database +
Auth + file storage).

> Made by **Aura Gangs Team**.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
  - [Public Tools](#public-tools)
  - [Community Platform](#community-platform)
  - [Account Roles & Moderation](#account-roles--moderation)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Setup](#setup)
- [License](#license)

---

## Overview

Krunker Resource Hub works as a hub in two parts:

1. **Resource browser** — a searchable, categorized library of
   community-submitted content (crosshairs, CSS, settings, maps, mods,
   scripts), displayed on the homepage (`index.html`) through a sidebar of
   sections and a content panel that loads posts dynamically.
2. **Builder tools** — a set of standalone, no-login-required visual
   generators that let anyone create their own Krunker resources directly in
   the browser and export/share the result.

On top of that sits a full **community platform**: user accounts, profiles,
following, direct messages, notifications, comments, reactions, saved posts,
and a staff moderation system (admin/developer roles, bans, ban appeals,
history/audit logs).

---

## Features

### Public Tools

These tools work standalone, without an account:

| Page | Purpose |
|---|---|
| `crosshair-maker.html` | Design a custom Krunker crosshair visually and export it as a PNG. |
| `css-generator.html` | Visual builder for custom Krunker CSS themes — no coding needed. |
| `generator.html` | Visual builder for a custom Krunker settings file. |
| `ks-generator.html` | Visual builder for a KrunkScript userscript. |
| `game-servers.html` | Live Krunker.io server browser — filter lobbies by mode/region, see live player counts, and quick-join a random game. |
| `official-css.html` | Browse official, ready-to-use Krunker CSS files. |

Supporting scripts for these tools include `builder.js`, `css-generator.js`,
`generator.js`, `ks-generator.js`, `game-servers.js`, and
`crosshair-render.js`, plus large reference/template files such as
`css-template-source.css` and `official.css`.

### Community Platform

Located under `/community`, this is the account-based side of the site,
backed by Supabase:

- **Accounts** — sign up, log in, forgot/reset password
  (`signup.html`, `login.html`, `forgot-password.html`,
  `reset-password.html`), with optional **Discord OAuth** for identity
  verification at signup.
- **Profiles** — public profile pages with bio, avatar, and follower system
  (`profile.html`).
- **Posts** — users can publish resources (crosshairs, CSS, settings, maps,
  mods, scripts) into categorized sections, with comments, reactions, and a
  "saved posts" list (`section.html`, `post.html`, `css-post.html`,
  `image-section.html`, `saved.html`, `crosshairs.html`).
- **Messaging** — direct messages between users, including image
  attachments, plus an inbox for notifications (`messages.html`,
  `inbox.html`).
- **Account settings** — profile editing, avatar upload, and theme
  preferences (`account-settings.html`, `settings.html`).

### Account Roles & Moderation

The platform has three roles: `user`, `admin`, and `developer`, enforced at
the database level via Supabase Row Level Security (RLS):

- **Admin Panel** (`admin.html`) — content and user moderation tools.
- **Developer Panel** (`developer.html`) — highest-privilege panel, able to
  change user roles.
- **Ban system** — banning users, a dedicated "Account Banned" page
  (`banned.html`), and a **ban appeals** flow.
- **History Logs** (`logs.html`) — an audit trail of moderation and account
  actions.
- **Rate limiting** — abuse-prevention rules enforced server-side.

---

## Project Structure

```
krh-main/
├── index.html                # Homepage — resource browser (sections, search, feed)
├── manifest.json             # PWA manifest (name, icons, theme colors)
├── robots.txt
├── 404.html                  # Custom not-found page
├── style.css                 # Global site styles
│
├── crosshair-maker.html      # Crosshair builder tool
├── crosshair-render.js
├── css-generator.html        # CSS builder tool
├── css-generator.js
├── css-template-source.css
├── generator.html            # Settings builder tool
├── generator.js
├── ks-generator.html         # KrunkScript builder tool
├── ks-generator.js
├── game-servers.html         # Live server browser
├── game-servers.js
├── official-css.html         # Official CSS file browser
├── official.css
├── builder.js                # Shared builder logic
│
├── community/                 # Account-based community platform
│   ├── login.html / signup.html / forgot-password.html / reset-password.html
│   ├── profile.html / account-settings.html / settings.html
│   ├── messages.html / inbox.html / saved.html
│   ├── section.html / post.html / css-post.html / image-section.html / crosshairs.html
│   ├── admin.html / developer.html / banned.html / logs.html
│   ├── supabase-client.js    # Supabase client + shared frontend logic
│   ├── community.css         # Community platform styles
│   └── SETUP_GUIDE.md        # Step-by-step Supabase/Discord setup guide (Indonesian)
│
├── sql/                       # Supabase (PostgreSQL) schema & migrations
│   ├── schema.sql             # Core tables: profiles, posts, RLS policies
│   ├── add_ban_system.sql / add_ban_appeals.sql
│   ├── add_direct_messages.sql / add_dm_images.sql
│   ├── add_notifications_and_comment_features.sql
│   ├── add_reactions_saves.sql
│   ├── add_bio_and_follows.sql
│   ├── add_avatar.sql
│   ├── add_theme_settings.sql
│   ├── add_history_logs.sql
│   ├── add_rate_limiting.sql
│   ├── add_public_chat.sql
│   ├── add_crosshair_storage.sql / add_post_files_storage.sql / add_post_previews_storage.sql
│   ├── add_overlay_category.sql / update_categories.sql
│   ├── fix_dm_update_policies.sql / fix_storage_mime_types.sql / fix_security_issues.sql
│   ├── set_developer.sql
│   └── clear_crosshairs.sql
│
├── kr-docs/                    # Documentation microsite (separate docs system)
│   ├── index.html / index.js / search.js / theme.css / _sidebar.md
│   ├── README.md / CNAME
│   ├── favicon/
│   └── files/
│
├── resources/
│   ├── maps/                   # Community/official map resources
│   └── userscripts/            # Userscript resources
│
├── assets/                     # Site branding & effects
│   ├── logo.png, favicon.ico, favicon-16x16.png, favicon-32x32.png,
│   │ favicon-48x48.png, apple-touch-icon.png
│   └── site-glow.css / site-glow.js   # Background glow/visual effects
│
├── LICENSE                     # Copyright / usage terms
└── COPYRIGHT.txt
```

## Tech Stack

- **Frontend:** Static HTML5, CSS3, vanilla JavaScript (no framework/build
  step required) — deployable as-is on GitHub Pages or any static host.
- **Backend:** [Supabase](https://supabase.com) — PostgreSQL database,
  Authentication (email/password + Discord OAuth), Row Level Security for
  access control, and Storage (avatars, crosshair files, post images/files,
  post previews).
- **Fonts/Icons:** Google Fonts (Baloo 2, Plus Jakarta Sans, Inter) and Font
  Awesome (via CDN).
- **PWA-ready:** includes a web app manifest and icon set.

## Setup

Full step-by-step setup instructions (creating a Supabase project, running
the database schema, configuring Discord OAuth, email confirmation, and
password reset) are documented in
[`community/SETUP_GUIDE.md`](community/SETUP_GUIDE.md).

**⚠️ Security note:** never place your Supabase **secret** key (formerly
`service_role`) anywhere in the site's code or repository. Only the
**publishable** (`anon`) key belongs in `community/supabase-client.js` — it
is safe for public/client-side use because access is governed by Row Level
Security policies defined in `sql/schema.sql` and the other migration files.

## License

This project is **All Rights Reserved**. See [`LICENSE`](LICENSE) and
[`COPYRIGHT.txt`](COPYRIGHT.txt) for full terms.

© 2026 Krunker Resource Hub. All Rights Reserved.
