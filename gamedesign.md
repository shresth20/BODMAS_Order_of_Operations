# Game Design System — Reusable Styling Reference

A single source of truth for the **colors, gradients, and element styling** used in this math-learning game, written so the same look can be recreated in **any other game**.

The system is built on one idea:

> **One neutral foundation + seven accent color families, where every accent is themed with the same 3-part recipe.**

Pick a theme color, derive its three gradients/shadows from the recipe table, and every screen looks like it belongs to the same product.

---

## 1. How to use this file

1. **Copy the `:root` token block** in [§2](#2-foundation-tokens-copy-paste) into your new game's base stylesheet. Everything else references these variables.
2. **Choose an accent** for the screen/level/game from [§4](#4-accent-color-families--the-gradient-recipe) and apply the 3-part recipe (soft surface gradient, solid accent gradient, 3D button shadow).
3. **Reuse the component recipes** in [§9](#9-component-cookbook) for buttons, cards, modals, feedback, tiles. They already wire up the tokens and all interaction states.
4. Keep everything **fluid** (`clamp()`) and **token-driven** — never hard-code a hex or a pixel size that a token already covers.

### Naming convention

- Content components are prefixed `cp-` (content-page): `.cp-btn-primary`, `.cp-number-card`, `.cp-ds-tile`.
- **BEM** structure: Block `.cp-card`, Element `.cp-card__title`, Modifier `.cp-card--winner` / `.cp-card__title--large`.
- State modifiers are explicit classes (added by JS), not styled by inference: `--dragging`, `--wrong`, `--correct`, `--locked`, `--hover`, `--focus`.

### Source files at a glance

| File | Holds |
|------|-------|
| `css/core/style.css` | The `:root` token block, base elements, shared components (buttons, modals, feedback, progress, loader) |
| `css/core/animations.css` | Global keyframes (`correctPulse`, confetti, hand-nudge) + reduced-motion |
| `css/core/responsive.css` | Breakpoints & device/orientation overrides |
| `css/core/frames.css` | Board frame variants |
| `css/content/style.css` | Shared content tokens + per-level (L1–L6) styling and gradients |
| `css/content/pages.css` | Page-type component styles (cards, tiles, slots, options, grids) |
| `css/content/responsive.css` | Content-specific responsive rules |

---

## 2. Foundation tokens (copy-paste)

Paste verbatim. This is the entire shared design contract.

```css
:root {
  /* ── Global accent palette ── */
  --gl-sky:    #3BC6FF;
  --gl-orange: #FFA93A;
  --gl-mint:   #18D6A0;
  --gl-lilac:  #C48AFF;
  --gl-pink:   #FF6FA8;
  --gl-lime:   #B7EA33;
  --gl-coral:  #FF6A58;
  --gl-blue:   #6F8BFF;
  --gl-yellow: #FFDF50;
  --gl-navy:   #1F507F;
  --gl-ink:    #1B3A6B;
  --gl-ink-2:  rgba(31, 80, 127, 0.62);
  --gl-ink-3:  rgba(31, 80, 127, 0.36);
  --gl-line:   rgba(31, 80, 127, 0.14);

  /* ── Primary accent (orange) + its depth/tints ── */
  --accent:      #FFA93A;
  --accent-deep: #E5891A;   /* darkest shade → 3D shadow + gradient end */
  --accent-soft: rgba(255, 169, 58, 0.12);
  --accent-line: rgba(255, 169, 58, 0.45);
  --accent-glow: rgba(255, 169, 58, 0.40);

  /* ── Semantic colors ── */
  --color-bg: #FFFEF6;            /* page background (warm off-white) */
  --color-board: #FFFFFF;         /* card / board surface */
  --color-navy: #1B3A6B;          /* primary text + ink elements */
  --color-navy-light: #2D5A9E;    /* hover state for navy */
  --color-submit: #F5B61A;        /* primary CTA (gold) */
  --color-submit-hover: #E5A810;
  --color-correct: #22C55E;       /* success */
  --color-correct-bg: #F0FDF4;
  --color-correct-text: #15803D;
  --color-wrong: #EF4444;         /* error */
  --color-wrong-bg: #FFF1F1;
  --color-wrong-text: #B91C1C;
  --color-dot-active: #FCB717;    /* completed progress dot */
  --color-dot-empty: #D9D9D9;
  --color-highlight: #FDE68A;     /* text highlight */
  --color-border: #BDBDBD;
  --color-shadow-lg: rgba(0,0,0,0.13);
  --color-soft-blue: #F0F5FF;
  --color-panel-soft: #EEF3FA;
  --color-overlay: rgba(15, 30, 60, 0.42);   /* modal/loader backdrop */
  --shadow-submit: 0 4px 18px rgba(245, 182, 26, 0.4);
  --shadow-navy:   0 4px 18px rgba(27, 58, 107, 0.22);

  /* ── Fonts ── */
  --font-primary: 'Lilita One', system-ui, sans-serif;   /* display / headings */
  --font-accent:  'Nunito', system-ui, -apple-system, sans-serif;  /* body / UI */
  --font-chalk:   'SketchChalk', cursive;                /* decorative only */
  --font-weight-title: 500;
  --font-weight-body:  500;

  /* ── Fluid font scale (7" tablet → 14.6" tablet) ── */
  --font-xs:      clamp(10px, 1.2vw, 13px);   /* labels, badges */
  --font-sm:      clamp(12px, 1.5vw, 15px);   /* captions, hints */
  --font-base:    clamp(14px, 1.8vw, 18px);   /* body */
  --font-md:      clamp(16px, 2.2vw, 22px);   /* UI labels */
  --font-lg:      clamp(18px, 2.8vw, 26px);   /* subheadings */
  --font-xl:      clamp(22px, 3.5vw, 32px);   /* headings */
  --font-2xl:     clamp(28px, 4.5vw, 42px);   /* screen titles */
  --font-display: clamp(36px, 6vw,   60px);   /* hero / score */
  --font-size-expr: clamp(30px, 4vw, 40px);   /* math expression display */

  /* Legacy aliases mapped to the fluid scale */
  --font-size-popup-body:  var(--font-base);
  --font-size-popup-title: var(--font-xl);
  --font-size-game-body:   var(--font-lg);
  --font-size-game-title:  var(--font-xl);

  /* ── Touch-optimized sizes (min 44×44px) ── */
  --size-icon-sm: clamp(32px, 4vw, 48px);
  --size-icon-md: clamp(40px, 5vw, 60px);
  --size-icon-lg: clamp(48px, 6vw, 72px);
  --size-btn-sm:  clamp(36px, 5vw, 52px);
  --size-btn-md:  clamp(44px, 6vw, 64px);
  --size-btn-lg:  clamp(52px, 7vw, 80px);

  /* ── Fluid spacing ── */
  --space-xs:  clamp(4px,  0.5vw, 8px);
  --space-sm:  clamp(8px,  1vw,   14px);
  --space-md:  clamp(14px, 2vw,   22px);
  --space-lg:  clamp(20px, 3vw,   32px);
  --space-xl:  clamp(28px, 4vw,   48px);
  --space-2xl: clamp(40px, 5vw,   64px);

  /* ── Structure / radii ── */
  --board-radius: 20px;
  --card-radius:  14px;
  --btn-radius:   50px;
  --radius-pill:  999px;
  --header-h: clamp(64px, 8vh, 88px);
  --footer-h: clamp(72px, 9vh, 96px);

  /* ── Z-index layers ── */
  --z-bg: 1;
  --z-board: 20;
  --z-deco: 30;
  --z-content: 40;
  --z-chrome: 99;
  --z-feedback: 100;
  --z-confetti: 9997;
  --z-popups: 9998;
  --z-overlay: 9999;

  /* ── Motion ── */
  --dur-fast: 150ms;
  --dur-normal: 350ms;
  --ease-out: cubic-bezier(0.25, 0.46, 0.45, 0.94);

  /* ── Navy (ink) overlay tints — same hue, varying alpha ── */
  --ink-a04: rgba(27, 58, 107, 0.04);
  --ink-a07: rgba(27, 58, 107, 0.07);
  --ink-a08: rgba(27, 58, 107, 0.08);
  --ink-a10: rgba(27, 58, 107, 0.10);
  --ink-a14: rgba(27, 58, 107, 0.14);
  --ink-a18: rgba(27, 58, 107, 0.18);
  --ink-a22: rgba(27, 58, 107, 0.22);
  --ink-a40: rgba(27, 58, 107, 0.40);
  --ink-a45: rgba(27, 58, 107, 0.45);
  --ink-a50: rgba(27, 58, 107, 0.50);
  --ink-a55: rgba(27, 58, 107, 0.55);

  /* ── White / black overlay tints ── */
  --white-a86: rgba(255, 255, 255, 0.86);
  --white-a88: rgba(255, 255, 255, 0.88);
  --black-a22: rgba(0, 0, 0, 0.22);
  --black-a40: rgba(0, 0, 0, 0.40);

  /* ── Composite inset shadows ── */
  --shadow-inset-ink:   inset 0 1px 2px rgba(27, 58, 107, 0.08);
  --shadow-inset-white: inset 0 2px 0 rgba(255, 255, 255, 0.86);
}
```

### Shared content tokens (in `css/content/style.css`)

```css
:root {
  --shared-student-blue-bg:   #3BC6FF;
  --shared-student-pink-bg:   #FF6FA8;
  --shared-student-blue:      #3B82F6;
  --shared-student-pink:      #EC4899;
  --shared-student-blue-dark: #2563EB;
  --shared-student-pink-dark: #F0529B;
  --shared-chalkboard-bg:     #3A6B44;   /* chalkboard green */
  --shared-chalkboard-frame:  #7B4F1A;   /* wood frame brown */
  --shared-bubble-shadow:     0 4px 18px rgba(0,0,0,0.13);
  --shared-card-shadow:       0 4px 16px rgba(0,0,0,0.10);
}
```

---

## 3. Color palette reference

### Foundation (use everywhere)

| Role | Token | Value |
|------|-------|-------|
| Page background | `--color-bg` | `#FFFEF6` |
| Card / board surface | `--color-board` | `#FFFFFF` |
| Primary text & ink | `--color-navy` | `#1B3A6B` |
| Navy hover | `--color-navy-light` | `#2D5A9E` |
| Primary CTA (gold) | `--color-submit` | `#F5B61A` |
| CTA hover | `--color-submit-hover` | `#E5A810` |
| Soft blue surface | `--color-soft-blue` | `#F0F5FF` |
| Soft panel | `--color-panel-soft` | `#EEF3FA` |
| Border (neutral) | `--color-border` | `#BDBDBD` |
| Backdrop overlay | `--color-overlay` | `rgba(15,30,60,0.42)` |

### Feedback

| Role | Token | Value |
|------|-------|-------|
| Correct border/fill | `--color-correct` | `#22C55E` |
| Correct background | `--color-correct-bg` | `#F0FDF4` |
| Correct text | `--color-correct-text` | `#15803D` |
| Wrong border/fill | `--color-wrong` | `#EF4444` |
| Wrong background | `--color-wrong-bg` | `#FFF1F1` |
| Wrong text | `--color-wrong-text` | `#B91C1C` |
| Highlight | `--color-highlight` | `#FDE68A` |
| Active progress dot | `--color-dot-active` | `#FCB717` |
| Empty progress dot | `--color-dot-empty` | `#D9D9D9` |

### Accent palette

| Token | Value | Typical use |
|-------|-------|-------------|
| `--gl-orange` / `--accent` | `#FFA93A` | Primary accent, L1 |
| `--gl-sky` | `#3BC6FF` | Sky theme, icon hover |
| `--gl-mint` | `#18D6A0` | Mint/teal theme |
| `--gl-lilac` | `#C48AFF` | Purple theme |
| `--gl-pink` | `#FF6FA8` | Pink theme |
| `--gl-blue` | `#6F8BFF` | Indigo theme |
| `--gl-yellow` | `#FFDF50` | Gold theme, icon active |
| `--gl-lime` | `#B7EA33` | Lime highlight |
| `--gl-coral` | `#FF6A58` | Coral / warm error |
| `--gl-navy` | `#1F507F` | Medium navy |

### Navy tint ladder (the alpha-overlay system)

A single hue `rgba(27, 58, 107, α)` at fixed alphas gives consistent borders, fills, and shadows over any background — prefer these over ad-hoc greys.

`--ink-a04` `0.04` · `--ink-a07` `0.07` · `--ink-a08` `0.08` · `--ink-a10` `0.10` · `--ink-a14` `0.14` · `--ink-a18` `0.18` · `--ink-a22` `0.22` · `--ink-a40` `0.40` · `--ink-a45` `0.45` · `--ink-a50` `0.50` · `--ink-a55` `0.55`

Typical mapping: faint surface fill `a04`–`a08` · card border `a13`–`a18` · drop shadows `a07`–`a10` · strong borders/icons `a45`–`a55`.

---

## 4. Accent color families & the gradient recipe

**This is the core design logic.** Every accent is themed with the same three derived treatments. To theme a new screen, pick a row and apply all three.

| Accent | Soft surface (start → end) | Solid gradient (base → mid → deep) | 3D shadow color |
|--------|----------------------------|-------------------------------------|-----------------|
| **Orange** | `#FFF8E8 → #FFF0C8` | `--gl-orange → #F59624 → --accent-deep (#E5891A)` | `#E5891A` |
| **Sky** | `#EFF9FF → #DBEEFF` | `--gl-sky → #0EA5E9 → #0284C7` | `#0284C7` |
| **Mint** | `#F0FFF9 → #CCFBF1` | `--gl-mint → #0FA878 → #059669` | `#059669` |
| **Lilac** | `#F8F0FF → #EFE1FF` | `--gl-lilac → #A855F7 → #9B59D9` | `#9B59D9` |
| **Pink** | `#FFF0F6 → #FFE0EE` | `--gl-pink → #EC4899 → #DB2777` | `#DB2777` |
| **Blue** | `#F0F2FF → #E5E8FF` | `--gl-blue → #4F46E5 → #4338CA` | `#4338CA` |
| **Yellow** | `#FFFCEB → #FFF8D0` | `--gl-yellow → #E5C300` (2-stop) | `#E5C300` |

### Recipe part 1 — Soft surface gradient (panels, cards, board fills)

Light tint to a slightly deeper tint, angled `135deg` or `160deg`:

```css
/* example: orange surface */
background: linear-gradient(160deg, #FFF8E8 0%, #FFF0C8 100%);
/* example: sky surface */
background: linear-gradient(135deg, #EFF9FF 0%, #DBEEFF 100%);
```

### Recipe part 2 — Solid accent gradient (pills, headers, chips)

Base accent → mid → deep, angled `90deg` (3-stop, horizontal) or `180deg` (2-stop, vertical):

```css
/* example: orange pill */
background: linear-gradient(90deg, var(--gl-orange) 0%, #F59624 55%, var(--accent-deep) 100%);
/* example: sky pill */
background: linear-gradient(90deg, var(--gl-sky) 0%, #0EA5E9 55%, #0284C7 100%);
```

### Recipe part 3 — 3D "pressed block" button shadow

A hard offset shadow in the accent's darkest shade gives the chunky tactile button. It collapses on press:

```css
.btn-3d {
  background: linear-gradient(180deg, var(--gl-mint) 0%, #059669 100%);
  border-radius: var(--btn-radius);
  box-shadow: 0 6px 0 #059669;          /* deep shade, 5–6px offset, 0 blur */
  transition: transform var(--dur-fast), box-shadow var(--dur-fast);
}
.btn-3d:active {
  transform: translateY(4px);
  box-shadow: 0 2px 0 #059669;          /* press → shrink the block */
}
```

### Two reusable surface overlays

```css
/* Top sheen — layer over any solid surface for a glossy top edge */
background-image: radial-gradient(circle at 50% 0%, rgba(255,255,255,0.95), rgba(255,255,255,0) 40%);

/* Accent dot (bullets, markers, decorative grids) */
background-image: radial-gradient(circle at center, var(--gl-orange) 0 5px, transparent 5.5px);
```

---

## 5. Typography

### Font faces (`css/core/style.css`, lines 1–36)

```css
@font-face { font-family: 'SketchChalk'; src: url('../../assets/fonts/Chalk_style/SketchChalk.ttf') format('truetype'); font-weight: 400; font-display: swap; }
@font-face { font-family: 'Lilita One';  src: url('../../assets/fonts/lilita_one/lilitaone-regular.ttf') format('truetype'); font-weight: 400; font-display: swap; }
@font-face { font-family: 'Nunito';      src: url('../../assets/fonts/nunito/nunito-variablefont_wght.ttf') format('truetype'); font-weight: 100 900; font-display: swap; }
@font-face { font-family: 'Nunito';      src: url('../../assets/fonts/nunito/nunito-italic-variablefont_wght.ttf') format('truetype'); font-weight: 100 900; font-style: italic; font-display: swap; }
```

All fonts are **local** (offline-first) — no CDN.

| Token | Family | Use |
|-------|--------|-----|
| `--font-primary` | `'Lilita One'` | Headings, titles, CTAs, big numbers |
| `--font-accent` | `'Nunito'` | Body text, UI labels, buttons |
| `--font-chalk` | `'SketchChalk'` | Decorative chalkboard moments only |

Fluid scale (all `clamp()`): `--font-xs` (10→13) · `--font-sm` (12→15) · `--font-base` (14→18) · `--font-md` (16→22) · `--font-lg` (18→26) · `--font-xl` (22→32) · `--font-2xl` (28→42) · `--font-display` (36→60) · `--font-size-expr` (30→40, math). Weights: title/body both `500` by default; UI bold uses `700`–`800` inline.

### Indic-script fallbacks

For non-English locales, the font stack prepends a Noto Sans script font and tightens line-height:

```css
html[lang="hi"], html[lang="mr"] {
  --font-primary: 'Lilita One', 'Noto Sans Devanagari', 'Nirmala UI', system-ui, sans-serif;
  --font-accent:  'Nunito', 'Noto Sans Devanagari', 'Nirmala UI', system-ui, sans-serif;
}
html[lang="te"] { /* Noto Sans Telugu */ }
html[lang="gu"] { /* Noto Sans Gujarati */ }
html[lang="od"] { /* Noto Sans Oriya / Odia */ }
html[lang="hi"] body, html[lang="mr"] body, html[lang="te"] body,
html[lang="gu"] body, html[lang="od"] body { line-height: 1.35; }
```

---

## 6. Spacing, sizing & structure

- **Spacing scale** (`--space-xs`…`--space-2xl`): `4→8`, `8→14`, `14→22`, `20→32`, `28→48`, `40→64` (all `clamp()`).
- **Icon sizes**: `--size-icon-sm/md/lg` = `32→48`, `40→60`, `48→72`.
- **Button heights**: `--size-btn-sm/md/lg` = `36→52`, `44→64`, `52→80`. **Minimum touch target 44×44px** is enforced (`min-width/min-height: 44px`) on interactive controls.
- **Radii**: board `20px` · card `14px` · button (pill) `50px` · full pill `999px`.
- **Chrome**: header `clamp(64px,8vh,88px)`, footer `clamp(72px,9vh,96px)`.

---

## 7. Shadows & elevation

| Purpose | Value |
|---------|-------|
| Card | `0 4px 16px rgba(0,0,0,0.10)` (`--shared-card-shadow`) |
| Bubble / speech | `0 4px 18px rgba(0,0,0,0.13)` (`--shared-bubble-shadow`) |
| Navy drop | `0 4px 18px rgba(27,58,107,0.22)` (`--shadow-navy`) |
| Submit glow | `0 4px 18px rgba(245,182,26,0.4)` (`--shadow-submit`) |
| Card hover | `0 6px 22px rgba(27,58,107,0.28)` |
| Inset light highlight | `inset 0 2px 0 rgba(255,255,255,0.86)` (`--shadow-inset-white`) |
| Inset emboss | `inset 0 1px 2px rgba(27,58,107,0.08)` (`--shadow-inset-ink`) |

**Composite 3D portrait shadow** (avatar tiles — hard edge + soft drop + two insets):

```css
box-shadow:
  0 3px 0  rgba(137, 45, 91, 0.42),     /* hard bottom edge */
  0 10px 20px rgba(232, 110, 164, 0.28),/* soft colored drop */
  inset 0 2px 0 rgba(255,255,255,0.46), /* top inner light */
  inset 0 -2px 0 rgba(114, 31, 78, 0.18);/* bottom inner shade */
```

**Glow** treatments:

```css
filter: drop-shadow(0 0 12px rgba(59, 198, 255, 0.75));         /* hover glow */
text-shadow: 0 0 10px rgba(255,169,58,0.7), 0 0 22px rgba(255,169,58,0.35);
```

---

## 8. Z-index layers & motion

**Layers** (low → high): `--z-bg 1` · `--z-board 20` · `--z-deco 30` · `--z-content 40` · `--z-chrome 99` · `--z-feedback 100` · `--z-confetti 9997` · `--z-popups 9998` · `--z-overlay 9999`. (Hand-nudge hint sits above all at `10000`.)

**Motion**: `--dur-fast 150ms` (taps/hover), `--dur-normal 350ms` (state transitions), easing `--ease-out: cubic-bezier(0.25,0.46,0.45,0.94)`. Modal entry uses a springy `cubic-bezier(0.34,1.56,0.64,1)`.

---

## 9. Component cookbook

Ready-to-reuse recipes wired to the tokens. State classes are added by JS.

### Primary navy button — `.cp-btn-primary`

```css
.cp-btn-primary {
  background: var(--color-navy);
  color: #fff;
  font-family: var(--font-accent);
  font-size: clamp(14px, 1.8vw, 20px);
  font-weight: 700;
  border: none;
  border-radius: var(--btn-radius);
  padding: clamp(10px,1.2vh,16px) clamp(28px,4vw,56px);
  min-height: var(--size-btn-md);
  cursor: pointer;
  box-shadow: var(--shadow-navy);
  transition: background var(--dur-fast), transform var(--dur-fast), box-shadow var(--dur-fast);
}
.cp-btn-primary:hover  { background: var(--color-navy-light); transform: translateY(-2px); box-shadow: 0 6px 22px rgba(27,58,107,0.28); }
.cp-btn-primary:active { transform: translateY(1px); box-shadow: var(--shadow-navy); }
.cp-btn-primary:focus-visible { outline: 3px solid var(--ink-a50); outline-offset: 3px; }
```

### Golden submit CTA — `.btn-submit`

```css
.btn-submit {
  background: var(--color-submit);
  color: var(--color-navy);
  font-family: var(--font-accent);
  font-size: var(--font-size-game-body);
  font-weight: var(--font-weight-body);
  border: none;
  border-radius: var(--btn-radius);
  padding: var(--space-sm) clamp(36px,4vw,64px);
  min-height: var(--size-btn-lg);
  cursor: pointer;
  box-shadow: var(--shadow-submit);
  transition: background var(--dur-fast), transform var(--dur-fast), opacity var(--dur-fast), box-shadow var(--dur-fast);
}
.btn-submit:hover:not(:disabled)  { background: var(--color-submit-hover); transform: translateY(-1px); }
.btn-submit:active:not(:disabled) { transform: translateY(1px); }
.btn-submit:disabled { opacity: 0.42; cursor: not-allowed; box-shadow: none; transform: none; }
```

### Icon button — `.icon-btn`

```css
.icon-btn {
  width: var(--size-icon-md); height: var(--size-icon-md);
  min-width: 44px; min-height: 44px;
  border: none; background: transparent; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; flex-shrink: 0; padding: 0;
  transition: background-color var(--dur-fast), transform var(--dur-fast), box-shadow var(--dur-fast);
}
.icon-btn:hover  { background-color: var(--gl-sky); }
.icon-btn:active { background-color: var(--gl-yellow); transform: scale(0.93); }
```

### Card — `.cp-number-card`

```css
.cp-number-card {
  background: var(--color-board);
  border: 1.5px solid rgba(27,58,107,0.13);
  border-radius: var(--card-radius);
  padding: clamp(10px,1.4vh,20px) clamp(8px,1.2vw,20px);
  font-family: var(--font-accent);
  font-weight: 700;
  color: var(--color-navy);
  box-shadow: 0 2px 10px var(--ink-a07);
  transition: box-shadow 200ms ease, transform 200ms ease;
}
.cp-number-card:hover { box-shadow: 0 4px 18px rgba(27,58,107,0.13); transform: translateY(-2px); }
/* Winner / highlighted variant: invert to navy fill */
.cp-reveal-card--winner { background: var(--color-navy); border-color: var(--color-navy); box-shadow: 0 4px 18px rgba(27,58,107,0.28); }
```

### Badge — `.cp-badge`

```css
.cp-badge {
  display: inline-block;
  background: var(--color-soft-blue);
  border: 1px solid var(--ink-a14);
  border-radius: var(--radius-pill);
  padding: 5px 14px;
  font-family: var(--font-accent);
  font-size: var(--font-xs);
  font-weight: 600;
  color: var(--color-navy-light);
}
```

### Modal — overlay + card + close

```css
.modal-overlay {
  position: fixed; inset: 0; z-index: var(--z-popups);
  background: var(--color-overlay);
  backdrop-filter: blur(7px); -webkit-backdrop-filter: blur(7px);
  display: flex; align-items: center; justify-content: center;
  padding: clamp(16px,4vw,40px);
  opacity: 0; visibility: hidden;
  transition: opacity 220ms ease, visibility 220ms ease;
}
.modal-overlay.modal--open { opacity: 1; visibility: visible; }
.modal-card {
  background: #fff; border-radius: 24px;
  padding: clamp(20px,3.5vw,30px);
  max-width: 560px; width: 100%; position: relative;
  border: 2px solid var(--color-border);
  transform: scale(0.94) translateY(10px);
  transition: transform 320ms cubic-bezier(0.34,1.56,0.64,1);
}
.modal-overlay.modal--open .modal-card { transform: scale(1) translateY(0); }
.modal-close {
  position: absolute; top: clamp(20px,3.5vw,30px); right: 30px;
  border: none; background: var(--color-soft-blue); border-radius: 50%;
  display: flex; align-items: center; justify-content: center; cursor: pointer;
}
```

### Feedback toast — `.feedback-toast` (correct default / `--wrong`)

```css
.feedback-toast {
  background: var(--color-correct-bg);
  border: 1.5px solid var(--color-correct);
  border-radius: 14px;
  padding: clamp(12px,1.5vw,16px) clamp(16px,2vw,22px);
  font-family: var(--font-accent);
  color: var(--color-correct-text);
  line-height: 1.5; max-width: 55%;
}
.feedback-toast--wrong {
  background: var(--color-wrong-bg);
  border-color: var(--color-wrong);
  color: var(--color-wrong-text);
}
```

### Progress track + dots

```css
.progress-track { background: #F5F5F5; border-radius: 50px; padding: clamp(8px,1vw,12px) clamp(12px,1.5vw,20px); display: flex; align-items: center; }
.progress-dots  { display: flex; align-items: center; gap: clamp(6px,0.8vw,10px); }
.dot {
  width: clamp(14px,2vw,22px); height: clamp(14px,2vw,22px); border-radius: 50%;
  background: var(--color-dot-empty);
  transition: background var(--dur-normal), transform var(--dur-normal);
}
.dot--active { background: var(--color-dot-active); }   /* completed */
```

### Drag tile — `.cp-ds-tile` (with states)

```css
.cp-ds-tile {
  min-width: clamp(100px,16vw,160px); min-height: clamp(60px,8vh,90px);
  background: var(--color-board);
  border: 2.5px solid var(--ink-a18);
  border-radius: 16px;
  font-family: var(--font-accent); font-weight: 800; color: var(--color-navy);
  display: flex; align-items: center; justify-content: center;
  cursor: grab; user-select: none; touch-action: none;
  box-shadow: 0 3px 14px var(--ink-a10);
  animation: cpTileWiggle 3s ease-in-out infinite;
  transition: box-shadow 180ms ease, border-color 180ms ease;
}
.cp-ds-tile--dragging { opacity: 0.35; animation: none !important; cursor: grabbing; }
.cp-ds-tile--wrong    { border-color: var(--color-wrong) !important; background: var(--color-wrong-bg) !important; animation: cpShake 0.5s ease-out !important; }
.cp-ds-tile--locked   { animation: none !important; cursor: default;
  border-color: var(--color-correct) !important; background: var(--color-correct-bg) !important;
  box-shadow: 0 0 0 6px rgba(34,197,94,0.20), 0 4px 18px rgba(34,197,94,0.24) !important; }
```

### Drop slot — `.cp-ds-slot`

```css
.cp-ds-slot {
  min-height: clamp(80px,12vh,120px); max-width: clamp(100px,18vw,180px);
  background: var(--ink-a04);
  border: 2.5px dashed var(--ink-a22);
  border-radius: 16px;
  display: flex; align-items: center; justify-content: center;
  transition: border-color 160ms ease, background 160ms ease;
}
.cp-ds-slot--hover  { border-color: var(--ink-a55); background: rgba(45,90,158,0.08); border-style: solid; }
.cp-ds-slot--locked { border-style: solid; border-color: transparent; background: transparent; }
```

### Option button — `.cp-ar-option`

```css
.cp-ar-option {
  background: var(--color-board);
  border: 2px solid var(--ink-a18);
  border-radius: 12px;
  padding: clamp(12px,1.8vh,22px) clamp(8px,1.2vw,16px);
  font-family: var(--font-accent); font-weight: 600; color: var(--color-navy);
  cursor: pointer; transition: transform 0.12s, box-shadow 0.12s;
}
.cp-ar-option:hover            { transform: translateY(-2px); box-shadow: 0 4px 14px var(--ink-a14); }
.cp-ar-option--wrong           { border-color: var(--color-wrong); background: rgba(239,68,68,0.08); animation: cpArShake 0.4s ease; }
.cp-ar-option--correct         { border-color: var(--color-correct); background: rgba(34,197,94,0.12); box-shadow: 0 0 0 3px rgba(34,197,94,0.30); animation: cpArPulse 0.5s ease forwards; }
```

**State coloring rule (accessibility):** never communicate correctness by color alone — pair the color with an icon, animation (shake/pulse), or text. Correct = green family, wrong = red family, both with `!important` state classes so they override theme accents.

---

## 10. Animation catalog

Global keyframes live in `css/core/animations.css`; component ones in `css/content/pages.css`.

| Keyframe | Duration | Purpose |
|----------|----------|---------|
| `correctPulse` | 0.65s | Green ring expands + fades on a correct answer |
| `cpTileWiggle` | 3s ∞ | Idle wiggle inviting drag on tiles |
| `cpShake` / `cpArShake` / `cpColShake` | 0.4–0.5s | Horizontal shake on wrong input |
| `cpArPulse` | 0.5s | Scale pulse on a correct option |
| `cpTileBounce` | 0.55s | Bounce when a tile locks correctly |
| `cpGoldGlow` / `cpGoldRing` | 1.4–1.5s | Expanding glow/ring on win highlights |
| `cpFloat` | 3s ∞ | Gentle vertical float on hook cards |
| `confetti-fall` | 3s | Confetti falls + rotates 720° + fades |
| `confetti-stay` | varies | Lingering confetti variant |
| `loader-tap-pulse` | 1.1s ∞ | "Tap to Begin" text pulse |
| `handNudgeTap` | 3.6s | Hand hint taps twice then fades |

```css
@keyframes correctPulse {
  0%   { box-shadow: 0 0 0 0  rgba(34,197,94,0.5); }
  70%  { box-shadow: 0 0 0 14px rgba(34,197,94,0); }
  100% { box-shadow: 0 0 0 0  rgba(34,197,94,0); }
}
```

**Reduced motion:** respect it — e.g. `@media (prefers-reduced-motion: reduce) { .hand-nudge { display: none !important; } }`. Gate non-essential motion the same way in new games.

---

## 11. Responsive conventions

**Philosophy:** everything fluid via `clamp(min, vw, max)` — typography, spacing, sizes, chrome. Layouts use flex/grid with `gap`, never fixed widths.

**Breakpoints** (`css/core/responsive.css`):

| Query | Target |
|-------|--------|
| `≥1440px` | XL tablets / laptops (S8 Ultra, iPad Pro) |
| `1024–1440px` | Tablets landscape |
| `768–1024px` | Medium tablets (baseline) |
| `≤600px` + portrait | Phones portrait (compact chrome, decor hidden) |
| `≤480px` | Very small phones (grids wrap to 2×N) |
| landscape + `max-height:520px` | Phones landscape (minimal chrome) |
| aspect-ratio `4:3` / `16:10` | iPad family vs. Samsung/Lenovo tuning |

**Patterns:** rows = `display:flex; flex-wrap:wrap; gap:clamp(...); justify-content:center;` · place-value grid = `display:grid; grid-template-columns:repeat(6,1fr); gap:clamp(3px,0.45vw,6px);` · centered = `display:flex; align-items:center; justify-content:center;`

---

## 12. Offline & asset notes

- All fonts and assets are **bundled locally** (`assets/fonts/...`) — no external CDN, per the offline-first requirement. Keep it that way in new games.
- Scrollbars are globally hidden while preserving scroll (`scrollbar-width: none` + `::-webkit-scrollbar { display:none }`).
- `*, *::before, *::after { box-sizing: border-box; margin:0; padding:0; }` and `html, body { overflow: hidden; }` form the reset.

---

*Generated from `css/core/style.css` (`:root`, lines 38–181) and `css/content/style.css` (shared tokens, lines 11–22), with component recipes drawn from `css/core/style.css` and `css/content/pages.css`. Values transcribed verbatim; component blocks are reference recipes, not byte-for-byte copies of every line.*
