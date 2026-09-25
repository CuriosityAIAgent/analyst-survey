/* Parity (design 9 and 11.5): one scripted answer set, driven through the
   phone (390x660) and the desk (1440x790; DESK=1280x600 for
   another size), with the same seed. The stored answers must be deep-equal;
   only the channel (meta, never in answers) may differ.

   Held out of the comparison (they measure time, not choice): t.start,
   t.complete, summit.dragMs, calls.<card>.ms and the `t` of each kit.events
   entry.

   The script uses the inputs both channels share: real pointer drags
   between the same test ids, taps, typing, and the sliders' own keys.
     node e2e/game-parity.mjs [--route=A|B] [--keep]   (--keep: print both answer sets)
   Needs the dev server on http://localhost:3000. Exit 1 on any difference. */
import puppeteer from 'puppeteer-core'

const args = process.argv.slice(2)
const flag = (n) => args.includes(`--${n}`)
const opt = (n, d) => { const a = args.find((x) => x.startsWith(`--${n}=`)); return a ? a.split('=').slice(1).join('=') : d }
const BASE = process.env.BASE || 'http://localhost:3000'
const DESK = process.env.DESK && /^\d+x\d+$/.test(process.env.DESK) ? process.env.DESK : '1440x790'
const SEED = 424242
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const ROUTES = {
  // every follow-up on the first route: F1, F2a, F3a, F4, F5 (B)
  A: {
    board: { rucksack: ['classroom', 'meetings', 'debrief'], hand: ['present'], out: ['admin', 'formatting'], rerig: ['ops', 'morning'] },
    f1: 'clientFirst', rule: 'sat across from a client who said no',
    paceKeys: 2, readyAt: 24, f2: 'pitch',
    lanes: { map: 'day1', compass: 'day1', guidebook: 'day1', gps: 'proven', radio: 'none', brief: 'day1' }, f3: 'spotWrong',
    pitches: { p_portfolio: 'own', p_outreach: 'withkit', p_brief: 'own', p_onboard: 'crew', p_crm: 'kitdrafts' },
    calls: { certify: 'policy', aiclient: 'unsure', agents: 'policy', freedtime: 'drop' }, f4: 'observed',
    rope: 5, f5: 'debrief', top3: ['reading', 'judgement', 'calm'], origin: 'built', mark: 3,
    change: 'A second Advisor for a quarter',
  },
  // the other branches: no F1, F2b, F3b, no F4, F5 (A)
  B: {
    board: { rucksack: ['meetings', 'present', 'portfolio'], hand: ['meetings'], out: ['admin', 'roleplay'], rerig: ['ops', 'formatting'] },
    rule: '', paceKeys: 6, readyAt: 'notYet', f2: 'trust',
    lanes: { map: 'day1', compass: 'day1', guidebook: 'proven', gps: 'proven', radio: 'none', brief: 'proven' }, f3: 'signoff',
    pitches: { p_portfolio: 'crew', p_outreach: 'kitdrafts', p_brief: 'withkit', p_onboard: 'crew', p_crm: 'kitdrafts' },
    calls: { certify: 'drop', aiclient: 'policy', agents: 'unsure', freedtime: 'policy' },
    rope: 2, f5: 'mentor', top3: ['hunter', 'depth', 'story'], origin: 'born', mark: 5, change: '',
  },
}
const R = ROUTES[opt('route', 'A')]

const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: 'new',
  args: ['--hide-scrollbars'],
})

async function run(channel) {
  const desk = channel === 'desk'
  const [W, H] = desk ? DESK.split('x').map(Number) : [390, 660]
  const ctx = await browser.createBrowserContext()
  const page = await ctx.newPage()
  const errors = []
  const log = []
  page.on('pageerror', (e) => errors.push(e.message.split('\n')[0]))
  await page.setViewport({ width: W, height: H, deviceScaleFactor: 1 }) // as game-walk: pointer events from the mouse on both
  // the same seed on both channels, in place before the app's first script
  await page.evaluateOnNewDocument((seed) => {
    if (sessionStorage.getItem('parity-seeded')) return
    sessionStorage.setItem('parity-seeded', '1')
    localStorage.clear()
    localStorage.setItem('ascent-game-v1', JSON.stringify({ state: { seed }, version: 1 }))
  }, SEED)
  await page.goto(BASE + '/?business=uspb&cohort=2024', { waitUntil: 'networkidle2' })
  await page.addStyleTag({ content: 'nextjs-portal{display:none!important}' }).catch(() => {})
  await page.waitForSelector('[data-game]')
  await sleep(600)

  const state = () => page.evaluate(() => JSON.parse(localStorage.getItem('ascent-game-v1') || '{}').state ?? {})
  const step = () => page.$eval('[data-game]', (g) => (g.getAttribute('data-finished') === 'true' ? 'END' : g.getAttribute('data-step')))
  const center = async (sel) => {
    const el = await page.waitForSelector(sel, { visible: true, timeout: 5000 })
    const b = await el.boundingBox()
    return { x: b.x + b.width / 2, y: b.y + b.height / 2 }
  }
  async function drag(a, b, steps = 16) {
    await page.mouse.move(a.x, a.y)
    await page.mouse.down()
    for (let i = 1; i <= steps; i++) await page.mouse.move(a.x + ((b.x - a.x) * i) / steps, a.y + ((b.y - a.y) * i) / steps)
    await page.mouse.up()
    await sleep(300)
  }
  const dragSel = async (a, b) => drag(await center(a), await center(b))
  const tap = async (sel) => { const c = await center(sel); await page.mouse.click(c.x, c.y); await sleep(180) }
  const primary = async () => {
    const sel = (await page.$('[data-testid="walk-on"]')) ? '[data-testid="walk-on"]' : '[data-testid="primary"]'
    await tap(sel)
  }
  const walkOn = async () => {
    await page.waitForSelector('[data-camp-walk][data-enabled="true"]', { timeout: 4000 }).catch(() => {})
    await tap('[data-testid="walk-on"]')
  }
  async function moveOn(from) {
    await page.waitForFunction((s) => {
      const g = document.querySelector('[data-game]')
      return g && (g.getAttribute('data-step') !== s || g.getAttribute('data-finished') === 'true')
    }, { timeout: 7000 }, from).catch(() => log.push(`${from} did not move on`))
    await page.waitForFunction(() => document.querySelectorAll('[data-active-step]').length === 1, { timeout: 3000 }).catch(() => {})
    await sleep(550)
  }

  const D = {
    'S01#A': () => primary(),
    S02: async () => {
      for (const zone of ['rucksack', 'hand', 'out', 'rerig']) {
        const list = R.board[zone]
        for (let i = 0; i < list.length; i++) await dragSel(`[data-item="${list[i]}"]`, `[data-testid="slot-${zone}:${i}"]`)
      }
      await walkOn()
    },
    F1: () => tap(`[data-testid="door-${R.f1}"]`),
    S03: async () => {
      if (R.rule) { await tap('[data-testid="rule-input"]'); await page.keyboard.type(R.rule, { delay: 8 }); await page.keyboard.press('Enter') }
      else await primary()
    },
    'S04#A': async () => {
      await page.focus('[data-testid="s04-range"]')
      for (let i = 0; i < R.paceKeys; i++) { await page.keyboard.press('ArrowUp'); await sleep(120) }
      await sleep(600)
      await primary()
    },
    'S04#B': async () => {
      await tap(`[data-testid="s04-self-${R.readyAt === 'notYet' ? 'notyet' : R.readyAt}"]`)
      await walkOn()
    },
    F2a: () => dragSel('[data-testid="f2a-rookie"]', `[data-testid="f2a-ledge-${R.f2}"]`),
    F2b: () => tap(`[data-testid="f2b-${R.f2}"]`),
    S05: async () => {
      for (const [b, lane] of Object.entries(R.lanes)) await dragSel(`[data-testid="brick-${b}"]`, `[data-testid="lane-${lane}"]`)
      await primary()
    },
    F3a: () => tap(`[data-testid="opt-${R.f3}"]`),
    F3b: () => tap(`[data-testid="opt-${R.f3}"]`),
    F3c: () => tap(`[data-testid="opt-${R.f3}"]`),
    S06: async () => {
      let own = 0
      for (const [id, z] of Object.entries(R.pitches)) {
        await dragSel(`[data-testid="pitch-${id}"]`, z === 'own' ? `[data-testid="slot-own:${own++}"]` : `[data-testid="zone-${z}"]`)
      }
      await walkOn()
    },
    S07: async () => {
      for (let n = 0; n < 4; n++) {
        const top = await page.$eval('[data-swipe-stack] [data-testid^="card-"]', (e) => e.getAttribute('data-testid').slice(5)).catch(() => null)
        if (!top) break
        await tap(`[data-testid="call-${R.calls[top]}"]`)
        await sleep(750)
      }
      await primary()
    },
    F4: () => dragSel(`[data-testid="method-${R.f4}"]`, '[data-testid="zone-plaque"]'),
    S08: async () => {
      await page.focus('[data-testid="s08-range"]')
      for (let i = 0; i < R.rope; i++) { await page.keyboard.press('ArrowRight'); await sleep(120) }
      await sleep(500)
      await primary()
    },
    F5: () => dragSel(`[data-testid="f5-tag-${R.f5}"]`, '[data-testid="f5-clip"]'),
    'S09#A': async () => {
      for (let k = 0; k < 3; k++) await dragSel(`[data-testid="tray"] [data-testid="tile-${R.top3[k]}"]`, `[data-testid="clip-${k + 1}"]`)
      await primary()
    },
    'S09#B': async () => { await tap(`[data-testid="origin-${R.origin}"]`); await sleep(400) },
    'S10#A': async () => {
      for (let i = 0; i < R.mark; i++) await dragSel('[data-testid="stone-0"]', '[data-testid="cairn"]')
      await primary()
    },
    'S10#B': async () => {
      if (R.change) { await tap('[data-testid="tag-input"]'); await page.keyboard.type(R.change, { delay: 8 }) }
      await primary()
    },
    S11: () => tap('[data-testid="skip"]'),
  }

  const seen = []
  for (let i = 0; i < 40; i++) {
    const st = await step()
    if (st === 'END') break
    if (seen.filter((x) => x === st).length > 1) { log.push(`stuck on ${st}`); break }
    seen.push(st)
    const drive = D[st]
    if (!drive) { log.push(`no driver for ${st}`); break }
    try { await drive() } catch (e) { log.push(`${st}: ${e.message.split('\n')[0]}`) }
    await moveOn(st)
  }
  const s = await state()
  const layout = await page.$eval('[data-game]', (g) => g.getAttribute('data-layout'))
  await ctx.close()
  return { channel, layout, answers: s.answers ?? {}, stored: s.channel, seen, log, errors, finished: s.finished === true }
}

/** The answers as compared: timing held out. */
function comparable(a) {
  const c = structuredClone(a)
  for (const k of ['t.start', 't.complete', 'summit.dragMs']) delete c[k]
  // per-call decision time (calls.<card>.ms)
  for (const v of Object.values(c.calls ?? {})) if (v && typeof v === 'object') delete v.ms
  if (Array.isArray(c['kit.events'])) c['kit.events'] = c['kit.events'].map(({ t, ...e }) => e) // eslint-disable-line no-unused-vars
  return c
}
function diff(a, b, pre = '') {
  const out = []
  const keys = new Set([...Object.keys(a ?? {}), ...Object.keys(b ?? {})])
  for (const k of [...keys].sort()) {
    const x = a?.[k], y = b?.[k]
    if (x && y && typeof x === 'object' && typeof y === 'object' && !Array.isArray(x)) out.push(...diff(x, y, `${pre}${k}.`))
    else if (JSON.stringify(x) !== JSON.stringify(y)) out.push(`${pre}${k}: phone ${JSON.stringify(x)} | desk ${JSON.stringify(y)}`)
  }
  return out
}

const phone = await run('phone')
const desk = await run('desk')
await browser.close()

const problems = []
for (const r of [phone, desk]) {
  console.log(`${r.channel.padEnd(5)} (${r.layout}): ${r.seen.join(' > ')} > ${r.finished ? 'END' : 'STOPPED'}  ${Object.keys(r.answers).length} answer keys`)
  for (const l of r.log) problems.push(`${r.channel}: ${l}`)
  for (const e of r.errors) problems.push(`${r.channel}: page error ${e}`)
  if (!r.finished) problems.push(`${r.channel}: did not finish`)
  if ('channel' in r.answers || 'meta' in r.answers) problems.push(`${r.channel}: channel leaked into answers`)
}
if (phone.layout !== 'phone') problems.push(`phone run rendered ${phone.layout}`)
if (desk.layout === 'phone') problems.push('desk run rendered phone')
if (JSON.stringify(phone.seen) !== JSON.stringify(desk.seen)) problems.push(`different paths:\n  phone ${phone.seen.join(' > ')}\n  desk  ${desk.seen.join(' > ')}`)
const d = diff(comparable(phone.answers), comparable(desk.answers))
for (const x of d) problems.push(`answer differs: ${x}`)
console.log(`stored channel: phone ${JSON.stringify(phone.stored)} | desk ${JSON.stringify(desk.stored)}`)
if (flag('keep')) console.log(JSON.stringify({ phone: comparable(phone.answers), desk: comparable(desk.answers) }, null, 1))
console.log(problems.length ? `\n${problems.length} PROBLEM(S):\n${problems.join('\n')}` : `\nPARITY: the stored answers are identical on phone and desk (${Object.keys(comparable(desk.answers)).length} keys compared)`)
process.exitCode = problems.length ? 1 : 0
