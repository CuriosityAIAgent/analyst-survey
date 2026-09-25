'use client'
/* RouteSlider: a thumb that can only travel along an SVG path.

   Drives S04 (vertical switchback), S08 (horizontal ridge), the F1 door (an
   arc), the camp-walk strip (Frame) and S11 (continuous, no data).

   - The pointer is projected onto points sampled along the path (nearest
     sample; while dragging the thumb the search stays near where it already
     is, so a switchback never jumps a hairpin).
   - Stop mode (`stops`): release snaps to the nearest stop, with a tick
     (navigator.vibrate(8) where supported). Tapping a stop walks there.
     `value` is the selected stop id; undefined or null = unset, and the thumb
     waits at `parked` (off the scale) until moved.
   - Continuous mode (no `stops`): `progress` 0..1, reported through
     onProgress; letting go leaves the thumb where it is (no slide back).
   - Accessibility: a visually hidden native <input type=range> (implicit
     role="slider") carries keyboard and screen-reader use, with
     aria-valuetext. Up/Right step up, Down/Left step down, Home/End jump to
     the ends; the first key from unset lands on the first stop.
   - The thumb is yours: renderThumb draws it at the origin (feet at 0,0) and
     the slider translates it to the path. Draw the climber there:
       renderThumb={(s) => <Figure as="g" size={48} pose={s.moving ? 'stride' : 'stand'} t={s.stride} />}
   - Reduced motion: the thumb jumps between positions instead of walking. */
import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { useReducedMotion } from 'motion/react'
import { useGameCtx } from './context'
import { buzz, sfx } from './feel'

export type Stop = {
  id: string
  /** Position along the path as a fraction of its length, 0..1. */
  at: number
  label: string
  /** aria-valuetext, e.g. '24 months'. Default: label. */
  valueText?: string
}

export type ThumbState = {
  x: number
  y: number
  /** Displayed position 0..1, or null while parked. */
  t: number | null
  set: boolean
  dragging: boolean
  /** True while dragging or walking to a stop: use a stride pose. */
  moving: boolean
  /** Walking phase in radians (grows with distance travelled). */
  stride: number
  /** Path tangent at the thumb in degrees (0 = heading right). */
  angle: number
  focused: boolean
}

export type TrackState = {
  t: number | null
  pointAt: (t: number) => { x: number; y: number }
  stops: { id: string; at: number; x: number; y: number; selected: boolean; label: string }[]
  length: number
}

export type ChangeMeta = { via: 'drag' | 'tap' | 'key'; reversals: number }

export type RouteSliderProps = {
  /** SVG path data, in viewBox user units. */
  d: string
  /** [width, height] of the user coordinate space. */
  viewBox: [number, number]
  /** CSS size of the slider box. Default 100% x 100%. */
  width?: number | string
  height?: number | string
  /** Snapping stops. Omit for continuous mode. */
  stops?: Stop[]
  /** Stop mode: the selected stop id; undefined/null = unset (parked). */
  value?: string | null
  onChange?: (id: string, meta: ChangeMeta) => void
  /** Continuous mode: 0..1 (undefined = at the start, or parked if given). */
  progress?: number
  /** Continuous mode: every move, and once more with done=true on release. */
  onProgress?: (t: number, meta: { via: 'drag' | 'key'; done: boolean }) => void
  /** Where the thumb waits while unset (user units). Default: the path start. */
  parked?: { x: number; y: number }
  /** Accessible name. */
  label: string
  orientation?: 'vertical' | 'horizontal'
  renderThumb: (s: ThumbState) => ReactNode
  /** Drawn under the thumb: labels, camps, inked footsteps. */
  renderTrack?: (s: TrackState) => ReactNode
  /** Radius of the thumb's touch target in user units. Default 32 (64 across). */
  thumbHit?: number
  /** Radius of each stop's tap target in user units. Default 22. */
  stopHit?: number
  /** Width of the invisible grab stroke along the path. Default 36. */
  trackHit?: number
  /** Draw small ink bootprints along the walked part of the path. */
  inkBehind?: boolean
  /** Enter on the focused slider (the camp walk's 'Walk on' fallback). */
  onEnter?: () => void
  /** Continuous mode keyboard step. Default 0.1. */
  keyStep?: number
  disabled?: boolean
  className?: string
  style?: CSSProperties
  /** Test hook: data-testid on the native range. */
  testId?: string
}

const N = 240
const vib = () => buzz(8)

export default function RouteSlider(p: RouteSliderProps) {
  const reduced = !!useReducedMotion()
  const svgRef = useRef<SVGSVGElement | null>(null)
  const pathRef = useRef<SVGPathElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [pts, setPts] = useState<{ x: number; y: number }[]>([])
  const [len, setLen] = useState(0)
  const [focused, setFocused] = useState(false)
  // the dashed focus ring is for keyboard focus only: a pointer press also
  // focuses the hidden range (so keys work after a drag) but shows no ring
  const pointerFocus = useRef(false)
  const ctx = useGameCtx()
  const [dragT, setDragTState] = useState<number | null>(null)
  const [shownT, setShownTState] = useState<number | null>(null)
  // refs mirror the state so pointer handlers never read a stale render
  const dragRef = useRef<number | null>(null)
  const shownRef = useRef<number | null>(null)
  const setDragT = (v: number | null) => { dragRef.current = v; setDragTState(v) }
  const setShownT = (v: number | null) => { shownRef.current = v; setShownTState(v) }
  const [walking, setWalking] = useState(false)
  const stride = useRef(0)
  const reversals = useRef(0)
  const lastDir = useRef(0)
  const lastT = useRef<number | null>(null)
  const tween = useRef<number | null>(null)
  const uid = useId()

  const stopsMode = !!p.stops
  const stops = p.stops ?? []
  const selIndex = stopsMode ? stops.findIndex((s) => s.id === p.value) : -1
  const targetT: number | null = stopsMode
    ? selIndex >= 0 ? stops[selIndex].at : null
    : p.progress ?? (p.parked ? null : 0)

  /* ---- sample the path */
  useLayoutEffect(() => {
    const el = pathRef.current
    if (!el) return
    let L = 0
    try { L = el.getTotalLength() } catch { L = 0 }
    const out: { x: number; y: number }[] = []
    for (let i = 0; i < N; i++) {
      const q = L ? el.getPointAtLength((i / (N - 1)) * L) : { x: 0, y: 0 }
      out.push({ x: q.x, y: q.y })
    }
    setPts(out); setLen(L)
  }, [p.d])

  const pointAt = useCallback((t: number) => {
    if (!pts.length) return { x: 0, y: 0 }
    const f = Math.max(0, Math.min(1, t)) * (N - 1)
    const i = Math.floor(f), j = Math.min(N - 1, i + 1), u = f - i
    return { x: pts[i].x + (pts[j].x - pts[i].x) * u, y: pts[i].y + (pts[j].y - pts[i].y) * u }
  }, [pts])

  const angleAt = useCallback((t: number) => {
    const a = pointAt(Math.max(0, t - 0.01)), b = pointAt(Math.min(1, t + 0.01))
    return (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI
  }, [pointAt])

  /* ---- follow the target (tap, key, external) with a short walk */
  useEffect(() => {
    if (dragT !== null) return
    if (tween.current) cancelAnimationFrame(tween.current)
    if (targetT === null) { setShownT(null); return }
    if (!stopsMode) { setShownT(targetT); return }
    const from = shownRef.current
    if (from === null || reduced || Math.abs(from - targetT) < 0.001) { setShownT(targetT); return }
    const dur = Math.max(180, Math.min(600, Math.abs(targetT - from) * 900))
    const t0 = performance.now()
    setWalking(true)
    const tick = (now: number) => {
      const u = Math.min(1, (now - t0) / dur)
      const e = 1 - Math.pow(1 - u, 3)
      const t = from + (targetT - from) * e
      stride.current += Math.abs(targetT - from) * (len || 300) / 60
      setShownT(t)
      if (u < 1) tween.current = requestAnimationFrame(tick)
      else { setWalking(false); tween.current = null }
    }
    tween.current = requestAnimationFrame(tick)
    return () => { if (tween.current) cancelAnimationFrame(tween.current); setWalking(false) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetT, dragT === null, stopsMode, reduced])

  /* a stop reached: a haptic tick, and a boot-crunch when sound is on */
  const tick = () => { vib(); sfx('crunch', ctx.sound) }

  /* ---- pointer */
  const toUser = (cx: number, cy: number) => {
    const svg = svgRef.current
    const m = svg?.getScreenCTM()
    if (!svg || !m) return null
    const q = new DOMPoint(cx, cy).matrixTransform(m.inverse())
    return { x: q.x, y: q.y }
  }
  const nearest = (u: { x: number; y: number }, around: number | null) => {
    let best = 0, bd = Infinity
    const lo = around === null ? 0 : Math.max(0, Math.round(around * (N - 1)) - N / 5)
    const hi = around === null ? N - 1 : Math.min(N - 1, Math.round(around * (N - 1)) + N / 5)
    for (let i = lo; i <= hi; i++) {
      const d = (pts[i].x - u.x) ** 2 + (pts[i].y - u.y) ** 2
      if (d < bd) { bd = d; best = i }
    }
    return best / (N - 1)
  }

  type Press = { id: number; x0: number; y0: number; on: 'thumb' | 'track' | 'stop'; stopId?: string; moved: boolean }
  const press = useRef<Press | null>(null)

  const onPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (p.disabled || e.button !== 0 || !pts.length) return
    const target = e.target as Element
    const thumb = target.closest('[data-rs-thumb]')
    const stop = target.closest('[data-rs-stop]')
    const track = target.closest('[data-rs-track]')
    if (!thumb && !stop && !track) return
    e.preventDefault()
    try { svgRef.current?.setPointerCapture(e.pointerId) } catch { /* ignore */ }
    press.current = {
      id: e.pointerId, x0: e.clientX, y0: e.clientY, moved: false,
      on: thumb ? 'thumb' : stop ? 'stop' : 'track',
      stopId: stop?.getAttribute('data-rs-stop') ?? undefined,
    }
    pointerFocus.current = true
    setFocused(false)
    inputRef.current?.focus({ preventScroll: true })
  }

  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const pr = press.current
    if (!pr || pr.id !== e.pointerId) return
    if (!pr.moved) {
      if (Math.hypot(e.clientX - pr.x0, e.clientY - pr.y0) < 4) return
      if (!stopsMode && pr.on !== 'thumb') return // S11 & walks: only the climber can be dragged
      pr.moved = true
      if (tween.current) { cancelAnimationFrame(tween.current); tween.current = null; setWalking(false) }
    }
    const u = toUser(e.clientX, e.clientY)
    if (!u) return
    const cur = dragRef.current ?? shownRef.current
    const t = nearest(u, pr.on === 'thumb' && cur !== null ? cur : null)
    // count direction changes (pace.reversals / rope.reversals)
    if (lastT.current !== null) {
      const dt = t - lastT.current
      if (Math.abs(dt) > 0.012) {
        const dir = Math.sign(dt)
        if (lastDir.current !== 0 && dir !== lastDir.current) reversals.current += 1
        lastDir.current = dir
        lastT.current = t
      }
    } else lastT.current = t
    if (stopsMode && cur !== null) {
      for (const s of stops) if ((cur - s.at) * (t - s.at) < 0) vib()
    }
    if (cur !== null) stride.current += (Math.abs(t - cur) * (len || 300)) / 5
    setDragT(t)
    if (!stopsMode) p.onProgress?.(t, { via: 'drag', done: false })
  }

  const onPointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    const pr = press.current
    if (!pr || pr.id !== e.pointerId) return
    press.current = null
    if (pr.moved && dragRef.current !== null) {
      const t = dragRef.current
      setShownT(t)
      setDragT(null)
      lastT.current = null
      if (stopsMode) {
        let best = stops[0], bd = Infinity
        for (const s of stops) { const d = Math.abs(s.at - t); if (d < bd) { bd = d; best = s } }
        if (best) { tick(); p.onChange?.(best.id, { via: 'drag', reversals: reversals.current }) }
      } else p.onProgress?.(t, { via: 'drag', done: true })
      return
    }
    // a tap
    if (!stopsMode) return
    if (pr.on === 'stop' && pr.stopId) { tick(); p.onChange?.(pr.stopId, { via: 'tap', reversals: reversals.current }); return }
    if (pr.on === 'track') {
      const u = toUser(e.clientX, e.clientY)
      if (!u) return
      const t = nearest(u, null)
      let best = stops[0], bd = Infinity
      for (const s of stops) { const d = Math.abs(s.at - t); if (d < bd) { bd = d; best = s } }
      if (best) { tick(); p.onChange?.(best.id, { via: 'tap', reversals: reversals.current }) }
    }
  }

  const onPointerCancel = () => {
    press.current = null
    const d = dragRef.current
    if (d !== null) { setShownT(d); setDragT(null) }
  }

  /* ---- keyboard (on the hidden native range) */
  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (p.disabled) return
    if (pointerFocus.current) { pointerFocus.current = false; setFocused(true) }
    const k = e.key
    if (k === 'Enter' && p.onEnter) { e.preventDefault(); p.onEnter(); return }
    const up = k === 'ArrowUp' || k === 'ArrowRight' || k === 'PageUp'
    const down = k === 'ArrowDown' || k === 'ArrowLeft' || k === 'PageDown'
    if (!up && !down && k !== 'Home' && k !== 'End') return
    e.preventDefault()
    if (stopsMode) {
      if (!stops.length) return
      let i = selIndex
      if (k === 'Home') i = 0
      else if (k === 'End') i = stops.length - 1
      else if (i < 0) i = 0
      else i = Math.max(0, Math.min(stops.length - 1, i + (up ? 1 : -1)))
      tick()
      p.onChange?.(stops[i].id, { via: 'key', reversals: reversals.current })
    } else {
      const step = p.keyStep ?? 0.1
      const cur = p.progress ?? 0
      const t = k === 'Home' ? 0 : k === 'End' ? 1 : Math.max(0, Math.min(1, cur + (up ? step : -step)))
      p.onProgress?.(t, { via: 'key', done: true })
    }
  }
  // assistive tech that sets the value directly (VoiceOver swipe up/down)
  const onInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value)
    if (stopsMode) { const s = stops[v]; if (s && s.id !== p.value) p.onChange?.(s.id, { via: 'key', reversals: reversals.current }) }
    else p.onProgress?.(v / 100, { via: 'key', done: true })
  }

  /* ---- render */
  const t = dragT ?? shownT
  const pos = t === null ? (p.parked ?? pointAt(0)) : pointAt(t)
  const thumb: ThumbState = {
    x: pos.x, y: pos.y, t, set: t !== null, dragging: dragT !== null,
    moving: dragT !== null || walking, stride: stride.current, angle: t === null ? 0 : angleAt(t), focused,
  }
  const trackState: TrackState = useMemo(() => ({
    t,
    pointAt,
    length: len,
    stops: stops.map((s) => ({ id: s.id, at: s.at, label: s.label, selected: s.id === p.value, ...pointAt(s.at) })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [t, pointAt, len, p.stops, p.value])

  const hitR = p.thumbHit ?? 32
  const valueText = stopsMode
    ? selIndex >= 0 ? stops[selIndex].valueText ?? stops[selIndex].label : 'Not set'
    : `${Math.round((p.progress ?? 0) * 100)} percent of the way`

  const prints = useMemo(() => {
    if (!p.inkBehind || t === null || !len) return null
    const out: ReactNode[] = []
    const gap = 9 / len
    for (let u = 0.02, i = 0; u < t - 0.01; u += gap, i++) {
      const q = pointAt(u), a = angleAt(u)
      const side = i % 2 ? 2.2 : -2.2
      out.push(
        <ellipse key={i} cx={0} cy={side} rx={2.2} ry={1.2} fill="#0D0C0B"
          transform={`translate(${q.x} ${q.y}) rotate(${a})`} />,
      )
    }
    return <g aria-hidden>{out}</g>
  }, [p.inkBehind, t, len, pointAt, angleAt])

  return (
    <div
      className={p.className}
      style={{ position: 'relative', width: p.width ?? '100%', height: p.height ?? '100%', touchAction: 'none', ...p.style }}
      data-route-slider
    >
      <svg
        ref={svgRef}
        viewBox={`0 0 ${p.viewBox[0]} ${p.viewBox[1]}`}
        width="100%" height="100%"
        style={{ overflow: 'visible', touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none', display: 'block' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        aria-hidden
      >
        <path ref={pathRef} d={p.d} fill="none" stroke="transparent" strokeWidth={p.trackHit ?? 36}
          strokeLinecap="round" pointerEvents="stroke" data-rs-track style={{ cursor: p.disabled ? 'default' : 'pointer' }} />
        {p.renderTrack?.(trackState)}
        {prints}
        {stopsMode && trackState.stops.map((s) => (
          <circle key={s.id} cx={s.x} cy={s.y} r={p.stopHit ?? 22} fill="transparent" data-rs-stop={s.id}
            style={{ cursor: p.disabled ? 'default' : 'pointer' }} />
        ))}
        <g transform={`translate(${pos.x} ${pos.y})`} data-rs-thumb style={{ cursor: p.disabled ? 'default' : dragT !== null ? 'grabbing' : 'grab' }}>
          <circle r={hitR} fill="transparent" />
          {focused && (
            <circle r={hitR * 0.78} cy={-hitR * 0.55} fill="none" stroke="#1F4B3A" strokeWidth={1.5}
              strokeDasharray="3 3" vectorEffect="non-scaling-stroke" />
          )}
          {p.renderThumb(thumb)}
        </g>
      </svg>
      <input
        ref={inputRef}
        id={uid}
        type="range"
        min={0}
        max={stopsMode ? Math.max(0, stops.length - 1) : 100}
        step={stopsMode ? 1 : 10}
        value={stopsMode ? Math.max(0, selIndex) : Math.round((p.progress ?? 0) * 100)}
        aria-label={p.label}
        aria-valuetext={valueText}
        aria-orientation={p.orientation ?? 'horizontal'}
        disabled={p.disabled}
        onKeyDown={onKeyDown}
        onChange={onInput}
        onFocus={() => setFocused(!pointerFocus.current)}
        onBlur={() => { setFocused(false); pointerFocus.current = false }}
        data-testid={p.testId}
        style={{
          position: 'absolute', left: 0, top: 0, width: 1, height: 1, opacity: 0,
          margin: 0, padding: 0, border: 0, pointerEvents: 'none',
        }}
      />
    </div>
  )
}
