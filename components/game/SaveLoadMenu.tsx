"use client";

import { useEffect, useState } from "react";
import {
  listSaves,
  saveToSlot,
  loadFromSlot,
  deleteSlot,
  nextAvailableSlot,
  MAX_MANUAL_SLOTS,
} from "@/lib/save";
import type { SaveIndexEntry } from "@/lib/save";
import type { PlayerState } from "@/lib/state";

interface SaveLoadMenuProps {
  currentState: PlayerState;
  onLoad: (state: PlayerState) => void;
  onClose: () => void;
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

function SlotRow({
  entry,
  onLoad,
  onDelete,
}: {
  entry: SaveIndexEntry;
  onLoad: () => void;
  onDelete: () => void;
}) {
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded bg-card border border-border-subtle hover:border-gold/30 transition-colors">
      <div className="flex-1 min-w-0">
        <p className="font-ui text-sm text-parchment truncate">{entry.label}</p>
        <p className="font-ui text-xs text-muted-blue mt-0.5">
          {entry.preview.playerName || "Newcomer"} ·{" "}
          {entry.preview.house
            ? entry.preview.house.charAt(0).toUpperCase() + entry.preview.house.slice(1)
            : "Unsorted"}{" "}
          · Ch {entry.preview.chapter}
        </p>
        <p className="font-ui text-xs text-slate mt-0.5">{formatDate(entry.savedAt)}</p>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={onLoad}
          className="font-ui text-xs px-3 py-1.5 rounded border border-gold text-gold hover:bg-gold hover:text-on-gold transition-colors"
        >
          Load
        </button>
        {confirming ? (
          <>
            <button
              onClick={onDelete}
              className="font-ui text-xs px-3 py-1.5 rounded bg-danger text-parchment hover:bg-danger/80 transition-colors"
            >
              Confirm
            </button>
            <button
              onClick={() => setConfirming(false)}
              className="font-ui text-xs px-3 py-1.5 rounded border border-border-subtle text-muted-blue hover:text-parchment transition-colors"
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            onClick={() => setConfirming(true)}
            aria-label="Delete save"
            className="font-ui text-xs px-2 py-1.5 rounded border border-border-subtle text-slate hover:text-danger hover:border-danger transition-colors"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}

function EmptySlot({ slotId, onSave }: { slotId: string; onSave: (id: string) => void }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded border border-dashed border-border-subtle">
      <div className="flex-1">
        <p className="font-ui text-sm text-slate italic">Empty slot</p>
      </div>
      <button
        onClick={() => onSave(slotId)}
        className="font-ui text-xs px-3 py-1.5 rounded bg-gold text-on-gold hover:bg-gold-light transition-colors"
      >
        Save here
      </button>
    </div>
  );
}

export function SaveLoadMenu({ currentState, onLoad, onClose }: SaveLoadMenuProps) {
  const [saves, setSaves] = useState<SaveIndexEntry[]>([]);

  function refresh() {
    setSaves(listSaves().filter((e) => e.slotId !== "autosave"));
  }

  useEffect(() => { refresh(); }, []);

  function handleSave(slotId: string) {
    const name = currentState.identity.name || "Newcomer";
    const ch   = currentState.progress.chapter;
    saveToSlot(slotId, currentState, `${name} — Ch ${ch}`);
    refresh();
  }

  function handleLoad(slotId: string) {
    const state = loadFromSlot(slotId);
    if (state) { onLoad(state); onClose(); }
  }

  function handleDelete(slotId: string) {
    deleteSlot(slotId);
    refresh();
  }

  // Build ordered slot list: fill used slots, append empty up to MAX_MANUAL_SLOTS
  const usedIds = new Set(saves.map((s) => s.slotId));
  const allSlotIds = Array.from({ length: MAX_MANUAL_SLOTS }, (_, i) => `slot_${i + 1}`);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-deep/70 backdrop-blur-sm"
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-label="Save / Load"
      >
        <div className="w-full max-w-lg bg-panel rounded border border-border-subtle shadow-2xl flex flex-col max-h-[80vh]">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle">
            <h2 className="font-display text-base tracking-wider text-gold">
              Save / Load
            </h2>
            <button
              onClick={onClose}
              aria-label="Close"
              className="text-muted-blue hover:text-parchment transition-colors text-xl leading-none"
            >
              ×
            </button>
          </div>

          {/* Slot list */}
          <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-2">
            {allSlotIds.map((slotId) =>
              usedIds.has(slotId) ? (
                <SlotRow
                  key={slotId}
                  entry={saves.find((s) => s.slotId === slotId)!}
                  onLoad={() => handleLoad(slotId)}
                  onDelete={() => handleDelete(slotId)}
                />
              ) : (
                <EmptySlot
                  key={slotId}
                  slotId={slotId}
                  onSave={handleSave}
                />
              )
            )}
          </div>

          {/* Quick-save to next available */}
          <div className="px-5 py-4 border-t border-border-subtle">
            <button
              onClick={() => {
                const slot = nextAvailableSlot();
                if (slot) handleSave(slot);
              }}
              disabled={nextAvailableSlot() === null}
              className="w-full font-ui text-sm py-2.5 rounded bg-gold text-on-gold font-semibold hover:bg-gold-light disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Save to new slot
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
