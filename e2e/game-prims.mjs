/* Drive the primitives on /art/game (Playground.tsx) with real input:
   pointer drag, touch drag, tap-then-tap and keyboard for useDrag; drag,
   tap and keys for RouteSlider; buttons, swipe and keys for SwipeStack.
   node e2e/game-prims.mjs  -> prints PASS/FAIL per check. */
import puppeteer from 'puppeteer-core'

const ORIGIN = (process.env.ORIGIN || 'http://localhost:3000').replace(/\/+$/, '')
const BASE = (process.env.BASE || ORIGIN).replace(/\/+$/, '') + '/v1' // the earlier game moved to /v1; BASE is the origin
const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' })
const results = []
const check = (name, ok, got) => { results.push(ok); console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${ok ? '' : `  got: ${got}`}`) }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function fresh(touch = false) {
  const ctx = await browser.createBrowserContext()
  const page = await ctx.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  await page.setViewport({ width: 1200, height: 1000, deviceScaleFactor: 1, hasTouch: touch, isMobile: false })
  await page.goto(`${ORIGIN}/art/game`, { waitUntil: 'networkidle2' })
  await page.addStyleTag({ content: 'nextjs-portal{display:none!important}' })
  return { page, ctx, errors }
}
const center = async (page, sel) => {
  const b = await (await page.$(sel)).boundingBox()
  return { x: b.x + b.width / 2, y: b.y + b.height / 2 }
}
const state = (page, id) => page.$eval(`[data-testid="${id}"]`, (e) => e.textContent)

async function drag(page, from, to, steps = 12) {
  await page.mouse.move(from.x, from.y)
  await page.mouse.down()
  for (let i = 1; i <= steps; i++) await page.mouse.move(from.x + ((to.x - from.x) * i) / steps, from.y + ((to.y - from.y) * i) / steps)
  await page.mouse.up()
  await sleep(250)
}

/* ---------------- useDrag */
{
  const { page, ctx, errors } = await fresh()
  // pointer drag into a slot
  await drag(page, await center(page, '[data-testid="tile-meetings"]'), await center(page, '[data-testid="slot-ruck:0"]'))
  check('useDrag pointer: drop in slot', (await state(page, 'drag-state')).includes('"ruck:0":"meetings"'), await state(page, 'drag-state'))
  // tap then tap
  await page.click('[data-testid="tile-present"]'); await sleep(80)
  await page.click('[data-testid="slot-tarp:0"]'); await sleep(150)
  check('useDrag tap-then-tap', (await state(page, 'drag-state')).includes('"tarp:0":"present"'), await state(page, 'drag-state'))
  // full zone body refuses
  await drag(page, await center(page, '[data-testid="tile-portfolio"]'), await center(page, '[data-testid="slot-tarp:0"]').then((c) => ({ x: c.x + 40, y: c.y + 30 })))
  // (dropping on the occupied SLOT swaps: covered next)
  await drag(page, await center(page, '[data-testid="tile-portfolio"]'), await center(page, '[data-testid="slot-ruck:0"]'))
  const s1 = await state(page, 'drag-state')
  check('useDrag swap on occupied slot', s1.includes('"ruck:0":"portfolio"') && !s1.includes('meetings'), s1)
  // keyboard: focus outreach, Space, arrows, Enter
  await page.focus('[data-testid="tile-outreach"]')
  await page.keyboard.press('Space'); await sleep(50)
  await page.keyboard.press('ArrowRight'); await sleep(50)
  const ann = await state(page, 'drag-announce')
  await page.keyboard.press('ArrowRight'); await sleep(50)
  await page.keyboard.press('Enter'); await sleep(150)
  const s2 = await state(page, 'drag-state')
  check('useDrag keyboard lift/cycle/drop', /outreach/.test(s2), `${s2} | ${ann}`)
  check('useDrag announces zones', ann.length > 0, ann)
  // Esc cancels
  await page.focus('[data-testid="tile-meetings"]')
  await page.keyboard.press('Space'); await page.keyboard.press('ArrowRight'); await page.keyboard.press('Escape'); await sleep(100)
  check('useDrag Esc cancels', !(await state(page, 'drag-state')).includes('meetings'), await state(page, 'drag-state'))
  check('useDrag no page errors', !errors.length, errors.join('; '))
  await ctx.close()
}
{
  const { page, ctx } = await fresh(true)
  const a = await center(page, '[data-testid="tile-meetings"]'), b = await center(page, '[data-testid="slot-ruck:1"]')
  await page.touchscreen.touchStart(a.x, a.y)
  for (let i = 1; i <= 12; i++) await page.touchscreen.touchMove(a.x + ((b.x - a.x) * i) / 12, a.y + ((b.y - a.y) * i) / 12)
  await page.touchscreen.touchEnd(); await sleep(250)
  check('useDrag touch drag', (await state(page, 'drag-state')).includes('"ruck:1":"meetings"'), await state(page, 'drag-state'))
  await ctx.close()
}

/* ---------------- RouteSlider */
{
  const { page, ctx, errors } = await fresh()
  // drag the parked climber by its real position, up the switchback to the 36-month camp
  const rect = (sel) => page.$eval(sel, (e) => { const r = e.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2, b: r.bottom } })
  const th = await rect('[data-testid="slider-demo"] [data-rs-thumb]')
  const m36 = await rect('[data-testid="slider-demo"] [data-rs-stop="m36"]')
  const m12 = await rect('[data-testid="slider-demo"] [data-rs-stop="m12"]')
  const m24 = await rect('[data-testid="slider-demo"] [data-rs-stop="m24"]')
  // walk along the path in small steps so the windowed search follows the switchbacks
  await page.mouse.move(th.x, th.y); await page.mouse.down()
  let at = th
  for (const tgt of [m12, m24, m36]) {
    for (let i = 1; i <= 10; i++) await page.mouse.move(at.x + ((tgt.x - at.x) * i) / 10, at.y + ((tgt.y - at.y) * i) / 10)
    at = tgt
  }
  await page.mouse.up(); await sleep(300)
  const s = JSON.parse(await state(page, 'slider-state'))
  check('RouteSlider drag walks the switchback and snaps to 36 months', s.v === 'm36', JSON.stringify(s))
  const ring = () => page.$$eval('[data-testid="slider-demo"] [data-rs-thumb] circle[stroke-dasharray="3 3"]', (x) => x.length)
  check('RouteSlider: no focus ring after a pointer drag', (await ring()) === 0, await ring())
  // keyboard on the native range
  await page.focus('[data-testid="slider-range"]')
  await page.keyboard.press('End'); await sleep(700)
  check('RouteSlider: focus ring with the keyboard', (await ring()) === 1, await ring())
  check('RouteSlider End key', JSON.parse(await state(page, 'slider-state')).v === 'm48', await state(page, 'slider-state'))
  await page.keyboard.press('ArrowDown'); await sleep(700)
  check('RouteSlider ArrowDown steps', JSON.parse(await state(page, 'slider-state')).v === 'm36', await state(page, 'slider-state'))
  const vt = await page.$eval('[data-testid="slider-range"]', (e) => e.getAttribute('aria-valuetext'))
  check('RouteSlider aria-valuetext', vt === '36 months', vt)
  // tap a stop (12 months at t=0.1 on the path)
  const p12 = await page.$eval('[data-rs-stop="m12"]', (e) => { const r = e.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 } })
  await page.mouse.click(p12.x, p12.y); await sleep(700)
  check('RouteSlider tap a stop', JSON.parse(await state(page, 'slider-state')).v === 'm12', await state(page, 'slider-state'))
  // the arc
  await page.focus('[data-testid="door-range"]')
  await page.keyboard.press('ArrowRight'); await page.keyboard.press('ArrowRight'); await sleep(500)
  check('RouteSlider arc (door) keys', JSON.parse(await state(page, 'slider-state')).door === 'clientFirst', await state(page, 'slider-state'))
  check('RouteSlider no page errors', !errors.length, errors.join('; '))
  await ctx.close()
}

/* ---------------- SwipeStack */
{
  const { page, ctx, errors } = await fresh()
  await page.click('[data-testid="swipe-policy"]'); await sleep(450)
  const c = await center(page, '[data-testid="card-aiclient"]')
  await drag(page, c, { x: c.x - 160, y: c.y }, 10); await sleep(450)
  await page.focus('[data-swipe-stack]'); await page.keyboard.press('ArrowDown'); await sleep(450)
  const log = JSON.parse(await state(page, 'swipe-state'))
  check('SwipeStack button / swipe / key', JSON.stringify(log) === JSON.stringify(['certify:policy:button', 'aiclient:drop:swipe', 'agents:unsure:key']), JSON.stringify(log))
  check('SwipeStack no page errors', !errors.length, errors.join('; '))
  await ctx.close()
}

/* ---------------- the game frame: camp walk by drag, Enter, resume, bad storage */
{
  const ctx = await browser.createBrowserContext()
  const page = await ctx.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  await page.setViewport({ width: 390, height: 660, deviceScaleFactor: 1, hasTouch: false })
  // S02 answered (demo answers, via its F1 sheet), then Back to the board:
  // Back from a sheet returns to the parent and keeps the answers
  await page.goto(`${BASE}/?screen=S02&sheet=F1&reset=1`, { waitUntil: 'networkidle2' })
  await sleep(700)
  await page.click('[data-testid="sheet-back"]'); await sleep(700)
  const step0 = await page.$eval('[data-game]', (g) => g.getAttribute('data-step'))
  const green = await page.evaluate(() => JSON.parse(localStorage.getItem('ascent-game-v1')).state.answers['vote.green'])
  check('Back from a sheet returns to the parent, answers kept', step0 === 'S02' && Array.isArray(green) && green.length === 3, `${step0} ${JSON.stringify(green)}`)
  // drag the rookie up the camp-walk pitch (fires S02's Continue -> F1)
  const th = await page.$eval('[data-camp-walk] [data-rs-thumb] > circle', (e) => { const r = e.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 } })
  const svg = await page.$eval('[data-camp-walk] svg', (e) => { const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width } })
  await drag(page, th, { x: svg.x + svg.w * 0.74, y: svg.y + 12 }, 20)
  await sleep(900)
  const step1 = await page.$eval('[data-game]', (g) => g.getAttribute('data-step'))
  check('CampWalk drag reaches the next step', step1 === 'F1', step1)
  await page.click('[data-testid="sheet-back"]'); await sleep(700)
  // camp walk by keyboard: focus the walk slider, Enter
  await page.focus('[data-camp-walk] input[type=range]')
  await page.keyboard.press('Enter'); await sleep(1200)
  const step3 = await page.$eval('[data-game]', (g) => g.getAttribute('data-step'))
  check('CampWalk Enter walks on', step3 === 'F1', step3)
  // resume after reload
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle2' }); await sleep(500)
  const step4 = await page.$eval('[data-game]', (g) => g.getAttribute('data-step'))
  check('Resume after reload', step4 === 'F1', step4)
  // a one-tap sheet answered earlier: tap the same chip again and it goes on
  await page.goto(`${BASE}/?screen=S04&sheet=F2b&reset=1`, { waitUntil: 'networkidle2' }); await sleep(700)
  await page.click('[data-testid="f2b-trust"]'); await sleep(1200)
  const s5 = await page.$eval('[data-game]', (g) => g.getAttribute('data-step'))
  await page.click('[data-testid="back"]'); await sleep(900)
  await page.click('[data-testid="walk-on"]'); await sleep(1400)
  const s6 = await page.$eval('[data-game]', (g) => g.getAttribute('data-step'))
  await page.click('[data-testid="f2b-trust"]'); await sleep(1200)
  const s7 = await page.$eval('[data-game]', (g) => g.getAttribute('data-step'))
  check('One-tap sheet: same answer again after Back still moves on', s5 === 'S05' && s6 === 'F2b' && s7 === 'S05', `${s5} ${s6} ${s7}`)
  // malformed storage never crashes or strands
  for (const bad of ['{not json', '{"state":{"started":true,"screen":"S99","beat":"Q","sheet":{"id":"F4"},"answers":{"calls":5,"mark":9}},"version":1}', '"x"', '{"state":null,"version":1}']) {
    await page.evaluate((v) => localStorage.setItem('ascent-game-v1', v), bad)
    await page.goto(`${BASE}/`, { waitUntil: 'networkidle2' }); await sleep(400)
    const st = await page.$eval('[data-game]', (g) => g.getAttribute('data-step')).catch(() => null)
    const canGo = await page.$('[data-testid="primary"], [data-testid="walk-on"], [data-testid="sheet-done"]')
    check(`Bad storage ${bad.slice(0, 24)}... renders and can move on`, !!st && !!canGo, st)
  }
  check('Game no page errors', !errors.length, errors.join('; '))
  await ctx.close()
}

await browser.close()
const failed = results.filter((x) => !x).length
console.log(failed ? `${failed} FAILED` : 'ALL PASS')
process.exitCode = failed ? 1 : 0
