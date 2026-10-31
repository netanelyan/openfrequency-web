// The switch in site.config.json, teder.demoBy, built both ways from a copy of the config (the real one is not
// touched, and neither is dist/): "form" is the site as it was, word for word, /teder's form asking for the store's
// address and a WhatsApp number; "whatsapp" asks for the address only and is answered like Toran's demo, with a code
// to send us on WhatsApp, so the number proves itself. Only /teder and the home page's question box change; the join
// form keeps its number. The privacy page says Teder learns the number from the message too, under its own date
// (legal.privacyWaUpdated), and a "whatsapp" build without that date stops. The endpoint's side (by=whatsapp, the code, the handover to Toran) is in lead.test.mjs.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'of-teder-demo-'));
const config = JSON.parse(fs.readFileSync(path.join(ROOT, 'site.config.json'), 'utf8'));

const run = (name, cfg) => {
  const file = path.join(dir, `${name}.json`);
  fs.writeFileSync(file, JSON.stringify(cfg));
  const out = path.join(dir, name);
  return { out, b: spawnSync(process.execPath, ['build.mjs'], { cwd: ROOT, env: { ...process.env, SITE_CONFIG: file, SITE_OUT: out }, encoding: 'utf8' }) };
};
// The day the switch goes on, as it would be set then.
const WA_DATE = '2026-11-15';
function build(name, demoBy, patch = {}) {
  const legal = demoBy === 'whatsapp' ? { ...config.legal, privacyWaUpdated: WA_DATE } : config.legal;
  const { out, b } = run(name, { ...config, ...patch, legal, products: { ...config.products, ...patch.products }, teder: { ...config.teder, demoBy } });
  assert.equal(b.status, 0, `the build "${name}" failed:\n${b.stdout}\n${b.stderr}`);
  const pages = {};
  for (const f of fs.readdirSync(out, { recursive: true })) {
    if (String(f).endsWith('.html')) pages[String(f).replace(/\\/g, '/')] = fs.readFileSync(path.join(out, f), 'utf8');
  }
  return pages;
}

const built = {};
before(() => {
  // As committed (Toran soon, sign-up open), and with Toran live and sign-up closed, where Toran's own thank-you with a
  // code is on the pages too.
  built.form = build('form', 'form');
  built.wa = build('whatsapp', 'whatsapp');
  built.formLive = build('form-live', 'form', { signup: 'closed', products: { toran: 'live' } });
  built.waLive = build('whatsapp-live', 'whatsapp', { signup: 'closed', products: { toran: 'live' } });
});
after(() => fs.rmSync(dir, { recursive: true, force: true }));

const tederForm = (html) => {
  const forms = html.match(/<form class="demo"[^>]*data-form="teder"[\s\S]*?<\/form>/g) || [];
  assert.equal(forms.length, 1, "one Teder form on /teder");
  return forms[0];
};
const template = (html, id) => new RegExp(`<template id="${id}">[\\s\\S]*?</template>`).exec(html)?.[0];
const codeTemplates = (html) => (html.match(/<template id="done-code">/g) || []).length;
// The page as a visitor sees it before sending: no scripts, no styles, no templates.
const shown = (html) => html.replace(/<script>[\s\S]*?<\/script>/g, '').replace(/<style>[\s\S]*?<\/style>/g, '').replace(/<template[\s\S]*?<\/template>/g, '');

// /teder's form before the switch, as main built it (sign-up open: the button asks for the sample).
const OLD_FORM = (button) => `<form class="demo" id="demo" action="/api/lead" method="post" data-form="teder" data-wa="${config.whatsapp}" data-wa-text="היי, אשמח למצגת לדוגמה של תדר לחנות {store}">
<input type="hidden" name="source" value="teder">
<input type="hidden" name="page" value="/teder">
<div class="hp" aria-hidden="true"><label>את השדה הזה משאירים ריק<input name="company" tabindex="-1" autocomplete="off"></label></div>
<label class="f">הכתובת של החנות<input name="store" type="text" inputmode="url" autocomplete="url" dir="ltr" placeholder="shop.co.il" required></label>
<label class="f">הוואטסאפ שלכם<input name="contact" type="tel" inputmode="tel" autocomplete="tel" dir="ltr" placeholder="050-0000000" required></label>
<button class="btn primary" type="submit">${button}</button>
<p class="when">כשהמצגת לדוגמה מוכנה, נשלח אותה למספר הזה.</p>
<div class="form-msg" id="msg-demo" role="status" aria-live="polite"></div>
</form>`;

test('the switch is a fact with two values, the config says "form" (our WhatsApp number does not answer yet), and anything else stops the build', () => {
  assert.equal(config.teder.demoBy, 'form');
  const bad = run('bad', { ...config, teder: { ...config.teder, demoBy: 'sms' } });
  assert.notEqual(bad.b.status, 0);
  assert.match(bad.b.stderr + bad.b.stdout, /"teder\.demoBy" must be one of form, whatsapp \(got "sms"\)/);
  assert.ok(!fs.existsSync(bad.out), 'nothing written');
  const { demoBy, ...without } = config.teder;
  const gone = run('gone', { ...config, teder: without });
  assert.notEqual(gone.b.status, 0);
  assert.match(gone.b.stderr + gone.b.stdout, /"teder\.demoBy" is not there/);
});

test('the switch changes /teder, the question box and the privacy page only: every other page is the same either way, byte for byte', () => {
  for (const [form, wa, changes] of [[built.form, built.wa, ['index.html', 'teder/index.html', 'privacy/index.html']], [built.formLive, built.waLive, ['teder/index.html', 'privacy/index.html']]]) {
    assert.deepEqual(Object.keys(wa).sort(), Object.keys(form).sort(), 'the same pages');
    for (const file of Object.keys(form)) {
      if (changes.includes(file)) assert.notEqual(wa[file], form[file], file);
      else assert.equal(wa[file], form[file], `${file} changed with the switch`);
    }
  }
  // /join keeps its WhatsApp number for Teder either way: it is sign-up's form, not the sample's.
  assert.match(built.wa['join/index.html'], /<input name="contact" type="tel"/);
});

test('with "form", /teder is as it was: its form takes the address and a WhatsApp number, and the page has nothing else of the switch', () => {
  assert.equal(tederForm(built.form['teder/index.html']), OLD_FORM('לקבל מצגת לדוגמה'));
  assert.equal(tederForm(built.formLive['teder/index.html']), OLD_FORM('לנסות את תדר'));
  for (const pages of [built.form, built.formLive]) assert.doesNotMatch(pages['teder/index.html'], /name="by"|לשם נשלח את הלינק|לקבל בו את המצגת/);
  // With Toran soon no thank-you with a code anywhere; with Toran live, /teder carries Toran's, as before.
  assert.equal(codeTemplates(built.form['teder/index.html']), 0);
  assert.match(template(built.formLive['teder/index.html'], 'done-code'), /שהדמו יענה לו/);
  assert.match(template(built.form['index.html'], 'ask-a-demo'), /שולחים את הכתובת של החנות ומספר וואטסאפ, ואנחנו שולחים לכם אותה\./);
  // On /teder, every part of the page but the form and the thank-you templates is the same in both modes.
  const rest = (html) => html.replace(/<form class="demo"[^>]*data-form="teder"[\s\S]*?<\/form>/, '').replace(/<template id="done-code">[\s\S]*?<\/template>\n?/, '');
  assert.equal(rest(built.wa['teder/index.html']), rest(built.form['teder/index.html']));
  assert.equal(rest(built.waLive['teder/index.html']), rest(built.formLive['teder/index.html']));
});

test('with "whatsapp", /teder\'s form asks for the store\'s address only and tells the endpoint so; a post without JS goes to the endpoint, which may send it on to WhatsApp', () => {
  for (const [pages, button] of [[built.wa, 'לקבל מצגת לדוגמה'], [built.waLive, 'לנסות את תדר']]) {
    const html = pages['teder/index.html'];
    const form = tederForm(html);
    assert.match(form, /^<form class="demo" id="demo" action="\/api\/lead" method="post" data-form="teder"/);
    assert.match(form, /<input type="hidden" name="source" value="teder">\n<input type="hidden" name="page" value="\/teder">/);
    assert.match(form, /<input type="hidden" name="by" value="whatsapp">/);
    assert.match(form, /<input name="company" tabindex="-1"/, 'the honeypot');
    assert.match(form, /<label class="f wide">הכתובת של החנות<input name="store" type="text"[^>]* required><\/label>/, 'the address, the whole row');
    assert.doesNotMatch(form, /name="contact"|type="tel"|הוואטסאפ שלכם/, 'no number to type');
    assert.ok(form.includes(`<button class="btn primary" type="submit">${button}</button>`));
    assert.ok(form.includes('<p class="when">בשלב הבא שולחים לנו הודעה מוכנה בוואטסאפ, ולשם נשלח את הלינק למצגת לדוגמה כשהיא מוכנה.</p>'));
    assert.doesNotMatch(shown(html), /למספר הזה|למספר שכתבתם/, 'nothing says it goes to a typed number');
    assert.match(html, /form-action 'self' https:\/\/wa\.me/, "the page lets a plain post go on to WhatsApp");
  }
});

test('with "whatsapp", /teder\'s thank-you is the code to send on WhatsApp and the button that writes it, naming Teder; Toran\'s pages keep Toran\'s', () => {
  for (const pages of [built.wa, built.waLive]) {
    const html = pages['teder/index.html'];
    assert.equal(codeTemplates(html), 1, 'one thank-you with a code on /teder');
    const done = template(html, 'done-code');
    assert.equal(done, '<template id="done-code"><div class="done" tabindex="-1"><h3>נשאר לשלוח לנו הודעה בוואטסאפ</h3><p>הקוד של הבקשה הוא <bdi class="code" data-code></bdi>, והוא כבר כתוב בהודעה שהכפתור פותח.</p><p>צריך לשלוח אותה מהמספר שתרצו לקבל בו את המצגת לדוגמה של תדר. כשהיא מוכנה, נשלח לשם את הלינק.</p><a class="btn primary" data-wa-go href="#">לשלוח בוואטסאפ</a></div></template>');
    assert.ok(template(html, 'done-teder'), 'the thank-you for an answer with no code stays');
  }
  // Toran's own, where Toran's forms are, word for word as with "form".
  for (const file of ['toran/index.html', 'join/index.html']) assert.equal(template(built.waLive[file], 'done-code'), template(built.formLive[file], 'done-code'), file);
  assert.match(template(built.waLive['toran/index.html'], 'done-code'), /שהדמו יענה לו/);
  // form.js shows done-code for any answer with a code, which is how /teder's shows (src/form.js, done).
  assert.match(fs.readFileSync(path.join(ROOT, 'src/form.js'), 'utf8'), /copy\(body\.code \? 'done-code'/);
});

test('with "whatsapp", the question box says how to get Teder\'s sample: the address, then a message with a code on WhatsApp', () => {
  const answer = template(built.wa['index.html'], 'ask-a-demo');
  assert.match(answer, /שולחים את הכתובת של החנות, ואחר כך הודעה מוכנה עם קוד בוואטסאפ\. לשם נשלח לכם את הלינק למצגת\./);
  assert.doesNotMatch(answer, /מספר וואטסאפ/);
  assert.match(answer, /href="\/teder#demo"/);
});

test('with "whatsapp", the privacy page says Teder learns the number from the message too, Meta carries the demo number, and the page has the day of the switch', () => {
  const said = (html) => html.replace(/<[^>]+>/g, '');
  for (const pages of [built.wa, built.waLive]) {
    const html = said(pages['privacy/index.html']);
    assert.match(html, /בדמו של תורן ובמצגת לדוגמה של תדר, את מספר הנייד אנחנו מקבלים מההודעה ששולחים לנו בוואטסאפ עם הקוד מהטופס\./);
    assert.match(html, /Meta: הודעות הוואטסאפ במספר הדמו ובמספרים המחוברים של החנויות, והפרסום והנתונים ב-Instagram\./);
    assert.match(html, /שיחות במספר הדמו, על תורן ועל תדר: 6 חודשים מההודעה האחרונה\./);
    assert.match(html, /עודכן לאחרונה ב-15 בנובמבר 2026/);
  }
  // With "form", the page as it was, under the legal pages' own date.
  for (const pages of [built.form, built.formLive]) {
    const html = said(pages['privacy/index.html']);
    assert.match(html, /\. בדמו של תורן, את מספר הנייד אנחנו מקבלים מההודעה/);
    assert.match(html, /Meta: הודעות הוואטסאפ כשמספר החנות מחובר, והפרסום והנתונים ב-Instagram\./);
    assert.match(html, /שיחות במספר הדמו של תורן: 6 חודשים/);
    assert.doesNotMatch(html, /תדר, את מספר הנייד|15 בנובמבר/);
    assert.match(html, /עודכן לאחרונה ב-30 באוקטובר 2026/);
  }
  // The other legal pages keep their date either way.
  for (const file of ['terms/index.html', 'security/index.html', 'accessibility/index.html']) assert.equal(built.wa[file], built.form[file], file);
});

test('the switch cannot go out under the old date: a "whatsapp" build without legal.privacyWaUpdated stops, and nothing is written', () => {
  assert.equal(config.legal.privacyWaUpdated, '', 'empty until the switch goes on');
  const bare = run('wa-no-date', { ...config, teder: { ...config.teder, demoBy: 'whatsapp' } });
  assert.notEqual(bare.b.status, 0);
  assert.match(bare.b.stderr + bare.b.stdout, /תאריך מדיניות הפרטיות כשהמצגת לדוגמה של תדר מבקשים בקוד בוואטסאפ/);
  assert.ok(!fs.existsSync(path.join(bare.out, 'index.html')), 'no site');
});
