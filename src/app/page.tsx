'use client'
import { useCallback, useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { useStore } from '@/store/useStore'
import { FooterBar } from '@/components/ui'
import { LEVELS, TURN_INDEX } from '@/content/content'
import { tForLevel } from '@/lib/tokens'
import { seed } from '@/lib/demo'
import { safeLevel } from '@/store/validate'

import L0, { l0Ready } from '@/levels/L0Basecamp'
import L1 from '@/levels/L1Fuel'
import L2, { l2Ready } from '@/levels/L2Advisor'
import L3 from '@/levels/L3Handover'
import L4, { l4Ready } from '@/levels/L4Capacity'
import L5, { l5Ready } from '@/levels/L5Trials'
import L6, { l6Ready } from '@/levels/L6Route'
import L7, { l7Ready } from '@/levels/L7Mark'
import L8 from '@/levels/L8Summit'

const Scene = dynamic(() => import('@/scene/Scene'), { ssr: false })

export default function Page() {
  const { level, answers, next, back } = useStore()
  const [mounted, setMounted] = useState(false)
  const [fuelDone, setFuelDone] = useState(false)
  const [beat, setBeat] = useState(0)
  useEffect(() => {
    const q = new URLSearchParams(window.location.search)
    // Demo mode seeds a full response and skips every gate, so it must not be
    // reachable on a public deployment. Off unless explicitly enabled at build time.
    const demoAllowed =
      process.env.NODE_ENV !== 'production' || process.env.NEXT_PUBLIC_ALLOW_DEMO === '1'
    const demo = demoAllowed && q.get('demo') === '1'
    if (demo) useStore.setState({ answers: seed() })
    if (demoAllowed) {
      const lvl = safeLevel(q.get('level'), LEVELS.length)
      if (lvl !== null) useStore.setState({ level: lvl })
    }
    if (demo) { setFuelDone(true); setBeat(3) }
    setMounted(true)
  }, [])

  const onBeat = useCallback((b: number) => setBeat(b), [])
  const onFuel = useCallback((d: boolean) => setFuelDone(d), [])

  if (!mounted) return <main className="min-h-dvh" />

  const t = tForLevel(level, LEVELS.length)
  // The turn: the successor appears on leaving the Handover, never during its
  // reckoning — a light change there would read as the instrument approving.
  const successor = level > TURN_INDEX ? 1 : 0

  const ready = (() => {
    switch (level) {
      case 0: return l0Ready(answers.segment)
      case 1: return fuelDone
      case 2: return l2Ready(answers.advisor)
      case 3: return beat === 3
      case 4: return l4Ready(answers.capacity)
      case 5: return l5Ready(answers.trials)
      case 6: return l6Ready(answers.route.years)
      case 7: return l7Ready(answers.mark, answers.advisor)
      default: return false
    }
  })()

  const label = level === 0 ? 'Start the climb' : level === 7 ? 'To the top' : 'Next'

  return (
    <main className="relative min-h-dvh">
      <Scene t={t} successor={successor} />
      <div className="relative z-10 flex min-h-dvh flex-col">
        <div className="mx-auto w-full max-w-[720px] px-4 pt-5">
          <div className="flex items-center gap-1.5" aria-hidden>
            {LEVELS.map((_, i) => (
              <span key={i} className="h-1.5 flex-1 rounded-full transition-colors duration-500"
                style={{ background: i <= level ? 'var(--color-gold)' : 'rgba(185,198,224,0.18)' }} />
            ))}
          </div>
          <div className="mt-2 text-[12px] uppercase tracking-widest text-ink2/60">
            {LEVELS[level].title}
          </div>
        </div>

        <div className="flex-1 px-4 pt-5 pb-2">
          {level === 0 && <L0 />}
          {level === 1 && <L1 onDone={onFuel} />}
          {level === 2 && <L2 />}
          {level === 3 && <L3 onBeat={onBeat} />}
          {level === 4 && <L4 />}
          {level === 5 && <L5 />}
          {level === 6 && <L6 />}
          {level === 7 && <L7 />}
          {level === 8 && <L8 />}
        </div>

        {level < 8 && (
          <FooterBar
            label={label} canProceed={ready} onNext={next} onBack={back}
            showBack={level > 0}
            hint={ready ? '' : hintFor(level, beat)}
          />
        )}
      </div>
    </main>
  )
}

function hintFor(level: number, beat: number) {
  switch (level) {
    case 0: return 'Business, tenure and AI use first'
    case 1: return 'Finish the nine rounds'
    case 2: return 'Pick three traits'
    case 3: return beat < 3 ? 'Work through the thirteen' : ''
    case 4: return 'Spend all eight, then give three back'
    case 5: return 'Answer both, and the follow-ups'
    case 6: return 'Place at least four bricks'
    case 7: return 'A score and two changes'
    default: return ''
  }
}
