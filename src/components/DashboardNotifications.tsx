"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, MessageCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { ExchangeRow, MessageRow } from "@/lib/types";

type Toast =
  | { kind: "save"; id: string; viewerName: string | null; eventName: string | null }
  | { kind: "message"; id: string; conversationId: string; senderName: string; body: string };

export default function DashboardNotifications({ userId }: { userId: string }) {
  const router = useRouter();
  const [toasts, setToasts] = useState<Toast[]>([]);

  const pushToast = (toast: Toast) => {
    setToasts((t) => [...t, toast]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== toast.id));
    }, 6000);
  };

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`dashboard-notifications-${userId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "exchanges", filter: `card_owner_id=eq.${userId}` },
        (payload) => {
          const row = payload.new as ExchangeRow;
          pushToast({ kind: "save", id: row.id, viewerName: row.viewer_name, eventName: row.event_name });
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `recipient_id=eq.${userId}` },
        (payload) => {
          const row = payload.new as MessageRow;
          pushToast({
            kind: "message",
            id: row.id,
            conversationId: row.conversation_id,
            senderName: row.sender_name,
            body: row.body,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-[calc(100%-2rem)] max-w-[380px] px-0">
      {toasts.map((t) =>
        t.kind === "save" ? (
          <div
            key={t.id}
            className="bg-card border border-amber/40 rounded-xl px-3.5 py-2.5 shadow-[0_8px_24px_rgba(0,0,0,0.4)] flex items-start gap-2"
          >
            <Sparkles size={14} className="text-amber shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="font-body text-[12.5px] text-text leading-snug">
                {t.viewerName ? (
                  <>
                    <span className="font-semibold text-amber">{t.viewerName}</span> just saved your card
                  </>
                ) : (
                  "Someone just saved your card"
                )}
              </p>
              {t.eventName && <p className="font-mono text-[10.5px] text-muted mt-0.5">{t.eventName}</p>}
            </div>
          </div>
        ) : (
          <button
            key={t.id}
            type="button"
            onClick={() => router.push(`/dashboard/messages/${t.conversationId}`)}
            className="text-left bg-card border border-amber/40 rounded-xl px-3.5 py-2.5 shadow-[0_8px_24px_rgba(0,0,0,0.4)] flex items-start gap-2 cursor-pointer"
          >
            <MessageCircle size={14} className="text-amber shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="font-body text-[12.5px] text-text leading-snug">
                <span className="font-semibold text-amber">{t.senderName}</span>
              </p>
              <p className="font-body text-[11.5px] text-muted truncate">{t.body}</p>
            </div>
          </button>
        )
      )}
    </div>
  );
}
