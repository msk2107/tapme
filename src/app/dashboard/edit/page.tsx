import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { EventRow, Profile } from "@/lib/types";
import EditForm from "./EditForm";

export default async function EditPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single<Profile>();
  if (!profile) redirect("/onboarding");

  let currentEventName: string | null = null;
  if (profile.current_event_id) {
    const { data: event } = await supabase
      .from("events")
      .select("name")
      .eq("id", profile.current_event_id)
      .maybeSingle<Pick<EventRow, "name">>();
    currentEventName = event?.name ?? null;
  }

  return <EditForm profile={profile} currentEventName={currentEventName} />;
}
