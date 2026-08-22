import { redirect } from "next/navigation";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ConversationRow, MessageRow } from "@/lib/types";
import NewChatSearch from "./NewChatSearch";

export default async function MessagesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: conversations } = await supabase
    .from("conversations")
    .select("*")
    .or(`user_a_id.eq.${user.id},user_b_id.eq.${user.id}`)
    .order("last_message_at", { ascending: false })
    .returns<ConversationRow[]>();

  const convoIds = (conversations ?? []).map((c) => c.id);
  const otherIds = (conversations ?? []).map((c) => (c.user_a_id === user.id ? c.user_b_id : c.user_a_id));

  // profiles RLS is "own row only" — reading the other participant's
  // name/avatar needs the service-role client, same as everywhere else in
  // the app that shows another user's public info (e.g. /u/[username]).
  const admin = createAdminClient();
  const [{ data: profiles }, { data: messages }] = await Promise.all([
    otherIds.length
      ? admin.from("profiles").select("id, name, avatar_url").in("id", otherIds)
      : Promise.resolve({ data: [] }),
    convoIds.length
      ? supabase
          .from("messages")
          .select("*")
          .in("conversation_id", convoIds)
          .order("created_at", { ascending: true })
          .returns<MessageRow[]>()
      : Promise.resolve({ data: [] as MessageRow[] }),
  ]);

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));
  const lastMessageByConvo = new Map<string, MessageRow>();
  const hasUnreadByConvo = new Set<string>();
  (messages ?? []).forEach((m) => {
    lastMessageByConvo.set(m.conversation_id, m);
    if (m.recipient_id === user.id && !m.read_at) hasUnreadByConvo.add(m.conversation_id);
  });

  return (
    <div className="px-4 pt-3 pb-6">
      <p className="font-heading text-xs tracking-wider text-muted uppercase mb-3">Chats</p>

      <NewChatSearch myId={user.id} />

      {(!conversations || conversations.length === 0) && (
        <div className="text-center py-10 text-faint font-body text-[12.5px] leading-relaxed">
          No conversations yet.
          <br />
          Tap &lsquo;Message&rsquo; on someone&apos;s profile to start one.
        </div>
      )}

      <div className="flex flex-col gap-2">
        {(conversations ?? []).map((c) => {
          const otherId = c.user_a_id === user.id ? c.user_b_id : c.user_a_id;
          const other = profileMap.get(otherId);
          const last = lastMessageByConvo.get(c.id);
          const unread = hasUnreadByConvo.has(c.id);
          return (
            <Link
              key={c.id}
              href={`/dashboard/messages/${c.id}`}
              className="flex items-center gap-3 bg-card border border-border rounded-xl p-3 hover:border-amber/40"
            >
              {other?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={other.avatar_url}
                  alt={other.name}
                  className="w-10 h-10 rounded-full object-cover border border-border shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-bg border border-border flex items-center justify-center shrink-0">
                  <MessageCircle size={16} className="text-faint" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="font-heading text-[13.5px] font-semibold text-text truncate">
                  {other?.name || "TapMe user"}
                </p>
                <p className="font-body text-[11.5px] text-muted truncate">
                  {last ? `${last.sender_id === user.id ? "You: " : ""}${last.body}` : "Say hello"}
                </p>
              </div>
              {unread && <div className="w-2 h-2 rounded-full bg-amber shrink-0" />}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
