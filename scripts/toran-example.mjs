// Re-renders /toran/example from openfrequency-toran's current pitch page (src/pitch/page.ts pitchPage), with the
// made-up store's data as Toran rendered it on 2026-10-23 (the products, the pages read, and the sample chat the real
// agent answered, word for word), then the edits assets/toran-example/README.md lists.
//   node scripts/toran-example.mjs [toran checkout] [out.html]
// Defaults: ../openfrequency-toran beside this checkout, and assets/toran-example/index.html. Node 24 or later, which
// runs Toran's TypeScript as it is; Toran's node_modules must be installed. Nothing is fetched and no model is called.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const toranRoot = path.resolve(process.argv[2] || path.join(ROOT, '..', 'openfrequency-toran'));
const out = path.resolve(process.argv[3] || path.join(ROOT, 'assets/toran-example/index.html'));
const imp = (p) => import(pathToFileURL(path.join(toranRoot, p)).href);
const { pitchPage, themeCss } = await imp('src/pitch/page.ts');
const { brandCss } = await imp('src/brand.ts');

const img = (f) => `/toran/example/demo/${f}.svg`;
// The strip's two rows as the old page had them (r0 the even products, r1 the odd ones), interleaved back.
const r0 = [['sandy-mug', 'ספל חול 350 מ"ל', 89], ['olive-bowl', 'קערת זית גדולה', 165], ['oval-platter', 'צלחת הגשה אובלית', 149], ['ball-vase', 'אגרטל כדור קטן', 95], ['candle-holders', 'מחזיק נרות זוגי', 119], ['hanging-planter', 'עציץ תלוי', 79], ['pottery-workshop', 'סדנת קדרות ליחיד', 380]];
const r1 = [['espresso-matte', 'ספל אספרסו מט', 59], ['cereal-bowl', 'קערת דגנים', 72], ['dinner-plates-4', 'סט 4 צלחות ערב', 320], ['water-jug', 'קנקן מים', 185], ['jewelry-dish', 'מגש לתכשיטים', 45], ['gift-card', 'כרטיס מתנה', 100], ['tall-vase', 'אגרטל גבוה', 210]];
const shelf = r0.flatMap((a, i) => [a, r1[i]]).map(([f, title, price]) => ({ title, image: img(f), price_min: price }));

const d = {
  store: { id: 1, name: 'כלי חרס של נורית', domain: 'kli-cheres.example', url: 'https://kli-cheres.example', slug: 'kli-cheres-1qld', demo_code: 'DEMO-0000', brand: {}, brand_override: {}, config: { currency: 'ILS' }, approved_at: '2026-10-23', taken_down_at: null, status: 'ready' },
  name: 'כלי חרס של נורית',
  color: '#b4532a',
  // The questions are ours; the answers are the ones Toran's agent gave on 2026-10-23, not one word changed.
  chat: [
    { role: 'customer', text: 'היי, יש לכם עציץ תלוי? כמה זה עולה?' },
    { role: 'agent', text: 'כן, יש עציץ תלוי במלאי. הוא עולה בין 79 ₪ ל-129 ₪, תלוי באפשרות שבוחרים (יש 3). רוצים שאבדוק מה ההבדל בין האפשרויות?\nhttps://kli-cheres.example/products/hanging-planter' },
    { role: 'customer', text: 'ותוך כמה זמן זה מגיע?' },
    { role: 'agent', text: 'ההזמנה מגיעה תוך 3 עד 5 ימי עסקים. כלים שמסומנים "בהכנה" יוצאים תוך 14 ימי עסקים. אפשר גם לאסוף מהסטודיו בקיבוץ בלי תשלום, אחרי שמתאמים מראש.' },
  ],
  product: { title: 'עציץ תלוי', image: img('hanging-planter'), url: 'https://kli-cheres.example/products/hanging-planter', price_min: 79 },
  counts: { products: 14, available: 14, images: 14, min: 45, max: 500 },
  pages: { shipping: true, returns: true, titles: ['מדיניות משלוחים', 'החזרות והחלפות', 'שאלות נפוצות', 'צור קשר'] },
  shelf,
  // The site's own prices (site.config.json); build.mjs writes them again from the config on every build.
  offer: { monthly: 590, vat: 'excluded', setup: 990, city: 'אשדוד', bigMonthly: 1190 },
  gaps: [],
  public: true,
};
const FAKE = '972500000000';
const env = { DEMO_WA_NUMBER: FAKE, TORAN_SIGNUP_OPEN: '1', OF_ACCOUNTS_URL: 'https://accounts.openfrequency.co.il' };
let html = pitchPage(d, { env, owner: false, preview: false });

const must = (re, to, what) => {
  if (!re.test(html)) throw new Error(`not found: ${what} (${re})`);
  html = html.replace(re, to);
};
const css = (f) => fs.readFileSync(path.join(toranRoot, 'src/web/static', f), 'utf8').replaceAll('/static/fonts/', '/fonts/').replaceAll('/static/fonts', '/fonts');

// The head: this site's title, fonts and icons; the styles inlined (the family's tokens, the page, the store's colour,
// the accessibility panel), and the strip that says it is an example.
must(/<title>[^<]*<\/title>/, '<title>עמוד לדוגמה של תורן | OpenFrequency</title>', 'title');
must(/<link rel="preload" href="\/static\/fonts\/heebo-hebrew\.woff2"/, '<link rel="preload" href="/fonts/heebo-hebrew.woff2"', 'font preload');
const EXAMPLE_CSS = `.example { margin: 14px 0 0; padding: 12px 16px; border-radius: 16px; background: rgba(39, 71, 214, 0.08); border: 1px solid rgba(39, 71, 214, 0.2); color: #1a2a7a; font-size: 14px; line-height: 1.55; }
.example b { display: block; margin-bottom: 2px; }
.example a { color: inherit; font-weight: 600; }
@media (max-width: 559px) { .example { padding: 10px 14px; font-size: 13.5px; line-height: 1.5; } }
@media (min-width: 980px) { .wrap:has(.with-shelf) > .example { width: min(1040px, 100vw - 64px); margin-inline: calc((100% - min(1040px, 100vw - 64px)) / 2); box-sizing: border-box; } }
/* The link in the store's bubble at full white: at 0.92 it fell to 4.47:1 on the store's colour. */
.msg .lnk { opacity: 1; }
/* Two plans side by side need the card's whole width: in the price column of a two-column card (Toran's pitch.css from
   640px) the big plan ran into the list beside it. The list goes under them. */
.price-card { grid-template-columns: minmax(0, 1fr); }
.plans { grid-template-columns: repeat(auto-fit, minmax(min(100%, 230px), 1fr)); }`;
must(/<link rel="stylesheet" href="\/static\/brand\.css">\n<link rel="stylesheet" href="\/static\/pitch\.css">\n<link rel="stylesheet" href="\/s\/[^"]+\/theme\.css">\n/,
  `<style>\n${brandCss()}\n${css('pitch.css')}\n${themeCss(d)}\n${EXAMPLE_CSS}\n</style>\n`, 'stylesheets');
must(/<link rel="stylesheet" href="\/static\/a11y\.css">\n<script src="\/static\/a11y\.js"><\/script>/, `<style>\n${css('a11y.css')}\n</style>\n<script>\n${css('a11y.js')}\n</script>`, 'accessibility head');
must(/<link rel="icon" href="\/static\/brand\/toran\.svg" type="image\/svg\+xml">\n<link rel="apple-touch-icon" href="\/static\/brand\/toran-180\.png">/, '<link rel="icon" href="/favicon.svg" type="image/svg+xml">\n<link rel="apple-touch-icon" href="/apple-touch-icon.png">', 'icons');
must(/(<\/header>\n)/, '$1  <aside class="example" role="note"><b>עמוד לדוגמה, לחנות בדיונית.</b>ככה נראה העמוד שחנות מקבלת מאיתנו. בעמוד אמיתי הכפתור הירוק פותח וואטסאפ עם התורן של החנות. <a href="/toran#demo">לבנות דמו לחנות שלכם</a></aside>\n', 'the example strip');

// The green buttons lead to /toran's demo form (a made-up store has no demo number), and nothing is tracked.
const waHref = new RegExp(`href="https://wa\\.me/${FAKE}\\?text=[^"]*" data-demo rel="noopener"`, 'g');
if (!waHref.test(html)) throw new Error('no green button');
html = html.replace(waHref, 'href="/toran#demo"');
// The line offering to take the page down, and its button, are a real store's.
must(/\s*<p class="after">[\s\S]*?<\/p>/, '', 'the take-down line');
// Each plan's price and conversations, and the line under them, marked for build.mjs to write from site.config.json.
must(/(<div class="plan main">\s*<p class="plan-name"><b>[^<]*<\/b><span)>/, '$1 data-cfg-conv="store">', 'the store plan');
must(/(<div class="plan main">[\s\S]*?<span class="num")>/, '$1 data-cfg="price.plans.store.monthly">', 'the store plan price');
must(/(<div class="plan">\s*<p class="plan-name"><b>[^<]*<\/b><span)>/, '$1 data-cfg-conv="big">', 'the big plan');
must(/(<div class="plan">[\s\S]*?<span class="num")>/, '$1 data-cfg="price.plans.big.monthly">', 'the big plan price');
must(/<p class="price-notes">/, '<p class="price-notes" data-cfg-notes>', 'the notes');
// The page's own script: a product photo that fails goes, the strip's pause button, and the docked button. No tracking.
must(/<script src="\/static\/pitch\.js" defer><\/script>/, `<script>
(() => {
  document.querySelectorAll('img[data-hide-on-error]').forEach((img) => {
    const hide = () => (img.closest('.shelf li') || img).remove();
    if (img.complete && !img.naturalWidth) hide();
    else img.addEventListener('error', hide);
  });
  const shelf = document.querySelector('.shelf');
  const pause = document.querySelector('.shelf-pause');
  if (shelf && pause && !matchMedia('(prefers-reduced-motion: reduce)').matches && !document.documentElement.classList.contains('a-still')) {
    shelf.classList.add('loop');
    pause.hidden = false;
    pause.addEventListener('click', () => {
      const stopped = shelf.classList.toggle('paused');
      pause.setAttribute('aria-pressed', String(stopped));
      pause.textContent = stopped ? 'להפעיל את התנועה' : 'לעצור את התנועה';
    });
  }
  const first = document.querySelector('.read-cta .wa'), dock = document.querySelector('.dock');
  if (first && dock && 'IntersectionObserver' in window) new IntersectionObserver(([e]) => dock.classList.toggle('show', !e.isIntersecting && e.boundingClientRect.top < 0)).observe(first);
})();
</script>`, 'the script');
for (const bad of [/\/static\//, /wa\.me/, /data-demo/, /data-takedown/, /\/s\/kli/]) if (bad.test(html)) throw new Error(`left in the page: ${bad} at ${html.slice(Math.max(0, html.search(bad) - 120), html.search(bad) + 80)}`);
fs.writeFileSync(out, html);
console.log(`wrote ${out}: ${html.length} bytes`);
