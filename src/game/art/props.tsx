/* Props. Ids that belong here (spec groups "Props", "Summit", "Follow-ups"):
     kit-rack-covered, rucksack, hand-zone, tarp-out, bench-rerig, signpost,
     luggage-tag, cairn-stone, fu-door, fu-plaque
   States via ArtProps.state: rucksack 'zipped', hand-zone 'closed', tarp-out
   'folded', bench-rerig 'spliced', fu-door 'shut' | 'ajar' | 'open',
   fu-plaque 'filled'. fu-door also takes value = how far open, 0..1 (drives
   the F1 slider continuously; the states are 0, 0.45 and 1).
   cairn-stone: no value = one loose flat stone (the thing you drag); value
   0-5 = the cairn with that many stones stacked on its base slab and the
   rest of the five positions drawn as dashed outlines.

   Long pieces stretch instead of shrinking: signpost, luggage-tag and
   fu-plaque widen their viewBox to the box's aspect when both width and
   height are numbers (e.g. <Art id="signpost" width={320} height={80} />), so
   the arm, the card and the plate grow long enough for typed text. The text
   area of each, in viewBox units with the height fixed at 64, is exported
   below (SIGNPOST_TEXT, TAG_TEXT, PLAQUE_SLOT), x measured from the left
   and x1 from the right edge.

   Style: 64 grid, 1.5px ink outline (non-scaling), one accent per object:
   rucksack forest, hand navy, tarp ink, bench bronze (the deck's vote
   colours), signpost and plaque bronze, luggage tag bronze eyelet, kit rack
   navy (the bricks peeking out under the canvas). No text inside art. */
import { Children, cloneElement, isValidElement, type ReactElement, type ReactNode } from 'react'
import type { ArtProps, ArtRegistry } from './kit'
import { ArtSvg, BRONZE, DAWN, FOREST, INK, NAVY, PAPER, RULE, RULE_SOFT, STROKE } from './kit'

export const PROP_IDS = [
  'kit-rack-covered', 'rucksack', 'hand-zone', 'tarp-out', 'bench-rerig', 'signpost',
  'luggage-tag', 'cairn-stone', 'fu-door', 'fu-plaque',
] as const

/* ------------------------------------------------------------ drawing kit */

const NS = 'non-scaling-stroke' as const
/** The one outline. */
const O = { stroke: INK, strokeWidth: STROKE, vectorEffect: NS, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const }
/** Engraving detail inside a shape: thinner ink. */
const HAIR = { stroke: INK, strokeWidth: 1, vectorEffect: NS, strokeLinecap: 'round' as const, fill: 'none' }

/** Several shapes drawn as one silhouette: a 3px ink pass under a fill pass,
    so the 1.5px outline runs round the union and not across the joins. */
function Union({ fill, children }: { fill: string; children: ReactNode }) {
  const kids = Children.toArray(children).filter(isValidElement) as ReactElement<Record<string, unknown>>[]
  return (
    <>
      {kids.map((k, i) => cloneElement(k, { key: `o${i}`, fill: INK, stroke: INK, strokeWidth: STROKE * 2, vectorEffect: NS, strokeLinejoin: 'round' }))}
      {kids.map((k, i) => cloneElement(k, { key: `f${i}`, fill, stroke: 'none' }))}
    </>
  )
}

/** A viewBox that is 64 tall and as wide as the box asks (min 64). */
function stretch(p: ArtProps, max = 640): [number, number] {
  const w = typeof p.width === 'number' ? p.width : undefined
  const h = typeof p.height === 'number' ? p.height : undefined
  if (w && h && w > h) return [Math.min(max, Math.round((64 * w) / h)), 64]
  return [64, 64]
}

const pts = (a: [number, number][]) => a.map((q) => `${q[0].toFixed(2)},${q[1].toFixed(2)}`).join(' ')

/* ------------------------------------------------------- kit-rack-covered
   Six bricks in two rows of three on a low rack, under a canvas sheet. The
   studs show as bumps in the canvas, the rows as soft folds, and the front
   right corner is lifted to show one navy brick edge: the kit, not yet
   issued. */
function KitRackCovered(p: ArtProps) {
  const cols = [5, 23, 41] // brick left edges; each brick 18 wide, 10 tall
  // the canvas top: over the top row (y 33), a bump for each of two studs per brick
  let top = 'M3.4 54 C2.6 46 3 40 4.2 35.4 Q4.6 33.2 6.4 33'
  cols.forEach((x, i) => {
    for (const sx of [x + 5, x + 13]) {
      top += ` L${sx - 2.6} 33 Q${sx - 2.4} 30.2 ${sx} 30.1 Q${sx + 2.4} 30.2 ${sx + 2.6} 33`
    }
    if (i < 2) top += ` L${x + 17.4} 33 Q${x + 18} 34.2 ${x + 18.6} 33`
  })
  top += ' L57.6 33 Q59.4 33.2 59.8 35.4 C60.8 39 61 41.6 60.8 44.2'
  // the lifted corner: the hem rises from x 42 to the right side at y 44
  const hem = ' L58.8 45.4 Q52 43.4 47.2 47.2 Q44 49.8 41.4 54.2 Q31 55.4 22 54 Q12 53 3.4 54 Z'
  return (
    <ArtSvg vb={[64, 64]} p={p}>
      {/* rack: a plank on two short legs */}
      <rect x={6} y={57} width={3} height={5} fill={PAPER} {...O} />
      <rect x={55} y={57} width={3} height={5} fill={PAPER} {...O} />
      <rect x={2.5} y={54} width={59} height={3.4} rx={0.6} fill={PAPER} {...O} />
      {/* the brick under the lifted corner: navy, one stud line showing */}
      <rect x={41} y={44} width={18} height={10} rx={0.8} fill={NAVY} {...O} />
      <path d="M41.6 47 H58.4" stroke={PAPER} strokeWidth={0.8} vectorEffect={NS} opacity={0.35} />
      {/* the canvas sheet */}
      <path d={top + hem} fill={RULE_SOFT} {...O} />
      {/* the underside of the lifted corner, paler */}
      <path d="M41.4 54.2 Q44 49.8 47.2 47.2 Q52 43.4 58.8 45.4 Q55.4 48.8 50.2 50 Q45 51.2 41.4 54.2 Z" fill={PAPER} {...O} />
      {/* the rows and the bricks' joins, read through the canvas as folds */}
      <path d="M4 44.2 Q22 45.4 40 44.4" {...HAIR} />
      <path d="M23 34.2 Q23.6 39 23.2 43.6 M41 34.2 Q40.4 39 41 43.6 M14 45.4 Q14.6 50 14 53.4 M32 45.2 Q31.4 49.6 32.2 54" {...HAIR} strokeDasharray="1.6 1.6" />
    </ArtSvg>
  )
}

/* ---------------------------------------------------------------- rucksack
   A top-loader: tapered forest body, two shoulder straps looping out at the
   sides, a paper front pocket with a zip.
   Open: the lid flap thrown back, the mouth open, the pocket zip open.
   Zipped: the lid buckled down over the top, the pocket zipped shut with
   its pull at the end. */
function Rucksack(p: ArtProps) {
  const zipped = p.state === 'zipped'
  const body = 'M21 20.5 H43 C46 20.5 48 22 48.6 25 L51.6 54 Q52 60 46 60 H18 Q12 60 12.4 54 L15.4 25 C16 22 18 20.5 21 20.5 Z'
  const strap = (d: string) => (
    <>
      <path d={d} fill="none" stroke={INK} strokeWidth={4.2} strokeLinecap="round" />
      <path d={d} fill="none" stroke={FOREST} strokeWidth={1.6} strokeLinecap="round" />
    </>
  )
  return (
    <ArtSvg vb={[64, 64]} p={p}>
      {/* shoulder straps, looping out at the sides */}
      {strap('M17 25 C8.6 29 8.4 45 12.6 53')}
      {strap('M47 25 C55.4 29 55.6 45 51.4 53')}
      {!zipped && (
        /* the lid flap, thrown back and standing up behind the mouth */
        <path d="M22.4 21.6 C21 13.2 24.6 6.4 32 6.4 C39.4 6.4 43 13.2 41.6 21.6 Z" fill={FOREST} {...O} />
      )}
      <path d={body} fill={FOREST} {...O} />
      {zipped ? (
        <>
          {/* the lid, closed over the top, two straps down to buckles */}
          <path d="M14.6 30 C14.8 19.4 21 14.4 32 14.4 C43 14.4 49.2 19.4 49.4 30 Q32 33 14.6 30 Z" fill={FOREST} {...O} />
          <path d="M19.8 25.4 Q32 22.4 44.2 25.4" stroke={PAPER} strokeWidth={1} vectorEffect={NS} fill="none" strokeDasharray="1.6 1.6" />
          <path d="M24.6 31 V36.4 M39.4 31 V36.4" stroke={INK} strokeWidth={3.2} />
          <rect x={22.4} y={34} width={4.4} height={3} rx={0.5} fill={PAPER} {...O} />
          <rect x={37.2} y={34} width={4.4} height={3} rx={0.5} fill={PAPER} {...O} />
          {/* the haul loop */}
          <path d="M28.6 14.8 Q32 10 35.4 14.8" fill="none" {...O} />
        </>
      ) : (
        <>
          {/* the open mouth, the drawcord slack */}
          <path d="M18.2 23.4 Q32 17.6 45.8 23.4 Q32 28.4 18.2 23.4 Z" fill={INK} {...O} />
          <path d="M20 27.6 Q32 30.6 44 27.6" stroke={PAPER} strokeWidth={0.9} vectorEffect={NS} fill="none" strokeDasharray="1.4 1.6" />
          <path d="M33 28.6 l-1 4.2 M35 28.4 l1.4 4" {...HAIR} stroke={PAPER} />
        </>
      )}
      {/* the front pocket */}
      <path d="M19.4 41 Q32 39 44.6 41 L45.6 53.6 Q45.8 56.4 43 56.4 H21 Q18.2 56.4 18.4 53.6 Z" fill={PAPER} {...O} />
      {zipped ? (
        <>
          {/* the zip, shut: one stitched line, the pull at its right end */}
          <path d="M20.4 44.4 Q32 42.6 43.8 44.4" fill="none" stroke={INK} strokeWidth={1.2} vectorEffect={NS} />
          <path d="M20.4 44.4 Q32 42.6 43.8 44.4" fill="none" stroke={PAPER} strokeWidth={0.6} vectorEffect={NS} strokeDasharray="0.8 1.2" />
          <rect x={42.4} y={44.2} width={2.6} height={4.6} rx={0.8} fill={FOREST} {...O} strokeWidth={1} />
        </>
      ) : (
        <>
          {/* the zip, open: the pocket gapes, the pull back at the left */}
          <path d="M20.4 44.4 Q32 47.2 43.8 44.4 Q32 42.4 20.4 44.4 Z" fill={INK} stroke={INK} strokeWidth={1} vectorEffect={NS} />
          <rect x={19} y={44.6} width={2.6} height={4.6} rx={0.8} fill={FOREST} {...O} strokeWidth={1} />
        </>
      )}
    </ArtSvg>
  )
}

/* --------------------------------------------------------------- hand-zone
   The rookie's gloved hand, palm out, one navy slot on the palm. Closed:
   the fist grips a navy card (the thing in hand). */
function Cuff() {
  return (
    <>
      <rect x={20} y={51} width={26} height={11} rx={1.6} fill={PAPER} {...O} />
      {[24, 28, 32, 36, 40].map((x) => <path key={x} d={`M${x + 1} 53.5 V59.5`} {...HAIR} />)}
    </>
  )
}

function HandZone(p: ArtProps) {
  if (p.state === 'closed') {
    return (
      <ArtSvg vb={[64, 64]} p={p}>
        {/* the held card, navy, behind the fingers */}
        <rect x={25} y={5} width={16} height={24} rx={2} fill={NAVY} {...O} />
        <Union fill={RULE_SOFT}>
          <rect x={18.5} y={20} width={29} height={33} rx={7} />
          <rect x={12.5} y={30} width={10} height={16} rx={5} />
        </Union>
        {/* four curled fingers across the front */}
        {[19.5, 26.5, 33.5, 40.5].map((x) => <rect key={x} x={x} y={21} width={7} height={15} rx={3.5} fill={RULE_SOFT} {...O} />)}
        {/* the thumb wrapped over them */}
        <rect x={13} y={35} width={27} height={8} rx={4} fill={RULE_SOFT} {...O} />
        <Cuff />
      </ArtSvg>
    )
  }
  return (
    <ArtSvg vb={[64, 64]} p={p}>
      <Union fill={RULE_SOFT}>
        <rect x={19.2} y={11} width={7} height={26} rx={3.5} />
        <rect x={26.6} y={7} width={7} height={28} rx={3.5} />
        <rect x={34} y={9} width={7} height={26} rx={3.5} />
        <rect x={41.2} y={15} width={6.4} height={22} rx={3.2} />
        <path d="M19 27 H47.6 V44 Q47.6 53 39 53 H27 Q19 53 19 45 Z" />
        <rect x={-3.6} y={-17} width={7.2} height={19} rx={3.6} transform="translate(21 45) rotate(-52)" />
      </Union>
      {/* finger separations */}
      <path d="M26.4 22 V29 M33.8 21 V28.5 M41.1 24 V30" {...HAIR} />
      {/* the slot: navy, dashed */}
      <circle cx={33.4} cy={39.5} r={7.6} fill={PAPER} stroke={NAVY} strokeWidth={STROKE} vectorEffect={NS} strokeDasharray="2.8 2.2" />
      <Cuff />
    </ArtSvg>
  )
}

/* ---------------------------------------------------------------- tarp-out
   A canvas tarp pegged on the ground, two slots marked in ink (the deck's
   Red). Folded: a corner turned back over its loads. */
function TarpOut(p: ArtProps) {
  if (p.state === 'folded') {
    // the same pegged tarp, its back half folded forward over both slots:
    // a flat flap with a crease along the fold, the paler underside up
    return (
      <ArtSvg vb={[64, 64]} p={p}>
        <path d="M8 29.5 L6.5 25 M56 29.5 L57.5 25" {...O} />
        <path d="M3 53 L1 57.5 M61 53 L63 57.5" {...O} />
        <path d="M10 29 H54 L61.5 53 H2.5 Z" fill={RULE_SOFT} {...O} />
        {/* the loads showing as low bumps under the flap */}
        <path d="M7.6 50.4 L10.6 38.6 Q20 36.2 31 38.4 Q42 36.2 53.4 38.6 L56.4 50.4 Z" fill={PAPER} {...O} />
        {/* the fold line, and the flap's hem */}
        <path d="M10.6 38.6 Q20 36.2 31 38.4 Q42 36.2 53.4 38.6" fill="none" stroke={INK} strokeWidth={2.2} vectorEffect={NS} strokeLinecap="round" />
        <path d="M11 47.6 H53" {...HAIR} strokeDasharray="1.6 1.6" />
        {[[13.6, 49], [50.4, 49], [5.6, 51], [58.4, 51]].map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r={1.2} fill={PAPER} {...O} />
        ))}
      </ArtSvg>
    )
  }
  return (
    <ArtSvg vb={[64, 64]} p={p}>
      {/* pegs */}
      <path d="M8 29.5 L6.5 25 M56 29.5 L57.5 25" {...O} />
      <path d="M3 53 L1 57.5 M61 53 L63 57.5" {...O} />
      {/* the tarp, in perspective */}
      <path d="M10 29 H54 L61.5 53 H2.5 Z" fill={RULE_SOFT} {...O} />
      {/* a fold crease */}
      <path d="M32 29.5 V52.5" {...HAIR} strokeDasharray="2 2" />
      {/* two slots, ink, dashed */}
      <path d={`M${pts([[13.4, 33], [29.3, 33], [29.3, 49], [8.4, 49]])} Z`} fill={PAPER} {...O} strokeDasharray="2.8 2" />
      <path d={`M${pts([[34.7, 33], [50.6, 33], [55.6, 49], [34.7, 49]])} Z`} fill={PAPER} {...O} strokeDasharray="2.8 2" />
      {/* grommets */}
      {[[11.8, 31], [52.2, 31], [5.6, 51], [58.4, 51]].map(([x, y]) => (
        <circle key={x} cx={x} cy={y} r={1.2} fill={PAPER} {...O} />
      ))}
    </ArtSvg>
  )
}

/* ------------------------------------------------------------- bench-rerig
   A trestle bench with two bronze slots on it and a rope across its front:
   two frayed ends to join; 'spliced', one rope with a bronze-served splice. */
function Rope({ d }: { d: string }) {
  return (
    <>
      <path d={d} fill="none" stroke={INK} strokeWidth={4.6} strokeLinecap="round" />
      <path d={d} fill="none" stroke={PAPER} strokeWidth={2.2} strokeLinecap="round" />
      <path d={d} fill="none" stroke={INK} strokeWidth={2.2} strokeDasharray="0.7 2.3" />
    </>
  )
}

function BenchRerig(p: ArtProps) {
  const spliced = p.state === 'spliced'
  return (
    <ArtSvg vb={[64, 64]} p={p}>
      {/* two slots on the bench top, bronze, dashed */}
      {[10, 35].map((x) => (
        <rect key={x} x={x} y={10} width={19} height={16} rx={1.6} fill={PAPER}
          stroke={BRONZE} strokeWidth={STROKE} vectorEffect={NS} strokeDasharray="2.8 2" />
      ))}
      {/* trestle legs and a stretcher */}
      <path d="M9.5 32 H14.5 L10.5 61 H5.5 Z" fill={PAPER} {...O} />
      <path d="M49.5 32 H54.5 L58.5 61 H53.5 Z" fill={PAPER} {...O} />
      <rect x={7.5} y={48} width={49} height={3} fill={PAPER} {...O} />
      {/* the top */}
      <rect x={4} y={27} width={56} height={6} rx={0.8} fill={PAPER} {...O} />
      <path d="M6 30 H16 M44 30.2 H57" {...HAIR} strokeWidth={0.75} />
      {/* the rope over the front */}
      {spliced ? (
        <>
          <Rope d="M7 31 C14 47 50 47 57 31" />
          <path d="M26.5 42.4 C29 43.6 35 43.6 37.5 42.4" fill="none" stroke={INK} strokeWidth={6.4} strokeLinecap="round" />
          <path d="M26.5 42.4 C29 43.6 35 43.6 37.5 42.4" fill="none" stroke={BRONZE} strokeWidth={4} strokeLinecap="round" />
          <path d="M29 41.5 L30 45 M32 41.8 L33 45.4 M35 41.5 L36 45" stroke={PAPER} strokeWidth={0.8} vectorEffect={NS} />
        </>
      ) : (
        <>
          <Rope d="M7 31 C11 41 20 45.5 27.5 44" />
          <Rope d="M57 31 C53 41 44 45.5 36.5 44" />
          {/* frayed ends, served in bronze where they will be joined */}
          <path d="M28.5 44 l2.4 -1.6 M28.8 44 l2.8 0.2 M28.5 44.2 l2.2 1.8" {...HAIR} />
          <path d="M35.5 44 l-2.4 -1.6 M35.2 44 l-2.8 0.2 M35.5 44.2 l-2.2 1.8" {...HAIR} />
          <path d="M25.6 44.3 L27.6 43.9 M38.4 44.3 L36.4 43.9" stroke={BRONZE} strokeWidth={3.2} />
        </>
      )}
    </ArtSvg>
  )
}

/* ---------------------------------------------------------------- signpost
   A carved wooden signpost with one arm pointing on. The arm is bare wood:
   the screen sets the words on it in bronze. Bolts in bronze. */
export const SIGNPOST_TEXT = { x0: 30, x1: 14, y0: 13, y1: 31 }

function Signpost(p: ArtProps) {
  const [W] = stretch(p)
  const tip = W - 3
  return (
    <ArtSvg vb={[W, 64]} p={p}>
      {/* a cairn of ground at the foot */}
      <path d="M8 63 Q12 57.5 21.5 57.5 Q31 57.5 35 63 Z" fill={RULE_SOFT} {...O} />
      {/* the post */}
      <path d="M18 63 V9 L21.5 5.5 L25 9 V63" fill={DAWN} {...O} />
      <path d="M20 36 V58 M23 12 V33" {...HAIR} strokeWidth={0.75} />
      {/* the arm, in front of the post */}
      <path d={`M10 11 H${tip - 9} L${tip} 22 L${tip - 9} 33 H10 Z`} fill={DAWN} {...O} />
      {/* wood grain, kept left of SIGNPOST_TEXT (x from 30) so it never runs through the words */}
      <path d="M12.5 14.6 Q20 13.8 27.5 14.6 M13 29.6 Q19.5 30.2 26.5 29.4" {...HAIR} strokeWidth={0.75} />
      <circle cx={21.5} cy={16} r={1.5} fill={BRONZE} {...O} />
      <circle cx={21.5} cy={28} r={1.5} fill={BRONZE} {...O} />
    </ArtSvg>
  )
}

/* ------------------------------------------------------------- luggage-tag
   A manila card tag on a string, looped round a length of rucksack strap.
   The eyelet is the accent (bronze). The screen sets the typed line on the
   card in Source Serif italic. */
export const TAG_TEXT = { x0: 30, x1: 6, y0: 29, y1: 53 }

function LuggageTag(p: ArtProps) {
  const [W] = stretch(p)
  const r = W - 3
  return (
    <ArtSvg vb={[W, 64]} p={p}>
      {/* the strap, running off the top: a thin ink strap (data.strap
          false leaves it out, when the tag is tied onto a drawn pack) */}
      {(p.data as { strap?: boolean } | undefined)?.strap !== false && <path d="M6 -2 H8.6 V40 H6 Z" fill={INK} />}
      {/* string: behind the strap, round it, down to the eyelet */}
      <path d="M22.5 41 L11 21.2 Q7 23.4 3 21.2 L22.5 41" {...HAIR} strokeWidth={1.1} strokeLinejoin="round" />
      {/* the card, left corners clipped */}
      <path d={`M15 34 L22 27 H${r} V55 H22 L15 48 Z`} fill={DAWN} {...O} />
      {/* eyelet */}
      <circle cx={22.5} cy={41} r={3.6} fill={BRONZE} {...O} />
      <circle cx={22.5} cy={41} r={1.4} fill={PAPER} stroke={INK} strokeWidth={1} vectorEffect={NS} />
    </ArtSvg>
  )
}

/* ------------------------------------------------------------- cairn-stone
   One flat stone, or the cairn: a base slab with five stack positions. The
   five stones share one fill and one weight: no count looks better. */
/** The cairn's five stack positions (0 = bottom): stone i sits with its
    bottom at y = 53.4 - STONE_STEP * i, STONE_STEP + 0.6 tall, centred on
    32 + dx, w wide (64 grid). S10 puts its top-stone hit target from this. */
export const STONES = [
  { w: 42, dx: -0.6 }, { w: 35, dx: 1.2 }, { w: 29, dx: -1 }, { w: 23, dx: 0.8 }, { w: 17, dx: -0.4 },
] as const
export const STONE_STEP = 8.6
const SH = STONE_STEP

/** A flat stone centred on cx, bottom at y: a slightly lopsided lozenge. */
function stoneD(cx: number, y: number, w: number, h: number, k: number) {
  const l = cx - w / 2, r = cx + w / 2, t = y - h
  const a = 0.18 + 0.08 * Math.sin(k * 2.1), b = 0.3 + 0.1 * Math.cos(k * 1.7)
  return `M${l} ${y - h * 0.45}` +
    ` C${l} ${t + h * a} ${cx - w * 0.3} ${t} ${cx + w * 0.02} ${t}` +
    ` C${cx + w * 0.34} ${t} ${r} ${t + h * b} ${r} ${y - h * 0.5}` +
    ` C${r} ${y - h * 0.08} ${cx + w * 0.3} ${y} ${cx} ${y}` +
    ` C${cx - w * 0.32} ${y} ${l} ${y - h * 0.1} ${l} ${y - h * 0.45} Z`
}

function CairnStone(p: ArtProps) {
  if (p.value == null) {
    return (
      <ArtSvg vb={[64, 64]} p={p}>
        <path d={stoneD(32, 45, 50, 17, 2)} fill={RULE_SOFT} {...O} />
        <path d="M14 41 Q22 44 30 44.2 M36 44 Q44 43.6 50 41" {...HAIR} />
        <path d="M22 34 Q30 32 38 33" {...HAIR} strokeWidth={0.75} />
      </ArtSvg>
    )
  }
  const n = Math.max(0, Math.min(5, Math.round(p.value)))
  return (
    <ArtSvg vb={[64, 64]} p={p}>
      {/* base slab, on the ground */}
      <path d="M4 62 L7 55.5 Q20 53 32 53 Q45 53 57 55.5 L60 62 Z" fill={RULE_SOFT} {...O} />
      <path d="M10 59 H22 M40 59.5 H52" {...HAIR} strokeWidth={0.75} />
      {STONES.map((s, i) => {
        const y = 53.4 - i * SH
        const d = stoneD(32 + s.dx, y, s.w, SH + 0.6, i + 1)
        return i < n ? (
          <g key={i}>
            <path d={d} fill={RULE_SOFT} {...O} />
            <path d={`M${32 + s.dx - s.w * 0.28} ${y - 2} Q${32 + s.dx} ${y - 0.8} ${32 + s.dx + s.w * 0.26} ${y - 2}`} {...HAIR} strokeWidth={0.75} />
          </g>
        ) : (
          <path key={i} d={d} fill="none" stroke={RULE} strokeWidth={1} vectorEffect={NS} strokeDasharray="2.2 2" />
        )
      })}
    </ArtSvg>
  )
}

/* ------------------------------------------------------------------ fu-door
   The classroom door in its frame, brass latch. One drawing: the leaf turns
   on its hinge (value 0 shut .. 1 open); beyond it, a client's chair. */
const DOOR_OPEN: Record<string, number> = { shut: 0, ajar: 0.45, open: 1 }

function FuDoor(p: ArtProps) {
  const o = Math.max(0, Math.min(1, p.value ?? DOOR_OPEN[p.state ?? 'shut'] ?? 0))
  const a = (o * 80 * Math.PI) / 180
  const X0 = 16, Y0 = 8, Y1 = 58, WD = 32
  const wv = WD * Math.cos(a)
  const dy = 5 * Math.sin(a)
  // leaf-local (u across from the hinge, v down) to the page
  const at = (u: number, v: number): [number, number] => {
    const top = Y0 - dy * u, bot = Y1 + dy * 0.5 * u
    return [X0 + wv * u, top + (bot - top) * v]
  }
  const quad = (u0: number, u1: number, v0: number, v1: number) =>
    `M${pts([at(u0, v0), at(u1, v0), at(u1, v1), at(u0, v1)])} Z`
  const latch = at(0.86, 0.54)
  return (
    <ArtSvg vb={[64, 64]} p={p}>
      {/* the frame and the room beyond */}
      <rect x={11.5} y={3.5} width={41} height={55} fill={PAPER} {...O} />
      <rect x={X0} y={Y0} width={WD} height={Y1 - Y0} fill={RULE_SOFT} {...O} />
      <path d={`M${X0} 48 H${X0 + WD}`} {...HAIR} strokeWidth={0.75} />
      {/* the client's chair beyond: a plain armchair */}
      <g>
        <rect x={35} y={33} width={11} height={16} rx={1.5} fill={PAPER} {...O} />
        <rect x={33} y={42} width={15} height={5} rx={1.5} fill={PAPER} {...O} />
        <path d="M35 47 V55 M46 47 V55" {...O} />
      </g>
      {/* the floor */}
      <path d="M2 58.5 H62" {...O} />
      {/* the leaf */}
      <path d={quad(0, 1, 0, 1)} fill={PAPER} {...O} />
      {o < 0.97 && (
        <>
          <path d={quad(0.16, 0.84, 0.07, 0.44)} {...HAIR} />
          <path d={quad(0.16, 0.84, 0.56, 0.93)} {...HAIR} />
          {/* brass latch */}
          <rect x={latch[0] - 1.6} y={latch[1] - 3.4} width={3.2} height={6.8} rx={0.8} fill={BRONZE} {...O} />
          <path d={`M${latch[0]} ${latch[1] - 1} h${-4.2 * Math.cos(a) - 0.6}`} stroke={INK} strokeWidth={2.2} strokeLinecap="round" />
        </>
      )}
    </ArtSvg>
  )
}

/* ---------------------------------------------------------------- fu-plaque
   The blank brass plaque from card-certify, close up, with one drop slot.
   'filled': the slot outline turns solid once a method has settled in. */
export const PLAQUE_SLOT = { x0: 13, x1: 13, y0: 21, y1: 43 }

function FuPlaque(p: ArtProps) {
  const [W] = stretch(p)
  const filled = p.state === 'filled'
  return (
    <ArtSvg vb={[W, 64]} p={p}>
      <rect x={3} y={11} width={W - 6} height={42} rx={3} fill={BRONZE} {...O} />
      <rect x={6.5} y={14.5} width={W - 13} height={35} rx={1.5} fill="none" stroke={PAPER} strokeWidth={0.9} vectorEffect={NS} />
      {[[9.5, 17.5], [W - 9.5, 17.5], [9.5, 46.5], [W - 9.5, 46.5]].map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <circle cx={x} cy={y} r={1.9} fill={PAPER} stroke={INK} strokeWidth={1} vectorEffect={NS} />
          <path d={`M${x - 1.1} ${y + 1.1} L${x + 1.1} ${y - 1.1}`} {...HAIR} strokeWidth={0.8} />
        </g>
      ))}
      <rect x={PLAQUE_SLOT.x0} y={PLAQUE_SLOT.y0} width={W - PLAQUE_SLOT.x0 - PLAQUE_SLOT.x1} height={PLAQUE_SLOT.y1 - PLAQUE_SLOT.y0} rx={2}
        fill="none" stroke={PAPER} strokeWidth={STROKE} vectorEffect={NS} strokeDasharray={filled ? undefined : '3 2.4'} />
    </ArtSvg>
  )
}

export const PROPS: ArtRegistry = {
  'kit-rack-covered': KitRackCovered,
  rucksack: Rucksack,
  'hand-zone': HandZone,
  'tarp-out': TarpOut,
  'bench-rerig': BenchRerig,
  signpost: Signpost,
  'luggage-tag': LuggageTag,
  'cairn-stone': CairnStone,
  'fu-door': FuDoor,
  'fu-plaque': FuPlaque,
}
