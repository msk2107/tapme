"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
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

  redirect("/dashboard/edit");
}
