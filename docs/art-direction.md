# Art Director Output — Aethermoor Academy Visual & Sensory Bible

---

## 1. Visual Identity & Overall Aesthetic

**Art style:** Painterly cinematic visual novel. Rich, hand-illustrated backgrounds with dramatic lighting. Character portraits are semi-realistic with expressive linework — closer to Disco Elysium / Fate Grand Order than anime chibi. Every frame should feel like a still from a dark fantasy film.

**Mood:** Dark academia meets high fantasy. Ancient stone and candlelight alongside contemporary detail (a student's phone on a desk, a modern backpack against Gothic archways). Magical elements are luminous and otherworldly against grounded, textured environments.

**Reference touchstones:**
- Environments: *Disco Elysium*, *80 Days*, *Pentiment*
- Characters: *Fate/Stay Night*, *Cyberpunk: Edgerunners* (stylised realism)
- UI: *Hades*, *Slay the Spire* (dark panels, gold accents, readable at a glance)
- Cinematics: *Detroit: Become Human* (dramatic lighting, close framing)

---

## 2. Color Palette

### 2a. Global UI Palette

```json
{
  "background_deep":    "#0D0F1A",
  "background_panel":   "#141624",
  "background_card":    "#1C1F33",
  "surface_elevated":   "#232640",
  "border_subtle":      "#2E3150",
  "border_active":      "#C9A84C",

  "text_primary":       "#F0EAD6",
  "text_secondary":     "#9A9EB8",
  "text_muted":         "#5C607A",
  "text_on_accent":     "#0D0F1A",

  "accent_gold":        "#C9A84C",
  "accent_gold_light":  "#F0D080",
  "accent_gold_dark":   "#8A6E2A",

  "state_success":      "#4CAF7A",
  "state_warning":      "#E0A030",
  "state_danger":       "#C94C4C",
  "state_info":         "#4C8BC9",

  "fracture_primary":   "#6B2FA0",
  "fracture_glow":      "#A855F7",
  "fracture_void":      "#0A0510",
  "fracture_corrupt":   "#3D1060"
}
```

### 2b. Order Accent Palettes

Each Order has a distinct accent palette used in common room backgrounds, portrait frames, stat bars, and Order-specific UI elements.

```json
{
  "ignis": {
    "primary":    "#C94C2A",
    "secondary":  "#E8803A",
    "glow":       "#FF6B35",
    "deep":       "#5C1A0A",
    "text":       "#FFD4B8"
  },
  "aqualyn": {
    "primary":    "#2A7A8C",
    "secondary":  "#4AB8CC",
    "glow":       "#7DE8F8",
    "deep":       "#0A2A33",
    "text":       "#B8F0F8"
  },
  "terram": {
    "primary":    "#4A7A2A",
    "secondary":  "#8AB84A",
    "glow":       "#AADE6A",
    "deep":       "#1A2A0A",
    "text":       "#D4F0B8"
  },
  "ventus": {
    "primary":    "#4A5A8C",
    "secondary":  "#8A9AC8",
    "glow":       "#C0CCEE",
    "deep":       "#1A1E33",
    "text":       "#D8DEF8"
  }
}
```

---

## 3. Typography System

### 3a. Typeface Selections

| Role | Typeface | Fallback | Notes |
|---|---|---|---|
| Display / Title | **Cinzel** | Georgia, serif | Classical Roman capitals. Used for chapter titles, location names, Order names |
| Body / Dialogue | **Lora** | Palatino, serif | Warm transitional serif. All narrative prose and NPC dialogue |
| UI Labels | **Inter** | Helvetica, sans-serif | Clean geometric sans. Buttons, stats, menus, system text |
| Flavour / Lore | **IM Fell English** (italic) | Garamond, serif | Old-world feel. Used for item descriptions, lore entries, in-world documents |

All typefaces are Google Fonts — free, web-optimised.

### 3b. Type Scale

```json
{
  "display_xl":   { "size": "48px", "weight": 700, "line_height": 1.15, "font": "Cinzel",           "tracking": "0.04em" },
  "display_lg":   { "size": "36px", "weight": 700, "line_height": 1.2,  "font": "Cinzel",           "tracking": "0.03em" },
  "display_md":   { "size": "28px", "weight": 600, "line_height": 1.25, "font": "Cinzel",           "tracking": "0.02em" },
  "heading":      { "size": "22px", "weight": 600, "line_height": 1.3,  "font": "Lora",             "tracking": "0.01em" },
  "subheading":   { "size": "16px", "weight": 600, "line_height": 1.4,  "font": "Inter",            "tracking": "0.05em", "uppercase": true },
  "body_lg":      { "size": "18px", "weight": 400, "line_height": 1.75, "font": "Lora",             "tracking": "0em"    },
  "body_md":      { "size": "16px", "weight": 400, "line_height": 1.7,  "font": "Lora",             "tracking": "0em"    },
  "body_sm":      { "size": "14px", "weight": 400, "line_height": 1.6,  "font": "Lora",             "tracking": "0em"    },
  "ui_label":     { "size": "13px", "weight": 500, "line_height": 1.4,  "font": "Inter",            "tracking": "0.06em", "uppercase": true },
  "ui_value":     { "size": "15px", "weight": 600, "line_height": 1.4,  "font": "Inter",            "tracking": "0em"    },
  "flavour":      { "size": "15px", "weight": 400, "line_height": 1.8,  "font": "IM Fell English",  "style": "italic"    }
}
```

---

## 4. UI Component Specs

### 4a. Dialogue Box

```
Structure:
  - Full-width panel anchored to bottom 30% of screen
  - Background: background_panel (#141624) at 92% opacity
  - Top border: 1px solid border_active (gold) with subtle glow
  - Left edge: 4px solid bar in speaker's Order accent color
  - Speaker name: display_md / Cinzel / accent_gold — top-left above prose
  - Dialogue text: body_lg / Lora — left-aligned, 24px padding all sides
  - "Continue" affordance: small animated chevron (▼) bottom-right, accent_gold
  - Max width: 960px, centred
  - Corner radius: 4px (subtle, not bubbly)
```

### 4b. Choice Cards

```
Structure:
  - Vertical stack of 2–4 cards, centred, above dialogue box
  - Each card:
      width: 640px max
      background: background_card (#1C1F33)
      border: 1px solid border_subtle, transitions to border_active on hover
      left accent bar: 3px, accent_gold (default), Order color (if trait-gated)
      padding: 18px 24px
      text: body_md / Lora
      corner radius: 6px
  - Hover state: background lifts to surface_elevated, left bar brightens, subtle gold glow
  - Gated choice (trait requirement not met): text_muted color, lock icon left, no hover
  - Gated choice (met): normal display with small trait icon showing requirement
  - Transition: 150ms ease-in-out
```

### 4c. Stat Panel (Traits & Relationships)

```
Structure:
  - Collapsible side panel, right edge of screen
  - Width: 240px expanded, 48px collapsed (icon strip)
  - Background: background_panel at 88% opacity, blur backdrop
  - Section: TRAITS
      5 rows — label (ui_label) + horizontal bar
      Bar: 180px wide, 6px tall, rounded
      Fill color: Order accent primary
      Background: border_subtle
      Value shown as number (ui_value) to right
  - Section: BONDS
      5 NPC rows — avatar circle (32px) + name + bar
      Bar fill: per-NPC color (see character specs)
  - Divider between sections: 1px border_subtle
  - Collapsed state: 5 trait icons only, with value tooltip on hover
```

### 4d. Chapter Title Card

```
  - Full-screen overlay
  - Background: black, fading in from scene
  - Chapter number: display_xl / Cinzel / text_muted — centred, upper area
  - Chapter name: display_lg / Cinzel / accent_gold — centred, below number
  - Decorative rule: thin horizontal line with central diamond glyph in accent_gold
  - Fade in: 800ms, hold 2s, fade out: 600ms
  - Ambient particles: 8–12 slow-drifting motes in player's Order color
```

### 4e. Ending Card (Chapter Conclusion)

```
  - Full-screen
  - Background: deep gradient from background_deep to ending-specific accent color
  - Ending title: display_xl / Cinzel / accent_gold_light — centred
  - Flavour line: flavour style / IM Fell English italic / text_secondary — below title
  - Consequence summary: 3–5 bullet lines, body_sm, text_primary
      Each line prefaced with an icon (↑ trait, ↓ trait, ● relationship)
  - "Continue to Chapter 2" button — primary button style, bottom centre
  - Background: subtle animated illustration (parallax, slow drift)
```

### 4f. Button Styles

```
Primary:
  background: accent_gold
  text: text_on_accent / Inter 600 / 14px uppercase
  padding: 14px 32px
  border-radius: 4px
  hover: accent_gold_light, slight scale(1.02)
  active: accent_gold_dark

Secondary:
  background: transparent
  border: 1px solid border_active
  text: accent_gold / Inter 500 / 14px uppercase
  hover: background_card fill

Danger:
  background: state_danger
  text: text_primary
  same shape as primary

Disabled:
  background: border_subtle
  text: text_muted
  cursor: not-allowed
```

### 4g. Loading / Transition Screen

```
  - Background: background_deep
  - Centre: Aethermoor Academy crest (SVG, animated slow rotation glow)
  - Crest: geometric symbol — interlocking four-element runes in a circle
  - Beneath crest: flavour loading line from lore pool, flavour text style
  - Progress: thin gold line sweeping across bottom of screen (not a bar — a sweep)
```

---

## 5. Background Scene Art Briefs

### BG_01 — Aethermoor Gates (S01_ARRIVAL)
```
Mood:        Awe, anticipation, slightly ominous
Time:        Late dusk — deep purple sky, first stars visible
Composition: Wide establishing shot. Gates in foreground (wrought iron, stone pillars
             with glowing rune carvings). Academy silhouette rises in mid-ground,
             towers lit from within with warm amber. Enchanted lanterns line the path.
Palette:     Deep purple sky (#1A0A33 to #0D0F1A), amber building glow (#C9A84C),
             cool blue moonlight on stone (#B8C4D8), mist along ground
Details:     Subtle magical motes drifting upward from the gate stones.
             Other students (silhouettes only) filtering through the gate.
             An owl perched on the left pillar.
Aspect:      16:9 landscape, with vertical safe zone for portrait overlays (right 40%)
```

### BG_02 — Entrance Courtyard (S02, golden hour)
```
Mood:        Busy, exciting, slightly overwhelming
Time:        Late afternoon golden hour
Composition: Cobblestone courtyard. Gothic academy facade fills upper two-thirds.
             Dozens of students (silhouettes/background figures) milling about.
             Stone fountain at centre with glowing water element.
Palette:     Warm gold light (#F0D080) raking across stone, long shadows,
             deep amber (#C9A84C) on windows, cool shadow areas (#1C1F33)
Details:     Floating enchanted trunks being guided by students.
             Notice boards with glowing parchment pinned to them.
             Ivy with faintly bioluminescent leaves climbing the walls.
Aspect:      16:9, portrait safe zone right 35%
```

### BG_03 — Grand Hall, Sorting (S03)
```
Mood:        Ceremonial, ancient, impressive
Time:        Evening — candles only
Composition: Interior. Soaring vaulted ceiling with floating candelabras.
             Four long house tables receding into depth. Staff table on raised dais.
             New students stand in a cluster foreground-centre.
Palette:     Deep warm interior (#1A1200 floor), amber candle glow (#C9A84C to #F0D080)
             falling from above, four subtle colored light pools (one per Order table:
             red/amber, teal, green, slate blue), velvet shadow in upper reaches
Details:     Magical ceiling showing live star map. Banners for four Orders flanking
             the dais. Stone walls with relief carvings of historical Weavers.
Aspect:      16:9, portrait safe zone right 35%, crowd visible left
```

### BG_04 — Order Common Rooms (S04) — 4 variants

```
Ignis Common Room:
  Mood:     Energetic, competitive, warm
  Palette:  Deep crimson walls, amber firelight, bronze fixtures
  Details:  Large central hearth always burning. Training dummies in alcove.
            Trophy cases. Red and amber drapes. Stone floor with Ignis rune.

Aqualyn Common Room:
  Mood:     Calm, reflective, melancholic undercurrent
  Palette:  Deep teal walls, cool silver light, blue-green accents
  Details:  Indoor pool/fountain feature. Bookshelves. Star charts on walls.
            Soft bioluminescent plants. Stone floor, damp-look.

Terram Common Room:
  Mood:     Grounded, studious, ancient
  Palette:  Deep forest green, warm brown wood, bronze lanterns
  Details:  Living moss walls. Long study tables covered in notes.
            Herb bundles hanging from beams. Root-like architectural details.

Ventus Common Room:
  Mood:     Clever, watchful, slightly cold
  Palette:  Slate blue-grey, silver, pale blue light from high windows
  Details:  High ceilings, maps everywhere, weather instruments.
            Hammocks strung between beams. Wind chimes (silver).

All variants:
  Composition: Comfortable seating area foreground, depth to study/fireplace area.
  Aspect: 16:9, portrait safe zone right 35%
```

### BG_05 — Elemental Casting Hall (S05)
```
Mood:        Tension, formal, controlled power
Time:        Morning, daylight through tall enchanted windows
Composition: Large rectangular stone hall. Casting circle etched in floor glows faintly.
             Rows of student workstations receding left. Professor's demonstration
             platform foreground-right.
Palette:     Cool daylight (#C8D8E8) through windows, warm floor glow (#C9A84C),
             neutral grey stone walls, coloured elemental residue in air (ember sparks,
             water droplets, earth motes, wind shimmer)
Details:     Scorched marks on far wall from past attempts. Protective rune barriers
             around the perimeter. Floating elemental reference glyphs above each station.
Aspect:      16:9, portrait safe zone right 35%
```

### BG_06 — Restricted Corridor B (S06, S07A)
```
Base variant (S06 — discovery):
  Mood:     Danger, secrecy, forbidden knowledge
  Time:     Midday but windowless — torch-lit
  Composition: Narrow stone corridor receding to vanishing point. Arched ceiling.
               Barred doors on left side. Warning rune markers on walls.
               Lira mid-ground, just visible doing something she shouldn't.
  Palette:  Deep shadow (#0D0F1A), cold torchlight (#7090A0), sickly purple Fracture
            glow (#6B2FA0) emanating from Lira's hands

Duel variant (S07A — same location, different lighting):
  Mood:     Confrontational, electric
  Changes:  Torches flared brighter, Fracture glow more intense,
            warm amber from Ignis-order torch adds contrast.
            Subtle red combat-tint to ambient light.

Aspect:     16:9, portrait safe zone right 30% (corridor is narrow, use depth)
```

### BG_07 — Library (S07B)
```
Mood:        Safe harbour, secrets, quiet urgency
Time:        Night — warm lamp glow
Composition: Multi-storey library interior. Towering bookshelves left and back.
             Low reading tables with enchanted floating lamps. Mezzanine above.
             Feels enclosed but safe.
Palette:     Deep warm amber (#C9A84C) lamp glow, dark wood shelves (#1A1200),
             book spines in rich jewel tones, cool darkness at height
Details:     Some books floating mid-air in transit. Enchanted card catalogue
             animating itself. A cat sleeping on a top shelf.
Aspect:      16:9, portrait safe zone right 35%
```

### BG_08 — Professor Aldric's Office (S07C)
```
Mood:        Authority, trust, weight of knowledge
Time:        Any — interior, no windows
Composition: Cluttered scholar's office. Desk foreground-left.
             Walls lined with bookshelves, specimen jars, elemental instruments.
             A chalkboard with half-erased diagrams behind the desk.
Palette:     Deep warm green-brown interior, fireplace glow from right,
             desk lamp cone of light, deep shadow in corners
Details:     Aldric's Order memorabilia on one shelf. Framed certificates.
             A spinning elemental orrery on the desk.
Aspect:      16:9, portrait safe zone right 35%
```

### BG_09 — Aethermoor Courtyard, Night Crisis (S08)
```
Mood:        Chaos, fear, midnight magic
Time:        Deep night — moonlight + Fracture glow
Composition: Wide courtyard. Student collapsed foreground-centre (silhouette only,
             never detailed). Crowd of students forming a panicked ring.
             Lira visible on a stone balcony upper-right — calm, watching.
             Open sky above with magical aurora visible.
Palette:     Cold midnight blue (#0A0D1A), silver moonlight, sickly purple Fracture
             glow radiating from collapsed student (#6B2FA0), warm amber from
             dormitory windows in background, crowd torches
Details:     Fracture energy crackling on the ground around victim.
             Teachers rushing from a doorway left background (blurred motion).
             Magical aurora above in purple and silver — mirrors the Fracture below.
Aspect:      16:9, portrait safe zone right 35%, crowd fills left half
```

---

## 6. Character Art Direction

All characters: **bust portrait format**, head to mid-chest. Painted in the same style as backgrounds — semi-realistic, expressive, cinematic. Each character has **4 expression states minimum.**

### CHAR_00 — Player Character (Protagonist)

```
Design philosophy: Intentionally neutral features to aid player projection.
                   Customisable hair colour/style at character creation.
                   Costume reflects their chosen Order.
Silhouette:        Average height, readable at small sizes.
Base costume:      Academy uniform — dark navy blazer, white shirt, Order-coloured
                   tie and piping, dark trousers/skirt (player choice).
Expression states: Neutral, Determined, Afraid, Surprised
Portrait frame:    No Order border until sorted — plain gold after sorting.
```

### CHAR_01 — Sera Voss (NPC_01, Aqualyn)

```
Age:          17
Ethnicity:    South Asian
Build:        Slight, small
Hair:         Dark, wavy, shoulder-length. Often slightly messy.
Eyes:         Deep brown, warm
Costume:      Aqualyn uniform — teal piping, silver buttons. A small charm
              bracelet she touches when anxious.
Colour story: Cool teal and silver against warm brown skin tones.
              Gentle lighting — she's never shot harshly.
Expressions:
  - Neutral:  Soft half-smile, slightly guarded eyes
  - Happy:    Full warm smile, eyes bright — rare, feels earned
  - Worried:  Brow furrowed, lip pressed, eyes searching
  - Grief:    Downcast eyes, still expression, barely contained
Relationship bar colour: #4AB8CC (Aqualyn secondary)
```

### CHAR_02 — Caden Miral (NPC_02, Ignis)

```
Age:          18
Ethnicity:    Mixed — Black British / East European
Build:        Athletic, tall
Hair:         Short-cropped natural, slight fade
Eyes:         Amber-brown
Costume:      Ignis uniform — crimson piping, polished bronze buttons.
              Sleeves often slightly pushed up.
Colour story: Warm amber and crimson against his complexion. Lit with
              confident warm-right-side lighting.
Expressions:
  - Neutral:    Arms crossed, assessing look, not hostile
  - Competitive: Smirk, raised brow, challenge in eyes
  - Impressed:  Open expression, slight nod, rare
  - Angry:      Jaw set, eyes hard, controlled — not a shouter
Relationship bar colour: #E8803A (Ignis secondary)
```

### CHAR_03 — Professor Aldric (NPC_03)

```
Age:          Mid 50s
Ethnicity:    Northern European
Build:        Lean, slightly stooped from years of study
Hair:         Steel grey, swept back, neat
Eyes:         Steel blue, sharp
Costume:      Professor robes — deep charcoal with Order piping
              (Order TBD). Reading glasses pushed up on head.
Colour story: Cool grey and charcoal. Lit with neutral authority lighting.
Expressions:
  - Neutral:   Measured, evaluating, difficult to read
  - Approving: Small nod, subtle warmth in eyes — high bar to reach
  - Stern:     Direct gaze, no expression — makes players feel assessed
  - Grave:     Weight in expression, used for serious revelations
Relationship bar colour: #8A9AC8 (Ventus secondary — placeholder until Order confirmed)
```

### CHAR_04 — Lira Thane (NPC_04, Ventus)

```
Age:          20 (senior student)
Ethnicity:    East Asian
Build:        Tall, poised, deliberately composed posture
Hair:         Black, straight, worn in a precise high knot with loose strands.
              A single silver pin through the knot.
Eyes:         Dark brown, calculating
Costume:      Ventus uniform, senior variant — silver piping, more ornate buttons.
              Always looks entirely intentional. Nothing out of place.
Colour story: Slate blue, silver, black. Cold and precise lighting — left side
              often in shadow. When Fracture energy is present, sickly purple
              bleeds into her shadow areas.
Expressions:
  - Neutral:      Slight smile that doesn't reach her eyes. Most common.
  - Calculating:  No smile, tilted head, full attention — unsettling
  - Rare warmth:  Genuine but brief — used sparingly for key trust moments
  - Dangerous:    Cold smile widens, eyes sharpen — player should feel warned
Relationship bar colour: #C0CCEE (Ventus glow) — shifts to fracture_glow (#A855F7) if lira_influence >= 7
```

### CHAR_05 — Tomás Reeve (NPC_05, Terram)

```
Age:          17
Ethnicity:    Latin American
Build:        Average, slightly rounded, unthreatening
Hair:         Dark brown, slightly overgrown, pushed to one side
Eyes:         Dark brown, observant, kind
Costume:      Terram uniform — forest green piping, worn-in look.
              A small notebook always visible in breast pocket.
Colour story: Warm earthy greens and browns. Soft, warm lighting.
Expressions:
  - Neutral:   Quiet observer — watchful but not cold, always noting
  - Trusting:  Leans in slightly, open expression — costs something to earn
  - Alarmed:   Wide eyes, pulled back slightly — he's seen things
  - Resolute:  Quiet determination — rare but powerful when it appears
Relationship bar colour: #8AB84A (Terram secondary)
```

---

## 7. Icon System

```
Style:        Thin-stroke (1.5px) line icons at 24×24px base.
              Slightly rounded ends (not sharp). Consistent with Inter typeface feel.
              Gold fill (#C9A84C) for active, grey (#5C607A) for inactive.

Trait icons (24×24):
  courage:    Flame glyph — simple upward flame
  cunning:    Eye glyph — stylised open eye
  empathy:    Hands glyph — two hands open toward each other
  ambition:   Arrow glyph — arrow pointing diagonally up-right
  wisdom:     Scroll glyph — partially unrolled scroll

Order icons (32×32):
  ignis:      Flame with inner geometric form
  aqualyn:    Wave with droplet
  terram:     Mountain with roots below
  ventus:     Spiral wind form

Status icons (20×20):
  lock:       Standard padlock (for gated choices)
  trait_up:   Small upward chevron in state_success green
  trait_down: Small downward chevron in state_danger red
  flag:       Simple pennant flag
  save:       Quill writing on parchment (not floppy disk)

Menu icons (24×24):
  journal:    Open book
  map:        Folded map with pin
  inventory:  Bag with drawstring
  settings:   Gear (single, not double)
  save_load:  Hourglass
```

---

## 8. Transition & Animation Language

### Scene Transitions

```
Standard scene change:
  Out: Slow fade to background_deep (#0D0F1A) — 400ms ease-in
  Hold: 200ms
  In:  Fade up from black — 500ms ease-out
  Use: All standard scene-to-scene transitions

Dramatic moment (crisis, duel, revelation):
  Out: Fast horizontal wipe from right — 250ms linear
  Hold: 0ms
  In:  Opposite wipe reveals new scene — 300ms ease-out
  Use: Branch point 3, duel trigger, crisis scene

Chapter ending:
  Out: Slow desaturate then fade — 800ms
  Hold: 500ms
  In:  Ending card fades in — 600ms ease-out

Fracture event:
  Effect: Screen briefly flickers (2 frames) with fracture_glow overlay
          before standard fade. Subtle screen shake (3px, 150ms).
  Use: Any scene involving Fracture energy
```

### UI Animations

```
Choice card appear:     Slide up 12px + fade in, 200ms ease-out, staggered 60ms per card
Choice card hover:      Background brighten + left bar glow, 150ms ease-in-out
Choice card select:     Brief pulse (scale 1.02 → 1.0), 120ms, then cards fade out
Dialogue text:          Typewriter — character by character, 18ms per character.
                        Player can click to complete instantly.
Stat bar fill:          Smooth fill animation on value change, 400ms ease-in-out.
                        Colour flash (bright then settle) if value increases.
                        Colour drain (dim then settle) if value decreases.
Portrait entrance:      Fade in over 300ms + slight scale from 0.97 → 1.0
Portrait exit:          Fade out 200ms
Ambient particles:      Slow drift upward, 6–8s cycle, random offset, 40% opacity
```

---

## 9. Sound & Music Direction

### 9a. Music

**Genre:** Orchestral with electronic undertones. Gothic chamber strings as the spine. Subtle electronic textures for modernity. Full cinematic score — not ambient loops.

**Emotional register:** Melancholic, mysterious, with moments of genuine wonder and dread. Think *The Witcher 3* score meets *Ori and the Blind Forest* meets dark academia.

**Adaptive system:** Three tension layers per location track:

```
Layer 1 (base):    Strings + sparse piano. Always playing.
Layer 2 (tension): Cello swell + low brass added. Triggered by branch point approach.
Layer 3 (crisis):  Full orchestra + electronic percussion. Triggered by crisis/duel.
```

**Per-location music briefs:**

| Location | Track Name | Instrumentation | Mood |
|---|---|---|---|
| Aethermoor gates | *The First Sight* | Strings, French horn swell, piano | Awe, scale, mystery |
| Grand hall sorting | *The Resonance Trial* | Full chamber orchestra, ceremonial | Ancient, weighty, expectant |
| Ignis common room | *Ember Hours* | Warm brass, pizzicato strings | Competitive energy, warmth |
| Aqualyn common room | *Still Water* | Solo cello, soft piano, flowing arpeggios | Melancholic calm |
| Terram common room | *Deep Roots* | Low strings, woodwind, steady pulse | Grounded, ancient |
| Ventus common room | *Highwire* | Sparse piano, high strings, wind texture | Clever, watchful, cool |
| Casting hall | *First Weave* | Tense strings, staccato woodwind, building | Concentration, pressure |
| Restricted corridor | *Forbidden Thread* | Low cello drone, solo violin, silence gaps | Dread, danger |
| Library | *Quiet Archive* | Solo guitar or lute, very sparse | Safety, secrets, intimacy |
| Aldric's office | *The Weight of Knowing* | Piano, low strings | Authority, gravity |
| Crisis courtyard | *The Fracture Event* | Full orchestra, electronic disruption | Fear, urgency, awe |

**Ending music variants:**

```
Ending A (The Marked One):
  Track: *Chosen* — heroic but ominous. Strings resolving to major key
         but with an unresolved bass note underneath.

Ending B (The Watcher):
  Track: *What You Know* — quiet, suspenseful. Solo piano.
         Melody doesn't resolve. The chapter ends mid-thought.

Ending C (The Fracture):
  Track: *Her Smile* — chilling. Very sparse. A single violin motif
         over near-silence. The sense of something closing around the player.
```

### 9b. Sound Effects

```
Category: UI
  choice_hover:    Soft parchment rustle
  choice_select:   Quill-scratch flourish + soft thud
  dialogue_next:   Subtle page turn
  menu_open:       Book spine creak
  menu_close:      Same, reversed
  save:            Soft chime, ink-blot sound

Category: Magic / Weaving
  weave_attempt:   Slow energy build, resonant hum
  weave_success:   Crystalline chime burst in Order colour's frequency register
  weave_fail:      Low thud, energy dissipation, slight reverse
  fracture_pulse:  Deep sub-bass pulse + high harmonic scrape — unsettling
  fracture_crack:  Sharp tearing sound + reverb tail
  duel_start:      Tension sting — bow drawn across strings sharply

Category: Environment
  gate_arrival:    Distant bells, wind, enchanted stone hum
  grand_hall:      Murmur of crowd, floating candleflame flicker
  common_room:     Hearth crackle / water flow / wind / leaves (per Order)
  library:         Page turns, soft footsteps, occasional book float
  corridor:        Echoing footsteps, distant doors, silence emphasis
  courtyard_night: Crickets, wind, then silence as crisis begins

Category: NPC signature cues (2s, on portrait entrance)
  Sera:   Soft water droplet chord
  Caden:  Ember snap
  Aldric: Clock tick
  Lira:   Single high violin harmonic
  Tomás:  Rustling leaves
```

### 9c. Audio UX Rules

```
- All music fades out over 1.5s when player opens settings or menu
- All SFX respect a master SFX volume slider separate from music
- Fracture sounds are never fully muted even at low volumes — slight presence maintained
  (narrative reason: the Fracture is always there)
- Browser autoplay: music does not start until first player interaction (click/tap)
  A subtle "tap to begin" screen handles this before the title card
- No audio should ever loop with an audible seam — all loops are crossfaded
```

---

## 10. Asset Delivery Specifications

```
Backgrounds:
  Format:    WebP (primary), PNG fallback
  Size:      2560×1440px master, exported at 1920×1080px for web
  Variants:  Each background has a "dialogue mode" version (lower 30% slightly darkened
             to ensure dialogue box text legibility)
  Naming:    bg_[scene_id]_[variant].webp  e.g. bg_s04_ignis.webp

Character portraits:
  Format:    WebP with transparency, PNG fallback
  Size:      512×640px at 2x for retina
  Variants:  [char_id]_[expression].webp  e.g. char_sera_worried.webp
  Framing:   Head centred at 35% from top. Chest cut at bottom.

Icons:
  Format:    SVG (all icons), PNG fallback at 48×48px
  Naming:    icon_[category]_[name].svg  e.g. icon_trait_courage.svg

Music:
  Format:    OGG Vorbis (primary), MP3 fallback
  Bitrate:   192kbps
  Naming:    mus_[location]_[layer].ogg  e.g. mus_corridor_base.ogg

SFX:
  Format:    OGG Vorbis
  Bitrate:   128kbps
  Length:    Under 3s for UI/interaction, under 8s for ambient stings
  Naming:    sfx_[category]_[name].ogg  e.g. sfx_ui_choice_select.ogg
```

---

## Chapter 4 Additions — *The Weight of the Conclave*

---

### Background Art Briefs (Chapter 4)

### BG_10 — Intake Courtyard, Processing Day (S35_THE_ARRIVALS)
```
Mood:        Unsettling normalcy — bureaucratic cheerfulness over something wrong
Time:        Morning, overcast — flat grey-white light, no warmth
Composition: View from a high window looking down into the courtyard below.
             The ground-level scene appears small, ordered, efficient.
             A queue of young students (12–14, silhouettes/low detail) filing past
             a single man with an assessor's badge working a tablet.
             Administrative staff in foreground-right are smiling.
             The queue moves in a way that feels too smooth.
Palette:     Cool grey stone (#9AA0B0), muted parchment uniforms, flat overcast sky
             (#C8CCD8). No warm tones. The assessor's badge catches the only gold.
             The players' view is from inside — warm interior framing (dark edge
             vignette) against the cold courtyard.
Details:     The window sill in the foreground establishes the viewer's remove.
             Caden's shoulder barely visible left-edge of frame — implied, not shown.
             No magical elements visible. The Fracture doesn't announce itself here.
Aspect:      16:9, composition emphasises vertical distance from viewer to courtyard
```

### BG_11 — South Gate Exterior (S39_LIRA_RETURNS)
```
Mood:        Ambiguous threshold — outside is not safety, inside is not home
Time:        Late afternoon, golden hour, slightly hazy
Composition: Player POV facing south gate from just outside. Aethermoor's walls
             and towers visible through the gate behind you — warmly lit, slightly
             distant. A low stone wall runs left. Open road to right.
             Lira stands in three-quarter view, back partly to the gate.
             Practical civilian clothing — no uniform, no Academy insignia.
Palette:     Warm late-sun gold on stone walls and road (#D4A44C), hazy atmospheric
             perspective on towers, cooler foreground shadow where Lira stands.
             Her clothing: desaturated, functional — deliberately not glamorous.
Details:     The gate itself is visible but slightly open — not closed against her,
             just not for her right now. Wind-moved grass on the roadside.
             No crowd, no other people. The isolation is legible.
Aspect:      16:9, portrait safe zone centre (Lira) and right 30%
```

### BG_12 — Public Archives Building, Seminar Room (S40_ARCHIVIST_IN_PERSON)
```
Mood:        Unexpectedly ordinary — a neutral room that holds an extraordinary meeting
Time:        Afternoon, natural light from tall windows, no dramatic lighting
Composition: Medium interior shot. A seminar table occupies foreground-to-mid.
             Tall windows left — institutional, not Gothic, slightly utilitarian.
             Bookshelves along back wall in neat order (public archive, not arcane).
             A whiteboard with nothing on it. Institutional chairs.
             The Archivist sits at far end of table — small figure, large table.
Palette:     Neutral daytime interior — warm cream walls (#D8CFBA), cool grey carpet,
             natural window light (#C8D0D8), warm wood table (#8A6040).
             No Fracture purple. No Academy gold. Deliberately de-magicked.
             The one anomaly: a worn leather folder on the table — deep burgundy.
Details:     The very ordinariness of the room is significant. This is not the
             Academy. This is not the Conclave. This is a room the institution
             forgot to watch. The windows look onto a public street — small figures
             visible outside, oblivious.
Aspect:      16:9, portrait safe zone far end of table (The Archivist), right 35%
```

### BG_13 — Library Annex, Governance Day (S43_THE_GOVERNANCE_DAY)
```
Mood:        Suspended time — waiting with no information, nothing to do but endure
Time:        Cycling from morning to late afternoon within the scene (use static
             lighting calibrated to mid-afternoon — the longest hour)
Composition: A smaller, quieter adjunct to the main library. Lower ceilings.
             A window looking onto a courtyard — the wrong courtyard (not the
             Conclave's). Two worn sofas and a bench. A low table with phones on it.
             Nobody is using the table. Books on shelves but none open.
Palette:     Muted warm amber (#B8924C) — library lamp light, less vivid than BG_07.
             Afternoon light through window slowly going golden.
             Slightly desaturated vs the main library — less safe-feeling.
Details:     The phones on the table are face-up. One has a screen-on notification
             indicator visible (low detail — just implied). Dust motes in window light.
             A half-finished mug of coffee — Tomás's, off to one side.
Aspect:      16:9, portrait safe zone right 35%, window visible left
```

---

### Character Art Direction (Chapter 4)

### CHAR_06 — The Archivist (NPC_06, Conclave Internal)

```
Age:          Late 60s
Ethnicity:    Ambiguous — Northern or Central European features, deliberately
              unplaceable. Gender presentation: neutral-scholarly.
Build:        Small, slightly stooped, economical in movement
Hair:         White-silver, close-cropped, neat
Eyes:         Grey-green, precise — look directly at the subject. Never at anything
              else. Full attention is their default mode.
Costume:      Academic civilian — a dark grey suit (slightly worn at the elbows),
              white shirt, no tie. Reading glasses on a chain around their neck.
              No Conclave insignia. No Academy uniform. They dress as a scholar
              of no particular institution.
Colour story: Desaturated palette — grey, soft white, dark charcoal. The absence
              of colour is intentional. They have no Order, no allegiance visible
              on their surface. Lighting is even, clinical, unflattering and
              unromantic. They should not look powerful. They should look precise.
Expressions:
  - Neutral:     Hands folded, direct gaze, neutral expression. Evaluating.
                 Not warm, not cold — categorising. Most common state.
  - Engaged:     A specific quality of attention — leans slightly forward, gaze
                 sharpens, a slight tightening around the eyes. Seen when the
                 player says something accurate.
  - Weighted:    Used for the heaviest disclosures. Eyes down briefly, then back
                 up. The expression of someone who has said something true that
                 cost them something to say.
  - Decided:     Jaw set. Slight nod. The expression after a decision has been
                 made that they will not revisit. Used in the final Archivist scene.
Portrait frame: No Order border. Plain silver-grey frame — minimal.
Relationship:   Does not appear in the stat panel (no relationship key tracked).
                Only appears in portrait during S40_ARCHIVIST_IN_PERSON.
Asset note:     One background portrait needed. Four expression states. No
                animated elements.
```

### CHAR_07 — Davo Miral (NPC_07, Conclave Assessor)

```
Age:          Mid 20s (a few years older than Caden)
Ethnicity:    Mixed — Black British / East European (same heritage as Caden;
              family resemblance must be legible but not identical)
Build:        Similar frame to Caden — athletic — but carried differently.
              Caden's body is alert and reactive. Davo's is settled, controlled.
              The same structure, differently inhabited.
Hair:         Short-cropped natural, slightly longer on top than Caden's.
              Neatly maintained — professional setting shapes it.
Eyes:         Amber-brown (identical to Caden — this is the tell).
Costume:      Conclave assessor uniform — dark navy, fitted, functional.
              An assessor's badge on the left chest: rectangular, gold-edged,
              with a small rune indicator. No Academy insignia.
              Sleeves not pushed up (Caden pushes his sleeves up; Davo doesn't).
Colour story: Dark navy and pale gold, against warm complexion. Lighting is
              neutral, slightly cold — the lighting of institutional spaces.
              When he appears in the intake courtyard, he is lit from above
              (overhead institutional light), which flattens him slightly —
              intentional; he should look like part of the system.
Expressions:
  - Working:     The face of someone doing a familiar task with full attention.
                 No warmth, no coldness. Professional absorption. Used in S35.
  - Contained:   The expression when he sees Caden. Something real is present
                 but held at a specific distance. Not cold. Not soft. Contained.
                 This is his most important expression — players must be able to
                 read "this is genuine feeling being managed" not "this is nothing."
  - Direct:      Used when he addresses the player about the Commission files.
                 Full attention, low volume, entirely serious. Not threatening.
                 The expression of someone who believes what they are saying.
  - Resigned:    The moment before he walks away. A very brief expression —
                 a decision already made, the cost acknowledged.
Portrait frame: Conclave border — dark navy with thin gold rule. Not an Academy frame.
Relationship:   Does not appear in stat panel (no dedicated relationship key).
                Tracked via flags (davo_encountered, davo_truth_known).
Asset note:     Two scenes require his portrait: S35 (seen from window — may use a
                reduced/background treatment rather than full bust) and S36 (full
                portrait, Contained + Direct + Resigned expressions needed).
                S42 is narrated by Caden — Davo does not appear in portrait there.
```

---

### Music Additions (Chapter 4)

**New location tracks:**

| Location | Track Name | Instrumentation | Mood |
|---|---|---|---|
| Intake courtyard (processing) | *Assessment Day* | Sparse piano, metronomic string pizzicato | Routine menace — efficient, wrong |
| South gate exterior | *The Outside* | Solo acoustic guitar, wind texture, open fifths | Threshold, unresolved, neither here nor there |
| Public archives seminar room | *Article Nineteen* | Two instruments only: cello and piano. No reverb. | Dry, private, significant in its understatement |
| Library annex (waiting) | *Holding* | Same base as *Quiet Archive* but slower, less resolved | Suspended time. The music doesn't progress. |

**Chapter 4 ending music variants:**

```
Ending 4a (Threshold):
  Track: *The Full Account* — strings resolving upward, warmth emerging slowly.
         Piano carries a melody that has appeared as fragments across Ch2–4.
         Here it completes for the first time. Major key. Not triumphant — earned.

Ending 4b (Exposure):
  Track: *Can't Stop Now* — momentum track. Builds across 90s from sparse to full.
         Uses Lira's violin harmonic signature woven into a larger texture.
         Feels like something that was coiled finally uncoiling.

Ending 4c (Architect):
  Track: *The Hum* — minimal. A sustained low note (the focusing anchor's
         implied frequency) under sparse piano. Unresolved. Comfortable in
         a way that should make the player slightly uneasy.

Ending 4d (Catalyst):
  Track: *Moving* — short (60s), direct, no fade-out. Ends on a single
         piano note, held, then silence. The chapter is over. Chapter 5 begins.
```

---

### Sound Effect Additions (Chapter 4)

**NPC signature cues (2s, on portrait entrance):**

```
  The Archivist:  Paper settling on a hard surface. Precise. Final.
  Davo Miral:     Echo of Caden's ember snap — same family, different timbre.
                  Lower pitch, less reactive. Fading ember rather than snap.
```

**New UI / scene sound events:**

```
  governance_session_starts:  Distant formal bell, once. Interior echo.
  governance_holding_message: Single soft notification chime — muted, cautious.
  governance_session_ends:    Brief silence, then the indicator tone goes quiet.
  archivist_folder_opens:     Leather creak + paper rustle. Deliberate. Not quick.
```

---

### Ending Card Palette Additions (Chapter 4)

The existing ending card spec (§4e) uses "ending-specific accent color" for the background gradient. Chapter 4 ending variants:

```json
{
  "ending_4a_threshold": {
    "gradient_from":   "#0D0F1A",
    "gradient_to":     "#1A2A1A",
    "accent":          "#C9A84C",
    "title":           "The Threshold",
    "flavour_line":    "Everything that was true is still true. There is just more of it now."
  },
  "ending_4b_exposure": {
    "gradient_from":   "#0D0F1A",
    "gradient_to":     "#1A0A2A",
    "accent":          "#A855F7",
    "title":           "Exposure",
    "flavour_line":    "We can't stop it now even if we wanted to."
  },
  "ending_4c_architect": {
    "gradient_from":   "#0D0F1A",
    "gradient_to":     "#0A1A2A",
    "accent":          "#4A5A8C",
    "title":           "The Architect",
    "flavour_line":    "The hum has not stopped. You are not entirely certain the feeling is yours."
  },
  "ending_4d_catalyst": {
    "gradient_from":   "#0D0F1A",
    "gradient_to":     "#1A1200",
    "accent":          "#C9A84C",
    "title":           "Catalyst",
    "flavour_line":    "You are moving."
  }
}
```

---

*Chapter 4 art direction appended. New assets required: CHAR_06 (4 expressions), CHAR_07 (4 expressions, 2 scene contexts), BG_10–BG_13 (4 backgrounds + dialogue-mode variants), 4 music tracks, 6 SFX.*

*Last updated: 2026-04-06*
