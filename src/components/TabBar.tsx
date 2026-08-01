"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Pencil, CalendarClock, Radio, History } from "lucide-react";

const TABS = [
  { href: "/dashboard/edit", label: "내 카드", icon: Pencil },
  { href: "/dashboard/events", label: "행사", icon: CalendarClock },
  { href: "/dashboard/share", label: "공유", icon: Radio },
  { href: "/dashboard/history", label: "기록", icon: History },
];

export default function TabBar() {
  const pathname = usePathname();

  return (
    <div className="flex border-t border-border bg-surface shrink-0">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const active = pathname === tab.href || pathname?.startsWith(`${tab.href}/`);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex-1 flex flex-col items-center gap-1 py-3 pb-3.5 font-body text-[11px] font-semibold transition-colors ${
              active ? "text-amber" : "text-muted"
            }`}
          >
            <Icon size={18} strokeWidth={active ? 2.4 : 2} />
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
