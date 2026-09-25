'use client'
/* GroundBand: the solid ground a tray sits on. The camp scene runs behind
   the whole frame, so without it the tents, stones, crack ticks and slope
   lines of the scene show through the tray between tiles. The band fills
   from its own top edge to the bottom of the screen, full-bleed, in the
   camp's ground colour, with no line work inside it: one soft hairline
   along its top is the ground line the tray stands on.

   Put it as the first child of the tray's positioned wrapper:
     <div className="relative"><GroundBand camp={2} inset={-10} />…tiles…</div>
   `inset` pulls it past the wrapper's sides to reach the screen edges; the
   band runs 400px below (the frame clips it). The footer (Continue, the
   camp walk) renders after the stage, so it sits on top of the band. */
import { groundFor } from './art/scenes'

export default function GroundBand({ camp, top = 0, bleed = 40, edge = true }: {
  camp: number
  /** px from the wrapper's top to the band's top edge (negative = above). */
  top?: number
  /** px the band reaches past the wrapper on each side. */
  bleed?: number
  /** Draw the hairline ground line along the top. */
  edge?: boolean
}) {
  const g = groundFor(camp)
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute"
      style={{ top, left: -bleed, right: -bleed, bottom: -400, background: g, zIndex: -1 }}
      data-ground-band
    >
      {edge && (
        <svg className="absolute inset-x-0 top-0 h-[6px] w-full" viewBox="0 0 400 6" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
          <path d="M0 1.2 C40 0.2 70 2.4 120 1.4 S210 0.4 260 1.6 S350 2.2 400 0.8" fill="none" stroke="#0D0C0B" strokeWidth={1} vectorEffect="non-scaling-stroke" opacity={0.55} />
        </svg>
      )}
    </div>
  )
}
