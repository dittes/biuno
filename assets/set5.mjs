// Four more games: water-sort, hanoi, takuzu, mancala.
const mix=(a,random)=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
const coord=(g,t,k)=>`${t.row} ${Math.floor(k/g.n)+1}, ${t.column} ${k%g.n+1}`;

// ───────── Water Sort ─────────
// tubes[k] lists colours from the bottom to the top. Four units fill a tube.
export const WCAP=4;
const WSYM=['●','▲','■','◆','★','♥','✚','⬟'];
const wTop=tb=>tb[tb.length-1];
const wUniform=tb=>tb.length>0&&tb.every(v=>v===tb[0]);
const wFull=tb=>tb.length===WCAP&&wUniform(tb);
export const waterSolved=tubes=>tubes.every(tb=>!tb.length||wFull(tb));
export function waterRun(tb){let n=0;for(let i=tb.length-1;i>=0&&tb[i]===tb[tb.length-1];i--)n++;return n;}
export function waterCan(tubes,i,j){
 if(i===j)return false;const a=tubes[i],b=tubes[j];
 return a.length>0&&b.length<WCAP&&(!b.length||wTop(b)===wTop(a));
}
const waterAny=tubes=>tubes.some((_,i)=>tubes.some((__,j)=>waterCan(tubes,i,j)&&!(tubes[j].length===0&&wUniform(tubes[i]))));
function waterApply(tubes,i,j){
 const next=tubes.map(tb=>[...tb]),n=Math.min(waterRun(next[i]),WCAP-next[j].length);
 for(let k=0;k<n;k++)next[j].push(next[i].pop());return {next,n};
}
// Weighted best-first search. It gives a sensible "par" and proves the board can be solved.
function waterSolve(start){
 const key=s=>s.map(tb=>tb.join('')).sort().join('|');
 const h=s=>s.reduce((sum,tb)=>{let bad=0,ok=true;tb.forEach((v,k)=>{if(v!==tb[0])ok=false;if(!ok)bad++;});return sum+bad;},0);
 const heap=[];
 const push=n=>{heap.push(n);let i=heap.length-1;while(i>0){const p=(i-1)>>1;if(heap[p].f<=heap[i].f)break;[heap[p],heap[i]]=[heap[i],heap[p]];i=p;}};
 const pop=()=>{const top=heap[0],last=heap.pop();if(heap.length){heap[0]=last;let i=0;for(;;){let m=i;const l=i*2+1,r=l+1;if(l<heap.length&&heap[l].f<heap[m].f)m=l;if(r<heap.length&&heap[r].f<heap[m].f)m=r;if(m===i)break;[heap[m],heap[i]]=[heap[i],heap[m]];i=m;}}return top;};
 const seen=new Set([key(start)]);push({s:start,d:0,f:h(start)*2});
 for(let steps=0;heap.length&&steps<9000;steps++){
  const {s,d}=pop();if(waterSolved(s))return d;
  for(let i=0;i<s.length;i++)for(let j=0;j<s.length;j++){
   if(!waterCan(s,i,j)||(s[j].length===0&&wUniform(s[i])))continue;
   const {next}=waterApply(s,i,j),k=key(next);if(seen.has(k))continue;seen.add(k);
   push({s:next,d:d+1,f:d+1+h(next)*2});
  }
 }
 return 0;
}
export function waterNew(level,random){
 const c=[4,6,8][level];let tubes=null,par=0;
 for(let tries=0;tries<60&&!par;tries++){
  const units=mix(Array.from({length:c*WCAP},(_,k)=>k%c),random);
  tubes=Array.from({length:c+2},(_,i)=>i<c?units.slice(i*WCAP,(i+1)*WCAP):[]);
  if(tubes.some(tb=>wFull(tb)))continue;
  par=waterSolve(tubes);
 }
 if(!par)par=c*3;
 return {tubes,cap:WCAP,colours:c,moves:0,sel:-1,history:[],par,outcome:null,lastTo:-1};
}
export function waterClick(g,k){
 if(g.outcome||k<0||k>=g.tubes.length)return {ok:false};
 if(g.sel<0){if(!g.tubes[k].length||wFull(g.tubes[k]))return {ok:false};g.sel=k;return {ok:true,moved:false};}
 if(g.sel===k){g.sel=-1;return {ok:true,moved:false};}
 if(waterCan(g.tubes,g.sel,k)){
  g.history.push(g.tubes.map(tb=>[...tb]));if(g.history.length>300)g.history.shift();
  const {next,n}=waterApply(g.tubes,g.sel,k);g.tubes=next;g.moves++;g.lastTo=k;g.sel=-1;
  if(waterSolved(g.tubes))g.outcome='win';else if(!waterAny(g.tubes))g.outcome='loss';
  return {ok:true,moved:true,count:n};
 }
 if(g.tubes[k].length&&!wFull(g.tubes[k])){g.sel=k;return {ok:true,moved:false,bad:true};}
 g.sel=-1;return {ok:false,bad:true};
}
export function waterUndo(g){if(!g.history.length||g.outcome)return false;g.tubes=g.history.pop();g.moves=Math.max(0,g.moves-1);g.sel=-1;g.lastTo=-1;return true;}
const waterDone=g=>g.tubes.filter(wFull).length;
export const waterScore=g=>g.outcome==='win'?Math.max(100,1200-Math.max(0,g.moves-g.par)*15):Math.round(300*waterDone(g)/g.colours);
export const waterProgress=g=>waterDone(g)/g.colours;
export const waterStats=(g,t)=>`<span>${t.moves}: <strong>${g.moves}</strong></span><span>${t.waterDone}: <strong>${waterDone(g)} / ${g.colours}</strong></span>`;
export function waterBoard(g,t,preview=false){
 const done=Boolean(g.outcome)||preview;
 return `<div class="ws-board" style="--tubes:${g.tubes.length}">${g.tubes.map((tb,k)=>`<button type="button" class="ws-tube ${k===g.sel?'sel':''} ${wFull(tb)?'full':''} ${k===g.lastTo&&!preview?'poured':''}" data-action="pick" data-value="${k}" data-focus="pick-${k}" aria-label="${t.tube} ${k+1}: ${tb.length?tb.map(v=>t.waterColours[v]).join(', '):t.empty}" ${done?'disabled':''}>${tb.map(v=>`<i class="ws-unit w${v}"><b aria-hidden="true">${WSYM[v]}</b></i>`).join('')}</button>`).join('')}</div>${preview?'':`<p class="board-note">${t.waterNote}</p>`}`;
}

// ───────── Tower of Hanoi ─────────
// pegs[k] lists discs from the bottom to the top; a bigger number is a bigger disc.
export function hanoiNew(level){
 const n=[3,5,6][level];
 return {n,pegs:[Array.from({length:n},(_,i)=>n-i),[],[]],moves:0,par:2**n-1,sel:-1,history:[],outcome:null,lastTo:-1};
}
export function hanoiClick(g,k){
 if(g.outcome||k<0||k>2)return {ok:false};
 if(g.sel<0){if(!g.pegs[k].length)return {ok:false};g.sel=k;return {ok:true,moved:false};}
 if(g.sel===k){g.sel=-1;return {ok:true,moved:false};}
 const disc=g.pegs[g.sel][g.pegs[g.sel].length-1],top=g.pegs[k][g.pegs[k].length-1];
 if(!top||disc<top){
  g.history.push(g.pegs.map(p=>[...p]));if(g.history.length>400)g.history.shift();
  g.pegs[g.sel].pop();g.pegs[k].push(disc);g.moves++;g.lastTo=k;g.sel=-1;
  if(g.pegs[2].length===g.n)g.outcome='win';
  return {ok:true,moved:true};
 }
 if(g.pegs[k].length){g.sel=k;return {ok:true,moved:false,bad:true};}
 return {ok:false,bad:true};
}
export function hanoiUndo(g){if(!g.history.length||g.outcome)return false;g.pegs=g.history.pop();g.moves=Math.max(0,g.moves-1);g.sel=-1;g.lastTo=-1;return true;}
export const hanoiScore=g=>g.outcome==='win'?Math.max(100,Math.round(1200*g.par/Math.max(g.par,g.moves))):0;
export const hanoiProgress=g=>g.pegs[2].length/g.n;
export const hanoiStats=(g,t)=>`<span>${t.moves}: <strong>${g.moves}</strong></span><span>${t.hanoiPar}: <strong>${g.par}</strong></span>`;
export function hanoiBoard(g,t,preview=false){
 const done=Boolean(g.outcome)||preview;
 return `<div class="hn-board">${g.pegs.map((p,k)=>`<button type="button" class="hn-peg ${k===g.sel?'sel':''} ${k===g.lastTo&&!preview?'poured':''} ${k===2?'goal':''}" data-action="pick" data-value="${k}" data-focus="pick-${k}" aria-label="${t.hanoiPeg} ${k+1}${k===2?` (${t.hanoiGoal})`:''}: ${p.length?p.map(d=>d).join(', '):t.empty}" ${done?'disabled':''}><span class="hn-rod" aria-hidden="true"></span>${p.map((d,i)=>`<i class="hn-disc ${k===g.lastTo&&i===p.length-1&&!preview?'drop':''}" style="--w:${28+d*(66/g.n)}%;--h:${Math.round((d-1)*300/g.n+200)}"></i>`).join('')}</button>`).join('')}</div>${preview?'':`<p class="board-note">${t.hanoiNote}</p>`}`;
}

// ───────── Takuzu ─────────
// cells: 0 empty, 1 circle, 2 diamond. Each row and column holds equal numbers of both,
// never three alike in a row, and no two rows (or columns) are identical.
function tkLine(g,n,cells,start,step){const out=[];for(let i=0;i<n;i++)out.push(cells[start+i*step]);return out;}
export function takuzuBad(g){
 const n=g.n,bad=new Set(),lines=[];
 for(let i=0;i<n;i++){lines.push({cells:tkLine(g,n,g.cells,i*n,1),idx:Array.from({length:n},(_,j)=>i*n+j)});lines.push({cells:tkLine(g,n,g.cells,i,n),idx:Array.from({length:n},(_,j)=>j*n+i)});}
 for(const {cells,idx} of lines){
  for(let i=0;i+2<n;i++)if(cells[i]&&cells[i]===cells[i+1]&&cells[i]===cells[i+2])[i,i+1,i+2].forEach(j=>bad.add(idx[j]));
  for(const v of [1,2])if(cells.filter(x=>x===v).length>n/2)cells.forEach((x,j)=>{if(x===v)bad.add(idx[j]);});
 }
 for(let a=0;a<n;a++)for(let b=a+1;b<n;b++){
  const ra=lines[a*2],rb=lines[b*2];if(ra.cells.every(Boolean)&&ra.cells.join()===rb.cells.join())[...ra.idx,...rb.idx].forEach(j=>bad.add(j));
  const ca=lines[a*2+1],cb=lines[b*2+1];if(ca.cells.every(Boolean)&&ca.cells.join()===cb.cells.join())[...ca.idx,...cb.idx].forEach(j=>bad.add(j));
 }
 return bad;
}
function tkFill(n,fixed,random,limit){
 const cells=[...fixed];let found=0,first=null;
 const half=n/2;
 function okAt(k){
  const r=Math.floor(k/n),c=k%n,v=cells[k];
  if(c>=2&&cells[k-1]===v&&cells[k-2]===v)return false;
  if(r>=2&&cells[k-n]===v&&cells[k-2*n]===v)return false;
  let rc=0,cc=0;for(let i=0;i<=c;i++)if(cells[r*n+i]===v)rc++;for(let i=0;i<=r;i++)if(cells[i*n+c]===v)cc++;
  if(rc>half||cc>half)return false;
  if(c===n-1){for(let rr=0;rr<r;rr++){let same=true;for(let i=0;i<n&&same;i++)if(cells[rr*n+i]!==cells[r*n+i])same=false;if(same)return false;}}
  if(r===n-1){for(let cc2=0;cc2<c;cc2++){let same=true;for(let i=0;i<n&&same;i++)if(cells[i*n+cc2]!==cells[i*n+c])same=false;if(same)return false;}}
  return true;
 }
 function go(k){
  if(found>=limit)return;
  if(k===n*n){found++;if(!first)first=[...cells];return;}
  if(fixed[k]){if(okAt(k))go(k+1);return;}
  const order=random&&random()<.5?[2,1]:[1,2];
  for(const v of order){cells[k]=v;if(okAt(k))go(k+1);if(found>=limit)break;}
  cells[k]=0;
 }
 go(0);return {found,first};
}
export function takuzuNew(level,random){
 const n=[4,6,8][level],none=Array(n*n).fill(0);
 const solution=tkFill(n,none,random,1).first,cells=[...solution],order=mix([...cells.keys()],random);
 const target=Math.round(n*n*[.5,.55,.6][level]);let blanks=0;
 for(const k of order){
  if(blanks>=target)break;
  const keep=cells[k];cells[k]=0;
  if(tkFill(n,cells,null,2).found===1)blanks++;else cells[k]=keep;
 }
 return {n,solution,given:cells.map(v=>v?1:0),cells,moves:0,outcome:null,lastSet:-1};
}
export function takuzuSet(g,k,v){
 if(g.outcome||k<0||k>=g.cells.length||g.given[k]||g.cells[k]===v)return false;
 g.cells[k]=v;g.moves++;g.lastSet=k;
 if(g.cells.every((x,i)=>x===g.solution[i]))g.outcome='win';
 return true;
}
const tkBlanks=g=>g.given.filter(v=>!v).length;
export const takuzuScore=g=>g.outcome==='win'?Math.max(200,1200-Math.max(0,g.moves-tkBlanks(g)*2)*8):0;
export const takuzuProgress=g=>{const b=tkBlanks(g);return b?g.cells.filter((v,i)=>v&&!g.given[i]).length/b:1;};
export const takuzuStats=(g,t)=>`<span>${t.moves}: <strong>${g.moves}</strong></span><span>${t.tkLeft}: <strong>${g.cells.filter(v=>!v).length}</strong></span>`;
export function takuzuBoard(g,t,preview=false){
 const done=Boolean(g.outcome)||preview,bad=done?new Set():takuzuBad(g);
 return `<div class="tk-board" style="--n:${g.n}">${g.cells.map((v,k)=>`<button type="button" class="tk-cell ${g.given[k]?'given':''} ${bad.has(k)?'bad':''} ${k===g.lastSet&&!preview?'set':''}" style="--i:${k}" data-action="pick" data-value="${k}" data-focus="pick-${k}" aria-label="${coord(g,t,k)}: ${v===1?t.tkA:v===2?t.tkB:t.empty}${g.given[k]?`, ${t.fixed}`:''}${bad.has(k)?`, ${t.tkClash}`:''}" ${done||g.given[k]?'disabled':''}>${v?`<i class="tk-s ${v===1?'a':'b'}"></i>`:''}</button>`).join('')}</div>${preview?'':`<p class="board-note">${t.takuzuNote}</p>`}`;
}

// ───────── Mancala (Kalah, 6 pits, 4 seeds) ─────────
// pits 0–5 are yours (left to right), 6 is your store, 7–12 are the computer's, 13 its store.
export const mcNew=()=>({pits:[4,4,4,4,4,4,0,4,4,4,4,4,4,0],turn:'X',outcome:null,moves:0,note:'',last:-1});
const mcSide=i=>i<6?'X':'O';
export const mcMoves=(pits,side)=>(side==='X'?[0,1,2,3,4,5]:[7,8,9,10,11,12]).filter(i=>pits[i]>0);
export function mcStep(pits,i,side){
 const b=[...pits],own=side==='X'?6:13,skip=side==='X'?13:6;let n=b[i],k=i;b[i]=0;
 while(n>0){k=(k+1)%14;if(k===skip)continue;b[k]++;n--;}
 const extra=k===own;let cap=0;
 if(!extra&&b[k]===1&&mcSide(k)===side&&k!==6&&k!==13&&b[12-k]>0){cap=b[12-k]+1;b[own]+=cap;b[k]=0;b[12-k]=0;}
 let over=false;
 const xs=b.slice(0,6).reduce((a,v)=>a+v,0),os=b.slice(7,13).reduce((a,v)=>a+v,0);
 if(!xs||!os){over=true;b[6]+=xs;b[13]+=os;for(let q=0;q<6;q++){b[q]=0;b[q+7]=0;}}
 return {pits:b,last:k,extra,cap,over};
}
export function mcPlay(g,i,side){
 if(g.outcome||g.turn!==side||!mcMoves(g.pits,side).includes(i))return false;
 const r=mcStep(g.pits,i,side);g.pits=r.pits;g.last=r.last;if(side==='X')g.moves++;
 g.note=r.cap?'capture':r.extra&&!r.over?'again':'';g.noteSide=side;
 if(r.over){const x=g.pits[6],o=g.pits[13];g.outcome=x>o?'win':x<o?'loss':'draw';}
 else g.turn=r.extra?side:side==='X'?'O':'X';
 return true;
}
function mcSearch(pits,side,depth,alpha,beta){
 const moves=mcMoves(pits,side);
 if(!depth||!moves.length)return pits[13]-pits[6]+.1*(pits.slice(7,13).reduce((a,v)=>a+v,0)-pits.slice(0,6).reduce((a,v)=>a+v,0));
 const order=side==='O'?[...moves].reverse():[...moves].reverse();
 if(side==='O'){let best=-Infinity;for(const i of order){const r=mcStep(pits,i,'O'),v=r.over?r.pits[13]-r.pits[6]:mcSearch(r.pits,r.extra?'O':'X',depth-1,alpha,beta);best=Math.max(best,v);alpha=Math.max(alpha,best);if(alpha>=beta)break;}return best;}
 let best=Infinity;for(const i of order){const r=mcStep(pits,i,'X'),v=r.over?r.pits[13]-r.pits[6]:mcSearch(r.pits,r.extra?'X':'O',depth-1,alpha,beta);best=Math.min(best,v);beta=Math.min(beta,best);if(alpha>=beta)break;}return best;
}
export function mcComputer(g,level,random){
 const moves=mcMoves(g.pits,'O');if(!moves.length)return -1;
 if(level===0)return moves[Math.floor(random()*moves.length)];
 let best=moves[0],bv=-Infinity;
 for(const i of moves){
  const r=mcStep(g.pits,i,'O');let v;
  if(level===1)v=(r.extra?6:0)+r.cap*1.5+(r.pits[13]-g.pits[13])+random()*1.2;
  else v=(r.over?(r.pits[13]-r.pits[6])*10:mcSearch(r.pits,r.extra?'O':'X',7,-Infinity,Infinity))+random()*.01;
  if(v>bv){bv=v;best=i;}
 }
 return best;
}
export function mcScore(g){if(g.outcome==='draw')return 500;if(g.outcome!=='win')return 0;return Math.min(1400,800+(g.pits[6]-g.pits[13])*25);}
export const mcProgress=g=>(g.pits[6]+g.pits[13])/48;
export const mcStats=(g,t)=>`<span>${t.you}: <strong>${g.pits[6]}</strong></span><span>${t.computer}: <strong>${g.pits[13]}</strong></span>`;
export function mcBoard(g,t,preview=false){
 const done=Boolean(g.outcome)||preview,mine=!done&&g.turn==='X';
 const pit=(i,own)=>{const n=g.pits[i],can=own&&mine&&n>0;
  return `<button type="button" class="mc-pit ${own?'mine':'theirs'} ${i===g.last&&!preview?'last':''} ${can?'can':''}" data-action="pick" data-value="${i}" data-focus="pick-${i}" aria-label="${own?`${t.mcPit} ${i+1}`:`${t.computer}, ${t.mcPit} ${i-6}`}: ${n}" ${can?'':'disabled'}><span class="mc-seeds" aria-hidden="true">${Array.from({length:Math.min(n,14)},(_,s)=>`<i style="--s:${s}"></i>`).join('')}</span><b class="mc-n" aria-hidden="true">${n}</b></button>`;};
 const store=(i,own)=>`<div class="mc-store ${own?'mine':'theirs'} ${i===g.last&&!preview?'last':''}" role="img" aria-label="${own?t.you:t.computer}: ${g.pits[i]}"><span class="mc-label" aria-hidden="true">${own?t.you:t.computer}</span><b aria-hidden="true">${g.pits[i]}</b></div>`;
 const msg=g.outcome?'':g.turn==='X'?(g.note==='again'&&g.noteSide==='X'?t.mcAgain:g.note==='capture'&&g.noteSide==='O'?t.mcLost:t.yourTurn):(g.note==='again'&&g.noteSide==='O'?t.mcCompAgain:t.computerTurn);
 return `<p class="game-message" role="status">${preview?'':msg}</p><div class="mc-board">${store(13,false)}<div class="mc-pits"><div class="mc-row">${[12,11,10,9,8,7].map(i=>pit(i,false)).join('')}</div><div class="mc-row">${[0,1,2,3,4,5].map(i=>pit(i,true)).join('')}</div></div>${store(6,true)}</div>${preview?'':`<p class="board-note">${t.mancalaNote}</p>`}`;
}
