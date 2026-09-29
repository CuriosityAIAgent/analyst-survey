# The Ascent

A short, game-like survey for J.P. Morgan Private Bank A2A graduates: the people who came through the Analyst-to-Advisor programme. It asks them what made them successful, how AI will change the work of Advisors and Analysts, and how the path to Advisor could be shorter.

The survey has one question per screen and one thing to do on it. You place tiles on a podium, sort cards, pour hours into a bottle or sort tiles into trays. It runs in the browser on a phone (18 questions, about 8 minutes) or a laptop (25 questions, about 12). Some questions ask a follow-up that depends on the answer.

- Live, what respondents see: https://survey.tigerai.tech
- Preview for reviewers, where Next always works and every follow-up shows: https://survey.tigerai.tech/preview

Built with Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4 and zustand. Hosted on Railway.

## Quick start

You need Node 20.9 or later (Next.js 16 requires it; `.nvmrc` pins 24, so `nvm install && nvm use` picks it up) and npm. The end-to-end walks also need Google Chrome. The npm scripts use POSIX shell syntax (`${PORT:-3000}`), so on Windows use WSL or Git Bash.

```bash
git clone https://github.com/CuriosityAIAgent/analyst-survey.git
cd analyst-survey
npm install
npm run dev
```

Open http://localhost:3000/preview to click through every screen, or http://localhost:3000 for the survey as a respondent sees it. In development, finished responses are written to `./.data/responses/`, which is gitignored.

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Dev server on http://localhost:3000 |
| `npm test` | Unit tests (vitest, `src/**/*.test.ts`) |
| `npx tsc --noEmit` | Typecheck |
| `npm run build` then `npm start` | Production build, served on `$PORT` (default 3000) |
| `node e2e/v2-walk.mjs A B C D` | Plays the whole survey in headless Chrome, like a person, along four seeded routes (see below) |
| `node e2e/v2-preview.mjs` | Presses Next on every preview screen and checks every follow-up appears, in order |

`npm run lint` calls `next lint`, which Next 16 removed, so it fails. Use the typecheck instead.

### The end-to-end walks

The walks drive Chrome with puppeteer-core. They expect Chrome at `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome` (macOS); on another OS, change `executablePath` in the script.

```bash
npm run dev                                   # in one terminal
node e2e/v2-walk.mjs A B C D                  # phone size, 390x660
DESK=1 node e2e/v2-walk.mjs A B C D           # laptop size, 1440x790
BASE=https://survey.tigerai.tech NOSTORE=1 node e2e/v2-walk.mjs A B C D   # the live site
```

- `BASE` points a walk at another server. The default is http://localhost:3000.
- `NOSTORE=1` is for a server without response storage, such as production today. It only changes what the walk expects at the end (the "preview version" thank-you rather than "sent"). The walk still sends the answers, and a server that does have storage will keep them.
- `--shots` saves a PNG of every step to `/tmp/ascent-v2-shots/`.

Each walk checks every screen:
- nothing makes the page scroll;
- Next is on screen;
- there are no page errors;
- every follow-up fires exactly when the engine says it should.

At the end it checks the answers saved in the browser and the response from `/api/responses`. It doesn't read the stored JSON files.

## Routes

| Path | What it is |
|---|---|
| `/` | The survey (v2) |
| `/preview` | Review mode: Next always works and every follow-up shows. Answers never mix with live runs. |
| `POST /api/responses` | Stores one finished response (see [Responses and privacy](#responses-and-privacy)) |
| `/v2` | A gallery of the v2 screens as clickable mockups. They carry older wording. |
| `/v1`, `/survey`, `/classic` | Earlier versions, kept for reference |
| `/art`, `/art/game` | Art review pages |

### Links sent to respondents

```
https://survey.tigerai.tech/?business=uspb&cohort=2024&r=<code>
```

- `business`: one of `uspb`, `ipb` or `solutions`.
- `cohort`: an A2A class year, 2022 to 2025.
- `r`: the respondent's code. It is 4 to 64 letters, digits, `-` or `_`, and responses are filed under it.

Without `business` or `cohort`, the welcome screen asks for them.

Other parameters:
- `b`, `c` and `code` are short aliases for `business`, `cohort` and `r`.
- `preview=1` turns any page into review mode, the same as `/preview`.
- `layout=phone`, `layout=desk` or `layout=deskCompact` forces a layout; otherwise it follows the window size.

## Environment variables

| Variable | Where | Meaning |
|---|---|---|
| `RESPONSES_DIR` | Server | The folder finished responses are written to, one JSON file per send. **Production refuses to store without it**: `/api/responses` returns 503 and the survey ends by saying this is a preview and the answers stay on the device. On Railway, point it at a mounted volume such as `/data/responses`, because the container disk is wiped on each deploy. In development it defaults to `./.data/responses`. |
| `PORT` | Server | The port for `npm start`. Railway sets it. |
| `NEXT_PUBLIC_ALLOW_DEMO` | Build | `1` turns on the demo controls of the earliest version (`/classic`) in production |

As of September 2026, the Railway service has no `RESPONSES_DIR` set. The live site is a preview, and no answers are collected.

## Responses and privacy

Each send is one file named `$RESPONSES_DIR/<code>--<ms>-<random>.json`, and a file is never overwritten. A respondent who sends twice leaves two files, and nothing merges them: the analysis must keep the latest file for each code. A send without a valid code is filed as `nocode`, so those files can't be told apart by respondent.

A file holds:
- the answers;
- the segment (business and cohort);
- timing and interaction events;
- the device type (phone or laptop) and the screen size;
- the time it arrived.

No name, IP address or user agent is stored. The survey tells respondents that answers are held under a code and only ever shown as totals across ten or more people.

## Where things live

```
src/v2/questions.ts      Every question, option and follow-up; the play order for phone and laptop;
                         the welcome, section breaks, the 2031 scene and the ending. Question wording
                         changes go here (a few fixed labels, such as button states, live in the renderers).
src/v2/contract.ts       Section names and the one-column screen contract
src/v2/engine/           Player (the page), flow (routing and follow-ups), store (answers saved in the
                         browser), send + collect (the responses API), link (URL parameters)
src/v2/render/           One renderer per screen type: checklist, cards, trays, track, podium,
                         bottle, months, stamp, text, scene
src/v2/ui/, src/v2/hero/ Shared UI pieces and the richer objects (podium, bottle, stamp, split cards)
src/app/                 Next.js routes, including api/responses/route.ts
public/game/3d/          The clay-style 3D renders used as pictures; scripts/sprites.mjs rebuilds
                         src/game/art/sprites.ts after new renders are added
public/email/            Screenshots used in emails (served from the live site)
e2e/                     Chrome end-to-end scripts; v2-walk.mjs and v2-preview.mjs cover the current survey
docs/                    ARCHITECTURE.md, and reviews/ (the design history: why each question is what it is)
```

Code for the earlier versions is `src/game` (v1), `src/flow` and `src/content` (`/survey`), and `src/scene` and `src/levels` (`/classic`).

## Deploying

The Railway service is connected to this repo's `main` branch. That connection is set in the Railway project, not in this repo. `railway.json` sets the build: Nixpacks, `npm run build`, `npm run start`. **Merging a pull request into `main` deploys it.** Nothing is deployed from a laptop.

## More

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md): how a question becomes a screen, and how answers flow.
- [CONTRIBUTING.md](CONTRIBUTING.md): how to change a question, the checks before a pull request, and the rules the tests enforce.
- [docs/reviews/](docs/reviews/): the design and review history.
  - [ascent-adam-review-2026-09-28.md](docs/reviews/ascent-adam-review-2026-09-28.md) is the latest review, with before and after for each question.
  - [ascent-evidence.md](docs/reviews/ascent-evidence.md) is the research behind the question design.
