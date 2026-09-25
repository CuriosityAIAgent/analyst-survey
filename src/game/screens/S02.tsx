'use client'
/* S02 · Base camp · "Kit them out" (mechanic: pack).

   One board, four zones, one tray: the deck's single dot-vote board.
     rucksack  "More of it"        3 slots  GREEN  (forest)
     hand      "Speeds them most"  1 slot   BLUE   (navy)   takes a COPY
     out       "Free them of it"   2 slots  RED    (ink)
     rerig     "Keep, but re-rig"  2 slots  AMBER  (bronze)
   A tile sits in only one of rucksack, tarp or bench. The hand takes a copy
   of any tile, so the Blue item may repeat a Green one and a packed item
   stays packed. Dropping on an occupied slot swaps the two tiles; dropping on
   a full zone's body bounces with a 2px shake (useDrag does the shake when
   onDrop returns false).

   Input: pointer drag, tap-then-tap (tap a tile, tap a zone, a slot or a
   placed tile), keyboard (Space lifts, arrows cycle the zones, Enter drops;
   Tab to a placed tile and press Enter to swap onto its slot).

   The tray never reflows: a placed tile leaves a ghost with its label and a
   dot in each colour it went to, so the board reads without labels on the
   40px placed tiles. Every move settles with a 180ms FLIP spring.

   Layout at 390x660 (design budget): zones 2x2 of ~180x68 = 142, a flexible
   gap showing the camp, tray 4x3 of 64px tiles + two-line 12px labels
   = 276, the camp-walk strip (Frame) replaces Continue. */
import type { CSSProperties } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import Frame from '../Frame'
import { Art } from '../art'
import { label, plainOf } from '../content'
import { useLayout } from '../layout'
import { NameTip } from '../Chips'
import type { GearId, StepProps } from '../types'
import {
  ART_OF, CAP, COLOR, COPY, FULL_STATE, ZONE_ART, ZONE_IDS, homeOf, useS02Board,
  type Board, type ZoneId,
} from './boards/useS02Board'
import S02Desk from './boards/S02Desk'

// the pure board model lives with the hook; re-exported for board.test.ts
export { applyDrop, boardOf } from './boards/useS02Board'
export type { DropResult } from './boards/useS02Board'

/* Tile and slot sizes: 64px tiles at 660 tall, down to 48px on short phones;
   slots 44px, narrower on 360px-wide phones so the rucksack's three fit. */
const BOARD_VARS = {
  '--tile': 'clamp(48px, calc(100dvh * 0.097), 64px)',
  '--slot': 'min(44px, calc((min(100vw, 480px) - 126px) / 6))',
} as CSSProperties

/* ------------------------------------------------------------ screen */

export default function S02(p: StepProps) {
  const layout = useLayout()
  const B = useS02Board(p, { desk: layout !== 'phone' })
  if (layout !== 'phone') return <S02Desk p={p} B={B} />
  return <S02Phone p={p} B={B} />
}

function S02Phone({ p, B }: { p: StepProps; B: ReturnType<typeof useS02Board> }) {
  const { order, board, valid, d, stage, trayLit, liftedLabel } = B

  return (
    <Frame
      id="S02"
      valid={valid}
      onContinue={p.next}
      helper={liftedLabel ? <span>Holding <span className="text-forest">{liftedLabel}</span></span> : undefined}
    >
      <div {...d.stageProps} ref={(el) => { stage.current = el; d.stageProps.ref(el) }} style={{ ...d.stageProps.style, ...BOARD_VARS }}
        className="absolute inset-0 flex flex-col px-3 pb-1 pt-1" data-board>
        {/* the four zones */}
        <div className="grid shrink-0 grid-cols-2 gap-[6px]">
          {ZONE_IDS.map((z) => (
            <ZoneBox key={z} z={z} d={d} board={board} reduced={p.reduced} />
          ))}
        </div>

        {/* whatever height is left shows the camp behind (the rookie waits
            in the camp-walk strip below) */}
        <div className="pointer-events-none min-h-0 flex-1" aria-hidden />

        {/* the tray: 4x3, never reflows */}
        <div className="relative -mx-3 shrink-0 border-t border-rule-soft bg-paper px-3 pb-[2px]" data-tray>
          <div {...d.zone('tray')} className="absolute inset-0 border border-dashed data-[over=true]:bg-[rgba(13,12,11,0.04)]"
            style={{ borderColor: trayLit ? '#8C857A' : 'transparent' }} data-testid="zone-tray" aria-hidden />
          <div className="pointer-events-none relative grid grid-cols-4">
            {order.map((id) => {
              const home = homeOf(board, id)
              const inHand = board.hand[0] === id
              if (home) return <Ghost key={id} id={id} home={home} inHand={inHand} />
              return (
                <div key={id} data-tile={id} className="pointer-events-auto flex justify-center">
                  <div {...d.item(id, { className: 'group flex w-full flex-col items-center pt-[2px] outline-none' })} data-testid={`tile-${id}`} aria-label={label('S02', id)}>
                    <TileIcon id={id} size="var(--tile)" lifted={d.lifted === id} dot={inHand ? COLOR.hand : null} />
                    <TileLabel id={id} lifted={d.lifted === id} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        {d.liveRegion}
      </div>
    </Frame>
  )
}

/* ------------------------------------------------------------ zone */

type DragApiT = ReturnType<typeof useS02Board>['d']

function ZoneBox({ z, d, board, reduced }: { z: ZoneId; d: DragApiT; board: Board; reduced: boolean }) {
  const list = board[z]
  const full = list.length >= CAP[z]
  const c = COLOR[z]
  const lit = d.lifted !== null && d.isValid(z)
  return (
    <div
      {...d.zone(z)}
      data-testid={`zone-${z}`}
      data-full={full ? 'true' : undefined}
      className="relative flex h-[68px] flex-col justify-between rounded-[2px] bg-paper/95 pb-[4px] pl-[6px] pr-[4px] pt-[4px] transition-[box-shadow,background-color] duration-100"
      style={{
        boxShadow: d.over === z ? `inset 0 0 0 2px ${c}` : lit ? `inset 0 0 0 1px ${c}` : 'inset 0 0 0 1px #DDD9D2',
        background: d.over === z ? `color-mix(in srgb, ${c} 7%, #F8F7F4)` : undefined,
      } as CSSProperties}
    >
      <p className="flex items-center gap-[5px] truncate font-[family-name:var(--font-ui)] text-[14px] font-semibold leading-[17px] text-ink">
        <span className="inline-block h-[7px] w-[7px] shrink-0 rounded-full" style={{ background: c }} aria-hidden />
        {label('S02', z)}
      </p>
      <div className="flex items-center gap-[4px]">
        <motion.div
          className="shrink-0"
          key={full ? 'full' : 'open'}
          initial={reduced ? false : { scale: full ? 0.86 : 1 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 600, damping: 18 }}
        >
          <Art id={ZONE_ART[z]} size={34} state={full ? FULL_STATE[z] : undefined} title={label('S02', z)} />
        </motion.div>
        <div className="relative flex items-center">
          {Array.from({ length: CAP[z] }, (_, i) => (
            <Slot key={i} z={z} i={i} id={list[i] ?? null} d={d} />
          ))}
          {/* the hand's copy rule, in the spec's words (zones[].plain, the
              same gloss desk shows); the other three glosses have no room in
              a 68px zone at 390x660, so on phone they are a covariate */}
          {z === 'hand' && (
            <span className="ml-[6px] font-[family-name:var(--font-ui)] leading-[1.1] text-ink-2" style={{ fontSize: "min(12px, 3vw)" }} data-zone-plain>{plainOf('S02', 'hand')}</span>
          )}
          <FullMark z={z} full={full} reduced={reduced} />
        </div>
      </div>
    </div>
  )
}

function Slot({ z, i, id, d }: { z: ZoneId; i: number; id: GearId | null; d: DragApiT }) {
  const sid = `${z}:${i}`
  const itemId = id ? (z === 'hand' ? COPY + id : id) : null
  const c = COLOR[z]
  const over = d.over === sid
  return (
    <div {...d.zone(sid)} className="flex h-[var(--slot)] w-[var(--slot)] shrink-0 items-center justify-center" data-testid={`slot-${sid}`}>
      {id && itemId ? (
        <div data-tile={itemId}>
          <div {...d.item(itemId, { className: 'group/placed relative p-[2px] outline-none' })} data-testid={`placed-${sid}`} aria-label={`${label('S02', id)}${z === 'hand' ? ' (copy)' : ''}, in ${label('S02', z)}`}>
            <TileIcon id={id} size="calc(var(--slot) - 4px)" tileKey={itemId} lifted={d.lifted === itemId} border={c} over={over} />
            <NameTip text={label('S02', id)} />
          </div>
        </div>
      ) : (
        <div
          className="rounded-[2px] transition-colors duration-100"
          style={{
            width: 'calc(var(--slot) - 4px)', height: 'calc(var(--slot) - 4px)',
            border: `1px dashed ${over || d.lifted ? c : '#8C857A'}`,
            background: over ? `color-mix(in srgb, ${c} 10%, transparent)` : 'rgba(255,255,255,0.55)',
          }}
          aria-hidden
        />
      )}
    </div>
  )
}

/* What each zone does when it fills: the rucksack zips (in its art: the lid
   buckles and the pocket zip shuts), the hand closes (in its art), the tarp
   folds a flap over its loads, the bench shows a spliced rope.
   Every zone gets the same amount of motion, so no zone rewards an answer. */
function FullMark({ z, full, reduced }: { z: ZoneId; full: boolean; reduced: boolean }) {
  const c = COLOR[z]
  const w = `calc(var(--slot) * ${CAP[z]} - 4px)`
  return (
    <AnimatePresence initial={false}>
      {full && z === 'out' && (
        <motion.svg key="flap" className="pointer-events-none absolute left-[1px] top-[1px] z-[2] origin-top" style={{ width: `calc(${w} + 2px)` }} height={11}
          viewBox="0 0 80 11" preserveAspectRatio="none"
          initial={reduced ? { opacity: 0 } : { scaleY: 0 }} animate={{ scaleY: 1, opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0.15 : 0.28, ease: [0.16, 1, 0.3, 1] }} aria-hidden>
          {/* the tarp's back half, folded forward over both loads */}
          <path d="M0.5 0.5 H79.5 V7 Q60 10.4 40 8.6 Q20 10.6 0.5 7.4 Z" fill="#DDD9D2" stroke="#0D0C0B" strokeWidth={1.2} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
          <path d="M3 4 H77" stroke="#0D0C0B" strokeWidth={0.7} strokeDasharray="1.6 1.6" vectorEffect="non-scaling-stroke" />
        </motion.svg>
      )}
      {full && z === 'rerig' && (
        <motion.svg key="splice" className="pointer-events-none absolute bottom-[-4px] left-[2px]" style={{ width: w }} height={6}
          viewBox="0 0 80 6" preserveAspectRatio="none" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} aria-hidden>
          <motion.path d="M0 3 L80 3" stroke={c} strokeWidth={1.6} fill="none" vectorEffect="non-scaling-stroke"
            initial={reduced ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.3 }} />
          <path d="M36 1 L40 5 M40 1 L44 5 M44 1 L48 5" stroke="#0D0C0B" strokeWidth={1} vectorEffect="non-scaling-stroke" />
        </motion.svg>
      )}
    </AnimatePresence>
  )
}

/* ------------------------------------------------------------ tiles */

function TileIcon({ id, size, tileKey, lifted, border, over, dot }: {
  id: GearId; size: string; tileKey?: string; lifted?: boolean; border?: string; over?: boolean; dot?: string | null
}) {
  return (
    <div
      data-tile-icon={tileKey ?? id}
      className="relative flex items-center justify-center rounded-[2px] bg-ground transition-[box-shadow] duration-100"
      style={{
        width: size, height: size,
        boxShadow: lifted ? 'inset 0 0 0 1.5px #0D0C0B' : over ? `inset 0 0 0 2px ${border}` : `inset 0 0 0 1px ${border ?? '#DDD9D2'}`,
      }}
    >
      <Art id={ART_OF[id]} width="76%" height="76%" />
      {dot && <span className="absolute right-[3px] top-[3px] h-[7px] w-[7px] rounded-full" style={{ background: dot }} aria-hidden />}
    </div>
  )
}

function TileLabel({ id, muted, lifted }: { id: GearId; muted?: boolean; lifted?: boolean }) {
  // while carried, the label gets a paper backing so it never garbles with
  // the zone labels it passes over
  return (
    <span className={`mt-[3px] line-clamp-2 h-[26px] w-full rounded-[2px] px-[2px] text-center font-[family-name:var(--font-ui)] text-[12px] leading-[13px] ${muted ? 'text-muted' : 'text-ink'} ${lifted ? 'relative z-[1] bg-paper shadow-[0_0_0_1px_#DDD9D2]' : ''}`}>
      {label('S02', id)}
    </span>
  )
}

/** A placed tile's home in the tray: its label stays, with a dot in the
    colour of each zone it went to. */
function Ghost({ id, home, inHand }: { id: GearId; home: ZoneId; inHand: boolean }) {
  return (
    <div className="flex flex-col items-center pt-[2px]" data-ghost={id} aria-hidden>
      <div className="relative flex items-center justify-center rounded-[2px]"
        style={{ width: 'var(--tile)', height: 'var(--tile)', border: '1px dashed #DDD9D2' }}>
        <span className="flex gap-[4px]">
          <span className="h-[8px] w-[8px] rounded-full" style={{ background: COLOR[home] }} />
          {inHand && <span className="h-[8px] w-[8px] rounded-full" style={{ background: COLOR.hand }} />}
        </span>
      </div>
      <TileLabel id={id} muted />
    </div>
  )
}
