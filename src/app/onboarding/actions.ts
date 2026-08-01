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
    return { error: "아이디는 영문 소문자/숫자/-/_ 조합 3~30자로 입력해주세요." };
  }
  if (!name) {
    return { error: "이름을 입력해주세요." };
  }

  const { error } = await supabase.from("profiles").insert({
    id: user.id,
    username,
    name,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "이미 사용 중인 아이디예요. 다른 아이디를 입력해주세요." };
    }
    return { error: "프로필 생성 중 오류가 발생했어요. 잠시 후 다시 시도해주세요." };
  }

  redirect("/dashboard/edit");
}
