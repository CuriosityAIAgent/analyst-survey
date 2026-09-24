import { Terrain, RIDGES, FOREGROUND } from './mountain'
import { clamp } from '@/lib/tokens'

/* The survey sheet: the mountain as a drawn document rather than a rendered
   view. Night-to-dawn becomes terrain becoming legible — the near ridge starts
   as a solid mass you cannot see into and is progressively surveyed.

   Ink AREA falls as ink INFORMATION rises. That is monotonic in knowledge and
   silent on value, which matters here: a skin that gets prettier the further
   you automate would put a thumb on the scale of the thing being measured. */

const INK = '13,12,11'
const LIGHT = '246,237,224'
const COLS = 420

const sample = (l: Float32Array, u: number) => {
  const p = clamp(u) * (COLS - 1)
  const i = Math.floor(p)
  return l[i] + ((l[Math.min(i + 1, COLS - 1)] ?? l[i]) - l[i]) * (p - i)
}

export type SurveyOpts = { t: number; level: number; successor: number; panU: number; reduced: boolean }

export function drawSurvey(
  ctx: CanvasRenderingContext2D, w: number, h: number, terr: Terrain, o: SurveyOpts,
) {
  ctx.clearRect(0, 0, w, h)
  const near = terr.lines[3]
  const far = terr.lines[1]
  // the band maps the ridge's own range onto the full height of the strip
  let hi = 1, lo = 0
  for (let x = 0; x < COLS; x++) { hi = Math.min(hi, near[x]); lo = Math.max(lo, near[x]) }
  const span = Math.max(lo - hi, 0.001)
  const yOf = (v: number) => h - 6 - ((lo - v) / span) * (h - 18)
  const pan = o.reduced ? 0 : o.panU

  const stage = o.level <= 1 ? 0 : o.level <= 3 ? 1 : o.level <= 6 ? 2 : 3

  // --- the light plate: sunrise as a hard-edged sheet, not a glow ----------
  if (o.t > 0.02) {
    const reach = -0.45 + 1.65 * o.t
    ctx.save()
    ctx.globalCompositeOperation = 'multiply'
    ctx.fillStyle = `rgb(${LIGHT})`
    ctx.beginPath()
    ctx.moveTo(w * reach, 0)
    ctx.lineTo(w * (reach + 0.9), 0)
    ctx.lineTo(w * (reach + 0.55), h)
    ctx.lineTo(w * (reach - 0.35), h)
    ctx.closePath()
    ctx.fill()
    ctx.restore()
  }

  const ridgePath = (line: Float32Array, shift: number) => {
    ctx.beginPath()
    ctx.moveTo(-20, h)
    for (let x = -20; x <= w + 20; x += 3) ctx.lineTo(x, yOf(sample(line, (x / w) + shift)))
    ctx.lineTo(w + 20, h)
    ctx.closePath()
  }

  // --- the far ridge is always a single hairline ---------------------------
  ctx.strokeStyle = `rgba(${INK},0.30)`
  ctx.lineWidth = 1
  ctx.beginPath()
  for (let x = 0; x <= w; x += 4) {
    const y = yOf(sample(far, (x / w) + pan * 0.4)) + h * 0.16
    x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
  }
  ctx.stroke()

  // --- the near ridge: solid at first, then opened up ----------------------
  ridgePath(near, pan)
  ctx.fillStyle = stage === 0 ? `rgb(${INK})` : `rgba(${INK},0.06)`
  ctx.fill()
  if (stage > 0) {
    ctx.strokeStyle = `rgb(${INK})`
    ctx.lineWidth = 1
    ctx.beginPath()
    for (let x = -20; x <= w + 20; x += 3) {
      const y = yOf(sample(near, (x / w) + pan))
      x === -20 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
    }
    ctx.stroke()
  }

  // --- hachures: denser where the face is steeper --------------------------
  if (stage >= 2) {
    ctx.strokeStyle = `rgba(${INK},0.42)`
    ctx.lineWidth = 1
    for (let x = 0; x <= w; x += 7) {
      const u = x / w + pan
      const y0 = yOf(sample(near, u)), y1 = yOf(sample(near, u + 0.008))
      const slope = Math.abs(y1 - y0)
      const len = Math.min(16, 3 + slope * 1.6)
      if (len < 4) continue
      ctx.beginPath(); ctx.moveTo(x, y0 + 2); ctx.lineTo(x, y0 + 2 + len); ctx.stroke()
    }
  }

  // --- contours and spot heights -------------------------------------------
  if (stage >= 3) {
    ctx.strokeStyle = `rgba(${INK},0.28)`
    ctx.lineWidth = 1
    for (const frac of [0.35, 0.55, 0.75]) {
      ctx.beginPath()
      let drawing = false
      for (let x = 0; x <= w; x += 3) {
        const v = sample(near, x / w + pan)
        const u = (lo - v) / span
        if (u > frac) {
          const y = yOf(lo - frac * span)
          drawing ? ctx.lineTo(x, y) : (ctx.moveTo(x, y), (drawing = true))
        } else drawing = false
      }
      ctx.stroke()
    }
  }

  // --- the two marks: solid is you, hollow is the one behind ---------------
  const markAt = (u: number, filled: boolean, alpha: number) => {
    if (alpha <= 0.02) return
    const x = u * w
    const y = yOf(sample(near, u + pan))
    ctx.save(); ctx.globalAlpha = alpha
    ctx.strokeStyle = `rgb(${INK})`; ctx.fillStyle = `rgb(${INK})`; ctx.lineWidth = 1.25
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - 11); ctx.stroke()
    ctx.beginPath(); ctx.arc(x, y - 14, 3.2, 0, Math.PI * 2)
    filled ? ctx.fill() : (ctx.fillStyle = `rgb(248,247,244)`, ctx.fill(), ctx.stroke())
    ctx.restore()
  }
  const you = 0.30 + 0.40 * o.t
  markAt(you - 0.15, false, o.successor)
  markAt(you, true, 1)

  // --- camps: hollow ahead, filled behind ----------------------------------
  if (stage >= 1) {
    ctx.strokeStyle = `rgb(${INK})`; ctx.lineWidth = 1
    for (let i = 0; i < 9; i++) {
      const u = 0.10 + (i / 8) * 0.80
      const x = u * w, y = yOf(sample(near, u + pan))
      ctx.beginPath(); ctx.moveTo(x, y - 3); ctx.lineTo(x, y + 3); ctx.stroke()
      if (i <= o.level) { ctx.fillStyle = `rgb(${INK})`; ctx.fillRect(x - 1.5, y - 1.5, 3, 3) }
    }
  }
}
