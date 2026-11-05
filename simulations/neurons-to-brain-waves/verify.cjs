#!/usr/bin/env node
'use strict';
const assert = require('node:assert/strict');
const B = require('./model.js');
const near = (actual, expected, tolerance = 1e-10) =>
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} differs from ${expected} by more than ${tolerance}`);
function finite(m) {
  for (const x of m.phase) assert.ok(Number.isFinite(x));
  for (const x of m.frequencies) assert.ok(Number.isFinite(x) && x > 0);
  for (const r of m.history) {
    for (const key of ['t', 'signal', 'a', 'b', 'r1', 'r2']) assert.ok(Number.isFinite(r[key]));
    assert.ok(r.r1 >= 0 && r.r1 <= 1 + 1e-12);
    assert.ok(r.r2 >= 0 && r.r2 <= 1 + 1e-12);
    assert.ok(Math.abs(r.signal) <= 1 + m.p.shape + 1e-12);
    near(r.signal, r.a + r.b);
  }
}
// Phase order parameters distinguish a common phase, two opposed clusters, and
// a uniform circle. A low first-order parameter alone is not disorder.
const uniform = Array.from({ length: 100 }, (_, i) => B.TAU * i / 100);
const oneCluster = B.orders(Array(100).fill(0.75));
near(oneCluster.r1, 1); near(oneCluster.r2, 1);
const opposed = B.orders(Array(50).fill(0).concat(Array(50).fill(Math.PI)));
near(opposed.r1, 0); near(opposed.r2, 1);
near(B.orders(uniform).r1, 0); near(B.orders(uniform).r2, 0);

// Seeded stochastic trajectories are reproducible; both groups have matched,
// symmetric natural-frequency distributions with the requested mean.
const a = B.create({ n: 80, noise: 0.4, seed: 351 });
const b = B.create({ n: 80, noise: 0.4, seed: 351 });
const c = B.create({ n: 80, noise: 0.4, seed: 352 });
B.advance(a, 0.5); B.advance(b, 0.5); B.advance(c, 0.5);
assert.deepEqual(a.phase, b.phase); assert.deepEqual(a.spikes, b.spikes);
assert.notDeepEqual(a.phase, c.phase);
for (let i = 0; i < a.p.n / 2; i++) near(a.frequencies[i], a.frequencies[i + a.p.n / 2]);
near(Array.from(a.frequencies).reduce((x, y) => x + y) / a.p.n, 10);

// Adding neurons does not increase a fully coherent normalized dipole signal.
for (const n of [20, 100, 500]) {
  const m = B.create({ n, spread: 0, noise: 0 });
  m.phase.fill(0); near(B.readout(m).signal, 1);
  B.configure(m, { orientation: -1 }); near(B.readout(m).signal, 0);
}

const independent = B.create({ n: 200, noise: 0.02 }, 'scattered');
const together = B.create({ n: 200, coupling: 24, noise: 0.02 }, 'scattered');
B.advance(independent, 6); B.advance(together, 6);
assert.ok(B.readout(independent).r1 < 0.2);
assert.ok(B.readout(together).r1 > 0.95);
assert.ok(B.rms(together.history) > 0.6);
assert.ok(B.rms(together.history) > 6 * B.rms(independent.history));
near(B.spectrum(together.history).peak, 10, 0.05);

// Paired frequencies and second-harmonic coupling preserve balanced antipodal
// clusters: the pure fundamental cancels despite high within-pair alignment.
const alternating = B.create({ n: 200, coupling: 24, harmonic: 2, noise: 0 }, 'alternating');
B.advance(alternating, 6);
assert.ok(B.readout(alternating).r1 < 1e-10);
assert.ok(B.readout(alternating).r2 > 0.95);
assert.ok(B.rms(alternating.history) < 1e-10);
assert.equal(B.spectrum(alternating.history).peak, null);
for (let i = 0; i < 100; i++) near(alternating.phase[i + 100] - alternating.phase[i], Math.PI, 1e-9);

// Geometry and dipole waveform reproject the SAME retained activity, including
// paused history. The raster, phase state, sample times, and order parameters
// stay identical. Reversed B orientation changes cancellation into addition.
const phasesBefore = Array.from(alternating.phase);
const spikesBefore = JSON.stringify(alternating.spikes);
const timeBefore = alternating.t;
const historyBefore = alternating.history.map(r => ({ t: r.t, r1: r.r1, r2: r.r2 }));
const historyReference = alternating.history;
const rowReference = alternating.history[0];
B.configure(alternating, { orientation: -1 });
assert.equal(alternating.history, historyReference);
assert.equal(alternating.history[0], rowReference);
assert.ok(B.rms(alternating.history) > 0.6);
for (const row of alternating.history) near(row.signal, 2 * row.a, 1e-10);
assert.deepEqual(Array.from(alternating.phase), phasesBefore);
assert.equal(JSON.stringify(alternating.spikes), spikesBefore);
near(alternating.t, timeBefore);
assert.deepEqual(alternating.history.map(r => ({ t: r.t, r1: r.r1, r2: r.r2 })), historyBefore);
B.configure(alternating, { orientation: 1, shape: 0.35 });
assert.ok(B.rms(alternating.history) > 0.2);
near(B.spectrum(alternating.history).peak, 20, 0.05);
assert.equal(alternating.exampleIndices.length, 6);
for (const row of alternating.history) {
  near(row.a, row.c1a + 0.35 * row.c2a);
  near(row.b, row.c1b + 0.35 * row.c2b);
  assert.equal(row.examples.length, 6);
  for (const e of row.examples) { assert.ok(Math.abs(e.c1) <= 1); assert.ok(Math.abs(e.c2) <= 1); }
}

// A shared idealized phase reset produces transient coherence without changing
// natural frequencies or recording a fictitious phase-crossing event.
const transient = B.create({ n: 200, spread: 0.2, noise: 0 }, 'scattered');
B.advance(transient, 1);
const pulseTime = transient.t, pulseHistory = transient.history.length;
const pulseSpikes = JSON.stringify(transient.spikes);
const pulseFrequencies = Array.from(transient.frequencies);
B.pulse(transient);
near(transient.t, pulseTime); assert.equal(transient.history.length, pulseHistory);
assert.equal(JSON.stringify(transient.spikes), pulseSpikes);
assert.deepEqual(Array.from(transient.frequencies), pulseFrequencies);
assert.ok(B.readout(transient).r1 > 0.99);
assert.deepEqual(transient.pulses.at(-1), { t: pulseTime, type: 'pulse' });
B.advance(transient, 2);
assert.ok(B.readout(transient).r1 < 0.1);
const scrambleTime = transient.t, scrambleHistory = transient.history.length;
B.scramble(transient);
near(transient.t, scrambleTime); assert.equal(transient.history.length, scrambleHistory);
assert.ok(B.readout(transient).r1 < 0.15);
assert.deepEqual(transient.pulses.at(-1), { t: scrambleTime, type: 'scramble' });

// Live frequency/coupling/noise changes preserve activity and past recordings.
const configuredPhase = Array.from(transient.phase), configuredHistory = JSON.stringify(transient.history);
B.configure(transient, { frequency: 18, coupling: 12, noise: 0.3, spread: 0.3 });
near(transient.t, scrambleTime);
assert.deepEqual(Array.from(transient.phase), configuredPhase);
assert.equal(JSON.stringify(transient.history), configuredHistory);
near(Array.from(transient.frequencies).reduce((x, y) => x + y) / 200, 18);
for (let i = 0; i < 100; i++) near(transient.frequencies[i], transient.frequencies[i + 100]);

// Analytic uncoupled rotation checks integration, exact duration, and upward
// cycle-crossing raster timing. Each event has the expected period.
const rotating = B.create({ n: 20, frequency: 10, spread: 0, noise: 0 }, 'aligned');
const initialPhase = Array.from(rotating.phase);
B.advance(rotating, 0.123);
near(rotating.t, 0.123, 1e-12);
for (let i = 0; i < 20; i++) {
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
const coarse = B.create({ n: 20, coupling: 24, noise: 0 });
const fine = B.create({ n: 20, coupling: 24, noise: 0 });
const reference = B.create({ n: 20, coupling: 24, noise: 0 });
for (let i = 0; i < 500; i++) B.step(coarse, 0.002);
for (let i = 0; i < 1000; i++) B.step(fine, 0.001);
for (let i = 0; i < 2000; i++) B.step(reference, 0.0005);
const error = m => Math.sqrt(m.phase.reduce((sum, x, i) => sum + (x - reference.phase[i]) ** 2, 0) / m.p.n);
assert.ok(error(fine) < error(coarse) / 2.5);

// Hann periodogram normalization: integrating the one-sided PSD of an
// amplitude-one sinusoid gives variance1/2, and halving amplitude quarters power.
const samples = Array.from({ length: 1500 }, (_, i) => ({ t: i * B.SAMPLE_DT, signal: Math.cos(B.TAU * 10 * i * B.SAMPLE_DT) }));
const psd = B.spectrum(samples);
near(psd.peak, 10, 0.05); near(psd.duration, 4.096); near(psd.df, 250 / 1024);
near(psd.power.reduce((x, y) => x + y, 0) * psd.df, 0.5, 0.001);
const halfPSD = B.spectrum(samples.map(r => ({ t: r.t, signal: r.signal / 2 })));
near(halfPSD.peakPower / psd.peakPower, 0.25);
assert.equal(B.spectrum(samples.slice(0, 127)).peak, null);
assert.equal(B.spectrum(samples.map(r => ({ t: r.t, signal: 3 }))).peak, null);

// The displayed RMS includes the mean component; it is not standard deviation.
near(B.rms(Array.from({ length: 100 }, (_, i) => ({ t: i * 0.01, signal: 2 }))), 2);
near(B.rms(Array.from({ length: 1000 }, (_, i) => ({ t: i * 0.001,
  signal: Math.sin(B.TAU * 10 * i * 0.001) }))), Math.SQRT1_2, 1e-12);
near(B.rms([{ t: 0, signal: -1 }, { t: 1, signal: 2 }, { t: 2, signal: 3 }]), Math.sqrt(14 / 3));
near(B.rms([{ t: 0, signal: 100 }, { t: 1, signal: 2 }, { t: 2, signal: 3 }], 1), Math.sqrt(13 / 2));

// At the highest UI rhythm, the waveform's second harmonic is genuinely60Hz.
// The250Hz signal sampler must retain it rather than aliasing it to40Hz.
const fast = B.create({ n: 20, frequency: 30, spread: 0, noise: 0, shape: 0.35 }, 'aligned');
B.advance(fast, 6);
const fastPSD = B.spectrum(fast.history);
const bin60 = Math.round(60 / fastPSD.df), bin40 = Math.round(40 / fastPSD.df);
assert.ok(fastPSD.power[bin60] > 1e5 * fastPSD.power[bin40]);

// Maximum population, bandwidth, coupling, noise and both coupling harmonics
// remain finite and in the mathematically possible dipole/order bounds.
for (const harmonic of [1, 2]) {
  const extreme = B.create({ n: 500, frequency: 40, spread: 0.4,
    coupling: 40, noise: 3, shape: 1, harmonic });
  B.advance(extreme, 0.5); finite(extreme);
}
finite(together); finite(alternating); finite(transient);
console.log('PASS: phase order, seeded noise, paired frequencies, population normalization, collective locking, antipodal cancellation, orientation/waveform reprojection, transient phase reset, live controls, raster timing, fixed sampling/window, timestep convergence, PSD frequency/variance normalization, and 500-neuron parameter extremes.');
