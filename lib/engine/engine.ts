import type {
  GateCondition,
  Consequence,
  PlayerState,
  Scene,
  AvailableChoice,
  SceneView,
  ChoiceResult,
  EngineError,
} from './types'
import { loadScene, loadManifest } from './loader'

// ---------------------------------------------------------------------------
// Gate evaluation
// ---------------------------------------------------------------------------

/**
 * Evaluate a gate condition against the current player state.
 * Returns true when the condition is satisfied.
 */
export function evaluateGate(condition: GateCondition, state: PlayerState): boolean {
  switch (condition.type) {
    case 'trait_gte':
      return (state.traits[condition.trait] ?? 0) >= condition.value

    case 'trait_lte':
      return (state.traits[condition.trait] ?? 0) <= condition.value

    case 'flag_set':
      return state.flags.includes(condition.flag)

    case 'flag_unset':
      return !state.flags.includes(condition.flag)

    case 'relationship_gte':
      return (state.relationships[condition.character] ?? 0) >= condition.value

    case 'relationship_lte':
      return (state.relationships[condition.character] ?? 0) <= condition.value

    case 'and':
      return condition.conditions.every((c) => evaluateGate(c, state))

    case 'or':
      return condition.conditions.some((c) => evaluateGate(c, state))

    case 'not':
      return !evaluateGate(condition.condition, state)
  }
}

// ---------------------------------------------------------------------------
// Consequence application
// ---------------------------------------------------------------------------

/**
 * Apply a list of consequences to state and return the updated state.
 * Never mutates the input — always returns a new state object.
 */
export function applyConsequences(
  consequences: Consequence[],
  state: PlayerState,
): PlayerState {
  let traits = { ...state.traits }
  let flags = [...state.flags]
  let relationships = { ...state.relationships }

  for (const c of consequences) {
    switch (c.type) {
      case 'trait_delta':
        traits = { ...traits, [c.trait]: (traits[c.trait] ?? 0) + c.delta }
        break

      case 'set_flag':
        if (!flags.includes(c.flag)) {
          flags = [...flags, c.flag]
        }
        break

      case 'unset_flag':
        flags = flags.filter((f) => f !== c.flag)
        break

      case 'relationship_delta':
        relationships = {
          ...relationships,
          [c.character]: (relationships[c.character] ?? 0) + c.delta,
        }
        break
    }
  }

  return { ...state, traits, flags, relationships }
}

// ---------------------------------------------------------------------------
// Scene helpers
// ---------------------------------------------------------------------------

/**
 * Build the list of available choices for a scene given current state.
 * Choices without a gate are always available.
 * Choices with a gate are present but marked available: false when locked.
 */
export function resolveAvailableChoices(
  scene: Scene,
  state: PlayerState,
): AvailableChoice[] {
  return scene.choices.map((choice) => ({
    id: choice.id,
    text: choice.text,
    available: choice.gate == null || evaluateGate(choice.gate, state),
  }))
}

function buildSceneView(scene: Scene, state: PlayerState): SceneView {
  return {
    scene,
    availableChoices: resolveAvailableChoices(scene, state),
    isEnding: scene.isEnding === true,
  }
}

// ---------------------------------------------------------------------------
// Engine API
// ---------------------------------------------------------------------------

/**
 * Initialise a brand-new game state from the content manifest.
 * Returns the starting scene view alongside the initial state.
 */
export function startGame(): { state: PlayerState; sceneView: SceneView } {
  const manifest = loadManifest()
  const startScene = loadScene(manifest.startSceneId)

  const state: PlayerState = {
    currentSceneId: manifest.startSceneId,
    traits: { ...manifest.initialState.traits },
    flags: [],
    relationships: { ...manifest.initialState.relationships },
    history: [manifest.startSceneId],
  }

  return { state, sceneView: buildSceneView(startScene, state) }
}

/**
 * Process a player's choice.
 *
 * Validates the choice against the current scene and state, applies
 * consequences, advances the narrative position, and returns the next
 * scene view plus the updated state.
 *
 * Returns an EngineError discriminant on failure — never throws.
 */
export function makeChoice(
  choiceId: string,
  state: PlayerState,
): ChoiceResult | EngineError {
  // Guard: already at an ending
  let currentScene: Scene
  try {
    currentScene = loadScene(state.currentSceneId)
  } catch {
    return { code: 'SCENE_NOT_FOUND', message: `Scene "${state.currentSceneId}" not found` }
  }

  if (currentScene.isEnding) {
    return { code: 'ALREADY_ENDED', message: 'The story has already ended' }
  }

  // Find the chosen choice
  const choice = currentScene.choices.find((c) => c.id === choiceId)
  if (!choice) {
    return {
      code: 'CHOICE_NOT_FOUND',
      message: `Choice "${choiceId}" does not exist in scene "${state.currentSceneId}"`,
    }
  }

  // Gate check
  if (choice.gate != null && !evaluateGate(choice.gate, state)) {
    return {
      code: 'CHOICE_UNAVAILABLE',
      message: `Choice "${choiceId}" is locked — gate condition not met`,
    }
  }

  // Apply consequences
  const stateAfterConsequences = applyConsequences(choice.consequences, state)

  // Load next scene
  let nextScene: Scene
  try {
    nextScene = loadScene(choice.next)
  } catch {
    return { code: 'SCENE_NOT_FOUND', message: `Next scene "${choice.next}" not found` }
  }

  // Advance narrative position
  const newState: PlayerState = {
    ...stateAfterConsequences,
    currentSceneId: nextScene.id,
    history: [...stateAfterConsequences.history, nextScene.id],
  }

  return {
    newState,
    nextSceneView: buildSceneView(nextScene, newState),
  }
}

/**
 * Resume a game from serialised state and return the current scene view.
 * Use this to hydrate a session from storage.
 */
export function resumeGame(state: PlayerState): SceneView | EngineError {
  let scene: Scene
  try {
    scene = loadScene(state.currentSceneId)
  } catch {
    return { code: 'SCENE_NOT_FOUND', message: `Scene "${state.currentSceneId}" not found` }
  }
  return buildSceneView(scene, state)
}

// ---------------------------------------------------------------------------
// Type guard
// ---------------------------------------------------------------------------

export function isEngineError(value: unknown): value is EngineError {
  return (
    typeof value === 'object' &&
    value !== null &&
    'code' in value &&
    'message' in value
  )
}
