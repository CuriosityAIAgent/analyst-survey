'use client'
/* Sheet: the half-sheet every follow-up (F1..F5) renders inside. It rises
   over its parent screen in 280ms (a crossfade under reduced motion), never
   moves the camera and never adds a screen. The parent stays visible under a
   light ink scrim and is inert while the sheet is open.

   PHONE. Header: the forest rookie by default ("every follow-up about the
   rookie shows the forest rookie in its header"), then the prompt and helper.
   With frame.plainAsk the prompt is the plain question (ask.question; F5 keeps
   its A/B wording verbatim) and the helper is ask.how; a sheet's `prompt`
   prop (the world line, which may name the answer that opened it) is not
   shown, so a follow-up never repeats back its trigger. Pass header={null}
   to drop the figure, or your own node.

   DESK (design 3.5). The panel crossfades to the follow-up (kicker
   'FOLLOW-UP · <CAMP>', the rookie, question, how, keys, why) with Back and
   Continue in its action row; Esc goes back. Over the parent stage, under a
   scrim that also blurs the parent (so the answer that triggered the sheet
   is never legible beside it; parent readouts and [data-under-sheet=hide]
   are hidden outright, see deskStyles), a follow-up card rises from the stage foot (stage width - 64,
   at most 960; up to 62% of the stage tall; a 2px bronze top rule) holding
   only the mechanic: the sheet's children, in a 350px phone body scaled to
   fit until the sheet has a desk layout of its own (pass `deskBody` to lay
   the children out natively in the card instead, `cardHeight` to fix its
   height).

   Finishing: either the Continue button (shown when `valid`), or `auto` for
   one-tap and one-drag sheets: onDone fires 500ms after each pick, so a mis-tap can still
   be changed. A pick is a change of `value`, or a bump of `picks` (pass a
   counter that goes up on every tap: then tapping the answer a sheet opened
   with, after Back, still finishes it). On desk, auto sheets ALSO show the
   panel primary (for keyboard users; data-testid 'sheet-continue'). */
import { useEffect, useRef } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { motion } from 'motion/react'
import type { SheetId, Variant } from './types'
import { PLAIN_ASK, ask as askOf, askVars, copy, step } from './content'
import { useGameCtx } from './context'
import { useGame } from './store'
import { useLayoutInfo } from './layout'
import { useHotkeys } from './useHotkeys'
import { useFitScale } from './useFitScale'
import { gestureInProgress } from './layout'
import { DESK, nodeText } from './Frame'
import QuestionPanel, { PanelActions } from './QuestionPanel'
import Figure from './Figure'

export type SheetProps = {
  id: SheetId
  /** F5 wording. */
  variant?: Variant
  prompt?: ReactNode
  helper?: ReactNode
  /** Default: the forest rookie. null = none. */
  header?: ReactNode | null
  valid: boolean
  onDone: () => void
  doneLabel?: string
  /** One-tap sheets: finish 500ms after `value` is set or changed. */
  auto?: boolean
  value?: unknown
  /** One-tap sheets: a counter bumped on every tap (see the header). */
  picks?: number
  /** Auto sheets: show the Continue button anyway (e.g. after a keyboard
      change on a slider, where arrow keys step through stops and an
      auto-finish would fire mid-choice). */
  showDone?: boolean
  children?: ReactNode
  /* ---- desk */
  /** The children are a desk layout: lay them out in the card as they are. */
  deskBody?: boolean
  /** Card height in px for a deskBody (default: the children's own height). */
  cardHeight?: number
}

export const SHEET_RISE_MS = 280
export const AUTO_DONE_MS = 500

export default function Sheet(p: SheetProps) {
  const ctx = useGameCtx()
  const L = useLayoutInfo()
  const preview = useGame((s) => s.preview)
  const valid = p.valid || preview
  const timer = useRef<number | null>(null)
  const onDone = useRef(p.onDone)
  onDone.current = p.onDone

  const key = `${JSON.stringify(p.value ?? null)}#${p.picks ?? 0}`
  // never auto-finish on what a sheet opened with (an earlier visit's answer)
  const openedWith = useRef(key)
  useEffect(() => {
    if (key === openedWith.current) return
    if (!p.auto || p.value === undefined || !p.valid) return
    if (timer.current) clearTimeout(timer.current)
    timer.current = window.setTimeout(() => onDone.current(), AUTO_DONE_MS)
    return () => { if (timer.current) clearTimeout(timer.current) }
  }, [key, p.auto, p.valid, p.value])

  return L.desk ? <DeskSheet {...p} valid={valid} preview={preview} /> : <PhoneSheet {...p} valid={valid} preview={preview} ctxBusy={ctx.busy} />
}

function useSheetCopy(p: SheetProps) {
  const answers = useGame((s) => s.answers)
  const c = copy(p.id, 'A', p.variant)
  const a = askOf(p.id, 'A', p.variant, askVars(answers))
  const live = p.helper !== undefined && nodeText(p.helper).trim() !== c.helper.trim() ? p.helper : undefined
  return { c, a, live }
}

/* ------------------------------------------------------------ phone */

function PhoneSheet(p: SheetProps & { preview: boolean; ctxBusy: boolean }) {
  const ctx = useGameCtx()
  const { c, a, live } = useSheetCopy(p)
  const header = p.header === undefined ? <Figure variant="rookie" size={40} /> : p.header
  const prompt = PLAIN_ASK ? a.question : p.prompt ?? c.prompt
  const helper = PLAIN_ASK ? live ?? a.how : p.helper ?? c.helper

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end" data-sheet={p.id} role="dialog" aria-modal="true" aria-labelledby={`sheet-${p.id}-prompt`}>
      <motion.div
        className="absolute inset-0"
        style={{ background: 'rgba(13,12,11,0.22)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: SHEET_RISE_MS / 1000 }}
        aria-hidden
      />
      <motion.div
        className="relative flex max-h-[80%] flex-col bg-paper"
        style={{ borderTop: '1px solid #8C857A', paddingBottom: 'env(safe-area-inset-bottom)', boxShadow: '0 -8px 24px rgba(13,12,11,0.10)' }}
        initial={ctx.reduced ? { opacity: 0 } : { y: '100%' }}
        animate={ctx.reduced ? { opacity: 1 } : { y: 0 }}
        exit={ctx.reduced ? { opacity: 0 } : { y: '100%' }}
        transition={{ duration: SHEET_RISE_MS / 1000, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="mx-auto mt-2 h-1 w-9 rounded-full bg-rule-soft" aria-hidden />
        <div className="flex items-start gap-3 px-5 pb-2 pt-2">
          {header && <div className="shrink-0 pt-1">{header}</div>}
          <div className="min-w-0 flex-1">
            <h2 id={`sheet-${p.id}-prompt`} tabIndex={-1} style={{ outline: 'none' }}
              className={`font-[family-name:var(--font-text)] font-semibold text-ink ${PLAIN_ASK && String(prompt).length > 60 ? 'text-[20px] leading-[25px]' : 'text-[22px] leading-[27px]'}`} data-prompt>
              {prompt}
            </h2>
            <p className="mt-1 font-[family-name:var(--font-text)] text-[15px] leading-[20px] text-muted" data-helper>
              {helper}
            </p>
          </div>
          <button
            type="button"
            onClick={ctx.back}
            className="-mr-2 -mt-1 h-11 min-w-[44px] shrink-0 px-2 font-[family-name:var(--font-ui)] text-[13px] text-muted"
            data-testid="sheet-back"
          >
            Back
          </button>
        </div>
        <div className="relative min-h-0 px-5 pb-2" data-sheet-body>
          {p.children}
        </div>
        {(!p.auto || p.showDone || p.preview) && (
          <div className="flex h-[60px] shrink-0 items-center px-5">
            {p.valid && (
              <button type="button" className="btn w-full" onClick={() => { if (!p.ctxBusy) p.onDone() }} data-testid="sheet-done">
                {p.doneLabel ?? 'Continue'}
              </button>
            )}
          </div>
        )}
        {p.auto && !p.showDone && <div className="h-3 shrink-0" />}
      </motion.div>
    </div>
  )
}

/* ------------------------------------------------------------ desk */

function DeskSheet(p: SheetProps & { preview: boolean }) {
  const ctx = useGameCtx()
  const L = useLayoutInfo()
  const compact = L.compact
  const { a, live } = useSheetCopy(p)
  const parent = step(p.id).parent
  const showsDone = !p.auto || !!p.showDone || p.preview

  const done = () => { if (!ctx.busy && p.valid) p.onDone() }
  useHotkeys({
    Enter: () => { if (!p.valid || gestureInProgress()) return false; done() },
    Escape: () => { if (gestureInProgress()) return false; ctx.back() },
  }, { enabled: !ctx.keysOpen })

  return (
    <div
      className="absolute inset-0 z-50 grid"
      style={{
        gridTemplateRows: `${compact ? DESK.topCompact : DESK.top}px minmax(0, 1fr) auto`,
        gridTemplateColumns: `${compact ? DESK.panelCompact : DESK.panel} minmax(0, 1fr)`,
        pointerEvents: 'none',
      }}
      data-sheet={p.id}
      data-parent={parent}
      data-layout={L.layout}
      role="dialog"
      aria-modal="true"
      aria-labelledby={`sheet-${p.id}-prompt`}
    >
      {/* the panel becomes the follow-up: a crossfade over the parent's */}
      <motion.div
        className="border-r border-rule-soft bg-paper"
        style={{ gridColumn: 1, gridRow: '2 / 4', pointerEvents: 'auto' }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        aria-hidden
      />
      <motion.section
        className="relative min-h-0"
        style={{ gridColumn: 1, gridRow: 2, padding: `${compact ? 20 : 32}px ${compact ? DESK.padCompact : DESK.pad}px 12px`, pointerEvents: 'auto' }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        data-panel
      >
        <QuestionPanel ask={a} compact={compact} fine={L.fine} heading="h2" headingId={`sheet-${p.id}-prompt`} holding={live} />
      </motion.section>

      {/* the parent stays visible and inert under the scrim; the card rises */}
      <div className="relative min-h-0 min-w-0 overflow-hidden" style={{ gridColumn: 2, gridRow: '2 / 4', pointerEvents: 'auto' }}>
        {/* the scrim also blurs the parent: the world stays visible, but the
            answer that opened this follow-up (a chip label, a stamp, a
            readout) is not legible beside its question (design 9.3) */}
        <motion.div
          className="absolute inset-0"
          style={{ background: 'rgba(13,12,11,0.26)', backdropFilter: 'blur(5px)', WebkitBackdropFilter: 'blur(5px)' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: SHEET_RISE_MS / 1000 }}
          aria-hidden
          data-sheet-scrim
        />
        <FollowUpCard reduced={ctx.reduced} deskBody={p.deskBody} cardHeight={p.cardHeight}>
          {/* a sheet's own header (F2a's draggable rookie, F3a's brick) stays
              with its mechanic, top-left as on the phone */}
          {p.header ? <div className="mb-2 flex" data-sheet-header>{p.header}</div> : null}
          {p.children}
        </FollowUpCard>
      </div>

      <motion.div
        className="relative"
        style={{ gridColumn: 1, gridRow: 3, padding: `0 ${compact ? DESK.padCompact : DESK.pad}px ${compact ? 16 : 24}px`, pointerEvents: 'auto' }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        data-panel-foot
      >
        <PanelActions
          onBack={ctx.back}
          canBack
          backTestId="sheet-back"
          primary={p.doneLabel ?? 'Continue'}
          onPrimary={done}
          valid={p.valid}
          reason="Choose an answer first"
          testId={showsDone ? 'sheet-done' : 'sheet-continue'}
          fine={L.fine}
          compact={compact}
        />
      </motion.div>
    </div>
  )
}

/** The follow-up card: rises from the stage foot and holds the mechanic. */
function FollowUpCard({ children, reduced, deskBody, cardHeight }: { children?: ReactNode; reduced: boolean; deskBody?: boolean; cardHeight?: number }) {
  const stage = useFitScale<HTMLDivElement>(1, 1)
  const body = useFitScale<HTMLDivElement>(1, 1)
  const cardW = Math.min(960, Math.max(0, stage.w - 64))
  const maxH = stage.h * 0.62
  const PAD = 24
  // the phone body is 350 wide; scale it to the card
  const natH = body.h || 300
  const k = deskBody ? 1 : Math.max(0.6, Math.min(1.35, (cardW - 2 * PAD) / 350, (maxH - 2 * PAD) / natH))
  const h = deskBody ? (cardHeight ?? natH) + 2 * PAD : natH * k + 2 * PAD
  return (
    <div ref={stage.ref} className="absolute inset-0" data-followup-stage>
      {stage.w > 0 && (
        <motion.div
          className="absolute bottom-0 bg-paper"
          style={{
            left: (stage.w - cardW) / 2, width: cardW, height: Math.min(h, deskBody ? stage.h - 24 : maxH + PAD),
            borderTop: '2px solid #7A3E12', boxShadow: '0 -8px 24px rgba(13,12,11,0.10)',
          }}
          initial={reduced ? { opacity: 0 } : { y: '100%' }}
          animate={reduced ? { opacity: 1 } : { y: 0 }}
          exit={reduced ? { opacity: 0 } : { y: '100%' }}
          transition={{ duration: SHEET_RISE_MS / 1000, ease: [0.16, 1, 0.3, 1] }}
          data-followup-card
        >
          {deskBody ? (
            <div className="absolute inset-0" style={{ padding: PAD }} data-sheet-body>{children}</div>
          ) : (
            <div
              className="absolute left-1/2 top-0"
              style={{ width: 350, marginLeft: -175, marginTop: PAD, transform: `scale(${k})`, transformOrigin: '50% 0', ['--host-k' as string]: k } as CSSProperties}
              data-host-scaled
            >
              <div ref={body.ref} className="relative" data-sheet-body>{children}</div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}
