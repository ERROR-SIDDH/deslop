---
name: deslop
description: Turns AI-generated "slop" websites into MNC-grade design. Typical targets are Lovable, v0, Bolt and Cursor landing pages and shadcn/Tailwind apps with blue-purple gradients, gradient headline text, glows, glassmorphism, sparkle badges, emoji and 3-card icon grids. The skill audits the site (static scan plus live browser fingerprint), picks a house style (Enterprise, Product-mono or Editorial), generates an accessible OKLCH palette from the brand colour, and enforces a colour budget and accent whitelist. It also picks the right component for each piece of content (rows, tables or cards), applies exact radius, border-width and control-size specs, ports type, spacing, depth, motion, imagery and copy, and then verifies the result. Use it when the user says a design looks AI-made, cheap, generic, templated, "too purple/blue", "like every Lovable site", or asks to make it look premium, enterprise, corporate, Fortune-500, Apple/Stripe/Linear-level. Also use it on /deslop.
---

# deslop

You are the head of UI/UX for a design org that ships for Fortune-50 companies. Your job is to take a page that looks generated and make it look *decided*.

The studied finding behind this skill: **the hue is not the problem; the treatment is.** Stripe is 97% indigo and looks premium. A Lovable template in the same indigo looks cheap because of gradient text, glows, blobs, pill-everything, stock fonts, emoji and icon confetti. So you don't just recolour. You remove the tells and impose a system.

References. Read all four before porting:
- `references/slop-catalog.md`: the 24 tells, with field evidence.
- `references/mnc-system.md`: house styles, type, spacing, motion and imagery.
- `references/color.md`: palette generation, colour budget, accent whitelist, states, surfaces and dark mode.
- `references/components.md`: which object to use for which content, plus radius, border-width, control-size and padding specs per style.

## Running in any agent

This skill uses the open Agent Skills format. It works the same in Claude Code, Codex, Antigravity, Lovable, Cursor, Windsurf, Copilot and Gemini CLI. `<skill-dir>` means the folder that contains this file. Use the first option that is available:

1. **deslop MCP tools are connected** (`deslop_scan`, `deslop_palette`, `deslop_audit_script`, `deslop_reference`): call them wherever a step below runs a script.
2. **You can run shell commands**: run the scripts with `node` (version 18 or later), as written below.
3. **You cannot run code** (Lovable, Bolt, v0 and other web builders): skip the scripts.
   - Use `references/slop-catalog.md` as the audit checklist.
   - For tokens, start from the hand-tuned blocks in `references/mnc-system.md` §2, then adapt the brand colour by hand with the caps in `references/color.md` §0: keep the hue, OKLCH lightness ≤ 0.53, chroma ≤ the style cap, white text at 4.5:1 or better.
   - The review gate in step 4 is mandatory either way.

The live fingerprint needs any browser tool that can execute JavaScript on a page. Without one, skip it and say so.

## Workflow

### 1. Audit (measure before you touch anything)

- **Static scan** (always):
  ```bash
  node <skill-dir>/scripts/slop-scan.mjs <project-src-dir>
  ```
  It prints every tell as `file:line` with its fix, plus a weighted total.
- **Live fingerprint** (when a browser tool is available and the site runs or is deployed):
  - Inject the contents of `scripts/slop-audit.js` (or the text returned by `deslop_audit_script`) on the rendered page, using your browser tool's JavaScript execution or the DevTools console.
  - It returns a `slopScore` from 0–100 and a `verdict`: `clean` below 25, `borderline` from 25 to 49, `slop` from 50.
  - Calibration: Linear about 11, Stripe about 39, typical Lovable/v0 pages 74–99.
  - It also returns `budget`: `accentAreaPct`, `chromaticHueFamilies` and `distinctRadii`. Compare these with color.md §1 and components.md §2.
- **Screenshot** the hero and one or two sections, in both light and dark mode if both exist.
- **Inventory the design entry points.** Look for:
  - `tailwind.config.*` or the `@theme` block in CSS
  - `globals.css` / `index.css` (`:root` and `.dark` variables)
  - the font loading (`layout.tsx`, `index.html`, `@import`)
  - `components/ui/*` (shadcn)
  - hero and landing section components

  Porting the tokens at the source fixes most of the page at once. Do that before editing components one by one.

Report the audit (to the user, or to the caller if you are a sub-agent) as a short ranked list of the loudest tells, with the counts. Without a browser, skip the fingerprint and screenshots and say so in the final report.

The scanner is a floor, not a verdict. A 0 means no *known* pattern matched. It cannot judge the colour budget, interaction states, object choice or hierarchy. The live audit's `budget` covers part of that, and the review gate in step 4 covers the rest.

### 2. Decide the direction (one decision, then commit)

Choose a house style from `references/mnc-system.md` §1. Base the choice on the product domain:
- **A. Enterprise**: B2B, fintech, health, gov, data.
- **B. Product-mono**: dev tools, SaaS, AI.
- **C. Editorial**: consumer, marketplace, brand-led.

Decide the brand colour:
- **The brand is blue or purple and must stay**: keep the hue, deepen it, use it solid, and confine it to actions, links, focus rings and one data series.
- **No committed brand**: replace it with the house style's accent.

**Tie-break** when a product fits two styles (e.g. "B2B SaaS", or invoicing for freelancers): decide by how it is bought.
- Self-serve, by any business buyer (developers, product teams, freelancers, SMBs, agencies) → **B**.
- Sales-led, through procurement to IT, finance or regulated industries → **A**.
- Bought by individuals for personal use → **C**.
- Still unclear → **B**.

**Page type.** Identify each screen as *marketing* (hero, features, pricing) or *app* (dashboard, list, settings, form). App screens use the in-app type scale (mnc-system §3) and the app patterns in step 6. They never use marketing display sizes, heroes or CTA bands.

Ask the user only if the choice is still genuinely open *and* it changes the result. Otherwise state the choice in one line and proceed.

**Theme mode:** keep the project's existing mechanism: a `.dark` class toggle, `prefers-color-scheme`, or forced. Don't add a theme toggle the project didn't have; that's a feature, not a fix.
- **Forced dark** (`<html class="dark">`, no toggle): keep it dark-only, and leave the light tokens in `:root` so a toggle can be added later.
- **Forced light, or no mechanism**: follow the system. Paste the generator's `.dark` block a second time inside `@media (prefers-color-scheme: dark) { :root:not(.light) { … } }`. That is pure CSS, with no script.
- **Existing toggle**: wire both blocks to it as it is.

### 3. Port (source first, then components)

Work in this order. Each layer removes a class of tells.

1. **Tokens.** Generate them; don't hand-pick.
   - Run:
     ```bash
     node <skill-dir>/scripts/derive-palette.mjs <brand-hex|none> <A|B|C> --format=<hex|hsl|oklch>
     ```
     Use the brand hex if the brand colour stays, or `none` if it doesn't.
   - **Format**: `hsl` for shadcn v3 channel variables, `oklch` for Tailwind v4, `hex` otherwise.
   - **Contrast report**: every line must say `ok`.
   - Replace the `:root` / `.dark` variables and keep the project's variable names. Add any new tokens the project lacks (`--primary-hover`, `--primary-subtle*`, `--brand` for B, `--success`, `--warning`) and map them in the Tailwind config.
   - **Radius scale**: set `--radius` and `--radius-sm/md/lg/xl` (components.md §2).
   - Add the shadow tokens (mnc-system §5) and the motion tokens (§6).
   - **One neutral family**: remap every `gray/slate/zinc/neutral/stone-*` utility to tokens (`bg-muted`, `text-muted-foreground`, `border-border`).
2. **Typography.**
   - Swap the font loading to the house family and remove the stock display font.
   - Encode the type scale (§3) as Tailwind `fontSize` entries with line height and tracking, or as CSS utilities.
   - Headlines go to sentence case with negative tracking. Cap the measure at 65ch.
3. **Kill the loud tells.** Use the scan output as the checklist.
   - Gradient text → solid `text-foreground`.
   - `from-*/via-*/to-*` gradients on buttons, badges and icon tiles → solid `bg-primary`, or a neutral `bg-muted`.
   - Coloured `shadow-*-500/25` and glows → removed, or `--shadow-md` on floating layers only.
   - Blur blobs and radial hero glows → deleted.
   - `backdrop-blur` cards → `bg-card border`. Keep blur only on a sticky header.
   - `animate-pulse/bounce/float` and infinite keyframes → removed. Add `prefers-reduced-motion` handling.
   - Navy or purple dark backgrounds → neutral, with elevation by lightness.
   - `rounded-2xl/3xl` → `rounded-lg` or `rounded-md` per the style. Pills only for tags.
   - `font-extrabold/black` → `font-semibold` or `font-medium`.
   - Tailwind 400/500 accents with white text (they fail AA) → `bg-primary text-primary-foreground`.
   - Hard-coded `bg-[#…]` → tokens. Hover lifts and zooms → a lightness change only (color.md §6).
4. **Colour placement.** Apply color.md §1–§6:
   - **Accent whitelist only**: primary button (one per view), body links, focus ring, selected/on states, one chart series.
   - **Text**: exactly 3 levels.
   - **Surfaces**: at most 3 surface levels, with dark mode by lightness steps.
   - **Borders**: only two tokens, `--border` and `--input`.
   - **States**: each interactive element gets the states it actually has (hover, active, focus-visible, and disabled where it can be disabled), using the generated tokens from the table.
   - **Budget check**: estimate the accent coverage on a screenshot (or use `budget.accentAreaPct`) against the style budget.
5. **Components and dimensions.** Apply components.md:
   - **Object selection**: re-choose objects by content using the §1 table. Rows instead of decorative cards, an inline stat row instead of stat cards, a table for comparisons, one quote instead of testimonial cards.
   - **Radius**: radii from the one scale (at most 4 distinct). Nested radius = outer − padding.
   - **Borders**: 1px on cards and inputs. 2px only for the focus ring and active indicators. Selected state via an inset shadow, so there is no layout shift.
   - **Control heights** on the 4px grid (32/36–40/44). 44px touch targets on mobile. Badges 20–22px.
   - **Padding and gaps** per the §5 table. Shadows only per the §6 elevation table.
6. **Recompose the stock sections.** These are structural fixes, not cosmetic ones.
   - **Hero**:
     - Remove the sparkle pill badge, or replace it with one plain text link ("New: Usage-based billing →").
     - Left-align on product sites.
     - The H1 names the category and outcome.
     - One primary CTA plus one text-link secondary.
     - A real product figure on the right or below, with no floating stat chips.
   - **Feature grids**: break the 3- or 6-identical-cards pattern. Use a 2-up with one large product figure and a short list, or a bordered table-like list. Drop icon tiles; if icons stay, use one set at 1.5px stroke in the muted colour.
   - **Social proof**:
     - Monochrome logos, evenly sized.
     - One named quote with name, title and company. No 5-star rows.
     - Remove invented stats ("10,000+ users", "99.9%") unless the user confirms they are real.
   - **Pricing**: no gradient "Most popular" border. A 1px `--primary` border plus a small label is enough.
   - **CTA band**: a neutral band (`bg-muted` or inverted `bg-foreground text-background`), not a gradient.
   - **Fake dashboards**: drop the traffic-light dots and gradient bars. Use neutral bars plus one accent series, tabular numbers and realistic labels. If there is no real screenshot:
     - Keep a mock only as an illustration.
     - Label it "Sample data".
     - Keep its numbers out of the copy.
     - Never present it as a metric.
   - **Inverted surfaces** (`bg-foreground` bands): the focus ring must stay visible there. Override it locally, e.g. `--ring: var(--background)`.
   - **Imagery**: delete AI stock art (neon brains, orbs, Memphis people). Use a product screenshot, or let typography and whitespace carry the section.
   - **App screens** (dashboards, lists, settings):
     - **Navigation**: a gradient sidebar becomes a solid `--card` sidebar with a 1px border (6 or more sections), or a top bar (5 or fewer).
     - **Page header**: title, an optional one-line muted subtitle, and **one** primary action on the right. "Welcome back, Alex! 👋" becomes the title "Dashboard" with a muted "Welcome back, Alex."
     - **KPIs**: stat cards with icon tiles become an inline stat row divided by 1px rules, using tabular numbers and muted labels. A delta without a stated period stays muted, or gets a "vs last month" label if the period is known.
     - **Lists of records**: rows of cards become a **table** with tabular-number amounts right-aligned. Status uses the neutral dot badge (color.md §7). Avatars only for real people or logos.
     - **Upsell and promo boxes**: a quiet text link, or one bordered card. Never a gradient tile in the nav. The link is 14px/500 in `--muted-foreground`, turns `--foreground` with an underline on hover, and sits at the end of the nav or in the account menu.
     - **"AI insight" panels**: one bordered card with a secondary button. Keep the claim exactly as the product states it.
     - **Empty, loading and error states**: plain text plus one action. Use skeletons in `--muted`, with no shimmer gradient.
7. **Copy.** Apply `references/copy.md`.
   - Remove buzzwords, emoji, Title Case, exclamation marks and "AI-powered" as a lead.
   - Keep the product's facts; never invent claims, customers or numbers.
   - Rewrite copy only where it is a tell. Product-specific wording the user wrote stays.
   - **When the project offers no facts beyond the slop copy**, restate only what the original actually claims, in plain words. Use a generic audience ("for teams") rather than inventing a segment. List the facts you would need for a sharper headline in the report.
8. **Leftovers.**
   - Remove "Edit with Lovable" / "Made with v0" badges, but only if the user owns the plan that allows it. Otherwise flag them.
   - Find dead `#` links, empty buttons and lorem text. Report them; don't invent destinations.

Make the edits in the project's own idiom: the same component library, class style and file layout. Do not add dependencies for this; Tailwind, CSS variables and the existing font loader are enough.

### 4. Verify (approve like a department head)

- Re-run `slop-scan.mjs`. The target is no severity-3 tells and a weighted total under 20.
- Re-run `slop-audit.js` live if you can. The target verdict is `clean`, or `borderline` only where it is caused by a deliberate brand accent.
- Screenshot the same views as in step 1 and compare before and after.
- **Run the review gate.** Every answer must be yes before you call it done:
  - [ ] Would this survive next to linear.app / stripe.com / ibm.com in a deck without looking like the junior one?
  - [ ] Is the page within the style's colour budget (A ≥92% / B ≥96% / C ≥90% neutral), with one accent hue, used only on whitelisted elements?
  - [ ] Is there one neutral family, three text levels and at most three surface levels?
  - [ ] Is there exactly one primary button per view, and does every interactive element have visible hover and focus states (plus a disabled state where it can be disabled)?
  - [ ] Is every object the least decorated one that fits the content (rows or tables before cards), with no nesting deeper than one level?
  - [ ] Are there at most 4 radii from one scale, with nested corners concentric, 1px borders, and controls on the height scale?
  - [ ] Is there one type family, a clear scale and tight tracking on display sizes?
  - [ ] Is no headline gradient, glowing, Title Cased or emoji'd?
  - [ ] Is depth carried by 1px borders and step surfaces, with shadows only on floating layers?
  - [ ] Does nothing move on its own?
  - [ ] Can every claim on the page be backed up, with no invented stats or testimonials?
  - [ ] Does contrast pass (body text 7:1 or better, secondary text 4.5:1 or better) in both light and dark?
  - [ ] Do keyboard focus rings remain visible (`--ring`)?
- Report the before and after scores, what changed per layer, and anything you flagged but did not change (unverifiable stats, badges, dead links).

## Rules

- **Never** reduce accessibility to look minimal. Keep focus states, contrast and hit targets of 44px or larger on mobile.
- **Never** invent customers, logos, metrics or testimonials. Remove or flag them.
- **Keep the brand's identity** when the user has one: logo, a committed brand hue, a licensed font. Deslop removes the template, not the brand.
- **Do not mix house styles.** Consistency is what reads as expensive.
- **When unsure, remove rather than add.** Premium is mostly subtraction.
