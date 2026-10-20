// Tiny feel layer: synthesised sound (no audio files), haptics and particle bursts.
const KEY='biuno:sound';
export const sound={on:(()=>{try{return localStorage.getItem(KEY)!=='off';}catch{return true;}})()};
export function setSound(on){sound.on=on;try{localStorage.setItem(KEY,on?'on':'off');}catch{}}
const calm=()=>matchMedia('(prefers-reduced-motion:reduce)').matches;
let ctx=null;
function audio(){
 try{
  if(!ctx){const C=window.AudioContext||window.webkitAudioContext;if(!C)return null;ctx=new C();}
  if(ctx.state==='suspended')ctx.resume();
  return ctx;
 }catch{return null;}
}
export function tone(freq,{dur=.18,type='sine',vol=.07,at=0,slide=0}={}){
 if(!sound.on)return;const c=audio();if(!c)return;
 try{
  const t0=c.currentTime+at,o=c.createOscillator(),g=c.createGain();
  o.type=type;o.frequency.setValueAtTime(freq,t0);
  if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(30,freq*slide),t0+dur);
  g.gain.setValueAtTime(.0001,t0);g.gain.exponentialRampToValueAtTime(vol,t0+.015);g.gain.exponentialRampToValueAtTime(.0001,t0+dur);
  o.connect(g).connect(c.destination);o.start(t0);o.stop(t0+dur+.03);
 }catch{}
}
function noise(dur=.25,vol=.08,at=0,cutoff=900){
 if(!sound.on)return;const c=audio();if(!c)return;
 try{
  const n=Math.floor(c.sampleRate*dur),buf=c.createBuffer(1,n,c.sampleRate),d=buf.getChannelData(0);
  for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*(1-i/n);
  const s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain(),t0=c.currentTime+at;
  f.type='lowpass';f.frequency.value=cutoff;g.gain.value=vol;
  s.buffer=buf;s.connect(f).connect(g).connect(c.destination);s.start(t0);
 }catch{}
}
const PAD=[392,330,262,523];
export const sfx={
 flip:()=>tone(540,{dur:.07,type:'triangle',vol:.05}),
 tap:()=>tone(440,{dur:.06,type:'triangle',vol:.05}),
 match:()=>{tone(660,{dur:.12,type:'triangle'});tone(880,{dur:.22,type:'triangle',at:.09});},
 miss:()=>tone(240,{dur:.2,slide:.65,vol:.06}),
 good:()=>{tone(587,{dur:.12,type:'triangle'});tone(880,{dur:.2,type:'triangle',at:.08});},
 bad:()=>{tone(200,{dur:.22,type:'sawtooth',vol:.04,slide:.7});},
 pad:k=>tone(PAD[k%4],{dur:.4,type:'triangle',vol:.1}),
 win:()=>[523,659,784,1047].forEach((f,i)=>tone(f,{dur:.28,type:'triangle',at:i*.1,vol:.08})),
 lose:()=>[392,330,262].forEach((f,i)=>tone(f,{dur:.3,type:'triangle',at:i*.14,vol:.06})),
 rotate:()=>tone(300,{dur:.09,type:'square',vol:.03,slide:1.4}),
 connect:()=>tone(720,{dur:.14,type:'sine',vol:.05}),
 reveal:()=>tone(480,{dur:.06,type:'triangle',vol:.04}),
 flag:()=>{tone(700,{dur:.05,type:'square',vol:.03});tone(940,{dur:.07,type:'square',vol:.03,at:.05});},
 boom:()=>{noise(.5,.18,0,600);tone(90,{dur:.4,type:'sawtooth',vol:.08,slide:.4});},
 splash:()=>noise(.28,.09,0,1800),
 hit:()=>{noise(.22,.14,0,700);tone(160,{dur:.2,type:'square',vol:.04,slide:.5});},
 sunk:()=>{sfx.hit();[523,392,262].forEach((f,i)=>tone(f,{dur:.2,type:'triangle',at:.15+i*.1}));},
 place:k=>tone(k==='X'?520:390,{dur:.1,type:'triangle',vol:.07}),
 click:()=>tone(360,{dur:.05,type:'triangle',vol:.04})
};
export function buzz(ms=12){try{navigator.vibrate?.(ms);}catch{}}
// Small emoji / dot burst from an element (WAAPI, removed when finished).
export function burst(el,{n=10,items=['✨','⭐','💫'],spread=70}={}){
 if(!el||calm())return;
 const r=el.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;
 for(let i=0;i<n;i++){
  const p=document.createElement('span');p.className='spark';p.textContent=items[i%items.length];p.setAttribute('aria-hidden','true');
  document.body.append(p);
  const a=Math.PI*2*i/n+Math.random()*.6,d=spread*(.6+Math.random()*.7),s=.7+Math.random()*.8;
  p.animate([
   {transform:`translate(${cx}px,${cy}px) scale(.2)`,opacity:1},
   {transform:`translate(${cx+Math.cos(a)*d}px,${cy+Math.sin(a)*d-14}px) scale(${s})`,opacity:1,offset:.55},
   {transform:`translate(${cx+Math.cos(a)*d*1.15}px,${cy+Math.sin(a)*d+24}px) scale(${s*.5})`,opacity:0}
  ],{duration:700+Math.random()*250,easing:'cubic-bezier(.2,.8,.2,1)'}).onfinish=()=>p.remove();
 }
}
export function countUp(el,to,ms=900,locale='en'){
 if(calm()||!to){el.textContent=to.toLocaleString(locale);return;}
 const t0=performance.now();
 (function tick(t){const p=Math.min(1,(t-t0)/ms);el.textContent=Math.round(to*(1-Math.pow(1-p,3))).toLocaleString(locale);if(p<1)requestAnimationFrame(tick);})(t0);
}
