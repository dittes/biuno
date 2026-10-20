// Original solid silhouettes. Holes use evenodd paths so every symbol adapts
// to light or dark game tiles without a fixed background colour.
const paths=[
 '<path fill-rule="evenodd" d="M10 35C3 17 18 6 40 6c1 22-10 37-27 29L7 42l-3-3 6-4Zm4-5 18-16-14 20-4-4Z"/>',
 '<circle cx="24" cy="24" r="10"/><path fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" d="M24 3v5m0 32v5M3 24h5m32 0h5M9 9l4 4m22 22 4 4M9 39l4-4m22-22 4-4"/>',
 '<path fill-rule="evenodd" d="M7 13h28v3h4a9 9 0 0 1 0 18h-5a9 9 0 0 1-8 7H16a9 9 0 0 1-9-9V13Zm28 8v8h4a4 4 0 0 0 0-8h-4Z"/><path fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" d="M15 4v3m11-3v3"/>',
 '<path fill-rule="evenodd" d="M16 4a12 12 0 1 0 6 22l17 17 6-6-5-5-4 4-4-4 4-4-8-8A12 12 0 0 0 16 4Zm0 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Z"/>',
 '<path fill-rule="evenodd" d="M3 8c8-3 15-1 21 3 6-4 13-6 21-3v32c-8-2-14-1-21 4-7-5-13-6-21-4V8Zm19 7h4v23h-4V15ZM8 16h10v3H8v-3Zm22 0h10v3H30v-3ZM8 24h10v3H8v-3Zm22 0h10v3H30v-3Z"/>',
 '<path fill-rule="evenodd" d="M2 23 24 3l22 20-4 4-3-3v20H9V24l-3 3-4-4Zm18 21h8V28h-8v16Z"/>',
 '<path d="M24 2 8 20h8L3 36h16v10h10V36h16L32 20h8L24 2Z"/>',
 '<path fill-rule="evenodd" d="M3 24c11-20 25-20 35-4l8-9v26l-8-9C28 44 14 44 3 24Zm13-6a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z"/>',
 '<path d="m24 2 7 14 15 3-11 11 2 16-13-7-14 7 3-16L1 19l16-3 7-14Z"/>',
 '<path d="M2 24a22 22 0 0 1 44 0H2Z"/><path fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" d="M24 24v14a6 6 0 0 0 12 0M24 2V1"/>',
 '<path fill-rule="evenodd" d="M24 14C8-7-4 16 12 23-6 38 17 45 24 31c7 14 30 7 12-8 16-7 4-30-12-9Zm0 3a6 6 0 1 1 0 12 6 6 0 0 1 0-12Z"/><path d="M21 32h6v14h-6z"/>',
 '<path d="M35 3A22 22 0 1 0 45 35 22 22 0 0 1 35 3Z"/>',
 '<path d="m24 2 21 22-21 22L3 24 24 2Z"/>',
 '<path d="M10 18a14 14 0 0 1 28 0v11l6 8H4l6-8V18Zm8 23h12a6 6 0 0 1-12 0ZM21 1h6v5h-6z"/>',
 '<path d="M25 2v28h20L25 2ZM20 8 3 30h17V8ZM2 34h44l-9 12H11L2 34Z"/>',
 '<path d="M24 44 5 26C-7 13 10-3 24 11 38-3 55 13 43 26L24 44Z"/>'
];
const emoji=['🍃','☀️','☕','🔑','📖','🏠','🌳','🐟','⭐','☂️','🌼','🌙','💎','🔔','⛵','❤️'];
export function icon(i,cls=''){return `<span class="emoji-symbol ${cls}" aria-hidden="true">${emoji[i%emoji.length]}</span>`;}
export function sequencePad(k,disabled=false,label=''){return `<button type="button" class="cell sequence-pad pad-${k}" data-action="pick" data-value="${k}" data-focus="pick-${k}" aria-label="${label||k+1}" ${disabled?'disabled':''}><span>${k+1}</span></button>`;}
export function pipe(mask,root=false){return `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="13" stroke-linecap="round" aria-hidden="true">${mask&1?'<path d="M32 32V0"/>':''}${mask&2?'<path d="M32 32h32"/>':''}${mask&4?'<path d="M32 32v32"/>':''}${mask&8?'<path d="M32 32H0"/>':''}<circle cx="32" cy="32" r="${root?13:6}" fill="currentColor" stroke-width="0"/>${root?'<circle cx="32" cy="32" r="5" style="fill:var(--surface)" stroke-width="0"/>':''}</svg>`;}
export function preview(i){
 if(i===0)return `<div class="preview-cards">${[0,1,2,3,1,0].map((v,k)=>`<span class="${k===2||k===3?'covered':''}">${k===2||k===3?'<span class="card-dot"></span>':icon(v)}</span>`).join('')}</div>`;
 if(i===1)return `<div class="preview-change">${[4,6,1,2].map((v,k)=>`<span class="${k===3?'outlined':''}">${icon(v)}</span>`).join('')}</div>`;
 if(i===2)return `<div class="preview-sequence">${[0,1,2,3].map(k=>`<span class="pad-${k}">${k+1}</span>`).join('')}</div>`;
 if(i===3)return `<div class="preview-code">${[0,1,3].map(v=>`<div>${[1,8,12,11].map((n,k)=>`<span>${icon(n+v)}</span>`).join('')}<b>${v===0?'● ○':v===1?'● ●':'● ● ● ●'}</b></div>`).join('')}</div>`;
 if(i===6)return '<div class="classic-preview">🚩 <b>1</b> <b>2</b><br>1 ◻ ◻</div>';
 if(i===7)return '<div class="classic-preview">⛵<br>· × ·<br>· · ×</div>';
 if(i===8)return '<div class="classic-preview tic-preview">X O X<br>· O ·<br>X · ·</div>';
 if(i===4)return `<div class="preview-pipes">${[6,10,12,3,12,5,2,11,9].map((v,k)=>`<span>${pipe(v,k===0)}</span>`).join('')}</div>`;
 return '<div class="preview-math"><span>12 <b>+</b> 7</span><div><i>17</i><i class="answer-preview">19</i><i>21</i></div></div>';
}
