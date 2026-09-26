'use client'
/* /v2: the new screens as a clickable preview. A thin bar at the top picks the
   screen; everything under it is the real screen, interactive, on phone or laptop. */
import { useEffect, useState } from 'react'
import { SCREENS } from '@/v2/screens'

export default function Page() {
  const [i, setI] = useState(0)
  useEffect(() => {
    const s = new URLSearchParams(window.location.search).get('s')
    const k = SCREENS.findIndex((x) => x.id === s)
    if (k >= 0) setI(k)
  }, [])
  const go = (k: number) => {
    const n = (k + SCREENS.length) % SCREENS.length
    setI(n)
    window.history.replaceState(null, '', `?s=${SCREENS[n].id}`)
  }
  const S = SCREENS[i]
  return (
    <div className="min-h-dvh bg-paper">
      <div className="sticky top-0 z-50 flex items-center gap-3 bg-ink px-4 py-2 text-[13px] text-white font-[family-name:var(--font-ui)]" data-mock-bar>
        <button type="button" onClick={() => go(i - 1)} className="h-9 px-2" aria-label="Previous mockup">‹</button>
        <select value={S.id} onChange={(e) => go(SCREENS.findIndex((x) => x.id === e.target.value))}
          className="min-w-0 flex-1 bg-ink text-white outline-none" aria-label="Choose a mockup">
          {SCREENS.map((s, k) => <option key={s.id} value={s.id}>{k + 1}. {s.title}</option>)}
        </select>
        <button type="button" onClick={() => go(i + 1)} className="h-9 px-2" aria-label="Next mockup">›</button>
        <span className="hidden max-w-[46ch] truncate text-white/70 lg:inline">{S.what}</span>
      </div>
      <S.Component key={S.id} />
    </div>
  )
}
