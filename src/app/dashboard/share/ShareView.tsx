"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Copy, Check, ExternalLink, QrCode } from "lucide-react";

export default function ShareView({ publicUrl, name }: { publicUrl: string; name: string }) {
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard 접근 실패 시 조용히 무시 (수동 복사는 여전히 가능)
    }
  };

  return (
    <div className="px-4 pt-4 pb-6 text-center">
      <p className="font-body text-[12.5px] text-muted-2 mb-1">
        {name ? `${name}님의 명함` : "내 명함"}
      </p>
      <p className="font-mono text-[10.5px] text-faint mb-5">
        NFC 태그를 탭하거나, 아래 QR을 스캔하면 프로필이 열립니다
      </p>

      <div className="inline-flex flex-col items-center gap-3 p-4 bg-card border border-border rounded-2xl">
        <div className="p-3 bg-[#1B1E25] rounded-xl">
          <QRCodeSVG
            value={publicUrl}
            size={160}
            bgColor="#1B1E25"
            fgColor="#F7F5F1"
            level="M"
          />
        </div>
        <span className="flex items-center gap-1.5 font-body text-[11px] text-muted">
          <QrCode size={12} /> QR 스캔으로 프로필 열기
        </span>
      </div>

      <div className="mt-5 bg-card border border-border rounded-lg px-3 py-2.5 flex items-center gap-2">
        <span className="flex-1 min-w-0 truncate font-mono text-[12px] text-text text-left">
          {publicUrl}
        </span>
        <button
          type="button"
          onClick={copyLink}
          className="shrink-0 flex items-center gap-1 text-[11.5px] font-body font-semibold text-amber cursor-pointer"
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? "복사됨" : "복사"}
        </button>
      </div>

      <a
        href={publicUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 w-full flex items-center justify-center gap-1.5 border border-border rounded-lg py-2.5 font-body text-[12.5px] font-semibold text-muted-2 hover:text-text transition-colors"
      >
        <ExternalLink size={13} /> 내 프로필 미리보기
      </a>
    </div>
  );
}
