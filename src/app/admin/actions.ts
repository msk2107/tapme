"use server";

import { requireAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { FIELD_ORDER, fieldValue, fieldVisible } from "@/lib/fields";
import type { FieldId, Profile } from "@/lib/types";

export interface UserContactInfo {
  values: Partial<Record<FieldId, { value: string; visible: boolean }>>;
}

/** Reveals a user's contact fields to the admin and logs the access. */
export async function viewUserContact(userId: string): Promise<UserContactInfo | { error: string }> {
  const admin = await requireAdmin();
  const supabase = createAdminClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle<Profile>();

  if (!profile) return { error: "User not found." };

  await supabase.from("admin_access_log").insert({ admin_id: admin.id, viewed_user_id: userId });

  const values: UserContactInfo["values"] = {};
  FIELD_ORDER.forEach((id: FieldId) => {
    values[id] = { value: fieldValue(profile, id), visible: fieldVisible(profile, id) };
  });

  return { values };
}

export async function togglePartnerEvent(eventId: string, isPartner: boolean): Promise<void> {
  await requireAdmin();
  const supabase = createAdminClient();
  await supabase.from("events").update({ is_partner: isPartner }).eq("id", eventId);
}

export async function publishAnnouncement(message: string): Promise<void> {
  const admin = await requireAdmin();
  const supabase = createAdminClient();
  await supabase.from("announcements").update({ active: false }).eq("active", true);
  if (message.trim()) {
    await supabase.from("announcements").insert({ message: message.trim(), created_by: admin.id });
  }
}

export async function upsertFeatureFlag(
  key: string,
  enabled: boolean,
  rolloutPercent: number
): Promise<void> {
  await requireAdmin();
  const supabase = createAdminClient();
  await supabase
    .from("feature_flags")
    .upsert({ key: key.trim(), enabled, rollout_percent: rolloutPercent }, { onConflict: "key" });
}
