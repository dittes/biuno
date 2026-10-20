// Five-letter words per language. Letters are compared without accents.
export const WORDS={
 en:'apple beach brain bread brush chair chalk charm chase cheer chess cloud clock coast crane dance dream drink eagle earth field flame fruit ghost glass grape grass green heart honey horse house juice knife light lemon magic maple mouse music night ocean olive paint paper peace pearl piano pilot plant queen river robot round salad scale sheep shell shine smile snake solar space spice spoon stone storm sugar sunny table tiger toast tower train trust uncle voice water whale wheat wheel world young zebra beard candy daisy fairy giant happy ivory jelly koala lucky mango noble orbit pizza'.split(' '),
 de:'Apfel Birne Blume Brief Dachs Decke Engel Erbse Farbe Feder Feuer Fisch Gabel Gurke Hafen Hotel Insel Jacke Kamel Katze Kerze Kiste Kranz Küche Lampe Leben Leder Linse Mango Mauer Meise Milch Mücke Nacht Nadel Nebel Nudel Pferd Pilot Platz Pudel Radio Regen Reise Rinde Rosen Salat Sahne Schaf Seife Sonne Stern Stuhl Tafel Tasse Tiger Tisch Torte Traum Vogel Waage Wachs Wagen Wiese Wolke Wurst Zebra Zange Zebra Bären Büsche Häuser Kälte Löwen Mäuse Gänse Fähre Hände Bäume'.split(' '),
 cs:'strom kráva lampa kniha mléko holub tráva zámek kočka leden škola židle pokoj cesta dívka chléb ovoce město hudba motor ticho vítr mraky měsíc louka potok bouře kolej žába babka bluza černá dálka dveře hrnek houba jelen kapka klíče kopec malba mince oblak obraz okraj prsty ptáci srdce stěna stoly střed svíce šátek škoda tanec tykev úsměv večer věnec vrána zboží zlato zvony zvíře pivní velká malé stará mladý plamen loutka hodiny jasno pláže sladký slovo světlo'.split(' '),
 pl:'kwiat łódka lampa mleko rzeka domek chleb drzwi balon banan bocian dzban głowa grusza jajko klucz kolor krowa kreda kubek lalka ławka miska mucha nożyk obrus owoce pajac palec piłka pokój ptaki rower sałata sklep słowo szafa szyba tarcza torba ulica wazon widok zegar ogród drzewo trawa wyspa łąka potok burza śnieg lato jesień pociąg wieża zamek ptak koza krowa kura gęś pszczoła motyl ogień wiatr deszcz chmura tęcza obraz farba pędzel'.split(' ')
};
export const fold=s=>s.normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/ł/g,'l').replace(/Ł/g,'L').replace(/ß/g,'ss').toUpperCase();
export const wordList=lang=>[...new Set((WORDS[lang]||WORDS.en).filter(w=>fold(w).length===5&&/^[A-Z]+$/.test(fold(w))))];
export const WORD_TRIES=[8,6,5];
export function wordNew(level,random){return {tries:WORD_TRIES[level],wi:Math.floor(random()*100000),guesses:[],cur:'',outcome:null};}
export const wordSecret=(g,lang)=>{const l=wordList(lang);return l[g.wi%l.length];};
export function wordScoreRow(secret,guess){
 const s=[...secret],g=[...guess],res=Array(5).fill('absent'),left={};
 g.forEach((c,i)=>{if(c===s[i])res[i]='correct';else left[s[i]]=(left[s[i]]||0)+1;});
 g.forEach((c,i)=>{if(res[i]!=='correct'&&left[c]>0){res[i]='present';left[c]--;}});
 return res;
}
export const wordScore=g=>g.outcome==='win'?Math.max(200,1100-(g.guesses.length-1)*(g.tries>=8?110:g.tries===6?150:190)):0;
export const KEYS={en:['QWERTYUIOP','ASDFGHJKL','ZXCVBNM'],de:['QWERTZUIOP','ASDFGHJKL','YXCVBNM'],cs:['QWERTZUIOP','ASDFGHJKL','YXCVBNM'],pl:['QWERTYUIOP','ASDFGHJKL','ZXCVBNM']};
export function wordBoard(g,t,lang,preview=false){
 const secret=fold(wordSecret(g,lang)),rows=[];
 for(let r=0;r<g.tries;r++){
  const word=g.guesses[r],isCur=!word&&r===g.guesses.length&&!g.outcome,letters=word||(isCur?g.cur:''),res=word?wordScoreRow(secret,word):[];
  rows.push(`<div class="wd-row ${isCur?'cur':''} ${g.reveal&&r===g.guesses.length-1?'reveal':''} ${g.shake&&isCur?'shake':''}" role="row">${Array.from({length:5},(_,i)=>`<i class="wd-tile ${res[i]||''} ${letters[i]?'has':''}" style="--i:${i}" role="cell" ${res[i]?`aria-label="${letters[i]}, ${t['wd_'+res[i]]}"`:''}>${letters[i]||''}</i>`).join('')}</div>`);
 }
 const state={};g.guesses.forEach(w=>{const res=wordScoreRow(secret,w);[...w].forEach((c,i)=>{const o={correct:3,present:2,absent:1};if((o[res[i]]||0)>(o[state[c]]||0))state[c]=res[i];});});
 const kb=preview?'':`<div class="wd-kb">${(KEYS[lang]||KEYS.en).map((row,ri)=>`<div>${ri===2?`<button type="button" class="wd-key wide" data-action="wkey" data-value="Enter" aria-label="${t.enter}">↵</button>`:''}${[...row].map(c=>`<button type="button" class="wd-key ${state[c]||''}" data-action="wkey" data-value="${c}">${c}</button>`).join('')}${ri===2?`<button type="button" class="wd-key wide" data-action="wkey" data-value="Backspace" aria-label="${t.delete}">⌫</button>`:''}</div>`).join('')}</div>`;
 return `<p class="game-message" role="status">${g.outcome==='loss'?`${t.wordWas}: <strong>${wordSecret(g,lang).toUpperCase()}</strong>`:g.msg||'&nbsp;'}</p><div class="wd-grid" role="grid">${rows.join('')}</div>${kb}`;
}
export const wordStats=(g,t)=>`<span>${t.guess}: <strong>${g.guesses.length} / ${g.tries}</strong></span>`;
