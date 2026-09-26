'use client'
/* True on a laptop-width screen (the frame's lg breakpoint, 1024px). False on
   the server and on phones, so the phone layout is the first paint. */
import { useSyncExternalStore } from 'react'

const Q = '(min-width: 1024px)'
const subscribe = (cb: () => void) => {
  const m = window.matchMedia(Q)
  m.addEventListener('change', cb)
  return () => m.removeEventListener('change', cb)
}

export function useLaptop(): boolean {
  return useSyncExternalStore(subscribe, () => window.matchMedia(Q).matches, () => false)
}
