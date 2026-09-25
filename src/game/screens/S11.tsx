'use client'
/* S11 · Summit · "The last pitch".

   The payoff. No answer; it records summit.dragMs and (through the store's
   finish) t.complete.

   - The rookie carries exactly what the respondent chose: the three packed
     items (vote.green) at the top of the rucksack, the Blue item (vote.blue)
     in hand, the Day-one bricks (kit.lane = day1) clipped to the strap.
   - The route ahead is drawn as precisely as those bricks allow, on the
     same scale as S05's route strip (routePrecision: sharper with every
     Day-one brick): nothing, a pencil line, dotted, dotted with waypoints,
     dotted with weather glyphs and timings. It sits
     on the scene's own crest (SCENE_ANCHORS['scene-summit'].route). No
     instrument moves the climber: only the respondent's drag does (a
     RouteSlider in continuous mode), and every step inks a bootprint.
     Letting go rests them where they are. Keyboard: arrows / End on the
     slider. 'Skip' is always there; with reduced motion a tap on the rookie
     or on 'Walk to the top' puts them at the top.
   - At the top the camera moves in: over 600ms it scales about 2.15x
     around the summit table (a crossfade under reduced motion), so the
     rookie and the client stand well over 100px tall above where the kit
     card will rise. Then the kit is laid out on the long flat rock (the
     rucksack, the Blue item leaning on it, the Day-one bricks in a row in
     front, the map brick set down askew), the rookie steps to the table,
     the client rises from their chair and offers a hand, and the prompt
     becomes the one line, in Bodoni: "They came to meet you, not the map."
     Then a small paper card, 'Their kit' (In hand / Packed / Day-one kit /
     On their own feet), and 'Thank you.' No share, no score, no confetti.
   - The camera: the summit scene is drawn here (Frame's scene is off), in
     a 'world' layer the size of the frame, so the scene and the slider
     move together. On tall phones the world is lifted before the climb so
     the summit sits near 45% of the height, not under empty sky.
   - Until the first touch, a pulse ring at the rookie's boots and chevrons
     up the path say 'drag me'.

   Desk (design 5, S11): the world is drawn larger than the stage (a
   'virtual frame' 660*scD tall, scD chosen so the plateau sits just under
   the caption), so the last pitch runs about 650px at 1440x790 and the
   climber is about 80px tall. End or Enter walks them up (as the slider's
   own End key). At the top the camera moves in 1.6x around the table, the
   closing line appears in the stage in Source Serif 4 italic 32 (no
   Bodoni), and 'Their kit' goes into the panel (Frame panelSlot) with a
   small 3D image per line, then "Thank you. You can close this tab." Same
   summit.dragMs and t.complete. */
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import Frame from '../Frame'
import Figure from '../Figure'
import RouteSlider from '../RouteSlider'
import { Art } from '../art'
import { SCENE_ANCHORS, sceneToBox } from '../art/scenes'
import { ask, copy, items, routePrecision } from '../content'
import { useLayoutInfo } from '../layout'
import { useHotkeys } from '../useHotkeys'
import type { BrickId, GearId, PitchId, StepProps } from '../types'

const LINE = 'They came to meet you, not the map.'
/** The camera's zoom at the top, and how long it takes to move in. */
const ZOOM = 2.15
const CAMERA_MS = 600
/** Desk: the stage is bigger than a phone, so the camera moves in less. */
const DESK_ZOOM = 1.6
/** Roughly how tall the kit card is at 390 wide (it rises after the camera). */
const CARD_H = 272
const INK = '#0D0C0B', NAVY = '#14233B', RULE = '#8C857A', PAPER = '#F8F7F4'

const GEAR = items('S02') as { id: GearId; label: string; art: string }[]
const BRICKS = items('S05') as { id: BrickId; label: string; rung: number; art: string }[]
const PITCHES = items('S06') as { id: PitchId; label: string; art: string }[]
const gear = (id: string) => GEAR.find((g) => g.id === id)

const A = SCENE_ANCHORS['scene-summit']
const HOW = ask('S11').how
const ROUTE = A.route.slice(1) // the first point is off the left edge

/** Smooth path through points (Catmull-Rom as cubic Beziers). */
function smooth(pts: { x: number; y: number }[]) {
  if (pts.length < 2) return ''
  let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] ?? p2
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 }
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 }
    d += ` C ${c1.x.toFixed(1)} ${c1.y.toFixed(1)}, ${c2.x.toFixed(1)} ${c2.y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`
  }
  return d
}

/* Measure the stage inside the frame, so scene anchors map to stage px. */
type Box = { w: number; h: number; fw: number; fh: number; top: number; left: number }
function useBox(ref: React.RefObject<HTMLElement | null>) {
  const [box, setBox] = useState<Box | null>(null)
  useLayoutEffect(() => {
    const el = ref.current
    const frame = el?.closest('[data-frame]') as HTMLElement | null
    if (!el || !frame) return
    const measure = () => {
      const a = frame.getBoundingClientRect(), b = el.getBoundingClientRect()
      const next = { w: b.width, h: b.height, fw: a.width, fh: a.height, top: b.top - a.top, left: b.left - a.left }
      setBox((prev) => (prev && Object.keys(next).every((k) => Math.abs(prev[k as keyof Box] - next[k as keyof Box]) < 0.5) ? prev : next))
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(frame); ro.observe(el)
    return () => ro.disconnect()
  }, [ref])
  return box
}

type Phase = 'climb' | 'setdown' | 'walk' | 'meet' | 'line' | 'card'
const ORDER: Phase[] = ['climb', 'setdown', 'walk', 'meet', 'line', 'card']
const at = (ph: Phase, x: Phase) => ORDER.indexOf(ph) >= ORDER.indexOf(x)

export default function S11(p: StepProps) {
  const a = p.answers
  const finishedBefore = typeof a['t.complete'] === 'number'
  const [phase, setPhase] = useState<Phase>(finishedBefore ? 'card' : 'climb')
  const [t, setT] = useState(finishedBefore ? 1 : 0)
  const [walkU, setWalkU] = useState(finishedBefore ? 1 : 0)
  const started = useRef<number | null>(null)
  const arrived = useRef(finishedBefore)
  const timers = useRef<number[]>([])
  const raf = useRef<number | null>(null)
  const stageRef = useRef<HTMLDivElement | null>(null)
  const box0 = useBox(stageRef)
  /* desk: a virtual frame, taller than the stage, so the scene draws larger
     (scD px per scene unit); wy lifts it so its foot stays at the stage foot */
  const L = useLayoutInfo()
  const desk = L.desk
  const scD = desk && box0 ? Math.max(box0.fh / 660, Math.min(box0.fw / 400, (box0.fh - 96) / 440)) : 0
  const box = box0 && desk ? { ...box0, fh: 660 * scD } : box0
  const wy = box0 && desk ? box0.fh - 660 * scD : 0

  useEffect(() => () => {
    timers.current.forEach(clearTimeout)
    if (raf.current) cancelAnimationFrame(raf.current)
  }, [])

  /* ---- what they carry */
  const packed = (a['vote.green'] ?? []).map(gear).filter(Boolean) as typeof GEAR
  const blue = a['vote.blue'] ? gear(a['vote.blue']) ?? null : null
  const lanes = a['kit.lane'] ?? {}
  const day1 = BRICKS.filter((b) => lanes[b.id] === 'day1')
  const own = PITCHES.filter((x) => a['pitch.zone']?.[x.id] === 'own')
  // the same scale as S05's route strip: sharper with every Day-one brick
  const precision = routePrecision(lanes)

  /* ---- scene -> stage px */
  const S = (x: number, y: number) => {
    if (!box) return { x, y, s: 1 }
    const q = sceneToBox(x, y, box.fw, box.fh)
    return { x: q.x - box.left, y: q.y - box.top + wy, s: q.scale }
  }
  const sc = box ? sceneToBox(0, 0, box.fw, box.fh).scale : 1
  const routePts = useMemo(() => ROUTE.map(([x, y]) => S(x, y)), [box]) // eslint-disable-line react-hooks/exhaustive-deps
  const d = useMemo(() => smooth(routePts), [routePts])
  const end = routePts[routePts.length - 1] ?? { x: 0, y: 0 }
  const rock = S(A.rock.x, A.rock.y)
  const slabL = rock.x - (A.rock.w / 2 - 3) * sc // the slab's flat top, left end
  const mapDown = day1.some((b) => b.id === 'map')
  const towered = day1.filter((b) => b.id !== 'map')
  const clientAt = S(A.chairs[1].x, A.chairs[1].y)
  const meetX = S(A.meet.x, A.ground).x
  // desk: never below 72px, so the climber reads on a stage 1000px wide
  const figSize = desk ? Math.max(58 * sc, 72) : 58 * sc
  const U = figSize / 26 // px per figure unit

  /* ---- arrival and the finale */
  const later = (ms: number, f: () => void) => { timers.current.push(window.setTimeout(f, ms)) }
  const arrive = (via: string) => {
    if (arrived.current) return
    arrived.current = true
    const ms = started.current ? Math.round(performance.now() - started.current) : 0
    setT(1)
    p.set('summit.dragMs', ms)
    p.log('summit', { via, ms })
    p.next() // the store finishes: t.complete
    setPhase('setdown')
    if (p.reduced) {
      // crossfade to the close view, then the finale without walking
      later(CAMERA_MS, () => { setWalkU(1); setPhase('meet') })
      later(CAMERA_MS + 900, () => setPhase('line'))
      later(CAMERA_MS + 1800, () => setPhase('card'))
      return
    }
    later(CAMERA_MS + 500, () => {
      setPhase('walk')
      const t0 = performance.now()
      const tick = (now: number) => {
        const u = Math.min(1, (now - t0) / 650)
        setWalkU(1 - Math.pow(1 - u, 2))
        if (u < 1) raf.current = requestAnimationFrame(tick)
        else setPhase('meet')
      }
      raf.current = requestAnimationFrame(tick)
    })
    later(CAMERA_MS + 1800, () => setPhase('line'))
    later(CAMERA_MS + 3000, () => setPhase('card'))
  }

  const [touched, setTouched] = useState(finishedBefore)
  const onProgress = (v: number, m: { via: 'drag' | 'key'; done: boolean }) => {
    if (arrived.current) return
    if (!touched) setTouched(true)
    if (started.current === null) started.current = performance.now()
    setT(v)
    if (v >= 0.99 || (m.done && v >= 0.94)) arrive(m.via)
  }

  const climbing = phase === 'climb'

  /* ---- the camera (world layer transform, origin top-left) */
  const camera = (() => {
    if (!box) return { x: 0, y: 0, scale: 1 }
    if (desk && box0) {
      // desk: no lift; at the top, 1.6x around the table, mid-stage (the kit
      // card goes to the panel, not over the stage)
      if (climbing) return { x: 0, y: 0, scale: 1, opacity: 1 }
      const fd = sceneToBox(318, A.ground, box.fw, box.fh)
      const tgt = { x: box0.fw * (L.compact ? 0.7 : 0.5), y: box0.fh * 0.56 }
      const mv = { x: tgt.x - DESK_ZOOM * fd.x, y: tgt.y - wy - DESK_ZOOM * fd.y, scale: DESK_ZOOM }
      return p.reduced ? { ...mv, opacity: [1, 0, 1] } : { ...mv, opacity: 1 }
    }
    const { fw, fh } = box
    // before the top: on tall phones, lift the world so the summit sits
    // near 45% of the height (never lower it on short ones)
    const summitY = fh - (660 - A.ground) * sc
    const lift = Math.min(0, 0.45 * fh - summitY)
    if (climbing) return { x: 0, y: lift, scale: 1, opacity: 1 }
    // at the top: zoom around the kit and the table, the ground just above
    // where the kit card will rise
    const f = sceneToBox(304, A.ground, fw, fh)
    const target = { x: fw / 2, y: Math.min(fh - 16 - CARD_H - 12, fh * 0.52) }
    const move = { x: target.x - ZOOM * f.x, y: target.y - ZOOM * f.y, scale: ZOOM }
    return p.reduced ? { ...move, opacity: [1, 0, 1] } : { ...move, opacity: 1 }
  })()
  const standingAtTop = !climbing
  const rookieX = end.x + (meetX - end.x) * walkU
  const pose = phase === 'setdown' ? 'setDown' : phase === 'walk' ? 'stride' : at(phase, 'meet') ? 'openHand' : 'stand'
  const clientState = at(phase, 'meet') ? (phase === 'meet' ? 'rising' : 'offer') : 'seated'
  const kitDown = at(phase, 'walk')

  /* ---- the kit on the rookie, in figure units */
  const carry = packed.length ? (
    <g>
      {packed.slice(0, 3).map((g, i) => (
        <g key={g.id} transform={`translate(${-0.6 + i * 1.9} ${-3.4 + (i === 1 ? -0.5 : 0)})`}>
          <Art id={g.art} size={3.8} />
        </g>
      ))}
    </g>
  ) : undefined
  const hand = blue ? <g transform="translate(-2.6 -4.6)"><Art id={blue.art} size={5.2} /></g> : undefined
  const strap = day1.length ? (
    <g transform="translate(-2.6 -16.8)"><Art id="strap-kit" size={7} data={day1.map((b) => b.id)} /></g>
  ) : null

  /* ---- the route ahead, as sharp as the kit allows */
  const ahead = (s: { t: number | null; pointAt: (u: number) => { x: number; y: number } }) => {
    if (precision === 0 || !climbing) return null
    const t0 = s.t ?? 0
    // drawn a little above the crest (up-left of it), so it reads as a line
    // of its own and not as the rock edge the climber walks on
    const off = (u: number) => {
      const q = s.pointAt(u), a2 = s.pointAt(Math.max(0, u - 0.006)), b2 = s.pointAt(Math.min(1, u + 0.006))
      const tx = b2.x - a2.x, ty = b2.y - a2.y, L = Math.hypot(tx, ty) || 1
      return { x: q.x + (ty / L) * 9, y: q.y - (tx / L) * 9 }
    }
    const pts: string[] = []
    for (let u = t0 + 0.02; u <= 1.0001; u += 0.01) { const q = off(Math.min(1, u)); pts.push(`${q.x.toFixed(1)},${q.y.toFixed(1)}`) }
    const line = pts.join(' ')
    const marks = [0.3, 0.55, 0.8].filter((u) => u > t0 + 0.02)
    const times = ['07:40', '08:25', '09:10']
    return (
      <g aria-hidden data-precision={precision}>
        {precision === 1 && <polyline points={line} fill="none" stroke={RULE} strokeWidth={1.1} strokeLinecap="round" />}
        {precision >= 2 && <polyline points={line} fill="none" stroke={NAVY} strokeWidth={1.5} strokeDasharray="4 4" strokeLinecap="round" />}
        {precision >= 3 && marks.map((u) => {
          const q = off(u), b = off(Math.min(1, u + 0.01))
          const ang = (Math.atan2(b.y - q.y, b.x - q.x) * 180) / Math.PI
          return (
            <g key={u} transform={`translate(${q.x} ${q.y}) rotate(${ang})`}>
              <line x1={0} y1={-4.2} x2={0} y2={4.2} stroke={NAVY} strokeWidth={1.5} strokeLinecap="round" />
              <circle r={1.9} fill={PAPER} stroke={NAVY} strokeWidth={1.5} />
            </g>
          )
        })}
        {precision >= 4 && marks.map((u) => {
          const i = [0.3, 0.55, 0.8].indexOf(u)
          const q = off(u)
          return (
            <g key={`w${u}`} transform={`translate(${q.x - 24} ${q.y - 10})`}>
              <Weather kind={i} />
              <text x={0} y={14} textAnchor="middle" fontFamily="Archivo, Arial, sans-serif" fontSize={9} fill={NAVY}>{times[i]}</text>
            </g>
          )
        })}
      </g>
    )
  }

  /* ---- the summit tableau: the client, and the kit once it is set down */
  const tableau = (
    <g aria-hidden>
      {kitDown && (
        <g data-kit-on-rock>
          <motion.g initial={p.reduced ? false : { opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            {/* the rucksack, packed and zipped, stands at the left end */}
            <g transform={`translate(${slabL - 2 * sc} ${rock.y - 22.4 * sc})`}><Art id="rucksack" state={packed.length ? 'zipped' : undefined} size={24 * sc} /></g>
            {/* the Blue item leans on it */}
            {blue && <g transform={`translate(${slabL + 19 * sc} ${rock.y - 13.4 * sc}) rotate(-6)`}><Art id={blue.art} size={14 * sc} /></g>}
            {/* the Day-one bricks, snapped into a small tower (rung order, the
                lowest at the bottom); the map brick is not on it: it lies set
                down askew in front of the rucksack */}
            {towered.map((b, i) => (
              <g key={b.id} transform={`translate(${slabL + 35 * sc} ${rock.y - (5 + i * 4.3) * sc})`} data-kit-brick={b.id}>
                <Art id={`brick-${b.id}`} width={12 * sc} height={5 * sc} />
              </g>
            ))}
            {mapDown && (
              <g transform={`translate(${slabL + 7 * sc} ${rock.y - 2.6 * sc}) rotate(-12 ${6 * sc} ${2.5 * sc})`} data-kit-brick="map">
                <Art id="brick-map" width={12 * sc} height={5 * sc} />
              </g>
            )}
          </motion.g>
        </g>
      )}
      {/* the client in the right-hand chair, facing the rookie */}
      <g transform={`translate(${clientAt.x} ${clientAt.y}) scale(-1 1)`} data-client={clientState}>
        <g transform={`translate(${-28 * sc} ${-62 * sc})`}>
          <Art id="client" size={64 * sc} state={clientState} />
        </g>
      </g>
    </g>
  )

  const thumb = (s: { moving: boolean; stride: number; dragging: boolean }) => {
    const walking = phase === 'walk'
    return (
      <g data-rookie={phase}>
        {/* desk: the whole (larger) figure is the grab area, not just the boots */}
        {desk && climbing && <rect x={-figSize * 0.45} y={-figSize - 4} width={figSize * 0.9} height={figSize + 12} fill="transparent" />}
        <Figure
          as="g"
          variant="rookie"
          size={figSize}
          x={standingAtTop ? rookieX - end.x : 0}
          y={0}
          pose={climbing ? (s.moving ? 'stride' : 'stand') : pose}
          t={walking ? walkU * 4 * Math.PI : s.stride}
          axe={false}
          pack={!kitDown}
          carry={!kitDown ? carry : undefined}
          hand={!kitDown ? hand : undefined}
        />
        {!kitDown && strap && (
          <g transform={`translate(${standingAtTop ? rookieX - end.x : 0} 0) scale(${U})`}>{strap}</g>
        )}
        {/* until the first touch: a pulse ring at the boots, chevrons up the path */}
        {climbing && !touched && !s.dragging && <GrabCue reduced={p.reduced} size={figSize} />}
        {/* reduced motion: a tap on the rookie takes them to the top */}
        {climbing && p.reduced && (
          <rect x={-30} y={-figSize - 6} width={60} height={figSize + 16} fill="transparent"
            onPointerDown={(e) => { e.stopPropagation(); arrive('tap') }} style={{ cursor: 'pointer' }} />
        )}
      </g>
    )
  }

  const c = copy('S11')
  const showLine = at(phase, 'line')

  /* desk: End or Enter walks them up (the slider's own End key path) */
  useHotkeys({
    End: () => { if (!climbing) return false; onProgress(1, { via: 'key', done: true }) },
    Enter: () => { if (!climbing) return false; onProgress(1, { via: 'key', done: true }) },
  }, { enabled: desk && climbing && !p.covered })

  /* desk: 'Their kit' in the panel once the finale is done (deskCompact: the
     panel is too short, so it sits at the stage's lower left instead) */
  const kitCard = desk && phase === 'card' ? (
    <motion.div
      className="rounded-[3px] border border-rule-soft px-4 pb-3 pt-3"
      style={{ background: '#FFFFFF' }}
      initial={p.reduced || finishedBefore ? { opacity: 0 } : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: p.reduced ? 0.15 : 0.5, ease: [0.16, 1, 0.3, 1] }}
      data-testid="kit-card"
    >
      <p className="font-[family-name:var(--font-ui)] text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">Their kit</p>
      <ul className="mt-2 flex flex-col gap-[10px]">
        <KitLine k="In hand" arts={blue ? [blue.art] : []} v={blue ? blue.label : 'Nothing'} />
        <KitLine k="Packed" arts={packed.map((g) => g.art)} v={packed.length ? packed.map((g) => g.label).join(' · ') : 'Nothing'} />
        <KitLine k="Day-one kit" arts={day1.map((b) => b.art)} v={day1.length ? day1.map((b) => b.label).join(' · ') : 'None on day one'} />
        <KitLine k="On their own feet" arts={own.map((x) => x.art)} v={own.length ? own.map((x) => x.label).join(' · ') : 'None'} />
      </ul>
      <p className="mt-3 font-[family-name:var(--font-text)] text-[18px] font-semibold leading-[24px] text-ink">Thank you. You can close this tab.</p>
    </motion.div>
  ) : undefined

  return (
    <Frame
      id="S11"
      valid={false}
      onContinue={() => {}}
      footer={null}
      scene={null}
      panelSlot={L.compact ? undefined : kitCard}
      captionAlign="right"
      // desk: the prompt caption gives way to the closing line (one caption at a time)
      prompt={desk ? (
        <motion.span className="block" initial={false} animate={{ opacity: showLine ? 0 : 1 }} transition={{ duration: p.reduced ? 0.12 : 0.5 }}>
          {c.prompt}
        </motion.span>
      ) : 
        <AnimatePresence mode="wait" initial={false}>
          <motion.span key={showLine ? 'line' : 'prompt'} className="block"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: p.reduced ? 0.12 : 0.5 }} data-line={showLine ? 'true' : undefined}>
            {showLine ? LINE : c.prompt}
          </motion.span>
        </AnimatePresence>
      }
      helper={
        <motion.span className="block" animate={{ opacity: climbing ? 1 : 0 }} transition={{ duration: 0.3 }}>
          {c.helper}
        </motion.span>
      }
      // the how line goes once they have arrived: nothing is left to drag
      // (desk: the panel keeps the question and the kit card; phone: it fades)
      how={desk ? (climbing ? undefined : null) : (
        <motion.span className="block" animate={{ opacity: climbing ? 1 : 0 }} transition={{ duration: 0.3 }}>
          {HOW}
        </motion.span>
      )}
    >
      <div ref={stageRef} className="absolute inset-0" data-s11={phase}>
        {L.compact && kitCard && <div className="absolute bottom-4 left-6 z-10 w-[380px]">{kitCard}</div>}
        {/* desk: the closing line, large, in the stage (Source Serif 4 italic; no Bodoni) */}
        <AnimatePresence>
          {desk && showLine && (
            <motion.p
              className="halo-text pointer-events-none absolute inset-x-8 top-[4%] z-10 text-center font-[family-name:var(--font-text)] italic text-ink"
              style={{ fontSize: L.compact ? 28 : 32, lineHeight: 1.25 }}
              initial={{ opacity: 0, y: p.reduced ? 0 : 6 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: p.reduced ? 0.12 : 0.6 }}
              data-line="true"
            >
              {LINE}
            </motion.p>
          )}
        </AnimatePresence>
        {box && (
          <motion.div
            className="absolute"
            style={{ left: -box.left, top: -box.top + wy, width: box.fw, height: box.fh, transformOrigin: '0 0' }}
            initial={false}
            animate={camera}
            transition={p.reduced
              // a crossfade: out, cut to the close view at the midpoint, in
              ? { default: { duration: 0, delay: CAMERA_MS / 2000 }, opacity: { duration: CAMERA_MS / 1000, times: [0, 0.5, 1] } }
              : { duration: CAMERA_MS / 1000, ease: [0.16, 1, 0.3, 1] }}
            data-camera={climbing ? 'wide' : 'close'}
          >
            {/* the summit scene, in the world so the camera moves it too */}
            <div className="pointer-events-none absolute inset-0" aria-hidden>
              <Art id="scene-summit" width="100%" height="100%" />
            </div>
            <div className="absolute" style={{ left: box.left, top: box.top - wy, width: box.w, height: box.h }}>
              <RouteSlider
                d={d}
                viewBox={[box.w, box.h]}
                progress={t}
                onProgress={onProgress}
                label="Walk them up the last pitch"
                inkBehind
                disabled={!climbing}
                thumbHit={36}
                keyStep={0.1}
                testId="summit-range"
                renderTrack={(s) => (
                  <g>
                    {ahead(s)}
                    {tableau}
                  </g>
                )}
                renderThumb={thumb}
              />
            </div>
          </motion.div>
        )}

        {/* the climb: skip, or with reduced motion, walk to the top */}
        {climbing && (
          <div className="absolute bottom-3 right-4 flex items-center gap-2">
            {p.reduced && (
              <button type="button" className="btn" style={{ minHeight: 44, padding: '10px 18px', fontSize: 15 }}
                onClick={() => arrive('tap')} data-testid="to-top">
                Walk to the top
              </button>
            )}
            <button type="button" onClick={() => { p.log('skip', { t }); arrive('skip') }}
              className="h-11 px-3 font-[family-name:var(--font-ui)] text-[13px] text-muted underline decoration-rule-soft underline-offset-4"
              data-testid="skip">
              Skip
            </button>
          </div>
        )}

        {/* their kit, and thank you */}
        <AnimatePresence>
          {phase === 'card' && !desk && (
            <motion.div
              className="absolute inset-x-4 bottom-4 px-5 pb-4 pt-4"
              style={{ background: PAPER, border: `1px solid ${RULE}`, borderRadius: 3, boxShadow: '0 1px 0 #DDD9D2, 0 12px 28px rgba(13,12,11,0.12)' }}
              initial={p.reduced || finishedBefore ? { opacity: 0 } : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: p.reduced ? 0.15 : 0.5, ease: [0.16, 1, 0.3, 1] }}
              data-testid="kit-card"
            >
              <p className="font-[family-name:var(--font-ui)] text-[11px] font-medium uppercase tracking-[0.16em] text-muted">Their kit</p>
              <dl className="mt-2 grid grid-cols-[112px_1fr] gap-x-3 gap-y-2">
                <Row k="In hand" v={blue ? blue.label : 'Nothing'} />
                <Row k="Packed" v={packed.length ? packed.map((g) => g.label).join(' · ') : 'Nothing'} />
                <Row k="Day-one kit" v={day1.length ? day1.map((b) => b.label).join(' · ') : 'None on day one'} />
                <Row k="On their own feet" v={own.length ? own.map((x) => x.label).join(' · ') : 'None'} />
              </dl>
              <p className="mt-4 font-[family-name:var(--font-text)] font-semibold text-[24px] leading-[28px] text-ink">Thank you.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Frame>
  )
}

/** Desk kit card line: one small 3D image (the first item), then the label
    and the names. */
function KitLine({ k, v, arts }: { k: string; v: string; arts: string[] }) {
  return (
    <li className="flex items-start gap-3">
      <span className="flex h-[36px] w-[40px] shrink-0 items-center justify-center">
        {arts[0] ? <Art id={arts[0]} size={36} /> : <span className="h-[1px] w-[16px] bg-rule-soft" aria-hidden />}
      </span>
      <span className="min-w-0">
        <span className="block font-[family-name:var(--font-ui)] text-[11px] font-semibold uppercase leading-[14px] tracking-[0.12em] text-muted">{k}</span>
        <span className="block font-[family-name:var(--font-text)] text-[14px] leading-[18px] text-ink">{v}</span>
      </span>
    </li>
  )
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <>
      <dt className="pt-[2px] font-[family-name:var(--font-ui)] text-[12px] leading-[16px] text-muted">{k}</dt>
      <dd className="font-[family-name:var(--font-text)] text-[14px] leading-[18px] text-ink">{v}</dd>
    </>
  )
}

/* Small navy weather glyphs for the full-kit route: sun, cloud, wind. */
function Weather({ kind }: { kind: number }) {
  const s = { fill: 'none', stroke: NAVY, strokeWidth: 1.2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  if (kind === 1) return <path d="M-5 2 h9 a3 3 0 0 0 0 -6 a4 4 0 0 0 -7.5 -1 a3 3 0 0 0 -1.5 7 z" {...s} fill={PAPER} />
  if (kind === 2) return <path d="M-6 -2 h8 a2 2 0 1 0 -2 -2 M-6 1.5 h10 a2 2 0 1 1 -2 2" {...s} />
  return (
    <g {...s}>
      <circle r={2.6} fill={PAPER} />
      {[0, 60, 120, 180, 240, 300].map((r) => (
        <line key={r} x1={0} y1={-4.4} x2={0} y2={-5.8} transform={`rotate(${r})`} />
      ))}
    </g>
  )
}

/** Until the first touch: a dotted ring pulsing at the boots, and pencil
    chevrons pointing up the path. */
function GrabCue({ reduced, size }: { reduced: boolean; size: number }) {
  const k = size / 58
  return (
    <g pointerEvents="none" aria-hidden>
      <motion.ellipse cx={0} cy={0.5} rx={18 * k} ry={5 * k} fill="none" stroke={INK} strokeWidth={1.2} strokeDasharray="2 3"
        initial={false}
        animate={reduced ? { opacity: 0.6 } : { opacity: [0.15, 0.9, 0.15], scale: [0.92, 1.08, 0.92] }}
        transition={reduced ? { duration: 0 } : { duration: 1.6, repeat: Infinity, ease: 'easeInOut' }} />
      {[0, 1, 2].map((i) => (
        <motion.path key={i} d={`M ${(22 + i * 12) * k} ${(-10 - i * 14) * k} l ${4 * k} ${-4.5 * k} l ${1.2 * k} ${6 * k}`} fill="none" stroke={INK}
          strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round"
          initial={false}
          animate={reduced ? { opacity: 0.55 } : { opacity: [0.1, 0.75, 0.1] }}
          transition={reduced ? { duration: 0 } : { duration: 1.6, repeat: Infinity, delay: i * 0.2 }} />
      ))}
    </g>
  )
}
