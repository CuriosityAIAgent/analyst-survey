/* Pitches (S06 tiles, 64x64) and pitch zones (171x100 composites).
   Ids that belong here (spec groups "Pitches", "Pitch zones"):
     reviewpack, clientmail, pitchbook, onboard, pitch-crmnotes,
     zone-ownfeet, zone-withkit, zone-kitdrafts, zone-crew
   reviewpack, clientmail, pitchbook and onboard exist in
   src/components/ActivityArt.tsx: reuse them, moving their hexes onto the
   kit.tsx tokens.

   Pitch tiles: all five in one accent (BRONZE by default, `accent` recolours),
   the same weight, on a shared baseline. They are the loads, so their accent
   differs from the zones' (forest rookie, navy kit) and a placed tile reads
   as something carried.

   Pitch zones draw on a 171x100 grid (export ZONE_VIEWBOX). The vignette sits
   in the left 108 units on a ground line at y = 92, so the right of the zone
   and its top 30 units stay clear for the label and the placed tiles.
     zone-ownfeet  state 'crouch' (shoulder a load) | 'strain' (a third
                   bounced: the straps pull); value 0-2 = rucksack slots filled.
     others        no states. Equal weight and equal motion across all four. */
import type { ReactNode } from 'react'
import type { ArtProps, ArtRegistry } from './kit'
import { ACCENT, ArtSvg, BRONZE, FOREST, INK, NAVY, PAPER, RULE, RULE_SOFT, STROKE } from './kit'
import Figure, { skeleton } from '../Figure'
import { MiniBrick } from './nav'
import { PEOPLE } from './people'

export const PITCH_IDS = [
  'reviewpack', 'clientmail', 'pitchbook', 'onboard', 'pitch-crmnotes',
  'zone-ownfeet', 'zone-withkit', 'zone-kitdrafts', 'zone-crew',
] as const

export const ZONE_VIEWBOX: [number, number] = [171, 100]

const O = { stroke: INK, strokeWidth: STROKE, vectorEffect: 'non-scaling-stroke', strokeLinejoin: 'round', strokeLinecap: 'round' } as const
const HI = { stroke: INK, strokeWidth: 1, vectorEffect: 'non-scaling-stroke', strokeLinecap: 'round', fill: 'none' } as const
const HP = { stroke: PAPER, strokeWidth: 1, vectorEffect: 'non-scaling-stroke', strokeLinecap: 'round', fill: 'none' } as const

function tile(draw: (a: string) => ReactNode) {
  return function PitchTile(p: ArtProps) {
    const a = ACCENT[p.accent ?? 'bronze']
    return <ArtSvg vb={[64, 64]} p={p}>{draw(a)}</ArtSvg>
  }
}

/* ------------------------------------------------------------ pitch tiles */

/* Portfolio analysis: a framed chart pack, a second sheet behind. */
const reviewpack = tile((a) => (
  <g>
    <rect x={14} y={8} width={42} height={40} rx={1.5} fill={PAPER} {...O} />
    <rect x={8} y={14} width={42} height={42} rx={1.5} fill={a} {...O} />
    <rect x={13} y={19} width={32} height={32} fill={PAPER} {...O} />
    <path d="M17 46V24M17 46h24" {...HI} />
    <path d="M18 42l6-7 5 4 7-10 5 5" fill="none" stroke={a} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M22 46v-2M28 46v-2M34 46v-2M40 46v-2" {...HI} />
  </g>
))

/* Prospect outreach draft: an envelope, flap sealed. */
const clientmail = tile((a) => (
  <g>
    <rect x={6} y={16} width={52} height={36} rx={2} fill={PAPER} {...O} />
    <path d="M6 50l19-15M58 50L39 35" {...HI} />
    <path d="M6 18q0-2 2-2h48q2 0 2 2L34 37q-2 1.6-4 0z" fill={a} {...O} />
    <circle cx={32} cy={35} r={5} fill={PAPER} {...O} />
    <circle cx={32} cy={35} r={2.6} {...HI} />
  </g>
))

/* Meeting brief: a bound book, pages at the fore-edge. */
const pitchbook = tile((a) => (
  <g>
    <path d="M44 12h6q2 0 2 2v38q0 2-2 2h-6z" fill={PAPER} {...O} />
    <path d="M47 15v36M49.6 15v36" {...HI} />
    <path d="M14 10h30q2 0 2 2v42q0 2-2 2H14z" fill={a} {...O} />
    <rect x={10} y={10} width={8} height={46} rx={2} fill={a} {...O} />
    <path d="M10 16h8M10 50h8" {...HP} />
    <rect x={24} y={20} width={16} height={9} rx={1} fill={PAPER} {...O} />
    <path d="M27 24.5h10" {...HI} />
  </g>
))

/* Onboarding paperwork: a folder of forms, tabbed. */
const onboard = tile((a) => (
  <g>
    {/* folder back with its tab */}
    <path d="M6 20q0-2 2-2h14l4 4h28q2 0 2 2v30q0 2-2 2H8q-2 0-2-2z" fill={a} {...O} />
    {/* forms standing proud */}
    <rect x={12} y={12} width={30} height={26} rx={1} fill={PAPER} {...O} transform="rotate(-4 27 25)" />
    <rect x={20} y={15} width={30} height={26} rx={1} fill={PAPER} {...O} />
    <path d="M24 20.6h2.4v2.4H24zM24 26.6h2.4v2.4H24z" {...HI} />
    <path d="M29 21.8h16M29 27.8h13" {...HI} />
    {/* front pocket */}
    <path d="M6 34h52l-3 20q-.4 2-2.4 2H10.4q-2 0-2.4-2z" fill={a} {...O} />
    <path d="M12 40h40" {...HP} />
  </g>
))

/* Meeting notes & CRM: a notepad with ticks, an index card beside it. */
const crmnotes = tile((a) => (
  <g>
    {/* index card, behind and right */}
    <g transform="rotate(8 46 30)">
      <rect x={32} y={14} width={26} height={30} rx={1} fill={PAPER} {...O} />
      <rect x={32} y={14} width={26} height={7} fill={a} {...O} />
      <path d="M36 27h18M36 32h18M36 37h12" {...HI} />
    </g>
    {/* notepad: backing board in the accent, pages on it */}
    <rect x={6} y={12} width={32} height={46} rx={2} fill={a} {...O} />
    <rect x={9} y={17} width={26} height={38} rx={1} fill={PAPER} {...O} />
    {/* binding rings */}
    <path d="M12 10v5M18 10v5M24 10v5M30 10v5" stroke={INK} strokeWidth={2.2} strokeLinecap="round" />
    {/* ticked lines */}
    {[25, 33, 41].map((y) => (
      <g key={y}>
        <path d={`M12 ${y}l2 2 3.6-4`} {...O} fill="none" />
        <path d={`M20 ${y + 1}h11`} {...HI} />
      </g>
    ))}
    <path d="M12.6 49h18" {...HI} />
  </g>
))

/* ------------------------------------------------------------ pitch zones */
const GROUND = 92
const FIG = 60 // rookie height in zone units
const U = FIG / 26 // figure units -> zone units
const OWF = STROKE / U // a 1.5 outline, in figure units

function Ground({ from = 6, to = 110 }: { from?: number; to?: number }) {
  return <path d={`M${from} ${GROUND}H${to}`} {...O} />
}
function zone(draw: (p: ArtProps) => ReactNode) {
  return function PitchZone(p: ArtProps) {
    return <ArtSvg vb={ZONE_VIEWBOX} p={p}>{draw(p)}</ArtSvg>
  }
}

/* A walking boot, over the figure's foot (figure units, toe to the right). */
const Boot = ({ x, y }: { x: number; y: number }) => (
  <g>
    <path d={`M${x - 1.3} ${y + 0.3}v-2.6q0-.5.5-.5h1.5l.5 1h1.2q1 0 1 1v1.1z`}
      fill={INK} stroke={INK} strokeWidth={OWF * 0.6} strokeLinejoin="round" />
    <path d={`M${x - 0.9} ${y - 2}h1.3M${x - 0.9} ${y - 1.2}h1.3`} stroke={PAPER} strokeWidth={OWF * 0.45} strokeLinecap="round" />
  </g>
)

/* On their own feet: boots prominent, a two-slot rucksack, no instruments. */
const ownfeet = zone((p) => {
  const pose = p.state === 'crouch' || p.state === 'strain' ? 'crouch' : 'stand'
  const k = skeleton(pose)
  const filled = Math.max(0, Math.min(2, Math.round(p.value ?? 0)))
  const dx = k.shoulder.x - 1, dy = k.shoulder.y + 17
  const fx = 46
  return (
    <g>
      <Ground />
      <g transform={`translate(${fx} ${GROUND}) scale(${U})`}>
        {/* the rucksack, two slots */}
        <g transform={`translate(${dx} ${dy})`}>
          <rect x={-8.8} y={-20.6} width={8} height={12.4} rx={1.8} fill={PAPER} stroke={INK} strokeWidth={OWF} />
          <path d="M-8.4 -18h7.2" stroke={INK} strokeWidth={OWF * 0.7} />
          {[0, 1].map((i) => (
            <rect key={i} x={-7.8} y={-16.6 + i * 4} width={6} height={3.2} rx={0.6}
              fill={i < filled ? BRONZE : 'none'} stroke={i < filled ? INK : RULE}
              strokeWidth={OWF * 0.7} strokeDasharray={i < filled ? undefined : `${OWF} ${OWF}`} />
          ))}
          {p.state === 'strain' && (
            <path d="M-0.4 -22.6l1.2-1.4M1.4 -21.4l1.6-.8M-2.4 -23.2l.2-1.8" stroke={INK} strokeWidth={OWF * 0.7} strokeLinecap="round" />
          )}
        </g>
      </g>
      <Figure as="g" variant="rookie" pose={pose} size={FIG} x={fx} y={GROUND} pack={false} axe={false} />
      <g transform={`translate(${fx} ${GROUND}) scale(${U})`}>
        <Boot x={k.backFoot.x} y={k.backFoot.y} />
        <Boot x={k.frontFoot.x} y={k.frontFoot.y} />
        {/* the shoulder strap, over the jacket */}
        <path d={`M${k.shoulder.x - 1.4} ${k.shoulder.y - 0.6}Q${k.shoulder.x + 1.6} ${k.shoulder.y + 3} ${k.hip.x + 0.6} ${k.hip.y - 1}`}
          fill="none" stroke={PAPER} strokeWidth={OWF * 0.9} strokeLinecap="round" />
      </g>
    </g>
  )
})

/* Walk it with kit: the rookie walking, the map and compass bricks on the strap. */
const withkit = zone(() => {
  const k = skeleton('stride', -1.1)
  const fx = 46
  // MiniBrick (22x9) in figure units
  const s = 0.28
  return (
    <g>
      <Ground />
      <Figure as="g" variant="rookie" pose="stride" t={-1.1} size={FIG} x={fx} y={GROUND} axe={false} />
      <g transform={`translate(${fx} ${GROUND}) scale(${U})`}>
        {/* the chest strap, shoulder to hip, with the two bricks clipped on it */}
        <path d={`M${k.shoulder.x - 1.4} ${k.shoulder.y - 0.4}L${k.hip.x + 1.8} ${k.hip.y + 0.4}`}
          stroke={INK} strokeWidth={0.9 + OWF * 2} strokeLinecap="round" />
        <path d={`M${k.shoulder.x - 1.4} ${k.shoulder.y - 0.4}L${k.hip.x + 1.8} ${k.hip.y + 0.4}`}
          stroke={PAPER} strokeWidth={0.9} strokeLinecap="round" />
        <g transform={`translate(${k.hip.x - 0.6} ${k.hip.y - 5.2}) scale(${s})`}>
          <MiniBrick x={0} y={0} />
          <path d="M6 5h4.4l1.6-.8 1.6.8h4" {...HP} />
        </g>
        <g transform={`translate(${k.hip.x - 0.2} ${k.hip.y - 2.2}) scale(${s})`}>
          <MiniBrick x={0} y={0} />
          <circle cx={11} cy={5.6} r={1.8} {...HP} />
        </g>
      </g>
      {/* the arm again, over the strap, so the bricks sit under it */}
      <g transform={`translate(${fx} ${GROUND}) scale(${U})`}>
        <line x1={k.armRoot.x} y1={k.armRoot.y} x2={k.hand.x} y2={k.hand.y} stroke={INK} strokeWidth={2 + OWF * 2} strokeLinecap="round" />
        <line x1={k.armRoot.x} y1={k.armRoot.y} x2={k.hand.x} y2={k.hand.y} stroke={FOREST} strokeWidth={2} strokeLinecap="round" />
      </g>
      {/* the route ahead they walk along */}
      <path d={`M${fx + 16} ${GROUND - 1.5}q16-5 34-3t26-4`} fill="none" stroke={NAVY} strokeWidth={1.25}
        strokeDasharray="3 3" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
    </g>
  )
})

/* Kit drafts, they check: the brief's clipboard on a rock; the rookie reads it through a hand lens. */
const Lens = () => (
  <g>
    <path d="M0 0l1.6-1.4" stroke={INK} strokeWidth={0.9} strokeLinecap="round" />
    <circle cx={2.8} cy={-2.4} r={1.9} fill={PAPER} stroke={INK} strokeWidth={OWF} />
    <path d="M2 -3.4a1.2 1.2 0 0 1 1.2-.6" stroke={INK} strokeWidth={OWF * 0.6} fill="none" strokeLinecap="round" />
  </g>
)
const kitdrafts = zone(() => {
  const fx = 34
  return (
    <g>
      <Ground />
      {/* the rock */}
      <path d={`M60 ${GROUND}l3-12q2-5 8-6l16-1q8 .4 10 7l3 12z`} fill={PAPER} {...O} />
      <path d="M86 80l4 4M90 78l4 4M92 84l3 3M66 86l3 3" {...HI} />
      {/* the brief: a navy clipboard propped on the rock */}
      <g transform="rotate(-12 80 60)">
        <rect x={68} y={46} width={24} height={30} rx={2} fill={NAVY} {...O} />
        <rect x={71} y={50} width={18} height={23} rx={0.6} fill={PAPER} {...O} />
        <rect x={76} y={43.4} width={8} height={5} rx={1.2} fill={INK} />
        {/* weather, the route, timings */}
        <circle cx={74.6} cy={54.6} r={1.8} fill={NAVY} stroke={INK} strokeWidth={0.8} vectorEffect="non-scaling-stroke" />
        <path d="M78.6 56h5a1.4 1.4 0 0 0 0-2.8 2 2 0 0 0-3.8-.4 1.6 1.6 0 0 0-1.2 3.2z" {...HI} strokeWidth={0.8} />
        <path d="M73.4 70l3.4-4.2 3 2 3.6-4.6" fill="none" stroke={NAVY} strokeWidth={1.4} strokeDasharray="1.8 1.4" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        <path d="M84.6 64h2.6M84.6 67h2.6M84.6 70h2.6" {...HI} strokeWidth={0.9} />
      </g>
      <Figure as="g" variant="rookie" pose="crouch" size={FIG} x={fx} y={GROUND} axe={false} hand={<Lens />} />
    </g>
  )
})

/* Base-camp crew: the porter by the tent, load frame empty. */
const crew = zone(() => {
  const Porter = PEOPLE.porter
  return (
    <g>
      <Ground />
      {/* the tent */}
      <g transform={`translate(80 ${GROUND})`}>
        <path d="M-24 0L-3 -34h6L24 0z" fill={PAPER} {...O} />
        <path d="M-24 0L0 -34" {...HI} />
        <path d="M-12 0L-1 -22l8 22z" fill={INK} />
        <path d="M-1 -22Q4 -12 13 -8" fill="none" {...O} />
        <path d="M0 -34l-3 -6M-24 0l-6 1.6M24 0l6 1.6" {...HI} />
        <path d="M10 -14l4 4M14 -20l3 3" stroke={RULE} strokeWidth={1} vectorEffect="non-scaling-stroke" strokeLinecap="round" />
      </g>
      {/* the porter: the people.tsx figure, feet on the ground line */}
      {Porter
        ? <g transform={`translate(${30 - 30 * (66 / 64)} ${GROUND - 62 * (66 / 64)})`}><Porter size={66} /></g>
        : <rect x={20} y={GROUND - 60} width={24} height={60} fill="none" stroke={RULE_SOFT} strokeDasharray="3 3" />}
    </g>
  )
})

export const PITCHES: ArtRegistry = {
  reviewpack,
  clientmail,
  pitchbook,
  onboard,
  'pitch-crmnotes': crmnotes,
  'zone-ownfeet': ownfeet,
  'zone-withkit': withkit,
  'zone-kitdrafts': kitdrafts,
  'zone-crew': crew,
}
