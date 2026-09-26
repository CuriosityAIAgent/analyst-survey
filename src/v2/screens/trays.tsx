'use client'
/* Layout 4: the trays, on question 3.1.
   Three trays with the count in the heading; twelve tiles, label first and a
   small icon second. Drag, or tap a tile then a tray. Next says how many are left. */
import { useState } from 'react'
import V2Frame from '../V2Frame'
import Trays from '../ui/templates/Trays'
import type { Placed, TrayDef, TrayItem } from '../ui/templates/Trays'
import ActivityIcon from '../ui/templates/ActivityIcon'

const TRAYS: TrayDef[] = [
  { id: 'more', label: 'Do more', cap: 3 },
  { id: 'diff', label: 'Do differently', cap: 2 },
  { id: 'less', label: 'Do less', cap: 2 },
]

const ACTIVITIES: [string, string, string][] = [
  ['meetings', 'Client meetings', 'meetings'],
  ['presenting', 'Presenting', 'presenting'],
  ['portfolio', 'Portfolio analysis', 'portfolio'],
  ['outreach', 'Prospect outreach', 'outreach'],
  ['briefs', 'Meeting briefs', 'briefs'],
  ['onboarding', 'Onboarding and operations', 'onboarding'],
  ['debriefs', 'Advisor debriefs', 'debriefs'],
  ['morning', 'Morning meeting', 'morning'],
  ['classroom', 'Classroom', 'classroom'],
  ['roleplay', 'Role plays', 'roleplay'],
  ['crm', 'CRM and admin', 'crm'],
  ['decks', 'Formatting decks', 'decks'],
]
const ITEMS: TrayItem[] = ACTIVITIES.map(([id, label, icon]) => ({ id, label, icon: <ActivityIcon name={icon} /> }))
const NEED = TRAYS.reduce((a, t) => a + (t.cap ?? 0), 0) // 7

export default function TraysScreen() {
  const [placed, setPlaced] = useState<Placed>({})
  const left = NEED - Object.keys(placed).length
  return (
    <V2Frame
      block="analyst-time" step={12} total={17}
      question="What should new Analysts do more of, do differently, or do less of?"
      instruction="Place 7 of the 12. Leave the rest."
      missing={left > 0 ? `Place ${left} more` : undefined}
      onNext={() => setPlaced({})}
    >
      <Trays trays={TRAYS} items={ITEMS} placed={placed} onChange={setPlaced} layout="columns" />
    </V2Frame>
  )
}
