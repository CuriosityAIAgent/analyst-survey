import { beforeEach, describe, expect, it } from 'vitest'
import { checkGraph, isAnswered, test } from './logic'
import { CARD, GRAPH, rehydrate, response, useFlow } from './store'
import type { Card, Graph } from './types'

/* One test per Codex P1/P2 on the engine, so none of them can come back. */

const reset = () => useFlow.setState({ started: true, path: [GRAPH.start], answers: {}, timing: [], enteredAt: Date.now() })
const cur = () => useFlow.getState().path.at(-1)

describe('Codex P1: a double tap on a pick cannot skip the next card', () => {
  beforeEach(reset)
  it('an advance named for a card that is no longer current is ignored', () => {
    const start = GRAPH.start
    useFlow.getState().advance(start)          // show card: always answered
    const after = cur()
    useFlow.getState().advance(start)          // the stale second timer
    expect(cur()).toBe(after)
  })
  it('the store refuses to leave an unanswered card', () => {
    useFlow.getState().advance(GRAPH.start)
    const here = cur()!
    const c = CARD.get(here)!
    if (c.kind === 'show' || c.optional) return  // nothing to refuse on this card
    useFlow.getState().advance(here)
    expect(cur()).toBe(here)
  })
})

describe('Codex P1: answers from an abandoned branch do not steer or get recorded', () => {
  it('carried: reads only cards on the current path', () => {
    const all = { gone: 'yes' as const }
    expect(test('carried:gone:is:yes', undefined, all, new Set(['a', 'b']))).toBe(false)
    expect(test('carried:gone:is:yes', undefined, all, new Set(['a', 'gone']))).toBe(true)
  })
  it('the recorded response drops answers not on the final path', () => {
    const r = response({ path: ['a', 'c'], answers: { a: 'x', b: 'abandoned', c: 'y' }, timing: [{ id: 'b', ms: 9 }, { id: 'a', ms: 5 }] })
    expect(Object.keys(r.answers).sort()).toEqual(['a', 'c'])
    expect(r.timing.map((t) => t.id)).toEqual(['a'])
  })
})

describe('Codex P1: hydration rebuilds the path instead of trusting it', () => {
  it('a stored path that skips cards is cut back to where it stops being legal', () => {
    const last = GRAPH.cards[GRAPH.cards.length - 1].id
    const h = rehydrate({ started: true, path: [GRAPH.start, last], answers: {} })
    expect(h.path).toEqual([GRAPH.start])
  })
  it('an answer naming an option the card does not have is dropped, not rendered', () => {
    const rank = GRAPH.cards.find((c) => c.kind === 'rank')
    if (!rank) return
    const h = rehydrate({ started: true, path: [GRAPH.start], answers: { [rank.id]: ['removed-option'] } })
    expect(rank.id in h.answers).toBe(false)
  })
  it('garbage in localStorage yields a clean start, never a throw', () => {
    for (const junk of [null, 7, 'x', { path: 'nope', answers: 3 }, { path: [null, {}], answers: { zzz: 1 } }]) {
      expect(() => rehydrate(junk)).not.toThrow()
      expect(rehydrate(junk).path[0]).toBe(GRAPH.start)
    }
  })
})

describe('Codex P1: malformed conditions never match', () => {
  it('extra segments are rejected', () => {
    expect(test('is:yes:ignored', 'yes', {})).toBe(false)
    expect(test('token:g:x:ignored', { g: ['x'] }, {})).toBe(false)
  })
  it('a non-numeric slider threshold never matches', () => {
    expect(test('gte:abc', 5, {})).toBe(false)
  })
  it('a null or non-string condition is false, not a throw', () => {
    expect(test(null, 'x', {})).toBe(false)
    expect(test(42, 'x', {})).toBe(false)
  })
})

const card = (o: Partial<Card>): Card => ({ id: 'c', section: 'open', kind: 'show', prompt: 'p', next: 'END', answers: [], seconds: 5, ...o })
const graph = (cards: Card[]): Graph => ({ name: 't', thesis: '', start: cards[0].id, cards, consistencyPairs: [], mainPathSeconds: 0 })

describe('Codex P1: checkGraph catches what used to slip through', () => {
  it('a carried: reference to a card that can never come first', () => {
    const g = graph([
      card({ id: 'a', next: 'b', branches: [{ when: 'carried:b:is:x', goto: 'END' }] }),
      card({ id: 'b' }),
    ])
    expect(checkGraph(g).some((p) => p.problem.includes('can never come before'))).toBe(true)
  })
  it('branches after an "always" can never fire', () => {
    const g = graph([card({ id: 'a', branches: [{ when: 'always', goto: 'END' }, { when: 'is:x', goto: 'END' }] })])
    expect(checkGraph(g).some((p) => p.problem.includes('after "always"'))).toBe(true)
  })
  it('an unknown kind, and a required multi that cannot be answered', () => {
    const g = graph([
      card({ id: 'a', kind: 'dance' as never, next: 'b' }),
      card({ id: 'b', kind: 'multi', max: 0, options: [{ id: 'x', label: 'X' }] }),
    ])
    const probs = checkGraph(g).map((p) => p.problem).join(' | ')
    expect(probs).toContain('unknown kind')
    expect(probs).toContain('max < 1')
  })
  it('a graph with no cards array is reported, not thrown', () => {
    expect(() => checkGraph({} as Graph)).not.toThrow()
    expect(checkGraph({} as Graph)[0].problem).toContain('no cards')
  })
})

describe('optional means skippable', () => {
  it('an optional card with no answer can be left', () => {
    expect(isAnswered(card({ kind: 'multi', optional: true, options: [{ id: 'x', label: 'X' }] }), undefined)).toBe(true)
    expect(isAnswered(card({ kind: 'text', optional: true }), undefined)).toBe(true)
  })
  it('a required multi with no answer cannot', () => {
    expect(isAnswered(card({ kind: 'multi', options: [{ id: 'x', label: 'X' }] }), undefined)).toBe(false)
  })
})
