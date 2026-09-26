'use client'
/* A follow-up, in place (question 4.4, then its classroom follow-up).

   Parent: "Which two would have helped you learn fastest?" Pick two.
   If "Classroom training" is one of them, Next does not leave the screen: the
   list slides up and away, the topic line "One more on classroom training."
   fades in where the question was, then the follow-up question and a calendar
   invite rise under it. The invite shows the answer as you tap. The topic line
   names the subject, never the person's answer. Back returns to the parent with
   its two ticks still in place. */
import { useEffect, useRef, useState } from 'react'
import V2Frame from '../V2Frame'
import Checklist, { pickMissing } from '../ui/Checklist'
import GhostDemo from '../ui/GhostDemo'

const UI = 'font-[family-name:var(--font-ui)]'
const TEXT = 'font-[family-name:var(--font-text)]'

const CLASSROOM = 'Classroom training'
const WAYS = [CLASSROOM, 'Role plays', 'Practice with an AI client', 'Examples of good work', 'Time with senior Advisors', 'Self-paced modules']

const REQUIRED = ['Yes, always', "Yes, unless there's a client meeting", 'No, optional']
const STATUS: Record<string, { text: string; tone: string }> = {
  'Yes, always': { text: 'Required', tone: 'bg-forest text-white' },
  "Yes, unless there's a client meeting": { text: 'Required, unless there’s a client meeting', tone: 'bg-navy text-white' },
  'No, optional': { text: 'Optional', tone: 'bg-[#E9E5DD] text-ink' },
}

type Phase = 'parent' | 'leaving' | 'follow'

export default function Followup() {
  const [phase, setPhase] = useState<Phase>('parent')
  const [ways, setWays] = useState<string[]>([])
  const [req, setReq] = useState<string[]>([])
  const [peek, setPeek] = useState<string | null>(null)
  const [run, setRun] = useState(0)
  const [skipped, setSkipped] = useState(false)
  const [ghost, setGhost] = useState(true) // the demo plays once, not again on Back
  const rows = useRef(new Map<string, HTMLButtonElement | null>())
  const leaveTimer = useRef(0)
  useEffect(() => () => window.clearTimeout(leaveTimer.current), [])

  const resetAll = () => {
    setPhase('parent'); setWays([]); setReq([]); setGhost(true); setRun((r) => r + 1)
    window.scrollTo({ top: 0 })
  }

  const nextFromParent = () => {
    if (!ways.includes(CLASSROOM)) {
      // no follow-up for this answer; in the game this moves to the next question
      setSkipped(true)
      window.setTimeout(() => { setSkipped(false); resetAll() }, 1400)
      return
    }
    setGhost(false)
    setPhase('leaving')
    leaveTimer.current = window.setTimeout(() => setPhase('follow'), 260)
  }

  if (phase === 'follow') {
    return (
      <V2Frame block="look-back" step={6} total={17}
        bridge="One more on classroom training."
        question="Should it be required?"
        instruction="Tap one."
        missing={pickMissing(req.length, 1, true)}
        onBack={() => { setPhase('parent'); setReq([]) }}
        onNext={resetAll}>
        <div className="v2-rise" style={{ animationDelay: '120ms' }}>
          <Invite answer={req[0]} />
          <div className="mt-4">
            <Checklist options={REQUIRED} picked={req} onChange={setReq} max={1} mode="one" />
          </div>
        </div>
      </V2Frame>
    )
  }

  return (
    <V2Frame block="look-back" step={6} total={17}
      question="Which two would have helped you learn fastest?"
      instruction="Pick two."
      missing={skipped ? 'No follow-up for this answer' : pickMissing(ways.length, 2)}
      onBack={() => setWays([])}
      onNext={nextFromParent}>
      <div className={phase === 'leaving' ? 'v2-leave' : ''}>
        <Checklist key={run} options={WAYS} picked={ways} onChange={setWays} max={2} peek={peek}
          rowRef={(o, el) => { rows.current.set(o, el) }} />
        <p className={`${UI} mt-3 text-[13px] leading-[18px] text-muted`}>
          <span className="font-semibold text-bronze">Preview:</span> pick Classroom training to see its follow-up.
        </p>
      </div>
      {ghost && <GhostDemo key={`g${run}`} family="pick" label="Tap to tick"
        target={() => rows.current.get(CLASSROOM)}
        onPeek={(on) => setPeek(on ? CLASSROOM : null)} />}
    </V2Frame>
  )
}

/* The object: an Outlook-style invite for the class. Its status line is the answer. */
function Invite({ answer }: { answer?: string }) {
  const s = answer ? STATUS[answer] : undefined
  return (
    <div className="overflow-hidden rounded-[4px] border border-rule-soft bg-white shadow-[0_1px_0_#DDD9D2,0_10px_28px_rgba(13,12,11,0.06)]">
      <div className="flex">
        <div aria-hidden className="w-[5px] shrink-0 bg-navy" />
        <div className="flex flex-1 items-start gap-3.5 px-4 py-3.5 lg:px-5">
          <CalendarDay />
          <div className="min-w-0 flex-1">
            <p className={`${UI} text-[11px] font-semibold uppercase tracking-[0.12em] text-muted`}>Invitation</p>
            <p className={`${TEXT} mt-0.5 text-[18px] font-semibold leading-[23px] text-ink`}>A2A classroom training</p>
            <p className={`${UI} mt-0.5 text-[14px] leading-[19px] text-muted`}>Thursday, 09:00 to 12:00 · All Year 1 Analysts</p>
            <div className="mt-2.5 flex min-h-[28px] items-center gap-2">
              <span className={`${UI} text-[13px] text-muted`}>Attendance:</span>
              {s ? (
                <span key={answer} className={`${UI} v2-stamp rounded-[3px] px-2 py-1 text-[13px] font-semibold leading-[16px] ${s.tone}`}>{s.text}</span>
              ) : (
                <span className={`${UI} rounded-[3px] border border-dashed border-rule px-2 py-[3px] text-[13px] leading-[16px] text-disabled-ink`}>Your answer goes here</span>
              )}
            </div>
          </div>
        </div>
      </div>
      <style>{`@keyframes v2-stamp { 0% { opacity: 0; transform: scale(1.25) rotate(-3deg) } 60% { opacity: 1; transform: scale(.97) rotate(0) } 100% { transform: scale(1) } } .v2-stamp { display: inline-block; animation: v2-stamp .32s cubic-bezier(.2,.8,.3,1) both }`}</style>
    </div>
  )
}

function CalendarDay() {
  return (
    <div aria-hidden className="w-[46px] shrink-0 overflow-hidden rounded-[4px] border border-rule-soft text-center">
      <div className={`${UI} bg-navy py-[2px] text-[10px] font-semibold uppercase tracking-[0.1em] text-white`}>Thu</div>
      <div className={`${TEXT} py-1 text-[20px] font-semibold leading-[24px] text-ink`}>12</div>
    </div>
  )
}
