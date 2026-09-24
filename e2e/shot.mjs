import puppeteer from 'puppeteer-core'
const W = Number(process.env.W || 1280), H = Number(process.env.H || 900)
const br = await puppeteer.launch({ executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless:'new' })
const p = await br.newPage()
await p.setViewport({ width:W, height:H, deviceScaleFactor:2, isMobile:W<700, hasTouch:W<700 })
await p.goto('http://localhost:3000',{waitUntil:'networkidle2'})
await p.evaluate(()=>localStorage.clear())
await p.goto('http://localhost:3000',{waitUntil:'networkidle2'})
await new Promise(r=>setTimeout(r,2200))   // let the entrance finish
await p.screenshot({ path: process.env.OUT || '.context/shots/title.png' })
console.log('h1:', await p.evaluate(()=>document.querySelector('h1')?.textContent))
console.log('cta:', await p.evaluate(()=>[...document.querySelectorAll('button')].map(b=>b.textContent.trim())))
await br.close()
