import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { FIELD_ORDER, fieldValue, fieldVisible } from "@/lib/fields";
import type { EventRow, FieldId, Profile } from "@/lib/types";
import PublicProfileClient from "./PublicProfileClient";

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const supabase = createAdminClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .maybeSingle<Profile>();

  if (!profile) notFound();

  // Count this as a view unless the profile owner is looking at their own page.
  const viewerSupabase = await createClient();
  const {
    data: { user: viewer },
  } = await viewerSupabase.auth.getUser();
  if (!viewer || viewer.id !== profile.id) {
    await supabase.from("profile_views").insert({ profile_id: profile.id });
  }

  let eventName: string | null = null;
  if (profile.current_event_id) {
    const { data: event } = await supabase
      .from("events")
      .select("name")
      .eq("id", profile.current_event_id)
      .maybeSingle<Pick<EventRow, "name">>();
    eventName = event?.name ?? null;
  }

  const visibleFields = FIELD_ORDER.filter(
    (id) => fieldVisible(profile, id) && fieldValue(profile, id).trim()
  );
  const values: Partial<Record<FieldId, string>> = {};
  visibleFields.forEach((id) => {
    values[id] = fieldValue(profile, id);
  });

  const hdrs = await headers();
  const host = hdrs.get("host") ?? "localhost:3000";
  const protocol = host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https";
  const publicUrl = `${protocol}://${host}/u/${profile.username}`;

  return (
    <PublicProfileClient
      ownerId={profile.id}
      name={profile.name}
      title={profile.title}
      company={profile.company}
      avatarUrl={profile.avatar_url}
      eventName={eventName}
      visibleFields={visibleFields}
      values={values}
      publicUrl={publicUrl}
    />
  );
}
