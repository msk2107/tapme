-- Admin dashboard: authorization, growth metrics, and operator tools.
-- Run once in the Supabase SQL Editor (after schema.sql / avatar.sql / analytics.sql).

-- ========== admin flag + founding-member numbering ==========

alter table public.profiles add column if not exists is_admin boolean not null default false;
alter table public.profiles add column if not exists signup_number integer;

-- Backfill existing rows in signup order, then hand off to a sequence for new rows.
with ordered as (
  select id, row_number() over (order by created_at asc) as rn
  from public.profiles
  where signup_number is null
)
update public.profiles p set signup_number = ordered.rn
from ordered where ordered.id = p.id;

create sequence if not exists public.profiles_signup_number_seq;
select setval('public.profiles_signup_number_seq', coalesce((select max(signup_number) from public.profiles), 0));
alter table public.profiles alter column signup_number set default nextval('public.profiles_signup_number_seq');
alter table public.profiles alter column signup_number set not null;
create unique index if not exists profiles_signup_number_idx on public.profiles (signup_number);

-- One-time: mark the operator's own account as admin.
update public.profiles set is_admin = true
where id = (select id from auth.users where email = 'msk2107@gmail.com');

-- ========== event-scoped filtering support ==========

alter table public.profile_views add column if not exists event_name text;
alter table public.referrals add column if not exists event_name text;
alter table public.events add column if not exists is_partner boolean not null default false;

-- ========== announcements ==========

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  message text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users (id)
);

alter table public.announcements enable row level security;

-- Any logged-in user's dashboard reads the current banner directly.
create policy "announcements_select_active" on public.announcements
  for select using (active = true);

-- ========== feature flags ==========

create table if not exists public.feature_flags (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  enabled boolean not null default false,
  rollout_percent int not null default 100,
  created_at timestamptz not null default now()
);

alter table public.feature_flags enable row level security;

-- Not sensitive; regular sessions need to read this to evaluate their own bucket.
create policy "feature_flags_select_all" on public.feature_flags
  for select using (true);

-- ========== feedback ==========

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references auth.users (id) on delete cascade,
  viewer_id uuid references auth.users (id) on delete set null,
  message text not null,
  created_at timestamptz not null default now()
);

create index if not exists feedback_profile_id_idx on public.feedback (profile_id);

alter table public.feedback enable row level security;
-- Admin-only (no policies) — written via the service-role client, read via /admin.

-- ========== admin access log ==========

create table if not exists public.admin_access_log (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references auth.users (id),
  viewed_user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists admin_access_log_admin_id_idx on public.admin_access_log (admin_id, created_at desc);

alter table public.admin_access_log enable row level security;
-- Admin-only (no policies).

-- ========== reporting functions (service-role only) ==========

create or replace function public.admin_overview_stats(p_event_name text default null)
returns table (
  total_users bigint,
  users_7d bigint,
  users_30d bigint,
  total_views bigint,
  total_saves bigint,
  total_referrals bigint
)
language sql
as $$
  select
    (select count(*) from public.profiles) as total_users,
    (select count(*) from auth.users where created_at >= now() - interval '7 days') as users_7d,
    (select count(*) from auth.users where created_at >= now() - interval '30 days') as users_30d,
    (select count(*) from public.profile_views where p_event_name is null or event_name = p_event_name) as total_views,
    (select count(*) from public.exchanges where p_event_name is null or event_name = p_event_name) as total_saves,
    (select count(*) from public.referrals where p_event_name is null or event_name = p_event_name) as total_referrals;
$$;

revoke all on function public.admin_overview_stats(text) from public;
grant execute on function public.admin_overview_stats(text) to service_role;

create or replace function public.admin_viral_coefficient(p_days int default 30, p_event_name text default null)
returns table (referrals_in_period bigint, base_users bigint, coefficient numeric)
language plpgsql
as $$
declare
  window_start timestamptz := now() - (p_days || ' days')::interval;
  v_referrals bigint;
  v_base bigint;
begin
  select count(*) into v_referrals
  from public.referrals r
  where r.created_at >= window_start
    and (p_event_name is null or r.event_name = p_event_name);

  select count(*) into v_base
  from auth.users u
  where u.created_at < window_start;

  return query select
    v_referrals,
    v_base,
    case when v_base = 0 then 0 else round(v_referrals::numeric / v_base::numeric, 3) end;
end;
$$;

revoke all on function public.admin_viral_coefficient(int, text) from public;
grant execute on function public.admin_viral_coefficient(int, text) to service_role;

create or replace function public.admin_weekly_trend(p_weeks int default 8)
returns table (week_start date, signups bigint, referrals bigint)
language sql
as $$
  with weeks as (
    select generate_series(
      date_trunc('week', now()) - ((p_weeks - 1) || ' weeks')::interval,
      date_trunc('week', now()),
      '1 week'::interval
    )::date as week_start
  )
  select
    w.week_start,
    (select count(*) from auth.users u where date_trunc('week', u.created_at)::date = w.week_start) as signups,
    (select count(*) from public.referrals r where date_trunc('week', r.created_at)::date = w.week_start) as referrals
  from weeks w
  order by w.week_start;
$$;

revoke all on function public.admin_weekly_trend(int) from public;
grant execute on function public.admin_weekly_trend(int) to service_role;

create or replace function public.admin_channel_distribution(p_event_name text default null)
returns table (field text, save_count bigint)
language sql
as $$
  select f as field, count(*) as save_count
  from public.exchanges e, unnest(e.saved_fields) as f
  where p_event_name is null or e.event_name = p_event_name
  group by f
  order by save_count desc;
$$;

revoke all on function public.admin_channel_distribution(text) from public;
grant execute on function public.admin_channel_distribution(text) to service_role;

create or replace function public.admin_event_retention()
returns table (card_owner_id uuid, distinct_events bigint)
language sql
as $$
  select card_owner_id, count(distinct event_name) as distinct_events
  from public.exchanges
  where event_name is not null
  group by card_owner_id
  having count(distinct event_name) > 1
  order by distinct_events desc;
$$;

revoke all on function public.admin_event_retention() from public;
grant execute on function public.admin_event_retention() to service_role;
