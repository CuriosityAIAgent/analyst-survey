/* The adaptive map: one pure function per follow-up point (design, "Adaptive
   map"). Each returns the spec's rule-test vocabulary: a sheet id, 'F5/A' or
   'F5/B' for the F5 wording, or null for no sheet. rules.test.ts runs every
   case in spec.ruleTests against these. */
import type { AnswerMap, RulePoint, ScreenId, SheetId, Variant } from './types'
import { SPEC_STORE_KEYS } from './content'

/** F1, evaluated on S02 Continue after all eight placements. */
export function ruleF1(a: AnswerMap): 'F1' | null {
  const green = a['vote.green'] ?? []
  return green.includes('classroom') || a['vote.blue'] === 'classroom' ? 'F1' : null
}

/** F2, evaluated after S04 Beat B (the self-answer comes first). */
export function ruleF2(a: AnswerMap): 'F2a' | 'F2b' | null {
  const m = a['pace.months']
  if (m === undefined) return null
  if (m === 'proven' || m < 36) return 'F2a'
  return 'F2b'
}

/** F3, evaluated on S05 Continue ('Start walking'): the brief's lane. */
export function ruleF3(a: AnswerMap): 'F3a' | 'F3b' | 'F3c' | null {
  const lane = a['kit.lane']?.brief
  return lane === 'day1' ? 'F3a' : lane === 'proven' ? 'F3b' : lane === 'none' ? 'F3c' : null
}

/** F4, evaluated after all four storm calls. Only 'policy' fires it. */
export function ruleF4(a: AnswerMap): 'F4' | null {
  return a.calls?.certify?.answer === 'policy' ? 'F4' : null
}

/** F5, always after S08. A: 1-3 or 'Rather not say' (null); B: 4-5. */
export function ruleF5(a: AnswerMap): 'F5/A' | 'F5/B' {
  const r = a['self.ropeCounterfactual']
  return typeof r === 'number' && r >= 4 ? 'F5/B' : 'F5/A'
}

export const RULES: Record<RulePoint, (a: AnswerMap) => string | null> = {
  F1: ruleF1, F2: ruleF2, F3: ruleF3, F4: ruleF4, F5: ruleF5,
}

/** Which follow-up point closes which screen. */
export const FOLLOWUP_AFTER: Partial<Record<ScreenId, RulePoint>> = {
  S02: 'F1', S04: 'F2', S05: 'F3', S07: 'F4', S08: 'F5',
}

/** A rule result as a sheet to open. */
export function parseRule(r: string | null): { sheet: SheetId; variant?: Variant } | null {
  if (!r) return null
  const [sheet, variant] = r.split('/') as [SheetId, Variant | undefined]
  return variant ? { sheet, variant } : { sheet }
}

/** The sheet (if any) that rises when `screen` is complete. */
export function followupFor(screen: ScreenId, a: AnswerMap): { sheet: SheetId; variant?: Variant } | null {
  const point = FOLLOWUP_AFTER[screen]
  return point ? parseRule(RULES[point](a)) : null
}

/** S01 Beat B (business and class) shows only when the link token lacked them. */
export function needsSegment(a: AnswerMap): boolean {
  return a['segment.business'] == null || a['segment.cohort'] == null
}

/* ---------------------------------------------------------------- paths

   Rule tests (and any analysis code) name deep paths like
   'calls.certify.answer' or 'kit.lane.brief'. Answers are keyed by store name,
   so a path resolves through the longest store key that prefixes it. */
const KEYS_LONGEST_FIRST = [...SPEC_STORE_KEYS, 'kit.order', 'calls.order'].sort((x, y) => y.length - x.length)

export function splitPath(path: string): [string, string[]] {
  const k = KEYS_LONGEST_FIRST.find((key) => path === key || path.startsWith(key + '.'))
  if (!k) return [path, []]
  const rest = path.slice(k.length + 1)
  return [k, rest ? rest.split('.') : []]
}

export function getPath(a: AnswerMap, path: string): unknown {
  const [k, rest] = splitPath(path)
  let v: unknown = (a as Record<string, unknown>)[k]
  for (const p of rest) v = v && typeof v === 'object' ? (v as Record<string, unknown>)[p] : undefined
  return v
}

/** Build an answer map from deep paths ({'calls.certify.answer': 'policy'}). */
export function fromPaths(given: Record<string, unknown>): AnswerMap {
  const out: Record<string, unknown> = {}
  for (const [path, value] of Object.entries(given)) {
    const [k, rest] = splitPath(path)
    if (!rest.length) { out[k] = value; continue }
    const root = (out[k] ??= {}) as Record<string, unknown>
    let cur = root
    rest.slice(0, -1).forEach((p) => { cur = (cur[p] ??= {}) as Record<string, unknown> })
    cur[rest[rest.length - 1]] = value
  }
  return out as AnswerMap
}
