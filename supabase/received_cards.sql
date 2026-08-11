-- Received (paper) business cards: photo + manually-entered fields, no OCR yet.
-- Also enables Realtime on `exchanges` so card owners get a live save notification.
-- Run once in the Supabase SQL Editor (after schema.sql has already been applied).

alter publication supabase_realtime add table public.exchanges;

create table if not exists public.received_cards (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  event_name text,
  received_date date not null default current_date,
  photo_path text not null,
  created_at timestamptz not null default now()
);

create index if not exists received_cards_owner_id_idx on public.received_cards (owner_id, created_at desc);

alter table public.received_cards enable row level security;

create policy "received_cards_select_own" on public.received_cards
  for select using (auth.uid() = owner_id);
create policy "received_cards_insert_own" on public.received_cards
  for insert with check (auth.uid() = owner_id);
create policy "received_cards_delete_own" on public.received_cards
  for delete using (auth.uid() = owner_id);

-- Private bucket: these are photos of third parties, unlike the public avatars bucket.
insert into storage.buckets (id, name, public)
values ('received-cards', 'received-cards', false)
on conflict (id) do nothing;

drop policy if exists "received_cards_storage_insert_own" on storage.objects;
create policy "received_cards_storage_insert_own" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'received-cards' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "received_cards_storage_select_own" on storage.objects;
create policy "received_cards_storage_select_own" on storage.objects
  for select to authenticated
  using (bucket_id = 'received-cards' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "received_cards_storage_delete_own" on storage.objects;
create policy "received_cards_storage_delete_own" on storage.objects
  for delete to authenticated
  using (bucket_id = 'received-cards' and (storage.foldername(name))[1] = auth.uid()::text);
