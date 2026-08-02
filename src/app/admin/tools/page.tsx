import { createAdminClient } from "@/lib/supabase/admin";
import type { AnnouncementRow, FeatureFlagRow } from "@/lib/types";
import AnnouncementForm from "./AnnouncementForm";
import FeatureFlagsManager from "./FeatureFlagsManager";

export default async function AdminToolsPage() {
  const supabase = createAdminClient();

  const [{ data: announcement }, { data: flags }] = await Promise.all([
    supabase
      .from("announcements")
      .select("*")
      .eq("active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle<AnnouncementRow>(),
    supabase.from("feature_flags").select("*").order("created_at", { ascending: false }).returns<FeatureFlagRow[]>(),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-heading text-lg font-bold text-text">Tools</h1>
      <AnnouncementForm currentMessage={announcement?.message ?? null} />
      <FeatureFlagsManager flags={flags ?? []} />
    </div>
  );
}
