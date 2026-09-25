'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import graphJson from '@/content/flow.json'
import type { Answer, Card, Graph } from './types'
import { isAnswered, nextId } from './logic'

export const GRAPH = graphJson as unknown as Graph
export const CARD = new Map<string, Card>(GRAPH.cards.map((c) => [c.id, c]))

type State = {
  started: boolean
  path: string[]                          // visited card ids, last is current
  answers: Record<string, Answer>         // kept across Back so nothing is lost...
  timing: { id: string; ms: number }[]
  enteredAt: number
  seed: number                            // per respondent; rebuilds every shuffled order
  begin: () => void
  answer: (id: string, v: Answer) => void
  advance: (from?: string) => void
  back: () => void
  reset: () => void
}

/* ...but only answers on the CURRENT path steer routing or reach the record.
   Back out of branch B, take branch C, and B's answers stop counting. */
export const onPath = (path: string[]) => new Set(path.filter((x) => x !== 'END'))

export function response(s: Pick<State, 'path' | 'answers' | 'timing' | 'seed'>) {
  const keep = onPath(s.path)
  const answers: Record<string, Answer> = {}
  for (const id of keep) if (id in s.answers) answers[id] = s.answers[id]
  return { path: s.path, answers, timing: s.timing.filter((t) => keep.has(t.id)), seed: s.seed }
}

const newSeed = () => (Math.random() * 2 ** 31) | 0
const fresh = () => ({ started: false, path: [GRAPH.start], answers: {}, timing: [], enteredAt: Date.now(), seed: newSeed() })

export const useFlow = create<State>()(
  persist(
    (set, get) => ({
      ...fresh(),
      begin: () => set({ ...fresh(), started: true, enteredAt: Date.now() }),
      answer: (id, v) => set((s) => ({ answers: { ...s.answers, [id]: v } })),
      advance: (from) => {
        const { path, answers, timing, enteredAt } = get()
        const curId = path[path.length - 1]
        // An auto-advance scheduled on card A must never fire on card B.
        if (from !== undefined && from !== curId) return
        const cur = CARD.get(curId)
        if (!cur) return
        // The store refuses to leave an unanswered card, whatever asked it to.
        if (!isAnswered(cur, answers[cur.id])) return
        const to = nextId(cur, answers[cur.id], answers, onPath(path))
        const now = Date.now()
        const t = [...timing.filter((x) => x.id !== cur.id), { id: cur.id, ms: now - enteredAt }]
        set({ path: [...path, CARD.has(to) ? to : 'END'], timing: t, enteredAt: now })
      },
      back: () => {
        const { path } = get()
        if (path.length <= 1) return
        set({ path: path.slice(0, -1), enteredAt: Date.now() })
      },
      reset: () => set(fresh()),
    }),
    {
      name: 'ascent-flow-v1',
      version: 1,
      merge: (persisted, current) => ({ ...current, ...rehydrate(persisted) }),
    },
  ),
)

/* Rebuild trusted state from whatever was in localStorage. Pure, so it is tested. */
export function rehydrate(persisted: unknown) {
        const p = (persisted ?? {}) as Partial<State>
        // Validate every answer against its card before trusting it: an unknown
        // option id used to crash Rank on render.
        const answers: Record<string, Answer> = {}
        for (const [k, v] of Object.entries(p.answers ?? {})) {
          const c = CARD.get(k)
          if (c && isAnswered(c, v as Answer)) answers[k] = v as Answer
        }
        // Rebuild the path by REPLAYING the graph from start, so a stored path
        // like [start, 'cert'] cannot skip the cards in between.
        const stored = Array.isArray(p.path) ? p.path : []
        const path = [GRAPH.start]
        for (let i = 1; i < stored.length; i++) {
          const prev = CARD.get(path[path.length - 1])
          if (!prev || !isAnswered(prev, answers[prev.id])) break
          const expect = nextId(prev, answers[prev.id], answers, onPath(path))
          const got = stored[i]
          if (got === 'END' && !CARD.has(expect)) { path.push('END'); break }
          if (got !== expect) break
          path.push(got)
        }
        return {
          started: p.started === true,
          path,
          answers,
          timing: Array.isArray(p.timing) ? p.timing.filter((t) => t && CARD.has(t.id)) : [],
          // keep the seed, or a refresh would reshuffle cards already answered
          ...(Number.isInteger(p.seed) ? { seed: p.seed as number } : {}),
        }
}
