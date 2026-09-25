'use client'
/* Frame: the shell every screen renders inside. Two layouts, same props.

   PHONE (today's column, 390x660 budget; "The frame shared by every screen"):
   - Fills its parent (Game gives it 100dvh, at most 480px wide). No scroll.
   - A full-bleed scene layer: <Art id={scene}> on paper warmed camp by camp.
   - Top bar (44px): Back, five small tents, a sound toggle (off by default).
   - Header. With frame.plainAsk (spec): the plain question (ask.question,
     Source Serif 4 600, 24/30, or 21/26 when longer than 60 characters) and
     how to answer (ask.how); the spec prompt (the world line) shrinks to a
     small italic caption above them. A screen's `prompt` prop feeds that
     caption; a `helper` prop that says something new (S02's "Holding …")
     replaces the how line while it shows. Without plainAsk: prompt and
     helper, as before.
   - The stage: children fill it (flex-1, min-h-0, position relative).
   - Footer: the primary button appears only when `valid`; on S02, S04 Beat B
     and S06 the CampWalk strip replaces it (spec walk:true).

   DESK and DESK COMPACT (design section 3):
     +------------------------------------------------------------------+
     | THE ASCENT · A2A                               [?] Keys  [M] Sound| top bar 48 (44)
     +-------------------+----------------------------------------------+
     | QuestionPanel      |  caption (the spec prompt, italic)           |
     |  kicker, question, |  +----------------------------------------+  |
     |  how + keys,       |  | stage body: the screen's children      |  |
     |  status, why       |  +----------------------------------------+  |
     |  camp route        |  camp-walk trail (S02, S04 B, S06)           |
     |  [Back][Primary ↵] |                                              |
     +-------------------+----------------------------------------------+
   - Panel width clamp(380px, 30vw, 480px) (compact 340); stage: the rest,
     the camp scene full bleed on the camp paper.
   - The primary is always present (disabled-looking until valid, with
     `invalidReason` on hover). Enter presses it (useHotkeys), or walks.
   - Tab order: question, then the stage, then Back / primary.

   HOW A SCREEN GETS A DESK VIEW
     const layout = useLayout()                 // layout.ts
     <Frame id="S02" host={layout === 'phone' ? undefined : 'native'}
            status={rows} summary="5 of 8 slots filled" holding={…} …>
       {layout === 'phone' ? <PhoneBoard/> : <DeskCanvas w={936} h={580}><DeskBoard/></DeskCanvas>}
     </Frame>
   host="native": the children fill the stage body as they are. Without it
   (every screen today) the phone stage is hosted: 'scale' screens render in a
   390px-wide phone stage scaled to fit (transform; the lifted-item offset is
   corrected in DeskStyles), 'grow' screens (S04, S08, S10, S11: they fit
   themselves or measure the frame) get the full stage body unscaled, and
   'column' (S01) a centred 560px column of it, unscaled.
   Screens that measure closest('[data-frame]') get the stage region, which
   holds the scene, exactly as the phone frame does. */
import { Children, isValidElement, useLayoutEffect, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Art } from './art'
import { CAMPS, PLAIN_ASK, ask as askOf, askVars, campIndex, copy, paperFor, sceneFor, specBeats, step } from './content'
import type { BeatId, ScreenId, StepId } from './types'
import { useGameCtx } from './context'
import { useGame } from './store'
import { useLayoutInfo } from './layout'
import { gestureInProgress } from './layout'
import CampWalk, { type CampWalkHandle } from './CampWalk'
import QuestionPanel, { PanelActions } from './QuestionPanel'
import type { StatusRow } from './Checklist'
import CampRoute from './CampRoute'
import RouteAhead from './RouteAhead'
import KeyCap from './KeyCap'
import { useHotkeys } from './useHotkeys'
import { useFitScale } from './useFitScale'

export type { StatusRow } from './Checklist'

export type FrameProps = {
  /** The screen this frame belongs to: sets camp, scene, copy and walk. */
  id: StepId
  beat?: BeatId
  /** Override the spec prompt (e.g. S09 Beat B's {leadTrait}). With
      plainAsk this is the world line: the phone caption, the desk stage caption. */
  prompt?: ReactNode
  /** Override the helper. With plainAsk a helper that differs from the spec
      helper is a live line (S02's "Holding …"): it replaces the phone how line
      while it shows, and is the panel's Holding line on desk. */
  helper?: ReactNode
  /** Show the primary button / enable the camp walk. */
  valid: boolean
  /** Called by the primary button or at the top of the camp walk. */
  onContinue: () => void
  /** Default 'Continue'. S01 uses 'Start the climb', S05 'Start walking'. */
  continueLabel?: string
  /** The quiet (outline) style: an optional step's 'Leave it blank'. */
  continueQuiet?: boolean
  /** Camp walk instead of the button. Default: spec walk:true on the last beat. */
  walk?: boolean
  /** Replace the footer entirely (S03's own buttons). null = no footer. On
      desk a footer node takes the primary's place in the panel's action row. */
  footer?: ReactNode
  /** Small Archivo 12px line above the footer (S04 Beat B's 'Rather not say').
      Desk: the lower-left of the stage. */
  footnote?: ReactNode
  /** Scene art id; null for none. Default: the camp's scene. */
  scene?: string | null
  /** Children of the stage. */
  children?: ReactNode
  stageClassName?: string
  /** Desk: set the stage caption at the right of the band (S11: clear of
      the summit sun). No pencil route beside a right-set caption. */
  captionAlign?: 'left' | 'right'
  stageStyle?: CSSProperties

  /* ---- desk (ignored on phone) */
  /** Checklist rows: each target's plain name and have/need. */
  status?: StatusRow[]
  /** The checklist's summary line ('5 of 8 slots filled'). */
  summary?: ReactNode
  /** 'Holding: …' (the lifted, focused or hovered item). */
  holding?: ReactNode
  /** Why the primary is not ready yet ('Place 2 more'). */
  invalidReason?: string
  /** Replaces the spec keys line (ask.keys). */
  hotkeysHint?: ReactNode
  /** Replaces the how line (ask.how) on both channels while set; null hides
      it (desk: with its label and keys), e.g. S11 after the arrival. */
  how?: ReactNode | null
  /** Extra panel content under the why line (S11's "Their kit" card). */
  panelSlot?: ReactNode
  /** How the stage hosts the children. 'native' = a desk view (fills the
      stage body as-is). Default: the phone stage, scaled or grown (above). */
  host?: 'native' | 'scale' | 'grow' | 'column'
}

/** Until a screen has a desk view, how its phone stage sits in the desk stage. */
export const FALLBACK_HOST: Record<ScreenId, 'scale' | 'grow' | 'column'> = {
  S01: 'column', S02: 'scale', S03: 'scale', S04: 'grow', S05: 'scale', S06: 'scale',
  S07: 'scale', S08: 'grow', S09: 'scale', S10: 'grow', S11: 'grow',
}

/** The phone stage a scaled host lays out: 390 wide, at least this tall. */
export const PHONE_STAGE = { w: 390, h: 480 }

/** The scene a desk stage draws: base camp has a landscape render (2400x1600,
    the route to the summit in view); the portrait one would be drawn at
    about 2.5x on a wide stage. The SVG camps bleed wide enough as they are. */
export function deskScene(id: string | null): string | null {
  return id === 'scene-basecamp' ? 'scene-basecamp-wide' : id
}

/** Desk geometry, shared with Sheet. */
export const DESK = {
  top: 48, topCompact: 44,
  panel: 'clamp(380px, 30vw, 480px)', panelCompact: '340px',
  pad: 40, padCompact: 28,
  trail: 88, trailCompact: 72,
}

export default function Frame(p: FrameProps) {
  const L = useLayoutInfo()
  return L.desk ? <DeskFrame {...p} /> : <PhoneFrame {...p} />
}

/* ------------------------------------------------------------ shared bits */

/** The text inside a node (strings and element children), to compare a
    screen's prompt/helper override with the spec's. */
export function nodeText(n: ReactNode): string {
  if (n === null || n === undefined || typeof n === 'boolean') return ''
  if (typeof n === 'string' || typeof n === 'number') return String(n)
  if (Array.isArray(n)) return n.map(nodeText).join('')
  if (isValidElement(n)) {
    const kids = (n.props as { children?: ReactNode }).children
    return Children.toArray(kids).map(nodeText).join('')
  }
  return ''
}

function useFrameCopy(p: FrameProps) {
  const answers = useGame((s) => s.answers)
  const beat = p.beat ?? 'A'
  const c = copy(p.id, beat)
  const a = askOf(p.id, beat, undefined, askVars(answers))
  // a helper that says something new is live (S02's Holding line)
  const live = p.helper !== undefined && nodeText(p.helper).trim() !== c.helper.trim() ? p.helper : undefined
  const caption: ReactNode = p.prompt ?? a.caption
  return { c, a, live, caption }
}

/* ------------------------------------------------------------ phone */

function PhoneFrame(p: FrameProps) {
  const ctx = useGameCtx()
  const preview = useGame((s) => s.preview)
  const valid = p.valid || preview
  const s = step(p.id)
  const beats = specBeats(p.id)
  const beat = p.beat ?? 'A'
  const camp = campIndex(p.id)
  const { c, a, live, caption } = useFrameCopy(p)
  const walk = p.walk ?? (!!s.walk && beat === beats[beats.length - 1])
  const scene = p.scene === undefined ? sceneFor(p.id) : p.scene
  const long = a.question.length > 60

  return (
    <div
      className="relative flex h-full w-full flex-col overflow-hidden"
      style={{ background: paperFor(camp), ['--halo' as string]: paperFor(camp) } as CSSProperties}
      data-frame={p.id}
      data-beat={beat}
      data-layout="phone"
    >
      {scene && (
        <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
          <Art id={scene} width="100%" height="100%" />
        </div>
      )}

      <div className="relative z-10 flex h-full min-h-0 flex-col" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <TopBar camp={camp} />
        {preview && (
          <p className="relative z-[4] -mt-1 mb-1 text-center font-[family-name:var(--font-ui)] text-[10px] uppercase tracking-[0.14em] text-bronze" data-preview>
            Preview · answers optional
          </p>
        )}

        {/* the ridge and the pencil route run behind the prompt: a paper halo
            keeps every letter clear of them */}
        {PLAIN_ASK ? (
          <header className="halo relative z-[3] shrink-0 px-5 pb-2 pt-0">
            <p className="font-[family-name:var(--font-text)] text-[13px] italic leading-[17px] text-muted" data-caption>
              {caption}
            </p>
            <h1
              tabIndex={-1}
              style={{ outline: 'none' }}
              className={`mt-[2px] font-[family-name:var(--font-text)] font-semibold text-ink ${long ? 'text-[21px] leading-[26px]' : 'text-[24px] leading-[30px]'}`}
              data-prompt
            >
              {a.question}
            </h1>
            <p className="mt-1 font-[family-name:var(--font-text)] text-[15px] leading-[20px] text-ink-2" data-helper>
              {live ?? (p.how === undefined ? a.how : p.how)}
            </p>
          </header>
        ) : (
          <header className="halo relative z-[3] shrink-0 px-5 pb-2 pt-1">
            <h1
              tabIndex={-1}
              style={{ outline: 'none' }}
              className="font-[family-name:var(--font-text)] text-[24px] font-semibold leading-[30px] text-ink"
              data-prompt
            >
              {p.prompt ?? c.prompt}
            </h1>
            <p className="mt-1 font-[family-name:var(--font-text)] text-[16px] leading-[21px] text-ink-2" data-helper>
              {p.helper ?? c.helper}
            </p>
          </header>
        )}

        <div className={`relative min-h-0 flex-1 ${p.stageClassName ?? ''}`} style={p.stageStyle} data-stage>
          {p.children}
        </div>

        {p.footnote && (
          <p className="relative z-[2] shrink-0 px-5 pb-1 font-[family-name:var(--font-ui)] text-[12px] leading-[16px] text-muted">
            {p.footnote}
          </p>
        )}

        {p.footer !== undefined ? (
          p.footer
        ) : walk ? (
          <div className="relative z-[2] shrink-0 pb-1">
            <CampWalk key={`${p.id}-${ctx.visit}`} enabled={valid} onDone={p.onContinue} reduced={ctx.reduced} />
          </div>
        ) : (
          <div className="relative z-[2] flex h-[60px] shrink-0 items-center px-5">
            <AnimatePresence initial={false}>
              {valid && (
                <motion.button
                  key="primary"
                  type="button"
                  className={`${p.continueQuiet ? 'btn-quiet' : 'btn'} w-full`}
                  onClick={() => { if (!ctx.busy) p.onContinue() }}
                  initial={ctx.reduced ? { opacity: 0 } : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: ctx.reduced ? 0.15 : 0.22, ease: [0.16, 1, 0.3, 1] }}
                  data-testid="primary"
                >
                  {p.continueLabel ?? 'Continue'}
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------ desk */

const ROUTE_W = 460
const CAPTION_GAP = 24

/** The stage caption (the spec prompt, italic), with the pencil route ahead
    beside it when both fit on one line. The caption never wraps to make
    room for the route: when they would collide, the route (decoration) is
    left out and the caption (words) keeps the band. */
function StageCaption({ caption, big, route, align = 'left' }: { caption: ReactNode; big: boolean; route: boolean; align?: 'left' | 'right' }) {
  const row = useRef<HTMLDivElement | null>(null)
  const measure = useRef<HTMLSpanElement | null>(null)
  const [fits, setFits] = useState(false)
  useLayoutEffect(() => {
    const r = row.current, m = measure.current
    if (!route || !r || !m) return
    const check = () => setFits(m.offsetWidth + CAPTION_GAP + ROUTE_W <= r.clientWidth && m.offsetWidth <= 640)
    check()
    const ro = new ResizeObserver(check)
    ro.observe(r)
    return () => ro.disconnect()
  }, [route, caption, big])
  const font: CSSProperties = { fontSize: big ? 22 : 20, lineHeight: big ? '30px' : '28px' }
  return (
    <div ref={row} className={`pointer-events-none absolute left-8 right-8 top-6 z-[3] flex items-start gap-6 ${align === 'right' ? 'justify-end' : 'justify-between'}`}>
      <p className={`halo max-w-[640px] font-[family-name:var(--font-text)] italic text-muted ${align === 'right' ? 'text-right' : ''}`} style={font} data-caption>
        {caption}
      </p>
      {route && (
        <span ref={measure} className="invisible absolute left-0 top-0 whitespace-nowrap font-[family-name:var(--font-text)] italic" style={font} aria-hidden>
          {caption}
        </span>
      )}
      {route && fits && <RouteAhead className="shrink-0" />}
    </div>
  )
}

function DeskFrame(p: FrameProps) {
  const ctx = useGameCtx()
  const L = useLayoutInfo()
  const preview = useGame((s) => s.preview)
  const sheetOpen = useGame((s) => !!s.sheet)
  const valid = p.valid || preview
  const s = step(p.id)
  const beats = specBeats(p.id)
  const beat = p.beat ?? 'A'
  const camp = campIndex(p.id)
  const { a, live, caption } = useFrameCopy(p)
  const walk = p.walk ?? (!!s.walk && beat === beats[beats.length - 1])
  const scene = deskScene(p.scene === undefined ? sceneFor(p.id) : p.scene)
  const compact = L.compact
  const walkRef = useRef<CampWalkHandle | null>(null)
  const [arrival] = useState(ctx.arrival)

  const host = p.host ?? (s.kind === 'screen' ? FALLBACK_HOST[p.id as ScreenId] : 'scale')
  const showCaption = L.h >= 680
  const trailH = walk ? (compact ? DESK.trail - 16 : DESK.trail) : 0
  const noPrimary = p.footer === null
  const label = walk ? 'Walk on' : p.continueLabel ?? 'Continue'

  const press = () => {
    if (ctx.busy || !valid) return
    if (walk) walkRef.current?.walkOn()
    else p.onContinue()
  }
  useHotkeys({
    Enter: () => {
      if (!valid || noPrimary || gestureInProgress()) return false
      press()
    },
  }, { enabled: !sheetOpen && !ctx.keysOpen })

  const pan = arrival !== 'fade' && !ctx.reduced
  const panFrom = arrival === 'up' ? { x: '28%', y: '-34%' } : { x: '-28%', y: '34%' }

  return (
    <div
      className="relative grid h-full w-full overflow-hidden bg-paper"
      style={{
        gridTemplateRows: `${compact ? DESK.topCompact : DESK.top}px minmax(0, 1fr) auto`,
        gridTemplateColumns: `${compact ? DESK.panelCompact : DESK.panel} minmax(0, 1fr)`,
      }}
      data-frame-root={p.id}
      data-beat={beat}
      data-layout={L.layout}
    >
      <DeskTopBar compact={compact} />

      {/* the panel's paper, behind its two cells */}
      <div className="border-r border-rule-soft bg-paper" style={{ gridColumn: 1, gridRow: '2 / 4' }} aria-hidden />

      {/* 1: the question (first in the DOM: it is focused on every step) */}
      <section
        className="relative min-h-0"
        style={{ gridColumn: 1, gridRow: 2, padding: `${compact ? 20 : 32}px ${compact ? DESK.padCompact : DESK.pad}px 12px` }}
        aria-label="Question"
        data-panel
      >
        <motion.div className="h-full" initial={ctx.reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
          <QuestionPanel
            ask={a}
            compact={compact}
            fine={L.fine}
            status={p.status}
            summary={p.summary}
            holding={p.holding ?? live}
            keys={p.hotkeysHint}
            how={p.how}
            panelSlot={p.panelSlot}
          />
        </motion.div>
      </section>

      {/* 2: the stage */}
      <div
        className="relative min-h-0 min-w-0 overflow-hidden"
        style={{ gridColumn: 2, gridRow: '2 / 4', background: paperFor(camp), ['--halo' as string]: paperFor(camp) } as CSSProperties}
        data-stage-region
      >
        <motion.div
          className="absolute inset-0"
          initial={pan ? { ...panFrom, opacity: 1 } : false}
          animate={{ x: 0, y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          data-frame={p.id}
          data-layout={L.layout}
        >
          {scene && (
            <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
              <Art id={scene} width="100%" height="100%" />
            </div>
          )}

          {showCaption && (
            <StageCaption caption={caption} big={L.w >= 1800} align={p.captionAlign}
              route={p.captionAlign !== 'right' && campIndex(p.id) >= 2 && p.id !== 'S05' && s.kind === 'screen' && !!scene && !a.self} />
          )}

          <StageBody
            host={host}
            top={showCaption ? 76 : 16}
            bottom={trailH + (p.footnote ? 40 : 0)}
            className={p.stageClassName}
            style={p.stageStyle}
          >
            {p.children}
          </StageBody>

          {p.footnote && (
            <div className="absolute left-8 z-[4] font-[family-name:var(--font-ui)] text-[13px] leading-[18px] text-muted" style={{ bottom: trailH + 10 }} data-footnote>
              {p.footnote}
            </div>
          )}

          {walk && (
            <div className="absolute inset-x-0 bottom-0 z-[4]" style={{ height: trailH }}>
              <TrailFit height={trailH}>
                {(w) => (
                  <CampWalk
                    key={`${p.id}-${ctx.visit}`}
                    ref={walkRef}
                    desk={{ width: w, height: trailH }}
                    hideButton
                    nextCamp={CAMPS[Math.min(CAMPS.length - 1, camp + 1)]}
                    enabled={valid}
                    onDone={p.onContinue}
                    reduced={ctx.reduced}
                  />
                )}
              </TrailFit>
            </div>
          )}
        </motion.div>
      </div>

      {/* 3: the camp route and the action row, after the stage in the DOM */}
      <div
        className="relative"
        style={{ gridColumn: 1, gridRow: 3, padding: `0 ${compact ? DESK.padCompact : DESK.pad}px ${compact ? 16 : 24}px` }}
        data-panel-foot
      >
        {!compact && L.h >= 760 && <div className="mb-3"><CampRoute camp={camp} reduced={ctx.reduced} /></div>}
        <PanelActions
          onBack={ctx.back}
          canBack={ctx.canBack}
          primary={noPrimary ? null : label}
          onPrimary={press}
          valid={valid}
          reason={p.invalidReason}
          quiet={!walk && p.continueQuiet}
          testId={walk ? 'walk-on' : 'primary'}
          custom={p.footer ?? undefined}
          fine={L.fine}
          compact={compact}
        />
      </div>
    </div>
  )
}

/** The stage body: the screen's children, hosted (see the header). */
function StageBody({ host, top, bottom, children, className, style }: {
  host: 'native' | 'scale' | 'grow' | 'column'
  top: number
  bottom: number
  children?: ReactNode
  className?: string
  style?: CSSProperties
}) {
  const box: CSSProperties = host === 'column'
    ? { top, bottom, left: 0, right: 0, marginInline: 'auto', maxWidth: 560 }
    : { top, bottom, left: 0, right: 0 }
  if (host !== 'scale') {
    return (
      <div className={`absolute z-[2] ${className ?? ''}`} style={{ ...box, ...style }} data-stage data-host={host}>
        {children}
      </div>
    )
  }
  return <ScaledHost box={box} className={className} style={style}>{children}</ScaledHost>
}

/** A 390px-wide phone stage, scaled to fit the desk stage body. */
function ScaledHost({ box, children, className, style }: { box: CSSProperties; children?: ReactNode; className?: string; style?: CSSProperties }) {
  const { ref, w, h } = useFitScale<HTMLDivElement>(PHONE_STAGE.w, PHONE_STAGE.h)
  const k = w && h ? Math.max(0.8, Math.min(1.45, (w - 32) / PHONE_STAGE.w, h / PHONE_STAGE.h)) : 1
  const bw = PHONE_STAGE.w, bh = h ? h / k : PHONE_STAGE.h
  return (
    <div ref={ref} className="absolute z-[2]" style={box} data-host="scale">
      <div
        className={`absolute left-1/2 top-0 ${className ?? ''}`}
        style={{ width: bw, height: bh, marginLeft: -bw / 2, transform: `scale(${k})`, transformOrigin: '50% 0', ['--host-k' as string]: k, ...style } as CSSProperties}
        data-stage
        data-host-scaled
      >
        {children}
      </div>
    </div>
  )
}

/** Gives the trail its width: the stage width minus margins, at most 1000. */
function TrailFit({ height, children }: { height: number; children: (w: number) => ReactNode }) {
  const { ref, w } = useFitScale<HTMLDivElement>(1, 1)
  return <div ref={ref} className="h-full w-full" style={{ height }}>{w > 0 && children(Math.min(1000, w - 32))}</div>
}

/** A design canvas (dw x dh at k = 1), fit-scaled and centred in the stage
    body: k = clamp(0.72, min(availW/dw, availH/dh), 1.25). For desk views. */
export function DeskCanvas({ w: dw, h: dh, children, className, min, max }: {
  w: number; h: number; children?: ReactNode; className?: string; min?: number; max?: number
}) {
  const { ref, k, w, h } = useFitScale<HTMLDivElement>(dw, dh, { min, max })
  return (
    <div ref={ref} className="absolute inset-0" data-desk-canvas>
      {w > 0 && (
        <div
          className={`absolute ${className ?? ''}`}
          style={{
            width: dw, height: dh, left: (w - dw * k) / 2, top: Math.max(0, (h - dh * k) / 2),
            transform: `scale(${k})`, transformOrigin: '0 0', ['--host-k' as string]: k,
          } as CSSProperties}
          data-host-scaled
        >
          {children}
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------ desk top bar */

export function DeskTopBar({ compact }: { compact: boolean }) {
  const ctx = useGameCtx()
  const preview = useGame((s) => s.preview)
  const L = useLayoutInfo()
  return (
    <div className="relative z-20 flex items-center justify-between border-b border-rule-soft bg-paper px-6" style={{ gridColumn: '1 / 3', gridRow: 1, height: compact ? DESK.topCompact : DESK.top }} data-topbar data-desk-topbar>
      <p className="font-[family-name:var(--font-ui)] text-[12px] font-semibold uppercase tracking-[0.14em] text-ink">The Ascent · A2A</p>
      {preview && (
        <p className="absolute left-1/2 -translate-x-1/2 rounded-[2px] border border-bronze px-2 py-[2px] font-[family-name:var(--font-ui)] text-[10px] uppercase tracking-[0.14em] text-bronze" data-preview>
          Preview · answers optional
        </p>
      )}
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => ctx.setKeysOpen(!ctx.keysOpen)}
          className="flex h-9 items-center gap-2 rounded-[2px] px-2 font-[family-name:var(--font-ui)] text-[13px] text-ink hover:bg-[rgba(13,12,11,0.05)]"
          aria-haspopup="dialog" aria-expanded={ctx.keysOpen} data-testid="keys">
          {L.fine && <KeyCap k="?" />} Keys
        </button>
        <button
          type="button"
          onClick={ctx.toggleSound}
          aria-pressed={ctx.sound}
          aria-label={ctx.sound ? 'Sound on' : 'Sound off'}
          className="flex h-9 items-center gap-2 rounded-[2px] px-2 font-[family-name:var(--font-ui)] text-[13px] text-ink hover:bg-[rgba(13,12,11,0.05)]"
          data-testid="sound"
        >
          {L.fine && <KeyCap k="M" />}
          <SoundIcon on={ctx.sound} />
          <span aria-hidden>Sound</span>
        </button>
      </div>
    </div>
  )
}

function SoundIcon({ on }: { on: boolean }) {
  return (
    <svg width="18" height="14" viewBox="0 0 18 14" aria-hidden>
      <path d="M1.5 5h3l4-3.5v11L4.5 9h-3z" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      {on ? (
        <path d="M11.5 4.5c1 1.4 1 3.6 0 5M13.8 2.6c2 2.5 2 6.3 0 8.8" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      ) : (
        <path d="M11.5 4.5l5 5M16.5 4.5l-5 5" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      )}
    </svg>
  )
}

/* ------------------------------------------------------------ phone top bar */

export function TopBar({ camp }: { camp: number }) {
  const ctx = useGameCtx()
  return (
    <div className="flex h-11 shrink-0 items-center justify-between px-2" data-topbar>
      <button
        type="button"
        onClick={ctx.back}
        disabled={!ctx.canBack}
        className="flex h-11 min-w-[64px] items-center gap-1 px-2 font-[family-name:var(--font-ui)] text-[13px] text-ink disabled:invisible"
        aria-label="Back"
        data-testid="back"
      >
        <svg width="8" height="12" viewBox="0 0 8 12" aria-hidden>
          <path d="M6.5 1 1.5 6l5 5" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        Back
      </button>
      <Tents camp={camp} />
      <button
        type="button"
        onClick={ctx.toggleSound}
        aria-pressed={ctx.sound}
        aria-label={ctx.sound ? 'Sound on' : 'Sound off'}
        className="flex h-11 w-16 items-center justify-end px-2 text-ink"
        data-testid="sound"
      >
        <SoundIcon on={ctx.sound} />
      </button>
    </div>
  )
}

/** Five small tents filling in by camp. Never a percentage. */
export function Tents({ camp }: { camp: number }) {
  return (
    <div className="flex items-end gap-[10px]" role="img" aria-label={`${CAMPS[camp]}: ${camp + 1} of ${CAMPS.length} camps`} data-tents={camp}>
      {CAMPS.map((name, i) => {
        const reached = i < camp
        const here = i === camp
        const fill = here ? '#1F4B3A' : reached ? '#0D0C0B' : 'none'
        const stroke = here || reached ? '#0D0C0B' : '#8C857A'
        const w = i === CAMPS.length - 1 ? 14 : 16
        return (
          <svg key={name} width={w} height={12} viewBox={`0 0 ${w} 12`} aria-hidden>
            {i === CAMPS.length - 1 ? (
              // the summit: a small flag on a peak
              <>
                <path d={`M1 11.25 L7 2.5 L13 11.25 Z`} fill={fill} stroke={stroke} strokeWidth="1.2" strokeLinejoin="round" />
              </>
            ) : (
              <>
                <path d={`M1 11.25 L8 1.5 L15 11.25 Z`} fill={fill} stroke={stroke} strokeWidth="1.2" strokeLinejoin="round" />
                <path d="M8 5.5 L8 11.25" stroke={here || reached ? '#F8F7F4' : stroke} strokeWidth="1" />
              </>
            )}
          </svg>
        )
      })}
    </div>
  )
}
