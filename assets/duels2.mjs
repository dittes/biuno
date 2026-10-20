// More turn-based duels against the computer: checkers, dots and boxes, crazy eights.
const mix=(a,random)=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
export const duel2Ids=['checkers','dots-boxes','crazy-eights'];

// ───────── Checkers (8×8, forced captures, kings) ─────────
// board[k]: null | 'x' | 'X' (player man/king, moves up) | 'o' | 'O' (computer, moves down)
export function ckNew(){const b=Array(64).fill(null);for(let k=0;k<64;k++){const r=Math.floor(k/8),c=k%8;if((r+c)%2===1){if(r<3)b[k]='o';else if(r>4)b[k]='x';}}return {board:b,turn:'X',outcome:null,moves:0,sel:-1,lastMove:null,quiet:0};}
const mine=(p,s)=>p&&p.toLowerCase()===(s==='X'?'x':'o');
const king=p=>p===p?.toUpperCase();
function dirsFor(p){const d=[[-1,-1],[-1,1],[1,-1],[1,1]];return king(p)?d:p==='x'?d.slice(0,2):d.slice(2);}
const onBoard=(r,c)=>r>=0&&r<8&&c>=0&&c<8;
function jumps(board,k,p,caps,path){
 const out=[],r0=Math.floor(k/8),c0=k%8;
 for(const[dr,dc]of dirsFor(p)){
  const r1=r0+dr,c1=c0+dc,r2=r0+2*dr,c2=c0+2*dc;if(!onBoard(r2,c2))continue;
  const mid=r1*8+c1,to=r2*8+c2;
  if(board[mid]&&!mine(board[mid],mine(p,'X')?'X':'O')&&!caps.includes(mid)&&!board[to]){
   const promoted=(p==='x'&&r2===0)||(p==='o'&&r2===7),np=promoted?p.toUpperCase():p;
   const nb=[...board];nb[k]=null;nb[to]=np;
   const more=promoted?[]:jumps(nb,to,np,[...caps,mid],[...path,to]);
   if(more.length)out.push(...more);else out.push({from:path[0],to,caps:[...caps,mid],path:[...path,to]});
  }
 }
 return out;
}
export function ckMoves(board,side){
 const caps=[],steps=[];
 for(let k=0;k<64;k++){const p=board[k];if(!mine(p,side))continue;
  const j=jumps(board,k,p,[],[k]);if(j.length)caps.push(...j);
  else{const r=Math.floor(k/8),c=k%8;for(const[dr,dc]of dirsFor(p)){const r1=r+dr,c1=c+dc;if(onBoard(r1,c1)&&!board[r1*8+c1])steps.push({from:k,to:r1*8+c1,caps:[],path:[k,r1*8+c1]});}}}
 return caps.length?caps:steps;
}
function ckApply(board,m){
 const b=[...board],p=b[m.from];b[m.from]=null;m.caps.forEach(i=>{b[i]=null;});
 const r=Math.floor(m.to/8);b[m.to]=(p==='x'&&r===0)?'X':(p==='o'&&r===7)?'O':p;return b;
}
export function ckPlay(g,m,side){
 const p=g.board[m.from],promo=!king(p)&&((p==='x'&&Math.floor(m.to/8)===0)||(p==='o'&&Math.floor(m.to/8)===7));
 g.board=ckApply(g.board,m);g.lastMove=m;g.sel=-1;if(side==='X')g.moves++;
 g.quiet=(m.caps.length||promo)?0:g.quiet+1;
 const o=side==='X'?'O':'X';
 if(!ckMoves(g.board,o).length)g.outcome=side==='X'?'win':'loss';
 else if(g.quiet>=50)g.outcome='draw';
 else g.turn=o;
}
export function ckClick(g,k){
 if(g.outcome||g.turn!=='X')return {ok:false};
 const moves=ckMoves(g.board,'X');
 if(g.sel>=0){const m=moves.find(m=>m.from===g.sel&&m.to===k);if(m){ckPlay(g,m,'X');return {ok:true,moved:true,caps:m.caps.length};}}
 if(moves.some(m=>m.from===k)){g.sel=g.sel===k?-1:k;return {ok:true,moved:false};}
 g.sel=-1;return {ok:false};
}
function ckEval(b){let s=0;for(let k=0;k<64;k++){const p=b[k];if(!p)continue;const r=Math.floor(k/8),c=k%8,edge=c===0||c===7?.15:0;if(p==='o')s+=1+r*.06+edge;else if(p==='O')s+=1.8;else if(p==='x')s-=1+(7-r)*.06+edge;else s-=1.8;}return s;}
function ckSearch(b,depth,alpha,beta,side){
 const ms=ckMoves(b,side);
 if(!ms.length)return side==='O'?-100-depth:100+depth;
 if(!depth)return ckEval(b);
 if(side==='O'){let best=-Infinity;for(const m of ms){best=Math.max(best,ckSearch(ckApply(b,m),depth-1,alpha,beta,'X'));alpha=Math.max(alpha,best);if(alpha>=beta)break;}return best;}
 let best=Infinity;for(const m of ms){best=Math.min(best,ckSearch(ckApply(b,m),depth-1,alpha,beta,'O'));beta=Math.min(beta,best);if(alpha>=beta)break;}return best;
}
export function ckComputer(board,level,random){
 const ms=ckMoves(board,'O');if(!ms.length)return null;
 if(level===0)return ms[Math.floor(random()*ms.length)];
 const depth=level===1?2:5;let best=ms[0],bv=-Infinity;
 for(const m of mix(ms,random)){const v=ckSearch(ckApply(board,m),depth-1,-Infinity,Infinity,'X')+random()*.02;if(v>bv){bv=v;best=m;}}
 return best;
}
export const ckScore=g=>g.outcome==='draw'?500:g.outcome==='win'?Math.max(300,1500-g.moves*18):0;
export function ckBoard(g,t,preview=false){
 const done=Boolean(g.outcome)||preview,moves=!done&&g.turn==='X'?ckMoves(g.board,'X'):[],movable=new Set(moves.map(m=>m.from)),targets=new Set(g.sel>=0?moves.filter(m=>m.from===g.sel).map(m=>m.to):[]);
 const last=g.lastMove,msg=g.outcome?'':g.turn==='X'?(moves.length&&moves[0].caps.length?t.mustCapture:t.yourTurn):t.computerTurn;
 const cells=Array.from({length:64},(_,k)=>{
  const r=Math.floor(k/8),c=k%8,dark=(r+c)%2===1,p=g.board[k];
  const cls=['ck-cell',dark?'dark':'',k===g.sel?'sel':'',targets.has(k)?'target':'',last&&(last.to===k||last.from===k)?'last':''].filter(Boolean).join(' ');
  const piece=p?`<i class="ck-piece ${p.toLowerCase()==='x'?'p-x':'p-o'} ${king(p)?'king':''} ${movable.has(k)?'can':''} ${last&&last.to===k&&!preview?'land':''}"></i>`:'';
  return dark?`<button type="button" class="${cls}" data-action="pick" data-value="${k}" data-focus="pick-${k}" aria-label="${t.row} ${r+1}, ${t.column} ${c+1}: ${p?(p.toLowerCase()==='x'?t.you:t.computer)+(king(p)?' ('+t.king+')':''):t.empty}" ${done||(!p&&!targets.has(k))||(p&&!movable.has(k)&&!targets.has(k))?'disabled':''}>${piece}</button>`:`<span class="${cls}"></span>`;
 }).join('');
 const x=g.board.filter(p=>p&&p.toLowerCase()==='x').length,o=g.board.filter(p=>p&&p.toLowerCase()==='o').length;
 return `<p class="game-message" role="status">${msg}</p><div class="ck-board">${cells}</div>${preview?'':`<p class="board-note">${t.checkersNote}</p>`}`;
}
export const ckStats=(g,t)=>{const x=g.board.filter(p=>p&&p.toLowerCase()==='x').length,o=g.board.filter(p=>p&&p.toLowerCase()==='o').length;return `<span>${t.you}: <strong>${x}</strong></span><span>${t.computer}: <strong>${o}</strong></span>`;};

// ───────── Dots and boxes ─────────
export const DOTS=[3,4,5];
export const dbEdges=n=>2*n*(n+1);
// edge index: horizontal edges first (n+1 rows × n), then vertical (n rows × n+1)
export const dbH=(n,r,c)=>r*n+c, dbV=(n,r,c)=>n*(n+1)+r*(n+1)+c;
const boxEdges=(n,r,c)=>[dbH(n,r,c),dbH(n,r+1,c),dbV(n,r,c),dbV(n,r,c+1)];
export function dbNew(level){const n=DOTS[level];return {n,edges:Array(dbEdges(n)).fill(null),boxes:Array(n*n).fill(null),turn:'X',outcome:null,moves:0,lastEdge:-1,scored:[]};}
export function dbPlay(g,e,side){
 if(g.outcome||g.turn!==side||e<0||e>=g.edges.length||g.edges[e])return false;
 g.edges[e]=side;g.moves++;g.lastEdge=e;g.scored=[];
 for(let r=0;r<g.n;r++)for(let c=0;c<g.n;c++){const k=r*g.n+c;if(!g.boxes[k]&&boxEdges(g.n,r,c).every(i=>g.edges[i])){g.boxes[k]=side;g.scored.push(k);}}
 if(g.boxes.every(Boolean)){const x=g.boxes.filter(v=>v==='X').length,o=g.boxes.length-x;g.outcome=x>o?'win':x<o?'loss':'draw';}
 else if(!g.scored.length)g.turn=side==='X'?'O':'X';
 return true;
}
const sides=(g,k)=>{const r=Math.floor(k/g.n),c=k%g.n;return boxEdges(g.n,r,c).filter(i=>g.edges[i]).length;};
const boxesOf=(n,e)=>{const out=[];const H=n*(n+1);if(e<H){const r=Math.floor(e/n),c=e%n;if(r>0)out.push((r-1)*n+c);if(r<n)out.push(r*n+c);}else{const v=e-H,r=Math.floor(v/(n+1)),c=v%(n+1);if(c>0)out.push(r*n+c-1);if(c<n)out.push(r*n+c);}return out;};
export function dbComputer(g,level,random){
 const free=g.edges.map((v,e)=>v?null:e).filter(e=>e!==null);if(!free.length)return -1;
 const takes=free.filter(e=>boxesOf(g.n,e).some(k=>sides(g,k)===3));
 if(takes.length&&(level>0||random()<.65))return takes[Math.floor(random()*takes.length)];
 if(level===0)return free[Math.floor(random()*free.length)];
 const safe=free.filter(e=>boxesOf(g.n,e).every(k=>sides(g,k)<2));
 if(safe.length)return safe[Math.floor(random()*safe.length)];
 if(level===1)return free[Math.floor(random()*free.length)];
 // Hard: when every move gives something away, give the shortest chain.
 const cost=e=>{const t=structuredClone(g);t.turn='O';dbPlay(t,e,'O');let n=0;while(true){const tk=t.edges.map((v,i)=>v?null:i).filter(i=>i!==null&&boxesOf(t.n,i).some(k=>sides(t,k)===3));if(!tk.length||t.outcome)break;t.turn='X';dbPlay(t,tk[0],'X');n++;}return n;};
 let best=free[0],bc=Infinity;for(const e of mix(free,random)){const c=cost(e);if(c<bc){bc=c;best=e;}}return best;
}
export const dbScore=g=>g.outcome==='draw'?500:g.outcome==='win'?Math.min(1500,800+(g.boxes.filter(v=>v==='X').length-g.boxes.filter(v=>v==='O').length)*90):0;
export function dbBoard(g,t,preview=false){
 const n=g.n,done=Boolean(g.outcome)||preview,H=n*(n+1),cells=[];
 for(let gr=0;gr<=2*n;gr++)for(let gc=0;gc<=2*n;gc++){
  if(gr%2===0&&gc%2===0){cells.push('<i class="db-dot"></i>');continue;}
  if(gr%2===1&&gc%2===1){const o=g.boxes[((gr-1)/2)*n+(gc-1)/2];cells.push(`<i class="db-box ${o?'own-'+o.toLowerCase():''} ${g.scored.includes(((gr-1)/2)*n+(gc-1)/2)?'pop':''}">${o?(o==='X'?'●':'■'):''}</i>`);continue;}
  const horiz=gr%2===0,e=horiz?dbH(n,gr/2,(gc-1)/2):dbV(n,(gr-1)/2,gc/2),o=g.edges[e];
  cells.push(`<button type="button" class="db-edge ${horiz?'h':'v'} ${o?'set own-'+o.toLowerCase():''} ${e===g.lastEdge?'fresh':''}" data-action="pick" data-value="${e}" data-focus="pick-${e}" aria-label="${horiz?t.lineH:t.lineV} ${horiz?gr/2+1:(gr-1)/2+1}, ${horiz?(gc-1)/2+1:gc/2+1}${o?': '+(o==='X'?t.you:t.computer):''}" ${done||o||g.turn!=='X'?'disabled':''}></button>`);
 }
 const msg=g.outcome?'':g.turn==='X'?t.yourTurn:t.computerTurn;
 return `<p class="game-message" role="status">${msg}</p><div class="db-board" style="--n:${n}">${cells.join('')}</div>${preview?'':`<p class="board-note">${t.dotsNote}</p>`}`;
}
export const dbStats=(g,t)=>`<span>${t.you}: <strong>${g.boxes.filter(v=>v==='X').length}</strong></span><span>${t.computer}: <strong>${g.boxes.filter(v=>v==='O').length}</strong></span><span>${g.boxes.filter(Boolean).length} / ${g.boxes.length}</span>`;

// ───────── Crazy eights ─────────
export const SUITS=['♠','♥','♦','♣'],RANKS=['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
export const ceCard=k=>({s:Math.floor(k/13),r:k%13}); // card number 0..51
export const ceIs8=k=>k%13===7;
export function ceNew(level,random){
 const deck=mix([...Array(52).keys()],random),hx=deck.splice(0,5),ho=deck.splice(0,5);
 let start=deck.findIndex(k=>!ceIs8(k));if(start<0)start=0;const top=deck.splice(start,1)[0];
 return {stock:deck,discard:[top],hands:{X:hx.sort((a,b)=>a-b),O:ho.sort((a,b)=>a-b)},suit:Math.floor(top/13),turn:'X',outcome:null,moves:0,choosing:false,passes:0,lastPlayed:-1,drawn:-1};
}
export const cePlayable=(g,k)=>{const top=g.discard[g.discard.length-1];return ceIs8(k)||Math.floor(k/13)===g.suit||k%13===top%13;};
function ceRefill(g,random){if(!g.stock.length&&g.discard.length>1){const top=g.discard.pop();g.stock=mix(g.discard,random);g.discard=[top];}}
function ceCheckEnd(g,side){if(!g.hands[side].length){g.outcome=side==='X'?'win':'loss';return true;}return false;}
export function cePlay(g,side,k,suit){
 const h=g.hands[side],i=h.indexOf(k);if(g.outcome||g.turn!==side||i<0||!cePlayable(g,k))return false;
 h.splice(i,1);g.discard.push(k);g.suit=ceIs8(k)?(suit??Math.floor(k/13)):Math.floor(k/13);g.lastPlayed=k;g.passes=0;g.drawn=-1;if(side==='X')g.moves++;
 if(ceCheckEnd(g,side))return true;
 g.turn=side==='X'?'O':'X';g.choosing=false;return true;
}
export function ceDraw(g,side,random){
 if(g.outcome||g.turn!==side)return false;ceRefill(g,random);
 if(!g.stock.length){g.passes++;g.drawn=-1;if(g.passes>=2){const x=g.hands.X.length,o=g.hands.O.length;g.outcome=x<o?'win':x>o?'loss':'draw';}else g.turn=side==='X'?'O':'X';return true;}
 const k=g.stock.pop();g.hands[side].push(k);g.hands[side].sort((a,b)=>a-b);g.drawn=k;g.passes=0;if(side==='X')g.moves++;return true;
}
export function ceComputer(g,level,random){
 const h=g.hands.O,play=h.filter(k=>cePlayable(g,k));
 if(!play.length)return {draw:true};
 const nonEight=play.filter(k=>!ceIs8(k)),pool=level===0?play:(nonEight.length?nonEight:play);
 let card;
 if(level===0)card=pool[Math.floor(random()*pool.length)];
 else{const count=s=>h.filter(k=>Math.floor(k/13)===s).length;card=pool.sort((a,b)=>count(Math.floor(b/13))-count(Math.floor(a/13))+(ceIs8(a)?1:0)-(ceIs8(b)?1:0)||random()-.5)[0];}
 const rest=h.filter(k=>k!==card),best=[0,1,2,3].map(s=>[s,rest.filter(k=>Math.floor(k/13)===s).length]).sort((a,b)=>b[1]-a[1]||random()-.5)[0][0];
 return {card,suit:level===0?Math.floor(random()*4):best};
}
export const ceScore=g=>g.outcome==='draw'?500:g.outcome==='win'?Math.min(1500,1000+g.hands.O.length*90-Math.max(0,g.moves-8)*10):0;
const suitName=(t,s)=>t.suitNames[s];
const rankName=(t,r)=>r===0?t.rankA:r===10?t.rankJ:r===11?t.rankQ:r===12?t.rankK:String(r+1);
export function cardHTML(k,t,extra='',attrs=''){const{s,r}=ceCard(k),red=s===1||s===2;return `<button type="button" class="pcard ${red?'red':'black'} ${extra}" ${attrs} aria-label="${rankName(t,r)} ${suitName(t,s)}"><b>${RANKS[r]}</b><span>${SUITS[s]}</span><em>${SUITS[s]}</em></button>`;}
export function ceBoard(g,t,preview=false){
 const done=Boolean(g.outcome)||preview,top=g.discard[g.discard.length-1],mineTurn=!done&&g.turn==='X'&&!g.choosing;
 const anyPlay=g.hands.X.some(k=>cePlayable(g,k));
 const msg=g.outcome?'':g.choosing?t.pickSuit:g.turn==='X'?(anyPlay?t.yourTurn:t.noPlay):t.computerTurn;
 const opp=`<div class="ce-opp" aria-label="${t.computer}: ${g.hands.O.length}">${g.hands.O.map((_,i)=>`<i class="pcard back" style="--i:${i}"></i>`).join('')}<span>${g.hands.O.length}</span></div>`;
 const center=`<div class="ce-center"><button type="button" class="pcard back stock ${mineTurn&&!anyPlay?'hint':''}" data-action="draw" data-focus="draw" aria-label="${t.drawCard}: ${g.stock.length}" ${!mineTurn?'disabled':''}><span>${g.stock.length}</span></button><div class="ce-top">${cardHTML(top,t,'top '+(g.lastPlayed===top?'drop':''),'disabled')}<span class="suit-now ${g.suit===1||g.suit===2?'red':''}" aria-label="${suitName(t,g.suit)}">${SUITS[g.suit]}</span></div></div>`;
 const choose=g.choosing&&!done?`<div class="ce-suits" role="group" aria-label="${t.pickSuit}">${SUITS.map((s,i)=>`<button type="button" class="${i===1||i===2?'red':''}" data-action="suit" data-value="${i}" aria-label="${suitName(t,i)}">${s}</button>`).join('')}</div>`:'';
 const hand=`<div class="ce-hand" role="group" aria-label="${t.yourHand}">${g.hands.X.map(k=>cardHTML(k,t,`${mineTurn&&cePlayable(g,k)?'ok':'dim'} ${g.drawn===k?'new':''}`,`data-action="pick" data-value="${k}" data-focus="pick-${k}" ${!mineTurn||!cePlayable(g,k)?'disabled':''}`)).join('')}</div>`;
 return `<p class="game-message" role="status">${msg}</p><div class="ce-table">${opp}${center}${choose}${hand}</div>${preview?'':`<p class="board-note">${t.eightsNote}</p>`}`;
}
export const ceStats=(g,t)=>`<span>${t.you}: <strong>${g.hands.X.length}</strong></span><span>${t.computer}: <strong>${g.hands.O.length}</strong></span><span>${t.stock}: <strong>${g.stock.length}</strong></span>`;
