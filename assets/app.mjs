import {i18n,ids,languages,categories} from './i18n.mjs';
import {dailyKey,dailyGames} from './engine.mjs';
import {heroes} from './art.mjs';
import {load,save,fresh,valid,canSave} from './storage.mjs';
const lang=document.documentElement.lang,t=i18n[lang]||i18n.en;
const $=s=>document.querySelector(s);
const data=load();save(data);
$('#language')?.addEventListener('change',e=>{location.href=e.target.value;});

// ── theme: explicit choice is stored; otherwise follow the system ──
const root=document.documentElement,dark=matchMedia('(prefers-color-scheme:dark)');
const setTheme=(v,save)=>{root.dataset.theme=v;if(save){try{localStorage.setItem('biuno:theme',v);}catch{}}document.querySelector('meta[name=theme-color]')?.setAttribute('content',v==='dark'?'#0d1020':'#2444ac');};
setTheme(root.dataset.theme==='dark'?'dark':'light',false);
dark.addEventListener?.('change',e=>{let stored=null;try{stored=localStorage.getItem('biuno:theme');}catch{}if(!stored)setTheme(e.matches?'dark':'light',false);});
$('#theme')?.addEventListener('click',e=>{setTheme(root.dataset.theme==='dark'?'light':'dark',true);const b=e.currentTarget;b.classList.remove('spin-once');void b.offsetWidth;b.classList.add('spin-once');});
// ── header: shadow once scrolled; the logo hops now and then ──
addEventListener('scroll',()=>$('#hdr')?.classList.toggle('stuck',scrollY>8),{passive:true});
(function logoPlay(){
 const parts=[...document.querySelectorAll('.wordmark .l, .wordmark .dot')];
 if(!parts.length||matchMedia('(prefers-reduced-motion:reduce)').matches)return;
 const hop=()=>{if(!document.hidden&&!document.querySelector('.wordmark:hover')){const el=parts[Math.random()<.3?parts.length-1:Math.floor(Math.random()*(parts.length-1))];el.classList.remove('hop');void el.offsetWidth;el.classList.add('hop');}setTimeout(hop,5500+Math.random()*6500);};
 setTimeout(hop,2800);
})();
let noticeTimer;
export function notify(message,undo){const n=$('#notice');if(!n)return;n.textContent=message;n.hidden=false;clearTimeout(noticeTimer);if(undo){const b=document.createElement('button');b.className='text-button';b.textContent=t.undo;b.onclick=()=>{undo();n.hidden=true;};n.append(b);}noticeTimer=setTimeout(()=>n.hidden=true,undo?12000:6000);}
if(!canSave())notify(t.saveUnavailable);
function applyFilter(c){document.querySelectorAll('[data-filter]').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.filter===c)));document.querySelectorAll('[data-category]').forEach(x=>x.hidden=c!=='all'&&c!==x.dataset.category);document.querySelectorAll('.main-nav a').forEach(a=>{const on=a.dataset.cat?a.dataset.cat===c:c==='all';if(document.body.dataset.page==='home'){if(on)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');}});}
document.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>{applyFilter(b.dataset.filter);history.replaceState(null,'',b.dataset.filter==='all'?location.pathname:'#'+b.dataset.filter);}));
if(document.body.dataset.page==='home'){
 const fromHash=()=>{const h=location.hash.slice(1);applyFilter(['memory','logic','numbers'].includes(h)?h:'all');};
 fromHash();addEventListener('hashchange',fromHash);
}
const day=dailyKey();
if($('#daily-games')){
 const picks=dailyGames(day),done=picks.map(i=>Boolean(data.daily[`${day}:${ids[i]}`])),n=done.filter(Boolean).length,link=i=>`/${lang}/${ids[i]}/?daily=${day}`;
 $('#daily-games').innerHTML=picks.map((i,k)=>`<a class="dh-game ${done[k]?'done':''}" style="--k:${k}" href="${link(i)}"><span class="dh-emoji" aria-hidden="true">${heroes[i]}</span><span class="dh-name"><strong>${t.names[i]}</strong><small>${done[k]?t.dailyDone:t[categories[i]]}</small></span><span class="dh-check" aria-hidden="true">✓</span></a>`).join('');
 const nextIdx=done.indexOf(false),go=$('#daily-start');
 go.href=link(picks[nextIdx<0?0:nextIdx]);go.textContent=n===0?t.dailyStart:n<picks.length?t.dailyContinue:t.dailyAllDone;
 $('#daily-count').textContent=t.dailyCount.replace('{n}',n);
}
function renderChart(){
 const root=$('#progress-chart');if(!root)return;
 const hist=(load().history||[]).slice(-80),topics=['memory','logic','numbers'];
 if(hist.length<3){root.innerHTML=`<section class="chart-card"><h2>${t.chartTitle}</h2><p class="chart-text">${t.chartText}</p><p class="chart-empty">${t.chartEmpty}</p></section>`;return;}
 const W=640,H=260,L=40,R=16,T=16,B=30,x=i=>L+(hist.length>1?i*(W-L-R)/(hist.length-1):0),y=v=>T+(100-v)*(H-T-B)/100;
 const series=topics.map(c=>{const pts=hist.map((h,i)=>({h,i})).filter(o=>categories[ids.indexOf(o.h.id)]===c);return {c,pts:pts.map((o,j)=>{const w=pts.slice(Math.max(0,j-2),j+1);return {i:o.i,p:o.h.p,avg:w.reduce((s,q)=>s+q.h.p,0)/w.length,h:o.h};})};});
 const grid=[0,25,50,75,100].map(v=>`<line x1="${L}" x2="${W-R}" y1="${y(v)}" y2="${y(v)}" class="grid"/><text x="${L-8}" y="${y(v)+4}" class="axis" text-anchor="end">${v}%</text>`).join('');
 const fmt=ts=>new Date(ts).toLocaleDateString(t.dayFormat,{day:'numeric',month:'short'});
 const lines=series.filter(s=>s.pts.length).map(s=>`<g class="series s-${s.c}">${s.pts.length>1?`<path pathLength="1" d="${s.pts.map((p,j)=>`${j?'L':'M'}${x(p.i).toFixed(1)} ${y(p.avg).toFixed(1)}`).join(' ')}"/>`:''}${s.pts.map(p=>`<circle cx="${x(p.i).toFixed(1)}" cy="${y(p.p).toFixed(1)}" r="3.5"><title>${t.names[ids.indexOf(p.h.id)]} · ${p.p}% · ${fmt(p.h.t)}</title></circle>`).join('')}</g>`).join('');
 const cards=series.map(s=>{const last=s.pts.slice(-5),prev=s.pts.slice(-10,-5),avg=last.length?Math.round(last.reduce((a,q)=>a+q.p,0)/last.length):null,pa=prev.length?prev.reduce((a,q)=>a+q.p,0)/prev.length:null,d=avg!==null&&pa!==null?avg-pa:0,trend=pa===null?'':d>3?`<b class="up">↗ ${t.trendUp}</b>`:d<-3?`<b class="down">↘ ${t.trendDown}</b>`:`<b>→ ${t.trendFlat}</b>`;return `<div class="topic s-${s.c}"><span class="topic-name"><i></i>${t[s.c]}</span><strong>${avg===null?'—':avg+'%'}</strong><small>${t.topicAvg} · ${s.pts.length} ${t.rounds}</small>${trend}</div>`;}).join('');
 root.innerHTML=`<section class="chart-card"><h2>${t.chartTitle}</h2><p class="chart-text">${t.chartText}</p><div class="topics">${cards}</div><svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${t.chartTitle}">${grid}<text x="${L}" y="${H-8}" class="axis">${fmt(hist[0].t)}</text><text x="${W-R}" y="${H-8}" class="axis" text-anchor="end">${fmt(hist[hist.length-1].t)}</text>${lines}</svg></section>`;
}
function renderProgress(){
 renderChart();
 const root=$('#progress-content');if(!root)return;
 const records=Object.entries(load().records);const played=records.reduce((s,[,r])=>s+r.played,0),wins=records.reduce((s,[,r])=>s+r.wins,0);
 root.innerHTML=played?`<div class="summary-stats"><div><strong>${played.toLocaleString(lang)}</strong><span>${t.played}</span></div><div><strong>${wins.toLocaleString(lang)}</strong><span>${t.wins}</span></div></div><table class="progress-table"><thead><tr><th scope="col">${t.gameLabel}</th><th scope="col">${t.difficulty}</th><th scope="col">${t.personal}</th><th scope="col" class="last-column">${t.last}</th></tr></thead><tbody>${records.sort((a,b)=>b[1].last.localeCompare(a[1].last)).map(([key,r])=>{const [id,level]=key.split(':');return `<tr><td><a href="/${lang}/${id}/">${t.names[ids.indexOf(id)]}</a></td><td>${t.levels[Number(level)]}</td><td>${r.best.toLocaleString(lang)}</td><td class="last-column">${new Date(r.last).toLocaleDateString(t.dayFormat)}</td></tr>`;}).join('')}</tbody></table>`:`<div class="empty-progress"><h2>${t.empty}</h2><p>${t.emptyText}</p><a class="button" href="/${lang}/">${t.games}</a></div>`;
}
renderProgress();
$('#export')?.addEventListener('click',()=>{const url=URL.createObjectURL(new Blob([JSON.stringify({...load(),sessions:{}},null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=`biuno-progress-${day}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
$('#import')?.addEventListener('change',async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>500000)throw Error();const incoming=JSON.parse(await file.text());if(!valid(incoming))throw Error();const old=structuredClone(load());save({version:1,settings:{level:incoming.settings.level},records:incoming.records,daily:{},sessions:{},history:Array.isArray(incoming.history)?incoming.history.filter(h=>h&&typeof h.id==='string'&&Number.isFinite(h.t)&&Number.isFinite(h.p)).slice(-400):[]});renderProgress();notify(t.imported,()=>{save(old);renderProgress();});}catch{notify(t.importError);}e.target.value='';});
$('#clear-data')?.addEventListener('click',()=>{const old=structuredClone(load());save(fresh());renderProgress();notify(t.removed,()=>{save(old);renderProgress();});});
if('serviceWorker'in navigator){let controlled=Boolean(navigator.serviceWorker.controller),refreshing=false;navigator.serviceWorker.addEventListener('controllerchange',()=>{if(controlled&&!refreshing){refreshing=true;location.reload();}controlled=true;});window.addEventListener('load',()=>{navigator.serviceWorker.register('/sw.js').catch(()=>{});});}
