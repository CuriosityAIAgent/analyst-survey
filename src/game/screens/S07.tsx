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
   be tapped to call it again.

   Desk (design 5, S07; a 936x640 DeskCanvas): the ticket row on top (four
   tickets 200x72: a called one shows its title and stamp and is clickable to
   call it again; an uncalled one stays blank, so the cards are still met one
   at a time), the card centred at 400x400, and three EQUAL buttons under it
   (200x56, each with its key). No side pads: they would make Drop and Policy
   bigger targets than Unsure. While a card is dragged, two faint halos (no
   labels) show the swipe exits. Arrow keys call the card without focusing
   the stack (the same key path). Same order, same stored calls. */
import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import Frame, { DeskCanvas } from '../Frame'
import SwipeStack, { type SwipeApi, type SwipeExit, type SwipeDir } from '../SwipeStack'
import KeyCap from '../KeyCap'
import { useLayoutInfo } from '../layout'
import { useHotkeys } from '../useHotkeys'
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

  const L = useLayoutInfo()
  if (L.desk) {
    return <Desk p={p} order={order} calls={calls} deck={deck} density={density} cleared={cleared}
      disabled={disabled} onExit={onExit} recall={recall} sound={ctx.sound} fine={L.fine} />
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
                    <p className="mt-2 text-center font-[family-name:var(--font-text)] font-semibold text-[22px] leading-[26px] tracking-[-0.01em] text-ink">
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
                    <span className="text-center font-[family-name:var(--font-text)] font-semibold text-[15px] leading-[18px] text-ink">{card.label}</span>
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

/* ------------------------------------------------------------ desk */

const KEY_OF: Record<string, string> = { drop: 'ArrowLeft', unsure: 'ArrowDown', policy: 'ArrowRight' }
const DW = 936, DH = 624
const DCARD = 400
const TICKET = { w: 200, h: 72 }

function Desk({ p, order, calls, deck, density, cleared, disabled, onExit, recall, sound, fine }: {
  p: StepProps
  order: CardId[]
  calls: Partial<Record<CardId, Call>>
  deck: Card[]
  density: number
  cleared: boolean
  disabled: boolean
  onExit: (cardId: string, exitId: string, meta: { via: 'button' | 'swipe' | 'key'; ms: number }) => void
  recall: (id: CardId) => void
  sound: boolean
  fine: boolean
}) {
  const api = useRef<SwipeApi | null>(null)
  const [lean, setLean] = useState(0)
  const answered = order.length - deck.length
  const current = deck[0]?.id

  // arrow keys call the top card without focusing the stack (the stack's own
  // keys preventDefault, so a focused stack never calls twice)
  const call = (id: string) => () => {
    if (disabled || cleared) return false
    sfx('stamp', sound)
    api.current?.leave(id)
  }
  useHotkeys({ ArrowLeft: call('drop'), ArrowDown: call('unsure'), ArrowRight: call('policy') }, { enabled: !p.covered })

  const halo = (side: 'left' | 'right') => {
    const on = side === 'left' ? Math.max(0, -lean) : Math.max(0, lean)
    const dragging = Math.abs(lean) > 0.02
    return (
      <div aria-hidden className="pointer-events-none absolute top-[88px] h-[480px] w-[260px]"
        style={{
          [side]: -40,
          background: `radial-gradient(closest-side, rgba(13,12,11,${0.05 + on * 0.1}), rgba(13,12,11,0))`,
          opacity: dragging ? 1 : 0, transition: 'opacity 160ms ease',
        }} data-halo={side} />
    )
  }

  return (
    <Frame
      id="S07"
      host="native"
      valid={cleared}
      onContinue={p.next}
      summary={cleared ? 'All four called' : `Card ${answered + 1} of ${order.length}`}
      invalidReason={cleared ? undefined : `Call ${deck.length} more ${deck.length === 1 ? 'card' : 'cards'}`}
    >
      {/* the storm, over the whole stage (behind the caption) */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 top-[-80px]"
        style={{ background: 'linear-gradient(to bottom, rgba(20,35,59,0) 0, #14233B 120px)', opacity: density * 0.03,
          transition: `opacity ${p.reduced ? 150 : cleared ? 900 : 500}ms ease` }} />
      <AnimatePresence>
        {density > 0 && (
          <motion.div key={density} aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 top-[-80px] overflow-hidden"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: p.reduced ? 0.15 : cleared ? 0.9 : 0.4 } }}
            transition={{ duration: p.reduced ? 0.15 : 0.4 }} data-snow={density}>
            <Art id="snow-overlay" value={density} width="100%" height="100%" />
          </motion.div>
        )}
      </AnimatePresence>

      <DeskCanvas w={DW} h={DH}>
        <div className="relative h-full w-full" data-storm={cleared ? 'clear' : density} data-s07-desk>
          {!cleared && (
            <>
              {/* the ticket row: called cards show title and stamp (click to call again) */}
              <div className="absolute inset-x-0 top-[12px] flex justify-center gap-4" role="list" aria-label="Calls made" data-tickets>
                {order.map((id, i) => {
                  const c = calls[id]
                  const card = byId(id)
                  const now = id === current
                  if (!c) {
                    return (
                      <div key={id} role="listitem" aria-label={now ? 'On the table now' : 'Still to call'}
                        className="flex items-center justify-center rounded-[2px] font-[family-name:var(--font-ui)] text-[12px] uppercase tracking-[0.14em]"
                        style={{ width: TICKET.w, height: TICKET.h, border: `1px dashed ${now ? '#0D0C0B' : '#C9C4BA'}`, background: PAPER3, color: now ? '#0D0C0B' : '#8C857A' }}>
                        {now ? 'On the table' : `Card ${i + 1}`}
                      </div>
                    )
                  }
                  return (
                    <button key={id} type="button" role="listitem" onClick={() => recall(id)} disabled={disabled}
                      className="group relative flex items-center gap-3 rounded-[2px] bg-white px-3 text-left transition-shadow hover:shadow-[0_4px_14px_rgba(13,12,11,0.10)]"
                      style={{ width: TICKET.w, height: TICKET.h, border: '1px solid #8C857A' }}
                      title="Click to call it again"
                      aria-label={`${card.label}: ${STAMP[c.answer].toLowerCase()}. Click to call it again.`}
                      data-testid={`ticket-${id}`}>
                      <Art id={card.art} size={48} />
                      <span className="min-w-0 flex-1 font-[family-name:var(--font-text)] text-[14px] font-semibold leading-[17px] text-ink">{card.label}</span>
                      <span className="absolute -right-2 -top-3"><Stamp answer={c.answer} size="sm" reduced={p.reduced} /></span>
                    </button>
                  )
                })}
              </div>

              {halo('left')}
              {halo('right')}

              <div className="absolute inset-x-0 top-[108px] flex justify-center">
                <SwipeStack<Card>
                  cards={deck}
                  exits={EXITS}
                  width={DCARD}
                  height={DCARD}
                  depth={2}
                  apiRef={api}
                  onLean={(l) => setLean(l)}
                  label="Storm calls. Left arrow: drop it. Down arrow: unsure. Right arrow: make it policy."
                  disabled={disabled}
                  onExit={onExit}
                  holdMs={190}
                  style={{ width: 3 * 200 + 2 * 16, gap: 22 }}
                  renderCard={(card, s) => {
                    const leanAns = s.toward ? VALUE[s.toward] : null
                    return (
                      <div className="relative flex h-full w-full flex-col items-center overflow-hidden px-6 pt-4"
                        style={{ background: '#FFFFFF', border: '1px solid #8C857A', borderRadius: 3,
                          boxShadow: s.top ? '0 2px 0 #DDD9D2, 0 14px 32px rgba(13,12,11,0.12)' : '0 1px 0 #DDD9D2' }}
                        data-testid={s.top ? `card-${card.id}` : undefined}>
                        <Art id={card.art} size={220} title={card.label} />
                        <p className="mt-3 text-center font-[family-name:var(--font-text)] text-[26px] font-semibold leading-[30px] tracking-[-0.01em] text-ink">{card.label}</p>
                        <p className="mt-2 text-center font-[family-name:var(--font-text)] text-[17px] leading-[23px] text-muted">{card.sub}</p>
                        {s.top && !s.leaving && leanAns && Math.abs(s.lean) > 0.15 && (
                          <div className="pointer-events-none absolute top-6" style={{ [s.dx > 0 ? 'left' : 'right']: 20 }}>
                            <Stamp answer={leanAns} ghost={Math.min(0.85, Math.abs(s.lean) * 0.85)} />
                          </div>
                        )}
                      </div>
                    )
                  }}
                  renderStamp={(exitId) => <Stamp answer={VALUE[exitId]} reduced={p.reduced} />}
                  renderButton={(ex, press, off) => {
                    const key = KEY_OF[ex.id]
                    const cap = fine && key ? <KeyCap k={key} /> : null
                    return (
                      <button type="button" className="btn-quiet flex items-center justify-center gap-3" disabled={off}
                        onClick={() => { if (off) return; sfx('stamp', sound); press() }}
                        data-testid={`call-${ex.id}`}
                        style={{ width: 200, height: 56, flex: '0 0 200px', padding: '0 12px', fontSize: 16, background: '#FFFFFF', whiteSpace: 'nowrap' }}>
                        {ex.dir !== 'right' && cap}
                        <span>{ex.label}</span>
                        {ex.dir === 'right' && cap}
                      </button>
                    )
                  }}
                />
              </div>
            </>
          )}

          {cleared && (
            <motion.div className="absolute inset-0 flex flex-col items-center justify-center"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ duration: p.reduced ? 0.15 : 0.6, delay: p.reduced ? 0 : 0.25 }} data-cleared>
              <div className="flex gap-4">
                {order.map((id) => {
                  const c = calls[id]
                  const card = byId(id)
                  if (!c) return null
                  return (
                    <button key={id} type="button" onClick={() => recall(id)} disabled={disabled}
                      className="relative flex h-[260px] w-[210px] flex-col items-center justify-start gap-2 px-3 pt-4 transition-shadow hover:shadow-[0_6px_18px_rgba(13,12,11,0.12)]"
                      style={{ background: '#FFFFFF', border: '1px solid #8C857A', borderRadius: 3 }}
                      aria-label={`${card.label}: ${STAMP[c.answer].toLowerCase()}. Click to call it again.`}
                      data-testid={`recall-${id}`}>
                      <Art id={card.art} size={130} />
                      <span className="text-center font-[family-name:var(--font-text)] text-[18px] font-semibold leading-[22px] text-ink">{card.label}</span>
                      <span className="absolute right-3 top-3"><Stamp answer={c.answer} size="sm" reduced /></span>
                    </button>
                  )
                })}
              </div>
              <p className="mt-6 font-[family-name:var(--font-ui)] text-[15px] text-ink-2">The storm has passed. Click a card to call it again.</p>
            </motion.div>
          )}
        </div>
      </DeskCanvas>
    </Frame>
  )
}
