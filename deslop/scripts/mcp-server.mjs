#!/usr/bin/env node
// deslop MCP server: exposes the scanner, palette generator, audit script and references to any MCP client
// (Claude, Codex, Antigravity, Cursor, Windsurf, VS Code Copilot, Gemini CLI). stdio transport, no dependencies.
// Usage: node mcp-server.mjs            (started by the MCP client)
//        node mcp-server.mjs --self-test
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { scanPath, formatReport } from './slop-scan.mjs';
import { derive, formatPalette } from './derive-palette.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SKILL = path.resolve(HERE, '..');
const VERSION = '1.0.0';
// Whitelisted reference topics -> files inside the skill folder (no arbitrary file reads).
const REFS = {
  workflow: 'SKILL.md', catalog: 'references/slop-catalog.md', system: 'references/mnc-system.md',
  color: 'references/color.md', components: 'references/components.md', copy: 'references/copy.md',
};
const read = rel => fs.readFileSync(path.join(SKILL, rel), 'utf8');

const TOOLS = [
  {
    name: 'deslop_scan',
    description: 'Scan source files (Tailwind, CSS, HTML, JSX, Vue, Svelte) for AI-template design tells. Returns a ranked report with file:line and fixes.',
    inputSchema: { type: 'object', properties: { path: { type: 'string', description: 'File or directory to scan, absolute or relative to the server working directory.' }, json: { type: 'boolean', description: 'Return raw hits as JSON instead of the text report.' } }, required: ['path'] },
    run: ({ path: p, json }) => { const hits = scanPath(p); return json ? JSON.stringify(hits, null, 1) : formatReport(hits); },
  },
  {
    name: 'deslop_palette',
    description: 'Generate an accessible light + dark design-token set (shadcn-compatible CSS variables) from one brand colour and a house style, with a WCAG contrast report.',
    inputSchema: { type: 'object', properties: {
      brand: { type: 'string', description: 'Brand colour as hex (e.g. "#8B5CF6"), or "none".' },
      style: { type: 'string', enum: ['A', 'B', 'C'], description: 'A = Enterprise, B = Product-mono, C = Editorial.' },
      format: { type: 'string', enum: ['hex', 'hsl', 'oklch'], description: 'hsl for shadcn v3 channels, oklch for Tailwind v4, hex otherwise.' },
    }, required: ['brand', 'style'] },
    run: ({ brand, style, format = 'hex' }) => formatPalette(derive(brand, String(style).toUpperCase()), format),
  },
  {
    name: 'deslop_audit_script',
    description: 'Return the read-only browser audit script. Run it in the page (DevTools console or a browser tool\'s JS execution) to get a 0-100 slop score and colour-budget readings.',
    inputSchema: { type: 'object', properties: {} },
    run: () => read('scripts/slop-audit.js'),
  },
  {
    name: 'deslop_reference',
    description: 'Read a deslop design reference: workflow (the full skill procedure), catalog (the 24 tells), system (house styles, type, spacing, motion), color, components, copy.',
    inputSchema: { type: 'object', properties: { topic: { type: 'string', enum: Object.keys(REFS) } }, required: ['topic'] },
    run: ({ topic }) => { if (!REFS[topic]) throw new Error(`unknown topic: ${topic}`); return read(REFS[topic]); },
  },
];

const PROMPTS = [{ name: 'deslop', description: 'Run the deslop workflow on the current project: audit, pick a house style, port, verify.', arguments: [{ name: 'target', description: 'What to fix: a path, URL or description.', required: false }] }];

function handle(msg) {
  const { id, method, params = {} } = msg;
  const ok = result => ({ jsonrpc: '2.0', id, result });
  switch (method) {
    case 'initialize':
      return ok({ protocolVersion: params.protocolVersion || '2025-06-18', capabilities: { tools: {}, prompts: {} }, serverInfo: { name: 'deslop', version: VERSION } });
    case 'ping': return ok({});
    case 'tools/list': return ok({ tools: TOOLS.map(({ run, ...t }) => t) });
    case 'tools/call': {
      const tool = TOOLS.find(t => t.name === params.name);
      if (!tool) return { jsonrpc: '2.0', id, error: { code: -32602, message: `unknown tool: ${params.name}` } };
      try { return ok({ content: [{ type: 'text', text: tool.run(params.arguments || {}) }] }); }
      catch (e) { return ok({ content: [{ type: 'text', text: `deslop error: ${e.message}` }], isError: true }); }
    }
    case 'prompts/list': return ok({ prompts: PROMPTS });
    case 'prompts/get': {
      if (params.name !== 'deslop') return { jsonrpc: '2.0', id, error: { code: -32602, message: `unknown prompt: ${params.name}` } };
      const target = params.arguments?.target ? `\n\nTarget: ${params.arguments.target}` : '';
      const skill = read('SKILL.md').replace(/^---[\s\S]*?---\s*/, '');
      return ok({ description: PROMPTS[0].description, messages: [{ role: 'user', content: { type: 'text', text: `${skill}\n\nWhen the skill says to run a script, call the matching deslop_* MCP tool instead. For references, call deslop_reference.${target}` } }] });
    }
    default:
      // Notifications (no id) get no reply; unknown requests get method-not-found.
      return id === undefined ? null : { jsonrpc: '2.0', id, error: { code: -32601, message: `method not found: ${method}` } };
  }
}

function serve() {
  let buf = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', chunk => {
    buf += chunk;
    let i;
    while ((i = buf.indexOf('\n')) >= 0) {
      const line = buf.slice(0, i).trim(); buf = buf.slice(i + 1);
      if (!line) continue;
      let reply;
      try { reply = handle(JSON.parse(line)); }
      catch { reply = { jsonrpc: '2.0', id: null, error: { code: -32700, message: 'parse error' } }; }
      if (reply) process.stdout.write(JSON.stringify(reply) + '\n');
    }
  });
}

async function selfTest() {
  const child = spawn(process.execPath, [fileURLToPath(import.meta.url)], { cwd: path.resolve(SKILL, '..') });
  const pending = new Map(); let buf = '';
  child.stdout.on('data', d => { buf += d; let i; while ((i = buf.indexOf('\n')) >= 0) { const m = JSON.parse(buf.slice(0, i)); buf = buf.slice(i + 1); pending.get(m.id)?.(m); } });
  let n = 0;
  const call = (method, params) => new Promise(res => { const id = ++n; pending.set(id, res); child.stdin.write(JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n'); });
  const assert = (c, m) => { if (!c) { console.error('FAIL:', m); child.kill(); process.exit(1); } };
  const init = await call('initialize', { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'self-test', version: '0' } });
  assert(init.result?.serverInfo?.name === 'deslop', 'initialize');
  child.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }) + '\n');
  const list = await call('tools/list');
  assert(list.result.tools.length === 4 && list.result.tools.every(t => t.inputSchema && !t.run), 'tools/list');
  const pal = await call('tools/call', { name: 'deslop_palette', arguments: { brand: '#8B5CF6', style: 'c' } });
  assert(/--primary: #/.test(pal.result.content[0].text) && !/FAIL/.test(pal.result.content[0].text), 'palette');
  const scan = await call('tools/call', { name: 'deslop_scan', arguments: { path: 'deslop/scripts/slop-scan.mjs' } });
  assert(/tells, weighted/.test(scan.result.content[0].text), 'scan');
  const ref = await call('tools/call', { name: 'deslop_reference', arguments: { topic: 'color' } });
  assert(ref.result.content[0].text.startsWith('# Colour usage'), 'reference');
  const bad = await call('tools/call', { name: 'deslop_reference', arguments: { topic: '../../etc/passwd' } });
  assert(bad.result.isError === true, 'reference whitelist');
  const prompt = await call('prompts/get', { name: 'deslop', arguments: { target: 'src/' } });
  assert(/Target: src\//.test(prompt.result.messages[0].content.text), 'prompt');
  const nf = await call('nope/method');
  assert(nf.error?.code === -32601, 'method not found');
  child.kill();
  console.log('self-test ok');
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (isMain) process.argv.includes('--self-test') ? selfTest() : serve();
