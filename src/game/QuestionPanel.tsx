'use client'
/* QuestionPanel: the desk panel (design 3.3). Always plain paper, never the
   camp tint: the question is always clean ink on white. Top to bottom:

     1 kicker    Archivo 12 caps, bronze: 'CAMP II · WHO DOES THE WORK'
                 (+ an ABOUT YOU pill on self-questions; follow-ups read
                 'FOLLOW-UP · CAMP II' with the forest rookie beside it)
     2 question  the h1 (data-prompt, focused on every step change),
                 Source Serif 4 600, 30/38 (deskCompact 26/33)
     3 how       'HOW TO ANSWER', the gesture in plain words, then the keys
                 as KeyCaps (fine pointer only)
     4 status    Checklist rows, a summary, 'Holding: …' (screens that pass it)
     5 why       'WHY WE ASK', Source Serif italic, muted; optional
     6 slot      panelSlot (S11's "Their kit" card after arrival)

   When the panel is short, the why line collapses to a toggle first, then the
   checklist to its summary; the question and how-line are never clipped.
   The action row (PanelActions) and the camp route are separate elements,
   placed under the panel by Frame's grid: they come AFTER the stage in the
   DOM, so Tab runs question -> items -> targets -> Back / primary. */
import { useLayoutEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { Ask } from './content'
import Checklist, { type StatusRow } from './Checklist'
import { KeyText } from './KeyCap'
import KeyCap from './KeyCap'
import Figure from './Figure'

export type QuestionPanelProps = {
  ask: Ask
  compact: boolean
  /** A fine pointer: show the keys line. */
  fine: boolean
  status?: StatusRow[]
  summary?: ReactNode
  holding?: ReactNode
  /** Replaces ask.keys (e.g. keys that depend on the state). */
  keys?: ReactNode
  /** Replaces ask.how; null hides the whole how block (label, line, keys). */
  how?: ReactNode | null
  panelSlot?: ReactNode
  /** h1 for screens, h2 for a follow-up's panel. */
  heading?: 'h1' | 'h2'
  headingId?: string
}

export default function QuestionPanel(p: QuestionPanelProps) {
  const a = p.ask
  const box = useRef<HTMLDivElement | null>(null)
  // 0 all; 1 why as a toggle; 2 checklist as summary only; 3 no list/keys
  const base = p.compact ? 1 : 0
  const [level, setLevel] = useState(base)
  const [whyOpen, setWhyOpen] = useState(false)
  const H = p.heading ?? 'h1'

  // fit: step the level up until nothing overflows; start over on resize
  useLayoutEffect(() => {
    const el = box.current
    if (!el) return
    if (el.scrollHeight > el.clientHeight + 1 && level < 3) setLevel((l) => Math.min(3, l + 1))
  })
  useLayoutEffect(() => {
    const el = box.current
    if (!el) return
    let w = el.clientWidth, h = el.clientHeight
    const ro = new ResizeObserver(() => {
      if (el.clientWidth === w && el.clientHeight === h) return
      w = el.clientWidth; h = el.clientHeight
      setLevel(base)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [base])

  const kicker = a.followup ? `Follow-up · ${a.camp}` : a.kickerAlone || !a.camp ? a.kicker : `${a.camp} · ${a.kicker}`
  const whyInline = !!a.why && level === 0
  const whyToggle = !!a.why && level >= 1
  const keys = p.keys ?? (a.keys ? <KeyText text={a.keys} /> : null)

  return (
    <div ref={box} className="flex h-full min-h-0 flex-col overflow-hidden" data-question-panel data-fit-level={level}>
      <div className="flex min-h-[24px] items-center gap-2">
        {a.followup && <Figure variant="rookie" size={40} className="-my-2 shrink-0" />}
        <p className="font-[family-name:var(--font-ui)] text-[12px] font-semibold uppercase leading-[16px] tracking-[0.14em] text-bronze" data-kicker>
          {kicker}
        </p>
        {a.self && (
          <span className="rounded-[2px] border border-bronze px-[6px] py-[2px] font-[family-name:var(--font-ui)] text-[10px] font-semibold uppercase leading-[12px] tracking-[0.14em] text-bronze" data-about-you>
            About you
          </span>
        )}
      </div>

      <H
        id={p.headingId}
        tabIndex={-1}
        style={{ outline: 'none' }}
        className={`mt-3 font-[family-name:var(--font-text)] font-semibold text-ink ${p.compact ? 'text-[26px] leading-[33px]' : 'text-[30px] leading-[38px]'}`}
        data-prompt
      >
        {a.question}
      </H>

      {p.how !== null && <div className="mt-5" data-how>
        <p className="font-[family-name:var(--font-ui)] text-[11px] font-semibold uppercase leading-[14px] tracking-[0.14em] text-muted">How to answer</p>
        <p className={`mt-1 font-[family-name:var(--font-ui)] text-ink-2 ${p.compact ? 'text-[15px] leading-[22px]' : 'text-[16px] leading-[24px]'}`} data-helper>
          {p.how === undefined ? a.how : p.how}
        </p>
        {p.fine && keys && level < 3 && (
          <p className={`keys mt-1 font-[family-name:var(--font-ui)] text-ink-2 ${p.compact ? 'text-[14px] leading-[24px]' : 'text-[15px] leading-[26px]'}`} data-keys>
            {keys}
          </p>
        )}
      </div>}

      {a.list && level < 3 && (
        <div className="mt-5" data-what-youll-do>
          <p className="font-[family-name:var(--font-ui)] text-[11px] font-semibold uppercase leading-[14px] tracking-[0.14em] text-muted">What you&rsquo;ll do</p>
          <ul className="mt-1 font-[family-name:var(--font-ui)] text-[14px] leading-[20px] text-ink-2">
            {a.list.map((x) => (
              <li key={x} className="flex gap-2"><span className="text-rule" aria-hidden>·</span>{x}</li>
            ))}
          </ul>
        </div>
      )}

      {(p.status?.length || p.summary || p.holding) ? (
        <div className="mt-5">
          <Checklist rows={p.status} summary={p.summary} holding={p.holding} collapsed={level >= 2} />
        </div>
      ) : null}

      {whyInline && (
        <div className="mt-5" data-why>
          <p className="font-[family-name:var(--font-ui)] text-[11px] font-semibold uppercase leading-[14px] tracking-[0.14em] text-muted">Why we ask</p>
          <p className="mt-1 font-[family-name:var(--font-text)] text-[15px] italic leading-[22px] text-muted">{a.why}</p>
        </div>
      )}
      {whyToggle && (
        <div className="mt-4" data-why>
          <button type="button" className="font-[family-name:var(--font-ui)] text-[11px] font-semibold uppercase leading-[20px] tracking-[0.14em] text-muted underline-offset-2 hover:underline"
            aria-expanded={whyOpen} onClick={() => setWhyOpen((o) => !o)}>
            Why we ask {whyOpen ? '−' : '+'}
          </button>
          {whyOpen && <p className="mt-1 font-[family-name:var(--font-text)] text-[15px] italic leading-[22px] text-muted">{a.why}</p>}
        </div>
      )}

      {p.panelSlot ? <div className="mt-5 min-h-0">{p.panelSlot}</div> : null}
    </div>
  )
}

/* ------------------------------------------------------------ action row */

/** The panel's action row: Back (quiet) and the primary, ALWAYS present on
    desk (disabled-looking until valid, with the reason). */
export function PanelActions({ onBack, canBack, primary, onPrimary, valid, reason, quiet, testId = 'primary', custom, fine, backTestId = 'back', compact }: {
  onBack: () => void
  canBack: boolean
  /** The primary's label; null = no primary (S11). */
  primary: string | null
  onPrimary: () => void
  valid: boolean
  /** Why it is not valid yet ('Place 2 more'), on hover and to screen readers. */
  reason?: string
  quiet?: boolean
  testId?: string
  /** A screen's own footer (S03), shown in place of the primary. */
  custom?: ReactNode
  fine: boolean
  backTestId?: string
  /** deskCompact: the 340px panel. A narrower Back and tighter padding, so
      'Start walking' or 'Leave it blank' and the ↵ cap fit (284px row). */
  compact?: boolean
}) {
  return (
    <div className={`flex h-[56px] items-center ${compact ? 'gap-2' : 'gap-3'}`} data-panel-actions>
      {canBack && (
        <button
          type="button"
          onClick={onBack}
          className={`btn-quiet h-[48px] shrink-0 ${compact ? 'w-[84px] !px-3' : 'w-[112px]'}`}
          data-testid={backTestId}
        >
          Back
        </button>
      )}
      {custom !== undefined ? (
        <div className="flex min-w-0 flex-1 items-center [&>div]:h-auto [&>div]:flex-1 [&>div]:px-0">{custom}</div>
      ) : primary !== null ? (
        <button
          type="button"
          className={`${quiet ? 'btn-quiet' : 'btn'} flex h-[48px] min-w-0 flex-1 items-center justify-center ${compact ? 'gap-2 !px-3' : 'gap-3'}`}
          style={valid ? undefined : { background: '#E5E2DC', color: '#6B6761', borderColor: '#E5E2DC', cursor: 'not-allowed' }}
          aria-disabled={!valid || undefined}
          title={!valid && reason ? reason : undefined}
          onClick={() => { if (valid) onPrimary() }}
          data-testid={testId}
          data-valid={valid ? 'true' : 'false'}
        >
          <span className="truncate">{primary}</span>
          {fine && valid && <KeyCap k="Enter" quiet={!quiet} />}
        </button>
      ) : <div className="flex-1" />}
    </div>
  )
}
