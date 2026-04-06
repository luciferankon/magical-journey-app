/**
 * Chapter 4 gate evaluation tests.
 *
 * Covers G11 (ARCHIVIST_REVEAL_GATE) and G12 (GOVERNANCE_OUTCOME_GATE) from the
 * Chapter 4 scene graph, the lira_trust relationship meter introduced in schema V4,
 * and the six chapter-4 flags.
 */
import { describe, it, expect } from 'vitest'
import { evaluateGate, applyConsequences } from '@/lib/engine/engine'
import { createInitialState, applyRelationship, setFlag, applyTrait } from '@/lib/state'
import type { GateCondition, Consequence } from '@/lib/engine'

// ── Helpers ───────────────────────────────────────────────────────────────────

function withLiraTrust(n: number) {
  return applyRelationship(createInitialState(), 'lira_trust', n)
}

function withInesContact(n: number) {
  return applyRelationship(createInitialState(), 'ines_contact', n)
}

function withSolisStanding(n: number) {
  return applyRelationship(createInitialState(), 'solis_standing', n)
}

// ── lira_trust relationship ───────────────────────────────────────────────────

describe('lira_trust relationship meter', () => {
  it('starts at 0 by default', () => {
    expect(createInitialState().relationships.lira_trust).toBe(0)
  })

  it('can be raised via relationship_delta consequence', () => {
    const state = applyConsequences(
      [{ type: 'relationship_delta', character: 'lira_trust', delta: 2 }],
      createInitialState(),
    )
    expect(state.relationships.lira_trust).toBe(2)
  })

  it('clamps at RELATIONSHIP_MAX (10)', () => {
    const state = applyConsequences(
      [{ type: 'relationship_delta', character: 'lira_trust', delta: 99 }],
      createInitialState(),
    )
    expect(state.relationships.lira_trust).toBe(10)
  })

  it('clamps at RELATIONSHIP_MIN (0)', () => {
    const state = applyConsequences(
      [{ type: 'relationship_delta', character: 'lira_trust', delta: -99 }],
      createInitialState(),
    )
    expect(state.relationships.lira_trust).toBe(0)
  })
})

// ── Chapter 4 flag consequences ───────────────────────────────────────────────

describe('chapter 4 flags via set_flag consequence', () => {
  const ch4Flags = [
    'davo_encountered',
    'davo_truth_known',
    'veth_protected',
    'veth_broken',
    'archivist_revealed',
    'lira_returned',
  ] as const

  for (const flag of ch4Flags) {
    it(`sets ${flag}`, () => {
      const state = applyConsequences(
        [{ type: 'set_flag', flag }],
        createInitialState(),
      )
      expect(state.flags[flag]).toBe(true)
    })
  }

  for (const flag of ch4Flags) {
    it(`unsets ${flag}`, () => {
      const withFlag = setFlag(createInitialState(), flag, true)
      const state = applyConsequences(
        [{ type: 'unset_flag', flag }],
        withFlag,
      )
      expect(state.flags[flag]).toBe(false)
    })
  }
})

// ── G11: ARCHIVIST_REVEAL_GATE ────────────────────────────────────────────────
// condition: ines_contact >= 5 OR (lira_returned AND lira_trust >= 4)

describe('G11_ARCHIVIST_REVEAL_GATE: ines_contact >= 5 OR (lira_returned AND lira_trust >= 4)', () => {
  const g11: GateCondition = {
    type: 'or',
    conditions: [
      { type: 'relationship_gte', character: 'ines_contact', value: 5 },
      {
        type: 'and',
        conditions: [
          { type: 'flag_set', flag: 'lira_returned' },
          { type: 'relationship_gte', character: 'lira_trust', value: 4 },
        ],
      },
    ],
  }

  it('fails on default state', () => {
    expect(evaluateGate(g11, createInitialState())).toBe(false)
  })

  it('passes when ines_contact meets threshold', () => {
    expect(evaluateGate(g11, withInesContact(5))).toBe(true)
  })

  it('fails when ines_contact is one below threshold', () => {
    expect(evaluateGate(g11, withInesContact(4))).toBe(false)
  })

  it('passes when lira_returned is set and lira_trust meets threshold', () => {
    const state = setFlag(withLiraTrust(4), 'lira_returned', true)
    expect(evaluateGate(g11, state)).toBe(true)
  })

  it('fails when lira_returned is set but lira_trust is below threshold', () => {
    const state = setFlag(withLiraTrust(3), 'lira_returned', true)
    expect(evaluateGate(g11, state)).toBe(false)
  })

  it('fails when lira_trust meets threshold but lira_returned is not set', () => {
    expect(evaluateGate(g11, withLiraTrust(5))).toBe(false)
  })

  it('passes when both conditions are satisfied', () => {
    const state = setFlag(
      applyRelationship(withInesContact(5), 'lira_trust', 4),
      'lira_returned',
      true,
    )
    expect(evaluateGate(g11, state)).toBe(true)
  })
})

// ── G12: GOVERNANCE_OUTCOME_GATE ──────────────────────────────────────────────
// condition: archivist_revealed AND ines_contact >= 6 AND fracture_origin_known
//            AND (caden_aligned OR sera_truth_known OR tomas_bond >= 6)

describe('G12_GOVERNANCE_OUTCOME_GATE: full composite condition', () => {
  const g12: GateCondition = {
    type: 'and',
    conditions: [
      { type: 'flag_set', flag: 'archivist_revealed' },
      { type: 'relationship_gte', character: 'ines_contact', value: 6 },
      { type: 'flag_set', flag: 'fracture_origin_known' },
      {
        type: 'or',
        conditions: [
          { type: 'flag_set', flag: 'caden_aligned' },
          { type: 'flag_set', flag: 'sera_truth_known' },
          { type: 'relationship_gte', character: 'tomas_bond', value: 6 },
        ],
      },
    ],
  }

  function baseState() {
    // archivist_revealed + ines_contact 6 + fracture_origin_known + caden_aligned — passes
    return setFlag(
      setFlag(
        setFlag(
          applyRelationship(createInitialState(), 'ines_contact', 6),
          'archivist_revealed',
          true,
        ),
        'fracture_origin_known',
        true,
      ),
      'caden_aligned',
      true,
    )
  }

  it('passes when all conjuncts are satisfied', () => {
    expect(evaluateGate(g12, baseState())).toBe(true)
  })

  it('fails on default state', () => {
    expect(evaluateGate(g12, createInitialState())).toBe(false)
  })

  it('fails when archivist_revealed is not set', () => {
    const state = setFlag(
      setFlag(applyRelationship(createInitialState(), 'ines_contact', 6), 'fracture_origin_known', true),
      'caden_aligned',
      true,
    )
    expect(evaluateGate(g12, state)).toBe(false)
  })

  it('fails when ines_contact is below threshold', () => {
    const state = setFlag(
      setFlag(
        setFlag(applyRelationship(createInitialState(), 'ines_contact', 5), 'archivist_revealed', true),
        'fracture_origin_known',
        true,
      ),
      'caden_aligned',
      true,
    )
    expect(evaluateGate(g12, state)).toBe(false)
  })

  it('fails when fracture_origin_known is not set', () => {
    const state = setFlag(
      setFlag(applyRelationship(createInitialState(), 'ines_contact', 6), 'archivist_revealed', true),
      'caden_aligned',
      true,
    )
    expect(evaluateGate(g12, state)).toBe(false)
  })

  it('fails when no ally condition is met', () => {
    const state = setFlag(
      setFlag(applyRelationship(createInitialState(), 'ines_contact', 6), 'archivist_revealed', true),
      'fracture_origin_known',
      true,
    )
    expect(evaluateGate(g12, state)).toBe(false)
  })

  it('passes via sera_truth_known as ally condition', () => {
    const state = setFlag(
      setFlag(
        setFlag(applyRelationship(createInitialState(), 'ines_contact', 6), 'archivist_revealed', true),
        'fracture_origin_known',
        true,
      ),
      'sera_truth_known',
      true,
    )
    expect(evaluateGate(g12, state)).toBe(true)
  })

  it('passes via tomas_bond >= 6 as ally condition', () => {
    const state = setFlag(
      setFlag(
        applyRelationship(
          applyRelationship(createInitialState(), 'ines_contact', 6),
          'tomas_bond',
          6,
        ),
        'archivist_revealed',
        true,
      ),
      'fracture_origin_known',
      true,
    )
    expect(evaluateGate(g12, state)).toBe(true)
  })
})

// ── ENDING_GATE_4 conditions ──────────────────────────────────────────────────

describe('ending_gate_4a: archivist_revealed AND ines_contact >= 6', () => {
  const gate4a: GateCondition = {
    type: 'and',
    conditions: [
      { type: 'flag_set', flag: 'archivist_revealed' },
      { type: 'relationship_gte', character: 'ines_contact', value: 6 },
    ],
  }

  it('passes when both conditions met', () => {
    const state = setFlag(withInesContact(6), 'archivist_revealed', true)
    expect(evaluateGate(gate4a, state)).toBe(true)
  })

  it('fails without archivist_revealed', () => {
    expect(evaluateGate(gate4a, withInesContact(6))).toBe(false)
  })

  it('fails without sufficient ines_contact', () => {
    expect(evaluateGate(gate4a, setFlag(withInesContact(5), 'archivist_revealed', true))).toBe(false)
  })
})

describe('ending_gate_4c: solis_standing >= 6 AND NOT archivist_revealed', () => {
  const gate4c: GateCondition = {
    type: 'and',
    conditions: [
      { type: 'relationship_gte', character: 'solis_standing', value: 6 },
      { type: 'flag_unset', flag: 'archivist_revealed' },
    ],
  }

  it('passes when solis_standing is high and archivist not revealed', () => {
    expect(evaluateGate(gate4c, withSolisStanding(6))).toBe(true)
  })

  it('fails when archivist is revealed even with high solis_standing', () => {
    const state = setFlag(withSolisStanding(7), 'archivist_revealed', true)
    expect(evaluateGate(gate4c, state)).toBe(false)
  })

  it('fails when solis_standing is below threshold', () => {
    expect(evaluateGate(gate4c, withSolisStanding(5))).toBe(false)
  })
})

// ── C09 choice gates ──────────────────────────────────────────────────────────

describe('C09 choice gates', () => {
  it('go_down: caden_aligned OR courage >= 6', () => {
    const gate: GateCondition = {
      type: 'or',
      conditions: [
        { type: 'flag_set', flag: 'caden_aligned' },
        { type: 'trait_gte', trait: 'courage', value: 6 },
      ],
    }
    expect(evaluateGate(gate, createInitialState())).toBe(false)
    expect(evaluateGate(gate, setFlag(createInitialState(), 'caden_aligned', true))).toBe(true)
    expect(evaluateGate(gate, applyTrait(createInitialState(), 'courage', 3))).toBe(true) // 3+3=6
  })

  it('contact_ines: ines_contact >= 4', () => {
    const gate: GateCondition = { type: 'relationship_gte', character: 'ines_contact', value: 4 }
    expect(evaluateGate(gate, withInesContact(3))).toBe(false)
    expect(evaluateGate(gate, withInesContact(4))).toBe(true)
  })
})

// ── C10 choice gates ──────────────────────────────────────────────────────────

describe('C10 choice gates', () => {
  it('build_cover: cunning >= 5 OR wisdom >= 5', () => {
    const gate: GateCondition = {
      type: 'or',
      conditions: [
        { type: 'trait_gte', trait: 'cunning', value: 5 },
        { type: 'trait_gte', trait: 'wisdom', value: 5 },
      ],
    }
    expect(evaluateGate(gate, createInitialState())).toBe(false) // both at 3
    expect(evaluateGate(gate, applyTrait(createInitialState(), 'cunning', 2))).toBe(true) // 3+2=5
    expect(evaluateGate(gate, applyTrait(createInitialState(), 'wisdom', 2))).toBe(true)
  })

  it('archivist_moves: ines_contact >= 5', () => {
    const gate: GateCondition = { type: 'relationship_gte', character: 'ines_contact', value: 5 }
    expect(evaluateGate(gate, withInesContact(4))).toBe(false)
    expect(evaluateGate(gate, withInesContact(5))).toBe(true)
  })
})

// ── C11 choice gates ──────────────────────────────────────────────────────────

describe('C11 choice gates', () => {
  it('use_case: caden_aligned', () => {
    const gate: GateCondition = { type: 'flag_set', flag: 'caden_aligned' }
    expect(evaluateGate(gate, createInitialState())).toBe(false)
    expect(evaluateGate(gate, setFlag(createInitialState(), 'caden_aligned', true))).toBe(true)
  })

  it('ask_davo: davo_encountered AND (courage >= 6 OR cunning >= 6)', () => {
    const gate: GateCondition = {
      type: 'and',
      conditions: [
        { type: 'flag_set', flag: 'davo_encountered' },
        {
          type: 'or',
          conditions: [
            { type: 'trait_gte', trait: 'courage', value: 6 },
            { type: 'trait_gte', trait: 'cunning', value: 6 },
          ],
        },
      ],
    }
    // missing flag
    expect(evaluateGate(gate, applyTrait(createInitialState(), 'courage', 3))).toBe(false)
    // flag set but trait too low
    expect(evaluateGate(gate, setFlag(createInitialState(), 'davo_encountered', true))).toBe(false)
    // both met
    const state = setFlag(applyTrait(createInitialState(), 'courage', 3), 'davo_encountered', true)
    expect(evaluateGate(gate, state)).toBe(true) // courage 3+3=6
  })
})
