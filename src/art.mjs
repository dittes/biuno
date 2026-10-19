const paths=[
 '<path d="M12 31C9 15 19 9 34 8c0 14-5 26-20 23m0 0 14-16M13 32l-4 5"/>',
 '<circle cx="24" cy="24" r="8"/><path d="M24 3v6m0 30v6M3 24h6m30 0h6M9 9l4 4m22 22 4 4M9 39l4-4m22-22 4-4"/>',
 '<path d="M10 15h25v16a7 7 0 0 1-7 7H17a7 7 0 0 1-7-7V15Zm25 2h3a6 6 0 0 1 0 12h-3M16 5v4m9-4v4"/>',
 '<circle cx="16" cy="17" r="8"/><path d="m22 23 17 17m-7-7 5-5m-1 9 5-5"/>',
 '<path d="M24 12C17 8 11 8 5 10v28c6-2 12-2 19 2 7-4 13-4 19-2V10c-6-2-12-2-19 2Zm0 0v28M10 16h7m-7 6h7m14-6h7m-7 6h7"/>',
 '<path d="m5 22 19-17 19 17M10 18v24h28V18M20 42V28h9v14"/>',
 '<path d="m24 5 14 17h-7l12 13H5l12-13h-7L24 5Zm0 30v9"/>',
 '<path d="M7 24c9-18 21-18 31 0-10 18-22 18-31 0Zm31 0 7-8v16l-7-8Z"/><circle cx="17" cy="21" r="1"/>',
 '<path d="m24 4 6 13 14 2-11 10 3 15-12-7-12 7 3-15L4 19l14-2 6-13Z"/>',
 '<path d="M5 23a19 19 0 0 1 38 0H5Zm19 0v15a5 5 0 0 0 10 0M24 3v2"/>',
 '<circle cx="24" cy="20" r="5"/><path d="M24 15c-9-15-20-1-9 5-15 9-1 20 5 9 9 15 20 1 9-5 15-9 1-20-5-9ZM24 31v13m0-6 9-4"/>',
 '<path d="M34 7A19 19 0 1 0 41 34 19 19 0 0 1 34 7Z"/>',
 '<path d="m24 4 17 20-17 20L7 24 24 4Zm0 0v40M7 24h34"/>',
 '<path d="M11 32h26l-4-6v-9a9 9 0 0 0-18 0v9l-4 6Zm8 6a5 5 0 0 0 10 0M24 4v4"/>',
 '<path d="m24 5 14 22H24V5Zm-5 6v16H8l11-16ZM5 32h38l-7 10H12L5 32Z"/>',
 '<path d="M24 40 7 24C-3 13 13 0 24 13 35 0 51 13 41 24L24 40Z"/>'
];
export function icon(i,cls=''){return `<svg class="${cls}" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[i%paths.length]}</svg>`;}
export function pipe(mask,root=false){return `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="9" stroke-linecap="round" aria-hidden="true">${mask&1?'<path d="M32 32V0"/>':''}${mask&2?'<path d="M32 32h32"/>':''}${mask&4?'<path d="M32 32v32"/>':''}${mask&8?'<path d="M32 32H0"/>':''}<circle cx="32" cy="32" r="${root?7:3}" fill="currentColor" stroke-width="0"/></svg>`;}
export function preview(i){
 if(i===0)return `<div class="preview-cards">${[0,1,2,3,1,0].map((v,k)=>`<span class="${k===2||k===3?'covered':''}">${k===2||k===3?'<span class="card-dot"></span>':icon(v)}</span>`).join('')}</div>`;
 if(i===1)return `<div class="preview-change">${[4,6,1,2].map((v,k)=>`<span class="${k===3?'outlined':''}">${icon(v)}</span>`).join('')}</div>`;
 if(i===2)return `<div class="preview-sequence">${[1,8,12,11].map((v,k)=>`<span class="${k===1?'highlight':''}">${icon(v)}</span>`).join('')}</div>`;
 if(i===3)return `<div class="preview-code">${[0,1,3].map(v=>`<div>${[1,8,12,11].map((n,k)=>`<span>${icon(n+v)}</span>`).join('')}<b>${v===0?'● ○':v===1?'● ●':'● ● ● ●'}</b></div>`).join('')}</div>`;
 if(i===4)return `<div class="preview-pipes">${[6,10,12,3,12,5,2,11,9].map((v,k)=>`<span>${pipe(v,k===0)}</span>`).join('')}</div>`;
 return '<div class="preview-math"><span>12 <b>+</b> 7</span><div><i>17</i><i class="answer-preview">19</i><i>21</i></div></div>';
}
