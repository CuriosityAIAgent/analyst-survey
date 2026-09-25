'use client'
/* Feel: the small shared things every mechanic uses to answer a touch.

   - buzz(ms)            haptic, where supported (Android; iOS fails silently)
   - sfx(kind, opts)     one short synthesised sound. Silent unless the
                         respondent turned sound on: pass ctx.sound as `on`.
   - useSnap(stage)      FLIP: an item springs 180ms from where it was let go
                         to where it now lives.
   - campPaper(id)       the warmed paper of a screen's camp, for label
                         backings that must not be crossed by scene lines.

   Sounds ("Fun and feel"): a stud click on each brick snap, a boot-crunch
   tick at each slider stop, a creak for the F1 door, a clink as a method
   settles on the plaque, a clack as a cairn stone lands, a stamp thunk for
   the storm calls, a zip as the rucksack fills. One AudioContext, created on
   the first sound (after a user gesture, so browsers allow it). */
import { useLayoutEffect, useRef } from 'react'
import type { RefObject } from 'react'
import { campIndex, paperFor } from './content'
import type { StepId } from './types'

/* ------------------------------------------------------------------ haptics */

export function buzz(pattern: number | number[] = 8) {
  try { navigator.vibrate?.(pattern) } catch { /* iOS: silent */ }
}

/* ------------------------------------------------------------------ sound */

export type Sfx =
  | 'drop' | 'zip' | 'bounce' // S02 board
  | 'type' // a letter carved or written
  | 'stud' // a brick or pitch snapping on (pitch: opts.pitch)
  | 'crunch' // a boot-crunch tick at a slider stop
  | 'creak' // the F1 door (opts.pitch 0..1: how far open)
  | 'stamp' // S07 storm-call stamp
  | 'click' // a carabiner gate closing (S09, F5)
  | 'clack' // a cairn stone landing
  | 'clink' // brass: a method settling into the F4 plaque

let audio: AudioContext | null = null
function ac(): AudioContext | null {
  if (typeof window === 'undefined') return null
  try {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AC) return null
    audio ??= new AC()
    if (audio.state === 'suspended') audio.resume().catch(() => {})
    return audio
  } catch { return null }
}

function noise(a: AudioContext, secs: number, shape: (i: number, n: number) => number) {
  const n = Math.max(1, Math.floor(a.sampleRate * secs))
  const buf = a.createBuffer(1, n, a.sampleRate)
  const d = buf.getChannelData(0)
  for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * shape(i, n)
  const src = a.createBufferSource()
  src.buffer = buf
  return src
}

/** Play one short sound if `on` (the respondent's sound toggle). */
export function sfx(kind: Sfx, on: boolean, opts: { pitch?: number } = {}) {
  if (!on) return
  const a = ac()
  if (!a) return
  try {
    const t = a.currentTime
    const g = a.createGain()
    g.connect(a.destination)
    const osc = (type: OscillatorType, f0: number, f1: number, dur: number, gain: number, attack = 0) => {
      const o = a.createOscillator()
      o.type = type
      o.frequency.setValueAtTime(f0, t)
      o.frequency.exponentialRampToValueAtTime(f1, t + dur * 0.7)
      if (attack) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain, t + attack) }
      else g.gain.setValueAtTime(gain, t)
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
      o.connect(g); o.start(t); o.stop(t + dur + 0.02)
    }
    const p = opts.pitch ?? 1
    switch (kind) {
      case 'drop': return osc('triangle', 520, 300, 0.1, 0.08)
      case 'bounce': return osc('sine', 140, 90, 0.1, 0.08)
      case 'type': return osc('square', 2200 + Math.random() * 600, 1800, 0.03, 0.018)
      case 'stud': return osc('triangle', 1900 * p, 700 * p, 0.06, 0.18, 0.003)
      case 'stamp': return osc('triangle', 140, 60, 0.12, 0.18)
      case 'click': return osc('square', 2400, 900, 0.05, 0.06)
      case 'clink': return osc('sine', 1320, 1300, 0.25, 0.08)
      case 'creak': {
        const o = a.createOscillator(), f = a.createBiquadFilter()
        o.type = 'sawtooth'
        o.frequency.setValueAtTime(95 + p * 40, t)
        o.frequency.linearRampToValueAtTime(140 + p * 70, t + 0.18)
        f.type = 'bandpass'; f.frequency.value = 900; f.Q.value = 6
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.05, t + 0.03); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22)
        o.connect(f); f.connect(g); o.start(t); o.stop(t + 0.24)
        return
      }
      case 'zip': {
        const src = noise(a, 0.22, (i) => (i % 90 < 45 ? 1 : 0.3))
        const f = a.createBiquadFilter()
        f.type = 'bandpass'; f.frequency.setValueAtTime(1800, t); f.frequency.linearRampToValueAtTime(4200, t + 0.22)
        g.gain.setValueAtTime(0.06, t); g.gain.linearRampToValueAtTime(0, t + 0.22)
        src.connect(f); f.connect(g); src.start(t)
        return
      }
      case 'clack':
      case 'crunch': {
        const src = noise(a, kind === 'clack' ? 0.05 : 0.04, (i, n) => Math.pow(1 - i / n, kind === 'clack' ? 5 : 3))
        const f = a.createBiquadFilter()
        f.type = 'bandpass'; f.frequency.value = kind === 'clack' ? 1100 : 2600; f.Q.value = kind === 'clack' ? 1.4 : 0.8
        g.gain.value = kind === 'clack' ? 0.5 : 0.22
        src.connect(f); f.connect(g); src.start(t)
        return
      }
    }
  } catch { /* no audio: silent */ }
}

/* ------------------------------------------------------------------ snap */

export const SPRING = 'cubic-bezier(.2,.9,.3,1.25)'

/** FLIP snap: call capture(id) just before a drop re-renders the item
    somewhere else; after the render its inner [data-snap] element springs
    from where it was let go to where it now lives (180ms). */
export function useSnap(stage: RefObject<HTMLElement | null>, reduced: boolean) {
  const pending = useRef(new Map<string, DOMRect>())
  const capture = (id: string) => {
    const el = stage.current?.querySelector<HTMLElement>(`[data-item="${id}"] [data-snap]`)
    if (el) pending.current.set(id, el.getBoundingClientRect())
  }
  useLayoutEffect(() => {
    if (!pending.current.size) return
    const list = [...pending.current]
    pending.current.clear()
    if (reduced) return
    for (const [id, a] of list) {
      const el = stage.current?.querySelector<HTMLElement>(`[data-item="${id}"] [data-snap]`)
      if (!el?.animate) continue
      const b = el.getBoundingClientRect()
      if (!b.width || !b.height) continue
      const dx = a.left + a.width / 2 - (b.left + b.width / 2)
      const dy = a.top + a.height / 2 - (b.top + b.height / 2)
      const s = a.width / b.width
      if (Math.abs(dx) < 1 && Math.abs(dy) < 1 && Math.abs(s - 1) < 0.02) continue
      el.animate(
        [{ transform: `translate(${dx}px, ${dy}px) scale(${s})` }, { transform: 'translate(0,0) scale(1)' }],
        { duration: 180, easing: SPRING },
      )
    }
  })
  return capture
}

/* ------------------------------------------------------------------ paper */

/** The warmed paper of a step's camp: label backings sit on it, so the
    scene's lines never run through text. */
export const campPaper = (id: StepId) => paperFor(campIndex(id))
