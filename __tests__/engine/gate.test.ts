import { describe, it, expect } from 'vitest'
import { evaluateGate } from '@/lib/engine/engine'
import { createInitialState, applyTrait, applyRelationship, setFlag } from '@/lib/state'
import type { GateCondition } from '@/lib/engine'

describe('evaluateGate', () => {
  describe('trait_gte', () => {
    it('passes when trait equals threshold', () => {
      const gate: GateCondition = { type: 'trait_gte', trait: 'courage', value: 3 }
      expect(evaluateGate(gate, createInitialState())).toBe(true)
    })

    it('passes when trait exceeds threshold', () => {
      const gate: GateCondition = { type: 'trait_gte', trait: 'courage', value: 2 }
      expect(evaluateGate(gate, createInitialState())).toBe(true)
    })

    it('fails when trait is below threshold', () => {
      const gate: GateCondition = { type: 'trait_gte', trait: 'courage', value: 4 }
      expect(evaluateGate(gate, createInitialState())).toBe(false)
    })
  })

  describe('trait_lte', () => {
    it('passes when trait equals threshold', () => {
      const gate: GateCondition = { type: 'trait_lte', trait: 'cunning', value: 3 }
      expect(evaluateGate(gate, createInitialState())).toBe(true)
    })

    it('fails when trait exceeds threshold', () => {
      const gate: GateCondition = { type: 'trait_lte', trait: 'cunning', value: 2 }
      expect(evaluateGate(gate, createInitialState())).toBe(false)
    })
  })

  describe('flag_set / flag_unset', () => {
    it('flag_set passes when flag is true', () => {
      const gate: GateCondition = { type: 'flag_set', flag: 'witnessed_fracture' }
      const state = setFlag(createInitialState(), 'witnessed_fracture', true)
      expect(evaluateGate(gate, state)).toBe(true)
    })

    it('flag_set fails when flag is false', () => {
      const gate: GateCondition = { type: 'flag_set', flag: 'witnessed_fracture' }
      expect(evaluateGate(gate, createInitialState())).toBe(false)
    })

    it('flag_unset passes when flag is false', () => {
      const gate: GateCondition = { type: 'flag_unset', flag: 'crisis_fled' }
      expect(evaluateGate(gate, createInitialState())).toBe(true)
    })

    it('flag_unset fails when flag is true', () => {
      const gate: GateCondition = { type: 'flag_unset', flag: 'crisis_fled' }
      const state = setFlag(createInitialState(), 'crisis_fled', true)
      expect(evaluateGate(gate, state)).toBe(false)
    })
  })

  describe('relationship_gte / relationship_lte', () => {
    it('relationship_gte passes when value meets threshold', () => {
      const gate: GateCondition = { type: 'relationship_gte', character: 'sera_trust', value: 3 }
      const state = applyRelationship(createInitialState(), 'sera_trust', 3)
      expect(evaluateGate(gate, state)).toBe(true)
    })

    it('relationship_gte fails when value is below', () => {
      const gate: GateCondition = { type: 'relationship_gte', character: 'sera_trust', value: 3 }
      const state = applyRelationship(createInitialState(), 'sera_trust', 2)
      expect(evaluateGate(gate, state)).toBe(false)
    })

    it('relationship_gte fails at default value (0)', () => {
      const gate: GateCondition = { type: 'relationship_gte', character: 'sera_trust', value: 1 }
      expect(evaluateGate(gate, createInitialState())).toBe(false)
    })
  })

  describe('compound gates', () => {
    it('and: passes only when all sub-conditions pass', () => {
      const gate: GateCondition = {
        type: 'and',
        conditions: [
          { type: 'trait_gte', trait: 'courage', value: 3 },
          { type: 'flag_set', flag: 'witnessed_fracture' },
        ],
      }
      const withFlag = setFlag(createInitialState(), 'witnessed_fracture', true)
      expect(evaluateGate(gate, withFlag)).toBe(true)
      expect(evaluateGate(gate, createInitialState())).toBe(false) // missing flag
      const lowCourageWithFlag = setFlag(applyTrait(createInitialState(), 'courage', -3), 'witnessed_fracture', true)
      expect(evaluateGate(gate, lowCourageWithFlag)).toBe(false) // low courage
    })

    it('or: passes when at least one sub-condition passes', () => {
      const gate: GateCondition = {
        type: 'or',
        conditions: [
          { type: 'trait_gte', trait: 'courage', value: 5 },
          { type: 'trait_gte', trait: 'wisdom', value: 5 },
        ],
      }
      expect(evaluateGate(gate, applyTrait(createInitialState(), 'courage', 2))).toBe(true)
      expect(evaluateGate(gate, applyTrait(createInitialState(), 'wisdom', 2))).toBe(true)
      expect(evaluateGate(gate, createInitialState())).toBe(false) // both at 3
    })

    it('not: inverts the inner condition', () => {
      const gate: GateCondition = {
        type: 'not',
        condition: { type: 'flag_set', flag: 'sided_with_lira' },
      }
      expect(evaluateGate(gate, createInitialState())).toBe(true)
      expect(evaluateGate(gate, setFlag(createInitialState(), 'sided_with_lira', true))).toBe(false)
    })

    it('deeply nested and/or/not', () => {
      // courage >= 4 AND (NOT flag:crisis_fled OR wisdom >= 5)
      const gate: GateCondition = {
        type: 'and',
        conditions: [
          { type: 'trait_gte', trait: 'courage', value: 4 },
          {
            type: 'or',
            conditions: [
              { type: 'not', condition: { type: 'flag_set', flag: 'crisis_fled' } },
              { type: 'trait_gte', trait: 'wisdom', value: 5 },
            ],
          },
        ],
      }
      const highCourage = applyTrait(createInitialState(), 'courage', 1) // courage = 4
      expect(evaluateGate(gate, highCourage)).toBe(true) // courage=4, no crisis_fled
      const fled = setFlag(highCourage, 'crisis_fled', true)
      expect(evaluateGate(gate, fled)).toBe(false) // courage=4, fled, wisdom=3
      const fledHighWisdom = applyTrait(fled, 'wisdom', 2) // wisdom = 5
      expect(evaluateGate(gate, fledHighWisdom)).toBe(true) // passes via OR branch
      expect(evaluateGate(gate, createInitialState())).toBe(false) // courage=3 < 4
    })
  })
})
