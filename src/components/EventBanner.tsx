"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function EventBanner({
  eventId,
  eventName,
}: {
  eventId: string;
  eventName: string;
}) {
  const router = useRouter();
  const [hidden, setHidden] = useState(false);
  const [pending, setPending] = useState(false);

  if (hidden) return null;

  const respond = async (confirmed: boolean) => {
    setPending(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("profiles")
      .update(
        confirmed
          ? { current_event_id: eventId, current_event_banner_dismissed_for: eventId }
          : { current_event_banner_dismissed_for: eventId }
      )
      .eq("id", user.id);

    setPending(false);
    setHidden(true);
    router.refresh();
  };

  return (
    <div className="mx-4 mt-3 rounded-xl border border-amber/30 bg-amber/10 px-3.5 py-3 flex items-start gap-2.5 shrink-0">
      <Sparkles size={16} className="text-amber shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="font-body text-[12.5px] text-text leading-snug">
          지금 <span className="font-semibold text-amber">{eventName}</span> 참석 중이신가요?
        </p>
        <div className="flex gap-2 mt-2">
          <button
            type="button"
            disabled={pending}
            onClick={() => respond(true)}
            className="px-3 py-1.5 rounded-md bg-amber text-bg font-body text-[12px] font-bold cursor-pointer disabled:opacity-60"
          >
            예, 참석 중이에요
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => respond(false)}
            className="px-3 py-1.5 rounded-md border border-border text-muted font-body text-[12px] font-semibold cursor-pointer disabled:opacity-60"
          >
            아니요
          </button>
        </div>
      </div>
    </div>
  );
}
