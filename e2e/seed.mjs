/* A session saved before seeds existed must get a seed that survives reloads
   with no tap in between, or its shuffled cards reorder on every refresh. */
import puppeteer from 'puppeteer-core'
const br = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' })
const p = await br.newPage(); await p.setViewport({ width: 390, height: 844 })
const errs = []; p.on('pageerror', (e) => errs.push(String(e).slice(0, 160)))
const SITE = process.argv[2] ?? 'http://localhost:3000'
const saved = () => p.evaluate(() => JSON.parse(localStorage.getItem('ascent-flow-v1') ?? '{}').state?.seed)
await p.goto(SITE, { waitUntil: 'networkidle2' })
await p.evaluate(() => localStorage.setItem('ascent-flow-v1', JSON.stringify({ state: { started: true, path: ['p1_prep'], answers: {}, timing: [] }, version: 1 })))
await p.reload({ waitUntil: 'networkidle2' }); await new Promise((r) => setTimeout(r, 500))
const a = await saved()
await p.reload({ waitUntil: 'networkidle2' }); await new Promise((r) => setTimeout(r, 500))
const b = await saved()
console.log('seed after first load:', a, '| after second load:', b, '|', Number.isInteger(a) && a === b ? 'STABLE' : 'NOT STABLE')
console.log('page errors:', errs.length ? errs : 'none')
await br.close()
process.exit(Number.isInteger(a) && a === b && !errs.length ? 0 : 1)
