import { createClient } from "@/lib/supabase/server";
import HowItWorksCarousel from "./HowItWorksCarousel";

export default async function HowItWorksPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <HowItWorksCarousel loggedIn={!!user} />;
}
