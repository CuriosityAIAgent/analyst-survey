import { describe, expect, it } from 'vitest'
import {
  BREAKS, BLOCK_ORDER, ENDING, PLAY_ORDER, QUESTION, QUESTIONS, SCENE, WELCOME,
  followUpFor, followUpOptions, followUpsFor, forChannel, matches, questionsFor, screensFor,
  type Answer, type Channel, type FollowUp, type Question,
} from './questions'
import { BLOCK_NAME } from './contract'
import { SPRITES } from '../game/art/sprites'

const CHANNELS: Channel[] = ['phone', 'desk']
const words = (s: string) => s.trim().split(/\s+/).filter(Boolean).length
const followUps = QUESTIONS.flatMap((q) => (q.followUps ?? []).map((f) => ({ q, f })))

/* Banned on screen: Haresh's list, plus the plan's section 4 list
   (climbing words, jargon, and idioms that trip a second-language reader). */
const BANNED = [
  // Haresh, 26 Sep
  'kit', 'pitch', 'camp', 'rope', 'cairn', 'walk on', 're-rig', 'crew',
  // plan section 4: climbing words
  'climb', 'climber', 'climbing', 'rookie', 'pack', 'stretch', 'base camp', 'summit', 'route', 'ridge',
  'track', 'clip', 'anchor', 'stones', 'own feet', 'storm', 'plaque', 'door', 'slot', 'lane', 'tokens',
  // plan section 4: jargon
  'policy', 'dropped', 'unsure', 'once proven', 'LLM', 'avatar', 'hypothesis', 'ECM', 'product shelf',
  'hunter', 'families',
  // plan section 4: idioms
  'top shelf', 'gives back', 'gets in the way', 'make Advisor', 'comes with time', 'tweaks', 'held it back',
  'least ready for', 'closest', 'were guaranteed', 'classmate', 'go with your gut', 'same you', 'same effort',
]
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
/** Whole-word (or whole-phrase), case-insensitive. */
const hasWord = (text: string, term: string) =>
  new RegExp(`(^|[^a-z0-9])${esc(term)}($|[^a-z0-9])`, 'i').test(text)

/* Every string a respondent can see or hear. Keys that are data, not copy, are skipped. */
const NOT_VISIBLE = new Set([
  'id', 'when', 'template', 'stores', 'measures', 'icon', 'art', 'block', 'channels',
  'unit', 'optionsFrom', 'glyph', 'kind',
])
function visibleStrings(value: unknown, where: string, out: { where: string; text: string }[] = []) {
  if (typeof value === 'string') out.push({ where, text: value })
  else if (Array.isArray(value)) value.forEach((v, i) => visibleStrings(v, `${where}[${i}]`, out))
  else if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) if (!NOT_VISIBLE.has(k)) visibleStrings(v, `${where}.${k}`, out)
  }
  return out
}
const ALL_VISIBLE = [
  ...visibleStrings(QUESTIONS, 'QUESTIONS'),
  ...visibleStrings(SCENE, 'SCENE'),
  ...visibleStrings(WELCOME, 'WELCOME'),
  ...visibleStrings(BREAKS, 'BREAKS'),
  ...visibleStrings(ENDING, 'ENDING'),
]

/** The labels that are answers on the parent screen (never the topic). Cards are topics, not answers. */
const answerLabels = (q: Question) => [
  ...q.options.map((o) => o.label),
  ...(q.constraints.stops ?? []).map((s) => s.label),
  ...(q.constraints.choices ?? []).map((c) => c.label),
  ...(q.constraints.trays ?? []).map((t) => t.label),
]

describe('ids and play order', () => {
  it('every question and follow-up id is unique', () => {
    const ids = [...QUESTIONS.map((q) => q.id), ...followUps.map(({ f }) => f.id), SCENE.id]
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('every answer key (stores) is unique', () => {
    const keys = [...QUESTIONS.map((q) => q.stores), ...followUps.map(({ f }) => f.stores), SCENE.stores]
    expect(new Set(keys).size).toBe(keys.length)
  })

  it('ids inside each list are unique', () => {
    const lists = [
      ...QUESTIONS.flatMap((q) => [q.options, q.constraints.cards, q.constraints.stops, q.constraints.trays, q.constraints.choices]),
      ...followUps.map(({ f }) => f.options),
    ]
    for (const list of lists) {
      if (!list) continue
      const ids = list.map((x) => x.id)
      expect(new Set(ids).size, ids.join(',')).toBe(ids.length)
    }
  })

  it('every PLAY_ORDER id exists', () => {
    for (const c of CHANNELS) for (const id of PLAY_ORDER[c]) expect(id === 'scene' || id in QUESTION, id).toBe(true)
  })

  it('no id is played twice on a channel', () => {
    for (const c of CHANNELS) expect(new Set(PLAY_ORDER[c]).size).toBe(PLAY_ORDER[c].length)
  })

  it('phone has 18 questions (17 plus 3.4), desktop all 25', () => {
    expect(QUESTIONS).toHaveLength(25)
    expect(questionsFor('phone')).toHaveLength(18)
    expect(questionsFor('desk')).toHaveLength(25)
  })

  it('the AI tools question (3.4) is on both channels', () => {
    expect(QUESTION['q3.4'].channels).toEqual(['phone', 'desk'])
    expect(PLAY_ORDER.phone).toContain('q3.4')
    expect(PLAY_ORDER.desk).toContain('q3.4')
  })

  it("each question's channels match the play orders it appears in", () => {
    for (const q of QUESTIONS) {
      for (const c of CHANNELS) expect(PLAY_ORDER[c].includes(q.id), `${q.id} on ${c}`).toBe(q.channels.includes(c))
    }
  })

  it('the phone order is the desktop order with desktop-only questions removed', () => {
    const phone = new Set(PLAY_ORDER.phone)
    expect(PLAY_ORDER.desk.filter((id) => phone.has(id))).toEqual(PLAY_ORDER.phone)
  })

  it('blocks run in order, each in one piece', () => {
    for (const c of CHANNELS) {
      const blocks = PLAY_ORDER[c].map((id) => (id === 'scene' ? SCENE.block : QUESTION[id].block))
      const idx = blocks.map((b) => BLOCK_ORDER.indexOf(b))
      for (let i = 1; i < idx.length; i++) expect(idx[i], `${c} at ${PLAY_ORDER[c][i]}`).toBeGreaterThanOrEqual(idx[i - 1])
      expect(new Set(blocks)).toEqual(new Set(BLOCK_ORDER))
    }
  })

  it('the scene comes straight after 2.1 in play order, and the podium opens the game', () => {
    for (const c of CHANNELS) {
      const o = PLAY_ORDER[c]
      expect(o.indexOf('scene')).toBe(o.indexOf('q2.1') + 1)
      expect(o[0]).toBe('q1.2')
      expect(o[o.length - 1]).toBe('qC2')
    }
  })

  it('the look-back block ends with the sensitive questions', () => {
    const lookBack = (c: Channel) => PLAY_ORDER[c].filter((id) => id !== 'scene' && QUESTION[id].block === 'look-back')
    expect(lookBack('desk').slice(-2)).toEqual(['q1.4', 'q1.5'])
    expect(lookBack('phone').slice(-1)).toEqual(['q1.4'])
  })

  it('screensFor numbers the questions and puts a break between each block', () => {
    for (const c of CHANNELS) {
      const screens = screensFor(c)
      const qs = screens.filter((s) => s.kind === 'question')
      expect(qs.map((s) => (s.kind === 'question' ? s.n : 0))).toEqual(qs.map((_, i) => i + 1))
      for (const s of qs) if (s.kind === 'question') expect(s.total).toBe(questionsFor(c).length)
      expect(screens.filter((s) => s.kind === 'break').map((s) => (s.kind === 'break' ? s.block : ''))).toEqual(BLOCK_ORDER.slice(1))
      expect(screens.filter((s) => s.kind === 'scene')).toHaveLength(1)
    }
  })

  it('on a phone the scene sits after the "A new Analyst\'s time" break, directly before 3.1', () => {
    const phone = screensFor('phone')
    const i = phone.findIndex((s) => s.kind === 'scene')
    expect(phone[i - 1]).toMatchObject({ kind: 'break', block: 'analyst-time' })
    expect(phone[i + 1]).toMatchObject({ kind: 'question', question: { id: 'q3.1' } })
    const desk = screensFor('desk')
    const j = desk.findIndex((s) => s.kind === 'scene')
    expect(desk[j - 1]).toMatchObject({ kind: 'question', question: { id: 'q2.1' } })
    expect(desk[j + 1]).toMatchObject({ kind: 'question', question: { id: 'q2.3' } })
  })
})

describe('wording rules', () => {
  const allAsks = [
    ...QUESTIONS.flatMap((q) => CHANNELS.map((c) => ({ ...forChannel(q, c), id: `${q.id} (${c})` }))),
    ...followUps.map(({ f }) => f),
  ]

  it('every question is at most 14 words', () => {
    for (const q of allAsks) expect(words(q.question), `${q.id}: ${q.question}`).toBeLessThanOrEqual(14)
  })

  it('every instruction is at most 10 words', () => {
    for (const q of allAsks) expect(words(q.instruction), `${q.id}: ${q.instruction}`).toBeLessThanOrEqual(10)
  })

  it('every question ends in "?" (5.6 is a sentence to finish)', () => {
    for (const q of allAsks) if (!q.id.startsWith('q5.6')) expect(q.question.endsWith('?'), q.id).toBe(true)
  })

  it('the instruction states the same count the constraints enforce', () => {
    const NUM: Record<string, number> = { one: 1, two: 2, three: 3 }
    for (const q of allAsks) {
      const i = q.instruction
      const k = q.constraints
      let m: RegExpMatchArray | null
      if ((m = i.match(/^(?:Tap|Pick) (one|two|three)\b/)) && !k.stops) expect(k.pick, q.id).toBe(NUM[m[1]])
      if ((m = i.match(/^Pick your top (\d+)/))) expect(k.pick, q.id).toBe(Number(m[1]))
      if ((m = i.match(/(\d+) cards\.$/))) expect(k.cards?.length, q.id).toBe(Number(m[1]))
      if ((m = i.match(/^Place (\d+) of the (\d+)\./))) {
        expect(k.pick, q.id).toBe(Number(m[1]))
        expect(q.options.length, q.id).toBe(Number(m[2]))
        expect(k.trays?.reduce((n, t) => n + (t.capacity ?? 0), 0), q.id).toBe(Number(m[1]))
      }
      if ((m = i.match(/^Place all (\d+)\./))) {
        expect(k.pick, q.id).toBe(Number(m[1]))
        expect(q.options.length, q.id).toBe(Number(m[1]))
      }
      if (/^Pick any, or skip\./.test(i)) expect(k.min, q.id).toBe(0)
      else if (/^Pick any\./.test(i)) expect(k.min, q.id).toBe(1)
    }
  })

  it('the bottle pours 8 hours and says so', () => {
    const q = QUESTION['q3.3']
    expect(q.constraints.total).toBe(8)
    expect(q.question).toContain('8 hours')
    expect(q.objectText?.counter).toContain('of 8 hours left')
  })

  it('no banned word appears in any visible string', () => {
    expect(ALL_VISIBLE.length).toBeGreaterThan(300)
    const hits = ALL_VISIBLE.flatMap(({ where, text }) =>
      [...BANNED.filter((t) => hasWord(text, t)), ...(text.includes('&') ? ['&'] : [])].map((t) => `${where}: "${t}" in "${text}"`))
    expect(hits).toEqual([])
  })

  it('the banned-word check really catches climbing words', () => {
    expect(hasWord('Walk on', 'walk on')).toBe(true)
    expect(hasWord('Re-rig parts', 're-rig')).toBe(true)
    expect(hasWord('Your navigation kit', 'kit')).toBe(true)
    expect(hasWord('kitchen', 'kit')).toBe(false)
    expect(hasWord('Europe', 'rope')).toBe(false)
  })

  it('1.4 and 1.5 carry a privacy line; the welcome carries the full one', () => {
    expect(QUESTION['q1.4'].privacy).toBeTruthy()
    expect(QUESTION['q1.5'].privacy).toBeTruthy()
    expect(WELCOME.privacy).toBe('Your answers are held under a code, not your name. We only report groups of ten or more.')
  })
})

describe('follow-ups', () => {
  it('every follow-up has a bridge that names its topic: "One more on <topic>."', () => {
    for (const { f } of followUps) expect(f.bridge, f.id).toMatch(/^One more on [^.]+\.$/)
  })

  it("no bridge contains any of its parent's answer labels", () => {
    for (const { q, f } of followUps) {
      for (const label of answerLabels(q)) expect(hasWord(f.bridge, label), `${f.id}: "${label}" in "${f.bridge}"`).toBe(false)
    }
  })

  it('the plan-fixed bridge and classroom follow-up are word for word', () => {
    const f = QUESTION['q4.4'].followUps!.find((x) => x.id === 'q4.4.classroom')!
    expect(f.bridge).toBe('One more on classroom training.')
    expect(f.question).toBe('Should it be required?')
    expect(f.options.map((o) => o.label)).toEqual(['Yes, always', "Yes, unless there's a client meeting", 'No, optional'])
  })

  it('every id a `when` names exists on the parent', () => {
    for (const { q, f } of followUps) {
      const [op, a, b] = f.when.split(':')
      const optionIds = new Set([...q.options, ...(q.constraints.stops ?? [])].map((x) => x.id))
      const cardIds = new Set([...(q.constraints.cards ?? []), ...q.options].map((x) => x.id))
      const answerIds = new Set([...q.options, ...(q.constraints.trays ?? [])].map((x) => x.id))
      if (op === 'is' || op === 'includes') for (const id of a.split('|')) expect(optionIds.has(id), `${f.id}: ${id}`).toBe(true)
      if (op === 'card') {
        expect(cardIds.has(a), `${f.id}: card ${a}`).toBe(true)
        for (const id of b.split('|')) expect(answerIds.has(id), `${f.id}: ${id}`).toBe(true)
      }
    }
  })

  /* For each follow-up: answers that must call for it, and answers that must not. */
  function probes(q: Question, f: FollowUp): { hit: Answer[]; miss: Answer[] } {
    const [op, a, b] = f.when.split(':')
    const other = (ids: string[], pool: { id: string }[]) => pool.map((x) => x.id).find((id) => !ids.includes(id))!
    switch (op) {
      case 'always':
        return { hit: ['anything', ['x'], { x: 'y' }, 0], miss: [] }
      case 'is': {
        const ids = a.split('|')
        return { hit: ids, miss: [other(ids, [...q.options, ...(q.constraints.stops ?? [])])] }
      }
      case 'includes': {
        const ids = a.split('|')
        return { hit: ids.map((id) => [id, other(ids, q.options)]), miss: [[other(ids, q.options)], []] }
      }
      case 'card': {
        const ids = b.split('|')
        const pool = [...q.options, ...(q.constraints.trays ?? [])]
        return { hit: ids.map((id) => ({ [a]: id })), miss: [{ [a]: other(ids, pool) }, { [`not-${a}`]: ids[0] }] }
      }
      default:
        throw new Error(`untested op ${op} in ${f.id}`)
    }
  }

  it('followUpFor / followUpsFor fire for each `when`, and only then', () => {
    // 1.1, 1.3, 4.4 (x2), 5.1, 2.3, 3.1, 3.2 (x5, one per task), 3.4, 5.5
    expect(followUps.length).toBe(14)
    for (const { q, f } of followUps) {
      const { hit, miss } = probes(q, f)
      for (const ans of hit) expect(followUpsFor(q, ans), `${f.id} should fire on ${JSON.stringify(ans)}`).toContain(f)
      for (const ans of miss) expect(followUpsFor(q, ans), `${f.id} should not fire on ${JSON.stringify(ans)}`).not.toContain(f)
      expect(followUpsFor(q, undefined)).toEqual([])
      expect(followUpsFor(q, null)).toEqual([])
    }
  })

  it('followUpFor returns the first; followUpsFor returns all, in order', () => {
    const q44 = QUESTION['q4.4']
    expect(followUpFor(q44, ['ai-client', 'classroom'])?.id).toBe('q4.4.classroom')
    expect(followUpsFor(q44, ['ai-client', 'classroom']).map((f) => f.id)).toEqual(['q4.4.classroom', 'q4.4.ai-client'])
    expect(followUpFor(q44, ['role-plays', 'examples'])).toBeUndefined()

    const q32 = QUESTION['q3.2']
    const two = { portfolio: 'by-hand', outreach: 'ai-drafts', briefs: 'by-hand', onboarding: 'stop', crm: 'someone-else' }
    expect(followUpsFor(q32, two).map((f) => f.id)).toEqual(['q3.2.why.portfolio', 'q3.2.why.briefs'])
    expect(followUpFor(q32, two)?.question).toBe('Why should Analysts still do portfolio analysis by hand?')

    expect(followUpFor(QUESTION['q1.1'], 'not-yet')).toBeUndefined()
    expect(followUpFor(QUESTION['q1.1'], 'y2')?.id).toBe('q1.1.what')
    expect(followUpFor(QUESTION['q5.1'], 'on-time')).toBeUndefined()
    expect(followUpFor(QUESTION['q5.1'], 'months-before')?.id).toBe('q5.1.blocker')
    expect(followUpFor(QUESTION['q3.4'], { meetings: 'day-one' })?.id).toBe('q3.4.first')
    expect(followUpFor(QUESTION['q3.4'], { meetings: 'proven' })).toBeUndefined()
    expect(followUpFor(QUESTION['q5.5'], { certify: 'yes' })?.id).toBe('q5.5.prove')
    expect(followUpFor(QUESTION['q5.5'], { certify: 'not-sure' })).toBeUndefined()
  })

  it('every follow-up whose options depend on the answer resolves them', () => {
    const q23 = QUESTION['q2.3']
    const less = q23.followUps![0]
    const shown = followUpOptions(q23, less, ['new-clients', 'decide', 'ai-tools']).map((o) => o.id)
    expect(shown).toHaveLength(5)
    expect(shown).not.toContain('decide')

    const q31 = QUESTION['q3.1']
    const fastest = q31.followUps![0]
    const sort = { 'client-meetings': 'more', presenting: 'more', morning: 'more', decks: 'less', crm: 'less', classroom: 'differently', portfolio: 'differently' }
    expect(followUpOptions(q31, fastest, sort).map((o) => o.id)).toEqual(['client-meetings', 'presenting', 'morning'])

    const q44 = QUESTION['q4.4']
    const classroom = q44.followUps![0]
    expect(followUpOptions(q44, classroom, ['classroom'])).toBe(classroom.options)
  })
})

describe('the `when` mini-language', () => {
  it('is, includes, card with alternatives', () => {
    expect(matches('is:a', 'a')).toBe(true)
    expect(matches('is:a|b', 'b')).toBe(true)
    expect(matches('is:a', 'c')).toBe(false)
    expect(matches('is:30', 30)).toBe(true)
    expect(matches('is:a', ['a'])).toBe(false)
    expect(matches('includes:a', ['x', 'a'])).toBe(true)
    expect(matches('includes:a|b', ['b'])).toBe(true)
    expect(matches('includes:a', 'a')).toBe(false)
    expect(matches('card:c:yes', { c: 'yes' })).toBe(true)
    expect(matches('card:c:yes|not-sure', { c: 'not-sure' })).toBe(true)
    expect(matches('card:c:yes', { c: 'no' })).toBe(false)
    expect(matches('card:c:yes', { d: 'yes' })).toBe(false)
    expect(matches('card:c:yes', ['c'])).toBe(false)
  })

  it('lte and gte compare numbers only', () => {
    expect(matches('lte:24', 24)).toBe(true)
    expect(matches('lte:24', 18)).toBe(true)
    expect(matches('lte:24', 27)).toBe(false)
    expect(matches('gte:36', 36)).toBe(true)
    expect(matches('gte:36', 48)).toBe(true)
    expect(matches('gte:36', 33)).toBe(false)
    expect(matches('gte:36', 'when-ready')).toBe(false)
    expect(matches('lte:24', '12')).toBe(false)
  })

  it('always fires once answered; nothing fires unanswered', () => {
    expect(matches('always', 'x')).toBe(true)
    expect(matches('always', 0)).toBe(true)
    expect(matches('always', [])).toBe(true)
    for (const w of ['always', 'is:a', 'includes:a', 'lte:1', 'gte:1', 'card:c:x']) {
      expect(matches(w, undefined)).toBe(false)
      expect(matches(w, null)).toBe(false)
    }
  })

  it('a malformed expression throws', () => {
    for (const w of ['', 'nope', 'is:', 'is:a||b', 'lte:x', 'gte:', 'card:c', 'card::x', 'maybe:a']) {
      expect(() => matches(w, 'a'), w).toThrow()
    }
  })

  it('every `when` in the script parses', () => {
    for (const { f } of followUps) expect(() => matches(f.when, 'probe'), f.id).not.toThrow()
  })
})

describe('art, welcome, breaks, scene, ending', () => {
  it('every icon and art id is an existing 3D render, and none is retired art', () => {
    const RETIRED = /^(gear-|brick-|zone-|card-|fu-|rucksack|tarp-out|bench-rerig|rope-clips|cairn|signpost|luggage-tag|trait-depth|trait-curiosity)/
    const ids = [
      ...QUESTIONS.flatMap((q) => [
        ...(q.art ?? []),
        ...q.options.map((o) => o.icon),
        ...(q.constraints.cards ?? []).map((c) => c.icon),
      ]),
      ...followUps.flatMap(({ f }) => f.options.map((o) => o.icon)),
    ].filter((x): x is string => !!x)
    expect(ids.length).toBeGreaterThan(0)
    for (const id of ids) {
      expect(id in SPRITES, id).toBe(true)
      expect(RETIRED.test(id), id).toBe(false)
    }
  })

  it('the welcome states the honest length per channel', () => {
    expect(WELCOME.lines.phone[0]).toBe('18 questions. Some have a few quick cards to sort. About 8 minutes.')
    expect(WELCOME.lines.desk[0]).toMatch(/^25 questions\. Some have a few quick cards to sort\. About \d+ minutes\.$/)
    expect(WELCOME.sections).toEqual(BLOCK_ORDER.map((b) => BLOCK_NAME[b]))
    expect(WELCOME.start).toBe('Start')
  })

  it('one break per block, with the plain block name', () => {
    for (const b of BLOCK_ORDER) {
      expect(BREAKS[b].name).toBe(BLOCK_NAME[b])
      expect(words(BREAKS[b].line)).toBeLessThanOrEqual(10)
    }
  })

  it('the scene is worded as an explicit hypothetical, not as the bank\'s plan', () => {
    expect(SCENE.lines[0]).toMatch(/^Imagine/)
    expect(SCENE.lines.join(' ')).not.toMatch(/bank's plan/i)
    expect(SCENE.assumption).toBe("You don't have to agree. Just assume it for the next few questions.")
    expect(SCENE.calendar).toEqual({ from: 2026, to: 2031 })
    expect(SCENE.channels).toEqual(['phone', 'desk'])
  })

  it('the ending says the idea plainly', () => {
    expect(ENDING.line).toBe('AI can help. You still do the work.')
    expect(ENDING.thanks).toMatch(/^Thank you/)
    // no false claim: the ending is shown only after the server stored the answers
    expect(ENDING.thanks).not.toMatch(/close this tab/i)
    expect(ENDING.retry).toBe("Couldn't send. Tap to try again.")
  })

  it('the sensitive screens promise what is true (a code, groups of ten), never "Anonymous"', () => {
    for (const id of ['q1.4', 'q1.5']) expect(QUESTION[id].privacy).toBe('Only reported in groups of ten or more.')
    const all = JSON.stringify([QUESTIONS, SCENE, WELCOME, BREAKS, ENDING])
    expect(all).not.toMatch(/anonymous/i)
  })

  it('3.2 "why by hand" answers are about Analysts, not the respondent', () => {
    for (const f of QUESTION['q3.2'].followUps ?? []) {
      for (const o of f.options) expect(o.label, o.label).not.toMatch(/\b(me|my)\b/i)
    }
  })

  it('4.2 has no off-topic option', () => {
    expect(QUESTION['q4.2'].options.map((o) => o.id)).not.toContain('role')
  })
})

describe('channel differences', () => {
  it('1.2 is top 2 on phone and top 3 on desktop', () => {
    const phone = forChannel(QUESTION['q1.2'], 'phone')
    const desk = forChannel(QUESTION['q1.2'], 'desk')
    expect([phone.instruction, phone.constraints.pick]).toEqual(['Pick your top 2, best first.', 2])
    expect([desk.instruction, desk.constraints.pick]).toEqual(['Pick your top 3, best first.', 3])
  })
})
