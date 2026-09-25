'use client'
/* S05 desk view (design 5, S05): the same plate as the phone, tools left and
   lanes right, with the plain name first on every tool.

     design canvas 936 x 600 (fit-scaled by DeskCanvas)
     +-- TOOLS 340 ------------------------+  +-- route strip 560 x 60 ------------------+
     | [brick 112]  LLM chat           (i) |  | [1] Day one  [2] Once proven [3] Not for  |
     |              Paper map              |  |  200 wide     200 wide       them 120    |
     |  ... six cards 340 x 88, seeded     |  |  six rung rows of 76 (map at the bottom) |
     +-------------------------------------+  +------------------------------------------+

   - A brick snaps to its own rung row; Day-one bricks show as faint (15%)
     carried-forward ghosts in Once proven, so they never read as placed; a brick with nothing under it
     tilts over a dashed shadow and, the first time, "Nothing under it yet."
     (the panel status says so too, and what the dashed box is, while any
     brick is unsupported)
   - (i), or [I] on the brick you're on, opens the peek (kit.peeks). Hover or
     focus shows the description in the panel's Holding line ('peek-hover'
     event, never kit.peeks). The description is not printed on the cards,
     so reading it stays a choice, as on the phone.
   - The route strip above the plate sharpens with every Day-one brick
     (routePrecision, the scale S11 draws the summit route at).
   Rules, stores and logs: useS05Plate, shared with the phone. */
import type { CSSProperties, KeyboardEvent as RKeyboardEvent } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import Frame from '../../Frame'
import BoardCanvas from './BoardCanvas'
import { Art } from '../../art'
import KeyCap from '../../KeyCap'
import type { StatusRow } from '../../Checklist'
import type { BrickId, Lane, StepProps } from '../../types'
import { BRICKS, BY_ID, LANE_LABEL, occupied, plainName, type Brick, type S05Plate } from './useS05Plate'
import { PeekButton, RouteStrip, tilt } from './s05Bits'

const W = 936, H = 600
const TOOLS_W = 340, CARD_H = 88, CARD_GAP = 10
const PLATE_X = 376
const STRIP_H = 60, STRIP_GAP = 10
const HEAD = 40, ROW = 76, ROWS = 6
const LANE_W = 200, LANE_GAP = 8, CRATE_GAP = 16, CRATE_W = 120
const PLATE_H = HEAD + ROW * ROWS
const BRICK_W = 104, BRICK_H = Math.round((104 * 295) / 512)
const LANE_X = { day1: 0, proven: LANE_W + LANE_GAP } as const
const CRATE_X = LANE_W * 2 + LANE_GAP + CRATE_GAP
const rowTop = (rung: number) => HEAD + (ROWS - rung) * ROW
const PLATE_TINT = '#DEE2DE'
const FOREST = '#1F4B3A'
const NAVY = '#14233B'
const KEY_OF: Record<Lane, string> = { day1: '1', proven: '2', none: '3' }

export default function S05Desk({ p, K }: { p: StepProps; K: S05Plate }) {
  const { order, lanes, unsupported, precision, placedAll, placedCount, stageRef, d, peek, setPeek, openPeek, caption, crateOrder, onBrick, day1Count } = K
  const left = BRICKS.length - placedCount

  const status: StatusRow[] = (['day1', 'proven', 'none'] as Lane[]).map((l) => ({
    id: l, label: LANE_LABEL(l), color: l === 'none' ? '#7A3E12' : l === 'day1' ? FOREST : NAVY,
    have: BRICKS.filter((b) => lanes[b.id] === l).length,
  }))
  // a brick with nothing directly under it (the dashed support hint shows)
  const gap = (['day1', 'proven'] as const).some((l) => BRICKS.some((b) => lanes[b.id] === l && b.rung > 1 && !occupied(lanes, l, b.rung - 1)))
  const on = onBrick ? BY_ID.get(onBrick)! : null
  const holding = on ? (
    <span>
      <b className="font-semibold">{plainName(on)}</b>. <span className="text-ink-2">{on.peek}</span>
      {unsupported.includes(on.id) && <span className="block text-bronze">Nothing under it yet.</span>}
    </span>
  ) : undefined

  const onKeyDown = (id: BrickId) => (e: RKeyboardEvent<HTMLElement>) => {
    if (e.key === '?' || (e.key === '/' && e.shiftKey)) { e.preventDefault(); openPeek(id, 'key') }
  }

  /** A brick on the plate or in the crate (the draggable). */
  const brick = (b: Brick, where: 'lane' | 'crate', style?: CSSProperties, tiltDeg = 0) => {
    const floating = where === 'lane' && unsupported.includes(b.id)
    const w = where === 'crate' ? 84 : BRICK_W
    const h = Math.round((w * 295) / 512)
    return (
      <div
        key={b.id}
        {...d.item(b.id, { onKeyDown: onKeyDown(b.id), style, className: 'group outline-none' })}
        aria-label={`${b.sub}, ${b.label}. In ${LANE_LABEL(lanes[b.id]!)}${floating ? '. Nothing under it yet' : ''}`}
        data-testid={`brick-${b.id}`}
        data-where={where}
        data-floating={floating ? 'true' : undefined}
        title={`${plainName(b)}. Press I to read it.`}
      >
        <div data-snap className="flex items-center gap-[8px]">
          <div data-wobble className="transition-transform duration-150 group-hover:-translate-y-[2px]"
            style={{ transform: floating ? 'rotate(-2.5deg)' : tiltDeg ? `rotate(${tiltDeg}deg)` : undefined, transformOrigin: '50% 100%' }}>
            <Art id={b.art} width={w} height={h} state="label" />
          </div>
          {where === 'lane' && (
            <span className="line-clamp-2 max-w-[76px] rounded-[2px] bg-paper px-[4px] py-[1px] font-[family-name:var(--font-ui)] text-[12px] font-medium leading-[14px] text-ink shadow-[0_0_0_1px_#DDD9D2]">{b.sub}</span>
          )}
        </div>
      </div>
    )
  }

  return (
    <Frame
      id="S05"
      host="native"
      valid={placedAll}
      continueLabel="Start walking"
      onContinue={K.onContinue}
      status={status}
      summary={gap ? (
        <span>
          {placedCount} of {BRICKS.length} placed
          <span className="mt-1 block text-bronze" data-status-support>Nothing under it yet. The dashed box marks the empty row below it.</span>
        </span>
      ) : `${placedCount} of ${BRICKS.length} placed`}
      holding={holding}
      invalidReason={left ? `Place ${left} more` : undefined}
    >
      <BoardCanvas w={W} h={H}>
        <div
          {...d.stageProps}
          ref={(el) => { d.stageProps.ref(el); stageRef.current = el }}
          className="relative h-full w-full"
          style={d.stageProps.style}
          data-testid="s05-stage"
          data-desk-board="S05"
        >
          {/* ---------- the tools (sources, left): the tray zone */}
          <div
            {...d.zone('tray')}
            aria-label="Tools"
            className="absolute left-0 top-0 flex flex-col justify-center rounded-[3px] transition-colors duration-150 data-[over=true]:bg-[rgba(20,35,59,0.05)] data-[valid=true]:outline data-[valid=true]:outline-1 data-[valid=true]:outline-offset-4 data-[valid=true]:outline-dashed data-[valid=true]:outline-[#8C857A]"
            style={{ width: TOOLS_W, height: H, gap: CARD_GAP }}
            data-testid="tray"
          >
            {order.map((id) => {
              const b = BY_ID.get(id)!
              const lane = lanes[id]
              const isPeek = peek === id
              const card = (
                <div className="relative flex h-full w-full items-center gap-[12px] rounded-[3px] pl-[8px] pr-[52px] transition-[transform,box-shadow] duration-150"
                  style={{
                    height: CARD_H,
                    background: lane ? 'rgba(248,247,244,0.72)' : '#F8F7F4',
                    boxShadow: lane ? 'inset 0 0 0 1px #DDD9D2' : d.lifted === id ? `inset 0 0 0 1.5px ${NAVY}` : 'inset 0 0 0 1px #DDD9D2, 0 4px 14px rgba(13,12,11,0.06)',
                    borderStyle: 'solid',
                  }}>
                  <div className="flex w-[118px] shrink-0 items-center justify-center" style={{ height: 70 }}>
                    {lane ? (
                      <div className="rounded-[3px] border border-dashed border-rule" style={{ width: 104, height: 52 }} aria-hidden data-socket={id} />
                    ) : (
                      <div className="transition-transform duration-150 group-hover:-translate-y-[2px]"><Art id={b.art} width={112} height={65} /></div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`font-[family-name:var(--font-ui)] text-[15px] font-semibold leading-[19px] ${lane ? 'text-muted' : 'text-ink'}`}>{b.sub}</p>
                    <p className="mt-[2px] font-[family-name:var(--font-ui)] text-[13px] leading-[17px] text-muted">{b.label}</p>
                    {lane && (
                      <p className="mt-[3px] font-[family-name:var(--font-ui)] text-[11px] font-semibold uppercase leading-[14px] tracking-[0.1em] text-muted">
                        In {LANE_LABEL(lane)}
                      </p>
                    )}
                  </div>
                  <div className="absolute inset-y-0 right-[14px] w-[44px]">
                    <PeekButton label={`${b.sub}, ${b.label}`} onOpen={(via) => openPeek(id, via)} inside />
                  </div>
                  <AnimatePresence>
                    {isPeek && (
                      <motion.button
                        type="button"
                        key={id}
                        onClick={(e) => { e.stopPropagation(); setPeek(null) }}
                        onPointerDown={(e) => e.stopPropagation()}
                        className="absolute inset-0 z-30 flex flex-col justify-center rounded-[3px] border border-ink bg-paper px-4 text-left shadow-[0_6px_16px_rgba(13,12,11,0.14)]"
                        initial={p.reduced ? { opacity: 0 } : { opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.16 }}
                        aria-live="polite"
                        aria-label={`${b.sub}, ${b.label}. ${b.peek} Click to close.`}
                        data-testid="peek"
                      >
                        <span className="font-[family-name:var(--font-ui)] text-[13px] leading-[16px] text-navy">
                          <b className="font-semibold">{b.sub}</b> · {b.label}
                        </span>
                        <span className="mt-[3px] font-[family-name:var(--font-text)] text-[15px] leading-[20px] text-ink">{b.peek}</span>
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              )
              return lane ? (
                <div key={id} className="relative" data-seat={id}>{card}</div>
              ) : (
                <div key={id} {...d.item(id, { onKeyDown: onKeyDown(id), className: 'group relative outline-none' })}
                  aria-label={`${b.sub}, ${b.label}`} data-testid={`brick-${id}`} data-where="tray">
                  <div data-snap>{card}</div>
                </div>
              )
            })}
          </div>

          {/* ---------- the route strip: sharpens as Day-one bricks go on */}
          <div className="absolute" style={{ left: PLATE_X, top: 0, width: W - PLATE_X, height: STRIP_H }}>
            <RouteStrip precision={precision} n={day1Count} />
          </div>

          {/* ---------- the plate and the crate (targets, right) */}
          <div className="absolute" style={{ left: PLATE_X, top: STRIP_H + STRIP_GAP, width: W - PLATE_X, height: PLATE_H }} data-testid="baseplate">
            {(['day1', 'proven'] as const).map((lane) => (
              <div
                key={lane}
                {...d.zone(lane)}
                aria-label={LANE_LABEL(lane)}
                className="absolute rounded-[4px] transition-[box-shadow,background-color] duration-150"
                style={{
                  left: LANE_X[lane], top: 0, width: LANE_W, height: PLATE_H,
                  background: d.over === lane ? '#D3DAD5' : PLATE_TINT,
                  boxShadow: d.over === lane ? `inset 0 0 0 2.5px ${NAVY}` : d.lifted && d.isValid(lane) ? `inset 0 0 0 1.5px rgba(20,35,59,0.55)` : `inset 0 0 0 1.5px ${FOREST}`,
                }}
                data-testid={`lane-${lane}`}
              >
                <LaneHead lane={lane} />
                <Studs />
                {/* carried-forward ghosts: Day-one bricks, pale, in Once proven */}
                {lane === 'proven' && BRICKS.filter((b) => lanes[b.id] === 'day1').map((b) => (
                  <div key={`g-${b.id}`} aria-hidden className="pointer-events-none absolute flex items-center gap-[8px]" data-ghost={b.id}
                    style={{ left: 10, top: rowTop(b.rung) + (ROW - BRICK_H) / 2, opacity: 0.15, filter: 'grayscale(1)' }}>
                    <Art id={b.art} width={BRICK_W} height={BRICK_H} state="ghost" />
                  </div>
                ))}
                {/* a dashed shadow over the empty studs under a floating brick */}
                {BRICKS.filter((b) => lanes[b.id] === lane && b.rung > 1 && !occupied(lanes, lane, b.rung - 1)).map((b) => (
                  <div key={`s-${b.id}`} aria-hidden className="pointer-events-none absolute rounded-[3px] border-[1.5px] border-dashed"
                    data-shadow={b.id}
                    style={{ left: 14, top: rowTop(b.rung - 1) + 14, width: BRICK_W - 8, height: ROW - 28, borderColor: 'rgba(20,35,59,0.5)' }} />
                ))}
                {caption?.lane === lane && (
                  <motion.span aria-hidden className="pointer-events-none absolute inset-x-0 z-20 flex items-center justify-center"
                    style={{ top: rowTop(caption.row), height: ROW }}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.2 }} data-testid="caption">
                    <span className="bg-paper px-[8px] py-[3px] font-[family-name:var(--font-text)] text-[14px] italic leading-[18px] text-ink shadow-[0_0_0_1px_#DDD9D2]">
                      Nothing under it yet.
                    </span>
                  </motion.span>
                )}
                {BRICKS.filter((b) => lanes[b.id] === lane).map((b) =>
                  brick(b, 'lane', { position: 'absolute', left: 10, top: rowTop(b.rung), height: ROW, display: 'flex', alignItems: 'center', zIndex: 5 }),
                )}
              </div>
            ))}

            {/* the crate: Not for them */}
            <div
              {...d.zone('none')}
              aria-label={LANE_LABEL('none')}
              className="absolute rounded-[3px] transition-[box-shadow] duration-150"
              style={{
                left: CRATE_X, top: 0, width: CRATE_W, height: PLATE_H,
                boxShadow: d.over === 'none' ? `inset 0 0 0 2.5px ${NAVY}` : d.lifted ? 'inset 0 0 0 1.5px rgba(20,35,59,0.55)' : 'none',
              }}
              data-testid="lane-none"
            >
              <LaneHead lane="none" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 rounded-[3px]" aria-hidden
                style={{
                  top: HEAD,
                  border: '3px solid #7A3E12',
                  background: 'repeating-linear-gradient(180deg, #F8F7F4 0 36px, #C9C4BB 36px 38px)',
                  opacity: d.over === 'none' ? 0.85 : 1,
                }} />
              <div className="absolute inset-x-0 flex flex-col-reverse items-center" style={{ bottom: 14, gap: 6 }}>
                {crateOrder.map((id, i) => brick(BY_ID.get(id)!, 'crate', { zIndex: 5 }, tilt(id, i)))}
              </div>
            </div>
          </div>
          {d.liveRegion}
        </div>
      </BoardCanvas>
    </Frame>
  )
}

function LaneHead({ lane }: { lane: Lane }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-center gap-[7px] font-[family-name:var(--font-ui)] text-[14px] font-semibold leading-[18px] text-ink"
      style={{ height: HEAD }}>
      <KeyCap k={KEY_OF[lane]} />
      <span className={lane === 'none' ? 'whitespace-nowrap text-[13px]' : ''}>{LANE_LABEL(lane)}</span>
    </div>
  )
}

/** Stud rows on a lane: four studs per brick seat, one row per rung. */
function Studs() {
  return (
    <svg className="pointer-events-none absolute left-0" style={{ top: HEAD }} width={LANE_W} height={ROW * ROWS} aria-hidden>
      {Array.from({ length: ROWS }, (_, r) => (
        <g key={r}>
          {r > 0 && <line x1={8} x2={LANE_W - 8} y1={r * ROW} y2={r * ROW} stroke={FOREST} strokeOpacity={0.18} />}
          {/* one brick seat per row: four studs where the brick lands */}
          {[0, 1, 2, 3].map((i) => (
            <ellipse key={i} cx={10 + 16 + i * 24} cy={r * ROW + ROW / 2 + 6} rx={8} ry={3} fill={PLATE_TINT} stroke={FOREST} strokeOpacity={0.6} strokeWidth={1} />
          ))}
        </g>
      ))}
    </svg>
  )
}
