import { describe, it, expect, vi } from 'vitest'
import {
  startGame,
  makeChoice,
  resumeGame,
  resolveAvailableChoices,
  isEngineError,
} from '@/lib/engine/engine'
import { createInitialState, setFlag, applyTrait } from '@/lib/state'
import type { Scene } from '@/lib/engine'
import type { PlayerState } from '@/lib/state'

// ---------------------------------------------------------------------------
// Mock the loader so tests do not hit the filesystem
// ---------------------------------------------------------------------------

vi.mock('@/lib/engine/loader', () => {
  const scenes: Record<string, Scene> = {
    intro: {
      id: 'intro',
      text: 'You are at the start.',
      choices: [
        {
          id: 'go_forest',
          text: 'Enter the forest.',
          consequences: [
            { type: 'trait_delta', trait: 'courage', delta: 1 },
            { type: 'set_flag', flag: 'witnessed_fracture' },
          ],
          next: 'forest',
        },
        {
          id: 'go_village',
          text: 'Return to the village.',
          consequences: [],
          next: 'village',
        },
        {
          id: 'use_secret',
          text: 'Use the secret passage.',
          gate: { type: 'flag_set', flag: 'house_assigned' },
          consequences: [{ type: 'set_flag', flag: 'class_success' }],
          next: 'secret_room',
        },
      ],
    },
    forest: {
      id: 'forest',
      text: 'Deep in the forest.',
      choices: [
        {
          id: 'brave_path',
          text: 'Take the brave path.',
          gate: { type: 'trait_gte', trait: 'courage', value: 5 },
          consequences: [],
          next: 'ending_glory',
        },
        {
          id: 'safe_path',
          text: 'Take the safe path.',
          consequences: [],
          next: 'village',
        },
      ],
    },
    village: {
      id: 'village',
      text: 'Back at the village.',
      choices: [{ id: 'rest', text: 'Rest.', consequences: [], next: 'ending_quiet' }],
    },
    secret_room: {
      id: 'secret_room',
      text: 'The secret room.',
      choices: [],
      isEnding: true,
    },
    ending_glory: {
      id: 'ending_glory',
      text: 'You achieved glory.',
      choices: [],
      isEnding: true,
    },
    ending_quiet: {
      id: 'ending_quiet',
      text: 'A quiet ending.',
      choices: [],
      isEnding: true,
    },
  }

  return {
    loadScene: (id: string) => {
      const scene = scenes[id]
      if (!scene) throw new Error(`Scene not found: "${id}"`)
      return scene
    },
    loadManifest: () => ({
      startSceneId: 'intro',
      initialState: {
        traits: { courage: 3, wisdom: 3 },
        relationships: {},
      },
      scenes: Object.keys(scenes),
    }),
  }
})

// ---------------------------------------------------------------------------
// Helper — build a full PlayerState at a given node
// ---------------------------------------------------------------------------

function makeState(nodeId = 'intro', mutate?: (s: PlayerState) => PlayerState): PlayerState {
  const base = createInitialState()
  const withNode: PlayerState = {
    ...base,
    progress: { ...base.progress, currentNodeId: nodeId, visitedNodes: [nodeId] },
  }
  return mutate ? mutate(withNode) : withNode
}

// ---------------------------------------------------------------------------
// startGame
// ---------------------------------------------------------------------------

describe('startGame', () => {
  it('returns the start scene id from the manifest', () => {
    const { state } = startGame()
    expect(state.progress.currentNodeId).toBe('intro')
  })

  it('visitedNodes contains the start scene', () => {
    const { state } = startGame()
    expect(state.progress.visitedNodes).toContain('intro')
  })

  it('traits are initialised at default values', () => {
    const { state } = startGame()
    expect(state.traits.courage).toBe(3)
    expect(state.traits.wisdom).toBe(3)
  })

  it('returns a scene view with choices', () => {
    const { sceneView } = startGame()
    expect(sceneView.scene.id).toBe('intro')
    expect(sceneView.availableChoices.length).toBeGreaterThan(0)
  })

  it('locked choices appear in availableChoices but with available: false', () => {
    const { sceneView } = startGame()
    const secret = sceneView.availableChoices.find((c) => c.id === 'use_secret')
    expect(secret).toBeDefined()
    expect(secret?.available).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// resolveAvailableChoices
// ---------------------------------------------------------------------------

describe('resolveAvailableChoices', () => {
  it('ungated choices are always available', () => {
    const { sceneView } = startGame()
    const goForest = sceneView.availableChoices.find((c) => c.id === 'go_forest')
    expect(goForest?.available).toBe(true)
  })

  it('gated choice unlocks when condition is met', () => {
    const state = makeState('intro', (s) => setFlag(s, 'house_assigned', true))
    const { scene } = startGame().sceneView
    const choices = resolveAvailableChoices(scene, state)
    const secret = choices.find((c) => c.id === 'use_secret')
    expect(secret?.available).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// makeChoice — happy paths
// ---------------------------------------------------------------------------

describe('makeChoice', () => {
  it('advances to the next scene', () => {
    const state = makeState()
    const result = makeChoice('go_forest', state)
    expect(isEngineError(result)).toBe(false)
    if (!isEngineError(result)) {
      expect(result.newState.progress.currentNodeId).toBe('forest')
    }
  })

  it('appends next scene to visitedNodes', () => {
    const state = makeState()
    const result = makeChoice('go_forest', state)
    if (!isEngineError(result)) {
      expect(result.newState.progress.visitedNodes).toContain('forest')
    }
  })

  it('applies consequences from the chosen choice', () => {
    const state = makeState()
    const result = makeChoice('go_forest', state)
    if (!isEngineError(result)) {
      expect(result.newState.traits.courage).toBe(4) // 3 + 1
      expect(result.newState.flags.witnessed_fracture).toBe(true)
    }
  })

  it('brave_path is locked when courage is below threshold after go_forest', () => {
    // go_forest gives courage +1 → courage = 4, but brave_path needs >= 5
    const state = makeState()
    const result = makeChoice('go_forest', state)
    if (!isEngineError(result)) {
      const bravePath = result.nextSceneView.availableChoices.find((c) => c.id === 'brave_path')
      expect(bravePath?.available).toBe(false)
    }
  })

  it('brave_path unlocks when courage already meets threshold', () => {
    const state = makeState('forest', (s) => applyTrait(s, 'courage', 2)) // courage = 5
    const result = makeChoice('brave_path', state)
    if (!isEngineError(result)) {
      expect(result.newState.progress.currentNodeId).toBe('ending_glory')
      expect(result.nextSceneView.isEnding).toBe(true)
    }
  })

  it('secret passage unlocks and advances correctly when gate flag is held', () => {
    const state = makeState('intro', (s) => setFlag(s, 'house_assigned', true))
    const result = makeChoice('use_secret', state)
    if (!isEngineError(result)) {
      expect(result.newState.progress.currentNodeId).toBe('secret_room')
      expect(result.newState.flags.class_success).toBe(true)
      expect(result.nextSceneView.isEnding).toBe(true)
    }
  })

  it('does not mutate the input state', () => {
    const state = makeState()
    const originalCourage = state.traits.courage
    const originalNodes = [...state.progress.visitedNodes]
    makeChoice('go_forest', state)
    expect(state.traits.courage).toBe(originalCourage)
    expect(state.progress.visitedNodes).toEqual(originalNodes)
  })

  // -------------------------------------------------------------------------
  // Error cases
  // -------------------------------------------------------------------------

  it('returns CHOICE_NOT_FOUND for an unknown choice id', () => {
    const result = makeChoice('nonexistent', makeState())
    expect(isEngineError(result)).toBe(true)
    if (isEngineError(result)) expect(result.code).toBe('CHOICE_NOT_FOUND')
  })

  it('returns CHOICE_UNAVAILABLE when gate is not satisfied', () => {
    const result = makeChoice('use_secret', makeState()) // house_assigned = false
    expect(isEngineError(result)).toBe(true)
    if (isEngineError(result)) expect(result.code).toBe('CHOICE_UNAVAILABLE')
  })

  it('returns ALREADY_ENDED when current scene is an ending', () => {
    const endState = makeState('ending_glory')
    const result = makeChoice('any_choice', endState)
    expect(isEngineError(result)).toBe(true)
    if (isEngineError(result)) expect(result.code).toBe('ALREADY_ENDED')
  })

  it('returns SCENE_NOT_FOUND when currentNodeId is invalid', () => {
    const badState = makeState('ghost_scene')
    const result = makeChoice('go_forest', badState)
    expect(isEngineError(result)).toBe(true)
    if (isEngineError(result)) expect(result.code).toBe('SCENE_NOT_FOUND')
  })
})

// ---------------------------------------------------------------------------
// resumeGame
// ---------------------------------------------------------------------------

describe('resumeGame', () => {
  it('returns the current scene view for a valid state', () => {
    const state = makeState('forest')
    const view = resumeGame(state)
    expect(isEngineError(view)).toBe(false)
    if (!isEngineError(view)) {
      expect(view.scene.id).toBe('forest')
    }
  })

  it('returns SCENE_NOT_FOUND for an unknown scene', () => {
    const state = makeState('nowhere')
    const view = resumeGame(state)
    expect(isEngineError(view)).toBe(true)
    if (isEngineError(view)) expect(view.code).toBe('SCENE_NOT_FOUND')
  })

  it('correctly shows gated choices as unavailable during resume', () => {
    const state = makeState('forest') // courage = 3, brave_path needs >= 5
    const view = resumeGame(state)
    if (!isEngineError(view)) {
      const brave = view.availableChoices.find((c) => c.id === 'brave_path')
      expect(brave?.available).toBe(false)
    }
  })
})

// ---------------------------------------------------------------------------
// isEngineError
// ---------------------------------------------------------------------------

describe('isEngineError', () => {
  it('identifies an engine error object', () => {
    expect(isEngineError({ code: 'SCENE_NOT_FOUND', message: 'nope' })).toBe(true)
  })

  it('rejects non-error objects', () => {
    expect(isEngineError({ newState: {}, nextSceneView: {} })).toBe(false)
    expect(isEngineError(null)).toBe(false)
    expect(isEngineError('string')).toBe(false)
  })
})
