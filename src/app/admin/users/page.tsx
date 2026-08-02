import { Download } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import AdminUsersTable, { type AdminUserRow } from "./AdminUsersTable";

export default async function AdminUsersPage() {
  const supabase = createAdminClient();

  const [{ data: profiles }, { data: views }, { data: exchanges }, { data: referrals }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, name, username, signup_number, is_admin, created_at")
      .order("signup_number", { ascending: true }),
    supabase.from("profile_views").select("profile_id"),
    supabase.from("exchanges").select("card_owner_id"),
    supabase.from("referrals").select("referrer_id"),
  ]);

  const viewCounts = new Map<string, number>();
  (views ?? []).forEach((v) => viewCounts.set(v.profile_id, (viewCounts.get(v.profile_id) ?? 0) + 1));

  const saveCounts = new Map<string, number>();
  (exchanges ?? []).forEach((e) =>
    saveCounts.set(e.card_owner_id, (saveCounts.get(e.card_owner_id) ?? 0) + 1)
  );

  const referralCounts = new Map<string, number>();
  (referrals ?? []).forEach((r) =>
    referralCounts.set(r.referrer_id, (referralCounts.get(r.referrer_id) ?? 0) + 1)
  );

  const rows: AdminUserRow[] = (profiles ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    username: p.username,
    signupNumber: p.signup_number,
    isAdmin: p.is_admin,
    createdAt: p.created_at,
    views: viewCounts.get(p.id) ?? 0,
    saves: saveCounts.get(p.id) ?? 0,
    referrals: referralCounts.get(p.id) ?? 0,
  }));

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="font-heading text-lg font-bold text-text">Users ({rows.length})</h1>
        <a
          href="/admin/export"
          className="flex items-center gap-1.5 bg-card border border-border rounded-lg px-3 py-2 font-body text-[12px] font-semibold text-text hover:border-amber/60"
        >
          <Download size={13} /> Download CSV
        </a>
      </div>
      <AdminUsersTable rows={rows} />
    </div>
  );
}
