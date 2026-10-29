// The lead endpoint: the only moving part of the site. The demo forms and Toran's waitlist post here; each lead is
// saved to SQLite first and then sent to the owner: to their own WhatsApp from the business number (through Twilio),
// to their email (through Resend), or both, so an outage never loses one (unsent leads are retried).
//
//   node server/lead.mjs            listen on 127.0.0.1:$PORT (Caddy proxies /api/* to it)
//   node server/lead.mjs list [n]   print the last n leads (default 20)
//   node server/lead.mjs purge      delete the leads past the privacy policy's period now (the server does it daily)
//   node server/lead.mjs backup [dir] [--keep 14]
//                                   a consistent copy of the database into dir (LEADS_BACKUPS, default
//                                   private/backups), checked (PRAGMA integrity_check and a count of the leads), the
//                                   newest --keep kept; exits 1 when the copy fails the check
//                                   (deploy/openfrequency-web-leads-backup.service runs it nightly)
//
// Keeping leads (the privacy policy, legal.leadMonths in site.config.json): a lead stays KEEP_MONTHS (6) from the last
// time its phone or email asked us anything, then it is deleted, once a day, with the count in the log. The database
// overwrites what it deletes (secure_delete), so a deleted lead is not left in the file's free pages.
//
// Health: GET /api/health answers "ok" while the process runs; GET /api/readyz reads the database and answers 503 when
// it can't (deploy/deploy.sh checks it after each restart).
//
// Environment (on the server, in /etc/openfrequency-web/lead.env, never in the repo):
//   PORT                 default 4720
//   LEADS_DB             default private/leads.db
//   LEAD_KEEP_MONTHS     default 6, the privacy policy's legal.leadMonths; change both together
//   TWILIO_ACCOUNT_SID   the Twilio account that sends the WhatsApp message (AC...); without it leads are only saved
//   TWILIO_AUTH_TOKEN    its auth token
//   LEAD_WA_FROM         the business number, a WhatsApp sender on that Twilio account (0552536259 or 972552536259)
//   LEAD_WA_TO           the owner's own WhatsApp number, where each lead is sent
//   LEAD_WA_CONTENT_SID  the approved WhatsApp template (HX...), its {{1}} the lead in one line. Without it the message
//                        goes as plain text, which WhatsApp only delivers within 24 hours of the owner's last message
//                        to the business number
//   SITE_ORIGIN          https://<domain>; a browser post from any other origin is refused
//   TRUST_PROXY          1 behind Caddy: the client's address is the last X-Forwarded-For entry
//   TWILIO_API           default https://api.twilio.com (the tests point it at a fake)
//   RESEND_API_KEY       a Resend key that can send; with LEAD_EMAIL_FROM and LEAD_EMAIL_TO each lead is emailed too
//   LEAD_EMAIL_FROM      a sender on a domain verified in Resend, e.g. OpenFrequency <leads@openfrequency.co.il>
//   LEAD_EMAIL_TO        the owner's address (several, comma-separated)
//   RESEND_API           default https://api.resend.com (the tests point it at a fake)
//   TORAN_INTAKE_URL     Toran's /internal/lead on this machine (http://127.0.0.1:4710/internal/lead); without it a
//                        demo lead only goes to WhatsApp
//   TEDER_INTAKE_URL     Teder's /internal/lead on this machine (http://127.0.0.1:4700/internal/lead); without it a
//                        Teder lead only goes to WhatsApp
//   OF_INTERNAL_TOKEN    the token Toran and Teder check, the same value as in their and accounts' private/.env
//   TORAN_DEMO_WA        Toran's demo WhatsApp number, digits with the country code (972...): a Toran demo's form
//                        answers with a wa.me link to it, holding the request's code; without it, the code alone
//
// What a lead holds: which demo (Toran's or Teder's), the store's address, the page and the time; for Teder a WhatsApp
// number, and for Toran the request's code (REQ-XXXXXX). A Toran waitlist lead (source 'waitlist', the form the site
// shows while products.toran is "soon") holds a phone or an email and nothing else; it goes to the owner as
// "רשימת המתנה לתורן", is handed to no product, and is saved once per phone or email. The client's IP address is used for the rate limit, in memory
// only, and never written down.
//
// A Toran demo takes the store's address only. The answer is a code and a wa.me link to Toran's demo number with a
// message holding it; Toran counts the demo once that message arrives, so the number proves itself, and Toran keeps
// one demo per number (it answers "already" on WhatsApp). The code and the address are handed to Toran as
// {url, code} (openfrequency-toran, docs/operator.md, section 3).
//
// A Teder demo takes a WhatsApp number too, and Teder gets one per number: a second ask from a number that already
// asked is answered "we have it" and saved nowhere. It is handed to Teder as {url, whatsapp}, and Teder builds the
// store's slideshow for the operator to approve. Like the WhatsApp message, a handover that fails is retried.
import crypto from 'node:crypto';
import http from 'node:http';
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
  perDay: 200, // leads a day from everyone, so a flood can't fill the disk or the owner's WhatsApp
  tries: 10, // attempts at the WhatsApp message, and at each handover
  notifyWithin: 2 * 86_400_000, // a lead older than this is not sent any more: turning the sender on never floods
};

// ---------------------------------------------------------------- storage

export function open(dbPath = DB_PATH) {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  const db = new DatabaseSync(dbPath);
  db.exec(`PRAGMA journal_mode = WAL;
PRAGMA secure_delete = ON;
CREATE TABLE IF NOT EXISTS leads (
  id          INTEGER PRIMARY KEY,
  created_at  TEXT NOT NULL,              -- ISO time, UTC
  source      TEXT NOT NULL,              -- demo | teder | waitlist (Toran's, while it is soon)
  store       TEXT,                       -- the store's host name, for a demo
  contact     TEXT NOT NULL,              -- 9725XXXXXXXX, or an email on the waitlist; '' for a Toran demo, whose number Toran learns from its message
  page        TEXT,                       -- the page the form was on
  notified_at TEXT,                       -- when the WhatsApp message to the owner went; NULL until then
  tries       INTEGER NOT NULL DEFAULT 0  -- attempts at it
);`);
  // Added with the handover to Toran; a database from before gets them here.
  const cols = new Set(db.prepare('PRAGMA table_info(leads)').all().map((c) => c.name));
  if (!cols.has('forwarded_at')) db.exec('ALTER TABLE leads ADD COLUMN forwarded_at TEXT'); // when Toran or Teder took it
  if (!cols.has('forward_tries')) db.exec('ALTER TABLE leads ADD COLUMN forward_tries INTEGER NOT NULL DEFAULT 0');
  // Added with the codes: a Toran demo's REQ-XXXXXX. Rows from before have none, and are not handed to Toran again.
  if (!cols.has('code')) db.exec('ALTER TABLE leads ADD COLUMN code TEXT');
  // Added with the retention: the last time this phone or email asked again (a second ask is not saved as a row of
  // its own), so the period runs from the last contact.
  if (!cols.has('last_at')) db.exec('ALTER TABLE leads ADD COLUMN last_at TEXT');
  db.exec("CREATE INDEX IF NOT EXISTS leads_demo_contact ON leads (contact) WHERE source = 'demo'");
  db.exec('CREATE UNIQUE INDEX IF NOT EXISTS leads_code ON leads (code) WHERE code IS NOT NULL');
  db.exec('CREATE INDEX IF NOT EXISTS leads_created ON leads (created_at)');
  return db;
}

// ---------------------------------------------------------------- keeping and copying

// How long a lead is kept: the privacy policy's legal.leadMonths (site.config.json), from the last contact.
export const KEEP_MONTHS = Number(env.LEAD_KEEP_MONTHS || 6);

// The leads past the period, deleted: a lead whose last contact (its own time, or the last time the same phone or
// email asked again) is more than `months` ago, unless the same phone or email has a newer lead inside the period. A
// Toran demo's row holds no contact (Toran has the number), so its own time is all it has. Returns how many went.
export function purge(db, { now = Date.now(), months = KEEP_MONTHS } = {}) {
  const d = new Date(now);
  d.setUTCMonth(d.getUTCMonth() - months);
  const cutoff = d.toISOString();
  const { changes } = db.prepare(`DELETE FROM leads WHERE COALESCE(last_at, created_at) < ? AND (contact = '' OR NOT EXISTS (
    SELECT 1 FROM leads newer WHERE newer.contact = leads.contact AND COALESCE(newer.last_at, newer.created_at) >= ?))`).run(cutoff, cutoff);
  return Number(changes);
}

function purgeAndLog(db) {
  try {
    const n = purge(db);
    console.log(`leads: ${n} deleted, older than ${KEEP_MONTHS} months since the last contact (privacy policy)`);
  } catch (e) {
    console.error(`leads: the daily delete failed (${e.message})`);
  }
}

// A consistent copy of the database (SQLite's VACUUM INTO reads a snapshot while the endpoint runs), opened again and
// checked: PRAGMA integrity_check must say ok and the leads must be readable. A copy that fails is removed and the
// call throws, so the nightly unit fails and its OnFailure alert goes out. The newest `keep` copies stay.
export function backup(dbPath, dir, { keep = 14, now = new Date() } = {}) {
  fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
  const file = path.join(dir, `leads-${now.toISOString().replace(/[:.]/g, '-')}.db`);
  const src = new DatabaseSync(dbPath, { readOnly: true });
  try {
    src.exec(`VACUUM INTO '${file.replace(/'/g, "''")}'`);
  } finally {
    src.close();
  }
  let rows;
  try {
    const copy = new DatabaseSync(file, { readOnly: true });
    try {
      const check = Object.values(copy.prepare('PRAGMA integrity_check').get())[0];
      if (check !== 'ok') throw new Error(`integrity_check says ${check}`);
      rows = copy.prepare('SELECT count(*) AS n FROM leads').get().n;
    } finally {
      copy.close();
    }
  } catch (e) {
    fs.rmSync(file, { force: true });
    throw new Error(`the copy ${file} failed its check, and was removed: ${e.message}`);
  }
  const all = fs.readdirSync(dir).filter((f) => /^leads-.*\.db$/.test(f)).sort();
  for (const f of all.slice(0, Math.max(0, all.length - keep))) fs.rmSync(path.join(dir, f));
  return { file, rows, kept: Math.min(all.length, keep) };
}

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

// An email address, plainly checked, kept in lower case.
export function email(s) {
  const t = String(s || '').trim().toLowerCase();
  return t.length <= 254 && /^[^\s@<>()",;:]+@[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(t) ? t : null;
}

// The form's fields, checked. Returns { lead, sources } or { error }: 'store', 'contact', 'products' or 'bad'. Every
// form asks for a demo: 'demo' is Toran's, 'teder' a sample slideshow from Teder, and 'join' (the join page) either or
// both, ticked as toran=1 and teder=1. Each takes the store's address; Teder's also a WhatsApp number, which Toran's
// doesn't need (lead.contact is null then). `sources` is the demos asked for, one saved row each. 'waitlist' is
// Toran's waitlist: a phone or an email in contact, and the store's address only if one is sent and it is valid.
export function validate(f) {
  const source = f.source;
  if (source !== 'demo' && source !== 'teder' && source !== 'join' && source !== 'waitlist') return { error: 'bad' };
  const page = typeof f.page === 'string' && /^\/[\w\-/]{0,60}$/.test(f.page) ? f.page : null;
  if (source === 'waitlist') {
    const contact = mobile(f.contact) || email(f.contact);
    if (!contact) return { error: 'contact' };
    return { lead: { source, store: storeHost(f.store), contact, page }, sources: [source] };
  }
  const ticked = (v) => v === '1' || v === 1 || v === true || v === 'on';
  const sources = source !== 'join' ? [source] : [...(ticked(f.toran) ? ['demo'] : []), ...(ticked(f.teder) ? ['teder'] : [])];
  if (!sources.length) return { error: 'products' };
  const store = storeHost(f.store);
  if (!store) return { error: 'store' };
  const contact = sources.includes('teder') ? mobile(f.contact) : null;
  if (sources.includes('teder') && !contact) return { error: 'contact' };
  return { lead: { source: sources[0], store, contact, page }, sources };
}

// A Toran demo's code: REQ- and 6 of A-Z0-9, random. Toran (channels/request.ts) reads it from the person's message.
const CODE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
export const newCode = () => 'REQ-' + Array.from({ length: 6 }, () => CODE_CHARS[crypto.randomInt(CODE_CHARS.length)]).join('');

// The message the form's button writes to Toran's demo number, and the link that opens it; null without TORAN_DEMO_WA.
export const toranWaText = (store, code) => `היי, אשמח לדמו של תורן לחנות ${store}.\nהקוד מהאתר: ${code}`;
export function toranWaLink(store, code, number = env.TORAN_DEMO_WA) {
  const n = String(number || '').replace(/\D/g, '');
  return n ? `https://wa.me/${n}?text=${encodeURIComponent(toranWaText(store, code))}` : null;
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

// ---------------------------------------------------------------- the owner's WhatsApp

const when = (iso) => new Date(iso).toLocaleString('he-IL', { timeZone: 'Asia/Jerusalem', dateStyle: 'short', timeStyle: 'short' });

function message(row) {
  // A Toran demo has its code, and its number only once the person writes with it (Toran has that); a lead from
  // before the codes has its number.
  const who = row.code
    ? `קוד: ${row.code}, נספר כשיכתבו איתו למספר של הדמו`
    : /^\d+$/.test(row.contact) ? `וואטסאפ: https://wa.me/${row.contact}` : `מייל: ${row.contact}`;
  if (row.source === 'waitlist') return `ליד חדש, רשימת המתנה לתורן
${who}${row.store ? `
חנות: ${row.store}` : ''}
מהעמוד ${row.page || '?'}, ${when(row.created_at)}`;
  return row.source === 'demo'
    ? `ליד חדש, דמו לתורן\nחנות: ${row.store}\n${who}\nמהעמוד ${row.page || '?'}, ${when(row.created_at)}`
    : `ליד חדש, דמו לתדר\nחנות: ${row.store}\n${who}\nמהעמוד ${row.page || '?'}, ${when(row.created_at)}`;
}

// A number as Twilio takes it: an Israeli mobile in any spelling, or digits with the country code.
export function waAddress(s) {
  const d = mobile(s) || String(s || '').replace(/\D/g, '');
  return /^\d{10,15}$/.test(d) ? `whatsapp:+${d}` : null;
}

const waReady = () => Boolean(env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN && waAddress(env.LEAD_WA_FROM) && waAddress(env.LEAD_WA_TO));

// The business number writes to the owner first, so WhatsApp wants an approved template: its one variable holds the
// lead on one line (a template's variable takes no line breaks). Without a template it goes as the plain message.
export function waRequest(row) {
  const form = { From: waAddress(env.LEAD_WA_FROM), To: waAddress(env.LEAD_WA_TO) };
  if (env.LEAD_WA_CONTENT_SID) {
    form.ContentSid = env.LEAD_WA_CONTENT_SID;
    form.ContentVariables = JSON.stringify({ 1: message(row).split('\n').join(' · ') });
  } else form.Body = message(row);
  return new URLSearchParams(form);
}

// The owner's email, beside the WhatsApp message or instead of it: the same lead, through Resend.
const mailReady = () => Boolean(env.RESEND_API_KEY && env.LEAD_EMAIL_FROM && env.LEAD_EMAIL_TO);

export function mailRequest(row) {
  const text = message(row);
  return {
    from: env.LEAD_EMAIL_FROM,
    to: String(env.LEAD_EMAIL_TO).split(',').map((a) => a.trim()).filter(Boolean),
    subject: `${text.split('\n')[0]}: ${row.store || row.contact}`,
    text,
  };
}

async function sendWa(row) {
  const sid = encodeURIComponent(env.TWILIO_ACCOUNT_SID);
  const res = await fetch(`${env.TWILIO_API || 'https://api.twilio.com'}/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: 'POST',
    headers: { Authorization: `Basic ${Buffer.from(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`).toString('base64')}` },
    body: waRequest(row),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`Twilio ${res.status}: ${(await res.text()).slice(0, 200)}`);
}

async function sendMail(row) {
  const res = await fetch(`${env.RESEND_API || 'https://api.resend.com'}/emails`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(mailRequest(row)),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${(await res.text()).slice(0, 200)}`);
}

// A lead counts as sent once any of the owner's channels took it; each one that failed is logged.
async function notify(db, row) {
  const channels = [[waReady(), 'WhatsApp', sendWa], [mailReady(), 'email', sendMail]].filter(([on]) => on);
  if (!channels.length) return false;
  db.prepare('UPDATE leads SET tries = tries + 1 WHERE id = ?').run(row.id);
  let sent = false;
  for (const [, name, send] of channels) {
    try {
      await send(row);
      sent = true;
    } catch (e) {
      console.error(`lead ${row.id}: not sent by ${name} (${e.message})`);
    }
  }
  if (sent) db.prepare('UPDATE leads SET notified_at = ? WHERE id = ?').run(new Date().toISOString(), row.id);
  else console.error(`lead ${row.id}: saved, and will be retried`);
  return sent;
}

// ---------------------------------------------------------------- Toran and Teder

// Which product takes a lead of each source, where it listens on this machine, and what it is handed: Toran the
// request's code (a lead from before the codes has none, and Toran would refuse it), Teder the WhatsApp number.
const INTAKE = {
  demo: ['Toran', () => env.TORAN_INTAKE_URL, (row) => (row.code ? { url: `https://${row.store}/`, code: row.code } : null)],
  teder: ['Teder', () => env.TEDER_INTAKE_URL, (row) => ({ url: `https://${row.store}/`, whatsapp: row.contact })],
};

async function forward(db, row) {
  const [product, url, body] = INTAKE[row.source] || [];
  if (!product || !url() || !env.OF_INTERNAL_TOKEN || !body(row)) return false;
  db.prepare('UPDATE leads SET forward_tries = forward_tries + 1 WHERE id = ?').run(row.id);
  try {
    const res = await fetch(url(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.OF_INTERNAL_TOKEN}` },
      body: JSON.stringify(body(row)),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`${product} ${res.status}: ${(await res.text()).slice(0, 200)}`);
    db.prepare('UPDATE leads SET forwarded_at = ? WHERE id = ?').run(new Date().toISOString(), row.id);
    return true;
  } catch (e) {
    console.error(`lead ${row.id}: not handed to ${product} (${e.message}); it is saved and will be retried`);
    return false;
  }
}

async function retry(db) {
  const since = new Date(Date.now() - LIMITS.notifyWithin).toISOString();
  const rows = db.prepare('SELECT * FROM leads WHERE notified_at IS NULL AND tries < ? AND created_at > ? ORDER BY id LIMIT 20').all(LIMITS.tries, since);
  for (const row of rows) await notify(db, row);
  const toHand = db.prepare("SELECT * FROM leads WHERE (source = 'teder' OR (source = 'demo' AND code IS NOT NULL)) AND forwarded_at IS NULL AND forward_tries < ? ORDER BY id LIMIT 20").all(LIMITS.tries);
  for (const row of toHand) await forward(db, row);
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

// A browser with JS asks for JSON and gets JSON; a plain form post gets a redirect to a page that says what happened,
// or, for a Toran demo, straight to WhatsApp with the message that holds its code (the pages' form-action allows it).
function reply(req, res, status, body) {
  if (String(req.headers.accept || '').includes('application/json')) {
    res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end(JSON.stringify(body));
    return;
  }
  const to = body.ok ? body.wa || (body.source === 'teder' ? '/thanks/teder' : body.source === 'waitlist' ? '/thanks/waitlist' : '/thanks') : body.error === 'dup' ? '/thanks/already' : '/try-again';
  res.writeHead(303, { Location: to, 'Cache-Control': 'no-store' });
  res.end();
}

export function createServer(db) {
  return http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://x');
    if (url.pathname === '/api/health') { res.writeHead(200, { 'Content-Type': 'text/plain' }); res.end('ok'); return; }
    // Ready: the database answers a read. The deploy checks this after a restart, and a monitor can.
    if (url.pathname === '/api/readyz') {
      let ready = false;
      try {
        db.prepare('SELECT count(*) AS n FROM leads').get();
        ready = true;
      } catch (e) {
        console.error(`readyz: the database did not answer (${e.message})`);
      }
      res.writeHead(ready ? 200 : 503, { 'Content-Type': 'text/plain', 'Cache-Control': 'no-store' });
      res.end(ready ? 'ready' : 'not ready');
      return;
    }
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

    const { lead, sources, error } = validate(fields);
    if (error) return reply(req, res, 400, { ok: false, error });

    // One Teder demo per number: if this number asked for one already, it isn't saved again, and with nothing else
    // asked for it is answered "we have it". The waitlist keeps one row per phone or email the same way, but a second
    // sign-up is simply thanked: it asks for nothing new. Toran keeps its own one per number, by the number its message comes from,
    // so a Toran demo is always saved here. The check and the insert run with no await between them, so two posts at
    // once can't both get through.
    const fresh = sources.filter((s) => s === 'demo' || !db.prepare('SELECT 1 FROM leads WHERE source = ? AND contact = ?').get(s, lead.contact));
    // A second ask is not saved again, but it is a contact: the lead it repeats is kept KEEP_MONTHS from now (purge).
    for (const s of sources) {
      if (s !== 'demo' && !fresh.includes(s)) db.prepare('UPDATE leads SET last_at = ? WHERE source = ? AND contact = ?').run(new Date().toISOString(), s, lead.contact);
    }
    count(ip);
    if (!fresh.length && lead.source === 'waitlist') return reply(req, res, 200, { ok: true, source: 'waitlist', saved: [] });
    if (!fresh.length) return reply(req, res, 409, { ok: false, error: 'dup' });

    const created_at = new Date().toISOString();
    let code = null;
    if (fresh.includes('demo')) do code = newCode(); while (db.prepare('SELECT 1 FROM leads WHERE code = ?').get(code));
    const rows = fresh.map((source) => {
      const row = { created_at, ...lead, source, contact: source === 'demo' ? '' : lead.contact, code: source === 'demo' ? code : null };
      const { lastInsertRowid } = db.prepare('INSERT INTO leads (created_at, source, store, contact, page, code) VALUES (?, ?, ?, ?, ?, ?)')
        .run(row.created_at, row.source, row.store, row.contact, row.page, row.code);
      return { id: Number(lastInsertRowid), ...row };
    });
    // A Toran demo answers its code and the link that writes it to the demo number. Without JS, a Teder-only request
    // lands on Teder's thank-you.
    reply(req, res, 200, {
      ok: true, source: fresh.includes('demo') ? 'demo' : fresh[0], store: lead.store, saved: fresh,
      ...(code ? { code, wa: toranWaLink(lead.store, code) } : {}),
    });
    for (const row of rows) {
      notify(db, row);
      forward(db, row);
    }
  });
}

// ---------------------------------------------------------------- run

const main = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (main && process.argv[2] === 'list') {
  const db = open();
  const n = Number(process.argv[3]) || 20;
  const rows = db.prepare('SELECT id, created_at, source, store, contact, code, page, notified_at, forwarded_at FROM leads ORDER BY id DESC LIMIT ?').all(n);
  for (const r of rows.reverse()) {
    console.log([r.id, when(r.created_at), r.source, r.store || '-', r.code || r.contact || '-', r.page || '-', r.notified_at ? 'sent' : 'NOT SENT', r.source === 'demo' ? (r.forwarded_at ? 'in toran' : 'NOT IN TORAN') : r.source === 'teder' ? (r.forwarded_at ? 'in teder' : 'NOT IN TEDER') : ''].join('  ').trim());
  }
  db.close();
} else if (main && process.argv[2] === 'purge') {
  const db = open();
  purgeAndLog(db);
  db.close();
} else if (main && process.argv[2] === 'backup') {
  const args = process.argv.slice(3);
  const at = args.indexOf('--keep');
  const keep = at >= 0 ? Number(args[at + 1]) : 14;
  const dir = args.find((a, i) => !a.startsWith('--') && args[i - 1] !== '--keep') || env.LEADS_BACKUPS || path.join(ROOT, 'private/backups');
  try {
    const r = backup(DB_PATH, dir, { keep: Number.isInteger(keep) && keep > 0 ? keep : 14 });
    console.log(`backup: ${r.file}, ${r.rows} leads, integrity ok (${r.kept} kept)`);
  } catch (e) {
    console.error(`backup failed: ${e.message}`);
    process.exit(1);
  }
} else if (main) {
  const db = open();
  const port = Number(env.PORT || 4720);
  const server = createServer(db);
  server.listen(port, '127.0.0.1', () => console.log(`leads on 127.0.0.1:${port}, saved to ${DB_PATH}${waReady() || mailReady() ? `, sent by ${[waReady() && 'WhatsApp', mailReady() && 'email'].filter(Boolean).join(' and ')}` : ' (no WhatsApp sender and no email: saving only)'}${toranWaLink('x', 'x') ? '' : " (no TORAN_DEMO_WA: a Toran demo's form shows its code with no WhatsApp button)"}`));
  const timer = setInterval(() => retry(db), 300_000);
  retry(db);
  // The privacy policy's period, once a day and at start.
  const daily = setInterval(() => purgeAndLog(db), 86_400_000);
  purgeAndLog(db);
  const stop = () => { clearInterval(timer); clearInterval(daily); server.close(() => { db.close(); process.exit(0); }); };
  process.on('SIGTERM', stop);
  process.on('SIGINT', stop);
}
