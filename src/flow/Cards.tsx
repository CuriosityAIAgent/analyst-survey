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

/* -------------------------------------------------------------- slider */
/* The route slider: the track is the climb, the thumb is the climber. A native
   range input sits on top, transparent, so keyboard and screen readers get a
   real slider and nothing about the answer depends on the drawing. */
function RouteTrack({ frac, touched }: { frac: number; touched: boolean }) {
  const W = 320, H = 96
  const y = (u: number) => H - 14 - (u * 0.78 + Math.sin(u * 9) * 0.05) * (H - 30)
  const pts = Array.from({ length: 41 }, (_, i) => { const u = i / 40; return `${u * W},${y(u)}` }).join(' ')
  const cx = frac * W, cy = y(frac)
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="block w-full" aria-hidden>
      <polyline points={pts} fill="none" stroke="var(--color-rule)" strokeWidth="2" strokeDasharray="4 5" />
      <polyline points={pts.split(' ').filter((p) => Number(p.split(',')[0]) <= cx).join(' ')}
        fill="none" stroke="var(--color-navy)" strokeWidth="3" strokeLinecap="round" />
      <g transform={`translate(${cx},${cy})`} opacity={touched ? 1 : 0.55}>
        <path d="M0 0 v-22" stroke="var(--color-ink)" strokeWidth="1.6" />
        <path d="M0 -22 l12 4 l-12 4 z" fill="var(--color-bronze)" />
        <circle r="4.5" fill="var(--color-ink)" />
      </g>
    </svg>
  )
}

export function Slider({ card, value, set }: P<number>) {
  const s = card.slider!
  const mid = Math.round((s.min + s.max) / 2)
  const v = value ?? mid
  const touched = value !== undefined
  const nearest = s.marks?.length
    ? s.marks.reduce((a, b) => (Math.abs(b.at - v) < Math.abs(a.at - v) ? b : a)).label
    : String(v)
  const frac = (v - s.min) / Math.max(1, s.max - s.min)
  const input = (
    <input type="range" min={s.min} max={s.max} step={1} value={v}
      onChange={(e) => set(Number(e.target.value))}
      aria-label={card.prompt} aria-valuetext={touched ? nearest : 'not answered'}
      className={s.style === 'route'
        ? 'absolute inset-0 h-full w-full cursor-grab opacity-0'
        : 'mt-6 w-full accent-[var(--color-ink)]'}
      style={s.style === 'route' ? undefined : { height: 44 }} />
  )
  return (
    <div>
      <div className="display text-[40px] leading-none text-ink" aria-live="polite">
        {touched ? nearest : <span className="text-muted">Drag to answer</span>}
      </div>
      {s.style === 'route'
        ? <div className="relative mt-4"><RouteTrack frac={frac} touched={touched} />{input}</div>
        : input}
      <div className="mt-1 flex justify-between font-[family-name:var(--font-ui)] text-[13px] text-muted">
        <span>{s.left}</span><span>{s.right}</span>
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
