'use client'
/* S03 · Camp I · "The signpost" (mechanic: text).

   "No one reaches the top without having…" The respondent finishes the line
   by carving it into the signpost's arm: the arm IS the field. A transparent
   textarea lies exactly over the arm's text area (SIGNPOST_TEXT from the
   art), and the same text is drawn beneath it in bronze, letter by letter,
   each new letter settling in over 120ms. The ghost text is only
   '…having ______', with no example answers to anchor on.

   One line, 60 characters, optional: 'Leave it blank' stores rule.skipped.
   The letters shrink to keep the line on the arm (one line up to 24px, two
   lines down to 16px, the size below which iOS zooms). Native dictation works (it is a plain textarea).
   Enter finishes the line.

   Layout at 390x660: the signpost stands on a foreground spur, arm in the upper half, arm
   text between y~172 and ~217, so the keyboard never covers it (the design
   asks for the field top at or above 300px). */
import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import Frame from '../Frame'
import Figure from '../Figure'
import { Art } from '../art'
import { SIGNPOST_TEXT } from '../art/props'
import { useGameCtx } from '../context'
import { sfx } from '../feel'
import type { StepProps } from '../types'

const MAX = 60
const GHOST = '…having ______'
const BRONZE = '#7A3E12'
const INK = '#0D0C0B'
/** The signpost art: drawn H px tall, shifted left a little so the post
    stands near the stage edge (about x 32) with the whole arm on screen,
    its tip just short of the right edge. */
const H = 160
const SHIFT = 22
const TIP_GAP = 6
/** Width of the foreground spur's flat top. */
const SPUR_W = 118
const FONT = 'var(--font-display)'
const MAX_PX = 24
const MIN_PX = 16 // never below 16px: iOS Safari zooms into smaller fields on focus

/* ------------------------------------------------------------ fitting the line */

let measureCtx: CanvasRenderingContext2D | null = null
function lineCount(text: string, px: number, width: number, family: string): number {
  if (typeof document === 'undefined') return 1
  measureCtx = measureCtx ?? document.createElement('canvas').getContext('2d')
  const c = measureCtx
  if (!c) return Math.ceil((text.length * px * 0.52) / width)
  c.font = `${px}px ${family}`
  const words = text.split(/(\s+)/)
  let lines = 1, w = 0
  for (const part of words) {
    const pw = c.measureText(part).width
    if (/^\s+$/.test(part)) { w += pw; continue }
    if (w > 0 && w + pw > width) { lines += 1; w = pw }
    else w += pw
    // a single word wider than the line breaks inside it
    while (w > width) { lines += 1; w -= width }
  }
  return lines
}

/** The largest size that keeps the text on the arm: one line if it fits at
    24px, else two lines at up to ~19.5px, down to 16px. */
function fit(text: string, width: number, height: number, family: string): { px: number; lines: number } {
  const t = text || GHOST
  const w = width * 0.96
  for (let px = MAX_PX; px >= MIN_PX; px -= 0.5) {
    const lines = lineCount(t, px, w, family)
    if (lines * px * 1.12 <= height) return { px, lines }
  }
  return { px: MIN_PX, lines: Math.max(2, lineCount(t, MIN_PX, w, family)) }
}

/* ------------------------------------------------------------ the spur */

/** A spur of rock in the foreground, from the post's footing down to the
    bottom of the stage: the signpost is planted on it, the rookie stands on
    it, and the camp's face lies beyond. Top at y = top, px coordinates. */
function spur(top: number, bottom: number, w: number): string {
  const edge: [number, number][] = [
    [w, top], [w + 6, top + 10], [w + 2, top + 26], [w + 14, top + 44], [w + 10, top + 70],
    [w + 22, top + 104], [w + 18, top + 150], [w + 30, top + 210], [w + 26, top + 280], [w + 38, bottom + 2],
  ].filter(([, y]) => y <= bottom + 2) as [number, number][]
  const last = edge[edge.length - 1]
  if (last[1] < bottom + 2) edge.push([last[0] + 4, bottom + 2])
  return `M -2 ${top} ${edge.map(([x, y]) => `L ${x} ${y}`).join(' ')} L -2 ${bottom + 2} Z`
}
function spurHatch(top: number, bottom: number, w: number): string {
  let d = ''
  for (let y = top + 16, i = 0; y < bottom - 6; y += 19, i++) {
    const x = w - 6 + Math.min(34, (y - top) * 0.11) + (i % 2 ? 3 : -2)
    d += `M ${x} ${y} l -10 5 M ${x - 3} ${y + 7} l -7 3.5 `
  }
  return d
}

/* ------------------------------------------------------------ screen */

export default function S03(p: StepProps) {
  const ctx = useGameCtx()
  const a = p.answers
  const [text, setText] = useState<string>(() => a['rule.text'] ?? '')
  const keys = useRef<number>(a['rule.keystrokes'] ?? 0)
  const taRef = useRef<HTMLTextAreaElement | null>(null)
  const box = useRef<HTMLDivElement | null>(null)
  const [width, setWidth] = useState(390)
  const [stageH, setStageH] = useState(468)
  const [family, setFamily] = useState('"Bodoni Moda", Georgia, serif')
  const [focused, setFocused] = useState(false)

  useLayoutEffect(() => {
    const el = box.current
    if (!el) return
    const measure = () => { setWidth(el.clientWidth); setStageH(el.clientHeight) }
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    measure()
    // the resolved display family, so canvas measures the same face
    setFamily(getComputedStyle(el).getPropertyValue('--font-display').trim() || family)
    return () => ro.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* the signpost's geometry at this width */
  const artW = width + SHIFT - TIP_GAP
  const k = H / 64
  const vbW = Math.min(640, Math.round((64 * artW) / H))
  const scaleX = artW / vbW // == k up to rounding
  const area = {
    left: SIGNPOST_TEXT.x0 * scaleX - SHIFT,
    right: artW - SHIFT - SIGNPOST_TEXT.x1 * scaleX,
    top: SIGNPOST_TEXT.y0 * k,
    bottom: SIGNPOST_TEXT.y1 * k,
  }
  const areaW = Math.max(120, area.right - area.left)
  const areaH = area.bottom - area.top
  const { px, lines } = useMemo(() => fit(text, areaW, areaH, family), [text, areaW, areaH, family])
  const lh = px * 1.12
  const padTop = Math.max(0, (areaH - Math.min(lines, 2) * lh) / 2)

  const trimmed = text.trim()
  const typed = trimmed.length > 0

  const onChange = (v: string) => {
    const clean = v.replace(/[\r\n]+/g, ' ').slice(0, MAX)
    keys.current += 1
    if (clean.length > text.length) sfx('type', ctx.sound)
    setText(clean)
    p.setMany({ 'rule.text': clean, 'rule.keystrokes': keys.current, 'rule.skipped': false })
  }

  const finish = () => {
    if (ctx.busy) return
    if (typed) {
      p.setMany({ 'rule.text': trimmed, 'rule.skipped': false, 'rule.keystrokes': keys.current })
      p.log('carve', { chars: trimmed.length, keystrokes: keys.current })
    } else {
      p.setMany({ 'rule.text': '', 'rule.skipped': true, 'rule.keystrokes': keys.current })
      p.log('skip', {})
    }
    taRef.current?.blur()
    p.next()
  }

  const textStyle: CSSProperties = {
    fontFamily: FONT,
    fontSize: px,
    lineHeight: `${lh}px`,
    letterSpacing: '0.01em',
    paddingTop: padTop,
    whiteSpace: 'pre-wrap',
    overflowWrap: 'break-word',
    wordBreak: 'normal',
  }

  const footer = (
    <div className="flex h-[60px] shrink-0 items-center gap-3 px-5">
      {typed ? (
        <button type="button" className="btn w-full" onClick={finish} data-testid="primary" data-action="continue">Continue</button>
      ) : (
        <button type="button" className="btn-quiet w-full" onClick={finish} data-testid="primary" data-action="leave-blank">Leave it blank</button>
      )}
    </div>
  )

  const left = MAX - text.length

  return (
    <Frame id="S03" valid onContinue={finish} footer={footer}>
      <div ref={box} className="absolute inset-0 overflow-hidden" data-signpost>
        <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox={`0 0 ${width} ${stageH}`} aria-hidden>
          {/* the spur the post is planted on; the camp's face lies beyond */}
          <path d={spur(8 + H - 1, stageH, SPUR_W)} fill="#F8F7F4" stroke={INK} strokeWidth={1} strokeLinejoin="round" />
          <path d={spurHatch(8 + H - 1, stageH, SPUR_W)} stroke="#8C857A" strokeWidth={0.75} fill="none" />
          {/* the rookie stands by the post and reads the sign */}
          <Figure as="g" x={SPUR_W - 26} y={8 + H - 1} size={62} facing={-1} pose="stand" />
        </svg>
        {/* the post and its arm, over the spur */}
        <div className="pointer-events-none absolute top-2" style={{ left: -SHIFT, width: artW, height: H }}>
          <Art id="signpost" width={artW} height={H} />
        </div>

        {/* the answer box: plainly a place to type (the carved-on-the-arm field read as nothing to do) */}
        <label className="absolute left-5 right-5 block" style={{ top: 8 + H + 18 }}>
          <span className="mb-1 block font-[family-name:var(--font-ui)] text-[13px] font-semibold text-ink">Your answer</span>
          <textarea
            ref={taRef}
            value={text}
            maxLength={MAX}
            rows={2}
            spellCheck
            autoCapitalize="none"
            autoComplete="off"
            enterKeyHint="done"
            placeholder="Type a few words…"
            aria-describedby="s03-left"
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (typed) finish(); else taRef.current?.blur() } }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className="block h-[76px] w-full resize-none rounded-[2px] border-[1.5px] border-ink bg-ground px-3 py-2 font-[family-name:var(--font-text)] text-[17px] leading-[24px] text-ink placeholder:text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-forest"
            data-testid="rule-input"
          />
        </label>
        {/* a count, near the end of the 60 */}
        <p id="s03-left" className="absolute font-[family-name:var(--font-ui)] text-[12px] leading-[14px] text-muted"
          style={{ left: 20, top: 8 + H + 18 + 20 + 76 + 6, opacity: text.length >= 40 ? 1 : 0, transition: 'opacity 150ms' }}
          aria-live="polite">
          {text.length >= 40 ? `${left} left` : ''}
        </p>
      </div>
    </Frame>
  )
}

/* Letters drawn in bronze, each settling in over 120ms when it first appears
   (opacity and colour only, so the line wraps exactly as the textarea does). */
function Carved({ text, reduced }: { text: string; reduced: boolean }) {
  return (
    <>
      {Array.from(text).map((ch, i) => (
        <span
          key={i}
          ref={(el) => {
            if (!el || el.dataset.cut || reduced) { if (el) el.dataset.cut = '1'; return }
            el.dataset.cut = '1'
            el.animate?.([{ opacity: 0, color: INK }, { opacity: 1, color: BRONZE }], { duration: 120, easing: 'ease-out' })
          }}
        >{ch}</span>
      ))}
    </>
  )
}
