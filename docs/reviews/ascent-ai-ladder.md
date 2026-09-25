# The Ascent — the AI ladder

**Status:** build spec. Supersedes the Handover's beat 0 and the `LANES` copy in `src/content/content.ts`.
Nothing in it has been in front of an Associate; the pretest in build item 9 is a merge gate, not a nicety.

---

## Why

The Handover currently asks an Associate to put thirteen desk activities into three lanes: **"An agent does it"** (*No human in the loop.*), **"An agent drafts, I own it"** (*It comes to me half-built.*), and **"I do it"** (*The judgement is the job.*). Every one of those is a claim about an agent, and an Associate who has used a chatbot a few times cannot picture what "no human in the loop" means on their own desk — so the answer is a guess about a phrase rather than a judgement about the work. The middle lane is worse than vague: "half-built" silently straddles *it helped me write this* and *it wrote this and I approved it*, which are the two things the sponsor most needs separated, because the first still puts an Associate's judgement on the instance and the second does not. The data comes back clean and means very little, and `trap_strict[i]` — the number the study exists to produce — inherits the ambiguity, because half of it keys off a lane nobody could operationalise.

The fix is not more lanes. It is to make the teaching concrete at five named rungs, and to re-cut the three answer lanes onto the one boundary that all of this turns on: whether an Associate reads that particular piece of work before it goes.

---

## The ladder

Five rungs. They are the five ways a desk already delegates to **people** — do it yourself, build it with the analyst at your shoulder, brief the analyst and mark up what comes back, write the template the team runs on, send it to the shared service and handle the escalations. Every Associate has done all five with humans. They are not being taught a taxonomy; they are being shown one they already have.

| Rung | What an Associate calls it | Who decides what good is | What you still do | What you stop doing |
| --- | --- | --- | --- | --- |
| `own` | **I do it** | You, on every choice, unaided | All of it, including the blank page | Nothing. This is the floor, and it costs the evening |
| `assisted` | **It helps while I work** | You, continuously — but choosing between shapes it framed | Set the structure, write the parts that carry risk, check as you go | Starting from nothing, and making the small errors that corrected you |
| `briefed` | **I brief it, then I check it** | You, once per item, at the end, over the errors you can still see | Write the brief, read the whole thing, correct it, carry the sign-off | Building it — so you stop seeing how it was built |
| `standing` | **I set it up once, then it runs** | You, in the past, for every future instance. At run time, nobody | Author the standard, spot-check, own every failure | Reading the ordinary one |
| `service` | **It's a service; I see the exceptions** | Whoever runs the service — the firm, the vendor, the model | Handle escalations, own the client relationship, notice when the aggregate looks wrong | Seeing the normal case at all |

### The ordering principle, stated precisely

What increases is **the size of the unit your judgement is applied to**: the sentence, then the draft, then the finished deliverable, then the recipe, then only the exception. Running the other way, it is how much of the work has already happened by the time you first look at it, and how many pieces of work one look now has to cover.

It is explicitly **not** how much AI is present, how capable the tool is, how much time is saved, or how technical you are. An Associate can have a model open six hours a day and sit at `assisted` all day. An Associate who has never opened a chatbot can sit at `service` because the firm installed something.

The reason this is the right axis rather than merely a tidy one: the sponsor's mechanism is that analysts built judgement by *being the judgement point on instances*. You learn what good looks like by being the person who had to decide, on this one, with your name on it. So the quantity that defines the rung is the same quantity that defines developmental exposure. The Handover's two axes stop being two unrelated self-reports crossed in a scatter and start sharing a mechanism — and the correlation between rung and clip becomes a finding rather than a confound.

The load-bearing boundary is `briefed` | `standing`. That is the **inspection line**: the last rung at which an Associate reads every finished output before it counts. The pipeline does not break at automation in general. It breaks there.

### The disambiguation tests

Four boundaries, four questions. Each is a single binary, answerable from memory, about observable behaviour — no proportion judgement, no recalled ratio. That is what makes two Associates classify the same task the same way.

| Boundary | The test | Which way it falls |
| --- | --- | --- |
| `own` \| `assisted` | Point at the page. Did any sentence, number or structure come out of the model? | Any at all → `assisted`, however heavily you rewrote it |
| `assisted` \| `briefed` | Did a whole, finished version of this exist before you had read any of it? | Yes → `briefed` |
| `briefed` \| `standing` | Do you read every one, or did you read the first few and then stop? | Every one, no exceptions → `briefed`. "I check them when I have time" → `standing` |
| `standing` \| `service` | Whose definition of good is inside it? Could you change what it does tomorrow without asking anyone? | Could → `standing`. Have to raise a request → `service` |

Two words are deliberately absent from all of it. **"Code"** is not a rung; it is a medium. An Associate who has an AI write a reconciliation script and one who configures a saved template have done the same thing to their own judgement — both are building the thing that runs, and both sit at `standing`. Left on screen, "code" measures Python literacy and most Associates skip it as "not me" while sitting squarely on it. **"Agents"**, as a count, is not a rung either: two agents whose every output you read is still `briefed`; one agent whose output reaches a client unread is `service`. Draw the line on inspection, never on headcount, and keep the vendor vocabulary — chat, cowork, code, building agents, managing agents — off the screen entirely. Chat and cowork are taught as two halves of `assisted`; what is real in "building" and "managing" is the `standing` | `service` test above.

### Where the ladder is weakest

`standing` | `service` will carry the most misclassification, and the reason is specific to a bank: an Associate cannot deploy anything, the firm does, so "I set it up once" reads to many people as "the firm built it". Defining the boundary by whose standard is encoded rather than by who typed it is the best available repair, and it is not a complete one. Instrument it — dwell and back-steps at those two stops on the teaching screen — rather than arguing about it.

---

## Meeting prep, rung by rung

The frozen vignette. It is written once, used for all five rungs, and never varied per activity — vary it and the rungs stop meaning the same thing.

> **Tuesday 9am, the Delgado review.** $42m across three entities and a GRAT. Thirty-one percent of the liquid assets still sit in the stock of the acquirer that bought their business eighteen months ago. A $6m securities-based line drawn to $4.1m. A $900k capital call on a private-equity fund due on the 14th. The Advisor wants a twelve-page briefing book by 5pm Monday, and means to recommend collaring the concentrated position and terming out the line.

There is one error planted in the book, and it is planted at every rung: **page nine has the capital call two days out**, because the settlement convention was ignored. Who catches it changes; whether it gets caught does not run one way. That is both the honest picture and the neutrality device — an Associate cannot read the five scenes and extract "further along is safer" or "further along is riskier", because neither is true.

### `own` — I do it

**What happens.** 5:40pm Monday. You pull the position report as of Friday's close, open last quarter's review pack, re-read your own March contact report in the CRM, check the drawn balance on the line, dig the capital call out of the alternatives statement, and ring the Investor because the collar pricing is not in any system you can reach. Then you work out what this meeting is actually about — that the concentrated position and the drawn line are one problem and not two — and you write all twelve pages in the house template. It goes to the Advisor at 8:40pm. *Page nine has the capital call two days out. He finds it at seven the next morning and sends four pages back in red. You have not got that date wrong since.*

**What you do.** Decide what matters to this family this quarter, and write it. Make the call to the Investor for a number you cannot produce. Get it wrong in two places and be told which two.

**What you stop doing.** Nothing — this is the floor, and the floor is not free. It costs three hours of a Monday you did not have, a book whose quality is capped at what you happen to know tonight, and two errors that a colleague or a model would have caught before the Advisor saw them. Name the price here, or every rung above it reads as pure gain.

**Drawn, at 360px.** Twelve page-tiles (8×13px, 2px gutters, 118px wide) on a baseline. A 1px vertical hairline 8px to their right is **the gate** — the moment the book leaves your hands. A 6px filled square is **you**. A continuous 1.5px underline beneath a tile means a person read that one. Here: the square sits at the far left touching tile one, no gap; all twelve tiles solid-stroked; the underline runs unbroken beneath all twelve. Caption: *"You made all twelve. You read all twelve before it went."*

### `assisted` — It helps while I work

**What happens.** The book is open and the model is open beside it. You paste in the holdings export and ask what has drifted since March. You ask it to explain the acquirer's structured note, because you have read the term sheet twice and still cannot say what happens at the barrier. You argue with its summary of the house credit view and keep one sentence of three. Later it is writing into the deck itself while you watch — it redraws the performance table, you tell it the March call was to hold and not trim, it redoes the paragraph. *Page nine comes back with the capital call two days out, in a sentence that reads well, so you keep it. The Advisor finds it at seven.*

**What you do.** Hold the pen the whole way. Choose the order of the argument — concentration first, then liquidity, then the estate point — and write the recommendation page yourself, because its version says nothing. Ring the Investor for the collar level. Read every line that arrives.

**What you stop doing.** The blank page, and the first twenty minutes of not knowing what the story is. That is a smaller loss than it sounds and a real one: you stop generating the candidate framings and start choosing between framings it offered, which is a weaker kind of deciding even though your hands never leave the work. The quieter loss is that the structured note now gets explained *to* you rather than *by* you, so you never have to hold it well enough to explain it to a client. And a wrong number that arrives fluent is harder to spot than a wrong number you typed.

**Drawn.** Same strip, same gate, square unmoved and still touching tile one. Difference: the tiles carry a 2px vertical hatch in the same ink at the same luminance — the model's words are a different weave, not a different status. The underline still runs beneath all twelve. Caption: *"You read all twelve before it went. Some of what was on them wasn't yours."*

This rung swallows both **chat** and **cowork**. Teach them as two sentences inside the same scene — one where it works in a window beside the book and you carry the answer across by hand, one where it has the real file — because the separator that does the work (did a whole finished version exist before you read any of it?) puts them both on the same side of the line.

### `briefed` — I brief it, then I check it

**What happens.** You write the brief at 5:15pm: the family, the entities, the meeting, the ask, the house format, the four things the Advisor wants landed. At 6:10pm twelve finished pages are on your screen, and your job for the next forty minutes is to find what is wrong with them. Performance on page four is gross, not net of the SMA fee. The collar page asserts a conviction the Investor never gave you. It has put the estate point ahead of the liquidity point, which is the wrong order for this family and no system knows why. *Page nine has the capital call two days out. You find it, because finding it was the whole job, and you fix it before it goes.* You cut a slide and you send it. If it is wrong in the room on Tuesday it is still your name on it.

**What you do.** Write the brief, which is a real skill and a new one. Read all twelve pages before anyone else does. Find the errors you are currently capable of finding, and carry the sign-off.

**What you stop doing.** You stop building it, so you stop finding out how it was built. You never construct the performance attribution yourself, which means you never get it wrong and never get corrected — and you calibrate "good" by having made bad ones, not by having waved good ones through. You stop ringing the Investor, so a number arrives without a relationship attached to it. From here you judge whether it looks right rather than whether it was done right, and the errors you cannot yet detect are now invisible rather than merely unmade. Being even-handed: this rung also *creates* a rep the desk currently undervalues. Being handed a fluent, wrong-but-plausible book and made to find the error is the `aicritique` item in the fuel list, and forty minutes of it is not nothing.

**Drawn.** This is the break in the device, and it has to be legible at a glance. The twelve tiles render **complete first**, in a single 200ms draw. Only then does the square fade in *between* the strip and the gate and sweep left to right across all twelve. Every tile ends solid-stroked and the underline still runs beneath all twelve. The producing-to-approving boundary is carried as a change in **order** — work first, you second — not as a change in size, colour or altitude, so it reads as different rather than as better. Caption: *"It was finished before you saw it. You still read all twelve."*

### `standing` — I set it up once, then it runs

**What happens.** In January you wrote down what a briefing book is: positions as of the prior close, drift against the IPS bands, every open follow-up from the CRM, capital calls inside forty-five days, line utilisation, the house views that touch the allocation. Since then every meeting on the Advisor's calendar generates a book at 6am two days out. On Monday the Delgado book lands in his inbox in the format you defined and neither of you opens page nine. You read the first dozen books in February and found three things worth fixing. You stopped reading them in March. Once a fortnight you pull two at random and read them against source — not last fortnight. You could change what the thing does tomorrow without asking anyone, and that is the test that puts you here rather than one rung along. *Page nine has the capital call two days out. It was not in the two books you pulled. The client asks about it in the room.*

**What you do.** Author the standard, in advance, in general, for every future instance, and own every failure of it whether or not you saw that one. Pull a sample. Change the instruction when the sample shows something.

**What you stop doing.** You stop reading the ordinary ones, and the ordinary ones are where calibration lives. The Advisor stops marking anything up in red at seven, so the feedback loop that made you competent has no surface left to act on. Note the asymmetry the sponsor should care about most: you could only write that standard because you learned it at the rungs below, and nobody working at this rung is learning it here. The standard is frozen at what you knew in January, and nothing in the loop now tells you it has gone stale.

**Drawn.** The square has moved **left and off the strip** onto a 12px bracket glyph sitting before the tiles — the rule you wrote — with "Jan" beside it. Ten tiles plain, two underlined, and the two are visibly non-adjacent because you chose them. The square-to-gate distance is the largest in the set. Caption: *"Nobody read this one before it went. You read two in an average fortnight, and you picked which two."*

### `service` — It's a service; I see the exceptions

**What happens.** Books arrive the way KYC files come back from the utility. The firm decided what a briefing book contains, which drift is worth flagging, what the disclosure says; changing page nine means raising a request and waiting. You do not see the Delgado book before the meeting. You see it in the meeting, on the Advisor's screen, at the same moment the client does. *Page nine has the capital call two days out. The service's own check catches it and sends you that one — the only book you have read end to end since spring.*

**What you do.** Handle the escalations, own the client relationship, and be expected to notice when the aggregate looks wrong. When one is wrong in front of a client, it is still your desk it lands on.

**What you stop doing.** You stop seeing the normal case at all, and that is the whole of it. The only instances that reach you are the failures, which is the worst possible training set for learning what good looks like — you would be calibrating on the tail. There is no route left on this activity by which an Associate acquires the standard the rung below depends on their already having. Say plainly what this rung also buys, because it must not read as a threat: there is a book for every meeting on the desk, including the meetings nobody had time to prep, and it does not depend on you being free on a Monday night.

**Drawn.** The bracket glyph is pushed outside the track at 40% opacity, outlined rather than filled, with no date — it exists, it is just not yours. The square sits to the **right** of the gate, past it, downstream, which is the only state in the set where that is true and is the whole meaning of the rung. One tile is underlined and carries a 3px corner chevron: the system picked it, not you. Caption: *"Nobody on your desk read this one before it went. You read the one that broke."*

### The whole device, in two sentences

Across all five states exactly two quantities change: **how many tiles your line touches** (12, 12, 12, 2, 1) and **where you sit relative to the gate**. Nothing grows, nothing accumulates, nothing goes up, no hue carries meaning, and there is no gold anywhere on this screen.

---

## The screen

### Where it sits

Level 3, The Handover. Beat 0 — the "Thirteen things you do" list at `src/levels/L3Handover.tsx:50-65` — is **deleted**. It is the only screen in the build that captures nothing, and its actual job (see the set before you commit) is better done by beat 2's review wall, which already shows every activity grouped by where it was placed.

In its place, the five scenes open inline above card 1 of beat 1, inside the existing `Level` shell. No new route, no new level, no screen transition. The reason the teaching sits here rather than at Base camp is that a vivid demonstration of AI autonomy eight minutes before the cards would decay, and worse, it would prime Level 1 (`what taught you`) and Level 2 (the Advisor) with automation imagery — which the refit's own rule forbids. Inside Level 3 the prime is confined to the screen it exists for.

### The vignette is not one of the thirteen

The scenes run on the Delgado briefing book, which is **not** taken as a placement and is not pinned to any card position. All thirteen activities are dealt clean, in randomised order.

The residual, stated rather than buried: meeting prep *is* the `pitchbook` item, so that one activity carries a stronger prime than the other twelve. It is flagged `taught: true` in the schema, excluded from the calculation of the item-median quadrant lines (otherwise one primed item moves the boundaries for all twelve others), excluded from `safe_to_take`, and plotted on the scatter as an open ring with a footnote. The only way to remove the residual entirely is to teach on an activity outside the item list, and meeting prep has no such version — Haresh asked for meeting prep by name and it is the right carrier, because it is the one item where all five rungs are simultaneously imaginable on a Private Bank desk today. Take the flag and the exclusions, and say so on the view.

### The beats

**Beat 0 (new) — the scenes. ~34s, skippable.** Five stops, one per screenful, horizontal. Swipe plus two 44px prev/next buttons plus an unnumbered five-dot indicator. Each stop is one run-strip, one scene title, three short slots and one caption. Each stop's advance is **two chips**: *"I've worked this way"* / *"I haven't"* — the tap records exposure and advances in the same motion, which is how the exposure denominator costs nothing. A plain (never gold) *"I've got it"* dismisses from any stop, and appears in the same position at stop five, so finishing is neither rewarded nor required.

**Beat 1 — the thirteen. ~61s.** Unchanged in mechanic. Randomised order, `itemOrder` logged. Three lane chips, each now carrying a 20px run-strip glyph and a caption that is the separating test stated as an observation. Lanes `human` and `agent` carry two strips each; `both` carries one and is padded to identical height. A 44px *"What a Monday looks like"* control reopens the scenes inline at any stop, on every card, and logs `reopenedAt` with the card index. That row is the answer to decay: the concrete picture is one tap away at card nine, not left behind on a screen seen a minute ago.

**Beats 2 and 3 — unchanged.** Clips, the five-cap, the conflict reckoning, the 140-char field. No new interaction type; the scenes are a disclosure on a control, not a second mechanic.

### The copy

**Beat 0 header, persists at every stop**

> **One meeting, five Mondays.**
> The same job, done five different ways. All five exist somewhere today. None of them is the answer we're after — watch where you end up standing.

**The vignette** — full at stop one, then compressed to the header chip *"Delgado review · twelve pages · Monday 5pm"*

> Tuesday 9am, the Delgado review. $42m, and a third of it still sits in the stock that bought their business. A line drawn to $4.1m, a capital call due on the 14th. Twelve pages, to the Advisor, by 5pm Monday.

Every stop has exactly three slots, in the same order, with the same labels, and no stop's block runs more than six words longer than another's. Every scene's last sentence is page nine, and only page nine.

---

**I do it**

*What happens* — You pull the positions, re-read your own March notes, ring the Investor for the collar level, and write all twelve pages yourself. Page nine has the capital call two days out; the Advisor finds it at seven and sends four pages back in red.
*What you get* — Nothing in it is anyone's judgement but yours, and you have not got that date wrong since.
*What it costs* — Monday night, gone. A book only as good as what you happen to know tonight.
*Caption* — You made all twelve. You read all twelve before it went.

**It helps while I work**

*What happens* — It's open beside the book: you paste the holdings in, keep one sentence of three, then let it redraw the performance table while you watch. Page nine came back two days out in a sentence that read well, so you kept it. The Advisor finds it at seven.
*What you get* — You never start from a blank page, and the structured note gets explained in two minutes.
*What it costs* — You choose between its framings instead of making your own, and its errors arrive fluent.
*Caption* — You read all twelve before it went. Some of what was on them wasn't yours.

**I brief it, then I check it**

*What happens* — You write the brief at 5:15. Twelve finished pages come back at 6:10 and your job is to find what's wrong with them. Page nine has the capital call two days out. You find it, because finding it was the whole job.
*What you get* — Being handed something fluent and wrong and made to catch it, which is a real skill and nobody currently schedules it.
*What it costs* — You stop building it, so you judge whether it looks right, not whether it was done right.
*Caption* — It was finished before you saw it. You still read all twelve.

**I set it up once, then it runs**

*What happens* — In January you wrote down what a briefing book must contain. Every meeting on the calendar has had one since, by six. Page nine has the capital call two days out; it wasn't in the two books you pulled this fortnight, and the client asks about it in the room.
*What you get* — A book for every meeting on the desk, including the ones nobody had time to prep.
*What it costs* — Nobody reads the ordinary ones, and the ordinary ones are where calibration lives.
*Caption* — Nobody read this one before it went. You read two in an average fortnight, and you picked which two.

**It's a service; I see the exceptions**

*What happens* — Books come from a central service, the way KYC files come back from the utility. Changing page nine is a ticket in a queue. Page nine has the capital call two days out; the service's own check catches it and sends you that one.
*What you get* — The same standard for everyone on the desk, and it doesn't depend on you being sharp at six.
*What it costs* — You only ever see the ones that broke, which is the worst way to learn what good is.
*Caption* — Nobody on your desk read this one before it went. You read the one that broke.

---

**The advance, identical under every stop, in the same order every time**

> I've worked this way    ·    I haven't

**Dismiss, plain chip, same position at every stop**

> I've got it

**Reopen, cards 1-13**

> What a Monday looks like

**The stem on every card of beat 1** — replacing `L3Handover.tsx:70-71`

> **Two years from now, who should be doing this one?**
> Not who does it today. We're looking for the work we can't quietly automate.
> *n of 13 placed*

**The three lane chips** — replacing `LANES` in `content.ts:45-49`. `label` / `caption`. The `sub` line is gone; the caption replaces it and is the separating test stated as an observation.

| id | label | caption | glyph |
| --- | --- | --- | --- |
| `human` | I do it | Mine to build, whatever helps me build it. Every page had my hands on it. | `own` + `assisted` strips |
| `both` | It drafts, I check every one | It was finished before I saw it. It goes because I read it. | `briefed` strip |
| `agent` | It goes without me | Nobody reads this one before it goes. I see a sample, or the one that broke. | `standing` + `service` strips |

`"I haven't done this one"` is unchanged.

Note what has left the instrument: the words *agent*, *AI*, *chat*, *cowork*, *code* and *automate* appear nowhere on either screen. The ids stay `agent` / `both` / `human` so nothing downstream breaks, and the divorce between the id and its meaning is written into `packages/schema` rather than left to be remembered.

### The thirteen glosses

The scenes teach on an artefact. Seven of the thirteen activities do not produce one, and for those "did a finished version exist before you read it" has no referent — so the respondent improvises one, differently, per card, and the instrument is back to the defect it exists to fix. The repair is copy, it costs no seconds because it replaces the existing gloss, and it is the single thing most likely to sink this change in the pretest. Each gloss must name **what one instance is**.

| id | today | becomes |
| --- | --- | --- |
| `proposal` | the allocation, the Wealth Plan, the case for the change | one proposal: the allocation, the Wealth Plan, the case for the change |
| `pitchbook` | for a prospect or client meeting | one book, for one meeting |
| `reviewpack` | performance, allocation, what changed and why | one pack: performance, allocation, what changed and why |
| `lending` | mortgage and securities-based requests, building the credit package | one request, from the ask to the credit package |
| `movemoney` | wires, transfers, payment approvals, chasing the exception | **one payment: queued, checked, released** |
| `suitability` | suitability, supervisory and marketing checks before it reaches a client | **one item through the gate: the pre-read, the rationale, the submission** |
| `research` | and turning it into something the Advisor can actually say | one piece of research, turned into something the Advisor can say |
| `clientmail` | or the follow-up note the Advisor sends | one note, sent |
| `coordinate` | banker, investor, lender, trust and estate, tax — keeping one story | **one hand-off: who needs telling, what they get, who chases** |
| `prospect` | screening names, mapping who knows whom | **one screen: the names in, the names out** |
| `onboard` | account opening, chasing documents, remediation | one file, from opening to clean |
| `cash` | margin, upcoming calls, idle balances | **one account, one week: margin, calls, idle balances** |
| `crm` | contact reports, follow-ups, who owes what by when | **one contact report, filed** |

The bolded six are the ones where the instance is a decision or an exception rather than a document. Worked through the lanes: *"it queues the wire and I release it"* is `both`; *"it releases and I see the daily log"* is `agent`. If those glosses cannot be written so the inspection line means one thing across all thirteen, `appetite[i]` is not comparable across activities and the scatter's x-axis is not a single scale — which is a bigger threat to the headline than anything in the ladder debate. Pretest it directly (build item 9).

### The visual treatment

One SVG device, five states, roughly 26 nodes, no image assets, no hue carrying meaning. Two inks: `--color-snow` at 1.5px for your line, `--color-ink2` at 1px for everything else, at **identical luminance**, so difference is carried by stroke style, texture and position and survives colour-blindness, a 1-bit render and a greyscale print.

**Geometry.** In a filmstrip stop the strip is 300×40px: twelve tiles at 18×22px with 2px gutters (238px), a 1px gate rule 8px to the right, a 6px filled square for you, a 1.5px underline 3px beneath a tile that was read. Inside a lane chip the strip is 118×20px: tiles drop to 8×13px with 2px gutters. Below 320px the `assisted` hatch would moiré, so it swaps to a 45° diagonal fill.

**The five states** are as drawn in the worked example above: `own` square-left-touching / all twelve underlined; `assisted` same plus hatch; `briefed` strip completes first, then the square arrives between strip and gate and sweeps; `standing` square left onto the bracket glyph, two non-adjacent tiles underlined; `service` bracket outside at 40%, square right of the gate, one tile underlined with a chevron.

**Motion.** One 180ms `translateX` of the square per state change, and the 200ms strip draw at `briefed`. Filmstrip advance is a 120ms crossfade. One property, one duration, one easing, every step. Never an acceleration, never a throughput animation of tiles streaming past — fast flow reads as exciting and that is a thumb on the scale. No level-up, no accumulation, no end-stop flourish: the transition into `service` is byte-identical to the transition into `own`.

**Reduced motion.** `prefers-reduced-motion: reduce` renders every state at its end position with no transition. The filmstrip advance is an instant swap. `briefed` renders the square already centred beneath the completed strip with a 1px bracket spanning all twelve tiles, and the caption does the work. Nothing about the teaching depends on having seen the motion — that is the test a motion-carried idea has to pass, and this one passes it.

**Selected-chip token.** `globals.css:45-49` renders `.chip[data-on="true"]` as gold on gold. The two exposure chips need a chosen state on re-read (arrowing back), and gold on this screen would make one rung look like the right answer. Add `.chip[data-on="true"][data-neutral]` — snow border at 1.5px, no fill change, no colour shift — and use it on the exposure chips. Check it clears 3:1 against the glass at all six sky stops, as the refit's token repair requires.

**360px layout, measured on paper and not yet in a browser.** Filmstrip stop one: header 66 + vignette 76 + strip 40 + caption 36 + stop title 22 + three slots 144 + exposure chips 52 + controls 44 + dismiss 44 + `Level` padding 48 = 572, against 564 usable under the sticky footer — stop one scrolls by about 8px, and stops two to five clear it at 516 once the vignette compresses to a 20px header chip. A beat-1 card with the caption and glyph on each chip: title 64 + sub 40 + aside 20 + gap 24 + activity card 88 + gap 16 + three chips at 88 with gaps 280 + "I haven't done this one" 52 + padding 48 = 632. The three chips clear the fold; **"I haven't done this one" and the reopen row sit roughly 70px below it and need a short scroll.** That is a real cost and the rule it must obey is that the three chips are never the thing below the fold. Verify on a device before M5 sign-off; if it fails, the caption on `both` drops to one line first.

### What it captures

No `Lane` change, no rung enum in the store, no persist version bump. One additive field on `Answers['handover']` plus three telemetry fields the refit assumes and the build does not have.

```ts
// src/store/useStore.ts
export type Rung = 'own' | 'assisted' | 'briefed' | 'standing' | 'service'  // teaching only

handover: {
  lanes: Record<string, Lane>          // unchanged: 'agent' | 'both' | 'human'
  notDone: string[]                    // unchanged
  clips: string[]                      // unchanged
  reckoning?: string                   // unchanged
  reckoningText?: string               // unchanged

  /** NEW — the deal, which the refit assumes and the build never had */
  itemOrder: string[]                  // the permutation actually shown
  laneChanges: number                  // re-placements during beat 1
  laneMs: Record<string, number>       // ms per card, first placement

  /** NEW — the teaching, measured rather than assumed */
  teach: {
    /** Exposure. Absent = stepped past without answering; never coerce to false. */
    seen: Partial<Record<Rung, boolean>>
    /** First visit only; re-reads land in reDwellMs so they don't inflate the first read. */
    dwellMs: Partial<Record<Rung, number>>
    reDwellMs: Partial<Record<Rung, number>>
    /** Stepping back is a comprehension signal; expect it at briefed|standing and standing|service. */
    backSteps: number
    /** Stop index at dismiss, 0-4. null = reached the fifth stop. */
    dismissedAt: number | null
    /** Card indexes 0-12 where the scenes were reopened. */
    reopenedAt: number[]
    /** The randomised vertical order of the three lane chips, fixed for the deck. */
    chipOrder: Lane[]
    ms: number
  }
}
```

`validateAnswers` must **default** `teach` and the three telemetry fields on a persisted v1 blob rather than migrating — `{ seen: {}, dwellMs: {}, reDwellMs: {}, backSteps: 0, dismissedAt: 0, reopenedAt: [], chipOrder: ['human','both','agent'], ms: 0 }`. localStorage survives deploys and `merge` already validates the whole shape, so this is a default, not a migration, and no version bump is needed. Clamp every ms to 0-36e5, cap `reopenedAt` at thirteen unique integers in 0..12, restrict `chipOrder` to a permutation of the three lane ids and fall back to the default if it is not one, restrict `seen` and `dwellMs` keys to the five rung ids, and clamp `dismissedAt` to 0-4 or null.

**The randomisation hazard, which will ship broken if it is not named.** There is no `Math.random` anywhere in `src` today. `itemOrder` and `chipOrder` must be generated in a mount effect and written to the store on first render of Level 3, never during render — randomising in the render body under the App Router and React 19 produces a hydration mismatch, and re-randomising on reload makes `itemOrder` a lie. Generate once, persist, and read from the store thereafter.

**Derived, and what each one is for.**

| Field | Reads as |
| --- | --- |
| `exposure_ceiling` | Highest rung with `seen === true`. **A mandatory cut on every lane distribution, not a filter someone remembers to apply.** `standing` and `service` are hypothetical for most Associates, and a high placement from someone who has never seen one is a guess. Report the lane distribution separately for `exposure_ceiling ≤ assisted` and `≥ briefed`; if they differ sharply the instrument is measuring familiarity and the dashboard says so on the view. |
| `teach_dose` | `dismissedAt`, or 5 if the scenes were completed. The dose is a mandatory cut too: if respondents who saw all five place activities differently from those who dismissed at stop 0, the teaching is doing work and the size of that work is measurable rather than argued about. |
| `boundary_dwell` | `dwellMs.briefed + dwellMs.standing`. Instruments the inspection line — the boundary every reading of this ladder agrees is load-bearing and the one respondents will misplace. |
| `decay` | Distribution of `reopenedAt`. Reopens concentrated in the back half of the deck say the glyph legend is not holding and the concrete picture is being lost by card nine. That is this design's own failure condition, instrumented. |
| `chipOrder` | Lets the analysis regress lane choice on vertical position and report whether the list order was doing work. Without it, randomisation is a hope. |
| `satisficing_flag` | Extends with: dismissed at stop 0 **and** first card laned in under 3s. That is a signal before any of the thirteen answers arrive. |

**Two things the schema blocks rather than discourages.** A summed or averaged "AI maturity score" across activities — the ladder is per-activity and per-activity only, an Associate can sit at `service` for CRM and `own` for the proposal. And the raw per-respondent lane vector reaching the dashboard: thirteen activities at three lanes plus five exposure bits is still a sharp fingerprint against N of 150-400, and the refit's twelve-cell grid with n = 10 suppression stops being a recommendation and becomes a precondition. Export marginals and the per-item (lane × clip) co-occurrence. Nothing else.

### The keyboard path

Every target 44px or more, focus never leaves the content column, and the focus ring is the repaired two-tone token, not the 2px ice that measures 1.02:1 on the dawn gradient.

**Beat 0.** Tab order: the scenes group → *"I've worked this way"* → *"I haven't"* → ‹ prev → › next → *"I've got it"*. The group is `role="group"`, `aria-roledescription="five scenes"`, `aria-label="One meeting, five Mondays"`, `tabindex=0`; the five stops are a linear sequence, not a tablist. Left/Right and Home/End move between stops from inside the group without leaving it. Enter or Space on either exposure chip records and advances. The ‹ › buttons re-read freely **without overwriting an answer**, so a respondent can go back and compare `briefed` with `standing` — the comparison most worth making — without destroying data. `Esc` dismisses and moves focus to the first lane chip. The inner prev/next are real `<button>`s so someone who never discovers the arrow keys still has a tab-reachable path, and each stop's three slots sit inside the group in DOM order, so a screen reader reaches the scene, the gain and the cost without using arrows at all.

**Every card of beat 1.** `1` / `2` / `3` place the current card in the chips top to bottom **as displayed**, which is why `chipOrder` is logged; `0` places "I haven't done this one". `E` toggles the scenes inline. The reopen trigger is a real `<button>` with `aria-expanded` and `aria-controls`; opening moves focus into the group and `Esc` closes and **returns focus to the trigger**. That is the one focus-return bug this pattern always ships with, and it gets its own test.

**Accessible names.** Each lane chip's accessible name is label then caption: *"It goes without me. Nobody reads this one before it goes; I see a sample, or the one that broke."* The SVG is `aria-hidden` in full; the caption is its text equivalent and carries the same load-bearing fact the sighted user reads off the square's position, which is why the caption is a sentence and not a label.

**One `aria-live="polite"` region, never two.** On stop change: *"Scene three of five. I brief it, then I check it. It was finished before you saw it; you still read all twelve."* On placement, unchanged in shape: *"The portfolio review pack — it drafts, I check every one. Twelve remaining."* On dismiss: *"Scenes closed. Three choices."*

One deliberate inconsistency, named because it is a real trade: numerals are banned from the visible UI because they encode a ladder, but the announcement says "three of five". A screen reader user cannot see five equal dots and non-linear access without position is worse than a faint ordinal. The two experiences differ here on purpose.

### The seconds

Priced on the refit's basis: the median respondent.

| | s |
| --- | --- |
| Beat 0 (the scenes), five stops at ~6.5s plus header | **+34** |
| Beat 0 (the old thirteen-item list), deleted | **−30** of real wall-clock, **0** against the written ledger |
| Beat 1, thirteen cards at ~4.7s against ~4.5s (glyph settles by card three) | **+3** |
| Beats 2 and 3 | 0 |

**The arithmetic, honestly.** The refit prices the Handover at 115s = 58 + 22 + 35, which sums exactly and therefore never charged beat 0 at all. Real wall-clock today is ~735s, not the written 705s. Deleting beat 0 refunds a cost the ledger never carried, so both bases converge on the same answer: **742s, 12 minutes 22 seconds**, which is 22 seconds over the ceiling. The Handover goes 115s → 152s written, ~145s → 152s real.

Something has to pay, and it should be said to the working group in these words rather than absorbed. The candidate is the **`classroom` trial (−30s)**, taking the instrument to **712s, 11:52**, inside the ceiling. The named loss: `classroom_agreement` drops from a three-way description to a two-way one — the `fuel_rank` leg and the brick-placement leg survive, the trial leg goes, and the refit already labels that check as weakened by priming. Do not pay for it out of the reckoning, which is the only within-minute honesty check in the instrument.

If the pretest reads the scenes at 45s rather than 34s, the first cut is the *"What it costs"* line on `own` and `assisted`, where it is least load-bearing — about eight seconds — and the second is folding the exposure chips into a single one-tap row at the end rather than one per stop, which costs the per-rung resolution of `seen`.


---

## What the Handover becomes

**Plainly: the three lanes stay three. They do not become the ladder's five rungs.** The ladder is taught at five and answered at three.

### Why that is defensible and not a fudge

Teaching resolution and answer resolution are different problems, and only the second has to be reliable. Five named scenes are what make AI concrete — that is the actual request, and it is fully delivered. Five *answers* buy one boundary worth having and one that generates noise, and cost a great deal.

Of the four boundaries the ladder draws, only two would be new answers relative to three lanes. `own` | `assisted` is reliable and developmentally and policy-wise close to null — the Associate is producing in both cases. `standing` | `service` is the one that turns on whose standard is encoded, and in a bank, where an Associate cannot deploy anything and the firm can, it is the least answerable question on the whole scale. So five options add the least useful distinction and the least reliable one, in exchange for:

- **Fingerprint.** 5^13 against 3^13 on a screen whose whole promise is "patterns, not people". The refit's twelve-cell grid with n = 10 suppression is already an unsolved precondition; five rungs make it materially harder rather than easier.
- **Seconds.** Roughly 1.5-2s more reading per card across thirteen cards, on a budget that is already 22s over before the ladder lands.
- **Geometry.** Five options are necessarily a vertical list on a 360px card, which reinstates the up-is-better reading the horizontal teaching spends thirty-four seconds suppressing. Three is the same problem at a smaller size, and randomisation answers three where it cannot answer five.
- **Arithmetic.** `appetite[i]` as a 0-4 mean assumes the `assisted`→`briefed` gap equals the `briefed`→`standing` gap. Both are changes of kind (producing to approving, every instance to some instances) while the others are changes of degree, so the mean is not a quantity.
- **The persist path.** `Lane` → `Rung` touches `useStore.ts:7,13`, `validate.ts`, `lib/demo.ts:6-8`, `L8Summit.tsx:14-15,34` and three places in `L3Handover.tsx`, plus a version bump to 2 that has to drop rather than migrate, because a three-lane answer is not a five-rung answer.

The collapse is `{own, assisted} → human`, `{briefed} → both`, `{standing, service} → agent`, and it must be **drawn on the chip** — two strips on `human` and `agent`, one on `both` — never left for the respondent to infer. A respondent who has just learned a five-point vocabulary and is then handed three chips with no mapping has to collapse it themselves, differently from the person next to them, and hard constraint 1 is broken by the fix rather than by the problem.

### What does change on the three

The lane boundary moves onto the **inspection line**. `"An agent does it / No human in the loop"` is a claim about an agent. `"It goes without me / Nobody reads this one before it goes"` is a claim about observable behaviour, answerable from memory with no proportion judgement in it. The middle lane stops straddling two different things. The bottom lane loses the philosophy — `"The judgement is the job"` becomes `"Mine to build, whatever helps me build it"` — which correctly puts chat and cowork inside it, so an Associate who uses a chatbot twice a week is not left wondering whether they still qualify.

Plus one thing no design supplied and the build has been shipping since the refit: **randomise the vertical order of the three lanes per respondent and log the permutation.** A vertical list of three reads top-to-bottom as a scale. The order is fixed for the whole deck, not per card.

### What it does to the headline chart

Less than you would fear. This is a set of re-labels, not a re-derivation.

| Metric | Definition | Computation | Meaning |
| --- | --- | --- | --- |
| `appetite[i]` | agent=2, both=1, human=0 | unchanged | sharper; the x-axis is renamed from *automation appetite* to *how far this should go before an Associate reads it* |
| `clip_rate[i]` | unchanged | unchanged | unchanged |
| `clip_borda[i]` | unchanged | unchanged | unchanged |
| `trap_strict[i]` | agent lane ∧ clipped | **unchanged** | this is the prize — see below |
| `handover_lift[i]` | `P(agent ∧ clip) / (P(agent) × P(clip))` | unchanged | unchanged |
| `protected[i]` | high human share ∧ high clip_rate | unchanged | unchanged |
| `notmine_rate[i]` | unchanged | unchanged | unchanged |
| `safe_to_take[i]` | high appetite, bottom-quartile clip_rate | unchanged | `pitchbook` excluded |
| `together_share`, `all_human_flag`, `all_agent_flag`, `reveal_flinch`, `conflict_count` | unchanged | unchanged | unchanged |

**`trap_strict[i]` needs no re-specification. It needed this lane definition.** Today it reads *"would say an agent does it, and says it taught them"*, where the first half is a guess about a phrase. After this it reads *"would let it go out with nobody reading it, and says it taught them"* — which is literally the sponsor's pipeline claim, because a developmental rep is a rep of judging finished work, and those survive intact through the middle lane and stop dead at the top one.

One optional upgrade, worth taking and separable from everything else: report the scatter's x-axis as **`unread_share[i]`**, the share who placed that activity in the top lane. Under the re-cut lanes it is arithmetically just `agent_share`, it needs no interval assumption, and it states the sponsor's question on the axis. Keep `appetite[i]` as a collapsed secondary so the twelve-cell grid and any continuity read do not have to be rebuilt.

### What three lanes cannot hold, priced rather than hidden

Who owns the standard. *"The book the desk runs on"* and *"the book that arrives"* are developmentally identical — nobody reads the instance in either — but for a bank they are very different answers, and both collapse into `agent`. That is a deliberate omission. It is recoverable later as one ~9s chip row at the end of beat 1 over the `agent`-lane items only (*"Where you put something in the top lane, who would set it up: you, your desk, or the firm?"*), which would put this change at +46s net rather than +37s. It is **not** recoverable from Level 0's exposure chips, and it should not be claimed as such. Leave it out of v1 and say so to the working group rather than quietly spending nine seconds.

### Two things that go in the limitations, in the same paragraph as the existing `trap_strict` caveat

1. **The teaching is a prime,** in the direction the sponsor most needs unbiased. Making five modes of automation concrete makes them cognitively available, and measured appetite will sit higher than a three-lane baseline. **Only the ordering across the thirteen is interpretable, never the level.** Any pilot data collected on the old lane copy is void, not adjustable.
2. **`pitchbook` carries the teaching** and is reported with an asterisk, excluded from the item-median quadrant lines and from `safe_to_take`, and plotted as an open ring.

---

## Neutrality

The respondent is being asked whether their own job should be automated. A screen that makes automation look exciting biases them toward it; one that makes it look threatening biases them the other way. Neutrality here is a layout problem before it is a copy problem, and each device below is checkable before it ships.

**1. Geometry.** Horizontal, work moving *away* from you, left to right. No vertical stack of rungs, no numerals anywhere in the visible UI, no accumulation, no level-up motion. The five-dot indicator is unnumbered and the stops are named, not counted. A vertical metaphor is climbed and climbing is improvement — constraint 5 would die before a word was read.

**2. No gold on this screen, including the dismiss.** Gold is this build's reward and CTA colour (`globals.css:45-49`, `L3Handover.tsx:62,120`, the FooterBar). A gold control at the foot of a five-step sequence reads as a summit and makes the most automated scene the destination. The dismiss is a plain chip in the same position whether you reach stop five or leave at stop one. The exposure chips use the new neutral chosen state, not the gold one.

**3. The baseline is priced.** `own` gets a real cost named in the same slot as every other rung — Monday night gone, and nobody caught the two errors before the Advisor did. If "I do it" reads as pure virtue, the screen biases against automation exactly as hard as a gold summit biases toward it, and the refusenik answer stops being a considered one.

**4. The planted error, non-monotone.** Page nine is wrong at every stop, and who catches it goes: the Advisor, nobody, you, nobody, the service's own check. Caught at one, three and five; missed at two and four. There is no direction in which errors get worse, so the eye cannot extract "further along is riskier" or "further along is safer". This is both the neutrality device and the true picture, which is why it is the load-bearing one — and it costs nothing but copy.

**5. Equal structure, enforced as a contract rather than a style note.** Three slots, same labels, same order, same position at every stop, within six words of each other, and every stop names one thing you get and one thing you stop seeing. Captions are 8-14 words and structurally parallel. Scene prose is within 10% on word count. Write it as a lint rule over the content file, not as an aspiration, and fail the build on it.

**6. No hue, no counter, no clock.** Human ink and machine ink are the same luminance and chroma, different weave. Nothing is red, nothing is green, nothing is emptier or fuller. **No hours-saved figure anywhere** — not in copy, not in a caption, not in a tooltip, not in aria text. An hours-saved number is the strongest pro-automation prime available and the refit already bars the counter. Not a symmetric elapsed-time row either: a duration in the same slot at all five stops reads as a column and becomes an hours-saved counter by arithmetic. Each stop names one cost *in its own kind* — your evening, a fluent error you kept, a brief you now have to be good at, a standard frozen in January, a call you cannot reconstruct in front of a client. The `timeSaved` figures in the working-group notes are build notes and never reach a respondent's screen.

**7. Tense, pinned in three places.** The scenes are present tense — all five exist somewhere today. The question is future — where each job *should* sit in two years. The stem, the sub and the aria-live all carry it; the headline alone is not enough. This matters most for `suitability`, where marketing review is **already** a shared service on the desk, so the descriptive and normative readings give opposite answers. It is the one item of the thirteen where a respondent answering descriptively will place it in the top lane and mean "that is how it already works".

**8. Randomised chip order, logged.** The three lanes are a vertical list and a vertical list is a scale. Randomising per respondent turns the residual order effect into something the analysis can measure from `chipOrder` rather than something it has to assume away.

### What neutrality cannot reach, stated rather than papered over

**Vividness asymmetry.** `standing` and `service` are novel, novel is vivid, and vivid gets chosen. Equal word counts do not equalise vividness. Two partial defences: every scene is the same client, the same book, the same Monday, so the novelty is in what happens to the work rather than in the scenery; and `own` and `assisted` get the most concrete, most dated human detail in the set (red pen at seven, 5:15 and 6:10, forty minutes) while `standing` and `service` get dull operational detail (two at random a fortnight, a ticket in a queue). The only test that works is the cognitive pretest: ask five Associates to describe each stop back in their own words and check that *"It helps while I work"* comes back as concretely as *"It's a service"*. If it does not, the copy has failed and no amount of layout saves it.

**Suppression is still free.** Thirteen cards into "I do it" and the reckoning never fires, so the defensive answer costs less effort than a candid one. `all_human_flag` labels that rather than preventing it, and it is read as a psychological-safety measure beside `mark.score`, not as a preference. Nothing in this design changes that and it should not be claimed as fixed.

**The ceiling nothing fixes.** This is still retrospective self-report about a counterfactual. An Associate cannot reliably know where the judgement point should sit for an activity they have only ever done one way, and the scenes make the question harder to answer honestly precisely by making it concrete enough to answer at all. Say that on the view, not in an appendix.

---

## Build order

Nine items, ~29 hours, about four working days for one person. Items 1-3 are the critical path; 9 runs in parallel from day one and gates the merge.

| # | What | Hours | Files |
| --- | --- | --- | --- |
| 1 | **Content.** Rewrite `LANES` to `label` + `caption` (drop `sub`). Rewrite all thirteen `ACTIVITIES` glosses to name one instance. Add `VIGNETTE` (the Delgado paragraph and the compressed header chip) and `SCENES` — five records of `{ rung, title, happens, get, costs, caption }`. Add the copy lint: three slots present on every scene, within six words, caption 8-14 words, no digit followed by "hour" or "minute" anywhere in `SCENES`. | 3.0 | `src/content/content.ts`, `scripts/lint-content.mjs` (new) |
| 2 | **Store and validators.** Add `Rung` (teaching only — `Lane` untouched). Add `handover.itemOrder`, `laneChanges`, `laneMs` and the `teach` record. Extend `emptyAnswers` and `validateAnswers`: default `teach` on a v1 blob rather than migrating, clamp ms to 0-36e5, cap `reopenedAt` at thirteen unique ints in 0..12, check `chipOrder` is a permutation of the three lane ids and fall back if not, restrict `seen` and `dwellMs` keys to the five rung ids, clamp `dismissedAt` to 0-4 or null. **No version bump.** | 3.0 | `src/store/useStore.ts`, `src/store/validate.ts` |
| 3 | **`RunStrip`.** The SVG device: twelve tiles, gate, square, underline, bracket glyph, chevron; five states; `size="chip" \| "stop"`; `aria-hidden`; 180ms `translateX`, 200ms draw at `briefed`, 120ms crossfade; full `prefers-reduced-motion` branch with the static bracket at `briefed`; hatch → 45° diagonal below 320px. | 5.0 | `src/components/RunStrip.tsx` (new) |
| 4 | **`Scenes`.** The five-stop filmstrip: `role="group"`, `aria-roledescription`, Left/Right/Home/End, two exposure chips that record and advance, prev/next `<button>`s, unnumbered dots, plain dismiss, `Esc` to dismiss, one `aria-live` region, dwell timers split first-visit / re-visit, `backSteps`. | 6.0 | `src/components/Scenes.tsx` (new) |
| 5 | **Rewire L3.** Delete beat 0 (lines 50-65). Mount `Scenes` inline above card 1, auto-open once. Generate `itemOrder` and `chipOrder` in a **mount effect** and persist — never during render. Deal from `itemOrder`. Chips render `RunStrip` glyphs plus captions in `chipOrder`; `1`/`2`/`3` map to displayed position; `0` for "I haven't done this one"; `E` toggles. Add the reopen `<button>` with `aria-expanded` / `aria-controls` and focus return on `Esc`. Record `laneChanges` and `laneMs`. | 5.0 | `src/levels/L3Handover.tsx` |
| 6 | **Tokens.** Add `.chip[data-on="true"][data-neutral]` — snow border, no fill shift, no hue — and apply it to the exposure chips. Re-check it and the focus ring clear 3:1 against the glass at all six sky stops, per the refit's token repair. | 1.5 | `src/app/globals.css` |
| 7 | **Fix the walkthrough.** `e2e/walk.mjs:110` hard-codes `['An agent does it', 'An agent drafts, I own it', 'I do it']` and will fail on the new copy and on the randomised order. Select lane chips by index rather than by text, drive the new beat 0 (five stops, one exposure tap each, then dismiss), and add the two tests this pattern always ships broken: `Esc` from the reopened scenes returns focus to its trigger, and `itemOrder` persisted at mount is stable across a reload. | 2.5 | `e2e/walk.mjs` |
| 8 | **Pay for it.** Cut the `classroom` trial from `TRIALS`. Update `docs/reviews/ascent-strategic-refit.md`: the run-of-play table (115s → 152s for the Handover, trials 60s → 30s, total 705s → 712s), the honesty-check table (`classroom_agreement` becomes two-way), and the limitations paragraph (the prime; `pitchbook` flagged; beat 0 was never in the 705s). | 1.0 | `src/content/content.ts`, `docs/reviews/ascent-strategic-refit.md` |
| 9 | **The pretest, which is a merge gate.** Five Associates. The three lane captions read cold, three activities each, thinking aloud, and at least two of them non-artefact — `movemoney` and `coordinate`. Then ask each to describe the five stops back in their own words. **Two fails it:** if two Associates put the same activity in different lanes, the captions are wrong. If `own` and `assisted` come back thinner than `service`, the copy has failed on vividness and the numbers will lean automated whatever the chips say. In either case the three abstract lanes remain the safer instrument and this does not ship. | 2.0 prep | — |

### Three things to say out loud to the working group before build starts

1. **The budget.** The refit's 705s never contained beat 0, so deleting it refunds nothing against the written ledger. This ships at 742s (12:22), over the 720s ceiling. Cutting the `classroom` trial brings it to 712s (11:52) and costs `classroom_agreement` its third leg. That is a choice they make, not one the build makes for them.
2. **The omission.** Three lanes cannot tell "the book the desk runs on" from "the book that arrives", and in a bank those are different answers. Recovering it is a ~9s chip row over the top-lane items only, taking this to +46s. It is out of v1 deliberately.
3. **Nothing here has been in front of an Associate.** Everything above is reasoning from the desk and from the build. The system nouns in the vignette — LLM Suite, the CRM contact report, the Investor, the collar level, the capital call date — must be confirmed against a real desk before the vignette is frozen, on the same rule the refit applies to the item list.
