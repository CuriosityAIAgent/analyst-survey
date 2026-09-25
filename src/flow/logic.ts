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

export function test(cond: string, own: Answer | undefined, all: Record<string, Answer>): boolean {
  const c = cond.trim()
  if (c === 'always') return true

  if (c.startsWith('carried:')) {
    const rest = c.slice('carried:'.length)
    const i = rest.indexOf(':')
    if (i < 0) return false
    const card = rest.slice(0, i)
    if (!(card in all)) return false            // never visited on this path
    return test(rest.slice(i + 1), all[card], all)
  }

  const [op, a, b] = c.split(':')
  const v = own
  switch (op) {
    case 'is':
      return typeof v === 'string' && v === a
    case 'includes':
      return Array.isArray(v) && v.includes(a)
    case 'top':
      return Array.isArray(v) && v[0] === a
    case 'gte':
      return typeof v === 'number' && v >= Number(a)
    case 'lte':
      return typeof v === 'number' && v <= Number(a)
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

export function nextId(card: Card, own: Answer | undefined, all: Record<string, Answer>): string {
  for (const br of card.branches ?? []) {
    if (test(br.when, own, all)) return br.goto
  }
  return card.next
}

/* ---------------------------------------------------------------------------
   Static checks on a graph. Run in tests and at build time: a broken graph is
   a content bug that strands respondents, so it must fail loudly, early.
--------------------------------------------------------------------------- */
export type GraphProblem = { card: string; problem: string }

export function checkGraph(g: Graph): GraphProblem[] {
  const out: GraphProblem[] = []
  const byId = new Map(g.cards.map((c) => [c.id, c]))
  if (byId.size !== g.cards.length) out.push({ card: '*', problem: 'duplicate card ids' })
  if (!byId.has(g.start)) out.push({ card: '*', problem: `start "${g.start}" does not exist` })

  for (const c of g.cards) {
    const targets = [c.next, ...(c.branches ?? []).map((b) => b.goto)]
    for (const t of targets) {
      if (t !== 'END' && !byId.has(t)) out.push({ card: c.id, problem: `goes to missing card "${t}"` })
    }
    const opts = new Set((c.options ?? []).map((o) => o.id))
    const toks = new Set((c.tokens ?? []).map((t) => t.id))
    for (const br of c.branches ?? []) {
      const [op, a, b] = br.when.split(':')
      if (op === 'carried') {
        const ref = a
        if (!byId.has(ref)) out.push({ card: c.id, problem: `carried: refers to missing card "${ref}"` })
        continue
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
