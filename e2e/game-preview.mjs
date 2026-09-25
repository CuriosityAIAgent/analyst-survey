/* Preview mode (?preview=1): starting fresh and answering NOTHING, pressing
   only the move-on button must visit every screen and beat and every
   follow-up version (F1, F2a, F2b, F3a, F3b, F3c, F4, F5 A and B), then finish.
   Usage: BASE=http://localhost:3000 node e2e/game-preview.mjs */
import puppeteer from 'puppeteer-core'
const BASE = process.env.BASE || 'http://localhost:3000'
const br = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' })
const p = await br.newPage()
await p.setViewport({ width: 390, height: 660, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
const errs = []; p.on('pageerror', (e) => errs.push(String(e).slice(0, 200)))
await p.goto(BASE + '/?preview=1', { waitUntil: 'networkidle2' })
await p.evaluate(() => localStorage.clear())
await p.goto(BASE + '/?preview=1', { waitUntil: 'networkidle2' })
await new Promise((r) => setTimeout(r, 800))
const state = () => p.evaluate(() => JSON.parse(localStorage.getItem('ascent-game-v1') ?? '{}').state ?? {})
const key = (s) => s.finished ? 'END' : s.sheet ? `${s.sheet.id}${s.sheet.variant ? ' ' + s.sheet.variant : ''}` : `${s.screen}#${s.beat}`
const seen = []; const problems = []
for (let i = 0; i < 60; i++) {
  const s = await state()
  const k = s.started ? key(s) : 'S01#A'
  if (seen.at(-1) !== k) seen.push(k)
  if (k === 'END') break
  const info = await p.evaluate(() => ({
    scroll: document.scrollingElement.scrollHeight > innerHeight + 1,
    tag: !!document.querySelector('[data-preview]'),
  }))
  if (info.scroll) problems.push(`${k} scrolls`)
  if (!info.tag && k !== 'S01#A') problems.push(`${k} has no preview tag`)
  const clicked = await p.evaluate(() => {
    const vis = (el) => el && !el.disabled && el.offsetParent !== null
    const pick = [
      document.querySelector('[data-testid=sheet-done]'),
      document.querySelector('[data-testid=walk-on]'),
      document.querySelector('[data-testid=primary]'),
      ...[...document.querySelectorAll('main button.btn, button.btn')].filter((b) => !b.closest('[data-stage]') || /Continue|Start|Tie|Leave|walking/i.test(b.textContent)),
      [...document.querySelectorAll('button')].find((b) => /^Skip/i.test(b.textContent.trim())),
    ].filter(vis)
    const b = pick[0]; if (!b) return null
    b.click(); return b.textContent.trim()
  })
  if (!clicked) { problems.push(`${k}: no way to move on`); break }
  await new Promise((r) => setTimeout(r, k.startsWith('S02') || k.startsWith('S04') || k.startsWith('S06') ? 1400 : 700))
}
const want = ['S01#A', 'S02#A', 'F1', 'S03#A', 'S04#A', 'S04#B', 'F2a', 'F2b', 'S05#A', 'F3a', 'F3b', 'F3c', 'S06#A', 'S07#A', 'F4', 'S08#A', 'F5 A', 'F5 B', 'S09#A', 'S09#B', 'S10#A', 'S10#B', 'S11#A', 'END']
const missing = want.filter((w) => !seen.includes(w))
console.log('visited:', seen.join(' > '))
console.log('missing:', missing.length ? missing.join(', ') : 'none')
console.log('problems:', problems.length ? problems : 'none')
console.log('page errors:', errs.length ? errs : 'none')
await br.close()
process.exit(missing.length || problems.length || errs.length ? 1 : 0)
