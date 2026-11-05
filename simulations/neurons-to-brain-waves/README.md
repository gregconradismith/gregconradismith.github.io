# From neurons to brain waves

[Open the simulator](https://gregconradismith.github.io/simulations/neurons-to-brain-waves/).

A standalone teaching simulator linking population timing to an EEG-like signal. Open `index.html` in a modern browser; no installation, server, or external runtime libraries are required.

## What the model represents

Each displayed neuron has an oscillatory phase. Kuramoto-style coupling acts on either the first phase harmonic (favoring common phase) or the second (allowing two groups separated by half a cycle). Frequency variation and independent phase noise oppose alignment. This is a conceptual population model: second-harmonic coupling is **not a literal model of inhibitory synapses**. Inhibition can produce several timing patterns depending on cellular and network dynamics.

The assigned rhythmic current dipole of neuron *i* is

`p_i = cos(theta_i) + shape * cos(2 * theta_i)`.

The smooth waveform uses `shape = 0`; the two-harmonic waveform uses `shape = 0.35`. The electrode signal is the arithmetic mean `mean(w_i * p_i)`, in arbitrary units. Dividing by population size supports comparisons of timing and geometry; this signal does not represent the total field growing with the number of sources. Group A is the first half of the population and has weight +1. Group B is the second half and can have weight +1 or −1, illustrating how current-dipole orientation changes summation. These weights simplify source geometry; this is not a calibrated head or scalp-conduction model.

EEG is associated with the combined fields of neuronal currents, particularly suitably arranged and coordinated dendritic currents. It is not an arithmetic average of action potentials. Here, raster marks indicate oscillator phase crossings; there is no membrane-voltage or action-potential model. The waveform, geometry, and phase-crossing display are deliberately simple teaching approximations.

`R1 = |mean(exp(i * theta))|` measures one-cluster phase coherence. `R2 = |mean(exp(2i * theta))|` also detects two opposite clusters. Thus low R1 can describe either dispersed phases or two organized alternating groups. The signal and spectrum additionally depend on waveform and signed geometry: cancellation at an electrode does not establish that the network is disordered. Rhythm frequency and phase alignment are independent controls.

## Controls and examples

- Population: 20–500 neurons, in increments of 20; central frequency: 2–30 Hz; frequency spread: 0–40%.
- Coupling: 0–30 per second; independent phase-noise intensity: 0–0.3 radians squared per second.
- Waveform: smooth or two harmonics. Flip Group B's orientation to compare addition and cancellation.
- Play/pause, reset, scatter phases, apply an ideal common phase-reset pulse, advance one second, and choose playback speed. The time plots show the last two seconds by default, with an optional six-second view.
- Live parameter controls retain history. Changing population size or selecting a preset restarts the demonstration. Each preset begins with six seconds of simulated settling.

Changing waveform or orientation recalculates the entire retained signal history from saved group Fourier components while leaving phases, time, and raster crossings unchanged. This is a counterfactual display of the same phase history under the selected waveform and measurement geometry. In particular, pause and flip Group B to compare two electrode signals from identical activity; the recalculated past does not imply that the physical past changed.

Integration uses a fixed 0.002-second step, independent of playback speed. Signal sampling is at 250 Hz, and up to 12 seconds of history are retained. The signal uses a fixed ±1.5 vertical scale. Its RMS and observed mean phase-crossing rate use the last two seconds. The spectrum is a one-sided power spectral density from a mean-subtracted, Hann-windowed segment of up to 1,024 samples spanning 4.096 seconds, with approximately 0.244 Hz bin spacing. It displays 0–100 Hz on a fixed 0–2 arbitrary-units-squared/Hz scale; its window is independent of the time-plot view. A short-window spectral peak is an estimate, not a separately controlled oscillator frequency. The observed crossing rate is not a measured biological firing rate.

The presets use the following starting conditions:

| Preset | Coupling harmonic | Coupling | Noise | Frequency spread |
| --- | --- | --- | --- | --- |
| Independent | First | 0 /s | 0.02 rad²/s | 12% |
| Together | First | 24 /s | 0.02 rad²/s | 12% |
| Alternating | Second | 24 /s | 0 | 12% |

Alternating starts with paired frequencies and phases differing by π between groups. It supplies a controlled two-cluster example, rather than claiming that arbitrary networks or inhibitory connections must reach this state. A common pulse is an idealized deterministic phase reset, not a modeled physiological stimulus. Animation speed changes playback, not the assigned biological frequencies.

Suggested comparisons: switch between Independent and Together at the same frequency; compare low R1 in Independent versus Alternating; then flip Group B's orientation in Alternating. With the two-harmonic waveform, opposite groups can retain a component at twice the base frequency even when the fundamental cancels.

## Verification

Run `node verify.cjs` and `node verify-interaction.cjs` from this directory. Both suites are dependency-free. The numerical suite checks finite phases and bounded assigned signals across parameter extremes, seeded noise, one- versus two-cluster coherence, cancellation/addition under reversed weights, waveform and orientation reprojection, transient phase reset, live parameter changes, raster timing, fixed signal sampling, numerical-step convergence, and spectral frequency/variance normalization. A high-frequency regression checks that a 60 Hz waveform component is retained rather than aliased to 40 Hz.

The interaction suite checks presets, live-control continuity, geometry/history reprojection, phase perturbations, count resets, explicit advancement, fixed plotting scales, and playback speeds with a DOM/canvas harness. Also inspect the rendered app for live controls, restarts, pause/step behavior, phase reset, group orientation, playback speeds, and responsive rendering before publication. A passing model check is not experimental validation or EEG calibration.

## Scientific context and provenance

This simulator's phase dynamics and assigned dipoles are an educational abstraction, not a reproduction of the detailed models in these primary sources:

- [Hansel, Mato, and Meunier (1993), *Clustering and slow switching in globally coupled phase oscillators*](https://doi.org/10.1103/PhysRevE.48.3470).
- [Hagen and colleagues (2018), *Multimodal Modeling of Neural Network Activity: Computing LFP, ECoG, EEG, and MEG Signals With LFPy 2.0*](https://doi.org/10.3389/fninf.2018.00092).

The standalone source is maintained in this website repository under `simulations/neurons-to-brain-waves/`. The catalogue and `simulations/provenance.json` record the public integration. No EEG recordings or fitted experimental parameters are included.

The app was first published here on 2026-11-05. No separate simulator license is declared; the website theme license does not grant additional rights to this app.
