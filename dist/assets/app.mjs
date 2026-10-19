import {i18n,ids,languages,categories} from './i18n.mjs';
import {dailyKey,dailyGames} from './engine.mjs';
import {load,save,fresh,valid,canSave} from './storage.mjs';
const lang=document.documentElement.lang,t=i18n[lang]||i18n.en;
const $=s=>document.querySelector(s);
const data=load();save(data);
$('#language')?.addEventListener('change',e=>{location.href=e.target.value;});
let noticeTimer;
export function notify(message,undo){const n=$('#notice');if(!n)return;n.textContent=message;n.hidden=false;clearTimeout(noticeTimer);if(undo){const b=document.createElement('button');b.className='text-button';b.textContent=t.undo;b.onclick=()=>{undo();n.hidden=true;};n.append(b);}noticeTimer=setTimeout(()=>n.hidden=true,undo?12000:6000);}
if(!canSave())notify(t.saveUnavailable);
document.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('[data-filter]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));document.querySelectorAll('[data-category]').forEach(c=>c.hidden=b.dataset.filter!=='all'&&b.dataset.filter!==c.dataset.category);}));
const day=dailyKey();
if($('#daily-games')){
 $('#daily-date').textContent=new Intl.DateTimeFormat(t.dayFormat,{dateStyle:'long',timeZone:'UTC'}).format(new Date(day+'T12:00:00Z'))+' · UTC';
 $('#daily-games').innerHTML=dailyGames(day).map((i,k)=>`<a class="daily-item" href="/${lang}/${ids[i]}/?daily=${day}"><span aria-hidden="true">${String(k+1).padStart(2,'0')}</span><div><h3>${t.names[i]}</h3><small>${data.daily[`${day}:${ids[i]}`]?t.dailyDone:t[categories[i]]}</small></div><span class="arrow" aria-hidden="true">↗</span></a>`).join('');
}
function renderProgress(){
 const root=$('#progress-content');if(!root)return;
 const records=Object.entries(load().records);const played=records.reduce((s,[,r])=>s+r.played,0),wins=records.reduce((s,[,r])=>s+r.wins,0);
 root.innerHTML=played?`<div class="summary-stats"><div><strong>${played.toLocaleString(lang)}</strong><span>${t.played}</span></div><div><strong>${wins.toLocaleString(lang)}</strong><span>${t.wins}</span></div></div><table class="progress-table"><thead><tr><th scope="col">${t.gameLabel}</th><th scope="col">${t.difficulty}</th><th scope="col">${t.personal}</th><th scope="col" class="last-column">${t.last}</th></tr></thead><tbody>${records.sort((a,b)=>b[1].last.localeCompare(a[1].last)).map(([key,r])=>{const [id,level]=key.split(':');return `<tr><td><a href="/${lang}/${id}/">${t.names[ids.indexOf(id)]}</a></td><td>${t.levels[Number(level)]}</td><td>${r.best.toLocaleString(lang)}</td><td class="last-column">${new Date(r.last).toLocaleDateString(t.dayFormat)}</td></tr>`;}).join('')}</tbody></table>`:`<div class="empty-progress"><h2>${t.empty}</h2><p>${t.emptyText}</p><a class="button" href="/${lang}/">${t.games}</a></div>`;
}
renderProgress();
$('#export')?.addEventListener('click',()=>{const url=URL.createObjectURL(new Blob([JSON.stringify({...load(),sessions:{}},null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=`biuno-progress-${day}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
$('#import')?.addEventListener('change',async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>500000)throw Error();const incoming=JSON.parse(await file.text());if(!valid(incoming))throw Error();const old=structuredClone(load());save({version:1,settings:{level:incoming.settings.level},records:incoming.records,daily:{},sessions:{}});renderProgress();notify(t.imported,()=>{save(old);renderProgress();});}catch{notify(t.importError);}e.target.value='';});
$('#clear-data')?.addEventListener('click',()=>{const old=structuredClone(load());save(fresh());renderProgress();notify(t.removed,()=>{save(old);renderProgress();});});
if('serviceWorker'in navigator){window.addEventListener('load',()=>{navigator.serviceWorker.register('/sw.js').catch(()=>{});});}
