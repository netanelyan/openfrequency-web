// Spacing and the customer-support button, on every built page in a real browser (the owner, 2026-11-01, with a
// screenshot of /teder's two top buttons touching: "also spacing, everywhere, go over that", and "also add a customer
// support by toran button (openfrequency customer support)").
//
// Two buttons that can both be seen are never closer than 8px, side by side or one over the other, at a computer's
// width and a phone's, in light and in dark. Each pair is measured at the same moment, with the first one scrolled into
// view, so a row that scrolls sideways is measured as it is seen; the sticky header and the floating corners are
// measured among themselves, since content passes under them by design. The support button is on every page, opens
// WhatsApp to our number with a first line, and keeps clear of the accessibility button and of the footer's panel.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
import { SUPPORT_TEXT } from '../src/layout.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = fs.mkdtempSync(path.join(os.tmpdir(), 'of-spacing-'));
const config = JSON.parse(fs.readFileSync(path.join(ROOT, 'site.config.json'), 'utf8'));
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2' };
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

async function launch() {
  const errors = [];
  for (const opts of [{}, { channel: 'chrome' }]) {
    try {
      return await chromium.launch(opts);
    } catch (e) {
      errors.push(`${opts.channel || 'playwright chromium'}: ${e.message.split('\n')[0]}`);
    }
  }
  throw new Error(`no browser for the spacing check (install one: npx playwright-core install chromium)\n${errors.join('\n')}`);
}

before(async () => {
  const b = spawnSync(process.execPath, ['build.mjs'], { cwd: ROOT, env: { ...process.env, SITE_OUT: out }, encoding: 'utf8' });
  assert.equal(b.status, 0, `the build failed:\n${b.stdout}\n${b.stderr}`);
  for (const f of fs.readdirSync(out, { recursive: true })) {
    const rel = String(f).replace(/\\/g, '/');
    if (!rel.endsWith('.html')) continue;
    const p = '/' + rel.replace(/(^|\/)index\.html$/, '$1');
    pages.push(p);
    html[p] = fs.readFileSync(path.join(out, f), 'utf8');
  }
  server = serve(path.resolve(out));
  await new Promise((ok) => server.listen(0, '127.0.0.1', ok));
  origin = `http://127.0.0.1:${server.address().port}`;
  browser = await launch();
});

after(async () => {
  await browser?.close();
  server?.close();
  fs.rmSync(out, { recursive: true, force: true });
});

test('every page has the support button: WhatsApp to our number with a first line, "שירות לקוחות" and that Toran answers', () => {
  assert.ok(pages.length >= 14, `every page was built (${pages.length})`);
  const href = `https://wa.me/${config.whatsapp}?text=${encodeURIComponent(SUPPORT_TEXT)}`;
  // /toran/example is a page Toran rendered for a made-up store (build.mjs copies it), not one of the site's.
  for (const p of pages.filter((x) => x !== '/toran/example/')) {
    const links = html[p].match(/<a class="support"[^>]*>[\s\S]*?<\/a>/g) || [];
    assert.equal(links.length, 1, `${p}: one support button`);
    assert.ok(links[0].includes(`href="${href}"`), `${p}: ${links[0].slice(0, 120)}`);
    assert.match(links[0], /target="_blank" rel="noopener"/);
    assert.match(links[0], /<b>שירות לקוחות<\/b><small>עונה תורן, בוואטסאפ<\/small>/);
  }
});

test('in a browser, two buttons that can be seen are never closer than 8px, on every page, phone and computer, light and dark', async () => {
  const found = [];
  for (const [width, height] of [[390, 844], [360, 780], [1440, 900]]) {
    for (const colorScheme of ['light', 'dark']) {
      const ctx = await browser.newContext({ viewport: { width, height }, colorScheme, reducedMotion: 'reduce' });
      const page = await ctx.newPage();
      for (const p of pages) {
        await page.goto(origin + p);
        await page.evaluate(() => document.querySelectorAll('details:not(.menu)').forEach((d) => (d.open = true)));
        const near = await page.evaluate(async () => {
          const floating = (e) => { for (let x = e; x; x = x.parentElement) { const pos = getComputedStyle(x).position; if (pos === 'fixed' || pos === 'sticky') return true; } return false; };
          const name = (e) => `"${(e.textContent || e.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ').slice(0, 30)}"`;
          const onTop = (e) => {
            const r = e.getBoundingClientRect();
            if (!(r.width > 0 && r.height > 0)) return null;
            const t = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
            return t && (t === e || e.contains(t)) ? r : null;
          };
          const all = [...document.querySelectorAll('a.btn, button, .btn, input[type=submit], a.support')]
            .filter((e) => { const s = getComputedStyle(e); return s.display !== 'none' && s.visibility !== 'hidden' && !e.closest('[hidden]'); });
          const res = [];
          for (let i = 0; i < all.length; i++) {
            const a = all[i];
            a.scrollIntoView({ block: 'center', inline: 'center' });
            await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
            const A = onTop(a);
            if (!A) continue;
            for (let j = i + 1; j < all.length; j++) {
              const b = all[j];
              if (a.contains(b) || b.contains(a) || floating(a) !== floating(b)) continue;
              // A segmented control's tabs share one pill on purpose (channels.mjs .ch-tabs).
              if (a.getAttribute('role') === 'tab' && b.getAttribute('role') === 'tab' && a.closest('[role=tablist]') === b.closest('[role=tablist]')) continue;
              const B = onTop(b);
              if (!B) continue;
              const gx = Math.max(B.left - A.right, A.left - B.right);
              const gy = Math.max(B.top - A.bottom, A.top - B.bottom);
              if ((gx < 8 && gy < 0) || (gy < 8 && gx < 0)) res.push(`${name(a)} and ${name(b)}: ${Math.round(Math.max(gx, gy))}px`);
            }
          }
          return res;
        });
        for (const n of near) found.push(`${width} ${colorScheme} ${p}: ${n}`);
      }
      await ctx.close();
    }
  }
  assert.deepEqual(found, [], `buttons too close:\n${found.join('\n')}`);
});

test("in a browser, /teder's two top buttons stand apart, and the support button keeps clear of the accessibility button and of the footer", async () => {
  for (const [width, height] of [[390, 844], [360, 780], [1440, 900]]) {
    const ctx = await browser.newContext({ viewport: { width, height }, reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    await page.goto(`${origin}/teder/`);
    const top = await page.evaluate(() => [...document.querySelectorAll('.hero-cta .start-act a')].map((a) => a.getBoundingClientRect().toJSON()));
    assert.equal(top.length, 2, `${width}: the two buttons`);
    const [a, b] = top;
    const apart = Math.max(Math.max(b.left - a.right, a.left - b.right), Math.max(b.top - a.bottom, a.top - b.bottom));
    assert.ok(apart >= 8, `${width}: the top buttons are ${Math.round(apart)}px apart`);
    // At the end of the page: both corners shown, apart, and under the footer's panel, not on it.
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForTimeout(100);
    const got = await page.evaluate(() => {
      const r = (s) => document.querySelector(s)?.getBoundingClientRect().toJSON() || null;
      return { support: r('.support'), a11y: r('.a11y-btn'), foot: r('.foot-in'), sideways: document.documentElement.scrollWidth > window.innerWidth };
    });
    assert.ok(got.support && got.a11y, `${width}: both corners shown`);
    const gap = Math.max(got.a11y.left - got.support.right, got.support.left - got.a11y.right);
    assert.ok(gap >= 8, `${width}: the support and accessibility buttons are ${Math.round(gap)}px apart`);
    assert.ok(got.support.top >= got.foot.bottom, `${width}: the support button (top ${Math.round(got.support.top)}) is under the footer's panel (bottom ${Math.round(got.foot.bottom)})`);
    assert.equal(got.sideways, false, `${width}: nothing scrolls sideways`);
    await ctx.close();
  }
});
