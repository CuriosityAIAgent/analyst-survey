'use client'
/* F2a · Camp I · "Ready to do what" (half-sheet over S04; design "F2a").

   Fires when the pace is under 36 months or 'When proven'. The rookie stands
   in the sheet header (forest jacket, so the question is plainly about them)
   and is dragged down onto one of five text-chip ledges. Tap the rookie then
   a ledge, or Tab to the rookie, Space, arrows, Enter, does the same. One
   answer: dropping on another ledge moves them; a drop anywhere else springs
   back.
     stores pace.readyFor ('reviewAlone'|'pitch'|'cold'|'smallBook'|'commitment')

   DESK (design 6): a card 880 wide at k = 1. The rookie at about 96px on a
   start ledge at the left; the five ledges 144 x 64 in one level row (level,
   so no order is implied), in the spec order as on the phone. The rookie
   lands standing on the chosen ledge. Keys 1-5 choose (logged via 'key'). */
import { motion } from 'motion/react'
import { useState } from 'react'
import type { ReactNode } from 'react'
import Sheet from '../Sheet'
import { CARD_DW, NumBadge, SheetCanvas, numberKeys, useSheetFit, useSheetKeys } from './desk'
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

  // x = CSS px per viewBox unit (1 on the phone, 2 on the desk card)
  const rookie = (size: number, x = 1) => (
    <div {...d.item('rookie')} className="flex items-end justify-center" style={{ width: 48 * x, height: 56 * x }} data-testid="f2a-rookie"
      aria-label="The rookie">
      <svg width={48 * x} height={56 * x} viewBox="-24 -50 48 56" style={{ overflow: 'visible' }} aria-hidden>
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

  const choose = (zone: Ledge, via: 'key') => {
    p.set('pace.readyFor', zone)
    setPicks((n) => n + 1)
    p.log('drop', { item: 'rookie', zone, via })
    buzz()
  }
  const fit = useSheetFit(CARD_DW, 236)
  useSheetKeys(numberKeys(ledges.length, (i) => choose(ledges[i].id, 'key')))

  if (fit.desk) {
    return (
      <Sheet id="F2a" header={null} valid={!!at} onDone={p.next} auto value={at} picks={picks}
        deskBody cardHeight={fit.cardHeight}>
        <SheetCanvas fit={fit}>
          <div {...d.stageProps} className="absolute inset-0" data-testid="f2a-stage">
            {/* the start ledge: where the rookie waits */}
            <div className="absolute flex flex-col items-center justify-end" style={{ left: 0, top: 0, width: 112, height: 204 }}>
              <div className="flex h-[124px] items-end justify-center">
                {at ? (
                  <svg width={96} height={24} viewBox="-24 -6 48 12" aria-hidden><ellipse cx={0} cy={0} rx={12} ry={3.5} fill="none" stroke={RULE} strokeDasharray="2 3" /></svg>
                ) : rookie(46, 2)}
              </div>
              <StartLedge />
            </div>
            {ledges.map((l, i) => (
              <div
                key={l.id}
                {...d.zone(l.id)}
                className="group absolute flex flex-col justify-end"
                style={{ left: 128 + i * 152, top: 0, width: 144, height: 236 }}
                data-testid={`f2a-ledge-${l.id}`}
              >
                <div className="flex h-[124px] items-end justify-center">
                  {at === l.id && (
                    <motion.div initial={p.reduced ? false : { y: -16, opacity: 0.4 }} animate={{ y: 0, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 520, damping: 26 }}>
                      {rookie(46, 2)}
                    </motion.div>
                  )}
                </div>
                {/* the key sits on the ledge, beside its words */}
                <div className="h-[80px]"><LedgeChip label={l.label} on={at === l.id} size={16} badge={<NumBadge n={i + 1} className="mr-[6px] shrink-0" />} /></div>
                <div className="h-[32px]" />
              </div>
            ))}
            {d.liveRegion}
          </div>
        </SheetCanvas>
      </Sheet>
    )
  }

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
function LedgeChip({ label, on, size = 13, badge }: { label: string; on: boolean; size?: number; badge?: ReactNode }): ReactNode {
  return (
    <div className="relative w-full" style={{ height: size > 13 ? '100%' : 46 }}>
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
      <span className={`absolute inset-x-2 text-center font-[family-name:var(--font-ui)] ${on ? 'font-semibold text-ink' : 'text-ink'} ${badge ? 'flex items-start justify-center text-left' : ''}`}
        style={{ fontSize: size, lineHeight: `${size + 4}px`, top: size > 13 ? 12 : 8 }}>
        {badge}
        {badge ? <span>{label}</span> : label}
      </span>
    </div>
  )
}

/** The desk start ledge: a short rock shelf with no label. */
function StartLedge() {
  return (
    <svg width={112} height={80} viewBox="0 0 112 80" aria-hidden>
      <path d="M4 6 H108 L106 34 L96 48 L70 54 L40 52 L14 48 L6 34 Z" fill={PAPER} stroke={RULE} strokeWidth={1} strokeLinejoin="round" />
      <path d="M3 6 H109" stroke={INK} strokeWidth={2} strokeLinecap="round" />
      {[18, 38, 58, 78, 94].map((x, i) => <path key={x} d={`M${x} ${i % 2 ? 38 : 41} l-2 ${i % 3 ? 6 : 8}`} stroke={RULE} strokeWidth={0.8} opacity={0.75} />)}
    </svg>
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
