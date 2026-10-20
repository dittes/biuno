export const classicIds=['minesweeper','sea-battle','tic-tac-toe'];
export function neighbours(i,n){const a=[];for(let r=-1;r<=1;r++)for(let c=-1;c<=1;c++){const y=Math.floor(i/n)+r,x=i%n+c;if((r||c)&&y>=0&&y<n&&x>=0&&x<n)a.push(y*n+x);}return a;}
const mix=(a,random)=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
export function classicNew(id,level,random){
 if(id==='minesweeper')return {n:6,mineCount:[5,7,9][level],mines:[],opened:[],flags:[],generated:false,tool:'reveal',moves:0,outcome:null,justOpened:[]};
 if(id==='tic-tac-toe')return {board:Array(9).fill(null),turn:'X',outcome:null,line:[],moves:0,lastMove:-1};
 if(id==='sea-battle')return {n:6,playerFleet:makeFleet(6,random),enemyFleet:makeFleet(6,random),shots:[],enemyShots:[],aiTargets:[],turn:'X',outcome:null,moves:0,lastShot:null};
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
export function classicScore(g){if(g.outcome==='draw')return 500;if(g.outcome!=='win')return 0;return Math.max(100,1500-g.moves*(g.id==='sea-battle'?25:g.id==='minesweeper'?15:50));}
