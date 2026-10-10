// Screenshot helper for development.
//
//   node scripts/shot.mjs "<query>" <out.png> [--port 5173] [--w 1920] [--h 1080] [--wait 1500]
//                         [--eval "<js run in page before the shot>"] [--click "<css selector>"]...
//
// Example:
//   node scripts/shot.mjs "app=calculator&theme=dark" /tmp/calc.png --port 5174
//
// Requires a running dev server (npm run dev -- --port <port>).
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';

const require = createRequire(import.meta.url);
let playwright;
try { playwright = require('playwright'); } catch {
  const root = execSync('npm root -g').toString().trim();
  playwright = require(`${root}/playwright`);
}

const [, , query = 'skip=1', out = 'shot.png', ...rest] = process.argv;
const opt = { port: '5173', w: '1920', h: '1080', wait: '1500', eval: [], click: [] };
for (let i = 0; i < rest.length; i += 2) {
  const k = rest[i].replace(/^--/, '');
  if (k === 'eval' || k === 'click') opt[k].push(rest[i + 1]);
  else opt[k] = rest[i + 1];
}

const browser = await playwright.chromium.launch({ args: ['--font-render-hinting=none'] });
const page = await browser.newPage({ viewport: { width: +opt.w, height: +opt.h }, deviceScaleFactor: 1 });
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
await page.goto(`http://localhost:${opt.port}/?reset=1&${query}`, { waitUntil: 'networkidle' });
await page.waitForTimeout(+opt.wait);
for (const sel of opt.click) { await page.click(sel); await page.waitForTimeout(500); }
for (const js of opt.eval) { await page.evaluate(js); await page.waitForTimeout(600); }
await page.screenshot({ path: out });
if (errors.length) console.log('PAGE ERRORS:\n' + errors.join('\n'));
console.log('saved', out);
await browser.close();
