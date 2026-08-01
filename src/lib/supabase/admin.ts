import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Service-role client that bypasses RLS. Server-only (route handlers, server actions) —
 * never expose this to the client bundle.
 * - Public profile lookup (/u/[username]): strips hidden channel values server-side before sending to the client
 * - Exchange logging: anonymous visitors need to be able to log a save too
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
