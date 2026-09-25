'use client'
/* Readout: the chosen value, spelled out beside a slider on desk (S04, S08;
   design 5). A small Archivo caps label, then the value in Source Serif 4
   (44px by default) over a bronze rule; before anything is chosen, a muted
   italic "Not set yet". It only reads the answer: it stores nothing.

     <Readout label="Your answer" value={pace ? stopText(pace) : null} />

   `tone="you"` (a self-question) draws the label in bronze, echoing the
   ABOUT YOU pill; the value stays ink. aria-live, so a screen reader hears
   the value as it changes. */
import { AnimatePresence, motion } from 'motion/react'

export default function Readout({ label, value, empty = 'Not set yet', size = 44, tone, reduced, className = '', align = 'left' }: {
  label: string
  /** The chosen value, or null when unset. */
  value: string | null
  empty?: string
  /** Value font size in px (line height 1.1). */
  size?: number
  tone?: 'you'
  reduced?: boolean
  className?: string
  align?: 'left' | 'center'
}) {
  return (
    <div className={`pointer-events-none ${align === 'center' ? 'text-center' : ''} ${className}`} data-readout aria-live="polite">
      <p className={`font-[family-name:var(--font-ui)] text-[12px] font-semibold uppercase leading-[16px] tracking-[0.14em] ${tone === 'you' ? 'text-bronze' : 'text-muted'}`}>
        {label}
      </p>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={value ?? '∅'}
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0.1 : 0.18, ease: [0.16, 1, 0.3, 1] }}
          className={`mt-2 inline-block ${align === 'center' ? '' : ''}`}
        >
          {value ? (
            <>
              <span className="halo-text block whitespace-nowrap font-[family-name:var(--font-text)] font-semibold text-ink" style={{ fontSize: size, lineHeight: 1.1 }} data-readout-value>
                {value}
              </span>
              <span className="mt-2 block h-[3px] w-[64px] bg-bronze" style={align === 'center' ? { marginInline: 'auto' } : undefined} aria-hidden />
            </>
          ) : (
            <span className="halo-text block font-[family-name:var(--font-text)] italic text-muted" style={{ fontSize: Math.round(size * 0.5), lineHeight: 1.3 }}>
              {empty}
            </span>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
