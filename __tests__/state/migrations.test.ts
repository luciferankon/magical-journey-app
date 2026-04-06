import { describe, it, expect } from 'vitest'
import { migrate, isCurrentVersion } from '@/lib/state/migrations'
import { createInitialState } from '@/lib/state'
import { SCHEMA_VERSION } from '@/lib/state/schema'

describe('migrate', () => {
  it('returns a fresh state for null input', () => {
    const result = migrate(null)
    expect(result.meta.schemaVersion).toBe(SCHEMA_VERSION)
  })

  it('returns a fresh state for non-object input', () => {
    expect(migrate('string').meta.schemaVersion).toBe(SCHEMA_VERSION)
    expect(migrate(42).meta.schemaVersion).toBe(SCHEMA_VERSION)
    expect(migrate([]).meta.schemaVersion).toBe(SCHEMA_VERSION)
  })

  it('returns a fresh state for a future schema version', () => {
    const futureState = { meta: { schemaVersion: SCHEMA_VERSION + 10 } }
    const result = migrate(futureState)
    expect(result.meta.schemaVersion).toBe(SCHEMA_VERSION)
  })

  it('returns current state unchanged when already at current version', () => {
    const state = createInitialState()
    const result = migrate(state)
    expect(result.meta.schemaVersion).toBe(SCHEMA_VERSION)
    expect(result.traits.courage).toBe(state.traits.courage)
    expect(result.relationships.sera_trust).toBe(state.relationships.sera_trust)
  })

  describe('V1 → V2 migration', () => {
    // Simulate a V1 save: missing solis_standing and chapter-2 fields
    const v1Save = {
      meta: { schemaVersion: 1, createdAt: '2025-01-01T00:00:00.000Z', lastUpdatedAt: '2025-01-01T00:00:00.000Z' },
      identity: { name: 'Rowan', house: 'ignis', background: 'scholarship' },
      traits: { courage: 5, cunning: 3, empathy: 3, ambition: 4, wisdom: 3 },
      relationships: { sera_trust: 2, caden_rivalry: 3, aldric_regard: 1, lira_influence: 0, tomas_bond: 4 },
      flags: {
        witnessed_fracture: true, dueled_caden: false, reported_lira: false, sided_with_lira: false,
        class_success: true, crisis_intervened: true, crisis_fled: false, house_assigned: true,
      },
      chapterExports: { crisis_outcome: 'hero', chapter_1_reputation: 'high', lira_status: 'watching' },
      progress: { currentNodeId: 's09a_marked_morning', visitedNodes: [], chapter: 2 },
    }

    it('adds solis_standing defaulting to 0', () => {
      const result = migrate(v1Save)
      expect(result.relationships.solis_standing).toBe(0)
    })

    it('preserves existing V1 relationship values', () => {
      const result = migrate(v1Save)
      expect(result.relationships.sera_trust).toBe(2)
      expect(result.relationships.tomas_bond).toBe(4)
    })

    it('adds chapter-2 flags defaulting to false', () => {
      const result = migrate(v1Save)
      expect(result.flags.met_solis).toBe(false)
      expect(result.flags.knows_ines_alive).toBe(false)
      expect(result.flags.conclave_offered).toBe(false)
      expect(result.flags.tomas_knows).toBe(false)
    })

    it('adds chapter-2 chapterExports defaulting to null', () => {
      const result = migrate(v1Save)
      expect(result.chapterExports.chapter_2_solis_stance).toBeNull()
      expect(result.chapterExports.ines_status).toBeNull()
      expect(result.chapterExports.lira_chapter_2_status).toBeNull()
    })

    it('preserves chapter-1 chapterExports', () => {
      const result = migrate(v1Save)
      expect(result.chapterExports.crisis_outcome).toBe('hero')
      expect(result.chapterExports.lira_status).toBe('watching')
    })

    it('sets schemaVersion to current', () => {
      const result = migrate(v1Save)
      expect(result.meta.schemaVersion).toBe(SCHEMA_VERSION)
    })
  })

  describe('V2 → V3 migration', () => {
    // Simulate a V2 save: has chapter-2 fields but missing chapter-3 fields
    const v2Save = {
      meta: { schemaVersion: 2, createdAt: '2025-01-01T00:00:00.000Z', lastUpdatedAt: '2025-06-01T00:00:00.000Z' },
      identity: { name: 'Rowan', house: 'aqualyn', background: 'outsider' },
      traits: { courage: 4, cunning: 5, empathy: 6, ambition: 3, wisdom: 4 },
      relationships: {
        sera_trust: 5, caden_rivalry: 2, aldric_regard: 3, lira_influence: 1,
        tomas_bond: 6, solis_standing: 2,
      },
      flags: {
        witnessed_fracture: true, dueled_caden: false, reported_lira: true, sided_with_lira: false,
        class_success: true, crisis_intervened: true, crisis_fled: false, house_assigned: true,
        met_solis: true, knows_ines_alive: true, conclave_offered: true, tomas_knows: false,
      },
      chapterExports: {
        crisis_outcome: 'hero', chapter_1_reputation: 'high', lira_status: 'watching',
        chapter_2_solis_stance: 'brokered', ines_status: 'found', lira_chapter_2_status: 'ally',
      },
      progress: { currentNodeId: 's22a_after_reunion', visitedNodes: [], chapter: 3 },
    }

    it('adds ines_contact defaulting to 0', () => {
      const result = migrate(v2Save)
      expect(result.relationships.ines_contact).toBe(0)
    })

    it('adds chapter-3 flags defaulting to false', () => {
      const result = migrate(v2Save)
      expect(result.flags.sera_truth_known).toBe(false)
      expect(result.flags.caden_aligned).toBe(false)
      expect(result.flags.fracture_origin_known).toBe(false)
      expect(result.flags.conclave_split).toBe(false)
      expect(result.flags.aldric_acts).toBe(false)
    })

    it('adds chapter-3 chapterExports defaulting to null', () => {
      const result = migrate(v2Save)
      expect(result.chapterExports.chapter_3_stance).toBeNull()
      expect(result.chapterExports.fracture_origin_shared).toBeNull()
      expect(result.chapterExports.caden_status).toBeNull()
    })

    it('preserves all V2 relationship values', () => {
      const result = migrate(v2Save)
      expect(result.relationships.sera_trust).toBe(5)
      expect(result.relationships.solis_standing).toBe(2)
      expect(result.relationships.tomas_bond).toBe(6)
    })

    it('preserves all V2 flag values', () => {
      const result = migrate(v2Save)
      expect(result.flags.met_solis).toBe(true)
      expect(result.flags.knows_ines_alive).toBe(true)
      expect(result.flags.tomas_knows).toBe(false)
    })

    it('preserves all V2 chapterExports', () => {
      const result = migrate(v2Save)
      expect(result.chapterExports.chapter_2_solis_stance).toBe('brokered')
      expect(result.chapterExports.ines_status).toBe('found')
      expect(result.chapterExports.lira_chapter_2_status).toBe('ally')
    })

    it('sets schemaVersion to current', () => {
      const result = migrate(v2Save)
      expect(result.meta.schemaVersion).toBe(SCHEMA_VERSION)
    })

    it('preserves existing ines_contact if already present in V2 save', () => {
      const v2WithInes = { ...v2Save, relationships: { ...v2Save.relationships, ines_contact: 3 } }
      const result = migrate(v2WithInes)
      expect(result.relationships.ines_contact).toBe(3)
    })
  })

  describe('V3 → V4 migration', () => {
    // Simulate a V3 save: has chapter-3 fields but missing chapter-4 fields
    const v3Save = {
      meta: { schemaVersion: 3, createdAt: '2025-01-01T00:00:00.000Z', lastUpdatedAt: '2026-01-01T00:00:00.000Z' },
      identity: { name: 'Rowan', house: 'terram', background: 'outsider' },
      traits: { courage: 5, cunning: 6, empathy: 4, ambition: 5, wisdom: 7 },
      relationships: {
        sera_trust: 3, caden_rivalry: 1, aldric_regard: 4, lira_influence: 4,
        tomas_bond: 7, solis_standing: 2, ines_contact: 5,
      },
      flags: {
        witnessed_fracture: true, dueled_caden: false, reported_lira: true, sided_with_lira: false,
        class_success: true, crisis_intervened: true, crisis_fled: false, house_assigned: true,
        met_solis: true, knows_ines_alive: true, conclave_offered: false, tomas_knows: true,
        sera_truth_known: true, caden_aligned: true, fracture_origin_known: true,
        conclave_split: true, aldric_acts: true,
      },
      chapterExports: {
        crisis_outcome: 'hero', chapter_1_reputation: 'high', lira_status: 'watching',
        chapter_2_solis_stance: 'confronted', ines_status: 'found', lira_chapter_2_status: 'ally',
        chapter_3_stance: 'reformer', fracture_origin_shared: 'conclave_only', caden_status: 'ally',
      },
      progress: { currentNodeId: 's32a_after_reformer', visitedNodes: [], chapter: 4 },
    }

    it('adds lira_trust seeded from lira_influence >= 3', () => {
      const result = migrate(v3Save)
      // lira_influence is 4 (>= 3) → lira_trust seeds to 2
      expect(result.relationships.lira_trust).toBe(2)
    })

    it('adds lira_trust as 0 when lira_influence < 3', () => {
      const lowInfluence = {
        ...v3Save,
        relationships: { ...v3Save.relationships, lira_influence: 2 },
      }
      const result = migrate(lowInfluence)
      expect(result.relationships.lira_trust).toBe(0)
    })

    it('preserves existing lira_trust if already present in V3 save', () => {
      const withTrust = {
        ...v3Save,
        relationships: { ...v3Save.relationships, lira_trust: 5 },
      }
      const result = migrate(withTrust)
      expect(result.relationships.lira_trust).toBe(5)
    })

    it('adds chapter-4 flags defaulting to false', () => {
      const result = migrate(v3Save)
      expect(result.flags.davo_encountered).toBe(false)
      expect(result.flags.davo_truth_known).toBe(false)
      expect(result.flags.veth_protected).toBe(false)
      expect(result.flags.veth_broken).toBe(false)
      expect(result.flags.archivist_revealed).toBe(false)
      expect(result.flags.lira_returned).toBe(false)
    })

    it('adds chapter-4 chapterExports defaulting to null', () => {
      const result = migrate(v3Save)
      expect(result.chapterExports.chapter_4_stance).toBeNull()
      expect(result.chapterExports.veth_status).toBeNull()
      expect(result.chapterExports.davo_outcome).toBeNull()
      expect(result.chapterExports.lira_status_ch4).toBeNull()
    })

    it('preserves all V3 relationship values', () => {
      const result = migrate(v3Save)
      expect(result.relationships.sera_trust).toBe(3)
      expect(result.relationships.ines_contact).toBe(5)
      expect(result.relationships.tomas_bond).toBe(7)
    })

    it('preserves all V3 flag values', () => {
      const result = migrate(v3Save)
      expect(result.flags.caden_aligned).toBe(true)
      expect(result.flags.fracture_origin_known).toBe(true)
      expect(result.flags.sera_truth_known).toBe(true)
      expect(result.flags.aldric_acts).toBe(true)
    })

    it('preserves all V3 chapterExports', () => {
      const result = migrate(v3Save)
      expect(result.chapterExports.chapter_3_stance).toBe('reformer')
      expect(result.chapterExports.fracture_origin_shared).toBe('conclave_only')
      expect(result.chapterExports.caden_status).toBe('ally')
    })

    it('sets schemaVersion to current', () => {
      const result = migrate(v3Save)
      expect(result.meta.schemaVersion).toBe(SCHEMA_VERSION)
    })
  })

  describe('V1 → V4 multi-hop migration', () => {
    // A V1 save must migrate all the way to V4 in one call
    const v1Save = {
      meta: { schemaVersion: 1, createdAt: '2025-01-01T00:00:00.000Z', lastUpdatedAt: '2025-01-01T00:00:00.000Z' },
      identity: { name: 'Rowan', house: null, background: null },
      traits: { courage: 3, cunning: 3, empathy: 3, ambition: 3, wisdom: 3 },
      relationships: { sera_trust: 0, caden_rivalry: 0, aldric_regard: 0, lira_influence: 0, tomas_bond: 0 },
      flags: {
        witnessed_fracture: false, dueled_caden: false, reported_lira: false, sided_with_lira: false,
        class_success: false, crisis_intervened: false, crisis_fled: false, house_assigned: false,
      },
      chapterExports: { crisis_outcome: null, chapter_1_reputation: null, lira_status: null },
      progress: { currentNodeId: 's01_arrival', visitedNodes: [], chapter: 1 },
    }

    it('reaches current SCHEMA_VERSION from V1', () => {
      const result = migrate(v1Save)
      expect(result.meta.schemaVersion).toBe(SCHEMA_VERSION)
    })

    it('has all chapter-2, chapter-3, and chapter-4 fields populated', () => {
      const result = migrate(v1Save)
      // V2 fields
      expect(result.relationships.solis_standing).toBe(0)
      expect(result.flags.met_solis).toBe(false)
      expect(result.chapterExports.ines_status).toBeNull()
      // V3 fields
      expect(result.relationships.ines_contact).toBe(0)
      expect(result.flags.fracture_origin_known).toBe(false)
      expect(result.chapterExports.chapter_3_stance).toBeNull()
      // V4 fields
      expect(result.relationships.lira_trust).toBe(0) // lira_influence was 0, seeds to 0
      expect(result.flags.davo_encountered).toBe(false)
      expect(result.flags.archivist_revealed).toBe(false)
      expect(result.chapterExports.chapter_4_stance).toBeNull()
      expect(result.chapterExports.veth_status).toBeNull()
    })
  })
})

describe('isCurrentVersion', () => {
  it('returns true for current state', () => {
    expect(isCurrentVersion(createInitialState())).toBe(true)
  })

  it('returns false for an older version', () => {
    const old = { meta: { schemaVersion: 1 } } as never
    expect(isCurrentVersion(old)).toBe(false)
  })
})
