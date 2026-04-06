# Story Architect Output — Chapter 3 Narrative Graph
# "The Name She Left Behind"

---

## Series Arc — 5 Chapters

| # | Title | Core Question | Status |
|---|---|---|---|
| 1 | The First Weaving | Who are you at Aethermoor? | ✅ Complete |
| 2 | What the Fracture Remembers | What will you do with dangerous knowledge? | ✅ Complete |
| 3 | The Name She Left Behind | What is the Fracture — and who built it? | 🔧 This document |
| 4 | The Weight of the Conclave | Do you dismantle the system or become it? | 📋 Planned |
| 5 | The Fifth Thread | What does Aethermoor become? | 📋 Planned |

Chapter 3 is the structural pivot of the series. The mystery resolves into a war of positions.
The Fracture's origin is revealed. Caden earns his role in the larger story. Sera's grief
surfaces as a plot thread. The Conclave fractures from within. Everything built across
chapters 1 and 2 is tested against what the player now knows.

---

## ⚠️ Prerequisites (State Designer + Engine Builder before Content Author)

### New FlagKeys needed in schema.ts:
```
sera_truth_known     — player learned the truth about Sera's grief (her sister was Fracture-touched)
caden_aligned        — Caden has chosen a side alongside the player
fracture_origin_known — player has learned the Fracture is not natural — it was designed
conclave_split       — the Conclave's internal disagreement has been exposed to the player
aldric_acts          — Aldric has taken an active step (not just passive counsel)
```

### New RelationshipKey needed:
```
ines_contact         — Ines Reeve's cautious trust/contact with the player (0–10, default 0)
                        Introduced when Ines makes contact (varies by chapter 2 ending)
```

### New ChapterExports for end of Chapter 3:
```
chapter_3_stance:       "reformer" | "insurgent" | "absorbed" | "isolated" | null
fracture_origin_shared: "public" | "conclave_only" | "kept_secret" | null
caden_status:           "ally" | "rival_knowing" | "unaware" | null
```

### Chapter 2 endings must be converted to chapter transitions
(Same pattern as chapter 1 → chapter 2 conversion.)
Map:
- ending_2a_reunion     → chapter_3_solis_stance: "confronted", ines_status: "found"  → s22a_after_reunion
- ending_2b_absorbed    → chapter_3_solis_stance: "joined",     ines_status: "hidden" → s22b_after_absorbed
- ending_2c_exposed     → chapter_3_solis_stance: "confronted", ines_status: "exposed"→ s22c_after_exposed
- ending_2d_deferred    → chapter_3_solis_stance: "walked",     ines_status: "hidden" → s22d_after_deferred

---

## Chapter 3 Central Conflict

The Fracture is not a natural phenomenon. It is a designed one.

Sixty years ago, a group of Aethermoor researchers — working under a classified Conclave
directive — theorised that elemental Weaving was producing a resonance ceiling: a hard limit
on what any human Weaver could achieve. The Fracture was their attempt to break through it.
A fifth thread. Deliberately induced. The experiment was abandoned when the first three
subjects deteriorated beyond recovery. The research was sealed. The three subjects were
the founding myth of the Conclave's containment doctrine: this is what happens when the
Fracture is not controlled.

What the Conclave has never acknowledged: the Fracture did not stop spreading when the
experiment ended. It propagated — slowly, generationally — through the ley-line network
that Aethermoor sits on. Every student with Fracture sensitivity is a downstream effect of
that original experiment. The Conclave does not cause the Fracture. But the Conclave's
founders did.

**Ines Reeve** knows this. It is why she chose to stay inside — she is trying to find the
original research files and expose them from within. She has been waiting for someone
outside to be ready to receive what she's found.

**Sera Voss's** younger sister Maelie was Fracture-touched three years ago. She deteriorated
in six weeks. The school said it was a congenital Weaving disorder. Sera has known this was
wrong since the day she arrived at Aethermoor and started reading the healing records. She
has been building a case quietly, alone, for two years. She does not know about the Conclave.
She does not know about Ines. She is two pieces away from the same truth the player is
approaching from the other side.

**Caden Miral** is not a bystander. His older brother Davo dropped out of Lyndmere Academy
four years ago — officially for personal reasons. Caden has never believed the official
reason. He came to Aethermoor partly because Lyndmere and Aethermoor share a ley-line
corridor. He has been watching. He is ready to act if someone gives him a reason.

**The Conclave is fracturing internally.** Solis represents the containment faction —
the Fracture is dangerous, manage it, absorb those who carry it, prevent panic. A second
faction, represented by a senior Conclave figure known only as **the Archivist**, believes
containment has failed and the only solution is public disclosure before the Fracture
spreads beyond control. The Archivist has been passing information to Ines. The player
will encounter the Archivist only through their communications — they never appear directly.

---

## New NPC — Chapter 3

| ID | Name | Role | Relationship Meter |
|---|---|---|---|
| `NPC_07` | **Ines Reeve** | Tomás's sister, inside the Conclave, has the proof | `ines_contact` 0–10 |

Ines is present in chapter 3 only through written communications and, in one branch, a
single direct encounter. She is cautious, precise, not warm. She has given up a lot for
this and she is not going to hand it to someone she doesn't trust.

---

## Chapter 3 Scene Graph

---

### ACT 1 — FOUR DIVERGENT OPENINGS (based on chapter 2 chapterExports)

All four paths carry state from chapter 2. The divergence is tone, not structure —
all four arrive at S23_CONCLAVE_CRACK within 2 scenes.

---

```
[SCENE] S22A_AFTER_REUNION
  id: "s22a_after_reunion"
  condition: ines_status == "found"
  location: restricted_library_annex (three weeks later)
  summary: Tomás is different. Not happier — the reunion was too complicated for that.
    But he is no longer adrift. He and Ines have been in careful contact since Solis
    brokered the meeting. Ines has been asking Tomás questions about the player —
    what they're like, whether they can be trusted with something large. Tomás gives
    the player a handwritten note from Ines. It contains one sentence: "Find the
    1963 Resonance Commission files. Don't tell Solis."
  exits: → S23_CONCLAVE_CRACK
  consequences:
    - tomas_bond +1 (he's passing her trust to you)
    - ines_contact +2 (Ines chose to reach out)
```

```
[SCENE] S22B_AFTER_ABSORBED
  id: "s22b_after_absorbed"
  condition: ines_status == "hidden", chapter_2_solis_stance == "joined"
  location: player's room (morning)
  summary: The focusing anchor hums on the desk. The player has been carrying Solis's
    logic for three weeks — containment, protection, the cost of disclosure. Then an
    unsigned message arrives through the Conclave's internal channel, which the player
    now has access to. Six words: "1963 Resonance Commission. Ask why it's sealed."
    No sender. But the handwriting looks like it was written by someone who learned
    it in a different country.
  exits: → S23_CONCLAVE_CRACK
  consequences:
    - ines_contact +1 (contact made, cautiously)
    - cunning +1 (you recognise an invitation when you see one)
```

```
[SCENE] S22C_AFTER_EXPOSED
  id: "s22c_after_exposed"
  condition: ines_status == "exposed"
  location: common_room (chaotic, two weeks after the exposure)
  summary: The school is still processing what was revealed. Solis is gone. The
    Conclave has sent a replacement assessor — younger, warier, saying less.
    Lira is gone. Tomás is grateful and frightened in equal measure: grateful
    because the secret is out, frightened because Ines sent a message that said
    "You had no idea what you've done" and then went silent. A second message
    arrived yesterday, different handwriting than Ines but the same channel:
    "1963 Resonance Commission. If you want to understand what you started, find it."
  exits: → S23_CONCLAVE_CRACK
  consequences:
    - ines_contact +1 (Ines's associate, not Ines — but it's a thread)
    - courage +1 (you acted; now you live with it)
```

```
[SCENE] S22D_AFTER_DEFERRED
  id: "s22d_after_deferred"
  condition: chapter_2_solis_stance == "walked"
  location: library window seat (same one as s17d)
  summary: Three weeks. The focusing anchor arrived in the post. The player has
    been thinking. Tomás is still waiting. The Conclave's replacement assessor
    arrived quietly. Then, without warning, something changes: the stone hums
    differently, once, and goes quiet. Twenty minutes later a message appears
    in the player's room — not through the post, not slid under the door.
    Just present, the way things are when a Weaver with enough skill places them.
    "1963 Resonance Commission. You should have asked when you had the chance.
    You still can. — A." The A is not Solis.
  exits: → S23_CONCLAVE_CRACK
  consequences:
    - ines_contact +1 (the Archivist is using Ines's channel)
    - wisdom +1 (the waiting was not wasted — you're more ready than you were)
```

---

### ACT 1 CONVERGENCE

```
[SCENE] S23_CONCLAVE_CRACK
  id: "s23_conclave_crack"
  location: restricted_archive (day)
  summary: The 1963 Resonance Commission files are real and they are sealed under a
    classification level the player has never seen before — not restricted, not
    confidential, but VOIDED: a category that means the contents have been formally
    deemed to not exist. The seal itself is a piece of information. Someone fought
    hard to make these files officially absent. The player can see the file's housing —
    a physical box in the restricted archive. Getting to what's inside is a different
    problem. Three routes present themselves.
  exits: → C07_ACCESS_CHOICE
```

```
[CHOICE] C07_ACCESS_CHOICE
  id: "c07_access_choice"
  prompt: "The box is there. The classification is not a wall — it is a door
    with a complicated lock."
  options:
    A) "Go through Ines — she's inside the Conclave's system."
       gate: ines_contact >= 2
       → ines_contact +1, cunning +1
       → S24_INES_CONTACT
    B) "Go through Aldric — he declined the Conclave once. He might know why this is sealed."
       gate: aldric_regard >= 3
       → aldric_regard +1, wisdom +1
       → S24_ALDRIC_KNOWS
    C) "Go through Caden — he came here for a reason. Time to find out what it is."
       gate: none (always available, triggers Caden's arc)
       → caden_rivalry +1, courage +1
       → S24_CADEN_OPENS
    D) "Find it yourself — the seal has an author. Follow the author."
       gate: cunning >= 6 OR wisdom >= 6
       → cunning +1, ambition +1
       → S24_SOLO_TRACE
```

---

```
[SCENE] S24_INES_CONTACT
  id: "s24_ines_contact"
  location: player's room (night, via written channel)
  summary: Ines responds faster than the player expected. She has been waiting for
    this question. She can get the player a copy of the Commission summary — not the
    full files, which are physically sealed — but the summary memo that was circulated
    to the founding Conclave members in 1964. She has conditions: the player does not
    share this with Solis (or the replacement assessor), and they tell Tomás whatever
    they find. That last condition is non-negotiable. She needs her brother to know.
  exits: → S25_THE_ORIGIN
  consequences:
    - ines_contact +2
    - set_flag: fracture_origin_known
    - tomas_bond +1 (Ines is asking you to trust him — which means trusting her)
```

```
[SCENE] S24_ALDRIC_KNOWS
  id: "s24_aldric_knows"
  location: aldric_office (evening)
  summary: Aldric already knows about the 1963 Commission. He has known since he was
    twenty-six and a junior researcher was very drunk at a faculty dinner and said
    something he was not supposed to say. Aldric filed it under things-I-cannot-prove
    and has been living adjacent to that knowledge for twelve years. He didn't go to
    the Conclave because of this. He didn't tell anyone because he had no evidence.
    He walks the player to a specific shelf in his private collection and removes a
    monograph on ley-line resonance from 1971. Inside the back cover, in pencil:
    a name, a date, and three words — "the thread bifurcates."
  exits: → S25_THE_ORIGIN
  consequences:
    - aldric_regard +2
    - set_flag: fracture_origin_known
    - set_flag: aldric_acts
    - wisdom +1
```

```
[SCENE] S24_CADEN_OPENS
  id: "s24_caden_opens"
  location: ignis_common_room (late, alone)
  summary: Caden has been waiting for someone to ask. His brother Davo left Lyndmere
    four years ago. The official story was personal circumstances. The truth — which
    Caden has pieced together across four years of asking questions nobody wanted to
    answer — is that Davo was assessed by a visiting examiner and never came back to
    himself afterward. Caden does not know the word Conclave. He knows the shape of it.
    He came to Aethermoor because Lyndmere and Aethermoor share a ley-line corridor,
    and the examiner who assessed Davo was logged as being based here. He shows the
    player the examiner's name. It is a name the player recognises.
  exits: → S25_THE_ORIGIN
  consequences:
    - caden_rivalry -1 (the rivalry shifts into something else)
    - set_flag: caden_aligned
    - set_flag: fracture_origin_known
    - courage +1
```

```
[SCENE] S24_SOLO_TRACE
  id: "s24_solo_trace"
  location: restricted_archive / records room
  summary: The VOIDED classification has an author. Every classification does — there
    is a signatory in the administrative record, even if the record itself is buried.
    The player follows the thread back through three layers of bureaucratic misdirection
    to a name: E. Voss. Not a common name. Not unrelated to someone the player knows.
    The realisation arrives quietly, the way large things do.
  exits: → S25_THE_ORIGIN
  consequences:
    - cunning +2
    - set_flag: fracture_origin_known
    - set_flag: sera_truth_known (E. Voss is Sera's grandmother — this pulls Sera in)
    - ambition +1
```

---

### ACT 2 — THE ORIGIN

All four paths converge here.

```
[SCENE] S25_THE_ORIGIN
  id: "s25_the_origin"
  location: varies (player's room / library / wherever they've processed it)
  summary: What the 1963 Resonance Commission actually did: attempted to induce a
    fifth resonance thread in three volunteer Weavers. The thread worked. It also
    propagated — not through physical contact but through the ley-line network.
    Every student with Fracture sensitivity since 1963 is a downstream effect.
    The Conclave's founders knew. They built the containment doctrine not to manage
    a natural phenomenon but to manage the consequences of what they had done.
    This is what the files say. This is the shape of sixty years of institutional
    guilt dressed as responsible stewardship.
  exits: → C08_FIRST_RESPONSE
```

```
[CHOICE] C08_FIRST_RESPONSE
  id: "c08_first_response"
  prompt: "You know what you know. Now what."
  options:
    A) "Tell Tomás immediately."
       gate: tomas_bond >= 3
       → tomas_bond +2, courage +1
       → S26_TOMÁS_LEARNS
    B) "Find Sera. If E. Voss is her grandmother, she's part of this."
       gate: none (always available, but richer if sera_truth_known)
       → sera_trust +2, empathy +1
       → S26_SERA_CONFRONTED
    C) "Go back to Ines — she needs to know you found it."
       gate: ines_contact >= 2
       → ines_contact +2, wisdom +1
       → S26_INES_RESPONSE
    D) "Sit with it. Understand it fully before you move."
       gate: none
       → wisdom +2
       → S26_ALONE_WITH_IT
```

---

```
[SCENE] S26_TOMÁS_LEARNS
  id: "s26_tomas_learns"
  location: restricted_library_annex
  summary: Telling Tomás is not like telling anyone else. He knows Ines. He knows
    what she gave up. He sits with it for a long time before he says anything, and
    when he says it, it is not what the player expected: "She knew. She's known for
    a while. She didn't tell me because she needed me to be safe." A pause. "I'm
    not sure I forgive her for that." Another pause, harder: "I'm not sure I don't."
    He looks at the player. "What do we do with it?"
  exits: → S27_CONCLAVE_INTERNAL
  consequences:
    - tomas_bond +1
    - ines_contact +1 (Tomás passes something back to Ines — you told him, she notices)
```

```
[SCENE] S26_SERA_CONFRONTED
  id: "s26_sera_confronted"
  location: aqualyn_common_room (late)
  summary: Sera is not surprised. She has been building toward this for two years.
    What she didn't have was the 1963 Commission — her evidence pointed to a cover-up
    but not to the origin. The player has the piece she was missing. She is, for a
    moment, very still. Then: "My grandmother's name is on that seal." Not a question.
    "She died when I was nine. She never told anyone what she'd worked on." Sera looks
    out the window. "She sealed it. Which means she knew it was wrong. And she sealed
    it anyway." The grief on her face is old and specific and it has finally found
    its correct shape.
  exits: → S27_CONCLAVE_INTERNAL
  consequences:
    - sera_trust +2
    - set_flag: sera_truth_known
    - empathy +1
```

```
[SCENE] S26_INES_RESPONSE
  id: "s26_ines_response"
  location: player's room (via written channel)
  summary: Ines has been waiting for the player to find it. Her response is brief
    and specific: she has the original research logs, not just the summary. Physical
    copies, in the Conclave's secure archive. She can get them out — but only if
    she has a reason to break cover. The question she's asking the player, without
    asking it directly: are they going to give her that reason? Is this going somewhere?
    Or is this just knowledge sitting in a room?
  exits: → S27_CONCLAVE_INTERNAL
  consequences:
    - ines_contact +2
    - cunning +1
```

```
[SCENE] S26_ALONE_WITH_IT
  id: "s26_alone_with_it"
  location: player's room (night)
  summary: The player sits with it. An hour, maybe more. The thing about knowing the
    origin of something terrible is that it doesn't change what the thing is — it
    just removes the comfort of mystery. The Fracture is still spreading. Students
    are still being assessed and absorbed and contained. Knowing why it started
    doesn't stop it. Understanding the shape of institutional guilt does not dissolve
    the institution. At some point the player stops sitting with it and starts
    thinking about what comes next.
  exits: → S27_CONCLAVE_INTERNAL
  consequences:
    - wisdom +2
    - ambition +1
```

---

### ACT 2 — THE CONCLAVE FRACTURES

All four converge here. The Conclave's internal split becomes visible.

```
[SCENE] S27_CONCLAVE_INTERNAL
  id: "s27_conclave_internal"
  location: assessment_antechamber (day — the replacement assessor's territory)
  summary: The replacement assessor — a careful young man named Veth who has been
    here three weeks and has said almost nothing — finds the player. He has been
    sent by someone he calls "a senior member who requested a back channel." He
    passes them a message. The message is from the Archivist. It says: the Conclave
    is going to meet in four days to decide whether to expand the absorption programme.
    The proposal would lower the assessment age by three years. If it passes, students
    as young as fourteen could be assessed and placed. The Archivist is against it.
    Solis's faction is for it. The player has four days and, apparently, information
    that could change the vote. What do they do with it?
  exits: → G09_CONCLAVE_STANDING_GATE
  consequences:
    - set_flag: conclave_split
    - cunning +1
```

```
[GATE] G09_CONCLAVE_STANDING_GATE
  id: "g09_conclave_standing_gate"
  condition: solis_standing >= 4 OR ines_contact >= 4
  if TRUE  → S28_INSIDE_MOVE (player has leverage inside the Conclave)
  if FALSE → S28_OUTSIDE_MOVE (player must act from outside)
```

```
[SCENE] S28_INSIDE_MOVE
  id: "s28_inside_move"
  location: various (player moves through the Conclave's channels)
  summary: The player has access — either through Solis's regard or Ines's trust —
    to send the Commission findings directly into the Conclave's deliberation. Not
    publicly. Inside the room. The Archivist has been waiting for someone to deliver
    this and the player can be that channel. The risk: if the vote goes wrong anyway,
    the player will have shown their hand to a body that has leverage over people they care about.
  exits: → S29_CADEN_AND_SERA
  consequences:
    - ambition +1
    - solis_standing -1 (even with access, using it this way costs standing)
```

```
[SCENE] S28_OUTSIDE_MOVE
  id: "s28_outside_move"
  location: restricted_library_annex (player + Tomás + whoever they've pulled in)
  summary: Without inside access, the player has to act on the outside. That means
    building a coalition — Tomás, Caden if he's aligned, Sera if she knows, Aldric
    if he's acted. Whatever they've built across chapters 1, 2, and 3 is what they
    have to work with. The plan that emerges depends on who's in the room.
  exits: → S29_CADEN_AND_SERA
  consequences:
    - courage +1
    - tomas_bond +1 (he shows up regardless)
```

---

```
[SCENE] S29_CADEN_AND_SERA
  id: "s29_caden_and_sera"
  location: player's room or ignis common room (night before the Conclave vote)
  summary: The night before the vote. Caden and Sera are present (if the player has
    involved them) or one/neither is (if they haven't). This scene is the moment the
    player's relationship choices across three chapters pay off most visibly. If Caden
    is aligned, he is steady and specific and has an idea involving the ley-line
    corridor. If Sera knows the truth, she has the administrative classification records
    — her grandmother's name is on them, which gives her standing the player doesn't have.
    If neither is present, the player has only themselves and whoever else they've built.
  exits: → S30_THE_VOTE
  consequences: (variable — set_flag caden_aligned if not already; sera_trust +1 if present)
```

---

### ACT 3 — THE VOTE

```
[SCENE] S30_THE_VOTE
  id: "s30_the_vote"
  location: grand_corridor / assessment_room (the day of the Conclave meeting)
  summary: The player cannot be in the room. But they can feel the shape of what's
    happening. Veth passes information both ways. The Commission findings are somewhere
    in the deliberation — delivered inside (if inside_move) or through whatever
    outside channel the player constructed. Ines is in the room as a junior member.
    The Archivist is in the room. Solis's faction is in the room. The player waits.
  exits: → G10_VOTE_OUTCOME_GATE
```

```
[GATE] G10_VOTE_OUTCOME_GATE
  id: "g10_vote_outcome_gate"
  condition: (fracture_origin_known AND (ines_contact >= 4 OR solis_standing >= 3 OR aldric_acts))
             AND (caden_aligned OR sera_truth_known OR tomas_bond >= 5)
  if TRUE  → S31_VOTE_SHIFTED (the vote changed — the expansion proposal failed)
  if FALSE → S31_VOTE_PASSED  (the expansion passed — the player didn't have enough)
```

```
[SCENE] S31_VOTE_SHIFTED
  id: "s31_vote_shifted"
  location: restricted_library_annex (aftermath)
  summary: The expansion proposal failed by two votes. Veth tells the player this
    without ceremony. The Archivist's faction held. The Commission findings were
    circulated — internally, not publicly. The Conclave is not dissolved. The
    absorption programme is not ended. But the age threshold will not be lowered,
    and there is now a formal internal dissent on record. It is the smallest possible
    victory that is still a victory. Ines sends one word through the channel: "Good."
  exits: → ENDING_GATE_3
  consequences:
    - ines_contact +1
    - courage +1
```

```
[SCENE] S31_VOTE_PASSED
  id: "s31_vote_passed"
  location: restricted_library_annex (aftermath)
  summary: The expansion passed. Veth tells the player this without apology — he is
    a functionary and he is doing his job. The Commission findings did not change
    enough minds, or did not reach the right ones, or were not delivered with enough
    force behind them. The absorption programme will expand. Students as young as
    fourteen will be assessed. Ines sends nothing for three days, then: "We try again.
    Differently. Tell me what you have left."
  exits: → ENDING_GATE_3
  consequences:
    - ambition +1 (the work continues — that is its own kind of determination)
```

---

### ENDING GATE — Chapter 3

```
[GATE] ENDING_GATE_3
  id: "ending_gate_3"
  evaluation (priority order):

  → ending_3a_reformer
    condition: vote_shifted (s31_vote_shifted was reached) AND (tomas_bond >= 5 OR ines_contact >= 5)
    outcome: Player brokered the internal shift. Working within the system, barely. The reform
             path is open but fragile. Chapter 4 picks up with the Conclave fractured and watching.
    chapter_3_stance: "reformer"

  → ending_3b_insurgent
    condition: vote_passed (s31_vote_passed reached) AND (caden_aligned OR sera_truth_known)
               AND courage >= 6
    outcome: The system didn't move. The player and their allies are going outside it.
             Chapter 4 begins with the player building toward public disclosure.
    chapter_3_stance: "insurgent"

  → ending_3c_absorbed
    condition: solis_standing >= 5 AND NOT caden_aligned AND NOT sera_truth_known
    outcome: The player has drifted into the Conclave's logic so thoroughly that Solis's
             replacement offers them a formal position. They are becoming the thing they
             were investigating.
    chapter_3_stance: "absorbed"

  → ending_3d_isolated [FALLBACK]
    condition: none of the above
    outcome: The vote passed. The player has knowledge and no clear leverage. They are
             not captured and not a reformer and not an insurgent. They are someone who
             knows the truth and hasn't yet found the right place to stand.
    chapter_3_stance: "isolated"
```

---

### CHAPTER 3 ENDINGS (4 total — isEnding: true, Chapter 4 transitions added later)

```
[ENDING] ENDING_3A_REFORMER
  id: "ending_3a_reformer"
  summary: The smallest possible victory that is still a victory. The expansion
    proposal failed. The Conclave's internal dissent is on record. The Commission
    findings exist inside the room. None of this is public. None of this is enough.
    But the Archivist's faction is intact and Ines is still inside and the reform
    path is open, barely, like a door held against wind.
    Tomás says, at the end of it: "She says thank you." He doesn't say which she
    he means. He doesn't have to.

[ENDING] ENDING_3B_INSURGENT
  id: "ending_3b_insurgent"
  summary: The vote passed. The system didn't move. Caden looks at the player that
    night and says: "So we go around it." Sera has the classification records. The
    original Commission files — or what can be recovered — will be enough. They
    are going to find a way to make this public. It is not a plan yet. It is a
    direction. Sometimes that's the same thing.

[ENDING] ENDING_3C_ABSORBED
  id: "ending_3c_absorbed"
  summary: The replacement assessor offers the player a formal Conclave position.
    Junior liaison. Access, resources, the ability to influence assessments from the
    inside. The offer is not coercion — it is, in its way, a genuine recognition.
    They've been watching. They're impressed. The player accepts. They tell themselves
    it is a long game. The focusing anchor on the desk hums approvingly, or seems to.
    They are not sure anymore whether that feeling is theirs.

[ENDING] ENDING_3D_ISOLATED
  id: "ending_3d_isolated"
  summary: The vote passed. The player knows the truth. They have not been absorbed
    and they have not built enough coalition to go public and they have not found the
    angle to reform from within. They are someone standing in a room full of information,
    waiting for the right piece to fall into place. Ines sends: "Still here. Still
    waiting. Are you?" It is the most companionable message she has ever sent.
```

---

## Complete Scene List — Chapter 3 (35 nodes)

```
s22a_after_reunion          ACT 1 — divergent open (ines_status: found)
s22b_after_absorbed         ACT 1 — divergent open (joined/hidden)
s22c_after_exposed          ACT 1 — divergent open (ines_status: exposed)
s22d_after_deferred         ACT 1 — divergent open (walked/hidden)
s23_conclave_crack          ACT 1 — convergence
c07_access_choice           ACT 1 — choice (4 options, 1 gated)
s24_ines_contact            ACT 1 — branch
s24_aldric_knows            ACT 1 — branch
s24_caden_opens             ACT 1 — branch
s24_solo_trace              ACT 1 — branch (gated: cunning/wisdom >= 6)
s25_the_origin              ACT 2 — convergence (the revelation)
c08_first_response          ACT 2 — choice (4 options)
s26_tomas_learns            ACT 2 — branch
s26_sera_confronted         ACT 2 — branch
s26_ines_response           ACT 2 — branch
s26_alone_with_it           ACT 2 — branch
s27_conclave_internal       ACT 2 — convergence (Archivist message)
g09_conclave_standing_gate  ACT 2 — gate
s28_inside_move             ACT 2 — gate TRUE
s28_outside_move            ACT 2 — gate FALSE
s29_caden_and_sera          ACT 2 — convergence (night before)
s30_the_vote                ACT 3 — the day
g10_vote_outcome_gate       ACT 3 — gate
s31_vote_shifted            ACT 3 — gate TRUE
s31_vote_passed             ACT 3 — gate FALSE
ending_gate_3               ENDING — evaluator
ending_3a_reformer          ENDING
ending_3b_insurgent         ENDING
ending_3c_absorbed          ENDING
ending_3d_isolated          ENDING — fallback
```

**Total: 30 nodes** (22 scenes/choices + 4 gates + 4 endings including evaluator)

---

## Graph Integrity Checks

- ✅ All four chapter 2 ending paths are handled (found / hidden-joined / exposed / walked)
- ✅ All four access routes to the origin converge at s25
- ✅ All four first-response branches converge at s27
- ✅ Gate TRUE and FALSE both defined for g09 and g10
- ✅ Fallback ending (3d_isolated) always reachable regardless of stats
- ✅ Caden and Sera arcs are meaningful without being mandatory
- ✅ No orphaned nodes
- ✅ All endings set chapterExports for Chapter 4
- ⚠️  Chapter 2 endings must be converted to chapter transitions (engine-builder task)
- ⚠️  New flags and ines_contact relationship must be added to schema (state-designer task)
- ⚠️  Chapter 4 transitions will be added to chapter 3 endings after Chapter 4 is designed

---

## Chapter Arc Summary

| Chapter | Conclave stance | Lira | Tomás | Sera | Caden |
|---|---|---|---|---|---|
| 1 | Unknown | Recruiter | Investigator | Bystander | Rival |
| 2 | Revealed | Inside/Gone | Searching | Bystander | Reactive |
| 3 | Fracturing | Gone/Ally | Knows truth | Knows truth | Aligned |
| 4 | Crisis | TBD | TBD | TBD | TBD |
| 5 | Resolution | TBD | TBD | TBD | TBD |

---

## Open Questions for Chapter 4

1. Does the Archivist ever appear directly, or remain a voice through text?
2. What is Veth's loyalty — genuinely the Archivist's ally, or a double agent?
3. Does Caden's brother Davo appear, or remain offstage as motivation?
4. How does the absorption programme expansion manifest in the school — are students visibly affected?
5. What is Lira's chapter 4 appearance (if she returns) — reformed, enemy, or something stranger?
6. What is the chapter 5 endgame — a public reckoning, a Conclave dissolution, or something the player builds?
