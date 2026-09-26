'use client'
/* Layout 2: the card stack, on question 1.3.
   Six strengths, one card at a time. Two labelled buttons under the card, a
   labelled pile either side; swipe also works. Next says how many are left. */
import { useState } from 'react'
import V2Frame from '../V2Frame'
import CardStack from '../ui/templates/CardStack'
import type { Side, StackCard } from '../ui/templates/CardStack'

const TRAITS: StackCard[] = [
  { id: 'reading', label: 'Reading people', art: 'trait-reading' },
  { id: 'drive', label: 'Drive to win clients', art: 'trait-hunter' },
  { id: 'calm', label: 'Calm under pressure', art: 'trait-calm' },
  { id: 'bounce', label: 'Bouncing back from a no', art: 'trait-bounce' },
  { id: 'judgement', label: 'Commercial judgement', art: 'trait-judgement' },
  { id: 'story', label: 'Numbers into a story', art: 'trait-story' },
]

export default function Cards() {
  const [sorted, setSorted] = useState<Record<string, Side>>({})
  const left = TRAITS.length - Object.keys(sorted).length
  const onSort = (id: string, side: Side | null) =>
    setSorted((s) => {
      const n = { ...s }
      if (side) n[id] = side
      else delete n[id]
      return n
    })

  return (
    <V2Frame
      block="look-back" step={3} total={17}
      question="Did you bring each strength with you, or learn it at J.P. Morgan?"
      instruction="Swipe or tap. 6 cards."
      missing={left ? `Sort ${left} more card${left === 1 ? '' : 's'}` : undefined}
      onNext={() => setSorted({})}
    >
      <CardStack
        cards={TRAITS}
        left="Had it before"
        right="Learned at J.P. Morgan"
        sorted={sorted}
        onSort={onSort}
        done={
          <>
            <p className="font-[family-name:var(--font-text)] text-[20px] font-semibold text-ink">All 6 sorted.</p>
            <p className="mt-1 font-[family-name:var(--font-ui)] text-[14px] text-muted">Tap a pile to change one.</p>
          </>
        }
      />
    </V2Frame>
  )
}
