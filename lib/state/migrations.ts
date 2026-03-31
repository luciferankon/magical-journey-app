/**
 * Schema migration for PlayerState.
 *
 * When to add a migration:
 * - You add, rename, or remove a field in schema.ts
 * - You change the type or valid range of a field
 * - You change SCHEMA_VERSION in schema.ts
 *
 * How to add a migration:
 * 1. Increment SCHEMA_VERSION in schema.ts.
 * 2. Add a `if (savedVersion < N)` block inside migrate() below.
 * 3. Write a migrateToVN() function that handles the one-version-up transform.
 * 4. Keep each migration function focused: do the minimum needed to bring
 *    the state up one version. Do not try to do multi-version jumps in one function.
 *
 * Backwards compatibility guarantee:
 * A save file from any schema version must be loadable by the current engine.
 * If a migration is impossible (e.g. corrupt data), return createInitialState().
 */

import { PlayerState, SCHEMA_VERSION } from "./schema";
import { createInitialState } from "./defaults";

/**
 * Migrate a raw deserialized value to the current PlayerState schema.
 *
 * Safe to call with any JSON.parse output — including null, malformed data,
 * or state from future schema versions (returns a fresh state in those cases).
 *
 * @param raw - The raw value from JSON.parse. May be any type.
 * @returns A valid PlayerState at the current SCHEMA_VERSION.
 */
export function migrate(raw: unknown): PlayerState {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return createInitialState();
  }

  const data = raw as Record<string, unknown>;
  const meta = data.meta as Record<string, unknown> | undefined;
  const savedVersion =
    typeof meta?.schemaVersion === "number" ? meta.schemaVersion : 0;

  // Refuse to "downgrade" a save from a newer engine version
  if (savedVersion > SCHEMA_VERSION) {
    return createInitialState();
  }

  let state = data as unknown as PlayerState;

  // ── Run migrations in ascending version order ───────────────────────────
  // Each block brings state from (version - 1) up to version.

  if (savedVersion < 1) {
    // V0 → V1: Schema did not exist before v1; treat pre-release saves as corrupt.
    state = migrateToV1();
  }

  // Future: if (savedVersion < 2) { state = migrateToV2(state); }

  return state;
}

/**
 * V0 → V1: The schema was formalized in V1. Any pre-V1 save is considered
 * incompatible — return a clean state rather than attempting to map unknown fields.
 */
function migrateToV1(): PlayerState {
  return createInitialState();
}

/**
 * Return true if the given state is already at the current schema version.
 * Callers may use this to skip the migration path when loading a save.
 */
export function isCurrentVersion(state: PlayerState): boolean {
  return state?.meta?.schemaVersion === SCHEMA_VERSION;
}
