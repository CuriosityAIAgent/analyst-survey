'use client'
/* Sheet: the half-sheet every follow-up (F1..F5) renders inside. It rises
   over its parent screen in 280ms (a crossfade under reduced motion), never
   moves the camera and never adds a screen. The parent stays visible under a
   light ink scrim and is inert while the sheet is open.

   Header: the forest rookie by default ("every follow-up about the rookie
   shows the forest rookie in its header"), then the prompt (Bodoni 22/26)
   and helper. Pass header={null} to drop the figure, or your own node.

   Finishing: either the Continue button (shown when `valid`), or `auto` for
   one-tap and one-drag sheets: onDone fires 500ms after each pick, so a mis-tap can still
   be changed. A pick is a change of `value`, or a bump of `picks` (pass a
   counter that goes up on every tap: then tapping the answer a sheet opened
   with, after Back, still finishes it). */
import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import type { SheetId, Variant } from './types'
import { copy } from './content'
import { useGameCtx } from './context'
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
}

export const SHEET_RISE_MS = 280
export const AUTO_DONE_MS = 500

export default function Sheet(p: SheetProps) {
  const ctx = useGameCtx()
  const c = copy(p.id, 'A', p.variant)
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

  const header = p.header === undefined ? <Figure variant="rookie" size={40} /> : p.header

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
              className="font-[family-name:var(--font-display)] text-[22px] leading-[26px] tracking-[-0.01em] text-ink" data-prompt>
              {p.prompt ?? c.prompt}
            </h2>
            <p className="mt-1 font-[family-name:var(--font-text)] text-[15px] leading-[20px] text-muted" data-helper>
              {p.helper ?? c.helper}
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
        {(!p.auto || p.showDone) && (
          <div className="flex h-[60px] shrink-0 items-center px-5">
            {p.valid && (
              <button type="button" className="btn w-full" onClick={() => { if (!ctx.busy) p.onDone() }} data-testid="sheet-done">
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
