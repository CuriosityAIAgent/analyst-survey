import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' })
const p = await b.newPage()
p.on('response', async (r) => { if (r.status() === 404) console.log('404:', r.url()) })
await p.goto('http://localhost:3000/?demo=1&level=8', { waitUntil: 'networkidle2' })
await new Promise(r=>setTimeout(r,800))
console.log('--- summit ---')
console.log(await p.evaluate(() => document.body.innerText))
await b.close()
