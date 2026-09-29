# Contributing

## How changes ship

1. Branch from `main`.
2. Make one focused change.
3. Run the checks below.
4. Open a pull request.
5. **Merging into `main` deploys it**: the Railway service is connected to `main`. That connection is set in the Railway project, not in this repo. Never deploy from a laptop (`railway up`).

There is no CI yet, so the checks below are the gate. Run them before you open a pull request.

## Checks before a pull request

```bash
npm test                              # unit tests, including the copy rules below
npx tsc --noEmit                      # typecheck
npm run dev                           # then, in another terminal:
node e2e/v2-walk.mjs A B C D          # the whole survey on a phone (390x660)
DESK=1 node e2e/v2-walk.mjs A B C D   # and on a laptop (1440x790)
```

If you changed how a screen looks, look at it on both sizes. The walks fail if any screen scrolls, but they can't judge whether a label reads well. `/preview` is the quickest way to reach any screen: Next always works there.

After merging, you can run the walks against the live site. As of September 2026, production doesn't store answers, so add `NOSTORE=1`. It only changes what the walk expects at the end:

```bash
BASE=https://survey.tigerai.tech NOSTORE=1 node e2e/v2-walk.mjs A B C D
```

## Changing a question

The survey's words are in `src/v2/questions.ts`: questions, options, follow-ups, section breaks, the welcome, the 2031 scene and the ending. Section names are in `src/v2/contract.ts`. Change the words there, and the phone and the laptop both update. A few fixed interface labels, such as "Pick 1 more" and "All 5 sorted.", live in the renderers under `src/v2/render/` and `src/v2/ui/`.

`src/v2/questions.test.ts` enforces these rules on the strings in `questions.ts`:

- A question is at most 14 words and ends with "?". The exception is 5.6, which is a sentence to finish.
- An instruction is at most 10 words and states the count the constraints enforce:
  - "Tap one." means `pick: 1`.
  - "Pick two." means `pick: 2`.
  - "Pick one or two." means `min: 1, max: 2`.
  - "Pick your top 3, best first." means `pick: 3`.
  - "Pick any." means `min: 1`, and "Pick any, or skip." means `min: 0`.
  - "Swipe or tap. 6 cards." must match the number of cards.
  - "Place 7 of the 12." must match the picks, the tiles and the tray capacity.
- No checklist question or fixed checklist follow-up offers more than six answers. "Not sure", "I'd rather not say", "It usually works" and "Something else…" don't count. The exception is 2.3, which has seven options and asks for three. Where people may have more than one reason, the question keeps every option and asks for "one or two" rather than cutting options.
- A follow-up's topic line reads "One more on <topic>." It names the topic and never repeats the respondent's answer.
- Banned words are not allowed anywhere on screen. They are climbing metaphors ("climb", "summit", "route", "kit"…), jargon ("LLM", "avatar", "ECM"…), idioms a second-language reader might trip on, and "&". The list is at the top of the test file.
- Every 2031 question after the scene carries the scene as its note (`CONTEXT_2031`). Question 2.1 comes before the scene on purpose and does not.
- Every picture id exists in `src/game/art/sprites.ts`.

The tests also check the structure:
- ids and answer keys are unique;
- every id a follow-up's `when` names exists;
- the phone order is the laptop order minus the laptop-only questions.

**If you add or remove a screen, or rename an option id,** bump `VERSION` in `src/v2/engine/store.ts`. Sessions saved in browsers under the old questions then restart instead of resuming with answers stored under ids that no longer exist.

**If a question count changes,** also update `MINUTES` in `questions.ts` and the counts in the tests (18 phone and 25 laptop today).

## Adding a picture

Put a clay render in `public/game/3d/<id>.webp`. An optional twice-size copy goes in `public/game/3d/2x/`. Then run `node scripts/sprites.mjs` to rebuild `src/game/art/sprites.ts`, and use the id as an `icon` on an option or a card.

## Adding a screen type

1. Add the template name to `Template` in `questions.ts`.
2. Write `src/v2/render/<template>.tsx`, taking `RenderProps` and drawing inside `V2Frame`.
3. Register it in `src/v2/render/index.ts`.
4. Expose the test hooks listed in `src/v2/render/contract.ts`, and teach `e2e/v2-walk.mjs` to play it.

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for how the pieces fit.

## Commit messages

Say what changed and why, in plain words. Pull requests list the checks you ran and what you saw.
