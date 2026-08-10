# Content-Area Layout Template & Contract

A practical guide for placing your content **inside the content area** and using
**Frame 1 / Frame 2** — written against this module (`MT06A01_L01_S07`) as the reference.

> **Who this is for.** Two audiences, and every section is tagged so you can skip:
> - **`[Portable]`** — a framework-neutral rule you can apply to *any* game, including a
>   separate one of your own.
> - **`[This game]`** — the specific recipe this module uses (`CONTENT_PAGES` +
>   `ContentRenderer` + `FrameManager`).
> - **`[Both]`** — applies either way.

> **Read these two things first if nothing else:** §5 (the layout contract — the actual fix
> for "my content gets cut off") and §3 (the DOM skeleton).

> ⚠️ **Framing.** The layout contract in §5 is the **recommended** pattern to adopt. This
> module *predates* it and only partly follows it — some screens already comply, others do
> not. Where the game deviates, it is flagged with **"This game does X instead"** and a
> `file:line`. Treat compliant screens as examples and deviating ones as things to migrate
> when you next touch them. **This guide changes no code** — it is documentation only.

**Don't duplicate these — link to them:**
[architecture.md](architecture.md) (§8 Frames, §10 layers/z-index) ·
[content-authoring.md](content-authoring.md) (the `CONTENT_PAGES` schema, i18n workflow,
adding a page type, validators, voiceovers) ·
[new-game-checklist.md](new-game-checklist.md) ·
`../gamedesign.md` (design tokens & `cp-` BEM) · `../HANDOVER.md` (stack & run notes).

---

## 1. The four terms, defined once `[Portable]`

Most confusion comes from mixing up four different things. Here they are, once:

| Term | Is it in the HTML? | Defined / lives where | Who owns it |
| --- | --- | --- | --- |
| **Content area** | Yes — **one** node | `index.html` `<section id="content-area">`; styled in `css/core/style.css` + `css/content/pages.css` | the **shell** (engine) |
| **Content** | No — it is **data** | `js/content/pages.js` (`CONTENT_PAGES`) → built into DOM by `js/core/content-renderer.js` | the **author** (you) |
| **Content space** | Yes — **one wrapper per screen** | the single root `<div>` you drop inside the content area (`.cp-*-wrap` today; `.cp-screen` under this contract) | the **author** (you) |
| **Frame** | It's a **body class** | `frame--1` / `frame--2`, set by `js/core/frames.js`, styled by `css/core/frames.css` | the **shell**, chosen per screen |

In plain words:

- **Content area** = the *empty stage*. It never holds your material directly; it is wiped
  and refilled every screen. There is exactly one, and you do **not** redefine it.
- **Content** = the *material* (text, math, images, buttons, interactions). In this game it
  is not written as HTML at all — it is authored as data objects and turned into DOM at
  runtime.
- **Content space** = the *single box you put your content in* — one root wrapper per
  screen that sits inside the content area. This is the box the layout contract (§5)
  governs. Getting this box right is what fixes "my content spills / is cut off".
- **Frame** = a *whole-screen layout mode* that restyles the board **around** the content
  area. It is **not** a split screen and **not** two regions side by side.

> **Vocabulary note.** The words *"content space"* and *"frame one / frame two"* are
> informal — they do **not** appear in the code. The code uses the id **`#content-area`**,
> the state classes **`.content-mode`** and **`.content-page-active`**, and the frame
> classes **`frame--1`** / **`frame--2`** (double-dash BEM). There is no `frame-1`,
> `frame1`, or `frame-one` anywhere.

---

## 2. The code seam — where the content area meets your content `[This game]`

There is one exact line where the empty stage becomes a rendered screen. Knowing it removes
all mystery about "what is the area vs. what is my content".

In `js/core/content-renderer.js`, `renderPage(pageId)`:

```text
renderPage(id)
  → _findPage(id)                  look the page object up in CONTENT_PAGES
  → _translatePageConfig(page)     resolve i18n KEYS to text (math left literal)
  → area = getElementById('content-area')
  → area.classList.add('content-mode')   // line ~98
  → area.innerHTML = ''                   // line ~99  ← THE BOUNDARY
  → FrameManager.switchTo(1 | 2)          // lines ~115–133  pick the frame
  → switch (page.type) { ... }            // line ~136  dispatch
        case 'l1-intro': _renderL1Intro(page, area); break;
        // each builder APPENDS one wrapper into `area`
```

**Everything above `area.innerHTML = ''` is the shell. Everything a `_render<Type>` builder
appends below it is your content.** The area is handed to every builder as the `area`
argument; the builder's whole job is to build one root wrapper and append it there.

---

## 3. Copy-paste DOM skeleton for a properly-defined content area `[Portable]`

This is the minimal correct nesting. Reproduce it and your stage is sound. (Mirrors
`index.html` lines ~81–101.)

```html
<!-- Fixed, centered carrier between the fixed header and footer -->
<div id="board-container" class="board-container">

  <!-- The visible card (white in Frame 2, transparent in Frame 1) -->
  <main id="board" class="board" role="main">

    <!-- THE CONTENT AREA — the one persistent, empty stage.
         Keep the aria attributes: screen readers announce each new screen. -->
    <section id="content-area"
             class="content-mode"
             aria-live="polite"
             aria-atomic="true"
             aria-label="Game content">

      <!-- Exactly ONE root wrapper per screen = the "content space".
           Everything for this screen goes inside it. -->
      <div class="cp-screen">
        <!-- your content: headings, math, images, buttons, interactions -->
      </div>

    </section>
  </main>

  <!-- Per-screen background art is a SIBLING of #board, NOT a child of #content-area -->
  <div id="content-deco-layer" class="layer-content-deco" aria-hidden="true">
    <!-- decorative images, positioned relative to the box (see §4) -->
  </div>
</div>
```

**Callouts**

- Keep `aria-live="polite"` and `aria-atomic="true"` on the content area — do **not** remove
  them. They make each new screen readable by assistive tech.
- `#content-deco-layer` is a **sibling** of the board, not inside the content area. Because
  it shares the same stacking context, content (`z-index: var(--z-content)` = 40) always
  renders above decorations (z-index 35). Never raise deco above 40.
- There is **one** content area for the whole game. Do not create a second one, and do not
  restyle `#content-area` per screen — style your `.cp-screen` wrapper instead.

---

## 4. The height / padding / overflow trap — why authoring hurts today `[This game]`

This is the root cause of "my content gets cut off". The content area is a **fixed-height,
clipping** box:

```css
/* css/content/pages.css:20 */
#content-area.content-mode { overflow: hidden; height: 100%; }
```

Now look at two **real** screen wrappers in this game — they disagree on how to fill it:

```css
/* ❌ RISKY — intro wraps.  css/content/style.css:27–42 (.cp-l1i-wrap … .cp-l6i-wrap) */
.cp-l1i-wrap {
  display: flex; flex-direction: column;
  min-height: 100%;                 /* can grow TALLER than the fixed parent … */
  padding: clamp(24px,4vh,56px) clamp(20px,5vw,64px);
  box-sizing: border-box;
}
/* Parent is height:100%; overflow:hidden → the extra height is SILENTLY CLIPPED. */
```

```css
/* ✅ CORRECT — lab wrap.  css/content/style.css:2063–2071 (.cp-l1l-wrap) */
.cp-l1l-wrap {
  display: flex; flex-direction: column;
  height: 100%;                     /* pin to the parent's height … */
  min-height: 0;                    /* … and let flex children shrink instead of overflow */
  overflow: hidden;
}
```

`min-height: 100%` means "at least as tall as the parent, but grow if needed" — and the
parent then clips whatever grows past it. `height: 100%; min-height: 0` means "exactly the
parent's height; children shrink to fit". The second is what you want.

**The systemic causes (what to avoid):**

- **No shared full-height primitive** — every screen re-declares its own height, so they
  drift. (Multiple intro/reveal/summary wraps use the risky `min-height:100%`.)
- **No standard inner padding** — `#content-area` sets none, so each screen hardcodes its
  own different `clamp()` padding; the visual inset from the board edge changes per screen.
- **Container size redefined in 8+ places** — `.board-container` `width`/`max-width` is
  overridden across many breakpoints in `css/core/responsive.css` (1350 → 2200; 90 %–96 %),
  so there is no single source of truth for the area's size.
- **Deco pinned to the viewport** — per-screen art in `#content-deco-layer` is positioned in
  `vw`/`vh`, so it drifts relative to the content box on different devices.

§5 gives one wrapper that removes the first two problems for good.

---

## 5. THE CONTRACT — one reusable content-area layout pattern `[Both]`

### 5a. The rule

Adopt **one** root-wrapper class, `.cp-screen`, and never re-declare height per screen
again. It is a *flex child* of the content area (not a `height:100%` block), so it is
exactly the area's inner height and can shrink — no silent clipping. Overflow becomes an
explicit choice, and padding has one source of truth.

```css
/* ============================================================
   CONTENT-AREA LAYOUT CONTRACT  (recommended reusable pattern)
   One root wrapper per screen, dropped straight inside
   #content-area. Never re-declare height/min-height per screen.
   Consumes tokens from css/core/style.css :root — invents nothing.
   ============================================================ */

/* --- Shell (already defined once in this game; shown for reference) --- */
#content-area {
  flex: 1;                     /* fill #board's flex column            */
  min-height: 0;               /* let this flex child shrink (no clip) */
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: var(--z-content);   /* 40 — always above deco layer (z 35)  */
  overflow: hidden;            /* box clips; screens scroll INTERNALLY */
}

/* --- THE CONTRACT: every screen's single root wrapper ("content space") --- */
.cp-screen {
  flex: 1 1 auto;
  min-height: 0;               /* the fix: allows shrink, kills silent clip */
  display: flex;
  flex-direction: column;
  gap: var(--space-md);

  /* One source of safe-area padding — override the VARS, not the rule. */
  --cp-pad-block:  var(--space-lg);
  --cp-pad-inline: var(--space-xl);
  padding: var(--cp-pad-block) var(--cp-pad-inline);
  box-sizing: border-box;

  overflow: hidden;            /* default = clip; opt into scroll below */
}

/* Content taller than the box scrolls INSIDE it (never spills the board). */
.cp-screen--scroll { overflow-y: auto; overscroll-behavior: contain; }

/* Frame-1 heroes: intros / reveals / summaries. */
.cp-screen--center { align-items: center; justify-content: center; text-align: center; }

/* Interaction screens that pin the primary action to the bottom. */
.cp-screen--stack  { justify-content: space-between; }
```

### 5b. How to use it

- **One `.cp-screen` per screen.** It is the only root wrapper; put everything inside it.
- **Never** set `height: 100%` or `min-height: 100%` on your screen wrapper again.
- **Change padding only through the vars** — e.g. a roomy hero:
  `<div class="cp-screen cp-screen--center" style="--cp-pad-inline: var(--space-2xl)">`.
- **Long content?** Add `--scroll`: it scrolls *inside* the box instead of spilling the
  board. Do **not** put `overflow:auto` on `#content-area` itself.
- **Centered hero (Frame 1)?** Add `--center`. **Action pinned to bottom?** Add `--stack`.
- **Reuse tokens, invent nothing.** Sizes come from `:root` in `css/core/style.css`
  (`--space-*`, `--font-*`, `--board-radius`, `--z-content`, colors). See §10.

### 5c. How this maps to the current game

- `.cp-l1l-wrap` (and the other lab wraps) **already match** the contract
  (`height:100%; min-height:0; overflow:hidden`) — use them as live reference.
- The intro/reveal/summary wraps (`.cp-l1i-wrap …`, `min-height:100%`) **deviate** — migrate
  them to `.cp-screen cp-screen--center` when you next edit them.

---

## 6. Frame 1 vs Frame 2 `[This game]`

Frames are two **mutually exclusive whole-screen layout modes**, set as a `<body>` class.
Not a split, not two regions — the *same* content area, restyled around it.

| | **Frame 1 — Explanation** | **Frame 2 — Question / Activity** (default) |
| --- | --- | --- |
| body class | `frame--1` | `frame--2` |
| board look | **transparent** — `#board` has `background:none`, no border, no shadow | **white card** — background + `2px` border + `--board-radius`; deco repositioned & non-interactive |
| used for | intros, rule reveals, skill-unlocked / insight cards, session summary | comparison grids, MCQs, drag-and-drop, timers, labs, rapid practice |
| source | `css/core/frames.css:15` (`body.frame--1 #board`) | `css/core/frames.css:33–64` |

### 6a. Switching frames

```js
// js/core/frames.js
FrameManager.switchTo(1);   // explanation (transparent board)
FrameManager.switchTo(2);   // question/activity (white board)   ← default
FrameManager.getCurrent();  // 1 or 2
```

`FrameManager` defaults to frame 2, adds the class on `DOMContentLoaded`, and no-ops on an
invalid or unchanged id. There is **no** user-facing frame switcher — the frame is chosen
programmatically per screen.

### 6b. Auto-selection (and the gotcha)

You normally never call `switchTo` yourself. The renderer picks the frame per page from a
**hand-maintained allowlist** of page-type strings at `js/core/content-renderer.js:115–133`:

```js
FrameManager.switchTo(
  (page.type === 'welcome' || page.type === 'l1-intro' || page.type === 'l1-reveal'
   /* … ~40 "explanation-like" types listed here … */) ? 1 : 2
);
```

Types in the list get **Frame 1**; **everything else falls through to Frame 2**.

> ⚠️ **Gotcha.** If you add a new *explanation* page type and forget to add its string to
> this allowlist, it silently renders on the **white Frame-2 board**. This is the single
> most common frame bug when adding content.

### 6c. Adding a new page type — 3 edits, in order `[This game]`

1. **Data** — add an object to `CONTENT_PAGES` in `js/content/pages.js`
   (`id`, `type`, `next`, + your fields; text as **i18n keys**, math **literal**).
2. **Renderer** — add `case '<type>': _render<Type>(page, area); break;` to the switch
   (`content-renderer.js:~136`), and write `_render<Type>(page, area)` so it appends **one**
   `.cp-screen` wrapper into `area` (use the `_el(tag, cls)` helper; resolve text with
   `I18n.t()`; call `renderPage(page.next)` to advance).
3. **Frame** — **if it is an explanation screen**, add its `type` string to the allowlist at
   `content-renderer.js:115–133`. Interaction screens need no change (they default to
   Frame 2).

Full schema and field shapes for existing types live in
[content-authoring.md](content-authoring.md) — follow it rather than re-deriving.

---

## 7. Two ways to place content `[Portable]` vs `[This game]`

### 7a. Portable — static HTML `[Portable]`

For a small, separate game with no renderer: write the content area and one `.cp-screen`
directly in your HTML, and pick a frame by hand (or drop frames entirely).

```html
<body class="frame--1">
  <div id="board-container" class="board-container">
    <main id="board" class="board">
      <section id="content-area" class="content-mode"
               aria-live="polite" aria-atomic="true" aria-label="Game content">
        <div class="cp-screen cp-screen--center">
          <h1>Your title</h1>
          <p>Your explanation…</p>
          <button class="cta">Start</button>
        </div>
      </section>
    </main>
  </div>
</body>
```

Include the §5 contract CSS plus the `:root` tokens, and you have a correct, responsive,
non-clipping stage with no engine.

### 7b. Data-driven — this game's engine `[This game]`

Content is a data object; a builder turns it into a `.cp-screen`; navigation is by `next`;
the frame is auto-picked.

```js
// js/content/pages.js
{ id: '1.0', type: 'l1-intro',
  scenario: 'lvl1Scenario',        // i18n KEY → resolved at render
  expression: '3 × 4 + 2',         // LITERAL → never translated
  question: 'lvl1Question',
  buttonLabel: 'btnStartExploring',
  next: '1.1' }
```

The builder (`_renderL1Intro`) reads those fields, builds one wrapper, and calls
`renderPage(page.next)` on the CTA. Schema, the i18n whitelist (`_I18N_TEXT_FIELDS`), and
the per-level 4-screen pattern are documented in [content-authoring.md](content-authoring.md).

### 7c. Which to use

| Use **7a (static)** when… | Use **7b (data-driven)** when… |
| --- | --- |
| a small/standalone game, few screens | many screens sharing repeated layouts |
| no localization, or trivial | multi-language via i18n keys |
| you want zero engine dependency | you want auto-frame, `next` flow, shared renderers |

Either way, **the content-area contract (§5) and the frame definitions (§6) are the same.**

---

## 8. Checklists & guardrails `[Both]`

### 8a. Author self-check (before you ship a screen)

- [ ] Exactly **one** `.cp-screen` root wrapper for the screen.
- [ ] **No** `height:100%` or `min-height:100%` on your wrapper (§5).
- [ ] Padding via `--cp-pad-*` tokens, not a fresh hardcoded `clamp()`.
- [ ] Long content scrolls via `.cp-screen--scroll`, **not** `overflow` on `#content-area`.
- [ ] All copy uses **i18n keys**; math/numbers stay literal.
- [ ] If it's an **explanation** screen, its type is in the **frame allowlist** (§6b).
- [ ] Any per-screen art is positioned relative to the box, not `vw`/`vh` to the viewport.
- [ ] Interactive targets are ≥ 44 px (use `--size-btn-md`, which starts at 44 px).

### 8b. Do NOT touch / do NOT break (from `../.claude/CLAUDE.md`)

- **Never** edit `locales/core.json` without permission. Add lesson strings to
  `locales/content.json` only.
- **Never** edit or invent the content itself when fixing layout — this guide is about the
  *container*, not the copy.
- Keep concerns **separate**: screen render / interaction / validation / telemetry / config
  / assets / responsive layout.
- Validators stay **pure** (no DOM, no `eval`) and live in `js/content/validators.js`.
- **No external CDNs** — everything must work offline (fonts, images, audio are local).
- Preserve **validation, telemetry, accessibility, reduced-motion**, and responsive
  behavior while changing UI.
- Don't communicate correctness by **color alone**; keep contrast readable.
- Don't raise `#content-deco-layer` above `z-index: 40` — content must always win.
- Don't create a second content area or restyle `#content-area` per screen.

---

## 9. Worked example — tracing two real screens `[This game]`

### 9a. Intro on **Frame 1** — page `1.0`, type `l1-intro`

1. `renderPage('1.0')` finds the object in `CONTENT_PAGES` (`pages.js:24–34`).
2. `_translatePageConfig` resolves `scenario`, `question`, `buttonLabel` (i18n keys);
   `expression: '3 × 4 + 2'` is **left literal**.
3. `area.innerHTML = ''` clears the stage.
4. `l1-intro` **is** in the frame allowlist → `switchTo(1)` → transparent board.
5. `_renderL1Intro(page, area)` (`content-renderer.js:~12821`) builds `.cp-l1i-wrap`:
   scenario paragraph → expression split into per-token spans (numbers vs operators) →
   question → CTA that calls `renderPage(page.next)`.

> **Deviation flag.** `.cp-l1i-wrap` uses `min-height:100%` (§4). Under the contract this
> screen would be `<div class="cp-screen cp-screen--center">`.

### 9b. Lab on **Frame 2** — page `1.1`, type `l1-lab`

1. `renderPage('1.1')` → translate → `innerHTML=''`.
2. `l1-lab` is **not** in the allowlist → `switchTo(2)` → white bordered board.
3. `_renderL1Lab(page, area)` (`content-renderer.js:~12940`) builds `.cp-l1l-wrap` with the
   tile board and characters.

> **Compliance flag.** `.cp-l1l-wrap` already matches the contract
> (`height:100%; min-height:0; overflow:hidden`) — use it as the reference.

### 9c. Before / after — migrating the intro wrapper

```css
/* BEFORE (deviates — silent clip risk) */
.cp-l1i-wrap {
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  min-height: 100%;
  padding: clamp(24px,4vh,56px) clamp(20px,5vw,64px);
  box-sizing: border-box; text-align: center;
}

/* AFTER (contract) — same look, no clip, one source of padding */
.cp-l1i-wrap {                     /* or just author it as: class="cp-screen cp-screen--center" */
  flex: 1 1 auto; min-height: 0;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center; text-align: center;
  gap: var(--space-md);
  --cp-pad-block: var(--space-lg); --cp-pad-inline: var(--space-xl);
  padding: var(--cp-pad-block) var(--cp-pad-inline);
  box-sizing: border-box;
  overflow: hidden;                /* add cp-screen--scroll only if it can overflow */
}
```

---

## 10. Appendix — tokens & file map `[Portable]`

### Tokens the contract consumes (`:root` in `css/core/style.css:38–180`)

| Token | Value | Role in the contract |
| --- | --- | --- |
| `--space-md` | `clamp(14px,2vw,22px)` | `gap` between content blocks |
| `--space-lg` | `clamp(20px,3vw,32px)` | default vertical padding (`--cp-pad-block`) |
| `--space-xl` | `clamp(28px,4vw,48px)` | default horizontal padding (`--cp-pad-inline`) |
| `--z-content` | `40` | content sits above deco (35) |
| `--board-radius` | `20px` | board corner (Frame 2) |
| `--header-h` / `--footer-h` | `clamp(64px,8vh,88px)` / `clamp(72px,9vh,96px)` | drive the content area's top/bottom |
| `--font-base … --font-display` | fluid `clamp()` scale | body → hero text |
| `--size-btn-md` | `clamp(44px,6vw,64px)` | ≥ 44 px touch targets |

### Where things live

| Layer | Shell (engine — don't put content here) | Content (yours) |
| --- | --- | --- |
| **CSS** | `css/core/*` (`style.css`, `responsive.css`, `frames.css`, `animations.css`) | `css/content/*` (`pages.css`, `style.css`, `responsive.css`) — `cp-*` classes |
| **JS** | `js/core/*` (`app.js`, `content-renderer.js`, `frames.js`, `i18n.js`, `audio.js`, …) | `js/content/*` (`pages.js`, `validators.js`, `animations.js`, `voiceovers.js`) |
| **Text** | `locales/core.json` (shell — **do not edit without permission**) | `locales/content.json` |

**Golden rule:** the shell owns the *content area and the frames*; you own the *content and
the one `.cp-screen` wrapper* you place inside it. Keep them separate and nothing breaks.