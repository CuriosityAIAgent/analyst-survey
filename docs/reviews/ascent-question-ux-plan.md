# The Ascent: making every question obvious

For Haresh · 26 September 2026 · a plan, not a build · revision 2

**Read in ten minutes:** sections 1 to 3, the house style at the top of 4, the templates and heroes at the top of 5, and 8. The question tables in 5 and everything else are reference for the build.

**What this is based on.** Screenshots of every screen, beat and follow-up at commit 7b65fc9, on desktop (1440x790, 1280x600, 1024x700) and phone (390x660), plus the code and `spec.json`. Three reviews fed the first draft: a walkthrough as a 26-year-old Associate, a language audit of every visible string, and a layout audit of where the eye and the hand go. Revision 2 adds two harsh reads of that draft: a five-second read by three imagined Associates (one busy, one sceptical, one reading in a second language) and a read as Adam and you. **Those reads were of the plan text, by reviewers playing a part. Nothing here has been tested with a real Associate, and no prototype exists.** Animation, drag feel and sound have not been judged. Timings and effort figures are estimates.

---

## 1. What is wrong

Your diagnosis holds on every screen. Each screen makes the Associate do four translations before they can answer: decode the climbing words, find the real question, work out the mechanic and its rules, and work out where to look. Testing it turned up a fifth: **"why are you asking me this?"** Follow-ups arrive with no lead-in, and sensitive questions carry no reassurance. The screens that already work (S01 B business and class, S07's three buttons, S09 B born or built) are the ones that need at most one translation. That is the strongest evidence for the diagnosis.

- **"You don't know where I need to read to do what."** Every screen asks its question twice: a plain line, plus an italic climbing line that sits on top on the phone, so people read it first. On desktop, S02 has about eight blocks of text before you can touch anything. The eye path is about 2,000 px of zig-zag, and "Walk on" sits bottom left, about 900 px from the last drag. On the phone the Next button is missing until the answer is valid, then appears below ("something pops up below").
- **"What the hell are you saying?"** The metaphor has reached the controls: "Start the climb", "Walk on", "Rope up the three traits", "Drag yourself along the ridge", "Base-camp crew", "Re-rig parts". The walkthrough found about 30 words an Associate would not understand, among them kit, pitch, cairn, anchor and "your rope held".
- **"It takes a little bit of time to understand."** Almost every screen has a new mechanic, with its rules written out as sentences. S10's scale runs backwards (a taller cairn means *less* change). S02 hides a rule in small print. S03 asks people to say "watched, done or led", but has no control for it.
- **"The connection is not obvious."** Pictures contradict their labels: crampons for Portfolio analysis, a coiled rope for Present to clients, a shut door for *mandatory*. On S05, six identical navy bricks carry twelve names.
- **"Some of the questions are not very thoughtful."** Follow-ups arrive with no bridge and some are leading ("Few people turn up to classroom training…"). S08 asks about your own Advisor with no "further ahead" option and no word that it is anonymous. The welcome says "Nine short screens, about six minutes" for about 19 answers, and opens "You made it from Analyst to Advisor", which may not be true of an Associate.

**What the second read found in the first draft of this plan.** It fixed the climbing words, then brought the four translations back in a new form. It gave almost every question its own bespoke object (about 25, from a wall planner to a phone home screen), so "a new mechanic every screen" became "a new picture every screen". Several objects fought their meaning: a highlighter marks what matters, not what is weak; tearing pages off a calendar means time passing; a stopwatch and an hourglass both just mean "time"; a phone dock doesn't mean "day one". Instructions contradicted the object ("Put them in order" on a shelf that holds two). Rules moved from sentences into small print on the object (a pen cap reading "1 left"). Pronouns and comparisons lost their referent ("they", "it", "here", "more than what?"). This revision fixes all of that. Only 10 of 35 screens passed the harsh read before; each failure is answered in section 5.

## 2. Principles (seven)

1. **One plain question that makes sense on its own.** Use the words an Associate would say to their Advisor. Name who ("a new Analyst", "you"), what ("Year 1 of A2A") and against what ("than today"). No "it", "they", "here" or "more" without its referent on the same screen. No idioms.
2. **The object's state is the answer, or the object stays small.** *The bottle shows the mix you poured; the jugs show the hours.* If the answer can't be read off the object without its labels, the object is decoration: keep it small, or leave it out.
3. **Read once, then act directly below.** One column: question, object, Next, top to bottom. *Next is always in the same place, directly under the thing you just touched.*
4. **Counts live in the instruction and on Next, never in small print.** *"Pick two." and a Next button that reads "Pick 1 more".* The mechanic is shown once by a ghost demo, never explained in a sentence.
5. **Four shared templates, four heroes.** Most questions reuse one of four templates (checklist, card stack, trays, track), so there is nothing new to decode. Four hero moments get a rich 3D object. The fun comes from those four and from motion, not from a new picture on every screen.
6. **The mountain is scenery and progress, never vocabulary.** *A small mountain with a dot shows how far you've come. The words "climb", "kit" and "rope" appear nowhere.*
7. **Earn trust on every screen.** State the real length and the number of cards. Put privacy on sensitive screens, offer "Not sure" and "I'd rather not say" where they apply, and make follow-ups neutral and name their topic. Present the bank's direction as an assumption, never as the right answer.

Taste for a private bank: clay 3D in the existing forest, bronze and ink palette. Small, weighted motion (a thunk, a soft pour, a stamp). No confetti, no points, no leaderboards.

## 3. The screen anatomy (one for both channels)

The desktop side panel, the italic stage caption, the "How to answer" block, the key hints, the visible checklist, the route indicators and the bottom-sheet follow-ups all go. Every screen, follow-ups included, is one centred column with five bands:

| Band | What it holds | Rule |
|---|---|---|
| **R** rail (44–48 px) | Back · mountain line with a dot and "Question 13 of 17" · `?` (keys) and Sound | The only progress mark, and the only place the mountain appears as UI. Follow-ups add a sub-dot, not a number |
| **Q** question | Serif, at most 2 lines. One grey instruction line underneath that states the exact count ("Pick two." "Swipe or tap. 6 cards."), plus at most one short example or privacy line | No kicker, no "why we ask", no key hints. These move to `aria-describedby` and the `?` sheet |
| **O** object | The template or hero object. It shows state, not rules | Starts no more than 32 px under Q |
| **T** tray | The parts you add (tiles, jugs), only if needed | Directly under O, so drags are short and go upward |
| **N** Next | Always rendered, always in the same place. "Next", or "Send" on the last screen | While the answer is incomplete, it is disabled and names what's missing: "Pick 1 more", "Place 4 more", "Pour 3 more". No tooltips, no pop-in |

### Desktop, 1440x790 (column 720 px wide)

```
+------------------------------------------------------------------------------------+
| < Back                /\  /\.  /\     Question 17 of 25            ?    Sound       |  R
+------------------------------------------------------------------------------------+
|  faded base-camp     If AI saved a new Analyst one day a week,       faded mountain  |
|  scene (30%,         where should those 8 hours go?                  scene, nothing  |  Q
|  not clickable)      Tap a jug to pour 1 hour.            (grey)     clickable       |
|                    +--------------------------------------------+                    |
|                    |            _____                           |                    |
|                    |           |-----|   eight fine hour lines,  |                    |
|                    |           |:::::|   no clock times          |                    |  O
|                    |           |/////|                           |                    |
|                    |           |_____|   "3 of 8 hours left"     |                    |
|                    +--------------------------------------------+                    |
|                    [jug 3 h] [jug 0 h] [jug 2 h] [jug 0 h] [jug 0 h]   label, hours, -  |  T
|                                                  [  Next   (Pour 3 more)  ]          |  N
+------------------------------------------------------------------------------------+
   eye path: Q -> O -> T -> N, one vertical line of about 520 px (today: about 2,000 px zig-zag)
```

### Phone, 390x660 (44 + 72 + 300 + 120 + 72 = about 608 px)

```
+--------------------------------------+
| <     /\ /\. /\   Question 13 of 17 S |  R
| If AI saved a new Analyst one day a  |  Q  2 lines
| week, where should those 8 hours go? |
| Tap a jug to pour 1 hour.            |
|  +--------------------------------+  |
|  |        [ the bottle ]          |  |  O  about 300 px
|  |      "3 of 8 hours left"       |  |
|  +--------------------------------+  |
|  [jug 3 h] [jug 0 h] [jug 2 h]       |  T  2 rows at most, 2-3 word labels
|  [jug 0 h] [jug 0 h]                 |
|  [ Next   (Pour 3 more)           ]  |  N  56 px, always there
+--------------------------------------+
```

### Sort screens (3.1) on phone: the trays are the object

```
| What should new Analysts do more of, |
| do differently, or do less of?       |
| Place 7 of the 12. Leave the rest.   |
|  +----------+-----------+----------+ |
|  | Do more  |    Do     | Do less  | |  count in the tray heading, in text size
|  |   (3)    |differently|   (2)    | |  "Full. Tap one to swap" shows inside a full tray
|  |          |    (2)    |          | |
|  +----------+-----------+----------+ |
|  [Client meetings] [Presenting] ...  |  12 tiles: label first, small icon second
|  [ Next   (Place 4 more)          ]  |
```

### How the mechanic is taught: by showing

- **Ghost demo, once per control family.** The first time each family appears, a ghost demo plays after 400 ms with no input. A translucent hand (phone) or pointer (desktop) lifts the first item and carries it about 60% of the way to its target. The target brightens and the object starts to react (the bottle level rises a little, the card tilts). Then the item springs back. It takes 1.5 s. Any touch, key or scroll cancels it. It never plays again for that family.
- **Reduced motion.** A static dotted arrow with a two-word label ("Drag up") shows for 3 seconds instead.
- **Lasting cues.** Grip dots and a grab cursor. A 2 px lift on hover. Valid targets glow as soon as something is picked up, with a snap within 24 px. A track handle sits visibly beside the track and nudges once until first touched. Every chosen item can be tapped again to undo it.
- **Refusals happen where the hand is.** A full tray shakes 2 px and shows "Full. Tap one to swap" inside itself for 2 seconds.

### How follow-ups appear: in place, one frame

```
 1. answered                    2. 250 ms                        3. follow-up live
 Q: Which two would have        Q fades to the bridge:           Q: One more on classroom
    helped you learn               "One more on classroom           training. Should it be
    fastest?                       training."                       required?
 O: [cards, 2 ticked]           O: slides up and away            O: [invite: Yes, always /
 N: [Next]                      T: new choices rise in               Yes, unless there's a
                                                                     client meeting / No, optional]
                                                                 N: [Next]   (same spot)
```

- No sheet, no blur and no second Back button. Back returns to the parent question with its answer still filled in.
- **Every follow-up is a full question that names its subject.** "Why should Analysts still do portfolio analysis by hand?", not "Why keep it by hand?". The bridge names the topic, never the person's answer. The current rule (desktop design 9.3) forbids echoing the answer, to avoid pressure to stay consistent; a topic bridge keeps to that while ending the "from nowhere" feeling. This is decision 4.

### Progress and the mountain as ambient game feel

- **Welcome.** "17 questions. Some have a few quick cards to sort. About 8 minutes." plus the privacy line. The real numbers are set after decision 3 and the timed run.
- **Rail.** A small mountain line with a dot, plus "Question 13 of 17". Block names are not shown on every screen.
- **Block breaks (4, about 1.2 s each).** Between the five blocks of section 5, the object leaves and the pictogram climber walks up to the next camp on the backdrop. The block name appears in plain words ("Looking back", "The job ahead", "A new Analyst's time", "Getting to Advisor faster", "Last thoughts"), then the next question slides in. This is the only place the climber moves, and it is the reward beat.
- **Backdrop.** On desktop, the clay base-camp scene fills both sides of the column at about 30% contrast. On phone, a thin ground band at the foot. Neither is clickable.
- **Ending.** The climber walks to the summit by itself (no drag). One line on screen, the game's idea said plainly: "AI can help. You still do the work. Thank you: your answers are saved, and you can close this tab."

## 4. The words

### House style in five lines

1. One question per screen, at most two lines, ending in "?". It must make sense on its own: say who, what and "than what". No idioms (see the banned list).
2. One instruction line that states the exact count, from a fixed list: *Tap one. · Pick two. · Pick your top 2, best first. · Place 7 of the 12. · Swipe or tap. 6 cards. · Tap or drag to set. · Tap a jug to pour 1 hour. · Optional: a few words.* The Next button repeats what is missing.
3. No climbing words anywhere on screen, in buttons, labels or screen-reader text. No rules in sentences or in small print on the object.
4. Keep the same name for the same thing on every screen. "You" is the respondent, "a new Analyst" or "new Analysts" are the future people, "their Advisor" is the senior, "J.P. Morgan" is the firm. Each item keeps one name everywhere, and "and" replaces "&".
5. Answer labels are 5 words or fewer, parallel, and carry their subject ("Advisors are too busy", not "Lack time"). Buttons: **Start · Next · Send · Back · Skip · Not sure · I'd rather not say · Yes / No**. Put a privacy line on the welcome screen and on 1.4 and 1.5.

**Banned on screen.** Climbing words: climb, climber, rookie, kit, pack, pitch, stretch, camp, base camp, summit, route, ridge, track, rope, clip, anchor, cairn, stones, re-rig, crew, own feet, walk on, storm, plaque, door, slot, lane, tokens. Jargon: policy (as an answer), dropped, unsure, once proven, LLM, avatar, agents (unless defined on the card), hypothesis, ECM, product shelf, hunter, families (for clients), "&". Idioms that trip a second-language reader: top shelf, gives back, gets in the way, make Advisor, comes with time, tweaks, held it back, least ready for, closest, were guaranteed, classmate, go with your gut, same you, same effort.

### Glossary: current → plain (reference; every visible term)

**Chrome, buttons and messages**

| Current | Plain |
|---|---|
| Start the climb | Start |
| Walk on / Start walking / Continue | Next |
| Tie it on | Send (last screen) / Done (a text note) |
| Leave it blank | Skip |
| Rather not say | I'd rather not say |
| BASE CAMP · THE FIRST YEARS (kicker) | (removed; block name shows only at block breaks) |
| BASE · CAMP I · CAMP II · CAMP III · SUMMIT / five tent icons | mountain line + "Question 13 of 17" |
| How to answer / Why we ask / key sentences | (removed from screen; `?` sheet and screen-reader text) |
| "1–4 sends the activity you're on…" / "I reads the one you're on." | (the `?` sheet only; keycap badges on hover or focus) |
| 0 of 8 slots filled / Holding: … | count in the instruction and on Next ("Place 4 more") |
| full: drop on a slot to swap | "Full. Tap one to swap" (inside the tray) |
| Nine short screens, about six minutes | 17 questions. Some have a few quick cards to sort. About 8 minutes. |
| Make four policy calls, and a few about you | (welcome list = the five block names) |
| (missing privacy line) | "Your answers are held under a code, not your name. We only report groups of ten or more." |
| You made it from Analyst to Advisor | You've been through A2A (until Adam confirms who is answering) |
| That's every question. Thank you. + One last pitch: drag the climber to the top | AI can help. You still do the work. Thank you: your answers are saved. |
| Their brief is perfect. The last pitch is still on foot. / They came to meet you, not the map. | (removed; the idea lives in the ending line) |
| Their kit: In hand · Packed · Day-one kit · On their own feet | Your answers: Do more · Do less · By hand · Must-have |
| Walk to the top / Skip (S11) | (removed; the walk plays by itself) |
| The storm has passed. Tap a card to call it again. | Tap a card to change your answer. |
| Rope up three traits first. | Pick two first. |
| Aria: "Storm calls…", "The rookie", "The cairn: 3 stones", "The brass plaque" | the plain question and plain labels |

**People and places**

| Current | Plain |
|---|---|
| them / the next one / climber / rookie / someone / every climber | a new Analyst / new Analysts |
| the climb (to Advisor) / the route | becoming an Advisor / the A2A programme |
| here (1.3) | at J.P. Morgan |
| kit / navigation kit | AI tools |
| Roped to a different Advisor | If you'd been placed with a different Advisor at the start |
| Your rope held | (removed) |
| a classmate who didn't make Advisor | good Analysts who don't become Advisors |

**Activities (3.1, 3.2: one name each, everywhere)**

| Current | Plain |
|---|---|
| Sit in client meetings | Client meetings |
| Present to clients | Presenting |
| Prep the meeting brief / Meeting brief | Meeting briefs |
| Onboarding & ops / Onboarding paperwork | Onboarding and operations |
| Debrief with Advisor | Advisor debriefs |
| CRM & admin / Meeting notes & CRM | CRM and admin |
| Deck formatting | Formatting decks |
| Prospect outreach draft | Prospect outreach |
| Classroom training | Classroom |
| Do more of this / Take off their plate / Keep, but change how | Do more / Do less / Do differently |
| Speeds them up most (a box) | a step: "Which one would get a new Analyst to Advisor fastest?" |
| More time on it, earlier / Less of it, or none / Can repeat one… | (removed) |
| On their own feet / The Analyst, no AI | Do it by hand |
| Walk it with kit / Kit drafts, they check | AI drafts, Analyst checks |
| Base-camp crew / Someone else does it, or it stops | Give to someone else · Stop doing it (two choices) |
| Five stretches / pitches of the climb | five tasks |

**AI tools (3.4, if kept)**

| Current | Plain (name · one-line description under it) |
|---|---|
| Paper map / LLM chat | AI chat · ask questions, get a draft |
| Compass / AI in your tools | AI in Outlook and Excel |
| Guidebook / Firm research AI | AI on firm research |
| GPS / Knows the client | AI that knows the client |
| Weather radio / Watch agents | AI that watches markets · and flags client events |
| Expedition brief / Agent team | AI that preps meetings · the whole pack, start to finish |
| Day one / Once proven / Not for them | From day one / Later, once ready / Not at all |
| By hand, once / Write a sharp brief / Time served / Can't trust the output | Do it by hand once / Brief the AI well / Time in the role / Can't trust it yet |

**Answers and scales**

| Current | Plain |
|---|---|
| SHUT / AJAR / OPEN; Mandatory, no exceptions / Mandatory, client first / Optional | Yes, always / Yes, unless there's a client meeting / No, optional |
| Few people turn up to classroom training. Should it be mandatory? | One more on classroom training. Should it be required? |
| Drag them up / camps / 12 to 48 months track | Tap or drag to set (months fill the track) |
| When proven | No set time: when they're ready |
| TODAY (at 36 months) | (removed: the Monday doc drops today's length) |
| Tap where you felt ready / Not yet | (replaced by 5.1) |
| Run a review alone / Pitch a prospect / Work names cold / Own a small book / Win a commitment | Run a client review / Pitch a prospect / Call new prospects / Look after a few clients / Get a client to decide |
| Storm coming. Four calls. Right: make it policy. / Should each one become policy? | Five ideas for A2A. Should we do each? |
| Make it policy / Unsure / Drop it | Yes (tick) / Not sure (?) / No (cross), on buttons and stamps |
| Certify before clients | Sign off on set tasks before they do them alone |
| AI clients replace some / Avatar role plays… | Make AI client role play required before real meetings |
| Agents by year two | Analysts run their own AI agents by year two (with a one-line definition on the card) |
| Freed time, bigger books | (replaced by 3.3; Advisor capacity becomes 5.5 card f) |
| How should they earn the pass? / certified / plaque | How should an Analyst prove they're ready for a task like a client review? |
| Avatar role play / Practical case test / Observed live by Advisor | Role play with an AI client / A case study / An Advisor watches a real meeting |
| Nowhere near here / … / Right here | Well behind / A bit behind / About the same / A bit ahead / Well ahead |
| Then guarantee every climber one thing (F5 A/B) | Every new Analyst should be promised one thing. Which should it be? |
| Pre-meeting hypothesis review / A named ECM check-in / Protected Advisor time / A set speaking role | A talk-through before meetings / Early Career Manager check-ins / Set weekly time with their Advisor / A speaking part in meetings |
| A hunter's drive / Calm in a storm / Bouncing back from no | Drive to win clients / Calm under pressure / Bouncing back from a no |
| Born with it / Built on the job | Had it before / Learned at J.P. Morgan |
| cairn / stones / 1 = rebuild, 5 = don't touch | No change / Small changes / Some changes / Big changes / Start again (more change to the right) |
| No one reaches the top without having… / Name one experience… | No one should become an Advisor without having… (Watched · Done · Led, then an experience) |
| client moment (1.1) | lead part of a client meeting |
| Stretch work someone debriefed / Forming my own view first | Harder work, with feedback / Forming my own view first |
| with better design / only come with time (5.3) | Training can speed it up / Just takes experience |

## 5. Question by question

### The four templates and the four heroes

Every question uses one of these. Each family gets one ghost demo, the first time it appears.

| Template | What it looks like | Families it carries |
|---|---|---|
| **Checklist** | A clean paper list with full-width rows. A tick draws on tap; tap again to undo. Picks can land in numbered places (the podium). | Tap one · Pick N · Top N |
| **Card stack** | One card at a time, labelled buttons directly under it, labelled piles either side. The instruction says how many cards. | Swipe or tap |
| **Trays** | Labelled trays with the count in the heading; tiles are label first, small icon second. | Sort |
| **Track** | A horizontal line with labelled stops you tap or drag along. It fills left to right with a material. A visible handle sits beside the track until touched, with a large readout above it. | Set a level |

Plus two one-off families: **Fill it up** (the bottle) and **Type** (C2, and "Something else" on 5.6). That is **eight families** in total, counted honestly: six on the templates, two one-offs.

**The heroes** are a richer skin on a template (except the bottle), with 3D art and sound:

1. **1.2 The podium** (screen 1). Ten plain tiles; tap one and it rises onto the 1st step with a soft thunk, then the 2nd. A podium says "1st, 2nd, 3rd" in any language. The first draft's bookcase needed the English idiom "top shelf" and nudged answers towards reading.
2. **3.3 The bottle.** Your idea: keep adding to the mix.
3. **5.2 The months track.** Your "animated slider" on Adam's headline question.
4. **5.5 The stamp and certificate.** Today's best screen, made richer.

One hero opens the game, so it feels like a game from the first tap. The other three sit at natural high points: the middle of block 3, the start of block 4 and the end of block 4.

**Play order.** The look-back block opens with the podium and ends with the two sensitive questions (1.4, 1.5), once some trust is built. 2.1 comes *before* the scene-setting screen, so the screen doesn't hand people 2.1's answer. Desktop: 1.2, 1.1, 1.3, 2.2, 4.1, 4.2, 4.4, 5.1, 5.6, 1.4, 1.5 · 2.1, scene · 2.3, 2.4, 3.1, 3.2, 3.3, 3.4, 4.3, 5.2, 5.3, 5.4, 5.5, C1, C2. ★ marks phone questions (17, with 3.4 on desktop only).

### Block 1. Looking back (theme numbers follow the Monday doc)

| # | Question · instruction | Object and motion | Measures · replaces |
|---|---|---|---|
| 1.2 ★ **HERO** | "What helped you learn the most?" · *Pick your top 2, best first.* (desktop: top 3) | **Podium** with steps labelled 1st and 2nd (3rd on desktop). Ten flat tiles below, randomised, 5 words or fewer: Morning meeting · Meetings with a senior Advisor · Watching a strong Advisor · An Advisor explaining their thinking · Harder work, with feedback · Forming my own view first · Time on operations · A setback · Classroom or role play · Learning on my own. A tapped tile lifts and lands on the next free step with a thunk; tap it to send it back. | Top 2 (phone) or top 3 (desktop); positions 1–2 pool across channels. Needs Adam's OK: the Monday doc ranks all ten on desktop (decision 6). · New |
| 1.1 ★ | "In which year of A2A did you first lead part of a client meeting?" · *Tap one.* · sub-line: "For example, ran the agenda or answered a question yourself." | **Checklist**: Year 1 of A2A · Year 2 · Year 3 · After A2A · Not yet. A small bronze pin drops on the chosen row as a reward. In place: **"What did you do in that meeting? Tap one."** Found out what the client needed · Led the conversation · Defended a view · Brought in a specialist · Handled a difficult question · Got the client to decide. | Ordinal (4 points plus Not yet), then one category. · S04 B |
| 1.3 ★ | "Did you have this before J.P. Morgan, or learn it here?" · *Swipe or tap. 6 cards.* | **Card stack** with the existing `trait-*` clay figures. Piles: "Had it before" · "Learned at J.P. Morgan", buttons under the card. Six traits that can go either way: Reading people · Drive to win clients · Calm under pressure · Bouncing back from a no · Commercial judgement · Numbers into a story. Then all six lay out in place: **"Which two are you still improving? Pick two."** | Forced binary × 6, then pick 2; no "Both", on purpose, so each card says which way it leans. "Market and product knowledge" and "Getting things done across the firm" are dropped: they can only be learned, and 5.3 already covers both. · S09 A and B |
| 2.2 ★ | "When you started working with clients, which two skills were hardest for you?" · *Pick two.* | **Checklist** of the eight skills (the same list 2.3 reuses). A tick draws on each pick. Next reads "Pick 1 more". | Pick 2 of 8. The wording works whether respondents are Associates or Advisors. "Leading a service team" may not apply to Associates (decision 5). · New |
| 4.1 ★ | "What most often stops Analysts getting good coaching from their Advisor?" · *Tap one.* | **Checklist** under a small invite header ("Coaching: you and your Advisor, 30 min"). Advisors are too busy · Advisors aren't taught to coach · No regular time set · Analysts don't ask · Analysts are too busy · It usually works. The chosen reason writes onto the invite; "It usually works" adds a tick. | Single choice of 6. · New |
| 4.2 | "When feedback really helped you, what made it useful?" · *Pick two.* | **Checklist**, options made parallel: It came the same day · It was about my thinking, not formatting · My view was checked beforehand · I saw how the advice turned out · It came from someone a year or two ahead · I had a clear role in the meeting (the last is not about feedback; keep or replace, decision 6). | Pick 2 of 6. · New |
| 4.4 ★ | "Which two would have helped you learn fastest?" · *Pick two.* | **Checklist** (course cards): More classroom · Role plays · Practice with an AI client · Examples of good work · Time with senior Advisors · Self-paced modules. In place, if classroom: **"One more on classroom training. Should it be required?"** on an Outlook-style invite: Yes, always · Yes, unless there's a client meeting · No, optional. If AI client: **"Practice with an AI client could prepare an Analyst for which of these? Pick any."** with a list of concrete meetings (agree Monday). | Pick 2 of 6, then conditional follow-ups. "Learn fastest" matches the Monday doc's "sped you up". · F1 door |
| 5.1 ★ | "When were you ready for your own client work, compared with when you got it?" · *Tap one.* · sub-line: "For example, running a client review yourself." | **Track** with five labelled stops, "About when I got it" in the middle: A year or more before · A few months before · About when I got it · Only after I got it · I haven't got it yet. The line fills from the middle to the tapped stop. If one of the first two: **"What stopped you getting it sooner? Tap one."** No chance on my team · My Advisor didn't hand it over · Rules or licensing · My confidence · Too much other work · I'd rather not say. | 4-point ordinal plus "not yet", then a conditional choice. · S04 B |
| 5.6 ★ | "No one should become an Advisor without having…" · *Tap one, then pick or type.* | **The sentence is the object**, in two visible steps on one line. First three buttons, none selected: Watched · Done · Led. Then six common experiences as chips (agree Monday, e.g. "a client review on their own") plus "Something else…", which opens a field with a placeholder example. The chosen words fill the sentence with an ink underline. | Category plus a chip or 60 characters. Tapping first spares second-language readers from writing grammatical English. · S03 signpost |
| 1.4 ★ | "If you'd been placed with a different Advisor at the start, would you be further ahead or behind today?" · *Tap one.* · sub-line: "Assume you worked just as hard. Anonymous." | **Track** from Behind to Ahead with a fixed "Where you are now" marker in the centre, with no length meaning. Tap one of five stops (Well behind · A bit behind · About the same · A bit ahead · Well ahead) to place a second, ghosted marker; the gap shades neutral. "I'd rather not say" underneath. | Symmetric 5-point scale (the Monday doc has 4; decision 6). Last-but-one in the block, once trust is built. · S08 ridge |
| 1.5 | "What most often stops good Analysts from becoming Advisors?" · *Tap one.* · sub-line: "Anonymous." | **Checklist**, including "Not the right team" and "No coaching from their Advisor"; the rest agreed Monday. Not sure · I'd rather not say. | Single choice with two opt-outs, about the system rather than a named colleague. It works for Associates and Advisors alike. Desktop only, reported in groups of ten or more. Needs Adam's OK (decision 6). · New |

### Block 2. The Advisor job ahead (HNW shift)

| # | Question · instruction | Object and motion | Measures · replaces |
|---|---|---|---|
| 2.1 ★ | "In five years, what will an Advisor's job mostly look like?" · *Tap one.* | **Checklist**, no bespoke art: A few very wealthy clients, known deeply · Many more clients, with AI and a team helping · Mostly winning new clients · Mostly directing specialists and AI · Much as it is today (fixed last). | Single choice of 5, randomised. · New |
| Scene | (no question) "For the next questions, assume the bank's plan for 2031: more clients each, most of them smaller. More AI. A bigger team." · "Whatever you picked, this is the plan, not your answer." | A small flip calendar turns from 2026 to 2031 by itself as the screen opens: thick client folders become a taller stack of thin ones, a laptop lights, two chairs slide in. Next is live at once. | Logged, not scored. The exact wording needs Adam's and probably Communications' sign-off (decision 7). · New |
| 2.3 | "As Advisors take on more, smaller clients, which three skills will matter more than today?" · *Pick three.* | **Checklist** of the same eight skills as 2.2. In place, step 2: **"Will any matter less than today? Pick any, or skip."** One neutral tint for both directions (no green or red, which read as prices). | 3 more, 0–5 less, the rest "same". Compared with 2.2 to find the gaps. · S09 ranking |
| 2.4 | "With AI and a team helping, what must an Advisor still do themselves?" · *Pick two.* | **Checklist**, skinned with the existing `hand-zone` renders: a picked tile rests in an open palm and the fingers close. Tap the tile, not the hand, to undo. "Do the work by hand" becomes "Build the analysis themselves". | Pick 2 of 6. · F3a |

### Block 3. A new Analyst's time, and what they're promised (Goal 2)

| # | Question · instruction | Object and motion | Measures · replaces |
|---|---|---|---|
| 3.1 ★ | "What should new Analysts do more of, do differently, or do less of?" · *Place 7 of the 12. Leave the rest.* | **Trays**: Do more (3) · Do differently (2) · Do less (2). Twelve label-first tiles with small icons. A tile drops in and the tray heading counts down; Next reads "Place 4 more". In place, step 2 highlights the "Do more" tiles: **"Which one would get a new Analyst to Advisor fastest? Tap one."** | A 3/2/2 sort matching the working group's votes, then one pick. The desktop-only third step ("start earlier") is dropped. · S02 |
| 3.2 ★ | "AI could help with these tasks. How should a new Analyst handle each one?" · *Swipe or tap. 5 cards.* | **Card stack**, one task per card, four full-width labelled buttons under it: Do it by hand (2 max) · AI drafts, Analyst checks · Give to someone else · Stop doing it. The card animates its choice (a pen line, a typed draft and a tick, a name tag, a strike-through) and flies to its pile. After a by-hand choice, on the same card: **"Why should Analysts still do [portfolio analysis] by hand? Tap one."** Formed my own view · Got me into the room · Built the client's trust · Taught me to spot mistakes. | One of four per task, by hand capped at 2, then a named why for each (at most two). Checked against 3.1 "Do less". · S06 |
| 3.3 ★ **HERO** | "If AI saved a new Analyst one day a week, where should those 8 hours go?" · *Tap a jug to pour 1 hour.* | **Your bottle, as a mix.** A plain glass bottle with eight fine hour lines and no clock times, and a counter: "3 of 8 hours left". Five jugs, randomised, each with a two- or three-word label and its own hour count ("2 h"): Client meetings · Their own clients · Coaching · Product knowledge · Finding new clients. Tap a jug: it tips and pours one hour with a soft pour sound, and the layer rises. Each jug has its own equal-weight pattern in the house palette, so the mix is visible and no colour looks better; the hour counts carry the answer for anyone who can't tell patterns apart. A − on each jug pours an hour back. When full, the cap turns on and Next lights. | Constant sum: 8 hours across 5 choices (the Monday doc says 5 tokens across 6; decision 6). "Their Advisor takes more clients" moves to 5.5 card (f), because it is not a way an Analyst spends their own hours. · S07 "Freed time" |
| 3.4 (desktop, if kept) | "When should a new Analyst get each AI tool?" · *Place all 6.* | **Trays**, three labelled rows: From day one · Later, once ready · Not at all. Six app-style tiles, each with a 2–3 word name and its one-line description printed under it (no tap for info). If "AI that preps meetings" goes in the first row: **"What should they learn by hand first? Tap one."** | A 3-way sort per tool. Adam's "managers of agents" idea. Settle whether it stays on Monday (decision 3). · S05 bricks |
| 4.3 | "Every new Analyst should be promised one thing. Which should it be?" · *Tap one.* | **Welcome letter with one blank**: "Welcome to A2A. Every Analyst gets: ______". The chosen option types into the blank and a signature scrawls. A named mentor · A debrief after client meetings · A talk-through before meetings · A speaking part in meetings · Early Career Manager check-ins · Set weekly time with their Advisor. | Single choice of 6. The F5 A/B test retires. · F5 |

### Block 4. Getting to Advisor faster (Goal 3)

| # | Question · instruction | Object and motion | Measures · replaces |
|---|---|---|---|
| 5.2 ★ **HERO** | "From their first day, how many months should it take a new Analyst to become an Advisor?" · *Tap or drag to set.* | **The months track.** A horizontal track from 1 to 4 years. The handle sits visibly just left of the track and nudges once. Drag or tap and the track fills left to right with small clay month blocks, one settling at a time with a soft click, under a large readout: "30 months". Before first touch the readout shows "— months". A chip underneath, "No set time: when they're ready", clears the blocks and shows one "When ready" card. | 12–48 months in 3-month steps, or skills-based. No default, no TODAY marker. More blocks means more time, so the picture and the hand agree. · S04 A camps |
| 5.3 ★ | "Could better training speed this up, or does it just take experience?" · *Swipe or tap. 7 cards.* | **Card stack**. Piles: "Training can speed it up" (a book) · "Just takes experience" (a calendar). Product knowledge · How the firm works · Earning trust · Reading what a client needs · Judgement through a market cycle · Confidence leading a meeting · A network across the firm. | Forced binary × 7. · F2b |
| 5.4 | "An Analyst is ready sooner than expected. What should they do on their own first?" · *Tap one.* | **Checklist**: Run a client review · Pitch a prospect · Look after a few clients · Call new prospects · Get a client to decide. The chosen task slides to the top. | Single choice of 5. · F2a |
| 5.5 ★ **HERO** | "Six ideas for A2A. Should we do each?" · *Swipe or tap. 6 cards.* | **Card stack with a rubber stamp.** No · Not sure · Yes sit under the card, each with an icon (cross, ?, tick). The stamp **thunks** the word and icon onto the card and it slides to its pile. One stamp colour for all three, so no answer looks favoured; the icons tell the piles apart. Cards, 10 words or fewer: (a) Promote on proven skills, not years · (b) Sign off on set tasks before they do them alone · (c) A few HNW clients each, supervised, by year two · (d) Make AI client role play required before real meetings · (e) Analysts run their own AI agents by year two, with "AI agents: AI that does tasks for you, such as preparing a meeting pack" printed on the card · (f) Let Advisors take on more clients with the time AI saves. If (b) is Yes, a **certificate** rises in place with a question above it: **"How should an Analyst prove they're ready for a task like a client review? Tap one."** An Advisor watches a real meeting · A case study · Role play with an AI client · A written test · Client feedback. | Yes, No or Not sure × 6, then a conditional choice. (d) restores Adam's "mandatory" as "required"; (e) restores "run their own agents". (f) is new (decision 6). · S07 and F4 plaque |

### Closing

| # | Question · instruction | Object and motion | Measures · replaces |
|---|---|---|---|
| C1 | "How much does today's A2A programme need to change?" · *Tap one.* | **Track** with five labelled stops: No change · Small changes · Some changes · Big changes · Start again. Above it, a small clay townhouse in three states (as it is · scaffolding · new blueprints on the same plot); the stops in between are shown by the track fill. No cleared site, no crane. Nothing is selected until tapped. | 5-point ordinal, read as mood. More change runs to the right. · S10 A cairn |
| C2 ★ | "What should A2A keep, and what should it change?" · *Optional: a few words in each.* | **Two sticky notes**, "Keep" and "Change", plus a faint third: "Anything we didn't ask?". Tap a note and it lifts into a text field (80 characters). Send is active even with every note empty. | Three optional short texts. · S10 B luggage tag |

**The families at a glance** (each has one ghost demo, the first time it appears):

- **Tap one** (checklist): 1.1, 1.5, 2.1, 4.1, 4.3, 5.4, 5.6
- **Pick N** (checklist): 2.2, 2.3, 2.4, 4.2, 4.4, 1.3 step 2
- **Top N** (checklist on a podium): 1.2
- **Swipe or tap** (card stack): 1.3, 3.2, 5.3, 5.5
- **Sort** (trays): 3.1, 3.4
- **Set a level** (track): 5.1, 1.4, 5.2, C1
- **Fill it up**: 3.3 · **Type**: C2, 5.6 "Something else"

## 6. What stays and what goes

**Stays**

- **The engine.** `store.ts`, `rules.ts` and their tests, `useDrag` (pointer, keyboard and swap logic), keyboard support (moved to the `?` sheet), sound, the one-accent fairness rule, and the Railway deploy.
- **The 3D clay pipeline and art style.** Forest, bronze and ink; clay renders trimmed to bounds.
- **Renders that carry over:** `trait-reading`, `-hunter`, `-calm`, `-bounce`, `-judgement` and `-story` (1.3; `trait-depth` and `trait-curiosity` retire), `hand-zone` and `hand-zone-closed` (2.4), `scene-basecamp` and `scene-basecamp-wide` (the backdrop), and the pictogram climber (block breaks and the summit only).
- **Mechanics that work:** `SwipeStack` with buttons under the card (S07 → 1.3, 3.2, 5.3, 5.5); S09 B's flanking piles; S01 B's chip card; "Unsure is a real answer" (as "Not sure").
- **The mountain:** progress in the rail, the block-break walk and the summit ending.

**Goes**

- **Layout:** the desktop two-column shell (`QuestionPanel`); the stage caption (`prompt`); the visible `Checklist` (it stays as a hidden live region for screen readers); `CampRoute`, `RouteAhead` and the `CampWalk` strip; the `Sheet` and `sheets/desk` overlays.
- **Art:** every `gear-*` icon; `rucksack`, `tarp-out`, `bench-rerig` and `rope-clips`; the `zone-*` climbers; the `brick-*` set; `fu-door*`; `fu-plaque`; `cairn-stone`; `signpost`; `luggage-tag`; the storm `card-*` art.
- **Copy and content:** every climbing word in copy, buttons and aria labels; the TODAY marker; the F5 A/B wording test; S05 as it stands; the S11 drag; keycaps as the first character of labels; "Same you, same effort".

**New art: about 6 sets, down from about 15.** **3D:** the podium and its tiles, the bottle and five jugs, the clay month blocks, the stamp and certificate, the townhouse in 3 states. **Flat 2D in house style:** the four templates themselves, small icons for the 12 activity tiles, the welcome letter and the invite (4.1 header, 4.4 follow-up), the flip calendar on the scene screen, and app-style glyphs if 3.4 stays.

## 7. How we validate before building

**Day-one prototype.** Two clickable prototypes, because your idea is the motion and a still can't test it: **3.3** (pour, the level rises, the jug counts change, the counter counts down) and **5.2** (drag, the blocks fill, the readout changes). Plus static Figma frames of seven screens: the welcome, 1.2, 1.3, 3.1, 3.2, the scene screen, and the 4.4 → classroom follow-up. Use the new anatomy and words, with placeholder art.

**Five-second test, five Associates.** Real Associates if Adam can lend five for 15 minutes each; otherwise junior bankers or recent graduates, noting that proxies can't judge J.P. Morgan terms such as "Early Career Manager". Include at least one person who works in English as a second language.

1. Show one screen for 5 seconds, then hide it.
2. Ask: *"What was the question?"*, *"What would you do first?"* and *"Where would you tap or drag?"* (they point on a blank outline).
3. Show it again and ask: *"Any word you didn't understand?"* and *"How many things do you have to do here?"*
4. Repeat for all frames, in random order for each person.
5. Finally, run the two clickable prototypes and time the first action.

**What counts as a pass** (all must hold):

- For each screen, at least 4 of 5 people restate the question in their own words with the right meaning, including who it is about.
- For each screen, at least 4 of 5 point to the right place to act and give the right count.
- No word is flagged as unclear by 2 or more people.
- On 3.3 and 5.2, the first action comes within 5 seconds for at least 4 of 5, and nobody asks what the bottle or the blocks mean.

A screen that fails twice moves to its plain template, not to more words.

**Before the test: a desk check of every screen,** by us, against two rules: the instruction states the exact count, and the screen makes sense read on its own (no "it", "they", "here" or "more" without its referent).

**After the build: a timed run.** Five Associates play the full phone set once. Pass: a median of 8 minutes or less, no one stuck for more than 15 seconds on any screen, and every follow-up understood without prompting. If it runs over 8 minutes, 3.2 moves to desktop (the Monday doc's rule).

## 8. Build order, effort and your decisions

**Effort** is a rough estimate for one engineer with AI help, in working days, and has not been measured:

| Step | What | Effort |
|---|---|---|
| 0 | Settle wording with Adam on Monday. Build the two clickable prototypes and the frames, run the five-second test. Nothing is built before this passes. | 2–3 days |
| 1 | **Plan review first** (`/plan-eng-review`; mandatory, because the new answer shapes change the stored schema). It must cover resetting sessions saved under the old answer shapes, as #9 did for the class list. Then the new frame for both channels: rail, one column, the Next row with its reason, in-place follow-ups, ghost demo, block breaks, and a copy pass on every string and aria label. The layout rules become checks in `game-shot.mjs`. | 3–4 |
| 2 | The four templates, the bottle and the text notes, with all 25 questions wired to `store` and `rules` using placeholder art. Phone and desktop sets. Unit tests on each answer shape. | 5–7 |
| 3 | The four heroes (podium, bottle, months track, stamp and certificate) with 3D renders and sound. | 4–5 |
| 4 | The remaining art (the house, activity icons, letter, invite, calendar). Retire the old art. | 1–2 |
| 5 | `/codex review`, full screenshot sweep, timed run with 5 Associates, fixes, ship (merging to main deploys). | 2–3 |
| | **Total** | **about 3½ weeks** (was about 4 with 15 art sets) |

**Decisions for you**

1. **Is this the direction?** One column on both channels; four shared templates plus four heroes (podium, bottle, months track, stamp); no climbing words or idioms; the mountain only as scenery, progress and block breaks. This blocks everything else.
2. **The bottle as your mix.** A plain bottle with hour lines, five jugs with hour counts, on 3.3. Is that the picture you had in mind? The "Their Advisor takes more clients" option moves out to 5.5 card (f).
3. **Does 3.4 (AI tools) stay?** The Monday doc keeps it in the body and drops it in the appendix. We recommend keeping it on desktop only, as labelled trays, because it is Adam's "managers of agents" idea; the ending line carries "AI can help, you still do the work" either way. Settle it on Monday.
4. **Follow-up bridge.** Should follow-ups name their topic ("One more on classroom training")? This relaxes the no-echo rule (desktop design 9.3). We recommend yes: the answer itself is never repeated.

**For Adam on Monday**

5. **Who is answering: Associates or Advisors?** This sets the welcome line, the 1.1 labels and "Leading a service team" in 2.2. 1.5, 2.2 and 5.1 are now worded to work for both, so this no longer blocks them.
6. **Measure changes.** 1.2: top 3 on desktop instead of all ten ranked. 1.3: six traits instead of eight. 1.4: five symmetric points instead of four. 1.5: "what stops good Analysts" instead of "a classmate who didn't make it". 3.3: 8 hours across 5 jugs instead of 5 tokens across 6. 5.5: add card (f) on Advisor capacity; (d) says "required" and (e) says "run their own AI agents". 4.2: keep or replace "I had a clear role in the meeting". 5.6: store Watched, Done or Led and offer six common experiences to tap. The desktop step 3 on 3.1 and the F5 A/B test retire.
7. **The scene-setting wording.** It states the bank's strategy to staff ("more clients each, most of them smaller"). Adam, and probably Communications, must approve the exact sentence.
8. **Who takes the five-second test:** five real Associates for 15 minutes each, or proxies.
