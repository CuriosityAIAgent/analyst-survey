'use client'
/* Between sections, and the ending. The only two places the small figure moves.

   Section break (about 1.2 s): the question leaves, the figure walks up the
   mountain line from the last marker to the next one, the next section's name
   appears in plain words, then Next lights.

   Ending: the figure walks to the top by itself (no drag), a small flag rises,
   and the game's idea is said plainly: "AI can help. You still do the work." */
import { useEffect, useState } from 'react'
import V2Frame from '../V2Frame'

const UI = 'font-[family-name:var(--font-ui)]'

type View = 'break' | 'ending'

/* the markers: one per section start, then the top */
const STOPS: [number, number][] = [[72, 252], [186, 222], [292, 170], [382, 140], [446, 90], [494, 44]]
const SECTIONS = ['Looking back', 'The job ahead', "A new Analyst's time", 'Getting to Advisor faster', 'Last thoughts']

function legPath(i: number) {
  const [x0, y0] = STOPS[i]
  const [x1, y1] = STOPS[i + 1]
  // a gentle switchback between markers
  const mx = (x0 + x1) / 2 + (i % 2 ? -18 : 18)
  const my = (y0 + y1) / 2 + 6
  return `M${x0} ${y0} Q${mx} ${my} ${x1} ${y1}`
}

export default function BreakEnding() {
  const [view, setView] = useState<View>('break')
  const [run, setRun] = useState(0)
  const show = (v: View) => { setView(v); setRun((r) => r + 1) }
  return view === 'break'
    ? <SectionBreak key={`b${run}`} toggle={<Toggle view={view} onPick={show} />} onReplay={() => show('break')} />
    : <Ending key={`e${run}`} toggle={<Toggle view={view} onPick={show} />} onReplay={() => show('ending')} />
}

/* ---- the section break ---------------------------------------------------- */

function SectionBreak({ toggle, onReplay }: { toggle: React.ReactNode; onReplay: () => void }) {
  const from = 1, to = 2 // "The job ahead" done; next: "A new Analyst's time"
  const { pos, done } = useWalk(from, 1200, 350)
  return (
    <V2Frame block="analyst-time" step={11} total={17}
      question={done ? SECTIONS[to] : ' '}
      instruction={done ? 'Section 3 of 5 · 3 questions, about 2 minutes.' : ' '}
      missing={done ? undefined : 'Next'}
      onNext={onReplay}>
      {toggle}
      <Scene reached={done ? to : from} walking={!done} pos={pos} highlight={done ? to : undefined} />
    </V2Frame>
  )
}

/* ---- the ending ------------------------------------------------------------ */

function Ending({ toggle, onReplay }: { toggle: React.ReactNode; onReplay: () => void }) {
  const { pos, done } = useWalk(4, 1800, 450)
  return (
    <V2Frame block="last" step={17} total={17}
      question="AI can help. You still do the work."
      instruction="Thank you. Your answers have been sent."
      nextLabel="Close"
      onNext={onReplay}>
      {toggle}
      <Scene reached={done ? 5 : 4} walking={!done} pos={pos} flag={done} />
      <p className={`${UI} mt-4 text-center text-[13px] leading-[18px] text-muted`}>
        Your answers are held under a code, not your name. We only report groups of ten or more.
      </p>
    </V2Frame>
  )
}

/* Walk along leg `leg` over `ms`, after `wait`. Reduced motion: arrive at once. */
function useWalk(leg: number, ms: number, wait: number) {
  const [pos, setPos] = useState<{ x: number; y: number; dir: number }>({ x: STOPS[leg][0], y: STOPS[leg][1], dir: 1 })
  const [done, setDone] = useState(false)
  useEffect(() => {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    path.setAttribute('d', legPath(leg))
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.style.position = 'absolute'; svg.style.width = '0'; svg.style.height = '0'
    svg.appendChild(path); document.body.appendChild(svg)
    const len = path.getTotalLength()
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let raf = 0
    const end = () => { const p = path.getPointAtLength(len); setPos({ x: p.x, y: p.y, dir: 1 }); setDone(true) }
    const timer = window.setTimeout(() => {
      if (reduced) return end()
      const t0 = performance.now()
      const step = (now: number) => {
        const u = Math.min(1, (now - t0) / ms)
        const e = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2
        const a = path.getPointAtLength(e * len)
        const b = path.getPointAtLength(Math.min(len, e * len + 1))
        setPos({ x: a.x, y: a.y, dir: b.x >= a.x ? 1 : -1 })
        if (u < 1) raf = requestAnimationFrame(step)
        else end()
      }
      raf = requestAnimationFrame(step)
    }, wait)
    return () => { window.clearTimeout(timer); cancelAnimationFrame(raf); svg.remove() }
  }, [leg, ms, wait])
  return { pos, done }
}

/* ---- the scene: a clean mountain line with markers -------------------------- */

function Scene({ reached, walking, pos, highlight, flag }: {
  reached: number; walking: boolean; pos: { x: number; y: number; dir: number }; highlight?: number; flag?: boolean
}) {
  return (
    <div className="relative mx-auto my-auto w-full max-w-[560px] py-2">
      <svg viewBox="0 0 640 280" className="block w-full" role="img"
        aria-label={flag ? 'The figure reaches the top of the mountain.' : `The figure walks on to the next section: ${SECTIONS[Math.min(reached, 4)]}.`}>
        <defs>
          <linearGradient id="v2-mtn" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#EDE9E1" />
            <stop offset="1" stopColor="#F8F7F4" />
          </linearGradient>
        </defs>
        {/* far range */}
        <path d="M0 262 L60 226 L110 236 L200 176 L250 188 L420 104 L470 120 L560 70 L640 112 L640 262 Z" fill="#F2EFE9" />
        {/* the mountain */}
        <path d="M18 262 L140 196 L176 204 L300 122 L330 130 L500 34 L566 92 L604 116 L640 146 L640 262 Z" fill="url(#v2-mtn)" />
        <path d="M18 262 L140 196 L176 204 L300 122 L330 130 L500 34 L566 92 L604 116 L640 146" fill="none" stroke="#8C857A" strokeWidth="1.4" strokeLinejoin="round" />
        <path d="M480 50 L500 34 L521 51 L510 47 L500 54 L490 47 Z" fill="#FFFFFF" opacity="0.9" />
        {/* ground */}
        <path d="M0 262 L640 262" stroke="#8C857A" strokeWidth="1.2" />
        {[40, 58, 118, 560, 584, 612].map((x, i) => (
          <path key={i} d={`M${x} ${262 - 14 - (i % 2) * 4} L${x + 6} 262 L${x - 6} 262 Z`} fill="#1F4B3A" opacity="0.8" />
        ))}

        {/* the trail: done legs solid, the rest dashed */}
        {STOPS.slice(0, -1).map((_, i) => (
          <path key={i} d={legPath(i)} fill="none" strokeLinecap="round"
            stroke={i < reached ? '#1F4B3A' : '#B7B0A4'} strokeWidth={i < reached ? 2.2 : 1.6}
            strokeDasharray={i < reached ? undefined : '3 5'} />
        ))}
        {/* markers */}
        {STOPS.slice(0, 5).map(([x, y], i) => (
          <g key={i}>
            {highlight === i && <circle cx={x} cy={y} r="14" fill="#B8862B" opacity="0.18" className="v2-pulse" style={{ transformOrigin: `${x}px ${y}px` }} />}
            <circle cx={x} cy={y} r="5.5" fill={i <= reached ? '#1F4B3A' : '#F8F7F4'} stroke={highlight === i ? '#B8862B' : i <= reached ? '#1F4B3A' : '#8C857A'} strokeWidth={highlight === i ? 2.5 : 1.5} />
          </g>
        ))}
        {highlight !== undefined && (
          <text x={STOPS[highlight][0] - 26} y={STOPS[highlight][1] + 4} textAnchor="end"
            className="v2-ready" style={{ font: '600 20px var(--font-ui)', fill: '#0D0C0B' }}>{SECTIONS[highlight]}</text>
        )}
        {/* the top: a small flag rises at the end */}
        <line x1="508" y1="40" x2="508" y2={flag ? 10 : 40} stroke="#0D0C0B" strokeWidth="1.6" style={{ transition: 'all .5s cubic-bezier(.2,.8,.3,1) .15s' }} />
        <path d="M508 10 L530 16 L508 22 Z" fill="#B8862B" style={{ opacity: flag ? 1 : 0, transition: 'opacity .3s .55s' }} />

        <Figure x={pos.x} y={pos.y} dir={pos.dir} walking={walking} />
      </svg>
      <style>{`
@keyframes v2-pulse-k { 0% { transform: scale(.6); opacity: .5 } 100% { transform: scale(1.6); opacity: 0 } }
.v2-pulse { animation: v2-pulse-k 1.1s ease-out 2 }
@keyframes v2-legA { 0%,100% { transform: rotate(22deg) } 50% { transform: rotate(-22deg) } }
@keyframes v2-legB { 0%,100% { transform: rotate(-22deg) } 50% { transform: rotate(22deg) } }
@keyframes v2-bob { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-1.2px) } }
.v2-walk .v2-la { animation: v2-legA .42s linear infinite }
.v2-walk .v2-lb { animation: v2-legB .42s linear infinite }
.v2-walk .v2-body { animation: v2-bob .21s linear infinite }
`}</style>
    </div>
  )
}

/* The pictogram: a simple figure with a small pack. Feet at (0,0). */
function Figure({ x, y, dir, walking }: { x: number; y: number; dir: number; walking: boolean }) {
  return (
    <g transform={`translate(${x} ${y - 3}) scale(${dir} 1)`} className={walking ? 'v2-walk' : ''}>
      <ellipse cx="0" cy="3" rx="7" ry="1.8" fill="#0D0C0B" opacity="0.12" />
      <g className="v2-la" style={{ transformOrigin: '0px -12px' }}>
        <line x1="0" y1="-12" x2="0" y2="0" stroke="#0D0C0B" strokeWidth="2.6" strokeLinecap="round" />
      </g>
      <g className="v2-lb" style={{ transformOrigin: '0px -12px' }}>
        <line x1="0" y1="-12" x2="0" y2="0" stroke="#0D0C0B" strokeWidth="2.6" strokeLinecap="round" />
      </g>
      <g className="v2-body">
        <rect x="-6.5" y="-24" width="5" height="9" rx="1.5" fill="#7A3E12" />
        <line x1="0" y1="-24" x2="0" y2="-12" stroke="#0D0C0B" strokeWidth="3" strokeLinecap="round" />
        <line x1="0" y1="-21" x2="5" y2="-15" stroke="#0D0C0B" strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="0.5" cy="-28.5" r="3.6" fill="#0D0C0B" />
      </g>
    </g>
  )
}

/* ---- preview toggle (mockup only) ------------------------------------------- */

function Toggle({ view, onPick }: { view: View; onPick: (v: View) => void }) {
  const b = (v: View, label: string) => (
    <button type="button" onClick={() => onPick(v)} aria-pressed={view === v}
      className={`${UI} h-9 rounded-[3px] px-3 text-[13px] font-medium transition-colors ${view === v ? 'bg-ink text-white' : 'text-ink hover:bg-[#EEEBE5]'}`}>
      {label}
    </button>
  )
  return (
    <div className="mb-3 flex items-center justify-center gap-2">
      <span className={`${UI} text-[12px] uppercase tracking-[0.12em] text-muted`}>Preview</span>
      <div className="flex gap-1 rounded-[4px] border border-dashed border-rule p-1">
        {b('break', 'Section break')}
        {b('ending', 'Ending')}
      </div>
    </div>
  )
}
