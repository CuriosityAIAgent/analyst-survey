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
   chips (the last four classes, 2022-2025), each at least 44px.

   The rookie never moves here: only the respondent moves a climber, and
   nothing is asked of them yet. Tapping the covered kit lifts the canvas a
   hair and lets it fall back: a promise of Camp II, not an explanation.

   Composition: everything stands on the base-camp scene's anchors (the
   trailhead where its pencil route starts, the tent's open doorway),
   measured from the frame, so it holds at any phone height.

   Desk (design 5, S01): the panel carries the plain question, "Nine short
   screens, about six minutes" and the "What you'll do" list (spec ask). The
   stage shows the landscape base-camp render (scene-basecamp-wide) with the
   route up the mountain in view, the rookie at the trailhead in front of the
   cairn beside the open rucksack (3D), and the covered kit in the tent's
   doorway (a
   click still lifts it a hair). Beat B: a centred paper card with the two
   rows (arrow keys move within a row). No privacy line. begin() and the
   stored segments are unchanged. */
import { useLayoutEffect, useRef, useState } from 'react'
import { motion, useAnimationControls } from 'motion/react'
import Frame from '../Frame'
import Figure from '../Figure'
import { Art } from '../art'
import { SCENE_ANCHORS, sceneToBox } from '../art/scenes'
import { items, label } from '../content'
import { useLayoutInfo } from '../layout'
import { pressPanelPrimary } from '../deskKeys'
import type { Answers, StepProps } from '../types'

const BUSINESS = items('S01', 'B').filter((i) => i.group === 'Business' && i.id !== 'other')
// the last four classes only
const YEARS = ['2022', '2023', '2024', '2025']
const COHORTS: { id: string; text: string }[] = YEARS.map((y) => ({ id: y, text: y }))


export default function S01(p: StepProps) {
  const a = p.answers
  const L = useLayoutInfo()
  if (L.desk) return <S01Desk {...p} />
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
    <Frame id="S01" beat="A" valid continueLabel="Start the climb" onContinue={p.next}>
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
        <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Business">
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
        <div className="grid grid-cols-4 gap-2" role="radiogroup" aria-label="Class of">
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

/* ------------------------------------------------------------ desk */

/** The landscape base-camp render (scene-basecamp-wide, 2400x1600: the camp
    in front, the route up to the summit behind) and where things are on it,
    as fractions of the image. The render covers the stage region like the
    other scenes (xMidYMax slice), so the anchors hold at any desk size. */
const BCR = {
  w: 2400, h: 1600,
  /** the rookie's feet: in front of the trailhead, where the route starts
      beside the cairn (render anchors: trailhead 0.30, 0.85; cairn 0.269, 0.889) */
  rookie: { x: 0.36, y: 0.935 },
  /** the open rucksack, in front of the cairn */
  sack: { x: 0.225, y: 0.97 },
  /** the tent's open doorway: bottom centre, and the kit's width in render px */
  door: { x: 0.598, y: 0.8, w: 150 },
  /** a figure this many render px tall (the tent is about 310) */
  rookieH: 360,
}

function S01Desk(p: StepProps) {
  const a = p.answers
  const inB = p.beat === 'B'
  const business = a['segment.business'] ?? null
  const cohort = a['segment.cohort'] ?? null
  const status = `Business ${business ? '✓' : '—'} · Class ${cohort ? '✓' : '—'}`
  const missing = [business ? null : 'your business', cohort ? null : 'your class'].filter(Boolean).join(' and ')
  return (
    <Frame id="S01" beat={p.beat} host="native" scene={null}
      valid={inB ? business != null && cohort != null : true}
      continueLabel={inB ? undefined : 'Start the climb'}
      onContinue={p.next}
      summary={inB ? status : undefined}
      invalidReason={inB && missing ? `Choose ${missing}` : undefined}>
      <DeskBaseCamp dim={inB} />
      {inB && (
        <DeskSegments business={business} cohort={cohort}
          onBusiness={(b) => { p.setMany({ 'segment.business': b, 'segment.source': 'asked' }); p.log('pick', { row: 'business', id: b }) }}
          onCohort={(c) => { p.setMany({ 'segment.cohort': c, 'segment.source': 'asked' }); p.log('pick', { row: 'cohort', id: c }) }}
        />
      )}
    </Frame>
  )
}

/** The base camp over the whole stage region (behind the caption), with the
    rookie, the open rucksack and the covered kit on the render's anchors. */
function DeskBaseCamp({ dim }: { dim: boolean }) {
  const layer = useRef<HTMLDivElement | null>(null)
  const [box, setBox] = useState<{ fw: number; fh: number; ox: number; oy: number } | null>(null)
  const cover = useAnimationControls()
  const busy = useRef(false)

  useLayoutEffect(() => {
    const el = layer.current
    const frame = el?.closest<HTMLElement>('[data-frame]')
    if (!el || !frame) return
    const measure = () => {
      const f = frame.getBoundingClientRect(), l = el.getBoundingClientRect()
      setBox({ fw: f.width, fh: f.height, ox: l.left - f.left, oy: l.top - f.top })
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(frame); ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const peek = async () => {
    if (busy.current) return
    busy.current = true
    await cover.start({ y: -4, rotate: -1.2, transition: { duration: 0.14, ease: 'easeOut' } })
    await cover.start({ y: 0, rotate: 0, transition: { type: 'spring', stiffness: 700, damping: 14 } })
    busy.current = false
  }

  // the render covers the stage region (slice), bottom-anchored like the scene art
  const s = box ? Math.max(box.fw / BCR.w, box.fh / BCR.h) : 1
  const iw = BCR.w * s, ih = BCR.h * s
  const il = box ? (box.fw - iw) / 2 - box.ox : 0
  const it = box ? box.fh - ih - box.oy : 0
  const at = (x: number, y: number) => ({ x: il + x * iw, y: it + y * ih })
  const rk = at(BCR.rookie.x, BCR.rookie.y)
  const sk = at(BCR.sack.x, BCR.sack.y)
  const dr = at(BCR.door.x, BCR.door.y)
  const rookieH = Math.round(Math.max(130, BCR.rookieH * s))
  const sack = Math.round(rookieH * 0.62)
  const rack = BCR.door.w * s

  return (
    <div ref={layer} className="absolute inset-0" data-trailhead data-s01-desk>
      {box && (
        <>
          <div className="pointer-events-none absolute" style={{ left: il, top: it, width: iw, height: ih }} aria-hidden>
            <Art id="scene-basecamp-wide" width={iw} height={ih} />
          </div>
          <div className="pointer-events-none absolute" style={{ left: sk.x - sack / 2, top: sk.y - sack * 0.92 }} aria-hidden>
            <Art id="rucksack" size={sack} />
          </div>
          <div className="pointer-events-none absolute" style={{ left: rk.x - rookieH * (9 / 26), top: rk.y - rookieH * (25 / 26) }} aria-hidden>
            <Figure size={rookieH} pose="stand" />
          </div>
          <motion.button
            type="button"
            tabIndex={-1}
            aria-hidden
            onClick={peek}
            animate={cover}
            className="absolute origin-bottom"
            style={{ left: dr.x - rack / 2, top: dr.y - rack + rack * (2 / 64), width: rack, height: rack, cursor: 'pointer' }}
            data-testid="kit-covered"
          >
            <Art id="kit-rack-covered" width="100%" height="100%" />
          </motion.button>
          {dim && <div className="pointer-events-none absolute inset-0" style={{ background: 'rgba(248,247,244,0.35)' }} aria-hidden />}
        </>
      )}
    </div>
  )
}

/** Beat B on desk: a paper card, two radio rows; arrows move within a row. */
function DeskSegments({ business, cohort, onBusiness, onCohort }: {
  business: Answers['segment.business'] | null
  cohort: string | null
  onBusiness: (b: NonNullable<Answers['segment.business']>) => void
  onCohort: (c: string) => void
}) {
  const row = <T extends string>(name: string, opts: { id: T; text: string }[], cur: string | null, pick: (id: T) => void, w: number, test: string) => {
    const i = opts.findIndex((o) => o.id === cur)
    const onKey = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') { e.preventDefault(); pressPanelPrimary(); return }
      const d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0
      if (!d) return
      e.preventDefault()
      const j = i < 0 ? (d > 0 ? 0 : opts.length - 1) : (i + d + opts.length) % opts.length
      pick(opts[j].id)
      requestAnimationFrame(() => document.querySelector<HTMLElement>(`[data-testid="${test}-${opts[j].id}"]`)?.focus())
    }
    return (
      <fieldset className="mt-6 first:mt-0">
        <legend className="mb-3 font-[family-name:var(--font-ui)] text-[12px] font-semibold uppercase tracking-[0.14em] text-muted">{name}</legend>
        <div className="flex gap-3" role="radiogroup" aria-label={name} onKeyDown={onKey}>
          {opts.map((o, k) => {
            const on = cur === o.id
            return (
              <button key={o.id} type="button" role="radio" aria-checked={on} data-on={on}
                tabIndex={(i < 0 ? k === 0 : on) ? 0 : -1}
                onClick={() => pick(o.id)}
                className="choice flex items-center justify-center !px-0 !py-0 !text-center !text-[17px]"
                style={{ width: w, height: 56, minHeight: 56 }}
                data-testid={`${test}-${o.id}`}>
                {o.text}
              </button>
            )
          })}
        </div>
      </fieldset>
    )
  }
  return (
    <div className="absolute inset-0 flex items-start justify-center pt-[6%]">
      <div className="rounded-[3px] border border-rule-soft px-10 py-8" style={{ background: 'rgba(248,247,244,0.97)', boxShadow: '0 12px 32px rgba(13,12,11,0.10)' }} data-segment-card>
        {row('Business', BUSINESS.map((b) => ({ id: b.id as NonNullable<Answers['segment.business']>, text: label('S01', b.id) })), business, onBusiness, 150, 'business')}
        {row('Class of', COHORTS.map((c) => ({ id: c.id, text: c.text })), cohort, onCohort, 140, 'cohort')}
      </div>
    </div>
  )
}
