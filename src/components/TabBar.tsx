"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Pencil, CalendarClock, Radio, History, WalletCards } from "lucide-react";

const TABS = [
  { href: "/dashboard/edit", label: "My Card", icon: Pencil },
  { href: "/dashboard/events", label: "Events", icon: CalendarClock },
  { href: "/dashboard/share", label: "Share", icon: Radio },
  { href: "/dashboard/history", label: "History", icon: History },
  { href: "/dashboard/cards", label: "Cards", icon: WalletCards },
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
