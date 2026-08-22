-- Fixes admin dashboard stats silently returning nothing: the reporting
-- functions in admin.sql (admin_overview_stats, admin_viral_coefficient,
-- admin_weekly_trend) query auth.users, but service_role didn't actually
-- have SELECT on that table in this project — the RPC calls were failing
-- with "permission denied for table users" the whole time.

grant select on auth.users to service_role;
