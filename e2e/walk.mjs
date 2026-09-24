import puppeteer from 'puppeteer-core'
import fs from 'node:fs'

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const BASE = process.env.BASE || 'http://localhost:3000'
const VIEW = process.env.VIEW === 'phone'
  ? { width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }
  : { width: 1280, height: 900, deviceScaleFactor: 2 }
const TAG = process.env.VIEW === 'phone' ? 'phone' : 'desktop'
const OUT = '.context/shots'
fs.mkdirSync(OUT, { recursive: true })

const errors = []
const log = (...a) => console.log(...a)

const b = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'] })
const p = await b.newPage()
await p.setViewport(VIEW)
p.on('console', (m) => { if (m.type() === 'error') errors.push(`console: ${m.text().slice(0, 200)}`) })
p.on('pageerror', (e) => errors.push(`pageerror: ${String(e).slice(0, 200)}`))
p.on('requestfailed', (r) => errors.push(`request failed: ${r.url().slice(0, 120)}`))

const shot = (n) => p.screenshot({ path: `${OUT}/${TAG}-${n}.png` })
const clickText = async (txt, exact = false) => {
  // scroll first: an element below the fold on a 390px viewport swallows the
  // click without erroring, which makes the test lie
  const ok = await p.evaluate((t, ex) => {
    const els = [...document.querySelectorAll('button,[role=button]')]
    const el = els.find((e) => ex ? e.textContent.trim() === t : e.textContent.includes(t))
    if (!el) return false
    el.scrollIntoView({ block: 'center' })
    el.click()
    return true
  }, txt, exact)
  if (!ok) throw new Error(`no clickable element containing "${txt}"`)
  await new Promise((r) => setTimeout(r, 140))
}
const footerEnabled = () => p.evaluate(() => {
  const bs = [...document.querySelectorAll('button')]
  const n = bs.find((b) => ['Next', 'Start the climb', 'To the top'].includes(b.textContent.trim()))
  return n ? !n.disabled : null
})
const levelIdx = () => p.evaluate(() => JSON.parse(localStorage.getItem('ascent-v1')).state.level)
const nextLevel = async (label = 'Next') => {
  const before = await levelIdx()
  if (await footerEnabled() !== true) throw new Error(`stuck on level ${before}: "${label}" is disabled`)
  await clickText(label)
  await new Promise(r=>setTimeout(r,320))
  const after = await levelIdx()
  if (after !== before + 1) throw new Error(`"${label}" did not advance: level ${before} -> ${after}`)
}
const heading = () => p.evaluate(() => document.querySelector('h1')?.textContent?.trim() ?? '')
const levelName = () => p.evaluate(() => document.querySelector('.uppercase')?.textContent?.trim() ?? '')

await p.goto(BASE, { waitUntil: 'networkidle2' })
await p.evaluate(() => localStorage.clear())
await p.goto(BASE, { waitUntil: 'networkidle2' })
await new Promise(r=>setTimeout(r,600))

// ---- L0 Base camp
log('L0', await levelName(), '|', (await heading()).slice(0,40))
if (await footerEnabled() !== false) errors.push('L0: Next was enabled before answering')
for (const t of ['USPB', '13–24', 'Most weeks']) await clickText(t, true)
await clickText('Run a client review')
if (await footerEnabled() !== true) errors.push('L0: Next still disabled after required fields')
await shot('0-basecamp')
await clickText('Start the climb'); await new Promise(r=>setTimeout(r,300))

// ---- L1 Fuel: nine rounds
log('L1', await levelName())
for (let r = 0; r < 9; r++) {
  const btns = await p.$$('button')
  const most = [], least = []
  for (const btn of btns) {
    const t = await p.evaluate((e) => e.textContent.trim(), btn)
    if (t === 'Taught me most') most.push(btn)
    if (t === 'Taught me least') least.push(btn)
  }
  if (most.length !== 3) { errors.push(`L1 round ${r+1}: expected 3 cards, saw ${most.length}`); break }
  await most[0].click(); await least[2].click()
  if (r === 0) await shot('1-fuel')
  await clickText(r === 8 ? 'Done' : 'Next three')
  await new Promise(r2=>setTimeout(r2,150))
}
const fuelCount = await p.evaluate(() => JSON.parse(localStorage.getItem('ascent-v1')).state.answers.fuel.length)
if (fuelCount !== 9) errors.push(`L1: stored ${fuelCount} rounds, expected 9`)
await nextLevel()

// ---- L2 Advisor
log('L2', await levelName())
if (await footerEnabled() !== false) errors.push('L2: Next enabled before picking traits')
for (const t of ['Commercial judgement', 'Reading people', 'Curiosity']) await clickText(t)
if (await footerEnabled() !== true) errors.push('L2: Next disabled after three traits')
await shot('2-advisor')
await nextLevel()

// ---- L3 Handover
log('L3', await levelName())
await clickText('Deal the thirteen'); await new Promise(r=>setTimeout(r,200))
await shot('3-handover-card')
for (let i = 0; i < 13; i++) {
  const lane = ['An agent does it', 'An agent drafts, I own it', 'I do it'][i % 3]
  await clickText(lane)
}
await new Promise(r=>setTimeout(r,250))
await shot('3-handover-clips')
// five clips, then check the cap holds
const chips = await p.$$('button.chip')
let clipped = 0
for (const c of chips) {
  if (clipped >= 6) break
  const t = await p.evaluate((e) => e.textContent.trim(), c)
  if (['Yes','No'].includes(t)) continue
  await c.click(); clipped++
}
const clips = await p.evaluate(() => JSON.parse(localStorage.getItem('ascent-v1')).state.answers.handover.clips.length)
if (clips > 5) errors.push(`L3: clip cap breached — ${clips} clips stored`)
log('   clips stored:', clips, '(cap 5)')
await clickText("That's them"); await new Promise(r=>setTimeout(r,250))
await shot('3-handover-reckoning')
const reckon = await heading()
log('   reckoning:', reckon.slice(0, 60))
if (await footerEnabled() !== true) errors.push('L3: Next disabled at the reckoning')
await nextLevel()

// ---- L4 Capacity
log('L4', await levelName())
const spentNow = () => p.evaluate(() => {
  const s = JSON.parse(localStorage.getItem('ascent-v1')).state.answers.capacity.spend
  return Object.values(s).reduce((a,b)=>a+b,0)
})
for (let i = 0; i < 40 && (await spentNow()) < 8; i++) {
  // re-query every time: the list re-renders after each click, so cached
  // handles go stale and the click silently lands on nothing
  const plus = await p.$$('button[aria-label^="Add an hour"]')
  const before = await spentNow()
  await plus[i % 4].click()
  await new Promise(r=>setTimeout(r,60))
  if (await spentNow() === before) { await new Promise(r=>setTimeout(r,120)) }
}
const spent = await p.evaluate(() => {
  const s = JSON.parse(localStorage.getItem('ascent-v1')).state.answers.capacity.spend
  return Object.values(s).reduce((a,b)=>a+b,0)
})
if (spent !== 8) errors.push(`L4: spent ${spent}, expected 8`)
// over-spend must be refused
const plus = await p.$$('button[aria-label^="Add an hour"]')
await plus[0].click()
const after = await p.evaluate(() => {
  const s = JSON.parse(localStorage.getItem('ascent-v1')).state.answers.capacity.spend
  return Object.values(s).reduce((a,b)=>a+b,0)
})
if (after !== 8) errors.push(`L4: allowed a ninth hour (${after})`)
log('   over-spend refused:', after === 8)
await shot('4-capacity')
await clickText("That's the day"); await new Promise(r=>setTimeout(r,250))
const cutTotal = () => p.evaluate(() => {
  const a = JSON.parse(localStorage.getItem('ascent-v1')).state.answers.capacity.after
  return Object.values(a).reduce((x,y)=>x+y,0)
})
for (let guard = 0; guard < 25 && (await cutTotal()) < 3; guard++) {
  const rs = await p.$$('button')
  let clicked = false
  for (const r of rs) {
    const t = await p.evaluate((e)=>e.textContent.trim(), r)
    if (['Back','Next',''].includes(t)) continue
    const before = await cutTotal()
    await r.click(); await new Promise(x=>setTimeout(x,80))
    if (await cutTotal() > before) { clicked = true; break }
  }
  if (!clicked) break
}
const cut = await cutTotal()
if (cut !== 3) errors.push(`L4: cut ${cut} hours, expected 3`)
log('   hours given back:', cut)
// a fourth cut must be refused
const rs2 = await p.$$('button')
for (const r of rs2) {
  const t = await p.evaluate((e)=>e.textContent.trim(), r)
  if (['Back','Next',''].includes(t)) continue
  await r.click(); break
}
if (await cutTotal() !== 3) errors.push('L4: allowed a fourth hour to be cut')
await shot('4-capacity-cut')
if (await footerEnabled() !== true) errors.push('L4: Next disabled after cutting three')
await nextLevel()

// ---- L5 Trials
log('L5', await levelName())
if (await footerEnabled() !== false) errors.push('L5: Next enabled before answering')
// click by live text each time — the card re-renders and invalidates handles
const clickChipByText = async (txt) => {
  const ok = await p.evaluate((t) => {
    const b = [...document.querySelectorAll('button.chip')].find(x => x.textContent.trim() === t)
    if (!b) return false
    b.click(); return true
  }, txt)
  await new Promise(r=>setTimeout(r,180))
  return ok
}
// answer both trials Yes (two separate cards, so do it twice by index)
for (let i = 0; i < 2; i++) {
  const ok = await p.evaluate((idx) => {
    const yes = [...document.querySelectorAll('button.chip')].filter(x => x.textContent.trim() === 'Yes')
    if (!yes[idx]) return false
    yes[idx].click(); return true
  }, i)
  if (!ok) errors.push(`L5: no Yes button at index ${i}`)
  await new Promise(r=>setTimeout(r,200))
}
for (const t of ['A live role-play','Yes, still mandatory']) {
  if (!await clickChipByText(t)) errors.push(`L5: follow-up "${t}" not found`)
}
const trialState = await p.evaluate(() => JSON.parse(localStorage.getItem('ascent-v1')).state.answers.trials)
log('   trials:', Object.entries(trialState).map(([k,v])=>`${k}=${v.answer}/${v.followUp.length}`).join(' '))
await shot('5-trials')
if (await footerEnabled() !== true) errors.push('L5: Next disabled after both answered')
await nextLevel()

// ---- L6 Route
log('L6', await levelName())
// scroll into view before clicking: on a 390px viewport an off-screen
// element takes the click silently and the placement is lost
const place = async (brickText, year) => {
  const gotChip = await p.evaluate((t) => {
    const b = [...document.querySelectorAll('button.chip')].find(x => x.textContent.trim().startsWith(t))
    if (!b) return false
    b.scrollIntoView({ block: 'center' }); b.click(); return true
  }, brickText)
  if (!gotChip) { errors.push(`L6: no brick chip "${brickText}"`); return }
  await new Promise(r=>setTimeout(r,160))
  const gotCol = await p.evaluate((y) => {
    const c = [...document.querySelectorAll('button[aria-label^="Year"]')][y]
    if (!c) return false
    c.scrollIntoView({ block: 'center' }); c.click(); return true
  }, year)
  if (!gotCol) errors.push(`L6: no year column ${year}`)
  await new Promise(r=>setTimeout(r,160))
}
await place('The morning meeting', 0)
await place("Shadow the Advisor's client meetings", 0)
await place('Own a client deliverable', 1)
await place('Certification: client-ready', 2)
await shot('6-route')
const placedN = await p.evaluate(() => JSON.parse(localStorage.getItem('ascent-v1')).state.answers.route.years.flat().length)
log('   bricks placed:', placedN)
if (placedN < 4) errors.push(`L6: only ${placedN} bricks placed`)
if (await footerEnabled() !== true) errors.push('L6: Next disabled after four bricks')
await nextLevel()

// ---- L7 Mark
log('L7', await levelName())
await p.evaluate(() => {
  const r = document.querySelector('input[type=range]')
  const set = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set
  set.call(r, '6'); r.dispatchEvent(new Event('input', { bubbles: true }))
})
for (const t of ['Teach me to check work', "Be explicit about what"]) await clickText(t)
await shot('7-mark')
if (await footerEnabled() !== true) errors.push('L7: Next disabled after score and two changes')
await clickText('To the top'); await new Promise(r=>setTimeout(r,500))

// ---- L8 Summit
log('L8', await levelName())
await shot('8-summit')
const summit = await p.evaluate(() => document.body.innerText)
for (const k of ['What taught you most', "You'd hand an agent", 'The trap', 'One line to them']) {
  if (!summit.includes(k)) errors.push(`L8: summit missing "${k}"`)
}
const trapLine = summit.split('\n').find((l) => l.includes('trap'))
log('   ', (summit.split('\n').find(l=>l.includes('hand an agent')) || '').trim())

// resume check
await p.reload({ waitUntil: 'networkidle2' })
await new Promise(r=>setTimeout(r,500))
const resumed = await levelName()
if (!/HIGH CAMP/i.test(resumed)) errors.push(`resume: landed on "${resumed}" after reload, expected High camp`)
log('resume after reload ->', resumed)

await b.close()
console.log('\n' + (errors.length ? `FAILURES (${errors.length}):\n - ` + errors.join('\n - ') : 'ALL CHECKS PASSED'))
process.exit(errors.length ? 1 : 0)
