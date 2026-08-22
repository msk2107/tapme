import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ConversationRow, MessageRow } from "@/lib/types";
import Thread from "./Thread";

export default async function ThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: conversation } = await supabase
    .from("conversations")
    .select("*")
    .eq("id", id)
    .maybeSingle<ConversationRow>();

  // RLS already scopes this to conversations the user is part of, so a
  // successful-but-empty result means either it doesn't exist or isn't theirs.
  if (!conversation) notFound();

  const otherId = conversation.user_a_id === user.id ? conversation.user_b_id : conversation.user_a_id;
  // profiles RLS is "own row only" — same fix as the conversation list page.
  const admin = createAdminClient();
  const { data: other } = await admin
    .from("profiles")
    .select("id, name, avatar_url")
    .eq("id", otherId)
    .maybeSingle<{ id: string; name: string; avatar_url: string | null }>();

  const { data: me } = await supabase
    .from("profiles")
    .select("name")
    .eq("id", user.id)
    .maybeSingle<{ name: string }>();

  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", id)
    .order("created_at", { ascending: true })
    .returns<MessageRow[]>();

  return (
    <Thread
      conversationId={id}
      myId={user.id}
      myName={me?.name || "TapMe user"}
      otherId={otherId}
      otherName={other?.name || "TapMe user"}
      otherAvatarUrl={other?.avatar_url ?? null}
      initialMessages={messages ?? []}
    />
  );
}
