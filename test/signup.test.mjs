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
// What each way of the payment switch tells the customer, word for word: /teder's price card and the FAQ (payLine),
// /join's first step (Teder alone, and both products with Toran live), and the terms (Teder's section and the price).
const PAY = {
  manual: {
    card: 'אחרי שפותחים את החשבון, אנחנו שולחים לכם את פרטי התשלום במייל. משלמים מראש לכל חודש, ותדר נפתח כשהתשלום מגיע אלינו.',
    step: 'פותחים חשבון עם המייל שלכם ובוחרים חבילה. אנחנו שולחים לכם במייל את פרטי התשלום על החודש הראשון ועל דמי ההקמה, ותדר נפתח כשהתשלום מגיע אלינו.',
    both: 'פותחים חשבון עם המייל שלכם ובוחרים תורן, תדר או שניהם. אנחנו שולחים לכם את פרטי התשלום במייל, והמוצרים נפתחים כשהתשלום מגיע אלינו.',
    sub: 'תשלום. המנוי חודשי, ומשלמים עליו מראש. אחרי שפותחים את החשבון, אנחנו שולחים לכם את פרטי התשלום במייל, ותדר נפתח כשהתשלום מגיע אלינו. יש שתי חבילות',
    price: 'בתדר אנחנו שולחים את פרטי התשלום במייל אחרי שפותחים את החשבון, והשירות נפתח כשהתשלום מגיע אלינו, כמו שכתוב בסעיף על המנוי לתדר',
  },
  provider: {
    card: 'משלמים מראש לכל חודש, בכרטיס אשראי, בעמוד התשלום שבחשבון שלכם. תדר נפתח כשהתשלום מאושר.',
    step: 'פותחים חשבון עם המייל שלכם ובוחרים חבילה. את החודש הראשון ואת דמי ההקמה משלמים בכרטיס אשראי, בעמוד התשלום שבחשבון, ותדר נפתח כשהתשלום מאושר.',
    both: 'פותחים חשבון עם המייל שלכם, בוחרים תורן, תדר או שניהם, ומשלמים בכרטיס אשראי, בעמוד התשלום שבחשבון. המוצרים נפתחים כשהתשלום מאושר.',
    sub: 'תשלום. המנוי חודשי, ומשלמים עליו מראש, בכרטיס אשראי, בעמוד התשלום שבחשבון. תדר נפתח כשהתשלום מאושר. יש שתי חבילות',
    price: 'בתדר משלמים בכרטיס אשראי, בעמוד התשלום שבחשבון, והשירות נפתח כשהתשלום מאושר, כמו שכתוב בסעיף על המנוי לתדר',
  },
};
const NO_REFUND = 'דמי ההקמה לא מוחזרים.';
const payStep = (join) => text(/<li><h3>נרשמים ומשלמים<\/h3><p>([\s\S]*?)<\/p><\/li>/.exec(join)[1]).trim();
const priceNotes = (teder) => text(/<p class="price-notes">([\s\S]*?)<\/p>/.exec(teder)[1]).trim();
const joinTeder = (join) => text(/<li><span class="mark teder"[\s\S]*?<\/li>/.exec(join)[0]).trim();

test('the switch is a fact with two values, and the config says "open" (sign-up is the main way in)', () => {
  assert.equal(config.signup, 'open');
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
  // With sign-up closed, the terms carry legal.updated, the legal pages' own date (the privacy page changed on 2026-10-30).
  assert.match(terms, /עודכן לאחרונה ב-30 באוקטובר 2026/);
  assert.match(text(section(terms, 't-stop')), /דמי הקמה לא מוחזרים אחרי שהתחלנו לבנות את החיבור לחנות שלכם/);
  assert.doesNotMatch(support.status, /signup/);
});

test('with "open", Teder\'s first screens have sign-up, the demo and the sample as buttons, no price; the price card keeps it', () => {
  const { pages } = built.open;
  const teder = main(pages['teder/index.html']);
  const hero = /<div class="start hero-cta">[\s\S]*?<\/div>/.exec(teder)[0];
  assert.match(hero, new RegExp(`<a class="btn light" href="${SIGNUP.replace(/[?.]/g, '\\$&')}">להצטרף לתדר</a>`));
  assert.ok(!text(hero).includes(price), 'no price in the first screen');
  assert.match(hero, /<a class="btn on-color" href="#demo">מצגת לדוגמה מהחנות שלכם<\/a>/);
  assert.doesNotMatch(teder, /href="#demo">לנסות את תדר על החנות שלכם/);
  // Each plan's card has its own button, to sign-up with that plan picked; the card both share keeps the sample and
  // says how paying works while no payment provider is connected.
  const plans = [...teder.matchAll(/<article class="plan glass">[\s\S]*?<\/article>/g)].map((m) => m[0]);
  assert.equal(plans.length, 2);
  assert.ok(plans[0].includes(`href="${SIGNUP}&amp;plan=small">להצטרף בחבילה הקטנה</a>`), "the small plan's button");
  assert.ok(plans[1].includes(`href="${SIGNUP}&amp;plan=full">להצטרף בחבילה המלאה</a>`), "the full plan's button");
  const card = /<div class="price-main">[\s\S]*?<\/div>/.exec(teder)[0];
  assert.match(card, /href="#demo">לבקש מצגת לדוגמה/);
  assert.equal(priceNotes(teder), PAY.manual.card);
  assert.match(teder, /כדי להפסיק, מבטלים בחשבון, בכל זמן, והחיוב נעצר בסוף החודש שכבר שולם\./);
  // The sample form stays, at the end, as the second way.
  assert.equal(heading(teder, 'demo-h'), 'רוצים קודם לראות מצגת מהחנות שלכם?');
  assert.match(teder, /data-form="teder"[\s\S]*?<button class="btn primary" type="submit">לקבל מצגת לדוגמה<\/button>/);
  // What is left to a business that set Teder up on its own.
  assert.match(teder, /קורא רק מהמקורות שבחרתם/);
  assert.match(teder, /לחבר את טיקטוק, את אינסטגרם ואת פייסבוק, פעם אחת/);
  // The home page's door.
  const door = /<article class="door teder-door[\s\S]*?<\/article>/.exec(main(pages['index.html']))[0];
  assert.ok(door.includes(`<a class="btn light" href="${SIGNUP}">להצטרף לתדר</a><a class="btn on-color" href="/teder">לראות דמו</a><a class="btn on-color" href="/teder#demo">מצגת לדוגמה מהחנות שלכם</a>`));
  assert.ok(!text(door).includes(price), 'no price on the door');
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
  assert.match(page, /<a class="btn" href="#demo">לנסות על החנות שלכם<\/a>/);
  // The home page's door for Toran.
  assert.ok(main(pages['index.html']).includes(`href="${TORAN_SIGNUP}">להצטרף לתורן</a><a class="btn" href="/toran">לראות דמו</a><a class="btn" href="/toran#demo">לנסות על החנות שלכם</a>`));
});

test('with "open", the FAQ and the support export say how to sign up and cancel', () => {
  const { pages, support } = built.open;
  const faq = main(pages['faq/index.html']);
  assert.ok(faq.includes(`נרשמים <a href="${SIGNUP}">בעמוד ההרשמה</a>. `));
  assert.ok(text(faq).includes(`בעמוד ההרשמה . ${PAY.manual.card} הפרטים בעמוד של תדר`));
  assert.match(text(faq), /איך מבטלים את תדר\? בחשבון שלכם, בכל זמן/);
  assert.match(faq, /href="\/terms#t-teder-sub">בתנאי השימוש<\/a>/);
  assert.match(faq, /רק מהמקורות שבחרתם בהקמה/);
  assert.ok(support.status.includes(SIGNUP), 'the support status gives the sign-up address');
  assert.ok(support.faq.some((f) => f.q === 'איך מבטלים את תדר?'));
});

test('with "open", the terms carry Teder\'s self-serve section and their own date; Toran\'s stay', () => {
  const closed = main(built.closed.pages['terms/index.html']);
  const terms = main(built.open.pages['terms/index.html']);
  assert.match(terms, /עודכן לאחרונה ב-29 באוקטובר 2026/);
  assert.equal(config.legal.signupUpdated, '2026-10-29', 'the terms version accounts stores once sign-up opens (its TERMS_VERSION)');
  assert.match(terms, /<li><a href="#t-stop">הפסקה וביטול<\/a><\/li><li><a href="#t-teder-sub">המנוי לתדר<\/a><\/li>/);
  const sub = text(section(terms, 't-teder-sub'));
  for (const words of [
    PAY.manual.sub,
    'יש שתי חבילות',
    price,
    `${config.teder.small.monthly.toLocaleString('he-IL')} ₪ לחודש ל-${config.teder.small.slideshows} מצגות`,
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
    'נשאר בחשבונות שלכם בטיקטוק, באינסטגרם ובפייסבוק',
  ]) assert.ok(sub.includes(words), `the Teder section says "${words}"`);
  assert.doesNotMatch(sub, /מחזירים לכם את דמי ההקמה|14 יום/, 'the setup fee is never refunded');
  // The general sections point Teder to its own; Toran's rules are kept word for word.
  assert.match(text(section(terms, 't-stop')), /את תדר מבטלים בחשבון[\s\S]*בתורן, כדי להפסיק, כותבים לנו[\s\S]*בתורן, דמי הקמה לא מוחזרים אחרי שהתחלנו לבנות את החיבור לחנות שלכם/);
  assert.ok(text(section(terms, 't-price')).includes(PAY.manual.price));
  for (const id of ['t-answers', 't-yours', 't-teder', 't-who', 't-deal', 't-what', 't-account']) assert.equal(section(terms, id), section(closed, id), id);
  // The other legal pages keep their own date.
  assert.match(main(built.open.pages['privacy/index.html']), /עודכן לאחרונה ב-30 באוקטובר 2026/);
});

test('the terms promise only the take-downs we can do: published posts stay on the customer\'s accounts, TikTok is theirs to delete', () => {
  for (const b of [built.closed, built.open]) {
    const part = text(section(main(b.pages['terms/index.html']), 't-teder'));
    assert.ok(!part.includes('ונוריד אותה'), 'the old promise to take any post down');
    assert.ok(part.includes('מצגת שעלתה נמצאת בחשבונות שלכם בטיקטוק, באינסטגרם ובפייסבוק, ואפשר למחוק אותה שם'));
    assert.ok(part.includes('נוריד מהצד שלנו את מה שהחיבור שלנו מאפשר, למשל באינסטגרם'));
    assert.ok(part.includes('מצגת בטיקטוק מוחקים בעצמכם, בחשבון הטיקטוק שלכם'));
  }
});

test('the monthly report says it comes by email, and the two plans are 15 and 40 slideshows', () => {
  assert.deepEqual([config.teder.small.monthly, config.teder.small.setup, config.teder.small.slideshows, config.teder.small.redos], [490, 990, 15, 4]);
  assert.deepEqual([config.teder.monthly, config.teder.setup, config.teder.slideshows, config.teder.redos], [790, 1490, 40, 10]);
  for (const b of [built.closed, built.open]) {
    const teder = main(b.pages['teder/index.html']);
    assert.match(teder, /<li>דוח תוצאות שמגיע אליכם במייל בכל חודש<\/li>/);
    const plans = [...teder.matchAll(/<article class="plan glass">[\s\S]*?<\/article>/g)].map((m) => text(m[0]).trim());
    assert.match(plans[0], /^חבילה קטנה 490 ₪ לחודש לא כולל מע״מ 15 מצגות מוצעות בחודש, ועד 4 החלפות בחודש הראשון יש גם 990 ₪ דמי הקמה, פעם אחת\./);
    assert.match(plans[1], /^חבילה מלאה 790 ₪ לחודש לא כולל מע״מ 40 מצגות מוצעות בחודש, ועד 10 החלפות בחודש הראשון יש גם 1,490 ₪ דמי הקמה, פעם אחת\./);
    // TED-17: the slideshows are counted by the calendar month, said beside the price and in the FAQ.
    assert.match(text(teder), /נספרות לפי חודש קלנדרי, מה-1 בחודש ועד סופו, גם כשהתשלום שלכם יורד בתאריך אחר/);
    assert.match(text(main(b.pages['faq/index.html'])), /החודש נספר לפי לוח השנה, מה-1 בחודש ועד סופו, גם כשהתשלום שלכם יורד בתאריך אחר/);
  }
});

test('while sign-up is open, each plan card and Teder\'s price on /join say the setup fee is not refunded, as the terms do', () => {
  const plansOf = (b) => [...main(b.pages['teder/index.html']).matchAll(/<p class="plan-fee">([\s\S]*?)<\/p>/g)].map((m) => text(m[1]).trim());
  assert.deepEqual(plansOf(built.open), [
    `בחודש הראשון יש גם 990 ₪ דמי הקמה, פעם אחת. ${NO_REFUND}`,
    `בחודש הראשון יש גם 1,490 ₪ דמי הקמה, פעם אחת. ${NO_REFUND}`,
  ]);
  assert.ok(text(section(main(built.open.pages['terms/index.html']), 't-teder-sub')).includes(NO_REFUND), "the terms' own words");
  assert.ok(joinTeder(main(built.open.pages['join/index.html'])).endsWith(`דמי ההקמה, פעם אחת: 990 ₪ בחבילה הקטנה, ו-1,490 ₪ בחבילה המלאה. ${NO_REFUND} פרטים`));
  assert.ok(joinTeder(main(built.openLive.pages['join/index.html'])).includes(NO_REFUND), 'with Toran live too');
  // Closed, the terms have no Teder section, and their rule is Toran's (not refunded once we started building).
  assert.deepEqual(plansOf(built.closed), ['בחודש הראשון יש גם 990 ₪ דמי הקמה, פעם אחת.', 'בחודש הראשון יש גם 1,490 ₪ דמי הקמה, פעם אחת.']);
  assert.ok(!text(main(built.closed.pages['join/index.html'])).includes(NO_REFUND));
  // The support export's plans say it the same way.
  assert.deepEqual(built.open.support.plans.map((p) => p.text.endsWith(`פעם אחת. ${NO_REFUND}`)), [true, true]);
  assert.deepEqual(built.closed.support.plans.map((p) => p.text.endsWith('פעם אחת.')), [true, true]);
});

test('the payment switch: "manual" says we email the payment details, "provider" that it is paid by card in the account; both say when the product opens', () => {
  assert.equal(config.payment, 'manual', 'no payment provider is connected yet');
  const ways = {
    manual: [built.open, built.openLive],
    provider: [build('provider', { signup: 'open', payment: 'provider', products: { toran: 'soon' } }), build('provider-live', { signup: 'open', payment: 'provider', products: { toran: 'live' } })],
  };
  for (const [way, [soon, live]] of Object.entries(ways)) {
    const say = PAY[way];
    assert.equal(priceNotes(main(soon.pages['teder/index.html'])), say.card, `${way}: /teder's price card`);
    assert.ok(text(main(soon.pages['faq/index.html'])).includes(`בעמוד ההרשמה . ${say.card} הפרטים בעמוד של תדר`), `${way}: the FAQ`);
    assert.equal(payStep(main(soon.pages['join/index.html'])), say.step, `${way}: /join's first step`);
    assert.equal(payStep(main(live.pages['join/index.html'])), say.both, `${way}: /join's first step with Toran live`);
    const terms = main(soon.pages['terms/index.html']);
    assert.ok(text(section(terms, 't-teder-sub')).includes(say.sub), `${way}: the terms' Teder section`);
    assert.ok(text(section(terms, 't-price')).includes(say.price), `${way}: the terms' price section`);
    // Sign-up asks for an email and no phone, so the details never go by WhatsApp; and each way says only its own.
    for (const b of [soon, live]) {
      for (const [file, html] of Object.entries(b.pages).filter(([, h]) => h.includes('<main id="main">'))) {
        const t = text(main(html));
        assert.ok(!t.includes('פרטי התשלום בוואטסאפ'), `${way} ${file}: payment details by WhatsApp`);
        assert.ok(way === 'manual' ? !t.includes('בכרטיס אשראי') : !t.includes('פרטי התשלום'), `${way} ${file}: the other way's words`);
      }
    }
  }
});

test('the payment switch has two values: "online" is refused with its new name, anything else with the list', () => {
  const refused = (payment) => {
    const bad = path.join(dir, `pay-${payment}.json`);
    fs.writeFileSync(bad, JSON.stringify({ ...config, payment }));
    const b = spawnSync(process.execPath, ['build.mjs'], { cwd: ROOT, env: { ...process.env, SITE_CONFIG: bad, SITE_OUT: path.join(dir, `pay-${payment}`) }, encoding: 'utf8' });
    assert.notEqual(b.status, 0, `"${payment}" was built`);
    return b.stderr + b.stdout;
  };
  assert.match(refused('online'), /"payment": "online" is now called "provider" \(must be one of manual, provider\)/);
  assert.match(refused('card'), /"payment" must be one of manual, provider \(got "card"\)/);
});

test('Facebook is in every list of where Teder posts while teder.facebook is on, and nowhere while it is off', () => {
  const off = build('no-facebook', { signup: 'open', products: { toran: 'soon' }, teder: { ...config.teder, facebook: false } });
  // Every page of ours (the Toran example is Toran's own page, without our frame).
  for (const [file, html] of Object.entries(off.pages).filter(([, h]) => h.includes('<main id="main">'))) assert.doesNotMatch(main(html), /פייסבוק|Facebook/, `${file}: Facebook while it is off`);
  const teder = main(built.open.pages['teder/index.html']);
  assert.match(teder, /<h1 id="hero-h"><span class="hl">מצגות אוטומטיות<\/span> בעברית לטיקטוק, לאינסטגרם ולפייסבוק<\/h1>/);
  assert.match(teder, /<button type="button" role="tab" id="tab-facebook"/, "the Facebook post under its own tab");
  assert.match(text(teder), /מפרסם באינסטגרם ובפייסבוק בשעה שנקבעה/);
  assert.match(text(teder), /לחבר את טיקטוק, את אינסטגרם ואת פייסבוק, פעם אחת/);
  assert.match(text(main(built.open.pages['privacy/index.html'])), /או עמוד Facebook/);
});
