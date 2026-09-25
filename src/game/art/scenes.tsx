/* Scenes: full-bleed camp backdrops, drawn at 390x660.
   Ids that belong here (spec group "Scenes"):
     scene-basecamp, scene-camp1, scene-camp2, scene-camp3, scene-summit
   Frame renders <Art id={sceneFor(screen)} width="100%" height="100%" /> behind
   every screen.

   How they sit in the frame. Each scene is drawn on 390x660 and placed with
   preserveAspectRatio "xMidYMax meet": the ground stays on the bottom edge
   at 1:1 on a 390-wide phone, nothing is ever cropped off the sides, and a
   taller or wider box shows more sky above and more of the same ground to
   either side (every scene bleeds 600 units past its viewBox, and the svg
   overflows visibly into Frame, which clips). The sky is the camp's own
   paper (paperFor in content.ts, the colour Frame paints), so the seam is
   invisible. Use sceneToBox() to put a DOM object on a scene anchor.

   Style. The ridges are the mountain.ts ridged-multifractal lines, re-used
   (buildTerrain), not redrawn. Above y = 130 (top bar and a two-line prompt)
   there are only hairlines: the far range, the pencil route, a wind streak.
   Below it tone comes from flat fills stepped toward rule-soft, and from
   hachures; the ground plane (the band every object stands on) runs from
   the GROUND line to the bottom. The paper warms toward dawn camp by camp;
   the summit is at --color-dawn. No gradients, no faces, no text. */
import type { ReactNode } from 'react'
import { buildTerrain } from '@/scene/mountain'
import { paperFor } from '../content'
import type { ArtProps, ArtRegistry } from './kit'
import { ArtSvg, BRONZE, DAWN, FOREST, INK, PAPER, RULE, RULE_SOFT } from './kit'

export const SCENE_IDS = ['scene-basecamp', 'scene-camp1', 'scene-camp2', 'scene-camp3', 'scene-summit'] as const

const W = 390
const H = 660
// wide enough for a desk stage up to about 2.2:1 (the desk frame shows the
// scene at xMidYMax meet across the whole stage)
const BLEED = 600

/* ------------------------------------------------------------ anchors */

/** Where things stand in each scene, in scene units (390x660). */
export const SCENE_ANCHORS = {
  'scene-basecamp': {
    /** the ground line objects stand on */
    ground: 540,
    /** where the pencil route starts: the rookie and the empty rucksack */
    trailhead: { x: 118, y: 540 },
    /** the tent's open doorway (bottom centre, width, height): kit-rack-covered goes here */
    tentDoor: { x: 318, y: 540, w: 52, h: 74 },
  },
  'scene-camp1': { ground: 548, signpost: { x: 34, y: 548 }, tent: { x: 356, y: 548 } },
  'scene-camp2': { ground: 552, shelf: { x0: 0, x1: 390, y: 552 }, tent: { x: 30, y: 552 } },
  // the tent stands at the right edge, clear of the rookie's pole (S10)
  'scene-camp3': { ground: 556, tent: { x: 380, y: 556 } },
  'scene-summit': {
    /** the summit plateau */
    ground: 262,
    /** the last pitch, bottom left to the plateau: points along the crest */
    route: [[-6, 640], [40, 604], [88, 552], [128, 494], [160, 438], [192, 378], [218, 320], [238, 276], [252, 262]] as [number, number][],
    /** the long flat rock the kit is laid out on: top centre, top y, width
        (a low slab from x 256 to 314, so the rucksack, the Blue item and a
        row of Day-one bricks all fit on it, legible once the camera moves in) */
    rock: { x: 285, y: 256, w: 58 },
    /** where the rookie stops, beside the table, to meet the client */
    meet: { x: 331 },
    /** the table (top centre) and its two chairs; the client's chair is on the right */
    table: { x: 347, y: 240 },
    chairs: [{ x: 322, y: 262 }, { x: 372, y: 262 }],
  },
} as const

/** Map a scene point to CSS px inside a box of w x h (the scene's own box,
    usually the whole Frame), matching xMidYMax meet. */
export function sceneToBox(x: number, y: number, w: number, h: number) {
  const s = Math.min(w / W, h / H)
  return { x: (w - W * s) / 2 + x * s, y: h - (H - y) * s, scale: s }
}

/* ------------------------------------------------------------ terrain */

const TERR = buildTerrain()
const COLS = 420

/** A mountain.ts line, sampled at u with mirror-repeat beyond 0..1. */
function at(line: Float32Array, u: number) {
  let v = ((u % 2) + 2) % 2
  if (v > 1) v = 2 - v
  const p = v * (COLS - 1)
  const i = Math.floor(p)
  return line[i] + ((line[Math.min(i + 1, COLS - 1)] ?? line[i]) - line[i]) * (p - i)
}

type RidgeOpts = {
  line: number        // 0-3: TERR.lines; 4: the foreground line
  u0: number; u1: number  // the slice of the line across x = 0..390
  top: number; bottom: number  // y of the line's highest and lowest point in that slice
  shape?: (x: number) => number  // extra y offset by x (tilt, a col, a summit)
  step?: number
}

/** Points of a ridge from x = -BLEED to W + BLEED. */
function ridge(o: RidgeOpts): [number, number][] {
  const line = o.line === 4 ? TERR.fg : TERR.lines[o.line]
  let lo = Infinity, hi = -Infinity
  for (let i = 0; i <= 80; i++) {
    const v = at(line, o.u0 + ((o.u1 - o.u0) * i) / 80)
    lo = Math.min(lo, v); hi = Math.max(hi, v)
  }
  const span = Math.max(hi - lo, 1e-6)
  const out: [number, number][] = []
  const step = o.step ?? 4
  for (let x = -BLEED; x <= W + BLEED; x += step) {
    const v = at(line, o.u0 + ((o.u1 - o.u0) * x) / W)
    out.push([x, o.top + ((v - lo) / span) * (o.bottom - o.top) + (o.shape?.(x) ?? 0)])
  }
  return out
}

const r1 = (n: number) => Math.round(n * 10) / 10
const lineD = (p: [number, number][]) => 'M' + p.map(([x, y]) => `${r1(x)} ${r1(y)}`).join(' L')
const areaD = (p: [number, number][], floor = H + 40) =>
  `${lineD(p)} L${W + BLEED} ${floor} L${-BLEED} ${floor} Z`
const yAt = (p: [number, number][], x: number) => {
  for (let i = 1; i < p.length; i++) {
    if (p[i][0] >= x) {
      const [x0, y0] = p[i - 1], [x1, y1] = p[i]
      return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0 || 1)
    }
  }
  return p[p.length - 1][1]
}

/** Hachures under a crest: short verticals, longer where the face is steeper
    (the survey.ts device). Only below `minY`, so the prompt stays clean. */
function hachures(p: [number, number][], opts: { every?: number; minY?: number; max?: number; x0?: number; x1?: number } = {}) {
  const every = opts.every ?? 7, minY = opts.minY ?? 132, max = opts.max ?? 16
  let d = ''
  for (let x = opts.x0 ?? -BLEED; x <= (opts.x1 ?? W + BLEED); x += every) {
    const y0 = yAt(p, x), y1 = yAt(p, x + 3)
    const len = Math.min(max, 2 + Math.abs(y1 - y0) * 2.2)
    if (len < 4 || y0 < minY) continue
    d += `M${r1(x)} ${r1(y0 + 2.5)} V${r1(y0 + 2.5 + len)} `
  }
  return d
}

function mixHex(a: string, b: string, u: number) {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16))
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16))
  return '#' + pa.map((v, i) => Math.round(v + (pb[i] - v) * u).toString(16).padStart(2, '0')).join('')
}
const rgbToHex = (s: string) => {
  const m = s.match(/\d+/g) ?? ['248', '247', '244']
  return '#' + m.slice(0, 3).map((v) => Number(v).toString(16).padStart(2, '0')).join('')
}

/** The camp's tones: sky is Frame's paper; each nearer plane steps toward rule-soft. */
function tones(camp: number) {
  const sky = rgbToHex(paperFor(camp))
  const soft = mixHex(RULE_SOFT, DAWN, Math.min(1, camp * 0.18))
  return {
    sky,
    far: mixHex(sky, soft, 0.28),
    mid: mixHex(sky, soft, 0.55),
    near: mixHex(sky, soft, 0.85),
    ground: mixHex(sky, soft, 0.62),
  }
}

/** The ground-plane colour of a camp (0-4): trays sit on a band of it. */
export const groundFor = (camp: number) => tones(camp).ground

/* ------------------------------------------------------------ strokes */

const NS = 'non-scaling-stroke' as const
const INK_LINE = { stroke: INK, strokeWidth: 1.5, vectorEffect: NS, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const, fill: 'none' }
const HAIR = { stroke: INK, strokeWidth: 0.75, vectorEffect: NS, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const, fill: 'none' }
const PENCIL = { stroke: RULE, strokeWidth: 0.75, vectorEffect: NS, strokeLinecap: 'round' as const, fill: 'none' }

function Scene({ p, camp, children }: { p: ArtProps; camp: number; children: ReactNode }) {
  const t = tones(camp)
  return (
    <ArtSvg vb={[W, H]} p={p} fill preserve="xMidYMax meet">
      <rect x={-BLEED} y={-H} width={W + BLEED * 2} height={H * 2 + 40} fill={t.sky} />
      {children}
    </ArtSvg>
  )
}

/* ------------------------------------------------------------ pieces */

/** Moraine: a scatter of flat stones on the ground, kept to the edges. */
function Stones({ list, fill }: { list: [number, number, number][]; fill: string }) {
  return (
    <g>
      {list.map(([x, y, s], i) => {
        const k = (i * 37) % 5
        const w = 7 * s, h = (3.4 + k * 0.4) * s
        return (
          <g key={i}>
            <path {...HAIR} fill={fill} strokeWidth={1}
              d={`M${r1(x - w)} ${y} L${r1(x - w * 0.7)} ${r1(y - h * 0.7)} L${r1(x - w * 0.1 + k)} ${r1(y - h)} L${r1(x + w * 0.6)} ${r1(y - h * 0.8)} L${r1(x + w)} ${y} Z`} />
            <path {...HAIR} d={`M${r1(x - w * 0.1 + k)} ${r1(y - h)} L${r1(x + w * 0.1)} ${y}`} />
          </g>
        )
      })}
    </g>
  )
}

/** A small pitched camp tent, forest (the top bar's reached-camp tent). */
function CampTent({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-20 0 L-3 -22 L14 -24 L22 0 Z" {...INK_LINE} fill={FOREST} />
      <path d="M-20 0 L-3 -22 L10 0" {...INK_LINE} fill={FOREST} />
      <path d="M-3 -22 L-6 0 M-3 -22 L0 0" {...HAIR} stroke={PAPER} />
      <path d="M-3 -22 L-3 -26 M14 -24 L27 3 M-3 -22 L-26 3" {...HAIR} />
    </g>
  )
}

/** Far range: an ink hairline only (it runs behind the prompt). */
function FarRange({ pts }: { pts: [number, number][] }) {
  return <path d={lineD(pts)} {...HAIR} stroke={INK} strokeWidth={0.7} opacity={0.4} />
}

/* ------------------------------------------------------------ base camp */

const BC = {
  far: ridge({ line: 0, u0: 0.18, u1: 0.95, top: 44, bottom: 132 }),
  mid: ridge({ line: 2, u0: 0.1, u1: 0.62, top: 356, bottom: 424 }),
  near: ridge({ line: 3, u0: 0.35, u1: 0.62, top: 510, bottom: 532, shape: (x) => (x > 230 ? (x - 230) * 0.02 : 0) }),
}

function Basecamp(p: ArtProps) {
  const t = tones(0)
  // the pencil route up the face from the trailhead, switchbacking; it
  // fades out in the sky well below the prompt and the answer chips (the
  // summit it points at is the far ridge behind the prompt)
  const route: [number, number][] = [
    [118, 538], [150, 506], [128, 470], [172, 430], [150, 388], [196, 340],
  ]
  const tail: [number, number][] = [[196, 340], [184, 314]]
  return (
    <Scene p={p} camp={0}>
      <FarRange pts={BC.far} />
      <path d={hachures(BC.far, { every: 6, max: 12 })} {...PENCIL} />
      {/* mid moraine ridge */}
      <path d={areaD(BC.mid)} fill={t.mid} />
      <path d={lineD(BC.mid)} {...PENCIL} strokeWidth={1} />
      <path d={hachures(BC.mid, { every: 9, max: 10 })} {...PENCIL} />
      {/* the pencil route */}
      <path d={lineD(route)} {...PENCIL} strokeWidth={1} strokeDasharray="3 4" />
      <path d={lineD(tail)} {...PENCIL} strokeWidth={1} strokeDasharray="1 5" />
      {/* the ground plane */}
      <path d={areaD(BC.near)} fill={t.ground} />
      <path d={lineD(BC.near)} {...HAIR} strokeWidth={1} />
      <Stones fill={t.near} list={[[22, 552, 1.3], [56, 560, 0.8], [196, 556, 0.9], [226, 562, 0.6], [384, 556, 1.1], [-40, 600, 1.8], [430, 600, 1.6]]} />
      {/* the canvas tent, flap open */}
      <Tent />
    </Scene>
  )
}

function Tent() {
  const d = SCENE_ANCHORS['scene-basecamp'].tentDoor
  const g = d.y
  const apex: [number, number] = [d.x, g - 92]
  const L = d.x - 58, R = d.x + 58
  return (
    <g>
      {/* guy lines and pegs */}
      <path d={`M${apex[0]} ${apex[1]} L${R + 24} ${g + 6} M${apex[0] - 70} ${apex[1] + 6} L${L - 60} ${g + 2}`} {...HAIR} />
      {/* side wall running back, in shade */}
      <path d={`M${apex[0]} ${apex[1]} L${apex[0] - 70} ${apex[1] + 6} L${L - 44} ${g - 4} L${L} ${g} Z`} {...INK_LINE} fill={RULE_SOFT} />
      {/* front face */}
      <path d={`M${L} ${g} L${apex[0]} ${apex[1]} L${R} ${g} Z`} {...INK_LINE} fill={PAPER} />
      {/* the doorway: the tent's shade inside */}
      <path d={`M${d.x - d.w / 2} ${g} L${d.x} ${g - d.h - 6} L${d.x + d.w / 2} ${g} Z`} {...INK_LINE} fill={RULE} />
      {/* the flap, tied back to the right */}
      <path d={`M${d.x} ${g - d.h - 6} L${d.x + d.w / 2} ${g} L${d.x + d.w / 2 + 16} ${g} L${d.x + 22} ${g - 40} Z`} {...INK_LINE} fill={DAWN} />
      <path d={`M${d.x + 18} ${g - 34} l8 3`} {...HAIR} strokeWidth={1.2} />
      {/* ridge pole tip */}
      <path d={`M${apex[0]} ${apex[1]} v-6`} {...INK_LINE} />
    </g>
  )
}

/* ------------------------------------------------------------ camp I */

const C1 = {
  far: ridge({ line: 1, u0: 0.12, u1: 0.8, top: 58, bottom: 126 }),
  // the switchback face: a big buttress rising out of the ground
  face: ridge({ line: 2, u0: 0.4, u1: 0.72, top: 150, bottom: 196, shape: (x) => Math.pow(Math.abs(x - 244) / 200, 1.5) * 170 }),
  spur: ridge({ line: 3, u0: 0.2, u1: 0.5, top: 404, bottom: 436, shape: (x) => (x - 195) * 0.12 }),
  near: ridge({ line: 4, u0: 0.1, u1: 0.4, top: 536, bottom: 552 }),
}

function Camp1(p: ArtProps) {
  const t = tones(1)
  const s = SCENE_ANCHORS['scene-camp1']
  return (
    <Scene p={p} camp={1}>
      <FarRange pts={C1.far} />
      <path d={areaD(C1.face)} fill={t.mid} />
      <path d={lineD(C1.face)} {...PENCIL} strokeWidth={1} />
      <path d={hachures(C1.face, { every: 6, max: 18 })} {...PENCIL} />
      {/* a lower spur: the camp sits at its foot */}
      <path d={areaD(C1.spur)} fill={t.near} />
      <path d={lineD(C1.spur)} {...PENCIL} strokeWidth={1} />
      <path d={hachures(C1.spur, { every: 7, max: 12 })} {...PENCIL} />
      {/* rock ledges on the flanks, kept off the middle where the track runs */}
      <path d="M24 300 l14 -4 M44 322 l10 -2 M332 262 l16 3 M350 300 l12 2 M318 332 l10 3 M366 350 l14 2" {...PENCIL} strokeWidth={1} />
      <path d={areaD(C1.near)} fill={t.ground} />
      <path d={lineD(C1.near)} {...HAIR} strokeWidth={1} />
      <Stones fill={t.near} list={[[72, 562, 1.1], [300, 566, 0.9], [186, 560, 0.7], [-40, 610, 1.8], [430, 610, 1.6]]} />
      <SmallSignpost x={s.signpost.x} y={s.signpost.y} />
      <CampTent x={s.tent.x} y={s.tent.y} s={0.9} />
    </Scene>
  )
}

function SmallSignpost({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M-2 0 V-34 L0 -36 L2 -34 V0" {...INK_LINE} fill={DAWN} />
      <path d="M-6 -31 H14 L19 -26 L14 -21 H-6 Z" {...INK_LINE} fill={DAWN} />
      <circle cx={0} cy={-26} r={1} fill={BRONZE} />
    </g>
  )
}

/* ------------------------------------------------------------ camp II */

const C2 = {
  far: ridge({ line: 1, u0: 0.45, u1: 0.98, top: 150, bottom: 196, shape: (x) => (x - 195) * 0.06 }),
  // a col: two shoulders and a saddle between them
  col: ridge({ line: 2, u0: 0.55, u1: 0.9, top: 214, bottom: 250, shape: (x) => 130 * Math.exp(-Math.pow((x - 190) / 95, 2)) }),
  near: ridge({ line: 3, u0: 0.62, u1: 0.8, top: 470, bottom: 492 }),
}

function Camp2(p: ArtProps) {
  const t = tones(2)
  const s = SCENE_ANCHORS['scene-camp2']
  return (
    <Scene p={p} camp={2}>
      <FarRange pts={C2.far} />
      <Cloud x={318} y={yAt(C2.far, 318) + 2} s={0.9} fill={t.sky} />
      <Cloud x={372} y={yAt(C2.far, 372) + 4} s={0.6} fill={t.sky} />
      <path d={areaD(C2.col)} fill={t.far} />
      <path d={lineD(C2.col)} {...PENCIL} strokeWidth={1} />
      <path d={hachures(C2.col, { every: 6, max: 16 })} {...PENCIL} />
      <path d={areaD(C2.near)} fill={t.mid} />
      <path d={lineD(C2.near)} {...PENCIL} strokeWidth={1} />
      {/* the rock shelf: a level top and a cut face */}
      <Shelf y={s.shelf.y} top={t.ground} face={t.near} />
      <CampTent x={s.tent.x} y={s.tent.y} s={0.8} />
    </Scene>
  )
}

function Shelf({ y, top, face }: { y: number; top: string; face: string }) {
  const lip = `M${-BLEED} ${y} L${W + BLEED} ${y}`
  const cracks = [30, 96, 170, 236, 318, 372].map((x, i) => `M${x} ${y + 12} l${i % 2 ? 3 : -2} ${24 + (i % 3) * 8}`).join(' ')
  return (
    <g>
      <path d={`M${-BLEED} ${y - 10} L${W + BLEED} ${y - 10} L${W + BLEED} ${y} L${-BLEED} ${y} Z`} fill={top} />
      <path d={`M${-BLEED} ${y - 10} H${W + BLEED}`} {...PENCIL} strokeWidth={1} />
      <path d={`M${-BLEED} ${y} H${W + BLEED} V${H + 40} H${-BLEED} Z`} fill={face} />
      <path d={lip} {...HAIR} strokeWidth={1} />
      <path d={cracks} {...PENCIL} strokeWidth={1} />
    </g>
  )
}

/** A building cloud: a flat base and three rising lobes. */
function Cloud({ x, y, s, fill }: { x: number; y: number; s: number; fill: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-40 0 Q-42 -12 -28 -13 Q-26 -30 -8 -28 Q0 -46 18 -36 Q34 -38 32 -20 Q46 -18 42 0 Z" {...HAIR} fill={fill} strokeWidth={0.9} />
      <path d="M-22 -6 Q-8 -9 6 -6 M12 -14 Q22 -16 30 -13" {...PENCIL} />
    </g>
  )
}

/* ------------------------------------------------------------ camp III */

/** The y of camp III's crest at scene x (S10 Beat B stands the rookie on it). */
export function camp3Crest(x: number) { return yAt(C3.arete, x) }

const C3 = {
  far: ridge({ line: 0, u0: 0.5, u1: 0.95, top: 70, bottom: 128 }),
  // the wind-cut ridge: an arete climbing left to right
  arete: ridge({ line: 3, u0: 0.1, u1: 0.4, top: 0, bottom: 22, shape: (x) => 398 - x * 0.5 }),
  near: ridge({ line: 4, u0: 0.55, u1: 0.8, top: 544, bottom: 560 }),
}

function Camp3(p: ArtProps) {
  const t = tones(3)
  const s = SCENE_ANCHORS['scene-camp3']
  // the cornice: the crest's lee lip, a little above and ahead of it
  const lip = C3.arete.map(([x, y]) => [x, y - 3] as [number, number])
  return (
    <Scene p={p} camp={3}>
      <FarRange pts={C3.far} />
      {/* wind streaks off the crest */}
      <path d="M268 160 h64 M300 172 h52 M232 186 h40 M30 216 h56 M58 230 h40 M318 258 h44" {...PENCIL} />
      <path d={areaD(C3.arete)} fill={t.mid} />
      {/* a rib falls from the crest: the face beyond it is in shade */}
      <path d={shadeD(C3.arete, 292)} fill={t.near} />
      <path d={ribD(C3.arete, 292)} {...PENCIL} strokeWidth={1} />
      <path d={ribHachure(C3.arete, 292)} {...PENCIL} />
      <path d={lineD(lip)} {...HAIR} strokeWidth={1} />
      {/* the cornice: wind-packed snow riding the crest */}
      <path d={cornice(C3.arete, 60, 690)} {...HAIR} fill={PAPER} strokeWidth={1} />
      {/* the windward face in hachure, the lee in plain tone */}
      <path d={hachures(C3.arete, { every: 5, max: 22, minY: 140 })} {...PENCIL} />
      <path d={areaD(C3.near)} fill={t.ground} />
      <path d={lineD(C3.near)} {...HAIR} strokeWidth={1} />
      {/* pebbles kept clear of the cairn's label (S10: x 0..190, y 560..592) */}
      <Stones fill={t.near} list={[[236, 594, 1.1], [300, 568, 0.8], [-40, 612, 1.8], [430, 610, 1.6]]} />
      <CampTent x={s.tent.x} y={s.tent.y} s={0.8} />
    </Scene>
  )
}

/** The rib: from the crest at x0, down and left to the ground. */
const rib = (p: [number, number][], x0: number): [number, number][] => {
  const y0 = yAt(p, x0)
  return Array.from({ length: 13 }, (_, i) => {
    const u = i / 12
    return [r1(x0 - 190 * u + Math.sin(u * 9) * 5), r1(y0 + (560 - y0) * Math.pow(u, 0.85))] as [number, number]
  })
}
const ribD = (p: [number, number][], x0: number) => lineD(rib(p, x0))
function shadeD(p: [number, number][], x0: number) {
  const crest = p.filter(([x]) => x >= x0)
  return `${lineD(crest)} L${W + BLEED} ${H + 40} L${r1(x0 - 190)} ${H + 40} L${rib(p, x0).reverse().map(([x, y]) => `${x} ${y}`).join(' L')} Z`
}
function ribHachure(p: [number, number][], x0: number) {
  return rib(p, x0).slice(1, 11).map(([x, y], i) => `M${x + 3} ${y} l${10 + (i % 3) * 4} ${2 + (i % 2)}`).join(' ')
}

/** A band of wind-packed snow on the crest from x0 to x1: thickest in the
    middle, a lip that leans downwind (to the right). */
function cornice(p: [number, number][], x0: number, x1: number) {
  const top: string[] = [], bot: string[] = []
  for (let x = x0; x <= x1; x += 6) {
    const u = (x - x0) / (x1 - x0)
    const th = 1 + 7.5 * Math.sin(Math.PI * Math.min(1, u * 1.6)) ** 0.7
    const y = yAt(p, x)
    top.push(`${r1(x + th * 0.6)} ${r1(y - th)}`)
    bot.unshift(`${r1(x)} ${r1(y)}`)
  }
  return `M${top.join(' L')} L${bot.join(' L')} Z`
}

/* ------------------------------------------------------------ summit */

const SU = {
  far: ridge({ line: 1, u0: 0.2, u1: 0.75, top: 196, bottom: 238 }),
  far2: ridge({ line: 2, u0: 0.6, u1: 0.95, top: 300, bottom: 334 }),
}

function Summit(p: ArtProps) {
  const t = tones(4)
  const a = SCENE_ANCHORS['scene-summit']
  // the summit block: the crest from bottom left to the plateau, then a drop
  const crest: [number, number][] = [[-BLEED, 760], [-300, 700], ...a.route, [390, 262], [398, 268], [420, 300], [690, 330], [W + BLEED, 370]]
  // the block runs well below the frame: on tall phones S11 lifts the
  // camera so the summit sits near 45% of the height
  const block = `${lineD(crest)} L${W + BLEED} ${H + 320} L${-BLEED} ${H + 320} Z`
  return (
    <Scene p={p} camp={4}>
      {/* the sun on the far horizon, bronze */}
      <circle cx={70} cy={yAt(SU.far, 70) - 2} r={20} fill={PAPER} stroke={BRONZE} strokeWidth={1.5} vectorEffect={NS} />
      <path d={areaD(SU.far)} fill={t.far} />
      <path d={lineD(SU.far)} {...HAIR} strokeWidth={0.8} opacity={0.6} />
      <path d={areaD(SU.far2)} fill={t.mid} />
      <path d={lineD(SU.far2)} {...PENCIL} strokeWidth={1} />
            {/* the summit block */}
      <path d={block} fill={t.near} />
      <path d={lineD(crest)} {...INK_LINE} />
      <path d={hachures(crest, { every: 6, max: 26, x0: -20, x1: 250 })} {...PENCIL} strokeWidth={0.9} />
      <path d="M402 290 L396 330 M410 300 l-4 40" {...PENCIL} />
      {/* the flat rock for the kit */}
      <path d={`M${a.rock.x - a.rock.w / 2} 262 L${a.rock.x - a.rock.w / 2 + 3} ${a.rock.y} Q${a.rock.x} ${a.rock.y - 1.6} ${a.rock.x + a.rock.w / 2 - 3} ${a.rock.y} L${a.rock.x + a.rock.w / 2} 262 Z`} {...INK_LINE} fill={RULE_SOFT} />
      <path d={`M${a.rock.x - 14} 259.4 l5 -1 M${a.rock.x + 12} 259.8 l6 -0.8`} {...HAIR} />
      {/* a small table and two chairs */}
      <SummitTable />
    </Scene>
  )
}

function SummitTable() {
  const a = SCENE_ANCHORS['scene-summit']
  const tx = a.table.x, ty = a.table.y
  const chair = (x: number, face: 1 | -1) => (
    <g transform={`translate(${x} 262) scale(${face} 1)`}>
      <path d="M-6 0 V-24" {...INK_LINE} />
      <path d="M-6 -11 H6 V0" {...INK_LINE} />
      <path d="M-6 -11 H6" stroke={INK} strokeWidth={2.4} />
    </g>
  )
  return (
    <g>
      {chair(a.chairs[0].x, 1)}
      {chair(a.chairs[1].x, -1)}
      <path d={`M${tx - 16} ${ty} H${tx + 16}`} stroke={INK} strokeWidth={3} strokeLinecap="round" />
      <path d={`M${tx} ${ty} V262 M${tx - 7} 262 H${tx + 7}`} {...INK_LINE} />
      {/* a cup on the table, the one accent besides the sun */}
      <path d={`M${tx + 5} ${ty - 1.5} v-5 h5 v5 Z`} {...INK_LINE} fill={PAPER} strokeWidth={1} />
    </g>
  )
}

export const SCENES: ArtRegistry = {
  'scene-basecamp': Basecamp,
  'scene-camp1': Camp1,
  'scene-camp2': Camp2,
  'scene-camp3': Camp3,
  'scene-summit': Summit,
}
