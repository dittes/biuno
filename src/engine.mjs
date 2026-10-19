import {classicIds,classicNew,classicScore} from './classic-engine.mjs';
export function rng(seed) {
 let n = hash(String(seed));
 return () => { n |= 0; n = n + 0x6D2B79F5 | 0; let t = Math.imul(n ^ n >>> 15, 1 | n); t ^= t + Math.imul(t ^ t >>> 7, 61 | t); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
export function hash(s) { let h=2166136261; for (const c of s) h=Math.imul(h^c.charCodeAt(0),16777619); return h>>>0; }
export function shuffle(items, random=Math.random) { const a=[...items]; for(let i=a.length-1;i>0;i--) { const j=Math.floor(random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
export function dailyKey(date=new Date()) { return `${date.getUTCFullYear()}-${String(date.getUTCMonth()+1).padStart(2,'0')}-${String(date.getUTCDate()).padStart(2,'0')}`; }
export function dailyGames(day=dailyKey()) { return [shuffle([0,1,2],rng(day))[0],shuffle([3,4],rng(day+'logic'))[0],5]; }
export function codeFeedback(secret, guess) {
 let exact=0; const a=[],b=[];
 secret.forEach((v,i)=>{ if(v===guess[i]) exact++; else {a.push(v);b.push(guess[i]);} });
 let other=0; for(const v of b) {const i=a.indexOf(v); if(i!==-1){other++;a.splice(i,1);}}
 return {exact,other};
}
export function rotate(mask,times=1) { for(let i=0;i<times;i++) mask=((mask<<1)&15)|(mask>>3); return mask; }
export const dirs=[[-1,0,1,4],[0,1,2,8],[1,0,4,1],[0,-1,8,2]];
export function pipeSolved(tiles,n) {
 if(tiles.length!==n*n || tiles.some(x=>!x)) return false;
 for(let i=0;i<tiles.length;i++) for(const [dr,dc,bit,opp] of dirs) {
  if(!(tiles[i]&bit)) continue;
  const r=Math.floor(i/n)+dr,c=i%n+dc;
  if(r<0||r>=n||c<0||c>=n||!(tiles[r*n+c]&opp))return false;
 }
 return connectedTiles(tiles,n).length===tiles.length;
}
export function connectedTiles(tiles,n) {
 const seen=new Set([0]),todo=[0];
 while(todo.length){const i=todo.pop();for(const[dr,dc,bit,opp]of dirs){const r=Math.floor(i/n)+dr,c=i%n+dc,j=r*n+c;if(r>=0&&r<n&&c>=0&&c<n&&(tiles[i]&bit)&&(tiles[j]&opp)&&!seen.has(j)){seen.add(j);todo.push(j);}}}
 return [...seen];
}
export function makePipes(n,random) {
 const solution=Array(n*n).fill(0), seen=new Set([0]);
 function visit(i){for(const[dr,dc,bit,opp]of shuffle(dirs,random)){const r=Math.floor(i/n)+dr,c=i%n+dc,j=r*n+c;if(r<0||r>=n||c<0||c>=n||seen.has(j))continue;seen.add(j);solution[i]|=bit;solution[j]|=opp;visit(j);}}
 visit(0);const tiles=solution.map(x=>rotate(x,Math.floor(random()*4)));
 if(pipeSolved(tiles,n)) {const i=tiles.findIndex(x=>x!==15);tiles[i]=rotate(tiles[i]);}
 return {n,solution,tiles,moves:0,hints:0};
}
export function makeMath(level,random) {
 const max=[10,20,50][level], int=m=>Math.floor(random()*m);
 let a=1+int(max),b=1+int(max),op=level&&random()<.3?'×':random()<.5?'+':'−';
 if(op==='×'){a=2+int(level===2?11:8);b=2+int(8);}
 if(op==='−'&&a<b)[a,b]=[b,a];
 const answer=op==='+'?a+b:op==='−'?a-b:a*b;
 const choices=new Set([answer]);while(choices.size<4){const v=answer+int(15)-7;if(v>=0)choices.add(v);}
 return {a,b,op,answer,choices:shuffle([...choices],random)};
}
export function newGame(id,level=1,seed=String(Date.now())) {
 const random=rng(seed),base={id,level,seed,status:'playing',paused:false,score:0,round:0,correct:0};
 if(classicIds.includes(id))return {...base,...classicNew(id,level,random)};
 if(id==='matching-pairs'){const n=[6,8,10][level],v=shuffle([...Array(16).keys()],random).slice(0,n);return {...base,cards:shuffle([...v,...v],random),open:[],matched:[],moves:0};}
 if(id==='what-changed') return {...base,trials:Array.from({length:5},()=>{const a=shuffle([...Array(16).keys()],random),n=[4,6,8][level];return{before:a.slice(0,n),after:shuffle([...a.slice(0,n-1),a[n]],random),answer:a[n]};}),phase:'study',feedback:null};
 if(id==='sequence-memory')return {...base,sequences:Array.from({length:5},(_,i)=>Array.from({length:2+i+level},()=>Math.floor(random()*4))),phase:'watch',input:[],feedback:null};
 if(id==='codebreaker')return {...base,secret:Array.from({length:[3,4,5][level]},()=>Math.floor(random()*6)),guess:Array([3,4,5][level]).fill(null),history:[],position:0};
 if(id==='pipes')return {...base,...makePipes([3,4,5][level],random)};
 if(id==='mental-math')return {...base,questions:Array.from({length:10},()=>makeMath(level,random)),feedback:null};
 throw new Error('Unknown game');
}
export function finishScore(g){
 if(classicIds.includes(g.id))return classicScore(g);
 if(g.id==='matching-pairs')return Math.max(100,1000-(g.moves-g.cards.length/2)*25);
 if(g.id==='codebreaker')return g.won?Math.max(100,1100-g.history.length*100):0;
 if(g.id==='pipes')return Math.max(100,1200-g.moves*10-g.hints*150);
 return g.correct*(g.id==='mental-math'?100:200);
}
