import type { EventRow } from "@/lib/types";

/** Returns today's date (YYYY-MM-DD, KST) */
export function todayISO(): string {
  const now = new Date();
  const kst = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
  const y = kst.getFullYear();
  const m = String(kst.getMonth() + 1).padStart(2, "0");
  const d = String(kst.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Returns the most recently added event whose date range includes today */
export function findTodaysEvent(events: EventRow[], today: string): EventRow | null {
  const matches = events.filter((e) => e.start_date <= today && today <= e.end_date);
  if (matches.length === 0) return null;
  return matches.sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
}
