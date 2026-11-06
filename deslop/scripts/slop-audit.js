// Paste into a browser console (or run via a browser automation JS tool) on a rendered page.
// Returns a JSON "slop fingerprint" + score. Read-only: it never mutates the page.
(() => {
  const els = [...document.querySelectorAll('body *')].filter(e => e.offsetParent !== null || e.tagName === 'svg');
  // Paint each color to a 1px canvas so oklch()/lab()/color() (Tailwind v4) resolve to sRGB too.
  const cx = Object.assign(document.createElement('canvas'), { width: 1, height: 1 }).getContext('2d', { willReadFrequently: true }), memo = {};
  const parse = c => { if (!c || c === 'transparent' || c === 'rgba(0, 0, 0, 0)') return null; if (c in memo) return memo[c]; cx.clearRect(0, 0, 1, 1); cx.fillStyle = '#000'; cx.fillStyle = c; cx.fillRect(0, 0, 1, 1); const [r, g, b, a] = cx.getImageData(0, 0, 1, 1).data; return memo[c] = { r, g, b, a: a / 255 }; };
  const COLOR = /(?:rgba?|hsla?|oklch|oklab|lab|lch|color)\([^)]*\)/g;
  const hue = ({ r, g, b }) => { r /= 255; g /= 255; b /= 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn; if (d < 0.08) return null; let h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; return (h * 60 + 360) % 360; };
  const bucket = h => h == null ? 'neutral' : h < 20 || h >= 330 ? 'red/pink' : h < 50 ? 'orange' : h < 70 ? 'yellow' : h < 170 ? 'green' : h < 200 ? 'cyan' : h < 245 ? 'blue' : h < 290 ? 'indigo/violet' : 'purple/magenta';
  const hues = {}, fonts = {}, radii = {}, sizes = {};
  let gradients = 0, gradientText = 0, blur = 0, glow = 0, blobs = 0, pulse = 0, accentArea = 0;
  for (const e of els) {
    const s = getComputedStyle(e);
    for (const c of [s.color, s.backgroundColor, s.borderTopColor]) { const p = parse(c); if (p && p.a > 0.05) { const k = bucket(hue(p)); hues[k] = (hues[k] || 0) + 1; } }
    // Colour budget: painted area of chromatic fills (solid or gradient). Overlaps double-count; it's an indicator.
    const bgp = parse(s.backgroundColor), chromaFill = (bgp && bgp.a > 0.5 && hue(bgp) != null) || /gradient/.test(s.backgroundImage) && [...s.backgroundImage.matchAll(COLOR)].some(m => { const p = parse(m[0]); return p && p.a > 0.3 && hue(p) != null; });
    if (chromaFill) { const r = e.getBoundingClientRect(); accentArea += r.width * r.height; }
    if (/gradient/.test(s.backgroundImage)) {
      gradients++;
      if (s.webkitBackgroundClip === 'text' || s.backgroundClip === 'text') gradientText++;
      for (const m of s.backgroundImage.matchAll(COLOR)) { const p = parse(m[0]); if (!p || p.a < 0.05) continue; const k = bucket(hue(p)); hues[k] = (hues[k] || 0) + 3; }
    }
    if (s.backdropFilter && s.backdropFilter !== 'none') blur++;
    if (/blur\((\d{2,})/.test(s.filter) && s.position === 'absolute') blobs++;
    for (const m of (s.boxShadow || '').matchAll(/((?:rgba?|oklch|oklab|lab|hsla?|color)\([^)]*\))\s+(-?\d+)px\s+(-?\d+)px\s+(\d+)px/g)) { const p = parse(m[1]); if (p && p.a > 0.1 && hue(p) != null && +m[4] >= 15) { glow++; break; } }
    if (/pulse|bounce|float|glow|shimmer/i.test(s.animationName)) pulse++;
    if (e.childNodes.length && [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) {
      const f = s.fontFamily.split(',')[0].replace(/["']/g, '').trim(); fonts[f] = (fonts[f] || 0) + 1;
      sizes[Math.round(parseFloat(s.fontSize))] = (sizes[Math.round(parseFloat(s.fontSize))] || 0) + 1;
    }
    const r = parseFloat(s.borderTopLeftRadius); if (r > 0 && (s.backgroundColor !== 'rgba(0, 0, 0, 0)' || s.borderTopWidth !== '0px')) radii[r] = (radii[r] || 0) + 1;
  }
  const text = document.body.innerText;
  const buzz = ['seamless', 'revolution', 'unlock', 'empower', 'ai-powered', 'next-gen', 'supercharge', 'transform', 'effortless', 'cutting-edge', 'elevate', 'streamline', 'game-chang', 'unleash', 'harness', 'journey', 'reimagin', 'in seconds', 'all-in-one', 'powerful', 'leverage', 'world-class', 'trusted by']
    .filter(w => text.toLowerCase().includes(w));
  const emoji = (text.match(/(?![©®™])\p{Extended_Pictographic}/gu) || []).length;
  const lucide = document.querySelectorAll('svg.lucide, svg[class*="lucide"]').length;
  const h1 = (document.querySelector('h1') || {}).innerText || '';
  // Card-grid repetition: containers whose 3/4/6 children share the same class signature.
  let cardGrids = 0;
  for (const e of document.querySelectorAll('div,ul,section')) { const k = [...e.children]; if ([3, 4, 6].includes(k.length) && k.every(c => c.className && c.className === k[0].className) && k[0].querySelector('svg') && k[0].querySelector('h3,h4,p')) cardGrids++; }
  const totalChroma = Object.entries(hues).filter(([k]) => k !== 'neutral').reduce((a, [, v]) => a + v, 0) || 1;
  const blueViolet = ((hues['blue'] || 0) + (hues['indigo/violet'] || 0) + (hues['purple/magenta'] || 0)) / totalChroma;
  const top = (o, n = 6) => Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, n);
  // Hue alone is a weak signal (Stripe is indigo and premium); execution tells carry the weight.
  // Calibrated 2026-11: Linear ~11, Stripe ~39, Lovable/v0 landing pages 74-99.
  const font = (top(fonts, 1)[0] || [''])[0].toLowerCase();
  const stockFont = /^(ui-sans-serif|system-ui|-apple-system|arial|helvetica|poppins|plus jakarta sans|outfit|space grotesk|dm sans|manrope|montserrat|roboto)$/.test(font);
  const customFont = font && !stockFont && !/^(inter|geist|open sans|lato|nunito|raleway|work sans|sora|urbanist)/.test(font);
  const cardRadius = +((top(radii, 3).find(([r]) => +r < 1000) || [0])[0]);
  const score = Math.max(0, Math.round(Math.min(100,
    blueViolet * 10 + Math.min(gradientText, 3) * 8 + Math.min(glow, 5) * 3 + Math.min(blur, 8) * 1.5 + Math.min(blobs, 4) * 3 +
    Math.min(pulse, 5) * 2 + Math.min(buzz.length, 8) * 1.5 + Math.min(emoji, 10) * 1.5 + Math.min(cardGrids, 4) * 2 +
    (lucide > 8 ? 8 : 0) + (stockFont ? 4 : 0) + (cardRadius >= 16 ? 6 : 0) - (customFont ? 10 : 0))));
  const verdict = score >= 50 ? 'slop' : score >= 25 ? 'borderline' : 'clean';
  // Budget diagnostics (not in the score, so the calibration above holds). Targets: color.md §1, components.md §2.
  const docArea = document.documentElement.scrollWidth * document.documentElement.scrollHeight || 1;
  const budget = {
    accentAreaPct: +(100 * accentArea / docArea).toFixed(1),
    chromaticHueFamilies: Object.entries(hues).filter(([k, v]) => k !== 'neutral' && v >= 3).map(([k]) => k),
    distinctRadii: Object.keys(radii).filter(r => +r < 1000).length,
  };
  return window.__slop = { url: location.href, h1: h1.slice(0, 120), slopScore: score, verdict, budget, blueVioletShareOfChroma: +blueViolet.toFixed(2), hues: top(hues, 9), fonts: top(fonts, 4), fontSizes: top(sizes, 8), radii: top(radii, 5), gradients, gradientText, backdropBlur: blur, coloredGlowShadows: glow, blurBlobs: blobs, loopingAnims: pulse, lucideIcons: lucide, emoji, iconCardGrids: cardGrids, buzzwords: buzz };
})();
