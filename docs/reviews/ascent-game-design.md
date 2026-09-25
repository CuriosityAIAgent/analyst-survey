# The Ascent: Kit Out the Next Climber (final design, revised)

25 September 2026, second pass. This revision applies the critic's review of the first final design: every must-fix, and every should-fix that does not make the game longer. The table at the end lists each one. The machine-readable version is `docs/reviews/ascent-game-spec.json`. It is generated from the same source as the screen and art sections below, so the two files agree. Nothing here has been built or timed yet, and every time below is an estimate.

**In one line:** 11 screens and 3 to 5 half-sheets. A typical run is about 5:52 and the longest is 6:00. Two questions ask about the respondent's own climb. The art list has 53 new drawings.

## The idea

You made the climb. Now, at base camp, you kit out the next Analyst: you sort their gear on one board, snap together their AI navigation kit from Lego bricks (from a paper-map chat window up to an agent team that briefs weather, route and path), decide which pitches they climb on their own feet, and make four storm calls. At the summit you drag them up the last pitch carrying exactly the kit you chose, and the client waiting there reaches for the climber's hand, not the map.

## The navigation ladder

Six Lego bricks. Each one snaps in above the one below it, on a rock-ledge base plate that has nothing printed on it and cannot be moved.

| Rung | Instrument (brick) | AI tool it stands for | What it gives on the climb (the peek card, descriptive only) | `ladder.ts` rung |
|---|---|---|---|---|
| 1 | **Paper map** | A general LLM chat window | The lie of the land, from memory. You still plot the route. | `assisted` |
| 2 | **Compass** | AI built into email, Excel and slides | A heading while you work. | `assisted` |
| 3 | **Guidebook** | Research AI grounded in the house view, product shelf and policies | What others know about this route, the firm's way. | `assisted` |
| 4 | **GPS** | Client-aware assistant (CRM, holdings, history) | Exactly where you and this client stand. | `assisted` |
| 5 | **Weather radio** | Watch agents (markets, life events, maturities, capital calls) | The storm before it hits. | `standing` |
| 6 | **Expedition brief** | An agent team that drafts the full pack | Weather, route and the precise path, before you leave the tent. | `briefed` |

In `ladder.ts` a rung is a way of delegating work, not a level of capability. The first four instruments all "help while I work", so they are `assisted`, however much each one knows. The expedition brief hands you a finished pack that you read end to end, so it is `briefed`, which is the inspection line. The weather radio runs on a standing brief and only speaks up when it has something to say, so it is `standing`. The game orders the bricks by how precise the guidance is, which is Haresh's order (paper map up to the full brief). It does not order them by delegation depth, so the `ladder.ts` column is not monotone, and it isn't meant to be. For analysis against `ladder.ts`, use the S06 zones, which map one to one: own feet = `own`, walk it with kit = `assisted`, kit drafts, they check = `briefed`.

**How "you still walk" is felt, not said.** The game puts the point into words only once, in the closing line:

1. **Only the respondent moves a climber.** The rookie climbs in S04 and S11, "you" move in S08, and the rookie walks up a short pitch between camps (after S02, S04 and S06). Each of these happens only when the respondent's thumb drags them, or when the keyboard or tap fallback does. The camera pans between camps, but no instrument ever moves anyone, and the rookie never turns up at a camp on their own.
2. **Two lines.** Ahead of the climber, a navy dashed route gets sharper as kit goes on: pencil, then dotted, then waypoints, then weather glyphs and timings. Behind the climber is a solid ink bootprint line that only steps can draw. In S05 the route ahead sharpens with every Day-one brick, but the line behind doesn't move and the button reads "Start walking".
3. **Kit needs something under it.** A brick placed before the rungs beneath it are available wobbles over empty studs. It is allowed and it stays, so the respondent's view is recorded, not corrected.
4. **Loads land on the climber.** In S06, a pitch dropped on "On their own feet" makes the rookie shoulder it with a small crouch and rise. The kit zones carry instruments, never people.
5. **The last pitch.** In S11 the brief is drawn perfectly, from the respondent's own Day-one kit, and the rookie still has to be dragged up by hand. At the top they set the kit down on a rock, and a client stands up from a small table and offers a hand. Closing line: *"They came to meet you, not the map."*

## Screen by screen

**The frame shared by every screen (designed at 390×660, which is iPhone Safari with its toolbars showing):**
- **No scroll, ever.** Every screen fits 100dvh at 390×660. The stage uses `touch-action:none`, so a screen that overflowed could not scroll during a drag. Each screen below states its height budget. Below 640px tall, tiles scale down with CSS `clamp()`. Test on a real iPhone in Safari with the toolbar showing before calling any screen done.
- **Scene.** A full-bleed camp scene, not a band under a form. On answer screens the ridge (`mountain.ts`) is an ink hairline behind the top bar and prompt, not a 28% band. The paper `#F8F7F4` warms toward `--color-dawn #E9D5BB` camp by camp. Every object sits on the ground plane, and the tray sits at the bottom.
- **Top bar.** Five small tents (Base camp, Camp I, Camp II, Camp III, Summit) fill in by camp. There is never a percentage. The bar also holds Back and a sound toggle. Back never loses an answer.
- **Type.** Prompt in Bodoni Moda 24/28. Helper in Source Serif 4 15px, muted. Labels in Archivo 12–13px. The primary button is Archivo, ink fill, and appears only once the screen is valid.
- **Figures.** The rookie wears a forest jacket (the `survey.ts` figure at 3×). "You" wear bronze and appear only on the two self-questions, so the colour quietly signals "this one is about you". Every follow-up about the rookie shows the forest rookie in its header.
- **Camp walks.** On the last screen of Base camp, Camp I and Camp II (S02, S04, S06), the Continue button becomes a 56px strip at the foot of the screen: the rookie at the bottom of a short pitch. The respondent drags them about 100px up, and bootprints ink in behind. A tap on "Walk on" or Enter does the same over 600ms. It costs about a second more than a tap.
- **Three input paths for every drag:**
  - pointer drag;
  - tap-then-tap: tap an item to lift it, then tap a zone;
  - keyboard: Tab to the item, Space to lift, arrows to cycle zones (announced via `aria-live`), Enter to drop, Esc to cancel.

  Sliders also carry a hidden native `input[type=range]`.
- **Pictured choices.** Every pictured option on a screen shares the same size, stroke and accent colour. Tray and card orders are randomised per respondent and logged. Screens that ask about the respondent (S04 Beat B, S08) show no pictures at their stops.
- **Follow-ups.** Each follow-up is a half-sheet that rises over its parent screen (280ms). It takes one drag or one tap and never adds a screen.
- **Privacy.** Answers are held under a code by People Analytics, and business and class come from the link token. That makes responses pseudonymous, not anonymous, and the copy says so. Every business × cohort cut is reported only for groups of ten or more. S08 and F5 breakdowns are suppressed in any cell under ten.

### S01 · Base camp · "The trailhead"
- **Mechanic:** `scene`
- **Beat A (`scene`):** "You made the climb. Now kit out the next one." / helper "About six minutes. Held under a code by People Analytics."
    - Capacity: No answer. One button: 'Start the climb'.
- **Beat B (`pick`):** "Your business and class? For grouping only." / helper "Two taps. Reported only in groups of ten or more."
    - Capacity: Fallback only, shown when the token lacks business or class. One tap per row. Text chips, no art.
    - Items:
      - `uspb` "USPB" (group: Business)
      - `ipb` "IPB" (group: Business)
      - `solutions` "Solutions" (group: Business)
      - `other` "Other" (group: Business)
      - `cohort` "Class of 2017 to 2025, Earlier" (group: Class of; note: Year chips in one row)
- **Capacity/limits:** No answer. One button: 'Start the climb'. Business and class come from the link token; nothing about the respondent is asked here.
- **Adaptive:** `!token.business || !token.cohort` → S01#B — Fallback only. People Analytics issues tokens carrying both, so at launch this should never fire.
- **Measures:** Adam: warm, peer-to-peer opening ('you've been successful; help the next generation'); Consent and purpose, stated once; Segments (business, cohort) from the link token, not asked
- **Stores:** `t.start`, `consent`, `variant.seed`, `segment.business`, `segment.cohort`, `segment.source: token|asked`
- **Seconds:** 6
- **Layout (390×660):** Full-bleed scene. Prompt and helper over the sky; footnote above the button.
- **Feel and build notes:**
    - Full-bleed base camp. The rookie (forest jacket) stands at the trailhead beside an open, empty rucksack. The route up the face is a faint pencil line.
    - Through the tent flap: six instrument shapes under a canvas cover (the navigation kit, not yet issued). Nothing explains them; it is a promise of what comes at Camp II.
    - Footnote in Archivo 12px: 'Your answers are held under a code by People Analytics, not under your name. The working group sees only groups of ten or more.' This is pseudonymous, and the copy says so; it does not claim anonymity.
    - Segments are read from the link token, so the respondent is never asked what tools they have or what they did. Tool access by business comes from the AI rollout register at analysis time.

### S02 · Base camp · "Kit them out"
- **Mechanic:** `pack`
- **Prompt:** "Kit out the next climber. Fill every zone."
- **Helper:** "Drop on a full slot to swap."
- **Items:**
    - `meetings` "Sit in client meetings" — art `gear-binoculars` (area: 1 Understand the client; Adam: observing)
    - `present` "Present to clients" — art `gear-leadrope` (area: 2 Advice / 4 Lead the relationship)
    - `portfolio` "Portfolio analysis" — art `gear-crampons` (area: 2 Develop and communicate advice; pairs: p_portfolio)
    - `outreach` "Prospect outreach" — art `gear-flare` (area: 3 Create and convert opportunities; pairs: p_outreach)
    - `prep` "Prep the meeting brief" — art `gear-bootlaces` (area: 4 Lead the relationship; pairs: p_brief)
    - `ops` "Onboarding & ops" — art `gear-stove` (area: 5 Navigate the franchise; Adam: ops exposure)
    - `debrief` "Debrief with Advisor" — art `gear-logbook` (area: 6 Judgement; deck Coaching)
    - `morning` "Morning meeting" — art `gear-thermos` (area: Adam: learning source)
    - `classroom` "Classroom training" — art `gear-manual` (area: Adam: learning source (drives F1))
    - `roleplay` "Role plays" — art `gear-boulder` (area: Adam: learning source)
    - `admin` "CRM & admin" — art `gear-forms` (area: Low-value work (deck Red, wrap-up stem 2); pairs: p_crm)
    - `formatting` "Deck formatting" — art `gear-polish` (area: Low-value work (deck Red, wrap-up stem 2))
- **Zones:**
    - `rucksack` "More of it" — art `rucksack` (slots: 3; vote: GREEN)
    - `hand` "Speeds them most" — art `hand-zone` (slots: 1; vote: BLUE; note: Takes a copy: a packed item stays packed)
    - `out` "Free them of it" — art `tarp-out` (slots: 2; vote: RED)
    - `rerig` "Keep, but re-rig" — art `bench-rerig` (slots: 2; vote: AMBER)
- **Capacity/limits:** Exactly 3 in the rucksack (Green), 1 in the hand (Blue), 2 on the tarp (Red), 2 on the bench (Amber). A tile sits in only one of rucksack, tarp or bench. The hand takes a copy of any tile, so Blue may repeat a Green, as in the deck's dot vote. Dropping on an occupied slot swaps the two tiles; dropping on a zone's body when it is full bounces with a 2px shake.
- **Adaptive:** `vote.green.includes('classroom') || vote.blue === 'classroom'` → F1 — Evaluated on Continue, after all eight placements
- **Measures:** Deck vote: GREEN x3, BLUE x1, RED x2, AMBER x2 on one board, as in the deck; Wrap-up stem 1 'Every Analyst should do more of...' (Green); Wrap-up stem 2 '...spend less time on...' (Red); D1 (more often or earlier); D2 (Green vs Red on the same tray); D3 (experience and coaching built in); D4 (Red = reduce; Amber = redesign); Adam: what could have accelerated the journey (morning meeting, meetings, ops, classroom, role plays), asked forward as best-worst
- **Stores:** `vote.green[3]`, `vote.greenOrder`, `vote.blue`, `vote.blueAlsoGreen`, `vote.red[2]`, `vote.amber[2]`, `tray.order`
- **Seconds:** 64 (+1 for the camp walk that replaces Continue)
- **Layout (390×660):** 390x660 budget: top bar 40, prompt and helper 72, zones in a 2x2 grid of 171x68 (placed tiles shrink to 40px) = 144, tray 4x3 of 64px tiles with two-line 12px labels = 276, walk strip 56, margins 32. Total 620.
- **Feel and build notes:**
    - One board, four zones, one tray: the deck's single dot-vote board. All four zones are visible from the start; each shows its slot outlines (3, 1, 2, 2), so the counts need no words.
    - Tray: 12 gear tiles, 64px, 4x3, order randomised per respondent and logged. Every tile is drawn in the forest accent at the same weight; the label (Archivo 12px) carries the meaning.
    - The tray mixes developmental work with two plainly low-value tiles (CRM & admin, Deck formatting) and one that reads either way (Onboarding & ops), so the tarp is a real choice, not a forced pick among good activities.
    - The rucksack zips as its third item goes in. The rookie's gloved hand closes on the Blue item. The tarp folds over its loads; the bench shows a spliced rope under its two.
    - Write-ins are not on this board. 'Missing activities' (deck) are collected in S10's line, which invites 'anything we didn't ask'.
    - F1 opens only after all eight placements, on Continue, so packing classroom cannot be seen to cost time mid-board.

### S03 · Camp I · "The signpost"
- **Mechanic:** `text`
- **Prompt:** "No one reaches the top without having…"
- **Helper:** "Finish the line. Seen it, done it, or led it?"
- **Items:**
    - `rule` "Signpost arm" — art `signpost`
- **Capacity/limits:** One line, 60 characters, optional ('Leave it blank' stores skipped). Native dictation works.
- **Adaptive:** none
- **Measures:** Wrap-up stem 3 'No one should graduate without having...'; D3: what every participant should experience, and (from the helper's cue) what counts as sufficient; Main open text placed in the first third (evidence: position effects)
- **Stores:** `rule.text`, `rule.skipped`, `rule.keystrokes`
- **Seconds:** 27
- **Layout (390×660):** Signpost and field in the upper half so the keyboard never covers them (field top at or above 300px).
- **Feel and build notes:**
    - Each typed word appears carved into the signpost arm, bronze letters settling over 120ms. The ghost text is only '...having ______', with no example answers to anchor on.
    - The helper's 'Seen it, done it, or led it?' replaces the old 'how much counts as enough' chips: it asks for sufficiency inside the same line, at no extra tap.

### S04 · Camp I · "The climb"
- **Mechanic:** `drag-slider`
- **Beat A (`drag-slider`):** "Drag them up. How long should the climb to Advisor take?" / helper "Camps from one year to four. Or tap: when proven."
    - Capacity: One stop. The rookie starts on the trailhead ledge, off the scale; Continue stays disabled until they are placed.
- **Beat B (`pick` · self-question):** "And you? Tap where you felt ready." / helper "One tap. 'Not yet' is a fine answer."
    - Capacity: One tap on a stop, or 'Not yet'. A small 'Rather not say' link stores null. Tap only, no drag, no images.
- **Items:**
    - `m12` "12 months" — art `track-switchback`
    - `m18` "18 months" — art `track-switchback`
    - `m24` "24 months" — art `track-switchback`
    - `m30` "30 months" — art `track-switchback`
    - `m36` "36 months" — art `track-switchback` (note: A small cairn marked 'Today' stands here)
    - `m48` "48 months" — art `track-switchback`
    - `proven` "When proven" — art `track-switchback` (note: Brass tag beside the track; tapped, not dragged)
    - `notyet` "Not yet" (note: Beat B only; text chip, no image)
- **Capacity/limits:** Beat A: one stop, required. Beat B: one tap, 'Not yet' or 'Rather not say'. Keyboard: Up/Down step between stops, Home/End jump to the ends.
- **Adaptive:** `pace.months === 'proven' || pace.months < 36` → F2a; `pace.months >= 36` → F2b
- **Measures:** Adam: compress the three years? minimum time? compress on skills attained ('When proven'); 'ready after a year, or held back?'; D1 (earlier); D5 (progression); Self-question 1 (Beat B); Derived: gap between the pace they set and the pace they lived
- **Stores:** `pace.months`, `pace.reversals`, `self.readyAt`
- **Seconds:** 22 (+1 for the camp walk that replaces Continue)
- **Layout (390×660):** Vertical track 340px tall on the right two-thirds; stop labels left of the track in Archivo 13px.
- **Feel and build notes:**
    - A real drag slider, and the climber is the thumb (48px figure, 64px touch target). Dragging walks them up the switchbacks with a stride made of SVG transforms on the one survey.ts figure; on release they snap to the nearest camp with a boot-crunch tick (navigator.vibrate(8) where supported).
    - Their footsteps ink the pencil path in behind them. Tapping any camp also places them; a hidden native input[type=range] carries keyboard and screen-reader use (aria-valuetext = '24 months').
    - Stops are 12, 18, 24, 30, 36 and 48 months; the helper says 'one year to four' because the last gap is a year, not six months.
    - Beat B: the rookie waits at their camp; the respondent's own figure appears at the trailhead as a bronze outline. No other image is on screen (images shift self-ratings).
    - F2 rises after Beat B, so the self-answer is given before any follow-up, and F2 names the rookie and their stop so it cannot be read as a question about the respondent.

### S05 · Camp II · "The navigation kit"
- **Mechanic:** `lego`
- **Prompt:** "Build their navigation kit. When does each piece go on?"
- **Helper:** "Snap each brick into a lane. Tap i to read it."
- **Items:**
    - `map` "Paper map" — art `brick-map` (sub: LLM chat; peek: A general AI chat. Knows the terrain broadly, not today's.; rung: 1; ladder: assisted)
    - `compass` "Compass" — art `brick-compass` (sub: AI in your tools; peek: AI inside email, Excel and slides. Helps while you work.; rung: 2; ladder: assisted)
    - `guidebook` "Guidebook" — art `brick-guidebook` (sub: Firm research AI; peek: Grounded in the house view and the product shelf.; rung: 3; ladder: assisted)
    - `gps` "GPS" — art `brick-gps` (sub: Knows the client; peek: Reads CRM, holdings and history. Knows where the client stands.; rung: 4; ladder: assisted)
    - `radio` "Weather radio" — art `brick-radio` (sub: Watch agents; peek: Agents that watch markets, life events and capital calls.; rung: 5; ladder: standing)
    - `brief` "Expedition brief" — art `brick-brief` (sub: Agent team; peek: An agent team drafts the full pack: weather, route, timings.; rung: 6; ladder: briefed)
- **Zones:**
    - `day1` "Day one" — art `baseplate` (note: Lane 1 of the base plate, six rung-height stud rows)
    - `proven` "Once proven" — art `baseplate` (note: Lane 2)
    - `none` "Not for them" — art `crate` (note: Narrow fourth column beside the plate)
- **Capacity/limits:** All six bricks placed, each in a lane or the crate. A brick snaps to its own rung height in the lane. Bricks in Day one show as pale carried-forward ghosts in Once proven.
- **Adaptive:** `kit.lane.brief === 'day1'` → F3a; `kit.lane.brief === 'proven'` → F3b; `kit.lane.brief === 'none'` → F3c
- **Measures:** D6 (where they form a view before AI; which instruments come later); D5 (when AI access is earned); Deck technology: 'Where should Analysts form a view before seeing AI output?'; Adam: 'managers of agents even at that stage?'
- **Stores:** `kit.lane{brickId: day1|proven|none}`, `kit.cut{day1, proven}: 0-6 contiguous rungs available`, `kit.unsupported[]`, `kit.peeks[]`, `kit.events[]`
- **Seconds:** 52
- **Layout (390×660):** 390x660 budget: top bar 40, prompt and helper 72, route strip 60, lane heads 20 + plate 6 rows x 34 = 224, tray two rows of three 72x30 bricks with 12px sub-labels = 100, button 52, margins 60. Total 628. Width: two lanes of 128px + crate column 72px + gaps and margins = 376.
- **Feel and build notes:**
    - Each builds on the last, felt not told: the base plate has six stud rows per lane, one per rung, map at the bottom and expedition brief at the top. A brick placed where the rungs below it are not yet available sits over empty studs with a dashed shadow and a slight wobble. It is allowed, and it stays. The wobble is the only comment, plus one small caption the first time: 'Nothing under it yet.'
    - All six bricks are drawn in the one navy accent at the same weight. The instrument icon and the plate's row height carry the order, so no brick looks better or more advanced by its colour.
    - The base plate is a forest-green rock ledge with nothing printed on it. It cannot be moved.
    - Above the plate, a 60px route strip redraws as Day-one bricks go on: faint pencil line, then dotted, then waypoints, then weather glyphs and timings. The rookie stands at the strip's left end. Their bootprint line behind them does not move on this screen, and the button reads 'Start walking'.
    - Each brick carries a small 'i' corner. Tapping it (or Enter / ? on the keyboard) opens a one-line peek card that says what the AI tool is. It is descriptive, with no 'can't' line. Long-press (450ms) also opens it, but cancels after 8px of movement so it never fights a drag; the stage sets -webkit-touch-callout:none and user-select:none.
    - Snap: 180ms spring and a stud-click (sound off by default). Any order is allowed, so a respondent can say 'agents yes, open chat no', and that view is recorded as kit.unsupported.

### S06 · Camp II · "Who climbs each pitch"
- **Mechanic:** `pack`
- **Prompt:** "Five pitches. Who climbs each one, and how?"
- **Helper:** "Their own feet take two at most."
- **Items:**
    - `p_portfolio` "Portfolio analysis" — art `reviewpack` (pairs: portfolio)
    - `p_outreach` "Prospect outreach draft" — art `clientmail` (pairs: outreach)
    - `p_brief` "Meeting brief" — art `pitchbook` (pairs: prep)
    - `p_onboard` "Onboarding paperwork" — art `onboard`
    - `p_crm` "Meeting notes & CRM" — art `pitch-crmnotes` (pairs: admin)
- **Zones:**
    - `own` "On their own feet" — art `zone-ownfeet` (ladder: own; slots: 2; deck: Human-owned / human-led)
    - `withkit` "Walk it with kit" — art `zone-withkit` (ladder: assisted; deck: AI-assisted)
    - `kitdrafts` "Kit drafts, they check" — art `zone-kitdrafts` (ladder: briefed; deck: AI-led with human review)
    - `crew` "Base-camp crew" — art `zone-crew` (deck: Reassign, self-serve or eliminate)
- **Capacity/limits:** All five pitches placed. 'On their own feet' holds at most 2; the others are unlimited.
- **Adaptive:** none
- **Measures:** D6 (which reps stay human-led even when AI can do them); D4 (automate = kit drafts; reassign, self-serve or eliminate = crew); D2 (read against S02: a packed item's pitch handed off is a silent staging check); Deck: Overseeing AI and Developing intuition (the four zones are the deck's own four categories)
- **Stores:** `pitch.zone{pitchId: own|withkit|kitdrafts|crew}`, `pitch.order`, `pitch.firstOwn`
- **Seconds:** 38 (+1 for the camp walk that replaces Continue)
- **Layout (390×660):** 390x660 budget: top bar 40, prompt and helper 72, zones 2x2 at 171x100 = 208, tray of five 64px pitch tiles in one row with labels = 90, walk strip 56, margins 48. Total 514.
- **Feel and build notes:**
    - Four ground zones in a 2x2 grid (171x100). Every pitch is work AI can do, so each placement is a real trade-off.
    - The porter is a person from the base-camp crew (ops, service, a specialist), drawn plainly human. It is not the navigation kit. The only things that stand for AI on this screen are instruments: the map and compass in 'Walk it with kit', the expedition-brief clipboard in 'Kit drafts, they check'.
    - A pitch dropped on 'On their own feet' makes the rookie shoulder it with a small crouch-and-rise (SVG transform on the survey.ts figure). A third bounces and the strap strains for 200ms.
    - Three pitches pair with S02 gear (portfolio, outreach, prep) and one with a low-value tile (CRM & admin). These drive silent staging checks only; nothing is put to the respondent.
    - The old 'freed day' beat is gone; where released capacity should go is now one storm call in S07 ('Freed time, bigger books').

### S07 · Camp III · "Storm calls"
- **Mechanic:** `swipe`
- **Prompt:** "Storm coming. Four calls. Right: make it policy."
- **Helper:** "Left: drop it. 'Unsure' is a real answer."
- **Items:**
    - `certify` "Certify before clients" — art `card-certify` (sub: A pass before they pitch or run a review alone.)
    - `aiclient` "AI clients replace some" — art `card-aiclient` (sub: Avatar role plays stand in for some real meetings.)
    - `agents` "Agents by year two" — art `card-agents` (sub: Each Associate runs their own agent team.)
    - `freedtime` "Freed time, bigger books" — art `card-freedtime` (sub: Hours the kit saves go to more clients.)
- **Zones:**
    - `drop` "Drop it" (value: drop; key: ArrowLeft / swipe left)
    - `unsure` "Unsure" (value: unsure; key: ArrowDown / button)
    - `policy` "Make it policy" (value: policy; key: ArrowRight / swipe right)
- **Capacity/limits:** All four cards, order randomised and logged. Buttons under the stack (Drop it / Unsure / Make it policy) are the primary input; swipe is the enhancement.
- **Adaptive:** `calls.certify.answer === 'policy'` → F4 — Evaluated after all four cards
- **Measures:** Adam: certification (and, through F4, avatar role plays as a way to earn it); managers of agents; training at scale; Deck: readiness checks before a client; can simulations or AI clients substitute?; Re-focusing released capacity (bigger books vs development); D5 (operating model); Re-asks: agents vs S05 brief lane; certify vs S04 'When proven'
- **Stores:** `calls{cardId: {answer: 'policy'|'drop'|'unsure', ms, order}}`
- **Seconds:** 22
- **Layout (390×660):** Card 300x300 centred (art 200px, title in Bodoni 22px, one Source Serif sub-line), three buttons in a row beneath.
- **Feel and build notes:**
    - Each card has a 3-4 word Bodoni title and one short Source Serif sub-line; the title is what is read.
    - The stored answer is the zone's value ('policy', 'drop', 'unsure'), the same vocabulary the F4 rule tests. A unit test asserts F4 fires on certify = 'policy' and not otherwise.
    - Snow thickens a little with each card and clears after the last. A small ink stamp ('POLICY' / 'DROPPED' / 'UNSURE') lands as each card leaves; the stamp is set in Archivo, not drawn art.
    - Filters first: all four are answered before F4 can appear, so 'no' is never learned as the short way through.
    - Card art shows the situation neutrally: no badges, trophies or winning faces.

### S08 · Camp III · "Roped to another"
- **Mechanic:** `drag-slider`
- **Self-question:** yes (one of the two)
- **Prompt:** "Roped to a different Advisor on day one. Where are you now?"
- **Helper:** "Same you, same effort. Drag yourself onto the ridge."
- **Items:**
    - `r1` "Nowhere near here" — art `track-ridge` (value: 1)
    - `r2` "Well behind" — art `track-ridge` (value: 2)
    - `r3` "A bit behind" — art `track-ridge` (value: 3)
    - `r4` "About here" — art `track-ridge` (value: 4)
    - `r5` "Right here" — art `track-ridge` (value: 5)
- **Capacity/limits:** One stop. 'You' (bronze) start on a ledge below the ridge, unset. Tap a stop or use arrow keys. 'Rather not say' stores null. Labels only, no images at the stops.
- **Adaptive:** `self.ropeCounterfactual === null || self.ropeCounterfactual <= 3` → F5 (variant A); `self.ropeCounterfactual >= 4` → F5 (variant B)
- **Measures:** Self-question 2; Adam: 'could you have been tagged to someone else and still succeeded?'; Adam: can we scale, or are there too few amazing people? (derived: the share who would be 'about here' with any Advisor, read with F5 'Protected Advisor time'); D5 and deck Access: how much depends on luck of assignment
- **Stores:** `self.ropeCounterfactual: 1-5|null (1 = nowhere near, 5 = right here)`, `rope.reversals`
- **Seconds:** 12
- **Layout (390×660):** Horizontal ridge across the middle third; labels under each stop in Archivo 12px.
- **Feel and build notes:**
    - Second real drag slider, horizontal. The respondent's own bronze figure is the thumb. The rope runs off-screen to the left; the other Advisor is never drawn, so no one is pictured or judged.
    - Coding: 1 = 'Nowhere near here' (the result depended most on the Advisor), 5 = 'Right here' (it depended least). The field is named for the counterfactual so no analyst reads it backwards.
    - Sensitive in small groups: S08 and F5 breakdowns are suppressed in any business x cohort cell under ten.

### S09 · Camp III · "Rope up"
- **Mechanic:** `rank`
- **Beat A (`rank`):** "Rope up the three traits great private bankers lead with." / helper "Drag onto the rope. Clip one leads."
    - Capacity: Exactly three, ordered. Dropping on a filled clip swaps. Tray order randomised and logged.
- **Beat B (`swipe`):** "{leadTrait}: born with it, or built on the climb?" / helper "Swipe it, or tap a side."
    - Capacity: One card, the lead trait. The two buttons under it are the primary input. Which side is 'born' is randomised per respondent and logged.
    - Items:
      - `lead` "The lead trait" (note: Piped from clip 1; its trait art at 120px)
    - Zones:
      - `born` "Born with it" — art `origin-seed`
      - `built` "Built on the climb" — art `origin-bootprint`
- **Items:**
    - `reading` "Reading people (EQ)" — art `trait-reading`
    - `hunter` "A hunter's drive" — art `trait-hunter`
    - `calm` "Calm in a storm" — art `trait-calm`
    - `depth` "Market & product depth" — art `trait-depth`
    - `story` "Numbers into a story" — art `trait-story`
    - `bounce` "Bouncing back from no" — art `trait-bounce`
    - `judgement` "Commercial judgement" — art `trait-judgement`
    - `curiosity` "Curiosity" — art `trait-curiosity`
- **Zones:**
    - `clip1` "1 Leads" — art `rope-clips`
    - `clip2` "2 Second" — art `rope-clips`
    - `clip3` "3 Anchor" — art `rope-clips`
- **Capacity/limits:** Three traits on the rope, then born or built for the lead trait.
- **Adaptive:** none
- **Measures:** Adam: stack-rank the characteristics of a great private banker; Adam: innate vs learned, EQ, hunter's mentality; Crossed: is the lead trait one we hire for or one we build?
- **Stores:** `traits.top3[3]`, `traits.order`, `traits.leadOrigin`, `traits.originSides`
- **Seconds:** 30
- **Layout (390×660):** Rope with three clips 80px tall across the upper third; tray 4x2 of 64px trait tiles with labels = 184.
- **Feel and build notes:**
    - The rope is strung across the ridge with three numbered carabiners; each clip closes with a click. The born and built glyphs (a seed; a bootprint) are drawn to the same finish so neither looks like the better answer.
    - Beat B names the trait, not 'your three', so it reads as a view about bankers, not about the respondent.
    - EQ is named on the tile ('Reading people (EQ)') because Adam asked about it by that word.

### S10 · Camp III · "Mark the route, tag the change"
- **Mechanic:** `stack+text`
- **Beat A (`stack`):** "Today's A2A route, as the next climber finds it." / helper "Stack stones. One: rebuild it. Five: don't touch it."
    - Capacity: Drag or tap stones onto the cairn, 1 to 5; tap the top stone to lift it off. The label under the cairn changes with the count. No default.
- **Beat B (`text`):** "One change before they set off. What is it?" / helper "Or anything we didn't ask. A line is plenty."
    - Capacity: 80 characters, optional ('Leave it blank'). Native dictation works.
    - Items:
      - `oneChange` "Tag on the strap" — art `luggage-tag`
- **Items:**
    - `s1` "Rebuild it" — art `cairn-stone` (value: 1)
    - `s2` "Major repairs" — art `cairn-stone` (value: 2)
    - `s3` "Re-rig parts" — art `cairn-stone` (value: 3)
    - `s4` "Minor tweaks" — art `cairn-stone` (value: 4)
    - `s5` "Don't touch it" — art `cairn-stone` (value: 5)
- **Zones:**
    - `cairn` "Cairn" — art `cairn-stone`
- **Capacity/limits:** Beat A: 1 to 5 stones, required. Beat B: one line, optional. Both on the same screen; the cairn stays in view while the tag is written.
- **Adaptive:** none
- **Measures:** Adam: 'mark to market the quality of our training programme'; Deck Pulse Check (read as a peak-and-end impression, not a headline metric); Wrap-up stem 4 'If we could make only one change...'; Adam: 'anything else'; deck: missing activities are findings
- **Stores:** `mark`, `oneChange.text`, `oneChange.skipped`, `oneChange.keystrokes`
- **Seconds:** 32
- **Layout (390×660):** Cairn on the left third, rookie and tag on the right; the tag field sits at or above 300px so the keyboard never covers it.
- **Feel and build notes:**
    - The cairn is framed as the route the next climber meets, so it rates the programme, not the respondent.
    - When the cairn has stones, the prompt line cross-fades to Beat B and the luggage tag swings on the rookie's strap. Typed text appears on it in Source Serif italic.
    - This is the only text-and-rating stretch at the end, and it is one screen; the next thing is the payoff.

### S11 · Summit · "The last pitch"
- **Mechanic:** `scene`
- **Prompt:** "Their brief is perfect. The last pitch is still on foot."
- **Helper:** "Drag them to the top."
- **Capacity/limits:** No answer. The drag follows the path; letting go rests the climber in place (no slide back). Skippable. Reduced motion: a tap moves them to the top.
- **Adaptive:** none
- **Measures:** None (payoff). Records completion.
- **Stores:** `summit.dragMs`, `t.complete`
- **Seconds:** 12
- **Layout (390×660):** Full-bleed summit; the path runs from bottom-left to the summit table top-right.
- **Feel and build notes:**
    - The rookie carries exactly what the respondent chose: the three packed items at the top of the rucksack, the Blue item in hand, the Day-one bricks clipped to the shoulder strap.
    - The route ahead is drawn as precisely as their Day-one kit allows (pencil line for a map alone, up to a timed dotted line with weather glyphs for the full kit). No instrument moves the climber. Only the respondent's drag does, and each step inks a bootprint.
    - At the top the rookie sets the kit down on a flat rock. A client stands up from a small table with two chairs and offers a hand. One line, Bodoni, the only time the point is put into words: 'They came to meet you, not the map.'
    - Then a small paper card (CSS, not art), 'Their kit': In hand / Packed / Day-one kit / On their own feet. 'Thank you.' No share button (privacy), no score, no confetti.

### Follow-up sheets (half-sheets; they never add a screen)

This week every sheet is text-only except the four that borrow a prop from the scene (the F1 door, the F2a rookie, the F4 plaque, the F5 rope clip). Apart from `fu-door` and `fu-plaque`, no `fu-*` picture glyphs are drawn for v1.

#### F1 · Base camp · "The classroom call"
- **Mechanic:** `drag-slider` (half-sheet over S02)
- **Fires when:** Classroom training packed (Green) or put in the hand (Blue)
- **Prompt:** "Attendance runs low. Make classroom mandatory?"
- **Helper:** "Drag the door: shut, ajar or open."
- **Items:**
    - `mandatory` "Mandatory, no exceptions" (position: shut)
    - `clientFirst` "Mandatory, client first" (position: ajar)
    - `optional` "Optional, on demand" (position: open)
- **Zones:**
    - `door` "Classroom door" — art `fu-door` (note: One drawing; three positions by rotation)
- **Capacity/limits:** One of three door positions. Tap a label or use Left/Right as the fallback.
- **Adaptive:** none
- **Measures:** Adam: 'more classroom? None of you show up; should it be mandatory?'; D3; Adam: self-learning and training at scale ('Optional, on demand')
- **Stores:** `classroom.mandatory: 'mandatory'|'clientFirst'|'optional'`
- **Seconds:** 7

#### F2a · Camp I · "Ready to do what"
- **Mechanic:** `pack` (half-sheet over S04)
- **Fires when:** Pace under 36 months, or 'When proven'
- **Prompt:** "Ready at {stop}. What do they take on first?"
- **Helper:** "Drag them to one."
- **Items:**
    - `rookie` "The rookie" — art `rookie` (note: Forest jacket, in the sheet header, so the question is plainly about them)
- **Zones:**
    - `reviewAlone` "Run a review alone"
    - `pitch` "Pitch a prospect"
    - `cold` "Work names cold"
    - `smallBook` "Own a small book"
    - `commitment` "Win a commitment"
- **Capacity/limits:** One. Text chips as ledges; the rookie is dragged onto one (tap-then-tap and keyboard fallback).
- **Adaptive:** none
- **Measures:** Adam: 'ready after a year: ready to do what? Cold calling, your own book?'; Deck Hindsight/Surprises (partial): 'Win a commitment' is one of the deck's VP surprises
- **Stores:** `pace.readyFor`
- **Seconds:** 9

#### F2b · Camp I · "What can't be rushed"
- **Mechanic:** `pick` (half-sheet over S04)
- **Fires when:** Pace 36 or 48 months
- **Prompt:** "Held to {stop}. What can't be rushed for them?"
- **Helper:** "Pick one."
- **Items:**
    - `cycle` "A market cycle"
    - `trust` "Client trust"
    - `breadth` "Product breadth"
    - `confidence` "Their own confidence"
- **Capacity/limits:** One tap. The rookie is in the sheet header at their stop.
- **Adaptive:** none
- **Measures:** Adam: 'is there a minimum amount of time to absorb that you can't skip?'
- **Stores:** `pace.cantRush`
- **Seconds:** 9

#### F3a · Camp II · "Agents on day one"
- **Mechanic:** `pick` (half-sheet over S05)
- **Fires when:** Expedition brief placed in Day one
- **Prompt:** "Agents on day one. What must they master first?"
- **Helper:** "Pick one."
- **Items:**
    - `byHand` "By hand, once"
    - `spotWrong` "Spot a wrong answer"
    - `sharpBrief` "Write a sharp brief"
    - `learnByDoing` "Nothing, learn by doing"
- **Capacity/limits:** One tap.
- **Adaptive:** none
- **Measures:** D6: form a view before AI; Deck: Developing intuition (what new skills); Adam: managers of agents
- **Stores:** `kit.agentsFirst`
- **Seconds:** 8

#### F3b · Camp II · "Earning the agent team"
- **Mechanic:** `pick` (half-sheet over S05)
- **Fires when:** Expedition brief placed in Once proven
- **Prompt:** "What earns them the agent team?"
- **Helper:** "Pick one."
- **Items:**
    - `cert` "A certification"
    - `signoff` "Advisor's sign-off"
    - `time` "Time served"
    - `record` "A clean track record"
- **Capacity/limits:** One tap.
- **Adaptive:** none
- **Measures:** D5: how AI access is earned; Re-ask against S07 certify
- **Stores:** `kit.agentsEarn`
- **Seconds:** 8

#### F3c · Camp II · "No agents"
- **Mechanic:** `pick` (half-sheet over S05)
- **Fires when:** Expedition brief put in 'Not for them'
- **Prompt:** "Why keep agents off their kit?"
- **Helper:** "Pick one."
- **Items:**
    - `stopLearning` "They'd stop learning"
    - `trustOutput` "Can't trust the output"
    - `clients` "Clients won't accept it"
    - `notYet` "Not their job yet"
- **Capacity/limits:** One tap.
- **Adaptive:** none
- **Measures:** D6; Adam: managers of agents (the 'no' reasons)
- **Stores:** `kit.agentsWhyNot`
- **Seconds:** 8

#### F4 · Camp III · "How to certify"
- **Mechanic:** `pack` (half-sheet over S07)
- **Fires when:** S07 certify = 'policy'. On 'drop' or 'unsure' it is skipped, as Adam asked.
- **Prompt:** "How should they earn the pass?"
- **Helper:** "Drag one onto the plaque."
- **Items:**
    - `avatar` "Avatar role play"
    - `written` "Written test"
    - `practical` "Practical case test"
    - `observed` "Observed live by Advisor"
    - `clientFeedback` "Client feedback"
- **Zones:**
    - `plaque` "The plaque" — art `fu-plaque` (slots: 1)
- **Capacity/limits:** One. Dropping a second swaps. Tap-then-tap and keyboard fallback.
- **Adaptive:** none
- **Measures:** Adam: 'what is that certification process? Role play? A test? Practical?'; Adam: avatar role plays as mandatory (asked, as Adam framed it, after a yes to certification); Deck: readiness checks before a client
- **Stores:** `certify.how`
- **Seconds:** 8

#### F5 · Camp III · "Guarantee one thing"
- **Mechanic:** `pack` (half-sheet over S08)
- **Fires when:** Always, after S08. Variant A when the rope answer is 'A bit behind' or lower, or 'Rather not say'; variant B when 'About here' or 'Right here'. Same options and cost on both.
- **Prompt:** "Then guarantee every climber one thing."
- **Helper:** "Clip one onto the rope."
- **Prompt variants:** A: "Then guarantee every climber one thing." · B: "Your rope held. Guarantee that for everyone: one thing."
- **Items:**
    - `mentor` "A named mentor"
    - `debrief` "Debrief after meetings"
    - `hypothesis` "Pre-meeting hypothesis review"
    - `speakingRole` "A set speaking role"
    - `ecm` "A named ECM check-in"
    - `protectedTime` "Protected Advisor time"
- **Zones:**
    - `clip` "Rope clip" — art `rope-clips` (slots: 1)
- **Capacity/limits:** One. Tap-then-tap and keyboard fallback.
- **Adaptive:** none
- **Measures:** Deck Access: what to guarantee centrally; what an Early Career Manager should monitor ('A named ECM check-in'); Deck Coaching: pre-meeting hypothesis review, defined speaking role, post-meeting debrief; D5 manager routines; Adam scaling (partial): 'Protected Advisor time' is the 'so much else going on' constraint
- **Stores:** `guarantee`, `guarantee.variant: 'A'|'B'`
- **Seconds:** 8

## The two questions about their own climb

1. **S04 Beat B, "And you? Tap where you felt ready."** The respondent has just dragged the rookie to a pace on the switchback. Their own figure then appears at the trailhead as a bronze outline, and they tap once on the same track, or choose "Not yet" or "Rather not say".
   - *Why it's subtle:* it arrives as the second half of a question about someone else, costs one tap, and has no picture to compare themselves against.
   - *What it answers:* Adam's "3 years just right, or ready after a year and held back?" and the deck's Hindsight readiness question.
   - *Most revealing number:* the gap between the pace they set for others and the pace they lived.
   - *Kept to one question:* the follow-up that comes straight after (F2) names the rookie and their stop ("Ready at 18 months. What do they take on first?") with the forest rookie in the sheet header, so it cannot be read as a second question about the respondent.
2. **S08, "Roped to a different Advisor on day one. Where are you now?"** They drag their own bronze figure onto a ridge with five labelled stops.
   - *Why it's subtle:* it's a counterfactual with no recall, no episode and no names. The other Advisor is never drawn.
   - *What it answers:* Adam's "could you have been tagged to someone else and still succeeded?" and whether readiness depends on the luck of assignment. Its follow-up (F5) then turns to the next climber: what to guarantee every one of them.

**Nothing else asks about the respondent:**
- Business and class come from the link token. The row asking which AI tools are on their desk has been deleted. Tool access by business comes from the rollout register.
- S10's cairn rates today's route as the next climber will find it.
- S09 Beat B asks whether the lead trait is born or built, naming the trait ("Reading people (EQ): born with it, or built on the climb?"), not "your three".
- The learning sources Adam wanted "force-ranked for what taught you" are asked forward instead, as the four-zone vote for the next climber. That is a best-worst format, which the evidence says holds up better than a full rank.

## Adaptive map

There are five follow-up points and eight sheets. F2 and F3 always fire, each on one of their branches, and every branch costs the same one tap or one drag. F5 always fires, with wording that depends on the rope answer. F1 and F4 fire only on the answer Adam named. A typical respondent sees three or four sheets, and at most five.

| Id | Trigger | Branch → sheet | Prompt (≤12 words) | Options | Stores |
|---|---|---|---|---|---|
| **F1** | S02: Classroom packed (Green) or in the hand (Blue), checked on Continue | → F1 (drag the door) | "Attendance runs low. Make classroom mandatory?" / "Drag the door: shut, ajar or open." | Mandatory, no exceptions · Mandatory, client first · Optional, on demand | `classroom.mandatory` |
| | | not chosen → skip | | | |
| **F2** | S04 Beat A pace (asked after Beat B) | < 36 months or "When proven" → F2a (drag the rookie) | "Ready at {stop}. What do they take on first?" | Run a review alone · Pitch a prospect · Work names cold · Own a small book · Win a commitment | `pace.readyFor` |
| | | 36 or 48 → F2b | "Held to {stop}. What can't be rushed for them?" | A market cycle · Client trust · Product breadth · Their own confidence | `pace.cantRush` |
| **F3** | S05 lane of the Expedition brief | Day one → F3a | "Agents on day one. What must they master first?" | By hand, once · Spot a wrong answer · Write a sharp brief · Nothing, learn by doing | `kit.agentsFirst` |
| | | Once proven → F3b | "What earns them the agent team?" | A certification · Advisor's sign-off · Time served · A clean track record | `kit.agentsEarn` |
| | | Not for them → F3c | "Why keep agents off their kit?" | They'd stop learning · Can't trust the output · Clients won't accept it · Not their job yet | `kit.agentsWhyNot` |
| **F4** | S07 `calls.certify.answer === 'policy'` (checked after all four cards) | → F4 (drag onto the plaque) | "How should they earn the pass?" | Avatar role play · Written test · Practical case test · Observed live by Advisor · Client feedback | `certify.how` |
| | | `'drop'` / `'unsure'` → skip (Adam's rule) | | | |
| **F5** | S08 `self.ropeCounterfactual` | 1–3 or null → F5, variant A | "Then guarantee every climber one thing." | A named mentor · Debrief after meetings · Pre-meeting hypothesis review · A set speaking role · A named ECM check-in · Protected Advisor time | `guarantee`, `guarantee.variant` |
| | | 4–5 → F5, variant B | "Your rope held. Guarantee that for everyone: one thing." | same six | same |

The S01 fallback (business and class, two taps) appears only if the link token lacks them. People Analytics issues tokens carrying both, so it should never fire at launch.

**Rule tests.** The JSON carries `ruleTests`, one case per branch, including `certify: 'policy' → F4` and `'drop'` / `'unsure'` → no sheet. The S07 stored value and the F4 rule use the same vocabulary (`'policy'|'drop'|'unsure'`). Run these as unit tests against the rule engine.

**Guarding against "say no to finish faster"** (Eckman 2014):
- Every always-on follow-up costs the same on each branch.
- F4 appears only after all four storm calls are answered, so the extra sheet can't be learned card by card.
- F1 appears only after all eight placements on the board.
- Analysis compares certify and classroom yes-rates by card and tile position, and against a no-follow-up baseline if a pilot allows it.

**Staging checks (Adam's "ask it two ways").** These are computed quietly and never put to the respondent.

| Pair | Flag when |
|---|---|
| S02 Green/Blue vs S06 zone | A packed item's paired pitch (portfolio, outreach, prep) sent to "Kit drafts" or "Base-camp crew" |
| S02 Red vs S06 own feet | "CRM & admin" on the tarp but "Meeting notes & CRM" on their own feet |
| S05 Expedition brief lane vs S07 `agents` | Brief in "Not for them" but agents by year two = policy |
| S04 "When proven" vs S07 `certify` | Pace "When proven" but certify = drop |
| S07 `certify` vs F3b | Certify = drop but "A certification" earns the agent team |
| S02 classroom vs F1 | Packed as Green but "Optional, on demand" (worth reading, not an error) |
| S08 rope vs S02 Blue | Rope = "Right here" but "Debrief with Advisor" is the Blue item |
| S04 self vs pace | Felt ready at ≤18 months but recommends ≥36, or the reverse |

"Onboarding & ops" against "Onboarding paperwork" is not a pair: wanting ops exposure is compatible with automating the paperwork.

Seconds per screen are logged. Any screen finished in under 25% of its median time is flagged, and so is a respondent whose four storm calls all went the same way.

## Coverage table

| Requirement | Screen(s) |
|---|---|
| **D1** More often or earlier | S02 Green/Blue · S04 pace + F2a · S05 Day-one lane |
| **D2** Developmental value vs getting work done | S02 (Green vs Red on one tray, with real low-value tiles) · S06 zones (own feet vs crew) · staging check S02 vs S06 |
| **D3** Experience, exposure, feedback, coaching built in | S03 signpost (with "seen, done or led") · S02 items (debrief, role plays, classroom, meetings) · F1 · S07 `certify` + F4 · F5 |
| **D4** Reduce, automate, reassign, redesign | S02 Red (free them of it) and Amber (keep, but re-rig) · S06 "Kit drafts" (automate) and "Base-camp crew" (reassign, self-serve or eliminate) |
| **D5** Role, manager routines, operating model | S04 pace · S05 lanes + F3b (how AI access is earned) · S07 `certify`/`agents` · S08 + F5 (manager routines: debrief, hypothesis review, ECM check-in) · S10 cairn |
| **D6** Reps that stay human even when AI can do them | S05 lanes + F3a/F3c · S06 own feet |
| Deck capability areas 1–6 | S02 gear: 1 meetings · 2 portfolio, present · 3 outreach · 4 prep · 5 onboarding & ops · 6 debrief (area 6's "review AI work" sits in F3a "Spot a wrong answer" and S06 "Kit drafts, they check") |
| Vote: GREEN ×3 | S02 rucksack "More of it" |
| Vote: BLUE ×1 | S02 hand "Speeds them most", chosen independently of Green |
| Vote: RED ×2 | S02 tarp "Free them of it" |
| Vote: AMBER ×2 | S02 bench "Keep, but re-rig" |
| Wrap-up 1 "do more of…" | S02 Green |
| Wrap-up 2 "less time on…" | S02 Red |
| Wrap-up 3 "no one graduates without…" | S03 (the helper asks for seen, done or led, which gives sufficiency) |
| Wrap-up 4 "one change…" | S10 Beat B |
| Deck: missing activities are findings | S10 Beat B ("Or anything we didn't ask") |
| Deck Pulse Check | S10 cairn (read as a peak-and-end impression) · S02 Blue (accelerator) · S02 Red (non-value-add work) |
| Deck Hindsight: readiness | S04 Beat B (self 1) · F2a |
| Deck Hindsight: preparedness (where capabilities came from) | *Partial:* S09 born / built for the lead trait |
| Deck Hindsight: surprises as VP | *Partial:* F2a "Win a commitment" (a deck surprise) and the F2a options left unpicked. The two-question cap rules out asking it directly |
| Deck Experience + readiness checks | S03 · S07 `certify` + F4 |
| Deck Access: guarantee centrally, luck, simulations, ECM | S08 + F5 (always on; includes "A named ECM check-in") · S07 `aiclient` |
| Deck Coaching | F5 (pre-meeting hypothesis review, set speaking role, debrief) · S02 "Debrief with Advisor" · *Partial:* nothing asks what made feedback useful |
| Deck Overseeing AI / form a view first | S05 + F3a · S06 own feet |
| Deck Developing intuition / new skills | F3a ("Write a sharp brief", "Spot a wrong answer") · S06's four zones are the deck's own four categories |
| Deck Re-focusing released capacity | S07 `freedtime` ("Freed time, bigger books"): *partial*, a policy call on the main alternative rather than a full split |
| Adam: warm intro, "you've been successful" | S01 |
| Adam: focus on the future | Every screen except S04 Beat B and S08 |
| Adam: sliders you drag | S04 (the rookie is the thumb) · S08 (you are the thumb) · F1 (the door) |
| Adam: drag to rank | S09 Beat A |
| Adam: what accelerated / learning sources (morning meeting, meetings, observing, ops, classroom, role plays) | S02 gear: meetings, morning, ops, classroom, roleplay, as best-worst · self-learning via F1 "Optional, on demand" |
| Adam: more classroom → "none of you show up, mandatory?" | F1 |
| Adam: certified? yes → how (role play, test, practical); no → skip | S07 `certify` → F4 |
| Adam: avatar role plays mandatory | F4 "Avatar role play" (asked after a yes to certification, as Adam framed it) · S07 `aiclient` |
| Adam: managers of agents | S05 Expedition brief + F3 · S07 `agents` |
| Adam: compress on skills / minimum time / own pace | S04 (including "When proven") + F2b |
| Adam: ready after a year → ready to do what? | S04 (both beats) + F2a |
| Adam: innate vs learned, EQ, hunter | S09 tiles ("Reading people (EQ)", "A hunter's drive") + Beat B |
| Adam: stack-rank the traits of a great private banker | S09 Beat A |
| Adam: tagged to someone else | S08 |
| Adam: scaling (too few amazing people, or too much else going on) | *Derived:* the S08 distribution (what share would be "about here" with any Advisor) read with F5 "Protected Advisor time". Not asked as its own question |
| Adam: mark to market | S10 cairn |
| Adam: training at scale | S07 `aiclient` · F1 "Optional, on demand" |
| Adam: what the future role looks like | S05 + S06 + S07 `agents` |
| Adam: re-ask to catch staging | Staging checks (silent) |
| Adam: images, a little humour | Pictured choices on every main mechanic · at most one wink per screen (F1 "Attendance runs low.", S07 "Storm coming.") |
| Adam: anything else | S10 Beat B |

## Art list

**Style (one hand throughout):**
- Flat-fill engraving on a 64×64 grid (bricks are 72×30), with a 1.5px ink `#0D0C0B` outline.
- One accent fill per object, from navy `#14233B`, bronze `#7A3E12` or forest `#1F4B3A`, on paper `#F8F7F4`. These are the `globals.css` tokens. When reusing `ActivityArt.tsx`, move its slightly different hexes onto these tokens.
- No gradients, no facial features, and no text inside art except brick labels (set in Archivo).
- Choices on the same screen share one accent, so no option looks more attractive than another. All six bricks are the same navy.
- Figures are adapted from the `survey.ts` climber. Motion is SVG transforms on that one figure, never frame sets.
- The deck's vote colours map to forest (Green), navy (Blue), bronze (Amber) and ink (Red). No new colour token is needed.

**Budget:** 69 entries. 53 are new drawings. The rest are 1 adapted from `survey.ts`, 9 derived from other pieces (recolours, crops, composites), 4 existing `ActivityArt` pieces, and 2 drawn in code. That is inside the cap of 60 new drawings.
- **Ships in v1:** everything below. Draw in table order. The eight trait pictures come last: until they are drawn, S09 runs on labelled tiles, which is the only planned fallback.
- **Not in v1 (after the pilot, only if it asks for them):** picture glyphs for the follow-up sheets (they run as text chips), the "enough" chips, fate tags, summit-log stamps, freed-day destinations, and any animation frame sets.
- **Cut from the first final design:** 39 follow-up glyphs, 4 enough chips, 3 fate tags, 4 stamps and a logbook page, 6 freed-day pieces, the scenarios pitch, the specialists, headlamp and blank-tag gear, the avatars card, and the frame-set animation.

**Scenes** (5)

| id | brief | status | release |
|---|---|---|---|
| `scene-basecamp` | Base camp at first light: moraine, one canvas tent with the flap open, the mountain.ts ridge as an ink hairline behind the prompt, a faint pencil route up the face. The ground plane holds every object. | new | v1 |
| `scene-camp1` | Switchback face carrying the vertical slider track; a wooden signpost at the camp edge. Paper warms slightly toward dawn. | new | v1 |
| `scene-camp2` | Rock shelf on a col holding the base-plate ledge; the route strip above it; cloud building on the far ridge. | new | v1 |
| `scene-camp3` | Wind-cut ridge for the storm calls, the rope and the cairn. | new | v1 |
| `scene-summit` | Narrow summit at dawn (paper warmed to --color-dawn): a flat rock for the kit, a small table with two chairs. | new | v1 |

**Characters** (4)

| id | brief | status | release |
|---|---|---|---|
| `rookie` | The next climber: faceless, forest jacket, pack, hat: the survey.ts climber at 3x. Stride, crouch-and-rise, open hand and set-down are SVG transforms on this one figure (limb groups rotated), not frame sets. | adapt survey.ts | v1 |
| `you-bronze` | The respondent: the rookie recoloured to a bronze jacket. Solid (S08 thumb) and outline-only ghost (S04 Beat B). Appears only on the two self-questions. | derive from rookie | v1 |
| `porter` | Base-camp crew: a plainly human figure with a wooden load frame, ink and forest, faceless. Nothing navigational on it. | new | v1 |
| `client` | Client at the summit: long navy coat, rising from the table, one hand offered. | new | v1 |

**Props** (7)

| id | brief | status | release |
|---|---|---|---|
| `kit-rack-covered` | The six brick silhouettes under a canvas cover inside the tent flap (S01). | derive from bricks | v1 |
| `rucksack` | Open rucksack with three pocket slots (forest outline); zipped state. | new | v1 |
| `hand-zone` | The rookie's gloved open hand, one slot (navy outline); closed state. | new | v1 |
| `tarp-out` | Folded canvas tarp on the ground, two slots, ink outline (the deck's Red). | new | v1 |
| `bench-rerig` | Workbench with a spliced rope, two slots, bronze outline (the deck's Amber). | new | v1 |
| `signpost` | Carved wooden signpost with one arm; letters set in bronze. | new | v1 |
| `luggage-tag` | Card luggage tag on a string, tied to the rucksack strap. | new | v1 |

**Gear** (12)

| id | brief | status | release |
|---|---|---|---|
| `gear-binoculars` | Binoculars (Sit in client meetings). | new | v1 |
| `gear-leadrope` | A coiled lead rope held out (Present to clients). | new | v1 |
| `gear-crampons` | Crampons (Portfolio analysis). | new | v1 |
| `gear-flare` | Signal flare (Prospect outreach). | new | v1 |
| `gear-bootlaces` | A boot with its laces being tied (Prep the meeting brief). | new | v1 |
| `gear-stove` | Camp stove and fuel can (Onboarding & ops). | new | v1 |
| `gear-logbook` | Logbook and pencil (Debrief with Advisor). | new | v1 |
| `gear-thermos` | Thermos with a small clock face at 7:30 (Morning meeting). | new | v1 |
| `gear-manual` | Bound field manual (Classroom training). | new | v1 |
| `gear-boulder` | Practice boulder with two small roped figures (Role plays). | new | v1 |
| `gear-forms` | A clipboard of forms in a dry bag (CRM & admin). | new | v1 |
| `gear-polish` | A boot-polish tin and brush (Deck formatting). | new | v1 |

**Tracks** (3)

| id | brief | status | release |
|---|---|---|---|
| `track-switchback` | Vertical switchback with six tent stops (12 to 48 months), a small cairn marked 'Today' at 36, a brass 'When proven' tag beside it, and a trailhead ledge below the scale. | new | v1 |
| `track-ridge` | Horizontal ridge with five stops and a ledge below where the figure parks. No other imagery. | new | v1 |
| `bootprints` | Bootprint in two states: solid ink (walked) and pencil ghost. Also used on the three camp-walk strips. | new | v1 |

**Navigation kit** (10)

| id | brief | status | release |
|---|---|---|---|
| `brick-map` | 2x4 brick, 72x30, navy accent: a folded map with a pencilled route. Studs as ellipses with a flat highlight band. | new | v1 |
| `brick-compass` | 2x4 brick, same navy: a baseplate compass. | new | v1 |
| `brick-guidebook` | 2x4 brick, same navy: a guidebook with a ribbon marker. | new | v1 |
| `brick-gps` | 2x4 brick, same navy: a handheld unit showing a pin. | new | v1 |
| `brick-radio` | 2x4 brick, same navy: a field radio, antenna up, screen showing a cloud. | new | v1 |
| `brick-brief` | 2x4 brick, same navy: a clipboard with weather glyphs, a route line and timings. | new | v1 |
| `baseplate` | Forest-green rock-ledge base plate, two lanes of six stud rows each, lane heads in Archivo. Nothing printed on its face. | new | v1 |
| `crate` | Narrow wooden crate, 'Not for them', one column wide. | new | v1 |
| `route-layers` | The route ahead at four precisions (pencil; dotted; dotted with waypoint ticks; dotted with weather glyphs and times), drawn in code as stroke styles on one path. | procedural | v1 |
| `strap-kit` | The Day-one bricks at 24px clipped to the shoulder strap (S11). | derive from bricks | v1 |

**Pitches** (5)

| id | brief | status | release |
|---|---|---|---|
| `reviewpack` | Framed chart pack (Portfolio analysis). | existing ActivityArt | v1 |
| `clientmail` | Envelope (Prospect outreach draft). | existing ActivityArt | v1 |
| `pitchbook` | Bound book (Meeting brief). | existing ActivityArt | v1 |
| `onboard` | Folder of forms (Onboarding paperwork). | existing ActivityArt | v1 |
| `pitch-crmnotes` | Notepad with ticks beside an index card (Meeting notes & CRM). | new | v1 |

**Pitch zones** (4)

| id | brief | status | release |
|---|---|---|---|
| `zone-ownfeet` | Composite: the rookie with boots prominent and a two-slot rucksack, no instruments. | derive (composite) | v1 |
| `zone-withkit` | Composite: the rookie with the map and compass bricks on the strap. | derive (composite) | v1 |
| `zone-kitdrafts` | Composite: the brief brick's clipboard on a rock; the rookie reading through a hand lens. | derive (composite) | v1 |
| `zone-crew` | Composite: the porter by the tent with an empty load frame. | derive (composite) | v1 |

**Storm calls** (5)

| id | brief | status | release |
|---|---|---|---|
| `card-certify` | A closed meeting-room door with a small blank brass plaque. | new | v1 |
| `card-aiclient` | Split frame: an indoor climbing wall on the left, real rock on the right. | new | v1 |
| `card-agents` | A small figure holding a clipboard, three field radios on the belt. | new | v1 |
| `card-freedtime` | A bronze sun disc over two paths: one to a ledger with extra ribbons, one to a practice boulder. | new | v1 |
| `snow-overlay` | Hachure snow streaks at four densities, drawn in code. | procedural | v1 |

**Traits** (11)

| id | brief | status | release |
|---|---|---|---|
| `trait-reading` | Two seated figures, one leaning in, a lantern between them. | new | v1 (draw last; labelled tiles until drawn) |
| `trait-hunter` | A flag on a far ledge with footprints heading to it. | new | v1 (draw last; labelled tiles until drawn) |
| `trait-calm` | A figure standing square in slanting snow. | new | v1 (draw last; labelled tiles until drawn) |
| `trait-depth` | Rock strata in four layers. | new | v1 (draw last; labelled tiles until drawn) |
| `trait-story` | A bar chart whose top line becomes a footpath. | new | v1 (draw last; labelled tiles until drawn) |
| `trait-bounce` | A rope catching a short fall at a carabiner. | new | v1 (draw last; labelled tiles until drawn) |
| `trait-judgement` | A balance scale, slightly tipped. | new | v1 (draw last; labelled tiles until drawn) |
| `trait-curiosity` | An unmapped corner of a map with one question-mark contour. | new | v1 (draw last; labelled tiles until drawn) |
| `rope-clips` | A rope strung across the stage with three numbered carabiners (also F5's single clip). | new | v1 |
| `origin-seed` | Swipe-edge glyph: a seed (Born with it). | new | v1 |
| `origin-bootprint` | Swipe-edge glyph: the walked bootprint (Built on the climb), same finish as the seed. | derive from bootprints | v1 |

**Summit** (1)

| id | brief | status | release |
|---|---|---|---|
| `cairn-stone` | Flat stone with five stack positions on a cairn. | new | v1 |

**Follow-ups** (2)

| id | brief | status | release |
|---|---|---|---|
| `fu-door` | Classroom door in a frame, brass latch: one drawing, rotated to shut, ajar (a client chair visible beyond) and open (F1). | new | v1 |
| `fu-plaque` | Close-up of the blank brass plaque from card-certify, one drop slot (F4). | derive from card-certify | v1 |

## Fun and feel

- **Transitions.**
  - Between camps the camera pans up the mountain after the respondent walks the rookie up the camp-walk strip. The ridge layers move with parallax over 600ms ease-out-expo, and the next tent in the top bar fills. The rookie is already standing where the respondent left them. Only the camera moves.
  - Within a camp only objects move.
  - Follow-ups rise as half-sheets (280ms) and don't move the camera.
  - `prefers-reduced-motion`: crossfades only, and the climber jumps between positions instead of walking.
- **Micro-interactions.** Each one responds within 100ms and happens because of the respondent's own action.
  - Pick-up: the item lifts (scale 1.06, soft ink shadow) and valid zones outline in their colour.
  - Drop: a 180ms spring. Dropping on an occupied slot swaps the two tiles. Dropping on a full zone's body bounces back with a 2px shake.
  - The board: the rucksack zips on its third item, the gloved hand closes on the Blue item, the tarp folds over, and the bench shows a spliced rope.
  - Lego: a stud click on each snap. An unsupported brick wobbles once over empty studs, and the route strip redraws.
  - Sliders: a boot-crunch tick at each stop, with footsteps inking in behind the climber. The F1 door creaks through three positions on the same slider component.
  - Pitches: the rookie crouches and rises under an own-feet load, and the strap strains on a third.
  - Storm calls: snow thickens card by card, an ink stamp lands as each card leaves, and the storm clears after the last.
  - F4: the chosen method settles into the brass plaque. F5: the chosen guarantee clips onto the rope.
  - Signpost: words carve in as typed. Cairn: stones settle with a small clack.
  - Sound is off by default. Haptics (`navigator.vibrate`) work on Android and fail silently on iOS.
- **Neutral reactions.** No animation rewards a particular answer. "Own feet" and "Base-camp crew" get equal motion, all bricks share one colour, born and built trade sides at random, and the storm clears the same way whatever the calls were. The game provides the fun, and the answers stay unbiased.
- **Tone.** Peer to peer, with at most one dry wink per screen. No exclamation marks, no cartoon faces, no confetti, no score, no archetype badge.
- **Summit payoff (S11).**
  - Dawn light reaches the ridge.
  - The rookie climbs with the respondent's own kit: three items packed, the Blue item in hand, the Day-one bricks on the strap.
  - The route ahead is as sharp as those bricks allow.
  - The respondent drags them up the last pitch. The kit is set down on a rock, and the client stands up and takes the climber's hand.
  - One line: "They came to meet you, not the map." Then the small "Their kit" card and a thank-you.
- **Build notes (buildable this week in Next.js/React at 390×660):**
  - **First step.** Read `node_modules/next/dist/docs/` before writing any code, as `AGENTS.md` requires. This repo's Next.js has breaking changes.
  - **`useDrag`.** One hook built on pointer events, with `setPointerCapture`, `touch-action:none`, `-webkit-touch-callout:none` and `user-select:none` on the stage, and zone hit-testing via `getBoundingClientRect`. Long-press (450ms) cancels after 8px of movement. Its `selected` state also powers tap-then-tap and the keyboard path. It drives S02, S05, S06, S09 Beat A, the S10 cairn, F2a, F4 and F5.
  - **`RouteSlider`.** A path-constrained thumb: it projects the pointer onto sampled SVG path points and snaps to stops. It is `role="slider"` with `aria-valuetext` and a hidden native range. It drives S04, S08, the F1 door (an arc path), the three camp walks, and S11 in no-data mode.
  - **`SwipeStack`.** Buttons are the primary input. A swipe counts at 30% of card width or on a flick. It supports three exits (S07) or two with randomised sides (S09 Beat B).
  - **`BrickPlate`.** Two lanes of six rung slots plus the crate column, carried-forward ghosts, the support check (a rung is available if it sits in the same lane or an earlier one), and the "i" peek button on each brick.
  - **`Sheet`.** The half-sheet used by every follow-up.
  - **Rules.** One pure function per follow-up point, unit-tested against `ruleTests` in the JSON.
  - **Data.** A typed event log per interaction. Randomised orders and swipe sides are logged. Content lives in the JSON with stable ids, and the spec file is the source for it.
  - **Reuse.** `survey.ts` / `mountain.ts` for ridges and the climber, `ActivityArt.tsx` for four pitches, and the existing `Scene` loop, which idles when still.

## Total time

The per-screen seconds are re-estimated at the realistic rates the critic used: about 4s per drag from a tray already read, about 1s per label read, and 25–30s for a short typed line on a phone.

| Path | Estimate |
|---|---|
| Main screens S01–S11 | 317 s (6+64+27+22+52+38+22+12+30+32+12) |
| Three camp walks (net over a Continue tap) | +3 s |
| Always-on follow-ups F2, F3, F5 | +25 s |
| Conditional follow-ups (expected: F1 ~30% × 7 s, F4 ~60% × 8 s) | +7 s |
| **Typical** | **352 s ≈ 5:52** |
| Fastest (both lines left blank, F1 and F4 don't fire) | 306 s ≈ 5:06 |
| **Longest** (every sheet fires, both lines written) | **360 s ≈ 6:00** |

If a link token ever lacks business or class, the S01 fallback adds about 8 s. Tokens should carry both at launch.

A typical respondent meets about 16 answer prompts: 12 on the main screens (S04, S09 and S10 have two beats each) and 3 to 5 sheets. The first final design had about 21.

The invitation should say "about six minutes". The longest route now matches that exactly, with no slack. These are estimates from interaction counts and have not been tested. Before launch, time five Associates on an iPhone in Safari with the toolbar showing. If the longest route runs past 6:00, cut in this order:
1. S09 Beat B, born or built (−7 s). Innate vs learned would then rest on the tile labels alone.
2. The S07 `freedtime` card (−5 s). Re-focusing would then be uncovered.
3. The S07 `aiclient` card (−5 s). The deck's simulation question would then rest on F4 "Avatar role play".

## What changed after the critic's review

| Critic's gap | Severity | Fix in this revision |
|---|---|---|
| Longest path 6:35 and optimistic per-screen times; about 21 prompts | must | Re-timed at realistic rates. S02 and S03 merged into one board. S04's "enough" chips folded into the signpost helper. S13 removed. S11's cairn folded into the tag screen. The `skills` and `avatars` storm cards dropped (avatars now sits in F4, where Adam put it). The freed-day beat became one storm card. Fate tags, the write-in tile, the second text line and the F4 pitch sheets are gone. The scenarios pitch is cut. Longest is now 6:00, typical 5:52, and there are about 16 prompts |
| S13 "Issued to your desk" is a third self-question | must | Row deleted. Tool access comes from the rollout register by business. Business and class come from the link token, with a two-tap fallback on S01 only if the token lacks them |
| Red forced among good activities | must | The tray now carries "CRM & admin" and "Deck formatting" (plainly low-value) and "Onboarding & ops" (reads either way), replacing "Work with specialists" and "Self-learning modules". Self-learning is still covered by F1 "Optional, on demand" |
| S08 vocabulary mismatch, so F5 never fires | must | Zones carry `value: 'policy'|'drop'|'unsure'`. The store, the rule (`=== 'policy'`) and `ruleTests` all use it. Certify's follow-up is now F4 |
| 120 new SVGs is not buildable in a week | must | 53 new drawings, with a cap of 60. Follow-up sheets are text-only. Motion is transforms on one figure. The pitch zones are composites, and the route and snow are drawn in code. The v1 and after lists are named |
| Frame 390×844 overflows on iPhone Safari | must | Every screen is designed to 390×660 at 100dvh with no scroll, and each screen states its height budget. Bricks are 72×30, the crate is a narrow column, the route is a 60px strip, S02 tiles are 64px, and the S06 zones are 171×100 |
| S02 → S03 repetition; four drag-sorts in seven screens | should | One board with four zones. The drag-sorts are now S02 and S06, with the Lego plate between them |
| Follow-ups are "clicking boxes" | should | F1 drags a door, F2a drags the rookie, F4 drops onto the plaque, and F5 clips onto the rope. F2b and F3 stay as fast taps |
| Rating → text → form before the payoff | should | One screen (cairn, then tag), then the payoff |
| Camera moved the rookie between camps | should | Three camp walks: the respondent drags the rookie up a short pitch (+1 s each, paid for by the cuts) |
| F2 read as a third self-question | should | "Ready at {stop}. What do they take on first?" with the forest rookie in the header. F2b says "for them" |
| F4a named the inconsistency to their face; the ops pair isn't a contradiction | should | No live consistency sheet. All pairs are checked silently, and the ops/onboarding pair is dropped |
| `ladder.ts` mapping wrong | should | Map, compass, guidebook and GPS → `assisted`, brief → `briefed`, radio → `standing`. S06 zones are named as the clean mapping |
| S05 helper said "every six months" | should | "Camps from one year to four." |
| `self.ropeDependence` read backwards | should | Renamed `self.ropeCounterfactual`, with 1 = nowhere near and 5 = right here. The F5 variant rule is updated |
| S02 swap vs bounce contradiction | should | An occupied slot swaps. A full zone's body bounces |
| S08 card texts 8–9 words | should | 3–4 word Bodoni titles with one Source Serif sub-line |
| Brick colour ramp cued "higher is better" | should | All six bricks are one navy. The icon and row height carry the order |
| Long-press peek fights drag; no keyboard or tap path | should | Cancels after 8px. Callout and selection are off. An "i" button (Enter or ?) opens the same peek |
| Swipe right = "built" tilts answers | should | Sides are randomised per respondent and logged, and the buttons are the primary input |
| Guarantee and scaling asked of one branch; no ECM, feedback or surprises | should | Guarantee is always on (two wordings), with "Pre-meeting hypothesis review", "A named ECM check-in" and "Protected Advisor time" added. F2a gains "Win a commitment". Scaling is derived from the S08 distribution. What made feedback useful is still only partly covered, as the table says |
| EQ not on screen | should | "Reading people (EQ)" |
| "Held under a code" vs token pre-fill | should | The copy says pseudonymous and People Analytics. Every business × cohort cut needs at least 10, and S08 and F5 are suppressed in small cells |
| JSON schema drift | should | `art: null` where there is no art. Fate tags are removed. S10's mechanic is `stack+text` with a `stack` beat. Store names are identical in both files because the markdown is rendered from the JSON source |
