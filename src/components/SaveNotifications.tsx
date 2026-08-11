"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { ExchangeRow } from "@/lib/types";

interface Toast {
  id: string;
  viewerName: string | null;
  eventName: string | null;
}

export default function SaveNotifications({ userId }: { userId: string }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`exchanges-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "exchanges",
          filter: `card_owner_id=eq.${userId}`,
        },
        (payload) => {
          const row = payload.new as ExchangeRow;
          const toast: Toast = { id: row.id, viewerName: row.viewer_name, eventName: row.event_name };
          setToasts((t) => [...t, toast]);
          setTimeout(() => {
            setToasts((t) => t.filter((x) => x.id !== toast.id));
          }, 6000);
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
      {toasts.map((t) => (
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
      ))}
    </div>
  );
}
