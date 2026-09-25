'use client'
/* SwipeStack: a deck of cards with two or three exits (S07 storm calls; S09
   Beat B born/built with randomised sides).

   Buttons under the stack are the PRIMARY input. A horizontal swipe is the
   enhancement: it counts past 30% of the card width, or on a flick. Keyboard:
   the stack is focusable; Left/Right/Down take the exit with that dir (or the
   exit's own `key`). Exits with dir 'down' are button/keyboard only.

   The parent owns the deck: pass the cards still to answer, top first, and
   remove the top card in onExit (called once the card has left, ~260ms).
   `holdMs`: on a button or key exit, the stamp (renderStamp) lands on the
   card first and the card leaves holdMs later (S07's storm calls).
   `onLean`: the parent hears the top card's lean as it is dragged (S09 Beat
   B lights the edge glyphs with it).
   Reduced motion: the card fades instead of flying.

   Desk additions (additive; the phone is unchanged):
   - `apiRef`: { leave(exitId, via) } so a screen can map window-level keys
     (useHotkeys) onto the same exit path as the stack's own keys (via
     'key'), or draw its own targets (via 'button').
   - Inside a host scaled by transform (DeskCanvas sets --host-k), the drag
     offset is divided by the host's scale, so the card stays under the
     pointer and the 30% threshold means the same share of the card. */
import { Fragment, useEffect, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { useReducedMotion } from 'motion/react'
import { buzz } from './feel'

export type SwipeDir = 'left' | 'right' | 'down'
export type SwipeExit = {
  id: string
  label: string
  dir: SwipeDir
  /** Keyboard key; default ArrowLeft / ArrowRight / ArrowDown by dir. */
  key?: string
}
export type SwipeMeta = { via: 'button' | 'swipe' | 'key'; ms: number }
export type CardState = {
  /** Horizontal drag offset in px. */
  dx: number
  /** dx as a share of the swipe threshold, -1..1 (clamped). */
  lean: number
  /** The exit the card is currently leaning toward (or leaving by). */
  toward: string | null
  top: boolean
  leaving: boolean
}

export type SwipeStackProps<T extends { id: string }> = {
  cards: T[]
  exits: SwipeExit[]
  renderCard: (card: T, s: CardState) => ReactNode
  onExit: (cardId: string, exitId: string, meta: SwipeMeta) => void
  /** Drawn over the leaving card, e.g. the Archivo 'POLICY' stamp. */
  renderStamp?: (exitId: string, card: T) => ReactNode
  /** Card size in px. */
  width: number
  height: number
  /** Cards visible beneath the top one. Default 2. */
  depth?: number
  /** Accessible name for the stack. */
  label: string
  /** Custom button; default is a quiet Archivo button. */
  renderButton?: (exit: SwipeExit, press: () => void, disabled: boolean) => ReactNode
  /** Button / key exits: show the stamp this long before the card leaves. */
  holdMs?: number
  /** The top card's lean (-1..1) and the exit it leans toward, as it moves. */
  onLean?: (lean: number, toward: string | null) => void
  /** Hide the button row (render your own and call `apiRef` instead). */
  hideButtons?: boolean
  /** Imperative exits for window-level keys: leave(exitId) as a key exit. */
  apiRef?: React.MutableRefObject<SwipeApi | null>
  disabled?: boolean
  className?: string
  style?: CSSProperties
}

export type SwipeApi = { leave: (exitId: string, via?: 'button' | 'key') => void }

const LEAVE_MS = 260
const defaultKey = (d: SwipeDir) => (d === 'left' ? 'ArrowLeft' : d === 'right' ? 'ArrowRight' : 'ArrowDown')

export default function SwipeStack<T extends { id: string }>(p: SwipeStackProps<T>) {
  const reduced = !!useReducedMotion()
  const [dx, setDx] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [leaving, setLeaving] = useState<{ id: string; exit: SwipeExit; via: SwipeMeta['via'] } | null>(null)
  const [stamped, setStamped] = useState<{ id: string; exit: SwipeExit } | null>(null)
  const timers = useRef<number[]>([])
  useEffect(() => () => timers.current.forEach(clearTimeout), [])
  const shownAt = useRef(Date.now())
  const press = useRef<{ id: number; x0: number; t0: number; lastX: number; lastT: number; vx: number; k: number } | null>(null)
  const top = p.cards[0]
  const threshold = p.width * 0.3

  // time on each card starts when it reaches the top
  useEffect(() => { shownAt.current = Date.now(); setDx(0) }, [top?.id])

  const exitBy = (dir: SwipeDir) => p.exits.find((e) => e.dir === dir) ?? null

  const leave = (exit: SwipeExit, via: SwipeMeta['via']) => {
    if (!top || leaving || stamped || p.disabled) return
    const ms = Date.now() - shownAt.current
    buzz(8)
    const card = top
    const go = () => {
      setStamped(null)
      setLeaving({ id: card.id, exit, via })
      timers.current.push(window.setTimeout(() => {
        setLeaving(null)
        setDx(0)
        p.onExit(card.id, exit.id, { via, ms })
      }, reduced ? 160 : LEAVE_MS))
    }
    const hold = via === 'swipe' || reduced ? 0 : p.holdMs ?? 0
    if (hold > 0) {
      setStamped({ id: card.id, exit })
      timers.current.push(window.setTimeout(go, hold))
    } else go()
  }

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (p.disabled || leaving || stamped || e.button !== 0) return
    try { e.currentTarget.setPointerCapture(e.pointerId) } catch { /* ignore */ }
    const now = performance.now()
    // a host scaled by transform (desk): screen px -> card px
    const k = parseFloat(getComputedStyle(e.currentTarget).getPropertyValue('--host-k')) || 1
    press.current = { id: e.pointerId, x0: e.clientX, t0: now, lastX: e.clientX, lastT: now, vx: 0, k }
  }
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const pr = press.current
    if (!pr || pr.id !== e.pointerId) return
    const now = performance.now()
    const dt = Math.max(1, now - pr.lastT)
    pr.vx = 0.7 * pr.vx + 0.3 * ((e.clientX - pr.lastX) / pr.k / dt)
    pr.lastX = e.clientX; pr.lastT = now
    const d = (e.clientX - pr.x0) / pr.k
    if (!dragging && Math.abs(d) > 4) setDragging(true)
    setDx(d)
  }
  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const pr = press.current
    if (!pr || pr.id !== e.pointerId) return
    press.current = null
    setDragging(false)
    const d = (e.clientX - pr.x0) / pr.k
    const flick = Math.abs(pr.vx) > 0.6 && Math.abs(d) > 24
    if (Math.abs(d) > threshold || flick) {
      const ex = exitBy(d > 0 ? 'right' : 'left')
      if (ex) return leave(ex, 'swipe')
    }
    setDx(0)
  }

  // refreshed after every render, so it always leaves through the current state
  useEffect(() => {
    if (!p.apiRef) return
    p.apiRef.current = {
      leave: (id: string, via: 'button' | 'key' = 'key') => { const ex = p.exits.find((x) => x.id === id); if (ex) leave(ex, via) },
    }
  })

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const ex = p.exits.find((x) => (x.key ?? defaultKey(x.dir)) === e.key)
    if (ex) { e.preventDefault(); leave(ex, 'key') }
  }

  const toward = leaving ? leaving.exit.id
    : Math.abs(dx) > 12 ? exitBy(dx > 0 ? 'right' : 'left')?.id ?? null : null
  const lean = Math.max(-1, Math.min(1, dx / threshold))
  const onLean = useRef(p.onLean)
  onLean.current = p.onLean
  useEffect(() => { onLean.current?.(leaving ? 0 : lean, toward) }, [lean, toward, leaving])

  const cardStyle = (i: number, card: T): CSSProperties => {
    const base: CSSProperties = {
      position: 'absolute', inset: 0, borderRadius: 2,
      transition: dragging && i === 0 ? 'none' : `transform ${reduced ? 0 : 220}ms cubic-bezier(.2,.8,.2,1), opacity ${reduced ? 160 : 220}ms ease`,
    }
    if (i === 0) {
      if (leaving && leaving.id === card.id) {
        const dir = leaving.exit.dir
        if (reduced) return { ...base, opacity: 0 }
        const x = dir === 'left' ? -p.width * 1.3 : dir === 'right' ? p.width * 1.3 : 0
        const y = dir === 'down' ? p.height * 0.9 : 0
        const r = dir === 'left' ? -14 : dir === 'right' ? 14 : 0
        return { ...base, transform: `translate(${x}px, ${y}px) rotate(${r}deg)`, opacity: 0, transition: `transform ${LEAVE_MS}ms cubic-bezier(.4,0,.8,.6), opacity ${LEAVE_MS}ms ease-in` }
      }
      return { ...base, transform: `translateX(${dx}px) rotate(${reduced ? 0 : dx / 22}deg)`, zIndex: 10, cursor: dragging ? 'grabbing' : 'grab' }
    }
    return { ...base, transform: `translateY(${i * 6}px) scale(${1 - i * 0.03})`, zIndex: 10 - i, pointerEvents: 'none' }
  }

  const visible = p.cards.slice(0, 1 + (p.depth ?? 2))

  return (
    <div className={p.className} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, ...p.style }}>
      <div
        role="group"
        aria-roledescription="card stack"
        aria-label={p.label}
        tabIndex={p.disabled ? -1 : 0}
        onKeyDown={onKeyDown}
        style={{ position: 'relative', width: p.width, height: p.height, touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none' }}
        data-swipe-stack
      >
        {[...visible].reverse().map((card) => {
          const i = visible.indexOf(card)
          const isTop = i === 0
          return (
            <div
              key={card.id}
              style={cardStyle(i, card)}
              onPointerDown={isTop ? onPointerDown : undefined}
              onPointerMove={isTop ? onPointerMove : undefined}
              onPointerUp={isTop ? onPointerUp : undefined}
              onPointerCancel={isTop ? () => { press.current = null; setDragging(false); setDx(0) } : undefined}
              aria-hidden={!isTop}
              data-card={card.id}
            >
              {p.renderCard(card, { dx: isTop ? dx : 0, lean: isTop ? lean : 0, toward: isTop ? toward : null, top: isTop, leaving: !!(leaving || stamped) && isTop })}
              {isTop && (leaving || stamped) && p.renderStamp && (
                <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', pointerEvents: 'none' }}>
                  {p.renderStamp((leaving ?? stamped)!.exit.id, card)}
                </div>
              )}
            </div>
          )
        })}
      </div>
      {!p.hideButtons && (
        <div style={{ display: 'flex', gap: 8, width: '100%', justifyContent: 'center' }}>
          {p.exits.map((ex) => {
            const press = () => leave(ex, 'button')
            const disabled = !!p.disabled || !top || !!leaving || !!stamped
            return p.renderButton ? (
              <Fragment key={ex.id}>{p.renderButton(ex, press, disabled)}</Fragment>
            ) : (
              <button
                key={ex.id}
                type="button"
                className="btn-quiet"
                onClick={press}
                disabled={disabled}
                data-testid={`swipe-${ex.id}`}
                style={{ flex: 1, maxWidth: 140, minHeight: 44, padding: '10px 8px', fontSize: 14 }}
              >
                {ex.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
