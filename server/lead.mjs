// The lead endpoint: the only moving part of the site. The demo form and the Teder waitlist post here; each lead is
// saved to SQLite first and then sent to Telegram, so a Telegram outage never loses one (unsent leads are retried).
//
//   node server/lead.mjs            listen on 127.0.0.1:$PORT (Caddy proxies /api/* to it)
//   node server/lead.mjs list [n]   print the last n leads (default 20)
//
// Environment (on the server, in /etc/openfrequency-web/lead.env, never in the repo):
//   PORT                 default 4720
//   LEADS_DB             default private/leads.db
//   TELEGRAM_BOT_TOKEN   the bot that pings you; without it leads are only saved
//   TELEGRAM_CHAT_ID     your chat with the bot
//   SITE_ORIGIN          https://<domain>; a browser post from any other origin is refused
//   TRUST_PROXY          1 behind Caddy: the client's address is the last X-Forwarded-For entry
//   TELEGRAM_API         default https://api.telegram.org (the tests point it at a fake)
//   TORAN_INTAKE_URL     Toran's /internal/lead on this machine (http://127.0.0.1:4710/internal/lead); without it a
//                        demo request only goes to Telegram
//   OF_INTERNAL_TOKEN    the token Toran checks, the same value as in Toran's and accounts' private/.env
//   DEMO_WA_NUMBER       Toran's demo number, international digits (9725XXXXXXXX). Without it a demo request can't be
//                        confirmed, so the form is answered "down" and offers our WhatsApp instead
//
// What a lead holds: for a demo, the store's address and a request code; for Teder, a WhatsApp number or an email; and
// the source form, the page and the time. The client's IP address is used for the rate limit, in memory only, and
// never written down.
//
// A demo request is confirmed on WhatsApp, not here: the form takes only the store's address, gets back a code
// (REQ-XXXXXX) and a link that opens WhatsApp to the demo number with the code already written. Toran adds the store
// only when that message arrives, for the number it came from, and one number gets one demo (Toran's
// src/channels/request.ts). So the request is handed to Toran with its code, and, like Telegram, a handover that fails
// is retried.
import http from 'node:http';
import { randomInt } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const env = process.env;
const DB_PATH = env.LEADS_DB || path.join(ROOT, 'private/leads.db');

const LIMITS = {
  body: 4096, // bytes
  perIp: 5, // leads an hour from one address
  perDay: 200, // leads a day from everyone, so a flood can't fill the disk or the Telegram chat
  telegramTries: 10,
};

// ---------------------------------------------------------------- storage

function open() {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  const db = new DatabaseSync(DB_PATH);
  db.exec(`PRAGMA journal_mode = WAL;
CREATE TABLE IF NOT EXISTS leads (
  id          INTEGER PRIMARY KEY,
  created_at  TEXT NOT NULL,              -- ISO time, UTC
  source      TEXT NOT NULL,              -- demo | teder
  store       TEXT,                       -- the store's host name, for a demo
  contact     TEXT NOT NULL,              -- Teder: 9725XXXXXXXX or an email; a demo: '' (its number comes on WhatsApp)
  page        TEXT,                       -- the page the form was on
  notified_at TEXT,                       -- when Telegram took it; NULL until then
  tries       INTEGER NOT NULL DEFAULT 0  -- Telegram attempts
);`);
  // Added with the handover to Toran; a database from before gets them here.
  const cols = new Set(db.prepare('PRAGMA table_info(leads)').all().map((c) => c.name));
  if (!cols.has('forwarded_at')) db.exec('ALTER TABLE leads ADD COLUMN forwarded_at TEXT'); // when Toran took it
  if (!cols.has('forward_tries')) db.exec('ALTER TABLE leads ADD COLUMN forward_tries INTEGER NOT NULL DEFAULT 0');
  if (!cols.has('code')) db.exec('ALTER TABLE leads ADD COLUMN code TEXT'); // a demo's REQ-XXXXXX
  db.exec('DROP INDEX IF EXISTS leads_demo_contact');
  db.exec('CREATE UNIQUE INDEX IF NOT EXISTS leads_code ON leads (code) WHERE code IS NOT NULL');
  return db;
}

// A demo request's code: six characters with no lookalikes (no 0/O, 1/I/L), new for each request.
const CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
export function newCode(db) {
  for (;;) {
    const code = 'REQ-' + Array.from({ length: 6 }, () => CODE_CHARS[randomInt(CODE_CHARS.length)]).join('');
    if (!db.prepare('SELECT 1 FROM leads WHERE code = ?').get(code)) return code;
  }
}

// The link the form's button opens: WhatsApp, to the demo number, with the request's message already written.
export const waText = (code, store) => `${code} היי, אשמח לדמו של תורן לחנות ${store}`;
const demoNumber = () => (/^9725\d{8}$/.test(String(env.DEMO_WA_NUMBER || '')) ? env.DEMO_WA_NUMBER : null);
const waLink = (code, store) => `https://wa.me/${demoNumber()}?text=${encodeURIComponent(waText(code, store))}`;

// ---------------------------------------------------------------- what a lead may contain

// A store's address as people type it ("shop.co.il", "https://www.shop.co.il/collections/x"), kept as its host name.
export function storeHost(s) {
  const t = String(s || '').trim();
  if (!t || t.length > 300 || /\s/.test(t)) return null;
  try {
    const u = new URL(/^https?:\/\//i.test(t) ? t : 'https://' + t);
    const host = u.hostname.toLowerCase().replace(/^www\./, '');
    return /^[a-z0-9֐-׿-]+(\.[a-z0-9֐-׿-]+)+$/.test(host) && host.length <= 253 ? host : null;
  } catch {
    return null;
  }
}

// An Israeli mobile, in any of the ways people write it, as 9725XXXXXXXX.
export function mobile(s) {
  const d = String(s || '').replace(/[\s\-().]/g, '').replace(/^\+/, '');
  if (!/^\d+$/.test(d)) return null;
  if (/^05\d{8}$/.test(d)) return '972' + d.slice(1);
  if (/^9725\d{8}$/.test(d)) return d;
  return null;
}

const email = (s) => {
  const t = String(s || '').trim().toLowerCase();
  return t.length <= 200 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t) ? t : null;
};

// The form's fields, checked. Returns { lead } or { error }: 'store', 'contact' or 'bad'.
export function validate(f) {
  const source = f.source;
  if (source !== 'demo' && source !== 'teder') return { error: 'bad' };
  const page = typeof f.page === 'string' && /^\/[\w\-/]{0,60}$/.test(f.page) ? f.page : null;
  if (source === 'demo') {
    const store = storeHost(f.store);
    if (!store) return { error: 'store' };
    return { lead: { source, store, contact: '', page } };
  }
  const contact = mobile(f.contact) || email(f.contact);
  if (!contact) return { error: 'contact' };
  return { lead: { source, store: null, contact, page } };
}

// ---------------------------------------------------------------- the rate limit, in memory

const hits = new Map(); // ip -> [ms, ...] within the last hour
const day = []; // ms of every lead saved in the last 24 hours

function allowed(ip, now = Date.now()) {
  while (day.length && now - day[0] > 86_400_000) day.shift();
  if (day.length >= LIMITS.perDay) return false;
  const mine = (hits.get(ip) || []).filter((t) => now - t < 3_600_000);
  hits.set(ip, mine);
  return mine.length < LIMITS.perIp;
}
function count(ip, now = Date.now()) {
  hits.get(ip).push(now);
  day.push(now);
}
// Forget addresses with nothing in the last hour, so the map stays small.
setInterval(() => {
  const now = Date.now();
  for (const [ip, t] of hits) if (!t.some((x) => now - x < 3_600_000)) hits.delete(ip);
}, 600_000).unref();

// ---------------------------------------------------------------- Telegram

const when = (iso) => new Date(iso).toLocaleString('he-IL', { timeZone: 'Asia/Jerusalem', dateStyle: 'short', timeStyle: 'short' });

function message(row) {
  const who = /^\d+$/.test(row.contact) ? `וואטסאפ: https://wa.me/${row.contact}` : `מייל: ${row.contact}`;
  return row.source === 'demo'
    ? `בקשה לדמו של תורן\nחנות: ${row.store}\nקוד: ${row.code} (נחשבת רק כשמגיעה הודעה בוואטסאפ)\nמהעמוד ${row.page || '?'}, ${when(row.created_at)}`
    : `ליד חדש, רשימת ההמתנה של תדר\n${who}\nמהעמוד ${row.page || '?'}, ${when(row.created_at)}`;
}

async function notify(db, row) {
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) return false;
  db.prepare('UPDATE leads SET tries = tries + 1 WHERE id = ?').run(row.id);
  try {
    const res = await fetch(`${env.TELEGRAM_API || 'https://api.telegram.org'}/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text: message(row), disable_web_page_preview: true }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`Telegram ${res.status}: ${(await res.text()).slice(0, 200)}`);
    db.prepare('UPDATE leads SET notified_at = ? WHERE id = ?').run(new Date().toISOString(), row.id);
    return true;
  } catch (e) {
    console.error(`lead ${row.id}: not sent to Telegram (${e.message}); it is saved and will be retried`);
    return false;
  }
}

// ---------------------------------------------------------------- Toran

async function forward(db, row) {
  if (row.source !== 'demo' || !row.code || !env.TORAN_INTAKE_URL || !env.OF_INTERNAL_TOKEN) return false;
  db.prepare('UPDATE leads SET forward_tries = forward_tries + 1 WHERE id = ?').run(row.id);
  try {
    const res = await fetch(env.TORAN_INTAKE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.OF_INTERNAL_TOKEN}` },
      body: JSON.stringify({ url: `https://${row.store}/`, code: row.code }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`Toran ${res.status}: ${(await res.text()).slice(0, 200)}`);
    db.prepare('UPDATE leads SET forwarded_at = ? WHERE id = ?').run(new Date().toISOString(), row.id);
    return true;
  } catch (e) {
    console.error(`lead ${row.id}: not handed to Toran (${e.message}); it is saved and will be retried`);
    return false;
  }
}

async function retry(db) {
  const rows = db.prepare('SELECT * FROM leads WHERE notified_at IS NULL AND tries < ? ORDER BY id LIMIT 20').all(LIMITS.telegramTries);
  for (const row of rows) await notify(db, row);
  const toToran = db.prepare("SELECT * FROM leads WHERE source = 'demo' AND code IS NOT NULL AND forwarded_at IS NULL AND forward_tries < ? ORDER BY id LIMIT 20").all(LIMITS.telegramTries);
  for (const row of toToran) await forward(db, row);
}

// ---------------------------------------------------------------- HTTP

function clientIp(req) {
  const peer = req.socket.remoteAddress || '';
  const local = peer === '127.0.0.1' || peer === '::1' || peer === '::ffff:127.0.0.1';
  if (env.TRUST_PROXY === '1' && local && req.headers['x-forwarded-for']) {
    return String(req.headers['x-forwarded-for']).split(',').pop().trim();
  }
  return peer;
}

// The body, up to LIMITS.body. Anything bigger is refused with a 413; the rest of it is read and dropped, so the
// client still gets the answer.
function readBody(req) {
  return new Promise((ok, fail) => {
    const tooBig = () => Object.assign(new Error('too big'), { status: 413 });
    if (Number(req.headers['content-length']) > LIMITS.body) { req.resume(); fail(tooBig()); return; }
    let size = 0;
    const chunks = [];
    req.on('data', (c) => {
      size += c.length;
      if (size > LIMITS.body) { req.removeAllListeners('data'); req.resume(); fail(tooBig()); return; }
      chunks.push(c);
    });
    req.on('end', () => ok(Buffer.concat(chunks).toString('utf8')));
    req.on('error', fail);
  });
}

function parse(req, body) {
  const type = String(req.headers['content-type'] || '');
  if (type.startsWith('application/json')) {
    const o = JSON.parse(body);
    return o && typeof o === 'object' ? o : {};
  }
  return Object.fromEntries(new URLSearchParams(body));
}

// A browser with JS asks for JSON and gets JSON; a plain form post gets a redirect: a demo request straight to its
// WhatsApp message, the waitlist to its thank-you, and anything that went wrong to the page that says so.
function reply(req, res, status, body) {
  if (String(req.headers.accept || '').includes('application/json')) {
    res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end(JSON.stringify(body));
    return;
  }
  const to = !body.ok ? '/try-again' : body.source === 'teder' ? '/thanks/teder' : body.wa || '/try-again';
  res.writeHead(303, { Location: to, 'Cache-Control': 'no-store' });
  res.end();
}

export function createServer(db) {
  return http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://x');
    if (url.pathname === '/api/health') { res.writeHead(200, { 'Content-Type': 'text/plain' }); res.end('ok'); return; }
    if (url.pathname !== '/api/lead') { res.writeHead(404); res.end(); return; }
    if (req.method !== 'POST') { res.writeHead(405, { Allow: 'POST' }); res.end(); return; }

    // A post from another site is refused. Browsers always send Origin on a POST; a missing one is a script, which the
    // rate limit and the honeypot handle like anyone else.
    const origin = req.headers.origin;
    if (env.SITE_ORIGIN && origin && origin !== env.SITE_ORIGIN) return reply(req, res, 403, { ok: false, error: 'bad' });

    let fields;
    try {
      fields = parse(req, await readBody(req));
    } catch (e) {
      return reply(req, res, e.status || 400, { ok: false, error: 'bad' });
    }

    // The honeypot: a field people never see. Whatever fills it gets a normal "thank you" and nothing is saved.
    if (fields.company) return reply(req, res, 200, { ok: true, source: fields.source });

    const ip = clientIp(req);
    if (!allowed(ip)) return reply(req, res, 429, { ok: false, error: 'rate' });

    const { lead, error } = validate(fields);
    if (error) return reply(req, res, 400, { ok: false, error });

    // A demo is confirmed on WhatsApp; with no demo number there is nowhere to confirm it, so it counts as down.
    if (lead.source === 'demo' && !demoNumber()) return reply(req, res, 503, { ok: false, error: 'down' });

    const created_at = new Date().toISOString();
    const code = lead.source === 'demo' ? newCode(db) : null;
    const { lastInsertRowid } = db.prepare('INSERT INTO leads (created_at, source, store, contact, page, code) VALUES (?, ?, ?, ?, ?, ?)')
      .run(created_at, lead.source, lead.store, lead.contact, lead.page, code);
    count(ip);
    reply(req, res, 200, { ok: true, source: lead.source, ...(code ? { store: lead.store, code, wa: waLink(code, lead.store) } : {}) });
    const row = { id: Number(lastInsertRowid), created_at, ...lead, code };
    notify(db, row);
    forward(db, row);
  });
}

// ---------------------------------------------------------------- run

const main = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (main && process.argv[2] === 'list') {
  const db = open();
  const n = Number(process.argv[3]) || 20;
  const rows = db.prepare('SELECT id, created_at, source, store, contact, code, page, notified_at, forwarded_at FROM leads ORDER BY id DESC LIMIT ?').all(n);
  for (const r of rows.reverse()) {
    console.log([r.id, when(r.created_at), r.source, r.store || '-', r.code || r.contact || '-', r.page || '-', r.notified_at ? 'sent' : 'NOT SENT', r.source === 'demo' ? (r.forwarded_at ? 'in toran' : 'NOT IN TORAN') : ''].join('  ').trim());
  }
  db.close();
} else if (main) {
  const db = open();
  const port = Number(env.PORT || 4720);
  const server = createServer(db);
  server.listen(port, '127.0.0.1', () => console.log(`leads on 127.0.0.1:${port}, saved to ${DB_PATH}${env.TELEGRAM_BOT_TOKEN ? '' : ' (no Telegram token: saving only)'}`));
  const timer = setInterval(() => retry(db), 300_000);
  retry(db);
  const stop = () => { clearInterval(timer); server.close(() => { db.close(); process.exit(0); }); };
  process.on('SIGTERM', stop);
  process.on('SIGINT', stop);
}
