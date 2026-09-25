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
   asks for the field top at or above 300px).

   Desk (design 5, S03): the 3D signpost stands on Camp I's ground, about
   400px tall, the rookie beside it reading the sign; the answer field sits
   to the right of the arm ('…having' then the field, Source Serif 22 with a
   visible underline), focused on arrival, a live count under it. What is
   typed is carved onto the arm's plaque in bronze as it is typed. The panel
   primary is 'Leave it blank' (quiet) until there is text, then 'Continue';
   Enter in the field continues once something is written. Same stored
   rule.text / rule.skipped / rule.keystrokes. */
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import Frame from '../Frame'
import Figure from '../Figure'
import { Art } from '../art'
import { SIGNPOST_TEXT } from '../art/props'
import { SCENE_ANCHORS } from '../art/scenes'
import { useLayoutInfo } from '../layout'
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
function lineCount(text: string, px: number, width: number, family: string, style = ''): number {
  if (typeof document === 'undefined') return 1
  measureCtx = measureCtx ?? document.createElement('canvas').getContext('2d')
  const c = measureCtx
  if (!c) return Math.ceil((text.length * px * 0.52) / width)
  c.font = `${style}${px}px ${family}`
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

/** Desk: the largest carving size (20px down to 11px) at which the whole
    answer fits the plaque in at most three lines. Never an ellipsis: at the
    floor the words still wrap in full (60 characters fit three lines). */
const CARVE_MAX = 20
const CARVE_MIN = 11
const CARVE_LH = 1.1
function fitCarve(text: string, width: number, height: number, family: string): number {
  if (!text) return CARVE_MAX
  for (let px = CARVE_MAX; px > CARVE_MIN; px -= 0.5) {
    const lines = lineCount(text, px, width, family, 'italic 600 ')
    if (lines <= 3 && lines * px * CARVE_LH <= height) return px
  }
  return CARVE_MIN
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

  const L = useLayoutInfo()
  if (L.desk) {
    return (
      <Frame id="S03" host="native" valid onContinue={finish}
        continueLabel={typed ? 'Continue' : 'Leave it blank'} continueQuiet={!typed}>
        {/* the count lives under the field (s03-count), so the panel has no second one */}
        <DeskSignpost text={text} typed={typed} onChange={onChange} finish={finish} reduced={p.reduced}
          covered={p.covered} compact={L.compact} />
      </Frame>
    )
  }

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
            placeholder="Type one experience…"
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

/* ------------------------------------------------------------ desk */

/** The signpost render (449x478): the arm's plaque and the post's footing,
    in render px. */
const SP = { w: 449, h: 478, plaque: { x: 108, y: 97, w: 194, h: 58 }, foot: 432, tip: 360 }
const CAMP1_GROUND = SCENE_ANCHORS['scene-camp1'].ground

function DeskSignpost({ text, typed, onChange, finish, reduced, covered, compact }: {
  text: string
  typed: boolean
  onChange: (v: string) => void
  finish: () => void
  reduced: boolean
  covered: boolean
  compact: boolean
}) {
  const box = useRef<HTMLDivElement | null>(null)
  const ta = useRef<HTMLTextAreaElement | null>(null)
  const [g, setG] = useState<{ g: number; w: number } | null>(null)
  const [focused, setFocused] = useState(false)
  const [textFamily, setTextFamily] = useState('Georgia, serif')

  // where Camp I's ground falls in this box (the scene: 390x660, xMidYMax meet)
  useLayoutEffect(() => {
    const el = box.current
    const frame = el?.closest<HTMLElement>('[data-frame]')
    if (!el || !frame) return
    const measure = () => {
      const a = frame.getBoundingClientRect(), b = el.getBoundingClientRect()
      const sc = Math.min(a.width / 390, a.height / 660)
      setG({ g: a.height - (660 - CAMP1_GROUND) * sc - (b.top - a.top), w: b.width })
    }
    measure()
    setTextFamily(getComputedStyle(el).getPropertyValue('--font-text').trim() || 'Georgia, serif')
    const ro = new ResizeObserver(measure)
    ro.observe(frame); ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // the field is focused on arrival (after the prompt takes focus)
  useEffect(() => {
    if (covered) return
    const t = window.setTimeout(() => ta.current?.focus({ preventScroll: true }), 400)
    return () => clearTimeout(t)
  }, [covered])

  const G = g?.g ?? 480
  const W = g?.w ?? 1000
  const SH = Math.max(260, Math.min(compact ? 360 : 420, G * 0.78))
  const s = SH / SP.h
  const x0 = Math.max(32, W * 0.07)
  const top = G - SP.foot * s
  const plaque = { left: x0 + SP.plaque.x * s, top: top + SP.plaque.y * s, width: SP.plaque.w * s, height: SP.plaque.h * s }
  const rookie = Math.round(SH * 0.4)
  const fieldLeft = x0 + SP.tip * s + 40
  const fieldW = Math.min(600, W - fieldLeft - 40)
  // the carving shrinks to stay on the plaque (three lines at most, never cut)
  // clear of the brass studs at both ends of the plaque
  const carveW = plaque.width * 0.8
  const carveH = plaque.height * 0.84
  const carvePx = useMemo(() => fitCarve(text, carveW, carveH, textFamily), [text, carveW, carveH, textFamily])

  return (
    <div ref={box} className="absolute inset-0" style={{ opacity: g ? 1 : 0 }} data-signpost data-s03-desk>
      <div className="pointer-events-none absolute" style={{ left: x0, top, width: SP.w * s, height: SH }} aria-hidden>
        <Art id="signpost" width={SP.w * s} height={SH} />
      </div>
      {/* the words, carved onto the plaque in bronze as they are typed */}
      <div className="pointer-events-none absolute flex items-center justify-center overflow-hidden px-2 text-center" aria-hidden
        style={{ ...plaque, fontFamily: 'var(--font-text)', fontStyle: 'italic', fontWeight: 600, fontSize: carvePx, lineHeight: CARVE_LH, color: BRONZE, transform: 'rotate(-1.6deg)' }}
        data-carved>
        <span style={{ overflowWrap: 'break-word', maxWidth: carveW }}>
          <Carved text={text} reduced={reduced} />
        </span>
      </div>
      {/* the rookie beside the post, reading the sign */}
      <div className="pointer-events-none absolute" style={{ left: x0 + SP.tip * s * 0.62, top: G - rookie }} aria-hidden>
        <Figure size={rookie} pose="stand" facing={-1} />
      </div>

      {/* the answer: '…having' and the field, right of the arm */}
      <label className="absolute block rounded-[3px] px-6 pb-4 pt-5"
        style={{ left: fieldLeft, top: Math.max(8, plaque.top - 60), width: fieldW, background: 'rgba(248,247,244,0.94)', border: '1px solid #DDD9D2', boxShadow: '0 8px 24px rgba(13,12,11,0.06)' }}>
        <span className="block font-[family-name:var(--font-ui)] text-[12px] font-semibold uppercase leading-[16px] tracking-[0.14em] text-muted">Your answer</span>
        <span className="mt-2 block font-[family-name:var(--font-text)] text-[22px] italic leading-[30px] text-ink-2" aria-hidden>…having</span>
        <textarea
          ref={ta}
          value={text}
          maxLength={MAX}
          rows={2}
          spellCheck
          autoComplete="off"
          placeholder="Type one experience…"
          aria-describedby="s03-count"
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (typed) finish(); else ta.current?.blur() } }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="halo-text block w-full resize-none border-0 bg-transparent px-0 py-1 font-[family-name:var(--font-text)] text-[22px] leading-[30px] text-ink placeholder:text-muted focus:outline-none"
          style={{ height: 78, paddingBottom: 12, outline: 'none', boxShadow: 'none', borderBottom: `${focused ? 2 : 1}px solid ${focused ? BRONZE : INK}`, caretColor: BRONZE }}
          data-testid="rule-input"
        />
        <span id="s03-count" className="mt-2 block font-[family-name:var(--font-ui)] text-[13px] tabular-nums text-muted" aria-live="polite">
          {text.length}/{MAX}{text.length >= 40 ? ` · ${MAX - text.length} left` : ''}
        </span>
      </label>
    </div>
  )
}
