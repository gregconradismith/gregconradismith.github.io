# From neurons to brain waves

[Open the simulator](https://gregconradismith.github.io/simulations/neurons-to-brain-waves/).

A standalone teaching simulator linking synchrony in one population of neurons to an EEG-like population signal. Open `index.html` in a modern browser; all runtime files are local and require no installation or external libraries.

## One population, equal contributions

Every neuron contributes the same centered current waveform, `p_i = cos(theta_i)`. The signal is `y = mean(p_i)`: add every source with the same positive weight, then divide by population size. The division keeps changes in neuron count from automatically changing the plot scale. Individual currents oscillate above and below their mean. Aligned phases reinforce a population wave; scattered phases give partial cancellation of current deviations and a smaller population rhythm.

There is one population, with no group assignments, orientation reversals, selectable current waveforms, or second-harmonic interaction. Six faint traces show individual currents sampled across the population. The dark trace is the mean of **all** neurons, rather than just those six examples. The population view and crossing raster use one color for all neurons.

Each displayed neuron is an idealized rhythmic current source with phase `theta_i`. The dynamics are ordinary stochastic Kuramoto coupling:

`d theta_i = [2*pi*f_i + K*R*sin(psi - theta_i)] dt + sqrt(2*D) dW_i`,

where `R*exp(i*psi) = mean(exp(i*theta_i))`. Natural frequencies are evenly distributed around the selected mean, across the entire population. The alignment meter shows `100*R` percent. On the phase wheel, an orange head-to-tail chain includes every neuron's phase vector in neuron order, each scaled to `1/N` of the wheel radius. Starting at the center, the chain ends exactly at the dark mean arrow's tip. The arrow length is alignment, and its horizontal component is the population-average current. Individual chain segments become very small at large population sizes. Frequency, frequency variation, coupling, and independent phase noise remain separate controls.

This current-source model illustrates how coordinated currents can generate a population signal. It is an educational approximation to EEG in arbitrary units, with source geometry held fixed. Real EEG depends on transmembrane currents, their spatial arrangement, and conduction through the head. Raster marks are successive upward phase crossings; there is no membrane-voltage/action-potential or calibrated scalp-voltage model.

## Controls and experiments

- Choose any integer population size from 20 to 500. Use Apply or Enter to commit an edited count.
- Natural rhythm: 2–30 Hz; spread: 0–100%; coupling: 0–30 per second; phase noise: 0–0.3 radians squared per second. At ±100% spread, natural frequencies range from zero to twice the selected mean (up to 60 Hz at the UI maximum).
- Independent neurons starts with scattered phases, zero coupling, and noise 0.02. Lock together uses coupling 24 and noise 0.02. Both use a 10 Hz mean and 12% spread, retain the selected neuron count, and include six seconds of starting history.
- Presets, Restart, and count changes restart the observation. Frequency, coupling, spread, and noise act live while preserving current phases, time, and previous observations.
- Common input is an idealized phase reset: use it with independent neurons and watch temporary alignment disperse. Scatter phases randomizes timing without changing natural frequencies. Both preserve time and history.
- Pause/run, advance one model second, choose a two- or six-second time window, and set playback speed independently of model frequency. Reduced-motion preferences start the app paused.
- The Power spectral density panel defaults to a logarithmic vertical scale; choose Linear for an alternative view. This display choice is preserved across presets, Restart, and count changes, and changes neither the neuronal model nor the signal or its PSD calculation.

Suggested comparison: at the same natural frequency, compare Independent neurons with Lock together. The mean crossing rate can remain similar while population signal amplitude differs greatly. Alternatively increase coupling live, then scatter phases to watch synchronization develop.

## Numerical and signal conventions

Integration uses stochastic Heun with a fixed 0.002-second step, independent of playback speed. Signal sampling is at 250 Hz, and up to 12 seconds of history are retained. The signal uses a fixed ±1.5 vertical scale. Field RMS (including DC) and mean phase-crossing rate use the last two seconds.

The Power spectral density panel shows the mean-subtracted, Hann-windowed one-sided PSD from up to 1,024 samples (4.096 seconds, approximately 0.244 Hz bin spacing). Its normalization is unchanged: power is expressed in a.u.²/Hz, and integrating the PSD across frequency estimates the mean-subtracted signal power. It displays 0–100 Hz with shared fixed vertical bounds across experiments: the default logarithmic view spans 10⁻⁶–2 a.u.²/Hz, and the optional linear view spans 0–2 a.u.²/Hz. The logarithmic view makes weak asynchronous power visible without normalizing each spectrum to its own peak. Values below 10⁻⁶ are drawn at that display floor; this does not change the calculated PSD or mean that their power is zero. The floor is a plotting limit, not a physiological noise threshold.

The spectrum window is independent of the time-plot view and can include observations from before and after a live parameter change. A spectral peak is an estimate, not a separate oscillator parameter. Changing the vertical scale only redraws the same PSD; it does not restart the observation or alter retained signal history.

## Verification

Run from this directory:

```sh
node verify.cjs
node verify-interaction.cjs
```

The numerical suite checks equal additive contributions, a single frequency distribution, arbitrary integer population sizes, seeded dynamics, collective locking, transient alignment/dephasing, live-control continuity, event timing, timestep refinement, true RMS, PSD normalization, and parameter extremes. The interaction harness checks the one-population interface, presets, buffered count Apply/Enter, live controls, playback, perturbations, plotting windows, and fixed scales. Inspect real browser rendering and controls before publication.

## Scientific context and provenance

This is an educational abstraction rather than a reproduction of the detailed models in these primary sources:

- [Hansel, Mato, and Meunier (1993), *Clustering and slow switching in globally coupled phase oscillators*](https://doi.org/10.1103/PhysRevE.48.3470).
- [Hagen and colleagues (2018), *Multimodal Modeling of Neural Network Activity: Computing LFP, ECoG, EEG, and MEG Signals With LFPy 2.0*](https://doi.org/10.3389/fninf.2018.00092).

Source is maintained in this website repository under `simulations/neurons-to-brain-waves/`, with the exact reviewed source commit in `../provenance.json`. First published on 2026-11-05 and simplified at Greg’s request to one population with equal contributions later that day. No EEG recordings or fitted experimental parameters are included. No separate simulator license is declared; the website theme license does not grant additional rights to this app.
