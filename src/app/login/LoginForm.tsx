"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginForm({
  next,
  referrerId,
}: {
  next?: string;
  referrerId?: string;
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setError("");

    const supabase = createClient();
    // New signups arriving via a referral link land on /onboarding so the
    // referral can be recorded there; everyone else goes to their dashboard.
    const target = next || (referrerId ? "/onboarding" : "/dashboard/edit");
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(target)}${
      referrerId ? `&ref=${encodeURIComponent(referrerId)}` : ""
    }`;

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    });

    if (error) {
      setStatus("error");
      setError(error.message);
    } else {
      setStatus("sent");
    }
  };

  if (status === "sent") {
    return (
      <div className="px-4 py-14 text-center">
        <p className="font-heading text-lg font-semibold text-text mb-2">Check your inbox</p>
        <p className="font-body text-[13px] text-muted leading-relaxed">
          We sent a login link to <span className="text-text">{email}</span>.
          <br />
          Click the link in the email to sign in automatically.
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 py-8">
      <p className="font-heading text-2xl font-bold text-text mb-1">Log in</p>
      <p className="font-body text-[13px] text-muted mb-6">
        Click the link we email you to sign in — no password needed.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="bg-card border border-border rounded-lg px-3 py-2.5 text-text font-body text-sm outline-none focus:border-amber/60"
        />
        <button
          type="submit"
          disabled={status === "sending"}
          className="bg-amber text-bg font-body text-sm font-bold rounded-lg py-2.5 disabled:opacity-60 cursor-pointer"
        >
          {status === "sending" ? "Sending..." : "Send login link"}
        </button>
        {status === "error" && <p className="text-[12px] text-red-400">{error}</p>}
      </form>
    </div>
  );
}
