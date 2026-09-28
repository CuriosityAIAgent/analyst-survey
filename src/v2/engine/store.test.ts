import { beforeEach, describe, expect, it } from 'vitest'
import { useV2, rehydrate, response, stepOf, viewOf, segmentMissing, segmentAsked, STORE_KEY } from './store'
import { screens } from './flow'
import { channelFor, isPreviewUrl, linkId, orderFor, readToken, seeded } from './link'

const G = () => useV2.getState()
const at = () => stepOf(G())
/** Press Next until the step is `id` (answering nothing). */
const until = (id: string) => {
  for (let i = 0; i < 80 && at() !== id; i++) G().next(at())
  expect(at()).toBe(id)
}

beforeEach(() => {
  G().reset()
  useV2.setState({ token: {}, preview: false, mode: 'live' })
  G().setToken({ business: 'uspb', cohort: '2024', code: 'abcd1234' })
})

describe('start and channel', () => {
  it('starts at the welcome; begin() locks the channel and takes the segment from the link', () => {
    expect(at()).toBe('welcome')
    G().next('welcome') // Next at the welcome does nothing: Start is begin()
    expect(G().started).toBe(false)
    G().begin('phone', { w: 390, h: 660, pointer: 'coarse', dpr: 2 })
    expect(G().started).toBe(true)
    expect(G().channel).toBe('phone')
    expect(G().segment).toEqual({ business: 'uspb', cohort: '2024', source: 'token' })
    expect(at()).toBe('q1.2')
    expect(typeof G().tStart).toBe('number')
    G().begin('desk') // a second call never changes the channel
    expect(G().channel).toBe('phone')
  })

  it('asks only what the link lacks; the answer is kept as "asked" or "mixed"', () => {
    G().reset(); G().setToken({ business: 'ipb' })
    expect(segmentAsked(G().token)).toEqual({ business: false, cohort: true })
    expect(segmentMissing(G())).toEqual({ business: false, cohort: true })
    G().setSegment({ cohort: '2019' }) // not a class we survey
    expect(G().segment.cohort).toBeUndefined()
    G().setSegment({ cohort: '2023' })
    expect(segmentMissing(G())).toEqual({ business: false, cohort: false })
    G().begin('desk')
    expect(G().segment).toEqual({ business: 'ipb', cohort: '2023', source: 'mixed' })
    G().reset(); useV2.setState({ token: {} })
    G().setSegment({ business: 'solutions', cohort: '2022' }); G().begin('phone')
    expect(G().segment.source).toBe('asked')
  })
})

describe('navigation', () => {
  it('walks follow-ups in place and back returns to the parent with its answer', () => {
    G().begin('phone')
    G().set('learn.top', ['coaching', 'morning'])
    G().next('q1.2')
    expect(at()).toBe('q1.1')
    G().set('lead.year', 'y2')
    G().next('q1.1')
    expect(at()).toBe('q1.1.what')
    const v = viewOf(G())
    expect(v.kind === 'follow' && v.n).toBe(2)
    expect(v.kind === 'follow' && v.bridge).toBe('One more on that first client meeting.')
    G().back('q1.1.what')
    expect(at()).toBe('q1.1')
    expect(G().answers['lead.year']).toBe('y2')
    G().set('lead.year', 'after') // a changed answer: 1.1's follow-up is asked whatever the year
    G().next('q1.1')
    expect(at()).toBe('q1.1.what')
    G().set('lead.what', 'review'); G().next('q1.1.what')
    expect(at()).toBe('q1.3')
    G().back()
    expect(at()).toBe('q1.1.what') // back from the next question lands on the last follow-up
  })

  it('ignores a stale or double next() and back()', () => {
    G().begin('phone')
    G().set('learn.top', ['a', 'b'])
    G().next('q1.2')
    G().next('q1.2')
    expect(at()).toBe('q1.1')
    G().back('q1.2')
    expect(at()).toBe('q1.1')
  })

  it('back from the first question goes to the welcome; Start carries on with the same channel', () => {
    G().begin('desk')
    G().back()
    expect(at()).toBe('welcome')
    expect(G().started).toBe(true)
    G().begin('phone')
    expect(at()).toBe('q1.2')
    expect(G().channel).toBe('desk')
  })

  it('stores an empty answer for an optional question passed untouched, and marks the scene seen', () => {
    G().begin('phone')
    until('scene')
    G().next('scene')
    expect(G().answers['scene.seen']).toBe('seen')
    until('qC2')
    G().next('qC2')
    expect(G().answers.notes).toEqual({})
    expect(G().finished).toBe(true)
    expect(at()).toBe('end')
    expect(typeof G().tEnd).toBe('number')
    G().next(); G().back()
    expect(G().finished).toBe(true)
  })

  it('logs timing per step and a move event', () => {
    G().begin('phone')
    G().next('q1.2')
    expect(Object.keys(G().timing)).toEqual(expect.arrayContaining(['welcome', 'q1.2']))
    expect(G().events.map((e) => e.type)).toEqual(['begin', 'screen'])
    expect(G().events[1]).toMatchObject({ from: 'q1.2', to: 'q1.1', step: 'q1.2' })
  })

  it('keeps a logged order under <stores>.order', () => {
    G().begin('phone')
    G().log('order', { order: ['a', 'b'] }, 'learn.top')
    expect(G().answers['learn.top.order']).toEqual(['a', 'b'])
    G().log('order', { order: [1, 2] }, 'learn.top')
    expect(G().answers['learn.top.order']).toEqual(['a', 'b'])
    G().set('learn.top', { deep: { x: 1 } } as never)
    expect(G().answers['learn.top']).toBeUndefined()
  })
})

describe('preview', () => {
  it('Next always moves, every follow-up shows, and 3.1\'s follow-up gets sample tiles', () => {
    G().setPreview(true)
    G().begin('phone')
    const seen: string[] = []
    for (let i = 0; i < 120 && !G().finished; i++) { seen.push(at()); G().next(at()) }
    expect(G().finished).toBe(true)
    for (const id of ['q1.1.what', 'q1.3.matter', 'q4.4.classroom', 'q4.4.ai-client', 'q5.1.blocker', 'q3.1.fastest',
      'q3.2.why.portfolio', 'q3.4.still', 'q5.5.prove']) expect(seen).toContain(id)
    expect(Object.values(G().answers['time.sort'] as Record<string, string>)).toContain('more')
    expect(G().answers['lead.year']).toBeUndefined() // nothing else is invented
    expect(G().answers.notes).toBeUndefined()
  })

  it('preview and live runs never share answers', () => {
    G().begin('phone'); G().set('learn.top', ['a', 'b'])
    G().setPreview(true)
    expect(G().started).toBe(false)
    expect(G().answers).toEqual({})
    expect(G().mode).toBe('preview')
    G().begin('phone'); G().set('learn.top', ['sample', 'x'])
    G().setPreview(false)
    expect(G().answers).toEqual({})
    expect(G().mode).toBe('live')
    expect(G().token.code).toBe('abcd1234') // the link is kept
  })
})

describe('link identity', () => {
  it('a different link starts fresh; the same link or a bare URL resumes', () => {
    G().begin('phone'); G().set('learn.top', ['a', 'b'])
    G().setToken({ business: 'uspb', cohort: '2024', code: 'abcd1234' })
    expect(G().answers['learn.top']).toEqual(['a', 'b'])
    G().setToken({})
    expect(G().answers['learn.top']).toEqual(['a', 'b'])
    G().setToken({ code: 'other999' })
    expect(G().started).toBe(false)
    expect(G().answers).toEqual({})
    expect(G().link).toBe('r:other999')
  })

  it('readToken, linkId', () => {
    expect(readToken('?business=USPB&cohort=2024&r=ab12_cd')).toEqual({ business: 'uspb', cohort: '2024', code: 'ab12_cd' })
    expect(readToken('?b=ipb&c=2022')).toEqual({ business: 'ipb', cohort: '2022' })
    expect(readToken('?business=other&cohort=2021&r=x')).toEqual({})
    expect(readToken('?cohort=2026')).toEqual({})
    expect(readToken('?r=' + 'a'.repeat(65))).toEqual({})
    expect(linkId({ code: 'abcd', business: 'ipb' })).toBe('r:abcd')
    expect(linkId({ business: 'ipb', cohort: '2023' })).toBe('s:ipb|2023')
    expect(linkId({})).toBe('')
  })

  it('isPreviewUrl, channelFor', () => {
    expect(isPreviewUrl('/preview', '')).toBe(true)
    expect(isPreviewUrl('/preview/', '')).toBe(true)
    expect(isPreviewUrl('/', '?preview=1')).toBe(true)
    expect(isPreviewUrl('/', '?preview=0')).toBe(false)
    expect(channelFor(390, 660)).toBe('phone')
    expect(channelFor(1440, 790)).toBe('desk')
    expect(channelFor(1280, 600)).toBe('desk') // deskCompact is the desk channel
    expect(channelFor(1024, 1366)).toBe('phone') // a tall tablet
    expect(channelFor(390, 660, '?layout=desk')).toBe('desk')
  })

  it('seeded order is stable and a permutation', () => {
    const ids = ['a', 'b', 'c', 'd', 'e']
    const o = orderFor(42, 'k', ids)
    expect([...o].sort()).toEqual(ids)
    expect(orderFor(42, 'k', ids)).toEqual(o)
    expect(orderFor(42, 'k', ids, ['e', 'd', 'c', 'b', 'a'])).toEqual(['e', 'd', 'c', 'b', 'a'])
    expect(seeded(1, 'x')).toBe(seeded(1, 'x'))
  })
})

describe('rehydrate', () => {
  it('never throws and always lands somewhere real', () => {
    for (const junk of [null, undefined, 1, 'x', [], { started: true }, { started: true, channel: 'tablet' },
      { started: true, channel: 'phone', cursor: { screen: 999, fu: 9 } }, { started: true, channel: 'desk', cursor: 'x' },
      { answers: 'x', events: 'x', timing: [1], seed: 1.5 }, { started: true, channel: 'phone', cursor: { screen: 3, fu: 4 } }]) {
      const r = rehydrate(junk)
      expect(typeof r.seed).toBe('number')
      if (r.started) {
        expect(r.channel === 'phone' || r.channel === 'desk').toBe(true)
        expect(r.cursor.screen).toBeLessThan(screens(r.channel!).length)
        expect(r.cursor.fu).toBe(-1)
      } else {
        expect(r.cursor).toEqual({ screen: -1, fu: -1 })
        expect(r.channel).toBeNull()
      }
    }
  })

  it('keeps a good session, restoring a follow-up only if the answers still call for it', () => {
    const i = screens('phone').findIndex((s) => s.kind === 'question' && s.question.id === 'q5.1')
    const good = { started: true, channel: 'phone', cursor: { screen: i, fu: 0 }, cursorId: 'q5.1', answers: { 'ready.when': 'months-before', junk: 1 },
      segment: { business: 'uspb', cohort: '2024', source: 'token' }, seed: 7, link: 'r:abcd', mode: 'live', timing: { 'q1.2': 1200, bad: 'x' } }
    const r = rehydrate(good)
    expect(r).toMatchObject({ started: true, channel: 'phone', cursor: { screen: i, fu: 0 }, answers: { 'ready.when': 'months-before' }, seed: 7, link: 'r:abcd', timing: { 'q1.2': 1200 } })
    expect(rehydrate({ ...good, answers: { 'ready.when': 'on-time' } }).cursor).toEqual({ screen: i, fu: -1 })
  })

  it('finds the screen by its saved id if the index moved', () => {
    const i = screens('desk').findIndex((s) => s.kind === 'question' && s.question.id === 'q3.3')
    expect(rehydrate({ started: true, channel: 'desk', cursor: { screen: 2, fu: -1 }, cursorId: 'q3.3' }).cursor.screen).toBe(i)
  })

  it('resets legacy segments (a class before 2022, or "other")', () => {
    const r = rehydrate({ started: true, channel: 'phone', cursor: { screen: 4, fu: -1 }, answers: { 'learn.top': ['a'] }, segment: { business: 'other' }, seed: 3 })
    expect(r.started).toBe(false)
    expect(r.answers).toEqual({})
    expect(r.seed).toBe(3)
    expect(rehydrate({ segment: { cohort: '2019' } }).started).toBe(false)
  })

  it('a v1 session shape is not a v2 session', () => {
    const r = rehydrate({ started: true, screen: 'S05', beat: 'A', answers: { 'vote.green': ['x'] } })
    expect(r.started).toBe(false)
    expect(r.answers).toEqual({})
  })

  it('persists under its own key', () => {
    expect(STORE_KEY).toBe('ascent-v2-v1')
    expect(useV2.persist.getOptions().name).toBe('ascent-v2-v1')
    // 28 Sep: the questions changed (3.2a added, option ids renamed), so sessions saved before start fresh
    expect(useV2.persist.getOptions().version).toBe(2)
    expect(useV2.persist.getOptions().migrate?.({ started: true, answers: { 'lead.year': 'not-yet' } }, 1)).toEqual({})
  })
})

describe('response', () => {
  it('lists follow-ups on the path and anything still missing', () => {
    G().begin('phone')
    G().set('lead.year', 'y1'); G().set('training.fastest', ['classroom', 'examples'])
    const r = response(G())
    expect(r.followUpsOnPath).toEqual(['q1.1.what', 'q4.4.classroom'])
    expect(r.missing).toContain('lead.what')
    expect(r.missing).not.toContain('lead.year')
    expect(r.meta.channel).toBe('phone')
    expect(r.segment.business).toBe('uspb')
  })
})
