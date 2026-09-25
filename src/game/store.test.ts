import { beforeEach, describe, expect, it } from 'vitest'
import { useGame, rehydrate, orderFor, stepKey, readToken, beatsFor, seeded, linkId } from './store'
import { SCREEN_IDS } from './content'

const G = () => useGame.getState()
const at = () => { const s = G(); return stepKey(s) }

beforeEach(() => { G().reset(); G().setToken({ business: 'uspb', cohort: '2021' }) })

describe('navigation', () => {
  it('walks S01..S11 with every always-on sheet, and back never loses answers', () => {
    G().next('S01#A')
    expect(G().started).toBe(true)
    expect(G().answers['segment.source']).toBe('token')
    expect(at()).toBe('S02') // token had both: no Beat B
    G().setMany({ 'vote.green': ['classroom', 'meetings', 'debrief'], 'vote.blue': 'present' })
    G().next('S02')
    expect(at()).toBe('F1')
    G().back()
    expect(at()).toBe('S02')
    expect(G().answers['vote.green']).toEqual(['classroom', 'meetings', 'debrief'])
    G().next('S02'); G().next('F1')
    expect(at()).toBe('S03')
    G().next('S03')
    expect(at()).toBe('S04#A')
    G().set('pace.months', 48); G().next('S04#A')
    expect(at()).toBe('S04#B')
    G().set('self.readyAt', null); G().next('S04#B')
    expect(at()).toBe('F2b')
    G().next('F2b')
    expect(at()).toBe('S05')
    G().set('kit.lane', { brief: 'none' }); G().next('S05')
    expect(at()).toBe('F3c'); G().next('F3c')
    G().next('S06')
    G().set('calls', { certify: { answer: 'drop', ms: 1, order: 0 } }); G().next('S07')
    expect(at()).toBe('S08') // drop: F4 skipped
    G().set('self.ropeCounterfactual', 4); G().next('S08')
    expect(G().sheet).toEqual({ id: 'F5', variant: 'B' })
    expect(G().answers['guarantee.variant']).toBe('B')
  })

  it('ignores a stale or double next()', () => {
    G().next('S01#A')
    expect(at()).toBe('S02')
    G().next('S01#A')
    expect(at()).toBe('S02')
  })

  it('shows S01 Beat B only without a token', () => {
    G().setToken({})
    G().next('S01#A')
    expect(at()).toBe('S01#B')
    expect(beatsFor('S01', G().answers)).toEqual(['A', 'B'])
  })

  it('back from the first beat of a screen lands on the previous screen\'s last beat', () => {
    G().jump('S05')
    G().back()
    expect(at()).toBe('S04#B')
  })

  it('finishes after S11', () => {
    G().jump('S11'); G().next('S11')
    expect(G().finished).toBe(true)
    expect(typeof G().answers['t.complete']).toBe('number')
  })

  it('logs timing per step', () => {
    G().next('S01#A')
    expect(Object.keys(G().timing)).toContain('S01#A')
  })
})

describe('rehydrate', () => {
  it('never throws and always lands somewhere real', () => {
    for (const junk of [null, undefined, 1, 'x', [], { screen: 'S99', started: true }, { answers: 'x' },
      { started: true, screen: 'S04', beat: 'Z' }, { started: true, screen: 'S05', sheet: { id: 'F3a' } },
      { events: 'x', timing: [1], seed: 1.5 }]) {
      const r = rehydrate(junk)
      expect(SCREEN_IDS).toContain(r.screen)
      expect(['A', 'B']).toContain(r.beat)
      expect(Number.isInteger(r.seed)).toBe(true)
    }
  })
  it('drops a sheet the rules would not open for the kept answers', () => {
    const r = rehydrate({ started: true, screen: 'S05', beat: 'A', sheet: { id: 'F3a' }, answers: { 'kit.lane': { brief: 'none' } } })
    expect(r.sheet).toBeNull()
    const ok = rehydrate({ started: true, screen: 'S05', beat: 'A', sheet: { id: 'F3a' }, answers: { 'kit.lane': { brief: 'day1' } } })
    expect(ok.sheet).toEqual({ id: 'F3a' })
  })
  it('keeps the seed and valid answers; unstarted state starts at S01', () => {
    const r = rehydrate({ started: false, screen: 'S07', seed: 42, answers: { mark: 3, mark2: 1 } })
    expect(r.screen).toBe('S01')
    expect(r.seed).toBe(42)
    expect(r.answers).toEqual({ mark: 3 })
  })
})

describe('orders', () => {
  const ids = ['a', 'b', 'c', 'd', 'e', 'f'] as const
  it('is a stable permutation per seed and key', () => {
    const o = orderFor(7, 'tray.order', ids)
    expect([...o].sort()).toEqual([...ids])
    expect(orderFor(7, 'tray.order', ids)).toEqual(o)
    expect(orderFor(8, 'tray.order', ids)).not.toEqual(o)
  })
  it('prefers a recorded valid order', () => {
    expect(orderFor(7, 'k', ids, ['f', 'e', 'd', 'c', 'b', 'a'])).toEqual(['f', 'e', 'd', 'c', 'b', 'a'])
    expect(orderFor(7, 'k', ids, ['a'])).toEqual(orderFor(7, 'k', ids))
  })
  it('seeded is in [0,1)', () => {
    const v = seeded(3, 'traits.originSides')
    expect(v).toBeGreaterThanOrEqual(0); expect(v).toBeLessThan(1)
  })
})

describe('token', () => {
  it('reads business and cohort from the link', () => {
    expect(readToken('?business=USPB&cohort=2021')).toEqual({ business: 'uspb', cohort: '2021' })
    expect(readToken('?b=ipb&c=earlier')).toEqual({ business: 'ipb', cohort: 'earlier' })
    expect(readToken('?business=nope&cohort=1999')).toEqual({})
  })
})

describe('Codex P1: saved progress belongs to one link', () => {
  const start = (search: string) => {
    useGame.getState().setToken(readToken(search))
    useGame.getState().begin()
    useGame.getState().set('rule.text' as never, 'mine' as never)
  }
  beforeEach(() => useGame.getState().reset())

  it('reads a respondent code and derives the link identity', () => {
    expect(readToken('?r=AB12cd&business=uspb')).toEqual({ business: 'uspb', code: 'AB12cd' })
    expect(readToken('?r=<script>')).toEqual({})
    expect(linkId({ code: 'AB12cd', business: 'uspb' })).toBe('r:AB12cd')
    expect(linkId({ business: 'uspb', cohort: '2021' })).toBe('s:uspb|2021')
    expect(linkId({})).toBe('')
  })
  it('a different link in the same browser starts fresh', () => {
    start('?r=first1')
    useGame.getState().setToken(readToken('?r=second2'))
    const s = useGame.getState()
    expect(s.started).toBe(false)
    expect(s.answers).toEqual({})
    expect(s.link).toBe('r:second2')
  })
  it('reopening the same link resumes', () => {
    start('?r=first1')
    useGame.getState().setToken(readToken('?r=first1'))
    expect(useGame.getState().started).toBe(true)
    expect(useGame.getState().answers['rule.text' as never]).toBe('mine')
  })
  it('a bare URL (no identity) resumes rather than wiping', () => {
    start('?r=first1')
    useGame.getState().setToken(readToken(''))
    expect(useGame.getState().started).toBe(true)
  })
  it('the link survives a reload', () => {
    expect(rehydrate({ started: true, link: 'r:first1' }).link).toBe('r:first1')
    expect(rehydrate({ link: 42 }).link).toBe('')
  })
})
