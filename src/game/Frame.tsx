'use client'
/* Frame: the shell every screen renders inside ("The frame shared by every
   screen" in the design).

   - Fills its parent (Game gives it 100dvh, at most 480px wide). No scroll.
   - A full-bleed scene layer: <Art id={scene}> on paper warmed camp by camp
     toward --color-dawn.
   - Top bar (44px, so Back and Sound are full touch targets): Back, five small tents (Base camp .. Summit) filling in by
     camp, and a sound toggle (off by default).
   - Prompt (Bodoni Moda 24/28) and helper (Source Serif 4 15px, muted),
     from the spec by default.
   - The stage: children fill it (flex-1, min-h-0, position relative). Put
     useDrag's stageProps on your own element inside it.
   - Footer: the primary button (Archivo, ink) appears only when `valid`; on
     S02, S04 Beat B and S06 the CampWalk strip replaces it (spec walk:true).

   Height budget at 390x660: top bar 44 + prompt ~76 + footer 60 = 176, which
   leaves ~484px of stage (~468 with the 56px walk strip plus footnote). */
import type { CSSProperties, ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Art } from './art'
import { CAMPS, campIndex, copy, paperFor, sceneFor, specBeats, step } from './content'
import type { BeatId, StepId } from './types'
import { useGameCtx } from './context'
import { useGame } from './store'
import CampWalk from './CampWalk'

export type FrameProps = {
  /** The screen this frame belongs to: sets camp, scene, copy and walk. */
  id: StepId
  beat?: BeatId
  /** Override the spec prompt/helper (e.g. S09 Beat B's {leadTrait}). */
  prompt?: ReactNode
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
  /** Replace the footer entirely (S07's swipe buttons live in the stage). */
  footer?: ReactNode
  /** Small Archivo 12px line above the footer (S01's privacy note). */
  footnote?: ReactNode
  /** Scene art id; null for none. Default: the camp's scene. */
  scene?: string | null
  /** Children of the stage. */
  children?: ReactNode
  stageClassName?: string
  stageStyle?: CSSProperties
}

export default function Frame(p: FrameProps) {
  const ctx = useGameCtx()
  const preview = useGame((s) => s.preview)
  const valid = p.valid || preview
  const s = step(p.id)
  const beats = specBeats(p.id)
  const beat = p.beat ?? 'A'
  const camp = campIndex(p.id)
  const c = copy(p.id, beat)
  const walk = p.walk ?? (!!s.walk && beat === beats[beats.length - 1])
  const scene = p.scene === undefined ? sceneFor(p.id) : p.scene

  return (
    <div
      className="relative flex h-full w-full flex-col overflow-hidden"
      style={{ background: paperFor(camp), ['--halo' as string]: paperFor(camp) } as CSSProperties}
      data-frame={p.id}
      data-beat={beat}
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

/* ------------------------------------------------------------ top bar */

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
        <svg width="18" height="14" viewBox="0 0 18 14" aria-hidden>
          <path d="M1.5 5h3l4-3.5v11L4.5 9h-3z" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
          {ctx.sound ? (
            <path d="M11.5 4.5c1 1.4 1 3.6 0 5M13.8 2.6c2 2.5 2 6.3 0 8.8" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          ) : (
            <path d="M11.5 4.5l5 5M16.5 4.5l-5 5" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          )}
        </svg>
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
