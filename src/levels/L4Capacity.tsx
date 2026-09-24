'use client'
import { useState } from 'react'
import { useStore } from '@/store/useStore'
import { Level } from '@/components/ui'
import { DESTINATIONS } from '@/content/content'

const HOURS = 8, CUT = 3
const sum = (r: Record<string, number>) => Object.values(r).reduce((a, b) => a + b, 0)

export default function L4() {
  const { answers, set } = useStore()
  const c = answers.capacity
  const [phase, setPhase] = useState<1 | 2>(sum(c.spend) === HOURS ? 2 : 1)
  const spent = sum(c.spend)
  const afterTotal = sum(c.after)

  const add = (id: string, d: number) => {
    const cur = c.spend[id] ?? 0
    if (d > 0 && spent >= HOURS) return
    if (d < 0 && cur <= 0) return
    set('capacity', { spend: { ...c.spend, [id]: cur + d } })
  }
  const take = (id: string) => {
    const has = c.spend[id] ?? 0
    const removed = c.after[id] ?? 0
    if (removed >= has) return
    if (sum(c.after) >= CUT) return
    set('capacity', { after: { ...c.after, [id]: removed + 1 } })
  }

  if (phase === 1) {
    return (
      <Level
        title="The day that comes back"
        sub="Say the tools do what they promise. Next year, the analyst coming up behind you gets back a day a week. Eight hours nobody is spending yet. Spend all eight."
        aside="The whole day can go in one place. Giving it back is a real answer."
      >
        <div className="mb-4 flex items-center gap-2">
          {Array.from({ length: HOURS }).map((_, i) => (
            <div key={i} className="h-3 flex-1 rounded-full"
              style={{ background: i < spent ? 'var(--color-gold)' : 'rgba(185,198,224,0.18)' }} />
          ))}
          <span className="ml-2 w-12 text-right text-[13px] text-ink2">{HOURS - spent} left</span>
        </div>
        <div className="space-y-2">
          {DESTINATIONS.map((d) => {
            const n = c.spend[d.id] ?? 0
            return (
              <div key={d.id} className="flex items-center gap-3 rounded-2xl border border-ink2/20 bg-[rgba(10,18,40,0.5)] p-3">
                <div className="min-w-0 flex-1">
                  <div className="text-[15px] text-snow">{d.label}</div>
                  <div className="text-[13px] text-ink2/75">{d.gloss}</div>
                </div>
                <button type="button" aria-label={`Remove an hour from ${d.label}`} onClick={() => add(d.id, -1)}
                  className="chip h-11 w-11 shrink-0 p-0 text-lg">−</button>
                <span className="w-5 text-center text-[16px] font-semibold text-goldlight">{n || ''}</span>
                <button type="button" aria-label={`Add an hour to ${d.label}`} onClick={() => add(d.id, 1)}
                  className="chip h-11 w-11 shrink-0 p-0 text-lg">+</button>
              </div>
            )
          })}
        </div>
        <button type="button" disabled={spent !== HOURS} onClick={() => setPhase(2)}
          className="mt-5 min-h-[44px] w-full rounded-full text-[15px] font-semibold disabled:opacity-40"
          style={{ background: 'var(--color-gold)', color: '#0A1430' }}>
          {spent === HOURS ? "That's the day" : `Spend ${HOURS - spent} more`}
        </button>
      </Level>
    )
  }

  return (
    <Level
      title="The desk got busier."
      sub={`Three of those hours are going back. Choose which — what you keep is what you actually meant.`}
      aside={`${CUT - afterTotal} to give back`}
    >
      <div className="space-y-2">
        {DESTINATIONS.filter((d) => (c.spend[d.id] ?? 0) > 0).map((d) => {
          const has = c.spend[d.id] ?? 0, gone = c.after[d.id] ?? 0
          return (
            <button key={d.id} type="button" onClick={() => take(d.id)}
              className="flex w-full items-center gap-3 rounded-2xl border border-ink2/20 bg-[rgba(10,18,40,0.5)] p-3 text-left">
              <div className="min-w-0 flex-1 text-[15px] text-snow">{d.label}</div>
              <div className="flex gap-1">
                {Array.from({ length: has }).map((_, i) => (
                  <span key={i} className="h-3 w-3 rounded-full"
                    style={{ background: i < has - gone ? 'var(--color-gold)' : 'rgba(229,106,94,0.5)' }} />
                ))}
              </div>
            </button>
          )
        })}
      </div>
    </Level>
  )
}
export const l4Ready = (c: { spend: Record<string, number>; after: Record<string, number> }) =>
  sum(c.spend) === HOURS && sum(c.after) === CUT
