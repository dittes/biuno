import {readFile,readdir,stat} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import assert from 'node:assert/strict';
const root=resolve('dist');
async function files(dir){const all=[];for(const f of await readdir(dir)){const p=join(dir,f);if((await stat(p)).isDirectory())all.push(...await files(p));else all.push(p);}return all;}
const all=await files(root),htmls=all.filter(f=>f.endsWith('.html'));
let links=0;
for(const f of htmls){const html=await readFile(f,'utf8');assert.match(html,/<html lang="(en|de|cs|pl)"/);assert.match(html,/<title>[^<]+<\/title>/);assert.doesNotMatch(html,/<a\b[^>]*href="https?:/);assert.doesNotMatch(html,/Hasbro|Ravensburger|Microsoft|Simon|Windows/);assert.doesNotMatch(html,/fonts\.googleapis|fonts\.gstatic|cdn\.jsdelivr|unpkg\.com/);
 for(const m of html.matchAll(/(?:href|src)="(\/(?!\/)[^"?#]*)/g)){const path=m[1];const target=join(root,path)+(path.endsWith('/')?'index.html':'');assert.ok((await stat(target)).isFile(),`${f}: missing ${path}`);links++;}
 if(!f.endsWith('/404.html')&&f!==join(root,'index.html')){assert.match(html,/rel="canonical"/);for(const l of ['en','de','cs','pl'])assert.ok(html.includes(`hreflang="${l}"`));assert.match(html,/mailto:biuno@dittes.info|\/imprint\//);}
}
const sw=await readFile(join(root,'sw.js'),'utf8');assert.match(sw,/biuno-[a-f0-9]{12}/);
console.log(`Verified ${htmls.length} HTML files, ${links} local links, language alternates and offline cache.`);
