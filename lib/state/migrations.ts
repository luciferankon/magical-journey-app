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

  if (savedVersion < 2) {
    // V1 → V2: Added solis_standing relationship, four chapter-2 flags
    // (met_solis, knows_ines_alive, conclave_offered, tomas_knows), and three
    // chapter-2 chapterExports fields (chapter_2_solis_stance, ines_status,
    // lira_chapter_2_status). All new fields default to 0 / false / null.
    state = migrateToV2(state);
  }

  if (savedVersion < 3) {
    // V2 → V3: Added ines_contact relationship, five chapter-3 flags
    // (sera_truth_known, caden_aligned, fracture_origin_known, conclave_split, aldric_acts),
    // and three chapter-3 chapterExports fields
    // (chapter_3_stance, fracture_origin_shared, caden_status).
    // All new fields default to 0 / false / null.
    state = migrateToV3(state);
  }

  if (savedVersion < 4) {
    // V3 → V4: Added lira_trust relationship (initialised from lira_influence >= 3 → 2, else 0),
    // six chapter-4 flags (davo_encountered, davo_truth_known, veth_protected, veth_broken,
    // archivist_revealed, lira_returned), and four chapter-4 chapterExports fields
    // (chapter_4_stance, veth_status, davo_outcome, lira_status_ch4).
    // All new flags default to false; all new exports default to null.
    // Note: veth_broken was added here but removed in V5.
    state = migrateToV4(state);
  }

  if (savedVersion < 5) {
    // V4 → V5: Removed veth_broken flag. The flag was designed but never wired into
    // any scene or gate — no content path ever set it. Removed to keep the schema clean.
    state = migrateToV5(state);
  }

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
 * V1 → V2: Chapter 2 schema additions.
 * - relationships.solis_standing: new meter, defaults to 0
 * - flags.met_solis, knows_ines_alive, conclave_offered, tomas_knows: new flags, default false
 * - chapterExports.chapter_2_solis_stance, ines_status, lira_chapter_2_status: new exports, default null
 *
 * All chapter-1 fields are preserved exactly as they were.
 */
function migrateToV2(prev: PlayerState): PlayerState {
  // Cast through unknown to safely read fields that exist in V2 schema but may
  // be absent in a V1 save. The ?? null / ?? 0 / ?? false defaults handle absence.
  const r = prev.relationships as unknown as Record<string, unknown>;
  const f = prev.flags as unknown as Record<string, unknown>;
  const e = prev.chapterExports as unknown as Record<string, unknown>;

  return {
    ...prev,
    meta: { ...prev.meta, schemaVersion: 2 },
    relationships: {
      ...prev.relationships,
      solis_standing: typeof r.solis_standing === "number" ? r.solis_standing : 0,
    },
    flags: {
      ...prev.flags,
      met_solis: typeof f.met_solis === "boolean" ? f.met_solis : false,
      knows_ines_alive: typeof f.knows_ines_alive === "boolean" ? f.knows_ines_alive : false,
      conclave_offered: typeof f.conclave_offered === "boolean" ? f.conclave_offered : false,
      tomas_knows: typeof f.tomas_knows === "boolean" ? f.tomas_knows : false,
    },
    chapterExports: {
      ...prev.chapterExports,
      chapter_2_solis_stance: (e.chapter_2_solis_stance ?? null) as PlayerState["chapterExports"]["chapter_2_solis_stance"],
      ines_status: (e.ines_status ?? null) as PlayerState["chapterExports"]["ines_status"],
      lira_chapter_2_status: (e.lira_chapter_2_status ?? null) as PlayerState["chapterExports"]["lira_chapter_2_status"],
    },
  };
}

/**
 * V2 → V3: Chapter 3 schema additions.
 * - relationships.ines_contact: new meter, defaults to 0
 * - flags.sera_truth_known, caden_aligned, fracture_origin_known, conclave_split, aldric_acts: new flags, default false
 * - chapterExports.chapter_3_stance, fracture_origin_shared, caden_status: new exports, default null
 *
 * All chapter-1 and chapter-2 fields are preserved exactly as they were.
 */
function migrateToV3(prev: PlayerState): PlayerState {
  const r = prev.relationships as unknown as Record<string, unknown>;
  const f = prev.flags as unknown as Record<string, unknown>;
  const e = prev.chapterExports as unknown as Record<string, unknown>;

  return {
    ...prev,
    meta: { ...prev.meta, schemaVersion: 3 },
    relationships: {
      ...prev.relationships,
      ines_contact: typeof r.ines_contact === "number" ? r.ines_contact : 0,
    },
    flags: {
      ...prev.flags,
      sera_truth_known: typeof f.sera_truth_known === "boolean" ? f.sera_truth_known : false,
      caden_aligned: typeof f.caden_aligned === "boolean" ? f.caden_aligned : false,
      fracture_origin_known: typeof f.fracture_origin_known === "boolean" ? f.fracture_origin_known : false,
      conclave_split: typeof f.conclave_split === "boolean" ? f.conclave_split : false,
      aldric_acts: typeof f.aldric_acts === "boolean" ? f.aldric_acts : false,
    },
    chapterExports: {
      ...prev.chapterExports,
      chapter_3_stance: (e.chapter_3_stance ?? null) as PlayerState["chapterExports"]["chapter_3_stance"],
      fracture_origin_shared: (e.fracture_origin_shared ?? null) as PlayerState["chapterExports"]["fracture_origin_shared"],
      caden_status: (e.caden_status ?? null) as PlayerState["chapterExports"]["caden_status"],
    },
  };
}

/**
 * V3 → V4: Chapter 4 schema additions.
 * - relationships.lira_trust: new meter; initialised from lira_influence (>= 3 → 2, else 0)
 * - flags.davo_encountered, davo_truth_known, veth_protected, veth_broken,
 *   archivist_revealed, lira_returned: new flags, default false (veth_broken removed in V5)
 * - chapterExports.chapter_4_stance, veth_status, davo_outcome, lira_status_ch4: default null
 *
 * All chapter-1, chapter-2, and chapter-3 fields are preserved exactly as they were.
 */
function migrateToV4(prev: PlayerState): PlayerState {
  const r = prev.relationships as unknown as Record<string, unknown>;
  const f = prev.flags as unknown as Record<string, unknown>;
  const e = prev.chapterExports as unknown as Record<string, unknown>;

  // lira_trust seeds from lira_influence: >= 3 → 2, else 0.
  // Preserve an existing value if the field was somehow already present.
  const liraInfluence = typeof r.lira_influence === "number" ? r.lira_influence : 0;
  const liraTrustSeed = liraInfluence >= 3 ? 2 : 0;

  return {
    ...prev,
    meta: { ...prev.meta, schemaVersion: 4 },
    relationships: {
      ...prev.relationships,
      lira_trust: typeof r.lira_trust === "number" ? r.lira_trust : liraTrustSeed,
    },
    flags: {
      ...prev.flags,
      davo_encountered: typeof f.davo_encountered === "boolean" ? f.davo_encountered : false,
      davo_truth_known: typeof f.davo_truth_known === "boolean" ? f.davo_truth_known : false,
      veth_protected: typeof f.veth_protected === "boolean" ? f.veth_protected : false,
      archivist_revealed: typeof f.archivist_revealed === "boolean" ? f.archivist_revealed : false,
      lira_returned: typeof f.lira_returned === "boolean" ? f.lira_returned : false,
    },
    chapterExports: {
      ...prev.chapterExports,
      chapter_4_stance: (e.chapter_4_stance ?? null) as PlayerState["chapterExports"]["chapter_4_stance"],
      veth_status: (e.veth_status ?? null) as PlayerState["chapterExports"]["veth_status"],
      davo_outcome: (e.davo_outcome ?? null) as PlayerState["chapterExports"]["davo_outcome"],
      lira_status_ch4: (e.lira_status_ch4 ?? null) as PlayerState["chapterExports"]["lira_status_ch4"],
    },
  };
}

/**
 * V4 → V5: Remove veth_broken flag.
 * The flag was declared in V4 but no scene or gate ever set it — it was designed
 * for a branch that was not implemented in Chapter 4. Removed to keep the schema clean.
 * Saves that somehow have veth_broken set (impossible via normal play, but possible via
 * direct state manipulation) will have the field stripped silently.
 */
function migrateToV5(prev: PlayerState): PlayerState {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { veth_broken: _removed, ...remainingFlags } =
    prev.flags as unknown as Record<string, unknown>;

  return {
    ...prev,
    meta: { ...prev.meta, schemaVersion: 5 },
    flags: remainingFlags as PlayerState["flags"],
  };
}

/**
 * Return true if the given state is already at the current schema version.
 * Callers may use this to skip the migration path when loading a save.
 */
export function isCurrentVersion(state: PlayerState): boolean {
  return state?.meta?.schemaVersion === SCHEMA_VERSION;
}
