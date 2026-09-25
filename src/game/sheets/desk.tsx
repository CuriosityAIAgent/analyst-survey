'use client'
/* Desk follow-up cards (design 3.5 and 6): the pieces F1..F5 share when the
   layout is desk or deskCompact.

   Sheet (desk) turns the panel into the follow-up and raises a card from the
   stage foot: stage width - 64 (at most 960), up to 62% of the stage tall.
   A sheet passes `deskBody` and `cardHeight`, and lays its mechanic out on a
   design canvas (880 wide at k = 1) that this module fits into the card:

     const fit = useSheetFit(880, 300)
     <Sheet … deskBody={desk} cardHeight={desk ? fit.cardHeight : undefined}>
       {desk ? <SheetCanvas fit={fit}>…880 x 300…</SheetCanvas> : <PhoneBody/>}
     </Sheet>

   k = clamp(0.6, min(cardInnerW / dw, (0.62 * stageH - 48) / dh), 1.25). The
   canvas is marked data-host-scaled with --host-k, so a lifted item stays
   under the pointer (DeskStyles). Number badges (NumBadge) are KeyCaps: they
   hide without a fine pointer, like every keycap.

   useSheetKeys: number keys (and any others) for a desk sheet. Off on the
   phone, while the shortcut overlay is open and while the game is busy
   (useHotkeys); a key a control already consumed (a focused slider's
   arrows, a lifted item's Enter) never fires twice. */
import { useLayoutEffect, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { useLayoutInfo } from '../layout'
import { useGameCtx } from '../context'
import { useHotkeys } from '../useHotkeys'
import type { HotkeyMap } from '../useHotkeys'
import KeyCap from '../KeyCap'
import { TagChip } from '../Chips'

/** Design width of every desk follow-up canvas (design 6). */
export const CARD_DW = 880
const PAD = 24
const K_MIN = 0.6
const K_MAX = 1.25
/** The card may take this share of the stage height (design 3.5). */
const CARD_SHARE = 0.62

export type SheetFit = {
  desk: boolean
  k: number
  /** Card body height in px (Sheet's cardHeight). */
  cardHeight: number
  /** Card inner width in px. */
  innerW: number
  dw: number
  dh: number
  ref: (el: HTMLElement | null) => void
}

/** The follow-up stage size, estimated from the viewport until measured. */
function estimateStage(w: number, h: number, compact: boolean) {
  const panel = compact ? 340 : Math.max(380, Math.min(0.3 * w, 480))
  return { w: w - panel - 1, h: h - (compact ? 44 : 48) }
}

export function fitSheet(stageW: number, stageH: number, dw: number, dh: number) {
  const cardW = Math.min(960, Math.max(0, stageW - 64))
  const innerW = Math.max(0, cardW - 2 * PAD)
  const availH = Math.max(0, CARD_SHARE * stageH - 2 * PAD)
  const k = Math.max(K_MIN, Math.min(K_MAX, innerW / dw, availH / dh))
  return { k, innerW, cardHeight: Math.ceil(dh * k) }
}

export function useSheetFit(dw: number, dh: number): SheetFit {
  const L = useLayoutInfo()
  const [stage, setStage] = useState<{ w: number; h: number } | null>(null)
  const ro = useRef<ResizeObserver | null>(null)
  const ref = useRef((el: HTMLElement | null) => {
    ro.current?.disconnect()
    ro.current = null
    const host = el?.closest('[data-followup-stage]') as HTMLElement | null
    if (!host) return
    const measure = () => setStage((s) => (s && s.w === host.clientWidth && s.h === host.clientHeight ? s : { w: host.clientWidth, h: host.clientHeight }))
    measure()
    ro.current = new ResizeObserver(measure)
    ro.current.observe(host)
  }).current
  useLayoutEffect(() => () => ro.current?.disconnect(), [])
  const st = stage && stage.w > 0 ? stage : estimateStage(L.w, L.h, L.compact)
  const f = fitSheet(st.w, st.h, dw, dh)
  return { desk: L.desk, dw, dh, ref, ...f }
}

/** The design canvas, fit-scaled and centred in the card body. */
export function SheetCanvas({ fit, children, className, style, testId }: {
  fit: SheetFit
  children?: ReactNode
  className?: string
  style?: CSSProperties
  testId?: string
}) {
  const { k, dw, dh, innerW } = fit
  return (
    <div ref={fit.ref} className="relative h-full w-full" data-sheet-desk>
      <div
        className={`absolute top-0 ${className ?? ''}`}
        style={{
          width: dw, height: dh, left: Math.max(0, (innerW - dw * k) / 2),
          transform: `scale(${k})`, transformOrigin: '0 0', ['--host-k' as string]: k, ...style,
        } as CSSProperties}
        data-host-scaled
        data-testid={testId}
      >
        {children}
      </div>
    </div>
  )
}

/** A target's number: the key that picks it (fine pointer only). */
export function NumBadge({ n, className = '', style }: { n: number; className?: string; style?: CSSProperties }) {
  return <KeyCap k={String(n)} className={`pointer-events-none ${className}`} style={style} />
}

/** Desk-only keys for a sheet (number keys pick). */
export function useSheetKeys(map: HotkeyMap) {
  const L = useLayoutInfo()
  const ctx = useGameCtx()
  useHotkeys(map, { enabled: L.desk && !ctx.keysOpen })
}

/** '1'..'n' -> fn(index). */
export function numberKeys(n: number, fn: (i: number) => void): HotkeyMap {
  const m: HotkeyMap = {}
  for (let i = 0; i < n; i++) m[String(i + 1)] = () => fn(i)
  return m
}

/* ------------------------------------------------------------ pick row */

/** Desk canvas for the one-tap sheets (F2b, F3a-c): the sheet's scene piece
    top-left, then the options as TagChips 200 x 88 in one row, each with its
    number key. Number keys pick (a pick, so the sheet auto-finishes as on a
    tap). */
export const PICK_DH = 232

export function PickRow({ fit, header, options, value, onPick, testId, optTestId, groupLabel, labelledBy, role = 'radiogroup', disabled }: {
  fit: SheetFit
  header?: ReactNode
  options: { id: string; label: string }[]
  value: string | undefined
  onPick: (id: string, via: 'tap' | 'key') => void
  testId: string
  optTestId: (id: string) => string
  groupLabel?: string
  labelledBy?: string
  role?: 'radiogroup' | 'group'
  disabled?: boolean
}) {
  useSheetKeys(numberKeys(options.length, (i) => onPick(options[i].id, 'key')))
  const n = options.length
  const W = 200, GAP = 16
  const x0 = (CARD_DW - (n * W + (n - 1) * GAP)) / 2
  return (
    <SheetCanvas fit={fit}>
      {header && <div className="absolute flex items-end" style={{ left: x0, top: 0, height: 112 }} data-sheet-header>{header}</div>}
      <div role={role} aria-label={groupLabel} aria-labelledby={labelledBy} className="absolute" style={{ left: 0, top: 128, width: CARD_DW, height: 88 }} data-testid={testId}>
        {options.map((o, i) => {
          const on = value === o.id
          return (
            <button
              key={o.id}
              type="button"
              role={role === 'radiogroup' ? 'radio' : undefined}
              aria-checked={role === 'radiogroup' ? on : undefined}
              aria-pressed={role === 'group' ? on : undefined}
              data-on={on ? 'true' : undefined}
              disabled={disabled}
              onClick={() => onPick(o.id, 'tap')}
              className="absolute block transition-transform duration-150 hover:-translate-y-[2px]"
              style={{ left: x0 + i * (W + GAP), top: 0, width: W, height: 88 }}
              data-testid={optTestId(o.id)}
            >
              {/* the key sits inside the tag, at its right end (as F4 and F5) */}
              <TagChip label={o.label} on={on} size={18} trail={<NumBadge n={i + 1} />} />
            </button>
          )
        })}
      </div>
    </SheetCanvas>
  )
}
