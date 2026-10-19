import test from 'node:test';
import assert from 'node:assert/strict';
import {rng,shuffle,newGame,codeFeedback,rotate,pipeSolved,connectedTiles,makePipes,finishScore,dailyKey,dailyGames,makeMath} from '../src/engine.mjs';
import {i18n,ids} from '../src/i18n.mjs';
test('same seed yields the same complete round, in all games and difficulties',()=>{
 for(const id of ids)for(let level=0;level<3;level++)assert.deepEqual(newGame(id,level,'daily-seed'),newGame(id,level,'daily-seed'));
});
test('matching boards contain exactly two of each symbol',()=>{for(let l=0;l<3;l++){const g=newGame('matching-pairs',l,'pairs');const counts={};g.cards.forEach(v=>counts[v]=(counts[v]||0)+1);assert.equal(g.cards.length,[12,16,20][l]);assert.ok(Object.values(counts).every(x=>x===2));g.moves=g.cards.length/2;assert.equal(finishScore(g),1000);g.moves+=20;assert.equal(finishScore(g),500);}});
test('code feedback handles repeated symbols without double counting',()=>{
 assert.deepEqual(codeFeedback([0,0,1,2],[0,1,0,0]),{exact:1,other:2});
 assert.deepEqual(codeFeedback([1,1,1,1],[1,2,2,2]),{exact:1,other:0});
 for(let i=0;i<200;i++){const a=newGame('codebreaker',2,String(i)).secret;assert.deepEqual(codeFeedback(a,a),{exact:5,other:0});const b=shuffle(a,rng(i));const f=codeFeedback(a,b);assert.equal(f.exact+f.other,5);}
});
test('pipe generator creates connected solvable boards, scrambled away from completion',()=>{
 for(const n of [3,4,5])for(let i=0;i<150;i++){const p=makePipes(n,rng(String(i)));assert.equal(pipeSolved(p.solution,n),true);assert.equal(connectedTiles(p.solution,n).length,n*n);assert.equal(pipeSolved(p.tiles,n),false);p.tiles.forEach((v,k)=>assert.ok([0,1,2,3].some(r=>rotate(v,r)===p.solution[k])));}
});
test('pipe solver rejects off-board exits and disconnected closed components',()=>{
 assert.equal(pipeSolved([3,12,3,9],2),false);
 assert.equal(pipeSolved([2,8,2,8,2,8,2,8,2],3),false);
 for(let x=1;x<16;x++)assert.equal(rotate(x,4),x);
});
test('arithmetic offers one correct answer, unique choices and no unintended negatives',()=>{
 for(let l=0;l<3;l++)for(let i=0;i<500;i++){const q=makeMath(l,rng(`${l}-${i}`));assert.equal(q.choices.length,4);assert.equal(new Set(q.choices).size,4);assert.equal(q.choices.filter(x=>x===q.answer).length,1);assert.ok(q.answer>=0);assert.equal(q.answer,q.op==='+'?q.a+q.b:q.op==='−'?q.a-q.b:q.a*q.b);}
});
test('image recall trials replace exactly one symbol',()=>{for(let l=0;l<3;l++){const g=newGame('what-changed',l,'images');for(const x of g.trials){assert.equal(x.before.includes(x.answer),false);assert.equal(x.after.includes(x.answer),true);assert.equal(x.after.filter(v=>!x.before.includes(v)).length,1);}}});
test('daily selection covers memory, logic and arithmetic with a UTC date',()=>{
 assert.equal(dailyKey(new Date('2026-10-19T23:30:00-02:00')),'2026-10-20');
 for(let i=0;i<30;i++){const picks=dailyGames('2026-10-'+i);assert.ok(picks[0]>=0&&picks[0]<=2);assert.ok(picks[1]===3||picks[1]===4);assert.equal(picks[2],5);}
});
test('all locales have the same keys and nine names, descriptions and instructions',()=>{const base=Object.keys(i18n.en).sort();for(const t of Object.values(i18n)){assert.deepEqual(Object.keys(t).sort(),base);for(const k of ['names','desc','rules'])assert.equal(t[k].length,9);assert.equal(t.symbols.length,16);assert.ok(Object.values(t).every(v=>Array.isArray(v)||typeof v==='string'&&v.length));}});

import {revealMine,flagMine,mineNumber,ticMove,ticComputer,navalShot,navalComputer,neighbours} from '../src/classic-engine.mjs';
test('mines: safe first neighbourhood, flags, flood fill, win and loss across 300 boards',()=>{
 for(let i=0;i<100;i++)for(let level=0;level<3;level++){const g=newGame('minesweeper',level,String(i)),first=i%36;flagMine(g,first);revealMine(g,first,rng(i));assert.equal(g.generated,false);flagMine(g,first);revealMine(g,first,rng(i));assert.equal(g.mines.length,[5,7,9][level]);assert.equal(new Set(g.mines).size,g.mineCount);assert.ok([first,...neighbours(first,6)].every(k=>!g.mines.includes(k)));assert.equal(mineNumber(g,first),0);assert.ok(g.opened.length>1);if(!g.outcome){const loss=structuredClone(g);revealMine(loss,g.mines[0],rng(i));assert.equal(loss.outcome,'loss');}for(let k=0;k<36;k++)if(!g.mines.includes(k))revealMine(g,k,rng(i));assert.equal(g.outcome,'win');assert.equal(g.opened.length,36-g.mineCount);}
});
test('hard tic-tac-toe never loses against any sequence of human moves',()=>{let ends=0;function walk(g){if(g.outcome){assert.notEqual(g.outcome,'win');ends++;return;}if(g.turn==='O'){const copy=structuredClone(g);ticMove(copy,ticComputer(copy.board,2,rng('bot')),'O');walk(copy);}else for(let k=0;k<9;k++)if(!g.board[k]){const copy=structuredClone(g);ticMove(copy,k,'X');walk(copy);}}walk(newGame('tic-tac-toe',2,'tic'));assert.ok(ends>100);});
test('sea battle fleets are valid, opponents do not repeat shots and rounds terminate',()=>{for(let i=0;i<100;i++){const g=newGame('sea-battle',i%3,String(i));for(const fleet of [g.playerFleet,g.enemyFleet]){assert.deepEqual(fleet.map(s=>s.length),[3,2,2]);assert.equal(new Set(fleet.flat()).size,7);for(let a=0;a<3;a++)for(let b=a+1;b<3;b++)assert.ok(fleet[a].every(k=>!neighbours(k,6).some(j=>fleet[b].includes(j))));}let turns=0;while(!g.outcome&&turns++<72){if(g.turn==='X')navalShot(g,Array.from({length:36},(_,k)=>k).find(k=>!g.shots.includes(k)),'X');else{const k=navalComputer(g,g.level,rng(`${i}:${turns}`));assert.ok(!g.enemyShots.includes(k));navalShot(g,k,'O');}}assert.ok(g.outcome);}});
