'use client'
/* Reference usage of the primitives, shown on /art/game. Screen owners can
   copy these patterns; e2e/game-prims.mjs drives them with real pointer,
   tap and keyboard input. Not part of the game. */
import { useState } from 'react'
import { useDrag } from './useDrag'
import RouteSlider from './RouteSlider'
import SwipeStack from './SwipeStack'
import Figure from './Figure'
import { Art } from './art'

/* ---- useDrag: a 2-slot rucksack (drop on a full slot swaps) and a 1-slot
        tarp whose body refuses when full. The screen decides; the hook reports. */
const TILES = ['meetings', 'present', 'portfolio', 'outreach']
type Place = Record<string, string | null> // slot id -> tile

function DragDemo() {
  const [slots, setSlots] = useState<Place>({ 'ruck:0': null, 'ruck:1': null, 'tarp:0': null })
  const where = (tile: string) => Object.keys(slots).find((k) => slots[k] === tile) ?? null
  const d = useDrag({
    labelOf: (id) => id,
    onDrop: (tile, zone) => {
      const from = where(tile)
      if (zone === null || zone === 'tray') {
        if (from) setSlots({ ...slots, [from]: null })
        return
      }
      // a zone body: first free slot, else refuse (bounce + 2px shake)
      let slot = zone
      if (zone === 'ruck' || zone === 'tarp') {
        const free = Object.keys(slots).find((k) => k.startsWith(zone + ':') && !slots[k])
        if (!free) return false
        slot = free
      }
      const occupant = slots[slot]
      const next = { ...slots, [slot]: tile }
      if (from) next[from] = occupant && occupant !== tile ? occupant : null // swap
      setSlots(next)
    },
  })
  const tile = (id: string) => (
    <div key={id} {...d.item(id)} className="flex h-16 w-16 flex-col items-center justify-center gap-0.5 bg-ground"
      data-testid={`tile-${id}`}>
      <Art id={`gear-${id === 'meetings' ? 'binoculars' : id === 'present' ? 'leadrope' : id === 'portfolio' ? 'crampons' : 'flare'}`} size={34} />
      <span className="font-[family-name:var(--font-ui)] text-[10px]">{id}</span>
    </div>
  )
  const slot = (k: string) => (
    <div key={k} {...d.zone(k)} data-testid={`slot-${k}`}
      className="flex h-[72px] w-[72px] items-center justify-center border border-dashed border-rule data-[over=true]:border-solid data-[over=true]:border-forest data-[valid=true]:border-forest">
      {slots[k] && tile(slots[k]!)}
    </div>
  )
  const inTray = TILES.filter((t) => !where(t))
  return (
    <div {...d.stageProps} className="flex flex-col gap-3 border border-rule-soft bg-paper p-3" data-testid="drag-demo">
      <div className="flex gap-3">
        <div {...d.zone('ruck')} className="flex gap-2 border border-rule-soft p-2 data-[over=true]:border-forest" data-testid="zone-ruck">
          {slot('ruck:0')}{slot('ruck:1')}
        </div>
        <div {...d.zone('tarp')} className="flex gap-2 border border-rule-soft p-2 data-[over=true]:border-ink" data-testid="zone-tarp">
          {slot('tarp:0')}
        </div>
      </div>
      <div {...d.zone('tray')} className="flex min-h-[72px] gap-2 border border-rule-soft p-2" data-testid="zone-tray">
        {inTray.map(tile)}
      </div>
      <pre className="text-[10px]" data-testid="drag-state">{JSON.stringify(slots)}</pre>
      {d.liveRegion}
      <p className="text-[10px] text-muted" data-testid="drag-announce">{d.announce}</p>
    </div>
  )
}

/* ---- RouteSlider: a vertical switchback with stops and a parked thumb, and
        an arc (the F1 door) */
const SWITCH = 'M 150 300 L 60 250 L 150 200 L 60 150 L 150 100 L 60 50'
function SliderDemo() {
  const [v, setV] = useState<string | null>(null)
  const [door, setDoor] = useState<string | null>(null)
  const [meta, setMeta] = useState('')
  const stops = [
    { id: 'm12', at: 0.1, label: '12 months' }, { id: 'm24', at: 0.4, label: '24 months' },
    { id: 'm36', at: 0.7, label: '36 months' }, { id: 'm48', at: 1, label: '48 months' },
  ]
  return (
    <div className="flex gap-4">
      <div className="h-[340px] w-[210px] shrink-0 border border-rule-soft bg-paper" data-testid="slider-demo">
        <RouteSlider
          d={SWITCH} viewBox={[210, 340]} stops={stops} value={v} parked={{ x: 180, y: 330 }}
          label="How long should the climb take?" orientation="vertical" inkBehind testId="slider-range"
          onChange={(id, m) => { setV(id); setMeta(`${m.via} r${m.reversals}`) }}
          renderTrack={(s) => (
            <g>
              <path d={SWITCH} fill="none" stroke="#8C857A" strokeDasharray="3 4" />
              {s.stops.map((st) => (
                <g key={st.id}>
                  <circle cx={st.x} cy={st.y} r={4} fill={st.selected ? '#1F4B3A' : '#F8F7F4'} stroke="#0D0C0B" strokeWidth={1.2} />
                  <text x={st.x < 100 ? st.x - 10 : st.x + 10} y={st.y + 4} textAnchor={st.x < 100 ? 'end' : 'start'}
                    fontFamily="Archivo" fontSize={11}>{st.label}</text>
                </g>
              ))}
            </g>
          )}
          renderThumb={(s) => <Figure as="g" size={40} pose={s.moving ? 'stride' : 'stand'} t={s.stride} />}
        />
      </div>
      <div className="flex flex-col gap-2">
        <div className="h-[140px] w-[160px] border border-rule-soft bg-paper" data-testid="door-demo">
          <RouteSlider
            d="M 30 120 A 90 90 0 0 1 120 30" viewBox={[160, 140]} value={door} testId="door-range"
            stops={[{ id: 'mandatory', at: 0, label: 'Shut' }, { id: 'clientFirst', at: 0.5, label: 'Ajar' }, { id: 'optional', at: 1, label: 'Open' }]}
            label="Classroom door" onChange={(id) => setDoor(id)}
            renderTrack={() => <path d="M 30 120 A 90 90 0 0 1 120 30" fill="none" stroke="#8C857A" strokeDasharray="2 3" />}
            renderThumb={() => <circle r={8} fill="#7A3E12" stroke="#0D0C0B" strokeWidth={1.5} />}
          />
        </div>
        <pre className="text-[10px]" data-testid="slider-state">{JSON.stringify({ v, door, meta })}</pre>
      </div>
    </div>
  )
}

/* ---- SwipeStack: three exits, buttons primary */
type C = { id: string; title: string }
function SwipeDemo() {
  const [cards, setCards] = useState<C[]>([
    { id: 'certify', title: 'Certify before clients' }, { id: 'aiclient', title: 'AI clients replace some' },
    { id: 'agents', title: 'Agents by year two' },
  ])
  const [log, setLog] = useState<string[]>([])
  return (
    <div className="flex flex-col gap-2" data-testid="swipe-demo">
      <SwipeStack
        cards={cards} width={240} height={150} label="Storm calls"
        exits={[{ id: 'drop', label: 'Drop it', dir: 'left' }, { id: 'unsure', label: 'Unsure', dir: 'down' }, { id: 'policy', label: 'Make it policy', dir: 'right' }]}
        onExit={(id, ex, m) => { setLog((l) => [...l, `${id}:${ex}:${m.via}`]); setCards((c) => c.filter((x) => x.id !== id)) }}
        renderCard={(c, s) => (
          <div className="flex h-full flex-col items-center justify-center border border-ink bg-ground p-3" data-testid={`card-${c.id}`}>
            <p className="display text-[20px]">{c.title}</p>
            <p className="text-[11px] text-muted">{s.toward ?? ''}</p>
          </div>
        )}
        renderStamp={(ex) => <span className="border-2 border-ink px-2 py-1 font-[family-name:var(--font-ui)] text-[14px] tracking-[0.2em]">{ex.toUpperCase()}</span>}
      />
      <pre className="text-[10px]" data-testid="swipe-state">{JSON.stringify(log)}</pre>
    </div>
  )
}

export default function Playground() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr_1fr]" data-playground>
      <div><p className="eyebrow mb-2">useDrag</p><DragDemo /></div>
      <div><p className="eyebrow mb-2">RouteSlider</p><SliderDemo /></div>
      <div><p className="eyebrow mb-2">SwipeStack</p><SwipeDemo /></div>
    </div>
  )
}
