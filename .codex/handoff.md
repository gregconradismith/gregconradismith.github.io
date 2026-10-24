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

## 2026-10-19 Research summary footer removal

- At Greg's request, removed the entire Academic webpage / Bibliography footer paragraph and its two hyperlinks from all four one-page research summaries. Keep these footers absent in future exports.
- Updated all four DOCX sources and regenerated the four PDFs at the existing public URLs. Independent comparison verified that all other paragraphs and author metadata are identical, including the three-author SynGAP byline. Publication/reference links remain active.
- Verification: rendered and visually inspected all four final documents, confirmed exactly one page each and absence of the footer, and ran `git diff --check`.
- Published in commit `15ad111b561c7c97ba843db58a31078709df6421`. Pages run `39263634225` succeeded. All four public PDFs returned HTTP 200, lacked the footer, remained one page and matched the reviewed local files byte for byte.
- No remaining work or blockers.

## 2026-10-19 Plant research summary author credit

- At Greg's request, added Arielle Cooley, Emily Simmons and Ron Smith as authors of the Puzey summary. The top byline now reads Greg Conradi Smith, Joshua R. Puzey, Arielle Cooley, Emily Simmons and Ron Smith; document author metadata includes all five.
- Updated the editable DOCX and regenerated the PDF at the existing public URL. All body text and references are unchanged; the removed website/bibliography footer remains absent.
- Verification: rendered and visually inspected the final document; exactly one page with six reference hyperlinks. Independent comparison verified that only the byline and author metadata changed. `git diff --check` passed.
- Published in commit `2bfe6e6101c1b111a32faaea553338245785360b`; Pages run `39264486889` succeeded. The live PDF returned HTTP 200, contained all five authors, remained one page and matched the reviewed local file byte for byte (SHA-256 `a9bd062404d4261ba4b6539c443006646712011744701a6f4f16cba1bb7d7c73`).
- No remaining work or blockers.

## 2026-10-19 Research summary funding acknowledgments

- At Greg's request, added concise, linked funding acknowledgments to each of the four DOCX/PDF summaries. Verified support through primary publication acknowledgments, official NSF award API records and the public CV. Grant lists describe support for the summarized work, including past awards.
- SynGAP: NSF DMS-2619756 (Conradi Smith and Bestman) and DMS-1951646 (Conradi Smith). Official award 2619756 confirms September 2026-August 2029. Moved the existing award entry from the references to Funding and removed the obsolete body citation [3]; retained both scientific references.
- Receptors: NSF DMS-1951646 and DMS-1121606, the latter explicitly supporting the foundational 2017 cycle-basis paper.
- Breathing: NIH/NCCIH R01AT010816, NIH/NHLBI R01HL104127, NSF DMS-1951646; the opioid study acknowledges NIH/NINDS R21NS134005 and William & Mary's Office of Graduate Studies and Research. Attribution follows the 2020, 2024 and 2026 papers.
- Plant collaboration: selected NSF DEB-2031275, DEB-1754080, DEB-1754075, DEB-1655311, DMS-1951646 and DMS-1121606 plus microMORPH training support; NIH/NCCIH R01AT010816; Murdock life-sciences awards 2015270 and 2013265; William & Mary research awards and the Biomathematics Initiative. This credits support to the named collaborators without listing unrelated collaborators' grants.
- Kept all author lines and metadata, scientific text and removed website/bibliography footers. Slightly tightened paragraph/reference spacing in the plant summary to accommodate its funding list without reducing the body font.
- Verification: independent source/paragraph QA; rendered and visually inspected every final page; confirmed exactly one page each, active reference/funding links and `git diff --check`.
- Publication commit `f2ace2538c69b6f5268229378d1423f778cde51b`; Pages run `39267155180` succeeded. All four live PDFs returned HTTP 200, matched the reviewed local bytes and contained their verified funding lists. No remaining work or blockers.

## 2026-10-19 Breathing summary author order and laboratory link

- At Greg's request, the one-page breathing summary now lists Christopher A. Del Negro first and Greg Conradi Smith second beneath the title. Updated document author metadata to match.
- Added the verified Del Negro Laboratory link, https://people.wm.edu/~cadeln/, directly beneath the byline. Removed the sentence "Del Negro and I contributed equally to this study." from the 2024 study paragraph. Other scientific text, references and funding are unchanged; the previously removed footer remains absent.
- Updated the DOCX source and regenerated its PDF at the established public URL. Independent paragraph/link QA and rendered visual inspection passed; exactly one page with eight active links. `git diff --check` passed.
- Published in commit `3a6589754cd6a0e6611d7e765bd5d183dfc2315b`; Pages run `39268107453` succeeded. Live PDF returned HTTP 200, matched the reviewed local bytes (SHA-256 `60cd07bb3b173fdeaa93e63deff10606df56ddf5c3eb3ab11c9dfa548a97ceab`) and verified all requested changes. The laboratory URL also returned HTTP 200.
- No remaining work or blockers.

## 2026-10-19 Academic website URL under summary authors

- At Greg's request, added the clickable full URL https://gregconradismith.github.io/ immediately beneath the author list in all four one-page research summaries. Retained the Del Negro laboratory link and SynGAP project descriptor on subsequent lines.
- Updated all four DOCX sources and regenerated their PDFs at the established public URLs. All other paragraphs and author metadata match the prior versions; the previously removed website/bibliography footer remains absent. Reduced the plant summary title's following space from 15 to 7 points to keep its one-page layout without reducing fonts.
- Verification: rendered and visually inspected all four documents; confirmed one page each and active homepage links (9, 16, 6 and 5 total PDF links for breathing, plant, receptors and SynGAP). Independent paragraph/link QA and git diff --check passed. Existing author credits, funding, references and breathing sentence removal were retained.
- Publication commit 87ae5944d8f7c937986a38b4da5b16476e99a592; Pages run 39269183837 succeeded. All four live PDFs returned HTTP 200, matched the reviewed local files byte for byte, and placed the clickable homepage URL on the line directly after the authors. No remaining work or blockers.

## 2026-10-19 Plant summary contribution sentence removal

- At Greg's request, removed exactly the sentence "Puzey and I contributed equally to this study." from the plant research summary's mobile-DNA paragraph. Retained citation [6] immediately after the preceding sentence.
- Updated the DOCX source and regenerated the PDF at the existing public URL. Independent XML comparison verified that only the requested sentence and its leading space changed; author metadata, run formatting, all other paragraphs and hyperlink relationships are identical.
- Rendered and visually inspected the final document: clean one-page layout, with all authors, academic website URL, references and funding retained. All 16 PDF hyperlinks match the prior version. git diff --check passed.
- Publication commit 15dcb1bbd7a072be625c353644b8766132a79e82; Pages run 39269810914 succeeded. Live PDF returned HTTP 200, omitted the sentence and matched the reviewed local bytes (SHA-256 437c2a53022a8aa971629037a8677bc778e8a313792b6fd652f2a7aa90716ed3). No remaining work or blockers.

## 2026-10-19 Superscript citation format in all summaries

- At Greg's request, converted every inline numeric citation in the four research summaries from bracketed text to native Word superscript numbers immediately after punctuation. Combined citations use a superscript comma-separated group (1,2). Reference-list labels now use baseline numbers followed by a period; reference entries retain their normal font size.
- Updated all four DOCX sources and regenerated their PDFs at the established public URLs. Independent per-character/XML QA verified that prose, authors, paragraph/run formatting outside citations, metadata, funding and hyperlink relationships are unchanged. All prior requested removals and the header homepage links remain intact.
- Rendered and visually inspected all four final pages: each remains one page with clean raised citations and matching reference labels. PDF font/baseline checks confirmed true reduced-size superscripts; all 9, 16, 6 and 5 existing links (breathing, plant, receptors, SynGAP) are retained. git diff --check passed.
- Publication commit 99860bfb56279fada4dacde2fa4d2cffe5403cea; Pages run 39270483584 succeeded. All four public PDFs returned HTTP 200, matched the reviewed local files byte for byte and passed the superscript/reference/link checks. No remaining work or blockers.

## 2026-10-19 Richard Hammack affiliation in receptor summary

- At Greg's request, the receptor summary now reads "In collaboration with Richard Hammack (Virginia Commonwealth University), I developed..." in its equilibrium-allostery paragraph.
- Updated the DOCX source and regenerated the PDF at the existing public URL. Independent ZIP/XML QA confirmed that the affiliation insertion is the sole source change; metadata, formatting, native superscript citations, hyperlinks and funding are unchanged.
- Rendered and visually inspected the result; it remains one page, with all three superscript citations and six links retained. git diff --check passed.
- Publication commit 8486d5d7291ae0d1678a476ebb2dabe139ad301d; Pages run 39270959942 succeeded. The live PDF returned HTTP 200, contained the exact affiliation and matched the reviewed local file byte for byte (SHA-256 72978ce14f96504982f6f75ef389de54d0648b14e28b50059937fec18a5ba17b). No remaining work or blockers.

## 2026-10-19 SynGAP summary ongoing-work revisions and overview delinking

- At Greg's request, removed the subtitle "NSF project on the postsynaptic density" and changed the opening to "The computational biology laboratory is currently funded to study...". Removed the body sentences "The manuscript is under revision at Physical Biology." and "The award supports this work from September 2026 through August 2029.". Retained the superscript citation after the preceding scientific sentence.
- Kept authors, homepage URL, scientific text outside these edits, references and funding intact. The reference-entry revision status and funding dates remain; Greg targeted the two body sentences.
- Removed only the SynGAP one-page PDF link from the Research areas list in _pages/research.md because this is ongoing work. Keep both its DOCX and PDF in files/research-summaries/ with the other summaries. Preserve the SynGAP project-page link/description and the other three PDF links; do not restore the summary link without Greg's request.
- Verification: independent DOCX/XML and page comparison; rendered and visually inspected the final one-page PDF; preserved both native superscript runs and all five hyperlinks; git diff --check passed. Metadata and all other document/page content are unchanged.
- Publication commit 6107a11e6917dabff95b0a60b069c62f8ef0df64; Pages run 39271543993 succeeded. Live research HTML verified the requested link removal and retained project/other PDF links. Both retained public files returned HTTP 200 and matched local bytes; PDF SHA-256 955a52699229647a2b4602adee3b8fcd0faf95563f38e335c70860896389d384. No remaining work or blockers.

## 2026-10-19 Reference font size matched to body text

- At Greg's request, raised all reference text, including DOI/URL hyperlink runs, from 8.5 to 11 points in all four research summaries. References now match the 11-point body text; retain this size in future edits. Updated all four DOCX sources and regenerated the four PDFs.
- Kept every paragraph, reference, author, metadata field, citation superscript, funding paragraph and hyperlink destination unchanged. Independent package/XML QA verified all 14 reference paragraphs and 41 text runs, including all 14 reference hyperlinks, are explicitly 11 points.
- To retain one page without reducing body fonts or cutting text, changed breathing summary margins to 0.6 inch on all sides; changed plant summary margins to 0.5 inch and Normal line spacing from 1.02917 to single. All paragraph spacing is otherwise unchanged. Receptor and SynGAP required no layout changes.
- Verification: rendered and visually inspected all four final pages; confirmed exactly one Letter page each, PDF reference glyphs at 11 points throughout, native superscripts and every link destination retained, and git diff --check passed. Content bottoms are within their page margins.
- Publication commit da28f672053421e99a9124ed32bcf4f3b7c860d4; Pages run 39275886993 succeeded. All eight public DOCX/PDF files returned HTTP 200 and matched local bytes. Live research overview retains the three published-summary links; SynGAP remains delinked as requested. No remaining work or blockers.


## 2026-10-24 Academic simulation integration

- Consolidated six public standalone apps under `simulations/`, with native `/simulations/` index and main-navigation/Teaching links. Original repositories and old published URLs are preserved. See `.codex/simulation-integration.md` and `simulations/provenance.json` for inventory, source commits, license status, integration patches and verification.
- Fixed integrated PWA cache isolation; retained model behavior, references, assets and original source links. No private contents imported or excluded repositories changed.
- Pre-publication Jekyll build, numerical suites, asset/path audit, generated-runtime byte comparison, and six desktop/mobile Chrome checks passed; three caches coexist and offline PolyQual works. Local Ruby 4 build compatibility support is ignored and does not change published dependencies.
- Published integration commit `b339eaa5d14e75ceaa50dfd389490155791ed42d` to `main`; GitHub Pages run `40117186854` succeeded. `/simulations/` and Teaching entry verified in Chrome. All six published nested apps passed the same desktop/mobile/interaction checks with no JS errors or missing app resources; three PWA caches coexist and offline PolyQual reload passed. All 38 runtime/provenance assets returned HTTP 200 and matched reviewed local bytes. All six original standalone URLs still return HTTP 200. No remaining blockers.
