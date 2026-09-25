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
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import Frame from '../Frame'
import { Art } from '../art'
import { ZONE_VIEWBOX } from '../art/pitches'
import { items, zones } from '../content'
import { useDrag, type DropVia } from '../useDrag'
import { useOrder } from '../store'
import { useGameCtx } from '../context'
import { buzz, sfx, useSnap } from '../feel'
import GroundBand from '../GroundBand'
import { NameTip } from '../Chips'
import type { PitchId, PitchZone, StepProps } from '../types'

type Pitch = { id: PitchId; label: string; art: string }
const PITCHES: Pitch[] = items('S06').map((it) => ({ id: it.id as PitchId, label: it.label, art: String(it.art) }))
const P_BY_ID = new Map(PITCHES.map((x) => [x.id, x]))
const PITCH_IDS = PITCHES.map((x) => x.id)
const ZONES = zones('S06').map((z) => ({ id: z.id as PitchZone, label: z.label, art: String(z.art), slots: z.slots }))
const Z_BY_ID = new Map(ZONES.map((z) => [z.id, z]))
const OWN_MAX = Number(Z_BY_ID.get('own')?.slots ?? 2)
const SLOT_IDS = Array.from({ length: OWN_MAX }, (_, i) => `own:${i}`)
const nameOf = (id: string) =>
  P_BY_ID.get(id as PitchId)?.label ?? Z_BY_ID.get(id as PitchZone)?.label ??
  (id.startsWith('own:') ? `${Z_BY_ID.get('own')?.label}, slot ${Number(id.slice(4)) + 1}` : id === 'tray' ? 'the tray' : id)

type ZoneMap = Partial<Record<PitchId, PitchZone>>

export default function S06(p: StepProps) {
  const ctx = useGameCtx()
  const order = useOrder('pitch.order', PITCH_IDS)
  const zmap: ZoneMap = useMemo(() => p.answers['pitch.zone'] ?? {}, [p.answers])
  const placedAll = PITCH_IDS.every((id) => !!zmap[id])
  const stageRef = useRef<HTMLDivElement | null>(null)
  const capture = useSnap(stageRef, p.reduced)

  /* ---- which own-feet slot each own pitch sits in (display only) */
  const [slotPref, setSlotPref] = useState<Partial<Record<PitchId, number>>>({})
  const ownSlots: (PitchId | null)[] = useMemo(() => {
    const out: (PitchId | null)[] = Array(OWN_MAX).fill(null)
    const own = order.filter((id) => zmap[id] === 'own')
    for (const id of own) {
      const s = slotPref[id]
      if (s !== undefined && out[s] === null) out[s] = id
    }
    for (const id of own) if (!out.includes(id)) { const f = out.indexOf(null); if (f >= 0) out[f] = id }
    return out
  }, [order, zmap, slotPref])
  const ownCount = ownSlots.filter(Boolean).length

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
  }, [])
  const GAP = 8, TRAY_H = 100
  const zw = Math.min(190, (box.w - 20 - GAP) / 2)
  const k = zw / ZONE_VIEWBOX[0]
  const artH = ZONE_VIEWBOX[1] * k
  const zh = Math.max(artH, Math.min(150, (box.h - TRAY_H - GAP - 36) / 2))
  // placed tiles and own-feet slots are 44px or more (touch targets)
  const TILE = 44

  /* ---- motion: every zone that takes a pitch dips alike; own feet crouches */
  const [ownState, setOwnState] = useState<'crouch' | 'strain' | undefined>(undefined)
  const timers = useRef<number[]>([])
  const dip = (zone: PitchZone) => {
    const el = stageRef.current?.querySelector<HTMLElement>(`[data-zone-art="${zone}"]`)
    if (!p.reduced) el?.animate?.(
      [{ transform: 'translateY(0) scaleY(1)' }, { transform: 'translateY(2px) scaleY(0.965)' }, { transform: 'translateY(0) scaleY(1)' }],
      { duration: 380, easing: 'cubic-bezier(.3,.7,.3,1.2)' },
    )
    if (zone === 'own') {
      timers.current.forEach(clearTimeout)
      setOwnState('crouch')
      timers.current = [window.setTimeout(() => setOwnState(undefined), 260)]
    }
  }
  const strain = () => {
    const el = stageRef.current?.querySelector<HTMLElement>('[data-zone-art="own"]')
    if (!p.reduced) el?.animate?.(
      [{ transform: 'rotate(0)' }, { transform: 'rotate(-1.2deg)' }, { transform: 'rotate(1.2deg)' }, { transform: 'rotate(0)' }],
      { duration: 200, easing: 'ease-in-out' },
    )
    timers.current.forEach(clearTimeout)
    setOwnState('strain')
    timers.current = [window.setTimeout(() => setOwnState(undefined), 200)]
    buzz([6, 30, 6])
  }
  useLayoutEffect(() => () => timers.current.forEach(clearTimeout), [])

  /* ---- placing */
  const commit = (next: ZoneMap, item: PitchId, to: PitchZone | null, from: PitchZone | null, via: DropVia, extra?: Record<string, unknown>) => {
    const patch: Parameters<typeof p.setMany>[0] = { 'pitch.zone': next }
    if (to === 'own' && (p.answers['pitch.firstOwn'] ?? null) === null) patch['pitch.firstOwn'] = item
    p.setMany(patch)
    p.log('drop', { item, zone: to ?? 'tray', from: from ?? 'tray', via, ...extra })
    if (to) { buzz(); sfx('stud', ctx.sound, { pitch: 0.55 }); dip(to) }
  }

  const onDrop = (itemS: string, zone: string | null, via: DropVia): boolean | void => {
    const item = itemS as PitchId
    const from = zmap[item] ?? null
    capture(item)
    if (zone === null) return false
    if (zone === 'tray') {
      if (!from) return
      const next = { ...zmap }; delete next[item]
      commit(next, item, null, from, via)
      return
    }
    if (zone.startsWith('own:')) {
      const slot = Number(zone.slice(4))
      const occupant = ownSlots[slot]
      if (occupant === item) return
      if (!occupant) {
        if (from !== 'own' && ownCount >= OWN_MAX) { strain(); return false }
        setSlotPref((s) => ({ ...s, [item]: slot }))
        commit({ ...zmap, [item]: 'own' }, item, 'own', from, via)
        return
      }
      // swap: the occupant goes wherever the dropped pitch came from
      capture(occupant)
      const next: ZoneMap = { ...zmap, [item]: 'own' }
      if (from) next[occupant] = from
      else delete next[occupant]
      const otherSlot = from === 'own' ? ownSlots.indexOf(item) : -1
      setSlotPref((s) => ({ ...s, [item]: slot, ...(otherSlot >= 0 ? { [occupant]: otherSlot } : {}) }))
      commit(next, item, 'own', from, via, { swapped: occupant })
      return
    }
    const to = zone as PitchZone
    if (to === from) return
    if (to === 'own' && ownCount >= OWN_MAX) { strain(); return false }
    if (to === 'own') setSlotPref((s) => ({ ...s, [item]: ownSlots.indexOf(null) }))
    commit({ ...zmap, [item]: to }, item, to, from, via)
  }

  /* where a lifted pitch may go: a full own-feet zone refuses a newcomer
     (its occupied slots still take a swap), so it neither glows nor takes it */
  const canDrop = (itemS: string, z: string) => {
    const it = itemS as PitchId
    if (z === 'tray') return !!zmap[it]
    if (z === 'own') return zmap[it] === 'own' || ownCount < OWN_MAX
    if (z.startsWith('own:')) {
      const occ = ownSlots[Number(z.slice(4))]
      return occ ? occ !== it : zmap[it] === 'own' || ownCount < OWN_MAX
    }
    return true // (its own zone again is a quiet no-op, not a refusal)
  }

  const d = useDrag({
    disabled: p.covered,
    zones: ['own', 'withkit', 'kitdrafts', 'crew', 'tray'],
    labelOf: nameOf,
    canDrop,
    // a third pitch on their own feet: it bounces and the strap strains
    onRefuse: (_item, zone) => { if (zone === 'own' || zone.startsWith('own:')) strain() },
    onDrop,
  })

  /* a pitch held over a full 'On their own feet' zone: show the refusal
     while hovering (no fill, a dashed rule border) and start the strap
     strain, not only after release */
  const overOwn = d.over === 'own' || !!d.over?.startsWith('own:')
  const refusedOver = !!d.lifted && overOwn && !d.isValid(d.over!)
  useEffect(() => {
    if (!refusedOver) return
    const el = stageRef.current?.querySelector<HTMLElement>('[data-zone-art="own"]')
    if (!p.reduced) el?.animate?.(
      [{ transform: 'rotate(0)' }, { transform: 'rotate(-1.2deg)' }, { transform: 'rotate(1.2deg)' }, { transform: 'rotate(0)' }],
      { duration: 200, easing: 'ease-in-out' },
    )
    timers.current.forEach(clearTimeout)
    setOwnState('strain')
    return () => setOwnState(undefined)
  }, [refusedOver, p.reduced])

  // outline the zones it could move to (not the one it is already in)
  const lit = (z: string) => d.isValid(z) && (z === 'own' || z === 'tray' || zmap[d.lifted as PitchId] !== z)

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
              <Art id={x.art} size={48} />
            </div>
            <span className={`mt-[4px] max-w-[74px] rounded-[2px] px-[2px] text-center font-[family-name:var(--font-ui)] text-[11.5px] leading-[13px] text-ink ${d.lifted === x.id ? 'bg-paper shadow-[0_0_0_1px_#DDD9D2]' : ''}`}>
              {x.label}
            </span>
          </>
        ) : (
          <div className="group/placed relative flex items-center justify-center border border-ink bg-ground" style={{ width: TILE, height: TILE }} title={x.label}>
            <Art id={x.art} size={TILE - 8} />
            <NameTip text={x.label} />
          </div>
        )}
      </div>
    </div>
  )

  const free = Math.max(0, box.h - (zh * 2 + GAP + TRAY_H))
  const vgap = Math.max(8, Math.min(28, free / 3))

  return (
    <Frame id="S06" valid={placedAll} onContinue={() => {
      // pitch.firstOwn is PitchId | null: record the null when none went on their own feet
      if (p.answers['pitch.firstOwn'] === undefined) p.set('pitch.firstOwn', null)
      p.next()
    }}>
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
                aria-label={`${z.label}${z.id === 'own' ? `, ${ownCount} of ${OWN_MAX}` : ''}`}
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
                <span className="pointer-events-none absolute left-[8px] top-[6px] font-[family-name:var(--font-ui)] text-[12.5px] font-medium leading-[15px] text-ink">
                  {z.label}
                </span>
                {/* tiles live in the clear right-hand side of the zone */}
                {z.id === 'own' ? (
                  <div className="absolute flex" style={{ right: 6, top: 26, gap: 4 }}>
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
  const top = 26, bottom = 6
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
