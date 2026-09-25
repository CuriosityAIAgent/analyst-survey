/* Walk the live survey in real Chrome at phone width, answering every card the
   way a person would (taps, swipes, token drops, typing), on several seeded
   random routes. Driven by flow.json, not hardcoded prompts, so it keeps
   working when the questions change.

   For each step it checks: the question on screen is the card the store says
   is current; the card can be answered and left; nothing overflows 390px.
   At the end: every route reached the summit, which cards were covered, and
   any page errors.   Usage: node e2e/flow.mjs [routes=8] [url] */
import puppeteer from 'puppeteer-core'
import { readFileSync } from 'node:fs'

const ROUTES = Number(process.argv[2] ?? 12)
const SITE = process.argv[3] ?? 'http://localhost:3000'
const G = JSON.parse(readFileSync(new URL('../src/content/flow.json', import.meta.url)))
const CARD = new Map(G.cards.map((c) => [c.id, c]))
const wait = (ms) => new Promise((r) => setTimeout(r, ms))
// SHOTS=<dir>: screenshot every card of the first route, and token cards once filled
const SHOTS = process.env.SHOTS
let shotRun = false
const shot = async (name) => { if (SHOTS && shotRun) await p.screenshot({ path: `${SHOTS}/${name}.png`, fullPage: true }) }

const br = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new',
})
const p = await br.newPage()
await p.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
const errs = []
p.on('pageerror', (e) => errs.push(String(e).slice(0, 160)))

const state = () => p.evaluate(() => JSON.parse(localStorage.getItem('ascent-flow-v1') ?? '{}').state ?? {})
const h1 = () => p.evaluate(() => document.querySelector('main h1')?.textContent?.trim())
// click the n-th element matching sel inside the card
const tap = (sel, n = 0) => p.evaluate((sel, n) => {
  const el = document.querySelectorAll(`main section ${sel}`)[n]
  if (!el) return false
  el.scrollIntoView({ block: 'center' }); el.click(); return true
}, sel, n)
const button = (text) => p.evaluate((t) => {
  const b = [...document.querySelectorAll('main button')].find((x) => x.textContent.trim() === t && !x.disabled)
  if (!b) return false
  b.scrollIntoView({ block: 'center' }); b.click(); return true
}, text)

function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32) }

async function answer(card, r) {
  const n = (card.options ?? []).length
  switch (card.kind) {
    case 'show': return button('Continue')
    case 'pick': return tap('button[aria-pressed]', Math.floor(r() * n))
    case 'multi': {
      const k = 1 + Math.floor(r() * Math.min(card.max ?? n, 3))
      const idx = [...Array(n).keys()].sort(() => r() - 0.5).slice(0, k)
      for (const i of idx) { await tap('button[aria-pressed]', i); await wait(40) }
      return button('Next')
    }
    case 'slider': {
      const stops = await p.evaluate(() => document.querySelectorAll('main section [role=radio]').length)
      await tap('[role=radio]', Math.floor(r() * stops)); await wait(60)
      return button('Next')
    }
    case 'swipe':
      for (let i = 0; i < n; i++) {
        const side = r() < 0.5 ? '← ' + card.sides.left : card.sides.right + ' →'
        if (!(await button(side))) return false
        await wait(120)
      }
      return true
    case 'rank':
      for (let i = 0; i < 3; i++) { await tap('button[aria-label^="Move"][aria-label$="down"]:not([disabled])', Math.floor(r() * (n - 1))); await wait(40) }
      return button('Next')
    case 'tokens': {
      for (const t of card.tokens) {
        await p.evaluate((l) => {
          const b = [...document.querySelectorAll('main [role=radiogroup] [role=radio]')].find((x) => x.textContent.trim().startsWith(l)); b?.click()
        }, t.label)
        await wait(40)
        // oneEach: a second token of a colour on the same row is refused, so use different rows
        const rows = card.oneEach ? [...Array(n).keys()].sort(() => r() - 0.5) : null
        for (let i = 0; i < t.count; i++) { await tap('button[aria-label^="Place"]', rows ? rows[i] : Math.floor(r() * n)); await wait(40) }
      }
      await shot(`${card.id}-filled`)
      return button('Next')
    }
    case 'text':
      if (card.optional && r() < 0.3) return button('Skip')
      await p.focus('main textarea'); await p.keyboard.type('More live client meetings, earlier.')
      return button('Next')
  }
  return false
}

const seen = new Set(), problems = [], lengths = []
for (let run = 0; run < ROUTES; run++) {
  const r = rng(7919 * (run + 1))
  shotRun = run === 0
  await p.goto(SITE, { waitUntil: 'networkidle2' }); await p.evaluate(() => localStorage.clear())
  await p.goto(SITE, { waitUntil: 'networkidle2' }); await wait(700)
  if (!(await button('Begin the climb'))) { problems.push(`run ${run}: no start button`); continue }
  await wait(500)
  let steps = 0
  for (; steps < 90; steps++) {
    const st = await state()
    const id = st.path?.at(-1)
    if (id === 'END') break
    const card = CARD.get(id)
    const shown = await h1()
    if (!card) { problems.push(`run ${run}: store is on unknown card ${id}`); break }
    if (shown !== card.prompt) { problems.push(`run ${run}: store on ${id} but screen shows "${shown}"`); break }
    seen.add(id)
    await shot(`${String(steps + 1).padStart(2, '0')}-${id}`)
    const wide = await p.evaluate(() => document.documentElement.scrollWidth)
    if (wide > 391) problems.push(`run ${run}: ${id} overflows (${wide}px)`)
    if (!(await answer(card, r))) { problems.push(`run ${run}: could not answer ${id} (${card.kind})`); break }
    await wait(card.kind === 'pick' || card.kind === 'swipe' ? 520 : 380)
    const after = (await state()).path?.at(-1)
    if (after === id) { problems.push(`run ${run}: stuck on ${id} (${card.kind})`); break }
  }
  const end = await h1()
  await shot('99-summit')
  lengths.push(steps)
  if (end !== "That's the route.") problems.push(`run ${run}: ended on "${end}" after ${steps} cards`)
}

const unseen = G.cards.filter((c) => !seen.has(c.id)).map((c) => c.id)
// coverage is a gate once enough routes are walked to expect it (12 by default)
if (ROUTES >= 10 && unseen.length) problems.push(`not reached in ${ROUTES} routes: ${unseen.join(', ')}`)
console.log(`routes walked: ${ROUTES}, cards per route: ${Math.min(...lengths)}-${Math.max(...lengths)}`)
console.log(`cards covered: ${seen.size}/${G.cards.length}${unseen.length ? ' (not reached: ' + unseen.join(', ') + ')' : ''}`)
console.log('problems:', problems.length ? '\n  ' + problems.join('\n  ') : 'none')
console.log('page errors:', errs.length ? errs : 'none')
await br.close()
process.exit(problems.length || errs.length ? 1 : 0)
