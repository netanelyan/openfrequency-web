// The site, built as `npm run build` builds it, from a copy of site.config.json with the business's details filled in
// by made-up test values (never real ones), into a folder of its own. Checks that every page builds and passes the
// lint, that the footer of every page carries the business's details and the links to the terms, privacy and contact
// pages, and that the "טיוטה לבדיקה" label follows legal.draft.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { ROOT } from '../src/lib.mjs';

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'of-site-'));
const real = JSON.parse(fs.readFileSync(path.join(ROOT, 'site.config.json'), 'utf8'));
const BUSINESS = {
  legalName: 'שם לבדיקה', businessId: '000000018', phone: '050-0000000', email: 'test@example.com',
  address: { street: 'רחוב הבדיקה 1', city: 'עיר הבדיקה' }, replyTime: 'יום עסקים',
};
const REFUND = 'משפט לבדיקה על דמי ההקמה.';

// Builds from config into its own folder; returns the result and a reader for the built pages.
function build(name, config, args = []) {
  const file = path.join(dir, name + '.json');
  const out = path.join(dir, name);
  fs.writeFileSync(file, JSON.stringify(config));
  const r = spawnSync(process.execPath, ['build.mjs', ...args], { cwd: ROOT, encoding: 'utf8', env: { ...process.env, SITE_CONFIG: file, OUT_DIR: out } });
  const read = (p) => fs.readFileSync(path.join(out, p), 'utf8');
  return { ...r, out, read };
}
const filled = (legalDraft) => ({
  ...real, business: BUSINESS, price: { ...real.price, setupRefund: REFUND }, legal: { ...real.legal, draft: legalDraft },
});
// Every page the build writes with the site's frame (the Toran example page is Toran's own, with no footer of ours).
const pages = (out) => fs.readdirSync(out, { recursive: true })
  .filter((f) => f.endsWith('.html') && !f.startsWith('toran' + path.sep + 'example'));

const full = build('full', filled(true));

test('the real build passes once the business details are filled in', () => {
  assert.equal(full.status, 0, full.stderr);
  for (const p of ['contact/index.html', 'terms/index.html', 'privacy/index.html']) assert.ok(fs.existsSync(path.join(full.out, p)), p);
});

test('the footer of every page has the business details and the legal links', () => {
  const list = pages(full.out);
  assert.ok(list.length >= 14, `only ${list.length} pages`);
  for (const p of list) {
    const foot = /<footer class="foot">[\s\S]*<\/footer>/.exec(full.read(p))?.[0];
    assert.ok(foot, `${p}: no footer`);
    for (const v of [BUSINESS.legalName, `ע.מ</small> ${BUSINESS.businessId}`, BUSINESS.phone, 'href="tel:0500000000"',
      `href="mailto:${BUSINESS.email}"`, BUSINESS.address.street, BUSINESS.address.city,
      'href="/terms"', 'href="/privacy"', 'href="/contact"']) {
      assert.ok(foot.includes(v), `${p}: the footer has no ${v}`);
    }
  }
});

test('the contact page lists every detail, the reply time, and is in the menu', () => {
  const html = full.read('contact/index.html');
  for (const v of [BUSINESS.legalName, BUSINESS.businessId, BUSINESS.phone, BUSINESS.email, BUSINESS.address.street, BUSINESS.address.city]) {
    assert.ok(html.includes(v), `no ${v}`);
  }
  assert.match(html, /אנחנו עונים תוך יום עסקים\./);
  assert.match(html, /<nav class="nav"[^>]*>[\s\S]*?href="\/contact"[\s\S]*?<\/nav>/);
  assert.match(html, /<details class="menu">[\s\S]*?href="\/contact"[\s\S]*?<\/details>/);
});

test('the terms have who we are, the prices, payment and cancellation', () => {
  const html = full.read('terms/index.html');
  assert.match(html, /<h1[^>]*>תקנון ותנאי שימוש<\/h1>/);
  for (const v of [BUSINESS.legalName, BUSINESS.businessId, '590 ₪', '1,190 ₪', '990 ₪', '790 ₪', '1,490 ₪',
    real.price.vat === 'excluded' ? 'לא כולל מע״מ' : 'כולל מע״מ', 'Grow', 'Morning', 'את פרטי הכרטיס אנחנו לא שומרים',
    'ואין תקופת התחייבות', 'הביטול נכנס לתוקף בסוף החודש ששילמתם עליו', 'על חלק מחודש לא מחזירים כסף',
    'על כל ביטול נשלח לכם אישור בכתב', REFUND, 'הדין הישראלי']) {
    assert.ok(html.includes(v), `no ${v}`);
  }
});

test('the privacy page names who gets the data and how to have it deleted', () => {
  const html = full.read('privacy/index.html');
  for (const v of ['Grow', 'Morning', 'Meta', 'השרת שלנו', 'כדי שנמחק את המידע שלכם', `${real.legal.leadMonths} חודשים`]) {
    assert.ok(html.includes(v), `no ${v}`);
  }
});

test('"טיוטה לבדיקה" shows on the legal pages only while legal.draft is true', () => {
  for (const p of ['terms/index.html', 'privacy/index.html']) assert.ok(full.read(p).includes('טיוטה לבדיקה'), p);
  const done = build('done', filled(false));
  assert.equal(done.status, 0, done.stderr);
  for (const p of pages(done.out)) assert.ok(!done.read(p).includes('טיוטה לבדיקה'), p);
});

test('an empty business detail stops the real build, and the draft still builds', () => {
  const empty = filled(true);
  empty.business = { ...BUSINESS, phone: '' };
  const r = build('empty', empty);
  assert.notEqual(r.status, 0);
  assert.match(r.stderr, /"business\.phone" is empty/);
  const d = build('draft', empty, ['--draft']);
  assert.equal(d.status, 0, d.stderr);
});
