const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const html=fs.readFileSync(__dirname+'/index.html','utf8'),els=new Map();
const defaults={kind:'super',protocol:'updown',rate:'.01',muMin:'-.45',muMax:'.65',seed:'.05',omega:'1',speed:'5',tail:'25',noise:'0',randomSeed:'42'};
const ctx=new Proxy({},{get:(o,k)=>o[k]??(()=>{}),set:(o,k,v)=>(o[k]=v,true)});
function el(id){if(!els.has(id))els.set(id,{value:defaults[id]??'',checked:id==='branches',textContent:'',width:600,height:300,handlers:{},addEventListener(n,f){this.handlers[n]=f;},setAttribute(n,v){this[n]=v;},getBoundingClientRect(){return {width:600,height:300};},getContext(){return ctx;},click(){},closest(){return {querySelector(){return {textContent:'Plot'};}};},toBlob(fn){fn({});}});return els.get(id);}
let exported;const b={console,document:{getElementById:el,createElement:()=>el(Symbol())},requestAnimationFrame(){},setTimeout(){},URL:{createObjectURL(x){exported=x;return 'blob:test';},revokeObjectURL(){}},Blob:class {constructor(parts){this.text=parts.join('');}},addEventListener(){},devicePixelRatio:1};b.window=b;vm.createContext(b);
for(const script of html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g))vm.runInContext(script[1],b);
const ev=c=>vm.runInContext(c,b),state=()=>JSON.parse(ev('JSON.stringify({t:s.t,mu:s.mu,u:s.u,done:s.done,n:history.length})'));
ev('frame(0);frame(100);');const first=state();assert(first.t>.49);
el('hold').onclick();const hold=state();ev('frame(200);frame(300);');const held=state();assert(held.t>hold.t);assert.equal(held.mu,hold.mu);assert.notEqual(held.u,hold.u);
el('play').onclick();const paused=state();ev('frame(400);frame(500);');assert.deepEqual(state(),paused);
el('kick').onclick();const kicked=state();assert.equal(kicked.t,paused.t);assert.equal(kicked.mu,paused.mu);assert(Math.abs(Math.exp(kicked.u)-Math.exp(paused.u)-.02)<1e-12);
el('hold').onclick();el('play').onclick();ev('frame(600);frame(700);');assert(state().mu>held.mu);
// View switching must not change state, history, playback, or the noise generator.
const beforeView=state(),rngBefore=ev('s.rng'),runningBefore=ev('running');
for(const [id,variable] of [['viewX','x'],['viewY','y'],['viewR','r']]){el(id).onclick();assert.equal(ev('parameterView'),variable);assert.equal(el(id)['aria-pressed'],'true');assert.equal(el('parameterCaption').textContent,variable+' versus μ');assert.deepEqual(state(),beforeView);assert.equal(ev('s.rng'),rngBefore);assert.equal(ev('running'),runningBefore);}
el('logScale').checked=true;el('viewX').onclick();assert(el('parameterNote').textContent.includes('linear'));assert.equal(el('amplitudeScale').textContent.includes('log'),true);el('logScale').checked=false;el('viewR').onclick();
el('csv').onclick();const rows=exported.text.trim().split('\n');assert(rows[0].includes('log_r'));assert(rows.length>10);assert(rows.slice(1).some(r=>r.split(',')[7]==='1'));
el('png').onclick();assert(exported);
el('kind').value='sub';el('kind').handlers.change();assert.equal(state().t,0);
el('protocol').value='downup';el('protocol').handlers.change();assert.equal(state().mu,.65);assert(Math.exp(state().u)>1);
el('logScale').checked=true;el('logScale').handlers.change();assert(el('amplitudeScale').textContent.includes('log'));
el('noise').value='.001';el('noise').handlers.change();assert.equal(state().t,0);assert.equal(el('noiseValue').textContent,'0.001');
console.log('PASS: startup, playback, hold/resume, pause, perturbation continuity, CSV with held samples and logarithmic amplitude, PNG composition, preset restart, downward start, and log view.');
