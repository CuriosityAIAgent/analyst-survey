'use client'
/* F2b · Camp I · "What can't be rushed" (half-sheet over S04; design "F2b").

   Fires when the pace is 36 or 48 months. One tap: the sheet finishes itself
   500ms later (Sheet auto), so a mis-tap can still be changed. The rookie is
   in the sheet header at their stop (beside their camp's tent).
     stores pace.cantRush ('cycle'|'trust'|'breadth'|'confidence')

   DESK (design 6): the rookie at their camp (2x) over four tag chips
   200 x 88 in one row; keys 1-4 pick. */
import { useState } from 'react'
import { motion } from 'motion/react'
import Sheet from '../Sheet'
import { buzz } from '../feel'
import Figure from '../Figure'
import { TagChip } from '../Chips'
import { PICK_DH, PickRow, CARD_DW, useSheetFit } from './desk'
import { copy, fill, items } from '../content'
import type { Answers, StepProps } from '../types'

type Pick = Answers['pace.cantRush']

const INK = '#0D0C0B'
const PAPER = '#F8F7F4'
const FOREST = '#1F4B3A'

export default function F2b(p: StepProps) {
  const opts = items('F2b') as { id: Pick; label: string }[]
  const cur = p.answers['pace.cantRush']
  const stop = p.answers['pace.months']

  const [picks, setPicks] = useState(0)
  const fit = useSheetFit(CARD_DW, PICK_DH)
  const pick = (id: Pick, via: 'tap' | 'key' = 'tap') => {
    buzz()
    p.log('pick', { value: id, via })
    p.set('pace.cantRush', id)
    setPicks((n) => n + 1)
  }

  return (
    <Sheet
      id="F2b"
      prompt={fill(copy('F2b').prompt, { stop })}
      header={fit.desk ? null : <AtCamp />}
      valid={!!cur}
      auto
      value={cur}
      picks={picks}
      onDone={p.next}
      deskBody={fit.desk}
      cardHeight={fit.desk ? fit.cardHeight : undefined}
    >
      {fit.desk ? (
        <PickRow fit={fit} header={<div style={{ transform: 'scale(2)', transformOrigin: '0 100%' }}><AtCamp /></div>}
          options={opts} value={cur} onPick={(id, via) => pick(id as Pick, via)} role="group" groupLabel="What can't be rushed"
          testId="f2b-options" optTestId={(id) => `f2b-${id}`} disabled={p.covered} />
      ) : (
      <div className="grid grid-cols-2 gap-3 pb-2 pt-2" role="group" aria-label="What can't be rushed" data-testid="f2b-options">
        {opts.map((o) => {
          const on = cur === o.id
          return (
            <motion.button
              key={o.id}
              type="button"
              onClick={() => pick(o.id)}
              disabled={p.covered}
              aria-pressed={on}
              whileTap={p.reduced ? undefined : { scale: 0.97 }}
              className="block h-[60px] w-full"
              data-on={on}
              data-testid={`f2b-${o.id}`}
            >
              <TagChip label={o.label} on={on} />
            </motion.button>
          )
        })}
      </div>
      )}
    </Sheet>
  )
}

/** The rookie standing by their camp's tent: 'held to' their stop. */
function AtCamp() {
  return (
    <svg width={56} height={48} viewBox="-30 -46 56 48" style={{ overflow: 'visible' }} aria-hidden>
      <line x1={-30} y1={0.5} x2={24} y2={0.5} stroke={INK} strokeWidth={1.2} strokeLinecap="round" />
      <g transform="translate(-18 0)">
        <path d="M-10 0 L0 -15 L10 0 Z" fill={PAPER} stroke={INK} strokeWidth={1.3} strokeLinejoin="round" />
        <path d="M-4 0 L0 -7 L4 0 Z" fill={INK} />
        <line x1={0} y1={-15} x2={0} y2={-25} stroke={INK} strokeWidth={1.1} strokeLinecap="round" />
        <path d="M0 -25 L7 -22.5 L0 -20 Z" fill={FOREST} stroke={INK} strokeWidth={0.8} strokeLinejoin="round" />
      </g>
      <Figure as="g" x={6} y={0} size={42} facing={-1} />
    </svg>
  )
}
