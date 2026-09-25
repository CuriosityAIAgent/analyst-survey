import puppeteer from 'puppeteer-core'
const br = await puppeteer.launch({ executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless:'new' })
const p = await br.newPage(); await p.setViewport({width:1280,height:900,deviceScaleFactor:2})
await p.goto('http://localhost:3000',{waitUntil:'networkidle2'}); await p.evaluate(()=>localStorage.clear())
await p.goto('http://localhost:3000/?demo=1&level=0&skin=survey',{waitUntil:'networkidle2'})
await new Promise(r=>setTimeout(r,1800))
await p.screenshot({path:'.context/shots/survey-basecamp.png'})
await br.close()
