// Screenshots of built pages at 390px and 1440px, light and dark, into docs/screenshots/.
//   node scripts/shots.mjs [/path ...] [--menu]   (default: every page in dist/; --menu adds the phone menu, open)
// Uses the installed Chrome through playwright-core; nothing is downloaded.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
import { serve } from './serve.mjs';
import { capturePage } from './capture.mjs';

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
      const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: scale, colorScheme: scheme, locale: 'he-IL', bypassCSP: true });
      const pg = await ctx.newPage();
      await pg.goto(base + p, { waitUntil: 'networkidle' });
      await pg.evaluate(() => document.fonts.ready);
      // Let the first screen's chat finish playing (about six seconds), so the shot shows the whole conversation.
      if (await pg.$('[data-hero-chat]')) await pg.waitForTimeout(6500);
      if (w === 390 && menu) {
        await pg.click('.menu summary');
        await pg.screenshot({ path: path.join(OUT, `${name(p)}-390-${scheme}-menu.png`) });
        await pg.click('.menu summary');
      }
      await capturePage(pg, path.join(OUT, `${name(p)}-${w}-${scheme}.png`));
      const file = `${name(p)}-${w}-${scheme}.png`;
      console.log(file);
      await ctx.close();
    }
  }
}
await browser.close();
server.close();
