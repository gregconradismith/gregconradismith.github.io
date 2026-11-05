#!/usr/bin/env node
'use strict';
const assert = require('node:assert/strict');
const B = require('./model.js');
const near = (actual, expected, tolerance = 1e-10) =>
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} differs from ${expected} by more than ${tolerance}`);
function finite(m) {
  for (const x of m.phase) assert.ok(Number.isFinite(x));
  for (const x of m.frequencies) assert.ok(Number.isFinite(x) && x >= 0);
  for (const r of m.history) {
    for (const key of ['t', 'signal', 'r1']) assert.ok(Number.isFinite(r[key]));
    assert.ok(r.r1 >= 0 && r.r1 <= 1 + 1e-12);
    assert.ok(Math.abs(r.signal) <= 1 + 1e-12);
    assert.equal(r.examples.length, 6);
    for (const x of r.examples) assert.ok(Number.isFinite(x) && Math.abs(x) <= 1);
  }
}

// Every neuron has exactly the same positive electrode weight. The field is
// the arithmetic mean of centered current waveforms, not a phase count or an
// absolute current. A half-cycle shift changes current sign without changing
// coherence; a uniform phase circle has a small summed current.
const known = B.create({ n: 21, noise: 0 });
known.phase.set(Array.from({ length: 21 }, (_, i) => 0.13 * i * i));
const exactMean = Array.from(known.phase).reduce((sum, x) => sum + Math.cos(x), 0) / 21;
near(B.readout(known).signal, exactMean);
const beforeShift = B.readout(known);
for (let i = 0; i < known.p.n; i++) known.phase[i] += Math.PI;
near(B.readout(known).signal, -exactMean);
near(B.readout(known).r1, beforeShift.r1);
const uniform = Array.from({ length: 21 }, (_, i) => B.TAU * i / 21);
known.phase.set(uniform); near(B.readout(known).signal, 0); near(B.orders(uniform).r1, 0);
near(B.orders(Array(21).fill(0.75)).r1, 1);
for (const n of [20, 21, 200, 499, 500]) {
  const m = B.create({ n, spread: 0, noise: 0 });
  assert.equal(m.p.n, n); assert.equal(m.phase.length, n);
  m.phase.fill(0); near(B.readout(m).signal, 1);
  m.phase.fill(Math.PI); near(B.readout(m).signal, -1);
}

// Any integer population size has one evenly spaced, symmetric frequency
// distribution, including odd counts. No artificial frequency pairs are used.
for (const n of [21, 200, 499]) for (const spread of [0.3, 1]) {
  const m = B.create({ n, frequency: 13, spread });
  near(m.p.spread, spread);
  near(m.frequencies[0], 13 * (1 - spread));
  near(m.frequencies[n - 1], 13 * (1 + spread));
  near(Array.from(m.frequencies).reduce((sum, x) => sum + x) / n, 13);
  const increment = m.frequencies[1] - m.frequencies[0];
  for (let i = 1; i < n; i++) near(m.frequencies[i] - m.frequencies[i - 1], increment);
  assert.equal(new Set(m.exampleIndices).size, 6);
  assert.equal(m.exampleIndices[0], 0); assert.equal(m.exampleIndices[5], n - 1);
}
assert.deepEqual(Object.keys(B.defaults).sort(), ['coupling', 'frequency', 'n', 'noise', 'seed', 'spread']);
const whitelisted = B.create({ n: 21, unsupported: 17 });
assert.equal(whitelisted.p.unsupported, undefined);
assert.deepEqual(Object.keys(B.readout(whitelisted)).sort(), ['examples', 'psi1', 'r1', 'rate', 'signal', 't']);
assert.deepEqual(Object.keys(whitelisted.history[0]).sort(), ['examples', 'r1', 'signal', 't']);

// The seeded stochastic model is reproducible, including for an odd population
// where the Box-Muller spare normal spans successive integration steps.
const a = B.create({ n: 81, noise: 0.4, seed: 351 });
const b = B.create({ n: 81, noise: 0.4, seed: 351 });
const c = B.create({ n: 81, noise: 0.4, seed: 352 });
B.advance(a, 0.5); B.advance(b, 0.5); B.advance(c, 0.5);
assert.deepEqual(a.phase, b.phase); assert.deepEqual(a.spikes, b.spikes);
assert.notDeepEqual(a.phase, c.phase);

// Positive first-harmonic Kuramoto coupling creates a coherent population
// rhythm without changing the distribution's requested mean natural rate.
const independent = B.create({ n: 200, noise: 0.02 }, 'scattered');
const together = B.create({ n: 200, coupling: 24, noise: 0.02 }, 'scattered');
B.advance(independent, 6); B.advance(together, 6);
assert.ok(B.readout(independent).r1 < 0.2);
assert.ok(B.readout(together).r1 > 0.95);
assert.ok(B.rms(together.history) > 0.6);
assert.ok(B.rms(together.history) > 6 * B.rms(independent.history));
near(B.readout(independent).rate, B.readout(together).rate);
near(B.spectrum(together.history).peak, 10, 0.05);
for (const m of [independent, together]) {
  const row = m.history.at(-1), r = B.readout(m);
  near(row.signal, r.signal);
  for (let i = 0; i < 6; i++) near(row.examples[i], Math.cos(m.phase[m.exampleIndices[i]]));
}

// A shared idealized phase reset produces transient coherence without changing
// natural frequencies or recording fictitious phase-crossing events.
const transient = B.create({ n: 201, spread: 0.2, noise: 0 }, 'scattered');
B.advance(transient, 1);
const pulseTime = transient.t, pulseHistory = JSON.stringify(transient.history);
const pulseSpikes = JSON.stringify(transient.spikes);
const pulseFrequencies = Array.from(transient.frequencies);
B.pulse(transient);
near(transient.t, pulseTime); assert.equal(JSON.stringify(transient.history), pulseHistory);
assert.equal(JSON.stringify(transient.spikes), pulseSpikes);
assert.deepEqual(Array.from(transient.frequencies), pulseFrequencies);
assert.ok(B.readout(transient).r1 > 0.99);
assert.deepEqual(transient.pulses.at(-1), { t: pulseTime, type: 'pulse' });
B.advance(transient, 2);
assert.ok(B.readout(transient).r1 < 0.1);
const scrambleTime = transient.t, scrambleHistory = JSON.stringify(transient.history);
const scrambleSpikes = JSON.stringify(transient.spikes);
B.scramble(transient);
near(transient.t, scrambleTime); assert.equal(JSON.stringify(transient.history), scrambleHistory);
assert.equal(JSON.stringify(transient.spikes), scrambleSpikes);
assert.ok(B.readout(transient).r1 < 0.15);
assert.deepEqual(transient.pulses.at(-1), { t: scrambleTime, type: 'scramble' });

// Live frequency/coupling/noise changes preserve time, phase, past samples and
// raster. Counts deliberately require constructing a new model in the UI.
const configuredPhase = Array.from(transient.phase), configuredHistory = JSON.stringify(transient.history);
B.configure(transient, { frequency: 18, coupling: 12, noise: 0.3, spread: 0.3, n: 300, unsupported: 4 });
near(transient.t, scrambleTime); assert.equal(transient.p.n, 201);
assert.deepEqual(Array.from(transient.phase), configuredPhase);
assert.equal(JSON.stringify(transient.history), configuredHistory);
assert.equal(JSON.stringify(transient.spikes), scrambleSpikes);
assert.equal(transient.p.unsupported, undefined);
near(Array.from(transient.frequencies).reduce((sum, x) => sum + x) / 201, 18);
const configuredRng = [transient._seed, transient._normal];
B.configure(transient, { spread: 1 });
near(transient.p.spread, 1);
near(transient.frequencies[0], 0); near(transient.frequencies[200], 36);
near(Array.from(transient.frequencies).reduce((sum, x) => sum + x) / 201, 18);
near(transient.t, scrambleTime);
assert.deepEqual(Array.from(transient.phase), configuredPhase);
assert.equal(JSON.stringify(transient.history), configuredHistory);
assert.equal(JSON.stringify(transient.spikes), scrambleSpikes);
assert.deepEqual([transient._seed, transient._normal], configuredRng);

// Analytic uncoupled rotation checks integration, exact duration, and upward
// cycle-crossing raster timing. Recorded event intervals equal the period.
const rotating = B.create({ n: 21, frequency: 10, spread: 0, noise: 0 }, 'aligned');
const initialPhase = Array.from(rotating.phase);
B.advance(rotating, 0.123);
near(rotating.t, 0.123, 1e-12);
for (let i = 0; i < rotating.p.n; i++) {
  near(rotating.phase[i], initialPhase[i] + B.TAU * 10 * 0.123, 1e-10);
  near(rotating.spikes[i][0], (B.TAU - initialPhase[i]) / (B.TAU * 10), 1e-10);
}
B.advance(rotating, 12.5);
assert.ok(rotating.history.length <= 3001);
assert.ok(rotating.history[0].t >= rotating.t - 12.01);
for (const crossings of rotating.spikes) {
  for (let i = 1; i < crossings.length; i++) near(crossings[i] - crossings[i - 1], 0.1, 1e-9);
  assert.ok(crossings[0] >= rotating.t - 12.01);
}
for (let i = 1; i < rotating.history.length; i++) near(rotating.history[i].t - rotating.history[i - 1].t, B.SAMPLE_DT, 1e-12);

// A halved deterministic time step converges toward a quarter-step reference.
const coarse = B.create({ n: 21, coupling: 24, noise: 0 });
const fine = B.create({ n: 21, coupling: 24, noise: 0 });
const reference = B.create({ n: 21, coupling: 24, noise: 0 });
for (let i = 0; i < 500; i++) B.step(coarse, 0.002);
for (let i = 0; i < 1000; i++) B.step(fine, 0.001);
for (let i = 0; i < 2000; i++) B.step(reference, 0.0005);
const error = m => Math.sqrt(m.phase.reduce((sum, x, i) => sum + (x - reference.phase[i]) ** 2, 0) / m.p.n);
assert.ok(error(fine) < error(coarse) / 2.5);

// The full UI bandwidth at maximum population also converges as the step is
// halved, including its zero-frequency source under nonzero coupling.
const broadParams = { n: 500, frequency: 30, spread: 1, coupling: 30, noise: 0 };
const broadCoarse = B.create(broadParams), broadFine = B.create(broadParams), broadReference = B.create(broadParams);
for (let i = 0; i < 100; i++) B.step(broadCoarse, 0.002);
for (let i = 0; i < 200; i++) B.step(broadFine, 0.001);
for (let i = 0; i < 400; i++) B.step(broadReference, 0.0005);
const broadError = m => Math.sqrt(m.phase.reduce((sum, x, i) => sum + (x - broadReference.phase[i]) ** 2, 0) / m.p.n);
assert.ok(broadError(broadFine) < broadError(broadCoarse) / 2.5);

// The one-sided Hann PSD has physical normalization: integrating an amplitude-
// one sinusoid gives variance1/2, and halving amplitude quarters spectral power.
const samples = Array.from({ length: 1500 }, (_, i) => ({ t: i * B.SAMPLE_DT,
  signal: Math.cos(B.TAU * 10 * i * B.SAMPLE_DT) }));
const psd = B.spectrum(samples);
near(psd.peak, 10, 0.05); near(psd.duration, 4.096); near(psd.df, 250 / 1024);
near(psd.power.reduce((x, y) => x + y, 0) * psd.df, 0.5, 0.001);
const halfPSD = B.spectrum(samples.map(r => ({ t: r.t, signal: r.signal / 2 })));
near(halfPSD.peakPower / psd.peakPower, 0.25);
assert.equal(B.spectrum(samples.slice(0, 127)).peak, null);
assert.equal(B.spectrum(samples.map(r => ({ t: r.t, signal: 3 }))).peak, null);

// At the UI's 30 Hz ±100% range, the slow edge has zero natural frequency and
// the fast edge is 60 Hz. Uncoupled/noiseless currents match both analytic limits:
// the zero-frequency source is static with no cycle events; 60 Hz is resolved
// below the 250 Hz sample rate's Nyquist limit, without aliasing to another peak.
const fast = B.create({ n: 21, frequency: 30, spread: 1, noise: 0, coupling: 0 }, 'aligned');
const stationaryPhase = fast.phase[0];
B.advance(fast, 6);
near(fast.frequencies[0], 0); near(fast.frequencies[20], 60);
near(fast.phase[0], stationaryPhase);
assert.deepEqual(fast.spikes[0], []);
for (const row of fast.history) near(row.examples[0], Math.cos(stationaryPhase));
const staticPSD = B.spectrum(fast.history.map(r => ({ t: r.t, signal: r.examples[0] })));
assert.equal(staticPSD.peak, null);
assert.ok(staticPSD.power.every(x => x < 1e-25));
assert.ok(fast.frequencies[20] < 1 / (2 * B.SAMPLE_DT));
const edgePSD = B.spectrum(fast.history.map(r => ({ t: r.t, signal: r.examples[5] })));
near(edgePSD.peak, 60, 0.05);
near(edgePSD.power.reduce((x, y) => x + y, 0) * edgePSD.df, 0.5, 0.001);
for (let i = 1; i < fast.spikes[20].length; i++) near(fast.spikes[20][i] - fast.spikes[20][i - 1], 1 / 60, 1e-10);

// Displayed RMS includes the mean component and respects its requested window.
near(B.rms(Array.from({ length: 100 }, (_, i) => ({ t: i * 0.01, signal: 2 }))), 2);
near(B.rms(Array.from({ length: 1000 }, (_, i) => ({ t: i * 0.001,
  signal: Math.sin(B.TAU * 10 * i * 0.001) }))), Math.SQRT1_2, 1e-12);
near(B.rms([{ t: 0, signal: -1 }, { t: 1, signal: 2 }, { t: 2, signal: 3 }]), Math.sqrt(14 / 3));
near(B.rms([{ t: 0, signal: 100 }, { t: 1, signal: 2 }, { t: 2, signal: 3 }], 1), Math.sqrt(13 / 2));

// Maximum population, frequency bandwidth, coupling and noise remain finite and
// within the mathematically possible equal-weight field and coherence bounds.
const extreme = B.create({ n: 500, frequency: 40, spread: 1, coupling: 40, noise: 3 });
near(extreme.frequencies[0], 0); near(extreme.frequencies[499], 80);
assert.ok(extreme.frequencies[499] < 1 / (2 * B.SAMPLE_DT));
B.advance(extreme, 0.5);
for (const m of [extreme, together, transient, fast, broadCoarse, broadFine, broadReference]) finite(m);
console.log('PASS: single-population equal-weight current mean, integer counts, frequency quantiles through 100% spread, static zero-frequency edge, seeded noise, collective locking, transient phase reset, live controls, raster timing, fixed sampling/window, timestep convergence, PSD normalization/60 Hz resolution, true RMS, and 500-neuron extremes.');
