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
/* The accent trio does real work here rather than decorating: the route is
   navy, the survey marks are bronze, the reached camps are forest. */
const NAVY = '22,36,59'
const BRONZE = '146,86,38'
const FOREST = '35,64,47'
const SKIN_T = '198,146,106'
const COLS = 420

const raw = (l: Float32Array, u: number) => {
  const p = clamp(u) * (COLS - 1)
  const i = Math.floor(p)
  return l[i] + ((l[Math.min(i + 1, COLS - 1)] ?? l[i]) - l[i]) * (p - i)
}

/* Blend the noise with a rising ramp so the ridge ascends toward a summit at
   u=0.82. Without this the profile is just terrain, "further along" is not
   "higher", and the climber can summit in a valley with the successor above
   them, which is exactly what it did. */
const sample = (l: Float32Array, u: number) => {
  const c = clamp(u)
  const climb = Math.pow(Math.min(c / 0.82, 1), 0.85)
  const after = c > 0.82 ? (c - 0.82) / 0.18 : 0
  const ramp = climb - after * 0.22
  return raw(l, c) * 0.42 - ramp * 0.52
}

export type SurveyOpts = { t: number; level: number; successor: number; panU: number; reduced: boolean; stride: number }

export function drawSurvey(
  ctx: CanvasRenderingContext2D, w: number, h: number, terr: Terrain, o: SurveyOpts,
) {
  ctx.clearRect(0, 0, w, h)
  const near = terr.lines[3]
  const far = terr.lines[1]
  // the band maps the ridge's own range onto the full height of the strip
  let hi = Infinity, lo = -Infinity
  for (let i = 0; i <= 120; i++) {
    const v = sample(near, i / 120)
    hi = Math.min(hi, v); lo = Math.max(lo, v)
  }
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

  // --- the route, navy, dashed ahead and solid behind ----------------------
  if (stage >= 1) {
    const drawnTo = 0.10 + (o.level / 8) * 0.80
    for (const [from, to, solid] of [[0.10, drawnTo, true], [drawnTo, 0.90, false]] as const) {
      if (to <= from) continue
      ctx.strokeStyle = solid ? `rgb(${NAVY})` : `rgba(${NAVY},0.32)`
      ctx.lineWidth = solid ? 1.8 : 1.2
      ctx.setLineDash(solid ? [] : [4, 4])
      ctx.beginPath()
      for (let u = from; u <= to; u += 0.006) {
        const x = u * w, y = yOf(sample(near, u + pan)) - 2
        u === from ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      }
      ctx.stroke()
    }
    ctx.setLineDash([])
  }

  // --- hachures: denser where the face is steeper --------------------------
  if (stage >= 2) {
    ctx.strokeStyle = `rgba(${BRONZE},0.55)`
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
    ctx.strokeStyle = `rgba(${BRONZE},0.40)`
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

  // --- the climbers -------------------------------------------------------
  /* A drawn figure, not a tick: pack, axe, mid-stride. Scaled to the band so
     it stays legible at 110px on a phone. `lead` is the respondent in colour;
     the successor is the same figure, smaller and unfilled, behind. */
  const climber = (u: number, lead: boolean, alpha: number, stride: number) => {
    if (alpha <= 0.02) return
    const x = u * w
    const y = yOf(sample(near, u + pan))
    const S = (lead ? 1 : 0.78) * Math.min(1.25, h / 110)
    const jacket = lead ? `rgb(${BRONZE})` : `rgba(${INK},0.30)`
    const pack = lead ? `rgb(${FOREST})` : `rgba(${INK},0.22)`
    const swing = Math.sin(stride) * 3.2 * S

    ctx.save(); ctx.globalAlpha = alpha
    ctx.lineCap = 'round'; ctx.lineJoin = 'round'

    // legs, mid-stride
    ctx.strokeStyle = `rgb(${NAVY})`; ctx.lineWidth = 2.3 * S
    ctx.beginPath(); ctx.moveTo(x, y - 9 * S); ctx.lineTo(x - 3 * S + swing, y); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(x, y - 9 * S); ctx.lineTo(x + 4 * S - swing, y - 1 * S); ctx.stroke()

    // ice axe, planted uphill
    ctx.strokeStyle = `rgba(${INK},0.75)`; ctx.lineWidth = 1.4 * S
    ctx.beginPath(); ctx.moveTo(x + 5 * S, y - 13 * S); ctx.lineTo(x + 9 * S, y - 1 * S); ctx.stroke()

    // torso
    ctx.strokeStyle = jacket; ctx.lineWidth = 4.2 * S
    ctx.beginPath(); ctx.moveTo(x, y - 9 * S); ctx.lineTo(x + 1 * S, y - 17 * S); ctx.stroke()

    // pack
    ctx.fillStyle = pack
    ctx.beginPath()
    ctx.roundRect(x - 5 * S, y - 18 * S, 4.6 * S, 8 * S, 1.4 * S)
    ctx.fill()

    // arm to the axe
    ctx.strokeStyle = jacket; ctx.lineWidth = 2 * S
    ctx.beginPath(); ctx.moveTo(x + 1 * S, y - 15 * S); ctx.lineTo(x + 5.5 * S, y - 12.5 * S); ctx.stroke()

    // head
    ctx.fillStyle = lead ? `rgb(${SKIN_T})` : `rgba(${INK},0.30)`
    ctx.beginPath(); ctx.arc(x + 1.4 * S, y - 20 * S, 2.9 * S, 0, Math.PI * 2); ctx.fill()
    // hat
    ctx.fillStyle = lead ? `rgb(${BRONZE})` : `rgba(${INK},0.30)`
    ctx.beginPath()
    ctx.ellipse(x + 1.4 * S, y - 22 * S, 3.4 * S, 1.7 * S, 0, Math.PI, 0)
    ctx.fill()
    ctx.restore()
  }
  const you = 0.30 + 0.40 * o.t
  climber(you - 0.15, false, o.successor, o.stride + 1.6)
  climber(you, true, 1, o.stride)

  // --- camps: hollow ahead, filled behind ----------------------------------
  if (stage >= 1) {
    for (let i = 0; i < 9; i++) {
      const u = 0.10 + (i / 8) * 0.80
      const x = u * w, y = yOf(sample(near, u + pan))
      const reached = i <= o.level
      ctx.strokeStyle = reached ? `rgb(${FOREST})` : `rgba(${INK},0.35)`
      ctx.lineWidth = reached ? 1.6 : 1
      ctx.beginPath(); ctx.moveTo(x, y - 4); ctx.lineTo(x, y + 3); ctx.stroke()
      if (reached) {
        // a small pitched tent at every camp you have reached
        ctx.fillStyle = `rgb(${FOREST})`
        ctx.beginPath(); ctx.moveTo(x, y - 8); ctx.lineTo(x + 4, y - 2); ctx.lineTo(x - 4, y - 2)
        ctx.closePath(); ctx.fill()
      }
    }
  }
}
