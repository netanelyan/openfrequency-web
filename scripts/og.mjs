// The share images: what WhatsApp, Facebook, LinkedIn and X show when someone sends a link to the site.
//   node scripts/og.mjs        writes assets/og/{openfrequency,toran,teder}.png at 1200x630, which the build copies to dist/og
// Drawn in the site's own look (the silver ground, one frosted card, the marks from assets/brand, Heebo) and rendered by
// the installed Chrome through playwright-core, like the screenshots. Run it again after a change to a line or a mark.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
import { readConfig, tederNets } from '../src/lib.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'assets/og');
const svg = (f) => fs.readFileSync(path.join(ROOT, 'assets/brand/svg', f), 'utf8');
// The fonts go in as data URLs: a page set from a string may not load files from disk.
const font = (f) => `data:font/woff2;base64,${fs.readFileSync(path.join(ROOT, 'assets/fonts', f)).toString('base64')}`;

// One card per image: the mark, the name, one line. The colours are the site's tokens (src/style.css). Where Teder posts
// follows teder.facebook in site.config.json, as every page does (tederNets): run this again when it changes.
const cfg = readConfig(true);
export const CARDS = [
  { file: 'openfrequency', mark: svg('openfrequency-glyph.svg'), color: '#0066cc', name: 'OpenFrequency', latin: true,
    lines: ['תורן עונה ללקוחות של החנות.', 'תדר כותב מצגות לרשתות.'] },
  { file: 'toran', mark: svg('toran-glyph.svg'), color: '#0f7a54', name: 'תורן',
    lines: ['עונה ללקוחות של החנות שלכם בכל שעה, מתוך מה שכתוב באתר.'] },
  { file: 'teder', mark: svg('teder-glyph.svg'), color: '#6a3fd6', name: 'תדר',
    lines: [`מצגות בעברית ${tederNets(cfg)}, שעולות רק אחרי שאישרתם.`] },
];

const html = (c) => `<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8"><style>
@font-face { font-family: Heebo; src: url(${font('heebo-hebrew.woff2')}) format('woff2'); unicode-range: U+0590-05FF, U+200C-2010, U+20AA, U+25CC, U+FB1D-FB4F; font-weight: 100 900; }
@font-face { font-family: Heebo; src: url(${font('heebo-latin.woff2')}) format('woff2'); font-weight: 100 900; }
* { margin: 0; box-sizing: border-box; }
html, body { width: 1200px; height: 630px; }
body { font-family: Heebo, system-ui, sans-serif; color: #1d1d1f; display: grid; place-items: center;
  background: radial-gradient(120% 90% at 85% 10%, #ffffff 0%, #eeeff2 45%, #dfe1e6 100%); }
.card { width: 1056px; height: 486px; border-radius: 44px; padding: 64px 72px; display: flex; flex-direction: column; justify-content: space-between;
  background: rgba(255,255,255,.62); border: 1px solid rgba(255,255,255,.9);
  box-shadow: 0 1px 0 rgba(255,255,255,.8) inset, 0 30px 60px -24px rgba(29,29,31,.22); }
.top { display: flex; align-items: center; gap: 28px; }
.mark { width: 112px; height: 112px; border-radius: 30px; display: grid; place-items: center; background: ${c.color}; color: #fff; }
.mark svg { width: 92px; height: 92px; }
.name { font-size: ${c.latin ? 76 : 96}px; font-weight: 800; letter-spacing: ${c.latin ? '-1.5px' : '0'}; color: ${c.color}; line-height: 1; }
.line { font-size: 50px; font-weight: 600; line-height: 1.28; max-width: 900px; text-wrap: balance; }
.foot { font-size: 30px; font-weight: 500; color: #6e6e73; direction: ltr; text-align: right; }
</style></head><body><div class="card">
<div class="top"><div class="mark">${c.mark}</div><div class="name"${c.latin ? ' dir="ltr"' : ''}>${c.name}</div></div>
<p class="line">${c.lines.join('<br>')}</p>
<p class="foot">openfrequency.co.il</p>
</div></body></html>`;

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ channel: 'chrome' });
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  for (const c of CARDS) {
    await page.setContent(html(c), { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: path.join(OUT, `${c.file}.png`), type: 'png' });
    console.log(`assets/og/${c.file}.png`);
  }
  await browser.close();
}
