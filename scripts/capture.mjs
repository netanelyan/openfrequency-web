// A whole page in one picture, as a visitor would see each part of it. The page is scrolled through once first, so
// lazy pictures load and each section rises in the way it does for a reader; then the wallpaper (fixed to the screen
// in the real page) is pinned to the document and the page is captured from the top.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

export async function preparePage(pg) {
  await pg.evaluate(async () => {
    const pause = (ms) => new Promise((r) => setTimeout(r, ms));
    for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight * 0.8) { scrollTo(0, y); await pause(140); }
    scrollTo(0, 0);
    // Every picture loaded and decoded, lazy or not, before anything is captured.
    await Promise.all([...document.images].map((i) => {
      i.loading = 'eager';
      return i.complete && i.naturalWidth ? i.decode().catch(() => {}) : new Promise((r) => { i.onload = i.onerror = r; });
    }));
    document.querySelectorAll('[data-rise], .drift, .reveal').forEach((e) => e.classList.add('in'));
    document.querySelectorAll('.msg.typing[aria-hidden]').forEach((e) => e.remove());
    document.querySelectorAll('.wait-in').forEach((e) => e.classList.remove('wait-in'));
  });
  const empty = await pg.evaluate(() => [...document.images].filter((i) => !i.naturalWidth).map((i) => i.getAttribute('src')));
  if (empty.length) throw new Error(`capture: pictures did not load, no screenshot written: ${empty.join(', ')}`);
  await pg.addStyleTag({ content: 'body{position:relative} body::before{position:absolute}' });
  await pg.waitForTimeout(1200);
}

// Chromium takes one screenshot up to about 16,384 device pixels tall and repeats the page from the top beyond that.
// A taller page is taken in slices and stacked with ffmpeg, so every section appears once, in order.
const LIMIT = 16000;

export async function capturePage(pg, file) {
  await preparePage(pg);
  const { h, w, dpr } = await pg.evaluate(() => ({ h: document.documentElement.scrollHeight, w: document.documentElement.clientWidth, dpr: devicePixelRatio }));
  if (h * dpr <= LIMIT) { await pg.screenshot({ path: file, fullPage: true }); return; }
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'of-shot-'));
  const step = Math.floor(LIMIT / dpr / 2);
  const parts = [];
  for (let y = 0; y < h; y += step) {
    const part = path.join(dir, `${String(parts.length).padStart(3, '0')}.png`);
    await pg.screenshot({ path: part, fullPage: true, clip: { x: 0, y, width: w, height: Math.min(step, h - y) } });
    parts.push(part);
  }
  const inputs = parts.flatMap((p) => ['-i', p]);
  execFileSync('ffmpeg', ['-loglevel', 'error', '-y', ...inputs, '-filter_complex', `vstack=inputs=${parts.length}`, file]);
  fs.rmSync(dir, { recursive: true, force: true });
}
