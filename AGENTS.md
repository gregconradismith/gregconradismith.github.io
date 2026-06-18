# Agent Instructions

This repository is the source for Greg Conradi Smith's public academic website:

https://gregconradismith.github.io/

It is based on Academic Pages / Minimal Mistakes, but this checkout should be
treated as Greg's live personal academic site rather than a generic template.
Do not reset customized content, metadata, navigation, styling, images, or
profile details back to upstream template defaults.

Keep edits public-facing, professional, and academically appropriate. Preserve
the site's voice as a faculty research profile: concise, accurate, and useful
for students, collaborators, and readers looking for publications, teaching,
research, CV material, talks, and contact information.

Use the existing Jekyll structure:

- `_config.yml` for site-wide identity, author profile, collections, plugins,
  and GitHub Pages settings
- `_data/` for navigation and shared data
- `_pages/` for main public pages
- `_publications/`, `_talks/`, `_teaching/`, `_portfolio/`, and `_posts/` for
  collection content
- `_includes/`, `_layouts/`, `_sass/`, and `assets/` for template, layout, and
  styling changes
- `images/`, `myphotos/`, and `files/` for public media and downloadable assets
- `markdown_generator/` and `scripts/` for publication, talk, WordPress, and CV
  helper workflows

Before changing generated publication, talk, or CV material, inspect the helper
scripts/notebooks and update source data when that is the established path.
Avoid hand-editing generated files if a local generator clearly owns them.

Do not add private drafts, unpublished sensitive research, student records,
credentials, API keys, private correspondence, or nonpublic documents. This repo
publishes a public website.

Avoid committing incidental local files such as `.DS_Store`, `_site/`,
`.jekyll-cache/`, `.sass-cache/`, `node_modules/`, or other local build output.

Useful lightweight checks:

```bash
git status --short --branch
git diff --check
bundle exec jekyll build
```

Run a local Jekyll build when the change affects layouts, includes, Sass,
configuration, navigation, or page rendering. For small text-only edits, a
careful Markdown/front matter inspection plus `git diff --check` is usually
enough.
