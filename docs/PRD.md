# Product Requirements Document
## Wizarding World Branching Narrative Game

---

### Product Summary

A commercially sellable, browser-based branching narrative game set in an original magical academy world inspired by the wizarding fantasy genre. Players make consequential decisions that permanently alter story branches, relationships, character traits, and endings — in the style of Detroit: Become Human. Every playthrough can be meaningfully different. All art, music, story, and assets are original IP.

> **Critical legal note:** The Harry Potter name, characters, spells, and specific world elements (Hogwarts, Voldemort, etc.) are trademarked/copyrighted by Warner Bros. and J.K. Rowling. A commercially sold game cannot use them directly without a license. This plan assumes an **original wizarding world** — same genre and feel, entirely original IP. This is both legally safe and commercially stronger (you own everything).

---

### Target Users

| Segment | Profile |
|---|---|
| Primary | 16–35 fans of fantasy RPGs, visual novels, and narrative games (Detroit, Disco Elysium, Life is Strange) |
| Secondary | Harry Potter / magical academy genre fans looking for an interactive story experience |
| Tertiary | Casual web gamers who want cinematic, story-driven play without a download |

---

### Core Problem

Fans of the magical academy fantasy genre have no high-quality, decision-driven narrative game on the web. Existing options are either mobile-clicker quality, require downloads, or lack real narrative branching with meaningful consequences.

---

### Value Proposition

> A cinematic, commercially polished branching narrative game — playable in any browser — where every choice reshapes your story, your character, your friendships, and your fate at a school of magic. No two playthroughs are the same.

---

### Major Product Areas

| # | Area | Description |
|---|---|---|
| 1 | **Story Engine** | Core branching runtime — scene resolution, choice dispatch, consequence application, ending detection |
| 2 | **Narrative & World** | Original world, lore, characters, story arcs, multiple endings |
| 3 | **Player State System** | Traits, relationships, reputation, skills, inventory, moral compass tracking |
| 4 | **Onboarding & Character Creation** | House sorting, name, background choices that seed initial state |
| 5 | **Game Mechanics** | Classes, duels, magic casting, social interactions, exploration |
| 6 | **Save / Load System** | Multi-slot saves, chapter select, replay from decision point |
| 7 | **Visual Layer** | Scene backgrounds, character portraits, UI panels, transitions, effects |
| 8 | **Audio Layer** | Dynamic BGM system, ambient sound, spell SFX, UI sounds |
| 9 | **Asset Pipeline** | All art, audio, and content assets — original, production-quality |
| 10 | **Monetisation & Distribution** | Web deployment, paywall/demo split, future DLC chapters |

---

### Capability Groups

#### Narrative & Branching
- Scene graph with major branch points
- Choices with immediate + delayed consequences
- Relationship meters (trust, rivalry, romance, loyalty) per character
- Trait system (courage, cunning, empathy, ambition, wisdom) shaped by choices
- Multiple distinct endings (minimum 6 for MVP)
- Butterfly effect — early small choices affect late-game outcomes

#### Game Mechanics
- Magic classes with skill-check moments
- Duel system — turn-based or quick-time decision-based
- Social mechanics — alliances, betrayals, confessions
- Exploration hubs — common rooms, courtyards, library, forbidden areas
- Hidden lore and collectible world-building entries

#### Visual Production
- Full illustrated scene backgrounds (painterly/cinematic style)
- Animated character portraits with expression states
- Spell and effect overlays
- Chapter transition cinematics
- UI system: dialogue box, choice cards, stat panel, map, inventory

#### Audio Production
- Adaptive BGM — score shifts based on scene tension and branch
- Per-location ambient tracks
- Spell and combat SFX library
- UI interaction sounds
- Voice acting direction specs (full VA is post-MVP)

#### Player Progression
- Per-chapter auto-save + manual save slots (3+)
- End-of-chapter consequence summary ("Your choices shaped...")
- Replay chapter from any decision point
- Post-ending flowchart unlock (Detroit-style)

#### Platform & Distribution
- Fully browser-based (Next.js, no download)
- Chapter 1 free / full game paid or subscription
- Mobile-responsive (touch-first choice UI)
- Future: Steam wrapper via Electron/Tauri

---

### MVP Scope (Chapter 1 — Vertical Slice)

Goal: One complete, polished, shippable chapter that demonstrates the full game loop and is good enough to sell or use for crowdfunding/demo.

| Module | MVP Deliverable |
|---|---|
| Story | 1 full chapter, ~3 major branch points, 2 diverging mid-chapter paths, 3 chapter-end states |
| Characters | 5 named NPCs with relationship tracking |
| Mechanics | 1 duel encounter, 1 class skill-check, social choice moments |
| State | Trait system (5 traits), relationship meters, flags |
| Onboarding | Character creation — name, house, background (seeds traits) |
| Save/Load | 3 save slots, auto-save per scene |
| Visuals | 8–12 scene backgrounds, 5 character portrait sets (3–4 expressions each), full UI system |
| Audio | 4–6 BGM tracks, ambient per location, spell/UI SFX |
| Platform | Web (Next.js), desktop-responsive, mobile-responsive |

---

### V2 / Later Scope

- Chapters 2–6 (full game arc)
- Full voice acting
- Animated scene transitions and spell cinematics
- Cloud saves / account system
- Post-game flowchart and achievement system
- Steam / Electron release
- Mod support for community story content
- Localisation (ES, FR, DE, JP minimum)
- Multiplayer divergence comparison ("Your friend chose differently")

---

### Technical Risks & Unknowns

| Risk | Severity | Note |
|---|---|---|
| Asset production volume | High | 12 backgrounds + 5 portrait sets + audio for MVP is significant scope — needs a clear pipeline |
| Branching state complexity | Medium | Detroit-style butterfly effect is hard to test exhaustively — needs a graph validator |
| Next.js 16 breaking changes | Medium | Per AGENTS.md — must read local docs before any implementation |
| IP / trademark exposure | High | Must ensure zero use of Warner Bros. / J.K. Rowling protected names, spells, places |
| Browser audio autoplay | Low | Web audio requires user interaction to unlock — needs graceful handling |
| Save data migration | Medium | As schema evolves across chapters, save compatibility must be maintained |

---

### Recommended Skill Invocation Order

```
/next-docs-reader          ← mandatory before any Next.js code
/story-architect           ← design Chapter 1 narrative graph
/state-designer            ← define trait/relationship/flag schema
/art-director              ← define visual language and asset specs
/engine-builder            ← implement story runtime
/save-load-engineer        ← implement persistence
/ui-builder                ← build all game UI components
/content-author            ← populate Chapter 1 story content
/onboarding-designer       ← build character creation + first scene
/qa-reviewer               ← audit after every phase
```

---

### Recommended Jira Grouping

| Epic | Stories |
|---|---|
| Story Engine | Scene resolution, choice dispatch, consequence system, ending detection |
| Player State | Trait schema, relationship model, flag system, state mutations |
| Chapter 1 Narrative | Story graph, scene content, dialogue, 3 chapter endings |
| Onboarding | Character creation, house sorting, tutorial scene |
| Duel System | Decision-based duel mechanic, outcome consequences |
| Visual Layer | Scene backgrounds, character portraits, UI components, transitions |
| Audio Layer | BGM system, SFX library, adaptive audio logic |
| Save / Load | Serialization, slot management, schema migration |
| Platform & Distribution | Web deployment, chapter demo split, mobile responsiveness |
| Asset Pipeline | Art direction specs, asset delivery format, tooling |

---

*Last updated: 2026-03-31*
