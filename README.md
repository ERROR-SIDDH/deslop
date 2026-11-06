# deslop

A Claude Code skill that turns AI-generated websites into design that holds up next to Stripe, Linear and IBM.

| Before | After |
|---|---|
| ![before](docs/screenshots/marketing-before-hero.png) | ![after](docs/screenshots/marketing-after-hero.png) |
| ![before](docs/screenshots/app-before.png) | ![after](docs/screenshots/app-v2-after-light.png) |

**Full documentation:** open [`index.html`](index.html) in a browser. It covers install, usage, the tools, three page-by-page demos and how the skill was tested.

## Install

```bash
git clone https://github.com/ERROR-SIDDH/deslop.git
mkdir -p ~/.claude/skills
cp -r deslop/deslop ~/.claude/skills/deslop
```

On Windows, copy `deslop\deslop` to `%USERPROFILE%\.claude\skills\deslop`. Then start a new Claude Code session.

## Use

```text
/deslop our landing page in src/app/page.tsx. Brand colour is #6366F1 and must stay.
```

Or just say "this looks AI-generated" or "make it look enterprise". Tell it your brand colour, how the product is bought and which stats are real, because it never invents claims.

## Tools

These work without Claude, and none of them has dependencies.

| Script | What it does |
|---|---|
| `node deslop/scripts/slop-scan.mjs src/` | Finds 29 AI-template tells in source, as `file:line` entries with fixes |
| `node deslop/scripts/derive-palette.mjs "#8B5CF6" B` | Builds an accessible light and dark palette from one brand colour |
| `deslop/scripts/slop-audit.js` | Paste it into the browser console for a 0–100 slop score |

## Results

| Demo | Slop score | Scanner weight |
|---|---|---|
| Marketing page | 93 → 10 | 223 → 0 |
| Marketing page, brand purple kept | 93 → 2 | 223 → 0 |
| App dashboard | 74 → 2 | 219 → 0 |

The before and after pages are in [`examples/`](examples/).
