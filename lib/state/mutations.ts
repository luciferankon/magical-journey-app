/**
 * Pure mutation functions for PlayerState.
 *
 * Rules:
 * - Every function is pure: it takes a state, returns a NEW state. Never mutate in-place.
 * - Every function calls touch() to update meta.lastUpdatedAt.
 * - The engine is the only caller. UI and save-load layers must not call these directly.
 * - Numeric values are always clamped to their defined ranges.
 */

import {
  PlayerState,
  TraitKey,
  RelationshipKey,
  FlagKey,
  House,
  ChapterExports,
} from "./schema";
import {
  TRAIT_MIN,
  TRAIT_MAX,
  RELATIONSHIP_MIN,
  RELATIONSHIP_MAX,
} from "./defaults";

// ── Internals ─────────────────────────────────────────────────────────────────

function timestamp(): string {
  return new Date().toISOString();
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/** Return a new state with meta.lastUpdatedAt set to now. */
function touch(state: PlayerState): PlayerState {
  return {
    ...state,
    meta: { ...state.meta, lastUpdatedAt: timestamp() },
  };
}

// ── Trait mutations ───────────────────────────────────────────────────────────

/**
 * Apply a signed delta to a trait value. Result is clamped to [TRAIT_MIN, TRAIT_MAX].
 *
 * @example applyTrait(state, "courage", +2)
 * @example applyTrait(state, "empathy", -1)
 */
export function applyTrait(
  state: PlayerState,
  trait: TraitKey,
  delta: number
): PlayerState {
  return touch({
    ...state,
    traits: {
      ...state.traits,
      [trait]: clamp(state.traits[trait] + delta, TRAIT_MIN, TRAIT_MAX),
    },
  });
}

// ── Relationship mutations ────────────────────────────────────────────────────

/**
 * Apply a signed delta to a relationship meter. Result is clamped to
 * [RELATIONSHIP_MIN, RELATIONSHIP_MAX].
 *
 * @example applyRelationship(state, "sera_trust", +2)
 * @example applyRelationship(state, "lira_influence", -3)
 */
export function applyRelationship(
  state: PlayerState,
  npc: RelationshipKey,
  delta: number
): PlayerState {
  return touch({
    ...state,
    relationships: {
      ...state.relationships,
      [npc]: clamp(
        state.relationships[npc] + delta,
        RELATIONSHIP_MIN,
        RELATIONSHIP_MAX
      ),
    },
  });
}

// ── Flag mutations ────────────────────────────────────────────────────────────

/**
 * Set a story flag to a boolean value.
 * Flags are almost always set to true; passing false is supported for edge cases.
 *
 * @example setFlag(state, "witnessed_fracture", true)
 */
export function setFlag(
  state: PlayerState,
  flag: FlagKey,
  value: boolean
): PlayerState {
  return touch({
    ...state,
    flags: { ...state.flags, [flag]: value },
  });
}

// ── Identity mutations ────────────────────────────────────────────────────────

/**
 * Assign the player's Order after the Sorting Ceremony.
 * Also sets the house_assigned flag to true.
 * Only call this from the S03_SORTING_CEREMONY CONSEQUENCE node.
 */
export function setHouse(state: PlayerState, house: House): PlayerState {
  return touch({
    ...state,
    identity: { ...state.identity, house },
    flags: { ...state.flags, house_assigned: true },
  });
}

/**
 * Set the player's chosen character name (from onboarding / character creation).
 */
export function setPlayerName(state: PlayerState, name: string): PlayerState {
  return touch({
    ...state,
    identity: { ...state.identity, name },
  });
}

/**
 * Set the player's background archetype (from onboarding / character creation).
 * Valid values are determined by the onboarding designer's content; this layer
 * stores whatever string is passed without validation.
 */
export function setPlayerBackground(
  state: PlayerState,
  background: string
): PlayerState {
  return touch({
    ...state,
    identity: { ...state.identity, background },
  });
}

// ── Chapter export mutations ──────────────────────────────────────────────────

/**
 * Set one or more chapter export fields. Call at the chapter ending node
 * (ENDING_GATE) once the ending condition has resolved.
 *
 * @example setChapterExports(state, { crisis_outcome: "hero", chapter_1_reputation: "high", lira_status: "watching" })
 */
export function setChapterExports(
  state: PlayerState,
  exports: Partial<ChapterExports>
): PlayerState {
  return touch({
    ...state,
    chapterExports: { ...state.chapterExports, ...exports },
  });
}

// ── Progress mutations ────────────────────────────────────────────────────────

/**
 * Move the engine to a new story node and append it to the visited history.
 * Always call this when the engine transitions between nodes — even for
 * CONSEQUENCE and GATE nodes that have no player-visible content.
 */
export function advanceToNode(
  state: PlayerState,
  nodeId: string
): PlayerState {
  return touch({
    ...state,
    progress: {
      ...state.progress,
      currentNodeId: nodeId,
      visitedNodes: [...state.progress.visitedNodes, nodeId],
    },
  });
}

/**
 * Advance to the next chapter.
 * - Increments chapter counter.
 * - Resets currentNodeId to "" (engine must set it to the new chapter's first node).
 * - Clears visitedNodes (per-chapter history; cross-chapter state is in traits/relationships/flags).
 * - Does NOT reset traits, relationships, flags, or chapterExports.
 *
 * Only call this from the chapter ending CONSEQUENCE node after setChapterExports().
 */
export function advanceChapter(state: PlayerState): PlayerState {
  return touch({
    ...state,
    progress: {
      ...state.progress,
      chapter: state.progress.chapter + 1,
      currentNodeId: "",
      visitedNodes: [],
    },
  });
}

// ── Batch helper ──────────────────────────────────────────────────────────────

/**
 * Apply an ordered sequence of mutations in one call.
 * Use this when a CONSEQUENCE node fires multiple state changes simultaneously.
 * Each function in the array receives the output of the previous one.
 *
 * @example
 * applyConsequences(state, [
 *   (s) => applyTrait(s, "courage", +2),
 *   (s) => applyRelationship(s, "sera_trust", +1),
 *   (s) => setFlag(s, "crisis_intervened", true),
 * ])
 */
export function applyConsequences(
  state: PlayerState,
  mutations: ReadonlyArray<(s: PlayerState) => PlayerState>
): PlayerState {
  return mutations.reduce((s, fn) => fn(s), state);
}
