import {ckNew,ckScore,dbNew,dbScore,ceNew,ceScore} from './duels2.mjs';
export const classicIds=['minesweeper','sea-battle','tic-tac-toe','connect-four','reversi','checkers','dots-boxes','crazy-eights'];
export function neighbours(i,n){const a=[];for(let r=-1;r<=1;r++)for(let c=-1;c<=1;c++){const y=Math.floor(i/n)+r,x=i%n+c;if((r||c)&&y>=0&&y<n&&x>=0&&x<n)a.push(y*n+x);}return a;}
const mix=(a,random)=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
export function classicNew(id,level,random){
 if(id==='minesweeper')return {n:6,mineCount:[5,7,9][level],mines:[],opened:[],flags:[],generated:false,tool:'reveal',moves:0,outcome:null,justOpened:[]};
 if(id==='tic-tac-toe')return {board:Array(9).fill(null),turn:'X',outcome:null,line:[],moves:0,lastMove:-1};
 if(id==='sea-battle')return {n:6,playerFleet:makeFleet(6,random),enemyFleet:makeFleet(6,random),shots:[],enemyShots:[],aiTargets:[],turn:'X',outcome:null,moves:0,lastShot:null};
 if(id==='checkers')return ckNew();
 if(id==='dots-boxes')return dbNew(level);
 if(id==='crazy-eights')return ceNew(level,random);
 if(id==='connect-four')return {cols:7,rows:6,board:Array(42).fill(null),turn:'X',outcome:null,line:[],moves:0,lastMove:-1};
 if(id==='reversi'){const board=Array(36).fill(null);board[14]='O';board[15]='X';board[20]='X';board[21]='O';return {n:6,board,turn:'X',outcome:null,moves:0,lastMove:-1,flipped:[],passed:null};}
 throw Error('Unknown classic');
}
export function revealMine(g,k,random){
 if(g.outcome||g.opened.includes(k)||g.flags.includes(k)||k<0||k>=g.n*g.n)return;
 g.justOpened=[];
 if(!g.generated){const safe=[k,...neighbours(k,g.n)];g.mines=mix([...Array(g.n*g.n).keys()].filter(i=>!safe.includes(i)),random).slice(0,g.mineCount);g.generated=true;}
 g.moves++;
 if(g.mines.includes(k)){g.opened.push(k);g.justOpened=[k];g.outcome='loss';return;}
 const todo=[k];while(todo.length){const i=todo.pop();if(g.opened.includes(i)||g.flags.includes(i)||g.mines.includes(i))continue;g.opened.push(i);g.justOpened.push(i);if(mineNumber(g,i)===0)todo.push(...neighbours(i,g.n));}
 if(g.opened.length===g.n*g.n-g.mineCount)g.outcome='win';
}
export function mineNumber(g,k){return neighbours(k,g.n).filter(i=>g.mines.includes(i)).length;}
export function flagMine(g,k){if(g.outcome||g.opened.includes(k)||k<0||k>=g.n*g.n)return;g.flags=g.flags.includes(k)?g.flags.filter(i=>i!==k):[...g.flags,k];}
export const winLines=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
export function ticWinner(board){return winLines.find(a=>board[a[0]]&&a.every(i=>board[i]===board[a[0]]))||null;}
export function ticMove(g,k,mark){if(g.outcome||g.turn!==mark||g.board[k]||k<0||k>8)return;g.board[k]=mark;g.moves++;g.lastMove=k;const line=ticWinner(g.board);if(line){g.line=line;g.outcome=mark==='X'?'win':'loss';}else if(g.board.every(Boolean))g.outcome='draw';else g.turn=mark==='X'?'O':'X';}
export function ticComputer(board,level,random){
 const free=board.map((v,i)=>v?null:i).filter(x=>x!==null);if(!free.length)return -1;
 if(level===0)return free[Math.floor(random()*free.length)];
 for(const mark of ['O','X'])for(const i of free){const b=[...board];b[i]=mark;if(ticWinner(b))return i;}
 if(level===1){if(!board[4])return 4;return free[Math.floor(random()*free.length)];}
 function value(b,turn,depth){const line=ticWinner(b);if(line)return b[line[0]]==='O'?10-depth:depth-10;const f=b.map((v,i)=>v?null:i).filter(x=>x!==null);if(!f.length)return 0;const scores=f.map(i=>{const next=[...b];next[i]=turn;return value(next,turn==='O'?'X':'O',depth+1);});return turn==='O'?Math.max(...scores):Math.min(...scores);}
 return free.map(i=>{const b=[...board];b[i]='O';return{i,v:value(b,'X',0)};}).sort((a,b)=>b.v-a.v)[0].i;
}
export function makeFleet(n,random){
 const lengths=[3,2,2];
 function place(index,ships){if(index===lengths.length)return ships;const len=lengths[index],blocked=new Set(ships.flatMap(s=>s.flatMap(k=>[k,...neighbours(k,n)])));const candidates=[];for(let r=0;r<n;r++)for(let c=0;c<n;c++)for(const vertical of [false,true]){if((vertical?r:c)+len>n)continue;const cells=Array.from({length:len},(_,j)=>(r+(vertical?j:0))*n+c+(vertical?0:j));if(cells.every(k=>!blocked.has(k)))candidates.push(cells);}for(const cells of mix(candidates,random)){const result=place(index+1,[...ships,cells]);if(result)return result;}return null;}
 const fleet=place(0,[]);if(!fleet)throw Error('Fleet placement failed');return fleet;
}
export function sunkShips(fleet,shots){return fleet.filter(s=>s.every(k=>shots.includes(k))).length;}
export function navalShot(g,k,side){
 const shots=side==='X'?g.shots:g.enemyShots,fleet=side==='X'?g.enemyFleet:g.playerFleet;
 if(g.outcome||g.turn!==side||shots.includes(k)||k<0||k>=g.n*g.n)return;
 shots.push(k);if(side==='X')g.moves++;
 const ship=fleet.find(s=>s.includes(k)),sunk=Boolean(ship&&ship.every(i=>shots.includes(i)));
 g.lastShot={side,k,hit:Boolean(ship),sunk};
 if(side==='O'&&ship){if(sunk)g.aiTargets=[];else{const around=[k-g.n,k+g.n,k-1,k+1].filter(i=>i>=0&&i<g.n*g.n&&(Math.abs(i-k)===g.n||Math.floor(i/g.n)===Math.floor(k/g.n))&&!shots.includes(i));g.aiTargets=[...new Set([...around,...g.aiTargets])];}}
 if(sunkShips(fleet,shots)===fleet.length)g.outcome=side==='X'?'win':'loss';else g.turn=side==='X'?'O':'X';
}
export function navalComputer(g,level,random){
 const free=[...Array(g.n*g.n).keys()].filter(k=>!g.enemyShots.includes(k));
 if(level>0){while(g.aiTargets.length){const k=g.aiTargets.shift();if(free.includes(k))return k;}}
 const checker=free.filter(k=>(Math.floor(k/g.n)+k%g.n)%2===0),pool=level===2&&checker.length?checker:free;
 return pool[Math.floor(random()*pool.length)];
}
export function classicScore(g){
 if(g.id==='checkers')return ckScore(g);
 if(g.id==='dots-boxes')return dbScore(g);
 if(g.id==='crazy-eights')return ceScore(g);
 if(g.outcome==='draw')return 500;if(g.outcome!=='win')return 0;
 if(g.id==='connect-four')return Math.max(200,1500-Math.ceil(g.moves/2)*40);
 if(g.id==='reversi'){const[x,o]=revCount(g.board);return Math.min(1500,1000+(x-o)*14);}
 return Math.max(100,1500-g.moves*(g.id==='sea-battle'?25:g.id==='minesweeper'?15:50));
}
// ───────── Four in a row ─────────
export const c4Lines=(()=>{const l=[];for(let r=0;r<6;r++)for(let c=0;c<7;c++)for(const[dr,dc]of[[0,1],[1,0],[1,1],[1,-1]]){const cells=[0,1,2,3].map(i=>[r+dr*i,c+dc*i]);if(cells.every(([y,x])=>y>=0&&y<6&&x>=0&&x<7))l.push(cells.map(([y,x])=>y*7+x));}return l;})();
export const c4Winner=b=>c4Lines.find(a=>b[a[0]]&&a.every(i=>b[i]===b[a[0]]))||null;
export const c4Row=(b,col)=>{for(let r=5;r>=0;r--)if(!b[r*7+col])return r;return -1;};
export const c4Open=b=>[0,1,2,3,4,5,6].filter(c=>c4Row(b,c)>=0);
export function c4Drop(g,col,mark){
 if(g.outcome||g.turn!==mark||col<0||col>6)return;const r=c4Row(g.board,col);if(r<0)return;
 g.board[r*7+col]=mark;g.moves++;g.lastMove=r*7+col;
 const line=c4Winner(g.board);if(line){g.line=line;g.outcome=mark==='X'?'win':'loss';}else if(!c4Open(g.board).length)g.outcome='draw';else g.turn=mark==='X'?'O':'X';
}
const c4Try=(b,col,m)=>{const n=[...b];n[c4Row(b,col)*7+col]=m;return n;};
function c4Score(b){let s=0;for(const a of c4Lines){const x=a.filter(i=>b[i]==='O').length,y=a.filter(i=>b[i]==='X').length;if(x&&y)continue;s+=x===3?5:x===2?2:x===1?.2:0;s-=y===3?6:y===2?2.2:y===1?.2:0;}for(let r=0;r<6;r++){if(b[r*7+3]==='O')s+=3;if(b[r*7+3]==='X')s-=3;}return s;}
function c4Search(b,depth,alpha,beta,turn){
 const w=c4Winner(b);if(w)return b[w[0]]==='O'?1000+depth:-1000-depth;
 const open=c4Open(b);if(!open.length)return 0;if(!depth)return c4Score(b);
 const order=[...open].sort((p,q)=>Math.abs(p-3)-Math.abs(q-3));
 if(turn==='O'){let best=-Infinity;for(const c of order){best=Math.max(best,c4Search(c4Try(b,c,'O'),depth-1,alpha,beta,'X'));alpha=Math.max(alpha,best);if(alpha>=beta)break;}return best;}
 let best=Infinity;for(const c of order){best=Math.min(best,c4Search(c4Try(b,c,'X'),depth-1,alpha,beta,'O'));beta=Math.min(beta,best);if(alpha>=beta)break;}return best;
}
export function c4Computer(b,level,random){
 const open=c4Open(b);if(!open.length)return -1;
 const wins=m=>open.find(c=>c4Winner(c4Try(b,c,m)));
 const w=wins('O');if(w!==undefined&&(level>0||random()<.6))return w;
 if(level===0)return open[Math.floor(random()*open.length)];
 const bl=wins('X');if(bl!==undefined)return bl;
 if(level===1){const safe=open.filter(c=>{const r=c4Row(b,c);return r<1||!c4Winner(c4Try(c4Try(b,c,'O'),c,'X'));});const pool=safe.length?safe:open;const weights=pool.map(c=>4-Math.abs(c-3)+random());return pool[weights.indexOf(Math.max(...weights))];}
 let bestC=open[0],bestV=-Infinity;for(const c of [...open].sort((p,q)=>Math.abs(p-3)-Math.abs(q-3))){const v=c4Search(c4Try(b,c,'O'),5,-Infinity,Infinity,'X')+random()*.01;if(v>bestV){bestV=v;bestC=c;}}return bestC;
}
// ───────── Reversi (6×6) ─────────
const RD=[[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
export function revFlips(b,k,m){
 if(b[k])return[];const o=m==='X'?'O':'X',r0=Math.floor(k/6),c0=k%6,out=[];
 for(const[dr,dc]of RD){const run=[];let r=r0+dr,c=c0+dc;while(r>=0&&r<6&&c>=0&&c<6&&b[r*6+c]===o){run.push(r*6+c);r+=dr;c+=dc;}if(run.length&&r>=0&&r<6&&c>=0&&c<6&&b[r*6+c]===m)out.push(...run);}
 return out;
}
export const revMoves=(b,m)=>b.map((_,k)=>k).filter(k=>revFlips(b,k,m).length);
export const revCount=b=>[b.filter(v=>v==='X').length,b.filter(v=>v==='O').length];
export function revMove(g,k,m){
 if(g.outcome||g.turn!==m)return;const f=revFlips(g.board,k,m);if(!f.length)return;
 g.board[k]=m;f.forEach(i=>{g.board[i]=m;});g.flipped=f;g.lastMove=k;g.moves++;g.passed=null;
 const o=m==='X'?'O':'X';
 if(revMoves(g.board,o).length)g.turn=o;
 else if(revMoves(g.board,m).length){g.turn=m;g.passed=o;}
 else{const[x,y]=revCount(g.board);g.outcome=x>y?'win':x<y?'loss':'draw';}
}
const REVW=[10,-3,2,2,-3,10,-3,-5,0,0,-5,-3,2,0,1,1,0,2,2,0,1,1,0,2,-3,-5,0,0,-5,-3,10,-3,2,2,-3,10];
export function revComputer(b,level,random){
 const moves=revMoves(b,'O');if(!moves.length)return -1;
 if(level===0)return moves[Math.floor(random()*moves.length)];
 const play=(bd,k,m)=>{const n=[...bd];n[k]=m;revFlips(bd,k,m).forEach(i=>{n[i]=m;});return n;};
 const val=(bd)=>bd.reduce((s,v,i)=>s+(v==='O'?REVW[i]:v==='X'?-REVW[i]:0),0);
 let best=moves[0],bv=-Infinity;
 for(const k of moves){
  const nb=play(b,k,'O');let v=level===1?revFlips(b,k,'O').length+REVW[k]*2:val(nb);
  if(level===2){const reply=revMoves(nb,'X');if(reply.length)v-=Math.max(...reply.map(r=>{const n2=play(nb,r,'X');return -val(n2)+revFlips(nb,r,'X').length*.5;}))*.6;}
  v+=random()*.5;if(v>bv){bv=v;best=k;}
 }
 return best;
}
