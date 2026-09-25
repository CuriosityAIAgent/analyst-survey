'use client'
/* Pieces of the S05 plate both views draw: the (i) peek button, the route
   strip (sharpens with the Day-one kit) and the crate tilt. Moved here from
   S05.tsx unchanged so S05Desk can share them. */
import Figure from '../../Figure'
import { Art } from '../../art'
import { routePoint } from '../../art/nav'
import { campPaper } from '../../feel'

const CAMP2_PAPER = campPaper('S05')

/** A small fixed tilt per brick in the crate (tossed in, not stacked). */
export function tilt(id: string, i: number) {
  let h = 0
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) | 0
  return ((Math.abs(h) % 7) - 3) + (i % 2 ? 1.5 : -1.5)
}


/* ------------------------------------------------------------------ the "i" corner */

/** A 26px 'i' glyph with a 44px hit area, on the brick's right edge (not
    its top corner, so it never overlaps the brick above's hit area). In the
    crate, at the screen's edge, it sits just inside the brick. */
export function PeekButton({ label, onOpen, inside = false }: { label: string; onOpen: (via: string) => void; inside?: boolean }) {
  const stop = (e: { stopPropagation: () => void }) => e.stopPropagation()
  return (
    <button
      type="button"
      aria-label={`About ${label}`}
      onPointerDown={stop}
      onPointerUp={stop}
      onKeyDown={(e) => { e.stopPropagation(); if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen('key') } }}
      onClick={(e) => { e.stopPropagation(); onOpen('tap') }}
      className={`absolute top-1/2 z-10 flex h-[44px] w-[44px] -translate-y-1/2 items-center justify-center ${inside ? '-right-[8px]' : '-right-[26px]'}`}
      data-peek-button
    >
      <span className="flex h-[17px] w-[17px] items-center justify-center rounded-full border border-ink bg-paper font-[family-name:var(--font-text)] text-[12px] italic leading-none text-ink">
        i
      </span>
    </button>
  )
}

/* ------------------------------------------------------------------ the route strip

   <Art id="route-layers" value={precision}> (drawn in code by the art: pencil,
   dotted, waypoints, weather and timings), set a little to the right so the
   rookie can stand at its start. The rock underfoot follows the same path
   (routePoint). The rookie and the bootprints behind them are the screen's
   own and never move here: only steps draw that line. */
const R = { dx: 30, dy: 3, s: 0.9 } // where the 360x60 route art sits in the strip
const at = (t: number) => {
  const q = routePoint(t)
  return { x: R.dx + q.x * R.s, y: R.dy + q.y * R.s }
}
const START = at(0)
/** A short rock ledge under the rookie; the camp scene carries the terrain. */
const GROUND = `M 0 ${START.y + 5.5} L ${START.x + 6} ${START.y + 5.5} l 5 2.5`
const INK = '#0D0C0B'
const ROUTE_WORDS = [
  'The route ahead is blank.',
  'The route ahead: a pencil line.',
  'The route ahead: dotted.',
  'The route ahead: dotted, with waypoints.',
  'The route ahead: waypoints, weather and timings.',
]

export function RouteStrip({ precision, n }: { precision: number; n: number }) {
  return (
    <svg viewBox="0 0 360 60" width="100%" height={60} preserveAspectRatio="xMidYMid meet" className="absolute inset-0 overflow-visible"
      role="img" aria-label={ROUTE_WORDS[precision]} data-testid="route-strip" data-precision={precision}>
      {/* the rock underfoot */}
      <path d={GROUND} fill="none" stroke={INK} strokeWidth={1.2} strokeLinecap="round" />
      {/* the route ahead, redrawn as Day-one bricks go on */}
      <g transform={`translate(${R.dx} ${R.dy}) scale(${R.s})`} aria-hidden>
        <g key={precision} className="motion-safe:animate-[route-in_280ms_ease-out]">
          <Art id="route-layers" value={precision} data={{ n, halo: CAMP2_PAPER }} width={360} height={60} />
        </g>
      </g>
      {/* bootprints behind: solid ink, drawn only by steps, unchanged here */}
      <g fill={INK} data-bootprints aria-hidden>
        {[2, 9, 16].map((x, i) => (
          <ellipse key={x} cx={x} cy={START.y + (i % 2 ? 3.4 : 5.6)} rx={2} ry={1} />
        ))}
      </g>
      <Figure as="g" x={START.x - 6} y={START.y + 5.5} size={40} pose="stand" />
      <style>{'@keyframes route-in{from{opacity:.15}to{opacity:1}}'}</style>
    </svg>
  )
}
