"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { EventRow } from "@/lib/types";

const MAX_BYTES = 8 * 1024 * 1024;

function todayLocal(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function AddCardForm({ events }: { events: EventRow[] }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [eventName, setEventName] = useState("");
  const [receivedDate, setReceivedDate] = useState(todayLocal());
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const handleFile = (f: File) => {
    setError("");
    if (!f.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    if (f.size > MAX_BYTES) {
      setError("Image must be under 8MB.");
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setName("");
    setEventName("");
    setReceivedDate(todayLocal());
    if (fileRef.current) fileRef.current.value = "";
  };

  const submit = async () => {
    setError("");
    if (!file) return setError("Please add a photo of the card.");
    if (!name.trim()) return setError("Please enter a name.");

    setPending(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("You need to be logged in.");
      setPending(false);
      return;
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${user.id}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("received-cards")
      .upload(path, file, { upsert: false });
    if (uploadError) {
      setPending(false);
      setError("Upload failed. Please try again.");
      return;
    }

    const { error: insertError } = await supabase.from("received_cards").insert({
      owner_id: user.id,
      name: name.trim(),
      event_name: eventName || null,
      received_date: receivedDate,
      photo_path: path,
    });

    setPending(false);
    if (insertError) {
      setError("Couldn't save the card. Please try again.");
      return;
    }

    reset();
    router.refresh();
  };

  return (
    <div className="bg-card border border-border rounded-xl p-3 flex flex-col gap-2 mb-1">
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="flex items-center justify-center gap-2 bg-bg border border-dashed border-border rounded-lg py-6 text-muted hover:border-amber/60 cursor-pointer"
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Card preview" className="max-h-32 rounded-md" />
        ) : (
          <span className="flex items-center gap-1.5 font-body text-[12.5px]">
            <Camera size={15} /> Take or choose a photo
          </span>
        )}
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
        className="bg-bg border border-border rounded-lg px-2.5 py-2 text-text font-body text-[13px] outline-none focus:border-amber/60"
      />

      <div className="flex gap-2">
        <select
          value={eventName}
          onChange={(e) => setEventName(e.target.value)}
          className="flex-1 min-w-0 bg-bg border border-border rounded-lg px-2.5 py-2 text-text font-body text-[13px] outline-none focus:border-amber/60"
        >
          <option value="">No event</option>
          {events.map((event) => (
            <option key={event.id} value={event.name}>
              {event.name}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={receivedDate}
          onChange={(e) => setReceivedDate(e.target.value)}
          className="bg-bg border border-border rounded-lg px-2.5 py-2 text-text font-mono text-[12.5px] outline-none focus:border-amber/60"
        />
      </div>

      <button
        type="button"
        onClick={submit}
        disabled={pending}
        className="bg-amber text-bg font-body text-[13px] font-bold rounded-lg py-2 mt-1 disabled:opacity-60 cursor-pointer"
      >
        {pending ? "Saving..." : "Save card"}
      </button>
      {error && <p className="text-[11.5px] text-red-400">{error}</p>}
    </div>
  );
}
