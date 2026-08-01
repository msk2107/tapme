import { redirect } from "next/navigation";
import MobileShell from "@/components/MobileShell";
import { createClient } from "@/lib/supabase/server";
import { suggestUsername } from "@/lib/username";
import OnboardingForm from "./OnboardingForm";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();
  if (profile) redirect("/dashboard/edit");

  const suggested = suggestUsername(user.email ?? "user");

  return (
    <MobileShell>
      <div className="px-4 pt-2 pb-5">
        <p className="font-heading text-2xl font-bold text-text mb-1">프로필 만들기</p>
        <p className="font-body text-[13px] text-muted">
          아래 아이디로 공개 프로필 주소가 만들어져요.
        </p>
      </div>
      <OnboardingForm suggestedUsername={suggested} />
    </MobileShell>
  );
}
