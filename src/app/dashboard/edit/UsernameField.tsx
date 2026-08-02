"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { isValidUsername } from "@/lib/username";

export default function UsernameField({
  profileId,
  initialUsername,
}: {
  profileId: string;
  initialUsername: string;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(initialUsername);
  const [saved, setSaved] = useState(initialUsername);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const save = async () => {
    setError("");
    const next = value.trim().toLowerCase();

    if (!isValidUsername(next)) {
      setError("3–30 characters: lowercase letters, numbers, -, _");
      return;
    }
    if (next === saved) {
      setEditing(false);
      return;
    }

    setPending(true);
    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ username: next })
      .eq("id", profileId);
    setPending(false);

    if (updateError) {
      setError(
        updateError.code === "23505"
          ? "That username is already taken."
          : "Something went wrong. Please try again."
      );
      return;
    }

    setSaved(next);
    setValue(next);
    setEditing(false);
  };

  const cancel = () => {
    setValue(saved);
    setError("");
    setEditing(false);
  };

  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2.5 mb-1.5">
      <p className="font-body text-[10.5px] text-faint uppercase tracking-wide mb-1">
        Profile link
      </p>
      {editing ? (
        <>
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[12px] text-faint shrink-0">tapme.app/u/</span>
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              autoFocus
              className="flex-1 min-w-0 bg-transparent text-text font-mono text-[13px] outline-none border-b border-amber/60"
            />
          </div>
          <div className="flex gap-3 mt-2">
            <button
              type="button"
              onClick={save}
              disabled={pending}
              className="text-[11.5px] font-body font-semibold text-amber cursor-pointer disabled:opacity-50"
            >
              {pending ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={cancel}
              disabled={pending}
              className="text-[11.5px] font-body text-muted cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
          {error && <p className="text-[11px] text-red-400 mt-1.5">{error}</p>}
        </>
      ) : (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="flex items-center justify-between w-full gap-2 cursor-pointer"
        >
          <span className="font-mono text-[13px] text-text truncate">tapme.app/u/{saved}</span>
          <Pencil size={13} className="text-muted shrink-0" />
        </button>
      )}
    </div>
  );
}
