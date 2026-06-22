# Codex Handoff

Date: 2026-06-22

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
