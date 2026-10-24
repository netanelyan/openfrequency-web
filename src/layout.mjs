// The frame every page shares: the head, the sticky glass header, and the footer.
import fs from 'node:fs';
import path from 'node:path';
import { FACTS, ROOT, esc, mark } from './lib.mjs';
import { formCopy } from './forms.mjs';

// The two scripts, comments and indentation out: site.js on every page (motion and the question box), form.js only
// where there is a form.
const squeeze = (file) => fs.readFileSync(path.join(ROOT, file), 'utf8')
  .split('\n').filter((l) => !/^\s*\/\//.test(l)).map((l) => l.trim()).filter(Boolean).join('\n');
const siteJs = squeeze('src/site.js');
const formJs = squeeze('src/form.js');

// The two products, each behind its own mark, then the pages that are about both.
const PRODUCTS = [
  ['/toran', 'toran', 'תורן', 'עונה ללקוחות של החנות'],
  ['/teder', 'teder', 'תדר', 'מצגות לטיקטוק ולאינסטגרם'],
];
// The pages about both products. Each price is on its product's page, so there is no price link of its own.
const LINKS = () => [['/faq', 'שאלות']];

// Where a customer manages their tools: openfrequency-accounts, which sends anyone not signed in to its login.
const TOOLS = 'https://accounts.openfrequency.co.il/';

const menuIcon = `<svg class="i open" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h16M4 16h16"/></svg><svg class="i close" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>`;

function header(cfg, current) {
  const here = (href) => (href === current ? ' aria-current="page"' : '');
  const nav = [
    ...PRODUCTS.map(([href, name, label]) => `<a href="${href}"${here(href)}>${mark(name, 20)}${label}</a>`),
    ...LINKS(cfg).map(([href, label]) => `<a href="${href}"${here(href)}>${label}</a>`),
    `<a href="/join"${here('/join')}>הצטרפות</a>`,
  ].join('');
  // On a phone the menu opens on the products, each with what it does, then the rest, joining, and the tools.
  const sheet = `<div class="sheet-products">${PRODUCTS.map(([href, name, label, what]) =>
    `<a class="prod" href="${href}"${here(href)}>${mark(name, 40)}<span><b>${label}</b><small>${what}</small></span></a>`).join('')}</div>
<div class="sheet-links">${LINKS(cfg).map(([href, label]) => `<a href="${href}"${here(href)}>${label}</a>`).join('')}<a href="/join"${here('/join')}>הצטרפות</a></div>
<a class="btn primary" href="${TOOLS}">לניהול הכלים</a>`;
  return `<header class="top">
<div class="bar">
<a class="brand" href="/"${current === '/' ? ' aria-current="page"' : ''}>${mark('openfrequency', 32)}<b>OpenFrequency</b></a>
<nav class="nav" aria-label="ראשי">${nav}</nav>
<a class="btn primary sm cta" href="${TOOLS}">לניהול הכלים</a>
<details class="menu"><summary aria-label="תפריט">${menuIcon}</summary><nav aria-label="ראשי">${sheet}</nav></details>
</div>
</header>`;
}

// The footer: one dark panel. Who we are, the two products, the site's pages, how to reach us, and the name set
// large along the bottom edge.
function footer(cfg, current) {
  const wa = cfg.get('whatsapp');
  const waLink = wa
    ? `<a class="foot-wa" href="https://wa.me/${wa}">לכתוב לנו בוואטסאפ</a>`
    : cfg.banner ? `<span class="foot-wa">לכתוב לנו בוואטסאפ <mark class="ph">[${esc(FACTS.whatsapp.label)}]</mark></span>` : '';
  return `<footer class="foot">
<div class="foot-in">
<div class="foot-cols">
<div class="foot-who">
<a class="brand" href="/">${mark('openfrequency', 40)}<b>OpenFrequency</b></a>
<p>בנינו שני מוצרים לחנויות אונליין. תורן עונה ללקוחות של החנות, ותדר כותב ומעצב מצגות לטיקטוק ולאינסטגרם.</p>
${cfg.has('about.who') || cfg.banner ? `<h2 id="f-who">מי אנחנו</h2><p>${cfg.t('about.who')}</p><p class="foot-why">${cfg.t('about.why')}</p>` : ''}
</div>
<nav aria-labelledby="f-prod"><h2 id="f-prod">המוצרים</h2><ul>
${PRODUCTS.map(([href, name, label, what]) => `<li><a class="prod" href="${href}">${mark(name, 28)}<span><b>${label}</b><small>${what}</small></span></a></li>`).join('\n')}
</ul></nav>
<nav aria-labelledby="f-site"><h2 id="f-site">באתר</h2><ul>
${LINKS(cfg).reverse().map(([href, label]) => `<li><a href="${href}">${label}</a></li>`).join('')}<li><a href="/terms">תנאי שימוש</a></li><li><a href="/privacy">פרטיות</a></li><li><a href="/security">אבטחת מידע</a></li><li><a href="/accessibility">נגישות</a></li>
</ul></nav>
<div class="foot-talk"><h2>דברו איתנו</h2>${waLink}<p class="foot-cta-t">רוצים לראות את זה על החנות שלכם?</p><a class="foot-cta" href="/join">דמו חינם לחנות שלכם<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"/></svg></a></div>
</div>
<p class="foot-legal">© 2026 OpenFrequency</p>
<p class="foot-word" aria-hidden="true">OpenFrequency</p>
</div>
</footer>`;
}

// In the head, before anything paints: the page is told script runs, so the parts that rise in wait for it. If
// site.js never arrives, the flag comes off after three seconds and everything simply shows.
// The accessibility switches this browser saved (the panel, in site.js) go on here too, so the page never paints
// without them.
const early = `<script>document.documentElement.classList.add('js');setTimeout(function(){if(!window.ofSite)document.documentElement.classList.remove('js')},3000);try{var a=JSON.parse(localStorage.getItem('of-a11y'))||{};['big','contrast','links','still'].forEach(function(k){if(a[k]===true)document.documentElement.classList.add('a-'+k)})}catch(e){}</script>`;

// The accessibility panel: four switches and the way to the statement. It waits for site.js, which shows it; without
// script the page is the same page, and the statement is in the footer.
const A11Y = [['big', 'טקסט גדול יותר'], ['contrast', 'ניגודיות גבוהה'], ['links', 'קו מתחת לקישורים'], ['still', 'לעצור תנועה']];
const a11y = `<div class="a11y" data-a11y hidden>
<div class="a11y-p" id="a11y-p" role="group" aria-labelledby="a11y-h" hidden>
<h2 id="a11y-h">נגישות</h2>
${A11Y.map(([k, label]) => `<button type="button" data-a="${k}" aria-pressed="false">${label}</button>`).join('\n')}
<div class="a11y-end"><button type="button" class="a11y-reset" data-a11y-reset>לאפס</button><a href="/accessibility">הצהרת הנגישות</a></div>
</div>
<button class="a11y-btn" type="button" aria-expanded="false" aria-controls="a11y-p"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="4.5" r="1.8"/><path d="M5 8.5l7 1.5 7-1.5M12 10v4.5M12 14.5l-3 6M12 14.5l3 6"/></svg><span class="sr">נגישות</span></button>
</div>`;

export function page(cfg, css, { path, title, description, body, noindex = false, forms = false }) {
  const missing = cfg.banner && cfg.missing.size
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
${missing}${header(cfg, path)}
<main id="main">
${body}
</main>
${footer(cfg, path)}
${a11y}
<script>
${siteJs}
</script>
${forms ? `${formCopy(cfg)}\n<script>\n${formJs}\n</script>` : ''}
</body>
</html>
`;
}
