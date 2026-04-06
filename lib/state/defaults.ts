/**
 * Default values and initial state factory for PlayerState.
 *
 * Always create new state through createInitialState() — never construct
 * PlayerState literals in engine or UI code.
 */

import { SCHEMA_VERSION, PlayerState } from "./schema";

// ── Numeric boundaries ────────────────────────────────────────────────────────

/** Default starting value for all traits. */
export const TRAIT_DEFAULT = 3;

/** Minimum allowed value for any trait. */
export const TRAIT_MIN = 0;

/** Maximum allowed value for any trait. */
export const TRAIT_MAX = 10;

/** Minimum allowed value for any relationship meter. */
export const RELATIONSHIP_MIN = 0;

/** Maximum allowed value for any relationship meter. */
export const RELATIONSHIP_MAX = 10;

// ── Progress defaults ─────────────────────────────────────────────────────────

/** Node ID where every new playthrough begins. Must match content/manifest.json startSceneId. */
export const STARTING_NODE_ID = "s01_arrival";

/** Chapter number for a new playthrough. */
export const STARTING_CHAPTER = 1;

// ── Factory ───────────────────────────────────────────────────────────────────

/**
 * Create a fresh PlayerState for a new playthrough.
 *
 * @param overrides - Optional partial identity to pre-populate (e.g. from
 *   character creation). Do not use this to bypass onboarding — the engine
 *   should still run onboarding nodes; this just seeds the initial values.
 */
export function createInitialState(
  overrides?: Partial<Pick<PlayerState, "identity">>
): PlayerState {
  const now = new Date().toISOString();

  return {
    meta: {
      schemaVersion: SCHEMA_VERSION,
      createdAt: now,
      lastUpdatedAt: now,
    },

    identity: {
      name: "",
      house: null,
      background: null,
      ...overrides?.identity,
    },

    traits: {
      courage: TRAIT_DEFAULT,
      cunning: TRAIT_DEFAULT,
      empathy: TRAIT_DEFAULT,
      ambition: TRAIT_DEFAULT,
      wisdom: TRAIT_DEFAULT,
    },

    relationships: {
      sera_trust: 0,
      caden_rivalry: 0,
      aldric_regard: 0,
      lira_influence: 0,
      tomas_bond: 0,
      solis_standing: 0,
    },

    flags: {
      // Chapter 1
      witnessed_fracture: false,
      dueled_caden: false,
      reported_lira: false,
      sided_with_lira: false,
      class_success: false,
      crisis_intervened: false,
      crisis_fled: false,
      house_assigned: false,
      // Chapter 2
      met_solis: false,
      knows_ines_alive: false,
      conclave_offered: false,
      tomas_knows: false,
    },

    chapterExports: {
      // Chapter 1
      crisis_outcome: null,
      chapter_1_reputation: null,
      lira_status: null,
      // Chapter 2
      chapter_2_solis_stance: null,
      ines_status: null,
      lira_chapter_2_status: null,
    },

    progress: {
      currentNodeId: STARTING_NODE_ID,
      visitedNodes: [],
      chapter: STARTING_CHAPTER,
    },
  };
}
