"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { House } from "@/lib/state";

interface DialogueBoxProps {
  text: string;
  speakerName?: string;
  house: House | null;
  onComplete: () => void;
  completed: boolean;
}

const CHAR_DELAY_MS = 18;

const HOUSE_BAR: Record<House, string> = {
  ignis:   "#C94C2A",
  aqualyn: "#2A7A8C",
  terram:  "#4A7A2A",
  ventus:  "#4A5A8C",
};

const HOUSE_TEXT: Record<House, string> = {
  ignis:   "#FFD4B8",
  aqualyn: "#B8F0F8",
  terram:  "#D4F0B8",
  ventus:  "#D8DEF8",
};

export function DialogueBox({
  text,
  speakerName,
  house,
  onComplete,
  completed,
}: DialogueBoxProps) {
  const [displayed, setDisplayed]   = useState("");
  const [isDone, setIsDone]         = useState(false);
  const intervalRef                 = useRef<ReturnType<typeof setInterval> | null>(null);
  const indexRef                    = useRef(0);

  const finishImmediately = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setDisplayed(text);
    setIsDone(true);
    onComplete();
  }, [text, onComplete]);

  // Reset and replay when text changes
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setDisplayed("");
    setIsDone(false);
    indexRef.current = 0;

    // If already marked complete externally, show instantly
    if (completed) {
      setDisplayed(text);
      setIsDone(true);
      return;
    }

    intervalRef.current = setInterval(() => {
      indexRef.current += 1;
      setDisplayed(text.slice(0, indexRef.current));
      if (indexRef.current >= text.length) {
        clearInterval(intervalRef.current!);
        setIsDone(true);
        onComplete();
      }
    }, CHAR_DELAY_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  const barColor = house ? HOUSE_BAR[house] : "#C9A84C";
  const textColor = house ? HOUSE_TEXT[house] : "#D4F0B8";

  return (
    <div
      className="w-full backdrop-blur-sm border-t border-l-4 relative"
      style={{
        backgroundColor: 'rgba(8, 4, 12, 0.88)',
        borderTopColor: 'rgba(120, 60, 180, 0.4)',
        borderLeftColor: barColor,
      }}
      onClick={() => { if (!isDone) finishImmediately(); }}
      role="region"
      aria-label="Narrative text"
      aria-live="polite"
    >
      <div className="px-6 pt-5 pb-4">
        {/* Speaker name in house color */}
        {speakerName && (
          <p
            className="font-display text-xs tracking-[0.2em] uppercase mb-2 font-bold"
            style={{ color: barColor }}
          >
            {speakerName}
          </p>
        )}

        {/* Prose text - warm parchment color */}
        <p className="font-body text-sm leading-relaxed min-h-[3rem]" style={{ color: '#e8dcc8' }}>
          {displayed}
          {!isDone && (
            <span className="cursor-blink ml-0.5" aria-hidden="true" style={{ color: '#C9A84C' }}>
              ▋
            </span>
          )}
        </p>

        {/* Continue indicator - pulsing arrow */}
        {isDone && !completed && (
          <div className="mt-3 flex justify-end">
            <span className="font-ui text-xs animate-pulse" style={{ color: 'rgba(120, 60, 180, 0.6)' }}>
              ▶
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
