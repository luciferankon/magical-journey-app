/**
 * Public API for the save/load module.
 *
 * Import from "@/lib/save" — do not import from sub-modules directly.
 *
 * Engine integration pattern:
 *   import { autosave, loadAutosave, loadFromSlot, saveToSlot } from "@/lib/save";
 *
 * UI integration pattern:
 *   import { listSaves, hasSave, deleteSlot, nextAvailableSlot } from "@/lib/save";
 *   import type { SaveIndexEntry, SavePreview } from "@/lib/save";
 */

// ── Constants ─────────────────────────────────────────────────────────────────

export {
  AUTOSAVE_SLOT_ID,
  MAX_MANUAL_SLOTS,
  SAVE_INDEX_KEY,
  SAVE_SLOT_KEY_PREFIX,
} from "./types";

// ── Types ─────────────────────────────────────────────────────────────────────

export type { SaveIndexEntry, SavePreview, SaveSlot } from "./types";

// ── Storage API ───────────────────────────────────────────────────────────────

export {
  listSaves,
  hasSave,
  saveToSlot,
  loadFromSlot,
  deleteSlot,
  autosave,
  loadAutosave,
  nextAvailableSlot,
} from "./storage";
