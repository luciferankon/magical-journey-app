import { describe, it, expect } from 'vitest'
import { evaluateGate } from '@/lib/engine/engine'
import type { PlayerState, GateCondition } from '@/lib/engine/types'

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

describe('evaluateGate', () => {
  describe('trait_gte', () => {
    it('passes when trait equals threshold', () => {
      const gate: GateCondition = { type: 'trait_gte', trait: 'courage', value: 1 }
      expect(evaluateGate(gate, makeState({ traits: { courage: 1 } }))).toBe(true)
    })

    it('passes when trait exceeds threshold', () => {
      const gate: GateCondition = { type: 'trait_gte', trait: 'courage', value: 1 }
      expect(evaluateGate(gate, makeState({ traits: { courage: 3 } }))).toBe(true)
    })

    it('fails when trait is below threshold', () => {
      const gate: GateCondition = { type: 'trait_gte', trait: 'courage', value: 2 }
      expect(evaluateGate(gate, makeState({ traits: { courage: 1 } }))).toBe(false)
    })

    it('treats missing trait as 0', () => {
      const gate: GateCondition = { type: 'trait_gte', trait: 'courage', value: 1 }
      expect(evaluateGate(gate, makeState())).toBe(false)
    })
  })

  describe('trait_lte', () => {
    it('passes when trait equals threshold', () => {
      const gate: GateCondition = { type: 'trait_lte', trait: 'hubris', value: 2 }
      expect(evaluateGate(gate, makeState({ traits: { hubris: 2 } }))).toBe(true)
    })

    it('fails when trait exceeds threshold', () => {
      const gate: GateCondition = { type: 'trait_lte', trait: 'hubris', value: 2 }
      expect(evaluateGate(gate, makeState({ traits: { hubris: 3 } }))).toBe(false)
    })
  })

  describe('flag_set / flag_unset', () => {
    it('flag_set passes when flag is present', () => {
      const gate: GateCondition = { type: 'flag_set', flag: 'entered_wood' }
      expect(evaluateGate(gate, makeState({ flags: ['entered_wood'] }))).toBe(true)
    })

    it('flag_set fails when flag is absent', () => {
      const gate: GateCondition = { type: 'flag_set', flag: 'entered_wood' }
      expect(evaluateGate(gate, makeState())).toBe(false)
    })

    it('flag_unset passes when flag is absent', () => {
      const gate: GateCondition = { type: 'flag_unset', flag: 'turned_back' }
      expect(evaluateGate(gate, makeState())).toBe(true)
    })

    it('flag_unset fails when flag is present', () => {
      const gate: GateCondition = { type: 'flag_unset', flag: 'turned_back' }
      expect(evaluateGate(gate, makeState({ flags: ['turned_back'] }))).toBe(false)
    })
  })

  describe('relationship_gte / relationship_lte', () => {
    it('relationship_gte passes when value meets threshold', () => {
      const gate: GateCondition = { type: 'relationship_gte', character: 'fox', value: 3 }
      expect(evaluateGate(gate, makeState({ relationships: { fox: 3 } }))).toBe(true)
    })

    it('relationship_gte fails when value is below', () => {
      const gate: GateCondition = { type: 'relationship_gte', character: 'fox', value: 3 }
      expect(evaluateGate(gate, makeState({ relationships: { fox: 2 } }))).toBe(false)
    })

    it('treats missing relationship as 0', () => {
      const gate: GateCondition = { type: 'relationship_gte', character: 'fox', value: 1 }
      expect(evaluateGate(gate, makeState())).toBe(false)
    })
  })

  describe('compound gates', () => {
    it('and: passes only when all sub-conditions pass', () => {
      const gate: GateCondition = {
        type: 'and',
        conditions: [
          { type: 'trait_gte', trait: 'courage', value: 1 },
          { type: 'flag_set', flag: 'entered_wood' },
        ],
      }
      expect(evaluateGate(gate, makeState({ traits: { courage: 1 }, flags: ['entered_wood'] }))).toBe(true)
      expect(evaluateGate(gate, makeState({ traits: { courage: 1 } }))).toBe(false)
      expect(evaluateGate(gate, makeState({ flags: ['entered_wood'] }))).toBe(false)
    })

    it('or: passes when at least one sub-condition passes', () => {
      const gate: GateCondition = {
        type: 'or',
        conditions: [
          { type: 'trait_gte', trait: 'courage', value: 2 },
          { type: 'trait_gte', trait: 'wisdom', value: 2 },
        ],
      }
      expect(evaluateGate(gate, makeState({ traits: { courage: 2 } }))).toBe(true)
      expect(evaluateGate(gate, makeState({ traits: { wisdom: 2 } }))).toBe(true)
      expect(evaluateGate(gate, makeState({ traits: { courage: 1, wisdom: 1 } }))).toBe(false)
    })

    it('not: inverts the inner condition', () => {
      const gate: GateCondition = {
        type: 'not',
        condition: { type: 'flag_set', flag: 'betrayed_fox' },
      }
      expect(evaluateGate(gate, makeState())).toBe(true)
      expect(evaluateGate(gate, makeState({ flags: ['betrayed_fox'] }))).toBe(false)
    })

    it('deeply nested and/or/not', () => {
      // courage >= 1 AND (NOT flag:coward OR wisdom >= 2)
      const gate: GateCondition = {
        type: 'and',
        conditions: [
          { type: 'trait_gte', trait: 'courage', value: 1 },
          {
            type: 'or',
            conditions: [
              { type: 'not', condition: { type: 'flag_set', flag: 'coward' } },
              { type: 'trait_gte', trait: 'wisdom', value: 2 },
            ],
          },
        ],
      }
      // courage=1, no coward flag → passes
      expect(evaluateGate(gate, makeState({ traits: { courage: 1 } }))).toBe(true)
      // courage=1, coward flag, wisdom=1 → fails
      expect(evaluateGate(gate, makeState({ traits: { courage: 1, wisdom: 1 }, flags: ['coward'] }))).toBe(false)
      // courage=1, coward flag, wisdom=2 → passes via OR branch
      expect(evaluateGate(gate, makeState({ traits: { courage: 1, wisdom: 2 }, flags: ['coward'] }))).toBe(true)
      // courage=0, no flag → fails outer and
      expect(evaluateGate(gate, makeState())).toBe(false)
    })
  })
})
