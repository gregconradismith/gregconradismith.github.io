// Run with Node.js; no browser packages or external dependencies are needed.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const elements=new Map(),contexts=new Map(),calls=[];
const initial={count:'200',frequency:'10',coupling:'0',spread:'12',noise:'.02',shape:'0',speed:'.25',window:'2'};
function canvas(id){
  if(!contexts.has(id)){
    const log={texts:[],strokes:[],arcs:0};let points=[];
    const ctx=new Proxy({log,
      clearRect(){log.texts=[];log.strokes=[];log.arcs=0;},
      beginPath(){points=[];},moveTo(x,y){points.push([x,y]);},lineTo(x,y){points.push([x,y]);},
      stroke(){log.strokes.push({color:ctx.strokeStyle,width:ctx.lineWidth,points:points.slice()});},
      arc(){log.arcs++;},fillText(text,x,y){log.texts.push({text:String(text),x,y,align:ctx.textAlign});},
      measureText(text){return {width:String(text).length*6};}
    },{get:(o,k)=>o[k]??(()=>{}),set:(o,k,v)=>(o[k]=v,true)});
    contexts.set(id,ctx);
  }
  return contexts.get(id);
}
function element(id){
  if(!elements.has(id))elements.set(id,{id,value:initial[id]??'',checked:false,textContent:'',innerHTML:'',handlers:{},attributes:{},dataset:{},style:{setProperty(){}},classList:{toggle(){}},
    addEventListener(name,fn){this.handlers[name]=fn;},setAttribute(name,value){this.attributes[name]=value;},getAttribute(name){return this.attributes[name];},
    getBoundingClientRect(){return {width:720,height:260,left:0,top:0};},getContext(){return canvas(id);}});
  return elements.get(id);
}
const presetButtons=['independent','together','alternating'].map(id=>{const e=element(id);e.dataset.preset=id;return e;});
let nextFrame,currentModel;
const sandbox={console,document:{hidden:false,getElementById:element,querySelectorAll:selector=>selector==='[data-preset]'?presetButtons:[],addEventListener(){}},
  devicePixelRatio:1,matchMedia:()=>({matches:false}),requestAnimationFrame:fn=>{nextFrame=fn;},addEventListener(){},performance:{now:()=>0}};
sandbox.window=sandbox;vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(__dirname+'/model.js','utf8'),sandbox);
const original=sandbox.BrainWaves,B={...original};
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
function checkPlots(){
  for(const id of ['population','raster','signal','spectrum'])assert(canvas(id).log.texts.length>0,`${id} renders labels`);
  assert(canvas('population').log.arcs>=2*currentModel.p.n,'Population view renders all neurons and phase markers.');
  const signal=canvas('signal').log,spectrum=canvas('spectrum').log;
  for(const label of ['-1','0','1','Field (a.u.)'])assert(signal.texts.some(x=>x.text===label));
  for(const label of ['0','0.5','1','1.5','2','100','PSD (a.u.²/Hz)'])assert(spectrum.texts.some(x=>x.text===label),`Spectrum label ${label}`);
  // Check physical power and signal coordinates directly, so equal-height
  // normalization of independent and coherent conditions cannot pass.
  const fieldStroke=signal.strokes.find(x=>x.color==='#203649'&&x.width===2);
  const powerStroke=spectrum.strokes.find(x=>x.color==='#287c72'&&x.width===1.7);
  assert(fieldStroke&&fieldStroke.points.length>100);assert(powerStroke&&powerStroke.points.length>100);
  const signalY=value=>230-(value+1.5)/3*212;
  near(fieldStroke.points.at(-1)[1],signalY(currentModel.history.at(-1).signal));
  const psd=original.spectrum(currentModel.history),k=psd.power.indexOf(Math.max(...psd.power));
  near(powerStroke.points[k][1],230-psd.power[k]/2*212);
  near(powerStroke.points[k][0],43+psd.frequency[k]/100*667);
}

assert.equal(currentModel.p.n,200);near(currentModel.t,6);
assert.equal(currentModel.p.coupling,0);assert.equal(currentModel.p.harmonic,1);assert.equal(currentModel.p.noise,.02);
assert.equal(element('independent').getAttribute('aria-pressed'),'true');checkPlots();
assert.equal(element('window').value,'2');
const start=snapshot();fire('play');paused();samePast(start,snapshot());
nextFrame(0);nextFrame(100);samePast(start,snapshot());
fire('step');paused();near(currentModel.t,start.t+1);assert(currentModel.history.length>start.history.length);

// Every live dynamical slider preserves phase, time, and the measured past.
for(const [id,value,key,expected] of [['frequency',17.5,'frequency',17.5],['coupling',8,'coupling',8],['spread',25,'spread',.25],['noise',.11,'noise',.11]]){
  const before=snapshot(),model=currentModel;set(id,value);assert.equal(currentModel,model);samePast(before,snapshot());paused();near(currentModel.p[key],expected);
  assert(calls.at(-1).name==='configure');
}
const beforeGeometry=snapshot(),r1=original.orders(currentModel.phase).r1;
set('shape','.35','change');sameActivity(beforeGeometry,snapshot());
assert.deepEqual(beforeGeometry.history.map(x=>x.t),Array.from(currentModel.history,x=>x.t));
assert(currentModel.history.some((x,i)=>Math.abs(x.signal-beforeGeometry.history[i].signal)>1e-6));
const beforeOrientation=snapshot();element('orientation').checked=true;fire('orientation','change');sameActivity(beforeOrientation,snapshot());
assert.deepEqual(beforeOrientation.history.map(x=>x.t),Array.from(currentModel.history,x=>x.t));
for(let i=0;i<currentModel.history.length;i++){
  const before=beforeOrientation.history[i],after=currentModel.history[i];near(after.a,before.a);near(after.b,-before.b);near(after.signal,after.a+after.b);
  near(after.r1,before.r1);near(after.r2,before.r2);
}
near(original.orders(currentModel.phase).r1,r1);paused();checkPlots();

// View choices change only plotting, including the visible time window.
const beforeView=snapshot();set('window',6,'change');samePast(beforeView,snapshot());checkPlots();
assert(canvas('signal').log.texts.some(x=>x.text==='1'),'Six-second window begins at t=1 after the explicit step.');
set('window',2,'change');samePast(beforeView,snapshot());

// Count changes create a new warmed simulation with every other choice intact.
const beforeCount={...currentModel.p},oldModel=currentModel;set('count',120,'change');
assert.notEqual(currentModel,oldModel);assert.equal(currentModel.p.n,120);near(currentModel.t,6);paused();
for(const key of Object.keys(beforeCount).filter(k=>k!=='n'))assert.equal(currentModel.p[key],beforeCount[key],key);
assert.equal(currentModel.phase.length,120);assert.equal(element('count-value').textContent,'120');
fire('restart');assert.equal(currentModel.p.n,120);near(currentModel.t,6);paused();
for(const key of Object.keys(beforeCount).filter(k=>k!=='n'))assert.equal(currentModel.p[key],beforeCount[key],key);

// Presets choose phase interaction and noise deliberately, and keep N.
for(const [id,harmonic,coupling,noise]of[['independent',1,0,.02],['together',1,24,.02],['alternating',2,24,0]]){
  fire(id);assert.equal(currentModel.p.n,120);assert.equal(currentModel.p.harmonic,harmonic);assert.equal(currentModel.p.coupling,coupling);assert.equal(currentModel.p.noise,noise);
  near(currentModel.t,6);paused();assert.equal(element(id).getAttribute('aria-pressed'),'true');checkPlots();
}
assert(original.orders(currentModel.phase).r2>.9);assert(original.orders(currentModel.phase).r1<.01);
assert(Number(element('rms').textContent)<.001,'Opposite same-orientation groups cancel the smooth measured field.');
const beforeFlip=snapshot();element('orientation').checked=true;fire('orientation','change');sameActivity(beforeFlip,snapshot());
assert(Number(element('rms').textContent)>.3,'Changing dipole orientation exposes coordinated activity without changing timing.');

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
element('count').value='120';fire('count','keydown',{key:'Enter',preventDefault(){prevented=true;}});
assert(prevented);assert.equal(currentModel.p.n,120);assert.notEqual(currentModel,beforeEnter);near(currentModel.t,6);paused();
const afterEnter=currentModel,unchangedEnter=snapshot();
fire('count','keydown',{key:'Enter',preventDefault(){}});assert.equal(currentModel,afterEnter);samePast(unchangedEnter,snapshot());
element('count').value='140';fire('count','keydown',{key:'ArrowRight',preventDefault(){assert.fail('Only Enter is intercepted.');}});
assert.equal(currentModel,afterEnter);samePast(unchangedEnter,snapshot());
checkPlots();
console.log('PASS: presets, warm start, pause/step, live-control continuity, geometry/history reprojection, window view, buffered count Apply/Enter and restart preservation, pulse/scatter timing, fixed field/PSD scales, all canvas views, and all playback speeds.');
