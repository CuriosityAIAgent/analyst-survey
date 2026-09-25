'use client'
/* S08 · Camp III · "Roped to another" (design: "S08", "The two questions
   about their own climb", "Fun and feel").

   The second real drag slider, horizontal, and the second (last) question
   about the respondent. Their own bronze figure is the thumb: it starts on a
   ledge below the ridge, unset, and is dragged onto one of five stops on the
   crest (or a stop or its label is tapped, or the arrow keys step). A rope
   runs from the figure off-screen to the left; the other Advisor is never
   drawn. Labels only at the stops, no pictures. 'Rather not say' stores null
   and sends the figure back to the ledge.
     stores self.ropeCounterfactual (1 = Nowhere near here .. 5 = Right here,
            or null), rope.reversals
   F5 rises after Continue (variant A for 1-3 or null, B for 4-5: store.ts).

   Geometry: the track-ridge drawing exports its crest path, stop fractions
   and the parked ledge (RIDGE in art/tracks.tsx); the slider lies on it. One
   340x236 box holds every layer, scaled to the stage with container units. */
import { useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { motion } from 'motion/react'
import Frame from '../Frame'
import RouteSlider from '../RouteSlider'
import type { ThumbState } from '../RouteSlider'
import Figure from '../Figure'
import { Art } from '../art'
import { RIDGE } from '../art/tracks'
import { items } from '../content'
import { campPaper } from '../feel'
import type { Rope, StepProps } from '../types'

const W = 340 // narrower than the drawing, so the ridge fills the width
const H = 262 // the crest, the label row, then the starting ledge below it
const OX = -10 // the 360x120 drawing sits at x -10..350 (crest stops 34..306)
const OY = 36 //                          and y  36..156
const [AW, AH] = RIDGE.viewBox
const shift = (d: string) => d.replace(/(-?[\d.]+)[\s,]+(-?[\d.]+)/g, (_, x, y) => `${+x + OX} ${+y + OY}`)
const D = shift(RIDGE.d)
const PARK = { x: RIDGE.parked.x + OX, y: RIDGE.parked.y + OY }
const LABEL_Y = OY + AH + 16 // first line of the labels, under the drawing
const ROPE_END = { x: -30, y: OY + 150 } // off the left edge of the screen

const INK = '#0D0C0B'
const PAPER = '#F8F7F4'
/** Camp III's warmed paper: label halos in it, so they don't glow white. */
const CAMP_PAPER = campPaper('S08')
const RULE = '#8C857A'
const BRONZE = '#7A3E12'
const MUTED = '#494540'
const UI: CSSProperties = { fontFamily: 'var(--font-ui)' }
/** A paper halo so labels stay legible over the scene's hachure. */
const HALO = { stroke: CAMP_PAPER, strokeWidth: 4, strokeLinejoin: 'round' as const, paintOrder: 'stroke' as const }
const pct = (v: number, of: number) => `${(v / of) * 100}%`

/** Two balanced lines: 'Nowhere near here' -> 'Nowhere' / 'near here'. */
function twoLines(s: string): [string, string] {
  const w = s.split(' ')
  if (w.length < 2) return [s, '']
  let best: [string, string] = [w[0], w.slice(1).join(' ')]
  for (let i = 1; i < w.length; i++) {
    const a = w.slice(0, i).join(' '), b = w.slice(i).join(' ')
    if (Math.max(a.length, b.length) < Math.max(best[0].length, best[1].length)) best = [a, b]
  }
  return best
}

export default function S08(p: StepProps) {
  const its = items('S08')
  const stops = RIDGE.stops.map((s) => {
    const it = its.find((x) => x.id === s.id)
    return { id: s.id, at: s.at, label: it?.label ?? s.id, value: (it?.value as Rope) ?? (s.value as Rope), x: s.x + OX, y: s.y + OY }
  })
  const has = 'self.ropeCounterfactual' in p.answers
  const rope = p.answers['self.ropeCounterfactual']
  const value = typeof rope === 'number' ? stops.find((s) => s.value === rope)?.id ?? null : null
  const rather = has && rope === null
  // reversals: what earlier visits stored, plus this visit's count (the
  // slider counts from zero each time it mounts)
  const base = useRef(p.answers['rope.reversals'] ?? 0)
  const reversals = useRef(base.current)
  const [puff, setPuff] = useState(0)

  const place = (v: Rope | null, via: string, rev?: number) => {
    if (rev !== undefined) reversals.current = base.current + rev
    p.setMany({ 'self.ropeCounterfactual': v, 'rope.reversals': reversals.current })
    p.log('place', { value: v, via, reversals: reversals.current })
    if (v !== null) setPuff((n) => n + 1)
  }

  return (
    <Frame
      id="S08"
      /* a self-question: no other imagery on screen (track-ridge brief), so
         the camp scene's own ridge does not cross the instrument */
      scene={null}
      valid={has}
      onContinue={p.next}
    >
      {/* the ridge sits a little above the middle (about 45% of the screen),
          with 'Rather not say' just under the starting ledge */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pb-[24px]" style={{ containerType: 'size' }}>
        <div className="relative" style={{ width: `min(100cqw, calc((100cqh - 60px) * ${W} / ${H}))`, aspectRatio: `${W} / ${H}` }}>
          <div className="pointer-events-none absolute" aria-hidden
            style={{ left: pct(OX, W), top: pct(OY, H), width: pct(AW, W), height: pct(AH, H) }}>
            <Art id="track-ridge" width="100%" height="100%" />
          </div>
          <div className="absolute inset-0" data-testid="s08-slider">
            <RouteSlider
              d={D}
              viewBox={[W, H]}
              stops={stops.map((s) => ({ id: s.id, at: s.at, label: s.label }))}
              value={value}
              parked={PARK}
              label="Roped to a different Advisor on day one: where are you now?"
              orientation="horizontal"
              disabled={p.covered}
              stopHit={26}
              trackHit={44}
              testId="s08-range"
              onChange={(id, m) => { const s = stops.find((x) => x.id === id); if (s) place(s.value, m.via, m.reversals) }}
              renderTrack={() => (
                <g>
                  {stops.map((s) => {
                    const on = s.id === value
                    const [a, b] = twoLines(s.label)
                    return (
                      <g key={s.id}>
                        <line x1={s.x} y1={s.y + 12} x2={s.x} y2={LABEL_Y - 16} stroke={RULE} strokeWidth={0.8} strokeDasharray="1 3" aria-hidden />
                        <g data-rs-stop={s.id} style={{ cursor: 'pointer' }}>
                          <rect x={s.x - 34} y={LABEL_Y - 18} width={68} height={48} fill="transparent" />
                          <text x={s.x} y={LABEL_Y} textAnchor="middle" fontSize={12} fill={on ? INK : MUTED} {...HALO}
                            style={{ ...UI, fontWeight: on ? 600 : 400 }}>
                            <tspan x={s.x}>{a}</tspan>
                            <tspan x={s.x} dy={14}>{b}</tspan>
                          </text>
                          {on && <rect x={s.x - 14} y={LABEL_Y + 21} width={28} height={1.6} fill={BRONZE} />}
                        </g>
                      </g>
                    )
                  })}
                </g>
              )}
              renderThumb={(s) => <You s={s} puff={puff} reduced={p.reduced} unset={!has || rope === null} />}
            />
          </div>
        </div>
        <button type="button" onClick={() => place(null, 'tap')} aria-pressed={rather} disabled={p.covered}
          className={`mt-[2px] min-h-[44px] self-start px-5 font-[family-name:var(--font-ui)] text-[12px] leading-[16px] underline underline-offset-2 ${rather ? 'font-semibold text-ink' : 'text-muted'}`}
          data-testid="s08-rather">
          Rather not say
        </button>
      </div>
    </Frame>
  )
}

/** You, in bronze, roped to someone off to the left who is never drawn. */
function You({ s, puff, reduced, unset }: { s: ThumbState; puff: number; reduced: boolean; unset: boolean }) {
  const facing: 1 | -1 = s.moving && Math.cos((s.angle * Math.PI) / 180) < 0 ? -1 : 1
  // the rope: from the harness to off-screen left, with a gentle sag
  const ex = ROPE_END.x - s.x, ey = ROPE_END.y - s.y
  const hx = -2 * facing, hy = -11
  const cx = (hx + ex) / 2, cy = Math.max(hy, ey) + 26
  const rope = `M ${hx} ${hy} Q ${cx} ${cy} ${ex} ${ey}`
  return (
    <g>
      <g pointerEvents="none" aria-hidden>
        <path d={rope} fill="none" stroke={INK} strokeWidth={1.8} strokeLinecap="round" />
        <path d={rope} fill="none" stroke={PAPER} strokeWidth={0.6} strokeDasharray="1.5 2.5" strokeLinecap="round" />
      </g>
      <rect x={-26} y={-58} width={52} height={66} fill="transparent" />
      <ellipse cx={0} cy={0.5} rx={9} ry={2} fill={INK} opacity={0.14} />
      <Figure as="g" variant="you" size={48} pose={s.moving ? 'stride' : 'stand'} t={s.stride} facing={facing} title="You" />
      {!reduced && !s.moving && s.set && <Puff key={puff} />}
      {unset && !s.dragging && <GrabCue reduced={reduced} />}
    </g>
  )
}

/** Before the first move: a dotted ring at the boots and a pencil chevron up
    toward the crest. */
function GrabCue({ reduced }: { reduced: boolean }) {
  return (
    <g pointerEvents="none" aria-hidden>
      <motion.ellipse cx={0} cy={0.5} rx={16} ry={4.5} fill="none" stroke={INK} strokeWidth={1} strokeDasharray="2 3"
        initial={false}
        animate={reduced ? { opacity: 0.6 } : { opacity: [0.2, 0.85, 0.2] }}
        transition={reduced ? { duration: 0 } : { duration: 1.8, repeat: Infinity, ease: 'easeInOut' }} />
      {[0, 1].map((i) => (
        <motion.path key={i} d={`M ${26} ${-30 - i * 8} l 3.5 -3.5 l 3.5 3.5`} fill="none" stroke={INK}
          strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round"
          initial={false}
          animate={reduced ? { opacity: 0.5 } : { opacity: [0.1, 0.7, 0.1] }}
          transition={reduced ? { duration: 0 } : { duration: 1.8, repeat: Infinity, delay: i * 0.25 }} />
      ))}
    </g>
  )
}

function Puff(): ReactNode {
  return (
    <motion.g initial={{ opacity: 0.8, scale: 0.6 }} animate={{ opacity: 0, scale: 1.4 }} transition={{ duration: 0.36, ease: 'easeOut' }}
      pointerEvents="none" aria-hidden>
      <path d="M -11 -1 q -4 -3 -8 -1 M 11 -1 q 4 -3 8 -1" fill="none" stroke={INK} strokeWidth={1} strokeLinecap="round" />
    </motion.g>
  )
}
