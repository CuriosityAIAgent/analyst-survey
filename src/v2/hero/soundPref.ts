/* One sound switch for every v2 screen (podium thunk, month clicks, stamp knock,
   bottle pour). OFF by default: Associates open this at their desks, often on an
   open floor, and an unexpected sound is unprofessional. The switch sits in the
   rail on every screen (V2Frame) and is kept for the rest of the visit. */
import { useSyncExternalStore } from 'react'

const KEY = 'ascent-v2-sound'
const listeners = new Set<() => void>()
let memory: boolean | null = null

export function soundOn(): boolean {
  if (typeof window === 'undefined') return false
  if (memory !== null) return memory
  try { return window.localStorage.getItem(KEY) === 'on' } catch { return false }
}

export function setSoundOn(on: boolean) {
  memory = on
  try { window.localStorage.setItem(KEY, on ? 'on' : 'off') } catch { /* private mode: this visit only */ }
  for (const l of listeners) l()
}

function subscribe(l: () => void) {
  listeners.add(l)
  return () => { listeners.delete(l) }
}

/** The switch as React state: every screen that shows it stays in step. */
export function useSound(): [boolean, (on: boolean) => void] {
  const on = useSyncExternalStore(subscribe, soundOn, () => false)
  return [on, setSoundOn]
}
