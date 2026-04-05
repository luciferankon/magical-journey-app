import { describe, it, expect } from 'vitest'
import { applyConsequences } from '@/lib/engine/engine'
import type { PlayerState, Consequence } from '@/lib/engine/types'

function makeState(overrides: Partial<PlayerState> = {}): PlayerState {
  return {
    currentSceneId: 'intro',
    traits: {},
    flags: [],
    relationships: {},
    history: ['intro'],
    ...overrides,
  }
}

describe('applyConsequences', () => {
  it('applies trait deltas additively', () => {
    const consequences: Consequence[] = [
      { type: 'trait_delta', trait: 'courage', delta: 2 },
      { type: 'trait_delta', trait: 'courage', delta: 1 },
    ]
    const result = applyConsequences(consequences, makeState({ traits: { courage: 0 } }))
    expect(result.traits.courage).toBe(3)
  })

  it('initialises a new trait from zero when first applied', () => {
    const result = applyConsequences(
      [{ type: 'trait_delta', trait: 'wisdom', delta: 1 }],
      makeState(),
    )
    expect(result.traits.wisdom).toBe(1)
  })

  it('supports negative trait deltas', () => {
    const result = applyConsequences(
      [{ type: 'trait_delta', trait: 'courage', delta: -1 }],
      makeState({ traits: { courage: 3 } }),
    )
    expect(result.traits.courage).toBe(2)
  })

  it('sets a flag', () => {
    const result = applyConsequences(
      [{ type: 'set_flag', flag: 'entered_wood' }],
      makeState(),
    )
    expect(result.flags).toContain('entered_wood')
  })

  it('does not duplicate flags on repeated set', () => {
    const result = applyConsequences(
      [{ type: 'set_flag', flag: 'entered_wood' }],
      makeState({ flags: ['entered_wood'] }),
    )
    expect(result.flags.filter((f) => f === 'entered_wood')).toHaveLength(1)
  })

  it('unsets a flag', () => {
    const result = applyConsequences(
      [{ type: 'unset_flag', flag: 'entered_wood' }],
      makeState({ flags: ['entered_wood', 'other_flag'] }),
    )
    expect(result.flags).not.toContain('entered_wood')
    expect(result.flags).toContain('other_flag')
  })

  it('unset on absent flag is a no-op', () => {
    const state = makeState({ flags: ['other_flag'] })
    const result = applyConsequences([{ type: 'unset_flag', flag: 'missing' }], state)
    expect(result.flags).toEqual(['other_flag'])
  })

  it('applies relationship deltas', () => {
    const result = applyConsequences(
      [{ type: 'relationship_delta', character: 'fox', delta: 3 }],
      makeState({ relationships: { fox: 0 } }),
    )
    expect(result.relationships.fox).toBe(3)
  })

  it('initialises a new relationship from zero', () => {
    const result = applyConsequences(
      [{ type: 'relationship_delta', character: 'keeper', delta: 1 }],
      makeState(),
    )
    expect(result.relationships.keeper).toBe(1)
  })

  it('does not mutate the input state', () => {
    const original = makeState({ traits: { courage: 1 }, flags: ['a'], relationships: { fox: 1 } })
    applyConsequences(
      [
        { type: 'trait_delta', trait: 'courage', delta: 5 },
        { type: 'set_flag', flag: 'b' },
        { type: 'relationship_delta', character: 'fox', delta: 10 },
      ],
      original,
    )
    expect(original.traits.courage).toBe(1)
    expect(original.flags).toEqual(['a'])
    expect(original.relationships.fox).toBe(1)
  })

  it('applies multiple mixed consequences in order', () => {
    const consequences: Consequence[] = [
      { type: 'trait_delta', trait: 'wisdom', delta: 1 },
      { type: 'set_flag', flag: 'wise_choice' },
      { type: 'relationship_delta', character: 'fox', delta: 2 },
      { type: 'unset_flag', flag: 'uncertain' },
    ]
    const state = makeState({ flags: ['uncertain'], relationships: { fox: 1 } })
    const result = applyConsequences(consequences, state)
    expect(result.traits.wisdom).toBe(1)
    expect(result.flags).toContain('wise_choice')
    expect(result.flags).not.toContain('uncertain')
    expect(result.relationships.fox).toBe(3)
  })
})
