"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { X, Radio, ListChecks, Sparkles, BellRing, ArrowRight, type LucideIcon } from "lucide-react";

interface Slide {
  icon: LucideIcon;
  title: string;
  description: string;
}

const SLIDES: Slide[] = [
  {
    icon: Radio,
    title: "Tap or scan",
    description:
      "Someone taps their phone on your NFC tag, or scans your QR code. Your profile opens right in their browser — no app to install.",
  },
  {
    icon: ListChecks,
    title: "They choose what to save",
    description:
      "Only the channels you've made public show up. They pick exactly which ones to keep, then save.",
  },
  {
    icon: Sparkles,
    title: "Saved with context",
    description:
      "Your photo and the event you're at get embedded right into the contact they save — so they remember where you met.",
  },
  {
    icon: BellRing,
    title: "See who saved your card",
    description:
      "A live notification lands on your dashboard the moment someone saves you, plus a running history you can look back on.",
  },
];

export default function HowItWorksCarousel({ loggedIn }: { loggedIn: boolean }) {
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const isLast = index === SLIDES.length - 1;

  const goNext = () => setIndex((i) => Math.min(i + 1, SLIDES.length - 1));
  const goBack = () => setIndex((i) => Math.max(i - 1, 0));

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (delta < -50) goNext();
    else if (delta > 50) goBack();
  };

  const slide = SLIDES[index];
  const Icon = slide.icon;

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-bg sm:px-4 sm:py-8">
      <div
        className="relative w-full sm:max-w-[420px] min-h-screen sm:min-h-[640px] bg-bg sm:border sm:border-border sm:rounded-[24px] sm:shadow-[0_20px_50px_rgba(0,0,0,0.4)] overflow-hidden flex flex-col"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div className="flex items-center gap-1.5 px-4 pt-4 shrink-0">
          {SLIDES.map((_, i) => (
            <div key={i} className="flex-1 h-[3px] rounded-full bg-border overflow-hidden">
              <div
                className="h-full bg-amber transition-all"
                style={{ width: i < index ? "100%" : i === index ? "100%" : "0%" }}
              />
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between px-4 pt-3 pb-1 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-[26px] h-[26px] rounded-[7px] bg-amber flex items-center justify-center">
              <Radio size={14} color="#14161B" strokeWidth={2.6} />
            </div>
            <span className="font-heading text-[15px] font-bold text-text tracking-tight">TapMe</span>
          </div>
          <Link href="/" aria-label="Close" className="text-muted hover:text-text">
            <X size={20} />
          </Link>
        </div>

        <button
          type="button"
          onClick={goBack}
          aria-label="Previous"
          className="absolute left-0 top-[70px] bottom-24 w-1/4 z-10"
        />
        <button
          type="button"
          onClick={goNext}
          aria-label="Next"
          className="absolute right-0 top-[70px] bottom-24 w-1/4 z-10"
        />

        <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
          <span className="font-mono text-[11px] text-faint mb-4">
            {index + 1} / {SLIDES.length}
          </span>
          <div className="w-16 h-16 rounded-2xl bg-amber/10 border border-amber/30 flex items-center justify-center mb-6">
            <Icon size={28} className="text-amber" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-text mb-3">{slide.title}</h1>
          <p className="font-body text-[14px] text-muted-2 leading-relaxed">{slide.description}</p>
        </div>

        <div className="p-4 shrink-0">
          {isLast ? (
            <Link
              href={loggedIn ? "/dashboard/edit" : "/login"}
              className="flex items-center justify-center gap-2 w-full bg-amber text-bg font-body text-[14px] font-bold rounded-xl py-3.5"
            >
              {loggedIn ? "Go to my dashboard" : "Get started"} <ArrowRight size={16} />
            </Link>
          ) : (
            <button
              type="button"
              onClick={goNext}
              className="flex items-center justify-center gap-2 w-full border border-border text-text font-body text-[14px] font-semibold rounded-xl py-3.5 cursor-pointer"
            >
              Next <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
