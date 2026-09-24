# The Ascent — strategic refit for the analyst survey

**The verdict.** Against the sponsor's eight key questions, the spec as written can answer about a quarter: the mean coverage across 1a-4b is 193/8 = 24%, and the brief's own "fundamental question" sits at roughly 10%. The single structural mismatch is that the instrument measures *learning sources* and the brief asks about *activities*: developmental value is collected over ten items like "the morning meeting" and "my cohort", automation appetite over five artefacts like "pitchbooks, briefing books, CRM updates" plus an opt-out, and the intersection of those two id sets is empty, so the quadrant the sponsor needs (high automatable × high developmental value) cannot be computed from this dataset at any sample size. Two screens are missing entirely: an activity triage that puts both axes on the same object, and an allocation of the capacity AI releases. The refit adds those two screens, deletes three existing levels and three of the five trials to pay for them, rebuilds the advisor screen into the mentorship instrument the brief asks for, and lifts mean coverage to 67%. Note what the second screen is not: spec line 14 promises "Today's time split appears once, as a budget", and a forward allocation of released hours is a different construct. That row of the spec stays unfulfilled, deliberately, because the sponsor's 3a asks about redeployment and not about today. Dropping the ECM variant helps rather than hurts: it frees the three-audience comparison budget and releases the MaxDiff engine, which is prioritisation machinery currently aimed at the wrong list. It also costs something real, and the refit pays that cost back explicitly — see Level 2.

## Where the spec stands against the brief

Coverage is scored now → after the refit. The post-refit column is the basis for the 67% claim (80+75+45+65+85+55+60+70 = 535, /8 = 67%), and it is deliberately conservative on 2a, which the refit does not solve.

| Key question | What the spec has | Coverage | What the sponsor could not read off this data |
| --- | --- | --- | --- |
| **1a** Which activities automated / AI-assisted / human-led | One branch of one trial: `agents` → "What would you hand them first? (multi: pitchbooks, briefing books, CRM updates, performance reports, first drafts of client emails, nothing client-facing)" | **15% → 80%** | The three-way split itself. The instrument offers one binary, so it cannot distinguish "the agent drafts it and I rewrite" from "the agent produces it", and that middle band is exactly where the pipeline can be preserved. "Human-led" exists only as a non-selection, indistinguishable from satisficing. The words "automate", "automated" and "automation" appear zero times in 406 lines. "First" is asked as an uncapped multi-select, so every pick is tied and nothing is prioritised. |
| **1b** Where hands-on experience is still needed | Fuel MaxDiff (10 sources, 6 rounds), Fuel podium, the Level 7 canvas and `build_delta`, plus `compress` no-branch: "What can't be skipped? (multi: a market cycle, hours in front of clients, product breadth, my own confidence)" | **40% → 75%** | 1b as the brief poses it. The load-bearing word is "continued", meaning going forward with AI in the room, and no mechanic pairs an activity with AI availability. Of the four "can't be skipped" options only "hours in front of clients" is an activity; the others are a duration, a coverage and a mood. There is no screen on which a respondent can say "don't automate the first draft of the client email, that is how I learned to write to a client." |
| **2a** Judgment, critical thinking, what "good" looks like under AI | `judge Commercial judgement` as one of ten cards sorted born/built/still; MaxDiff; two chips inside the `certify` yes-branch | **15% → 45%** | Anything about what good looks like. Nothing asks how an analyst knows a deliverable is ready to send, who calibrates that, or whether they can tell a good AI draft from a plausible wrong one. Zero of the ten fuel items reference AI, a model, a draft to critique or checking output against a source, so the MaxDiff returns a clean ranked chart of the pre-AI development diet and will be mistaken for a measurement of the new regime. **This is the refit's largest remaining hole and it is not closed: three instruments point at it (the `aicritique` fuel item, the `standard` and `check` items on Level 2, the `checkai` capacity tile) and none of them measures whether an analyst can tell a plausible wrong answer from a right one.** Closing it needs a judgement task with a right answer, which is a different instrument. |
| **2b** How mentorship and coaching should evolve | Three mentorship-adjacent fuel items, `dna.advisorDial`, the `shadow` brick, `mentor_contradiction` | **25% → 65%** | "Evolve" needs a delta, and nothing asks what a mentor should do *differently*. The dial measures how much the advisor mattered, not what the advisor's job becomes when the analyst's first draft arrives from a model. No item covers coaching cadence, feedback quality, who should coach, or the shift from teaching how to build a deliverable to teaching how to check one. The refit's Level 2 exists for this row and for 4a-management. |
| **3a** How released capacity should be redeployed | The `agents` yes-branch (which enumerates what AI absorbs, not where the time goes) and, loosely, the canvas's 10-units-per-year columns | **10% → 85%** | The decision itself. No screen presents client-facing time, deeper analysis, prospecting, learning or "give the hours back" as competing destinations, so none can be ranked against the others. The canvas budget allocates the *next cohort's development*, not the respondent's released hours, and its constraint does not bind: the palette sums to 1+2+1+2+1+1+3+2+1+2+2+1+1+1+1 = 22 units against 3 × 10 = 30 capacity, so a respondent can place every brick and hold 8 units (27%) spare. |
| **3b** Contributing more to client outcomes, Advisor productivity, growth | `readiness.readyFor` chips; `mark.missing` free text | **8% → 55%** | All three clauses. Text search across 406 lines: "productivity" 0 hits, "growth" 0, "revenue" 0, "impact" 0, "outcome" 0. The one advisor instrument runs backwards: `advisorDial` measures the Advisor's effect on the Analyst, and 3b asks the reverse. The eight dashboard views contain no impact view to segment. After the refit 3b rests on `channel_share` from the capacity screen alone, which is a statement of intent and not a measure of contribution. |
| **4a** Changes to people, process, training, management, technology | The build canvas (15 bricks), trials `certify` / `avatars` / `classroom`, `mark.change`, `build_mix`, `gate_first_year` | **45% → 60%** | Four of the five named domains. The palette splits 6 bricks to training, 4 to process and gating, 1 to people (`shadow`), 1 to technology (`agents`), 0 to management practices. Every process in scope is a *programme* process; none is a *work* process, so nothing asks who reviews AI-assisted output before it reaches a client or who is accountable when the machine is wrong. The `accountable` and `standard` items on the rebuilt Level 2 are the refit's answer to management practices; they are chips, not a measurement of practice. |
| **4b** What needs to remain in place | Arm B and `build_delta` ("Bricks removed, added, moved earlier, moved later vs the pre-laid programme"), `compress` no-branch, MaxDiff as a proxy | **35% → 70%** | What must remain *under AI pressure*. MaxDiff finds what taught people most; nothing then asks which of those AI can now do, and the brief's fundamental question is the intersection of those two sets. `build_delta` also cannot distinguish removal-by-automation from removal-by-deprioritisation: a respondent who cuts `own Own a client deliverable` might mean "AI does this now" or "this was a waste of time", and the dataset cannot say which. The Handover is 4b's strongest instrument after the refit, because `protected[i]` is precisely that intersection. |

Three patterns run through the table. First, the instrument's vocabulary problem: it carries four disjoint activity lists (`readiness.readyFor`, the ten fuel items, the five `agents` deliverables, the fifteen bricks) and the `agents` list shares not one stable id with any other, which is why 1a, 3a and the fundamental question all collapse together. Second, the conditionality problem: the two substantive lists sit behind opposite branches, 1a's needs `agents = yes` and 1b's sharpest needs `compress = no`, so at a plausible 70% yes on each they are supplied by 0.7 × 0.3 = 21% of the sample jointly, and the individual-level crossing that would surface the central tension inside one person's answers rests on an unquotaed fifth of respondents. Third, the spec's coverage is inverted against the brief's weight: its unconditional, universal effort (six MaxDiff rounds) is spent entirely within a pre-AI frame, while its forward-looking effort (`build_delta`) is conditional on a 50/50 arm and on an artefact that does not yet exist. The opening table's claim that "Nine of ten levels are about what made them" also overstates the research content: Level 0 is consent and Level 9 is a reward screen, so eight levels carry signal, and five of those eight look backward.

**On the vocabulary problem, be clear about what the refit does and does not fix.** It fixes it *inside* the Handover, where thirteen ids carry both axes. It does not fix it across the instrument: after the refit there are still the thirteen Handover ids, five readiness chips, nine fuel items, nine capacity destinations and nineteen bricks, and the refit adds the fifth of those lists rather than removing one. The cheap mitigation, and the one thing `packages/schema` must carry, is a declared canonical vocabulary — the thirteen Handover ids — and a required mapping file in which every other list states its relation to it, with an explicit empty mapping where none exists. That turns an invisible defect into a documented one and makes cross-list metrics either computable or visibly impossible, which is the state `handover_fuel_convergence` and `handover_build_protection` were in when this draft still claimed them.

## The one thing missing

**The Handover.** Thirteen real analyst jobs get dragged into three lanes, then the respondent gets up to five gold clips to mark the ones where doing it themselves is how they learned what good looks like. The overlap between "hand it over" and "it made me" is the quadrant the sponsor cannot currently compute.

This single screen is what turns the instrument from "how were advisors made" into an answer to the sponsor's actual question, because it is the only place in the build where automation appetite and developmental value are recorded against the *same object id* by the *same person in the same minute* — which is the arithmetic precondition for the brief's fundamental question, that "Analysts developed expertise by performing the very activities that AI is increasingly capable of performing." Everywhere else in the spec those two judgements live in different item universes on different screens behind opposite branches, so the sponsor gets two marginal distributions and no way to tell whether the people who would automate the briefing book are the people it taught.

### Where it slots, and what pays for it

New Level 3, after the advisor screen and before the trials. It sits after Fuel and before the build canvas, and that placement is a deliberate prime: Fuel puts the respondent in mind of what teaches, and the canvas then asks them to design with the activities fresh. The consequence is stated once and honoured throughout: **nothing downstream of a deliberate prime may be used as independent corroboration of the thing that primed it.** That rules out the two cross-screen honesty checks an earlier draft of this document proposed, and the honesty table below no longer contains them. It costs 115 seconds, paid for by deleting Level 3 Fuel podium and Level 4 DNA sort.

### The mechanic: three beats of one interaction

**Beat 1, the lanes.** Three drop lanes: **Agent runs it** / **Agent drafts, I own it** / **I run it**. Thirteen activity cards start in a tray, tray order randomised per respondent and logged. A fourth, uncapped slot sits in the tray, "Haven't done this one", and its contents are excluded from every denominator. Cards already laned stay visible and re-lanable; each re-lane is logged as deliberation, not as a correction. No lane is capped. The scarcity goes on the development axis only, because that is the axis that inflates, and capping the automation lanes would distort the number the sponsor wants unbiased.

Desktop (1024px+): dnd-kit, left tray, three tall lanes, all thirteen cards visible without scrolling, the same pattern as BrickCanvas minus capacity. Tap-to-select then tap-a-lane as the fallback, exactly as the canvas does.

Phone (360px+): three columns at 360px gives 104px lanes, which is not a card, so the card comes centre-stage one at a time (CardStack, reused) with three full-width 44px drop bars stacked beneath. Buttons are the primary path, a flick toward a bar is the enhancement, per the spec's own CardStack rule that "buttons are the primary path, swipe is enhancement". Each bar carries a count badge that opens a peek drawer. When the thirteenth card lands, the phone gets a **review step** the desktop gets for free: all thirteen as compact chips grouped by lane, each re-lanable, so the phone respondent can compare across items before beat 2 rather than answering thirteen isolated questions. Whether they opened it is recorded as `reviewedWall`.

**Beat 2, the clips.** The tray empties with the settle-and-click physics the spec already specifies for bricks, and five gold carabiners slide into the header. Copy changes; the lanes stay on screen, greyed but intact. That adjacency is the instrument: the respondent is looking at their own handover decisions while answering what taught them. Tapping any card clips it; clip order is the rank. A sixth clip attempt bounces the wall the way an over-capacity brick does. **Five is a cap, not a quota.** A respondent who believes three activities taught them clips three and proceeds; `clip_count` is itself data, and forcing five would manufacture conflicts at beat 3 and inflate `trap_strict` by construction. The CTA enables at one clip, with a single explicit "none of these taught me much" path that records zero.

**Beat 3, the reckoning.** Fires only if any clipped card sits in the "Agent runs it" lane. Before it renders, `preReveal` is snapshotted, so the pre-reckoning allocation survives intact and every later edit is flagged rather than silently merged. The respondent first sees a plain count of what they did, then at most three conflicted items (highest clip rank first), each with a single chip row and a 140-character optional text field. This is the only place in the whole instrument where a respondent is shown a tension in their own answers, and it is framed as curiosity rather than as a challenge.

**Why three beats is still one mechanic.** The spec's rule is that "if a screen needs two interaction types it is two screens". The claim here is one interaction type, place-and-mark on a single persistent wall, sequenced so exactly one thing is actionable at a time. If the working group rejects the reading, split into 3a (lanes) and 3b (clips plus reckoning) with the same item ids and the same wall on screen. Nothing in the data model or the quadrant changes; the cost is a wasted screen transition and the loss of the moment where the clips land on a wall the respondent has just built.

### The item list (13)

The spec's own escape hatch for the brick palette ("Programme owners should replace these with the real components before launch") applies here with more force, because a missing category cannot be recovered by rewording. **This list must be confirmed against a real Private Bank desk before launch, not merely pretested for wording.** The version below is already one revision past a generic buy-side support list: lending, the investment proposal, money movement, supervisory review and specialist coordination are in because they are core Private Bank analyst work; trade support is out because at Private Bank scale it sits with middle office, so its `notmine_rate` would have measured the division of labour rather than exposure. Document production has been consolidated from four near-duplicates to three items (of which one, `proposal`, is a judgement task), so the item universe no longer over-weights the work large language models are best at. Alternatives administration (subscription documents, capital calls) and trade support are the two named reserves; if the pretest finds either is central on the target desks, it replaces the weakest item rather than extending the list, because thirteen is what the five-clip cap and the 115 seconds are priced against.

| id | Label as shown |
| --- | --- |
| `proposal` | Building the investment proposal: the allocation, the Wealth Plan, the case for the change |
| `pitchbook` | The pitchbook and the briefing book for a prospect or client meeting |
| `reviewpack` | The portfolio review pack: performance, allocation, what changed and why |
| `lending` | Lending and credit: mortgage and securities-based requests, building the credit package |
| `movemoney` | Moving money: wires, transfers, payment approvals, chasing the exception |
| `suitability` | Getting it past review: suitability, supervisory and marketing checks before it reaches a client |
| `research` | Reading the research and turning it into something the Advisor can actually say to a client |
| `clientmail` | Drafting the client email or the follow-up note the Advisor sends |
| `coordinate` | Coordinating the specialists: banker, investor, lender, trust and estate, tax — keeping one story |
| `prospect` | Building the prospect list: screening names, mapping who knows whom |
| `onboard` | Onboarding and KYC: account opening, chasing documents, remediation |
| `cash` | Cash and liquidity: margin, upcoming calls, idle balances |
| `crm` | Keeping the record straight: contact reports, follow-ups, who owes what by when |

Every gloss names both the artefact and the judgement inside it, because the sharpest construct-validity risk on this screen is that "the portfolio review pack" is a data pull plus a recommendation, a respondent sends it to the agent meaning only the data pull, and the sponsor reads it as the recommendation. That misreading is precisely the naive automation the brief exists to prevent. **These thirteen glosses must go through think-aloud cognitive pretesting with 5-8 current analysts before launch**, the same discipline the spec already applies to the traits. The pretest has a second job, separate from wording: test whether the fear defence works. Ask each participant, after the walkthrough, what they believe this screen will be used for and whether they answered differently because of it. If the answer is "headcount", no amount of copy repair will fix the number.

### On-screen copy

```
BEAT 1
Headline:  Thirteen jobs. Who should be doing them in two years?
Sub:       Drag each one to a lane. We're trying to find the work we can't
           quietly automate.
Permission line (14px, ink.2, visible throughout):
           This feeds two things: what the programme should teach, and where
           the firm puts AI first. Your answers reach the working group under
           a code, never with your name on them.
Aside (the screen's one wink):  Keeping the record straight is on the list. We know.
Lanes:     Agent runs it  ·  Agent drafts, I own it  ·  I run it
Lane subs: No human in the loop. / It comes to me half-built. / The judgement is the job.
Tray slot: Haven't done this one
Live line: 9 of 13 placed. Four still in the pack.

BEAT 2
Headline:  Now the ones that taught you the job.
Sub:       Up to five. Not the ones you enjoyed — the ones where doing it
           yourself is how you learned what good looks like.
Counter:   Three clips left.  →  That's five. You can swap one out.
At the cap: Five hooks. Something has to come off.
Escape:    None of these taught me much

BEAT 3
Count line (rendered after preReveal is snapshotted):
           You'd hand seven to an agent. Three of those are clipped.
Headline:  One thing doesn't add up, and it's the interesting bit.
Body:      You'd hand the briefing book to an agent. It's also one of the
           ones that taught you.
Question:  So how does the next analyst learn that?
Chips:     Do it by hand for the first year, then hand it over ·
           Mark up the agent's draft with the Advisor ·
           Be shown a wrong-but-plausible draft and made to find the error ·
           Sit in the meeting the book was for ·
           A harder version of it, less often ·
           They don't need to learn it — that's fine ·
           They don't, and the desk needs fewer analysts. That's the honest answer.
Text:      In your words, if you have them.  (140 chars, optional)
Controls:  That's my answer   ·   Change something

NULL CASE (no clipped item in the agent lane)
           You'd hand seven to an agent and none of them taught you much.
           Worth knowing.
```

**On candour, what the design does and what it cannot do.** Four devices carry it: the fear is named once in plain words from a peer rather than in a privacy paragraph; handing something over is never scored as a loss, so there is no hours-saved counter and no reward for automating; the reckoning asks for a replacement rather than a defence, which lets an analyst hand over their own formative work without arguing themselves out of a job; and the last beat-3 chip lets a respondent say the structural thing out loud, because a screen that fears a belief and then gives it nowhere to go has not measured it. Four things it does not do, which should be written into the limitations rather than argued away. The permission line makes a promise about *use*, and the working group must actually commit to it in writing or the line must be cut — the brief's secondary output is literally to "prioritise opportunities to use AI to enhance and augment Analyst roles", and `safe_to_take[i]` is that list, so a respondent who reads the screen as an input to prioritisation is reading it correctly. The design also makes the defensive answer the cheapest: thirteen cards into "I run it" skips beat 3 by construction, so suppression costs less effort than candour, and `all_human_flag` labels that failure rather than preventing it. Beat order is fixed, handover first, and it cuts both ways: protection first would empty the trap quadrant by construction, and handover first maximises measured `trap_strict` by committing the respondent before they are reminded of developmental value, so the level of `trap_strict` is not interpretable and only its ordering across activities is. And the "patterns, not people" promise has to be made true arithmetically before this screen ships (see the segmentation fix under Repair); a thirteen-item automation profile beside cohort, business and team band is close to unique, and respondents will work that out faster than the working group will.

### Data shape

```ts
type ActivityId =
  | 'proposal' | 'pitchbook' | 'reviewpack' | 'lending'  | 'movemoney'
  | 'suitability' | 'research' | 'clientmail' | 'coordinate'
  | 'prospect' | 'onboard' | 'cash' | 'crm'

type Lane = 'agent' | 'together' | 'human'

handover: {
  itemOrder: ActivityId[]                       // randomised tray order as shown
  deviceClass: 'desktop' | 'tablet' | 'phone'   // lane distributions are QA'd by device
  lanes: Record<ActivityId, Lane | 'notmine'>   // 'notmine' excluded from all denominators
  laneMs: Record<ActivityId, number>
  laneChanges: Record<ActivityId, number>       // re-lanes after first drop = deliberation
  reviewedWall: boolean                         // phone: did they open the review step
  clips: ActivityId[]                           // ordered, length 0-5; index 0 = rank 1
  noneTaught: boolean                           // explicit zero, distinct from an empty array
  clipMs: Record<ActivityId, number>
  clipSwaps: number
  preReveal: {                                  // snapshotted before beat 3 renders
    lanes: Record<ActivityId, Lane | 'notmine'>
    clips: ActivityId[]
  }
  revisionsAfterReveal: number
  reckoning: Record<ActivityId, {               // only conflicted items actually asked
    keep: string[]                              // stable chip ids
    note?: string                               // <=140 chars, stored apart from the token
    ms: number
  }>
  events: {
    type: 'lane'|'relane'|'clip'|'unclip'|'capbounce'|'reckon'|'revise'
    itemId: ActivityId
    lane?: Lane | 'notmine'
    rank?: number
    at: number
  }[]
}
```

Zod invariants, enforced server-side and not only in the UI: all 13 keys present in `lanes`; `clips.length <= min(5, 13 − count(lanes === 'notmine'))`; `clips.length >= 1 || noneTaught`; no clipped id is laned `notmine`; `itemOrder` is a permutation of the 13 ids; no id appears twice in `clips`. No new PII, and no free text attributed to the token, per the governance rule that free text is "Stored separately from the token".

### Derived metrics

Per item, across respondents:

| Metric | Definition |
| --- | --- |
| `appetite[i]` | Mean of agent=2, together=1, human=0 over respondents who placed it. Primary x-axis. The three-way share is reported alongside. |
| `clip_rate[i]` | Share who clipped it, among those who do the activity. Primary y-axis. |
| `clip_borda[i]` | Rank 1 = 5 points … rank 5 = 1, unclipped = 0. Resolution inside the protected set. |
| `trap_strict[i]` | Share who put it in the `agent` lane **and** clipped it. Within-person co-occurrence. This is the number the study exists to produce, read as an ordering across activities rather than as a level. |
| `handover_lift[i]` | `P(agent ∧ clip) / (P(agent) × P(clip))`. The diagnostic. Lift above 1.2 means the same people who want it automated are the ones it taught, so the fix is programme design. Lift at or below 1 means the tension is a composition effect between two different populations, so the fix is targeting. No grid can tell these two worlds apart and they imply opposite interventions. |
| `safe_to_take[i]` | High appetite, bottom-quartile clip_rate. The secondary output: prioritised AI opportunities with evidence they cost nothing developmentally. |
| `protected[i]` | High `human` share and high clip_rate. Answers 1b directly, and is the refit's strongest 4b instrument, because it is the intersection of "taught most" with "AI could now do it" that the brief names as its fundamental question. |
| `notmine_rate[i]` | Exposure gap, read by tenure band. Read with care: for `onboard`, `movemoney` and `cash` a high rate may be division of labour with middle office rather than a pipeline hole, so every `notmine_rate` above 0.4 is reported beside the working group's judgement on whether the activity belongs to analysts on that desk at all. |

Per respondent: `clip_count`, `conflict_count` (0-5, the individual tension score), `reveal_flinch` (`revisionsAfterReveal > 0`, with direction reported — a behavioural measurement of the brief's fundamental question, taken from the only people who can measure it), `together_share`, `all_human_flag`, `all_agent_flag`.

`satisficing_flag` extends: all 13 cards laned with zero `laneChanges` and beat-1 time under 35s; or five clips placed in under 6s.

### Headline chart: "The pipeline trap"

A scatter, one bubble per activity. x = `appetite` (0-2), y = `clip_rate` (0-1), quadrant lines at the **item medians** rather than at the midpoint, so the top-right cell is always populated and the chart survives any overall level shift. Bubble area = n placed; fill intensity = `trap_strict`; ring thickness = `handover_lift`. Top right is labelled **The pipeline trap** with a caption naming its occupants; bottom right is **Take it now**; top left is **Protect it**. Beneath the scatter, `trap_strict` as a ranked bar so the trap quadrant has an order, and beneath that the reckoning chips for the top three trap items, which is the working group's answer sheet for what to do about it.

One read the working group gets free, and the reason the analyst-versus-alumni axis survives the ECM cut: filter current analysts against alumni. Where an activity is a trap for alumni but already `notmine` for current analysts, the pipeline has already broken and nobody logged it.

### Failure modes, and what is unfixable

1. **Development-value inflation.** Everyone believes their suffering was formative, so a rating scale returns "high" on all thirteen and the quadrant collapses. The five-clip cap is the entire defence: scarcity with a visible cost, not a scale. It loses individual resolution below rank 5, recovered at aggregate as `clip_rate`.
2. **The fat middle.** "Agent drafts, I own it" is the socially safe parking lane. Telemetry separates a hedge (fast drop, zero `laneChanges`, short `laneMs`) from a considered middle. Flag `together_share > 0.7` as low information. Note honestly that human-in-the-loop is the policy-relevant answer for most of these, so a genuinely fat middle is a finding, not a defect.
3. **Fear suppression.** An analyst who believes this is a headcount exercise puts thirteen cards in "I run it". The reckoning fires only on conflicts, so an all-human wall is never interrogated and never punished. Flag `all_human_flag` and read it as a trust measure reported beside `mark.score`, not as a preference measure. A team that will not hand over a single pitchbook is telling the sponsor about psychological safety.
4. **Performed enthusiasm.** The analyst who hands everything over produces `conflict_count` of 4 or 5 at beat 2, which is the loudest available signal rather than noise. Read those reckoning notes first.
5. **Strategic response.** A defensive respondent can clip exactly the five they laned to the agent, manufacturing a fake high-high quadrant. The signature (five of five overlapping, zero `clipSwaps`, bottom-quartile time) is distinct. Flag it and report its count, but **do not silently exclude it from the headline chart**: excluding the strategically defensive biases `trap_strict` toward the already-candid. Publish the chart twice, with and without, and put both numbers in the same frame.
6. **Order contamination, two ways.** Recency inflates `clip_rate` for late cards, and beat 1 primes beat 3. Randomise tray order, log `itemOrder`, and gate publication on a regression of `clip_rate` against display position.
7. **Device fidelity.** Desktop shows thirteen cards at once; phone shows one. `reviewedWall` and `deviceClass` are mandatory cuts in the Data Quality view. If lane distributions differ by device by more than a few points, the phone review step becomes compulsory rather than offered.
8. **Honest limitation, twice over.** The y-axis is self-reported retrospective attribution of learning. An analyst cannot reliably know which activity built their judgement; they can only report which one feels like it did. This mechanic does not fix that and the spec should not claim it does. The validation route the spec's token design supports — test whether `clip_rate` predicts who became a strong Advisor — is itself survivor-only: the sample is people who stayed, the brief's premise that alumni "know what made them successful" is survivorship bias stated as a method, and nothing in this instrument or the spec reaches anyone who left. Say so in the dashboard, not in an appendix.

**Time.** Beat 1: 13 decisions at ~4.5s = 58s (phone review adds ~10s for the half who use it). Beat 2: 22s. Beat 3: ~35s for a typical two conflicts. **Median 115s, p90 ~145s.** Hard constraint: beat 3 stops at three items.

**Keyboard.** Beat 1: Tab focuses the current card, `1`/`2`/`3` or Left/Down/Right then Enter lanes it, `0` for "Haven't done this one", aria-live announces "Briefing book, agent drafts I own it. Four remaining." Beat 2: Tab across laned cards, Space toggles the clip, aria-live announces "Clipped, rank three of five. Two clips left." Beat 3 reuses ChipGroup and TextField. Focus never leaves the content column; every target 44px or more. The focus ring is **not** the spec's 2px ice: ice on the dawn gradient measures 1.02:1, so the ring the respondent needs most is invisible exactly where the instrument ends. See the token repair.

## The second thing missing

**The day that comes back.** Eight hour-blocks, one day a week that AI hands back to next year's analyst, spent across nine real destinations, then half of them taken away again. The working group sees both where analysts say released capacity should go and which four hours they defend when it gets scarce.

This is the only mechanic that can answer 3a at all, because 3a presupposes a denominator and the spec ships the question without one. It is adjacent to, but not the same as, the promise at spec line 14 ("Today's time split appears once, as a budget"): that line asks for today's split, this screen allocates tomorrow's released hours, and the sponsor's question is the second one. The first remains unbuilt and should be struck from the spec's Adam table rather than quietly counted as delivered.

### Where it slots

New Level 4, immediately after the Handover and before the trials, and before the build canvas so the allocation is made from the respondent's own desk rather than in programme-designer mode. 105 seconds.

### The mechanic: spend, then cut

**Phase 1, spend (~55s).** Desktop: the pool sits in the left rail as a vertical stack of eight gold blocks, rope-bound, labelled "8 hours · one day a week" with a live "n unspent" counter. Nine destinations in a 3×3 grid in the 720px column, each card carrying its label, a one-line gloss, an hour-well that fills with stud rows in the brick idiom (one stud row per hour, so three hours is visibly three times taller), and a `− n +` stepper. Three equivalent input paths: drag a block onto a card, click a card then ArrowUp, or click `+`. `+` disables on every card when the pool is empty. The FooterBar CTA is disabled until the pool reads zero.

That constant sum is a stipulation, not a coercion, and the difference matters: `giveback` is on the board from the first second and takes all eight, so a respondent who rejects the premise has an in-mechanic way to say so rather than being forced into an allocation they do not believe. The whole scoring model rests on the sum, which is why it is enforced server-side; the honest answer stays the cheapest gesture.

Phone: the pool becomes a horizontal strip of eight 44px blocks pinned under the header, sticky, never scrolled away, because the finiteness *is* the mechanic. Nine destinations become a single-column list of 44px rows: label, gloss, inline studs, stepper. Drag remains available as an enhancement (touch sensor, 120ms long-press so it does not fight the scroll) but the stepper is the primary path on every breakpoint, so no feature exists on one breakpoint only.

Tile order is a seeded shuffle per token, logged to `capacity.order`, with `giveback` constrained away from index 0 and index 8 so it is neither the accidental default nor the buried last resort. There is no pre-laid arm here, unlike the canvas: a default allocation anchors hard across nine tiles and would destroy the signal.

**Phase 2, the cut (~35s).** "Lock the day" does not advance the screen. The scene throws a gust of snow (the spec's weather-as-feedback), the pool strip re-renders in `rope` as an empty four-slot tray, and the headline swaps. Every stepper becomes decrement-only with `max` pinned at its current value. The CTA enables at exactly four removed. Removing hours from `giveback` is legal and needs no special case.

**Coda, one chip row (~15s).** "Realistically, how much will AI actually free up for you in the next twelve months?" — single-select: nothing / about half a day a week / about a day / about two days / more than two days. This separates **magnitude** (a forecast, badly known, not the research question) from **mix** (3a, the research question), which is why the budget is stipulated rather than self-reported. It comes last because asking it first would anchor the allocation; the cost is that it cannot filter the allocation before it is made, only label it afterwards, and a `none` answer paired with a full allocation is read as a stipulated response and reported separately rather than as a preference.

### The nine destinations

| id | Label | Gloss | 3b channel | Mandate |
| --- | --- | --- | --- | --- |
| `clientroom` | In the room with clients | Reviews, annual meetings, the call nobody wants to make | client outcomes | builds tomorrow |
| `advisordesk` | Off the Advisor's desk | Work they shouldn't be doing, so they're with clients | Advisor productivity | output today |
| `names` | Working a list of names | Prospecting, cold outreach, filling the pipeline | business growth | builds tomorrow |
| `book` | A small book of my own | A handful of names, start to finish, mine | business growth | builds tomorrow |
| `product` | Product and platform, cold | Knowing the solutions well enough to be asked | own capability | builds tomorrow |
| `learning` | Learning with no deal attached | The market cycle, the reading, the thing there's never time for | own capability | builds tomorrow |
| `checkai` | Checking the AI's work | Before it reaches an Advisor, or a client | Advisor productivity | output today |
| `plumbing` | Inside the plumbing | Onboarding, trades, service, the things that break | no new value | output today |
| `giveback` | Give the hours back | We are over capacity. The day would just absorb. | no new value | sink |

The channel and mandate columns live in `src/content/capacity.json` and **never render**. Showing them would tell the respondent which tiles the firm values and is exactly how this mechanic would fail. Nothing on screen is graded, ranked, totalled against a target, or compared to a recommended allocation.

A coverage tile ("support more Advisors", "cover more accounts") is deliberately omitted: on this screen it reads as "so you can cut us" and would poison the whole allocation. If the working group wants that destination it must be added knowing what it costs in candour. That is their decision, made as a content PR, not a default hidden here.

### On-screen copy

```
PHASE 1
Headline:  The day that comes back
Body:      Say the tools do what they promise. Next year, the analyst who joins
           your desk gets back a day a week. Eight hours nobody is spending yet.
           Spend all eight.
Meta line (always visible, 12px, ink.2):
           The whole day can go in one place. Giving it back is a real answer.
Pool:      8 hours · one day a week        Counter: 6 unspent
CTA:       Lock the day   (disabled until 0 unspent)

PHASE 2
Headline:  Half of it just went.
Body:      A deal, an escalation, a market that won't sit still. Four of those
           hours are gone. You choose which four.
Aside (the screen's one wink):  It was always going to be a half-day.
Pool strip (rope):  2 of 4 given up
CTA:       Keep these four   (disabled until exactly 4 given up)

CODA
           Realistically, how much will AI actually free up for you in the
           next twelve months?
           Nothing / About half a day a week / About a day / About two days /
           More than two days

IDLE HINT (once, after 25s of no interaction, aria-live polite)
           No wrong answer here. Eight hours into one tile is an answer.
           So is giving them back.
```

The third-person framing ("the analyst who joins your desk next year") is a candour device for a single audience, not an audience variant. It makes the true answer the easy one: handing hours to learning rather than to client meetings becomes a recommendation about a programme, not a statement about the respondent's own value. This level needs no wording variants at all, and `audience` is never consulted in its content file.

### Data shape

```ts
type CapacityDest =
  | 'clientroom' | 'advisordesk' | 'names' | 'book' | 'product'
  | 'learning'   | 'checkai'     | 'plumbing' | 'giveback'

capacity: {
  premise: 'day-per-week'                  // recorded so a future variant is distinguishable
  order: CapacityDest[]                    // seeded shuffle actually shown
  spend: Record<CapacityDest, number>      // phase 1; sums to exactly 8
  cut:   Record<CapacityDest, number>      // phase 2; sums to exactly 4
  kept:  Record<CapacityDest, number>      // spend - cut; sums to 4
  firstDest: CapacityDest                  // where hour one went, before deliberation
  realistic: 'none'|'half_day'|'one_day'|'two_days'|'more'
  events: { type: 'add'|'remove'|'cut', dest: CapacityDest,
            via: 'drag'|'stepper'|'key'|'all', at: number }[]
  hintShown: boolean
  phase1Ms: number
  phase2Ms: number
  ms: number
}
```

Zod, server-side, rejecting the POST otherwise: `sum(spend) === 8`, `sum(cut) === 4`, `∀d cut[d] <= spend[d]`, `order` is a permutation of the nine ids with `giveback` at neither index 0 nor 8.

### Derived metrics

| Metric | Definition |
| --- | --- |
| `capacity_share[d]` | `spend[d] / 8`. Stated destination of released capacity. |
| `capacity_kept_share[d]` | `kept[d] / 4`. Destination that survives a 50% cut. |
| `capacity_elasticity[d]` | `kept_share − spend_share`. Positive is conviction (defended under scarcity); negative is courtesy (first thing dropped). The most useful number on the screen, and one no single-pass budget can produce. |
| `pipeline_ratio` | development-bearing hours / (development-bearing + output-today) hours, null if both zero. Reported **beside the raw hour counts**, because the ratio alone scores 1-against-1 identically to 4-against-4 and the difference is the whole point. At eight blocks the floor is 12.5%, so report it in eighths, not as a percentage to one decimal. Report on `kept` as well as `spend`. |
| `channel_share` | 3b, rolled to client outcomes / Advisor productivity / business growth / own capability / no new value. The only 3b instrument in the instrument, and a statement of intent rather than a measure of contribution. |
| `qc_tax` | `capacity_share['checkai']` alone. Released capacity that returns straight into checking the machine. `plumbing` is reported next to it but never added into it: the gloss is "onboarding, trades, service, the things that break", which is pre-existing operational work and not AI-induced rework, and summing the two would attribute the desk's plumbing to AI. |
| `giveback_share`, `giveback_only` | The overload finding as a rate. Never reported as one number: split into deliberated (`phase1Ms` above the 25th percentile **and** three or more distinct tiles touched) and instant, and publish both bands. Do not suppress the instant band; some of it is genuine exhaustion, and dropping it would launder the finding the sponsor most needs. |
| `concentration` | Herfindahl over `spend`. Max-spread (eight tiles at 1) is fence-sitting, not nuance, and must be visible rather than silently averaged in. |
| `gut_agreement` | `firstDest === argmax(kept)`. A within-screen consistency check, interpretable only because tile order is randomised. |
| `capacity_satisficing` | `ms` under 25% of level median, or max-spread with `phase2Ms` under 6s. |

**Analysis rule, pre-registered.** These are shares from a constant sum, so they are compositional. Medians and IQRs are fine for description. Any segment comparison or model must use additive log-ratio with `giveback` as the denominator, so every coefficient reads as "log hours to X per hour left to absorb into the desk". Zeros are structural and common at eight-token granularity: apply +0.5 smoothing to the raw counts and document it in the export. Never run a per-destination t-test on raw shares; the constant sum manufactures negative correlation between destinations and will produce spurious significance.

### Headline chart: the slope

Nine rows, ordered by `kept_share` descending. Each row is a line from `spend_share` (left dot, gold) to `kept_share` (right dot, ice), drawn in `rope` where it falls and `moss` where it rises. Two column headings: "Where the day goes" and "What survives the cut." One chart carries the redeployment preference, the conviction ordering, and the gap between them, segmentable by tenure stratum, business and wave. A second single bar shows the distribution of `giveback_share`: if its mass sits above 0.5, the redeployment question has a different answer than the sponsor expects, and that is the finding.

### Failure modes

1. **Hypothetical bias.** The premise is granted, so this measures destination preference, not capacity forecast. State that limit in one line on the dashboard view. The internal correction is `qc_tax`, and the coda chip lets you split out respondents who believe no time will be freed at all.
2. **Social desirability against the sink.** "Give the hours back" reads two bad ways at once: I cannot cope, and I am against AI. It will be under-reported, so `giveback_share` is a **lower bound** and must be labelled as one.
3. **Granularity floor.** Eight blocks means the smallest expressible preference is 12.5%, so a genuine 4% interest reads as zero. Deliberate, in exchange for finishing inside 105 seconds. Do not "fix" it with a continuous slider: that reintroduces a grid, loses the countable value, and destroys `firstDest`.
4. **Carryover from the canvas.** Both are units into slots under a constraint. Placing the trials between them does not remedy this, because that is already the running order; there is no remedy left inside a fixed sequence. So measure it instead: in the pilot, randomise which of the capacity screen and the canvas comes first, log the assignment, and test `capacity.spend` type mix against `build.years[0]` type mix within each order. If the correlation is present in both orders it is a real preference; if it is present only in one, it is carryover and the later screen's type mix is reported with that caveat permanently attached.
5. **The zero-sum frame may be false.** Some destinations are complements: owning a list of names generates client-room time. Forcing them to compete misstates the job and will irritate the most thoughtful respondents. `mark.missing` is the escape valve. Diagnostic: if more than 15% of respondents fund a write-in equivalent, the item list is wrong and should be revised before the second wave.
6. **Fixed pass order.** Phase 2 is always the cut; a cut-first version is incoherent, so the sequence cannot be counterbalanced. Comparing destinations to each other on elasticity is unaffected, because the sequence is constant within a respondent. What is not licensed is reading the spend-to-kept drop as a forecast of real behaviour under real pressure.

## The third thing the ECM cut leaves behind

Dropping the ECM respondent was the right scope call, but it removes the instrument's only view of management practice, and the refit must pay that back rather than quietly re-point 4a-management at a free-text box. 2b has the same problem from the other side: the spec's own mentorship content (three fuel items, the advisor dial, the `shadow` brick) measures how much the advisor mattered, never what the advisor should do differently. One rebuilt level answers both.

**Level 2, The advisor's job.** It replaces the spec's Level 5 (keep five and the dial) and absorbs what is worth keeping from the deleted Level 4 sort.

- **Keep three traits in order** from the spec's ten, tap-to-rank, the RankList component unchanged. This is Adam's stack rank, trimmed from five because ranks 4 and 5 carry almost no discrimination and cost 20 seconds. `archetype` is re-derived from `top3[0]`, so the High camp card survives.
- **Keep two in order** from nine statements of what a senior advisor does for an analyst, stem: "Now the first draft arrives from a model, what should your senior advisor do differently?" Items: `markup` Mark up my thinking, not my drafts · `standard` Say explicitly what "good" looks like on an AI-assisted draft · `check` Teach me how to check output rather than how to build it · `accountable` Own the review before it reaches a client, and say so · `clients` Put me in front of clients sooner · `cadence` See me more often, for less time · `stretch` Give me harder work, less of it · `less` Coach less, certify more · `nothing` Nothing should change. `standard` and `check` are the two items pointed at 2a; `accountable` is the management-practice item that the ECM drop would otherwise have cost; `nothing` is the honest null and must be pickable at rank 1.
- **The dependence dial**, re-pointed from outcome to trajectory: "If you'd been tagged to a different senior advisor on day one, how different would your last six months have been?" (0 unrecognisable → 100 identical). Renamed `advisor.dependence`, phrase ladder kept at 20/45/65/85.

Two interaction types, tap-to-rank and a dial, which is the pairing the spec already ships at its Level 5. If the working group applies the one-mechanic rule strictly, the dial moves to Mark to market at no cost in data. 75 seconds.

**What this does not recover.** Innate versus learned is gone from the instrument, and a ranking of traits by importance carries no origin information at all, so the earlier claim that the keep-three rank answers Adam's question "through importance rather than origin" was false and is withdrawn. That ask is unanswered. Restoring it means restoring the card sort at roughly 70 seconds, which has to come out of the canvas, and it would still be a tenure artefact for a mid-programme respondent. It is also worth correcting a second false consolation: the expert comparator did not die with the ECM. Alumni Associates, VPs and Advisors are surveyed in the second wave, and they are the people best placed to say what makes a great private banker.

## What the analyst refocus changes

### Delete

Most of the list below exists only to serve the three-audience comparison or the ECM wording register. Two entries do not, and are called out as such.

- **The ECM audience row** in "Audiences, variants and honesty checks", including the third-person register. Gone entirely.
- **"The same game runs for three audiences, with wording variants, and the gaps between them are the headline output."** This sentence declares the instrument's primary finding, and the finding no longer exists. Replace, do not merely delete: the primary contrast becomes within-analyst on tenure stratum, with current-against-alumni as the second axis.
- **The Alumni row's claim to primacy** ("Adam's primary audience: they know what made them successful") and the current-analyst row's rationale. Both invert: the current analyst is the subject. The alumni premise is also survivorship bias stated as a method and must be labelled wherever alumni results are shown.
- **`audience: 'alumni' | 'analyst' | 'ecm'`** collapses to two values, `analyst` and `alumni`. Keep the field; it is a wave marker and a segmentation axis, not the dead three-way comparison.
- **Level 2's ECM stem** ("ECM wording asks 'which teaches an analyst most'") and **the third branch of the per-audience content layer**, including M3's acceptance criterion "wired to the store with real content and audience variants". This drops from a three-way variant system to a single tense toggle, roughly a third of the content JSON and its test matrix.
- **Level 9's ECM trigger**: "for the ECM audience or for anyone who taps 'I have more to say'." Delete the ECM clause only. The self-select path becomes the instrument's only qualitative depth channel, so it can no longer stay "behind a feature flag; ship without it if approvals lag". If the LLM endpoint is not approved, ship a plain three-box text fallback. It sits **outside** the twelve-minute budget by construction: it fires after the instrument is complete and the response is already saved, and a three-question moderated conversation costs two to four minutes of its own. Never price it inside the run of play.
- **Architecture**: "Optional AI interviewer (Summit or ECM variant)" loses "or ECM variant".
- **Dashboard, "What fed the climb"**: the **ECM panel only**. The analyst-versus-alumni contrast stays, because the headline chart's most useful read (an activity that is a trap for alumni and already `notmine` for current analysts) depends on exactly that axis.
- **Dashboard, "The bold questions"**: "ECM vs analyst gaps highlighted." The view survives on two trials instead of five.
- **The analyst-ECM pairing machinery in governance**: the stated reason for the SID, "to compare an analyst's answers with their own ECM's answers", and the Advisor-SID derivation whose only non-alumni purpose it was. The remaining purposes are working-session invitations and the alumni production-data link. That is a genuine data-use-case win and should be said out loud in the DUC submission.
- **Open decision**: "Audiences: alumni only first, or all three in parallel." Closed. Replace with "current analysts first, alumni as a second wave."
- **The rationale on the stable-id rule**: "so wording variants across audiences map to the same columns." Keep the rule, rewrite the reason: tense variants, and re-fielding the same instrument in twelve months.

Two entries below are cuts the analyst refocus does **not** licence, and an earlier draft of this document made both. `audience` is not deletable as a segmentation axis, and the `ECM` **chip in Level 0's role list** is not deletable either: role is single-select and sits in the Next gate, and an alumnus who became an ECM is a normal A2A destination and the only respondent in the dataset who can speak to management practice from the other side. ECM as a role *value* and ECM as an *audience* are different objects, and the scope decision removes the second.

Not deletable, contrary to expectation: the honesty checks are all *within*-respondent, so they survive the pivot on their own terms. Three of the four break for other reasons, covered below.

### Repair

| What breaks | Why | The repair |
| --- | --- | --- |
| Level 0 copy: "You made the climb. Help us map it." | For a respondent 14 months in this is factually wrong in its first five words and tells them the instrument is not addressed to them. The worst possible interaction with design principle 5, "The experience itself is the argument." | **"You're on the climb. Help us map it."** Body: "You're partway through the programme. Nobody knows what this job actually is right now, or what it's teaching you, better than you do. We're trying to work out what to keep and what to change now that the tools have changed — for the cohort behind you, and for the rest of your own climb." Keep the original as the alumni tense variant. |
| `segment.cohort` is "chips 2016-2025" | Today is 2026-09-24, so a 2026 joiner has no chip. | Extend chips to **2026**. Not 2027: a 2027 cohort does not exist and an unreachable chip invites mis-taps. Add the chip for the next intake when the next intake exists. |
| No route in for a lateral joiner | Cohort, business and role are in the Next gate, and a senior advisor or ECM who joined laterally has no analyst cohort year, so the respondent who can best answer 4a-management is hard-blocked on screen one. | Add **"I didn't come through the programme"** as a cohort chip. It satisfies the gate, routes past `monthsInProgramme`, and is its own reportable stratum. |
| No tenure field anywhere in the Response shape | Readiness, DNA, build and mark are all conditioned on tenure, and it can only be inferred crudely from a cohort year. | Add required `segment.monthsInProgramme` for current analysts and put it in the Next gate. **It does not extend to alumni**: every alumnus would land in the top band, so the pseudo-longitudinal curve would have no resolution past year three and alumni would be indistinguishable from third-years. Alumni get `segment.yearsSinceProgramme` instead and are never pooled into the tenure bands. For current analysts it is also near-collinear with `segment.cohort`, so only one of the two enters any model. |
| Nothing anywhere measures current AI exposure | Every downstream AI answer has no usage denominator, so a low hand-over rate cannot be distinguished between considered judgement and unfamiliarity. | Add one required chip row to Level 0: "Which of these do you have at your desk today?" with a "none of these" chip, plus one frequency band. Cheap, and it makes every other AI answer interpretable. |
| `readiness.month` is a bare int 1-36 with no "not yet" state | For a month-14 analyst, months 15-36 have not happened. `readiness_gap = 36 − month` is meaningless at month 14, and `compress_contradiction` fires on tenure rather than on inconsistency. | The level is cut (see the run of play). What survives moves to Level 0 as two five-chip rows: **"Which of these can you do alone today?"** against **"Which do you still not trust yourself on?"** The gap is the readiness measure, and it is uncensored. It is a capability measure and nothing more: it is credited to 1b, never to 3b, because capability says nothing about client outcomes or Advisor productivity. |
| Fuel MaxDiff includes experiences a current analyst has not had | Forced best/worst among cards including an unexperienced item produces noise, and a fixed design concentrates that noise on named items. | Add a pre-screen tap-grid, "Which of these have you actually had?" → `fuel.experienced[]`; mark un-had items "not yet" in the rounds; compute `fuel_score` twice, all-respondents and restricted-to-experienced. |
| Zero of the ten fuel items reference AI | Indefensible once the current analyst is primary. The MaxDiff is the instrument's largest single block of respondent effort and it is spent entirely inside a pre-AI frame. | Add `aicritique` "critiquing and correcting an AI draft" and `unassisted` "being made to produce something unassisted, on purpose". **Three items go, not two**: `roleplay` (covered by the canvas brick), `self` self-learning (its gloss pins it to the pre-LLM medium), and `morning` the morning meeting (absorbed by `desk`, "watching how the desk actually works", and the weakest of the ten against the brief). Ten − 3 + 2 = **nine**. |
| The MaxDiff design is unbalanced, and 9 items in 5 sets of 4 cannot fix it | The spec's ABCD/EFGH/IJAE/BFIC/DGJH/CEHI gives C, E, H and I three appearances and the other six two, so raw best-minus-worst is biased by the design. Nine items over 5 sets of 4 is 20 slots, 2.22 each, which is not an integer, so it reproduces the same defect. | **Nine items, nine sets of three**: ABC, DEF, GHI, ADG, BEH, CFI, AEI, BFG, CDH, where A `shadow`, B `desk`, C `plumbing`, D `classroom`, E `deliverable`, F `mentor`, G `cohort`, H `aicritique`, I `unassisted`. Pin that mapping in `packages/schema`; the spec gives its design without one, which is why `classroom_agreement` and `mentor_contradiction` have no stable anchor today. Three appearances each, 27 of 36 pairs covered, ~100s. Three cards per set means a best-and-worst pick fully ranks the triple, so each item carries a within-set rank of 1-3 on each of its three appearances and `fuel_rank[i]` (mean within-set rank, seven distinct values) has far more per-respondent resolution than best-minus-worst confined to −3…+3. That resolution is what makes the per-respondent checks below computable at all. |
| `dna.sort` "Born with it / Built it here / Still building" | At 14 months almost everything is truthfully "still building", so `dna_still` is a tenure artefact and the "Innate vs built" view reads a tenure difference as an attitudinal one. | Cut the sort. Innate versus learned is then not measured anywhere, which is a real loss of one of Adam's named asks and is recorded as such rather than explained away. |
| `dna.advisorDial` has no "here" to compare against | Variance compresses toward "exactly here" simply because there has been less time for an advisor to matter, and `mentor_contradiction` then flags respondents who have not got far enough. | Re-point to trajectory over the last six months, rename `advisor.dependence`, redefine `mentor_contradiction` against the new scale. See Level 2. |
| Trial `compress` for a current analyst | Advisory for an alumnus, self-interested for a current analyst answering about their own remaining runway; and the honesty check it anchored (`compress_contradiction`) dies with Level 1 anyway. | Cut it. This is the single cut that pays for the time budget and it is named as such. If the working group wants Adam's compression question back it costs 25s and must come out of the canvas. For the alumni wave it can return as an unpaired question with `selfInterest = false`. |
| Canvas Arm B: "today's programme pre-laid" | A current analyst on Arm B is editing the programme they are currently inside, so `build_delta` conflates "what should change" with "what I resent about my own last 14 months". `year3_empty` is unsafe for juniors. | Add one pre-canvas tap, "Mark the bricks you've already done" → `build.completed[]`, then decompose `build_delta` into removals of bricks the respondent experienced (informed) against bricks they have not (hearsay). Gate `year3_empty` on `monthsInProgramme >= 12`. Arm B must also acquire acceptance criteria; it currently has none in M4 and can be signed off unbuilt. |
| The canvas constraint does not bind | Palette 22 units against 3 × 10 = 30 capacity leaves 8 spare, so omission measures scroll fatigue rather than priority. | Three changes together, because any one alone is too weak. **State the unstated rule**: a brickId may be placed in at most one year. **Extend the palette** with four role-level bricks (machine-drafts-it, review and QA, feedback cadence, tooling), taking it to 19 bricks and 26 units. **Cut capacity to 5 units per year**, 15 against 26, so 42% of the palette must be omitted and omission is a forced choice. An earlier draft proposed 7 units per year against 26, which forces omitting 5 units of 26 and barely binds at all. |
| `mark.score` 1-10 on "the programme as it stands" | A grade from someone who has seen 14 of 36 months, is still inside it, and whose token is re-identifiable by People Analytics. Variance compresses upward exactly where the sponsor needs it. | Split into `mark.scoreExperienced` and `mark.scoreExpected`; the gap is itself a finding. Restate the privacy line **on this screen**, route the free text into the separate store the governance table already specifies, and say so inline. Re-point "The one thing you'd change tomorrow" to **"…for the cohort behind you"**. Report by tenure stratum only. |
| "Optional voice input on mobile (Web Speech API), transcribed on device" | The claim is unguaranteed rather than universally false: Chrome Android sends audio to Google, Safari routes to Apple with an on-screen notice, and recent OS versions can dictate on-device — but the Web Speech surface gives the page no way to know or to require it. So the spec promises something it cannot enforce, on the two fields where candour matters most. | Either drop voice input, or replace the claim with "your phone's dictation, which may send audio to Apple or Google" and put an explicit consent line before the microphone opens. A governance defect, not a copy defect. |
| The focus ring and the summit palette fail WCAG 2.2 AA | At the `sky.dawn` stop, ice measures 1.02:1, snow 1.59:1, gold 1.05:1, moss 1.13:1 over the glass layer, and `rope` fails at four of six sky stops while carrying the "least/worst" and over-capacity meaning. The spec states AA as a target and the token table cannot meet it. The 2px ice focus ring is therefore invisible at exactly the point where the respondent is finishing. | Do not commit to "2px ice rings" anywhere in the build. Specify the ring as a token that is tested against all six sky stops and clears 3:1 at each — in practice a two-tone ring (light core, dark outline) so one of the two always holds. Re-test the whole token table per stop and darken the dawn glass layer until text tokens clear 4.5:1. This is a build blocker for M5, not a polish item. |
| The segmentation promise does not hold arithmetically | "The working group sees patterns, not people" against cohort × LOB × role × team band = 10 × 3 × 5 × 3 = 450 cells at a realistic N of 150-400. The refit's own changes do not fix it: cohort to 2026 plus the lateral chip is 12, role is 4, and four tenure bands multiply the result to 1,728 cells. Separately, "n≥120 per segment" against four bands crossed with cohort year needs N≥480 before any crossing, and effective n shrinks further because `notmine` items leave the denominators. | Reduce the reporting grid before launch, not after. The default crossing becomes **business (3) × tenure stratum (2: 0-18 and 19-36 months) × wave (2: current, alumni) = 12 cells**. Cohort year, team band and role stay in the dataset as filters, never as default axes, with automatic suppression of any cell under n = 10. Quadrant lines are published with intervals; a single stratum's n is not a finding and the dashboard says so on the view. |
| The Summit arc tells a current analyst they have arrived | The confetti, the peak, and a DNA card reporting a readiness month as an accomplishment when for a censored respondent it is a forecast handed back as fact. | Keep the night-to-dawn ascent, which is the best idea in the visual spec and maps to the session rather than to a career, but rename the last camp **"High camp"** and re-point the reward forwards: a pin at `monthsInProgramme` on the route, the archetype from `top3[0]`, the respondent's top fuel item, and the activities they protected. Drop any copy claiming they finished. |

## The revised run of play

The spec does not fit its own budget, and the previous draft of this document did not establish that it fits either, because it summed medians and design targets and then compared the result to a brisk-respondent baseline. Those are different quantities and the comparison was worthless. **Everything below is priced on one basis: the median respondent.** On that basis the spec as written runs 15-20 minutes (its own brisk pricing is 45 + 60 + 120 + 60 + 75 + 75 + 150 + 180 + 75 + 30 = 870s = 14.5 minutes, and a median sits above a brisk figure, not below it). The refit runs to a median of 11:45.

| # | Level | Mechanic | Sub-questions served | Median s |
| --- | --- | --- | --- | --- |
| 0 | Base camp | Consent, segmentation (cohort to 2026 plus the lateral chip, business, role including ECM, `monthsInProgramme`, AI exposure), plus the two readiness chip rows | context; 1b (partial) | 80 |
| 1 | Fuel (MaxDiff) | 9 items including 2 AI-era items, 9 sets of 3 | 1b, 2a (partial), 2b | 100 |
| 2 | **The advisor's job** | Keep three traits, keep two advisor changes, then the dependence dial | **2b**, **4a-management**, 2a (partial) | 75 |
| 3 | **The Handover** | 13 activities into 3 lanes, up to 5 clips, the reckoning | **1a, 1b, 4b**, the fundamental question, secondary output | 115 |
| 4 | **The day that comes back** | 8 hour-blocks into 9 destinations, then cut 4, then the coda chip | **3a, 3b** | 105 |
| 5 | The trials ×2 | `certify`, `classroom` | 4a-process, 4a-training | 60 |
| 6 | Build the route | Canvas, 5 units/year against a 26-unit palette, one year per brick | 4a, 4b | 100 |
| 7 | Mark to market | Split dial, two texts re-pointed at the cohort behind, agent-worries chips | 4a (residual) | 45 |
| 8 | High camp | Reward, forward-pointing card, "I have more to say" | — | 25 |

**Running total: 80 + 100 + 75 + 115 + 105 + 60 + 100 + 45 + 25 = 705s = 11 minutes 45 seconds, median.** p90 is near 14:30, driven by the Handover reckoning and the two free-text fields. The instrument therefore clears the spec's 12-minute ceiling read as a median, and does not clear it for the slowest tenth. **The spec's "target median completion of 9 minutes" is not reachable with any instrument that answers the brief, and should be struck rather than missed.** The opt-in AI conversation at High camp sits outside this total.

### What was cut, and what it costs

No seconds ledger, because the two sides were never priced on the same basis and reconciling them produced a number that was right by cancellation rather than by arithmetic. Ten levels become nine: three deleted, two added, one rebuilt. Three of the five trials go. What each costs:

| Cut | What it costs |
| --- | --- |
| **Level 1, Your climb (readiness)** | The heaviest cut and the one the working group will argue about. Loses `readiness.month`, `readiness_gap`, `compress_contradiction` and the "readiness curve" view, which is Adam's headline. The construct is right-censored for the primary respondent and the spec has no censoring concept: a month-14 analyst either has not felt it — a value a bare int 1-36 cannot express — or forecasts, and both land in the same column as an alumnus's recollection. Repairing it properly costs *more* time, because it needs a two-state mechanic plus interval-censored survival analysis. The most valuable part survives as two chip rows on Level 0. Real loss: the readiness curve. If the working group will not accept it, the time must come from the canvas. |
| **Level 3, Fuel (podium)** | Its outputs are `fuel_consistency` **and** podium *position*, which the spec's honesty table uses for `classroom_agreement` and `mentor_contradiction`. That is why the nine-sets-of-three redesign above matters: `fuel_rank[i]` from fully-ranked triples has seven distinct values per item and is a usable per-respondent position, where best-minus-worst over four-card sets ties constantly and has no tie-break rule. Both checks re-point to `fuel_rank`, tie-broken on worst-count, and are reported **undefined** rather than false where a tie survives, with the undefined rate published. Real loss: one clean, direct read of the top three learning sources, and one honesty check (`fuel_consistency`) that was not reproducible as specified in any case. |
| **Level 4, Advisor DNA (sort)** | Loses `dna_born` / `dna_built` / `dna_still` and the "Innate vs built" view. A principled cut rather than a budget one: at 14 months almost everything is truthfully "still building", so the three shares measure tenure. Real loss, stated plainly: innate versus learned is one of Adam's named asks and the refit does not answer it anywhere. |
| **Trial `agents`** | Absorbed by the Handover, which is the strong version of the same question: thirteen items rather than five artefacts and an opt-out, a three-way lane rather than a binary, unconditional rather than behind a Yes, and paired with a development axis. Its No branch ("I'd stop learning the basics, I don't trust the output, clients won't accept it, I'd rather do the work") is preserved as one chip row on Mark to market. |
| **Trial `avatars`** | A training-method question that scored 18% against 4a-technology. Role-plays with AI avatars remain as a canvas brick, so the construct survives; the frequency ladder and the adoption-conditions chips do not. |
| **Trial `compress`** | Adam's compression question leaves the instrument for the current-analyst wave. It is the cut that closes the budget and it is the right one to make: for a current analyst it is a question about their own remaining runway, so the answer is self-interested by construction, and the honesty check that made it valuable died with Level 1. |
| **Advisor DNA keep five → keep three** | Ranks 4 and 5 carry little discrimination. The archetype is unaffected. |
| **MaxDiff, 10 items × 6 rounds of 4 → 9 items × 9 rounds of 3** | Slightly *more* respondent effort than the previous draft claimed and roughly the same as the spec's, but balanced, with 27 of 36 pairs covered and full within-set ranking. If the Fuel slot can carry 132s, the twelve-set affine-plane design (adding AFH, BDI, CEG) gives four appearances each and every one of the 36 pairs exactly once, and is strictly better. |
| **Canvas 180 → 100** | Fifteen placeable units instead of thirty. Sequencing across three years, which is the actual data, is untouched; what goes is the long tail of low-information placements a non-binding constraint allowed. |
| **Mark to market and High camp trims** | Cosmetic, plus one substantive change: High camp's reward card is re-pointed forwards. |

### The honesty checks after the refit

The spec's four-row table needs rebuilding, and it gets shorter rather than longer, because two of the checks an earlier draft proposed were not admissible. `handover_fuel_convergence` crossed four activity ids against one fuel item with no combination rule and no activity-to-fuel map, and `handover_build_protection` crossed thirteen activity ids against a palette containing one generic `own` brick and one `ops` brick with no activity-to-brick map at all. Neither is computable as defined. Both also sat downstream of a placement rule chosen deliberately to prime, so even if they were computable they would have measured the prime.

| Construct | Asked as | Asked again as | Consistency measure |
| --- | --- | --- | --- |
| The fundamental question | Handover lanes | Handover clips, crossed in front of the respondent | `reveal_flinch`, with `preReveal` preserved on both sides. Within-screen, within-minute, unprimed by anything outside itself. |
| Where the freed time goes | `capacity.firstDest` (hour one, before deliberation) | `argmax(capacity.kept)` (what survives the cut) | `gut_agreement`, interpretable only because tile order is randomised. Within-screen. |
| Value of classroom | `fuel_rank` of `classroom` | Trial `classroom`, and whether a classroom brick is placed | `classroom_agreement` (0-3). Still three-way. Weakened, and labelled as weakened: Fuel runs before the canvas, so the brick leg is primed by the MaxDiff leg. It is reported as a three-way description, not as corroboration. |
| Role of the senior advisor | `fuel_rank` of `mentor` | The advisor dependence dial | `mentor_contradiction`, redefined against the trajectory scale. Undefined rather than false where `fuel_rank` ties. |

## Data model deltas

Removed from `Response`:

```ts
  readiness: { month, readyFor, felt, dragReversals }   // level cut; readyFor survives on segment
  fuel: { … podium: string[] }                          // podium cut
  dna:  { sort, sortMs, top5, advisorDial }             // → advisor.top3, advisor.dependence
  trials.agents, trials.avatars, trials.compress        // absorbed or cut
```

Added to `Response`:

```ts
  audience: 'analyst' | 'alumni'         // wave marker and segmentation axis, not a variant system
  segment: {
    cohort: number | 'lateral'           // chips 2016-2026 plus "I didn't come through the programme"
    lob: 'USPB' | 'IPB' | 'Solutions'
    role: string                         // ECM chip retained
    teamBand: string                     // collected; a filter, never a default axis
    monthsInProgramme?: number           // REQUIRED for audience 'analyst', in the Next gate
    yearsSinceProgramme?: number         // alumni only; never pooled into the tenure bands
    aiExposure: { tools: string[], frequency: 'never'|'monthly'|'weekly'|'daily' }
    canDoAlone: string[]                 // "which of these can you do alone today"
    notTrusted: string[]                 // "which do you still not trust yourself on"
  }
  fuel: {
    maxdiff: { round, shown: string[], best, worst, ms }[]   // 9 items, 9 sets of 3
    experienced: string[]                // pre-screen: which have you actually had
  }
  advisor: {
    top3: string[]                       // ordered traits; archetype = top3[0]
    changeTop2: string[]                 // ordered; what the senior advisor should do differently
    dependence: number                   // 0-100, re-pointed to the last six months
  }
  handover: { … }                        // full shape above
  capacity: { … }                        // full shape above
  build: { …, completed: string[] }      // bricks the respondent has already done
  mark: { scoreExperienced, scoreExpected, change, missing, agentWorries: string[] }
```

Derived metrics removed: `fuel_consistency`, `dna_born`, `dna_built`, `dna_still`, `readiness_gap`, `compress_contradiction`.

Derived metrics redefined: `fuel_rank[i]` (mean within-set rank over three appearances, replacing best-minus-worst as the per-respondent position), `archetype` (from `advisor.top3[0]`), `mentor_contradiction` and `classroom_agreement` (against `fuel_rank`, undefined where tied), `build_delta` (split into informed and hearsay removals using `build.completed`), `year3_empty` (gated on `monthsInProgramme >= 12`), `satisficing_flag` (absolute floors added, so it is computable on completion for respondent #1 rather than requiring a cohort median that does not yet exist).

Derived metrics added:

```
handover:  appetite[i], clip_rate[i], clip_borda[i], trap_strict[i], handover_lift[i],
           safe_to_take[i], protected[i], notmine_rate[i], clip_count, conflict_count,
           reveal_flinch, together_share, all_human_flag, all_agent_flag
capacity:  capacity_share[d], capacity_kept_share[d], capacity_elasticity[d],
           pipeline_ratio, channel_share, qc_tax, giveback_share (banded
           deliberated/instant), giveback_only, concentration, gut_agreement,
           capacity_satisficing
advisor:   advisor_change_rank[i], dependence
segment:   tenure_stratum, readiness_gap_v2 (= |canDoAlone| − |notTrusted|, uncensored)
```

Two new dashboard views replace the ECM panels: **"The pipeline trap"** (the Handover scatter plus the `trap_strict` ranked bar plus the reckoning chips for the top three trap items, published with and without the strategically-defensive) and **"Where the day goes"** (the spend-to-kept slope, the `giveback` distribution, the `qc_tax` numeral beside the `plumbing` numeral, and the `pipeline_ratio` distribution in eighths).

## What the build plan now has to say

The spec's milestones describe an instrument that no longer exists, and handing this document to Claude Code without the following edits will produce acceptance criteria that cannot pass.

- **M1** reads "Playwright walks all ten screens". Nine.
- **M2** gains six components that are in no table: lane wall (or a BrickCanvas variant), clip header, reckoning panel, hour pool, destination tile, stepper. Stories and a11y paths for each.
- **M3** reads "MaxDiff design matches the fixed sets" against sets that no longer exist, and "audience variants" against a variant system that has been deleted. Replace with the nine-set design above, pinned in `packages/schema`, and a single tense toggle.
- **M4** has no Arm B acceptance criterion at all, so half the canvas experiment can be signed off unbuilt. Add one, and add `build.completed[]` to it.
- **New milestone.** The two new screens, roughly thirty new derived metrics and two new dashboard views are not a fortnight bolted onto M3 and M4, and this document has no basis for the "two weeks" an earlier draft asserted. Scope it as its own milestone with its own estimate from whoever builds it, and gate it on the thirteen-item pretest, because building the wall before the item list is confirmed wastes the build.
- **The token table is a blocker, not a polish item.** M5 cannot be signed off against "WCAG 2.2 AA" with the current palette. See the repair row.

## What to protect

- **The build canvas.** It is the only mechanic in the spec that forces a respondent to commit to a design rather than rate a statement, and `build_delta` is still a strong 4b instrument. The refit trims it hard and makes its constraint bind; it must not lose the three-year axis, the blank-against-pre-laid arms, or the event log, all of which are what make omission and sequencing readable.
- **The governance design.** Pseudonymous token, salt held by People Analytics, advisor SIDs derived rather than typed, free text stored apart from the token, re-identification only under a documented purpose. This is the strongest part of the spec and the reason the honest answers will arrive at all. The refit strengthens the DUC case (one fewer join, a narrower stated purpose) and adds one non-negotiable: the reporting grid drops to twelve cells with n = 10 suppression before launch, because a promise of "patterns, not people" that fails arithmetically will be worked out by the respondents, and the Handover is the screen that most needs it to be true.
- **The night-to-dawn scene as the progress bar.** "The environment itself is the progress bar. There is no separate progress bar." This is what makes the instrument the argument, and it maps to the session rather than to a career, so it survives the analyst refocus once the final camp is renamed. Its palette does not survive contact with WCAG AA and has to be re-derived per sky stop.
- **One mechanic per screen, and every tap as data.** Both new screens are built to that rule, including the awkward parts. If the working group reads either as two mechanics, split it rather than relaxing the rule — the rule is why the spec is twelve minutes and not twenty-five.
- **The stable-string-id convention.** The reason changes (tense variants and re-fielding rather than audience variants) but the rule is what makes the twelve-month re-field possible, and therefore the whole within-analyst tenure contrast that replaces the dead three-audience comparison. Extend it: one canonical activity vocabulary, and a declared mapping from every other list to it.
