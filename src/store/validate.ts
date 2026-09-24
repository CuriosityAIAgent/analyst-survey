import { Answers, Lane } from './useStore'
import { ACTIVITIES, ADVISOR_CHANGES, BRICKS, DESTINATIONS, FUEL, TRAITS, TRIALS } from '@/content/content'

/* Persisted state is attacker-controllable: it lives in localStorage and a
   malformed value crashes the app on load. Validate the whole shape on
   hydration and drop anything that does not belong. */

const ids = (a: readonly { id: string }[]) => new Set(a.map((x) => x.id))
const FUEL_IDS = ids(FUEL), ACT_IDS = ids(ACTIVITIES), DEST_IDS = ids(DESTINATIONS)
const TRAIT_IDS = ids(TRAITS), CHANGE_IDS = ids(ADVISOR_CHANGES), BRICK_IDS = ids(BRICKS)
const TRIAL_IDS = ids(TRIALS)
const LANES: Lane[] = ['agent', 'both', 'human']

const strArr = (v: unknown, allowed?: Set<string>, max = 64): string[] =>
  Array.isArray(v)
    ? v.filter((x): x is string => typeof x === 'string' && (!allowed || allowed.has(x))).slice(0, max)
    : []

const int = (v: unknown, lo: number, hi: number, dflt: number): number =>
  typeof v === 'number' && Number.isFinite(v) ? Math.min(hi, Math.max(lo, Math.round(v))) : dflt

const str = (v: unknown, max: number): string | undefined =>
  typeof v === 'string' ? v.slice(0, max) : undefined

const obj = (v: unknown): Record<string, unknown> =>
  v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {}

export function emptyAnswers(): Answers {
  return {
    segment: { canAlone: [], notTrusted: [] },
    fuel: [],
    advisor: { top3: [], dependence: 50, changeTop2: [] },
    handover: { lanes: {}, notDone: [], clips: [] },
    capacity: { spend: {}, after: {} },
    trials: {},
    route: { years: [[], [], []] },
    mark: {},
    summit: {},
  }
}

export function validateAnswers(raw: unknown): Answers {
  const a = obj(raw)
  const out = emptyAnswers()

  const seg = obj(a.segment)
  out.segment = {
    business: str(seg.business, 40),
    months: str(seg.months, 40),
    aiUse: str(seg.aiUse, 40),
    canAlone: strArr(seg.canAlone, undefined, 20),
    notTrusted: strArr(seg.notTrusted, undefined, 20),
  }

  out.fuel = Array.isArray(a.fuel)
    ? a.fuel.slice(0, 32).flatMap((r) => {
        const x = obj(r)
        const shown = strArr(x.shown, FUEL_IDS, 8)
        const best = str(x.best, 40), worst = str(x.worst, 40)
        if (shown.length < 2) return []
        if (best && !FUEL_IDS.has(best)) return []
        if (worst && !FUEL_IDS.has(worst)) return []
        return [{ round: int(x.round, 0, 31, 0), shown, best, worst, ms: int(x.ms, 0, 36e5, 0) }]
      })
    : []

  const adv = obj(a.advisor)
  out.advisor = {
    top3: strArr(adv.top3, TRAIT_IDS, 3),
    dependence: int(adv.dependence, 0, 100, 50),
    changeTop2: strArr(adv.changeTop2, CHANGE_IDS, 2),
  }

  const h = obj(a.handover)
  const lanes: Record<string, Lane> = {}
  for (const [k, v] of Object.entries(obj(h.lanes))) {
    if (ACT_IDS.has(k) && typeof v === 'string' && (LANES as string[]).includes(v)) lanes[k] = v as Lane
  }
  out.handover = {
    lanes,
    notDone: strArr(h.notDone, ACT_IDS, ACTIVITIES.length),
    clips: strArr(h.clips, ACT_IDS, 5),
    reckoning: str(h.reckoning, 200),
    reckoningText: str(h.reckoningText, 140),
  }

  const c = obj(a.capacity)
  const numMap = (v: unknown, allowed: Set<string>) => {
    const o: Record<string, number> = {}
    for (const [k, n] of Object.entries(obj(v))) {
      if (allowed.has(k) && typeof n === 'number' && Number.isFinite(n) && n > 0) {
        o[k] = Math.min(8, Math.round(n))
      }
    }
    return o
  }
  out.capacity = { spend: numMap(c.spend, DEST_IDS), after: numMap(c.after, DEST_IDS), coda: str(c.coda, 80) }

  const t = obj(a.trials)
  for (const [k, v] of Object.entries(t)) {
    if (!TRIAL_IDS.has(k)) continue
    const x = obj(v)
    if (x.answer !== 'yes' && x.answer !== 'no') continue
    out.trials[k] = { answer: x.answer, followUp: strArr(x.followUp, undefined, 12) }
  }

  const r = obj(a.route)
  const years = Array.isArray(r.years) ? r.years : []
  out.route = {
    years: [0, 1, 2].map((i) => strArr(years[i], BRICK_IDS, 12)),
    custom: str(r.custom, 60),
  }

  const m = obj(a.mark)
  out.mark = {
    score: typeof m.score === 'number' && Number.isFinite(m.score) ? int(m.score, 1, 10, 5) : undefined,
    missing: str(m.missing, 2000),
  }
  out.summit = { message: str(obj(a.summit).message, 140) }
  return out
}

/** ?level=N from a public URL must never persist a non-integer or out-of-range index. */
export function safeLevel(raw: string | null, count: number): number | null {
  if (raw === null) return null
  const n = Number(raw)
  if (!Number.isFinite(n) || !Number.isInteger(n)) return null
  return Math.min(count - 1, Math.max(0, n))
}
