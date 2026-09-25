'use client'
/* S09 Beat B on desk · "Born or built" (design 5, S09 B; 9.1).

   The lead trait (clip 1) on one card, 360x420 (its art at 200px, the name
   in Source Serif 26), between two EQUAL side targets, 220x300 each, with
   the origin glyph at 120px and its label. The sides keep the phone's
   SEEDED order (traits.originSides, logged the moment they are shown), and
   each side's arrow key follows it. Click a side, drag the card toward one
   (it lights as the card leans), or press the arrow: all three go through
   SwipeStack's one exit path. No why line (to avoid leading).

   Stores exactly what the phone's Beat B stores: traits.leadOrigin and
   traits.originSides, and logs the same 'origin' event. S09.tsx renders
   this for Beat B when the layout is not 'phone'. */
import { useEffect, useRef, useState } from 'react'
import Frame, { DeskCanvas } from '../Frame'
import SwipeStack, { type SwipeApi, type SwipeExit } from '../SwipeStack'
import { Art } from '../art'
import KeyCap from '../KeyCap'
import { copy, fill, items, zones } from '../content'
import { useSeeded } from '../store'
import { useGameCtx } from '../context'
import { useLayoutInfo } from '../layout'
import { useHotkeys } from '../useHotkeys'
import { sfx } from '../feel'
import type { StepProps, TraitId } from '../types'

const TRAITS = items('S09') as { id: TraitId; label: string; art: string }[]
const trait = (id: string) => TRAITS.find((t) => t.id === id)
const CLIP1 = zones('S09')[0]
const ORIGIN = zones('S09', 'B') // born, built
const origin = (id: string) => ORIGIN.find((z) => z.id === id)!

const DW = 1010, DH = 480
const CW = 360, CH = 420
const SIDE = { w: 220, h: 300 }

type LeadCard = { id: string; trait: TraitId }

export default function S09BDesk(p: StepProps) {
  const ctx = useGameCtx()
  const L = useLayoutInfo()
  const lead = p.answers['traits.top3']?.[0]
  const r = useSeeded('traits.originSides')
  const recorded = p.answers['traits.originSides']
  const sides = recorded ?? (r < 0.5 ? 'bornLeft' : 'bornRight')
  const left = sides === 'bornLeft' ? 'born' : 'built'
  const right = left === 'born' ? 'built' : 'born'
  const chosen = p.answers['traits.leadOrigin']
  const [gone, setGone] = useState(false)
  const [lean, setLean] = useState(0)
  const api = useRef<SwipeApi | null>(null)

  // the sides are logged the moment they are shown (as on the phone)
  useEffect(() => {
    if (!recorded) p.set('traits.originSides', sides)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recorded, sides])

  const t = lead ? trait(lead) ?? null : null
  const prompt = fill(copy('S09', 'B').prompt, { leadTrait: t?.label ?? 'The lead trait' })
  const exits: SwipeExit[] = [
    { id: left, label: origin(left).label, dir: 'left' },
    { id: right, label: origin(right).label, dir: 'right' },
  ]
  const cards: LeadCard[] = t && !gone ? [{ id: `lead-${t.id}`, trait: t.id }] : []
  const disabled = p.covered || ctx.busy

  const onExit = (_card: string, exitId: string, meta: { via: string; ms: number }) => {
    const answer = exitId as 'born' | 'built'
    setGone(true)
    setLean(0)
    p.setMany({ 'traits.leadOrigin': answer, 'traits.originSides': sides })
    p.log('origin', { trait: lead, answer, side: exitId === left ? 'left' : 'right', via: meta.via, ms: meta.ms })
    p.next()
  }

  const pick = (id: string, via: 'button' | 'key') => {
    if (disabled || !cards.length) return false
    sfx('stamp', ctx.sound)
    api.current?.leave(id, via)
  }
  useHotkeys({ ArrowLeft: () => pick(left, 'key'), ArrowRight: () => pick(right, 'key') }, { enabled: !p.covered })

  const side = (id: string, at: 'left' | 'right') => {
    const z = origin(id)
    const lit = at === 'left' ? Math.max(0, -lean) : Math.max(0, lean)
    const on = chosen === id
    return (
      <button
        type="button"
        onClick={() => pick(id, 'button')}
        disabled={disabled || !cards.length}
        aria-pressed={on}
        className="group absolute flex flex-col items-center justify-center gap-4 rounded-[3px] bg-white transition-shadow hover:shadow-[0_8px_22px_rgba(13,12,11,0.10)]"
        style={{
          [at]: 0, top: (CH - SIDE.h) / 2 + 20, width: SIDE.w, height: SIDE.h,
          border: `${on || lit > 0.5 ? 1.5 : 1}px solid ${on || lit > 0.5 ? '#0D0C0B' : '#8C857A'}`,
          transform: `scale(${1 + lit * 0.04})`, transition: 'transform 90ms linear, border-color 90ms linear',
        }}
        data-testid={`origin-${id}`}
        data-side={at}
      >
        <span style={{ opacity: 0.55 + lit * 0.45 + (on ? 0.45 : 0), transition: 'opacity 90ms linear' }}>
          <Art id={z.art ?? ''} size={120} />
        </span>
        <span className="px-3 text-center font-[family-name:var(--font-ui)] text-[18px] font-semibold leading-[22px] text-ink">{z.label}</span>
        {L.fine && <KeyCap k={at === 'left' ? 'ArrowLeft' : 'ArrowRight'} />}
      </button>
    )
  }

  return (
    <Frame id="S09" beat="B" host="native" prompt={prompt} valid={!!chosen} onContinue={p.next}
      invalidReason="Choose a side">
      <DeskCanvas w={DW} h={DH}>
        <div className="relative h-full w-full" data-s09b data-s09b-desk>
          {t ? (
            <>
              <div className="absolute" style={{ left: (DW - CW) / 2 - SIDE.w - 56, top: 0, width: SIDE.w, height: DH }}>{side(left, 'left')}</div>
              <div className="absolute" style={{ left: (DW + CW) / 2 + 56, top: 0, width: SIDE.w, height: DH }}>{side(right, 'right')}</div>
              <div className="absolute" style={{ left: (DW - CW) / 2, top: 20 }}>
                <SwipeStack<LeadCard>
                  cards={cards}
                  exits={exits}
                  width={CW}
                  height={CH}
                  depth={0}
                  hideButtons
                  apiRef={api}
                  disabled={disabled}
                  label={`${t.label}. Left arrow: ${origin(left).label}. Right arrow: ${origin(right).label}.`}
                  onExit={onExit}
                  onLean={(l) => setLean(l)}
                  renderCard={(c) => (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-4 px-6"
                      style={{ background: '#FFFFFF', border: '1px solid #8C857A', borderRadius: 3, boxShadow: '0 2px 0 #DDD9D2, 0 14px 32px rgba(13,12,11,0.12)' }}
                      data-testid="lead-card">
                      <p className="font-[family-name:var(--font-ui)] text-[12px] font-semibold uppercase tracking-[0.16em] text-muted">{CLIP1.label}</p>
                      <Art id={trait(c.trait)!.art} size={200} title={trait(c.trait)!.label} />
                      <p className="text-center font-[family-name:var(--font-text)] text-[26px] font-semibold leading-[30px] text-ink">{trait(c.trait)!.label}</p>
                    </div>
                  )}
                />
              </div>
            </>
          ) : (
            <p className="absolute inset-0 flex items-center justify-center font-[family-name:var(--font-text)] text-[17px] text-muted">Rope up three traits first.</p>
          )}
        </div>
      </DeskCanvas>
    </Frame>
  )
}
