// The forms end to end in Chrome, against the real endpoint, with a screenshot of each state into docs/screenshots:
// the thank-you, a bad address, the endpoint down (the WhatsApp way), the Teder waitlist, and a plain post without JS.
// Needs a build first (npm run draft). Nothing is sent to Telegram; the leads go to a throwaway database.
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
const db = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'of-form-')), 'leads.db');

function startApi() {
  const p = spawn(process.execPath, ['server/lead.mjs'], { cwd: ROOT, env: { ...process.env, PORT: String(API), LEADS_DB: db, TELEGRAM_BOT_TOKEN: '' }, stdio: ['ignore', 'pipe', 'inherit'] });
  return new Promise((ok) => p.stdout.on('data', (d) => String(d).includes('leads on') && ok(p)));
}

const site = await serve(0, API);
const base = `http://127.0.0.1:${site.address().port}`;
let api = await startApi();
const browser = await chromium.launch({ channel: 'chrome' });

async function at(width, scheme, js = true) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: width < 600 ? 2 : 1, colorScheme: scheme, javaScriptEnabled: js });
  const pg = await ctx.newPage();
  await pg.goto(base + '/');
  // The draft has no WhatsApp number yet; give the forms a made-up one so the fallback link can be seen.
  if (js) await pg.evaluate(() => document.querySelectorAll('form[data-form]').forEach((f) => f.setAttribute('data-wa', '972500000000')));
  return { ctx, pg };
}
const shot = (el, name) => el.screenshot({ path: path.join(OUT, `form-${name}.png`) });

for (const [w, scheme] of [[390, 'light'], [1440, 'dark']]) {
  // The thank-you.
  let { ctx, pg } = await at(w, scheme);
  await pg.fill('#demo [name=store]', 'https://www.my-shop.co.il/collections/all');
  await pg.fill('#demo [name=contact]', '050-123-4567');
  await pg.click('#demo button[type=submit]');
  await pg.waitForSelector('#demo .done');
  assert.equal(await pg.textContent('#demo .done bdi'), 'my-shop.co.il');
  assert.equal(await pg.evaluate(() => document.activeElement.className), 'done');
  await shot(pg.locator('#demo'), `done-${w}-${scheme}`);

  // A bad address: the message, the field marked and focused.
  await pg.reload();
  await pg.fill('#demo [name=store]', 'my shop');
  await pg.fill('#demo [name=contact]', '0501234567');
  await pg.click('#demo button[type=submit]');
  await pg.waitForSelector('#msg-demo:not([hidden])');
  assert.equal(await pg.getAttribute('#demo [name=store]', 'aria-invalid'), 'true');
  assert.equal(await pg.evaluate(() => document.activeElement.name), 'store');
  await shot(pg.locator('#demo'), `store-${w}-${scheme}`);

  // The Teder waitlist.
  await pg.fill('form[data-form=teder] [name=contact]', 'me@example.com');
  await pg.click('form[data-form=teder] button[type=submit]');
  await pg.waitForSelector('form[data-form=teder] .done');
  await shot(pg.locator('#teder .panel'), `teder-${w}-${scheme}`);
  await ctx.close();
}

// The endpoint down: the WhatsApp link carries the typed address.
api.kill();
await new Promise((ok) => api.on('exit', ok));
{
  const { ctx, pg } = await at(390, 'light');
  await pg.fill('#demo [name=store]', 'my-shop.co.il');
  await pg.fill('#demo [name=contact]', '0501234567');
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
  await pg.fill('#demo [name=contact]', '0501234567');
  await Promise.all([pg.waitForNavigation(), pg.click('#demo button[type=submit]')]);
  assert.match(await pg.textContent('h1'), /הפרטים לא הגיעו אלינו/);
  await ctx.close();
}

// Without JS and with the endpoint up, the post lands on the thank-you page.
api = await startApi();
{
  const { ctx, pg } = await at(390, 'light', false);
  await pg.fill('#demo [name=store]', 'nojs-shop.co.il');
  await pg.fill('#demo [name=contact]', '0501234567');
  await Promise.all([pg.waitForNavigation(), pg.click('#demo button[type=submit]')]);
  assert.equal(new URL(pg.url()).pathname, '/thanks');
  await pg.screenshot({ path: path.join(OUT, 'form-thanks-nojs-390-light.png') });
  await ctx.close();
}

await browser.close();
api.kill();
site.close();
console.log('forms: thank-you, bad address, Teder, endpoint down (with and without JS), plain post: all as expected');
