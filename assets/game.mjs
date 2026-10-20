import {i18n,ids} from './i18n.mjs';
import {newGame,shuffle,rng,codeFeedback,rotate,pipeSolved,connectedTiles,finishScore,dailyKey} from './engine.mjs';
import {load,save,record,canSave} from './storage.mjs';
import {classicIds,revealMine,flagMine,ticMove,ticComputer,navalShot,navalComputer,sunkShips} from './classic-engine.mjs';
import {classicBoard,classicStats} from './classic-ui.mjs';
import {icon,pipe,sequencePad} from './art.mjs';
import {encouragement,finalBoard,confetti} from './round-ui.mjs';
import {notify} from './app.mjs';
import {sfx,buzz,burst,countUp,sound,setSound} from './fx.mjs';
const lang=document.documentElement.lang,t=i18n[lang]||i18n.en,id=document.body.dataset.game,index=ids.indexOf(id);
const area=document.querySelector('#game-area'),radios=[...document.querySelectorAll('[name=difficulty]')],seg=document.querySelector('#seg'),thumb=document.querySelector('#thumb'),best=document.querySelector('#best-score'),bar=document.querySelector('#bar'),soundBtn=document.querySelector('#sound');
const rawDay=new URLSearchParams(location.search).get('daily'),daily=rawDay===dailyKey(),day=dailyKey();
let g=null,level=daily?1:load().settings.level,epoch=0,timers=[],playingSequence=false,botScheduled=false,lastPick=-1,finishing=false,suppressUntil=0,hold=null;
const calm=matchMedia('(prefers-reduced-motion:reduce)').matches;
const HERO=['🃏','🔍','🎵','🔐','🚰','🧮','💣','⚓','⭕'];
const sym=[1,8,12,11,0,3];
const button=(label,action,kind='button',extra='')=>`<button type="button" class="${kind}" data-action="${action}" ${extra}>${label}</button>`;
const cell=(v,k,extra='',disabled=false)=>`<button type="button" style="--i:${k}" class="cell ${extra}" data-action="pick" data-value="${k}" data-focus="pick-${k}" aria-label="${t.symbols[v]}" ${disabled?'disabled':''}>${icon(v)}</button>`;
function stopTimers(){epoch++;timers.forEach(clearTimeout);timers=[];playingSequence=false;botScheduled=false;finishing=false;}
function later(fn,ms){const token=epoch;timers.push(setTimeout(()=>{if(epoch===token)fn();},ms));}
function persist(){if(!g||g.status!=='playing')return;const d=load();d.sessions[id]=structuredClone(g);save(d);}
function updateBest(){const r=load().records[`${id}:${level}`],v=r?`${r.best.toLocaleString(lang)}`:'—';if(best.textContent!==v){const pill=document.querySelector('#best-pill');best.textContent=v;if(pill&&best.dataset.ready){pill.classList.remove('bump');void pill.offsetWidth;pill.classList.add('bump');}}best.dataset.ready='1';}
function setLevelUI(){radios.forEach(r=>{r.checked=Number(r.value)===level;});thumb.style.transform=`translateX(${level*100}%)`;}
function syncSound(){soundBtn.setAttribute('aria-pressed',String(sound.on));const label=sound.on?t.soundOn:t.soundOff;soundBtn.setAttribute('aria-label',label);soundBtn.title=label;}
syncSound();setLevelUI();document.querySelector('#mode-label').textContent=daily?t.dailyMode:t.freeMode;
document.querySelector('#toolbar-daily').hidden=!daily;
function safeSession(s){
 if(!s||s.id!==id||s.status!=='playing'||!Number.isInteger(s.level)||s.level<0||s.level>2||typeof s.seed!=='string'||!Number.isInteger(s.round)||s.round<0||s.round>10||!Number.isFinite(s.correct)||s.correct<0||s.correct>10)return false;
 if(Boolean(s.daily)!==daily||(daily&&s.day!==day))return false;
 const bounded=(a,max=15)=>Array.isArray(a)&&a.every(v=>Number.isInteger(v)&&v>=0&&v<=max);
 if(id==='minesweeper')return s.n===6&&s.mineCount===[5,7,9][s.level]&&bounded(s.mines,35)&&bounded(s.opened,35)&&bounded(s.flags,35)&&Array.isArray(s.justOpened)&&['reveal','flag'].includes(s.tool)&&!s.outcome;
 if(id==='tic-tac-toe')return Array.isArray(s.board)&&s.board.length===9&&s.board.every(v=>v===null||v==='X'||v==='O')&&['X','O'].includes(s.turn)&&Array.isArray(s.line)&&!s.outcome;
 if(id==='sea-battle')return s.n===6&&[s.playerFleet,s.enemyFleet].every(f=>Array.isArray(f)&&f.length===3&&f.every(a=>bounded(a,35)))&&bounded(s.shots,35)&&bounded(s.enemyShots,35)&&bounded(s.aiTargets,35)&&['X','O'].includes(s.turn)&&!s.outcome;
 if(id==='matching-pairs')return bounded(s.cards)&&s.cards.length===[12,16,20][s.level]&&bounded(s.matched,s.cards.length-1)&&bounded(s.open,s.cards.length-1)&&s.open.length<=2&&Number.isFinite(s.moves);
 if(id==='what-changed')return s.round<5&&['study','answer','feedback'].includes(s.phase)&&Array.isArray(s.trials)&&s.trials.length===5&&s.trials.every(x=>bounded(x.before)&&bounded(x.after)&&Number.isInteger(x.answer)&&x.answer<16);
 if(id==='sequence-memory')return s.round<5&&['watch','input','feedback'].includes(s.phase)&&Array.isArray(s.sequences)&&s.sequences.length===5&&s.sequences.every(a=>bounded(a,3)&&a.length<=8)&&bounded(s.input,3);
 if(id==='codebreaker')return bounded(s.secret,5)&&s.secret.length===[3,4,5][s.level]&&Array.isArray(s.guess)&&s.guess.length===s.secret.length&&s.guess.every(x=>x===null||Number.isInteger(x)&&x>=0&&x<6)&&Array.isArray(s.history)&&s.history.length<=8&&s.history.every(x=>bounded(x.guess,5)&&x.guess.length===s.secret.length&&Number.isInteger(x.exact)&&Number.isInteger(x.other));
 if(id==='pipes')return s.n===[3,4,5][s.level]&&bounded(s.tiles)&&bounded(s.solution)&&s.tiles.length===s.n*s.n&&s.solution.length===s.tiles.length&&Number.isFinite(s.moves)&&Number.isFinite(s.hints);
 if(id==='mental-math')return s.round<10&&Array.isArray(s.questions)&&s.questions.length===10&&s.questions.every(x=>Number.isFinite(x.a)&&Number.isFinite(x.b)&&Number.isFinite(x.answer)&&['+','−','×'].includes(x.op)&&bounded(x.choices,1000));
 return false;
}
let saved=load().sessions[id];if(!safeSession(saved))saved=null;
const isDone=()=>Boolean(g.outcome)||(id==='matching-pairs'&&g.matched.length===g.cards.length)||(id==='pipes'&&pipeSolved(g.tiles,g.n));
const settleDelay=()=>id==='minesweeper'?(g.outcome==='win'?1400:1300):id==='matching-pairs'?1100:id==='pipes'?1300:1000;
function start(){stopTimers();g={...newGame(id,level,daily?`${day}:${id}`:`${Date.now()}:${Math.random()}`),daily,day,streak:0,marks:[]};saved=null;area.innerHTML='';persist();sfx.click();render();}
function finish(won=true){
 stopTimers();g.status='finished';g.won=won;g.score=finishScore(g);
 const previous=load().records[`${id}:${g.level}`];g.previousBest=previous?.best||0;g.previousPlayed=previous?.played||0;
 record(load(),g);saved=null;updateBest();render();area.querySelector('h2')?.focus({preventScroll:true});
 if(won||g.score>g.previousBest){sfx.win();buzz([30,40,30]);}else sfx.lose();
}
function scheduleAdvance(){if(g?.feedback?.right&&!g.paused)later(()=>{if(g?.feedback?.right&&!g.paused&&g.status==='playing')next();},1400);}
function feedback(right,answer,picked){
 g.correct+=right?1:0;g.streak=right?(g.streak||0)+1:0;g.marks=[...(g.marks||[]),right];g.feedback={right,answer,picked};
 if(g.phase)g.phase='feedback';persist();render();
 if(right){sfx.good();buzz(14);burst(area.querySelector('.is-right,.is-answer'),{n:8});scheduleAdvance();}
 else{sfx.bad();buzz(60);area.querySelector('[data-action=next]')?.focus({preventScroll:true});}
}
function next(){stopTimers();g.round++;g.feedback=null;if(g.round===(id==='mental-math'?10:5)){finish(g.correct===(id==='mental-math'?10:5));return;}if(id==='what-changed')g.phase='study';if(id==='sequence-memory'){g.phase='watch';g.input=[];}persist();sfx.click();render();}
function pause(){if(!g||g.status!=='playing'||g.paused||isDone())return;g.paused=true;stopTimers();if(id==='sequence-memory'&&g.phase==='input'){g.phase='watch';g.input=[];}persist();render();}
function resume(){g.paused=false;if(id==='matching-pairs'&&g.open.length===2)g.open=[];persist();render();scheduleAdvance();}

// ── progress bar ──
function progress(){
 let p=0;
 if(g){
  if(id==='matching-pairs')p=g.matched.length/g.cards.length;
  else if(id==='what-changed'||id==='sequence-memory')p=(g.round+(g.feedback?.right?1:0))/5;
  else if(id==='mental-math')p=(g.round+(g.feedback?.right?1:0))/10;
  else if(id==='codebreaker')p=g.history.length/8;
  else if(id==='pipes')p=connectedTiles(g.tiles,g.n).length/g.tiles.length;
  else if(id==='minesweeper')p=g.opened.filter(k=>!g.mines.includes(k)).length/(36-g.mineCount);
  else if(id==='sea-battle')p=sunkShips(g.enemyFleet,g.shots)/3;
  else p=g.moves/9;
  if(g.status==='finished'&&g.won)p=1;
 }
 bar.style.width=Math.min(100,p*100)+'%';
}

// ── markup ──
function stats(){
 const chip=g.streak>=2?`<span class="streak">🔥 ${t.streak.replace('{n}',g.streak)}</span>`:'';
 if(classicIds.includes(id))return classicStats(g,t);
 if(id==='matching-pairs')return `<span>${t.moves}: <strong>${g.moves}</strong></span><span><strong>${g.matched.length/2}</strong> / ${g.cards.length/2}</span>${chip}`;
 if(id==='pipes')return `<span>${t.moves}: <strong>${g.moves}</strong></span><span>${t.hints}: <strong>${g.hints}</strong></span>`;
 if(id==='codebreaker')return `<span>${t.guess}: <strong>${g.history.length} / 8</strong></span>`;
 return `<span>${t.challenge}: <strong>${g.round+1} / ${id==='mental-math'?10:5}</strong></span><span>${t.correct}: <strong>${g.correct}</strong></span>${chip}`;
}
function dots(total){return `<div class="round-dots" aria-hidden="true">${Array.from({length:total},(_,k)=>{const m=(g.marks||[])[k];return `<i class="${m===true?'ok':m===false?'no':k===g.round?'now':''}"></i>`;}).join('')}</div>`;}
function cardHTML(v,k){
 const m=g.matched.includes(k),up=m||g.open.includes(k);
 return `<button type="button" class="card ${up?'up':''} ${m?'match':''}" style="--i:${k}" data-action="pick" data-value="${k}" data-focus="pick-${k}" aria-label="${up?t.symbols[v]:`${t.hidden} ${k+1}`}" aria-disabled="${up}"><span class="in" aria-hidden="true"><span class="face back"></span><span class="face front">${icon(v)}</span></span>${m?'<i class="ring"></i>':''}</button>`;
}
function patchPairs(){
 area.querySelectorAll('.card').forEach(el=>{
  const k=Number(el.dataset.value),v=g.cards[k],m=g.matched.includes(k),up=m||g.open.includes(k);
  el.classList.toggle('up',up);el.classList.remove('wrong');
  if(m&&!el.classList.contains('match')){el.classList.add('match');el.insertAdjacentHTML('beforeend','<i class="ring"></i>');}
  el.setAttribute('aria-label',up?t.symbols[v]:`${t.hidden} ${k+1}`);el.setAttribute('aria-disabled',String(up));
 });
 area.querySelector('.readout').innerHTML=stats();
}
function mathBody(){
 const q=g.questions[g.round],f=g.feedback;
 return `${dots(10)}<div class="math-card ${f?'static':''}"><p class="math-equation" aria-label="${q.a} ${q.op} ${q.b}">${q.a} ${q.op} ${q.b} <span aria-hidden="true">= ${f?q.answer:'?'}</span></p></div><div class="math-answers ${f?'static':''}">${q.choices.map((v,k)=>`<button type="button" style="--i:${k}" class="${f?(v===q.answer?'is-right':v===f.picked?'is-wrong':''):''}" data-action="pick" data-value="${v}" data-focus="pick-${k}" ${f?'disabled':''}><kbd aria-hidden="true">${k+1}</kbd>${v}</button>`).join('')}</div>`;
}
function codeBody(){
 const n=g.secret.length;
 const clueMarkup=(h,fresh)=>{if(!h.exact&&!h.other)return `<span class="code-clues none" aria-label="${h.exact} ${t.placed}, ${h.other} ${t.misplaced}">—</span>`;let k=0;const dot=c=>`<i class="${c}" style="--k:${k++}"></i>`;return `<span class="code-clues" aria-label="${h.exact} ${t.placed}, ${h.other} ${t.misplaced}">${Array.from({length:h.exact},()=>dot('exact')).join('')}${Array.from({length:h.other},()=>dot('other')).join('')}</span>`;};
 return `<div class="code-board" style="--length:${n}">${g.history.map((h,k)=>`<div class="code-row ${lastPick===-2&&k===g.history.length-1?'fresh':''}"><span class="code-number">${k+1}</span><div class="code-pegs">${h.guess.map(v=>`<span class="code-peg" role="img" aria-label="${t.symbols[sym[v]]}">${icon(sym[v])}</span>`).join('')}</div>${clueMarkup(h)}</div>`).join('')}<div class="code-row"><span class="code-number">${g.history.length+1}</span><div class="code-pegs">${g.guess.map((v,k)=>`<button type="button" class="code-peg ${k===lastPick&&v!==null?'filled':''}" data-action="position" data-value="${k}" data-focus="position-${k}" aria-current="${g.position===k}" aria-label="${t.position} ${k+1}: ${v===null?'—':t.symbols[sym[v]]}">${v===null?'<span>·</span>':icon(sym[v])}</button>`).join('')}</div><span class="code-clues"></span></div></div><p class="code-legend"><span><i class="exact"></i>${t.placed}</span><span><i class="other"></i>${t.misplaced}</span></p><div class="code-palette" role="group" aria-label="${t.select}">${sym.map((v,k)=>`<button type="button" data-action="symbol" data-value="${k}" data-focus="symbol-${k}" aria-label="${t.symbols[v]}">${icon(v)}<kbd aria-hidden="true">${k+1}</kbd></button>`).join('')}</div>`;
}
function render(){
 const focus=document.activeElement?.dataset?.focus;
 const playing=Boolean(g&&g.status==='playing'),locked=playing||daily;
 radios.forEach(r=>{r.disabled=locked;});seg.classList.toggle('is-locked',locked);setLevelUI();updateBest();progress();
 if(!g){
  const played=load().records[`${id}:${level}`]?.played||0;
  area.innerHTML=`<div class="round-start"><span class="start-hero" aria-hidden="true">${HERO[index]}</span><h2>${t.readyTitle}</h2><p>${t.desc[index]}</p><div class="start-actions">${saved?button(t.resumeSaved,'restore','button invite-play'):''}${button(daily?t.dailyPlay:t.start,'start',saved?'button secondary':'button invite-play')}</div><p class="start-note">${t.readyNotes[played%t.readyNotes.length]}</p></div>`;return;
 }
 if(g.paused){area.innerHTML=`<div class="intro-game"><h2 tabindex="-1">${t.paused}</h2><p>${canSave()?t.pausedText:t.saveUnavailable}</p><div class="intro-actions">${button(t.resume,'resume','button invite-play')}${button(t.reset,'reset','button secondary')}</div></div>`;if(document.querySelector('.game-help')?.open)document.querySelector('.game-help summary').focus({preventScroll:true});else area.querySelector('button').focus({preventScroll:true});return;}
 if(g.status==='finished'){renderResult();return;}
 const done=isDone();
 if(id==='matching-pairs'&&area.querySelector('.pairs-board')){patchPairs();if(done&&!finishing){finishing=true;later(()=>finish(true),settleDelay());}return;}
 let body='';
 if(id==='mental-math'){
  body=mathBody();
  if(g.feedback)body+=feedbackBox();
 }else if(g.feedback){
  const f=g.feedback;
  if(id==='what-changed'){const trial=g.trials[g.round];body=`<div class="board question-board static" style="--cols:${g.level===0?2:3};--bw:${g.level===0?340:g.level===1?460:480}px">${trial.after.map((v,k)=>`<div class="cell ${v===f.answer?'is-answer':k===f.picked&&!f.right?'is-picked-wrong':''}" role="img" aria-label="${t.symbols[v]}">${icon(v)}</div>`).join('')}</div>`;}
  else body=`<div class="board sequence-board">${[0,1,2,3].map(k=>sequencePad(k,true,`${t.padNames[k]}, ${k+1}`)).join('')}</div>`;
  body=dots(5)+body+feedbackBox();
 }
 else if(classicIds.includes(id)){body=classicBoard(g,t);}
 else if(id==='matching-pairs'){body=`<div class="board pairs-board" style="--cols:${[4,4,5][g.level]};--bw:${[440,520,640][g.level]}px">${g.cards.map((v,k)=>cardHTML(v,k)).join('')}</div>`;}
 else if(id==='what-changed'){
  const trial=g.trials[g.round],study=g.phase==='study';
  body=`${dots(5)}<p class="game-message" role="status">${study?t.study:t.newPicture}</p><div class="board question-board ${study?'':'selecting shuffled'}" style="--cols:${g.level===0?2:3};--bw:${g.level===0?340:g.level===1?460:480}px">${(study?trial.before:trial.after).map((v,k)=>study?`<div class="cell" style="--i:${k}" role="img" aria-label="${t.symbols[v]}">${icon(v)}</div>`:cell(v,k)).join('')}</div>`;
 }else if(id==='sequence-memory'){
  const watching=g.phase==='watch';
  body=`${dots(5)}<p class="game-message" role="status">${watching?t.watch:t.repeat}</p><div class="board sequence-board">${[0,1,2,3].map(k=>sequencePad(k,watching,`${t.padNames[k]}, ${k+1}`)).join('')}</div><div class="sequence-steps" aria-label="${g.input.length} / ${g.sequences[g.round].length}">${g.sequences[g.round].map((_,k)=>`<span class="${k<g.input.length?'done':''}"></span>`).join('')}</div>`;
 }else if(id==='codebreaker'){body=codeBody();}
 else if(id==='pipes'){
  const reached=connectedTiles(g.tiles,g.n);
  body=`<div class="board pipe-board ${g.moves+g.hints===0?'fresh':''} ${done?'solved':''}" style="--cols:${g.n};--bw:${g.n*104}px">${g.tiles.map((mask,k)=>`<button type="button" style="--i:${k}" class="cell pipe-tile ${reached.includes(k)?'reached':''} ${k===0?'source':''} ${k===lastPick?'spin':''}" data-action="pick" data-value="${k}" data-focus="pick-${k}" aria-label="${t.tile} ${Math.floor(k/g.n)+1}, ${k%g.n+1}${reached.includes(k)?', '+t.connected:''}">${pipe(mask,k===0)}</button>`).join('')}</div>`;
 }
 const studying=id==='what-changed'&&g.phase==='study'&&!g.feedback;
 const primary=done?'':studying?button(t.studyReady,'ready','button invite-play'):id==='codebreaker'?button(t.clear,'clear','button secondary')+button(t.check,'check','button',g.guess.includes(null)?'disabled':''):id==='pipes'?button(t.hint,'hint','button secondary'):'';
 area.innerHTML=`<div class="readout">${stats()}</div>${body}<div class="action-row">${studying||done?'':button(t.pause,'pause','button secondary')}${primary}</div>${!canSave()?`<p class="save-warning">${t.saveUnavailable}</p>`:''}`;
 if(focus){const target=area.querySelector(`[data-focus="${focus}"]`);(target&&!target.disabled?target:area.querySelector('[data-action=pick]:not(:disabled)'))?.focus({preventScroll:true});}
 lastPick=-1;
 scheduleComputer();
 if(done&&!finishing){finishing=true;later(()=>finish(classicIds.includes(id)?g.outcome==='win':true),settleDelay());}
 if(id==='sequence-memory'&&g.phase==='watch'&&!g.feedback&&!playingSequence)playSequence();
}
function feedbackBox(){const f=g.feedback;return `<div class="feedback-box ${f.right?'good':'bad'}" role="status"><h2>${f.right?'✓ '+t.right:'× '+t.wrong}</h2>${id==='mental-math'&&!f.right?`<p>${t.answer}: <strong>${f.answer}</strong></p>`:''}<p>${f.right?t.autoNext:t.review}</p>${f.right?'':button(t.next,'next','button')}</div>`;}
function renderResult(){
 const mood=encouragement(g,t,lang),heading=classicIds.includes(id)?(g.outcome==='win'?t.youWin:g.outcome==='draw'?t.draw:t.youLose):g.won&&(id==='pipes'||id==='codebreaker')?t.solved:t.finish;
 const detail=id==='matching-pairs'||id==='pipes'||classicIds.includes(id)?`${t.moves}: ${g.moves}`:id==='codebreaker'?`${t.guess}: ${g.history.length} / 8`:`${t.correct}: ${g.correct} / ${id==='mental-math'?10:5}`;
 area.innerHTML=`${mood.celebrate?confetti():''}<div class="result"><h2 tabindex="-1">${heading}</h2><div class="result-overview"><figure class="result-snapshot" aria-label="${t.finishedView}"><div class="snapshot-art" inert aria-hidden="true">${finalBoard(g,t)}</div><figcaption>${t.finishedView}</figcaption></figure><div class="score-summary"><span class="result-label">${t.roundScore}</span><div class="result-score">${g.score.toLocaleString(lang)}</div><span class="score-unit">${t.pointsLabel}</span><p class="result-detail">${detail}</p></div></div><p class="result-encouragement" role="status">${mood.message}</p><p class="result-invite">${mood.invite}</p></div><div class="result-actions"><div class="result-secondary">${button(t.share,'share','button secondary')}${button(t.randomGame,'random','button secondary')}</div>${button(t.again,'start','button play-again invite-play')}</div>${!canSave()?`<p class="save-warning">${t.saveUnavailable}</p>`:''}`;
 countUp(area.querySelector('.result-score'),g.score,900,lang);
 if(mood.celebrate)later(()=>area.querySelector('.confetti')?.remove(),2600);
}
function shareUrl(){const url=new URL(`/${lang}/${id}/`,location.origin);if(daily)url.searchParams.set('daily',g?.day||day);return url.href;}
async function share(){
 const url=shareUrl(),data={title:`${t.names[index]} · Biuno`,url};
 if(navigator.share){try{await navigator.share(data);return;}catch(e){if(e.name==='AbortError')return;}}
 try{if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(url);notify(t.copied);return;}}catch{}
 const dialog=document.createElement('dialog');dialog.className='share-dialog';
 const title=document.createElement('h2');title.textContent=t.share;
 const label=document.createElement('label');label.textContent=t.shareHelp;
 const input=document.createElement('input');input.value=url;input.readOnly=true;label.append(input);
 const close=document.createElement('button');close.className='button';close.textContent=t.close;close.onclick=()=>dialog.close();
 dialog.append(title,label,close);document.body.append(dialog);dialog.addEventListener('close',()=>dialog.remove());dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});dialog.showModal();input.select();
}
function playSequence(){
 playingSequence=true;const seq=g.sequences[g.round],step=[1100,900,760][g.level];
 seq.forEach((v,i)=>{
  later(()=>{area.querySelector(`[data-value="${v}"]`)?.classList.add('flash');sfx.pad(v);},650+i*step);
  later(()=>{area.querySelector(`[data-value="${v}"]`)?.classList.remove('flash');},650+i*step+step*.62);
 });
 later(()=>{playingSequence=false;g.phase='input';g.input=[];persist();render();area.querySelector('[data-action=pick]')?.focus({preventScroll:true});},650+seq.length*step);
}
function afterShot(side){
 const s=g.lastShot;if(!s)return;
 if(s.sunk){sfx.sunk();buzz([40,30,60]);}else if(s.hit){sfx.hit();buzz(35);}else sfx.splash();
 const el=area.querySelector(`.sea-board:${side==='X'?'first':'last'}-child .new-cell`)||area.querySelector('.new-cell');
 if(s.hit)burst(el,{n:s.sunk?14:7,items:['🔥','💥','✨']});
}
function scheduleComputer(){
 if(!g||g.status!=='playing'||g.paused||g.turn!=='O'||!['sea-battle','tic-tac-toe'].includes(id)||botScheduled)return;
 botScheduled=true;
 later(()=>{
  botScheduled=false;const random=rng(`${g.seed}:bot:${g.moves}`);
  if(id==='tic-tac-toe'){ticMove(g,ticComputer(g.board,g.level,random),'O');sfx.place('O');}
  else navalShot(g,navalComputer(g,g.level,random),'O');
  persist();render();
  if(id==='sea-battle')afterShot('O');
  if(g.outcome&&id==='tic-tac-toe'&&g.outcome==='loss')buzz(40);
 },id==='sea-battle'?750:600);
}
function minesFx(){
 if(g.outcome==='loss'){sfx.boom();buzz([80,40,120]);const grid=area.querySelector('.mine-grid');grid?.classList.add('board-shake');burst(area.querySelector('.boom'),{n:12,items:['💥','🔥','✨']});}
 else if(g.outcome==='win'){sfx.win();burst(area.querySelector('.mine-grid'),{n:16,items:['✨','⭐','🎉'],spread:140});}
 else{sfx.reveal();buzz(8);}
}
function pick(k){
 if(!g||g.paused||g.feedback||g.status!=='playing'||isDone())return;
 if(classicIds.includes(id)){
  if(id==='minesweeper'){
   if(g.tool==='flag'){flagMine(g,k);g.lastFlag=k;sfx.flag();buzz(14);}
   else{g.lastFlag=-1;revealMine(g,k,rng(g.seed));persist();render();minesFx();return;}
  }else if(id==='tic-tac-toe'){ticMove(g,k,'X');sfx.place('X');buzz(10);if(g.outcome){persist();render();burst(area.querySelector('.winning-cell'),{n:10});if(g.outcome==='win')sfx.win();return;}}
  else{navalShot(g,k,'X');persist();render();afterShot('X');return;}
 }else if(id==='matching-pairs'){
  if(g.open.length===2||g.matched.includes(k)||g.open.includes(k)||k>=g.cards.length)return;
  lastPick=k;g.open.push(k);sfx.flip();buzz(8);
  if(g.open.length===2){
   g.moves++;const[a,b]=g.open;
   if(g.cards[a]===g.cards[b]){
    g.matched.push(a,b);g.open=[];g.streak=(g.streak||0)+1;
    persist();render();
    later(()=>{sfx.match();buzz([10,30,10]);[a,b].forEach(i=>burst(area.querySelector(`[data-value="${i}"]`),{n:6}));},430);
    return;
   }
   g.streak=0;
   later(()=>{[a,b].forEach(i=>area.querySelector(`[data-value="${i}"]`)?.classList.add('wrong'));sfx.miss();buzz(30);},520);
   later(()=>{g.open=[];persist();render();},1150);
  }
 }else if(id==='what-changed'&&g.phase==='answer'){feedback(g.trials[g.round].after[k]===g.trials[g.round].answer,g.trials[g.round].answer,k);return;}
 else if(id==='sequence-memory'&&g.phase==='input'){
  const seq=g.sequences[g.round];g.input.push(k);
  if(k!==seq[g.input.length-1]){feedback(false,null);return;}
  if(g.input.length===seq.length){sfx.pad(k);feedback(true,null);return;}
  sfx.pad(k);buzz(8);
 }else if(id==='mental-math'){feedback(k===g.questions[g.round].answer,g.questions[g.round].answer,k);return;}
 else if(id==='pipes'){
  const before=connectedTiles(g.tiles,g.n).length;
  g.tiles[k]=rotate(g.tiles[k]);g.moves++;lastPick=k;sfx.rotate();buzz(6);
  persist();render();
  if(connectedTiles(g.tiles,g.n).length>before)later(()=>sfx.connect(),120);
  return;
 }
 persist();render();
 if(id==='sequence-memory'&&g.phase==='input'){const pad=area.querySelector(`[data-value="${k}"]`);pad?.classList.add('flash');later(()=>pad?.classList.remove('flash'),200);}
}
area.addEventListener('click',e=>{
 const b=e.target.closest('[data-action]');if(!b||b.disabled)return;
 if(Date.now()<suppressUntil){suppressUntil=0;return;}
 const a=b.dataset.action,k=Number(b.dataset.value);
 if(a==='share'){share();return;}
 if(a==='random'){const others=ids.filter(x=>x!==id);location.href=`/${lang}/${others[Math.floor(Math.random()*others.length)]}/`;return;}
 if(a==='start'||a==='reset'){start();return;}
 if(a==='restore'){g=structuredClone(saved);level=g.level;g.paused=false;if(id==='matching-pairs'&&g.open.length===2)g.open=[];if(id==='sequence-memory'&&!g.feedback){g.phase='watch';g.input=[];}render();scheduleAdvance();return;}
 if(a==='pause'){pause();return;}
 if(a==='resume'){resume();return;}
 if(a==='next'){next();return;}
 if(!g||g.paused||g.status!=='playing')return;
 if(a==='mine-tool'){g.tool=b.dataset.tool;sfx.click();persist();render();return;}
 if(a==='pick'){pick(k);return;}
 if(a==='ready'){g.phase='answer';sfx.click();persist();render();area.querySelector('[data-action=pick]')?.focus({preventScroll:true});return;}
 if(a==='position'){g.position=k;sfx.tap();persist();render();return;}
 if(a==='symbol'){lastPick=g.position;g.guess[g.position]=k;g.position=(g.position+1)%g.secret.length;sfx.tap();buzz(6);persist();render();return;}
 if(a==='clear'){g.guess.fill(null);g.position=0;sfx.click();persist();render();return;}
 if(a==='check'&&!g.guess.includes(null)){
  const f=codeFeedback(g.secret,g.guess);g.history.push({guess:[...g.guess],...f});
  if(f.exact===g.secret.length){finish();return;}
  if(g.history.length===8){finish(false);return;}
  g.guess.fill(null);g.position=0;lastPick=-2;persist();render();
  f.exact?sfx.good():sfx.tap();buzz(12);area.querySelector('[data-action=position]')?.focus({preventScroll:true});return;
 }
 if(a==='hint'){const k=g.tiles.findIndex((v,i)=>v!==g.solution[i]);if(k>=0){g.tiles[k]=g.solution[k];g.hints++;lastPick=k;sfx.connect();persist();render();}}
});
// Long-press plants a flag on touch screens; right-click does the same with a mouse.
area.addEventListener('pointerdown',e=>{
 if(id!=='minesweeper'||e.pointerType==='mouse')return;
 const b=e.target.closest('.mine-cell[data-action=pick]');if(!b||b.disabled||!g||g.status!=='playing'||g.paused)return;
 clearTimeout(hold);const k=Number(b.dataset.value);
 hold=setTimeout(()=>{hold=null;if(!g||g.status!=='playing'||isDone())return;flagMine(g,k);g.lastFlag=k;suppressUntil=Date.now()+700;sfx.flag();buzz(28);persist();render();},420);
});
['pointerup','pointercancel','pointerleave','pointermove'].forEach(ev=>area.addEventListener(ev,()=>{clearTimeout(hold);hold=null;}));
area.addEventListener('contextmenu',e=>{const b=e.target.closest('[data-action=pick]');if(id==='minesweeper'&&b){e.preventDefault();if(g?.status==='playing'&&!g.paused&&!isDone()){flagMine(g,Number(b.dataset.value));g.lastFlag=Number(b.dataset.value);sfx.flag();persist();render();}}});
radios.forEach(r=>r.addEventListener('change',()=>{if(!r.checked)return;level=Number(r.value);const d=load();d.settings.level=level;save(d);sfx.click();render();}));
soundBtn.addEventListener('click',()=>{setSound(!sound.on);syncSound();sfx.click();});
document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
document.querySelector('.game-help')?.addEventListener('toggle',e=>{if(e.target.open)pause();});
window.addEventListener('pagehide',persist);
window.addEventListener('storage',e=>{if(e.key==='biuno:v1')updateBest();});
document.addEventListener('keydown',e=>{
 if(e.key==='Escape'&&g?.status==='playing'){e.preventDefault();g.paused?resume():pause();return;}
 if(!g||g.status!=='playing'||g.paused||e.metaKey||e.ctrlKey||e.altKey||e.target.closest?.('input,select,textarea'))return;
 const n=Number(e.key);
 if(id==='mental-math'&&n>=1&&n<=4&&!g.feedback){area.querySelectorAll('.math-answers button')[n-1]?.click();}
 else if(id==='sequence-memory'&&n>=1&&n<=4&&g.phase==='input'&&!g.feedback){area.querySelector(`.sequence-pad[data-value="${n-1}"]`)?.click();}
 else if(id==='codebreaker'){if(n>=1&&n<=6)area.querySelectorAll('.code-palette button')[n-1]?.click();else if(e.key==='Backspace')area.querySelector('[data-action=clear]')?.click();else if(e.key==='Enter'&&e.target.tagName!=='BUTTON')area.querySelector('[data-action=check]')?.click();}
});
render();
