// Toran's waitlist for accounts' /admin/waitlist: the whole list, a message to it by email (each with its own link to
// leave), and that link. In process, with a fake Resend.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { listenFree } from './ports.mjs';

const TOKEN = 'w'.repeat(40);
const mails = [];
let resend, server, base, db, lead;
const auth = { authorization: `Bearer ${TOKEN}` };

before(async () => {
  resend = http.createServer((req, res) => {
    let b = '';
    req.on('data', (c) => (b += c));
    req.on('end', () => { mails.push(JSON.parse(b)); res.writeHead(200, { 'Content-Type': 'application/json' }); res.end('{"id":"x"}'); });
  });
  await listenFree(resend);
  Object.assign(process.env, { OF_INTERNAL_TOKEN: TOKEN, RESEND_API: `http://127.0.0.1:${resend.address().port}`, RESEND_API_KEY: 'k', LEAD_EMAIL_FROM: 'OF <leads@example.co.il>', SITE_ORIGIN: 'https://example.co.il' });
  lead = await import('../server/lead.mjs');
  db = lead.open(path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'of-wait-')), 'leads.db'));
  const add = db.prepare('INSERT INTO leads (created_at, source, store, contact) VALUES (?, ?, ?, ?)');
  add.run('2026-01-01T00:00:00.000Z', 'waitlist', null, 'old@shop.co.il'); // older than the 30 days of /internal/leads
  add.run(new Date().toISOString(), 'waitlist', 'shop.co.il', '972501234567');
  add.run(new Date().toISOString(), 'teder', 'other.co.il', '972509999999');
  server = lead.createServer(db, { gapMs: 0 });
  await listenFree(server);
  base = `http://127.0.0.1:${server.address().port}`;
});
after(() => { server.close(); resend.close(); });

test('the whole waitlist, old sign-ups too, and nothing else; only with the token', async () => {
  assert.equal((await fetch(`${base}/internal/waitlist`)).status, 401);
  const r = await (await fetch(`${base}/internal/waitlist`, { headers: auth })).json();
  assert.deepEqual(r.waitlist.map((x) => x.contact), ['972501234567', 'old@shop.co.il']);
});

test('a message goes by email to each email, with a link to leave; phones come back for WhatsApp; the same one twice is refused', async () => {
  const post = (body) => fetch(`${base}/internal/waitlist/send`, { method: 'POST', headers: { ...auth, 'content-type': 'application/json' }, body: JSON.stringify(body) });
  assert.equal((await post({ subject: '', text: 'x' })).status, 400);
  const r = await post({ subject: 'תורן נפתח', text: 'שלום' });
  assert.deepEqual(await r.json(), { emails: 1, phones: ['972501234567'] });
  assert.equal((await post({ subject: 'תורן נפתח', text: 'שלום' })).status, 409);
  await new Promise((ok) => setTimeout(ok, 100));
  assert.equal(mails.length, 1);
  assert.deepEqual(mails[0].to, ['old@shop.co.il']);
  const link = /https:\/\/example\.co\.il(\/api\/unsubscribe\?id=\d+&t=[\w-]{24})/.exec(mails[0].text);
  assert.ok(link && mails[0].headers['List-Unsubscribe'].includes(link[1]));

  // The link: GET only asks (mail scanners open links), POST removes; a wrong token removes nobody.
  const id = Number(/id=(\d+)/.exec(link[1])[1]);
  assert.match(await (await fetch(base + link[1])).text(), /להסיר אותי/);
  await fetch(base + link[1].replace(/t=.*/, 't=' + 'a'.repeat(24)), { method: 'POST' });
  assert.ok(db.prepare('SELECT 1 FROM leads WHERE id = ?').get(id));
  assert.match(await (await fetch(base + link[1], { method: 'POST' })).text(), /הסרנו אתכם/);
  assert.equal(db.prepare('SELECT 1 FROM leads WHERE id = ?').get(id), undefined);
});
