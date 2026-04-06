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
  ignis:   "bg-ignis",
  aqualyn: "bg-aqualyn",
  terram:  "bg-terram",
  ventus:  "bg-ventus",
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

  const barClass  = house ? HOUSE_BAR[house] : "bg-gold";

  return (
    <div
      className="w-full bg-panel/90 backdrop-blur-sm border-t border-gold/30 relative"
      onClick={() => { if (!isDone) finishImmediately(); }}
      role="region"
      aria-label="Narrative text"
      aria-live="polite"
    >
      {/* Gold top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gold opacity-60" />

      {/* House-coloured left bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-0.5 ${barClass}`} />

      <div className="px-6 pt-5 pb-4 pl-8">
        {/* Speaker name */}
        {speakerName && (
          <p className="font-display text-xs tracking-[0.2em] uppercase text-gold mb-2">
            {speakerName}
          </p>
        )}

        {/* Prose text */}
        <p className="font-body text-base leading-relaxed text-parchment min-h-[3rem]">
          {displayed}
          {!isDone && (
            <span className="cursor-blink text-gold ml-0.5" aria-hidden="true">
              ▋
            </span>
          )}
        </p>

        {/* Continue chevron */}
        {isDone && !completed && (
          <div className="mt-3 flex justify-end">
            <span className="font-ui text-xs text-muted-blue animate-bounce">▼</span>
          </div>
        )}
      </div>
    </div>
  );
}
