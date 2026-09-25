'use client'
/* CairnRuler: all five S10 anchors at once (design 5, S10 A; decision 2: on
   both channels). One row per stone count, "1 Rebuild it" up to "5 Don't
   touch it", so both ends and the middle of the scale are readable before
   the first stone goes on. The current level is ink and semibold, the rest
   muted. It is drawn only: it stores nothing and takes no input (the cairn
   and the pile stay the controls), so the answer means the same with it.

   The parent places the rows (px inside its own positioned box):
     desk   rows at the stones' own heights beside the cairn, with a dotted
            leader from each stone slot to its label
     phone  rows stacked above the loose pile (no room at the stones' own
            heights there), numbered so the count still maps to the label */
import type { CSSProperties } from 'react'

export type RulerRow = {
  /** 1..5 */
  n: number
  label: string
  /** Row centre, px from the top of the parent box. */
  y: number
  /** Desk: where the dotted leader starts (the stone slot's right edge). */
  from?: number
}

const INK = '#0D0C0B'
const MUTED = '#6B6761'
const RULE = '#8C857A'

export default function CairnRuler({ rows, current, x, size = 12, gap = 8, className, style }: {
  rows: RulerRow[]
  /** Stones on the cairn now (0 = none). */
  current: number
  /** Left edge of the labels, px. */
  x: number
  /** Label size in px (Archivo). */
  size?: number
  /** Space between a leader's end and its label. */
  gap?: number
  className?: string
  style?: CSSProperties
}) {
  const lh = Math.round(size * 1.3)
  return (
    <div className={`pointer-events-none absolute inset-0 ${className ?? ''}`} style={style} aria-hidden data-cairn-ruler={current}>
      <svg className="absolute inset-0 h-full w-full overflow-visible">
        {rows.map((r) => r.from !== undefined && (
          <line key={r.n} x1={r.from} y1={r.y} x2={x - gap} y2={r.y}
            stroke={r.n === current ? INK : RULE} strokeWidth={r.n === current ? 1.2 : 1} strokeDasharray="1.5 3.5" strokeLinecap="round" />
        ))}
      </svg>
      {rows.map((r) => {
        const on = r.n === current
        return (
          <div key={r.n} className="absolute flex items-center whitespace-nowrap rounded-[2px] font-[family-name:var(--font-ui)]"
            style={{
              left: x - 4, top: r.y - lh / 2, height: lh, padding: '0 4px', fontSize: size, lineHeight: `${lh}px`,
              // the camp's paper behind each label, so no scene line runs through it
              background: 'var(--halo, #F8F7F4)',
              color: on ? INK : MUTED, fontWeight: on ? 600 : 400, transition: 'color 160ms',
            }}
            data-ruler-row={r.n}>
            <span className="mr-[0.5em] inline-block text-right tabular-nums" style={{ width: '0.8em', color: on ? INK : RULE }}>{r.n}</span>
            {r.label}
          </div>
        )
      })}
    </div>
  )
}
