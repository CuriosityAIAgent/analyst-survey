'use client'
/* F5 · Camp III · "Guarantee one thing" (half-sheet over S08; design "F5").

   Always fires after S08. Variant A ('Then guarantee every climber one
   thing.') for rope answers 1-3 or 'Rather not say'; variant B ('Your rope
   held. ...') for 4-5; the store sets guarantee.variant. Same six options and
   the same one drag on both.

   A rope with one carabiner (rope-clips, value 1) runs across the top; the
   six guarantees are tags in a tray below. Drag one up and it clips onto the
   rope (the gate closes, the tag swings once). Dropping another swaps: the
   first goes back to its place in the tray. Tap a tag then the rope, or Tab,
   Space, arrows, Enter. A clipped tag dragged back to the tray unclips.
   The tray order is randomised per respondent (seeded) and logged as an
   'order' event (there is no store key for it).
     stores guarantee ('mentor'|'debrief'|'hypothesis'|'speakingRole'|'ecm'|'protectedTime')

   DESK (design 6): a card 880 wide at k = 1. The rope 720 wide with its one
   clip and a 300 x 80 slot hanging from it; the six tags 280 x 64 in a 3 x 2
   tray below, in the same seeded order, each with its number key. Keys 1-6
   clip that tag (logged as a drop via 'key'). The panel question is the A/B
   wording verbatim (Sheet), with no why line. */
import { useEffect, useMemo, useState } from 'react'
import { motion } from 'motion/react'
import Sheet from '../Sheet'
import { CARD_DW, NumBadge, SheetCanvas, numberKeys, useSheetFit, useSheetKeys } from './desk'
import { useDrag } from '../useDrag'
import { useGameCtx } from '../context'
import { buzz, sfx } from '../feel'
import { Art } from '../art'
import { items } from '../content'
import { orderFor } from '../store'
import type { Answers, StepProps } from '../types'

type G = Answers['guarantee']

const INK = '#0D0C0B'
const PAPER = '#F8F7F4'
const RULE = '#8C857A'

// rope-clips is 360x80; one clip hangs at x 180, its carabiner ends near y 53
const ROPE_VB: [number, number] = [360, 80]
const CLIP_BOTTOM = 53
const ROPE_H = (350 * ROPE_VB[1]) / ROPE_VB[0] // drawn 350 wide (the sheet body at 390)

export default function F5(p: StepProps) {
  const all = items('F5') as { id: G; label: string }[]
  const ids = all.map((x) => x.id)
  const order = useMemo(() => orderFor(p.seed, 'guarantee.order', ids), [p.seed, ids.join('|')]) // eslint-disable-line react-hooks/exhaustive-deps
  const labelOf = (id: string) => (id === 'clip' ? 'The rope clip' : id === 'tray' ? 'The tray' : all.find((x) => x.id === id)?.label ?? id)
  const cur = p.answers.guarantee
  // one clip finishes the sheet (Sheet auto, 500ms); Back undoes it
  const [picks, setPicks] = useState(0)
  const ctx = useGameCtx()

  useEffect(() => { p.log('order', { key: 'guarantee.order', order }) }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const clip = (item: G, via: 'key') => {
    if (item !== cur) {
      p.set('guarantee', item)
      buzz()
      sfx('click', ctx.sound)
    }
    setPicks((n) => n + 1)
    p.log('drop', { item, zone: 'clip', via, swapped: cur && cur !== item ? cur : undefined })
  }
  const fit = useSheetFit(CARD_DW, 356)
  useSheetKeys(numberKeys(order.length, (i) => clip(order[i] as G, 'key')))

  const d = useDrag({
    labelOf,
    disabled: p.covered,
    zones: ['clip', 'tray'],
    canDrop: (item, zone) => zone === 'clip' || (zone === 'tray' && item === cur),
    onDrop: (item, zone, via) => {
      if (zone === 'clip') {
        if (item !== cur) {
          p.set('guarantee', item as G)
          buzz()
          sfx('click', ctx.sound)
        }
        setPicks((n) => n + 1)
        p.log('drop', { item, zone, via, swapped: cur && cur !== item ? cur : undefined })
        return true
      }
      if (zone === 'tray' && item === cur) {
        p.unset('guarantee')
        p.log('drop', { item, zone, via })
        return true
      }
      return false
    },
  })

  const tag = (id: G, where: 'tray' | 'clip', size?: number, n?: number) => (
    <div {...d.item(id)} className="relative h-full w-full" data-testid={`f5-tag-${id}`}>
      <Tag label={labelOf(id)} clipped={where === 'clip'} size={size} />
      {n !== undefined && <NumBadge n={n} className="absolute right-[12px] top-1/2 -translate-y-1/2" />}
    </div>
  )

  if (fit.desk) {
    const RW = 720, RH = (RW * ROPE_VB[1]) / ROPE_VB[0]
    const rx = (CARD_DW - RW) / 2
    return (
      <Sheet id="F5" variant={p.variant} valid={!!cur} onDone={p.next} auto value={cur} picks={picks} deskBody cardHeight={fit.cardHeight}>
        <SheetCanvas fit={fit}>
          <div {...d.stageProps} className="absolute inset-0" data-testid="f5-stage">
            <div {...d.zone('clip')} className="group absolute" style={{ left: rx, top: 0, width: RW, height: 196 }} data-testid="f5-clip">
              <Art id="rope-clips" value={1} data={{ filled: [!!cur] }} width={RW} height={RH} />
              <div className="absolute" style={{ left: (RW - 300) / 2, top: (CLIP_BOTTOM / ROPE_VB[1]) * RH - 4, width: 300, height: 80 }}>
                {cur ? (
                  <motion.div
                    key={cur}
                    className="h-full w-full"
                    style={{ transformOrigin: '50% 0%' }}
                    initial={p.reduced ? false : { rotate: -7, y: -6 }}
                    animate={{ rotate: 0, y: 0 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 9, mass: 0.6 }}
                  >
                    {tag(cur, 'clip', 19)}
                  </motion.div>
                ) : (
                  <div className="h-full w-full rounded-[4px] border-2 border-dashed border-rule transition-colors group-data-[valid=true]:border-forest group-data-[over=true]:border-solid group-data-[over=true]:border-forest" aria-hidden />
                )}
              </div>
            </div>
            <div {...d.zone('tray')} className="group absolute" style={{ left: 0, top: 212, width: CARD_DW, height: 144 }} data-testid="f5-tray">
              {order.map((id, i) => {
                const box = { left: (i % 3) * 300, top: Math.floor(i / 3) * 80, width: 280, height: 64 }
                return (
                  <div key={id} className="absolute" style={box}>
                    {cur === id
                      ? <div className="h-full w-full rounded-[4px] border border-dashed border-rule-soft group-data-[valid=true]:border-forest" aria-hidden />
                      : tag(id as G, 'tray', 17, i + 1)}
                  </div>
                )
              })}
            </div>
            {d.liveRegion}
          </div>
        </SheetCanvas>
      </Sheet>
    )
  }

  return (
    <Sheet id="F5" variant={p.variant} valid={!!cur} onDone={p.next} auto value={cur} picks={picks}>
      <div {...d.stageProps} className="flex flex-col gap-2.5 pb-1" data-testid="f5-stage">
        {/* the rope, with its one clip */}
        <div {...d.zone('clip')} className="group relative h-[114px] w-full" data-testid="f5-clip">
          <Art id="rope-clips" value={1} data={{ filled: [!!cur] }} width="100%" height={ROPE_H} />
          <div className="absolute left-1/2 w-[196px] -translate-x-1/2" style={{ top: (CLIP_BOTTOM / ROPE_VB[1]) * ROPE_H - 2 }}>
            {cur ? (
              <motion.div
                key={cur}
                className="h-[48px] w-full"
                style={{ transformOrigin: '50% 0%' }}
                initial={p.reduced ? false : { rotate: -7, y: -6 }}
                animate={{ rotate: 0, y: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 9, mass: 0.6 }}
              >
                {tag(cur, 'clip')}
              </motion.div>
            ) : (
              <div className="h-[48px] w-full rounded-[3px] border border-dashed border-rule transition-colors group-data-[valid=true]:border-forest group-data-[over=true]:border-solid group-data-[over=true]:border-forest" aria-hidden />
            )}
          </div>
        </div>
        {/* the tray: fixed places, so nothing shifts when a tag leaves */}
        <div {...d.zone('tray')} className="group grid grid-cols-2 gap-2" data-testid="f5-tray">
          {order.map((id) => (
            <div key={id} className="h-[48px]">
              {cur === id
                ? <div className="h-full w-full rounded-[3px] border border-dashed border-rule-soft group-data-[valid=true]:border-forest" aria-hidden />
                : tag(id, 'tray')}
            </div>
          ))}
        </div>
        {d.liveRegion}
      </div>
    </Sheet>
  )
}

/** A card tag with a brass-less eyelet at the top: the carabiner takes it
    there. All six share one finish, so none looks like the better answer. */
function Tag({ label, clipped, size = 13 }: { label: string; clipped: boolean; size?: number }) {
  return (
    <div className="relative h-full w-full">
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 170 48" preserveAspectRatio="none" aria-hidden style={{ overflow: 'visible' }}>
        <path d="M8 3 H162 Q167 3 167 8 V40 Q167 45 162 45 H8 Q3 45 3 40 V8 Q3 3 8 3 Z" fill={PAPER} stroke={clipped ? INK : RULE}
          strokeWidth={clipped ? 1.5 : 1} vectorEffect="non-scaling-stroke" />
        <path d="M11 8 V40" stroke={RULE} strokeWidth={0.8} strokeDasharray="1 3" vectorEffect="non-scaling-stroke" />
      </svg>
      {/* the eyelet (kept round: outside the stretched svg) */}
      <svg className="absolute left-1/2 top-[-4px] -translate-x-1/2" width={12} height={12} viewBox="-6 -6 12 12" aria-hidden>
        <circle r={3.6} fill={PAPER} stroke={INK} strokeWidth={1.3} />
      </svg>
      <span className={`absolute inset-y-0 flex items-center justify-center text-center font-[family-name:var(--font-ui)] ${clipped ? 'font-semibold text-ink' : 'text-ink'}`}
        style={{ fontSize: size, lineHeight: `${size + 3}px`, left: 16, right: size > 13 && !clipped ? 40 : 16 }}>
        {label}
      </span>
    </div>
  )
}
