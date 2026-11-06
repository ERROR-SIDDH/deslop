# deslop: design rules (compact)

Use these rules for all UI work. The page must look like a deliberate product from a top company (Stripe, Linear, IBM), not an AI template. Blue or purple is fine; the problem is how colour is treated.

## Never
- Gradient text (`bg-clip-text text-transparent`), or a gradient word in a headline.
- Blue→purple/pink gradients on buttons, badges, icon tiles, cards, borders or section backgrounds.
- Coloured glows or shadows (`shadow-purple-500/30`), blurred colour blobs, radial hero glows.
- Glassmorphism (`backdrop-blur` + `bg-white/10`). The only exception is a sticky header over scrolling content.
- Infinite animation (pulse, bounce, float, shimmer, gradient-shift, marquee), hover lift/zoom, parallax.
- Navy or purple dark backgrounds (#0f172a, #1e1b4b). Lavender-washed light backgrounds (#f5f3ff, #eef2ff).
- Poppins, Plus Jakarta Sans, Outfit, Space Grotesk or Montserrat as the main font. Weights 800–900.
- Title Case Headlines. Uppercase tracked eyebrows over every section. "✨ AI-Powered" pill badges.
- Emoji in headings, buttons, bullets or stats.
- Buzzwords: seamless, unlock, empower, supercharge, transform, revolutionize, effortless, cutting-edge, next-gen, game-changing, "in minutes", all-in-one.
- Fake proof: avatar stacks, "10,000+ users", "99.9%", five-star rows, testimonials without a real name, role and company.
- Fake dashboards with macOS traffic-light dots and gradient bars. Stock AI art: glowing brains, orbs, 3D blobs, Memphis people.
- Tailwind violet-500, indigo-500, blue-500 or cyan-500 buttons with white text (they fail WCAG AA).

## Choose one house style
- **A. Enterprise** (B2B sold through procurement, fintech, health): cool greys, one confident accent, IBM Plex Sans, display weight 300, 4px corners.
- **B. Product-mono** (self-serve SaaS, dev tools, AI): true neutrals, ink (near-black) primary buttons, accent only for links and one chart series, Geist or Inter, 8px controls, 12px cards.
- **C. Editorial** (consumer, brand-led): warm off-white #fbfaf8 and ink #1a1918, a deep brand colour on flat fills only, 6px controls, 10px cards.

Never mix styles.

## Colour
- **Neutral share**: at least 90% of the page (B: 96%). Use one accent hue only. Semantic colours (red, green, amber) are for status only.
- **Brand colour**: keep the hue but deepen it. White text on it must reach 4.5:1 (roughly OKLCH lightness ≤ 0.53, chroma ≤ 0.13–0.20). Example: #8B5CF6 → #5c39a9 for light mode, #ae99f9 for dark mode.
- **Accent allowed only on**: the primary button (one per section), body links, the focus ring, selected/on states, one chart series.
- **Accent never on**: backgrounds, headlines, cards or icon tiles.
- **Text**: exactly 3 levels (foreground, muted, disabled). Never pure #000 or #fff for text; use #121212 / #ededed.
- **Dark mode**: neutral #0a0a0a page, then #121212 cards, then #181818 popovers. Each raised surface is lighter. No shadows to separate surfaces. Lighter, softer accent.
- **Borders**: 1px only. `--border` for cards and dividers, `--input` (darker) for form controls.
- **States**: change lightness, never hue. Hover = slightly darker fill or border. Pressed = darker still. Focus = 2px ring, 2px offset. Disabled = 50% opacity.
- **Status badges**: neutral grey badge, a small coloured dot, and the plain word ("Paid", "Overdue").

## Type
- One family, plus a mono only for code or data. Sentence case everywhere.
- **Marketing scale**: display 64/64 (tracking −0.04em), h1 48/52, h2 36/40, h3 24/32, body 16/24 or 18/28.
- **App scale**: page title 24/32, section 16/24, body and table 14/20, labels 12/16.
- Weights 400 / 500 / 600 only. Hierarchy comes from size and weight, never colour.
- Prose capped at about 65 characters per line. `tabular-nums` on numbers, prices and tables.

## Shape, spacing, depth
- **Radius scale, 4 steps only**:

  | Style | sm | md | lg | xl |
  |---|---|---|---|---|
  | A | 2 | 4 | 4 | 4 |
  | B | 6 | 8 | 12 | 16 |
  | C | 4 | 6 | 10 | 12 |

- **Radius use**: buttons and inputs take md, cards lg, dialogs xl. Full pills only for tags, avatars and switches.
- **Nested corners**: when an inner element sits ≤ 8px from the outer edge, inner radius = outer − gap.
- **Spacing**: 4px grid (4, 8, 12, 16, 24, 32, 48, 64, 96, 128). Sections 96–128px tall on desktop, 64px on mobile. Container max width 1200px.
- **Controls**: 32 / 36–40 / 44px tall. Touch targets 44px on mobile.
- **Card padding**: 20–24px.
- **Shadows**: neutral, layered, ≤ 6% opacity, only on floating layers (menus, popovers, dialogs). In-flow cards get a 1px border instead.

## Choose the least decorated component
| Content | Use |
|---|---|
| Parallel features | bordered rows or a 2-column list, not 3 identical icon cards |
| One key feature | a large product screenshot plus a short list |
| KPIs | an inline stat row divided by 1px rules, not stat cards with icons |
| Records | a table with right-aligned tabular amounts, not floating cards |
| Comparisons | a table |
| Testimonials | one real quote with name, role and company |
| Logos | one monochrome row |
| Steps | a numbered list (01, 02) |
| Pricing | at most 3 columns; the recommended plan gets a 1px primary border plus a label |
| Next step | one primary button plus a text link |
| Upsell | a quiet text link |
| Empty state | text plus one action |
| Hero visual | the real product UI, or nothing |

Icons: one set, 1.5px stroke, 16–20px, foreground or muted colour, never inside coloured squares, only where they aid scanning.

## Layout
- **Marketing hero**: left-aligned, the headline names the category and outcome, one primary CTA plus a text link, a product figure beside or below.
- **App screens**: solid sidebar (6+ sections) or top bar (≤ 5). Page header = title + one primary action. No marketing sizes inside apps.
- **Section separation**: whitespace or a 1px rule, not alternating tinted backgrounds.

## Copy
- **Headline formula**: "[Category] for [concrete outcome]". Example: "Workflow automation for finance teams."
- **Subhead**: one sentence with 2–3 concrete verbs.
- **Buttons**: "Start for free", "Contact sales", "Book a demo". No arrow glyphs.
- **Section labels**: plain nouns (Pricing, Security, Integrations).
- **Never invent** customers, logos, metrics or testimonials. Remove or flag unverified ones.

## Before shipping, every answer must be yes
- Would this look at home next to linear.app, stripe.com or ibm.com?
- Is ≥ 90% of the page neutral, with one accent used only on whitelisted elements?
- One type family, sentence case, no gradient or emoji headline?
- One primary button per section, with visible hover and focus states?
- At most 4 radii from one scale, and 1px borders?
- Does nothing move on its own?
- Can every claim be backed up?
- Does contrast pass (body 7:1, secondary 4.5:1) in light and dark?
