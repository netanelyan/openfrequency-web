// Screenshots of built pages at 390px and 1440px, light and dark, into docs/screenshots/.
//   node scripts/shots.mjs [/path ...] [--menu]   (default: every page in dist/; --menu adds the phone menu, open)
// Uses the installed Chrome through playwright-core; nothing is downloaded.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
import { serve } from './serve.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'docs/screenshots');

const menu = process.argv.includes('--menu');
let paths = process.argv.slice(2).filter((a) => !a.startsWith('--'));
if (!paths.length) {
  paths = fs.readdirSync(path.join(ROOT, 'dist'), { recursive: true })
    .filter((f) => f.endsWith('index.html'))
    .map((f) => '/' + path.dirname(f).replace(/\\/g, '/').replace(/^\.$/, ''));
}
const name = (p) => (p === '/' ? 'home' : p.slice(1).replace(/[/_]+/g, '-').replace(/^-|-$/g, '')) || 'home';

const server = await serve(0);
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ channel: 'chrome' });
fs.mkdirSync(OUT, { recursive: true });

for (const p of paths) {
  for (const [w, h, scale] of [[390, 844, 2], [1440, 900, 1]]) {
    for (const scheme of ['light', 'dark']) {
      const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: scale, colorScheme: scheme, locale: 'he-IL' });
      const pg = await ctx.newPage();
      await pg.goto(base + p, { waitUntil: 'networkidle' });
      await pg.evaluate(() => document.fonts.ready);
      // The wallpaper is fixed, so a full-page capture would cut it off after the first screen. A viewport as tall
      // as the page draws it once behind everything, which is close to what a visitor sees while scrolling.
      const full = await pg.evaluate(() => document.documentElement.scrollHeight);
      await pg.setViewportSize({ width: w, height: full });
      const file = `${name(p)}-${w}-${scheme}.png`;
      await pg.screenshot({ path: path.join(OUT, file) });
      if (w === 390 && menu) {
        await pg.setViewportSize({ width: w, height: h });
        await pg.click('.menu summary');
        await pg.screenshot({ path: path.join(OUT, `${name(p)}-390-${scheme}-menu.png`) });
      }
      console.log(file);
      await ctx.close();
    }
  }
}
await browser.close();
server.close();
