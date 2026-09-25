# The Ascent: desktop design

Status: design only. Nothing here is built or tested. Sizes are arithmetic from design canvases, the live code and the screenshots listed in section 0. Every number is a target for the builders, not a measurement.

This is one design. It starts from the "panel-and-stage" proposal, adds the best ideas from "workbench" and "panorama", and fixes the problems a judging pass found in all three (listed in section 12).

---

## 0. What the game looks like on a laptop today

Screenshots of every step at 390x660 are in `/tmp/dd/*.png`. S01, S02, S05, S06 and S11 at 1440x900, and S02 at 1280x720, are in `/tmp/dd/wide-*.png`.

- **A phone column in a grey room.** `Game.tsx` caps the game at `max-w-[480px]`, which leaves 480px of flat `#E9E6E0` on each side at 1440 wide. Two thirds of the screen is empty.
- **Phone sizes on a laptop.** Gear tiles 64px, S02 zone art about 34px, 12px Archivo labels, bricks about 48px across, a 300px storm card. Sources sit under targets, so every drag is a vertical throw of about 400px.
- **The metaphor is the question.** The one line at the top is the game's line ("Kit out the next Analyst.", "Five pitches. Who climbs each one, and how?", "Today's A2A route, as the next climber finds it."). The helper explains the gesture, not the question. The business question has to be decoded from the art. This is Adam's "some questions take a minute to understand".
- **Scales show one anchor at a time.** S10 shows only the current stone's label. S05's meaning hides behind a small `i`. S06 zone names ("Base-camp crew") are pure metaphor.
- **Nothing tells a mouse user what to do.** No hover states, no visible shortcuts. The keyboard paths in `useDrag`, `RouteSlider` and `SwipeStack` exist but are hidden. A trackpad back-swipe leaves the game.

What the code already gives us (checked in the source on this branch):

- `useDrag`, `RouteSlider` and `SwipeStack` are pointer-event based, with a 6px drag threshold, tap-then-tap, and a keyboard path (Tab, Space, arrows, Enter, Esc). Mouse drag already works.
- S01, S03, S05, S06, S10 and S11 fit-scale with a `ResizeObserver`. S04 (`W=390,H=400`) and S08 (`W=340,H=262`) scale through container units (`containerType: 'size'`, `S04.tsx:124`, `S08.tsx:101`), so they grow in a bigger box with no new constants.
- Fixed phone geometry remains in S07 (`CARD_W=300`), S09 (`CW=230, CH=262`), S10 B (`TW=290`), S06 (`TRAY_H=100` under the zones), F4 (`PW=260`) and F5 (`ROPE_H` sized for a 350px rope).
- Board screens write to the store on every move (`setMany` on drop), and S03 and S10 B write typed text on every change. A layout switch that remounts a view loses nothing.
- 3D art: every `public/game/3d/*.webp` is at most 512px on its long side (signpost 449x478, card-certify 424x494, rope-clips 512x270, fu-plaque 481x344). That is sharp to about 256 CSS px on a 2x screen. `scene-basecamp.webp` is portrait, 1170x1980.
- The SVG scenes in `art/scenes.tsx` draw at 390x660 with 300 units of bleed each side (990x660 usable, 1.5:1). With `xMidYMax slice` they cover a stage of about 1000x740 without new drawing.
- No desktop work exists on any branch or worktree (`git log --all` has one unrelated "desk scenes" art commit).

**Real viewports.** "1440x900" is a screen, not a viewport. With browser chrome a 1440x900 laptop gives about **1440x790**, and a 1280x720 or 1366x768 laptop about **1280x600**. Every budget below is checked at 1280x600, 1440x790 and 1920x950, and the QA runs at the nominal sizes as well.

---

## 1. Principles

1. **The question is always stated in plain business words, in the same place.** A persistent left panel carries the plain question, one line on how to answer, and (small, optional) why we ask. The climbing metaphor stays as the world and the art on the right, and the game's own line becomes a caption in that world. It never replaces the plain question.
2. **Sources left, targets right.** Every board is laid out so the mouse moves left to right, in reading order: panel, then items, then destinations.
3. **Same mechanics, same answers, same stimulus where it matters.** No change to `store.ts` answer keys, `rules.ts`, `types.ts` `Answers`, the seeded orders, or the follow-up rules. Research safeguards are kept on purpose (section 9).
4. **One copy source.** The plain question, how-to-answer and why live in `spec.json` and render on both mobile and desktop, so a copy edit changes both channels.
5. **A responsive layer, not a rewrite.** Shell first: every existing screen renders fit-scaled inside the new frame on day one. Stages are then improved one at a time.

---

## 2. Breakpoints and the layout switch

A new `useLayout()` hook (`src/game/layout.ts`) returns `'phone' | 'desk' | 'deskCompact'`, provided through a `LayoutContext` inside `Game`.

| Mode | Rule (viewport, CSS px) | Typical devices |
|---|---|---|
| `desk` | width ≥ 1360 and height ≥ 700 and width/height ≥ 1.3 | 1440x900, 1536x864, 1680x1050, 1920x1080 laptops and monitors; iPad Pro landscape |
| `deskCompact` | not `desk`, width ≥ 1024, height ≥ 560, width/height ≥ 1.3 | 1280x720, 1366x768, 1440x900 at 125% zoom, iPad landscape |
| `phone` | everything else | phones, portrait tablets, narrow or short windows. Today's 480px column, unchanged |

- `?layout=phone|desk|deskCompact` overrides the rule (works with the dev jump and `/preview`), so reviewers can see either layout on any machine.
- **When it switches.** The measured mode updates on resize, but the committed mode changes only (a) on a step change, or (b) after the size has been stable for 400ms **and** nothing is lifted **and** no drag or slider gesture is in progress. A switch never happens mid-drag, so a drop is never lost. A switch remounts the step's view; answers survive because every screen already writes on every move.
- **Hover affordances** (lift on hover, `grab` cursor, keycaps in how-lines) apply only under `(hover: hover) and (pointer: fine)`. On a landscape iPad the desk layout shows with touch behaviour and no keycaps.
- **Channel is logged, not stored as an answer.** `log('layout', { mode, w, h, pointer, dpr })` fires at `begin()` and on each committed switch. `store.response()` adds `meta.channel` and `meta.viewport`. Neither goes into `answers`.

---

## 3. The shared desktop frame

### 3.1 Wireframe (1440x900 screen, 1440x790 viewport; columns are fluid)

```
0                     432                                                          1440
+--------------------------------------------------------------------------------------+ 0
| THE ASCENT · A2A                                           [?] Keys    [M] Sound      | 48 top bar
+----------------------+---------------------------------------------------------------+ 48
| CAMP II · WHO DOES   |  Five pitches. Who climbs each one?   <- stage caption:       |
| THE WORK   (kicker)  |     the spec prompt, Source Serif italic 20, muted, halo     | 104
|                      |                                                               |
| For five everyday    |  +---------------------------------------------------------+  |
| tasks, who should do |  |                                                         |  |
| the work: the Analyst|  |     THE STAGE: camp scene full bleed behind,            |  |
| alone, with AI, AI   |  |     the mechanic laid out for landscape                 |  |
| drafting, or someone |  |     SOURCES LEFT  ->  TARGETS RIGHT                     |  |
| else?                |  |                                                         |  |
|  (Source Serif 600   |  |     design canvas per screen, fit-scaled                |  |
|   30/38, <= 4 lines) |  |     k = clamp(0.72, min(aw/dw, ah/dh), 1.25)            |  |
|                      |  |                                                         |  |
| HOW TO ANSWER        |  |                                                         |  |
| Drag each task into a|  |                                                         |  |
| box. [1]-[4] sends   |  |                                                         |  |
| the one you're on.   |  |                                                         |  |
|                      |  +---------------------------------------------------------+  |
| (o) On their own 1/2 |                                                               |
| (o) With AI help 1/- |  camp-walk trail (S02, S04 B, S06 only), 1000 x 88:            |
| (o) AI drafts    0/- |   o_/ . . . . . . . . . . . . . . . . . . . /\  Camp III       |
| (o) Someone else 1/- |                                                               |
| 3 of 5 placed        |                                                               |
| Holding: Meeting     |                                                               |
|  brief               |                                                               |
|                      |                                                               |
| WHY WE ASK           |                                                               |
| Which tasks stay     |                                                               |
| human-led even when  |                                                               |
| AI could do them.    |                                                               |
|                      |                                                               |
|  /\----/\---/\--/\--^|  camp route: five labelled tents, rookie at this camp        |
| Base  I   II  III Sum|  (360 x 88)                                                   |
| [Back] [ Walk on  ↵ ]|  action row 56                                                 |
+----------------------+---------------------------------------------------------------+ 790
  panel clamp(340px, 30vw, 480px)     stage: the rest (1008 x 742 at 1440x790)
```

### 3.2 Frame regions

| Region | `desk` (1440x790) | `deskCompact` (1280x600) | 1920x950 | Notes |
|---|---|---|---|---|
| Top bar | 48px. Left: "THE ASCENT · A2A", Archivo 12/600, tracking .14em. Right: `?` Keys, Sound (M) | 44px | 48px | Back lives in the panel's action row. Preview mode shows its "Preview · answers optional" pill here |
| Panel | `clamp(380px, 30vw, 480px)` = 432; padding 40; paper `#F8F7F4`; 1px `rule-soft` right edge | 340; padding 28 | 480 | Always plain paper, never the camp tint: the question is always clean ink on white |
| Stage | the rest: 1008x742 | 940x556 | 1440x902 | Camp scene full bleed (`Art id={scene}`, `xMidYMax slice`) on `paperFor(camp)` |
| Stage caption | top-left, 32px inset, Source Serif 4 italic 20/28, muted, paper halo | hidden when viewport height < 680 | 22/30 | The spec `prompt`: the world line, no longer the question |
| Stage body | per-screen design canvas (section 5), `k = clamp(0.72, min(availW/dw, availH/dh), 1.25)`, centred | same formula | k capped at 1.25 | 1.25 cap because the 3D art is 512px. Extra height goes to the scene above and below the canvas (the "elastic" scene), never to page scroll |
| Camp-walk trail | S02, S04 B, S06: 1000x88 at the stage foot | 72 tall | 88 | Section 3.6 |

Height budget of the panel at 1280x600 (the tightest case): top bar 44 + padding 56 + kicker 24 + question 4x33 = 132 + gap 16 + how 3x22 = 66 + gap 16 + checklist up to 5x20 = 100 + why toggle 20 + action row 52 = 526, under 556. The camp route is hidden in `deskCompact`. The question and how-line are never clipped: the why line collapses first, then the checklist collapses to its summary line ("3 of 5 placed").

### 3.3 The question panel (`QuestionPanel`)

Top to bottom:

1. **Kicker.** Archivo 12 caps, tracking .14em, bronze: `CAMP II · WHO DOES THE WORK`. The camp name plus a plain title (not the metaphor title). Self-questions (S04 B, S08) add a bronze `ABOUT YOU` pill and a 3px bronze left rule on the panel, carrying the mobile "bronze = you" code into words. Follow-ups show `FOLLOW-UP · CAMP I`.
2. **Question** (`h1`, `data-prompt`, `tabIndex=-1`). Source Serif 4, 600, 30/38 ink (`deskCompact` 26/33), at most 4 lines. This is the plain business question. It keeps the existing behaviour: it gets focus on every step change, so screen readers announce it.
3. **How to answer.** An Archivo 11 caps label, then Archivo 16/24 `ink-2` (15/22 compact), 1 to 3 lines: the gesture in plain words, then the keys as inline `<KeyCap>`s. Keycaps hide under `(hover: none)`.
4. **Live status** (only on screens with capacities or holds). Archivo 14/20 rows: a colour dot, the target's plain name, `have/need`. Then a summary line ("5 of 8 slots filled"). When an item is lifted, focused or hovered, one more line: **"Holding: Paper map · LLM chat"** and, on S05, its one-line description. A refused drop flashes its row and says why ("Do more of this is full: drop on a slot to swap").
5. **Why we ask** (optional). An Archivo 11 caps label, then Source Serif 4 italic 15/22, muted, at most 3 lines. In `deskCompact` it collapses to a "Why we ask" toggle. Rule: it says what the answer is used for and never argues for an option (neutrality check in section 9).
6. **Camp route** (`desk` only). A 360x88 mini ridge: five labelled tents (Archivo 10 caps), the forest rookie at the current camp, an ink bootprint line behind. When the respondent finishes a camp walk, the mini rookie steps to the next tent (600ms), echoing their own walk. It never moves on its own.
7. **Action row.** 56px: `Back` (quiet, 112 wide) and the primary (ink fill, fills the rest) with an `↵` keycap. The primary is **always present**: disabled-looking (`disabled-bg`) until valid, with the reason on hover and in the status line ("Place 2 more"). On desktop a button that appears from nowhere reads as a bug. The label comes from the screen as today: Start the climb, Continue, Start walking, Walk on, Leave it blank (quiet), Carve it, Tie it on.

The panel crossfades (200ms) on every step change. On S11 after arrival it holds the "Their kit" card through a `panelSlot` prop on `Frame`.

### 3.4 The stage and the world

- The camp scene fills the stage behind the mechanic. The SVG scenes' existing bleed covers the stage; S01 needs a landscape base-camp render (section 10).
- **Camp change on desktop** is a **diagonal pan inside the stage**: the old camp slides down-left and the new one comes from the top-right (600ms, the existing `PAN` easing), so the move reads as "across and up the mountain". The panel does not move; it crossfades. Reduced motion: crossfade. Within a camp, the existing short crossfade.
- **The route ahead** (grafted from panorama). From S05 on, the stage caption area carries a thin pencil route toward the next camp whose precision follows `routePrecision(kit.lane)`, the same value S05's route strip uses. It sharpens as Day-one bricks go on and stays that way to S11. It is drawn only; it stores nothing.
- **Phase 3, optional:** a continuous `scene-panorama` (one five-camp SVG built with `buildTerrain`) that the stage pans along between camps. Not needed for launch.

### 3.5 Follow-ups on desktop (`Sheet` desk variant)

- **Panel:** crossfades to the follow-up: kicker `FOLLOW-UP · <CAMP>`, the forest rookie at 40px beside the kicker ("about the next Analyst"), then question, how and why. **No context echo** of the triggering answer (section 9.3). Back in the action row, Esc, or browser Back returns to the parent (the existing `ctx.back`).
- **Stage:** the parent stays visible and inert under the existing 22% ink scrim. A **follow-up card** rises from the stage foot in 280ms: width = stage width minus 64 (944 at 1440, capped at 960), height auto up to 62% of the stage, paper, 1px rule top edge, a 2px bronze top rule, the existing shadow. The card holds only the mechanic.
- **Finishing:** one-pick sheets keep `auto` (finish 500ms after a pick) and also show the panel primary (`Continue ↵`) for keyboard users. `showDone` behaviour is unchanged. Number keys pick.
- Focus is trapped in the panel and card while the sheet is open.

### 3.6 The walk between camps (the climber visibly moves)

- On S02, S04 Beat B and S06 the stage foot carries the **desk camp-walk trail**: 1000x88 (72 in compact), a 600px pencil path to the next camp's tent, the rookie at 56px, bootprints inking in behind. It is `CampWalk`'s `RouteSlider` with a longer path (new optional `d`/`viewBox` props).
- The trail has **no button of its own**: the panel primary reads `Walk on ↵`, and pressing it (or Enter) calls `CampWalk`'s imperative `walkOn()`, which walks the rookie up over 600ms. Dragging the rookie along the trail does the same. One primary per screen.
- Only the respondent's input moves the climber (design rule kept). The walk stores nothing, as today. Order is unchanged from mobile: the walk, then any follow-up sheet (F1 after S02, F2 after S04 B).
- At the top: the mini rookie in the panel's camp route steps to the next tent, and the stage pans diagonally to the next camp.

### 3.7 Mouse and keyboard, frame-wide

**Mouse**
- Items: `cursor: grab`; on hover they rise 2px with a soft shadow and show a tooltip with the full label and "Press 1–4". While dragging, `cursor: grabbing` and valid targets outline in their zone colour (existing `data-valid` / `data-over`). An invalid drop springs back with the existing shake.
- Click-then-click (the existing tap-then-tap) still works, so nobody has to drag.
- Placed items show their full name on hover.

**Keys** (a new `useHotkeys`, off while a text field has focus, while `ctx.busy`, and inside a sheet except for the sheet's own keys):

| Key | Action |
|---|---|
| `Enter` | The panel primary, when valid and nothing is lifted. In S03 and S10 B fields, Enter also continues |
| `1`–`9` | Send the focused, hovered or lifted item to target n (every target shows a number badge). On pick screens and sheets, choose option n |
| `Tab` / `Shift+Tab` | Items, then targets, then the action row. Focus ring 2px navy, 2px offset |
| `Space` | Lift or drop (existing `useDrag` path) |
| Arrows | Sliders (S04, S08, F1, S11), swipe decisions (S07, S09 B), zone cycling while lifted (existing) |
| `Delete` / `Backspace` | Return the focused placed item to the tray. On S10 A, lift the top stone |
| `Esc` | Cancel a lift; close a peek; close a sheet when nothing is lifted |
| `P` (S04 A), `N` (S04 B) | When proven / Not yet |
| `I` (S05) | Read the focused brick (existing peek) |
| `?` | Shortcut overlay (`ShortcutsOverlay`) |
| `M` | Sound on/off |
| Browser Back, `Alt+←`, two-finger swipe | **Handled.** Each step pushes a history entry; `popstate` calls `ctx.back()`. At S01 A (nothing to go back to) the browser leaves normally. Applies to both channels |

Event order: `useDrag`, `RouteSlider` and `SwipeStack` `preventDefault()` every key they consume; `useHotkeys` listens on `window` in the bubble phase and ignores `defaultPrevented` events. So Enter drops a lifted item and never also presses Continue.

**One `useDrag` addition:** `hotkeys?: Record<string, ZoneId>` and an imperative `drop(zone)` that drops the lifted or focused item through **the same path as a keyboard Enter**, so capacity checks, swaps, refusals, the Blue copy rule and the logged `via: 'key'` all behave identically. `Delete` goes through the existing return-to-tray path.

### 3.8 Look

- Paper `#F8F7F4`, ink `#0D0C0B` (text and primary button), navy `#14233B` (focus rings, S05 bricks), bronze `#7A3E12` (kickers, "about you", brass details), forest `#1F4B3A` (the rookie). Zone vote colours unchanged. No new colour tokens.
- Source Serif 4 for questions, card titles and typed text; Archivo for all UI, labels, keycaps and buttons. **No Bodoni anywhere on desktop**, including the S11 closing line.
- `KeyCap`: Archivo 12, 22px tall, 1px `#DDD9D2` border, radius 3, paper fill.

---

## 4. The copy model: one source for both channels

Each step and beat in `spec.json` gains an `ask` block next to the existing `prompt`/`helper`:

```jsonc
"ask": {
  "kicker": "Who does the work",             // plain title for the kicker (camp name is added)
  "question": "For five everyday tasks, who should do the work?",   // <= 90 chars
  "how": "Drag each task into a box. On their own takes two at most.", // <= 110 chars, gesture-neutral
  "keys": "[1]-[4] sends the task you're on.", // pointer:fine only; rendered as KeyCaps
  "why": "Which tasks stay human-led even when AI could do them."        // optional, <= 90 chars
}
```

and items and zones may carry a `plain` label (S02 zone glosses, S06 zone categories; S05 already has `sub` and `peek`).

- `content.ts` gains `ask(id, beat, variant)`, returning the block with `{stop}` / `{leadTrait}` filled like the prompt today.
- **Rendering on desktop:** kicker, question, how + keys, why, as in 3.3. The spec `prompt` becomes the stage caption.
- **Rendering on phone (recommended, behind `frame.plainAsk: true` in the spec):** the `h1` shows `ask.question` (Source Serif 600 at 22/28 when longer than 60 characters), the helper line shows `ask.how`, and the metaphor `prompt` moves to a small italic caption in the scene. `why` and `keys` stay desktop-only. This makes the question stimulus identical across channels and applies Adam's fix on mobile too. It needs a phone height re-check (the question can take one line more than today's prompt). If Haresh keeps `plainAsk: false`, the phone is unchanged and channel is a covariate (section 9).
- **F5 has no `ask.question`.** Its panel question is the variant wording verbatim (`promptVariants.A/B`); no plain rewrite goes on top, so the A/B manipulation is not diluted.
- Copy limits: the panel is at most about 60 words. Every string is a first draft for Haresh and Adam to edit; all of them are listed per screen in section 5 and 6.

---

## 5. Screen by screen

Sizes are design-canvas CSS px at k = 1. At 1440x790 k is about 1.0; at 1280x600 about 0.8; at 1920x950 it caps at 1.25.

Each screen lists: panel copy (Q question, H how, K keys, W why), stage, interaction, why it is clearer, and build.

### S01 A · Base camp · Trailhead (no answer)

- **Panel.** Kicker `J.P. MORGAN PRIVATE BANK · A2A`.
  - Q: "You made the climb from Analyst to Associate. Help shape it for the ones coming after you."
  - H: "Nine short screens, about six minutes. Drag with the mouse, or use the keys shown on each screen."
  - **What you'll do** (grafted from panorama; Archivo 14/20, four lines): sort the first-years activities · set the pace to Advisor · decide when AI tools go on · make four policy calls and a few about you.
  - W: none. **Privacy line:** mobile removed its footnote in #7 (fa758d3). Desktop matches mobile: no privacy line, unless People Analytics signs off a line for both channels (decision 3 in section 13).
  - Primary `Start the climb ↵`.
- **Stage.** The landscape base-camp render at full bleed (`scene-basecamp-wide`, section 10), the route up the whole mountain visible with the four upper camps faintly labelled. The rookie (Figure, 200px) at the trailhead beside the open rucksack (3D, 160px). The covered kit still lifts a hair on click. Until the new render exists, the portrait render is shown `xMidYMax slice` (lower half), which works but crops the route.
- **Clearer because** the respondent knows what the questions are about, and how long they take, before meeting the metaphor.
- **Build.** `S01` desk layout (anchor positions from the new render). `begin()` unchanged.

### S01 B · Business and class (fallback only)

- **Panel.** Q: "Which business are you in, and which A2A class were you in?" H: "Choose one in each row." K: arrows move within a row. W: "Used only to group answers. Groups under ten are never reported." (This matches the existing mobile helper, so it adds no new claim.)
- **Stage.** A centred paper card 680x320: `BUSINESS` row of four chips 150x56 (USPB, IPB, Solutions, Other), `CLASS OF` row of four chips 140x56. Base camp behind.
- **Interaction.** Each row is a native `radiogroup`. Status: "Business ✓ · Class —".
- **Build.** Same `Chips`/segment component; a CSS size variant.

### S02 · Base camp · Kit them out (pack, 12 items into 3/1/2/2)

```
stage body, design canvas 936 x 580
+-- ACTIVITIES 520 x 540 --------------+   +-- BOXES 392 wide -------------------------+
| [104][104][104][104]                 |   | [1] (o) Do more of this           2/3      |
| Sit in   Present  Portfol  Prospect  |   |     More time on it, earlier               |
| [104][104][104][104]                 |   |     [rucksack 88] [chip][chip][chip]       |
|  ...                                 |   | [2] (o) Speeds them up most       0/1      |
| [104][104][104][104]                 |   |     Can repeat one from box 1              |
|  cells 120 x 170, gaps 13            |   |     [hand 88] [chip]                       |
|  tray never reflows (ghosts)         |   | [3] (o) Take off their plate      2/2      |
|                                      |   |     Less of it, or none                    |
|                                      |   | [4] (o) Keep, but change how      1/2      |
+--------------------------------------+   |     Same activity, done differently        |
                                           +--------------------------------------------+
camp-walk trail at the stage foot
```

- **Panel.** Kicker `BASE CAMP · THE FIRST YEARS`.
  - Q: "Which parts of an Analyst's first years should change?"
  - H: "Drag each activity into a box until every slot is full: 3, 1, 2 and 2. 'Speeds them up most' can repeat one from 'Do more of this'."
  - K: "[1]–[4] sends the activity you're on. [Del] takes one back."
  - W: "Tells the working group what to add, cut and redesign in the first years."
  - Status: the four zones with `have/need`, then "5 of 8 slots filled", then "Holding: …".
  - Primary `Walk on ↵` (disabled until 8/8).
- **Stage.** Tray left: 4x3 cells of 120x170, 3D art at 104px (was 64), labels Archivo 14/17 on up to two lines. Boxes right: four rows of 392x132, each with a number badge, colour dot, zone name (Archivo 16/600), the plain gloss (Source Serif 14, muted, from `zones[].plain`), the zone's 3D art at 88px and its slots. **Placed items are labelled chips** (grafted from panorama): 96x44, 3D art at 32px plus an Archivo 12 label on up to two lines, so the board reads by words as well as pictures. Zone art keeps its full-state renders (`rucksack-zipped`, `hand-zone-closed`, `tarp-out-folded`, `bench-rerig-spliced`).
- **Interaction.** Drag, click-then-click, or `1`–`4`. A drop on a full box still shakes and the status row flashes. A drop on an occupied slot swaps (unchanged).
- **Clearer because** the 3/1/2/2 rule and the Blue copy rule are written once and counted live, the boxes say what they mean, every placed item keeps its words, and the drag is a short left-to-right move.
- **Build.** Extract the board rules into `useS02Board(p)` (shared by both views); new `S02Desk` view; `useDrag` `hotkeys: {1:'rucksack', 2:'hand', 3:'out', 4:'rerig'}`. `ZoneBox`, `Slot`, `TileIcon`, `Ghost`, the FLIP spring and swap rules are reused. F1 still fires after the walk.

### S03 · Camp I · The signpost (text, 60 characters, optional)

- **Panel.** Q: "Finish the sentence: no Analyst should become an Advisor without having…" H: "Type one experience, up to 60 characters. Leave it blank if nothing comes to mind." K: "[Enter] to continue." W: "The one thing the programme must guarantee, in your words." Status: "0/60". Primary `Leave it blank` (quiet), then `Carve it ↵` once text exists.
- **Stage.** The existing S03 view hosted in the bigger stage (it already fit-scales from one coordinate box): the signpost at about 300px tall, left of centre; the stem "No one reaches the top without having…" in Source Serif 26 on the paper above; the field on the arm, **autofocused** (no on-screen keyboard to cover it), with a visible 1px underline so it reads as an input. Typed words carve onto the arm in bronze as today.
- **Build.** Hosted as-is; the field gets a desk style and autofocus. `signpost` needs a 1024px re-render. Stores the same `rule.*` fields.

### S04 A · Camp I · The climb (drag-slider, 12 to 48 months or 'When proven')

- **Panel.** Kicker `CAMP I · THE PACE`.
  - Q: "How long should it take an Analyst to be ready for the Advisor seat?"
  - H: "Drag the climber up to a camp, from 12 to 48 months. Or choose 'When proven' if skills, not time, should decide."
  - K: "[↑][↓] move, [P] When proven, [Enter] confirm."
  - W: "Could the path be shorter, and should the step up be earned on skills rather than time?"
  - Status: "Set: 24 months" or "Not set yet".
- **Stage.** The existing switchback box (`W=390, H=400`) **hosted as-is** in the bigger stage: its container-unit sizing makes it about 670x690 at 1440x790 with no new constants. Stop labels, tents, the 36-month cairn and the brass `When proven` tag keep **the same geometry and the same relative prominence** as on the phone (parity rule). To its left, a large **readout** ("24 months", Source Serif 44 with a bronze underline) updates live while dragging.
- **Clearer because** the question says what the months measure, and the chosen value is always spelled out.
- **Build.** No geometry change. New `Readout`; `P` wired to the tag's existing tap handler. Stores the same `pace.months`, `pace.reversals`.

### S04 B · And you (self-question)

- **Panel.** `ABOUT YOU` pill. Q: "And you: when did you feel ready for the Advisor role?" H: "Click the point on the track, or 'Not yet'. 'Rather not say' is fine." K: "[↑][↓], [N] Not yet." W: "Set against the pace you just chose." Primary `Walk on ↵`.
- **Stage.** The same box, drawn plain (no tents, cairn, tag or images at the stops, per the spec). The rookie waits at their stop; the bronze outline "you" stands at the trailhead. `Not yet` 180x52 and the `Rather not say` link, as today. The desk camp-walk trail at the stage foot.
- **Build.** Hosted as-is; `N` key; desk `CampWalk`. F2a / F2b follow as today.

### S05 · Camp II · The navigation kit (lego, 6 bricks into Day one / Once proven / Not for them)

```
design canvas 936 x 600
+-- TOOLS 340 wide ---------------------+   +-- PLATE 560 ------------------------------+
| [brick 112x64]  LLM chat          (i) |   |  [1] Day one   [2] Once proven  [3] Not  |
|                 Paper map             |   |  200 wide      200 wide         for them |
| [brick]         AI in your tools  (i) |   |  6 rung rows x 76 (studs)       crate    |
|                 Compass               |   |  Day-one bricks ghost into lane 2  120w  |
|  ... six cards 340 x 88, seeded order |   |                                          |
+---------------------------------------+   +------------------------------------------+
```

- **Panel.** Kicker `CAMP II · AI TOOLS`.
  - Q: "Which AI tools should an Analyst have from day one, which only once proven, and which not at all?"
  - H: "Drag each of the six tools into a column. Click (i) to read what a tool does."
  - K: "[1] Day one, [2] Once proven, [3] Not for them. [I] reads the one you're on."
  - W: "Where Analysts should form their own view before seeing AI output, and when AI access is earned."
  - Status: "4 of 6 placed", then **"Holding: LLM chat · Paper map. A general AI chat. Knows the terrain broadly, not today's."** for the lifted, focused or hovered brick (grafted from workbench), then "Nothing under it yet." when it applies.
  - Primary `Start walking ↵`.
- **Stage.** Tools left: six cards 340x88 in the seeded `kit.order`, each with the brick art at 112px, the **plain name first** (`sub`, Archivo 15/600: "LLM chat") and the world name second (Archivo 13 muted: "Paper map"), and the (i) button. Plate right: two lanes of 200 and the crate at 120, six rung rows of 76 (was 34). Placed bricks keep a 12px label. Row order stays unlabelled ("felt, not told"). The route strip moves to the stage caption area as the sharpening pencil route (3.4).
- **Peek semantics kept** (grafted from workbench). `kit.peeks` still records only explicit peeks ((i) click or `I`), so it means the same on both channels. A hover or focus that shows the description in the panel is logged as a separate `peek-hover` event, not in `kit.peeks`. The full description is not printed on every card, so reading it stays a choice, as on mobile.
- **Build.** Extract `useS05Plate(p)`; new `S05Desk` view; `hotkeys: 1–3`. Support, wobble, `kit.cut`, `kit.unsupported` and `kit.events` unchanged. `PeekButton` reused.

### S06 · Camp II · Who climbs each pitch (pack, 5 tasks into 4 zones, 'own' at most 2)

```
design canvas 936 x 640
+-- TASKS 220 ------------+   +-- WHO DOES IT: 2 x 2 cards of 340 x 300, gap 16 ----------+
| [pitch 96] Meeting brief|   | [1] The Analyst, no AI         | [2] The Analyst, AI helps |
| [pitch] Onboarding      |   |     On their own feet (ital.)  |     Walk it with kit      |
|   paperwork             |   |  [figure 3D 180] [chip][chip]  |  [figure]  [chips]        |
| [pitch] Portfolio       |   |  two at most                   |                           |
|   analysis              |   |--------------------------------+---------------------------|
| ... five cards 220 x 112|   | [3] AI drafts, Analyst checks  | [4] Someone else, or stop |
+-------------------------+   |     Kit drafts, they check     |     Base-camp crew        |
                              +-----------------------------------------------------------+
camp-walk trail at the stage foot
```

- **Panel.** Kicker `CAMP II · WHO DOES THE WORK`.
  - Q: "For five everyday tasks, who should do the work?"
  - H: "Drag each task into a box. 'The Analyst, no AI' takes two at most."
  - K: "[1]–[4] sends the task you're on."
  - W: "Which tasks stay human-led even when AI could do them, and which go elsewhere."
  - Status: the four zones, "3 of 5 placed · no AI: 1 of 2 at most".
  - Primary `Walk on ↵`.
- **Stage.** Tasks left: five cards 220x112 (pitch art 96px, Archivo 15 label). Zones right, **plain label first** (grafted from workbench): Archivo 16/600 plain category from `zones[].plain` ("The Analyst, no AI" · "The Analyst, AI helps" · "AI drafts, the Analyst checks" · "Someone else does it, or it stops"), then the metaphor name in Source Serif italic 14 muted. The 3D figure at 180px (`zone-*` re-render, section 10), placed tasks as 150x44 chips. Crouch-and-rise and the refuse-strain on a third "own" are unchanged.
- **Clearer because** the four zones are the deck's own categories (human-led, AI-assisted, AI-led with review, reassign or eliminate). This is the single biggest fix for "takes a minute to understand".
- **Build.** Extract `useS06Pitches(p)`; new `S06Desk` view (tray as a column instead of `TRAY_H` under the zones); `hotkeys: 1–4`.

### S07 · Camp III · Storm calls (swipe, 4 cards; policy / unsure / drop)

- **Panel.** Kicker `CAMP III · FOUR PROPOSALS`.
  - Q: "Four proposals for how A2A could change. Should each one become policy?"
  - H: "One card at a time: Make it policy, Unsure, or Drop it. Click a called card above to change it."
  - K: "[→] policy, [↓] unsure, [←] drop."
  - W: "Four proposals the working group is weighing. 'Unsure' is a real answer." (from the existing helper)
  - Status: "Card 2 of 4".
- **Stage** (design canvas 936x640).
  - **Ticket row** at the top: four tickets 200x72 with the card title and, once called, the ink stamp (POLICY / DROPPED / UNSURE). Click one to call it again (existing behaviour, now legible).
  - **Card** centred, 400x400: art 220px (`card-*` re-render), title Source Serif 4 600 26/30, sub-line Source Serif 17/23.
  - **Three equal buttons** under the card, 200x56 each with a keycap: `← Drop it`, `↓ Unsure`, `Make it policy →`. **No full-height side pads**: they would make Drop and Policy bigger targets than Unsure. During a drag, faint left and right halos (no labels, no size) show the swipe exits.
  - Snow thickens card by card over the scene and clears after the last, as today.
- **Parity.** One card at a time, seeded `calls.order`, three equal answer buttons. F4 still fires only after all four calls.
- **Build.** `SwipeStack` reused (`width={400} height={400}`); its `renderButton` adds keycaps. S07 desk layout (ticket row and button sizes).

### S08 · Camp III · Roped to another (self-question, 1–5 or null)

- **Panel.** `ABOUT YOU` pill. Q: "If you had been paired with a different Advisor on day one, where would you be today?" H: "Same you, same effort. Drag yourself along the ridge, or click a point. 'Rather not say' is fine." K: "[←][→] or [1]–[5]." W: "How much success depends on who you're paired with."
- **Stage.** The existing ridge box (`W=340, H=262`) **hosted as-is**; container units make it about 810x625 at 1440x790. Five stop labels (Archivo, scaled), the bronze "you" thumb, the rope running off the left edge (the other Advisor is never drawn), no pictures at the stops. A readout under the ridge shows the chosen label. `Rather not say` at the lower left.
- **Build.** Hosted as-is; `1`–`5` mapped onto the existing stops. Stores the same `self.ropeCounterfactual`, `rope.reversals`. F5 follows.

### S09 A · Camp III · Rope up (rank 3 of 8)

- **Panel.** Q: "Which three traits do great private bankers lead with? Rank your top three." H: "Drag three traits onto the rope: 1 leads, then 2, then 3." K: "[1][2][3] clips the trait you're on. [Del] unclips." W: "The traits the programme should look for and grow." Status: "Leads ✓ · Second — · Anchor —".
- **Stage** (design canvas 936x620). This one stays stacked, because the hanging rope *is* the ranking and nothing is cramped at this size: the rope 720px wide across the upper third with clips at 20/50/80%; under each clip a 160x160 slot (trait art 112px plus label, a number in Source Serif 28). The tray below: eight tiles in 4x2 at 120px (cells 140x170), centred.
- **Build.** Extract `useS09Rope(p)`; `S09Desk` view; `hotkeys: 1–3`. `rope-clips` needs a 1536px re-render (drawn 720 wide).

### S09 B · Born or built (swipe, one card)

- **Panel.** Q: "{Lead trait}: are people born with it, or is it built on the job?" H: "Click a side, drag the card, or use the arrow keys." No why line (to avoid leading).
- **Stage.** The card 360x420 (trait art 200px, Source Serif title 26). Two **equal** side targets 220x300, each with its origin glyph at 120px (`origin-seed`, `origin-bootprint`) and label, in the **seeded side order** (`traits.originSides`); the arrow-key hints follow the side. They light as the card leans.
- **Build.** `SwipeStack` reused; the same equal-target pattern as S07's buttons.

### S10 A · Camp III · Mark the route (stack 1–5)

- **Panel.** Q: "Overall, how much does today's A2A programme need to change?" H: "Stack 1 to 5 stones: 1 = rebuild it, 5 = don't touch it. Click the pile to add, the top stone to lift it." K: "[1]–[5] sets the height, [Backspace] lifts the top stone." W: "One overall read on the programme as it stands." Status: "3 stones · Re-rig parts".
- **Stage.** The cairn at centre-left (base 260, stones 56 high). Beside it a **`CairnRuler`**: all five labels at stone heights (Rebuild it · Major repairs · Re-rig parts · Minor tweaks · Don't touch it), the current level in ink, the rest muted. The loose pile and the rookie on the right.
- **Clearer because** both ends and the middle of the scale are readable before the first stone. On mobile only the current label shows; porting the ruler is decision 2 in section 13.
- **Build.** S10 desk constants plus `CairnRuler`. `useDrag.onPress` (one click = one stone) reused. Stores the same `mark`.

### S10 B · One change (text, 80 characters, optional)

- **Panel.** Q: "If you could make one change to A2A, what would it be?" H: "One line, up to 80 characters. This is also the place for anything we didn't ask." K: "[Enter] to finish." Status "0/80". Primary `Leave it blank`, then `Tie it on ↵`.
- **Stage.** The cairn stays at the left with "Your mark: Re-rig parts". The rookie on the crest with the luggage tag at 320px (`luggage-tag` re-render); the tag face is the autofocused field, Source Serif italic 22.
- **Build.** S10 B desk constants (`TW/TH`). Stores the same `oneChange.*`.

### S11 · Summit · The last pitch (payoff)

- **Panel.** Kicker `SUMMIT`. Q: "That's every question. Thank you." H: "One last pitch: drag the climber to the top." K: "[End] or [Enter] walks them up." A quiet `Skip` link. No why.
- **Stage.** The summit scene; the continuous `RouteSlider` path about 900px from bottom-left to the table at top-right, drawn at `routePrecision` from their Day-one kit. The rookie carries their packed items, the Blue item and Day-one bricks. On arrival the camera move-in scales about 1.6x (the stage is bigger than a phone), the client rises, and the closing line "They came to meet you, not the map." appears in **Source Serif 4 italic 32**.
- **Panel after arrival:** the **"Their kit"** card through `panelSlot`: In hand / Packed / Day-one kit / On their own feet, 40px 3D art per line, then "Thank you. You can close this tab." No score, no share, no confetti.
- **Build.** S11 desk path constants; kit card moved to the panel on desk. Stores the same `summit.dragMs`, `t.complete`.

---

## 6. Follow-up sheets on desktop

All use 3.5: the panel becomes the follow-up; a card (up to 944 wide) rises over the dimmed parent. Kicker `FOLLOW-UP · <CAMP>`. No context echo. Existing triggers (`rules.ts`), `auto`, `picks` and `showDone` unchanged. Number keys pick.

| Sheet | Panel question (draft) · how | Card layout (design width 880) | Keys |
|---|---|---|---|
| **F1** classroom (after S02) | "Classroom attendance runs low. Should classroom training be mandatory?" · "Drag the door, or click an answer." | Left 300: the door 3D at 240px (`fu-door*` re-render) on its existing arc `RouteSlider`. Right: three option rows 440x76, each with a number badge and door-state glyph: Shut · Mandatory, no exceptions / Ajar · Mandatory, client first / Open · Optional, on demand | `1`–`3`, `←` `→` |
| **F2a** ready for what (after S04 B) | "Ready at {stop}. What should they be trusted to take on first?" · "Drag the climber onto one, or click it." | The rookie at 96px on a start ledge at the left; five ledges 144x64 in **one level row** (level, so no order is implied), seeded as today | `1`–`5` |
| **F2b** can't rush | "Held to {stop}. What can't be rushed for them?" · "Choose one." | Four tag chips 200x88 in one row (existing `TagChip`) | `1`–`4` |
| **F3a** (after S05) | "If Analysts get an agent team on day one, what must they master first?" · "Choose one." | As F2b; the card header shows the `brick-brief` art at 96px | `1`–`4` |
| **F3b** | "What should earn an Analyst the agent team?" · "Choose one." | As F2b | `1`–`4` |
| **F3c** | "Why keep agent teams away from Analysts?" · "Choose one." | As F2b | `1`–`4` |
| **F4** certify (after S07) | "If certification is policy, how should Analysts earn the pass?" · "Drag one onto the plaque, or click it." | The plaque 3D at 280px centred top (`fu-plaque` re-render); five nameplates 260x64 in a 3+2 grid, seeded order as today | `1`–`5` |
| **F5** guarantee (after S08) | **The variant wording verbatim**: A "Then guarantee every climber one thing." / B "Your rope held. Guarantee that for everyone: one thing." · "Clip one onto the rope." | The rope 720px with one clip and a 300x80 slot; six chips 3x2 at 280x64 | `1`–`6` |

The F2, F3 and F4 questions name only what their mobile prompts already name ({stop}, agents on day one, certification). They add no echo of the respondent's answer (section 9.3).

---

## 7. Component plan

| Status | Component / module |
|---|---|
| **Reused as-is** | `store.ts` answer model, `rules.ts`, `types.ts` `Answers`, `demo.ts`, the dev jump, `feel.ts`, `Figure`, `Art` and sprites, `Chips` (`TagChip`, `PlateChip`, `NameTip`), `GroundBand`, the SVG scenes, `RouteSlider` (S04, S08, F1, S11, walk), `SwipeStack` logic, the S03, S04 and S08 views (hosted bigger) |
| **Small additive change** | `useDrag`: `hotkeys`, imperative `drop(zone)`, a hover state under `pointer: fine`, `preventDefault` on consumed keys. `SwipeStack`: keycaps in `renderButton`. `CampWalk`: optional `d`/`viewBox`, imperative `walkOn()`, `hideButton`. `Game.tsx`: `LayoutProvider`, no `max-w-[480px]` on desk, history push and `popstate`, `log('layout')`, diagonal pan on desk. `context.ts`: `layout`. `content.ts`: `ask()`. `spec.json` / `types.ts`: `ask` block, `plain` labels, `frame.plainAsk`. `store.response()`: `meta.channel`, `meta.viewport` |
| **Desk layout variant** (same props and logic, `const G = layout === 'phone' ? PHONE : DESK`) | `Frame` (panel + stage; new props `status`, `panelSlot`, `hotkeysHint`), `Sheet` (panel takeover + follow-up card), S01, S07, S09 B, S10, S11, F1, F2a, F2b, F3a–c, F4, F5 |
| **New desk view over a shared hook** | S02 (`useS02Board` + `S02Desk`), S05 (`useS05Plate` + `S05Desk`), S06 (`useS06Pitches` + `S06Desk`), S09 A (`useS09Rope` + `S09Desk`). Extracting the hook is the only refactor; it keeps the drop rules in one place |
| **New** | `layout.ts` (`useLayout`, `LayoutContext`, `?layout=`), `QuestionPanel`, `Checklist`, `CampRoute`, `KeyCap`, `ShortcutsOverlay`, `useHotkeys`, `useFitScale(dw, dh)` (generalises the ResizeObserver k-scale in S05, S06, S10, S11), `Readout` (S04, S08), `CairnRuler` (S10 A), `FollowUpCard`, `RouteAhead` (stage pencil route) |

---

## 8. Build plan: four parallel builders

### 8.1 Day 0: contracts (Builder 1, one small PR, merged before the others start)

- `src/game/layout.ts`: `type Layout = 'phone' | 'desk' | 'deskCompact'`, `useLayout()`, `LayoutContext` (returns `'phone'` until the shell lands).
- `types.ts`: the `AskSpec` type, `plain?` on items and zones, `frame.plainAsk`.
- `content.ts`: `ask(id, beat, variant)` (returns the block or a fallback built from prompt/helper).
- `Frame` prop types: `status?: StatusRow[]`, `panelSlot?: ReactNode`, `hotkeysHint?: ReactNode` (ignored on phone).
- `useDrag` option type `hotkeys?: Record<string, string>` and the `drop(zone)` signature (a no-op stub until Builder 2 fills it).
- `KeyCap` component (tiny, needed by everyone).

### 8.2 File ownership (no file has two owners)

| Builder | Owns (writes) | Delivers |
|---|---|---|
| **1 · Shell and copy** | `layout.ts`, `Game.tsx`, `context.ts`, `Frame.tsx`, `Sheet.tsx`, `CampWalk.tsx`, `content.ts`, `types.ts`, `spec.json`, `store.ts` (response meta only), new `QuestionPanel.tsx`, `Checklist.tsx`, `CampRoute.tsx`, `KeyCap.tsx`, `ShortcutsOverlay.tsx`, `useHotkeys.ts`, `useFitScale.ts`, `RouteAhead.tsx`, `store.test.ts` additions | The desk frame with every existing screen fit-scaled inside it; all `ask` copy in the spec; `plainAsk` on phone; history and `popstate`; layout logging; diagonal pan; desk walk trail |
| **2 · Board screens** | `useDrag.ts`, `screens/S02.tsx`, `S05.tsx`, `S06.tsx`, `S09.tsx`, new `screens/boards/useS02Board.ts`, `useS05Plate.ts`, `useS06Pitches.ts`, `useS09Rope.ts`, `S02Desk.tsx`, `S05Desk.tsx`, `S06Desk.tsx`, `S09Desk.tsx`, `board.test.ts` | `hotkeys`, `drop(zone)`, hover; the four board desk views (S09 B included in `S09.tsx`); `peek-hover` logging |
| **3 · Scene, slider and swipe screens** | `screens/S01.tsx`, `S03.tsx`, `S04.tsx`, `S07.tsx`, `S08.tsx`, `S10.tsx`, `S11.tsx`, `SwipeStack.tsx`, `RouteSlider.tsx` (key props only), new `Readout.tsx`, `CairnRuler.tsx` | S01 desk (with the "What you'll do" list), S03 autofocus field, S04/S08 hosted with Readout and keys, S07 tickets and equal buttons, S10 ruler, S11 path and kit card |
| **4 · Sheets, art and QA** | `sheets/F1.tsx`–`F5.tsx`, `sheets/index.ts`, `Chips.tsx`, `art/sprites.ts`, `public/game/3d/*` (re-renders from the `ascent-3d` studio), `e2e/game-shot.mjs`, `e2e/game-walk.mjs`, new `e2e/game-parity.mjs`, `e2e/game-desk-keys.mjs` | Desk layouts for F1–F5; the re-renders in section 10; every test in section 11 |

Builders 2–4 build against the Day-0 contracts and render inside the old `Frame` until Builder 1's shell lands; nothing blocks on the shell except the final visual pass. Merge order: contracts → shell → boards → scenes → sheets and art → QA gate.

---

## 9. Keeping the analysis identical

### 9.1 Held constant

- Answer keys, values and validation (`VALID`), `rules.ts` triggers, follow-up timing (F1 after all eight placements and the walk, F4 after all four calls).
- Seeded orders: `tray.order`, `kit.order`, `pitch.order`, `calls.order`, `traits.order`, `traits.originSides`, F2a and F4 option orders.
- S04 and S08: same stops, same geometry, same relative prominence of the `When proven` tag (hosted as-is, not redrawn). No pictures at self-question stops.
- S07 and S09 B: one card at a time; three equal buttons on S07; two equal sides on S09 B.
- `kit.peeks`: explicit peeks only, on both channels; hover reads go to `peek-hover`.
- The walk comes before the follow-up on both channels.

### 9.2 Deliberate differences (stimulus), and how they are handled

| Difference | Handling |
|---|---|
| Plain question and how-line | One copy source; `frame.plainAsk: true` shows them on phone too (recommended before launch) |
| Why line and keycaps | Desktop only. Why lines pass the neutrality check below; any can be removed per screen in the spec |
| Plain-first labels on S02, S05, S06 | In the spec as `plain`; recommended on phone too (S06 cards have room for a sub-line) |
| S10 ruler shows all five anchors | Recommended on phone too (decision 2) |
| S05 description in the panel on hover | Logged as `peek-hover`, never in `kit.peeks` |

Until every row above is ported, analysts treat `meta.channel` as a covariate: report desk and phone splits on S02, S05, S06 and S10 for the first cohort, and compute timing medians and the "under 25% of median" speed flag per channel.

### 9.3 Research safeguards

- **F5 A/B:** the panel question is the variant wording verbatim; there is no plain rewrite and no why line on F5.
- **Follow-ups never echo their trigger.** No "You packed Classroom training." line, no "because you chose X". The kicker is `FOLLOW-UP · CAMP II`. Sheets name only what their mobile prompts already name.
- **Why lines are neutral.** Each says what the answer is used for. Review each with the same check as the art: does any option look better after reading it? If yes, cut the line.

---

## 10. Art

- **Must have:** `scene-basecamp-wide`, a landscape render (about 2400x1600) of the same base camp with the route to the summit visible (`studio/render.mjs --scene-size 2400x1600` in the `ascent-3d` worktree, camera re-framed). Fallback until then: the portrait render, lower half, `xMidYMax slice`.
- **Re-render at 1024px** (drawn above about 256 CSS px): `signpost` (S03), `luggage-tag` (S10 B), `card-*` x4 (S07), `zone-*` x4 (S06 at 180px x k 1.25), `fu-door`, `fu-door-ajar`, `fu-door-open` (F1), `fu-plaque` (F4), `origin-seed`, `origin-bootprint` (S09 B at 120px x 1.25 is borderline; re-render for safety).
- **Re-render at 1536px wide:** `rope-clips` (S09 A and F5, drawn 720 wide).
- **Fine at 512px:** gear tiles (104px), bricks (112px), pitches (96px), traits (112–120px), zone art in S02 (88px), cairn stones.
- **Optional, phase 3:** `scene-panorama`, one continuous five-camp SVG from `buildTerrain`.

---

## 11. How the build is tested

1. **Unit.** `rules.test.ts`, `store.test.ts`, `board.test.ts` stay green and untouched in substance. New unit tests: `useLayout` thresholds (1280x600 → `deskCompact`, 1440x790 → `desk`, 1024x1366 → `phone`, `?layout=` override); `useDrag.drop(zone)` gives the same result and the same `via: 'key'` log as the keyboard Enter path (capacity refusal, swap, Blue copy); the four board hooks give identical boards for identical drop sequences.
2. **Screenshots.** `e2e/game-shot.mjs --desk[=WxH]` (no touch, DPR 2, `pointer: fine`). Every step, beat and sheet (S01 A/B, S02 … S11, F1, F2a, F2b, F3a/b/c, F4, F5 A/B) at **1280x720, 1440x900, 1920x1080**, and at the chrome-subtracted **1280x600 and 1440x790**. For each shot the existing checks: no page scroll, nothing clipped inside the frame, no page or console errors, no art placeholders. Added desk checks: the `h1[data-prompt]` and the how-line are fully visible; the primary is present; no rendered 3D image is drawn above 2x its natural pixel size (catches a missing re-render).
3. **The same e2e walks at desktop size.** `e2e/game-walk.mjs --desk[=WxH]` runs the existing routes A, B and C (real mouse drags, clicks, typing; route B's mid-game reload; route C's keyboard-only S05) at 1440x900 and 1280x720, with the same assertions: no scroll or clipping at every step, the sheets that fire are exactly the route's, and the stored answers hold every key the spec lists.
4. **Keyboard-only and mouse-only runs.** `e2e/game-desk-keys.mjs` finishes the whole game with keys only (Tab, number hotkeys, arrows, Enter, `P`/`N`, typing) and again with mouse only (drags and click-then-click, no keys).
5. **Parity.** `e2e/game-parity.mjs` drives one scripted answer set through phone (390x660) and desk (1440x900) and asserts `response().answers` is deep-equal. `meta.channel` differs; nothing in `answers` does.
6. **Layout switch.** Resize from 1440x900 to 390x660 mid-S02 with an item lifted: the switch waits until the drop, the board survives, no answer is lost. History: a browser Back on S05 returns to S04 B with its answers.
7. **Human pass.** Haresh and Adam walk the desk build on a real laptop (Chrome and Safari, trackpad), and sign off all `ask` copy for neutrality and for the "Advisor seat" framing in S04.

Per the engineering process: `/codex review` on each PR's cumulative diff, then the tests and a real run, before merge.

---

## 12. Problems from the judging pass, and how this design fixes them

| Problem | Fix here |
|---|---|
| Panel-and-stage: the mountain was a backdrop; the cross-camp pan deferred | Diagonal camp-to-camp pan in the stage, the desk walk trail, the panel's camp route, the elastic scene, and the pencil route ahead from S05 (3.4, 3.6). A full panorama stays optional (phase 3) |
| Panel-and-stage: S04 and S08 said to need new constants | Hosted as-is through their container units; only `Readout` and keys are added |
| Panel-and-stage: S07 side pads could demote 'Unsure' | Three equal buttons; drag halos have no labels or size |
| Panel-and-stage: Bodoni kept for S11 | Source Serif 4 italic; no Bodoni on desktop |
| Panel-and-stage: S01 privacy line needed sign-off | Matches mobile (none) unless PA signs off a line for both channels |
| Panorama: S04 redrawn as a horizontal timeline | Not adopted; S04 keeps its geometry |
| Panorama: `kit.peeks` empty on desktop | Explicit peeks only; hover reads logged as `peek-hover` |
| Panorama: walk after follow-up, on every camp change | Walk only on S02, S04 B, S06, before the follow-up, as mobile |
| Panorama: heavy build; band too small; 24px sky at 1280x720 | Shell-first responsive layer; a 4-line question panel; the camp route and caption degrade in `deskCompact`, the question never does |
| Workbench: context line reveals the trigger | No context echo anywhere |
| Workbench: "Nine short questions" vs "eleven steps" | One count everywhere: "Nine short screens, about six minutes" |
| Workbench: 152px window at 1280x720 | The scene fills the whole stage behind the mechanic; no separate strip |
| Workbench: four hooks plus four views is more work | Only the four board screens get hooks and views; everything else is a layout variant or hosted as-is |
| Workbench: desk-only differences | One copy source and `plainAsk`; the rest listed in 9.2 with a porting recommendation and a covariate plan |

---

## 13. Decisions for Haresh

1. **Turn on `plainAsk` for phone before launch?** Recommended. It makes the question identical across channels and fixes "takes a minute" on mobile. Needs one phone height re-check.
2. **Port plain-first labels (S02, S05, S06) and the S10 ruler to phone?** Recommended; these are the clarity fixes and they close the remaining stimulus gaps.
3. **Privacy line on S01.** Default: none on either channel (as since #7). A line returns only with People Analytics sign-off, on both.
4. **Show "Why we ask" at all?** It helps clarity with a small priming risk. Kept small and neutral, removable per screen in the spec.
5. **Landscape tablets get `deskCompact`?** Recommended; touch already works through `useDrag`, and keycaps hide without a fine pointer.
