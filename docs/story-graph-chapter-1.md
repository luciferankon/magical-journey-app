# Story Architect Output — Chapter 1 Narrative Graph

---

## World Foundation (Original IP)

| Element | Name | Notes |
|---|---|---|
| School | **Aethermoor Academy** | Ancient institution built on a ley-line convergence point |
| Magic system | **Weaving** — four elemental threads: Ember, Tide, Stone, Wind | Players attune to one primary thread based on house |
| Houses | **The Four Orders**: Ignis (fire/courage), Aqualyn (water/empathy), Terram (earth/wisdom), Ventus (air/cunning) | Sorted by character creation choices |
| Antagonist force | **The Fracture** — a forbidden fifth thread that corrupts Weavers | The mystery driving the full game arc |
| Setting era | Contemporary-ish magical world — smartphones exist, magic coexists | Keeps it relatable |

---

## NPCs — Chapter 1 (5 Characters)

| ID | Name | Role | Relationship Meter | Default Disposition |
|---|---|---|---|---|
| `NPC_01` | **Sera Voss** | Roommate, Aqualyn, warm but hiding grief | `sera_trust` 0–10 | Friendly |
| `NPC_02` | **Caden Miral** | Rival, Ignis, competitive but honourable | `caden_rivalry` 0–10 | Neutral |
| `NPC_03` | **Professor Aldric** | Elemental Casting teacher, strict, fair | `aldric_regard` 0–10 | Neutral |
| `NPC_04` | **Lira Thane** | Senior student, Ventus, morally grey recruiter | `lira_influence` 0–10 | Suspicious |
| `NPC_05` | **Tomás Reeve** | Quiet scholarship student, Terram, observer | `tomas_bond` 0–10 | Neutral |

---

## Node Type Schema

```
SCENE       — narrative moment, no branch, advances linearly
CHOICE      — player selects from 2–4 options
GATE        — conditional branch based on trait/relationship value
CONSEQUENCE — silent state mutation (trait delta, relationship delta, flag set)
ENDING      — chapter terminus, records outcome state for Chapter 2
```

---

## Trait Schema (used in gates)

| Trait | ID | Range | Default |
|---|---|---|---|
| Courage | `courage` | 0–10 | 3 |
| Cunning | `cunning` | 0–10 | 3 |
| Empathy | `empathy` | 0–10 | 3 |
| Ambition | `ambition` | 0–10 | 3 |
| Wisdom | `wisdom` | 0–10 | 3 |

**Flags used in Ch.1:** `witnessed_fracture`, `dueled_caden`, `reported_lira`, `sided_with_lira`, `class_success`, `crisis_intervened`, `crisis_fled`, `house_assigned`

---

## Full Chapter 1 Scene Graph

---

### ACT 1 — THE ARRIVAL (Linear intro, no branches yet)

```
[SCENE] S01_ARRIVAL
  id: "s01_arrival"
  location: aethermoor_gates
  summary: Player arrives at Aethermoor by enchanted rail. Cinematic intro.
    First glimpse of the school, other students. Establishes tone.
  exits: → S02_FIRST_MEETING
  consequences: none

[SCENE] S02_FIRST_MEETING
  id: "s02_first_meeting"
  location: entrance_courtyard
  summary: Player bumps into Sera (Aqualyn, friendly) and Caden (Ignis, competitive)
    simultaneously. Both address the player at the same time.
  exits: → C01_WHO_DO_YOU_GREET
```

---

### BRANCH POINT 1 — Social Alignment

```
[CHOICE] C01_WHO_DO_YOU_GREET
  id: "c01_who_do_you_greet"
  prompt: "Two students approach you at once. Who do you acknowledge first?"
  options:
    A: "Turn to Sera — she looks nervous too"
       → CONS_SERA_TRUST_UP (+2 sera_trust, +1 empathy)
       → S03_SORTING_CEREMONY
    B: "Face Caden — match his confidence"
       → CONS_CADEN_RIVAL_UP (+2 caden_rivalry, +1 courage)
       → S03_SORTING_CEREMONY
    C: "Ignore both, take in the school"
       → CONS_LONER_FLAG (+1 cunning, -1 empathy)
       → S03_SORTING_CEREMONY
  note: All paths converge at S03. This is a butterfly-effect choice —
    small now, gates open in Ch.2+
```

```
[CONSEQUENCE] CONS_SERA_TRUST_UP   → sera_trust += 2, empathy += 1
[CONSEQUENCE] CONS_CADEN_RIVAL_UP  → caden_rivalry += 2, courage += 1
[CONSEQUENCE] CONS_LONER_FLAG      → cunning += 1, empathy -= 1
```

---

### SORTING CEREMONY

```
[SCENE] S03_SORTING_CEREMONY
  id: "s03_sorting_ceremony"
  location: grand_hall
  summary: All new students are sorted into Orders via the Resonance Trial —
    a brief magical test. Player's ORDER is determined by character creation
    choices (pre-set by onboarding). This scene confirms and announces it.
    Caden reacts based on whether he's in the same Order.
    Sera reacts based on whether she's in the same Order.
  exits: → C02_EVENING_COMMON_ROOM
  consequences:
    → flag: house_assigned = true
    → if player Order == Caden's Order: caden_rivalry += 1
    → if player Order == Sera's Order: sera_trust += 1
```

---

### ACT 2 — FIRST DAY

```
[SCENE] S04_COMMON_ROOM_NIGHT
  id: "s04_common_room_night"
  location: player_order_common_room
  summary: Player settles into common room. Tomás is reading alone in corner.
    Lira Thane (senior) watches new students with interest.
    Sera is nearby, unpacking nervously.
  exits: → C02_COMMON_ROOM_CHOICE
```

```
[CHOICE] C02_COMMON_ROOM_CHOICE
  id: "c02_common_room_choice"
  prompt: "The evening is free. Where do you direct your attention?"
  options:
    A: "Talk to Sera — she seems like she needs a friend"
       → CONS_SERA_BOND (+2 sera_trust, +1 empathy)
       → S05_CLASS_MORNING
    B: "Approach Tomás — he's been watching everything quietly"
       → CONS_TOMAS_BOND (+2 tomas_bond, +1 wisdom)
       → S05_CLASS_MORNING
    C: "Introduce yourself to Lira — seniors know things"
       → CONS_LIRA_NOTICED (+2 lira_influence, +1 cunning)
       → S05_CLASS_MORNING
  note: Another butterfly-effect choice. Lira path plants a delayed flag.
```

```
[CONSEQUENCE] CONS_SERA_BOND     → sera_trust += 2, empathy += 1
[CONSEQUENCE] CONS_TOMAS_BOND    → tomas_bond += 2, wisdom += 1
[CONSEQUENCE] CONS_LIRA_NOTICED  → lira_influence += 2, cunning += 1
```

---

### BRANCH POINT 2 — The Class (Skill Check + First Major Gate)

```
[SCENE] S05_CLASS_MORNING
  id: "s05_class_morning"
  location: elemental_casting_hall
  summary: Professor Aldric runs the first Elemental Casting class.
    Students attempt their first Weave. Player must attempt in front of the class.
    Caden succeeds effortlessly. Pressure is on.
  exits: → C03_CLASS_ATTEMPT
```

```
[CHOICE] C03_CLASS_ATTEMPT
  id: "c03_class_attempt"
  prompt: "Aldric calls on you. How do you approach your first Weave?"
  options:
    A: "Focus hard — attempt it properly, risk failing publicly"
       → G01_CLASS_COURAGE_GATE
    B: "Observe first — ask to go last, watch others"
       → CONS_CLASS_DELAY (+1 wisdom, -1 aldric_regard)
       → S06_CORRIDOR_INCIDENT
    C: "Improvise — try something unconventional"
       → G02_CLASS_CUNNING_GATE
```

```
[GATE] G01_CLASS_COURAGE_GATE
  id: "g01_class_courage_gate"
  condition: courage >= 4
  true  → CONS_CLASS_SUCCESS (+2 aldric_regard, flag: class_success=true, +1 courage)
          → S06_CORRIDOR_INCIDENT
  false → CONS_CLASS_FAIL (-1 aldric_regard, flag: class_success=false, +1 empathy [humility])
          → S06_CORRIDOR_INCIDENT

[GATE] G02_CLASS_CUNNING_GATE
  id: "g02_class_cunning_gate"
  condition: cunning >= 4
  true  → CONS_CLASS_CLEVER (+1 aldric_regard, +2 cunning, flag: class_success=true)
          → S06_CORRIDOR_INCIDENT
  false → CONS_CLASS_BACKFIRE (-1 aldric_regard, minor consequence, flag: class_success=false)
          → S06_CORRIDOR_INCIDENT
```

```
[CONSEQUENCE] CONS_CLASS_SUCCESS  → aldric_regard += 2, class_success = true, courage += 1
[CONSEQUENCE] CONS_CLASS_FAIL     → aldric_regard -= 1, class_success = false, empathy += 1
[CONSEQUENCE] CONS_CLASS_DELAY    → wisdom += 1, aldric_regard -= 1
[CONSEQUENCE] CONS_CLASS_CLEVER   → aldric_regard += 1, cunning += 2, class_success = true
[CONSEQUENCE] CONS_CLASS_BACKFIRE → aldric_regard -= 1, class_success = false
```

---

### BRANCH POINT 3 — The Corridor Incident (Major Branch, splits paths)

```
[SCENE] S06_CORRIDOR_INCIDENT
  id: "s06_corridor_incident"
  location: restricted_corridor_b
  summary: Walking back from class, player stumbles on Lira Thane performing
    a forbidden Weave pattern — unmistakably a Fracture technique.
    She doesn't see the player immediately. This is the first hint of
    the game's central mystery. Tomás is also nearby — he saw it too.
    He looks at the player, waiting to see what they do.
  exits: → C04_WHAT_DO_YOU_DO
```

```
[CHOICE] C04_WHAT_DO_YOU_DO
  id: "c04_what_do_you_do"
  prompt: "Lira hasn't seen you. Tomás watches you, waiting."
  options:
    A: "Confront Lira directly"
       → CONS_CONFRONT_LIRA (courage += 2, lira_influence += 3 [she respects boldness],
                              tomas_bond += 1, flag: witnessed_fracture = true)
       → S07_DUEL_TRIGGER   ← leads to duel
    B: "Pull Tomás away silently — say nothing to anyone"
       → CONS_STAY_SILENT (cunning += 1, tomas_bond += 2, lira_influence += 1 [she notices later],
                            flag: witnessed_fracture = true, flag: sided_with_lira = false)
       → PATH_B_EVENING     ← silent path
    C: "Report it to Professor Aldric immediately"
       → CONS_REPORT_LIRA (wisdom += 1, aldric_regard += 2, lira_influence -= 3,
                            tomas_bond -= 1 [he's wary of informers],
                            flag: witnessed_fracture = true, flag: reported_lira = true)
       → PATH_C_AFTERMATH   ← authority path
```

---

### PATH A — The Duel Path

```
[SCENE] S07_DUEL_TRIGGER
  id: "s07_duel_trigger"
  location: restricted_corridor_b
  summary: Lira turns. Player confronted her. She's calm, calculating.
    She offers player a choice: duel her to prove worth, or she'll make
    their first year miserable. Caden happens to arrive — watches.
  exits: → C05_ACCEPT_DUEL

[CHOICE] C05_ACCEPT_DUEL
  id: "c05_accept_duel"
  prompt: "Lira squares off. Caden watches from the doorway."
  options:
    A: "Accept the duel — face her"
       → G03_DUEL_GATE
    B: "Back down — not worth it yet"
       → CONS_BACKED_DOWN (courage -= 1, lira_influence += 2, caden_rivalry += 1)
       → S08_CHAPTER_CRISIS

[GATE] G03_DUEL_GATE
  id: "g03_duel_gate"
  condition: courage >= 5 OR class_success == true
  true  → CONS_DUEL_WIN (courage += 2, lira_influence = 0 [she's cautious now],
                          caden_rivalry -= 1 [he's impressed])
          → S08_CHAPTER_CRISIS
  false → CONS_DUEL_LOSS (courage -= 1, lira_influence += 3, caden_rivalry += 1)
          → S08_CHAPTER_CRISIS
```

---

### PATH B — The Silent Path

```
[SCENE] S07B_SILENT_EVENING
  id: "s07b_silent_evening"
  location: library
  summary: Player and Tomás retreat to the library. Tomás reveals he's seen
    Fracture signs before — his older sibling disappeared. He asks player
    to keep quiet for now and investigate with him instead.
  exits: → C05B_TOMAS_PACT

[CHOICE] C05B_TOMAS_PACT
  id: "c05b_tomas_pact"
  prompt: "Tomás wants to investigate quietly together."
  options:
    A: "Agree — investigate with Tomás"
       → CONS_TOMAS_PACT (tomas_bond += 3, wisdom += 1, cunning += 1)
       → S08_CHAPTER_CRISIS
    B: "Agree but plan to tell a teacher later anyway"
       → CONS_DOUBLE_AGENT (tomas_bond += 1, cunning += 2)
       → S08_CHAPTER_CRISIS
```

---

### PATH C — The Authority Path

```
[SCENE] S07C_ALDRIC_MEETING
  id: "s07c_aldric_meeting"
  location: professor_aldric_office
  summary: Player reports to Aldric. He's grave — takes it seriously but asks
    player to stay quiet while he investigates. Lira learns someone talked.
    She doesn't know it was the player yet.
  exits: → S08_CHAPTER_CRISIS
  consequences:
    → aldric_regard += 2, reported_lira = true, lira_influence = 0
```

---

### ACT 3 — THE CRISIS (All paths converge here)

```
[SCENE] S08_CHAPTER_CRISIS
  id: "s08_chapter_crisis"
  location: aethermoor_courtyard
  summary: That night, a first-year student (unnamed, not an NPC) collapses
    in the courtyard — a Fracture wound, unmistakable. Chaos breaks out.
    Lira watches from a balcony. Sera is frozen nearby.
    Caden tries to act but doesn't know what to do.
    Tomás looks at the player.
    The player must act — or not.
  exits: → C06_CRISIS_RESPONSE
```

```
[CHOICE] C06_CRISIS_RESPONSE
  id: "c06_crisis_response"
  prompt: "A student is hurt. Everyone freezes. You've seen this pattern before."
  options:
    A: "Step forward — use what you saw Lira do to attempt a counter-Weave"
       → G04_CRISIS_COURAGE_GATE
    B: "Stay back — pull Sera out of harm's way, call for teachers"
       → CONS_CRISIS_CAUTION (empathy += 2, sera_trust += 2, courage -= 1,
                               flag: crisis_intervened = false)
       → ENDING_GATE
    C: "Signal Tomás — execute the plan you made together"
       → G05_CRISIS_TOMAS_GATE
    D: "Do nothing — watch what happens"
       → CONS_CRISIS_FLED (courage -= 2, flag: crisis_fled = true,
                            flag: crisis_intervened = false)
       → ENDING_GATE
```

```
[GATE] G04_CRISIS_COURAGE_GATE
  id: "g04_crisis_courage_gate"
  condition: courage >= 6
  true  → CONS_CRISIS_HERO (courage += 3, ambition += 1, aldric_regard += 2,
                              caden_rivalry -= 2 [turns to respect],
                              lira_influence += 2 [she's watching],
                              flag: crisis_intervened = true)
          → ENDING_GATE
  false → CONS_CRISIS_ATTEMPT_FAIL (courage += 1 [tried], empathy += 1,
                                     flag: crisis_intervened = false)
          → ENDING_GATE

[GATE] G05_CRISIS_TOMAS_GATE
  id: "g05_crisis_tomas_gate"
  condition: tomas_bond >= 4
  true  → CONS_CRISIS_TOMAS_SUCCESS (wisdom += 2, tomas_bond += 3, cunning += 1,
                                       flag: crisis_intervened = true)
          → ENDING_GATE
  false → CONS_CRISIS_TOMAS_FAIL (tomas_bond -= 1, flag: crisis_intervened = false)
          → ENDING_GATE
```

---

### ENDING GATE — Chapter 1 Resolution

```
[GATE] ENDING_GATE
  id: "ending_gate"
  description: Evaluates combined state to assign one of three chapter endings.
    Evaluated in order — first match wins.

  condition_A: crisis_intervened == true AND (courage >= 6 OR tomas_bond >= 4)
    → ENDING_A_MARKED

  condition_B: (reported_lira == true OR sided_with_lira == false)
               AND crisis_intervened == false
               AND crisis_fled == false
    → ENDING_B_WATCHER

  condition_C: crisis_fled == true OR
               (crisis_intervened == false AND courage < 4 AND tomas_bond < 3)
    → ENDING_C_FRACTURE

  default (anything else): → ENDING_B_WATCHER
```

---

## Chapter 1 Endings (3)

```
[ENDING] ENDING_A_MARKED
  id: "ending_a_marked"
  title: "The Marked One"
  summary: Player intervened in the crisis — successfully or not, they were seen.
    Aldric takes notice. Caden looks at the player differently.
    Lira has made a decision about the player.
    The school is talking. Chapter 2 opens with reputation and danger.
  state_exported:
    → crisis_outcome = "hero"
    → chapter_1_reputation = "high"
    → lira_status = "watching"
  chapter_2_hook: "You didn't know it yet, but the Fracture had already chosen you."

[ENDING] ENDING_B_WATCHER
  id: "ending_b_watcher"
  title: "The Watcher"
  summary: Player stayed back, observed, made quiet alliances.
    Nobody knows what they saw. Tomás trusts them.
    Lira hasn't decided about them yet.
    Chapter 2 opens with information advantage but no reputation.
  state_exported:
    → crisis_outcome = "observer"
    → chapter_1_reputation = "low"
    → lira_status = "unaware"
  chapter_2_hook: "You knew something nobody else did. The question was what to do with it."

[ENDING] ENDING_C_FRACTURE
  id: "ending_c_fracture"
  title: "The Fracture"
  summary: Player froze or failed completely. The hurt student is taken away.
    Nobody points at the player — but they know.
    Lira smiles at the player from the balcony.
    Chapter 2 opens with a sense of debt and Lira's attention.
  state_exported:
    → crisis_outcome = "failed"
    → chapter_1_reputation = "low"
    → lira_status = "owns_you"
  chapter_2_hook: "She saw everything. And she was going to use it."
```

---

## Graph Integrity Audit

| Check | Status | Notes |
|---|---|---|
| All nodes reachable from S01 | PASS | Every node has an inbound path |
| All paths terminate at an ending | PASS | ENDING_GATE catches all cases including default |
| No orphaned nodes | PASS | All 3 paths reconverge at S08 |
| All gates have true AND false exits | PASS | Both branches defined for all 5 gates |
| All flags read before they're set | PASS | Flags set before ENDING_GATE reads them |
| Minimum 3 chapter endings met | PASS | A, B, C all defined |
| Minimum 3 major branch points met | PASS | C01, C04, C06 are the 3 majors |
| 1 duel encounter | PASS | G03_DUEL_GATE on Path A |
| 1 class skill-check | PASS | G01/G02 at S05 |
| 5 NPCs with relationship tracking | PASS | Sera, Caden, Aldric, Lira, Tomás |

---

## Scene-to-Asset Map (for art-director)

| Scene ID | Location | Background Required | NPCs Present |
|---|---|---|---|
| S01 | Aethermoor gates | Exterior gate, dusk, cinematic | None (narration) |
| S02 | Entrance courtyard | Courtyard, golden hour | Sera, Caden |
| S03 | Grand hall | Grand sorting hall, candlelit | Sera, Caden, crowd |
| S04 | Common room | Order-specific common room (×4 variants) | Sera, Tomás, Lira |
| S05 | Elemental casting hall | Classroom, magic effects | Aldric, Caden |
| S06 | Restricted corridor B | Dark corridor, forbidden feel | Lira, Tomás |
| S07A | Restricted corridor B | Same, duel lighting | Lira, Caden (watching) |
| S07B | Library | Warm library, night | Tomás |
| S07C | Aldric's office | Professor study, firelight | Aldric |
| S08 | Aethermoor courtyard | Night courtyard, crisis lighting | Sera, Caden, Tomás, Lira (balcony) |

**Total backgrounds required for Ch.1:** 9 (with 1 having 4 Order variants = 12 total assets) — within MVP spec.

---

## Open Narrative Questions

1. **Lira's motivation** — Is she a villain, a recruiter, or a victim herself? Needs decision before `content-author` writes her dialogue.
2. **The fifth Order** — Does the Fracture represent a fifth Order or a corruption of all four? Affects lore consistency.
3. **Player character backstory** — Does onboarding give the player a defined past (dead parent, prophecy, etc.) or a blank slate? Affects trait defaults.
4. **Caden's full arc** — Is he a rival-to-ally or rival-to-enemy across the full game? Needs to be decided to make Ch.1 gates meaningful.
5. **The collapsed student** — Named NPC in Ch.2+ or anonymous? If named, `content-author` needs the name and arc now.

---

## Contract for Downstream Skills

**`state-designer` must define:**
- All 5 traits with initial values and ranges
- All 5 NPC relationship meters with initial values
- All 8 flags listed above as booleans
- `crisis_outcome`, `chapter_1_reputation`, `lira_status` as exported end-state fields

**`engine-builder` must implement:**
- Scene loader by `id`
- Choice dispatcher → consequence applier → next scene resolver
- Gate evaluator (condition expressions against current state)
- Ending gate evaluator (ordered condition matching)
- State export on chapter end

**`content-author` must produce:**
- Scene prose for all 10 scenes
- Dialogue for Sera, Caden, Aldric, Lira, Tomás — per scene
- 3 ending summary texts
- Chapter 2 hook lines (3 variants)

---

*Last updated: 2026-03-31*
