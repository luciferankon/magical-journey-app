/**
 * Chapter 3 gate evaluation tests.
 *
 * Covers G09 (CONCLAVE_STANDING_GATE) and G10 (VOTE_OUTCOME_GATE) from the
 * Chapter 3 scene graph, plus the ines_contact relationship meter introduced
 * in schema V3.
 */
import { describe, it, expect } from 'vitest'
import { evaluateGate, applyConsequences } from '@/lib/engine/engine'
import { createInitialState, applyRelationship, setFlag, applyTrait } from '@/lib/state'
import type { GateCondition, Consequence } from '@/lib/engine'

// ── Helpers ───────────────────────────────────────────────────────────────────

function withInesContact(n: number) {
  return applyRelationship(createInitialState(), 'ines_contact', n)
}

function withSolisStanding(n: number) {
  return applyRelationship(createInitialState(), 'solis_standing', n)
}

// ── ines_contact relationship ─────────────────────────────────────────────────

describe('ines_contact relationship meter', () => {
  it('starts at 0 by default', () => {
    expect(createInitialState().relationships.ines_contact).toBe(0)
  })

  it('can be raised via relationship_delta consequence', () => {
    const state = applyConsequences(
      [{ type: 'relationship_delta', character: 'ines_contact', delta: 2 }],
      createInitialState(),
    )
    expect(state.relationships.ines_contact).toBe(2)
  })

  it('clamps at RELATIONSHIP_MAX (10)', () => {
    const state = applyConsequences(
      [{ type: 'relationship_delta', character: 'ines_contact', delta: 99 }],
      createInitialState(),
    )
    expect(state.relationships.ines_contact).toBe(10)
  })

  it('clamps at RELATIONSHIP_MIN (0)', () => {
    const state = applyConsequences(
      [{ type: 'relationship_delta', character: 'ines_contact', delta: -99 }],
      createInitialState(),
    )
    expect(state.relationships.ines_contact).toBe(0)
  })
})

// ── Chapter 3 flag consequences ───────────────────────────────────────────────

describe('chapter 3 flags via set_flag consequence', () => {
  const ch3Flags = [
    'sera_truth_known',
    'caden_aligned',
    'fracture_origin_known',
    'conclave_split',
    'aldric_acts',
  ] as const

  for (const flag of ch3Flags) {
    it(`sets ${flag}`, () => {
      const state = applyConsequences(
        [{ type: 'set_flag', flag }],
        createInitialState(),
      )
      expect(state.flags[flag]).toBe(true)
    })
  }
})

// ── G09: CONCLAVE_STANDING_GATE ───────────────────────────────────────────────
// condition: solis_standing >= 4 OR ines_contact >= 4

describe('G09_CONCLAVE_STANDING_GATE: solis_standing >= 4 OR ines_contact >= 4', () => {
  const g09: GateCondition = {
    type: 'or',
    conditions: [
      { type: 'relationship_gte', character: 'solis_standing', value: 4 },
      { type: 'relationship_gte', character: 'ines_contact', value: 4 },
    ],
  }

  it('fails when both meters are below threshold', () => {
    const state = applyRelationship(withSolisStanding(3), 'ines_contact', 3)
    expect(evaluateGate(g09, state)).toBe(false)
  })

  it('passes when solis_standing meets threshold', () => {
    expect(evaluateGate(g09, withSolisStanding(4))).toBe(true)
  })

  it('passes when ines_contact meets threshold', () => {
    expect(evaluateGate(g09, withInesContact(4))).toBe(true)
  })

  it('passes when both meet threshold', () => {
    const state = applyRelationship(withSolisStanding(5), 'ines_contact', 5)
    expect(evaluateGate(g09, state)).toBe(true)
  })

  it('fails when meters are at 0', () => {
    expect(evaluateGate(g09, createInitialState())).toBe(false)
  })
})

// ── G10: VOTE_OUTCOME_GATE ────────────────────────────────────────────────────
// condition: (fracture_origin_known AND (ines_contact >= 4 OR solis_standing >= 3 OR aldric_acts))
//            AND (caden_aligned OR sera_truth_known OR tomas_bond >= 5)

describe('G10_VOTE_OUTCOME_GATE: full composite condition', () => {
  const g10: GateCondition = {
    type: 'and',
    conditions: [
      { type: 'flag_set', flag: 'fracture_origin_known' },
      {
        type: 'or',
        conditions: [
          { type: 'relationship_gte', character: 'ines_contact', value: 4 },
          { type: 'relationship_gte', character: 'solis_standing', value: 3 },
          { type: 'flag_set', flag: 'aldric_acts' },
        ],
      },
      {
        type: 'or',
        conditions: [
          { type: 'flag_set', flag: 'caden_aligned' },
          { type: 'flag_set', flag: 'sera_truth_known' },
          { type: 'relationship_gte', character: 'tomas_bond', value: 5 },
        ],
      },
    ],
  }

  function baseState() {
    // fracture_origin_known + ines_contact 4 + caden_aligned — should pass
    return setFlag(
      setFlag(applyRelationship(createInitialState(), 'ines_contact', 4), 'fracture_origin_known', true),
      'caden_aligned',
      true,
    )
  }

  it('passes when all three conjuncts are satisfied', () => {
    expect(evaluateGate(g10, baseState())).toBe(true)
  })

  it('fails when fracture_origin_known is not set', () => {
    const state = setFlag(applyRelationship(createInitialState(), 'ines_contact', 4), 'caden_aligned', true)
    expect(evaluateGate(g10, state)).toBe(false)
  })

  it('fails when no inside-access condition is met', () => {
    // fracture_origin_known + caden_aligned, but ines_contact/solis_standing/aldric_acts all low
    const state = setFlag(
      setFlag(createInitialState(), 'fracture_origin_known', true),
      'caden_aligned',
      true,
    )
    expect(evaluateGate(g10, state)).toBe(false)
  })

  it('fails when no ally condition is met', () => {
    // fracture_origin_known + ines_contact 4, but no caden/sera/tomas
    const state = setFlag(
      applyRelationship(createInitialState(), 'ines_contact', 4),
      'fracture_origin_known',
      true,
    )
    expect(evaluateGate(g10, state)).toBe(false)
  })

  it('passes via aldric_acts as inside access', () => {
    const state = setFlag(
      setFlag(setFlag(createInitialState(), 'fracture_origin_known', true), 'aldric_acts', true),
      'sera_truth_known',
      true,
    )
    expect(evaluateGate(g10, state)).toBe(true)
  })

  it('passes via solis_standing >= 3 as inside access', () => {
    const state = setFlag(
      applyRelationship(createInitialState(), 'solis_standing', 3),
      'fracture_origin_known',
      true,
    )
    const withTomas = applyRelationship(state, 'tomas_bond', 5)
    expect(evaluateGate(g10, withTomas)).toBe(true)
  })

  it('passes via tomas_bond >= 5 as ally condition', () => {
    const state = setFlag(
      applyRelationship(
        applyRelationship(createInitialState(), 'ines_contact', 4),
        'tomas_bond',
        5,
      ),
      'fracture_origin_known',
      true,
    )
    expect(evaluateGate(g10, state)).toBe(true)
  })

  it('fails on default state', () => {
    expect(evaluateGate(g10, createInitialState())).toBe(false)
  })
})

// ── C07: ACCESS_CHOICE gates ──────────────────────────────────────────────────

describe('C07 access choice gates', () => {
  it('ines route: ines_contact >= 2', () => {
    const gate: GateCondition = { type: 'relationship_gte', character: 'ines_contact', value: 2 }
    expect(evaluateGate(gate, withInesContact(1))).toBe(false)
    expect(evaluateGate(gate, withInesContact(2))).toBe(true)
  })

  it('aldric route: aldric_regard >= 3', () => {
    const gate: GateCondition = { type: 'relationship_gte', character: 'aldric_regard', value: 3 }
    expect(evaluateGate(gate, applyRelationship(createInitialState(), 'aldric_regard', 2))).toBe(false)
    expect(evaluateGate(gate, applyRelationship(createInitialState(), 'aldric_regard', 3))).toBe(true)
  })

  it('solo route: cunning >= 6 OR wisdom >= 6', () => {
    const gate: GateCondition = {
      type: 'or',
      conditions: [
        { type: 'trait_gte', trait: 'cunning', value: 6 },
        { type: 'trait_gte', trait: 'wisdom', value: 6 },
      ],
    }
    expect(evaluateGate(gate, createInitialState())).toBe(false) // both at 3
    expect(evaluateGate(gate, applyTrait(createInitialState(), 'cunning', 3))).toBe(true) // 3+3=6
    expect(evaluateGate(gate, applyTrait(createInitialState(), 'wisdom', 3))).toBe(true)
  })
})
