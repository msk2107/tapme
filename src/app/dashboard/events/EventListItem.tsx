"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { EventRow } from "@/lib/types";

export default function EventListItem({
  event,
  isToday,
  isCurrent,
}: {
  event: EventRow;
  isToday: boolean;
  isCurrent: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const setAsCurrent = async () => {
    setPending(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from("profiles")
        .update({
          current_event_id: event.id,
          current_event_banner_dismissed_for: event.id,
        })
        .eq("id", user.id);
    }
    setPending(false);
    router.refresh();
  };

  const clearCurrent = async () => {
    setPending(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("profiles").update({ current_event_id: null }).eq("id", user.id);
    }
    setPending(false);
    router.refresh();
  };

  const remove = async () => {
    setPending(true);
    const supabase = createClient();
    await supabase.from("events").delete().eq("id", event.id);
    setPending(false);
    router.refresh();
  };

  return (
    <div
      className={`rounded-xl border p-3 ${
        isCurrent ? "border-amber/50 bg-amber/5" : "border-border bg-card"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-heading text-[13.5px] font-semibold text-text">
              {event.name}
            </span>
            {isCurrent && (
              <span className="font-body text-[10px] font-bold text-amber bg-amber/15 rounded-full px-2 py-0.5">
                현재 행사
              </span>
            )}
            {isToday && !isCurrent && (
              <span className="font-body text-[10px] font-bold text-success bg-success/15 rounded-full px-2 py-0.5">
                오늘
              </span>
            )}
          </div>
          <p className="font-mono text-[11px] text-muted mt-1">
            {event.start_date} ~ {event.end_date}
          </p>
        </div>
        <button
          type="button"
          onClick={remove}
          disabled={pending}
          aria-label="행사 삭제"
          className="text-faint hover:text-red-400 shrink-0 cursor-pointer disabled:opacity-50"
        >
          <Trash2 size={15} />
        </button>
      </div>
      <div className="mt-2.5">
        {isCurrent ? (
          <button
            type="button"
            onClick={clearCurrent}
            disabled={pending}
            className="text-[11.5px] font-body text-muted underline decoration-dotted cursor-pointer disabled:opacity-50"
          >
            현재 행사 해제
          </button>
        ) : (
          <button
            type="button"
            onClick={setAsCurrent}
            disabled={pending}
            className="flex items-center gap-1 text-[11.5px] font-body font-semibold text-amber cursor-pointer disabled:opacity-50"
          >
            <CheckCircle2 size={13} /> 이 행사를 현재 행사로 설정
          </button>
        )}
      </div>
    </div>
  );
}
