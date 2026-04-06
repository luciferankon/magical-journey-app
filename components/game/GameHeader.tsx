"use client";

import type { House } from "@/lib/state";

interface GameHeaderProps {
  playerName: string;
  house: House | null;
  chapter: number;
  onSaveLoad: () => void;
  onToggleStats: () => void;
  statsOpen: boolean;
}

const HOUSE_BADGE: Record<House, { label: string; classes: string }> = {
  ignis:   { label: "Ignis",   classes: "bg-ignis-deep   text-ignis-text   border-ignis"   },
  aqualyn: { label: "Aqualyn", classes: "bg-aqualyn-deep text-aqualyn-text border-aqualyn" },
  terram:  { label: "Terram",  classes: "bg-terram-deep  text-terram-text  border-terram"  },
  ventus:  { label: "Ventus",  classes: "bg-ventus-deep  text-ventus-text  border-ventus"  },
};

export function GameHeader({
  playerName,
  house,
  chapter,
  onSaveLoad,
  onToggleStats,
  statsOpen,
}: GameHeaderProps) {
  const badge = house ? HOUSE_BADGE[house] : null;

  return (
    <header className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-2 bg-panel/80 backdrop-blur-sm border-b border-border-subtle">
      {/* Left: name + house badge */}
      <div className="flex items-center gap-3">
        <span className="font-ui text-sm text-parchment truncate max-w-[140px]">
          {playerName || "Newcomer"}
        </span>
        {badge && (
          <span
            className={`font-ui text-xs px-2 py-0.5 rounded border ${badge.classes}`}
          >
            {badge.label}
          </span>
        )}
      </div>

      {/* Centre: chapter */}
      <span className="font-display text-xs tracking-widest text-muted-blue uppercase">
        Chapter {chapter}
      </span>

      {/* Right: actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleStats}
          aria-label={statsOpen ? "Close stats" : "Open stats"}
          aria-pressed={statsOpen}
          className="font-ui text-xs px-3 py-1.5 rounded border border-border-subtle text-muted-blue hover:border-gold hover:text-gold transition-colors"
        >
          Stats
        </button>
        <button
          onClick={onSaveLoad}
          aria-label="Save / Load"
          className="font-ui text-xs px-3 py-1.5 rounded bg-gold text-on-gold font-semibold hover:bg-gold-light transition-colors"
        >
          Save
        </button>
      </div>
    </header>
  );
}
