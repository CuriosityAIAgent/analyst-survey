'use client'
/* ShortcutsOverlay: the key map (design 3.7), opened with '?' or the desk
   top bar's Keys button; Esc or a click outside closes it. Game renders it. */
import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import KeyCap from './KeyCap'

const ROWS: [string[], string][] = [
  [['Enter'], 'Continue, when the answer is complete'],
  [['1', '9'], 'Send the item you are on to box n, or choose option n'],
  [['Tab'], 'Move between items, boxes and buttons'],
  [['Space'], 'Pick up or put down the item you are on'],
  [['ArrowLeft', 'ArrowRight'], 'Move a slider, a card, or the box you are aiming at'],
  [['Delete'], 'Take a placed item back'],
  [['Esc'], 'Put an item down, or close a follow-up'],
  [['?'], 'Show or hide these keys'],
  [['M'], 'Sound on or off'],
  [['Alt', 'ArrowLeft'], 'Back (the browser Back button works too)'],
]

export default function ShortcutsOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const card = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    if (!open) return
    const prev = document.activeElement as HTMLElement | null
    card.current?.focus()
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); onClose() } }
    window.addEventListener('keydown', onKey, true)
    return () => { window.removeEventListener('keydown', onKey, true); prev?.focus?.({ preventScroll: true }) }
  }, [open, onClose])
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="absolute inset-0 z-[80] flex items-center justify-center" style={{ background: 'rgba(13,12,11,0.22)' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.16 }}
          onClick={onClose} data-shortcuts>
          <div ref={card} tabIndex={-1} role="dialog" aria-modal="true" aria-label="Keyboard shortcuts"
            className="w-[520px] max-w-[92vw] rounded-[2px] border border-rule-soft bg-paper px-8 py-7 outline-none"
            style={{ boxShadow: '0 12px 32px rgba(13,12,11,0.14)' }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-baseline justify-between">
              <h2 className="font-[family-name:var(--font-text)] text-[22px] font-semibold text-ink">Keys</h2>
              <button type="button" className="font-[family-name:var(--font-ui)] text-[13px] text-muted hover:text-ink" onClick={onClose}>Close <KeyCap k="Esc" /></button>
            </div>
            <table className="mt-4 w-full font-[family-name:var(--font-ui)] text-[14px] leading-[20px] text-ink-2">
              <tbody>
                {ROWS.map(([keys, what]) => (
                  <tr key={what} className="border-t border-rule-soft">
                    <td className="w-[150px] py-2 pr-4 align-top whitespace-nowrap">
                      {keys.length === 2 && keys[0] === '1'
                        ? <><KeyCap k="1" /> – <KeyCap k="9" /></>
                        : keys.map((k, i) => <span key={k}>{i > 0 && keys[0] === 'Alt' ? ' + ' : i > 0 ? ' ' : ''}<KeyCap k={k} /></span>)}
                    </td>
                    <td className="py-2">{what}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-4 font-[family-name:var(--font-ui)] text-[13px] leading-[18px] text-muted">
              Each screen also lists its own keys under &lsquo;How to answer&rsquo;. Click-then-click works everywhere, so nothing needs a drag.
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
