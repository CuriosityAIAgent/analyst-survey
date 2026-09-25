'use client'
/* F3a · Camp II · "Agents on day one" (half-sheet over S05, one tap).
   Fires when the Expedition brief went into Day one. Stores kit.agentsFirst.

   PickSheet (exported) is the shared body of F3a, F3b and F3c: the forest
   rookie with the expedition brief in the header, and four text chips in a
   2x2 grid (follow-up sheets run as text chips in v1). One tap stores the
   answer; the sheet finishes 500ms later (Sheet `auto`, bumped by `picks` so
   re-tapping an earlier answer after Back also goes on), so a mis-tap can
   still be changed. */
import { useRef, useState } from 'react'
import Sheet from '../Sheet'
import Figure from '../Figure'
import { Art } from '../art'
import { TagChip } from '../Chips'
import { items } from '../content'
import type { Answers, SheetId, StepProps } from '../types'

type PickKey = 'kit.agentsFirst' | 'kit.agentsEarn' | 'kit.agentsWhyNot'

/** The header: the rookie and the brief brick, placed by branch.
    day1   the rookie holds the brief
    proven the rookie reaches; the brief waits a step ahead
    none   the rookie stands; the brief is a pale outline, left behind */
function Header({ branch }: { branch: 'day1' | 'proven' | 'none' }) {
  if (branch === 'day1') {
    return (
      <Figure variant="rookie" size={42} axe={false}
        hand={<g transform="translate(-2 -1.2)"><Art id="brick-brief" width={7.6} height={3.2} /></g>} />
    )
  }
  return (
    <div className="flex items-end gap-[3px]" aria-hidden>
      <Figure variant="rookie" size={42} pose={branch === 'proven' ? 'openHand' : 'stand'} axe={branch === 'none'} />
      <div style={{ marginBottom: branch === 'proven' ? 22 : 1 }}>
        <Art id="brick-brief" state={branch === 'none' ? 'ghost' : undefined} width={29} height={12} />
      </div>
    </div>
  )
}

export function PickSheet<K extends PickKey>({ p, id, store, branch }: {
  p: StepProps
  id: SheetId
  store: K
  branch: 'day1' | 'proven' | 'none'
}) {
  const opts = items(id)
  const value = p.answers[store] as string | undefined
  const opened = useRef(Date.now())
  const [picks, setPicks] = useState(0)
  const pick = (v: string) => {
    p.set(store, v as Answers[K])
    p.log('pick', { key: store, value: v, changed: value !== undefined && value !== v, ms: Date.now() - opened.current })
    setPicks((n) => n + 1)
  }
  return (
    <Sheet id={id} valid={value !== undefined} onDone={p.next} auto value={value} picks={picks} header={<Header branch={branch} />}>
      <div role="radiogroup" aria-labelledby={`sheet-${id}-prompt`} className="grid grid-cols-2 gap-[8px] pb-1 pt-1" data-testid={`${id}-options`}>
        {opts.map((o) => {
          const on = value === o.id
          return (
            <button
              key={o.id}
              type="button"
              role="radio"
              aria-checked={on}
              data-on={on ? 'true' : undefined}
              onClick={() => pick(o.id)}
              className="block h-[58px] w-full"
              data-testid={`opt-${o.id}`}
            >
              <TagChip label={o.label} on={on} size={14} />
            </button>
          )
        })}
      </div>
    </Sheet>
  )
}

export default function F3a(p: StepProps) {
  return <PickSheet p={p} id="F3a" store="kit.agentsFirst" branch="day1" />
}
