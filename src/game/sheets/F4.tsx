'use client'
/* F4 · Camp III · "How to certify" (half-sheet over S07; rises only when
   certify = 'policy').

   One drag: a method onto the brass plaque. One slot: dropping a second
   swaps (the first goes back to its place in the column). The chosen method
   settles into the plaque, set like an engraving. Tap-then-tap (tap a
   method, then the plaque) and the keyboard (Space, arrow, Enter) work
   through useDrag. The sheet needs one answer, so there is no 'take it
   off': a change of mind is a swap. Stores certify.how. */
import { useMemo, useState } from 'react'
import { motion } from 'motion/react'
import Sheet from '../Sheet'
import { Art } from '../art'
import { PlateChip } from '../Chips'
import { PLAQUE_SLOT } from '../art/props'
import { items, label, zones } from '../content'
import { useDrag } from '../useDrag'
import { useGameCtx } from '../context'
import { buzz, sfx } from '../feel'
import type { Answers, StepProps } from '../types'

type How = Answers['certify.how']
const METHODS = items('F4') as { id: How; label: string }[]
const PLAQUE = zones('F4')[0]

export default function F4(p: StepProps) {
  const ctx = useGameCtx()
  const how = p.answers['certify.how']
  // one drop finishes the sheet (Sheet auto, 500ms); Back undoes it
  const [picks, setPicks] = useState(0)

  const d = useDrag({
    labelOf: (id) => (id === 'plaque' ? PLAQUE.label : label('F4', id)),
    zones: ['plaque'],
    canDrop: (item, z) => z === 'plaque' && item !== how,
    onDrop: (item, zone, via) => {
      if (zone === 'plaque') {
        const was = how
        p.set('certify.how', item as How)
        setPicks((n) => n + 1)
        p.log('drop', { item, zone, via, swapped: was ?? null })
        sfx('clink', ctx.sound)
        buzz()
        return
      }
      return false
    },
  })

  const placed = useMemo(() => METHODS.find((m) => m.id === how) ?? null, [how])

  // the plaque stretches to this box; its slot in px from PLAQUE_SLOT
  // (viewBox units at a height of 64, x measured in from each end)
  const PW = 260, PH = 104, k = PH / 64
  const slot = {
    left: PLAQUE_SLOT.x0 * k, top: PLAQUE_SLOT.y0 * k,
    width: PW - (PLAQUE_SLOT.x0 + PLAQUE_SLOT.x1) * k, height: (PLAQUE_SLOT.y1 - PLAQUE_SLOT.y0) * k,
  }

  return (
    <Sheet id="F4" valid={!!how} onDone={p.next} auto value={how} picks={picks}>
      <div {...d.stageProps} className="flex flex-col items-center gap-3 pt-1" data-f4>
        <style>{`
          [data-f4] [data-zone="plaque"] { outline: 1.5px dashed transparent; outline-offset: 3px; transition: outline-color 120ms ease; border-radius: 4px; }
          [data-f4] [data-zone="plaque"][data-valid="true"] { outline-color: #7A3E12; }
          [data-f4] [data-zone="plaque"][data-over="true"] { outline-style: solid; }
        `}</style>
        {/* the plaque: one slot */}
        <div
          {...d.zone('plaque')}
          className="relative shrink-0"
          style={{ width: PW, height: PH }}
          data-testid="zone-plaque"
          aria-label={placed ? `${PLAQUE.label}: ${placed.label}` : `${PLAQUE.label}: empty`}
        >
          <Art id={PLAQUE.art ?? 'fu-plaque'} width={PW} height={PH} state={placed ? 'filled' : undefined} title="The brass plaque" />
          <div className="pointer-events-none absolute flex items-center justify-center text-center" style={slot}>
            {placed && (
              <motion.span
                key={placed.id}
                initial={p.reduced ? { opacity: 0 } : { opacity: 0, scale: 1.25, y: -6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={p.reduced ? { duration: 0.12 } : { type: 'spring', stiffness: 520, damping: 22 }}
                className="font-[family-name:var(--font-ui)] text-[12px] font-semibold uppercase leading-[14px] tracking-[0.14em]"
                style={{ color: '#F8F7F4' }}
                data-testid={`placed-${placed.id}`}
              >
                {placed.label}
              </motion.span>
            )}
          </div>
        </div>

        {/* the methods, in spec order; the one on the plaque leaves a ghost */}
        <div className="flex flex-wrap justify-center gap-x-2 gap-y-2" data-testid="methods">
          {METHODS.map((m) =>
            m.id === how ? (
              <div key={m.id} aria-hidden className="h-[44px]">
                <PlateChip label={m.label} ghost />
              </div>
            ) : (
              <div
                key={m.id}
                {...d.item(m.id, { className: 'h-[44px]' })}
                data-testid={`method-${m.id}`}
              >
                <PlateChip label={m.label} />
              </div>
            ),
          )}
        </div>
        {d.liveRegion}
      </div>
    </Sheet>
  )
}
