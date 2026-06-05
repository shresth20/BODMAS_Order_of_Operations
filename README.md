# MT06A01_L01_S04

Self-contained Grade 6 mathematics learning game built with plain HTML, CSS, and JavaScript.

## Run

Serve the folder from a local web server so locale JSON files load correctly:

```powershell
python -m http.server 8000
```

Then open `http://localhost:8000/index.html`.

`test-postmessage.html` is a small iframe harness for checking `GAME_COMPLETE` postMessage integration.

## Structure

- `index.html` is the browser entry point.
- `css/core/` contains shell styles, shared animation keyframes, responsive shell rules, and frame rules.
- `css/content/` contains content-page styles and content responsive rules.
- `js/core/` contains shared helpers, state, i18n, audio, frames, rendering bridge, and app orchestration.
- `js/content/` contains page data, content animations, validators, and voiceovers.
- `locales/core.json` contains shared locale data. `locales/content.json` is the content overlay.
