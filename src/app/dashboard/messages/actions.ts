"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export interface UserSearchResult {
  id: string;
  username: string;
  name: string;
  avatar_url: string | null;
}

/**
 * profiles RLS is "own row only", so finding other users to start a chat
 * with needs the service-role client — same reason as every other place
 * in the app that reads another user's public info.
 */
export async function searchUsers(query: string): Promise<UserSearchResult[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const admin = createAdminClient();
  const { data } = await admin
    .from("profiles")
    .select("id, username, name, avatar_url")
    .or(`name.ilike.%${q}%,username.ilike.%${q}%`)
    .neq("id", user.id)
    .limit(8)
    .returns<UserSearchResult[]>();

  return data ?? [];
}
