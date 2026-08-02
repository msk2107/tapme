import { Users, Eye, Download, UserPlus, TrendingUp, Repeat } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import EventFilter from "./EventFilter";
import WeeklyTrendChart from "./WeeklyTrendChart";
import { FIELD_META } from "@/lib/fields";
import type { FieldId } from "@/lib/types";

interface OverviewStats {
  total_users: number;
  users_7d: number;
  users_30d: number;
  total_views: number;
  total_saves: number;
  total_referrals: number;
}

interface ViralCoefficient {
  referrals_in_period: number;
  base_users: number;
  coefficient: number;
}

function StatCard({ label, value, icon: Icon }: { label: string; value: number; icon: React.ElementType }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-center gap-1.5 text-muted mb-1.5">
        <Icon size={13} />
        <span className="font-body text-[11px] uppercase tracking-wide">{label}</span>
      </div>
      <p className="font-heading text-2xl font-bold text-text">{value.toLocaleString()}</p>
    </div>
  );
}

export default async function AdminOverviewPage({
  searchParams,
}: {
  searchParams: Promise<{ event?: string }>;
}) {
  const { event } = await searchParams;
  const eventFilter = event || null;
  const supabase = createAdminClient();

  const { data: eventRows } = await supabase.from("events").select("name").order("name");
  const eventNames = Array.from(new Set((eventRows ?? []).map((e) => e.name)));

  const [{ data: statsRows }, { data: viralRows }, { data: weeklyRows }, { data: channelRows }, { data: retentionRows }] =
    await Promise.all([
      supabase.rpc("admin_overview_stats", { p_event_name: eventFilter }),
      supabase.rpc("admin_viral_coefficient", { p_days: 30, p_event_name: eventFilter }),
      supabase.rpc("admin_weekly_trend", { p_weeks: 8 }),
      supabase.rpc("admin_channel_distribution", { p_event_name: eventFilter }),
      supabase.rpc("admin_event_retention"),
    ]);

  const stats = (statsRows?.[0] ?? null) as OverviewStats | null;
  const viral = (viralRows?.[0] ?? null) as ViralCoefficient | null;
  const weekly = (weeklyRows ?? []) as { week_start: string; signups: number; referrals: number }[];
  const channels = (channelRows ?? []) as { field: string; save_count: number }[];
  const retention = (retentionRows ?? []) as { card_owner_id: string; distinct_events: number }[];
  const maxChannelCount = Math.max(1, ...channels.map((c) => c.save_count));

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="font-heading text-lg font-bold text-text">Overview</h1>
        <EventFilter eventNames={eventNames} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        <StatCard label="Total users" value={stats?.total_users ?? 0} icon={Users} />
        <StatCard label="New (7d)" value={stats?.users_7d ?? 0} icon={Users} />
        <StatCard label="New (30d)" value={stats?.users_30d ?? 0} icon={Users} />
        <StatCard label="Views" value={stats?.total_views ?? 0} icon={Eye} />
        <StatCard label="Saves" value={stats?.total_saves ?? 0} icon={Download} />
        <StatCard label="Referrals" value={stats?.total_referrals ?? 0} icon={UserPlus} />
      </div>

      <div className="bg-card border border-border rounded-xl p-4 mb-6">
        <div className="flex items-center gap-1.5 text-muted mb-2">
          <TrendingUp size={13} />
          <span className="font-body text-[11px] uppercase tracking-wide">
            Viral coefficient (trailing 30 days)
          </span>
        </div>
        <p
          className="font-heading text-4xl font-bold"
          style={{ color: (viral?.coefficient ?? 0) >= 1 ? "var(--color-success)" : "var(--color-muted)" }}
        >
          {(viral?.coefficient ?? 0).toFixed(2)}
        </p>
        <p className="font-body text-[11.5px] text-muted mt-1">
          {viral?.referrals_in_period ?? 0} referral signups ÷ {viral?.base_users ?? 0} users who existed at the
          start of the window. ≥ 1.0 means the existing base is more than replacing itself through referrals.
        </p>
      </div>

      <div className="bg-card border border-border rounded-xl p-4 mb-6">
        <p className="font-body text-[11px] text-muted uppercase tracking-wide mb-2">
          Weekly signups &amp; referrals
        </p>
        <WeeklyTrendChart data={weekly} />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="font-body text-[11px] text-muted uppercase tracking-wide mb-3">
            Most-saved channels
          </p>
          {channels.length === 0 ? (
            <p className="font-body text-[12px] text-faint">No saves yet.</p>
          ) : (
            <div className="flex flex-col gap-2.5">
              {channels.map((c) => {
                const meta = FIELD_META[c.field as FieldId];
                return (
                  <div key={c.field}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-body text-[12px] text-text">{meta?.label ?? c.field}</span>
                      <span className="font-mono text-[11px] text-muted">{c.save_count}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-border overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(c.save_count / maxChannelCount) * 100}%`,
                          background: meta?.color ?? "var(--color-amber)",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-1.5 text-muted mb-2">
            <Repeat size={13} />
            <span className="font-body text-[11px] uppercase tracking-wide">Multi-event usage</span>
          </div>
          <p className="font-heading text-2xl font-bold text-text mb-1">{retention.length}</p>
          <p className="font-body text-[11.5px] text-muted">
            card owners have logged saves under more than one event — a signal of repeat, cross-event usage
            rather than one-off trial.
          </p>
        </div>
      </div>
    </div>
  );
}
