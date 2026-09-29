# Architecture

This covers the current survey (v2), served at `/` and `/preview`. The survey's words and structure are data in one file. A small engine turns that data into screens, and one renderer per screen type draws each one. A few fixed interface labels, such as button states, live in the renderers.

```
src/v2/questions.ts                    the script: questions, options, follow-ups, play order,
        │                              welcome, section breaks, the 2031 scene, the ending
        ▼
src/v2/engine/flow.ts                  pure functions: which screen comes next, which
        │                              follow-ups an answer calls for, numbering, preview rules
        ▼
src/v2/engine/Player.tsx  ◄──►  src/v2/engine/store.ts        answers, position, timing and events,
        │                        (zustand, persisted in         kept in the browser
        │                         localStorage 'ascent-v2-v1')
        ▼
src/v2/render/<template>.tsx           one renderer per screen type, drawn inside
        │                              src/v2/V2Frame.tsx (the shared one-column frame)
        ▼
src/v2/engine/send.ts ──► POST /api/responses ──► src/v2/engine/collect.ts ──► $RESPONSES_DIR/*.json
```

## The script: `src/v2/questions.ts`

Each question is a typed `Question`:

- `id`: for example `q1.2`. The ids follow the working group's brief.
- `block`: the section. The five sections are named in `contract.ts`.
- `template`: which renderer draws it: `checklist`, `cards`, `trays`, `track`, `podium`, `bottle`, `months`, `stamp`, `text` or `scene`.
- `question`, `instruction`, `note`, `privacy`: the words on screen.
- `options` and `constraints`: what can be picked and how many. Examples are `pick: 2`, `min: 1, max: 2`, the cards to sort, the trays and their capacity, or the stops on a track.
- `followUps`: questions asked in place, on the same screen, after the parent is answered.
- `channels`: `phone`, `desk`, or both.
- `stores`: the key the answer is saved under.
- `measures`: which goal of the brief the question answers. It is never shown.

`PLAY_ORDER` lists the questions for each channel. The phone asks 18, a subset of the laptop's 25 in the same order. Section breaks are inserted wherever the section changes. The 2031 scene is a screen that sets up the questions after it; those questions repeat it as a grey note (`CONTEXT_2031`).

### Answer shapes

| Screen | Stored as |
|---|---|
| Tap one (including a follow-up drawn as a card or a stamp) | the option id, e.g. `'y2'` |
| Pick two, pick one or two, top N | option ids in pick order, e.g. `['coaching', 'morning']`. A podium that isn't finished stores `{ first, second, third }` by position. |
| An opt-out chip ("Not sure", "I'd rather not say") | its id as a string, e.g. `'not-sure'` |
| Cards, stamp, trays | card or tile id to answer id: `{ portfolio: 'by-hand' }` |
| The split card (3.2, today and 2031) | the 2031 row under the card id, today under `<card>.today`: `{ portfolio: 'ai-helps', 'portfolio.today': 'by-hand' }` |
| Track | a stop id, or an opt-out id |
| Months | a number of months, or `'when-ready'` |
| Bottle | jug id to hours: `{ coaching: 3, product: 5 }`. Jugs that were emptied again stay, with 0. |
| Text | note id to text |
| 5.6 (a sentence to finish) | `{ verb, pick }`, or `{ verb, text }` for "Something else…" |

### Follow-ups: the `when` mini-language

A follow-up's `when` is tested against its parent's answer:

| Expression | Fires when |
|---|---|
| `always` | the parent is answered at all |
| `is:a\|b` | the answer is one of these ids (or numbers) |
| `includes:a\|b` | the answer, a list, contains one of these |
| `lte:24`, `gte:36` | the numeric answer is at most, or at least, this |
| `card:<card>:a\|b` | that card or tile got one of these answers |

A malformed expression throws, so a typo fails the tests rather than silently hiding a follow-up. A follow-up cannot hang off another follow-up.

## The engine: `src/v2/engine/`

- **`flow.ts`**
  - Pure and tested.
  - A position is a cursor: `{ screen, fu }`, the screen index plus the follow-up index.
  - `viewAt`, `nextCursor` and `prevCursor` compute every move from the channel, the cursor, the answers and whether it is a preview. That means there is no history stack to go stale.
  - Back never deletes an answer.
  - In preview, Next is always allowed and every follow-up is shown.
- **`store.ts`**
  - A zustand store persisted under `ascent-v2-v1`.
  - Saved state goes through `rehydrate()`, which validates it and resets anything it can't place.
  - `VERSION` in this file is bumped whenever the questions change in a way an old saved session can't carry over, such as new screens or renamed option ids. Sessions saved under an older version start fresh.
- **`link.ts`**
  - Reads `?business=`, `?cohort=` and `?r=` from the URL.
  - Chooses the channel once, at the start. It picks the laptop version when the window is landscape (width/height at least 1.3) and at least 1024x560; otherwise it picks the phone version.
  - `?layout=phone` or `?layout=desk` forces one.
- **`Player.tsx`**: the page itself. It draws the welcome, then the screens `flow.ts` says to, then the ending.
- **`send.ts`**: posts the finished response. The ending only says "sent" after the server confirms it was stored. If sending fails, Next reads "Couldn't send. Tap to try again." and the answers stay in the browser.
- **`collect.ts`**: the server side, used by `src/app/api/responses/route.ts`.
  - It checks the body is under the size limit, carries the current version key, is a live run (not a preview) and has an answers object. It does not check that the survey was finished or that the answers fit the questions. That is for the analysis.
  - It writes one JSON file per send and never overwrites one. A send without a valid code is filed as `nocode`.
  - Production refuses to store without `RESPONSES_DIR` (503), so no one is thanked for answers that went nowhere.

## Renderers: `src/v2/render/`

`render/index.ts` maps each template to its renderer. Every renderer takes the same `RenderProps` (`render/contract.ts`):

- `q`: the question;
- `value` and `set`: the saved answer;
- `log`: for interaction events;
- `step` and `total`: for the progress line at the top;
- `preview`;
- `onNext` and `onBack`.

A renderer draws inside `V2Frame`, which puts the question, the instruction, the note and Next in the same place on every screen. The Player owns the order; a renderer only draws and reports.

- **Screen size.** A phone must never scroll. The checklist, cards, trays and track renderers call `useFit()` (in `render/checklist.tsx`). It steps the layout down, through tighter rows, two columns and smaller art, until the page fits or it reaches that renderer's last step. The other screen types are sized to fit the design targets directly. The targets are 390x660 for a phone and 1440x790 for a laptop.
- **Test hooks.** Every renderer exposes the same data attributes. The end-to-end walk finds everything through these hooks, with one playing step per template:
  - `data-q` on the object;
  - `data-option` on each option, tile or card;
  - `data-zone` on each drop target or track stop;
  - `data-choice` on each card button;
  - `data-row` on each split-card row;
  - `data-jug` on each bottle jug;
  - `data-input` on text fields;
  - `data-next` on Next.
- **Bigger objects.** The podium, the bottle, the stamp and the split cards are built from pieces in `src/v2/ui/` and `src/v2/hero/`. Pictures are 3D renders in `public/game/3d/`, listed in `src/game/art/sprites.ts`.

## Tests

- `src/v2/questions.test.ts` enforces the house rules for every visible string. The rules are listed in CONTRIBUTING.md.
- `src/v2/engine/*.test.ts` cover routing, follow-ups, saved-state recovery, sending and storage.
- `e2e/v2-walk.mjs` plays the whole survey in Chrome along four seeded routes, chosen so that every follow-up fires on some route. It checks the answers saved in the browser against what the engine says the route should have produced, and checks the response from `/api/responses`. It doesn't read the stored files.
- `e2e/v2-preview.mjs` checks the preview's order and follow-ups.

## Earlier versions

Earlier versions are kept for reference and are not linked from the survey. They share `src/game/art` and `src/game/layout.ts` with v2.

| Route | Code |
|---|---|
| `/v1` | `src/game` |
| `/survey` | `src/flow`, `src/content` |
| `/classic` | `src/scene`, `src/levels`, `src/store` |
| `/v2` (mockup gallery) | `src/v2/screens` |
