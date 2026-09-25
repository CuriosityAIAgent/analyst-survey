'use client'
/* Foundation stub body: shows which mechanic belongs on a screen and the
   spec's items and zones as art placeholders, so the game is walkable and
   screenshottable before the real screens land. Screen owners delete their
   use of it. */
import { Art } from '../art'
import { items, step, zones } from '../content'
import type { BeatId, StepId } from '../types'

export default function Stub({ id, beat = 'A', note }: { id: StepId; beat?: BeatId; note?: string }) {
  const s = step(id)
  const b = s.beats?.find((x) => x.beat === beat)
  const its = items(id, b ? beat : undefined)
  const zs = zones(id, b ? beat : undefined)
  const mech = b?.mechanic ?? s.mechanic
  return (
    <div className="absolute inset-x-4 bottom-2 top-1 flex flex-col gap-2 overflow-hidden border border-dashed border-rule p-3" data-stub={id}>
      <p className="eyebrow">Stub · {id}{s.beats ? ` beat ${beat}` : ''} · {mech}</p>
      {note && <p className="font-[family-name:var(--font-ui)] text-[12px] text-muted">{note}</p>}
      {zs.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {zs.map((z) => (
            <div key={z.id} className="flex items-center gap-1.5 border border-rule-soft bg-paper/80 px-1.5 py-1">
              {z.art && <Art id={z.art} size={24} />}
              <span className="font-[family-name:var(--font-ui)] text-[11px] text-ink">{z.label}</span>
            </div>
          ))}
        </div>
      )}
      {its.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {its.map((it) => (
            <div key={it.id} className="flex w-[74px] flex-col items-center gap-1">
              {it.art ? <Art id={it.art} size={40} /> : <div className="h-10 w-10 border border-dashed border-rule-soft" />}
              <span className="text-center font-[family-name:var(--font-ui)] text-[10px] leading-[12px] text-ink">{it.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
