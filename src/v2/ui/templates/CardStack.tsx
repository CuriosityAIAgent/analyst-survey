'use client'
/* Template 2: the card stack.
   One card at a time. Two big labelled buttons directly under the card, and a
   labelled pile either side that fills as you sort. Swipe works too (pointer
   events); the buttons are the tap fallback and the keyboard path. Tap a pile
   to take its last card back. */
import { useRef, useState } from 'react'
import type { ReactNode } from 'react'

export type StackCard = { id: string; label: string; art?: string }
export type Side = 'left' | 'right'

type Props = {
  cards: StackCard[]
  left: string            // pile + button label, e.g. "Had it before"
  right: string           // e.g. "Learned at J.P. Morgan"
  sorted: Record<string, Side>
  onSort: (id: string, side: Side | null) => void
  done?: ReactNode        // shown in place of the card when every card is sorted
}

const FLY_MS = 240

export default function CardStack({ cards, left, right, sorted, onSort, done }: Props) {
  const remaining = cards.filter((c) => !sorted[c.id])
  const current = remaining[0]
  const next = remaining[1]
  const [dx, setDx] = useState(0)
  const [flying, setFlying] = useState<Side | null>(null)
  const [touched, setTouched] = useState(false)
  const [dragging, setDragging] = useState(false)
  const drag = useRef<{ x: number; id: number } | null>(null)
  const pile = (s: Side) => cards.filter((c) => sorted[c.id] === s)

  const commit = (side: Side) => {
    if (!current || flying) return
    setTouched(true)
    setFlying(side)
    setTimeout(() => { onSort(current.id, side); setFlying(null); setDx(0) }, FLY_MS)
  }
  const undo = (side: Side) => {
    const p = pile(side)
    if (p.length && !flying) onSort(p[p.length - 1].id, null)
  }

  const onDown = (e: React.PointerEvent) => {
    if (flying) return
    setTouched(true)
    drag.current = { x: e.clientX, id: e.pointerId }
    setDragging(true)
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }
  const onMove = (e: React.PointerEvent) => { if (drag.current) setDx(e.clientX - drag.current.x) }
  const onUp = () => {
    if (!drag.current) return
    drag.current = null
    setDragging(false)
    if (dx < -70) commit('left')
    else if (dx > 70) commit('right')
    else setDx(0)
  }

  const x = flying === 'left' ? -420 : flying === 'right' ? 420 : dx
  const lean: Side | null = flying ?? (dx < -30 ? 'left' : dx > 30 ? 'right' : null)
  const n = cards.length - remaining.length

  return (
    <div className="flex flex-1 flex-col">
      <style>{`
        @keyframes v2cs-nudge { 0%,100%{transform:translateX(0) rotate(0)} 25%{transform:translateX(-18px) rotate(-3deg)} 60%{transform:translateX(14px) rotate(2.5deg)} }
        .v2cs-nudge { animation: v2cs-nudge 1.5s ease-in-out 0.6s 1; }
        @media (prefers-reduced-motion: reduce){ .v2cs-nudge{animation:none!important} }
      `}</style>
      <div className="flex items-stretch gap-2 sm:gap-4">
        <Pile side="left" label={left} cards={pile('left')} lit={lean === 'left'} onTap={() => undo('left')} />

        {/* the card */}
        <div className="relative flex min-h-[244px] flex-1 items-center justify-center sm:min-h-[292px]">
          {next && (
            <div aria-hidden className="absolute inset-x-2 top-2 bottom-0 rounded-[10px] border border-rule-soft bg-ground" style={{ transform: 'translateY(6px) scale(0.96)' }} />
          )}
          {current ? (
            <div
              key={current.id}
              role="group"
              aria-label={`${current.label}. Card ${n + 1} of ${cards.length}`}
              onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
              className={`relative z-10 flex h-full w-full cursor-grab touch-none select-none flex-col items-center rounded-[10px] border border-rule-soft bg-ground px-3 pb-4 pt-3 shadow-[0_1px_0_#DDD9D2,0_10px_28px_rgba(13,12,11,0.10)] active:cursor-grabbing ${!touched && n === 0 ? 'v2cs-nudge' : ''}`}
              style={{
                transform: `translateX(${x}px) rotate(${x / 22}deg)`,
                opacity: flying ? 0 : 1,
                transition: dragging ? 'none' : `transform ${FLY_MS}ms cubic-bezier(.2,.7,.3,1), opacity ${FLY_MS}ms ease`,
              }}
            >
              <span className="self-end font-[family-name:var(--font-ui)] text-[12px] tabular-nums text-muted">{n + 1} of {cards.length}</span>
              <p className="mt-1 text-center font-[family-name:var(--font-text)] text-[22px] font-semibold leading-[26px] text-ink sm:text-[24px]">{current.label}</p>
              {current.art && (
                <img src={`/game/3d/${current.art}.webp`} alt="" draggable={false}
                  className="pointer-events-none mt-3 h-[128px] min-h-0 w-full object-contain sm:h-[176px]" />
              )}
              {/* the pile it is leaning to, said in words */}
              {lean && (
                <span className={`absolute inset-x-3 top-3 rounded-[4px] border-2 bg-ground py-1 text-center font-[family-name:var(--font-ui)] text-[13px] font-semibold leading-[16px] ${lean === 'left' ? 'border-forest text-forest' : 'border-navy text-navy'}`}>
                  {lean === 'left' ? `‹ ${left}` : `${right} ›`}
                </span>
              )}
            </div>
          ) : (
            <div className="relative z-10 flex h-full w-full flex-col items-center justify-center rounded-[10px] border border-dashed border-rule bg-paper px-4 text-center">
              {done}
            </div>
          )}
        </div>

        <Pile side="right" label={right} cards={pile('right')} lit={lean === 'right'} onTap={() => undo('right')} />
      </div>

      {/* the two answers, directly under the card */}
      <div className="mt-3 grid grid-cols-2 gap-3">
        <button type="button" disabled={!current} onClick={() => commit('left')}
          className="flex min-h-14 items-center justify-center gap-2 rounded-[6px] border-2 border-forest bg-ground px-3 font-[family-name:var(--font-ui)] text-[15px] font-semibold leading-[19px] text-forest transition-colors hover:bg-forest hover:text-white disabled:opacity-40 disabled:hover:bg-ground disabled:hover:text-forest">
          <span aria-hidden className="text-[20px]">‹</span>{left}
        </button>
        <button type="button" disabled={!current} onClick={() => commit('right')}
          className="flex min-h-14 items-center justify-center gap-2 rounded-[6px] border-2 border-navy bg-ground px-3 font-[family-name:var(--font-ui)] text-[15px] font-semibold leading-[19px] text-navy transition-colors hover:bg-navy hover:text-white disabled:opacity-40 disabled:hover:bg-ground disabled:hover:text-navy">
          {right}<span aria-hidden className="text-[20px]">›</span>
        </button>
      </div>
    </div>
  )
}

function Pile({ side, label, cards, lit, onTap }: { side: Side; label: string; cards: StackCard[]; lit: boolean; onTap: () => void }) {
  const tone = side === 'left' ? 'forest' : 'navy'
  return (
    <button type="button" onClick={onTap} disabled={!cards.length}
      aria-label={`${label}: ${cards.length} card${cards.length === 1 ? '' : 's'}${cards.length ? '. Tap to take the last one back.' : ''}`}
      className={`flex w-[76px] shrink-0 flex-col items-center rounded-[8px] border px-1 pb-2 pt-2 transition-colors sm:w-[132px] ${lit ? (tone === 'forest' ? 'border-solid border-forest bg-forest/10' : 'border-solid border-navy bg-navy/10') : 'border-dashed border-rule bg-paper'}`}>
      <span className={`text-center font-[family-name:var(--font-ui)] text-[12px] font-semibold leading-[15px] sm:text-[14px] sm:leading-[18px] ${tone === 'forest' ? 'text-forest' : 'text-navy'}`}>{label}</span>
      <span className="mt-1 font-[family-name:var(--font-ui)] text-[20px] font-semibold tabular-nums text-ink">{cards.length}</span>
      <div className="mt-1 flex w-full flex-col items-center gap-1">
        {cards.map((c) => (
          <div key={c.id} className="flex w-full items-center gap-1 rounded-[5px] border border-rule-soft bg-ground px-1 py-1 shadow-[0_1px_0_#DDD9D2]">
            {c.art && <img src={`/game/3d/${c.art}.webp`} alt="" className="h-6 w-6 shrink-0 object-contain" />}
            <span className="hidden text-left font-[family-name:var(--font-ui)] text-[12px] leading-[14px] text-ink sm:inline">{c.label}</span>
          </div>
        ))}
      </div>
    </button>
  )
}
