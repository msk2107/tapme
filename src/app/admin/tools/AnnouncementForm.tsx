"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { publishAnnouncement } from "../actions";

export default function AnnouncementForm({ currentMessage }: { currentMessage: string | null }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  const publish = async () => {
    setPending(true);
    await publishAnnouncement(message);
    setPending(false);
    setMessage("");
    router.refresh();
  };

  const clear = async () => {
    setPending(true);
    await publishAnnouncement("");
    setPending(false);
    router.refresh();
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <p className="font-body text-[11px] text-muted uppercase tracking-wide mb-2">Announcement banner</p>
      {currentMessage ? (
        <div className="flex items-center justify-between gap-2 bg-amber/10 border border-amber/30 rounded-lg px-3 py-2 mb-3">
          <p className="font-body text-[12.5px] text-text">{currentMessage}</p>
          <button
            type="button"
            onClick={clear}
            disabled={pending}
            className="shrink-0 font-body text-[11px] text-muted hover:text-text cursor-pointer disabled:opacity-50"
          >
            Clear
          </button>
        </div>
      ) : (
        <p className="font-body text-[12px] text-faint mb-3">No announcement is currently live.</p>
      )}
      <div className="flex gap-2">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write a new announcement..."
          className="flex-1 bg-bg border border-border rounded-lg px-3 py-2 text-text font-body text-[12.5px] outline-none focus:border-amber/60"
        />
        <button
          type="button"
          onClick={publish}
          disabled={pending || !message.trim()}
          className="bg-amber text-bg font-body text-[12.5px] font-bold rounded-lg px-4 disabled:opacity-50 cursor-pointer"
        >
          Publish
        </button>
      </div>
    </div>
  );
}
