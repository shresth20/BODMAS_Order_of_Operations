# COLOR THEMING PROMPT — Port the MT06A01_L01_S07 color system to another game

> Paste everything below this line into a Claude Code session opened in the target game's folder.
> Reference implementation: `MT06A01_L01_S07/css/core/style.css` (tokens) and `MT06A01_L01_S07/css/content/style.css` (per-level themes + sentence colors).

---

## TASK

Re-style this game so its color grading, element styling, and number-sentence color combinations exactly match the MT06A01_L01_S07 design system described below. Do **not** change any pedagogy, content text, logic, layout structure, or `core.json`. Colors, gradients, shadows, borders, and fonts only.

## HARD RULES

1. **Tokens first, hexes never.** Define all colors as CSS custom properties in `:root` (Layer 1 below), then reference tokens everywhere. A raw hex is only allowed for the pre-computed "deep"/"shadow" shades listed in the theme table.
2. **One signature hue per level/section.** Every level (or game section) owns exactly ONE hue from the global palette and applies it consistently to the same set of elements (see Layer 2). Never mix two accent hues inside one level's chrome.
3. **Operator colors are global, not per-theme.** The number-sentence color combination (Layer 3) is identical in every level, regardless of the level's accent. Never recolor an operator to match the level theme.
4. **Keep the existing DOM.** Restyle existing classes; only add modifier classes if an element type has no hook.
5. Offline-only: no external fonts/CDNs beyond what the game already ships.

---

## LAYER 1 — Global design tokens (put in the game's root/core stylesheet `:root`)

```css
/* ── Global palette ── */
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
--gl-ink-2:  rgba(31, 80, 127, 0.62);   /* secondary text */
--gl-ink-3:  rgba(31, 80, 127, 0.36);   /* tertiary text  */
--gl-line:   rgba(31, 80, 127, 0.14);   /* hairlines/dividers */

/* ── Accent family (set to the game's PRIMARY hue; default orange) ── */
--accent:      #FFA93A;
--accent-deep: #E5891A;
--accent-soft: rgba(255, 169, 58, 0.12);
--accent-line: rgba(255, 169, 58, 0.45);
--accent-glow: rgba(255, 169, 58, 0.40);

/* ── Semantic colors ── */
--color-bg: #FFFEF6;              /* app background — warm off-white */
--color-board: #FFFFFF;           /* cards / boards */
--color-navy: #1B3A6B;            /* primary text */
--color-navy-light: #2D5A9E;
--color-submit: #F5B61A;          /* submit yellow */
--color-submit-hover: #E5A810;
--color-correct: #22C55E;  --color-correct-bg: #F0FDF4;  --color-correct-text: #15803D;
--color-wrong:   #EF4444;  --color-wrong-bg:   #FFF1F1;  --color-wrong-text:   #B91C1C;
--color-dot-active: #FCB717;  --color-dot-empty: #D9D9D9;
--color-highlight: #FDE68A;
--color-border: #BDBDBD;
--color-soft-blue: #F0F5FF;  --color-panel-soft: #EEF3FA;
--color-overlay: rgba(15, 30, 60, 0.42);
--color-shadow-lg: rgba(0,0,0,0.13);
--shadow-submit: 0 4px 18px rgba(245, 182, 26, 0.4);
--shadow-navy:   0 4px 18px rgba(27, 58, 107, 0.22);

/* ── Alpha ladders (use these instead of ad-hoc rgba) ── */
--ink-a04: rgba(27,58,107,.04); --ink-a07: rgba(27,58,107,.07); --ink-a08: rgba(27,58,107,.08);
--ink-a10: rgba(27,58,107,.10); --ink-a14: rgba(27,58,107,.14); --ink-a18: rgba(27,58,107,.18);
--ink-a22: rgba(27,58,107,.22); --ink-a40: rgba(27,58,107,.40); --ink-a45: rgba(27,58,107,.45);
--ink-a50: rgba(27,58,107,.50); --ink-a55: rgba(27,58,107,.55);
--white-a86: rgba(255,255,255,.86); --white-a88: rgba(255,255,255,.88);
--black-a22: rgba(0,0,0,.22); --black-a40: rgba(0,0,0,.40);

/* ── Shared fixed colors (characters / chalkboard scenes) ── */
--shared-student-blue-bg: #3BC6FF;  --shared-student-pink-bg: #FF6FA8;
--shared-student-blue: #3B82F6;     --shared-student-pink: #EC4899;
--shared-student-blue-dark: #2563EB; --shared-student-pink-dark: #F0529B;
--shared-chalkboard-bg: #3A6B44;    --shared-chalkboard-frame: #7B4F1A;
--shared-bubble-shadow: 0 4px 18px rgba(0,0,0,0.13);
--shared-card-shadow:   0 4px 16px rgba(0,0,0,0.10);
```

Fonts (keep whatever the game ships, mapped to the same roles):
- `--font-primary: 'Lilita One', system-ui, sans-serif` — display/headings/buttons
- `--font-accent: 'Nunito', system-ui, sans-serif` — body, scenarios, questions (weight 700 for prose)
- `--font-chalk: 'SketchChalk', cursive` — anything written on a chalkboard (with `--white-a88` chalk color + `text-shadow: 1px 1px 4px rgba(0,0,0,0.35)`)

## LAYER 2 — Per-level accent themes

Each level/section is assigned one row. If the target game has fewer sections, take rows from the top in order. Every hue has 4 companion values: **deep** (gradient end), **shadow-1** (button under-edge), **shadow-2** (next-btn under-edge), and a **wash** (page background gradient, light→slightly-darker tint of the hue).

| Level | Hue token | Base | Deep | Shadow-1 | Shadow-2 | Page wash (160deg / to bottom) |
|---|---|---|---|---|---|---|
| L1 | `--gl-orange` | #FFA93A | #F59624 / `--accent-deep` #E5891A | #E5891A | #E5891A | `#FFF8E8 → #FFF0C8` |
| L2 | `--gl-lilac` | #C48AFF | #A855F7 | #9B59D9 | #7E22CE | `#F8F0FF → #EFE1FF` |
| L3 | `--gl-sky` | #3BC6FF | #0EA5E9 | #0284C7 | #0369A1 | `#EFF9FF → #DBEEFF` |
| L4 | `--gl-mint` | #18D6A0 | #0FA878 | #059669 | #065F46 | `#F0FFF9 → #CCFBF1` |
| L5 | `--gl-blue` | #6F8BFF | #4F46E5 | #4338CA | #4338CA | `#F0F2FF → #E5E8FF` |
| L6 | `--gl-pink` | #FF6FA8 | #EC4899 | #DB2777 | #9D174D | `#FFF0F6 → #FFE0EE` |
| Practice/Quiz | `--color-submit` yellow | #F5B61A | #E5A810 | — | — | `#FFFCEB → #FFF8D0` |
| Welcome splash | purple | #7C3AED | #6D28D9 | — | — | gradient `135deg #7C3AED → #6D28D9` |

**Apply the level's hue to exactly these elements:**
1. **Page/intro background**: `background: linear-gradient(160deg, <wash-start> 0%, <wash-end> 100%)` (intro wraps use `to bottom` or `135deg`).
2. **Primary CTA button**: `background: linear-gradient(135deg, var(--hue) 0%, <deep> 100%); box-shadow: 0 6px 0 <shadow-1>;`
3. **Next button**: `background: linear-gradient(180deg, var(--hue) 0%, <deep> 100%); box-shadow: 0 5px 0 <shadow-2>;`
4. **Active progress dot**: `background: var(--hue); transform: scale(1.35);` (empty dots: `--color-dot-empty`).
5. **Card/caption borders**: `border: 3px solid var(--hue)` (panels: `2.5px`).
6. **Accent text/icons within that level** (rule highlights, key numbers): `color: var(--hue)`.
7. **Dashed guides / dotted trails within the level**: same hue.

**Never themed per level** (always the same): correct/wrong feedback colors, operator colors (Layer 3), body text navy, board white, app bg `--color-bg`.

## LAYER 3 — Number-sentence color combination (GLOBAL semantics)

In every math sentence / expression, color by role — identical across all levels:

| Role | Color | Notes |
|---|---|---|
| `×` multiply | `--gl-orange` | |
| `+` add | `--gl-mint` | |
| `−` subtract | `--gl-coral` | |
| `÷` divide | `--gl-sky` | |
| `( )` brackets | `--gl-lilac` | |
| `=` equals & numbers on dark/chalk boards | `white` / `--white-a88` | `text-shadow: 1px 2px 5px var(--black-a40)` |
| Numbers/text on light backgrounds | `--color-navy` | |
| Highlighted operand | `--color-highlight` (#FDE68A) background | |

**Operator pill/tile treatment** (interactive operator tokens on boards):
```css
background: transparent;
border-radius: 50%;
border: 3px solid var(--<op-hue>);
color: var(--<op-hue>);
box-shadow: 0 0 14px rgba(<op-hue-rgb>, 0.45);   /* glow */
text-shadow: 0 0 8px rgba(<op-hue-rgb>, 0.6);
font-family: 'Lilita One', var(--font-primary);
```

**Operator choice buttons** (light context): tinted gradient chip of the operator's hue, e.g. `×` → `linear-gradient(145deg, #FFF4E0, #FFE8B8)` with orange text/border; `−` → `linear-gradient(145deg, #FFE8E5, #FFD0CB)` with coral; `+` → mint at 12–24% alpha.

**Merging/active tile glow** (pulsing ring in the LEVEL hue, not operator hue):
```css
@keyframes tileGlow {
  from { box-shadow: 0 0 0 3px rgba(<level-hue>,0.4),  0 4px 12px var(--black-a22); }
  to   { box-shadow: 0 0 0 7px rgba(<level-hue>,0.68), 0 0 22px rgba(<level-hue>,0.42), 0 4px 12px var(--black-a22); }
}
```

**Feedback / comparison**:
- Correct: `--color-correct` border + `--color-correct-bg` fill + `--color-correct-text` text.
- Wrong: `--color-wrong` / `--color-wrong-bg` / `--color-wrong-text`.
- Dual comparison cards: "wrong-side" card border `#2F80ED` (blue) with radial tint `rgba(47,128,237,0.16)` over `linear-gradient(180deg, rgba(255,255,255,0.98), #F3F8FF)`; "right-side" card border `#F0529B` (pink) with `rgba(240,82,155,0.15)` tint over `…#FFF4FA)`.

## LAYER 4 — Element styling conventions

1. **3D press buttons** (all CTAs/next buttons): gradient face + hard under-edge `box-shadow: 0 5–6px 0 <shadow>`; `:hover` keeps/raises to `0 6px 0`; `:active` → `transform: translateY(4px); box-shadow: 0 2px 0 <shadow>;`. Disabled: flatten to `0 2px 0 var(--black-a22)`.
2. **Cards/boards**: white (or `--white-a86/88`) fill, large radius (20–30px), `--shared-card-shadow`, optional `inset 0 1px/2px 0 rgba(255,255,255,0.9)` top highlight.
3. **Expanded speech bubbles**: `background: rgba(255,255,255,0.96); border-width: 3px; border-radius: 30px; box-shadow: 0 18px 44px var(--ink-a18), 0 4px 0 rgba(255,255,255,0.9) inset; backdrop-filter: blur(8px);` — border color = speaker color (`--shared-student-blue-dark` / `--shared-student-pink-dark`).
4. **Chalkboard scenes**: bg `--shared-chalkboard-bg`, frame `--shared-chalkboard-frame`, all writing `--white-a88` in `SketchChalk`, `letter-spacing: 0.1em`, `text-shadow: 1px 1px 4px rgba(0,0,0,0.35)`.
5. **Shadows**: only from the token set (`--black-a22`, `--ink-a14/18`, `--shared-*-shadow`, `--shadow-navy/submit`). No new ad-hoc rgba shadows.
6. **Overlays**: `--color-overlay` behind popups.

## WORKFLOW

1. Read the target game's stylesheets; inventory every hardcoded color (`grep -oE '#[0-9A-Fa-f]{3,8}|rgba?\([^)]*\)'` per file, deduped).
2. Add the Layer-1 token block to the game's root stylesheet (merge with existing `:root`, don't duplicate).
3. Map each game section → a theme row (Layer 2) and record the mapping in a comment at the top of the content stylesheet.
4. Replace colors class-by-class following Layers 2–4. Old hex → nearest token; if a color has no role in this system, ask before keeping it.
5. Recolor all math sentences/operators per Layer 3.
6. Verify: (a) no raw hexes left outside the token block and theme-table shades; (b) every level's CTA/next/dots/borders share one hue; (c) `×+−÷()` colors identical across levels; (d) correct/wrong colors untouched by themes; (e) game still runs offline with zero console errors.

## ACCEPTANCE CHECKLIST

- [ ] `:root` contains the full Layer-1 token set
- [ ] Each level uses exactly one signature hue on: wash, CTA, next-btn, dots, borders, accent text
- [ ] Operator colors are global: × orange, + mint, − coral, ÷ sky, brackets lilac
- [ ] Buttons use the 3D press treatment (gradient + `0 6px 0` under-edge, `translateY(4px)` on active)
- [ ] Correct = #22C55E family, Wrong = #EF4444 family, everywhere
- [ ] Body text `--color-navy`, secondary `--gl-ink-2`, hairlines `--gl-line`
- [ ] App background `--color-bg` (#FFFEF6); page washes from the theme table
- [ ] No pedagogy/content/logic/`core.json` changes; visual-only diff
