// The lead endpoint, run as it runs on the server: a real process, a real SQLite file, a fake Telegram and a fake
// Toran intake.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { DatabaseSync } from 'node:sqlite';
import { storeHost, mobile, validate } from '../server/lead.mjs';

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'of-leads-'));
const DB = path.join(dir, 'leads.db');
const PORT = 4790 + Math.floor(Math.random() * 100);
const base = `http://127.0.0.1:${PORT}`;

let telegram; // the fake: records what it is sent, and can be told to fail
const sent = [];
let telegramDown = false;
let proc;
let toran; // the fake intake: records what it is handed
const handed = [];
const TOKEN = 'x'.repeat(40);

before(async () => {
  telegram = http.createServer((req, res) => {
    let b = '';
    req.on('data', (c) => (b += c));
    req.on('end', () => {
      if (telegramDown) { res.writeHead(502); res.end('down'); return; }
      sent.push({ url: req.url, body: JSON.parse(b) });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end('{"ok":true}');
    });
  });
  await new Promise((ok) => telegram.listen(0, '127.0.0.1', ok));
  toran = http.createServer((req, res) => {
    let b = '';
    req.on('data', (c) => (b += c));
    req.on('end', () => {
      handed.push({ path: req.url, auth: req.headers.authorization, body: JSON.parse(b) });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end('{"ok":true}');
    });
  });
  await new Promise((ok) => toran.listen(0, '127.0.0.1', ok));
  proc = spawn(process.execPath, ['server/lead.mjs'], {
    env: {
      ...process.env, PORT: String(PORT), LEADS_DB: DB, TRUST_PROXY: '1', SITE_ORIGIN: 'https://example.co.il',
      TELEGRAM_BOT_TOKEN: 'T', TELEGRAM_CHAT_ID: 'C', TELEGRAM_API: `http://127.0.0.1:${telegram.address().port}`,
      TORAN_INTAKE_URL: `http://127.0.0.1:${toran.address().port}/internal/lead`, OF_INTERNAL_TOKEN: TOKEN,
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  await new Promise((ok, fail) => {
    proc.stdout.on('data', (d) => String(d).includes('leads on') && ok());
    proc.on('exit', (c) => fail(new Error('lead server exited ' + c)));
  });
});

after(async () => {
  proc.kill();
  telegram.close();
  toran.close();
});

let ipN = 0;
const post = (fields, { json = true, ip = `10.0.0.${++ipN}`, origin = 'https://example.co.il' } = {}) =>
  fetch(base + '/api/lead', {
    method: 'POST',
    redirect: 'manual',
    headers: {
      'Content-Type': json ? 'application/json' : 'application/x-www-form-urlencoded',
      Accept: json ? 'application/json' : 'text/html',
      'X-Forwarded-For': ip,
      ...(origin ? { Origin: origin } : {}),
    },
    body: json ? JSON.stringify(fields) : new URLSearchParams(fields).toString(),
  });
const rows = () => new DatabaseSync(DB, { readOnly: true }).prepare('SELECT * FROM leads ORDER BY id').all();
const settle = () => new Promise((ok) => setTimeout(ok, 300));

test('a store address is kept as its host name', () => {
  assert.equal(storeHost('shop.co.il'), 'shop.co.il');
  assert.equal(storeHost(' https://www.Shop.co.il/collections/all?x=1 '), 'shop.co.il');
  assert.equal(storeHost('my-store.myshopify.com'), 'my-store.myshopify.com');
  assert.equal(storeHost('not a url'), null);
  assert.equal(storeHost('localhost'), null);
  assert.equal(storeHost(''), null);
});

test('an Israeli mobile is kept as 9725XXXXXXXX', () => {
  assert.equal(mobile('050-123-4567'), '972501234567');
  assert.equal(mobile('+972 50 123 4567'), '972501234567');
  assert.equal(mobile('0501234567'), '972501234567');
  assert.equal(mobile('03-1234567'), null);
  assert.equal(mobile('12345'), null);
});

test("both demos, Toran's and Teder's, take a store and a WhatsApp number", () => {
  assert.deepEqual(validate({ source: 'teder', store: 'www.shop.co.il', contact: '050-1234567', page: '/teder' }).lead, { source: 'teder', store: 'shop.co.il', contact: '972501234567', page: '/teder' });
  assert.equal(validate({ source: 'teder', contact: '0501234567' }).error, 'store');
  assert.equal(validate({ source: 'demo', store: 'shop.co.il', contact: 'a@b.co' }).error, 'contact');
  assert.equal(validate({ source: 'other', contact: 'a@b.co' }).error, 'bad');
});

test('a demo lead is saved, then sent to Telegram', async () => {
  const res = await post({ source: 'demo', store: 'https://www.shop.co.il', contact: '050-1234567', page: '/' });
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { ok: true, source: 'demo', store: 'shop.co.il' });
  await settle();
  const r = rows().at(-1);
  assert.equal(r.store, 'shop.co.il');
  assert.equal(r.contact, '972501234567');
  assert.equal(r.page, '/');
  assert.ok(r.notified_at, 'marked as sent');
  const m = sent.at(-1);
  assert.equal(m.url, '/botT/sendMessage');
  assert.equal(m.body.chat_id, 'C');
  assert.match(m.body.text, /shop\.co\.il/);
  assert.match(m.body.text, /wa\.me\/972501234567/);
  // and handed to Toran, which adds the store to its dashboard
  assert.ok(r.forwarded_at, 'marked as handed over');
  assert.deepEqual(handed.at(-1), { path: '/internal/lead', auth: `Bearer ${TOKEN}`, body: { url: 'https://shop.co.il/', whatsapp: '972501234567' } });
});

test('one demo per WhatsApp number: a second ask is answered, and nothing is saved or handed over', async () => {
  const before = rows().length, toToran = handed.length;
  let res = await post({ source: 'demo', store: 'another-shop.co.il', contact: '+972 50-123-4567', page: '/toran' });
  assert.equal(res.status, 409);
  assert.equal((await res.json()).error, 'dup');
  res = await post({ source: 'demo', store: 'third-shop.co.il', contact: '0501234567' }, { json: false });
  assert.equal(res.headers.get('location'), '/thanks/already');
  await settle();
  assert.equal(rows().length, before);
  assert.equal(handed.length, toToran);
  // The same number may still ask for Teder's demo, once, and that one is not handed to Toran.
  assert.equal((await post({ source: 'teder', store: 'shop.co.il', contact: '0501234567' })).status, 200);
  assert.equal((await post({ source: 'teder', store: 'other.co.il', contact: '0501234567' })).status, 409);
  await settle();
  assert.equal(handed.length, toToran);
  assert.match(sent.at(-1).body.text, /דמו לתדר/);
});

test('a plain form post is redirected to the thank-you page for its form', async () => {
  let res = await post({ source: 'demo', store: 'shop2.co.il', contact: '0521234567', page: '/' }, { json: false });
  assert.equal(res.status, 303);
  assert.equal(res.headers.get('location'), '/thanks');
  res = await post({ source: 'teder', store: 'shop2.co.il', contact: '0521234567', page: '/teder' }, { json: false });
  assert.equal(res.headers.get('location'), '/thanks/teder');
  res = await post({ source: 'demo', store: 'nope', contact: '0521234567' }, { json: false });
  assert.equal(res.headers.get('location'), '/try-again');
});

test('the honeypot gets a thank-you and nothing is saved', async () => {
  const before = rows().length;
  const res = await post({ source: 'demo', store: 'spam.co.il', contact: '0501234567', company: 'Spam Ltd' });
  assert.equal(res.status, 200);
  assert.equal((await res.json()).ok, true);
  await settle();
  assert.equal(rows().length, before);
});

test('a bad address or number says which field', async () => {
  let res = await post({ source: 'demo', store: 'not a store', contact: '0501234567' });
  assert.equal(res.status, 400);
  assert.equal((await res.json()).error, 'store');
  res = await post({ source: 'demo', store: 'shop.co.il', contact: '123' });
  assert.equal((await res.json()).error, 'contact');
});

test('a post from another site is refused', async () => {
  const res = await post({ source: 'teder', contact: 'x@y.co' }, { origin: 'https://evil.example' });
  assert.equal(res.status, 403);
});

test('one address gets 5 leads an hour', async () => {
  const ip = '10.9.9.9';
  const ask = (n) => ({ source: 'teder', store: `s${n}.co.il`, contact: `05200000${String(n).padStart(2, '0')}` });
  for (let i = 0; i < 5; i++) assert.equal((await post(ask(i), { ip })).status, 200);
  const res = await post(ask(6), { ip });
  assert.equal(res.status, 429);
  assert.equal((await res.json()).error, 'rate');
  assert.equal((await post(ask(7))).status, 200, 'another address still gets in');
});

test('when Telegram is down the lead is still saved, marked unsent', async () => {
  telegramDown = true;
  const res = await post({ source: 'demo', store: 'down.co.il', contact: '0541234567', page: '/' });
  assert.equal(res.status, 200);
  await settle();
  telegramDown = false;
  const r = rows().find((x) => x.store === 'down.co.il');
  assert.ok(r);
  assert.equal(r.notified_at, null);
  assert.equal(r.tries, 1);
});

test('too big a body is refused', async () => {
  const res = await post({ source: 'teder', contact: 'x'.repeat(5000) });
  assert.equal(res.status, 413);
});
