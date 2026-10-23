// The forms end to end in Chrome, against the real endpoint, with a screenshot of each state into docs/screenshots:
// a demo request (the thank-you with its WhatsApp button), a bad address, the endpoint down (our WhatsApp instead),
// the Teder waitlist, and plain posts without JS. Needs a build first (npm run draft). Nothing is sent to Telegram or
// Toran, and WhatsApp is never opened; the leads go to a throwaway database.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
import { serve } from './serve.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'docs/screenshots');
const API = 4721;
const DEMO = '972500000999'; // a made-up demo number
const db = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'of-form-')), 'leads.db');
const REQUEST = /^https:\/\/wa\.me\/972500000999\?text=(.+)$/;
const asked = (href, store) => {
  const m = REQUEST.exec(href || '');
  assert.ok(m, `a link to the demo number: ${href}`);
  assert.match(decodeURIComponent(m[1]), new RegExp(`^REQ-[A-Z2-9]{6} היי, אשמח לדמו של תורן לחנות ${store.replace(/\./g, '\\.')}$`));
};

function startApi() {
  const p = spawn(process.execPath, ['server/lead.mjs'], { cwd: ROOT, env: { ...process.env, PORT: String(API), LEADS_DB: db, TELEGRAM_BOT_TOKEN: '', TORAN_INTAKE_URL: '', DEMO_WA_NUMBER: DEMO }, stdio: ['ignore', 'pipe', 'inherit'] });
  return new Promise((ok) => p.stdout.on('data', (d) => String(d).includes('leads on') && ok(p)));
}

const site = await serve(0, API);
const base = `http://127.0.0.1:${site.address().port}`;
let api = await startApi();
const browser = await chromium.launch({ channel: 'chrome' });

async function at(page, width, scheme, js = true) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: width < 600 ? 2 : 1, colorScheme: scheme, javaScriptEnabled: js });
  // WhatsApp is never really opened: a page that goes there is stopped.
  await ctx.route(/^https:\/\/(wa\.me|api\.whatsapp\.com)\//, (r) => r.abort());
  const pg = await ctx.newPage();
  await pg.goto(base + page);
  // The draft has no WhatsApp number of ours yet; give the forms a made-up one so the fallback link can be seen.
  if (js) await pg.evaluate(() => document.querySelectorAll('form[data-form]').forEach((f) => f.setAttribute('data-wa', '972500000000')));
  return { ctx, pg };
}
const shot = (el, name) => el.screenshot({ path: path.join(OUT, `form-${name}.png`) });

for (const [w, scheme] of [[390, 'light'], [1440, 'dark']]) {
  // A demo request: the thank-you, its button opening WhatsApp to the demo number with the code written.
  let { ctx, pg } = await at('/toran', w, scheme);
  assert.equal(await pg.locator('#demo [name=contact]').count(), 0, 'no phone field: the number comes from WhatsApp');
  await pg.fill('#demo [name=store]', 'https://www.my-shop.co.il/collections/all');
  await pg.click('#demo button[type=submit]');
  await pg.waitForSelector('#demo .done');
  assert.equal(await pg.textContent('#demo .done bdi'), 'my-shop.co.il');
  assert.equal(await pg.evaluate(() => document.activeElement.className), 'done');
  asked(await pg.getAttribute('#demo .done [data-req-wa]', 'href'), 'my-shop.co.il');
  await shot(pg.locator('#demo'), `done-${w}-${scheme}`);

  // A bad address: the message, the field marked and focused.
  await pg.reload();
  await pg.fill('#demo [name=store]', 'my shop');
  await pg.click('#demo button[type=submit]');
  await pg.waitForSelector('#msg-demo:not([hidden])');
  assert.equal(await pg.getAttribute('#demo [name=store]', 'aria-invalid'), 'true');
  assert.equal(await pg.evaluate(() => document.activeElement.name), 'store');
  await shot(pg.locator('#demo'), `store-${w}-${scheme}`);
  await ctx.close();

  // The Teder waitlist.
  ({ ctx, pg } = await at('/teder', w, scheme));
  await pg.fill('form[data-form=teder] [name=contact]', 'me@example.com');
  await pg.click('form[data-form=teder] button[type=submit]');
  await pg.waitForSelector('form[data-form=teder] .done');
  await shot(pg.locator('.teder-field'), `teder-${w}-${scheme}`);
  await ctx.close();
}

// Without JS and with the endpoint up, a demo request goes straight to its WhatsApp message.
{
  const { ctx, pg } = await at('/toran', 390, 'light', false);
  await pg.fill('#demo [name=store]', 'nojs-shop.co.il');
  const [res] = await Promise.all([pg.waitForResponse((r) => r.url().endsWith('/api/lead')), pg.click('#demo button[type=submit]')]);
  assert.equal(res.status(), 303);
  asked(res.headers().location, 'nojs-shop.co.il');
  await ctx.close();
}

// The endpoint down: our own WhatsApp link carries the typed address.
api.kill();
await new Promise((ok) => api.on('exit', ok));
{
  const { ctx, pg } = await at('/toran', 390, 'light');
  await pg.fill('#demo [name=store]', 'my-shop.co.il');
  await pg.click('#demo button[type=submit]');
  await pg.waitForSelector('#msg-demo a[data-wa]');
  const href = await pg.getAttribute('#msg-demo a[data-wa]', 'href');
  assert.equal(decodeURIComponent(href), 'https://wa.me/972500000000?text=היי, אשמח לדמו של תורן לחנות my-shop.co.il');
  await shot(pg.locator('#demo'), 'down-390-light');
  await ctx.close();
}
{
  // Without JS and with the endpoint down, the post lands on the try-again page.
  const { ctx, pg } = await at('/toran', 390, 'light', false);
  await pg.fill('#demo [name=store]', 'my-shop.co.il');
  await Promise.all([pg.waitForNavigation(), pg.click('#demo button[type=submit]')]);
  assert.match(await pg.textContent('h1'), /הפרטים לא הגיעו אלינו/);
  await ctx.close();
}

await browser.close();
site.close();
fs.rmSync(path.join(OUT, 'form-thanks-nojs-390-light.png'), { force: true });
console.log('forms: demo request with its WhatsApp link, bad address, Teder, endpoint down (with and without JS), plain post: all as expected');
