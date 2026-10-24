# Academic simulation integration — 2026-10-24

Public repository inventory: six standalone browser apps (Morris–Lecar, slow passage through Hopf, current–voltage relations, voltage clamp, PolyQual, retaliation). Course/lab/REU/sci-fri public tree checks revealed teaching links, MATLAB/downloadable content and catalogs rather than additional standalone browser simulations. SynGAP, exam repositories, and room-for-god-and-others were not inspected or changed.

Actual app contents live at `simulations/<original-repository-name>/`; the native Jekyll index is `_pages/simulations.md` at `/simulations/`, linked from main navigation and Teaching. Original repositories and URLs remain untouched. Source commits and license status are recorded in `simulations/provenance.json`. References, README files, MATLAB originals and numerical verification scripts are retained. None of the six source commits supplies a license file; do not apply the theme's MIT license to these apps.

Integration patches add app return/source links, a local Morris–Lecar cross-link, and service-worker isolation. PolyQual/Retaliation formerly deleted every other origin cache; all three integrated PWAs now have distinct `academic-<app>-v1` caches, restrict fetches to their own registration directory, and only delete their own superseded academic caches. No model/scoring changes.

Verification: JavaScript syntax checks; 600 current–voltage model/scoring cases; Morris–Lecar numerical and interaction suites; slow-passage numerical/noise and interaction suites; six real headless-Chrome desktop/mobile smoke checks (rendered canvas, controls, no JS errors, no missing app resources or mobile horizontal overflow); all three caches coexist, offline PolyQual reload passed. Local HTML asset/link audit and byte-for-byte generated runtime asset comparison passed.

Jekyll build succeeded before publication. Ruby 4 lacks libraries/methods needed by legacy Jekyll 3.9/Liquid 4.0.3, so ignored `local/build-check/Gemfile` adds csv/bigdecimal/ostruct and ignored compat.rb restores no-op taint methods. Build: `BUNDLE_GEMFILE=local/build-check/Gemfile BUNDLE_PATH="$PWD/vendor/bundle" RUBYOPT="-r$PWD/local/build-check/compat.rb" bundle exec jekyll build`. Published Gemfile/dependencies are unchanged. User explicitly requested build verification before publication for this integration.

No private repository contents imported. This isolated clone was fast-forwarded before editing; unrelated local checkouts were preserved. Publication and live verification status are appended to the main handoff.

Publication: integration commit `b339eaa5d14e75ceaa50dfd389490155791ed42d`; successful Pages run https://github.com/gregconradismith/gregconradismith.github.io/actions/runs/40117186854. All six published nested apps passed real Chrome desktop/mobile and control checks; all 38 runtime/provenance assets matched local bytes; all six old URLs returned 200. No remaining blockers.
