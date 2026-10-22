// The frame every page shares: the head, the sticky glass header, the closing field with the form already open,
// and the footer's board of tiles.
import fs from 'node:fs';
import path from 'node:path';
import { FACTS, ROOT, esc, mark, credits } from './lib.mjs';
import { demoForm, formCopy } from './forms.mjs';

// The two scripts, comments and indentation out: site.js on every page (motion, the clocks, the duty log, the
// question box), form.js only where there is a form.
const squeeze = (file) => fs.readFileSync(path.join(ROOT, file), 'utf8')
  .split('\n').filter((l) => !/^\s*\/\//.test(l)).map((l) => l.trim()).filter(Boolean).join('\n');
const siteJs = squeeze('src/site.js');
const formJs = squeeze('src/form.js');

const NAV = [
  ['/toran', 'תורן'],
  ['/#teder', 'תדר'],
  ['/#price', 'מחיר'],
  ['/#faq', 'שאלות'],
];

const menuIcon = `<svg class="i open" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h16M4 16h16"/></svg><svg class="i close" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>`;

function header(current) {
  const links = NAV.map(([href, label]) => `<a href="${href}"${href === current ? ' aria-current="page"' : ''}>${label}</a>`).join('');
  return `<header class="top">
<div class="bar">
<a class="brand" href="/">${mark('openfrequency', 32)}<b>OpenFrequency</b></a>
<nav class="nav" aria-label="ראשי">${links}</nav>
<a class="btn primary sm cta" href="/#demo">לבנות דמו לחנות</a>
<details class="menu"><summary aria-label="תפריט">${menuIcon}</summary><nav aria-label="ראשי">${links}</nav></details>
</div>
</header>`;
}

// The last field on the pages that sell: the closing line on the dark ground, and beside it the first step of the
// product already open, the demo form at its true size.
export function closing(cfg, page) {
  return `<section class="close-sec" aria-labelledby="close-h">
<div class="wrap">
<div data-rise>
<h2 id="close-h">הדמו מתחיל בכתובת של החנות</h2>
<p>תוך ${cfg.t('demo.time')} נשלח לכם עמוד עם הדמו. כותבים לו בוואטסאפ כמו לקוח, ורואים מה הוא עונה.</p>
</div>
<div class="dialog" data-ui>
<p class="dialog-t">${mark('openfrequency', 28)}דמו לחנות שלכם</p>
${demoForm(cfg, page, 'demo-end')}
</div>
</div>
</section>`;
}

// Credits for the archival pictures, as their licences ask, small at the foot of every page.
function creditLine() {
  const he = {
    'photos/switchboard-1971-1400.jpg': 'חיילת במרכזייה צבאית, 1971',
    'photos/ashdod-map-1960-1000.jpg': 'מפת אשדוד, 1960',
    'photos/ashdod-port-1964-1400.jpg': 'בניית נמל אשדוד, 1964',
    'photos/ashdod-breakwater-1964-1000.jpg': 'שובר הגלים של נמל אשדוד, 1964',
  };
  const list = credits().filter((c) => he[c.file]).map((c) =>
    `<a href="${esc(c.page)}" rel="noopener">${he[c.file]}</a>, ${esc(String(c.creator).replace(/^w:/, ''))}, ${esc(c.license)}`);
  return list.length ? `<p class="credits">תמונות מוויקישיתוף: ${list.join(' · ')}.</p>` : '';
}

function footer(cfg, photos) {
  const wa = cfg.get('whatsapp');
  const waLink = wa
    ? `<a class="wa" href="https://wa.me/${wa}">בוואטסאפ</a>`
    : `<span class="wa">בוואטסאפ <mark class="ph">[${esc(FACTS.whatsapp.label)}]</mark></span>`;
  return `<footer class="foot">
<div class="board">
<div class="t-who"><p class="wa">אנחנו OpenFrequency, מ${cfg.t('city')}. בנינו את תורן ואת תדר.</p><p class="legal">© 2026 OpenFrequency</p></div>
<nav class="t-nav" aria-labelledby="f-nav"><h2 id="f-nav">באתר</h2><ul>
<li><a href="/toran">תורן</a></li><li><a href="/#teder">תדר</a></li><li><a href="/#price">מחיר</a></li>
<li><a href="/#faq">שאלות</a></li><li><a href="/privacy">פרטיות</a></li><li><a href="/terms">תנאי שימוש</a></li>
</ul></nav>
<div class="t-time" data-clock-tile hidden><h2>ב${cfg.t('city')} עכשיו</h2><p class="clock"><time data-clock></time></p></div>
<div class="t-wa"><h2>תכתבו לנו</h2>${waLink}</div>
<p class="word" aria-hidden="true">${mark('openfrequency', 84)}OpenFrequency</p>
<a class="go" href="/#demo"><span>לבנות דמו לחנות</span><svg viewBox="0 0 44 44" aria-hidden="true"><path d="M38 22H8M18 12 8 22l10 10"/></svg></a>
</div>
${photos ? creditLine() : ''}
</footer>`;
}

// In the head, before anything paints: the page is told script runs, so the parts that rise in wait for it. If
// site.js never arrives, the flag comes off after three seconds and everything simply shows.
const early = `<script>document.documentElement.classList.add('js');setTimeout(function(){if(!window.ofSite)document.documentElement.classList.remove('js')},3000)</script>`;

export function page(cfg, css, { path, title, description, body, closing: close = false, noindex = false, forms = false, photos = false }) {
  const missing = cfg.draft && cfg.missing.size
    ? `<p class="draft" role="note">טיוטה. חסרים עוד ${cfg.missing.size} פרטים ב-site.config.json, והאתר לא ייבנה בלעדיהם.</p>`
    : '';
  return `<!doctype html>
<html lang="he" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
${noindex || cfg.draft ? '<meta name="robots" content="noindex">\n' : ''}<meta name="color-scheme" content="light dark">
<meta name="theme-color" media="(prefers-color-scheme: light)" content="#eeeff2">
<meta name="theme-color" media="(prefers-color-scheme: dark)" content="#111113">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<style>${css}</style>
${early}
</head>
<body>
<a class="skip" href="#main">לדלג לתוכן</a>
${missing}${header(path)}
<main id="main">
${body}
</main>
${close ? closing(cfg, path) : ''}
${footer(cfg, photos)}
<script>
${siteJs}
</script>
${forms || close ? `${formCopy(cfg)}\n<script>\n${formJs}\n</script>` : ''}
</body>
</html>
`;
}
