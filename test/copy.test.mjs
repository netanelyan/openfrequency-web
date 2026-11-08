// What the pages claim about us, and the form's message region: the build stops on a market claim (the leading, the
// best, number one), the home page says what the products are instead of where they rank, the strip of businesses
// says they are our own, the privacy page says how a lead reaches us and what we keep for an invoice, and a form's
// message is a live region that is in the page from the start.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { lint } from '../src/lib.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = fs.mkdtempSync(path.join(os.tmpdir(), 'of-copy-'));
const pages = {};
before(() => {
  const b = spawnSync(process.execPath, ['build.mjs'], { cwd: ROOT, env: { ...process.env, SITE_OUT: out }, encoding: 'utf8' });
  assert.equal(b.status, 0, `the build failed:\n${b.stdout}\n${b.stderr}`);
  for (const f of fs.readdirSync(out, { recursive: true })) if (String(f).endsWith('.html')) pages[String(f).replace(/\\/g, '/')] = fs.readFileSync(path.join(out, f), 'utf8');
});
after(() => fs.rmSync(out, { recursive: true, force: true }));

const text = (html) => html.replace(/<span class="pn [a-z]+">([^<]*)<\/span>/g, '$1').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

test('the copy lint stops on a market claim, with or without a prefix letter, and leaves plain words alone', () => {
  const check = (words) => lint('x.html', `<p>${words}</p>`, { draft: false });
  for (const claim of ['הפלטפורמות המובילות בארץ', 'השירות המוביל', 'והמובילים בתחום', 'הכי טוב שיש', 'שהכי משתלם', 'מספר 1 בישראל', 'מספר אחת בארץ', 'הכלי הטוב ביותר', 'החברה הגדולה ביותר'])
    assert.match(check(claim).join(), /a market claim/, claim);
  for (const plain of ['הכירו את תדר', 'המוצרים החדשים ביותר', 'מספר הנייד שלכם', 'לחבר את המספר', 'צבע #1d1d1f'])
    assert.deepEqual(check(plain), [], plain);
  assert.match(lint('x.html', '<img alt="הפתרון המוביל">', { draft: false }).join(), /a market claim/, 'in an attribute too');
});

test('the home page says what the products are, not where they rank, and the strip says the businesses are ours', () => {
  const home = pages['index.html'];
  // Toran is on sale since 2026-11-08 (the owner: "switch everything on the website, for toran to be on sale").
  const h1 = text(/<h1 id="hero-h">([\s\S]*?)<\/h1>/.exec(home)[1]);
  const config = JSON.parse(fs.readFileSync(path.join(ROOT, 'site.config.json'), 'utf8'));
  assert.equal(config.products.toran, 'live');
  // OpenFrequency's headline, over both products (the owner, 2026-11-05), as it was while Toran was soon.
  assert.equal(h1, 'מצגות לרשתות ותשובות ללקוחות, בעברית');
  for (const [file, html] of Object.entries(pages)) assert.doesNotMatch(text(html), /המוביל|עסקים שעובדים עם/, file);
  const strip = /<section class="clients-sec"[\s\S]*?<\/section>/.exec(home)[0];
  assert.equal(text(/<h2 id="clients-h"[^>]*>([\s\S]*?)<\/h2>/.exec(strip)[1]), 'העסקים של OpenFrequency');
  assert.match(text(strip), /אנחנו מריצים את העסקים האלה בעצמנו/);
  assert.doesNotMatch(strip, /href="https:\/\/openfrequency\.co\.il"/, 'OpenFrequency is not one of its own businesses in the strip');
});

// The server sends each lead by email through Resend and has no Twilio sender (SERVER-FACTS.md, 2026-10-30), and
// accounts' sign-up asks for a name, the business's name and an email, nothing for an invoice.
test('the privacy page says a lead reaches us by email, and what we keep for an invoice is what sign-up asks for', () => {
  const privacy = /<main id="main">([\s\S]*)<\/main>/.exec(pages['privacy/index.html'])[1];
  const part = (id) => text(new RegExp(`<section class="legal-part" aria-labelledby="${id}">([\\s\\S]*?)</section>`).exec(privacy)[1]);
  assert.ok(part('p-form').includes('על כל טופס שנשלח מגיע אלינו מייל, דרך Resend, עם כתובת החנות ומספר הנייד, או הקוד של הבקשה.'));
  assert.doesNotMatch(part('p-form'), /Twilio|הודעה בוואטסאפ/);
  // Twilio is named once, for the demo number, and only while that number goes through it.
  assert.equal(text(privacy).split('Twilio').length - 1, 1);
  assert.ok(part('p-share').includes('Twilio , ארצות הברית: הודעות הוואטסאפ במספר הדמו, כשהמספר מחובר דרכה.'));
  assert.ok(part('p-share').includes('Resend , ארצות הברית: מיילים של כניסה לשירות, המיילים שתורן מקבל ועונה עליהם, והמייל שמגיע אלינו על כל טופס.'));
  assert.ok(part('p-customers').includes('את שם העסק, שכותבים בהרשמה. כשצריך מספר עוסק וכתובת לחשבונית, אנחנו מבקשים אותם מכם.'));
  assert.ok(!part('p-customers').includes('פרטים לחשבונית'));
  assert.match(privacy, /עודכן לאחרונה ב-8 בנובמבר 2026/, 'legal.privacyUpdated, the day the first message to a store went on WhatsApp from our number, later than legal.privacyWaUpdated');
  // The reminders to pay on WhatsApp (2026-11-04): to the number the account was paid from and the one linked to it,
  // and "הפסק" stops them, while the emails go on (openfrequency-accounts src/web/daily.js, openfrequency-toran
  // src/billing/remind.ts).
  assert.ok(part('p-customers').includes('אנחנו שולחים תזכורות לשלם על החודש הבא גם בוואטסאפ, למספר שממנו שילמתם על החשבון ולמספר שחיברתם אליו. אם תענו "הפסק", נפסיק לשלוח אותן בוואטסאפ, והן ימשיכו להגיע במייל.'));
  assert.equal(text(privacy).split('תזכורות לשלם').length - 1, 1, 'said once');
  // The social accounts' permissions: kept until they are disconnected, or until 3 days after the service stops (the
  // owner, 2026-11-03, "Yes 3 days": Teder disconnects them STOP_GRACE_DAYS after a stop).
  assert.ok(part('p-keep').includes('הרשאות של חשבונות ברשתות: עד שמנתקים אותן, או עד 3 ימים אחרי שהשירות נעצר.'));
});

test("a form's message region is in the page from the start, empty, and never hidden", () => {
  const forms = Object.entries(pages).flatMap(([file, html]) => [...html.matchAll(/<div class="form-msg"[^>]*>/g)].map((m) => [file, m[0]]));
  assert.ok(forms.length >= 3, 'the forms on /teder, /join and /toran');
  for (const [file, tag] of forms) {
    assert.match(tag, /role="status" aria-live="polite"/, file);
    assert.doesNotMatch(tag, /\shidden/, `${file}: a hidden live region is not read out when it appears`);
  }
  const js = fs.readFileSync(path.join(ROOT, 'src/form.js'), 'utf8');
  assert.doesNotMatch(js, /msg\.hidden/, 'form.js changes only what is inside the region');
});
