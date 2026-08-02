import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Gates every /admin/* page and admin server action. Uses the caller's own
 * RLS-scoped session (so a user can only ever read their own `is_admin`
 * flag) and 404s rather than redirecting on failure — a redirect confirms
 * the route exists, a 404 reveals nothing to a probing non-admin.
 */
export async function requireAdmin(): Promise<{ id: string; name: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin, name")
    .eq("id", user.id)
    .maybeSingle<{ is_admin: boolean; name: string }>();

  if (!profile?.is_admin) notFound();

  return { id: user.id, name: profile.name };
}
