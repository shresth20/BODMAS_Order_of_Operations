# Architecture

How the BODMAS module (`MT06A01_L01_S07`) is put together. For run/handover
basics see [../HANDOVER.md](../HANDOVER.md); for adding content see
[content-authoring.md](content-authoring.md).

---

## 1. Big picture

Plain HTML + CSS + JS, no build step, no modules — every script is a classic
global browser script loaded in a fixed order from `index.html`. The app splits
into two halves:

- **Core / shell** (`js/core/`, `css/core/`) — device-agnostic engine: state,
  i18n, audio, frames, the rendering bridge, and persistent chrome (header,
  footer, modals, loader). Reusable across modules.
- **Content** (`js/content/`, `css/content/`, `locales/content.json`) — the
  data and behaviour specific to *this* lesson: page definitions, per-page
  animations, validators, and voiceovers.

The boundary is deliberate: the shell never hardcodes lesson content, and the
content layer never reimplements shell concerns.

---

## 2. Separation of concerns

| Concern             | Lives in                                              |
| ------------------- | ----------------------------------------------------- |
| Screen rendering    | `js/core/content-renderer.js` (`_render<Type>`)       |
| Interaction logic   | per-renderer handlers in `content-renderer.js`        |
| Validation          | `js/content/validators.js` (pure functions)           |
| Telemetry / host    | `postMessage` from `content-renderer.js` (see §8)     |
| Module data         | `js/content/pages.js` (`CONTENT_PAGES`)               |
| Strings / i18n      | `locales/core.json` + `locales/content.json`          |
| Audio               | `js/core/audio.js`                                    |
| Animation           | `js/core/animations.js`, `js/content/animations.js`   |
| Responsive layout   | `css/core/responsive.css`, `css/content/responsive.css` |

---

## 3. Module load order

Order matters — later scripts reference globals defined by earlier ones. Defined
at the bottom of `index.html`:

```text
vendor/pixi.min.js          PixiJS — canvas board for the division/long-op labs
vendor/anime.min.js         Anime.js — all tween animation
core/utils.js               qs/qsa, setClass, wait, … (pure helpers)
core/state.js               GameState singleton
core/animations.js          shell/content-asset anime helpers
core/audio.js               SFX + synthesized tones
core/i18n.js                I18n singleton
core/frames.js              FrameManager
core/app.js                 orchestrator (init, listeners, modals, confetti)
core/hand-nudge.js          HandNudge gesture hint
— window.CONTENT_MODE = true —
content/pages.js            CONTENT_PAGES data
content/speech_bubble.js    speech-bubble script hooks
core/content-renderer.js    ContentRenderer (reads CONTENT_PAGES)
content/animations.js       ContentAnimations
content/validators.js       ContentValidation
content/voiceovers.js       Narration
```

Global names that must be preserved: `GameState`, `I18n`, `FrameManager`,
`CONTENT_PAGES`, `ContentRenderer`, `ContentAnimations`, `ContentValidation`,
`Narration`, `HandNudge`.

Do not convert to ES modules unless the whole app is migrated together.

---

## 4. Boot & render pipeline

```text
DOMContentLoaded (app.js)
  └─ I18n.load(cb)                     fetch+merge core.json then content.json
       └─ applyStaticTranslations()    bind data-i18n* attributes in static DOM
          attachPersistentListeners()  header/footer/modal handlers
          transitionToScreen('loading')
             └─ ContentRenderer.renderPage(id)
                  ├─ _findPage(id)             look up entry in CONTENT_PAGES
                  ├─ _translatePageConfig()    resolve i18n KEYS in whitelisted fields
                  ├─ FrameManager.switchTo()   choose frame layout (1 or 2)
                  ├─ _render<Type>(page, area) build DOM into #content-area
                  ├─ wire interactions         taps / drag / inputs
                  ├─ ContentAnimations.run()   entrance animation (if page.animation)
                  └─ HandNudge / Narration     gesture hint + voiceover
```

`#content-area` is the only region rebuilt per page. Everything else (header,
footer, decorations, modals, loader) is persistent. `ContentRenderer` dispatches
on `page.type` through one big `switch`; each type has a dedicated
`_render<Type>` builder.

---

## 5. State

`GameState` (`state.js`) is a plain singleton holding `currentScreen`,
`currentQuestion`, `score`, `wrongCount`, `selectedAnswer`, `isSubmitted`,
`isAnimating`, plus `reset()` and `canSubmit()`. Per-page transient state (e.g.
which round a multi-round lab is on) is kept in closures inside the relevant
`_render<Type>` function or in module-level vars in `content-renderer.js`
(`_s9Round`, `_additionLabResult`, …), not in `GameState`.

---

## 6. i18n

- `I18n.load()` reads `locales/core.json`, then `locales/content.json`, and
  merges content **over** core. There is no legacy `locales.json` fallback.
- Language resolution: `?lang=` URL param → `localStorage('game_lang')` → `en`.
- Supported codes: `en`, `hi`, `mr`, `te`, `gu`, `od`.
- **`pages.js` stores i18n KEYS, not literal text.** `ContentRenderer`
  resolves them via `I18n.t()` at render time, but only for whitelisted field
  names (`_I18N_TEXT_FIELDS`). Everything else — math expressions, tokens,
  numeric results, ids — passes through untouched, so an expression like
  `"3 × 4 + 2"` is never treated as a translatable string.
- Static DOM uses `data-i18n` / `data-i18n-aria` / `data-i18n-alt` attributes,
  bound once at boot by `applyStaticTranslations()`.
- Do **not** edit `locales/core.json` without permission (see CLAUDE.md).

---

## 7. Audio

`audio.js` has two sources:

- **Preloaded files** (`_sounds`): `click`, `correct` (`correct-answer.ogg`),
  `wrong`, `confetti` (`confetti-sound.ogg`), `s1_chime`. Played with zero delay
  via `_playSound`.
- **Synthesized Web Audio tones** (`play*` functions): short procedural chimes
  for transitions/celebrations. The `AudioContext` is created lazily on first
  use (`initAudio`).

Conventions:

- Every correct answer plays `playCorrect()` → `correct-answer.ogg`.
- The confetti cheer (`playConfetti()` → `confetti-sound.ogg`) is fired from
  inside `launchConfetti()` (`app.js`), **after** the portrait early-return, so
  it sounds only when confetti is actually drawn. All ~38 confetti triggers go
  through that one function — do not call `playConfetti()` directly elsewhere.
- A global capture-phase click listener plays `button-click.ogg` on every
  `<button>` press.

---

## 8. Frames

`FrameManager.switchTo(1|2)` toggles a body class (`frame--1` / `frame--2`);
styles live in `css/core/frames.css`.

- **frame--1** — Explanation frame: transparent board, single column. Used for
  intros, rule reveals, summaries.
- **frame--2** — Question/Activity frame: standard white board.

There is no user-facing switcher; the frame is chosen per page by the renderer.

---

## 9. Host integration (postMessage)

On reaching the summary, the module posts to its parent window:

```js
window.parent.postMessage({ type: 'SESSION_COMPLETE' }, '*');
```

`test-postmessage.html` is an iframe harness for inspecting this. Note it still
listens for a legacy `GAME_COMPLETE` shape — reconcile the harness and the
emitter before relying on either.

---

## 10. Layout & stacking layers

The body is a flat set of layers; only `#content-area` is replaced per screen.
Global z-index tokens live in `:root` of `css/core/style.css`:

| Token          | Value | Region                              |
| -------------- | ----- | ----------------------------------- |
| `--z-bg`       | 1     | background                          |
| `--z-board`    | 20    | `#board-container` / `#board`       |
| `--z-deco`     | 30    | `#deco-layer` (global glyphs)       |
| *(literal 35)* | 35    | `#content-deco-layer`               |
| `--z-content`  | 40    | `#content-area`                     |
| `--z-chrome`   | 99    | `#header`, `#footer`                |
| `--z-feedback` | 100   | `#feedback-overlay`                 |
| `--z-confetti` | 9997  | confetti                            |
| `--z-popups`   | 9998  | modals                              |
| `--z-overlay`  | 9999  | loader                              |

`#board-container` forms its own stacking context, so `#content-area` (40) and
`#content-deco-layer` (35) compete inside it and can't escape above chrome or
modal tiers. In-content styles use a separate **local** stack (mostly 1–10, with
specific escalations to 30/52/200) that stays scoped within the board. Edit the
shell tokens to reorder regions; never push in-content z-index toward 99+.
