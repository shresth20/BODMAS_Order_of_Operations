# Header Icon Buttons — Implementation Guide

How to reproduce the **four top-right header icons** exactly as built in this game:

1. **Reset** — resets the current screen/section exercise back to its clean state.
2. **Info (i)** — opens a "How to Play" popup explaining the game.
3. **Language** — opens a popup to switch the game language.
4. **Fullscreen** — toggles the whole game in/out of fullscreen (icon + tooltip swap on toggle).

This document is a drop-in recipe. Follow it in order and the icons will look, sit, and behave identically to this project without touching any other game logic.

> All four icons live in a single persistent `<header>` that stays fixed on top of every screen. They are wired **once** at startup and never re-rendered per screen.

---

## 0. Prerequisites — what must already exist

The icons depend on three shared pieces. If your target project has equivalents, reuse them; otherwise port the minimal version described here.

| Dependency | Used by | Minimal contract |
|---|---|---|
| `I18n` singleton | all 4 (tooltips), Language, Info | `I18n.t(key)`, `I18n.getLang()`, `I18n.setLang(code)`, `I18n.getSupportedLanguages()` |
| `ContentRenderer` | Reset, Language (re-render) | `ContentRenderer.getCurrentPageId()`, `ContentRenderer.renderPage(id)` |
| `qs()` helper | all wiring | `qs(sel)` = `document.querySelector(sel)`; `qsa(sel, root)` = `Array.from(root.querySelectorAll(sel))` |

If you don't use i18n, replace every `I18n.t('key')` with a literal string and skip the Language button entirely.

---

## 1. Assets

Copy these SVGs into `assets/icons/` (keep the exact filenames — the JS references them by string):

```
assets/icons/Reset_icon.svg
assets/icons/Info_icon.svg
assets/icons/Language_icon.svg
assets/icons/Fullscreen_icon.svg
assets/icons/Exit_Fullscreen_icon.svg   ← shown while IN fullscreen
assets/icons/close_popup.svg            ← close (×) button inside both popups
```

All are local SVGs — **no external CDN**, works offline.

---

## 2. HTML — the header markup

Place this as the **first element inside `<body>`** so it renders above all screens. The header has two zones: `header__left` (progress bar — keep or drop per your project) and `header__right` (the four icons, in this exact order).

```html
<!-- Header (persistent across every screen) -->
<header id="header" class="header" role="banner">
  <!-- LEFT: progress bar (optional — remove if your project has none) -->
  <div class="header__left">
    <!-- ...your progress UI... -->
  </div>

  <!-- RIGHT: Reset + Info + Language + Fullscreen (order matters) -->
  <div class="header__right">
    <button class="icon-btn" id="btn-reset" aria-label="Reset" title="Reset">
      <img src="assets/icons/Reset_icon.svg" alt="" draggable="false" />
    </button>

    <button class="icon-btn" id="btn-info" aria-label="Info" title="How To Play">
      <img src="assets/icons/Info_icon.svg" alt="" draggable="false" />
    </button>

    <button class="icon-btn" id="btn-globe" aria-label="Change language" title="Select Language">
      <img src="assets/icons/Language_icon.svg" alt="" draggable="false" />
    </button>

    <button class="icon-btn" id="btn-fullscreen" aria-label="Toggle fullscreen" title="Enter Fullscreen">
      <img src="assets/icons/Fullscreen_icon.svg" alt="" draggable="false" />
    </button>
  </div>
</header>
```

Notes that matter for exact parity:
- The button IDs (`btn-reset`, `btn-info`, `btn-globe`, `btn-fullscreen`) are the contract the JS binds to — **do not rename them**.
- Each icon is an `<img>` with empty `alt=""` (decorative) and `draggable="false"` so it can't be dragged out on touch/mouse. The accessible name comes from the button's `aria-label`.
- `title` gives the hover tooltip; `aria-label` gives the screen-reader name. Both are overwritten at runtime by i18n (Section 6) — the hard-coded values are just the English fallback.

You also need the **two popups** (How-to-Play and Language). Add these once, anywhere in `<body>` after the header:

```html
<!-- ═══ How to Play popup ═══ -->
<div id="htp-modal" class="modal-overlay" aria-hidden="true"
     role="dialog" aria-modal="true" aria-labelledby="htp-title">
  <div class="modal-card" id="htp-card">
    <button class="modal-close" id="modal-close" aria-label="Close How to Play">
      <img src="assets/icons/close_popup.svg" alt="" draggable="false" />
    </button>
    <h2 class="modal-title" id="htp-title">How to Play</h2>
    <p class="modal-subtitle" id="htp-subtitle"></p>
    <ol class="modal-steps" id="htp-steps"></ol>
  </div>
</div>

<!-- ═══ Language popup ═══ -->
<div id="lang-modal" class="modal-overlay" aria-hidden="true"
     role="dialog" aria-modal="true" aria-labelledby="lang-title">
  <div class="modal-card" id="lang-card">
    <!-- Select view -->
    <div id="lang-select-view">
      <button class="modal-close" id="lang-close" aria-label="Close language selector">
        <img src="assets/icons/close_popup.svg" alt="" draggable="false" />
      </button>
      <h2 class="modal-title" id="lang-title">Choose Your Language</h2>
      <p class="modal-subtitle" id="lang-subtitle">Select the language you want to use in the game.</p>

      <div class="lang-dropdown" id="lang-dropdown">
        <button class="lang-trigger" id="lang-trigger" aria-expanded="false" aria-haspopup="listbox">
          <span id="lang-current-text">English</span>
          <svg class="lang-chevron" width="12" height="8" viewBox="0 0 12 8" fill="none" aria-hidden="true">
            <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
        <ul class="lang-list" id="lang-list" role="listbox" aria-label="Language options" hidden></ul>
      </div>

      <div class="lang-actions">
        <button class="btn-lang-cancel" id="btn-lang-cancel">Cancel</button>
        <button class="btn-lang-apply"  id="btn-lang-apply">Apply</button>
      </div>
    </div>

    <!-- Confirm view (shown briefly after Apply, then auto-closes) -->
    <div id="lang-confirm-view" hidden>
      <h2 class="modal-title" id="lang-confirm-title">Language Selected!</h2>
      <p class="modal-subtitle-confirm" id="lang-confirm-msg"></p>
    </div>
  </div>
</div>
```

---

## 3. CSS — layout, position, and states

### 3.1 Required CSS variables (define once on `:root`)

```css
:root {
  --header-h: clamp(64px, 8vh, 88px);      /* header height */
  --size-icon-md: clamp(40px, 5vw, 60px);  /* icon button size */
  --z-chrome: 99;                          /* header sits above board */
  --gl-sky: #3BC6FF;                        /* hover fill */
  --gl-yellow: #FFDF50;                     /* active/press fill */
}
```

### 3.2 Header positioning (fixed, full-width, icons pinned right)

```css
.header {
  position: fixed;
  top: 0; left: 0; right: 0;
  height: var(--header-h);
  z-index: var(--z-chrome);
  display: flex;
  align-items: center;
  justify-content: space-between;   /* progress left, icons right */
  padding: 0 clamp(12px, 3vw, 32px);
}

.header__left  { display: flex; align-items: center; flex: 1; }
.header__right { display: flex; align-items: center; gap: clamp(4px, 0.6vw, 10px); }
```

> `justify-content: space-between` + `flex:1` on the left zone is what pushes the four icons to the **top-right corner**. If you have no left content, keep an empty `<div class="header__left">` so the icons stay right-aligned.

### 3.3 The icon buttons (shape, hover, press)

```css
.icon-btn {
  width: var(--size-icon-md); height: var(--size-icon-md);
  min-width: 44px; min-height: 44px;          /* accessible tap target */
  border: none; outline: none;
  background: transparent;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background-color .15s, transform .15s, box-shadow .15s;
  flex-shrink: 0;
  padding: 0;
  border-radius: 50%;                          /* circular */
}
.icon-btn img { width: 100%; height: 100%; object-fit: contain; display: block; }
.icon-btn:hover  { background-color: var(--gl-sky); }
.icon-btn:active { background-color: var(--gl-yellow); transform: scale(0.93); }
```

Optional glow this project adds on hover (in `animations.css`):
```css
.icon-btn:hover { filter: drop-shadow(0 0 12px rgba(59, 198, 255, 0.75)); }
```

### 3.4 Responsive (shrink icons on small / short screens)

The header height and icon size ride on the CSS variables, so you shrink them by overriding the variables per breakpoint. Key rules used in this project:

```css
/* Portrait phones */
@media (max-width: 600px) and (orientation: portrait) {
  :root { --header-h: clamp(52px, 7vh, 64px); }
  .icon-btn { min-width: 36px; min-height: 36px; }
}

/* Short landscape (low-end Android / split view) */
@media (max-width: 900px) and (orientation: landscape) {
  :root { --header-h: 44px; }
  .header { padding: 0 clamp(8px, 2vw, 16px); }
  .header__right { gap: clamp(4px, 1vw, 8px); }
  .icon-btn { min-width: 32px; min-height: 32px; }
}
```

### 3.5 Popup CSS (How-to-Play + Language share `.modal-overlay` / `.modal-card`)

Copy the `.modal-overlay`, `.modal-card`, `.modal-close`, `.modal-title`, `.modal-subtitle`, `.modal-steps`/`.modal-step`, and the `.lang-*` / `.btn-lang-*` blocks from [css/core/style.css](css/core/style.css) (lines ~685–897). The essentials:

```css
.modal-overlay {
  position: fixed; inset: 0;
  z-index: var(--z-popups);            /* above header */
  background: var(--color-overlay);
  backdrop-filter: blur(7px);
  display: flex; align-items: center; justify-content: center;
  padding: clamp(16px, 4vw, 40px);
  opacity: 0; visibility: hidden;
  transition: opacity 220ms ease, visibility 220ms ease;
}
.modal-overlay.modal--open { opacity: 1; visibility: visible; }   /* open state toggled by JS */

.modal-card {
  background: #fff; border-radius: 24px;
  padding: clamp(20px, 3.5vw, 30px);
  max-width: 560px; width: 100%;
  transform: scale(0.94) translateY(10px);
  transition: transform 320ms cubic-bezier(0.34, 1.56, 0.64, 1);
}
.modal-overlay.modal--open .modal-card { transform: scale(1) translateY(0); }
```

The `.modal--open` class is the single switch: the JS adds/removes it to show/hide either popup with the same animation.

---

## 4. JavaScript — wiring the behavior

Wire all four buttons **once** at startup. Do it after the DOM is ready and after `I18n.load(...)` resolves, so tooltips get localized immediately.

```js
document.addEventListener('DOMContentLoaded', function () {
  I18n.load(function (lang) {
    document.documentElement.lang = lang;
    applyStaticTranslations();     // sets localized tooltips — Section 6
    attachHeaderListeners();       // binds the 4 icons — below
    // ...start your first screen...
  });
});

function attachHeaderListeners() {
  var btnReset      = qs('#btn-reset');
  var btnInfo       = qs('#btn-info');
  var btnGlobe      = qs('#btn-globe');
  var btnFullscreen = qs('#btn-fullscreen');

  var modalClose  = qs('#modal-close');   // How-to-Play close (×)
  var htpOverlay  = qs('#htp-modal');
  var langClose   = qs('#lang-close');    // Language close (×)
  var langOverlay = qs('#lang-modal');

  if (btnReset)      btnReset.addEventListener('click', handleReset);
  if (btnInfo)       btnInfo.addEventListener('click', openHowToPlay);
  if (btnGlobe)      btnGlobe.addEventListener('click', openLangModal);
  if (btnFullscreen) btnFullscreen.addEventListener('click', handleFullscreen);

  // Popups close via the × button OR by clicking the dimmed backdrop
  if (modalClose)  modalClose.addEventListener('click', closeHowToPlay);
  if (htpOverlay)  htpOverlay.addEventListener('click', function (e) {
    if (e.target === htpOverlay) closeHowToPlay();
  });
  if (langClose)   langClose.addEventListener('click', closeLangModal);
  if (langOverlay) langOverlay.addEventListener('click', function (e) {
    if (e.target === langOverlay) closeLangModal();
  });

  // Fullscreen icon + tooltip must react to real fullscreen changes
  // (covers Esc key, F11, OS gestures — not just our button)
  document.addEventListener('fullscreenchange', syncFullscreenButton);
}
```

### 4.1 ① Reset — restore the current screen/section

Reset simply **re-renders the current page** from its clean definition; it does not navigate. Because the renderer rebuilds the page from data, any in-progress input/selection is discarded and the exercise returns to its initial state.

```js
function handleReset() {
  if (window.CONTENT_MODE && typeof ContentRenderer !== 'undefined') {
    var pageId = ContentRenderer.getCurrentPageId();
    if (pageId) ContentRenderer.renderPage(pageId);   // deterministic clean re-render
  }
}
```

> If your project doesn't use `ContentRenderer`, point Reset at whatever your "re-render current screen from scratch" function is. Keep it **deterministic** — same page in, clean page out. Do not just clear inputs by hand; rebuild the screen.

### 4.2 ② Info — "How to Play" popup

Opening builds the step list from a small config object (`GAME_HTP`) whose values are i18n keys, then reveals the popup. Closing removes the class and returns focus to the Info button.

```js
// Config: subtitle + ordered steps, all i18n keys (edit copy in your locale file)
var GAME_HTP = {
  subtitle: 'htpSubtitle',
  steps: ['htpStep1', 'htpStep2', 'htpStep3', 'htpStep4', 'htpStep5', 'htpStep6']
};

function openHowToPlay() {
  var modal = qs('#htp-modal');
  if (!modal) return;

  // Build subtitle + numbered steps from config
  var subtitleEl = qs('#htp-subtitle');
  var stepsEl    = qs('#htp-steps');
  if (subtitleEl && GAME_HTP.subtitle) subtitleEl.textContent = I18n.t(GAME_HTP.subtitle);
  if (stepsEl && Array.isArray(GAME_HTP.steps)) {
    stepsEl.innerHTML = '';
    GAME_HTP.steps.forEach(function (stepKey, i) {
      var li  = document.createElement('li');
      li.className = 'modal-step';
      var num = document.createElement('span');
      num.className = 'modal-step__num';
      num.setAttribute('aria-hidden', 'true');
      num.textContent = i + 1;
      var text = document.createElement('span');
      text.className = 'modal-step__text';
      text.innerHTML = I18n.t(stepKey);   // step copy may contain simple markup
      li.appendChild(num); li.appendChild(text);
      stepsEl.appendChild(li);
    });
  }

  modal.classList.add('modal--open');
  modal.setAttribute('aria-hidden', 'false');
  document.addEventListener('keydown', handleHtpKeydown);   // Esc to close
  var closeBtn = qs('#modal-close');
  if (closeBtn) setTimeout(function () { closeBtn.focus(); }, 50);
}

function closeHowToPlay() {
  var modal = qs('#htp-modal');
  if (!modal) return;
  modal.classList.remove('modal--open');
  modal.setAttribute('aria-hidden', 'true');
  document.removeEventListener('keydown', handleHtpKeydown);
  var btnInfo = qs('#btn-info');
  if (btnInfo) btnInfo.focus();   // return focus to trigger (accessibility)
}

function handleHtpKeydown(e) { if (e.key === 'Escape') closeHowToPlay(); }
```

### 4.3 ③ Language — switch the game language

The Language popup has two views inside one card: a **select view** (dropdown + Cancel/Apply) and a **confirm view** (brief "Language Selected!" message, then auto-close). Apply calls `I18n.setLang()`, re-applies static translations, and re-renders the current page so all text updates live.

```js
function openLangModal() {
  var modal = qs('#lang-modal');
  if (!modal) return;
  buildLangSelectView();                 // populate dropdown, reset to select view
  modal.classList.add('modal--open');
  modal.setAttribute('aria-hidden', 'false');
  document.addEventListener('keydown', handleLangKeydown);
}

function closeLangModal() {
  var modal = qs('#lang-modal');
  if (!modal) return;
  var list = qs('#lang-list');
  if (list) list.hidden = true;
  modal.classList.remove('modal--open');
  modal.setAttribute('aria-hidden', 'true');
  document.removeEventListener('keydown', handleLangKeydown);
  var btnGlobe = qs('#btn-globe');
  if (btnGlobe) btnGlobe.focus();
}

function handleLangKeydown(e) { if (e.key === 'Escape') closeLangModal(); }

function buildLangSelectView() {
  var selectView  = qs('#lang-select-view');
  var confirmView = qs('#lang-confirm-view');
  if (selectView)  selectView.hidden  = false;
  if (confirmView) confirmView.hidden = true;

  var trigger     = qs('#lang-trigger');
  var list        = qs('#lang-list');
  var currentText = qs('#lang-current-text');
  var cancelBtn   = qs('#btn-lang-cancel');
  var applyBtn    = qs('#btn-lang-apply');

  var supported  = I18n.getSupportedLanguages();   // { en:'English', hi:'हिन्दी', ... }
  var activeLang = I18n.getLang();

  // Build the option list (native names), mark the current one selected
  list.innerHTML = '';
  Object.keys(supported).forEach(function (code) {
    var name = supported[code];
    var li = document.createElement('li');
    li.className = 'lang-option' + (code === activeLang ? ' lang-option--selected' : '');
    li.setAttribute('role', 'option');
    li.setAttribute('aria-selected', code === activeLang ? 'true' : 'false');
    li.setAttribute('data-lang', code);
    li.setAttribute('data-label', name);
    li.textContent = name;
    list.appendChild(li);
  });

  var pendingLang  = activeLang;
  var originalLang = activeLang;
  if (currentText) currentText.textContent = supported[pendingLang] || pendingLang;

  list.hidden = true;
  trigger.setAttribute('aria-expanded', 'false');

  // Apply is disabled until the user actually picks a different language
  function syncApply() {
    var changed = pendingLang !== originalLang;
    applyBtn.disabled = !changed;
    applyBtn.setAttribute('aria-disabled', changed ? 'false' : 'true');
  }
  syncApply();

  // Open/close the dropdown (flips upward if not enough space below)
  trigger.onclick = function () {
    var opening = list.hidden;
    list.hidden = !opening;
    trigger.setAttribute('aria-expanded', opening ? 'true' : 'false');
  };

  // Pick an option
  list.onclick = function (e) {
    var opt = e.target.closest('.lang-option');
    if (!opt) return;
    pendingLang = opt.getAttribute('data-lang');
    if (currentText) currentText.textContent = opt.getAttribute('data-label');
    qsa('.lang-option', list).forEach(function (o) {
      o.classList.remove('lang-option--selected');
      o.setAttribute('aria-selected', 'false');
    });
    opt.classList.add('lang-option--selected');
    opt.setAttribute('aria-selected', 'true');
    list.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
    syncApply();
  };

  cancelBtn.onclick = closeLangModal;
  applyBtn.onclick  = function () { applyLanguage(pendingLang, supported[pendingLang]); };
}

function applyLanguage(langCode, langLabel) {
  I18n.setLang(langCode);   // persists to localStorage + URL; sets <html lang>

  // Show the confirm view briefly
  var selectView  = qs('#lang-select-view');
  var confirmView = qs('#lang-confirm-view');
  if (selectView)  selectView.hidden  = true;
  if (confirmView) confirmView.hidden = false;

  // ...populate #lang-confirm-msg with the chosen language name...

  setTimeout(function () {
    closeLangModal();
    applyStaticTranslations();   // re-localize header tooltips + static DOM
    // Re-render current screen so all in-page text switches language:
    if (window.CONTENT_MODE && typeof ContentRenderer !== 'undefined') {
      var pid = ContentRenderer.getCurrentPageId();
      if (pid) ContentRenderer.renderPage(pid);
    }
  }, 1800);
}
```

Key behaviors to preserve:
- **Apply is disabled** until the selection differs from the active language.
- On Apply the language is **persisted** (this project's `I18n.setLang` writes `localStorage` + a `?lang=` URL param), then the screen re-renders so nothing is left in the old language.
- Cancel / backdrop / × / Esc all close without changing anything.

### 4.4 ④ Fullscreen — toggle + icon/tooltip swap

The click handler toggles the browser Fullscreen API. A **separate `fullscreenchange` listener** swaps the icon and tooltip — that way the button stays correct even when the user exits via Esc or F11.

```js
function handleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen &&
      document.documentElement.requestFullscreen();
  } else {
    document.exitFullscreen && document.exitFullscreen();
  }
}

function syncFullscreenButton() {
  var btn = qs('#btn-fullscreen');
  if (!btn) return;
  var img  = btn.querySelector('img');
  var isFs = !!document.fullscreenElement;
  if (img) {
    img.src = isFs
      ? 'assets/icons/Exit_Fullscreen_icon.svg'
      : 'assets/icons/Fullscreen_icon.svg';
  }
  var key = isFs ? 'btnFullscreenExit' : 'btnFullscreenEnter';
  btn.title = I18n.t(key);
  btn.setAttribute('aria-label', I18n.t(key));
}
```

> Fullscreen is requested on `document.documentElement` (the whole page). The API is guarded with `&&` so nothing throws on browsers/iframes where it's unavailable — the button just no-ops there.

---

## 5. i18n keys (tooltips + popup copy)

Add these keys to every locale in your translation file. Values shown are English; provide translations for each supported language.

| Key | Where it's used |
|---|---|
| `resetTitle` | Reset button tooltip / aria-label |
| `helpTitle` | Info button tooltip + How-to-Play title |
| `languageTitle` | Language button tooltip |
| `btnFullscreenEnter` | Fullscreen tooltip when **not** fullscreen |
| `btnFullscreenExit` | Fullscreen tooltip when **in** fullscreen |
| `htpSubtitle`, `htpStep1`…`htpStep6` | How-to-Play popup body |
| `langPopupTitle`, `langPopupSubtitle` | Language popup headings |
| `cancelButton`, `applyButton` | Language popup actions |
| `langSelectedTitle`, `langSelectedMessageStart`, `langSelectedMessageEnd` | Language confirm view |

`supportedLanguages` (a `code → native name` map) drives the dropdown options, e.g.:
```json
"supportedLanguages": { "en": "English", "hi": "हिन्दी", "mr": "मराठी", "te": "తెలుగు", "gu": "ગુજરાતી", "od": "ଓଡ଼ିଆ" }
```

Localizing the header tooltips at startup (called from `applyStaticTranslations`):
```js
function _setTooltip(sel, text) {
  var el = qs(sel);
  if (!el) return;
  el.title = text;
  el.setAttribute('aria-label', text);
}
_setTooltip('#btn-reset', I18n.t('resetTitle'));
_setTooltip('#btn-info',  I18n.t('helpTitle'));
_setTooltip('#btn-globe', I18n.t('languageTitle'));
syncFullscreenButton();   // sets the fullscreen tooltip for the current state
```

---

## 6. Behavior summary (acceptance checklist)

| Icon | Click behavior | State/edge handling |
|---|---|---|
| **Reset** | Re-renders current page from its clean definition | Deterministic; discards in-progress input; no navigation |
| **Info** | Opens How-to-Play popup (steps built from config) | Closes via ×, backdrop, or Esc; focus returns to Info button |
| **Language** | Opens Language popup | Apply disabled until selection changes; persists choice; re-renders screen; confirm view auto-closes (~1.8s) |
| **Fullscreen** | Toggles page fullscreen | Icon + tooltip swap on **any** fullscreen change (Esc/F11 included); no-ops where API unsupported |

Cross-cutting requirements (from project conventions):
- Icons are **fixed top-right**, always visible above every screen, wired **once** at startup.
- Tap targets ≥ 36–44px; buttons are keyboard-focusable with visible hover/active states.
- All assets are **local** (offline-safe). No external CDN.
- Correctness/state is never communicated by color alone; every button has an `aria-label` and tooltip.
- None of these icons alter game/validation/telemetry logic — they only reset the view, open popups, change language, or toggle fullscreen.

---

## 7. Porting checklist

1. Copy the 6 SVGs into `assets/icons/`.
2. Paste the `<header>` + two popup blocks into `<body>` (keep the IDs).
3. Add the CSS variables + `.header`, `.header__right`, `.icon-btn`, `.modal-*`, `.lang-*` rules.
4. Add `attachHeaderListeners()` and the handler functions; call it once after DOM ready.
5. Add the `fullscreenchange` listener and `syncFullscreenButton()`.
6. Add the i18n keys + `supportedLanguages` map (or replace `I18n.t(...)` with literals if not localizing).
7. Point Reset and the Language re-render at your project's "re-render current screen" function.
8. Verify against the Section 6 checklist on desktop, tablet, and a small landscape phone.
