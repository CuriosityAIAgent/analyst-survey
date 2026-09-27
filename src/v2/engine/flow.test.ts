import { describe, expect, it } from 'vitest'
import { PLAY_ORDER, QUESTION, WELCOME as WELCOME_TEXT, type Channel } from '../questions'
import {
  WELCOME, asQuestion, clampCursor, cleanAnswers, emptyFor, expectedStores, followList, followUpsOnPath,
  isAnswer, isKnownStore, nextCursor, prevCursor, previewFill, screens, totalFor, viewAt,
  type Answers, type Cursor, type View,
} from './flow'

/** Walk from the welcome to the end, pressing Next only; returns every view. */
function walk(channel: Channel, answers: Answers, preview: boolean): View[] {
  const out: View[] = []
  let c: Cursor | 'end' = WELCOME
  for (let guard = 0; guard < 500; guard++) {
    if (c === 'end') { out.push(viewAt(channel, WELCOME, answers, preview, true)); return out }
    out.push(viewAt(channel, c, answers, preview))
    c = nextCursor(channel, c, answers, preview)
  }
  throw new Error('no end')
}

describe('route', () => {
  it('numbers questions 1..M (18 on phone, 25 on desk) and follow-ups keep the parent number', () => {
    expect(totalFor('phone')).toBe(18)
    expect(totalFor('desk')).toBe(25)
    for (const ch of ['phone', 'desk'] as Channel[]) {
      const vs = walk(ch, {}, true)
      const qs = vs.filter((v) => v.kind === 'question')
      expect(qs.map((v) => (v as { n: number }).n)).toEqual(qs.map((_, i) => i + 1))
      expect(qs.map((v) => (v as { q: { id: string } }).q.id)).toEqual(PLAY_ORDER[ch].filter((x) => x !== 'scene'))
      let lastN = 0
      for (const v of vs) {
        if (v.kind === 'question') lastN = v.n
        if (v.kind === 'follow') expect(v.n).toBe(lastN)
      }
      expect(vs[0].kind).toBe('welcome')
      expect(vs[vs.length - 1].kind).toBe('end')
    }
  })

  it('welcome length line matches the numbering', () => {
    expect(WELCOME_TEXT.lines.phone[0]).toMatch(/^18 questions/)
    expect(WELCOME_TEXT.lines.desk[0]).toMatch(/^25 questions/)
  })

  it('preview shows every follow-up of every question, in order, after its parent', () => {
    for (const ch of ['phone', 'desk'] as Channel[]) {
      const vs = walk(ch, {}, true)
      const seen = vs.filter((v) => v.kind === 'follow').map((v) => (v as { f: { id: string } }).f.id)
      const want = PLAY_ORDER[ch].filter((x) => x !== 'scene').flatMap((id) => (QUESTION[id].followUps ?? []).map((f) => f.id))
      expect(seen).toEqual(want)
      expect(want.length).toBeGreaterThan(8)
    }
  })

  it('live: no answer, no follow-ups; 4.4 with both classroom and AI client asks both', () => {
    const vs = walk('phone', {}, false)
    expect(vs.filter((v) => v.kind === 'follow')).toEqual([])
    const both = walk('phone', { 'training.fastest': ['classroom', 'ai-client'] }, false)
    expect(both.filter((v) => v.kind === 'follow').map((v) => v.key)).toEqual(['q4.4.classroom', 'q4.4.ai-client'])
  })

  it('breaks sit between blocks: 4 of them, named, numbered for the question that follows', () => {
    for (const ch of ['phone', 'desk'] as Channel[]) {
      const bs = walk(ch, {}, false).filter((v) => v.kind === 'break') as Extract<View, { kind: 'break' }>[]
      expect(bs.map((b) => b.name)).toEqual(['The job ahead', "A new Analyst's time", 'Getting to Advisor faster', 'Last thoughts'])
      expect(bs.map((b) => b.section)).toEqual([2, 3, 4, 5])
      expect(bs[0].from).toBe('look-back')
      const list = screens(ch)
      for (const b of bs) {
        const i = list.findIndex((s) => s.kind === 'break' && s.block === b.block)
        const nextQ = list.slice(i).find((s) => s.kind === 'question')
        expect(b.n).toBe(nextQ && nextQ.kind === 'question' ? nextQ.n : -1)
      }
    }
  })

  it('the scene follows 2.1 on a desk (after the next break on a phone), and keeps 2.1\'s number', () => {
    const desk = walk('desk', {}, false)
    const i = desk.findIndex((v) => v.kind === 'scene')
    expect(desk[i - 1].key).toBe('q2.1')
    expect((desk[i] as { n: number }).n).toBe((desk[i - 1] as { n: number }).n)
    const phone = walk('phone', {}, false)
    const j = phone.findIndex((v) => v.kind === 'scene')
    expect(phone[j - 1].key).toBe('break:analyst-time')
    expect(phone[j - 2].key).toBe('q2.1')
    expect((phone[j] as { n: number }).n).toBe((phone[j - 2] as { n: number }).n)
  })
})

describe('back', () => {
  it('from a follow-up to the previous follow-up, then the parent; from the next question to the last follow-up', () => {
    const a: Answers = { 'training.fastest': ['classroom', 'ai-client'] }
    const i = screens('phone').findIndex((s) => s.kind === 'question' && s.question.id === 'q4.4')
    expect(prevCursor('phone', { screen: i, fu: 1 }, a, false)).toEqual({ screen: i, fu: 0 })
    expect(prevCursor('phone', { screen: i, fu: 0 }, a, false)).toEqual({ screen: i, fu: -1 })
    expect(prevCursor('phone', { screen: i + 1, fu: -1 }, a, false)).toEqual({ screen: i, fu: 1 })
  })

  it('skips breaks, and goes from the first question to the welcome, then nowhere', () => {
    const list = screens('phone')
    const b = list.findIndex((s) => s.kind === 'break')
    const before = prevCursor('phone', { screen: b + 1, fu: -1 }, {}, false)
    expect(before && list[before.screen].kind).not.toBe('break')
    expect(before?.screen).toBe(b - 1)
    expect(prevCursor('phone', { screen: 0, fu: -1 }, {}, false)).toEqual(WELCOME)
    expect(prevCursor('phone', WELCOME, {}, false)).toBeNull()
  })

  it('clampCursor keeps real positions and repairs impossible ones', () => {
    const i = screens('phone').findIndex((s) => s.kind === 'question' && s.question.id === 'q4.4')
    expect(clampCursor('phone', { screen: i, fu: 0 }, {}, false)).toEqual({ screen: i, fu: -1 }) // no answer: no follow-up
    expect(clampCursor('phone', { screen: i, fu: 1 }, {}, true)).toEqual({ screen: i, fu: 1 })
    expect(clampCursor('phone', { screen: 999, fu: 5 }, {}, false).screen).toBe(screens('phone').length - 1)
    expect(clampCursor('phone', { screen: -7, fu: 0 }, {}, false)).toEqual(WELCOME)
    expect(clampCursor('phone', { screen: 1.5, fu: 0 }, {}, false)).toEqual(WELCOME)
  })
})

describe('follow-ups as questions', () => {
  it('carry the follow-up text and stores, and the parent block', () => {
    const q = QUESTION['q4.4']
    const f = q.followUps![0]
    const fq = asQuestion(q, f, {})
    expect(fq).toMatchObject({ id: f.id, question: f.question, stores: f.stores, block: q.block, template: f.template })
  })

  it('3.1: options come from the tiles in "Do more"; preview fills a sample only when there are none', () => {
    const q = QUESTION['q3.1']
    const f = q.followUps![0]
    expect(asQuestion(q, f, {}).options).toEqual([])
    const fill = previewFill(q, f, {})!
    const placed = fill['time.sort'] as Record<string, string>
    expect(Object.values(placed).filter((t) => t === 'more')).toHaveLength(3)
    expect(asQuestion(q, f, fill).options).toHaveLength(3)
    // the reviewer's own answer is left alone when it already feeds the follow-up
    const own = { 'time.sort': { presenting: 'more', crm: 'less' } }
    expect(previewFill(q, f, own)).toBeNull()
    expect(asQuestion(q, f, own).options.map((o) => o.id)).toEqual(['presenting'])
  })

  it('2.3: the "less" follow-up leaves out the three picked', () => {
    const q = QUESTION['q2.3']
    const f = q.followUps![0]
    expect(asQuestion(q, f, { 'skills.more': ['advice', 'decide', 'ai-tools'] }).options.map((o) => o.id))
      .toEqual(['new-clients', 'meetings', 'across-firm', 'prioritising', 'service-team'])
    expect(previewFill(q, f, {})).toBeNull()
  })

  it('followList: live follows the rules, preview lists all', () => {
    const q = QUESTION['q3.2']
    expect(followList(q, { 'tasks.how': { portfolio: 'by-hand', crm: 'by-hand', briefs: 'stop' } }, false).map((f) => f.id))
      .toEqual(['q3.2.why.portfolio']) // no follow-up for CRM (portfolio only)
    expect(followList(q, {}, true)).toHaveLength(1)
  })
})

describe('answers', () => {
  it('knows every stores key and its .order, nothing else', () => {
    expect(isKnownStore('learn.top')).toBe(true)
    expect(isKnownStore('learn.top.order')).toBe(true)
    expect(isKnownStore('tasks.why.portfolio')).toBe(true)
    expect(isKnownStore('tasks.why.crm')).toBe(false)
    expect(isKnownStore('scene.seen')).toBe(true)
    expect(isKnownStore('__proto__')).toBe(false)
    expect(isKnownStore('vote.green')).toBe(false)
  })

  it('accepts only Answer shapes', () => {
    for (const ok of ['y1', 3, [], ['a', 'b'], {}, { a: 'x', b: 2 }]) expect(isAnswer(ok)).toBe(true)
    for (const bad of [null, undefined, NaN, Infinity, true, [1], [{}], { a: {} }, { a: [1] }, 'x'.repeat(3000), new Date()]) {
      expect(isAnswer(bad)).toBe(false)
    }
  })

  it('cleanAnswers drops unknown keys and bad values', () => {
    expect(cleanAnswers({ 'learn.top': ['a'], 'lead.year': { deep: { x: 1 } }, junk: 'x', months: 30 }))
      .toEqual({ 'learn.top': ['a'], months: 30 })
    expect(cleanAnswers('x')).toEqual({})
    expect(cleanAnswers([1])).toEqual({})
  })

  it('emptyFor: optional questions only', () => {
    expect(emptyFor(QUESTION.qC2)).toEqual({})
    expect(emptyFor(asQuestion(QUESTION['q2.3'], QUESTION['q2.3'].followUps![0], {}))).toEqual([])
    expect(emptyFor(QUESTION['q1.2'])).toBeUndefined()
    expect(emptyFor(asQuestion(QUESTION['q4.4'], QUESTION['q4.4'].followUps![1], {}))).toBeUndefined() // min 1: not optional
  })

  it('expectedStores and followUpsOnPath follow the live rules', () => {
    const a: Answers = { 'lead.year': 'y2', 'training.fastest': ['classroom', 'role-plays'], 'ready.when': 'on-time' }
    expect(followUpsOnPath('phone', a)).toEqual(['q1.1.what', 'q4.4.classroom'])
    const ex = expectedStores('phone', a)
    expect(ex).toContain('lead.what')
    expect(ex).toContain('classroom.required')
    expect(ex).not.toContain('aiClient.prepares')
    expect(ex).not.toContain('ready.blocker')
    expect(ex).toContain('scene.seen')
    expect(ex).not.toContain('traits.improving') // 'always' needs 1.3 answered
    expect(expectedStores('phone', { ...a, 'traits.origin': { reading: 'had' } })).toContain('traits.improving')
  })
})
