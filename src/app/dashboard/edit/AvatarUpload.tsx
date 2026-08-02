"use client";

import { useRef, useState } from "react";
import { Camera, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const MAX_BYTES = 5 * 1024 * 1024;

export default function AvatarUpload({
  profileId,
  initialAvatarUrl,
}: {
  profileId: string;
  initialAvatarUrl: string | null;
}) {
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError("");

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Image must be under 5MB.");
      return;
    }

    setPending(true);
    const supabase = createClient();
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${profileId}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true, cacheControl: "3600" });

    if (uploadError) {
      setPending(false);
      setError("Upload failed. Please try again.");
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(path);
    const bustedUrl = `${publicUrl}?v=${Date.now()}`;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: bustedUrl })
      .eq("id", profileId);

    setPending(false);
    if (updateError) {
      setError("Couldn't save the photo. Please try again.");
      return;
    }

    setAvatarUrl(bustedUrl);
  };

  return (
    <div className="flex items-center gap-3 mb-4">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={pending}
        className="relative w-16 h-16 rounded-full overflow-hidden border border-border bg-card flex items-center justify-center shrink-0 cursor-pointer disabled:opacity-60"
        aria-label="Change profile photo"
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
        ) : (
          <User size={26} className="text-faint" />
        )}
        <span className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-amber flex items-center justify-center border-2 border-bg">
          <Camera size={10} color="#14161B" strokeWidth={2.5} />
        </span>
      </button>
      <div className="flex-1 min-w-0">
        <p className="font-body text-[12.5px] text-text font-medium">Profile photo</p>
        <p className="font-body text-[11px] text-faint">
          {pending ? "Uploading..." : "Tap the circle to upload"}
        </p>
        {error && <p className="font-body text-[11px] text-red-400 mt-0.5">{error}</p>}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
