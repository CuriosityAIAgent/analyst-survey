'use client'
/* The Ascent (game): one zustand store, persisted as 'ascent-game-v1'.

   Navigation is a pure function of (screen, beat, sheet, answers): next() and
   back() walk the spec order, so there is no history stack to go stale. Back
   never deletes an answer. On rehydrate every field is validated before it is
   trusted (patterns from src/flow/store.ts): unknown keys and bad values are
   dropped, an impossible position falls back to a real one, and a sheet is
   only restored if the rules would open it for the answers we still hold. */
import { useEffect, useMemo } from 'react'
import { create } from 'zustand'
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware'
import type {
  AnswerKey, AnswerMap, Answers, BeatId, GameEvent, ScreenId, SheetId, StepId, Variant,
} from './types'
import { SCREEN_IDS, cleanAnswers, isBeatId, isScreenId, isSheetId, specBeats, step } from './content'
import { followupFor, needsSegment } from './rules'

export type OpenSheet = { id: SheetId; variant?: Variant }
export type Token = { business?: Answers['segment.business']; cohort?: string; code?: string }

export type GameState = {
  started: boolean
  finished: boolean
  screen: ScreenId
  beat: BeatId
  sheet: OpenSheet | null
  answers: AnswerMap
  events: GameEvent[]
  /** ms spent per step key ('S02', 'S04#B', 'F3a'), summed over visits. */
  timing: Record<string, number>
  enteredAt: number
  seed: number
  sound: boolean
  /** Bumped by back(): lets transient widgets (the camp-walk strip) reset. */
  visit: number
  /** From the link (?business=&cohort=&r=); not persisted. */
  token: Token
  /** Which link this saved session belongs to (see linkId). Persisted, so a
      different respondent opening their own link in the same browser starts
      fresh instead of resuming someone else's answers. */
  link: string

  begin: () => void
  set: <K extends AnswerKey>(key: K, value: Answers[K]) => void
  setMany: (patch: AnswerMap) => void
  unset: (key: AnswerKey) => void
  log: (type: string, data?: Record<string, unknown>) => void
  /** Advance from the current step. Pass the step key you are advancing FROM;
      the call is ignored if the game has already moved on. */
  next: (from?: string) => void
  back: () => void
  openSheet: (id: SheetId, variant?: Variant) => void
  closeSheet: () => void
  /** Dev: put the game at any screen/beat/sheet. */
  jump: (screen: ScreenId, beat?: BeatId, sheet?: OpenSheet | null) => void
  setToken: (t: Token) => void
  toggleSound: () => void
  reset: () => void
}

const MAX_EVENTS = 1500
const newSeed = () => (Math.random() * 2 ** 31) | 0

/** The beats SHOWN for a screen: S01 Beat B only when the token lacked segments. */
export function beatsFor(screen: ScreenId, a: AnswerMap): BeatId[] {
  if (screen === 'S01') return needsSegment(a) ? ['A', 'B'] : ['A']
  return specBeats(screen)
}

/** 'S02', 'S04#B', or the sheet id. Used for timing, logging and next(from). */
export function stepKey(s: Pick<GameState, 'screen' | 'beat' | 'sheet'>): string {
  if (s.sheet) return s.sheet.id
  return specBeats(s.screen).length > 1 ? `${s.screen}#${s.beat}` : s.screen
}
export const currentStep = (s: Pick<GameState, 'screen' | 'sheet'>): StepId => s.sheet?.id ?? s.screen

const fresh = () => ({
  started: false,
  finished: false,
  screen: 'S01' as ScreenId,
  beat: 'A' as BeatId,
  sheet: null,
  answers: {},
  events: [],
  timing: {},
  enteredAt: Date.now(),
  seed: newSeed(),
  sound: false,
  visit: 0,
  link: '',
})

export const useGame = create<GameState>()(
  persist(
    (setState, get) => {
      /** Close out the time on the current step, then apply `patch`. */
      const move = (patch: Partial<GameState>, type: string) => {
        const s = get()
        const key = stepKey(s)
        const now = Date.now()
        const timing = { ...s.timing, [key]: (s.timing[key] ?? 0) + (now - s.enteredAt) }
        const nextState = { ...s, ...patch }
        const ev = event(s, type, { from: key, to: stepKey(nextState), ms: now - s.enteredAt })
        setState({ ...patch, timing, enteredAt: now, events: cap([...s.events, ev]) })
      }

      return {
        ...fresh(),
        token: {},

        begin: () => {
          const s = get()
          if (s.started) return
          const tok = s.token
          const a: AnswerMap = { ...s.answers, 't.start': Date.now(), consent: true, 'variant.seed': s.seed }
          if (tok.business && tok.cohort) {
            a['segment.business'] = tok.business
            a['segment.cohort'] = tok.cohort
            a['segment.source'] = 'token'
          }
          setState({ started: true, answers: a })
        },

        set: (key, value) => setState((s) => ({ answers: { ...s.answers, [key]: value } })),
        setMany: (patch) => setState((s) => ({ answers: { ...s.answers, ...patch } })),
        unset: (key) => setState((s) => {
          if (!(key in s.answers)) return s
          const answers = { ...s.answers }
          delete answers[key]
          return { answers }
        }),

        log: (type, data) => setState((s) => ({ events: cap([...s.events, event(s, type, data)]) })),

        next: (from) => {
          const s = get()
          if (from !== undefined && from !== stepKey(s)) return
          if (s.finished) return
          if (!s.started) get().begin()
          const a = get().answers

          // a sheet is done: on to the screen after its parent
          if (s.sheet) {
            const to = step(s.sheet.id).next
            return goScreen(to, 'sheet-done')
          }
          // more beats on this screen
          const beats = beatsFor(s.screen, a)
          const i = beats.indexOf(s.beat)
          if (i >= 0 && i < beats.length - 1) return move({ beat: beats[i + 1] }, 'beat')
          // the screen is complete: a follow-up, or the next screen
          const fu = followupFor(s.screen, a)
          if (fu) {
            const answers = fu.sheet === 'F5' && fu.variant ? { ...a, 'guarantee.variant': fu.variant } : a
            const sheet: OpenSheet = fu.variant ? { id: fu.sheet, variant: fu.variant } : { id: fu.sheet }
            return move({ sheet, answers }, 'sheet-open')
          }
          goScreen(step(s.screen).next, 'screen')

          function goScreen(to: string, type: string) {
            if (to === 'end' || !isScreenId(to)) {
              return move({ sheet: null, finished: true, answers: { ...get().answers, 't.complete': Date.now() } }, 'finish')
            }
            move({ sheet: null, screen: to, beat: beatsFor(to, get().answers)[0] }, type)
          }
        },

        back: () => {
          const s = get()
          if (s.finished) return
          if (s.sheet) return move({ sheet: null, visit: s.visit + 1 }, 'back')
          const beats = beatsFor(s.screen, s.answers)
          const i = beats.indexOf(s.beat)
          if (i > 0) return move({ beat: beats[i - 1], visit: s.visit + 1 }, 'back')
          const si = SCREEN_IDS.indexOf(s.screen)
          if (si <= 0) return
          const prev = SCREEN_IDS[si - 1]
          const pb = beatsFor(prev, s.answers)
          move({ screen: prev, beat: pb[pb.length - 1], visit: s.visit + 1 }, 'back')
        },

        openSheet: (id, variant) => move({ sheet: { id, variant } }, 'sheet-open'),
        closeSheet: () => move({ sheet: null }, 'sheet-close'),

        jump: (screen, beat, sheet) => {
          const beats = beatsFor(screen, get().answers)
          const b = beat && specBeats(screen).includes(beat) ? beat : beats[0]
          move({ started: true, finished: false, screen, beat: b, sheet: sheet ?? null }, 'jump')
        },

        setToken: (t) => {
          const id = linkId(t)
          const s = get()
          // A link with an identity that differs from the saved session's is a
          // different respondent: start over. The same link (or a bare URL, which
          // carries no identity to compare) resumes.
          if (id && s.link !== id && (s.started || Object.keys(s.answers).length > 0)) {
            setState({ ...fresh(), token: t, link: id })
            return
          }
          setState(id ? { token: t, link: id } : { token: t })
        },
        toggleSound: () => setState((s) => ({ sound: !s.sound })),
        reset: () => setState({ ...fresh() }),
      }
    },
    {
      name: 'ascent-game-v1',
      version: 1,
      storage: createJSONStorage(safeStorage),
      partialize: (s) => ({
        started: s.started, finished: s.finished, screen: s.screen, beat: s.beat, sheet: s.sheet,
        answers: s.answers, events: s.events, timing: s.timing, seed: s.seed, sound: s.sound, link: s.link,
      }),
      merge: (persisted, current) => ({ ...current, ...rehydrate(persisted) }),
      // persist writes only on set(); write once so a seed minted during
      // hydration survives a reload before the first tap
      onRehydrateStorage: () => (state) => {
        if (state) queueMicrotask(() => useGame.setState({ seed: state.seed, enteredAt: Date.now() }))
      },
    },
  ),
)

/* localStorage when there is one (and it works: Safari private mode can
   throw on write), else memory, so the server and tests run quietly. */
const memory = new Map<string, string>()
const MEMORY: StateStorage = {
  getItem: (k) => memory.get(k) ?? null,
  setItem: (k, v) => { memory.set(k, v) },
  removeItem: (k) => { memory.delete(k) },
}
function safeStorage(): StateStorage {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return MEMORY
    const ls = window.localStorage
    return {
      // a malformed value reads as empty rather than failing hydration
      getItem: (k) => { try { const v = ls.getItem(k); if (v !== null) JSON.parse(v); return v } catch { return null } },
      setItem: (k, v) => { try { ls.setItem(k, v) } catch { memory.set(k, v) } },
      removeItem: (k) => { try { ls.removeItem(k) } catch { /* ignore */ } },
    }
  } catch { return MEMORY }
}

function cap(ev: GameEvent[]) { return ev.length > MAX_EVENTS ? ev.slice(ev.length - MAX_EVENTS) : ev }

function event(s: Pick<GameState, 'answers' | 'screen' | 'beat' | 'sheet'>, type: string, data?: Record<string, unknown>): GameEvent {
  const t0 = s.answers['t.start']
  return { ...(data ?? {}), t: typeof t0 === 'number' ? Date.now() - t0 : 0, step: stepKey(s), type }
}

/* ---------------------------------------------------------------- rehydrate

   Pure, so it is tested (store.test.ts). Whatever was in localStorage, the
   result is a state the game can render and move on from. */
export function rehydrate(persisted: unknown) {
  const p = (persisted && typeof persisted === 'object' ? persisted : {}) as Record<string, unknown>
  const answers = cleanAnswers(p.answers)
  const started = p.started === true
  let screen: ScreenId = started && isScreenId(p.screen) ? p.screen : 'S01'
  const beats = beatsFor(screen, answers)
  let beat: BeatId = isBeatId(p.beat) && beats.includes(p.beat) ? p.beat : beats[0]
  if (!started) { screen = 'S01'; beat = 'A' }

  // a sheet is restored only if it belongs to this screen and the rules,
  // run on the answers we kept, would open exactly it
  let sheet: OpenSheet | null = null
  const ps = p.sheet as { id?: unknown } | null | undefined
  if (started && ps && isSheetId(ps.id) && step(ps.id).parent === screen && beat === beats[beats.length - 1]) {
    const fu = followupFor(screen, answers)
    if (fu && fu.sheet === ps.id) sheet = fu.variant ? { id: fu.sheet, variant: fu.variant } : { id: fu.sheet }
  }

  const events = Array.isArray(p.events)
    ? (p.events.filter((e) => e && typeof e === 'object' && typeof (e as GameEvent).type === 'string') as GameEvent[]).slice(-MAX_EVENTS)
    : []
  const timing: Record<string, number> = {}
  if (p.timing && typeof p.timing === 'object' && !Array.isArray(p.timing)) {
    for (const [k, v] of Object.entries(p.timing)) if (typeof v === 'number' && Number.isFinite(v)) timing[k] = v
  }
  return {
    started,
    finished: started && p.finished === true && screen === 'S11',
    screen,
    beat,
    sheet,
    answers,
    events,
    timing,
    seed: Number.isInteger(p.seed) ? (p.seed as number) : newSeed(),
    sound: p.sound === true,
    link: typeof p.link === 'string' ? p.link.slice(0, 120) : '',
    enteredAt: Date.now(),
  }
}

/* ---------------------------------------------------------------- seeded order

   Tray and card orders are randomised per respondent and logged. The order is
   a pure function of (seed, key), so it is stable across reloads even before
   it is recorded; useOrder records it in `answers[key]` once. */

export type OrderKey = 'tray.order' | 'kit.order' | 'pitch.order' | 'calls.order' | 'traits.order'
type Elem<K extends OrderKey> = Answers[K][number]

function hash(s: string) {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) }
  return h >>> 0
}
function mulberry(a: number) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** A number in [0,1) fixed per respondent and key (e.g. which side is 'born'). */
export function seeded(seed: number, key: string): number {
  return mulberry(seed ^ hash(key))()
}

/** The order for `ids` under this seed: the recorded one if it is a valid
    permutation, else a seeded Fisher-Yates shuffle. Pure. */
export function orderFor<T extends string>(seed: number, key: string, ids: readonly T[], recorded?: unknown): T[] {
  if (Array.isArray(recorded) && recorded.length === ids.length && ids.every((x) => recorded.includes(x))) {
    return recorded as T[]
  }
  const rnd = mulberry(seed ^ hash(key))
  const out = [...ids]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/** Hook: the per-respondent order for a tray or deck, recorded in answers. */
export function useOrder<K extends OrderKey>(key: K, ids: readonly Elem<K>[]): Elem<K>[] {
  const seed = useGame((s) => s.seed)
  const recorded = useGame((s) => s.answers[key])
  const idsKey = ids.join('|')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const order = useMemo(() => orderFor(seed, key, ids, recorded), [seed, key, idsKey, recorded])
  useEffect(() => {
    if (recorded !== order) {
      const same = Array.isArray(recorded) && recorded.join('|') === order.join('|')
      if (!same) useGame.getState().set(key, order as Answers[K])
    }
  }, [key, order, recorded])
  return order
}

/** Hook: seeded(seed, key) for the current respondent. */
export function useSeeded(key: string): number {
  const seed = useGame((s) => s.seed)
  return useMemo(() => seeded(seed, key), [seed, key])
}

/* ---------------------------------------------------------------- token */

/** Read segments from the link: ?business=uspb&cohort=2021 (or b= / c=). */
export function readToken(search: string): Token {
  const q = new URLSearchParams(search)
  const b = (q.get('business') ?? q.get('b') ?? '').toLowerCase()
  const c = (q.get('cohort') ?? q.get('c') ?? '').toLowerCase()
  const t: Token = {}
  if (['uspb', 'ipb', 'solutions', 'other'].includes(b)) t.business = b as Token['business']
  if (/^(20(1[7-9]|2[0-5])|earlier)$/.test(c)) t.cohort = c
  // the respondent code People Analytics puts on each link
  const r = q.get('r') ?? q.get('code') ?? ''
  if (/^[A-Za-z0-9_-]{4,64}$/.test(r)) t.code = r
  return t
}

/** The identity a link carries: the respondent code if there is one, else its
    segments. Empty when the link carries nothing to tell respondents apart. */
export function linkId(t: Token): string {
  if (t.code) return `r:${t.code}`
  if (t.business || t.cohort) return `s:${t.business ?? ''}|${t.cohort ?? ''}`
  return ''
}

/* ---------------------------------------------------------------- response

   What analysis gets: answers, events, timing, plus which follow-up sheets
   are on the respondent's current path (a sheet answered on a branch they
   later backed out of stays in `answers` but is listed as off-path). */
export function response(s: Pick<GameState, 'answers' | 'events' | 'timing' | 'seed'>) {
  const onPath = (['S02', 'S04', 'S05', 'S07', 'S08'] as ScreenId[])
    .map((sc) => followupFor(sc, s.answers)?.sheet)
    .filter(Boolean) as SheetId[]
  return { answers: s.answers, events: s.events, timing: s.timing, seed: s.seed, sheetsOnPath: onPath }
}
