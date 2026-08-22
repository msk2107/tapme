"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Send } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { MessageRow } from "@/lib/types";

interface Props {
  conversationId: string;
  myId: string;
  myName: string;
  otherId: string;
  otherName: string;
  otherAvatarUrl: string | null;
  initialMessages: MessageRow[];
}

export default function Thread({
  conversationId,
  myId,
  myName,
  otherId,
  otherName,
  otherAvatarUrl,
  initialMessages,
}: Props) {
  const [messages, setMessages] = useState<MessageRow[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  // Mark the other person's unread messages as read once this thread is open.
  useEffect(() => {
    const unreadIds = initialMessages
      .filter((m) => m.recipient_id === myId && !m.read_at)
      .map((m) => m.id);
    if (unreadIds.length === 0) return;
    const supabase = createClient();
    supabase.from("messages").update({ read_at: new Date().toISOString() }).in("id", unreadIds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const row = payload.new as MessageRow;
          setMessages((prev) => (prev.some((m) => m.id === row.id) ? prev : [...prev, row]));
          if (row.recipient_id === myId) {
            supabase.from("messages").update({ read_at: new Date().toISOString() }).eq("id", row.id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, myId]);

  const send = async () => {
    const body = draft.trim();
    if (!body) return;
    setSending(true);
    setDraft("");
    const supabase = createClient();
    const { data, error } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        sender_id: myId,
        recipient_id: otherId,
        sender_name: myName,
        body,
      })
      .select("*")
      .single<MessageRow>();
    setSending(false);
    if (!error && data) {
      setMessages((prev) => (prev.some((m) => m.id === data.id) ? prev : [...prev, data]));
    }
  };

  return (
    <div className="fixed inset-x-0 top-0 h-dvh z-40 bg-bg flex flex-col">
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border shrink-0">
        <Link href="/dashboard/messages" aria-label="Back" className="text-muted hover:text-text">
          <ArrowLeft size={18} />
        </Link>
        {otherAvatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={otherAvatarUrl}
            alt={otherName}
            className="w-8 h-8 rounded-full object-cover border border-border"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-card border border-border" />
        )}
        <p className="font-heading text-[14px] font-semibold text-text truncate">{otherName}</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2">
        {messages.length === 0 && (
          <p className="text-center font-body text-[12px] text-faint py-8">
            Say hello to {otherName}.
          </p>
        )}
        {messages.map((m) => {
          const mine = m.sender_id === myId;
          return (
            <div
              key={m.id}
              className={`max-w-[78%] rounded-xl px-3 py-2 font-body text-[13px] leading-snug ${
                mine ? "self-end bg-amber text-bg" : "self-start bg-card border border-border text-text"
              }`}
            >
              {m.body}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div
        className="flex items-center gap-2 px-4 pt-3 border-t border-border shrink-0"
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder="Message..."
          className="flex-1 bg-card border border-border rounded-full px-4 py-2.5 text-text font-body text-[13px] outline-none focus:border-amber/60"
        />
        <button
          type="button"
          onClick={send}
          disabled={sending || !draft.trim()}
          aria-label="Send"
          className="shrink-0 w-9 h-9 rounded-full bg-amber text-bg flex items-center justify-center disabled:opacity-50 cursor-pointer"
        >
          <Send size={15} />
        </button>
      </div>
    </div>
  );
}
