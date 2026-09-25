'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import graphJson from '@/content/flow.json'
import type { Answer, Card, Graph } from './types'
import { nextId } from './logic'

export const GRAPH = graphJson as unknown as Graph
export const CARD = new Map<string, Card>(GRAPH.cards.map((c) => [c.id, c]))

type State = {
  started: boolean
  path: string[]                          // visited card ids, last is current
  answers: Record<string, Answer>
  timing: { id: string; ms: number }[]
  enteredAt: number
  begin: () => void
  answer: (id: string, v: Answer) => void
  advance: () => void
  back: () => void
  reset: () => void
}

const fresh = () => ({ started: false, path: [GRAPH.start], answers: {}, timing: [], enteredAt: Date.now() })

export const useFlow = create<State>()(
  persist(
    (set, get) => ({
      ...fresh(),
      begin: () => set({ started: true, path: [GRAPH.start], enteredAt: Date.now() }),
      answer: (id, v) => set((s) => ({ answers: { ...s.answers, [id]: v } })),
      advance: () => {
        const { path, answers, timing, enteredAt } = get()
        const cur = CARD.get(path[path.length - 1])
        if (!cur) return
        const to = nextId(cur, answers[cur.id], answers)
        const now = Date.now()
        const t = [...timing, { id: cur.id, ms: now - enteredAt }]
        if (to === 'END' || !CARD.has(to)) {
          set({ path: [...path, 'END'], timing: t, enteredAt: now })
          return
        }
        set({ path: [...path, to], timing: t, enteredAt: now })
      },
      back: () => {
        const { path } = get()
        if (path.length <= 1) return
        // answers are kept: nothing is lost on back
        set({ path: path.slice(0, -1), enteredAt: Date.now() })
      },
      reset: () => set(fresh()),
    }),
    {
      name: 'ascent-flow-v1',
      version: 1,
      // persisted state is attacker-controllable and outlives content edits:
      // drop any card id the current graph no longer has
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<State>
        const path = Array.isArray(p.path) ? p.path.filter((id) => id === 'END' || CARD.has(id)) : []
        const answers: Record<string, Answer> = {}
        for (const [k, v] of Object.entries(p.answers ?? {})) if (CARD.has(k)) answers[k] = v as Answer
        const okPath = path.length && path[0] === GRAPH.start ? path : [GRAPH.start]
        return {
          ...current,
          started: p.started === true && okPath.length > 1,
          path: okPath,
          answers,
          timing: Array.isArray(p.timing) ? p.timing : [],
        }
      },
    },
  ),
)
