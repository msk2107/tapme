import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { FIELD_META } from "@/lib/fields";

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

  const { ownerId, viewerId, viewerName, eventName, savedFields } = body as Record<string, unknown>;

  if (typeof ownerId !== "string" || !ownerId) {
    return NextResponse.json({ error: "ownerId required" }, { status: 400 });
  }
  if (!Array.isArray(savedFields)) {
    return NextResponse.json({ error: "savedFields required" }, { status: 400 });
  }

  const validFields = savedFields.filter(
    (f): f is string => typeof f === "string" && f in FIELD_META
  );
  if (validFields.length === 0) {
    return NextResponse.json({ error: "no valid fields" }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: owner, error: ownerError } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", ownerId)
    .maybeSingle();

  if (ownerError || !owner) {
    return NextResponse.json({ error: "owner not found" }, { status: 404 });
  }

  const { error } = await supabase.from("exchanges").insert({
    card_owner_id: ownerId,
    viewer_id: typeof viewerId === "string" ? viewerId : null,
    viewer_name:
      typeof viewerName === "string" && viewerName.trim() ? viewerName.trim().slice(0, 80) : null,
    event_name:
      typeof eventName === "string" && eventName.trim() ? eventName.trim().slice(0, 120) : null,
    saved_fields: validFields,
  });

  if (error) {
    return NextResponse.json({ error: "insert failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
