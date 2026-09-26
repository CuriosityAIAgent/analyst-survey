/* The v2 screen contract (see docs/reviews/ascent-question-ux-plan.md).

   Every screen is ONE centred column, top to bottom:
     R  rail      Back · a small mountain line with a dot · "Question 13 of 17"
     Q  question  one plain question (serif, at most 2 lines) + one grey instruction line with the exact count
     O  object    the thing you play with; its state IS the answer
     T  tray      the parts you add (tiles, jugs), directly under the object, only if needed
     N  next      always rendered in the same place; while incomplete it is disabled and says what's missing

   No side panel, no italic caption, no "how to answer" block, no pop-ups. Plain words, no climbing words. */
import type { ReactNode } from 'react'

export type Block = 'look-back' | 'job-ahead' | 'analyst-time' | 'faster' | 'last'

export const BLOCK_NAME: Record<Block, string> = {
  'look-back': 'Looking back',
  'job-ahead': 'The job ahead',
  'analyst-time': "A new Analyst's time",
  faster: 'Getting to Advisor faster',
  last: 'Last thoughts',
}

export type V2FrameProps = {
  block: Block
  step: number          // 1-based question number
  total: number         // total questions (17 on phone, 25 on desktop)
  question: string
  instruction: string   // the exact count: "Pick two." "Place 7 of the 12."
  bridge?: string       // follow-ups only: names the topic, never the answer ("One more on classroom training.")
  privacy?: string      // sensitive screens only
  missing?: string      // e.g. "Pick 1 more": Next is disabled and shows this
  nextLabel?: string    // default "Next"
  onNext?: () => void
  onBack?: () => void
  tray?: ReactNode
  children: ReactNode   // the object
}

/* A mockup screen: self-contained demo state, rendered inside V2Frame. */
export type MockScreen = {
  id: string
  title: string         // shown in the mockup chooser
  what: string          // one line for Haresh: what this shows
  Component: () => ReactNode
}
