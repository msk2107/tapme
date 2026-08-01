"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginForm({ next }: { next?: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setError("");

    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback${
      next ? `?next=${encodeURIComponent(next)}` : ""
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
        <p className="font-heading text-lg font-semibold text-text mb-2">메일함을 확인해주세요</p>
        <p className="font-body text-[13px] text-muted leading-relaxed">
          <span className="text-text">{email}</span> 주소로 로그인 링크를 보냈어요.
          <br />
          메일의 링크를 누르면 자동으로 로그인됩니다.
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 py-8">
      <p className="font-heading text-2xl font-bold text-text mb-1">로그인</p>
      <p className="font-body text-[13px] text-muted mb-6">
        이메일로 받은 링크를 클릭하면 비밀번호 없이 바로 로그인돼요.
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
          {status === "sending" ? "전송 중..." : "로그인 링크 받기"}
        </button>
        {status === "error" && <p className="text-[12px] text-red-400">{error}</p>}
      </form>
    </div>
  );
}
