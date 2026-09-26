'use client'
/* The Ascent v2: one zustand store, persisted as 'ascent-v2-v1'.

   Where you are is (channel, cursor); what to draw is viewAt(...) in flow.ts.
   The channel ('phone' | 'desk') is decided once, at begin(), from the
   viewport, and then locked, so the question set never changes mid-way.
   Answers are keyed by each question's or follow-up's `stores`.

   Kept from v1 (src/game/store.ts), because it is proven:
   - the link token (?business=&cohort=&r=) and its identity: a different link
     in the same browser starts fresh instead of resuming someone else's answers;
   - live and preview runs never share answers: switching mode starts fresh;
   - next(from) is bound to the step it was called from, so a stale or double
     call is ignored;
   - rehydrate() validates every field and resets bad or legacy state. */
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { Answer, Channel } from '../questions'
import {
  WELCOME, clampCursor, cleanAnswers, emptyFor, expectedStores, followUpsOnPath, indexOf, isAnswer,
  nextCursor, prevCursor, previewFill, screenId, screens, viewAt,
  type Answers, type Cursor, type View,
} from './flow'
import { isBusiness, isCohort, linkId, safeStorage, type Business, type Token } from './link'
import { STORE_VERSION_KEY } from './version'

export const STORE_KEY = STORE_VERSION_KEY
const VERSION = 1
const MAX_EVENTS = 1500

export type Viewport = { w: number; h: number; pointer: 'fine' | 'coarse'; dpr: number }
export type Segment = { business?: Business; cohort?: string; source?: 'token' | 'asked' | 'mixed' }
export type V2Event = { t: number; step: string; type: string; [k: string]: unknown }

export type V2State = {
  started: boolean
  finished: boolean
  /** Locked at begin(); null before. */
  channel: Channel | null
  viewport: Viewport | null
  cursor: Cursor
  /** Keyed by `stores` (and `<stores>.order`). */
  answers: Answers
  /** Business and class: from the link, or asked on the welcome. */
  segment: Segment
  events: V2Event[]
  /** ms per step key ('welcome', 'q1.2', 'q1.1.what', 'break:job-ahead', 'scene'), summed over visits. */
  timing: Record<string, number>
  enteredAt: number
  tStart: number | null
  tEnd: number | null
  seed: number
  /** Which link this saved session belongs to (linkId). */
  link: string
  /** Which kind of run is saved: a preview run never leaks into a live one, or back. */
  mode: 'live' | 'preview'
  /** Not persisted: this visit is a preview (/preview or ?preview=1). */
  preview: boolean
  /** Not persisted: from the link. */
  token: Token

  setToken: (t: Token) => void
  setPreview: (on: boolean) => void
  /** Welcome fallback: pick business or class when the link lacks them. */
  setSegment: (patch: { business?: Business; cohort?: string }) => void
  /** Start (or, after Back to the welcome, carry on): locks the channel on the first call. */
  begin: (channel: Channel, viewport?: Viewport | null) => void
  set: (stores: string, v: Answer) => void
  /** Log an event. With type 'order' and data.order (a list of ids), also keep the order under `<stores>.order`. */
  log: (type: string, data?: Record<string, unknown>, stores?: string) => void
  /** Advance from the current step. Pass the step key you are advancing FROM; a stale call is ignored. */
  next: (from?: string) => void
  back: (from?: string) => void
  reset: () => void
}

const newSeed = () => (Math.random() * 2 ** 31) | 0

const fresh = () => ({
  started: false,
  finished: false,
  channel: null as Channel | null,
  viewport: null as Viewport | null,
  cursor: WELCOME,
  answers: {} as Answers,
  segment: {} as Segment,
  events: [] as V2Event[],
  timing: {} as Record<string, number>,
  enteredAt: Date.now(),
  tStart: null as number | null,
  tEnd: null as number | null,
  seed: newSeed(),
  link: '',
})

/** The view for a state (the Player draws this). */
export function viewOf(s: Pick<V2State, 'channel' | 'cursor' | 'answers' | 'preview' | 'finished' | 'started'>): View {
  if (!s.started || !s.channel) return { kind: 'welcome', key: 'welcome' }
  return viewAt(s.channel, s.cursor, s.answers, s.preview, s.finished)
}
export const stepOf = (s: Parameters<typeof viewOf>[0]) => viewOf(s).key

/** Does the welcome still need to ask for business or class? */
export function segmentMissing(s: Pick<V2State, 'token' | 'segment'>): { business: boolean; cohort: boolean } {
  return { business: !s.token.business && !s.segment.business, cohort: !s.token.cohort && !s.segment.cohort }
}
/** Which pickers the welcome shows: only what the link lacks. */
export function segmentAsked(t: Token): { business: boolean; cohort: boolean } {
  return { business: !t.business, cohort: !t.cohort }
}

export const useV2 = create<V2State>()(
  persist(
    (setState, get) => {
      const hasData = (s: V2State) => s.started || Object.keys(s.answers).length > 0 || !!s.segment.business || !!s.segment.cohort

      /** Close out the time on the current step, log the move, then apply `patch`. */
      const move = (patch: Partial<V2State>, type: string) => {
        const s = get()
        const from = stepOf(s)
        const now = Date.now()
        const timing = { ...s.timing, [from]: (s.timing[from] ?? 0) + (now - s.enteredAt) }
        const to = stepOf({ ...s, ...patch })
        const ev = event(s, type, { from, to, ms: now - s.enteredAt })
        setState({ ...patch, timing, enteredAt: now, events: cap([...s.events, ev]) })
      }

      return {
        ...fresh(),
        preview: false,
        mode: 'live' as const,
        token: {},

        setToken: (t) => {
          const id = linkId(t)
          const s = get()
          // A link whose identity differs from the saved session's is a different
          // respondent: start over. The same link, or a bare URL, resumes.
          if (id && s.link !== id && hasData(s)) {
            setState({ ...fresh(), token: t, link: id })
            return
          }
          setState(id ? { token: t, link: id } : { token: t })
        },

        setPreview: (on) => {
          const mode = on ? 'preview' as const : 'live' as const
          const s = get()
          // switching between a preview run and a live one starts fresh, so sample
          // answers never appear in a real response (or the reverse)
          if (s.mode !== mode && hasData(s)) {
            setState({ ...fresh(), token: s.token, link: s.link, preview: on, mode })
            return
          }
          setState({ preview: on, mode })
        },

        setSegment: (patch) => setState((s) => {
          const seg = { ...s.segment }
          if (patch.business !== undefined && isBusiness(patch.business)) seg.business = patch.business
          if (patch.cohort !== undefined && isCohort(patch.cohort)) seg.cohort = patch.cohort
          return { segment: seg }
        }),

        begin: (channel, viewport) => {
          const s = get()
          if (s.finished) return
          if (s.started && s.channel) {
            // back at the welcome after Back: carry on with the same channel
            if (s.cursor.screen < 0) move({ cursor: { screen: 0, fu: -1 } }, 'screen')
            return
          }
          const t = s.token
          const business = t.business ?? s.segment.business
          const cohort = t.cohort ?? s.segment.cohort
          const fromToken = (t.business ? 1 : 0) + (t.cohort ? 1 : 0)
          const source = fromToken === 2 ? 'token' as const : fromToken === 0 ? 'asked' as const : 'mixed' as const
          const now = Date.now()
          move({
            started: true, channel, viewport: viewport ?? null, cursor: { screen: 0, fu: -1 },
            segment: { business, cohort, source }, tStart: now,
          }, 'begin')
        },

        set: (stores, v) => {
          if (!isAnswer(v)) return
          setState((s) => ({ answers: { ...s.answers, [stores]: v } }))
        },

        log: (type, data, stores) => setState((s) => {
          const patch: Partial<V2State> = { events: cap([...s.events, event(s, type, data)]) }
          const order = data?.order
          if (type === 'order' && stores && Array.isArray(order) && order.every((x) => typeof x === 'string')) {
            patch.answers = { ...s.answers, [`${stores}.order`]: order as string[] }
          }
          return patch
        }),

        next: (from) => {
          const s = get()
          if (from !== undefined && from !== stepOf(s)) return
          if (s.finished || !s.started || !s.channel) return
          const view = viewOf(s)
          let answers = s.answers
          // an optional question passed untouched stores an empty answer, so
          // "seen and skipped" differs from "never reached"
          if ((view.kind === 'question' || view.kind === 'follow') && answers[view.q.stores] === undefined && !s.preview) {
            const e = emptyFor(view.q)
            if (e !== undefined) answers = { ...answers, [view.q.stores]: e }
          }
          if (view.kind === 'scene' && answers[view.q.stores] === undefined) answers = { ...answers, [view.q.stores]: 'seen' }
          const to = nextCursor(s.channel, s.cursor, answers, s.preview)
          if (to === 'end') {
            move({ answers, finished: true, tEnd: Date.now() }, 'finish')
            return
          }
          // preview: a follow-up whose options come from a blank parent gets a sample parent
          if (s.preview) {
            const v = viewAt(s.channel, to, answers, true)
            if (v.kind === 'follow') {
              const fill = previewFill(v.parent, v.f, answers)
              if (fill) answers = { ...answers, ...fill }
            }
          }
          const type = to.screen === s.cursor.screen ? 'follow-up' : 'screen'
          move({ answers, cursor: to }, type)
        },

        back: (from) => {
          const s = get()
          if (from !== undefined && from !== stepOf(s)) return
          if (s.finished || !s.started || !s.channel) return
          const to = prevCursor(s.channel, s.cursor, s.answers, s.preview)
          if (!to) return
          move({ cursor: to }, 'back')
        },

        reset: () => setState({ ...fresh() }),
      }
    },
    {
      name: STORE_KEY,
      version: VERSION,
      storage: createJSONStorage(safeStorage),
      partialize: (s) => ({
        started: s.started, finished: s.finished, channel: s.channel, viewport: s.viewport,
        cursor: s.cursor, cursorId: s.channel && s.cursor.screen >= 0 ? screenId(screens(s.channel)[s.cursor.screen]) : null,
        answers: s.answers, segment: s.segment, events: s.events, timing: s.timing,
        tStart: s.tStart, tEnd: s.tEnd, seed: s.seed, link: s.link, mode: s.mode,
      }),
      // an older or unknown version is legacy: start fresh
      migrate: () => ({}),
      merge: (persisted, current) => ({ ...current, ...rehydrate(persisted, current.preview) }),
      // persist writes only on set(); write once so a seed minted during hydration survives a reload
      onRehydrateStorage: () => (state) => {
        if (state) queueMicrotask(() => useV2.setState({ seed: state.seed, enteredAt: Date.now() }))
      },
    },
  ),
)

function cap(ev: V2Event[]) { return ev.length > MAX_EVENTS ? ev.slice(ev.length - MAX_EVENTS) : ev }

function event(s: V2State, type: string, data?: Record<string, unknown>): V2Event {
  return { ...(data ?? {}), t: s.tStart ? Date.now() - s.tStart : 0, step: stepOf(s), type }
}

/* ---------------------------------------------------------------- rehydrate

   Pure, so it is tested. Whatever was in localStorage, the result is a state
   the game can render and move on from. */
export function rehydrate(persisted: unknown, preview = false) {
  const p = (persisted && typeof persisted === 'object' && !Array.isArray(persisted) ? persisted : {}) as Record<string, unknown>
  const base = {
    seed: Number.isInteger(p.seed) ? (p.seed as number) : newSeed(),
    link: typeof p.link === 'string' ? p.link.slice(0, 120) : '',
    mode: p.mode === 'preview' ? 'preview' as const : 'live' as const,
    enteredAt: Date.now(),
  }
  const empty = { ...fresh(), ...base }

  // segment: a value saved under older rules (a class year before 2022, or
  // 'Other' as business) is legacy. Start fresh rather than lose it silently.
  const rs = (p.segment && typeof p.segment === 'object' ? p.segment : {}) as Record<string, unknown>
  if ((rs.business != null && !isBusiness(rs.business)) || (rs.cohort != null && !isCohort(rs.cohort))) return empty
  const segment: Segment = {}
  if (isBusiness(rs.business)) segment.business = rs.business
  if (isCohort(rs.cohort)) segment.cohort = rs.cohort
  if (rs.source === 'token' || rs.source === 'asked' || rs.source === 'mixed') segment.source = rs.source

  const answers = cleanAnswers(p.answers)
  const started = p.started === true
  const channel: Channel | null = p.channel === 'phone' || p.channel === 'desk' ? p.channel : null
  // started without a channel (or a v1-shaped session) cannot be placed: start fresh
  if (started && !channel) return empty

  let cursor: Cursor = WELCOME
  if (started && channel) {
    const c = (p.cursor && typeof p.cursor === 'object' ? p.cursor : {}) as Record<string, unknown>
    let screen = Number.isInteger(c.screen) ? (c.screen as number) : 0
    // the saved screen id wins over its index, so a reordered script still lands on the same question
    if (typeof p.cursorId === 'string') {
      const at = indexOf(channel, p.cursorId)
      if (at >= 0) screen = at
    }
    const fu = Number.isInteger(c.fu) ? (c.fu as number) : -1
    cursor = clampCursor(channel, { screen, fu }, answers, preview || base.mode === 'preview')
  }

  const events = Array.isArray(p.events)
    ? (p.events.filter((e) => e && typeof e === 'object' && typeof (e as V2Event).type === 'string') as V2Event[]).slice(-MAX_EVENTS)
    : []
  const timing: Record<string, number> = {}
  if (p.timing && typeof p.timing === 'object' && !Array.isArray(p.timing)) {
    for (const [k, v] of Object.entries(p.timing)) if (typeof v === 'number' && Number.isFinite(v) && k.length <= 80) timing[k] = v
  }
  const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : null)
  return {
    ...base,
    started,
    finished: started && p.finished === true,
    channel: started ? channel : null,
    viewport: cleanViewport(p.viewport),
    cursor,
    answers,
    segment,
    events,
    timing,
    tStart: num(p.tStart),
    tEnd: num(p.tEnd),
  }
}

export function cleanViewport(v: unknown): Viewport | null {
  if (!v || typeof v !== 'object') return null
  const x = v as Record<string, unknown>
  const num = (n: unknown) => typeof n === 'number' && Number.isFinite(n) && n >= 0 && n < 100000
  if (!num(x.w) || !num(x.h) || !num(x.dpr) || (x.pointer !== 'fine' && x.pointer !== 'coarse')) return null
  return { w: x.w as number, h: x.h as number, pointer: x.pointer, dpr: x.dpr as number }
}

/* ---------------------------------------------------------------- response

   What analysis gets. Follow-ups answered on a branch the respondent later
   backed out of stay in `answers` but are not in `followUpsOnPath`. */
export function response(s: Pick<V2State, 'answers' | 'segment' | 'events' | 'timing' | 'seed' | 'channel' | 'viewport' | 'mode' | 'tStart' | 'tEnd' | 'link' | 'finished'> & { token?: Token }) {
  const ch = s.channel
  return {
    version: STORE_KEY,
    mode: s.mode,
    /** The respondent code from the link (?r=), which the server files the response under. */
    code: s.token?.code ?? null,
    link: s.link,
    finished: s.finished,
    segment: s.segment,
    answers: s.answers,
    followUpsOnPath: ch ? followUpsOnPath(ch, s.answers) : [],
    missing: ch ? expectedStores(ch, s.answers).filter((k) => s.answers[k] === undefined) : [],
    events: s.events,
    timing: s.timing,
    seed: s.seed,
    meta: { channel: ch, viewport: s.viewport, tStart: s.tStart, tEnd: s.tEnd },
  }
}
