# The Ascent — the game layer

**What is wrong now.** The mountain never moves. `drawPlane` has exactly one offset, `shift = o.px * spec.parallax * w * 0.035`, it is horizontal, and it is driven by the mouse — so between screens the only thing that changes in the scene is `skyAt(t)` drifting a few RGB points, and on a phone `pointermove` only fires during a touch, so the canvas is a still image. The start screen is not a start: `page.tsx:55` renders `<Scene t={0} successor={0}/>` and `tForLevel(0, 9)` is also 0 with `successor` also 0, so the title and Level 0 are the same pixels and pressing "Begin the climb" swaps a centred column for a glass card and changes nothing else. Committing an answer produces a hue change and `.chip:active { transform: scale(.985) }`, a 1.5% change nobody perceives, across the roughly hundred taps in the instrument. And the swap itself is dead time: `<AnimatePresence mode="wait">` with a 0.42s exit and a 0.42s enter refuses to mount the incoming screen until the outgoing one has finished, while `FooterBar` sits outside `AnimatePresence` and already reads the new `level`, so for ~840ms the respondent sees "Finish the nine rounds" printed under the base-camp chips.

**The direction.** The mountain reacts to the button the respondent already presses. No new gesture is added anywhere — not one swipe, not one drag — so there is no new way for two respondents to mean different things by the same action, and every keyboard equivalent is the control itself rather than a parallel implementation that can drift. All the motion goes into the canvas, which is `aria-hidden`, has no hit targets and no text, and all of it overlaps reading instead of gating it. The one primitive that unlocks everything is a camera: `camY`, a vertical impulse that always decays back to 0, and `panU`, a persistent horizontal pan that scrolls the ridge past a climber who stays framed. Nine tents light one at a time behind him, which is the only thing this instrument is ever allowed to celebrate, because arrival is the one event that is a function of advancing rather than of what was chosen.

---

## The start

### First paint

`<main>` carries a CSS `linear-gradient(#0A1430, #2B4A86)` built from the same `skyAt(0)` values the canvas uses, so there is no flat navy flash before `dynamic(ssr: false)` mounts `Scene` — the canvas fades in over identical colours and there is no seam. The scene renders at `t = 0`: dusk, stars out, the climber standing at `u = 0.30` with his **headlamp off**. That needs a new `lamp` field in `DrawOpts`; today `mountain.ts:192` inlines `Math.max(0.18, 1 - o.t)`, which is already 1 at `t = 0`, which is why there is currently nothing to strike. Base camp's tent is drawn unlit at 12% on the near ridge at his feet, and eight more unlit tents trail up and to the right ahead of him.

The title screen is the one place in the product a render loop on load is allowed, because there is no answer to distort and nothing to wait for. `px` is driven by a slow sine, `px = Math.sin(now / 5200) * 0.6`, which keeps the frame delta above `Scene.tsx:47`'s `0.0015` idle threshold and keeps the parallax breathing without a pointer. After 45s with no pointer the amplitude decays to 0 and the loop parks, so a link opened at a desk and left open does not cook the battery. The existing `visibilitychange` handler already stops it in a background tab.

### Copy, in DOM order

> J.P. Morgan Private Bank

> **The Ascent**

> You're part way up. Someone starts the same climb in September.

> Twelve minutes, mostly tapping. Nothing is sent anywhere — your answers stay in this browser, and clear when you start again.

> **[ Begin the climb ]**

Eyebrow at 12px, `tracking-[0.3em]`, full `--color-ink2`, sentence case. Word-mark in Fraunces at 64px, 88px at `sm`. Premise at 17px `text-ink2`. The disclosure at **13px, full `--color-ink2`, no alpha, above the button**, present at opacity 1 on frame one. Today it is `text-ink2/45` at 12px, which composites to roughly 2.96:1 on the dusk sky and fails WCAG 1.4.3, and `rise(1.15)` lands it at 1850ms — 400ms *after* the affordance it is meant to justify. A confidentiality promise the respondent has not seen is a promise that is not doing its job, and two screens later this instrument asks an analyst to say on the record that their desk needs fewer analysts. Consent is never animation-gated and never ranked below the button.

### What moves before the tap

Three beats, not the current six. Beat A at 0.10s: eyebrow and word-mark rise together. Beat B at 0.35s: the premise. Beat C at 0.60s: the button. Each 0.45s, `ease: [0.16, 1, 0.3, 1]`. Everything at rest by ~1.05s, down from 1.85s. The disclosure is in no beat.

The button carries `pointerEvents: 'none'` until `onAnimationComplete`. Today it is a `motion.button` at opacity 0 and is clickable and focusable from frame zero, so a returning respondent who knows what this is can tap empty space at 200ms and land in the form.

### The door — 700ms, gating nothing

| Time | What happens |
| --- | --- |
| 0ms | `begin()` fires. Store sets `started`, `startedAt: Date.now()`, `enteredAt: Date.now()`, and emits `begin`. Scene receives `kick = +1` and `kickY = 90`. |
| 0–120ms | The button's own gold fill expands from the tap point into a full-bleed wash at 0.22 alpha and back out. It doubles as the cover for the title→level swap, so nothing is ever seen half-changed. |
| 0–320ms | Level 0's card is mounted, hit-testable and focused at frame one, fading up over 320ms starting at 60ms. No translate — that card contains 44px targets. |
| 60–320ms | The headlamp strikes: `lamp` 0 → 1 over 260ms with one 40ms dropout at 90ms. The spec puts this at "Level 1 opens"; it is better spent on the one irreversible gesture in the product. |
| 0–700ms | The camera. A `camY` impulse of 90px decaying to 0 over 700ms ease-out-expo, multiplied per plane by `spec.parallax`: far ridge 11px, ridge 1 23px, ridge 2 41px, near ridge 65px, foreground 90px, stars at `camY * 0.06` for 5px. |
| 0–700ms | `lit[0]` eases 0 → 1 and holds: base camp's tent warms to `T.goldLight` at 0.55 alpha with a 26px radial pool on the snow. |
| on mount | The live region announces "Camp one of nine. Base camp." |

The rule the whole game runs on is taught in that one second, before a single answer is at stake: my action moves the mountain. The identical function then runs eight more times at a 56px throw over 600ms.

### The store fix that ships in the same commit

`useStore.ts:44` sets `startedAt: Date.now()` at store creation and persists it; `begin()` at line 63 refreshes `enteredAt` and leaves `startedAt` alone. A door screen inserts an unbounded, respondent-controlled pause between those two moments, and a link that arrives by email at a desk gets opened and left open. `begin()` sets `startedAt: Date.now()`. Completion time is derived from `sum(timing[].ms)`, not `now - startedAt`, so a session resumed after two days does not report a completion time in days. `begin` is logged as its own event so title-view → begin is a separate drop-off point rather than a silent new numerator inside the abandon rate.

### The returning respondent

`started` is persisted and validated at `useStore.ts:77`, so someone who stopped at camp five is currently dropped cold into "The trials", possibly days later, with no re-orientation. Skip the form, not the door. Same screen, different state — the scene is already at `tForLevel(level)`, so the sky is visibly further toward dawn than they left it and five tents are already lit:

> **The Ascent**

> You stopped at camp five — The trials.

> **[ Continue the climb ]**

> Start again

"Start again" is a plain text link beneath the button; `reset()` already clears `started`. One tap, the same camera move into the screen they left. Log `resume` as its own event so a multi-session completion is distinguishable from a nine-minute one.

### Reduced motion

No travel: `camY` stays 0. The three beats collapse to opacity-only at 0.4× delay, which the current `rise()` already does correctly — keep it. The button's wash becomes a 100ms flat fill and out. The headlamp comes on as a state, not a flicker: `lamp` 0 → 1 over 250ms with no dropout, because a light coming on is a state change rather than motion. The base-camp tent lights as a 250ms opacity change. Level 0's card crossfades in over 120ms. The announcement is byte-identical.

### Seconds

About 3.5s of dwell, which the title costs today. The 700ms door adds nothing, because Level 0 is interactive underneath it the whole time.

---

## The climb between screens

What moves is the canvas, and only the canvas.

### Content: opacity only

`page.tsx:104` currently translates the content column `y: 26 → 0` over 420ms while every 44px target on the screen is hit-testable. A respondent who taps during the settle lands on the control above or below the one they aimed at, and on L1 and L3, where the options are stacked and adjacent, the neighbour is a substantively different answer. The translate goes. Incoming card: opacity 0 → 1 over 200ms, no `y`. Outgoing: `position: absolute`, opacity → 0 over 140ms, leaving over the top of the incoming one so it is never pushed down.

Drop `mode="wait"`. Drop `exit` as a gate. Debounce `next()` behind a 400ms `moving` flag in the store — it is unguarded today, so a second impatient tap on an already-`ready` level (the normal state after anyone uses Back) advances twice and writes `{ level, ms: ~150 }` for a screen nobody saw, which trips the spec's satisficing rule on a careful respondent. Key `FooterBar` on `level` or move it inside the swap, so the new hint can never print over the old content. Move `window.scrollTo({ top: 0 })` out of `next()` and `back()` (`useStore.ts:56, 60`, where it fires synchronously before the re-render, so on L0's five chip groups or L3's thirteen activities you watch the old content snap to the top and only then get replaced) into a `useLayoutEffect` keyed on `level`, after the swap.

### camY — a vertical impulse, not a camera position

On `next()` the store bumps a `kick` counter; `Scene` stamps `kickAt = performance.now()` and `kickDir = +1`, and `back()` sets `-1` so descending reads as descending. Each frame:

```
const u = clamp((now - kickAt) / 600)
const e = 1 - Math.pow(2, -10 * u)
camY = kickDir * 56 * (1 - e)
```

Every plane offsets by `camY * spec.parallax`: far ridge 0.12 → 6.7px, ridge 1 0.26 → 14.6px, ridge 2 0.46 → 25.8px, near ridge 0.72 → 40px, foreground 1.0 → 56px. Stars offset by `camY * 0.06`. The ridge-2 mist band at `mountain.ts:155` offsets by `camY * 0.46` with its plane. The climber offsets by the near plane's 0.72 so figure and terrain stay welded.

`camY` is an impulse that always decays to 0, never a cumulative position. That is deliberate and it is the load-bearing decision in this section. A cumulative lift of eight × 56px would walk the ridges off the bottom of the canvas by level 8, and `line()` returns fractions of height so there is no terrain above to scroll into. As an impulse it is self-bounding, the composition at rest is identical on every screen — which matters, because `.glass` text lands on sky or on rock differently per viewport — and it reverses for free. One safety change: `drawPlane` closes its polygon at `h` (`mountain.ts:126, 128`); change both the `moveTo` and the closing `lineTo` to `h + 80` so a negative `camY` on Back can never open a gap under the foreground.

### panU — the pan that actually reads as travel

`climberU` already runs 0.30 → 0.64 across the nine levels, but the ridge underneath him never moves, so he slides along a static backdrop. Remap every `sample(l, x / w)` call inside `drawPlane` to `sample(l, (x / w) * VIEW + o.panU)` with `VIEW = 0.72`, and ease `panU` toward `0.035 * level` — 0 at base camp, 0.28 at high camp. The visible window is 72% of the generated terrain, so there is 28% of unseen mountain to scroll in from the right and `sample`'s clamp is never reached. The climber draws at screen `x = ((o.climberU - o.panU) / VIEW) * w + shiftN`, so he holds near the middle of frame — 0.42w at base camp, 0.50w at high camp — while the ridge scrolls past him.

Move `RIDGES[0].peak` from 0.62 to 0.72 and give `RidgeSpec` its own `sigma` field, set to 0.122 on ridge 0. The gaussian sigma is hardcoded at `mountain.ts:66` as `0.17` and shared with `RIDGES[1].peak = 0.30`, so editing the constant in place would deform ridge 1 as well. With that change, the main summit sits with its shoulder on the right edge at base camp and has swung fully into frame by level 8. The summit approaches. That single change does more for "I am climbing this" than the vertical lift does.

### Making 600ms a fact

`Scene.tsx:40-42` are frame-count lerps with no delta time. `s.tt += (s.t - s.tt) * 0.045` needs 66 frames to reach 95%: 550ms on a 120Hz ProMotion iPhone, 1.1s at 60Hz, 2.2s on a corporate laptop throttled to 30fps — and the throttled laptop is the environment the spec names as primary. The same transition is four times longer for some respondents than others. Capture `dt` from the rAF timestamp, clamp it to 50ms so a refocused tab does not jump, and use `k = 1 - Math.pow(1 - 0.045, dt / 16.67)` for `tt`, `ss`, `px` and `panU`. The `camY` kick already runs on an explicit ms duration. Extend the idle-out sum `d` at `Scene.tsx:39` to include `Math.abs(camY)` and `Math.abs(panTarget - panU)`, or the loop parks mid-move.

### The arrival

At 260ms into the 600ms move — so it lands as the camera settles rather than competing with it — `lit[level]` eases 0 → 1 over 400ms and holds. One `emit('camp', level)` from the store's `next()` drives it.

### Overlap

The incoming level's first interactive control is in the DOM, hit-testable and focused on the same frame as the tap. Only the canvas animates on a timer. `enteredAt` is set inside `next()` at tap time, so it measures from transition start rather than from interactive — a constant offset across every level and every respondent, which is acceptable precisely because it is constant. Do not let the footer button wait for the move to finish; that converts a constant offset into a floor and distorts the satisficing percentile. Net effect on the budget is negative: eight transitions × ~840ms of blocking removed is about 6.7s back.

### Reduced motion

`camY` stays 0 and `panU` jumps to its target in one frame rather than easing. The sky crossfades to the new `t` over an explicit 200ms — the same duration on every machine, which is itself an improvement, because today the canvas lerps are plain JS and are covered by neither the CSS rule at `globals.css:58-59` nor the `reduced` flag (which only zeroes the parallax `shift`), so a reduced-motion respondent gets the sky drifting for a hardware-dependent 0.5–2.2s while every piece of content cuts instantly. The two halves of the screen obey different rules today; after this they obey one. The newly reached tent still lights, as a 250ms opacity change. Content crossfades at 120ms with no `y`. Every announcement is byte-identical on both paths.

---

## The mechanics

No screen in this tranche gains a gesture. Every mechanic below is a change to what an existing button does when it is pressed, or to what the scene does afterwards.

### Every chip — press and commit

**Today.** `globals.css:44` is `.chip:active { transform: scale(.985) }`. Selection is `.chip[aria-pressed="true"], .chip[data-on="true"]` setting a gold tint, gold border and `--color-goldlight` text — hue alone. On L0's five chip groups, L5's Yes/No and follow-ups, and L3's clip chips, nothing but colour carries the state, which is a WCAG 1.4.1 failure as well as the author's "clicking a chip does nothing except change its colour".

**Becomes.** Two CSS rules, no JS, no per-level work.

```css
.chip { position: relative; padding-right: 26px; transition: background .15s, border-color .15s, transform .09s; }
.chip:active { transform: scale(.96); }
.chip[aria-pressed="true"]::after, .chip[data-on="true"]::after {
  content: ""; position: absolute; right: 8px; top: 50%;
  width: 7px; height: 7px; margin-top: -3.5px; border-radius: 999px;
  background: var(--color-goldlight);
  animation: chip-commit .14s cubic-bezier(.34,1.56,.64,1);
}
```

The `padding-right` is permanent and unconditional so nothing ever reflows when the dot arrives. The dot is a non-colour mark, which is what fixes 1.4.1; the overshoot is what gives the tap weight. Deselect plays the same curve in reverse at 90ms, quieter — taking an answer back should feel like a decision, not like an error.

**Gesture.** None. This fires on `[aria-pressed]` state, so it appears identically whether the state was set by tap, by Enter, by Space or by a screen reader's own activation.

**The invariant.** Amplitude is a value in the stylesheet, never a per-option prop. If "Hand it to an agent" thunked harder than "I do it", or if "They don't need to learn it — that's fine" landed flatter than the rest, the instrument would be nudging and the L3 contradiction data would be worthless. `page.tsx:66` already reasons this way about the successor climber; this makes it a rule with a test behind it (see *What this must not break*).

**Captured fields: unchanged.** No component logic is touched.

### Every screen — the camp line and focus

**Today.** `page.tsx:88-94` is a nine-segment gold bar marked `aria-hidden`, above `<div className="mt-2 text-[12px] uppercase tracking-widest text-ink2/60">{LEVELS[level].title}</div>`. The spec says "the environment itself is the progress bar. There is no separate progress bar", and it also bans all-caps labels. Because the bar is `aria-hidden` and the title is a bare `div` with no live region and no focus move, a screen-reader respondent gets no progress information through either channel. There is not one `aria-live`, `role="status"` or `role="alert"` anywhere in `src/` — grep returns zero.

**Becomes.** One polite `<Announcer>` in `page.tsx`, and in place of the all-caps title:

```jsx
<div role="status" aria-live="polite" className="mt-2 text-[14px] text-ink2">
  Camp {level + 1} of 9 · {LEVELS[level].title}
</div>
```

14px, sentence case. `Level`'s title becomes a real `<h1 tabIndex={-1}>` and receives focus on level change (WCAG 2.4.3, 4.1.3) — today focus stays parked on the footer Next button across a transition, so a keyboard respondent is dropped into the new screen from the bottom. The announcer carries state only, never answer content: "Five of five kept", never "You would hand Moving money to an agent". Reading choices back is how you get people editing for the instrument's benefit. Polite, never assertive — assertive interrupts mid-question.

The segmented bar stays in place until the last item in the build order, and comes out only after a device check.

**Captured fields: unchanged.**

### L6 Build the route — the refusal speaks

**Today.** `L6Route.tsx:18` is `if (used(years[y]) + brick(sel).units > YEAR_CAPACITY) return` — a bare return. No shake, no message, no announcement, no change of any kind. The respondent taps a full column and the app does literally nothing, which reads as a broken button rather than as a refusal. The column border only turns `--color-ice` when a brick is selected *and* fits (line 38), so a full column looks identical to an empty one whenever nothing is held. Bricks land as `<span role="button" tabIndex={0}>` nested inside the column's `<button>` (lines 34, 46-57) — invalid nested interactives. Height is already `22 * units` px but there are no studs, no seams and no shadow, so a 3-unit `book` brick is a taller rounded rectangle rather than three stud rows.

**Becomes.**

- **Refuse.** Set `refused = y` for 220ms. The column runs translateX `0 / -6 / +4 / -2 / 0` — three decaying oscillations. The brick stays in the palette. The `4/5` header flips to `5/5` in full-strength gold for the duration. One polite announcement: "Year two is full — five of five."
- **Land.** A placed brick runs a 180ms spring-in, `scaleY .88 → 1` on `cubic-bezier(.34,1.56,.64,1)`, and the year header ticks. That is the spec's "settles with a 180ms spring".
- **Studs.** A `repeating-linear-gradient` on the brick background drawing one 6px stud circle per 22px row along the left edge, so the 3-unit brick is visibly three stud rows next to the 1-unit `mm`. Three lines of CSS, no library, and it is what makes "five units a year" legible rather than arithmetic.
- **Seal.** A year reaching exactly 5/5 by a legitimate placement strokes its edge closed in gold over 300ms and announces "All five units placed in year two", so *full* and *refused* are visibly different events.
- **Nesting.** The column becomes `<div role="group" aria-label="Year 1, 3 of 5 units used">` containing an explicit "Place here" `<button>`, and each placed brick becomes a real `<button>` labelled "Remove Operations rotation from year 2".

**Gesture.** None. Tap a brick, then tap a year, exactly as written today. No dnd-kit, no drag. The refusal fires inside `drop()`, which is reached identically from pointer, Enter and Space, and the announcement is the same string on both paths.

**No red, no buzzer, no snow gust, and never the word "can't".** L6's payload is what gets left out, which means the data depends on respondents feeling free to try placements that fail. Feedback that reads as punishment suppresses attempts and pushes people toward the safe small bricks, and the left-out set then records timidity rather than priority. And nothing ever celebrates a full board — only a column seals. A game that rewards completeness deletes the measurement.

**Captured fields: unchanged.** `route.years: string[][]` is the same array of brick ids under the same `YEAR_CAPACITY` check. Nothing about the shake or the seal writes state.

### L4 The day that comes back — `give()`

**Today.** `L4Capacity.tsx:23-29`, `take()` only ever increments `c.after[id]`. There is no inverse anywhere in the file. `phase` is local state seeded from `sum(c.spend) === HOURS ? 2 : 1` (line 13), so Back and forward return you to phase 2 with `after` still populated and still unclearable, and the state persists through zustand `persist`. The only escape is `reset()` on the summit, which wipes every answer. The dots at lines 86-89 are 12px non-interactive `<span>`s inside one row-wide `<button>`, so you cannot choose *which* hour goes.

**Becomes.** Each pip is its own 44px `<button>`. Tapping a gold pip surrenders that specific hour; the pip detaches, rotates ~12° and falls out of the row over 180ms rather than recolouring in place, so "the desk took this" is an event rather than a CSS state. Tapping a surrendered pip takes the hour back — `take()` gains a matching `give()` — and it springs back into the row. Labels: "Give back an hour from Working a list of names, 2 of 3 remaining" and "Take that hour back". The remaining counter announces politely as it changes.

**The eighth-hour cap stays neutral.** Hitting `spent >= HOURS` in phase 1 is a *fill*, not a *refuse*: the counter pulses, the disabled control states why, and there is no shake, no gust and no red. The copy explicitly invites spending the whole day in one place ("The whole day can go in one place. Giving it back is a real answer."), and punishing concentration would teach within two taps that spreading is the right move. A flat allocation is the most useless shape this question could return.

**Gesture.** None. Pips are buttons, so this is keyboard-native by construction. The existing −/+ steppers in phase 1 are untouched.

**Captured fields: unchanged in shape.** `capacity.after{id: n}` under the same `CUT` ceiling. This is a correctness fix before it is a feel fix: today an unrecoverable mis-tap on the level's whole discriminating signal is exported as a considered preference and is indistinguishable from one. Tell the working group, because it affects any pilot data already collected.

### L7 Mark to market — ten stones

**Today.** `L7Mark.tsx:19` is `<input type="range" min={1} max={10} value={m.score ?? 5}>` while line 18 renders the numeral as `{m.score ?? '–'}`. The thumb sits at 5 before anything has been answered, so every respondent's first move is a nudge away from a midpoint they never chose. At 360px each of the ten steps is about 12px wide and drag-only — there is no way to tap "9", which is also a WCAG 2.5.8 target-size failure.

**Becomes.** Ten stones along a ledge, each an independently tappable 44px target, numeral above. **Until a stone is chosen nothing is selected: no thumb, no anchor.** The chosen stone lights gold and the ones below it fill, so the score reads as an altitude rather than as a slider position. Detents are correct here rather than distorting, because the variable genuinely is a 1–10 integer.

**Gesture.** None, and the keyboard path is strictly better than what it replaces: ten real `<button role="radio">` inside a `<div role="radiogroup" aria-label="The programme as it stands today, out of ten">`, each labelled "7 out of 10". Arrows move between them natively, each is individually focusable, and roving `tabindex` starts on the group with nothing checked.

**Captured fields: unchanged in shape, changed in distribution — and deliberately.** `mark.score` stays an integer 1–10 from the same setter and `validate.ts` already clamps it on hydration; `l7Ready` still requires `m.score !== undefined`. Removing the phantom thumb removes a midpoint anchor, and directly tappable notches remove the 12px motor bias pushing phone respondents toward the middle of the track. **Codebook line: score distributions before and after this change are not comparable.** That matters only if pilot data has already been collected.

### L2 The Advisor's job — no phantom 50

**Today.** `validate.ts` seeds `advisor: { top3: [], dependence: 50, changeTop2: [] }`, `L2Advisor.tsx:39` renders `value={a.dependence}`, line 19 computes `PHRASES.find(([n]) => a.dependence < n)![1]` unconditionally, and `l2Ready` at line 53 checks only `a.top3.length === 3`. So the slider renders parked at 50 with "Somewhere else, but fine." already showing, the footer unlocks without it, and a respondent who never touches the control is recorded as exactly 50 — indistinguishable in the export from someone who deliberately chose 50. This is the same defect as L7's `?? 5`, on the single most important number in the instrument, the one the spec crosses with mentor placement to detect the contradiction.

**Becomes.** `dependence?: number`. `emptyAnswers()` leaves it undefined; `validateAnswers` keeps it undefined unless a finite number is present, then clamps 0–100. Until it is touched: the track renders flat with no thumb, the phrase slot is reserved at its final height and empty, and `aria-valuetext` reads "Not answered yet". `l2Ready` becomes `a.top3.length === 3 && a.dependence !== undefined`, and the footer hint reads "Pick three, and answer the dial".

Rendering stays otherwise as it is: linear, 0 to 100, continuous, the native `<input type="range">` restyled and nothing else. **Do not build an arc dial** — it changes the value-to-gesture mapping, compresses the ends, and cannot be made to work at 360px, which would force a different geometry on phone than on desktop and split the distribution by device. **Do not snap at the four phrase boundaries** (20/45/65/85) — it would pile responses onto them and destroy the shape the mentor cross-tab depends on. Write both of those into the file as a comment.

**Gesture.** None. The native range is still the element; arrows, Home/End and PageUp/PageDown behave natively. One residual to handle explicitly: from the untouched state, a first arrow press would otherwise commit 49 or 51 off an invisible 50. Intercept the first `keydown` and commit exactly 50 without moving, announcing "Fifty. Somewhere else, but fine." — the keyboard respondent then has a deliberate, announced starting value rather than an invisible default, and can move from there.

**Captured fields: deliberately changed.** `advisor.dependence` becomes optional in the type and required by the gate. Nothing downstream reads a missing value today because there never was one; after this, an untouched dial is legible as untouched instead of as a considered 50. Flag it to the working group and add the codebook line, because it moves the mass at exactly 50 and therefore the whole distribution shape.

### L3 The Handover — undo, timing, and the reckoning gate

**Today.** `L3Handover.tsx:34` is `if (beat === 1 && i < ACTIVITIES.length - 1) setI(i + 1)`. `i` only ever increases, and beat 2 lets you see where the cards landed but not re-lane them, so a mis-tap on card 7 of 13 is permanently wrong on `handover.lanes` — the primary variable of the whole instrument — and the only escape is `reset()`. No per-card `ms` is captured at all. And `page.tsx:73` is `case 3: return beat === 3`, so the footer's Next goes live the instant the respondent lands on the reckoning, before they have answered it; `handover.reckoning` is silently `undefined` for anyone who taps through.

**Becomes.**

- A "Back one card" chip above the stack at beat 1, plus the existing `{placed} of 13 placed` tally. It decrements `i`, removes that activity from `lanes`/`notDone`, and increments `handover.undos`. Backspace on the focused card does the same. Ship undo before any gesture is ever considered for this screen — weight without reversibility is the one combination that must not ship, and this tranche is adding press weight to exactly the buttons that produce this variable.
- Per-card `ms`: `handover.ms[activityId]`, a `useRef` stamped on each `lane()` call and reset on the frame the next card renders.
- The gate becomes, in `page.tsx`:

```js
case 3: {
  const h = answers.handover
  const conflict = h.clips.filter((id) => h.lanes[id] === 'agent')
  return beat === 3 && (conflict.length === 0 || !!h.reckoning)
}
```

The `conflict.length === 0` term is not optional. `L3Handover.tsx:128-135` renders the no-conflict branch ("That's a clean answer. Carry on.") with **no reckoning control on screen at all**, so a bare `!!h.reckoning` would hard-lock every respondent whose clips do not intersect an agent lane. With the guard, requiring the field is safe: "They don't need to learn it — that's fine" is itself a valid out, so nobody with the control in front of them is trapped.
- The resolution beat is text, not light. On selection the unchosen framings recede to 40% opacity, the headline restates in the past tense — "So that's how they learn it." — and the footer label changes from "Next" to "Carry on". **Deliberately no change in the scene**: no tent, no sky step, no feedback above baseline amplitude. `page.tsx:66` already argues why the successor is withheld during the reckoning, and the argument holds for the whole feedback vocabulary, not only for the figure.

**Gesture.** None. Four outcomes cannot map onto three swipe directions, and swipe-up fights page scroll at 360px, so whichever lane owned it would be systematically under-recorded. The four lane buttons stay as they are.

**Captured fields: `lanes` and `notDone` unchanged; `reckoning` deliberately changed from optional to required where a conflict exists.** That shifts the denominator on any reckoning cross-tab, in exchange for closing a hole where the field goes missing entirely. `handover.ms` and `handover.undos` are new and nothing reads them yet; add both to `validate.ts`. Log undos rather than silently overwriting, so six undos read as indecision rather than as a clean answer. `reckoningText` stays optional.

### L8 High camp — the smallest moment, not the biggest

**Today.** `L8Summit.tsx` renders a glass card with five `<Row>`s, a 140-character textarea and, at line 57, `<button onClick={reset} className="chip mt-4 text-ink2">Start again</button>` — a gold-tinted chip sitting four lines under "The trap", the row that shows the respondent their own contradiction. The footer vanishes (`page.tsx:98`, `level < 8`). The sky is at `t = 1` but it crept there at 0.045 per frame, so the dawn already happened somewhere around level 7 and arrival looks identical to any other screen.

**Becomes.** The ninth tent lights with the other eight visibly lit below it — the whole trail readable in one frame, which is the actual reward and which comes free with the camps — and the camera kick is doubled to 120px so the last move is the longest one. No sun disc, no rotating wedge rays, no confetti. Two reasons, and the second is the real one. The rays are 25-plus lines of additive gradient work that this tranche is declining on budget. And twelve minutes have trained this respondent to read every piece of motion as a consequence of something they did, so a 1.6s orchestrated sunrise at the exact frame the card shows them their own contradiction is the most expensive place in the instrument to spend a flourish. The optional 140-character field sits directly under it, and if the sky draws the eye, that response rate drops. Nothing inside the card moves.

In the same commit, "Start again" is demoted to a 13px plain text link below the message box, with a confirm: "This clears your answers. Start again?" If the sunrise is ever funded, it belongs after that demotion, never before it. No share card, no export, no map back to a camp — a contradiction the respondent has been warned about and then allowed to revise is no longer evidence of anything, and an artefact with a firm logo on it turns a confidential instrument into a performance.

**Captured fields: unchanged.** `summit.message` only.

---

## The feedback vocabulary

One module, `src/lib/feedback.ts`, with the amplitude as a module constant and the neutrality rule written in at the top as a comment. Every option in a group gets the identical event at the identical amplitude.

| Event | Visual | Haptic | Sound | Duration |
| --- | --- | --- | --- | --- |
| **Press** — any 44px target, on touch | `transform: scale(.96)`, CSS only, replacing the imperceptible `.985` | none | none | 90ms |
| **Commit** — a selection becomes an answer | 7px `--color-goldlight` dot scales 0 → 1 with a 1.12 overshoot, in space reserved by a permanent `padding-right: 26px`; the existing colour change stays | none | none | 140ms |
| **Land** — a brick settles into a year | `scaleY .88 → 1` spring; the year header ticks | none | *later: 40ms stud-click* | 180ms |
| **Fill** — a local budget closes legitimately: L4's eighth hour, L3's fifth clip, L6's fifth unit | last meter segment lands 80ms late and overshoots 6%; on L6 the column edge strokes closed in gold; announced | none | none | 300ms |
| **Refuse** — over-capacity, and it exists on exactly one screen | column translateX `0 / -6 / +4 / -2 / 0`; the header flips to `5/5` in gold, never rope red; brick stays in the palette; announced | none | *later: 500ms filtered noise sweep* | 220ms |
| **Reach a camp** — the nine-times reward | 56px `camY` kick, 600ms ease-out-expo; the tent for the camp just reached warms 0 → 1 from 260ms; "Camp 5 of 9 · The trials" announced | none | *later: two soft sine notes a fifth apart* | 600ms camera, 400ms tent |
| **Summit** — once | the ninth tent lights with eight lit beneath it; 120px kick; nothing inside the card moves | none | none | 600ms |

**Sound is off by default and is not built in this tranche.** If it is ever funded it is synthesised in WebAudio rather than sampled, so the no-image-assets budget stays honest and the bundle gains zero bytes, the `AudioContext` is constructed lazily on the first user gesture after unmute or the autoplay policy leaves it suspended, and the toggle goes on the start screen and in a corner of the scene — **not in the `FooterBar`**, which already holds Back, a hint string and Next, and a fourth control at 360px produces mis-taps on Next, which advances a level and writes a timing record. Most respondents on a trading floor will never hear any of it, and a link opened at an open-plan desk that makes a noise is an abandonment event.

**Haptics are not built.** `navigator.vibrate` is Android and Chrome only and is unsupported in iOS Safari, which is the single most likely device, so building it would split the experience by platform for no measurement gain. The spec's only named use for it is month detents on the 36-month flag, which is on a screen this tranche does not change.

---

## Progress

The spec says the environment itself is the progress bar and there is no separate progress bar. `page.tsx:88-94` contradicts that directly with a nine-segment gold bar, and it is currently the only honest between-screen feedback in the product, which is why it cannot simply be deleted first.

Four channels carry progress after this work.

1. **The trail of lit tents.** `export const CAMPS = Array.from({ length: 9 }, (_, i) => 0.30 + 0.34 * (i / 8))` — the same `u` values the climber already occupies, so at rest he is always standing at his camp. Each tent is a filled triangle 11px wide and 9px tall plus two guy-line strokes, about fifteen lines of canvas, no assets. `lit: number[]` in `DrawOpts` eases toward `i <= level ? 1 : 0` over 400ms. The current camp burns at `T.goldLight` 0.55 alpha with a 26px radial pool on the snow; reached camps hold at 0.35 behind the climber; camps ahead render at `T.ink2` 0.12, which is what makes the mountain legible as a route rather than as scenery. You read how far you have come by looking at the slope and how far is left by counting the dark ones.
2. **The sky**, already continuous on `t` from dusk to dawn, and now noticeable because each arrival punctuates it instead of it drifting unmarked.
3. **The climber's position**, with `panU` scrolling the ridge past him and the main summit swinging from the right edge into frame.
4. **One line of text**, and it is not a second bar: `Camp 5 of 9 · The trials` in `role="status" aria-live="polite"` where the level title already sits.

The fourth is non-negotiable and it is the primary path, not a fallback. The tents live inside an `aria-hidden` canvas, so deleting the bar without the counter would leave screen-reader and reduced-motion respondents with nothing. Today the bar is `aria-hidden` and the title is a bare `div`, so those respondents already have nothing — the text line is a net gain for them, not a concession.

**Sequencing.** The tents ship first, additively, with the bar still in place. The bar comes out last, in a commit of its own, and **only after unlit tents at 12% alpha have been looked at on a real 360px phone in a bright room, with an actual go/no-go**. That gate is not an intention. If the tents are not legible there, the environment is not carrying progress and the bar stays. A respondent who cannot see the end is likelier to abandon, the spec caps abandon at 15%, and drop-off correlates with tenure and workload, so this is the one change in the programme that can cost sample rather than fidelity. Sequenced alone, any movement in abandon rate is attributable to it.

What stays: the local capacity meters — L4's eight hour pips, L6's `3/5` per column, L1's "Round 4 of 9", L3's remaining tally. Those are not progress through the instrument, they are the respondent's budget inside a screen, and removing them would break the mechanic.

What never ships: no score, no timer, no streak, no percentage complete, no leaderboard.

---

## Build order

Stop after item 3 and the author's complaint is answered: there is a start that does something, the mountain moves every time you act, and screens arrive instead of blocking.

1. **Make the timings real and unblock the swap — 3.5h.** `Scene.tsx`, `globals.css`, `page.tsx`, `useStore.ts`, `components/ui.tsx`. dt-based easing with `dt` clamped to 50ms; a `matchMedia` `change` listener replacing the once-at-mount `.matches` read at `Scene.tsx:21`; scope `globals.css:58-59` to transform-driven properties so opacity crossfades survive (the blanket 0.01ms kill will silently delete every animation built after this point); drop `mode="wait"` and `exit`; content opacity-only over 200ms with no `y`; debounce `next()` behind a 400ms flag; move `window.scrollTo` into a `useLayoutEffect` keyed on `level`; key `FooterBar` on `level`.
2. **The camera — 6h.** `mountain.ts`, `Scene.tsx`, `page.tsx`. `camY` impulse and `panU` in `DrawOpts`; per-plane Y offset by `spec.parallax`; 56px kick over 600ms ease-out-expo, signed so Back descends; `VIEW = 0.72` remap of every `sample()` call; `panU` easing to `0.035 * level`; a new `sigma` field on `RidgeSpec` with `RIDGES[0]` at `peak: 0.72, sigma: 0.122`; polygon close moved from `h` to `h + 80`; `|camY|` and `|panTarget - panU|` added to the idle sum.
3. **The door — 5h.** `Title.tsx`, `page.tsx`, `useStore.ts`, `Scene.tsx`, `mountain.ts`, `globals.css`. New `lamp` field; 120ms gold wash; 90px impulse; base-camp tent lighting over 700ms; Level 0 mounted and focused at frame one; title cut to three beats with the disclosure at full `--color-ink2` above the button on frame one and `pointerEvents: 'none'` until `onAnimationComplete`; CSS sky gradient on `<main>`; ambient title loop with the 45s decay. Same commit: `begin()` sets `startedAt: Date.now()` and emits `begin`; completion derived from `sum(timing[].ms)`; the resume state for a returning respondent.
4. **Chip press and commit dot — 1h.** `globals.css` only. Two rules, ~100 taps, and the 1.4.1 fix on L0, L3 beat 2, L5 and the L6 palette at the same time.
5. **The Announcer and focus management — 2h.** `page.tsx`, `components/ui.tsx`. One polite live region; `Level`'s title becomes `<h1 tabIndex={-1}>` and receives focus on level change; the camp line replaces the all-caps title. Bar stays.
6. **Nine tents — 3h.** `mountain.ts`, `Scene.tsx`, `page.tsx`. `CAMPS`, `lit[]`, the triangle and guy lines, the snow pool, the 260ms arrival flare. Bar still stays.
7. **L6 — the refusal speaks — 3h.** `L6Route.tsx`, `globals.css`. Shake, gold `5/5` flip, announcement, studs, 180ms land spring, column seal, and the nested-interactive fix.
8. **L4 `give()` and per-pip targets — 1.5h.** `L4Capacity.tsx`. Correctness before feel.
9. **L7 ten stones — 3h.** `L7Mark.tsx`. Radiogroup, nothing selected until tapped.
10. **L3 undo, per-card `ms`, reckoning gate — 1.5h.** `L3Handover.tsx`, `page.tsx`, `store/validate.ts`, `store/useStore.ts`.
11. **L2 dependence undefined-until-touched — 1h.** `L2Advisor.tsx`, `store/validate.ts`, `store/useStore.ts`.
12. **Verification — 2.5h.** `e2e/walk.mjs` plus a new `src/scene/__tests__/neutrality.test.ts`. The unit test asserting the object passed to `drawScene` is a function of `level` and of nothing inside `answers`. Repair `walk.mjs:47`, which reads the level title via `document.querySelector('.uppercase')` and will silently start returning `''` the moment that class goes. Then three passes at both 390×844 and 1280×900: default; `page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])`; and keyboard-only with no pointer events at all — all three asserting the same screens in the same order and a byte-identical response payload. Note for whoever picks this up: the existing harness is `puppeteer-core`, not Playwright.
13. **Delete the nine-segment bar — 0.5h.** `page.tsx`. Last, alone, and only after the device check in *Progress*.

**About 32 hours.** Items 1–3 are 14.5h of it.

---

## What this must not break

### Measurement

| Risk | Mitigation |
| --- | --- |
| The camera inflates every level's `ms`. `enteredAt` is set in `next()` at tap time, so animation latency lands inside the next level's duration, and `timing` feeds the satisficing rule. | The move gates nothing: the incoming card is mounted, hit-testable and focused on frame one. The added offset is constant across every level and every respondent, so the median and the 25% threshold shift together and the rule survives. Never let the footer button wait for the move — that converts a constant offset into a floor. |
| A second impatient tap during a transition writes `{ level, ms: ~150 }` for a screen nobody saw and flags a careful respondent as a straight-liner. | The 400ms re-entry guard in `next()`, item 1. This is a live defect today, not a new risk. |
| `startedAt` is persisted from store creation, so a link opened and left on a desk reports a completion time in hours, and a session resumed after two days reports one in days. | `begin()` resets `startedAt`; completion is derived from `sum(timing[].ms)`; `begin` and `resume` are logged as their own events. |
| Deleting the segmented bar raises abandonment in the middle of a twelve-minute instrument, and drop-off correlates with tenure and workload, so it biases who is in the sample. | The `Camp 5 of 9` line ships with the tents and stays even if the tents are perfect. The deletion is sequenced last, alone, and gated on a real 360px device check with a go/no-go. If anything here is A/B tested, it is this. |
| Celebration keyed to the content of an answer turns the instrument into an advocate — a lighter sky for one answer than another reads as approval on the screen that asks whether the respondent's own desk needs fewer analysts. | Illumination, weather, camps and particles are functions of `level` index only, enforced by the unit test in item 12. Amplitude is a module constant, never a per-option prop. The reckoning beat stays visually flat, as it is now. |
| L7's ten stones and L2's undefined dial move the recorded distributions. | Both are deliberate and both are improvements — a phantom thumb at 5 is an anchor, a 12px drag-only target is a motor bias, and an untouched 50 is exported as a considered 50. Each gets a codebook line saying before and after are not comparable, and both go to the working group rather than being slipped in. |
| The reckoning gate converts an optional field into a required one and shifts the denominator on any reckoning cross-tab. | Flag it. It is worth it because the field currently goes missing entirely for anyone who taps through, and the guard `conflict.length === 0 || !!h.reckoning` means nobody without the control on screen is ever locked. |
| L6's feedback suppresses attempts, so the left-out set records timidity rather than priority. | The refusal is physics, not scolding: gold not rope red, no error tone, no snow gust, never the word "can't". Nothing celebrates a full board; only a column seals. |
| L4's cap punishes concentration and flattens the primary allocation measure. | The eighth hour is a *fill*, never a *refuse*. |

### Accessibility

Every gesture's keyboard equivalent, in full: **there are no gestures.** Nothing in this tranche is pointer-conditional. The camera is triggered by the existing footer Next and Back buttons; the refusal fires inside `drop()`, reached identically by pointer, Enter and Space; the commit dot is bound to `[aria-pressed="true"]`, so it appears when a screen reader activates the control; L7's stones and L4's pips are real buttons, which makes them keyboard-native by construction rather than by effort.

**The rule for any future tranche that does ship a gesture: the drop target is the button.** You drag the card onto the same labelled element you would otherwise tap — no direction convention, no velocity threshold, no learned mapping. That makes the accessible path structurally identical rather than a second code path that can drift, and it is the only form of gesture a research instrument can safely carry. A direction-mapped swipe on `handover.lanes` is not acceptable at any point: four outcomes cannot map onto three directions, swipe-up fights page scroll at 360px so whichever lane owns it is under-recorded, and the error correlates with device and thumb size, which makes it a systematic shift rather than noise. Swipe on L5 is declined outright: `L5Trials.tsx:9` unconditionally rewrites `{ answer, followUp: [] }`, so an accidental horizontal flick on a vertically scrolling column silently destroys a completed branch answer on the two questions with real political cost inside the firm, with no undo, no confirm and no visible trace.

Focus moves to the new screen's `<h1 tabIndex={-1}>` on every level change, and the polite region announces the camp. Announce state, never content.

**Reduced motion is a designed path, not a subtraction.** The shipping test for every moment: name the information the motion carries, then name the static element that carries it when motion is off. If you cannot name the second, the moment does not ship — and the static variant is written in the same commit as the animation, never after.

| Moment | Reduced-motion form |
| --- | --- |
| Door | No travel. Wash becomes a 100ms flat fill. `lamp` 0 → 1 over 250ms, no dropout. Tent lights as a 250ms opacity change. Level 0 crossfades at 120ms. |
| Camp arrival | `camY` stays 0, `panU` jumps in one frame, the sky steps to the new `t` over an explicit 200ms. The tent still lights, as a 250ms opacity change — a light coming on is a state change, not motion, and it is the only arrival cue this respondent gets. The announcement is byte-identical. |
| Screen transition | Crossfade only, 120ms, no `y` on either side. |
| Press | Instant border brighten, no scale. |
| Commit | The dot appears at full size with a 100ms fade, no overshoot — the non-colour mark still carries the state. |
| Land | The brick appears in its resting place with a 100ms fade; the count changes. |
| Fill | Segments appear filled with no stagger; the column seal is drawn, not stroked; announcement unchanged. |
| Refuse | 150ms opacity flash on the gold `5/5` header, no shake; the announcement carries it. |
| Summit | The ninth tent lights; no kick. |

Two prerequisites for any of that to hold, both in item 1: the blanket rule at `globals.css:58-59` must be scoped to transform-driven properties, letting opacity through, or it silently deletes the entire vocabulary the moment it lands; and `Scene.tsx:21` must subscribe to `matchMedia` `change` rather than reading `.matches` once at mount, or a respondent toggling the OS setting mid-session keeps the old behaviour until reload and the canvas and the DOM disagree.

---

**Caveat, stated plainly.** This document is a code read. The dev server was not run, nothing was built, and no frame cost was measured on a device, so every hour estimate and every performance claim here is unverified. The two things most likely to be wrong: unlit tents at 12% alpha may not be legible on a 360px phone in daylight, which is why item 13 is gated on looking; and the seconds ledger below is a model, not a measurement.

**Seconds.** Saves: removing ~840ms of blocking across eight transitions, −6.7s; L7's directly tappable stones replacing a 12px drag, −4s (Fitts's-law reasoning, untimed). Adds: the reckoning gate converting an optional field into a required one, +8s; L2's dial requiring a deliberate touch, +3s; respondents who stop to watch the camera rather than reading through it, +2s; occasional use of L3's undo, +1.5s; L6's refusal producing retries where the silent no-op produced give-up, +0.5s. **Net +4.3s**, against the 710s median in `docs/reviews/ascent-summit-integration.md` — about 11m54s, inside the 720s ceiling read as a median and outside it for the slowest tenth, which was already true. The direction's own headline of −3.4s excluded the must-fixes; with them in, it is positive, and the honest number is the one above.
