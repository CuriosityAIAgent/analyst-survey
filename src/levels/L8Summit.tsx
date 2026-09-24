'use client'
import { useStore } from '@/store/useStore'
import { ACTIVITIES, DESTINATIONS, FUEL } from '@/content/content'

const lbl = (arr: readonly { id: string; label: string }[], id?: string) =>
  arr.find((x) => x.id === id)?.label ?? '—'

export default function L8() {
  const { answers, reset } = useStore()
  const h = answers.handover, c = answers.capacity
  const kept = Object.entries(c.spend)
    .map(([id, n]) => ({ id, n: n - (c.after[id] ?? 0) }))
    .filter((x) => x.n > 0).sort((a, b) => b.n - a.n)[0]
  const trap = h.clips.filter((id) => h.lanes[id] === 'agent')
  const agentCount = Object.values(h.lanes).filter((l) => l === 'agent').length

  // best-minus-worst over the nine rounds
  const score: Record<string, number> = {}
  for (const r of answers.fuel) {
    if (r.best) score[r.best] = (score[r.best] ?? 0) + 1
    if (r.worst) score[r.worst] = (score[r.worst] ?? 0) - 1
  }
  const topFuel = Object.entries(score).sort((a, b) => b[1] - a[1])[0]?.[0]

  return (
    <div className="glass mx-auto w-full max-w-[720px] p-6 sm:p-8">
      <h1 className="display text-[34px] text-snow">The route you just set</h1>
      <p className="mt-2 text-[15px] text-ink2">
        There&apos;s someone on the pitch below you. This is what you&apos;d hand them.
      </p>

      <dl className="mt-6 space-y-3 border-t border-ink2/15 pt-5 text-[15px]">
        <Row k="What taught you most" v={lbl(FUEL, topFuel)} />
        <Row k="You'd hand an agent" v={`${agentCount} of ${ACTIVITIES.length} jobs`} />
        <Row k="You'd protect" v={h.clips.length ? h.clips.map((i) => lbl(ACTIVITIES, i)).join(', ') : 'nothing in particular'} />
        <Row k="The trap" v={trap.length ? trap.map((i) => lbl(ACTIVITIES, i)).join(', ') : 'none — your answers were consistent'} />
        <Row k="Their day goes to" v={kept ? lbl(DESTINATIONS, kept.id) : '—'} />
      </dl>

      <div className="mt-8 border-t border-ink2/15 pt-6">
        <div className="display text-[22px] text-goldlight">One line to them.</div>
        <p className="mt-1 text-[14px] text-ink2">
          They start in September. If you could change one thing before they get here, what is it?
        </p>
        <textarea
          maxLength={140} rows={2}
          value={answers.summit.message ?? ''}
          onChange={(e) => useStore.getState().set('summit', { message: e.target.value })}
          className="mt-3 w-full rounded-2xl border border-ink2/25 bg-[rgba(10,18,40,0.55)] p-3 text-[15px] text-snow placeholder:text-ink2/50"
          placeholder="Optional — you're already done."
        />
        <div className="mt-1 text-right text-[12px] text-ink2/60">{(answers.summit.message ?? '').length}/140</div>
      </div>

      <p className="mt-6 text-[13px] text-ink2/70">That&apos;s everything. Thank you — genuinely.</p>
      <button type="button" onClick={reset} className="chip mt-4 text-ink2">Start again</button>
    </div>
  )
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex gap-4">
      <dt className="w-[42%] shrink-0 text-ink2">{k}</dt>
      <dd className="flex-1 text-snow">{v}</dd>
    </div>
  )
}
