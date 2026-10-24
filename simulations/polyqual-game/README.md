# The PolyQual Game

A MATLAB-free qualitative-analysis game for comparing pairs of polynomial
curves. It runs as a static web app and can be published directly with GitHub
Pages.

The game includes optional sound feedback for answers. Use the Sound effects
toggle in the controls to turn the chimes on or off; the preference is saved in
the browser.

## GitHub Pages

Live app: [The PolyQual Game](https://gregconradismith.github.io/polyqual-game/)

Publish this folder as the root of a GitHub Pages repository, then open the
Pages URL on an iPhone in Safari and use Share -> Add to Home Screen.

If this folder is copied into a larger repository, serve it from the repository
root or from a Pages branch. The app uses relative paths so it also works from a
project URL such as:

```text
https://USERNAME.github.io/REPOSITORY/
```

## Local Preview

From this directory:

```sh
python3 -m http.server 8765
```

Then open:

```text
http://127.0.0.1:8765/
```

## Codex Coordination

Codex session state is tracked in `.codex/handoff.md`; durable decisions and task history may also appear in `.codex/` when useful.
