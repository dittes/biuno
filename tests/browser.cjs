const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const origin=process.env.PREVIEW_URL||'http://localhost:4173';
const ids=['matching-pairs','what-changed','sequence-memory','codebreaker','pipes','mental-math'];
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
 const context=await browser.newContext({viewport:{width:1280,height:900}});
 const page=await context.newPage();const errors=[],requests=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(!r.url().startsWith(origin)&&!r.url().startsWith('blob:'))requests.push(r.url());});
 const state=()=>page.evaluate(id=>JSON.parse(localStorage.getItem('biuno:v1')).sessions[id],awaitId);
 let awaitId;
 await fs.mkdir('artifacts',{recursive:true});
 await page.goto(origin+'/en/');await page.screenshot({path:'artifacts/home-desktop.png',fullPage:true});
 let layouts=0;const findings=[];
 for(const width of [320,375,414,768,1280]){
  await page.setViewportSize({width,height:900});
  for(const lang of ['en','de','cs','pl'])for(const route of ['',...ids,'imprint','privacy','progress']){
   await page.goto(`${origin}/${lang}/${route?route+'/':''}`);
   await page.locator('footer').waitFor();
   const result=await page.evaluate(()=>{
    const root=document.documentElement;
    const over=[...document.querySelectorAll('main *,header *,footer *')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&(r.right>innerWidth+1||r.left< -1);}).slice(0,6).map(e=>({tag:e.tagName,cls:e.className,text:e.textContent.slice(0,40)}));
    const wrapped=[...document.querySelectorAll('button,.main-nav a,.footer nav a,.button,.text-link')].filter(e=>{if(!e.getBoundingClientRect().width)return false;const walker=document.createTreeWalker(e,NodeFilter.SHOW_TEXT);const rects=[];while(walker.nextNode()){if(!walker.currentNode.textContent.trim())continue;const range=document.createRange();range.selectNodeContents(walker.currentNode);rects.push(...[...range.getClientRects()].filter(r=>r.width>0&&r.height>0));}return rects.length>0&&rects.some(r=>r.top>=rects[0].bottom-1||r.bottom<=rects[0].top+1)&&!e.querySelector('svg');}).map(e=>e.textContent.trim());
    return {overflow:root.scrollWidth>innerWidth,over,wrapped};
   });
   if(result.overflow||result.over.length||result.wrapped.length)findings.push({width,lang,route,...result});
   layouts++;
  }
 }
 await page.setViewportSize({width:375,height:812});await page.goto(origin+'/de/');await page.screenshot({path:'artifacts/home-mobile.png',fullPage:true});
 await page.getByRole('button',{name:'Logik',exact:true}).click();assert.equal(await page.locator('.game-card:visible').count(),2);
 await page.selectOption('#language','/pl/');await page.waitForURL('**/pl/');assert.equal(await page.locator('html').getAttribute('lang'),'pl');
 console.log('Layout audit:',layouts,'pages/viewports;',findings.length,'findings');
 await fs.writeFile('artifacts/layout-findings.json',JSON.stringify(findings,null,2));
 // Play each entire game through its real controls, using persisted state as the oracle.
 await page.setViewportSize({width:375,height:900});
 for(const id of ids){
  awaitId=id;await page.goto(`${origin}/en/${id}/`);await page.selectOption('#difficulty','0');await page.locator('[data-action=start]').click();
  if(id==='matching-pairs'){
   const s=await state(),pairs=new Map();s.cards.forEach((v,k)=>pairs.set(v,[...(pairs.get(v)||[]),k]));
   for(const [a,b]of pairs.values()){await page.locator(`[data-action=pick][data-value="${a}"]`).click();await page.locator(`[data-action=pick][data-value="${b}"]`).click();}
  }
  if(id==='what-changed')for(let k=0;k<5;k++){const s=await state(),trial=s.trials[k];await page.locator('[data-action=ready]').click();await page.locator(`[data-action=pick][data-value="${trial.after.indexOf(trial.answer)}"]`).click();await page.locator('[data-action=next]').click();}
  if(id==='sequence-memory'){
   await page.clock.install();
   for(let k=0;k<5;k++){
    const s=await state();if(k===0){await page.waitForTimeout(4500);}else await page.clock.runFor(9000);
    await page.waitForFunction(()=>document.querySelector('[data-action=pick]')?.disabled===false);
    for(const v of s.sequences[k])await page.locator(`[data-action=pick][data-value="${v}"]`).click();
    await page.locator('[data-action=next]').click();
   }
   await page.clock.resume();
  }
  if(id==='codebreaker'){const s=await state();for(const v of s.secret)await page.locator(`[data-action=symbol][data-value="${v}"]`).click();await page.locator('[data-action=check]').click();}
  if(id==='pipes'){
   const s=await state();for(let k=0;k<s.tiles.length;k++){let mask=s.tiles[k];while(mask!==s.solution[k]){await page.locator(`[data-action=pick][data-value="${k}"]`).click();mask=((mask<<1)&15)|(mask>>3);}}
  }
  if(id==='mental-math')for(let k=0;k<10;k++){const s=await state();await page.locator(`[data-action=pick][data-value="${s.questions[k].answer}"]`).click();await page.locator('[data-action=next]').click();}
  await page.locator('.result').waitFor();console.log('Completed via UI:',id);
 }
 const records=await page.evaluate(()=>JSON.parse(localStorage.getItem('biuno:v1')).records);assert.equal(Object.keys(records).length,6);assert.ok(Object.values(records).every(r=>r.played===1&&r.wins===1));
 // Exhausting attempts reveals the code and preserves the previous best.
 awaitId='codebreaker';await page.goto(origin+'/en/codebreaker/');await page.locator('[data-action=start]').click();
 const secret=(await state()).secret,wrongFirst=(secret[0]+1)%6;
 for(let attempt=0;attempt<8;attempt++){for(let k=0;k<secret.length;k++)await page.locator(`[data-action=symbol][data-value="${k===0?wrongFirst:0}"]`).click();await page.locator('[data-action=check]').click();}
 await page.locator('.result').waitFor();assert.equal(await page.locator('.result-score').textContent(),'0');assert.equal((await page.evaluate(()=>JSON.parse(localStorage.getItem('biuno:v1')).records['codebreaker:0'])).best,1000);
 // Mismatch / pause / reload / restore regression.
 awaitId='matching-pairs';await page.goto(origin+'/en/matching-pairs/');await page.locator('[data-action=start]').click();
 const m=await state(),different=m.cards.findIndex(v=>v!==m.cards[0]);
 await page.locator('[data-action=pick][data-value="0"]').click();await page.locator(`[data-action=pick][data-value="${different}"]`).click();await page.locator('[data-action=pause]').click();await page.locator('[data-action=resume]').click();assert.equal(await page.locator('.cell.face-down').count(),12);
 await page.reload();await page.locator('[data-action=restore]').click();assert.equal((await state()).moves,1);
 // Save travels across locale URLs, and language switch preserves the game route.
 await page.selectOption('#language','/de/matching-pairs/');await page.waitForURL('**/de/matching-pairs/');await page.locator('[data-action=restore]').click();assert.equal((await state()).moves,1);
 // Worst case: hard code slots and palette remain usable at 320px.
 await page.goto(origin+'/cs/codebreaker/');await page.selectOption('#difficulty','2');await page.locator('[data-action=start]').click();await page.setViewportSize({width:320,height:812});
 const targets=await page.locator('.code-peg[data-action],.code-palette button').evaluateAll(es=>es.map(e=>({w:e.getBoundingClientRect().width,h:e.getBoundingClientRect().height})));assert.ok(targets.every(x=>x.w>=43.9&&x.h>=43.9),JSON.stringify(targets));
 await page.screenshot({path:'artifacts/code-mobile.png',fullPage:true});
 await page.goto(origin+'/pl/pipes/');await page.locator('[data-action=start]').click();await page.screenshot({path:'artifacts/pipes-mobile.png',fullPage:true});
 // Export and undo reset protect local records.
 await page.goto(origin+'/en/progress/');const downloadPromise=page.waitForEvent('download');await page.locator('#export').click();const download=await downloadPromise;await download.saveAs('artifacts/progress.json');
 await page.locator('#clear-data').click();assert.equal(await page.locator('.empty-progress').count(),1);await page.locator('#notice button').click();assert.equal(await page.locator('.progress-table tbody tr').count(),6);
 await page.locator('#import').setInputFiles('artifacts/progress.json');await page.waitForFunction(()=>document.querySelector('#notice').textContent.includes('imported'));assert.equal(await page.locator('.progress-table tbody tr').count(),6);
 await fs.writeFile('artifacts/invalid-progress.json','{"version":1,"records":{"not-a-game":{"best":"<script>"}}}');await page.locator('#import').setInputFiles('artifacts/invalid-progress.json');await page.waitForFunction(()=>document.querySelector('#notice').textContent.includes('not a valid'));assert.equal(await page.locator('.progress-table tbody tr').count(),6);
 // Offline navigation works after service-worker installation.
 await page.goto(origin+'/en/');await page.evaluate(()=>navigator.serviceWorker.ready);await page.reload();await context.setOffline(true);await page.goto(origin+'/de/pipes/');assert.equal(await page.locator('h1').textContent(),'Rohre verbinden');await context.setOffline(false);
 // Storage denial must never prevent a game from starting.
 const blocked=await browser.newContext();await blocked.addInitScript(()=>{Storage.prototype.setItem=function(){throw new DOMException('Blocked','SecurityError');};Storage.prototype.getItem=function(){throw new DOMException('Blocked','SecurityError');};});const bp=await blocked.newPage();await bp.goto(origin+'/en/mental-math/');await bp.locator('[data-action=start]').click();assert.equal(await bp.locator('.math-answers button').count(),4);assert.equal(await bp.locator('.save-warning').count(),1);await blocked.close();
 assert.deepEqual(errors,[]);assert.deepEqual(requests,[]);
 await fs.writeFile('artifacts/browser-results.json',JSON.stringify({layouts,findings,errors,externalRequests:requests,completedGames:ids,storageBlocked:true,offlineNavigation:true},null,2));
 await browser.close();assert.equal(findings.length,0,JSON.stringify(findings.slice(0,5)));console.log('Browser verification passed.');
})().catch(e=>{console.error(e);process.exit(1);});
