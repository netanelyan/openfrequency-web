// What the pages claim about us, and the form's message region: the build stops on a market claim (the leading, the
// best, number one), the home page says what the products are instead of where they rank, the strip of businesses
// says they are our own, and a form's message is a live region that is in the page from the start.
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
  const h1 = text(/<h1 id="hero-h">([\s\S]*?)<\/h1>/.exec(home)[1]);
  assert.equal(h1, 'מצגות לרשתות ותשובות ללקוחות, בעברית');
  for (const [file, html] of Object.entries(pages)) assert.doesNotMatch(text(html), /המוביל|עסקים שעובדים עם/, file);
  const strip = /<section class="clients-sec"[\s\S]*?<\/section>/.exec(home)[0];
  assert.equal(text(/<h2 id="clients-h"[^>]*>([\s\S]*?)<\/h2>/.exec(strip)[1]), 'העסקים של OpenFrequency');
  assert.match(text(strip), /אנחנו מריצים את העסקים האלה בעצמנו/);
  assert.doesNotMatch(strip, /href="https:\/\/openfrequency\.co\.il"/, 'OpenFrequency is not one of its own businesses in the strip');
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
