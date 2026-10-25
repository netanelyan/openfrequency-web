// Builds the site into dist/.
//
//   node build.mjs           the real build: stops, and writes nothing, while any fact in site.config.json is empty
//                            or a page fails the copy lint
//   node build.mjs --draft   the same pages, marked noindex, with each missing fact shown as a visible [placeholder]
//                            where a sentence needs it, and left out where a page can do without it
//   node build.mjs --draft --banner   (npm run dev) also the banner that counts the missing facts, and every
//                            placeholder; for us, never for the public
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { CHANNELS, ROOT, readConfig, lint, minifyCss, markNames } from './src/lib.mjs';
import { page } from './src/layout.mjs';
import home from './src/pages/home.mjs';
import toran from './src/pages/toran.mjs';
import teder from './src/pages/teder.mjs';
import faq from './src/pages/faq.mjs';
import join from './src/pages/join.mjs';
import { thanks, thanksAgain, thanksTeder, tryAgain } from './src/pages/after.mjs';
import { terms, privacy, security, accessibility } from './src/pages/legal.mjs';

const draft = process.argv.includes('--draft');
// The draft banner, and the placeholders the public draft leaves out, only for us: npm run dev.
const banner = draft && process.argv.includes('--banner');
const OUT = path.join(ROOT, 'dist');

const PAGES = [home, toran, teder, faq, join, terms, privacy, security, accessibility, thanks, thanksAgain, thanksTeder, tryAgain];
const DRAFT_PAGES = [];

const cfg = { ...readConfig(draft), banner };

// Where Toran answers. With toran.channelsFrom "config" in site.config.json, the list is toran.channels there, and
// Toran isn't asked: that's for when we know better than Toran's settings (every channel in it is live, and no
// "בקרוב" shows for it anywhere). With "toran", it comes from Toran itself (openfrequency-toran, GET /channels.json,
// set on its /settings): a channel in "demo" or "live" is one it answers in, an "off" one is shown as coming. When
// Toran doesn't answer, or answers with something else, the build uses toran.channels and says so.
const CHANNELS_URL = process.env.TORAN_CHANNELS_URL || 'https://toran.openfrequency.co.il/channels.json';
const pinned = cfg.get('toran.channelsFrom') === 'config';
const fromToran = pinned ? null : await fetch(CHANNELS_URL, { signal: AbortSignal.timeout(5000) })
  .then((r) => (r.ok ? r.json() : null))
  .then((j) => {
    const all = j && typeof j.channels === 'object' ? j.channels : null;
    if (!all || !Object.values(all).every((s) => ['off', 'demo', 'live'].includes(s))) return null;
    return CHANNELS.filter((c) => all[c] === 'demo' || all[c] === 'live');
  })
  .catch(() => null);
console.log(pinned ? `channels from site.config.json (toran.channelsFrom is config): ${(cfg.get('toran.channels') || []).join(', ') || 'none'}`
  : fromToran ? `channels from Toran: ${fromToran.join(', ') || 'none'}` : `channels from site.config.json (Toran's ${CHANNELS_URL} did not answer with its list)`);
if (fromToran) {
  const get = cfg.get;
  cfg.get = (key) => (key === 'toran.channels' ? fromToran : get(key));
}
const css = minifyCss(fs.readFileSync(path.join(ROOT, 'src/style.css'), 'utf8'));

// Render everything first, so one run reports every missing fact and every lint error at once.
const files = new Map();
const indexed = []; // the paths the sitemap lists: every page not marked noindex
for (const def of draft ? [...PAGES, ...DRAFT_PAGES] : PAGES) {
  const p = def(cfg);
  const file = p.file || (p.path === '/' ? 'index.html' : p.path.slice(1) + '/index.html');
  files.set(file, markNames(page(cfg, css, p)));
  if (!p.noindex) indexed.push(p.path);
}

// Each page carries its own Content-Security-Policy: everything comes from this site, and the only scripts and
// styles that run are the inline ones the build wrote, by hash. (Caddy adds what a <meta> can't: frame-ancestors.)
const hash = (s) => `'sha256-${crypto.createHash('sha256').update(s, 'utf8').digest('base64')}'`;
for (const [file, html] of files) {
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => hash(m[1]));
  const styles = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map((m) => hash(m[1]));
  const csp = [
    "default-src 'self'",
    `script-src ${scripts.join(' ') || "'none'"}`,
    `style-src 'self' ${styles.join(' ')}`,
    "style-src-attr 'unsafe-inline'", // the marks' size, style="--s:32px"
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'self'",
    "form-action 'self' https://wa.me https://api.whatsapp.com", // a Toran demo's plain post is sent on to WhatsApp
    "base-uri 'self'",
    "object-src 'none'",
  ].join('; ');
  files.set(file, html.replace('<meta charset="utf-8">', `<meta charset="utf-8">\n<meta http-equiv="Content-Security-Policy" content="${csp}">`));
}

const errors = [...files].flatMap(([file, html]) => lint(file, html, { draft }));
if (!draft && cfg.missing.size) {
  errors.unshift(...[...cfg.missing].map(([key, label]) => `site.config.json: "${key}" is empty (${label})`));
}
if (errors.length) {
  console.error(`Not built. ${errors.length} to fix:\n` + errors.map((e) => '  ' + e).join('\n'));
  process.exit(1);
}

fs.rmSync(OUT, { recursive: true, force: true });
for (const [file, html] of files) {
  fs.mkdirSync(path.dirname(path.join(OUT, file)), { recursive: true });
  fs.writeFileSync(path.join(OUT, file), html);
}

const copy = (from, to) => { fs.mkdirSync(path.dirname(path.join(OUT, to)), { recursive: true }); fs.copyFileSync(path.join(ROOT, from), path.join(OUT, to)); };
for (const f of ['heebo-hebrew.woff2', 'heebo-latin.woff2', 'HEEBO-LICENSE.txt', 'space-mono-700-latin.woff2', 'SPACE-MONO-LICENSE.txt']) copy('assets/fonts/' + f, 'fonts/' + f);
copy('assets/brand/svg/openfrequency-small.svg', 'favicon.svg');
copy('assets/brand/png/openfrequency-180.png', 'apple-touch-icon.png');
copy('assets/brand/png/openfrequency-512.png', 'icon-512.png');
for (const f of fs.readdirSync(path.join(ROOT, 'assets/teder/showcase'), { recursive: true })) if (f.endsWith('.jpg')) copy('assets/teder/showcase/' + f, 'teder/showcase/' + f);
for (const f of fs.readdirSync(path.join(ROOT, 'assets/teder/assistant'))) copy('assets/teder/assistant/' + f, 'teder/assistant/' + f);
for (const f of fs.readdirSync(path.join(ROOT, 'assets/clients'))) copy('assets/clients/' + f, 'clients/' + f);
// The page a store gets from Toran, for a made-up store, as Toran rendered it (assets/toran-example/README.md). Its
// price card is written here from site.config.json (the Store plan, VAT, the setup fee), so the example never shows
// a price the site no longer has; a page whose card can't be found stops the build rather than ship an old one.
{
  const html = fs.readFileSync(path.join(ROOT, 'assets/toran-example/index.html'), 'utf8');
  const card = /<p class="figure">[\s\S]*?<\/p>\s*<p class="price-notes">[\s\S]*?<\/p>/;
  if (!card.test(html)) throw new Error('assets/toran-example/index.html: no price card to write the price into');
  const n = (key) => cfg.get(key);
  const fee = n('price.setup');
  const vat = n('price.vat') === 'included' ? 'כולל מע״מ' : 'לא כולל מע״מ';
  const priced = ['price.plans.store.monthly', 'price.plans.store.conversations', 'price.setup', 'price.vat'].every((k) => cfg.has(k));
  const out = priced
    ? html.replace(card, `<p class="figure"><span class="num">${n('price.plans.store.monthly').toLocaleString('he-IL')}</span><span class="cur">₪</span><span class="per">לחודש</span></p>\n        <p class="price-notes">${vat}, עד ${n('price.plans.store.conversations').toLocaleString('he-IL')} שיחות בחודש. ${fee > 0 ? `בחודש הראשון יש גם ${fee.toLocaleString('he-IL')} ₪ דמי הקמה, פעם אחת.` : 'אין דמי הקמה.'}</p>`)
    : html.replace(card, '');
  fs.mkdirSync(path.join(OUT, 'toran/example'), { recursive: true });
  fs.writeFileSync(path.join(OUT, 'toran/example/index.html'), out);
}
for (const f of fs.readdirSync(path.join(ROOT, 'assets/toran-example/demo'))) copy('assets/toran-example/demo/' + f, 'toran/example/demo/' + f);

// robots.txt and sitemap.xml. /s/ is where Toran's pitch pages will live: each is for one store, never for search.
// A draft is noindex on every page, and its robots.txt keeps every crawler out too.
{
  const origin = `https://${cfg.get('domain') || 'openfrequency.co.il'}`;
  fs.writeFileSync(path.join(OUT, 'robots.txt'), draft
    ? 'User-agent: *\nDisallow: /\n'
    : `User-agent: *\nDisallow: /s/\nDisallow: /api/\n\nSitemap: ${origin}/sitemap.xml\n`);
  const urls = indexed.map((p) => `  <url><loc>${origin}${p}</loc></url>`).join('\n');
  fs.writeFileSync(path.join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
}

const kb = (n) => (n / 1024).toFixed(1) + ' KB';
console.log(`${draft ? 'Draft' : 'Built'}: ${files.size} page${files.size === 1 ? '' : 's'} in dist/ (CSS ${kb(css.length)} inlined)`);
if (draft && cfg.missing.size) console.log(`Missing, shown as placeholders:\n` + [...cfg.missing].map(([k, l]) => `  ${k} (${l})`).join('\n'));
