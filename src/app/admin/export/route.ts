import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";

function csvEscape(value: string | number): string {
  const str = String(value);
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

export async function GET() {
  // Route handlers aren't wrapped by the /admin layout, so this must gate itself.
  await requireAdmin();

  const supabase = createAdminClient();
  const [{ data: profiles }, { data: views }, { data: exchanges }, { data: referrals }] = await Promise.all([
    supabase.from("profiles").select("id, name, username, signup_number, created_at"),
    supabase.from("profile_views").select("profile_id"),
    supabase.from("exchanges").select("card_owner_id"),
    supabase.from("referrals").select("referrer_id"),
  ]);

  const count = (rows: { [k: string]: string }[] | null, key: string, id: string) =>
    (rows ?? []).filter((r) => r[key] === id).length;

  const header = ["signup_number", "name", "username", "joined_at", "views", "saves", "referrals"];
  const lines = [header.join(",")];

  (profiles ?? [])
    .sort((a, b) => a.signup_number - b.signup_number)
    .forEach((p) => {
      lines.push(
        [
          p.signup_number,
          csvEscape(p.name),
          csvEscape(p.username),
          p.created_at,
          count(views, "profile_id", p.id),
          count(exchanges, "card_owner_id", p.id),
          count(referrals, "referrer_id", p.id),
        ].join(",")
      );
    });

  return new NextResponse(lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="tapme-users.csv"`,
    },
  });
}
