import Link from "next/link";
import { Radio, ExternalLink } from "lucide-react";
import { requireAdmin } from "@/lib/admin";
import AdminTabBar from "@/components/AdminTabBar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-[960px] mx-auto px-5 sm:px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-[26px] h-[26px] rounded-[7px] bg-amber flex items-center justify-center">
              <Radio size={14} color="#14161B" strokeWidth={2.6} />
            </div>
            <span className="font-heading text-[15px] font-bold text-text tracking-tight">
              TapMe Admin
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="font-body text-[12px] text-muted">{admin.name}</span>
            <Link
              href="/dashboard/edit"
              className="flex items-center gap-1 font-body text-[12px] text-muted hover:text-text"
            >
              Back to app <ExternalLink size={12} />
            </Link>
          </div>
        </div>
        <AdminTabBar />
        {children}
      </div>
    </div>
  );
}
