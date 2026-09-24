'use client'
import { useEffect, useRef } from 'react'
import { buildTerrain, drawScene, Terrain } from './mountain'

export default function Scene({ t, successor }: { t: number; successor: number }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const terr = useRef<Terrain | null>(null)
  const state = useRef({ t, successor, px: 0, tt: t, ss: successor })

  useEffect(() => { state.current.t = t; state.current.successor = successor }, [t, successor])

  useEffect(() => {
    if (!terr.current) terr.current = buildTerrain()
    const cv = ref.current!
    const ctx = cv.getContext('2d', { alpha: false })!
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let raf = 0, targetPx = 0

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      cv.width = Math.floor(cv.clientWidth * dpr)
      cv.height = Math.floor(cv.clientHeight * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    const onMove = (e: PointerEvent) => { targetPx = (e.clientX / window.innerWidth) * 2 - 1 }

    const frame = () => {
      const s = state.current
      // ease toward the target so screen changes are a camera move, not a cut
      s.tt += (s.t - s.tt) * 0.045
      s.ss += (s.successor - s.ss) * 0.05
      s.px += (targetPx - s.px) * 0.06
      drawScene(ctx, cv.clientWidth, cv.clientHeight, terr.current!, {
        t: s.tt, px: s.px, reduced, successor: s.ss, climberU: 0.30 + 0.34 * s.tt,
      })
      raf = requestAnimationFrame(frame)
    }
    resize(); frame()
    window.addEventListener('resize', resize)
    if (!reduced) window.addEventListener('pointermove', onMove)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onMove)
    }
  }, [])

  return <canvas ref={ref} aria-hidden className="fixed inset-0 h-full w-full" />
}
