'use client'
/* Template 3: the track.
   A horizontal line with labelled stops. A large readout above says the answer
   in words. The handle waits beside the track until touched; drag it on, or tap
   any stop. The line fills from the anchor (the middle, or the start) to the
   handle as it moves. Optional opt-out button underneath. */
import { useRef, useState } from 'react'

type Props = {
  stops: string[]
  value: number | null             // index into stops
  onChange: (i: number | null) => void
  readoutLead: string              // small line over the readout: "With a different Advisor, I'd be"
  anchorLabel?: string             // fixed marker in the middle: "Where I am today"
  fillFrom?: 'centre' | 'start'
  optOut?: string                  // "I'd rather not say"
  optedOut?: boolean
  onOptOut?: (on: boolean) => void
}

export default function Track({ stops, value, onChange, readoutLead, anchorLabel, fillFrom = 'centre', optOut, optedOut, onOptOut }: Props) {
  const n = stops.length
  const bar = useRef<HTMLDivElement>(null)
  const wrap = useRef<HTMLDivElement>(null)
  const [live, setLive] = useState<number | null>(null)   // 0..1 while dragging
  const [touched, setTouched] = useState(false)

  // stop i sits in the middle of column i
  const xOf = (i: number) => (i + 0.5) / n
  const frac = (clientX: number) => {
    const r = bar.current!.getBoundingClientRect()
    const f = (clientX - r.left) / r.width
    return Math.max(xOf(0), Math.min(xOf(n - 1), f))
  }
  const nearest = (f: number) => Math.max(0, Math.min(n - 1, Math.round(f * n - 0.5)))

  const onDown = (e: React.PointerEvent) => {
    setTouched(true)
    onOptOut?.(false)
    wrap.current?.setPointerCapture(e.pointerId)
    const f = frac(e.clientX)
    setLive(f)
    onChange(nearest(f))
  }
  const onMove = (e: React.PointerEvent) => {
    if (live === null) return
    const f = frac(e.clientX)
    setLive(f)
    onChange(nearest(f))
  }
  const onUp = () => setLive(null)

  const placed = value !== null && !optedOut
  const pos = live ?? (placed ? xOf(value!) : null)
  const anchor = fillFrom === 'centre' ? 0.5 : xOf(0)
  const shown = placed ? stops[value!] : optedOut ? optOut : null

  const onKey = (e: React.KeyboardEvent) => {
    const v = value ?? Math.floor(n / 2)
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); setTouched(true); onOptOut?.(false); onChange(Math.max(0, placed ? v - 1 : v)) }
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); setTouched(true); onOptOut?.(false); onChange(Math.min(n - 1, placed ? v + 1 : v)) }
  }

  return (
    <div className="flex flex-col">
      <style>{`
        @keyframes v2tr-nudge { 0%,100%{transform:translate(-50%,0)} 30%{transform:translate(-50%,-10px)} 55%{transform:translate(-50%,0)} 75%{transform:translate(-50%,-5px)} }
        .v2tr-nudge { animation: v2tr-nudge 1.2s ease-in-out 0.6s 2; }
        @media (prefers-reduced-motion: reduce){ .v2tr-nudge{animation:none!important} }
      `}</style>

      {/* the readout */}
      <div className="rounded-[8px] border border-rule-soft bg-ground px-4 py-1.5 text-center sm:py-3" aria-live="polite">
        <p className="font-[family-name:var(--font-ui)] text-[12px] leading-[16px] text-muted sm:text-[13px]">{readoutLead}</p>
        <p className={`mt-0.5 font-[family-name:var(--font-text)] text-[26px] font-semibold leading-[32px] sm:text-[36px] sm:leading-[44px] ${shown ? 'text-ink' : 'text-rule'}`}>
          {shown ?? '—'}
        </p>
      </div>

      {/* the track */}
      <div ref={wrap} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} className={`relative mt-2 select-none sm:mt-5 ${optedOut ? 'opacity-40' : ''}`}>
        {anchorLabel && (
          <p className="text-center font-[family-name:var(--font-ui)] text-[13px] font-semibold text-forest">{anchorLabel}</p>
        )}
        <div ref={bar} className="relative h-14 cursor-pointer touch-none" onPointerDown={onDown}>
          {/* rail */}
          <div className="absolute top-1/2 h-3 -translate-y-1/2 rounded-full bg-rule-soft" style={{ left: `${xOf(0) * 100}%`, right: `${(1 - xOf(n - 1)) * 100}%` }} />
          {/* fill from the anchor to the handle */}
          {pos !== null && (
            <div className="absolute top-1/2 h-3 -translate-y-1/2 rounded-full bg-navy transition-[left,width] duration-150"
              style={{ left: `${Math.min(anchor, pos) * 100}%`, width: `${Math.abs(pos - anchor) * 100}%` }} />
          )}
          {/* stops */}
          {stops.map((s, i) => (
            <span key={s} aria-hidden className={`absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 ${placed && ((anchor <= xOf(i) && xOf(i) <= pos!) || (pos! <= xOf(i) && xOf(i) <= anchor)) ? 'border-navy bg-navy' : 'border-rule bg-paper'}`}
              style={{ left: `${xOf(i) * 100}%` }} />
          ))}
          {/* the fixed marker */}
          {anchorLabel && (
            <span aria-hidden className="absolute top-0 h-full w-[3px] -translate-x-1/2 rounded-full bg-forest" style={{ left: `${anchor * 100}%` }} />
          )}
          {/* the handle, on the track once touched */}
          {pos !== null && (
            <button type="button" role="slider" aria-label={readoutLead} aria-valuemin={1} aria-valuemax={n} aria-valuenow={(value ?? 0) + 1} aria-valuetext={shown ?? undefined}
              onKeyDown={onKey}
              className={`absolute top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-navy bg-ground text-navy shadow-[0_2px_8px_rgba(13,12,11,0.25)] ${live !== null ? '' : 'transition-[left] duration-200'}`}
              style={{ left: `${pos * 100}%` }}>
              <Grip />
            </button>
          )}
        </div>
        {/* stop labels: tap one to set */}
        <div className="grid" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
          {stops.map((s, i) => (
            <button key={s} type="button" onClick={() => { setTouched(true); onOptOut?.(false); onChange(i) }}
              className={`flex min-h-11 items-start justify-center px-0.5 pt-1 text-center font-[family-name:var(--font-ui)] text-[13px] leading-[16px] sm:text-[14px] ${placed && value === i ? 'font-semibold text-navy' : 'text-muted'}`}>
              {s}
            </button>
          ))}
        </div>

        {/* the handle, waiting beside the track until first touched */}
        {pos === null && !optedOut && (
          <div className="relative h-[52px]">
            <button type="button" role="slider" aria-label={readoutLead} aria-valuemin={1} aria-valuemax={n} aria-valuetext="Not set"
              onKeyDown={onKey}
              onPointerDown={onDown}
              className={`absolute left-1/2 top-1 flex h-12 w-12 touch-none items-center justify-center rounded-full border-2 border-navy bg-ground text-navy shadow-[0_4px_12px_rgba(13,12,11,0.22)] ${!touched ? 'v2tr-nudge' : ''}`}
              style={{ transform: 'translate(-50%,0)' }}>
              <Grip />
            </button>
          </div>
        )}
      </div>

      {optOut && (
        <button type="button" onClick={() => { onOptOut?.(!optedOut); if (!optedOut) onChange(null) }}
          aria-pressed={!!optedOut}
          className={`mx-auto mt-1 min-h-11 rounded-full border px-5 font-[family-name:var(--font-ui)] text-[14px] transition-colors ${optedOut ? 'border-ink bg-ink text-white' : 'border-rule bg-ground text-ink hover:border-ink'}`}>
          {optOut}
        </button>
      )}
    </div>
  )
}

function Grip() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 7 L3 12 L8 17" /><path d="M16 7 L21 12 L16 17" /><path d="M11 8 V16" /><path d="M13 8 V16" />
    </svg>
  )
}
