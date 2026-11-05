// Run with: node verify.cjs. No dependencies or browser are required.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const html = fs.readFileSync(__dirname + '/index.html', 'utf8');
const source = html.match(/<script id="fhn-model">([\s\S]*?)<\/script>/);
assert(source, 'The standalone file must include its numerical model.');
const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(source[1], sandbox);
const F = sandbox.FHN;
const near = (a, b, tolerance = 1e-12) => assert(Math.abs(a - b) < tolerance, `${a} differs from ${b}`);
function simulate(p, duration, dt = F.DT, spread = .30) {
  let state = F.initialStates(p.n, p.mode, spread);
  const spikes = Array.from({length: p.n}, () => []);
  let maximum = 0;
  for (let k = 0; k < Math.round(duration / dt); k++) {
    const next = F.step(state, p, dt);
    for (let i = 0; i < p.n; i++) {
      assert(Number.isFinite(next[2*i]) && Number.isFinite(next[2*i+1]));
      maximum = Math.max(maximum, Math.abs(next[2*i]), Math.abs(next[2*i+1]));
      if (state[2*i] < 0 && next[2*i] >= 0) {
        spikes[i].push((k - state[2*i] / (next[2*i] - state[2*i])) * dt);
      }
    }
    state = next;
  }
  return {state, spikes, maximum};
}
function lastLag(spikes) {
  const a = spikes[0].at(-2), b = spikes[0].at(-1);
  assert(a > 300 && b > a, 'The phase measurement needs late, repeated firing.');
  const inside = spikes[1].filter(t => t >= a && t < b);
  assert.equal(inside.length, 1, 'Require one partner spike in the completed reference cycle.');
  const phase = (inside[0] - a) / (b - a);
  return Math.min(phase, 1 - phase);
}

for (const mode of ['exc', 'inh']) {
  const sign = mode === 'exc' ? 1 : -1;
  for (let n = 1; n <= 12; n++) {
    const p = F.defaults(mode, n);
    const state = new Float64Array(Array.from({length: 2*n}, (_, k) => k % 2 ? .2 : (k % 6 ? 1 : -1)));
    const input = F.inputs(state, p);
    assert.equal(input.length, n);
    for (let i = 0; i < n; i++) {
      let activePartners = 0;
      for (let j = 0; j < n; j++) if (j !== i && state[2*j] > 0) activePartners++;
      near(input[i], n === 1 ? 0 : sign*p.g*activePartners/(n-1));
      const changed = state.slice();
      changed[2*i] = -changed[2*i];
      near(F.inputs(changed, p)[i], input[i]); // No self-connection.
      changed[2*i+1] = 100;
      near(F.inputs(changed, p)[i], input[i]);
    }
    const allActive = new Float64Array(2*n).fill(1);
    for (const input of F.inputs(allActive, p)) near(input, n === 1 ? 0 : sign*p.g);
    for (const v of [-2.2, -.8, .2, 1.8]) {
      const atVoltageNullcline = state.slice();
      atVoltageNullcline[0] = v;
      const syn = F.inputs(atVoltageNullcline, p)[0];
      atVoltageNullcline[1] = F.nullcline(v, syn, p);
      near(F.derivatives(atVoltageNullcline, p)[0], 0);
      const atRecoveryNullcline = state.slice();
      atRecoveryNullcline[0] = v;
      atRecoveryNullcline[1] = 2*(v + .4);
      near(F.derivatives(atRecoveryNullcline, p)[1], 0);
    }
  }
  const cycle = F.buildCycle(mode), p = F.defaults(mode, 1);
  assert(cycle.period > 20 && cycle.period < 60);
  assert(cycle.samples.length > 1000);
  let state = cycle.samples[0];
  for (let k = 0; k < cycle.samples.length; k++) state = F.step(state, p, cycle.dt);
  for (let i = 0; i < 2; i++) near(state[i], cycle.samples[0][i], 1e-5);
  const initial = F.initialStates(12, mode, 1, 2);
  assert.deepEqual(Array.from(initial), Array.from(F.initialStates(12, mode, 1, 2)));
  const before = Array.from(initial);
  assert.notEqual(F.step(initial, F.defaults(mode, 12)), initial);
  assert.deepEqual(Array.from(initial), before, 'Integration must leave its input snapshot unchanged.');
  const a = simulate(p, 200), b = simulate(p, 200, F.DT/2);
  for (let i = 0; i < 2; i++) near(a.state[i], b.state[i], 1e-7);
}
console.log('PASS: nullcline residuals, normalized inputs without self-connections, N=1, isolated cycles, reproducible initial phases, immutable snapshots, and isolated-step convergence.');

const pairResults = {};
for (const mode of ['exc', 'inh']) {
  const p = F.defaults(mode, 2), a = simulate(p, 600), b = simulate(p, 600, F.DT/2);
  for (const result of [a, b]) {
    assert(result.spikes.every(times => times.length >= 10));
    const lag = lastLag(result.spikes);
    near(lag, mode === 'exc' ? 0 : .5, .003);
  }
  // Threshold-gated currents are discontinuous, so verify spike times as well
  // as states instead of assuming fourth-order convergence through switches.
  for (let i = 0; i < 2; i++) near(a.spikes[i].at(-1), b.spikes[i].at(-1), .02);
  for (let i = 0; i < 4; i++) near(a.state[i], b.state[i], .005);
  pairResults[mode] = {lastCycleLag: lastLag(a.spikes), spikes: a.spikes.map(times => times.length)};
}
console.log('PASS: late in-phase excitation and antiphase inhibition, with half-step spike-time and state agreement.', pairResults);

let runs = 0, maximum = 0;
for (const mode of ['exc', 'inh']) for (let n = 1; n <= 12; n++) {
  for (const g of [0, F.defaults(mode, n).g, 3]) {
    const result = simulate({...F.defaults(mode, n), g}, 160);
    assert(result.maximum < 6, `Unbounded state for ${mode}, N=${n}, g=${g}`);
    if (g !== 3) assert(result.spikes.some(times => times.length >= 2), `No repeated firing for ${mode}, N=${n}, g=${g}`);
    maximum = Math.max(maximum, result.maximum);
    runs++;
  }
}
console.log(`PASS: finite bounded integration in ${runs} runs spanning N=1–12, both modes, uncoupled/default/maximum strength; repeated network firing at uncoupled/default settings. Maximum absolute state: ${maximum.toFixed(4)}.`);
