# New Game Checklist

Steps to spin up a new learning module from this one as a template. Background:
[architecture.md](architecture.md) · [content-authoring.md](content-authoring.md).

---

## 1. Project setup

- [ ] Copy the repo to the new module folder (e.g. `MT0xAxx_Lxx_Sxx`).
- [ ] Update `<title>` and the favicon in `index.html`.
- [ ] Update the module name in `README.md` and `HANDOVER.md`.
- [ ] Confirm it runs: `python -m http.server 8000` → open
      `http://localhost:8000/index.html` (serve over HTTP so locale JSON loads).

## 2. Content

- [ ] Rewrite `js/content/pages.js` (`CONTENT_PAGES`) for the new lesson —
      keep the `id` / `type` / `next` shape and the section.step id convention.
- [ ] Reuse existing `type`s where possible; only add a new `_render<Type>`
      to `content-renderer.js` when none fits (see content-authoring §5).
- [ ] Keep math/expressions/numbers literal; store display text as i18n keys.
- [ ] Make sure every `next` points to a real `id`, and the final page has
      `next: null`.

## 3. Localisation

- [ ] Replace content strings in `locales/content.json` for **all** supported
      languages (`en`, `hi`, `mr`, `te`, `gu`, `od`).
- [ ] Whitelist any new translatable field names in `_I18N_TEXT_FIELDS`
      (`content-renderer.js`).
- [ ] Do **not** edit `locales/core.json` without permission.
- [ ] Spot-check each language renders without overflow/clipping.

## 4. Validation

- [ ] Add/replace per-page validators in `js/content/validators.js` (pure
      functions, reason codes).
- [ ] Cover the validator checklist from CLAUDE.md: canonical, equivalent,
      wrong, empty, extra spaces, alternate formatting, boundary, retry,
      rapid double-submit.

## 5. Media

- [ ] Replace voiceover lines in `js/content/voiceovers.js` + the `.ogg` files
      under `assets/voiceovers/`.
- [ ] Confirm sound conventions: correct answer → `correct-answer.ogg`
      (`playCorrect`), confetti → `confetti-sound.ogg` (fired inside
      `launchConfetti`), wrong → `incorrect-answer.ogg`.
- [ ] Replace per-page art / `#content-deco-layer` images; optimize all assets;
      no external CDNs (must work offline).

## 6. Responsiveness & accessibility

- [ ] Verify the target devices: interactive panel, laptop, tablet, low-end
      Android — portrait and landscape.
- [ ] No fixed sizes that clip math; controls reachable without heavy scroll;
      tap targets large enough.
- [ ] Inputs labelled; correctness not signalled by colour alone; keyboard
      focus not trapped; reduced-motion respected where feasible.

## 7. Pre-handover

- [ ] Play through the whole flow start → `SESSION_COMPLETE`.
- [ ] Check the host postMessage contract (`test-postmessage.html`); align the
      message type/payload with whatever the host expects.
- [ ] **Remove the temporary dev-skip nav block** from `index.html` (the
      `.dev-skip` style + markup + script — marked "REMOVE BEFORE PRODUCTION").
- [ ] Syntax-check the JS: `node --check` on each edited file.
- [ ] Update `HANDOVER.md` (file list, page map, any new page types) and the
      `docs/` files if behaviour changed.
- [ ] Confirm no secrets/PII committed; `game.config.json` holds no private data.
