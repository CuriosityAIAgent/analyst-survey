'use client'
/* Template 1, the checklist: a clean paper list of full-width rows.

   Tap a row and its tick draws; tap it again to undo. `max` caps the picks:
   past the cap the row you tapped shakes and says so, right where your finger is
   ("Two picked. Untick one first."). With `mode="one"` a tap moves the single
   choice instead. `peek` shows a pale, unanswered tick for the ghost demo. */
import { useRef, useState } from 'react'

const UI = 'font-[family-name:var(--font-ui)]'

export type ChecklistProps = {
  options: string[]
  picked: string[]
  onChange: (next: string[]) => void
  max: number
  mode?: 'pick' | 'one'
  peek?: string | null
  fullNote?: string
  rowRef?: (option: string, el: HTMLButtonElement | null) => void
  compact?: boolean
}

const WORDS = ['', 'One', 'Two', 'Three', 'Four', 'Five']

export default function Checklist({ options, picked, onChange, max, mode = 'pick', peek, fullNote, rowRef, compact }: ChecklistProps) {
  const [refused, setRefused] = useState<{ opt: string; n: number } | null>(null)
  const timer = useRef(0)

  const tap = (opt: string) => {
    if (mode === 'one') return onChange(picked[0] === opt ? [] : [opt])
    if (picked.includes(opt)) return onChange(picked.filter((x) => x !== opt))
    if (picked.length >= max) {
      window.clearTimeout(timer.current)
      setRefused((r) => ({ opt, n: (r?.n ?? 0) + 1 }))
      timer.current = window.setTimeout(() => setRefused(null), 2000)
      return
    }
    onChange([...picked, opt])
  }

  return (
    <div role={mode === 'one' ? 'radiogroup' : 'group'}
      className="overflow-hidden rounded-[4px] border border-rule-soft bg-white shadow-[0_1px_0_#DDD9D2,0_8px_24px_rgba(13,12,11,0.04)]">
      {options.map((opt, i) => {
        const on = picked.includes(opt)
        const ghost = !on && peek === opt
        const no = refused?.opt === opt
        return (
          <button key={opt} type="button" ref={(el) => rowRef?.(opt, el)}
            role={mode === 'one' ? 'radio' : 'checkbox'} aria-checked={on}
            onClick={() => tap(opt)}
            className={`${UI} group relative flex w-full items-center gap-3.5 px-4 text-left transition-colors duration-150 lg:px-5
              ${compact ? 'min-h-[48px] py-2' : 'min-h-[52px] py-2.5'}
              ${i > 0 ? 'border-t border-rule-soft' : ''}
              ${on ? 'bg-[#EEF3EF]' : ghost ? 'bg-[#F4F6F3]' : 'hover:bg-[#FBFAF8]'}`}>
            {on && <span aria-hidden className="absolute inset-y-0 left-0 w-[3px] bg-forest" />}
            <Tick on={on} ghost={ghost} round={mode === 'one'} />
            <span key={no ? `no-${refused?.n}` : 'ok'} className={`flex-1 text-[16px] leading-[21px] ${on ? 'font-semibold text-ink' : 'text-ink'} ${no ? 'v2-shake' : ''}`}>
              {opt}
            </span>
            {no && (
              <span role="status" className="v2-ready shrink-0 rounded-[3px] bg-bronze px-2 py-1 text-[12px] font-medium leading-[15px] text-white">
                {fullNote ?? `${WORDS[max] ?? max} picked. Untick one first.`}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

/* The tick box. The tick itself draws on (stroke-dashoffset) when chosen. */
function Tick({ on, ghost, round }: { on: boolean; ghost: boolean; round: boolean }) {
  return (
    <span aria-hidden className={`relative flex h-6 w-6 shrink-0 items-center justify-center border-[1.5px] transition-colors duration-150
      ${round ? 'rounded-full' : 'rounded-[4px]'}
      ${on ? 'border-forest bg-forest' : ghost ? 'border-forest/60 bg-white' : 'border-rule bg-white group-hover:border-ink'}`}>
      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]">
        <path d="M5 12.5 L10 17 L19 7.5" fill="none" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"
          stroke={on ? '#FFFFFF' : '#1F4B3A'} pathLength={1} strokeDasharray="1"
          style={{
            strokeDashoffset: on || ghost ? 0 : 1,
            opacity: on ? 1 : ghost ? 0.45 : 0,
            transition: on || ghost ? 'stroke-dashoffset .28s cubic-bezier(.3,.7,.3,1) .04s, opacity .1s' : 'stroke-dashoffset .16s ease, opacity .16s .1s',
          }} />
      </svg>
    </span>
  )
}

/* "Pick 2" · "Pick 1 more" · undefined when complete. */
export function pickMissing(n: number, max: number, one = false) {
  if (one) return n ? undefined : 'Tap one'
  if (n >= max) return undefined
  return n === 0 ? `Pick ${max}` : `Pick ${max - n} more`
}
