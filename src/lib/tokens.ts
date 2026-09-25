export type RGB = [number, number, number]

export const hex = (h: string): RGB => {
  const s = h.replace('#', '')
  return [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16)]
}
export const rgb = (c: RGB, a = 1) => `rgba(${c[0]},${c[1]},${c[2]},${a})`
export const lerp = (a: number, b: number, u: number) => a + (b - a) * u
export const mix = (a: RGB, b: RGB, u: number): RGB =>
  [Math.round(lerp(a[0], b[0], u)), Math.round(lerp(a[1], b[1], u)), Math.round(lerp(a[2], b[2], u))]
export const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v))

/** Spec tokens. Colour lives here and nowhere else. */
export const T = {
  snow: hex('#F3F6FC'),
  ink2: hex('#B9C6E0'),
  gold: hex('#C9A227'),
  goldLight: hex('#E9D5BB'),
  ice: hex('#7FD4E0'),
  rope: hex('#E56A5E'),
  moss: hex('#7CCB8F'),
}

/** Sky as a continuous function of t: dusk -> predawn -> dawn. */
/* Six deliberate stages rather than a continuously drifting gradient, and
   warmer than the first pass so the paper panel reads as belonging to it. */
const SKY: Array<[number, RGB, RGB]> = [
  [0.0, hex('#0B1424'), hex('#1B2A44')],
  [0.5, hex('#132033'), hex('#3A4A63')],
  [1.0, hex('#2B3A52'), hex('#E9D5BB')],
]

export function skyAt(t: number): { top: RGB; horizon: RGB } {
  const c = clamp(t)
  for (let i = 0; i < SKY.length - 1; i++) {
    const [a, at, ah] = SKY[i]
    const [b, bt, bh] = SKY[i + 1]
    if (c >= a && c <= b) {
      const u = (c - a) / (b - a)
      return { top: mix(at, bt, u), horizon: mix(ah, bh, u) }
    }
  }
  return { top: SKY[2][1], horizon: SKY[2][2] }
}

/** Progress -> time of day. Level index over total levels. */
export const tForLevel = (i: number, n: number) => (n <= 1 ? 1 : clamp(i / (n - 1)))
