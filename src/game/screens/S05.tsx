'use client'
/* S05 · Camp II · "The navigation kit" (mechanic: lego).

   The BrickPlate: six navy bricks, paper map (rung 1) up to expedition brief
   (rung 6). A forest rock-ledge base plate with two lanes, Day one and Once
   proven, of six rung rows each, and a narrow "Not for them" crate beside it.

   - A brick dropped on a lane snaps to its OWN rung row (map at the bottom,
     brief at the top). Any order is allowed.
   - Day-one bricks show as pale carried-forward ghosts in Once proven.
   - Support: a rung is available if it sits in the same lane or an earlier
     one. A brick whose lower rungs are not all available sits over empty
     studs with a dashed shadow and a slight tilt, wobbles once, and the first
     time only a caption says "Nothing under it yet." It stays: the view is
     recorded (kit.unsupported), not corrected.
   - Every brick has an "i" corner (tap, Enter on it, "?" on the brick, or a
     450ms long-press) that opens a one-line peek card. Logged in kit.peeks.
   - A 60px route strip above the plate sharpens as Day-one bricks go on
     (pencil, dotted, waypoints, weather and timings). The rookie stands at
     its left end and the bootprint line behind them never moves here.
   - Snap: 180ms spring from where the brick was let go, a stud click (sound
     is off by default) and an 8ms haptic where supported.

   Stores kit.lane, kit.cut, kit.unsupported, kit.peeks, kit.events live on
   every move, so Back never loses the board; kit.order logs the tray order.
   Continue reads "Start walking"; the store then opens F3a/F3b/F3c. */
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, KeyboardEvent as RKeyboardEvent } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import Frame from '../Frame'
import Figure from '../Figure'
import { Art } from '../art'
import { BRICK, CRATE, PLATE, routePoint } from '../art/nav'
import { items, zones, routePrecision } from '../content'
import { buzz, campPaper, sfx, useSnap } from '../feel'
import { useDrag, type DropVia } from '../useDrag'
import { useOrder } from '../store'
import { useGameCtx } from '../context'
import GroundBand from '../GroundBand'
import type { BrickId, KitEvent, Lane, StepProps } from '../types'

/* ------------------------------------------------------------------ content */

type Brick = { id: BrickId; label: string; art: string; sub: string; peek: string; rung: number }
const BRICKS: Brick[] = items('S05').map((it) => ({
  id: it.id as BrickId,
  label: it.label,
  art: String(it.art),
  sub: String(it.sub ?? ''),
  peek: String(it.peek ?? ''),
  rung: Number(it.rung),
}))
const BY_ID = new Map(BRICKS.map((b) => [b.id, b]))
const BRICK_IDS = BRICKS.map((b) => b.id)
const ZONE = new Map(zones('S05').map((z) => [z.id, z]))
/** The camp's warmed paper: label backings sit on it, so the scene's lines
    never run through text. */
const CAMP2_PAPER = campPaper('S05')
const LANE_LABEL = (id: string) => ZONE.get(id)?.label ?? (id === 'tray' ? 'the tray' : id)

type LaneMap = Partial<Record<BrickId, Lane>>

/* ------------------------------------------------------------------ pure rules
   Exported so tests (and S11, which draws the route "as sharp as those bricks
   allow") can share them. */

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

/* ------------------------------------------------------------------ geometry
   From the art (src/game/art/nav.tsx): the base plate is 270x224, a 20px
   lane-head strip then six 34px rung rows; lanes day1 x4 w128 and proven
   x138 w128; a brick on rung r sits at rowTop(r) + 2. The crate is 72x224.
   Everything is drawn at one scale k, so bricks sit on the art's studs. */
const PLATE_W = PLATE.w, PLATE_H = PLATE.h, HEAD = PLATE.head, ROW = PLATE.row, CRATE_W = CRATE.w, GAP = 10
const BRICK_W = BRICK.w, BRICK_H = BRICK.h
/** The drop zones split the plate down its seam. */
const ZONE_X = { day1: 0, proven: PLATE_W / 2 } as const
const ZONE_W = PLATE_W / 2
const rowTop = (rung: number) => PLATE.rowTop(rung)

/* ------------------------------------------------------------------ screen */

export default function S05(p: StepProps) {
  const ctx = useGameCtx()
  const order = useOrder('kit.order', BRICK_IDS)
  const lanes: LaneMap = useMemo(() => p.answers['kit.lane'] ?? {}, [p.answers])
  const unsupported = useMemo(() => unsupportedOf(lanes), [lanes])
  const precision = routePrecision(lanes)
  const placedAll = BRICK_IDS.every((id) => !!lanes[id])

  const t0 = useRef(typeof performance !== 'undefined' ? performance.now() : 0)
  const stageRef = useRef<HTMLDivElement | null>(null)
  const capture = useSnap(stageRef, p.reduced)

  /* ---- fit: scale the plate to the stage (no scroll at any height) */
  const [box, setBox] = useState({ w: 390, h: 468 })
  useLayoutEffect(() => {
    const el = stageRef.current
    if (!el) return
    const measure = () => setBox({ w: el.clientWidth, h: el.clientHeight })
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  const STRIP = 60, TRAY_ROW = 66, TRAY_GAP = 2
  const trayH = TRAY_ROW * 2 + TRAY_GAP
  const k = Math.max(0.72, Math.min(
    (box.w - 20 - GAP) / (PLATE_W + CRATE_W),
    (box.h - STRIP - trayH - 22) / PLATE_H,
    1.12,
  ))
  const plateW = PLATE_W * k, plateH = PLATE_H * k
  const bw = BRICK_W * k, bh = BRICK_H * k
  const fullW = plateW + GAP + CRATE_W * k
  const vgap = Math.max(6, Math.min(26, (box.h - STRIP - plateH - trayH) / 3))

  /* ---- peek card */
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
  const occupied = (m: LaneMap, lane: 'day1' | 'proven', rung: number) => {
    const b = BRICKS.find((x) => x.rung === rung)!
    const l = m[b.id]
    return l === 'day1' || (lane === 'proven' && l === 'proven')
  }

  const place = (id: BrickId, lane: Lane | null, via: DropVia) => {
    const before = lanes[id] ?? null
    capture(id)
    if (before === lane) return
    const next: LaneMap = { ...lanes }
    if (lane) next[id] = lane
    else delete next[id]
    const uns = unsupportedOf(next)
    const newly = uns.filter((x) => !unsupported.includes(x))
    const ev: KitEvent = { t: Math.round(performance.now() - t0.current), brick: id, to: lane, via }
    p.setMany({
      'kit.lane': next,
      'kit.cut': cutOf(next),
      'kit.unsupported': uns,
      'kit.events': [...(p.answers['kit.events'] ?? []), ev].slice(-500),
    })
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
    labelOf: (id) => BY_ID.get(id as BrickId)?.label ?? LANE_LABEL(id),
    onLongPress: (item) => openPeek(item as BrickId, 'longpress'),
    onLift: () => setPeek(null),
    onDrop: (item, zone, via) => {
      if (zone === null) return false
      place(item as BrickId, zone === 'tray' ? null : (zone as Lane), via)
    },
  })

  /* ---- one brick (tray, lane or crate) */
  const brick = (b: Brick, where: 'tray' | 'lane' | 'crate', style?: CSSProperties, tiltDeg = 0) => {
    const floating = where === 'lane' && unsupported.includes(b.id)
    const scale = where === 'crate' ? 0.8 : 1
    const onKeyDown = (e: RKeyboardEvent<HTMLElement>) => {
      if (e.key === '?' || (e.key === '/' && e.shiftKey)) { e.preventDefault(); openPeek(b.id, 'key') }
    }
    return (
      <div
        key={b.id}
        {...d.item(b.id, { onKeyDown, style })}
        aria-label={`${b.label}, ${b.sub}${lanes[b.id] ? `. In ${LANE_LABEL(lanes[b.id]!)}` : ''}${floating ? '. Nothing under it yet' : ''}`}
        data-testid={`brick-${b.id}`}
        data-where={where}
        data-floating={floating ? 'true' : undefined}
      >
        <div data-snap className="relative flex flex-col items-center">
          <div data-wobble style={{ transform: floating ? 'rotate(-2deg)' : tiltDeg ? `rotate(${tiltDeg}deg)` : undefined, transformOrigin: '50% 100%' }}>
            <div className="relative" style={{ width: bw * scale, height: bh * scale }}>
              <Art id={b.art} width={bw * scale} height={bh * scale} state={where === 'lane' ? 'label' : undefined} />
              <PeekButton label={b.label} onOpen={(via) => openPeek(b.id, via)} inside={where === 'crate'} />
            </div>
          </div>
          {where === 'tray' && (
            <span className="mt-[3px] flex flex-col items-center whitespace-nowrap rounded-[2px] px-[4px] font-[family-name:var(--font-ui)] text-[12px] leading-[14px]"
              style={{ background: CAMP2_PAPER }}>
              <span className="font-medium text-ink">{b.label}</span>
              <span className="text-muted">{b.sub}</span>
            </span>
          )}
        </div>
      </div>
    )
  }

  const zoneCls =
    'transition-[box-shadow,background-color] duration-150 ' +
    'data-[valid=true]:shadow-[inset_0_0_0_1.5px_rgba(20,35,59,0.5)] ' +
    'data-[over=true]:bg-[rgba(20,35,59,0.07)] data-[over=true]:shadow-[inset_0_0_0_2px_#14233B]'
  const plaque = 'pointer-events-none absolute flex items-center justify-center border border-ink bg-rule-soft font-[family-name:var(--font-ui)] font-semibold tracking-[0.04em] text-ink'

  const crate = BRICK_IDS.filter((id) => lanes[id] === 'none')
  // the crate keeps the order bricks went in
  const events = p.answers['kit.events'] ?? []
  const crateOrder = [...crate].sort((a, b) => lastIndex(events, a) - lastIndex(events, b))

  return (
    <Frame id="S05" valid={placedAll} continueLabel="Start walking" onContinue={() => {
      // kit.peeks is a list: record the empty one when no card was opened
      if (!p.answers['kit.peeks']) p.set('kit.peeks', [])
      p.next()
    }}>
      <div
        {...d.stageProps}
        ref={(el) => { d.stageProps.ref(el); stageRef.current = el }}
        className="absolute inset-0 flex flex-col items-center justify-center px-[10px]"
        style={{ ...d.stageProps.style, gap: vgap }}
        data-testid="s05-stage"
      >
        {/* ---------- the route strip, with the peek card over it */}
        <div className="relative shrink-0" style={{ height: STRIP, width: fullW }}>
          <RouteStrip precision={precision} n={BRICK_IDS.filter((id) => lanes[id] === 'day1').length} />
          <AnimatePresence>
            {peek && (
              <motion.button
                type="button"
                key={peek}
                onClick={(e) => { e.stopPropagation(); setPeek(null) }}
                onPointerDown={(e) => e.stopPropagation()}
                className="absolute inset-x-0 top-[2px] z-30 flex min-h-[56px] flex-col justify-center border border-ink bg-paper px-3 py-[6px] text-left shadow-[0_4px_12px_rgba(13,12,11,0.12)]"
                initial={p.reduced ? { opacity: 0 } : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.16 }}
                aria-live="polite"
                aria-label={`${BY_ID.get(peek)!.label}. ${BY_ID.get(peek)!.peek} Tap to close.`}
                data-testid="peek"
              >
                <span className="font-[family-name:var(--font-ui)] text-[12px] leading-[15px] tracking-[0.04em] text-navy">
                  <b className="font-semibold">{BY_ID.get(peek)!.label}</b> · {BY_ID.get(peek)!.sub}
                </span>
                <span className="mt-[2px] font-[family-name:var(--font-text)] text-[14px] leading-[18px] text-ink">
                  {BY_ID.get(peek)!.peek}
                </span>
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* ---------- the plate and the crate */}
        <div className="relative flex shrink-0 items-start" style={{ gap: GAP }}>
          <div className="relative" style={{ width: plateW, height: plateH }} data-testid="baseplate">
            <div className="pointer-events-none absolute inset-0" aria-hidden>
              <Art id="baseplate" width={plateW} height={plateH} />
            </div>
            {(['day1', 'proven'] as const).map((lane) => {
              const L = PLATE.lanes[lane]
              const zx = ZONE_X[lane]
              const bx = (L.x + (L.w - BRICK_W) / 2 - zx) * k // brick left, within the zone
              return (
                <div
                  key={lane}
                  {...d.zone(lane)}
                  aria-label={LANE_LABEL(lane)}
                  className={`absolute ${zoneCls}`}
                  style={{ left: zx * k, top: 0, width: ZONE_W * k, height: plateH }}
                  data-testid={`lane-${lane}`}
                >
                  <span className={plaque}
                    style={{ left: (L.x + 18 - zx) * k, top: 3 * k, width: (L.w - 36) * k, height: 15 * k, fontSize: 11.5 * Math.min(k, 1.05), borderRadius: 1.5 }}>
                    {LANE_LABEL(lane)}
                  </span>
                  {/* carried-forward ghosts: Day-one bricks, pale, in Once proven */}
                  {lane === 'proven' && BRICKS.filter((b) => lanes[b.id] === 'day1').map((b) => (
                    <div key={`g-${b.id}`} aria-hidden className="pointer-events-none absolute" data-ghost={b.id}
                      style={{ left: bx, top: (rowTop(b.rung) + 2) * k, opacity: 0.8 }}>
                      <Art id={b.art} state="ghost" width={bw} height={bh} />
                    </div>
                  ))}
                  {/* a dashed shadow over the empty studs under a floating brick */}
                  {BRICKS.filter((b) => lanes[b.id] === lane && b.rung > 1 && !occupied(lanes, lane, b.rung - 1)).map((b) => (
                    <div key={`s-${b.id}`} aria-hidden className="pointer-events-none absolute border-[1.5px] border-dashed border-navy/55"
                      data-shadow={b.id}
                      style={{ left: bx + 4 * k, top: (rowTop(b.rung - 1) + 9) * k, width: bw - 8 * k, height: 21 * k, borderRadius: 2 }} />
                  ))}
                  {caption?.lane === lane && (
                    <motion.span
                      aria-hidden
                      className="pointer-events-none absolute inset-x-0 z-20 flex items-center justify-center"
                      style={{ top: (rowTop(caption.row) + 3) * k, height: 26 * k }}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.2 }}
                      data-testid="caption"
                    >
                      <span className="bg-paper px-[5px] py-[1px] font-[family-name:var(--font-text)] text-[12.5px] italic leading-[16px] text-ink shadow-[0_0_0_1px_#DDD9D2]">
                        Nothing under it yet.
                      </span>
                    </motion.span>
                  )}
                  {/* this lane's bricks, each on its own rung */}
                  {BRICKS.filter((b) => lanes[b.id] === lane).map((b) =>
                    brick(b, 'lane', {
                      position: 'absolute', left: (L.x - zx) * k, width: L.w * k, top: rowTop(b.rung) * k, height: ROW * k,
                      display: 'flex', justifyContent: 'center', paddingTop: 2 * k, zIndex: 5,
                    }),
                  )}
                </div>
              )
            })}
          </div>

          <div
            {...d.zone('none')}
            aria-label={LANE_LABEL('none')}
            className={`relative ${zoneCls}`}
            style={{ width: CRATE_W * k, height: plateH }}
            data-testid="lane-none"
          >
            <div className="pointer-events-none absolute inset-0" aria-hidden>
              <Art id="crate" width={CRATE_W * k} height={plateH} />
            </div>
            <span className={`${plaque} whitespace-nowrap`}
              style={{ left: 1 * k, top: 3 * k, width: 70 * k, height: 15 * k, fontSize: 10.5 * Math.min(k, 1.05), letterSpacing: 0, borderRadius: 1.5 }}>
              {LANE_LABEL('none')}
            </span>
            <div className="absolute inset-x-0 flex flex-col-reverse items-center" style={{ bottom: 12 * k, gap: 3 * k }}>
              {crateOrder.map((id, i) => brick(BY_ID.get(id)!, 'crate', { zIndex: 5 }, tilt(id, i)))}
            </div>
          </div>
        </div>

        {/* ---------- the tray: two rows of three, fixed seats, on solid ground */}
        <div
          {...d.zone('tray')}
          aria-label="Tray"
          className="relative grid shrink-0 grid-cols-3 data-[over=true]:bg-[rgba(20,35,59,0.05)]"
          style={{ height: trayH, width: fullW, rowGap: TRAY_GAP }}
          data-testid="tray"
        >
          <GroundBand camp={2} top={-4} bleed={(box.w - fullW) / 2 + 12} />
          {order.map((id) => {
            const b = BY_ID.get(id)!
            return (
              <div key={id} className="relative z-[1] flex items-start justify-center pt-[8px]" style={{ height: TRAY_ROW }}>
                {lanes[id] ? (
                  <div aria-hidden className="opacity-50" data-socket={id}><Art id={b.art} state="ghost" width={bw} height={bh} /></div>
                ) : (
                  brick(b, 'tray', { minWidth: 100, minHeight: 56, display: 'flex', justifyContent: 'center' })
                )}
              </div>
            )
          })}
        </div>
        {d.liveRegion}
      </div>
    </Frame>
  )
}

function lastIndex(events: KitEvent[], id: BrickId) {
  for (let i = events.length - 1; i >= 0; i--) if (events[i].brick === id) return i
  return -1
}
/** A small fixed tilt per brick in the crate (tossed in, not stacked). */
function tilt(id: string, i: number) {
  let h = 0
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) | 0
  return ((Math.abs(h) % 7) - 3) + (i % 2 ? 1.5 : -1.5)
}

/* ------------------------------------------------------------------ the "i" corner */

/** A 26px 'i' glyph with a 44px hit area, on the brick's right edge (not
    its top corner, so it never overlaps the brick above's hit area). In the
    crate, at the screen's edge, it sits just inside the brick. */
function PeekButton({ label, onOpen, inside = false }: { label: string; onOpen: (via: string) => void; inside?: boolean }) {
  const stop = (e: { stopPropagation: () => void }) => e.stopPropagation()
  return (
    <button
      type="button"
      aria-label={`About ${label}`}
      onPointerDown={stop}
      onPointerUp={stop}
      onKeyDown={(e) => { e.stopPropagation(); if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen('key') } }}
      onClick={(e) => { e.stopPropagation(); onOpen('tap') }}
      className={`absolute top-1/2 z-10 flex h-[44px] w-[44px] -translate-y-1/2 items-center justify-center ${inside ? '-right-[8px]' : '-right-[26px]'}`}
      data-peek-button
    >
      <span className="flex h-[17px] w-[17px] items-center justify-center rounded-full border border-ink bg-paper font-[family-name:var(--font-text)] text-[12px] italic leading-none text-ink">
        i
      </span>
    </button>
  )
}

/* ------------------------------------------------------------------ the route strip

   <Art id="route-layers" value={precision}> (drawn in code by the art: pencil,
   dotted, waypoints, weather and timings), set a little to the right so the
   rookie can stand at its start. The rock underfoot follows the same path
   (routePoint). The rookie and the bootprints behind them are the screen's
   own and never move here: only steps draw that line. */
const R = { dx: 30, dy: 3, s: 0.9 } // where the 360x60 route art sits in the strip
const at = (t: number) => {
  const q = routePoint(t)
  return { x: R.dx + q.x * R.s, y: R.dy + q.y * R.s }
}
const START = at(0)
/** A short rock ledge under the rookie; the camp scene carries the terrain. */
const GROUND = `M 0 ${START.y + 5.5} L ${START.x + 6} ${START.y + 5.5} l 5 2.5`
const INK = '#0D0C0B'
const ROUTE_WORDS = [
  'The route ahead is blank.',
  'The route ahead: a pencil line.',
  'The route ahead: dotted.',
  'The route ahead: dotted, with waypoints.',
  'The route ahead: waypoints, weather and timings.',
]

function RouteStrip({ precision, n }: { precision: number; n: number }) {
  return (
    <svg viewBox="0 0 360 60" width="100%" height={60} preserveAspectRatio="xMidYMid meet" className="absolute inset-0 overflow-visible"
      role="img" aria-label={ROUTE_WORDS[precision]} data-testid="route-strip" data-precision={precision}>
      {/* the rock underfoot */}
      <path d={GROUND} fill="none" stroke={INK} strokeWidth={1.2} strokeLinecap="round" />
      {/* the route ahead, redrawn as Day-one bricks go on */}
      <g transform={`translate(${R.dx} ${R.dy}) scale(${R.s})`} aria-hidden>
        <g key={precision} className="motion-safe:animate-[route-in_280ms_ease-out]">
          <Art id="route-layers" value={precision} data={{ n, halo: CAMP2_PAPER }} width={360} height={60} />
        </g>
      </g>
      {/* bootprints behind: solid ink, drawn only by steps, unchanged here */}
      <g fill={INK} data-bootprints aria-hidden>
        {[2, 9, 16].map((x, i) => (
          <ellipse key={x} cx={x} cy={START.y + (i % 2 ? 3.4 : 5.6)} rx={2} ry={1} />
        ))}
      </g>
      <Figure as="g" x={START.x - 6} y={START.y + 5.5} size={40} pose="stand" />
      <style>{'@keyframes route-in{from{opacity:.15}to{opacity:1}}'}</style>
    </svg>
  )
}
