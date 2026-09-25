'use client'
/* useFitScale: fit a design canvas (dw x dh CSS px at k = 1) into the box
   `ref` measures, k = clamp(min, min(availW/dw, availH/dh), max). Generalises
   the ResizeObserver k-scale S05, S06, S10 and S11 each do by hand. The desk
   stage body uses clamp(0.72, .., 1.25): 1.25 because the 3D art is 512px.

     const { ref, k, w, h } = useFitScale<HTMLDivElement>(936, 580)
     <div ref={ref} className="absolute inset-0">
       <div style={{ width: 936, height: 580, transform: `scale(${k})` }}>…</div>
     </div>

   Measures clientWidth/clientHeight (layout px), so it is not fooled by a
   transform on an ancestor. */
import { useCallback, useLayoutEffect, useRef, useState } from 'react'

export const DESK_K = { min: 0.72, max: 1.25 }

export function fitScale(aw: number, ah: number, dw: number, dh: number, min = DESK_K.min, max = DESK_K.max): number {
  if (!(aw > 0 && ah > 0 && dw > 0 && dh > 0)) return 1
  return Math.max(min, Math.min(max, aw / dw, ah / dh))
}

export function useFitScale<T extends HTMLElement = HTMLDivElement>(dw: number, dh: number, opts: { min?: number; max?: number } = {}) {
  const [box, setBox] = useState({ w: 0, h: 0 })
  const el = useRef<T | null>(null)
  const ro = useRef<ResizeObserver | null>(null)
  const ref = useCallback((node: T | null) => {
    ro.current?.disconnect()
    el.current = node
    if (!node) return
    const measure = () => setBox((b) => (b.w === node.clientWidth && b.h === node.clientHeight ? b : { w: node.clientWidth, h: node.clientHeight }))
    measure()
    ro.current = new ResizeObserver(measure)
    ro.current.observe(node)
  }, [])
  useLayoutEffect(() => () => ro.current?.disconnect(), [])
  const k = fitScale(box.w, box.h, dw, dh, opts.min, opts.max)
  return { ref, el, k, w: box.w, h: box.h }
}
