'use client'
/* S10 · Camp III · "Mark the route, tag the change".

   One screen, two beats; the component stays mounted and the cairn stays in
   view throughout.

   Beat A (stack): the cairn stands on the left; loose stones lie in a pile
   on the right, with the rookie beside them. Drag a stone onto the cairn, or
   tap it (Space / Enter on the keyboard), to stack it: 1 to 5, no default.
   Tap the top stone (or drag it off) to lift it off. The label under the
   cairn is the spec's item label for the count ('Rebuild it' .. "Don't
   touch it"). Stones settle with a small clack. Stores mark.

   Beat B (text): the prompt cross-fades, the cairn steps back to the left
   third, the rookie walks up onto the crest, and a luggage tag swings onto
   their strap. The tag IS the field: a transparent textarea lies over the
   tag's face, so the caret and the words sit on the card (Source Serif
   italic, 16px so iOS does not zoom). The tag hangs high (its foot at or
   above 300px at 390x660), so the keyboard never covers it. One line, 80
   characters, optional: 'Leave it blank' (quiet) until something is
   written, then 'Tie it on' (ink). Stores oneChange.text,
   oneChange.skipped, oneChange.keystrokes.

   The ruler (CairnRuler, both channels): all five labels, 1 Rebuild it to
   5 Don't touch it, the current level in ink. On the phone the rows stack
   above the loose pile; on desk they sit at the stones' own heights.

   Desk (design 5, S10): the same composition scaled up by f (about 1.8x at
   1440x790), laid out as a centred group: cairn, ruler, pile, rookie. Keys:
   1-5 set the height, Backspace/Delete lift the top stone (both via 'key',
   through the same setCount as a tap). Beat B: the rookie on the crest with
   a larger tag (Source Serif italic 22), the field focused, Enter ties it
   on. The phone composition is unchanged apart from the ruler. */
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import Frame from '../Frame'
import Figure from '../Figure'
import { Art } from '../art'
import { STONES as CAIRN_STONES, STONE_STEP, TAG_TEXT } from '../art/props'
import { SCENE_ANCHORS, camp3Crest } from '../art/scenes'
import { copy, items } from '../content'
import { useDrag } from '../useDrag'
import { useGameCtx } from '../context'
import { buzz, sfx } from '../feel'
import { useLayoutInfo } from '../layout'
import { useHotkeys } from '../useHotkeys'
import CairnRuler, { type RulerRow } from '../CairnRuler'
import { pressPanelPrimary } from '../deskKeys'

import type { Mark, StepProps } from '../types'

const STONES_SPEC = items('S10') // s1..s5, value 1..5
const MAX = 5
const labelFor = (n: number) => (n >= 1 ? STONES_SPEC[n - 1].label : '')
const MAX_TEXT = 80

/* The cairn-stone art's stack geometry (art/props.tsx), used to put a hit
   target over the top stone. */
const CAIRN = CAIRN_STONES

/* Where the camp's ground line falls in the stage. The scene is drawn at
   390x660 and placed 'xMidYMax meet' in the whole Frame (scenes.tsx
   SCENE_ANCHORS: scene-camp3 ground at y 556), so measure the frame and the
   stage and map it. */
const SCENE_GROUND = SCENE_ANCHORS['scene-camp3'].ground
function useGround(ref: React.RefObject<HTMLElement | null>) {
  const [g, setG] = useState<{ g: number; sc: number; ox: number; w: number } | null>(null)
  useLayoutEffect(() => {
    const el = ref.current
    const frame = el?.closest('[data-frame]') as HTMLElement | null
    if (!el || !frame) return
    const measure = () => {
      const a = frame.getBoundingClientRect(), b = el.getBoundingClientRect()
      const sc = Math.min(a.width / 390, a.height / 660)
      // ox: where scene x 0 falls in the stage (xMidYMax meet); w: stage width
      setG({ g: a.height - (660 - SCENE_GROUND) * sc - (b.top - a.top), sc, ox: (a.width - 390 * sc) / 2 - (b.left - a.left), w: b.width })
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(frame); ro.observe(el)
    return () => ro.disconnect()
  }, [ref])
  return g
}

/* A crossfading line for the prompt and helper as the beat changes. */
function Fade({ k, children, reduced }: { k: string; children: string; reduced: boolean }) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.span key={k} className="block"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: reduced ? 0.1 : 0.22 }}>
        {children}
      </motion.span>
    </AnimatePresence>
  )
}

export default function S10(p: StepProps) {
  const ctx = useGameCtx()
  const beat = p.beat
  const mark = p.answers.mark
  const n = typeof mark === 'number' ? mark : 0
  const [bump, setBump] = useState(0)
  const [text, setText] = useState(() => p.answers['oneChange.text'] ?? '')
  const keys = useRef(p.answers['oneChange.keystrokes'] ?? 0)
  const [said, setSaid] = useState('')

  const setCount = (next: number, via: string) => {
    const c = Math.max(0, Math.min(MAX, next))
    if (c === n) return
    if (c === 0) p.unset('mark')
    else p.set('mark', c as Mark)
    p.log(c > n ? 'stone-on' : 'stone-off', { count: c, via })
    setBump((b) => b + 1)
    if (c > n) {
      sfx('clack', ctx.sound)
      buzz(6)
    }
    setSaid(c ? `${c} ${c === 1 ? 'stone' : 'stones'}: ${labelFor(c)}.` : 'No stones on the cairn.')
  }

  const active = beat === 'A' && !p.covered
  const d = useDrag({
    disabled: !active,
    zones: ['cairn'],
    labelOf: (id) => (id === 'cairn' ? 'The cairn' : id === 'top' ? 'The top stone' : 'A stone'),
    canDrop: (item, z) => z === 'cairn' && item !== 'top',
    onPress: (item, via) => {
      if (!active) return true
      setCount(item === 'top' ? n - 1 : n + 1, via)
      return true
    },
    onDrop: (item, zone, via) => {
      if (item === 'top') {
        // dragged off the cairn: lifted off
        if (zone !== 'cairn') setCount(n - 1, via)
        return
      }
      if (zone === 'cairn') { setCount(n + 1, via); return }
      return false
    },
  })

  /* Taps and Space/Enter act at once (one tap = one stone): useDrag's
     onPress. The hook still owns pointer drags. */
  const direct = (id: string, style?: CSSProperties, className?: string) =>
    d.item(id, { disabled: !active, style, className })

  // Beat B: the tag
  const onText = (v: string) => {
    const t = v.slice(0, MAX_TEXT)
    keys.current += 1
    setText(t)
    p.set('oneChange.text', t)
  }
  const finishB = () => {
    const t = text.trim()
    p.setMany({ 'oneChange.text': t, 'oneChange.skipped': t.length === 0, 'oneChange.keystrokes': keys.current })
    p.log('tag', { chars: t.length, skipped: t.length === 0, keystrokes: keys.current })
    p.next()
  }

  // entering Beat A again (Back) or B: nothing lifted
  useEffect(() => { d.cancel() }, [beat]) // eslint-disable-line react-hooks/exhaustive-deps

  const c = copy('S10', beat)
  const inB = beat === 'B'
  const stageRef = useRef<HTMLDivElement | null>(null)
  const ground = useGround(stageRef)
  const [focused, setFocused] = useState(false)

  /* ---- composition (390 wide; ground G from the top of the scene box).
     Desk: the phone's geometry times f, as a centred group of cairn, ruler
     (RULER_W), pile and rookie. */
  const L = useLayoutInfo()
  const desk = L.desk
  const G = ground?.g ?? 430
  const SC = ground?.sc ?? 1
  const SW = ground?.w ?? 390
  const RULER_W = desk ? (L.compact ? 150 : 170) : 0
  const f = desk ? Math.max(1.1, Math.min(2.4, (SW - 80 - RULER_W - 116) / 352, (G - 60) / 190)) : 1
  const groupW = 166 * f + 16 + RULER_W + 40 + 126 * f + 40 + 60 * f
  const cairnSize = (inB ? 108 : 166) * f
  const k = cairnSize / 64
  const cairnLeft = desk ? Math.max(24, (SW - groupW) / 2) : 8
  const rulerX = cairnLeft + 166 * f + 16
  const pileLeft = desk ? rulerX + RULER_W + 40 : 178
  const top = n > 0 ? CAIRN[n - 1] : null
  const lifting = d.lifted === 'top' && d.dragging
  const shownCount = lifting ? n - 1 : n
  const topRect: CSSProperties | null = top ? (() => {
    const i = n - 1
    const cx = (32 + top.dx) * k, bottom = (53.4 - i * STONE_STEP) * k, h = (STONE_STEP + 0.6) * k
    const w = Math.max(56, top.w * k)
    const hh = Math.max(44, h + 16)
    return { left: cairnLeft + cx - w / 2, top: G - cairnSize + bottom - h / 2 - hh / 2, width: w, height: hh }
  })() : null

  const pile = MAX - n
  // loose stones: a small heap, three on the ground and two on top
  const HEAP = [{ x: 0, y: 0 }, { x: 38, y: 0 }, { x: 76, y: 0 }, { x: 19, y: -18 }, { x: 57, y: -18 }]
  const RSIZE = 104 * f
  const RS = RSIZE / 26 // Figure px per unit
  const ROOKIE_X = desk ? pileLeft + 126 * f + 40 + 9 * RS : 316 // feet; the rookie faces right, up the route, pack on the left
  // Beat B: the rookie has walked up onto the crest above the camp (desk:
  // at about 62% of the stage, wherever the crest is there)
  const crestScene = desk && ground ? Math.max(-280, Math.min(660, (SW * 0.62 - ground.ox) / SC)) : 318
  const CREST_X = desk && ground ? ground.ox + crestScene * SC : 318
  const crestY = G - (SCENE_GROUND - camp3Crest(crestScene) + 1) * SC
  const rx = inB ? CREST_X : ROOKIE_X
  const ry = inB ? crestY : G

  // the ruler: all five labels (Beat A)
  const rulerRows: RulerRow[] = STONES_SPEC.map((st, i) => {
    if (!desk) return { n: i + 1, label: st.label, y: G - 84 - 22 * i }
    const kA = (166 * f) / 64
    const stone = CAIRN[i]
    return {
      n: i + 1, label: st.label,
      y: G - 166 * f + (53.4 - i * STONE_STEP - STONE_STEP / 2) * kA,
      from: cairnLeft + (32 + stone.dx + stone.w / 2) * kA + 6,
    }
  })

  // the tag: flipped so its strap runs up the right edge, over the pack;
  // big enough to write 80 characters on (three lines of about 29)
  const TW = 290, TH = 140, tk = TH / 64
  const tagFont = desk ? 19 : 16
  const tagLine = desk ? 24 : 16.5
  const packX = rx - 3.9 * RS // the pack's centre
  const tagRight = packX + 7 * tk
  // the tag's string loops round the pack at mid-height (art y 21)
  const tagTop = ry - 15 * RS - 21 * tk
  const phoneText = {
    left: TAG_TEXT.x1 * tk + 4, width: TW - (TAG_TEXT.x0 + TAG_TEXT.x1) * tk - 8,
    top: TAG_TEXT.y0 * tk + 1, height: (TAG_TEXT.y1 - TAG_TEXT.y0) * tk - 2,
  }
  /* desk: the 3D tag (430x459 render: belt across the top, a portrait tag
     face below), flipped so the belt runs to the pack, drawn about 420px
     tall; the field lies on its face */
  const DS = desk ? Math.min(430, G * 0.82) / 459 : 0
  const tagBox = desk
    ? { left: packX - 400 * DS - 14, top: ry - 15 * RS - 80 * DS, w: 430 * DS, h: 459 * DS, origin: `${395 * DS}px ${80 * DS}px` }
    : { left: tagRight - TW, top: tagTop, w: TW, h: TH, origin: `${TW - 7 * tk}px 0px` }
  const tagText = desk ? { left: 122 * DS, top: 254 * DS, width: 150 * DS, height: 168 * DS } : phoneText
  const tagLines = desk ? Math.floor(tagText.height / tagLine) : 3

  const continueLabel = inB ? (text.trim() ? 'Tie it on' : 'Leave it blank') : 'Continue'

  /* desk keys: 1-5 set the height, Backspace/Delete lift the top stone */
  const height = (c: number) => () => { if (!active) return false; setCount(c, 'key') }
  const lift = () => { if (!active || n === 0) return false; setCount(n - 1, 'key') }
  useHotkeys({ 1: height(1), 2: height(2), 3: height(3), 4: height(4), 5: height(5), Backspace: lift, Delete: lift },
    { enabled: desk && beat === 'A' && !p.covered })
  // desk Beat B: the field is focused once the tag has swung on
  const tagRef = useRef<HTMLTextAreaElement | null>(null)
  useEffect(() => {
    if (!desk || !inB || p.covered) return
    const t = window.setTimeout(() => tagRef.current?.focus({ preventScroll: true }), p.reduced ? 150 : 700)
    return () => clearTimeout(t)
  }, [desk, inB, p.covered, p.reduced])

  return (
    <Frame
      id="S10"
      beat={beat}
      prompt={<Fade k={beat} reduced={p.reduced}>{c.prompt}</Fade>}
      helper={<Fade k={beat + 'h'} reduced={p.reduced}>{c.helper}</Fade>}
      valid={inB ? true : n >= 1}
      onContinue={inB ? finishB : p.next}
      continueLabel={continueLabel}
      continueQuiet={inB && !text.trim()}
      summary={desk ? (inB ? `${text.length}/${MAX_TEXT}` : n ? `${n} ${n === 1 ? 'stone' : 'stones'} · ${labelFor(n)}` : 'No stones yet') : undefined}
      invalidReason={inB ? undefined : 'Stack at least one stone'}
    >
      <div {...d.stageProps} ref={(el: HTMLDivElement | null) => { stageRef.current = el; d.stageProps.ref(el) }} className="relative h-full w-full" data-s10={beat}
        onKeyDownCapture={(e) => {
          // desk: Enter continues (the panel primary) even with a stone focused;
          // Space still adds or lifts a stone (design 3.7)
          if (!desk || beat !== 'A' || e.key !== 'Enter' || d.lifted) return
          e.preventDefault(); e.stopPropagation()
          pressPanelPrimary()
        }}>
        <style>{`
          [data-s10] [data-zone="cairn"][data-valid="true"] { outline: 1.5px dashed #0D0C0B; outline-offset: -2px; border-radius: 4px; }
          [data-s10] [data-zone="cairn"][data-over="true"] { outline-style: solid; background: rgba(13,12,11,0.04); }
        `}</style>

        {/* the scene box, anchored to the bottom of the stage */}
        <div className="absolute inset-0" style={{ opacity: ground === null ? 0 : 1 }}>
          {/* the cairn */}
          <motion.div
            {...d.zone('cairn')}
            className="absolute"
            animate={{ left: cairnLeft, top: G - cairnSize, width: cairnSize, height: cairnSize }}
            initial={false}
            transition={{ duration: p.reduced ? 0 : 0.45, ease: [0.16, 1, 0.3, 1] }}
            aria-label={`The cairn: ${n ? `${n} ${n === 1 ? 'stone' : 'stones'}, ${labelFor(n)}` : 'no stones'}`}
            data-testid="cairn"
          >
            <motion.div
              key={bump}
              initial={p.reduced || !bump ? false : { y: -3 }}
              animate={{ y: 0 }}
              transition={{ type: 'spring', stiffness: 700, damping: 14 }}
              className="h-full w-full"
            >
              <Art id="cairn-stone" value={shownCount} width="100%" height="100%" />
            </motion.div>
          </motion.div>

          {/* the top stone: tap or drag it off (Beat A only) */}
          {active && topRect && (
            <div
              {...direct('top', { ...topRect, position: 'absolute', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' })}
              aria-label={`Lift the top stone off. ${n} on the cairn.`}
              data-testid="cairn-top"
            >
              {lifting && (
                <div className="pointer-events-none" style={{ width: (64 * top!.w * k) / 50, height: (64 * top!.w * k) / 50, flexShrink: 0 }}>
                  <Art id="cairn-stone" width="100%" height="100%" />
                </div>
              )}
            </div>
          )}

          {/* the count label */}
          <motion.div
            className="absolute text-center"
            animate={{ left: cairnLeft - 10 - (desk && inB ? 60 : 0), width: cairnSize + 20 + (desk && inB ? 120 : 0), top: G + 8 }}
            initial={false}
            transition={{ duration: p.reduced ? 0 : 0.45, ease: [0.16, 1, 0.3, 1] }}
            aria-hidden
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={n}
                initial={{ opacity: 0, y: p.reduced ? 0 : 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: p.reduced ? 0.08 : 0.16 }}
                className={`${n
                  ? `font-[family-name:var(--font-text)] font-semibold ${desk ? (inB ? 'text-[20px] leading-[24px]' : 'text-[28px] leading-[32px]') : inB ? 'text-[17px] leading-[20px]' : 'text-[22px] leading-[26px]'} text-ink`
                  : `font-[family-name:var(--font-text)] ${desk ? 'text-[17px]' : 'text-[14px]'} italic text-muted`}`}
                data-testid="cairn-label"
              >
                {n ? (desk && inB ? `Your mark: ${labelFor(n)}` : labelFor(n)) : 'No stones yet'}
              </motion.p>
            </AnimatePresence>
          </motion.div>

          {/* the ruler: all five anchors (Beat A) */}
          <AnimatePresence>
            {!inB && ground && (
              <motion.div className="pointer-events-none absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: p.reduced ? 0.1 : 0.2 } }}>
                <CairnRuler rows={rulerRows} current={shownCount} x={desk ? rulerX + 8 : 184} size={desk ? Math.round(Math.max(15, Math.min(20, 16 * f / 1.8))) : 12} gap={desk ? 10 : 8} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* the loose stones (Beat A) */}
          <AnimatePresence>
            {!inB && (
              <motion.div
                className="absolute"
                style={{ left: pileLeft, top: G - 40 * f, width: 126 * f, height: 44 * f }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: p.reduced ? 0.1 : 0.25 } }}
                data-testid="pile"
              >
                {HEAP.slice(0, pile).map((h, i) => (
                  <div
                    key={`stone-${i}`}
                    {...direct(`stone-${i}`, { position: 'absolute', left: h.x * f, top: h.y * f, width: 50 * f, height: 44 * f })}
                    aria-label={`A stone. Put it on the cairn. ${n} on the cairn.`}
                    data-testid={`stone-${i}`}
                  >
                    <div className="pointer-events-none absolute" style={{ left: -3 * f, top: -15 * f, width: 56 * f, height: 56 * f }}>
                      <Art id="cairn-stone" width="100%" height="100%" />
                    </div>
                  </div>
                ))}
                {/* desk: the pile says what it is (the how-line names it) */}
                {desk && (
                  <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 whitespace-nowrap font-[family-name:var(--font-text)] italic leading-[1.3] text-ink-2"
                    style={{ top: 44 * f + 12, fontSize: Math.round(Math.max(15, Math.min(20, 9 * f))) }} aria-hidden data-pile-label>
                    {pile ? 'The pile of stones' : 'Pile empty'}
                  </span>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* the rookie, and in Beat B the tag on their strap */}
          <motion.div className="pointer-events-none absolute" initial={false}
            animate={{ left: rx - 9 * RS, top: ry - RSIZE + 1 * RS }}
            transition={{ duration: p.reduced ? 0 : 0.6, ease: [0.16, 1, 0.3, 1] }}>
            <Figure variant="rookie" pose="stand" size={RSIZE} />
          </motion.div>
          <AnimatePresence>
            {inB && (
              <motion.div
                className="absolute z-20"
                style={{ left: tagBox.left, top: tagBox.top, width: tagBox.w, height: tagBox.h, transformOrigin: tagBox.origin }}
                initial={p.reduced ? { opacity: 0 } : { rotate: 38, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={p.reduced ? { duration: 0.12 } : { type: 'spring', stiffness: 170, damping: 7, mass: 0.9, delay: 0.25 }}
                data-testid="tag"
              >
                <div className="pointer-events-none" style={{ transform: 'scaleX(-1)', width: tagBox.w, height: tagBox.h }}>
                  <Art id="luggage-tag" width={tagBox.w} height={tagBox.h} data={{ strap: false }} />
                </div>
                {/* flipped: the text area runs from x1 on the left to x0 on
                    the right. Faint ruled lines say 'write here'; on focus
                    they darken a little. */}
                <div aria-hidden className="pointer-events-none absolute" style={tagText}>
                  {Array.from({ length: tagLines }, (_, i) => i + 1).map((i) => (
                    <span key={i} className="absolute inset-x-0 border-b border-dashed transition-colors duration-150"
                      style={{ top: i * tagLine - 1, borderColor: focused ? '#7A3E12' : 'rgba(140,133,122,0.55)' }} />
                  ))}
                </div>
                <label htmlFor="s10-tag" className="sr-only">One change before they set off</label>
                <textarea
                  id="s10-tag"
                  value={text}
                  onChange={(e) => onText(e.target.value.replace(/\n/g, ' '))}
                  onKeyDown={(e) => {
                    if (e.key !== 'Enter') return
                    e.preventDefault()
                    // desk: Enter ties it on (a blank tag just blurs; Enter then presses 'Leave it blank')
                    if (desk && text.trim() && !ctx.busy) { finishB(); return }
                    ;(e.target as HTMLTextAreaElement).blur()
                  }}
                  ref={tagRef}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  maxLength={MAX_TEXT}
                  rows={3}
                  enterKeyHint="done"
                  autoCapitalize="sentences"
                  placeholder="Write it here"
                  className="absolute resize-none overflow-hidden border-0 bg-transparent p-0 font-[family-name:var(--font-text)] italic text-ink placeholder:text-muted"
                  style={{ ...tagText, fontSize: tagFont, lineHeight: `${tagLine}px`, outline: 'none', caretColor: '#7A3E12' }}
                  data-testid="tag-input"
                />
                {/* the count (desk: in the panel's status instead) */}
                <p className={`pointer-events-none absolute font-[family-name:var(--font-ui)] text-[11px] leading-[13px] text-muted ${desk ? 'hidden' : ''}`} aria-hidden
                  style={desk ? { left: tagText.left, top: tagBox.h + 6 } : { left: tagText.left, top: TH - 2 }}>
                  {text.length}/{MAX_TEXT}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p className="sr-only" aria-live="polite">{said}</p>
        {d.liveRegion}
      </div>
    </Frame>
  )
}
