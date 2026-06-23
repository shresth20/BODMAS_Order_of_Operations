# HANDOVER — MT06A01_L01_S07

Technical handover for the BODMAS interactive learning module (Grade 6 maths,
topic: *"BODMAS rule to do complex arithmetic operations"*).

---

## 1. Stack & Run

- Plain **HTML + CSS + JavaScript**. No build step, no bundler, no package
  manager. Scripts load as classic global browser scripts (not ES modules).
- Vendored libraries only (no CDN): `js/vendor/anime.min.js` (animations) and
  `js/vendor/pixi.min.js` (canvas board for the division/long-operation labs).
- Entry point: `index.html`.

Serve over HTTP so the locale JSON loads via XHR (opening the file directly
will fail CORS):

```powershell
python -m http.server 8000
```

Then open `http://localhost:8000/index.html`.

`test-postmessage.html` embeds `index.html` in an iframe to inspect the
session-complete postMessage (see §7).

---

## 2. Folder Structure

```text
index.html              Entry point: DOM skeleton, layer order, script load order
game.config.json        Config placeholder (currently {})
README.md               Short, non-technical project overview
HANDOVER.md             This file
test-postmessage.html   Iframe harness for the completion postMessage

docs/
  architecture.md         System design: layers, load order, render pipeline, i18n, audio, z-index
  content-authoring.md    How to add/edit pages: CONTENT_PAGES schema, per-level pattern, i18n
  new-game-checklist.md   Checklist for spinning up a new module from this one

locales/
  core.json             Shared shell strings (buttons, modals, aria labels) — do NOT edit without permission
  content.json          Content/page strings; merged OVER core at load

css/
  core/                 Game-shell styling (device-agnostic)
    style.css           Fonts, :root design tokens + z-index scale, shell layout, layers, modals
    animations.css      Keyframes (correct pulse, confetti) + JS-applied animation classes
    responsive.css      Fluid breakpoints tuned for ~15 tablet targets
    frames.css          frame--1 / frame--2 board layout variants
  content/              Per-page (.cp-*) styling
    pages.css           Page component styles derived from the storyboard
    style.css           Shared content primitives + Level 1–6 specific styles
    responsive.css      Content-page responsive overrides

js/
  core/                 Shell engine (reusable across modules)
    utils.js            Pure DOM/helper functions, no global state
    state.js            GameState singleton (screen, question, score, flags)
    animations.js       Core anime.js helpers for shell/content assets
    audio.js            Preloaded SFX + lazy Web Audio synthesized tones
    i18n.js             I18n singleton: load/merge locales, t(), language switching
    frames.js           FrameManager.switchTo(1|2) — programmatic frame swap
    app.js              Orchestrator: init, listeners, screen transitions, modals, confetti
    hand-nudge.js       HandNudge gesture hint (tap/drag) shown on load
    content-renderer.js Bridge: reads CONTENT_PAGES, builds page DOM, wires interactions
  content/              This module's data + behaviour
    pages.js            CONTENT_PAGES data + learning flow (Sections 01–06)
    speech_bubble.js    Per-page speech-bubble script hooks
    animations.js       ContentAnimations.run(name) — page-specific anime.js
    validators.js       ContentValidation.validate(pageId, input) — pure validators
    voiceovers.js       Narration — file-based per-line audio playback
  vendor/
    anime.min.js
    pixi.min.js

assets/                 fonts/ GIFs/ icons/ images/ sounds/ voiceovers/
```

> Note vs. older handover: `content-observer.js` and the legacy root
> `locales.json` no longer exist. `hand-nudge.js`, `speech_bubble.js`, and
> `pixi.min.js` were added.

---

## 3. Script Load Order

Order is significant — globals must exist before later scripts reference them.
Defined in `index.html`:

```text
js/vendor/pixi.min.js          (PixiJS — canvas labs)
js/vendor/anime.min.js         (Anime.js)
js/core/utils.js
js/core/state.js
js/core/animations.js
js/core/audio.js
js/core/i18n.js
js/core/frames.js
js/core/app.js
js/core/hand-nudge.js
window.CONTENT_MODE = true     (inline flag)
js/content/pages.js
js/content/speech_bubble.js
js/core/content-renderer.js
js/content/animations.js
js/content/validators.js
js/content/voiceovers.js
```

Do not convert to ES modules unless the whole app is migrated together.

Preserve these global names: `GameState`, `I18n`, `FrameManager`,
`CONTENT_PAGES`, `ContentRenderer`, `ContentAnimations`, `ContentValidation`,
`Narration`, `HandNudge`.

---

## 4. HTML Structure & Stacking Layers

`index.html` is a flat DOM with explicitly labelled layers. The body holds a
small set of top-level regions; only `#content-area` is replaced per screen.

```text
<body>
 ├─ <header id="header">              LAYER 5 — chrome (progress dots, reset/info/lang/fullscreen)
 ├─ <div id="board-container">        LAYER 2 — board wrapper (own stacking context)
 │   ├─ <main id="board">
 │   │   └─ <section id="content-area">   LAYER 4 — active screen DOM (rebuilt per page)
 │   └─ <div id="content-deco-layer">     LAYER 3.5 — per-page decorative images
 ├─ <div id="feedback-overlay">       LAYER 6 — fixed toast + character GIF
 ├─ <div id="deco-layer">             LAYER 3 — global static decorations (math glyphs)
 ├─ <footer id="footer">              LAYER 5 — chrome (Submit button)
 ├─ <div id="loader-overlay">         loader GIF
 ├─ <div id="htp-modal">              "How to Play" dialog
 ├─ <div id="lang-modal">             language picker dialog
 └─ <div id="dev-skip">               TEMP dev nav — remove before production
```

### Key structural points

- **`#board-container` creates a stacking context** (positioned + `z-index`).
  Therefore `#content-area` (z 40) and `#content-deco-layer` (z 35) compete
  *inside* that context — content always paints above the page decorations, and
  neither can escape above the global chrome/feedback layers regardless of how
  large their internal z-index values get.
- `#content-area` is the only region cleared and rebuilt by
  `ContentRenderer.renderPage()`. Everything else (header, footer, decorations,
  modals) is persistent.
- Frames are body classes (`frame--1` / `frame--2`) toggled by `FrameManager`;
  `frame--1` makes the board transparent for explanation slides, `frame--2` is
  the standard activity board.
- In content mode the body carries `content-page-active`, which hides the
  footer and lets the board extend to the bottom (`css/content/pages.css`).

### Z-index scale

Global tokens live in `:root` (`css/core/style.css`) and are the source of
truth for the shell. Use these tokens — do not hardcode competing values at
the shell level.

| Token          | Value | Used by                                            |
| -------------- | ----- | -------------------------------------------------- |
| `--z-bg`       | 1     | background fills                                   |
| `--z-board`    | 20    | `#board-container` / `#board`                      |
| `--z-deco`     | 30    | `#deco-layer` (global static glyphs)               |
| *(literal)*    | 35    | `#content-deco-layer` (inside board context)       |
| `--z-content`  | 40    | `#content-area` (active screen)                    |
| `--z-chrome`   | 99    | `#header`, `#footer`                               |
| `--z-feedback` | 100   | `#feedback-overlay`                                |
| `--z-confetti` | 9997  | confetti canvas                                    |
| `--z-popups`   | 9998  | modals (how-to-play, language)                     |
| `--z-overlay`  | 9999  | loader overlay                                     |

#### Layering rules

- Shell ordering is fixed by the tokens above; raise/lower a region by editing
  its token, not by spot-patching.
- `--z-overlay` (loader) sits above `--z-popups` (modals) so the loader always
  covers everything during transitions.
- The temporary dev-skip nav and JS-created drag ghosts use `z-index: 9990`
  (just below the popup tier) so they float over content but never over modals.

### In-content z-index (local only)

Inside `#content-area`, page styles in `css/content/style.css` and
`css/content/pages.css` use their own local stack — most elements 1–10, with
specific escalations such as an expanded comparison card / its student avatar
raised to **52**, drag tokens to **30**, and tooltips up to **200**. These are
scoped within the board's stacking context and intentionally cannot overlap the
chrome, feedback, or modal layers. Keep new in-content values inside this local
range; never push content z-index toward the shell tiers (99+).

---

## 5. Rendering Flow

```text
DOMContentLoaded
  └─ I18n.load(cb)                      load + merge locales/core.json + content.json
       └─ applyStaticTranslations()     bind data-i18n* attributes
          attachPersistentListeners()   header/footer/modal handlers
          transitionToScreen('loading')
             └─ ContentRenderer.renderPage(id)
                  ├─ _translatePageConfig()   resolve i18n KEYS in whitelisted text fields
                  ├─ FrameManager.switchTo()  pick frame layout
                  ├─ _render<Type>()          build page DOM into #content-area
                  ├─ attach interactions      taps / drag / inputs
                  ├─ ContentAnimations.run()  page entrance animation
                  └─ HandNudge / Narration    gesture hint + voiceover
```

`ContentRenderer.getCurrentPageId()` returns the active page id.

---

## 6. Locales / i18n

- `I18n.load()` reads `locales/core.json`, then `locales/content.json`, and
  merges content values **over** core values. There is no longer a legacy
  `locales.json` fallback.
- Supported language codes: `en`, `hi`, `mr`, `te`, `gu`, `od`.
- Language is resolved from the `?lang=` URL param, then `localStorage`
  (`game_lang`), then default `en`.
- **`pages.js` stores i18n KEYS, not literal text**, in whitelisted text
  fields. `ContentRenderer` resolves them with `I18n.t()` at render time. A
  field is translated only if its name is whitelisted, so math expressions,
  tokens, and numeric data (also strings) are never translated.
- Do not edit `locales/core.json` without permission (see CLAUDE.md).

---

## 7. Host Integration (postMessage)

On reaching the summary, the module posts to its parent window:

```js
window.parent.postMessage({ type: 'SESSION_COMPLETE' }, '*');  // content-renderer.js
```

> ⚠️ Known mismatch: `test-postmessage.html` still listens for the legacy
> `GAME_COMPLETE` message (with `correct/total/wrong/accuracy/stars` fields).
> The live app currently emits only `SESSION_COMPLETE` with no payload. Align
> the harness, the emitter, or the host contract before depending on either.

---

## 8. Development Notes

- Keep JS asset paths root-relative from `index.html` (`assets/...`).
- Keep CSS font/asset URLs relative to the stylesheet location
  (`css/core/style.css` uses `../../assets/...`).
- Validators (`js/content/validators.js`) must stay pure: no DOM access, no
  `eval`, normalize input, handle empty/whitespace/equivalent forms, and return
  reason codes. Add tests per the validator checklist in CLAUDE.md.
- Audio: SFX files are preloaded in `audio.js`; synthesized tones lazily create
  the `AudioContext` on first use. Narration creates a fresh `Audio` per play.
- The bottom-right **dev-skip nav** in `index.html` is temporary (steps through
  `CONTENT_PAGES` via `ContentRenderer`). It is a self-contained block — delete
  it (style + markup + script) before production.
- `docs/architecture.md`, `docs/content-authoring.md`, and
  `docs/new-game-checklist.md` document the design, authoring workflow, and
  new-module setup respectively.
- `game.config.json` is currently an empty object `{}`.
