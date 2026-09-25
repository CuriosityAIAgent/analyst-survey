'use client'
/* S06 · Camp II · "Who climbs each pitch" (mechanic: pack).

   Five pitches (all work AI can do) into four ground zones in a 2x2 grid:
     own        On their own feet        two slots, at most 2
     withkit    Walk it with kit         unlimited
     kitdrafts  Kit drafts, they check   unlimited
     crew       Base-camp crew           unlimited

   - A pitch dropped on "On their own feet" makes the rookie shoulder it: the
     zone art crouches and rises (zone-ownfeet state 'crouch', then back).
   - A third bounces (the hook's spring back + 2px shake) and the strap
     strains for 200ms (state 'strain').
   - Dropping on an occupied own-feet slot swaps: the pitch that was there goes
     wherever the dropped one came from.
   - Neutral: every zone that takes a pitch dips the same way (equal motion
     for own feet and base-camp crew), one stud click, one haptic.
   - Three input paths via useDrag; tray order is seeded and logged
     (pitch.order); pitch.firstOwn is the first pitch put on their own feet.
   The camp walk (spec walk:true) replaces Continue. */
import { useLayoutEffect, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import Frame from '../Frame'
import { Art } from '../art'
import { ZONE_VIEWBOX } from '../art/pitches'
import { useLayout } from '../layout'
import GroundBand from '../GroundBand'
import { NameTip } from '../Chips'
import type { StepProps } from '../types'
import {
  OWN_MAX, P_BY_ID, SLOT_IDS, ZONES, nameOf, useS06Pitches, type Pitch, type S06Pitches,
} from './boards/useS06Pitches'
import S06Desk from './boards/S06Desk'

/** Placed tiles start under the zone's two-line name (plain, then the world's). */
const TILES_TOP = 48

export default function S06(p: StepProps) {
  const layout = useLayout()
  const P = useS06Pitches(p, { desk: layout !== 'phone' })
  if (layout !== 'phone') return <S06Desk p={p} P={P} />
  return <S06Phone p={p} P={P} />
}

function S06Phone({ p, P }: { p: StepProps; P: S06Pitches }) {
  const { order, zmap, placedAll, stageRef, ownSlots, ownCount, ownState, d, refusedOver, lit } = P

  /* ---- fit */
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
  const GAP = 8, TRAY_H = 100
  const zw = Math.min(190, (box.w - 20 - GAP) / 2)
  const k = zw / ZONE_VIEWBOX[0]
  const artH = ZONE_VIEWBOX[1] * k
  const zh = Math.max(artH, Math.min(150, (box.h - TRAY_H - GAP - 36) / 2))
  // placed tiles and own-feet slots are 44px or more (touch targets)
  const TILE = 44

  const tileEl = (x: Pitch, where: 'tray' | 'zone', style?: CSSProperties) => (
    <div
      key={x.id}
      {...d.item(x.id, { style })}
      aria-label={`${x.label}${zmap[x.id] ? `. ${nameOf(zmap[x.id]!)}` : ''}`}
      data-testid={`pitch-${x.id}`}
      data-where={where}
    >
      <div data-snap className="flex flex-col items-center">
        {where === 'tray' ? (
          <>
            <div className="flex h-[58px] w-[58px] items-center justify-center border border-rule bg-ground">
              <Art id={x.art} width={54} height={48} />
            </div>
            <span className={`mt-[4px] max-w-[74px] rounded-[2px] px-[2px] text-center font-[family-name:var(--font-ui)] text-[11.5px] leading-[13px] text-ink ${d.lifted === x.id ? 'bg-paper shadow-[0_0_0_1px_#DDD9D2]' : ''}`}>
              {x.label}
            </span>
          </>
        ) : (
          <div className="group/placed relative flex items-center justify-center border border-ink bg-ground" style={{ width: TILE, height: TILE }} title={x.label}>
            <Art id={x.art} width={TILE - 6} height={TILE - 8} />
            <NameTip text={x.label} />
          </div>
        )}
      </div>
    </div>
  )

  const free = Math.max(0, box.h - (zh * 2 + GAP + TRAY_H))
  const vgap = Math.max(8, Math.min(28, free / 3))

  return (
    <Frame id="S06" valid={placedAll} onContinue={P.onContinue}>
      <div
        {...d.stageProps}
        ref={(el) => { d.stageProps.ref(el); stageRef.current = el }}
        className="absolute inset-0 flex flex-col items-center justify-center px-[10px]"
        style={{ ...d.stageProps.style, gap: vgap }}
        data-testid="s06-stage"
      >
        {/* ---------- four ground zones, 2x2 */}
        <div className="grid shrink-0 grid-cols-2" style={{ gap: GAP }}>
          {ZONES.map((z) => {
            const inZone = order.filter((id) => zmap[id] === z.id)
            const hover = d.over === z.id || (z.id === 'own' && !!d.over?.startsWith('own:'))
            const refused = z.id === 'own' && refusedOver
            const over = hover && !refused
            return (
              <div
                key={z.id}
                {...d.zone(z.id)}
                aria-label={`${z.plain}${z.id === 'own' ? `, ${ownCount} of ${OWN_MAX}` : ''}`}
                className="relative overflow-hidden border bg-paper transition-[border-color,box-shadow,background-color] duration-150"
                style={{
                  width: zw, height: zh,
                  borderStyle: refused ? 'dashed' : 'solid',
                  borderColor: refused ? '#8C857A' : over ? '#14233B' : lit(z.id) ? 'rgba(20,35,59,0.55)' : '#DDD9D2',
                  boxShadow: over ? 'inset 0 0 0 1px #14233B' : undefined,
                  background: over ? '#EDECEB' : '#F8F7F4',
                }}
                data-testid={`zone-${z.id}`}
                data-lit={lit(z.id) ? 'true' : undefined}
                data-refused={refused ? 'true' : undefined}
              >
                <div className="pointer-events-none absolute inset-x-0 bottom-0" style={{ height: artH, transformOrigin: '50% 100%' }}
                  data-zone-art={z.id} aria-hidden>
                  <Art id={z.art} width={zw} height={artH}
                    state={z.id === 'own' ? ownState : undefined} value={z.id === 'own' ? ownCount : undefined} />
                </div>
                {/* plain category first, the world's name under it */}
                <span className="pointer-events-none absolute left-[8px] right-[6px] top-[5px] z-[1]" data-zone-name>
                  <span className="block font-[family-name:var(--font-ui)] text-[12.5px] font-medium leading-[15px] text-ink">{z.plain}</span>
                  <span className="block font-[family-name:var(--font-text)] text-[11.5px] italic leading-[14px] text-muted">{z.label}</span>
                </span>
                {/* tiles live in the clear right-hand side of the zone */}
                {z.id === 'own' ? (
                  <div className="absolute flex" style={{ right: 6, top: TILES_TOP, gap: 4 }}>
                    {SLOT_IDS.map((sid, i) => {
                      const occ = ownSlots[i]
                      return (
                        <div key={sid} {...d.zone(sid)}
                          className="relative flex items-center justify-center"
                          style={{
                            width: TILE + 2, height: TILE + 2,
                            outline: occ ? undefined : `1px dashed ${d.over === sid ? '#14233B' : '#8C857A'}`, outlineOffset: -2,
                          }}
                          aria-label={nameOf(sid)}
                          data-testid={`slot-${sid}`}>
                          {occ && tileEl(P_BY_ID.get(occ)!, 'zone')}
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <ZoneTiles n={inZone.length} tile={TILE} h={zh}>
                    {inZone.map((id) => tileEl(P_BY_ID.get(id)!, 'zone'))}
                  </ZoneTiles>
                )}
              </div>
            )
          })}
        </div>

        {/* ---------- the tray: five tiles in one row, seats fixed */}
        <div
          {...d.zone('tray')}
          aria-label="Tray"
          className="relative flex shrink-0 items-start justify-between px-[2px] pt-[4px] transition-colors duration-150"
          style={{ width: zw * 2 + GAP, height: TRAY_H, background: d.over === 'tray' ? 'rgba(20,35,59,0.05)' : undefined }}
          data-testid="tray"
          data-lit={lit('tray') ? 'true' : undefined}
        >
          <GroundBand camp={2} top={-6} bleed={(box.w - (zw * 2 + GAP)) / 2 + 12} />
          {order.map((id) => {
            const x = P_BY_ID.get(id)!
            return (
              <div key={id} className="relative z-[1] flex w-[70px] justify-center">
                {zmap[id] ? (
                  // the empty seats fade once every pitch is placed, so the
                  // rookie and 'Walk on' own the foot of the screen
                  <div aria-hidden className="h-[58px] w-[58px] border border-dashed border-rule transition-opacity duration-300" data-socket={id}
                    style={{ opacity: placedAll && !d.lifted ? 0 : 0.7 }} />
                ) : (
                  tileEl(x, 'tray', { minWidth: 58, minHeight: 58 })
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

/** Up to five small tiles in a zone's clear right side: two columns, rows
    overlapping a little when a zone gets crowded. */
function ZoneTiles({ n, tile, h, children }: { n: number; tile: number; h: number; children: ReactNode }) {
  const rows = Math.ceil(n / 2)
  const top = TILES_TOP, bottom = 6
  const step = rows > 1 ? Math.min(tile + 4, (h - top - bottom - tile) / (rows - 1)) : 0
  const kids = Array.isArray(children) ? children : [children]
  return (
    <div className="absolute" style={{ right: 6, top, width: tile * 2 + 4, height: h - top - bottom }}>
      {kids.map((c, i) => (
        <div key={i} className="absolute" style={{ left: (i % 2) * (tile + 4), top: Math.floor(i / 2) * step, zIndex: i }}>
          {c}
        </div>
      ))}
    </div>
  )
}
