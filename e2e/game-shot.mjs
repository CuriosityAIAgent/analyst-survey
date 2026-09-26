/* Screenshot The Ascent (game) at 390x660 (DPR 2), or 390x844 with --tall.
   Desk: --desk (1440x790, a 1440x900 laptop less the browser chrome, no touch,
   a fine pointer) or --size=WxH (any viewport; the layout rule picks phone /
   deskCompact / desk, and --layout=desk forces one via ?layout=).

   node e2e/game-shot.mjs S05                 one screen (dev jump, earlier answers filled)
   node e2e/game-shot.mjs "S04 B" "S05 A F3a"  beat, and a sheet over its parent
   node e2e/game-shot.mjs "S08 A F5 B"         4th word = F5 variant
   node e2e/game-shot.mjs title               the real first screen, clean storage
   node e2e/game-shot.mjs --art               /art/game, full page
   flags: --tall  --reduced  --empty (fill=0)  --wait=900  --url=/path?x=y
          --out=/dir  --touch (a touch viewport; default on)
          --desk  --size=1280x600  --layout=phone|desk|deskCompact

   Saves to /tmp/ascent-game-shots/<name>.png and prints, per shot, whether
   the page scrolls (scrollHeight > innerHeight), anything clipped below the
   fold inside the frame, and every page error / console error. Needs the dev
   server on http://localhost:3000. */
import puppeteer from 'puppeteer-core'
import fs from 'node:fs'
import path from 'node:path'

const args = process.argv.slice(2)
const flag = (n) => args.includes(`--${n}`)
const opt = (n, d) => { const a = args.find((x) => x.startsWith(`--${n}=`)); return a ? a.split('=').slice(1).join('=') : d }
const shots = args.filter((a) => !a.startsWith('--'))
const BASE = process.env.BASE || 'http://localhost:3000/v1' // the earlier game moved to /v1
const OUT = opt('out', '/tmp/ascent-game-shots')
const tall = flag('tall')
const size = opt('size', flag('desk') ? '1440x790' : '')
const desk = !!size
const [DW, DH] = size ? size.split('x').map(Number) : [390, tall ? 844 : 660]
const W = DW
const H = DH
const layout = opt('layout', '')
const wait = Number(opt('wait', '900'))
fs.mkdirSync(OUT, { recursive: true })

if (flag('art')) shots.push('--art')
if (opt('url')) shots.push(`--url=${opt('url')}`)
if (!shots.length) shots.push('title')

const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: 'new',
  args: ['--hide-scrollbars'],
})
let failed = false
for (const spec of shots) {
  // a fresh incognito context per shot: no storage leaks between shots
  const context = await browser.createBrowserContext()
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`))
  page.on('console', (m) => { if (m.type() === 'error') errors.push(`console: ${m.text().slice(0, 300)}`) })
  const isArt = spec === '--art'
  await page.setViewport({ width: isArt ? 1200 : W, height: isArt ? 900 : H, deviceScaleFactor: 2, isMobile: !isArt && !desk, hasTouch: !isArt && !desk })
  if (flag('reduced')) await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])

  let url, name
  if (isArt) { url = `${BASE}/art/game`; name = 'art' }
  else if (spec.startsWith('--url=')) { url = BASE + spec.slice(6); name = spec.slice(6).replace(/[^a-z0-9]+/gi, '_') || 'root' }
  else if (spec === 'title') { url = `${BASE}/`; name = 'title' }
  else {
    const [screen, beat, sheet, variant] = spec.split(/\s+/)
    const q = new URLSearchParams({ screen })
    if (beat) q.set('beat', beat)
    if (sheet) q.set('sheet', sheet)
    if (variant) q.set('variant', variant)
    if (flag('empty')) q.set('fill', '0')
    if (layout) q.set('layout', layout)
    url = `${BASE}/?${q}`
    name = [screen, beat, sheet, variant].filter(Boolean).join('-')
  }
  if (desk && layout && spec === 'title') url += `?layout=${layout}`
  if (tall) name += '-tall'
  if (desk) name += `-${W}x${H}`
  if (flag('reduced')) name += '-reduced'

  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 })
  // hide the Next.js dev indicator so it never covers the frame
  await page.addStyleTag({ content: 'nextjs-portal{display:none!important}' }).catch(() => {})
  await page.evaluate(() => document.fonts && document.fonts.ready)
  await new Promise((r) => setTimeout(r, wait))

  const file = path.join(OUT, `${name}.png`)
  await page.screenshot({ path: file, fullPage: isArt })
  const info = await page.evaluate(() => {
    const se = document.scrollingElement
    const scrolls = se ? se.scrollHeight > window.innerHeight + 1 : false
    const clipped = []
    const root = document.querySelector('[data-active-step]') || document.querySelector('[data-game]')
    if (root) {
      for (const el of root.querySelectorAll('button, input, textarea, [data-item], [data-zone], h1, h2, p, [role=button]')) {
        const r = el.getBoundingClientRect()
        const cs = getComputedStyle(el)
        if (r.width === 0 || r.height === 0 || cs.visibility === 'hidden' || cs.display === 'none') continue
        if (r.bottom > window.innerHeight + 1 || r.right > window.innerWidth + 1) {
          clipped.push(`${el.tagName.toLowerCase()}${el.dataset.testid ? '#' + el.dataset.testid : ''} "${(el.textContent || '').trim().slice(0, 40)}" bottom=${Math.round(r.bottom)} right=${Math.round(r.right)}`)
        }
      }
    }
    const g = document.querySelector('[data-game]')
    return {
      step: g?.getAttribute('data-step') ?? null,
      scrolls,
      scrollHeight: se?.scrollHeight,
      innerHeight: window.innerHeight,
      clipped: clipped.slice(0, 12),
      placeholders: document.querySelectorAll('[data-art-placeholder]').length,
    }
  })
  const ok = (isArt || !info.scrolls) && (isArt || !info.clipped.length) && !errors.length
  if (!ok) failed = true
  console.log(`${ok ? 'ok  ' : 'WARN'} ${name.padEnd(18)} -> ${file}`)
  console.log(`     step=${info.step} scrolls=${info.scrolls} (${info.scrollHeight}/${info.innerHeight}) art-placeholders=${info.placeholders}`)
  for (const c of info.clipped) console.log(`     clipped: ${c}`)
  for (const e of errors) console.log(`     ${e}`)
  await context.close()
}
await browser.close()
process.exitCode = failed ? 1 : 0
