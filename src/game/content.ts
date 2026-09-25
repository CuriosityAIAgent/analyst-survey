/* Typed access to ./spec.json. Everything a screen needs to read its copy,
   items and zones comes from here, so no string is retyped in a component. */
import specJson from './spec.json'
import type {
  AnswerKey, AnswerMap, Answers, AskSpec, BeatId, BeatSpec, CampName, ItemSpec, ScreenId, SheetId, Spec,
  StepId, StepSpec, ZoneSpec,
} from './types'

export const SPEC = specJson as unknown as Spec

export const SCREEN_IDS: ScreenId[] = ['S01', 'S02', 'S03', 'S04', 'S05', 'S06', 'S07', 'S08', 'S09', 'S10', 'S11']
export const SHEET_IDS: SheetId[] = ['F1', 'F2a', 'F2b', 'F3a', 'F3b', 'F3c', 'F4', 'F5']
export const CAMPS: CampName[] = SPEC.frame.camps

const BY_ID = new Map<string, StepSpec>(SPEC.screens.map((s) => [s.id, s]))

export const isScreenId = (x: unknown): x is ScreenId => typeof x === 'string' && (SCREEN_IDS as string[]).includes(x)
export const isSheetId = (x: unknown): x is SheetId => typeof x === 'string' && (SHEET_IDS as string[]).includes(x)
export const isBeatId = (x: unknown): x is BeatId => x === 'A' || x === 'B'

/** The spec entry for a screen or sheet. */
export function step(id: StepId): StepSpec {
  const s = BY_ID.get(id)
  if (!s) throw new Error(`unknown step ${id}`)
  return s
}

/** The beat entry, or undefined for single-beat screens. */
export function beatSpec(id: StepId, beat: BeatId): BeatSpec | undefined {
  return step(id).beats?.find((b) => b.beat === beat)
}

/** Every beat the spec defines for a screen ('A' only when it has none).
    Which beats are SHOWN can depend on answers: see beatsFor in store.ts. */
export function specBeats(id: StepId): BeatId[] {
  const b = step(id).beats
  return b && b.length ? b.map((x) => x.beat) : ['A']
}

/** Prompt and helper for a screen/beat, or a sheet (with its F5 variant). */
export function copy(id: StepId, beat: BeatId = 'A', variant?: 'A' | 'B'): { prompt: string; helper: string } {
  const s = step(id)
  const b = beatSpec(id, beat)
  if (b) return { prompt: b.prompt, helper: b.helper }
  if (variant && s.promptVariants) return { prompt: s.promptVariants[variant], helper: s.helper }
  return { prompt: s.prompt, helper: s.helper }
}

/* ---------------------------------------------------------------- the plain ask

   Design section 4: one plain-English copy source for both channels. */

/** frame.plainAsk: the phone shows ask.question and ask.how as well. */
export const PLAIN_ASK: boolean = SPEC.frame.plainAsk === true

/** The filled ask block: question and how. `question` is always set: F5 (no
    ask.question) gets its A/B wording verbatim, and a step without an ask
    block falls back to its prompt and helper. {stop} and {leadTrait} are
    filled like the prompt (pass askVars(answers)). */
export type Ask = Required<Pick<AskSpec, 'kicker' | 'question' | 'how'>> &
  Pick<AskSpec, 'keys' | 'why' | 'list' | 'kickerAlone'> & {
    /** The camp name ('Base camp'), or '' for kickerAlone. */
    camp: string
    /** The spec prompt, filled: the world line (the stage caption on desk). */
    caption: string
    /** An about-you (self) question: the bronze ABOUT YOU pill. */
    self: boolean
    followup: boolean
  }

export function ask(id: StepId, beat: BeatId = 'A', variant?: 'A' | 'B', vars: { stop?: unknown; leadTrait?: string } = {}): Ask {
  const s = step(id)
  const b = beatSpec(id, beat)
  const c = copy(id, beat, variant)
  const a: AskSpec | undefined = b?.ask ?? s.ask
  const question = id === 'F5' || !a?.question ? c.prompt : a.question
  return {
    kicker: a?.kicker ?? s.title,
    kickerAlone: a?.kickerAlone,
    question: fill(question, vars),
    how: fill(a?.how ?? c.helper, vars),
    keys: a?.keys,
    why: a?.why,
    list: a?.list,
    camp: a?.kickerAlone ? '' : s.camp,
    caption: fill(c.prompt, vars),
    self: !!(b?.self ?? s.self),
    followup: s.kind === 'followup',
  }
}

/** The {stop} and {leadTrait} a question may name, from the answers so far. */
export function askVars(a: AnswerMap): { stop?: unknown; leadTrait?: string } {
  const lead = a['traits.top3']?.[0]
  return {
    stop: a['pace.months'],
    leadTrait: lead ? label('S09', lead) : 'The lead trait',
  }
}

/** A plain label (spec `plain`) for an item or zone, or undefined. */
export function plainOf(id: StepId, itemId: string): string | undefined {
  const s = step(id)
  const all = [...s.items, ...s.zones, ...(s.beats ?? []).flatMap((b) => [...(b.items ?? []), ...(b.zones ?? [])])]
  const p = all.find((x) => x.id === itemId)?.plain
  return typeof p === 'string' ? p : undefined
}

/** Items for a screen (or a beat's own items where the beat defines them). */
export function items(id: StepId, beat?: BeatId): ItemSpec[] {
  const b = beat ? beatSpec(id, beat) : undefined
  return (b?.items ?? step(id).items) as ItemSpec[]
}
export function zones(id: StepId, beat?: BeatId): ZoneSpec[] {
  const b = beat ? beatSpec(id, beat) : undefined
  return (b?.zones ?? step(id).zones) as ZoneSpec[]
}
export function label(id: StepId, itemId: string): string {
  const s = step(id)
  const all = [...s.items, ...s.zones, ...(s.beats ?? []).flatMap((b) => [...(b.items ?? []), ...(b.zones ?? [])])]
  return all.find((x) => x.id === itemId)?.label ?? itemId
}

/* ---------------------------------------------------------------- camps */

export const campIndex = (id: StepId): number => Math.max(0, CAMPS.indexOf(step(id).camp))

export const SCENE_FOR_CAMP: Record<CampName, string> = {
  'Base camp': 'scene-basecamp',
  'Camp I': 'scene-camp1',
  'Camp II': 'scene-camp2',
  'Camp III': 'scene-camp3',
  Summit: 'scene-summit',
}
export const sceneFor = (id: StepId) => SCENE_FOR_CAMP[step(id).camp]

/** Paper warms toward --color-dawn camp by camp (0 = paper, 1 = dawn). */
export const WARMTH = [0, 0.14, 0.28, 0.42, 0.85]
export const PAPER = '#F8F7F4'
export const DAWN = '#E9D5BB'
export function paperFor(camp: number): string {
  const u = WARMTH[Math.max(0, Math.min(WARMTH.length - 1, camp))]
  const a = [0xf8, 0xf7, 0xf4], b = [0xe9, 0xd5, 0xbb]
  const c = a.map((v, i) => Math.round(v + (b[i] - v) * u))
  return `rgb(${c[0]},${c[1]},${c[2]})`
}

/* ---------------------------------------------------------------- stores */

/** 'vote.green[3]' -> 'vote.green'; "calls{cardId: ...}" -> 'calls'. */
export const storeKey = (s: string) => s.split(/[:[{ ]/)[0]

/** Every spec store name, normalised. */
export const SPEC_STORE_KEYS: string[] = [
  ...new Set(SPEC.screens.flatMap((s) => [...s.stores, ...(s.beats ?? []).flatMap((b) => b.stores)]).map(storeKey)),
]

/** Store keys each step writes (normalised), from the spec. */
export function storesOf(id: StepId): string[] {
  const s = step(id)
  return [...new Set([...s.stores, ...(s.beats ?? []).flatMap((b) => b.stores)].map(storeKey))]
}

/* ---------------------------------------------------------------- validators

   Used on rehydrate: a value that fails its check is dropped, so a screen can
   trust the TYPE of anything it reads from `answers`. */
const ids = (id: StepId, beat?: BeatId) => new Set(items(id, beat).map((x) => x.id))
const zids = (id: StepId) => new Set(zones(id).map((x) => x.id))
const GEAR = ids('S02')
const BRICK = ids('S05')
const PITCH = ids('S06')
const CARD = ids('S07')
const TRAIT = ids('S09')
const LANES = zids('S05')
const PZONES = zids('S06')
const CALLV = new Set<unknown>(zones('S07').map((z) => String(z.value)))
const MONTHS = new Set([12, 18, 24, 30, 36, 48])

const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v)
const isStr = (v: unknown): v is string => typeof v === 'string'
const isBool = (v: unknown): v is boolean => typeof v === 'boolean'
const oneOf = (set: Set<unknown>) => (v: unknown) => set.has(v)
const listOf = (set: Set<unknown>, max = 99) => (v: unknown) =>
  Array.isArray(v) && v.length <= max && v.every((x) => set.has(x)) && new Set(v).size === v.length
const recordOf = (keys: Set<unknown>, vals: Set<unknown>) => (v: unknown) =>
  !!v && typeof v === 'object' && !Array.isArray(v) &&
  Object.entries(v as object).every(([k, x]) => keys.has(k) && vals.has(x))
const obj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v)
/* The answer options of a sheet: its items, except F2a, whose options are the
   ledges (zones) the rookie is dragged onto. */
const sheetIds = (id: SheetId) => new Set((id === 'F2a' ? zones(id) : items(id)).map((x) => x.id))

export const VALID: { [K in AnswerKey]: (v: unknown) => boolean } = {
  't.start': isNum,
  consent: isBool,
  'variant.seed': isNum,
  'segment.business': (v) => v === null || oneOf(new Set(['uspb', 'ipb', 'solutions']))(v),
  'segment.cohort': (v) => v === null || (isStr(v) && /^202[2-5]$/.test(v)),
  'segment.source': oneOf(new Set(['token', 'asked'])),
  'vote.green': listOf(GEAR, 3),
  'vote.greenOrder': listOf(GEAR, 3),
  'vote.blue': (v) => v === null || GEAR.has(v as string),
  'vote.blueAlsoGreen': isBool,
  'vote.red': listOf(GEAR, 2),
  'vote.amber': listOf(GEAR, 2),
  'tray.order': (v) => listOf(GEAR)(v) && (v as unknown[]).length === GEAR.size,
  'rule.text': (v) => isStr(v) && v.length <= 200,
  'rule.skipped': isBool,
  'rule.keystrokes': isNum,
  'pace.months': (v) => v === 'proven' || MONTHS.has(v as number),
  'pace.reversals': isNum,
  'self.readyAt': (v) => v === null || v === 'notYet' || MONTHS.has(v as number),
  'kit.lane': recordOf(BRICK, LANES),
  'kit.cut': (v) => obj(v) && isNum(v.day1) && isNum(v.proven),
  'kit.unsupported': listOf(BRICK),
  'kit.peeks': (v) => Array.isArray(v) && v.every((x) => BRICK.has(x)),
  'kit.events': (v) => Array.isArray(v) && v.length <= 500 && v.every(obj),
  'kit.order': (v) => listOf(BRICK)(v) && (v as unknown[]).length === BRICK.size,
  'pitch.zone': recordOf(PITCH, PZONES),
  'pitch.order': (v) => listOf(PITCH)(v) && (v as unknown[]).length === PITCH.size,
  'pitch.firstOwn': (v) => v === null || PITCH.has(v as string),
  calls: (v) => obj(v) && Object.entries(v).every(([k, c]) =>
    CARD.has(k) && obj(c) && CALLV.has(c.answer) && isNum(c.ms) && isNum(c.order)),
  'calls.order': (v) => listOf(CARD)(v) && (v as unknown[]).length === CARD.size,
  'self.ropeCounterfactual': (v) => v === null || [1, 2, 3, 4, 5].includes(v as number),
  'rope.reversals': isNum,
  'traits.top3': listOf(TRAIT, 3),
  'traits.order': (v) => listOf(TRAIT)(v) && (v as unknown[]).length === TRAIT.size,
  'traits.leadOrigin': oneOf(new Set(['born', 'built'])),
  'traits.originSides': oneOf(new Set(['bornLeft', 'bornRight'])),
  mark: (v) => [1, 2, 3, 4, 5].includes(v as number),
  'oneChange.text': (v) => isStr(v) && v.length <= 200,
  'oneChange.skipped': isBool,
  'oneChange.keystrokes': isNum,
  'summit.dragMs': isNum,
  't.complete': isNum,
  'classroom.mandatory': oneOf(sheetIds('F1')),
  'pace.readyFor': oneOf(sheetIds('F2a')),
  'pace.cantRush': oneOf(sheetIds('F2b')),
  'kit.agentsFirst': oneOf(sheetIds('F3a')),
  'kit.agentsEarn': oneOf(sheetIds('F3b')),
  'kit.agentsWhyNot': oneOf(sheetIds('F3c')),
  'certify.how': oneOf(sheetIds('F4')),
  guarantee: oneOf(sheetIds('F5')),
  'guarantee.variant': oneOf(new Set(['A', 'B'])),
}

export const ANSWER_KEYS = Object.keys(VALID) as AnswerKey[]

/** Keep only known keys whose values pass their check. */
export function cleanAnswers(raw: unknown): Partial<Answers> {
  const out: Record<string, unknown> = {}
  if (!obj(raw)) return out
  for (const k of ANSWER_KEYS) {
    if (!(k in raw)) continue
    const v = raw[k]
    try {
      if (VALID[k](v)) out[k] = v
    } catch { /* drop it */ }
  }
  return out as Partial<Answers>
}

/** v1 art ids from the spec (all 69 are v1 this week). */
export const ART_V1: string[] = SPEC.art.filter((a) => a.release.startsWith('v1')).map((a) => a.id)

/* ---------------------------------------------------------------- the route ahead */

/** How sharp the route ahead is drawn, from the Day-one kit (design "Two
    lines": it sharpens with every Day-one brick): 0 none, 1 pencil, 2 dotted,
    3 dotted with waypoints, 4 weather glyphs and timings. A map alone gives a
    pencil line, the full kit gives the timed line. S05's route strip and the
    S11 summit route both use this one scale. */
export function routePrecision(lanes: Partial<Record<string, string>> | undefined): 0 | 1 | 2 | 3 | 4 {
  const n = items('S05').filter((b) => lanes?.[b.id] === 'day1').length
  return Math.min(4, Math.ceil((n * 4) / 6)) as 0 | 1 | 2 | 3 | 4
}

/* ---------------------------------------------------------------- copy helpers */

/** '18 months', or 'when proven'. */
export function stopText(pace: unknown): string {
  if (pace === 'proven') return 'when proven'
  return typeof pace === 'number' ? `${pace} months` : '…'
}

/** Fill a prompt's {stop} / {leadTrait}. "Ready at {stop}" with 'When proven'
    reads "Ready when proven". */
export function fill(prompt: string, vars: { stop?: unknown; leadTrait?: string }): string {
  let out = prompt
  if ('stop' in vars) {
    out = vars.stop === 'proven'
      ? out.replace(/\b(at|to) \{stop\}/, 'when proven').replace('{stop}', 'when proven')
      : out.replace('{stop}', stopText(vars.stop))
  }
  if (vars.leadTrait !== undefined) out = out.replace('{leadTrait}', vars.leadTrait)
  return out
}
