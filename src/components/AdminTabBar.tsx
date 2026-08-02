"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Users, CalendarClock, Wrench, MessageSquare } from "lucide-react";

const TABS = [
  { href: "/admin", label: "Overview", icon: BarChart3, exact: true },
  { href: "/admin/users", label: "Users", icon: Users, exact: false },
  { href: "/admin/events", label: "Events", icon: CalendarClock, exact: false },
  { href: "/admin/tools", label: "Tools", icon: Wrench, exact: false },
  { href: "/admin/feedback", label: "Feedback", icon: MessageSquare, exact: false },
];

export default function AdminTabBar() {
  const pathname = usePathname();

  return (
    <div className="flex gap-1 border-b border-border mb-6 overflow-x-auto">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const active = tab.exact ? pathname === tab.href : pathname?.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 font-body text-[13px] font-semibold whitespace-nowrap border-b-2 -mb-px transition-colors ${
              active ? "text-amber border-amber" : "text-muted border-transparent hover:text-text"
            }`}
          >
            <Icon size={14} />
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
