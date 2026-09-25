'use client'
/* F4 · Camp III · "How to certify" (half-sheet over S07; rises only when
   certify = 'policy').

   One drag: a method onto the brass plaque. One slot: dropping a second
   swaps (the first goes back to its place in the column). The chosen method
   settles into the plaque, set like an engraving. Tap-then-tap (tap a
   method, then the plaque) and the keyboard (Space, arrow, Enter) work
   through useDrag. The sheet needs one answer, so there is no 'take it
   off': a change of mind is a swap. Stores certify.how.

   DESK (design 6): a card 880 wide at k = 1. The plaque (fu-plaque, 1024px
   render) at 280px, centred at the top, the chosen method engraved on its
   brass; the five methods as name plates 260 x 64 in a 3 + 2 grid below, in
   the spec order as on the phone, each with its number key. Keys 1-5 choose
   (logged as a drop via 'key'). */
import { useMemo, useState } from 'react'
import { motion } from 'motion/react'
import Sheet from '../Sheet'
import { CARD_DW, NumBadge, SheetCanvas, numberKeys, useSheetFit, useSheetKeys } from './desk'
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

  const place = (item: string, via: 'pointer' | 'tap' | 'key') => {
    const was = how
    p.set('certify.how', item as How)
    setPicks((n) => n + 1)
    p.log('drop', { item, zone: 'plaque', via, swapped: was ?? null })
    sfx('clink', ctx.sound)
    buzz()
  }
  const fit = useSheetFit(CARD_DW, 368)
  useSheetKeys(numberKeys(METHODS.length, (i) => { if (METHODS[i].id !== how) place(METHODS[i].id, 'key') }))

  const d = useDrag({
    labelOf: (id) => (id === 'plaque' ? PLAQUE.label : label('F4', id)),
    zones: ['plaque'],
    canDrop: (item, z) => z === 'plaque' && item !== how,
    onDrop: (item, zone, via) => {
      if (zone === 'plaque') {
        place(item, via)
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

  if (fit.desk) {
    const PW2 = 280, PH2 = 200
    return (
      <Sheet id="F4" valid={!!how} onDone={p.next} auto value={how} picks={picks} deskBody cardHeight={fit.cardHeight}>
        <SheetCanvas fit={fit}>
          <div {...d.stageProps} className="absolute inset-0" data-f4>
            <style>{`
              [data-f4] [data-zone="plaque"] { outline: 2px dashed transparent; outline-offset: 6px; transition: outline-color 120ms ease; border-radius: 6px; }
              [data-f4] [data-zone="plaque"][data-valid="true"] { outline-color: #7A3E12; }
              [data-f4] [data-zone="plaque"][data-over="true"] { outline-style: solid; }
            `}</style>
            <div
              {...d.zone('plaque')}
              className="absolute"
              style={{ left: (CARD_DW - PW2) / 2, top: 0, width: PW2, height: PH2 }}
              data-testid="zone-plaque"
              aria-label={placed ? `${PLAQUE.label}: ${placed.label}` : `${PLAQUE.label}: empty`}
            >
              <Art id={PLAQUE.art ?? 'fu-plaque'} width={PW2} height={PH2} state={placed ? 'filled' : undefined} title="The brass plaque" />
              {/* the brass plate on the render: centre (52.7%, 52%), turned
                  about -8.6deg, about 60% x 33% of the box */}
              <div className="pointer-events-none absolute flex items-center justify-center text-center"
                style={{ left: PW2 * 0.527 - 84, top: PH2 * 0.52 - 30, width: 168, height: 60, transform: 'rotate(-8.6deg) skewX(-4deg)' }}>
                {placed && (
                  <motion.span
                    key={placed.id}
                    initial={p.reduced ? { opacity: 0 } : { opacity: 0, scale: 1.25, y: -6 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={p.reduced ? { duration: 0.12 } : { type: 'spring', stiffness: 520, damping: 22 }}
                    className="font-[family-name:var(--font-ui)] text-[14px] font-semibold uppercase leading-[17px] tracking-[0.12em]"
                    style={{ color: '#2A1606', textShadow: '0 1px 0 rgba(255,236,180,0.45)' }}
                    data-testid={`placed-${placed.id}`}
                  >
                    {placed.label}
                  </motion.span>
                )}
              </div>
            </div>
            {METHODS.map((m, i) => {
              const row = i < 3 ? 0 : 1
              const col = row ? i - 3 : i
              const x0 = row ? (CARD_DW - (2 * 260 + 16)) / 2 : (CARD_DW - (3 * 260 + 2 * 16)) / 2
              const box = { left: x0 + col * 276, top: 224 + row * 80, width: 260, height: 64 }
              return m.id === how ? (
                <div key={m.id} aria-hidden className="absolute" style={box}>
                  <DeskPlate label={m.label} n={i + 1} ghost />
                </div>
              ) : (
                <div key={m.id} className="absolute" style={box}>
                  <div {...d.item(m.id, { className: 'h-full w-full' })} data-testid={`method-${m.id}`}>
                    <DeskPlate label={m.label} n={i + 1} />
                  </div>
                </div>
              )
            })}
            {d.liveRegion}
          </div>
        </SheetCanvas>
      </Sheet>
    )
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

/** The desk name plate: PlateChip's brass finish at 260 x 64, with its key. */
function DeskPlate({ label, n, ghost = false }: { label: string; n: number; ghost?: boolean }) {
  const BRONZE = '#7A3E12', PAPER = '#F8F7F4', RULE = '#8C857A'
  return (
    <div className="relative h-full w-full transition-transform duration-150 hover:-translate-y-[2px]" style={{ cursor: ghost ? undefined : 'grab' }}>
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 260 64" preserveAspectRatio="none" aria-hidden>
        <rect x={1.5} y={1.5} width={257} height={61} rx={4} fill={ghost ? 'none' : PAPER} stroke={ghost ? RULE : BRONZE}
          strokeWidth={ghost ? 1 : 1.75} strokeDasharray={ghost ? '4 4' : undefined} />
        {!ghost && <rect x={6} y={6} width={248} height={52} rx={2} fill="none" stroke={BRONZE} strokeWidth={0.8} opacity={0.6} />}
        {!ghost && [14, 246].map((cx) => (
          <g key={cx} transform={`translate(${cx} 32)`}>
            <circle r={3.2} fill={PAPER} stroke={BRONZE} strokeWidth={1} />
            <path d="M-1.9 -0.9 L1.9 0.9" stroke={BRONZE} strokeWidth={1} />
          </g>
        ))}
      </svg>
      {!ghost && (
        <>
          <span className="absolute inset-y-0 left-[28px] right-[44px] flex items-center justify-center text-center font-[family-name:var(--font-ui)] text-[14px] font-semibold uppercase leading-[17px] tracking-[0.12em]"
            style={{ color: BRONZE }}>
            {label}
          </span>
          <NumBadge n={n} className="absolute right-[24px] top-1/2 -translate-y-1/2" />
        </>
      )}
    </div>
  )
}
