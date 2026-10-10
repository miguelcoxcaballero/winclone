import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright-core')); }
catch { ({ chromium } = require(process.env.WINCLONE_PLAYWRIGHT_PATH ?? '/workspace/.winclone-onboarding/node_modules/playwright-core')); }
const base = process.argv[2] ?? 'http://127.0.0.1:5173/';
const portable = process.argv.includes('--portable');
if (base.startsWith('file:')) throw new Error('This cloud browser blocks file:// navigation by policy. Use a local HTTP URL with --portable to serve only the standalone HTML, with all network access disabled.');
const browser = await chromium.launch({ executablePath: process.env.WINCLONE_CHROMIUM ?? '/usr/bin/chromium', headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, acceptDownloads: true });
if (portable) {
  const html = await readFile(process.env.WINCLONE_PORTABLE_FILE ?? path.resolve('dist/WinClone.html'), 'utf8');
  const allowed = new URL(base);
  await context.route('**/*', route => {
    const request = new URL(route.request().url());
    if (request.origin === allowed.origin && request.pathname === allowed.pathname) return route.fulfill({ status: 200, contentType: 'text/html', body: html });
    return route.abort('internetdisconnected');
  });
  await context.setOffline(true);
}
const page = await context.newPage();
page.setDefaultTimeout(8000);
const errors = [];
page.on('pageerror', e => errors.push(String(e)));
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
page.on('dialog', dialog => dialog.accept());
let passed = 0, failed = 0;
const url = app => { const u = new URL(base); u.search = app ? new URLSearchParams({ skip: '1', app }).toString() : ''; return u.href; };
const launch = async app => { await page.goto(url(app)); await page.locator(app === 'winver' ? '.wv-root' : `.wc-app[data-app="${app}"]`).waitFor({ state: 'visible' }); };
const app = id => page.locator(`.wc-app[data-app="${id}"]`);
const button = (root, name) => root.getByRole('button', { name, exact: true });
const expectText = async (locator, text) => { await locator.filter({ hasText: text }).waitFor({ state: 'visible' }); };
const dialogSave = async (title, name) => { const d = page.getByRole('dialog', { name: title, exact: true }); await d.getByLabel('Name', { exact: true }).fill(name); await button(d, 'Save').click(); await d.waitFor({ state: 'detached' }); };
const test = async (name, fn) => {
  const before = errors.length;
  try { await fn(); assert.deepEqual(errors.slice(before), [], 'No browser errors expected'); passed++; console.log(`PASS ${name}`); }
  catch(e) { failed++; console.error(`FAIL ${name}: ${e.stack}`); await mkdir('dist/test-results', { recursive: true }); await page.screenshot({ path: `dist/test-results/failure-${failed}.png` }).catch(()=>{}); }
};
try {
  await test('Normal boot, lock screen and sign-in', async () => {
    await page.goto(url()); await page.getByRole('button', { name: 'Unlock desktop' }).waitFor({ state: 'visible' });
    await page.getByRole('button', { name: 'Unlock desktop' }).click(); await button(page, 'Sign in').click(); await page.locator('.phase-desktop').waitFor();
    await page.getByRole('button', { name: 'Start', exact: true }).click(); await page.locator('.sm').waitFor({state:'visible'}); await page.keyboard.press('Escape');
  });
  for (const id of ['explorer','edge','store','settings','notepad','calculator','paint','photos','mediaplayer','clock','terminal','camera','weather','taskmgr','snippingtool','todo','mail','calendar','winver']) {
    await test(`Open ${id}`, async () => { await launch(id); assert(!await page.getByText('Temporary body used').count()); });
  }
  await test('Calculator: arithmetic, decimals, zero division and recovery', async () => {
    await launch('calculator');const root=app('calculator');
    for(const k of ['2','+','3','='])await button(root,k).click();assert.equal(await root.getByLabel('Result').innerText(),'5');
    for(const k of ['C','1','.','5','×','2','='])await button(root,k).click();assert.equal(await root.getByLabel('Result').innerText(),'3');
    for(const k of ['C','9','÷','0','='])await button(root,k).click();assert.match(await root.getByLabel('Result').innerText(),/zero/);
    await button(root,'7').click();assert.equal(await root.getByLabel('Result').innerText(),'7');
  });
  await test('Notepad save, export, reload and Explorer file association', async () => {
    await launch('notepad');const root=app('notepad');await root.getByLabel('Document text').fill('A note that survives a reload.\nSecond line.');await button(root,'Save').click();await dialogSave('Save to Documents','Browser test.txt');
    const downloading=page.waitForEvent('download');await button(root,'Export .txt').click();const d=await downloading;assert.equal(d.suggestedFilename(),'Browser test.txt');assert.match(await readFile(await d.path(),'utf8'),/survives a reload/);
    await launch('explorer');const file=app('explorer').getByRole('row').filter({hasText:'Browser test.txt'});await file.waitFor();await file.dblclick();await app('notepad').waitFor();assert.match(await app('notepad').getByLabel('Document text').inputValue(),/survives a reload/);
  });
  await test('Notepad protects unsaved edits on close',async()=>{
    await launch('notepad');await app('notepad').getByLabel('Document text').fill('Unsaved');const close=page.locator('.win[data-app="notepad"] button[title="Close"]');await close.click();const dialog=page.getByRole('dialog',{name:'Unsaved changes'});await dialog.waitFor();await button(dialog,'Cancel').click();assert.equal(await app('notepad').getByLabel('Document text').inputValue(),'Unsaved');await close.click();await button(page.getByRole('dialog',{name:'Unsaved changes'}),'Discard').click();await app('notepad').waitFor({state:'detached'});
  });
  await test('Explorer creates, renames, copies, recycles and restores files',async()=>{
    await launch('explorer');let root=app('explorer');await button(root,'New text file').click();await dialogSave('New text file','Scratch.txt');const file=root.getByRole('row').filter({hasText:'Scratch.txt'});await file.click();await button(root,'Rename').click();await dialogSave('Rename','Renamed.txt');await root.getByRole('row').filter({hasText:'Renamed.txt'}).click();await button(root,'Copy').click();await button(root,'Paste').click();await root.getByRole('row').filter({hasText:'Renamed - Copy.txt'}).waitFor();await button(root,'Delete').click();await root.getByRole('row').filter({hasText:'Renamed.txt'}).waitFor({state:'detached'});await root.getByRole('button',{name:'Recycle Bin',exact:true}).click();await root.getByRole('row').filter({hasText:'Renamed.txt'}).click();await button(root,'Restore').click();await root.getByRole('button',{name:'Documents',exact:true}).click();await root.getByRole('row').filter({hasText:'Renamed.txt'}).waitFor();
  });
  await test('Paint draws and saves a real image to Photos',async()=>{
    await launch('paint');const canvas=app('paint').getByLabel('Drawing canvas');const box=await canvas.boundingBox();await page.mouse.move(box.x+40,box.y+40);await page.mouse.down();await page.mouse.move(box.x+100,box.y+100,{steps:10});await page.mouse.up();assert.equal(await canvas.evaluate(c=>c.getContext('2d').getImageData(60,60,1,1).data[2]),212);await button(app('paint'),'Save picture').click();await dialogSave('Save to Pictures','Browser drawing.png');await launch('photos');await app('photos').getByRole('button').filter({hasText:'Browser drawing.png'}).click();const image=app('photos').getByRole('img',{name:'Browser drawing.png',exact:true});await image.waitFor();assert(await image.evaluate(i=>i.complete&&i.naturalWidth===900));
  });
  await test('To Do creates, completes and persists tasks',async()=>{
    await launch('todo');await app('todo').getByLabel('New task').fill('Try the portable desktop');await button(app('todo'),'Add task').click();await app('todo').getByLabel('Complete Try the portable desktop').check();await page.reload();await app('todo').waitFor();assert(await app('todo').getByLabel('Complete Try the portable desktop').isChecked());await button(app('todo'),'Completed').click();await expectText(app('todo').locator('.todo-item'),'Try the portable desktop');
  });
  await test('Calendar creates and persists an event',async()=>{
    await launch('calendar');await button(app('calendar'),'New event').click();const d=page.getByRole('dialog',{name:'New event'});await d.getByLabel('Event title').fill('Desktop review');await button(d,'Save event').click();await page.reload();await app('calendar').waitFor();await expectText(app('calendar').locator('.app-card'),'Desktop review');
  });
  await test('Local mail composes and retains a message without sending traffic',async()=>{
    await launch('mail');await button(app('mail'),'New mail').click();const d=page.getByRole('dialog',{name:'Write a message'});await d.getByLabel('To',{exact:true}).fill('test@example.com');await d.getByLabel('Subject',{exact:true}).fill('A local test message');await d.getByLabel('Message',{exact:true}).fill('This stays on my device.');await button(d,'Send locally').click();await expectText(app('mail').locator('.app-status'),'No email was transmitted');await page.reload();await app('mail').waitFor();await button(app('mail'),'Sent Items').click();await app('mail').locator('.mail-list button').filter({hasText:'A local test message'}).click();await expectText(app('mail').locator('.mail-reader'),'This stays on my device.');
  });
  await test('Settings changes theme and persists wallpaper',async()=>{
    await launch('settings');await button(app('settings'),'Personalization').click();await app('settings').getByLabel('Theme',{exact:true}).selectOption('dark');await app('settings').getByRole('button',{name:'Dune',exact:true}).click();await page.reload();await app('settings').waitFor();assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');assert.match(await page.locator('html').evaluate(el=>el.style.getPropertyValue('--wallpaper')),portable?/data:image/:/dune/);
  });
  await test('Terminal writes and reads a virtual file',async()=>{
    await launch('terminal');const command=app('terminal').getByLabel('Terminal command');for(const line of ['cd Documents','write terminal.txt "Created from the terminal"','cat terminal.txt']){await command.fill(line);await command.press('Enter');}await expectText(app('terminal').locator('.terminal-output'),'Created from the terminal');await launch('explorer');await app('explorer').getByRole('row').filter({hasText:'terminal.txt'}).dblclick();await app('notepad').waitFor();assert.equal(await app('notepad').getByLabel('Document text').inputValue(),'Created from the terminal');
  });
  await test('Clock stopwatch advances and pauses',async()=>{
    await launch('clock');await button(app('clock'),'Stopwatch').click();await button(app('clock'),'Start').click();await page.waitForFunction(()=>document.querySelector('[aria-label="Stopwatch elapsed"]')?.textContent!=='00:00:00');await button(app('clock'),'Pause').click();const elapsed=await app('clock').getByLabel('Stopwatch elapsed').innerText();assert.notEqual(elapsed,'00:00:00');await button(app('clock'),'Reset').click();assert.equal(await app('clock').getByLabel('Stopwatch elapsed').innerText(),'00:00:00');
  });
  await test('Quick settings, search and Task View work',async()=>{
    await launch('notepad');await page.getByRole('button',{name:'Network, Volume, Battery',exact:true}).click();await page.getByRole('region',{name:'Quick settings'}).waitFor();await page.getByLabel('Volume',{exact:true}).fill('28');assert.equal(await page.evaluate(()=>window.wc.settings.getState().volume),28);await page.keyboard.press('Escape');await page.locator('.tb-search').click();await page.getByLabel('Search apps and files').fill('calculator');await page.locator('.search-flyout').getByRole('button',{name:'Calculator App',exact:true}).click();await app('calculator').waitFor();await page.getByRole('button',{name:'Task View',exact:true}).click();await page.locator('.taskview-card').filter({hasText:'Notepad'}).click();await page.locator('.taskview-overlay').waitFor({state:'detached'});
  });
  await test('Shutdown and restart return to a working desktop',async()=>{
    await page.evaluate(()=>window.wc.shell.getState().setPhase('shutting-down'));await page.getByRole('button',{name:'Start desktop'}).waitFor();await button(page,'Start desktop').click();await page.getByRole('button',{name:'Unlock desktop'}).waitFor();await page.getByRole('button',{name:'Unlock desktop'}).click();await button(page,'Sign in').click();await page.locator('.phase-desktop').waitFor();
  });
  await test('All wallpapers decode; no runtime errors remain',async()=>{
    await launch('settings');await button(app('settings'),'Personalization').click();await page.waitForFunction(()=>[...document.querySelectorAll('.settings-wallpapers img')].every(i=>i.complete&&i.naturalWidth>0));assert.deepEqual(errors,[]);
    await page.evaluate(()=>window.wc.windows.getState().open('notepad'));await app('notepad').waitFor();await mkdir('dist/test-results',{recursive:true});await page.screenshot({path:portable?'dist/test-results/portable-desktop.png':'dist/test-results/desktop.png'});
  });
} finally { await browser.close(); }
console.log(`${passed} passed, ${failed} failed (${portable?'standalone HTML, offline, local HTTP fixture':'development/hosted build'})`);
if(failed)process.exitCode=1;
