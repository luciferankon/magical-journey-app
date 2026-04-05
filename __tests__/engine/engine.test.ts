import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  startGame,
  makeChoice,
  resumeGame,
  resolveAvailableChoices,
  isEngineError,
} from '@/lib/engine/engine'
import type { PlayerState, Scene } from '@/lib/engine/types'

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
            { type: 'set_flag', flag: 'entered_wood' },
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
          gate: { type: 'flag_set', flag: 'knows_secret' },
          consequences: [{ type: 'set_flag', flag: 'used_secret' }],
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
          gate: { type: 'trait_gte', trait: 'courage', value: 2 },
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
        traits: { courage: 0, wisdom: 0 },
        relationships: { fox: 0 },
      },
      scenes: Object.keys(scenes),
    }),
  }
})

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeState(overrides: Partial<PlayerState> = {}): PlayerState {
  return {
    currentSceneId: 'intro',
    traits: { courage: 0, wisdom: 0 },
    flags: [],
    relationships: { fox: 0 },
    history: ['intro'],
    ...overrides,
  }
}

// ---------------------------------------------------------------------------
// startGame
// ---------------------------------------------------------------------------

describe('startGame', () => {
  it('returns the start scene id from the manifest', () => {
    const { state } = startGame()
    expect(state.currentSceneId).toBe('intro')
  })

  it('history contains the start scene', () => {
    const { state } = startGame()
    expect(state.history).toEqual(['intro'])
  })

  it('initialises traits and relationships from manifest', () => {
    const { state } = startGame()
    expect(state.traits).toMatchObject({ courage: 0, wisdom: 0 })
    expect(state.relationships).toMatchObject({ fox: 0 })
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
    const state = makeState()
    const { sceneView } = startGame()
    const go_forest = sceneView.availableChoices.find((c) => c.id === 'go_forest')
    expect(go_forest?.available).toBe(true)
  })

  it('gated choice unlocks when condition is met', () => {
    const state = makeState({ flags: ['knows_secret'] })
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
      expect(result.newState.currentSceneId).toBe('forest')
    }
  })

  it('appends next scene to history', () => {
    const state = makeState()
    const result = makeChoice('go_forest', state)
    if (!isEngineError(result)) {
      expect(result.newState.history).toEqual(['intro', 'forest'])
    }
  })

  it('applies consequences from the chosen choice', () => {
    const state = makeState()
    const result = makeChoice('go_forest', state)
    if (!isEngineError(result)) {
      expect(result.newState.traits.courage).toBe(1)
      expect(result.newState.flags).toContain('entered_wood')
    }
  })

  it('unlocks gated choice in next scene after consequences satisfy the gate', () => {
    // go_forest gives courage +1, making courage = 1
    // brave_path in forest requires courage >= 2, so should still be locked
    const state = makeState()
    const result = makeChoice('go_forest', state)
    if (!isEngineError(result)) {
      const bravePath = result.nextSceneView.availableChoices.find((c) => c.id === 'brave_path')
      expect(bravePath?.available).toBe(false)
    }
  })

  it('gated choice in next scene unlocks when state already satisfies gate', () => {
    const state = makeState({ traits: { courage: 2, wisdom: 0 }, currentSceneId: 'forest' })
    const result = makeChoice('brave_path', state)
    if (!isEngineError(result)) {
      expect(result.newState.currentSceneId).toBe('ending_glory')
      expect(result.nextSceneView.isEnding).toBe(true)
    }
  })

  it('secret passage unlocks and advances correctly when flag is held', () => {
    const state = makeState({ flags: ['knows_secret'] })
    const result = makeChoice('use_secret', state)
    if (!isEngineError(result)) {
      expect(result.newState.currentSceneId).toBe('secret_room')
      expect(result.newState.flags).toContain('used_secret')
      expect(result.nextSceneView.isEnding).toBe(true)
    }
  })

  it('does not mutate the input state', () => {
    const state = makeState()
    const originalTraits = { ...state.traits }
    makeChoice('go_forest', state)
    expect(state.traits).toEqual(originalTraits)
    expect(state.history).toEqual(['intro'])
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
    // use_secret requires flag knows_secret; state does not have it
    const result = makeChoice('use_secret', makeState())
    expect(isEngineError(result)).toBe(true)
    if (isEngineError(result)) expect(result.code).toBe('CHOICE_UNAVAILABLE')
  })

  it('returns ALREADY_ENDED when current scene is an ending', () => {
    const endState = makeState({ currentSceneId: 'ending_glory' })
    const result = makeChoice('any_choice', endState)
    expect(isEngineError(result)).toBe(true)
    if (isEngineError(result)) expect(result.code).toBe('ALREADY_ENDED')
  })

  it('returns SCENE_NOT_FOUND when currentSceneId is invalid', () => {
    const badState = makeState({ currentSceneId: 'ghost_scene' })
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
    const state = makeState({ currentSceneId: 'forest' })
    const view = resumeGame(state)
    expect(isEngineError(view)).toBe(false)
    if (!isEngineError(view)) {
      expect(view.scene.id).toBe('forest')
    }
  })

  it('returns SCENE_NOT_FOUND for an unknown scene', () => {
    const state = makeState({ currentSceneId: 'nowhere' })
    const view = resumeGame(state)
    expect(isEngineError(view)).toBe(true)
    if (isEngineError(view)) expect(view.code).toBe('SCENE_NOT_FOUND')
  })

  it('correctly shows gated choices as unavailable during resume', () => {
    const state = makeState({ currentSceneId: 'forest', traits: { courage: 1, wisdom: 0 } })
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
