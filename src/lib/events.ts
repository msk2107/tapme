import type { EventRow } from "@/lib/types";

/** 오늘 날짜(YYYY-MM-DD, KST)를 반환 */
export function todayISO(): string {
  const now = new Date();
  const kst = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
  const y = kst.getFullYear();
  const m = String(kst.getMonth() + 1).padStart(2, "0");
  const d = String(kst.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** 오늘 날짜가 start_date~end_date 사이인 이벤트 중 가장 최근에 등록된 것을 반환 */
export function findTodaysEvent(events: EventRow[], today: string): EventRow | null {
  const matches = events.filter((e) => e.start_date <= today && today <= e.end_date);
  if (matches.length === 0) return null;
  return matches.sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
}
