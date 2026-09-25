'use client'
/* The Ascent (game): the orchestrator.

   ─────────────────────────────────────────────────────────────────────────
   THE CONTRACT every screen (screens/Sxx.tsx) and sheet (sheets/Fx.tsx) codes
   against. One interface, StepProps (types.ts):

     id        'S02' | 'F3a' ...           which step this is
     beat      'A' | 'B'                   current beat ('A' if single-beat)
     variant   'A' | 'B' | undefined       F5's wording only
     answers   Partial<Answers>            everything so far, keyed by spec
                                           store name, validated on reload
     set(k,v)  typed setter                store one answer; never navigates
     setMany   (patch) => void             several at once
     unset(k)  remove an answer
     log(type, data?)                      typed event log (step + time added)
     next()    this beat/sheet is DONE: the orchestrator picks the next beat,
               a follow-up sheet (rules.ts), or the next screen with its
               camp transition. Bound to this step: a stale call is ignored.
     back()    the top bar's Back. Never loses an answer.
     reduced   prefers-reduced-motion
     seed      per-respondent seed (use useOrder / useSeeded from store.ts)
     covered   true while a sheet is open over this screen (it is inert)

   A screen renders <Frame id beat valid onContinue={p.next} ...> and its
   mechanic inside. A sheet renders <Sheet id valid onDone={p.next} ...>.
   Multi-beat screens (S01, S04, S09, S10) are ONE component that stays
   mounted across beats; `beat` changes under it.

   Follow-ups (design "Adaptive map"): evaluated by the store when a screen's
   last beat calls next(): F1 after S02, F2 after S04 Beat B, F3 after S05,
   F4 after S07 (all four calls), F5 after S08 (variant A/B). A sheet's next()
   goes on to the screen after its parent.

   Camp transitions: when the camp changes the camera pans up the ridge
   (600ms ease-out-expo; old camp slides down, new comes from above). Within a
   camp, a short crossfade. Reduced motion: crossfades only.

   Dev only (NODE_ENV !== 'production'): ?screen=S05&beat=A&sheet=F3a jumps
   straight there, with answers for every earlier screen filled from demo.ts
   (&fill=0 to leave them empty, &variant=B for F5, &reset=1 to start clean).
   Link token: ?business=uspb&cohort=2021 (People Analytics issues both).
   ───────────────────────────────────────────────────────────────────────── */
import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useGame, readToken, stepKey, beatsFor } from './store'
import { campIndex, isBeatId, isScreenId, isSheetId, step } from './content'
import { followupFor } from './rules'
import { fillBefore } from './demo'
import { GameContext, type GameCtx } from './context'
import { SCREENS } from './screens'
import { SHEETS } from './sheets'
import type { BeatId, ScreenId, SheetId, StepProps, Variant } from './types'

type Kind = 'up' | 'down' | 'fade'

const PAN = { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }
const FADE = { duration: 0.24, ease: 'easeOut' as const }
const variants = {
  enter: (k: Kind) => (k === 'up' ? { y: '-100%', opacity: 1 } : k === 'down' ? { y: '100%', opacity: 1 } : { y: 0, opacity: 0 }),
  center: (k: Kind) => ({ y: 0, opacity: 1, transition: k === 'fade' ? FADE : PAN }),
  exit: (k: Kind) => (k === 'up'
    ? { y: '100%', opacity: 1, transition: PAN }
    : k === 'down' ? { y: '-100%', opacity: 1, transition: PAN } : { opacity: 0, transition: FADE }),
}

export default function Game() {
  const s = useGame()
  const reduced = !!useReducedMotion()
  const [mounted, setMounted] = useState(false)
  const [busy, setBusy] = useState(false)

  /* ---- once: token, dev jump, page lock */
  useEffect(() => {
    const g = useGame.getState()
    g.setToken(readToken(window.location.search))
    if (process.env.NODE_ENV !== 'production') devJump(window.location.search)
    const html = document.documentElement, body = document.body
    const prev = { skin: html.dataset.skin, ho: html.style.overflow, bo: body.style.overflow, bg: body.style.background }
    html.dataset.skin = 'game'
    html.style.overflow = 'hidden'
    body.style.overflow = 'hidden'
    body.style.background = '#E9E6E0'
    setMounted(true)
    return () => {
      if (prev.skin === undefined) delete html.dataset.skin
      else html.dataset.skin = prev.skin
      html.style.overflow = prev.ho; body.style.overflow = prev.bo; body.style.background = prev.bg
    }
  }, [])

  const key = stepKey(s)

  /* ---- a short busy window after each step change (no double-tap skips),
          and focus to the new prompt so screen readers announce it */
  useEffect(() => {
    if (!mounted) return
    setBusy(true)
    const t = window.setTimeout(() => setBusy(false), 350)
    const f = requestAnimationFrame(() => {
      document.querySelector<HTMLElement>('[data-active-step] [data-prompt]')?.focus({ preventScroll: true })
    })
    return () => { clearTimeout(t); cancelAnimationFrame(f) }
  }, [key, mounted])

  /* ---- camera: pan between camps, crossfade within one */
  const prevScreen = useRef<ScreenId>(s.screen)
  const lastKind = useRef<Kind>('fade')
  let kind: Kind = lastKind.current
  if (prevScreen.current !== s.screen) {
    const a = campIndex(prevScreen.current), b = campIndex(s.screen)
    kind = reduced || a === b ? 'fade' : b > a ? 'up' : 'down'
  }
  useEffect(() => { lastKind.current = kind; prevScreen.current = s.screen })

  const ctx: GameCtx = useMemo(() => ({
    back: () => useGame.getState().back(),
    canBack: !s.finished && !(s.screen === 'S01' && s.beat === 'A' && !s.sheet),
    sound: s.sound,
    toggleSound: () => useGame.getState().toggleSound(),
    reduced,
    visit: s.visit,
    busy,
  }), [s.finished, s.screen, s.beat, s.sheet, s.sound, s.visit, reduced, busy])

  if (!mounted) return <div className="h-dvh bg-paper" />

  const props = (id: ScreenId | SheetId, beat: BeatId, variant: Variant | undefined, bound: string, covered: boolean): StepProps => ({
    id, beat, variant,
    answers: s.answers,
    set: s.set, setMany: s.setMany, unset: s.unset, log: s.log,
    next: () => useGame.getState().next(bound),
    back: () => useGame.getState().back(),
    reduced, seed: s.seed, covered,
  })

  const Screen = SCREENS[s.screen]
  const screenKey = stepKey({ screen: s.screen, beat: s.beat, sheet: null })
  const SheetC = s.sheet ? SHEETS[s.sheet.id] : null

  return (
    <GameContext.Provider value={ctx}>
      <div className="fixed inset-0 flex justify-center" style={{ background: '#E9E6E0' }}>
        <div
          className="relative h-dvh w-full max-w-[480px] overflow-hidden bg-paper"
          data-game
          data-step={key}
          data-screen={s.screen}
          data-beat={s.beat}
          data-sheet-open={s.sheet?.id ?? ''}
          data-finished={s.finished ? 'true' : 'false'}
        >
          <AnimatePresence initial={false} custom={kind}>
            <motion.div
              key={s.screen}
              className="absolute inset-0"
              custom={kind}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              inert={!!s.sheet}
              data-active-step={s.sheet ? undefined : ''}
            >
              <Screen {...props(s.screen, s.beat, undefined, screenKey, !!s.sheet)} />
            </motion.div>
          </AnimatePresence>
          <AnimatePresence>
            {s.sheet && SheetC && (
              <motion.div key={s.sheet.id} className="absolute inset-0 z-50" data-active-step=""
                initial={{ opacity: 1 }} animate={{ opacity: 1 }} exit={{ opacity: 1, transition: { duration: 0.28 } }}>
                <SheetC {...props(s.sheet.id, 'A', s.sheet.variant, s.sheet.id, false)} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </GameContext.Provider>
  )
}

/* ---------------------------------------------------------------- dev jump */

function devJump(search: string) {
  const q = new URLSearchParams(search)
  const g = useGame.getState()
  if (q.get('reset') === '1') g.reset()
  let screen = q.get('screen')
  const sheetQ = q.get('sheet')
  const sheet: SheetId | null = isSheetId(sheetQ) ? sheetQ : null
  if (sheet && !isScreenId(screen)) screen = step(sheet).parent ?? null
  if (!isScreenId(screen)) return
  const variant: Variant | undefined = q.get('variant') === 'B' ? 'B' : q.get('variant') === 'A' ? 'A' : undefined
  if (q.get('fill') !== '0') {
    const bq0 = q.get('beat')
    g.setMany(fillBefore(screen, sheet, variant, isBeatId(bq0) ? bq0 : undefined))
  }
  if (!useGame.getState().started) useGame.setState({ started: true })
  const a = useGame.getState().answers
  const beats = beatsFor(screen, a)
  const bq = q.get('beat')
  let beat: BeatId = isBeatId(bq) ? bq : beats[0]
  // a sheet rises over its parent's last beat
  if (sheet) beat = beats[beats.length - 1]
  let open = null as { id: SheetId; variant?: Variant } | null
  if (sheet && step(sheet).parent === screen) {
    const fu = followupFor(screen, a)
    open = fu && fu.sheet === sheet ? { id: sheet, variant: fu.variant } : { id: sheet, variant }
  }
  useGame.getState().jump(screen, beat, open)
}
