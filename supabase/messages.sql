-- Real-time 1:1 messaging between TapMe users.
-- Run once in the Supabase SQL Editor (after schema.sql has already been applied).

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_a_id uuid not null references auth.users (id) on delete cascade,
  user_b_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  last_message_at timestamptz not null default now(),
  unique (user_a_id, user_b_id)
);

-- user_a_id/user_b_id must always be stored with the lexicographically
-- smaller uuid first (enforced in app code via sortedPair()) so this unique
-- constraint actually dedupes a pair regardless of who starts the chat.
create index if not exists conversations_user_a_idx on public.conversations (user_a_id, last_message_at desc);
create index if not exists conversations_user_b_idx on public.conversations (user_b_id, last_message_at desc);

alter table public.conversations enable row level security;

create policy "conversations_select_own" on public.conversations
  for select using (auth.uid() = user_a_id or auth.uid() = user_b_id);
create policy "conversations_insert_own" on public.conversations
  for insert with check (auth.uid() = user_a_id or auth.uid() = user_b_id);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id uuid not null references auth.users (id) on delete cascade,
  recipient_id uuid not null references auth.users (id) on delete cascade,
  sender_name text not null,
  body text not null,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create index if not exists messages_conversation_idx on public.messages (conversation_id, created_at);
create index if not exists messages_recipient_idx on public.messages (recipient_id, created_at desc);

alter table public.messages enable row level security;

create policy "messages_select_own" on public.messages
  for select using (auth.uid() = sender_id or auth.uid() = recipient_id);

-- Only lets you send as yourself, into a conversation you and the named
-- recipient are actually both part of.
create policy "messages_insert_own" on public.messages
  for insert with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (
          (c.user_a_id = sender_id and c.user_b_id = recipient_id)
          or (c.user_b_id = sender_id and c.user_a_id = recipient_id)
        )
    )
  );

-- Recipients mark messages read; nothing else about a message is editable.
create policy "messages_update_read" on public.messages
  for update using (auth.uid() = recipient_id) with check (auth.uid() = recipient_id);

create or replace function public.touch_conversation_last_message()
returns trigger
language plpgsql
as $$
begin
  update public.conversations set last_message_at = new.created_at where id = new.conversation_id;
  return new;
end;
$$;

drop trigger if exists messages_touch_conversation on public.messages;
create trigger messages_touch_conversation
  after insert on public.messages
  for each row execute function public.touch_conversation_last_message();

alter publication supabase_realtime add table public.messages;
