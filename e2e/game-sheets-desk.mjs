/* The follow-up sheets on desktop, driven with a real mouse and with keys
   (design 3.5, 6 and 11.4). For every sheet, at each size, three fresh runs:

     drag    the sheet's own gesture with the mouse (F1 the door along its
             arc, F2a the rookie onto a ledge, F4 a method onto the plaque, F5
             a tag onto the rope) or a click (F2b, F3a-c)
     click   a click on another option (F1's rows; the drag sheets' tap-then-
             tap: click the item, then the target)
     key     the option's number key (1..n)

   Each run must store exactly the intended answer and then finish the sheet
   by itself (auto, 500ms) onto the right next step, with no Continue press.
   Also: F1's arrow keys step the door and leave the finish to the panel's
   Continue (Enter); Esc returns to the parent, answers untouched; a sheet's
   number keys never reach the parent screen under it.

   node e2e/game-sheets-desk.mjs [F1 F4 ...] [--sizes=1440x790,1280x600]
   Needs the dev server on http://localhost:3000. Exit 1 on any failure. */
import puppeteer from 'puppeteer-core'

const args = process.argv.slice(2)
const opt = (n, d) => { const a = args.find((x) => x.startsWith(`--${n}=`)); return a ? a.split('=').slice(1).join('=') : d }
const BASE = process.env.BASE || 'http://localhost:3000/v1' // the earlier game moved to /v1
const SIZES = opt('sizes', '1440x790,1280x600,1920x950').split(',').map((s) => s.split('x').map(Number))
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

/* sheet -> url, store key, next step, and per mode: [answer, how] */
const SHEETS = {
  F1: { url: 'screen=S02&sheet=F1', key: 'classroom.mandatory', next: 'S03',
    opts: ['mandatory', 'clientFirst', 'optional'], drag: 'optional', click: 'clientFirst', num: 1 },
  F2a: { url: 'screen=S04&beat=B&sheet=F2a', key: 'pace.readyFor', next: 'S05',
    opts: ['reviewAlone', 'pitch', 'cold', 'smallBook', 'commitment'], drag: 'cold', click: 'commitment', num: 2 },
  F2b: { url: 'screen=S04&beat=B&sheet=F2b', key: 'pace.cantRush', next: 'S05',
    opts: ['cycle', 'trust', 'breadth', 'confidence'], drag: 'trust', click: 'breadth', num: 4 },
  F3a: { url: 'screen=S05&sheet=F3a', key: 'kit.agentsFirst', next: 'S06',
    opts: ['byHand', 'spotWrong', 'sharpBrief', 'learnByDoing'], drag: 'spotWrong', click: 'sharpBrief', num: 1 },
  F3b: { url: 'screen=S05&sheet=F3b', key: 'kit.agentsEarn', next: 'S06',
    opts: ['cert', 'signoff', 'time', 'record'], drag: 'record', click: 'cert', num: 3 },
  F3c: { url: 'screen=S05&sheet=F3c', key: 'kit.agentsWhyNot', next: 'S06',
    opts: ['stopLearning', 'trustOutput', 'clients', 'notYet'], drag: 'clients', click: 'notYet', num: 2 },
  F4: { url: 'screen=S07&sheet=F4', key: 'certify.how', next: 'S08',
    opts: ['avatar', 'written', 'practical', 'observed', 'clientFeedback'], drag: 'observed', click: 'written', num: 5 },
  F5: { url: 'screen=S08&sheet=F5&variant=A', key: 'guarantee', next: 'S09#A',
    opts: null /* seeded order: read from the page */, drag: 'debrief', click: 'mentor', num: 6 },
}
const only = args.filter((a) => !a.startsWith('--'))
const IDS = only.length ? only : Object.keys(SHEETS)

const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: 'new',
  args: ['--hide-scrollbars'],
})
const failures = []
let passes = 0

for (const [W, H] of SIZES) {
  for (const id of IDS) {
    const S = SHEETS[id]
    for (const mode of ['drag', 'click', 'key', 'arrows', 'back']) {
      if (mode === 'arrows' && id !== 'F1') continue
      const ctx = await browser.createBrowserContext()
      const page = await ctx.newPage()
      const errors = []
      page.on('pageerror', (e) => errors.push(e.message.split('\n')[0]))
      await page.setViewport({ width: W, height: H, deviceScaleFactor: 1 })
      await page.goto(`${BASE}/?${S.url}`, { waitUntil: 'networkidle2' })
      await page.addStyleTag({ content: 'nextjs-portal{display:none!important}' }).catch(() => {})
      await page.waitForSelector(`[data-sheet="${id}"] [data-followup-card]`, { timeout: 8000 }).catch(() => {})
      await sleep(900)
      const label = `${id} ${mode} ${W}x${H}`
      const fail = (m) => { failures.push(`${label}: ${m}`); console.log(`FAIL ${label}: ${m}`) }

      const st = () => page.evaluate(() => JSON.parse(localStorage.getItem('ascent-game-v1') || '{}').state ?? {})
      const stepNow = () => page.$eval('[data-game]', (g) => g.getAttribute('data-step'))
      const center = async (sel) => {
        const el = await page.waitForSelector(sel, { visible: true, timeout: 4000 })
        const b = await el.boundingBox()
        return { x: b.x + b.width / 2, y: b.y + b.height / 2 }
      }
      const drag = async (a, b, n = 18) => {
        await page.mouse.move(a.x, a.y); await page.mouse.down()
        for (let i = 1; i <= n; i++) await page.mouse.move(a.x + ((b.x - a.x) * i) / n, a.y + ((b.y - a.y) * i) / n)
        await page.mouse.up(); await sleep(250)
      }
      const click = async (sel) => { const c = await center(sel); await page.mouse.click(c.x, c.y); await sleep(200) }
      const layout = await page.$eval('[data-game]', (g) => g.getAttribute('data-layout')).catch(() => null)
      if (!layout || layout === 'phone') { fail(`rendered ${layout}`); await ctx.close(); continue }
      if (!(await page.$(`[data-sheet="${id}"] [data-sheet-desk]`))) fail('no desk layout in the card (fallback phone body)')
      const before = (await st()).answers ?? {}
      const opts = S.opts ?? await page.$$eval('[data-testid^="f5-tag-"]', (xs) => xs.map((x) => x.getAttribute('data-testid').slice(7)))
      let want
      try {
        if (mode === 'drag') {
          want = S.drag
          if (id === 'F1') {
            // walk the door's knob along the swing arc to the stop
            const pts = await page.evaluate((stop) => {
              const svg = document.querySelector('[data-testid="f1-body"] svg')
              const p = svg.querySelector('path[data-rs-track]')
              const m = svg.getScreenCTM()
              const L = p.getTotalLength()
              const knob = svg.querySelector('[data-rs-thumb] circle:last-of-type') ?? svg.querySelector('[data-rs-thumb] circle')
              const kb = knob.getBoundingClientRect()
              const out = [{ x: kb.x + kb.width / 2, y: kb.y + kb.height / 2 }]
              const s = svg.querySelector(`circle[data-rs-stop="${stop}"]`)
              const sb = s.getBoundingClientRect()
              for (let i = 0; i <= 12; i++) { const q = p.getPointAtLength((L * i) / 12); const d = new DOMPoint(q.x, q.y).matrixTransform(m); out.push({ x: d.x, y: d.y }) }
              out.push({ x: sb.x + sb.width / 2, y: sb.y + sb.height / 2 })
              return out
            }, want)
            await page.mouse.move(pts[0].x, pts[0].y); await page.mouse.down()
            for (const q of pts.slice(1)) { await page.mouse.move(q.x, q.y, { steps: 3 }) }
            await page.mouse.up(); await sleep(250)
          } else if (id === 'F2a') await drag(await center('[data-testid="f2a-rookie"]'), await center(`[data-testid="f2a-ledge-${want}"]`))
          else if (id === 'F4') await drag(await center(`[data-testid="method-${want}"]`), await center('[data-testid="zone-plaque"]'))
          else if (id === 'F5') await drag(await center(`[data-testid="f5-tag-${want}"]`), await center('[data-testid="f5-clip"]'))
          else await click(id === 'F2b' ? `[data-testid="f2b-${want}"]` : `[data-testid="opt-${want}"]`)
        } else if (mode === 'click') {
          want = S.click
          if (id === 'F1') await click(`[data-testid="door-${want}"]`)
          else if (id === 'F2a') { await click('[data-testid="f2a-rookie"]'); await click(`[data-testid="f2a-ledge-${want}"]`) }
          else if (id === 'F4') { await click(`[data-testid="method-${want}"]`); await click('[data-testid="zone-plaque"]') }
          else if (id === 'F5') { await click(`[data-testid="f5-tag-${want}"]`); await click('[data-testid="f5-clip"]') }
          else await click(id === 'F2b' ? `[data-testid="f2b-${want}"]` : `[data-testid="opt-${want}"]`)
        } else if (mode === 'key') {
          want = opts[S.num - 1]
          await page.mouse.move(5, H - 5) // nothing hovered
          await page.keyboard.press(String(S.num))
          await sleep(150)
        } else if (mode === 'arrows') {
          // the door steps with the keys; the panel's Continue (Enter) finishes
          want = 'clientFirst'
          await page.keyboard.press('ArrowRight'); await sleep(120)
          await page.keyboard.press('ArrowRight'); await sleep(900)
          if ((await stepNow()) !== id) fail('arrow keys finished the sheet by themselves')
          const cont = await page.$('[data-testid="sheet-done"], [data-testid="sheet-continue"]')
          if (!cont) fail('no Continue in the panel after arrow keys')
          await page.keyboard.press('Enter')
        } else if (mode === 'back') {
          await page.keyboard.press('Escape'); await sleep(900)
          const s = await st()
          if (s.sheet) fail(`Esc did not close the sheet (${JSON.stringify(s.sheet)})`)
          const parent = await stepNow()
          if (!parent || parent.startsWith('F')) fail(`Esc landed on ${parent}`)
          const a = s.answers ?? {}
          if (JSON.stringify(a) !== JSON.stringify(before)) fail('Esc changed the answers')
        }
      } catch (e) { fail(`driver: ${e.message.split('\n')[0]}`) }

      if (mode !== 'back') {
        const got = (await st()).answers?.[S.key]
        if (got !== want) fail(`stored ${S.key}=${JSON.stringify(got)} (wanted ${JSON.stringify(want)})`)
        // no other answer changed (the parent under the sheet never took the key)
        const after = (await st()).answers ?? {}
        const changed = Object.keys({ ...before, ...after }).filter((k) => k !== S.key && JSON.stringify(before[k]) !== JSON.stringify(after[k]))
        if (changed.length) fail(`other answers changed: ${changed.join(', ')}`)
        const moved = await page.waitForFunction((s) => document.querySelector('[data-game]')?.getAttribute('data-step') === s, { timeout: 3000 }, S.next).then(() => true).catch(() => false)
        if (!moved) fail(`did not finish onto ${S.next} (at ${await stepNow()})`)
      }
      if (errors.length) fail(`page errors: ${errors.slice(0, 2).join(' | ')}`)
      if (!failures.some((f) => f.startsWith(label))) { passes++; console.log(`ok   ${label}${want ? ` -> ${S.key}=${want}` : ''}`) }
      await ctx.close()
    }
  }
}
await browser.close()
console.log(failures.length ? `\n${failures.length} FAILED (${passes} passed)` : `\nALL ${passes} SHEET RUNS PASS`)
process.exitCode = failures.length ? 1 : 0
