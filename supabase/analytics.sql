-- Card analytics: profile view counts + referral signup tracking.
-- Run once in the Supabase SQL Editor (after schema.sql has already been applied).

create table if not exists public.profile_views (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists profile_views_profile_id_idx on public.profile_views (profile_id);

alter table public.profile_views enable row level security;

create policy "profile_views_select_own" on public.profile_views
  for select using (auth.uid() = profile_id);

-- Rows are written only from the public profile page's server render, using the
-- service-role client, so no INSERT policy is granted to anon/authenticated roles.

create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid not null references auth.users (id) on delete cascade,
  referred_user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (referred_user_id)
);

create index if not exists referrals_referrer_id_idx on public.referrals (referrer_id);

alter table public.referrals enable row level security;

create policy "referrals_select_own" on public.referrals
  for select using (auth.uid() = referrer_id);

-- A newly-signed-up user may record who referred them, but only naming
-- themselves as the referred party.
create policy "referrals_insert_self" on public.referrals
  for insert with check (auth.uid() = referred_user_id);
