'use client'
/* Checklist: the live status in the desk panel (design 3.3, item 4).
   One row per target (a colour dot, its plain name, have/need), a summary
   line ("5 of 8 slots filled"), and a "Holding: …" line for the lifted,
   focused or hovered item. A row with `flash` set pulses once (a refused
   drop) and its `note` says why.

   Screens pass it through Frame:
     <Frame status={[{ id: 'rucksack', label: 'Do more of this', color: GREEN, have: 2, need: 3 }]}
            summary="5 of 8 slots filled" holding={lifted && 'Paper map · LLM chat'} …>
   `collapsed` (a short panel) keeps only the summary and holding lines. */
import type { ReactNode } from 'react'
import { motion } from 'motion/react'

export type StatusRow = {
  id: string
  /** The target's plain name. */
  label: string
  /** Zone colour for the dot. Default: rule. */
  color?: string
  have?: number
  /** Capacity; omit for an open target (shows just `have`). */
  need?: number | null
  /** Pulse once and show `note` (e.g. "full: drop on a slot to swap"). Change
      the value (a counter) to pulse again. */
  flash?: number | boolean
  note?: string
}

export default function Checklist({ rows, summary, holding, collapsed }: {
  rows?: StatusRow[]
  summary?: ReactNode
  holding?: ReactNode
  collapsed?: boolean
}) {
  if (!rows?.length && !summary && !holding) return null
  return (
    <div className="font-[family-name:var(--font-ui)] text-[14px] leading-[20px] text-ink-2" data-checklist aria-live="polite">
      {!collapsed && rows?.length ? (
        <ul className="mb-1 flex flex-col gap-[2px]">
          {rows.map((r) => (
            <motion.li
              key={`${r.id}#${String(r.flash ?? '')}`}
              className="-mx-2 flex items-center gap-2 rounded-[2px] px-2"
              initial={r.flash ? { backgroundColor: 'rgba(122,62,18,0.16)' } : false}
              animate={{ backgroundColor: 'rgba(122,62,18,0)' }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
              data-status-row={r.id}
            >
              <span className="inline-block h-[8px] w-[8px] shrink-0 rounded-full" style={{ background: r.color ?? '#8C857A' }} aria-hidden />
              <span className="min-w-0 flex-1 truncate">{r.label}</span>
              {r.have !== undefined && (
                <span className="shrink-0 tabular-nums text-muted">
                  {r.have}{r.need != null ? `/${r.need}` : ''}
                </span>
              )}
              {r.flash && r.note ? <span className="sr-only">{r.note}</span> : null}
            </motion.li>
          ))}
        </ul>
      ) : null}
      {rows?.some((r) => r.flash && r.note) && !collapsed && (
        <p className="text-[13px] leading-[18px] text-bronze">{rows.find((r) => r.flash && r.note)?.note}</p>
      )}
      {summary ? <p className="text-ink" data-status-summary>{summary}</p> : null}
      {holding ? (
        <p className="mt-1 text-ink" data-holding>
          <span className="text-muted">Holding: </span>{holding}
        </p>
      ) : null}
    </div>
  )
}
