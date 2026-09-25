'use client'
/* Figure: the climber, as SVG. Adapted from the canvas figure in
   src/scene/survey.ts (same proportions: pack, axe, hat, faceless head),
   redrawn to the art style: flat fills, ink outline, one accent.

   variant  rookie  forest jacket: the next climber (every screen about them)
            you     bronze jacket: the respondent (only S04 Beat B and S08)
            ghost   bronze outline only: the respondent waiting (S04 Beat B)
   pose     stand | stride (t = phase in radians) | crouch (shoulder a load)
            | openHand (arm out, hand open) | setDown (crouched, kit on the rock)
   Motion is transforms on limb groups of this one figure, never frame sets.

   Coordinates: feet at (0,0), head up at about y = -24. With as="svg" the
   figure is its own <svg>, `size` px tall. With as="g" it draws into a parent
   SVG at (x, y) and `size` is in the parent's user units (RouteSlider thumbs).

   `carry` is drawn on the back (the pack's place, 6x8 units at (-7,-19)), and
   `hand` at the front hand: use them to show what the rookie carries. */
import type { CSSProperties, ReactNode } from 'react'

export type FigureVariant = 'rookie' | 'you' | 'ghost'
export type FigurePose = 'stand' | 'stride' | 'crouch' | 'openHand' | 'setDown'

export type FigureProps = {
  variant?: FigureVariant
  pose?: FigurePose
  /** Stride phase in radians (pose 'stride'). Feed ThumbState.stride. */
  t?: number
  /** Height: px for as="svg", user units for as="g". Default 48. */
  size?: number
  /** 1 faces right (uphill), -1 faces left. */
  facing?: 1 | -1
  as?: 'svg' | 'g'
  /** as="g" only: where the feet stand. */
  x?: number
  y?: number
  /** Show the ice axe. Default: true except openHand and setDown. */
  axe?: boolean
  /** Show the pack. Default true. */
  pack?: boolean
  /** Drawn on the back, in figure units. */
  carry?: ReactNode
  /** Drawn at the front hand, in figure units. */
  hand?: ReactNode
  /** Accessible name; without it the figure is decorative (aria-hidden). */
  title?: string
  className?: string
  style?: CSSProperties
}

const INK = '#0D0C0B'
const PAPER = '#F8F7F4'
const JACKET: Record<FigureVariant, string> = { rookie: '#1F4B3A', you: '#7A3E12', ghost: 'none' }

const H = 26 // viewBox height in figure units (y from -25 to 1)
const VB = { x: -9, y: -25, w: 22, h: H }

type P = { x: number; y: number }
const lerp = (a: P, b: P, u: number): P => ({ x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u })

/** Joint positions for a pose. Pure, so poses stay consistent everywhere. */
export function skeleton(pose: FigurePose, t = 0) {
  let hip: P = { x: 0, y: -9 }
  let shoulder: P = { x: 1, y: -17 }
  let backFoot: P = { x: -2.4, y: 0 }
  let frontFoot: P = { x: 3, y: 0 }
  let backKnee: P = { x: -1.2, y: -4.6 }
  let frontKnee: P = { x: 1.8, y: -4.6 }
  let hand: P = { x: 5.5, y: -12.5 }
  let bob = 0

  if (pose === 'stride') {
    const s = Math.sin(t) * 3.2
    backFoot = { x: -3 + s, y: 0 }
    frontFoot = { x: 4 - s, y: -Math.max(0, Math.cos(t)) * 1.2 }
    backKnee = { x: (hip.x + backFoot.x) / 2 + 0.6, y: -4.6 }
    frontKnee = { x: (hip.x + frontFoot.x) / 2 + 1, y: -4.8 }
    bob = Math.abs(Math.cos(t)) * 0.5
    hand = { x: 5.5 - s * 0.25, y: -12.5 }
  } else if (pose === 'crouch' || pose === 'setDown') {
    hip = { x: -0.4, y: -6 }
    shoulder = { x: 2.6, y: -13.6 }
    backFoot = { x: -2.6, y: 0 }
    frontFoot = { x: 3.2, y: 0 }
    backKnee = { x: 1.4, y: -3.4 }
    frontKnee = { x: 4.6, y: -4.2 }
    hand = pose === 'setDown' ? { x: 7.2, y: -3.2 } : { x: 6, y: -10 }
  } else if (pose === 'openHand') {
    hand = { x: 7.6, y: -15.2 }
  }
  hip = { x: hip.x, y: hip.y + bob }
  shoulder = { x: shoulder.x, y: shoulder.y + bob }
  const neck = lerp(hip, shoulder, 1.18)
  const head: P = { x: neck.x + 0.3, y: neck.y - 1.9 }
  const armRoot = lerp(hip, shoulder, 0.82)
  return { hip, shoulder, backFoot, frontFoot, backKnee, frontKnee, hand, head, armRoot }
}

export default function Figure({
  variant = 'rookie', pose = 'stand', t = 0, size = 48, facing = 1, as = 'svg',
  x = 0, y = 0, axe, pack = true, carry, hand, title, className, style,
}: FigureProps) {
  const k = skeleton(pose, t)
  const ghost = variant === 'ghost'
  const jacket = JACKET[variant]
  const line = ghost ? '#7A3E12' : INK
  const showAxe = axe ?? (pose !== 'openHand' && pose !== 'setDown')
  // a 1.5px outline at any size (in 'g' mode this assumes the parent's user
  // units are roughly CSS px, which holds for every slider in the game)
  const ow = 1.5 / (size / H)
  const limb = (a: P, b: P, c: P, w: number, key: string) => (
    <g key={key}>
      {!ghost && <polyline points={`${a.x},${a.y} ${b.x},${b.y} ${c.x},${c.y}`} fill="none" stroke={INK} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />}
      {ghost && <polyline points={`${a.x},${a.y} ${b.x},${b.y} ${c.x},${c.y}`} fill="none" stroke={line} strokeWidth={ow} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={`${ow * 2} ${ow * 1.5}`} />}
    </g>
  )

  const body = (
    <g transform={facing === -1 ? 'scale(-1 1)' : undefined} data-pose={pose}>
      {/* pack, behind */}
      {pack && pose !== 'setDown' && (
        <g data-limb="pack">
          <rect x={-6.4 + (k.shoulder.x - 1)} y={-19 + (k.shoulder.y + 17)} width={5} height={8.6} rx={1.4}
            fill={ghost ? 'none' : PAPER} stroke={line} strokeWidth={ow} />
          {carry && <g transform={`translate(${-7 + (k.shoulder.x - 1)} ${-19 + (k.shoulder.y + 17)})`}>{carry}</g>}
        </g>
      )}
      {pack && pose === 'setDown' && (
        <g data-limb="pack">
          <rect x={7.6} y={-5.2} width={5} height={5.2} rx={1.2} fill={ghost ? 'none' : PAPER} stroke={line} strokeWidth={ow} />
          {carry && <g transform="translate(7 -6)">{carry}</g>}
        </g>
      )}
      {/* legs */}
      <g data-limb="legs">
        {limb(k.hip, k.backKnee, k.backFoot, 2.4, 'b')}
        {limb(k.hip, k.frontKnee, k.frontFoot, 2.4, 'f')}
      </g>
      {/* axe */}
      {showAxe && (
        <g data-limb="axe" stroke={line} strokeLinecap="round">
          <line x1={k.hand.x - 0.4} y1={k.hand.y - 0.8} x2={k.hand.x + 3.4} y2={Math.min(-0.8, k.hand.y + 11.5)} strokeWidth={1.3} />
          <line x1={k.hand.x - 1.8} y1={k.hand.y - 1.2} x2={k.hand.x + 1.4} y2={k.hand.y - 0.4} strokeWidth={1.3} />
        </g>
      )}
      {/* torso: jacket fill with an ink outline (double stroke) */}
      <g data-limb="torso">
        {!ghost && <line x1={k.hip.x} y1={k.hip.y} x2={k.shoulder.x} y2={k.shoulder.y} stroke={INK} strokeWidth={4.4 + ow * 2} strokeLinecap="round" />}
        <line x1={k.hip.x} y1={k.hip.y} x2={k.shoulder.x} y2={k.shoulder.y}
          stroke={ghost ? 'none' : jacket} strokeWidth={4.4} strokeLinecap="round" />
        {ghost && (
          <rect x={-2.2} y={-2.2} width={4.4} height={Math.hypot(k.shoulder.x - k.hip.x, k.shoulder.y - k.hip.y) + 4.4} rx={2.2}
            fill="none" stroke={line} strokeWidth={ow}
            transform={`translate(${k.shoulder.x} ${k.shoulder.y}) rotate(${(Math.atan2(k.hip.y - k.shoulder.y, k.hip.x - k.shoulder.x) * 180) / Math.PI - 90})`} />
        )}
      </g>
      {/* arm */}
      <g data-limb="arm">
        {!ghost && <line x1={k.armRoot.x} y1={k.armRoot.y} x2={k.hand.x} y2={k.hand.y} stroke={INK} strokeWidth={2 + ow * 2} strokeLinecap="round" />}
        <line x1={k.armRoot.x} y1={k.armRoot.y} x2={k.hand.x} y2={k.hand.y}
          stroke={ghost ? line : jacket} strokeWidth={ghost ? ow : 2} strokeLinecap="round" />
        {pose === 'openHand' && (
          <g stroke={line} strokeWidth={ow} strokeLinecap="round">
            <line x1={k.hand.x} y1={k.hand.y} x2={k.hand.x + 1.6} y2={k.hand.y - 1.1} />
            <line x1={k.hand.x} y1={k.hand.y} x2={k.hand.x + 1.9} y2={k.hand.y} />
            <line x1={k.hand.x} y1={k.hand.y} x2={k.hand.x + 1.5} y2={k.hand.y + 1} />
          </g>
        )}
        {hand && <g transform={`translate(${k.hand.x} ${k.hand.y})`} data-limb="hand">{hand}</g>}
      </g>
      {/* head and hat: faceless */}
      <g data-limb="head">
        <circle cx={k.head.x} cy={k.head.y} r={2.8} fill={ghost ? 'none' : PAPER} stroke={line} strokeWidth={ow} />
        <path d={`M${k.head.x - 3.3} ${k.head.y - 1.3} A3.3 1.9 0 0 1 ${k.head.x + 3.3} ${k.head.y - 1.3} Z`}
          fill={ghost ? 'none' : jacket} stroke={line} strokeWidth={ow} strokeLinejoin="round" />
      </g>
    </g>
  )

  const a11y = title ? { role: 'img', 'aria-label': title } : { 'aria-hidden': true as const }

  if (as === 'g') {
    const s = size / H
    return (
      <g transform={`translate(${x} ${y}) scale(${s})`} className={className} style={style} {...a11y} data-figure={variant}>
        {body}
      </g>
    )
  }
  return (
    <svg
      width={(size * VB.w) / VB.h}
      height={size}
      viewBox={`${VB.x} ${VB.y} ${VB.w} ${VB.h}`}
      className={className}
      style={{ overflow: 'visible', ...style }}
      {...a11y}
      data-figure={variant}
    >
      {body}
    </svg>
  )
}
