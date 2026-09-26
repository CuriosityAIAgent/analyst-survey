/* The Ascent v2: the complete question script, as typed data.

   Wording source: docs/reviews/ascent-question-ux-plan.md (revision 2): section 5
   (question by question), section 3 (anatomy, in-place follow-ups, welcome,
   block breaks, ending) and section 4 (house style). Question ids follow the
   Monday brief, docs/reviews/ascent-themes-and-questions.md (1.1 to 5.6, C1, C2).

   Decisions from Haresh, 26 Sep 2026:
   - 3.4 (AI tools) is on BOTH phone and desktop, as labelled trays:
     "From day one" · "Once they've proven themselves" · "Not for them".
   - Every follow-up names its topic in a bridge line ("One more on classroom
     training.") and never repeats the respondent's answer.
   - No climbing words anywhere on screen. Plain words, as a senior Advisor
     would ask a colleague over coffee.

   Where the plan leaves wording open, or its final wording breaks a hard rule
   (a question of at most 14 words; "pitch" is banned), the text is written in
   the house style and marked TODO(Monday).

   How the data is shaped
   ----------------------
   `options` is always the list of answers the respondent picks from:
     checklist, podium   the rows or tiles
     cards, stamp        the buttons under each card (and the piles they fly to);
                         the cards themselves are `constraints.cards`
     trays               the tiles to sort; the trays are `constraints.trays`
     track               opt-out buttons under the track (often none);
                         the stops are `constraints.stops`
     months              the "No set time" chip; the slider is `constraints.range`
     bottle              the jugs; the hours to pour are `constraints.total`
     text                the notes to write in; `constraints.chars` per note
     5.6 (checklist)     the experience chips; the first step (Watched, Done,
                         Led) is `constraints.choices`

   What is stored under `stores` (the answer shape):
     tap one                 an option id                      'y2'
     pick N, top N           option ids in pick order          ['watching', 'setback']
                             (podium: 1st first)
     cards, stamp, trays     card or tile id -> answer id      { portfolio: 'by-hand' }
     track                   a stop id, or an opt-out id       'bit-ahead' | 'rather-not'
     months                  months, or the chip id            30 | 'when-ready'
     bottle                  jug id -> hours                   { coaching: 3, product: 5 }
     text                    note id -> text                   { keep: '...', change: '' }
     5.6                     { verb, pick } or { verb, text }  { verb: 'led', pick: 'review' }
   When `shuffle` is true, also log the order shown under `<stores>.order`.

   Follow-ups appear in place, in the same frame (plan section 3): the question
   band fades to the bridge, then the follow-up question. The bridge and the
   question are read together as one question band, so a follow-up question may
   lean on its bridge for its subject ("One more on classroom training. Should it
   be required?"). The rail adds a sub-dot, not a number. `when: 'always'` marks
   a step 2 that always follows its parent in place (1.3, 2.3, 3.1). */
import { BLOCK_NAME, type Block } from './contract'

export type Channel = 'phone' | 'desk'

export type Template =
  | 'checklist' | 'cards' | 'trays' | 'track' | 'podium'
  | 'bottle' | 'months' | 'stamp' | 'text' | 'scene'

export type Option = {
  id: string
  label: string
  /** One line printed under the label. Never a rule. */
  hint?: string
  /** An existing 3D render id (src/game/art/sprites.ts), only where it truly fits the label. */
  icon?: string
  /** Stays last when the list is shuffled (Not sure, I'd rather not say, "Much as it is today"). */
  pinned?: boolean
  /** Cards: at most this many cards may take this answer (3.2 "Do it by hand": 2). */
  cap?: number
  /** 5.5 stamp buttons: the icon that tells the piles apart (one stamp colour for all). */
  glyph?: 'cross' | 'query' | 'tick'
}

export type Card = { id: string; label: string; hint?: string; icon?: string }

export type Constraints = {
  /** Exactly this many: tap one = 1, pick two = 2, top 2 = 2, place 7 = 7. */
  pick?: number
  /** At least this many (pick any = 1; pick any, or skip = 0). */
  min?: number
  /** At most this many. */
  max?: number
  trays?: { id: string; label: string; capacity?: number }[]
  stops?: { id: string; label: string }[]
  range?: { min: number; max: number; step: number; unit: string }
  /** Bottle: the hours to pour. */
  total?: number
  cards?: Card[]
  choices?: { id: string; label: string }[]
  /** Text: the character limit per note or field. */
  chars?: number
}

export type FollowUp = {
  id: string
  /** When to ask it: see `matches` for the mini-language. */
  when: string
  /** The topic line: "One more on <topic>." Names the topic, never the answer. */
  bridge: string
  question: string
  instruction: string
  template: Template
  options: Option[]
  /** The options depend on the parent's answer: 'unpicked' (parent options not picked)
      or 'tray:<trayId>' (parent tiles placed in that tray). Resolve with followUpOptions. */
  optionsFrom?: 'unpicked' | `tray:${string}`
  constraints: Constraints
  /** Named strings drawn on the object (a header, a readout). */
  objectText?: Record<string, string>
  stores: string
}

export type Question = {
  id: string
  block: Block
  template: Template
  /** At most 14 words, plain, makes sense on its own. */
  question: string
  /** At most 10 words, states the exact count. */
  instruction: string
  /** The one short example line under the instruction. Shown before `privacy` on the same grey line. */
  note?: string
  /** Sensitive screens only. */
  privacy?: string
  options: Option[]
  constraints: Constraints
  /** Randomise `options` (pinned ones stay last) and log the order under `<stores>.order`. */
  shuffle?: boolean
  /** Named strings drawn on the object (a header, a readout, a counter). */
  objectText?: Record<string, string>
  /** Existing 3D renders the object is skinned with. */
  art?: string[]
  followUps?: FollowUp[]
  channels: Channel[]
  /** Desktop differences, merged in by questionsFor('desk'). */
  desk?: { instruction?: string; constraints?: Constraints }
  /** The answer key. */
  stores: string
  /** Which Monday question and goal it answers. */
  measures: string
}

export type Scene = {
  id: 'scene'
  block: Block
  template: 'scene'
  /** The heading ("Imagine that by 2031, Advisors have:"), then one line per row. */
  lines: string[]
  /** Says plainly that the plan is not the respondent's answer. */
  assumption: string
  /** The flip calendar turns from `from` to `to` by itself. */
  calendar: { from: number; to: number }
  channels: Channel[]
  stores: string
  measures: string
}

/* ------------------------------------------------------------ shared lists */

const BOTH: Channel[] = ['phone', 'desk']
const DESK: Channel[] = ['desk']

const NOT_SURE: Option = { id: 'not-sure', label: 'Not sure', pinned: true }
const RATHER_NOT: Option = { id: 'rather-not', label: "I'd rather not say", pinned: true }

/** The eight Advisor skills: one list, one set of names, for 2.2 and 2.3 (Monday Appendix A). */
const SKILLS: Option[] = [
  { id: 'new-clients', label: 'Winning new clients' },
  { id: 'meetings', label: 'Running meetings, asking hard questions' },
  { id: 'advice', label: 'Turning analysis into advice' },
  { id: 'across-firm', label: 'Working across the firm' },
  { id: 'prioritising', label: 'Prioritising across many clients' },
  { id: 'decide', label: 'Getting a client to decide' },
  { id: 'service-team', label: 'Leading a service team' }, // may not apply to Associates (plan decision 5)
  { id: 'ai-tools', label: 'Using AI tools well' },
]

/** The twelve activities for 3.1. One name each, everywhere (plan section 4, Activities).
    Icons only where an existing render shows exactly that task. */
const ACTIVITIES: Option[] = [
  { id: 'client-meetings', label: 'Client meetings' },
  { id: 'presenting', label: 'Presenting' },
  { id: 'portfolio', label: 'Portfolio analysis', icon: 'reviewpack' },
  { id: 'outreach', label: 'Prospect outreach', icon: 'clientmail' },
  { id: 'briefs', label: 'Meeting briefs', icon: 'pitchbook' },
  { id: 'onboarding', label: 'Onboarding and operations', icon: 'onboard' },
  { id: 'debriefs', label: 'Advisor debriefs' },
  { id: 'morning', label: 'Morning meeting' },
  { id: 'classroom', label: 'Classroom' },
  { id: 'role-plays', label: 'Role plays' },
  { id: 'crm', label: 'CRM and admin', icon: 'pitch-crmnotes' },
  { id: 'decks', label: 'Formatting decks' },
]

/** The five tasks AI could help with (3.2). Same ids, names and icons as the 3.1 tiles. */
const TASKS: (Card & { icon: string; topic: string; byHand: string })[] = [
  { id: 'portfolio', label: 'Portfolio analysis', icon: 'reviewpack', topic: 'portfolio analysis', byHand: 'do portfolio analysis' },
  { id: 'outreach', label: 'Prospect outreach', icon: 'clientmail', topic: 'prospect outreach', byHand: 'write prospect outreach' },
  { id: 'briefs', label: 'Meeting briefs', icon: 'pitchbook', topic: 'meeting briefs', byHand: 'write meeting briefs' },
  { id: 'onboarding', label: 'Onboarding and operations', icon: 'onboard', topic: 'onboarding and operations', byHand: 'do onboarding and operations' },
  { id: 'crm', label: 'CRM and admin', icon: 'pitch-crmnotes', topic: 'CRM and admin', byHand: 'do CRM and admin' },
]

/** The six traits for 1.3, with the clay figures the plan carries over. */
const TRAITS: Card[] = [
  { id: 'reading', label: 'Reading people', icon: 'trait-reading' },
  { id: 'drive', label: 'Drive to win clients', icon: 'trait-hunter' },
  { id: 'calm', label: 'Calm under pressure', icon: 'trait-calm' },
  { id: 'bounce', label: 'Bouncing back from a no', icon: 'trait-bounce' },
  { id: 'judgement', label: 'Commercial judgement', icon: 'trait-judgement' },
  { id: 'story', label: 'Numbers into a story', icon: 'trait-story' },
]

/** The five places the 8 hours can go (3.3). Ids match src/v2/hero/bottle/jugs.ts. */
const JUGS: Option[] = [
  { id: 'meetings', label: 'Client meetings' },
  { id: 'own-clients', label: 'Their own clients' },
  { id: 'coaching', label: 'Coaching' },
  { id: 'product', label: 'Product knowledge' },
  { id: 'new-clients', label: 'Finding new clients' },
]

/** The six AI tools (3.4): a plain name and a one-line everyday example.
    TODO(Monday): the example lines are new; names follow the plan's glossary. */
const AI_TOOLS: Option[] = [
  { id: 'chat', label: 'AI chat', hint: 'Ask a question, get a first draft.' },
  { id: 'office', label: 'AI in Outlook and Excel', hint: 'Drafts an email, tidies a spreadsheet.' },
  { id: 'research', label: 'AI on firm research', hint: 'Finds what J.P. Morgan research says.' },
  { id: 'client', label: 'AI that knows the client', hint: "Recalls a client's goals and last meeting." },
  { id: 'markets', label: 'AI that watches markets', hint: 'Flags a market move or a client event.' },
  // The glossary's line is "the whole pack, start to finish"; "pack" is a banned word, and
  // "meeting brief" keeps the same name as the 3.1 and 3.2 task.
  { id: 'meetings', label: 'AI that preps meetings', hint: 'Builds the whole meeting brief, start to finish.' },
]

/* ------------------------------------------------------------ the questions
   Listed in desktop play order. Block by block, as in plan section 5. */

export const QUESTIONS: Question[] = [
  /* ---------------- Block 1. Looking back ---------------- */
  {
    id: 'q1.2',
    block: 'look-back',
    template: 'podium',
    question: 'In A2A, what helped you learn the job the most?',
    instruction: 'Pick your top 2, best first.',
    options: [
      { id: 'morning', label: 'Morning meeting' },
      { id: 'senior-meetings', label: 'Meetings with a senior Advisor' },
      { id: 'watching', label: 'Watching a strong Advisor' },
      { id: 'explaining', label: 'An Advisor explaining their thinking' },
      { id: 'harder-work', label: 'Harder work, with feedback' },
      { id: 'own-view', label: 'Forming my own view first' },
      { id: 'operations', label: 'Time on operations' },
      { id: 'setback', label: 'A setback' },
      { id: 'classroom', label: 'Classroom or role play' },
      { id: 'own-learning', label: 'Learning on my own' },
    ],
    constraints: { pick: 2 },
    shuffle: true,
    objectText: { first: '1st', second: '2nd', third: '3rd' },
    // Top 3 on desktop instead of ranking all ten needs Adam's OK (plan decision 6).
    desk: { instruction: 'Pick your top 3, best first.', constraints: { pick: 3 } },
    channels: BOTH,
    stores: 'learn.top',
    measures: 'Monday 1.2, Goal 1: which sources of learning built our Advisors. 1st and 2nd pool across channels.',
  },
  {
    id: 'q1.1',
    block: 'look-back',
    template: 'checklist',
    question: 'In which year of A2A did you first lead part of a client meeting?',
    instruction: 'Tap one.',
    note: 'For example, ran the agenda or answered a question yourself.',
    options: [
      { id: 'y1', label: 'Year 1 of A2A' },
      { id: 'y2', label: 'Year 2' },
      { id: 'y3', label: 'Year 3' },
      { id: 'after', label: 'After A2A' },
      { id: 'not-yet', label: 'Not yet' },
    ],
    constraints: { pick: 1 },
    followUps: [
      {
        id: 'q1.1.what',
        when: 'is:y1|y2|y3|after',
        bridge: 'One more on leading a client meeting.', // TODO(Monday): the plan gives no bridge here
        question: 'What did you do in that meeting?',
        instruction: 'Tap one.',
        template: 'checklist',
        options: [
          { id: 'needs', label: 'Found out what the client needed' },
          { id: 'led', label: 'Led the conversation' },
          { id: 'defended', label: 'Defended a view' },
          { id: 'specialist', label: 'Brought in a specialist' },
          { id: 'difficult', label: 'Handled a difficult question' },
          { id: 'decision', label: 'Got the client to decide' },
        ],
        constraints: { pick: 1 },
        stores: 'lead.what',
      },
    ],
    channels: BOTH,
    stores: 'lead.year',
    measures: 'Monday 1.1, Goal 1: when A2A first produces a client moment, and what it was.',
  },
  {
    id: 'q1.3',
    block: 'look-back',
    template: 'cards',
    question: 'Did you have this before J.P. Morgan, or learn it here?',
    instruction: 'Swipe or tap. 6 cards.',
    options: [
      { id: 'had', label: 'Had it before' },
      { id: 'learned', label: 'Learned at J.P. Morgan' },
    ],
    constraints: { cards: TRAITS },
    followUps: [
      {
        id: 'q1.3.improving',
        when: 'always',
        bridge: 'One more on these six strengths.', // TODO(Monday): the plan gives no bridge for step 2
        question: 'Which two are you still improving?',
        instruction: 'Pick two.',
        template: 'checklist',
        options: TRAITS,
        constraints: { pick: 2 },
        stores: 'traits.improving',
      },
    ],
    channels: BOTH,
    stores: 'traits.origin',
    measures: 'Monday 1.3, Goal 1: which traits Analysts bring (a hiring test) and which they learn; step 2 finds gaps.',
  },
  {
    id: 'q2.2',
    block: 'look-back',
    template: 'checklist',
    question: 'When you started working with clients, which two skills were hardest for you?',
    instruction: 'Pick two.',
    options: SKILLS,
    constraints: { pick: 2 },
    channels: BOTH,
    stores: 'skills.hardest',
    measures: 'Monday 2.2, HNW shift: what the job asked that A2A did not teach. Compared with 2.3.',
  },
  {
    id: 'q4.1',
    block: 'look-back',
    template: 'checklist',
    question: 'What most often stops Analysts getting good coaching from their Advisor?',
    instruction: 'Tap one.',
    options: [
      { id: 'advisors-busy', label: 'Advisors are too busy' },
      { id: 'not-taught', label: "Advisors aren't taught to coach" },
      { id: 'no-time-set', label: 'No regular time set' },
      { id: 'dont-ask', label: "Analysts don't ask" },
      { id: 'analysts-busy', label: 'Analysts are too busy' },
      { id: 'works', label: 'It usually works' },
    ],
    constraints: { pick: 1 },
    objectText: { header: 'Coaching: you and your Advisor, 30 min' },
    channels: BOTH,
    stores: 'coaching.blocker',
    measures: 'Monday 4.1, Goal 2: what most often blocks coaching: time, skill, routine or the Analyst.',
  },
  {
    id: 'q4.2',
    block: 'look-back',
    template: 'checklist',
    question: 'When feedback really helped you, what made it useful?',
    instruction: 'Pick two.',
    options: [
      { id: 'same-day', label: 'It came the same day' },
      { id: 'thinking', label: 'It was about my thinking, not formatting' },
      { id: 'checked', label: 'My view was checked beforehand' },
      { id: 'outcome', label: 'I saw how the advice turned out' },
      { id: 'near-peer', label: 'It came from someone a year or two ahead' },
      // "I had a clear role in the meeting" was removed (26 Sep review): it is not about feedback.
    ],
    constraints: { pick: 2 },
    channels: DESK,
    stores: 'feedback.useful',
    measures: 'Monday 4.2, Goal 2: what makes feedback useful; the top pick becomes the routine.',
  },
  {
    id: 'q4.4',
    block: 'look-back',
    template: 'checklist',
    question: 'Which two kinds of training would have helped you learn fastest?',
    instruction: 'Pick two.',
    options: [
      { id: 'classroom', label: 'More classroom' },
      { id: 'role-plays', label: 'Role plays' },
      { id: 'ai-client', label: 'Practice with an AI client' },
      { id: 'examples', label: 'Examples of good work' },
      { id: 'seniors', label: 'Time with senior Advisors' },
      { id: 'self-paced', label: 'Self-paced modules' },
    ],
    constraints: { pick: 2 },
    followUps: [
      {
        id: 'q4.4.classroom',
        when: 'includes:classroom',
        bridge: 'One more on classroom training.',
        question: 'Should it be required?',
        instruction: 'Tap one.',
        template: 'checklist',
        options: [
          { id: 'always', label: 'Yes, always' },
          { id: 'unless-client', label: "Yes, unless there's a client meeting" },
          { id: 'optional', label: 'No, optional' },
        ],
        constraints: { pick: 1 },
        objectText: { header: 'Classroom training' }, // TODO(Monday): the invite's header line
        stores: 'classroom.required',
      },
      {
        id: 'q4.4.ai-client',
        when: 'includes:ai-client',
        bridge: 'One more on training with AI.', // TODO(Monday): the plan gives no bridge here
        question: 'Practice with an AI client could prepare an Analyst for which of these?',
        instruction: 'Pick any.',
        template: 'checklist',
        // TODO(Monday): the plan says "a list of concrete meetings (agree Monday)".
        options: [
          { id: 'review', label: 'A first client review' },
          { id: 'prospect', label: 'A first meeting with a prospect' },
          { id: 'upset', label: 'A client who is upset' },
          { id: 'market-fall', label: 'A call after a market fall' },
          { id: 'family', label: 'A family or estate talk' },
          { id: 'decision', label: 'Asking a client to decide' },
        ],
        constraints: { min: 1 },
        stores: 'aiClient.prepares',
      },
    ],
    channels: BOTH,
    stores: 'training.fastest',
    measures: 'Monday 4.4, Goal 2: where the training budget goes; follow-ups test required classroom and AI client practice.',
  },
  {
    id: 'q5.1',
    block: 'look-back',
    template: 'track',
    // TODO(Monday): the plan's wording is "When were you ready for your own client work,
    // compared with when you got it?" (15 words); shortened to fit the 14-word rule.
    question: 'Were you ready for your own client work before or after you got it?',
    instruction: 'Tap one.',
    note: 'For example, running a client review yourself.',
    options: [],
    constraints: {
      stops: [
        { id: 'year-before', label: 'A year or more before' },
        { id: 'months-before', label: 'A few months before' },
        { id: 'on-time', label: 'About when I got it' },
        { id: 'after', label: 'Only after I got it' },
        { id: 'not-yet', label: "I haven't got it yet" },
      ],
    },
    followUps: [
      {
        id: 'q5.1.blocker',
        when: 'is:year-before|months-before',
        bridge: 'One more on getting your own client work.', // TODO(Monday): the plan gives no bridge here
        question: 'What stopped you getting it sooner?',
        instruction: 'Tap one.',
        template: 'checklist',
        options: [
          { id: 'no-chance', label: 'No chance on my team' },
          { id: 'advisor', label: "My Advisor didn't hand it over" },
          { id: 'rules', label: 'Rules or licensing' },
          { id: 'confidence', label: 'My confidence' },
          { id: 'workload', label: 'Too much other work' },
          RATHER_NOT,
        ],
        constraints: { pick: 1 },
        stores: 'ready.blocker',
      },
    ],
    channels: BOTH,
    stores: 'ready.when',
    measures: 'Monday 5.1, Goal 3: were people ready before they got client work, and what held it back.',
  },
  {
    id: 'q5.6',
    block: 'look-back',
    template: 'checklist',
    question: 'No one should become an Advisor without having…',
    instruction: 'Tap Watched, Done or Led. Then pick one.',
    // TODO(Monday): the six experiences are to be agreed. Each reads after Watched, Done and Led.
    options: [
      { id: 'review', label: 'a client review' },
      { id: 'prospect', label: 'a first prospect meeting' },
      { id: 'difficult', label: 'a difficult client conversation' },
      { id: 'market-fall', label: 'a call after a market fall' },
      { id: 'family', label: 'a family or estate conversation' },
      { id: 'proposal', label: 'a client proposal' },
      { id: 'other', label: 'Something else…', pinned: true },
    ],
    constraints: {
      pick: 1,
      choices: [
        { id: 'watched', label: 'Watched' },
        { id: 'done', label: 'Done' },
        { id: 'led', label: 'Led' },
      ],
      chars: 60,
    },
    objectText: { placeholder: "For example, a review with a client's family" }, // TODO(Monday)
    channels: BOTH,
    stores: 'mustHave',
    measures: 'Monday 5.6, Goal 3: the must-have experiences, and at what depth; common answers become requirements.',
  },
  {
    id: 'q1.4',
    block: 'look-back',
    template: 'track',
    // TODO(Monday): the plan's wording is "If you'd been placed with a different Advisor at the
    // start, would you be further ahead or behind today?" (19 words); shortened to fit 14.
    question: 'With a different Advisor at the start, would you be ahead or behind today?',
    instruction: 'Tap one.',
    note: 'Assume you worked just as hard.',
    privacy: 'Only reported in groups of ten or more.',
    options: [RATHER_NOT],
    constraints: {
      stops: [
        { id: 'well-behind', label: 'Well behind' },
        { id: 'bit-behind', label: 'A bit behind' },
        { id: 'same', label: 'About the same' },
        { id: 'bit-ahead', label: 'A bit ahead' },
        { id: 'well-ahead', label: 'Well ahead' },
      ],
    },
    objectText: { marker: 'Where you are now', start: 'Behind', end: 'Ahead' },
    channels: BOTH,
    stores: 'advisor.counterfactual',
    measures: 'Monday 1.4, Goal 1: how much the luck of the Advisor mattered. Paired with the Advisor picks in 1.2.',
  },
  {
    id: 'q1.5',
    block: 'look-back',
    template: 'checklist',
    question: 'What most often stops good Analysts from becoming Advisors?',
    instruction: 'Tap one.',
    privacy: 'Only reported in groups of ten or more.',
    options: [
      { id: 'team', label: 'Not the right team' },
      { id: 'coaching', label: 'No coaching from their Advisor' },
      // TODO(Monday): the plan fixes only the two options above; the rest are to be agreed.
      { id: 'chances', label: 'Too few chances with clients' },
      { id: 'path', label: 'No clear path to Advisor' },
      { id: 'workload', label: 'Too much other work' },
      { id: 'offers', label: 'Better offers elsewhere' },
      NOT_SURE,
      RATHER_NOT,
    ],
    constraints: { pick: 1 },
    channels: DESK,
    stores: 'path.blocker',
    measures: 'Monday 1.5, Goal 1: whether we lose good Analysts to placement or to talent. Groups of ten or more.',
  },

  /* ---------------- Block 2. The job ahead (HNW shift) ---------------- */
  {
    id: 'q2.1',
    block: 'job-ahead',
    template: 'checklist',
    question: "In five years, what will an Advisor's job mostly look like?",
    instruction: 'Tap one.',
    options: [
      { id: 'few-deep', label: 'A few very wealthy clients, known deeply' },
      { id: 'many-helped', label: 'Many more clients, with AI and a team helping' },
      { id: 'winning', label: 'Mostly winning new clients' },
      { id: 'directing', label: 'Mostly directing specialists and AI' },
      { id: 'as-today', label: 'Much as it is today', pinned: true },
    ],
    constraints: { pick: 1 },
    shuffle: true,
    channels: BOTH,
    stores: 'job.future',
    measures: "Monday 2.1, HNW shift: how graduates see the Advisor job in five years, asked before the plan is shown.",
  },
  // (the scene-setting screen sits here: see SCENE)
  {
    id: 'q2.3',
    block: 'job-ahead',
    template: 'checklist',
    // The plan's wording is "As Advisors take on more, smaller clients, which three skills will
    // matter more than today?" (15 words); "than today" dropped to fit 14 (26 Sep review).
    question: 'As Advisors take on more, smaller clients, which three skills will matter more?',
    instruction: 'Pick three.',
    options: SKILLS,
    constraints: { pick: 3 },
    followUps: [
      {
        id: 'q2.3.less',
        when: 'always',
        bridge: 'One more on Advisor skills.', // TODO(Monday): the plan gives no bridge for step 2
        question: 'Will any matter less than today?',
        instruction: 'Pick any, or skip.',
        template: 'checklist',
        options: SKILLS,
        optionsFrom: 'unpicked',
        constraints: { min: 0, max: 5 },
        stores: 'skills.less',
      },
    ],
    channels: DESK,
    stores: 'skills.more',
    measures: 'Monday 2.3, HNW shift: which skills matter more, and less, with more, smaller clients. Gap against 2.2.',
  },
  {
    id: 'q2.4',
    block: 'job-ahead',
    template: 'checklist',
    question: 'With AI and a team helping, what must an Advisor still do themselves?',
    instruction: 'Pick two.',
    options: [
      { id: 'spot-wrong', label: 'Spot a wrong AI answer' },
      { id: 'build', label: 'Build the analysis themselves' },
      { id: 'brief', label: 'Brief AI and the team' },
      { id: 'hand-off', label: 'Decide what to hand off' },
      { id: 'explain', label: 'Explain a recommendation without notes' },
      { id: 'escalate', label: 'Know when to escalate' },
    ],
    constraints: { pick: 2 },
    channels: DESK,
    stores: 'advisor.stillDo',
    measures: 'Monday 2.4, HNW shift: what stays hand-built before AI and the team take over.',
  },

  /* ---------------- Block 3. A new Analyst's time (Goal 2) ---------------- */
  {
    id: 'q3.1',
    block: 'analyst-time',
    template: 'trays',
    question: 'What should new Analysts do more of, do differently, or do less of?',
    instruction: 'Place 7 of the 12. Leave the rest.',
    options: ACTIVITIES,
    constraints: {
      pick: 7,
      trays: [
        { id: 'more', label: 'Do more', capacity: 3 },
        { id: 'differently', label: 'Do differently', capacity: 2 },
        { id: 'less', label: 'Do less', capacity: 2 },
      ],
    },
    followUps: [
      {
        id: 'q3.1.fastest',
        when: 'always',
        bridge: 'One more on getting to Advisor sooner.', // TODO(Monday): the plan gives no bridge for step 2
        question: 'Which one would get a new Analyst to Advisor fastest?',
        instruction: 'Tap one.',
        template: 'trays',
        options: ACTIVITIES,
        optionsFrom: 'tray:more',
        constraints: { pick: 1 },
        stores: 'time.fastest',
      },
    ],
    channels: BOTH,
    stores: 'time.sort',
    measures: 'Monday 3.1, Goal 2: the working group vote (3 more, 2 differently, 2 less), then the one lever for speed.',
  },
  {
    id: 'q3.2',
    block: 'analyst-time',
    template: 'cards',
    question: 'AI could help with these tasks. How should a new Analyst handle each one?',
    instruction: 'Swipe or tap. 5 cards.',
    options: [
      { id: 'by-hand', label: 'Do it by hand', hint: 'Up to 2 cards', cap: 2 },
      { id: 'ai-drafts', label: 'AI drafts, Analyst checks' },
      { id: 'someone-else', label: 'Give to someone else' },
      { id: 'stop', label: 'Stop doing it' },
    ],
    constraints: { cards: TASKS.map(({ id, label, icon }) => ({ id, label, icon })) },
    // Asked on the same card, right after a by-hand choice (at most two).
    // TODO(Monday): the plan words only the portfolio analysis follow-up; the other four follow it.
    followUps: TASKS.map((t) => ({
      id: `q3.2.why.${t.id}`,
      when: `card:${t.id}:by-hand`,
      bridge: `One more on ${t.topic}.`,
      question: `Why should Analysts still ${t.byHand} by hand?`,
      instruction: 'Tap one.',
      template: 'cards' as const,
      options: [
        { id: 'own-view', label: 'They form their own view' },
        { id: 'room', label: 'It earns them a seat in client meetings' },
        { id: 'trust', label: "It builds the client's trust" },
        { id: 'mistakes', label: 'They learn to spot mistakes' },
      ],
      constraints: { pick: 1 },
      stores: `tasks.why.${t.id}`,
    })),
    channels: BOTH,
    stores: 'tasks.how',
    measures: 'Monday 3.2, Goal 2: which work stays human when AI can do it, and why. Checked against 3.1 "Do less".',
  },
  {
    id: 'q3.3',
    block: 'analyst-time',
    template: 'bottle',
    // TODO(Monday): the plan's wording is "If AI saved a new Analyst one day a week, where should
    // those 8 hours go?" (16 words); shortened to fit 14.
    question: 'If AI saved a new Analyst 8 hours a week, where should those go?',
    instruction: 'Tap a jug to pour 1 hour.',
    options: JUGS,
    constraints: { total: 8 },
    shuffle: true,
    objectText: { counter: '{left} of 8 hours left' },
    channels: BOTH,
    stores: 'hours.mix',
    measures: 'Monday 3.3, Goal 2: where time saved by AI should go: 8 hours across 5 choices.',
  },
  {
    id: 'q3.4',
    block: 'analyst-time',
    template: 'trays',
    question: 'When should a new Analyst get each AI tool?',
    instruction: 'Place all 6.',
    options: AI_TOOLS,
    constraints: {
      pick: 6,
      trays: [
        { id: 'day-one', label: 'From day one' },
        { id: 'proven', label: "Once they've proven themselves" },
        { id: 'not-for-them', label: 'Not for them' },
      ],
    },
    followUps: [
      {
        id: 'q3.4.first',
        when: 'card:meetings:day-one',
        bridge: 'One more on AI for meeting prep.', // TODO(Monday): the plan gives no bridge here
        // TODO(Monday): the plan's wording is "What should they learn by hand first?"; "they" named
        // (plan principle 1). The plan gives no options; these are new.
        question: 'What should a new Analyst learn to do by hand first?',
        instruction: 'Tap one.',
        template: 'checklist',
        options: [
          { id: 'brief', label: 'Write a meeting brief' },
          { id: 'portfolio', label: "Analyse a client's portfolio" },
          { id: 'research', label: 'Research the client' },
          { id: 'spot-wrong', label: 'Spot a wrong AI answer' },
          { id: 'nothing', label: 'Nothing: learn by doing', pinned: true },
        ],
        constraints: { pick: 1 },
        stores: 'aiTools.firstByHand',
      },
    ],
    channels: BOTH,
    stores: 'aiTools.when',
    measures: "Monday 3.4, Goal 2: the AI rollout for Analysts (Adam's managers of agents): day one, earned, or not at all.",
  },
  {
    id: 'q4.3',
    block: 'analyst-time',
    template: 'checklist',
    question: 'Every new Analyst should be promised one thing. Which should it be?',
    instruction: 'Tap one.',
    options: [
      { id: 'mentor', label: 'A named mentor' },
      { id: 'debrief', label: 'A debrief after client meetings' },
      { id: 'talk-through', label: 'A talk-through before meetings' },
      { id: 'speaking', label: 'A speaking part in meetings' },
      { id: 'ecm', label: 'Early Career Manager check-ins' },
      { id: 'weekly', label: 'Set weekly time with their Advisor' },
    ],
    constraints: { pick: 1 },
    objectText: { letter: 'Welcome to A2A. Every Analyst gets:' },
    channels: DESK,
    stores: 'promise',
    measures: 'Monday 4.3, Goal 2: the one thing every Analyst is guaranteed, set centrally.',
  },

  /* ---------------- Block 4. Getting to Advisor faster (Goal 3) ---------------- */
  {
    id: 'q5.2',
    block: 'faster',
    template: 'months',
    // TODO(Monday): the plan's wording is "From their first day, how many months should it take a
    // new Analyst to become an Advisor?" (17 words); the start point moved to the note line.
    question: 'How many months should it take a new Analyst to become an Advisor?',
    instruction: 'Tap or drag to set.',
    note: 'Count from their first day at J.P. Morgan.',
    options: [{ id: 'when-ready', label: "No set time: when they're ready" }],
    constraints: { range: { min: 12, max: 48, step: 3, unit: 'months' } },
    objectText: { readout: '{n} months', empty: '— months', whenReady: 'When ready', start: '1 year', end: '4 years' },
    channels: BOTH,
    stores: 'months',
    measures: "Monday 5.2, Goal 3: Adam's compression question: 12 to 48 months, or promote on skills.",
  },
  {
    id: 'q5.3',
    block: 'faster',
    template: 'cards',
    question: 'For each, can training speed up learning it, or does it just take experience?',
    instruction: 'Swipe or tap. 7 cards.',
    options: [
      { id: 'training', label: 'Training can speed it up' },
      { id: 'experience', label: 'Just takes experience' },
    ],
    constraints: {
      cards: [
        { id: 'product', label: 'Product knowledge' },
        { id: 'firm', label: 'How the firm works' },
        { id: 'trust', label: 'Earning trust' },
        { id: 'reading', label: 'Reading what a client needs' },
        { id: 'cycle', label: 'Judgement through a market cycle' },
        { id: 'confidence', label: 'Confidence leading a meeting' },
        { id: 'network', label: 'A network across the firm' },
      ],
    },
    channels: BOTH,
    stores: 'speedUp',
    measures: 'Monday 5.3, Goal 3: what better training can speed up, and what only time builds.',
  },
  {
    id: 'q5.4',
    block: 'faster',
    template: 'checklist',
    // TODO(Monday): the plan's wording is "An Analyst is ready sooner than expected. What should
    // they do on their own first?" (15 words); "on their own" became "alone" to fit 14.
    question: 'An Analyst is ready sooner than expected. What should they do alone first?',
    instruction: 'Tap one.',
    options: [
      { id: 'review', label: 'Run a client review' },
      // TODO(Monday): the plan says "Pitch a prospect"; "pitch" is on the banned list.
      { id: 'prospect', label: 'Present to a prospect' },
      { id: 'few-clients', label: 'Look after a few clients' },
      { id: 'call', label: 'Call new prospects' },
      { id: 'decide', label: 'Get a client to decide' },
    ],
    constraints: { pick: 1 },
    channels: DESK,
    stores: 'earlyFirst',
    measures: 'Monday 5.4, Goal 3: the first solo step on a faster path.',
  },
  {
    id: 'q5.5',
    block: 'faster',
    template: 'stamp',
    question: 'Six ideas for A2A. Should we do each?',
    instruction: 'Swipe or tap. 6 cards.',
    options: [
      { id: 'no', label: 'No', glyph: 'cross' },
      { id: 'not-sure', label: 'Not sure', glyph: 'query' },
      { id: 'yes', label: 'Yes', glyph: 'tick' },
    ],
    constraints: {
      cards: [
        { id: 'promote', label: 'Promote on proven skills, not years' },
        { id: 'certify', label: 'Sign off on set tasks before they do them alone' },
        { id: 'hnw', label: 'A few HNW clients each, supervised, by year two' },
        { id: 'ai-client', label: 'Make AI client role play required before real meetings' },
        {
          id: 'agents',
          label: 'Analysts run their own AI agents by year two',
          // The plan says "a meeting pack"; "pack" is a banned word, and "meeting brief" is the
          // name used everywhere else.
          hint: 'AI agents: AI that does tasks for you, such as preparing a meeting brief',
        },
        // TODO(Monday): 11 words, over the plan's 10-word card rule; new card (plan decision 6).
        { id: 'capacity', label: 'Let Advisors take on more clients with the time AI saves' },
      ],
    },
    followUps: [
      {
        id: 'q5.5.prove',
        when: 'card:certify:yes',
        bridge: 'One more on signing off set tasks.', // TODO(Monday): the plan gives no bridge here
        question: "How should an Analyst prove they're ready for a task like a client review?",
        instruction: 'Tap one.',
        template: 'stamp',
        options: [
          { id: 'watched', label: 'An Advisor watches a real meeting' },
          { id: 'case', label: 'A case study' },
          { id: 'role-play', label: 'Role play with an AI client' },
          { id: 'written', label: 'A written test' },
          { id: 'feedback', label: 'Client feedback' },
        ],
        constraints: { pick: 1 },
        stores: 'certify.how',
      },
    ],
    channels: BOTH,
    stores: 'ideas',
    measures: "Monday 5.5, Goal 3: support for Adam's bold ideas; a Yes on (b) asks how readiness is proven.",
  },

  /* ---------------- Closing ---------------- */
  {
    id: 'qC1',
    block: 'last',
    template: 'track',
    question: "How much does today's A2A programme need to change?",
    instruction: 'Tap one.',
    options: [],
    constraints: {
      stops: [
        { id: 'none', label: 'No change' },
        { id: 'small', label: 'Small changes' },
        { id: 'some', label: 'Some changes' },
        { id: 'big', label: 'Big changes' },
        { id: 'restart', label: 'Start again' },
      ],
    },
    channels: DESK,
    stores: 'change',
    measures: "Monday C1, closing: Adam's mark to market, read as mood, not a score.",
  },
  {
    id: 'qC2',
    block: 'last',
    template: 'text',
    question: 'What should A2A keep, and what should it change?',
    instruction: 'Optional: a few words in each.',
    options: [
      { id: 'keep', label: 'Keep' },
      { id: 'change', label: 'Change' },
      { id: 'else', label: "Anything we didn't ask?" },
    ],
    constraints: { min: 0, chars: 80 },
    channels: BOTH,
    stores: 'notes',
    measures: 'Monday C2, closing: what to keep, what to change, and anything we missed.',
  },
]

export const QUESTION: Record<string, Question> = Object.fromEntries(QUESTIONS.map((q) => [q.id, q]))

/* ------------------------------------------------------------ the scene-setting screen
   After 2.1, so it doesn't hand people 2.1's answer. Next is live at once. */

export const SCENE: Scene = {
  id: 'scene',
  block: 'job-ahead',
  template: 'scene',
  // TODO(Monday): Adam, and probably Communications, must approve the exact sentence (plan decision 7).
  // Worded as an explicit hypothetical (26 Sep review), not as the bank's plan: it goes out
  // before that approval. The first line is the heading; each later line is one row after it.
  lines: [
    'Imagine that by 2031, Advisors have:',
    'More clients each, most of them smaller.',
    'More AI helping them.',
    'A bigger team.',
  ],
  assumption: "You don't have to agree. Just assume it for the next few questions.",
  calendar: { from: 2026, to: 2031 },
  channels: BOTH,
  stores: 'scene.seen',
  measures: 'Monday "Setting the scene": logged as seen, not scored. Frames 2.3 onward on the HNW plan.',
}

/* ------------------------------------------------------------ play order (plan section 5) */

export const PLAY_ORDER: { phone: string[]; desk: string[] } = {
  phone: [
    'q1.2', 'q1.1', 'q1.3', 'q2.2', 'q4.1', 'q4.4', 'q5.1', 'q5.6', 'q1.4',
    'q2.1', 'scene',
    'q3.1', 'q3.2', 'q3.3', 'q3.4',
    'q5.2', 'q5.3', 'q5.5',
    'qC2',
  ],
  desk: [
    'q1.2', 'q1.1', 'q1.3', 'q2.2', 'q4.1', 'q4.2', 'q4.4', 'q5.1', 'q5.6', 'q1.4', 'q1.5',
    'q2.1', 'scene', 'q2.3', 'q2.4',
    'q3.1', 'q3.2', 'q3.3', 'q3.4', 'q4.3',
    'q5.2', 'q5.3', 'q5.4', 'q5.5',
    'qC1', 'qC2',
  ],
}

export const BLOCK_ORDER: Block[] = ['look-back', 'job-ahead', 'analyst-time', 'faster', 'last']

/* ------------------------------------------------------------ welcome, breaks, ending */

export const PRIVACY = 'Your answers are held under a code, not your name. We only report groups of ten or more.'

// TODO(Monday): set after the timed run with five Associates. Phone now carries 3.4 as well.
const MINUTES: Record<Channel, number> = { phone: 8, desk: 12 }

const countFor = (channel: Channel) => PLAY_ORDER[channel].filter((id) => id !== 'scene').length
const lengthLine = (channel: Channel) =>
  `${countFor(channel)} questions. Some have a few quick cards to sort. About ${MINUTES[channel]} minutes.`

export const WELCOME = {
  title: 'The Ascent',
  // TODO(Monday): "You've been through A2A" until Adam confirms who is answering (plan decision 5).
  intro: "You've been through A2A. Help us make it better, and faster, for new Analysts.",
  /** The honest length, per channel. */
  lines: { phone: [lengthLine('phone')], desk: [lengthLine('desk')] } as Record<Channel, string[]>,
  /** "What you'll do": the five block names. */
  sections: BLOCK_ORDER.map((b) => BLOCK_NAME[b]),
  privacy: PRIVACY,
  start: 'Start',
}

/** One per block: the plain block name and one short line. Breaks play between blocks
    (four of them); the first block's line is there if the welcome wants an opener. */
// TODO(Monday): the lines are new; the names are the plan's.
export const BREAKS: Record<Block, { name: string; line: string }> = {
  'look-back': { name: BLOCK_NAME['look-back'], line: 'First, your own time in A2A.' },
  'job-ahead': { name: BLOCK_NAME['job-ahead'], line: "Next, the Advisor's job in five years." },
  'analyst-time': { name: BLOCK_NAME['analyst-time'], line: 'How a new Analyst should spend their week.' },
  faster: { name: BLOCK_NAME.faster, line: 'What could make the path to Advisor shorter.' },
  last: { name: BLOCK_NAME.last, line: 'Nearly done.' },
}

export const ENDING = {
  line: 'AI can help. You still do the work.',
  /** Shown only once the answers have reached the server (see engine/send.ts). */
  thanks: 'Thank you. Your answers have been sent.',
  /** Preview runs, and live runs while response storage is not switched on (prototype review). */
  notSent: "Thank you. This is a preview version, so your answers stay on this device and aren't sent anywhere.",
  /** Next on the last question, and what it says while sending or after a failure. */
  send: 'Send',
  sending: 'Sending…',
  retry: "Couldn't send. Tap to try again.",
}

/* ------------------------------------------------------------ helpers */

/** The question as shown on a channel (desktop differences merged in). */
export function forChannel(q: Question, channel: Channel): Question {
  if (channel !== 'desk' || !q.desk) return q
  return {
    ...q,
    instruction: q.desk.instruction ?? q.instruction,
    constraints: { ...q.constraints, ...q.desk.constraints },
  }
}

/** The questions for a channel, in play order (no scene, no breaks). Its length is the rail's total. */
export function questionsFor(channel: Channel): Question[] {
  return PLAY_ORDER[channel]
    .filter((id) => id !== 'scene')
    .map((id) => {
      const q = QUESTION[id]
      if (!q) throw new Error(`PLAY_ORDER.${channel} names an unknown question: ${id}`)
      return forChannel(q, channel)
    })
}

export type Screen =
  | { kind: 'break'; block: Block; name: string; line: string }
  | { kind: 'scene'; scene: Scene }
  | { kind: 'question'; question: Question; n: number; total: number }

/** Every screen after the welcome, in order: questions (numbered for the rail),
    the scene, and a block break wherever the block changes. The ending follows the last.
    The scene belongs with the question after it: on a phone (no 2.3 or 2.4) the
    "A new Analyst's time" break comes first, so the scene sits directly before 3.1. */
export function screensFor(channel: Channel): Screen[] {
  const total = countFor(channel)
  const order = PLAY_ORDER[channel]
  const out: Screen[] = []
  let block: Block | undefined
  let n = 0
  for (const [i, id] of order.entries()) {
    const after = order.slice(i + 1).find((x) => x !== 'scene')
    const b = id === 'scene' ? (after ? QUESTION[after].block : SCENE.block) : QUESTION[id].block
    if (block !== undefined && b !== block) out.push({ kind: 'break', block: b, ...BREAKS[b] })
    block = b
    if (id === 'scene') out.push({ kind: 'scene', scene: SCENE })
    else out.push({ kind: 'question', question: forChannel(QUESTION[id], channel), n: ++n, total })
  }
  return out
}

/** Any answer a question can store (see the shapes at the top of this file). */
export type Answer =
  | string
  | number
  | readonly string[]
  | Readonly<Record<string, string | number>>

/* The `when` mini-language. One expression per follow-up, over the parent's answer.

     always                  asked whenever the parent is answered (a step 2 in place)
     is:<id>[|<id>...]       the answer (one id, or a number) is one of these
     includes:<id>[|<id>...] the answer (a list of ids) contains at least one of these
     lte:<n>                 the answer (a number) is at most n
     gte:<n>                 the answer (a number) is at least n
     card:<cardId>:<id>[|<id>...]
                             the answer (card or tile -> answer) puts that card, or
                             tile, on one of these answers, or in one of these trays

   An unanswered parent (undefined or null) matches nothing, not even `always`.
   A malformed expression throws, so a typo fails the tests rather than hiding a follow-up. */
export function matches(when: string, answer: Answer | undefined | null): boolean {
  if (answer === undefined || answer === null) return false
  if (when === 'always') return true
  const at = when.indexOf(':')
  if (at < 1) throw new Error(`Bad when: "${when}"`)
  const op = when.slice(0, at)
  const rest = when.slice(at + 1)
  const ids = (s: string) => {
    const list = s.split('|')
    if (list.some((x) => x === '')) throw new Error(`Bad when: "${when}"`)
    return list
  }
  switch (op) {
    case 'is':
      return (typeof answer === 'string' || typeof answer === 'number') && ids(rest).includes(String(answer))
    case 'includes': {
      const want = ids(rest)
      return Array.isArray(answer) && (answer as readonly string[]).some((a) => want.includes(a))
    }
    case 'lte':
    case 'gte': {
      const n = Number(rest)
      if (rest === '' || !Number.isFinite(n)) throw new Error(`Bad when: "${when}"`)
      return typeof answer === 'number' && (op === 'lte' ? answer <= n : answer >= n)
    }
    case 'card': {
      const c = rest.indexOf(':')
      if (c < 1) throw new Error(`Bad when: "${when}"`)
      const card = rest.slice(0, c)
      const want = ids(rest.slice(c + 1))
      if (typeof answer !== 'object' || Array.isArray(answer)) return false
      const got = (answer as Readonly<Record<string, string | number>>)[card]
      return got !== undefined && want.includes(String(got))
    }
    default:
      throw new Error(`Bad when: "${when}"`)
  }
}

/** Every follow-up this answer calls for, in the order to ask them. */
export function followUpsFor(question: Question, answer: Answer | undefined | null): FollowUp[] {
  return (question.followUps ?? []).filter((f) => matches(f.when, answer))
}

/** The next follow-up this answer calls for, if any. 4.4 (two picks) and 3.2 (two by-hand
    cards) can call for two: use followUpsFor to get them all. */
export function followUpFor(question: Question, answer: Answer | undefined | null): FollowUp | undefined {
  return followUpsFor(question, answer)[0]
}

/** A follow-up's options, narrowed by the parent's answer where `optionsFrom` says so. */
export function followUpOptions(question: Question, followUp: FollowUp, answer: Answer | undefined | null): Option[] {
  const from = followUp.optionsFrom
  if (!from) return followUp.options
  if (from === 'unpicked') {
    const picked = Array.isArray(answer) ? (answer as readonly string[]) : []
    return followUp.options.filter((o) => !picked.includes(o.id))
  }
  const tray = from.slice('tray:'.length)
  const placed = answer && typeof answer === 'object' && !Array.isArray(answer)
    ? (answer as Readonly<Record<string, string | number>>)
    : {}
  return followUp.options.filter((o) => placed[o.id] === tray)
}
