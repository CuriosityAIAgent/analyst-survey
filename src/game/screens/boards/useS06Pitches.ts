'use client'
/* useS06Pitches: the S06 board ("Who climbs each pitch") behind both views,
   the phone board in S06.tsx and the desk board in S06Desk.tsx (design 5,
   S06 build: "Extract useS06Pitches(p)"). One place for the own-feet cap,
   swaps, pitch.* store writes, logging and the dip / crouch / strain motion
   (both views mark their zone art [data-zone-art=<zone>]).

   Zones: own (at most 2, slots 'own:0' and 'own:1'), withkit, kitdrafts,
   crew (open). The tray zone is 'tray'. */
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { items, plainOf, zones } from '../../content'
import { useDrag, type DropVia } from '../../useDrag'
import { useOrder } from '../../store'
import { useGameCtx } from '../../context'
import { buzz, sfx, useSnap } from '../../feel'
import type { PitchId, PitchZone, StepProps } from '../../types'

export type Pitch = { id: PitchId; label: string; art: string }
export const PITCHES: Pitch[] = items('S06').map((it) => ({ id: it.id as PitchId, label: it.label, art: String(it.art) }))
export const P_BY_ID = new Map(PITCHES.map((x) => [x.id, x]))
export const PITCH_IDS = PITCHES.map((x) => x.id)
export const ZONES = zones('S06').map((z) => ({
  id: z.id as PitchZone, label: z.label, art: String(z.art), slots: z.slots,
  /** The plain category ('The Analyst, no AI'), shown first. */
  plain: plainOf('S06', z.id) ?? z.label,
}))
export const Z_BY_ID = new Map(ZONES.map((z) => [z.id, z]))
export const OWN_MAX = Number(Z_BY_ID.get('own')?.slots ?? 2)
export const SLOT_IDS = Array.from({ length: OWN_MAX }, (_, i) => `own:${i}`)
/** Desk keys: [1]-[4] send the task you're on to a box; Delete takes it back. */
export const S06_KEYS: Record<string, string> = { 1: 'own', 2: 'withkit', 3: 'kitdrafts', 4: 'crew', Delete: 'tray', Backspace: 'tray' }
/** Names for announcements: the plain category first. */
export const nameOf = (id: string) =>
  P_BY_ID.get(id as PitchId)?.label ?? Z_BY_ID.get(id as PitchZone)?.plain ??
  (id.startsWith('own:') ? `${Z_BY_ID.get('own')?.plain}, slot ${Number(id.slice(4)) + 1}` : id === 'tray' ? 'the tray' : id)

export type ZoneMap = Partial<Record<PitchId, PitchZone>>

export function useS06Pitches(p: StepProps, opts: { desk?: boolean } = {}) {
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
    hotkeys: opts.desk ? S06_KEYS : undefined,
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


  const onContinue = () => {
    // pitch.firstOwn is PitchId | null: record the null when none went on their own feet
    if (p.answers['pitch.firstOwn'] === undefined) p.set('pitch.firstOwn', null)
    p.next()
  }
  const placedCount = PITCH_IDS.filter((id) => !!zmap[id]).length

  return { order, zmap, placedAll, placedCount, stageRef, capture, ownSlots, ownCount, ownState, d, refusedOver, lit, onContinue }
}

export type S06Pitches = ReturnType<typeof useS06Pitches>
