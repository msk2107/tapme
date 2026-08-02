"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isValidUsername } from "@/lib/username";

export interface OnboardingState {
  error: string;
}

export async function createProfile(
  _prev: OnboardingState,
  formData: FormData
): Promise<OnboardingState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const username = String(formData.get("username") || "")
    .trim()
    .toLowerCase();
  const name = String(formData.get("name") || "").trim();

  if (!isValidUsername(username)) {
    return { error: "Username must be 3–30 characters: lowercase letters, numbers, -, _" };
  }
  if (!name) {
    return { error: "Please enter your name." };
  }

  const { error } = await supabase.from("profiles").insert({
    id: user.id,
    username,
    name,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "That username is already taken. Please try another." };
    }
    return { error: "Something went wrong creating your profile. Please try again." };
  }

  const ref = String(formData.get("ref") || "").trim();
  if (ref && ref !== user.id) {
    // Snapshot the referrer's current event (cross-user read, needs the admin client).
    const admin = createAdminClient();
    const { data: referrerProfile } = await admin
      .from("profiles")
      .select("current_event_id")
      .eq("id", ref)
      .maybeSingle<{ current_event_id: string | null }>();

    let eventName: string | null = null;
    if (referrerProfile?.current_event_id) {
      const { data: event } = await admin
        .from("events")
        .select("name")
        .eq("id", referrerProfile.current_event_id)
        .maybeSingle<{ name: string }>();
      eventName = event?.name ?? null;
    }

    // Best-effort: an invalid/unknown ref just fails the FK check silently
    // and shouldn't block the signup that already succeeded above.
    await supabase
      .from("referrals")
      .insert({ referrer_id: ref, referred_user_id: user.id, event_name: eventName });
  }

  redirect("/dashboard/edit");
}
