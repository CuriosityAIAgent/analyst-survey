/* Dev only: a complete, plausible set of answers, used by the ?screen= jump
   so any screen or sheet can be screenshotted with the answers it depends on
   (S11 needs a kit, F2a needs a stop, S09 Beat B a lead trait ...). */
import type { AnswerMap, BeatId, ScreenId, SheetId, Variant } from './types'
import { SCREEN_IDS, step, storeKey, storesOf } from './content'
import { followupFor } from './rules'

export function demoAnswers(): AnswerMap {
  return {
    't.start': Date.now() - 120000,
    consent: true,
    'variant.seed': 1,
    'segment.business': 'uspb',
    'segment.cohort': '2024',
    'segment.source': 'token',
    'vote.green': ['classroom', 'meetings', 'debrief'],
    'vote.greenOrder': ['meetings', 'classroom', 'debrief'],
    'vote.blue': 'present',
    'vote.blueAlsoGreen': false,
    'vote.red': ['admin', 'formatting'],
    'vote.amber': ['ops', 'morning'],
    'rule.text': 'sat across the table from a client who said no',
    'rule.skipped': false,
    'rule.keystrokes': 48,
    'pace.months': 18,
    'pace.reversals': 1,
    'self.readyAt': 24,
    'kit.lane': { map: 'day1', compass: 'day1', guidebook: 'day1', gps: 'proven', radio: 'proven', brief: 'day1' },
    'kit.cut': { day1: 3, proven: 5 },
    'kit.unsupported': ['brief'],
    'kit.peeks': ['brief'],
    'kit.events': [],
    'pitch.zone': { p_portfolio: 'own', p_outreach: 'withkit', p_brief: 'own', p_onboard: 'crew', p_crm: 'kitdrafts' },
    'pitch.firstOwn': 'p_portfolio',
    calls: {
      certify: { answer: 'policy', ms: 1800, order: 0 },
      aiclient: { answer: 'unsure', ms: 2400, order: 1 },
      agents: { answer: 'policy', ms: 2100, order: 2 },
      freedtime: { answer: 'drop', ms: 1900, order: 3 },
    },
    'self.ropeCounterfactual': 3,
    'rope.reversals': 0,
    'traits.top3': ['reading', 'judgement', 'calm'],
    'traits.leadOrigin': 'built',
    'traits.originSides': 'bornLeft',
    mark: 3,
    'oneChange.text': 'Pair every Analyst with a second Advisor for a quarter',
    'oneChange.skipped': false,
    'oneChange.keystrokes': 58,
    'classroom.mandatory': 'clientFirst',
    'pace.readyFor': 'pitch',
    'pace.cantRush': 'trust',
    'kit.agentsFirst': 'spotWrong',
    'kit.agentsEarn': 'signoff',
    'kit.agentsWhyNot': 'stopLearning',
    'certify.how': 'observed',
    guarantee: 'debrief',
    'guarantee.variant': 'A',
  }
}

/** Answers for every screen before `screen` (and its sheets), plus `screen`
    itself when a sheet over it is requested, adjusted so the rules open
    exactly that sheet. For Beat B, the screen's own Beat A answers too (S09
    Beat B needs the lead trait, S10 Beat B the cairn). The target beat is
    otherwise left empty. */
export function fillBefore(screen: ScreenId, sheet?: SheetId | null, variant?: Variant, beat?: BeatId): AnswerMap {
  const all = demoAnswers() as Record<string, unknown>
  // make the rules pick the requested sheet
  if (sheet === 'F2a') all['pace.months'] = 18
  if (sheet === 'F2b') all['pace.months'] = 36
  if (sheet === 'F3a' || sheet === 'F3b' || sheet === 'F3c') {
    all['kit.lane'] = { ...(all['kit.lane'] as object), brief: sheet === 'F3a' ? 'day1' : sheet === 'F3b' ? 'proven' : 'none' }
  }
  if (sheet === 'F5') all['self.ropeCounterfactual'] = variant === 'B' ? 5 : 3
  const upto = SCREEN_IDS.indexOf(screen) + (sheet ? 1 : 0)
  const out: Record<string, unknown> = {}
  for (const sc of SCREEN_IDS.slice(0, upto)) {
    const keys = [...storesOf(sc)]
    const fu = followupFor(sc, all as AnswerMap)
    if (fu && sc !== screen) keys.push(...storesOf(fu.sheet))
    for (const k of keys) if (k in all) out[k] = all[k]
  }
  if (!sheet && beat === 'B') {
    for (const k of step(screen).beats?.find((b) => b.beat === 'A')?.stores.map(storeKey) ?? []) if (k in all) out[k] = all[k]
  }
  if (sheet === 'F5') out['guarantee.variant'] = variant === 'B' ? 'B' : 'A'
  return out as AnswerMap
}
