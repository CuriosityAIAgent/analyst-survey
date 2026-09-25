/* Storm-call cards (S07): art 200px inside a 300x300 card.
   Ids that belong here (spec group "Storm calls"):
     card-certify, card-aiclient, card-agents, card-freedtime, snow-overlay
   snow-overlay takes value = density 0-4 (hachure streaks, drawn in code).

   The four cards are drawn on a 200x200 grid (one unit = one px at the card's
   200px art size), share one accent (bronze) and carry about the same weight
   of ink, so no call looks like the better answer. Situations only: no
   badges, no trophies, no faces. The rookie on card-agents is Figure.tsx in
   its own forest jacket (the character's colour, not an accent choice). */
import type { ArtProps, ArtRegistry } from './kit'
import { ArtSvg, INK, PAPER, BRONZE, RULE, RULE_SOFT, STROKE } from './kit'
import Figure, { skeleton } from '../Figure'

export const CARD_IDS = ['card-certify', 'card-aiclient', 'card-agents', 'card-freedtime', 'snow-overlay'] as const

const NS = 'non-scaling-stroke' as const
const O = { stroke: INK, strokeWidth: STROKE, vectorEffect: NS, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const }
const H1 = { stroke: INK, strokeWidth: 1, vectorEffect: NS, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' }
const VB: [number, number] = [200, 200]

/** The ground every card stands on: a hairline with a few engraved ticks. */
function Ground({ y = 178, x0 = 18, x1 = 182 }: { y?: number; x0?: number; x1?: number }) {
  return (
    <g>
      <line x1={x0} y1={y} x2={x1} y2={y} {...O} />
      <path d={`M${x0 + 8} ${y + 5} h10 M${x0 + 40} ${y + 8} h16 M${x1 - 60} ${y + 5} h12 M${x1 - 26} ${y + 9} h14`} {...H1} stroke={RULE} />
    </g>
  )
}

/* ------------------------------------------------------------ certify */
/** A closed meeting-room door with a small blank brass plaque. Exported so
    fu-plaque can crop to the same plaque. */
export const PLAQUE = { x: 84, y: 56, w: 32, h: 14 } as const

function Certify(p: ArtProps) {
  return (
    <ArtSvg vb={VB} p={p}>
      {/* skirting either side of the frame */}
      <g {...H1} stroke={RULE}>
        <path d="M20 168 H54 M146 168 H180" />
      </g>
      {/* frame */}
      <rect x={54} y={20} width={92} height={158} fill={PAPER} {...O} />
      {/* the jamb reveal, hatched for depth */}
      <path d="M60 26 H140 V178 M60 26 V178" {...H1} />
      <g {...H1} strokeWidth={0.8}>
        {Array.from({ length: 15 }, (_, i) => <path key={i} d={`M54.8 ${34 + i * 10} l4.8 -4`} />)}
      </g>
      {/* door leaf */}
      <rect x={64} y={30} width={72} height={148} fill={PAPER} {...O} />
      <rect x={74} y={42} width={52} height={50} rx={1} {...H1} />
      <rect x={74} y={104} width={52} height={62} rx={1} {...H1} />
      <path d="M77 45 H123 M77 107 H123" {...H1} stroke={RULE} />
      {/* hinges */}
      <rect x={62.5} y={46} width={3.4} height={12} rx={1} fill={RULE_SOFT} {...O} strokeWidth={1} />
      <rect x={62.5} y={150} width={3.4} height={12} rx={1} fill={RULE_SOFT} {...O} strokeWidth={1} />
      {/* lever handle */}
      <circle cx={126} cy={112} r={4} fill={PAPER} {...O} />
      <rect x={110} y={110} width={16} height={4.4} rx={2.2} fill={PAPER} {...O} />
      <rect x={124.4} y={119} width={3.2} height={5} rx={1} {...H1} />
      {/* the blank brass plaque */}
      <rect x={PLAQUE.x} y={PLAQUE.y} width={PLAQUE.w} height={PLAQUE.h} rx={1.5} fill={BRONZE} {...O} />
      <circle cx={PLAQUE.x + 3.4} cy={PLAQUE.y + PLAQUE.h / 2} r={1.1} fill={PAPER} />
      <circle cx={PLAQUE.x + PLAQUE.w - 3.4} cy={PLAQUE.y + PLAQUE.h / 2} r={1.1} fill={PAPER} />
      <Ground />
    </ArtSvg>
  )
}

/* ------------------------------------------------------------ AI clients */
/** Split frame: an indoor climbing wall on the left, real rock on the right. */
function AiClient(p: ArtProps) {
  // bolt-on holds on the wall panel (bronze), placed by hand
  const holds: [number, number, number, number][] = [
    [40, 150, 7, 10], [62, 132, -8, 8], [44, 110, 20, 9], [70, 92, -15, 7], [48, 74, 30, 8], [72, 56, 5, 9], [54, 40, -25, 7],
  ]
  const hold = (x: number, y: number, rot: number, s: number, k: number) => (
    <g key={k} transform={`translate(${x} ${y}) rotate(${rot})`}>
      <path d={`M${-s} ${s * 0.2} C${-s} ${-s * 0.7} ${-s * 0.2} ${-s * 0.8} ${s * 0.4} ${-s * 0.6} C${s} ${-s * 0.4} ${s * 1.05} ${s * 0.5} ${s * 0.4} ${s * 0.7} C${-s * 0.2} ${s * 0.9} ${-s} ${s * 0.8} ${-s} ${s * 0.2} Z`}
        fill={BRONZE} {...O} />
      <circle r={1.2} fill={PAPER} />
    </g>
  )
  return (
    <ArtSvg vb={VB} p={p}>
      {/* the frame, split down the middle */}
      <rect x={20} y={24} width={160} height={154} fill={PAPER} {...O} />
      <line x1={100} y1={24} x2={100} y2={178} {...O} />
      {/* left: plywood panels, a grid of T-nuts, bolt-on holds */}
      <path d="M20 101 H100" {...H1} stroke={RULE} />
      <g fill={RULE}>
        {Array.from({ length: 6 }, (_, r) => Array.from({ length: 4 }, (_, c) => (
          <circle key={`${r}${c}`} cx={32 + c * 19} cy={34 + r * 26} r={0.9} />
        )))}
      </g>
      {holds.map(([x, y, r, s], i) => hold(x, y, r, s, i))}
      {/* right: real rock, a buttress against the sky, engraved */}
      <path d="M100 178 V70 L110 62 L118 66 L126 50 L136 54 L146 40 L158 46 L166 36 L180 42 V178 Z" fill={PAPER} {...O} />
      <path d="M126 50 L124 72 L132 96 L128 120 L134 150 L132 178" {...H1} />
      <path d="M158 46 L160 70 L154 92 L162 118 L158 146" {...H1} />
      <path d="M100 104 C108 100 116 104 124 100 M132 96 C142 92 148 96 156 92 M100 138 C110 134 120 138 130 134 M134 150 C146 146 154 150 166 146" {...H1} />
      <g {...H1} strokeWidth={0.8}>
        {Array.from({ length: 5 }, (_, i) => <path key={`a${i}`} d={`M${102 + i * 4.4} ${106 + (i % 2)} l3 6`} />)}
        {Array.from({ length: 5 }, (_, i) => <path key={`b${i}`} d={`M${134 + i * 4.4} ${98 + (i % 2)} l3 6`} />)}
        {Array.from({ length: 6 }, (_, i) => <path key={`c${i}`} d={`M${102 + i * 4.6} ${140 + (i % 2)} l3 6`} />)}
        {Array.from({ length: 6 }, (_, i) => <path key={`d${i}`} d={`M${136 + i * 4.8} ${152 + (i % 2)} l3 6`} />)}
        {Array.from({ length: 9 }, (_, i) => <path key={`e${i}`} d={`M${162 + (i % 3) * 5} ${56 + i * 10} l4 5`} />)}
      </g>
      <Ground x0={12} x1={188} />
    </ArtSvg>
  )
}

/* ------------------------------------------------------------- agents */
/** The rookie with a clipboard, three field radios on the belt. */
function Agents(p: ArtProps) {
  const size = 132
  const s = size / 26
  const fx = 96
  const fy = 178
  const k = skeleton('stand')
  const radio = (x: number, i: number) => (
    <g key={i} transform={`translate(${x} ${k.hip.y - 0.1})`}>
      <line x1={0.9} y1={0} x2={1.2} y2={-2.6} stroke={INK} strokeWidth={1.3} vectorEffect={NS} strokeLinecap="round" />
      <rect x={-0.9} y={-0.2} width={2.3} height={3.1} rx={0.35} fill={BRONZE} stroke={INK} strokeWidth={1.3} vectorEffect={NS} />
      <rect x={-0.45} y={0.35} width={1.4} height={0.9} fill={PAPER} />
    </g>
  )
  return (
    <ArtSvg vb={VB} p={p}>
      {/* a tent behind, small, so the figure stands at a camp */}
      <path d="M22 178 L46 136 L70 178 Z" fill={PAPER} {...O} />
      <path d="M46 136 L46 178 M40 178 L46 158 L52 178" {...H1} />
      <path d="M150 178 l10 -16 l6 8 l4 -5 l8 13" fill={PAPER} {...O} />
      <Figure as="g" variant="rookie" pose="stand" size={size} x={fx} y={fy} axe={false}
        hand={
          <g transform="rotate(-12)">
            <rect x={-0.6} y={-4.2} width={4.2} height={5.4} rx={0.4} fill={PAPER} stroke={INK} strokeWidth={1.4} vectorEffect={NS} />
            <rect x={0.8} y={-4.8} width={1.4} height={0.9} rx={0.2} fill={INK} />
            <path d="M0.2 -2.8 h2.6 M0.2 -1.6 h2.6 M0.2 -0.4 h1.8" stroke={INK} strokeWidth={0.8} vectorEffect={NS} />
          </g>
        } />
      {/* belt and three radios, in the figure's own units */}
      <g transform={`translate(${fx} ${fy}) scale(${s})`}>
        <line x1={-2.6} y1={k.hip.y - 0.3} x2={2.6} y2={k.hip.y - 0.3} stroke={INK} strokeWidth={1.6} vectorEffect={NS} strokeLinecap="round" />
        {[-3.4, -0.9, 1.6].map((x, i) => radio(x, i))}
      </g>
      <Ground />
    </ArtSvg>
  )
}

/* ------------------------------------------------------------ freed time */
/** A bronze sun disc over two paths: one to a ledger with extra ribbons, one
    to a practice boulder. Both destinations drawn to the same weight. */
function FreedTime(p: ArtProps) {
  return (
    <ArtSvg vb={VB} p={p}>
      {/* sun disc, half risen behind the far ridge */}
      <path d="M68 74 A32 32 0 0 1 132 74 Z" fill={BRONZE} {...O} />
      <path d="M18 74 C40 68 54 76 68 74 M132 74 C148 70 164 76 182 72" {...H1} />
      <g {...H1} stroke={RULE}>
        <path d="M100 32 V22 M73 43 L67 36 M127 43 L133 36 M58 60 L50 56 M142 60 L150 56" />
      </g>
      {/* the fork: one footpath splitting in two */}
      <g fill="none" stroke={INK} strokeWidth={STROKE} vectorEffect={NS} strokeDasharray="5 4" strokeLinecap="round">
        <path d="M100 178 V168" />
        <path d="M100 168 C92 162 72 162 56 158" />
        <path d="M100 168 C108 162 128 162 146 160" />
      </g>
      {/* left: the ledger, standing, with extra ribbons */}
      <g transform="translate(36 96) scale(1.3)">
        <rect x={0} y={0} width={30} height={36} rx={1.5} fill={PAPER} {...O} />
        <rect x={0} y={0} width={6} height={36} fill={RULE_SOFT} {...O} />
        <path d="M11 9 H25 M11 14 H25 M11 19 H22" {...H1} stroke={RULE} />
        {[12, 17, 22, 27].map((x, i) => (
          <path key={x} d={`M${x} 36 V${42 + (i % 2) * 3} l1.5 -1.6 l1.5 1.6 V36`} fill={BRONZE} stroke={INK} strokeWidth={1} vectorEffect={NS} strokeLinejoin="round" />
        ))}
      </g>
      {/* right: the practice boulder, faceted, a few holds, a crash pad */}
      <g transform="translate(114 100) scale(1.25)">
        <path d="M2 38 L4 22 L12 10 L24 4 L36 8 L44 20 L46 38 Z" fill={PAPER} {...O} />
        <path d="M12 10 L18 24 L4 22 M18 24 L30 22 L36 8 M30 22 L44 20 M18 24 L16 38 M30 22 L34 38" {...H1} />
        <g {...H1} strokeWidth={0.8}>
          <path d="M36 25 l5 5 M38 23 l6 6 M36 30 l6 6 M20 28 l4 5 M22 27 l5 6" />
        </g>
        {[[10, 30], [22, 14], [28, 30], [38, 15]].map(([x, y], i) => (
          <ellipse key={i} cx={x} cy={y} rx={2.6} ry={1.9} fill={BRONZE} stroke={INK} strokeWidth={1} vectorEffect={NS} />
        ))}
        <rect x={-2} y={38} width={52} height={6} rx={1.5} fill={RULE_SOFT} {...O} />
      </g>
      <Ground />
    </ArtSvg>
  )
}

/* ------------------------------------------------------------ snow overlay */
/** Seeded so the streaks never jump between renders; each density keeps the
    streaks of the one below it, so the snow thickens rather than reshuffles. */
function mulberry32(a: number) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const STREAKS = (() => {
  const r = mulberry32(20260925)
  return Array.from({ length: 150 }, () => {
    const x = r() * 320 - 10
    const y = r() * 300
    const flake = r() < 0.3
    const len = flake ? 0.6 : 5 + r() * 9
    const a = ((150 + r() * 12) * Math.PI) / 180
    return { x1: x, y1: y, x2: x + Math.cos(a) * len, y2: y + Math.sin(a) * len, w: flake ? 2.2 : r() < 0.3 ? 1.4 : 1 }
  })
})()
const DENSITY = [0, 26, 56, 96, 150]

function SnowOverlay(p: ArtProps) {
  const v = Math.max(0, Math.min(4, Math.round(p.value ?? 0)))
  const n = DENSITY[v]
  return (
    <ArtSvg vb={[300, 300]} p={{ ...p, style: { overflow: 'hidden', pointerEvents: 'none', ...p.style } }} preserve="xMidYMid slice">
      <g stroke={INK} strokeLinecap="round" opacity={0.55} data-density={v}>
        {STREAKS.slice(0, n).map((s, i) => (
          <line key={i} x1={s.x1.toFixed(1)} y1={s.y1.toFixed(1)} x2={s.x2.toFixed(1)} y2={s.y2.toFixed(1)} strokeWidth={s.w} vectorEffect={NS} />
        ))}
      </g>
    </ArtSvg>
  )
}

export const CARDS: ArtRegistry = {
  'card-certify': Certify,
  'card-aiclient': AiClient,
  'card-agents': Agents,
  'card-freedtime': FreedTime,
  'snow-overlay': SnowOverlay,
}
