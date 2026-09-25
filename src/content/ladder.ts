/* The five rungs are the five ways a desk already delegates to PEOPLE:
   do it yourself; build it with the analyst at your shoulder; brief the analyst
   and mark up what comes back; write the template the team runs on; send it to
   the shared service and handle escalations. Every Associate has done all five
   with humans, so this is a vocabulary they already own.

   What increases as you climb is the SIZE OF THE UNIT YOUR JUDGEMENT IS APPLIED
   TO: the sentence, the draft, the finished deliverable, the recipe, only the
   exception. Not "how much AI" — someone can have a model open six hours a day
   and sit at `assisted` the whole time. */

export const RUNGS = [
  {
    id: 'own',
    label: 'I do it',
    whoDecides: 'You, on every choice, unaided',
    stillDo: 'All of it, including the blank page',
    stopDoing: 'Nothing. This is the floor, and it costs the evening',
  },
  {
    id: 'assisted',
    label: 'It helps while I work',
    whoDecides: 'You, continuously — but choosing between shapes it framed',
    stillDo: 'Set the structure, write the parts that carry risk, check as you go',
    stopDoing: 'Starting from nothing, and making the small errors that corrected you',
  },
  {
    id: 'briefed',
    label: 'I brief it, then I check it',
    whoDecides: 'You, once per item, at the end, over the errors you can still see',
    stillDo: 'Write the brief, read the whole thing, correct it, carry the sign-off',
    stopDoing: 'Building it — so you stop seeing how it was built',
  },
  {
    id: 'standing',
    label: 'I set it up once, then it runs',
    whoDecides: 'You, in the past, for every future instance. At run time, nobody',
    stillDo: 'Author the standard, spot-check, own every failure',
    stopDoing: 'Reading the ordinary one',
  },
  {
    id: 'service',
    label: "It's a service; I see the exceptions",
    whoDecides: 'Whoever runs the service — the firm, the vendor, the model',
    stillDo: 'Handle escalations, own the client relationship, notice when the aggregate looks wrong',
    stopDoing: 'Seeing the normal case at all',
  },
] as const

export type RungId = (typeof RUNGS)[number]['id']

/** The last rung at which you read every finished output before it counts.
    The pipeline does not break at automation in general. It breaks here. */
export const INSPECTION_LINE: RungId = 'briefed'

/** Four boundaries, four binaries. Each answerable from memory about observable
    behaviour, which is what makes two Associates classify a task the same way. */
export const BOUNDARY_TESTS = [
  { between: ['own', 'assisted'], test: 'Point at the page. Did any sentence, number or structure come out of the model?', falls: 'Any at all → it helps while I work' },
  { between: ['assisted', 'briefed'], test: 'Did a whole, finished version exist before you had read any of it?', falls: 'Yes → I brief it, then I check it' },
  { between: ['briefed', 'standing'], test: 'Do you read every one before it counts?', falls: 'No → I set it up once, then it runs' },
  { between: ['standing', 'service'], test: 'Could you change what it does tomorrow, without asking anyone?', falls: 'No → it is a service' },
] as const

/** One frozen scenario, used for all five rungs and never varied. Vary it and
    the rungs stop meaning the same thing. */
export const VIGNETTE = {
  title: 'Tuesday 9am, the Delgado review',
  body: '$42m across three entities and a GRAT. Thirty-one percent of the liquid assets still sit in the stock of the acquirer that bought their business eighteen months ago. A $6m securities-based line drawn to $4.1m. A $900k capital call due on the 14th. The Advisor wants a twelve-page briefing book by 5pm Monday.',
  /* One error, planted at every rung: page nine has the capital call two days
     out. WHO catches it changes; WHETHER it gets caught does not run one way.
     That is the neutrality device — you cannot read the five scenes and extract
     "further along is safer" or "further along is riskier", because neither is. */
  plantedError: 'Page nine has the capital call two days out.',
} as const

export const SCENES: Record<RungId, { happens: string; youDo: string; youStop: string; caption: string }> = {
  own: {
    happens: '5:40pm Monday. You pull the position report, re-read your own March contact report, dig the capital call out of the alternatives statement, and ring the Investor because the collar pricing is not in any system you can reach. Then you work out that the concentrated position and the drawn line are one problem, not two, and write all twelve pages.',
    youDo: 'Decide what matters to this family this quarter, and write it.',
    youStop: 'Nothing — and the floor is not free. Three hours of a Monday, a book capped at what you happen to know tonight, and two errors a colleague would have caught.',
    caption: 'You made all twelve. You read all twelve before it went.',
  },
  assisted: {
    happens: 'The book is open and the model is open beside it. You ask what has drifted since March. You ask it to explain the acquirer’s structured note. You argue with its summary of the house credit view and keep one sentence of three.',
    youDo: 'Hold the pen the whole way. Choose the order of the argument, and write the recommendation page yourself.',
    youStop: 'The blank page. You stop generating the candidate framings and start choosing between framings it offered. And the structured note now gets explained to you rather than by you.',
    caption: "You read all twelve before it went. Some of what was on them wasn't yours.",
  },
  briefed: {
    happens: 'You write the brief at 5:15pm. At 6:10pm twelve finished pages are on your screen, and your job for the next forty minutes is to find what is wrong with them. Performance on page four is gross, not net. The collar page asserts a conviction the Investor never gave you.',
    youDo: 'Write the brief, which is a real skill and a new one. Read all twelve pages before anyone else does, and carry the sign-off.',
    youStop: 'Building it, so you stop finding out how it was built. You never get the attribution wrong and never get corrected — and you calibrate good by having made bad ones.',
    caption: 'It was finished before you saw it. You still read all twelve.',
  },
  standing: {
    happens: 'In January you wrote down what a briefing book is. Since then every meeting on the Advisor’s calendar generates one at 6am two days out. You read the first dozen in February. You stopped in March. Once a fortnight you pull two at random and read them against source.',
    youDo: 'Author the standard, in advance, for every future instance, and own every failure of it whether or not you saw that one.',
    youStop: 'Reading the ordinary one. The client asks about the capital call in the room, because it was not in the two you pulled.',
    caption: 'You wrote the recipe. You read two of the last twenty.',
  },
  service: {
    happens: 'The book arrives. It has always arrived. Nobody on your desk chose its format, and you could not change it this week if you wanted to — it belongs to the platform. What reaches you is the exception queue: the three books a month the checks flagged.',
    youDo: 'Handle escalations, own the client relationship, and notice when the aggregate looks wrong.',
    youStop: 'Seeing the normal case at all. You have no felt sense of what a typical book contains this quarter, so you cannot tell when typical has drifted.',
    caption: 'You see the ones it could not do. You do not see the rest.',
  },
}

/** Teaching happens at five rungs; the Handover still answers at three, so
    every derived metric keyed on agent/both/human survives as a relabel.
    The five-to-three collapse is DRAWN on the chip, never left to be inferred. */
export const RUNG_TO_LANE: Record<RungId, 'human' | 'both' | 'agent'> = {
  own: 'human',
  assisted: 'human',
  briefed: 'both',
  standing: 'agent',
  service: 'agent',
}

/** The explainer card in the survey: one line per rung, phone-length. `eg` puts
    the rung in the words people already use for AI tools (a chat window, a
    co-worker agent, an agent you built, agents the platform runs), so the
    ladder is concrete without naming a product. `catches` is who finds the
    planted page-nine error, which is what keeps the five rows neutral: it gets
    caught at every rung, by someone different. */
export const SHORT: Record<RungId, { label: string; eg: string; you: string; catches: string }> = {
  own:      { label: 'I do it', eg: 'No AI.',                                   you: 'You build all twelve pages. It costs the evening.', catches: 'You catch it, or no one does.' },
  assisted: { label: 'It helps while I work', eg: 'A chat window open beside you.',           you: 'You hold the pen. Some framings were its.',         catches: 'You may catch it as you go.' },
  briefed:  { label: 'I brief it, then check', eg: 'A co-worker agent drafts the whole pack.', you: 'You write the brief, then read all twelve.',        catches: 'You catch it on your read.' },
  standing: { label: 'I set it up once', eg: 'An agent you built runs every Monday.',    you: 'You wrote the standard. You read samples.',         catches: 'Your spot-check may miss it.' },
  service:  { label: 'It\'s a service', eg: 'Agents the platform runs for everyone.',   you: 'You own the client and the flagged exceptions.',   catches: "The platform's check flags it to you." },
}
