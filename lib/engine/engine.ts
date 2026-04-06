import type {
  GateCondition,
  Consequence,
  Scene,
  AvailableChoice,
  SceneView,
  ChoiceResult,
  EngineError,
} from './types'
import type { PlayerState, TraitKey, RelationshipKey, FlagKey, ChapterExports } from '@/lib/state'
import {
  createInitialState,
  applyTrait,
  applyRelationship,
  setFlag,
  setChapterExports,
  advanceToNode,
  advanceChapter,
} from '@/lib/state'
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
      return (state.traits[condition.trait as TraitKey] ?? 0) >= condition.value

    case 'trait_lte':
      return (state.traits[condition.trait as TraitKey] ?? 0) <= condition.value

    case 'flag_set':
      return state.flags[condition.flag as FlagKey] === true

    case 'flag_unset':
      return !state.flags[condition.flag as FlagKey]

    case 'relationship_gte':
      return (state.relationships[condition.character as RelationshipKey] ?? 0) >= condition.value

    case 'relationship_lte':
      return (state.relationships[condition.character as RelationshipKey] ?? 0) <= condition.value

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
 * Apply a list of engine consequences to state, returning a new PlayerState.
 * Uses the state module's typed mutation functions to ensure clamping and
 * meta.lastUpdatedAt are always applied correctly.
 */
export function applyConsequences(
  consequences: Consequence[],
  state: PlayerState,
): PlayerState {
  let s = state
  for (const c of consequences) {
    switch (c.type) {
      case 'trait_delta':
        s = applyTrait(s, c.trait as TraitKey, c.delta)
        break
      case 'set_flag':
        s = setFlag(s, c.flag as FlagKey, true)
        break
      case 'unset_flag':
        s = setFlag(s, c.flag as FlagKey, false)
        break
      case 'relationship_delta':
        s = applyRelationship(s, c.character as RelationshipKey, c.delta)
        break
      case 'set_chapter_export':
        s = setChapterExports(s, { [c.field]: c.value } as Partial<ChapterExports>)
        break
      case 'advance_chapter':
        s = advanceChapter(s)
        break
    }
  }
  return s
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
 * Initialise a brand-new game state.
 * Returns the starting scene view alongside the initial state.
 */
export function startGame(): { state: PlayerState; sceneView: SceneView } {
  const manifest = loadManifest()
  const startScene = loadScene(manifest.startSceneId)
  const state = advanceToNode(createInitialState(), startScene.id)
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
  const currentNodeId = state.progress.currentNodeId

  let currentScene: Scene
  try {
    currentScene = loadScene(currentNodeId)
  } catch {
    return { code: 'SCENE_NOT_FOUND', message: `Scene "${currentNodeId}" not found` }
  }

  if (currentScene.isEnding) {
    return { code: 'ALREADY_ENDED', message: 'The story has already ended' }
  }

  const choice = currentScene.choices.find((c) => c.id === choiceId)
  if (!choice) {
    return {
      code: 'CHOICE_NOT_FOUND',
      message: `Choice "${choiceId}" does not exist in scene "${currentNodeId}"`,
    }
  }

  if (choice.gate != null && !evaluateGate(choice.gate, state)) {
    return {
      code: 'CHOICE_UNAVAILABLE',
      message: `Choice "${choiceId}" is locked — gate condition not met`,
    }
  }

  let nextScene: Scene
  try {
    nextScene = loadScene(choice.next)
  } catch {
    return { code: 'SCENE_NOT_FOUND', message: `Next scene "${choice.next}" not found` }
  }

  const newState = advanceToNode(
    applyConsequences(choice.consequences, state),
    nextScene.id,
  )

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
  const currentNodeId = state.progress.currentNodeId
  let scene: Scene
  try {
    scene = loadScene(currentNodeId)
  } catch {
    return { code: 'SCENE_NOT_FOUND', message: `Scene "${currentNodeId}" not found` }
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
