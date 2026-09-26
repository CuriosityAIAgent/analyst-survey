'use client'
/* How every screen works: a real question (4.1) with its four bands numbered.
   It is fully playable: tap a reason and Next wakes up. On a wide screen the
   callouts sit in the left margin and a card on the right shows the whole
   system: one column, four shared layouts, four standout moments. */
import { useRef, useState } from 'react'
import V2Frame from '../V2Frame'
import Checklist, { pickMissing } from '../ui/Checklist'
import GhostDemo from '../ui/GhostDemo'

const UI = 'font-[family-name:var(--font-ui)]'
const TEXT = 'font-[family-name:var(--font-text)]'

const REASONS = [
  'Advisors are too busy',
  "Advisors aren't taught to coach",
  'No regular time set',
  "Analysts don't ask",
  'Analysts are too busy',
  'It usually works',
]

export default function Anatomy() {
  const [picked, setPicked] = useState<string[]>([])
  const [peek, setPeek] = useState<string | null>(null)
  const [run, setRun] = useState(0)
  const rows = useRef(new Map<string, HTMLButtonElement | null>())
  return (
    <V2Frame block="look-back" step={5} total={17}
      question="What most often stops Analysts getting good coaching from their Advisor?"
      instruction="Tap one."
      missing={pickMissing(picked.length, 1, true)}
      onBack={() => setPicked([])}
      onNext={() => { setPicked([]); setRun((r) => r + 1); window.scrollTo({ top: 0 }) }}
      callouts={{
        question: 'The question, in plain words',
        instruction: 'What to do, with the exact count',
        object: 'The thing you play with: its state is your answer',
        next: 'Next: always here; it tells you what’s missing',
      }}
      aside={<System />}>
      <Checklist key={run} options={REASONS} picked={picked} onChange={setPicked} max={1} mode="one" peek={peek} compact
        rowRef={(o, el) => { rows.current.set(o, el) }} />
      <GhostDemo key={`g${run}`} family="one" label="Tap one"
        target={() => rows.current.get(REASONS[0])}
        onPeek={(on) => setPeek(on ? REASONS[0] : null)} />
      <div className="mt-6 xl:hidden"><System /></div>
    </V2Frame>
  )
}

/* The whole system on one card. */
function System() {
  const layouts: [string, string, React.ReactNode][] = [
    ['Checklist', 'Tick rows', <IconList key="l" />],
    ['Card stack', 'One card at a time', <IconCards key="c" />],
    ['Trays', 'Sort into labelled trays', <IconTrays key="t" />],
    ['Track', 'Slide along a line', <IconTrack key="k" />],
  ]
  const heroes: [string, string][] = [
    ['The podium', 'podium'],
    ['The water bottle', 'bottle'],
    ['The months track', 'months'],
    ['The stamp', 'stamp'],
  ]
  return (
    <div className={`${UI} rounded-[4px] border border-rule-soft bg-paper p-4 shadow-[0_8px_28px_rgba(13,12,11,0.07)]`}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-bronze">Every screen, the same way</p>
      <p className={`${TEXT} mt-1 text-[17px] font-semibold leading-[22px] text-ink`}>One column, top to bottom.</p>

      <p className="mt-4 text-[12px] font-semibold uppercase tracking-[0.1em] text-muted">Four shared layouts</p>
      <ul className="mt-2 grid grid-cols-2 gap-2">
        {layouts.map(([name, what, icon]) => (
          <li key={name} className="flex items-center gap-2.5 rounded-[3px] border border-rule-soft bg-white px-2.5 py-2">
            <span className="shrink-0 text-forest">{icon}</span>
            <span className="min-w-0">
              <span className="block text-[13px] font-semibold leading-[16px] text-ink">{name}</span>
              <span className="block text-[12px] leading-[15px] text-muted">{what}</span>
            </span>
          </li>
        ))}
      </ul>

      <p className="mt-4 text-[12px] font-semibold uppercase tracking-[0.1em] text-muted">Four standout moments</p>
      <ul className="mt-2 grid grid-cols-2 gap-2">
        {heroes.map(([name, id]) => (
          <li key={id}>
            <a href={`/v2?s=${id}`} className="flex min-h-[44px] items-center justify-between rounded-[3px] border border-[#B8862B]/60 bg-[#FBF6EC] px-2.5 text-[13px] font-semibold text-ink hover:border-[#B8862B]">
              {name}<span aria-hidden className="text-[#B8862B]">›</span>
            </a>
          </li>
        ))}
      </ul>

      <p className="mt-4 text-[12px] font-semibold uppercase tracking-[0.1em] text-muted">No climbing words</p>
      <p className="mt-1.5 text-[13px] leading-[19px] text-ink">
        Buttons say <b>Next</b>, <b>Back</b>, <b>Send</b>. The mountain is only the progress line at the top.
      </p>
    </div>
  )
}

const ic = { width: 26, height: 26, viewBox: '0 0 26 26', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
function IconList() {
  return <svg {...ic}><rect x="2" y="3" width="5" height="5" rx="1" /><path d="M3.3 5.6l1.2 1.1 2-2.3" /><path d="M10 5.5h13" /><rect x="2" y="10.5" width="5" height="5" rx="1" /><path d="M10 13h13" /><rect x="2" y="18" width="5" height="5" rx="1" /><path d="M10 20.5h13" /></svg>
}
function IconCards() {
  return <svg {...ic}><rect x="7" y="3" width="13" height="18" rx="2" /><path d="M4 6v14a2 2 0 002 2h11" opacity=".5" /><path d="M10 9h7M10 12.5h5" /></svg>
}
function IconTrays() {
  return <svg {...ic}><path d="M2 12h6v10H2zM10 12h6v10h-6zM18 12h6v10h-6z" /><rect x="10.5" y="3" width="5" height="4" rx="1" /><path d="M13 7v3" /></svg>
}
function IconTrack() {
  return <svg {...ic}><path d="M2 14h22" /><path d="M2 14h12" strokeWidth="3.2" /><circle cx="14" cy="14" r="3.4" fill="#F8F7F4" /><path d="M2 18v2M8 18v2M14 18v2M20 18v2" opacity=".5" /></svg>
}
