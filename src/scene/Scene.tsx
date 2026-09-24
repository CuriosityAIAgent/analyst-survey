'use client'
import { useEffect, useRef } from 'react'
import { buildTerrain, drawScene, Terrain } from './mountain'

export default function Scene({ t, successor }: { t: number; successor: number }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const terr = useRef<Terrain | null>(null)
  const state = useRef({ t, successor, px: 0, tt: t, ss: successor })
  const wakeRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    state.current.t = t
    state.current.successor = successor
    wakeRef.current?.()   // a new screen restarts the loop if it had settled
  }, [t, successor])

  useEffect(() => {
    if (!terr.current) terr.current = buildTerrain()
    const cv = ref.current!
    const ctx = cv.getContext('2d', { alpha: false })!
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let raf = 0, targetPx = 0, idle = 0, running = true

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      cv.width = Math.floor(cv.clientWidth * dpr)
      cv.height = Math.floor(cv.clientHeight * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    const wake: () => void = () => { idle = 0; if (!running && !document.hidden) { running = true; raf = requestAnimationFrame(frame) } }
    const onMove = (e: PointerEvent) => { targetPx = (e.clientX / window.innerWidth) * 2 - 1; wake() }
    const onVisibility = () => {
      if (document.hidden) { running = false; cancelAnimationFrame(raf) } else wake()
    }

    const frame = () => {
      const s = state.current
      // ease toward the target so screen changes are a camera move, not a cut
      const d = Math.abs(s.t - s.tt) + Math.abs(s.successor - s.ss) + Math.abs(targetPx - s.px)
      s.tt += (s.t - s.tt) * 0.045
      s.ss += (s.successor - s.ss) * 0.05
      s.px += (targetPx - s.px) * 0.06
      drawScene(ctx, cv.clientWidth, cv.clientHeight, terr.current!, {
        t: s.tt, px: s.px, reduced, successor: s.ss, climberU: 0.30 + 0.34 * s.tt,
      })
      // the scene is static between transitions: stop rather than burn battery
      idle = d < 0.0015 ? idle + 1 : 0
      if (idle > 30) { running = false; return }
      raf = requestAnimationFrame(frame)
    }
    const onResize = () => { resize(); wake() }
    wakeRef.current = wake
    resize(); frame()
    window.addEventListener('resize', onResize)
    document.addEventListener('visibilitychange', onVisibility)
    if (!reduced) window.addEventListener('pointermove', onMove)
    return () => {
      running = false
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('pointermove', onMove)
    }
  }, [])

  return <canvas ref={ref} aria-hidden className="fixed inset-0 h-full w-full" />
}
