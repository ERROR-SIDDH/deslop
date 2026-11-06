# Colour usage: the rules a design director enforces

The palette is half the job; *where* colour goes is the other half. A Fortune-50 page and a template can share the exact same hex and still look a world apart. The difference is the budget, the placement and the states.

## 0. Generate, don't hand-pick

```bash
node <skill-dir>/scripts/derive-palette.mjs <brand-hex|none> <A|B|C> [--format=hex|oklch|hsl]
```

The script works in OKLCH and does the following:
- Keeps the brand **hue**.
- Caps the **chroma** per house style (A 0.20, B 0.13, C 0.17).
- Deepens the **lightness** until white text passes 4.5:1.
- Builds a tinted neutral ramp (A cool, B neutral, C warm).
- Derives the dark mode separately (lighter accent, about 20% less chroma). It is not an inversion.
- Prints a contrast report.

Beyond the shadcn set, the generator emits the tokens the rules below need:
- **Primary states**: `--primary-hover`, `--primary-active`.
- **Selected state**: `--primary-subtle`, `--primary-subtle-foreground`.
- **Disabled text**: `--disabled-foreground`.
- **Status**: `--destructive`/`--success`/`--warning` for fills and dots, `*-text` variants that are safe at 4.5:1 for words, and `--warning-foreground` for text on a warning fill.
- **Charts**: `--chart-1` (accent) and `--chart-2..4` (neutrals) in both modes.
- **Radius scale**: `--radius-sm/md/lg/xl`.
- **Style B only**: `--brand`.

Map the ones you use in the Tailwind config. Unused ones can be dropped.

Use `--format=hsl` for shadcn v3 channel variables (`--primary: 262 50% 45%`), `oklch` for Tailwind v4 / shadcn v4, and `hex` otherwise. Paste the output and don't hand-tune it unless a check fails.

**Why the Tailwind defaults read as cheap.** Measured on 2026-11-06:

| Tailwind default | Contrast with white text | OKLCH L / C | Verdict |
|---|---|---|---|
| violet-500 #8b5cf6 | **4.23 ✗** | 0.61 / 0.22 | fails AA, neon chroma |
| indigo-500 #6366f1 | **4.47 ✗** | 0.59 / 0.20 | fails AA |
| blue-500 #3b82f6 | **3.68 ✗** | 0.62 / 0.19 | fails AA |
| cyan-500 #06b6d4 | **2.43 ✗** | 0.71 / 0.13 | unusable for text or buttons |
| fuchsia-500 #d946ef | **3.46 ✗** | 0.67 / 0.26 | fails, and the chroma is extreme |
| indigo-600 #4f46e5 | 6.29 ✓ | 0.51 / 0.23 | passes, but too saturated for B/C |

**The AI-template signature** is a button at L≈0.6 and C≥0.2 with white text, which fails accessibility *and* looks loud. The derived primaries land around L 0.45–0.53 and C ≤ 0.13–0.20.

## 1. The colour budget (measure it on a screenshot)

| | A. Enterprise | B. Product-mono | C. Editorial |
|---|---|---|---|
| Neutral (bg, surfaces, text, borders) | ≥ 92% | ≥ 96% | ≥ 90% |
| Accent (brand hue) | ≤ 6% | ≤ 2% | ≤ 8% |
| Semantic (status only) | as needed | as needed | as needed |
| Distinct chromatic hues on a page | accent + semantic | accent + semantic | accent + semantic |

- **One accent hue**, and only one. A second brand colour appears only if brand guidelines mandate it, and then only in illustrations, never in UI chrome.
- **One neutral family** per codebase. Mixing `gray-*`, `slate-*`, `zinc-*` and `neutral-*` is a template tell, because the cool/warm drift reads as mud. Choose the ramp the generator produces.
- **One primary button per view.** A *view* is one content region: the hero, a section, a dialog, a page header, a form. If two primaries compete, demote one to secondary. The persistent nav action may stay primary only if it is the *same* action as the hero CTA (e.g. both "Start free trial"). Otherwise it is secondary.

## 2. Where the accent is allowed (the whitelist)

The accent goes on these and **nowhere else**:
1. The primary button: one per viewport.
2. Text links inside body copy. Nav links stay foreground.
3. The focus ring: `--ring`, 2px, offset 2px.
4. Selected or active state:
   - **A and C**: a `--primary-subtle` background, `--primary-subtle-foreground` text, and a 2px `--primary` indicator bar (left on vertical nav, bottom on tabs).
   - **B (mono)**: `--foreground` text at weight 500 plus a 2px `--foreground` bar. The accent stays out of nav in B.
   - **Fill vs bar**: a *vertical* sidebar item gets the fill (`--primary-subtle` in A/C, `--muted` in B) plus a left bar. A *horizontal* top bar or tab gets only the bottom bar and the text change, with no fill.
   - **B and the accent**: in B, `--brand` lives only in body links and `--chart-1`. A B app screen with neither, and therefore no accent at all, is correct. Drop unused tokens.
5. Controls in the *on* state: checkbox, radio, switch, slider fill, progress fill.
6. **One** data series, or the highlighted bar, in a chart.
7. Very small brand marks: the logo, a single "New" tag.

**Never on**:
- section or page backgrounds
- headline text, or any text larger than body except links
- card backgrounds, borders of regular cards, or icon tiles
- shadows or glows
- dividers, decorative shapes, or placeholder images
- more than one CTA per view

## 3. Text: exactly three levels

| Token | Use | Contrast floor |
|---|---|---|
| `--foreground` | headings, body, primary labels | 7:1 |
| `--muted-foreground` | secondary text, captions, placeholders, table meta | 4.5:1 |
| `--disabled-foreground` | disabled labels only | exempt (still legible) |

**Rules**
- **Emphasis**: use weight (500→600), never colour. No coloured words in headlines.
- **Brightness**: never pure #000 on #fff, or #fff on #000. Use the ramp ends, which the generator gives you.
- **Text over images**: no opacity-faded text. Use a solid scrim or put the text off the image.
- **Status text** (error, success) always pairs with an icon or a label, never colour alone.

## 4. Surfaces and elevation

**Light mode** has two surfaces:
- `--background`, plus `--card` for raised content.
- They are separated by a **1px `--border`, not a shadow**.
- Style C may use a white card on paper `--background`.

**Dark mode** steps up in lightness, using the generator's values:

| Level | Token | OKLCH L | Use |
|---|---|---|---|
| 0 | `--background` | 0.145 | page |
| 1 | `--card` | 0.18 | cards, sidebars |
| 2 | `--popover` | 0.21 | menus, popovers, dialogs |
| 3 | `--secondary` / hover | 0.24–0.27 | hover on level 1–2, inputs |

**Rules**
- **Depth**: at most 3 surface levels on a page. More levels means the layout needs restructuring, not more colour.
- **Fills**: a surface is never tinted with the accent. The one exception is `--primary-subtle` for the *selected* state.
- **Inverted bands** (`bg-foreground text-background`) are allowed once per page, as the closing CTA. Inside them, override `--ring` so focus stays visible.

## 5. Borders: two tokens, that's all

| Token | Use |
|---|---|
| `--border` | card edges, dividers, table rules, section separators |
| `--input` | form control edges: input, select, checkbox. Darker, so controls read as interactive. A: about 3:1, Carbon style. |

- Images and screenshots on any background get a `1px` border at `rgba(0,0,0,.08)` light or `rgba(255,255,255,.08)` dark, so their edges don't bleed.
- No coloured borders except the focus ring, the selected state and an error-state input (`--destructive`).

## 6. Interaction states (change lightness, never hue)

| Element | Rest | Hover | Active / pressed | Selected | Disabled | Focus-visible |
|---|---|---|---|---|---|---|
| Primary button | `--primary` | `--primary-hover` | `--primary-active` | n/a | 50% opacity, `cursor: not-allowed` | 2px `--ring`, 2px offset |
| Secondary button | `--background` + `--input` border | `--muted` fill | `--accent` fill | n/a | 50% opacity | ring |
| Ghost / tertiary | transparent | `--muted` fill | `--accent` fill | n/a | 50% opacity | ring |
| List row / nav item | transparent | `--muted` | `--accent` | per style, §2 item 4 | `--disabled-foreground` text | inset ring |
| Card (clickable) | `--card` + `--border` | border → `--input` (darker) | n/a | 1px → 2px `--primary` border, no layout shift (use an inset shadow) | n/a | ring |
| Link | `--primary` (B: `--brand`) | underline appears | n/a | n/a | n/a | ring |

The hover and pressed fills (`--muted` vs `--accent`, `--primary-hover` vs `--primary-active`) are generated to differ visibly. In B the primary is ink, so hover and press go *lighter*; the generator handles that. Give each state to the elements that actually have it: a landing page with no disabled controls needs no disabled styling.

**Banned states**: a hover glow, a hover lift (translate-y) with a coloured shadow, a hover gradient shift, a hover scale above 1.02, or a colour change *into* a different hue.

## 7. Semantic colours
- **Status only**: destructive, success, warning, and info (info usually = neutral or the accent).
- **Always** paired with an icon and text.
- **Fills vs words**: `--destructive`, `--success` and `--warning` are for fills, dots and icons. Status *words* use `--destructive-text`, `--success-text` and `--warning-text`, which are checked at 4.5:1. Warning yellow never carries text by itself. Text on a warning fill uses `--warning-foreground`.
- **Status badge pattern**: a neutral badge (`--muted` fill) with a 6px status-colour dot and the word in `--foreground`. It is calmer than coloured pills, and colour is never the only cue.
- **Banners and toasts**: a subtle background (L about 0.96 light / 0.25 dark), the semantic colour for the icon and title, and body text in `--foreground`.
- **Harmonise**: the generator gives them matching lightness and chroma so they don't fight the accent.
- **Charts**: never reuse a semantic colour as a categorical series.

## 8. Data visualisation
- **Default**: neutral series `--chart-2..4` plus **one** accent series `--chart-1` for the thing the chart is about. Both modes are generated.
- **Categorical**, when it is genuinely needed: at most 5 hues, at equal OKLCH lightness (about 0.65) and chroma (about 0.12), and never the gradient default rainbow.
- **Sequential**: one hue, lightness from 0.95 to 0.35.
- **Numbers**: tabular numerals and muted gridlines (`--border`), with no chart-area gradient fill.

## 9. Gradients: the narrow exception
A gradient is allowed only:
- as a **brand asset** the company already owns (Stripe's wave): one per page, in the hero art, never behind text
- as a **data scale** with a legend
- as a **functional fade**, e.g. scroll-edge masks from `--background` to transparent

Everything else (buttons, text, badges, icon tiles, borders, cards, section backgrounds) is solid.

## 10. Imagery and colour
- **Photography**: one consistent grade. Slightly desaturated and neutral-cool (A/B) or warm (C), with no colour-cast overlays.
- **Customer logos**: monochrome `--muted-foreground`, or `grayscale` with `opacity: .7`.
- **Illustrations**, if used at all: neutrals plus the accent, flat, and in one style across the site.
- **Product screenshots** must match the theme. No dark screenshot on a light page unless it is framed as a figure.

## 11. Dark mode is designed, not inverted
- **Text**: foreground at L about 0.93 (#ebebeb-ish), never pure white.
- **Accent**: lighter (L about 0.72) and lower chroma, so it doesn't vibrate on near-black.
- **Shadows**: they don't read on dark. Use level steps (§4) and borders.
- **Images**: may need a `1px` white/8% border, and a dimmed version (`brightness(.9)`) if they are very bright.
- **Same budget**: the colour budget is identical in both modes, so re-check it on a dark screenshot.
