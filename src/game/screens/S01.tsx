'use client'
/* S01 · Base camp · "The trailhead" (mechanic: scene).

   Beat A: full-bleed base camp. The rookie (forest jacket) stands at the
   trailhead beside an open, empty rucksack; a faint pencil route runs up the
   face. Inside the tent flap, six instrument shapes wait under a canvas cover
   (kit-rack-covered): the navigation kit, not yet issued. Nothing explains
   them. One button, 'Start the climb'; the store's begin() records t.start,
   consent, variant.seed and the segments from the link token.

   Beat B (fallback only, when the link token lacks business or class): two
   rows of text chips, one tap per row. Class of is two rows of five year
   chips (2017-2021; 2022-2025 and Earlier), each at least 44px.

   The rookie never moves here: only the respondent moves a climber, and
   nothing is asked of them yet. Tapping the covered kit lifts the canvas a
   hair and lets it fall back: a promise of Camp II, not an explanation.

   Composition: everything stands on the base-camp scene's anchors (the
   trailhead where its pencil route starts, the tent's open doorway),
   measured from the frame, so it holds at any phone height. */
import { useLayoutEffect, useRef, useState } from 'react'
import { motion, useAnimationControls } from 'motion/react'
import Frame from '../Frame'
import Figure from '../Figure'
import { Art } from '../art'
import { SCENE_ANCHORS, sceneToBox } from '../art/scenes'
import { items, label } from '../content'
import type { Answers, StepProps } from '../types'

const BUSINESS = items('S01', 'B').filter((i) => i.group === 'Business')
const YEARS = ['2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025']
const COHORTS: { id: string; text: string }[] = [...YEARS.map((y) => ({ id: y, text: y })), { id: 'earlier', text: 'Earlier' }]

const FOOTNOTE = 'Your answers are held under a code by People Analytics, not under your name. The working group sees only groups of ten or more.'

export default function S01(p: StepProps) {
  const a = p.answers
  if (p.beat === 'B') {
    const valid = a['segment.business'] != null && a['segment.cohort'] != null
    return (
      <Frame id="S01" beat="B" valid={valid} onContinue={p.next}>
        <div className="absolute inset-0 flex flex-col">
          <Trailhead />
          <SegmentPicker
            business={a['segment.business'] ?? null}
            cohort={a['segment.cohort'] ?? null}
            onBusiness={(b) => { p.setMany({ 'segment.business': b, 'segment.source': 'asked' }); p.log('pick', { row: 'business', id: b }) }}
            onCohort={(c) => { p.setMany({ 'segment.cohort': c, 'segment.source': 'asked' }); p.log('pick', { row: 'cohort', id: c }) }}
          />
        </div>
      </Frame>
    )
  }
  return (
    <Frame id="S01" beat="A" valid continueLabel="Start the climb" onContinue={p.next} footnote={FOOTNOTE}>
      <div className="absolute inset-0 flex flex-col">
        <Trailhead />
      </div>
    </Frame>
  )
}

/* ------------------------------------------------------------ the trailhead

   Placed on the base-camp scene's own anchors (SCENE_ANCHORS, sceneToBox), so
   the rookie stands where the scene's pencil route starts and the covered kit
   sits in the tent's open doorway, whatever the phone's height. */

const BC = SCENE_ANCHORS['scene-basecamp']
type Place = { gx: number; gy: number; s: number; door: { x: number; y: number; w: number } }

function Trailhead() {
  const layer = useRef<HTMLDivElement | null>(null)
  const [pl, setPl] = useState<Place | null>(null)
  const cover = useAnimationControls()
  const busy = useRef(false)

  useLayoutEffect(() => {
    const el = layer.current
    const frame = el?.closest<HTMLElement>('[data-frame]')
    if (!el || !frame) return
    const measure = () => {
      const f = frame.getBoundingClientRect(), l = el.getBoundingClientRect()
      const at = (x: number, y: number) => {
        const b = sceneToBox(x, y, f.width, f.height)
        return { x: f.left + b.x - l.left, y: f.top + b.y - l.top, s: b.scale }
      }
      const th = at(BC.trailhead.x, BC.trailhead.y)
      const d = at(BC.tentDoor.x, BC.tentDoor.y)
      setPl({ gx: th.x, gy: th.y, s: th.s, door: { x: d.x, y: d.y, w: BC.tentDoor.w * d.s } })
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(frame); ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const peek = async () => {
    if (busy.current) return
    busy.current = true
    await cover.start({ y: -3, rotate: -1.2, transition: { duration: 0.14, ease: 'easeOut' } })
    await cover.start({ y: 0, rotate: 0, transition: { type: 'spring', stiffness: 700, damping: 14 } })
    busy.current = false
  }

  const rookieH = 112 * (pl?.s ?? 1)
  const sack = 54 * (pl?.s ?? 1)
  const rack = (pl?.door.w ?? 52) * 1.14
  return (
    <div ref={layer} className="pointer-events-none absolute inset-0" data-trailhead>
      {pl && (
        <>
          {/* an open, empty rucksack beside the rookie */}
          <div className="absolute" style={{ left: pl.gx - 70 * pl.s, top: pl.gy - sack + 2 * pl.s }}>
            <Art id="rucksack" size={sack} />
          </div>
          {/* the rookie at the trailhead, facing the route */}
          <div className="absolute" style={{ left: pl.gx - rookieH * (9 / 26), top: pl.gy - rookieH * (25 / 26) }}>
            <Figure size={rookieH} pose="stand" />
          </div>
          {/* the covered kit, in the tent's doorway: a tap lifts the canvas a hair */}
          <motion.button
            type="button"
            tabIndex={-1}
            aria-hidden
            onClick={peek}
            animate={cover}
            className="pointer-events-auto absolute origin-bottom"
            style={{ left: pl.door.x - rack / 2, top: pl.door.y - rack + rack * (2 / 64), width: rack, height: rack }}
            data-testid="kit-covered"
          >
            <Art id="kit-rack-covered" width="100%" height="100%" />
          </motion.button>
        </>
      )}
    </div>
  )
}

/* ------------------------------------------------------------ Beat B */

function SegmentPicker({ business, cohort, onBusiness, onCohort }: {
  business: Answers['segment.business'] | null
  cohort: string | null
  onBusiness: (b: NonNullable<Answers['segment.business']>) => void
  onCohort: (c: string) => void
}) {
  return (
    <div className="shrink-0 px-5 pt-2">
      <fieldset>
        <legend className="eyebrow mb-2">Business</legend>
        <div className="grid grid-cols-4 gap-2" role="radiogroup" aria-label="Business">
          {BUSINESS.map((b) => (
            <button
              key={b.id}
              type="button"
              role="radio"
              aria-checked={business === b.id}
              data-on={business === b.id}
              className="choice !min-h-[44px] !px-1 !text-center !text-[14px]"
              onClick={() => onBusiness(b.id as NonNullable<Answers['segment.business']>)}
              data-testid={`business-${b.id}`}
            >
              {label('S01', b.id)}
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset className="mt-4">
        <legend className="eyebrow mb-2">Class of</legend>
        {/* two rows of five: 2017 to 2021, then 2022 to 2025 and Earlier */}
        <div className="grid grid-cols-5 gap-[6px]" role="radiogroup" aria-label="Class of">
          {COHORTS.map((c) => {
            const on = cohort === c.id
            return (
              <button
                key={c.id}
                type="button"
                role="radio"
                aria-checked={on}
                data-on={on}
                onClick={() => onCohort(c.id)}
                className="choice flex !min-h-[44px] items-center justify-center !px-0 !py-0 !text-center !text-[14px]"
                data-testid={`cohort-${c.id}`}
              >
                {c.text}
              </button>
            )
          })}
        </div>
      </fieldset>
    </div>
  )
}
