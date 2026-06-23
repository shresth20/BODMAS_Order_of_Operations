# Content Authoring

How to add or edit the screens in this module. Architecture background is in
[architecture.md](architecture.md).

---

## 1. Where content lives

| What                         | File                          |
| ---------------------------- | ----------------------------- |
| Page list & per-page data    | `js/content/pages.js`         |
| Page rendering (per type)    | `js/core/content-renderer.js` |
| Answer validation            | `js/content/validators.js`    |
| Entrance/effect animations   | `js/content/animations.js`    |
| Voiceover line → audio file  | `js/content/voiceovers.js`    |
| Translatable strings         | `locales/content.json`        |

Math expressions, tokens, and numbers are **literal** in `pages.js`. Only
human-readable text is stored as an **i18n key** and resolved at render time.

---

## 2. The page list (`CONTENT_PAGES`)

`pages.js` exports one ordered array, `CONTENT_PAGES`. Each entry is a plain
object with at least an `id`, a `type`, and a `next` (the id of the page the
"continue"/auto-advance flow goes to; `null` ends the module).

```js
{
  id:   '1.0',          // "section.step" — section number . step within section
  type: 'l1-intro',     // selects the _render<Type> builder in content-renderer.js
  /* …type-specific fields… */
  next: '1.1'           // id of the following page, or null at the end
}
```

`ContentRenderer.renderPage(id)` looks the entry up by `id`; the dev-skip nav in
`index.html` walks the array in order.

### Page-id convention

`<section>.<step>` — e.g. `2.1` is the second screen of Section 02. Ids are
strings and must be unique. The current sequence:

```text
Section 01  1.0 1.1 1.2 1.3        Level 1: × before +
Section 02  2.0 2.1 2.2 2.3        Level 2: × before −
Section 03  3.0 3.1 3.2 3.3        Level 3
Section 04  4.0 4.1 4.2 4.3        Level 4
Section 05  5.0 5.1 5.2 5.3        Level 5
Section 06  6.0 6.1 6.2 6.3        Level 6: brackets first
            8.0                    BODMAS ladder
            9.0 9.1 9.2 9.3        nested → insert → review → results
```

---

## 3. The per-level pattern

Levels 1–6 each repeat the same four-screen learning flow (matching the default
flow in CLAUDE.md: intro → interaction → reveal → practice):

| Step | Type          | Purpose                                          |
| ---- | ------------- | ------------------------------------------------ |
| `.0` | `lN-intro`    | Scenario + the expression to explore             |
| `.1` | `lN-lab`      | Hands-on interaction (tap/drag), often multi-round |
| `.2` | `lN-reveal`   | Worked steps + the rule stated                   |
| `.3` | `lN-practice` | Mixed practice questions, then completion        |

`N` is the level number (`l1`…`l6`). Each type has its own renderer; copy an
existing level's four entries as a template when authoring a new one.

### Common field shapes

- **intro** — `scenario`, `scenarioHtml`, `expression`, `question`,
  `questionHtml`, `buttonLabel`.
- **lab** — `rounds: [{ tokens, mulIndices, mulResult, finalResult, hasCompare,
  compareWrong, compareRight }]`. `tokens` is the expression split into cells;
  index fields point into that array.
- **reveal** — `title`, `ruleText`, `workedSteps: [{ expr, hlTokens }]`,
  `bodmasTag`, `buttonLabel`.
- **practice** — `questions: [...]` where each question has a `kind`
  (`tap-operator`, `choose-rule`, `which-method`, …) plus its prompt,
  `expression`, options, `correctIndex`, `wrongHint`, and `okMsg`; ends with
  `completionMsg`. May set `animation`.

The end-of-module review (`9.2`, type `l9-bodmas-review`) is a `questions`
array of `{ n, rule, expr, correctOp, answer, okMsg }`; after the last question
it auto-advances to `next` (the results screen). The counter shows
`n` of `questions.length`.

---

## 4. Editing text (i18n)

1. Add the string to **every** language object in `locales/content.json` under
   a new key. (Never edit `locales/core.json` without permission.)
2. Reference the key — not the text — from the page field in `pages.js`.
3. Only **whitelisted** field names are translated (see `_I18N_TEXT_FIELDS` in
   `content-renderer.js`). If you add a brand-new text field, add its name to
   that whitelist, otherwise it renders as the raw key. Do **not** whitelist
   fields that hold expressions/numbers.

Static shell DOM (header, modals) uses `data-i18n*` attributes instead.

---

## 5. Adding a new page type

Only needed when no existing renderer fits.

1. Add a `case '<type>': _render<Type>(page, area); break;` to the dispatch
   `switch` in `content-renderer.js`.
2. Implement `_render<Type>(page, area)` — build DOM with the `_el()` helper,
   resolve text via `I18n.t()`, attach interaction handlers, and call
   `renderPage(page.next)` to advance.
3. Keep validation in `validators.js` (pure), not inline DOM comparisons.
4. If it needs an entrance animation, add it to `ContentAnimations._map` and set
   `animation: '<name>'` on the page.

Follow the existing builders' structure (banner comment per page, `cp-*` class
names) so the file stays navigable.

---

## 6. Validators

`ContentValidation.validate(pageId, input)` dispatches to a per-page validator
in `validators.js`. Validators must be **pure** (no DOM), normalize input
(trim/case/equivalent fractions where relevant), handle empty input, and return
`{ valid, reason }` with a reason code. See the validator test checklist in
CLAUDE.md before shipping one.

---

## 7. Voiceovers

`Narration` (`voiceovers.js`) maps a line id (e.g. `line_1_0_1`) to an `.ogg`
under `assets/voiceovers/`. Add the path to `_srcs`; files are preloaded. A
fresh `Audio` is created per play so lines can overlap/replay cleanly.

---

## 8. Assets

- Keep JS asset paths root-relative from `index.html` (`assets/...`).
- Optimize images/SVGs; no external CDNs (the module must work offline).
- Per-page background/character images are wired via `#content-deco-layer`
  classes in `index.html` and `css/content/`. New decorative art follows the
  `content-deco--lN-n` naming already in place.
