import {icon,pipe} from './art.mjs';
import {classicIds} from './classic-engine.mjs';
import {classicBoard} from './classic-ui.mjs';
import {mergeBoard,sudokuBoard} from './puzzle.mjs';
const sym=[1,8,12,11,0,3];
export function encouragement(g,t,lang='en'){
 const previous=g.previousBest||0,played=g.previousPlayed||0,format=n=>n.toLocaleString(lang);
 let message;
 if(g.score===0)message=t.noScore[played%t.noScore.length];
 else if(!played)message=t.firstBest;
 else if(g.score>previous)message=t.newBest.replace('{points}',format(g.score-previous));
 else if(g.score===previous)message=t.tiedBest;
 else{const gap=previous-g.score;message=(gap<=Math.max(50,previous*.15)?t.closeBest:t.gapBest).replace('{points}',format(gap));}
 return {message,invite:t.encourage[played%t.encourage.length],celebrate:g.won||g.score>previous};
}
// Result art is a non-interactive view of the actual completed state.
export function finalBoard(g,t){
 if(classicIds.includes(g.id))return classicBoard(g,t,true);
 if(g.id==='merge')return mergeBoard(g,t,true);
 if(g.id==='sudoku')return sudokuBoard(g,t,true);
 if(g.id==='matching-pairs')return `<div class="board mini-pairs" style="--cols:4">${g.cards.map((v,k)=>`<span class="cell ${g.matched.includes(k)?'matched':''}">${icon(v)}</span>`).join('')}</div>`;
 if(g.id==='pipes')return `<div class="board pipe-board" style="--cols:${g.n}">${g.tiles.map((v,k)=>`<span class="cell pipe-tile reached">${pipe(v,k===0)}</span>`).join('')}</div>`;
 if(g.id==='what-changed'){const trial=g.trials[Math.min(g.round,4)];return `<div class="board" style="--cols:${g.level===0?2:3}">${trial.after.map(v=>`<span class="cell ${v===trial.answer?'snapshot-answer':''}">${icon(v)}</span>`).join('')}</div>`;}
 if(g.id==='sequence-memory'){const sequence=g.sequences[Math.min(g.round,4)];return `<div class="snapshot-sequence">${sequence.map(k=>`<span class="pad-${k}">${k+1}</span>`).join('')}</div>`;}
 if(g.id==='codebreaker')return `<div class="snapshot-code">${g.secret.map(v=>`<span class="cell">${icon(sym[v])}</span>`).join('')}</div>`;
 const q=g.questions[Math.min(g.round,9)];return `<div class="snapshot-math">${q.a} ${q.op} ${q.b}<br>= ${q.answer}</div>`;
}
export function confetti(){return `<div class="confetti" aria-hidden="true">${Array.from({length:110},(_,k)=>`<i class="confetti-${k%6}" style="--x:${(k*37)%100}%;--delay:${k%11*160}ms;--dur:${3200+(k*83)%2600}ms;--drift:${(k%9-4)*38}px;--spin:${(k%2?1:-1)*(360+k*29)}deg;--w:${7+k%5*3}px;--h:${10+k%4*4}px"></i>`).join('')}</div>`;}
