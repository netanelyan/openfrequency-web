// The frame every page shares: the head, the sticky glass header, and the footer.
import fs from 'node:fs';
import path from 'node:path';
import { FACTS, ROOT, esc, mark, tederNets, toranSoon } from './lib.mjs';
import { formCopy } from './forms.mjs';
import { LOGOS } from './logos.mjs';

// The two scripts, comments and indentation out: site.js on every page (motion, light or dark, accessibility), form.js only
// where there is a form.
const squeeze = (file) => fs.readFileSync(path.join(ROOT, file), 'utf8')
  .split('\n').filter((l) => !/^\s*\/\//.test(l)).map((l) => l.trim()).filter(Boolean).join('\n');
const siteJs = squeeze('src/site.js');
const formJs = squeeze('src/form.js');

// The two products, each behind its own mark, then the pages that are about both. While Toran is soon
// (products.toran), Teder comes first and Toran's line says it is coming.
const products = (cfg) => {
  const teder = ['/teder', 'teder', 'תדר', `מצגות ${tederNets(cfg)}`];
  return toranSoon(cfg) ? [teder, ['/toran', 'toran', 'תורן', 'יענה ללקוחות של החנות, בקרוב']] : [['/toran', 'toran', 'תורן', 'עונה ללקוחות של החנות'], teder];
};
// The pages about both products. Each price is on its product's page, so there is no price link of its own.
const LINKS = () => [['/faq', 'שאלות']];

// Where a customer manages their tools: openfrequency-accounts, which sends anyone not signed in to its login.
const TOOLS = 'https://accounts.openfrequency.co.il/';

const menuIcon = `<svg class="i open" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h16M4 16h16"/></svg><svg class="i close" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>`;

// Light or dark (the owner, 2026-11-01: "make light mode the default, and an easy option to switch to dark mode";
// 2026-11-02: "make sure that every repo starts on light mode. changing it on one subdomain changes it on all of the
// subdomains"). The page is light whatever the device prefers; this button, in the header of every page, turns dark on
// and off, and the choice is the cookie THEME_KEY, which teder., accounts. and Toran's pages read and write too: set
// for all of openfrequency.co.il, a choice made on one follows the visitor to the others. The head puts it on <html>
// (data-theme) before the page paints. A moon while light, a sun while dark; one name, pressed while dark.
export const THEME_KEY = 'of-theme';
export const THEME_COLOR = { light: '#eeeff2', dark: '#111113' };
// The cookie that keeps a choice, the same in the four repos: "dark" or "light", for a year, on every path, Lax; for
// the whole domain on openfrequency.co.il and its subdomains, for this host alone anywhere else (a test server, a
// preview), and Secure over https. Both functions go into the head as they are written (their source), so the head and
// site.js use the very functions the tests run: old-style JavaScript, a semicolon at the end of every line.
export function ofThemeCookie(value, loc) {
  var host = loc.hostname, ours = host === 'openfrequency.co.il' || /\.openfrequency\.co\.il$/.test(host);
  return 'of-theme=' + (value === 'dark' ? 'dark' : 'light') + (ours ? '; Domain=.openfrequency.co.il' : '') + '; Path=/; Max-Age=31536000; SameSite=Lax' + (loc.protocol === 'https:' ? '; Secure' : '');
}
// What the cookie says: null with no cookie, "dark" for dark, and "light" for anything else.
export function ofThemeRead(cookie) {
  var m = /(?:^|;\s*)of-theme=([^;]*)/.exec(cookie || '');
  return m ? (m[1] === 'dark' ? 'dark' : 'light') : null;
}
const inline = (fn) => String(fn).replace(/\s*\n\s*/g, '');
const themeButton = `<button class="theme" type="button" data-theme-toggle aria-pressed="false" aria-label="מצב כהה"><svg class="moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z"/></svg><svg class="sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/></svg></button>`;

function header(cfg, current) {
  const here = (href) => (href === current ? ' aria-current="page"' : '');
  const PRODUCTS = products(cfg);
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
<div class="bar-end">${themeButton}<a class="btn primary sm cta" href="${TOOLS}">לניהול הכלים</a></div>
<details class="menu"><summary aria-label="תפריט">${menuIcon}</summary><nav aria-label="ראשי">${sheet}</nav></details>
</div>
</header>`;
}

// The footer: one dark panel. Who we are, the two products, the site's pages, how to reach us, and the name set
// large along the bottom edge.
function footer(cfg, current) {
  const PRODUCTS = products(cfg);
  const wa = cfg.get('whatsapp');
  const waLink = wa
    ? `<a class="foot-wa" href="https://wa.me/${wa}">לכתוב לנו בוואטסאפ</a>`
    : cfg.banner ? `<span class="foot-wa">לכתוב לנו בוואטסאפ <mark class="ph">[${esc(FACTS.whatsapp.label)}]</mark></span>` : '';
  return `<footer class="foot">
<div class="foot-in">
<div class="foot-cols">
<div class="foot-who">
<a class="brand" href="/">${mark('openfrequency', 40)}<b>OpenFrequency</b></a>
<p>${toranSoon(cfg) ? `בנינו שני מוצרים לחנויות אונליין. תדר כותב ומעצב מצגות ${tederNets(cfg)}, ותורן, שיענה ללקוחות של החנות, נפתח בקרוב.` : `בנינו שני מוצרים לחנויות אונליין. תורן עונה ללקוחות של החנות, ותדר כותב ומעצב מצגות ${tederNets(cfg)}.`}</p>
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
<p class="foot-word" aria-hidden="true" data-word="OpenFrequency"></p>
</div>
</footer>`;
}

// In the head, before anything paints: the page is told script runs, so the parts that rise in wait for it. If
// site.js never arrives, the flag comes off after three seconds and everything simply shows.
// The accessibility switches this browser saved (the panel, in site.js) go on here too, so the page never paints
// without them, and so does the theme: dark when the cookie says so (the header's button, here or on any of our
// subdomains), light otherwise, and the browser's own bar and colour scheme with it (the two metas). Until 2026-11-02
// the choice was kept in localStorage under the same name: with no cookie yet, a choice kept there becomes the cookie,
// once, and the old key goes either way.
const early = `<script>document.documentElement.classList.add('js');setTimeout(function(){if(!window.ofSite)document.documentElement.classList.remove('js')},3000);try{var a=JSON.parse(localStorage.getItem('of-a11y'))||{};['big','contrast','links','still'].forEach(function(k){if(a[k]===true)document.documentElement.classList.add('a-'+k)})}catch(e){}${inline(ofThemeCookie)}${inline(ofThemeRead)}(function(){var t=null;try{t=ofThemeRead(document.cookie)}catch(e){}if(t===null){try{var s=localStorage.getItem('${THEME_KEY}');if(s==='dark'||s==='light'){t=s;document.cookie=ofThemeCookie(s,location)}}catch(e){}}try{localStorage.removeItem('${THEME_KEY}')}catch(e){}t=t==='dark'?'dark':'light';document.documentElement.setAttribute('data-theme',t);if(t==='dark'){document.querySelector('meta[name=theme-color]').setAttribute('content','${THEME_COLOR.dark}');document.querySelector('meta[name=color-scheme]').setAttribute('content','dark')}})()</script>`;

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

// Our customer support, on every page (the owner, 2026-11-01: "add a customer support by toran button (openfrequency
// customer support)"): our WhatsApp number, where Toran answers anyone with no demo as our support (openfrequency-toran
// src/company.ts), with a first line written for them. A plain link, so it works without script; none in a draft
// without the number.
export const SUPPORT_TEXT = 'היי, יש לי שאלה';
export function support(cfg) {
  const wa = cfg.get('whatsapp');
  if (!wa) return '';
  return `<a class="support" href="https://wa.me/${esc(wa)}?text=${encodeURIComponent(SUPPORT_TEXT)}" target="_blank" rel="noopener">${LOGOS.whatsapp}<span><b>שירות לקוחות</b><small>עונה תורן, בוואטסאפ</small></span></a>`;
}

// What a link to the page shows where it is sent (WhatsApp, Facebook, LinkedIn, X): the page's own title and line, and
// its share image from assets/og (scripts/og.mjs draws them). Every address is absolute, on the site's domain.
const OG_ALT = (cfg) => ({ openfrequency: 'OpenFrequency: תורן ותדר', toran: 'תורן, עונה ללקוחות של החנות', teder: `תדר, מצגות בעברית ${tederNets(cfg)}` });
function share(cfg, path, title, description, image) {
  const origin = `https://${cfg.get('domain') || 'openfrequency.co.il'}`;
  const url = origin + path;
  return `<link rel="canonical" href="${esc(url)}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="OpenFrequency">
<meta property="og:locale" content="he_IL">
<meta property="og:url" content="${esc(url)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:image" content="${origin}/og/${image}.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(OG_ALT(cfg)[image])}">
<meta name="twitter:card" content="summary_large_image">
`;
}

export function page(cfg, css, { path, title, description, body, noindex = false, forms = false, image = 'openfrequency' }) {
  const missing = cfg.banner && cfg.missing.size
    ? `<p class="draft" role="note">טיוטה. חסרים עוד ${cfg.missing.size} פרטים ב-site.config.json, והאתר לא ייבנה בלעדיהם.</p>`
    : '';
  return `<!doctype html>
<html lang="he" dir="rtl" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
${share(cfg, path, title, description, image)}${noindex || cfg.draft ? '<meta name="robots" content="noindex">\n' : ''}<meta name="color-scheme" content="light">
<meta name="theme-color" content="${THEME_COLOR.light}">
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
${support(cfg)}
${a11y}
<script>
${siteJs}
</script>
${forms ? `${formCopy(cfg, forms)}\n<script>\n${formJs}\n</script>` : ''}
</body>
</html>
`;
}
