'use client'
/* S02 desk view (design 5, S02): the same board as the phone, laid out for a
   mouse moving left to right.

     design canvas 936 x 580 (fit-scaled by DeskCanvas)
     +-- ACTIVITIES 520 --------------+  +-- BOXES 392 ----------------------+
     | 4 x 3 cells of 120 x 170        |  | [art] [1] ● Do more of this  2/3  |
     | 3D art 104, Archivo 14 labels   |  |       More time on it, earlier    |
     | a placed tile leaves a ghost    |  | [chip][chip][chip]                |
     +---------------------------------+  +  ... four boxes of 392 x 136      +

   Placed items are labelled chips (3D art 32 + the name), so the board reads
   by words as well as pictures. Drag, click-then-click, or [1]-[4] (useDrag
   hotkeys, the keyboard Enter path); [Del] takes one back. Every rule, store
   write and log line comes from useS02Board, shared with the phone. */
import type { CSSProperties } from 'react'
import { motion } from 'motion/react'
import Frame from '../../Frame'
import BoardCanvas from './BoardCanvas'
import { Art } from '../../art'
import { HoverTip } from '../../Chips'
import { label } from '../../content'
import KeyCap from '../../KeyCap'
import type { StatusRow } from '../../Checklist'
import type { GearId, StepProps } from '../../types'
import {
  ART_OF, CAP, COLOR, COPY, FULL_STATE, GLOSS, TOTAL_SLOTS, ZONE_ART, ZONE_IDS, homeOf,
  type S02Board, type ZoneId,
} from './useS02Board'

const W = 936, H = 580
const TRAY_W = 520, BOX_W = 392, BOX_H = 136, BOX_GAP = 12
const CELL_W = 120, CELL_H = 166, ART = 104
const CHIP_W = 118, CHIP_H = 44

type DragApiT = S02Board['d']

export default function S02Desk({ p, B }: { p: StepProps; B: S02Board }) {
  const { order, board, filled, valid, d, stage, trayLit, activeLabel, flash } = B
  const left = TOTAL_SLOTS - filled

  const status: StatusRow[] = ZONE_IDS.map((z) => ({
    id: z,
    label: label('S02', z),
    color: COLOR[z],
    have: board[z].length,
    need: CAP[z],
    flash: flash?.zone === z ? flash.n : undefined,
    note: flash?.zone === z ? `${label('S02', z)} is full: drop on a slot to swap, or take one back first.` : undefined,
  }))

  return (
    <Frame
      id="S02"
      host="native"
      valid={valid}
      onContinue={p.next}
      status={status}
      summary={`${filled} of ${TOTAL_SLOTS} slots filled`}
      holding={activeLabel ?? undefined}
      invalidReason={left > 0 ? `Fill ${left} more slot${left === 1 ? '' : 's'}` : undefined}
    >
      <BoardCanvas w={W} h={H}>
        <div
          {...d.stageProps}
          ref={(el) => { stage.current = el; d.stageProps.ref(el) }}
          className="relative flex h-full w-full items-center justify-between"
          style={d.stageProps.style}
          data-board
          data-desk-board="S02"
        >
          {/* ---------- activities (sources, left) */}
          <div className="relative flex h-full shrink-0 items-center" style={{ width: TRAY_W }} data-tray>
            <div
              {...d.zone('tray')}
              className="absolute inset-0 rounded-[3px] border transition-colors duration-100 data-[over=true]:bg-[rgba(13,12,11,0.035)]"
              style={{
                background: 'rgba(248,247,244,0.93)',
                borderColor: trayLit ? '#8C857A' : '#DDD9D2',
                borderStyle: trayLit ? 'dashed' : 'solid',
                boxShadow: '0 1px 0 rgba(13,12,11,0.04), 0 8px 24px rgba(13,12,11,0.06)',
              }}
              data-testid="zone-tray"
              aria-label="Activities tray"
            />
            <div className="pointer-events-none relative grid w-full grid-cols-4 justify-items-center px-[6px]" style={{ rowGap: 12 }}>
              {order.map((id) => {
                const home = homeOf(board, id)
                const inHand = board.hand[0] === id
                if (home) return <Ghost key={id} id={id} home={home} inHand={inHand} />
                const lifted = d.lifted === id
                return (
                  <div key={id} data-tile={id} className="pointer-events-auto" style={{ width: CELL_W, height: CELL_H }}>
                    <div {...d.item(id, { className: 'group relative flex h-full w-full flex-col items-center pt-[6px] outline-none' })}
                      data-testid={`tile-${id}`} aria-label={label('S02', id)}>
                      <HoverTip text={label('S02', id)} keys="1–4" />
                      <div
                        data-tile-icon={id}
                        data-hover-lift
                        className="relative flex items-center justify-center rounded-[3px] bg-ground"
                        style={{ width: ART, height: ART, boxShadow: lifted ? 'inset 0 0 0 1.5px #0D0C0B' : 'inset 0 0 0 1px #DDD9D2' }}
                      >
                        <Art id={ART_OF[id]} width="80%" height="80%" />
                        {inHand && <span className="absolute right-[6px] top-[6px] h-[9px] w-[9px] rounded-full" style={{ background: COLOR.hand }} aria-hidden />}
                      </div>
                      <TileLabel id={id} lifted={lifted} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* ---------- boxes (targets, right) */}
          <div className="flex h-full shrink-0 flex-col justify-center" style={{ width: BOX_W, gap: BOX_GAP }}>
            {ZONE_IDS.map((z, i) => <ZoneBox key={z} z={z} n={i + 1} B={B} />)}
          </div>
          {d.liveRegion}
        </div>
      </BoardCanvas>
    </Frame>
  )
}

/* ------------------------------------------------------------ a box */

function ZoneBox({ z, n, B }: { z: ZoneId; n: number; B: S02Board }) {
  const { board, d } = B
  const list = board[z]
  const full = list.length >= CAP[z]
  const c = COLOR[z]
  const over = d.over === z || !!d.over?.startsWith(`${z}:`)
  const lit = d.lifted !== null && d.isValid(z)
  return (
    <div
      {...d.zone(z)}
      data-testid={`zone-${z}`}
      data-full={full ? 'true' : undefined}
      className="relative flex flex-col rounded-[3px] px-[14px] pb-[12px] pt-[10px] transition-[box-shadow,background-color] duration-100"
      style={{
        height: BOX_H,
        background: over ? `color-mix(in srgb, ${c} 7%, #F8F7F4)` : 'rgba(248,247,244,0.96)',
        boxShadow: over ? `inset 0 0 0 2px ${c}` : lit ? `inset 0 0 0 1.5px ${c}` : 'inset 0 0 0 1px #DDD9D2, 0 6px 18px rgba(13,12,11,0.05)',
      } as CSSProperties}
    >
      <div className="flex items-start gap-[12px]">
        <motion.div
          className="-mt-[2px] flex h-[62px] w-[62px] shrink-0 items-center justify-center"
          key={full ? 'full' : 'open'}
          initial={{ scale: full ? 0.86 : 1 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 600, damping: 18 }}
          aria-hidden
        >
          <Art id={ZONE_ART[z]} width={60} height={58} state={full ? FULL_STATE[z] : undefined} />
        </motion.div>
        <div className="min-w-0 flex-1 pt-[2px]">
          <p className="flex items-center gap-[8px] font-[family-name:var(--font-ui)] text-[16px] font-semibold leading-[20px] text-ink">
            <KeyCap k={String(n)} />
            <span className="inline-block h-[8px] w-[8px] shrink-0 rounded-full" style={{ background: c }} aria-hidden />
            <span className="truncate">{label('S02', z)}</span>
            <span className="ml-auto shrink-0 font-normal tabular-nums text-muted">{list.length}/{CAP[z]}</span>
          </p>
          <p className="mt-[3px] font-[family-name:var(--font-text)] text-[14px] italic leading-[18px] text-muted">{GLOSS[z]}</p>
        </div>
      </div>
      <div className="mt-auto flex gap-[7px]">
        {Array.from({ length: CAP[z] }, (_, i) => <Slot key={i} z={z} i={i} id={list[i] ?? null} d={d} />)}
      </div>
    </div>
  )
}

/** A slot: an empty dashed chip, or the placed item as a labelled chip. */
function Slot({ z, i, id, d }: { z: ZoneId; i: number; id: GearId | null; d: DragApiT }) {
  const sid = `${z}:${i}`
  const itemId = id ? (z === 'hand' ? COPY + id : id) : null
  const c = COLOR[z]
  const over = d.over === sid
  return (
    <div {...d.zone(sid)} className="shrink-0" style={{ width: CHIP_W, height: CHIP_H }} data-testid={`slot-${sid}`}>
      {id && itemId ? (
        <div data-tile={itemId} className="h-full w-full">
          <div
            {...d.item(itemId, { className: 'group h-full w-full outline-none' })}
            data-testid={`placed-${sid}`}
            aria-label={`${label('S02', id)}${z === 'hand' ? ' (copy)' : ''}, in ${label('S02', z)}`}
            title={`${label('S02', id)}${z === 'hand' ? ' (a copy)' : ''}`}
          >
            <div
              className="flex h-full w-full items-center gap-[5px] rounded-[3px] bg-paper pl-[5px] pr-[4px] transition-[transform,box-shadow] duration-150 group-hover:-translate-y-[2px] group-hover:shadow-[0_5px_12px_rgba(13,12,11,0.14)]"
              style={{ boxShadow: d.lifted === itemId ? 'inset 0 0 0 1.5px #0D0C0B' : over ? `inset 0 0 0 2px ${c}` : `inset 0 0 0 1px ${c}` }}
            >
              <span data-tile-icon={itemId} className="flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-[2px] bg-ground">
                <Art id={ART_OF[id]} width={28} height={28} />
              </span>
              <span className="line-clamp-3 min-w-0 font-[family-name:var(--font-ui)] text-[12px] leading-[13px] text-ink">
                {label('S02', id)}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div
          className="h-full w-full rounded-[3px] transition-colors duration-100"
          style={{
            border: `1px dashed ${over || d.lifted ? c : '#8C857A'}`,
            background: over ? `color-mix(in srgb, ${c} 10%, transparent)` : 'rgba(255,255,255,0.55)',
          }}
          aria-hidden
        />
      )}
    </div>
  )
}

/* ------------------------------------------------------------ tray bits */

function TileLabel({ id, muted, lifted }: { id: GearId; muted?: boolean; lifted?: boolean }) {
  return (
    <span className={`mt-[6px] line-clamp-2 h-[36px] w-full rounded-[2px] px-[3px] text-center font-[family-name:var(--font-ui)] text-[14px] leading-[18px] ${muted ? 'text-muted' : 'text-ink'} ${lifted ? 'relative z-[1] bg-paper shadow-[0_0_0_1px_#DDD9D2]' : ''}`}>
      {label('S02', id)}
    </span>
  )
}

/** A placed tile's seat in the tray: its label stays, with a dot in the
    colour of each box it went to. */
function Ghost({ id, home, inHand }: { id: GearId; home: ZoneId; inHand: boolean }) {
  return (
    <div className="flex flex-col items-center pt-[6px]" style={{ width: CELL_W, height: CELL_H }} data-ghost={id} aria-hidden>
      <div className="relative flex items-center justify-center rounded-[3px]"
        style={{ width: ART, height: ART, border: '1px dashed #C9C4BB' }}>
        <span className="flex gap-[6px]">
          <span className="h-[10px] w-[10px] rounded-full" style={{ background: COLOR[home] }} />
          {inHand && <span className="h-[10px] w-[10px] rounded-full" style={{ background: COLOR.hand }} />}
        </span>
      </div>
      <TileLabel id={id} muted />
    </div>
  )
}
