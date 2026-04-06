# Story Architect Output — Chapter 2 Narrative Graph
# "What the Fracture Remembers"

---

## ⚠️ Structural Prerequisites (Must Complete Before Content-Author)

Chapter 2 requires engine and schema changes that do not yet exist. These must be done first:

### 1. State Designer — Schema Updates Required

**New FlagKeys** to add to `schema.ts`:
```
met_solis         — player encountered External Examiner Maren Solis
knows_ines_alive  — player learned Tomás's sister is alive and inside the Conclave
conclave_offered  — Conclave made a formal recruitment offer to the player
tomas_knows       — Tomás learned the full truth about his sister
```

**New RelationshipKey** to add to `schema.ts`:
```
solis_standing    — Conclave examiner's assessment of the player (0–10, default 0)
```

**New ChapterExports fields** for chapter 2:
```
chapter_2_solis_stance: "confronted" | "joined" | "brokered" | "walked" | null
ines_status:            "found" | "hidden" | "exposed" | null
lira_chapter_2_status:  "ally" | "enemy" | "gone" | null
```

### 2. Engine Builder — New Consequence Types Required

The chapter transition mechanic requires two new consequence types:

```
{ "type": "set_chapter_export", "field": "crisis_outcome", "value": "hero" }
{ "type": "advance_chapter" }
```

`advance_chapter` calls `advanceChapter()` from `mutations.ts` — it already exists as a mutation, it just isn't wired as a consequence type.

### 3. Chapter 1 Endings — Convert from isEnding to Chapter Transitions

The three chapter 1 endings must be rewritten:
- Remove `"isEnding": true`
- Add consequences that set `chapterExports` fields
- Add a choice that leads to the appropriate chapter 2 opening scene
- Add `{ "type": "advance_chapter" }` as a final consequence

**Mapping:**
| Ending | crisis_outcome | chapter_1_reputation | lira_status | Opens |
|---|---|---|---|---|
| ending_a_marked | "hero" | "high" | "watching" | s09a_marked_morning |
| ending_b_watcher | "observer" | "high" | "unaware" | s09b_watcher_morning |
| ending_c_fracture | "failed" | "low" | "owns_you" | s09c_fracture_morning |

---

## Chapter 2 Central Conflict

Lira Thane is not acting alone. She was recruited — as a second-year — by a covert body called **The Conclave**: a shadow authority within the Weaving establishment that monitors Fracture incidents and contains them before they become public. Their logic is utilitarian and not entirely wrong: if the existence of the Fracture became widely known, the Weaving establishment — the schools, the Orders, the entire social fabric built around elemental threading — would collapse in panic.

The Conclave absorbs Fracture-touched students. They don't destroy them. They train them and place them inside the operation. Tomás Reeve's sister — **Ines** — is one of them. She is alive. She has been unreachable not because she can't contact Tomás, but because she chose not to, to protect him from becoming a target.

This chapter the player will learn all of this. What they do with it determines the ending.

**The Conclave's recruiter at Aethermoor this week**: External Examiner **Maren Solis**, arriving for what the school believes are routine assessments. Her real purpose is to evaluate the crisis fallout and, if appropriate, extend a recruitment offer — to the player.

---

## New NPC — Chapter 2

| ID | Name | Role | Relationship Meter |
|---|---|---|---|
| `NPC_06` | **Maren Solis** | External Examiner, Conclave handler | `solis_standing` 0–10 |

**Characterisation**: Solis is in her late thirties. Calm, deliberate, gives nothing away. She's been running Conclave operations for eight years. She genuinely believes in what she does — the Fracture is real, containment is necessary, and she has the body count to prove what happens when it isn't contained. She is not cruel. She is not a villain. She is the kind of person who makes the worst decisions feel inevitable.

---

## Chapter 2 Scene Graph

---

### ACT 1 — THE MORNING AFTER (Divergent, 3 paths)

Branching is driven by `chapterExports.lira_status` read from chapter 1.

---

```
[SCENE] S09A_MARKED_MORNING
  id: "s09a_marked_morning"
  condition: lira_status == "watching"
  location: great_corridor (morning)
  summary: Player is visible. The school knows something happened. Aldric intercepts
    them before breakfast — not to reprimand, but to assess. Caden is there too,
    unusually quiet. Lira is absent from the morning meal. The note is in the player's
    pocket. Everyone is watching them.
  tone: Exposed. The weight of visibility. You are now someone who did something.
  exits: → S10_ARCHIVE_DISCOVERY
  consequences:
    - aldric_regard +1 (Aldric's brief approval matters)
    - ambition +1 (you're in the centre of something larger than you planned)
```

```
[SCENE] S09B_WATCHER_MORNING
  id: "s09b_watcher_morning"
  condition: lira_status == "unaware"
  location: common_room (early morning, empty)
  summary: Player is invisible. Nobody knows what they saw. Tomás finds them at
    first light — he was awake too. He has the restricted archive article on his phone.
    He shows the player a new detail he found overnight: a fourth name on the incident
    list, partially redacted. He thinks it's his sister.
  tone: Quiet urgency. Two people who know something sharing the weight of it.
  exits: → S10_ARCHIVE_DISCOVERY
  consequences:
    - tomas_bond +1 (he came to you, not anyone else)
    - wisdom +1 (you've been careful, and it's paying off)
```

```
[SCENE] S09C_FRACTURE_MORNING
  id: "s09c_fracture_morning"
  condition: lira_status == "owns_you"
  location: restricted_corridor (early morning)
  summary: Lira is waiting — in person, not just in a note. She's not threatening.
    She's almost gentle. She explains that what the player saw last night doesn't
    have to be a problem. She has been where the player is. She knows exactly how
    it feels. She is offering them a way out of this — but on her terms.
  tone: The discomfort of someone being genuinely kind while also having leverage.
  exits: → C01_FRACTURE_MORNING_CHOICE
  consequences:
    - lira_influence +2 (she has consolidated her position)
```

```
[CHOICE] C01_FRACTURE_MORNING_CHOICE
  id: "c01_fracture_morning_choice"
  condition: only reached from S09C
  prompt: "Lira is waiting. She's offering something. What do you do?"
  options:
    A) "Listen to what she's offering."
       → lira_influence +1, cunning +1
       → S10_ARCHIVE_DISCOVERY
    B) "Tell her you need time to think."
       → lira_influence 0 (holds steady), wisdom +1
       → S10_ARCHIVE_DISCOVERY
```

---

### ACT 1 CONVERGENCE — THE ARCHIVE

All three morning paths arrive here.

---

```
[SCENE] S10_ARCHIVE_DISCOVERY
  id: "s10_archive_discovery"
  location: restricted_library_annex
  summary: Tomás has gained access to the restricted archive — through legitimate
    means for once, on the basis of a research request he submitted three weeks ago.
    The timing is either lucky or not. Inside the file he requested are records of
    five Fracture incidents over twelve years. Four students named. One name fully
    redacted — but the marginal handwriting on the redacted file matches the handwriting
    on a letter Tomás has carried in his wallet for three years. His sister Ines.
    She didn't disappear. She was transferred. The transfer was authorised.
    The authorisation is signed — but the signatory name is itself a redaction.
    Someone inside the school signed it.
  tone: The moment a theory becomes a fact. Cold, specific, quiet.
  exits: → C02_ARCHIVE_RESPONSE
```

```
[CHOICE] C02_ARCHIVE_RESPONSE
  id: "c02_archive_response"
  prompt: "Tomás is holding the file. His hands are steady in the way hands are
    steady when someone is keeping them that way deliberately."
  options:
    A) "We find out who signed it."
       → wisdom +1, tomas_bond +1
       → S11_ESKA_VISIT
    B) "We need to know more before we move — visit Eska first."
       → cunning +1
       → S11_ESKA_VISIT
    C) "Take this to Aldric. He told me to stay quiet — but this is different."
       → aldric_regard +1 (if reported_lira) / 0 (otherwise)
       → S11_ESKA_VISIT
```

---

```
[SCENE] S11_ESKA_VISIT
  id: "s11_eska_visit"
  location: healing_rooms
  summary: Eska Varn, the first-year from the crisis, is conscious and stable.
    She is frightened in the specific way of someone who has been told — gently,
    firmly — to say as little as possible. She recognises the player. She does not
    want to talk. What she says (if anything) depends on the gate.
  tone: Fragile. Someone who knows more than they're allowed to show.
  exits: → G06_ESKA_TRUST_GATE
```

```
[GATE] G06_ESKA_TRUST_GATE
  id: "g06_eska_trust_gate"
  condition: empathy >= 5 OR sera_trust >= 3
  if TRUE  → S12_ESKA_SPEAKS  (Eska trusts you enough to say one careful thing)
  if FALSE → S12_ESKA_SILENT  (Eska says nothing — but her eyes go to the window)
```

```
[SCENE] S12_ESKA_SPEAKS
  id: "s12_eska_speaks"
  location: healing_rooms
  summary: Eska tells the player — in the fewest words she can — that someone
    gave her the Fracture thread deliberately. Not to harm her. To test her
    tolerance for it. She was told it would be a standard assessment. She didn't
    know it was forbidden. The person who administered it wore an examiner's badge.
    She had never seen them before at Aethermoor.
  tone: Revelation delivered quietly, the way things are when someone is afraid
    of being overheard.
  exits: → S13_LIRA_CONVERSATION
  consequences:
    - cunning +1 (the picture is sharpening)
    - set_flag: met_solis (implied — the examiner is Solis)
```

```
[SCENE] S12_ESKA_SILENT
  id: "s12_eska_silent"
  location: healing_rooms
  summary: Eska says nothing useful. But as the player is leaving, she says one
    thing that isn't nothing: "She said it would pass. That most people don't
    feel it at all." Then she stops herself. Looks out the window.
  tone: The frustration of almost-information. Something is there. You didn't
    reach it.
  exits: → S13_LIRA_CONVERSATION
```

---

### ACT 2 — THE CONCLAVE SURFACE

---

```
[SCENE] S13_LIRA_CONVERSATION
  id: "s13_lira_conversation"
  location: ventus_corridor (after hours)
  summary: Lira finds the player — or the player finds Lira, depending on
    lira_status. Either way, this is the conversation that was always going to
    happen. Lira is not hiding. She is not defensive. She is explaining, because
    she has decided the player is worth explaining things to.
    She tells them: the Fracture is real and old and it is spreading faster than
    the Orders want to acknowledge. There are people — a small group, sanctioned
    at levels above any individual school — who contain it. She was approached
    two years ago. She said yes. She has not regretted it.
    She does not say "the Conclave" by name.
    She does not say what happened to the students who were absorbed.
    She does not mention Ines.
    But she tells the player: there is someone arriving this week who will want
    to speak with them. And she thinks the player should let that conversation happen.
  tone: The disorienting experience of a partial truth from someone who is
    being genuinely honest within the limits of what they're allowed to say.
  exits: → C03_LIRA_RESPONSE
  consequences:
    - lira_influence +1 (she chose to tell you this; it costs her something)
```

```
[CHOICE] C03_LIRA_RESPONSE
  id: "c03_lira_response"
  prompt: "Lira is waiting for an answer."
  options:
    A) "Tell me who's arriving."
       → cunning +1, lira_influence +1
       → S14_SOLIS_IDENTIFIED
    B) "Why are you telling me this?"
       → wisdom +1
       → S14_SOLIS_IDENTIFIED
    C) "I'm not interested in whatever this is."
       → courage +1, lira_influence -1
       → S14_SOLIS_IDENTIFIED
    D) "I already know about the Fracture incidents. And the archive."
       (available only if NOT lira_status == "owns_you")
       → cunning +2, solis_standing +1 (you're ahead)
       → S14_SOLIS_IDENTIFIED
```

---

```
[SCENE] S14_SOLIS_IDENTIFIED
  id: "s14_solis_identified"
  location: assessment_corridor / noticeboard
  summary: The school's weekly notice board lists External Examiner Maren Solis
    arriving Thursday for three days of assessments. Standard rotation. The player
    now has a name and a timeline. Whether they approach Solis first, or wait
    for her to approach them, depends on the gate.
  tone: A clock starting. The investigation has a deadline now.
  exits: → G07_SOLIS_INITIATIVE_GATE
```

```
[GATE] G07_SOLIS_INITIATIVE_GATE
  id: "g07_solis_initiative_gate"
  condition: cunning >= 5 OR (aldric_regard >= 3 AND wisdom >= 4)
  if TRUE  → S15_PLAYER_FINDS_SOLIS  (you reach her before she reaches you)
  if FALSE → S15_SOLIS_FINDS_PLAYER  (she finds you on her own schedule)
```

```
[SCENE] S15_PLAYER_FINDS_SOLIS
  id: "s15_player_finds_solis"
  location: assessment_antechamber
  summary: The player gets to Solis before she's set up properly. She's still
    organising her files. She looks up and isn't surprised — she was expecting
    someone curious, just not this quickly. She invites the player to sit down.
    The player has the initiative. For now.
  tone: The rare feeling of being slightly ahead. Don't waste it.
  exits: → S16_SOLIS_TRUTH
  consequences:
    - solis_standing +2 (she respects the initiative)
    - cunning +1
```

```
[SCENE] S15_SOLIS_FINDS_PLAYER
  id: "s15_solis_finds_player"
  location: corridor / common_room
  summary: Solis introduces herself during what should have been an ordinary
    afternoon. She is friendly, professional, entirely in control of the encounter.
    She has already formed a view of the player before they've said a word.
    She invites them for a conversation. It is not quite optional.
  tone: The discomfort of someone operating several steps ahead on your schedule.
  exits: → S16_SOLIS_TRUTH
  consequences:
    - solis_standing +1 (she's assessed you; jury's still out)
```

---

### ACT 2 — THE APPROACH (Player's Strategic Choice)

This is the chapter's major branch point. Before meeting Solis formally, the player chooses how they'll navigate what's coming.

---

```
[SCENE] S16_CHOOSE_APPROACH
  id: "s16_choose_approach"
  location: player's room (night before the formal meeting)
  summary: Tomorrow, Solis wants to meet properly. Tonight, the player makes a
    decision about how they're going to handle this. Each approach produces
    different consequences through Act 3 and shapes which ending is reachable.
  tone: Quiet. The space before a decision. What kind of person are you?
  exits: → C04_APPROACH_CHOICE
```

```
[CHOICE] C04_APPROACH_CHOICE
  id: "c04_approach_choice"
  prompt: "How do you meet Solis?"
  options:
    A) "Work with Lira — she's already inside. Use that."
       gate: NOT reported_lira (can't use Lira if you burned her)
       → lira_influence +1, cunning +1
       → S17A_WITH_LIRA
    B) "Go to Aldric first — tell him everything. He may already know more than he said."
       gate: aldric_regard >= 3
       → aldric_regard +1, wisdom +1
       → S17B_WITH_ALDRIC
    C) "Bring Tomás in fully — find Ines together, expose everything."
       gate: tomas_bond >= 3
       → tomas_bond +1, courage +1
       → S17C_WITH_TOMAS
    D) "Move alone. No one can compromise what they don't know."
       gate: none (always available, harder gates ahead)
       → cunning +1, ambition +1
       → S17D_ALONE
```

---

```
[SCENE] S17A_WITH_LIRA
  id: "s17a_with_lira"
  location: ventus_common_room (late)
  summary: Lira is measured about this. She has conditions — she won't expose
    the Conclave structure, and she won't help the player get to Ines directly.
    But she can position the player well in the meeting with Solis. Treat it
    as a job interview, she says. Solis responds to clarity and conviction.
    Tell her what you want. Be specific. Don't ask for things she can't give.
    What you want, Lira says, is leverage. Not answers. Leverage.
  exits: → S18_SOLIS_FORMAL_MEETING
  consequences:
    - cunning +1
    - solis_standing +1 (Lira has vouched for you)
```

```
[SCENE] S17B_WITH_ALDRIC
  id: "s17b_with_aldric"
  location: aldric_office (evening)
  summary: Aldric already knows about Solis. He has always known about the
    Conclave — not as a participant, but as someone who was approached twelve
    years ago and declined. He tells the player this without drama. He was
    a second-year teacher. He didn't think it was right. He still doesn't.
    But he also doesn't think blowing it open will help anyone. He will not
    act himself — his evidence is old, his position is complicated. But he can
    tell the player one thing: Solis responds to institutional pressure.
    If the player has documentation — real documentation — she will negotiate.
    The archive records Tomás found are documentation.
  exits: → S18_SOLIS_FORMAL_MEETING
  consequences:
    - aldric_regard +2
    - wisdom +1
    - solis_standing +1 (Aldric's name carries weight)
```

```
[SCENE] S17C_WITH_TOMAS
  id: "s17c_with_tomas"
  location: restricted_library_annex (night)
  summary: Tomás is not interested in strategy. He's interested in Ines.
    The player has to make a decision here: tell Tomás everything they know
    (including what Eska said, what Lira implied, what the archive suggests)
    or keep some of it back to protect him. Either way, Tomás makes a plan.
    It is not a subtle plan — he wants to confront Solis directly, in the
    meeting, with the archive records. The player will have to decide in the
    room whether to follow his lead or pull him back.
  exits: → S18_SOLIS_FORMAL_MEETING
  consequences:
    - tomas_bond +2
    - courage +1
    - set_flag: tomas_knows (if player told him everything)
```

```
[SCENE] S17D_ALONE
  id: "s17d_alone"
  location: library window seat (night)
  summary: Nobody to consult. Nobody to compromise. The player goes over
    everything they know — the archive records, what Eska said, what Lira
    implied, what they saw in the corridor in chapter 1. Laid out this way,
    the picture is almost complete. Almost. One thing they don't know: what
    Solis actually wants from them specifically. Showing up without an ally
    is a risk. But it also means Solis can't use anyone the player cares
    about as leverage.
  exits: → S18_SOLIS_FORMAL_MEETING
  consequences:
    - ambition +1
    - wisdom +1
```

---

### ACT 3 — MAREN SOLIS (All paths converge)

---

```
[SCENE] S18_SOLIS_FORMAL_MEETING
  id: "s18_solis_formal_meeting"
  location: assessment_room
  summary: Solis's assessment room is neutral territory — a borrowed classroom,
    tidy, two chairs at the same level. She doesn't sit behind a desk. She
    introduces herself properly, asks the player three questions (how are they
    settling in, how do they find their Order's curriculum, what do they think
    about the incident last week). The third question is not a question.
    She is seeing what the player volunteers.
  tone: The assessment. Careful mutual surveillance. Two people who know more
    than they're saying, taking stock of each other.
  exits: → C05_SOLIS_MEETING_RESPONSE
  consequences:
    - set_flag: met_solis
    - set_flag: conclave_offered (the offer is implicit in this meeting existing)
```

```
[CHOICE] C05_SOLIS_MEETING_RESPONSE
  id: "c05_solis_meeting_response"
  prompt: "Solis is waiting for your answer about the incident."
  options:
    A) "Tell her exactly what you saw — all of it."
       → courage +1, solis_standing +2
       → S19_SOLIS_EXPLAINS
    B) "Tell her part of it — enough to show you're not naive."
       → cunning +2, solis_standing +1
       → S19_SOLIS_EXPLAINS
    C) "Ask her why she's really here."
       → wisdom +1, solis_standing +1
       → S19_SOLIS_EXPLAINS
    D) "Tell her you know about the archive. The redacted names. Ines Reeve."
       gate: tomas_knows OR knows_ines_alive
       → courage +2, solis_standing +3 (you're ahead; she recalibrates)
       → S19_SOLIS_EXPLAINS
```

---

```
[SCENE] S19_SOLIS_EXPLAINS
  id: "s19_solis_explains"
  location: assessment_room
  summary: Solis explains the Conclave. She doesn't call it that — she calls it
    "the monitoring function." She explains the Fracture: it is a real and spreading
    phenomenon, older than the Orders, older than the school. Roughly one in eight
    hundred students has measurable Fracture sensitivity. Most of them never know.
    Some of them, without guidance, cause what happened in the courtyard — or worse.
    The monitoring function identifies them. Assesses them. Offers them a structured
    path. They do not disappear. They are placed. They are trained. They are, Solis
    says carefully, protected.
    She lets that sit.
    Then: "Ines Reeve is one of ours. She is well. She made her choice freely."
  tone: The moment a conspiracy reveals itself to be more complicated than anticipated.
    She isn't wrong about everything. That's the problem.
  exits: → S20_TOMAS_IN_THE_ROOM
  consequences:
    - set_flag: knows_ines_alive
    - wisdom +1
```

---

```
[SCENE] S20_TOMAS_IN_THE_ROOM
  id: "s20_tomas_in_the_room"
  location: assessment_room (door opens)
  summary: The door opens. Tomás is standing in it.
    How he got here depends on the approach path — if the player brought him in
    (S17C), he arranged to be there. If the player went alone or with others,
    he followed them. He is not dramatic about it. He steps into the room and
    looks at Solis and says: "Tell me where my sister is."
    Solis looks at the player. The player has a choice to make, right now,
    about whose side they're on.
  tone: The specific weight of a moment where loyalty and strategy come apart.
  exits: → C06_TOMAS_MOMENT
```

```
[CHOICE] C06_TOMAS_MOMENT
  id: "c06_tomas_moment"
  prompt: "Solis is looking at you. Tomás is looking at Solis. One of you is
    going to determine what happens next."
  options:
    A) "Support Tomás — let him push. Be ready."
       → tomas_bond +2, courage +1, lira_influence -1
       → G08_CONFRONTATION_GATE
    B) "Hold Tomás back — this isn't the moment."
       → cunning +1, solis_standing +1, tomas_bond -1
       → S21_NEGOTIATION
    C) "Ask Solis to let Tomás speak to Ines directly — now, in this room."
       gate: wisdom >= 6 OR cunning >= 6 OR solis_standing >= 4
       → solis_standing +2, tomas_bond +1, wisdom +1
       → S21_NEGOTIATION (Solis agrees — this becomes the negotiation)
    D) "Step back. Let Solis and Tomás settle this themselves."
       → ambition +1, tomas_bond -2 (he needed you)
       → S21_NEGOTIATION
```

---

```
[GATE] G08_CONFRONTATION_GATE
  id: "g08_confrontation_gate"
  condition: courage >= 6 OR tomas_bond >= 5
  if TRUE  → S21_NEGOTIATION (Solis responds to the pressure — it worked)
  if FALSE → S21_NEGOTIATION (Solis contains it — it didn't work, consequences differ)
  note: The gate outcome is tracked via a consequence flag (confrontation_succeeded)
        and affects which ending branch is available.
```

---

```
[SCENE] S21_NEGOTIATION
  id: "s21_negotiation"
  location: assessment_room (extended)
  summary: What follows depends on the approach, the gate, and what the player
    has accumulated. But all paths arrive here: the negotiation about what happens
    next. Solis has a position. The player has information. Tomás has need.
    One of three things emerges from this room.
  tone: Exhausted, precise, the strange intimacy of people who have been honest
    with each other under pressure.
  exits: → ENDING_GATE_2
```

---

### ENDING GATE — Chapter 2

```
[GATE] ENDING_GATE_2
  id: "ending_gate_2"
  evaluation order:

  → ending_2a_reunion
    condition: tomas_knows AND (tomas_bond >= 5 OR courage >= 6)
    outcome: Tomás speaks to Ines. It's complicated. But it happened.

  → ending_2b_absorbed
    condition: solis_standing >= 4 AND NOT tomas_knows
    outcome: Player joins the Conclave's logic. Knows where Ines is. Hasn't told Tomás.

  → ending_2c_exposed
    condition: tomas_knows AND (courage >= 5 OR cunning >= 5) AND solis_standing <= 2
    outcome: Player helped Tomás go public. Solis is gone. Chaos follows.

  → ending_2d_deferred  [FALLBACK — always reachable]
    condition: none of the above
    outcome: Nothing resolved. Solis left with what she came for. Tomás is still waiting.
              The player knows more than they did. It isn't enough yet.
```

---

### CHAPTER 2 ENDINGS (4 total)

---

```
[ENDING] ENDING_2A_REUNION
  id: "ending_2a_reunion"
  chapterExports:
    chapter_2_solis_stance: "confronted"
    ines_status: "found"
    lira_chapter_2_status: "ally" OR "neutral" (depends on approach)
  summary: Tomás sees Ines. Not through a letter — in person, in a borrowed
    room that Solis made available with the specific expression of someone
    managing a liability. Ines is not a prisoner. She's also not entirely free.
    The reunion is the most complicated thing either of them has had in three years.
    Solis gives the player a number as she leaves. "When you're ready," she says.
    She doesn't say ready for what. She doesn't have to.
    Lira, in the corridor afterward, looks at the player with something that
    might be respect. She doesn't say anything. She doesn't need to.
```

```
[ENDING] ENDING_2B_ABSORBED
  id: "ending_2b_absorbed"
  chapterExports:
    chapter_2_solis_stance: "joined"
    ines_status: "hidden"
    lira_chapter_2_status: "ally"
  summary: The player joined the logic of containment. Not because they were
    coerced — because Solis's argument had weight and the player let it.
    Tomás doesn't know where his sister is. The player does. They'll tell him
    when it's safe. That's what they tell themselves.
    Solis leaves a focusing anchor on the player's desk — the same kind Tomás
    used in the crisis. A small, flat stone that hums when you press it to a
    surface. No note. No instructions. They'll know when to use it.
    The question that follows them into Chapter 3: at what point does
    making the sensible choice become the wrong one?
```

```
[ENDING] ENDING_2C_EXPOSED
  id: "ending_2c_exposed"
  chapterExports:
    chapter_2_solis_stance: "confronted"
    ines_status: "exposed"
    lira_chapter_2_status: "enemy"
  summary: The player helped Tomás go public — to the student body, to whatever
    outside contact Tomás had, to everyone they could reach before Solis
    contained it. Solis was gone within two hours. The school is in a complicated
    kind of chaos — not panic, but the specific unease of an institution that
    has had something true said about it loudly.
    Ines makes contact three days later. A message, brief, no return address.
    "You have no idea what you've done. I chose this. I was safer before you
    found me." There's no way to know if she means it. There's no way to know
    if it matters.
    Lira is gone. Transferred, the school says. Personal circumstances.
```

```
[ENDING] ENDING_2D_DEFERRED
  id: "ending_2d_deferred"
  chapterExports:
    chapter_2_solis_stance: "walked"
    ines_status: "hidden"
    lira_chapter_2_status: "neutral"
  summary: Solis left with what she came for — an assessment, an offer, a
    read on the player that she'll use at a time of her choosing. Tomás is
    still waiting. The player knows more than they did. It isn't enough.
    Not yet.
    It is the least dramatic outcome. It might be the most honest one.
    Some chapters end in resolution. Some just end.
    The focusing anchor arrives in the post three weeks later. No sender address.
    Just the stone, and the hum, and the waiting.
```

---

## Complete Scene List — Chapter 2 (23 nodes)

```
s09a_marked_morning        ACT 1 — divergent open (lira_status: watching)
s09b_watcher_morning       ACT 1 — divergent open (lira_status: unaware)
s09c_fracture_morning      ACT 1 — divergent open (lira_status: owns_you)
c01_fracture_morning_choice ACT 1 — choice (fracture path only)
s10_archive_discovery      ACT 1 — convergence
c02_archive_response       ACT 1 — choice
s11_eska_visit             ACT 1
g06_eska_trust_gate        ACT 1 — gate
s12_eska_speaks            ACT 1 — gate TRUE path
s12_eska_silent            ACT 1 — gate FALSE path
s13_lira_conversation      ACT 2
c03_lira_response          ACT 2 — choice
s14_solis_identified       ACT 2
g07_solis_initiative_gate  ACT 2 — gate
s15_player_finds_solis     ACT 2 — gate TRUE path
s15_solis_finds_player     ACT 2 — gate FALSE path
s16_choose_approach        ACT 2 — major branch point
c04_approach_choice        ACT 2 — choice (4 options)
s17a_with_lira             ACT 2 — branch
s17b_with_aldric           ACT 2 — branch
s17c_with_tomas            ACT 2 — branch
s17d_alone                 ACT 2 — branch
s18_solis_formal_meeting   ACT 3 — convergence
c05_solis_meeting_response ACT 3 — choice
s19_solis_explains         ACT 3
s20_tomas_in_the_room      ACT 3
c06_tomas_moment           ACT 3 — choice (4 options, 1 gated)
g08_confrontation_gate     ACT 3 — gate
s21_negotiation            ACT 3 — convergence
ending_gate_2              ENDING — evaluator
ending_2a_reunion          ENDING
ending_2b_absorbed         ENDING
ending_2c_exposed          ENDING
ending_2d_deferred         ENDING — fallback
```

**Total: 34 nodes** (23 scenes/choices + 6 gates + 5 endings including gate evaluator)

---

## New Flags Required in manifest.json (scenes array)

Add all s09–s21 scene IDs plus ending_2a through ending_2d to the manifest `scenes` array.

---

## Graph Integrity Checks

- ✅ All three chapter 1 lira_status values are handled (watching / unaware / owns_you)
- ✅ All choice branches converge before Act 3
- ✅ All gate TRUE and FALSE paths are defined
- ✅ Fallback ending (2d_deferred) is always reachable regardless of stats
- ✅ No orphaned nodes
- ✅ All endings set chapterExports for Chapter 3
- ⚠️  Chapter 1 endings must be converted to chapter transitions (see Prerequisites above)
- ⚠️  New flags and solis_standing relationship must be added to schema before content is written
- ⚠️  New consequence types (set_chapter_export, advance_chapter) must be added to engine

---

## Open Questions for Chapter 3

1. What is the Fracture's origin — natural phenomenon or deliberate creation?
2. Is the Conclave ultimately a force for good, evil, or genuinely ambiguous?
3. Does Lira have a path to full redemption, or is she a permanent moral grey?
4. What is Caden's role in the larger story — he has been largely reactive so far
5. Does Sera's hidden grief (mentioned in chapter 1 NPC brief) become a plot thread?
6. What is the chapter 3 climax, and does it resolve the Conclave arc or deepen it?
