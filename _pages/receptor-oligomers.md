---
layout: single
title: "Receptor Allostery and Cycle Kinetics"
permalink: /research/receptor-oligomers/
author_profile: true
---

Cell-surface receptors connect chemical signals outside a cell with responses inside it. Many receptors contain interacting subunits, so the binding or conformation of one part can change the behaviour of another. My research develops mathematical and biophysical theory for this allosteric coupling, asking how receptor architecture and molecular interactions shape binding, activation and signalling.

### From subunits to receptor complexes

In work with Richard Hammack, I developed a construction of cycle bases for reduced powers of graphs. These graphs describe collections of identical, indistinguishable subunits whose behaviour may be coupled. Starting from a monomer state-transition graph, the construction organizes the cycles that appear in a receptor dimer or larger oligomer and identifies constraints required for microscopic reversibility. [1]

My subsequent work expresses equilibrium occupancies and binding curves in terms of monomer properties and emergent allosteric parameters. Distinguished spanning trees provide a systematic way to choose parameters with physical interpretations while respecting thermodynamic constraints. The method accommodates arbitrary monomer state graphs and does not assume independent subunits. Examples include ternary-complex and cubic-ternary-complex models of G-protein-coupled receptors, linking ligand binding, G-protein association and receptor activation. [2]

### Signalling away from equilibrium

I am extending this framework to receptor kinetics driven by nucleotide exchange and hydrolysis. These processes can maintain circulating probability currents, making turnover and transition times important alongside occupancy. Current models distinguish systems with fixed concentrations of free molecular species from mass-action systems with finite receptor and G-protein pools. That distinction makes conservation laws, chemical driving and the interpretation of measured flux explicit.

A central question is what experiments can tell us about the underlying mechanism. Which combinations of binding, turnover and transition-time measurements distinguish competing rate models? How does uncertainty in monomer parameters affect inference about coupling in an oligomer? Graph-theoretic calculations, deterministic models and stochastic simulations provide complementary ways to investigate these questions. Current mechanistic examples use illustrative parameter sets; fitting and testing specific biological systems remains a separate step.

### Computational resources

The [Receptor Modeling Jupyter Book](https://gregconradismith.github.io/receptor-modeling-jupyter-book/intro.html) collects worked examples of equilibrium and steady-state receptor analysis. I am developing resources in SageMath and Python to make these methods usable by quantitative pharmacologists and other life scientists. The book is an unrefereed computational resource, distinct from the peer-reviewed publications below.

### Publications

\[1\] Hammack RH, Smith GD (2017). Cycle bases of reduced powers of graphs. Ars Mathematica Contemporanea 12(1):183–203. [doi:10.26493/1855-3974.856.4d2](https://doi.org/10.26493/1855-3974.856.4d2).

\[2\] Conradi Smith GD (2020). Allostery in oligomeric receptor models. Mathematical Medicine and Biology 37(3):313–333. [doi:10.1093/imammb/dqz016](https://doi.org/10.1093/imammb/dqz016).

### Support

This programme and its computational resources have been supported by NSF DMS-1951646, Cycle representations of receptor complex signal transduction, Division of Mathematical Sciences, Mathematical Biology. Principal investigator: Greg Conradi Smith.
