# Codex Handoff

Date: 2026-06-20

Repo: `gregconradismith.github.io`

Branch: `main`

Current Git status at handoff creation:

```bash
## main...origin/main
```

Recent local/remote branch notes:

- `main` is the canonical branch to continue from. It is clean and synced with
  `origin/main` at `b4bed85` (`Keep footer below sidebar`).
- `codex_edits` still exists locally/remotely at `f88b236`, but it is stale
  relative to `main`; checking it out directly would omit newer handoff/docs
  and sidebar/footer fixes.
- There are no workflow files in `.github/workflows/` at this handoff.

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
