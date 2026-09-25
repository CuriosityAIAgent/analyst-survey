/* Gear tiles for S02, 64x64, all in the FOREST accent at the same weight.
   Ids that belong here (spec group "Gear"):
     gear-binoculars, gear-leadrope, gear-crampons, gear-flare, gear-bootlaces,
     gear-stove, gear-logbook, gear-thermos, gear-manual, gear-boulder,
     gear-forms, gear-polish

   One hand: flat fills, a 1.5px ink outline (non-scaling), one accent (forest
   by default; `accent` recolours), paper for everything else. Details on the
   accent are paper hairlines, details on paper are ink hairlines. Every piece
   sits in roughly the same 52x48 box on a shared baseline (y = 56) and carries
   about the same area of accent, so no tile looks richer than another. */
import type { ReactNode } from 'react'
import type { ArtProps, ArtRegistry } from './kit'
import { ACCENT, ArtSvg, INK, PAPER, STROKE } from './kit'
import Figure from '../Figure'

export const GEAR_IDS = [
  'gear-binoculars', 'gear-leadrope', 'gear-crampons', 'gear-flare', 'gear-bootlaces', 'gear-stove',
  'gear-logbook', 'gear-thermos', 'gear-manual', 'gear-boulder', 'gear-forms', 'gear-polish',
] as const

/* ---- shared strokes */
const O = { stroke: INK, strokeWidth: STROKE, vectorEffect: 'non-scaling-stroke', strokeLinejoin: 'round', strokeLinecap: 'round' } as const
/** Ink hairline, for detail on paper. */
const HI = { stroke: INK, strokeWidth: 1, vectorEffect: 'non-scaling-stroke', strokeLinecap: 'round', fill: 'none' } as const
/** Paper hairline, for detail on the accent. */
const HP = { stroke: PAPER, strokeWidth: 1, vectorEffect: 'non-scaling-stroke', strokeLinecap: 'round', fill: 'none' } as const

function tile(draw: (a: string) => ReactNode) {
  return function GearTile(p: ArtProps) {
    const a = ACCENT[p.accent ?? 'forest']
    return <ArtSvg vb={[64, 64]} p={p}>{draw(a)}</ArtSvg>
  }
}

/* Sit in client meetings: binoculars, head-on. */
const binoculars = tile((a) => (
  <g>
    {/* eyepieces */}
    <rect x={14} y={8} width={11} height={9} rx={2} fill={PAPER} {...O} />
    <rect x={39} y={8} width={11} height={9} rx={2} fill={PAPER} {...O} />
    <path d="M16 11.5h7M41 11.5h7" {...HI} />
    {/* barrels, tapering down to the objectives */}
    <path d="M13 17h13l3 22H8z" fill={a} {...O} />
    <path d="M38 17h13l5 22H35z" fill={a} {...O} />
    {/* bridge and focus wheel */}
    <rect x={26.5} y={21} width={11} height={9} rx={1.5} fill={a} {...O} />
    <rect x={28.5} y={14} width={7} height={6} rx={1.5} fill={PAPER} {...O} />
    <path d="M30.5 14v6M33.5 14v6" {...HI} />
    {/* objective lenses */}
    <circle cx={18.5} cy={44} r={12} fill={a} {...O} />
    <circle cx={45.5} cy={44} r={12} fill={a} {...O} />
    <circle cx={18.5} cy={44} r={8} fill={PAPER} {...O} />
    <circle cx={45.5} cy={44} r={8} fill={PAPER} {...O} />
    <path d="M13.8 41.5a5.4 5.4 0 0 1 4-3.6M40.8 41.5a5.4 5.4 0 0 1 4-3.6" {...HI} />
  </g>
))

/* Present to clients: a coiled lead rope with its end paid out. */
function ring(cx: number, cy: number, rx: number, ry: number, w: number) {
  const ix = rx - w, iy = ry - w
  return `M${cx - rx} ${cy}a${rx} ${ry} 0 1 0 ${2 * rx} 0a${rx} ${ry} 0 1 0 ${-2 * rx} 0Z` +
    `M${cx - ix} ${cy}a${ix} ${iy} 0 1 0 ${2 * ix} 0a${ix} ${iy} 0 1 0 ${-2 * ix} 0Z`
}
const leadrope = tile((a) => (
  <g>
    {/* the paid-out end, behind the coil */}
    <path d="M40 17C50 14 56 20 55 30s-3 17 2 23" fill="none" stroke={INK} strokeWidth={5.6} strokeLinecap="round" />
    <path d="M40 17C50 14 56 20 55 30s-3 17 2 23" fill="none" stroke={a} strokeWidth={3} strokeLinecap="round" />
    <rect x={54.2} y={50.5} width={5.6} height={4.2} rx={1} transform="rotate(-18 57 52.6)" fill={PAPER} {...O} />
    {/* three loops, back to front */}
    <path d={ring(22, 37, 14, 19, 3.6)} fill={a} fillRule="evenodd" {...O} />
    <path d={ring(27, 37.5, 14, 19, 3.6)} fill={a} fillRule="evenodd" {...O} />
    <path d={ring(32, 38, 14, 19, 3.6)} fill={a} fillRule="evenodd" {...O} />
    {/* lay of the rope, a few twists on the front loop */}
    <path d="M19.2 34.5l2.2 1.4M19.6 42.5l2.2-.9M26 55l.8-2.4M38 55l-.8-2.4M44.6 42.3l-2.2-.9M44.3 34.3l-2.2 1.4" {...HP} />
    {/* the binding at the top of the coil */}
    <rect x={18} y={13} width={20} height={9} rx={3} fill={a} {...O} />
    <path d="M23 13v9M27 13v9M31 13v9M35 13v9" {...HP} />
  </g>
))

/* Portfolio analysis: crampons, side on, points down. */
const crampons = tile((a) => (
  <g>
    {/* the binding strap, front frame to heel, with its buckle */}
    <path d="M17 34C18 20 46 18 52 34" fill="none" stroke={INK} strokeWidth={4} strokeLinecap="round" />
    <path d="M17 34C18 20 46 18 52 34" fill="none" stroke={PAPER} strokeWidth={1.8} strokeLinecap="round" />
    <rect x={43.6} y={21.4} width={6} height={4.6} rx={1} transform="rotate(38 46.6 23.7)" fill={PAPER} {...O} />
    {/* points: two front points, then the downward rows */}
    <path d="M11 35.4L2 38.6l.6 2.2L11 39.4z" fill={a} {...O} />
    <path d="M11 38.6L3 45l1.6 1.6L13 41z" fill={a} {...O} />
    <path d="M15.6 40l2 12 2-12zM22.6 40l2 12 2-12zM29.6 40l2 12 2-12zM46 40l2 12 2-12zM53.4 40l2 12 2-12z" fill={a} {...O} />
    {/* front and heel frames, joined by the linking bar */}
    <rect x={32} y={36} width={14} height={3.6} fill={PAPER} {...O} />
    <path d="M35 37.8h1.6M39.2 37.8h1.6M43.4 37.8h1" {...HI} />
    <path d="M9 36.5Q9 33 13 33h21v8H12q-3 0-3-4.5z" fill={a} {...O} />
    <path d="M44 33h13q2 0 2 2v6H44z" fill={a} {...O} />
    <path d="M14 37h17M47 37h9" {...HP} />
  </g>
))

/* Prospect outreach: a hand-held signal flare, lit. */
const flare = tile((a) => (
  <g>
    <g transform="rotate(-18 32 40)">
      {/* flame: one paper tongue, a hairline core */}
      <path d="M25.5 21C23 15 28 13 27.5 5.5 33 9 40 13 38.5 21z" fill={PAPER} {...O} />
      <path d="M29.5 20.5c-.8-3 1.8-4.6 1.6-8.4 2.6 2.4 4.4 5 3.4 8.4" {...HI} />
      {/* striker cap */}
      <rect x={24} y={21} width={16} height={5} rx={1.5} fill={PAPER} {...O} />
      {/* body */}
      <rect x={25.5} y={26} width={13} height={32} rx={2} fill={a} {...O} />
      <path d="M25.5 33h13M25.5 36h13" {...HP} />
      {/* grip */}
      <rect x={25.5} y={44} width={13} height={14} rx={2} fill={PAPER} {...O} />
      <path d="M25.5 48.5h13M25.5 53h13" {...HI} />
    </g>
    {/* sparks */}
    <path d="M14 10l3.4 3M12 19.5l4.2.2M41 3l-1.6 4M47 9.5l-3.6 2.2M46 19l-4 .6" {...O} fill="none" />
  </g>
))

/* Prep the meeting brief: a boot, laces being tied. */
const bootlaces = tile((a) => (
  <g>
    {/* upper */}
    <path d="M11 50V15q0-4 4-4h15q3 0 3.4 3L35 31q1.6 3.4 8 5l9 2.4q6 1.6 6 7.6V50z" fill={a} {...O} />
    {/* tongue */}
    <path d="M29.6 11.4l2.6-4.2q2.4-1.4 3.6.8l.4 8z" fill={PAPER} {...O} />
    {/* padded cuff */}
    <path d="M11 17v-2q0-4 4-4h15q3 0 3.4 3l.3 3z" fill={PAPER} {...O} />
    {/* toe cap, heel counter and welt */}
    <path d="M44 50q0-10 13.4-10" {...HP} />
    <path d="M11 36q7 0 8.4 14" {...HP} />
    {/* eyelets and crossed laces */}
    <path d="M30.5 20l4.6 3.4M30.8 25.6l4.6-3.2M31.2 26.6l4.8 3.6M31.6 31.8l5-3" {...HP} strokeWidth={1.4} />
    {/* the bow, being pulled tight: two loops, two short ends */}
    <path d="M35 19q.2 4.8 2.6 8.4M35 19q3.4 3.4 7 5" {...O} fill="none" />
    <path d="M35 19C36.6 13.4 42.4 12 42.4 15.2 42.4 17.8 38.6 18.6 35 19z" fill={PAPER} {...O} />
    <path d="M35 19C40.6 17.8 45.4 20 44.2 22.4 43 24.4 38.8 22.4 35 19z" fill={PAPER} {...O} />
    <circle cx={35} cy={19} r={1.5} fill={INK} />
    {/* sole with tread */}
    <path d="M9 50h50q2 0 2 2v3q0 2-2 2H11q-2 0-2-2z" fill={INK} {...O} />
    <path d="M16 57v-2.2M22 57v-2.2M28 57v-2.2M34 57v-2.2M40 57v-2.2M46 57v-2.2M52 57v-2.2" stroke={PAPER} strokeWidth={1} vectorEffect="non-scaling-stroke" />
  </g>
))

/* Onboarding & ops: a canister stove, lit. */
const stove = tile((a) => (
  <g>
    {/* flame: three small tongues */}
    <path d="M26 24c-1.6-2.6.2-4.6 0-7 2 1.6 3.2 4 2.4 7zM31 24c-1.8-3.2.4-5.6 0-8.6 2.4 2 3.8 5 2.8 8.6zM36 24c-1.4-2.6.4-4.4.2-6.8 2 1.6 3 4 2.2 6.8z" fill={PAPER} {...O} />
    {/* pot supports */}
    <path d="M22 28.6L10 23.6v-3M42 28.6l12-5v-3" {...O} fill="none" />
    {/* burner head */}
    <rect x={20} y={24} width={24} height={5.6} rx={2.4} fill={PAPER} {...O} />
    <path d="M24 26.8h16" {...HI} strokeDasharray="1.6 2" />
    {/* valve body and wire handle */}
    <rect x={26.5} y={29.6} width={11} height={7} rx={1.2} fill={PAPER} {...O} />
    <path d="M37.5 33h5.4q2 0 2.6 2.2l1 3.4" {...O} fill="none" />
    <rect x={44} y={37} width={6.4} height={3.6} rx={1.6} transform="rotate(20 47 38.8)" fill={PAPER} {...O} />
    {/* fuel canister */}
    <path d="M13 56V46q0-9 19-9.4Q51 37 51 46v10q0 2-2 2H15q-2 0-2-2z" fill={a} {...O} />
    <rect x={13} y={47} width={38} height={5.4} fill={PAPER} {...O} />
    <path d="M20 42.6q12-3.4 24 0" {...HP} />
  </g>
))

/* Debrief with Advisor: a logbook with its band, and a pencil. */
const logbook = tile((a) => (
  <g>
    {/* page block */}
    <rect x={16} y={10} width={32} height={45} rx={2.4} fill={PAPER} {...O} />
    <path d="M47 14v37" {...HI} />
    {/* cover */}
    <rect x={12} y={7} width={32} height={45} rx={3} fill={a} {...O} />
    <path d="M17 7v45" {...HP} />
    <rect x={22} y={15} width={14} height={8} rx={1} fill={PAPER} {...O} />
    <path d="M25 19h8" {...HI} />
    {/* elastic band */}
    <rect x={38.4} y={7} width={2.6} height={45} fill={INK} />
    {/* pencil, across the corner */}
    <g transform="rotate(-38 45 48)">
      <path d="M27 45h28v6H27z" fill={PAPER} {...O} />
      <path d="M27 48h28" {...HI} />
      <path d="M55 45l7 3-7 3z" fill={PAPER} {...O} />
      <path d="M60 47.2l2 .8-2 .8z" fill={INK} stroke={INK} strokeWidth={1} vectorEffect="non-scaling-stroke" />
      <rect x={23} y={45} width={4} height={6} rx={1} fill={a} {...O} />
    </g>
  </g>
))

/* Morning meeting: a thermos, its cup poured, clock face at 7:30. */
const thermos = tile((a) => {
  // 7:30: hour hand midway between 7 and 8 (225 deg), minute hand at 6
  const cx = 26, cy = 36, hr = (225 * Math.PI) / 180
  return (
    <g>
      {/* stopper */}
      <rect x={18.5} y={6} width={15} height={6} rx={1.6} fill={PAPER} {...O} />
      {/* shoulder */}
      <path d="M15.5 16q0-4 4-4h13q4 0 4 4v2h-21z" fill={PAPER} {...O} />
      {/* body */}
      <rect x={14} y={18} width={24} height={39} rx={3.4} fill={a} {...O} />
      <path d="M14 51h24" {...HP} />
      {/* clock face */}
      <circle cx={cx} cy={cy} r={8.4} fill={PAPER} {...O} />
      <path d={`M${cx} ${cy - 6.6}v1.4M${cx + 6.6} ${cy}h-1.4M${cx} ${cy + 6.6}v-1.4M${cx - 6.6} ${cy}h1.4`} {...HI} />
      <path d={`M${cx} ${cy}L${cx + Math.sin(hr) * 4} ${cy - Math.cos(hr) * 4}M${cx} ${cy}v5.4`} {...O} fill="none" />
      {/* the cup, poured */}
      <path d="M42 41h15l-1.6 14q-.2 2-2.2 2h-7.4q-2 0-2.2-2z" fill={a} {...O} />
      <path d="M42.4 45h14.2" {...HP} />
      {/* steam */}
      <path d="M47 37c-1.6-2 1.6-3 0-5.4M52 37c-1.6-2 1.6-3 0-5.4" {...HI} />
    </g>
  )
})

/* Classroom training: a bound field manual, open, ribbon down. */
const manual = tile((a) => (
  <g>
    {/* ribbon */}
    <path d="M31 50v10.4l2-2.2 2 2.2V50z" fill={a} {...O} />
    {/* cover, seen under the pages */}
    <path d="M4 17l28 5 28-5v34l-28 4-28-4z" fill={a} {...O} />
    {/* page stacks */}
    <path d="M6.4 15.6q13-2 25.6 4.4v31q-12.6-5.4-25.6-3.6z" fill={PAPER} {...O} />
    <path d="M57.6 15.6q-13-2-25.6 4.4v31q12.6-5.4 25.6-3.6z" fill={PAPER} {...O} />
    <path d="M6.4 47.4v1.6M57.6 47.4v1.6" {...HI} />
    {/* left page: set lines; right page: a route sketch */}
    <path d="M11 22.4q8-.6 16 2.6M11 27q8-.6 16 2.6M11 31.6q8-.6 16 2.6M11 36.2q8-.6 13 1.6M11 40.8q8-.6 16 2.6" {...HI} />
    <path d="M37 38.6l6-10 4 5.4 3.4-4.4 5 8" {...HI} />
    <path d="M40 41.8q6-1.8 13-2" {...HI} strokeDasharray="1.4 1.8" />
  </g>
))

/* Role plays: a practice boulder, two small figures roped. */
const boulder = tile((a) => (
  <g>
    {/* the boulder: lit face in paper, shadow facet in the accent */}
    <path d="M20 56l2-18q2-14 16-17l8-1q10 1 12 13l2 23z" fill={PAPER} {...O} />
    <path d="M46 20q10 1 12 13l2 23H47l2-20z" fill={a} {...O} />
    <path d="M26 44l5 2M28 36l4 1.4M35 30l3 2" {...HI} />
    {/* ground */}
    <path d="M3 56h58" {...O} />
    {/* rope from the belayer up to the climber on top */}
    <path d="M11.2 46.4C17 43 22 36 27 29s8-8 11.4-9.6" {...HI} />
    <Figure as="g" variant="rookie" pose="stand" size={20} x={7} y={56} axe={false} pack={false} />
    <Figure as="g" variant="rookie" pose="openHand" size={20} x={39} y={20.4} facing={-1} pack={false} />
  </g>
))

/* CRM & admin: a clipboard of forms, stuffed in a dry bag. */
const forms = tile((a) => (
  <g>
    {/* clipboard, behind the bag */}
    <g transform="rotate(-8 32 24)">
      <rect x={19} y={6} width={26} height={30} rx={2} fill={PAPER} {...O} />
      <rect x={27} y={3.4} width={10} height={5.4} rx={1.2} fill={INK} />
      <path d="M23 14.4h2.6v2.6H23zM23 20.4h2.6v2.6H23z" {...HI} />
      <path d="M28 15.8h13M28 21.8h11M23 27.4h18" {...HI} />
    </g>
    {/* dry bag: stiffened lip, body, buckle strap */}
    <path d="M13 56l-1-22h40l-1 22q0 2-2 2H15q-2 0-2-2z" fill={a} {...O} />
    <rect x={10} y={28} width={44} height={7} rx={3.4} fill={PAPER} {...O} />
    <path d="M14 31.6h36" {...HI} strokeDasharray="1.6 2" />
    <path d="M32 35v23" {...HP} />
    <path d="M10.6 33.2Q6 42 12.6 49" fill="none" stroke={INK} strokeWidth={STROKE} vectorEffect="non-scaling-stroke" />
    <rect x={9} y={45} width={6} height={7} rx={1} fill={PAPER} {...O} />
  </g>
))

/* Deck formatting: a boot-polish tin and a brush. */
const polish = tile((a) => (
  <g>
    {/* brush, behind */}
    <g transform="rotate(-16 44 28)">
      <rect x={31} y={16} width={27} height={10} rx={4} fill={PAPER} {...O} />
      <path d="M36 20.4q8-2 17 0" {...HI} />
      <rect x={33} y={26} width={23} height={8} fill={PAPER} {...O} />
      <path d="M35 26v8M37.6 26v8M40.2 26v8M42.8 26v8M45.4 26v8M48 26v8M50.6 26v8M53.2 26v8" {...HI} />
    </g>
    {/* tin: body, lid band, lid top */}
    <path d="M6 44v7q0 6 20 6t20-6v-7z" fill={PAPER} {...O} />
    <path d="M6 38v6q0 6 20 6t20-6v-6z" fill={a} {...O} />
    <ellipse cx={26} cy={38} rx={20} ry={6.4} fill={a} {...O} />
    <ellipse cx={26} cy={38} rx={13} ry={3.8} {...HP} />
    {/* opener key */}
    <path d="M46 47.4h4.4" {...O} fill="none" />
    <path d="M50 44.4q3.4 3-.2 6l2 1q3-3.8 0-8z" fill={PAPER} {...O} />
  </g>
))

export const GEAR: ArtRegistry = {
  'gear-binoculars': binoculars,
  'gear-leadrope': leadrope,
  'gear-crampons': crampons,
  'gear-flare': flare,
  'gear-bootlaces': bootlaces,
  'gear-stove': stove,
  'gear-logbook': logbook,
  'gear-thermos': thermos,
  'gear-manual': manual,
  'gear-boulder': boulder,
  'gear-forms': forms,
  'gear-polish': polish,
}
