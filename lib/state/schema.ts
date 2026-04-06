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

export const SCHEMA_VERSION = 3;

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
 * The named NPCs whose relationship meters are tracked.
 * Each key represents a distinct interpersonal dynamic.
 * Chapter 1: sera_trust, caden_rivalry, aldric_regard, lira_influence, tomas_bond
 * Chapter 2: solis_standing
 * Chapter 3: ines_contact
 */
export type RelationshipKey =
  | "sera_trust"      // Trust with Sera Voss (Aqualyn roommate)
  | "caden_rivalry"   // Competitive tension with Caden Miral (Ignis rival)
  | "aldric_regard"   // Professional regard from Professor Aldric
  | "lira_influence"  // Lira Thane's leverage / influence over the player
  | "tomas_bond"      // Emotional closeness with Tomás Reeve
  | "solis_standing"  // Maren Solis's (Conclave examiner) assessment of the player
  | "ines_contact";   // Ines Reeve's cautious trust / contact with the player

/**
 * Boolean story flags set by CONSEQUENCE nodes.
 * Flags must be read after they are set (i.e., they are set on first encounter,
 * not assumed). All default to false.
 *
 * Chapter 1 flags: witnessed_fracture → house_assigned
 * Chapter 2 flags: met_solis → tomas_knows
 * Chapter 3 flags: sera_truth_known → aldric_acts
 */
export type FlagKey =
  // ── Chapter 1 ──────────────────────────────────────────────────────────────
  | "witnessed_fracture"  // Player saw Lira perform forbidden Fracture Weave
  | "dueled_caden"        // Player participated in a duel with Caden
  | "reported_lira"       // Player reported Lira to Professor Aldric
  | "sided_with_lira"     // Player chose to protect or align with Lira
  | "class_success"       // Player succeeded in the Elemental Casting class attempt
  | "crisis_intervened"   // Player actively helped during the courtyard crisis
  | "crisis_fled"         // Player fled or was passive during the courtyard crisis
  | "house_assigned"      // Sorting Ceremony has resolved; identity.house is valid
  // ── Chapter 2 ──────────────────────────────────────────────────────────────
  | "met_solis"           // Player has had at least one direct encounter with Maren Solis
  | "knows_ines_alive"    // Player learned that Tomás's sister Ines is alive and inside the Conclave
  | "conclave_offered"    // The Conclave (via Solis) has made a formal or implicit offer to the player
  | "tomas_knows"         // Tomás has been told the full truth about Ines's whereabouts
  // ── Chapter 3 ──────────────────────────────────────────────────────────────
  | "sera_truth_known"    // Player learned the truth about Sera's grief (her sister was Fracture-touched)
  | "caden_aligned"       // Caden has chosen a side alongside the player
  | "fracture_origin_known" // Player has learned the Fracture is not natural — it was designed
  | "conclave_split"      // The Conclave's internal disagreement has been exposed to the player
  | "aldric_acts";        // Aldric has taken an active step (not just passive counsel)

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

/**
 * How the player ultimately positioned themselves with Maren Solis / the Conclave.
 * Exported at end of Chapter 2; used to seed Chapter 3 state.
 * - confronted: Player challenged or exposed the Conclave
 * - joined:     Player accepted the Conclave's logic and offer
 * - brokered:   Player negotiated a specific outcome (Ines reunion) without full alignment
 * - walked:     Player left without resolving the situation
 */
export type Chapter2SolisStance = "confronted" | "joined" | "brokered" | "walked";

/**
 * Status of Ines Reeve (Tomás's sister) at the end of Chapter 2.
 * - found:    Tomás made direct contact; the reunion happened
 * - hidden:   Location known to the player but not revealed to Tomás
 * - exposed:  Her existence and Conclave involvement became public knowledge
 */
export type InesStatus = "found" | "hidden" | "exposed";

/**
 * Lira Thane's relationship to the player at the end of Chapter 2.
 * - ally:   Lira and the player are aligned (openly or tacitly)
 * - enemy:  Lira has turned against the player
 * - gone:   Lira has been removed from the school or disappeared
 */
export type LiraChapter2Status = "ally" | "enemy" | "gone";

/**
 * How the player ultimately positioned themselves at the end of Chapter 3.
 * Exported at end of Chapter 3; used to seed Chapter 4 state.
 * - reformer:  Player shifted the Conclave vote from within; reform path is open
 * - insurgent: Vote passed; player and allies are moving toward public disclosure
 * - absorbed:  Player accepted a Conclave position; becoming part of the institution
 * - isolated:  Player knows the truth but has no clear leverage or coalition
 */
export type Chapter3Stance = "reformer" | "insurgent" | "absorbed" | "isolated";

/**
 * How widely the Fracture's true origin was shared at the end of Chapter 3.
 * - public:         The 1963 Commission findings were made publicly known
 * - conclave_only:  Findings circulated only inside the Conclave deliberation
 * - kept_secret:    Player discovered the truth but did not share it
 */
export type FractureOriginShared = "public" | "conclave_only" | "kept_secret";

/**
 * Caden Miral's status at the end of Chapter 3.
 * - ally:          Caden has chosen a side alongside the player
 * - rival_knowing: Caden knows the truth but has not committed to the player's path
 * - unaware:       Caden was not brought into the truth
 */
export type CadenStatus = "ally" | "rival_knowing" | "unaware";

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
 * - standing        → a third party's assessment of the player (their opinion of you)
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
  /**
   * Maren Solis's (Conclave External Examiner) assessment of the player.
   * High = she rates the player highly as a potential recruit / asset.
   * Added in Chapter 2. Range: 0–10. Default: 0.
   */
  solis_standing: number;
  /**
   * Ines Reeve's cautious trust and willingness to communicate with the player.
   * High = she trusts the player enough to share dangerous information.
   * Added in Chapter 3. Range: 0–10. Default: 0.
   */
  ines_contact: number;
}

/**
 * Boolean story flags. All default to false.
 * Set by CONSEQUENCE nodes; read by GATE nodes and ending logic.
 *
 * Rule: A flag must be set to true before it is read as true.
 * Do not assume a flag is set based on trait or relationship values alone.
 */
export interface Flags {
  // ── Chapter 1 ──────────────────────────────────────────────────────────────
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
  // ── Chapter 2 ──────────────────────────────────────────────────────────────
  /** Player has had at least one direct encounter with Maren Solis (Conclave examiner). */
  met_solis: boolean;
  /** Player learned that Tomás's sister Ines is alive and working inside the Conclave. */
  knows_ines_alive: boolean;
  /** The Conclave (via Solis) has made a formal or implicit offer to the player. */
  conclave_offered: boolean;
  /** Tomás has been told the full truth about his sister's whereabouts and status. */
  tomas_knows: boolean;
  // ── Chapter 3 ──────────────────────────────────────────────────────────────
  /** Player learned Sera's sister Maelie was Fracture-touched and the school lied; Sera's grief has found its true shape. */
  sera_truth_known: boolean;
  /** Caden has revealed his brother Davo's history and chosen a side alongside the player. */
  caden_aligned: boolean;
  /** Player has learned the Fracture is not a natural phenomenon — it was deliberately designed in 1963. */
  fracture_origin_known: boolean;
  /** The Conclave's internal factional disagreement (containment vs. disclosure) has been exposed to the player. */
  conclave_split: boolean;
  /** Professor Aldric has taken an active step (e.g. sharing the 1971 monograph) rather than passive counsel. */
  aldric_acts: boolean;
}

/**
 * Fields exported at the end of each chapter to seed the next chapter's starting state.
 * All values are null until the relevant chapter ending node resolves.
 *
 * Downstream consumers must treat null as "chapter not yet completed".
 * Fields from earlier chapters remain set when later chapters complete.
 */
export interface ChapterExports {
  // ── Chapter 1 exports ──────────────────────────────────────────────────────
  /** How the player resolved the Chapter 1 courtyard crisis. Null until Ch.1 ends. */
  crisis_outcome: CrisisOutcome | null;
  /** Player's overall reputation at the end of Chapter 1. Null until Ch.1 ends. */
  chapter_1_reputation: ChapterReputation | null;
  /** Lira Thane's disposition toward the player at end of Ch.1. Null until Ch.1 ends. */
  lira_status: LiraStatus | null;
  // ── Chapter 2 exports ──────────────────────────────────────────────────────
  /** Player's final stance toward Solis / the Conclave. Null until Ch.2 ends. */
  chapter_2_solis_stance: Chapter2SolisStance | null;
  /** Status of Ines Reeve at end of Ch.2. Null until Ch.2 ends. */
  ines_status: InesStatus | null;
  /** Lira's relationship to the player at end of Ch.2. Null until Ch.2 ends. */
  lira_chapter_2_status: LiraChapter2Status | null;
  // ── Chapter 3 exports ──────────────────────────────────────────────────────
  /** Player's final position at the end of Chapter 3. Null until Ch.3 ends. */
  chapter_3_stance: Chapter3Stance | null;
  /** How widely the Fracture's true origin was shared at end of Ch.3. Null until Ch.3 ends. */
  fracture_origin_shared: FractureOriginShared | null;
  /** Caden Miral's status at end of Ch.3. Null until Ch.3 ends. */
  caden_status: CadenStatus | null;
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
