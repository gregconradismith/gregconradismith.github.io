# FitzHugh–Nagumo network simulator

[Open the simulator](https://gregconradismith.github.io/simulations/fitzhugh-nagumo-network/).

A standalone teaching simulator by Greg Conradi Smith, developed with Codex. Choose excitatory or inhibitory coupling and one to twelve neurons. Compare the phase plane, the complete voltage-nullcline family, voltage traces, and spike times. The two-neuron examples illustrate synchronization under excitation and alternation under inhibition; larger networks can form clusters or staggered rhythms.

Open `index.html` directly in a browser; all code and styles are inline. To preview at the published directory path, run `python3 -m http.server 8000` from the website repository root and visit `/simulations/fitzhugh-nagumo-network/`.

## Model and controls

Each neuron obeys `dv/dt = v - v^3/3 - w + I + I_syn` and `dw/dt = 0.08 (v + 0.4 - 0.5 w)`. Coupling is all-to-all, excludes self-input, and is normalized by the number of partners. An active partner (`v > 0`) sends a threshold-gated additive current, positive for excitation and negative for inhibition. For a single neuron the synaptic current is zero. Integration uses RK4 with a fixed step of 0.005, independent of playback speed. Time and all model quantities are dimensionless.

The default excitatory example uses `I = 0, g = 1`; the inhibitory example uses `I = 1, g = 2`. Coupling strength and the coupling switch change inputs while preserving the current state. Mode, neuron count, and starting-phase choices restart the simulation. “All neurons” is the default follow selection; “None” removes colored nullcline highlighting. Every reference nullcline remains visible, including when coupling is switched off.

These examples explain timing mechanisms in a reduced model. They are not experimental calibration, a conductance-based synaptic model, or a claim that excitation always synchronizes or inhibition always produces alternation. In networks with more than two neurons, all pairs cannot be half a cycle apart.

## Verification

With Node.js installed, run from this directory:

```sh
node verify.cjs
node verify-interaction.cjs
```

The first script checks numerical boundedness, representative pair timing, and step refinement. The second checks nullcline residuals and labels, follow selections, live coupling, playback, restart, and count limits with a dependency-free DOM/canvas harness. Browser inspection is an additional publication check.

## References and provenance

Scientific references are preserved in the simulator’s expandable model notes: FitzHugh (1961), *Impulses and physiological states in theoretical models of nerve membrane*, and Ausborn et al. (2018), *State-dependent rhythmogenesis and frequency control in a half-center locomotor CPG*.

This app was developed locally for classroom use and first published in this academic website repository on 2026-11-05. The local source document and verification scripts are retained in the initial app commit; the website integration adds only navigation. See `../provenance.json` for the exact source commit and path. No simulator license is declared; the website theme’s license does not grant additional rights to this app.
