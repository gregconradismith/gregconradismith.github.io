// Dependency-free interaction smoke checks. Real layout is checked in a browser.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const html = fs.readFileSync(__dirname + '/index.html', 'utf8');
const elements = new Map();
const defaults = {excitatory:'exc', inhibitory:'inh', count:'2', strength:'1', initial:'0.3', speed:'12', selected:'-1', 'trace-view':'overlay', window:'160'};
const textDraws=[], strokeDraws=[];
const context = new Proxy({
  measureText:text=>({width:String(text).length*6}),
  fillText:(text,x,y)=>textDraws.push({text:String(text),x,y,align:context.textAlign,baseline:context.textBaseline}),
  stroke:()=>strokeDraws.push({color:context.strokeStyle,width:context.lineWidth})
}, {get:(o,k) => o[k] ?? (()=>{}), set:(o,k,v) => (o[k]=v,true)});
function element(id) {
  if (!elements.has(id)) elements.set(id, {
    value:defaults[id] ?? '', checked:['excitatory','coupling'].includes(id),
    textContent:'', innerHTML:'', disabled:false, width:600, height:300,
    children:[], handlers:{}, style:{setProperty(){}}, classList:{toggle(){}},
    addEventListener(name, fn) { this.handlers[name] = fn; },
    setAttribute(name, value) { this[name] = value; },
    append(child) { this.children.push(child); },
    replaceChildren(...children) { this.children = children; },
    getBoundingClientRect() { return {width:600,height:300,left:0,top:0}; },
    getContext() { return context; }
  });
  return elements.get(id);
}
let nextFrame;
const sandbox = {console, requestAnimationFrame(fn) { nextFrame = fn; }, devicePixelRatio:1,
  addEventListener(){}, document:{hidden:false, getElementById:element,
    createElement:()=>element(Symbol()), querySelector:element, addEventListener(){}}
};
sandbox.window = sandbox;
vm.createContext(sandbox);
for (const script of html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)) vm.runInContext(script[1], sandbox);
const app = sandbox.FHNSimulator, F = sandbox.FHN;
const state = () => JSON.parse(JSON.stringify(app.getState()));
const fire = (id, event) => { assert(element(id).handlers[event], `${id} has a ${event} handler`); element(id).handlers[event](); };
const sameDynamics = (a,b) => { for (const key of ['state','time','running','historyLength','spikes']) assert.deepEqual(a[key],b[key],key); };
// Every family member must be a true instantaneous nullcline for some count
// of active partners, including coincident curves at N=1 or g=0.
for(const mode of ['exc','inh']) for(let n=1;n<=12;n++) for(const g of [0,F.defaults(mode,n).g,3]) {
  const p={...F.defaults(mode,n),g}, family=F.nullclineFamily(p), single=n===1||g===0;
  assert.equal(family.length,single?1:n);
  assert(Math.abs(family.find(entry=>entry.label==='free').input)<1e-12);
  if(!single) {
    const extreme=family.find(entry=>entry.label===(mode==='exc'?'excited':'inhibited'));
    assert.equal(extreme.input,(mode==='exc'?1:-1)*g);
    assert.equal(family.filter(entry=>entry.label==='').length,n-2);
  }
  for(let k=1;k<family.length;k++) assert(family[k].input>family[k-1].input);
  for(const entry of family) for(const v of [-2,.5,2]) {
    const state=new Float64Array(2*n);
    for(let i=0;i<n;i++) state[2*i]=-1;
    const active=single?0:Math.round(Math.abs(entry.input)/g*(n-1));
    for(let i=1;i<=active;i++) state[2*i]=1;
    state[0]=v; state[1]=F.nullcline(v,entry.input,p);
    assert(Math.abs(F.inputs(state,p)[0]-entry.input)<1e-12);
    assert(Math.abs(F.derivatives(state,p)[0])<1e-12);
  }
}
function verifyFamilyDrawing(mode,n) {
  textDraws.length=0; strokeDraws.length=0; app.draw();
  const family=F.nullclineFamily(state().p);
  for(const label of [...family.filter(entry=>entry.label).map(entry=>entry.label),'Voltage threshold','Inactive','Active']) assert(textDraws.some(entry=>entry.text===label),`${label} is drawn`);
  assert.equal(strokeDraws.filter(stroke=>['#87959e','#b0b9be'].includes(stroke.color)).length,family.length);
  if(state().selected===-2) {
    assert.equal(strokeDraws.filter(stroke=>stroke.width===2.6).length,0,'None hides only the colored current cubics.');
    assert.equal(strokeDraws.filter(stroke=>stroke.width===2).length,n,'None retains every colored trajectory.');
    assert(element('neuron-buttons').children.every(button=>button['aria-pressed']==='false'));
    assert.equal(element('.legend .selected').style.display,'none');
  } else {
    assert(strokeDraws.some(stroke=>stroke.width===2.6),'All or individual focus restores current cubics.');
    assert.equal(element('.legend .selected').style.display,'flex');
  }
  const p=state().p, signed=(mode==='exc'?1:-1)*p.g;
  const ymin=Math.min(-1.35,p.I+Math.min(0,signed)-1.12),ymax=Math.max(1.35,p.I+Math.max(0,signed)+1.12);
  const box={l:44,r:587,t:13,b:263}; // The mock phase canvas is 600 × 300.
  const X=v=>box.l+(v+3)/6*(box.r-box.l),Y=w=>box.b+(w-ymin)/(ymax-ymin)*(box.t-box.b);
  for(const entry of family.filter(entry=>entry.label)) {
    const label=textDraws.find(draw=>draw.text===entry.label),w=entry.label.length*6;
    const left=label.align==='right'?label.x-w:label.x;
    assert(left-3>=box.l && left+w+3<=box.r,'Nullcline label stays within horizontal plot bounds.');
    assert(label.y-9>=box.t && label.y+9<=box.b,'Nullcline label stays within vertical plot bounds.');
    if((mode==='exc'&&entry.label==='free')||(mode==='inh'&&entry.label==='inhibited')) {
      assert.equal(label.align,'right'); assert(label.x<X(-1),'The lower label ends to the left of the left knee.');
      assert(label.y>Y(F.nullcline(-1,entry.input,p)),'The lower label is centered below the left knee.');
    }
  }
}
let current = state();
assert.equal(current.p.mode,'exc'); assert.equal(current.p.n,2); assert(current.running);
assert.equal(current.selected,-1); assert.equal(current.time,0); assert.equal(current.historyLength,1);
assert.equal(element('selected').children.length,4); assert.equal(element('neuron-buttons').children.length,3);
assert.equal(element('selected').children[0].value,'-2'); assert.equal(element('selected').children[0].textContent,'None');
assert.equal(element('selected').children[1].value,'-1');
assert.equal(element('selected').children[1].textContent,'All neurons');
verifyFamilyDrawing('exc',2);

fire('advance','click');
const advanced = state(); assert.equal(advanced.time,100); assert(!advanced.running);
assert.equal(advanced.historyLength,2001);
element('strength').value='.7'; fire('strength','input');
const changed = state(); sameDynamics(advanced,changed); assert.equal(changed.p.g,.7);
assert.equal(element('strength-value').textContent,'0.70');
let expected = new Float64Array(changed.state);
for (let i=0;i<200;i++) expected=F.step(expected,changed.p);
fire('step','click'); current=state(); assert.equal(current.time,101);
for (let i=0;i<expected.length;i++) assert(Math.abs(current.state[i]-expected[i])<1e-11);
element('coupling').checked=false; fire('coupling','change');
sameDynamics(current,state()); expected=new Float64Array(current.state);
for (let i=0;i<200;i++) expected=F.step(expected,{...current.p,g:0});
fire('step','click'); current=state(); assert.equal(current.time,102);
for (let i=0;i<expected.length;i++) assert(Math.abs(current.state[i]-expected[i])<1e-11);
assert(element('mechanism-text').textContent.includes('off'));

// View and neuron selection controls preserve the simulation.
const beforeView=state();
element('trace-view').value='stacked'; fire('trace-view','change');
element('window').value='320'; fire('window','change');
element('selected').value='0'; fire('selected','change');
sameDynamics(beforeView,state()); assert.equal(state().selected,0);
element('neuron-buttons').children[2].handlers.click(); assert.equal(state().selected,1);
app.draw(); assert.equal(element('input-label').textContent,'Input to neuron 2');
const beforeAll=state(); element('selected').value='-1'; fire('selected','change');
sameDynamics(beforeAll,state()); assert.equal(state().selected,-1);
verifyFamilyDrawing('exc',2);
element('neuron-buttons').children[1].handlers.click(); assert.equal(state().selected,0);
const beforeAllButton=state(); element('neuron-buttons').children[0].handlers.click();
sameDynamics(beforeAllButton,state()); assert.equal(state().selected,-1);
const beforeNone=state(); element('selected').value='-2'; fire('selected','change');
sameDynamics(beforeNone,state()); assert.equal(state().selected,-2); verifyFamilyDrawing('exc',2);
fire('restart','click'); assert.equal(state().selected,-2); verifyFamilyDrawing('exc',2);
element('selected').value='-1'; fire('selected','change'); verifyFamilyDrawing('exc',2);
fire('restart','click'); current=state(); assert.equal(current.time,0); assert(!current.running);
assert.equal(current.historyLength,1); assert.equal(current.p.g,.7); assert(!element('coupling').checked);
assert.equal(current.selected,-1);

// Valid count typing applies immediately; an incomplete field preserves state.
const beforeCount=state(); element('count').value=''; fire('count','input');
assert.deepEqual(state(),beforeCount); assert.equal(element('count').value,'');
element('count').value='1'; fire('count','input'); assert.equal(state().p.n,1);
assert.equal(element('selected').children.length,3); assert.equal(state().selected,-1);
element('count').value='12'; fire('count','input'); current=state();
assert.equal(current.p.n,12); assert.equal(current.state.length,24); assert.equal(current.time,0);
assert.equal(element('selected').children.length,14); assert.equal(element('neuron-buttons').children.length,13);
assert.equal(current.selected,-1); assert.equal(element('trace-view').value,'stacked');
verifyFamilyDrawing('exc',12);
element('selected').value='11'; fire('selected','change'); verifyFamilyDrawing('exc',12);
element('selected').value='-1'; fire('selected','change'); current=state();
element('count').value='100'; fire('count','input'); assert.deepEqual(state(),current);
fire('count','change'); assert.deepEqual(state(),current); assert.equal(element('count').value,'12');
// Both committed invalid entry and +/- controls clamp to the allowed range.
assert(element('more').disabled); fire('more','click'); assert.deepEqual(state(),current);
element('selected').value='11'; fire('selected','change'); assert.equal(state().selected,11);
element('count').value='-5'; fire('count','change'); current=state();
assert.equal(current.p.n,1); assert.equal(current.selected,-1); assert.equal(current.state.length,2);
assert(element('fewer').disabled); fire('fewer','click'); assert.deepEqual(state(),current);
app.draw(); assert(element('timing').innerHTML.includes('One oscillator'));
element('count').value='NaN'; fire('count','change'); assert.equal(state().p.n,1);
fire('more','click'); assert.equal(state().p.n,2); assert.equal(element('trace-view').value,'overlay');

// None hides current cubics without changing state and survives network resets.
const beforePersistentNone=state(); element('selected').value='-2'; fire('selected','change');
sameDynamics(beforePersistentNone,state());
element('count').value='12'; fire('count','input'); assert.equal(state().selected,-2);
verifyFamilyDrawing('exc',12);
element('inhibitory').checked=true; fire('inhibitory','change'); assert.equal(state().selected,-2);
verifyFamilyDrawing('inh',12);
fire('restart','click'); assert.equal(state().selected,-2); verifyFamilyDrawing('inh',12);
element('count').value='2'; fire('count','input'); assert.equal(state().selected,-2);
element('neuron-buttons').children[1].handlers.click(); assert.equal(state().selected,0); verifyFamilyDrawing('inh',2);
element('neuron-buttons').children[0].handlers.click(); assert.equal(state().selected,-1); verifyFamilyDrawing('inh',2);

// Choosing a mode restores that mode's illustrated parameters and coupling.
element('inhibitory').checked=true; fire('inhibitory','change'); current=state();
assert.equal(current.p.mode,'inh'); assert.equal(current.p.I,1); assert.equal(current.p.g,2);
assert(element('coupling').checked); assert(element('inhibitory').checked); assert(!element('excitatory').checked);
assert.equal(element('strength').value,'2'); assert.equal(current.time,0); assert.equal(current.selected,-1);
verifyFamilyDrawing('inh',2);
element('count').value='12'; fire('count','input'); verifyFamilyDrawing('inh',12);
element('selected').value='5'; fire('selected','change'); verifyFamilyDrawing('inh',12);
element('count').value='2'; fire('count','input'); current=state();
const nearby=current.state; element('initial').value='1'; fire('initial','change');
assert.notDeepEqual(state().state,nearby); assert.equal(state().time,0); assert.equal(state().p.mode,'inh'); assert.equal(state().selected,-1);
element('excitatory').checked=true; fire('excitatory','change');
assert.equal(state().p.mode,'exc'); assert.equal(state().p.I,0); assert.equal(state().p.g,1);

// Endpoint labels remain visible at zero/maximum strength and one neuron.
for(const mode of ['exc','inh']) for(const n of [1,2,12]) for(const g of [0,3]) {
  app.reset({mode,n,preset:true}); element('strength').value=String(g); fire('strength','input');
  verifyFamilyDrawing(mode,n);
}
app.reset({mode:'exc',n:2,preset:true});

// The animation clock gives the same model time at every available speed.
for (const speed of [3,12,40,100]) {
  app.pause(); app.reset(); element('speed').value=String(speed); fire('speed','change');
  fire('play','click'); assert(state().running);
  nextFrame(0); for (let i=1;i<=60;i++) nextFrame(i*1000/60);
  assert(Math.abs(state().time-speed)<=F.DT+1e-10);
  fire('play','click'); const paused=state(); nextFrame(1010); nextFrame(1020); assert.deepEqual(state(),paused);
}
console.log('PASS: nullcline family count/extremes/residuals, endpoint label placement/bounds, persistent family/region labels, None/All/individual views, pause/run, explicit advancement, live coupling with state/history preserved, restart, count limits, mode/phase restart, and all playback speeds.');
