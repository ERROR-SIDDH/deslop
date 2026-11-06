# The target system: MNC-grade tokens

These numbers come from IBM Carbon, GitHub Primer, Vercel Geist, Linear and Stripe (sources at the bottom). Choose **one house style**, apply all of its tokens, and do not mix styles.

## 1. Choose a house style

| Style | Feels like | Use when | Neutral | Accent |
|---|---|---|---|---|
| **A. Enterprise** | IBM, SAP, Atlassian | B2B, fintech, healthcare, gov, data-heavy | cool grey (Carbon Cool Gray) | one confident accent, used for actions only: blue by default, or the brand hue |
| **B. Product-mono** | Linear, Vercel, Raycast | dev tools, SaaS, AI products | true neutral | near-monochrome; accent ≤3% of pixels |
| **C. Editorial** | Stripe, Notion, Airbnb | consumer, marketplaces, brands with a story | warm off-white / ink | the brand hue, kept deep and saturated, on flat fills only |

**If the existing brand is purple or blue and must stay**, keep the hue and change the *treatment*:
- Use one solid accent shade. No gradient.
- Deepen it. Move off the Tailwind defaults (#8B5CF6, #6366F1, #3B82F6) to a darker, more specific value. Style C examples: indigo #4F46E5→#3E3A9E, violet #7C3AED→#5B3FD1, blue #3B82F6→#1F5BD8. Stripe's #635BFF works because everything around it is disciplined.
- Neutralise everything else: backgrounds, borders, text, cards.
- The accent appears on primary buttons, links, focus rings and one data series. It never appears on backgrounds.

**If the brand has no committed colour**, drop the purple and pick one of the accents below.

## 2. Colour tokens (CSS variables, shadcn-compatible names)

**Prefer generating these with `scripts/derive-palette.mjs`** (see color.md §0). It derives the same structure from the real brand colour and checks contrast. The blocks below are hand-tuned references for when there is no brand colour. Values are hex for portability. Convert to `oklch()` or HSL channels if the project's existing `:root` uses that form. Keep the project's format.

### Style A: Enterprise
```css
:root {
  --background: #ffffff; --foreground: #161616;
  --muted: #f4f4f4; --muted-foreground: #525252;
  --card: #ffffff; --card-foreground: #161616;
  --popover: #ffffff; --popover-foreground: #161616;
  --border: #e0e0e0; --input: #8d8d8d; --ring: #0f62fe;
  --primary: #0f62fe; --primary-foreground: #ffffff;   /* Carbon Blue 60 */
  --secondary: #393939; --secondary-foreground: #ffffff;
  --accent: #f4f4f4; --accent-foreground: #161616;
  --destructive: #da1e28; --success: #198038; --warning: #f1c21b;
  --radius: 4px;
}
.dark {
  --background: #161616; --foreground: #f4f4f4;
  --muted: #262626; --muted-foreground: #c6c6c6;
  --card: #262626; --card-foreground: #f4f4f4;
  --popover: #393939; --popover-foreground: #f4f4f4;
  --border: #393939; --input: #6f6f6f; --ring: #ffffff;
  --primary: #4589ff; --primary-foreground: #161616;
  --secondary: #6f6f6f; --secondary-foreground: #ffffff;
  --accent: #393939; --accent-foreground: #f4f4f4;
  --destructive: #fa4d56;
}
```

### Style B: Product-mono
```css
:root {
  --background: #ffffff; --foreground: #171717;
  --muted: #f5f5f5; --muted-foreground: #666666;
  --card: #ffffff; --card-foreground: #171717;
  --popover: #ffffff; --popover-foreground: #171717;
  --border: #ebebeb; --input: #e0e0e0; --ring: #171717;
  --primary: #171717; --primary-foreground: #ffffff;   /* the CTA is ink, not colour */
  --secondary: #f5f5f5; --secondary-foreground: #171717;
  --accent: #f5f5f5; --accent-foreground: #171717;
  --brand: #5e6ad2;   /* one muted accent: links, focus, one chart series; ≤3% of pixels */
  --destructive: #e5484d; --success: #30a46c;
  --radius: 8px;
}
.dark {
  --background: #0a0a0a; --foreground: #ededed;
  --muted: #1a1a1a; --muted-foreground: #a1a1a1;
  --card: #111111; --card-foreground: #ededed;
  --popover: #1a1a1a; --popover-foreground: #ededed;
  --border: rgba(255,255,255,0.08); --input: rgba(255,255,255,0.14); --ring: #ededed;
  --primary: #ededed; --primary-foreground: #0a0a0a;
  --secondary: #1f1f1f; --secondary-foreground: #ededed;
  --accent: #1f1f1f; --accent-foreground: #ededed;
  --brand: #7c86e0;
  --destructive: #ff6369;
}
```

### Style C: Editorial
```css
:root {
  --background: #fbfaf8; --foreground: #1a1918;      /* warm paper + ink, never #fff/#000 */
  --muted: #f2f0ec; --muted-foreground: #6b6862;
  --card: #ffffff; --card-foreground: #1a1918;
  --popover: #ffffff; --popover-foreground: #1a1918;
  --border: #e6e3dd; --input: #d6d2ca; --ring: #3e3a9e;
  --primary: #3e3a9e; --primary-foreground: #ffffff;  /* deepened brand hue, swap per brand */
  --secondary: #1a1918; --secondary-foreground: #fbfaf8;
  --accent: #f2f0ec; --accent-foreground: #1a1918;
  --destructive: #c4321b; --success: #2f7a4a;
  --radius: 6px;
}
.dark {
  --background: #121110; --foreground: #f2f0ec;
  --muted: #1c1b19; --muted-foreground: #a8a49c;
  --card: #1c1b19; --card-foreground: #f2f0ec;
  --popover: #262421; --popover-foreground: #f2f0ec;
  --border: #2e2c29; --input: #3a3834; --ring: #a9a5f0;
  --primary: #a9a5f0; --primary-foreground: #121110;
  --secondary: #f2f0ec; --secondary-foreground: #121110;
  --accent: #262421; --accent-foreground: #f2f0ec;
  --destructive: #f2765f;
}
```

**Colour rules**
- **Text contrast**: body text at least 7:1; secondary text at least 4.5:1. Check every pair you change.
- **Dark-mode depth**: each raised surface is a step *lighter*. Shadows do not separate surfaces in dark mode.
- **Status colours** are for status only, never decoration.
- **Charts**: one accent series plus neutrals. Hue only when the data is categorical.

## 3. Typography

**Families**
- Use one family, plus a mono only if the product shows code or data.
- If the project already uses a licensed brand font, keep it.
- Otherwise choose by house style:

| Style | Family | Fallback (free) |
|---|---|---|
| A. Enterprise | IBM Plex Sans + IBM Plex Mono | the same; free on Google Fonts |
| B. Product-mono | Geist + Geist Mono, or Inter Display / Inter | the same; free |
| C. Editorial | Söhne / GT America (licensed) | Inter Tight for UI; an optional serif (Newsreader / Source Serif 4) for long-form headlines only |

**Banned as the primary face**: Poppins, Plus Jakarta Sans, Outfit, Space Grotesk, Montserrat, and an unstyled `ui-sans-serif`. These are the AI-template signature.

**Scale**: 1.25 major-third, desktop. The final column is tracking.

| Token | Size / line height | Weight | Tracking |
|---|---|---|---|
| display | 64/64 (clamp 40→64) | A: 300 · B: 600 · C: 500 | -0.04em |
| h1 | 48/52 | A: 400 · B: 600 · C: 500 | -0.035em |
| h2 | 36/40 | A: 400 · B: 600 · C: 500 | -0.025em |
| h3 | 24/32 | 500–600 | -0.015em |
| h4 | 20/28 | 600 | -0.01em |
| body-lg | 18/28 | 400 | 0 |
| body | 16/24 | 400 | 0 |
| small | 14/20 | 400 | 0 (Carbon: +0.01em) |
| caption / label | 12/16 | 500 | 0.01em; uppercase only for table headers |

**In-app scale.** Dashboards, settings and other product screens use a denser scale. Never use marketing display sizes inside an app.

| Token | Size / line height | Weight | Tracking |
|---|---|---|---|
| page title | 24/32 | 600 (A: 400) | -0.015em |
| section title | 16/24 | 600 | -0.005em |
| body / table | 14/20 | 400 | 0 |
| label / button | 14/20 | 500 | 0 |
| meta / caption | 12/16 | 500 | 0.01em |
| table header | 12/16, `--muted-foreground`, sentence case (uppercase + 0.04em allowed in A only) | 500 | 0.01em |
| stat value | 24/32 or 28/36, tabular-nums | 600 (A: 400) | -0.02em |

**Type rules**
- **Hierarchy comes from size and weight contrast, not colour.** Headline colour = foreground. Never use gradient text.
- **Measure**: prose capped at about 65ch (`max-w-[65ch]`). Hero subhead about 50ch.
- **Case**: sentence case for every headline and button. Title Case is a slop tell.
- **Eyebrows**: at most one per page, or none.
- **Numbers**: `font-variant-numeric: tabular-nums` on stats, prices and tables.
- **Weights**: 400, 500 and 600. Use 700 rarely. Never use 800 or 900.

## 4. Spacing and layout
- **Base unit**: 4px. The only steps are 4, 8, 12, 16, 24, 32, 48, 64, 96, 128.
- **Containers**: 1200px max for marketing (Carbon goes to 1312px). Padding 24px on mobile and 32px from md upward.
- **Section rhythm**: 96–128px vertical padding on desktop and 64px on mobile. The same value is used everywhere.
- **Grid**: 12 columns. Break symmetry deliberately, e.g. a 5/7 split instead of a centred stack, and features as a 2-up with one large figure instead of 3 identical cards.
- **Alignment**: left-align hero text on product sites. Centre only short marketing statements.

## 5. Radius, borders, depth

The full per-component spec (radius scale, border and stroke widths, control heights, padding, elevation by object) is in `components.md` §2–§6. This section is the summary.

**Radius by house style**

| Style | Controls | Cards | Modals |
|---|---|---|---|
| A. Enterprise | 4px (or 0) | 4px | 4px |
| B. Product-mono | 8px | 12px | 16px |
| C. Editorial | 6px | 10px | 12px |

**Radius rules**
- Pills (`9999px`) are for tags/badges and segmented controls only, never for primary buttons in Style A.
- Nested radius = outer minus gap, for tight nesting (≤ 8px) only. See components.md §2.

**Borders and shadows**
- **Borders**: 1px only. Use `--border`, or white/black at 6–10% alpha. Prefer a border to a shadow for in-flow cards.
- **Neutral shadows**, layered, at most 6% opacity per layer, and only on things that float (menus, popovers, modals, sticky headers):
  - `--shadow-sm: 0 1px 2px rgba(0,0,0,.06);`
  - `--shadow-md: 0 1px 1px rgba(0,0,0,.02), 0 4px 8px -4px rgba(0,0,0,.04), 0 16px 24px -8px rgba(0,0,0,.06);`
  - `--shadow-lg: 0 1px 1px rgba(0,0,0,.02), 0 8px 16px -4px rgba(0,0,0,.04), 0 24px 32px -8px rgba(0,0,0,.06);`
- **Banned**: coloured shadows, glows, `backdrop-blur` on surfaces that do not overlap content. The one exception is a sticky header over scrolled content: `sticky top-0 backdrop-blur-md`, with the background at 80% opacity. With hex variables, Tailwind's `/80` won't work, so use `background: color-mix(in srgb, var(--background) 80%, transparent)`. The scanner ignores blur on `sticky`/`fixed` lines.

## 6. Motion
- **Durations**: 100–150ms for micro interactions (hover, press), 200–250ms for enter, 150ms for exit, 400ms maximum for large layout changes.
- **Easing**: enter `cubic-bezier(0, 0, 0.38, 0.9)`, standard `cubic-bezier(0.2, 0, 0.38, 0.9)` (Carbon productive).
- **Default is stillness.** No infinite animations (pulse, float, shimmer, gradient-shift, marquee), no parallax, no scroll-jacking.
- **Reveal-on-scroll**: at most one subtle fade/translate of 8px or less, only once, and disabled under `prefers-reduced-motion`.

## 7. Imagery and iconography
- **Show the product.** Use real UI screenshots with realistic data (real-looking names, IDs, dates, amounts). Frame them in a thin 1px border at the card radius, with no device chrome and no traffic-light dots.
- **No AI stock imagery.** That means no glowing brains, circuits, orbs, 3D blobs or corporate-Memphis people. If you have no product shot, use typography and whitespace. That is what premium looks like.
- **Icons**:
  - One set, at one stroke width (1.5px) and one size (16 or 20px).
  - Icons in the foreground or muted colour, never inside gradient squares.
  - Use icons only where they aid scanning: nav, buttons, lists. Feature cards are allowed to have no icon.
- **Logos**: customer logos are monochrome (`grayscale opacity-60`) and evenly sized.

## Sources
carbondesignsystem.com (color, type sets, spacing, 2x grid, motion) · primer.style/foundations + primer/primitives tokens · vercel.com/geist (colors, typography, materials) + vercel.com/design.md · linear.app/now/how-we-redesigned-the-linear-ui · atlassian.design/foundations/elevation · live computed styles of linear.app and stripe.com (2026-11-06).
