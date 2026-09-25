import puppeteer from 'puppeteer-core'
const br = await puppeteer.launch({ executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless:'new' })
const p = await br.newPage(); await p.setViewport({width:1200,height:1000,deviceScaleFactor:2})
await p.goto('http://localhost:3000/art',{waitUntil:'networkidle2'}); await new Promise(r=>setTimeout(r,1200))
await p.screenshot({path:'.context/shots/activity-art.png', fullPage:true})
await br.close(); console.log('ok')
