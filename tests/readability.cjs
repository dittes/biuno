const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const origin=process.env.PREVIEW_URL||'http://localhost:4173';
(async()=>{
 const b=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
 const c=await b.newContext({viewport:{width:375,height:812},serviceWorkers:'block'});const p=await c.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.clock.install();const state=()=>p.evaluate(()=>JSON.parse(localStorage.getItem('biuno:v1')).sessions['mental-math']);
 for(const lang of ['en','de','cs','pl']){
  await p.goto(`${origin}/${lang}/what-changed/`);
  assert.equal(await p.locator('.game-help').getAttribute('open'),null);await p.locator('.game-help summary').click();assert.equal(await p.locator('.game-help li').count(),3);
  assert.ok(await p.locator('.game-help').evaluate(e=>e.open));await p.locator('.game-help summary').click();
  assert.equal(/[↗→←↓↑]/.test(await p.locator('body').innerText()),false);
  await p.locator('[data-action=start]').click();assert.equal(await p.locator('[data-action=ready]').count(),1);assert.equal(await p.locator('[data-action=pause]').count(),0);
  const fonts=await p.locator('.game-message,.readout,.button,.game-heading>p').evaluateAll(es=>es.map(e=>parseFloat(getComputedStyle(e).fontSize)));assert.ok(fonts.every(n=>n>=18),JSON.stringify(fonts));
  const solid=await p.locator('.question-board svg').evaluateAll(es=>es.every(e=>e.getAttribute('fill')==='currentColor'));assert.equal(solid,true);
 }
 await p.goto(origin+'/en/mental-math/');await p.locator('[data-action=start]').click();
 let s=await state();await p.locator(`[data-action=pick][data-value="${s.questions[0].answer}"]`).click();assert.equal(await p.locator('[data-action=next]').count(),0);await p.clock.runFor(1200);assert.equal((await state()).round,0);await p.locator('[data-action=pause]').click();await p.clock.runFor(5000);assert.equal((await state()).round,0);await p.locator('[data-action=resume]').click();await p.clock.runFor(1700);assert.equal((await state()).round,1);assert.equal((await state()).correct,1);
 s=await state();const wrong=s.questions[1].choices.find(x=>x!==s.questions[1].answer);await p.locator(`[data-action=pick][data-value="${wrong}"]`).click();await p.clock.runFor(8000);assert.equal((await state()).round,1);assert.equal((await state()).feedback.right,false);assert.equal(await p.locator('[data-action=next]').count(),1);await p.locator('[data-action=next]').click();assert.equal((await state()).round,2);
 await p.locator('.game-help summary').click();await p.waitForFunction(()=>JSON.parse(localStorage.getItem('biuno:v1')).sessions['mental-math'].paused===true);assert.equal((await state()).paused,true);assert.equal(await p.locator('.game-help summary').evaluate(e=>e===document.activeElement),true);await p.locator('.game-help summary').click();await p.locator('[data-action=resume]').click();
 s=await state();await p.locator(`[data-action=pick][data-value="${s.questions[2].answer}"]`).click();await p.locator('[data-action=pause]').click();await p.reload();await p.locator('[data-action=restore]').click();await p.clock.runFor(1700);assert.equal((await state()).round,3);assert.equal((await state()).correct,2);await p.clock.runFor(5000);assert.equal((await state()).round,3);
 // Measure actual rendered colours, not approximate OKLCH lightness.
 const contrast=await p.evaluate(()=>{const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d',{willReadFrequently:true});const rgb=v=>{ctx.clearRect(0,0,1,1);ctx.fillStyle=v;ctx.fillRect(0,0,1,1);return [...ctx.getImageData(0,0,1,1).data];};const lum=c=>{const a=c.slice(0,3).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;});return .2126*a[0]+.7152*a[1]+.0722*a[2];};const root=getComputedStyle(document.documentElement);return ['--color-ink','--color-muted','--color-accent'].flatMap(fg=>['--color-paper','--color-surface'].map(bg=>{const a=lum(rgb(root.getPropertyValue(fg))),b=lum(rgb(root.getPropertyValue(bg)));return{fg,bg,ratio:(Math.max(a,b)+.05)/(Math.min(a,b)+.05)};}));});assert.ok(contrast.every(x=>x.ratio>=7),JSON.stringify(contrast));
 await p.goto(origin+'/en/what-changed/');await p.locator('[data-action=start]').click();await p.screenshot({path:'artifacts/readability-mobile-final.png',fullPage:true});await p.setViewportSize({width:1280,height:900});await p.screenshot({path:'artifacts/readability-desktop-final.png',fullPage:true});
 await fs.writeFile('artifacts/readability-results.json',JSON.stringify({languages:4,automaticCorrectAnswers:true,wrongAnswersStayVisible:true,helpPauses:true,feedbackResume:true,contrast,errors},null,2));await b.close();assert.deepEqual(errors,[]);console.log('Readability acceptance passed: large text, solid icons, optional help, automatic correct answers, pause/restore and 7:1 text contrast.');
})().catch(e=>{console.error(e);process.exit(1);});
