import { redirect } from "next/navigation";
import { Megaphone } from "lucide-react";
import MobileShell from "@/components/MobileShell";
import TabBar from "@/components/TabBar";
import EventBanner from "@/components/EventBanner";
import DashboardNotifications from "@/components/DashboardNotifications";
import { createClient } from "@/lib/supabase/server";
import { findTodaysEvent, todayISO } from "@/lib/events";
import type { AnnouncementRow, EventRow, Profile } from "@/lib/types";

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

  const { data: announcement } = await supabase
    .from("announcements")
    .select("*")
    .eq("active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<AnnouncementRow>();

  return (
    <MobileShell footer={<TabBar />}>
      <DashboardNotifications userId={user.id} />
      {announcement && (
        <div className="mx-4 mt-3 rounded-xl border border-border bg-card px-3.5 py-2.5 flex items-start gap-2.5 shrink-0">
          <Megaphone size={15} className="text-amber shrink-0 mt-0.5" />
          <p className="font-body text-[12px] text-text leading-snug">{announcement.message}</p>
        </div>
      )}
      {showBanner && todaysEvent && (
        <EventBanner eventId={todaysEvent.id} eventName={todaysEvent.name} />
      )}
      <div className="flex-1 overflow-y-auto min-h-0">{children}</div>
    </MobileShell>
  );
}
