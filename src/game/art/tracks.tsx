/* Tracks. Ids that belong here (spec group "Tracks"):
     track-switchback, track-ridge, bootprints
   bootprints takes state 'solid' (walked, ink) | 'ghost' (pencil).
   track-switchback takes state 'plain' (S04 Beat B: the track and pads only,
   no tents, cairn or tag). The
   slider paths themselves live in the screens (RouteSlider d=...); these are
   the drawn terrain under them, so export the path data you draw along if a
   screen should reuse it.

   Geometry exports, so a slider lies exactly on the drawing:
     SWITCHBACK  viewBox 200x340. `d` runs from the trailhead ledge (t = 0,
                 where the rookie parks) up seven equal legs; every leg is six
                 months, so the stop fractions are exact: m12 1/7 ... m36 5/7,
                 then two legs (a hairpin) to m48 at 7/7. `provenTag` is the
                 brass tag's box, for the 'When proven' tap target and label;
                 `today` is the cairn at 36 (label it 'Today' in the screen).
     RIDGE       viewBox 360x120. `d` runs along the crest from r1 to r5;
                 `stops[].at` are exact length fractions. `parked` is the
                 starting ledge, well below the crest and below the stop
                 labels, offset between the first two stops, so it reads
                 as a start and never as a stop (it overflows the viewBox).
     Bootprint   one print as a <g>, for strips and slider trails. */
import type { ArtProps, ArtRegistry } from './kit'
import { ArtSvg, INK, PAPER, RULE, RULE_SOFT, STROKE, BRONZE } from './kit'

export const TRACK_IDS = ['track-switchback', 'track-ridge', 'bootprints'] as const

const O = { stroke: INK, strokeWidth: STROKE, vectorEffect: 'non-scaling-stroke', strokeLinejoin: 'round', strokeLinecap: 'round' } as const
const HI = { stroke: INK, strokeWidth: 1, vectorEffect: 'non-scaling-stroke', strokeLinecap: 'round', fill: 'none' } as const
const HR = { stroke: RULE, strokeWidth: 1, vectorEffect: 'non-scaling-stroke', strokeLinecap: 'round', fill: 'none' } as const

type Pt = { x: number; y: number }
/** Stops placed by exact length fraction along a polyline. */
function polyline(pts: Pt[]) {
  const seg = pts.slice(1).map((p, i) => Math.hypot(p.x - pts[i].x, p.y - pts[i].y))
  const total = seg.reduce((s, l) => s + l, 0)
  const cum = [0]
  seg.forEach((l) => cum.push(cum[cum.length - 1] + l))
  return {
    d: pts.map((p, i) => `${i ? 'L' : 'M'}${p.x} ${p.y}`).join(''),
    at: (i: number) => cum[i] / total,
    length: total,
  }
}

/* ------------------------------------------------------------ switchback */
const SB_L = 44, SB_R = 156
const SB_PTS: Pt[] = [
  // camps 44 apart vertically, so every stop's tap row is 44px at 1:1
  { x: SB_L, y: 322 }, // trailhead
  { x: SB_R, y: 280 }, // m12
  { x: SB_L, y: 236 }, // m18
  { x: SB_R, y: 192 }, // m24
  { x: SB_L, y: 148 }, // m30
  { x: SB_R, y: 104 }, // m36
  { x: SB_L, y: 70 }, //  hairpin (the long year)
  { x: SB_R, y: 36 }, //  m48
]
const sb = polyline(SB_PTS)
const SB_STOP_IDX: [string, number][] = [['m12', 1], ['m18', 2], ['m24', 3], ['m30', 4], ['m36', 5], ['m48', 7]]

export const SWITCHBACK = {
  viewBox: [200, 340] as [number, number],
  d: sb.d,
  length: sb.length,
  stops: SB_STOP_IDX.map(([id, i]) => ({ id, at: sb.at(i), x: SB_PTS[i].x, y: SB_PTS[i].y })),
  parked: { x: SB_PTS[0].x, y: SB_PTS[0].y },
  /** The brass 'When proven' tag: tap target and label anchor. */
  provenTag: { x: 12, y: 30, w: 30, h: 26 },
  /** The small cairn at 36 months. */
  today: { x: 188, y: 104 },
}

function Tent({ x, y, flip }: { x: number; y: number; flip?: boolean }) {
  // an A-frame on the ground at (x, y), 18 wide, 13 tall; the door faces the path
  const s = flip ? -1 : 1
  return (
    <g transform={`translate(${x} ${y}) scale(${s} 1)`}>
      <path d="M-9 0L-1 -13h2L9 0z" fill={PAPER} {...O} />
      <path d="M-9 0L0 -13" {...HI} />
      <path d="M-5 0L-0.6 -8.6 2.6 0z" fill={INK} />
      <path d="M0 -13l-1.4 -3.2" {...HI} />
    </g>
  )
}

function Cairn({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx={0} cy={-2.2} rx={6} ry={2.2} fill={RULE_SOFT} {...O} />
      <ellipse cx={0.4} cy={-6.2} rx={4.4} ry={1.9} fill={RULE_SOFT} {...O} />
      <ellipse cx={-0.2} cy={-9.6} rx={3} ry={1.6} fill={RULE_SOFT} {...O} />
      <ellipse cx={0.2} cy={-12.4} rx={1.8} ry={1.2} fill={RULE_SOFT} {...O} />
    </g>
  )
}

function Switchback(p: ArtProps) {
  const { stops, provenTag: t } = SWITCHBACK
  const plain = p.state === 'plain' // S04 Beat B: no pictures at the stops
  return (
    <ArtSvg vb={SWITCHBACK.viewBox} p={p}>
      {/* the cut bank under each leg: short fall-line hachure, as on a survey map */}
      <g {...HR}>
        {SB_PTS.slice(1).map((q, i) => {
          const p0 = SB_PTS[i]
          const n = 6
          return Array.from({ length: n }).map((_, k) => {
            const u = (k + 1) / (n + 1)
            const x = p0.x + (q.x - p0.x) * u
            const y = p0.y + (q.y - p0.y) * u
            return <path key={`${i}-${k}`} d={`M${x} ${y + 6}l-1 ${k % 2 ? 5 : 7}`} />
          })
        })}
      </g>
      {/* the trail: a worn bed, with a pencil line the rookie's steps ink over */}
      <path d={sb.d} fill="none" stroke={RULE_SOFT} strokeWidth={7} strokeLinejoin="round" strokeLinecap="round" />
      <path d={sb.d} fill="none" stroke={RULE} strokeWidth={1.25} strokeDasharray="3 4" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      {/* trailhead ledge, below the scale */}
      <path d="M2 322h66l8 6-4 6H6l-5-5z" fill={PAPER} {...O} />
      <path d="M12 328l5 5M24 328l5 5M36 328l5 5M48 328l5 5M60 328l5 5" {...HI} />
      {/* six camps: a tent on the outside of each stop's bend, a flat pad under the stop */}
      {stops.map((s) => {
        const right = s.x === SB_R
        return (
          <g key={s.id} data-stop={s.id}>
            <path d={`M${s.x - 7} ${s.y + 1.5}h14`} {...O} />
            {!plain && <Tent x={right ? s.x + 18 : s.x - 18} y={s.y} flip={!right} />}
          </g>
        )
      })}
      {/* the cairn at 36 months ('Today', labelled by the screen) */}
      {!plain && <Cairn x={SWITCHBACK.today.x} y={SWITCHBACK.today.y} />}
      {/* the brass 'When proven' tag, hung on a stake beside the track */}
      {!plain && <g>
        <path d={`M${t.x + 3} ${t.y + t.h + 20}V${t.y - 4}`} {...O} />
        <path d={`M${t.x + 3} ${t.y}l6 4`} {...HI} />
        <path d={`M${t.x + 8} ${t.y + 4}h${t.w - 12}l4 ${t.h / 2 - 4}-4 ${t.h / 2 - 4}h-${t.w - 12}z`}
          fill={BRONZE} {...O} />
        <circle cx={t.x + 12.4} cy={t.y + t.h / 2} r={2} fill={PAPER} {...O} />
        <path d={`M${t.x + 18} ${t.y + t.h / 2 - 3}h9M${t.x + 18} ${t.y + t.h / 2 + 2}h6`} stroke={PAPER} strokeWidth={1} vectorEffect="non-scaling-stroke" strokeLinecap="round" />
      </g>}
    </ArtSvg>
  )
}

/* ------------------------------------------------------------ ridge */
const RIDGE_PTS: Pt[] = [
  { x: 44, y: 58 }, { x: 78, y: 61 }, { x: 112, y: 57 }, { x: 146, y: 61 }, { x: 180, y: 58 },
  { x: 214, y: 61 }, { x: 248, y: 57 }, { x: 282, y: 61 }, { x: 316, y: 58 },
]
const rg = polyline(RIDGE_PTS)
export const RIDGE = {
  viewBox: [360, 120] as [number, number],
  d: rg.d,
  length: rg.length,
  stops: (['r1', 'r2', 'r3', 'r4', 'r5'] as const).map((id, k) => ({
    id, value: k + 1, at: rg.at(k * 2), x: RIDGE_PTS[k * 2].x, y: RIDGE_PTS[k * 2].y,
  })),
  /** Where 'you' wait, unset: a starting ledge below the label row, offset
      between the first two stops (it sits below the 120 viewBox). */
  parked: { x: 78, y: 216 },
}

function Ridge(p: ArtProps) {
  const crest = `M2 66L20 61${rg.d.replace('M', 'L')}L340 61L358 66`
  return (
    <ArtSvg vb={RIDGE.viewBox} p={p}>
      {/* the face under the crest: engraved hachure, no fill (the scene shows through) */}
      <g {...HR}>
        {Array.from({ length: 50 }).map((_, i) => {
          const x = 7 + i * 7
          const len = 4 + Math.round(2.5 + 2.5 * Math.sin(i * 1.7) + 2 * Math.sin(i * 0.53))
          return <path key={i} d={`M${x} ${64 + (i % 2) * 1.5}l-1.6 ${len}`} />
        })}
      </g>
      <path d={crest} fill="none" {...O} />
      {/* five stops: a flat stance on the crest */}
      {RIDGE.stops.map((s) => (
        <g key={s.id} data-stop={s.id}>
          <path d={`M${s.x - 7} ${s.y}h14`} stroke={INK} strokeWidth={2.4} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          <path d={`M${s.x} ${s.y + 2}v5`} {...HI} />
        </g>
      ))}
      {/* the starting ledge, below the stop labels and between two stops,
          where the figure parks: a rock shelf, not a stop */}
      <g transform={`translate(${RIDGE.parked.x} ${RIDGE.parked.y})`}>
        <path d="M-38 0h70l6 3.4-4 4.6H-36l-5-4.4z" fill={PAPER} {...O} />
        <path d="M-32 4l3 3M-20 4l3 3M-8 4l3 3M4 4l3 3M16 4l3 3M28 4l3 3" {...HI} />
        <path d="M-41 3.6 C-60 10 -90 12 -120 12" {...HR} />
      </g>
    </ArtSvg>
  )
}

/* ------------------------------------------------------------ bootprints */
/** One boot print, toe up, 22 units long, centred at (0,0). `side` -1 = left. */
export function Bootprint({ x = 0, y = 0, angle = 0, scale = 1, side = 1, ghost = false }: {
  x?: number; y?: number; angle?: number; scale?: number; side?: 1 | -1; ghost?: boolean
}) {
  const sole = 'M0 -11C5 -11 6.2 -4 5.2 1.4H-5C-6 -4 -5 -11 0 -11Z'
  const heel = 'M-4.4 4.2H4.6L4 10Q0 12.2-4 10Z'
  const paint = ghost
    ? { fill: 'none', stroke: RULE, strokeWidth: 1, strokeDasharray: '2 1.6', vectorEffect: 'non-scaling-stroke' as const }
    : { fill: INK, stroke: 'none' }
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle}) scale(${scale * side} ${scale})`}>
      <path d={sole} {...paint} />
      <path d={heel} {...paint} />
      {!ghost && <path d="M-3 -7.4h5.4M-4 -3.6h7.6M-4 -.4h7.6M-2.8 7h5.4" stroke={PAPER} strokeWidth={1} vectorEffect="non-scaling-stroke" strokeLinecap="round" />}
    </g>
  )
}

function Bootprints(p: ArtProps) {
  const ghost = p.state === 'ghost'
  return (
    <ArtSvg vb={[64, 64]} p={p}>
      <Bootprint x={24} y={40} angle={-6} side={-1} ghost={ghost} scale={1.05} />
      <Bootprint x={40} y={24} angle={6} ghost={ghost} scale={1.05} />
    </ArtSvg>
  )
}

export const TRACKS: ArtRegistry = {
  'track-switchback': Switchback,
  'track-ridge': Ridge,
  bootprints: Bootprints,
}
