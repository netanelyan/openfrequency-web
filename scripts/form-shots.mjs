// The forms end to end in Chrome, against the real endpoint, with a screenshot of each state into docs/screenshots:
// the thank-you (the request's code and the button to Toran's demo number), a bad address, the endpoint down (the
// WhatsApp way), a plain post without JS, and the join page's number, which shows only with Teder ticked.
// Needs a build first (npm run draft). Nothing is sent to WhatsApp; the leads go to a throwaway database.
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
const DEMO_WA = '972500000098'; // a made-up demo number
const db = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'of-form-')), 'leads.db');

function startApi() {
  const p = spawn(process.execPath, ['server/lead.mjs'], { cwd: ROOT, env: { ...process.env, PORT: String(API), LEADS_DB: db, TWILIO_ACCOUNT_SID: '', TORAN_DEMO_WA: DEMO_WA }, stdio: ['ignore', 'pipe', 'inherit'] });
  return new Promise((ok) => p.stdout.on('data', (d) => String(d).includes('leads on') && ok(p)));
}

const site = await serve(0, API);
const base = `http://127.0.0.1:${site.address().port}`;
let api = await startApi();
const browser = await chromium.launch({ channel: 'chrome' });

async function at(width, scheme, js = true) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: width < 600 ? 2 : 1, colorScheme: scheme, javaScriptEnabled: js });
  const pg = await ctx.newPage();
  await pg.goto(base + '/toran');
  // The draft has no WhatsApp number yet; give the forms a made-up one so the fallback link can be seen.
  if (js) await pg.evaluate(() => document.querySelectorAll('form[data-form]').forEach((f) => f.setAttribute('data-wa', '972500000000')));
  return { ctx, pg };
}
const shot = (el, name) => el.screenshot({ path: path.join(OUT, `form-${name}.png`) });

for (const [w, scheme] of [[390, 'light'], [1440, 'dark']]) {
  // The thank-you.
  let { ctx, pg } = await at(w, scheme);
  await pg.fill('#demo [name=store]', 'https://www.my-shop.co.il/collections/all');
  assert.equal(await pg.$('#demo [name=contact]'), null, "Toran's form takes the address only");
  await pg.click('#demo button[type=submit]');
  await pg.waitForSelector('#demo .done');
  const code = await pg.textContent('#demo .done [data-code]');
  assert.match(code, /^REQ-[A-Z0-9]{6}$/);
  const go = new URL(await pg.getAttribute('#demo .done a[data-wa-go]', 'href'));
  assert.equal(go.origin + go.pathname, 'https://wa.me/' + DEMO_WA);
  assert.ok(go.searchParams.get('text').includes(code), 'the message holds the code');
  assert.equal(await pg.evaluate(() => document.activeElement.className), 'done');
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
}

// The endpoint down: the WhatsApp link carries the typed address.
api.kill();
await new Promise((ok) => api.on('exit', ok));
{
  const { ctx, pg } = await at(390, 'light');
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
  const { ctx, pg } = await at(390, 'light', false);
  await pg.fill('#demo [name=store]', 'my-shop.co.il');
  await Promise.all([pg.waitForNavigation(), pg.click('#demo button[type=submit]')]);
  assert.match(await pg.textContent('h1'), /הפרטים לא הגיעו אלינו/);
  await ctx.close();
}

// Without JS and with the endpoint up, a Toran demo's post goes on to WhatsApp, with the message that holds its code.
api = await startApi();
{
  const { ctx, pg } = await at(390, 'light', false);
  // (a redirect's target can't be routed, so the request is read as it leaves)
  await pg.fill('#demo [name=store]', 'nojs-shop.co.il');
  const [wa] = await Promise.all([pg.waitForRequest((r) => r.url().startsWith('https://wa.me/')), pg.click('#demo button[type=submit]')]);
  const to = new URL(wa.url());
  assert.equal(to.pathname, '/' + DEMO_WA);
  assert.match(to.searchParams.get('text'), /nojs-shop\.co\.il[\s\S]*REQ-[A-Z0-9]{6}/);
  await ctx.close();
}

// The join page: the number is Teder's, so it shows, and is asked for, only while Teder is ticked.
{
  const { ctx, pg } = await at(390, 'light');
  await pg.goto(base + '/join');
  assert.equal(await pg.isVisible('#join [name=contact]'), false);
  await pg.click('#join .pick:has([name=teder]) .pick-box');
  assert.equal(await pg.isVisible('#join [name=contact]'), true);
  assert.equal(await pg.getAttribute('#join [name=contact]', 'required'), '');
  await pg.fill('#join [name=store]', 'join-shop.co.il');
  await pg.fill('#join [name=contact]', '0501234570');
  await pg.click('#join button[type=submit]');
  await pg.waitForSelector('#join .done');
  assert.match(await pg.textContent('#join .done [data-code]'), /^REQ-[A-Z0-9]{6}$/);
  assert.equal(await pg.isVisible('#join .done [data-teder]'), true, 'and the line for Teder');
  await shot(pg.locator('#join'), 'join-done-390-light');
  await ctx.close();
}

await browser.close();
api.kill();
site.close();
console.log("forms: the code and its button, bad address, endpoint down (with and without JS), plain post to WhatsApp, the join page's number: all as expected");
