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

const FALLBACK_CHAR_DELAY_MS = 55; // used only when TTS is unavailable / muted

const HOUSE_BAR: Record<House, string> = {
  ignis:   "#C94C2A",
  aqualyn: "#2A7A8C",
  terram:  "#4A7A2A",
  ventus:  "#4A5A8C",
};

// ── TTS fetch ─────────────────────────────────────────────────────────────────

interface TTSResult {
  audio: HTMLAudioElement;
  charTimes: number[]; // charTimes[i] = seconds when character i is spoken
  blobUrl: string;
}

async function fetchTTS(text: string, signal: AbortSignal): Promise<TTSResult | null> {
  try {
    const res = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
      signal,
    });
    if (!res.ok) return null;
    const { audioBase64, charTimes } = await res.json();
    if (!audioBase64) return null;

    // Decode base64 → Blob → Object URL
    const bytes = Uint8Array.from(atob(audioBase64), (c) => c.charCodeAt(0));
    const blob = new Blob([bytes], { type: "audio/mpeg" });
    const blobUrl = URL.createObjectURL(blob);
    const audio = new Audio(blobUrl);
    audio.volume = 0.85;
    return { audio, charTimes: charTimes ?? [], blobUrl };
  } catch {
    return null;
  }
}

// Binary search: find the index of the last charTime <= currentTime
// = how many characters have started being spoken so far
function charIndexAtTime(charTimes: number[], currentTime: number): number {
  let lo = 0, hi = charTimes.length - 1, result = 0;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (charTimes[mid] <= currentTime) { result = mid + 1; lo = mid + 1; }
    else hi = mid - 1;
  }
  return result;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function DialogueBox({
  text,
  speakerName,
  house,
  onComplete,
  completed,
}: DialogueBoxProps) {
  const [displayed,      setDisplayed]      = useState("");
  const [isDone,         setIsDone]         = useState(false);
  const [muted,          setMuted]          = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);

  const scrollRef     = useRef<HTMLDivElement>(null);
  const audioRef      = useRef<HTMLAudioElement | null>(null);
  const blobUrlRef    = useRef<string | null>(null);
  const abortRef      = useRef<AbortController | null>(null);
  const rafRef        = useRef<number | null>(null);
  const intervalRef   = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevIdxRef    = useRef(0);
  // Tracks which typewriter mechanism is active — prevents both running simultaneously
  const mechanismRef  = useRef<"none" | "raf" | "interval">("none");

  // ── Helpers ───────────────────────────────────────────────────────────────

  const stopAll = useCallback(() => {
    mechanismRef.current = "none";
    if (rafRef.current)      { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    if (intervalRef.current) { clearInterval(intervalRef.current);   intervalRef.current = null; }
    if (abortRef.current)    { abortRef.current.abort();             abortRef.current = null; }
    if (audioRef.current)    { audioRef.current.pause(); audioRef.current.src = ""; audioRef.current = null; }
    if (blobUrlRef.current)  { URL.revokeObjectURL(blobUrlRef.current); blobUrlRef.current = null; }
  }, []);

  const finishImmediately = useCallback(() => {
    stopAll();
    setDisplayed(text);
    setIsDone(true);
    onComplete();
  }, [text, onComplete, stopAll]);

  // Fallback interval typewriter (muted / no TTS / TTS failed)
  // Guard: if rAF is already running, do nothing — prevents double-typewriter
  const startFallbackTypewriter = useCallback(() => {
    if (mechanismRef.current === "raf") return; // rAF already owns the typewriter
    mechanismRef.current = "interval";
    // Clear any stale interval before starting fresh
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    let idx = 0;
    intervalRef.current = setInterval(() => {
      idx++;
      setDisplayed(text.slice(0, idx));
      if (idx >= text.length) {
        clearInterval(intervalRef.current!);
        intervalRef.current = null;
        setIsDone(true);
        onComplete();
      }
    }, FALLBACK_CHAR_DELAY_MS);
  }, [text, onComplete]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [displayed]);

  // ── Main effect ───────────────────────────────────────────────────────────

  useEffect(() => {
    stopAll();
    setDisplayed("");
    setIsDone(false);
    setIsLoadingAudio(false);
    prevIdxRef.current = 0;

    if (completed) { setDisplayed(text); setIsDone(true); return; }
    if (muted)     { startFallbackTypewriter(); return; }

    const controller = new AbortController();
    abortRef.current = controller;
    setIsLoadingAudio(true);

    fetchTTS(text, controller.signal).then((result) => {
      setIsLoadingAudio(false);
      if (!result || controller.signal.aborted) {
        startFallbackTypewriter();
        return;
      }

      const { audio, charTimes, blobUrl } = result;
      audioRef.current = audio;
      blobUrlRef.current = blobUrl;

      if (charTimes.length > 0) {
        // ── Timestamp-driven typewriter ──────────────────────────────────
        // Each rAF tick: binary-search charTimes to find how many characters
        // have been spoken so far — no fixed speed, no averaging, perfect sync
        // including pauses at commas and natural speech variation.
        const tick = () => {
          const a = audioRef.current;
          if (!a) return;

          const raw = charIndexAtTime(charTimes, a.currentTime);
          const idx = Math.max(prevIdxRef.current, raw); // forward-only

          if (idx !== prevIdxRef.current) {
            prevIdxRef.current = idx;
            setDisplayed(text.slice(0, idx));
          }

          if (idx >= text.length) {
            mechanismRef.current = "none";
            setIsDone(true);
            onComplete();
            rafRef.current = null;
            return;
          }
          rafRef.current = requestAnimationFrame(tick);
        };

        audio.addEventListener("playing", () => {
          // Claim the typewriter for rAF — kill any interval that snuck in
          mechanismRef.current = "raf";
          if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
          rafRef.current = requestAnimationFrame(tick);
        }, { once: true });

      } else {
        // No timestamps returned — fall back to plain interval typewriter
        audio.addEventListener("playing", () => {
          startFallbackTypewriter();
        }, { once: true });
      }

      // Safety net: audio ends → snap remaining text
      audio.addEventListener("ended", () => {
        mechanismRef.current = "none";
        if (rafRef.current)      { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
        if (intervalRef.current) { clearInterval(intervalRef.current);   intervalRef.current = null; }
        URL.revokeObjectURL(blobUrl);
        blobUrlRef.current = null;
        setDisplayed(text);
        setIsDone(true);
        onComplete();
      }, { once: true });

      // If play() is rejected, only start fallback if neither mechanism has claimed the typewriter yet
      audio.play().catch(() => {
        if (mechanismRef.current === "none") startFallbackTypewriter();
      });
    });

    return () => { /* stopAll at top of next run */ };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.muted = muted;
  }, [muted]);

  useEffect(() => () => stopAll(), [stopAll]);

  const barColor = house ? HOUSE_BAR[house] : "#C9A84C";

  return (
    <div
      className="w-full backdrop-blur-sm border-t border-l-4 relative select-none"
      style={{
        backgroundColor: "rgba(8, 4, 12, 0.90)",
        borderTopColor:  "rgba(120, 60, 180, 0.4)",
        borderLeftColor: barColor,
      }}
      onClick={() => { if (!isDone) finishImmediately(); }}
      role="region"
      aria-label="Narrative text"
      aria-live="polite"
    >
      <div className="px-6 pt-4 pb-3">

        <div className="flex items-center justify-between mb-2">
          <p
            className="font-display text-xs tracking-[0.2em] uppercase font-bold"
            style={{ color: speakerName ? barColor : "transparent" }}
          >
            {speakerName ?? "·"}
          </p>
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            {isLoadingAudio && !muted && (
              <span className="text-xs animate-pulse" style={{ color: "rgba(200,160,80,0.55)" }}>♪</span>
            )}
            <button
              onClick={() => setMuted((m) => !m)}
              className="text-xs px-2 py-0.5 rounded opacity-50 hover:opacity-90 transition-opacity"
              style={{
                color:       muted ? "rgba(140,140,140,0.7)" : "rgba(200,160,80,0.9)",
                border:      "1px solid",
                borderColor: muted ? "rgba(140,140,140,0.25)" : "rgba(200,160,80,0.3)",
                fontSize:    "11px",
              }}
              aria-label={muted ? "Unmute narration" : "Mute narration"}
            >
              {muted ? "🔇" : "🔊"}
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="overflow-y-auto pr-1"
          style={{ height: "6.5rem", scrollbarWidth: "thin", scrollbarColor: "rgba(120,60,180,0.35) transparent" }}
        >
          <p
            className={`font-body text-sm leading-relaxed ${!isDone ? "typing-active" : ""}`}
            style={{ color: "#e8dcc8" }}
          >
            {displayed}
          </p>
        </div>

        {isDone && !completed && (
          <div className="mt-2 flex justify-end">
            <span className="font-ui text-xs animate-pulse" style={{ color: "rgba(120,60,180,0.75)" }}>
              ▶ click to continue
            </span>
          </div>
        )}

      </div>
    </div>
  );
}
