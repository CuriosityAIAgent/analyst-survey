'use client'
/* Standout 3: the months track (question 5.2).
   A track from 12 to 48 months. Drag the handle (or tap the track) and it
   fills left to right with small clay month blocks, one settling after
   another, under a large readout ("30 months"). The handle sits just left of
   the track from the start and nudges until touched; nothing is chosen until
   then. A separate option, "No set time: when they're ready", clears it. */
import { useRef, useState } from 'react'
import type { KeyboardEvent, PointerEvent } from 'react'
import V2Frame from '../V2Frame'
import { useLaptop } from '../hero/podium/useLaptop'
import { click, unlockAudio } from '../hero/podium/sound'

const MIN = 12
const MAX = 48
const STEP = 3
const SPAN = MAX - MIN // 36 month blocks
const YEARS = [
  { at: 0, label: '1 year' },
  { at: 12, label: '2 years' },
  { at: 24, label: '3 years' },
  { at: 36, label: '4 years' },
]

function inYears(m: number) {
  const y = Math.floor(m / 12)
  const r = m % 12
  const ys = `${y} year${y === 1 ? '' : 's'}`
  return r ? `${ys} ${r} months` : ys
}

export default function Months() {
  const laptop = useLaptop()
  const [value, setValue] = useState<number | null>(null)
  const [prev, setPrev] = useState(MIN)
  const [noSet, setNoSet] = useState(false)
  const [touched, setTouched] = useState(false)
  const groove = useRef<HTMLDivElement | null>(null)
  const dragging = useRef(false)
  const [drag, setDrag] = useState(false)
  const lastClick = useRef(0)

  const set = (v: number) => {
    const c = Math.max(MIN, Math.min(MAX, v))
    setTouched(true)
    setNoSet(false)
    if (c === value) return
    setPrev(value ?? MIN)
    setValue(c)
    const now = performance.now()
    if (now - lastClick.current > 45) { click(); lastClick.current = now }
  }

  const fromX = (x: number) => {
    const r = groove.current?.getBoundingClientRect()
    if (!r) return
    const t = Math.max(0, Math.min(1, (x - r.left) / r.width))
    set(MIN + Math.round((t * SPAN) / STEP) * STEP)
  }

  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    unlockAudio()
    dragging.current = true
    setDrag(true)
    e.currentTarget.setPointerCapture(e.pointerId)
    fromX(e.clientX)
  }
  const onMove = (e: PointerEvent<HTMLDivElement>) => { if (dragging.current) fromX(e.clientX) }
  const onUp = () => { dragging.current = false; setDrag(false) }

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const v = value ?? MIN
    const k: Record<string, number> = { ArrowRight: v + STEP, ArrowUp: v + STEP, ArrowLeft: v - STEP, ArrowDown: v - STEP, Home: MIN, End: MAX }
    if (e.key in k) { e.preventDefault(); set(value === null ? MIN : k[e.key]) }
  }

  const filled = value === null ? 0 : value - MIN
  const was = prev - MIN
  const pct = value === null ? 0 : (filled / SPAN) * 100
  const parked = value === null

  return (
    <V2Frame
      block="faster" step={laptop ? 20 : 14} total={laptop ? 25 : 17}
      question="How long should it take a new Analyst to be ready for Advisor?"
      instruction="Slide to a number of months."
      missing={value === null && !noSet ? 'Set the months' : undefined}
      onNext={() => { setValue(null); setNoSet(false); setTouched(false); setPrev(MIN) }}
    >
      <div className="flex flex-1 flex-col justify-center pb-2">
        {/* the readout */}
        <div className="flex h-[92px] flex-col items-center justify-end text-center lg:h-[112px]" aria-live="polite">
          {noSet ? (
            <>
              <p className="font-[family-name:var(--font-text)] text-[34px] font-semibold leading-[40px] text-ink lg:text-[42px] lg:leading-[48px]">When they&rsquo;re ready</p>
              <p className="mt-1 font-[family-name:var(--font-ui)] text-[14px] text-muted">No set time</p>
            </>
          ) : (
            <>
              <p className="font-[family-name:var(--font-text)] leading-none">
                <span className={`inline-block min-w-[1.2ch] text-[64px] font-semibold tabular-nums lg:text-[80px] ${value === null ? 'text-[#C9C3B8]' : 'text-ink'}`}>
                  {value === null ? '—' : value}
                </span>
                <span className={`ml-2 text-[24px] lg:text-[28px] ${value === null ? 'text-disabled-ink' : 'text-ink'}`}>months</span>
              </p>
              <p className="mt-1.5 h-5 font-[family-name:var(--font-ui)] text-[14px] text-muted">{value === null ? '' : inYears(value)}</p>
            </>
          )}
        </div>

        {/* the track */}
        <div className={`mt-6 transition-opacity duration-300 lg:mt-8 ${noSet ? 'opacity-35' : ''}`}>
          <div className="relative ml-12 mr-5 touch-none select-none lg:ml-16 lg:mr-8"
            onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
            {/* generous hit area above and below the groove */}
            <div className="absolute -inset-y-4 -left-14 -right-5 cursor-pointer" aria-hidden />
            <div ref={groove} className="relative h-[42px] rounded-[6px] lg:h-[52px]"
              style={{ background: 'linear-gradient(180deg,#E6E1D8,#EEEAE3)', boxShadow: 'inset 0 2px 3px rgba(13,12,11,.10), inset 0 -1px 0 #FFFFFF' }}>
              {Array.from({ length: SPAN }, (_, i) => {
                const on = i < filled
                const delay = on && i >= was ? (i - was) * 22 : 0
                return (
                  <span key={i} aria-hidden
                    className={`absolute top-[5px] bottom-[5px] rounded-[2px] ${on ? 'v2m-in' : ''}`}
                    style={{
                      left: `calc(${(i / SPAN) * 100}% + 1px)`,
                      width: `calc(${100 / SPAN}% - 2px)`,
                      animationDelay: `${delay}ms`,
                      background: on
                        ? 'linear-gradient(180deg,#3A5075 0%,#1E3150 45%,#14233B 100%)'
                        : 'transparent',
                      boxShadow: on
                        ? 'inset 0 1px 0 rgba(255,255,255,.35), inset 0 -2px 0 rgba(0,0,0,.25), 0 1px 1px rgba(13,12,11,.2)'
                        : (i % 12 === 0 && i > 0 ? 'inset 1px 0 0 #CFC8BB' : 'none'),
                    }} />
                )
              })}
            </div>

            {/* the handle: parked beside the track until touched */}
            <div role="slider" tabIndex={0} aria-label="Months to be ready for Advisor"
              aria-valuemin={MIN} aria-valuemax={MAX} aria-valuenow={value ?? undefined}
              aria-valuetext={value === null ? 'Not set' : `${value} months`}
              onKeyDown={onKey}
              className={`absolute top-1/2 z-10 flex h-[50px] w-[34px] -translate-x-1/2 -translate-y-1/2 cursor-grab items-center justify-center rounded-[8px] border border-ink bg-ground shadow-[0_4px_10px_rgba(13,12,11,.18)] active:cursor-grabbing lg:h-[60px] lg:w-[38px] ${
                parked && !noSet && !touched ? 'v2m-nudge' : ''
              }`}
              style={{ left: parked ? (laptop ? -36 : -32) : `${pct}%`, transition: drag ? 'none' : 'left 180ms cubic-bezier(.3,.7,.2,1)' }}>
              <span aria-hidden className="flex gap-[3px]">
                <span className="h-5 w-[2px] rounded bg-rule" /><span className="h-5 w-[2px] rounded bg-rule" /><span className="h-5 w-[2px] rounded bg-rule" />
              </span>
            </div>

            {/* year marks */}
            <div aria-hidden className="relative mt-2 h-5 font-[family-name:var(--font-ui)] text-[12px] text-muted lg:text-[13px]">
              {YEARS.map((y) => (
                <span key={y.at} className="absolute top-0 flex -translate-x-1/2 flex-col items-center whitespace-nowrap"
                  style={{ left: `${(y.at / SPAN) * 100}%` }}>
                  <span className="mb-0.5 h-1.5 w-px bg-rule" />
                  {y.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* the separate option */}
        <div className="mt-9 flex justify-center lg:mt-10">
          <button type="button" aria-pressed={noSet}
            onClick={() => { unlockAudio(); setNoSet((x) => !x); setValue(null); setTouched(true) }}
            className={`flex min-h-[48px] items-center gap-3 rounded-[4px] border px-4 font-[family-name:var(--font-ui)] text-[15px] transition-colors ${
              noSet ? 'border-ink bg-ink text-white' : 'border-rule bg-ground text-ink hover:border-ink'
            }`}>
            <span aria-hidden className={`flex h-[18px] w-[18px] items-center justify-center rounded-full border ${noSet ? 'border-white' : 'border-rule'}`}>
              {noSet && <span className="h-2 w-2 rounded-full bg-white" />}
            </span>
            No set time: when they&rsquo;re ready
          </button>
        </div>
      </div>
      <style>{`
        @keyframes v2m-in {
          0% { transform: translateY(-14px) scaleY(1.1); opacity: 0; }
          60% { transform: translateY(1px) scaleY(.94); opacity: 1; }
          100% { transform: translateY(0) scaleY(1); opacity: 1; }
        }
        .v2m-in { animation: v2m-in 240ms cubic-bezier(.3,.7,.3,1) both; transform-origin: bottom; }
        @keyframes v2m-nudge {
          0%, 40%, 100% { transform: translateX(0); }
          10% { transform: translateX(14px); }
          20% { transform: translateX(0); }
          30% { transform: translateX(8px); }
        }
        .v2m-nudge { animation: v2m-nudge 2.4s ease-in-out .6s 3; }
      `}</style>
    </V2Frame>
  )
}
