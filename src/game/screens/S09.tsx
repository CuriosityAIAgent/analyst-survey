'use client'
/* S09 · Camp III · "Rope up".

   Beat A (rank): eight trait tiles in a per-respondent random order
   (traits.order). Drag three onto the rope's numbered carabiners: clip 1
   leads. Dropping on a filled clip swaps (a tile from another clip trades
   places; a tile from the tray sends the occupant back). A roped tile
   dragged back to the tray comes off. Each clip closes with a click and the
   rope gives a little. Tap-then-tap and keyboard through useDrag.
   Stores traits.top3 (clip order).

   Beat B (swipe): one card, the lead trait (clip 1), born with it or built on
   the climb. Which side is 'born' is seeded per respondent and logged
   (traits.originSides). The two buttons are the primary input; the seed and
   the bootprint sit at the swipe edges, drawn to the same finish, and light
   up as the card leans. Stores traits.leadOrigin. */
import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import Frame from '../Frame'
import SwipeStack, { type SwipeExit } from '../SwipeStack'
import { Art } from '../art'
import { copy, fill, items, label, zones } from '../content'
import { useOrder, useSeeded } from '../store'
import { useDrag } from '../useDrag'
import { useGameCtx } from '../context'
import { buzz, campPaper, sfx } from '../feel'
import GroundBand from '../GroundBand'

/** Labels and empty clips sit on the camp's paper, so the scene's ridge and
    tent never run through them. */
const PAPER3 = campPaper('S09')
import type { StepProps, TraitId } from '../types'

const TRAITS = items('S09') as { id: TraitId; label: string; art: string }[]
const TRAIT_IDS = TRAITS.map((t) => t.id)
const trait = (id: string) => TRAITS.find((t) => t.id === id)!
const CLIPS = zones('S09') // clip1, clip2, clip3
const ORIGIN = zones('S09', 'B') // born, built
const origin = (id: string) => ORIGIN.find((z) => z.id === id)!

type Slots = [TraitId | null, TraitId | null, TraitId | null]

/* A trait tile: 64px art box and a two-line Archivo label. */
function Tile({ id, compact, ground }: { id: TraitId; compact?: boolean; ground?: boolean }) {
  const t = trait(id)
  return (
    <div className="flex w-[84px] flex-col items-center gap-1">
      <div
        className="flex h-16 w-16 items-center justify-center"
        style={{ background: '#FFFFFF', border: '1px solid #8C857A', borderRadius: 3 }}
      >
        <Art id={t.art} size={50} />
      </div>
      {/* one fixed backing per tile (84x30), the text centred in it */}
      <span className="flex h-[30px] w-[84px] items-center justify-center rounded-[2px] px-[3px]" style={{ background: ground ? 'transparent' : PAPER3 }}>
        <span
          className={`text-center font-[family-name:var(--font-ui)] leading-[14px] text-ink ${compact ? 'text-[11.5px]' : 'text-[12px]'}`}
          style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
        >
          {t.label}
        </span>
      </span>
    </div>
  )
}

export default function S09(p: StepProps) {
  return p.beat === 'B' ? <BeatB {...p} /> : <BeatA {...p} />
}

/* ------------------------------------------------------------ Beat A */

function BeatA(p: StepProps) {
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
    labelOf: (id) => (id === 'tray' ? 'Back to the tray' : clipIndex(id) >= 0 ? `Clip ${CLIPS[clipIndex(id)].label}` : label('S09', id)),
    zones: [...CLIPS.map((c) => c.id), 'tray'],
    canDrop: (item, z) => {
      const s = slotsRef.current
      if (z === 'tray') return s.includes(item as TraitId)
      const k = clipIndex(z)
      return k >= 0 && s[k] !== item
    },
    onDrop: (item, zone, via) => {
      const s = [...slotsRef.current] as Slots
      const id = item as TraitId
      const from = s.indexOf(id)
      if (zone === 'tray') {
        if (from < 0) return false
        s[from] = null
        commit(s)
        p.log('unclip', { item, from: from + 1, via })
        return
      }
      const k = zone ? clipIndex(zone) : -1
      if (k < 0) return false
      const occupant = s[k]
      s[k] = id
      if (from >= 0) s[from] = occupant && occupant !== id ? occupant : null
      commit(s)
      p.log('clip', { item, clip: k + 1, via, from: from >= 0 ? from + 1 : 'tray', swapped: occupant ?? null })
      sfx('click', ctx.sound)
      buzz()
      setClicked((c) => ({ k, n: (c?.n ?? 0) + 1 }))
    },
  })

  const valid = slots.every(Boolean)
  const inTray = order.filter((id) => !slots.includes(id))

  return (
    <Frame id="S09" beat="A" valid={valid} onContinue={p.next}>
      <div {...d.stageProps} className="flex h-full flex-col justify-center gap-4 px-5 pb-2" data-s09a>
        <style>{`
          [data-s09a] [data-clip-slot] { background: ${PAPER3}; transition: border-color 120ms ease, background-color 120ms ease; }
          [data-s09a] [data-zone][data-valid="true"] [data-clip-slot] { border-color: #1F4B3A; }
          [data-s09a] [data-zone][data-over="true"] [data-clip-slot] { border-style: solid; background: color-mix(in srgb, #1F4B3A 7%, ${PAPER3}); }
          [data-s09a] [data-zone="tray"][data-valid="true"] { outline: 1.5px dashed #1F4B3A; outline-offset: 2px; }
          [data-s09a] [data-zone="tray"][data-over="true"] { background: rgba(31,75,58,0.05); }
        `}</style>

        {/* the rope, strung across the ridge, with three numbered carabiners */}
        <div className="relative h-[168px] shrink-0" data-rope>
          <motion.div
            key={clicked?.n ?? 0}
            className="pointer-events-none absolute inset-x-0 top-0"
            style={{ transformOrigin: '50% 0%' }}
            initial={clicked && !p.reduced ? { rotate: clicked.k === 0 ? -0.8 : clicked.k === 2 ? 0.8 : 0, y: 2 } : false}
            animate={{ rotate: 0, y: 0 }}
            transition={{ type: 'spring', stiffness: 420, damping: 12 }}
            aria-hidden
          >
            <Art id="rope-clips" width="100%" height={78} value={3} data={{ filled: slots.map(Boolean) }} />
          </motion.div>
          <div className="absolute inset-0 grid grid-cols-3">
            {CLIPS.map((c, k) => {
              const id = slots[k]
              return (
                <div key={c.id} {...d.zone(c.id)} className="relative flex flex-col items-center pt-[53px]"
                  data-testid={`clip-${k + 1}`} aria-label={`${c.label}: ${id ? trait(id).label : 'empty'}`}>
                  {id ? (
                    <motion.div
                      key={id}
                      initial={p.reduced ? { opacity: 0 } : { y: -10, scale: 1.08, opacity: 0.6 }}
                      animate={{ y: 0, scale: 1, opacity: 1 }}
                      transition={p.reduced ? { duration: 0.12 } : { type: 'spring', stiffness: 520, damping: 20 }}
                    >
                      <div {...d.item(id, { disabled: p.covered })} data-testid={`tile-${id}`}>
                        <Tile id={id} compact />
                      </div>
                    </motion.div>
                  ) : (
                    <div className="flex w-[84px] flex-col items-center gap-1">
                      <div data-clip-slot className="flex h-16 w-16 items-center justify-center border border-dashed text-center" style={{ borderColor: '#8C857A', borderRadius: 3 }}>
                        <span className="font-[family-name:var(--font-ui)] text-[10.5px] font-medium uppercase leading-[14px] tracking-[0.12em] text-muted">
                          {c.label.split(' ')[0]}<br />{c.label.split(' ').slice(1).join(' ')}
                        </span>
                      </div>
                      <span style={{ minHeight: 30 }} />
                    </div>
                  )}
                  {id && (
                    <span className="mt-[1px] rounded-[2px] px-[5px] font-[family-name:var(--font-ui)] text-[9.5px] font-medium uppercase leading-[14px] tracking-[0.14em] text-muted"
                      style={{ background: PAPER3 }}>
                      {c.label}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* the tray: 4 x 2, the roped ones leave their place empty */}
        <div {...d.zone('tray')} className="relative grid shrink-0 grid-cols-4 justify-items-center gap-x-1 gap-y-2 rounded-[3px] py-1" data-testid="tray">
          {/* the tray sits on solid ground: no slope lines or tents behind it */}
          <GroundBand camp={3} top={-8} bleed={32} />
          {order.map((id) =>
            inTray.includes(id) ? (
              <div key={id} {...d.item(id, { disabled: p.covered, className: "relative z-[1]" })} data-testid={`tile-${id}`}>
                {/* on the ground band nothing runs behind the label: no backing */}
                <Tile id={id} ground={d.lifted !== id} />
              </div>
            ) : (
              <div key={id} className="relative z-[1] flex w-[84px] flex-col items-center gap-1" aria-hidden>
                <div className="h-16 w-16 border border-dashed" style={{ borderColor: '#B9B3A9', borderRadius: 3 }} />
                <span style={{ minHeight: 30 }} />
              </div>
            ),
          )}
        </div>
        {d.liveRegion}
      </div>
    </Frame>
  )
}

/* ------------------------------------------------------------ Beat B */

type LeadCard = { id: string; trait: TraitId }

function BeatB(p: StepProps) {
  const ctx = useGameCtx()
  const lead = p.answers['traits.top3']?.[0]
  const r = useSeeded('traits.originSides')
  const recorded = p.answers['traits.originSides']
  const sides = recorded ?? (r < 0.5 ? 'bornLeft' : 'bornRight')
  const left = sides === 'bornLeft' ? 'born' : 'built'
  const right = left === 'born' ? 'built' : 'born'
  const chosen = p.answers['traits.leadOrigin']
  const [gone, setGone] = useState(false)
  // the card's lean, from the stack, lights the edge glyphs
  const [lean, setLean] = useState(0)

  // the sides are logged the moment they are shown
  useEffect(() => {
    if (!recorded) p.set('traits.originSides', sides)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recorded, sides])

  const t = lead ? trait(lead) : null
  const prompt = fill(copy('S09', 'B').prompt, { leadTrait: t?.label ?? 'The lead trait' })
  const exits: SwipeExit[] = [
    { id: left, label: origin(left).label, dir: 'left' },
    { id: right, label: origin(right).label, dir: 'right' },
  ]
  const cards: LeadCard[] = t && !gone ? [{ id: `lead-${t.id}`, trait: t.id }] : []
  const CW = 230, CH = 262

  const onExit = (_card: string, exitId: string, meta: { via: string; ms: number }) => {
    const answer = exitId as 'born' | 'built'
    setGone(true)
    setLean(0)
    p.setMany({ 'traits.leadOrigin': answer, 'traits.originSides': sides })
    p.log('origin', { trait: lead, answer, side: exitId === left ? 'left' : 'right', via: meta.via, ms: meta.ms })
    p.next()
  }

  const edge = (id: string, side: 'left' | 'right') => {
    const lit = side === 'left' ? Math.max(0, -lean) : Math.max(0, lean)
    return (
      <div className="pointer-events-none absolute flex w-[52px] flex-col items-center gap-1" aria-hidden
        style={{
          top: CH / 2 - 30, [side]: 0,
          opacity: 0.4 + lit * 0.6, transform: `scale(${1 + lit * 0.1})`,
          transition: 'opacity 90ms linear, transform 90ms linear',
        }}
        data-edge={id}>
        <Art id={origin(id).art ?? ''} size={40} />
        <span className="text-center font-[family-name:var(--font-ui)] text-[10px] leading-[12px] text-muted">{side === 'left' ? '\u2190' : '\u2192'}</span>
      </div>
    )
  }

  return (
    <Frame id="S09" beat="B" prompt={prompt} valid={!!chosen} onContinue={p.next}>
      <div className="flex h-full flex-col items-center justify-center px-4 pb-4" data-s09b>
        {t ? (
          <div className="relative w-full">
            {edge(left, 'left')}
            {edge(right, 'right')}
            <SwipeStack<LeadCard>
              cards={cards}
              exits={exits}
              width={CW}
              height={CH}
              depth={0}
              disabled={p.covered || ctx.busy}
              label={`${t.label}. Left arrow: ${origin(left).label}. Right arrow: ${origin(right).label}.`}
              onExit={onExit}
              onLean={(l) => setLean(l)}
              style={{ gap: 20 }}
              renderCard={(c) => (
                <div className="flex h-full w-full flex-col items-center justify-center gap-3 px-4"
                  style={{ background: '#FFFFFF', border: '1px solid #8C857A', borderRadius: 3, boxShadow: '0 2px 0 #DDD9D2, 0 10px 24px rgba(13,12,11,0.10)' }}
                  data-testid="lead-card">
                  <p className="font-[family-name:var(--font-ui)] text-[10.5px] font-medium uppercase tracking-[0.16em] text-muted">{CLIPS[0].label}</p>
                  <Art id={trait(c.trait).art} size={120} title={trait(c.trait).label} />
                  <p className="text-center font-[family-name:var(--font-text)] font-semibold text-[22px] leading-[26px] text-ink">{trait(c.trait).label}</p>
                </div>
              )}
              renderButton={(ex, press, off) => (
                <SideButton id={ex.id} chosen={chosen === ex.id} disabled={off || p.covered} onPress={press} />
              )}
            />
          </div>
        ) : (
          <p className="font-[family-name:var(--font-text)] text-[15px] text-muted">Rope up three traits first.</p>
        )}
      </div>
    </Frame>
  )
}

function SideButton({ id, chosen, disabled, onPress }: { id: string; chosen: boolean; disabled: boolean; onPress: () => void }) {
  const z = origin(id)
  return (
    <button
      type="button"
      className="btn-quiet flex items-center justify-center gap-2"
      style={{ width: 166, minHeight: 56, padding: '6px 8px', background: '#FFFFFF', borderColor: chosen ? '#0D0C0B' : undefined, borderWidth: chosen ? 1.5 : 1 }}
      aria-pressed={chosen}
      disabled={disabled}
      onClick={onPress}
      data-testid={`origin-${id}`}
    >
      <Art id={z.art ?? ''} size={28} />
      <span className="text-[14px] leading-[17px]">{z.label}</span>
    </button>
  )
}
