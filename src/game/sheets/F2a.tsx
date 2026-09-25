'use client'
/* F2a · Camp I · "Ready to do what" (half-sheet over S04; design "F2a").

   Fires when the pace is under 36 months or 'When proven'. The rookie stands
   in the sheet header (forest jacket, so the question is plainly about them)
   and is dragged down onto one of five text-chip ledges. Tap the rookie then
   a ledge, or Tab to the rookie, Space, arrows, Enter, does the same. One
   answer: dropping on another ledge moves them; a drop anywhere else springs
   back.
     stores pace.readyFor ('reviewAlone'|'pitch'|'cold'|'smallBook'|'commitment') */
import { motion } from 'motion/react'
import { useState } from 'react'
import type { ReactNode } from 'react'
import Sheet from '../Sheet'
import Figure from '../Figure'
import { useDrag } from '../useDrag'
import { buzz } from '../feel'
import { copy, fill, zones } from '../content'
import type { Answers, StepProps } from '../types'

type Ledge = Answers['pace.readyFor']

const INK = '#0D0C0B'
const PAPER = '#F8F7F4'
const RULE = '#8C857A'
const FOREST = '#1F4B3A'

export default function F2a(p: StepProps) {
  const ledges = zones('F2a') as { id: Ledge; label: string }[]
  const at = p.answers['pace.readyFor']
  // one drop finishes the sheet (Sheet auto, 500ms); Back undoes it
  const [picks, setPicks] = useState(0)
  const labelOf = (id: string) => (id === 'rookie' ? 'The rookie' : ledges.find((l) => l.id === id)?.label ?? id)

  const d = useDrag({
    labelOf,
    disabled: p.covered,
    onDrop: (item, zone, via) => {
      if (item !== 'rookie' || !zone || !ledges.some((l) => l.id === zone)) return false
      p.set('pace.readyFor', zone as Ledge)
      setPicks((n) => n + 1)
      p.log('drop', { item, zone, via })
      buzz()
    },
  })

  const rookie = (size: number) => (
    <div {...d.item('rookie')} className="flex h-[56px] w-[48px] items-end justify-center" data-testid="f2a-rookie"
      aria-label="The rookie">
      <svg width={48} height={56} viewBox="-24 -50 48 56" style={{ overflow: 'visible' }} aria-hidden>
        {!at && d.lifted !== 'rookie' && <Ring reduced={p.reduced} />}
        <ellipse cx={0} cy={0.5} rx={9} ry={2} fill={INK} opacity={0.14} />
        <Figure as="g" size={size} pose={d.lifted === 'rookie' && d.dragging ? 'stride' : 'stand'} t={0.8} />
      </svg>
    </div>
  )

  const header = at
    ? (
      <div className="flex h-[56px] w-[48px] items-end justify-center" aria-hidden>
        <svg width={48} height={12} viewBox="-24 -6 48 12"><ellipse cx={0} cy={0} rx={12} ry={3.5} fill="none" stroke={RULE} strokeDasharray="2 3" /></svg>
      </div>
    )
    : rookie(44)

  return (
    <Sheet
      id="F2a"
      prompt={fill(copy('F2a').prompt, { stop: p.answers['pace.months'] })}
      header={header}
      valid={!!at}
      onDone={p.next}
      auto
      value={at}
      picks={picks}
    >
      <div {...d.stageProps} className="grid grid-cols-2 gap-x-3 gap-y-1 pb-1" data-testid="f2a-stage">
        {ledges.map((l, i) => (
          <div
            key={l.id}
            {...d.zone(l.id)}
            className={`group relative flex h-[86px] flex-col justify-end ${i === ledges.length - 1 && ledges.length % 2 ? 'col-span-2 mx-auto w-[calc(50%-6px)]' : ''}`}
            data-testid={`f2a-ledge-${l.id}`}
          >
            <div className="flex h-[40px] items-end justify-center">
              {at === l.id && (
                <motion.div initial={p.reduced ? false : { y: -10, opacity: 0.4 }} animate={{ y: 0, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 520, damping: 26 }}>
                  {rookie(40)}
                </motion.div>
              )}
            </div>
            <LedgeChip label={l.label} on={at === l.id} />
          </div>
        ))}
        {d.liveRegion}
      </div>
    </Sheet>
  )
}

/** A text chip drawn as a rock ledge: a flat top the rookie stands on, a
    hachured underside. Outlines in forest while the rookie could land here. */
function LedgeChip({ label, on }: { label: string; on: boolean }): ReactNode {
  return (
    <div className="relative h-[46px] w-full">
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 160 46" preserveAspectRatio="none" aria-hidden>
        <path d="M2 3 H158 L157 24 L150 33 L128 37 L100 35 L64 38 L30 36 L9 33 L3 22 Z" fill={PAPER} stroke={RULE} strokeWidth={1}
          vectorEffect="non-scaling-stroke" strokeLinejoin="round"
          className="transition-[stroke] duration-150 group-data-[valid=true]:[stroke:#1F4B3A] group-data-[valid=true]:[stroke-dasharray:3_3] group-data-[over=true]:[stroke:#1F4B3A] group-data-[over=true]:[stroke-dasharray:none]" />
        <path d="M1 3 H159" stroke={on ? FOREST : INK} strokeWidth={on ? 3 : 2} vectorEffect="non-scaling-stroke" strokeLinecap="round"
          className="group-data-[over=true]:[stroke:#1F4B3A]" />
        {[18, 38, 58, 78, 98, 118, 138].map((x, i) => (
          <path key={x} d={`M${x} ${i % 2 ? 27 : 29} l-2 ${i % 3 ? 5 : 7}`} stroke={RULE} strokeWidth={0.8} vectorEffect="non-scaling-stroke" opacity={0.75} />
        ))}
      </svg>
      <span className={`absolute inset-x-2 top-[8px] text-center font-[family-name:var(--font-ui)] text-[13px] leading-[17px] ${on ? 'font-semibold text-ink' : 'text-ink'}`}>
        {label}
      </span>
    </div>
  )
}

function Ring({ reduced }: { reduced: boolean }) {
  return (
    <motion.ellipse cx={0} cy={0.5} rx={16} ry={4.5} fill="none" stroke={INK} strokeWidth={1} strokeDasharray="2 3"
      initial={false}
      animate={reduced ? { opacity: 0.6 } : { opacity: [0.2, 0.85, 0.2] }}
      transition={reduced ? { duration: 0 } : { duration: 1.8, repeat: Infinity, ease: 'easeInOut' }} />
  )
}
