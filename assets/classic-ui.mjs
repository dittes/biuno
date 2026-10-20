import {mineNumber,sunkShips} from './classic-engine.mjs';
const X='<svg viewBox="0 0 100 100" aria-hidden="true"><path pathLength="1" d="M18 18 82 82"/><path pathLength="1" d="M82 18 18 82"/></svg>';
const O='<svg viewBox="0 0 100 100" aria-hidden="true"><circle pathLength="1" cx="50" cy="50" r="33"/></svg>';
export function classicBoard(g,t,preview=false){
 const done=Boolean(g.outcome)||preview,coord=k=>`${t.row} ${Math.floor(k/(g.n||3))+1}, ${t.column} ${k%(g.n||3)+1}`;
 if(g.id==='minesweeper'){
  const origin=g.justOpened[0]??0,ox=origin%6,oy=Math.floor(origin/6);
  return `<div class="mine-tools" role="group" aria-label="${t.select}">${['reveal','flag'].map(tool=>`<button type="button" data-action="mine-tool" data-tool="${tool}" aria-pressed="${g.tool===tool}" ${done?'disabled':''}>${tool==='flag'?'🚩 ':''}${t[tool]}</button>`).join('')}</div><div class="classic-grid mine-grid">${Array.from({length:36},(_,k)=>{
   const open=g.opened.includes(k),mine=g.mines.includes(k),flag=g.flags.includes(k),n=open?mineNumber(g,k):0,fresh=g.justOpened.includes(k),d=fresh?Math.max(Math.abs(k%6-ox),Math.abs(Math.floor(k/6)-oy)):0;
   const face=done&&mine?'💣':flag?'<span class="flag">🚩</span>':open?(n||''):'';
   return `<button type="button" class="mine-cell ${open?'opened':''} number-${n} ${fresh?'new-cell':''} ${open&&mine?'boom':''} ${g.lastFlag===k?'just-flag':''}" style="--d:${d}" data-action="pick" data-value="${k}" data-focus="pick-${k}" aria-label="${coord(k)}: ${flag?t.flag:open?(mine?t.mine:n||t.empty):t.covered}" ${done||open?'disabled':''}>${face}</button>`;}).join('')}</div><p class="board-note">${t.mineNote}</p>`;
 }
 if(g.id==='tic-tac-toe')return `<p class="game-message" role="status">${g.outcome?'':g.turn==='X'?t.yourTurn:t.computerTurn}</p><div class="tic-grid">${g.board.map((v,k)=>`<button type="button" class="tic-cell ${v==='O'?'mark-o':v==='X'?'mark-x':''} ${g.line.includes(k)?'winning-cell':''} ${g.lastMove===k?'new-cell':''}" data-action="pick" data-value="${k}" data-focus="pick-${k}" aria-label="${coord(k)}: ${v||t.empty}" ${done||v||g.turn!=='X'?'disabled':''}>${v==='X'?X:v==='O'?O:''}</button>`).join('')}</div>`;
 const sea=(own)=>{
  const fleet=own?g.playerFleet:g.enemyFleet,shots=own?g.enemyShots:g.shots;
  return `<section class="sea-board"><h3>${own?t.yourFleet:t.enemySea}</h3><div class="classic-grid sea-grid">${Array.from({length:36},(_,k)=>{
   const shot=shots.includes(k),ship=fleet.find(s=>s.includes(k)),sunk=ship?.every(i=>shots.includes(i)),visible=ship&&(own||sunk||g.outcome),hit=shot&&ship;
   const fresh=g.lastShot?.side===(own?'O':'X')&&g.lastShot.k===k;
   return `<button type="button" class="sea-cell ${visible?'ship-cell':''} ${hit?'hit-cell':''} ${sunk&&hit?'sunk-cell':''} ${shot&&!ship?'miss-cell':''} ${fresh?'new-cell':''}" data-action="${own?'none':'pick'}" data-value="${k}" data-focus="${own?'own':'pick'}-${k}" aria-label="${coord(k)}: ${shot?(ship?t.hit:t.miss):visible?t.ships:t.covered}" ${own||done||shot||g.turn!=='X'?'disabled':''}></button>`;}).join('')}</div><p>${t.sunk}: ${sunkShips(fleet,shots)} / 3</p></section>`;
 };
 return `<p class="game-message" role="status">${g.outcome?'':g.turn==='X'?t.yourTurn:t.computerTurn}${g.lastShot?` · ${g.lastShot.sunk?t.sunk:g.lastShot.hit?t.hit:t.miss}`:''}</p><div class="sea-boards">${sea(false)}${sea(true)}</div><p class="board-note">${t.navalNote}</p>`;
}
export function classicStats(g,t){if(g.id==='minesweeper')return `<span>🚩 ${g.flags.length} / ${g.mineCount}</span><span>${t.safe}: <strong>${g.opened.filter(k=>!g.mines.includes(k)).length} / ${36-g.mineCount}</strong></span>`;if(g.id==='sea-battle')return `<span>${t.shots}: <strong>${g.shots.length}</strong></span><span>${t.sunk}: <strong>${sunkShips(g.enemyFleet,g.shots)} / 3</strong></span>`;return `<span>${t.you}: <strong>X</strong></span><span>${t.computer}: <strong>O</strong></span>`;}
