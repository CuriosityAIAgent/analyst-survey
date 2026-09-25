/* Shared drawing kit for every art file: tokens, the ArtProps contract, and
   ArtSvg, which sizes an <svg> from ArtProps. Read STYLE.md before drawing. */
import type { CSSProperties, ReactElement, ReactNode } from 'react'

export const INK = '#0D0C0B'
export const PAPER = '#F8F7F4'
export const NAVY = '#14233B'
export const BRONZE = '#7A3E12'
export const FOREST = '#1F4B3A'
export const RULE = '#8C857A'
export const RULE_SOFT = '#DDD9D2'
export const DAWN = '#E9D5BB'
/** The one outline weight, in px. Use vectorEffect="non-scaling-stroke". */
export const STROKE = 1.5
export type Accent = 'navy' | 'bronze' | 'forest' | 'ink'
export const ACCENT: Record<Accent, string> = { navy: NAVY, bronze: BRONZE, forest: FOREST, ink: INK }

export type ArtProps = {
  /** Height in px; width follows the art's aspect. Default: natural size. */
  size?: number
  /** Explicit CSS size (overrides size), e.g. '100%' for scenes. */
  width?: number | string
  height?: number | string
  /** Named state: 'zipped' (rucksack), 'closed' (hand-zone), 'folded' (tarp-out),
      'shut' | 'ajar' | 'open' (fu-door), 'ghost' | 'solid' (bootprints) ... */
  state?: string
  /** Numeric parameter: snow-overlay density 0-4, route-layers precision 0-4,
      cairn-stone count 0-5, strap-kit bricks ... */
  value?: number
  /** Extra data some pieces need (strap-kit: which bricks). Keep it serialisable. */
  data?: unknown
  /** Accent override where a piece is recoloured by context (rare: see STYLE.md). */
  accent?: Accent
  /** Accessible name. Without it the art is decorative (aria-hidden). */
  title?: string
  className?: string
  style?: CSSProperties
}
export type ArtComponent = (p: ArtProps) => ReactElement | null
export type ArtRegistry = Record<string, ArtComponent>

/** Natural size (the viewBox) for an id when the piece is not drawn yet. */
export function naturalSize(id: string): [number, number] {
  if (id.startsWith('scene-')) return [390, 660]
  if (id.startsWith('brick-')) return [72, 30]
  if (id === 'route-layers') return [360, 60]
  if (id === 'snow-overlay') return [300, 300]
  if (id === 'baseplate') return [270, 224]
  if (id === 'crate') return [72, 224]
  if (id === 'track-switchback') return [200, 340]
  if (id === 'track-ridge') return [360, 120]
  if (id === 'rope-clips') return [360, 80]
  if (id.startsWith('zone-')) return [171, 100]
  return [64, 64]
}

/** Size an <svg> from ArtProps. `vb` is the viewBox [w, h]; `fill` makes it
    cover its box (scenes: preserveAspectRatio slice, anchored at the ground). */
export function ArtSvg({ vb, p, children, fill, preserve }: {
  vb: [number, number]
  p: ArtProps
  children: ReactNode
  fill?: boolean
  preserve?: string
}) {
  const w = p.width ?? (p.size ? (p.size * vb[0]) / vb[1] : fill ? '100%' : vb[0])
  const h = p.height ?? (p.size ? p.size : fill ? '100%' : vb[1])
  const a11y = p.title ? { role: 'img' as const, 'aria-label': p.title } : { 'aria-hidden': true as const }
  return (
    <svg
      viewBox={`0 0 ${vb[0]} ${vb[1]}`}
      width={w}
      height={h}
      preserveAspectRatio={preserve ?? (fill ? 'xMidYMax slice' : 'xMidYMid meet')}
      className={p.className}
      style={{ display: 'block', overflow: 'visible', ...p.style }}
      {...a11y}
    >
      {children}
    </svg>
  )
}
