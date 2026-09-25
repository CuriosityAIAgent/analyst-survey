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

   Layout (layout.ts, design section 2): 'phone' is the 480px column above;
   'desk' and 'deskCompact' fill the window, and Frame/Sheet draw the desk
   panel and stage. The layout is committed between steps (or after a resize
   settles, never mid-drag), provided through LayoutContext, logged as a
   'layout' event (at begin and on each switch) and kept in the store for
   response().meta.channel. On desk a camp change pans the STAGE diagonally
   (Frame does it, from ctx.arrival) while the panel crossfades.

   History: while Back is possible, one extra browser history entry is kept,
   so the browser's Back (Alt+Left, a trackpad swipe) calls back() instead of
   leaving the game. At S01 Beat A the browser leaves normally.

   Dev only (NODE_ENV !== 'production'): ?screen=S05&beat=A&sheet=F3a jumps
   straight there, with answers for every earlier screen filled from demo.ts
   (&fill=0 to leave them empty, &variant=B for F5, &reset=1 to start clean).
   Link token: ?business=uspb&cohort=2021 (People Analytics issues both).
   ───────────────────────────────────────────────────────────────────────── */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useGame, readToken, stepKey, beatsFor, type Channel } from './store'
import { campIndex, isBeatId, isScreenId, isSheetId, step } from './content'
import { followupFor } from './rules'
import { fillBefore } from './demo'
import { GameContext, type GameCtx } from './context'
import { LayoutContext, useLayoutController, type LayoutInfo } from './layout'
import { useHotkeys } from './useHotkeys'
import ShortcutsOverlay from './ShortcutsOverlay'
import DeskStyles from './deskStyles'
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
  const [keysOpen, setKeysOpen] = useState(false)

  /* ---- once: token, dev jump, page lock */
  useEffect(() => {
    const g = useGame.getState()
    g.setToken(readToken(window.location.search))
    // ?preview=1: a review mode that moves on without answers and shows every follow-up
    g.setPreview(window.location.pathname.replace(/\/+$/, '') === '/preview' || new URLSearchParams(window.location.search).get('preview') === '1')
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

  /* ---- layout: committed between steps; logged; kept for response().meta */
  const logLayout = useCallback((i: LayoutInfo) => {
    const g = useGame.getState()
    const c = channelOf(i)
    g.setChannel(c)
    if (g.started) g.log('layout', { ...c })
  }, [])
  const L = useLayoutController(key, logLayout)
  const desk = L.desk
  useEffect(() => {
    // at begin() (and on a resumed session): the layout the answers start in
    if (!mounted || !s.started) return
    logLayout(L)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, s.started])

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
  // desk: the whole screen crossfades; Frame pans the stage itself
  const outerKind: Kind = desk ? 'fade' : kind

  const canBack = !s.finished && !(s.screen === 'S01' && s.beat === 'A' && !s.sheet)

  /* ---- browser Back = the game's Back (both channels) */
  const sentinel = useRef(false)
  const skipPop = useRef(0)
  useEffect(() => {
    if (!mounted) return
    if (canBack && !sentinel.current) {
      window.history.pushState({ ascent: 1 }, '')
      sentinel.current = true
    } else if (!canBack && sentinel.current) {
      // nothing to go back to in the game: drop our entry so Back leaves
      sentinel.current = false
      skipPop.current++
      window.history.back()
    }
  }, [canBack, mounted])
  useEffect(() => {
    const onPop = () => {
      if (skipPop.current > 0) { skipPop.current--; return }
      if (!sentinel.current) return
      sentinel.current = false
      const g = useGame.getState()
      g.back()
      // still somewhere Back can go: keep an entry for the next press
      const after = useGame.getState()
      const more = !after.finished && !(after.screen === 'S01' && after.beat === 'A' && !after.sheet)
      if (more) { window.history.pushState({ ascent: 1 }, ''); sentinel.current = true }
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  /* ---- frame-wide keys (desk): ? keys, M sound, Alt+Left back */
  useHotkeys({
    '?': () => setKeysOpen((o) => !o),
    m: () => useGame.getState().toggleSound(),
    'Alt+ArrowLeft': () => { if (!canBack) return false; useGame.getState().back() },
  }, { enabled: mounted && desk, ignoreBusy: true })

  const ctx: GameCtx = useMemo(() => ({
    back: () => useGame.getState().back(),
    canBack,
    sound: s.sound,
    toggleSound: () => useGame.getState().toggleSound(),
    reduced,
    visit: s.visit,
    busy,
    arrival: desk ? kind : 'fade',
    keysOpen,
    setKeysOpen,
  }), [canBack, s.sound, s.visit, reduced, busy, desk, kind, keysOpen])

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
     <LayoutContext.Provider value={L}>
      {desk && <DeskStyles />}
      <div className="fixed inset-0 flex justify-center" style={{ background: desk ? '#F8F7F4' : '#E9E6E0' }}>
        <div
          className={`relative h-dvh w-full overflow-hidden bg-paper ${desk ? '' : 'max-w-[480px]'}`}
          data-game
          data-layout={L.layout}
          data-step={key}
          data-screen={s.screen}
          data-beat={s.beat}
          data-sheet-open={s.sheet?.id ?? ''}
          data-finished={s.finished ? 'true' : 'false'}
        >
          <AnimatePresence initial={false} custom={outerKind}>
            <motion.div
              key={s.screen}
              className="absolute inset-0"
              custom={outerKind}
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
          {desk && <ShortcutsOverlay open={keysOpen} onClose={() => setKeysOpen(false)} />}
        </div>
      </div>
     </LayoutContext.Provider>
    </GameContext.Provider>
  )
}

/* ---------------------------------------------------------------- layout */

function channelOf(i: LayoutInfo): Channel {
  return {
    mode: i.layout,
    w: typeof window === 'undefined' ? i.w : window.innerWidth,
    h: typeof window === 'undefined' ? i.h : window.innerHeight,
    pointer: i.fine ? 'fine' : 'coarse',
    dpr: typeof window === 'undefined' ? 1 : Math.round((window.devicePixelRatio || 1) * 100) / 100,
  }
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
