// The sign-up switch in site.config.json, signup, built both ways from a copy of the config (the real one is not
// touched, and neither is dist/): "closed" is the site as it was, with Teder's ways in the free sample slideshow and
// nothing linking to accounts' sign-up; "open" sends Teder's main buttons to sign-up with the price beside them, keeps
// the sample as the second way, and shows the self-serve terms with their own date.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'of-signup-'));
const config = JSON.parse(fs.readFileSync(path.join(ROOT, 'site.config.json'), 'utf8'));
const SIGNUP = 'https://accounts.openfrequency.co.il/signup?p=teder';

function build(name, patch) {
  const cfg = path.join(dir, `${name}.json`);
  fs.writeFileSync(cfg, JSON.stringify({ ...config, ...patch, products: { ...config.products, ...patch.products } }));
  const out = path.join(dir, name);
  const env = { ...process.env, SITE_CONFIG: cfg, SITE_OUT: out };
  const b = spawnSync(process.execPath, ['build.mjs'], { cwd: ROOT, env, encoding: 'utf8' });
  assert.equal(b.status, 0, `the build "${name}" failed:\n${b.stdout}\n${b.stderr}`);
  const s = spawnSync(process.execPath, ['scripts/support-export.mjs', path.join(dir, `${name}-support.json`)], { cwd: ROOT, env, encoding: 'utf8' });
  assert.equal(s.status, 0, `the support export "${name}" failed:\n${s.stderr}`);
  const pages = {};
  for (const f of fs.readdirSync(out, { recursive: true })) {
    if (String(f).endsWith('.html')) pages[String(f).replace(/\\/g, '/')] = fs.readFileSync(path.join(out, f), 'utf8');
  }
  return { pages, support: JSON.parse(fs.readFileSync(path.join(dir, `${name}-support.json`), 'utf8')) };
}

const built = {};
before(() => {
  built.closed = build('closed', { signup: 'closed', products: { toran: 'soon' } });
  built.open = build('open', { signup: 'open', products: { toran: 'soon' } });
  built.openLive = build('open-live', { signup: 'open', products: { toran: 'live' } });
});
after(() => fs.rmSync(dir, { recursive: true, force: true }));

const visible = (html) => html.replace(/<script>[\s\S]*?<\/script>/g, '').replace(/<style>[\s\S]*?<\/style>/g, '');
const main = (html) => visible(/<main id="main">([\s\S]*)<\/main>/.exec(html)[1]);
// A product's name in running text is set as <span class="pn">, with a prefix letter outside it (lib.mjs markNames).
const text = (html) => html.replace(/<span class="pn [a-z]+">([^<]*)<\/span>/g, '$1').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ');
const price = `${config.teder.monthly.toLocaleString('he-IL')} ₪ לחודש`;
const heading = (html, id) => text(new RegExp(`<h2 id="${id}">([\\s\\S]*?)</h2>`).exec(html)[1]).trim();
const section = (html, id) => new RegExp(`<section class="legal-part" aria-labelledby="${id}">[\\s\\S]*?</section>`).exec(html)?.[0];

test('the switch is a fact with two values, and the config says "closed" for now', () => {
  assert.equal(config.signup, 'closed');
  const bad = path.join(dir, 'bad.json');
  fs.writeFileSync(bad, JSON.stringify({ ...config, signup: 'maybe' }));
  const b = spawnSync(process.execPath, ['build.mjs'], { cwd: ROOT, env: { ...process.env, SITE_CONFIG: bad, SITE_OUT: path.join(dir, 'bad') }, encoding: 'utf8' });
  assert.notEqual(b.status, 0);
  assert.match(b.stderr + b.stdout, /"signup" must be one of open, closed/);
});

test('with "closed", nothing links to sign-up and Teder is offered by its sample, as before', () => {
  const { pages, support } = built.closed;
  for (const [file, html] of Object.entries(pages)) assert.doesNotMatch(visible(html), /accounts\.openfrequency\.co\.il\/signup/, `${file}: a link to sign-up`);
  const teder = main(pages['teder/index.html']);
  assert.match(teder, /<a class="btn primary hero-cta" href="#demo">לנסות את תדר על החנות שלכם<\/a>/);
  assert.match(teder, /<a class="btn primary" href="#demo">לנסות את תדר על החנות שלכם<\/a>/, "the price's button");
  assert.equal(heading(teder, 'demo-h'), 'לנסות את תדר על החנות שלכם');
  assert.match(teder, /כדי להפסיק, <a href="https:\/\/wa\.me\/\d+">כותבים לנו<\/a>/);
  assert.match(main(pages['index.html']), /<a class="btn light" href="\/teder#demo">לנסות את תדר על החנות שלכם<\/a>/);
  const join = main(pages['join/index.html']);
  assert.match(join, /<button class="btn primary" type="submit">להצטרף<\/button>/);
  assert.match(join, /מה קורה אחרי הטופס/);
  assert.doesNotMatch(join, /id="sample"/);
  assert.ok(!text(main(pages['faq/index.html'])).includes('איך מבטלים את תדר'));
  const terms = main(pages['terms/index.html']);
  assert.doesNotMatch(terms, /t-teder-sub/);
  assert.match(terms, /עודכן לאחרונה ב-24 באוקטובר 2026/);
  assert.match(text(section(terms, 't-stop')), /דמי הקמה לא מוחזרים אחרי שהתחלנו לבנות את החיבור לחנות שלכם/);
  assert.doesNotMatch(support.status, /signup/);
});

test('with "open", Teder\'s main buttons go to sign-up with the price beside them, and the sample is the second way', () => {
  const { pages } = built.open;
  const teder = main(pages['teder/index.html']);
  const hero = /<div class="start hero-cta">[\s\S]*?<\/div>/.exec(teder)[0];
  assert.match(hero, new RegExp(`<a class="btn primary" href="${SIGNUP.replace(/[?.]/g, '\\$&')}">להצטרף לתדר</a>`));
  assert.ok(text(hero).includes(price), 'the price beside the hero button');
  assert.match(hero, /רוצים קודם לראות מצגת מהחנות שלכם\? <a href="#demo">לבקש מצגת לדוגמה<\/a>/);
  assert.doesNotMatch(teder, /href="#demo">לנסות את תדר על החנות שלכם/);
  const card = /<div class="price-main">[\s\S]*?<\/div>/.exec(teder)[0];
  assert.ok(card.includes(`href="${SIGNUP}"`), "the price card's button");
  assert.match(card, /href="#demo">לבקש מצגת לדוגמה/);
  assert.match(teder, /כדי להפסיק, מבטלים בחשבון, בכל זמן, והחיוב נעצר בסוף החודש שכבר שולם\./);
  // The sample form stays, at the end, as the second way.
  assert.equal(heading(teder, 'demo-h'), 'רוצים קודם לראות מצגת מהחנות שלכם?');
  assert.match(teder, /data-form="teder"[\s\S]*?<button class="btn primary" type="submit">לקבל מצגת לדוגמה<\/button>/);
  // What is left to a business that set Teder up on its own.
  assert.match(teder, /קורא רק מהמקורות שבחרתם/);
  assert.match(teder, /לחבר את טיקטוק ואת אינסטגרם, פעם אחת/);
  // The home page's door.
  const door = /<article class="door teder-door[\s\S]*?<\/article>/.exec(main(pages['index.html']))[0];
  assert.ok(door.includes(`<a class="btn light" href="${SIGNUP}">להצטרף לתדר</a><a class="btn on-color" href="/teder">עוד על תדר</a>`));
  assert.ok(text(door).includes(price));
  assert.match(door, /href="\/teder#demo">לבקש מצגת לדוגמה/);
});

test('with "open", /join starts with sign-up and its price, then the sample form, and its steps are sign-up\'s', () => {
  const { pages } = built.open;
  const join = main(pages['join/index.html']);
  const signup = join.indexOf(`href="${SIGNUP}"`), form = join.indexOf('data-form="join"');
  assert.ok(signup > 0 && form > signup, 'the sign-up button comes before the form');
  assert.ok(text(join.slice(signup, form)).includes(price), 'the price beside it');
  assert.match(join, /<section class="sec" id="sample" aria-labelledby="sample-h">\n<div class="wrap narrow">\n<h2 id="sample-h">רוצים קודם לראות מצגת מהחנות שלכם\?<\/h2>/);
  assert.match(join, /<button class="btn primary" type="submit">לקבל מצגת לדוגמה<\/button>/);
  assert.match(join, /<input type="checkbox" name="teder" value="1" checked>/, 'Teder still ticked on the sample form');
  assert.match(join, /מה קורה אחרי ההרשמה[\s\S]*נרשמים ומשלמים[\s\S]*בוחרים מקורות[\s\S]*עוברים על המצגות לדוגמה[\s\S]*מעלים לאוויר/);
  assert.ok(text(join).includes('איך מבטלים את תדר?'));
  assert.match(pages['join/index.html'], /<meta name="description" content="פותחים חשבון בתדר/);
  // The menu still leads to /join, which holds both ways.
  assert.match(pages['index.html'], /<a href="\/join">הצטרפות<\/a>/);
});

test('with "open" and Toran live, sign-up is the first way in for both products, on /join, /toran and the home page', () => {
  const { pages } = built.openLive;
  const TORAN_SIGNUP = SIGNUP.replace('p=teder', 'p=toran');
  const join = main(pages['join/index.html']);
  const form = join.indexOf('data-form="join"'), toran = join.indexOf(`href="${TORAN_SIGNUP}"`), teder = join.indexOf(`href="${SIGNUP}"`);
  assert.ok(toran > 0 && teder > 0 && form > toran && form > teder, 'both sign-up buttons come before the demo form');
  assert.match(join, /<input type="checkbox" name="toran" value="1" checked>/);
  assert.match(join, /<button class="btn primary" type="submit">לקבל דמו<\/button>/);
  assert.match(join, /מה קורה אחרי ההרשמה[\s\S]*נרשמים ומשלמים/);
  // Toran's page: the sign-up in the first screen and on the price card, the demo as the second way.
  const page = main(pages['toran/index.html']);
  assert.equal(page.split(`href="${TORAN_SIGNUP}"`).length - 1, 2);
  assert.match(page, /href="#demo">לנסות את תורן על החנות שלכם/);
  // The home page's door for Toran.
  assert.ok(main(pages['index.html']).includes(`href="${TORAN_SIGNUP}">להצטרף לתורן</a>`));
});

test('with "open", the FAQ and the support export say how to sign up and cancel', () => {
  const { pages, support } = built.open;
  const faq = main(pages['faq/index.html']);
  assert.ok(faq.includes(`ונרשמים <a href="${SIGNUP}">בעמוד ההרשמה</a>`));
  assert.match(text(faq), /איך מבטלים את תדר\? בחשבון שלכם, בכל זמן/);
  assert.match(faq, /href="\/terms#t-teder-sub">בתנאי השימוש<\/a>/);
  assert.match(faq, /רק מהמקורות שבחרתם בהקמה/);
  assert.ok(support.status.includes(SIGNUP), 'the support status gives the sign-up address');
  assert.ok(support.faq.some((f) => f.q === 'איך מבטלים את תדר?'));
});

test('with "open", the terms carry Teder\'s self-serve section and their own date; Toran\'s stay', () => {
  const closed = main(built.closed.pages['terms/index.html']);
  const terms = main(built.open.pages['terms/index.html']);
  assert.match(terms, /עודכן לאחרונה ב-27 באוקטובר 2026/);
  assert.equal(config.legal.signupUpdated, '2026-10-27', 'the terms version accounts stores once sign-up opens');
  assert.match(terms, /<li><a href="#t-stop">הפסקה וביטול<\/a><\/li><li><a href="#t-teder-sub">המנוי לתדר<\/a><\/li>/);
  const sub = text(section(terms, 't-teder-sub'));
  for (const words of [
    'משלמים עליו מראש, דרך החשבון',
    price,
    'המנוי מתחדש בכל חודש, עד שמבטלים אותו',
    'משלמים אותם פעם אחת, עם החודש הראשון',
    'הם מכסים את פתיחת החשבון ואת המצגות הראשונות לדוגמה',
    'דמי ההקמה לא מוחזרים',
    'מבטלים בחשבון, בכל זמן',
    'תדר ממשיך לעבוד עד סוף התקופה ששילמתם, ואחרי זה לא מחייבים אתכם יותר',
    'על התקופה שכבר שולמה לא מחזירים כסף',
    'חוק הגנת הצרכן',
    'עסקת מכר מרחוק',
    'את החשבון ואת המידע שבו אפשר למחוק בעצמכם',
    'העותקים שלנו של המצגות',
    'נשאר בחשבונות שלכם בטיקטוק ובאינסטגרם',
  ]) assert.ok(sub.includes(words), `the Teder section says "${words}"`);
  assert.doesNotMatch(sub, /מחזירים לכם את דמי ההקמה|14 יום/, 'the setup fee is never refunded');
  // The general sections point Teder to its own; Toran's rules are kept word for word.
  assert.match(text(section(terms, 't-stop')), /את תדר מבטלים בחשבון[\s\S]*בתורן, כדי להפסיק, כותבים לנו[\s\S]*בתורן, דמי הקמה לא מוחזרים אחרי שהתחלנו לבנות את החיבור לחנות שלכם/);
  assert.match(text(section(terms, 't-price')), /בתדר משלמים דרך החשבון/);
  for (const id of ['t-answers', 't-yours', 't-teder', 't-who', 't-deal', 't-what', 't-account']) assert.equal(section(terms, id), section(closed, id), id);
  // The other legal pages keep their own date.
  assert.match(main(built.open.pages['privacy/index.html']), /עודכן לאחרונה ב-24 באוקטובר 2026/);
});

test('the terms promise only the take-downs we can do: published posts stay on the customer\'s accounts, TikTok is theirs to delete', () => {
  for (const b of [built.closed, built.open]) {
    const part = text(section(main(b.pages['terms/index.html']), 't-teder'));
    assert.ok(!part.includes('ונוריד אותה'), 'the old promise to take any post down');
    assert.ok(part.includes('מצגת שעלתה נמצאת בחשבונות שלכם בטיקטוק ובאינסטגרם, ואפשר למחוק אותה שם'));
    assert.ok(part.includes('נוריד מהצד שלנו את מה שהחיבור שלנו מאפשר, למשל באינסטגרם'));
    assert.ok(part.includes('מצגת בטיקטוק מוחקים בעצמכם, בחשבון הטיקטוק שלכם'));
  }
});

test('the monthly report says it comes by email, and the plan stays at its 40 slideshows', () => {
  for (const b of [built.closed, built.open]) {
    const teder = main(b.pages['teder/index.html']);
    assert.match(teder, /<li>דוח תוצאות שמגיע אליכם במייל בכל חודש<\/li>/);
    assert.match(teder, new RegExp(`<li>${config.teder.slideshows} מצגות מוצעות בחודש`));
    assert.equal(config.teder.slideshows, 40);
  }
});
