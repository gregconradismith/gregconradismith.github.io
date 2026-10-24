const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const html=fs.readFileSync(__dirname+'/index.html','utf8');
const source=html.match(/<script id="slow-passage-model">([\s\S]*?)<\/script>/)[1];
const box={};vm.createContext(box);vm.runInContext(source,box);const M=box.SlowPassageModel;
for(const script of html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g))new vm.Script(script[1]);
function close(a,b,tol=1e-8){assert(Math.abs(a-b)<tol,`${a} versus ${b}`);}
// Static radial branches solve the governing equation and have the stated stability.
for(const kind of ['super','sub'])for(const mu of [-.35,-.25,-.2,-.01,.01,.3,.65]){
 for(const [name,r] of Object.entries(M.branches(mu,kind))){if(r===null||r===0)continue;close(M.growth(Math.log(r),mu,kind),0);const du=1e-5,slope=(M.growth(Math.log(r)+du,mu,kind)-M.growth(Math.log(r)-du,mu,kind))/(2*du);if(mu!==-.25)assert(name==='stable'?slope<0:slope>0);}
}
// Holding a supercritical parameter has an exact logistic amplitude-squared solution.
const fixed=M.create({muMin:-.35,seed:.2});fixed.mu=.3;fixed.hold=true;M.advance(fixed,10);
const q0=.04,exact=.3/(1+(.3/q0-1)*Math.exp(-.6*10));close(Math.exp(2*fixed.u),exact,1e-9);close(fixed.mu,.3);close(fixed.t,10);
// The whole round trip and both corners are resolved even with non-grid-aligned endpoints.
for(const protocol of ['updown','downup']){
 const s=M.create({protocol,muMin:-.333,muMax:.617,rate:.017});M.advance(s,1000);assert(s.done);close(s.t,2*.95/.017);close(s.mu,protocol==='updown'?-.333:.617);assert.equal(s.legs,2);
}
function experiment(kind,rate,chunk=.05){const s=M.create({kind,rate,muMin:-.35}),events=[];let last=M.snapshot(s),hopf;
 while(!s.done){M.advance(s,chunk);const q=M.snapshot(s);if(last.mu<0&&q.mu>=0&&q.dir===1)hopf=q.r;if(last.r<.15&&q.r>=.15&&q.dir===1&&q.mu>0)events.push(['rise',q.mu,q.t]);if(last.r>.15&&q.r<=.15&&q.dir===-1&&q.mu<0)events.push(['fall',q.mu,q.t]);assert(Number.isFinite(q.u));assert(q.r<1.5);last=q;}
 return {s,events,hopf};}
for(const kind of ['super','sub']){
 const slow=experiment(kind,.005),fast=experiment(kind,.02);assert(slow.hopf<.001);assert(slow.events.some(e=>e[0]==='rise'&&e[1]>.3));assert(slow.events.some(e=>e[0]==='fall'&&e[1]<0));
 if(kind==='sub')assert(slow.events.find(e=>e[0]==='fall')[1]<-.25);
 const refined=experiment(kind,.005,.013);close(slow.s.u,refined.s.u,2e-7);
 console.log(kind,JSON.stringify({slow:slow.events,fast:fast.events}));
}
const defaultRun=M.create();M.advance(defaultRun,1000);assert(defaultRun.done);close(defaultRun.mu,-.45);
// Preserve memory below floating point amplitude underflow; no artificial amplitude floor.
const tiny=M.create({seed:.01,muMin:-1,rate:.001});tiny.repeat=true;M.advance(tiny,1000);assert(tiny.u<-400&&Number.isFinite(tiny.u));
const zero=M.create({});zero.hold=true;M.advance(zero,1);close(zero.mu,-.45);
console.log('PASS: branch residuals and stability, exact held-parameter solution, ramp corners, both directions, delayed onset and cycle-fold passage, step convergence, logarithmic memory, and script syntax.');
// Seeded Gaussian pairs have the specified independent unit-variance coordinates.
const random=M.create({randomSeed:42});let sx=0,sy=0,sxx=0,syy=0,sxy=0;const N=100000;
for(let i=0;i<N;i++){const [x,y]=M.normalPair(random);sx+=x;sy+=y;sxx+=x*x;syy+=y*y;sxy+=x*y;}
assert(Math.abs(sx/N)<.012&&Math.abs(sy/N)<.012);assert(Math.abs(sxx/N-1)<.025&&Math.abs(syy/N-1)<.025);assert(Math.abs(sxy/N)<.02);
// Same seed/settings reproduce a realization; different seeds change it.
const a=M.create({noise:.001,randomSeed:17}),b=M.create({noise:.001,randomSeed:17}),c=M.create({noise:.001,randomSeed:18});
for(const state of [a,b,c])M.advance(state,100);assert.equal(a.u,b.u);assert.equal(a.theta,b.theta);assert.notEqual(a.u,c.u);
// In the small-amplitude stable regime, compare with the linear stochastic oscillator's
// analytic second moment: E[r²(t)] = r0² exp(2μt) + σ² (1-exp(2μt))/(-μ).
let moment=0;const ensemble=800,sigma=.005,T=10,mu=-.45;
for(let i=0;i<ensemble;i++){const state=M.create({noise:sigma,randomSeed:i,seed:1e-8});state.hold=true;M.advance(state,T);moment+=Math.exp(2*state.u);}
const expectedMoment=1e-16*Math.exp(2*mu*T)+sigma*sigma*(1-Math.exp(2*mu*T))/(-mu);
assert(Math.abs(moment/ensemble/expectedMoment-1)<.12);
// The deterministic limit consumes no random draws. All selectable noise levels remain finite.
const off=M.create({noise:0,randomSeed:123});M.advance(off,3);assert.equal(off.rng,123);
for(const kind of ['super','sub'])for(const protocol of ['updown','downup'])for(const noise of [1e-6,1e-4,.001,.01,.05]){const state=M.create({kind,protocol,noise});M.advance(state,1000);assert(state.done&&Number.isFinite(state.u));assert(Math.exp(state.u)<1.5);}
console.log('PASS: Gaussian means/variances/correlation, seeded repeatability, stochastic second moment, deterministic limit, and noisy round trips in both models/directions.');
