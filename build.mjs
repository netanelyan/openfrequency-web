// Builds the site into dist/.
//
//   node build.mjs           the real build: stops, and writes nothing, while any fact in site.config.json is empty
//                            or a page fails the copy lint
//   node build.mjs --draft   the same pages with each missing fact shown as a visible [placeholder], marked noindex,
//                            for looking, never for shipping
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, readConfig, lint, minifyCss, markNames } from './src/lib.mjs';
import { page } from './src/layout.mjs';
import home from './src/pages/home.mjs';
import toran from './src/pages/toran.mjs';
import teder from './src/pages/teder.mjs';
import faq from './src/pages/faq.mjs';
import { thanksTeder, tryAgain } from './src/pages/after.mjs';

const draft = process.argv.includes('--draft');
const OUT = path.join(ROOT, 'dist');

const PAGES = [home, toran, teder, faq, thanksTeder, tryAgain];
const DRAFT_PAGES = [];

const cfg = readConfig(draft);
const css = minifyCss(fs.readFileSync(path.join(ROOT, 'src/style.css'), 'utf8'));

// Render everything first, so one run reports every missing fact and every lint error at once.
const files = new Map();
for (const def of draft ? [...PAGES, ...DRAFT_PAGES] : PAGES) {
  const p = def(cfg);
  const file = p.file || (p.path === '/' ? 'index.html' : p.path.slice(1) + '/index.html');
  files.set(file, markNames(page(cfg, css, p)));
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
    // A demo form posted without JS is sent on to WhatsApp, to the message that confirms it (server/lead.mjs), and
    // the browser checks every step of that redirect against this.
    /data-form="demo"/.test(html) ? "form-action 'self' https://wa.me https://api.whatsapp.com" : "form-action 'self'",
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
for (const f of fs.readdirSync(path.join(ROOT, 'assets/clients'))) copy('assets/clients/' + f, 'clients/' + f);
// The page a store gets from Toran, for a made-up store, as Toran rendered it (assets/toran-example/README.md).
copy('assets/toran-example/index.html', 'toran/example/index.html');
for (const f of fs.readdirSync(path.join(ROOT, 'assets/toran-example/demo'))) copy('assets/toran-example/demo/' + f, 'toran/example/demo/' + f);

const kb = (n) => (n / 1024).toFixed(1) + ' KB';
console.log(`${draft ? 'Draft' : 'Built'}: ${files.size} page${files.size === 1 ? '' : 's'} in dist/ (CSS ${kb(css.length)} inlined)`);
if (draft && cfg.missing.size) console.log(`Missing, shown as placeholders:\n` + [...cfg.missing].map(([k, l]) => `  ${k} (${l})`).join('\n'));
