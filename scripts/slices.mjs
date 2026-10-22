// Close-up slices of one page, for review: the full-page shot cut into screen-sized pieces at full resolution.
//   node scripts/slices.mjs <path> <width> <light|dark> <out dir>
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright-core';
import { serve } from './serve.mjs';

const [p = '/', w = '1440', scheme = 'light', out = 'slices'] = process.argv.slice(2);
const width = Number(w);
const step = width < 600 ? 900 : 1000;
const server = await serve(0);
const browser = await chromium.launch({ channel: 'chrome' });
const ctx = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: width < 600 ? 2 : 1, colorScheme: scheme });
const pg = await ctx.newPage();
await pg.goto(`http://127.0.0.1:${server.address().port}${p}`, { waitUntil: 'networkidle' });
const full = await pg.evaluate(() => document.documentElement.scrollHeight);
await pg.setViewportSize({ width, height: full });
fs.mkdirSync(out, { recursive: true });
for (let y = 0, i = 1; y < full; y += step, i++) {
  const f = path.join(out, `${width}-${scheme}-${String(i).padStart(2, '0')}.png`);
  await pg.screenshot({ path: f, clip: { x: 0, y, width, height: Math.min(step, full - y) } });
  console.log(f);
}
await browser.close();
server.close();
