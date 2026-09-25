'use client'
/* S06 desk view (design 5, S06): tasks left, the four "who does it" boxes
   right, each box's plain category first.

     design canvas 936 x 640 (fit-scaled)
     +-- TASKS 220 --------+   +-- 2 x 2 boxes of 340 x 300, gap 16 -----------------+
     | [art 96] Meeting    |   | [1] The Analyst, no AI    | [2] The Analyst, AI helps |
     |          brief      |   |     On their own feet     |     Walk it with kit      |
     | ... five 220 x 112  |   |  [figure 3D]  [chip]      |  [figure]  [chips]        |
     +---------------------+   |               [chip]      |                           |
                               | [3] AI drafts, ...        | [4] Someone else ...      |
                               +-----------------------------------------------------+
   Crouch-and-rise on own feet, the equal dip on every box, the strain and
   the refusal of a third "no AI" task are the phone's (useS06Pitches). */
import type { CSSProperties } from 'react'
import Frame from '../../Frame'
import BoardCanvas from './BoardCanvas'
import { Art } from '../../art'
import { HoverTip } from '../../Chips'
import KeyCap from '../../KeyCap'
import type { StatusRow } from '../../Checklist'
import type { PitchId, StepProps } from '../../types'
import {
  OWN_MAX, P_BY_ID, PITCHES, SLOT_IDS, ZONES, Z_BY_ID, nameOf, type Pitch, type S06Pitches,
} from './useS06Pitches'

const W = 936, H = 640
const TASK_W = 220, CARD_H = 112, CARD_GAP = 10
const ZX = 240, ZW = 340, ZH = 312, ZGAP = 16
const CHIP_W = 150, CHIP_H = 42, CHIP_GAP = 6
const FIG_W = 150, FIG_H = 196
const NAVY = '#14233B'

export default function S06Desk({ p, P }: { p: StepProps; P: S06Pitches }) {
  const { order, zmap, placedAll, placedCount, stageRef, ownSlots, ownCount, d, refusedOver, lit } = P
  const left = PITCHES.length - placedCount

  const status: StatusRow[] = ZONES.map((z) => ({
    id: z.id, label: z.plain, color: NAVY,
    have: order.filter((id) => zmap[id] === z.id).length,
    need: z.id === 'own' ? OWN_MAX : null,
  }))
  const activeName = d.active && P_BY_ID.has(d.active as PitchId) ? P_BY_ID.get(d.active as PitchId)!.label : undefined

  /** A placed task: a labelled chip. */
  const chip = (x: Pitch) => (
    <div
      key={x.id}
      {...d.item(x.id, { className: 'group outline-none' })}
      aria-label={`${x.label}. ${nameOf(zmap[x.id]!)}`}
      data-testid={`pitch-${x.id}`}
      data-where="zone"
      title={x.label}
    >
      <div data-snap className="flex items-center gap-[6px] rounded-[3px] bg-paper pl-[4px] pr-[6px] transition-[transform,box-shadow] duration-150 group-hover:-translate-y-[2px] group-hover:shadow-[0_5px_12px_rgba(13,12,11,0.14)]"
        style={{ width: CHIP_W, height: CHIP_H, boxShadow: d.lifted === x.id ? 'inset 0 0 0 1.5px #0D0C0B' : `inset 0 0 0 1px ${NAVY}` }}>
        <span className="flex h-[34px] w-[46px] shrink-0 items-center justify-center rounded-[2px] bg-ground">
          <Art id={x.art} width={42} height={30} />
        </span>
        <span className="line-clamp-2 min-w-0 font-[family-name:var(--font-ui)] text-[12.5px] leading-[14px] text-ink">{x.label}</span>
      </div>
    </div>
  )

  return (
    <Frame
      id="S06"
      host="native"
      valid={placedAll}
      onContinue={P.onContinue}
      status={status}
      summary={`${placedCount} of ${PITCHES.length} placed · no AI: ${ownCount} of ${OWN_MAX} at most`}
      holding={activeName}
      invalidReason={left ? `Place ${left} more` : undefined}
    >
      <BoardCanvas w={W} h={H}>
        <div
          {...d.stageProps}
          ref={(el) => { d.stageProps.ref(el); stageRef.current = el as HTMLDivElement | null }}
          className="relative h-full w-full"
          style={d.stageProps.style}
          data-testid="s06-stage"
          data-desk-board="S06"
        >
          {/* ---------- tasks (sources, left): the tray zone */}
          <div
            {...d.zone('tray')}
            aria-label="Tasks"
            className="absolute left-0 top-0 flex flex-col justify-center rounded-[3px] transition-colors duration-150"
            style={{
              width: TASK_W, height: H, gap: CARD_GAP,
              background: d.over === 'tray' ? 'rgba(20,35,59,0.05)' : undefined,
              outline: lit('tray') ? '1px dashed #8C857A' : undefined, outlineOffset: 4,
            }}
            data-testid="tray"
            data-lit={lit('tray') ? 'true' : undefined}
          >
            {order.map((id) => {
              const x = P_BY_ID.get(id)!
              const placed = !!zmap[id]
              const body = (
                <div data-hover-lift={placed ? undefined : true} className="flex items-center gap-[10px] rounded-[3px] px-[12px]"
                  style={{
                    width: TASK_W, height: CARD_H,
                    background: placed ? 'rgba(248,247,244,0.82)' : '#F8F7F4',
                    boxShadow: placed ? 'none' : d.lifted === id ? 'inset 0 0 0 1.5px #0D0C0B' : 'inset 0 0 0 1px #DDD9D2, 0 4px 14px rgba(13,12,11,0.06)',
                    border: placed ? '1px dashed #C9C4BB' : undefined,
                  }}>
                  {!placed && (
                    <div className="flex h-[72px] w-[96px] shrink-0 items-center justify-center">
                      <Art id={x.art} width={96} height={64} />
                    </div>
                  )}
                  <div className="min-w-0">
                    <span className={`block font-[family-name:var(--font-ui)] text-[15px] leading-[19px] ${placed ? 'text-muted' : 'text-ink'}`}>{x.label}</span>
                    {placed && (
                      <span className="mt-[3px] block font-[family-name:var(--font-ui)] text-[11px] font-semibold uppercase leading-[14px] tracking-[0.08em] text-muted">
                        {Z_BY_ID.get(zmap[id]!)!.plain}
                      </span>
                    )}
                  </div>
                </div>
              )
              return placed ? (
                <div key={id} aria-hidden data-socket={id}>{body}</div>
              ) : (
                <div key={id} {...d.item(id, { className: 'group relative outline-none' })} aria-label={x.label} data-testid={`pitch-${id}`} data-where="tray">
                  <HoverTip text={x.label} keys="1–4" />
                  <div data-snap>{body}</div>
                </div>
              )
            })}
          </div>

          {/* ---------- the four boxes (targets, right) */}
          {ZONES.map((z, i) => {
            const inZone = order.filter((id) => zmap[id] === z.id)
            const hover = d.over === z.id || (z.id === 'own' && !!d.over?.startsWith('own:'))
            const refused = z.id === 'own' && refusedOver
            const over = hover && !refused
            const col = i % 2, row = Math.floor(i / 2)
            const top = (H - (ZH * 2 + ZGAP)) / 2 + row * (ZH + ZGAP)
            return (
              <div
                key={z.id}
                {...d.zone(z.id)}
                aria-label={`${z.plain}${z.id === 'own' ? `, ${ownCount} of ${OWN_MAX}` : ''}`}
                className="absolute rounded-[3px] transition-[box-shadow,background-color] duration-150"
                style={{
                  left: ZX + col * (ZW + ZGAP), top, width: ZW, height: ZH,
                  background: over ? '#EDECEB' : 'rgba(248,247,244,0.96)',
                  boxShadow: refused ? 'inset 0 0 0 1.5px #8C857A' : over ? `inset 0 0 0 2px ${NAVY}` : lit(z.id) ? 'inset 0 0 0 1.5px rgba(20,35,59,0.55)' : 'inset 0 0 0 1px #DDD9D2, 0 6px 18px rgba(13,12,11,0.05)',
                  outline: refused ? '1.5px dashed #8C857A' : undefined, outlineOffset: -1.5,
                } as CSSProperties}
                data-testid={`zone-${z.id}`}
                data-lit={lit(z.id) ? 'true' : undefined}
                data-refused={refused ? 'true' : undefined}
              >
                {/* plain category first, the world's name under it */}
                <div className="pointer-events-none absolute left-[14px] right-[14px] top-[12px]">
                  <p className="flex items-start gap-[8px] font-[family-name:var(--font-ui)] text-[16px] font-semibold leading-[20px] text-ink">
                    <KeyCap k={String(i + 1)} className="-mt-[1px] shrink-0" />
                    <span>{z.plain}</span>
                  </p>
                  <p className="mt-[2px] font-[family-name:var(--font-text)] text-[14px] italic leading-[18px] text-muted" style={{ paddingLeft: 30 }}>{z.label}</p>
                </div>
                <div className="pointer-events-none absolute bottom-[10px] left-[8px]" style={{ width: FIG_W, height: FIG_H, transformOrigin: '50% 100%' }}
                  data-zone-art={z.id} aria-hidden>
                  <Art id={z.art} width={FIG_W} height={FIG_H} />
                </div>
                {/* placed tasks live in the right column */}
                <div className="absolute flex flex-col" style={{ right: 14, top: 70, gap: CHIP_GAP }}>
                  {z.id === 'own' ? (
                    <>
                      {SLOT_IDS.map((sid, k) => {
                        const occ = ownSlots[k]
                        return (
                          <div key={sid} {...d.zone(sid)} aria-label={nameOf(sid)} data-testid={`slot-${sid}`}
                            className="rounded-[3px]"
                            style={{ width: CHIP_W, height: CHIP_H, outline: occ ? undefined : `1px dashed ${d.over === sid ? NAVY : '#8C857A'}`, outlineOffset: -1 }}>
                            {occ && chip(P_BY_ID.get(occ)!)}
                          </div>
                        )
                      })}
                      <p className="mt-[2px] text-right font-[family-name:var(--font-ui)] text-[12px] leading-[16px] text-muted">Two at most</p>
                    </>
                  ) : (
                    inZone.map((id) => chip(P_BY_ID.get(id)!))
                  )}
                </div>
              </div>
            )
          })}
          {d.liveRegion}
        </div>
      </BoardCanvas>
    </Frame>
  )
}
