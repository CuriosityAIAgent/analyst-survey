import puppeteer from 'puppeteer-core'
const W = Number(process.env.W || 390)
const b = await puppeteer.launch({ executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless:'new' })
const p = await b.newPage()
await p.setViewport({ width:W, height:844, isMobile:W<700, hasTouch:W<700, deviceScaleFactor:2 })
await p.goto('http://localhost:3000/?demo=1&level=4', { waitUntil:'networkidle2' })
// clear the seeded spend so we land on phase 1, as a real respondent would
await p.evaluate(() => {
  const s = JSON.parse(localStorage.getItem('ascent-v1'))
  s.state.answers.capacity = { spend: {}, after: {} }
  s.state.level = 4
  localStorage.setItem('ascent-v1', JSON.stringify(s))
})
await p.goto('http://localhost:3000/?level=4', { waitUntil:'networkidle2' })
await new Promise(r=>setTimeout(r,700))
const info = await p.evaluate(() => {
  const btns = [...document.querySelectorAll('button[aria-label^="Add an hour"]')]
  return {
    width: window.innerWidth,
    plusCount: btns.length,
    firstRow: btns[0] ? (() => { const r = btns[0].getBoundingClientRect()
      return { right: Math.round(r.right), w: Math.round(r.width), h: Math.round(r.height), inView: r.right <= window.innerWidth && r.left >= 0 } })() : null,
    anyOverflow: [...document.querySelectorAll('.glass div')].some(d => d.scrollWidth > d.clientWidth + 1),
    bodyOverflowX: document.documentElement.scrollWidth > window.innerWidth,
  }
})
console.log(JSON.stringify(info, null, 1))
await p.screenshot({ path: `.context/shots/capacity-${W}.png`, fullPage: false })
await b.close()
