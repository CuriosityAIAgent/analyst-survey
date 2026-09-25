/* The Ascent (game): shared types.

   Content lives in ./spec.json (a copy of docs/reviews/ascent-game-spec.json).
   Ids here are the spec's ids, verbatim. Answers are keyed by the spec's
   "stores" names with their annotations stripped ('vote.green[3]' is stored as
   'vote.green', "calls{cardId: ...}" as 'calls'). */

/* ---------------------------------------------------------------- spec shape */

export type ItemSpec = {
  id: string
  label: string
  art?: string | null
  [k: string]: unknown // area, pairs, sub, peek, rung, ladder, value, note, group, position ...
}
export type ZoneSpec = {
  id: string
  label: string
  art?: string | null
  slots?: number
  [k: string]: unknown // vote, ladder, deck, value, key, note ...
}
export type BeatSpec = {
  beat: BeatId
  mechanic: string
  prompt: string
  helper: string
  capacity?: string
  self?: boolean
  items?: ItemSpec[]
  zones?: ZoneSpec[]
  stores: string[]
}
export type StepSpec = {
  id: StepId
  kind: 'screen' | 'followup'
  parent?: ScreenId
  title: string
  camp: CampName
  mechanic: string
  self?: boolean
  walk?: boolean
  trigger?: string
  prompt: string
  promptVariants?: { A: string; B: string }
  helper: string
  items: ItemSpec[]
  zones: ZoneSpec[]
  beats?: BeatSpec[]
  capacity: string
  adaptive: { when: string; goto: string; note?: string; variant?: string }[]
  next: string
  measures?: string[]
  stores: string[]
  seconds: number
  layout?: string
  notes?: string[]
}
export type ArtSpec = { id: string; group: string; brief: string; status: string; release: string }
export type RuleTest = { rule: RulePoint; given: Record<string, unknown>; expect: string | null }
export type Spec = {
  title: string
  version: string
  frame: { viewport: string; stage: string; logging: string; camps: CampName[] }
  screens: StepSpec[]
  ruleTests: RuleTest[]
  timing: Record<string, unknown>
  artBudget: Record<string, number>
  art: ArtSpec[]
}

/* ---------------------------------------------------------------- ids */

export type ScreenId = 'S01' | 'S02' | 'S03' | 'S04' | 'S05' | 'S06' | 'S07' | 'S08' | 'S09' | 'S10' | 'S11'
export type SheetId = 'F1' | 'F2a' | 'F2b' | 'F3a' | 'F3b' | 'F3c' | 'F4' | 'F5'
export type StepId = ScreenId | SheetId
export type BeatId = 'A' | 'B'
export type CampName = 'Base camp' | 'Camp I' | 'Camp II' | 'Camp III' | 'Summit'
export type RulePoint = 'F1' | 'F2' | 'F3' | 'F4' | 'F5'
export type Variant = 'A' | 'B'

export type GearId =
  | 'meetings' | 'present' | 'portfolio' | 'outreach' | 'prep' | 'ops'
  | 'debrief' | 'morning' | 'classroom' | 'roleplay' | 'admin' | 'formatting'
export type BrickId = 'map' | 'compass' | 'guidebook' | 'gps' | 'radio' | 'brief'
export type Lane = 'day1' | 'proven' | 'none'
export type PitchId = 'p_portfolio' | 'p_outreach' | 'p_brief' | 'p_onboard' | 'p_crm'
export type PitchZone = 'own' | 'withkit' | 'kitdrafts' | 'crew'
export type CardId = 'certify' | 'aiclient' | 'agents' | 'freedtime'
export type CallAnswer = 'policy' | 'drop' | 'unsure'
export type TraitId = 'reading' | 'hunter' | 'calm' | 'depth' | 'story' | 'bounce' | 'judgement' | 'curiosity'
export type Months = 12 | 18 | 24 | 30 | 36 | 48
export type Pace = Months | 'proven'
export type ReadyAt = Months | 'notYet' | null
export type Rope = 1 | 2 | 3 | 4 | 5
export type Mark = 1 | 2 | 3 | 4 | 5

export type Call = { answer: CallAnswer; ms: number; order: number }
export type KitEvent = { t: number; brick: BrickId; to: Lane | null; via: 'pointer' | 'tap' | 'key' }

/* ---------------------------------------------------------------- answers

   One entry per spec store name. `undefined` (absent) means unanswered;
   `null` is a real answer where the spec allows it ('Rather not say').
   Keys marked (extra) are not in the spec's store lists but are needed to
   log a randomised order the design says must be logged. */
export interface Answers {
  // S01
  't.start': number
  consent: boolean
  'variant.seed': number
  'segment.business': 'uspb' | 'ipb' | 'solutions' | 'other' | null
  'segment.cohort': string | null // '2022'..'2025' (the last four classes)
  'segment.source': 'token' | 'asked'
  // S02: arrays hold gear ids in slot order
  'vote.green': GearId[]
  'vote.greenOrder': GearId[] // the order they went into the rucksack
  'vote.blue': GearId | null
  'vote.blueAlsoGreen': boolean
  'vote.red': GearId[]
  'vote.amber': GearId[]
  'tray.order': GearId[]
  // S03
  'rule.text': string
  'rule.skipped': boolean
  'rule.keystrokes': number
  // S04
  'pace.months': Pace
  'pace.reversals': number
  'self.readyAt': ReadyAt
  // S05
  'kit.lane': Partial<Record<BrickId, Lane>>
  'kit.cut': { day1: number; proven: number }
  'kit.unsupported': BrickId[]
  'kit.peeks': BrickId[]
  'kit.events': KitEvent[]
  'kit.order': BrickId[] // (extra) tray order
  // S06
  'pitch.zone': Partial<Record<PitchId, PitchZone>>
  'pitch.order': PitchId[]
  'pitch.firstOwn': PitchId | null
  // S07
  calls: Partial<Record<CardId, Call>>
  'calls.order': CardId[] // (extra) card order
  // S08
  'self.ropeCounterfactual': Rope | null
  'rope.reversals': number
  // S09
  'traits.top3': TraitId[]
  'traits.order': TraitId[]
  'traits.leadOrigin': 'born' | 'built'
  'traits.originSides': 'bornLeft' | 'bornRight'
  // S10
  mark: Mark
  'oneChange.text': string
  'oneChange.skipped': boolean
  'oneChange.keystrokes': number
  // S11
  'summit.dragMs': number
  't.complete': number
  // follow-ups
  'classroom.mandatory': 'mandatory' | 'clientFirst' | 'optional'
  'pace.readyFor': 'reviewAlone' | 'pitch' | 'cold' | 'smallBook' | 'commitment'
  'pace.cantRush': 'cycle' | 'trust' | 'breadth' | 'confidence'
  'kit.agentsFirst': 'byHand' | 'spotWrong' | 'sharpBrief' | 'learnByDoing'
  'kit.agentsEarn': 'cert' | 'signoff' | 'time' | 'record'
  'kit.agentsWhyNot': 'stopLearning' | 'trustOutput' | 'clients' | 'notYet'
  'certify.how': 'avatar' | 'written' | 'practical' | 'observed' | 'clientFeedback'
  guarantee: 'mentor' | 'debrief' | 'hypothesis' | 'speakingRole' | 'ecm' | 'protectedTime'
  'guarantee.variant': Variant
}
export type AnswerKey = keyof Answers
export type AnswerMap = Partial<Answers>

/** The typed setter every screen gets. */
export type SetAnswer = <K extends AnswerKey>(key: K, value: Answers[K]) => void

/* ---------------------------------------------------------------- events */

export type GameEvent = {
  t: number // ms since the store was created or began
  step: string // 'S02', 'S04#B', 'F3a'
  type: string // 'drop', 'lift', 'peek', 'swipe', 'enter', 'leave' ...
  [k: string]: unknown
}
export type LogFn = (type: string, data?: Record<string, unknown>) => void

/* ---------------------------------------------------------------- screen props

   ONE interface for every screen (src/game/screens/Sxx.tsx) and every
   follow-up sheet (src/game/sheets/Fx.tsx). See the header of Game.tsx. */
export interface StepProps {
  /** 'S02' or 'F3a'. */
  id: StepId
  /** Current beat. 'A' for single-beat screens and for sheets. */
  beat: BeatId
  /** F5 only: which wording to show. Undefined elsewhere. */
  variant?: Variant
  /** Every answer so far, validated on rehydrate. Absent = unanswered. */
  answers: AnswerMap
  /** Store one answer (typed by key). Never navigates. */
  set: SetAnswer
  /** Store several answers at once. */
  setMany: (patch: AnswerMap) => void
  /** Remove an answer (e.g. the last cairn stone lifted off). */
  unset: (key: AnswerKey) => void
  /** Append to the typed event log; step and time are added for you. */
  log: LogFn
  /** This beat or sheet is complete: advance. The orchestrator decides what
      comes next (next beat, a follow-up sheet via rules.ts, the next screen,
      a camp transition). Bound to this step, so a stale timer or a double tap
      after the step has changed is ignored. */
  next: () => void
  /** Same as the top bar's Back. Never loses answers. */
  back: () => void
  /** prefers-reduced-motion: crossfade only, no walking, jumps not tweens. */
  reduced: boolean
  /** The per-respondent seed (use useOrder / seeded from store.ts for orders). */
  seed: number
  /** True when this screen is rendered under an open follow-up sheet (inert). */
  covered: boolean
}
