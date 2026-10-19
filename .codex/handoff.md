# Codex Handoff

Date: 2026-10-19

Repo: `gregconradismith.github.io`

Branch: `main`

<!-- codex-transfer-snapshot:start -->
## 2026-06-22 Computer Transfer Snapshot

- Checked on 2026-06-22 from `/Users/greg/Git` before moving computers.
- Ran `git fetch --all --prune`; `main` is tracking `origin/main` unless this status says otherwise.
- Origin: `git@github.com:gregconradismith/gregconradismith.github.io.git`
- Latest commit at refresh time: `41f4c6f 2026-06-21 15:45:23 -0400 Refresh Codex handoff for computer migration`
- On the next machine, read `AGENTS.md` first, then this handoff.
- The working tree was clean before this handoff refresh; after committing the refresh, `git status --short --branch` should again show only the branch line.

Status before this handoff edit:

```bash
## main...origin/main
```
<!-- codex-transfer-snapshot:end -->

Current Git status after the 2026-06-21 migration readiness fetch and before this handoff edit:

```bash
## main...origin/main
```

## Repository Role

This repository builds Greg Conradi Smith's public academic website at:

https://gregconradismith.github.io/

The site uses Academic Pages / Minimal Mistakes with Jekyll. It has been
customized for Greg's academic identity, research profile, teaching materials,
publications, talks, CV-related content, photos, and public links.

## High-Value Context

- `_config.yml` contains the primary site identity: title, description, author
  profile, academic links, collections, plugins, and GitHub Pages-compatible
  settings.
- Main website pages live in `_pages/`.
- Academic collections are configured for `_publications/`, `_talks/`,
  `_teaching/`, and `_portfolio/`.
- `markdown_generator/` contains publication and talk helper notebooks/scripts,
  but generated sample/template content should not be treated as public site
  content.
- `scripts/` includes historical helpers for CV JSON generation and WordPress
  import. Be careful before assuming those helpers are still part of the
  current publication path.
- `package.json` and `CONTRIBUTING.md` still contain upstream Academic Pages
  template language, so do not treat those files as proof that this checkout is
  meant to remain a generic template.
- There is no GitHub Actions workflow in `.github/workflows/` at this handoff.
  GitHub Pages behavior may be configured in repository settings rather than in
  a workflow file.

## Useful Commands

Check status:

```bash
git status --short --branch
```

Check whitespace in the scoped diff:

```bash
git diff --check
```

Check YAML syntax without invoking Jekyll:

```bash
ruby -e "require 'yaml'; YAML.load_file('_config.yml'); YAML.load_file('_data/navigation.yml'); puts 'YAML OK'"
```

Regenerate minified JavaScript after plugin or theme JavaScript changes:

```bash
npm run build:js
```

## Migration Readiness Snapshot

- Checked on 2026-06-21 before moving computers.
- Non-interactive `git fetch --all --prune` completed successfully.
- Root `README.md` points to `.codex/handoff.md` when a root README exists.

Pre-edit Git state after fetch:

```bash
## main...origin/main
```

## Notes For The Next Codex

- Read `AGENTS.md` before changing this repo.
- Do not invoke Jekyll locally unless Greg explicitly reverses this
  instruction. The site build is handled by GitHub Pages / repository settings.
- Keep the site public, professional, and academically accurate.
- Preserve Greg-specific content and customizations. Do not revert pages or
  metadata to upstream Academic Pages examples.
- Be careful with `_config.yml`: Jekyll config changes may require a fresh build
  to verify on GitHub because the config is not always reloaded by a running
  server.
- For publication, talk, and CV changes, look for the source data or generator
  before manually editing generated output.
- Avoid adding local build products or private/nonpublic materials.

## 2026-10-10 Teaching Course Link

- Updated the Cellular Biophysics and Modeling course link in `_pages/teaching.md` to `https://gregconradismith.github.io/cellular-biophysics-and-modeling/`.
- Updated the same link in `scripts/import_wordpress_content.js` to preserve it during regeneration.
- Verified the scoped diff and `git diff --check`; no local Jekyll build needed for this link-only edit.
- Greg authorized committing and pushing this update to `origin/main`. No remaining implementation work or blockers.

## 2026-10-15 Opioid publication citation

- Updated `_pages/publications.md`: Kalajian et al. is published in The Journal of Physiology 604(17):7351-7374 (2026), DOI 10.1113/JP291442. Replaced the under-review status, matched the published title including "in mice", and added the DOI link.
- This is a direct page-text correction; the Academic Pages generator writes collection entries and does not own this bibliography page.
- Verification: inspected the scoped Markdown diff and ran `git diff --check`; no local Jekyll build for this text-only edit.

## 2026-10-18 Approved research website publication

- Applied Greg's approved research review packet to the overview, breathing, receptors, plant diversity, and new SynGAP page. Retained all established research permalinks, earlier-project destinations, and breathing news link.
- Corrected Sakly preprint citation, Zheng author list/equal-contribution formatting, and Edger missing author in the main bibliography. Kalajian final citation was already current; Cooley status remains unchanged.
- Greg confirmed immediately before publication that SynGAP is still under revision at Physical Biology. The bioRxiv API lists the public preprint with no journal publication. The NSF award-data and receptor Jupyter Book links opened successfully.
- Isolated clean clone based on f32a904; preserved the concurrent CV update and all unrelated content. No simulation or CV workspace touched.
- Source checks: reviewed approved text, YAML front matter, permalinks, DOI links, and git diff --check. No local Jekyll build per existing handoff instruction. Publication validation uses GitHub Pages build and live-page checks.
- These are curated page sources. The historical WordPress importer contains older text and must not be rerun over these reviewed pages.
- Publication commit b4cd70a deployed successfully in Pages run 39082609534. All six updated pages and both earlier-project pages returned HTTP 200; browser inspection confirmed the reviewed text and rendered DOI links.
- Follow-up live link checks found the old breathing news URL returned 404. Replaced it with the verified official W&M News archive URL for the same article. DOI redirects resolve correctly; some publisher endpoints deny automated access (403), and bioRxiv rate limits (429); the bioRxiv API verified its record.

## 2026-10-17 Research area ordering

- At Greg’s request, reordered the overview research areas: SynGAP, receptors, neural mechanisms of breathing, mathematical biology of plant diversity. Text and destinations are unchanged.
- Verified the scoped diff and git diff --check; publish through GitHub Pages and confirm the live ordering.

## 2026-10-17 Project title refinement

- Greg chose “Pattern formation and genome evolution.” Updated the research overview label and corresponding project-page title, retaining /research/petal-patterns/ and the requested project order.
- Checked the scoped diff and whitespace; verify GitHub Pages deployment and both live labels.

## 2026-10-19 One-page research summaries

- Reviewed the four supplied research summaries against primary publications and the latest curated research pages. Fast-forwarded the clean checkout from 1559699 to d0354ce before editing, preserving Greg's latest research-area order and page content.
- Published four one-page PDFs in `files/research-summaries/`, with the corresponding revised DOCX files retained there as editable sources. Added one PDF link beside each matching area in `_pages/research.md`; preserved the existing project links and ordering.
- Important corrections: restored Grover CJ to the 2020 eNeuro citation and supplied its article number; qualified the 2024 calcium-uptake result as partial inhibition, and calcium-release inhibition as slowing or stopping sighs; specified neonatal mouse slices for the 2026 result. Also clarified homeolog terminology and qualified the Turing model's mechanistic interpretation. Receptor and SynGAP scientific text did not require substantive correction.
- Applied the corresponding citation and calcium wording corrections to `_pages/eupnea-sigh.md` and the missing-author correction to `_pages/publications.md`. Retained the previously user-confirmed Physical Biology revision status. Historical WordPress import sources remain untouched, per the curated-page ownership decision above.
- Verification: rendered and visually inspected all four final DOCX/PDF pairs; confirmed exactly one page each and working PDF reference links; checked document metadata and absence of tracked changes/comments; ran `git diff --check`. No local Jekyll build for these text/link additions, per the existing handoff instruction.
- Publication commit: `515298a7a6508a2b763550f7412176653a69954b`. GitHub Pages run `39261982185` completed successfully. All four public PDFs returned HTTP 200 and matched the local SHA-256 values byte for byte. Live HTML and browser inspection confirmed all four topic-matched links and both public text corrections.
- No remaining work or blockers. Future revisions should edit the DOCX sources and regenerate/inspect the PDFs before publication.

## 2026-10-19 SynGAP summary author credit

- At Greg's request, the summary now names Greg Conradi Smith, Jen Bestman and Sarah Sakly together beneath the title. Moved the NSF project descriptor to the next line and updated document author metadata to include all three.
- Updated the editable DOCX and regenerated the PDF in `files/research-summaries/`, retaining the existing research-page link. All body text and references are unchanged.
- Verification: rendered and visually inspected the result; still exactly one page, with five reference/footer hyperlinks retained. Independent paragraph comparison confirmed that only the byline/subtitle changed. `git diff --check` passed.
- Published in commit `59592622235463700c35731c1ae70700c5ecb376`; Pages run `39263108830` succeeded. The live PDF returned HTTP 200, contained all three authors and matched the reviewed local PDF byte for byte (SHA-256 `1e708cc3f0b4d3ecf7c5b97a28b56f3155957ad0e7e8ec1c520a8157a7396715`).
- No remaining work or blockers.
