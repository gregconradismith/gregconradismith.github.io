/* Neurons to brain waves: a deliberately simplified phase and dipole model.
 * No external dependencies. The same numerical model runs in a browser and Node.
 */
(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.BrainWaves = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const TAU = 2 * Math.PI;
  const DT = 0.002;
  // 250 Hz sampling resolves the UI's rhythm and frequency spread well below
  // Nyquist, independently of browser playback speed.
  const SAMPLE_DT = 0.004;
  const WINDOW = 12;
  const defaults = Object.freeze({ n: 200, frequency: 10, spread: 0.12,
    coupling: 0, noise: 0.02, seed: 351 });
  const clamp = (x, low, high) => Math.max(low, Math.min(high, x));
  function parameters(input) {
    const p = {};
    for (const key of Object.keys(defaults)) {
      p[key] = Number(input && input[key] !== undefined ? input[key] : defaults[key]);
      if (!Number.isFinite(p[key])) p[key] = defaults[key];
    }
    p.n = Math.round(clamp(p.n, 20, 500));
    p.frequency = clamp(p.frequency, 1, 40);
    p.spread = clamp(p.spread, 0, 1);
    p.coupling = clamp(p.coupling, 0, 40);
    p.noise = clamp(p.noise, 0, 3);
    p.seed = p.seed >>> 0;
    return p;
  }
  // Mulberry32 and Box-Muller, with RNG state held inside each simulation.
  function random(m) {
    let z = m._seed = (m._seed + 0x6D2B79F5) >>> 0;
    z = Math.imul(z ^ z >>> 15, z | 1);
    z ^= z + Math.imul(z ^ z >>> 7, z | 61);
    return ((z ^ z >>> 14) >>> 0) / 4294967296;
  }
  function normal(m) {
    if (m._normal !== null) {
      const z = m._normal; m._normal = null; return z;
    }
    const radius = Math.sqrt(-2 * Math.log(Math.max(1e-15, random(m))));
    const angle = TAU * random(m);
    m._normal = radius * Math.sin(angle);
    return radius * Math.cos(angle);
  }
  function setFrequencies(m) {
    for (let j = 0; j < m.p.n; j++) {
      // Evenly spaced quantiles have exactly zero-mean detuning across the
      // single population, including when its neuron count is odd.
      const detuning = 2 * j / (m.p.n - 1) - 1;
      m.frequencies[j] = m.p.frequency * (1 + m.p.spread * detuning);
    }
  }
  function orders(phase) {
    let c1 = 0, s1 = 0;
    for (let i = 0; i < phase.length; i++) {
      const x = phase[i];
      c1 += Math.cos(x); s1 += Math.sin(x);
    }
    const n = phase.length || 1;
    return { r1: Math.hypot(c1, s1) / n, psi1: Math.atan2(s1, c1) };
  }
  function readout(m) {
    let signal = 0;
    for (let i = 0; i < m.p.n; i++) {
      signal += Math.cos(m.phase[i]);
    }
    signal /= m.p.n;
    const examples = m.exampleIndices.map(i => Math.cos(m.phase[i]));
    return Object.assign({ t: m.t, signal,
      examples, rate: m.p.frequency },
      orders(m.phase));
  }
  function record(m) {
    const r = readout(m);
    m.history.push({ t: m.t, signal: r.signal, r1: r.r1, examples: r.examples });
    const oldest = m.t - WINDOW - 1e-8;
    while (m.history.length && m.history[0].t < oldest) m.history.shift();
    for (const crossings of m.spikes) {
      while (crossings.length && crossings[0] < oldest) crossings.shift();
    }
    while (m.pulses.length && m.pulses[0].t < oldest) m.pulses.shift();
  }
  function create(input, initial) {
    const p = parameters(input);
    const m = { p, phase: new Float64Array(p.n), frequencies: new Float64Array(p.n),
      t: 0, history: [], spikes: Array.from({ length: p.n }, () => []), pulses: [],
      exampleIndices: Array.from({ length: 6 }, (_, i) => Math.round(i * (p.n - 1) / 5)),
      _seed: p.seed, _normal: null, _nextSample: SAMPLE_DT,
      _nextCrossing: new Float64Array(p.n), _drift: new Float64Array(p.n),
      _predictor: new Float64Array(p.n), _noise: new Float64Array(p.n),
      _drift2: new Float64Array(p.n) };
    setFrequencies(m);
    for (let i = 0; i < p.n; i++) {
      if (initial === 'aligned') {
        m.phase[i] = 0.3 + 0.15 * (random(m) - 0.5);
      } else m.phase[i] = TAU * random(m);
      m._nextCrossing[i] = TAU * (Math.floor(m.phase[i] / TAU) + 1);
    }
    record(m);
    return m;
  }
  function configure(m, partial) {
    // A count change creates a new model in the UI; this function intentionally
    // preserves count, phase, random stream, simulation time, and recorded past.
    m.p = parameters(Object.assign({}, m.p, partial, { n: m.p.n, seed: m.p.seed }));
    setFrequencies(m);
    return m;
  }
  function drift(m, phase, out) {
    const n = m.p.n;
    let re = 0, im = 0;
    if (m.p.coupling) {
      for (let i = 0; i < n; i++) {
        re += Math.cos(phase[i]); im += Math.sin(phase[i]);
      }
      re /= n; im /= n;
    }
    for (let i = 0; i < n; i++) {
      // Equivalent to K r sin(psi - theta_i). The neuron's
      // self-term is exactly sin(0) and contributes no phase force.
      out[i] = TAU * m.frequencies[i] + m.p.coupling *
        (im * Math.cos(phase[i]) - re * Math.sin(phase[i]));
    }
  }
  function integrate(m, dt) {
    drift(m, m.phase, m._drift);
    const amplitude = Math.sqrt(2 * m.p.noise * dt);
    for (let i = 0; i < m.p.n; i++) {
      m._noise[i] = amplitude ? amplitude * normal(m) : 0;
      m._predictor[i] = m.phase[i] + dt * m._drift[i] + m._noise[i];
    }
    // Stochastic Heun for additive noise: one shared random increment in
    // predictor and corrector. Reduces to deterministic second-order Heun.
    drift(m, m._predictor, m._drift2);
    for (let i = 0; i < m.p.n; i++) {
      const previous = m.phase[i];
      const next = previous + 0.5 * dt * (m._drift[i] + m._drift2[i]) + m._noise[i];
      let crossing = m._nextCrossing[i];
      // First passages of SUCCESSIVE cycle levels prevent noise-driven
      // recrossings of the same level from creating duplicate raster events.
      while (next >= crossing) {
        const fraction = clamp((crossing - previous) / (next - previous), 0, 1);
        m.spikes[i].push(m.t + fraction * dt);
        crossing += TAU;
      }
      m._nextCrossing[i] = crossing;
      m.phase[i] = next;
    }
    m.t += dt;
  }
  function step(m, dt) {
    if (dt === undefined) dt = DT;
    if (!(dt > 0) || !Number.isFinite(dt)) return m;
    let remaining = dt;
    while (remaining > 1e-12) {
      const untilSample = m._nextSample - m.t;
      const substep = Math.min(DT, remaining, Math.max(1e-12, untilSample));
      integrate(m, substep);
      remaining -= substep;
      if (m.t >= m._nextSample - 1e-10) {
        // Fixed sampling instants give a well-defined Nyquist rate and avoid
        // timing drift after arbitrary UI advance durations.
        m.t = m._nextSample;
        record(m);
        m._nextSample += SAMPLE_DT;
      }
    }
    return m;
  }
  function advance(m, duration) {
    if (!(duration > 0) || !Number.isFinite(duration)) return m;
    const end = m.t + duration;
    while (m.t < end - 1e-12) step(m, Math.min(DT, end - m.t));
    return m;
  }
  function pulse(m) {
    for (let i = 0; i < m.p.n; i++) {
      const cycle = Math.round(m._nextCrossing[i] / TAU) - 1;
      m.phase[i] = TAU * cycle + 0.12 + 0.04 * Math.sin(i * 2.399963229728653);
      m._nextCrossing[i] = TAU * (cycle + 1);
    }
    m.pulses.push({ t: m.t, type: 'pulse' });
    return m;
  }
  function scramble(m) {
    for (let i = 0; i < m.p.n; i++) {
      const cycle = Math.round(m._nextCrossing[i] / TAU) - 1;
      m.phase[i] = TAU * cycle + TAU * random(m);
      m._nextCrossing[i] = TAU * (cycle + 1);
    }
    m.pulses.push({ t: m.t, type: 'scramble' });
    return m;
  }
  function rms(history, seconds) {
    if (!history.length) return 0;
    const cutoff = history[history.length - 1].t - (seconds === undefined ? 2 : seconds);
    let squares = 0, n = 0;
    for (let i = history.length - 1; i >= 0 && history[i].t >= cutoff; i--) {
      squares += history[i].signal ** 2; n++;
    }
    return n ? Math.sqrt(squares / n) : 0;
  }
  function fft(re, im) {
    const n = re.length;
    for (let i = 1, j = 0; i < n; i++) {
      let bit = n >> 1;
      while (j & bit) { j ^= bit; bit >>= 1; }
      j ^= bit;
      if (i < j) { let x = re[i]; re[i] = re[j]; re[j] = x; }
    }
    for (let width = 2; width <= n; width <<= 1) {
      const angle = -TAU / width, wrStep = Math.cos(angle), wiStep = Math.sin(angle);
      for (let start = 0; start < n; start += width) {
        let wr = 1, wi = 0;
        for (let j = 0; j < width / 2; j++) {
          const a = start + j, b = a + width / 2;
          const tr = wr * re[b] - wi * im[b], ti = wr * im[b] + wi * re[b];
          re[b] = re[a] - tr; im[b] = im[a] - ti; re[a] += tr; im[a] += ti;
          const nextWr = wr * wrStep - wi * wiStep;
          wi = wr * wiStep + wi * wrStep; wr = nextWr;
        }
      }
    }
  }
  function spectrum(history, limit) {
    const available = Math.min(history.length, limit === undefined ? 1024 : limit, 1024);
    let n = 1;
    while (2 * n <= available) n *= 2;
    if (n < 128) return { frequency: [], power: [], df: null, duration: 0, peak: null, peakPower: 0 };
    const rows = history.slice(-n);
    const dt = (rows[n - 1].t - rows[0].t) / (n - 1);
    const fs = 1 / dt, df = fs / n;
    const re = new Float64Array(n), im = new Float64Array(n);
    const mean = rows.reduce((sum, r) => sum + r.signal, 0) / n;
    let sumWindowSquared = 0;
    for (let j = 0; j < n; j++) {
      const w = 0.5 * (1 - Math.cos(TAU * j / (n - 1)));
      re[j] = (rows[j].signal - mean) * w;
      sumWindowSquared += w * w;
    }
    fft(re, im);
    const frequency = [], power = [];
    let peakIndex = 0, peakPower = 0;
    for (let k = 0; k <= n / 2; k++) {
      const factor = k === 0 || k === n / 2 ? 1 : 2;
      const psd = factor * (re[k] ** 2 + im[k] ** 2) / (fs * sumWindowSquared);
      frequency.push(k * df); power.push(psd);
      if (k && psd > peakPower) { peakPower = psd; peakIndex = k; }
    }
    let peak = null;
    if (peakPower >= 1e-10) {
      peak = frequency[peakIndex];
      if (peakIndex > 0 && peakIndex < power.length - 1) {
        const a = Math.log(Math.max(1e-30, power[peakIndex - 1]));
        const b = Math.log(Math.max(1e-30, power[peakIndex]));
        const c = Math.log(Math.max(1e-30, power[peakIndex + 1]));
        const denominator = a - 2 * b + c;
        if (denominator) peak += clamp(0.5 * (a - c) / denominator, -0.5, 0.5) * df;
      }
    }
    return { frequency, power, df, duration: n * dt, peak, peakPower };
  }
  return Object.freeze({ DT, SAMPLE_DT, TAU, defaults, create, configure, step,
    advance, pulse, scramble, orders, readout, spectrum, rms });
});
