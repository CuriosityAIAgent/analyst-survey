import { RGB, mix, rgb, skyAt, clamp, T } from '@/lib/tokens'

/* Deterministic ridged-multifractal terrain.
   Shapes are computed once; only colour depends on t, which is what makes the
   dusk-to-dawn device free. No image assets, so this also runs on a machine
   with WebGL disabled. */

function mulberry(seed: number) {
  let a = seed >>> 0
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0
    let x = Math.imul(a ^ (a >>> 15), 1 | a)
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296
  }
}
const smooth = (f: number) => f * f * (3 - 2 * f)

function ridged(n: number, seed: number, octaves = 6, sharp = 1.9, persistence = 0.52) {
  const rnd = mulberry(seed)
  const out = new Float32Array(n)
  const prev = new Float32Array(n).fill(1)
  let amp = 1, freq = 2, norm = 0
  for (let o = 0; o < octaves; o++) {
    const pts: number[] = []
    for (let i = 0; i <= freq; i++) pts.push(rnd())
    for (let x = 0; x < n; x++) {
      const p = (x / (n - 1)) * freq
      const i = Math.floor(p)
      const f = smooth(p - i)
      const v = pts[i] + (pts[Math.min(i + 1, freq)] - pts[i]) * f
      let r = 1 - Math.abs(2 * v - 1)
      r = Math.pow(r, sharp)
      out[x] += r * amp * prev[x]
      prev[x] = Math.min(1, r * 1.5)
    }
    norm += amp; amp *= persistence; freq *= 2
  }
  for (let x = 0; x < n; x++) out[x] /= norm
  return out
}

export type RidgeSpec = {
  seed: number; base: number; amp: number; depth: number
  octaves: number; peak: number | null; peakH: number; sharp: number; parallax: number
}

export const RIDGES: RidgeSpec[] = [
  { seed: 8, base: 0.74, amp: 0.46, depth: 0.0, octaves: 5, peak: 0.62, peakH: 0.62, sharp: 2.3, parallax: 0.12 },
  { seed: 9, base: 0.83, amp: 0.40, depth: 0.3, octaves: 6, peak: 0.30, peakH: 0.34, sharp: 2.0, parallax: 0.26 },
  { seed: 10, base: 0.93, amp: 0.34, depth: 0.6, octaves: 6, peak: null, peakH: 0, sharp: 1.8, parallax: 0.46 },
  { seed: 11, base: 1.02, amp: 0.26, depth: 0.86, octaves: 7, peak: null, peakH: 0, sharp: 1.6, parallax: 0.72 },
]
export const FOREGROUND: RidgeSpec =
  { seed: 12, base: 1.14, amp: 0.20, depth: 1, octaves: 7, peak: null, peakH: 0, sharp: 1.5, parallax: 1.0 }

const COLS = 420 // ridge resolution; interpolated across whatever width we draw at

function line(spec: RidgeSpec) {
  const r = ridged(COLS, spec.seed, spec.octaves, spec.sharp)
  const out = new Float32Array(COLS)
  for (let x = 0; x < COLS; x++) {
    let v = r[x]
    if (spec.peak !== null) {
      const d = x / (COLS - 1) - spec.peak
      const b = Math.exp(-(d * d) / (2 * 0.17 * 0.17))
      v = Math.min(1, v * (1 - spec.peakH) + b * spec.peakH * 1.25)
    }
    out[x] = spec.base - spec.amp * v // fraction of height
  }
  return out
}

export type Terrain = { lines: Float32Array[]; fg: Float32Array; stars: { x: number; y: number; r: number; a: number }[] }

export function buildTerrain(): Terrain {
  const rnd = mulberry(99)
  const stars = Array.from({ length: 200 }, () => ({
    x: rnd(), y: rnd() * 0.62, r: rnd() > 0.78 ? 1.3 : 0.7, a: 0.25 + rnd() * 0.75,
  }))
  return { lines: RIDGES.map(line), fg: line(FOREGROUND), stars }
}

const sample = (l: Float32Array, u: number) => {
  const p = clamp(u) * (COLS - 1)
  const i = Math.floor(p)
  return l[i] + ((l[Math.min(i + 1, COLS - 1)] ?? l[i]) - l[i]) * (p - i)
}

export type DrawOpts = {
  t: number              // 0 = dusk, 1 = dawn
  px: number             // parallax, -1..1
  reduced: boolean
  successor: number      // 0..1 — the second climber's presence after the turn
  climberU: number       // 0..1 across the near ridge
}

export function drawScene(
  ctx: CanvasRenderingContext2D, w: number, h: number, terr: Terrain, o: DrawOpts,
) {
  const { top, horizon } = skyAt(o.t)
  const g = ctx.createLinearGradient(0, 0, 0, h)
  for (let i = 0; i <= 8; i++) {
    const u = i / 8
    g.addColorStop(u, rgb(mix(top, horizon, Math.pow(u, 0.85))))
  }
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)

  // stars fade out as dawn comes
  const sa = Math.max(0, 1 - o.t * 1.6)
  if (sa > 0.01) {
    for (const s of terr.stars) {
      ctx.globalAlpha = sa * s.a * (1 - s.y / 0.62)
      ctx.fillStyle = rgb(T.snow)
      ctx.beginPath(); ctx.arc(s.x * w, s.y * h, s.r, 0, Math.PI * 2); ctx.fill()
    }
    ctx.globalAlpha = 1
  }

  const drawPlane = (l: Float32Array, spec: RidgeSpec, rimOn: boolean) => {
    const shift = o.reduced ? 0 : o.px * spec.parallax * w * 0.035
    const fill = mix(mix(horizon, [8, 12, 26], 0.5), [5, 8, 18], spec.depth)
    const STEP = 3
    ctx.beginPath()
    ctx.moveTo(-40 + shift, h)
    for (let x = -40; x <= w + 40; x += STEP) ctx.lineTo(x + shift, sample(l, x / w) * h)
    ctx.lineTo(w + 40 + shift, h)
    ctx.closePath()
    ctx.fillStyle = rgb(fill)
    ctx.fill()

    if (!rimOn) return
    // rim light sits on the crests, strengthens toward dawn and toward the viewer
    let hi = 1, lo = 0
    for (let x = 0; x < COLS; x++) { hi = Math.min(hi, l[x]); lo = Math.max(lo, l[x]) }
    const span = Math.max(lo - hi, 0.001)
    const strength = (0.22 + 0.78 * o.t) * (0.45 + 0.55 * (1 - spec.depth))
    const col = mix(T.ink2, o.t > 0.5 ? T.goldLight : T.gold, clamp(o.t * 1.2))
    ctx.lineWidth = spec.depth < 0.6 ? 2 : 3
    ctx.lineCap = 'round'
    for (let x = -40; x <= w + 40; x += STEP) {
      const y0 = sample(l, x / w), y1 = sample(l, (x + STEP) / w)
      const u = (lo - y0) / span
      const a = strength * (0.1 + 0.9 * Math.pow(clamp(u), 2.1))
      if (a < 0.02) continue
      ctx.strokeStyle = rgb(col, a)
      ctx.beginPath(); ctx.moveTo(x + shift, y0 * h); ctx.lineTo(x + STEP + shift, y1 * h); ctx.stroke()
    }
  }

  RIDGES.forEach((spec, i) => {
    drawPlane(terr.lines[i], spec, true)
    if (i === 2) {
      const m = ctx.createLinearGradient(0, h * 0.72, 0, h * 0.9)
      m.addColorStop(0, rgb(T.ink2, 0)); m.addColorStop(0.5, rgb(T.ink2, 0.16)); m.addColorStop(1, rgb(T.ink2, 0))
      ctx.fillStyle = m; ctx.fillRect(0, h * 0.72, w, h * 0.18)
    }
  })

  // climbers ride the near ridge
  const near = terr.lines[3]
  const shiftN = o.reduced ? 0 : o.px * RIDGES[3].parallax * w * 0.035
  const figure = (u: number, scale: number, alpha: number, lamp: number) => {
    if (alpha <= 0.01) return
    const x = u * w + shiftN
    const y = sample(near, u) * h
    ctx.save(); ctx.globalAlpha = alpha
    const s = scale
    // headlamp beam
    const beam = ctx.createLinearGradient(x, y - 9 * s, x + 130 * s, y - 20 * s)
    beam.addColorStop(0, rgb(T.goldLight, 0.30 * lamp))
    beam.addColorStop(1, rgb(T.goldLight, 0))
    ctx.fillStyle = beam
    ctx.beginPath()
    ctx.moveTo(x, y - 9 * s)
    ctx.lineTo(x + 130 * s, y - 42 * s); ctx.lineTo(x + 130 * s, y + 14 * s)
    ctx.closePath(); ctx.fill()
    ctx.fillStyle = 'rgba(2,4,10,1)'; ctx.strokeStyle = 'rgba(2,4,10,1)'
    ctx.lineWidth = 3.4 * s; ctx.lineCap = 'round'
    ctx.beginPath(); ctx.arc(x, y - 10 * s, 3.1 * s, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.moveTo(x, y - 7 * s); ctx.lineTo(x - 1 * s, y); ctx.stroke()
    ctx.lineWidth = 2.6 * s
    ctx.beginPath(); ctx.moveTo(x - 1 * s, y); ctx.lineTo(x - 6 * s, y + 9 * s); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(x - 1 * s, y); ctx.lineTo(x + 5 * s, y + 9 * s); ctx.stroke()
    ctx.fillStyle = rgb(T.goldLight, lamp)
    ctx.beginPath(); ctx.arc(x + 3 * s, y - 11 * s, 1.9 * s, 0, Math.PI * 2); ctx.fill()
    ctx.restore()
  }
  // the successor, below and behind — appears after the turn
  figure(o.climberU - 0.17, 0.78, o.successor, 1)
  figure(o.climberU, 1, 1, Math.max(0.18, 1 - o.t))

  // foreground
  drawPlane(terr.fg, FOREGROUND, false)
}
