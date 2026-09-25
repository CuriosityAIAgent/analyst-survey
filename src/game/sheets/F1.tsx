'use client'
/* F1 · Base camp · "The classroom call" (half-sheet over S02; drag-slider).

   Fires when Classroom training was packed (Green) or put in the hand
   (Blue), on S02's Continue. "Attendance runs low. Make classroom
   mandatory?" The respondent drags the classroom door: shut (Mandatory, no
   exceptions), ajar (Mandatory, client first: the client's chair shows
   beyond) or open (Optional, on demand).

   The door is one drawing (fu-door) whose `value` is how far open, 0..1, so
   it swings continuously under the thumb and creaks through the three
   positions. The thumb is the door's foot on an architect's swing arc on the
   floor: a RouteSlider on an arc, snapping to three stops. Fallbacks: tap a
   label, or Left/Right on the slider's native range.

   Until the respondent moves it the door is drawn faint and the navy knob
   waits off the arc, so no position is the default. */
import { useState } from 'react'
import Sheet from '../Sheet'
import RouteSlider from '../RouteSlider'
import { Art } from '../art'
import { items } from '../content'
import { useGameCtx } from '../context'
import { sfx } from '../feel'
import type { Answers, StepProps } from '../types'

type Pos = Answers['classroom.mandatory']
const OPTIONS = items('F1').map((i) => ({ id: i.id as Pos, label: i.label, position: String(i.position) }))
const AT: Record<string, number> = { shut: 0, ajar: 0.5, open: 1 }
const WORD: Record<string, string> = { shut: 'Shut', ajar: 'Ajar', open: 'Open' }

/* Geometry, in the slider's user units (the door art is 64 units square at
   (ART_X, 0); its hinge is at x = 16 and its leaf 32 wide, floor at 58.5). */
const VB: [number, number] = [78, 84]
const ART_X = 2
const HINGE = { x: ART_X + 16, y: 58.5 }
const R = 32
const RY = 13
const ARC = `M ${HINGE.x + R} ${HINGE.y} A ${R} ${RY} 0 0 1 ${HINGE.x} ${HINGE.y + RY}`
const PARKED = { x: HINGE.x + R + 8, y: HINGE.y + RY + 2 }

/** Slider position 0..1 -> how far the drawn door is open, so the three
    stops match the art's shut (0), ajar (0.45) and open (1). */
const doorOpen = (t: number) => (t <= 0.5 ? t * 0.9 : 0.45 + (t - 0.5) * 1.1)

export default function F1(p: StepProps) {
  const ctx = useGameCtx()
  const value = p.answers['classroom.mandatory'] ?? null
  // one drag or one tap finishes the sheet (Sheet auto, 500ms); arrow keys
  // step through the stops, so after a key change the Continue button shows
  const [picks, setPicks] = useState(0)
  const [byKey, setByKey] = useState(false)
  const stops = OPTIONS.map((o) => ({ id: o.id, at: AT[o.position], label: WORD[o.position], valueText: `${WORD[o.position]}: ${o.label}` }))

  const choose = (id: string, via: string) => {
    setByKey(via === 'key')
    if (via !== 'key') setPicks((n) => n + 1)
    if (id === value) return
    const pos = OPTIONS.find((o) => o.id === id)?.position ?? 'shut'
    p.set('classroom.mandatory', id as Pos)
    p.log('door', { id, via })
    sfx('creak', ctx.sound, { pitch: AT[pos] })
  }

  return (
    <Sheet id="F1" valid={value !== null} onDone={p.next} auto value={picks && !byKey ? value : undefined} picks={picks} showDone={byKey}>
      <div className="flex items-stretch gap-3" data-testid="f1-body">
        <div className="relative h-[190px] w-[176px] shrink-0">
          <RouteSlider
            d={ARC}
            viewBox={VB}
            width={176}
            height={190}
            stops={stops}
            value={value}
            parked={PARKED}
            label="The classroom door: shut, ajar or open"
            thumbHit={10}
            stopHit={8}
            trackHit={14}
            testId="door-range"
            onChange={(id, m) => choose(id, m.via)}
            renderTrack={(s) => {
              const set = s.t !== null
              const foot = set ? s.pointAt(s.t!) : null
              return (
                <g>
                  {/* the door, swinging with the thumb */}
                  <g transform={`translate(${ART_X} 0)`} opacity={set ? 1 : 0.5} style={{ transition: 'opacity 200ms' }}>
                    <Art id="fu-door" width={64} height={64} value={set ? doorOpen(s.t!) : 0} />
                  </g>
                  {/* the swing arc on the floor, and its three marks */}
                  <path d={ARC} fill="none" stroke="#8C857A" strokeWidth={1} strokeDasharray="2 3" vectorEffect="non-scaling-stroke" />
                  {foot && (
                    <line x1={HINGE.x} y1={HINGE.y} x2={foot.x} y2={foot.y} stroke="#0D0C0B" strokeWidth={1.5}
                      strokeLinecap="round" vectorEffect="non-scaling-stroke" />
                  )}
                  {s.stops.map((st) => {
                    const lx = st.at === 0 ? st.x + 2 : st.at === 1 ? st.x - 2 : st.x + 4
                    const ly = st.at === 0 ? st.y + 7.5 : st.y + 7.5
                    const anchor = st.at === 0 ? 'start' : st.at === 1 ? 'middle' : 'start'
                    return (
                      <g key={st.id}>
                        <circle cx={st.x} cy={st.y} r={1.4} fill={st.selected ? '#14233B' : '#F8F7F4'} stroke="#0D0C0B" strokeWidth={1} vectorEffect="non-scaling-stroke" />
                        <text x={lx} y={ly} textAnchor={anchor} fontFamily="Archivo, Arial, sans-serif" fontSize={5}
                          fill={st.selected ? '#0D0C0B' : '#494540'} fontWeight={st.selected ? 600 : 400}>{st.label}</text>
                      </g>
                    )
                  })}
                </g>
              )
            }}
            renderThumb={(s) => (
              <g>
                {!s.set && <circle r={6.5} fill="none" stroke="#14233B" strokeWidth={1} strokeDasharray="1.5 1.5" vectorEffect="non-scaling-stroke" />}
                <circle r={s.dragging ? 4.6 : 4} fill="#14233B" stroke="#0D0C0B" strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
                <path d="M -1.6 0 H 1.6" stroke="#F8F7F4" strokeWidth={1} vectorEffect="non-scaling-stroke" />
              </g>
            )}
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-2" role="radiogroup" aria-label="Classroom">
          {OPTIONS.map((o) => (
            <button
              key={o.id}
              type="button"
              role="radio"
              aria-checked={value === o.id}
              data-on={value === o.id}
              onClick={() => choose(o.id, 'tap')}
              className="choice flex !min-h-[48px] items-center gap-2 !px-3 !py-2 !text-[14px] !leading-[17px]"
              data-testid={`door-${o.id}`}
            >
              <span className="w-[34px] shrink-0 font-[family-name:var(--font-ui)] text-[11px] uppercase tracking-[0.08em] opacity-70">{WORD[o.position]}</span>
              <span className="min-w-0">{o.label}</span>
            </button>
          ))}
        </div>
      </div>
    </Sheet>
  )
}
