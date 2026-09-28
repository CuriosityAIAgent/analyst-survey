'use client'
/* The scene-setting screen (after 2.1; on a phone, after the next section break).
   Not a question: it asks the respondent to imagine 2031 for what follows, and
   says plainly they don't have to agree. Every word comes from SCENE in questions.ts.

   SCENE.lines[0] ("Imagine it's 2031 and you're an Advisor. You have:") is the heading and each
   later line is one row. A small desk calendar flips from 2026 to 2031 by
   itself; as it lands, each row's picture changes: thick client folders become a
   taller stack of thin ones, a laptop lights, two chairs slide in. Next is live at once.
   Stored: 'seen' (logged, not scored). */
import { useEffect, useRef, useState } from 'react'
import V2Frame from '../V2Frame'
import type { RenderProps } from './contract'
import { SCENE } from '../questions'

const UI = 'font-[family-name:var(--font-ui)]'
const TEXT = 'font-[family-name:var(--font-text)]'
const TICK_MS = 190

/** The first line is the heading; each later line is one row with its picture.
    A single line with a colon ("Assume the plan for 2031: a. B. C.") still splits
    at the colon, so an older wording keeps working. */
function splitLines(lines: string[]): { head: string; parts: string[] } {
  if (lines.length > 1) return { head: lines[0], parts: lines.slice(1) }
  const line = lines.join(' ')
  const at = line.indexOf(':')
  if (at < 0) return { head: line, parts: [] }
  const head = line.slice(0, at).trim() + '.'
  const parts = line
    .slice(at + 1)
    .split(/(?<=\.)\s+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => s[0].toUpperCase() + s.slice(1))
  return { head, parts }
}

export default function SceneRender(p: RenderProps) {
  const { set, log } = p
  const { head, parts } = splitLines(SCENE.lines)
  const { from, to } = SCENE.calendar
  const [year, setYear] = useState(from)
  const landed = year === to

  // flip the calendar once, by itself
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) { setYear(to); return }
    let y = from
    let timer = 0
    const tick = () => {
      y += 1
      setYear(y)
      if (y < to) timer = window.setTimeout(tick, TICK_MS)
    }
    timer = window.setTimeout(tick, 650)
    return () => window.clearTimeout(timer)
  }, [from, to])

  // logged as seen, once
  const seen = useRef(false)
  useEffect(() => {
    if (seen.current) return
    seen.current = true
    log('seen', { scene: SCENE.id })
    if (p.value !== 'seen') set('seen')
  }, [log, set, p.value])

  return (
    <V2Frame block={SCENE.block} step={p.step} total={p.total} railLabel="Before the next questions" question={head} instruction={SCENE.assumption}
      onNext={p.onNext} onBack={p.onBack}>
      <div className="flex flex-1 flex-col items-center justify-center gap-4 pb-1 lg:gap-9 lg:pb-4" data-q={SCENE.id}>
        <Calendar year={year} from={from} to={to} />
        <ul className="grid w-full gap-2 lg:grid-cols-3 lg:gap-5" aria-label={`By ${to}`}>
          {parts.map((t, i) => (
            <li key={t} className="flex items-center gap-4 rounded-[4px] border border-rule-soft bg-white px-3 py-1.5 shadow-[0_1px_0_#E7E3DB] lg:flex-col lg:items-center lg:gap-3 lg:px-4 lg:pb-5 lg:pt-4 lg:text-center">
              <span className="block h-[46px] w-[64px] shrink-0 lg:h-[92px] lg:w-[128px]" aria-hidden>
                {i === 0 && <Folders on={landed} />}
                {i === 1 && <Laptop on={landed} />}
                {i === 2 && <Chairs on={landed} />}
              </span>
              <span className={`${UI} text-[16px] font-medium leading-[21px] text-ink lg:text-[17px] lg:leading-[23px]`}>{t}</span>
            </li>
          ))}
        </ul>
      </div>
      <style>{`
        @keyframes v2c-flip { 0% { transform: rotateX(-88deg); opacity: .4 } 100% { transform: rotateX(0); opacity: 1 } }
        .v2c-flip { animation: v2c-flip ${TICK_MS - 20}ms cubic-bezier(.3,.7,.3,1) both; transform-origin: 50% 0; backface-visibility: hidden; }
        .v2c-t { transition: transform 620ms cubic-bezier(.3,.8,.3,1), opacity 420ms ease, fill 420ms ease; transform-box: fill-box; }
        @media (prefers-reduced-motion: reduce) { .v2c-flip { animation: none } .v2c-t { transition: none } }
      `}</style>
    </V2Frame>
  )
}

/* A small desk calendar: two rings, a navy band, the year on a page that flips. */
function Calendar({ year, from, to }: { year: number; from: number; to: number }) {
  return (
    <div className="relative w-[128px] lg:w-[176px]" role="img" aria-label={`The year ${to}`} data-year={year}>
      <div className="relative overflow-hidden rounded-[5px] border border-[#CFC8BB] bg-white shadow-[0_2px_0_#DDD9D2,0_12px_24px_rgba(13,12,11,.10)]" style={{ perspective: 400 }}>
        <div className={`${UI} flex h-[22px] items-center justify-center bg-navy text-[10px] font-semibold uppercase tracking-[0.18em] text-white/85 lg:h-[28px] lg:text-[11px]`}>
          {year === from ? 'Today' : 'Imagine'}
        </div>
        <div className="relative h-[54px] lg:h-[76px]">
          {/* the page under the one that flips */}
          <span className={`${TEXT} absolute inset-0 flex items-center justify-center text-[38px] font-semibold tabular-nums text-ink lg:text-[54px]`} aria-hidden>
            {year}
          </span>
          <span key={year} className={`${TEXT} ${year === from ? '' : 'v2c-flip'} absolute inset-0 flex items-center justify-center bg-white text-[38px] font-semibold tabular-nums text-ink lg:text-[54px]`}>
            {year}
          </span>
        </div>
      </div>
      {/* rings */}
      {[28, 72].map((x) => (
        <span key={x} aria-hidden className="absolute -top-[6px] h-[13px] w-[5px] rounded-full bg-[#3B3733] shadow-[0_1px_0_rgba(255,255,255,.4)] lg:w-[6px]" style={{ left: `${x}%` }} />
      ))}
    </div>
  )
}

/* Thick client folders become a taller stack of thin ones. viewBox 64x46. */
function Folders({ on }: { on: boolean }) {
  const thick = [0, 1, 2]
  const thin = [0, 1, 2, 3, 4, 5, 6, 7]
  return (
    <svg viewBox="0 0 64 46" className="h-full w-full">
      <ellipse cx="32" cy="43.5" rx="24" ry="2" fill="#0D0C0B" opacity="0.10" />
      {thick.map((k) => (
        <g key={`a${k}`} className="v2c-t" style={{ opacity: on ? 0 : 1, transform: on ? 'translateX(-10px)' : 'none' }}>
          <rect x="12" y={33 - k * 10} width="40" height="9" rx="1.5" fill={k % 2 ? '#C9A56A' : '#D8B97F'} />
          <rect x="12" y={33 - k * 10} width="40" height="2" rx="1" fill="#fff" opacity="0.35" />
        </g>
      ))}
      {thin.map((k) => (
        <g key={`b${k}`} className="v2c-t" style={{ opacity: on ? 1 : 0, transform: on ? 'none' : 'translateY(-8px)', transitionDelay: on ? `${k * 55}ms` : '0ms' }}>
          <rect x="16" y={39 - k * 4.6} width="32" height="3.6" rx="1" fill={k % 2 ? '#C9A56A' : '#DDBB72'} />
        </g>
      ))}
    </svg>
  )
}

/* A laptop whose screen lights. viewBox 64x46. */
function Laptop({ on }: { on: boolean }) {
  return (
    <svg viewBox="0 0 64 46" className="h-full w-full">
      <ellipse cx="32" cy="43.5" rx="26" ry="2" fill="#0D0C0B" opacity="0.10" />
      <rect x="13" y="6" width="38" height="26" rx="2.5" fill="#2A2724" />
      <rect x="15.5" y="8.5" width="33" height="21" rx="1" className="v2c-t" style={{ fill: on ? '#E6EFEA' : '#3B3733' }} />
      <g className="v2c-t" style={{ opacity: on ? 1 : 0, transitionDelay: on ? '200ms' : '0ms' }}>
        <rect x="19" y="12" width="14" height="2" rx="1" fill="#1F4B3A" />
        <rect x="19" y="16.5" width="24" height="1.6" rx=".8" fill="#1F4B3A" opacity=".45" />
        <rect x="19" y="20.5" width="20" height="1.6" rx=".8" fill="#1F4B3A" opacity=".45" />
        <rect x="19" y="24.5" width="10" height="1.6" rx=".8" fill="#B8862B" />
        <circle cx="44" cy="13" r="2" fill="#B8862B" />
      </g>
      <path d="M7 34 H57 L60 39 Q60.5 40.5 59 40.5 H5 Q3.5 40.5 4 39 Z" fill="#8C857A" />
      <rect x="27" y="35" width="10" height="1.6" rx=".8" fill="#6B6761" />
    </svg>
  )
}

/* One chair; two more slide in beside it. viewBox 64x46. */
function Chairs({ on }: { on: boolean }) {
  const chair = (x: number, c: string) => (
    <g transform={`translate(${x} 0)`}>
      <rect x="-7" y="12" width="14" height="15" rx="3" fill={c} />
      <rect x="-9" y="26" width="18" height="5" rx="2" fill={c} />
      <path d="M-6 31 L-7 41 M6 31 L7 41" stroke="#3B3733" strokeWidth="1.8" strokeLinecap="round" />
    </g>
  )
  return (
    <svg viewBox="0 0 64 46" className="h-full w-full">
      <ellipse cx="32" cy="43.5" rx="27" ry="2" fill="#0D0C0B" opacity="0.10" />
      <g className="v2c-t" style={{ opacity: on ? 1 : 0, transform: on ? 'none' : 'translateX(-14px)', transitionDelay: on ? '120ms' : '0ms' }}>
        {chair(12, '#2F5D4A')}
      </g>
      <g className="v2c-t" style={{ opacity: on ? 1 : 0, transform: on ? 'none' : 'translateX(14px)', transitionDelay: on ? '260ms' : '0ms' }}>
        {chair(52, '#2D4468')}
      </g>
      {chair(32, '#8C4E24')}
    </svg>
  )
}
