"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AddEventForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) return setError("행사명을 입력해주세요.");
    if (!startDate || !endDate) return setError("시작일과 종료일을 입력해주세요.");
    if (endDate < startDate) return setError("종료일은 시작일 이후여야 해요.");

    setPending(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("로그인이 필요해요.");
      setPending(false);
      return;
    }

    const { error: insertError } = await supabase.from("events").insert({
      user_id: user.id,
      name: name.trim(),
      start_date: startDate,
      end_date: endDate,
    });

    setPending(false);
    if (insertError) {
      setError("행사 등록 중 오류가 발생했어요.");
      return;
    }

    setName("");
    setStartDate("");
    setEndDate("");
    router.refresh();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-card border border-border rounded-xl p-3 flex flex-col gap-2 mb-1"
    >
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="행사명 (예: 2026 서울 스타트업 서밋)"
        className="bg-bg border border-border rounded-lg px-2.5 py-2 text-text font-body text-[13px] outline-none focus:border-amber/60"
      />
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="font-body text-[10.5px] text-faint block mb-1">시작일</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full bg-bg border border-border rounded-lg px-2.5 py-2 text-text font-mono text-[12.5px] outline-none focus:border-amber/60"
          />
        </div>
        <div className="flex-1">
          <label className="font-body text-[10.5px] text-faint block mb-1">종료일</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full bg-bg border border-border rounded-lg px-2.5 py-2 text-text font-mono text-[12.5px] outline-none focus:border-amber/60"
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="bg-amber text-bg font-body text-[13px] font-bold rounded-lg py-2 mt-1 disabled:opacity-60 cursor-pointer"
      >
        {pending ? "등록 중..." : "행사 추가"}
      </button>
      {error && <p className="text-[11.5px] text-red-400">{error}</p>}
    </form>
  );
}
