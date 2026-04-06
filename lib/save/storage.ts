/**
 * Save/Load storage layer for Magical Journey.
 *
 * Manages serialization, localStorage I/O, slot lifecycle, and schema migration.
 * All public functions are safe to call in a browser environment; they handle
 * missing localStorage (SSR, private browsing, storage quota exceeded) gracefully.
 *
 * Ownership: save-load-engineer. Never call this from the story engine directly.
 */

import { migrate } from "@/lib/state";
import type { PlayerState, House } from "@/lib/state";
import {
  AUTOSAVE_SLOT_ID,
  MAX_MANUAL_SLOTS,
  SAVE_INDEX_KEY,
  SAVE_SLOT_KEY_PREFIX,
} from "./types";
import type { SaveIndexEntry, SavePreview, SaveSlot } from "./types";

// ── Internal helpers ──────────────────────────────────────────────────────────

/** Returns false in SSR and environments where localStorage is unavailable. */
function isStorageAvailable(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const probe = "__mj_probe__";
    window.localStorage.setItem(probe, "1");
    window.localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

function slotKey(slotId: string): string {
  return `${SAVE_SLOT_KEY_PREFIX}${slotId}`;
}

/** Build a SavePreview from a PlayerState for the lightweight index. */
function buildPreview(state: PlayerState): SavePreview {
  return {
    playerName: state.identity.name,
    house: state.identity.house as House | null,
    chapter: state.progress.chapter,
    currentNodeId: state.progress.currentNodeId,
  };
}

// ── Index management ──────────────────────────────────────────────────────────

/**
 * Read the save index from localStorage.
 * Returns an empty array if the index is missing, corrupt, or storage unavailable.
 */
function readIndex(): SaveIndexEntry[] {
  if (!isStorageAvailable()) return [];
  try {
    const raw = window.localStorage.getItem(SAVE_INDEX_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      console.warn("[save] Index is not an array — resetting index.");
      return [];
    }
    return parsed as SaveIndexEntry[];
  } catch (err) {
    console.warn("[save] Failed to read save index:", err);
    return [];
  }
}

/**
 * Write the save index to localStorage.
 * Silently fails if storage is unavailable or quota is exceeded (logs warning).
 */
function writeIndex(entries: SaveIndexEntry[]): void {
  if (!isStorageAvailable()) return;
  try {
    window.localStorage.setItem(SAVE_INDEX_KEY, JSON.stringify(entries));
  } catch (err) {
    console.warn("[save] Failed to write save index:", err);
  }
}

/**
 * Upsert a single entry in the index by slotId.
 * Appends if not present; replaces in-place if already present.
 */
function upsertIndexEntry(entry: SaveIndexEntry): void {
  const entries = readIndex();
  const existing = entries.findIndex((e) => e.slotId === entry.slotId);
  if (existing >= 0) {
    entries[existing] = entry;
  } else {
    entries.push(entry);
  }
  writeIndex(entries);
}

/** Remove an entry from the index by slotId. No-op if not present. */
function removeIndexEntry(slotId: string): void {
  const entries = readIndex().filter((e) => e.slotId !== slotId);
  writeIndex(entries);
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * List all save slots — lightweight metadata only, no full PlayerState.
 * Sorted by savedAt descending (most-recent first).
 * Returns an empty array if storage is unavailable.
 */
export function listSaves(): SaveIndexEntry[] {
  return readIndex().sort(
    (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
  );
}

/**
 * Returns true if a save slot with the given slotId exists in the index.
 */
export function hasSave(slotId: string): boolean {
  return readIndex().some((e) => e.slotId === slotId);
}

/**
 * Write a PlayerState to a named slot.
 *
 * @param slotId  - Slot identifier (e.g. "slot_1", "slot_2").
 *                  Use AUTOSAVE_SLOT_ID for the auto-save slot.
 * @param state   - The current PlayerState to persist.
 * @param label   - Human-readable label for the slot. Defaults to "Save {slotId}".
 *
 * @throws Does NOT throw — logs warnings on failure instead. Callers do not need
 *         try/catch.
 */
export function saveToSlot(
  slotId: string,
  state: PlayerState,
  label?: string
): void {
  if (!isStorageAvailable()) {
    console.warn("[save] localStorage unavailable — save skipped.");
    return;
  }

  const savedAt = new Date().toISOString();
  const resolvedLabel = label ?? `Save ${slotId}`;

  const slot: SaveSlot = {
    slotId,
    label: resolvedLabel,
    savedAt,
    state,
  };

  const indexEntry: SaveIndexEntry = {
    slotId,
    label: resolvedLabel,
    savedAt,
    schemaVersion: state.meta.schemaVersion,
    preview: buildPreview(state),
  };

  try {
    window.localStorage.setItem(slotKey(slotId), JSON.stringify(slot));
  } catch (err) {
    console.warn(`[save] Failed to write slot "${slotId}":`, err);
    return;
  }

  upsertIndexEntry(indexEntry);
}

/**
 * Load a PlayerState from a named slot, running schema migration as needed.
 *
 * @param slotId - The slot identifier to load.
 * @returns A valid, migrated PlayerState, or null if:
 *          - The slot does not exist
 *          - The stored data is irrecoverably corrupt
 *          - Storage is unavailable
 *
 * The returned state is always safe to pass directly to the engine.
 */
export function loadFromSlot(slotId: string): PlayerState | null {
  if (!isStorageAvailable()) {
    console.warn("[save] localStorage unavailable — load skipped.");
    return null;
  }

  let raw: string | null;
  try {
    raw = window.localStorage.getItem(slotKey(slotId));
  } catch (err) {
    console.warn(`[save] Failed to read slot "${slotId}":`, err);
    return null;
  }

  if (!raw) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    console.warn(
      `[save] Slot "${slotId}" contains invalid JSON — treating as corrupt.`
    );
    return null;
  }

  if (
    !parsed ||
    typeof parsed !== "object" ||
    !("state" in (parsed as Record<string, unknown>))
  ) {
    console.warn(
      `[save] Slot "${slotId}" is missing 'state' field — treating as corrupt.`
    );
    return null;
  }

  const rawState = (parsed as Record<string, unknown>).state;

  // migrate() handles: missing fields, old schema versions, future versions, null.
  const migrated = migrate(rawState);
  return migrated;
}

/**
 * Delete a save slot and remove it from the index.
 * No-op if the slot does not exist.
 */
export function deleteSlot(slotId: string): void {
  if (!isStorageAvailable()) return;
  try {
    window.localStorage.removeItem(slotKey(slotId));
  } catch (err) {
    console.warn(`[save] Failed to delete slot "${slotId}":`, err);
  }
  removeIndexEntry(slotId);
}

/**
 * Write the current state to the reserved autosave slot.
 *
 * Call this after every choice resolution so the player can always resume
 * from their last action without explicitly saving.
 */
export function autosave(state: PlayerState): void {
  saveToSlot(AUTOSAVE_SLOT_ID, state, "Auto Save");
}

/**
 * Load the autosave slot.
 * Returns null if no autosave exists or storage is unavailable.
 */
export function loadAutosave(): PlayerState | null {
  return loadFromSlot(AUTOSAVE_SLOT_ID);
}

/**
 * Return the next available manual slot ID, or null if all slots are full.
 *
 * Slot IDs are "slot_1" through "slot_{MAX_MANUAL_SLOTS}".
 * The autosave slot is excluded from this count.
 */
export function nextAvailableSlot(): string | null {
  const used = new Set(
    readIndex()
      .map((e) => e.slotId)
      .filter((id) => id !== AUTOSAVE_SLOT_ID)
  );

  for (let i = 1; i <= MAX_MANUAL_SLOTS; i++) {
    const id = `slot_${i}`;
    if (!used.has(id)) return id;
  }
  return null;
}
