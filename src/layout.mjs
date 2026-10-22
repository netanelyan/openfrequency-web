// The frame every page shares: the head, the sticky glass header, the dark closing band and the footer.
import { FACTS, esc, mark } from './lib.mjs';

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

// The last thing before the footer on the pages that sell: one line, one button.
export function band(cfg) {
  return `<section class="band" aria-labelledby="band-h">
<div class="wrap narrow">
<h2 id="band-h">שולחים לנו את הכתובת של החנות, ואנחנו בונים לה דמו</h2>
<p>תוך ${cfg.t('demo.time')} נשלח לכם עמוד עם הדמו. כותבים לו בוואטסאפ כמו לקוח, ורואים מה הוא עונה.</p>
<a class="btn primary" href="/#demo">לבנות דמו לחנות</a>
</div>
</section>`;
}

function footer(cfg) {
  const wa = cfg.get('whatsapp');
  const waLink = wa
    ? `<a href="https://wa.me/${wa}">תכתבו לנו בוואטסאפ</a>`
    : `<a href="#">תכתבו לנו בוואטסאפ <mark class="ph">[${esc(FACTS.whatsapp)}]</mark></a>`;
  return `<footer class="foot">
<div class="wrap">
<p class="who">${mark('openfrequency', 28)}<span>OpenFrequency, ${cfg.t('city')}</span></p>
<nav aria-label="קישורים">
<a href="/privacy">פרטיות</a>
<a href="/terms">תנאי שימוש</a>
${waLink}
</nav>
</div>
</footer>`;
}

// Two small jobs, under half a kilobyte: the header lifts once the page scrolls under it, and the phone menu closes
// on a tap outside it, on a link, or on Escape. Without it the menu still opens and closes from its own button.
const script = `<script>
(function(){var d=document,r=d.documentElement,f=function(){r.classList.toggle('scrolled',scrollY>8)};addEventListener('scroll',f,{passive:true});f();
var m=d.querySelector('.menu');if(!m)return;d.addEventListener('click',function(e){if(m.open&&(!m.contains(e.target)||e.target.closest('nav a')))m.open=false});
d.addEventListener('keydown',function(e){if(e.key==='Escape'&&m.open){m.open=false;m.querySelector('summary').focus()}})})();
</script>`;

export function page(cfg, css, { path, title, description, body, closing = true, noindex = false }) {
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
</head>
<body>
<a class="skip" href="#main">לדלג לתוכן</a>
${missing}${header(path)}
<main id="main">
${body}
</main>
${closing ? band(cfg) : ''}
${footer(cfg)}
${script}
</body>
</html>
`;
}
