'use client'
/* useHotkeys: frame-wide keys (design 3.7).

     useHotkeys({ Enter: () => go(), '1': () => pick(0), m: toggleSound }, { enabled })

   Keys are KeyboardEvent.key values; letters match either case ('m' matches
   'M'); 'Alt+ArrowLeft' style names add a modifier. Listens on window in the
   BUBBLE phase and ignores any event a control already consumed
   (defaultPrevented): useDrag, RouteSlider and SwipeStack preventDefault the
   keys they use, so Enter drops a lifted item and never also presses Continue.
   Enter is left alone while a button or other control has focus (it
   activates that control). Off while a text field has focus (unless the key is listed in `inFields`),
   while the game is busy between steps, with Ctrl/Meta held, and during IME
   composition. A handler that returns false leaves the event alone;
   otherwise it is preventDefault-ed. */
import { useEffect, useRef } from 'react'
import { useGameCtx } from './context'

export type HotkeyHandler = (e: KeyboardEvent) => boolean | void
export type HotkeyMap = Record<string, HotkeyHandler | undefined>

export function isTextField(el: Element | null): boolean {
  if (!el) return false
  const t = el as HTMLElement
  if (t.isContentEditable) return true
  const tag = t.tagName
  if (tag === 'TEXTAREA' || tag === 'SELECT') return true
  if (tag === 'INPUT') {
    const type = (t as HTMLInputElement).type
    return !['range', 'checkbox', 'radio', 'button', 'submit'].includes(type)
  }
  return false
}

const CONTROL = 'button, a[href], [role="button"], [role="radio"], [role="slider"], [role="tab"], input, select, summary'
export function isControl(el: Element | null): boolean {
  return !!el && el !== document.body && !!(el as HTMLElement).matches?.(CONTROL)
}

/** The map key for an event: 'Enter', 'm', '1', 'Alt+ArrowLeft'. */
export function keyName(e: Pick<KeyboardEvent, 'key' | 'altKey'>): string {
  const k = e.key.length === 1 ? e.key.toLowerCase() : e.key
  return e.altKey ? `Alt+${k}` : k
}

export function useHotkeys(map: HotkeyMap, opts: { enabled?: boolean; inFields?: string[]; ignoreBusy?: boolean } = {}) {
  const ctx = useGameCtx()
  const m = useRef(map)
  m.current = map
  const busy = useRef(ctx.busy)
  busy.current = ctx.busy
  const o = useRef(opts)
  o.current = opts
  const enabled = opts.enabled ?? true

  useEffect(() => {
    if (!enabled) return
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.isComposing || e.ctrlKey || e.metaKey) return
      const name = keyName(e)
      const h = m.current[name] ?? (e.key.length === 1 ? m.current[e.key] : undefined)
      if (!h) return
      if (isTextField(document.activeElement) && !(o.current.inFields ?? []).includes(name)) return
      // Enter on a focused control belongs to that control (a focused Back
      // must not also press Continue)
      if (name === 'Enter' && isControl(document.activeElement)) return
      if (busy.current && !o.current.ignoreBusy) return
      if (h(e) !== false) e.preventDefault()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [enabled])
}
