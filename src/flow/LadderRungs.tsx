'use client'
import { LadderScene } from '@/components/LadderScene'
import { RUNGS, SHORT } from '@/content/ladder'

/* The AI explainer: the same Monday meeting prep at each of the five rungs.
   Real text, not an image, so it reads on any phone and to a screen reader.
   Every row has the same shape and the same weight, and the footer says the
   one thing that does not change, so no rung reads as the right answer. */
export function LadderRungs() {
  return (
    <div>
      <ol className="grid gap-3">
        {RUNGS.map((r) => (
          <li key={r.id} className="grid grid-cols-[112px_1fr] items-start gap-3 border border-rule-soft bg-ground p-2.5">
            <LadderScene rung={r.id} width={112} />
            <div className="min-w-0">
              <p className="font-[family-name:var(--font-ui)] text-[14px] font-semibold leading-snug text-ink">{SHORT[r.id].label}</p>
              <p className="mt-0.5 font-[family-name:var(--font-ui)] text-[12px] leading-snug text-muted">{SHORT[r.id].eg}</p>
              <p className="mt-1.5 text-[14px] leading-snug text-ink-2">{SHORT[r.id].you}</p>
              <p className="mt-1 text-[13px] leading-snug text-ink-2">
                <span className="font-[family-name:var(--font-ui)] text-[11px] uppercase tracking-[0.1em] text-bronze">Page nine </span>
                {SHORT[r.id].catches}
              </p>
            </div>
          </li>
        ))}
      </ol>
      <p className="mt-4 border-t border-rule-soft pt-3 text-[14px] leading-snug text-ink-2">
        Every version has the same wrong date on page nine.
      </p>
    </div>
  )
}
