/* The five places the 8 hours can go (plan 3.3). Each jug has a clay colour from
   the house palette and its own pattern, so the mix reads without colour alone.
   Colours are chosen at similar weight so no destination looks "better". */
export type JugId = 'meetings' | 'own-clients' | 'coaching' | 'product' | 'new-clients'

/** How one jug looks. `Jug` is the same, keyed by the five known ids. */
export type JugLook = {
  id: string
  label: string     // 2-3 words, the answer as stored
  color: string     // clay liquid / jug body
  light: string     // surface and highlights
  dark: string      // rim, handle, shadow side
  pattern: 'diag' | 'dots' | 'back' | 'vert' | 'grid'
}

export type Jug = JugLook & { id: JugId }

export const JUGS: Jug[] = [
  { id: 'meetings', label: 'Client meetings', color: '#2F5D4A', light: '#6E9582', dark: '#1F4B3A', pattern: 'diag' },
  { id: 'own-clients', label: 'Their own clients', color: '#2D4468', light: '#6F84A6', dark: '#14233B', pattern: 'dots' },
  { id: 'coaching', label: 'Coaching', color: '#8C4E24', light: '#C08A62', dark: '#6A3510', pattern: 'back' },
  { id: 'product', label: 'Product knowledge', color: '#B8862B', light: '#DDBB72', dark: '#8E6418', pattern: 'vert' },
  { id: 'new-clients', label: 'Finding new clients', color: '#6B4A63', light: '#A0869A', dark: '#4A2F44', pattern: 'grid' },
]

export const JUG: Record<JugId, Jug> = Object.fromEntries(JUGS.map((j) => [j.id, j])) as Record<JugId, Jug>

export const TOTAL_HOURS = 8

/** A look for each option id: its own if it is one of the five known jugs, otherwise
    the next unused look (then the cycle again), with the option's own label. */
export function looksFor(options: { id: string; label: string }[]): Record<string, JugLook> {
  const known = JUG as Record<string, Jug | undefined>
  const used = new Set(options.map((o) => known[o.id]?.id).filter(Boolean))
  const spare = JUGS.filter((j) => !used.has(j.id))
  let k = 0
  const out: Record<string, JugLook> = {}
  for (const o of options) {
    const base = known[o.id] ?? spare[k++ % Math.max(1, spare.length)] ?? JUGS[k % JUGS.length]
    out[o.id] = { ...base, id: o.id, label: o.label }
  }
  return out
}
