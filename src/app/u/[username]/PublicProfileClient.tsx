"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { ArrowRight, Check, Download, ExternalLink, Send, Sparkles } from "lucide-react";
import MobileShell from "@/components/MobileShell";
import { FIELD_META, channelHref } from "@/lib/fields";
import { buildVCardText, vcardFilename } from "@/lib/vcard";
import { createClient } from "@/lib/supabase/client";
import { foundingLabel } from "@/lib/founding";
import type { FieldId } from "@/lib/types";

const DEEP_LINK_FIELDS = new Set<FieldId>(["kakao", "instagram", "linkedin", "facebook"]);

/**
 * Downscales the avatar to a small JPEG and returns it as base64 for
 * embedding in the vCard's PHOTO field. Contact-app photos don't need to be
 * full resolution, and vCard payload size adds up fast with raw uploads.
 */
async function loadAvatarPhoto(avatarUrl: string): Promise<{ base64: string; mimeType: string } | null> {
  try {
    const img = new Image();
    img.crossOrigin = "anonymous";
    const loaded = new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("image load failed"));
    });
    img.src = avatarUrl;
    await loaded;

    const maxSize = 240;
    const scale = Math.min(1, maxSize / Math.max(img.naturalWidth, img.naturalHeight));
    const w = Math.round(img.naturalWidth * scale);
    const h = Math.round(img.naturalHeight * scale);

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0, w, h);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.82);
    const base64 = dataUrl.split(",")[1];
    if (!base64) return null;
    return { base64, mimeType: "JPEG" };
  } catch {
    return null;
  }
}

interface Props {
  ownerId: string;
  name: string;
  title: string;
  company: string;
  avatarUrl: string | null;
  signupNumber: number;
  eventName: string | null;
  visibleFields: FieldId[];
  values: Partial<Record<FieldId, string>>;
  publicUrl: string;
}

export default function PublicProfileClient({
  ownerId,
  name,
  title,
  company,
  avatarUrl,
  signupNumber,
  eventName,
  visibleFields,
  values,
  publicUrl,
}: Props) {
  const [selected, setSelected] = useState<Partial<Record<FieldId, boolean>>>(() => {
    const init: Partial<Record<FieldId, boolean>> = {};
    visibleFields.forEach((id) => {
      init[id] = true;
    });
    return init;
  });
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [viewer, setViewer] = useState<{ loading: boolean; userId: string | null; name: string | null }>({
    loading: true,
    userId: null,
    name: null,
  });
  const [visitorName, setVisitorName] = useState("");
  const canShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

  const badge = foundingLabel(signupNumber);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setViewer({ loading: false, userId: null, name: null });
        return;
      }
      const { data: viewerProfile } = await supabase
        .from("profiles")
        .select("name")
        .eq("id", user.id)
        .maybeSingle<{ name: string }>();
      setViewer({ loading: false, userId: user.id, name: viewerProfile?.name || user.email || null });
    })();
  }, []);

  const toggle = (id: FieldId) => setSelected((s) => ({ ...s, [id]: !s[id] }));

  const greetingText = `Great meeting you, ${name}!`;

  // If the owner's phone is public, prefill the Messages app's "To" field
  // directly via an sms: link — navigator.share has no way to set a
  // recipient, it only ever prefills content into whichever app is picked.
  const ownerPhone = values.phone?.trim();
  const smsGreetingHref = ownerPhone
    ? `sms:${ownerPhone.replace(/\s+/g, "")}?body=${encodeURIComponent(greetingText)}`
    : null;

  const shareGreeting = () => {
    if (!canShare) return;
    navigator.share({ text: greetingText, url: publicUrl }).catch(() => {
      // User cancelled the share sheet or it failed silently — nothing to do.
    });
  };

  const sendFeedback = async () => {
    if (!feedback.trim()) return;
    setFeedbackSent(true);
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId: ownerId, message: feedback.trim() }),
      });
    } catch {
      // Optional, non-blocking — a failed submit just means we don't retry.
    }
  };

  const handleSave = async () => {
    const chosen = visibleFields.filter((id) => selected[id]);
    if (chosen.length === 0) return;
    setPending(true);

    const photo = avatarUrl ? await loadAvatarPhoto(avatarUrl) : null;
    const text = buildVCardText({ name, title, company, eventName, photo }, values, chosen);
    const blob = new Blob([text], { type: "text/vcard" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = vcardFilename(name);
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    try {
      const viewerName = viewer.userId ? viewer.name : visitorName.trim() || null;
      await fetch("/api/exchanges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ownerId,
          viewerId: viewer.userId,
          viewerName,
          eventName,
          savedFields: chosen,
        }),
      });
    } catch {
      // Ignore logging failures — don't let them affect the vCard download experience
    }

    setPending(false);
    setSaved(true);
  };

  return (
    <MobileShell>
      <div className="px-4 pt-2 pb-8">
        {publicUrl && (
          <div className="flex justify-center mb-5">
            <div className="p-3 bg-[#1B1E25] border border-border rounded-xl">
              <QRCodeSVG value={publicUrl} size={120} bgColor="#1B1E25" fgColor="#F7F5F1" level="M" />
            </div>
          </div>
        )}

        <div className="text-center mb-5">
          {avatarUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt={name}
              className="w-20 h-20 rounded-full object-cover border border-border mx-auto mb-3"
            />
          )}
          <p className="font-heading text-2xl font-bold text-text">{name || "Unnamed"}</p>
          {(title || company) && (
            <p className="font-body text-[13px] text-muted-2 mt-1">
              {[title, company].filter(Boolean).join(" · ")}
            </p>
          )}
          {badge && (
            <span className="inline-flex items-center gap-1 mt-2 mr-1 font-body text-[10.5px] font-bold text-success bg-success/10 border border-success/30 rounded-full px-2.5 py-1">
              {badge}
            </span>
          )}
          {eventName && (
            <span className="inline-flex items-center gap-1 mt-2 font-body text-[11px] font-semibold text-amber bg-amber/10 border border-amber/30 rounded-full px-2.5 py-1">
              <Sparkles size={11} /> {eventName}
            </span>
          )}
        </div>

        {visibleFields.length === 0 ? (
          <p className="text-center font-body text-[12.5px] text-faint py-8">No public contact info yet.</p>
        ) : saved ? (
          <div className="text-center py-6">
            <div className="w-11 h-11 rounded-full bg-success/15 flex items-center justify-center mx-auto mb-3">
              <Check size={20} className="text-success" />
            </div>
            <p className="font-heading text-[15px] font-semibold text-text mb-1">Saved!</p>
            <p className="font-body text-[12.5px] text-muted mb-5">
              Your contact file has been downloaded.
            </p>

            {smsGreetingHref ? (
              <a
                href={smsGreetingHref}
                className="w-full flex items-center justify-center gap-2 border border-border rounded-lg py-2.5 mb-5 font-body text-[12.5px] font-semibold text-text hover:border-amber/60"
              >
                <Send size={13} /> Send a greeting
              </a>
            ) : (
              canShare && (
                <button
                  type="button"
                  onClick={shareGreeting}
                  className="w-full flex items-center justify-center gap-2 border border-border rounded-lg py-2.5 mb-5 font-body text-[12.5px] font-semibold text-text hover:border-amber/60 cursor-pointer"
                >
                  <Send size={13} /> Send a greeting
                </button>
              )
            )}

            {feedbackSent ? (
              <p className="font-body text-[11.5px] text-success mb-5">Thanks for the feedback!</p>
            ) : (
              <div className="flex items-center gap-1.5 mb-5">
                <input
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="How was this? (optional)"
                  className="flex-1 bg-card border border-border rounded-lg px-3 py-2 text-text font-body text-[12px] outline-none focus:border-amber/60"
                />
                <button
                  type="button"
                  onClick={sendFeedback}
                  disabled={!feedback.trim()}
                  className="shrink-0 font-body text-[11.5px] font-semibold text-amber disabled:opacity-40 cursor-pointer"
                >
                  Send
                </button>
              </div>
            )}

            <a
              href={`/login?ref=${ownerId}`}
              className="inline-flex items-center justify-center gap-1.5 bg-amber text-bg font-body text-[13px] font-bold rounded-lg py-2.5 px-5"
            >
              Make your own TapMe card <ArrowRight size={14} />
            </a>
          </div>
        ) : (
          <>
            <p className="font-body text-[11.5px] text-muted mb-2">Choose what to save</p>
            <div className="flex flex-col gap-1.5 mb-4">
              {visibleFields.map((id) => {
                const meta = FIELD_META[id];
                const Icon = meta.icon;
                const on = !!selected[id];
                return (
                  <div
                    key={id}
                    className="w-full flex items-center gap-2 rounded-lg border px-2.5 py-2.5"
                    style={{
                      borderColor: on ? meta.color : "var(--color-border)",
                      background: on ? `${meta.color}14` : "transparent",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => toggle(id)}
                      className="flex items-center gap-2.5 flex-1 min-w-0 text-left cursor-pointer"
                    >
                      <Icon size={15} color={meta.color} />
                      <div className="flex-1 min-w-0">
                        <div className="font-body text-[12.5px] text-text font-medium">{meta.label}</div>
                        <div className="font-mono text-[10.5px] text-muted truncate">{values[id]}</div>
                      </div>
                      <div
                        className="w-[18px] h-[18px] rounded-[5px] border flex items-center justify-center shrink-0"
                        style={{
                          borderColor: on ? meta.color : "var(--color-faint)",
                          background: on ? meta.color : "transparent",
                        }}
                      >
                        {on && <Check size={11} color="#14161B" strokeWidth={3} />}
                      </div>
                    </button>
                    {DEEP_LINK_FIELDS.has(id) && (
                      <a
                        href={channelHref(id, values[id] ?? "")}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 p-1.5 rounded-md border border-border text-muted hover:text-text"
                        aria-label={`Open ${meta.label}`}
                      >
                        <ExternalLink size={13} />
                      </a>
                    )}
                  </div>
                );
              })}
            </div>

            {!viewer.loading && !viewer.userId && (
              <input
                value={visitorName}
                onChange={(e) => setVisitorName(e.target.value)}
                placeholder="What's your name? (optional)"
                className="w-full bg-card border border-border rounded-lg px-3 py-2.5 mb-3 text-text font-body text-[13px] outline-none focus:border-amber/60"
              />
            )}

            <button
              type="button"
              onClick={handleSave}
              disabled={pending}
              className="w-full flex items-center justify-center gap-2 bg-amber text-bg font-body text-[13.5px] font-bold rounded-lg py-3 disabled:opacity-60 cursor-pointer"
            >
              <Download size={15} /> {pending ? "Saving..." : "Save selected"}
            </button>
          </>
        )}

        <a
          href={`/login?ref=${ownerId}`}
          className="block text-center font-body text-[10.5px] text-faint hover:text-muted mt-6"
        >
          Made with TapMe — create your own card →
        </a>
      </div>
    </MobileShell>
  );
}
