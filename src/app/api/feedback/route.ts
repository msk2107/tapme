import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const { profileId, message } = body as Record<string, unknown>;

  if (typeof profileId !== "string" || !profileId) {
    return NextResponse.json({ error: "profileId required" }, { status: 400 });
  }
  if (typeof message !== "string" || !message.trim()) {
    return NextResponse.json({ error: "message required" }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: owner } = await supabase.from("profiles").select("id").eq("id", profileId).maybeSingle();
  if (!owner) {
    return NextResponse.json({ error: "profile not found" }, { status: 404 });
  }

  const { error } = await supabase.from("feedback").insert({
    profile_id: profileId,
    message: message.trim().slice(0, 500),
  });

  if (error) {
    return NextResponse.json({ error: "insert failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
