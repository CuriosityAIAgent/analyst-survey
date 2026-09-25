import { describe, expect, it } from 'vitest'
import graphJson from '@/content/flow.json'
import { isAnswered, nextId } from './logic'
import type { Answer, Card, Graph } from './types'

/* Simulated respondents. Clicking through a UI tests one path; a graph with
   hundreds of branch rules has thousands. Each simulated respondent gives a
   random VALID answer to every card and follows the graph; none may be
   stranded, loop, or be sent to a card that cannot be answered. */

const g = graphJson as unknown as Graph
const byId = new Map(g.cards.map((c) => [c.id, c]))

function rng(seed: number) {
  let s = seed >>> 0
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296 }
}

function answerFor(c: Card, r: () => number): Answer {
  const opts = c.options ?? []
  const pickOne = () => opts[Math.floor(r() * opts.length)].id
  switch (c.kind) {
    case 'show': return null
    case 'text': return r() < 0.5 ? 'something they wrote' : ''
    case 'pick': return pickOne()
    case 'multi': {
      const max = Math.max(1, c.max ?? opts.length)
      const n = 1 + Math.floor(r() * Math.min(max, opts.length))
      return [...opts].sort(() => r() - 0.5).slice(0, n).map((o) => o.id)
    }
    case 'rank': return [...opts].sort(() => r() - 0.5).map((o) => o.id)
    case 'swipe': return Object.fromEntries(opts.map((o) => [o.id, r() < 0.5 ? 'left' : 'right']))
    case 'slider': {
      const s = c.slider!
      const marks = s.marks?.length ? s.marks.map((m) => m.at) : [s.min, s.max]
      return marks[Math.floor(r() * marks.length)]
    }
    case 'tokens': {
      const out: Record<string, string[]> = {}
      for (const t of c.tokens ?? []) {
        // oneEach: the control refuses a second token of a colour on the same option
        out[t.id] = c.oneEach
          ? [...opts].sort(() => r() - 0.5).slice(0, t.count).map((o) => o.id)
          : Array.from({ length: t.count }, () => pickOne())
      }
      return out
    }
  }
}

function walk(seed: number) {
  const r = rng(seed)
  const answers: Record<string, Answer> = {}
  const path: string[] = []
  let id = g.start
  for (let step = 0; step < 400; step++) {
    if (id === 'END') return { ok: true as const, path, answers }
    const c = byId.get(id)
    if (!c) return { ok: false as const, why: `sent to missing card "${id}"`, path }
    if (path.includes(id)) return { ok: false as const, why: `revisited "${id}" (loop)`, path }
    path.push(id)
    const a = answerFor(c, r)
    if (!isAnswered(c, a)) return { ok: false as const, why: `a valid answer to "${id}" is not accepted`, path }
    answers[id] = a
    id = nextId(c, a, answers, new Set(path))
  }
  return { ok: false as const, why: 'did not finish in 400 steps', path }
}

describe(`simulated respondents on "${g.name}"`, () => {
  const N = 1000
  const runs = Array.from({ length: N }, (_, i) => walk(i + 1))

  it(`all ${N} reach the end`, () => {
    const bad = runs.filter((x) => !x.ok).slice(0, 5).map((x) => `${(x as { why: string }).why} after ${x.path.slice(-3).join(' > ')}`)
    expect(bad).toEqual([])
  })

  it('every card in the graph is reached by at least one respondent', () => {
    const seen = new Set(runs.flatMap((x) => x.path))
    const never = g.cards.map((c) => c.id).filter((i) => !seen.has(i))
    expect(never).toEqual([])
  })

  it('the longest route stays within a stated length a respondent would accept', () => {
    const secs = runs.map((x) => x.path.reduce((s, i) => s + (byId.get(i)?.seconds ?? 0), 0))
    const worst = Math.max(...secs)
    const median = [...secs].sort((a, b) => a - b)[Math.floor(secs.length / 2)]
    console.log(`median route ${Math.round(median)}s, longest ${Math.round(worst)}s, cards per route ${Math.min(...runs.map((x) => x.path.length))}-${Math.max(...runs.map((x) => x.path.length))}`)
    expect(worst).toBeLessThan(12 * 60)
  })

  it('no answer buys a shorter survey (Eckman et al.: people learn the shortcut)', () => {
    const secs = runs.map((x) => x.path.reduce((s, i) => s + (byId.get(i)?.seconds ?? 0), 0))
    expect(Math.max(...secs) - Math.min(...secs)).toBeLessThanOrEqual(10)
  })

  it('the length on the title screen is true for the longest route (rule 15)', () => {
    const worst = Math.max(...runs.map((x) => x.path.reduce((s, i) => s + (byId.get(i)?.seconds ?? 0), 0)))
    expect(worst).toBeLessThanOrEqual(g.mainPathSeconds)
    // the title rounds to whole minutes; rounding down must not understate it by more than half a minute
    expect(worst).toBeLessThanOrEqual(Math.round(g.mainPathSeconds / 60) * 60 + 30)
  })
})
