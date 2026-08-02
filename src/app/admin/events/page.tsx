import { createAdminClient } from "@/lib/supabase/admin";
import type { EventRow, Profile } from "@/lib/types";
import PartnerToggle from "./PartnerToggle";

export default async function AdminEventsPage() {
  const supabase = createAdminClient();

  const [{ data: events }, { data: profiles }] = await Promise.all([
    supabase.from("events").select("*").order("start_date", { ascending: false }).returns<EventRow[]>(),
    supabase.from("profiles").select("id, name, username"),
  ]);

  const ownerMap = new Map((profiles ?? []).map((p) => [p.id, p as Pick<Profile, "id" | "name" | "username">]));

  return (
    <div>
      <h1 className="font-heading text-lg font-bold text-text mb-5">Events ({events?.length ?? 0})</h1>
      <div className="flex flex-col gap-2">
        {(events ?? []).map((event) => {
          const owner = ownerMap.get(event.user_id);
          return (
            <div key={event.id} className="bg-card border border-border rounded-xl p-3.5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="min-w-0">
                  <p className="font-heading text-[13.5px] font-semibold text-text">{event.name}</p>
                  <p className="font-mono text-[11px] text-muted mt-0.5">
                    {event.start_date} ~ {event.end_date} · {owner?.name || "unknown"} (@
                    {owner?.username || "?"})
                  </p>
                </div>
                <PartnerToggle eventId={event.id} initialIsPartner={event.is_partner} />
              </div>
            </div>
          );
        })}
        {(!events || events.length === 0) && (
          <p className="font-body text-[12.5px] text-faint text-center py-8">No events yet.</p>
        )}
      </div>
    </div>
  );
}
