#!/usr/bin/env node
// Static slop scanner: finds AI-template tells in source (Tailwind/shadcn/CSS/HTML/JSX).
// Usage: node slop-scan.mjs <dir-or-file> [--json]    |    node slop-scan.mjs --self-test
// No dependencies. Read-only.
import fs from 'node:fs';
import path from 'node:path';

const RULES = [
  // [id, severity 3=loud 1=minor, regex, fix]
  ['gradient-text', 3, /bg-clip-text[^"'`]*text-transparent|text-transparent[^"'`]*bg-clip-text|background-clip:\s*text/g, 'Solid foreground headline; hierarchy via size/weight, never gradient text.'],
  ['blue-purple-gradient', 3, /\b(?:from|via|to)-(?:blue|indigo|violet|purple|fuchsia|pink|cyan|sky)-\d{2,3}\b/g, 'Remove gradient; use solid --primary (one shade) or neutral surface.'],
  ['css-gradient', 2, /(?:linear|radial|conic)-gradient\([^)]*(?:#(?:8b5cf6|7c3aed|6366f1|4f46e5|a855f7|9333ea|3b82f6|ec4899|06b6d4)|purple|violet|indigo)/gi, 'Replace decorative gradient with a flat token colour.'],
  ['colored-glow', 3, /\bshadow-(?:blue|indigo|violet|purple|fuchsia|pink|cyan|sky)-\d{2,3}(?:\/\d+)?\b|box-shadow:[^;]*0\s+0\s+\d{2,}px[^;]*(?:rgba?\((?!0,\s*0,\s*0)|#(?!000))/g, 'Neutral layered shadow (≤6% alpha) on floating layers only.'],
  ['blur-blob', 3, /\bblur-(?:2xl|3xl|\[\d{2,}px\])\b/g, 'Delete decorative blur blobs.'],
  ['glassmorphism', 2, /^(?!.*\b(?:sticky|fixed)\b).*?\bbackdrop-blur(?:-(?:sm|md|lg|xl|2xl|3xl))?\b/g, 'Solid surface + 1px border. Keep blur only on a sticky header over content.'],
  ['looping-animation', 2, /\banimate-(?:pulse|bounce|ping|spin-slow|float|shimmer|gradient)\b|animation:[^;]*infinite/g, 'Default to stillness; no infinite decorative motion.'],
  ['tinted-dark-bg', 2, /\bbg-(?:slate|indigo|violet|purple|blue)-9[5-9]0\b|#(?:0b0b1a|0f0f23|0a0a1f|0f172a|1e1b4b|020617)\b/gi, 'Neutral dark: #0A0A0A / #111111 / #161616 with lighter elevated steps.'],
  ['lavender-wash', 1, /\bbg-(?:indigo|violet|purple|blue)-50\b|#(?:f5f3ff|eef2ff|faf5ff)\b/gi, 'Neutral muted surface (#F4F4F4 / #F5F5F5 / #F2F0EC).'],
  ['stock-font', 2, /\b(?:Poppins|Plus[_ +]Jakarta[_ +]Sans|Outfit|Space[_ +]Grotesk|Montserrat)\b/g, 'One family per house style (IBM Plex / Geist / Inter Display / brand font).'],
  ['oversized-radius', 1, /\brounded-(?:2xl|3xl)\b/g, 'Controls 4-8px, cards 8-12px. Pills only for tags.'],
  ['heavy-weight', 1, /\bfont-(?:extrabold|black)\b/g, 'Max weight 600 (700 rarely); Style A sets display at 300.'],
  ['sparkle-badge', 2, /<Sparkles\b|✨/g, 'Drop the sparkle badge above the H1.'],
  ['emoji-ui', 2, /(?![©®™↑↓←→↔])[\p{Extended_Pictographic}▶►]/gu, 'No emoji as UI; use words or a single icon set.'],
  ['buzzword', 1, /\b(?:seamless(?:ly)?|supercharge|revolutioni[sz]e|unleash|game[- ]chang\w*|cutting[- ]edge|next[- ]gen(?:eration)?|effortless(?:ly)?|empower\w*|unlock|elevate|transform\w*|in (?:minutes|seconds)|all-in-one)\b/gi, 'Say what it does: concrete verb + object + proof.'],
  ['traffic-lights', 2, /bg-red-[45]00[^\n]{0,120}bg-yellow-[45]00[^\n]{0,120}bg-green-[45]00/g, 'Drop fake macOS window chrome; frame real UI in a 1px border.'],
  ['vanity-stat', 2, /\b\d{1,3}(?:,\d{3})+\+|\b\d+[kKM]\+|\b99\.9+%/g, 'Unverified stat: remove, or confirm with the user and cite.'],
  ['avatar-stack', 2, /-space-x-\d/g, 'Fake avatar stack: replace with one named customer, or remove.'],
  ['eyebrow', 1, /\buppercase\b[^"'`]*\btracking-(?:widest|\[0\.[2-9])|\btracking-(?:widest|\[0\.[2-9]\w*\])[^"'`]*\buppercase\b/g, 'At most one eyebrow per page; prefer none.'],
  ['title-case-heading', 1, /<h[1-3][^>]*>\s*(?:[A-Z][a-z']+\s+){2,}[A-Z][a-z']+/g, 'Sentence case for headings.'],
  ['ai-badge', 1, /\bAI[- ]Powered\b/g, 'Lead with the outcome, not "AI-powered".'],
  ['failing-default-accent', 3, /\bbg-(?:violet|indigo|blue|cyan|sky|fuchsia|purple)-[45]00\b(?=[^"'`]*\btext-white\b)|\btext-white\b(?=[^"'`]*\bbg-(?:violet|indigo|blue|cyan|sky|fuchsia|purple)-[45]00\b)/g, 'Tailwind 400/500 accents fail 4.5:1 with white text; use the derive-palette.mjs --primary.'],
  ['thick-border', 1, /\bborder-[248]\b(?![^"'`]*\b(?:animate-spin|focus|ring)\b)/g, 'Cards/buttons take 1px borders; 2px is for the focus ring and active indicators only.'],
  ['pill-button', 1, /<(?:button|Button|a)\b[^>]*\brounded-full\b[^>]*\bpx-(?:[5-9]|1\d)\b/g, 'Primary buttons use --radius-md; full radius is for tags, avatars, switches.'],
  ['hover-lift', 2, /\bhover:(?:-translate-y-\S+|scale-1(?:0[5-9]|1\d))\b/g, 'No hover lift/zoom; change fill or border lightness instead.'],
  ['untokenized-color', 1, /\b(?:bg|text|border|from|to|via|fill|stroke)-\[#[0-9a-fA-F]{3,8}\]/g, 'Route colour through tokens (bg-primary, text-muted-foreground).'],
];
// Project-level checks: things that are only wrong in combination.
const NEUTRALS = ['gray', 'slate', 'zinc', 'neutral', 'stone'];
const SEMANTIC = ['red', 'green', 'emerald', 'amber', 'yellow', 'orange', 'rose', 'lime'];
export function aggregate(texts) {
  const all = texts.join('\n'), out = [];
  const fam = re => [...new Set([...all.matchAll(re)].map(m => m[1]))];
  const neutrals = fam(/\b(?:bg|text|border|ring|divide|from|to|via)-(gray|slate|zinc|neutral|stone)-\d{2,3}\b/g);
  if (neutrals.length > 1) out.push({ id: 'mixed-neutral-families', sev: 2, match: neutrals.join(' + '), fix: 'One neutral ramp per codebase (the derive-palette ramp); remap the others.' });
  const accents = fam(/\b(?:bg|text|border|ring|from|to|via|shadow|fill|stroke)-([a-z]+)-\d{2,3}\b/g).filter(f => !NEUTRALS.includes(f) && !SEMANTIC.includes(f));
  if (accents.length > 1) out.push({ id: 'multiple-accent-hues', sev: 2, match: accents.join(' + '), fix: 'One accent hue; everything else neutral or semantic. See color.md §1.' });
  const radii = fam(/\brounded(?:-[tblrsexy]{1,2})?-(none|sm|md|lg|xl|2xl|3xl|\[[^\]]+\])(?![\w-])/g).filter(r => r !== 'none');
  const plain = /\brounded(?![\w-])/.test(all) ? 1 : 0;
  if (radii.length + plain > 4) out.push({ id: 'radius-sprawl', sev: 1, match: radii.join(' '), fix: 'At most 4 radii from one --radius scale (components.md §2).' });
  return out.map(h => ({ file: '<project>', line: 0, ...h }));
}
const EXT = /\.(?:[jt]sx?|mjs|html?|css|scss|vue|svelte|astro|mdx)$/;
const SKIP = /(?:^|[\\/])(?:node_modules|dist|build|\.next|\.git|\.output|coverage|out)(?:[\\/]|$)/;

export function scanText(text, file = '<text>') {
  const hits = [];
  // Blank out HTML and block comments (keeping newlines, so line numbers hold): notes like "removed 99.9%" aren't tells.
  const lines = text.replace(/<!--[\s\S]*?-->|\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' ')).split(/\r?\n/);
  for (const [id, sev, re, fix] of RULES) {
    lines.forEach((ln, i) => { for (const m of ln.matchAll(new RegExp(re.source, re.flags))) hits.push({ file, line: i + 1, id, sev, match: m[0].slice(0, 60), fix }); });
  }
  return hits;
}

function walk(p, out = []) {
  if (SKIP.test(p)) return out;
  const st = fs.statSync(p);
  if (st.isDirectory()) for (const f of fs.readdirSync(p)) walk(path.join(p, f), out);
  else if (EXT.test(p) && st.size < 1_000_000) out.push(p);
  return out;
}

function report(hits, json) {
  if (json) return console.log(JSON.stringify(hits, null, 1));
  const byId = {};
  for (const h of hits) (byId[h.id] ||= []).push(h);
  const weight = hits.reduce((a, h) => a + h.sev, 0);
  for (const [id, hs] of Object.entries(byId).sort((a, b) => b[1][0].sev - a[1][0].sev || b[1].length - a[1].length)) {
    console.log(`\n[${'!'.repeat(hs[0].sev)}] ${id} x${hs.length}  ->  ${hs[0].fix}`);
    for (const h of hs.slice(0, 8)) console.log(h.line ? `   ${h.file}:${h.line}  ${h.match}` : `   ${h.match}`);
    if (hs.length > 8) console.log(`   ... +${hs.length - 8} more`);
  }
  console.log(`\n${hits.length} tells, weighted ${weight}. ${weight === 0 ? 'Clean.' : weight < 20 ? 'Minor polish.' : weight < 60 ? 'Noticeably templated.' : 'Full AI-slop: run the deslop port.'}`);
}

if (process.argv.includes('--self-test')) {
  const ids = s => [...new Set(scanText(s).map(h => h.id))].sort().join(',');
  const assert = (got, want) => { if (got !== want) { console.error(`FAIL: got "${got}" want "${want}"`); process.exit(1); } };
  assert(ids('<h1 className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">'), 'blue-purple-gradient,gradient-text');
  assert(ids('<div className="absolute blur-3xl bg-purple-500/30 animate-pulse" />'), 'blur-blob,looping-animation');
  assert(ids('<Button className="shadow-lg shadow-violet-500/25 rounded-2xl">🚀 Supercharge</Button>'), 'buzzword,colored-glow,emoji-ui,oversized-radius');
  assert(ids('<div className="rounded-md border bg-background text-foreground">Payments</div>'), '');
  assert(ids('<nav className="sticky top-0 backdrop-blur-md">'), '');
  assert(ids('<h2 class="uppercase tracking-widest">Why Teams Choose Us</h2> 10,000+ users 💜'), 'emoji-ui,eyebrow,title-case-heading,vanity-stat');
  assert(ids('<h1 class="x">Ready To Transform Your Business</h1>'), 'buzzword,title-case-heading');
  assert(ids('<a class="rounded-full bg-indigo-500 px-8 py-4 text-white border-2 hover:-translate-y-1">'), 'failing-default-accent,hover-lift,pill-button,thick-border');
  assert(ids('<div class="bg-[#7c3aed] text-white">'), 'untokenized-color');
  assert(ids('<!-- removed "AI accuracy 99.9%" ✨ -->\n/* was: from-purple-500 */'), '');
  const agg = t => aggregate(t).map(h => h.id).sort().join(',');
  assert(agg(['text-slate-400 bg-gray-100', 'bg-violet-600 text-cyan-400 text-red-600', 'rounded rounded-md rounded-lg rounded-xl rounded-2xl']), 'mixed-neutral-families,multiple-accent-hues,radius-sprawl');
  assert(agg(['text-zinc-500 bg-zinc-100 bg-indigo-700 text-red-600 rounded-md rounded-lg']), '');
  assert(ids('font-family: "Plus Jakarta Sans", sans-serif; background: #0f172a;'), 'stock-font,tinted-dark-bg');
  console.log('self-test ok');
} else {
  const target = process.argv.slice(2).find(a => !a.startsWith('--'));
  if (!target) { console.error('usage: node slop-scan.mjs <dir-or-file> [--json] | --self-test'); process.exit(2); }
  const files = walk(path.resolve(target)).map(f => [path.relative(process.cwd(), f), fs.readFileSync(f, 'utf8')]);
  report([...files.flatMap(([f, t]) => scanText(t, f)), ...aggregate(files.map(([, t]) => t))], process.argv.includes('--json'));
}
