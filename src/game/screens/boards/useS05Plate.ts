'use client'
/* useS05Plate: the S05 brick plate ("The navigation kit") behind both views,
   the phone plate in S05.tsx and the desk plate in S05Desk.tsx (design 5,
   S05 build: "Extract useS05Plate(p)"). One place for the lane rules, support
   and wobble, kit.* store writes, logging and peeks.

   Peek semantics (design 9.1): kit.peeks records only EXPLICIT peeks (the (i)
   button, the I or ? key, a long-press), on both channels. On desk, hovering
   or focusing a brick shows its description in the panel; that read is
   logged as a separate 'peek-hover' event and never touches kit.peeks. */
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { items, routePrecision, zones } from '../../content'
import { buzz, sfx, useSnap } from '../../feel'
import { useDrag, type DropVia } from '../../useDrag'
import { useOrder } from '../../store'
import { useGameCtx } from '../../context'
import { PLATE } from '../../art/nav'
import type { BrickId, KitEvent, Lane, StepProps } from '../../types'

export type Brick = { id: BrickId; label: string; art: string; sub: string; peek: string; rung: number }
export const BRICKS: Brick[] = items('S05').map((it) => ({
  id: it.id as BrickId,
  label: it.label,
  art: String(it.art),
  sub: String(it.sub ?? ''),
  peek: String(it.peek ?? ''),
  rung: Number(it.rung),
}))
export const BY_ID = new Map(BRICKS.map((b) => [b.id, b]))
export const BRICK_IDS = BRICKS.map((b) => b.id)
const ZONE = new Map(zones('S05').map((z) => [z.id, z]))
export const LANE_LABEL = (id: string) => ZONE.get(id)?.label ?? (id === 'tray' ? 'the tray' : id)
export const LANES: Lane[] = ['day1', 'proven', 'none']
/** Desk keys: [1] Day one, [2] Once proven, [3] Not for them; Delete takes it back. */
export const S05_KEYS: Record<string, string> = { 1: 'day1', 2: 'proven', 3: 'none', Delete: 'tray', Backspace: 'tray' }
/** Plain first: 'LLM chat · Paper map'. */
export const plainName = (b: Brick) => (b.sub ? `${b.sub} · ${b.label}` : b.label)

export type LaneMap = Partial<Record<BrickId, Lane>>

/* ------------------------------------------------------------------ pure rules */

/** Rungs available in a lane: its own bricks plus every earlier lane's. */
export function available(lanes: LaneMap, lane: 'day1' | 'proven'): Set<number> {
  const s = new Set<number>()
  for (const b of BRICKS) {
    const l = lanes[b.id]
    if (l === 'day1' || (lane === 'proven' && l === 'proven')) s.add(b.rung)
  }
  return s
}
/** kit.cut: how many contiguous rungs from the bottom each lane has. */
export function cutOf(lanes: LaneMap): { day1: number; proven: number } {
  const run = (s: Set<number>) => { let k = 0; while (s.has(k + 1)) k++; return k }
  return { day1: run(available(lanes, 'day1')), proven: run(available(lanes, 'proven')) }
}
/** kit.unsupported: bricks in a lane with a missing rung somewhere below. */
export function unsupportedOf(lanes: LaneMap): BrickId[] {
  const cut = cutOf(lanes)
  return BRICKS.filter((b) => {
    const l = lanes[b.id]
    return (l === 'day1' || l === 'proven') && b.rung > cut[l] + 1
  }).map((b) => b.id)
}
/** Is the rung row under `rung` filled in this lane (own or an earlier lane)? */
export function occupied(m: LaneMap, lane: 'day1' | 'proven', rung: number) {
  const b = BRICKS.find((x) => x.rung === rung)!
  const l = m[b.id]
  return l === 'day1' || (lane === 'proven' && l === 'proven')
}
/** The answers one placement stores (same on both channels). */
export function placeAnswers(lanes: LaneMap, id: BrickId, lane: Lane | null, ev: KitEvent, events: KitEvent[] = []) {
  const next: LaneMap = { ...lanes }
  if (lane) next[id] = lane
  else delete next[id]
  return {
    'kit.lane': next,
    'kit.cut': cutOf(next),
    'kit.unsupported': unsupportedOf(next),
    'kit.events': [...events, ev].slice(-500),
  }
}

function lastIndex(events: KitEvent[], id: BrickId) {
  for (let i = events.length - 1; i >= 0; i--) if (events[i].brick === id) return i
  return -1
}

/* ------------------------------------------------------------------ the hook */

export function useS05Plate(p: StepProps, opts: { desk?: boolean } = {}) {
  const ctx = useGameCtx()
  const order = useOrder('kit.order', BRICK_IDS)
  const lanes: LaneMap = useMemo(() => p.answers['kit.lane'] ?? {}, [p.answers])
  const unsupported = useMemo(() => unsupportedOf(lanes), [lanes])
  const precision = routePrecision(lanes)
  const placedAll = BRICK_IDS.every((id) => !!lanes[id])
  const placedCount = BRICK_IDS.filter((id) => !!lanes[id]).length

  const t0 = useRef(typeof performance !== 'undefined' ? performance.now() : 0)
  const stageRef = useRef<HTMLDivElement | null>(null)
  const capture = useSnap(stageRef, p.reduced)

  /* ---- peek card (explicit reads: kit.peeks) */
  const [peek, setPeek] = useState<BrickId | null>(null)
  const openPeek = (id: BrickId, via: string) => {
    setPeek(id)
    p.set('kit.peeks', [...(p.answers['kit.peeks'] ?? []), id].slice(-100))
    p.log('peek', { brick: id, via })
  }
  useEffect(() => {
    if (!peek) return
    const t = window.setTimeout(() => setPeek(null), 5200)
    return () => clearTimeout(t)
  }, [peek])

  /* ---- wobble + the one-time caption */
  const wobbleNext = useRef<BrickId[]>([])
  const captionShown = useRef(false)
  const [caption, setCaption] = useState<{ lane: 'day1' | 'proven'; row: number } | null>(null)
  useEffect(() => {
    if (!caption) return
    const t = window.setTimeout(() => setCaption(null), 3200)
    return () => clearTimeout(t)
  }, [caption])
  useLayoutEffect(() => {
    if (!wobbleNext.current.length) return
    const ids = wobbleNext.current
    wobbleNext.current = []
    if (p.reduced) return
    for (const id of ids) {
      const el = stageRef.current?.querySelector<HTMLElement>(`[data-item="${id}"] [data-wobble]`)
      el?.animate?.(
        [
          { transform: 'rotate(-2deg)' }, { transform: 'rotate(3.5deg)' }, { transform: 'rotate(-4deg)' },
          { transform: 'rotate(2.5deg)' }, { transform: 'rotate(-2deg)' },
        ],
        { duration: 620, delay: 170, easing: 'ease-in-out' },
      )
    }
  })

  /* ---- placing */
  const place = (id: BrickId, lane: Lane | null, via: DropVia) => {
    const before = lanes[id] ?? null
    capture(id)
    if (before === lane) return
    const ev: KitEvent = { t: Math.round(performance.now() - t0.current), brick: id, to: lane, via }
    const patch = placeAnswers(lanes, id, lane, ev, p.answers['kit.events'] ?? [])
    const next = patch['kit.lane']
    const uns = patch['kit.unsupported']
    const newly = uns.filter((x) => !unsupported.includes(x))
    p.setMany(patch)
    p.log('drop', { item: id, zone: lane ?? 'tray', from: before ?? 'tray', via, unsupported: uns.includes(id) })
    if (lane) { buzz(); sfx('stud', ctx.sound, { pitch: lane === 'none' ? 0.6 : 1 }) }
    wobbleNext.current = newly
    // the caption, once: in the empty row under the first newly floating brick
    if (!captionShown.current && newly.length) {
      const b = BY_ID.get(newly.includes(id) ? id : newly[0])!
      const l = next[b.id] as 'day1' | 'proven'
      let r = b.rung - 1
      while (r >= 1 && occupied(next, l, r)) r--
      if (r >= 1) { captionShown.current = true; setCaption({ lane: l, row: r }) }
    }
  }

  const d = useDrag({
    disabled: p.covered,
    zones: ['day1', 'proven', 'none', 'tray'],
    hotkeys: opts.desk ? S05_KEYS : undefined,
    labelOf: (id) => {
      const b = BY_ID.get(id as BrickId)
      return b ? `${b.sub}, ${b.label}` : LANE_LABEL(id)
    },
    onLongPress: (item) => openPeek(item as BrickId, 'longpress'),
    onLift: () => setPeek(null),
    onDrop: (item, zone, via) => {
      if (zone === null) return false
      place(item as BrickId, zone === 'tray' ? null : (zone as Lane), via)
    },
  })

  /* ---- desk: the brick you're on. Its description shows in the panel
     (logged 'peek-hover' after a short dwell, never in kit.peeks), and [I]
     reads it explicitly (a real peek). */
  const onBrick = d.active && BY_ID.has(d.active as BrickId) ? (d.active as BrickId) : null
  const hoverVia = d.lifted ? null : d.active === d.hovered ? 'hover' : 'focus'
  useEffect(() => {
    if (!opts.desk || !onBrick || !hoverVia) return
    const t = window.setTimeout(() => p.log('peek-hover', { brick: onBrick, via: hoverVia }), 400)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opts.desk, onBrick, hoverVia])
  const onBrickRef = useRef(onBrick)
  onBrickRef.current = onBrick
  const openRef = useRef(openPeek)
  openRef.current = openPeek
  useEffect(() => {
    if (!opts.desk || p.covered) return
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey || e.isComposing) return
      if (e.key !== 'i' && e.key !== 'I') return
      const a = document.activeElement as HTMLElement | null
      if (a && (a.tagName === 'INPUT' || a.tagName === 'TEXTAREA' || a.isContentEditable)) return
      if (document.querySelector('[aria-modal="true"]')) return
      const id = onBrickRef.current
      if (!id) return
      e.preventDefault()
      openRef.current(id, 'key')
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [opts.desk, p.covered])

  // the crate keeps the order bricks went in
  const events = p.answers['kit.events'] ?? []
  const crateOrder = BRICK_IDS.filter((id) => lanes[id] === 'none')
    .sort((a, b) => lastIndex(events, a) - lastIndex(events, b))

  const onContinue = () => {
    // kit.peeks is a list: record the empty one when no card was opened
    if (!p.answers['kit.peeks']) p.set('kit.peeks', [])
    p.next()
  }

  return {
    order, lanes, unsupported, precision, placedAll, placedCount, stageRef, d,
    peek, setPeek, openPeek, caption, crateOrder, onContinue, onBrick,
    day1Count: BRICK_IDS.filter((id) => lanes[id] === 'day1').length,
  }
}

export type S05Plate = ReturnType<typeof useS05Plate>
export { PLATE }
