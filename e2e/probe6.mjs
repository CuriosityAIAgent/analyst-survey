import puppeteer from 'puppeteer-core'
const W = Number(process.env.W || 390)
const b = await puppeteer.launch({ executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless:'new' })
const p = await b.newPage()
await p.setViewport({ width:W, height:844, isMobile:W<700, hasTouch:W<700, deviceScaleFactor:2 })
await p.goto('http://localhost:3000/?demo=1&level=6', { waitUntil:'networkidle2' })
await p.evaluate(() => { const s=JSON.parse(localStorage.getItem('ascent-v1')); s.state.answers.route={years:[[],[],[]]}; localStorage.setItem('ascent-v1',JSON.stringify(s)) })
await p.goto('http://localhost:3000/?level=6', { waitUntil:'networkidle2' })
await new Promise(r=>setTimeout(r,800))
const geo = await p.evaluate(() => {
  const cols=[...document.querySelectorAll('button[aria-label^="Year"]')].map(c=>{const r=c.getBoundingClientRect();return{label:c.getAttribute('aria-label'),x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height),inView:r.top>=0&&r.bottom<=window.innerHeight}})
  const chip=[...document.querySelectorAll('button.chip')][0]
  const cr=chip?.getBoundingClientRect()
  return { vw:window.innerWidth, vh:window.innerHeight, cols, firstChip:{text:chip?.textContent.trim().slice(0,28), y:Math.round(cr?.y||0), inView: cr? cr.top>=0&&cr.bottom<=window.innerHeight : null} }
})
console.log(JSON.stringify(geo,null,1))
// try placing via real clicks
const place = async (txt, year) => {
  await p.evaluate((t)=>{const b=[...document.querySelectorAll('button.chip')].find(x=>x.textContent.trim().startsWith(t)); b?.scrollIntoView({block:'center'}); b?.click()}, txt)
  await new Promise(r=>setTimeout(r,180))
  await p.evaluate((y)=>{const c=[...document.querySelectorAll('button[aria-label^="Year"]')][y]; c?.scrollIntoView({block:'center'}); c?.click()}, year)
  await new Promise(r=>setTimeout(r,180))
  return p.evaluate(()=>JSON.parse(localStorage.getItem('ascent-v1')).state.answers.route.years.flat().length)
}
for (const [t,y] of [['The morning meeting',0],["Shadow the Advisor's",0],['Own a client deliverable',1],['Certification: client-ready',2]]) {
  console.log(t, '->', await place(t,y))
}
await p.screenshot({ path:`.context/shots/route-${W}.png` })
await b.close()
