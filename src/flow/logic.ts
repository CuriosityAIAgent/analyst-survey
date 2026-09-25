import type { Answer, Card, Graph } from './types'

/* ---------------------------------------------------------------------------
   The branch mini-language, evaluated against answers already given.

     is:<opt>             pick answer equals opt
     includes:<opt>       multi answer includes opt
     gte:<n> / lte:<n>    slider answer
     right:<item> / left:<item>   swipe: that item went right / left
     token:<tok>:<opt>    a <tok> token was dropped on <opt>
     top:<opt>            rank: <opt> placed first
     carried:<card>:<cond>  evaluate <cond> against an EARLIER card's answer

   A condition that cannot apply to the answer's shape is false, never a crash:
   a malformed graph must degrade to the default path, not strand a respondent.
--------------------------------------------------------------------------- */

/* Arity per operator. `is:yes:ignored` used to match because destructuring
   silently dropped the extra segment; now a malformed condition never matches. */
const ARITY: Record<string, number> = {
  is: 1, includes: 1, top: 1, gte: 1, lte: 1, right: 1, left: 1, token: 2,
}

export function test(
  cond: unknown, own: Answer | undefined, all: Record<string, Answer>, onPath?: Set<string>,
): boolean {
  if (typeof cond !== 'string') return false
  const c = cond.trim()
  if (c === 'always') return true

  if (c.startsWith('carried:')) {
    const rest = c.slice('carried:'.length)
    const i = rest.indexOf(':')
    if (i < 0) return false
    const card = rest.slice(0, i)
    // Only an answer on the CURRENT path counts. An answer left behind on a
    // branch the respondent backed out of must not steer where they go next.
    if (onPath && !onPath.has(card)) return false
    if (!(card in all)) return false
    return test(rest.slice(i + 1), all[card], all, onPath)
  }

  const parts = c.split(':')
  const op = parts[0]
  if (!(op in ARITY) || parts.length !== ARITY[op] + 1 || parts.slice(1).some((x) => x === '')) return false
  const [, a, b] = parts
  const v = own
  switch (op) {
    case 'is':
      return typeof v === 'string' && v === a
    case 'includes':
      return Array.isArray(v) && v.includes(a)
    case 'top':
      return Array.isArray(v) && v[0] === a
    case 'gte':
      return typeof v === 'number' && Number.isFinite(Number(a)) && v >= Number(a)
    case 'lte':
      return typeof v === 'number' && Number.isFinite(Number(a)) && v <= Number(a)
    case 'right':
    case 'left':
      return isRecord(v) && (v as Record<string, unknown>)[a] === op
    case 'token': {
      if (!isRecord(v)) return false
      const drops = (v as Record<string, unknown>)[a]
      return Array.isArray(drops) && drops.includes(b)
    }
    default:
      return false
  }
}

const isRecord = (v: unknown) => !!v && typeof v === 'object' && !Array.isArray(v)

export function nextId(
  card: Card, own: Answer | undefined, all: Record<string, Answer>, onPath?: Set<string>,
): string {
  for (const br of card.branches ?? []) {
    if (test(br?.when, own, all, onPath)) return br.goto
  }
  return card.next
}

/* Whether a card has been answered well enough to leave. Lives here, not in a
   component, so the store can refuse to advance past an unanswered card no
   matter what triggered the advance. */
export function isAnswered(card: Card, v: Answer | undefined): boolean {
  // optional means skippable: leaving it blank is a legitimate answer
  if (card.optional && (v === undefined || v === '' || (Array.isArray(v) && v.length === 0))) return true
  const opts = card.options ?? []
  const ids = new Set(opts.map((o) => o.id))
  switch (card.kind) {
    case 'show': return true
    case 'text': return !!card.optional || (typeof v === 'string' && v.trim().length > 0)
    case 'pick': return typeof v === 'string' && ids.has(v)
    case 'slider': return typeof v === 'number' && Number.isFinite(v)
    case 'multi':
      // what the chips can produce: known ids, no repeats, no more than max
      return Array.isArray(v) && v.every((x) => ids.has(x as string)) && new Set(v).size === v.length &&
        v.length <= (card.max ?? opts.length) && (v.length > 0 || !!card.optional)
    case 'rank':
      // an exact permutation of the options
      return Array.isArray(v) && v.length === opts.length && v.every((x) => ids.has(x as string)) && new Set(v).size === v.length
    case 'swipe':
      return !!v && typeof v === 'object' && !Array.isArray(v) &&
        opts.every((o) => ['left', 'right'].includes((v as Record<string, string>)[o.id]))
    case 'tokens': {
      if (!v || typeof v !== 'object' || Array.isArray(v)) return false
      const r = v as Record<string, unknown>
      return (card.tokens ?? []).every((t) =>
        Array.isArray(r[t.id]) && (r[t.id] as string[]).length === t.count && (r[t.id] as string[]).every((x) => ids.has(x)) &&
        (!card.oneEach || new Set(r[t.id] as string[]).size === t.count))
    }
    default: return false
  }
}

/* ---------------------------------------------------------------------------
   Option order. A fixed order puts the same item first for everyone, and first
   is where a hurried thumb lands. Cards marked `shuffle` show their options in
   an order drawn from the respondent's seed and the card id, so it differs
   between people, is stable across Back and refresh, and can be rebuilt at
   analysis from the seed alone (rule 14: randomise AND log). Catch-alls such as
   "Something not here" stay last, where people look for them.
--------------------------------------------------------------------------- */
export const PINNED = new Set(['other', 'none', 'nothing', 'never', 'notfreed'])

export function ordered<T extends { id: string }>(items: T[], seed: number, key: string): T[] {
  let h = seed | 0
  for (const ch of key) h = (Math.imul(h, 31) + ch.charCodeAt(0)) | 0
  const next = () => { h = (Math.imul(h, 1103515245) + 12345) | 0; return (h >>> 0) / 4294967296 }
  const free = items.filter((x) => !PINNED.has(x.id))
  for (let i = free.length - 1; i > 0; i--) { const j = Math.floor(next() * (i + 1)); [free[i], free[j]] = [free[j], free[i]] }
  return [...free, ...items.filter((x) => PINNED.has(x.id))]
}

export const shown = (card: Card, seed: number): Card =>
  card.shuffle && card.options ? { ...card, options: ordered(card.options, seed, card.id) } : card

/* ---------------------------------------------------------------------------
   Static checks on a graph. Run in tests and at build time: a broken graph is
   a content bug that strands respondents, so it must fail loudly, early.
--------------------------------------------------------------------------- */
export type GraphProblem = { card: string; problem: string }

/* Can `from` appear earlier on some path than `to`? */
let canPrecede: (from: string, to: string) => boolean = () => true

const KINDS = new Set(['show', 'pick', 'multi', 'swipe', 'slider', 'rank', 'tokens', 'text'])

export function checkGraph(g: Graph): GraphProblem[] {
  const out: GraphProblem[] = []
  if (!g || !Array.isArray(g.cards)) return [{ card: '*', problem: 'graph has no cards array' }]
  const byId = new Map(g.cards.map((c) => [c.id, c]))
  if (byId.size !== g.cards.length) out.push({ card: '*', problem: 'duplicate card ids' })
  if (!byId.has(g.start)) out.push({ card: '*', problem: `start "${g.start}" does not exist` })
  const edges = (id: string) => {
    const c = byId.get(id)
    return c ? [c.next, ...(c.branches ?? []).map((b) => b?.goto)].filter((x): x is string => typeof x === 'string') : []
  }
  canPrecede = (from, to) => {
    const seen = new Set<string>(); const stack = [...edges(from)]
    while (stack.length) {
      const x = stack.pop()!
      if (x === to) return true
      if (seen.has(x) || x === 'END') continue
      seen.add(x); stack.push(...edges(x))
    }
    return false
  }

  for (const c of g.cards) {
    if (!KINDS.has(c.kind)) out.push({ card: c.id, problem: `unknown kind "${c.kind}" renders no control` })
    if (c.kind === 'multi' && !c.optional && (c.max ?? 1) < 1) out.push({ card: c.id, problem: 'multi with max < 1 can never be answered' })
    const brs = c.branches ?? []
    const alwaysAt = brs.findIndex((b) => b?.when === 'always')
    if (alwaysAt >= 0 && alwaysAt < brs.length - 1) out.push({ card: c.id, problem: 'branches after "always" can never fire' })
    for (const b of brs) if (typeof b?.when !== 'string') out.push({ card: c.id, problem: 'branch with no condition' })
    const targets = [c.next, ...brs.map((b) => b.goto)]
    for (const t of targets) {
      if (t !== 'END' && !byId.has(t)) out.push({ card: c.id, problem: `goes to missing card "${t}"` })
    }
    const opts = new Set((c.options ?? []).map((o) => o.id))
    const toks = new Set((c.tokens ?? []).map((t) => t.id))
    for (const br of c.branches ?? []) {
      if (typeof br?.when !== 'string') continue
      const [op, a, b] = br.when.split(':')
      if (op === 'carried') {
        const ref = a
        if (!byId.has(ref)) out.push({ card: c.id, problem: `carried: refers to missing card "${ref}"` })
        else if (ref === c.id || !canPrecede(ref, c.id)) {
          out.push({ card: c.id, problem: `carried: "${ref}" can never come before this card` })
        }
        continue
      }
      const arity = ARITY[op]
      if (arity !== undefined && br.when.split(':').length !== arity + 1) {
        out.push({ card: c.id, problem: `branch "${br.when}" has the wrong number of parts` })
      }
      if (['is', 'includes', 'top', 'right', 'left'].includes(op) && opts.size && !opts.has(a)) {
        out.push({ card: c.id, problem: `branch "${br.when}" names option "${a}" which this card does not have` })
      }
      if (op === 'token' && (!toks.has(a) || (opts.size && !opts.has(b)))) {
        out.push({ card: c.id, problem: `branch "${br.when}" names an unknown token or option` })
      }
      if (!['is', 'includes', 'top', 'gte', 'lte', 'right', 'left', 'token', 'carried', 'always'].includes(op)) {
        out.push({ card: c.id, problem: `unknown condition "${br.when}"` })
      }
    }
    if (['pick', 'multi', 'swipe', 'rank', 'tokens'].includes(c.kind) && !(c.options?.length)) {
      out.push({ card: c.id, problem: `${c.kind} card has no options` })
    }
    if (c.kind === 'tokens' && !(c.tokens?.length)) out.push({ card: c.id, problem: 'tokens card has no tokens' })
    if (c.kind === 'slider' && !c.slider) out.push({ card: c.id, problem: 'slider card has no slider config' })
  }

  // every card reachable, and every path terminates (no cycles)
  const seen = new Set<string>()
  const walk = (id: string, stack: Set<string>) => {
    if (id === 'END' || !byId.has(id)) return
    if (stack.has(id)) { out.push({ card: id, problem: 'cycle' }); return }
    if (seen.has(id)) return
    seen.add(id)
    const c = byId.get(id)!
    const s2 = new Set(stack); s2.add(id)
    for (const t of [c.next, ...(c.branches ?? []).map((b) => b.goto)]) walk(t, s2)
  }
  walk(g.start, new Set())
  for (const c of g.cards) if (!seen.has(c.id)) out.push({ card: c.id, problem: 'unreachable' })
  return out
}

/* The default path: what someone sees if no branch ever fires. Used for the
   progress denominator and the time budget. */
export function mainPath(g: Graph): Card[] {
  const byId = new Map(g.cards.map((c) => [c.id, c]))
  const path: Card[] = []
  let id = g.start
  const guard = new Set<string>()
  while (id !== 'END' && byId.has(id) && !guard.has(id)) {
    guard.add(id)
    const c = byId.get(id)!
    path.push(c)
    id = c.next
  }
  return path
}
