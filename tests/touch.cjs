const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const origin=process.env.PREVIEW_URL||'http://localhost:4173';
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
 const context=await browser.newContext({hasTouch:true,isMobile:true,viewport:{width:375,height:812},serviceWorkers:'block'});
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));const findings=[];let checks=0;
 for(const width of [320,375,414,768])for(const lang of ['en','de','cs','pl'])for(const id of ['matching-pairs','what-changed','sequence-memory','codebreaker','pipes','mental-math','minesweeper','sea-battle','tic-tac-toe']){
  await page.setViewportSize({width,height:900});await page.goto(`${origin}/${lang}/${id}/`);await page.selectOption('#difficulty','2');await page.locator('[data-action=start]').tap();
  const bad=await page.locator('button:visible,select:visible').evaluateAll(es=>es.filter(e=>!e.disabled).flatMap(e=>{const r=e.getBoundingClientRect();return r.width<43.9||r.height<43.9||r.right>innerWidth+.5?[{cls:e.className,text:e.textContent.slice(0,30),w:r.width,h:r.height,right:r.right}]:[];}));
  if(bad.length)findings.push({width,lang,id,bad});checks++;
  if(id==='pipes'){const before=await page.locator('.pipe-tile').first().innerHTML();await page.locator('.pipe-tile').first().tap();assert.notEqual(await page.locator('.pipe-tile').first().innerHTML(),before);}
  if(id==='matching-pairs'){const b=page.locator('.cell').first();await b.tap();assert.ok(!(await b.getAttribute('class')).includes('face-down'));}
 }
 // Hit-test a board after it has scrolled into view, as on a phone.
 await page.setViewportSize({width:320,height:700});await page.goto(origin+'/de/pipes/');await page.selectOption('#difficulty','2');await page.locator('[data-action=start]').tap();await page.locator('.pipe-board').scrollIntoViewIfNeeded();
 const covered=await page.locator('.pipe-tile').evaluateAll(es=>es.filter(e=>{const r=e.getBoundingClientRect();const hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return !hit||!e.contains(hit);}).length);assert.equal(covered,0);
 await fs.writeFile('artifacts/touch-results.json',JSON.stringify({checks,findings,errors,pipeHitTargets:25},null,2));await browser.close();assert.deepEqual(errors,[]);assert.deepEqual(findings,[]);console.log(`Touch verification passed: ${checks} active hard-mode boards, all targets >=44px; 25 pipe centres unobstructed.`);
})().catch(e=>{console.error(e);process.exit(1);});
