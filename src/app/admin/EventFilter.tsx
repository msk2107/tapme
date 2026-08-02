"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

export default function EventFilter({ eventNames }: { eventNames: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get("event") ?? "";

  const onChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("event", value);
    } else {
      params.delete("event");
    }
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  return (
    <select
      value={current}
      onChange={(e) => onChange(e.target.value)}
      className="bg-card border border-border rounded-lg px-3 py-2 text-text font-body text-[12.5px] outline-none focus:border-amber/60"
    >
      <option value="">All events</option>
      {eventNames.map((name) => (
        <option key={name} value={name}>
          {name}
        </option>
      ))}
    </select>
  );
}
