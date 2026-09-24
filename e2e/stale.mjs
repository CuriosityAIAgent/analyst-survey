import puppeteer from 'puppeteer-core'
const br = await puppeteer.launch({ executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless:'new' })
const p = await br.newPage(); await p.setViewport({width:1280,height:900})
await p.goto('http://localhost:3000',{waitUntil:'networkidle2'})
// simulate the stale flag the user has
await p.evaluate(()=>localStorage.setItem('ascent-v1', JSON.stringify({state:{started:true,level:0,answers:{}},version:1})))
await p.goto('http://localhost:3000',{waitUntil:'networkidle2'}); await new Promise(r=>setTimeout(r,1500))
console.log('stale started:true, no answers ->', await p.evaluate(()=>document.querySelector('h1')?.textContent))
// and a real climb in progress must still resume
await p.evaluate(()=>localStorage.setItem('ascent-v1', JSON.stringify({state:{started:true,level:2,answers:{segment:{business:'USPB'}}},version:1})))
await p.goto('http://localhost:3000',{waitUntil:'networkidle2'}); await new Promise(r=>setTimeout(r,1500))
console.log('real progress at level 2  ->', await p.evaluate(()=>document.querySelector('h1')?.textContent))
await br.close()
