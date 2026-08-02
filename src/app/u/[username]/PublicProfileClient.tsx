"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { ArrowRight, Check, Download, ExternalLink, Sparkles } from "lucide-react";
import MobileShell from "@/components/MobileShell";
import { FIELD_META, channelHref } from "@/lib/fields";
import { buildVCardText, vcardFilename } from "@/lib/vcard";
import { createClient } from "@/lib/supabase/client";
import { foundingLabel } from "@/lib/founding";
import type { FieldId } from "@/lib/types";

const DEEP_LINK_FIELDS = new Set<FieldId>(["kakao", "instagram", "linkedin", "facebook"]);

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

  const badge = foundingLabel(signupNumber);

  const toggle = (id: FieldId) => setSelected((s) => ({ ...s, [id]: !s[id] }));

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

    const text = buildVCardText({ name, title, company }, values, chosen);
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
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      let viewerName: string | null = null;
      if (user) {
        const { data: viewerProfile } = await supabase
          .from("profiles")
          .select("name")
          .eq("id", user.id)
          .maybeSingle<{ name: string }>();
        viewerName = viewerProfile?.name || user.email || null;
      }
      await fetch("/api/exchanges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ownerId,
          viewerId: user?.id ?? null,
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
