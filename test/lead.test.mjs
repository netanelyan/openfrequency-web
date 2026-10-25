// The lead endpoint, run as it runs on the server: a real process, a real SQLite file, a fake Twilio and a fake
// Toran and Teder intake (Toran's checks the body as Toran does: {url, code}, or a 400).
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { DatabaseSync } from 'node:sqlite';
import { storeHost, mobile, validate, newCode, toranWaLink, waAddress } from '../server/lead.mjs';

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'of-leads-'));
const DB = path.join(dir, 'leads.db');
const PORT = 4790 + Math.floor(Math.random() * 100);
const base = `http://127.0.0.1:${PORT}`;

let twilio; // the fake: records each WhatsApp message it is asked to send, and can be told to fail
const sent = [];
let twilioDown = false;
let proc;
let toran; // the fake intake, Toran's and Teder's by path: records what it is handed
const handed = [];
const TOKEN = 'x'.repeat(40);
const DEMO_WA = '972500000099';
const CODE = /^REQ-[A-Z0-9]{6}$/;
const intakeEnv = () => ({
  TORAN_INTAKE_URL: `http://127.0.0.1:${toran.address().port}/toran/internal/lead`, OF_INTERNAL_TOKEN: TOKEN,
  TEDER_INTAKE_URL: `http://127.0.0.1:${toran.address().port}/teder/internal/lead`,
});
// The lead server as a process, on its own port and database; resolves once it listens.
function start(port, db, extra = {}) {
  const p = spawn(process.execPath, ['server/lead.mjs'], {
    env: {
      ...process.env, PORT: String(port), LEADS_DB: db, TRUST_PROXY: '1', SITE_ORIGIN: 'https://example.co.il',
      TWILIO_ACCOUNT_SID: 'AC1', TWILIO_AUTH_TOKEN: 'T', TWILIO_API: `http://127.0.0.1:${twilio.address().port}`,
      LEAD_WA_FROM: '055-253-6259', LEAD_WA_TO: '0501112233', LEAD_WA_CONTENT_SID: '',
      ...intakeEnv(), TORAN_DEMO_WA: DEMO_WA, ...extra,
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  return new Promise((ok, fail) => {
    p.stdout.on('data', (d) => String(d).includes('leads on') && ok(p));
    p.on('exit', (c) => fail(new Error('lead server exited ' + c)));
  });
}

before(async () => {
  twilio = http.createServer((req, res) => {
    let b = '';
    req.on('data', (c) => (b += c));
    req.on('end', () => {
      if (twilioDown) { res.writeHead(503); res.end('down'); return; }
      sent.push({ url: req.url, auth: req.headers.authorization, form: Object.fromEntries(new URLSearchParams(b)) });
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end('{"sid":"SM1","status":"queued"}');
    });
  });
  await new Promise((ok) => twilio.listen(0, '127.0.0.1', ok));
  toran = http.createServer((req, res) => {
    let b = '';
    req.on('data', (c) => (b += c));
    req.on('end', () => {
      const body = JSON.parse(b);
      handed.push({ path: req.url, auth: req.headers.authorization, body });
      const bad = req.url.startsWith('/toran/') && (Object.keys(body).sort().join() !== 'code,url' || !CODE.test(body.code));
      res.writeHead(bad ? 400 : 200, { 'Content-Type': 'application/json' });
      res.end(bad ? '{"ok":false,"error":"bad"}' : '{"ok":true}');
    });
  });
  await new Promise((ok) => toran.listen(0, '127.0.0.1', ok));
  proc = await start(PORT, DB);
});

after(async () => {
  proc.kill();
  twilio.close();
  toran.close();
});

let ipN = 0;
const post = (fields, { json = true, ip = `10.0.0.${++ipN}`, origin = 'https://example.co.il', to = base } = {}) =>
  fetch(to + '/api/lead', {
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
const rows = (db = DB) => new DatabaseSync(db, { readOnly: true }).prepare('SELECT * FROM leads ORDER BY id').all();
// The message a Toran demo's link writes, read back out of the link.
const waText = (wa) => new URL(wa).searchParams.get('text');
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

test("Toran's demo takes the store's address only, and Teder's a WhatsApp number too", () => {
  assert.deepEqual(validate({ source: 'demo', store: 'www.shop.co.il', page: '/toran' }).lead, { source: 'demo', store: 'shop.co.il', contact: null, page: '/toran' });
  assert.equal(validate({ source: 'demo', store: 'shop.co.il', contact: 'a@b.co' }).lead.contact, null, "a number sent to Toran's form is not kept");
  assert.deepEqual(validate({ source: 'teder', store: 'www.shop.co.il', contact: '050-1234567', page: '/teder' }).lead, { source: 'teder', store: 'shop.co.il', contact: '972501234567', page: '/teder' });
  assert.equal(validate({ source: 'teder', contact: '0501234567' }).error, 'store');
  assert.equal(validate({ source: 'teder', store: 'shop.co.il', contact: 'a@b.co' }).error, 'contact');
  assert.equal(validate({ source: 'join', toran: '1', store: 'shop.co.il' }).error, undefined, 'the join page asks for the number only with Teder');
  assert.equal(validate({ source: 'join', toran: '1', teder: '1', store: 'shop.co.il' }).error, 'contact');
  assert.equal(validate({ source: 'other', contact: 'a@b.co' }).error, 'bad');
});

test("a Toran demo's code and link: REQ- and 6 of A-Z0-9, and a message to the demo number that holds it", () => {
  const codes = new Set(Array.from({ length: 500 }, newCode));
  for (const c of codes) assert.match(c, CODE);
  assert.ok(codes.size > 495, 'random');
  const wa = toranWaLink('shop.co.il', 'REQ-AB12CD', '+972-50-000-0099');
  assert.equal(new URL(wa).origin + new URL(wa).pathname, 'https://wa.me/972500000099');
  assert.equal(waText(wa), 'היי, אשמח לדמו של תורן לחנות shop.co.il.\nהקוד מהאתר: REQ-AB12CD');
  assert.equal(toranWaLink('shop.co.il', 'REQ-AB12CD', ''), null, 'no demo number, no link');
});

test('a Toran demo is saved with its code, sent to the owner on WhatsApp, handed to Toran as {url, code}, and answered with the code and the link', async () => {
  const res = await post({ source: 'demo', store: 'https://www.shop.co.il', page: '/' });
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.match(body.code, CODE);
  assert.deepEqual(body, { ok: true, source: 'demo', store: 'shop.co.il', saved: ['demo'], code: body.code, wa: toranWaLink('shop.co.il', body.code, DEMO_WA) });
  assert.ok(body.wa.startsWith(`https://wa.me/${DEMO_WA}?text=`));
  assert.ok(waText(body.wa).includes(body.code), 'the message holds the code');
  await settle();
  const r = rows().at(-1);
  assert.equal(r.source, 'demo');
  assert.equal(r.store, 'shop.co.il');
  assert.equal(r.code, body.code, 'the code is kept with the lead');
  assert.equal(r.contact, '', 'no number: Toran learns it from the message');
  assert.equal(r.page, '/');
  assert.ok(r.notified_at, 'marked as sent');
  const m = sent.at(-1);
  assert.equal(m.url, '/2010-04-01/Accounts/AC1/Messages.json');
  assert.equal(m.auth, `Basic ${Buffer.from('AC1:T').toString('base64')}`);
  assert.equal(m.form.From, 'whatsapp:+972552536259', 'from the business number');
  assert.equal(m.form.To, 'whatsapp:+972501112233', "to the owner's own");
  assert.match(m.form.Body, /דמו לתורן/);
  assert.match(m.form.Body, /shop\.co\.il/);
  assert.ok(m.form.Body.includes(body.code), 'the message has the code');
  assert.ok(r.forwarded_at, 'Toran took it');
  assert.deepEqual(handed.at(-1), { path: '/toran/internal/lead', auth: `Bearer ${TOKEN}`, body: { url: 'https://shop.co.il/', code: body.code } });
});

test("Toran's one demo per number is Toran's: the site saves every Toran demo, each with its own code", async () => {
  const toToran = handed.length;
  const a = await (await post({ source: 'demo', store: 'another-shop.co.il', contact: '0501234567', page: '/toran' })).json();
  const b = await (await post({ source: 'demo', store: 'another-shop.co.il', page: '/toran' })).json();
  assert.equal(a.ok, true);
  assert.equal(b.ok, true);
  assert.notEqual(a.code, b.code);
  await settle();
  assert.deepEqual(handed.slice(toToran).map((h) => h.body.code), [a.code, b.code]);
  assert.equal(rows().find((r) => r.code === a.code).contact, '', 'a stale number field is not kept');
});

test("Teder's demo is as before: one per WhatsApp number, handed to Teder as {url, whatsapp}", async () => {
  const before = rows().length, toTeder = handed.length;
  let res = await post({ source: 'teder', store: 'shop.co.il', contact: '0501234567', page: '/teder' });
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.deepEqual(body, { ok: true, source: 'teder', store: 'shop.co.il', saved: ['teder'] }, 'no code for Teder');
  res = await post({ source: 'teder', store: 'other.co.il', contact: '+972 50-123-4567' });
  assert.equal(res.status, 409);
  assert.equal((await res.json()).error, 'dup');
  res = await post({ source: 'teder', store: 'third-shop.co.il', contact: '0501234567' }, { json: false });
  assert.equal(res.headers.get('location'), '/thanks/already');
  await settle();
  assert.equal(rows().length, before + 1);
  const r = rows().at(-1);
  assert.equal(r.contact, '972501234567');
  assert.equal(r.code, null);
  assert.ok(r.forwarded_at, 'marked as handed over to Teder');
  assert.equal(handed.length, toTeder + 1);
  assert.deepEqual(handed.at(-1), { path: '/teder/internal/lead', auth: `Bearer ${TOKEN}`, body: { url: 'https://shop.co.il/', whatsapp: '972501234567' } });
  assert.match(sent.at(-1).form.Body, /דמו לתדר/);
  assert.match(sent.at(-1).form.Body, /wa\.me\/972501234567/);
});

test('a plain form post: a Toran demo goes on to WhatsApp, a Teder one to its thank-you, a bad one to try-again', async () => {
  let res = await post({ source: 'demo', store: 'shop2.co.il', page: '/' }, { json: false });
  assert.equal(res.status, 303);
  const to = res.headers.get('location');
  assert.ok(to.startsWith(`https://wa.me/${DEMO_WA}?text=`));
  await settle();
  assert.ok(waText(to).includes(rows().at(-1).code));
  res = await post({ source: 'teder', store: 'shop2.co.il', contact: '0521234567', page: '/teder' }, { json: false });
  assert.equal(res.headers.get('location'), '/thanks/teder');
  res = await post({ source: 'demo', store: 'nope' }, { json: false });
  assert.equal(res.headers.get('location'), '/try-again');
});

test('the honeypot gets a thank-you and nothing is saved', async () => {
  const before = rows().length;
  const res = await post({ source: 'demo', store: 'spam.co.il', company: 'Spam Ltd' });
  assert.equal(res.status, 200);
  assert.equal((await res.json()).ok, true);
  await settle();
  assert.equal(rows().length, before);
});

test('a bad address or number says which field', async () => {
  let res = await post({ source: 'demo', store: 'not a store' });
  assert.equal(res.status, 400);
  assert.equal((await res.json()).error, 'store');
  res = await post({ source: 'teder', store: 'shop.co.il', contact: '123' });
  assert.equal((await res.json()).error, 'contact');
});

test('a post from another site is refused', async () => {
  const res = await post({ source: 'demo', store: 'shop.co.il' }, { origin: 'https://evil.example' });
  assert.equal(res.status, 403);
});

test('one address gets 5 leads an hour, Toran demos too', async () => {
  const ip = '10.9.9.9';
  for (let i = 0; i < 3; i++) assert.equal((await post({ source: 'demo', store: `s${i}.co.il` }, { ip })).status, 200);
  for (let i = 3; i < 5; i++) assert.equal((await post({ source: 'teder', store: `s${i}.co.il`, contact: `05200000${i}0` }, { ip })).status, 200);
  const before = rows().length;
  const res = await post({ source: 'demo', store: 's6.co.il' }, { ip });
  assert.equal(res.status, 429);
  assert.equal((await res.json()).error, 'rate');
  await settle();
  assert.equal(rows().length, before, 'nothing saved');
  assert.equal((await post({ source: 'demo', store: 's7.co.il' })).status, 200, 'another address still gets in');
});

test('when Twilio is down the lead is still saved, marked unsent', async () => {
  twilioDown = true;
  const res = await post({ source: 'demo', store: 'down.co.il', page: '/' });
  assert.equal(res.status, 200);
  await settle();
  twilioDown = false;
  const r = rows().find((x) => x.store === 'down.co.il');
  assert.ok(r);
  assert.equal(r.notified_at, null);
  assert.equal(r.tries, 1);
});

test('too big a body is refused', async () => {
  const res = await post({ source: 'teder', contact: 'x'.repeat(5000) });
  assert.equal(res.status, 413);
});

test('the join page asks for one or both demos: Toran by its code, Teder by its number', async () => {
  assert.equal(validate({ source: 'join', store: 'a.co.il', contact: '0530000001' }).error, 'products', 'nothing ticked');
  const before = rows().length, toIntake = handed.length;
  let res = await post({ source: 'join', toran: '1', teder: '1', store: 'both.co.il', contact: '0530000001', page: '/join' });
  assert.equal(res.status, 200);
  let body = await res.json();
  assert.deepEqual(body.saved, ['demo', 'teder']);
  assert.match(body.code, CODE);
  assert.ok(waText(body.wa).includes(body.code));
  await settle();
  assert.deepEqual(rows().slice(before).map((r) => [r.source, r.store, r.contact, r.code]), [['demo', 'both.co.il', '', body.code], ['teder', 'both.co.il', '972530000001', null]]);
  assert.deepEqual(handed.slice(toIntake).map((h) => [h.path, h.body]).sort(), [
    ['/teder/internal/lead', { url: 'https://both.co.il/', whatsapp: '972530000001' }],
    ['/toran/internal/lead', { url: 'https://both.co.il/', code: body.code }],
  ], 'each to its own product, as it takes it');
  // Asking again for both: Teder's is already there for this number, so only Toran's is saved, with a new code.
  res = await post({ source: 'join', toran: '1', teder: '1', store: 'both.co.il', contact: '0530000001' });
  assert.equal(res.status, 200);
  const again = await res.json();
  assert.deepEqual(again.saved, ['demo']);
  assert.notEqual(again.code, body.code);
  // Teder again alone from that number is "we have it"; Toran alone needs no number.
  assert.equal((await post({ source: 'join', teder: '1', store: 'both.co.il', contact: '0530000001' })).status, 409);
  body = await (await post({ source: 'join', toran: '1', store: 'toran-only.co.il', page: '/join' })).json();
  assert.deepEqual([body.saved, CODE.test(body.code)], [['demo'], true]);
  res = await post({ source: 'join', teder: '1', store: 'teder-only.co.il', contact: '0530000002', page: '/join' }, { json: false });
  assert.equal(res.headers.get('location'), '/thanks/teder');
});

test("without TORAN_DEMO_WA a Toran demo still gets its code, with no link", async () => {
  const port = PORT + 100;
  const db = path.join(dir, 'no-wa.db');
  const p = await start(port, db, { TORAN_DEMO_WA: '' });
  try {
    const body = await (await post({ source: 'demo', store: 'nowa.co.il' }, { to: `http://127.0.0.1:${port}` })).json();
    assert.match(body.code, CODE);
    assert.equal(body.wa, null);
    const res = await post({ source: 'demo', store: 'nowa2.co.il' }, { to: `http://127.0.0.1:${port}`, json: false });
    assert.equal(res.headers.get('location'), '/thanks');
  } finally {
    p.kill();
  }
});

test('a database from before the codes gets the column; its Toran leads are not handed to Toran again, its Teder ones are', async () => {
  const db = path.join(dir, 'old.db');
  const old = new DatabaseSync(db);
  old.exec(`CREATE TABLE leads (id INTEGER PRIMARY KEY, created_at TEXT NOT NULL, source TEXT NOT NULL, store TEXT, contact TEXT NOT NULL,
    page TEXT, notified_at TEXT, tries INTEGER NOT NULL DEFAULT 0, forwarded_at TEXT, forward_tries INTEGER NOT NULL DEFAULT 0);
    INSERT INTO leads (created_at, source, store, contact, notified_at) VALUES ('2026-10-20T10:00:00.000Z', 'demo', 'old-toran.co.il', '972541111111', '2026-10-20T10:00:01.000Z');
    INSERT INTO leads (created_at, source, store, contact, notified_at) VALUES ('2026-10-20T10:00:00.000Z', 'teder', 'old-teder.co.il', '972542222222', '2026-10-20T10:00:01.000Z');`);
  old.close();
  const toIntake = handed.length;
  const port = PORT + 200;
  const p = await start(port, db);
  try {
    await settle(); // the retry at start
    const cols = new DatabaseSync(db, { readOnly: true }).prepare('PRAGMA table_info(leads)').all().map((c) => c.name);
    assert.ok(cols.includes('code'));
    assert.deepEqual(handed.slice(toIntake).map((h) => [h.path, h.body]), [['/teder/internal/lead', { url: 'https://old-teder.co.il/', whatsapp: '972542222222' }]]);
    const [t, d] = [rows(db).find((r) => r.source === 'demo'), rows(db).find((r) => r.source === 'teder')];
    assert.deepEqual([t.forward_tries, t.forwarded_at], [0, null], 'the old Toran lead is left alone');
    assert.ok(d.forwarded_at);
    // and the database takes new Toran demos with their codes
    const body = await (await post({ source: 'demo', store: 'new.co.il' }, { to: `http://127.0.0.1:${port}` })).json();
    await settle();
    assert.equal(rows(db).at(-1).code, body.code);
  } finally {
    p.kill();
  }
});

test('everyone together gets 200 leads a day', async () => {
  const port = PORT + 300;
  const p = await start(port, path.join(dir, 'day.db'), { TWILIO_ACCOUNT_SID: '', TORAN_INTAKE_URL: '', TEDER_INTAKE_URL: '' });
  try {
    for (let i = 0; i < 200; i++) {
      const res = await post({ source: 'demo', store: `day${i}.co.il` }, { to: `http://127.0.0.1:${port}`, ip: `10.8.${i >> 2}.${i & 3}` });
      assert.equal(res.status, 200, `lead ${i}`);
    }
    const res = await post({ source: 'demo', store: 'day-over.co.il' }, { to: `http://127.0.0.1:${port}`, ip: '10.7.0.1' });
    assert.equal(res.status, 429);
  } finally {
    p.kill();
  }
});

test('a number as Twilio takes it', () => {
  assert.equal(waAddress('055-253-6259'), 'whatsapp:+972552536259');
  assert.equal(waAddress('+972 50 111 2233'), 'whatsapp:+972501112233');
  assert.equal(waAddress('12'), null);
  assert.equal(waAddress(''), null);
});

test('with an approved template the lead goes as its one variable, on one line', async () => {
  const port = PORT + 400;
  const p = await start(port, path.join(dir, 'template.db'), { LEAD_WA_CONTENT_SID: 'HX123' });
  try {
    const n = sent.length;
    await post({ source: 'teder', store: 'tmpl.co.il', contact: '0547777777', page: '/teder' }, { to: `http://127.0.0.1:${port}` });
    await settle();
    const m = sent.slice(n).at(-1);
    assert.equal(m.form.ContentSid, 'HX123');
    assert.equal(m.form.Body, undefined, 'no plain text beside the template');
    const v = JSON.parse(m.form.ContentVariables)['1'];
    assert.ok(!v.includes('\n'), 'a variable takes no line breaks');
    assert.match(v, /דמו לתדר · חנות: tmpl\.co\.il · וואטסאפ: https:\/\/wa\.me\/972547777777/);
  } finally {
    p.kill();
  }
});

test('turning the sender on sends the recent unsent leads, never the old ones', async () => {
  const db = path.join(dir, 'backlog.db');
  const old = new DatabaseSync(db);
  old.exec(`CREATE TABLE leads (id INTEGER PRIMARY KEY, created_at TEXT NOT NULL, source TEXT NOT NULL, store TEXT, contact TEXT NOT NULL,
    page TEXT, notified_at TEXT, tries INTEGER NOT NULL DEFAULT 0);`);
  const ins = old.prepare("INSERT INTO leads (created_at, source, store, contact) VALUES (?, 'teder', ?, '972543333333')");
  ins.run(new Date(Date.now() - 5 * 86_400_000).toISOString(), 'week-old.co.il');
  ins.run(new Date(Date.now() - 3_600_000).toISOString(), 'hour-old.co.il');
  old.close();
  const n = sent.length;
  const p = await start(PORT + 500, db, { TEDER_INTAKE_URL: '' });
  try {
    await settle(); // the retry at start
    assert.deepEqual(sent.slice(n).map((m) => m.form.Body.match(/חנות: (\S+)/)[1]), ['hour-old.co.il']);
    assert.equal(rows(db).find((r) => r.store === 'week-old.co.il').notified_at, null);
  } finally {
    p.kill();
  }
});

test('with Resend set and no Twilio, each lead is emailed to the owner and marked sent', async () => {
  const mails = [];
  const resend = http.createServer((req, res) => {
    let b = '';
    req.on('data', (c) => (b += c));
    req.on('end', () => {
      mails.push({ url: req.url, auth: req.headers.authorization, body: JSON.parse(b) });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end('{"id":"e1"}');
    });
  });
  await new Promise((ok) => resend.listen(0, '127.0.0.1', ok));
  const port = PORT + 200;
  const db = path.join(dir, 'mail.db');
  const p = await start(port, db, {
    TWILIO_ACCOUNT_SID: '', RESEND_API_KEY: 're_test', RESEND_API: `http://127.0.0.1:${resend.address().port}`,
    LEAD_EMAIL_FROM: 'OpenFrequency <leads@example.co.il>', LEAD_EMAIL_TO: 'owner@example.co.il, partner@example.co.il',
  });
  try {
    const body = await (await post({ source: 'demo', store: 'mailshop.co.il', page: '/toran' }, { to: `http://127.0.0.1:${port}` })).json();
    await settle();
    const m = mails.at(-1);
    assert.equal(m.url, '/emails');
    assert.equal(m.auth, 'Bearer re_test');
    assert.equal(m.body.from, 'OpenFrequency <leads@example.co.il>');
    assert.deepEqual(m.body.to, ['owner@example.co.il', 'partner@example.co.il']);
    assert.match(m.body.subject, /דמו לתורן: mailshop\.co\.il/);
    assert.ok(m.body.text.includes(body.code), 'the email has the code');
    assert.ok(rows(db).at(-1).notified_at, 'marked as sent');
  } finally {
    p.kill();
    resend.close();
  }
});
