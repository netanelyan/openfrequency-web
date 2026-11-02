// Light or dark (the owner, 2026-11-01: "make light mode the default, and an easy option to switch to dark mode";
// 2026-11-02: "make sure that every repo starts on light mode. changing it on one subdomain changes it on all of the
// subdomains"). The site is light whatever the device prefers; the button in every page's header turns dark on and off,
// and the choice is the cookie of-theme, which openfrequency-teder, -accounts and -toran read and write the same way:
// "dark" or "light" (no cookie, or anything else, is light), for a year, Path=/, SameSite=Lax, for all of
// .openfrequency.co.il on our own hosts and for the host alone anywhere else, Secure over https. The head's script puts
// it on <html> before the page paints, under the same Content-Security-Policy (each inline script by its hash, nothing
// else), and a choice the site kept in localStorage until then becomes the cookie, once. Without cookies the page is
// light and the button still works for the visit.
// And the footer (the owner, 2026-11-02: "on light mode the footer should be grey but with a white accent, and change to
// the current grey on dark mode"): in light a grey panel with white accents and the page's inks, in dark the night
// panel the light theme had until then.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
import { THEME_COLOR, THEME_KEY, ofThemeCookie, ofThemeRead } from '../src/layout.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = fs.mkdtempSync(path.join(os.tmpdir(), 'of-theme-'));
const TYPES = { '.html': 'text/html; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2' };
const YEAR = 31536000;
let server, browser, origin;
// The site's pages, and every built page, Toran's example included.
const html = {};
const all = {};

async function launch(args = []) {
  for (const opts of [{ args }, { channel: 'chrome', args }]) {
    try { return await chromium.launch(opts); } catch {}
  }
  return null;
}

before(async () => {
  const b = spawnSync(process.execPath, ['build.mjs'], { cwd: ROOT, env: { ...process.env, SITE_OUT: out }, encoding: 'utf8' });
  assert.equal(b.status, 0, `the build failed:\n${b.stdout}\n${b.stderr}`);
  for (const f of fs.readdirSync(out, { recursive: true })) {
    const rel = String(f).replace(/\\/g, '/');
    if (!rel.endsWith('.html')) continue;
    all[rel] = fs.readFileSync(path.join(out, f), 'utf8');
    if (rel !== 'toran/example/index.html') html['/' + rel.replace(/(^|\/)index\.html$/, '$1')] = all[rel];
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
  browser = await launch();
  assert.ok(browser, 'no browser for the theme check (install one: npx playwright-core install chromium)');
});

after(async () => {
  await browser?.close();
  server?.close();
  fs.rmSync(out, { recursive: true, force: true });
});

// What <html> says at the moment <body> starts (before anything in it can paint), and any policy violation.
function watch() {
  window.__violations = [];
  document.addEventListener('securitypolicyviolation', (e) => window.__violations.push(`${e.violatedDirective} ${e.blockedURI}`));
  new MutationObserver((_, o) => { if (document.body) { window.__atBody = document.documentElement.getAttribute('data-theme'); o.disconnect(); } }).observe(document, { childList: true, subtree: true });
}
const state = (page) => page.evaluate((k) => {
  let stored;
  try { stored = localStorage.getItem(k); } catch { stored = 'blocked'; }
  return {
    theme: document.documentElement.getAttribute('data-theme'),
    atBody: window.__atBody,
    pressed: document.querySelector('.theme').getAttribute('aria-pressed'),
    bg: getComputedStyle(document.body).backgroundColor,
    scheme: getComputedStyle(document.documentElement).colorScheme,
    color: document.querySelector('meta[name=theme-color]').getAttribute('content'),
    metaScheme: document.querySelector('meta[name=color-scheme]').getAttribute('content'),
    stored,
    violations: window.__violations,
  };
}, THEME_KEY);
const themeCookies = async (ctx) => (await ctx.cookies()).filter((c) => c.name === THEME_KEY);

test('every page: light in its markup, the button in the header, the cookie read in the head, no rule for the device\'s scheme, and the policy as strict', () => {
  assert.ok(Object.keys(html).length >= 14, 'every page was built');
  const css = fs.readFileSync(path.join(ROOT, 'src/style.css'), 'utf8');
  assert.doesNotMatch(css, /prefers-color-scheme/, "the device's preference never turns the page dark");
  for (const [f, page] of Object.entries(all)) assert.doesNotMatch(page, /prefers-color-scheme/, `${f}: no rule in the page follows the device's scheme`);
  assert.match(css, /:root\[data-theme="dark"\] \{/, 'the dark tokens');
  // The accessibility statement says so, under its own date (legal.accessibilityUpdated).
  const statement = html['/accessibility/'].replace(/<[^>]+>/g, '');
  assert.match(statement, /האתר מוצג בצבעים בהירים\. בכפתור עם הירח בראש כל עמוד עוברים למצב כהה/);
  assert.doesNotMatch(statement, /הגדרות המערכת שלכם: מצב כהה/);
  assert.match(statement, /עודכן לאחרונה ב-1 בנובמבר 2026/);
  // The privacy page names the cookie, where it reaches and for how long, under its own date (legal.privacyUpdated).
  const privacy = html['/privacy/'].replace(/<[^>]+>/g, '');
  assert.doesNotMatch(privacy, /האתר הזה לא שם עוגיות|באתר הזה אין עוגיות/);
  assert.ok(privacy.includes('האתר הזה שם עוגייה אחת, ורק אם החלפתם בין מצב בהיר לכהה, כאן, בתדר, בתורן או בחשבון שלכם. היא זוכרת מה בחרתם.'));
  assert.ok(privacy.includes('מצב כהה או בהיר, of-theme: זוכרת אם בחרתם מצב כהה או בהיר, עד שנה. היא נשמרת לכל הכתובות של openfrequency.co.il'));
  assert.match(privacy, /עודכן לאחרונה ב-2 בנובמבר 2026/);
  const js = fs.readFileSync(path.join(ROOT, 'src/site.js'), 'utf8');
  assert.ok(js.includes('d.cookie = ofThemeCookie(') && js.includes('ofThemeRead(d.cookie)'), "site.js writes and reads the cookie with the head's functions");
  assert.ok(js.includes(THEME_COLOR.dark) && js.includes(THEME_COLOR.light), 'site.js keeps the same colours as the head');
  assert.doesNotMatch(js, /localStorage\.setItem\('of-theme'/, 'the choice is no longer kept in localStorage');
  const inline = (fn) => String(fn).replace(/\s*\n\s*/g, '');
  for (const [p, page] of Object.entries(html)) {
    assert.match(page, /^<!doctype html>\n<html lang="he" dir="rtl" data-theme="light">/, `${p}: light in the markup`);
    const head = page.slice(0, page.indexOf('</head>'));
    assert.match(head, /<meta name="color-scheme" content="light">/, p);
    assert.equal((head.match(/<meta name="theme-color"/g) || []).length, 1, `${p}: one theme colour`);
    assert.ok(head.includes(`<meta name="theme-color" content="${THEME_COLOR.light}">`), p);
    assert.ok(head.includes(inline(ofThemeCookie)) && head.includes(inline(ofThemeRead)), `${p}: the head carries the two functions tested here`);
    assert.ok(head.includes('t=ofThemeRead(document.cookie)'), `${p}: the head reads the cookie before the page paints`);
    const bar = /<div class="bar">[\s\S]*?<\/header>/.exec(page)?.[0] || '';
    assert.equal((bar.match(/<button class="theme" type="button" data-theme-toggle aria-pressed="false" aria-label="מצב כהה">/g) || []).length, 1, `${p}: the button in the header`);
    const csp = /<meta http-equiv="Content-Security-Policy" content="([^"]+)">/.exec(page)[1];
    const scripts = /script-src ([^;]+)/.exec(csp)[1];
    assert.doesNotMatch(scripts, /unsafe|\*|http/, `${p}: script-src is hashes only (${scripts})`);
  }
});

test('the cookie: of-theme, dark or light, a year on every path, Lax; all of .openfrequency.co.il on our hosts, the host alone elsewhere; Secure over https', () => {
  const at = (url) => { const u = new URL(url); return { hostname: u.hostname, protocol: u.protocol }; };
  const tail = `; Path=/; Max-Age=${YEAR}; SameSite=Lax`;
  for (const host of ['openfrequency.co.il', 'teder.openfrequency.co.il', 'accounts.openfrequency.co.il', 'toran.openfrequency.co.il', 'www.openfrequency.co.il']) {
    assert.equal(ofThemeCookie('dark', at(`https://${host}/teder/`)), `of-theme=dark; Domain=.openfrequency.co.il${tail}; Secure`, host);
    assert.equal(ofThemeCookie('light', at(`https://${host}/`)), `of-theme=light; Domain=.openfrequency.co.il${tail}; Secure`, host);
    assert.equal(ofThemeCookie('dark', at(`http://${host}:8080/`)), `of-theme=dark; Domain=.openfrequency.co.il${tail}`, `${host} over http: not Secure`);
  }
  // A test server, a preview, or a name that only looks like ours: this host alone.
  for (const host of ['localhost', '127.0.0.1', 'evilopenfrequency.co.il', 'openfrequency.co.il.example.com', 'teder.openfrequency.co.il.evil.com', 'openfrequency.co']) {
    assert.equal(ofThemeCookie('dark', at(`http://${host}:4730/`)), `of-theme=dark${tail}`, `${host}: no Domain`);
    assert.equal(ofThemeCookie('dark', at(`https://${host}/`)), `of-theme=dark${tail}; Secure`, `${host} over https`);
  }
  // Anything but "dark" is written as light.
  for (const v of ['light', 'blue', '', undefined, 'DARK']) assert.equal(ofThemeCookie(v, at('https://openfrequency.co.il/')), `of-theme=light; Domain=.openfrequency.co.il${tail}; Secure`, String(v));
  // Read: no cookie is null (the head may then carry an old choice over), "dark" is dark, anything else is light.
  const reads = [['', null], [undefined, null], ['a=1', null], ['xof-theme=dark', null], ['of-themes=dark', null], ['of-theme=dark', 'dark'], ['a=1; of-theme=dark; b=2', 'dark'], ['a=1;of-theme=dark', 'dark'], ['of-theme=light', 'light'], ['of-theme=blue', 'light'], ['of-theme=', 'light'], ['of-theme=dark2', 'light'], ['of-theme=Dark', 'light']];
  for (const [c, want] of reads) assert.equal(ofThemeRead(c), want, `"${c}"`);
  // What one writes, the other reads back.
  for (const v of ['dark', 'light']) assert.equal(ofThemeRead(ofThemeCookie(v, at('https://teder.openfrequency.co.il/')).split(';')[0]), v);
});

test('in a browser, on a device that prefers dark: light first, dark with one tap, kept in the cookie and on the next page before it paints, and light again', async () => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, colorScheme: 'dark' });
  await ctx.addInitScript(watch);
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));

  await page.goto(`${origin}/`);
  let s = await state(page);
  assert.equal(s.atBody, 'light', 'no cookie: light, set in the head before <body>');
  assert.equal(s.theme, 'light');
  assert.equal(s.pressed, 'false');
  assert.equal(s.bg, 'rgb(238, 239, 242)', 'the light wallpaper, though the device prefers dark');
  assert.equal(s.scheme, 'light');
  assert.equal(s.color, THEME_COLOR.light);
  assert.equal(s.metaScheme, 'light');
  assert.deepEqual(await themeCookies(ctx), [], 'nothing is written until the visitor chooses');

  const tapped = Date.now() / 1000;
  await page.click('.bar .theme');
  s = await state(page);
  assert.equal(s.theme, 'dark');
  assert.equal(s.pressed, 'true');
  assert.equal(s.bg, 'rgb(17, 17, 19)');
  assert.equal(s.scheme, 'dark');
  assert.equal(s.color, THEME_COLOR.dark);
  assert.equal(s.metaScheme, 'dark', 'both metas change at once');
  assert.equal(s.stored, null, 'nothing in localStorage');
  const [c, ...more] = await themeCookies(ctx);
  assert.equal(more.length, 0, 'one cookie');
  assert.equal(c.value, 'dark');
  assert.equal(c.domain, '127.0.0.1', 'this host alone, off our domain');
  assert.equal(c.path, '/');
  assert.equal(c.sameSite, 'Lax');
  assert.equal(c.secure, false, 'not Secure over http');
  assert.ok(Math.abs(c.expires - (tapped + YEAR)) < 120, `kept for a year (${c.expires - tapped}s)`);

  await page.goto(`${origin}/teder/`);
  s = await state(page);
  assert.equal(s.atBody, 'dark', 'dark is on before <body> starts, so the page never paints light first');
  assert.equal(s.pressed, 'true');
  assert.equal(s.color, THEME_COLOR.dark);
  assert.equal(s.metaScheme, 'dark');

  // By keyboard, as any button.
  await page.focus('.bar .theme');
  await page.keyboard.press('Enter');
  s = await state(page);
  assert.equal(s.theme, 'light');
  assert.equal(s.metaScheme, 'light');
  assert.equal((await themeCookies(ctx))[0].value, 'light');
  await page.reload();
  s = await state(page);
  assert.equal(s.atBody, 'light');
  assert.equal(s.bg, 'rgb(238, 239, 242)');

  // A page the browser shows again from its back-forward cache takes the cookie as it is now (changed meanwhile on
  // another of our pages).
  await page.evaluate(() => {
    document.cookie = 'of-theme=dark; Path=/';
    dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true }));
  });
  s = await state(page);
  assert.equal(s.theme, 'dark');
  assert.equal(s.pressed, 'true');
  assert.equal(s.color, THEME_COLOR.dark);
  assert.deepEqual(s.violations, [], 'the policy blocked nothing');
  assert.deepEqual(errors, []);
  await ctx.close();
});

test('in a browser, a choice kept the old way (localStorage, until 2026-11-02) becomes the cookie once, before the page paints, and the old key goes', async () => {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'light' });
  await ctx.addInitScript(watch);
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  const keep = (v) => page.evaluate(([k, x]) => localStorage.setItem(k, x), [THEME_KEY, v]);
  await page.goto(`${origin}/faq/`);

  // Dark kept the old way, no cookie: dark before <body>, the cookie written, the key gone.
  await keep('dark');
  await page.goto(`${origin}/`);
  let s = await state(page);
  assert.equal(s.atBody, 'dark');
  assert.equal(s.pressed, 'true');
  assert.equal(s.color, THEME_COLOR.dark);
  assert.equal(s.stored, null, 'the old key is gone');
  let cookies = await themeCookies(ctx);
  assert.deepEqual(cookies.map((c) => [c.value, c.path, c.sameSite]), [['dark', '/', 'Lax']]);
  await page.reload();
  assert.equal((await state(page)).atBody, 'dark', 'from the cookie now');

  // A cookie wins over a key left behind (set on a subdomain first): light from the cookie, and the key goes.
  await ctx.addCookies([{ name: THEME_KEY, value: 'light', url: origin }]);
  await keep('dark');
  await page.reload();
  s = await state(page);
  assert.equal(s.atBody, 'light');
  assert.equal(s.stored, null);
  assert.deepEqual((await themeCookies(ctx)).map((c) => c.value), ['light']);

  // Anything else kept is no choice: light, no cookie, and the key goes.
  await ctx.clearCookies();
  await keep('blue');
  await page.reload();
  s = await state(page);
  assert.equal(s.atBody, 'light');
  assert.equal(s.stored, null);
  assert.deepEqual(await themeCookies(ctx), []);

  // A cookie with any other value is light, and is a cookie: an old key is not carried over it.
  await ctx.addCookies([{ name: THEME_KEY, value: 'blue', url: origin }]);
  await keep('dark');
  await page.reload();
  s = await state(page);
  assert.equal(s.atBody, 'light');
  assert.equal(s.stored, null);
  assert.deepEqual((await themeCookies(ctx)).map((c) => c.value), ['blue']);
  assert.deepEqual(s.violations, []);
  assert.deepEqual(errors, []);
  await ctx.close();
});

test('in a browser on our own names: dark chosen on openfrequency.co.il is dark on teder. and accounts., and light chosen there is light here, one cookie for the domain', async () => {
  // The names point at the test server; the page is the same, what changes is the host the cookie is written from.
  const b = await launch(['--host-resolver-rules=MAP openfrequency.co.il 127.0.0.1, MAP *.openfrequency.co.il 127.0.0.1']);
  assert.ok(b, 'a browser');
  const port = server.address().port;
  const at = (host, p = '/') => `http://${host}:${port}${p}`;
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark' });
  await ctx.addInitScript(watch);
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  try {
    await page.goto(at('openfrequency.co.il'));
    assert.equal((await state(page)).atBody, 'light');
    await page.click('.bar .theme');
    let cookies = await themeCookies(ctx);
    assert.deepEqual(cookies.map((c) => [c.value, c.domain, c.path, c.sameSite, c.secure]), [['dark', '.openfrequency.co.il', '/', 'Lax', false]]);
    for (const host of ['teder.openfrequency.co.il', 'accounts.openfrequency.co.il', 'toran.openfrequency.co.il']) {
      await page.goto(at(host, '/faq/'));
      assert.equal((await state(page)).atBody, 'dark', `${host}: dark before it paints`);
    }
    await page.goto(at('teder.openfrequency.co.il', '/teder/'));
    await page.click('.bar .theme');
    cookies = await themeCookies(ctx);
    assert.deepEqual(cookies.map((c) => [c.value, c.domain]), [['light', '.openfrequency.co.il']], 'the same cookie, not a second one for teder. alone');
    await page.goto(at('openfrequency.co.il', '/'));
    const s = await state(page);
    assert.equal(s.atBody, 'light');
    assert.equal(s.pressed, 'false');
    assert.deepEqual(errors, []);
  } finally {
    await b.close();
  }
});

test('in a browser with storage and cookies blocked: the page is light, nothing breaks, and the button still switches for the visit', async () => {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark' });
  await ctx.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', { get() { throw new Error('storage is blocked'); } });
    Object.defineProperty(Document.prototype, 'cookie', { get() { throw new Error('cookies are blocked'); }, set() { throw new Error('cookies are blocked'); } });
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

// WCAG's contrast ratio of two opaque colours, as getComputedStyle writes them.
const rgb = (s) => s.match(/[\d.]+/g).map(Number);
const lum = (s) => {
  const [r, g, b] = rgb(s).slice(0, 3).map((c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

test('the footer: in light a grey panel with white accents and the page\'s inks, every line 4.5:1 or more; in dark the night panel the light theme had; no new shadow, and neither corner on it', async () => {
  // The footer as the light theme drew it until 2026-11-02, which dark now draws.
  const NIGHT = { bg: 'rgb(29, 29, 31)', edge: 'none', rule: 'rgba(255, 255, 255, 0.1)', word: 'rgba(255, 255, 255, 0.07)', ink: 'rgb(245, 245, 247)', ink2: 'rgb(199, 199, 204)' };
  const GREY = { bg: 'rgb(220, 220, 225)', edge: 'rgb(255, 255, 255) 0px 0px 0px 1px inset', rule: 'rgb(255, 255, 255)', word: 'rgb(255, 255, 255)', ink: 'rgb(29, 29, 31)', ink2: 'rgb(66, 66, 69)' };
  for (const [width, height] of [[390, 844], [1440, 900]]) {
    for (const [theme, want] of [['light', GREY], ['dark', NIGHT]]) {
      const ctx = await browser.newContext({ viewport: { width, height }, colorScheme: theme === 'dark' ? 'light' : 'dark', reducedMotion: 'reduce' });
      if (theme === 'dark') await ctx.addCookies([{ name: THEME_KEY, value: 'dark', url: origin }]);
      const page = await ctx.newPage();
      await page.goto(`${origin}/`);
      const got = await page.evaluate(() => {
        const panel = document.querySelector('.foot-in');
        const cs = (e, pseudo) => getComputedStyle(e, pseudo);
        const inside = [...panel.querySelectorAll('*')];
        const texts = inside
          .filter((e) => !e.closest('.foot-cta, [aria-hidden="true"]') && e.getClientRects().length && [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()))
          .map((e) => [`${e.tagName.toLowerCase()}.${e.className} "${e.textContent.trim().slice(0, 24)}"`, cs(e).color]);
        scrollTo(0, document.documentElement.scrollHeight);
        const r = (s) => document.querySelector(s).getBoundingClientRect().toJSON();
        return {
          bg: cs(panel).backgroundColor,
          edge: cs(panel).boxShadow,
          rule: cs(panel.querySelector('.foot-legal')).borderTopColor,
          word: cs(panel.querySelector('.foot-word'), '::before').color,
          ink: cs(panel.querySelector('.prod b')).color,
          ink2: cs(panel.querySelector('.foot-legal')).color,
          cta: cs(panel.querySelector('.foot-cta')).color,
          shadows: inside.filter((e) => cs(e).boxShadow !== 'none' || cs(e).textShadow !== 'none').map((e) => e.className),
          texts,
          foot: r('.foot-in'), support: r('.support'), a11y: r('.a11y-btn'),
        };
      });
      const at = `${width}px ${theme}`;
      for (const k of Object.keys(want)) assert.equal(got[k], want[k], `${at}: ${k}`);
      assert.equal(got.cta, 'rgb(255, 255, 255)', `${at}: white words on the blue go tile`);
      assert.deepEqual(got.shadows, ['foot-cta'], `${at}: the go tile's own glow is the one shadow in the panel`);
      assert.ok(got.texts.length >= 15, `${at}: the footer's lines were found (${got.texts.length})`);
      for (const [what, color] of got.texts) {
        assert.equal(rgb(color).length, 3, `${at}: ${what} is solid (${color})`);
        const ratio = contrast(color, got.bg);
        assert.ok(ratio >= 4.5, `${at}: ${what} is ${ratio.toFixed(2)}:1 on the panel`);
      }
      for (const corner of ['support', 'a11y']) assert.ok(got[corner].top >= got.foot.bottom, `${at}: the ${corner} corner (top ${Math.round(got[corner].top)}) is under the panel (bottom ${Math.round(got.foot.bottom)})`);
      await ctx.close();
    }
  }
});
