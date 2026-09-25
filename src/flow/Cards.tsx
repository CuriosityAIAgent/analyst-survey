'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { Card } from './types'
import { Visual } from './Visual'

type P<T> = { card: Card; value: T | undefined; set: (v: T) => void; done: (from: string) => void }

const TONE: Record<string, string> = {
  forest: 'var(--color-forest)', bronze: 'var(--color-bronze)', navy: 'var(--color-navy)',
  gold: '#B8862B', green: 'var(--color-forest)', red: 'var(--color-bronze)', amber: '#B8862B', blue: 'var(--color-navy)',
}
const tone = (c?: string) => TONE[c ?? ''] ?? 'var(--color-ink)'

/* -------------------------------------------------------------- pick */
export function Pick({ card, value, set, done }: P<string>) {
  // Instagram-fast: a tap is an answer. The advance is bound to THIS card, so
  // a double tap cannot schedule a second advance that fires on the next one.
  const pick = (id: string) => {
    set(id)
    window.setTimeout(() => done(card.id), 220)
  }
  const pictured = card.options!.some((o) => o.visual)
  if (pictured) {
    return (
      <div className={`grid gap-3 ${card.options!.length === 2 ? 'grid-cols-2' : 'grid-cols-2'}`}>
        {card.options!.map((o) => (
          <button key={o.id} type="button" aria-pressed={value === o.id} onClick={() => pick(o.id)}
            className="group flex flex-col overflow-hidden border text-left transition-colors"
            style={{
              borderColor: value === o.id ? 'var(--color-ink)' : 'var(--color-rule)',
              background: value === o.id ? 'var(--color-ink)' : 'var(--color-ground)',
            }}>
            <Visual id={`${card.id}.${o.id}`} brief={o.visual} ratio="4/3" />
            <span className="px-3 py-3 font-[family-name:var(--font-ui)] text-[15px] font-medium"
              style={{ color: value === o.id ? '#fff' : 'var(--color-ink)' }}>
              {o.label}
            </span>
          </button>
        ))}
      </div>
    )
  }
  return (
    <div className="grid gap-2.5">
      {card.options!.map((o) => (
        <button key={o.id} type="button" className="choice min-h-[58px] text-[17px]"
          aria-pressed={value === o.id} onClick={() => pick(o.id)}>
          {o.label}
        </button>
      ))}
    </div>
  )
}

/* -------------------------------------------------------------- multi */
export function Multi({ card, value = [], set }: P<string[]>) {
  const max = card.max ?? card.options!.length
  const toggle = (id: string) =>
    value.includes(id) ? set(value.filter((x) => x !== id)) : value.length < max && set([...value, id])
  return (
    <div>
      <p className="mb-3 font-[family-name:var(--font-ui)] text-[13px] text-muted">
        {max === 1 ? 'Pick one.' : `Pick up to ${max}.`} {value.length}/{max}
      </p>
      <div className="flex flex-wrap gap-2">
        {card.options!.map((o) => (
          <button key={o.id} type="button" className="choice" aria-pressed={value.includes(o.id)}
            disabled={!value.includes(o.id) && value.length >= max} onClick={() => toggle(o.id)}>
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}

/* -------------------------------------------------------------- scale */
/* Tap-to-place on labelled stops, not a drag slider. The evidence is not close:
   drag sliders raised break-off (odds ratio 6.9, Funke, Reips & Thomas 2011),
   lowered response on mobile, and the handle's starting position shifted
   answers (Maineri et al. 2021). Tap-to-place had none of those problems.
   So: no handle until you tap, labels carry the meaning (not a 0-10 number),
   an untouched scale is stored as missing, and it is a radiogroup, which is
   also a better keyboard and screen-reader control than a range input. */
function stopsFor(s: NonNullable<Card['slider']>) {
  if (s.marks && s.marks.length >= 2) return [...s.marks].sort((a, b) => a.at - b.at)
  const n = 5
  return Array.from({ length: n }, (_, i) => ({
    at: Math.round(s.min + ((s.max - s.min) * i) / (n - 1)),
    label: i === 0 ? s.left : i === n - 1 ? s.right : '',
  }))
}

function RouteStops({ stops, value, onPick }: {
  stops: { at: number; label: string }[]; value: number | undefined; onPick: (v: number) => void
}) {
  const W = 320, H = 92
  const y = (u: number) => H - 16 - (u * 0.74 + Math.sin(u * 9) * 0.05) * (H - 34)
  const pts = Array.from({ length: 41 }, (_, i) => { const u = i / 40; return `${u * W},${y(u)}` }).join(' ')
  const sel = stops.findIndex((s) => s.at === value)
  const cx = sel >= 0 ? (sel / (stops.length - 1)) * W : -1
  return (
    <svg viewBox={`-10 -4 ${W + 20} ${H + 8}`} className="block w-full" aria-hidden>
      <polyline points={pts} fill="none" stroke="var(--color-rule)" strokeWidth="2" strokeDasharray="4 5" />
      {sel >= 0 && (
        <polyline points={pts.split(' ').filter((p) => Number(p.split(',')[0]) <= cx).join(' ')}
          fill="none" stroke="var(--color-navy)" strokeWidth="3" strokeLinecap="round" />
      )}
      {stops.map((st, i) => {
        const u = i / (stops.length - 1)
        const on = i === sel
        return (
          <g key={st.at} transform={`translate(${u * W},${y(u)})`}>
            <circle r={on ? 6 : 4.5} fill={on ? 'var(--color-ink)' : 'var(--color-ground)'}
              stroke="var(--color-ink)" strokeWidth="1.5" />
            {on && <><path d="M0 -6 v-18" stroke="var(--color-ink)" strokeWidth="1.6" />
              <path d="M0 -24 l12 4 l-12 4 z" fill="var(--color-bronze)" /></>}
          </g>
        )
      })}
    </svg>
  )
}

export function Slider({ card, value, set }: P<number>) {
  const s = card.slider!
  const stops = stopsFor(s)
  const cur = stops.find((st) => st.at === value)
  const pick = (v: number) => set(v)
  const onKey = (e: React.KeyboardEvent, i: number) => {
    const to = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? i + 1
      : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? i - 1 : null
    if (to === null) return
    e.preventDefault()
    const j = Math.max(0, Math.min(stops.length - 1, to))
    pick(stops[j].at)
    ;(e.currentTarget.parentElement?.children[j] as HTMLElement | undefined)?.focus()
  }
  return (
    <div>
      <div className="display min-h-[44px] text-[34px] leading-tight text-ink" aria-live="polite">
        {cur ? (cur.label || String(cur.at)) : <span className="text-[20px] text-muted">Tap where you&apos;d put it</span>}
      </div>
      {s.style === 'route' && <div className="mt-3"><RouteStops stops={stops} value={value} onPick={pick} /></div>}
      <div role="radiogroup" aria-label={card.prompt}
        className="mt-3 grid gap-1.5" style={{ gridTemplateColumns: `repeat(${stops.length}, minmax(0, 1fr))` }}>
        {stops.map((st, i) => {
          const on = st.at === value
          return (
            <button key={st.at} type="button" role="radio" aria-checked={on}
              tabIndex={on || (value === undefined && i === 0) ? 0 : -1}
              aria-label={st.label || `${st.at}`}
              onClick={() => pick(st.at)} onKeyDown={(e) => onKey(e, i)}
              className="flex min-h-[48px] items-center justify-center border px-1 text-center font-[family-name:var(--font-ui)] text-[12px] leading-tight transition-colors"
              style={{
                borderColor: on ? 'var(--color-ink)' : 'var(--color-rule)',
                background: on ? 'var(--color-ink)' : 'var(--color-ground)',
                color: on ? '#fff' : 'var(--color-ink-2)',
              }}>
              {st.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* -------------------------------------------------------------- swipe */
export function Swipe({ card, value = {}, set, done }: P<Record<string, 'left' | 'right'>>) {
  const items = card.options!
  const idx = items.findIndex((o) => !(o.id in value))
  const cur = idx >= 0 ? items[idx] : null
  const [dx, setDx] = useState(0)
  const start = useRef<number | null>(null)

  const decide = (side: 'left' | 'right') => {
    if (!cur) return
    const next = { ...value, [cur.id]: side }
    set(next)
    setDx(0)
    if (Object.keys(next).length === items.length) window.setTimeout(() => done(card.id), 260)
  }

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') decide('left')
      if (e.key === 'ArrowRight') decide('right')
    }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  })

  if (!cur) return <p className="text-muted">Done.</p>
  return (
    <div>
      <p className="mb-3 font-[family-name:var(--font-ui)] text-[13px] text-muted">
        {idx + 1} of {items.length} · swipe, tap, or use ← →
      </p>
      <div
        className="relative flex min-h-[150px] touch-pan-y select-none items-center justify-center border border-rule bg-ground px-6 py-6 text-center"
        style={{ transform: `translateX(${dx}px) rotate(${dx / 30}deg)`, transition: start.current ? 'none' : 'transform .2s' }}
        onPointerDown={(e) => { start.current = e.clientX; (e.target as HTMLElement).setPointerCapture?.(e.pointerId) }}
        onPointerMove={(e) => { if (start.current !== null) setDx(e.clientX - start.current) }}
        onPointerUp={() => {
          const d = dx; start.current = null
          if (d > 90) decide('right'); else if (d < -90) decide('left'); else setDx(0)
        }}
        onPointerCancel={() => { start.current = null; setDx(0) }}
        onLostPointerCapture={() => { if (start.current !== null) { start.current = null; setDx(0) } }}
      >
        <span className="flex w-full flex-col items-center gap-4">
          {cur.visual && <Visual id={`${card.id}.${cur.id}`} brief={cur.visual} ratio="16/9" className="w-full" />}
          <span className="display text-[26px] leading-tight text-ink">{cur.label}</span>
        </span>
        {dx < -30 && <span className="absolute left-3 top-3 font-[family-name:var(--font-ui)] text-[12px] text-bronze">{card.sides!.left}</span>}
        {dx > 30 && <span className="absolute right-3 top-3 font-[family-name:var(--font-ui)] text-[12px] text-forest">{card.sides!.right}</span>}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2.5">
        <button type="button" className="choice text-center" onClick={() => decide('left')}>← {card.sides!.left}</button>
        <button type="button" className="choice text-center" onClick={() => decide('right')}>{card.sides!.right} →</button>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------- rank */
export function Rank({ card, value, set }: P<string[]>) {
  const order = value ?? card.options!.map((o) => o.id)
  const label = (id: string) => card.options!.find((o) => o.id === id)?.label ?? id
  const [drag, setDrag] = useState<number | null>(null)
  const rows = useRef<(HTMLLIElement | null)[]>([])

  const move = (from: number, to: number) => {
    if (to < 0 || to >= order.length || from === to) return
    const n = [...order]; const [x] = n.splice(from, 1); n.splice(to, 0, x); set(n)
  }
  // store the initial order the first time, so an untouched rank is still an answer
  useEffect(() => { if (!value) set(order) }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <ol className="grid gap-2">
      {order.map((id, i) => (
        <li key={id} ref={(el) => { rows.current[i] = el }}
          className="flex min-h-[54px] items-center gap-3 border border-rule bg-ground pl-3 pr-1.5"
          style={{ opacity: drag === i ? 0.6 : 1 }}
          onPointerDown={(e) => { setDrag(i); (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId) }}
          onPointerMove={(e) => {
            if (drag === null) return
            const to = rows.current.findIndex((r) => {
              const b = r?.getBoundingClientRect(); return b && e.clientY >= b.top && e.clientY <= b.bottom
            })
            if (to >= 0 && to !== drag) { move(drag, to); setDrag(to) }
          }}
          onPointerUp={() => setDrag(null)}
          onPointerCancel={() => setDrag(null)}
          onLostPointerCapture={() => setDrag(null)}
        >
          <span className="w-6 font-[family-name:var(--font-ui)] text-[15px] font-semibold text-ink">{i + 1}</span>
          <span className="flex-1 touch-none select-none text-[16px] text-ink">{label(id)}</span>
          <span aria-hidden className="cursor-grab px-1 text-muted">⋮⋮</span>
          <button type="button" className="h-11 w-9 text-muted" aria-label={`Move ${label(id)} up`}
            disabled={i === 0} onClick={() => move(i, i - 1)}>↑</button>
          <button type="button" className="h-11 w-9 text-muted" aria-label={`Move ${label(id)} down`}
            disabled={i === order.length - 1} onClick={() => move(i, i + 1)}>↓</button>
        </li>
      ))}
    </ol>
  )
}

/* -------------------------------------------------------------- tokens */
export function Tokens({ card, value = {}, set }: P<Record<string, string[]>>) {
  const toks = card.tokens!
  const [held, setHeld] = useState<string>(toks[0].id)
  const left = (t: string) => toks.find((x) => x.id === t)!.count - (value[t]?.length ?? 0)
  const drop = (opt: string) => {
    if (left(held) <= 0) return
    set({ ...value, [held]: [...(value[held] ?? []), opt] })
  }
  const lift = (t: string, opt: string) => {
    const arr = [...(value[t] ?? [])]; arr.splice(arr.indexOf(opt), 1); set({ ...value, [t]: arr })
  }
  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2" role="radiogroup" aria-label="Which token you are placing">
        {toks.map((t) => (
          <button key={t.id} type="button" role="radio" aria-checked={held === t.id}
            className="choice flex items-center gap-2" onClick={() => setHeld(t.id)}>
            <span className="inline-block h-3.5 w-3.5 rounded-full" style={{ background: tone(t.colour) }} />
            {t.label} <span className="text-muted">×{left(t.id)}</span>
          </button>
        ))}
      </div>
      <div className="grid gap-2">
        {card.options!.map((o) => {
          const on = toks.flatMap((t) => (value[t.id] ?? []).filter((x) => x === o.id).map(() => t))
          return (
            <div key={o.id} className="flex min-h-[54px] items-center gap-2 border border-rule bg-ground pr-2">
              <button type="button" className="flex-1 px-3 py-3 text-left text-[16px] text-ink"
                onClick={() => drop(o.id)} disabled={left(held) <= 0}
                aria-label={`Place a ${toks.find((t) => t.id === held)!.label} token on ${o.label}`}>
                {o.label}
              </button>
              {on.map((t, i) => (
                <button key={i} type="button" onClick={() => lift(t.id, o.id)}
                  aria-label={`Remove ${t.label} from ${o.label}`}
                  className="h-7 w-7 rounded-full" style={{ background: tone(t.colour) }} />
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* -------------------------------------------------------------- text */
export function Text({ card, value = '', set }: P<string>) {
  return (
    <textarea className="field min-h-[110px]" maxLength={200} value={value}
      aria-label={card.prompt} placeholder={card.optional ? 'Optional' : ''}
      onChange={(e) => set(e.target.value)} />
  )
}

export { isAnswered } from './logic'

/* Cards that answer themselves on the last gesture do not need a Continue. */
export const AUTO = new Set(['pick', 'swipe'])

export function useShuffled<T>(items: T[], seed: string): T[] {
  return useMemo(() => {
    let h = 0; for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) | 0
    const a = [...items]
    for (let i = a.length - 1; i > 0; i--) { h = (h * 1103515245 + 12345) | 0; const j = Math.abs(h) % (i + 1); [a[i], a[j]] = [a[j], a[i]] }
    return a
  }, [items, seed])
}
