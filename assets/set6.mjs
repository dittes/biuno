// Five more games: sokoban, kenken, gomoku, golf-solitaire, hashi.
import {cardHTML} from './duels2.mjs';
const mix=(a,random)=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
const pick=(a,random)=>a[Math.floor(random()*a.length)];

// ───────── Sokoban ─────────
// Levels are built backwards from a solved board by pulling crates, so every one can be solved.
const DIRS=[[-1,0],[0,1],[1,0],[0,-1]]; // up, right, down, left as [row, column]
const skStep=(n,k,d)=>{const r=Math.floor(k/n)+DIRS[d][0],c=k%n+DIRS[d][1];return r<0||r>=n||c<0||c>=n?-1:r*n+c;};
function skSolve(g,cap=40000){
 const {n,walls,goals}=g,goalSet=new Set(goals),M=n*n,key=(p,b)=>b.slice().sort((x,y)=>x-y).reduce((a,v)=>a*M+v,p);
 const start={p:g.player,b:[...g.boxes],d:0};if(start.b.every(k=>goalSet.has(k)))return 0;
 const seen=new Set([key(start.p,start.b)]);let queue=[start],head=0,expanded=0;
 while(head<queue.length&&expanded<cap){
  const s=queue[head++];expanded++;
  for(let d=0;d<4;d++){
   const np=skStep(n,s.p,d);if(np<0||walls[np])continue;
   let nb=s.b;
   if(s.b.includes(np)){const bn=skStep(n,np,d);if(bn<0||walls[bn]||s.b.includes(bn))continue;nb=s.b.map(x=>x===np?bn:x);}
   const k=key(np,nb);if(seen.has(k))continue;seen.add(k);
   if(nb!==s.b&&nb.every(x=>goalSet.has(x)))return s.d+1;
   queue.push({p:np,b:nb,d:s.d+1});
  }
 }
 return 0;
}
function skDist(g,from,boxes){
 const dist=new Map([[from,0]]),todo=[from];
 for(let h=0;h<todo.length;h++){const k=todo[h];for(let d=0;d<4;d++){const j=skStep(g.n,k,d);if(j>=0&&!g.walls[j]&&!boxes.includes(j)&&!dist.has(j)){dist.set(j,dist.get(k)+1);todo.push(j);}}}
 return dist;
}
export function skNew(level,random){
 const n=[6,7,8][level],count=[2,3,4][level],pullsWanted=[7,11,15][level];
 let best=null;
 for(let attempt=0;attempt<60;attempt++){
  const walls=Array(n*n).fill(false);
  for(let w=Math.round(n*n*[.1,.13,.15][level]);w>0;w--)walls[Math.floor(random()*n*n)]=true;
  const floor=[...walls.keys()].filter(k=>!walls[k]);
  if(floor.length<count*4+2)continue;
  const spots=mix(floor,random),goals=spots.slice(0,count),g={n,walls,goals,boxes:[...goals],player:spots[count],moves:0,pushes:0,history:[],outcome:null,par:0,lastPush:-1};
  let steps=0,pulls=0;
  while(pulls<pullsWanted){
   const dist=skDist(g,g.player,g.boxes),options=[];
   g.boxes.forEach(b=>{for(let d=0;d<4;d++){const p=skStep(n,b,d),q=p<0?-1:skStep(n,p,d);if(p>=0&&q>=0&&dist.has(p)&&!g.walls[q]&&!g.boxes.includes(q)&&!g.boxes.includes(p))options.push({b,p,q,cost:dist.get(p)+1});}});
   if(!options.length)break;
   const o=pick(options,random);g.boxes=g.boxes.map(x=>x===o.b?o.p:x);g.player=o.q;steps+=o.cost;pulls++;
  }
  if(pulls<pullsWanted||g.boxes.some(b=>goals.includes(b)))continue;
  g.par=steps;
  if(!best||g.par>best.par)best=g;
  if(best.par>=[10,18,26][level])break;
 }
 if(best&&best.par>6){const exact=skSolve(best);if(exact)best.par=exact;}
 if(!best){
  const walls=Array(n*n).fill(false),goals=[n+1,n+2].slice(0,count),boxes=[n*2+1,n*2+2].slice(0,count);
  best={n,walls,goals,boxes,player:n*3+3,moves:0,pushes:0,history:[],outcome:null,par:6,lastPush:-1};
 }
 return best;
}
const skHome=g=>g.boxes.filter(b=>g.goals.includes(b)).length;
export function skMove(g,d){
 if(g.outcome)return {ok:false};
 const np=skStep(g.n,g.player,d);if(np<0||g.walls[np])return {ok:false,bad:true};
 const snap={boxes:[...g.boxes],player:g.player,moves:g.moves,pushes:g.pushes};
 let pushed=false;
 if(g.boxes.includes(np)){
  const bn=skStep(g.n,np,d);if(bn<0||g.walls[bn]||g.boxes.includes(bn))return {ok:false,bad:true};
  g.boxes=g.boxes.map(b=>b===np?bn:b);g.pushes++;pushed=true;g.lastPush=bn;
 }else g.lastPush=-1;
 g.history.push(snap);if(g.history.length>600)g.history.shift();
 g.player=np;g.moves++;
 if(skHome(g)===g.boxes.length)g.outcome='win';
 return {ok:true,pushed};
}
export function skClick(g,k){const d=[0,1,2,3].find(i=>skStep(g.n,g.player,i)===k);return d===undefined?{ok:false}:skMove(g,d);}
export function skUndo(g){if(!g.history.length||g.outcome)return false;const s=g.history.pop();Object.assign(g,s,{lastPush:-1});return true;}
export const skScore=g=>g.outcome==='win'?Math.max(200,1200-Math.max(0,g.moves-g.par)*5):0;
export const skProgress=g=>skHome(g)/g.boxes.length;
export const skStats=(g,t)=>`<span>${t.moves}: <strong>${g.moves}</strong></span><span>${t.skHome}: <strong>${skHome(g)} / ${g.boxes.length}</strong></span>`;
export function skBoard(g,t,preview=false){
 const done=Boolean(g.outcome)||preview,near=new Set([0,1,2,3].map(d=>skStep(g.n,g.player,d)));
 const cells=g.walls.map((w,k)=>{
  const box=g.boxes.includes(k),goal=g.goals.includes(k),me=k===g.player;
  const label=w?t.skWall:me?t.skMe:box?`${t.skBox}${goal?`, ${t.skTarget}`:''}`:goal?t.skTarget:t.empty;
  const cls=['sk-cell',w?'wall':'',goal?'goal':'',box?'box':'',box&&goal?'home':'',me?'me':'',k===g.lastPush&&!preview?'pushed':'',!done&&!w&&near.has(k)?'near':''].filter(Boolean).join(' ');
  return `<div class="${cls}" ${!done&&!w&&near.has(k)?`data-action="pick" data-value="${k}"`:''} role="img" aria-label="${label} (${t.row} ${Math.floor(k/g.n)+1}, ${t.column} ${k%g.n+1})">${w?'':box?'<i class="sk-box"></i>':me?'<i class="sk-me"></i>':''}</div>`;
 }).join('');
 const pad=preview?'':`<div class="sk-pad" role="group" aria-label="${t.select}"><button type="button" class="up" data-action="dir" data-value="0" data-focus="dir-0" aria-label="${t.up}" ${done?'disabled':''}>↑</button><button type="button" class="left" data-action="dir" data-value="3" data-focus="dir-3" aria-label="${t.left}" ${done?'disabled':''}>←</button><button type="button" class="down" data-action="dir" data-value="2" data-focus="dir-2" aria-label="${t.down}" ${done?'disabled':''}>↓</button><button type="button" class="right" data-action="dir" data-value="1" data-focus="dir-1" aria-label="${t.right}" ${done?'disabled':''}>→</button></div>`;
 return `<div class="sk-board" style="--n:${g.n}">${cells}</div>${pad}${preview?'':`<p class="board-note">${t.skNote}</p>`}`;
}

// ───────── KenKen ─────────
// A Latin square split into cages. Each cage shows a target and an operation. One-cell cages are given.
const kkOps=[['+','−'],['+','−','×'],['+','−','×','÷']];
function kkCage(vals,level,random){
 if(vals.length===1)return {op:'=',target:vals[0]};
 const ops=kkOps[level];
 if(vals.length===2){
  const [a,b]=[Math.max(...vals),Math.min(...vals)],options=[{op:'+',target:a+b},{op:'−',target:a-b},{op:'×',target:a*b}];
  if(a%b===0)options.push({op:'÷',target:a/b});
  const allowed=options.filter(o=>ops.includes(o.op)&&!(o.op==='−'&&a===b));
  return pick(allowed.length?allowed:[options[0]],random);
 }
 return ops.includes('×')&&random()<.4?{op:'×',target:vals.reduce((p,v)=>p*v,1)}:{op:'+',target:vals.reduce((s,v)=>s+v,0)};
}
function kkOk(cage,vals){
 const full=vals.every(Boolean),vs=vals.filter(Boolean);
 if(cage.op==='+'){const s=vs.reduce((a,v)=>a+v,0);return full?s===cage.target:s<=cage.target;}
 if(cage.op==='×'){const p=vs.reduce((a,v)=>a*v,1);return full?p===cage.target:p<=cage.target&&cage.target%p===0;}
 if(!full)return true;
 if(cage.op==='=')return vals[0]===cage.target;
 const a=Math.max(...vals),b=Math.min(...vals);
 return cage.op==='−'?a-b===cage.target:a/b===cage.target;
}
function kkCount(n,cages,limit=2){
 const cageOf=Array(n*n);cages.forEach((c,i)=>c.cells.forEach(k=>{cageOf[k]=i;}));
 const cells=Array(n*n).fill(0),rowUsed=Array.from({length:n},()=>new Set()),colUsed=Array.from({length:n},()=>new Set());let found=0,nodes=0;
 const go=k=>{
  if(found>=limit||nodes++>400000)return;
  if(k===n*n){found++;return;}
  const r=Math.floor(k/n),c=k%n,cage=cages[cageOf[k]];
  for(let v=1;v<=n;v++){
   if(rowUsed[r].has(v)||colUsed[c].has(v))continue;
   cells[k]=v;
   if(kkOk(cage,cage.cells.map(i=>cells[i]))){rowUsed[r].add(v);colUsed[c].add(v);go(k+1);rowUsed[r].delete(v);colUsed[c].delete(v);}
   cells[k]=0;
  }
 };
 go(0);return nodes>400000?limit:found;
}
function kkConnected(n,cells){
 if(cells.length<2)return true;const set=new Set(cells),seen=new Set([cells[0]]),todo=[cells[0]];
 while(todo.length){const k=todo.pop();for(let d=0;d<4;d++){const j=skStep(n,k,d);if(j>=0&&set.has(j)&&!seen.has(j)){seen.add(j);todo.push(j);}}}
 return seen.size===cells.length;
}
function kkPartition(n,maxSize,random){
 const owner=Array(n*n).fill(-1),groups=[];
 for(const k of mix([...Array(n*n).keys()],random)){
  if(owner[k]>=0)continue;
  const cells=[k],want=2+Math.floor(random()*(maxSize-1));owner[k]=groups.length;
  while(cells.length<want){
   const options=cells.flatMap(c=>[0,1,2,3].map(d=>skStep(n,c,d)).filter(j=>j>=0&&owner[j]<0));
   if(!options.length)break;const j=pick(options,random);owner[j]=groups.length;cells.push(j);
  }
  groups.push(cells);
 }
 return groups;
}
export function kkNew(level,random){
 const n=[4,5,6][level],maxSize=[3,3,4][level],rows=mix([...Array(n).keys()],random),cols=mix([...Array(n).keys()],random),sym=mix(Array.from({length:n},(_,i)=>i+1),random);
 const solution=Array.from({length:n*n},(_,k)=>sym[(rows[Math.floor(k/n)]+cols[k%n])%n]);
 const makeCage=cells=>({cells,...kkCage(cells.map(k=>solution[k]),level,random)});
 let cages=null;
 for(let attempt=0;attempt<30;attempt++){
  cages=kkPartition(n,maxSize,random).map(makeCage);
  if(kkCount(n,cages)===1)break;
  if(attempt===29){
   // Repair: turn one cell of an ambiguous cage into a given until the solution is unique.
   for(let guard=0;guard<n*n&&kkCount(n,cages)>1;guard++){
    const big=cages.map((c,i)=>i).filter(i=>cages[i].cells.length>1);if(!big.length)break;
    const i=pick(big,random),cells=cages[i].cells,leaf=mix(cells,random).find(k=>kkConnected(n,cells.filter(x=>x!==k)));
    const rest=cells.filter(x=>x!==leaf);cages=cages.map((c,j)=>j===i?makeCage(rest):c);cages.push(makeCage([leaf]));
   }
  }
 }
 const given=Array(n*n).fill(0);cages.forEach(c=>{if(c.cells.length===1)given[c.cells[0]]=solution[c.cells[0]];});
 return {n,solution,given,cells:[...given],cages,sel:-1,moves:0,mistakes:0,hints:0,outcome:null,lastSet:-1};
}
export function kkBoard(g,t,preview=false){
 const done=Boolean(g.outcome)||preview,n=g.n,sel=g.sel,cageOf=Array(n*n);g.cages.forEach((c,i)=>c.cells.forEach(k=>{cageOf[k]=i;}));
 const selV=sel>=0?g.cells[sel]:0;
 const badCage=new Set(g.cages.map((c,i)=>kkOk(c,c.cells.map(k=>g.cells[k]))?-1:i));
 const cells=g.cells.map((v,k)=>{
  const r=Math.floor(k/n),c=k%n,cage=g.cages[cageOf[k]],first=Math.min(...cage.cells)===k;
  const same=d=>{const j=skStep(n,k,d);return j>=0&&cageOf[j]===cageOf[k];};
  const dup=v&&(g.cells.some((x,j)=>j!==k&&x===v&&(Math.floor(j/n)===r||j%n===c)));
  const cls=['kk-cell',g.given[k]?'given':'',k===sel?'sel':'',v&&v===selV&&k!==sel?'same':'',dup||badCage.has(cageOf[k])&&cage.cells.every(i=>g.cells[i])?'conflict':'',!same(0)?'bt':'',!same(1)?'br':'',!same(2)?'bb':'',!same(3)?'bl':'',k===g.lastSet&&!preview?'set':''].filter(Boolean).join(' ');
  const label=cage.op==='='?'':`${cage.target}${cage.op}`;
  return `<button type="button" class="${cls}" data-action="cell" data-value="${k}" data-focus="cell-${k}" aria-label="${t.row} ${r+1}, ${t.column} ${c+1}: ${v||t.empty}${g.given[k]?', '+t.given:''}${label&&first?`, ${t.kkCage} ${label}`:''}" ${done||g.given[k]?'disabled':''}>${first&&label?`<small>${label}</small>`:''}<span>${v||''}</span></button>`;
 }).join('');
 const pad=preview?'':`<div class="sd-pad" role="group" aria-label="${t.select}">${Array.from({length:n},(_,i)=>`<button type="button" data-action="digit" data-value="${i+1}" ${done?'disabled':''}>${i+1}</button>`).join('')}<button type="button" class="wide" data-action="erase" ${done?'disabled':''}>⌫ <span>${t.erase}</span></button></div>`;
 return `<div class="kk-board" style="--n:${n}">${cells}</div>${pad}${preview?'':`<p class="board-note">${t.kkNote}</p>`}`;
}

// ───────── Gomoku (9×9, five in a row) ─────────
const GN=9,GD=[[0,1],[1,0],[1,1],[1,-1]];
export const gmNew=()=>({n:GN,board:Array(GN*GN).fill(null),turn:'X',outcome:null,line:[],moves:0,lastMove:-1});
function gmRun(board,k,m,dr,dc){
 const r0=Math.floor(k/GN),c0=k%GN,cells=[k];let open=0;
 for(const s of [1,-1]){let r=r0+dr*s,c=c0+dc*s;while(r>=0&&r<GN&&c>=0&&c<GN&&board[r*GN+c]===m){cells.push(r*GN+c);r+=dr*s;c+=dc*s;}if(r>=0&&r<GN&&c>=0&&c<GN&&!board[r*GN+c])open++;}
 return {len:cells.length,open,cells};
}
export function gmMove(g,k,mark){
 if(g.outcome||g.turn!==mark||k<0||k>=GN*GN||g.board[k])return false;
 g.board[k]=mark;g.moves++;g.lastMove=k;
 for(const [dr,dc] of GD){const run=gmRun(g.board,k,mark,dr,dc);if(run.len>=5){g.line=run.cells;g.outcome=mark==='X'?'win':'loss';return true;}}
 if(g.board.every(Boolean))g.outcome='draw';else g.turn=mark==='X'?'O':'X';
 return true;
}
const gmPoints=(len,open)=>len>=5?100000:len===4?(open===2?10000:open?1000:0):len===3?(open===2?1000:open?100:0):len===2?(open===2?100:open?10:0):(open===2?2:1);
function gmValue(board,k,m){
 const b=[...board];b[k]=m;let s=0;
 for(const [dr,dc] of GD){const run=gmRun(b,k,m,dr,dc);s+=gmPoints(run.len,run.open);}
 return s;
}
export function gmComputer(board,level,random){
 const empty=[...board.keys()].filter(k=>!board[k]);if(!empty.length)return -1;
 if(empty.length===GN*GN)return Math.floor(GN/2)*GN+Math.floor(GN/2);
 const near=empty.filter(k=>{const r=Math.floor(k/GN),c=k%GN;for(let y=-2;y<=2;y++)for(let x=-2;x<=2;x++){const rr=r+y,cc=c+x;if(rr>=0&&rr<GN&&cc>=0&&cc<GN&&board[rr*GN+cc])return true;}return false;});
 const pool=near.length?near:empty;
 const win=pool.find(k=>gmValue(board,k,'O')>=100000);if(win!==undefined&&(level>0||random()<.8))return win;
 const block=pool.find(k=>gmValue(board,k,'X')>=100000);if(block!==undefined&&(level>0||random()<.5))return block;
 const scored=pool.map(k=>({k,v:gmValue(board,k,'O')+gmValue(board,k,'X')*(level===0?.6:.95)+random()*(level===0?900:level===1?25:1)}));
 scored.sort((a,b)=>b.v-a.v);
 if(level<2)return scored[0].k;
 // Hard: look one reply ahead for the strongest few candidates.
 let best=scored[0].k,bv=-Infinity;
 for(const {k,v} of scored.slice(0,8)){
  const b=[...board];b[k]='O';
  const reply=Math.max(0,...[...b.keys()].filter(i=>!b[i]).map(i=>gmValue(b,i,'X')));
  const total=v-reply*.7;if(total>bv){bv=total;best=k;}
 }
 return best;
}
export function gmScore(g){if(g.outcome==='draw')return 500;if(g.outcome!=='win')return 0;return Math.max(300,1500-Math.max(0,g.moves-5)*30);}
export const gmProgress=g=>g.moves/(GN*GN/2);
export const gmStats=(g,t)=>`<span>${t.moves}: <strong>${g.moves}</strong></span><span>${t.you}: <i class="chip-disc gm-x"></i> ${t.computer}: <i class="chip-disc gm-o"></i></span>`;
export function gmBoard(g,t,preview=false){
 const done=Boolean(g.outcome)||preview,msg=g.outcome?'':g.turn==='X'?t.yourTurn:t.computerTurn;
 return `<p class="game-message" role="status">${preview?'':msg}</p><div class="gm-board" style="--n:${g.n}">${g.board.map((v,k)=>`<button type="button" class="gm-cell ${k===g.lastMove&&!preview?'last':''} ${g.line.includes(k)?'win':''}" data-action="pick" data-value="${k}" data-focus="pick-${k}" aria-label="${t.row} ${Math.floor(k/g.n)+1}, ${t.column} ${k%g.n+1}: ${v?(v==='X'?t.you:t.computer):t.empty}" ${done||v||g.turn!=='X'?'disabled':''}>${v?`<i class="gm-stone ${v==='X'?'x':'o'}"></i>`:''}</button>`).join('')}</div>${preview?'':`<p class="board-note">${t.gmNote}</p>`}`;
}

// ───────── Golf Solitaire ─────────
// Card ids run 0–51: rank is id % 13 (0 = ace … 12 = king), suit is floor(id / 13).
const gfNext=(a,b,wrap)=>Math.abs(a-b)===1||(wrap&&Math.abs(a-b)===12);
function gfSolvable(tab,order,wasteRank,wrap,cap=30000){
 const rows=Math.max(...tab.map(c=>c.length))+1,seen=new Set();let nodes=0;
 const go=(lens,si,wr)=>{
  if(lens.every(l=>!l))return true;
  let code=0;for(const l of lens)code=code*rows+l;
  const key=(code*60+si)*13+wr;if(seen.has(key)||nodes++>cap)return false;seen.add(key);
  for(let c=0;c<lens.length;c++){
   if(!lens[c])continue;const rank=tab[c][lens[c]-1]%13;
   if(gfNext(rank,wr,wrap)){lens[c]--;const ok=go(lens,si,rank);lens[c]++;if(ok)return true;}
  }
  return si<order.length&&go(lens,si+1,order[si]%13);
 };
 return go(tab.map(c=>c.length),0,wasteRank);
}
export function gfNew(level,random){
 const cols=[7,7,6][level],rows=[5,5,6][level],wrap=level===0;let deal=null;
 for(let tries=0;tries<40;tries++){
  const deck=mix([...Array(52).keys()],random),tab=Array.from({length:cols},(_,c)=>deck.slice(c*rows,(c+1)*rows)),rest=deck.slice(cols*rows),waste=rest.pop();
  deal={cols,rows,wrap,tab,waste:[waste],stock:rest,moves:0,history:[],outcome:null,lastPlayed:-1};
  if(gfSolvable(tab,[...rest].reverse(),waste%13,wrap))break;
 }
 return deal;
}
const gfTop=g=>g.waste[g.waste.length-1];
export const gfCan=(g,c)=>g.tab[c].length>0&&gfNext(g.tab[c][g.tab[c].length-1]%13,gfTop(g)%13,g.wrap);
const gfAny=g=>g.tab.some((_,c)=>gfCan(g,c));
const gfSnap=g=>({tab:g.tab.map(c=>[...c]),stock:[...g.stock],waste:[...g.waste],moves:g.moves});
function gfSettle(g){if(g.tab.every(c=>!c.length))g.outcome='win';else if(!g.stock.length&&!gfAny(g))g.outcome='loss';}
export function gfPlay(g,c){
 if(g.outcome||!gfCan(g,c))return false;
 g.history.push(gfSnap(g));if(g.history.length>120)g.history.shift();
 const card=g.tab[c].pop();g.waste.push(card);g.lastPlayed=card;g.moves++;gfSettle(g);return true;
}
export function gfDraw(g){
 if(g.outcome||!g.stock.length)return false;
 g.history.push(gfSnap(g));if(g.history.length>120)g.history.shift();
 const card=g.stock.pop();g.waste.push(card);g.lastPlayed=card;g.moves++;gfSettle(g);return true;
}
export function gfUndo(g){if(!g.history.length||g.outcome)return false;Object.assign(g,g.history.pop(),{lastPlayed:-1});return true;}
const gfLeft=g=>g.tab.reduce((s,c)=>s+c.length,0);
export const gfScore=g=>g.outcome==='win'?Math.min(1200,800+g.stock.length*25):Math.round(600*(g.cols*g.rows-gfLeft(g))/(g.cols*g.rows));
export const gfProgress=g=>1-gfLeft(g)/(g.cols*g.rows);
export const gfStats=(g,t)=>`<span>${t.gfLeft}: <strong>${gfLeft(g)}</strong></span><span>${t.gfStock}: <strong>${g.stock.length}</strong></span>`;
export function gfBoard(g,t,preview=false){
 const done=Boolean(g.outcome)||preview;
 const cols=g.tab.map((col,c)=>`<div class="gf-col" style="--rows:${g.rows}">${col.map((card,i)=>{
  const last=i===col.length-1,ok=last&&!done&&gfCan(g,c);
  return cardHTML(card,t,`gf-card ${ok?'ok':''} ${last?'':'under'}`,last?`data-action="pick" data-value="${c}" data-focus="pick-${c}" ${ok?'':'disabled'}`:'disabled tabindex="-1"');
 }).join('')}</div>`).join('');
 const stock=`<button type="button" class="pcard back stock ${!done&&!gfAny(g)&&g.stock.length?'hint':''}" data-action="draw" data-focus="draw" aria-label="${t.drawCard}: ${g.stock.length}" ${done||!g.stock.length?'disabled':''}><span>${g.stock.length}</span></button>`;
 const waste=cardHTML(gfTop(g),t,`top ${g.lastPlayed===gfTop(g)&&!preview?'new':''}`,'disabled');
 return `<div class="gf-board" style="--cols:${g.cols}"><div class="gf-tab">${cols}</div><div class="gf-base">${stock}${waste}</div></div>${preview?'':`<p class="board-note">${g.wrap?t.gfNoteWrap:t.gfNote}</p>`}`;
}

// ───────── Hashi (Bridges) ─────────
// Islands carry numbers. Join them with straight bridges (one or two) so every island has exactly its number,
// bridges never cross, and all islands end up linked.
const hsKey=(a,b)=>a<b?`${a}-${b}`:`${b}-${a}`;
function hsLink(islands,i,d){
 const a=islands[i];let best=-1,bd=99;
 islands.forEach((b,j)=>{
  if(j===i)return;const dx=b.x-a.x,dy=b.y-a.y;
  const hit=d===0?dx===0&&dy<0:d===1?dy===0&&dx>0:d===2?dx===0&&dy>0:dy===0&&dx<0;
  const dist=Math.abs(dx)+Math.abs(dy);if(hit&&dist<bd){bd=dist;best=j;}
 });
 return best;
}
export const hsNeighbours=(islands,i)=>[0,1,2,3].map(d=>hsLink(islands,i,d)).filter(j=>j>=0);
const hsSegment=(islands,key)=>{const [a,b]=key.split('-').map(Number),p=islands[a],q=islands[b],h=p.y===q.y;return {horizontal:h,fixed:h?p.y:p.x,lo:h?Math.min(p.x,q.x):Math.min(p.y,q.y),hi:h?Math.max(p.x,q.x):Math.max(p.y,q.y)};};
function hsCrosses(islands,bridges,key){
 const s=hsSegment(islands,key);
 return Object.entries(bridges).some(([k,v])=>{
  if(!v||k===key)return false;const o=hsSegment(islands,k);
  return o.horizontal!==s.horizontal&&o.fixed>s.lo&&o.fixed<s.hi&&s.fixed>o.lo&&s.fixed<o.hi;
 });
}
export const hsTotal=(g,i)=>Object.entries(g.bridges).reduce((s,[k,v])=>s+(k.split('-').map(Number).includes(i)?v:0),0);
export function hsConnected(g){
 const seen=new Set([0]),todo=[0];
 while(todo.length){const i=todo.pop();for(const [k,v] of Object.entries(g.bridges)){if(!v)continue;const [a,b]=k.split('-').map(Number);const o=a===i?b:b===i?a:-1;if(o>=0&&!seen.has(o)){seen.add(o);todo.push(o);}}}
 return seen.size===g.islands.length;
}
const hsSatisfied=g=>g.islands.filter((is,i)=>hsTotal(g,i)===is.n).length;
export function hashiNew(level,random){
 const n=[5,7,9][level],count=[6,10,15][level];
 for(let attempt=0;attempt<60;attempt++){
  const spots=[{x:Math.floor(random()*n),y:Math.floor(random()*n)}],covered=new Set(),links={};
  const at=(x,y)=>spots.findIndex(s=>s.x===x&&s.y===y);
  const free=(x,y)=>x>=0&&x<n&&y>=0&&y<n&&at(x,y)<0&&!covered.has(x+','+y);
  const delta=[[0,-1],[1,0],[0,1],[-1,0]];
  for(let tries=0;spots.length<count&&tries<500;tries++){
   const src=Math.floor(random()*spots.length),d=Math.floor(random()*4),[dx,dy]=delta[d],max=[];
   for(let L=1;;L++){const x=spots[src].x+dx*L,y=spots[src].y+dy*L;if(!free(x,y))break;if(L>=2){const lonely=delta.every(([ex,ey],e)=>e===(d+2)%4||at(x+ex,y+ey)<0);if(lonely)max.push(L);}}
   if(!max.length)continue;
   const L=pick(max,random),x=spots[src].x+dx*L,y=spots[src].y+dy*L;spots.push({x,y});
   for(let s=1;s<L;s++)covered.add(`${spots[src].x+dx*s},${spots[src].y+dy*s}`);
   links[hsKey(src,spots.length-1)]=random()<.35?2:1;
  }
  if(spots.length<count-1)continue;
  const islands=spots.map(s=>({...s,n:0})),bridges={...links};
  // Extra bridges where two islands face each other and nothing is in the way.
  islands.forEach((_,i)=>{for(const d of [1,2]){const j=hsLink(islands,i,d);if(j<0||bridges[hsKey(i,j)])continue;const key=hsKey(i,j);if(random()<.4&&!hsCrosses(islands,bridges,key))bridges[key]=random()<.3?2:1;}});
  Object.entries(bridges).forEach(([k,v])=>{const [a,b]=k.split('-').map(Number);islands[a].n+=v;islands[b].n+=v;});
  const par=Object.values(bridges).reduce((s,v)=>s+v,0);
  return {n,islands,bridges:{},moves:0,par,sel:-1,history:[],outcome:null,lastBridge:''};
 }
 // Two islands and one bridge: always valid.
 return {n,islands:[{x:0,y:0,n:1},{x:2,y:0,n:1}],bridges:{},moves:0,par:1,sel:-1,history:[],outcome:null,lastBridge:''};
}
export function hashiClick(g,i){
 if(g.outcome||i<0||i>=g.islands.length)return {ok:false};
 if(g.sel<0||g.sel===i){g.sel=g.sel===i?-1:i;return {ok:true,moved:false};}
 if(!hsNeighbours(g.islands,g.sel).includes(i)){g.sel=i;return {ok:true,moved:false};}
 const key=hsKey(g.sel,i),next=((g.bridges[key]||0)+1)%3;
 if(next>0&&hsCrosses(g.islands,{...g.bridges,[key]:0},key))return {ok:false,bad:true};
 g.history.push({bridges:{...g.bridges},moves:g.moves});if(g.history.length>300)g.history.shift();
 if(next)g.bridges[key]=next;else delete g.bridges[key];
 g.moves++;g.lastBridge=key;
 if(hsSatisfied(g)===g.islands.length&&hsConnected(g))g.outcome='win';
 return {ok:true,moved:true};
}
export function hashiUndo(g){if(!g.history.length||g.outcome)return false;const s=g.history.pop();g.bridges=s.bridges;g.moves=s.moves;g.lastBridge='';return true;}
export const hashiScore=g=>g.outcome==='win'?Math.max(200,1200-Math.max(0,g.moves-g.par)*15):0;
export const hashiProgress=g=>hsSatisfied(g)/g.islands.length;
export const hashiStats=(g,t)=>`<span>${t.moves}: <strong>${g.moves}</strong></span><span>${t.hsDone}: <strong>${hsSatisfied(g)} / ${g.islands.length}</strong></span>`;
export function hashiBoard(g,t,preview=false){
 const done=Boolean(g.outcome)||preview,n=g.n,near=g.sel>=0?new Set(hsNeighbours(g.islands,g.sel)):new Set();
 const lines=Object.entries(g.bridges).map(([k,v])=>{
  const [a,b]=k.split('-').map(Number),p=g.islands[a],q=g.islands[b],off=v===2?[-.1,.1]:[0];
  return off.map(o=>{const h=p.y===q.y;return `<line class="hs-bridge ${k===g.lastBridge&&!preview?'new':''}" x1="${p.x+.5+(h?0:o)}" y1="${p.y+.5+(h?o:0)}" x2="${q.x+.5+(h?0:o)}" y2="${q.y+.5+(h?o:0)}"/>`;}).join('');
 }).join('');
 const dots=g.islands.map((is,i)=>{
  const total=hsTotal(g,i),cls=['hs-island',i===g.sel?'sel':'',near.has(i)?'nb':'',total===is.n?'ok':total>is.n?'over':''].filter(Boolean).join(' ');
  return `<button type="button" class="${cls}" style="--x:${is.x};--y:${is.y}" data-action="pick" data-value="${i}" data-focus="pick-${i}" aria-label="${t.hsIsland} ${is.n}, ${t.row} ${is.y+1}, ${t.column} ${is.x+1}: ${total} / ${is.n}" aria-pressed="${i===g.sel}" ${done?'disabled':''}>${is.n}</button>`;
 }).join('');
 return `<div class="hs-board" style="--n:${n}"><svg viewBox="0 0 ${n} ${n}" aria-hidden="true">${Array.from({length:n*n},(_,k)=>`<circle class="hs-dot" cx="${k%n+.5}" cy="${Math.floor(k/n)+.5}" r=".04"/>`).join('')}${lines}</svg>${dots}</div>${preview?'':`<p class="board-note">${t.hsNote}</p>`}`;
}
