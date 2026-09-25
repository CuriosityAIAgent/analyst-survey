/* People. Ids that belong here (spec group "Characters"):
     rookie, you-bronze, porter, client
   rookie and you-bronze wrap src/game/Figure.tsx (variant 'rookie' / 'you' /
   'ghost'), which already draws the survey.ts climber with poses; there is no
   second climber here. porter and client are new, faceless, and drawn in the
   same figure units as Figure (feet at 0,0, head at about y = -21, 26 units
   tall) with the same limb weights, so all four stand together at one scale.

   All four draw on the 64x64 grid, feet on y = 62.

   rookie      state = pose: 'stand' (default) | 'stride' | 'crouch' | 'openHand'
               | 'setDown'; value = stride phase (radians); data = { facing: -1 }
               to face left.
   you-bronze  same, plus state 'ghost' for the outline-only waiting figure.
   porter      standing, the load frame empty.
   client      state 'seated' | 'rising' | 'offer' (default: standing, hand out). */
import Figure, { type FigurePose } from '../Figure'
import type { ArtProps, ArtRegistry } from './kit'
import { ArtSvg, FOREST, INK, NAVY, PAPER, STROKE } from './kit'

export const PEOPLE_IDS = ['rookie', 'you-bronze', 'porter', 'client'] as const

const POSES: FigurePose[] = ['stand', 'stride', 'crouch', 'openHand', 'setDown']
const poseOf = (s?: string): FigurePose => (POSES.includes(s as FigurePose) ? (s as FigurePose) : 'stand')
const facingOf = (d: unknown): 1 | -1 => ((d as { facing?: number } | undefined)?.facing === -1 ? -1 : 1)

/* Figure units -> the 64 grid: 26 units tall becomes 58px, feet at (30, 62). */
const U = 58 / 26
const FEET = { x: 30, y: 62 }
/* Outline in figure units that renders at 1.5px when the art is 64px tall. */
const OW = STROKE / U

function climber(variant: 'rookie' | 'you') {
  return function Climber(p: ArtProps) {
    const v = variant === 'you' && p.state === 'ghost' ? 'ghost' : variant
    return (
      <ArtSvg vb={[64, 64]} p={p}>
        <Figure as="g" variant={v} pose={poseOf(p.state)} t={p.value ?? 0} size={58} x={FEET.x} y={FEET.y}
          facing={facingOf(p.data)} />
      </ArtSvg>
    )
  }
}

/* A limb with the Figure weights: an ink polyline, round caps. */
const Limb = ({ pts, w = 2.4, color = INK }: { pts: [number, number][]; w?: number; color?: string }) => (
  <polyline points={pts.map((q) => q.join(',')).join(' ')} fill="none" stroke={color} strokeWidth={w}
    strokeLinecap="round" strokeLinejoin="round" />
)

/* ------------------------------------------------------------------ porter
   Base-camp crew. Stands square (no climber's lean, no axe, no hat), dressed
   in ink, a wooden load frame on the back that rises above the head, and a
   forest tumpline from the frame across the forehead plus a forest sash: the
   one accent. Nothing navigational on him. */
function Porter(p: ArtProps) {
  const hip: [number, number] = [0.2, -9]
  const sh: [number, number] = [0.8, -17.2]
  const head = { x: 1.3, y: -20.5 }
  const band = `M-3.8 -24.4 Q0.4 -23.4 ${head.x + 2.75} ${head.y - 0.5}`
  return (
    <ArtSvg vb={[64, 64]} p={p}>
      <g transform={`translate(${FEET.x + 4} ${FEET.y}) scale(${U})`} strokeLinejoin="round">
        {/* load frame, behind: two wooden rails, three cross bars */}
        <path d="M-8.4 -11.6 H-3.2 M-8.6 -18.4 H-3.2" stroke={INK} strokeWidth={OW} />
        <path d="M-9.4 -26 h1.5 l0.5 23.4 h-1.5 z M-5.4 -26 h1.5 l0.3 23.4 h-1.5 z" fill={PAPER} stroke={INK} strokeWidth={OW} />
        <path d="M-9.9 -24.4 H-3.6" stroke={INK} strokeWidth={OW * 1.6} strokeLinecap="round" />
        {/* legs: straight, planted */}
        <Limb pts={[hip, [-0.9, -4.6], [-2, 0]]} />
        <Limb pts={[hip, [1.4, -4.6], [2.4, 0]]} />
        <path d="M-3.3 -0.9 h2.7 l0.4 0.9 h-3.1 z M1.1 -0.9 h2.7 l0.6 0.9 h-3.1 z" fill={INK} />
        {/* torso: an ink tunic */}
        <line x1={hip[0]} y1={hip[1]} x2={sh[0]} y2={sh[1]} stroke={INK} strokeWidth={5.2} strokeLinecap="round" />
        {/* shoulder strap to the frame, paper on ink */}
        <path d="M-2 -17.6 Q0.6 -16.2 1.8 -12.2" fill="none" stroke={PAPER} strokeWidth={OW * 0.9} strokeLinecap="round" />
        {/* forest sash at the waist */}
        <path d="M-2.4 -10.9 L2.8 -10.5 L2.9 -9.3 L-2.4 -9.7 Z" fill={FOREST} stroke={INK} strokeWidth={OW * 0.8} />
        {/* arm: down, the hand on the strap */}
        <line x1={1.4} y1={-15.8} x2={3.3} y2={-11.4} stroke={INK} strokeWidth={2.2} strokeLinecap="round" />
        <circle cx={3.4} cy={-11} r={1} fill={PAPER} stroke={INK} strokeWidth={OW} />
        {/* head: plain, faceless, no hat */}
        <circle cx={head.x} cy={head.y} r={2.8} fill={PAPER} stroke={INK} strokeWidth={OW} />
        {/* tumpline: from the frame top across the forehead, forest */}
        <path d={band} fill="none" stroke={INK} strokeWidth={0.7 + OW * 2} strokeLinecap="round" />
        <path d={band} fill="none" stroke={FOREST} strokeWidth={0.7} strokeLinecap="round" />
      </g>
    </ArtSvg>
  )
}

/* ------------------------------------------------------------------ client
   At the summit table: a long navy coat (the accent), bare plain head (no hat,
   so never mistaken for a climber), one hand offered. */
type ClientPose = 'seated' | 'rising' | 'offer'
const CLIENT: Record<ClientPose, {
  hip: [number, number]; sh: [number, number]; knee: [number, number]; knee2: [number, number]
  foot: [number, number]; foot2: [number, number]; hand: [number, number]; open: boolean
}> = {
  seated: { hip: [-2.6, -7.8], sh: [-2, -16], knee: [4.2, -8.2], knee2: [3.8, -8.6], foot: [4.4, 0], foot2: [3.2, 0], hand: [2.4, -9.4], open: false },
  rising: { hip: [-0.8, -9.4], sh: [1.2, -17], knee: [2.6, -6], knee2: [2.2, -6.4], foot: [2.4, 0], foot2: [-1.2, 0], hand: [7, -13], open: true },
  offer:  { hip: [0, -9.4], sh: [0.9, -17.6], knee: [0.8, -4.7], knee2: [-0.5, -4.7], foot: [1.6, 0], foot2: [-1.6, 0], hand: [7.4, -13.4], open: true },
}

function Client(p: ArtProps) {
  const pose: ClientPose = p.state === 'seated' || p.state === 'rising' ? p.state : 'offer'
  const c = CLIENT[pose]
  const [hx, hy] = c.hip
  const [sx, sy] = c.sh
  // the coat: shoulders to a hem that flares; seated, it drapes over the thigh
  const coat = pose === 'seated'
    ? `M${sx - 2.4} ${sy + 0.4} Q${sx} ${sy - 1.2} ${sx + 2.4} ${sy + 0.4} L${hx + 2.8} ${hy - 0.6} L${c.knee[0] + 0.6} ${c.knee[1] - 1.4} L${c.knee[0] + 0.6} ${c.knee[1] + 1.6} L${hx - 2.6} ${hy + 1.6} Z`
    : `M${sx - 2.4} ${sy + 0.5} Q${sx} ${sy - 1.2} ${sx + 2.4} ${sy + 0.5} L${hx + 3.2} ${hy + 5.4} L${hx - 3.4} ${hy + 5.4} Z`
  const neck = { x: sx + (sx - hx) * 0.12, y: sy + (sy - hy) * 0.12 }
  const head = { x: neck.x + 0.3, y: neck.y - 2 }
  const armRoot: [number, number] = [sx + (hx - sx) * 0.12, sy + (hy - sy) * 0.12]
  return (
    <ArtSvg vb={[64, 64]} p={p}>
      <g transform={`translate(${FEET.x - 2} ${FEET.y}) scale(${U})`} strokeLinejoin="round">
        {/* legs (trousers, ink) under the coat */}
        <Limb pts={[c.hip, c.knee2, c.foot2]} w={2.2} />
        <Limb pts={[c.hip, c.knee, c.foot]} w={2.2} />
        {/* shoes */}
        <path d={`M${c.foot2[0] - 1.2} ${c.foot2[1] - 0.8} h2.6 l0.4 0.8 h-3 z M${c.foot[0] - 1.2} ${c.foot[1] - 0.8} h2.6 l0.4 0.8 h-3 z`} fill={INK} />
        {/* coat, navy, ink outline */}
        <path d={coat} fill={NAVY} stroke={INK} strokeWidth={OW} />
        {/* the shirt collar */}
        <path d={`M${neck.x - 0.9} ${neck.y + 0.4} L${neck.x + 0.2} ${neck.y + 2} L${neck.x + 1.2} ${neck.y + 0.4}`} fill={PAPER} stroke={INK} strokeWidth={OW * 0.8} />
        {/* the offered arm: sleeve navy, hand open (three fingers, like Figure) */}
        <line x1={armRoot[0]} y1={armRoot[1]} x2={c.hand[0]} y2={c.hand[1]} stroke={INK} strokeWidth={2 + OW * 2} strokeLinecap="round" />
        <line x1={armRoot[0]} y1={armRoot[1]} x2={c.hand[0]} y2={c.hand[1]} stroke={NAVY} strokeWidth={2} strokeLinecap="round" />
        {c.open ? (
          <g stroke={INK} strokeWidth={OW} strokeLinecap="round">
            <circle cx={c.hand[0] + 0.5} cy={c.hand[1]} r={0.95} fill={PAPER} />
            <line x1={c.hand[0] + 1.2} y1={c.hand[1] - 0.4} x2={c.hand[0] + 2.8} y2={c.hand[1] - 1.1} />
            <line x1={c.hand[0] + 1.4} y1={c.hand[1] + 0.1} x2={c.hand[0] + 3.1} y2={c.hand[1] + 0.1} />
            <line x1={c.hand[0] + 1.2} y1={c.hand[1] + 0.6} x2={c.hand[0] + 2.7} y2={c.hand[1] + 1.2} />
            <line x1={c.hand[0] + 0.2} y1={c.hand[1] - 0.8} x2={c.hand[0] + 0.9} y2={c.hand[1] - 2.2} />
          </g>
        ) : (
          <circle cx={c.hand[0] + 0.4} cy={c.hand[1]} r={1} fill={PAPER} stroke={INK} strokeWidth={OW} />
        )}
        {/* head: a plain circle, faceless, bareheaded */}
        <circle cx={head.x} cy={head.y} r={2.8} fill={PAPER} stroke={INK} strokeWidth={OW} />
      </g>
    </ArtSvg>
  )
}

export const PEOPLE: ArtRegistry = {
  rookie: climber('rookie'),
  'you-bronze': climber('you'),
  porter: Porter,
  client: Client,
}
