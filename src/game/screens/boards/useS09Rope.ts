'use client'
/* useS09Rope: S09 Beat A ("Rope up": rank 3 of 8 traits onto the rope's
   three clips) behind both views, the phone rope in S09.tsx and the desk
   rope in S09Desk.tsx (design 5, S09 A build: "Extract useS09Rope(p)").
   One place for the clip / swap / unclip rules, traits.top3 and the logs.
   Dropping on a filled clip swaps (a trait from another clip trades places,
   one from the tray sends the occupant back); a roped trait dropped on the
   tray comes off. */
import { useRef, useState } from 'react'
import { items, label, zones } from '../../content'
import { useOrder } from '../../store'
import { useDrag } from '../../useDrag'
import { useGameCtx } from '../../context'
import { buzz, sfx } from '../../feel'
import type { StepProps, TraitId } from '../../types'

export const TRAITS = items('S09') as { id: TraitId; label: string; art: string }[]
export const TRAIT_IDS = TRAITS.map((t) => t.id)
export const trait = (id: string) => TRAITS.find((t) => t.id === id)!
export const CLIPS = zones('S09') // clip1, clip2, clip3
/** Desk keys: [1][2][3] clip the trait you're on; Delete unclips it. */
export const S09_KEYS: Record<string, string> = { 1: 'clip1', 2: 'clip2', 3: 'clip3', Delete: 'tray', Backspace: 'tray' }

export type Slots = [TraitId | null, TraitId | null, TraitId | null]

/** Apply a drop to the rope. null = refused. Pure, for tests. */
export function ropeDrop(s0: Slots, item: TraitId, zone: string): Slots | null {
  const s = [...s0] as Slots
  const from = s.indexOf(item)
  if (zone === 'tray') {
    if (from < 0) return null
    s[from] = null
    return s
  }
  const k = CLIPS.findIndex((c) => c.id === zone)
  if (k < 0) return null
  const occupant = s[k]
  s[k] = item
  if (from >= 0) s[from] = occupant && occupant !== item ? occupant : null
  return s
}

export function useS09Rope(p: StepProps, opts: { desk?: boolean } = {}) {
  const ctx = useGameCtx()
  const order = useOrder('traits.order', TRAIT_IDS)
  const [slots, setSlots] = useState<Slots>(() => {
    const t = p.answers['traits.top3'] ?? []
    return [t[0] ?? null, t[1] ?? null, t[2] ?? null]
  })
  const slotsRef = useRef(slots)
  slotsRef.current = slots
  const [clicked, setClicked] = useState<{ k: number; n: number } | null>(null)

  const commit = (next: Slots) => {
    setSlots(next)
    const top3 = next.filter(Boolean) as TraitId[]
    if (top3.length) p.set('traits.top3', top3)
    else p.unset('traits.top3')
  }

  const clipIndex = (z: string) => CLIPS.findIndex((c) => c.id === z)

  const d = useDrag({
    disabled: p.covered,
    hotkeys: opts.desk ? S09_KEYS : undefined,
    labelOf: (id) => (id === 'tray' ? 'Back to the tray' : clipIndex(id) >= 0 ? `Clip ${CLIPS[clipIndex(id)].label}` : label('S09', id)),
    zones: [...CLIPS.map((c) => c.id), 'tray'],
    canDrop: (item, z) => {
      const s = slotsRef.current
      if (z === 'tray') return s.includes(item as TraitId)
      const k = clipIndex(z)
      return k >= 0 && s[k] !== item
    },
    onDrop: (item, zone, via) => {
      const s0 = slotsRef.current
      const id = item as TraitId
      const from = s0.indexOf(id)
      const next = zone ? ropeDrop(s0, id, zone) : null
      if (!next || !zone) return false
      commit(next)
      if (zone === 'tray') {
        p.log('unclip', { item, from: from + 1, via })
        return
      }
      const k = clipIndex(zone)
      const occupant = s0[k]
      p.log('clip', { item, clip: k + 1, via, from: from >= 0 ? from + 1 : 'tray', swapped: occupant ?? null })
      sfx('click', ctx.sound)
      buzz()
      setClicked((c) => ({ k, n: (c?.n ?? 0) + 1 }))
    },
  })

  const valid = slots.every(Boolean)
  const inTray = order.filter((id) => !slots.includes(id))
  return { order, slots, clicked, d, valid, inTray }
}

export type S09Rope = ReturnType<typeof useS09Rope>
