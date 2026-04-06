/**
 * Engine API contract types — used by the UI to communicate with the engine.
 *
 * These types match the engine implementation in the peaceful-satoshi branch.
 * When that branch merges, this file can be replaced by the authoritative source.
 *
 * The UI imports from here; it never imports from the engine implementation.
 */

// ── Scene & choice types ──────────────────────────────────────────────────────

export interface Scene {
  id: string;
  /** Narrative prose shown to the player. Never hardcode this in JSX. */
  text: string;
  choices: Choice[];
  isEnding?: boolean;
}

export interface Choice {
  id: string;
  text: string;
  gate?: GateCondition;
  consequences: Consequence[];
  /** Scene ID to advance to after this choice. */
  next: string;
}

// ── Gate conditions ───────────────────────────────────────────────────────────

export type GateCondition =
  | { type: "trait_gte"; trait: string; value: number }
  | { type: "trait_lte"; trait: string; value: number }
  | { type: "flag_set"; flag: string }
  | { type: "flag_unset"; flag: string }
  | { type: "relationship_gte"; character: string; value: number }
  | { type: "relationship_lte"; character: string; value: number }
  | { type: "and"; conditions: GateCondition[] }
  | { type: "or"; conditions: GateCondition[] }
  | { type: "not"; condition: GateCondition };

// ── Consequences ──────────────────────────────────────────────────────────────

export type Consequence =
  | { type: "trait_delta"; trait: string; delta: number }
  | { type: "set_flag"; flag: string }
  | { type: "unset_flag"; flag: string }
  | { type: "relationship_delta"; character: string; delta: number }
  /**
   * Set a named field in chapterExports. The field must exist on ChapterExports;
   * the value must be a valid string literal for that field's union type.
   * Use this at chapter-ending nodes to record cross-chapter carry state.
   *
   * @example { type: "set_chapter_export", field: "crisis_outcome", value: "hero" }
   */
  | { type: "set_chapter_export"; field: string; value: string }
  /**
   * Advance to the next chapter. Increments progress.chapter, clears
   * visitedNodes, and resets currentNodeId to "". The engine will then
   * advanceToNode() to the chapter opening scene via the choice's `next` field.
   *
   * Always place this consequence LAST in the list — it mutates progress and
   * must run after all chapterExports have been set.
   */
  | { type: "advance_chapter" };

// ── View types returned by the API ────────────────────────────────────────────

/**
 * A choice as presented to the player — includes availability so the UI can
 * render locked choices with a lock icon without re-evaluating gate logic.
 */
export interface AvailableChoice {
  id: string;
  text: string;
  /** False when the gate condition is not met. UI renders the choice as locked. */
  available: boolean;
}

/**
 * Everything the UI needs to render the current scene moment.
 */
export interface SceneView {
  scene: Scene;
  availableChoices: AvailableChoice[];
  isEnding: boolean;
}

/**
 * The result of resolving a player choice.
 */
export interface ChoiceResult {
  newState: import("@/lib/state").PlayerState;
  nextSceneView: SceneView;
}

/**
 * Structured engine error. The UI should map each code to a friendly message.
 */
export interface EngineError {
  code:
    | "SCENE_NOT_FOUND"
    | "CHOICE_NOT_FOUND"
    | "CHOICE_UNAVAILABLE"
    | "ALREADY_ENDED";
  message: string;
}

// ── API request/response shapes ───────────────────────────────────────────────

/** POST /api/engine/start — response body */
export interface StartResponse {
  state: import("@/lib/state").PlayerState;
  sceneView: SceneView;
}

/** POST /api/engine/choose — request body */
export interface ChooseRequest {
  choiceId: string;
  state: import("@/lib/state").PlayerState;
}

/** POST /api/engine/choose — response body (success) */
export interface ChooseResponse {
  newState: import("@/lib/state").PlayerState;
  nextSceneView: SceneView;
}

/** POST /api/engine/resume — request body */
export interface ResumeRequest {
  state: import("@/lib/state").PlayerState;
}

/** POST /api/engine/resume — response body (success) */
export type ResumeResponse = SceneView;
