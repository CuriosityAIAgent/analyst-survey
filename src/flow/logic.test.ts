import { describe, expect, it } from 'vitest'
import { checkGraph, mainPath, nextId, test } from './logic'
import type { Card, Graph } from './types'

const card = (over: Partial<Card>): Card => ({
  id: 'c', section: 'open', kind: 'pick', prompt: 'p', next: 'END', answers: [], seconds: 5, ...over,
})

describe('branch conditions', () => {
  it('is: matches a pick', () => {
    expect(test('is:yes', 'yes', {})).toBe(true)
    expect(test('is:yes', 'no', {})).toBe(false)
  })
  it('includes: matches a multi', () => {
    expect(test('includes:classroom', ['roleplay', 'classroom'], {})).toBe(true)
    expect(test('includes:classroom', ['roleplay'], {})).toBe(false)
  })
  it('top: is rank position one only', () => {
    expect(test('top:mentor', ['mentor', 'desk'], {})).toBe(true)
    expect(test('top:mentor', ['desk', 'mentor'], {})).toBe(false)
  })
  it('gte/lte on a slider, inclusive at the boundary', () => {
    expect(test('gte:70', 70, {})).toBe(true)
    expect(test('gte:70', 69, {})).toBe(false)
    expect(test('lte:12', 12, {})).toBe(true)
  })
  it('right/left on a swipe', () => {
    expect(test('right:pitchbook', { pitchbook: 'right', kyc: 'left' }, {})).toBe(true)
    expect(test('left:pitchbook', { pitchbook: 'right' }, {})).toBe(false)
  })
  it('token: a token of that colour on that option', () => {
    const v = { green: ['client', 'advice'], red: ['execute'] }
    expect(test('token:green:advice', v, {})).toBe(true)
    expect(test('token:red:advice', v, {})).toBe(false)
  })
  it('carried: reads an earlier card', () => {
    const all = { fuel_rank: ['mentor', 'desk'] }
    expect(test('carried:fuel_rank:top:mentor', undefined, all)).toBe(true)
    expect(test('carried:fuel_rank:top:desk', undefined, all)).toBe(false)
  })
  it('carried: on a card never visited is false, not a crash', () => {
    expect(test('carried:never_seen:is:yes', undefined, {})).toBe(false)
  })
  it('a condition that does not fit the answer shape is false, never a throw', () => {
    expect(test('gte:5', 'text', {})).toBe(false)
    expect(test('is:x', ['x'], {})).toBe(false)
    expect(test('token:g:x', 7, {})).toBe(false)
    expect(test('nonsense', 'x', {})).toBe(false)
  })
})

describe('nextId', () => {
  it('first matching branch wins, otherwise the default', () => {
    const c = card({ branches: [{ when: 'is:yes', goto: 'how' }, { when: 'is:no', goto: 'instead' }], next: 'skip' })
    expect(nextId(c, 'yes', {})).toBe('how')
    expect(nextId(c, 'no', {})).toBe('instead')
    expect(nextId(c, 'depends', {})).toBe('skip')
  })
})

const g = (cards: Card[], start = cards[0].id): Graph =>
  ({ name: 't', thesis: '', start, cards, consistencyPairs: [], mainPathSeconds: 0 })

describe('checkGraph', () => {
  it('passes a clean graph', () => {
    const ok = g([
      card({ id: 'a', options: [{ id: 'yes', label: 'Y' }, { id: 'no', label: 'N' }], branches: [{ when: 'is:yes', goto: 'b' }], next: 'c' }),
      card({ id: 'b', kind: 'show', next: 'c' }),
      card({ id: 'c', kind: 'show', next: 'END' }),
    ])
    expect(checkGraph(ok)).toEqual([])
  })
  it('finds a dangling target', () => {
    const bad = g([card({ id: 'a', kind: 'show', next: 'ghost' })])
    expect(checkGraph(bad).some((p) => p.problem.includes('missing card "ghost"'))).toBe(true)
  })
  it('finds a branch naming an option the card lacks', () => {
    const bad = g([card({ id: 'a', options: [{ id: 'yes', label: 'Y' }], branches: [{ when: 'is:maybe', goto: 'END' }] })])
    expect(checkGraph(bad).some((p) => p.problem.includes('"maybe"'))).toBe(true)
  })
  it('finds an unreachable card', () => {
    const bad = g([card({ id: 'a', kind: 'show' }), card({ id: 'orphan', kind: 'show' })])
    expect(checkGraph(bad).some((p) => p.card === 'orphan' && p.problem === 'unreachable')).toBe(true)
  })
  it('finds a cycle', () => {
    const bad = g([card({ id: 'a', kind: 'show', next: 'b' }), card({ id: 'b', kind: 'show', next: 'a' })])
    expect(checkGraph(bad).some((p) => p.problem === 'cycle')).toBe(true)
  })
  it('finds a carried: reference to a missing card', () => {
    const bad = g([card({ id: 'a', kind: 'show', branches: [{ when: 'carried:ghost:is:x', goto: 'END' }] })])
    expect(checkGraph(bad).some((p) => p.problem.includes('carried'))).toBe(true)
  })
})

describe('mainPath', () => {
  it('follows defaults only, and stops on a cycle rather than hanging', () => {
    const path = mainPath(g([
      card({ id: 'a', kind: 'show', next: 'b', branches: [{ when: 'always', goto: 'z' }] }),
      card({ id: 'b', kind: 'show', next: 'a' }),
      card({ id: 'z', kind: 'show' }),
    ]))
    expect(path.map((c) => c.id)).toEqual(['a', 'b'])
  })
})
