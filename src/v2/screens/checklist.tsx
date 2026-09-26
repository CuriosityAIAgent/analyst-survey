'use client'
/* Layout 1, the checklist (question 2.2). Eight plain full-width rows. Tap to
   tick, tap again to undo, two at most. Next says "Pick 1 more" until done. */
import { useRef, useState } from 'react'
import V2Frame from '../V2Frame'
import Checklist, { pickMissing } from '../ui/Checklist'
import GhostDemo from '../ui/GhostDemo'

const SKILLS = [
  'Winning new clients',
  'Running meetings, asking hard questions',
  'Turning analysis into advice',
  'Working across the firm',
  'Prioritising across many clients',
  'Getting a client to decide',
  'Leading a service team',
  'Using AI tools well',
]

export default function ChecklistScreen() {
  const [picked, setPicked] = useState<string[]>([])
  const [peek, setPeek] = useState<string | null>(null)
  const [run, setRun] = useState(0)
  const rows = useRef(new Map<string, HTMLButtonElement | null>())

  return (
    <V2Frame block="look-back" step={4} total={17}
      question="As an Advisor, what were you least prepared for?"
      instruction="Pick two."
      missing={pickMissing(picked.length, 2)}
      onBack={() => setPicked([])}
      onNext={() => { setPicked([]); setRun((r) => r + 1); window.scrollTo({ top: 0 }) }}>
      <Checklist key={run} options={SKILLS} picked={picked} onChange={setPicked} max={2} peek={peek}
        rowRef={(o, el) => { rows.current.set(o, el) }} />
      <GhostDemo key={`g${run}`} family="pick" label="Tap to tick"
        target={() => rows.current.get(SKILLS[0])}
        onPeek={(on) => setPeek(on ? SKILLS[0] : null)} />
    </V2Frame>
  )
}
