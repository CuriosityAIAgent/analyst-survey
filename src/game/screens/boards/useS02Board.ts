'use client'
/* useS02Board: the S02 board ("Kit them out") behind both views, the phone
   board in S02.tsx and the desk board in S02Desk.tsx (design 5, S02 build:
   "Extract the board rules into useS02Board(p)"). One place for the drop
   rules, the store writes, the logging and the FLIP settle, so both channels
   store identical answers for identical drops.

   Zones (spec ids): rucksack 3 (Green), hand 1 (Blue, takes a COPY),
   out 2 (Red), rerig 2 (Amber). Slots are addressed 'zone:i'; the hand's copy
   is the item 'copy:<id>'. */
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { items, label, plainOf, zones } from '../../content'
import { useDrag, type DropVia } from '../../useDrag'
import { useOrder } from '../../store'
import { useGameCtx } from '../../context'
import { buzz, sfx, SPRING } from '../../feel'
import type { GearId, StepProps } from '../../types'

export type ZoneId = 'rucksack' | 'hand' | 'out' | 'rerig'
export type Board = Record<ZoneId, GearId[]>

export const ITEMS = items('S02')
export const ZONES = zones('S02')
export const GEAR_IDS = ITEMS.map((i) => i.id as GearId)
export const ART_OF: Record<string, string> = Object.fromEntries(ITEMS.map((i) => [i.id, String(i.art)]))
export const ZONE_IDS = ZONES.map((z) => z.id as ZoneId)
export const CAP = Object.fromEntries(ZONES.map((z) => [z.id, Number(z.slots ?? 1)])) as Record<ZoneId, number>
export const ZONE_ART = Object.fromEntries(ZONES.map((z) => [z.id, String(z.art)])) as Record<ZoneId, string>
/** Deck vote colours: forest (Green), navy (Blue), ink (Red), bronze (Amber). */
export const COLOR: Record<ZoneId, string> = { rucksack: '#1F4B3A', hand: '#14233B', out: '#0D0C0B', rerig: '#7A3E12' }
/** The art state each zone takes when it is full. */
export const FULL_STATE: Record<ZoneId, string> = { rucksack: 'zipped', hand: 'closed', out: 'folded', rerig: 'spliced' }
/** Zones a tile can live in (the hand holds a copy). */
export const PACKS: ZoneId[] = ['rucksack', 'out', 'rerig']
export const COPY = 'copy:'
export const TOTAL_SLOTS = ZONE_IDS.reduce((n, z) => n + CAP[z], 0)
/** The plain gloss under each box name (spec zones[].plain). */
export const GLOSS = Object.fromEntries(ZONE_IDS.map((z) => [z, plainOf('S02', z) ?? ''])) as Record<ZoneId, string>
/** Desk keys: [1]-[4] send the item you're on to a box; Delete takes it back. */
export const S02_KEYS: Record<string, string> = { 1: 'rucksack', 2: 'hand', 3: 'out', 4: 'rerig', Delete: 'tray', Backspace: 'tray' }

/* ------------------------------------------------------------ board model (pure) */

export function boardOf(a: StepProps['answers']): Board {
  return {
    rucksack: [...(a['vote.green'] ?? [])],
    hand: a['vote.blue'] ? [a['vote.blue']] : [],
    out: [...(a['vote.red'] ?? [])],
    rerig: [...(a['vote.amber'] ?? [])],
  }
}
export const homeOf = (b: Board, id: GearId): ZoneId | null => PACKS.find((z) => b[z].includes(id)) ?? null

export type DropResult = { board: Board; swapped?: GearId; noop?: boolean } | null

/** Apply a drop to the board. null = refused (bounce). Pure, for tests. */
export function applyDrop(b0: Board, item: string, zone: string | null): DropResult {
  const b: Board = { rucksack: [...b0.rucksack], hand: [...b0.hand], out: [...b0.out], rerig: [...b0.rerig] }
  // the hand's copy: back to the tray (or off the board) clears the hand;
  // it can't be packed anywhere else
  if (item.startsWith(COPY)) {
    if (zone === null || zone === 'tray') { b.hand = []; return { board: b } }
    if (zone === 'hand' || zone === 'hand:0') return { board: b, noop: true }
    return null
  }
  const id = item as GearId
  const from = homeOf(b, id)
  if (zone === null || zone === 'tray') {
    if (!from) return { board: b, noop: true }
    b[from] = b[from].filter((x) => x !== id)
    return { board: b }
  }
  const [zs, ss] = zone.split(':')
  const z = zs as ZoneId
  if (!ZONE_IDS.includes(z)) return null
  const slot = ss === undefined ? null : Number(ss)

  if (z === 'hand') {
    if (b.hand[0] === id) return { board: b, noop: true }
    if (slot === null && b.hand.length >= CAP.hand) return null // full body: bounce
    const swapped = b.hand[0]
    b.hand = [id] // a copy: the original stays where it is
    return { board: b, swapped }
  }

  const list = b[z]
  if (slot === null) {
    if (from === z) return { board: b, noop: true }
    if (list.length >= CAP[z]) return null // full body: bounce
    if (from) b[from] = b[from].filter((x) => x !== id)
    b[z] = [...list, id]
    return { board: b }
  }
  const occupant = list[slot] as GearId | undefined
  if (occupant === id) return { board: b, noop: true }
  if (from === z) {
    // reorder inside one zone: swap the two positions
    if (!occupant) return { board: b, noop: true }
    const i = list.indexOf(id)
    const next = [...list]
    next[i] = occupant; next[slot] = id
    b[z] = next
    return { board: b, swapped: occupant }
  }
  if (!occupant) {
    if (list.length >= CAP[z]) return null
    if (from) b[from] = b[from].filter((x) => x !== id)
    b[z] = [...list, id]
    return { board: b }
  }
  // swap across zones (or with the tray): the occupant goes where the tile came from
  const next = [...list]
  next[slot] = id
  if (from) {
    const fl = [...b[from]]
    fl[fl.indexOf(id)] = occupant
    b[from] = fl
  }
  b[z] = next
  return { board: b, swapped: occupant }
}

/** The answers a board stores (same keys and values on both channels). */
export function answersOf(b: Board, prevGreenOrder: GearId[] = []): StepProps['answers'] {
  const green = b.rucksack
  const prevOrder = prevGreenOrder.filter((x) => green.includes(x))
  const greenOrder = [...prevOrder, ...green.filter((x) => !prevOrder.includes(x))]
  const blue = b.hand[0] ?? null
  return {
    'vote.green': green,
    'vote.greenOrder': greenOrder,
    'vote.blue': blue,
    'vote.blueAlsoGreen': blue !== null && green.includes(blue),
    'vote.red': b.out,
    'vote.amber': b.rerig,
  }
}

/* ------------------------------------------------------------ the hook */

export function useS02Board(p: StepProps, opts: { desk?: boolean } = {}) {
  const ctx = useGameCtx()
  const order = useOrder('tray.order', GEAR_IDS)
  const a = p.answers
  const board = boardOf(a)
  const filled = ZONE_IDS.reduce((n, z) => n + board[z].length, 0)
  const valid = PACKS.every((z) => board[z].length === CAP[z]) && board.hand.length === 1

  const stage = useRef<HTMLElement | null>(null)
  const before = useRef<Map<string, DOMRect> | null>(null)
  const [flip, setFlip] = useState(0)
  /** A refused drop on a full box: its status row flashes (desk). */
  const [flash, setFlash] = useState<{ zone: ZoneId; n: number } | null>(null)
  /** How the current lift began: a pointer drag may be let go over the tray
      (a quiet put-back), which the keyboard never needs to offer. */
  const liftVia = useRef<DropVia | null>(null)
  // the refusal note fades after a moment
  useEffect(() => {
    if (!flash) return
    const t = window.setTimeout(() => setFlash(null), 2800)
    return () => clearTimeout(t)
  }, [flash])

  /* snapshot every tile icon (including a lifted tile's drag offset) */
  const snapshot = () => {
    const m = new Map<string, DOMRect>()
    stage.current?.querySelectorAll<HTMLElement>('[data-tile-icon]').forEach((el) => {
      m.set(el.dataset.tileIcon!, el.getBoundingClientRect())
    })
    return m
  }

  /* FLIP: after a drop, every tile that moved springs from where it was */
  useLayoutEffect(() => {
    const prev = before.current
    before.current = null
    if (!prev || p.reduced || !stage.current) return
    stage.current.querySelectorAll<HTMLElement>('[data-tile]').forEach((wrap) => {
      const key = wrap.dataset.tile!
      const icon = wrap.querySelector<HTMLElement>('[data-tile-icon]')
      const from = prev.get(key) ?? (key.startsWith(COPY) ? prev.get(key.slice(COPY.length)) : undefined)
      if (!icon || !from) return
      const to = icon.getBoundingClientRect()
      const w = wrap.getBoundingClientRect()
      const dx = from.left - to.left, dy = from.top - to.top, s = from.width / (to.width || 1)
      if (Math.abs(dx) < 1 && Math.abs(dy) < 1 && Math.abs(s - 1) < 0.02) return
      // the offset is in screen px; under a scaled desk canvas, divide by k
      const k = to.width && icon.offsetWidth ? to.width / icon.offsetWidth : 1
      wrap.style.transformOrigin = `${(to.left - w.left) / k}px ${(to.top - w.top) / k}px`
      wrap.animate(
        [{ transform: `translate(${dx / k}px, ${dy / k}px) scale(${s})` }, { transform: 'none' }],
        { duration: 180, easing: SPRING },
      )
    })
  }, [flip, p.reduced])

  const labelOf = (id: string): string => {
    if (id === 'tray') return 'Back to the tray'
    if (id.startsWith(COPY)) return `${label('S02', id.slice(COPY.length))}, the copy in the hand`
    const [z, s] = id.split(':')
    if (ZONE_IDS.includes(z as ZoneId)) {
      const zl = label('S02', z)
      if (s === undefined) return zl
      const occ = board[z as ZoneId][Number(s)]
      return `${zl}, slot ${Number(s) + 1}${occ ? `, holding ${label('S02', occ)}` : ', empty'}`
    }
    return label('S02', id)
  }

  const d = useDrag({
    labelOf,
    disabled: p.covered,
    zones: ['rucksack', 'hand', 'out', 'rerig', 'tray'],
    hotkeys: opts.desk ? S02_KEYS : undefined,
    canDrop: (item, zone) => {
      if (item.startsWith(COPY)) return zone === 'tray' || zone.startsWith('hand')
      if (zone === 'tray') return homeOf(board, item as GearId) !== null || liftVia.current === 'pointer'
      return true
    },
    onDrop: (item, zone, via: DropVia) => {
      const r = applyDrop(board, item, zone)
      if (!r) {
        p.log('bounce', { item, zone, via })
        sfx('bounce', ctx.sound)
        const z = zone?.split(':')[0] as ZoneId | undefined
        if (z && ZONE_IDS.includes(z)) setFlash((f) => ({ zone: z, n: (f?.n ?? 0) + 1 }))
        return false
      }
      before.current = snapshot()
      setFlip((n) => n + 1)
      if (r.noop) return true
      const wasFull = board.rucksack.length === CAP.rucksack
      p.setMany(answersOf(r.board, a['vote.greenOrder'] ?? []))
      buzz()
      sfx(!wasFull && r.board.rucksack.length === CAP.rucksack ? 'zip' : 'drop', ctx.sound)
      p.log('drop', { item, zone, via, swapped: r.swapped ?? null })
      return true
    },
    onLift: (item, via) => { liftVia.current = via; p.log('lift', { item, via }) },
  })

  const trayLit = d.lifted !== null && (d.lifted.startsWith(COPY) || homeOf(board, d.lifted as GearId) !== null)
  const nameOf = (id: string | null) => (id ? labelOf(id).replace(', the copy in the hand', ' (copy)') : null)

  return {
    order, board, filled, valid, d, stage, flash, trayLit, labelOf,
    /** The lifted item's name (the phone's 'Holding' line). */
    liftedLabel: nameOf(d.lifted),
    /** The lifted, hovered or focused item's name (the desk's 'Holding' line). */
    activeLabel: nameOf(d.active),
  }
}

export type S02Board = ReturnType<typeof useS02Board>
