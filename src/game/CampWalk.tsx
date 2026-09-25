'use client'
/* CampWalk: the 56px strip that replaces Continue on the last screen of
   Base camp, Camp I and Camp II (S02, S04 Beat B, S06). The rookie stands at
   the foot of a short pitch; the respondent drags them about 100px up and
   bootprints ink in behind. 'Walk on' (tap or Enter) walks them up over
   600ms instead. Reaching the top calls onDone once. Only the respondent's
   input moves the climber. Frame renders this; screens just pass walk.

   Desk (design 3.6): Frame renders the long trail (`desk`: a 1000x88 strip at
   the stage foot, a ~600px pencil path to the next camp's tent, the rookie at
   56px) with `hideButton`: the panel's primary reads 'Walk on' and calls the
   imperative walkOn() through `ref`. Dragging the rookie does the same. */
import { useEffect, useImperativeHandle, useRef, useState } from 'react'
import type { Ref } from 'react'
import RouteSlider from './RouteSlider'
import Figure from './Figure'

// The pitch stays inside the 56px strip: a 28px rookie climbing 21px, so
// their head never rises into the tray above (the strip also clips).
const PATH = 'M 26 53 C 60 51, 96 42, 146 32'
const VB: [number, number] = [200, 56]

// The desk trail: 1000x88 user units, drawn 1:1 at 1000px wide.
export const DESK_TRAIL = {
  d: 'M 44 82 C 200 80, 420 70, 640 52',
  viewBox: [1000, 88] as [number, number],
  tent: { x: 676, y: 52 },
}

export type CampWalkHandle = { walkOn: () => void }

export default function CampWalk({ enabled, onDone, reduced, label = 'Walk them up to the next camp', desk, hideButton, nextCamp, ref }: {
  enabled: boolean
  onDone: () => void
  reduced: boolean
  label?: string
  /** The long desk trail at the stage foot (height 88, or 72 compact). */
  desk?: { width: number; height: number }
  /** No 'Walk on' button of its own (the desk panel's primary walks). */
  hideButton?: boolean
  /** The next camp's name, lettered by its tent (desk). */
  nextCamp?: string
  ref?: Ref<CampWalkHandle>
}) {
  const [t, setT] = useState(0)
  const done = useRef(false)
  const raf = useRef<number | null>(null)

  useEffect(() => () => { if (raf.current) cancelAnimationFrame(raf.current) }, [])

  const finish = () => {
    if (done.current) return
    done.current = true
    window.setTimeout(onDone, reduced ? 60 : 220)
  }

  const walkOn = () => {
    if (!enabled || done.current) return
    if (reduced) { setT(1); finish(); return }
    const from = t, t0 = performance.now(), dur = 600
    const tick = (now: number) => {
      const u = Math.min(1, (now - t0) / dur)
      setT(from + (1 - from) * (1 - Math.pow(1 - u, 2)))
      if (u < 1) raf.current = requestAnimationFrame(tick)
      else finish()
    }
    raf.current = requestAnimationFrame(tick)
  }
  const walkRef = useRef(walkOn)
  walkRef.current = walkOn
  useImperativeHandle(ref, () => ({ walkOn: () => walkRef.current() }), [])

  const stride = t * 9 * Math.PI
  const onProgress = (v: number, m: { done: boolean }) => {
    if (done.current) return
    setT(v)
    if (m.done && v >= 0.94) { setT(1); finish() }
  }

  if (desk) {
    const [vw, vh] = DESK_TRAIL.viewBox
    const T = DESK_TRAIL.tent
    const fig = desk.height < 80 ? 48 : 56
    return (
      <div
        className="relative mx-auto"
        style={{ width: desk.width, height: desk.height, opacity: enabled ? 1 : 0.42, transition: 'opacity 200ms ease' }}
        data-camp-walk
        data-desk-trail
        data-enabled={enabled ? 'true' : 'false'}
      >
        <RouteSlider
          d={DESK_TRAIL.d}
          viewBox={[vw, vh]}
          width={desk.width}
          height={desk.height}
          progress={t}
          label={label}
          disabled={!enabled}
          inkBehind
          onEnter={walkOn}
          thumbHit={30}
          onProgress={onProgress}
          renderTrack={() => (
            <g aria-hidden>
              <path d={`M 0 87 C 200 86, 420 76, 660 ${T.y + 1} L ${vw} ${T.y}`} fill="none" stroke="#0D0C0B" strokeWidth={1} />
              <path d={DESK_TRAIL.d} fill="none" stroke="#8C857A" strokeWidth={1.2} strokeDasharray="2 5" />
              <path d={`M ${T.x - 14} ${T.y} L ${T.x} ${T.y - 20} L ${T.x + 14} ${T.y} Z`} fill="#F8F7F4" stroke="#0D0C0B" strokeWidth={1.2} strokeLinejoin="round" />
              <path d={`M ${T.x} ${T.y - 12} L ${T.x} ${T.y}`} stroke="#0D0C0B" strokeWidth={1} />
              {nextCamp && (
                <text x={T.x + 22} y={T.y - 4} fontFamily="Archivo, Arial, sans-serif" fontSize={12} letterSpacing="0.12em" fill="#494540">
                  {nextCamp.toUpperCase()}
                </text>
              )}
            </g>
          )}
          renderThumb={(s) => (
            <Figure as="g" size={fig} pose={s.moving || (t > 0 && t < 1) ? 'stride' : 'stand'} t={s.dragging ? s.stride : stride} />
          )}
        />
        {!hideButton && (
          <button type="button" className="btn absolute right-4 top-1/2 -translate-y-1/2" disabled={!enabled} onClick={walkOn} data-testid="walk-on">
            Walk on
          </button>
        )}
      </div>
    )
  }

  return (
    <div
      className="flex h-14 items-center gap-3 px-5"
      style={{ opacity: enabled ? 1 : 0.38, transition: 'opacity 200ms ease' }}
      data-camp-walk
      data-enabled={enabled ? 'true' : 'false'}
    >
      <div className="relative h-14 w-[200px] shrink-0 overflow-hidden">
        <RouteSlider
          d={PATH}
          viewBox={VB}
          width={200}
          height={56}
          progress={t}
          label={label}
          disabled={!enabled}
          inkBehind
          onEnter={walkOn}
          thumbHit={24}
          onProgress={onProgress}
          renderTrack={() => (
            <g aria-hidden>
              {/* the pitch: a rock hairline under the route, the next camp's tent at the top */}
              <path d="M 0 55.4 C 40 54.4, 100 44, 150 35.4 L 200 34.4" fill="none" stroke="#0D0C0B" strokeWidth={1} />
              <path d={PATH} fill="none" stroke="#8C857A" strokeWidth={1} strokeDasharray="2 4" />
              <path d="M 156 34.4 L 164 22.4 L 172 34.4 Z" fill="none" stroke="#0D0C0B" strokeWidth={1.2} strokeLinejoin="round" />
              <path d="M 164 26.6 L 164 34.4" stroke="#0D0C0B" strokeWidth={1} />
            </g>
          )}
          renderThumb={(s) => (
            <Figure as="g" size={28} pose={s.moving || (t > 0 && t < 1) ? 'stride' : 'stand'} t={s.dragging ? s.stride : stride} />
          )}
        />
      </div>
      <div className="flex-1" />
      {!hideButton && (
        <button
          type="button"
          className="btn shrink-0"
          style={{ minHeight: 44, padding: '10px 18px', fontSize: 15 }}
          disabled={!enabled}
          onClick={walkOn}
          data-testid="walk-on"
        >
          Walk on
        </button>
      )}
    </div>
  )
}
