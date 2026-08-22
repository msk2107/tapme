import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Conversations are keyed by an unordered pair of user ids, but the DB
 * unique constraint needs a consistent order to dedupe regardless of who
 * starts the chat. Always sort before reading or writing a conversation row.
 */
export function sortedPair(idA: string, idB: string): [string, string] {
  return idA < idB ? [idA, idB] : [idB, idA];
}

/**
 * Finds the existing conversation between two users or creates one, using
 * the browser client so it runs under the viewer's own RLS session. Shared
 * by every entry point that can start a chat (profile "Message" button,
 * the chat-tab user search) so the find-or-create logic lives in one place.
 */
export async function findOrCreateConversation(
  supabase: SupabaseClient,
  myId: string,
  otherId: string
): Promise<string | null> {
  const [user_a_id, user_b_id] = sortedPair(myId, otherId);

  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .eq("user_a_id", user_a_id)
    .eq("user_b_id", user_b_id)
    .maybeSingle<{ id: string }>();

  if (existing) return existing.id;

  const { data: created, error } = await supabase
    .from("conversations")
    .insert({ user_a_id, user_b_id })
    .select("id")
    .single<{ id: string }>();

  if (error || !created) return null;
  return created.id;
}
