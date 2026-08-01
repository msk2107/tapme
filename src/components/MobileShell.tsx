import Link from "next/link";
import { Radio } from "lucide-react";

export default function MobileShell({
  children,
  footer,
}: {
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-bg sm:px-4 sm:py-8">
      <div className="w-full sm:max-w-[420px] min-h-screen sm:min-h-0 bg-bg sm:border sm:border-border sm:rounded-[24px] sm:shadow-[0_20px_50px_rgba(0,0,0,0.4)] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-4 pt-4 pb-1 shrink-0">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-[26px] h-[26px] rounded-[7px] bg-amber flex items-center justify-center">
              <Radio size={14} color="#14161B" strokeWidth={2.6} />
            </div>
            <span className="font-heading text-[15px] font-bold text-text tracking-tight">
              TapMe
            </span>
          </Link>
        </div>
        <div className="flex-1 flex flex-col min-h-0">{children}</div>
        {footer}
      </div>
    </div>
  );
}
