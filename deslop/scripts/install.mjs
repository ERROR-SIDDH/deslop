#!/usr/bin/env node
// Install deslop into an AI coding tool, or print its MCP config. No dependencies.
//   node install.mjs <tool> [--global | --project <dir>]
//   node install.mjs mcp <client>
//   node install.mjs --self-test
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SKILL = path.resolve(HERE, '..');
const SERVER = path.join(SKILL, 'scripts', 'mcp-server.mjs');
const SHARED = '.agents/skills/deslop'; // the cross-tool Agent Skills location (Codex, Antigravity)

const POINTER = `When asked to deslop a UI, or when a design looks AI-generated, cheap, generic or "too purple", or should look premium or enterprise:
read and follow \`${SHARED}/SKILL.md\`. Its references are in \`${SHARED}/references/\` and its scripts in \`${SHARED}/scripts/\` (run them with node).`;

// Where each tool reads skills or rules. skill: where the folder goes; files: extra pointer files the tool needs.
const TOOLS = {
  claude: { global: '~/.claude/skills/deslop', project: '.claude/skills/deslop', note: 'Start a new session, then run /deslop.' },
  codex: { global: '~/.agents/skills/deslop', project: SHARED, note: 'Restart Codex, then mention $deslop or run /skills.' },
  antigravity: { global: '~/.gemini/config/skills/deslop', project: SHARED, note: 'Type /deslop in the agent panel, or run /skills reload in the CLI.' },
  cursor: { project: SHARED, files: { '.cursor/rules/deslop.mdc': `---\ndescription: Make AI-generated UI look MNC-grade (deslop)\nalwaysApply: false\n---\n\n${POINTER}\n` }, note: 'Ask the agent to "deslop" a page; the rule is attached on demand.' },
  windsurf: { project: SHARED, files: { '.windsurf/rules/deslop.md': `---\ntrigger: model_decision\ndescription: Make AI-generated UI look MNC-grade (deslop)\n---\n\n${POINTER}\n` }, note: 'Ask Cascade to "deslop" a page.' },
  copilot: { project: SHARED, files: { '.github/prompts/deslop.prompt.md': `---\ndescription: Make AI-generated UI look MNC-grade (deslop)\n---\n\n${POINTER}\n\nTarget: \${input:target:what to fix}\n` }, note: 'In VS Code Copilot Chat (agent mode), type /deslop.' },
  gemini: { project: SHARED, block: 'GEMINI.md', note: 'Gemini CLI loads GEMINI.md automatically; ask it to deslop a page.' },
  agents: { project: SHARED, block: 'AGENTS.md', note: 'Any tool that reads AGENTS.md (Codex, Jules, Amp, Copilot agent, and others) will find it.' },
};

const MCP = {
  claude: () => `claude mcp add deslop -- node ${JSON.stringify(SERVER)}`,
  codex: () => `# ~/.codex/config.toml\n[mcp_servers.deslop]\ncommand = "node"\nargs = [${JSON.stringify(SERVER)}]`,
  antigravity: () => `// ~/.gemini/config/mcp_config.json (or <workspace>/.agents/mcp_config.json)\n${mcpJson('mcpServers')}`,
  cursor: () => `// .cursor/mcp.json (project) or ~/.cursor/mcp.json (global)\n${mcpJson('mcpServers')}`,
  windsurf: () => `// ~/.codeium/windsurf/mcp_config.json\n${mcpJson('mcpServers')}`,
  vscode: () => `// .vscode/mcp.json (VS Code / GitHub Copilot)\n${mcpJson('servers', { type: 'stdio' })}`,
  gemini: () => `// ~/.gemini/settings.json (Gemini CLI): merge into the existing file\n${mcpJson('mcpServers')}`,
  'claude-desktop': () => `// claude_desktop_config.json\n${mcpJson('mcpServers')}`,
};
function mcpJson(key, extra = {}) { return JSON.stringify({ [key]: { deslop: { ...extra, command: 'node', args: [SERVER] } } }, null, 2); }

const expand = p => (p.startsWith('~/') ? path.join(os.homedir(), p.slice(2)) : p);

// Insert or replace a marked block, so re-running never duplicates it.
function upsertBlock(file, body) {
  const start = '<!-- deslop:start -->', end = '<!-- deslop:end -->';
  const block = `${start}\n## deslop (UI design skill)\n\n${body}\n${end}`;
  const old = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
  const re = new RegExp(`${start}[\\s\\S]*?${end}`);
  fs.writeFileSync(file, re.test(old) ? old.replace(re, block) : (old ? old.replace(/\s*$/, '\n\n') : '') + block + '\n');
}

export function install(tool, { global = false, project = process.cwd() } = {}) {
  const t = TOOLS[tool];
  if (!t) throw new Error(`unknown tool "${tool}". Choose: ${Object.keys(TOOLS).join(', ')}, lovable`);
  if (global && !t.global) throw new Error(`${tool} has no global skills folder; install per project with --project <dir>`);
  const dest = global ? expand(t.global) : path.resolve(project, t.project);
  const written = [];
  if (path.resolve(dest) !== SKILL) {
    fs.mkdirSync(dest, { recursive: true });
    fs.cpSync(SKILL, dest, { recursive: true, force: true });
    written.push(dest);
  }
  for (const [rel, body] of Object.entries(t.files || {})) {
    const f = path.resolve(project, rel); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, body); written.push(f);
  }
  if (t.block) { const f = path.resolve(project, t.block); upsertBlock(f, POINTER); written.push(f); }
  return { written, note: t.note };
}

const LOVABLE = `Lovable reads the same SKILL.md format.
  Import:  Settings -> Skills -> Add -> Import from GitHub, and paste
           https://github.com/ERROR-SIDDH/deslop/tree/main/deslop   (the repo must be public)
  Or ZIP:  zip the folder ${SKILL} and use Add -> Upload ZIP.
  Lovable cannot run the node scripts; the skill falls back to its written rules.
  For always-on rules in Lovable, Bolt or v0, paste ${path.join(SKILL, 'adapters', 'compact-rules.md')} into project knowledge.`;

function selfTest() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'deslop-install-'));
  const assert = (c, m) => { if (!c) { console.error('FAIL:', m); process.exit(1); } };
  try {
    for (const tool of ['claude', 'codex', 'antigravity', 'cursor', 'windsurf', 'copilot', 'gemini', 'agents']) {
      install(tool, { project: tmp }); install(tool, { project: tmp }); // twice: must be idempotent
    }
    for (const f of ['.claude/skills/deslop/SKILL.md', `${SHARED}/SKILL.md`, `${SHARED}/scripts/mcp-server.mjs`, `${SHARED}/references/color.md`,
      '.cursor/rules/deslop.mdc', '.windsurf/rules/deslop.md', '.github/prompts/deslop.prompt.md', 'GEMINI.md', 'AGENTS.md']) assert(fs.existsSync(path.join(tmp, f)), `missing ${f}`);
    fs.writeFileSync(path.join(tmp, 'AGENTS.md'), '# Project rules\n\nKeep this.\n'); install('agents', { project: tmp }); install('agents', { project: tmp });
    const agents = fs.readFileSync(path.join(tmp, 'AGENTS.md'), 'utf8');
    assert(agents.includes('Keep this.') && agents.split('deslop:start').length === 2, 'AGENTS.md block must be appended once and keep existing content');
    for (const [k, fn] of Object.entries(MCP)) { const s = fn(); if (s.includes('{')) JSON.parse(s.slice(s.indexOf('{'))); assert(s.includes('mcp-server.mjs'), `mcp ${k}`); }
    let threw = false; try { install('cursor', { global: true }); } catch { threw = true; } assert(threw, 'cursor --global must refuse');
    // Agent Skills spec (Codex, Antigravity, Lovable): name ≤ 64 chars, lowercase-hyphen; description required, ≤ 1024 chars.
    const fm = fs.readFileSync(path.join(SKILL, 'SKILL.md'), 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/)[1];
    const name = (fm.match(/^name: (.+)$/m) || [])[1], desc = (fm.match(/^description: (.+)$/m) || [])[1];
    assert(/^[a-z0-9-]{1,64}$/.test(name || ''), 'SKILL.md name'); assert(desc && desc.length <= 1024, `SKILL.md description is ${desc?.length} chars (max 1024)`);
    const compact = fs.readFileSync(path.join(SKILL, 'adapters', 'compact-rules.md'), 'utf8');
    assert(compact.length <= 10000, `compact-rules.md is ${compact.length} chars; Lovable/Bolt knowledge caps at 10,000`);
  } finally { fs.rmSync(tmp, { recursive: true, force: true }); }
  console.log('self-test ok');
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (isMain) {
  const args = process.argv.slice(2), projIdx = args.indexOf('--project');
  const [cmd, sub] = args.filter((a, i) => !a.startsWith('--') && (projIdx < 0 || i !== projIdx + 1));
  try {
    if (args.includes('--self-test')) selfTest();
    else if (cmd === 'mcp') {
      if (!MCP[sub]) throw new Error(`usage: install.mjs mcp <${Object.keys(MCP).join('|')}>`);
      console.log(MCP[sub]());
    } else if (cmd === 'lovable') console.log(LOVABLE);
    else if (cmd) {
      const { written, note } = install(cmd, { global: args.includes('--global'), project: projIdx >= 0 ? args[projIdx + 1] : process.cwd() });
      console.log(`deslop installed for ${cmd}:\n${written.map(w => '  ' + w).join('\n')}\n${note}`);
    } else {
      console.log(`usage:\n  node install.mjs <${Object.keys(TOOLS).join('|')}> [--global | --project <dir>]\n  node install.mjs lovable\n  node install.mjs mcp <${Object.keys(MCP).join('|')}>`);
    }
  } catch (e) { console.error(e.message); process.exit(1); }
}
