"use client";

import { useState, useTransition } from "react";
import { Handshake } from "lucide-react";
import { togglePartnerEvent } from "../actions";

export default function PartnerToggle({
  eventId,
  initialIsPartner,
}: {
  eventId: string;
  initialIsPartner: boolean;
}) {
  const [isPartner, setIsPartner] = useState(initialIsPartner);
  const [pending, startTransition] = useTransition();

  const toggle = () => {
    const next = !isPartner;
    setIsPartner(next);
    startTransition(() => {
      togglePartnerEvent(eventId, next);
    });
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      className={`flex items-center gap-1 font-body text-[11px] font-semibold rounded-full px-2.5 py-1 border cursor-pointer disabled:opacity-50 ${
        isPartner
          ? "text-amber border-amber/40 bg-amber/10"
          : "text-muted border-border hover:border-amber/40"
      }`}
    >
      <Handshake size={11} /> {isPartner ? "Partner event" : "Mark as partner"}
    </button>
  );
}
