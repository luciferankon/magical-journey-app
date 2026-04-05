/**
 * Core engine types — all game logic operates against these contracts.
 * Content files and the UI layer must conform to these shapes.
 */

// ---------------------------------------------------------------------------
// Gate conditions — evaluated against PlayerState to unlock choices
// ---------------------------------------------------------------------------

export type GateCondition =
  | { type: 'trait_gte'; trait: string; value: number }
  | { type: 'trait_lte'; trait: string; value: number }
  | { type: 'flag_set'; flag: string }
  | { type: 'flag_unset'; flag: string }
  | { type: 'relationship_gte'; character: string; value: number }
  | { type: 'relationship_lte'; character: string; value: number }
  | { type: 'and'; conditions: GateCondition[] }
  | { type: 'or'; conditions: GateCondition[] }
  | { type: 'not'; condition: GateCondition }

// ---------------------------------------------------------------------------
// Consequences — mutations applied to PlayerState after a choice is made
// ---------------------------------------------------------------------------

export type Consequence =
  | { type: 'trait_delta'; trait: string; delta: number }
  | { type: 'set_flag'; flag: string }
  | { type: 'unset_flag'; flag: string }
  | { type: 'relationship_delta'; character: string; delta: number }

// ---------------------------------------------------------------------------
// Scene / Choice — the narrative graph nodes loaded from content files
// ---------------------------------------------------------------------------

export interface Choice {
  id: string
  text: string
  /** Optional gate — if present, the choice is only available when the gate passes */
  gate?: GateCondition
  consequences: Consequence[]
  /** Scene ID to advance to, or the sentinel value 'END' for an ending */
  next: string
}

export interface Scene {
  id: string
  /** Narrative prose shown to the player */
  text: string
  choices: Choice[]
  /** True when this scene concludes the story */
  isEnding?: boolean
}

// ---------------------------------------------------------------------------
// PlayerState — the single source of truth mutated throughout a playthrough
// ---------------------------------------------------------------------------

export interface PlayerState {
  currentSceneId: string
  traits: Record<string, number>
  /** String set serialized as an array for JSON compatibility */
  flags: string[]
  relationships: Record<string, number>
  /** Ordered list of scene IDs the player has visited */
  history: string[]
}

// ---------------------------------------------------------------------------
// Engine API surface types
// ---------------------------------------------------------------------------

export interface AvailableChoice {
  id: string
  text: string
  /** False when a gate exists but the current state doesn't satisfy it */
  available: boolean
}

export interface SceneView {
  scene: Scene
  availableChoices: AvailableChoice[]
  isEnding: boolean
}

export interface ChoiceResult {
  newState: PlayerState
  nextSceneView: SceneView
}

export interface EngineError {
  code: 'SCENE_NOT_FOUND' | 'CHOICE_NOT_FOUND' | 'CHOICE_UNAVAILABLE' | 'ALREADY_ENDED'
  message: string
}
