import { redirect } from "next/navigation";
import { Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { FIELD_META } from "@/lib/fields";
import type { ExchangeRow, FieldId } from "@/lib/types";

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    timeZone: "America/New_York",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function HistoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: exchanges } = await supabase
    .from("exchanges")
    .select("*")
    .eq("card_owner_id", user.id)
    .order("created_at", { ascending: false })
    .returns<ExchangeRow[]>();

  return (
    <div className="px-4 pt-3 pb-6">
      <p className="font-heading text-xs tracking-wider text-muted uppercase mb-3">
        People who saved your card
      </p>

      {(!exchanges || exchanges.length === 0) && (
        <div className="text-center py-10 text-faint font-body text-[12.5px] leading-relaxed">
          No history yet.
          <br />
          Share your QR or link from the &lsquo;Share&rsquo; tab.
        </div>
      )}

      <div className="flex flex-col gap-2">
        {exchanges?.map((ex) => (
          <div key={ex.id} className="bg-card border border-border rounded-xl p-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-heading text-[13.5px] font-semibold text-text">
                {ex.viewer_name || "Anonymous visitor"}
              </span>
              <span className="flex items-center gap-1 font-mono text-[10px] text-muted">
                <Clock size={10} /> {formatTime(ex.created_at)}
              </span>
            </div>
            <div className="font-body text-[11.5px] text-muted-2 mb-2">
              {ex.event_name || "No event"}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {ex.saved_fields.map((f) => {
                const meta = FIELD_META[f as FieldId];
                if (!meta) return null;
                const Icon = meta.icon;
                return (
                  <span
                    key={f}
                    className="flex items-center gap-1 font-body text-[10.5px] rounded-full px-2 py-0.5 border"
                    style={{ color: meta.color, borderColor: `${meta.color}33`, background: "rgba(255,255,255,0.04)" }}
                  >
                    <Icon size={10} /> {meta.label}
                  </span>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
