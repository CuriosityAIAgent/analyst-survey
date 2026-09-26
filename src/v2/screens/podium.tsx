'use client'
/* Standout 1: the podium (question 1.2, opens the game).
   Ten plain tiles, label only. Tap one and it lifts onto the next free step
   (1st, then 2nd; a 3rd step on a laptop) and lands with a soft thunk. Tap a
   placed tile, on the podium or in the list, to take it back. When the steps
   are full, the tile you tapped shakes and a short line says how to swap. */
import { useLayoutEffect, useRef, useState } from 'react'
import V2Frame from '../V2Frame'
import { useLaptop } from '../hero/podium/useLaptop'
import { thunk, unlockAudio } from '../hero/podium/sound'

const SOURCES = [
  'Morning meeting',
  'Meetings with a senior Advisor',
  'Watching a strong Advisor',
  'An Advisor explaining their thinking',
  'Harder work, with feedback',
  'Forming my own view first',
  'Time on operations',
  'A setback',
  'Classroom or role play',
  'Learning on my own',
]
const RANK = ['1st', '2nd', '3rd']
const WORD = ['two', 'three']

type Fly = { kind: 'up' | 'down'; slot: number; tile: number; from: DOMRect }

export default function Podium() {
  const laptop = useLaptop()
  const n = laptop ? 3 : 2
  const [places, setPlaces] = useState<(number | null)[]>([null, null, null])
  const [fly, setFly] = useState<Fly | null>(null)
  const [refused, setRefused] = useState<number | null>(null)
  const slotRefs = useRef<(HTMLDivElement | null)[]>([])
  const stepRefs = useRef<(HTMLDivElement | null)[]>([])
  const tileRefs = useRef<(HTMLButtonElement | null)[]>([])
  const refuseTimer = useRef<number | undefined>(undefined)

  const active = places.slice(0, n)
  const placed = active.filter((x) => x !== null).length
  const slotOf = (tile: number) => active.indexOf(tile)

  // FLIP: the moved element starts where it was and travels to where it is now.
  useLayoutEffect(() => {
    if (!fly) return
    const el = fly.kind === 'up' ? slotRefs.current[fly.slot] : tileRefs.current[fly.tile]
    if (!el) return
    const to = el.getBoundingClientRect()
    const dx = fly.from.left + fly.from.width / 2 - (to.left + to.width / 2)
    const dy = fly.from.top + fly.from.height / 2 - (to.top + to.height / 2)
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      if (fly.kind === 'up') thunk()
      return
    }
    const a = el.animate(
      fly.kind === 'up'
        ? [
            { transform: `translate(${dx}px, ${dy}px) scale(1)`, boxShadow: '0 2px 4px rgba(13,12,11,.10)' },
            { transform: `translate(${dx * 0.35}px, ${dy * 0.5 - 36}px) scale(1.06)`, boxShadow: '0 18px 28px rgba(13,12,11,.18)', offset: 0.55 },
            { transform: 'translate(0, -6px) scale(1.02)', boxShadow: '0 10px 18px rgba(13,12,11,.14)', offset: 0.82 },
            { transform: 'translate(0, 0) scale(1)', boxShadow: '0 2px 4px rgba(13,12,11,.10)' },
          ]
        : [
            { transform: `translate(${dx}px, ${dy}px)`, opacity: 0.6 },
            { transform: 'translate(0, 0)', opacity: 1 },
          ],
      { duration: fly.kind === 'up' ? 560 : 320, easing: 'cubic-bezier(.3,.7,.2,1)' },
    )
    if (fly.kind === 'up') {
      a.onfinish = () => {
        thunk()
        stepRefs.current[fly.slot]?.animate(
          [{ transform: 'translateY(0)' }, { transform: 'translateY(3px)' }, { transform: 'translateY(0)' }],
          { duration: 220, easing: 'ease-out' },
        )
      }
    }
    return () => a.cancel()
  }, [fly])

  const tap = (tile: number) => {
    unlockAudio()
    const at = slotOf(tile)
    if (at >= 0) {
      // take it back: from its step to its place in the list
      const from = slotRefs.current[at]?.getBoundingClientRect()
      setPlaces((p) => p.map((x, k) => (k === at ? null : x)))
      if (from) setFly({ kind: 'down', slot: at, tile, from })
      return
    }
    const free = active.indexOf(null)
    if (free < 0) {
      setRefused(tile)
      tileRefs.current[tile]?.animate(
        [{ transform: 'translateX(0)' }, { transform: 'translateX(-3px)' }, { transform: 'translateX(3px)' }, { transform: 'translateX(-2px)' }, { transform: 'translateX(0)' }],
        { duration: 260 },
      )
      window.clearTimeout(refuseTimer.current)
      refuseTimer.current = window.setTimeout(() => setRefused(null), 2200)
      return
    }
    const from = tileRefs.current[tile]?.getBoundingClientRect()
    setRefused(null)
    setPlaces((p) => p.map((x, k) => (k === free ? tile : x)))
    if (from) setFly({ kind: 'up', slot: free, tile, from })
  }

  // Classic podium order: 2nd, 1st, 3rd (phone: 2nd, 1st).
  const order = laptop ? [1, 0, 2] : [1, 0]
  const nextFree = active.indexOf(null)
  const stepH = laptop ? [74, 52, 38] : [50, 34, 34]

  return (
    <V2Frame
      block="look-back" step={1} total={laptop ? 25 : 17}
      question="What helped you learn most at J.P. Morgan?"
      instruction={`Tap your top ${WORD[n - 2]}.`}
      missing={placed === 0 ? `Pick ${n}` : placed < n ? `Pick ${n - placed} more` : undefined}
      onNext={() => { setPlaces([null, null, null]); setFly(null) }}
      tray={
        <div className="relative">
          <p aria-live="polite"
            className={`pointer-events-none absolute -top-[18px] left-0 right-0 z-10 text-center font-[family-name:var(--font-ui)] text-[13px] leading-[18px] transition-opacity duration-200 ${refused !== null ? 'opacity-100' : 'opacity-0'}`}>
            <span className="rounded-[3px] bg-paper px-2 text-bronze">{refused !== null ? 'Full. Tap one on the podium to swap.' : ''}</span>
          </p>
          <div className="grid grid-cols-2 gap-1.5 lg:gap-2">
            {SOURCES.map((label, i) => {
              const at = slotOf(i)
              const on = at >= 0
              return (
                <button key={label} type="button" ref={(el) => { tileRefs.current[i] = el }}
                  onClick={() => tap(i)} aria-pressed={on}
                  aria-label={on ? `${label}, placed ${RANK[at]}. Tap to take back.` : label}
                  className={`group relative flex min-h-[44px] items-center rounded-[4px] border px-3 py-1.5 text-left font-[family-name:var(--font-ui)] text-[13.5px] leading-[17px] transition-[border-color,background-color,color,transform] duration-150 lg:min-h-[46px] lg:px-4 lg:text-[15px] ${
                    on
                      ? 'border-dashed border-rule-soft bg-transparent text-disabled-ink'
                      : 'border-rule bg-ground text-ink shadow-[0_1px_0_#DDD9D2] hover:-translate-y-0.5 hover:border-ink active:translate-y-0'
                  }`}>
                  <span className="pr-9">{label}</span>
                  {on && (
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 rounded-[3px] bg-forest px-1.5 py-0.5 text-[12px] font-semibold text-white">
                      {RANK[at]}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      }
    >
      {/* the podium */}
      <div className="flex flex-1 flex-col justify-end pb-1 lg:pb-3">
        <div className="mx-auto flex w-full max-w-[330px] items-end justify-center lg:max-w-[560px]">
          {order.map((k) => {
            const tile = active[k]
            const isNext = k === nextFree
            return (
              <div key={k} className="flex min-w-0 flex-1 flex-col items-stretch">
                {/* the place a tile lands */}
                <div className="px-1.5 pb-1.5 lg:px-2">
                  {tile !== null && tile !== undefined ? (
                    <div ref={(el) => { slotRefs.current[k] = el }}>
                      <button type="button" onClick={() => tap(tile)} aria-label={`${SOURCES[tile]}, ${RANK[k]}. Tap to take back.`}
                        className="flex h-[50px] w-full items-center justify-center rounded-[4px] border border-ink bg-ground px-2 text-center font-[family-name:var(--font-ui)] text-[13px] font-semibold leading-[16px] text-ink shadow-[0_2px_4px_rgba(13,12,11,.10)] lg:h-[56px] lg:text-[14px] lg:leading-[18px]">
                        {SOURCES[tile]}
                      </button>
                    </div>
                  ) : (
                    <div aria-hidden
                      className={`flex h-[50px] w-full items-center justify-center rounded-[4px] border border-dashed font-[family-name:var(--font-ui)] text-[12px] transition-colors lg:h-[56px] ${
                        isNext ? 'v2p-glow border-forest text-forest' : 'border-rule-soft text-transparent'
                      }`}>
                      {isNext ? `${RANK[k]} goes here` : ''}
                    </div>
                  )}
                </div>
                {/* the step: a clean stone block with its rank */}
                <div ref={(el) => { stepRefs.current[k] = el }}
                  className="relative flex items-start justify-center"
                  style={{ height: stepH[k] }}>
                  <div className="absolute inset-0 rounded-t-[3px]"
                    style={{
                      background: 'linear-gradient(180deg, #F3F0EA 0%, #E6E1D7 100%)',
                      boxShadow: 'inset 0 1px 0 #FFFFFF, inset 1px 0 0 #EDE9E2, inset -1px 0 0 #D6D0C4, 0 1px 0 #CFC8BB',
                      borderLeft: k === 0 ? '1px solid #DDD9D2' : undefined,
                      borderRight: k === 0 ? '1px solid #DDD9D2' : undefined,
                    }} />
                  <div className="absolute inset-x-0 top-0 h-[5px] rounded-t-[3px]" style={{ background: 'linear-gradient(180deg,#FFFFFF,#F1EDE6)' }} />
                  <span className="relative mt-2 flex flex-col items-center gap-1 font-[family-name:var(--font-text)] text-[18px] font-semibold leading-none text-ink lg:mt-3 lg:text-[22px]">
                    {RANK[k]}
                    {k === 0 && <span aria-hidden className="h-[2px] w-5 bg-[#B8862B]" />}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
        <div className="mx-auto h-[6px] w-full max-w-[350px] rounded-[2px] lg:max-w-[600px]" style={{ background: 'linear-gradient(180deg,#D8D2C6,#CBC4B6)' }} />
      </div>
      <style>{`
        @keyframes v2p-glow { 0%,100% { background-color: rgba(31,75,58,0); } 50% { background-color: rgba(31,75,58,.06); } }
        .v2p-glow { animation: v2p-glow 1.8s ease-in-out infinite; }
      `}</style>
    </V2Frame>
  )
}
