# Components: choose the right object, then size it exactly

AI templates reach for the same five objects for everything: a card, a pill badge, a gradient button, an icon tile and a modal. Premium systems choose the **least decorated object that does the job**, then give it exact, consistent dimensions.

## 1. Object selection: decide by content, not by habit

| You have… | Use | Not | Why |
|---|---|---|---|
| 3–8 parallel features with a title and a sentence | **Definition list / bordered rows** (title left, text right), or a 2-col text list with no boxes | 3/6 identical icon cards | Rows scan faster; cards add chrome without information |
| 1 hero feature + supporting points | **Split: large product figure + 3–4 line list** | a card grid | Gives hierarchy; one thing leads |
| Items the user acts on (projects, files, integrations) | **Cards**, only when each item is clickable or has its own actions | static cards for marketing copy | A card means "object you can act on" |
| Comparable attributes across items (plans, specs) | **Table** with sticky header, tabular numerals | side-by-side cards with ✓ lists | Tables make comparison possible |
| Stats / KPIs | **Inline stat row**: number (h3 size, tabular) + muted label, divided by 1px rules | stat cards with icons, glows, trend emoji | Numbers are the content; chrome hides them |
| Status of a thing | **Badge**: small, semantic or neutral subtle fill, sentence-case text | coloured pills everywhere, uppercase tracking | Badges are for status, not decoration |
| User-entered keyword / filter | **Tag/chip**, removable, neutral | accent pills | |
| Switch between 2–4 views of the same content | **Segmented control** (≤4, short labels) or **Tabs** (>4 or long labels) | buttons that look like pills | |
| Primary next step | **One primary button** | two gradient buttons side by side | One decision per view |
| Secondary step | **Secondary button** (bordered) or **text link** | ghost-with-blur "Watch demo ▶" | |
| Destructive step | **Secondary button with destructive text**; filled red only in the confirm dialog | red primary on the main screen | |
| Confirm a destructive/irreversible action | **Dialog** | inline toast | |
| Edit a few fields in context | **Inline edit / popover / side sheet** | full modal | Modals interrupt; keep context |
| Transient result ("Saved") | **Toast**, bottom, auto-dismiss 4–6s, no icon confetti | alert banner | |
| Page-level issue | **Inline banner** at the top of the affected region | toast | |
| Empty state | **Plain text + one action**, optional small neutral icon | big 3D illustration | |
| Testimonials | **One** large quote with name/role/company/logo, or a 2-col text grid | 3 cards with 5 stars and avatar circles | Credibility comes from specifics, not stars |
| Customer logos | **Single row, monochrome, equal optical height (20–28px)** | coloured logos in cards, marquee animation | |
| Navigation (marketing) | **Logo left, 3–5 text links, 1 secondary + 1 primary action right**, solid bg + bottom border | floating glass pill nav | |
| Navigation (app) | **Sidebar 240–280px** (≥6 sections) or **top bar** (≤5) | both at once | |
| Process / steps | **Numbered list** with plain numerals (01, 02) in muted mono | three cards with gradient circles "1 2 3" connected by dashed lines | |
| Pricing | **3 columns max, bordered, one recommended** (1px primary border + small "Recommended" label), feature table below | gradient border, scale(1.05), "🔥 Most popular" | |
| FAQ | **Accordion** with plain rows and a chevron, or a 2-col Q/A list | cards per question | |
| Icons | **Only where they aid scanning**: nav, buttons with ambiguous labels, list markers, file types | decorating every heading/feature | Icons are wayfinding, not ornament |
| Avatars | **Real people only** (team, author, assignee), circle, 24/32/40px | coloured placeholder circles as "social proof" | |
| Hero visual | **Product screenshot/figure**, or nothing (typography-led) | stock 3D, glowing brains, illustrated people, floating stat chips | |
| Section separation | **Whitespace** (96–128px) or a 1px full-width rule | alternating tinted backgrounds every section, wave SVG dividers | |

**Selection rules**
1. **Count the decoration.** Every box, icon, badge and colour must earn its place. If removing it loses no information, remove it.
2. **Same content, same object.** Don't present parallel items with different components.
3. **Nest at most once.** Card in a section, yes. Card in a card in a card, no. Use spacing or dividers inside cards.
4. **Use one emphasis tool per element.** A button can be filled *or* have an icon accent, not filled + icon + shadow + arrow.

## 2. Radius: one scale, applied by component

There are four steps per house style, and `derive-palette.mjs` prints them as `--radius-sm/md/lg/xl`. Components use the steps, never raw values.

| Step | Used for | A | B | C |
|---|---|---|---|---|
| `--radius-sm` | badges, checkboxes, kbd, segmented thumbs | 2px | 6px | 4px |
| `--radius-md` | buttons, inputs, selects, tooltips | 4px | 8px | 6px |
| `--radius-lg` | cards, popovers, menus, figures | 4px | 12px | 10px |
| `--radius-xl` | dialogs, sheets | 4px | 16px | 12px |

The table below is the same scale, laid out per component.

| Component | A. Enterprise (`--radius: 4px`) | B. Product-mono (`8px`) | C. Editorial (`6px`) |
|---|---|---|---|
| Button, input, select | 4px (or 0, Carbon) | 8px | 6px |
| Checkbox | 2px | 4px | 4px |
| Badge / status | 2px | 6px | 4px, or full for tags only |
| Tag / chip (removable) | 2px | full | full |
| Card | 4px | 12px | 10px |
| Popover, menu | 4px | 12px | 10px |
| Tooltip | 4px | 8px | 6px |
| Dialog / sheet | 4px | 16px | 12px |
| Image / screenshot figure | 4px | 12px | 10px |
| Avatar | circle (people), `--radius-sm` square (orgs/workspaces) | same | same |
| Segmented control | outer 4px, inner 2px | outer 8px, inner 6px | outer 6px, inner 4px |

**Radius rules**
- **Nested radius applies only to tight nesting.** When an inner element sits ≤ 8px from the outer edge (a segmented-control thumb, an image inset in a card, an input addon, a menu item's hover fill), set inner = outer − gap, with a minimum of 2px. A 12px card with a 4px inset image gives the image 8px. When the gap is larger (a button inside a card with 20–24px padding), the corners don't read as concentric, so the inner element keeps its own step (`--radius-md`). Mismatched *tight* concentric corners are an instant amateur tell.
- **Distinct values**: ≤ 4 distinct radii on a page (not counting full/circle). The audit counts this.
- **Full radius (9999px)** only for removable tags, avatars, switches and B/C segmented thumbs. **Never** for primary buttons in A. In B and C, pill buttons only if the brand already uses them everywhere.
- **No radius on** full-bleed sections, table cells, dividers, or the page frame.
- **Banned**: `rounded-2xl`/`rounded-3xl` (16–24px) on cards, and mixed `rounded-lg`/`rounded-xl`/`rounded-2xl` siblings.

## 3. Border and stroke widths

| Element | Width | Colour |
|---|---|---|
| Card, divider, table rule, input | **1px** | `--border` (cards, rules) / `--input` (controls) |
| Hairline on high-DPI (optional, B) | 0.5px via `box-shadow: 0 0 0 0.5px` | `--border` |
| Focus ring | **2px solid**, offset **2px** (`outline: 2px solid var(--ring); outline-offset: 2px`) | `--ring` |
| Selected card / recommended plan | 1px `--primary` + `box-shadow: inset 0 0 0 1px var(--primary)` (looks 2px, no layout shift) | `--primary` |
| Active tab / nav indicator | **2px** bar | `--primary` (A/C) or `--foreground` (B); see color.md §2 for the fill |
| Error input | 1px | `--destructive` |
| Icon stroke | **1.5px** at 16–20px; 1.25px at 24px; consistent across the set | `currentColor` |
| Chart lines | 1.5–2px; gridlines 1px | series / `--border` |

**Border rules**
- **Never 2px+ borders** on cards or buttons (except the focus ring). Thick borders read as wireframe or template.
- **No `border-white/10` on glass.** Surfaces are solid, so borders use the token.
- **Borders vs shadows**: use one or the other per element. In-flow content gets a border, floating layers get a shadow (plus a 1px border in dark mode).

## 4. Control sizing (heights on a 4px grid)

| Size | Height | Horizontal padding | Font | Icon | Use |
|---|---|---|---|---|---|
| sm | 32px | 12px | 14px / 500 | 16px | dense tables, toolbars |
| md (default) | 36px (B) / 40px (A, C) | 16px | 14px / 500 | 16px | most UI |
| lg | 44px (A, C) / 40px (B) | 20px | 16px / 500 | 20px | marketing hero CTA, mobile primary |
| Touch minimum | 44×44px hit area | | | | all interactive elements on mobile; extend the hit area with padding/pseudo-element if visual is smaller |

**Sizing rules**
- **Inputs** match button height on the same row. Placeholder text is in `--muted-foreground`. Labels sit above (14px/500), never placeholder-as-label.
- **Button content** is a label, plus an optional 16px icon *leading* (action) or *trailing* (navigation chevron). No "→" text glyphs, and no emoji.
- **Icon-only buttons** are square (height × height), with an `aria-label` and a tooltip.
- **Badges**: 20–22px tall, 8px horizontal padding, 12px / 500, sentence case.
- **Avatars**: 24 / 32 / 40px. Avatar stacks overlap by 25% with a 2px `--background` ring, and only for real assignees.

## 5. Spacing inside components

| Component | Padding | Internal gap |
|---|---|---|
| Card | 24px (A, C) / 20px (B); dense 16px | 12px between title and body, 16–24px before actions |
| Dialog | 24px; footer actions right-aligned, 8px apart | 16px |
| Table cell | 12px × 16px (default), 8px × 12px (dense) | n/a |
| List row | 12px × 16px, min height 44px | 12px between icon and text |
| Form | 16px between fields, 24–32px between groups | label→input 6–8px, helper text 4–6px below |
| Section heading → content | 32–48px | heading → subhead 12–16px |

## 6. Elevation (shadows) by object

| Object | Light mode | Dark mode |
|---|---|---|
| Page, section, in-flow card | none (1px border) | none (surface step) |
| Sticky header | none, or bottom border | bottom border |
| Dropdown, popover, tooltip | `--shadow-md` | `--popover` surface + 1px border + `0 8px 24px rgba(0,0,0,.4)` |
| Dialog, sheet | `--shadow-lg` + scrim `rgba(0,0,0,.4)` | surface level 2 + border + scrim `rgba(0,0,0,.6)` |
| Toast | `--shadow-md` | as popover |
| Drag preview | `--shadow-lg` | as dialog |

**Shadow rules**
- **Hover** never adds a shadow to a card. Darken the border instead (`--input`).
- **Coloured shadows are banned.**

## 7. Icon system
- **One set**: Lucide is acceptable *if* used sparingly. Better: Phosphor (regular), Heroicons (outline 1.5), Carbon icons for Style A, Geist icons for Style B.
- **Sizes**: 16px inline/controls, 20px nav, 24px empty states. Never inside a coloured rounded square.
- **Colour**: `currentColor`, so they inherit foreground or muted. The accent only when the icon *is* the selected/active state.
- **Budget**: about ≤ 1 icon per 150 words of marketing copy. The audit flags more than 8 decorative library icons.
