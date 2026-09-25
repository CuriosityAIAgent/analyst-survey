'use client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import { motion, useReducedMotion } from 'motion/react'
import { useFlow, GRAPH, CARD } from './store'
import { shown } from './logic'
import { SECTIONS, type Answer } from './types'
import { AUTO, isAnswered, Multi, Pick, Rank, Slider, Swipe, Text, Tokens } from './Cards'
import { Visual } from './Visual'
import { LadderRungs } from './LadderRungs'

const Scene = dynamic(() => import('@/scene/Scene'), { ssr: false })

export default function Player() {
  const { started, path, answers, seed, begin, answer, advance, back, reset } = useFlow()
  const reduce = useReducedMotion()
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    document.documentElement.dataset.skin = 'survey'
    setMounted(true)
  }, [])

  const id = path[path.length - 1]
  const raw = id === 'END' ? null : CARD.get(id) ?? null
  // the card as this respondent sees it: shuffled options where the card asks
  const card = useMemo(() => (raw ? shown(raw, seed) : null), [raw, seed])
  const v = card ? answers[card.id] : undefined

  // Every advance names the card it came from. The store ignores one whose card
  // is no longer current, and refuses to leave an unanswered card, so neither a
  // double tap nor a stale timer can skip a question.
  const go = useCallback((from?: string) => advance(from ?? useFlow.getState().path.at(-1)), [advance])

  useEffect(() => {
    window.scrollTo({ top: 0 })
    // announce a new card by moving focus to its question, not by a live region
    // that would re-read the whole card on every tap
    requestAnimationFrame(() => document.querySelector<HTMLElement>('main h1[tabindex="-1"]')?.focus({ preventScroll: true }))
  }, [id])

  const sectionIdx = card ? SECTIONS.findIndex((s) => s.id === card.section) : SECTIONS.length

  /* The climber is on every screen, but moves once per SECTION, never per card:
     a figure creeping up with each answer is a live progress bar, which an
     adaptive survey cannot keep honest (Villar, Callegaro & Yang 2013). It sits
     in a band below the card, the same for everyone in that section, so it is
     not a comparison standard for any one answer (Couper et al. 2007). */
  const scene = !started ? 0 : !card ? 1 : Math.max(0, sectionIdx) / (SECTIONS.length - 1)

  if (!mounted) return <main className="min-h-dvh bg-paper" />

  const shell = (children: React.ReactNode) => (
    <main className="relative min-h-dvh bg-paper pb-[140px] sm:pb-[190px]">
      <Scene t={scene} successor={scene === 1 ? 1 : 0} skin="survey" level={Math.round(scene * 8)} />
      <div className="relative z-10">{children}</div>
    </main>
  )

  /* ---------------- title */
  if (!started) {
    return shell(
      <div className="mx-auto flex min-h-[78dvh] max-w-[620px] flex-col justify-center px-6">
        <p className="eyebrow">J.P. Morgan Private Bank</p>
        <h1 className="display mt-5 text-[54px] leading-[0.98] text-ink sm:text-[76px]">The Ascent</h1>
        <p className="mt-5 max-w-[30ch] text-[19px] leading-[1.45] text-ink-2">
          You came through A2A and made it. Help the next cohort get there faster.
        </p>
        <div className="mt-9 flex flex-wrap items-center gap-5">
          <button type="button" className="btn" onClick={begin}>Begin the climb</button>
          <span className="font-[family-name:var(--font-ui)] text-[14px] text-muted">
            About {Math.round(GRAPH.mainPathSeconds / 60)} minutes. Mostly thumbs.
          </span>
        </div>
        <p className="mt-10 max-w-[48ch] border-t border-rule-soft pt-5 text-[13px] leading-relaxed text-muted">
          We are evaluating the programme, not you, your old team or your manager.
          &lsquo;It depends&rsquo; is a fair answer. A prototype: nothing is sent anywhere yet.
        </p>
      </div>,
    )
  }

  /* ---------------- end */
  if (!card) {
    return shell(
      <div className="mx-auto flex min-h-[70dvh] max-w-[620px] flex-col justify-center px-6">
        <p className="eyebrow">The summit</p>
        <h1 className="display mt-4 text-[44px] leading-[1.02] text-ink">That&apos;s the route.</h1>
        <p className="mt-4 max-w-[34ch] text-[18px] leading-[1.5] text-ink-2">
          Someone starts the same climb in September. What you said just changed it.
        </p>
        <Route answers={answers} path={path} />
        <div className="mt-8 flex gap-3">
          <button type="button" className="btn-quiet" onClick={back}>Back</button>
          <button type="button" className="btn-quiet" onClick={reset}>Start again</button>
        </div>
      </div>,
    )
  }

  const ready = isAnswered(card, v)
  const set = (x: Answer) => answer(card.id, x)
  const props = { card, value: v as never, set: set as never, done: go }

  return shell(
    <div className="mx-auto max-w-[620px] px-5 pt-5">
      {/* Instagram-style segments: one per section */}
      <div className="flex gap-1" aria-hidden>
        {SECTIONS.map((s, i) => (
          <span key={s.id} className="h-[3px] flex-1 overflow-hidden rounded-full bg-rule-soft">
            <span className="block h-full bg-ink transition-[width] duration-500"
              style={{ width: i < sectionIdx ? '100%' : i === sectionIdx ? '45%' : '0%' }} />
          </span>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between">
        <button type="button" className="font-[family-name:var(--font-ui)] text-[14px] text-muted disabled:opacity-0"
          onClick={back} disabled={path.length <= 1} aria-label="Back">← Back</button>
        <span data-level-name className="eyebrow">{SECTIONS[sectionIdx]?.title}</span>
      </div>

      <motion.section key={card.id}
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduce ? 0.12 : 0.24, ease: [0.16, 1, 0.3, 1] }}
          className="panel mt-6 px-1 pb-4"
        >
          {card.visual && !card.scene && <Visual id={card.id} brief={card.visual} className="mb-6" />}
          <h1 tabIndex={-1} className="display text-[30px] leading-[1.1] text-ink sm:text-[38px]">{card.prompt}</h1>
          {card.sub && <p className="mt-3 text-[17px] leading-[1.45] text-ink-2">{card.sub}</p>}
          {card.scene === 'ladder' && <div className="mt-6"><LadderRungs /></div>}

          <div className="mt-7">
            {card.kind === 'pick' && <Pick {...props} />}
            {card.kind === 'multi' && <Multi {...props} />}
            {card.kind === 'slider' && <Slider {...props} />}
            {card.kind === 'swipe' && <Swipe {...props} />}
            {card.kind === 'rank' && <Rank {...props} />}
            {card.kind === 'tokens' && <Tokens {...props} />}
            {card.kind === 'text' && <Text {...props} />}
          </div>

          {!AUTO.has(card.kind) && (
            <div className="mt-8 flex items-center gap-4">
              <button type="button" className="btn" disabled={!ready} onClick={() => go(card.id)}>
                {card.kind === 'show' ? 'Continue' : 'Next'}
              </button>
              {card.optional && card.kind !== 'show' && (
                <button type="button" className="font-[family-name:var(--font-ui)] text-[14px] text-muted underline"
                  onClick={() => go(card.id)}>Skip</button>
              )}
            </div>
          )}
        </motion.section>
    </div>,
  )
}

/* The summit plays back the four wrap-up stems from the respondent's own
   answers, in their words from the cards. No score and no badge: the payoff is
   seeing what they said, which is what they gave their time for. */
function Route({ answers, path }: { answers: Record<string, Answer>; path: string[] }) {
  const on = new Set(path)
  const label = (cardId: string, opt: unknown) =>
    CARD.get(cardId)?.options?.find((o) => o.id === opt)?.label
  const vote = on.has('vote') ? (answers.vote as Record<string, string[]> | undefined) : undefined
  const one = path.find((x) => x.startsWith('wrap_one_'))
  const lines: [string, string | undefined][] = [
    ['More of', vote?.green?.map((x) => label('vote', x)).filter(Boolean).join('; ')],
    ['Less time on', on.has('red_less') ? label('red_less', answers.red_less) : undefined],
    ['No one graduates without', on.has('i2_central')
      ? (answers.i2_central as string[] | undefined)?.map((x) => label('i2_central', x)).filter(Boolean).join('; ')
      : undefined],
    ['If only one change', one ? label(one, answers[one]) : undefined],
  ]
  const shown = lines.filter(([, v]) => v)
  if (!shown.length) return null
  return (
    <dl className="mt-8 grid max-w-[46ch] gap-3 border-t border-rule-soft pt-5">
      {shown.map(([k, v]) => (
        <div key={k}>
          <dt className="eyebrow">{k}</dt>
          <dd className="mt-1 text-[17px] leading-snug text-ink">{v}</dd>
        </div>
      ))}
    </dl>
  )
}
