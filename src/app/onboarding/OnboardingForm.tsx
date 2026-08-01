"use client";

import { useActionState } from "react";
import { createProfile, type OnboardingState } from "./actions";

const initialState: OnboardingState = { error: "" };

export default function OnboardingForm({ suggestedUsername }: { suggestedUsername: string }) {
  const [state, formAction, pending] = useActionState(createProfile, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-3 px-4 pb-8">
      <div>
        <label className="font-body text-[11px] text-muted uppercase tracking-wide mb-1 block">
          이름
        </label>
        <input
          name="name"
          required
          placeholder="홍길동"
          className="w-full bg-card border border-border rounded-lg px-3 py-2.5 text-text font-body text-sm outline-none focus:border-amber/60"
        />
      </div>
      <div>
        <label className="font-body text-[11px] text-muted uppercase tracking-wide mb-1 block">
          프로필 아이디
        </label>
        <div className="flex items-center gap-1.5 bg-card border border-border rounded-lg px-3 py-2.5 focus-within:border-amber/60">
          <span className="font-mono text-[12px] text-faint shrink-0">tapme.app/u/</span>
          <input
            name="username"
            required
            defaultValue={suggestedUsername}
            pattern="[a-z0-9_-]{3,30}"
            className="flex-1 min-w-0 bg-transparent text-text font-mono text-[13px] outline-none"
          />
        </div>
        <p className="font-body text-[11px] text-faint mt-1">영문 소문자, 숫자, -, _ 조합 3~30자</p>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="mt-2 bg-amber text-bg font-body text-sm font-bold rounded-lg py-2.5 disabled:opacity-60 cursor-pointer"
      >
        {pending ? "만드는 중..." : "시작하기"}
      </button>
      {state.error && <p className="text-[12px] text-red-400">{state.error}</p>}
    </form>
  );
}
