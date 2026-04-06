"use client";

import { useEffect, useState } from "react";
import type { House } from "@/lib/state";

interface ChapterTitleCardProps {
  chapter: number;
  title: string;
  house: House | null;
  onComplete: () => void;
}

const HOUSE_GLOW: Record<House, string> = {
  ignis:   "text-ignis-glow",
  aqualyn: "text-aqualyn-glow",
  terram:  "text-terram-glow",
  ventus:  "text-ventus-glow",
};

// Phase timings (ms): fade in 800 → hold 2000 → fade out 600
const FADE_IN  = 800;
const HOLD     = 2000;
const FADE_OUT = 600;

export function ChapterTitleCard({
  chapter,
  title,
  house,
  onComplete,
}: ChapterTitleCardProps) {
  const [phase, setPhase] = useState<"in" | "hold" | "out">("in");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("hold"), FADE_IN);
    const t2 = setTimeout(() => setPhase("out"),  FADE_IN + HOLD);
    const t3 = setTimeout(onComplete,              FADE_IN + HOLD + FADE_OUT);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete]);

  const glowClass = house ? HOUSE_GLOW[house] : "text-gold";

  const opacityClass =
    phase === "in"   ? "anim-fade-in"  :
    phase === "out"  ? "anim-fade-out" :
    "opacity-100";

  return (
    <div
      className={`fixed inset-0 bg-deep flex flex-col items-center justify-center z-40 ${opacityClass}`}
    >
      {/* Decorative top rule */}
      <div className="flex items-center gap-4 mb-8">
        <div className="h-px w-24 bg-gold opacity-40" />
        <span className={`font-display text-xs tracking-[0.4em] uppercase ${glowClass}`}>
          Chapter {chapter}
        </span>
        <div className="h-px w-24 bg-gold opacity-40" />
      </div>

      {/* Chapter title */}
      <h1 className="font-display text-4xl md:text-5xl text-parchment text-center px-8 max-w-2xl leading-tight">
        {title}
      </h1>

      {/* Bottom rule */}
      <div className="mt-8 flex items-center gap-4">
        <div className="h-px w-16 bg-gold opacity-40" />
        <div className={`w-2 h-2 rounded-full ${glowClass} opacity-60`} style={{ background: "currentColor" }} />
        <div className="h-px w-16 bg-gold opacity-40" />
      </div>
    </div>
  );
}
