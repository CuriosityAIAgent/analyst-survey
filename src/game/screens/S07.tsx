'use client'
/* S07 · Camp III · "Storm calls".

   Four cards, one at a time, in a per-respondent random order (calls.order).
   Three exits: Drop it (left), Unsure (down; button or ArrowDown only) and
   Make it policy (right). The buttons under the stack are the primary input;
   a swipe is the enhancement. Each answer is stored as the zone's value
   ('drop' | 'unsure' | 'policy'), the vocabulary ruleF4 tests.

   Feel: snow thickens a little with each card and the light greys over; an
   Archivo ink stamp (DROPPED / UNSURE / POLICY) lands on the card as it
   leaves and on its ticket in the row above; after the last card the storm
   clears the same way whatever the calls were. Filters first: F4 can only
   rise after all four (the store evaluates it on Continue). A called card can
   be tapped to call it again. */
import { useRef } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import Frame from '../Frame'
import SwipeStack, { type SwipeExit, type SwipeDir } from '../SwipeStack'
import { Art } from '../art'
import { items, zones } from '../content'
import { useOrder } from '../store'
import { useGameCtx } from '../context'
import { campPaper, sfx } from '../feel'

/** Empty tickets sit on the camp's paper, so the scene's streaks never run through them. */
const PAPER3 = campPaper('S07')
import type { Call, CallAnswer, CardId, ItemSpec, StepProps } from '../types'

type Card = ItemSpec & { id: CardId; sub: string; art: string }

const CARDS = items('S07') as Card[]
const CARD_IDS = CARDS.map((c) => c.id)
const byId = (id: string) => CARDS.find((c) => c.id === id)!

const DIRS: Record<string, SwipeDir> = { drop: 'left', unsure: 'down', policy: 'right' }
const EXITS: SwipeExit[] = zones('S07').map((z) => ({ id: z.id, label: z.label, dir: DIRS[z.id] ?? 'down' }))
const VALUE: Record<string, CallAnswer> = Object.fromEntries(zones('S07').map((z) => [z.id, String(z.value) as CallAnswer]))
const STAMP: Record<CallAnswer, string> = { policy: 'POLICY', drop: 'DROPPED', unsure: 'UNSURE' }

const CARD_W = 300
const CARD_H = 300

export function Stamp({ answer, size = 'lg', reduced, ghost = 0 }: { answer: CallAnswer; size?: 'lg' | 'sm'; reduced?: boolean; ghost?: number }) {
  const lg = size === 'lg'
  const style = {
    fontFamily: 'var(--font-ui)',
    fontWeight: 700,
    fontSize: lg ? 22 : 9.5,
    letterSpacing: lg ? '0.2em' : '0.14em',
    lineHeight: 1,
    padding: lg ? '7px 10px 7px 14px' : '3px 3px 3px 5px',
    border: `${lg ? 2.5 : 1.25}px solid #0D0C0B`,
    color: '#0D0C0B',
    borderRadius: 2,
    background: 'rgba(248,247,244,0.72)',
    mixBlendMode: 'multiply' as const,
    whiteSpace: 'nowrap' as const,
  }
  if (ghost) {
    return <span aria-hidden style={{ ...style, opacity: ghost, display: 'inline-block', transform: 'rotate(-9deg)' }}>{STAMP[answer]}</span>
  }
  return (
    <motion.span
      aria-hidden
      style={{ ...style, display: 'inline-block' }}
      initial={reduced ? { opacity: 0, rotate: -9 } : { opacity: 0, scale: lg ? 1.7 : 1.5, rotate: -14 }}
      animate={{ opacity: 0.9, scale: 1, rotate: -9 }}
      transition={reduced ? { duration: 0.12 } : { duration: 0.16, ease: [0.3, 0, 0.2, 1.4] }}
      data-stamp={answer}
    >
      {STAMP[answer]}
    </motion.span>
  )
}

export default function S07(p: StepProps) {
  const ctx = useGameCtx()
  const order = useOrder('calls.order', CARD_IDS)
  const calls = p.answers.calls ?? {}
  const callsRef = useRef(calls)
  callsRef.current = calls

  const deck = order.filter((id) => !calls[id]).map(byId)
  const answered = order.length - deck.length
  const cleared = deck.length === 0
  // snow thickens card by card (1..4) and clears after the last
  const density = cleared ? 0 : Math.min(4, answered + 1)

  const disabled = p.covered || ctx.busy

  const onExit = (cardId: string, exitId: string, meta: { via: 'button' | 'swipe' | 'key'; ms: number }) => {
    const answer = VALUE[exitId]
    if (!answer) return
    const call: Call = { answer, ms: meta.ms, order: order.indexOf(cardId as CardId) }
    p.set('calls', { ...callsRef.current, [cardId]: call })
    p.log('call', { card: cardId, answer, via: meta.via, ms: meta.ms, order: call.order })
  }

  const recall = (id: CardId) => {
    if (disabled) return
    const next = { ...callsRef.current }
    const was = next[id]?.answer
    delete next[id]
    p.set('calls', next)
    p.log('recall', { card: id, was })
  }

  return (
    <Frame id="S07" valid={cleared} onContinue={p.next}>
      {/* the storm: a grey-over and snow, both thickening card by card. Both
          run on under the footer to the bottom of the screen (the frame
          clips), so the scene never stops on a hard edge above the button. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 bottom-[-160px]"
        style={{
          background: 'linear-gradient(to bottom, rgba(20,35,59,0) 0, #14233B 72px)',
          opacity: density * 0.03,
          transition: `opacity ${p.reduced ? 150 : cleared ? 900 : 500}ms ease`,
        }}
      />
      <AnimatePresence>
        {density > 0 && (
          <motion.div
            key={density}
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 bottom-[-160px] overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: p.reduced ? 0.15 : cleared ? 0.9 : 0.4 } }}
            transition={{ duration: p.reduced ? 0.15 : 0.4 }}
            data-snow={density}
          >
            <Art id="snow-overlay" value={density} width="100%" height="100%" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative flex h-full flex-col items-center justify-center px-5 pb-2" data-storm={cleared ? 'clear' : density}>
        {/* the calls made so far: one ticket per card, in the order shown */}
        {!cleared && (
          <div className="flex w-full justify-center gap-2" aria-label="Calls made" role="list" data-tickets>
            {order.map((id) => {
              const c = calls[id]
              return (
                <div key={id} role="listitem" aria-label={c ? `${byId(id).label}: ${STAMP[c.answer].toLowerCase()}` : 'Still to call'}
                  className="relative flex h-[34px] w-[64px] items-center justify-center"
                  style={{
                    border: c ? '1px solid #8C857A' : '1px dashed #C9C4BA',
                    background: c ? '#FFFFFF' : PAPER3,
                    borderRadius: 2,
                  }}>
                  {c && <Stamp answer={c.answer} size="sm" reduced={p.reduced} />}
                </div>
              )
            })}
          </div>
        )}

        {!cleared && (
          <div className="mt-3 flex w-full flex-col items-center">
            <SwipeStack<Card>
              cards={deck}
              exits={EXITS}
              width={CARD_W}
              height={CARD_H}
              depth={2}
              label="Storm calls. Left arrow: drop it. Down arrow: unsure. Right arrow: make it policy."
              disabled={disabled}
              onExit={onExit}
              holdMs={190}
              renderCard={(card, s) => {
                const leanAns = s.toward ? VALUE[s.toward] : null
                return (
                  <div
                    className="relative flex h-full w-full flex-col items-center overflow-hidden px-4 pt-3"
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #8C857A',
                      borderRadius: 3,
                      boxShadow: s.top ? '0 2px 0 #DDD9D2, 0 10px 24px rgba(13,12,11,0.10)' : '0 1px 0 #DDD9D2',
                    }}
                    data-testid={s.top ? `card-${card.id}` : undefined}
                  >
                    <Art id={card.art} size={186} title={card.label} />
                    <p className="mt-2 text-center font-[family-name:var(--font-display)] text-[22px] leading-[26px] tracking-[-0.01em] text-ink">
                      {card.label}
                    </p>
                    <p className="mt-1 text-center font-[family-name:var(--font-text)] text-[14px] leading-[18px] text-muted">
                      {card.sub}
                    </p>
                    {/* leaning toward an exit: its stamp shows faintly */}
                    {s.top && !s.leaving && leanAns && Math.abs(s.lean) > 0.15 && (
                      <div className="pointer-events-none absolute top-5" style={{ [s.dx > 0 ? 'left' : 'right']: 16 }}>
                        <Stamp answer={leanAns} ghost={Math.min(0.85, Math.abs(s.lean) * 0.85)} />
                      </div>
                    )}
                  </div>
                )
              }}
              renderStamp={(exitId) => <Stamp answer={VALUE[exitId]} reduced={p.reduced} />}
              renderButton={(ex, press, off) => (
                <button
                  type="button"
                  className="btn-quiet"
                  disabled={off}
                  onClick={() => {
                    if (off) return
                    sfx('stamp', ctx.sound)
                    press()
                  }}
                  data-testid={`call-${ex.id}`}
                  style={{
                    flex: '1 1 0', maxWidth: 118, minWidth: 0, minHeight: 46, padding: '10px 2px', fontSize: 14, whiteSpace: 'nowrap',
                    background: '#FFFFFF', lineHeight: '18px',
                  }}
                >
                  {ex.label}
                </button>
              )}
            />
          </div>
        )}

        {cleared && (
          <motion.div
            className="flex w-full flex-1 flex-col items-center justify-center pb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: p.reduced ? 0.15 : 0.6, delay: p.reduced ? 0 : 0.25 }}
            data-cleared
          >
            <div className="grid grid-cols-2 gap-3">
              {order.map((id) => {
                const c = calls[id]
                const card = byId(id)
                if (!c) return null
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => recall(id)}
                    disabled={disabled}
                    className="relative flex h-[148px] w-[160px] flex-col items-center justify-start gap-1 px-2 pt-2"
                    style={{ background: '#FFFFFF', border: '1px solid #8C857A', borderRadius: 3 }}
                    aria-label={`${card.label}: ${STAMP[c.answer].toLowerCase()}. Tap to call it again.`}
                    data-testid={`recall-${id}`}
                  >
                    <Art id={card.art} size={72} />
                    <span className="text-center font-[family-name:var(--font-display)] text-[15px] leading-[18px] text-ink">{card.label}</span>
                    <span className="absolute right-2 top-2"><Stamp answer={c.answer} size="sm" reduced /></span>
                  </button>
                )
              })}
            </div>
            <p className="mt-3 font-[family-name:var(--font-ui)] text-[12px] text-muted">The storm has passed. Tap a card to call it again.</p>
          </motion.div>
        )}
      </div>
    </Frame>
  )
}
