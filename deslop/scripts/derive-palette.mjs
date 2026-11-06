#!/usr/bin/env node
// Derive a disciplined light+dark token set from one brand colour, in OKLCH.
// Usage: node derive-palette.mjs <brand-hex|none> <A|B|C> [--format=hex|oklch|hsl]   |   --self-test
// Prints shadcn-compatible :root/.dark blocks plus a WCAG contrast report. No dependencies.

import path from 'node:path';
import { pathToFileURL } from 'node:url';

// ---- colour math (Björn Ottosson's OKLab) ----
const toLin = c => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const toGam = c => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);
export function hexToOklch(hex) {
  const n = parseInt(hex.replace('#', '').replace(/^(.)(.)(.)$/, '$1$1$2$2$3$3'), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(v => toLin(v / 255));
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return { L, C: Math.hypot(A, B), H: ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360 };
}
function oklchToRgb({ L, C, H }) {
  const a = C * Math.cos((H * Math.PI) / 180), b = C * Math.sin((H * Math.PI) / 180);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s];
}
const inGamut = rgb => rgb.every(v => v >= -1e-4 && v <= 1 + 1e-4);
// Reduce chroma (keep L and H) until the colour fits sRGB.
function fit(c) { let x = { ...c }; while (x.C > 0 && !inGamut(oklchToRgb(x))) x.C -= 0.002; x.C = Math.max(0, x.C); return x; }
export function toHex(c) { return '#' + oklchToRgb(fit(c)).map(v => Math.round(Math.min(1, Math.max(0, toGam(Math.max(0, v)))) * 255).toString(16).padStart(2, '0')).join(''); }
function lum(hex) { const n = parseInt(hex.slice(1), 16); const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(v => toLin(v / 255)); return 0.2126 * r + 0.7152 * g + 0.0722 * b; }
export function contrast(h1, h2) { const [a, b] = [lum(h1), lum(h2)].sort((x, y) => y - x); return (a + 0.05) / (b + 0.05); }

// ---- house styles ----
// Neutrals: A cool (Carbon cool gray), B true neutral, C warm paper. Accent caps keep brand hues out of "neon" territory:
// Tailwind 500 violets sit at C≈0.25, L≈0.6 — that, not the hue, is what reads as template.
const STYLE = {
  A: { nH: 250, nC: 0.008, bgL: 1.0, cMax: 0.2, Lp: 0.53, LpD: 0.7, radius: '4px', radii: [2, 4, 4, 4], defaultHue: 262 },
  B: { nH: 0, nC: 0.0, bgL: 1.0, cMax: 0.13, Lp: 0.52, LpD: 0.72, radius: '8px', radii: [6, 8, 12, 16], defaultHue: 275 },
  C: { nH: 75, nC: 0.006, bgL: 0.985, cMax: 0.17, Lp: 0.45, LpD: 0.74, radius: '6px', radii: [4, 6, 10, 12], defaultHue: 280 },
};
// Neutral lightness ramp (light mode), 50→950.
const RAMP = { 50: 0.985, 100: 0.967, 200: 0.928, 300: 0.872, 400: 0.708, 500: 0.556, 600: 0.48, 700: 0.39, 800: 0.3, 900: 0.235, 950: 0.18 };

function solveL(c, against, min, dir) { let x = { ...c }; for (let i = 0; i < 80 && contrast(toHex(x), against) < min; i++) x.L += dir * 0.005; return x; }

export function derive(brand, styleKey) {
  const st = STYLE[styleKey];
  if (!st) throw new Error('style must be A, B or C');
  const src = brand && brand !== 'none' ? hexToOklch(brand) : { L: st.Lp, C: st.cMax, H: st.defaultHue };
  const H = src.C < 0.03 ? st.defaultHue : src.H; // grey/black brand: fall back to the style accent hue
  const C = Math.min(src.C < 0.03 ? st.cMax : src.C, st.cMax);
  const n = L => toHex({ L, C: st.nC, H: st.nH });
  const ramp = Object.fromEntries(Object.entries(RAMP).map(([k, L]) => [k, n(L)]));
  const white = '#ffffff';
  const bg = toHex({ L: st.bgL, C: st.bgL < 1 ? st.nC : 0, H: st.nH });

  // Light primary: deepen until white text passes 4.5:1 (most Tailwind 500s fail this).
  let p = solveL({ L: Math.min(st.Lp, src.L), C, H }, white, 4.5, -1);
  // Dark primary: lighter, less chroma, dark text on it must pass 4.5:1.
  const dBg = toHex({ L: 0.145, C: st.nC, H: st.nH });
  let pd = solveL({ L: st.LpD, C: Math.min(C, st.cMax * 0.8), H }, dBg, 4.5, 1);
  const sem = (h, L, c) => toHex({ L, C: c, H: h });

  const light = {
    background: bg, foreground: ramp[950],
    card: styleKey === 'C' ? white : bg, 'card-foreground': ramp[950],
    popover: white, 'popover-foreground': ramp[950],
    muted: ramp[100], 'muted-foreground': ramp[600],
    border: ramp[200], input: styleKey === 'A' ? toHex(solveL({ L: RAMP[400], C: st.nC, H: st.nH }, bg, 3, -1)) : ramp[300], // A: Carbon-style 3:1 control edges
    primary: toHex(p), 'primary-foreground': white,
    'primary-hover': toHex({ ...p, L: p.L - 0.05 }), 'primary-active': toHex({ ...p, L: p.L - 0.09 }),
    'primary-subtle': toHex({ L: 0.965, C: Math.min(C, 0.03), H }), 'primary-subtle-foreground': toHex({ L: 0.4, C, H }),
    secondary: styleKey === 'B' ? ramp[100] : ramp[900], 'secondary-foreground': styleKey === 'B' ? ramp[950] : white,
    // muted = hover fill, accent = pressed fill: must differ or hover/press look identical.
    accent: n(0.935), 'accent-foreground': ramp[950],
    'disabled-foreground': ramp[400],
    ring: toHex(p),
    // Status fills (dots, icons, badges). *-text variants are the 4.5:1-safe versions for words.
    destructive: sem(27, 0.53, 0.19), success: sem(150, 0.5, 0.13), warning: sem(75, 0.7, 0.15),
    'destructive-text': sem(27, 0.5, 0.19), 'success-text': sem(150, 0.45, 0.12), 'warning-text': sem(65, 0.48, 0.11), 'warning-foreground': ramp[950],
    // Charts: one accent series + neutrals (color.md §8).
    'chart-1': toHex(p), 'chart-2': ramp[300], 'chart-3': ramp[500], 'chart-4': ramp[700],
  };
  if (styleKey === 'B') Object.assign(light, { primary: ramp[950], 'primary-hover': ramp[800], 'primary-active': ramp[700], ring: ramp[950], brand: toHex(p) });

  const dark = {
    background: dBg, foreground: n(0.93),
    card: n(0.18), 'card-foreground': n(0.93),
    popover: n(0.21), 'popover-foreground': n(0.93),
    // Hover/pressed fills sit above every surface (bg .145 < card .18 < popover .21) so they read on cards too.
    muted: n(0.235), 'muted-foreground': n(0.72),
    border: n(0.27), input: styleKey === 'A' ? toHex(solveL({ L: 0.4, C: st.nC, H: st.nH }, dBg, 3, 1)) : n(0.32),
    primary: toHex(pd), 'primary-foreground': dBg,
    'primary-hover': toHex({ ...pd, L: pd.L + 0.04 }), 'primary-active': toHex({ ...pd, L: pd.L + 0.08 }),
    'primary-subtle': toHex({ L: 0.25, C: Math.min(C, 0.05), H }), 'primary-subtle-foreground': toHex({ L: 0.82, C: Math.min(C, 0.1), H }),
    secondary: n(0.27), 'secondary-foreground': n(0.93),
    accent: n(0.275), 'accent-foreground': n(0.93),
    'disabled-foreground': n(0.5),
    ring: toHex(pd),
    destructive: sem(25, 0.68, 0.17), success: sem(150, 0.72, 0.13), warning: sem(80, 0.8, 0.13),
    'destructive-text': sem(25, 0.72, 0.15), 'success-text': sem(150, 0.75, 0.13), 'warning-text': sem(80, 0.82, 0.12), 'warning-foreground': dBg,
    'chart-1': toHex(pd), 'chart-2': n(0.35), 'chart-3': n(0.5), 'chart-4': n(0.65),
  };
  if (styleKey === 'B') Object.assign(dark, { primary: n(0.93), 'primary-foreground': dBg, 'primary-hover': n(0.86), 'primary-active': n(0.8), ring: n(0.93), brand: toHex(pd) });
  if (styleKey === 'B') { light['chart-1'] = light.brand; dark['chart-1'] = dark.brand; }

  const checks = mode => {
    const t = mode === 'light' ? light : dark;
    return [
      ['foreground on background', t.foreground, t.background, 7],
      ['muted-foreground on background', t['muted-foreground'], t.background, 4.5],
      ['muted-foreground on muted', t['muted-foreground'], t.muted, 4.5],
      ['primary-foreground on primary', t['primary-foreground'], t.primary, 4.5],
      ['primary-subtle-foreground on primary-subtle', t['primary-subtle-foreground'], t['primary-subtle'], 4.5],
      ['ring on background (non-text, 3:1)', t.ring, t.background, 3],
      ['destructive-text on background', t['destructive-text'], t.background, 4.5],
      ['success-text on background', t['success-text'], t.background, 4.5],
      ['warning-text on background', t['warning-text'], t.background, 4.5],
      ['warning-foreground on warning fill', t['warning-foreground'], t.warning, 4.5],
      ['primary-active differs from primary-hover', t['primary-active'], t['primary-hover'], 1.1],
      ['accent (pressed) differs from muted (hover)', t.accent, t.muted, 1.05],
      ['muted (hover) visible on card', t.muted, t.card, 1.05],
      ...(t.brand ? [['brand (links) on background', t.brand, t.background, 4.5]] : []),
    ].map(([name, a, b, min]) => ({ mode, name, ratio: +contrast(a, b).toFixed(2), min, pass: contrast(a, b) >= min }))
      // WCAG 1.4.11: a control edge needs 3:1 only when it is the sole cue. A ships a 3:1 edge; B/C ship a hairline
      // and must pair it with a visible label + --muted fill. Reported as info, never as a silent pass.
      .concat([{ mode, name: `input edge on background (${styleKey === 'A' ? '3:1 edge' : 'INFO hairline: pair with label + muted fill'})`, ratio: +contrast(t.input, t.background).toFixed(2), min: styleKey === 'A' ? 3 : 0, pass: styleKey === 'A' ? contrast(t.input, t.background) >= 3 : true }]);
  };
  return { style: styleKey, brandIn: brand, brandOklch: src, light, dark, ramp, radius: st.radius, radii: st.radii, report: [...checks('light'), ...checks('dark')] };
}

function fmt(hex, f) {
  if (f === 'hex') return hex;
  const c = hexToOklch(hex);
  if (f === 'oklch') return `oklch(${(c.L * 100).toFixed(1)}% ${c.C.toFixed(3)} ${c.H.toFixed(1)})`;
  const n = parseInt(hex.slice(1), 16), [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(v => v / 255);
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  const h = d === 0 ? 0 : mx === r ? 60 * (((g - b) / d) % 6) : mx === g ? 60 * ((b - r) / d + 2) : 60 * ((r - g) / d + 4);
  return `${((h + 360) % 360).toFixed(1)} ${(s * 100).toFixed(1)}% ${(l * 100).toFixed(1)}%`; // shadcn v3 channel form
}

export function formatPalette(r, f = 'hex') {
  const block = (sel, t) => `${sel} {\n${Object.entries(t).map(([k, v]) => `  --${k}: ${fmt(v, f)};`).join('\n')}${sel === ':root' ? `\n  --radius: ${r.radius};\n  --radius-sm: ${r.radii[0]}px;\n  --radius-md: ${r.radii[1]}px;\n  --radius-lg: ${r.radii[2]}px;\n  --radius-xl: ${r.radii[3]}px;` : ''}\n}`;
  return [
    `/* deslop palette: style ${r.style}, brand ${r.brandIn} -> oklch(${r.brandOklch.L.toFixed(2)} ${r.brandOklch.C.toFixed(3)} ${r.brandOklch.H.toFixed(0)}) */`,
    block(':root', r.light) + '\n' + block('.dark', r.dark),
    `\n/* neutral ramp (light): ${Object.entries(r.ramp).map(([k, v]) => `${k} ${v}`).join(' · ')} */`,
    '\n/* contrast report */',
    ...r.report.map(c => `/* ${c.pass ? 'ok  ' : 'FAIL'} ${c.mode.padEnd(5)} ${c.name}: ${c.ratio} (min ${c.min}) */`),
  ].join('\n');
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (!isMain) { /* imported as a module */ } else if (process.argv.includes('--self-test')) {
  for (const [brand, s] of [['#8B5CF6', 'A'], ['#8B5CF6', 'B'], ['#8B5CF6', 'C'], ['#3B82F6', 'A'], ['#22c55e', 'C'], ['#000000', 'B'], ['none', 'A'], ['#facc15', 'C']]) {
    const r = derive(brand, s);
    const fails = r.report.filter(c => !c.pass);
    if (fails.length) { console.error(`FAIL ${brand} ${s}:`, fails); process.exit(1); }
    const p = hexToOklch(s === 'B' ? r.light.brand : r.light.primary);
    if (p.C > STYLE[s].cMax + 0.005) { console.error(`FAIL ${brand} ${s}: chroma ${p.C} over cap`); process.exit(1); }
  }
  const back = hexToOklch(toHex({ L: 0.6, C: 0.1, H: 200 }));
  if (Math.abs(back.L - 0.6) > 0.01 || Math.abs(back.H - 200) > 2) { console.error('FAIL round-trip', back); process.exit(1); }
  console.log('self-test ok');
} else {
  const [brand, style] = process.argv.slice(2).filter(a => !a.startsWith('--'));
  const f = (process.argv.find(a => a.startsWith('--format=')) || '--format=hex').split('=')[1];
  if (!brand || !style) { console.error('usage: node derive-palette.mjs <brand-hex|none> <A|B|C> [--format=hex|oklch|hsl] | --self-test'); process.exit(2); }
  console.log(formatPalette(derive(brand, style.toUpperCase()), f));
}
