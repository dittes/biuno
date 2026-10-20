// Single-player number puzzles: tile merging and Sudoku. Pure functions + markup.
export const puzzleIds=['merge','sudoku','lights-out','slide-puzzle','colour-flood','nonogram','peg-solitaire','n-back','word-guess'];
const mix=(a,random)=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};

// ───────── Tile merge (4×4) ─────────
export const MERGE_TARGET=[128,256,512];
export function mergeNew(level,random,seed){
 const g={size:4,board:Array(16).fill(0),points:0,moves:0,target:MERGE_TARGET[level],outcome:null,anim:[]};
 for(let i=0;i<2;i++)spawn(g,random);
 g.anim=g.board.map((v,k)=>v?{to:k,from:[k],v,spawn:true}:null).filter(Boolean);
 return g;
}
function spawn(g,random){
 const free=g.board.map((v,k)=>v?null:k).filter(k=>k!==null);if(!free.length)return -1;
 const k=free[Math.floor(random()*free.length)];g.board[k]=random()<.9?2:4;return k;
}
const lineIdx=(dir,i)=>{const a=[0,1,2,3];return a.map(j=>dir==='left'?i*4+j:dir==='right'?i*4+3-j:dir==='up'?j*4+i:(3-j)*4+i);};
export function mergeCanMove(b){
 if(b.includes(0))return true;
 for(let r=0;r<4;r++)for(let c=0;c<4;c++){const v=b[r*4+c];if(c<3&&b[r*4+c+1]===v)return true;if(r<3&&b[(r+1)*4+c]===v)return true;}
 return false;
}
export function mergeSlide(g,dir,random){
 if(g.outcome)return false;
 const next=Array(16).fill(0),anim=[];let gained=0;
 for(let i=0;i<4;i++){
  const idx=lineIdx(dir,i),tiles=idx.map(k=>({k,v:g.board[k]})).filter(t=>t.v);let out=0;
  for(let j=0;j<tiles.length;j++){
   const a=tiles[j],b=tiles[j+1];
   if(b&&b.v===a.v){next[idx[out]]=a.v*2;gained+=a.v*2;anim.push({to:idx[out],from:[a.k,b.k],v:a.v*2,merged:true});j++;}
   else{next[idx[out]]=a.v;anim.push({to:idx[out],from:[a.k],v:a.v});}
   out++;
  }
 }
 if(next.every((v,k)=>v===g.board[k]))return false;
 g.board=next;g.points+=gained;g.moves++;
 const s=spawn(g,random);if(s>=0)anim.push({to:s,from:[s],v:g.board[s],spawn:true});
 g.anim=anim;
 if(Math.max(...g.board)>=g.target)g.outcome='win';else if(!mergeCanMove(g.board))g.outcome='loss';
 return true;
}
export function mergeScore(g){
 if(g.outcome==='win')return 1000+Math.max(0,300-Math.floor(g.moves*.8));
 const m=Math.max(...g.board);return Math.round(900*Math.max(0,Math.log2(m)-1)/(Math.log2(g.target)-1)*.95);
}
const DIRS={left:'←',right:'→',up:'↑',down:'↓'};
export function mergeBoard(g,t,preview=false){
 const done=Boolean(g.outcome)||preview,anim=preview?[]:g.anim||[];
 const tiles=(preview?g.board.map((v,k)=>v?{to:k,from:[k],v}:null).filter(Boolean):anim).map(a=>{
  const r=Math.floor(a.to/4),c=a.to%4,f=a.from[0],dx=(f%4)-c,dy=Math.floor(f/4)-r;
  return `<div class="tile v${Math.min(a.v,4096)} ${a.merged?'merged':''} ${a.spawn?'spawned':''}" style="grid-column:${c+1};grid-row:${r+1};--dx:${dx};--dy:${dy}"><span>${a.v}</span></div>`;
 }).join('');
 const pad=preview?'':`<div class="slide-pad" role="group" aria-label="${t.slide}">${['up','left','down','right'].map(d=>`<button type="button" class="slide-${d}" data-action="slide" data-dir="${d}" aria-label="${t.slide}: ${t[d]}" ${done?'disabled':''}>${DIRS[d]}</button>`).join('')}</div>`;
 return `<div class="merge-wrap"><div class="merge-board" data-merge><div class="merge-bg">${Array.from({length:16},()=>'<i></i>').join('')}</div><div class="merge-tiles">${tiles}</div></div>${pad}</div>${preview?'':`<p class="board-note">${t.mergeNote.replace('{n}',g.target)}</p>`}`;
}
export function mergeStats(g,t){return `<span>${t.target}: <strong>${g.target}</strong></span><span>${t.points}: <strong>${g.points}</strong></span><span>${t.best}: <strong>${Math.max(...g.board)}</strong></span>`;}
export function mergeProgress(g){return Math.log2(Math.max(2,...g.board))/Math.log2(g.target);}

// ───────── Sudoku ─────────
export const SUDOKU=[{n:4,br:2,bc:2,holes:8},{n:6,br:2,bc:3,holes:19},{n:9,br:3,bc:3,holes:44}];
const peers=(k,s)=>{const n=s.n,r=Math.floor(k/n),c=k%n,br=Math.floor(r/s.br)*s.br,bc=Math.floor(c/s.bc)*s.bc,out=new Set();for(let i=0;i<n;i++){out.add(r*n+i);out.add(i*n+c);}for(let y=0;y<s.br;y++)for(let x=0;x<s.bc;x++)out.add((br+y)*n+bc+x);out.delete(k);return [...out];};
const peerCache={};
export const sudokuPeers=(k,s)=>{const key=s.n+':'+k;return peerCache[key]||(peerCache[key]=peers(k,s));};
function candidates(cells,k,s){const used=new Set(sudokuPeers(k,s).map(i=>cells[i]));const out=[];for(let d=1;d<=s.n;d++)if(!used.has(d))out.push(d);return out;}
function solve(cells,s,random,limit=1){
 let count=0,first=null;
 (function go(){
  if(count>=limit)return;
  let best=-1,bc=null;
  for(let k=0;k<cells.length;k++)if(!cells[k]){const c=candidates(cells,k,s);if(!c.length)return;if(!bc||c.length<bc.length){best=k;bc=c;if(c.length===1)break;}}
  if(best<0){count++;if(!first)first=[...cells];return;}
  for(const d of(random?mix(bc,random):bc)){cells[best]=d;go();if(count>=limit){cells[best]=0;return;}}
  cells[best]=0;
 })();
 return {count,first};
}
export function sudokuNew(level,random){
 const s=SUDOKU[level],full=solve(Array(s.n*s.n).fill(0),s,random,1).first,given=[...full];
 for(const k of mix([...given.keys()],random)){
  if(given.filter(v=>!v).length>=s.holes)break;
  const keep=given[k];given[k]=0;
  if(solve([...given],s,null,2).count!==1)given[k]=keep;
 }
 return {n:s.n,br:s.br,bc:s.bc,solution:full,given,cells:[...given],sel:-1,moves:0,mistakes:0,hints:0,outcome:null};
}
export function sudokuDone(g){return g.cells.every((v,k)=>v===g.solution[k]);}
export function sudokuPlace(g,d){
 const k=g.sel;if(g.outcome||k<0||g.given[k])return false;
 if(g.cells[k]===d)return false;
 g.cells[k]=d;g.moves++;if(d&&d!==g.solution[k])g.mistakes++;
 if(sudokuDone(g))g.outcome='win';return true;
}
export function sudokuHint(g){
 if(g.outcome)return -1;
 let k=g.sel>=0&&!g.given[g.sel]&&g.cells[g.sel]!==g.solution[g.sel]?g.sel:g.cells.findIndex((v,i)=>v!==g.solution[i]);
 if(k<0)return -1;g.cells[k]=g.solution[k];g.given[k]=g.solution[k];g.hints++;g.sel=k;if(sudokuDone(g))g.outcome='win';return k;
}
export const sudokuScore=g=>g.outcome==='win'?Math.max(100,1200-g.hints*200-g.mistakes*25):0;
export function sudokuBoard(g,t,preview=false){
 const done=Boolean(g.outcome)||preview,n=g.n,s={n,br:g.br,bc:g.bc},sel=g.sel,selV=sel>=0?g.cells[sel]:0;
 const near=sel>=0?new Set(sudokuPeers(sel,s)):new Set();
 const cells=g.cells.map((v,k)=>{
  const r=Math.floor(k/n),c=k%n,conflict=v&&sudokuPeers(k,s).some(i=>g.cells[i]===v);
  const cls=['sd-cell',g.given[k]?'given':'',k===sel?'sel':near.has(k)?'near':'',v&&v===selV&&k!==sel?'same':'',conflict?'conflict':'',(c+1)%g.bc===0&&c<n-1?'bx':'',(r+1)%g.br===0&&r<n-1?'by':'',k===g.lastSet?'set':''].filter(Boolean).join(' ');
  return `<button type="button" class="${cls}" data-action="cell" data-value="${k}" data-focus="cell-${k}" aria-label="${t.row} ${r+1}, ${t.column} ${c+1}: ${v||t.empty}${g.given[k]?', '+t.given:''}" ${done?'disabled':''}>${v||''}</button>`;
 }).join('');
 const pad=preview?'':`<div class="sd-pad" role="group" aria-label="${t.select}">${Array.from({length:n},(_,i)=>`<button type="button" data-action="digit" data-value="${i+1}" ${done?'disabled':''}>${i+1}</button>`).join('')}<button type="button" class="wide" data-action="erase" ${done?'disabled':''}>⌫ <span>${t.erase}</span></button></div>`;
 return `<div class="sd-board n${n}" style="--n:${n}">${cells}</div>${pad}${preview?'':`<p class="board-note">${t.sudokuNote}</p>`}`;
}
export function sudokuStats(g,t){return `<span>${t.mistakes}: <strong>${g.mistakes}</strong></span><span>${t.hints}: <strong>${g.hints}</strong></span><span><strong>${g.cells.filter((v,k)=>v===g.solution[k]).length}</strong> / ${g.cells.length}</span>`;}
export const sudokuProgress=g=>g.cells.filter((v,k)=>v===g.solution[k]).length/g.cells.length;

// ───────── Lights Out ─────────
export const LIGHTS=[{n:4,par:5},{n:5,par:8},{n:6,par:12}];
const lightsToggle=(cells,n,k)=>{const r=Math.floor(k/n),c=k%n;for(const[y,x]of[[r,c],[r-1,c],[r+1,c],[r,c-1],[r,c+1]])if(y>=0&&y<n&&x>=0&&x<n)cells[y*n+x]^=1;};
export function lightsNew(level,random){
 const {n,par}=LIGHTS[level];let cells,presses;
 do{cells=Array(n*n).fill(0);presses=new Set(mix([...cells.keys()],random).slice(0,par));presses.forEach(k=>lightsToggle(cells,n,k));}while(!cells.includes(1));
 return {n,cells,par:presses.size,moves:0,outcome:null,lastPress:-1};
}
export function lightsPress(g,k){if(g.outcome||k<0||k>=g.cells.length)return false;lightsToggle(g.cells,g.n,k);g.moves++;g.lastPress=k;if(!g.cells.includes(1))g.outcome='win';return true;}
export const lightsScore=g=>g.outcome==='win'?Math.max(100,1200-Math.max(0,g.moves-g.par)*40):0;
export function lightsBoard(g,t,preview=false){
 const done=Boolean(g.outcome)||preview;
 return `<div class="lo-board" style="--n:${g.n}">${g.cells.map((v,k)=>`<button type="button" class="lo-cell ${v?'on':''} ${k===g.lastPress?'pressed':''}" style="--i:${k}" data-action="pick" data-value="${k}" data-focus="pick-${k}" aria-label="${t.row} ${Math.floor(k/g.n)+1}, ${t.column} ${k%g.n+1}: ${v?t.lightOn:t.lightOff}" aria-pressed="${Boolean(v)}" ${done?'disabled':''}></button>`).join('')}</div>${preview?'':`<p class="board-note">${t.lightsNote}</p>`}`;
}
export const lightsStats=(g,t)=>`<span>${t.moves}: <strong>${g.moves}</strong></span><span>${t.lightsLeft}: <strong>${g.cells.filter(Boolean).length}</strong></span>`;
export const lightsProgress=g=>1-g.cells.filter(Boolean).length/g.cells.length;

// ───────── Slide puzzle ─────────
export const SLIDE=[{n:3,shuffle:40,k:10},{n:4,shuffle:90,k:6},{n:5,shuffle:150,k:4}];
export function slideNew(level,random){
 const {n,shuffle:steps}=SLIDE[level],tiles=[...Array(n*n).keys()].map(i=>(i+1)%(n*n));let e=n*n-1,prev=-1;
 for(let i=0;i<steps;i++){
  const r=Math.floor(e/n),c=e%n,opts=[[r-1,c],[r+1,c],[r,c-1],[r,c+1]].filter(([y,x])=>y>=0&&y<n&&x>=0&&x<n).map(([y,x])=>y*n+x).filter(k=>k!==prev);
  const k=opts[Math.floor(random()*opts.length)];tiles[e]=tiles[k];tiles[k]=0;prev=e;e=k;
 }
 if(slideSolved(tiles))return slideNew(level,random);
 return {n,tiles,moves:0,outcome:null,anim:[]};
}
export const slideSolved=tiles=>tiles.every((v,i)=>v===(i+1)%tiles.length);
// Slides the whole line between tile k and the empty square, like pushing a row of tiles.
export function slideMove(g,k){
 if(g.outcome)return false;const n=g.n,e=g.tiles.indexOf(0),r=Math.floor(k/n),c=k%n,er=Math.floor(e/n),ec=e%n;
 if(k===e||(r!==er&&c!==ec))return false;
 const dr=Math.sign(er-r),dc=Math.sign(ec-c),line=[];let y=r,x=c;
 while(y!==er||x!==ec){line.push(y*n+x);y+=dr;x+=dc;}
 g.anim=[];let target=e;for(let i=line.length-1;i>=0;i--){const from=line[i];g.tiles[target]=g.tiles[from];g.anim.push({to:target,from});target=from;}
 g.tiles[k]=0;g.moves++;if(slideSolved(g.tiles))g.outcome='win';return true;
}
export function slideDirMove(g,dir){const e=g.tiles.indexOf(0),n=g.n,r=Math.floor(e/n),c=e%n,[y,x]={left:[r,c+1],right:[r,c-1],up:[r+1,c],down:[r-1,c]}[dir];if(y<0||y>=n||x<0||x>=n)return false;return slideMove(g,y*n+x);}
export const slideScore=g=>g.outcome==='win'?Math.max(100,1300-g.moves*SLIDE[g.n-3].k):0;
export function slideBoard(g,t,preview=false){
 const done=Boolean(g.outcome)||preview,moved=new Map((preview?[]:g.anim||[]).map(a=>[a.to,a.from]));
 const tiles=g.tiles.map((v,k)=>{if(!v)return '';const r=Math.floor(k/g.n),c=k%g.n,f=moved.get(k),dx=f===undefined?0:(f%g.n)-c,dy=f===undefined?0:Math.floor(f/g.n)-r,ok=v===(k+1)%g.tiles.length;
  return `<button type="button" class="sp-tile ${ok?'home':''} ${f!==undefined?'moved':''}" style="grid-column:${c+1};grid-row:${r+1};--dx:${dx};--dy:${dy}" data-action="pick" data-value="${k}" data-focus="pick-${k}" aria-label="${v}, ${t.row} ${r+1}, ${t.column} ${c+1}" ${done?'disabled':''}>${v}</button>`;}).join('');
 return `<div class="sp-board" style="--n:${g.n}"><div class="sp-bg">${g.tiles.map(()=>'<i></i>').join('')}</div><div class="sp-tiles">${tiles}</div></div>${preview?'':`<p class="board-note">${t.slideNote}</p>`}`;
}
export const slideStats=(g,t)=>`<span>${t.moves}: <strong>${g.moves}</strong></span><span><strong>${g.tiles.filter((v,i)=>v&&v===(i+1)%g.tiles.length).length}</strong> / ${g.tiles.length-1}</span>`;
export const slideProgress=g=>g.tiles.filter((v,i)=>v&&v===(i+1)%g.tiles.length).length/(g.tiles.length-1);

// ───────── Colour flood ─────────
export const FLOOD=[{n:8,colors:5,limit:15},{n:10,colors:6,limit:20},{n:12,colors:6,limit:24}];
export function floodNew(level,random){
 const {n,colors,limit}=FLOOD[level];
 return {n,colors,limit,cells:Array.from({length:n*n},()=>Math.floor(random()*colors)),moves:0,outcome:null,dist:{}};
}
export function floodRegion(g){
 const seen=new Set([0]),dist={0:0},q=[0],col=g.cells[0];
 while(q.length){const i=q.shift(),r=Math.floor(i/g.n),c=i%g.n;for(const[y,x]of[[r-1,c],[r+1,c],[r,c-1],[r,c+1]]){if(y<0||y>=g.n||x<0||x>=g.n)continue;const j=y*g.n+x;if(!seen.has(j)&&g.cells[j]===col){seen.add(j);dist[j]=dist[i]+1;q.push(j);}}}
 return {seen,dist};
}
export function floodPlay(g,color){
 if(g.outcome||color===g.cells[0])return false;
 const before=floodRegion(g).seen;before.forEach(i=>{g.cells[i]=color;});
 g.moves++;const after=floodRegion(g);g.dist={};after.seen.forEach(i=>{g.dist[i]=Math.min(after.dist[i],14);});
 if(after.seen.size===g.cells.length)g.outcome='win';else if(g.moves>=g.limit)g.outcome='loss';
 return true;
}
export const floodScore=g=>g.outcome==='win'?Math.min(1300,700+(g.limit-g.moves)*50):Math.round(250*floodRegion(g).seen.size/g.cells.length);
export const FLOOD_SYM=['●','▲','■','◆','★','✚'];
export function floodBoard(g,t,preview=false){
 const done=Boolean(g.outcome)||preview,here=g.cells[0];
 const cells=g.cells.map((v,k)=>`<i class="fl-cell c${v} ${g.dist[k]!==undefined?'wave':''}" style="--d:${g.dist[k]||0}">${FLOOD_SYM[v]}</i>`).join('');
 const pad=preview?'':`<div class="fl-pad" role="group" aria-label="${t.select}">${Array.from({length:g.colors},(_,c)=>`<button type="button" class="fl-btn c${c}" data-action="pick" data-value="${c}" data-focus="pick-${c}" aria-label="${t.floodColor} ${c+1}" ${done||c===here?'disabled':''}>${FLOOD_SYM[c]}</button>`).join('')}</div>`;
 return `<div class="fl-board" style="--n:${g.n}">${cells}</div>${pad}${preview?'':`<p class="board-note">${t.floodNote}</p>`}`;
}
export const floodStats=(g,t)=>`<span>${t.moves}: <strong>${g.moves} / ${g.limit}</strong></span><span><strong>${floodRegion(g).seen.size}</strong> / ${g.cells.length}</span>`;
export const floodProgress=g=>floodRegion(g).seen.size/g.cells.length;

// ───────── Pattern recall (memory) ─────────
export const PATTERN=[{n:3,base:3},{n:4,base:4},{n:5,base:5}];
export function patternRounds(level,random){
 const {n,base}=PATTERN[level],cap=Math.floor(n*n*.55);
 return Array.from({length:5},(_,i)=>mix([...Array(n*n).keys()],random).slice(0,Math.min(cap,base+i)).sort((a,b)=>a-b));
}
export function patternBoard(g,t){
 const n=PATTERN[g.level].n,pat=g.rounds[g.round],show=g.phase==='show',fb=g.feedback;
 return `<div class="pr-board" style="--n:${n}">${Array.from({length:n*n},(_,k)=>{
  const inP=pat.includes(k),picked=g.input.includes(k);
  const cls=['pr-cell',show&&inP?'lit':'',!show&&!fb&&picked?'found':'',fb&&inP?(picked?'found':'missed'):'',fb&&!inP&&picked?'wrong':''].filter(Boolean).join(' ');
  return `<button type="button" class="${cls}" style="--i:${k}" data-action="pick" data-value="${k}" data-focus="pick-${k}" aria-label="${t.row} ${Math.floor(k/n)+1}, ${t.column} ${k%n+1}" ${show||fb||picked?'disabled':''}></button>`;}).join('')}</div>`;
}

// ───────── Nonogram ─────────
export const NONO=[5,7,10];
export function nonoNew(level,random){
 const n=NONO[level];let sol;
 do{sol=Array.from({length:n*n},()=>random()<.58?1:0);}while(!Array.from({length:n},(_,i)=>nonoLine(sol,n,i,'r').length&&nonoLine(sol,n,i,'c').length).every(Boolean)&&true);
 return {n,solution:sol,cells:Array(n*n).fill(0),moves:0,outcome:null,tool:'fill',par:sol.filter(Boolean).length};
}
const runs=a=>{const out=[];let c=0;for(const v of a){if(v===1)c++;else if(c){out.push(c);c=0;}}if(c)out.push(c);return out;};
export function nonoLine(cells,n,i,axis){return runs(Array.from({length:n},(_,j)=>cells[axis==='r'?i*n+j:j*n+i]===1?1:0));}
const sameRuns=(a,b)=>a.length===b.length&&a.every((v,k)=>v===b[k]);
export function nonoSolved(g){for(let i=0;i<g.n;i++)for(const ax of['r','c'])if(!sameRuns(nonoLine(g.cells,g.n,i,ax),nonoLine(g.solution,g.n,i,ax)))return false;return true;}
export function nonoSet(g,k,v){if(g.outcome||g.cells[k]===v)return false;g.cells[k]=v;g.moves++;if(nonoSolved(g))g.outcome='win';return true;}
export const nonoScore=g=>g.outcome==='win'?Math.max(200,1200-Math.max(0,g.moves-g.par*2)*6):0;
export function nonoBoard(g,t,preview=false){
 const n=g.n,done=Boolean(g.outcome)||preview;
 const rowClues=Array.from({length:n},(_,i)=>nonoLine(g.solution,n,i,'r')),colClues=Array.from({length:n},(_,i)=>nonoLine(g.solution,n,i,'c'));
 const rowOk=i=>sameRuns(nonoLine(g.cells,n,i,'r'),rowClues[i]),colOk=i=>sameRuns(nonoLine(g.cells,n,i,'c'),colClues[i]);
 const head=colClues.map((c,i)=>`<div class="ng-clue col ${colOk(i)?'ok':''}">${c.map(v=>`<b>${v}</b>`).join('')}</div>`).join('');
 const body=Array.from({length:n},(_,r)=>`<div class="ng-clue row ${rowOk(r)?'ok':''}">${rowClues[r].map(v=>`<b>${v}</b>`).join('')}</div>`+Array.from({length:n},(_,c)=>{const k=r*n+c,v=g.cells[k];return `<button type="button" class="ng-cell ${v===1?'on':v===2?'mark':''} ${(c+1)%5===0&&c<n-1?'bx':''} ${(r+1)%5===0&&r<n-1?'by':''}" data-action="pick" data-value="${k}" data-focus="pick-${k}" aria-label="${t.row} ${r+1}, ${t.column} ${c+1}: ${v===1?t.filled:v===2?t.marked:t.empty}" ${done?'disabled':''}>${v===2?'×':''}</button>`;}).join('')).join('');
 const tools=preview?'':`<div class="mine-tools" role="group" aria-label="${t.select}">${['fill','mark'].map(tool=>`<button type="button" data-action="mine-tool" data-tool="${tool}" aria-pressed="${g.tool===tool}" ${done?'disabled':''}>${tool==='mark'?'× ':'■ '}${t[tool==='fill'?'fillTool':'markTool']}</button>`).join('')}</div>`;
 return `${tools}<div class="ng-board" style="--n:${n}"><div class="ng-corner"></div>${head}${body}</div>${preview?'':`<p class="board-note">${t.nonoNote}</p>`}`;
}
export const nonoStats=(g,t)=>`<span>${t.moves}: <strong>${g.moves}</strong></span><span><strong>${g.cells.filter(v=>v===1).length}</strong> / ${g.par}</span>`;
export const nonoProgress=g=>{let ok=0;for(let i=0;i<g.n;i++){if(sameRuns(nonoLine(g.cells,g.n,i,'r'),nonoLine(g.solution,g.n,i,'r')))ok++;if(sameRuns(nonoLine(g.cells,g.n,i,'c'),nonoLine(g.solution,g.n,i,'c')))ok++;}return ok/(2*g.n);};

// ───────── Peg solitaire (English board) ─────────
const PEG_OK=k=>{const r=Math.floor(k/7),c=k%7;return (r>=2&&r<=4)||(c>=2&&c<=4);};
export const PEG_HOLES=[...Array(49).keys()].filter(PEG_OK);
const PD=[[-1,0],[1,0],[0,-1],[0,1]];
export function pegJumps(pegs,k){
 const r=Math.floor(k/7),c=k%7,out=[];if(!pegs[k])return out;
 for(const[dr,dc]of PD){const y1=r+dr,x1=c+dc,y2=r+2*dr,x2=c+2*dc;if(y2<0||y2>6||x2<0||x2>6)continue;const m=y1*7+x1,to=y2*7+x2;if(PEG_OK(m)&&PEG_OK(to)&&pegs[m]&&!pegs[to]&&PEG_OK(k))out.push({to,over:m});}
 return out;
}
export const pegAnyMove=pegs=>PEG_HOLES.some(k=>pegJumps(pegs,k).length);
export const PEG_LEVELS=[{back:7},{back:12},{back:0}];
export function pegNew(level,random){
 const pegs=Array(49).fill(0);
 if(level===2){PEG_HOLES.forEach(k=>{pegs[k]=1;});pegs[24]=0;}
 else{
  pegs[PEG_HOLES[Math.floor(random()*PEG_HOLES.length)]]=1;
  for(let i=0;i<PEG_LEVELS[level].back;i++){
   const opts=[];
   for(const c of PEG_HOLES)if(pegs[c])for(const[dr,dc]of PD){const y1=Math.floor(c/7)+dr,x1=c%7+dc,y2=Math.floor(c/7)+2*dr,x2=c%7+2*dc;if(y2<0||y2>6||x2<0||x2>6)continue;const b=y1*7+x1,a=y2*7+x2;if(PEG_OK(b)&&PEG_OK(a)&&!pegs[b]&&!pegs[a])opts.push([c,b,a]);}
   if(!opts.length)break;const[c,b,a]=opts[Math.floor(random()*opts.length)];pegs[c]=0;pegs[b]=1;pegs[a]=1;
  }
 }
 return {pegs,start:pegs.filter(Boolean).length,moves:0,sel:-1,outcome:null,history:[],lastTo:-1};
}
export function pegClick(g,k){
 if(g.outcome)return {ok:false};
 if(g.sel>=0){const j=pegJumps(g.pegs,g.sel).find(m=>m.to===k);if(j){g.history.push([...g.pegs]);if(g.history.length>200)g.history.shift();g.pegs[g.sel]=0;g.pegs[j.over]=0;g.pegs[j.to]=1;g.moves++;g.lastTo=j.to;g.lastOver=j.over;g.sel=-1;
   const left=g.pegs.filter(Boolean).length;if(left===1)g.outcome='win';else if(!pegAnyMove(g.pegs))g.outcome='loss';return {ok:true,moved:true,over:j.over};}}
 if(g.pegs[k]&&pegJumps(g.pegs,k).length){g.sel=g.sel===k?-1:k;return {ok:true,moved:false};}
 g.sel=-1;return {ok:false};
}
export function pegUndo(g){if(!g.history.length||g.outcome)return false;g.pegs=g.history.pop();g.moves=Math.max(0,g.moves-1);g.sel=-1;g.lastTo=-1;return true;}
export function pegScore(g){const left=g.pegs.filter(Boolean).length;if(g.outcome==='win')return 1000+(g.start>20&&g.pegs[24]?200:0);return Math.round(400*(1-(left-1)/Math.max(1,g.start-1)));}
export function pegBoard(g,t,preview=false){
 const done=Boolean(g.outcome)||preview,targets=new Set(g.sel>=0?pegJumps(g.pegs,g.sel).map(m=>m.to):[]);
 const cells=Array.from({length:49},(_,k)=>{
  if(!PEG_OK(k))return '<i></i>';
  const r=Math.floor(k/7),c=k%7,p=g.pegs[k],can=!done&&p&&pegJumps(g.pegs,k).length;
  return `<button type="button" class="pg-hole ${p?'peg':''} ${k===g.sel?'sel':''} ${targets.has(k)?'target':''} ${can?'can':''} ${k===g.lastTo&&!preview?'land':''}" data-action="pick" data-value="${k}" data-focus="pick-${k}" aria-label="${t.row} ${r+1}, ${t.column} ${c+1}: ${p?t.peg:t.hole}" ${done||(!can&&!targets.has(k))?'disabled':''}>${p?'<i></i>':''}</button>`;
 }).join('');
 return `<div class="pg-board">${cells}</div>${preview?'':`<p class="board-note">${t.pegNote}</p>`}`;
}
export const pegStats=(g,t)=>`<span>${t.pegsLeft}: <strong>${g.pegs.filter(Boolean).length}</strong></span><span>${t.moves}: <strong>${g.moves}</strong></span>`;
export const pegProgress=g=>g.start>1?1-(g.pegs.filter(Boolean).length-1)/(g.start-1):1;

// ───────── N-back (memory) ─────────
export const NBACK=[{n:1,steps:16},{n:2,steps:16},{n:3,steps:16}];
export function nbackNew(level,random){
 const {n,steps}=NBACK[level],total=n+steps,seq=[];
 for(let i=0;i<total;i++){
  if(i>=n&&random()<.35)seq.push(seq[i-n]);
  else{let v;do{v=Math.floor(random()*8);}while(i>=n&&v===seq[i-n]);seq.push(v);}
 }
 return {n,seq,i:0,correct:0,answers:[],outcome:null,flash:null};
}
export const nbackTotal=g=>g.seq.length-g.n;
export function nbackAnswer(g,said){
 if(g.outcome)return null;
 let right=null;
 if(g.i>=g.n){const match=g.seq[g.i]===g.seq[g.i-g.n];right=said===match;g.answers.push(right);if(right)g.correct++;}
 g.i++;g.flash=right;
 if(g.i>=g.seq.length)g.outcome=g.correct/nbackTotal(g)>=.6?'win':'loss';
 return right;
}
export const nbackScore=g=>Math.round(1000*g.correct/nbackTotal(g));
export function nbackBoard(g,t,icon,preview=false){
 const done=Boolean(g.outcome)||preview,cur=Math.min(g.i,g.seq.length-1),judging=g.i>=g.n;
 const trail=Array.from({length:g.n},(_,k)=>`<i class="nb-ghost" style="--k:${k}"></i>`).join('');
 const msg=done?'':judging?t.nbackAsk.replace('{n}',g.n):t.nbackRemember.replace('{n}',g.n-g.i);
 const dots=`<div class="round-dots nb-dots" aria-hidden="true">${Array.from({length:nbackTotal(g)},(_,k)=>{const a=g.answers[k];return `<i class="${a===true?'ok':a===false?'no':k===g.answers.length&&judging?'now':''}"></i>`;}).join('')}</div>`;
 const stim=`<div class="nb-stage"><div class="nb-card ${g.flash===true?'right':g.flash===false?'wrong':''}" key="${g.i}">${icon(g.seq[cur]*2)}</div></div>`;
 const actions=preview?'':(judging?`<div class="nb-actions"><button type="button" class="button secondary" data-action="nb" data-value="0" ${done?'disabled':''}>${t.nbackNo}</button><button type="button" class="button invite-play" data-action="nb" data-value="1" ${done?'disabled':''}>${t.nbackYes}</button></div>`:`<div class="nb-actions"><button type="button" class="button invite-play" data-action="nb" data-value="0">${t.next}</button></div>`);
 return `${dots}<p class="game-message" role="status">${msg}</p>${stim}${actions}`;
}
export const nbackStats=(g,t)=>`<span>${t.nbackLevel.replace('{n}',g.n)}</span><span>${t.correct}: <strong>${g.correct}</strong> / ${nbackTotal(g)}</span>`;
export const nbackProgress=g=>g.i/g.seq.length;
