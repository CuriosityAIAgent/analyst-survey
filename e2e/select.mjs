import puppeteer from 'puppeteer-core'
const br = await puppeteer.launch({ executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless:'new' })
for (const skin of ['night','survey']) {
  const p = await br.newPage(); await p.setViewport({width:1000,height:700,deviceScaleFactor:2})
  const url = skin==='survey' ? 'http://localhost:3000/?skin=survey' : 'http://localhost:3000/'
  await p.goto('http://localhost:3000',{waitUntil:'networkidle2'}); await p.evaluate(()=>localStorage.clear())
  await p.goto(url,{waitUntil:'networkidle2'}); await new Promise(r=>setTimeout(r,1600))
  await p.evaluate(()=>{[...document.querySelectorAll('button')].find(b=>b.textContent.includes('Begin the climb'))?.click()})
  await new Promise(r=>setTimeout(r,900))
  await p.evaluate(()=>{[...document.querySelectorAll('button')].find(b=>b.textContent.trim()==='USPB')?.click()})
  await new Promise(r=>setTimeout(r,400))
  const st = await p.evaluate(()=>{
    const b=[...document.querySelectorAll('button')].find(x=>x.textContent.trim()==='USPB')
    const c=getComputedStyle(b); return {text:b.textContent.trim(), bg:c.backgroundColor, color:c.color}
  })
  console.log(skin.padEnd(7), JSON.stringify(st))
  await p.close()
}
await br.close()
