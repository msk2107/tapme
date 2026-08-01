import Link from "next/link";
import { Radio, QrCode, Zap } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen flex flex-1 flex-col items-center justify-center bg-bg px-6 py-16">
      <div className="w-full max-w-[380px] text-center">
        <div className="w-14 h-14 rounded-2xl bg-amber flex items-center justify-center mx-auto mb-6 shadow-[0_8px_24px_rgba(232,163,61,0.35)]">
          <Radio size={26} color="#14161B" strokeWidth={2.4} />
        </div>
        <h1 className="font-heading text-3xl font-bold text-text tracking-tight mb-3">TapMe</h1>
        <p className="font-body text-[14px] text-muted-2 leading-relaxed mb-10">
          No more paper cards. Just one tap.
          <br />
          Share your contact via NFC or QR — the digital business card.
        </p>

        <div className="flex flex-col gap-2.5 text-left mb-10">
          <div className="flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3">
            <QrCode size={16} className="text-amber shrink-0" />
            <span className="font-body text-[12.5px] text-muted-2">
              Opens right in the browser &amp; saves instantly — no app install
            </span>
          </div>
          <div className="flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3">
            <Zap size={16} className="text-amber shrink-0" />
            <span className="font-body text-[12.5px] text-muted-2">
              Share only what you choose to make public
            </span>
          </div>
        </div>

        <Link
          href={user ? "/dashboard/edit" : "/login"}
          className="block w-full bg-amber text-bg font-body text-[14px] font-bold rounded-xl py-3.5"
        >
          {user ? "Go to my dashboard" : "Get started"}
        </Link>
      </div>
    </div>
  );
}
