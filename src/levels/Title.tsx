'use client'
import { motion, useReducedMotion } from 'motion/react'

export default function Title({ onBegin }: { onBegin: () => void }) {
  const reduce = useReducedMotion()
  const rise = (delay: number) =>
    reduce
      ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.3, delay: delay * 0.4 } }
      : {
          initial: { opacity: 0, y: 14 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] as const },
        }

  return (
    <div className="flex min-h-dvh items-end justify-center px-4 pb-4 sm:items-center sm:pb-0">
      <motion.div {...rise(0.1)} className="panel w-full max-w-[680px] px-6 py-10 sm:px-12 sm:py-14">
        <motion.p {...rise(0.2)} className="eyebrow">J.P. Morgan Private Bank</motion.p>

        <motion.h1 {...rise(0.32)} className="display mt-6 text-[52px] text-ink sm:text-[72px]">
          The Ascent
        </motion.h1>

        <motion.p {...rise(0.48)} className="mt-5 max-w-[34ch] text-[19px] leading-[1.45] text-ink-2">
          You made it through. Someone starts the same climb in September.
        </motion.p>

        <motion.div {...rise(0.66)} className="mt-9 flex flex-wrap items-center gap-5">
          <button type="button" onClick={onBegin} className="btn">Begin the climb</button>
          <span className="font-[family-name:var(--font-ui)] text-[14px] text-muted">
            Twelve minutes. Mostly tapping.
          </span>
        </motion.div>

        <motion.p {...rise(0.84)}
          className="mt-10 max-w-[52ch] border-t border-rule-soft pt-5 text-[13px] leading-relaxed text-muted">
          A prototype. Nothing is sent anywhere yet, and your answers stay in this browser.
        </motion.p>
      </motion.div>
    </div>
  )
}
