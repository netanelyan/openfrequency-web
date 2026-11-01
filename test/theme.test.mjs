// Light or dark (the owner, 2026-11-01: "make light mode the default, and an easy option to switch to dark mode"). The
// site is light whatever the device prefers; the button in every page's header turns dark on and off, the choice is
// kept in the browser (THEME_KEY) and put back by the head's script before the page paints, the way the accessibility
// switches are, under the same Content-Security-Policy (each inline script by its hash, nothing else). Without storage
// the page is light and the button still works for the visit.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
import { THEME_COLOR, THEME_KEY } from '../src/layout.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = fs.mkdtempSync(path.join(os.tmpdir(), 'of-theme-'));
const TYPES = { '.html': 'text/html; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2' };
let server, browser, origin;
const html = {};

before(async () => {
  const b = spawnSync(process.execPath, ['build.mjs'], { cwd: ROOT, env: { ...process.env, SITE_OUT: out }, encoding: 'utf8' });
  assert.equal(b.status, 0, `the build failed:\n${b.stdout}\n${b.stderr}`);
  for (const f of fs.readdirSync(out, { recursive: true })) {
    const rel = String(f).replace(/\\/g, '/');
    if (rel.endsWith('.html') && rel !== 'toran/example/index.html') html['/' + rel.replace(/(^|\/)index\.html$/, '$1')] = fs.readFileSync(path.join(out, f), 'utf8');
  }
  server = http.createServer((req, res) => {
    const p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    const file = [p, path.join(p, 'index.html')].map((f) => path.join(out, f)).find((f) => f.startsWith(out) && fs.existsSync(f) && fs.statSync(f).isFile());
    const send = file || path.join(out, '404.html');
    res.writeHead(file ? 200 : 404, { 'Content-Type': TYPES[path.extname(send)] || 'application/octet-stream' });
    res.end(fs.readFileSync(send));
  });
  await new Promise((ok) => server.listen(0, '127.0.0.1', ok));
  origin = `http://127.0.0.1:${server.address().port}`;
  for (const opts of [{}, { channel: 'chrome' }]) {
    try { browser = await chromium.launch(opts); break; } catch {}
  }
  assert.ok(browser, 'no browser for the theme check (install one: npx playwright-core install chromium)');
});

after(async () => {
  await browser?.close();
  server?.close();
  fs.rmSync(out, { recursive: true, force: true });
});

test('every page: light in its markup, the button in the header, dark read back in the head, and the policy as strict', () => {
  assert.ok(Object.keys(html).length >= 14, 'every page was built');
  const css = fs.readFileSync(path.join(ROOT, 'src/style.css'), 'utf8');
  assert.doesNotMatch(css, /prefers-color-scheme/, "the device's preference never turns the page dark");
  assert.match(css, /:root\[data-theme="dark"\] \{/, 'the dark tokens');
  // The accessibility statement says so, under its own date (legal.accessibilityUpdated).
  const statement = html['/accessibility/'].replace(/<[^>]+>/g, '');
  assert.match(statement, /האתר מוצג בצבעים בהירים\. בכפתור עם הירח בראש כל עמוד עוברים למצב כהה/);
  assert.doesNotMatch(statement, /הגדרות המערכת שלכם: מצב כהה/);
  assert.match(statement, /עודכן לאחרונה ב-1 בנובמבר 2026/);
  const js = fs.readFileSync(path.join(ROOT, 'src/site.js'), 'utf8');
  assert.ok(js.includes(`'${THEME_KEY}'`) && js.includes(THEME_COLOR.dark) && js.includes(THEME_COLOR.light), 'site.js keeps the same key and colours as the head');
  for (const [p, page] of Object.entries(html)) {
    const head = page.slice(0, page.indexOf('</head>'));
    assert.match(head, /<meta name="color-scheme" content="light">/, p);
    assert.equal((head.match(/<meta name="theme-color"/g) || []).length, 1, `${p}: one theme colour`);
    assert.ok(head.includes(`<meta name="theme-color" content="${THEME_COLOR.light}">`), p);
    assert.ok(head.includes(`localStorage.getItem('${THEME_KEY}')==='dark'`), `${p}: the head puts dark back before the page paints`);
    assert.doesNotMatch(page, /<html[^>]*data-theme/, `${p}: no theme in the markup, so it is light`);
    const bar = /<div class="bar">[\s\S]*?<\/header>/.exec(page)?.[0] || '';
    assert.equal((bar.match(/<button class="theme" type="button" data-theme-toggle aria-pressed="false" aria-label="מצב כהה">/g) || []).length, 1, `${p}: the button in the header`);
    const csp = /<meta http-equiv="Content-Security-Policy" content="([^"]+)">/.exec(page)[1];
    const scripts = /script-src ([^;]+)/.exec(csp)[1];
    assert.doesNotMatch(scripts, /unsafe|\*|http/, `${p}: script-src is hashes only (${scripts})`);
  }
});

test('in a browser, on a device that prefers dark: light first, dark with one tap, kept on the next page before it paints, and light again', async () => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, colorScheme: 'dark' });
  // What the page is at the moment <body> starts (before anything in it can paint), and any policy violation.
  await ctx.addInitScript(() => {
    window.__violations = [];
    document.addEventListener('securitypolicyviolation', (e) => window.__violations.push(`${e.violatedDirective} ${e.blockedURI}`));
    new MutationObserver((_, o) => { if (document.body) { window.__atBody = document.documentElement.getAttribute('data-theme'); o.disconnect(); } }).observe(document, { childList: true, subtree: true });
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  const state = () => page.evaluate((k) => ({
    theme: document.documentElement.getAttribute('data-theme'),
    atBody: window.__atBody,
    pressed: document.querySelector('.theme').getAttribute('aria-pressed'),
    bg: getComputedStyle(document.body).backgroundColor,
    scheme: getComputedStyle(document.documentElement).colorScheme,
    color: document.querySelector('meta[name=theme-color]').getAttribute('content'),
    saved: localStorage.getItem(k),
    violations: window.__violations,
  }), THEME_KEY);

  await page.goto(`${origin}/`);
  let s = await state();
  assert.equal(s.atBody, null, 'nothing saved: no theme set in the head');
  assert.equal(s.theme, 'light');
  assert.equal(s.pressed, 'false');
  assert.equal(s.bg, 'rgb(238, 239, 242)', 'the light wallpaper, though the device prefers dark');
  assert.equal(s.scheme, 'light');
  assert.equal(s.color, THEME_COLOR.light);

  await page.click('.bar .theme');
  s = await state();
  assert.equal(s.theme, 'dark');
  assert.equal(s.pressed, 'true');
  assert.equal(s.bg, 'rgb(17, 17, 19)');
  assert.equal(s.scheme, 'dark');
  assert.equal(s.color, THEME_COLOR.dark);
  assert.equal(s.saved, 'dark');

  await page.goto(`${origin}/teder/`);
  s = await state();
  assert.equal(s.atBody, 'dark', 'dark is on before <body> starts, so the page never paints light first');
  assert.equal(s.pressed, 'true');
  assert.equal(s.color, THEME_COLOR.dark);

  // By keyboard, as any button.
  await page.focus('.bar .theme');
  await page.keyboard.press('Enter');
  s = await state();
  assert.equal(s.theme, 'light');
  assert.equal(s.saved, 'light');
  await page.reload();
  s = await state();
  assert.equal(s.atBody, null);
  assert.equal(s.bg, 'rgb(238, 239, 242)');
  assert.deepEqual(s.violations, [], 'the policy blocked nothing');
  assert.deepEqual(errors, []);
  await ctx.close();
});

test('in a browser with storage blocked: the page is light, nothing breaks, and the button still switches for the visit', async () => {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark' });
  await ctx.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', { get() { throw new Error('storage is blocked'); } });
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(`${origin}/`);
  assert.equal(await page.evaluate(() => document.documentElement.getAttribute('data-theme')), 'light');
  assert.ok(await page.isVisible('.bar .theme'), 'the button shows');
  await page.click('.bar .theme');
  assert.equal(await page.evaluate(() => document.documentElement.getAttribute('data-theme')), 'dark');
  assert.equal(await page.getAttribute('.bar .theme', 'aria-pressed'), 'true');
  assert.deepEqual(errors, []);
  await ctx.close();
});
