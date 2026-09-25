import puppeteer from 'puppeteer-core'
const br = await puppeteer.launch({ executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless:'new' })
const p = await br.newPage(); await p.setViewport({width:1280,height:860,deviceScaleFactor:2})
for (const [lvl,name] of [[0,'a-start'],[4,'b-mid'],[8,'c-summit']]) {
  await p.goto('http://localhost:3000',{waitUntil:'networkidle2'})
  await p.evaluate(()=>localStorage.clear())
  await p.goto(`http://localhost:3000/?demo=1&level=${lvl}&skin=survey`,{waitUntil:'networkidle2'})
  await new Promise(r=>setTimeout(r,1800))
  // crop to the scene band so the character is visible
  await p.screenshot({path:`.context/shots/sv-${name}.png`, clip:{x:0,y:640,width:1280,height:220}})
  console.log('shot', name)
}
await br.close()
