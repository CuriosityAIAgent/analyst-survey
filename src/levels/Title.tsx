'use client'
import { motion, useReducedMotion } from 'motion/react'

export default function Title({ onBegin }: { onBegin: () => void }) {
  const reduce = useReducedMotion()
  const rise = (delay: number) =>
    reduce
      ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.3, delay: delay * 0.4 } }
      : {
          initial: { opacity: 0, y: 18 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] as const },
        }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <motion.p {...rise(0.15)} className="text-[12px] uppercase tracking-[0.3em] text-ink2/70">
        J.P. Morgan Private Bank
      </motion.p>

      <motion.h1 {...rise(0.3)} className="display mt-5 text-[64px] leading-[0.95] text-snow sm:text-[88px]">
        The Ascent
      </motion.h1>

      <motion.p {...rise(0.5)} className="mt-5 max-w-[30ch] text-[17px] leading-relaxed text-ink2">
        You&apos;re part way up. Someone starts the same climb in September.
      </motion.p>

      <motion.button
        {...rise(0.75)}
        type="button"
        onClick={onBegin}
        whileTap={reduce ? undefined : { scale: 0.97 }}
        className="mt-10 min-h-[56px] rounded-full px-9 text-[16px] font-semibold"
        style={{ background: 'var(--color-gold)', color: '#0A1430' }}
      >
        Begin the climb
      </motion.button>

      <motion.p {...rise(0.95)} className="mt-5 text-[13px] text-ink2/60">
        Twelve minutes. Mostly tapping.
      </motion.p>

      <motion.p {...rise(1.15)} className="mt-10 max-w-[34ch] text-[12px] leading-relaxed text-ink2/45">
        A prototype. Nothing is sent anywhere yet — your answers stay in this browser.
      </motion.p>
    </div>
  )
}
