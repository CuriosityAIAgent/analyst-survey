import puppeteer from 'puppeteer-core'
const br = await puppeteer.launch({ executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless:'new' })
const p = await br.newPage(); await p.setViewport({width:390,height:844,deviceScaleFactor:2,isMobile:true,hasTouch:true})
const errs=[]; p.on('pageerror',e=>errs.push(String(e).slice(0,140)))
await p.goto('http://localhost:3000',{waitUntil:'networkidle2'}); await p.evaluate(()=>localStorage.clear())
await p.goto('http://localhost:3000',{waitUntil:'networkidle2'}); await new Promise(r=>setTimeout(r,900))
const h1 = () => p.evaluate(()=>document.querySelector('h1')?.textContent?.trim())
const click = async (t) => { const ok = await p.evaluate((t)=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent.trim().includes(t)); if(!b) return false; b.scrollIntoView({block:'center'}); b.click(); return true}, t); if(!ok) throw new Error('no button '+t); await new Promise(r=>setTimeout(r,420)) }
const seen = []
const log = async () => { const x = await h1(); seen.push(x); console.log('  ', x) }
await log(); await click('Begin the climb')
await log(); await click('Continue')                       // hello (show)
await log()                                                // slider: set LOW to fire the branch
// tap-to-place: a LOW stop should fire the branch
await p.evaluate(()=>[...document.querySelectorAll('[role=radio]')].find(b=>b.textContent.includes('Treading water'))?.click())
await new Promise(r=>setTimeout(r,200)); await click('Next')
await log()                                                // should be the BRANCH card "gap"
await click('Prospecting'); await click('Next')
await log(); await click('Next')                           // rank: accept order
await log()                                                // swipe: pitchbook RIGHT fires "how"
await click('It made me'); await click('Happy to lose'); await click('Happy to lose')
await new Promise(r=>setTimeout(r,500)); await log()
await click('Critique'); await log()
// tokens: spend all
for (const t of ['More','More']) { await click(t); await click('Understand the client') }
await click('Less'); await click('Create opportunities'); await click('The one'); await click('Develop advice')
await click('Next'); await log()
await click('It depends'); await log()
await click('Skip'); await log()
console.log('\nbranch fired on low slider:', seen.includes('What were you least ready for?'))
console.log('branch fired on swipe right:', seen.includes('So how does the next analyst learn it?'))
console.log('reached the summit:', seen[seen.length-1] === "That's the route.")
console.log('page errors:', errs.length ? errs : 'none')
await br.close()
