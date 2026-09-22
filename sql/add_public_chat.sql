-- =========================================================
--  Migration: Public Chat (global chat room)
--  Run this ONCE in Supabase Dashboard > SQL Editor.
--  Versi RERUNNABLE — aman dijalankan berkali-kali.
--
--  A single shared room every logged-in user can read and post in —
--  unlike conversations/messages (DMs), there's no "participant" list,
--  everyone with an account can see every row here.
-- =========================================================

create table if not exists public.public_messages (
  id          uuid primary key default gen_random_uuid(),
  sender_id   uuid not null references public.profiles(id) on delete cascade,
  content     text not null,
  created_at  timestamptz not null default now()
);

alter table public.public_messages enable row level security;

-- Anyone who's logged in can read the global chat.
drop policy if exists "public_messages_select_logged_in" on public.public_messages;
create policy "public_messages_select_logged_in"
on public.public_messages for select
to authenticated
using (true);

-- You can only post as yourself, and only if you're not banned.
drop policy if exists "public_messages_insert_own" on public.public_messages;
create policy "public_messages_insert_own"
on public.public_messages for insert
with check (
  auth.uid() = sender_id
  and not coalesce((select banned from public.profiles where id = auth.uid()), false)
);

create index if not exists public_messages_created_at_idx on public.public_messages (created_at);