# Story Architect Output — Chapter 4 Narrative Graph
# "The Weight of the Conclave"

---

## Series Arc — 5 Chapters

| # | Title | Core Question | Status |
|---|---|---|---|
| 1 | The First Weaving | Who are you at Aethermoor? | ✅ Complete |
| 2 | What the Fracture Remembers | What will you do with dangerous knowledge? | ✅ Complete |
| 3 | The Name She Left Behind | What is the Fracture — and who built it? | ✅ Complete |
| 4 | The Weight of the Conclave | Do you dismantle the system or become it? | 🔧 This document |
| 5 | The Fifth Thread | What does Aethermoor become? | 📋 Planned |

Chapter 4 is the penultimate chapter. The mystery phase is over. This is the chapter where
everything the player built — every relationship, every piece of evidence, every strategic choice —
is tested against a real and irreversible confrontation with the Conclave. Three things happen
that have never happened before: Caden's brother Davo appears in person. The absorption
programme's expansion becomes physically visible in the school. And the Archivist — who has
existed only through written messages since Chapter 2 — appears directly, once, in one branch.

Chapter 4 answers the questions Chapter 3 opened. What the player carries out of it is what
Chapter 5 has to work with.

---

## ⚠️ Prerequisites (State Designer + Engine Builder before Content Author)

### Answers to Chapter 3 Open Questions

1. **The Archivist** appears directly exactly once, in `s40_archivist_in_person` (gate-locked).
   They are not revealed elsewhere. Their single appearance must carry the weight of three chapters
   of absence — write accordingly.
2. **Veth's loyalty**: genuinely the Archivist's ally; not a double agent. He is outgunned and
   transferred if the governance session holds. Tragedy of limited position, not betrayal.
3. **Caden's brother Davo**: appears in person in Chapter 4. He is the chapter's emotional core
   and the clearest illustration of what "absorbed" actually means at human scale.
4. **Absorption expansion manifest**: a visible cohort of students aged 12–14 arrives at
   Aethermoor for "special assessments." They can be seen in the intake courtyard. This is the
   stakes made concrete.
5. **Lira's return**: she returns in Chapter 4 — transferred out of Aethermoor officially, but
   living nearby, no longer inside the Conclave, not yet fully free. Changed, not diminished.
6. **Chapter 5 endgame**: shaped entirely by `chapter_4_stance`. The full documentation package
   is in the player's hands at the end of Chapter 4. Chapter 5 is the act of deciding what it
   is for.

---

### New FlagKeys needed in schema.ts:
```
davo_encountered     — player has met Davo Miral in person
davo_truth_known     — Caden understands what happened to his brother (not just that he's there)
veth_protected       — player acted to shield Veth from the Conclave's summons
archivist_revealed   — the Archivist has appeared in person to the player
lira_returned        — Lira Thane has made contact in Chapter 4
```

NOTE: `veth_broken` was initially proposed as a failure-state flag (Veth breaks under governance
pressure and exposes the Archivist). It is NOT implemented in Chapter 4 — the governance session
has two outcomes (breaks / holds), neither routed through a Veth-collapses path. The flag has
been removed from the Chapter 4 schema. If Chapter 5 adds a Veth-collapse arc (e.g. the
governance session aftermath reveals Veth broke in private), it can be re-added then with full
gate wiring. `veth_status: "broken"` remains a valid export value for that eventuality.

### New RelationshipKey needed:
```
lira_trust           — trust between the player and Lira (0–10, default carries from lira_influence)
                       lira_influence tracked the power dynamic (Ch1–3). lira_trust tracks
                       what's left after the power dynamic dissolved. Initialise at:
                       lira_influence >= 3 → lira_trust 2
                       lira_influence < 3 → lira_trust 0
```

### New ChapterExports for end of Chapter 4:
```
chapter_4_stance:  "threshold" | "exposure" | "architect" | "catalyst" | null
veth_status:       "protected" | "broken" | "transferred" | null
davo_outcome:      "reached" | "lost" | "testified" | null
lira_status_ch4:   "ally" | "gone" | "watched" | null
```

### Chapter 3 endings must be converted to chapter transitions
Map:
- ending_3a_reformer  → chapter_3_stance: "reformer",  conclave_split: true  → s32a_after_reformer
- ending_3b_insurgent → chapter_3_stance: "insurgent", caden_aligned: true   → s32b_after_insurgent
- ending_3c_absorbed  → chapter_3_stance: "absorbed",  solis_standing >= 5   → s32c_after_absorbed
- ending_3d_isolated  → chapter_3_stance: "isolated"                         → s32d_after_isolated

---

## Chapter 4 Central Conflict

The Conclave's expansion programme is no longer theoretical. Twelve students aged twelve to fourteen
arrived this week for what the school has been told are "extended assessments." Davo Miral — Caden's
older brother, absorbed four years ago — is leading the intake process.

Davo is not a prisoner. This is the thing that complicates everything. He chose to stay. He would
choose it again. What the Conclave did to him is not destruction — it is a kind of reorganisation,
and the person who accepted that reorganisation is still, in some recognisable sense, Caden's
brother. This is harder than cruelty. It is the system at its most persuasive.

At the same time, the Conclave's internal fault line has reached a crisis point. Veth — the
replacement assessor who has been passing messages between the Archivist and the player since
Chapter 3 — has been summoned to appear before the Conclave's central governance body and explain
the "irregular communications" routed through his position. He has 48 hours. If he breaks, the
Archivist's identity is exposed and every avenue into the Conclave closes.

Lira Thane returned two weeks ago. She is not at Aethermoor — she is staying somewhere nearby,
without clearance to be on school grounds. She came back because there is something she needs to
finish. She is being watched.

The player has 48 hours and a governance session on the horizon. What they do in that window
determines what Chapter 5 has to build on.

---

## New NPC — Chapter 4

| ID | Name | Role | Relationship Meter |
|---|---|---|---|
| `NPC_08` | **Davo Miral** | Caden's older brother, Conclave operative (absorbed) | none — not a relationship, a question |
| `NPC_09` | **Lira Thane** | Returned from transfer, no longer inside the Conclave, not free | `lira_trust` 0–10 |
| — | **The Archivist** | Senior Conclave member, thirty-one years inside, twenty-two working against it | accessed through `ines_contact` |

**Davo characterisation**: Older than Caden expected — not in years, in weight. Precise, efficient,
organised around work in the way human feeling sometimes reorganises itself when feeling becomes
unsafe. He is not cold. He remembers his brother with something that looks like real affection.
But the affection is contained in a way that makes it worse to watch, not better.

**Lira characterisation**: Changed. Not diminished. She helped design parts of the internal
accountability process she is now being watched by. She knows the Conclave from the inside out.
She returned because she couldn't finish what she started without returning. She is not going to
pretend the last two chapters were simple.

**The Archivist characterisation**: Late sixties, small, precise, dressed like a scholar rather
than an official. Has been inside the Conclave for thirty-one years. Has been working against it
for twenty-two of those years, not from heroism but from accumulated moral debt that has compounded
beyond what silence can service. They are not a saviour. They are someone trying to build their
way out of a compromise they made when they were thirty-seven.

---

## Chapter 4 Scene Graph

---

### ACT 1 — FOUR DIVERGENT OPENINGS (based on chapter_3_stance)

All four paths carry state from Chapter 3. All four arrive at S35_THE_ARRIVALS within 2 scenes.

---

```
[SCENE] S32A_AFTER_REFORMER
  id: "s32a_after_reformer"
  condition: chapter_3_stance == "reformer"
  location: restricted_library_annex (three weeks later)
  summary: The Archivist's faction has been quietly active — reforming assessment language,
    creating a formal internal review committee. It has felt like progress. Then an Ines
    message arrives, shorter than usual: "The expansion is happening. They found a workaround.
    New assessment teams. Outside Aethermoor's faculty jurisdiction. They've sent someone from
    inside operations to lead the first cohort." An hour later, a second message arrives through
    a different channel — Caden, standing in the corridor, holding a notice from the intake
    office. The name on it is his brother's.
  exits: → S35_THE_ARRIVALS
  consequences:
    - ines_contact +0 (she's strained — the reform didn't hold everything)
    - cunning +1 (you learned to read partial victories; this is what they look like)
```

```
[SCENE] S32B_AFTER_INSURGENT
  id: "s32b_after_insurgent"
  condition: chapter_3_stance == "insurgent"
  location: player's room / somewhere off-channel
  summary: The public disclosure plan has shape but no mechanism. They have the Commission
    files, Sera's classification records, names. What they don't have is a way to release it
    that the Conclave cannot suppress. Caden has been working on it — he found someone at
    Lyndmere who knows how to move information through networks the Conclave doesn't monitor.
    Then he goes quiet for two days. When he comes back, his face has changed. He shows the
    player a photograph. His brother Davo is standing in Aethermoor's intake courtyard,
    wearing an assessor's badge.
  exits: → S35_THE_ARRIVALS
  consequences:
    - courage +1 (you're still moving; now the stakes are visible)
```

```
[SCENE] S32C_AFTER_ABSORBED
  id: "s32c_after_absorbed"
  condition: chapter_3_stance == "absorbed"
  location: assessment_antechamber (the player's Conclave space)
  summary: Three weeks as junior liaison. Access, briefings, the occasional message from Veth
    about which students are on the assessment list. The expansion was always coming — the
    player knew it was coming. They told themselves they would moderate it from inside. The
    first cohort of younger students arrives this week. The player's job is to review the
    assessment schedule. The name Davo Miral appears — as assessor, not subject. The player
    has access to his file. They read it. It is not what they expected.
  exits: → S35_THE_ARRIVALS
  consequences:
    - ambition +1 (you have access; this is what access looks like)
    - wisdom +1 (reading the file was the right thing to do before the courtyard)
```

```
[SCENE] S32D_AFTER_ISOLATED
  id: "s32d_after_isolated"
  condition: chapter_3_stance == "isolated"
  location: library window seat (the same one)
  summary: Three weeks of knowing and not acting. Ines's message — "Still here. Still waiting.
    Are you?" — has been sitting unanswered. The player has been thinking about what kind of
    action is worth taking. Then two things happen on the same morning: a group of young
    students arrives in the intake courtyard, confused and small in their school things.
    And Caden is at the player's elbow. "That's my brother," he says. Pointing at the new
    assessor moving through the courtyard below them. His voice is completely level in the
    way voices are when someone is doing all the work of keeping them that way.
  exits: → S35_THE_ARRIVALS
  consequences:
    - wisdom +2 (the waiting was not wasted — you know exactly what you're walking into)
```

---

### ACT 1 CONVERGENCE

```
[SCENE] S35_THE_ARRIVALS
  id: "s35_the_arrivals"
  location: intake_courtyard / observation window above it
  summary: All paths converge here. Davo Miral is real and present. He is older than Caden
    expected — not just in years, in weight. He moves through the intake process with the
    specific efficiency of someone who has done this many times. The younger students around
    him (twelve to fourteen, clearly nervous, dressed in new school things) are being sorted
    and assessed and the player can see the expansion machinery in motion for the first time.
    It is not dramatic. It looks like administration. That is the most disturbing thing about
    it. Davo looks up once. He sees Caden standing next to the player. His expression is not
    cold and it is not apologetic. It is the expression of someone who has learned not to feel
    things in real time. He looks away. Continues working.
  exits: → C09_FIRST_SIGHT_CHOICE
```

```
[CHOICE] C09_FIRST_SIGHT_CHOICE
  id: "c09_first_sight_choice"
  prompt: "Caden is standing next to you. He hasn't moved. The courtyard is right below."
  options:
    A) "Go down — talk to Davo now, before the intake finishes."
       gate: caden_aligned OR courage >= 6
       → courage +1, caden_rivalry -1 (the rivalry is becoming something else)
       → S36_DAVO_ENCOUNTER
    B) "Hold Caden back — not here, not in the open."
       gate: none
       → cunning +1, wisdom +1
       → S37_VETH_SUMMONS
    C) "Send Caden down alone. You watch from here."
       gate: none
       → cunning +1
       → S36_DAVO_ENCOUNTER (Caden goes; player observes)
    D) "Contact Ines first — she needs to know Davo is here before you move."
       gate: ines_contact >= 4
       → ines_contact +1, cunning +1
       → S37_VETH_SUMMONS
```

---

### ACT 1 BRANCHES

```
[SCENE] S36_DAVO_ENCOUNTER
  id: "s36_davo_encounter"
  location: intake_corridor (ground floor)
  summary: The encounter is brief and not what anyone expected. Davo meets the player and/or
    Caden in a corridor off the courtyard. He is not cold. He is present and careful and he
    remembers his brother with something that looks like real feeling — but the feeling is
    contained in a way that human feeling should not be. He answers Caden's first question
    ("Are you okay?") with "I'm working." Not dismissively — as if work is the correct answer
    to the question. As if he has organised himself around it completely. Then, quietly, he
    asks Caden not to be here during the assessments. He says it gently. Then, even more
    quietly, looking briefly at the player: "They told me it was you who found the Commission
    files. I need you to stop." He does not explain who "they" are. He walks away. He does not
    look back.
  exits: → S37_VETH_SUMMONS
  consequences:
    - set_flag: davo_encountered
    - caden_rivalry -1 (the rivalry has found its correct shape — this is not rivalry)
```

```
[SCENE] S37_VETH_SUMMONS
  id: "s37_veth_summons"
  location: corridor (Veth intercepts the player)
  summary: Whether or not the player encountered Davo, this happens: Veth finds them. He is
    less composed than usual. He delivers a message verbally, not in writing, as if he is
    aware of the record. The Conclave's central governance body has summoned him to appear
    and explain the "irregular communications" routed through his position. He has 48 hours.
    He does not say the word Archivist. He does not need to. The player understands exactly
    what is at stake: if Veth breaks under the governance questioning, the Archivist is
    exposed, the internal reform pathway collapses, and the evidence channel the insurgent
    players have been building loses its inside source. The clock has started.
  exits: → C10_VETH_CRISIS_CHOICE
  consequences:
    - cunning +1 (you've been here before — reading the shape of a crisis)
```

```
[CHOICE] C10_VETH_CRISIS_CHOICE
  id: "c10_veth_crisis_choice"
  prompt: "Veth is going to walk into a governance meeting in 48 hours. The clock is running."
  options:
    A) "Help Veth build a cover — there's a plausible explanation for the communications."
       gate: cunning >= 5 OR wisdom >= 5
       → cunning +1, set_flag: veth_protected
       → S38_COVER_BUILT
    B) "Get the Archivist to move first — file their counter before they're named."
       gate: ines_contact >= 5
       → ines_contact +1, courage +2
       → S38_ARCHIVIST_MOVES
    C) "Find Lira — she knows the internal accountability process. She might know a way out."
       gate: none (richer if lira_influence > 0 from earlier chapters)
       → lira_trust +2, set_flag: lira_returned
       → S39_LIRA_RETURNS
    D) "Tell Veth to hold and say nothing. Buy time."
       gate: none
       → wisdom +1, set_flag: veth_protected (fragile version)
       → S38_COVER_BUILT
```

---

### ACT 2 — THREE BRANCHES, THEN CONVERGENCE

```
[SCENE] S38_COVER_BUILT
  id: "s38_cover_built"
  location: player's room / Veth's space
  summary: The cover they build — or the silence Veth maintains — buys 48 hours and then
    a week. The governance meeting is delayed. Not cancelled. During that window Ines sends a
    message with something she found in the Conclave's original charter: a clause about external
    review that has never been invoked. If the Archivist invokes it, the summons becomes
    procedurally invalid and the meeting cannot be held on its current terms. But to invoke it,
    the Archivist has to reveal themselves formally — which means stepping out of the shadow they
    have operated in for twenty-two years. Ines is asking the player whether they want her to
    pass the option forward. She is asking on behalf of someone who is ready to do it but will
    not do it without a reason they can trust.
  exits: → G11_ARCHIVIST_REVEAL_GATE
  consequences:
    - ines_contact +1 (she found this for you)
```

```
[SCENE] S38_ARCHIVIST_MOVES
  id: "s38_archivist_moves"
  location: formal Conclave channels / the player receives notice
  summary: The Archivist files before they can be named. A formal counter-complaint with the
    governance body, citing their own identity and invoking the charter clause Ines identified.
    It is calculated: they are betting their seniority and thirty-one years of institutional
    standing against the expansion faction's momentum. The governance meeting is not cancelled —
    it becomes something larger. A formal governance session with the charter clause as the
    central matter. The Archivist has called a direct challenge to the Conclave's current
    leadership. In 72 hours, there will be a decision. The player will not be in the room.
    But what they have built will be there. And now the Archivist will be visible.
  exits: → G11_ARCHIVIST_REVEAL_GATE
  consequences:
    - courage +1 (you gave them a reason to move; they moved)
    - ines_contact +1
```

```
[SCENE] S39_LIRA_RETURNS
  id: "s39_lira_returns"
  location: outside school grounds (neutral ground)
  summary: Lira has been in contact since she came back to the area. She is not inside
    Aethermoor — she is staying somewhere nearby, without clearance. She meets the player
    outside the gates. She looks different: not diminished but changed in the way of someone
    who has been living with a decision for months and has stopped performing ambivalence about
    it. She knows the internal accountability process because she helped design part of it three
    years ago, when she still believed containment was correct. She can get Veth to a procedural
    technicality — but she has a condition. "Tell me what you found in the 1963 files," she
    says. "All of it. I need to know what we're actually fighting about." It is the most honest
    sentence she has said in three chapters.
  exits: → G11_ARCHIVIST_REVEAL_GATE
  consequences:
    - lira_trust +2
    - set_flag: lira_returned
    - wisdom +1 (you told her; she was ready to hear it)
```

---

```
[GATE] G11_ARCHIVIST_REVEAL_GATE
  id: "g11_archivist_reveal_gate"
  condition: (veth_protected AND ines_contact >= 5)
             OR (flag: archivist moved in s38_archivist_moves)
             OR (lira_returned AND lira_trust >= 4)
  if TRUE  → S40_ARCHIVIST_IN_PERSON
  if FALSE → S41_WITHOUT_THE_ARCHIVIST
```

---

```
[SCENE] S40_ARCHIVIST_IN_PERSON
  id: "s40_archivist_in_person"
  location: a private room (arranged by Ines or Veth; location deliberately unspecific)
  summary: The Archivist is not what the player imagined. Late sixties, small, precise,
    wearing the clothes of a scholar. They have been inside the Conclave for thirty-one years
    and have been working against it for twenty-two of those years — not from heroism but from
    accumulated moral debt that outgrew what silence can service. They are not a saviour and
    they are not performing guilt. They know about the player. They have been reading Ines's
    reports since Chapter 2. They offer the player three things: the original 1963 research
    documents (primary, not summaries); their own formal testimony naming the Conclave's
    founding decisions; and a specific proposal — a controlled, legally-framed public disclosure
    package that the Orders and the schools cannot dismiss or bury. It will require a formal
    witness network. It will require someone to carry the documentation forward through
    Chapter 5. The Archivist will not be able to do it themselves — they will be inside the
    governance session, and after that, they will be removed or gone. They are offering the
    player the only thing they have left that matters: everything they know. They say, at the
    end of it: "You'll need to decide what it's for. I can't tell you that."
  exits: → S42_DAVO_TRUTH
  consequences:
    - set_flag: archivist_revealed
    - ines_contact +2 (Ines made this happen)
    - wisdom +2 (you sat with someone who built a compromise and then spent twenty years
                  paying it back — you understand something now that you didn't before)
```

```
[SCENE] S41_WITHOUT_THE_ARCHIVIST
  id: "s41_without_the_archivist"
  location: restricted_library_annex
  summary: The Archivist's direct involvement didn't come together. Ines is doing what she
    can from inside. Veth is holding, fragile. The player has the Commission summary, Sera's
    classification records, Caden's evidence about Davo, and whatever Lira contributed. They
    lay it out together — whoever is in the room. It is not nothing. It is not the full
    documentation package. There are gaps that the Archivist's testimony would have filled.
    But Tomás looks at the table and says: "It's enough to make them uncomfortable. That's
    a start." He says it without irony. He is right, and it is less than they wanted, and
    both of those things are true simultaneously.
  exits: → S42_DAVO_TRUTH
  consequences:
    - tomas_bond +1 (he showed up with exactly what the moment needed)
    - courage +1 (you're going in with what you have)
```

---

### ACT 2 — CONVERGENCE

```
[SCENE] S42_DAVO_TRUTH
  id: "s42_davo_truth"
  location: a quiet space Caden found (unused study room / corner of the library)
  summary: This scene happens regardless of what the player achieved with the Archivist.
    Caden has been watching his brother move through the school. He had one more conversation
    with Davo — without the player — and he comes back with something to say that is not easy
    to say. Davo is not a prisoner. He made his choice four years ago and he would make it
    again. What the Conclave did to him is not destruction — it is a kind of reorganisation,
    and the person who accepted it is still, in some recognisable sense, Caden's brother.
    He remembers things. He does not feel them the same way. The difference is subtle and
    enormous. Caden reports this without drama. "He said he's sorry he couldn't explain it
    when it happened. He said he's not sorry he did it." A pause. "I don't know what to do
    with that." Neither does the player.
  exits: → C11_DAVO_QUESTION
```

```
[CHOICE] C11_DAVO_QUESTION
  id: "c11_davo_question"
  prompt: "Caden has said the thing he needed to say. Now he's looking at you. The question
    he hasn't asked yet is the one that shapes what this is for."
  options:
    A) "Davo's case is part of the disclosure. We use it — with his knowledge, if possible."
       gate: caden_aligned
       → courage +2, caden_rivalry -2 (profound ask; he says yes)
       → set_flag: davo_truth_known
       → S43_THE_GOVERNANCE_DAY
    B) "Davo stays out of it. Caden gets his brother back without the story being about him."
       gate: none
       → empathy +2, caden_rivalry -1
       → S43_THE_GOVERNANCE_DAY
    C) "Find out if Davo will testify voluntarily — his voice means more than ours about him."
       gate: davo_encountered AND (courage >= 6 OR cunning >= 6)
       → courage +1, caden_rivalry -1, set_flag: davo_truth_known
       → S43_THE_GOVERNANCE_DAY
    D) "Ask Caden what he wants. This is his brother."
       gate: none
       → empathy +1 (Caden's answer shapes the scene's weight, not its destination)
       → S43_THE_GOVERNANCE_DAY
```

---

### ACT 3 — THE GOVERNANCE SESSION

```
[SCENE] S43_THE_GOVERNANCE_DAY
  id: "s43_the_governance_day"
  location: Aethermoor, various — the session is in the Conclave's internal network
  summary: The governance session is happening. The player cannot be in the room. This
    time, what they have built is actively inside it: the Archivist's testimony if the
    gate opened, or the assembled documentation if it didn't; Ines inside as a junior
    member; Veth as witness; the Commission records. The player waits in the library annex
    with whoever they've gathered. The session takes four hours. Things arrive in fragments
    — Veth sends one-word messages. Ines sends nothing for two hours, then: "Holding."
    Caden is very still. If Lira is present she is reading something, not looking up. The
    player waits. The session continues. Something is happening in there that the player
    cannot see and cannot control and has been building toward for four chapters.
  exits: → G12_GOVERNANCE_OUTCOME_GATE
```

```
[GATE] G12_GOVERNANCE_OUTCOME_GATE
  id: "g12_governance_outcome_gate"
  condition: archivist_revealed
             AND ines_contact >= 6
             AND fracture_origin_known
             AND (caden_aligned OR sera_truth_known OR tomas_bond >= 6)
             AND (chapter_3_stance != "absorbed" OR solis_standing >= 6)
  if TRUE  → S44_SESSION_BREAKS
  if FALSE → S44_SESSION_HOLDS
```

---

```
[SCENE] S44_SESSION_BREAKS
  id: "s44_session_breaks"
  location: restricted_library_annex (afterward)
  summary: The governance session ended with a formal finding. Three senior Conclave members
    submitted immediate resignations. The expansion programme has been suspended pending
    independent review. The Conclave's charter has been opened for amendment for the first
    time in forty years. Veth sends one message: "It held." It is not dissolution. The
    Conclave still exists. But it is structurally changed, and the change is on record, and
    the 1963 Commission findings are formally acknowledged inside the institution. Davo, in the
    courtyard, is still working — but the intake he was running has been paused. He looks, from
    a distance, like someone who doesn't know yet what that means for him. The Archivist sends
    one message to the player. It contains no sentiment. It says: "You have the full
    documentation. Chapter 5 begins with you deciding what it's for."
  exits: → ENDING_GATE_4
  consequences:
    - ines_contact +1
    - courage +1
```

```
[SCENE] S44_SESSION_HOLDS
  id: "s44_session_holds"
  location: restricted_library_annex (afterward)
  summary: The Conclave survived the session intact. Three members were quietly removed — not
    the senior figures, the visible ones. The expansion programme will proceed, under modified
    language. Veth sends nothing for a day. Then: "They know about me. I'm being transferred."
    Then silence. Ines sends a longer message than usual. It is not hopeless — it is specific.
    The session shifted the internal balance enough that there is now a faction large enough to
    matter that knows the truth about the Commission. They will not act. But they cannot unknow.
    The documentation is still with the player. The Archivist's one-time appearance is in the
    player's memory — and, if the gate opened, in the documentation package. Ines ends her
    message: "Still here. Chapter 5 is still coming. Don't make me wait again."
  exits: → ENDING_GATE_4
  consequences:
    - ambition +1 (the work continues; that is its own kind of determination)
    - wisdom +1 (you understand something about the patience required for this)
```

---

### ENDING GATE — Chapter 4

```
[GATE] ENDING_GATE_4
  id: "ending_gate_4"
  evaluation (priority order):

  → ending_4a_threshold
    condition: s44_session_breaks reached
               AND (ines_contact >= 6 OR archivist_revealed)
               AND chapter_3_stance == "reformer"
    outcome: The reform path reached its chapter 4 payoff. The Conclave is structurally
             changed. The Archivist's testimony exists. The documentation package is in the
             player's hands. Chapter 5 begins in a world where public disclosure is possible
             — not theoretical, possible.
    chapter_4_stance: "threshold"

  → ending_4b_exposure
    condition: (caden_aligned AND davo_truth_known)
               OR (sera_truth_known AND courage >= 7)
               AND lira_returned
    outcome: The session held but the external pressure is real. Caden, Sera, Lira, and the
             player have a coalition and the documentation and a mechanism. Chapter 5 begins
             with the public release already in motion — not complete, but irreversible.
    chapter_4_stance: "exposure"

  → ending_4c_architect
    condition: chapter_3_stance == "absorbed"
               AND solis_standing >= 6
               AND NOT archivist_revealed
    outcome: The player navigated the governance session from inside the Conclave and emerged
             with consolidated influence. The expansion proceeds, modified. The Commission
             findings are known internally. Chapter 5 begins with the player having real power
             inside the institution — and the question of what they are going to do with it.
    chapter_4_stance: "architect"

  → ending_4d_catalyst [FALLBACK]
    condition: none of the above
    outcome: Nothing resolved cleanly, but everything is in position. The documentation
             exists. The relationships the player built across four chapters are all pointing
             toward Chapter 5. Someone else will act if the player doesn't. The question is
             whether they are going to be the one who decides how.
    chapter_4_stance: "catalyst"
```

---

### CHAPTER 4 ENDINGS (4 total — isEnding: true, Chapter 5 transitions added after design)

```
[ENDING] ENDING_4A_THRESHOLD
  id: "ending_4a_threshold"
  summary: The session broke. The expansion is suspended. The Commission findings are on
    record. The Archivist's testimony is in the governance minutes. None of this is public.
    None of it was supposed to be possible. Ines sends one long message — longer than anything
    she has sent before. It covers everything she has been unable to say across three chapters.
    It ends: "Tomás should know all of it now. Not as a protection. As a right." The player
    reads it twice. Then they go find him.

[ENDING] ENDING_4B_EXPOSURE
  id: "ending_4b_exposure"
  summary: The session held, but the outside is moving. Caden has the documentation. Lira
    has the process knowledge — she knows exactly which channels are and are not monitored.
    Sera has the administrative classification records with her grandmother's name on them.
    The player has been the connective tissue of all of it. Lira, before she goes back to
    wherever she's staying: "We can't stop it now even if we wanted to." A pause. "That's
    not a bad thing." It is the most honest thing she has said across four chapters.

[ENDING] ENDING_4C_ARCHITECT
  id: "ending_4c_architect"
  summary: The player stood with the Conclave through the governance session, helped navigate
    the resignations, and emerged with more influence than they walked in with. The expansion
    programme will continue, under modified language. The Commission findings are known
    internally. From here, theoretically, things can change — slowly, from the inside, if the
    player plays it correctly. They look at the focusing anchor on their desk. It still hums.
    They are still not entirely sure whether that feeling is theirs. Chapter 5 will answer that
    question. Whether they want the answer is a different matter.

[ENDING] ENDING_4D_CATALYST
  id: "ending_4d_catalyst"
  summary: The governance session resolved nothing cleanly and everything structurally. The
    player has the documentation package — the full Commission files, Sera's records, the
    Archivist's notes if they met, everything Ines sent across four chapters. Caden is ready.
    Sera is ready. Tomás knows most of it. Lira is somewhere nearby. Everything is pointing
    at Chapter 5. Ines sends one message: "What are you waiting for?" The player puts the
    documentation in their bag. They don't have an answer. But they are moving.
```

---

## Complete Scene List — Chapter 4 (27 nodes)

```
s32a_after_reformer          ACT 1 — divergent open (chapter_3_stance: reformer)
s32b_after_insurgent         ACT 1 — divergent open (chapter_3_stance: insurgent)
s32c_after_absorbed          ACT 1 — divergent open (chapter_3_stance: absorbed)
s32d_after_isolated          ACT 1 — divergent open (chapter_3_stance: isolated)
s35_the_arrivals             ACT 1 — convergence (Davo is present; the expansion is visible)
c09_first_sight_choice       ACT 1 — choice (4 options, 1 gated)
s36_davo_encounter           ACT 1 — branch (Davo path)
s37_veth_summons             ACT 1 — convergence (clock starts)
c10_veth_crisis_choice       ACT 1 — choice (4 options, 2 gated)
s38_cover_built              ACT 2 — branch (A or D from c10)
s38_archivist_moves          ACT 2 — branch (B from c10)
s39_lira_returns             ACT 2 — branch (C from c10; gated: none)
g11_archivist_reveal_gate    ACT 2 — gate
s40_archivist_in_person      ACT 2 — gate TRUE (Archivist first direct appearance)
s41_without_the_archivist    ACT 2 — gate FALSE
s42_davo_truth               ACT 2 — convergence (Caden's report on Davo)
c11_davo_question            ACT 2 — choice (4 options, 1 gated)
s43_the_governance_day       ACT 3 — the wait
g12_governance_outcome_gate  ACT 3 — gate
s44_session_breaks           ACT 3 — gate TRUE
s44_session_holds            ACT 3 — gate FALSE
ending_gate_4                ENDING — evaluator
ending_4a_threshold          ENDING
ending_4b_exposure           ENDING
ending_4c_architect          ENDING
ending_4d_catalyst           ENDING — fallback
```

**Total: 26 nodes** (18 scenes/choices + 3 gates + 5 endings including evaluator)

---

## Graph Integrity Checks

- ✅ All four chapter_3_stance values are handled (reformer / insurgent / absorbed / isolated)
- ✅ All four ACT 1 openings converge at s35_the_arrivals
- ✅ All three ACT 2 branches (cover_built / archivist_moves / lira_returns) converge at g11
- ✅ Gate TRUE and FALSE both defined for g11 and g12
- ✅ s42_davo_truth and s43_the_governance_day are reached from all branches
- ✅ Fallback ending (4d_catalyst) always reachable regardless of stats
- ✅ Davo arc is meaningful without being mandatory (davo_encountered not required for chapter completion)
- ✅ Lira's return arc is optional but not orphaned — she can be absent from all endings gracefully
- ✅ The Archivist appears exactly once, gate-locked, earned by relationship investment
- ✅ Veth's arc resolves (protected/transferred) without requiring a separate branch
- ✅ No orphaned nodes
- ✅ Chapter 3 endings converted to chapter transitions (done)
- ✅ New flags added to schema (done): davo_encountered, davo_truth_known, veth_protected,
        archivist_revealed, lira_returned
- ✅ lira_trust added to schema with lira_influence seeding logic (done)
- ✅ veth_broken REMOVED from schema — no scene in the current graph sets it (see prerequisites note)
- ⚠️  Chapter 5 transitions will be added to chapter 4 endings after Chapter 5 is designed

---

## Chapter Export Wiring Map (Implementation Guide)

Chapter 4 has four chapterExports to populate. They are NOT all set in the ending nodes —
they are distributed across the graph at the point where each value is determined.

### veth_status — set in S44 scenes

| Scene | Consequence |
|---|---|
| S44_SESSION_BREAKS | `set_chapter_export: veth_status: "protected"` — he survived the session |
| S44_SESSION_HOLDS | `set_chapter_export: veth_status: "transferred"` — he was moved out after |

Rationale: veth_status is a session outcome, not a player stance. Setting it in S44 means it
is always populated before the ending gate runs, regardless of which ending the player reaches.

---

### davo_outcome — set in S42 and overridden in C11

| Scene / Choice | Consequence |
|---|---|
| S42_DAVO_TRUTH | `set_chapter_export: davo_outcome: "reached"` (base) |
| C11 option C (c11_ask_davo) | `set_chapter_export: davo_outcome: "testified"` (override) |

Rationale: By S42, Caden has spoken to Davo regardless of whether the player went down in C09.
"reached" is the correct base value — some contact was made. Option C (asking Davo to testify
voluntarily) is the only path that should produce "testified", and it overrides the base value.
The "lost" value is not produced by any current Chapter 4 path (Caden always has his conversation).
Reserve "lost" for Chapter 5 use or if a future branch explicitly avoids S42.

---

### chapter_4_stance and lira_status_ch4 — set in ending nodes

These are stance-level exports that belong in the ending nodes because their values express the
player's strategic position, not a specific scene outcome.

| Ending | chapter_4_stance | lira_status_ch4 | Notes |
|---|---|---|---|
| ending_4a_threshold | `"threshold"` | `"gone"` | Lira not required for this path; she helped but is not the story going forward |
| ending_4b_exposure | `"exposure"` | `"ally"` | `lira_returned` is required by the gate; she is at the ending scene |
| ending_4c_architect | `"architect"` | `"watched"` | Absorbed path; if Lira returned she is now under Conclave surveillance |
| ending_4d_catalyst | `"catalyst"` | `"gone"` | Fallback; Lira is "somewhere nearby" but not committed |

Note: `lira_status_ch4` values here are approximate. Chapter 5 should use the `lira_returned`
flag (boolean, available) alongside `lira_status_ch4` for fine-grained branching if needed.

---

### Full export wiring summary

```
S44_SESSION_BREAKS:       set_chapter_export: veth_status: "protected"
S44_SESSION_HOLDS:        set_chapter_export: veth_status: "transferred"
S42_DAVO_TRUTH:           set_chapter_export: davo_outcome: "reached"
C11 option c11_ask_davo:  set_chapter_export: davo_outcome: "testified"  [overrides]
ending_4a_threshold:      set_chapter_export: chapter_4_stance: "threshold"
                          set_chapter_export: lira_status_ch4: "gone"
ending_4b_exposure:       set_chapter_export: chapter_4_stance: "exposure"
                          set_chapter_export: lira_status_ch4: "ally"
ending_4c_architect:      set_chapter_export: chapter_4_stance: "architect"
                          set_chapter_export: lira_status_ch4: "watched"
ending_4d_catalyst:       set_chapter_export: chapter_4_stance: "catalyst"
                          set_chapter_export: lira_status_ch4: "gone"
```

Implementation tasks (for engine-builder / content-author when Chapter 5 begins):
1. Add `set_chapter_export` consequences to S44_SESSION_BREAKS and S44_SESSION_HOLDS
2. Add `set_chapter_export: davo_outcome: "reached"` to S42_DAVO_TRUTH
3. Add `set_chapter_export: davo_outcome: "testified"` to C11 option c11_ask_davo
4. Convert ending_4a–4d from `isEnding: true` to chapter transitions (add choices with
   `set_chapter_export` consequences and `advance_chapter`, pointing to Chapter 5 opening scenes)
5. Remove `veth_broken` from schema.ts FlagKey, Flags interface, defaults.ts, and migrations.ts

---

## Chapter Arc Summary

| Chapter | Conclave stance | Lira | Tomás | Sera | Caden |
|---|---|---|---|---|---|
| 1 | Unknown | Recruiter | Investigator | Bystander | Rival |
| 2 | Revealed | Inside/Gone | Searching | Bystander | Reactive |
| 3 | Fracturing | Gone/Ally | Knows truth | Knows truth | Aligned |
| 4 | In crisis | Returns (outside) | Full partner | Active voice | Broken open |
| 5 | Resolution | TBD | TBD | TBD | TBD |

---

## Open Questions for Chapter 5

1. What is Davo's role in Chapter 5 — does he defect, testify, or remain inside until the end?
2. Does the Archivist appear again, or was Chapter 4 their last scene? (Recommendation: last.)
3. What form does public disclosure take — a single decisive act or a sequence of smaller ones?
4. What happens to Aethermoor itself — does it survive, reform, close, or become something new?
5. What is the `architect` path's Chapter 5 ending — what does it mean to have changed the
   Conclave from within, and is that different enough from absorption to be a victory?
6. What is the minimum viable Chapter 5 ending — the "catalyst" path that resolves with
   something earned, even for the player who has been isolated for three chapters?
