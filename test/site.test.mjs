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
  fs.writeFileSync(cfg, JSON.stringify({ ...config, products: { ...config.products, toran } }));
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

// What a visitor can see and follow: the page without its scripts and styles (the question box's own answers live in
// site.js, and the page's templates replace the ones about Toran while it is soon; tested below).
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
  // The question box: every answer of site.js that sends to Toran's demo or says it answers today is replaced.
  for (const k of ['toran', 'demo', 'store', 'number', 'install', 'night', 'who', 'en']) assert.match(home, new RegExp(`<template id="ask-a-${k}">`), `ask-a-${k}`);
  assert.doesNotMatch(/<template id="ask-price">[\s\S]*?<\/template>/.exec(home)[0], new RegExp(price(config.price.plans.store.monthly)), "the box doesn't give Toran's price");
});

test('with "soon", Teder is offered exactly as with "live"', () => {
  const { soon, live } = built;
  assert.equal(main(soon.pages['teder/index.html']), main(live.pages['teder/index.html']), "Teder's page");
  const door = (html) => /<article class="door teder-door[\s\S]*?<\/article>/.exec(html)[0];
  assert.equal(door(soon.pages['index.html']), door(live.pages['index.html']), "Teder's door on the home page");
  // Every link to Teder is still there, word for word (Teder comes first in the menus, and the question box may send
  // to Teder's demo where it sent to Toran's, so the order and the count can grow).
  for (const file of Object.keys(live.pages)) {
    const now = anchors(soon.pages[file], '/teder');
    for (const a of anchors(live.pages[file], '/teder')) assert.ok(now.includes(a), `${file}: the link to Teder "${a}"`);
  }
  const join = visible(soon.pages['join/index.html']);
  assert.match(join, /<input type="checkbox" name="teder" value="1" checked>/, 'Teder is ticked on /join, and can be');
  assert.match(join, /<input name="contact" type="tel"/, "Teder's WhatsApp number");
  assert.match(join, new RegExp(`${price(config.teder.monthly)} ₪ לחודש`), "Teder's price on /join");
  assert.deepEqual(soon.support.plans.map((p) => p.key), ['teder']);
  assert.deepEqual(soon.support.plans[0], live.support.plans.find((p) => p.key === 'teder'));
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
  assert.match(home, /<a class="btn primary" href="\/toran#demo">לנסות את תורן על החנות שלכם<\/a>/);
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
    assert.doesNotMatch(v, /data-form="waitlist"|class="soon-bar"|\/toran#waitlist|ask-a-/, `${file}: something of the waitlist`);
  }
  assert.ok(!pages['thanks/waitlist/index.html'], 'no waitlist thank-you');
  assert.equal(support.products, undefined);
  assert.deepEqual(support.plans.map((p) => p.key), ['toran-store', 'toran-big', 'teder']);
});
