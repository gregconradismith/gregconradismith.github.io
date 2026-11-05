// Run with Node.js; no browser packages or external dependencies are needed.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const html=fs.readFileSync(__dirname+'/index.html','utf8');
const ids=new Set(Array.from(html.matchAll(/\bid="([^"]+)"/g),m=>m[1]));
for(const id of ['shape','orientation','dipole-diagram','dipole-b','alternating','clusters','clusters-bar'])assert(!ids.has(id),`${id} was removed from the single-population interface.`);
assert(!/group [AB]|dipole|two.cluster|R₂|alternating/i.test(html),'No former group/dipole description remains in the interface.');
assert.deepEqual(Array.from(html.matchAll(/data-preset="([^"]+)"/g),m=>m[1]),['independent','together']);
assert(/\bstep="1"/.test(html.match(/<input[^>]*id="count"[^>]*>/)[0]),'Every integer neuron count is available.');
assert(/<h2>Power spectral density<\/h2>/.test(html));
const scaleOptions=html.match(/<select[^>]*id="psd-scale"[^>]*>([\s\S]*?)<\/select>/)[1];
assert(/value="log"/.test(scaleOptions)&&/value="linear"/.test(scaleOptions));
const elements=new Map(),contexts=new Map(),calls=[];
const initial={count:'200',frequency:'10',coupling:'0',spread:'12',noise:'.02',speed:'.25',window:'2','psd-scale':'log'};
function canvas(id){
  if(!contexts.has(id)){
    const log={texts:[],strokes:[],fills:[],arcs:0};let points=[];
    const ctx=new Proxy({log,
      clearRect(){log.texts=[];log.strokes=[];log.fills=[];log.arcs=0;},
      beginPath(){points=[];},
      moveTo(x,y){assert(Number.isFinite(x)&&Number.isFinite(y),`${id} has finite plotting coordinates`);points.push([x,y]);},
      lineTo(x,y){assert(Number.isFinite(x)&&Number.isFinite(y),`${id} has finite plotting coordinates`);points.push([x,y]);},
      stroke(){log.strokes.push({color:ctx.strokeStyle,width:ctx.lineWidth,points:points.slice()});},
      fill(){log.fills.push(ctx.fillStyle);},
      arc(){log.arcs++;},fillText(text,x,y){log.texts.push({text:String(text),x,y,align:ctx.textAlign});},
      measureText(text){return {width:String(text).length*6};}
    },{get:(o,k)=>o[k]??(()=>{}),set:(o,k,v)=>(o[k]=v,true)});
    contexts.set(id,ctx);
  }
  return contexts.get(id);
}
function element(id){
  assert(ids.has(id),`App references a real interface element: ${id}`);
  if(!elements.has(id))elements.set(id,{id,value:initial[id]??'',checked:false,textContent:'',innerHTML:'',handlers:{},attributes:{},dataset:{},style:{setProperty(){}},classList:{toggle(){}},
    addEventListener(name,fn){this.handlers[name]=fn;},setAttribute(name,value){this.attributes[name]=value;},getAttribute(name){return this.attributes[name];},
    getBoundingClientRect(){return {width:720,height:260,left:0,top:0};},getContext(){return canvas(id);}});
  return elements.get(id);
}
const presetButtons=['independent','together'].map(id=>{const e=element(id);e.dataset.preset=id;return e;});
let nextFrame,currentModel;
const sandbox={console,document:{hidden:false,getElementById:element,querySelectorAll:selector=>selector==='[data-preset]'?presetButtons:[],addEventListener(){}},
  devicePixelRatio:1,matchMedia:()=>({matches:false}),requestAnimationFrame:fn=>{nextFrame=fn;},addEventListener(){},performance:{now:()=>0}};
sandbox.window=sandbox;vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(__dirname+'/model.js','utf8'),sandbox);
const original=sandbox.BrainWaves,B={...original};
let spectrumCalls=0,lastReturnedSpectrum,spectrumFixture=null;
B.spectrum=(...args)=>{spectrumCalls++;lastReturnedSpectrum=spectrumFixture||original.spectrum(...args);return lastReturnedSpectrum;};
for(const name of ['create','configure','advance','pulse','scramble'])B[name]=(...args)=>{
  const result=original[name](...args);calls.push({name,args});if(name==='create')currentModel=result;return result;
};
sandbox.BrainWaves=B;
vm.runInContext(fs.readFileSync(__dirname+'/app.js','utf8'),sandbox);
const fire=(id,event='click',data={})=>{assert(element(id).handlers[event],`${id}: ${event} listener exists`);element(id).handlers[event](data);};
const set=(id,value,event='input')=>{element(id).value=String(value);fire(id,event);};
const plain=value=>JSON.parse(JSON.stringify(value));
const snapshot=()=>plain({t:currentModel.t,phase:Array.from(currentModel.phase),frequencies:Array.from(currentModel.frequencies),history:currentModel.history,spikes:currentModel.spikes,p:{...currentModel.p}});
const sameActivity=(a,b)=>{for(const key of ['t','phase','spikes'])assert.deepEqual(a[key],b[key],key);};
const samePast=(a,b)=>{sameActivity(a,b);assert.deepEqual(a.history,b.history,'recorded history');};
const paused=()=>assert.equal(element('play').getAttribute('aria-label'),'Run simulation');
const near=(a,b,tol=1e-9)=>assert(Math.abs(a-b)<tol,`${a} differs from ${b}`);
const powerY=(power,scale=element('psd-scale').value)=>scale==='log'?230-(Math.log10(Math.max(1e-6,power))+6)/(Math.log10(2)+6)*212:230-power/2*212;
const powerStroke=()=>canvas('spectrum').log.strokes.find(x=>x.color==='#287c72'&&x.width===1.7);
function checkPlots(){
  for(const id of ['population','raster','signal','spectrum'])assert(canvas(id).log.texts.length>0,`${id} renders labels`);
  assert(canvas('population').log.arcs>=2*currentModel.p.n,'Population view renders all neurons and phase markers.');
  assert.equal(canvas('population').log.fills.filter(color=>color.startsWith('rgba(50,111,160,')).length,currentModel.p.n,'Every neuron uses one population color.');
  assert.equal(canvas('raster').log.strokes.filter(x=>x.color==='#326fa0').length,1,'One population supplies the raster.');
  assert(!canvas('raster').log.texts.some(x=>['A','B'].includes(x.text)));
  const signal=canvas('signal').log,spectrum=canvas('spectrum').log;
  for(const label of ['-1','0','1','Field (a.u.)'])assert(signal.texts.some(x=>x.text===label));
  const powerTicks=element('psd-scale').value==='log'?['10⁻⁶','10⁻⁴','10⁻²','1']:['0','0.5','1','1.5','2'];
  for(const label of [...powerTicks,'100','PSD (a.u.²/Hz)'])assert(spectrum.texts.some(x=>x.text===label),`Spectrum label ${label}`);
  // Check physical power and signal coordinates directly, so equal-height
  // normalization of independent and coherent conditions cannot pass.
  const fieldStroke=signal.strokes.find(x=>x.color==='#203649'&&x.width===2);
  const powerStroke=spectrum.strokes.find(x=>x.color==='#287c72'&&x.width===1.7);
  assert(fieldStroke&&fieldStroke.points.length>100);assert(powerStroke&&powerStroke.points.length>100);
  assert.equal(signal.strokes.filter(x=>x.color==='#326fa02a').length,6,'Six individual currents are drawn.');
  const seconds=Number(element('window').value),rows=currentModel.history.filter(row=>row.t>=currentModel.t-seconds-1e-6);
  assert.equal(fieldStroke.points.length,rows.length,'The trace follows the selected time window.');
  near(fieldStroke.points[0][0],43+(rows[0].t-currentModel.t+seconds)/seconds*667);
  const signalY=value=>230-(value+1.5)/3*212;
  near(fieldStroke.points.at(-1)[1],signalY(currentModel.history.at(-1).signal));
  const psd=original.spectrum(currentModel.history),k=psd.power.indexOf(Math.max(...psd.power));
  near(powerStroke.points[k][1],powerY(psd.power[k]));
  near(powerStroke.points[k][0],54+psd.frequency[k]/100*656);
}

assert.equal(currentModel.p.n,200);near(currentModel.t,6);
assert.equal(currentModel.p.coupling,0);assert.equal(currentModel.p.noise,.02);
assert(currentModel.history.every(row=>row.examples.length===6&&row.examples.every(Number.isFinite)));
assert.equal(element('independent').getAttribute('aria-pressed'),'true');checkPlots();
assert.equal(element('window').value,'2');
assert.equal(element('psd-scale').value,'log');assert(element('spectrum-note').textContent.includes('log scale · display floor 10⁻⁶'));
const start=snapshot();fire('play');paused();samePast(start,snapshot());
nextFrame(0);nextFrame(100);samePast(start,snapshot());
fire('step');paused();near(currentModel.t,start.t+1);assert(currentModel.history.length>start.history.length);

// Every live dynamical slider preserves phase, time, and the measured past.
for(const [id,value,key,expected] of [['frequency',17.5,'frequency',17.5],['coupling',8,'coupling',8],['spread',25,'spread',.25],['noise',.11,'noise',.11]]){
  const before=snapshot(),model=currentModel;set(id,value);assert.equal(currentModel,model);samePast(before,snapshot());paused();near(currentModel.p[key],expected);
  assert(calls.at(-1).name==='configure');
}
paused();checkPlots();

// The display selector redraws only the PSD from its existing cache. It must
// not configure the model, recompute powers, or alter any recorded sample.
const beforeScale=snapshot(),cachedSpectrum=lastReturnedSpectrum,cachedValues=plain(lastReturnedSpectrum);
const callsBeforeScale=calls.length,spectrumCallsBeforeScale=spectrumCalls;
const otherViewStrokes=['population','raster','signal'].map(id=>canvas(id).log.strokes);
set('psd-scale','linear','change');assert.deepEqual(snapshot(),beforeScale);
assert.equal(calls.length,callsBeforeScale);assert.equal(spectrumCalls,spectrumCallsBeforeScale);assert.equal(lastReturnedSpectrum,cachedSpectrum);
assert.deepEqual(plain(lastReturnedSpectrum),cachedValues);checkPlots();
for(const [i,id]of ['population','raster','signal'].entries())assert.equal(canvas(id).log.strokes,otherViewStrokes[i]);
assert(element('spectrum-note').textContent.includes('linear scale · range 0–2'));
set('psd-scale','log','change');assert.deepEqual(snapshot(),beforeScale);assert.equal(spectrumCalls,spectrumCallsBeforeScale);
assert.deepEqual(plain(lastReturnedSpectrum),cachedValues);checkPlots();

// View choices change only plotting, including the visible time window.
const beforeView=snapshot();set('window',6,'change');samePast(beforeView,snapshot());checkPlots();
set('window',2,'change');samePast(beforeView,snapshot());

// Count changes create a new warmed simulation with every other choice intact.
const beforeCount={...currentModel.p},oldModel=currentModel;set('count',119,'change');
assert.notEqual(currentModel,oldModel);assert.equal(currentModel.p.n,119);near(currentModel.t,6);paused();
for(const key of Object.keys(beforeCount).filter(k=>k!=='n'))assert.equal(currentModel.p[key],beforeCount[key],key);
assert.equal(currentModel.phase.length,119);assert.equal(element('count-value').textContent,'119');
fire('restart');assert.equal(currentModel.p.n,119);near(currentModel.t,6);paused();
for(const key of Object.keys(beforeCount).filter(k=>k!=='n'))assert.equal(currentModel.p[key],beforeCount[key],key);

// Presets choose coupling and noise deliberately, and keep odd N.
let independentRms;
for(const [id,coupling,noise]of[['independent',0,.02],['together',24,.02]]){
  fire(id);assert.equal(currentModel.p.n,119);assert.equal(currentModel.p.coupling,coupling);assert.equal(currentModel.p.noise,noise);
  near(currentModel.t,6);paused();assert.equal(element(id).getAttribute('aria-pressed'),'true');checkPlots();
  if(id==='independent')independentRms=Number(element('rms').textContent);
}
assert(original.orders(currentModel.phase).r1>.9);
assert(Number(element('rms').textContent)>.4);
assert(Number(element('rms').textContent)>3*independentRms,'Aligned activity increases the equally added field on the same scale.');

// Perturbations change phases immediately, preserving time, history, and rate.
fire('independent');const beforePulse=snapshot(),events=currentModel.pulses.length;fire('pulse');
near(currentModel.t,beforePulse.t);assert.deepEqual(plain(currentModel.history),beforePulse.history);assert.deepEqual(plain(currentModel.spikes),beforePulse.spikes);
assert.deepEqual(Array.from(currentModel.frequencies),beforePulse.frequencies);assert(original.orders(currentModel.phase).r1>.99);
assert.equal(currentModel.pulses.length,events+1);assert.equal(currentModel.pulses.at(-1).type,'pulse');paused();
const beforeScatter=snapshot();fire('scramble');near(currentModel.t,beforeScatter.t);
assert.deepEqual(plain(currentModel.history),beforeScatter.history);assert.deepEqual(plain(currentModel.spikes),beforeScatter.spikes);
assert.deepEqual(Array.from(currentModel.frequencies),beforeScatter.frequencies);assert(original.orders(currentModel.phase).r1<.25);paused();
assert.equal(currentModel.pulses.at(-1).type,'scramble');

// Playback speed changes only elapsed model time; each rendering frame uses
// the same fixed integrator. Pausing and drawing must never advance it.
for(const speed of [.1,.25,1,2]){
  set('speed',speed,'change');const before=snapshot();fire('play');
  nextFrame(0);for(let i=1;i<=60;i++)nextFrame(i*1000/60);
  near(currentModel.t,before.t+speed,original.DT+1e-8);fire('play');paused();
  const stopped=snapshot();nextFrame(1010);nextFrame(1020);samePast(stopped,snapshot());
}
// Number entry is buffered until Change, Apply, or Enter commits it.
const beforeBuffered=snapshot(),bufferedModel=currentModel;
element('count').value='500';if(element('count').handlers.input)fire('count','input');
assert.equal(currentModel,bufferedModel);samePast(beforeBuffered,snapshot());
fire('apply-count');assert.equal(currentModel.p.n,500);assert.notEqual(currentModel,bufferedModel);near(currentModel.t,6);paused();
const sameCountModel=currentModel,sameCount=snapshot();
fire('apply-count');assert.equal(currentModel,sameCountModel);samePast(sameCount,snapshot());
// Out-of-range entries clamp without restarting an unchanged-size model.
set('count',10000,'change');assert.equal(currentModel.p.n,500);assert.equal(currentModel,sameCountModel);samePast(sameCount,snapshot());
set('count',0,'change');assert.equal(currentModel.p.n,20);
const beforeEnter=currentModel;let prevented=false;
element('count').value='499';fire('count','keydown',{key:'Enter',preventDefault(){prevented=true;}});
assert(prevented);assert.equal(currentModel.p.n,499);assert.equal(currentModel.phase.length,499);assert.notEqual(currentModel,beforeEnter);near(currentModel.t,6);paused();
const afterEnter=currentModel,unchangedEnter=snapshot();
fire('count','keydown',{key:'Enter',preventDefault(){}});assert.equal(currentModel,afterEnter);samePast(unchangedEnter,snapshot());
element('count').value='140';fire('count','keydown',{key:'ArrowRight',preventDefault(){assert.fail('Only Enter is intercepted.');}});
assert.equal(currentModel,afterEnter);samePast(unchangedEnter,snapshot());
checkPlots();

// A frozen physical PSD fixture makes a weak peak comparable across presets,
// while exact-zero/below-floor bins exercise the log baseline without allowing
// the renderer to replace or mutate the underlying powers.
const fixture=Object.freeze({frequency:Object.freeze([0,5,10,20,40,60]),power:Object.freeze([0,1e-12,1e-6,1e-4,1e-3,0]),df:.244140625,duration:4.096,peak:40,peakPower:1e-3});
spectrumFixture=fixture;
function checkFixture(scale){
  assert.equal(element('psd-scale').value,scale);assert.equal(lastReturnedSpectrum,fixture);
  const points=powerStroke().points;assert.equal(points.length,fixture.power.length);
  for(let i=0;i<points.length;i++){near(points[i][0],54+fixture.frequency[i]/100*656);near(points[i][1],powerY(fixture.power[i],scale));}
  if(scale==='log'){
    near(points[0][1],230);near(points[1][1],230);near(points[2][1],230);
    assert(points[4][1]>80&&points[4][1]<180,'A weak 10⁻³ peak is visible near the middle of the log panel.');
  }else assert(points[4][1]>229,'The same weak peak stays small on the physical linear scale.');
}
for(const scale of ['linear','log']){
  set('psd-scale',scale,'change');set('window',6,'change');checkFixture(scale);
  const peakHeight=powerStroke().points[4][1];
  for(const preset of ['independent','together']){fire(preset);checkFixture(scale);near(powerStroke().points[4][1],peakHeight);}
  set('count',321,'change');checkFixture(scale);fire('restart');checkFixture(scale);
  set('window',2,'change');checkFixture(scale);
}
assert.deepEqual(fixture.power,[0,1e-12,1e-6,1e-4,1e-3,0]);
spectrumFixture=null;set('window',2,'change');checkPlots();
console.log('PASS: one-population controls/views, odd counts including 499, playback and perturbations, fixed field scale, log/linear physical PSD mappings, cached display-only switching, finite floor/zero bins without power mutation, and scale persistence/equal-power comparisons across presets and resets.');
