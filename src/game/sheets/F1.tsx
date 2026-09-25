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
   waits off the arc, so no position is the default.

   DESK (design 6): a card 880 wide at k = 1. Left 300: the same door slider
   at 276 x 298 (the door about 230px, fu-door re-rendered at 1024). Right:
   three option rows 440 x 76, each with its number key, a plan-view glyph of
   the door state, the state word and the label. Keys: 1-3 pick (and finish,
   like a tap); Left/Right step the door (like the slider's own keys: then
   the panel's Continue finishes). */
import { useState } from 'react'
import type { ReactNode } from 'react'
import Sheet from '../Sheet'
import KeyCap from '../KeyCap'
import { CARD_DW, NumBadge, SheetCanvas, numberKeys, useSheetFit, useSheetKeys } from './desk'
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

  // step: a key that steps through the stops (no auto-finish); a desk number
  // key is logged as 'key' but picks outright, like a tap
  const choose = (id: string, via: string, step = via === 'key') => {
    setByKey(step)
    if (!step) setPicks((n) => n + 1)
    if (id === value) return
    const pos = OPTIONS.find((o) => o.id === id)?.position ?? 'shut'
    p.set('classroom.mandatory', id as Pos)
    p.log('door', { id, via })
    sfx('creak', ctx.sound, { pitch: AT[pos] })
  }

  const door = (width: number, height: number): ReactNode => (
          <RouteSlider
            d={ARC}
            viewBox={VB}
            width={width}
            height={height}
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
  )

  // desk: number keys pick (a definitive pick, so it finishes like a tap);
  // arrows step the door like the slider's own keys
  const fit = useSheetFit(CARD_DW, 300)
  const at = OPTIONS.findIndex((o) => o.id === value)
  useSheetKeys({
    ...numberKeys(OPTIONS.length, (i) => choose(OPTIONS[i].id, 'key', false)),
    ArrowRight: () => choose(OPTIONS[Math.min(OPTIONS.length - 1, at + 1)].id, 'key'),
    ArrowLeft: () => choose(OPTIONS[Math.max(0, at < 0 ? 0 : at - 1)].id, 'key'),
  })

  return (
    <Sheet id="F1" valid={value !== null} onDone={p.next} auto value={picks && !byKey ? value : undefined} picks={picks} showDone={byKey}
      deskBody={fit.desk} cardHeight={fit.desk ? fit.cardHeight : undefined}>
      {fit.desk ? (
        <SheetCanvas fit={fit} testId="f1-body">
          <div className="absolute" style={{ left: 40, top: 0, width: 276, height: 298 }}>{door(276, 298)}</div>
          <div className="absolute flex flex-col justify-center gap-[14px]" style={{ left: 380, top: 0, width: 440, height: 298 }}
            role="radiogroup" aria-label="Classroom">
            {OPTIONS.map((o, i) => {
              const on = value === o.id
              return (
                <button
                  key={o.id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  data-on={on}
                  onClick={() => choose(o.id, 'tap')}
                  className="choice flex !h-[76px] !min-h-0 w-full items-center gap-4 !px-4 !py-0 text-left"
                  data-testid={`door-${o.id}`}
                >
                  {on ? <KeyCap k={String(i + 1)} quiet className="pointer-events-none shrink-0" /> : <NumBadge n={i + 1} className="shrink-0" />}
                  <DoorGlyph open={AT[o.position]} on={on} />
                  <span className="w-[52px] shrink-0 font-[family-name:var(--font-ui)] text-[12px] uppercase tracking-[0.12em] opacity-75">{WORD[o.position]}</span>
                  <span className="min-w-0 font-[family-name:var(--font-ui)] text-[18px] leading-[22px]">{o.label}</span>
                </button>
              )
            })}
          </div>
        </SheetCanvas>
      ) : (
      <div className="flex items-stretch gap-3" data-testid="f1-body">
        <div className="relative h-[190px] w-[176px] shrink-0">
          {door(176, 190)}
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
      )}
    </Sheet>
  )
}

/** The door state in plan view: the wall, the frame and the leaf swung
    shut (0), ajar (0.5) or open (1). */
function DoorGlyph({ open, on }: { open: number; on: boolean }) {
  const a = (open * 80 * Math.PI) / 180
  const c = on ? '#F8F7F4' : '#0D0C0B'
  const hx = 8, y = 24, L = 20
  const tip = `${hx + L * Math.cos(a)} ${y - L * Math.sin(a)}`
  return (
    <svg width={36} height={30} viewBox="0 0 36 30" className="shrink-0" aria-hidden>
      {/* the wall either side of the doorway, the leaf swung from its hinge */}
      <path d={`M0 ${y} H${hx} M${hx + L} ${y} H36`} stroke={c} strokeWidth={3.5} />
      {open > 0 && <path d={`M${hx + L} ${y} A ${L} ${L} 0 0 0 ${tip}`} fill="none" stroke={c} strokeWidth={0.9} strokeDasharray="1.5 2" opacity={0.8} />}
      <path d={`M${hx} ${y} L ${tip}`} stroke={c} strokeWidth={2.4} strokeLinecap="round" />
      <circle cx={hx} cy={y} r={1.8} fill={c} />
    </svg>
  )
}
