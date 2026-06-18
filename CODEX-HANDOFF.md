# Codex Handoff

Date: 2026-06-18

Repo: `gregconradismith.github.io`

Branch: `main`

Current Git status at handoff creation:

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
- `markdown_generator/` contains publication and talk helper notebooks/scripts.
- `scripts/` includes helpers for CV JSON generation and WordPress import.
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

Build the Jekyll site locally when rendering behavior may have changed:

```bash
bundle exec jekyll build
```

Regenerate minified JavaScript after plugin or theme JavaScript changes:

```bash
npm run build:js
```

## Notes For The Next Codex

- Read `AGENTS.md` before changing this repo.
- Keep the site public, professional, and academically accurate.
- Preserve Greg-specific content and customizations. Do not revert pages or
  metadata to upstream Academic Pages examples.
- Be careful with `_config.yml`: Jekyll config changes may require a fresh build
  to verify because the config is not always reloaded by a running server.
- For publication, talk, and CV changes, look for the source data or generator
  before manually editing generated output.
- Avoid adding local build products or private/nonpublic materials.
