import puppeteer from 'puppeteer-core'
const br = await puppeteer.launch({ executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless:'new' })
const shot = async (url, out, opts={}) => {
  const p = await br.newPage()
  await p.setViewport({width:1280,height:860,deviceScaleFactor:2})
  await p.goto('http://localhost:3000',{waitUntil:'networkidle2'})
  await p.evaluate(()=>localStorage.clear())
  await p.goto(url,{waitUntil:'networkidle2'})
  await new Promise(r=>setTimeout(r,2200))
  if (opts.click) {
    await p.evaluate((t)=>{[...document.querySelectorAll('button')].find(b=>b.textContent.includes(t))?.click()}, opts.click)
    await new Promise(r=>setTimeout(r,1200))
  }
  await p.screenshot({path:out})
  await p.close()
  console.log('shot', out)
}
const B='http://localhost:3000'
await shot(`${B}/`,                           '.context/shots/cmp-night-title.png')
await shot(`${B}/?skin=survey`,               '.context/shots/cmp-survey-title.png')
await shot(`${B}/?demo=1&level=4`,            '.context/shots/cmp-night-l4.png')
await shot(`${B}/?demo=1&level=4&skin=survey`,'.context/shots/cmp-survey-l4.png')
await shot(`${B}/?demo=1&level=8`,            '.context/shots/cmp-night-l8.png')
await shot(`${B}/?demo=1&level=8&skin=survey`,'.context/shots/cmp-survey-l8.png')
await br.close()
