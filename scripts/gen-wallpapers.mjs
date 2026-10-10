// Renders the original wallpaper artwork (SVG) to JPEG files in public/wallpapers.
// Usage: NODE_PATH=$(npm root -g) node scripts/gen-wallpapers.mjs
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const W = 2560, H = 1440;
const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'wallpapers');
mkdirSync(out, { recursive: true });

// Deterministic PRNG so renders are reproducible
function rng(seed) { return () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646; }

function ribbons({ bg1, bg2, colors, glow, seed, dark }) {
  const r = rng(seed);
  let paths = '';
  colors.forEach((c, i) => {
    const y0 = 380 + i * 95 + r() * 60;
    const amp = 160 + r() * 140;
    const ph = r() * Math.PI * 2;
    const pts = [];
    for (let x = -200; x <= W + 200; x += 80) {
      const y = y0 + Math.sin(x / 520 + ph) * amp + Math.sin(x / 210 + ph * 2) * 26;
      pts.push([x, y]);
    }
    const thick = 70 + r() * 90;
    const top = pts.map(([x, y], k) => `${k ? 'L' : 'M'}${x},${y.toFixed(1)}`).join(' ');
    const bottom = pts.slice().reverse().map(([x, y]) => `L${x},${(y + thick + Math.sin(x / 300) * 30).toFixed(1)}`).join(' ');
    paths += `<path d="${top} ${bottom} Z" fill="url(#rb${i})" opacity="${dark ? 0.85 : 0.75}" filter="url(#soft)"/>`;
  });
  const grads = colors.map((c, i) => `<linearGradient id="rb${i}" x1="0" y1="0" x2="1" y2="0.3"><stop offset="0" stop-color="${c[0]}" stop-opacity="0"/><stop offset="0.35" stop-color="${c[0]}"/><stop offset="0.7" stop-color="${c[1]}"/><stop offset="1" stop-color="${c[1]}" stop-opacity="0.1"/></linearGradient>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0.4" y2="1"><stop offset="0" stop-color="${bg1}"/><stop offset="1" stop-color="${bg2}"/></linearGradient>
    <radialGradient id="glow" cx="0.62" cy="0.55" r="0.55"><stop offset="0" stop-color="${glow}" stop-opacity="0.9"/><stop offset="1" stop-color="${glow}" stop-opacity="0"/></radialGradient>
    <filter id="soft" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="6"/></filter>
    <filter id="blur" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="60"/></filter>
    ${grads}
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)"/>
  <rect width="100%" height="100%" fill="url(#glow)"/>
  <g filter="url(#blur)" opacity="0.6">${paths}</g>
  <g>${paths}</g>
</svg>`;
}

function glows({ bg, blobs, ring }) {
  const b = blobs.map(([cx, cy, rad, col, op]) => `<circle cx="${cx}" cy="${cy}" r="${rad}" fill="${col}" opacity="${op}"/>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs><filter id="b" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="140"/></filter>
  <filter id="b2" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="14"/></filter>
  <linearGradient id="ring" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${ring[0]}"/><stop offset="1" stop-color="${ring[1]}"/></linearGradient></defs>
  <rect width="100%" height="100%" fill="${bg}"/>
  <g filter="url(#b)">${b}</g>
  <circle cx="${W * 0.58}" cy="${H * 0.52}" r="420" fill="none" stroke="url(#ring)" stroke-width="26" opacity="0.55" filter="url(#b2)"/>
  <circle cx="${W * 0.58}" cy="${H * 0.52}" r="420" fill="none" stroke="url(#ring)" stroke-width="6" opacity="0.9"/>
</svg>`;
}

function aurora() {
  const r = rng(7);
  let stars = '';
  for (let i = 0; i < 260; i++) stars += `<circle cx="${(r() * W).toFixed(0)}" cy="${(r() * H * 0.7).toFixed(0)}" r="${(r() * 1.8 + 0.4).toFixed(1)}" fill="#fff" opacity="${(r() * 0.7 + 0.2).toFixed(2)}"/>`;
  const curtain = (y, col, op, ph) => {
    let d = `M-100,${y}`;
    for (let x = -100; x <= W + 100; x += 60) d += ` L${x},${(y + Math.sin(x / 380 + ph) * 120 + Math.sin(x / 140 + ph) * 25).toFixed(1)}`;
    d += ` L${W + 100},${y - 600} L-100,${y - 600} Z`;
    return `<path d="${d}" fill="url(#${col})" opacity="${op}"/>`;
  };
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#030b1a"/><stop offset="0.6" stop-color="#0a2a33"/><stop offset="1" stop-color="#0c3a35"/></linearGradient>
    <linearGradient id="g1" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#3cf2a0" stop-opacity="0.9"/><stop offset="0.5" stop-color="#22c38e" stop-opacity="0.35"/><stop offset="1" stop-color="#7a4dff" stop-opacity="0"/></linearGradient>
    <linearGradient id="g2" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#9b6bff" stop-opacity="0.8"/><stop offset="1" stop-color="#3cf2a0" stop-opacity="0"/></linearGradient>
    <filter id="b" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="40"/></filter>
    <linearGradient id="hill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#06161a"/><stop offset="1" stop-color="#020809"/></linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#sky)"/>
  ${stars}
  <g filter="url(#b)">${curtain(820, 'g1', 0.9, 0.4)}${curtain(700, 'g2', 0.6, 2.1)}${curtain(900, 'g1', 0.5, 4)}</g>
  <path d="M0,1180 C400,1080 700,1150 1100,1100 C1500,1050 1900,1160 2560,1080 L2560,1440 L0,1440 Z" fill="url(#hill)"/>
  <path d="M0,1280 C500,1220 900,1300 1400,1250 C1900,1200 2200,1290 2560,1240 L2560,1440 L0,1440 Z" fill="#010506"/>
</svg>`;
}

function layered({ sky, layers, sun }) {
  const r = rng(layers.length * 13 + 5);
  let shapes = '';
  layers.forEach(([col, base, amp, freq], i) => {
    let d = `M0,${H}`;
    for (let x = 0; x <= W; x += 40) {
      const y = base + Math.sin(x / freq + i * 1.7) * amp + Math.sin(x / (freq / 3.1) + i) * amp * 0.25;
      d += ` L${x},${y.toFixed(1)}`;
    }
    d += ` L${W},${H} Z`;
    shapes += `<path d="${d}" fill="${col}"/>`;
  });
  void r;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">${sky.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join('')}</linearGradient>
    <radialGradient id="sun" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="${sun?.[2] ?? '#fff'}" stop-opacity="0.95"/><stop offset="0.25" stop-color="${sun?.[2] ?? '#fff'}" stop-opacity="0.5"/><stop offset="1" stop-color="${sun?.[2] ?? '#fff'}" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#sky)"/>
  ${sun ? `<circle cx="${sun[0]}" cy="${sun[1]}" r="520" fill="url(#sun)"/>` : ''}
  ${shapes}
</svg>`;
}

const designs = {
  'flow-light': ribbons({
    bg1: '#eaf3fd', bg2: '#bcd6f2', glow: '#ffffff', seed: 11, dark: false,
    colors: [['#7fb6f5', '#2d7be0'], ['#a6cdfa', '#3f8fea'], ['#5fa3f0', '#1a5fc8'], ['#c7e0fc', '#5aa2f2'], ['#3c8ae6', '#0f4fb0']],
  }),
  'flow-dark': ribbons({
    bg1: '#050b1c', bg2: '#0b1d44', glow: '#1b4fb8', seed: 11, dark: true,
    colors: [['#2a6cf0', '#56c6ff'], ['#1e4fd0', '#3aa0ff'], ['#3d86ff', '#0e3aa8'], ['#1c3f9e', '#5fd2ff'], ['#2f74ff', '#123a9a']],
  }),
  glow: glows({
    bg: '#0d0b24',
    blobs: [[700, 500, 520, '#6b2cf5', 0.85], [1800, 950, 600, '#e0359a', 0.6], [1500, 300, 380, '#2b7bff', 0.7], [400, 1200, 400, '#1fb7c9', 0.5]],
    ring: ['#ffffff', '#c58bff'],
  }),
  aurora: aurora(),
  dune: layered({
    sky: [['0', '#f7d9b5'], ['0.55', '#f3b98a'], ['1', '#e59a6c']],
    sun: [1800, 520, '#fff6e0'],
    layers: [['#e9a978', 880, 60, 520], ['#d98f5f', 980, 80, 700], ['#c47a4d', 1100, 70, 460], ['#a9643d', 1240, 50, 600], ['#8a4f30', 1360, 30, 380]],
  }),
  lagoon: layered({
    sky: [['0', '#bff0f2'], ['0.6', '#7fd3dd'], ['1', '#45b5c6']],
    sun: [700, 380, '#ffffff'],
    layers: [['#4fc1cf', 860, 40, 420], ['#2ea7bb', 960, 55, 560], ['#1b8ea6', 1080, 45, 380], ['#0f7590', 1200, 35, 520], ['#0a5c76', 1330, 25, 300]],
  }),
  ember: glows({
    bg: '#16070b',
    blobs: [[900, 700, 560, '#c2263a', 0.8], [1700, 500, 460, '#ff7a2f', 0.6], [1300, 1150, 500, '#7a1450', 0.7], [300, 300, 300, '#ff4d4d', 0.35]],
    ring: ['#ffd2a8', '#ff6b4a'],
  }),
  mist: layered({
    sky: [['0', '#eef0f6'], ['1', '#d3d6e2']],
    sun: [1300, 600, '#ffffff'],
    layers: [['#c5c9da', 820, 90, 600], ['#b0b5cc', 940, 110, 480], ['#9aa0bb', 1070, 90, 640], ['#8289a8', 1210, 70, 420], ['#6c7394', 1340, 40, 560]],
  }),
  'lock-ridge': layered({
    sky: [['0', '#1b2b4a'], ['0.5', '#3f5f8c'], ['1', '#c58c7c']],
    sun: [1650, 980, '#ffd9b0'],
    layers: [['#5b6f93', 820, 160, 300], ['#45587c', 930, 140, 260], ['#334465', 1050, 120, 340], ['#223150', 1190, 90, 280], ['#141f36', 1330, 50, 360]],
  }),
  'lock-coast': layered({
    sky: [['0', '#5b9bd5'], ['0.6', '#a9d0ee'], ['1', '#e9f3fb']],
    sun: [600, 420, '#ffffff'],
    layers: [['#7fb3d6', 1000, 8, 900], ['#5c97c1', 1060, 10, 700], ['#2f5f4a', 1150, 120, 260], ['#1f4535', 1260, 90, 220], ['#16302a', 1380, 40, 300]],
  }),
};

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: W, height: H } });
for (const [name, svg] of Object.entries(designs)) {
  // Preserve the bundled Bloom reference photographs.
  if (name === 'flow-light' || name === 'flow-dark') continue;
  writeFileSync(join(out, `${name}.svg.tmp`), svg);
  await page.setContent(`<html><body style="margin:0;overflow:hidden">${svg}</body></html>`);
  await page.screenshot({ path: join(out, `${name}.jpg`), type: 'jpeg', quality: 86 });
  console.log('rendered', name);
}
await browser.close();
const { readdirSync, unlinkSync } = await import('node:fs');
for (const f of readdirSync(out)) if (f.endsWith('.tmp')) unlinkSync(join(out, f));
console.log('done – create thumbnails with: python3 scripts/thumbs.py');
