# Slow Passage Through Hopf

Live simulator: https://gregconradismith.github.io/slow-passage-simulation/

Open `index.html` in a modern browser. This is one self-contained HTML file: no installation, server, libraries, fonts, or internet connection are required. References link out to the web.

Choose **Supercritical** or **Subcritical**, then watch an upward and downward triangular ramp of the bifurcation parameter. Choose **Down, then up** to begin on the oscillatory branch. The phase plane, static bifurcation diagram, state traces, amplitude, and parameter history update together. Blue denotes increasing parameter and orange decreasing parameter. Green solid branches are stable frozen-parameter solutions; purple dashed branches are unstable.

The default ramp is −0.45 → 0.65 → −0.45 at ε = 0.01, with initial radius 0.05 and angular frequency 1. At playback 5 model-time units/second, one round trip lasts 44 seconds. Ramp rate changes the experiment; playback changes how quickly it is displayed. All model variables/time are dimensionless.

The parameter plot has **x**, **y**, and **r** buttons. Switching them redraws recorded history without restarting or changing the model. The signed x/y views show static cycle extrema at ±r as envelopes, not equilibrium branches; the r view shows cycle radii. Log amplitude applies only to r and to the amplitude-in-time plot, so x/y retain signed linear axes. PNG export follows the selected view.

Controls include additive white-noise strength and random seed, ramp rate and endpoints, seed radius, angular frequency, playback, phase-plane tail, logarithmic amplitude, fixed-parameter hold, a radial perturbation, continuous repeated ramps, CSV export, and PNG snapshots. Experiment settings restart the trajectory; view settings and playback preserve it. Repeated ramps, hold/resume, and perturbations preserve state and history. A single round trip stops at the final endpoint unless repeat was selected.

## Models

With x = r cos θ and y = r sin θ, θ′ = ω:

- Supercritical: r′ = μr − r³.
- Subcritical: r′ = μr + r³ − r⁵.
- μ′ = ±ε during ramps; μ′ = 0 during hold.

The subcritical model includes a stabilizing quintic term, so a stable large cycle is available. The static cycle fold is μ = −1/4, and the Hopf point is μ = 0. Delayed growth on an upward sweep, persistence near the downward cycle fold, and static bistability are distinct effects; the page explains these distinctions.

At σ > 0 the Cartesian equations also include independent additive white noise σ dW_x and σ dW_y. Noise increments have standard deviation σ√Δt per coordinate. Noise is applied after each deterministic drift step (a first-order splitting approximation); it is not tied to animation frames or playback speed. A seeded generator and Box–Muller transform give reproducible runs for identical settings and controls. The noise-free case is unchanged.

The solver integrates log radius using RK4 with maximum step 0.01 and resolves ramp corners exactly. Deterministic angular rotation is exact; Cartesian noise also changes the phase. This preserves exponentially small deterministic seeds without imposing an amplitude floor. The log plot has a display floor at 10^−12; the solver does not. The observation threshold r = 0.15 is arbitrary and is not a bifurcation condition. On very deep/slow sweeps or after repeated ramps, a detectable oscillation need not occur within the chosen range. At higher rates, decay may not complete before the ramp ends. Small perturbations alter the memory and delay.

History retains up to 100,000 samples at nominal interval 0.05, plus control events and the current endpoint. CSV columns are time, μ, x, y, r, natural log radius, ramp direction (+1 or −1), whether μ was held, noise strength σ, and random seed. PNG captures the five plots at one model time.

Try σ = 0, 0.0001, 0.001, and 0.01. Compare several random seeds: noise can shorten the delay or trigger escape from the stable-origin basin before the static Hopf point. The static bifurcation branches always describe the deterministic system. Crossing detections in a noisy trace may repeat and do not estimate a universal stochastic bifurcation threshold.

## Verification

Run `node verify.cjs` and `node verify-interaction.cjs` (Node is needed only for these development checks).

Checks include the static branch equations and stability, a known exact held-parameter solution, precise ramp endpoints in both directions, delayed growth and fold passage, numerical convergence, preservation of logarithmic memory, state continuity under hold/pause/perturbation, the view/export handlers, Gaussian mean/variance/independence, seeded reproducibility, the linear stochastic oscillator second moment, and noisy round trips in both models and ramp directions. Browser checks cover rendering, a complete subcritical round trip, a downward start, log amplitude, parameter hold, and narrow and desktop layouts. Direct file navigation was unavailable in the in-app browser, which only permits HTTP(S); local-server preview was used. The HTML contains no external runtime assets or network requests.

## Background

Baer, S. M., Erneux, T., & Rinzel, J. (1989). The slow passage through a Hopf bifurcation: Delay, memory effects, and resonance. *SIAM Journal on Applied Mathematics*, 49(1), 55–71. https://doi.org/10.1137/0149003

- https://www.scholarpedia.org/article/Andronov-Hopf_bifurcation
- https://www.scholarpedia.org/article/Bautin_bifurcation

The normal forms are classroom illustrations, not quantitative fits to a particular membrane model.
