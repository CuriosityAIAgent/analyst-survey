'use client'
import { useStore } from '@/store/useStore'
import { Chip, Level } from '@/components/ui'
import { ADVISOR_CHANGES } from '@/content/content'

export default function L7() {
  const { answers, set } = useStore()
  const m = answers.mark, a = answers.advisor
  const pick = (id: string) => {
    if (a.changeTop2.includes(id)) return set('advisor', { changeTop2: a.changeTop2.filter((x) => x !== id) })
    if (a.changeTop2.length >= 2) return
    set('advisor', { changeTop2: [...a.changeTop2, id] })
  }
  return (
    <Level title="Mark to market." sub="Two things, then you're at the top.">
      <div>
        <div className="text-[15px] text-snow">The programme as it stands today, out of ten.</div>
        <div className="mt-3 display text-[48px] text-goldlight">{m.score ?? '–'}</div>
        <input type="range" min={1} max={10} value={m.score ?? 5}
          onChange={(e) => set('mark', { score: Number(e.target.value) })}
          aria-label="The programme as it stands today, out of ten"
          aria-valuetext={`${m.score ?? 5} out of 10`}
          className="mt-1 w-full accent-[var(--color-gold)]" />
        <div className="mt-1 flex justify-between text-[12px] text-ink2/70">
          <span>Wouldn&apos;t wish it on anyone</span><span>Don&apos;t touch it</span>
        </div>
      </div>
      <div className="mt-8 border-t border-ink2/15 pt-6">
        <div className="text-[15px] text-snow">
          For the analyst coming up behind you — what should their Advisor do differently?
        </div>
        <div className="mt-1 text-[13px] text-ink2/75">Pick two.</div>
        <div className="mt-3 flex flex-wrap gap-2">
          {ADVISOR_CHANGES.map((c) => {
            const i = a.changeTop2.indexOf(c.id)
            return <Chip key={c.id} on={i >= 0} onClick={() => pick(c.id)}>
              {i >= 0 && <span className="mr-2 font-semibold text-gold">{i + 1}</span>}{c.label}
            </Chip>
          })}
        </div>
      </div>
      <div className="mt-8 border-t border-ink2/15 pt-6">
        <div className="text-[15px] text-snow">What are we not asking that we should?</div>
        <textarea value={m.missing ?? ''} rows={3}
          aria-label="What are we not asking that we should?"
          onChange={(e) => set('mark', { missing: e.target.value })}
          className="mt-3 w-full rounded-2xl border border-ink2/25 bg-[rgba(10,18,40,0.55)] p-3 text-[15px] text-snow placeholder:text-ink2/50"
          placeholder="Optional." />
      </div>
    </Level>
  )
}
export const l7Ready = (m: { score?: number }, a: { changeTop2: string[] }) =>
  m.score !== undefined && a.changeTop2.length === 2
