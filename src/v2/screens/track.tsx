'use client'
/* Layout 3: the track, on question 1.4.
   Five labelled stops, "Where I am today" fixed in the middle, the handle
   waiting beside the track, a large readout above. "I'd rather not say" is a
   real answer. The privacy line sits on this screen. */
import { useState } from 'react'
import V2Frame from '../V2Frame'
import Track from '../ui/templates/Track'

const STOPS = ['Well behind', 'A bit behind', 'About the same', 'A bit ahead', 'Well ahead']

export default function TrackScreen() {
  const [value, setValue] = useState<number | null>(null)
  const [optedOut, setOptedOut] = useState(false)
  const done = value !== null || optedOut

  return (
    <V2Frame
      block="look-back" step={10} total={17}
      question="With a different Advisor on day one, where would you be today?"
      instruction="Tap or drag to set. Assume you worked just as hard."
      privacy="Anonymous: your answers are held under a code, not your name. We only report groups of ten or more."
      missing={done ? undefined : 'Set where you would be'}
      onNext={() => { setValue(null); setOptedOut(false) }}
    >
      <Track
        stops={STOPS}
        value={value}
        onChange={setValue}
        readoutLead="With a different Advisor, I'd be"
        anchorLabel="Where I am today"
        fillFrom="centre"
        optOut="I'd rather not say"
        optedOut={optedOut}
        onOptOut={setOptedOut}
      />
    </V2Frame>
  )
}
