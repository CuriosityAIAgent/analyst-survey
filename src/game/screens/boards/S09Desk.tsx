'use client'
/* S09 Beat A desk view (design 5, S09 A). It stays stacked: the hanging rope
   IS the ranking, and nothing is cramped at this size.

     design canvas 936 x 620 (fit-scaled)
       the rope, 720 wide, clips at the art's 1/6, 1/2 and 5/6
       under each clip a 184 x 184 slot: the number (Source Serif 28), its
         name (Leads / Second / Anchor), then the trait (art 96 + label)
       the tray: eight traits, 4 x 2 cells of 140 x 150, centred
   Drag, click-then-click, or [1][2][3] on the trait you're on; [Del]
   unclips. Rules and logs: useS09Rope, shared with the phone. */
import { motion } from 'motion/react'
import Frame from '../../Frame'
import BoardCanvas from './BoardCanvas'
import { Art } from '../../art'
import { HoverTip } from '../../Chips'
import { ROPE_CLIPS_X } from '../../art/traits'
import KeyCap from '../../KeyCap'
import type { StatusRow } from '../../Checklist'
import type { StepProps, TraitId } from '../../types'
import { CLIPS, trait, type S09Rope } from './useS09Rope'

const W = 936, H = 620
const ROPE_W = 720, ROPE_H = 160, ROPE_X = (W - ROPE_W) / 2
const SLOT = 184, SLOT_TOP = 98
const CELL_W = 140, CELL_H = 150, GAP = 10
const TRAY_W = CELL_W * 4 + GAP * 3 + 32, TRAY_H = CELL_H * 2 + GAP + 20
const FOREST = '#1F4B3A'
const CLIP_X = ROPE_CLIPS_X(3).map((x) => ROPE_X + (x / 360) * ROPE_W)
/** '1 Leads' -> ['1', 'Leads'] */
const split = (l: string) => { const [n, ...r] = l.split(' '); return [n, r.join(' ')] as const }

function Tile({ id, lifted, placed }: { id: TraitId; lifted?: boolean; placed?: boolean }) {
  const t = trait(id)
  return (
    <div className="flex w-[136px] flex-col items-center">
      <div data-hover-lift className="flex items-center justify-center rounded-[3px] bg-white"
        style={{ width: placed ? 96 : 104, height: placed ? 96 : 104, boxShadow: lifted ? 'inset 0 0 0 1.5px #0D0C0B' : placed ? `inset 0 0 0 1.5px ${FOREST}` : 'inset 0 0 0 1px #8C857A' }}>
        <Art id={t.art} size={placed ? 76 : 84} />
      </div>
      <span className="mt-[6px] line-clamp-2 text-center font-[family-name:var(--font-ui)] text-[14px] leading-[17px] text-ink">{t.label}</span>
    </div>
  )
}

export default function S09Desk({ p, R }: { p: StepProps; R: S09Rope }) {
  const { order, slots, clicked, d, valid, inTray } = R
  const n = slots.filter(Boolean).length

  const status: StatusRow[] = CLIPS.map((c, k) => ({
    id: c.id, label: `${split(c.label)[1]}: ${slots[k] ? trait(slots[k]!).label : '—'}`, color: slots[k] ? FOREST : undefined,
  }))
  const activeName = d.active && !d.active.startsWith('clip') && d.active !== 'tray' ? trait(d.active).label : undefined

  return (
    <Frame
      id="S09"
      beat="A"
      host="native"
      valid={valid}
      onContinue={p.next}
      status={status}
      summary={`${n} of 3 on the rope`}
      holding={activeName}
      invalidReason={n < 3 ? `Rope up ${3 - n} more` : undefined}
    >
      <BoardCanvas w={W} h={H}>
        <div {...d.stageProps} className="relative h-full w-full" style={d.stageProps.style} data-s09a data-desk-board="S09">
          {/* the rope, with three numbered carabiners */}
          <motion.div
            key={clicked?.n ?? 0}
            className="pointer-events-none absolute"
            style={{ left: ROPE_X, top: 0, width: ROPE_W, height: ROPE_H, transformOrigin: '50% 0%' }}
            initial={clicked && !p.reduced ? { rotate: clicked.k === 0 ? -0.6 : clicked.k === 2 ? 0.6 : 0, y: 3 } : false}
            animate={{ rotate: 0, y: 0 }}
            transition={{ type: 'spring', stiffness: 420, damping: 12 }}
            aria-hidden
          >
            <Art id="rope-clips" width={ROPE_W} height={ROPE_H} value={3} data={{ filled: slots.map(Boolean) }} />
          </motion.div>

          {CLIPS.map((c, k) => {
            const id = slots[k]
            const [num, name] = split(c.label)
            const over = d.over === c.id
            const lit = d.lifted !== null && d.isValid(c.id)
            return (
              <div
                key={c.id}
                {...d.zone(c.id)}
                className="absolute flex flex-col items-center rounded-[3px] pt-[8px] transition-[box-shadow,background-color] duration-150"
                style={{
                  left: CLIP_X[k] - SLOT / 2, top: SLOT_TOP, width: SLOT, height: SLOT,
                  background: over ? 'color-mix(in srgb, #1F4B3A 8%, #F8F7F4)' : 'rgba(248,247,244,0.94)',
                  boxShadow: over ? `inset 0 0 0 2px ${FOREST}` : lit ? `inset 0 0 0 1.5px ${FOREST}` : id ? 'inset 0 0 0 1px #DDD9D2, 0 6px 18px rgba(13,12,11,0.05)' : 'none',
                  outline: id || over || lit ? undefined : '1.5px dashed #8C857A', outlineOffset: -1.5,
                }}
                data-testid={`clip-${k + 1}`}
                aria-label={`${c.label}: ${id ? trait(id).label : 'empty'}`}
              >
                <div className="flex items-baseline gap-[8px]">
                  <span className="font-[family-name:var(--font-text)] text-[28px] font-semibold leading-[30px] text-ink">{num}</span>
                  <span className="font-[family-name:var(--font-ui)] text-[11px] font-semibold uppercase leading-[14px] tracking-[0.14em] text-muted">{name}</span>
                  <KeyCap k={num} className="ml-[2px] -translate-y-[3px]" />
                </div>
                {id ? (
                  <motion.div
                    key={id}
                    className="mt-[6px]"
                    initial={p.reduced ? { opacity: 0 } : { y: -10, scale: 1.06, opacity: 0.6 }}
                    animate={{ y: 0, scale: 1, opacity: 1 }}
                    transition={p.reduced ? { duration: 0.12 } : { type: 'spring', stiffness: 520, damping: 20 }}
                  >
                    <div {...d.item(id, { disabled: p.covered, className: 'group outline-none' })} data-testid={`tile-${id}`} title={trait(id).label}>
                      <Tile id={id} placed lifted={d.lifted === id} />
                    </div>
                  </motion.div>
                ) : (
                  <p className="mt-[40px] px-3 text-center font-[family-name:var(--font-ui)] text-[13px] leading-[17px] text-muted">
                    {k === 0 ? 'The trait they lead with' : 'Drop a trait here'}
                  </p>
                )}
              </div>
            )
          })}

          {/* the tray: 4 x 2, the roped ones leave their seat empty */}
          <div
            {...d.zone('tray')}
            className="absolute grid grid-cols-4 content-center justify-items-center rounded-[3px] transition-colors duration-150"
            style={{
              left: (W - TRAY_W) / 2, top: H - TRAY_H, width: TRAY_W, height: TRAY_H, columnGap: GAP, rowGap: GAP,
              background: d.over === 'tray' ? 'rgba(31,75,58,0.06)' : 'rgba(248,247,244,0.93)',
              boxShadow: 'inset 0 0 0 1px #DDD9D2, 0 8px 24px rgba(13,12,11,0.06)',
              outline: d.lifted && d.isValid('tray') ? `1.5px dashed ${FOREST}` : undefined, outlineOffset: 3,
            }}
            data-testid="tray"
          >
            {order.map((id) =>
              inTray.includes(id) ? (
                <div key={id} {...d.item(id, { disabled: p.covered, className: 'group relative outline-none' })} data-testid={`tile-${id}`}
                  style={{ width: CELL_W, height: CELL_H, paddingTop: 6 }}>
                  <HoverTip text={trait(id).label} keys="1–3" />
                  <div className="flex justify-center"><Tile id={id} lifted={d.lifted === id} /></div>
                </div>
              ) : (
                <div key={id} className="flex flex-col items-center" style={{ width: CELL_W, height: CELL_H, paddingTop: 6 }} aria-hidden>
                  <div className="rounded-[3px] border border-dashed" style={{ width: 104, height: 104, borderColor: '#C9C4BB' }} />
                  <span className="mt-[6px] line-clamp-2 w-[136px] text-center font-[family-name:var(--font-ui)] text-[14px] leading-[17px] text-muted">{trait(id).label}</span>
                </div>
              ),
            )}
          </div>
          {d.liveRegion}
        </div>
      </BoardCanvas>
    </Frame>
  )
}
