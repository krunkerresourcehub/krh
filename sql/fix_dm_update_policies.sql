-- =========================================================
--  Migration: Lock down DM update policies
--  Run this ONCE in Supabase Dashboard > SQL Editor, AFTER
--  add_direct_messages.sql has already been run.
--  Versi RERUNNABLE — aman dijalankan berkali-kali.
--
--  Fixes 2 issues in add_direct_messages.sql's UPDATE policies:
--
--   A. "messages_update_participant" was meant to let the recipient
--      mark a message read (with check (true) — no restriction at
--      all), which actually let EITHER participant rewrite a
--      message's content after it was sent, or change sender_id to
--      make it look like the other person said something they
--      didn't. Fix: a trigger forces content/sender_id/
--      conversation_id/created_at back to their original values on
--      every update — only `read` can actually change.
--
--   B. "conversations_update_participant" was meant to let a
--      participant bump last_message_at, but its with check only
--      re-confirms the actor is STILL a participant afterward — it
--      never locks user1_id/user2_id themselves, so a participant
--      could rewrite the other side of the conversation to a
--      different user entirely. Fix: same pattern, lock
--      user1_id/user2_id/created_at.
-- =========================================================

create or replace function public.lock_message_fields()
returns trigger language plpgsql as $$
begin
  new.content := old.content;
  new.sender_id := old.sender_id;
  new.conversation_id := old.conversation_id;
  new.created_at := old.created_at;
  return new;
end;
$$;

drop trigger if exists trg_messages_lock_fields on public.messages;
create trigger trg_messages_lock_fields
before update on public.messages
for each row execute function public.lock_message_fields();


create or replace function public.lock_conversation_fields()
returns trigger language plpgsql as $$
begin
  new.user1_id := old.user1_id;
  new.user2_id := old.user2_id;
  new.created_at := old.created_at;
  return new;
end;
$$;

drop trigger if exists trg_conversations_lock_fields on public.conversations;
create trigger trg_conversations_lock_fields
before update on public.conversations
for each row execute function public.lock_conversation_fields();
