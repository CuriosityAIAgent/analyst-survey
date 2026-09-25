'use client'
/* The layout switch (design section 2): 'phone' | 'desk' | 'deskCompact'.

     desk         width >= 1360, height >= 700, width/height >= 1.3
     deskCompact  not desk; width >= 1024, height >= 560, width/height >= 1.3
     phone        everything else (today's 480px column, unchanged)

   ?layout=phone|desk|deskCompact overrides the rule for the whole visit.

   When it switches: the measured mode follows every resize, but the COMMITTED
   mode (what screens render) changes only on a step change, or once the size
   has been stable for 400ms while nothing is lifted and no pointer is down. A
   switch never lands mid-drag, so a drop is never lost; answers survive the
   remount because every screen writes on every move.

   The mode is logged ('layout' events, meta.channel in response()), never
   stored as an answer.

   Screens read it with useLayout() (or useLayoutInfo() for the pointer):
     const layout = useLayout()
     if (layout !== 'phone') return <S02Desk ... />   // a desk view
   Outside <Game> it is always 'phone'. */
import { createContext, useContext, useEffect, useRef, useState } from 'react'

export type Layout = 'phone' | 'desk' | 'deskCompact'
export const LAYOUTS: Layout[] = ['phone', 'desk', 'deskCompact']

export const DESK_MIN = { w: 1360, h: 700 }
export const COMPACT_MIN = { w: 1024, h: 560 }
export const MIN_RATIO = 1.3
/** How long the size must hold still before a resize switches the layout. */
export const SETTLE_MS = 400

/** The layout the viewport rule gives (CSS px). Pure. */
export function layoutFor(w: number, h: number): Layout {
  if (!(w > 0 && h > 0)) return 'phone'
  const wide = w / h >= MIN_RATIO
  if (wide && w >= DESK_MIN.w && h >= DESK_MIN.h) return 'desk'
  if (wide && w >= COMPACT_MIN.w && h >= COMPACT_MIN.h) return 'deskCompact'
  return 'phone'
}

/** ?layout= from a search string, or null. Pure. */
export function layoutOverride(search: string): Layout | null {
  const v = new URLSearchParams(search).get('layout')
  return v && (LAYOUTS as string[]).includes(v) ? (v as Layout) : null
}

export const isDeskLayout = (l: Layout) => l !== 'phone'

export type LayoutInfo = {
  layout: Layout
  /** desk or deskCompact. */
  desk: boolean
  compact: boolean
  /** (hover: hover) and (pointer: fine): hover lifts, grab cursors, keycaps. */
  fine: boolean
  /** Viewport when the layout was committed. */
  w: number
  h: number
}

const PHONE: LayoutInfo = { layout: 'phone', desk: false, compact: false, fine: false, w: 390, h: 660 }

export const LayoutContext = createContext<LayoutInfo>(PHONE)

/** The committed layout. 'phone' outside <Game>. */
export function useLayout(): Layout {
  return useContext(LayoutContext).layout
}
export function useLayoutInfo(): LayoutInfo {
  return useContext(LayoutContext)
}

export function infoFor(layout: Layout, fine: boolean, w: number, h: number): LayoutInfo {
  return { layout, desk: layout !== 'phone', compact: layout === 'deskCompact', fine, w, h }
}

const finePointer = () =>
  typeof window !== 'undefined' && !!window.matchMedia?.('(hover: hover) and (pointer: fine)').matches

/* ---------------------------------------------------------------- gestures

   A switch waits while a pointer is down or anything is lifted (useDrag marks
   the lifted item data-lifted="true"). Tracked once per page. */
let down = 0
let tracking = false
function trackPointers() {
  if (tracking || typeof window === 'undefined') return
  tracking = true
  const on = () => { down++ }
  const off = () => { down = Math.max(0, down - 1) }
  window.addEventListener('pointerdown', on, true)
  window.addEventListener('pointerup', off, true)
  window.addEventListener('pointercancel', off, true)
  window.addEventListener('blur', () => { down = 0 })
}
/** True while a drag, a lift or a slider gesture is in progress. */
export function gestureInProgress(): boolean {
  if (down > 0) return true
  return typeof document !== 'undefined' && !!document.querySelector('[data-lifted="true"]')
}

/** Game only: measure, and commit per the rules above. `stepKey` changes on
    every step; a pending switch lands then. `onCommit` fires on each change
    after the first. */
export function useLayoutController(stepKey: string, onCommit?: (info: LayoutInfo) => void): LayoutInfo {
  const [info, setInfo] = useState<LayoutInfo>(() => {
    if (typeof window === 'undefined') return PHONE
    const w = window.innerWidth, h = window.innerHeight
    return infoFor(layoutOverride(window.location.search) ?? layoutFor(w, h), finePointer(), w, h)
  })
  const cur = useRef(info)
  cur.current = info
  const cb = useRef(onCommit)
  cb.current = onCommit

  const commit = useRef(() => {})
  commit.current = () => {
    const w = window.innerWidth, h = window.innerHeight
    const next = layoutOverride(window.location.search) ?? layoutFor(w, h)
    const fine = finePointer()
    const c = cur.current
    if (next === c.layout && fine === c.fine) {
      if (w !== c.w || h !== c.h) setInfo(infoFor(next, fine, w, h))
      return
    }
    const i = infoFor(next, fine, w, h)
    cur.current = i
    setInfo(i)
    cb.current?.(i)
  }

  // a pending switch lands on a step change
  const first = useRef(true)
  useEffect(() => {
    if (first.current) { first.current = false; return }
    commit.current()
  }, [stepKey])

  useEffect(() => {
    trackPointers()
    let t: number | null = null
    const settle = () => {
      if (t) clearTimeout(t)
      t = window.setTimeout(function tryCommit() {
        // never mid-gesture: try again shortly
        if (gestureInProgress()) { t = window.setTimeout(tryCommit, 250); return }
        t = null
        commit.current()
      }, SETTLE_MS)
    }
    window.addEventListener('resize', settle)
    const mq = window.matchMedia?.('(hover: hover) and (pointer: fine)')
    mq?.addEventListener?.('change', settle)
    return () => {
      window.removeEventListener('resize', settle)
      mq?.removeEventListener?.('change', settle)
      if (t) clearTimeout(t)
    }
  }, [])

  return info
}
