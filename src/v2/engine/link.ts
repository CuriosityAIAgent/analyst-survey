/* Link identity, channel choice, storage and seeded order for v2.

   Copied from the proven v1 logic in src/game/store.ts and src/game/layout.ts
   (not imported, so v2 does not load the v1 store): the same link token
   (?business=&cohort=&r=), the same identity rule, the same safe storage, and
   the same viewport rule for phone versus desk. */
import type { StateStorage } from 'zustand/middleware'
import { isDeskLayout, layoutFor, layoutOverride } from '@/game/layout'
import type { Channel } from '../questions'

export type Business = 'uspb' | 'ipb' | 'solutions'
export type Token = { business?: Business; cohort?: string; code?: string }

export const BUSINESSES: { id: Business; label: string }[] = [
  { id: 'uspb', label: 'USPB' },
  { id: 'ipb', label: 'IPB' },
  { id: 'solutions', label: 'Solutions' },
]
export const COHORTS = ['2022', '2023', '2024', '2025'] as const

export const isBusiness = (v: unknown): v is Business => v === 'uspb' || v === 'ipb' || v === 'solutions'
export const isCohort = (v: unknown): v is string => typeof v === 'string' && /^202[2-5]$/.test(v)

/** Read segments from the link: ?business=uspb&cohort=2024 (or b= / c=), and the respondent code ?r=. */
export function readToken(search: string): Token {
  const q = new URLSearchParams(search)
  const b = (q.get('business') ?? q.get('b') ?? '').toLowerCase()
  const c = (q.get('cohort') ?? q.get('c') ?? '').toLowerCase()
  const t: Token = {}
  if (isBusiness(b)) t.business = b
  if (isCohort(c)) t.cohort = c
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

/** Is this a preview run: /preview, or ?preview=1 anywhere. */
export function isPreviewUrl(pathname: string, search: string): boolean {
  return pathname.replace(/\/+$/, '') === '/preview' || new URLSearchParams(search).get('preview') === '1'
}

/** The channel the viewport rule gives (layout.ts: desk and deskCompact are the
    desk channel). ?layout=phone|desk|deskCompact overrides it. */
export function channelFor(w: number, h: number, search = ''): Channel {
  const l = layoutOverride(search) ?? layoutFor(w, h)
  return isDeskLayout(l) ? 'desk' : 'phone'
}

/* localStorage when there is one (and it works: Safari private mode can
   throw on write), else memory, so the server and tests run quietly. */
const memory = new Map<string, string>()
const MEMORY: StateStorage = {
  getItem: (k) => memory.get(k) ?? null,
  setItem: (k, v) => { memory.set(k, v) },
  removeItem: (k) => { memory.delete(k) },
}
export function safeStorage(): StateStorage {
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

/* Seeded order: a pure function of (seed, key), stable across reloads. */
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
/** A number in [0,1) fixed per respondent and key. */
export function seeded(seed: number, key: string): number {
  return mulberry(seed ^ hash(key))()
}
/** A seeded Fisher-Yates order of `ids` (the recorded one if it is a valid permutation). */
export function orderFor<T extends string>(seed: number, key: string, ids: readonly T[], recorded?: unknown): T[] {
  if (Array.isArray(recorded) && recorded.length === ids.length && ids.every((x) => recorded.includes(x))) return recorded as T[]
  const rnd = mulberry(seed ^ hash(key))
  const out = [...ids]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}
