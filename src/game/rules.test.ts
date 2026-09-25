import { describe, expect, it } from 'vitest'
import { SPEC, cleanAnswers, SPEC_STORE_KEYS, ANSWER_KEYS } from './content'
import { RULES, fromPaths, getPath, followupFor, needsSegment } from './rules'

describe('spec.ruleTests', () => {
  it('has one case per branch', () => {
    expect(SPEC.ruleTests.length).toBeGreaterThanOrEqual(16)
  })
  for (const c of SPEC.ruleTests) {
    it(`${c.rule} ${JSON.stringify(c.given)} -> ${c.expect}`, () => {
      expect(RULES[c.rule](fromPaths(c.given))).toBe(c.expect)
    })
  }
})

describe('rules', () => {
  it('F4 fires on certify = policy and not otherwise (the S07 vocabulary)', () => {
    const at = (answer: string) => RULES.F4(fromPaths({ 'calls.certify.answer': answer }))
    expect(at('policy')).toBe('F4')
    expect(at('drop')).toBeNull()
    expect(at('unsure')).toBeNull()
    expect(RULES.F4({})).toBeNull()
  })
  it('F2 does not fire before a pace is set; every stop maps to a branch', () => {
    expect(RULES.F2({})).toBeNull()
    for (const m of [12, 18, 24, 30] as const) expect(RULES.F2({ 'pace.months': m })).toBe('F2a')
    for (const m of [36, 48] as const) expect(RULES.F2({ 'pace.months': m })).toBe('F2b')
  })
  it('F5 always fires; rope 1-3 and null are A, 4-5 are B', () => {
    for (const r of [1, 2, 3, null] as const) expect(RULES.F5({ 'self.ropeCounterfactual': r })).toBe('F5/A')
    for (const r of [4, 5] as const) expect(RULES.F5({ 'self.ropeCounterfactual': r })).toBe('F5/B')
    expect(RULES.F5({})).toBe('F5/A')
  })
  it('followupFor maps screens to sheets, with the F5 variant', () => {
    expect(followupFor('S08', { 'self.ropeCounterfactual': 5 })).toEqual({ sheet: 'F5', variant: 'B' })
    expect(followupFor('S05', { 'kit.lane': { brief: 'none' } })).toEqual({ sheet: 'F3c' })
    expect(followupFor('S03', {})).toBeNull()
    expect(followupFor('S02', { 'vote.green': ['meetings'], 'vote.blue': 'present' })).toBeNull()
  })
  it('S01 Beat B shows only when the token lacks business or class', () => {
    expect(needsSegment({})).toBe(true)
    expect(needsSegment({ 'segment.business': 'uspb', 'segment.cohort': '2021' })).toBe(false)
  })
  it('deep paths resolve through the longest store key', () => {
    const a = fromPaths({ 'calls.certify.answer': 'policy', 'kit.lane.brief': 'day1', 'vote.blue': 'x' })
    expect(a).toEqual({ calls: { certify: { answer: 'policy' } }, 'kit.lane': { brief: 'day1' }, 'vote.blue': 'x' })
    expect(getPath(a, 'kit.lane.brief')).toBe('day1')
    expect(getPath(a, 'calls.certify.answer')).toBe('policy')
  })
})

describe('answer keys', () => {
  it('every spec store name has a typed, validated key', () => {
    for (const k of SPEC_STORE_KEYS) expect(ANSWER_KEYS).toContain(k)
  })
  it('cleanAnswers drops unknown keys and bad values, keeps null answers', () => {
    const got = cleanAnswers({
      nope: 1,
      'vote.green': ['classroom', 'NOT_A_GEAR'],
      'vote.blue': 'classroom',
      'self.readyAt': null,
      'pace.months': 17,
      calls: { certify: { answer: 'yes', ms: 1, order: 0 } },
      'kit.lane': { brief: 'day1' },
      mark: 3,
    })
    expect(got).toEqual({ 'vote.blue': 'classroom', 'self.readyAt': null, 'kit.lane': { brief: 'day1' }, mark: 3 })
    expect(cleanAnswers(null)).toEqual({})
    expect(cleanAnswers('junk')).toEqual({})
  })
})
