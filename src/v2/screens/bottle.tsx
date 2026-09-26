'use client'
/* Standout 2: the water bottle (plan 3.3, Haresh's idea).
   "If AI saved a new Analyst one day a week, where should those 8 hours go?"
   Tap a jug: it flies up, tips and pours one hour; that hour rises in the jug's
   colour, so the bottle shows the mix. A minus on each jug takes an hour back.
   It cannot overflow; at 8 hours the cap turns on and Next lights. */
import { useCallback, useEffect, useRef, useState } from 'react'
import V2Frame from '../V2Frame'
import BottleArt, { BOTTLE_CSS, SPOUT, VB_W, type Layer, type Pour } from '../hero/bottle/BottleArt'
import JugArt, { SPOUT_ORIGIN } from '../hero/bottle/JugArt'
import { JUG, JUGS, TOTAL_HOURS, type Jug, type JugId } from '../hero/bottle/jugs'
import { playCap, playPour } from '../hero/bottle/sound'

type Ghost = { id: number; jug: JugId; left: number; top: number; size: number; tx: number; ty: number; k: number }

const POUR_MS = 1150

export default function Bottle() {
  const [layers, setLayers] = useState<Layer[]>([])
  const [pour, setPour] = useState<Pour | null>(null)
  const [kind, setKind] = useState<'pour' | 'back'>('pour')
  const [ghosts, setGhosts] = useState<Ghost[]>([])
  const [sound, setSound] = useState(false)
  const shakeRef = useRef<HTMLDivElement>(null) // the bottle shakes if someone taps a jug when it is full
  const [touched, setTouched] = useState(false)
  const seq = useRef(0)
  const bottleRef = useRef<SVGSVGElement>(null)
  const jugRefs = useRef<Partial<Record<JugId, HTMLSpanElement | null>>>({})

  const level = layers.length
  const left = TOTAL_HOURS - level
  const full = left === 0
  const count = (id: JugId) => layers.reduce((n, l) => n + (l.jug === id ? 1 : 0), 0)

  const pourInto = useCallback((id: JugId) => {
    setTouched(true)
    if (layers.length >= TOTAL_HOURS) {
      shakeRef.current?.animate(
        [0, -4, 4, -3, 3, 0].map((x) => ({ transform: `translateX(${x}px) rotate(${x * 0.4}deg)` })),
        { duration: 360, easing: 'ease-out' })
      return
    }
    const n = ++seq.current
    const from = layers.length
    setKind('pour')
    setLayers([...layers, { id: n, jug: id, fresh: true }])
    setPour({ id: n, jug: id, from })
    if (sound) {
      playPour(from)
      if (from + 1 === TOTAL_HOURS) playCap()
    }
    // the jug flies from the tray to the bottle's mouth, tips about its spout, and goes home
    const svg = bottleRef.current, src = jugRefs.current[id]
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!svg || !src || reduce) return
    const b = svg.getBoundingClientRect(), s = src.getBoundingClientRect()
    const scale = b.width / VB_W
    const size = Math.round(64 * scale)
    const px = b.left + SPOUT.x * scale, py = b.top + SPOUT.y * scale
    const ox = 0.9375 * size, oy = 0.133 * size
    const left = px - ox, top = py - oy
    const k = s.width / size
    // place the ghost's centre on the tray jug's centre at the start
    const cx = left + size / 2, cy = top + size / 2
    const tx = s.left + s.width / 2 - px - k * (cx - px)
    const ty = s.top + s.height / 2 - py - k * (cy - py)
    setGhosts((g) => [...g.filter((x) => x.jug !== id), { id: n, jug: id, left, top, size, tx, ty, k }])
  }, [layers, sound])

  const takeBack = (id: JugId) => {
    const i = layers.map((l) => l.jug).lastIndexOf(id)
    if (i < 0) return
    setKind('back')
    setPour(null)
    setLayers(layers.filter((_, k) => k !== i))
  }

  const reset = () => { setLayers([]); setPour(null); setGhosts([]); setTouched(false) }
  const missing = full ? undefined : left === TOTAL_HOURS ? `Pour ${TOTAL_HOURS} hours` : `Pour ${left} more`

  const tray = (
    <div className="-mx-2 grid grid-cols-5 gap-1.5 sm:mx-0 lg:gap-3" data-jugs>
      {JUGS.map((j, i) => (
        <JugTile key={j.id} jug={j} n={count(j.id)} full={full} hint={!touched && !level ? i : -1}
          lifted={ghosts.some((g) => g.jug === j.id)}
          iconRef={(el) => { jugRefs.current[j.id] = el }}
          onPour={() => pourInto(j.id)} onBack={() => takeBack(j.id)} />
      ))}
    </div>
  )

  return (
    <V2Frame block="analyst-time" step={13} total={17}
      question="If AI saved a new Analyst one day a week, where should those 8 hours go?"
      instruction="Tap a jug to pour 1 hour."
      missing={missing} onNext={reset} tray={tray}>
      <style>{BOTTLE_CSS}</style>
      <div className="flex flex-1 items-center justify-center gap-5 lg:gap-10 lg:pt-4" data-bottle>
        <div className="hidden w-[190px] shrink-0 lg:block" aria-hidden />
        <div ref={shakeRef}>
          <BottleArt ref={bottleRef} layers={layers} pour={pour} kind={kind}
            className="block h-[160px] w-auto shrink-0 lg:h-[240px]" />
        </div>
        <div className="flex w-[124px] shrink-0 flex-col justify-end self-stretch pb-3 lg:w-[190px] lg:pb-6">
          <div aria-live="polite" data-readout>
            {full ? (
              <div className="bt-done">
                <p className="font-[family-name:var(--font-text)] text-[30px] font-semibold leading-[34px] text-forest lg:text-[36px] lg:leading-[40px]">Full</p>
                <p className="mt-1 font-[family-name:var(--font-ui)] text-[14px] leading-[19px] text-muted lg:text-[15px]">All 8 hours poured</p>
                <p className="mt-1 font-[family-name:var(--font-ui)] text-[13px] leading-[18px] text-muted">Use <MinusIcon className="inline h-[15px] w-[15px] -translate-y-px align-middle" /><span className="sr-only">minus</span> on a jug to move an hour.</p>
              </div>
            ) : (
              <>
                <p className="font-[family-name:var(--font-text)] text-[44px] font-semibold leading-[44px] text-ink tabular-nums lg:text-[56px] lg:leading-[56px]">
                  <span key={left} className="bt-pop">{left}</span>
                </p>
                <p className="mt-1 font-[family-name:var(--font-ui)] text-[14px] leading-[19px] text-muted lg:text-[15px]">of 8 hours left</p>
              </>
            )}
          </div>
          <button type="button" onClick={() => setSound((v) => !v)} aria-pressed={sound}
            className="mt-1 -ml-1 flex h-11 items-center gap-1.5 self-start px-1 font-[family-name:var(--font-ui)] text-[13px] text-muted">
            <SpeakerIcon on={sound} /> Sound {sound ? 'on' : 'off'}
          </button>
        </div>
      </div>
      {/* the jug in flight, above everything, never clickable */}
      <div className="pointer-events-none fixed inset-0 z-40" aria-hidden>
        {ghosts.map((g) => (
          <GhostJug key={g.id} g={g} onDone={() => setGhosts((all) => all.filter((x) => x.id !== g.id))} />
        ))}
      </div>
    </V2Frame>
  )
}

function JugTile({ jug, n, full, hint, lifted, iconRef, onPour, onBack }: {
  jug: Jug; n: number; full: boolean; hint: number; lifted: boolean
  iconRef: (el: HTMLSpanElement | null) => void
  onPour: () => void; onBack: () => void
}) {
  return (
    <div className="flex flex-col overflow-hidden rounded-[4px] border bg-white transition-colors"
      style={{ borderColor: n ? jug.color : '#DDD9D2', boxShadow: n ? `inset 0 3px 0 ${jug.color}` : 'inset 0 3px 0 #DDD9D2' }} data-jug={jug.id}>
      <button type="button" onClick={onPour} aria-disabled={full}
        aria-label={full ? `${jug.label}: ${n} hours. The bottle is full.` : `Pour 1 hour into ${jug.label}. ${n} so far.`}
        className={`group flex flex-1 flex-col items-center px-0.5 pt-2 pb-1 transition-transform active:translate-y-[1px] ${full ? 'cursor-default' : ''}`}>
        <span ref={iconRef} className={`block h-10 w-10 transition-[opacity,transform] duration-200 lg:h-12 lg:w-12 ${full ? '' : 'group-hover:-translate-y-0.5 group-hover:-rotate-3'}`}
          style={{ opacity: lifted ? 0.18 : 1 }}>
          <span className={`block h-full w-full ${hint >= 0 ? 'bt-hint' : ''}`} style={hint >= 0 ? { animationDelay: `${700 + hint * 110}ms` } : undefined}>
            <JugArt jug={jug} className="h-full w-full" />
          </span>
        </span>
        <span className="mt-1 flex min-h-[28px] items-start justify-center text-center font-[family-name:var(--font-ui)] text-[11.5px] font-semibold leading-[14px] tracking-[-0.01em] text-ink lg:min-h-[34px] lg:text-[14px] lg:leading-[17px]">
          {jug.label}
        </span>
      </button>
      <div className="flex h-9 items-center justify-between border-t border-[#EAE7E1] lg:h-10">
        <span className="whitespace-nowrap pl-1.5 font-[family-name:var(--font-ui)] text-[14px] font-semibold tabular-nums lg:pl-3 lg:text-[16px]"
          style={{ color: n ? jug.dark : '#6B6761' }}>
          <span key={n} className={n ? 'bt-pop' : undefined}>{n}</span> h
        </span>
        <button type="button" onClick={onBack} disabled={!n} aria-label={`Take 1 hour back from ${jug.label}`}
          className="flex h-full w-8 shrink-0 items-center justify-center text-ink transition-opacity disabled:opacity-0 lg:w-11">
          <MinusIcon className="h-[22px] w-[22px]" />
        </button>
      </div>
    </div>
  )
}

function GhostJug({ g, onDone }: { g: Ghost; onDone: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const done = useRef(onDone)
  useEffect(() => { done.current = onDone })
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const T = (x: number, y: number, s: number, r: number) => `translate(${x}px, ${y}px) scale(${s}) rotate(${r}deg)`
    const a = el.animate([
      { offset: 0, transform: T(g.tx, g.ty, g.k, 0), opacity: 1, easing: 'cubic-bezier(.35,0,.2,1)' },
      { offset: 0.34, transform: T(0, 0, 1, -6), opacity: 1, easing: 'cubic-bezier(.45,0,.25,1)' },
      { offset: 0.48, transform: T(0, 0, 1, 66), opacity: 1 },
      { offset: 0.79, transform: T(0, 0, 1, 70), opacity: 1, easing: 'cubic-bezier(.45,0,.3,1)' },
      { offset: 0.9, transform: T(0, -4, 1, 0), opacity: 1 },
      { offset: 1, transform: T(0, -10, 1, 0), opacity: 0 },
    ], { duration: POUR_MS, fill: 'both' })
    a.onfinish = () => done.current()
    return () => a.cancel()
  }, [g])
  return (
    <div ref={ref} className="absolute" style={{ left: g.left, top: g.top, width: g.size, height: g.size, transformOrigin: SPOUT_ORIGIN }}>
      <JugArt jug={JUG[g.jug]} className="h-full w-full drop-shadow-[0_6px_8px_rgba(13,12,11,0.18)]" />
    </div>
  )
}

function MinusIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 22 22" className={className} aria-hidden>
      <circle cx="11" cy="11" r="10" fill="none" stroke="#8C857A" strokeWidth="1" />
      <path d="M6.5 11 H15.5" stroke="#0D0C0B" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function SpeakerIcon({ on }: { on: boolean }) {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" aria-hidden>
      <path d="M3 8 H6 L10 4.5 V15.5 L6 12 H3 Z" fill="currentColor" />
      {on ? (
        <path d="M13 7 C14.5 8.5 14.5 11.5 13 13 M15.2 5 C17.8 7.6 17.8 12.4 15.2 15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      ) : (
        <path d="M13 8 L17 12 M17 8 L13 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      )}
    </svg>
  )
}
