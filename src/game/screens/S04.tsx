'use client'
/* S04 · Camp I · "The climb" (design: "S04", "Fun and feel").

   Beat A (drag-slider): the rookie is the thumb of a vertical switchback.
   They start on the trailhead ledge, off the scale; the respondent drags them
   up (or taps a camp or its label, or uses the keys) and on release they
   snap to the nearest camp with a boot-crunch tick. Their footsteps ink the
   pencil path in behind them. The brass 'When proven' tag beside the track
   is tapped, not dragged: the rookie stays at the trailhead with the tag on
   their pack.
     stores pace.months (12|18|24|30|36|48|'proven'), pace.reversals

   Beat B (pick, self-question): the rookie waits at their camp; the
   respondent's own figure appears at the trailhead as a bronze outline. One
   tap on the same track, or 'Not yet' (the outline stays at the trailhead),
   or the small 'Rather not say' (null). Tap only, and no pictures at the
   stops: the track is drawn plain here (no tents, cairn or tag).
     stores self.readyAt (12..48|'notYet'|null)
   The camp walk (Frame, spec walk:true) replaces Continue on Beat B; F2
   rises after it (store.ts).

   Geometry: the track-switchback drawing exports its path (SWITCHBACK in
   art/tracks.tsx). It is drawn mirrored here, so the trailhead and the brass
   tag sit on the right and the altitude labels read down the left without
   colliding with the tag. One 390x400 box holds every layer and is scaled to
   fit the stage with container units, so the SVG and the HTML controls over
   it share coordinates. */
import { useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { motion } from 'motion/react'
import Frame from '../Frame'
import RouteSlider from '../RouteSlider'
import type { ThumbState } from '../RouteSlider'
import Figure from '../Figure'
import { Art } from '../art'
import { SWITCHBACK } from '../art/tracks'
import { items } from '../content'
import { buzz as vibrate } from '../feel'
import type { Months, Pace, ReadyAt, StepProps } from '../types'

/* ---------------------------------------------------------------- geometry */

const W = 390
const H = 400
const OX = 170 // the 200x340 drawing sits at x 170..370
const OY = 30 //                          and y  30..370
const [AW] = SWITCHBACK.viewBox
const mx = (x: number) => OX + (AW - x) // mirrored
const my = (y: number) => OY + y

type Pt = { x: number; y: number }
/** The drawing's polyline, mirrored into box coordinates. */
const PTS: Pt[] = [...SWITCHBACK.d.matchAll(/[ML]\s*(-?[\d.]+)[\s,]+(-?[\d.]+)/g)].map((m) => ({ x: mx(+m[1]), y: my(+m[2]) }))
const D = 'M ' + PTS.map((q) => `${q.x} ${q.y}`).join(' L ')
const CUM: number[] = PTS.reduce<number[]>((acc, q, i) => {
  acc.push(i === 0 ? 0 : acc[i - 1] + Math.hypot(q.x - PTS[i - 1].x, q.y - PTS[i - 1].y))
  return acc
}, [])
const LEN = CUM[CUM.length - 1] || 1

function pointAt(t: number) {
  const d = Math.max(0, Math.min(1, t)) * LEN
  let i = 1
  while (i < CUM.length - 1 && CUM[i] < d) i++
  const a = PTS[i - 1], b = PTS[i]
  const u = (d - CUM[i - 1]) / (CUM[i] - CUM[i - 1] || 1)
  return { x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u, angle: (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI }
}

const MONTHS: Months[] = [12, 18, 24, 30, 36, 48]
const idOf = (m: Months) => `m${m}`
const monthsOf = (id: string): Months | null => {
  const n = Number(id.slice(1))
  return (MONTHS as number[]).includes(n) ? (n as Months) : null
}
type Camp = { m: Months; id: string; at: number; x: number; y: number; far: boolean; tentX: number }
const CAMPS: Camp[] = MONTHS.map((m) => {
  const s = SWITCHBACK.stops.find((x) => x.id === idOf(m))!
  const x = mx(s.x), y = my(s.y)
  const far = x > OX + AW / 2 // on the right-hand bends, across the track from the labels
  return { m, id: idOf(m), at: s.at, x, y, far, tentX: far ? x + 18 : x - 18 }
})
const camp = (m: Months) => CAMPS.find((c) => c.m === m)!
/** Which way the next leg runs from a stop: the figure faces uphill. */
function facingAt(at: number): 1 | -1 {
  if (at >= 0.999) return camp(48).far ? -1 : 1
  const a = pointAt(Math.min(1, at + 0.01)), b = pointAt(Math.min(1, at + 0.03))
  return b.x >= a.x ? 1 : -1
}

const TRAIL = { x: mx(SWITCHBACK.parked.x), y: my(SWITCHBACK.parked.y) }
const T = SWITCHBACK.provenTag
const TAG = { x: mx(T.x + T.w), y: my(T.y), w: T.w, h: T.h } // mirrored box
const TODAY = { x: mx(SWITCHBACK.today.x), y: my(SWITCHBACK.today.y) }
const LABEL_X = 156 // labels right-aligned here

const INK = '#0D0C0B'
const PAPER = '#F8F7F4'
const RULE = '#8C857A'
const RULE_SOFT = '#DDD9D2'
const FOREST = '#1F4B3A'
const BRONZE = '#7A3E12'
const MUTED = '#494540'
const UI: CSSProperties = { fontFamily: 'var(--font-ui)' }
/** A paper halo so labels stay legible over the scene's hachure. */
const HALO = { stroke: PAPER, strokeWidth: 4, strokeLinejoin: 'round' as const, paintOrder: 'stroke' as const }
const pct = (v: number, of: number) => `${(v / of) * 100}%`


/* ---------------------------------------------------------------- screen */

export default function S04(p: StepProps) {
  const labels = Object.fromEntries(items('S04').map((it) => [it.id, it.label])) as Record<string, string>
  return p.beat === 'B' ? <BeatB {...p} labels={labels} /> : <BeatA {...p} labels={labels} />
}

type BeatProps = StepProps & { labels: Record<string, string> }

/** The scaled 390x400 box every layer of this screen shares. It sits on the
    foot of the stage, so the trailhead ledge stands on the scene's ground
    plane at any height, and both beats put the track in the same place. */
function Box({ children, center = false }: { children: ReactNode; center?: boolean }) {
  return (
    <div className={`absolute inset-0 flex justify-center ${center ? 'items-center' : 'items-end'}`} style={{ containerType: 'size' }}>
      <div className="relative" style={{ width: `min(100cqw, calc(100cqh * ${W} / ${H}))`, aspectRatio: `${W} / ${H}` }}>
        {children}
      </div>
    </div>
  )
}

/** Solid ink bootprints along the walked part of the path (only steps draw it). */
function Prints({ to }: { to: number | null }) {
  if (to === null || to <= 0.015) return null
  const out: ReactNode[] = []
  const gap = 9 / LEN
  for (let u = 0.02, i = 0; u < to - 0.008; u += gap, i++) {
    const q = pointAt(u)
    const side: 1 | -1 = i % 2 ? 1 : -1
    const r = (q.angle * Math.PI) / 180
    const ox = -Math.sin(r) * 2.4 * side, oy = Math.cos(r) * 2.4 * side
    // a small solid print (the Bootprint drawing's tread lines vanish at this size)
    out.push(
      <g key={i} transform={`translate(${q.x + ox} ${q.y + oy}) rotate(${q.angle + 90})`} fill={INK}>
        <ellipse cx={0} cy={-1.3} rx={1.45} ry={2.1} />
        <ellipse cx={0} cy={2.3} rx={1.15} ry={1} />
      </g>,
    )
  }
  return <g aria-hidden pointerEvents="none">{out}</g>
}

/** Altitude labels down the left, a dotted leader to each camp. */
function Scale({ selected, labels, beat }: { selected: unknown; labels: Record<string, string>; beat: 'A' | 'B' }) {
  return (
    <g>
      {CAMPS.map((c) => {
        const on = selected === c.m
        const end = c.far ? c.x - 14 : c.m === 36 && beat === 'A' ? TODAY.x - 10 : Math.min(c.x, c.tentX) - 12
        return (
          <g key={c.id}>
            <line x1={LABEL_X + 6} y1={c.y} x2={end} y2={c.y} stroke={RULE} strokeWidth={0.8} strokeDasharray="1 3" aria-hidden />
            <g data-rs-stop={beat === 'A' ? c.id : undefined} style={{ cursor: 'pointer' }}>
              <rect x={4} y={c.y - 22} width={LABEL_X + 8} height={44} fill="transparent" />
              <text x={LABEL_X} y={c.y + 4.5} textAnchor="end" fontSize={13} fill={on ? INK : MUTED} {...HALO}
                style={{ ...UI, fontWeight: on ? 600 : 400 }}>
                {labels[c.id]}
              </text>
            </g>
          </g>
        )
      })}
    </g>
  )
}

/* ---------------------------------------------------------------- Beat A */

function BeatA(p: BeatProps) {
  const pace = p.answers['pace.months']
  const value = typeof pace === 'number' ? idOf(pace) : null
  const proven = pace === 'proven'
  // reversals: what earlier visits stored, plus this visit's count (the
  // slider counts from zero each time it mounts)
  const base = useRef(p.answers['pace.reversals'] ?? 0)
  const reversals = useRef(base.current)
  const [puff, setPuff] = useState(0)

  const place = (next: Pace, via: string, rev?: number) => {
    if (rev !== undefined) reversals.current = base.current + rev
    p.setMany({ 'pace.months': next, 'pace.reversals': reversals.current })
    p.log('place', { value: next, via, reversals: reversals.current })
    setPuff((n) => n + 1)
  }

  const stops = CAMPS.map((c) => ({ id: c.id, at: c.at, label: p.labels[c.id], valueText: p.labels[c.id] }))

  return (
    <Frame id="S04" beat="A" valid={pace !== undefined} onContinue={p.next}>
      <Box>
        {/* the drawn track (mirrored: trailhead and tag on the right) */}
        <div className="pointer-events-none absolute" aria-hidden
          style={{ left: pct(OX, W), top: pct(OY, H), width: pct(AW, W), height: pct(SWITCHBACK.viewBox[1], H), transform: 'scaleX(-1)' }}>
          <Art id="track-switchback" width="100%" height="100%" />
        </div>
        <div className="absolute inset-0" data-testid="s04-slider">
          <RouteSlider
            d={D}
            viewBox={[W, H]}
            stops={stops}
            value={value}
            parked={TRAIL}
            label="How long should the climb to Advisor take?"
            orientation="vertical"
            disabled={p.covered}
            stopHit={28}
            trackHit={40}
            testId="s04-range"
            onChange={(id, m) => { const mo = monthsOf(id); if (mo) place(mo, m.via, m.reversals) }}
            renderTrack={(s) => (
              <g>
                <Prints to={s.t} />
                {CAMPS.map((c) => <Pennant key={c.id} x={c.tentX} y={c.y - 13} on={value === c.id} reduced={p.reduced} />)}
                <Scale selected={pace} labels={p.labels} beat="A" />
                <text x={LABEL_X} y={camp(36).y + 17} textAnchor="end" fontSize={9.5} letterSpacing="0.14em" fill={BRONZE} {...HALO}
                  style={{ ...UI, textTransform: 'uppercase' }} aria-hidden>Today</text>
              </g>
            )}
            renderThumb={(s) => <Climber s={s} pace={pace} puff={puff} reduced={p.reduced} />}
          />
        </div>
        <ProvenTag on={proven} disabled={p.covered} label={p.labels.proven} reduced={p.reduced}
          onTap={() => { vibrate(); place('proven', 'tap') }} />
      </Box>
    </Frame>
  )
}

/** The selected camp's tent flies a small forest pennant. */
function Pennant({ x, y, on, reduced }: { x: number; y: number; on: boolean; reduced: boolean }) {
  return (
    <motion.g aria-hidden pointerEvents="none" initial={false}
      animate={{ opacity: on ? 1 : 0, scaleY: on ? 1 : 0.2 }}
      transition={reduced ? { duration: 0.12 } : { duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      style={{ originX: `${x}px`, originY: `${y}px` }}>
      <line x1={x} y1={y} x2={x} y2={y - 11} stroke={INK} strokeWidth={1.2} strokeLinecap="round" />
      <path d={`M ${x} ${y - 11} L ${x + 8} ${y - 8.5} L ${x} ${y - 6} Z`} fill={FOREST} stroke={INK} strokeWidth={0.9} strokeLinejoin="round" />
    </motion.g>
  )
}

/** A small brass tag on the pack: the rookie is 'ready when proven'. */
const PackTag = <rect x={0.6} y={1.2} width={4.2} height={3.2} rx={0.6} fill={BRONZE} stroke={INK} strokeWidth={0.45} />

/** The rookie as the thumb: stride while moving, a small dust puff on arrival. */
function Climber({ s, pace, puff, reduced }: { s: ThumbState; pace: Pace | undefined; puff: number; reduced: boolean }) {
  let facing: 1 | -1 = -1
  if (s.moving) facing = Math.cos((s.angle * Math.PI) / 180) >= 0 ? 1 : -1
  else if (typeof pace === 'number') facing = facingAt(camp(pace).at)
  return (
    <g>
      {/* a generous grab area over the whole figure */}
      <rect x={-26} y={-58} width={52} height={66} fill="transparent" />
      <ellipse cx={0} cy={0.5} rx={9} ry={2} fill={INK} opacity={0.14} />
      <Figure as="g" size={48} pose={s.moving ? 'stride' : 'stand'} t={s.stride} facing={facing} title="The rookie"
        carry={pace === 'proven' ? PackTag : undefined} />
      {!reduced && !s.moving && s.set && <Puff key={puff} />}
      {pace === undefined && !s.dragging && <GrabCue reduced={reduced} />}
    </g>
  )
}

/** Before the first move: a dotted ring at the boots and pencil chevrons up
    the trail, so the rookie reads as something to pick up. */
function GrabCue({ reduced }: { reduced: boolean }) {
  return (
    <g pointerEvents="none" aria-hidden>
      <motion.ellipse cx={0} cy={0.5} rx={16} ry={4.5} fill="none" stroke={INK} strokeWidth={1} strokeDasharray="2 3"
        initial={false}
        animate={reduced ? { opacity: 0.6 } : { opacity: [0.2, 0.85, 0.2] }}
        transition={reduced ? { duration: 0 } : { duration: 1.8, repeat: Infinity, ease: 'easeInOut' }} />
      {[0, 1, 2].map((i) => (
        <motion.path key={i} d={`M ${-26 - i * 10} ${-6 - i * 5} l -3.5 -3.5 l -3.5 3.5`} fill="none" stroke={INK}
          strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round"
          initial={false}
          animate={reduced ? { opacity: 0.5 } : { opacity: [0.1, 0.7, 0.1] }}
          transition={reduced ? { duration: 0 } : { duration: 1.8, repeat: Infinity, delay: i * 0.22 }} />
      ))}
    </g>
  )
}

function Puff() {
  return (
    <motion.g initial={{ opacity: 0.8, scale: 0.6 }} animate={{ opacity: 0, scale: 1.4 }} transition={{ duration: 0.36, ease: 'easeOut' }}
      pointerEvents="none" aria-hidden>
      <path d="M -11 -1 q -4 -3 -8 -1 M 11 -1 q 4 -3 8 -1" fill="none" stroke={INK} strokeWidth={1} strokeLinecap="round" />
    </motion.g>
  )
}

/** The tap target over the drawn brass tag, with its label set in bronze. */
function ProvenTag({ on, onTap, disabled, label, reduced }: { on: boolean; onTap: () => void; disabled: boolean; label: string; reduced: boolean }) {
  const box = { x: TAG.x - 30, y: TAG.y - 28, w: 92, h: 64 }
  return (
    <button
      type="button"
      onClick={onTap}
      disabled={disabled}
      aria-pressed={on}
      aria-label={label}
      className="absolute"
      style={{ left: pct(box.x, W), top: pct(box.y, H), width: pct(box.w, W), height: pct(box.h, H), touchAction: 'manipulation' }}
      data-testid="s04-proven"
    >
      <motion.span
        className="absolute left-0 right-0 top-[4px] text-center font-[family-name:var(--font-ui)] text-[12.5px] leading-[16px]"
        style={{ color: on ? INK : BRONZE, fontWeight: on ? 600 : 500, textShadow: '0 0 3px #F8F7F4, 0 0 3px #F8F7F4, 0 0 2px #F8F7F4' }}
        animate={on && !reduced ? { y: [0, -3, 0] } : { y: 0 }}
        transition={{ duration: 0.32 }}
      >
        {label}
        <span className="mx-auto mt-[1px] block h-[1.5px] w-[64px]" style={{ background: on ? BRONZE : 'transparent' }} />
      </motion.span>
    </button>
  )
}

/* ---------------------------------------------------------------- Beat B */

function BeatB(p: BeatProps) {
  const pace = p.answers['pace.months']
  const has = 'self.readyAt' in p.answers
  const mine = p.answers['self.readyAt']
  const rookieAt = typeof pace === 'number' ? camp(pace).at : null
  const rookiePos = typeof pace === 'number' ? camp(pace) : TRAIL

  const choose = (v: ReadyAt, via: 'tap' | 'key') => {
    if (v !== mine) vibrate()
    p.set('self.readyAt', v)
    p.log('pick', { value: v, via })
  }

  // where the bronze outline stands (beside the rookie if they share a camp)
  let ghost: Pt = { x: TRAIL.x + (typeof pace === 'number' ? 0 : 26), y: TRAIL.y }
  if (typeof mine === 'number') {
    const c = camp(mine)
    ghost = { x: c.x + (mine === pace ? (c.far ? -24 : 24) : 0), y: c.y }
  }
  const ghostFacing: 1 | -1 = typeof mine === 'number' ? facingAt(camp(mine).at) : -1

  // radio keys: Up/Down through 'Not yet' and the camps; Home/End
  const order: ReadyAt[] = ['notYet', ...MONTHS]
  const cur = has && mine !== null ? order.indexOf(mine!) : -1
  const onKey = (e: React.KeyboardEvent) => {
    const up = e.key === 'ArrowUp' || e.key === 'ArrowRight'
    const down = e.key === 'ArrowDown' || e.key === 'ArrowLeft'
    if (!up && !down && e.key !== 'Home' && e.key !== 'End') return
    e.preventDefault()
    let i = cur < 0 ? 0 : cur
    if (e.key === 'Home') i = 0
    else if (e.key === 'End') i = order.length - 1
    else i = cur < 0 ? (up ? 1 : 0) : Math.max(0, Math.min(order.length - 1, i + (up ? 1 : -1)))
    choose(order[i], 'key')
    requestAnimationFrame(() => document.querySelector<HTMLElement>(`[data-self-stop="${String(order[i])}"]`)?.focus())
  }
  const tabStop = (v: ReadyAt) => ((cur < 0 ? v === 'notYet' : order[cur] === v) ? 0 : -1)
  const rather = has && mine === null
  const NOT_YET = { x: TRAIL.x - 178, y: TRAIL.y - 16, w: 112, h: 44 }

  return (
    <Frame
      id="S04"
      beat="B"
      /* the self beat: 'No other image is on screen (images shift self-ratings)' */
      scene={null}
      valid={has}
      onContinue={p.next}
      footnote={
        <button type="button" onClick={() => choose(null, 'tap')} aria-pressed={rather} disabled={p.covered}
          className={`-my-[14px] py-[14px] pr-4 font-[family-name:var(--font-ui)] text-[12px] leading-[16px] underline underline-offset-2 ${rather ? 'font-semibold text-ink' : 'text-muted'}`}
          style={{ textShadow: '0 0 3px #F8F7F4, 0 0 3px #F8F7F4, 0 0 2px #F8F7F4' }}
          data-testid="s04-rather">
          Rather not say
        </button>
      }
    >
      {/* no scene on the self beat, so nothing holds the track to the
          ground: it sits in the middle of the stage, with no empty band */}
      <Box center>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" className="absolute inset-0" style={{ overflow: 'visible' }} aria-hidden>
          <PlainTrack />
          <Prints to={rookieAt} />
          {CAMPS.map((c) => (
            <circle key={c.id} cx={c.x} cy={c.y} r={3.6} fill={mine === c.m ? BRONZE : PAPER} stroke={INK} strokeWidth={1.2}
              style={{ transition: 'fill 160ms' }} />
          ))}
          <Scale selected={mine} labels={p.labels} beat="B" />
          {/* the rookie waits at their camp */}
          <ellipse cx={rookiePos.x} cy={rookiePos.y + 0.5} rx={9} ry={2} fill={INK} opacity={0.14} />
          <Figure as="g" x={rookiePos.x} y={rookiePos.y} size={48}
            facing={rookieAt !== null ? facingAt(rookieAt) : -1} carry={pace === 'proven' ? PackTag : undefined} />
          {/* you: a bronze outline, moved only by your tap */}
          <motion.g initial={false} animate={{ x: ghost.x, y: ghost.y, opacity: rather ? 0.3 : 1 }}
            transition={p.reduced ? { duration: 0 } : { duration: 0.42, ease: [0.16, 1, 0.3, 1] }}>
            <Figure as="g" variant="ghost" size={48} facing={ghostFacing} />
          </motion.g>
        </svg>
        {/* tap targets: each camp is its label row plus a 56px disc on the stop */}
        {CAMPS.map((c) => (
          <div key={c.id} aria-hidden onClick={() => !p.covered && choose(c.m, 'tap')}
            className="absolute cursor-pointer rounded-full"
            style={{ left: pct(c.x - 28, W), top: pct(c.y - 28, H), width: pct(56, W), height: pct(56, H) }} />
        ))}
        <div role="radiogroup" aria-label="Where you felt ready" onKeyDown={onKey}>
          {CAMPS.map((c) => (
            <button
              key={c.id}
              type="button"
              role="radio"
              aria-checked={mine === c.m}
              aria-label={p.labels[c.id]}
              tabIndex={tabStop(c.m)}
              disabled={p.covered}
              onClick={() => choose(c.m, 'tap')}
              className="absolute"
              style={{ left: 0, width: pct(LABEL_X + 12, W), top: pct(c.y - 22, H), height: pct(44, H), touchAction: 'manipulation' }}
              data-self-stop={c.m}
              data-testid={`s04-self-${c.m}`}
            />
          ))}
          <button
            type="button"
            role="radio"
            aria-checked={mine === 'notYet'}
            tabIndex={tabStop('notYet')}
            disabled={p.covered}
            onClick={() => choose('notYet', 'tap')}
            className="choice absolute flex items-center justify-center"
            data-on={mine === 'notYet'}
            style={{
              left: pct(NOT_YET.x, W), top: pct(NOT_YET.y, H), width: pct(NOT_YET.w, W), height: pct(NOT_YET.h, H),
              minHeight: 0, padding: 0, fontSize: 14, textAlign: 'center',
              background: mine === 'notYet' ? INK : 'rgba(248,247,244,0.92)', touchAction: 'manipulation',
            }}
            data-self-stop="notYet"
            data-testid="s04-self-notyet"
          >
            {p.labels.notyet}
          </button>
        </div>
      </Box>
    </Frame>
  )
}

/** The same switchback with nothing pictured at the stops (the self beat). */
function PlainTrack() {
  const ledge = { x0: mx(76), x1: mx(2), y: my(322) }
  return (
    <g>
      <path d={D} fill="none" stroke={RULE_SOFT} strokeWidth={7} strokeLinejoin="round" strokeLinecap="round" />
      <path d={D} fill="none" stroke={RULE} strokeWidth={1.25} strokeDasharray="3 4" strokeLinejoin="round" strokeLinecap="round" />
      <path d={`M ${ledge.x0 - 4} ${ledge.y} H ${ledge.x1 + 4}`} stroke={INK} strokeWidth={1.5} strokeLinecap="round" />
      {Array.from({ length: 6 }, (_, i) => ledge.x0 + 4 + i * 12).map((x) => (
        <path key={x} d={`M ${x} ${ledge.y + 5} l -4 5`} stroke={RULE} strokeWidth={1} />
      ))}
    </g>
  )
}
