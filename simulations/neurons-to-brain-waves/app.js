/* Canvas views of the same model state. No drawing operation advances time. */
(() => {
  'use strict';
  const B = globalThis.BrainWaves;
  const $ = id => document.getElementById(id);
  const C = {ink:'#203649',muted:'#71808a',grid:'#e9e9e1',blue:'#326fa0',teal:'#287c72'};
  const presets = {
    independent:{coupling:0,noise:.02},
    together:{coupling:24,noise:.02}
  };
  let preset = 'independent', running = !matchMedia('(prefers-reduced-motion: reduce)').matches;
  let model, spectrum, lastSpectrum = -Infinity, speed = .25, lastFrame = null, accumulator = 0, windowSeconds = 2, psdScale = 'log';
  const views = {};
  for (const id of ['population','raster','signal','spectrum']) views[id] = {canvas:$(id),ctx:$(id).getContext('2d'),w:0,h:0};

  function announce(message) { $('status').textContent = message; }
  function syncControls() {
    for (const key of ['count','frequency','coupling','spread','noise']) {
      const value = key==='count' ? model.p.n : key==='spread' ? model.p.spread*100 : model.p[key];
      $(key).value = String(key==='spread' ? Math.round(value) : value);
    }
    $('count-value').textContent = String(model.p.n);
    $('frequency-value').textContent = model.p.frequency.toFixed(1)+' Hz';
    $('coupling-value').textContent = model.p.coupling.toFixed(1)+' /s';
    $('spread-value').textContent = '±'+Math.round(model.p.spread*100)+'%';
    $('noise-value').textContent = model.p.noise.toFixed(2);
    $('frequency').setAttribute('aria-valuetext',model.p.frequency.toFixed(1)+' hertz');
    $('coupling').setAttribute('aria-valuetext',model.p.coupling.toFixed(1)+' per second');
    $('spread').setAttribute('aria-valuetext','plus or minus '+Math.round(model.p.spread*100)+' percent');
    $('noise').setAttribute('aria-valuetext',model.p.noise.toFixed(2)+' radians squared per second');
    $('population-note').textContent = model.p.n+' phase oscillators';
    $('play').textContent = running ? 'Pause' : 'Run';
    $('play').setAttribute('aria-label',running ? 'Pause simulation' : 'Run simulation');
    document.querySelectorAll('[data-preset]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.preset===preset)));
    if (model.p.coupling>0) {
      $('scenario-title').textContent = 'Watch a collective rhythm emerge';
      $('scenario-text').textContent = 'Scatter phases and watch coupling bring them back together. Lower coupling or increase frequency spread and noise to weaken alignment.';
    } else {
      $('scenario-title').textContent = 'Bring independent rhythms together';
      $('scenario-text').textContent = 'Increase coupling while keeping the natural rhythm fixed. Or deliver a common input and watch temporary alignment disperse.';
    }
  }
  function reset(params, name) {
    model = B.create(params,'scattered');
    B.advance(model,6); // A visible observation window is ready from the first frame.
    preset = name;
    lastSpectrum = -Infinity; accumulator = 0; lastFrame = null;
    syncControls(); draw(true);
  }
  function choosePreset(name) {
    const n = model ? model.p.n : B.defaults.n;
    reset({...B.defaults,n,...presets[name]},name);
    announce((running?'Running. ':'Paused. ')+$('scenario-title').textContent+'. Six seconds of starting history.');
  }
  function live(partial, description) {
    B.configure(model,partial);
    preset = null;
    syncControls(); draw(true);
    announce(description+(running?' Running.':' Paused.'));
  }
  document.querySelectorAll('[data-preset]').forEach(button=>button.addEventListener('click',()=>choosePreset(button.dataset.preset)));
  $('play').addEventListener('click',()=>{
    running = !running; lastFrame = null; accumulator=0;
    syncControls(); announce((running?'Running':'Paused')+' at '+model.t.toFixed(2)+' s.');
  });
  $('restart').addEventListener('click',()=>{
    reset({...model.p},preset); announce('Restarted with the current settings and six seconds of history. '+(running?'Running.':'Paused.'));
  });
  $('step').addEventListener('click',()=>{
    running=false; accumulator=0; B.advance(model,1); syncControls(); draw(true);
    announce('Paused at '+model.t.toFixed(2)+' s after advancing one model second.');
  });
  function applyCount() {
    const raw=Number($('count').value);
    const n=Number.isFinite(raw)?Math.max(20,Math.min(500,Math.round(raw))):model.p.n;
    if(n===model.p.n){$('count').value=String(n);return;}
    reset({...model.p,n},preset); announce('Restarted with '+n+' neurons and six seconds of history.');
  }
  $('count').addEventListener('change',applyCount);
  $('apply-count').addEventListener('click',applyCount);
  $('count').addEventListener('keydown',event=>{if(event.key==='Enter'){event.preventDefault();applyCount();}});
  for (const id of ['frequency','coupling','spread','noise']) {
    $(id).addEventListener('input',()=>{
      const value = Number($(id).value);
      if (!Number.isFinite(value)) return;
      const descriptions={frequency:'Natural frequencies changed; current phases and past observations retained.',coupling:'Coupling changed; the population continues from its current phases.',spread:'Frequency spread changed; current phases and past observations retained.',noise:'Independent phase noise changed; current phases and past observations retained.'};
      live({[id]:id==='spread'?value/100:value},descriptions[id]);
    });
  }
  $('speed').addEventListener('change',()=>{
    speed=Number($('speed').value); accumulator=0; lastFrame=null;
    announce('Playback is '+speed+'× real time. Model integration step is unchanged.');
  });
  $('window').addEventListener('change',()=>{windowSeconds=Number($('window').value);draw(true);announce('Time plots show the last '+windowSeconds+' seconds; spectrum window is unchanged.');});
  $('psd-scale').addEventListener('change',()=>{
    psdScale=$('psd-scale').value==='linear'?'linear':'log';
    drawSpectrum(false);
    announce(psdScale==='log'?'PSD uses a fixed logarithmic scale from 10⁻⁶ to 2 a.u.²/Hz. Values below the display floor sit on the baseline.':'PSD uses a fixed linear scale from 0 to 2 a.u.²/Hz.');
  });
  $('pulse').addEventListener('click',()=>{
    B.pulse(model); draw(true);
    announce('Common input at '+model.t.toFixed(2)+' s: an idealized phase reset. Time and prior observations are retained.');
  });
  $('scramble').addEventListener('click',()=>{
    B.scramble(model); draw(true);
    announce('Phases scattered at '+model.t.toFixed(2)+' s. Natural frequencies, time, and prior observations are retained.');
  });

  function setup(view) {
    const rect=view.canvas.getBoundingClientRect(),dpr=window.devicePixelRatio||1;
    const w=Math.max(100,rect.width),h=Math.max(100,rect.height);
    if (view.w!==w||view.h!==h||view.dpr!==dpr) {
      view.w=w;view.h=h;view.dpr=dpr;
      view.canvas.width=Math.round(w*dpr);view.canvas.height=Math.round(h*dpr);
    }
    const ctx=view.ctx;ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
    ctx.font='11px system-ui, sans-serif';ctx.textBaseline='middle';ctx.lineWidth=1;ctx.setLineDash([]);
    return {ctx,w,h};
  }
  function text(ctx,s,x,y,align='left',color=C.muted) {ctx.fillStyle=color;ctx.textAlign=align;ctx.fillText(s,x,y);}
  function line(ctx,x1,y1,x2,y2,color,width=1) {ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();}
  function axes(view,xmin,xmax,ymin,ymax,xticks,yticks,xlabel,ylabel,options={}) {
    const {ctx,w,h}=setup(view),box={l:options.left??43,r:w-10,t:18,b:h-30};
    const X=x=>box.l+(x-xmin)/(xmax-xmin)*(box.r-box.l);
    const transform=options.logY?value=>Math.log10(Math.max(ymin,value)):value=>value;
    const Y=y=>box.b-(transform(y)-transform(ymin))/(transform(ymax)-transform(ymin))*(box.b-box.t);
    ctx.font='11px system-ui, sans-serif';
    for (const x of xticks) {
      line(ctx,X(x),box.t,X(x),box.b,C.grid);
      text(ctx,Math.abs(x)<.00001?'0':Number(x.toFixed(1)).toString(),X(x),box.b+12,x===xmin?'left':x===xmax?'right':'center');
    }
    for (const y of yticks) {
      line(ctx,box.l,Y(y),box.r,Y(y),y===0?'#d7ddd6':C.grid);
      text(ctx,options.formatY?options.formatY(y):Number(y.toFixed(2)).toString(),box.l-7,Y(y),'right');
    }
    line(ctx,box.l,box.t,box.l,box.b,'#cbd2cd');line(ctx,box.l,box.b,box.r,box.b,'#cbd2cd');
    text(ctx,xlabel,(box.l+box.r)/2,h-4,'center');
    ctx.save();ctx.translate(10,(box.t+box.b)/2);ctx.rotate(-Math.PI/2);text(ctx,ylabel,0,0,'center');ctx.restore();
    return {ctx,box,X,Y,w,h};
  }
  function clipped(a,fn) {
    a.ctx.save();a.ctx.beginPath();a.ctx.rect(a.box.l,a.box.t,a.box.r-a.box.l,a.box.b-a.box.t);a.ctx.clip();fn();a.ctx.restore();
  }
  function timeTicks() {
    const end=model.t,start=end-windowSeconds;
    const spacing=windowSeconds===2?.5:2,ticks=[];
    for(let t=Math.ceil((start-1e-8)/spacing)*spacing;t<=end+1e-8;t+=spacing)ticks.push(t);
    return ticks;
  }
  function events(a) {
    a.ctx.setLineDash([3,4]);
    for (const event of model.pulses) if (event.t>=model.t-windowSeconds&&event.t<=model.t) line(a.ctx,a.X(event.t),a.box.t,a.X(event.t),a.box.b,'#66816f99');
    a.ctx.setLineDash([]);
  }
  function drawPopulation(r) {
    const {ctx,w,h}=setup(views.population),gridW=w*.57,usableH=h-25;
    const cols=Math.ceil(Math.sqrt(model.p.n*gridW/usableH)),rows=Math.ceil(model.p.n/cols);
    const cell=Math.min((gridW-8)/cols,usableH/rows),radius=Math.min(7.5,cell*.31);
    const gx=5+(gridW-cols*cell)/2,gy=(usableH-rows*cell)/2+11;
    for (let i=0;i<model.p.n;i++) {
      const theta=model.phase[i],x=gx+(i%cols+.5)*cell,y=gy+(Math.floor(i/cols)+.5)*cell;
      const rgb='50,111,160';
      const light=.35+.65*(1+Math.cos(theta))/2;
      ctx.fillStyle='rgba('+rgb+','+light+')';ctx.beginPath();ctx.arc(x,y,radius,0,B.TAU);ctx.fill();
      const recent=model.spikes[i].length&&model.t-model.spikes[i][model.spikes[i].length-1]<.04;
      if (recent) {ctx.strokeStyle=C.blue;ctx.lineWidth=1.4;ctx.beginPath();ctx.arc(x,y,radius+2,0,B.TAU);ctx.stroke();}
      line(ctx,x,y,x+Math.cos(theta)*radius*.75,y-Math.sin(theta)*radius*.75,'#fffdf8',Math.max(.7,radius*.15));
    }
    text(ctx,'Current cycles',gridW/2,h-6,'center');
    const cx=gridW+(w-gridW)/2,cy=h*.48,R=Math.max(28,Math.min((w-gridW)/2-13,h*.31));
    ctx.strokeStyle='#d8dfd8';ctx.lineWidth=1;ctx.beginPath();ctx.arc(cx,cy,R,0,B.TAU);ctx.stroke();
    line(ctx,cx-R-4,cy,cx+R+4,cy,C.grid);line(ctx,cx,cy-R-4,cx,cy+R+4,C.grid);
    for (let i=0;i<model.p.n;i++) {
      const radius2=R*(.86+.12*((i*17)%31)/30),theta=model.phase[i];
      ctx.fillStyle='#326fa085';
      ctx.beginPath();ctx.arc(cx+radius2*Math.cos(theta),cy-radius2*Math.sin(theta),2.1,0,B.TAU);ctx.fill();
    }
    const ex=cx+R*r.r1*Math.cos(r.psi1),ey=cy-R*r.r1*Math.sin(r.psi1);
    line(ctx,cx,cy,ex,ey,C.ink,2);
    if(r.r1>.05) {const ang=-r.psi1;line(ctx,ex,ey,ex-6*Math.cos(ang-.45),ey-6*Math.sin(ang-.45),C.ink,2);line(ctx,ex,ey,ex-6*Math.cos(ang+.45),ey-6*Math.sin(ang+.45),C.ink,2);}
    text(ctx,'0',cx+R+5,cy,'left');text(ctx,'π',cx-R-5,cy,'right');
    text(ctx,'Phase wheel',cx,cy+R+24,'center');
    text(ctx,'Arrow: alignment',cx,cy+R+39,'center');
  }
  function drawRaster() {
    const t0=model.t-windowSeconds;
    const a=axes(views.raster,t0,model.t,model.p.n+.5,.5,timeTicks(),[1,Math.round(model.p.n/2),model.p.n],'Time (s)','Neuron');
    clipped(a,()=>{
      a.ctx.fillStyle='#326fa006';a.ctx.fillRect(a.box.l,a.box.t,a.box.r-a.box.l,a.box.b-a.box.t);
      a.ctx.beginPath();a.ctx.strokeStyle=C.blue;a.ctx.lineWidth=.85;
      for(let i=0;i<model.p.n;i++) for(const t of model.spikes[i]) if(t>=t0&&t<=model.t){
        const x=a.X(t),y=a.Y(i+1),len=Math.max(.7,Math.min(3.2,(a.box.b-a.box.t)/model.p.n*.7));
        a.ctx.moveTo(x,y-len/2);a.ctx.lineTo(x,y+len/2);
      }
      a.ctx.stroke();events(a);
    });
  }
  function path(a,rows,value,color,width) {
    a.ctx.strokeStyle=color;a.ctx.lineWidth=width;a.ctx.beginPath();let first=true;
    for(const row of rows){const x=a.X(row.t),y=a.Y(value(row));if(first){a.ctx.moveTo(x,y);first=false;}else a.ctx.lineTo(x,y);}
    a.ctx.stroke();
  }
  function drawSignal() {
    const t0=model.t-windowSeconds,rows=model.history.filter(row=>row.t>=t0-1e-6);
    const a=axes(views.signal,t0,model.t,-1.5,1.5,timeTicks(),[-1,0,1],'Time (s)','Field (a.u.)');
    clipped(a,()=>{
      for(let k=0;k<6;k++) path(a,rows,row=>row.examples[k],'#326fa02a',.7);
      path(a,rows,row=>row.signal,C.ink,2);events(a);
    });
  }
  function drawSpectrum(force) {
    if (force||model.t-lastSpectrum>=.2||!spectrum) {spectrum=B.spectrum(model.history);lastSpectrum=model.t;}
    const logarithmic=psdScale==='log',floor=1e-6,baseline=logarithmic?floor:0;
    const ticks=logarithmic?[1e-6,1e-4,1e-2,1]:[0,.5,1,1.5,2];
    const logLabels=new Map([[1e-6,'10⁻⁶'],[1e-4,'10⁻⁴'],[1e-2,'10⁻²'],[1,'1']]);
    const a=axes(views.spectrum,0,100,baseline,2,[0,20,40,60,80,100],ticks,'Frequency (Hz)','PSD (a.u.²/Hz)',{
      left:54,logY:logarithmic,formatY:logarithmic?value=>logLabels.get(value):null
    });
    // The floor is applied only by the display transform. The original PSD,
    // including exact zeros, is kept intact for measurements and comparisons.
    clipped(a,()=>{
      a.ctx.fillStyle='#287c7213';a.ctx.beginPath();a.ctx.moveTo(a.X(0),a.Y(baseline));
      for(let k=0;k<spectrum.frequency.length;k++)a.ctx.lineTo(a.X(spectrum.frequency[k]),a.Y(spectrum.power[k]));
      a.ctx.lineTo(a.X(100),a.Y(baseline));a.ctx.closePath();a.ctx.fill();
      a.ctx.strokeStyle=C.teal;a.ctx.lineWidth=1.7;a.ctx.beginPath();
      for(let k=0;k<spectrum.frequency.length;k++){const x=a.X(spectrum.frequency[k]),y=a.Y(spectrum.power[k]);if(k===0)a.ctx.moveTo(x,y);else a.ctx.lineTo(x,y);}a.ctx.stroke();
    });
    $('spectrum-note').textContent=spectrum.duration.toFixed(2)+' s window · '+(logarithmic?'log scale · display floor 10⁻⁶ a.u.²/Hz':'linear scale · range 0–2 a.u.²/Hz');
    $('peak-note').textContent=spectrum.peak===null?'No resolved rhythmic field in this window.':('Peak '+spectrum.peak.toFixed(1)+' Hz · bin spacing '+spectrum.df.toFixed(3)+' Hz');
  }
  function draw(force=false) {
    if(!model)return;
    const r=B.readout(model);
    $('clock').textContent='t = '+model.t.toFixed(2)+' s';
    $('coherence').textContent=(r.r1*100).toFixed(0)+'%';
    $('coherence-bar').style.width=Math.min(100,r.r1*100)+'%';
    $('rms').textContent=B.rms(model.history,2).toFixed(3);
    let crossings=0;for(const times of model.spikes)for(const t of times)if(t>model.t-2&&t<=model.t)crossings++;
    $('rate').textContent=(crossings/(2*model.p.n)).toFixed(1)+' Hz';
    drawPopulation(r);drawRaster();drawSignal();drawSpectrum(force);
  }
  function frame(now) {
    if(lastFrame===null)lastFrame=now;
    const elapsed=Math.max(0,Math.min(.1,(now-lastFrame)/1000));lastFrame=now;
    if(running&&!document.hidden){accumulator+=elapsed*speed;const steps=Math.floor((accumulator+1e-10)/B.DT);if(steps){B.advance(model,steps*B.DT);accumulator-=steps*B.DT;draw();}}
    requestAnimationFrame(frame);
  }
  window.addEventListener('resize',()=>draw(true));
  if(typeof ResizeObserver!=='undefined'){const resize=new ResizeObserver(()=>draw(true));for(const view of Object.values(views))resize.observe(view.canvas);}
  choosePreset('independent');requestAnimationFrame(frame);
})();
