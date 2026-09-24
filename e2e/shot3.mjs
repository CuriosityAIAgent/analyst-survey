import puppeteer from 'puppeteer-core'
const br = await puppeteer.launch({ executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless:'new' })
const p = await br.newPage(); await p.setViewport({width:1280,height:900,deviceScaleFactor:2})
await p.goto('http://localhost:3000/?demo=1&level=3',{waitUntil:'networkidle2'}); await new Promise(r=>setTimeout(r,1400))
await p.evaluate(()=>{[...document.querySelectorAll('button')].find(b=>b.textContent.includes('Deal the thirteen'))?.click()})
await new Promise(r=>setTimeout(r,800))
await p.screenshot({path:'.context/shots/jpm-handover.png'})
await br.close()
