// Single-player number puzzles: tile merging and Sudoku. Pure functions + markup.
export const puzzleIds=['merge','sudoku'];
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
