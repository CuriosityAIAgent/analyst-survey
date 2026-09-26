/* The Ascent v2 preview (/preview), end to end: press Next on every screen
   without answering anything, and check that every screen and EVERY follow-up
   of every question appears, in the engine's order, each with its number and
   topic line, with no page scroll, Next on screen and no page errors. Then
   check that the preview run does not leak into a live run at /.

   node e2e/v2-preview.mjs [--shots]
     BASE=https://...   a deployed URL (default http://localhost:3000)
     DESK=1             desk size (1440x790); DESK=1280x600 for any other size
     --shots            a PNG per screen in /tmp/ascent-v2-shots/preview-* */
import puppeteer from 'puppeteer-core'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createJiti } from 'jiti'

const args = process.argv.slice(2)
const BASE = (process.env.BASE || 'http://localhost:3000').replace(/\/+$/, '')
const DESK = process.env.DESK ? (/^\d+x\d+$/.test(process.env.DESK) ? process.env.DESK : '1440x790') : ''
const [W, H] = DESK ? DESK.split('x').map(Number) : [390, 660]
const OUT = '/tmp/ascent-v2-shots'
fs.mkdirSync(OUT, { recursive: true })
const here = path.dirname(fileURLToPath(import.meta.url))
const flow = await createJiti(import.meta.url).import(path.join(here, '../src/v2/engine/flow.ts'))
const STORE_KEY = 'ascent-v2-v1'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const fails = []
const fail = (m) => { fails.push(m); console.log('  FAIL ' + m) }

const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' })
try {
  const page = await browser.newPage()
  await page.setViewport(DESK ? { width: W, height: H } : { width: W, height: H, isMobile: true, hasTouch: true, deviceScaleFactor: 2 })
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('console', (m) => { if (m.type() === 'error' && !/React DevTools|favicon/.test(m.text())) errors.push('console: ' + m.text().slice(0, 200)) })
  const link = '?business=uspb&cohort=2024&r=preview01'
  await page.goto(`${BASE}/preview${link}`, { waitUntil: 'networkidle0' })
  await page.evaluate((k) => localStorage.removeItem(k), STORE_KEY)
  await page.reload({ waitUntil: 'networkidle0' })
  await page.waitForSelector('[data-v2][data-step="welcome"]', { timeout: 15000 })
  const channel = await page.$eval('[data-v2]', (e) => e.dataset.channel)
  console.log(`preview (${DESK ? 'desk ' + DESK : 'phone 390x660'}, channel ${channel})`)
  if (!(await page.$('[data-preview-note]'))) fail('welcome: no preview note')

  // what the engine says preview shows: every screen, every follow-up, in order
  const want = []
  let c = { screen: 0, fu: -1 }
  while (c !== 'end') { want.push(flow.viewAt(channel, c, {}, true)); c = flow.nextCursor(channel, c, {}, true) }

  const tap = async (sel) => {
    const el = await page.$(sel)
    if (!el) return false
    if (DESK) await el.click(); else await el.tap()
    return true
  }
  const waitMove = async (from) => {
    for (let t = 0; t < 100; t++) {
      const s = await page.evaluate(() => document.querySelector('[data-v2]')?.dataset.step)
      if (s && s !== from) { await sleep(380); return s }
      await sleep(60)
    }
    return from
  }

  await tap('[data-next]')
  let step = await waitMove('welcome')
  const seen = []
  for (let i = 0; i < 200; i++) {
    const s = await page.evaluate(() => {
      const r = document.querySelector('[data-v2]')
      const n = document.querySelector('[data-next]')
      const d = document.documentElement
      const nb = n?.getBoundingClientRect()
      return {
        step: r?.dataset.step, finished: r?.dataset.finished === 'true',
        rail: document.querySelector('[data-rail]')?.textContent?.replace(/\s+/g, ' ').trim() ?? '',
        bridge: document.querySelector('[data-bridge]')?.textContent?.trim() ?? '',
        h1: document.querySelector('[data-v2] h1')?.textContent?.trim() ?? '',
        focused: document.activeElement?.tagName ?? '',
        nextOn: !!n && !n.disabled, nextTop: nb?.top ?? -1, nextBottom: nb?.bottom ?? 1e9,
        sh: Math.max(d.scrollHeight, document.body.scrollHeight), ih: innerHeight,
        err: !!document.querySelector('[data-render-error]'),
        q: document.querySelector('[data-q]')?.getAttribute('data-q') ?? null,
      }
    })
    if (s.finished) break
    const v = want[seen.length]
    const label = `${String(seen.length + 1).padStart(2, '0')} ${s.step}`
    seen.push(s.step)
    if (!v) { fail(`${label}: more screens than the engine lists`); break }
    if (v.key !== s.step) fail(`${label}: want ${v.key}`)
    const railWant = v.kind === 'break' ? `Section ${v.section} of ${v.sections}` : v.kind === 'scene' ? 'Before the next questions' : `Question ${v.n} of ${v.total}`
    if (!s.rail.includes(railWant)) fail(`${label}: rail "${s.rail}" (want ${railWant})`)
    if (v.kind === 'follow') {
      if (s.bridge !== v.bridge) fail(`${label}: topic line "${s.bridge}" (want "${v.bridge}")`)
      if (!s.h1.includes(v.q.question)) fail(`${label}: heading "${s.h1}"`)
    }
    if ((v.kind === 'question' || v.kind === 'follow') && s.q !== v.q.id) fail(`${label}: data-q is ${s.q}`)
    if (s.focused !== 'H1') fail(`${label}: focus is on ${s.focused}, not the question heading`)
    if (!s.nextOn) fail(`${label}: Next is not live in preview`)
    if (s.sh > s.ih + 1) fail(`${label}: page scrolls (${s.sh} > ${s.ih})`)
    if (s.nextBottom > s.ih + 1 || s.nextTop < 0) fail(`${label}: Next off screen`)
    if (s.err) fail(`${label}: the renderer failed (fallback shown)`)
    if (args.includes('--shots')) await page.screenshot({ path: `${OUT}/preview-${DESK ? 'desk' : 'phone'}-${String(seen.length).padStart(2, '0')}-${s.step}.png` })
    await tap('[data-next]')
    step = await waitMove(s.step)
    if (step === s.step) { fail(`${label}: Next did not move on`); break }
  }
  const end = await page.$eval('[data-v2]', (e) => ({ finished: e.dataset.finished === 'true', text: e.textContent }))
  if (!end.finished) fail('did not reach the ending')
  if (!end.text.includes('AI can help. You still do the work.')) fail('ending line missing')
  const wantKeys = want.map((v) => v.key)
  const missing = wantKeys.filter((k) => !seen.includes(k))
  if (missing.length) fail(`never shown: ${missing.join(', ')}`)
  const allFollow = flow.screens(channel).flatMap((x) => (x.kind === 'question' ? (x.question.followUps ?? []).map((f) => f.id) : []))
  const shownFollow = seen.filter((k) => allFollow.includes(k))
  if (shownFollow.length !== allFollow.length) fail(`follow-ups shown ${shownFollow.length} of ${allFollow.length}`)
  console.log(`  ${seen.length} screens, ${shownFollow.length} follow-ups`)

  // nothing invented but what a later screen needs (3.1's tiles for its follow-up)
  const saved = await page.evaluate((k) => JSON.parse(localStorage.getItem(k)).state, STORE_KEY)
  // (a renderer may store an empty answer on its own, such as {} for untouched notes)
  const empty = (v) => (Array.isArray(v) ? v.length === 0 : v && typeof v === 'object' ? Object.values(v).every((x) => x === '') : false)
  const keys = Object.keys(saved.answers).filter((k) => k !== 'scene.seen' && !k.endsWith('.order') && !empty(saved.answers[k]))
  if (JSON.stringify(keys) !== JSON.stringify(['time.sort'])) fail(`preview stored answers beyond the sample: ${keys.join(', ')}`)
  if (saved.mode !== 'preview') fail(`saved mode is ${saved.mode}`)

  // a live run on the same link starts fresh: preview answers never leak
  await page.goto(`${BASE}/${link}`, { waitUntil: 'networkidle0' })
  await page.waitForSelector('[data-v2]')
  await sleep(300)
  const live = await page.evaluate((k) => ({ step: document.querySelector('[data-v2]')?.dataset.step, s: JSON.parse(localStorage.getItem(k) || 'null')?.state }), STORE_KEY)
  if (live.step !== 'welcome') fail(`live after preview opens at ${live.step}`)
  if (live.s && (Object.keys(live.s.answers ?? {}).length || live.s.mode !== 'live')) fail('live run after preview kept preview answers')
  for (const e of errors) fail(`page error: ${e}`)
} finally { await browser.close() }
console.log(fails.length ? `\n${fails.length} FAILED` : '\nALL PASS')
process.exit(fails.length ? 1 : 0)
