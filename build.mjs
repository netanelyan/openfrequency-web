// Builds the site into dist/.
//
//   node build.mjs           the real build: stops, and writes nothing, while any fact in site.config.json is empty
//                            or a page fails the copy lint
//   node build.mjs --draft   the same pages with each missing fact shown as a visible [placeholder], marked noindex,
//                            plus the style kit at /_kit; for looking, never for shipping
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, readConfig, lint, minifyCss } from './src/lib.mjs';
import { page } from './src/layout.mjs';
import home from './src/pages/home.mjs';
import toran from './src/pages/toran.mjs';
import { thanks, thanksTeder, tryAgain } from './src/pages/after.mjs';
import kit from './src/pages/kit.mjs';

const draft = process.argv.includes('--draft');
const OUT = path.join(ROOT, 'dist');

const PAGES = [home, toran, thanks, thanksTeder, tryAgain];
const DRAFT_PAGES = [kit];

const cfg = readConfig(draft);
const css = minifyCss(fs.readFileSync(path.join(ROOT, 'src/style.css'), 'utf8'));

// Render everything first, so one run reports every missing fact and every lint error at once.
const files = new Map();
for (const def of draft ? [...PAGES, ...DRAFT_PAGES] : PAGES) {
  const p = def(cfg);
  const file = p.file || (p.path === '/' ? 'index.html' : p.path.slice(1) + '/index.html');
  files.set(file, page(cfg, css, p));
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
for (const f of ['heebo-hebrew.woff2', 'heebo-latin.woff2', 'HEEBO-LICENSE.txt']) copy('assets/fonts/' + f, 'fonts/' + f);
copy('assets/brand/svg/openfrequency-small.svg', 'favicon.svg');
copy('assets/brand/png/openfrequency-180.png', 'apple-touch-icon.png');
copy('assets/brand/png/openfrequency-512.png', 'icon-512.png');

const kb = (n) => (n / 1024).toFixed(1) + ' KB';
console.log(`${draft ? 'Draft' : 'Built'}: ${files.size} page${files.size === 1 ? '' : 's'} in dist/ (CSS ${kb(css.length)} inlined)`);
if (draft && cfg.missing.size) console.log(`Missing, shown as placeholders:\n` + [...cfg.missing].map(([k, l]) => `  ${k} (${l})`).join('\n'));
