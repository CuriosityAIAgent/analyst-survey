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
import { useLayoutEffect, useState } from 'react'
import type { CSSProperties, KeyboardEvent as RKeyboardEvent } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import Frame from '../Frame'
import { Art } from '../art'
import { BRICK, CRATE, PLATE } from '../art/nav'
import { campPaper } from '../feel'
import { useLayout } from '../layout'
import GroundBand from '../GroundBand'
import { PeekButton, RouteStrip, tilt } from './boards/s05Bits'
import type { StepProps } from '../types'
import {
  BRICKS, BY_ID, BRICK_IDS, LANE_LABEL, occupied, useS05Plate, type Brick, type S05Plate,
} from './boards/useS05Plate'
import S05Desk from './boards/S05Desk'

// the pure rules live with the hook; re-exported for board.test.ts and S11
export { available, cutOf, unsupportedOf } from './boards/useS05Plate'

/** The camp's warmed paper: label backings sit on it, so the scene's lines
    never run through text. */
const CAMP2_PAPER = campPaper('S05')

/* ------------------------------------------------------------------ geometry
   From the art (src/game/art/nav.tsx): the base plate is 270x224, a 20px
   lane-head strip then six 34px rung rows; lanes day1 x4 w128 and proven
   x138 w128; a brick on rung r sits at rowTop(r) + 2. The crate is 72x224.
   Everything is drawn at one scale k, so bricks sit on the art's studs. */
const PLATE_W = PLATE.w, PLATE_H = PLATE.h, ROW = PLATE.row, CRATE_W = CRATE.w, GAP = 10
const BRICK_W = BRICK.w, BRICK_H = BRICK.h
/** The drop zones split the plate down its seam. */
const ZONE_X = { day1: 0, proven: PLATE_W / 2 } as const
const ZONE_W = PLATE_W / 2
const rowTop = (rung: number) => PLATE.rowTop(rung)

/* ------------------------------------------------------------------ screen */

export default function S05(p: StepProps) {
  const layout = useLayout()
  const K = useS05Plate(p, { desk: layout !== 'phone' })
  if (layout !== 'phone') return <S05Desk p={p} K={K} />
  return <S05Phone p={p} K={K} />
}

function S05Phone({ p, K }: { p: StepProps; K: S05Plate }) {
  const { order, lanes, unsupported, precision, placedAll, stageRef, d, peek, setPeek, openPeek, caption, crateOrder } = K

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
  }, [stageRef])
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
        aria-label={`${b.sub}, ${b.label}${lanes[b.id] ? `. In ${LANE_LABEL(lanes[b.id]!)}` : ''}${floating ? '. Nothing under it yet' : ''}`}
        data-testid={`brick-${b.id}`}
        data-where={where}
        data-floating={floating ? 'true' : undefined}
      >
        <div data-snap className="relative flex flex-col items-center">
          <div data-wobble style={{ transform: floating ? 'rotate(-2deg)' : tiltDeg ? `rotate(${tiltDeg}deg)` : undefined, transformOrigin: '50% 100%' }}>
            <div className="relative" style={{ width: bw * scale, height: bh * scale }}>
              <Art id={b.art} width={bw * scale} height={bh * scale} state={where === 'lane' ? 'label' : undefined} />
              <PeekButton label={`${b.sub}, ${b.label}`} onOpen={(via) => openPeek(b.id, via)} inside={where === 'crate'} />
            </div>
          </div>
          {where === 'tray' && (
            <span className="mt-[3px] flex flex-col items-center whitespace-nowrap rounded-[2px] px-[4px] font-[family-name:var(--font-ui)] text-[12px] leading-[14px]"
              style={{ background: CAMP2_PAPER }}>
              <span className="font-medium text-ink">{b.sub}</span>
              <span className="text-muted">{b.label}</span>
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

  return (
    <Frame id="S05" valid={placedAll} continueLabel="Start walking" onContinue={K.onContinue}>
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
                aria-label={`${BY_ID.get(peek)!.sub}, ${BY_ID.get(peek)!.label}. ${BY_ID.get(peek)!.peek} Tap to close.`}
                data-testid="peek"
              >
                <span className="font-[family-name:var(--font-ui)] text-[12px] leading-[15px] tracking-[0.04em] text-navy">
                  <b className="font-semibold">{BY_ID.get(peek)!.sub}</b> · {BY_ID.get(peek)!.label}
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
