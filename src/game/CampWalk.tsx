'use client'
/* CampWalk: the 56px strip that replaces Continue on the last screen of
   Base camp, Camp I and Camp II (S02, S04 Beat B, S06). The rookie stands at
   the foot of a short pitch; the respondent drags them about 100px up and
   bootprints ink in behind. 'Walk on' (tap or Enter) walks them up over
   600ms instead. Reaching the top calls onDone once. Only the respondent's
   input moves the climber. Frame renders this; screens just pass walk. */
import { useEffect, useRef, useState } from 'react'
import RouteSlider from './RouteSlider'
import Figure from './Figure'

// The pitch stays inside the 56px strip: a 28px rookie climbing 21px, so
// their head never rises into the tray above (the strip also clips).
const PATH = 'M 26 53 C 60 51, 96 42, 146 32'
const VB: [number, number] = [200, 56]

export default function CampWalk({ enabled, onDone, reduced, label = 'Walk them up to the next camp' }: {
  enabled: boolean
  onDone: () => void
  reduced: boolean
  label?: string
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

  const stride = t * 9 * Math.PI

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
          onProgress={(v, m) => {
            if (done.current) return
            setT(v)
            if (m.done && v >= 0.94) { setT(1); finish() }
          }}
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
    </div>
  )
}
