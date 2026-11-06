# The AI-slop catalog

Field study, 2026-11-06. Sources: live Lovable (`*.lovable.app`) and v0/Vercel (`*.vercel.app`) landing pages, sampled from public search results. They were compared with Linear, Stripe, Vercel/Geist, IBM Carbon and GitHub Primer. Each site was measured with `scripts/slop-audit.js`.

| Site | Score | Blue/violet share of chroma | Gradient text | Coloured glows | Backdrop blur | Lucide icons | Emoji | Fonts |
|---|---|---|---|---|---|---|---|---|
| AI tutor landing (Lovable) | 94 | 82% | 10 | 17 | 3 | 30 | 2 | Inter + Plus Jakarta |
| AI sales-coach landing (Lovable) | 74 | 93% | 1 | 1 | 23 | 51 | 1 | ui-sans-serif (unstyled default) |
| "AI SaaS platform" (v0/Vercel) | 99 | 59% | 3 | 25 | 1 | 102 | 18 | Inter + Poppins |
| **Linear** | 11 | 49% | 0 | 0 | 1 | 0 | 0 | Inter Variable + Berkeley Mono |
| **Stripe** | 39 | 97% | 0 | 3 | 1 | 0 | 1 | Söhne (licensed) |

**The key finding: blue and purple are not the problem. How they are applied is.**
- Stripe is 97% indigo and still reads as a USD 90B company.
- What separates it from the slop sites:
  - no gradient text
  - 4–6px radii
  - one licensed typeface
  - zero icon-library confetti
  - zero emoji in UI
  - real product UI instead of decoration
- So deslop does not just recolour. It removes the *tells*.

## The 24 tells, ranked by how loudly they say "AI made this"

### Colour and surface
1. **Gradient text on the key word of the headline**, e.g. "Learning that **thinks** the way you do" or "Scale your business with **AI Automation**". Usually `bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent`. This is the single strongest tell.
2. **Blue→violet or indigo→fuchsia gradients** on CTAs, badges, icons and section backgrounds, often with 3 stops (`from-indigo-500 via-purple-500 to-pink-500`).
3. **Navy-purple "deep space" dark mode.** The background is #0B0B1A–#0F172A with a radial violet glow behind the hero. Real dark modes are neutral: #0A0A0A, #111, #161616.
4. **Lavender-tinted light mode**: a #F5F3FF / #EEF2FF wash on everything.
5. **Coloured glow shadows**, e.g. `shadow-lg shadow-purple-500/25` or a 0 0 40px violet halo on buttons and cards. One sample had 25 of them.
6. **Blurred colour blobs**: absolutely-positioned `blur-3xl` circles of purple and cyan floating behind content.
7. **Glassmorphism by default**: `backdrop-blur-xl bg-white/10 border-white/20` on cards that sit on flat backgrounds, where there is nothing to blur. One sample had 23 blurred surfaces.
8. **Full-bleed diagonal hero gradient**, e.g. blue→green or purple→pink under white text.

### Typography
9. **Unstyled defaults**: `ui-sans-serif`/system stack. Or Inter for body plus a "personality" display font (Poppins, Plus Jakarta Sans, Outfit, Space Grotesk) with no tracking adjustment.
10. **Display headlines with no negative tracking** and weights 700–800 everywhere. Premium systems set big type at -2% to -6% tracking, and often *lighter* (Carbon 300, Stripe 300–400).
11. **Title Case Headlines That Shout**, plus the two-line "Statement. Second Statement." pattern with the second line in gradient.
12. **Uppercase tracked eyebrow** ("AI-POWERED SALES TRAINING") above every section.
13. **A flat size distribution**: 12/14/16/18/20/36/48/72 all used, with no modular scale and no clear hierarchy.

### Components
14. **The pill badge with a sparkle** above the H1: "✨ AI-Powered Adaptive Learning", rounded-full, tinted violet.
15. **The 3- or 6-card feature grid**: a Lucide icon in a gradient rounded square, an H3, two lines of copy. Repeated 2–4 times per page. Samples had 30, 51 and 102 Lucide icons.
16. **Oversized radius everywhere**: cards at 16–28px, buttons pill-shaped, and nested radii that don't reduce.
17. **Gradient CTA with an arrow**: "Get Started →" or "Start Free Trial →", paired with a ghost "Watch Demo" button.
18. **Floating stat chips** overlapping the hero image: "🔥 12 day streak", "+34% retention", "4.8 ★ Rating".
19. **Fake social proof**: an avatar stack (coloured circles or pravatar faces) with "2,000+ teams already using X", and stats strips like "10,000+ users · 4.9/5 · 99.9% uptime".
20. **The fake dashboard mock**: macOS traffic-light dots, a gradient bar chart, "+12.5%" green deltas, and an "AI Active" badge.
21. **Infinite looping motion**: `animate-pulse`, floating cards, shimmer borders, bouncing scroll arrows.

### Imagery and copy
22. **Stock AI imagery**: glowing neon brains, circuit boards, abstract 3D orbs. Or flat "corporate Memphis" illustrations of diverse people holding phones.
23. **Buzzword copy**: seamless, unlock, empower, supercharge, transform, revolutionize, effortless, game-changing, cutting-edge, "in minutes", "all-in-one".
24. **Emoji as UI**: 🚀 ✨ 🔥 ⚡ 💡 in headings, list bullets and stat chips.

## Bonus: structural tells
- The section order is identical everywhere: Hero → logo strip → 3 features → how-it-works (1-2-3) → stats → testimonials (3 cards, 5 stars) → pricing (3 tiers, middle one "Most Popular" with a gradient border) → FAQ accordion → gradient CTA band → 4-column footer.
- Broken details: buttons with no label (seen live), "Lorem" leftovers, every testimonial with 5/5 stars, a footer with dead `#` links.
- The "Edit with Lovable" / "Made with v0" badge left in production.

## What the premium sites do instead (measured)
- **Colour**: 95%+ neutral pixels with one accent. Dark mode is neutral, with surfaces that step up in lightness (Carbon G100: #161616 → #262626 → #393939).
- **Type**: one family, or one family plus a mono. Big type gets tight tracking. Line height runs from 1.0–1.1 for display to 1.5 for body.
- **Radius**: 4–9px on controls (Stripe 4/6, Linear 8/9, Primer 6). Pills only for tags.
- **Depth**: 1px hairline borders at low alpha. Shadows are neutral, layered, under 6% opacity per layer, and only on floating layers.
- **Imagery**: the actual product UI with realistic data, shown as figures (Linear captions theirs "Fig 0.1").
- **Copy**: the headline names the category ("Financial infrastructure…", "The product development system…"). The subhead uses concrete verbs. Section labels are plain ("Planning", "Build, review, and ship").
