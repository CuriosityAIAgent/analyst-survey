'use client'
import { useStore } from '@/store/useStore'
import { Chip, Level } from '@/components/ui'
import { TRAITS } from '@/content/content'

const PHRASES: [number, string][] = [
  [20, 'Nowhere near here.'], [45, 'A long way back.'],
  [65, 'Somewhere else, but fine.'], [85, 'Roughly here anyway.'], [101, 'Exactly here. They were not the reason.'],
]

export default function L2() {
  const { answers, set } = useStore()
  const a = answers.advisor
  const pick = (id: string) => {
    if (a.top3.includes(id)) return set('advisor', { top3: a.top3.filter((x) => x !== id) })
    if (a.top3.length >= 3) return
    set('advisor', { top3: [...a.top3, id] })
  }
  const phrase = PHRASES.find(([n]) => a.dependence < n)![1]

  return (
    <Level title="What makes a great private banker?" sub="Pick three, in order. First tap is number one.">
      <div className="flex flex-wrap gap-2">
        {TRAITS.map((t) => {
          const i = a.top3.indexOf(t.id)
          return (
            <Chip key={t.id} on={i >= 0} onClick={() => pick(t.id)}>
              {i >= 0 && <span className="mr-2 font-semibold text-gold">{i + 1}</span>}{t.label}
            </Chip>
          )
        })}
      </div>

      <div className="mt-8 border-t border-ink2/15 pt-6">
        <div className="text-[15px] text-snow">
          If you'd been put with a different Advisor on day one, where would you be now?
        </div>
        <input
          type="range" min={0} max={100} value={a.dependence}
          onChange={(e) => set('advisor', { dependence: Number(e.target.value) })}
          aria-label="If you had been put with a different Advisor on day one, where would you be now?"
          aria-valuetext={phrase}
          className="mt-4 w-full accent-[var(--color-gold)]"
        />
        <div className="mt-2 flex justify-between text-[12px] text-ink2/70">
          <span>Nowhere near here</span><span>Exactly here</span>
        </div>
        <div className="mt-3 display text-[22px] text-goldlight">{phrase}</div>
      </div>
    </Level>
  )
}
export const l2Ready = (a: { top3: string[] }) => a.top3.length === 3
