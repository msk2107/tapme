import React, { useState, useEffect, useRef } from "react";
import {
  QrCode,
  Check,
  Instagram,
  Linkedin,
  Phone,
  Mail,
  MessageCircle,
  Clock,
  ChevronRight,
  Pencil,
  Radio,
  History,
  Download,
  Sparkles,
} from "lucide-react";

const FONT_LINK_ID = "tapcard-fonts";

function useFonts() {
  useEffect(() => {
    if (document.getElementById(FONT_LINK_ID)) return;
    const link = document.createElement("link");
    link.id = FONT_LINK_ID;
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap";
    document.head.appendChild(link);
  }, []);
}

const FIELD_META = {
  kakao: { label: "카카오톡 오픈채팅", icon: MessageCircle, color: "#F4D35E" },
  instagram: { label: "인스타그램", icon: Instagram, color: "#E8A33D" },
  linkedin: { label: "링크드인", icon: Linkedin, color: "#4FB3E8" },
  phone: { label: "전화번호", icon: Phone, color: "#3ED9A3" },
  email: { label: "이메일", icon: Mail, color: "#C6A8FF" },
};

const DEFAULT_CARD = {
  name: "김지호",
  title: "프로덕트 매니저",
  company: "누리랩",
  event: "2026 서울 스타트업 서밋",
  kakao: "https://open.kakao.com/o/jihoconnect",
  instagram: "@jiho.pm",
  linkedin: "linkedin.com/in/jihokim",
  phone: "010-1234-5678",
  email: "jiho@nurilab.co",
  visible: { kakao: true, instagram: true, linkedin: true, phone: true, email: true },
};

function vCardText(card, fields) {
  const lines = ["BEGIN:VCARD", "VERSION:3.0", `FN:${card.name}`];
  if (card.company) lines.push(`ORG:${card.company}`);
  if (card.title) lines.push(`TITLE:${card.title}`);
  if (fields.phone && card.phone) lines.push(`TEL;TYPE=CELL:${card.phone}`);
  if (fields.email && card.email) lines.push(`EMAIL:${card.email}`);
  if (fields.linkedin && card.linkedin) lines.push(`URL;TYPE=LinkedIn:https://${card.linkedin.replace(/^https?:\/\//, "")}`);
  if (fields.instagram && card.instagram) lines.push(`URL;TYPE=Instagram:https://instagram.com/${card.instagram.replace("@", "")}`);
  if (fields.kakao && card.kakao) lines.push(`URL;TYPE=KakaoTalk:${card.kakao}`);
  lines.push("END:VCARD");
  return lines.join("\n");
}

function downloadVCard(card, fields) {
  const text = vCardText(card, fields);
  const blob = new Blob([text], { type: "text/vcard" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${card.name || "contact"}.vcf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function TabBar({ active, setActive }) {
  const tabs = [
    { id: "edit", label: "내 카드", icon: Pencil },
    { id: "share", label: "탭 공유", icon: Radio },
    { id: "history", label: "기록", icon: History },
  ];
  return (
    <div
      style={{
        display: "flex",
        borderTop: "1px solid #2A2D35",
        background: "#14161B",
      }}
    >
      {tabs.map((t) => {
        const Icon = t.icon;
        const isActive = active === t.id;
        return (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              padding: "12px 0 14px",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: isActive ? "#E8A33D" : "#787E8C",
              fontFamily: "Inter, sans-serif",
              fontSize: 11,
              fontWeight: 600,
              transition: "color 0.15s ease",
            }}
          >
            <Icon size={18} strokeWidth={isActive ? 2.4 : 2} />
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

function FieldRow({ id, value, onChange, disabled }) {
  const meta = FIELD_META[id];
  const Icon = meta.icon;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
      <div
        style={{
          width: 30,
          height: 30,
          borderRadius: 8,
          background: "#1B1E25",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          border: "1px solid #2A2D35",
        }}
      >
        <Icon size={14} color={meta.color} />
      </div>
      <input
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(id, e.target.value)}
        placeholder={meta.label}
        style={{
          flex: 1,
          background: "#1B1E25",
          border: "1px solid #2A2D35",
          borderRadius: 8,
          padding: "8px 10px",
          color: "#F7F5F1",
          fontFamily: "Inter, sans-serif",
          fontSize: 13,
          outline: "none",
        }}
      />
    </div>
  );
}

function EditScreen({ card, setCard, saveStatus }) {
  const update = (key, val) => setCard((c) => ({ ...c, [key]: val }));
  const toggleVisible = (id) =>
    setCard((c) => ({ ...c, visible: { ...c.visible, [id]: !c.visible[id] } }));

  return (
    <div style={{ padding: "18px 16px 8px" }}>
      <p style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 12, letterSpacing: 1, color: "#787E8C", margin: "0 0 4px", textTransform: "uppercase" }}>
        내 정보
      </p>
      <input
        value={card.name}
        onChange={(e) => update("name", e.target.value)}
        placeholder="이름"
        style={{
          width: "100%",
          background: "transparent",
          border: "none",
          borderBottom: "2px solid #2A2D35",
          color: "#F7F5F1",
          fontFamily: "Space Grotesk, sans-serif",
          fontSize: 22,
          fontWeight: 600,
          padding: "6px 0 10px",
          outline: "none",
          marginBottom: 8,
        }}
      />
      <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
        <input
          value={card.title}
          onChange={(e) => update("title", e.target.value)}
          placeholder="직함"
          style={{ flex: 1, background: "#1B1E25", border: "1px solid #2A2D35", borderRadius: 8, padding: "8px 10px", color: "#D5D8DE", fontSize: 13, fontFamily: "Inter, sans-serif", outline: "none" }}
        />
        <input
          value={card.company}
          onChange={(e) => update("company", e.target.value)}
          placeholder="소속"
          style={{ flex: 1, background: "#1B1E25", border: "1px solid #2A2D35", borderRadius: 8, padding: "8px 10px", color: "#D5D8DE", fontSize: 13, fontFamily: "Inter, sans-serif", outline: "none" }}
        />
      </div>
      <input
        value={card.event}
        onChange={(e) => update("event", e.target.value)}
        placeholder="현재 참석 중인 행사 (선택)"
        style={{ width: "100%", background: "#1B1E25", border: "1px solid #2A2D35", borderRadius: 8, padding: "8px 10px", color: "#D5D8DE", fontSize: 13, fontFamily: "Inter, sans-serif", outline: "none", marginBottom: 18 }}
      />

      <p style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 12, letterSpacing: 1, color: "#787E8C", margin: "0 0 10px", textTransform: "uppercase" }}>
        공유 채널 (탭 옆 스위치로 공개/비공개)
      </p>
      {Object.keys(FIELD_META).map((id) => (
        <div key={id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ flex: 1 }}>
            <FieldRow id={id} value={card[id]} onChange={update} disabled={!card.visible[id]} />
          </div>
          <button
            onClick={() => toggleVisible(id)}
            style={{
              width: 38,
              height: 22,
              borderRadius: 11,
              border: "none",
              cursor: "pointer",
              background: card.visible[id] ? "#E8A33D" : "#2A2D35",
              position: "relative",
              marginBottom: 10,
              flexShrink: 0,
              transition: "background 0.15s ease",
            }}
          >
            <div
              style={{
                width: 16,
                height: 16,
                borderRadius: "50%",
                background: "#0E1014",
                position: "absolute",
                top: 3,
                left: card.visible[id] ? 19 : 3,
                transition: "left 0.15s ease",
              }}
            />
          </button>
        </div>
      ))}

      <div style={{ height: 8 }} />
      <div
        style={{
          fontFamily: "Inter, sans-serif",
          fontSize: 11.5,
          color: saveStatus ? "#3ED9A3" : "#787E8C",
          textAlign: "center",
          padding: "6px 0 4px",
        }}
      >
        {saveStatus || "변경사항은 자동 저장됩니다"}
      </div>
    </div>
  );
}

function RippleButton({ onTap, isRippling }) {
  return (
    <div style={{ position: "relative", width: 120, height: 120, margin: "6px auto 4px" }}>
      {isRippling &&
        [0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              border: "2px solid #E8A33D",
              animation: `tapRipple 1.1s ease-out ${i * 0.28}s`,
              opacity: 0,
            }}
          />
        ))}
      <button
        onClick={onTap}
        style={{
          width: 120,
          height: 120,
          borderRadius: "50%",
          border: "none",
          cursor: "pointer",
          background: "radial-gradient(circle at 35% 30%, #F4C572, #E8A33D 70%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          boxShadow: "0 8px 24px rgba(232,163,61,0.35)",
        }}
      >
        <Radio size={26} color="#14161B" strokeWidth={2.4} />
        <span style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 12.5, fontWeight: 700, color: "#14161B" }}>
          탭하기
        </span>
      </button>
      <style>{`
        @keyframes tapRipple {
          0% { transform: scale(1); opacity: 0.65; }
          100% { transform: scale(1.9); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

function ShareScreen({ card, onExchange }) {
  const [phase, setPhase] = useState("idle"); // idle -> rippling -> received
  const [selected, setSelected] = useState({});

  const visibleFields = Object.keys(FIELD_META).filter((id) => card.visible[id]);
  const qrPayload = encodeURIComponent(
    `TAPCARD::${card.name}::${visibleFields.join(",")}`
  );
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&bgcolor=14161B&color=F7F5F1&data=${qrPayload}`;

  const handleTap = () => {
    if (phase === "received") {
      setPhase("idle");
      setSelected({});
      return;
    }
    setPhase("rippling");
    const init = {};
    visibleFields.forEach((f) => (init[f] = true));
    setSelected(init);
    setTimeout(() => setPhase("received"), 550);
  };

  const toggleSel = (id) => setSelected((s) => ({ ...s, [id]: !s[id] }));

  const confirmSave = () => {
    onExchange(selected);
    setPhase("idle");
  };

  return (
    <div style={{ padding: "18px 16px 8px", textAlign: "center" }}>
      {phase !== "received" && (
        <>
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: 12.5, color: "#9CA3AF", margin: "0 0 2px" }}>
            상대방 폰에 태그를 탭하면 자동으로 열립니다
          </p>
          <p style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 10.5, color: "#5A6070", margin: "0 0 10px" }}>
            NFC 태그가 없다면 아래 QR로 대신 스캔
          </p>
          <RippleButton onTap={handleTap} isRippling={phase === "rippling"} />
          <div
            style={{
              marginTop: 18,
              display: "inline-flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
              padding: 14,
              background: "#1B1E25",
              border: "1px solid #2A2D35",
              borderRadius: 14,
            }}
          >
            <img src={qrUrl} width={140} height={140} alt="QR" style={{ borderRadius: 8 }} />
            <span style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: "#787E8C", display: "flex", alignItems: "center", gap: 4 }}>
              <QrCode size={12} /> 대체 공유 수단 (QR)
            </span>
          </div>
        </>
      )}

      {phase === "received" && (
        <div style={{ textAlign: "left" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10, justifyContent: "center" }}>
            <Sparkles size={14} color="#3ED9A3" />
            <span style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: "#3ED9A3", fontWeight: 600 }}>
              상대방 화면 (수신 미리보기)
            </span>
          </div>
          <div style={{ background: "#1B1E25", border: "1px solid #2A2D35", borderRadius: 14, padding: 16, marginBottom: 12 }}>
            <div style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 18, fontWeight: 700, color: "#F7F5F1" }}>{card.name}</div>
            <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12.5, color: "#9CA3AF", marginBottom: 12 }}>
              {card.title} · {card.company}
            </div>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: 11.5, color: "#787E8C", margin: "0 0 8px" }}>
              저장할 항목을 선택하세요
            </p>
            {visibleFields.map((id) => {
              const meta = FIELD_META[id];
              const Icon = meta.icon;
              const on = !!selected[id];
              return (
                <button
                  key={id}
                  onClick={() => toggleSel(id)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "9px 10px",
                    marginBottom: 6,
                    borderRadius: 9,
                    border: `1px solid ${on ? meta.color : "#2A2D35"}`,
                    background: on ? "rgba(232,163,61,0.08)" : "transparent",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <Icon size={15} color={meta.color} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12.5, color: "#F7F5F1", fontWeight: 500 }}>{meta.label}</div>
                    <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 10.5, color: "#787E8C" }}>{card[id]}</div>
                  </div>
                  <div
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 5,
                      border: `1.5px solid ${on ? meta.color : "#4A4F5A"}`,
                      background: on ? meta.color : "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {on && <Check size={12} color="#14161B" strokeWidth={3} />}
                  </div>
                </button>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => downloadVCard(card, selected)}
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                padding: "10px 0",
                borderRadius: 9,
                border: "1px solid #2A2D35",
                background: "transparent",
                color: "#D5D8DE",
                fontFamily: "Inter, sans-serif",
                fontSize: 12.5,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <Download size={13} /> 연락처 저장
            </button>
            <button
              onClick={confirmSave}
              style={{
                flex: 1,
                padding: "10px 0",
                borderRadius: 9,
                border: "none",
                background: "#E8A33D",
                color: "#14161B",
                fontFamily: "Inter, sans-serif",
                fontSize: 12.5,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              완료 · 기록 남기기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function HistoryScreen({ exchanges }) {
  return (
    <div style={{ padding: "18px 16px 8px" }}>
      <p style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 12, letterSpacing: 1, color: "#787E8C", margin: "0 0 12px", textTransform: "uppercase" }}>
        내 카드를 받아간 사람
      </p>
      {exchanges.length === 0 && (
        <div style={{ textAlign: "center", padding: "30px 10px", color: "#5A6070", fontFamily: "Inter, sans-serif", fontSize: 12.5 }}>
          아직 기록이 없습니다.<br />‘탭 공유’ 탭에서 탭하기를 눌러보세요.
        </div>
      )}
      {exchanges.map((ex, i) => (
        <div
          key={i}
          style={{
            background: "#1B1E25",
            border: "1px solid #2A2D35",
            borderRadius: 12,
            padding: 12,
            marginBottom: 8,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 13.5, fontWeight: 600, color: "#F7F5F1" }}>
              {ex.viewer}
            </span>
            <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 10, color: "#787E8C", display: "flex", alignItems: "center", gap: 3 }}>
              <Clock size={10} /> {ex.time}
            </span>
          </div>
          <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11.5, color: "#9CA3AF", marginBottom: 8 }}>{ex.event}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {ex.fields.map((f) => {
              const meta = FIELD_META[f];
              if (!meta) return null;
              const Icon = meta.icon;
              return (
                <span
                  key={f}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    fontFamily: "Inter, sans-serif",
                    fontSize: 10.5,
                    color: meta.color,
                    background: "rgba(255,255,255,0.04)",
                    border: `1px solid ${meta.color}33`,
                    borderRadius: 999,
                    padding: "3px 8px",
                  }}
                >
                  <Icon size={10} /> {meta.label}
                </span>
              );
            })}
          </div>
        </div>
      ))}
      <div style={{ marginTop: 10, fontFamily: "Inter, sans-serif", fontSize: 10.5, color: "#4A4F5A", textAlign: "center" }}>
        * 데모용 로컬 기록입니다. 실제 서비스는 서버에 자동 기록됩니다.
      </div>
    </div>
  );
}

const SEED_EXCHANGES = [
  { viewer: "박서연", event: "2026 서울 스타트업 서밋", time: "07-20 14:32", fields: ["email", "linkedin"] },
  { viewer: "이도현", event: "2026 서울 스타트업 서밋", time: "07-20 15:10", fields: ["kakao", "instagram", "phone"] },
];

export default function TapCardApp() {
  useFonts();
  const [tab, setTab] = useState("edit");
  const [card, setCard] = useState(DEFAULT_CARD);
  const [exchanges, setExchanges] = useState(SEED_EXCHANGES);
  const [saveStatus, setSaveStatus] = useState("");
  const saveTimer = useRef(null);
  const loaded = useRef(false);

  useEffect(() => {
    (async () => {
      try {
        const savedCard = await window.storage.get("my-card");
        if (savedCard) setCard(JSON.parse(savedCard.value));
      } catch (e) {}
      try {
        const savedEx = await window.storage.get("exchanges");
        if (savedEx) setExchanges(JSON.parse(savedEx.value));
      } catch (e) {}
      loaded.current = true;
    })();
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        await window.storage.set("my-card", JSON.stringify(card));
        setSaveStatus("저장됨");
        setTimeout(() => setSaveStatus(""), 1200);
      } catch (e) {}
    }, 500);
  }, [card]);

  const handleExchange = async (selected) => {
    const fields = Object.keys(selected).filter((k) => selected[k]);
    const entry = {
      viewer: "익명 참석자",
      event: card.event || "미지정 행사",
      time: new Date().toLocaleString("ko-KR", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).replace(/\. /g, "-").replace(".", ""),
      fields,
    };
    const next = [entry, ...exchanges];
    setExchanges(next);
    try {
      await window.storage.set("exchanges", JSON.stringify(next));
    } catch (e) {}
    setTab("history");
  };

  return (
    <div
      style={{
        maxWidth: 400,
        margin: "0 auto",
        background: "#0E1014",
        minHeight: 600,
        borderRadius: 24,
        overflow: "hidden",
        border: "1px solid #2A2D35",
        boxShadow: "0 20px 50px rgba(0,0,0,0.4)",
      }}
    >
      <div style={{ padding: "16px 16px 4px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: 7,
              background: "#E8A33D",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Radio size={14} color="#14161B" strokeWidth={2.6} />
          </div>
          <span style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 15, fontWeight: 700, color: "#F7F5F1", letterSpacing: -0.3 }}>
            TapCard
          </span>
        </div>
        <ChevronRight size={0} />
      </div>

      <div style={{ minHeight: 430 }}>
        {tab === "edit" && <EditScreen card={card} setCard={setCard} saveStatus={saveStatus} />}
        {tab === "share" && <ShareScreen card={card} onExchange={handleExchange} />}
        {tab === "history" && <HistoryScreen exchanges={exchanges} />}
      </div>

      <TabBar active={tab} setActive={setTab} />
    </div>
  );
}
