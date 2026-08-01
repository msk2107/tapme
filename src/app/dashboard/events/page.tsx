import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { todayISO } from "@/lib/events";
import type { EventRow, Profile } from "@/lib/types";
import AddEventForm from "./AddEventForm";
import EventListItem from "./EventListItem";

export default async function EventsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("current_event_id")
    .eq("id", user.id)
    .single<Pick<Profile, "current_event_id">>();

  const { data: events } = await supabase
    .from("events")
    .select("*")
    .eq("user_id", user.id)
    .order("start_date", { ascending: false })
    .returns<EventRow[]>();

  const today = todayISO();

  return (
    <div className="px-4 pt-3 pb-6">
      <p className="font-heading text-xs tracking-wider text-muted uppercase mb-2.5">행사 등록</p>
      <AddEventForm />

      <p className="font-heading text-xs tracking-wider text-muted uppercase mt-6 mb-2.5">
        내 행사 목록
      </p>
      {(!events || events.length === 0) && (
        <div className="text-center py-8 text-faint font-body text-[12.5px]">
          등록된 행사가 없어요. 위에서 행사를 추가해보세요.
        </div>
      )}
      <div className="flex flex-col gap-2">
        {events?.map((event) => (
          <EventListItem
            key={event.id}
            event={event}
            isToday={event.start_date <= today && today <= event.end_date}
            isCurrent={event.id === profile?.current_event_id}
          />
        ))}
      </div>
    </div>
  );
}
