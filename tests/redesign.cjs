const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const origin=process.env.PREVIEW_URL||'http://localhost:4173';
const languages=['en','de','cs','pl'];
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
 const context=await browser.newContext({viewport:{width:1280,height:900},serviceWorkers:'block'});
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{Object.defineProperty(navigator,'share',{configurable:true,value:async(data)=>{window.sharedGame=data;}});});
 for(const lang of languages){
  await page.goto(`${origin}/${lang}/matching-pairs/`);
  await page.selectOption('#difficulty','0');
  assert.equal(await page.locator('.ready-board .cell').count(),12);
  assert.equal(await page.locator('.masthead,.main-nav,.game-aside,.opening').count(),0);
  const brand=await page.locator('.wordmark').boundingBox(),nav=await page.locator('#game-nav').boundingBox();assert.ok(brand.x<nav.x);
  await page.locator('[data-action=start]').click();
  const game=await page.evaluate(()=>JSON.parse(localStorage.getItem('biuno:v1')).sessions['matching-pairs']);const pairs=new Map();
  game.cards.forEach((v,k)=>pairs.set(v,[...(pairs.get(v)||[]),k]));
  for(const [a,b]of pairs.values()){await page.locator(`[data-action=pick][data-value="${a}"]`).click();await page.locator(`[data-action=pick][data-value="${b}"]`).click();}
  await page.locator('.result-actions').waitFor();
  for(const action of ['share','random','start'])assert.equal(await page.locator(`.result-actions [data-action=${action}]`).count(),1);
  const again=await page.locator('.play-again').boundingBox(),random=await page.locator('[data-action=random]').boundingBox();assert.ok(again.x>random.x);
  await page.locator('[data-action=share]').click();assert.deepEqual(await page.evaluate(()=>window.sharedGame),{title:lang==='en'?'Matching Pairs · Biuno':lang==='de'?'Paare finden · Biuno':lang==='cs'?'Pexeso · Biuno':'Dobieranie par · Biuno',url:`${origin}/${lang}/matching-pairs/`});
  await page.setViewportSize({width:375,height:812});
  const mobileAgain=await page.locator('.play-again').boundingBox(),panel=await page.locator('#game-area').boundingBox();assert.ok(mobileAgain.x+mobileAgain.width>panel.x+panel.width-35);
  if(lang==='en')await page.screenshot({path:'artifacts/redesign-mobile-result.png',fullPage:true});
  await page.setViewportSize({width:1280,height:900});
  if(lang==='en'){
   await page.screenshot({path:'artifacts/redesign-desktop-result.png',fullPage:true});
   // Clipboard fallback without invoking the host clipboard.
   await page.evaluate(()=>{Object.defineProperty(navigator,'share',{configurable:true,value:undefined});Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async value=>{window.copiedGame=value;}}});});
   await page.locator('[data-action=share]').click();assert.equal(await page.evaluate(()=>window.copiedGame),`${origin}/en/matching-pairs/`);
   await page.evaluate(()=>Object.defineProperty(navigator,'share',{configurable:true,value:async()=>{throw new DOMException('Denied','NotAllowedError');}}));await page.locator('[data-action=share]').click();assert.equal(await page.evaluate(()=>window.copiedGame),`${origin}/en/matching-pairs/`);await page.evaluate(()=>Object.defineProperty(navigator,'share',{configurable:true,value:undefined}));
   // Last fallback is a selectable URL in a native dialog, with Escape dismissal.
   await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw new DOMException('Denied','NotAllowedError');}}}));
   await page.locator('[data-action=share]').click();await page.locator('.share-dialog').waitFor();assert.equal(await page.locator('.share-dialog input').inputValue(),`${origin}/en/matching-pairs/`);await page.keyboard.press('Escape');await page.locator('.share-dialog').waitFor({state:'detached'});
   await page.evaluate(()=>Object.defineProperty(navigator,'share',{configurable:true,value:async()=>{throw new DOMException('Cancelled','AbortError');}}));await page.locator('[data-action=share]').click();assert.equal(await page.locator('.share-dialog').count(),0);
  }
  await page.locator('[data-action=start]').click();const fresh=await page.evaluate(()=>JSON.parse(localStorage.getItem('biuno:v1')).sessions['matching-pairs']);assert.notEqual(fresh.seed,game.seed);assert.equal(await page.locator('#best-score').textContent(),await page.evaluate(l=>(1000).toLocaleString(l),lang));
  await page.selectOption('#game-nav',`/${lang}/mental-math/`);await page.waitForURL(`**/${lang}/mental-math/`);await page.selectOption('#difficulty','0');await page.locator('[data-action=start]').click();
  for(let k=0;k<10;k++){const s=await page.evaluate(()=>JSON.parse(localStorage.getItem('biuno:v1')).sessions['mental-math']);await page.locator(`[data-action=pick][data-value="${s.questions[k].answer}"]`).click();await page.waitForFunction(()=>!document.querySelector('.feedback-box'));}
  await page.locator('[data-action=random]').click();await page.waitForURL(u=>u.pathname.startsWith(`/${lang}/`)&&!u.pathname.endsWith('/mental-math/'));assert.ok(!page.url().includes('/mental-math/'));
 }
 assert.deepEqual(errors,[]);await browser.close();
 await fs.writeFile('artifacts/redesign-results.json',JSON.stringify({languages,nativeShare:true,clipboardFallback:true,dialogFallback:true,shareCancellation:true,replay:true,randomOtherGame:true,gameSelector:true,recordsPreserved:true,errors},null,2));
 console.log('Redesign acceptance passed in four languages: replay, share/fallbacks, random game, navigation and score preservation.');
})().catch(e=>{console.error(e);process.exit(1);});
