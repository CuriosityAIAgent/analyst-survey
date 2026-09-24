'use client'
import { useEffect, useRef, useState } from 'react'
import { useStore } from '@/store/useStore'
import { Level } from '@/components/ui'
import { FUEL, MAXDIFF_SETS } from '@/content/content'

const label = (id: string) => FUEL.find((f) => f.id === id)!.label

export default function L1({ onDone }: { onDone: (done: boolean) => void }) {
  const { answers } = useStore()
  const [round, setRound] = useState(answers.fuel.length)
  const [best, setBest] = useState<string | undefined>()
  const [worst, setWorst] = useState<string | undefined>()
  const started = useRef(Date.now())
  const shown = MAXDIFF_SETS[Math.min(round, MAXDIFF_SETS.length - 1)]
  const finished = round >= MAXDIFF_SETS.length

  useEffect(() => { onDone(finished) }, [finished, onDone])

  const commit = () => {
    if (!best || !worst) return
    const rec = { round, shown: [...shown], best, worst, ms: Date.now() - started.current }
    useStore.setState((st) => ({
      answers: { ...st.answers, fuel: [...st.answers.fuel.filter((f) => f.round !== round), rec] },
    }))
    setBest(undefined); setWorst(undefined); started.current = Date.now()
    setRound((r) => r + 1)
  }

  if (finished) {
    return (
      <Level title="That's the nine." sub="Nothing to change here — carry on up.">
        <p className="text-[15px] text-ink2">You ranked nine ways of learning the job against each other, three at a time.</p>
      </Level>
    )
  }

  return (
    <Level
      title="What actually taught you the job?"
      sub="Three at a time. Tap the one that taught you most, and the one that taught you least."
      aside={`Round ${round + 1} of ${MAXDIFF_SETS.length}`}
    >
      <div className="space-y-3">
        {shown.map((id) => (
          <div key={id} role="group" aria-label={label(id)}
            className="rounded-2xl border border-ink2/20 bg-[rgba(10,18,40,0.5)] p-4">
            <div className="text-[15px] leading-snug text-snow">{label(id)}</div>
            <div className="mt-3 flex gap-2">
              <button
                type="button" className="chip flex-1" data-on={best === id}
                aria-pressed={best === id}
                aria-label={`${label(id)} — taught me most`}
                onClick={() => { setBest(id); if (worst === id) setWorst(undefined) }}
              >Taught me most</button>
              <button
                type="button" className="chip flex-1" data-on={worst === id}
                aria-pressed={worst === id}
                aria-label={`${label(id)} — taught me least`}
                onClick={() => { setWorst(id); if (best === id) setBest(undefined) }}
              >Taught me least</button>
            </div>
          </div>
        ))}
        <button
          type="button" onClick={commit} disabled={!best || !worst}
          className="mt-2 min-h-[44px] w-full rounded-full text-[15px] font-semibold disabled:opacity-40"
          style={{ background: 'var(--color-gold)', color: '#0A1430' }}
        >
          {round + 1 === MAXDIFF_SETS.length ? 'Done' : 'Next three'}
        </button>
      </div>
    </Level>
  )
}
