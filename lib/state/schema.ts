/**
 * Player State Schema — Magical Journey / Aethermoor Academy
 *
 * This is the single source of truth for all player-facing runtime data.
 * The engine reads from here; mutations are in mutations.ts; selectors are in
 * selectors.ts; persistence is owned by save-load-engineer.
 *
 * Increment SCHEMA_VERSION on any breaking change and add a migration in
 * migrations.ts.
 */

export const SCHEMA_VERSION = 1;

// ── Enumerations ──────────────────────────────────────────────────────────────

/**
 * The four magical Orders a player can be sorted into at Aethermoor Academy.
 * - ignis:   Fire / courage / boldness
 * - aqualyn: Water / empathy / harmony
 * - terram:  Earth / wisdom / stability
 * - ventus:  Air / cunning / adaptability
 */
export type House = "ignis" | "aqualyn" | "terram" | "ventus";

/**
 * The five player traits that represent character disposition.
 * All traits share the range [0, 10] and start at the default value (3).
 */
export type TraitKey = "courage" | "cunning" | "empathy" | "ambition" | "wisdom";

/**
 * The five named NPCs whose relationship meters are tracked in Chapter 1.
 * Each key represents a distinct interpersonal dynamic.
 */
export type RelationshipKey =
  | "sera_trust"      // Trust with Sera Voss (Aqualyn roommate)
  | "caden_rivalry"   // Competitive tension with Caden Miral (Ignis rival)
  | "aldric_regard"   // Professional regard from Professor Aldric
  | "lira_influence"  // Lira Thane's leverage / influence over the player
  | "tomas_bond";     // Emotional closeness with Tomás Reeve

/**
 * Boolean story flags set by CONSEQUENCE nodes.
 * Flags must be read after they are set (i.e., they are set on first encounter,
 * not assumed). All default to false.
 */
export type FlagKey =
  | "witnessed_fracture"  // Player saw Lira perform forbidden Fracture Weave
  | "dueled_caden"        // Player participated in a duel with Caden
  | "reported_lira"       // Player reported Lira to Professor Aldric
  | "sided_with_lira"     // Player chose to protect or align with Lira
  | "class_success"       // Player succeeded in the Elemental Casting class attempt
  | "crisis_intervened"   // Player actively helped during the courtyard crisis
  | "crisis_fled"         // Player fled or was passive during the courtyard crisis
  | "house_assigned";     // Sorting Ceremony has resolved; identity.house is valid

/**
 * How the player resolved the Chapter 1 courtyard crisis.
 * Exported at chapter end; used to seed Chapter 2 state.
 */
export type CrisisOutcome = "hero" | "observer" | "failed";

/**
 * Player's overall standing at the end of Chapter 1.
 */
export type ChapterReputation = "high" | "low";

/**
 * Lira Thane's disposition toward the player at the end of Chapter 1.
 * - watching:  She noticed you but has not yet acted
 * - unaware:   She does not know you saw her
 * - owns_you:  She witnessed your failure and holds leverage over you
 */
export type LiraStatus = "watching" | "unaware" | "owns_you";

// ── Sub-schemas ───────────────────────────────────────────────────────────────

/** Core identity fields set during character creation / onboarding. */
export interface PlayerIdentity {
  /** The player's chosen character name. Empty string before onboarding completes. */
  name: string;
  /** Order assigned at S03_SORTING_CEREMONY. Null before house_assigned flag is set. */
  house: House | null;
  /**
   * Background archetype chosen during onboarding (e.g. "scholarship", "legacy",
   * "outsider"). Determines minor flavour dialogue; does not gate content.
   * Null before onboarding completes.
   */
  background: string | null;
}

/**
 * The five character traits. Each value is an integer in [0, 10].
 * Default: 3. Raised/lowered by CONSEQUENCE nodes; checked by GATE nodes.
 *
 * Design intent:
 * - Traits represent disposition, not ability. A low courage player is not
 *   "bad" — some paths reward cunning or empathy instead.
 * - Traits accumulate across chapters. Do not reset between chapters.
 */
export interface Traits {
  /** Willingness to act boldly, take risks, confront danger directly. Default: 3. */
  courage: number;
  /** Capacity for indirect, calculating, or strategic thinking. Default: 3. */
  cunning: number;
  /** Emotional attunement, compassion, and sensitivity to others. Default: 3. */
  empathy: number;
  /** Drive to achieve recognition, lead, or advance. Default: 3. */
  ambition: number;
  /** Depth of measured, reflective judgement. Default: 3. */
  wisdom: number;
}

/**
 * NPC relationship meters. Each value is an integer in [0, 10]. Default: 0.
 *
 * Naming convention reflects the emotional texture of each relationship:
 * - trust / bond    → positive closeness
 * - rivalry         → competitive tension (higher = more intense, not negative)
 * - regard          → respect/esteem from an authority figure
 * - influence       → external party's leverage over the player (not player's over NPC)
 *
 * Meters accumulate across chapters. Do not reset between chapters.
 */
export interface Relationships {
  /** Trust built with Sera Voss (Aqualyn, roommate). Range: 0–10. Default: 0. */
  sera_trust: number;
  /** Competitive intensity between player and Caden Miral (Ignis). Range: 0–10. Default: 0. */
  caden_rivalry: number;
  /** Professor Aldric's professional regard for the player. Range: 0–10. Default: 0. */
  aldric_regard: number;
  /**
   * How much leverage Lira Thane holds over the player.
   * High = Lira has power over the player. Range: 0–10. Default: 0.
   */
  lira_influence: number;
  /** Emotional closeness and trust with Tomás Reeve (Terram). Range: 0–10. Default: 0. */
  tomas_bond: number;
}

/**
 * Boolean story flags. All default to false.
 * Set by CONSEQUENCE nodes; read by GATE nodes and ending logic.
 *
 * Rule: A flag must be set to true before it is read as true.
 * Do not assume a flag is set based on trait or relationship values alone.
 */
export interface Flags {
  /** Player observed Lira Thane performing a forbidden Fracture Weave in the corridor. */
  witnessed_fracture: boolean;
  /** Player entered into a formal duel with Caden Miral. */
  dueled_caden: boolean;
  /** Player reported Lira Thane's forbidden Weaving to Professor Aldric. */
  reported_lira: boolean;
  /** Player chose to protect, align with, or cover for Lira Thane. */
  sided_with_lira: boolean;
  /** Player succeeded at the Elemental Casting class attempt (C03_CLASS_ATTEMPT). */
  class_success: boolean;
  /** Player took an active intervention role during the Chapter 1 courtyard crisis. */
  crisis_intervened: boolean;
  /** Player fled or remained fully passive during the Chapter 1 courtyard crisis. */
  crisis_fled: boolean;
  /** Sorting Ceremony (S03) has completed; identity.house is now valid. */
  house_assigned: boolean;
}

/**
 * Fields exported at the end of a chapter to seed the next chapter's starting state.
 * All values are null until the chapter ending node resolves.
 *
 * Downstream consumers (Chapter 2 engine) must treat null as "chapter not completed".
 */
export interface ChapterExports {
  /** How the player resolved the Chapter 1 courtyard crisis. Null until chapter ends. */
  crisis_outcome: CrisisOutcome | null;
  /** Player's overall reputation at the end of Chapter 1. Null until chapter ends. */
  chapter_1_reputation: ChapterReputation | null;
  /** Lira Thane's disposition toward the player at chapter end. Null until chapter ends. */
  lira_status: LiraStatus | null;
}

/**
 * Story progress tracking. Tells the engine where the player is and where they've been.
 * visitedNodes is append-only; do not remove entries.
 */
export interface Progress {
  /** The node ID the player is currently on (e.g. "S01_ARRIVAL", "C01_WHO_DO_YOU_GREET"). */
  currentNodeId: string;
  /**
   * Ordered list of all node IDs the player has visited this chapter.
   * Append-only. Cleared when advancing to a new chapter.
   */
  visitedNodes: string[];
  /** Current chapter number (1-indexed). */
  chapter: number;
}

/** Internal metadata used for versioning and auditing. Not rendered to players. */
export interface PlayerStateMeta {
  /**
   * Schema version integer. Increment on any breaking change to PlayerState structure.
   * The migrate() function in migrations.ts maps older versions to current.
   */
  schemaVersion: number;
  /** ISO 8601 timestamp when this player state was first created. */
  createdAt: string;
  /** ISO 8601 timestamp of the most recent mutation. */
  lastUpdatedAt: string;
}

// ── Root schema ───────────────────────────────────────────────────────────────

/**
 * PlayerState — the complete, authoritative runtime state for a single playthrough.
 *
 * Serialization: JSON.stringify / JSON.parse are safe — no Sets, Maps, or Dates.
 * All timestamps are ISO 8601 strings. visitedNodes is a plain array.
 *
 * Ownership:
 * - Engine reads this and calls mutation functions in mutations.ts.
 * - Save/load layer serializes and deserializes this via JSON; owned by save-load-engineer.
 * - UI reads this via selectors.ts; never writes directly.
 */
export interface PlayerState {
  meta: PlayerStateMeta;
  identity: PlayerIdentity;
  traits: Traits;
  relationships: Relationships;
  flags: Flags;
  chapterExports: ChapterExports;
  progress: Progress;
}
