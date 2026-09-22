-- =========================================================
--  Migration: Direct Messages (DMs)
--  Run this ONCE in Supabase Dashboard > SQL Editor.
--  Versi RERUNNABLE — aman dijalankan berkali-kali.
--
--  One-on-one conversations only (no group chats). The app always stores
--  the two participants with user1_id < user2_id (as plain UUID text
--  comparison) so the same pair of people can never end up with two
--  separate conversation rows.
-- =========================================================

create table if not exists public.conversations (
  id               uuid primary key default gen_random_uuid(),
  user1_id         uuid not null references public.profiles(id) on delete cascade,
  user2_id         uuid not null references public.profiles(id) on delete cascade,
  created_at       timestamptz not null default now(),
  last_message_at  timestamptz not null default now(),
  check (user1_id <> user2_id),
  unique (user1_id, user2_id)
);

alter table public.conversations enable row level security;

drop policy if exists "conversations_select_participant" on public.conversations;
create policy "conversations_select_participant"
on public.conversations for select
using (auth.uid() = user1_id or auth.uid() = user2_id);

drop policy if exists "conversations_insert_participant" on public.conversations;
create policy "conversations_insert_participant"
on public.conversations for insert
with check (
  (auth.uid() = user1_id or auth.uid() = user2_id)
  and not coalesce((select banned from public.profiles where id = auth.uid()), false)
);

-- Needed so sending a message can bump last_message_at on the conversation.
drop policy if exists "conversations_update_participant" on public.conversations;
create policy "conversations_update_participant"
on public.conversations for update
using (auth.uid() = user1_id or auth.uid() = user2_id)
with check (auth.uid() = user1_id or auth.uid() = user2_id);

create index if not exists conversations_user1_id_idx on public.conversations (user1_id);
create index if not exists conversations_user2_id_idx on public.conversations (user2_id);

create table if not exists public.messages (
  id               uuid primary key default gen_random_uuid(),
  conversation_id  uuid not null references public.conversations(id) on delete cascade,
  sender_id        uuid not null references public.profiles(id) on delete cascade,
  content          text not null,
  read             boolean not null default false,
  created_at       timestamptz not null default now()
);

alter table public.messages enable row level security;

drop policy if exists "messages_select_participant" on public.messages;
create policy "messages_select_participant"
on public.messages for select
using (
  exists (
    select 1 from public.conversations c
    where c.id = conversation_id
      and (c.user1_id = auth.uid() or c.user2_id = auth.uid())
  )
);

drop policy if exists "messages_insert_participant" on public.messages;
create policy "messages_insert_participant"
on public.messages for insert
with check (
  auth.uid() = sender_id
  and not coalesce((select banned from public.profiles where id = auth.uid()), false)
  and exists (
    select 1 from public.conversations c
    where c.id = conversation_id
      and (c.user1_id = auth.uid() or c.user2_id = auth.uid())
  )
);

-- Needed so the recipient can mark messages as read when they open the thread.
drop policy if exists "messages_update_participant" on public.messages;
create policy "messages_update_participant"
on public.messages for update
using (
  exists (
    select 1 from public.conversations c
    where c.id = conversation_id
      and (c.user1_id = auth.uid() or c.user2_id = auth.uid())
  )
)
with check (true);

create index if not exists messages_conversation_id_created_at_idx on public.messages (conversation_id, created_at);
