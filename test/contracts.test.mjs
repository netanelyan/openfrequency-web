// The products' short contracts (/teder/contract and /toran/contract, src/pages/legal.mjs): what a customer accepts on
// sign-up. Each is one short page of numbered sections with its own date, every price from the config, the terms and
// the privacy policy named as part of it, and no list of sections at the top. The terms link both, and say the
// contract decides where they differ.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const config = JSON.parse(fs.readFileSync(path.join(ROOT, 'site.config.json'), 'utf8'));
const out = fs.mkdtempSync(path.join(os.tmpdir(), 'of-contracts-'));
const pages = {};
// The real config (Toran soon: no Toran contract, it would show Toran's price), and the same with Toran sold.
const build = (name, patch) => {
  const cfg = path.join(out, `${name}.json`);
  fs.writeFileSync(cfg, JSON.stringify({ ...config, ...patch, products: { ...config.products, ...(patch.products || {}) } }));
  const dir = path.join(out, name);
  const b = spawnSync(process.execPath, ['build.mjs'], { cwd: ROOT, env: { ...process.env, SITE_CONFIG: cfg, SITE_OUT: dir }, encoding: 'utf8' });
  assert.equal(b.status, 0, `the build failed:
${b.stdout}
${b.stderr}`);
  for (const p of ['teder/contract/index.html', 'toran/contract/index.html', 'terms/index.html', 'sitemap.xml']) {
    const f = path.join(dir, p);
    if (fs.existsSync(f)) pages[`${name}/${p}`] = fs.readFileSync(f, 'utf8');
  }
};
before(() => {
  build('soon', {});
  build('live', { products: { toran: 'live' } });
});
after(() => fs.rmSync(out, { recursive: true, force: true }));

const text = (html) => html.replace(/<span class="pn [a-z]+">([^<]*)<\/span>/g, '$1').replace(/<style[\s\S]*?<\/style>|<script[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const ils = (n) => `${Number(n).toLocaleString('en-US')} ₪`;

test('Teder\'s contract: numbered, dated, its prices from the config, and the terms and privacy policy part of it', () => {
  const h = pages['soon/teder/contract/index.html'];
  const t = text(h);
  assert.match(text(h.match(/<h1 id="legal-h">[\s\S]*?<\/h1>/)[0]), /^ההסכם של תדר$/);
  assert.ok(!h.includes('<nav class="legal-toc"'), 'short enough to read through: no list of sections');
  assert.match(t, /1\. מה תדר עושה/);
  assert.match(t, /10\. דין ויצירת קשר/);
  assert.match(t, /עודכן לאחרונה ב-3 בנובמבר 2026/, 'legal.contractsUpdated');
  // A new month's payment: 72 hours after the paid month ends, then Teder stops until it is paid (2026-11-03).
  assert.ok(t.includes('לפני שהחודש ששילמתם נגמר, נזכיר לכם לשלם על החודש הבא. אם התשלום הזה לא הגיע אלינו תוך 72 שעות מסוף החודש ששילמתם, תדר נעצר עד שישולם.'), 'the 72 hours');
  assert.doesNotMatch(t, /14 יום מההודעה/);
  for (const n of [config.teder.monthly, config.teder.setup, config.teder.small.monthly, config.teder.small.setup]) assert.ok(t.includes(ils(n)), ils(n));
  assert.match(t, /לא כולל מע״מ/);
  assert.match(t, /דמי ההקמה לא מוחזרים/);
  assert.match(t, /רק אחרי שאישרתם אותה/);
  assert.match(h, /href="\/terms"/);
  assert.match(h, /href="\/privacy"/);
  assert.match(t, /ההסכם של תדר קובע/);
  assert.match(t, new RegExp(config.legal.number), 'who we are, by number');
});

test('Toran\'s contract: the bot says it is a bot, the plans and the setup fee from the config, and how to stop', () => {
  const t = text(pages['live/toran/contract/index.html']);
  assert.match(t, /בתחילת כל שיחה הוא אומר ללקוח שהוא בוט/);
  for (const n of [config.price.plans.store.monthly, config.price.plans.big.monthly, config.price.setup]) assert.ok(t.includes(ils(n)), ils(n));
  assert.match(t, /סעיף 30א לחוק התקשורת/);
  assert.match(t, new RegExp(`עוד ${config.price.keepDays} יום`));
  assert.match(t, /ההסכם של תורן קובע/);
});

test('the terms link the contracts that are built, and say a contract decides; while Toran is soon it has none', () => {
  const soon = pages['soon/terms/index.html'];
  assert.match(soon, /href="\/teder\/contract"/);
  assert.ok(!soon.includes('href="/toran/contract"'), 'no link to a page that is not built');
  assert.ok(!pages['soon/toran/contract/index.html'], "Toran's contract shows its price, so it waits until Toran is sold");
  assert.match(text(soon), /הוא קובע/);
  assert.match(pages['soon/sitemap.xml'], /\/teder\/contract/);
  const live = pages['live/terms/index.html'];
  assert.match(live, /href="\/toran\/contract"/);
  assert.match(text(live), /ההסכם של המוצר קובע/);
  assert.match(pages['live/sitemap.xml'], /\/toran\/contract/);
});
