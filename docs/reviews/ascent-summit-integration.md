# The Ascent — weaving the AI questions into the climb

**What was wrong.** The two screens that answer the brief are the two screens that read as office furniture. The Handover opens "Thirteen jobs. Who should be doing them in two years? / Drag each one to a lane", and a lane is a thing in a warehouse; the capacity screen opens "Say the tools do what they promise. Next year, the analyst who joins your desk gets back a day a week", and then renders as an hour grid. Neither sentence is wrong — both are in the spec's voice, both are addressed forward to the next analyst — but nothing in the scene marks that the register has changed, because the spec maps time of day linearly onto screen index, so at screens 3 and 4 of 9 the sky is simply mid-gradient and says nothing. The screens are not bolted on in content. They are unlit.

**The idea.** The mountain already governs what a climber can see, and what they can see governs which question is askable. By headlamp you see three metres: only what your own hands have touched, which is exactly what Fuel and the trait rank are. The light comes up on the Handover's exit, and the first thing it reaches is a second headlamp on the rope below — so every question after that point is addressed to someone the respondent can see rather than to an abstraction. The mountaineering aid argument is the brief's question stated fifty years early: fixed ropes get people to the top who could not otherwise get there, and the standing charge is that the climber arrives without the competence the route used to demand. **The one thing to remember: the metaphor carries the light, the order and every string read after a value is banked, and it never touches a string read before one.**

## Where the metaphor helps and where it lies

The rule is the spec's own rule for the capacity screen's channel and mandate columns, which "never render" because showing them would tell the respondent which tiles the firm values. Extended one step: anything that could tilt an answer must not touch the answer. It is lintable, because content lives in JSON under `src/content` and never in components — a test fails the build if a reserved word appears in a block marked as the display label of a value written into `Response`.

The test for each candidate is the swap test: replace the word with its opposite-connotation synonym at the same denotation and ask whether a lane would move. "Fixed line" against "prepared route" moves a lane. "Camp" against "stage" moves nothing, because no answer is attached to it.

| Climbing term | What it maps to | Safe to use? | Why |
| --- | --- | --- | --- |
| Camp, high camp | A screen; the last screen | Yes, on screen | Swaps for "stage" with nothing moving. Already the refit's own rename. |
| The route, the rope line | Session progress | Yes, on screen | Drawn, never labelled. It is the object the respondent has been making all session. |
| The pack | The cards not yet placed | Yes, already shipped | "Four still in the pack" is in the refit. An object, not a category. |
| Dawn, first light, the dark | Field of view, and therefore which question is askable | Yes, scene only | Carries no value. This is where the whole metaphor lives. |
| The gust | The capacity cut | Yes, already in the spec | Weather as consequence. The spec ships it. |
| Clip, carabiner | The five development marks | Yes, as an object; "clip" already ships | A clip attaches and holds. It does not rank the style of the climbing. Most native object already in the refit. |
| Crux | Beat 3 | **No, respondent-facing** | It means "hardest and decisive". Beat 3 is the only place a respondent is shown a tension in their own answers and the refit built it as curiosity, not challenge. Use it as the dashboard name for the trap quadrant, where it beats "the pipeline trap". |
| Lead | Human-led | **No** | Collides with "a lead" and with the `prospect` item. And it arrives with the verdict attached: leading is honourable, which pushes toward "I run it" in the same direction as the headcount fear the refit already concedes it cannot prevent. `all_human_flag` would stop distinguishing a frightened analyst from a proud one. |
| Second, seconding | AI-assisted | **No** | Misreads as second-rate, as "I'll second that", and — very live in IPB — as secondment. It also inverts the accountability the lane asserts: in climbing the second is the junior who cleans the gear, while in "Agent drafts, I own it" the human is senior to the agent and is the one accountable. |
| Fixed line | Automated | **No** | Reads as fixed income, as a credit line, and as a landline, on a screen whose fourth item is `lending`. And it lies about the thing: a rope is inert and fails visibly, an agent makes choices and is wrong in confidently plausible ways. Priming "inert and legible" depresses `capacity_share['checkai']`, which is the sole definition of `qc_tax`. |
| Pitch | An activity, or a unit of progress | **No** | `pitchbook` is item 2 of the same thirteen; the canvas palette carries "Certification: pitch" and "Mock pitch to a panel"; trial `certify` reads "before they pitch a new client". A fifth meaning inside twelve minutes destabilises four other screens. Reserved word, banned outright. |
| Jumar, belay, rope gun | Automated; oversight | **No** | Jumar is opaque to everyone. Belay imports the wrong relationship — a belayer catches a fall, they neither do the work nor check it — which blurs the deliberately separate `accountable` and `check` items. "Gun" in a UI label is a tone problem independent of meaning. |
| Bottled oxygen, "by fair means" | Capacity tools | **No, anywhere** | Its real argument is not about learning, it is about whether the ascent counts. Level 4 is built so nothing on it is graded; an oxygen frame grades the premise, and would move `giveback` — already a declared lower bound — for reasons of authorship rather than capacity. |
| Sherpa, fixing the line | Training data, credit, extraction | **No, anywhere** | Labour- and ethnicity-loaded, and off-question. At a private bank, to a junior cohort, it invites "we are the Sherpas and the Advisors are the clients", which then arrives in `mark.missing` as a theme the working group has to handle. |
| Alpine style against siege style | A compressed programme against today's three-year one | **Dashboard only** | The socket was cut with trial `compress`. Naming it respondent-facing creates an expectation the instrument does not satisfy, and routes the thinking into free text where it cannot be analysed. It is an excellent name for the two canvas arms in the working group's report. |
| The career second — the strong follower who cannot lead | The brief's fundamental question | **Dashboard and report only** | The diagnosis is genuinely useful to the working group. The vocabulary is not usable on a respondent, and the remedy literature it points at is already in the beat-3 chip row in plain English. |
| Summit as arrival | Finishing the programme | **No** | The respondent is at month 14. The refit renamed the last camp for this reason. The summit stays above them, unclimbed. |

Nine of those rows are decorative even where they are safe: they rename something the instrument already measures. Two do real work — the career second, and the remedy structure underneath it — and both belong after the data is banked.

## The climb, screen by screen

Sky carries the narrative on a non-linear `t`. Progress is carried separately and linearly by the climber's altitude on the drawn route and by the count of lit tents, so the environment stays the progress bar without a bar. No screen moves. One block of items moves between two screens, and one free-text field moves to the summit.

| # | Screen | Light (`t`) | What the respondent does | What it captures | s |
| --- | --- | --- | --- | --- | --- |
| 0 | Base camp | 0.00 — last light gone, stars, tents lit behind, nothing above visible | Consent, segmentation, AI exposure, two readiness chip rows | context, 1b partial | 80 |
| 1 | Fuel | 0.06 — full dark, the headlamp flickers on, the rope draws behind as far as the beam reaches | Nine items, nine sets of three, best and worst | 1b, 2a partial, 2b | 100 |
| 2 | What they gave you | 0.12 — the cold hour, no horizon | Keep three traits in order, then the dependence dial | 2b, 2a partial | 45 |
| 3 | The Handover | 0.18 at beat 1, 0.28 at beats 2 and 3, then a step to 0.52 on exit | Thirteen jobs into three lanes, up to five clips, the reckoning | **1a, 1b, 4b**, the fundamental question | 115 |
| 4 | The day that comes back | 0.60 — headlamp off, colour on the snow, camera facing up the slope | Eight hours into nine destinations, then cut four, then the coda chip | **3a, 3b** | 105 |
| 5 | The trials ×2 | 0.72 — rim light on the ridges | `certify`, `classroom` | 4a-process, 4a-training | 60 |
| 6 | Build the route | 0.82 — full daylight on the face | Canvas, five units a year against a 26-unit palette | 4a, 4b | 100 |
| 7 | Mark to market | 0.92 — sun on the route climbed | Two dials, the advisor-change rank, agent-worries chips, one free text | 4a residual, **2b**, 4a-management | 65 |
| 8 | High camp | 1.00 — sun breaking on a summit above, unclimbed | Look down at the route; one optional line | nothing gated; `mark.change` | 40 |

**Total 710s, median — eleven minutes fifty.** Five seconds over the refit. The opt-in conversation sits outside the total, as it already does.

Levels 1, 4 and 5 do not change by a word. Level 4 in particular is the proof of concept for this whole document: "A deal, an escalation, a market that won't sit still. Four of those hours are gone. You choose which four", with the gust of snow and "It was always going to be a half-day" as the wink. That is the mountain working through weather and consequence with no technical vocabulary in it. Adding mountain language there would subtract from it.

**Level 0 — Base camp.** One scene line added. It is the progress contract, and it is what allows the sky to be non-linear without a respondent reading full daylight at screen 4 as "nearly done".

```
You're on the climb. Help us map it.

You're partway through the programme. Nobody knows what this job
actually is right now, or what it's teaching you, better than you
do. We're trying to work out what to keep and what to change now
that the tools have changed — for the cohort behind you, and for
the rest of your own climb.

Nine camps from here. The sun comes up well before the last one.

Your answers are held by People Analytics under a code. The working
group sees patterns, not people.

Head up
```

**Level 2 — What they gave you.** Renamed. The keep-two advisor-change rank moves to Level 7; the trait rank and the dial stay here, in the dark, because both are retrospective and because `archetype` derives from `top3[0]` and must not sit downstream of the Handover.

```
What they gave you.

Three traits of a great private banker, in order. Then one dial.

Keep three, in order.

If you'd been tagged to a different senior advisor on day one, how
different would your last six months have been?

unrecognisable ———————— identical

Next
```

**Level 3 — The Handover.** The level name never renders: "handover" names the direction of one of the three lanes and would pre-frame the screen from above the headline. Every recorded string is the refit's, with one chip swapped. What changes is the staging: three shelves on the face rather than three office lanes, drawn at the same apparent angle and difficulty, each with a 24px rope-state glyph beside the plain label. Laned cards are drawn onto the face and stay there, so by beat 2 the respondent is marking a wall they built.

```
Thirteen jobs. Who should be doing them in two years?

Drag each one to a lane. We're trying to find the work we can't
quietly automate.

This feeds two things: what the programme should teach, and where
the firm puts AI first. Your answers reach the working group under
a code, never with your name on them.

Keeping the record straight is on the list. We know.

   Agent runs it             No human in the loop.
   Agent drafts, I own it    It comes to me half-built.
   I run it                  The judgement is the job.

Haven't done this one

9 of 13 placed. Four still in the pack.

All thirteen. Move anything that looks wrong.

That's all thirteen
```

```
Now the ones that taught you the job.

Up to five. Not the ones you enjoyed — the ones where doing it
yourself is how you learned what good looks like.

Three clips left.   →   That's five. You can swap one out.

Five is the cap. Something has to come off.

None of these taught me much

Clip these
```

```
You'd hand seven to an agent. Three of those are clipped.

One thing doesn't add up, and it's the interesting bit.

You'd hand the briefing book to an agent. It's also one of the
ones that taught you.

So how does the next analyst learn that?

   Do it by hand for the first year, then hand it over
   Mark up the agent's draft with the Advisor
   Be shown a wrong-but-plausible draft and made to find the error
   Sit in the meeting the book was for
   Go first on the easy ones, the Advisor takes the hard ones
   They don't need to learn it — that's fine
   They don't, and the desk needs fewer analysts. That's the honest answer.

In your words, if you have them.

That's my answer     ·     Change something
```

```
You'd hand seven to an agent and none of them taught you much.
Worth knowing.
```

```
First light.

There's a lamp an hour below you, on your rope.

They start in September.
```

**Level 6 — Build the route.** The level name stays in the run of play and the dashboard. The rendered headline changes, because "build the route" is false for an Arm B respondent who is editing a programme somebody else laid, and a string read before an answer must not be true for one arm and false for the other.

```
The next cohort's three years.

Five units a year. You can't fit everything — that's the point.

Here's how it's laid today. Change what you'd change.

Mark the bricks you've already done.

Set it
```

**Level 7 — Mark to market.** Gains the nine-item advisor-change rank. Loses `mark.change` to High camp; keeps `mark.missing` behind the Next gate, so the working group keeps one gated free text whatever summit drop-off turns out to be.

```
Mark it to market.

Two numbers, then two questions.

The months you've actually had.
wouldn't wish it on anyone ———————— don't touch it

The rest of it, as you expect it to be.
wouldn't wish it on anyone ———————— don't touch it

Now the first draft arrives from a model. What should your senior
advisor do differently? Keep two, in order.

What worries you about handing work to agents?
   I'd stop learning the basics · I don't trust the output ·
   Clients won't accept it · I'd rather do the work · Nothing much

What are we not asking that we should?

This one is stored apart from your code. Say it plainly.

Last camp
```

## The turn

It sits on the Handover's exit, and it is bound to the exit rather than to beat 3 firing. That binding is not a nicety: beat 3 fires only on a conflict, so if dawn were bound to the reckoning, the most defensive and most AI-sceptical respondents — the segment `all_human_flag` exists to surface, and the one the sponsor most needs to read — would finish the whole instrument in the dark and get a visibly poorer product than everybody else. The null case, the all-human wall and the reckoning all get the same sunrise.

The sky is held still through beat 3. Nothing environmental happens downstream of the reckoning and upstream of the chip choice, because `reveal_flinch` is the instrument's only within-screen, within-minute, unprimed measurement of the brief's fundamental question, and a brightening coincident with a contradiction is readable as the instrument approving the answer just given. The step is 0.28 → 0.52 over 1.2 seconds, inside the existing camera move, extended from 600ms to 1400ms.

The camera does not rotate here. What changes is reach: the beam widens from three metres to the whole slope, and for the first time the scene renders something *below* the climber — a second headlamp, on the respondent's rope, below them, never overtaking. The rotation is spent once, at High camp, and it is spent there because that is the only screen where nothing is captured.

What it does to the questions either side. Before it, every question is about work the respondent's own hands have touched: what fed them, what their advisor gave them, which of thirteen jobs they would keep. After it, every question is about somebody else — the day that comes back to the analyst who joins your desk, the gates on the route above, the next cohort's three years, the thing you'd change for the cohort behind you. The refit's own methodological rule is that the Handover commits the respondent before they are reminded of developmental value. The turn is that rule rendered as weather: you commit in the dark, and then the light shows you what you did. It is the one place in the design where the metaphor and the measurement argument are the same argument.

Two things about it are built rather than argued. The copy names the successor before the lamp appears, so the lamp renders an addressee the instrument already had rather than introducing one. And on Level 4 the camera faces up the slope, with the lamp behind the respondent and out of frame — a composition decision taken for measurement reasons, because `giveback` is already a lower bound under social desirability and making the successor vivid at the moment somebody decides whether to keep eight hours or hand them back can only push it further down.

## The summit

High camp. Forty seconds, zero mandatory asks, one optional ask, nothing gated behind a Next. The rule that stops it becoming another question screen: **inventory, never outcome, and no arithmetic of inconsistency.** It shows the respondent what they committed to and shows the next climber beginning. It never shows how the route turns out for them, and it never crosses two of their answers against each other — the refit reserves that move for beat 3, where it is framed as curiosity and where `preReveal` protects the data, and a rebuke at the reward moment is the most expensive place in the instrument to spend it. The endorsement check is already collected as `reveal_flinch`.

The budget is real rather than added. `completedAt` fires on exiting Level 7, before High camp paints — neither source document states its trigger, and the whole argument rests on it — so levels 0 to 7 are in Postgres and abandoning here costs no analysable data. What a heavy summit actually damages is free-text yield, take-up of the moderated conversation, and cross-wave reputation, since the alumni wave and the twelve-month re-field both depend on wave-one respondents not telling the desk "it says twelve minutes and then asks you more". Those three are what the forty seconds is budgeted against. It is paid for by `mark.change` leaving Level 7, not by adding a question.

**What is shown.** Beat 1, about twelve seconds, no input: the first downward camera move in the instrument. The rope line drawn stroke-by-stroke since Level 1 is visible in full, nine tents lit, with the Level 6 canvas bricks drawn onto the slope above as camps not yet lit. The Handover answers become the terrain — human-laned items as bare rock, `together` as half-rigged, `agent` as rope already hanging. Always a full mountain, never a completeness bar, no count of what was omitted, and arm-blind, so two analysts comparing summits across a desk cannot discover that one of them started pre-filled. One numeral on the screen, and it is the protected count.

Beat 2, about six seconds, no input: the second lamp, carried silently from the Handover, at base camp at the start of its own night. Beginning, never outcome. The spec's weather-as-feedback grammar has spent twelve minutes training this respondent to read the environment as judgement, so an animation of how the next analyst fares would read as a grade on the data they just gave.

Above them, a summit they have not stood on: gold rim light, the route to it drawn and unclimbed, and a further range behind it visible only from this height. The spec's "reaches the summit at sunrise" is struck on the refit's own grounds. The confetti survives as the spec intended it, as light rays on the peak above rather than on the respondent.

**What is asked.** One thing, optional, skippable, and the card completes without it. This is `mark.change`, relocated from Level 7 and re-registered from working-group feedback to a line addressed to a person on screen. The change clause stays in the stem so the construct does not drift into well-wishes.

```
That's everything we needed. The rest is yours.

The sun's up. Turn around.

That's the route you'd leave them.

Three you'd keep in their hands: the investment proposal, the
client email, coordinating the specialists. The rest you'd hand
over, with rope already hanging.

Someone hung rope for you too. Nobody mentions it.

That lamp's still an hour below you.

They get here in the light. You got here in the dark.

One line to them.

They start in September. If you could change one thing before
they get here, what is it?

Nothing comes to mind

I have more to say — there's an hour of light left.

Done
```

The invitation to the conversation may be as mountain as it likes. The moderator's three prompts must be literal, always: that transcript is the only free text left in the instrument, and a prompt about which pitches you would want to lead comes back as a transcript about pitchbooks.

**What they take away.** A card, "The route I'd leave", dated and wave-stamped, because a proposal without a date is uninterpretable when it resurfaces in a working group six months later. Two renderings, and they must diverge, because the payload is no longer autobiography — it is opinion about AI and about a named senior advisor.

Shared render, exportable as PNG:

```
The route I'd leave
September 2026 · current analysts

Kept in their hands   the investment proposal · the client email ·
                      coordinating the specialists
The rest              handed over, rope already hanging
The day that comes back   learning with no deal attached
What they'll need first   reading people
Your line             "Ask for the reasoning before you ask for the deck."
```

Source fields, with fallbacks so the card never renders a blank row: the first row is up to three ids from `clips` laned `human`, in clip order; if that set is empty it falls back to `human`-laned items in lane order; if nothing is laned `human` the row is dropped and the card runs one row shorter. "The rest" is a phrase and never a numeral — "you'd hand nine of thirteen to an agent" must not be circulating inside a firm running an AI review. The third row is `argmax(capacity.kept)`. The fourth is `top3[0]` phrased forward as what the next analyst needs, never as self-description, because that rank is about a great private banker and not about the respondent. No segment data, no thirteen-item profile, no tenure pin — `monthsInProgramme` is undefined for the entire alumni wave, and an undefined pin at the top of a route is a silent lie.

Private in-session render, never exported: adds `advisor.changeTop2` and the full lane wall. A critique of a senior advisor, from someone identifiable by business crossed with team band, cannot be recalled from a PNG.

The spec's Advisor DNA card cannot be built as written and is struck rather than trimmed: the refit cut Level 1, so `readiness.month` is gone; it cut `dna.sort`, so innate-versus-built is measured nowhere; and `archetype` now derives from `top3[0]`, so handing it back as "your archetype" mis-attributes the respondent's own answer to themselves.

Explicitly out: any contradiction reveal; any in-session cohort calibration, because against twelve reporting cells with n=10 suppression at a realistic N of 150-400 the early respondents see noise, the reward is unequal by arrival time, and any number shown leaks a finding into a field that is still open. That reciprocity moves to a post-wave email when the field closes, which is retractable, is an approved communication, and buys wave-two response rate.

Build notes. The reveal is an M5 scope addition, not a copy change: `Scene`'s contract is `(t, camp, reducedMotion)` and it is aria-hidden and decorative, with no concept of look direction or of compositing respondent data into terrain. Build the card renderer first and reuse it three ways — PNG export, reduced-motion fallback, and a static composite over a single Pixi frame — so no new geometry animates on a phone that has been running WebGL for twelve minutes. Every number on the card exists as DOM text, not only inside a canvas with alt text. The dawn-stop contrast repair is a hard prerequisite for this screen: at `sky.dawn` the refit measures ice at 1.02:1, snow at 1.59:1 and gold at 1.05:1, and this is where it fails hardest and where the respondent is finishing.

## How a non-climber knows what they are answering

They never have to know anything about climbing, because no climbing word appears at any decision point. The three lanes are the refit's, unchanged:

```
Agent runs it             No human in the loop.
Agent drafts, I own it    It comes to me half-built.
I run it                  The judgement is the job.
```

The primary label is a sentence with the doer as its subject, and the three carry their own ordering in their grammar — the subject of the verb moves from the agent, to both, to me. That is not a stylistic preference. `appetite[i]` is scored agent=2, together=1, human=0, which is an ordinal assumption inherited by every number the screen produces, so the ordering has to be visible without a gloss. The floor test takes one minute: delete every sub-label and every glyph, show a non-climber the three primary labels alone, ask them to put them in order. Lead / second / fixed line fails that test, and fails it non-monotonically, because "lead" sounds most senior and most effortful while "second" sounds like second place.

The sub-label is a boundary condition, never a definition. Cover the sub-label and the respondent can still place a card. Under a climbing label those three lines would stop being elaboration and become a dictionary, and the screen would lose a layer of meaning it currently has for free.

The glyph carries the mountain, redundantly. Three 24px line drawings beside the plain labels, in the stroke language the spec already commissions: a rope already hung with a hand on it and nobody placing anything; two figures on one rope, one above the other; one figure with gear on the harness and no rope above them. The glyph says how much rope is already there, the words say who does the work, and they agree. Cover the glyph and nothing is lost — that is the definition of a redundant encoding rather than a second channel of meaning. It exists for card seven of thirteen, when respondents have stopped reading labels and are navigating by position and shape.

Two lines per bar at 360px, and a third is never built. The phone Handover is one card centre-stage over three full-width 44px drop bars, each already carrying a label and a sub, with the permission line visible throughout and the FooterBar pinned above the safe area. A climbing noun makes it three lines, roughly 200px for the bands alone before the card, the clip header and the counter. That is what settles the question independently of taste — and a lane worded differently by device would turn `deviceClass` from a QA control into an unremovable confound, when it is a mandatory cut in the Data Quality view precisely because lane distributions are QA'd by device.

No word at a decision point means anything else in this instrument. Reserved list, written into the content conventions and checked by a build test against any string marked as the display label of a value written into `Response`: pitch, lead, second, line, fixed, anchor, protection, belay, jumar, sherpa, oxygen, solo, crux, alpine, siege. The list scopes to recorded labels only. Post-capture copy at High camp may use a mountain phrase whose referent is drawn on screen, plain word first — "handed over, with rope already hanging" — and that ordering rule is the whole of the licence. There is no blanket claim that no climbing word appears anywhere; the claim is that none appears before a value is banked.

No calibration card and no tutorial, and card 1 is not pinned. Fixing the first card to `crm` buys comprehension of novel labels, and these labels are not novel; it would cost display position 1 out of the randomisation permanently, and the regression of `clip_rate` against display position is what the refit gates publication on.

**The plain-English fallback.** Nothing in the instrument depends on the metaphor for comprehension, which is what makes it safe and also what limits how far it goes. The spec guarantees cross-device resume, so a respondent can arrive at the Handover days later on a phone having seen none of the set-up, none of the transitions and none of the light. Every label on that screen is self-sufficient under those conditions. If the glyphs fail a pretest they drop to a plain colour ramp and nothing else changes. If the whole scene layer fails, the instrument is the refit's instrument with a different sky.

**The pretest is a kill switch with its threshold fixed in advance.** The refit already mandates think-aloud cognitive testing with 5-8 current analysts on the thirteen glosses. Four items are added at near-zero cost: paraphrase each lane in your own words; "was there anything in the wording that told you what answer we wanted?"; what did the light change mean, and did it feel like the instrument responding to your answer; and who is the second climber. Thresholds, set now so a clean result cannot be read as permission. If any single participant inverts or merges two lanes, the glyphs go. If more than one of eight reads the light change as approval, the dawn step moves to a screen boundary and the arc survives on the transition alone. If the lamp probe returns "replacement", the lamp is cut — it ships behind a feature flag so that costs no rework. Climbing familiarity is recorded as a pretest-only variable and never enters the live instrument. And the asymmetry goes in the plan in writing: at N=8, zero observed failures still leaves a 95% upper bound near 31% on the true misread rate, and a 5% misread rate on the lane feeding `appetite` is already more error than the screen can absorb. The pretest can veto a label. It can never license one.

## What this does not change

Unchanged, verbatim, every string and every field. **Handover:** all thirteen activity ids and their glosses; the three lane labels and the three sub-labels; the "Haven't done this one" tray and its exclusion from every denominator; the live line; the permission line; the aside; the five-clip cap and `noneTaught`; fixed beat order, handover first; the `preReveal` snapshot; the count line, headline, body and question at beat 3; the 140-character note; the null case; `itemOrder` fully randomised with no pinned card; every Zod invariant. **Capacity:** the entire screen, to the word — nine destinations with their labels and glosses, the eight-then-cut-four mechanic, the constant sums, `firstDest`, the meta line, the wink, the coda chips, the idle hint, the seeded shuffle with `giveback` off index 0 and 8, and the channel and mandate columns that never render. **Fuel:** nine items, nine sets of three, the pre-screen, `fuel_rank`. **Traits:** the ten cards and the keep-three rank. **The dial:** stem, scale and the 20/45/65/85 phrase ladder. **Trials:** `certify` and `classroom` with both branches. **Canvas:** palette, five units a year against 26, the pre-canvas completed tap, both arms. **Level 7:** `mark.scoreExperienced`, `mark.scoreExpected`, `mark.missing`, `mark.agentWorries`.

Every derived metric is computed from the same inputs and none changes definition: `appetite`, `clip_rate`, `clip_borda`, `trap_strict`, `handover_lift`, `safe_to_take`, `protected`, `notmine_rate`, `clip_count`, `conflict_count`, `reveal_flinch`, `together_share`, `all_human_flag`, `all_agent_flag`, `satisficing_flag`, all eleven capacity metrics, `pipeline_ratio`, `channel_share`, `qc_tax`, `gut_agreement`, `concentration`, `classroom_agreement`, `mentor_contradiction`, `fuel_rank`, `archetype`, `tenure_stratum`. Both headline charts stand as written.

Eight changes, each with its consequence.

1. **`advisor.changeTop2` moves from Level 2 to Level 7.** Same nine items, same stem, same keep-two-in-order mechanic, `nothing` still pickable at rank 1. `advisor.top3` and the dependence dial stay at Level 2, in the dark, so `archetype` and the summit card's fourth row are never downstream of the Handover. What it buys: the Handover's run-up is now AI-clean except Level 0's factual exposure chips, and the retrospective Level 2 keeps the buffer between Fuel and the Handover that the refit happened to have. The refit justified two placements and never justified this one, which makes it the only free variable in the sequence. What it costs, declared rather than argued away: the rank is now downstream of the Handover, the capacity screen, trial `certify` and a canvas palette containing certification bricks. `markup`, `standard` and `check` will inflate; `less` ("Coach less, certify more") sits downstream of a direct lexical prime and must be read with that stated; `nothing` is a lower bound, the same treatment `giveback_share` already gets. Under the refit's own rule, `check` and the `checkai` capacity tile may never be read as corroborating each other. If the working group's priority is 2b rather than 1a, this trade is backwards and reversing it is one line in the run of play.
2. **`mark.change` moves from Level 7 to High camp.** Same id, same schema, same 140-character cap, same separate store. The change clause stays in the stem. Missingness is now driven by summit drop-off rather than item non-response, so it must always be reported with a response rate and never as a census, and wave-one is comparable to a future re-field but not to the refit's version. `mark.missing` stays on Level 7 behind the Next gate, so one gated free text survives whatever the summit does. Kill criterion, fixed now: if `summit.messageLeft` is under 40% across the first fifty completes, the field goes back to Level 7 as a content flag, with no rework.
3. **One beat-3 chip is swapped.** `harder` ("A harder version of it, less often") is replaced by `blocklead` ("Go first on the easy ones, the Advisor takes the hard ones"). This is the one genuine import from the climbing argument — block leading, where partners alternate who goes first by difficulty — and it earns its place because it turns a permanent ownership question into a sequencing one, which is what a programme can act on next Monday. Cost, stated: a response option is removed, so that chip has no comparator in a re-field, and sequencing is now split across two chips (`byhand` and `blocklead`), so the row must be reported as a grouped sequencing share as well as chip by chip, or the modal chip in the third panel of the headline chart can move without any preference moving. The alternative — eight chips rather than seven — dilutes every share and makes the phone chip block taller; take it only if the working group will not give up `harder`.
4. **Two new booleans that are not questions:** `summit.messageLeft` and `summit.conversationStarted`, so summit participation is measurable and never confused with completion.
5. **`completedAt` is pinned to exiting Level 7**, before High camp renders. Neither source document states its trigger, and the summit's budget argument depends on it. The screen says so in its first line.
6. **Three scene booleans enter the persisted store and the autosave payload, not `Response`:** `scene.dawnLatched`, `scene.secondClimberRevealed`, `scene.campsLit`. The first two are one-way. `t` itself rewinds on Back — night falling again is correct and costs one crossfade — but a respondent must not be able to un-see the next climber, and a respondent resuming on a phone at Level 4 must not arrive in unexplained daylight. All three belong in the M1 resume acceptance criterion, which already tests desktop-to-phone resume.
7. **The High camp card is re-specified rather than trimmed**, per the summit section. No new data is captured by the card; it only renders.
8. **Copy edits to non-recorded strings only.** Level 2 is renamed "What they gave you". The beat-2 at-cap line reads "Five is the cap. Something has to come off." rather than "Five hooks", because clips, carabiners and hooks were three names for one object inside one screen. Two CTA labels: "That's all thirteen" and "Clip these". The canvas headline becomes arm-blind. Scene lines are added at Level 0 only. None of these is the display label of a value written into `Response`, and the capacity screen gains nothing at all, not even a scene line.

One new prime to declare in the limitations rather than in the copy deck: the turn points everything after the Handover at the successor. Direction is stated — it pushes `capacity_share` toward development-bearing destinations and `giveback` down, and `giveback` was already a lower bound, so it can only become more of one. Three mitigations are built rather than asserted: the capacity camera faces up with the lamp out of frame, the copy names the successor before the lamp appears, and nothing downstream of the turn is used as independent corroboration of anything upstream of it.

## The argument against this

The strongest case for leaving the screens plain is not about taste, and it is not weak.

**It re-adds the progress bar the spec was proudest of removing.** The spec's boldest claim is that "the environment itself is the progress bar. There is no separate progress bar." A non-linear `t` breaks it: full daylight arrives at roughly 44% of the instrument, immediately before the two longest screens in it, capacity at 105s and the canvas at 100s, with the sky barely moving thereafter — the wrong shape for abandon risk against a target of under 15%. The answer here is to split the scene's two jobs, sky for narrative and camps-lit plus altitude for progress, and to pre-empt the misreading with one sentence at base camp. But a countable, monotone, nine-unit indicator sitting permanently in the scene is a progress bar with tents on it. A reviewer who values the spec's claim more than this document does can reject the whole design on that point alone and would not be making a mistake.

**The second lamp is an untested narrative claim sitting upstream of a sponsor question.** `capacity_share` and `capacity_elasticity` are the only instruments answering 3a, and the turn puts a lit human being on the slope four minutes before those hours are allocated. Every plausible effect runs one way. The defence — that the capacity screen was already successor-framed by the refit's own candour device, so the lamp renders an addressee that was already there rather than adding one — is an assertion, not a measurement, and settling it needs a between-subjects arm with and without the lamp that there is no budget for. If `giveback` comes back at 8% rather than 14%, nothing in the dataset can say whether that is a preference or the headlamp.

**There is no ship-and-check fallback.** Metaphor-induced error on the Handover has the same telemetry signature as fluency: a falsely familiar word produces a fast, confident, wrong placement with clean `laneMs` and zero `laneChanges`, which the satisficing rule would wave through while flagging a confused-but-honest respondent. Every label decision has to be made before launch, on comprehension grounds, and cannot be monitored afterwards. That is the reason the measurement layer is plain, and it is also the reason nobody should be talked into one exception.

**And the relocation trades a clean 1a for a dirtier 2b.** That call rests on 1a being the sponsor's headline number. If the working group's real priority is how mentorship should evolve, this degrades their primary number to protect their secondary one.

**When to abandon it.** Two conditions, either sufficient. If the pretest returns a single participant who inverts or merges two lanes, the glyphs go first and the rest goes if it recurs. If more than one of eight reads the light change as the instrument approving their answer, the dawn step moves to a screen boundary and the turn survives on the transition alone; if it still reads as approval there, the whole light curve reverts to the spec's linear map. Reverting is cheap by construction, because no recorded string moved to make any of this work. The instrument underneath is the refit's instrument, and it has to be able to ship in daylight with a flat sky and lose nothing the sponsor asked for.
