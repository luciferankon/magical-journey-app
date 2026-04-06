"use client";

import { useEffect, useReducer } from "react";
import { listSaves } from "@/lib/save";
import type { SaveIndexEntry } from "@/lib/save";
import type { PlayerState } from "@/lib/state";
import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import type { OnboardingData } from "@/components/onboarding/OnboardingShell";
import { GameShell } from "@/components/game/GameShell";
import onboardingData from "@/content/onboarding.json";
import uiCopy from "@/content/ui-copy.json";

// ── Phase machine ─────────────────────────────────────────────────────────────

type AppPhase = "booting" | "landing" | "onboarding" | "game";

interface AppState {
  phase: AppPhase;
  autosaveEntry: SaveIndexEntry | null;
  completedState: PlayerState | null;
}

type AppAction =
  | { type: "BOOT_COMPLETE"; autosave: SaveIndexEntry | null }
  | { type: "BEGIN_NEW_GAME" }
  | { type: "CONTINUE_GAME" }
  | { type: "ONBOARDING_COMPLETE"; state: PlayerState };

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "BOOT_COMPLETE":
      return { ...state, phase: "landing", autosaveEntry: action.autosave };
    case "BEGIN_NEW_GAME":
      return { ...state, phase: "onboarding" };
    case "CONTINUE_GAME":
      return { ...state, phase: "game" };
    case "ONBOARDING_COMPLETE":
      return { ...state, phase: "game", completedState: action.state };
    default:
      return state;
  }
}

const initial: AppState = {
  phase: "booting",
  autosaveEntry: null,
  completedState: null,
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const HOUSE_LABELS: Record<string, string> = {
  ignis: "Ignis",
  aqualyn: "Aqualyn",
  terram: "Terram",
  ventus: "Ventus",
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function Home() {
  const [state, dispatch] = useReducer(reducer, initial);

  useEffect(() => {
    const saves = listSaves();
    const autosave = saves.find((s) => s.slotId === "autosave") ?? null;
    dispatch({ type: "BOOT_COMPLETE", autosave });
  }, []);

  if (state.phase === "booting") {
    return (
      <div className="min-h-svh bg-deep flex items-center justify-center">
        <div className="w-2 h-2 rounded-full bg-gold animate-ping" />
      </div>
    );
  }

  if (state.phase === "onboarding") {
    return (
      <OnboardingShell
        data={onboardingData as OnboardingData}
        onComplete={(playerState) =>
          dispatch({ type: "ONBOARDING_COMPLETE", state: playerState })
        }
      />
    );
  }

  if (state.phase === "game") {
    return <GameShell />;
  }

  // ── Landing ──────────────────────────────────────────────────────────────────

  const { autosaveEntry } = state;

  return (
    <div className="min-h-svh bg-deep flex flex-col items-center justify-center px-4 py-16 gap-16">
      {/* Crest + title */}
      <div className="flex flex-col items-center gap-6 text-center">
        {/* SVG crest */}
        <svg
          width="64"
          height="64"
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <circle cx="32" cy="32" r="30" stroke="#C9A84C" strokeWidth="1.5" />
          <text
            x="32"
            y="45"
            textAnchor="middle"
            fontFamily="serif"
            fontSize="32"
            fill="#C9A84C"
          >
            A
          </text>
        </svg>

        <div>
          <h1 className="font-display text-4xl sm:text-5xl text-parchment tracking-wider mb-3">
            {uiCopy.landing.title}
          </h1>
          <p className="font-flavour italic text-muted-blue text-base sm:text-lg max-w-sm">
            {uiCopy.landing.tagline}
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col items-center gap-4 w-full max-w-xs">
        {autosaveEntry && (
          <button
            onClick={() => dispatch({ type: "CONTINUE_GAME" })}
            className="w-full group flex flex-col items-start px-6 py-4 rounded border border-gold/40 bg-card hover:bg-elevated hover:-translate-y-0.5 transition-all duration-200"
          >
            <span className="font-ui text-sm text-gold font-semibold mb-1">
              {uiCopy.landing.continueLabel}
            </span>
            <span className="font-body text-xs text-muted-blue">
              {autosaveEntry.preview.playerName || "Unnamed"}
              {autosaveEntry.preview.house
                ? ` · ${HOUSE_LABELS[autosaveEntry.preview.house] ?? autosaveEntry.preview.house}`
                : ""}
              {` · Chapter ${autosaveEntry.preview.chapter}`}
            </span>
          </button>
        )}

        <button
          onClick={() => dispatch({ type: "BEGIN_NEW_GAME" })}
          className="w-full font-ui text-sm px-8 py-3 rounded bg-gold text-on-gold font-semibold hover:bg-gold-light transition-colors duration-200"
        >
          {autosaveEntry ? uiCopy.landing.newGameLabel : uiCopy.landing.beginLabel}
        </button>
      </div>

      {/* Ambient footer */}
      <p className="font-ui text-[10px] text-slate/40 tracking-widest uppercase">
        {uiCopy.landing.footer}
      </p>
    </div>
  );
}
