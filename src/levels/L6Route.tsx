'use client'
import { useState } from 'react'
import { useStore } from '@/store/useStore'
import { Level } from '@/components/ui'
import { BRICKS, YEAR_CAPACITY } from '@/content/content'

const brick = (id: string) => BRICKS.find((b) => b.id === id)!
const used = (ids: string[]) => ids.reduce((a, id) => a + brick(id).units, 0)

export default function L6() {
  const { answers, set } = useStore()
  const years = answers.route.years
  const [sel, setSel] = useState<string | null>(null)
  const placedAll = years.flat()

  const drop = (y: number) => {
    if (!sel) return
    if (used(years[y]) + brick(sel).units > YEAR_CAPACITY) return
    const next = years.map((c, i) => (i === y ? [...c, sel] : c))
    set('route', { years: next }); setSel(null)
  }
  const remove = (y: number, idx: number) =>
    set('route', { years: years.map((c, i) => (i === y ? c.filter((_, j) => j !== idx) : c)) })

  const total = BRICKS.reduce((a, b) => a + b.units, 0)
  return (
    <Level
      title="Build their three years."
      sub={`Five units a year, ${total} units of bricks. Something has to be left out — that's the point.`}
      aside={sel ? 'Now tap a year.' : 'Tap a brick, then tap a year.'}
    >
      <div className="grid grid-cols-3 gap-2">
        {years.map((col, y) => (
          <button key={y} type="button" onClick={() => drop(y)}
            aria-label={`Year ${y + 1}, ${used(col)} of ${YEAR_CAPACITY} units used${sel ? `. Place ${brick(sel).label} here` : ''}`}
            className="min-h-[160px] rounded-2xl border p-2 text-left transition"
            style={{
              borderColor: sel && used(col) + (sel ? brick(sel).units : 0) <= YEAR_CAPACITY
                ? 'var(--color-ice)' : 'rgba(185,198,224,0.2)',
              background: 'rgba(10,18,40,0.5)',
            }}>
            <div className="mb-2 flex items-center justify-between text-[12px] text-ink2">
              <span>Year {y + 1}</span><span>{used(col)}/{YEAR_CAPACITY}</span>
            </div>
            <div className="space-y-1">
              {col.map((id, idx) => (
                <span
                  key={idx} role="button" tabIndex={0}
                  aria-label={`Remove ${brick(id).label} from year ${y + 1}`}
                  onClick={(e) => { e.stopPropagation(); remove(y, idx) }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); remove(y, idx) }
                  }}
                  className="block cursor-pointer rounded-lg px-2 py-1 text-[11px] leading-tight"
                  style={{ background: 'rgba(233,185,91,0.18)', border: '1px solid rgba(233,185,91,0.5)', minHeight: 22 * brick(id).units }}>
                  {brick(id).label}
                </span>
              ))}
            </div>
          </button>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {BRICKS.filter((b) => !placedAll.includes(b.id)).map((b) => (
          <button key={b.id} type="button" className="chip" data-on={sel === b.id}
            onClick={() => setSel(sel === b.id ? null : b.id)}>
            {b.label} <span className="ml-1 text-ink2/60">{b.units}</span>
          </button>
        ))}
      </div>
      <p className="mt-3 text-[13px] text-ink2/75">
        {placedAll.length ? `${BRICKS.length - placedAll.length} left out.` : 'Nothing placed yet.'}
        {years[2].length === 0 && placedAll.length > 0 && ' Year three is empty.'}
      </p>
    </Level>
  )
}
export const l6Ready = (y: string[][]) => y.flat().length >= 4
