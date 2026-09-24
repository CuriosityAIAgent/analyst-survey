'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { LEVELS } from '@/content/content'
import { emptyAnswers, validateAnswers } from './validate'

export type Lane = 'agent' | 'both' | 'human'

export type Answers = {
  segment: { business?: string; months?: string; aiUse?: string; canAlone: string[]; notTrusted: string[] }
  fuel: { round: number; shown: string[]; best?: string; worst?: string; ms: number }[]
  advisor: { top3: string[]; dependence: number; changeTop2: string[] }
  handover: { lanes: Record<string, Lane>; notDone: string[]; clips: string[]; reckoning?: string; reckoningText?: string }
  capacity: { spend: Record<string, number>; after: Record<string, number>; coda?: string }
  trials: Record<string, { answer: 'yes' | 'no'; followUp: string[] }>
  route: { years: string[][]; custom?: string }
  mark: { score?: number; missing?: string }
  summit: { message?: string }
}

const empty: Answers = emptyAnswers()

type State = {
  level: number
  answers: Answers
  startedAt: number
  enteredAt: number
  timing: { level: string; ms: number }[]
  set: <K extends keyof Answers>(k: K, v: Partial<Answers[K]>) => void
  next: () => void
  back: () => void
  goto: (i: number) => void
  reset: () => void
}

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      level: 0,
      answers: empty,
      startedAt: Date.now(),
      enteredAt: Date.now(),
      timing: [],
      set: (k, v) => set((s) => ({ answers: { ...s.answers, [k]: { ...s.answers[k], ...v } } })),
      next: () => {
        const { level, enteredAt, timing } = get()
        const now = Date.now()
        set({
          level: Math.min(level + 1, LEVELS.length - 1),
          enteredAt: now,
          timing: [...timing, { level: LEVELS[level].id, ms: now - enteredAt }],
        })
        if (typeof window !== 'undefined') window.scrollTo({ top: 0 })
      },
      back: () => {
        set({ level: Math.max(get().level - 1, 0), enteredAt: Date.now() })
        if (typeof window !== 'undefined') window.scrollTo({ top: 0 })
      },
      goto: (i) => set({ level: i, enteredAt: Date.now() }),
      reset: () => set({ level: 0, answers: empty, startedAt: Date.now(), enteredAt: Date.now(), timing: [] }),
    }),
    {
      name: 'ascent-v1',
      version: 1,
      // localStorage is attacker-controllable and survives deploys. Validate the
      // whole shape on the way in; a malformed value must not crash the app.
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<State>
        const lvl = typeof p.level === 'number' && Number.isInteger(p.level)
          ? Math.min(LEVELS.length - 1, Math.max(0, p.level))
          : 0
        return { ...current, ...p, level: lvl, answers: validateAnswers(p.answers) }
      },
    },
  ),
)
