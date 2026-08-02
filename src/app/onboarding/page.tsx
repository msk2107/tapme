import { redirect } from "next/navigation";
import MobileShell from "@/components/MobileShell";
import { createClient } from "@/lib/supabase/server";
import { suggestUsername } from "@/lib/username";
import OnboardingForm from "./OnboardingForm";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
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

  const { ref } = await searchParams;
  const suggested = suggestUsername(user.email ?? "user");

  return (
    <MobileShell>
      <div className="px-4 pt-2 pb-5">
        <p className="font-heading text-2xl font-bold text-text mb-1">Create your profile</p>
        <p className="font-body text-[13px] text-muted">
          Your public profile link will be built from the username below.
        </p>
      </div>
      <OnboardingForm suggestedUsername={suggested} referrerId={ref} />
    </MobileShell>
  );
}
