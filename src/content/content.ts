/* All content lives here, never in components. Ids are stable strings. */

export const FUEL = [
  { id: 'shadow', label: "Sitting in my Advisor's client meetings" },
  { id: 'desk', label: 'Watching how the desk actually works' },
  { id: 'plumbing', label: 'Time inside the plumbing — onboarding, trades, service' },
  { id: 'classroom', label: 'Classroom training' },
  { id: 'deliverable', label: 'Being handed a deliverable to own end to end' },
  { id: 'mentor', label: 'My Advisor as a mentor' },
  { id: 'cohort', label: 'My cohort' },
  { id: 'aicritique', label: 'Critiquing and correcting an AI draft' },
  { id: 'unassisted', label: 'Being made to produce something unassisted, on purpose' },
] as const

/* Nine sets of three. Balanced: three appearances each, 27 of 36 pairs.
   A shadow B desk C plumbing D classroom E deliverable F mentor G cohort H aicritique I unassisted */
export const MAXDIFF_SETS = [
  ['shadow', 'desk', 'plumbing'],
  ['classroom', 'deliverable', 'mentor'],
  ['cohort', 'aicritique', 'unassisted'],
  ['shadow', 'classroom', 'cohort'],
  ['desk', 'deliverable', 'aicritique'],
  ['plumbing', 'mentor', 'unassisted'],
  ['shadow', 'deliverable', 'unassisted'],
  ['desk', 'mentor', 'cohort'],
  ['plumbing', 'classroom', 'aicritique'],
] as const

export const ACTIVITIES = [
  { id: 'proposal', label: 'Building the investment proposal', gloss: 'the allocation, the Wealth Plan, the case for the change' },
  { id: 'pitchbook', label: 'The pitchbook and briefing book', gloss: 'for a prospect or client meeting' },
  { id: 'reviewpack', label: 'The portfolio review pack', gloss: 'performance, allocation, what changed and why' },
  { id: 'lending', label: 'Lending and credit', gloss: 'mortgage and securities-based requests, building the credit package' },
  { id: 'movemoney', label: 'Moving money', gloss: 'wires, transfers, payment approvals, chasing the exception' },
  { id: 'suitability', label: 'Getting it past review', gloss: 'suitability, supervisory and marketing checks before it reaches a client' },
  { id: 'research', label: 'Reading the research', gloss: 'and turning it into something the Advisor can actually say' },
  { id: 'clientmail', label: 'Drafting the client email', gloss: 'or the follow-up note the Advisor sends' },
  { id: 'coordinate', label: 'Coordinating the specialists', gloss: 'banker, investor, lender, trust and estate, tax — keeping one story' },
  { id: 'prospect', label: 'Building the prospect list', gloss: 'screening names, mapping who knows whom' },
  { id: 'onboard', label: 'Onboarding and KYC', gloss: 'account opening, chasing documents, remediation' },
  { id: 'cash', label: 'Cash and liquidity', gloss: 'margin, upcoming calls, idle balances' },
  { id: 'crm', label: 'Keeping the record straight', gloss: 'contact reports, follow-ups, who owes what by when' },
] as const

export const LANES = [
  { id: 'agent', label: 'An agent does it', sub: 'No human in the loop.' },
  { id: 'both', label: 'An agent drafts, I own it', sub: 'It comes to me half-built.' },
  { id: 'human', label: 'I do it', sub: 'The judgement is the job.' },
] as const

export const DESTINATIONS = [
  { id: 'clientroom', label: 'In the room with clients', gloss: 'Reviews, annual meetings, the call nobody wants to make' },
  { id: 'advisordesk', label: "Off the Advisor's desk", gloss: "Work they shouldn't be doing, so they're with clients" },
  { id: 'names', label: 'Working a list of names', gloss: 'Prospecting, cold outreach, filling the pipeline' },
  { id: 'book', label: 'A small book of my own', gloss: 'A handful of names, start to finish, mine' },
  { id: 'product', label: 'Product and platform, cold', gloss: 'Knowing the solutions well enough to be asked' },
  { id: 'learning', label: 'Learning with no deal attached', gloss: "The market cycle, the reading, the thing there's never time for" },
  { id: 'checkai', label: "Checking the AI's work", gloss: 'Before it reaches an Advisor, or a client' },
  { id: 'plumbing', label: 'Inside the plumbing', gloss: 'Onboarding, trades, service, the things that break' },
  { id: 'giveback', label: 'Give the hours back', gloss: 'We are over capacity. The day would just absorb.' },
] as const

export const TRAITS = [
  { id: 'eq', label: 'Reading people' }, { id: 'hunt', label: "A hunter's drive" },
  { id: 'tech', label: 'Markets and product depth' }, { id: 'story', label: 'Turning complexity into a client story' },
  { id: 'follow', label: 'Follow-through' }, { id: 'bounce', label: 'Bouncing back from a no' },
  { id: 'curious', label: 'Curiosity' }, { id: 'judge', label: 'Commercial judgement' },
  { id: 'network', label: 'Building a network' }, { id: 'calm', label: "Calm when it's on fire" },
] as const

export const ADVISOR_CHANGES = [
  { id: 'checkwork', label: 'Teach me to check work, not just produce it' },
  { id: 'why', label: 'Explain the why behind the call, not just the call' },
  { id: 'room', label: 'Get me in the room more, earlier' },
  { id: 'feedback', label: 'Give me feedback that stings a bit' },
  { id: 'ownit', label: 'Hand me something real and let me fail at it' },
  { id: 'aiuse', label: 'Show me how they use AI, and where they refuse to' },
  { id: 'standards', label: "Be explicit about what 'good' actually looks like" },
  { id: 'time', label: 'Just be available more often' },
  { id: 'network', label: 'Introduce me to people, not just tasks' },
] as const

export const TRIALS = [
  {
    id: 'certify',
    card: "Should an analyst be certified before they pitch a new client or run a portfolio review in J.P. Morgan's name?",
    aside: 'Pilots are. Surgeons are.',
    yes: { q: 'How would you certify?', multi: true, opts: ['A live role-play', 'A written test', 'Observed by an Advisor', 'A feedback threshold from Advisors'] },
    no: { q: 'What should gate it instead?', multi: false, opts: ['Time served', "My Advisor's call", 'Nothing', 'Trust the hire'] },
  },
  {
    id: 'classroom',
    card: 'Would you make classroom training mandatory?',
    aside: 'Be honest. Attendance says otherwise.',
    yes: { q: 'Even if it cost you a client meeting that day?', multi: false, opts: ['Yes, still mandatory', 'No, the client wins'] },
    no: { q: 'What would you replace it with?', multi: true, opts: ['Short modules on demand', 'Role-plays', 'More client meetings', 'A certification I sit when ready'] },
  },
] as const

export const BRICKS = [
  { id: 'mm', label: 'The morning meeting', units: 1 },
  { id: 'shadow', label: "Shadow the Advisor's client meetings", units: 2 },
  { id: 'own', label: 'Own a client deliverable', units: 2 },
  { id: 'book', label: 'Own a small book of names', units: 3 },
  { id: 'class', label: 'Classroom weeks', units: 2 },
  { id: 'product', label: 'Product and platform training', units: 2 },
  { id: 'ops', label: 'Operations rotation', units: 2 },
  { id: 'gpitch', label: 'Certification: client-ready', units: 1 },
  { id: 'agents', label: 'Run your own agents', units: 1 },
  { id: 'qa', label: 'Review and correct AI output', units: 1 },
  { id: 'custom', label: 'Your own brick', units: 1 },
] as const

export const YEAR_CAPACITY = 5

export const LEVELS = [
  { id: 'basecamp', title: 'Base camp' },
  { id: 'fuel', title: 'What taught you' },
  { id: 'advisor', title: "The Advisor's job" },
  { id: 'handover', title: 'The Handover' },
  { id: 'capacity', title: 'The day that comes back' },
  { id: 'trials', title: 'The trials' },
  { id: 'route', title: 'Build the route' },
  { id: 'mark', title: 'Mark to market' },
  { id: 'summit', title: 'High camp' },
] as const

export type LevelId = (typeof LEVELS)[number]['id']
/** The turn: from here on, the questions are about the next analyst. */
export const TURN_INDEX = 3
