import puppeteer from 'puppeteer-core'
const br = await puppeteer.launch({ executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless:'new' })
const p = await br.newPage(); await p.setViewport({width:430,height:900,deviceScaleFactor:2,isMobile:true,hasTouch:true})
const go = async (id) => {
  await p.goto('http://localhost:3000',{waitUntil:'networkidle2'})
  await p.evaluate((id)=>{ const path={hello:['hello'],prep:['hello','prep'],cert:['hello','prep','fuel','keep','pack','cert']}[id]
    localStorage.setItem('ascent-flow-v1', JSON.stringify({state:{started:true,path,answers:{}},version:1})) }, id)
  await p.goto('http://localhost:3000',{waitUntil:'networkidle2'}); await new Promise(r=>setTimeout(r,900))
}
await go('prep')
await p.evaluate(()=>{const r=document.querySelector('input[type=range]');const s=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;s.call(r,'7');r.dispatchEvent(new Event('input',{bubbles:true}))})
await new Promise(r=>setTimeout(r,400))
await p.screenshot({path:'.context/shots/route-slider.png'})
console.log('route slider shot')
await br.close()
