'use client'
import { useEffect, useMemo, useState } from 'react'
import { useStore, Lane } from '@/store/useStore'
import { Level } from '@/components/ui'
import { ACTIVITIES, LANES } from '@/content/content'

const MAX_CLIPS = 5
const act = (id: string) => ACTIVITIES.find((a) => a.id === id)!
const RECKONING = [
  'Do it by hand for the first year, then hand it over',
  "Mark up the agent's draft with the Advisor",
  'Be shown a wrong-but-plausible draft and made to find the error',
  'Sit in the meeting it was for',
  'A harder version of it, less often',
  "They don't need to learn it — that's fine",
  "They don't, and the desk needs fewer analysts. That's the honest answer.",
]

export default function L3({ onBeat }: { onBeat: (b: number) => void }) {
  const { answers, set } = useStore()
  const h = answers.handover
  const [beat, setBeat] = useState(0)
  const [i, setI] = useState(0)

  useEffect(() => { onBeat(beat) }, [beat, onBeat])

  const placed = Object.keys(h.lanes).length + h.notDone.length
  const current = ACTIVITIES[Math.min(i, ACTIVITIES.length - 1)]

  const lane = (id: string, l: Lane | 'none') => {
    const lanes = { ...h.lanes }, notDone = h.notDone.filter((x) => x !== id)
    if (l === 'none') { delete lanes[id]; notDone.push(id) } else lanes[id] = l
    set('handover', { lanes, notDone })
    if (beat === 1 && i < ACTIVITIES.length - 1) setI(i + 1)
    else if (beat === 1) setBeat(2)
  }

  const clip = (id: string) => {
    if (h.clips.includes(id)) return set('handover', { clips: h.clips.filter((x) => x !== id) })
    if (h.clips.length >= MAX_CLIPS) return
    set('handover', { clips: [...h.clips, id] })
  }

  // the contradiction: handed to an agent AND marked as the thing that taught you
  const conflict = useMemo(
    () => h.clips.filter((id) => h.lanes[id] === 'agent'),
    [h.clips, h.lanes],
  )

  if (beat === 0) {
    return (
      <Level title="Thirteen things you do." sub="Read them first, then we'll take them one at a time. Nothing to answer yet.">
        <ul className="space-y-2">
          {ACTIVITIES.map((a) => (
            <li key={a.id} className="text-[15px] text-ink">
              {a.label} <span className="text-muted">— {a.gloss}</span>
            </li>
          ))}
        </ul>
        <button type="button" onClick={() => setBeat(1)}
          className="mt-6 btn w-full"
          >Deal the thirteen</button>
      </Level>
    )
  }

  if (beat === 1) {
    return (
      <Level
        title="Who should be doing this in two years?"
        sub="We're looking for the work we can't quietly automate."
        aside={`${placed} of ${ACTIVITIES.length} placed`}
      >
        <div className="rounded-[2px] border border-rule-soft bg-ground p-5">
          <div className="display text-[22px] text-ink">{current.label}</div>
          <div className="mt-1 text-[14px] text-muted">{current.gloss}</div>
        </div>
        <div className="mt-4 space-y-2">
          {LANES.map((l) => (
            <button key={l.id} type="button" onClick={() => lane(current.id, l.id as Lane)}
              className="choice flex w-full flex-col items-start justify-center gap-0.5 py-3 text-left"
              style={{ minHeight: 60, borderRadius: 18 }}>
              <span className="text-[15px] font-medium">{l.label}</span>
              <span className="text-[13px] text-muted">{l.sub}</span>
            </button>
          ))}
          <button type="button" onClick={() => lane(current.id, 'none')}
            className="choice w-full text-muted">I haven&apos;t done this one</button>
        </div>
      </Level>
    )
  }

  if (beat === 2) {
    const left = MAX_CLIPS - h.clips.length
    return (
      <Level
        title="Now the ones that taught you the job."
        sub="Not the ones you enjoyed — the ones where doing it yourself is how you learned what good looks like."
        aside={left > 0 ? `${left} left` : 'That’s five. Tap one again to swap it out.'}
      >
        <div className="space-y-4">
          {LANES.map((l) => {
            const ids = ACTIVITIES.filter((a) => h.lanes[a.id] === l.id).map((a) => a.id)
            if (!ids.length) return null
            return (
              <div key={l.id}>
                <div className="mb-2 text-[13px] uppercase tracking-wide text-muted">{l.label}</div>
                <div className="flex flex-wrap gap-2">
                  {ids.map((id) => (
                    <button key={id} type="button" className="choice" data-on={h.clips.includes(id)}
                      onClick={() => clip(id)}>{act(id).label}</button>
                  ))}
                </div>
              </div>
            )
          })}
          <button type="button" onClick={() => setBeat(3)}
            className="mt-2 btn w-full"
          >
            {h.clips.length ? "That's them" : 'None of these taught me much'}
          </button>
        </div>
      </Level>
    )
  }

  // beat 3 — the reckoning. No light change here: see the integration note.
  const first = conflict[0]
  if (!first) {
    return (
      <Level title="Worth knowing." sub={`You'd hand ${Object.values(h.lanes).filter((l) => l === 'agent').length} of them to an agent, and none of those is one that taught you.`}>
        <p className="text-[15px] text-muted">That's a clean answer. Carry on.</p>
      </Level>
    )
  }
  return (
    <Level
      title="One thing doesn't add up, and it's the interesting bit."
      sub={`You'd hand ${act(first).label.toLowerCase()} to an agent. It's also one of the ones that taught you.`}
    >
      <div className="text-[15px] text-ink">So how does the next analyst learn that?</div>
      <div className="mt-3 flex flex-wrap gap-2">
        {RECKONING.map((r) => (
          <button key={r} type="button" className="choice text-left" data-on={h.reckoning === r}
            onClick={() => set('handover', { reckoning: r })}>{r}</button>
        ))}
      </div>
      <textarea
        value={h.reckoningText ?? ''} maxLength={140}
        aria-label="How should the next analyst learn that, in your words?"
        onChange={(e) => set('handover', { reckoningText: e.target.value })}
        placeholder="In your words, if you have them."
        className="mt-4 w-full rounded-[2px] border border-rule-soft bg-ground p-3 text-[15px] text-ink placeholder:text-muted/50"
        rows={2}
      />
    </Level>
  )
}
