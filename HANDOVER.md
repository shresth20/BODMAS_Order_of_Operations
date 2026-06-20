# HANDOVER - MT06A01_L01_S04

## Project Overview

This is a self-contained Grade 6 mathematics learning game built with plain HTML, CSS, and JavaScript. There is no build step and no package manager. The browser entry point is `index.html`.

Use a local web server for normal development so JSON locale files load through XHR:

```powershell
python -m http.server 8000
```

Then open `http://localhost:8000/index.html`.

## Folder Structure

```text
index.html
game.config.json
README.md
HANDOVER.md
test-postmessage.html
docs/
  architecture.md
  content-authoring.md
  new-game-checklist.md
locales/
  core.json
  content.json
css/
  core/
    style.css
    animations.css
    responsive.css
    frames.css
  content/
    pages.css
    style.css
    responsive.css
js/
  core/
    utils.js
    state.js
    i18n.js
    animations.js
    audio.js
    frames.js
    content-renderer.js
    content-observer.js
    app.js
  content/
    pages.js
    validators.js
    animations.js
    voiceovers.js
  vendor/
    anime.min.js
assets/
  fonts/
  GIFs/
  icons/
  images/
  sounds/
  voiceovers/
```

The legacy root `locales.json` is intentionally kept as a fallback copy. The app now loads `locales/core.json` and `locales/content.json`.

## Load Order

`index.html` loads scripts as global browser scripts. Order matters:

```text
js/vendor/anime.min.js
js/core/utils.js
js/core/state.js
js/core/animations.js
js/core/audio.js
js/core/i18n.js
js/core/frames.js
js/core/app.js
window.CONTENT_MODE = true
js/content/pages.js
js/core/content-renderer.js
js/content/animations.js
js/content/validators.js
js/content/voiceovers.js
```

Do not convert these to modules unless the whole app is migrated carefully.

## Responsibilities

`js/core/app.js` initializes i18n, shell UI listeners, the loader, reset/fullscreen controls, language modal behavior, feedback clearing, and confetti.

`js/core/content-renderer.js` is the bridge between shell and content. It reads `CONTENT_PAGES`, switches frames, renders page-specific DOM, attaches interactions, and starts content animations.

`js/content/pages.js` owns the active page data and learning flow.

`js/content/animations.js`, `js/content/validators.js`, and `js/content/voiceovers.js` hold content-specific animation hooks, answer validation stubs, and narration mappings.

`css/core/` contains global shell styles, tokens, animation keyframes, shared responsive rules, and frame layouts.

`css/content/` contains `.cp-*` content-page component styles and responsive overrides.

## Locales

`I18n.load()` first reads `locales/core.json`, then `locales/content.json`, and merges content values over core values. If both fail, it falls back to the legacy `locales.json`.

Supported language codes are currently `en`, `hi`, `mr`, `te`, `gu`, and `od`.

## Development Notes

- Preserve global names such as `GameState`, `I18n`, `FrameManager`, `CONTENT_PAGES`, `ContentRenderer`, `ContentAnimations`, `ContentValidation`, and `Narration`.
- Keep asset paths root-relative from `index.html` in JavaScript (`assets/...`).
- Keep CSS font URLs relative to their stylesheet location. `css/core/style.css` uses `../../assets/...`.
- `test-postmessage.html` embeds `index.html` and listens for `GAME_COMPLETE`.
- The bottom-right dev navigation in `index.html` is temporary and depends on `CONTENT_PAGES` plus `ContentRenderer`.
