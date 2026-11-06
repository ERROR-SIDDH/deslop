# deslop

An agent skill that turns AI-generated websites into design that holds up next to Stripe, Linear and IBM. It works with Claude Code, Codex, Antigravity, Lovable, Cursor, Windsurf, GitHub Copilot, Gemini CLI, and any MCP client.

| Before | After |
|---|---|
| ![before](docs/screenshots/marketing-before-hero.png) | ![after](docs/screenshots/marketing-after-hero.png) |
| ![before](docs/screenshots/app-before.png) | ![after](docs/screenshots/app-v2-after-light.png) |

**Full documentation:** open [`docs/index.html`](docs/index.html) in a browser. It covers setup for every tool, usage, the scripts, the MCP server, three page-by-page demos and how the skill was tested.

## Install

Clone the repo, then run the installer for your tool. It needs Node.js 18 or later.

```bash
git clone https://github.com/ERROR-SIDDH/deslop.git
node deslop/deslop/scripts/install.mjs <tool> --global              # Claude Code, Codex, Antigravity
node deslop/deslop/scripts/install.mjs <tool> --project path/to/app  # any tool
```

| Tool | `<tool>` | Where it goes | Then |
|---|---|---|---|
| Claude Code | `claude` | `~/.claude/skills/` or `.claude/skills/` | `/deslop` |
| OpenAI Codex | `codex` | `~/.agents/skills/` or `.agents/skills/` | `$deslop` or `/skills` |
| Google Antigravity | `antigravity` | `~/.gemini/config/skills/` or `.agents/skills/` | `/deslop` |
| Cursor | `cursor` | `.agents/skills/` plus `.cursor/rules/deslop.mdc` | ask it to "deslop" |
| Windsurf | `windsurf` | `.agents/skills/` plus `.windsurf/rules/deslop.md` | ask it to "deslop" |
| GitHub Copilot (VS Code) | `copilot` | `.agents/skills/` plus `.github/prompts/deslop.prompt.md` | `/deslop` |
| Gemini CLI | `gemini` | `.agents/skills/` plus a block in `GEMINI.md` | ask it to "deslop" |
| Anything that reads AGENTS.md | `agents` | `.agents/skills/` plus a block in `AGENTS.md` | ask it to "deslop" |
| Lovable | `lovable` | prints import steps: Settings → Skills → Import from GitHub | ask it to "deslop" |

For Bolt, v0 or Lovable project knowledge, paste [`deslop/adapters/compact-rules.md`](deslop/adapters/compact-rules.md). It is under 7,000 characters.

## MCP server

The scanner, palette generator, audit script and references are also exposed as MCP tools (`deslop_scan`, `deslop_palette`, `deslop_audit_script`, `deslop_reference`), plus a `deslop` prompt. To print the config for your client:

```bash
node deslop/deslop/scripts/install.mjs mcp <claude|codex|antigravity|cursor|windsurf|vscode|gemini|claude-desktop>
```

## Use

```text
/deslop our landing page in src/app/page.tsx. Brand colour is #6366F1 and must stay.
```

Or just say "this looks AI-generated" or "make it look enterprise". Tell it your brand colour, how the product is bought and which stats are real, because it never invents claims.

## Scripts

No dependencies. Each one has a `--self-test`.

| Script | What it does |
|---|---|
| `slop-scan.mjs src/` | Finds 29 AI-template tells in source, as `file:line` entries with fixes |
| `derive-palette.mjs "#8B5CF6" B` | Builds an accessible light and dark palette from one brand colour |
| `slop-audit.js` | Paste into the browser console for a 0–100 slop score |
| `mcp-server.mjs` | The stdio MCP server |
| `install.mjs` | The cross-tool installer |

## Results

| Demo | Slop score | Scanner weight |
|---|---|---|
| Marketing page | 93 → 10 | 223 → 0 |
| Marketing page, brand purple kept | 93 → 2 | 223 → 0 |
| App dashboard | 74 → 2 | 219 → 0 |

The before and after pages are in [`examples/`](examples/).
