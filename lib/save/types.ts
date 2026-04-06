/**
 * Save/Load types for Magical Journey.
 *
 * Ownership: save-load-engineer. Do not import this from engine or UI directly;
 * use @/lib/save (the public index).
 */

import type { House, PlayerState } from "@/lib/state";

// ── Storage key constants ─────────────────────────────────────────────────────

/** localStorage key that stores the lightweight save index (no full state). */
export const SAVE_INDEX_KEY = "mj_save_index";

/** Prefix for per-slot localStorage keys. Full key: `mj_save_{slotId}`. */
export const SAVE_SLOT_KEY_PREFIX = "mj_save_slot_";

/** Reserved slot ID for the automatic save written after every choice. */
export const AUTOSAVE_SLOT_ID = "autosave";

/** Maximum number of manual save slots (excludes autosave). */
export const MAX_MANUAL_SLOTS = 5;

// ── Preview ───────────────────────────────────────────────────────────────────

/**
 * Denormalized preview fields stored in the index.
 * Allows the UI to render a save-slot list without deserializing full state.
 */
export interface SavePreview {
  /** Character name at save time. Empty string if onboarding not yet complete. */
  playerName: string;
  /** House at save time. Null if sorting ceremony has not run. */
  house: House | null;
  /** Chapter number at save time. */
  chapter: number;
  /** Node ID the player was on when the save was created. */
  currentNodeId: string;
}

// ── Index entry ───────────────────────────────────────────────────────────────

/**
 * Lightweight metadata stored in the index (SAVE_INDEX_KEY).
 * Does NOT include the full PlayerState — load that separately via loadFromSlot().
 */
export interface SaveIndexEntry {
  /** Stable identifier for this slot. E.g. "slot_1", "autosave". */
  slotId: string;
  /** Human-readable label shown in the save-slot UI. */
  label: string;
  /** ISO 8601 timestamp of when this slot was last written. */
  savedAt: string;
  /** Schema version of the stored save (for UI diagnostics). */
  schemaVersion: number;
  /** Denormalized preview for listing without loading full state. */
  preview: SavePreview;
}

// ── Full slot ─────────────────────────────────────────────────────────────────

/**
 * The full save document written to `SAVE_SLOT_KEY_PREFIX + slotId`.
 * Contains everything needed to fully restore a playthrough.
 */
export interface SaveSlot {
  /** Mirrors SaveIndexEntry.slotId. Stored here for self-describing reads. */
  slotId: string;
  /** Mirrors SaveIndexEntry.label. */
  label: string;
  /** ISO 8601 timestamp of when this slot was written. */
  savedAt: string;
  /** Snapshot of the player state at save time. Loaded via migrate() on read. */
  state: PlayerState;
}
