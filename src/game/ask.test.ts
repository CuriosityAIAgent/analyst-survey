import { describe, expect, it } from 'vitest'
import { SPEC, SCREEN_IDS, SHEET_IDS, ask, askVars, copy, plainOf, specBeats, step } from './content'
import type { StepId } from './types'

const ALL: StepId[] = [...SCREEN_IDS, ...SHEET_IDS]

describe('the plain ask (design section 4)', () => {
  it('every step and beat has an ask block within the copy limits', () => {
    for (const id of ALL) {
      const s = step(id)
      expect(s.ask, id).toBeTruthy()
      for (const b of s.beats ?? []) expect(b.ask, `${id}#${b.beat}`).toBeTruthy()
      for (const beat of specBeats(id)) {
        const a = ask(id, beat)
        expect(a.question.length, `${id}#${beat} question`).toBeLessThanOrEqual(90)
        expect(a.how.length, `${id}#${beat} how`).toBeLessThanOrEqual(110)
        expect((a.why ?? '').length, `${id}#${beat} why`).toBeLessThanOrEqual(90)
        expect(a.kicker.length).toBeGreaterThan(0)
      }
    }
  })
  it('plainAsk is on: the phone shows the same question', () => {
    expect(SPEC.frame.plainAsk).toBe(true)
  })
  it('F5 keeps its A/B wording verbatim, with no plain rewrite and no why', () => {
    expect(step('F5').ask?.question).toBeUndefined()
    expect(step('F5').ask?.why).toBeUndefined()
    expect(ask('F5', 'A', 'A').question).toBe(copy('F5', 'A', 'A').prompt)
    expect(ask('F5', 'A', 'B').question).toBe(copy('F5', 'A', 'B').prompt)
  })
  it('follow-ups never repeat back the answer that opened them', () => {
    const a = askVars({ 'pace.months': 18, 'traits.top3': ['reading'] })
    for (const id of SHEET_IDS) {
      const q = ask(id, 'A', 'A', a)
      expect(q.question, id).not.toMatch(/18 months|when proven|\{stop\}/i)
      expect(q.question, id).not.toMatch(/you (chose|packed|picked|said)/i)
      expect(q.followup).toBe(true)
    }
  })
  it('fills {leadTrait} from the answers', () => {
    expect(ask('S09', 'B', undefined, askVars({ 'traits.top3': ['calm'] })).question).toMatch(/^Calm in a storm: /)
  })
  it('self-questions are marked; S01 A and S11 kickers stand alone', () => {
    expect(ask('S04', 'B').self).toBe(true)
    expect(ask('S08').self).toBe(true)
    expect(ask('S02').self).toBe(false)
    expect(ask('S01').camp).toBe('')
    expect(ask('S02').camp).toBe('Base camp')
  })
  it('S02 and S06 zones carry plain labels', () => {
    for (const z of ['rucksack', 'hand', 'out', 'rerig']) expect(plainOf('S02', z), z).toBeTruthy()
    expect(plainOf('S06', 'own')).toBe('The Analyst, no AI')
    expect(plainOf('S06', 'crew')).toBe('Someone else does it, or it stops')
  })
})
