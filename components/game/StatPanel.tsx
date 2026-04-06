"use client";

import type { PlayerState } from "@/lib/state";
import { TraitBar } from "./TraitBar";
import { RelationshipBar } from "./RelationshipBar";

interface StatPanelProps {
  state: PlayerState;
  open: boolean;
  onClose: () => void;
}

const TRAIT_KEYS = ["courage", "cunning", "empathy", "ambition", "wisdom"] as const;
const RELATIONSHIP_KEYS = [
  "sera_trust",
  "caden_rivalry",
  "aldric_regard",
  "lira_influence",
  "tomas_bond",
  "solis_standing",
  "ines_contact",
] as const;

export function StatPanel({ state, open, onClose }: StatPanelProps) {
  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-20 bg-deep/40"
          aria-hidden="true"
          onClick={onClose}
        />
      )}

      {/* Slide-in panel */}
      <aside
        className={`fixed right-0 top-0 bottom-0 z-20 w-60 bg-panel border-l border-border-subtle
          flex flex-col overflow-y-auto transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "translate-x-full"}`}
        aria-label="Character stats"
        aria-hidden={!open}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle">
          <h2 className="font-display text-sm tracking-wider text-gold">Character</h2>
          <button
            onClick={onClose}
            aria-label="Close stats panel"
            className="text-muted-blue hover:text-parchment transition-colors text-lg leading-none"
          >
            ×
          </button>
        </div>

        {/* Identity */}
        <div className="px-4 pt-4 pb-3 border-b border-border-subtle">
          <p className="font-body text-sm text-parchment truncate">
            {state.identity.name || <span className="text-slate italic">Unnamed</span>}
          </p>
          {state.identity.background && (
            <p className="font-ui text-xs text-muted-blue capitalize mt-0.5">
              {state.identity.background}
            </p>
          )}
        </div>

        {/* Traits */}
        <section className="px-4 py-4 border-b border-border-subtle">
          <h3 className="font-ui text-xs tracking-widest text-slate uppercase mb-3">
            Traits
          </h3>
          <div className="flex flex-col gap-3">
            {TRAIT_KEYS.map((key) => (
              <TraitBar
                key={key}
                label={key}
                value={state.traits[key]}
                house={state.identity.house}
              />
            ))}
          </div>
        </section>

        {/* Relationships */}
        <section className="px-4 py-4">
          <h3 className="font-ui text-xs tracking-widest text-slate uppercase mb-3">
            Relationships
          </h3>
          <div className="flex flex-col gap-3">
            {RELATIONSHIP_KEYS.map((key) => (
              <RelationshipBar
                key={key}
                npcKey={key}
                value={state.relationships[key]}
              />
            ))}
          </div>
        </section>
      </aside>
    </>
  );
}
