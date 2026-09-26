'use client'
/* The AI-tools question (3.4), on the trays template.
   Three full-width trays; six tool tiles, each with a plain name and a one-line
   everyday example, so the tile alone says what the tool is. A small navy brick
   sits second, so the building-blocks idea stays without needing to be read. */
import { useState } from 'react'
import V2Frame from '../V2Frame'
import Trays from '../ui/templates/Trays'
import type { Placed, TrayDef, TrayItem } from '../ui/templates/Trays'

const TRAYS: TrayDef[] = [
  { id: 'day1', label: 'From day one' },
  { id: 'later', label: "Once they've proven themselves" },
  { id: 'never', label: 'Not for them' },
]

const TOOLS: [string, string, string, string][] = [
  ['chat', 'AI chat', 'Drafts a first client email', 'brick-map'],
  ['office', 'AI in Excel and email', 'Tidies a portfolio table', 'brick-compass'],
  ['research', 'Firm research AI', 'Answers from the house view', 'brick-guidebook'],
  ['client', 'Client assistant', "Knows the client's holdings and history", 'brick-gps'],
  ['watch', 'Market watch agents', 'Flags a capital call or a big market move', 'brick-radio'],
  ['team', 'Agent team', 'Preps a whole client meeting pack', 'brick-brief'],
]

const ITEMS: TrayItem[] = TOOLS.map(([id, label, sub, art]) => ({
  id, label, sub,
  icon: <img src={`/game/3d/${art}.webp`} alt="" draggable={false} className="pointer-events-none h-auto w-11 sm:w-12" />,
}))

export default function AiTools() {
  const [placed, setPlaced] = useState<Placed>({})
  const left = TOOLS.length - Object.keys(placed).length
  return (
    <V2Frame
      block="analyst-time" step={15} total={25}
      question="Which AI tools should a new Analyst get, and when?"
      instruction="Put each of the 6 tools in a tray."
      missing={left > 0 ? `Place ${left} more` : undefined}
      onNext={() => setPlaced({})}
    >
      <Trays trays={TRAYS} items={ITEMS} placed={placed} onChange={setPlaced} layout="rows" />
    </V2Frame>
  )
}
