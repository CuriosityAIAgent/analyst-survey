/* Traits (S09). Draw the eight trait pictures last: until they are drawn S09
   runs on labelled tiles (the one planned fallback).
   Ids that belong here (spec group "Traits"):
     trait-reading, trait-hunter, trait-calm, trait-depth, trait-story,
     trait-bounce, trait-judgement, trait-curiosity, rope-clips, origin-seed,
     origin-bootprint
   rope-clips also serves F5's single clip. origin-seed and origin-bootprint
   share one finish so neither looks like the better answer.

   The eight traits are one set: 64x64, one accent (forest, which is also the
   rookie's jacket, so the figures need no second colour), a ground line at
   y 56 and about the same weight of ink each.

   States:
     rope-clips  value = number of clips (default 3; F5 uses 1)
                 data { filled?: boolean[] } closes the gate on filled clips
                 (open gates by default). Clip positions: ROPE_CLIPS_X(n). */
import type { ArtProps, ArtRegistry } from './kit'
import { ArtSvg, INK, PAPER, FOREST, BRONZE, RULE, RULE_SOFT, STROKE } from './kit'
import Figure from '../Figure'

export const TRAIT_IDS = [
  'trait-reading', 'trait-hunter', 'trait-calm', 'trait-depth', 'trait-story', 'trait-bounce',
  'trait-judgement', 'trait-curiosity', 'rope-clips', 'origin-seed', 'origin-bootprint',
] as const

const NS = 'non-scaling-stroke' as const
const O = { stroke: INK, strokeWidth: STROKE, vectorEffect: NS, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const }
const H1 = { stroke: INK, strokeWidth: 1, vectorEffect: NS, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' }
const V64: [number, number] = [64, 64]
const GY = 56

function Ground({ x0 = 6, x1 = 58 }: { x0?: number; x1?: number }) {
  return <line x1={x0} y1={GY} x2={x1} y2={GY} {...O} />
}

/** A single boot sole, toe up, in a 10x22 box centred at 0,0. */
function Sole({ fill, tread }: { fill: string; tread: string }) {
  return (
    <g>
      <path d="M0 -11 C4.6 -11 5.4 -6 5 -2 C4.7 1 3.2 2 3.2 3.6 L-3.2 3.6 C-3.2 2 -4.7 1 -5 -2 C-5.4 -6 -4.6 -11 0 -11 Z" fill={fill} {...O} />
      <path d="M-3.4 5.2 H3.4 L3 10 C2.6 11.4 -2.6 11.4 -3 10 Z" fill={fill} {...O} />
      <path d="M-3 -7 H3 M-3.6 -3.6 H3.6 M-3.2 -0.2 H3.2 M-2 7.8 H2" stroke={tread} strokeWidth={1.2} vectorEffect={NS} strokeLinecap="round" />
    </g>
  )
}

/* ------------------------------------------------------------ the eight */

/** Two figures crouched either side of a lantern, one leaning in. */
function Reading(p: ArtProps) {
  return (
    <ArtSvg vb={V64} p={p}>
      <Ground />
      <g transform={`rotate(9 17 ${GY})`}>
        <Figure as="g" pose="crouch" size={30} x={17} y={GY} axe={false} pack={false} />
      </g>
      <Figure as="g" pose="crouch" size={30} x={47} y={GY} facing={-1} axe={false} pack={false} />
      {/* the lantern */}
      <g transform={`translate(32 ${GY})`}>
        <path d="M-2.2 -13.4 a2.2 2.2 0 0 1 4.4 0" fill="none" {...O} strokeWidth={1} />
        <rect x={-3.4} y={-12} width={6.8} height={2.2} rx={0.6} fill={FOREST} {...O} strokeWidth={1.2} />
        <rect x={-2.8} y={-9.8} width={5.6} height={7.2} fill={PAPER} {...O} strokeWidth={1.2} />
        <path d="M0 -8 V-4.4" {...H1} />
        <rect x={-3.6} y={-2.6} width={7.2} height={2.6} rx={0.6} fill={FOREST} {...O} strokeWidth={1.2} />
      </g>
    </ArtSvg>
  )
}

/** A flag on a far ledge, bootprints heading to it. */
function Hunter(p: ArtProps) {
  const prints: [number, number, number, number][] = [
    [12, 52, 0.42, 38], [19, 48.5, 0.38, 32], [23, 43.6, 0.34, 40], [30, 40.6, 0.3, 34], [33, 35.8, 0.27, 42], [39, 33.2, 0.24, 36],
  ]
  return (
    <ArtSvg vb={V64} p={p}>
      {/* the slope up to the ledge */}
      <path d="M6 56 H26 C34 50 40 40 44 26 L58 26" fill="none" {...O} />
      <path d="M44 26 C46 30 50 32 58 32" {...H1} />
      <g {...H1} strokeWidth={0.8}>
        <path d="M48 28 l2 3 M52 28 l2 3.4 M56 28 l1.6 3" />
      </g>
      {/* the flag */}
      <line x1={50} y1={26} x2={50} y2={4} {...O} />
      <path d="M50 5 L62 9.4 L50 14.6 Z" fill={FOREST} {...O} />
      {/* bootprints, getting smaller as they climb */}
      {prints.map(([x, y, s, r], i) => (
        <g key={i} transform={`translate(${x} ${y}) rotate(${r + (i % 2 ? 8 : -8)}) scale(${s})`}>
          <path d="M0 -11 C4.6 -11 5.4 -6 5 -2 C4.7 1 3.2 2 3.2 3.6 L-3.2 3.6 C-3.2 2 -4.7 1 -5 -2 C-5.4 -6 -4.6 -11 0 -11 Z M-3.4 5.2 H3.4 L3 10 C2.6 11.4 -2.6 11.4 -3 10 Z" fill={INK} />
        </g>
      ))}
    </ArtSvg>
  )
}

/** A figure standing square in slanting snow. */
function Calm(p: ArtProps) {
  const streaks: [number, number][] = [
    [10, 10], [22, 6], [40, 8], [54, 12], [6, 22], [16, 28], [48, 22], [58, 30], [8, 40], [52, 40], [20, 44], [44, 48], [30, 4], [58, 48],
  ]
  return (
    <ArtSvg vb={V64} p={p}>
      <g stroke={INK} strokeWidth={1} vectorEffect={NS} strokeLinecap="round">
        {streaks.map(([x, y], i) => <line key={i} x1={x} y1={y} x2={x - 5.6} y2={y + 3.2} />)}
      </g>
      {/* a drift banked against the wind */}
      <path d="M6 56 C14 52 22 53 30 56" fill={PAPER} {...O} />
      <Ground />
      <Figure as="g" pose="stand" size={40} x={32} y={GY} />
    </ArtSvg>
  )
}

/** Rock strata in four layers. */
function Depth(p: ArtProps) {
  const wave = (y: number, a: number) => `M6 ${y} C18 ${y - a} 30 ${y + a} 42 ${y - a * 0.4} S54 ${y - a} 58 ${y}`
  return (
    <ArtSvg vb={V64} p={p}>
      {/* the outcrop: a block cut open to show its layers */}
      <path d="M6 56 V22 C14 16 22 18 30 14 C38 10 48 14 58 12 V56 Z" fill={PAPER} {...O} />
      <path d={wave(26, 3)} {...H1} strokeWidth={STROKE} />
      {/* layer 1: a few pebbles */}
      <g {...H1} strokeWidth={0.9}>
        <ellipse cx={16} cy={20.5} rx={1.6} ry={1} /><ellipse cx={34} cy={18} rx={1.4} ry={0.9} /><ellipse cx={48} cy={19} rx={1.8} ry={1.1} />
      </g>
      {/* layer 2: diagonal hatching */}
      <g {...H1} strokeWidth={0.8}>
        {Array.from({ length: 11 }, (_, i) => <path key={i} d={`M${9 + i * 4.6} ${29.6 + (i % 2) * 0.6} l2.6 4`} />)}
      </g>
      {/* layer 3: forest */}
      <path d={`${wave(36, 2.4)} L58 44 C54 42.6 48 45 42 43.6 C30 46 18 42 6 44 Z`} fill={FOREST} {...O} />
      {/* layer 4: dotted */}
      <g fill={INK}>
        {Array.from({ length: 16 }, (_, i) => <circle key={i} cx={9 + (i % 8) * 6.4 + (i > 7 ? 3 : 0)} cy={i > 7 ? 52.6 : 48.6} r={0.75} />)}
      </g>
    </ArtSvg>
  )
}

/** A bar chart whose top line becomes a footpath. */
function Story(p: ArtProps) {
  const bars: [number, number][] = [[8, 44], [17, 38], [26, 40], [35, 30]]
  return (
    <ArtSvg vb={V64} p={p}>
      <Ground />
      {bars.map(([x, y], i) => (
        <g key={x}>
          <rect x={x} y={y} width={6.4} height={GY - y} fill={i === 3 ? FOREST : PAPER} {...O} />
          {i < 3 && Array.from({ length: Math.floor((GY - y - 2) / 3.2) }, (_, k) => (
            <path key={k} d={`M${x + 1} ${y + 3.6 + k * 3.2} l4.4 -2.2`} stroke={INK} strokeWidth={0.8} vectorEffect={NS} />
          ))}
        </g>
      ))}
      {/* the line across the bar tops ... */}
      <path d="M11.2 44 L20.2 38 L29.2 40 L38.2 30" fill="none" {...O} />
      {bars.map(([x, y]) => <circle key={x} cx={x + 3.2} cy={y} r={1.4} fill={PAPER} {...O} strokeWidth={1.1} />)}
      {/* ... walks on as a footpath up to a cairn */}
      <path d="M38.2 30 C44 25 46 22 50 17 C52 14 54 12 55.5 10.4" fill="none" stroke={INK} strokeWidth={STROKE} vectorEffect={NS} strokeDasharray="2.4 2.4" strokeLinecap="round" />
      <g transform="translate(56.5 10.5)">
        <ellipse cx={0} cy={-1.4} rx={3.4} ry={1.5} fill={PAPER} {...O} strokeWidth={1.1} />
        <ellipse cx={0.2} cy={-4} rx={2.4} ry={1.2} fill={PAPER} {...O} strokeWidth={1.1} />
        <ellipse cx={0} cy={-6.2} rx={1.4} ry={0.9} fill={PAPER} {...O} strokeWidth={1.1} />
      </g>
    </ArtSvg>
  )
}

/** A rope catching a short fall at a carabiner. */
function Bounce(p: ArtProps) {
  return (
    <ArtSvg vb={V64} p={p}>
      {/* the wall */}
      <path d="M4 4 H18 L16 20 L20 34 L17 56 H4" fill={PAPER} {...O} />
      <g {...H1} strokeWidth={0.8}>
        {[10, 16, 24, 30, 38, 44, 50].map((y, i) => <path key={y} d={`M${6 + (i % 2) * 2} ${y} l5 -3`} />)}
      </g>
      {/* bolt, hanger and carabiner */}
      <circle cx={17.2} cy={14} r={1.4} fill={PAPER} {...O} strokeWidth={1.1} />
      <path d="M17.2 15.4 C22.2 14.6 24 18 23.8 21.6 C23.6 24.8 20.2 26 18.6 23.8 C17.4 22 17.6 18.2 17.2 15.4 Z" fill="none" {...O} />
      {/* the rope, taut to the climber */}
      <path d="M21.6 24.4 C26 31 30 34 36 35.6" fill="none" stroke={INK} strokeWidth={3.6} vectorEffect={NS} strokeLinecap="round" />
      <path d="M21.6 24.4 C26 31 30 34 36 35.6" fill="none" stroke={FOREST} strokeWidth={1.8} vectorEffect={NS} strokeLinecap="round" />
      {/* the short fall: a small arc of motion, and a catch */}
      <path d="M46 8 C48 13 48 18 46 22" {...H1} stroke={RULE} strokeDasharray="1.6 2" />
      <path d="M50 10 C52 15 52 20 50 24" {...H1} stroke={RULE} strokeDasharray="1.6 2" />
      <g transform="rotate(-24 38 36)">
        <Figure as="g" pose="stand" size={28} x={38} y={45} axe={false} facing={-1} />
      </g>
      <line x1={30} y1={GY} x2={58} y2={GY} {...O} />
    </ArtSvg>
  )
}

/** A balance scale, slightly tipped. */
function Judgement(p: ArtProps) {
  const tilt = 7
  const a = (tilt * Math.PI) / 180
  const L = 21
  const lx = 32 - Math.cos(a) * L, ly = 18 - Math.sin(a) * L
  const rx = 32 + Math.cos(a) * L, ry = 18 + Math.sin(a) * L
  const pan = (x: number, y: number, key: string) => (
    <g key={key}>
      <path d={`M${x} ${y} L${x - 7} ${y + 15} M${x} ${y} L${x + 7} ${y + 15}`} {...H1} />
      <path d={`M${x - 9} ${y + 15} H${x + 9} C${x + 8} ${y + 20} ${x - 8} ${y + 20} ${x - 9} ${y + 15} Z`} fill={PAPER} {...O} />
    </g>
  )
  return (
    <ArtSvg vb={V64} p={p}>
      {/* base and column */}
      <path d="M22 56 L26 50 H38 L42 56 Z" fill={FOREST} {...O} />
      <rect x={30.6} y={16} width={2.8} height={34} fill={PAPER} {...O} />
      {/* beam, tipped */}
      <line x1={lx} y1={ly} x2={rx} y2={ry} stroke={INK} strokeWidth={2.6} vectorEffect={NS} strokeLinecap="round" />
      <circle cx={32} cy={18} r={2.4} fill={FOREST} {...O} />
      <path d="M32 15.6 V11.4" {...O} />
      {pan(lx, ly, 'l')}
      {pan(rx, ry, 'r')}
      {/* what each pan holds: a small block and three counters */}
      <rect x={lx - 4} y={ly + 10.2} width={8} height={4.8} fill={FOREST} {...O} strokeWidth={1.1} />
      <g>
        {[0, 1, 2].map((i) => <ellipse key={i} cx={rx} cy={ry + 13.8 - i * 1.9} rx={4} ry={1.2} fill={PAPER} {...O} strokeWidth={1} />)}
      </g>
      <Ground x0={10} x1={54} />
    </ArtSvg>
  )
}

/** An unmapped corner of a map with one question-mark contour. */
function Curiosity(p: ArtProps) {
  return (
    <ArtSvg vb={V64} p={p}>
      <g transform="rotate(-4 32 32)">
        {/* the sheet, its top-right corner curling up */}
        <path d="M6 12 H48 L58 22 V54 H6 Z" fill={PAPER} {...O} />
        <path d="M48 12 L49 21.4 L58 22 Z" fill={RULE_SOFT} {...O} strokeWidth={1.1} />
        {/* the mapped part: contours and a forest wood */}
        <g {...H1}>
          <path d="M8 30 C14 26 22 28 24 34 C26 40 20 46 12 46 C9 46 8 44 8 42" />
          <path d="M8 36 C12 33 17 34 18 37.4 C19 41 15 42 11 41.6" />
          <path d="M8 22 C18 16 30 20 32 30 C34 40 30 48 26 54" />
        </g>
        {[[17, 52.4], [22.6, 51], [28.2, 52.6]].map(([x, y], i) => (
          <path key={i} d={`M${x} ${y - 6} L${x + 3.4} ${y} H${x - 3.4} Z`} fill={FOREST} {...O} strokeWidth={1.1} />
        ))}
        <g stroke={INK} strokeWidth={0.8} vectorEffect={NS} strokeLinecap="round">
          <path d="M8 16 l2 -2 M8 19.6 l4.8 -4.8 M11 20 l5.6 -5.6" />
        </g>
        {/* the blank corner, and one contour that asks a question */}
        <path d="M40 34 C39 27 44 24 48 25 C52.4 26 53.4 30.4 51 33 C49 35 46.6 35 46.6 38.4 V40" fill="none" {...O} />
        <circle cx={46.6} cy={44.4} r={1.4} fill={INK} />
      </g>
    </ArtSvg>
  )
}

/* ------------------------------------------------------------- the rope */
/** Clip x positions along the 360-wide rope for n clips. */
export function ROPE_CLIPS_X(n: number): number[] {
  if (n <= 1) return [180]
  return Array.from({ length: n }, (_, i) => 60 + (i * 240) / (n - 1))
}
/** The rope's y where a clip hangs. Carabiners run from here down 30px. */
export const ROPE_CLIP_Y = 26

function Carabiner({ x, closed }: { x: number; closed: boolean }) {
  // an offset D: straight spine on the left, the gate on the right
  const y = ROPE_CLIP_Y - 3
  const body = `M${x + 6.4} ${y + 7} C${x + 5} ${y - 1.5} ${x - 6} ${y - 1.5} ${x - 6} ${y + 5} L${x - 6} ${y + 22} C${x - 6} ${y + 31} ${x + 8.6} ${y + 31} ${x + 8.6} ${y + 22} L${x + 8.3} ${y + 19}`
  const gate = closed
    ? `M${x + 8.3} ${y + 19} L${x + 6.4} ${y + 7}`
    : `M${x + 8.3} ${y + 19} L${x + 1.8} ${y + 9.4}`
  return (
    <g data-clip={closed ? 'closed' : 'open'}>
      <path d={body} fill="none" stroke={INK} strokeWidth={4.6} vectorEffect={NS} strokeLinecap="round" strokeLinejoin="round" />
      <path d={body} fill="none" stroke={PAPER} strokeWidth={1.8} vectorEffect={NS} strokeLinecap="round" strokeLinejoin="round" />
      <path d={gate} stroke={INK} strokeWidth={2.4} vectorEffect={NS} strokeLinecap="round" />
    </g>
  )
}

function RopeClips(p: ArtProps) {
  const n = Math.max(1, Math.min(3, Math.round(p.value ?? 3)))
  const xs = ROPE_CLIPS_X(n)
  const filled = (p.data as { filled?: boolean[] } | undefined)?.filled ?? []
  // the rope: anchored at both ends, dipping a little at each clip
  const pts: [number, number][] = [[10, 12], ...xs.map((x) => [x, ROPE_CLIP_Y] as [number, number]), [350, 12]]
  let d = `M${pts[0][0]} ${pts[0][1]}`
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1], [x1, y1] = pts[i]
    const mx = (x0 + x1) / 2
    d += ` Q${mx} ${Math.max(y0, y1) + 3} ${x1} ${y1}`
  }
  return (
    <ArtSvg vb={[360, 80]} p={p}>
      {/* anchors: a bolt in a nub of rock at each end */}
      {[1, -1].map((dir) => (
        <g key={dir} transform={dir === 1 ? undefined : 'translate(360 0) scale(-1 1)'}>
          <path d="M0 2 L12 1 L17 8 L14 20 L0 23" fill={PAPER} {...O} />
          <path d="M3 17 l4 -3 M3 21 l5 -4" {...O} strokeWidth={0.8} />
          <circle cx={10} cy={12} r={2.2} fill={PAPER} {...O} />
        </g>
      ))}
      <path d={d} fill="none" stroke={INK} strokeWidth={5.2} vectorEffect={NS} strokeLinecap="round" />
      <path d={d} fill="none" stroke={BRONZE} strokeWidth={2.6} vectorEffect={NS} strokeLinecap="round" />
      <path d={d} fill="none" stroke={PAPER} strokeWidth={1} vectorEffect={NS} strokeDasharray="1.2 5" opacity={0.7} />
      {xs.map((x, i) => <Carabiner key={x} x={x} closed={!!filled[i]} />)}
    </ArtSvg>
  )
}

/* ------------------------------------------------------------ the origins */
/** The two swipe-edge glyphs share one finish: forest fill, ink outline,
    paper detail, the same tilt and the same footprint. */
function OriginSeed(p: ArtProps) {
  return (
    <ArtSvg vb={V64} p={p}>
      <g transform="translate(32 32) rotate(-18)">
        <path d="M0 -19 C8 -16 12.4 -4 11.6 5 C11 14 5.6 19.6 0 19.6 C-5.6 19.6 -11 14 -11.6 5 C-12.4 -4 -8 -16 0 -19 Z" fill={FOREST} {...O} />
        <path d="M-1 -14 C3.6 -6 4 6 0.4 15" fill="none" stroke={PAPER} strokeWidth={1.4} vectorEffect={NS} strokeLinecap="round" />
        <ellipse cx={-4.4} cy={12.4} rx={1.6} ry={2.4} transform="rotate(20 -4.4 12.4)" fill="none" stroke={PAPER} strokeWidth={1.2} vectorEffect={NS} />
      </g>
    </ArtSvg>
  )
}

function OriginBootprint(p: ArtProps) {
  return (
    <ArtSvg vb={V64} p={p}>
      <g transform="translate(32 32) rotate(-18) scale(1.92)">
        <Sole fill={FOREST} tread={PAPER} />
      </g>
    </ArtSvg>
  )
}

export const TRAITS: ArtRegistry = {
  'trait-reading': Reading,
  'trait-hunter': Hunter,
  'trait-calm': Calm,
  'trait-depth': Depth,
  'trait-story': Story,
  'trait-bounce': Bounce,
  'trait-judgement': Judgement,
  'trait-curiosity': Curiosity,
  'rope-clips': RopeClips,
  'origin-seed': OriginSeed,
  'origin-bootprint': OriginBootprint,
}
