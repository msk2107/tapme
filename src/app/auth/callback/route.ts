import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard/edit";
  const ref = searchParams.get("ref");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const separator = next.includes("?") ? "&" : "?";
      const target = ref ? `${next}${separator}ref=${encodeURIComponent(ref)}` : next;
      return NextResponse.redirect(`${origin}${target}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
