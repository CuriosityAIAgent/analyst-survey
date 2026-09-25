/* The Ascent (game) on desktop: every step, beat and follow-up sheet at the
   three budget viewports of the desktop design (section 11): 1280x600 (a
   1280x720 / 1366x768 laptop less the browser chrome: deskCompact), 1440x790
   (a 1440x900 laptop: desk) and 1920x950 (a 1920x1080 monitor: desk). A mouse
   (no touch), DPR 2, via the dev jump (?screen=&beat=&sheet=&variant=, the
   earlier answers filled).

   For every shot:
     layout     the committed layout is the one the rule gives
     scroll     the page never scrolls (either axis)
     offscreen  no control, item, target or heading of the active step lies
                outside the viewport
     clipped    no control, item or target of the active step is cut off by
                an overflow-hidden ancestor (the stage, the card)
     panel      the question panel is there, and its question (h1/h2
                [data-prompt]) and how-line ([data-helper]) are fully visible
     primary    the panel's primary is there (primary, walk-on, sheet-done
                or sheet-continue; S11 has only its quiet Skip, by design)
     art        no art placeholder; no 3D render drawn above 2x its natural
                pixels (a missing re-render); the largest upscale is printed
     errors     no page errors, no console errors

   node e2e/game-desk.mjs                       every step at the three sizes
   node e2e/game-desk.mjs "S05 A F3a" S07       only these (game-shot syntax)
   flags: --sizes=1280x600,1440x900   --shots (PNG per shot to --out)
          --out=/tmp/ascent-desk   --dpr=2
   Needs the dev server on http://localhost:3000. Exit 1 on any failure. */
import puppeteer from 'puppeteer-core'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const args = process.argv.slice(2)
const flag = (n) => args.includes(`--${n}`)
const opt = (n, d) => { const a = args.find((x) => x.startsWith(`--${n}=`)); return a ? a.split('=').slice(1).join('=') : d }
const BASE = process.env.BASE || 'http://localhost:3000'
const OUT = opt('out', '/tmp/ascent-desk')
const DPR = Number(opt('dpr', '2'))
const SIZES = opt('sizes', '1280x600,1440x790,1920x950').split(',').map((s) => s.split('x').map(Number))
const here = path.dirname(fileURLToPath(import.meta.url))
const SPRITES = Object.fromEntries(
  [...fs.readFileSync(path.join(here, '../src/game/art/sprites.ts'), 'utf8').matchAll(/'([^']+)': \[(\d+), (\d+)\]/g)]
    .map((m) => [m[1], [Number(m[2]), Number(m[3])]]),
)
fs.mkdirSync(OUT, { recursive: true })

const ALL_STEPS = [
  'S01 A', 'S01 B', 'S02', 'S02 A F1', 'S03', 'S04 A', 'S04 B', 'S04 B F2a', 'S04 B F2b',
  'S05', 'S05 A F3a', 'S05 A F3b', 'S05 A F3c', 'S06', 'S07', 'S07 A F4', 'S08', 'S08 A F5 A', 'S08 A F5 B',
  'S09 A', 'S09 B', 'S10 A', 'S10 B', 'S11',
]
const only = args.filter((a) => !a.startsWith('--'))
const STEPS = only.length ? only : ALL_STEPS

/** The layout rule (layout.ts), for the expectation. */
function layoutFor(w, h) {
  const wide = w / h >= 1.3
  if (wide && w >= 1360 && h >= 700) return 'desk'
  if (wide && w >= 1024 && h >= 560) return 'deskCompact'
  return 'phone'
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: 'new',
  args: ['--hide-scrollbars'],
})

const failures = []
const rows = []
for (const [W, H] of SIZES) {
  const want = layoutFor(W, H)
  for (const spec of STEPS) {
    const [screen, beat, sheet, variant] = spec.split(/\s+/)
    const q = new URLSearchParams({ screen })
    if (beat) q.set('beat', beat)
    if (sheet) q.set('sheet', sheet)
    if (variant) q.set('variant', variant)
    const name = `${spec.replace(/\s+/g, '-')}-${W}x${H}`
    const ctx = await browser.createBrowserContext()
    const page = await ctx.newPage()
    const errors = []
    page.on('pageerror', (e) => errors.push(`pageerror: ${e.message.split('\n')[0]}`))
    page.on('console', (m) => { if (m.type() === 'error') errors.push(`console: ${m.text().split('\n')[0].slice(0, 200)}`) })
    await page.setViewport({ width: W, height: H, deviceScaleFactor: DPR, isMobile: false, hasTouch: false })
    await page.goto(`${BASE}/?${q}`, { waitUntil: 'networkidle2', timeout: 60000 })
    await page.addStyleTag({ content: 'nextjs-portal{display:none!important}' }).catch(() => {})
    await page.waitForSelector('[data-game]', { timeout: 15000 }).catch(() => {})
    await sleep(sheet ? 1100 : 900)

    const r = await page.evaluate((SPRITES, DPR) => {
      const vis = (el) => {
        const b = el.getBoundingClientRect()
        const cs = getComputedStyle(el)
        return b.width >= 2 && b.height >= 2 && cs.visibility !== 'hidden' && cs.display !== 'none' && Number(cs.opacity) !== 0
      }
      const desc = (el) => {
        const b = el.getBoundingClientRect()
        return `${el.tagName.toLowerCase()}${el.dataset.testid ? '#' + el.dataset.testid : el.dataset.item ? '[item=' + el.dataset.item + ']' : el.dataset.zone ? '[zone=' + el.dataset.zone + ']' : ''} "${(el.textContent || '').trim().slice(0, 24)}" [${Math.round(b.left)},${Math.round(b.top)} ${Math.round(b.right)}x${Math.round(b.bottom)}]`
      }
      const g = document.querySelector('[data-game]')
      const se = document.scrollingElement
      const out = {
        layout: g?.getAttribute('data-layout') ?? null,
        step: g?.getAttribute('data-step') ?? null,
        scroll: se.scrollHeight > innerHeight + 1 || se.scrollWidth > innerWidth + 1,
        sh: se.scrollHeight, sw: se.scrollWidth,
        off: [], clipped: [], panel: [], primary: null, placeholders: 0, upscale: [],
      }
      const roots = document.querySelectorAll('[data-active-step]')
      const root = roots[roots.length - 1]
      if (!root) { out.panel.push('no active step'); return out }
      const SEL = 'button, input, textarea, [data-item], [data-zone], h1, h2, [role=button], [role=radio], [data-testid]'
      for (const el of root.querySelectorAll(SEL)) {
        if (!vis(el)) continue
        if (el.closest('[aria-hidden="true"]') && !el.matches('[data-item], [data-zone], button')) continue
        if (el.closest('[data-sr-only], .sr-only')) continue
        if (el.matches('input[type=range]')) continue // visually hidden native ranges
        const b = el.getBoundingClientRect()
        if (b.bottom > innerHeight + 1 || b.right > innerWidth + 1 || b.top < -1 || b.left < -1) { out.off.push(desc(el)); continue }
        // cut off by an overflow-hidden ancestor (up to the active root)?
        if (!el.matches('button, [data-item], [data-zone], h1, h2, input, textarea, [role=radio]')) continue
        for (let a = el.parentElement; a && a !== root.parentElement; a = a.parentElement) {
          const cs = getComputedStyle(a)
          if (cs.overflow === 'visible' && cs.overflowX === 'visible' && cs.overflowY === 'visible') continue
          const c = a.getBoundingClientRect()
          const cut = Math.max(0, c.left - b.left) + Math.max(0, b.right - c.right) + Math.max(0, c.top - b.top) + Math.max(0, b.bottom - c.bottom)
          // more than a quarter of the element hidden
          if (cut > 0 && cut > 0.25 * Math.min(b.width, b.height)) { out.clipped.push(`${desc(el)} in ${a.tagName.toLowerCase()}${a.dataset.testid ? '#' + a.dataset.testid : ''}`); break }
        }
      }
      // the panel: a follow-up's own panel if a sheet is open, else the frame's
      const panels = [...document.querySelectorAll('[data-question-panel]')].filter(vis)
      const panel = panels[panels.length - 1]
      if (!panel) out.panel.push('no question panel')
      else {
        const pb = panel.getBoundingClientRect()
        for (const sel of ['[data-prompt]', '[data-helper]']) {
          const el = panel.querySelector(sel)
          if (!el || !vis(el) || !el.textContent.trim()) { out.panel.push(`${sel} missing`); continue }
          const b = el.getBoundingClientRect()
          if (b.bottom > pb.bottom + 1 || b.top < pb.top - 1 || b.bottom > innerHeight) out.panel.push(`${sel} clipped (${Math.round(b.bottom)} > ${Math.round(Math.min(pb.bottom, innerHeight))})`)
        }
        out.question = panel.querySelector('[data-prompt]')?.textContent.trim().slice(0, 70)
      }
      const prim = [...document.querySelectorAll('[data-testid=primary], [data-testid=walk-on], [data-testid=sheet-done], [data-testid=sheet-continue], [data-testid=skip]')].filter(vis)
      out.primary = prim.length ? prim[prim.length - 1].dataset.testid + (prim[prim.length - 1].dataset.valid === 'false' ? ' (not yet valid)' : '') : null
      out.placeholders = document.querySelectorAll('[data-art-placeholder]').length
      for (const svg of document.querySelectorAll('svg[data-sprite]')) {
        if (!vis(svg)) continue
        const nat = SPRITES[svg.dataset.sprite]
        if (!nat) continue
        const b = svg.getBoundingClientRect()
        const scene = (svg.dataset.art || '').startsWith('scene-')
        // meet draws inside the box; slice (scenes) covers it
        const k = scene ? Math.max(b.width / nat[0], b.height / nat[1]) : Math.min(b.width / nat[0], b.height / nat[1])
        out.upscale.push([svg.dataset.sprite, +(k * DPR).toFixed(2), Math.round(b.width)])
      }
      out.upscale.sort((a, b) => b[1] - a[1])
      return out
    }, SPRITES, DPR)

    const probs = []
    if (r.layout !== want) probs.push(`layout ${r.layout} (wanted ${want})`)
    // single-beat screens are keyed 'S02', multi-beat ones 'S04#A'
    const wantSteps = sheet ? [sheet] : beat ? [`${screen}#${beat}`] : [screen, `${screen}#A`]
    if (!wantSteps.includes(r.step)) probs.push(`step ${r.step} (wanted ${wantSteps.join(' or ')})`)
    if (r.scroll) probs.push(`page scrolls (${r.sw}x${r.sh})`)
    if (r.off.length) probs.push(`off-screen: ${r.off.slice(0, 3).join('; ')}`)
    if (r.clipped.length) probs.push(`clipped: ${r.clipped.slice(0, 3).join('; ')}`)
    if (r.panel.length) probs.push(`panel: ${r.panel.join(', ')}`)
    if (!r.primary) probs.push('no primary in the panel')
    if (r.placeholders) probs.push(`${r.placeholders} art placeholder(s)`)
    const over = r.upscale.filter((u) => u[1] > 2)
    if (over.length) probs.push(`3D drawn above 2x natural: ${over.slice(0, 3).map((u) => `${u[0]} ${u[1]}x`).join(', ')}`)
    if (errors.length) probs.push(`errors: ${[...new Set(errors)].slice(0, 2).join(' | ')}`)
    const top = r.upscale[0] ? `${r.upscale[0][0]} ${r.upscale[0][1]}x` : '-'
    console.log(`${probs.length ? 'FAIL' : 'ok  '} ${name.padEnd(24)} ${String(r.layout).padEnd(11)} primary=${r.primary ?? '-'}  max3D=${top}`)
    for (const p of probs) { console.log(`     ${p}`); failures.push(`${name}: ${p}`) }
    rows.push({ name, ok: !probs.length })
    if (flag('shots') || probs.length) await page.screenshot({ path: path.join(OUT, `${name}.png`) })
    await ctx.close()
  }
}
await browser.close()
const bad = rows.filter((x) => !x.ok).length
console.log(`\n${rows.length - bad}/${rows.length} shots pass${bad ? `; ${bad} fail (PNGs of the failures in ${OUT})` : ''}`)
process.exitCode = failures.length ? 1 : 0
