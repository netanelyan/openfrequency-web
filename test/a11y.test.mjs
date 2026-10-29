// Every built page, checked for accessibility in a real browser: axe-core against WCAG 2.0 A and AA (the rules the
// Israeli standard 5568 is built on, which /accessibility says the site follows), at a phone's width (390px) and a
// computer's (1440px), in light and in dark. One violation fails the test, with the rule, the page and the element.
//
// The browser is Playwright's own Chromium when it is installed (npx playwright-core install chromium, as CI does),
// else the installed Chrome. With neither the test fails: a check that did not run is not a pass (deploy.sh also stops
// on a skipped test).
//
// /toran/example is left out: it is a page Toran rendered for a made-up store (build.mjs copies it), and the
// accessibility statement lists it among the pages not yet checked.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
import { AxeBuilder } from '@axe-core/playwright';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = fs.mkdtempSync(path.join(os.tmpdir(), 'of-a11y-'));
const SKIP = new Set(['toran/example/index.html']);
const WIDTHS = [[390, 844], [1440, 900]];
const SCHEMES = ['light', 'dark'];

const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.txt': 'text/plain', '.xml': 'application/xml' };
let server, browser, origin;
const pages = [];

// The built folder served the way Caddy serves it (deploy/Caddyfile.example): /x is /x or /x/index.html, anything
// else the 404 page; /api/* is not here, so a form never sends.
function serve(dir) {
  return http.createServer((req, res) => {
    const p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    const file = [p, path.join(p, 'index.html')].map((f) => path.join(dir, f)).find((f) => f.startsWith(dir) && fs.existsSync(f) && fs.statSync(f).isFile());
    const send = file || path.join(dir, '404.html');
    res.writeHead(file ? 200 : 404, { 'Content-Type': TYPES[path.extname(send)] || 'application/octet-stream' });
    res.end(fs.readFileSync(send));
  });
}

async function launch() {
  const tries = [{}, { channel: 'chrome' }];
  const errors = [];
  for (const opts of tries) {
    try {
      return await chromium.launch(opts);
    } catch (e) {
      errors.push(`${opts.channel || 'playwright chromium'}: ${e.message.split('\n')[0]}`);
    }
  }
  throw new Error(`no browser for the accessibility check (install one: npx playwright-core install chromium)\n${errors.join('\n')}`);
}

before(async () => {
  const b = spawnSync(process.execPath, ['build.mjs'], { cwd: ROOT, env: { ...process.env, SITE_OUT: out }, encoding: 'utf8' });
  assert.equal(b.status, 0, `the build failed:\n${b.stdout}\n${b.stderr}`);
  for (const f of fs.readdirSync(out, { recursive: true })) {
    const rel = String(f).replace(/\\/g, '/');
    if (rel.endsWith('.html') && !SKIP.has(rel)) pages.push('/' + rel.replace(/(^|\/)index\.html$/, '$1'));
  }
  server = serve(out);
  await new Promise((ok) => server.listen(0, '127.0.0.1', ok));
  origin = `http://127.0.0.1:${server.address().port}`;
  browser = await launch();
});

after(async () => {
  await browser?.close();
  server?.close();
  fs.rmSync(out, { recursive: true, force: true });
});

test('every page passes axe (WCAG 2.0 A and AA) on a phone and a computer, light and dark', async () => {
  assert.ok(pages.length >= 14, `every page was built (${pages.length})`);
  const found = [];
  for (const [width, height] of WIDTHS) {
    for (const colorScheme of SCHEMES) {
      const context = await browser.newContext({ viewport: { width, height }, colorScheme, bypassCSP: true });
      const page = await context.newPage();
      for (const p of pages) {
        await page.goto(origin + p, { waitUntil: 'load' });
        // The first screen's entrances (site.js) settle before the colours are read.
        await page.waitForTimeout(700);
        const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
        for (const v of violations) {
          for (const n of v.nodes.slice(0, 3)) found.push(`${p} ${width}px ${colorScheme}: ${v.id} (${v.impact}) ${n.target.join(' ')}: ${n.failureSummary.split('\n').slice(1).join(' ').trim()}`);
        }
      }
      await context.close();
    }
  }
  assert.deepEqual(found, [], `accessibility violations:\n${found.join('\n')}`);
});
