// The support export published with the site: the real build writes dist/support.json, served at
// https://<domain>/support.json, and Toran reads it there once a day (openfrequency-toran, docs/company.md,
// TORAN_SUPPORT_EXPORT_URL). Built from copies of the config (the real one is not touched, and neither is dist/), as
// committed and with Toran live, where support.json's own answers are in it: each time the file is what
// `npm run support` writes, apart from the moment it was made, and in the shape Toran's sync takes; it holds only what
// the pages already say; a draft has none.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'of-support-'));
const config = JSON.parse(fs.readFileSync(path.join(ROOT, 'site.config.json'), 'utf8'));

function build(name, patch, draft = false) {
  const cfg = path.join(dir, `${name}.json`);
  fs.writeFileSync(cfg, JSON.stringify({ ...config, ...patch, products: { ...config.products, ...patch.products }, teder: { ...config.teder, ...patch.teder } }));
  const out = path.join(dir, name);
  const env = { ...process.env, SITE_CONFIG: cfg, SITE_OUT: out };
  const b = spawnSync(process.execPath, ['build.mjs', ...(draft ? ['--draft'] : [])], { cwd: ROOT, env, encoding: 'utf8' });
  assert.equal(b.status, 0, `the build "${name}" failed:\n${b.stdout}\n${b.stderr}`);
  if (draft) return { out };
  const file = path.join(dir, `${name}-export.json`);
  const s = spawnSync(process.execPath, ['scripts/support-export.mjs', file], { cwd: ROOT, env, encoding: 'utf8' });
  assert.equal(s.status, 0, `the support export "${name}" failed:\n${s.stderr}`);
  const html = fs.readdirSync(out, { recursive: true }).filter((f) => String(f).endsWith('.html')).map((f) => fs.readFileSync(path.join(out, f), 'utf8')).join('\n');
  return { out, stdout: b.stdout, html, published: fs.readFileSync(path.join(out, 'support.json'), 'utf8'), exported: JSON.parse(fs.readFileSync(file, 'utf8')) };
}

const built = {};
before(() => {
  built.committed = build('committed', {});
  built.live = build('live', { signup: 'closed', products: { toran: 'live' }, teder: { demoBy: 'form' } });
  built.draft = build('draft', {}, true);
});
after(() => fs.rmSync(dir, { recursive: true, force: true }));

const without = (d, key) => Object.fromEntries(Object.entries(d).filter(([k]) => k !== key));

/**
 * The checks Toran makes before it writes anything (openfrequency-toran, src/company.ts readExport), the same for
 * `npm run company -- sync <file>` and for its daily read of /support.json: a file that fails them is never synced.
 */
function toranTakes(d) {
  assert.ok(d && typeof d === 'object' && !Array.isArray(d), 'an object');
  assert.match(String(d.domain), /^[a-z0-9.-]+\.[a-z]{2,}$/, 'domain');
  assert.match(String(d.url), /^https:\/\//, 'url');
  assert.ok(String(d.status || '').trim(), 'status');
  assert.ok(Array.isArray(d.plans) && d.plans.length && d.plans.every((p) => p.key && p.title && Number.isFinite(p.monthly) && p.text), 'plans');
  assert.ok(Array.isArray(d.faq) && d.faq.every((f) => f.q && f.a), 'faq');
  assert.ok(Array.isArray(d.pages) && d.pages.length && d.pages.every((p) => p.kind && p.title && p.url && p.text), 'pages');
}

test('the real build publishes support.json: the export of `npm run support`, apart from when it was made, in the shape Toran syncs', () => {
  for (const [name, b] of Object.entries({ committed: built.committed, live: built.live })) {
    const d = JSON.parse(b.published);
    assert.ok(b.published.endsWith('}\n'), `${name}: one JSON document`);
    assert.deepEqual(without(d, 'generatedAt'), without(b.exported, 'generatedAt'), `${name}: the build's file and the export say the same`);
    assert.ok(!Number.isNaN(Date.parse(d.generatedAt)), `${name}: generatedAt is a time`);
    toranTakes(d);
    assert.ok(d.faq.length >= 10 && d.pages.length >= 6, `${name}: /faq's questions and the pages are in it`);
    assert.equal(d.domain, config.domain);
    assert.equal(d.url, `https://${config.domain}/`);
    assert.match(b.stdout, /and support\.json for Toran/, `${name}: the build says it wrote it`);
  }
  // With Toran soon the export says so; with Toran live support.json's answers are in it, as Toran reads them.
  assert.deepEqual(JSON.parse(built.committed.published).products, config.products.toran === 'soon' ? { toran: 'soon', teder: 'live' } : undefined);
  const live = JSON.parse(built.live.published);
  assert.equal(live.products, undefined);
  const answers = JSON.parse(fs.readFileSync(path.join(ROOT, 'support.json'), 'utf8')).answers || [];
  assert.equal(live.faq.filter((f) => f.today != null).length, answers.length, "every one of support.json's answers is on its question");
});

test('support.json holds only what the site already says: its pages, our number and email as the pages show them, and the status', () => {
  for (const b of [built.committed, built.live]) {
    const d = JSON.parse(b.published);
    assert.deepEqual(Object.keys(d).filter((k) => k !== 'products'), ['status', 'domain', 'url', 'name', 'contact', 'tone', 'plans', 'faq', 'pages', 'generatedAt']);
    assert.deepEqual(Object.keys(d.contact), ['whatsapp', 'email']);
    assert.ok(b.html.includes(`wa.me/${d.contact.whatsapp}`), 'our WhatsApp number is on the pages');
    assert.ok(b.html.includes(d.contact.email), 'our email is on the pages');
    for (const p of d.pages) assert.ok(p.url.startsWith(`https://${config.domain}`), `${p.title}: a page of the site (${p.url})`);
    for (const f of d.faq) assert.equal(f.url, `https://${config.domain}/faq`);
  }
});

test('a draft build has no support.json: its placeholders are never what our support answers from', () => {
  assert.ok(fs.existsSync(path.join(built.draft.out, 'index.html')), 'the draft was built');
  assert.ok(!fs.existsSync(path.join(built.draft.out, 'support.json')));
});
