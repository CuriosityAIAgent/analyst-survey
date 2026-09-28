'use client'
/* The track renderer: every 'track' question in questions.ts (1.4, 5.1, C1).

   The stops are constraints.stops; q.options are the opt-outs under the line
   ("I'd rather not say" on 1.4). Stores a stop id, or an opt-out id. Nothing is
   chosen until the first touch; the handle waits beside the line until then.

   objectText.marker puts a fixed marker in the middle and objectText.start / .end
   label the two ends (no question uses them now). The fill runs from the middle
   where the middle stop means "no difference" (5.1 About when I got it); otherwise
   from the start (1.4: further ahead to the right; C1: more change to the right). */
import V2Frame from '../V2Frame'
import Track from '../ui/templates/Track'
import type { RenderProps } from './contract'
import { asId, useFit } from './checklist'

/** Scales whose middle stop is the neutral point, so the fill grows out from it. */
const FROM_MIDDLE = new Set(['q5.1'])

export default function TrackRender(p: RenderProps) {
  const { q } = p
  const stops = q.constraints.stops ?? []
  const v = asId(p.value)
  const at = stops.findIndex((s) => s.id === v)
  const out = q.options.find((o) => o.id === v)?.id ?? null
  const t = q.objectText ?? {}
  const density = useFit(1, [q.id])
  const missing = at >= 0 || out || p.preview ? undefined : 'Tap one'

  return (
    <V2Frame block={q.block} step={p.step} total={p.total} question={q.question} instruction={q.instruction}
      bridge={p.bridge} note={q.note} privacy={q.privacy} missing={missing} onNext={p.onNext} onBack={p.onBack}>
      <div data-q={q.id} className={p.bridge ? 'v2-rise' : ''}>
        <Track
          key={q.id}
          label={q.question}
          stops={stops.map((s) => s.label)}
          stopIds={stops.map((s) => s.id)}
          value={at >= 0 ? at : null}
          onChange={(i) => { if (i !== null && stops[i]) p.set(stops[i].id) }}
          readoutLead={t.lead}
          anchorLabel={t.marker}
          startLabel={t.start}
          endLabel={t.end}
          fillFrom={t.marker || FROM_MIDDLE.has(q.id) ? 'centre' : 'start'}
          optOuts={q.options.map((o) => ({ id: o.id, label: o.label }))}
          optedOutId={out}
          onOptOutId={(id) => p.set(id ?? '')} /* tapping the chosen opt-out again clears it */
          density={density}
        />
      </div>
    </V2Frame>
  )
}
