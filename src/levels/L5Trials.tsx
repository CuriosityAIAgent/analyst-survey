'use client'
import { useStore } from '@/store/useStore'
import { Level } from '@/components/ui'
import { TRIALS } from '@/content/content'

export default function L5() {
  const { answers, set } = useStore()
  const t = answers.trials
  const answer = (id: string, a: 'yes' | 'no') => set('trials', { [id]: { answer: a, followUp: [] } })
  const follow = (id: string, opt: string, multi: boolean) => {
    const cur = t[id]; if (!cur) return
    const has = cur.followUp.includes(opt)
    const next = multi ? (has ? cur.followUp.filter((x) => x !== opt) : [...cur.followUp, opt]) : [opt]
    set('trials', { [id]: { ...cur, followUp: next } })
  }
  return (
    <Level title="Two straight questions." sub="Yes or no, then one follow-up.">
      <div className="space-y-6">
        {TRIALS.map((tr) => {
          const cur = t[tr.id]
          const br = cur?.answer === 'yes' ? tr.yes : cur?.answer === 'no' ? tr.no : null
          return (
            <div key={tr.id} role="group" aria-label={tr.card}
              className="rounded-2xl border border-ink2/20 bg-[rgba(10,18,40,0.5)] p-4">
              <div className="text-[16px] leading-snug text-snow">{tr.card}</div>
              <div className="mt-1 text-[13px] italic text-ink2/70">{tr.aside}</div>
              <div className="mt-3 flex gap-2">
                <button type="button" className="chip flex-1" data-on={cur?.answer === 'yes'}
                  aria-pressed={cur?.answer === 'yes'} aria-label={`Yes — ${tr.card}`}
                  onClick={() => answer(tr.id, 'yes')}>Yes</button>
                <button type="button" className="chip flex-1" data-on={cur?.answer === 'no'}
                  aria-pressed={cur?.answer === 'no'} aria-label={`No — ${tr.card}`}
                  onClick={() => answer(tr.id, 'no')}>No</button>
              </div>
              {br && (
                <div className="mt-4 border-t border-ink2/15 pt-3">
                  <div className="mb-2 text-[14px] text-snow">{br.q}</div>
                  <div className="flex flex-wrap gap-2">
                    {br.opts.map((o) => (
                      <button key={o} type="button" className="chip" data-on={cur!.followUp.includes(o)}
                        aria-pressed={cur!.followUp.includes(o)} aria-label={`${o} — ${br.q}`}
                        onClick={() => follow(tr.id, o, br.multi)}>{o}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </Level>
  )
}
export const l5Ready = (t: Record<string, { answer: string; followUp: string[] }>) =>
  TRIALS.every((tr) => t[tr.id]?.followUp.length)
