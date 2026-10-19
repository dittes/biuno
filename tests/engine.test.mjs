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
test('all locales have the same keys and six names, descriptions and instructions',()=>{const base=Object.keys(i18n.en).sort();for(const t of Object.values(i18n)){assert.deepEqual(Object.keys(t).sort(),base);for(const k of ['names','desc','rules'])assert.equal(t[k].length,6);assert.equal(t.symbols.length,16);assert.ok(Object.values(t).every(v=>Array.isArray(v)||typeof v==='string'&&v.length));}});
