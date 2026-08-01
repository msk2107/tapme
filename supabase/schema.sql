-- TapMe MVP schema
-- Supabase 프로젝트의 SQL Editor에 이 파일 전체를 붙여넣고 "Run" 하세요.

create extension if not exists pgcrypto;

-- ========== events ==========
-- 사용자가 등록한 행사 목록. 나중에 캘린더 연동 시 source/external_id로 확장 가능.
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  start_date date not null,
  end_date date not null,
  source text not null default 'manual',
  external_id text,
  created_at timestamptz not null default now(),
  constraint events_date_order check (end_date >= start_date)
);

create index if not exists events_user_id_idx on public.events (user_id);
create index if not exists events_date_range_idx on public.events (user_id, start_date, end_date);

alter table public.events enable row level security;

create policy "events_select_own" on public.events
  for select using (auth.uid() = user_id);
create policy "events_insert_own" on public.events
  for insert with check (auth.uid() = user_id);
create policy "events_update_own" on public.events
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "events_delete_own" on public.events
  for delete using (auth.uid() = user_id);

-- ========== profiles ==========
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text unique not null,
  name text not null default '',
  title text not null default '',
  company text not null default '',
  current_event_id uuid references public.events (id) on delete set null,
  current_event_banner_dismissed_for uuid,
  kakao_value text not null default '',
  kakao_visible boolean not null default true,
  instagram_value text not null default '',
  instagram_visible boolean not null default true,
  linkedin_value text not null default '',
  linkedin_visible boolean not null default true,
  facebook_value text not null default '',
  facebook_visible boolean not null default true,
  phone_value text not null default '',
  phone_visible boolean not null default true,
  email_value text not null default '',
  email_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint username_format check (username ~ '^[a-z0-9_-]{3,30}$')
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- updated_at 자동 갱신
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ========== exchanges ==========
-- 방문자가 프로필에서 항목을 저장하면 생기는 기록.
-- 서버(서비스 역할 키)에서만 INSERT 하므로 anon/authenticated INSERT 정책은 두지 않는다.
create table if not exists public.exchanges (
  id uuid primary key default gen_random_uuid(),
  card_owner_id uuid not null references auth.users (id) on delete cascade,
  viewer_id uuid references auth.users (id) on delete set null,
  viewer_name text,
  event_name text,
  saved_fields text[] not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists exchanges_card_owner_idx on public.exchanges (card_owner_id, created_at desc);

alter table public.exchanges enable row level security;

create policy "exchanges_select_own" on public.exchanges
  for select using (auth.uid() = card_owner_id);

-- ========== public profile lookup ==========
-- /u/[username] 페이지가 서비스 역할 키로 username -> id를 조회할 때 사용.
-- (서비스 역할 키는 RLS를 우회하므로 별도 정책 불필요. 참고용 인덱스만 추가)
create index if not exists profiles_username_idx on public.profiles (username);
