// Produce a self-contained HTML that runs from file:// without a web server.
import { build } from 'vite';
import { readFile, readdir, writeFile, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const temporary = path.join(root, 'dist', '.portable');
await build({ root, build: { outDir: temporary, emptyOutDir: true, cssCodeSplit: false, modulePreload: false, assetsInlineLimit: Number.MAX_SAFE_INTEGER, rolldownOptions: { output: { codeSplitting: false } } } });
let html = await readFile(path.join(temporary, 'index.html'), 'utf8');
const scripts = [...html.matchAll(/<script\b[^>]*src="([^"]+)"[^>]*><\/script>/g)];
if (scripts.length !== 1) throw new Error(`Expected one bundled script, got ${scripts.length}`);
const js = await readFile(path.join(temporary, scripts[0][1]), 'utf8');
html = html.replace(scripts[0][0], () => `<script type="module">${js.replace(/<\/script/gi, '<\\/script')}</script>`);
for (const match of [...html.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g)]) {
  const css = await readFile(path.join(temporary, match[1]), 'utf8');
  html = html.replace(match[0], () => `<style>${css.replace(/<\/style/gi, '<\\/style')}</style>`);
}
const assets = {};
for (const filename of await readdir(path.join(root, 'public', 'wallpapers'))) {
  assets[`wallpapers/${filename}`] = `data:image/jpeg;base64,${(await readFile(path.join(root, 'public', 'wallpapers', filename))).toString('base64')}`;
}
const favicon = `data:image/svg+xml;base64,${(await readFile(path.join(root, 'public', 'favicon.svg'))).toString('base64')}`;
html = html.replace(/href="\.\/favicon\.svg"/, `href="${favicon}"`);
// The asset map must exist before the application modules initialize.
html = html.replace('<head>', `<head><script>window.__WINCLONE_ASSETS__=${JSON.stringify(assets)};</script>`);
if (/<script[^>]+src=|<link[^>]+rel="(?:stylesheet|modulepreload)"/.test(html)) throw new Error('Portable build still has external application assets');
await mkdir(path.join(root, 'dist'), { recursive: true });
const output = path.join(root, 'dist', 'WinClone.html');
await writeFile(output, html);
await rm(temporary, { recursive: true, force: true });
console.log(`Portable version: ${output} (${(Buffer.byteLength(html) / 1024 / 1024).toFixed(2)} MB)`);
