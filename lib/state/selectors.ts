/**
 * Read-only selectors and gate evaluators for PlayerState.
 *
 * Rules:
 * - Every function here is pure and has no side effects.
 * - UI components and the engine GATE node evaluator are the primary callers.
 * - Never import mutations.ts from here.
 */

import { PlayerState, TraitKey, RelationshipKey, FlagKey } from "./schema";

// ── Trait selectors ───────────────────────────────────────────────────────────

/** Return the current integer value of a trait. */
export function getTrait(state: PlayerState, trait: TraitKey): number {
  return state.traits[trait];
}

/**
 * Return true if a trait meets or exceeds a threshold.
 * Used to evaluate GATE nodes in the story graph.
 *
 * @example passesTraitGate(state, "courage", 5) // true if courage >= 5
 */
export function passesTraitGate(
  state: PlayerState,
  trait: TraitKey,
  threshold: number
): boolean {
  return state.traits[trait] >= threshold;
}

// ── Relationship selectors ────────────────────────────────────────────────────

/** Return the current integer value of a relationship meter. */
export function getRelationship(
  state: PlayerState,
  npc: RelationshipKey
): number {
  return state.relationships[npc];
}

/**
 * Return true if a relationship meter meets or exceeds a threshold.
 * Used to evaluate GATE nodes that branch on NPC relationship values.
 *
 * @example passesRelationshipGate(state, "tomas_bond", 4) // true if tomas_bond >= 4
 */
export function passesRelationshipGate(
  state: PlayerState,
  npc: RelationshipKey,
  threshold: number
): boolean {
  return state.relationships[npc] >= threshold;
}

// ── Flag selectors ────────────────────────────────────────────────────────────

/** Return the current boolean value of a story flag. */
export function getFlag(state: PlayerState, flag: FlagKey): boolean {
  return state.flags[flag];
}

// ── Progress selectors ────────────────────────────────────────────────────────

/** Return true if the player has already visited a given node this chapter. */
export function hasVisited(state: PlayerState, nodeId: string): boolean {
  return state.progress.visitedNodes.includes(nodeId);
}

// ── Compound / ending gate evaluators ────────────────────────────────────────

/**
 * Evaluate the Chapter 1 ending gate and return which ending the player reached.
 *
 * Ending priority (evaluated in order — first match wins):
 *
 * ENDING_A "The Marked One"
 *   crisis_intervened == true AND (courage >= 6 OR tomas_bond >= 4)
 *
 * ENDING_C "The Fracture"
 *   crisis_fled == true OR (crisis_intervened == false AND courage < 4 AND tomas_bond < 3)
 *
 * ENDING_B "The Watcher"
 *   All other cases (stayed back but did not fully freeze or flee)
 *
 * Returns null if the chapter has not reached the ending gate yet.
 */
export function resolveChapter1Ending(
  state: PlayerState
): "ENDING_A" | "ENDING_B" | "ENDING_C" | null {
  const { flags, traits, relationships } = state;

  // Chapter must have reached the crisis to resolve an ending
  if (
    !flags.crisis_intervened &&
    !flags.crisis_fled &&
    !flags.witnessed_fracture
  ) {
    return null;
  }

  // ENDING_A — The Marked One
  if (
    flags.crisis_intervened &&
    (traits.courage >= 6 || relationships.tomas_bond >= 4)
  ) {
    return "ENDING_A";
  }

  // ENDING_C — The Fracture
  if (
    flags.crisis_fled ||
    (!flags.crisis_intervened && traits.courage < 4 && relationships.tomas_bond < 3)
  ) {
    return "ENDING_C";
  }

  // ENDING_B — The Watcher (default)
  return "ENDING_B";
}

/**
 * Derive the chapter_1_reputation value from the current state.
 * High reputation requires meaningful action (crisis intervened) and
 * some positive authority relationship.
 *
 * Used by setChapterExports() callers to avoid hardcoding thresholds
 * in the engine's content definition.
 */
export function deriveChapter1Reputation(
  state: PlayerState
): "high" | "low" {
  const { flags, relationships } = state;
  if (flags.crisis_intervened && relationships.aldric_regard >= 2) {
    return "high";
  }
  return "low";
}

/**
 * Derive lira_status from the current state at chapter end.
 *
 * - "owns_you"  → crisis_fled, or player never intervened with low tomas_bond
 * - "unaware"   → reported_lira is false and lira_influence is low
 * - "watching"  → all other cases (Lira noticed the player)
 */
export function deriveLiraStatus(
  state: PlayerState
): "watching" | "unaware" | "owns_you" {
  const { flags, relationships } = state;

  if (flags.crisis_fled || relationships.lira_influence >= 7) {
    return "owns_you";
  }
  if (!flags.reported_lira && relationships.lira_influence <= 2) {
    return "unaware";
  }
  return "watching";
}
