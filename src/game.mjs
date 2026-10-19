import {i18n,ids} from './i18n.mjs';
import {newGame,shuffle,rng,codeFeedback,rotate,pipeSolved,connectedTiles,finishScore,dailyKey} from './engine.mjs';
import {load,save,record,canSave} from './storage.mjs';
import {classicIds,revealMine,flagMine,ticMove,ticComputer,navalShot,navalComputer} from './classic-engine.mjs';
import {classicBoard,classicStats} from './classic-ui.mjs';
import {icon,pipe,sequencePad} from './art.mjs';
import {encouragement,finalBoard,confetti} from './round-ui.mjs';
import {notify} from './app.mjs';
const lang=document.documentElement.lang,t=i18n[lang]||i18n.en,id=document.body.dataset.game,index=ids.indexOf(id);
const area=document.querySelector('#game-area'),levelSelect=document.querySelector('#difficulty'),best=document.querySelector('#best-score');
const rawDay=new URLSearchParams(location.search).get('daily'),daily=rawDay===dailyKey(),day=dailyKey();
let g=null,level=daily?1:load().settings.level,epoch=0,timers=[],playingSequence=false,botScheduled=false,lastPick=-1;
const sym=[1,8,12,11,0,3];
const button=(label,action,kind='button',extra='')=>`<button type="button" class="${kind}" data-action="${action}" ${extra}>${label}</button>`;
const cell=(v,k,extra='',disabled=false)=>`<button type="button" class="cell ${extra}" data-action="pick" data-value="${k}" data-focus="pick-${k}" aria-label="${t.symbols[v]}" ${disabled?'disabled':''}>${icon(v)}</button>`;
function stopTimers(){epoch++;timers.forEach(clearTimeout);timers=[];playingSequence=false;botScheduled=false;}
function later(fn,ms){const token=epoch;timers.push(setTimeout(()=>{if(epoch===token)fn();},ms));}
function persist(){if(!g||g.status!=='playing')return;const d=load();d.sessions[id]=structuredClone(g);save(d);}
function updateBest(){const r=load().records[`${id}:${level}`];best.textContent=r?`${r.best.toLocaleString(lang)}`:'—';}
levelSelect.value=String(level);document.querySelector('#mode-label').textContent=daily?t.dailyMode:t.freeMode;
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
function start(){stopTimers();g={...newGame(id,level,daily?`${day}:${id}`:`${Date.now()}:${Math.random()}`),daily,day};saved=null;persist();render();}
function finish(won=true){stopTimers();g.status='finished';g.won=won;g.score=finishScore(g);const previous=load().records[`${id}:${g.level}`];g.previousBest=previous?.best||0;g.previousPlayed=previous?.played||0;record(load(),g);saved=null;updateBest();render();area.querySelector('h2')?.focus();}
function scheduleAdvance(){if(g?.feedback?.right&&!g.paused)later(()=>{if(g?.feedback?.right&&!g.paused&&g.status==='playing')next();},1600);}
function feedback(right,answer){g.correct+=right?1:0;g.feedback={right,answer};if(g.phase)g.phase='feedback';persist();render();if(right)scheduleAdvance();else area.querySelector('[data-action=next]')?.focus();}
function next(){stopTimers();g.round++;g.feedback=null;if(g.round===(id==='mental-math'?10:5)){finish(g.correct===(id==='mental-math'?10:5));return;}if(id==='what-changed')g.phase='study';if(id==='sequence-memory'){g.phase='watch';g.input=[];}persist();render();}
function pause(){if(!g||g.status!=='playing'||g.paused)return;g.paused=true;stopTimers();if(id==='sequence-memory'&&g.phase==='input'){g.phase='watch';g.input=[];}persist();render();}
function resume(){g.paused=false;if(id==='matching-pairs'&&g.open.length===2)g.open=[];persist();render();scheduleAdvance();}
function stats(){if(classicIds.includes(id))return classicStats(g,t);if(id==='matching-pairs')return `<span>${t.moves}: <strong>${g.moves}</strong></span><span>${g.matched.length/2} / ${g.cards.length/2}</span>`;if(id==='pipes')return `<span>${t.moves}: <strong>${g.moves}</strong></span><span>${t.hints}: <strong>${g.hints}</strong></span>`;if(id==='codebreaker')return `<span>${t.guess}: <strong>${g.history.length} / 8</strong></span>`;return `<span>${t.challenge}: <strong>${g.round+1} / ${id==='mental-math'?10:5}</strong></span><span>${t.correct}: <strong>${g.correct}</strong></span>`;}
function render(){
 const focus=document.activeElement?.dataset?.focus;
 levelSelect.disabled=Boolean(g&&g.status==='playing')||daily;updateBest();
 if(!g){const played=load().records[`${id}:${level}`]?.played||0;area.innerHTML=`<div class="round-start"><h2>${t.readyTitle}</h2><p>${t.desc[index]}</p><div class="start-actions">${saved?button(t.resumeSaved,'restore','button invite-play'):''}${button(daily?t.dailyPlay:t.start,'start',saved?'button secondary':'button invite-play')}</div><p class="start-note">${t.readyNotes[played%t.readyNotes.length]}</p></div>`;return;}
 if(g.paused){area.innerHTML=`<div class="intro-game"><h2 tabindex="-1">${t.paused}</h2><p>${canSave()?t.pausedText:t.saveUnavailable}</p><div class="intro-actions">${button(t.resume,'resume')}${button(t.reset,'reset','button secondary')}</div></div>`;if(document.querySelector('.game-help')?.open)document.querySelector('.game-help summary').focus({preventScroll:true});else area.querySelector('button').focus({preventScroll:true});return;}
 if(g.status==='finished'){renderResult();return;}
 let body='';
 if(g.feedback){const f=g.feedback;body=`<div class="feedback-box ${f.right?'good':'bad'}" role="status"><h2>${f.right?'✓ '+t.right:'× '+t.wrong}</h2>${id==='mental-math'?`<p>${t.answer}: <strong>${f.answer}</strong></p>`:id==='what-changed'?`<div class="feedback-picture" role="img" aria-label="${t.symbols[f.answer]}">${icon(f.answer)}</div>`:''}<p>${f.right?t.autoNext:t.review}</p>${f.right?'':button(t.next,'next')}</div>`;}
 else if(classicIds.includes(id)){body=classicBoard(g,t);
 }else if(id==='matching-pairs'){
  body=`<div class="board" style="--cols:4">${g.cards.map((v,k)=>{const show=g.matched.includes(k)||g.open.includes(k);return `<button type="button" class="cell ${show?'':'face-down'} ${k===lastPick&&show?'new-card':''} ${g.matched.includes(k)?'matched':''}" data-action="pick" data-value="${k}" data-focus="pick-${k}" aria-label="${show?t.symbols[v]:`${t.hidden} ${k+1}`}" ${g.matched.includes(k)||g.open.includes(k)||g.open.length===2?'disabled':''}>${show?icon(v):''}</button>`;}).join('')}</div>`;
 }else if(id==='what-changed'){
  const trial=g.trials[g.round],study=g.phase==='study';body=`<p class="game-message" role="status">${study?t.study:t.newPicture}</p><div class="board question-board ${study?'':'selecting'}" style="--cols:${g.level===0?2:3}">${(study?trial.before:trial.after).map((v,k)=>study?`<div class="cell" role="img" aria-label="${t.symbols[v]}">${icon(v)}</div>`:cell(v,k)).join('')}</div>`;
 }else if(id==='sequence-memory'){
  const watching=g.phase==='watch';body=`<p class="game-message" role="status">${watching?t.watch:t.repeat}</p><div class="board sequence-board">${[0,1,2,3].map(k=>sequencePad(k,watching,`${t.padNames[k]}, ${k+1}`)).join('')}</div><div class="sequence-steps" aria-label="${g.input.length} / ${g.sequences[g.round].length}">${g.sequences[g.round].map((_,k)=>`<span class="${k<g.input.length?'done':''}"></span>`).join('')}</div>`;
 }else if(id==='mental-math'){
  const q=g.questions[g.round];body=`<p class="math-equation" aria-label="${q.a} ${q.op} ${q.b}">${q.a} ${q.op} ${q.b} <span aria-hidden="true">= ?</span></p><div class="math-answers">${q.choices.map((v,k)=>button(String(v),'pick','',`data-value="${v}" data-focus="pick-${k}"`)).join('')}</div>`;
 }else if(id==='codebreaker'){
  const n=g.secret.length;body=`<div class="code-board" style="--length:${n}">${g.history.map((h,k)=>`<div class="code-row"><span class="code-number">${k+1}</span><div class="code-pegs">${h.guess.map(v=>`<span class="code-peg" role="img" aria-label="${t.symbols[sym[v]]}">${icon(sym[v])}</span>`).join('')}</div><span class="code-clues" aria-label="${h.exact} ${t.placed}, ${h.other} ${t.misplaced}">${'●'.repeat(h.exact)}${'○'.repeat(h.other)}${!h.exact&&!h.other?'—':''}</span></div>`).join('')}<div class="code-row"><span class="code-number">${g.history.length+1}</span><div class="code-pegs">${g.guess.map((v,k)=>`<button class="code-peg" data-action="position" data-value="${k}" data-focus="position-${k}" aria-current="${g.position===k}" aria-label="${t.position} ${k+1}: ${v===null?'—':t.symbols[sym[v]]}">${v===null?'<span>·</span>':icon(sym[v])}</button>`).join('')}</div><span class="code-clues"></span></div></div><p class="code-legend">● ${t.placed} &nbsp; ○ ${t.misplaced}</p><div class="code-palette" role="group" aria-label="${t.select}">${sym.map((v,k)=>`<button type="button" data-action="symbol" data-value="${k}" data-focus="symbol-${k}" aria-label="${t.symbols[v]}">${icon(v)}</button>`).join('')}</div>`;
 }else if(id==='pipes'){
  const reached=connectedTiles(g.tiles,g.n);body=`<div class="board pipe-board" style="--cols:${g.n}">${g.tiles.map((mask,k)=>`<button type="button" class="cell pipe-tile ${reached.includes(k)?'reached':''} ${k===0?'source':''}" data-action="pick" data-value="${k}" data-focus="pick-${k}" aria-label="${t.tile} ${Math.floor(k/g.n)+1}, ${k%g.n+1}${reached.includes(k)?', '+t.connected:''}">${pipe(mask,k===0)}</button>`).join('')}</div>`;
 }
 const studying=id==='what-changed'&&g.phase==='study'&&!g.feedback;
 const primary=studying?button(t.studyReady,'ready'):id==='codebreaker'?button(t.check,'check','button',g.guess.includes(null)?'disabled':''):id==='pipes'?button(t.hint,'hint','button secondary'):'';
 area.innerHTML=`<div class="readout">${stats()}</div>${body}<div class="action-row">${studying?'':button(t.pause,'pause','button secondary')}${primary}</div>${!canSave()?`<p class="save-warning">${t.saveUnavailable}</p>`:''}`;
 if(focus){const target=area.querySelector(`[data-focus="${focus}"]`);(target&&!target.disabled?target:area.querySelector('[data-action=pick]:not(:disabled)'))?.focus({preventScroll:true});}
 lastPick=-1;
 scheduleComputer();
 if(id==='sequence-memory'&&g.phase==='watch'&&!g.feedback&&!playingSequence)playSequence();
}
function renderResult(){
 const mood=encouragement(g,t,lang),heading=classicIds.includes(id)?(g.outcome==='win'?t.youWin:g.outcome==='draw'?t.draw:t.youLose):g.won&&(id==='pipes'||id==='codebreaker')?t.solved:t.finish;
 const detail=id==='matching-pairs'||id==='pipes'||classicIds.includes(id)?`${t.moves}: ${g.moves}`:id==='codebreaker'?`${t.guess}: ${g.history.length} / 8`:`${t.correct}: ${g.correct} / ${id==='mental-math'?10:5}`;
 area.innerHTML=`${mood.celebrate?confetti():''}<div class="result"><h2 tabindex="-1">${heading}</h2><div class="result-overview"><figure class="result-snapshot" aria-label="${t.finishedView}"><div class="snapshot-art" inert aria-hidden="true">${finalBoard(g,t)}</div><figcaption>${t.finishedView}</figcaption></figure><div class="score-summary"><span class="result-label">${t.roundScore}</span><div class="result-score">${g.score.toLocaleString(lang)}</div><span class="score-unit">${t.pointsLabel}</span><p class="result-detail">${detail}</p></div></div><p class="result-encouragement" role="status">${mood.message}</p><p class="result-invite">${mood.invite}</p></div><div class="result-actions"><div class="result-secondary">${button(t.share,'share','button secondary')}${button(t.randomGame,'random','button secondary')}</div>${button(t.again,'start','button play-again invite-play')}</div>${!canSave()?`<p class="save-warning">${t.saveUnavailable}</p>`:''}`;
 if(mood.celebrate)later(()=>area.querySelector('.confetti')?.remove(),2200);
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
function playSequence(){playingSequence=true;const seq=g.sequences[g.round],step=[1300,1100,950][g.level];seq.forEach((v,i)=>{later(()=>{const b=area.querySelector(`[data-value="${v}"]`);b?.classList.add('flash');},650+i*step);later(()=>{area.querySelector(`[data-value="${v}"]`)?.classList.remove('flash');},650+i*step+650);});later(()=>{playingSequence=false;g.phase='input';g.input=[];persist();render();area.querySelector('[data-action=pick]')?.focus({preventScroll:true});},650+seq.length*step);}
function scheduleComputer(){if(!g||g.status!=='playing'||g.paused||g.turn!=='O'||!['sea-battle','tic-tac-toe'].includes(id)||botScheduled)return;botScheduled=true;later(()=>{botScheduled=false;const random=rng(`${g.seed}:bot:${g.moves}`);if(id==='tic-tac-toe')ticMove(g,ticComputer(g.board,g.level,random),'O');else navalShot(g,navalComputer(g,g.level,random),'O');if(g.outcome){finish(g.outcome==='win');return;}persist();render();},550);}
function pick(k){
 if(!g||g.paused||g.feedback||g.status!=='playing')return;
 if(classicIds.includes(id)){if(id==='minesweeper'){if(g.tool==='flag')flagMine(g,k);else revealMine(g,k,rng(g.seed));}else if(id==='tic-tac-toe')ticMove(g,k,'X');else navalShot(g,k,'X');if(g.outcome){finish(g.outcome==='win');return;}}else if(id==='matching-pairs'){
  if(g.open.length===2||g.matched.includes(k)||g.open.includes(k)||k>=g.cards.length)return;
  lastPick=k;g.open.push(k);if(g.open.length===2){g.moves++;const[a,b]=g.open;if(g.cards[a]===g.cards[b]){g.matched.push(a,b);g.open=[];if(g.matched.length===g.cards.length){finish();return;}}else{later(()=>{g.open=[];persist();render();},900);}}
 }else if(id==='what-changed'&&g.phase==='answer'){feedback(g.trials[g.round].after[k]===g.trials[g.round].answer,g.trials[g.round].answer);return;}
 else if(id==='sequence-memory'&&g.phase==='input'){
  const seq=g.sequences[g.round];g.input.push(k);if(k!==seq[g.input.length-1]){feedback(false,null);return;}if(g.input.length===seq.length){feedback(true,null);return;}
 }else if(id==='mental-math'){feedback(k===g.questions[g.round].answer,g.questions[g.round].answer);return;}
 else if(id==='pipes') {g.tiles[k]=rotate(g.tiles[k]);g.moves++;if(pipeSolved(g.tiles,g.n)){finish();return;}}
 persist();render();if(id==='sequence-memory'&&g.phase==='input'){const pad=area.querySelector(`[data-value="${k}"]`);pad?.classList.add('flash');later(()=>pad?.classList.remove('flash'),180);}
}
area.addEventListener('click',e=>{const b=e.target.closest('[data-action]');if(!b||b.disabled)return;const a=b.dataset.action,k=Number(b.dataset.value);
 if(a==='share'){share();return;}if(a==='random'){const others=ids.filter(x=>x!==id);location.href=`/${lang}/${others[Math.floor(Math.random()*others.length)]}/`;return;}
 if(a==='start'||a==='reset'){start();return;}if(a==='restore'){g=structuredClone(saved);level=g.level;levelSelect.value=String(level);g.paused=false;if(id==='matching-pairs'&&g.open.length===2)g.open=[];if(id==='sequence-memory'&&!g.feedback){g.phase='watch';g.input=[];}render();scheduleAdvance();return;}
 if(a==='pause'){pause();return;}if(a==='resume'){resume();return;}if(a==='next'){next();return;}
 if(!g||g.paused||g.status!=='playing')return;
 if(a==='mine-tool'){g.tool=b.dataset.tool;persist();render();return;}
 if(a==='pick'){pick(k);return;}
 if(a==='ready'){g.phase='answer';persist();render();area.querySelector('[data-action=pick]')?.focus();return;}
 if(a==='position'){g.position=k;persist();render();return;}
 if(a==='symbol'){g.guess[g.position]=k;g.position=(g.position+1)%g.secret.length;persist();render();return;}
 if(a==='clear'){g.guess.fill(null);g.position=0;persist();render();return;}
 if(a==='check'&&!g.guess.includes(null)){const f=codeFeedback(g.secret,g.guess);g.history.push({guess:[...g.guess],...f});if(f.exact===g.secret.length){finish();return;}if(g.history.length===8){finish(false);return;}g.guess.fill(null);g.position=0;persist();render();area.querySelector('[data-action=position]')?.focus();return;}
 if(a==='hint'){const k=g.tiles.findIndex((v,i)=>v!==g.solution[i]);if(k>=0){g.tiles[k]=g.solution[k];g.hints++;if(pipeSolved(g.tiles,g.n)){finish();return;}persist();render();}}
});
area.addEventListener('contextmenu',e=>{const b=e.target.closest('[data-action=pick]');if(id==='minesweeper'&&g?.status==='playing'&&!g.paused&&b){e.preventDefault();flagMine(g,Number(b.dataset.value));persist();render();}});
levelSelect.addEventListener('change',()=>{level=Number(levelSelect.value);const d=load();d.settings.level=level;save(d);render();});
document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
document.querySelector('.game-help')?.addEventListener('toggle',e=>{if(e.target.open)pause();});
window.addEventListener('pagehide',persist);
window.addEventListener('storage',e=>{if(e.key==='biuno:v1')updateBest();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&g?.status==='playing'){e.preventDefault();g.paused?resume():pause();}});
render();
