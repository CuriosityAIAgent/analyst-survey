/* The Ascent (game), end to end in Chrome at 390x660, driven the way a
   respondent would: real pointer drags (mouse down / move in steps / up) for
   the board, the bricks, the pitches, the rope, the cairn and every slider;
   swipes, buttons and keys for the storm calls; typing for the two lines.

   Three seeded routes, so every follow-up sheet fires on at least one:
     A  token link; classroom packed (F1), 18 months (F2a), brief on day one
        (F3a), certify = policy (F4), rope 5 (F5 variant B). Drag camp walks,
        swiped calls, a peek card, both lines written, summit dragged.
     B  no token (S01 Beat B); classroom neither packed nor in hand (no F1),
        48 months by keyboard (F2b), brief once proven (F3b), certify dropped
        (no F4), rope 2 (F5 A). 'Walk on' buttons, button calls, both lines
        left blank, a reload mid-game (S07) that must resume, summit by keys.
     C  token; classroom in the hand (F1), 'When proven' (F2a), brief not for
        them (F3c), certify unsure (no F4), rope 'Rather not say' (F5 A).
        S05 driven by keyboard only (Tab, Space, arrows, Enter), camp walks
        by Enter, summit skipped.

   At every screen, beat and sheet (on arrival and again once answered):
   no page scroll, nothing important off-screen, no page errors. At the end:
   the stored answers hold every key the spec says each visited screen and
   sheet stores, the sheets that fired are exactly the route's, and the key
   answers are the ones the drags were meant to produce.

   node e2e/game-walk.mjs [A|B|C ...] [--tall] [--reduced] [--shots]
     --tall     390x844 instead of 390x660
     DESK=1     the same routes at desktop size (1440x790: a 1440x900 laptop
                less the browser chrome; mouse, no touch). DESK=1280x600 for
                any other size (the layout rule picks desk / deskCompact).
     --shots    a PNG per step: /tmp/ascent-game-shots/walk-<route>-NN-<step>.png */
import puppeteer from 'puppeteer-core'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const args = process.argv.slice(2)
const flag = (n) => args.includes(`--${n}`)
const BASE = (process.env.BASE || 'http://localhost:3000').replace(/\/+$/, '') + '/v1' // the earlier game moved to /v1; BASE is the origin
const OUT = '/tmp/ascent-game-shots'
const DESK = process.env.DESK ? (/^\d+x\d+$/.test(process.env.DESK) ? process.env.DESK : '1440x790') : ''
const [W, H] = DESK ? DESK.split('x').map(Number) : [390, flag('tall') ? 844 : 660]
fs.mkdirSync(OUT, { recursive: true })
const here = path.dirname(fileURLToPath(import.meta.url))
const SPEC = JSON.parse(fs.readFileSync(path.join(here, '../src/game/spec.json'), 'utf8'))
const storeKey = (s) => s.split(/[:[{ ]/)[0]
const storesOf = (id) => {
  const s = SPEC.screens.find((x) => x.id === id)
  return [...new Set([...s.stores, ...(s.beats ?? []).flatMap((b) => b.stores)].map(storeKey))]
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

/* ------------------------------------------------------------------ routes */

const ROUTES = {
  A: {
    token: true,
    board: { rucksack: ['classroom', 'meetings', 'debrief'], hand: ['present'], out: ['admin', 'formatting'], rerig: ['ops', 'morning'] },
    campWalk: 'drag',
    f1: 'clientFirst',
    rule: 'sat across the table from a client who said no',
    pace: 18, paceVia: 'drag', readyAt: 24,
    f2: 'pitch',
    lanes: { map: 'day1', compass: 'day1', guidebook: 'day1', gps: 'proven', radio: 'proven', brief: 'day1' },
    kitVia: 'drag', peek: 'brief',
    f3: 'spotWrong',
    pitches: { p_portfolio: 'own', p_outreach: 'withkit', p_brief: 'own', p_onboard: 'crew', p_crm: 'kitdrafts' },
    calls: { certify: 'policy', aiclient: 'unsure', agents: 'policy', freedtime: 'drop' }, callVia: 'swipe',
    f4: 'observed',
    rope: 5, f5: 'debrief',
    top3: ['reading', 'judgement', 'calm'], origin: 'built', originVia: 'swipe',
    mark: 3, change: 'Pair every Analyst with a second Advisor for a quarter',
    summit: 'drag',
    sheets: ['F1', 'F2a', 'F3a', 'F4', 'F5'], variant: 'B',
  },
  B: {
    token: false, business: 'ipb', cohort: '2023',
    board: { rucksack: ['meetings', 'present', 'portfolio'], hand: ['meetings'], out: ['admin', 'roleplay'], rerig: ['ops', 'formatting'] },
    campWalk: 'button',
    rule: '',
    pace: 48, paceVia: 'key', readyAt: 'notYet',
    f2: 'trust',
    lanes: { map: 'day1', compass: 'day1', guidebook: 'proven', gps: 'proven', radio: 'none', brief: 'proven' },
    kitVia: 'drag',
    f3: 'signoff',
    pitches: { p_portfolio: 'crew', p_outreach: 'kitdrafts', p_brief: 'withkit', p_onboard: 'crew', p_crm: 'kitdrafts' },
    calls: { certify: 'drop', aiclient: 'policy', agents: 'unsure', freedtime: 'policy' }, callVia: 'button', reloadAt: 'S07',
    rope: 2, f5: 'mentor',
    top3: ['hunter', 'depth', 'story'], origin: 'born', originVia: 'button',
    mark: 5, change: '',
    summit: 'key',
    sheets: ['F2b', 'F3b', 'F5'], variant: 'A',
  },
  C: {
    token: true,
    board: { rucksack: ['meetings', 'prep', 'outreach'], hand: ['classroom'], out: ['formatting', 'debrief'], rerig: ['admin', 'roleplay'] },
    campWalk: 'enter',
    f1: 'mandatory',
    rule: 'lost a deal',
    pace: 'proven', paceVia: 'tap', readyAt: null,
    f2: 'reviewAlone',
    lanes: { map: 'day1', compass: 'proven', guidebook: 'none', gps: 'proven', radio: 'day1', brief: 'none' },
    kitVia: 'keyboard',
    f3: 'notYet',
    pitches: { p_portfolio: 'own', p_outreach: 'own', p_brief: 'kitdrafts', p_onboard: 'withkit', p_crm: 'withkit' },
    calls: { certify: 'unsure', aiclient: 'drop', agents: 'drop', freedtime: 'unsure' }, callVia: 'key',
    rope: null, f5: 'ecm',
    top3: ['bounce', 'curiosity', 'reading'], origin: 'born', originVia: 'key',
    mark: 1, change: 'Protected time to shadow',
    summit: 'skip',
    sheets: ['F1', 'F2a', 'F3c', 'F5'], variant: 'A',
  },
}

const which = args.filter((a) => !a.startsWith('--'))
const routes = which.length ? which : Object.keys(ROUTES)

/* ------------------------------------------------------------------ browser */

const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: 'new',
  args: ['--hide-scrollbars'],
})

const failures = []
const summary = []

for (const name of routes) {
  const R = ROUTES[name]
  const ctx = await browser.createBrowserContext()
  const page = await ctx.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`))
  page.on('console', (m) => { if (m.type() === 'error') errors.push(`console: ${m.text().slice(0, 300)}`) })
  await page.setViewport({ width: W, height: H, deviceScaleFactor: 1 })
  if (flag('reduced')) await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])

  const fail = (msg) => { failures.push(`[${name}] ${msg}`); console.log(`  FAIL ${msg}`) }
  const ok = (cond, msg) => { if (!cond) fail(msg); return cond }

  /* ---- page helpers */
  const step = () => page.$eval('[data-game]', (g) => g.getAttribute('data-step'))
  const finished = () => page.$eval('[data-game]', (g) => g.getAttribute('data-finished') === 'true')
  const answers = () => page.evaluate(() => {
    try { return JSON.parse(localStorage.getItem('ascent-game-v1') || '{}').state?.answers ?? {} } catch { return {} }
  })
  const center = async (sel) => {
    const el = await page.waitForSelector(sel, { visible: true, timeout: 4000 })
    const b = await el.boundingBox()
    return { x: b.x + b.width / 2, y: b.y + b.height / 2 }
  }
  async function drag(from, to, steps = 14) {
    await page.mouse.move(from.x, from.y)
    await page.mouse.down()
    for (let i = 1; i <= steps; i++) {
      await page.mouse.move(from.x + ((to.x - from.x) * i) / steps, from.y + ((to.y - from.y) * i) / steps)
    }
    await page.mouse.up()
    await sleep(280)
  }
  /** Walk the pointer through a list of points, pressed the whole way. */
  async function walk(points, per = 6) {
    await page.mouse.move(points[0].x, points[0].y)
    await page.mouse.down()
    let at = points[0]
    for (const q of points.slice(1)) {
      for (let i = 1; i <= per; i++) await page.mouse.move(at.x + ((q.x - at.x) * i) / per, at.y + ((q.y - at.y) * i) / per)
      at = q
    }
    await page.mouse.up()
    await sleep(350)
  }
  const dragSel = async (a, b, steps) => drag(await center(a), await center(b), steps)
  const tap = async (sel) => { const c = await center(sel); await page.mouse.click(c.x, c.y); await sleep(160) }
  async function tabTo(testid, max = 90) {
    for (let i = 0; i < max; i++) {
      await page.keyboard.press('Tab')
      const id = await page.evaluate(() => document.activeElement?.getAttribute('data-testid') ?? '')
      if (id === testid) return true
    }
    fail(`keyboard: could not Tab to ${testid}`)
    return false
  }
  async function waitChange(from, timeout = 6000) {
    const moved = await page.waitForFunction((s) => {
      const g = document.querySelector('[data-game]')
      return g && (g.getAttribute('data-step') !== s || g.getAttribute('data-finished') === 'true')
    }, { timeout }, from).then(() => true).catch(() => false)
    // the sheet rise / camera pan, and the 350ms busy window
    await page.waitForFunction(() => document.querySelectorAll('[data-active-step]').length === 1, { timeout: 3000 }).catch(() => {})
    await sleep(flag('reduced') ? 380 : 520)
    return moved
  }
  /** No page scroll, nothing important off-screen, no new page errors. */
  let errSeen = 0
  async function inspect(label) {
    const info = await page.evaluate(() => {
      const se = document.scrollingElement
      const scroll = se.scrollHeight > window.innerHeight + 1 || se.scrollWidth > window.innerWidth + 1
      const roots = document.querySelectorAll('[data-active-step]')
      const root = roots[roots.length - 1]
      const off = []
      if (root) {
        for (const el of root.querySelectorAll('button, input, textarea, [data-item], [data-zone], h1, h2, p, [role=button], [role=radio], [data-testid]')) {
          const r = el.getBoundingClientRect()
          const cs = getComputedStyle(el)
          if (r.width < 2 || r.height < 2 || cs.visibility === 'hidden' || cs.display === 'none' || Number(cs.opacity) === 0) continue
          if (el.closest('[aria-hidden="true"]') && !el.matches('[data-item], [data-zone], button')) continue
          if (r.bottom > window.innerHeight + 1 || r.right > window.innerWidth + 1 || r.top < -1 || r.left < -1) {
            off.push(`${el.tagName.toLowerCase()}${el.dataset.testid ? '#' + el.dataset.testid : ''} "${(el.textContent || '').trim().slice(0, 30)}" [${Math.round(r.left)},${Math.round(r.top)} ${Math.round(r.right)}x${Math.round(r.bottom)}]`)
          }
        }
      }
      return { scroll, sh: se.scrollHeight, off }
    })
    ok(!info.scroll, `${label}: the page scrolls (scrollHeight ${info.sh} > ${H})`)
    ok(!info.off.length, `${label}: off-screen: ${info.off.slice(0, 4).join('; ')}`)
    const fresh = errors.slice(errSeen)
    errSeen = errors.length
    ok(!fresh.length, `${label}: page errors: ${fresh.join(' | ')}`)
  }

  /* ---- start clean */
  await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' })
  await page.evaluate(() => localStorage.clear())
  await page.goto(BASE + (R.token ? '/?business=uspb&cohort=2024' : '/'), { waitUntil: 'networkidle2' })
  await page.addStyleTag({ content: 'nextjs-portal{display:none!important}' }).catch(() => {})
  await page.waitForSelector('[data-game]')
  await sleep(500)

  /* ---- drivers, one per step key */
  const campWalk = async () => {
    await page.waitForSelector('[data-camp-walk][data-enabled="true"]', { timeout: 3000 }).catch(() => fail('camp walk never enabled'))
    if (R.campWalk === 'drag' && DESK) {
      // the desk trail is long: walk the pointer along the path itself
      const pts = await page.evaluate(() => {
        const p = document.querySelector('[data-camp-walk] path[data-rs-track]')
        const m = p.ownerSVGElement.getScreenCTM()
        const L = p.getTotalLength()
        const out = []
        for (let i = 0; i <= 20; i++) { const q = p.getPointAtLength((L * i) / 20); const s = new DOMPoint(q.x, q.y).matrixTransform(m); out.push({ x: s.x, y: s.y }) }
        return out
      })
      pts[0] = await center('[data-camp-walk] [data-rs-thumb] > circle')
      await walk(pts, 4)
    } else if (R.campWalk === 'drag') {
      const th = await center('[data-camp-walk] [data-rs-thumb] > circle')
      const svg = await page.$eval('[data-camp-walk] svg', (e) => { const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height } })
      await drag(th, { x: svg.x + svg.w * 0.74, y: svg.y + svg.h * 0.24 }, 20)
    } else if (R.campWalk === 'button') {
      await tap('[data-testid="walk-on"]')
    } else {
      await page.focus('[data-camp-walk] input[type=range]')
      await page.keyboard.press('Enter')
    }
  }

  /** One drag or tap finishes a follow-up sheet by itself (500ms later):
      there must be no Continue button to press. */
  const autoDone = async (id) => {
    const btn = await page.$('[data-sheet] [data-testid="sheet-done"]')
    ok(!btn, `${id}: a Continue button showed after the drop (the sheet should finish itself)`)
    if (btn) await tap('[data-testid="sheet-done"]')
  }

  const sliderWalk = async (root, ids, target) => {
    // the thumb's own hit circle (the thumb group also holds, e.g., S08's rope)
    const th = await center(`${root} [data-rs-thumb] > circle`)
    const pts = [th]
    for (const id of ids) {
      pts.push(await center(`${root} circle[data-rs-stop="${id}"]`))
      if (id === target) break
    }
    await walk(pts, 8)
  }

  const D = {
    'S01#A': async () => { await tap('[data-testid="primary"]') },
    'S01#B': async () => {
      await tap(`[data-testid="business-${R.business}"]`)
      await tap(`[data-testid="cohort-${R.cohort}"]`)
      await inspect('S01#B answered')
      await tap('[data-testid="primary"]')
    },
    S02: async () => {
      for (const zone of ['rucksack', 'hand', 'out', 'rerig']) {
        const list = R.board[zone]
        for (let i = 0; i < list.length; i++) {
          await dragSel(`[data-item="${list[i]}"]`, `[data-testid="slot-${zone}:${i}"]`, 16)
        }
      }
      const a = await answers()
      ok(JSON.stringify(a['vote.green']) === JSON.stringify(R.board.rucksack), `S02 vote.green ${JSON.stringify(a['vote.green'])}`)
      ok(a['vote.blue'] === R.board.hand[0], `S02 vote.blue ${a['vote.blue']}`)
      ok(JSON.stringify(a['vote.red']) === JSON.stringify(R.board.out), `S02 vote.red ${JSON.stringify(a['vote.red'])}`)
      ok(JSON.stringify(a['vote.amber']) === JSON.stringify(R.board.rerig), `S02 vote.amber ${JSON.stringify(a['vote.amber'])}`)
      ok(a['vote.blueAlsoGreen'] === R.board.rucksack.includes(R.board.hand[0]), 'S02 vote.blueAlsoGreen')
      await inspect('S02 answered')
      await campWalk()
    },
    F1: async () => {
      await sliderWalk('[data-testid="f1-body"]', ['mandatory', 'clientFirst', 'optional'], R.f1)
      const a = await answers()
      ok(a['classroom.mandatory'] === R.f1, `F1 door drag -> ${a['classroom.mandatory']}`)
      await autoDone('F1')
    },
    S03: async () => {
      if (R.rule) {
        await tap('[data-testid="rule-input"]')
        await page.keyboard.type(R.rule, { delay: 12 })
        await page.keyboard.press('Enter') // Enter finishes the line
      } else {
        await inspect('S03 blank')
        await tap('[data-testid="primary"]')
      }
    },
    'S04#A': async () => {
      if (R.paceVia === 'tap') await tap('[data-testid="s04-proven"]')
      else if (R.paceVia === 'key') {
        await page.focus('[data-testid="s04-range"]')
        await page.keyboard.press('End')
        await sleep(700)
      } else await sliderWalk('[data-testid="s04-slider"]', ['m12', 'm18', 'm24', 'm30', 'm36', 'm48'], `m${R.pace}`)
      const a = await answers()
      ok(a['pace.months'] === R.pace, `S04 pace.months ${a['pace.months']} (wanted ${R.pace})`)
      await inspect('S04#A answered')
      await tap('[data-testid="primary"]')
    },
    'S04#B': async () => {
      await tap(R.readyAt === null ? '[data-testid="s04-rather"]' : `[data-testid="s04-self-${R.readyAt === 'notYet' ? 'notyet' : R.readyAt}"]`)
      const a = await answers()
      ok('self.readyAt' in a && a['self.readyAt'] === R.readyAt, `S04 self.readyAt ${a['self.readyAt']}`)
      await inspect('S04#B answered')
      await campWalk()
    },
    F2a: async () => {
      await dragSel('[data-testid="f2a-rookie"]', `[data-testid="f2a-ledge-${R.f2}"]`, 16)
      ok((await answers())['pace.readyFor'] === R.f2, 'F2a rookie drag onto ledge')
      await autoDone('F2a')
    },
    F2b: async () => { await tap(`[data-testid="f2b-${R.f2}"]`) },
    S05: async () => {
      const order = Object.keys(R.lanes)
      if (R.peek) {
        await tap(`[data-testid="brick-${R.peek}"] [data-peek-button]`)
        ok(!!(await page.$('[data-testid="peek"]')), 'S05 peek card opens')
        await inspect('S05 peek open')
        await tap('[data-testid="peek"]')
      }
      if (R.kitVia === 'keyboard') {
        const arrows = { day1: 1, proven: 2, none: 3 }
        for (const b of order) {
          if (!(await tabTo(`brick-${b}`))) break
          await page.keyboard.press('Space')
          for (let i = 0; i < arrows[R.lanes[b]]; i++) await page.keyboard.press('ArrowRight')
          await page.keyboard.press('Enter')
          await sleep(220)
        }
      } else {
        for (const b of order) await dragSel(`[data-testid="brick-${b}"]`, `[data-testid="lane-${R.lanes[b]}"]`, 16)
      }
      const a = await answers()
      ok(JSON.stringify(a['kit.lane']) === JSON.stringify(Object.fromEntries(order.map((b) => [b, R.lanes[b]]))) ||
        order.every((b) => a['kit.lane']?.[b] === R.lanes[b]), `S05 kit.lane ${JSON.stringify(a['kit.lane'])}`)
      await inspect('S05 answered')
      if (R.kitVia === 'keyboard') { if (await tabTo('primary')) await page.keyboard.press('Enter') }
      else await tap('[data-testid="primary"]')
    },
    F3a: async () => { await tap(`[data-testid="opt-${R.f3}"]`) },
    F3b: async () => { await tap(`[data-testid="opt-${R.f3}"]`) },
    F3c: async () => { await tap(`[data-testid="opt-${R.f3}"]`) },
    S06: async () => {
      let own = 0
      for (const [id, z] of Object.entries(R.pitches)) {
        await dragSel(`[data-testid="pitch-${id}"]`, z === 'own' ? `[data-testid="slot-own:${own++}"]` : `[data-testid="zone-${z}"]`, 16)
      }
      const a = await answers()
      ok(Object.entries(R.pitches).every(([id, z]) => a['pitch.zone']?.[id] === z), `S06 pitch.zone ${JSON.stringify(a['pitch.zone'])}`)
      await inspect('S06 answered')
      await campWalk()
    },
    S07: async () => {
      for (let n = 0; n < 4; n++) {
        const top = await page.$eval('[data-swipe-stack] [data-testid^="card-"]', (e) => e.getAttribute('data-testid').slice(5)).catch(() => null)
        if (!top) break
        const ans = R.calls[top]
        const exit = ans // zone ids are drop | unsure | policy
        if (R.callVia === 'swipe' && exit !== 'unsure') {
          const c = await center(`[data-testid="card-${top}"]`)
          await drag(c, { x: c.x + (exit === 'policy' ? 170 : -170), y: c.y + 4 }, 12)
        } else if (R.callVia === 'key') {
          await page.focus('[data-swipe-stack]')
          await page.keyboard.press(exit === 'drop' ? 'ArrowLeft' : exit === 'policy' ? 'ArrowRight' : 'ArrowDown')
        } else await tap(`[data-testid="call-${exit}"]`)
        await sleep(flag('reduced') ? 450 : 700)
        if (n === 1 && R.reloadAt === 'S07') {
          // a reload mid-game resumes where they were, with the calls made
          const before = await answers()
          await page.reload({ waitUntil: 'networkidle2' })
          await page.addStyleTag({ content: 'nextjs-portal{display:none!important}' }).catch(() => {})
          await page.waitForSelector('[data-game]')
          await sleep(700)
          const st = await step()
          const after = await answers()
          const left = await page.$$eval('[data-swipe-stack] [data-card]', (x) => x.length).catch(() => 0)
          ok(st === 'S07', `resume after reload: step ${st}`)
          ok(Object.keys(after.calls ?? {}).length === 2 && JSON.stringify(after.calls) === JSON.stringify(before.calls), `resume: calls kept ${JSON.stringify(after.calls)}`)
          ok(left === 2, `resume: ${left} cards left in the stack (wanted 2)`)
          ok(JSON.stringify(after['vote.green']) === JSON.stringify(before['vote.green']) && after['kit.lane']?.brief === before['kit.lane']?.brief, 'resume: earlier answers kept')
          console.log(`  resume after reload at S07: ${st}, ${left} cards left`)
          await inspect('S07 after reload')
        }
      }
      const a = await answers()
      ok(Object.entries(R.calls).every(([id, v]) => a.calls?.[id]?.answer === v), `S07 calls ${JSON.stringify(Object.fromEntries(Object.entries(a.calls ?? {}).map(([k, v]) => [k, v.answer])))}`)
      await inspect('S07 cleared')
      await tap('[data-testid="primary"]')
    },
    F4: async () => {
      await dragSel(`[data-testid="method-${R.f4}"]`, '[data-testid="zone-plaque"]', 16)
      ok((await answers())['certify.how'] === R.f4, 'F4 method drag onto the plaque')
      await autoDone('F4')
    },
    S08: async () => {
      if (R.rope === null) await tap('[data-testid="s08-rather"]')
      else await sliderWalk('[data-testid="s08-slider"]', ['r1', 'r2', 'r3', 'r4', 'r5'], `r${R.rope}`)
      const a = await answers()
      ok('self.ropeCounterfactual' in a && a['self.ropeCounterfactual'] === R.rope, `S08 rope ${a['self.ropeCounterfactual']}`)
      await inspect('S08 answered')
      await tap('[data-testid="primary"]')
    },
    F5: async () => {
      const v = await page.$eval('[data-game]', (g) => g.getAttribute('data-sheet-open'))
      await dragSel(`[data-testid="f5-tag-${R.f5}"]`, '[data-testid="f5-clip"]', 16)
      ok((await answers()).guarantee === R.f5, `F5 tag drag onto the clip (${v})`)
      await autoDone('F5')
    },
    'S09#A': async () => {
      for (let k = 0; k < 3; k++) await dragSel(`[data-testid="tray"] [data-testid="tile-${R.top3[k]}"]`, `[data-testid="clip-${k + 1}"]`, 16)
      ok(JSON.stringify((await answers())['traits.top3']) === JSON.stringify(R.top3), `S09 traits.top3 ${JSON.stringify((await answers())['traits.top3'])}`)
      await inspect('S09#A answered')
      await tap('[data-testid="primary"]')
    },
    'S09#B': async () => {
      const left = await page.$eval('[data-s09b] [data-testid^="origin-"]', (e) => e.getAttribute('data-testid').slice(7))
      const dir = R.origin === left ? 'ArrowLeft' : 'ArrowRight'
      if (R.originVia === 'swipe') {
        const c = await center('[data-testid="lead-card"]')
        await drag(c, { x: c.x + (dir === 'ArrowLeft' ? -150 : 150), y: c.y }, 12)
      } else if (R.originVia === 'key') {
        await page.focus('[data-s09b] [data-swipe-stack]')
        await page.keyboard.press(dir)
      } else await tap(`[data-testid="origin-${R.origin}"]`)
      await sleep(500)
      ok((await answers())['traits.leadOrigin'] === R.origin, `S09 leadOrigin ${(await answers())['traits.leadOrigin']}`)
    },
    'S10#A': async () => {
      for (let i = 0; i < R.mark; i++) await dragSel('[data-testid="stone-0"]', '[data-testid="cairn"]', 14)
      ok((await answers()).mark === R.mark, `S10 mark ${(await answers()).mark}`)
      await inspect('S10#A answered')
      await tap('[data-testid="primary"]')
    },
    'S10#B': async () => {
      if (R.change) {
        await tap('[data-testid="tag-input"]')
        await page.keyboard.type(R.change, { delay: 10 })
        // the tag is the field: the line is written on the tag itself
        const onTag = await page.$eval('[data-testid="tag"] [data-testid="tag-input"]', (e) => e.value)
        ok(onTag === R.change, 'S10 the line appears on the tag')
      }
      await inspect('S10#B answered')
      await tap('[data-testid="primary"]')
    },
    S11: async () => {
      if (R.summit === 'drag') {
        const pts = await page.evaluate(() => {
          const p = document.querySelector('[data-s11] path[data-rs-track]')
          const m = p.ownerSVGElement.getScreenCTM()
          const L = p.getTotalLength()
          const out = []
          for (let i = 0; i <= 24; i++) { const q = p.getPointAtLength((L * i) / 24); const s = new DOMPoint(q.x, q.y).matrixTransform(m); out.push({ x: s.x, y: s.y }) }
          return out
        })
        await walk(pts, 4)
      } else if (R.summit === 'key') {
        await page.focus('[data-testid="summit-range"]')
        await page.keyboard.press('End')
      } else await tap('[data-testid="skip"]')
    },
  }

  /* ---- walk */
  const seen = []
  const counts = {}
  let shot = 0
  for (let i = 0; i < 40; i++) {
    if (await finished()) break
    const st = await step()
    counts[st] = (counts[st] || 0) + 1
    if (counts[st] > 2) { fail(`stuck on ${st}`); break }
    if (seen[seen.length - 1] !== st) seen.push(st)
    await inspect(st)
    if (flag('shots')) await page.screenshot({ path: `${OUT}/walk-${name}-${String(++shot).padStart(2, '0')}-${st.replace('#', '-')}.png` })
    const drive = D[st]
    if (!drive) { fail(`no driver for ${st}`); break }
    try { await drive() } catch (e) { fail(`${st}: ${e.message.split('\n')[0]}`) }
    if (!(await waitChange(st))) { if (!(await finished())) fail(`${st} did not move on`) }
  }

  /* ---- the end */
  const done = await finished()
  ok(done, 'reached the end (data-finished)')
  if (done) {
    await page.waitForSelector('[data-testid="kit-card"]', { timeout: 6000 }).catch(() => fail('S11: the kit card never showed'))
    await sleep(300)
    await inspect('S11 end')
    if (flag('shots')) await page.screenshot({ path: `${OUT}/walk-${name}-${String(++shot).padStart(2, '0')}-END.png` })
  }
  const a = await answers()
  const sheets = seen.filter((s) => /^F/.test(s))
  ok(JSON.stringify(sheets) === JSON.stringify(R.sheets), `sheets fired ${sheets.join(',')} (wanted ${R.sheets.join(',')})`)
  ok(a['guarantee.variant'] === R.variant, `F5 variant ${a['guarantee.variant']} (wanted ${R.variant})`)
  const visited = [...new Set(seen.map((s) => s.split('#')[0]))]
  const missing = []
  for (const id of visited) for (const k of storesOf(id)) if (!(k in a)) missing.push(`${id}:${k}`)
  ok(!missing.length, `stored answers missing: ${missing.join(', ')}`)
  ok(a['segment.source'] === (R.token ? 'token' : 'asked'), `segment.source ${a['segment.source']}`)
  if (!R.token) ok(a['segment.business'] === R.business && a['segment.cohort'] === R.cohort, 'S01 Beat B segments')
  ok((a['rule.skipped'] === !R.rule) && (R.rule ? a['rule.text'] === R.rule : a['rule.text'] === ''), `S03 rule ${JSON.stringify(a['rule.text'])} skipped=${a['rule.skipped']}`)
  ok((a['oneChange.skipped'] === !R.change) && a['oneChange.text'] === R.change, `S10 oneChange ${JSON.stringify(a['oneChange.text'])}`)
  ok(typeof a['t.complete'] === 'number' && typeof a['summit.dragMs'] === 'number', 'S11 t.complete and summit.dragMs')
  if (R.peek) ok((a['kit.peeks'] ?? []).includes(R.peek), 'S05 kit.peeks logged')
  for (const e of errors.slice(errSeen)) fail(e)

  const line = `${name}: ${seen.join(' > ')} > ${done ? 'END' : 'STOPPED'}  (${Object.keys(a).length} answer keys${missing.length ? `, ${missing.length} missing` : ''})`
  summary.push(line)
  console.log(line)
  await ctx.close()
}

await browser.close()
console.log('')
for (const s of summary) console.log(s)
console.log(failures.length ? `\n${failures.length} FAILED:\n${failures.join('\n')}` : `\nALL ROUTES PASS at ${W}x${H}${flag('reduced') ? ' (reduced motion)' : ''}`)
process.exitCode = failures.length ? 1 : 0
