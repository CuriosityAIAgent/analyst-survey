import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless:'new' })
const p = await b.newPage()
await p.setViewport({ width:390, height:844, isMobile:true, hasTouch:true, deviceScaleFactor:2 })
await p.goto('http://localhost:3000/?demo=1&level=4', { waitUntil:'networkidle2' })
await new Promise(r=>setTimeout(r,700))
const info = await p.evaluate(() => {
  const btns = [...document.querySelectorAll('button[aria-label^="Add an hour"]')]
  const card = document.querySelector('.glass').getBoundingClientRect()
  return {
    count: btns.length,
    cardRight: Math.round(card.right),
    viewport: window.innerWidth,
    rows: btns.slice(0,3).map(b => {
      const r = b.getBoundingClientRect()
      return { right: Math.round(r.right), width: Math.round(r.width), visible: r.width>0 && r.right<=window.innerWidth }
    }),
    rowOverflow: [...document.querySelectorAll('.glass .space-y-2 > div')].slice(0,1).map(d => ({
      scrollW: d.scrollWidth, clientW: d.clientWidth, overflowing: d.scrollWidth > d.clientWidth
    })),
  }
})
console.log(JSON.stringify(info, null, 1))
await p.screenshot({ path:'.context/shots/phone-capacity-bug.png' })
await b.close()
