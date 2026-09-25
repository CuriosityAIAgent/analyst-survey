/* The navigation kit (S05). Bricks are 72x30, all the same NAVY; the brick
   label is the only text allowed in art (Archivo).
   Ids that belong here (spec group "Navigation kit"):
     brick-map, brick-compass, brick-guidebook, brick-gps, brick-radio,
     brick-brief, baseplate, crate, route-layers, strap-kit
   route-layers takes value = precision 0-4 (none, pencil, dotted, waypoints,
   weather + timings), drawn in code. strap-kit takes data = BrickId[].

   Geometry the screens can align to is exported below: BRICK, PLATE, CRATE,
   routePoint(). Every brick is the same navy, the same weight and the same
   outline; only the instrument printed on its face differs.

   States:
     brick-*       state 'ghost'  pale outline (the carried-forward ghost in
                                  Once proven, and empty-slot previews)
     baseplate     data { heads?: [string, string] } draws head plaques with
                                  the lane names in Archivo; by default the
                                  20px head strip is left clear for the screen
     route-layers  value 0-4
     strap-kit     data BrickId[] (rung order is applied; unknown ids ignored) */
import type { ArtProps, ArtRegistry } from './kit'
import { ArtSvg, INK, PAPER, NAVY, FOREST, BRONZE, RULE, RULE_SOFT, STROKE } from './kit'

export const NAV_IDS = [
  'brick-map', 'brick-compass', 'brick-guidebook', 'brick-gps', 'brick-radio', 'brick-brief',
  'baseplate', 'crate', 'route-layers', 'strap-kit',
] as const

type BrickKey = 'map' | 'compass' | 'guidebook' | 'gps' | 'radio' | 'brief'
const RUNG_ORDER: BrickKey[] = ['map', 'compass', 'guidebook', 'gps', 'radio', 'brief']

/* ---------------------------------------------------------------- strokes */
const NS = 'non-scaling-stroke' as const
/** The 1.5px ink outline. */
const O = { stroke: INK, strokeWidth: STROKE, vectorEffect: NS, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const }
/** A 1px engraving line for inner detail. */
const H1 = { stroke: INK, strokeWidth: 1, vectorEffect: NS, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' }

/* ------------------------------------------------------------------ brick */
/** Brick geometry (72x30): four studs on top, the face below. */
export const BRICK = {
  w: 72, h: 30,
  /** Stud centres (x) and their tops (y). */
  studs: [9, 27, 45, 63], studTop: 1.6, studRx: 6, studRy: 1.9,
  /** The body: top of the top face, bottom of the brick. */
  bodyTop: 6.4, bottom: 29.2,
  /** The face where the instrument is printed. */
  face: { x: 4, y: 10, w: 64, h: 18 },
} as const

type Tone = { fill: string; line: string; paper: string; detail: string; dash?: string; band: string; bandOpacity: number }
const SOLID: Tone = { fill: NAVY, line: INK, paper: PAPER, detail: INK, band: PAPER, bandOpacity: 0.2 }
const GHOST: Tone = { fill: RULE_SOFT, line: RULE, paper: 'none', detail: RULE, dash: '3 2.5', band: RULE_SOFT, bandOpacity: 0 }

/** One stud: a short cylinder with an elliptical top and a flat highlight band. */
function Stud({ cx, t, y0 = BRICK.studTop, rx = BRICK.studRx, ry = BRICK.studRy, base = BRICK.bodyTop + 1.2, sw = STROKE }: {
  cx: number; t: Tone; y0?: number; rx?: number; ry?: number; base?: number; sw?: number
}) {
  const side = `M${cx - rx} ${y0} V${base} A${rx} ${ry} 0 0 0 ${cx + rx} ${base} V${y0}`
  return (
    <g>
      <path d={side} fill={t.fill} stroke={t.line} strokeWidth={sw} vectorEffect={NS} strokeLinejoin="round" strokeDasharray={t.dash} />
      {/* the flat highlight band down the lit side of the stud */}
      {t.bandOpacity > 0 && (
        <path d={`M${cx - rx * 0.62} ${y0 + ry * 0.7} V${base + ry * 0.62} L${cx - rx * 0.28} ${base + ry * 0.86} V${y0 + ry * 0.95} Z`}
          fill={t.band} opacity={t.bandOpacity + 0.12} />
      )}
      <ellipse cx={cx} cy={y0} rx={rx} ry={ry} fill={t.fill} stroke={t.line} strokeWidth={sw} vectorEffect={NS} strokeDasharray={t.dash} />
    </g>
  )
}

/** The bare 2x4 brick (no instrument), in the brick's own 72x30 units. */
function BrickBody({ t }: { t: Tone }) {
  const { bodyTop, bottom, w } = BRICK
  return (
    <g>
      {/* body */}
      <rect x={0.75} y={bodyTop} width={w - 1.5} height={bottom - bodyTop} rx={1.6}
        fill={t.fill} stroke={t.line} strokeWidth={STROKE} vectorEffect={NS} strokeDasharray={t.dash} />
      {/* the top face, seen just edge-on: a flat highlight band */}
      {t.bandOpacity > 0 && <rect x={1.6} y={bodyTop + 0.8} width={w - 3.2} height={2.2} fill={t.band} opacity={t.bandOpacity} />}
      <line x1={0.75} y1={bodyTop + 3.4} x2={w - 0.75} y2={bodyTop + 3.4} stroke={t.line} strokeWidth={1} vectorEffect={NS} strokeDasharray={t.dash} />
      {BRICK.studs.map((cx) => <Stud key={cx} cx={cx} t={t} />)}
    </g>
  )
}

/* The six instruments, printed on the face (centre about 36, 19). Paper
   objects with ink detail and one navy mark, so they read on the navy brick. */
function Instrument({ id, t }: { id: BrickKey; t: Tone }) {
  const P = { fill: t.paper, stroke: t.detail, strokeWidth: STROKE, vectorEffect: NS, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const, strokeDasharray: t.dash }
  const d1 = { ...H1, stroke: t.detail }
  const ghost = t.fill !== NAVY
  const mark = ghost ? RULE : NAVY
  switch (id) {
    case 'map':
      // a map folded in three, with a pencilled route and an X
      return (
        <g>
          <path d="M22.5 11.8 L31.5 13.8 L40.5 11.8 L49.5 13.8 L49.5 27.4 L40.5 25.4 L31.5 27.4 L22.5 25.4 Z" {...P} />
          <path d="M31.5 13.8 L40.5 11.8 L40.5 25.4 L31.5 27.4 Z" fill={ghost ? 'none' : RULE_SOFT} stroke="none" />
          <path d="M31.5 13.8 V27.4 M40.5 11.8 V25.4" {...d1} />
          <path d="M25 23.4 C27.5 18.5 30.5 17.2 33 20.4 S38.5 22.6 40.5 18.2 S43.8 16 45.2 17.4" fill="none" stroke={mark} strokeWidth={1.3} vectorEffect={NS} strokeDasharray="1.9 1.5" strokeLinecap="round" />
          <path d="M45.2 15.6 l2.4 2.4 M47.6 15.6 l-2.4 2.4" {...d1} strokeWidth={1.2} />
        </g>
      )
    case 'compass':
      // a baseplate compass: clear plate, travel arrow, housing and needle
      return (
        <g>
          <rect x={23} y={12.2} width={26} height={15.4} rx={2.2} {...P} />
          <path d="M26.6 25 V15.4 M24.9 17.3 L26.6 15.2 L28.3 17.3" {...d1} />
          <path d="M29.8 27.6 v-2 M31.8 27.6 v-1.2 M33.8 27.6 v-2 M35.8 27.6 v-1.2" {...d1} strokeWidth={0.9} />
          <circle cx={40.8} cy={19.6} r={6.4} {...P} />
          <path d="M40.8 13.2 v1.3 M40.8 26 v-1.3 M34.4 19.6 h1.3 M47.2 19.6 h-1.3" {...d1} strokeWidth={0.9} />
          <path d="M40.8 14.6 L42.3 19.6 L39.3 19.6 Z" fill={mark} stroke={t.detail} strokeWidth={0.9} vectorEffect={NS} strokeLinejoin="round" />
          <path d="M40.8 24.6 L42.3 19.6 L39.3 19.6 Z" fill={t.paper} stroke={t.detail} strokeWidth={0.9} vectorEffect={NS} strokeLinejoin="round" />
        </g>
      )
    case 'guidebook':
      // a bound guidebook, a peak on the cover, a ribbon marker hanging below
      return (
        <g>
          <path d="M44.2 11.6 L46.4 12.8 V27.4 L44.2 26.4 Z" {...P} />
          <path d="M44.9 15 V26.6 M45.7 15.4 V27" {...d1} strokeWidth={0.7} />
          <rect x={27.4} y={11} width={16.8} height={15.6} rx={1} {...P} />
          <rect x={27.4} y={11} width={3.6} height={15.6} fill={ghost ? 'none' : RULE_SOFT} stroke={t.detail} strokeWidth={STROKE} vectorEffect={NS} strokeDasharray={t.dash} />
          <path d="M27.8 14 h2.8 M27.8 23.6 h2.8" {...d1} strokeWidth={0.8} />
          <path d="M33 22 L36.6 15.8 L38.6 19.2 L39.8 17.6 L42.4 22 Z" fill={mark} stroke={t.detail} strokeWidth={0.9} vectorEffect={NS} strokeLinejoin="round" />
          <path d="M39.4 26.6 V29.4 L40.6 28.2 L41.8 29.4 V26.6" {...P} strokeWidth={1.1} />
        </g>
      )
    case 'gps':
      // a handheld unit with a stub antenna, a pin on the screen
      return (
        <g>
          <rect x={39.4} y={8.6} width={2.6} height={4.4} rx={1} {...P} strokeWidth={1.2} />
          <rect x={29.6} y={11.8} width={13.4} height={16.4} rx={2.6} {...P} />
          <rect x={31.8} y={14} width={9} height={7.8} rx={0.6} fill={ghost ? 'none' : RULE_SOFT} stroke={t.detail} strokeWidth={1} vectorEffect={NS} />
          <path d="M36.3 21 C34.3 18.8 33.9 17.9 33.9 17.2 A2.4 2.4 0 1 1 38.7 17.2 C38.7 17.9 38.3 18.8 36.3 21 Z" fill={mark} stroke={t.detail} strokeWidth={0.9} vectorEffect={NS} strokeLinejoin="round" />
          <circle cx={36.3} cy={17.2} r={0.8} fill={t.paper === 'none' ? 'none' : PAPER} />
          <path d="M34.4 24.7 h3.8 M36.3 23.4 v2.6" {...d1} />
        </g>
      )
    case 'radio':
      // a field radio, antenna up, a cloud on its screen
      return (
        <g>
          {!ghost && <path d="M42.6 15.2 L47.4 8.4" stroke={INK} strokeWidth={3.4} vectorEffect={NS} strokeLinecap="round" />}
          <path d="M42.6 15.2 L47.4 8.4" stroke={ghost ? t.detail : PAPER} strokeWidth={1.3} vectorEffect={NS} strokeLinecap="round" strokeDasharray={t.dash} />
          <circle cx={47.6} cy={8.2} r={1.5} fill={t.paper} stroke={t.detail} strokeWidth={1} vectorEffect={NS} />
          <rect x={23.6} y={15} width={22.2} height={13.2} rx={1.6} {...P} />
          <rect x={25.8} y={17.2} width={10.6} height={8.8} rx={0.6} fill={ghost ? 'none' : RULE_SOFT} stroke={t.detail} strokeWidth={1} vectorEffect={NS} />
          <path d="M28.2 23.4 h5.8 a1.5 1.5 0 0 0 0 -3 a2.2 2.2 0 0 0 -4.1 -0.6 a1.8 1.8 0 0 0 -1.7 3.6 Z" fill={mark} stroke={t.detail} strokeWidth={0.8} vectorEffect={NS} strokeLinejoin="round" />
          <path d="M39 18 V26.2 M41 18 V26.2 M43 18 V26.2" {...d1} strokeWidth={0.9} />
        </g>
      )
    case 'brief':
      // a clipboard: weather at the top, the route line, timings down the side
      return (
        <g>
          <rect x={27.6} y={11.6} width={17.4} height={16.8} rx={1.4} {...P} />
          <rect x={32.6} y={9.6} width={7.4} height={3.6} rx={1} fill={t.detail} />
          <circle cx={31.3} cy={16.2} r={1.5} fill={mark} stroke={t.detail} strokeWidth={0.8} vectorEffect={NS} />
          <path d="M34.4 17.4 h4 a1.1 1.1 0 0 0 0 -2.2 a1.6 1.6 0 0 0 -3 -0.4 a1.3 1.3 0 0 0 -1 2.6 Z" fill="none" stroke={t.detail} strokeWidth={0.8} vectorEffect={NS} strokeLinejoin="round" />
          <path d="M30.2 26 L33.2 22.6 L35.8 24.4 L38.8 20.6" fill="none" stroke={mark} strokeWidth={1.3} vectorEffect={NS} strokeDasharray="1.6 1.2" strokeLinecap="round" />
          <path d="M40.6 20.6 h2.6 M40.6 23 h2.6 M40.6 25.4 h2.6" {...d1} strokeWidth={0.9} />
        </g>
      )
  }
}

/** A navy 2x4 brick with its instrument, as a <g> in 72x30 units. Use this
    inside another SVG; <Art id="brick-*"> for a standalone brick. */
export function BrickG({ id, ghost, labelled, x = 0, y = 0, scale = 1 }: { id: BrickKey; ghost?: boolean; labelled?: boolean; x?: number; y?: number; scale?: number }) {
  const t = ghost ? GHOST : SOLID
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} data-brick={id}>
      <BrickBody t={t} />
      {labelled ? (
        <>
          {/* placed: the instrument moves to the left end, the short name
              (Archivo, the one text allowed in art) fills the face */}
          <g transform="translate(13 19.4) scale(0.66) translate(-36 -19.4)">
            <Instrument id={id} t={t} />
          </g>
          <text x={44} y={20.2} textAnchor="middle" dominantBaseline="middle" fontFamily="var(--font-ui), Archivo, Arial, sans-serif"
            fontSize={SHORT[id].length > 7 ? 8.2 : 9} fontWeight={600} letterSpacing="0.02em" fill={ghost ? RULE : PAPER}>
            {SHORT[id]}
          </text>
        </>
      ) : (
        <g transform="translate(36 19.4) scale(1.08) translate(-36 -19.4)">
          <Instrument id={id} t={t} />
        </g>
      )}
    </g>
  )
}

/** The short names printed on a placed brick's face. */
const SHORT: Record<BrickKey, string> = { map: 'Map', compass: 'Compass', guidebook: 'Guidebook', gps: 'GPS', radio: 'Radio', brief: 'Brief' }

const brick = (id: BrickKey) => (p: ArtProps) => (
  <ArtSvg vb={[BRICK.w, BRICK.h]} p={p}>
    <BrickG id={id} ghost={p.state === 'ghost'} labelled={p.state === 'label' || (p.data as { label?: boolean } | undefined)?.label === true} />
  </ArtSvg>
)

/* ------------------------------------------------------------- base plate */
/** Base-plate geometry (270x224): a lane head strip, then six stud rows per
    lane, rung 1 (map) at the bottom. A brick on rung r (1-6) in lane L sits
    at x = lane.x + (lane.w - 72) / 2, y = rowTop(r) + 2. */
export const PLATE = {
  w: 270, h: 224, head: 20, row: 34, rows: 6,
  lanes: { day1: { x: 4, w: 128 }, proven: { x: 138, w: 128 } },
  /** Top of the row that holds rung r (1 = bottom row). */
  rowTop: (r: number) => 20 + (6 - r) * 34,
} as const

/** The plate's fill: a light forest tint (about 12% forest on paper). */
export const PLATE_TINT = '#DEE2DE'
/** Stud x-centres in a lane: the brick's own pitch (18) and size, four per
    brick width, aligned so a placed brick sits exactly over four of them. */
function laneStuds(lane: { x: number; w: number }) {
  const bx = lane.x + (lane.w - BRICK.w) / 2
  return [-1, 0, 1, 2, 3, 4].map((j) => bx + BRICK.studs[0] + j * 18)
}

function Baseplate(p: ArtProps) {
  const heads = (p.data as { heads?: [string, string] } | undefined)?.heads
  const { lanes, head, row } = PLATE
  const studT: Tone = { fill: PLATE_TINT, line: FOREST, paper: PAPER, detail: FOREST, band: PAPER, bandOpacity: 0 }
  // two ledges with a gap between the lanes; the front (bottom) edge is
  // uneven rock, the back edge a little chipped
  const ledge = (x0: number, x1: number, seed: number) => {
    const top = [0, 0.3, 0.55, 0.8, 1].map((u, i) => `${(x0 + (x1 - x0) * u).toFixed(1)} ${(17.4 + ((i * 7 + seed) % 3) * 0.7).toFixed(1)}`)
    const front: string[] = []
    for (let i = 0; i <= 10; i++) {
      const u = i / 10
      const y = 219.5 + Math.sin(u * 9.1 + seed) * 1.6 + ((i * 5 + seed) % 3) * 0.9
      front.push(`${(x1 - (x1 - x0) * u).toFixed(1)} ${y.toFixed(1)}`)
    }
    return `M${top.join(' L')} L${x1 + 0.6} 60 L${x1 - 0.4} 150 L${front.join(' L')} L${x0 - 0.5} 150 L${x0 + 0.5} 60 Z`
  }
  return (
    <ArtSvg vb={[PLATE.w, PLATE.h]} p={p}>
      {/* the two ledges: light forest tint, forest outline, a gap between */}
      <path d={ledge(2, 133.2, 1)} fill={PLATE_TINT} stroke={FOREST} strokeWidth={STROKE} vectorEffect={NS} strokeLinejoin="round" />
      <path d={ledge(136.8, 268, 4)} fill={PLATE_TINT} stroke={FOREST} strokeWidth={STROKE} vectorEffect={NS} strokeLinejoin="round" />
      {/* lane heads: plaques only when the screen passes the words (S05
          sets its own labels over the head strip) */}
      {heads && (['day1', 'proven'] as const).map((k, i) => (
        <g key={k}>
          <rect x={lanes[k].x + 16} y={1.5} width={lanes[k].w - 32} height={head - 4} rx={1.5} fill={PAPER} {...O} />
          {heads?.[i] && (
            <text x={lanes[k].x + lanes[k].w / 2} y={1.5 + (head - 4) / 2 + 0.5} textAnchor="middle" dominantBaseline="middle"
              fontFamily="var(--font-ui), Archivo, Arial, sans-serif" fontSize={10} fontWeight={600} letterSpacing="0.06em" fill={INK}>
              {heads[i]}
            </text>
          )}
        </g>
      ))}
      {/* the stud grid: six rows 34 apart (one per rung, rung 1 at the
          bottom), studs the size and pitch of the bricks' own, so a placed
          brick covers exactly four */}
      {(['day1', 'proven'] as const).map((k) => (
        <g key={k}>
          {Array.from({ length: 6 }, (_, i) => {
            const yb = head + (i + 1) * row
            return laneStuds(lanes[k]).map((cx) => (
              <Stud key={`${i}-${cx}`} cx={cx} t={studT} y0={yb - 9.4} base={yb - 4.8} sw={1.2} />
            ))
          })}
        </g>
      ))}
    </ArtSvg>
  )
}

/* ------------------------------------------------------------------ crate */
/** Crate geometry (72x224): the same head strip as the plate, then an open
    crate the full height of the six rows. */
export const CRATE = { w: 72, h: 224, head: 20, inner: { x: 7, y: 26, w: 58, h: 190 } } as const

function Crate(p: ArtProps) {
  const top = CRATE.head
  return (
    <ArtSvg vb={[CRATE.w, CRATE.h]} p={p}>
      {/* the head strip stays clear: the screen sets "Not for them" there */}
      {/* horizontal boards with grain, a dark gap between each */}
      <rect x={3} y={top + 2} width={66} height={CRATE.h - top - 4} fill={RULE} />
      {Array.from({ length: 8 }, (_, i) => {
        const y = top + 3 + i * 25
        return (
          <g key={i}>
            <rect x={3} y={y} width={66} height={23} fill={PAPER} {...O} />
            <path d={`M12 ${y + 7 + (i % 3)} q14 -2 26 1 t24 -1 M16 ${y + 14 + (i % 2)} q10 1.6 22 0`} {...H1} stroke={RULE} />
          </g>
        )
      })}
      {/* the frame: two posts, three rails and a brace per bay, in bronze */}
      {[[top + 9, top + 93], [top + 102, CRATE.h - 10]].map(([y0, y1], i) => (
        <path key={i} d={`M8 ${y1 - 7} L8 ${y1} L14 ${y1} L64 ${y0 + 7} L64 ${y0} L58 ${y0} Z`} fill={BRONZE} {...O} />
      ))}
      <rect x={1} y={top} width={7} height={CRATE.h - top - 1} fill={BRONZE} {...O} />
      <rect x={64} y={top} width={7} height={CRATE.h - top - 1} fill={BRONZE} {...O} />
      {[top, top + 93, CRATE.h - 10].map((y, i) => (
        <rect key={i} x={1} y={y} width={70} height={9} fill={BRONZE} {...O} />
      ))}
      {/* nail heads */}
      {[top, top + 93, CRATE.h - 10].map((y) => [4.5, 67.5].map((x) => (
        <circle key={`${x}${y}`} cx={x} cy={y + 4.5} r={0.9} fill={PAPER} />
      )))}
    </ArtSvg>
  )
}

/* ----------------------------------------------------------- route layers */
/** The route ahead (360x60): one path, rising left to right. t in 0..1. */
export function routePoint(t: number): { x: number; y: number; angle: number } {
  const u = Math.max(0, Math.min(1, t))
  const f = (v: number) => ({
    x: 16 + v * 330,
    y: 50 - 36 * (v * 0.85 + 0.15 * v * v) + Math.sin(v * Math.PI * 3.1) * 4.2 * (1 - v * 0.5),
  })
  const a = f(u), b = f(Math.min(1, u + 0.002)), c = f(Math.max(0, u - 0.002))
  return { ...a, angle: Math.atan2(b.y - c.y, b.x - c.x) }
}
const ROUTE_D = (() => {
  const pts: string[] = []
  for (let i = 0; i <= 90; i++) {
    const { x, y } = routePoint(i / 90)
    pts.push(`${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`)
  }
  return pts.join(' ')
})()
/** A hand-held pencil line: the same route, wandering a little off it. */
const PENCIL_D = (() => {
  const pts: string[] = []
  for (let i = 0; i <= 45; i++) {
    const v = i / 45
    const { x, y } = routePoint(v)
    const wob = Math.sin(v * 17.3) * 1.6 + Math.sin(v * 41) * 0.7
    pts.push(`${i ? 'L' : 'M'}${x.toFixed(1)} ${(y + wob).toFixed(1)}`)
  }
  return pts.join(' ')
})()
const WAYPOINTS = [0.22, 0.46, 0.7, 0.94]

function Sun({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={2.6} fill={NAVY} stroke={INK} strokeWidth={1} vectorEffect={NS} />
      <path d={[0, 1, 2, 3, 4, 5, 6, 7].map((k) => {
        const a = (k * Math.PI) / 4
        return `M${(x + Math.cos(a) * 4).toFixed(2)} ${(y + Math.sin(a) * 4).toFixed(2)} L${(x + Math.cos(a) * 5.6).toFixed(2)} ${(y + Math.sin(a) * 5.6).toFixed(2)}`
      }).join(' ')} {...H1} />
    </g>
  )
}
function Cloud({ x, y }: { x: number; y: number }) {
  return (
    <path d={`M${x - 5} ${y + 2} h10 a2.4 2.4 0 0 0 0 -4.8 a3.4 3.4 0 0 0 -6.4 -1 a2.8 2.8 0 0 0 -3.6 5.8 Z`}
      fill={PAPER} stroke={INK} strokeWidth={1} vectorEffect={NS} strokeLinejoin="round" />
  )
}
function Wind({ x, y }: { x: number; y: number }) {
  return <path d={`M${x - 5} ${y - 1.5} h6 a1.6 1.6 0 1 0 -1.6 -1.6 M${x - 5} ${y + 1.5} h8.4 a1.6 1.6 0 1 1 -1.6 1.6`} {...H1} />
}
function Clock({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={3.2} fill={PAPER} stroke={INK} strokeWidth={1} vectorEffect={NS} />
      <path d={`M${x} ${y} V${y - 2.1} M${x} ${y} l1.5 0.9`} {...H1} strokeWidth={0.9} />
    </g>
  )
}

/** Route detail from the number of Day-one bricks (0-6): every brick adds
    something. Without data.n, value (precision 0-4) is used as before. */
function routeDetail(p: ArtProps) {
  const n = (p.data as { n?: number } | undefined)?.n
  if (typeof n === 'number') {
    const k = Math.max(0, Math.min(6, Math.round(n)))
    return {
      pencil: k === 1,
      dotted: k >= 2,
      waypoints: k >= 4 ? 4 : k === 3 ? 2 : 0,
      clocks: k >= 5,
      weather: k >= 6,
    }
  }
  const v = Math.max(0, Math.min(4, Math.round(p.value ?? 0)))
  return { pencil: v === 1, dotted: v >= 2, waypoints: v >= 3 ? 4 : 0, clocks: v >= 4, weather: v >= 4 }
}

function RouteLayers(p: ArtProps) {
  const d = routeDetail(p)
  // a paper under-stroke: whatever the scene draws behind (ridge, cloud)
  // stays behind the route
  const halo = (p.data as { halo?: string } | undefined)?.halo
  const wps = d.waypoints === 4 ? WAYPOINTS : d.waypoints === 2 ? [WAYPOINTS[0], WAYPOINTS[2]] : []
  return (
    <ArtSvg vb={[360, 60]} p={p}>
      {halo && (d.pencil || d.dotted) && (
        <path d={d.pencil ? PENCIL_D : ROUTE_D} fill="none" stroke={halo} strokeWidth={6} vectorEffect={NS} strokeLinecap="round" strokeLinejoin="round" />
      )}
      {d.pencil && (
        <path d={PENCIL_D} fill="none" stroke={RULE} strokeWidth={1.4} vectorEffect={NS} strokeLinecap="round" strokeLinejoin="round" data-precision="pencil" />
      )}
      {d.dotted && (
        <path d={ROUTE_D} fill="none" stroke={NAVY} strokeWidth={STROKE} vectorEffect={NS} strokeDasharray="4 4" strokeLinecap="round" data-precision={d.weather ? 'weather' : d.waypoints ? 'waypoints' : 'dotted'} />
      )}
      {wps.map((w) => {
        const { x, y, angle } = routePoint(w)
        const deg = (angle * 180) / Math.PI
        return (
          <g key={w} transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${deg.toFixed(1)})`}>
            <line x1={0} y1={-4.2} x2={0} y2={4.2} stroke={NAVY} strokeWidth={STROKE} vectorEffect={NS} strokeLinecap="round" />
            <circle r={1.9} fill={PAPER} stroke={NAVY} strokeWidth={STROKE} vectorEffect={NS} />
          </g>
        )
      })}
      {(d.clocks || d.weather) && (
        <g>
          {WAYPOINTS.map((w, i) => {
            const { x, y } = routePoint(w)
            const gx = x - 16, gy = y - 11
            return (
              <g key={w}>
                {d.weather && i === 0 && <Sun x={gx} y={gy} />}
                {d.weather && i === 1 && <Cloud x={gx} y={gy} />}
                {d.weather && i === 2 && <Wind x={gx} y={gy} />}
                {d.weather && i === 3 && <Sun x={gx} y={gy} />}
                {d.clocks && <Clock x={x + 1} y={y + 9.5} />}
              </g>
            )
          })}
        </g>
      )}
    </ArtSvg>
  )
}

/* -------------------------------------------------------------- strap kit */
function StrapKit(p: ArtProps) {
  const raw = Array.isArray(p.data) ? (p.data as string[]) : []
  const ids = RUNG_ORDER.filter((b) => raw.includes(b))
  // the strap runs down from the shoulder; bricks clip on alternately
  const pitch = 9.6
  const y0 = 32 - ((ids.length - 1) * pitch) / 2 - 4
  return (
    <ArtSvg vb={[64, 64]} p={p}>
      {/* a thin shoulder strap (ink), not a ladder: nothing shows when
          there are no bricks to clip on */}
      {ids.length > 0 && <path d="M30 -2 L34 -2 L33.6 66 L30.4 66 Z" fill={INK} />}
      {ids.map((id, i) => {
        const y = y0 + (ids.length - 1 - i) * pitch
        const left = i % 2 === 0
        const bx = left ? 8 : 34
        return (
          <g key={id}>
            {/* the clip: a small ring from strap to brick */}
            <ellipse cx={left ? 29 : 35} cy={y + 4} rx={2.4} ry={1.8} fill="none" stroke={INK} strokeWidth={1.2} vectorEffect={NS} />
            <MiniBrick x={bx} y={y} />
          </g>
        )
      })}
    </ArtSvg>
  )
}

/** A 22x9 brick with two studs, for small places (the strap, the kit rack). */
export function MiniBrick({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {[5.5, 16.5].map((cx) => (
        <g key={cx}>
          <path d={`M${cx - 3.2} 0.6 V2.6 A3.2 1 0 0 0 ${cx + 3.2} 2.6 V0.6`} fill={NAVY} stroke={INK} strokeWidth={1} vectorEffect={NS} />
          <ellipse cx={cx} cy={0.6} rx={3.2} ry={1} fill={NAVY} stroke={INK} strokeWidth={1} vectorEffect={NS} />
        </g>
      ))}
      <rect x={0} y={2.2} width={22} height={7} rx={0.8} fill={NAVY} stroke={INK} strokeWidth={1.2} vectorEffect={NS} />
      {/* the highlight band as a flat mix of paper into navy (no opacity: STYLE.md) */}
      <rect x={1} y={3} width={20} height={1.1} fill="#465264" />
    </g>
  )
}

export const NAV: ArtRegistry = {
  'brick-map': brick('map'),
  'brick-compass': brick('compass'),
  'brick-guidebook': brick('guidebook'),
  'brick-gps': brick('gps'),
  'brick-radio': brick('radio'),
  'brick-brief': brick('brief'),
  baseplate: Baseplate,
  crate: Crate,
  'route-layers': RouteLayers,
  'strap-kit': StrapKit,
}

