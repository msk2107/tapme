"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import FieldRow from "@/components/FieldRow";
import ToggleSwitch from "@/components/ToggleSwitch";
import { FIELD_ORDER, fieldValue, fieldVisible } from "@/lib/fields";
import type { FieldId, Profile } from "@/lib/types";

export default function EditForm({
  profile,
  currentEventName,
}: {
  profile: Profile;
  currentEventName: string | null;
}) {
  const [card, setCard] = useState<Profile>(profile);
  const [saveStatus, setSaveStatus] = useState("");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipFirst = useRef(true);

  const update = (key: "name" | "title" | "company", value: string) =>
    setCard((c) => ({ ...c, [key]: value }));

  const updateFieldValue = (id: FieldId, value: string) =>
    setCard((c) => ({ ...c, [`${id}_value`]: value }));

  const toggleVisible = (id: FieldId) =>
    setCard((c) => ({ ...c, [`${id}_visible`]: !fieldVisible(c, id) }));

  useEffect(() => {
    if (skipFirst.current) {
      skipFirst.current = false;
      return;
    }
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      const supabase = createClient();
      const { error } = await supabase
        .from("profiles")
        .update({
          name: card.name,
          title: card.title,
          company: card.company,
          kakao_value: card.kakao_value,
          kakao_visible: card.kakao_visible,
          instagram_value: card.instagram_value,
          instagram_visible: card.instagram_visible,
          linkedin_value: card.linkedin_value,
          linkedin_visible: card.linkedin_visible,
          facebook_value: card.facebook_value,
          facebook_visible: card.facebook_visible,
          phone_value: card.phone_value,
          phone_visible: card.phone_visible,
          email_value: card.email_value,
          email_visible: card.email_visible,
        })
        .eq("id", card.id);
      if (!error) {
        setSaveStatus("저장됨");
        setTimeout(() => setSaveStatus(""), 1200);
      }
    }, 600);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [card]);

  return (
    <div className="px-4 pt-3 pb-6">
      <p className="font-heading text-xs tracking-wider text-muted uppercase mb-1">내 정보</p>
      <input
        value={card.name}
        onChange={(e) => update("name", e.target.value)}
        placeholder="이름"
        className="w-full bg-transparent border-0 border-b-2 border-border text-text font-heading text-[22px] font-semibold py-1.5 mb-2 outline-none focus:border-amber/60"
      />
      <div className="flex gap-2 mb-1.5">
        <input
          value={card.title}
          onChange={(e) => update("title", e.target.value)}
          placeholder="직함"
          className="flex-1 min-w-0 bg-card border border-border rounded-lg px-2.5 py-2 text-[#D5D8DE] font-body text-[13px] outline-none focus:border-amber/60"
        />
        <input
          value={card.company}
          onChange={(e) => update("company", e.target.value)}
          placeholder="소속"
          className="flex-1 min-w-0 bg-card border border-border rounded-lg px-2.5 py-2 text-[#D5D8DE] font-body text-[13px] outline-none focus:border-amber/60"
        />
      </div>

      <Link
        href="/dashboard/events"
        className="flex items-center justify-between bg-card border border-border rounded-lg px-3 py-2.5 mb-4"
      >
        <div className="min-w-0">
          <p className="font-body text-[10.5px] text-faint uppercase tracking-wide mb-0.5">
            현재 참석 중인 행사
          </p>
          <p className="font-body text-[13px] text-text truncate">
            {currentEventName ?? "설정된 행사 없음"}
          </p>
        </div>
        <ChevronRight size={16} className="text-muted shrink-0" />
      </Link>

      <p className="font-heading text-xs tracking-wider text-muted uppercase mb-2.5">
        공유 채널 (오른쪽 스위치로 공개/비공개)
      </p>
      {FIELD_ORDER.map((id) => (
        <div key={id} className="flex items-center gap-2">
          <div className="flex-1 min-w-0">
            <FieldRow
              id={id}
              value={fieldValue(card, id)}
              onChange={updateFieldValue}
              disabled={!fieldVisible(card, id)}
            />
          </div>
          <div className="mb-2.5">
            <ToggleSwitch checked={fieldVisible(card, id)} onChange={() => toggleVisible(id)} />
          </div>
        </div>
      ))}

      <div
        className="text-center font-body text-[11.5px] py-1.5 mt-1"
        style={{ color: saveStatus ? "var(--color-success)" : "var(--color-muted)" }}
      >
        {saveStatus || "변경사항은 자동 저장됩니다"}
      </div>
    </div>
  );
}
