-- Closes a privilege-escalation gap: RLS "own row" UPDATE policies control
-- which ROWS a user can touch, not which COLUMNS. Any logged-in user could
-- currently call the Supabase client directly (e.g. from the browser
-- console) to set their own is_admin = true, forge their own
-- signup_number, or mark their own event as an official partner event.
-- These REVOKEs close that at the grant level, independent of RLS.

revoke update (is_admin, signup_number) on public.profiles from authenticated;
revoke update (is_partner) on public.events from authenticated;
