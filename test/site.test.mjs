// The switch in site.config.json, products.toran, built both ways from a copy of the config (the real one is not
// touched, and neither is dist/): with "soon" no built page offers a way to buy Toran, start it or ask for its demo,
// Toran keeps its pages with a "בקרוב" badge and a waitlist, and Teder is offered exactly as before; with "live" the
// ways in are back. The support export follows the same switch.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'of-site-'));
const config = JSON.parse(fs.readFileSync(path.join(ROOT, 'site.config.json'), 'utf8'));

const built = {};
function build(toran) {
  const cfg = path.join(dir, `${toran}.json`);
  // Sign-up closed and Teder's sample by its form: these tests are about the Toran switch alone (signup.test.mjs covers
  // sign-up open, teder-demo.test.mjs the sample asked for by WhatsApp).
  fs.writeFileSync(cfg, JSON.stringify({ ...config, signup: 'closed', products: { ...config.products, toran }, teder: { ...config.teder, demoBy: 'form' } }));
  const out = path.join(dir, toran);
  const env = { ...process.env, SITE_CONFIG: cfg, SITE_OUT: out };
  const b = spawnSync(process.execPath, ['build.mjs'], { cwd: ROOT, env, encoding: 'utf8' });
  assert.equal(b.status, 0, `the build with products.toran "${toran}" failed:\n${b.stdout}\n${b.stderr}`);
  const s = spawnSync(process.execPath, ['scripts/support-export.mjs', path.join(dir, `${toran}-support.json`)], { cwd: ROOT, env, encoding: 'utf8' });
  assert.equal(s.status, 0, `the support export with products.toran "${toran}" failed:\n${s.stderr}`);
  const pages = {};
  for (const f of fs.readdirSync(out, { recursive: true })) {
    if (String(f).endsWith('.html')) pages[String(f).replace(/\\/g, '/')] = fs.readFileSync(path.join(out, f), 'utf8');
  }
  return { pages, sitemap: fs.readFileSync(path.join(out, 'sitemap.xml'), 'utf8'), support: JSON.parse(fs.readFileSync(path.join(dir, `${toran}-support.json`), 'utf8')) };
}

before(() => {
  built.soon = build('soon');
  built.live = build('live');
});
after(() => fs.rmSync(dir, { recursive: true, force: true }));

// What a visitor can see and follow: the page without its scripts and styles.
const visible = (html) => html.replace(/<script>[\s\S]*?<\/script>/g, '').replace(/<style>[\s\S]*?<\/style>/g, '');
const hrefs = (html) => [...visible(html).matchAll(/href="([^"]*)"/g)].map((m) => m[1].replace(/&amp;/g, '&'));
const decoded = (h) => { try { return decodeURIComponent(h); } catch { return h; } };
const main = (html) => /<main id="main">([\s\S]*)<\/main>/.exec(html)[1];
const anchors = (html, href) => [...visible(html).matchAll(/<a\b[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g)].filter((m) => m[1].startsWith(href)).map((m) => `${m[1]} ${m[2].replace(/<[^>]+>/g, '').trim()}`);
const price = (n) => n.toLocaleString('he-IL');

test('with "soon", no built page has a way to buy Toran, start it or ask for its demo', () => {
  const { pages } = built.soon;
  assert.ok(Object.keys(pages).length >= 15, 'every page was built');
  for (const [file, html] of Object.entries(pages)) {
    const v = visible(html);
    for (const h of hrefs(html)) {
      assert.ok(!/^\/toran#(demo|price)/.test(h), `${file}: a link to ${h}`);
      assert.ok(!/[?&]p=toran/.test(h), `${file}: a link that ticks Toran on /join (${h})`);
      assert.ok(!/דמו של תורן|לדמו של תורן/.test(decoded(h)), `${file}: a WhatsApp link asking for Toran's demo (${decoded(h)})`);
    }
    assert.ok(!/data-form="demo"/.test(v), `${file}: Toran's demo form`);
    assert.ok(!/id="done-code"/.test(v), `${file}: the thank-you with a Toran demo's code`);
    assert.ok(!/לנסות את תורן|לבנות דמו|לכתוב לתורן|לכתוב לו בוואטסאפ/.test(v), `${file}: a button to try Toran`);
    // Toran's prices: none of its plans' monthly figures, nor its pricing section.
    for (const k of ['store', 'big']) assert.ok(!v.includes(`<span class="num">${price(config.price.plans[k].monthly)}</span>`) && !v.includes(`${price(config.price.plans[k].monthly)} ₪`), `${file}: Toran's ${k} price`);
    assert.ok(!/class="sec price-sec toran"/.test(v), `${file}: Toran's price section`);
    // The join form's Toran card is there, can't be ticked and isn't.
    const toranBox = /<input type="checkbox" name="toran"[^>]*>/.exec(v);
    if (toranBox) {
      assert.match(toranBox[0], /\sdisabled/, `${file}: Toran can be ticked`);
      assert.doesNotMatch(toranBox[0], /\schecked/, `${file}: Toran is ticked`);
    }
  }
});

test('with "soon", Toran keeps its pages with a "בקרוב" badge and its waitlist form', () => {
  const { pages, sitemap } = built.soon;
  const toran = visible(pages['toran/index.html']);
  assert.match(toran, /class="soon-bar"[\s\S]*?<span class="soon">בקרוב<\/span>/, 'the banner on top of /toran');
  assert.match(toran, /<form class="demo waitlist" id="waitlist-form" action="\/api\/lead" method="post" data-form="waitlist"/);
  assert.match(toran, /<input type="hidden" name="source" value="waitlist">/);
  assert.match(toran, /<input name="contact"[^>]*required>/);
  assert.match(toran, /<template id="done-waitlist">/);
  assert.doesNotMatch(toran, /id="price"/, 'no price on /toran');
  assert.doesNotMatch(toran, /היום תורן עונה|כבר עונה/, 'nothing says Toran answers today');
  const home = visible(pages['index.html']);
  assert.match(/<article class="door toran-door[\s\S]*?<\/article>/.exec(home)[0], /<span class="soon">בקרוב<\/span>[\s\S]*href="\/toran#waitlist"/, "Toran's door: the badge and the way to the waitlist");
  assert.ok(home.indexOf('teder-door') < home.indexOf('toran-door'), "Teder's door comes first");
  assert.match(visible(pages['join/index.html']), /<b>תורן <span class="soon">בקרוב<\/span><\/b>/);
  assert.match(visible(pages['join/index.html']), /href="\/toran#waitlist"/);
  assert.match(visible(pages['faq/index.html']), /<h2 id="faq-toran">[\s\S]*?<span class="soon">בקרוב<\/span><\/h2>/);
  assert.ok(pages['thanks/waitlist/index.html'], "the waitlist's thank-you without JS");
  for (const file of ['index.html', 'toran/index.html', 'join/index.html', 'faq/index.html']) {
    const ids = [...visible(pages[file]).replace(/<template[\s\S]*?<\/template>/g, '').matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
    assert.deepEqual(ids.filter((x, i) => ids.indexOf(x) !== i), [], `${file}: an id twice`);
  }
  assert.match(sitemap, /\/toran</, '/toran is still listed');
  // What a sent link or a search shows says Toran is coming, never that it answers now.
  for (const file of ['index.html', 'toran/index.html', 'faq/index.html', 'join/index.html']) {
    const meta = [...pages[file].matchAll(/<meta (?:name="description"|property="og:(?:title|description)") content="([^"]*)"/g)].map((m) => m[1]);
    assert.ok(meta.length >= 3, file);
    for (const m of meta) assert.doesNotMatch(m, /תורן (עונה|אחד עונה)|בוחרים בתורן/, `${file}: "${m}"`);
  }
  assert.match(pages['toran/index.html'], /<meta name="description" content="[^"]*נפתח בקרוב\.">/);
  // The first screen sells Teder (the owner, 2026-11-01: "The hero: sell Teder, which you can buy now, and give Toran
  // one line with the badge"): Teder's headline, Toran's one line with the badge, and Toran's door, in its own green
  // (spacing.test.mjs), with one button, which saves a place on the waitlist. The section on Toran as the owner's
  // assistant and the question box are gone.
  const hero = /<section class="co-hero"[\s\S]*?<\/section>/.exec(home)[0];
  assert.match(hero, /<h1 id="hero-h"><span class="hl">מצגות בעברית<\/span> לטיקטוק/);
  assert.equal((hero.match(/<p class="co-soon"><span class="soon">בקרוב<\/span> /g) || []).length, 1, "Toran's one line, with the badge");
  const toranDoor = /<article class="door toran-door"[\s\S]*?<\/article>/.exec(home)[0];
  assert.deepEqual([...toranDoor.matchAll(/<a class="btn[^"]*" href="([^"]*)">([^<]*)<\/a>/g)].map((m) => [m[1], m[2]]), [['/toran#waitlist', 'שמרו לי מקום']]);
  assert.doesNotMatch(home, /id="owner"|id="ask"|data-ask|ask-a-/, 'no section on Toran for the owner, no question box');
  assert.match(toran, /<button class="btn" type="submit">שמרו לי מקום<\/button>/, "the waitlist's button says what the door said");
});

test('with "soon", Teder is offered exactly as with "live"', () => {
  const { soon, live } = built;
  assert.equal(main(soon.pages['teder/index.html']), main(live.pages['teder/index.html']), "Teder's page");
  const door = (html) => /<article class="door teder-door[\s\S]*?<\/article>/.exec(html)[0];
  assert.equal(door(soon.pages['index.html']), door(live.pages['index.html']), "Teder's door on the home page");
  // Every link to Teder is still there, word for word (Teder comes first in the menus, so the order and the count can
  // grow). Toran's contract is built only once Toran is sold (it shows Toran's price), so it is the one page "live" has alone.
  for (const file of Object.keys(live.pages).filter((f) => f !== 'toran/contract/index.html')) {
    const now = anchors(soon.pages[file], '/teder');
    for (const a of anchors(live.pages[file], '/teder')) assert.ok(now.includes(a), `${file}: the link to Teder "${a}"`);
  }
  const join = visible(soon.pages['join/index.html']);
  assert.match(join, /<input type="checkbox" name="teder" value="1" checked>/, 'Teder is ticked on /join, and can be');
  assert.match(join, /<input name="contact" type="tel"/, "Teder's WhatsApp number");
  assert.match(join, new RegExp(`${price(config.teder.monthly)} ₪ לחודש`), "Teder's price on /join");
  assert.deepEqual(soon.support.plans.map((p) => p.key), ['teder-small', 'teder']);
  assert.deepEqual(soon.support.plans, live.support.plans.filter((p) => p.product === 'teder'));
});

// Teder is managed on its dashboard only (the owner, 2026-11-02: "managing teder through whatsapp, only through the
// dashboard"): the home page shows Teder's approvals on Teder's screen alone, with no line about approving on WhatsApp
// "בקרוב", no WhatsApp chat with covers, and no products.assistant switch to bring one back; our support, which a Teder
// customer reaches on WhatsApp, says where the posts are approved.
test('Teder is approved on its dashboard only: no WhatsApp approval on the home page, either way, and our support says where', () => {
  for (const [state, { pages, support }] of Object.entries(built)) {
    const home = visible(pages['index.html']);
    const teder = /<section class="sec owner-sec teder-owner" id="owner-teder"[\s\S]*?<\/section>/.exec(home)[0];
    assert.match(teder, /<h2 id="owner-teder-h">כל מצגת של <span class="pn teder">תדר<\/span> <span class="hl">מחכה לאישור שלכם<\/span><\/h2>/, `${state}: the dashboard's section`);
    assert.match(teder, /class="stage glass"/, `${state}: Teder's screen`);
    const checks = /<ul class="checks">[\s\S]*?<\/ul>/.exec(teder)[0];
    assert.equal((checks.match(/<li>/g) || []).length, 3, `${state}: three lines, all about the dashboard`);
    assert.doesNotMatch(teder, /וואטסאפ|class="soon"/, `${state}: nothing about WhatsApp, nothing "בקרוב"`);
    assert.doesNotMatch(home, /id="teder-chat"|class="thumbs"|\/teder\/assistant\/|מאשרים <span class="hl">בוואטסאפ/, `${state}: no WhatsApp chat about Teder`);
    assert.match(support.status, /את המצגות של תדר מאשרים, דוחים ומתקנים רק בלוח הבקרה של תדר: https:\/\/teder\.openfrequency\.co\.il\. בוואטסאפ אי אפשר לאשר מצגות, ותדר לא שולח לשם הודעות\./, `${state}: our support says where`);
  }
  assert.equal(config.products.assistant, undefined, 'no products.assistant in site.config.json');
  assert.ok(!fs.existsSync(path.join(ROOT, 'assets/teder/assistant')), 'the WhatsApp example\'s covers are gone');
});

test('with "soon", the support export says Toran opens soon and Teder is available', () => {
  const s = built.soon.support;
  assert.deepEqual(s.products, { toran: 'soon', teder: 'live' });
  assert.match(s.status, /תדר פתוח/);
  assert.match(s.status, /תורן עוד לא פתוח/);
  assert.ok(!s.pages.some((p) => p.title === 'כמה עולה תורן'), "no Toran price page");
  assert.ok(s.faq.some((f) => f.q === 'מתי תורן נפתח?'));
  assert.ok(s.faq.every((f) => f.today === null), "support.json's answers describe a running Toran, so they wait");
});

test('with "live", the ways into Toran are back', () => {
  const { pages, support } = built.live;
  const home = visible(pages['index.html']);
  // On Toran's green door its first button is white, as on Teder's violet.
  assert.match(home, /<a class="btn light" href="\/toran#demo">לנסות את תורן על החנות שלכם<\/a>/);
  assert.match(home, /<h1 id="hero-h">מצגות לרשתות ותשובות ללקוחות, <span class="hl">בעברית<\/span><\/h1>/, 'the headline about both products');
  assert.match(home, /id="owner"/, 'Toran for the owner is back');
  assert.ok(home.indexOf('toran-door') < home.indexOf('teder-door'), "Toran's door comes first");
  const toran = visible(pages['toran/index.html']);
  assert.match(toran, /<a class="btn primary hero-cta" href="#demo">לנסות את תורן על החנות שלכם<\/a>/);
  assert.match(toran, /data-form="demo"/);
  assert.match(toran, /class="sec price-sec toran" id="price"/);
  assert.match(toran, new RegExp(`<span class="num">${price(config.price.plans.store.monthly)}</span>`));
  assert.match(visible(pages['join/index.html']), /<input type="checkbox" name="toran" value="1" checked>/);
  assert.match(visible(pages['join/index.html']), /href="\/toran#price"/);
  assert.match(visible(pages['toran/example/index.html']), /href="\/toran#demo"/);
  for (const [file, html] of Object.entries(pages)) {
    const v = visible(html);
    assert.doesNotMatch(v, /data-form="waitlist"|class="soon-bar"|\/toran#waitlist|class="co-soon"/, `${file}: something of the waitlist`);
  }
  assert.ok(!pages['thanks/waitlist/index.html'], 'no waitlist thank-you');
  assert.equal(support.products, undefined);
  assert.deepEqual(support.plans.map((p) => p.key), ['toran-store', 'toran-big', 'teder-small', 'teder']);
});
