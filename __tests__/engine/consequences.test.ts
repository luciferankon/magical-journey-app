import { describe, it, expect } from 'vitest'
import { applyConsequences } from '@/lib/engine/engine'
import { createInitialState } from '@/lib/state'
import type { Consequence } from '@/lib/engine'

describe('applyConsequences', () => {
  it('applies trait deltas additively', () => {
    const state = createInitialState()
    const consequences: Consequence[] = [
      { type: 'trait_delta', trait: 'courage', delta: 2 },
      { type: 'trait_delta', trait: 'courage', delta: 1 },
    ]
    const result = applyConsequences(consequences, state)
    expect(result.traits.courage).toBe(6) // 3 (default) + 3
  })

  it('supports negative trait deltas', () => {
    const state = createInitialState()
    const result = applyConsequences(
      [{ type: 'trait_delta', trait: 'courage', delta: -1 }],
      state,
    )
    expect(result.traits.courage).toBe(2)
  })

  it('clamps trait delta at TRAIT_MIN (0)', () => {
    const state = createInitialState()
    const result = applyConsequences(
      [{ type: 'trait_delta', trait: 'courage', delta: -99 }],
      state,
    )
    expect(result.traits.courage).toBe(0)
  })

  it('clamps trait delta at TRAIT_MAX (10)', () => {
    const state = createInitialState()
    const result = applyConsequences(
      [{ type: 'trait_delta', trait: 'courage', delta: 99 }],
      state,
    )
    expect(result.traits.courage).toBe(10)
  })

  it('sets a flag', () => {
    const state = createInitialState()
    const result = applyConsequences(
      [{ type: 'set_flag', flag: 'witnessed_fracture' }],
      state,
    )
    expect(result.flags.witnessed_fracture).toBe(true)
  })

  it('setting a flag twice is idempotent', () => {
    const state = createInitialState()
    const once = applyConsequences([{ type: 'set_flag', flag: 'witnessed_fracture' }], state)
    const twice = applyConsequences([{ type: 'set_flag', flag: 'witnessed_fracture' }], once)
    expect(twice.flags.witnessed_fracture).toBe(true)
  })

  it('unsets a flag', () => {
    const state = createInitialState()
    const withFlag = applyConsequences([{ type: 'set_flag', flag: 'witnessed_fracture' }], state)
    const result = applyConsequences([{ type: 'unset_flag', flag: 'witnessed_fracture' }], withFlag)
    expect(result.flags.witnessed_fracture).toBe(false)
  })

  it('unset on absent flag is a no-op', () => {
    const state = createInitialState()
    const result = applyConsequences([{ type: 'unset_flag', flag: 'crisis_fled' }], state)
    expect(result.flags.crisis_fled).toBe(false)
    expect(result.flags.witnessed_fracture).toBe(false) // other flags unaffected
  })

  it('applies relationship deltas', () => {
    const state = createInitialState()
    const result = applyConsequences(
      [{ type: 'relationship_delta', character: 'sera_trust', delta: 3 }],
      state,
    )
    expect(result.relationships.sera_trust).toBe(3)
  })

  it('applies stacked relationship deltas', () => {
    const state = createInitialState()
    const result = applyConsequences(
      [
        { type: 'relationship_delta', character: 'aldric_regard', delta: 2 },
        { type: 'relationship_delta', character: 'aldric_regard', delta: 1 },
      ],
      state,
    )
    expect(result.relationships.aldric_regard).toBe(3)
  })

  it('does not mutate the input state', () => {
    const original = createInitialState()
    applyConsequences(
      [
        { type: 'trait_delta', trait: 'courage', delta: 5 },
        { type: 'set_flag', flag: 'witnessed_fracture' },
        { type: 'relationship_delta', character: 'sera_trust', delta: 10 },
      ],
      original,
    )
    expect(original.traits.courage).toBe(3)
    expect(original.flags.witnessed_fracture).toBe(false)
    expect(original.relationships.sera_trust).toBe(0)
  })

  it('applies multiple mixed consequences in order', () => {
    const consequences: Consequence[] = [
      { type: 'trait_delta', trait: 'wisdom', delta: 1 },
      { type: 'set_flag', flag: 'crisis_intervened' },
      { type: 'relationship_delta', character: 'tomas_bond', delta: 2 },
      { type: 'unset_flag', flag: 'sided_with_lira' },
    ]
    const state = createInitialState()
    const withFlag = applyConsequences([{ type: 'set_flag', flag: 'sided_with_lira' }], state)
    const result = applyConsequences(consequences, withFlag)
    expect(result.traits.wisdom).toBe(4)
    expect(result.flags.crisis_intervened).toBe(true)
    expect(result.flags.sided_with_lira).toBe(false)
    expect(result.relationships.tomas_bond).toBe(2)
  })

  it('set_chapter_export writes the field to chapterExports', () => {
    const state = createInitialState()
    const result = applyConsequences(
      [{ type: 'set_chapter_export', field: 'crisis_outcome', value: 'hero' }],
      state,
    )
    expect(result.chapterExports.crisis_outcome).toBe('hero')
  })

  it('advance_chapter increments chapter and clears progress', () => {
    const state = createInitialState()
    const result = applyConsequences(
      [{ type: 'advance_chapter' }],
      state,
    )
    expect(result.progress.chapter).toBe(2)
    expect(result.progress.currentNodeId).toBe('')
    expect(result.progress.visitedNodes).toEqual([])
  })

  it('set_chapter_export then advance_chapter preserves the export', () => {
    const state = createInitialState()
    const result = applyConsequences(
      [
        { type: 'set_chapter_export', field: 'crisis_outcome', value: 'hero' },
        { type: 'set_chapter_export', field: 'lira_status', value: 'watching' },
        { type: 'advance_chapter' },
      ],
      state,
    )
    expect(result.chapterExports.crisis_outcome).toBe('hero')
    expect(result.chapterExports.lira_status).toBe('watching')
    expect(result.progress.chapter).toBe(2)
  })
})
