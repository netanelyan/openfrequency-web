// A phone's screens lead with one thing (the owner, 2026-11-05: "The mobile pages (each) has too many information, too
// many things jump to the eyes at the same time. Even the main page. Fix that."), in a real browser at 390 and 360px,
// light and dark. The home page's first screen is the headline and Teder's door with its two buttons, Toran's door
// shut under it, with no mark behind the headline, no badges and a strip of businesses that stands still. Every fold
// (sections.mjs foldButton) starts shut with its button, opens with a tap and shuts again; a thank-you page's message
// has the first screen to itself; nothing scrolls sideways. From 700px none of it applies: no fold button, everything
// shown, the badges, the mark and the moving strip as they were.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
import { THEME_KEY } from '../src/layout.mjs';
import { SIGNUP_LABEL, TEDER_SAMPLE } from '../src/sections.mjs';
import { listenFree } from './ports.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = fs.mkdtempSync(path.join(os.tmpdir(), 'of-phone-'));
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2' };
const PHONES = [[390, 844], [360, 780]];
const THANKS = ['/thanks/', '/thanks/teder/', '/thanks/already/', '/thanks/waitlist/', '/try-again/', '/404.html'];
let server, browser, origin;
const pages = [];
const html = {};

function serve(dir) {
  return http.createServer((req, res) => {
    const p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    const file = [p, path.join(p, 'index.html')].map((f) => path.join(dir, f)).find((f) => f.startsWith(dir) && fs.existsSync(f) && fs.statSync(f).isFile());
    const send = file || path.join(dir, '404.html');
    res.writeHead(file ? 200 : 404, { 'Content-Type': TYPES[path.extname(send)] || 'application/octet-stream' });
    res.end(fs.readFileSync(send));
  });
}

async function themed(theme, opts) {
  const ctx = await browser.newContext({ ...opts, colorScheme: theme === 'dark' ? 'light' : 'dark' });
  if (theme === 'dark') await ctx.addCookies([{ name: THEME_KEY, value: 'dark', url: origin }]);
  return ctx;
}

async function launch() {
  const errors = [];
  for (const opts of [{}, { channel: 'chrome' }]) {
    try {
      return await chromium.launch(opts);
    } catch (e) {
      errors.push(`${opts.channel || 'playwright chromium'}: ${e.message.split('\n')[0]}`);
    }
  }
  throw new Error(`no browser for the phone check (install one: npx playwright-core install chromium)\n${errors.join('\n')}`);
}

before(async () => {
  const b = spawnSync(process.execPath, ['build.mjs'], { cwd: ROOT, env: { ...process.env, SITE_OUT: out }, encoding: 'utf8' });
  assert.equal(b.status, 0, `the build failed:\n${b.stdout}\n${b.stderr}`);
  for (const f of fs.readdirSync(out, { recursive: true })) {
    const rel = String(f).replace(/\\/g, '/');
    if (!rel.endsWith('.html') || rel.startsWith('toran/example/')) continue;
    const p = '/' + rel.replace(/(^|\/)index\.html$/, '$1');
    pages.push(p);
    html[p] = fs.readFileSync(path.join(out, f), 'utf8');
  }
  server = serve(path.resolve(out));
  await listenFree(server);
  origin = `http://127.0.0.1:${server.address().port}`;
  browser = await launch();
});

after(async () => {
  await browser?.close();
  server?.close();
  fs.rmSync(out, { recursive: true, force: true });
});

test("on a phone the home page's first screen is one headline and Teder's door with its two buttons; Toran's door, the mark behind, the badges and the moving strip wait or aren't drawn", async () => {
  const found = [];
  for (const [width, height] of PHONES) {
    for (const theme of ['light', 'dark']) {
      const ctx = await themed(theme, { viewport: { width, height } });
      const page = await ctx.newPage();
      await page.goto(`${origin}/`);
      const got = await page.evaluate(() => {
        const shown = (e) => Boolean(e) && e.getClientRects().length > 0 && getComputedStyle(e).visibility !== 'hidden';
        const first = (e) => { const r = e.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight; };
        const teder = document.querySelector('.teder-door'), toran = document.querySelector('.toran-door');
        return {
          h1: [...document.querySelectorAll('main h1')].filter((e) => shown(e) && first(e)).length,
          buttons: [...document.querySelectorAll('main .btn')].filter((e) => shown(e) && first(e)).map((e) => e.textContent.trim()),
          tederShut: teder.classList.contains('shut'), toranShut: toran.classList.contains('shut'),
          price: shown(teder.querySelector('.start-price')),
          toranButtons: [...toran.querySelectorAll('.btn')].filter(shown).length,
          mark: shown(document.querySelector('.co-bg')),
          marker: getComputedStyle(document.querySelector('.co-hero h1 .hl')).backgroundImage,
          badges: shown(document.querySelector('.trust-sec')),
          strip: getComputedStyle(document.querySelector('.clients-row')).animationName,
          soon: getComputedStyle(toran.querySelector('.soon')).backgroundColor,
        };
      });
      const at = `${width} ${theme}`;
      if (got.h1 !== 1) found.push(`${at}: ${got.h1} headlines on the first screen`);
      if (JSON.stringify(got.buttons) !== JSON.stringify([TEDER_SAMPLE, SIGNUP_LABEL])) found.push(`${at}: the first screen's buttons are ${JSON.stringify(got.buttons)}`);
      if (!got.tederShut || !got.toranShut) found.push(`${at}: the doors start shut (Teder ${got.tederShut}, Toran ${got.toranShut})`);
      if (got.price) found.push(`${at}: Teder's full price line shows on the shut door`);
      if (got.toranButtons) found.push(`${at}: Toran's shut door shows ${got.toranButtons} buttons`);
      if (got.mark) found.push(`${at}: the mark behind the headline is drawn`);
      if (got.marker !== 'none') found.push(`${at}: the headline has its marker (${got.marker})`);
      if (got.badges) found.push(`${at}: the badges show`);
      if (got.strip !== 'none') found.push(`${at}: the strip of businesses moves (${got.strip})`);
      if (got.soon !== 'rgb(255, 255, 255)') found.push(`${at}: "בקרוב" on Toran's green is ${got.soon}`);
      // Opened, Teder's door has its price line, and Toran's its one button.
      await page.evaluate(() => document.querySelectorAll('.door.shut .door-open').forEach((b) => b.click()));
      const open = await page.evaluate(() => {
        const shown = (e) => Boolean(e) && e.getClientRects().length > 0;
        return { price: shown(document.querySelector('.teder-door .start-price')), toran: [...document.querySelectorAll('.toran-door .btn')].filter(shown).length };
      });
      if (!open.price || open.toran !== 1) found.push(`${at}: opened, Teder's price shows ${open.price}, Toran's buttons ${open.toran}`);
      await ctx.close();
    }
  }
  assert.deepEqual(found, [], found.join('\n'));
});

test('on a phone every fold starts shut with its button, opens with a tap and shuts again; from 700px there is no button and everything shows', async () => {
  const folded = pages.filter((p) => html[p].includes('data-fold'));
  for (const p of ['/', '/teder/', '/terms/', '/privacy/', '/security/', '/accessibility/']) assert.ok(folded.includes(p), `${p} has a fold`);
  const found = [];
  for (const [width, height] of [...PHONES, [700, 900], [1440, 900]]) {
    const phone = width < 700;
    const ctx = await themed('light', { viewport: { width, height }, reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    for (const p of folded) {
      await page.goto(origin + p);
      const got = await page.evaluate(async (phone) => {
        const shown = (e) => e.getClientRects().length > 0;
        const tick = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
        const res = [];
        for (const f of document.querySelectorAll('[data-fold]')) {
          const btn = f.querySelector('.fold-btn'), hid = [...f.querySelectorAll('.fold-x')];
          const name = `${btn.getAttribute('aria-controls')}`;
          const target = document.getElementById(btn.getAttribute('aria-controls'));
          if (!target || !target.matches('.fold-x, :has(.fold-x)')) res.push(`${name}: the button controls nothing that waits`);
          if (!hid.length) res.push(`${name}: nothing waits`);
          if (!phone) {
            if (shown(btn)) res.push(`${name}: the button shows`);
            if (hid.some((x) => !shown(x))) res.push(`${name}: something is hidden`);
            continue;
          }
          if (!shown(btn) || btn.getAttribute('aria-expanded') !== 'false') res.push(`${name}: not shut with its button (${btn.getAttribute('aria-expanded')})`);
          if (hid.some(shown)) res.push(`${name}: shut, something still shows`);
          const words = () => btn.innerText.trim();
          const shut = words();
          if (!shut) res.push(`${name}: the button has no words`);
          btn.click();
          await tick();
          if (btn.getAttribute('aria-expanded') !== 'true' || hid.some((x) => !shown(x))) res.push(`${name}: a tap didn't open it`);
          if (btn.querySelector('.f-less') && words() !== 'פחות') res.push(`${name}: open, the button says "${words()}"`);
          btn.click();
          await tick();
          if (btn.getAttribute('aria-expanded') !== 'false' || hid.some(shown) || words() !== shut) res.push(`${name}: a second tap didn't shut it`);
        }
        return res;
      }, phone);
      for (const g of got) found.push(`${width} ${p}: ${g}`);
    }
    // The legal pages' list of sections: shut under its one line on a phone, the list itself from 700px.
    await page.goto(`${origin}/terms/`);
    const toc = await page.evaluate(() => ({ list: document.querySelector('.legal-toc ol').getClientRects().length > 0, button: document.querySelector('.legal-toc .fold-btn').innerText.trim() }));
    if (phone && (toc.list || toc.button !== 'מה יש בעמוד הזה')) found.push(`${width} /terms/: the list shows ${toc.list}, the button says "${toc.button}"`);
    if (!phone && !toc.list) found.push(`${width} /terms/: no list of sections`);
    await ctx.close();
  }
  assert.deepEqual(found, [], found.join('\n'));
});

test("on a phone a thank-you page's message has the first screen to itself, and no page scrolls sideways, light and dark", async () => {
  const found = [];
  for (const [width, height] of PHONES) {
    for (const theme of ['light', 'dark']) {
      const ctx = await themed(theme, { viewport: { width, height }, reducedMotion: 'reduce' });
      const page = await ctx.newPage();
      for (const p of pages) {
        await page.goto(origin + p);
        const got = await page.evaluate(() => ({ sideways: document.documentElement.scrollWidth > innerWidth, foot: document.querySelector('.foot-in').getBoundingClientRect().top, h: innerHeight }));
        if (got.sideways) found.push(`${width} ${theme} ${p}: scrolls sideways`);
        if (THANKS.includes(p) && got.foot < got.h) found.push(`${width} ${theme} ${p}: the footer starts at ${Math.round(got.foot)}, on the first screen (${got.h})`);
      }
      await ctx.close();
    }
  }
  assert.deepEqual(found, [], found.join('\n'));
});

test("from 700px the phone's cuts aren't made: the sentences left out on a phone, the badges, the mark behind the headline and the moving strip are there", async () => {
  for (const [width, height] of [[700, 900], [1440, 900]]) {
    const ctx = await themed('light', { viewport: { width, height } });
    const page = await ctx.newPage();
    await page.goto(`${origin}/`);
    const home = await page.evaluate(() => ({
      mark: document.querySelector('.co-bg').getClientRects().length > 0,
      badges: document.querySelector('.trust-sec').getClientRects().length > 0,
      strip: getComputedStyle(document.querySelector('.clients-row')).animationName,
      shut: [...document.querySelectorAll('.door')].map((d) => getComputedStyle(d.querySelector('.door-in > *')).display),
    }));
    assert.ok(home.mark && home.badges, `${width}: the mark ${home.mark}, the badges ${home.badges}`);
    assert.equal(home.strip, 'clients', `${width}: the strip moves`);
    assert.ok(home.shut.every((d) => d !== 'none'), `${width}: both doors whole`);
    for (const p of ['/teder/', '/toran/', '/join/']) {
      await page.goto(origin + p);
      const desk = await page.evaluate(() => [...document.querySelectorAll('.desk')].map((e) => e.getClientRects().length > 0));
      assert.ok(desk.length && desk.every(Boolean), `${width} ${p}: every .desk sentence shows (${desk})`);
    }
    await ctx.close();
  }
  // On a phone those sentences wait, and each says what another part of its page says.
  const ctx = await themed('light', { viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  for (const p of ['/teder/', '/toran/', '/join/']) {
    await page.goto(origin + p);
    const desk = await page.evaluate(() => [...document.querySelectorAll('.desk')].map((e) => e.getClientRects().length > 0));
    assert.ok(desk.length && desk.every((x) => !x), `390 ${p}: the .desk sentences wait (${desk})`);
  }
  await ctx.close();
});
