import { redirect } from "next/navigation";
import MobileShell from "@/components/MobileShell";
import TabBar from "@/components/TabBar";
import EventBanner from "@/components/EventBanner";
import { createClient } from "@/lib/supabase/server";
import { findTodaysEvent, todayISO } from "@/lib/events";
import type { EventRow, Profile } from "@/lib/types";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle<Profile>();

  if (!profile) redirect("/onboarding");

  const { data: events } = await supabase
    .from("events")
    .select("*")
    .eq("user_id", user.id)
    .order("start_date", { ascending: false })
    .returns<EventRow[]>();

  const todaysEvent = findTodaysEvent(events ?? [], todayISO());
  const showBanner =
    !!todaysEvent &&
    todaysEvent.id !== profile.current_event_id &&
    todaysEvent.id !== profile.current_event_banner_dismissed_for;

  return (
    <MobileShell footer={<TabBar />}>
      {showBanner && todaysEvent && (
        <EventBanner eventId={todaysEvent.id} eventName={todaysEvent.name} />
      )}
      <div className="flex-1 overflow-y-auto min-h-0">{children}</div>
    </MobileShell>
  );
}
