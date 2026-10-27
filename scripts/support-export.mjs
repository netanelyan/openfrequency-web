// What Toran needs to answer OpenFrequency's own support, as one JSON file, from the same config and page modules the
// site is built from: the plans and their prices (the /toran and /teder price sections, word for word), the questions
// and answers of /faq, the legal pages, and what Toran does today and does not do yet.
//
//   node scripts/support-export.mjs [out.json]      (npm run support -- out.json; stdout without a file)
//
// support.json says what is true today where the site describes the product at launch: its "today" list replaces
// toran.today, and each of its answers replaces the site's answer to that question. An answer whose question is no
// longer on /faq stops the export, so a reworded question never leaves a stale answer behind.
//
// Toran reads the file with `npm run company -- sync <file>` (openfrequency-toran, docs/company.md). Like the real
// build, it stops while a fact in site.config.json is empty.
//
// While Toran is soon (products.toran in site.config.json), the export follows the site: Toran is not for sale, so
// there are no Toran plans or Toran price section, the status says it opens soon and Teder is available, and the
// questions are /faq's own soon answers (support.json's answers describe a Toran that is running, so they wait).
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, ils, readConfig, toranSoon } from '../src/lib.mjs';
import toran from '../src/pages/toran.mjs';
import teder from '../src/pages/teder.mjs';
import { TORAN, TEDER } from '../src/pages/faq.mjs';
import { terms, privacy, security, accessibility } from '../src/pages/legal.mjs';

const cfg = readConfig(false);
const soon = toranSoon(cfg);
const support = JSON.parse(fs.readFileSync(path.join(ROOT, 'support.json'), 'utf8'));
const origin = `https://${cfg.get('domain')}`;

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'", nbsp: ' ' };
const abs = (href) => (href.startsWith('/') ? origin + href : href.replace(/^mailto:/, ''));
/** Page HTML as the plain text a person would read: links keep their address, headings and items their own lines. */
export function toText(html) {
  return html
    .replace(/<(script|style|svg|nav)\b[\s\S]*?<\/\1>/g, '')
    .replace(/<a\b[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g, (_, href, t) => (href.startsWith('#') || t.trim() === abs(href) ? t : `${t} (${abs(href)})`))
    .replace(/<li\b[^>]*>/g, '\n- ')
    .replace(/<\/span>/g, ' ') // a price is three spans: <span class="num">590</span><span class="cur">₪</span>...
    .replace(/<\/(p|li|h1|h2|h3|summary|div|section|article|ul|ol)>|<br\s*\/?>/g, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&(amp|lt|gt|quot|#39|nbsp);/g, (_, e) => ENTITIES[e])
    .split('\n').map((l) => l.replace(/\s+/g, ' ').replace(/ ([.,:;?)])/g, '$1').trim()).filter(Boolean).join('\n');
}
const fill = (s) => s.replace(/\{([\w.]+)\}/g, (_, key) => {
  const v = cfg.get(key);
  if (v == null) throw new Error(`support.json: {${key}} is empty in site.config.json`);
  return String(v);
});
const priceSection = (page) => {
  const m = /<section class="sec price-sec[^"]*" id="price"[\s\S]*?<\/section>/.exec(page.body);
  if (!m) throw new Error(`${page.path}: no price section`);
  return toText(m[0]);
};

const num = (key) => cfg.get(key).toLocaleString('he-IL');
const toranPage = toran(cfg);
const tederPage = teder(cfg);
const allPlans = [
  { key: 'toran-store', product: 'toran', title: 'תורן, חבילת חנות', monthly: cfg.get('price.plans.store.monthly'), setup: cfg.get('price.setup'), detail: `עד ${num('price.plans.store.conversations')} שיחות בחודש`, url: `${origin}/toran#price` },
  { key: 'toran-big', product: 'toran', title: 'תורן, חבילת חנות גדולה', monthly: cfg.get('price.plans.big.monthly'), setup: cfg.get('price.setup'), detail: `עד ${num('price.plans.big.conversations')} שיחות בחודש`, url: `${origin}/toran#price` },
  { key: 'teder', product: 'teder', title: 'תדר', monthly: cfg.get('teder.monthly'), setup: cfg.get('teder.setup'), detail: `${cfg.get('teder.slideshows')} מצגות ו-${cfg.get('teder.redos')} החלפות בחודש`, url: `${origin}/teder#price` },
];
const plans = allPlans.filter((p) => !(soon && p.product === 'toran'));
// Each plan in one sentence, the way the site says it: the monthly price, VAT, what it covers, the setup fee.
const vat = cfg.get('price.vat') === 'included' ? 'כולל מע״מ' : 'לא כולל מע״מ';
for (const p of plans) p.text = `${ils(p.monthly)} לחודש, ${vat}, ${p.detail}. ${p.setup > 0 ? `בחודש הראשון יש גם ${ils(p.setup)} דמי הקמה, פעם אחת.` : 'אין דמי הקמה.'}`;
const pricing = [
  ...(soon ? [] : [{ product: 'toran', title: 'כמה עולה תורן', url: `${origin}/toran#price`, text: priceSection(toranPage) }]),
  { product: 'teder', title: 'כמה עולה תדר', url: `${origin}/teder#price`, text: priceSection(tederPage) },
];

const answers = new Map(soon ? [] : (support.answers || []).map((x) => [x.q, fill(x.a)]));
const faq = [...TORAN(cfg), ...TEDER(cfg)].filter(Boolean).map(([q, a]) => ({ q: toText(q), a: toText(a), today: answers.get(toText(q)) ?? null, url: `${origin}/faq` }));
const stale = [...answers.keys()].filter((q) => !faq.some((f) => f.q === q));
if (stale.length) {
  console.error(`support.json: these questions are not on /faq any more, so their answers would be lost:\n${stale.map((q) => `  ${q}`).join('\n')}`);
  process.exit(1);
}

const today = (support.today || cfg.get('toran.today')).map(fill);
const notYet = cfg.get('toran.notYet') || [];
const legal = [['terms', terms], ['privacy', privacy], ['security', security], ['accessibility', accessibility]].map(([kind, def]) => {
  const p = def(cfg);
  return { kind, title: p.title.replace(/ \| OpenFrequency$/, ''), url: origin + p.path, text: toText(p.body) };
});
// While Toran is soon: what is open and what is not, said plainly, for the agent to put above everything else.
const soonStatus = [
  'תדר פתוח: אפשר להצטרף אליו עכשיו, ולקבל מצגת לדוגמה מהחנות דרך הטופס ב-' + `${origin}/teder#demo` + ' או ב-' + `${origin}/join` + '.',
  'תורן עוד לא פתוח לחנויות, ואנחנו פותחים אותו בקרוב. עד אז אין לו דמו, אין לו מחיר, ואי אפשר להצטרף אליו או להתחיל איתו.',
  'מי שרוצה לדעת כשתורן נפתח משאיר טלפון או מייל ב-' + `${origin}/toran#waitlist` + ', ואנחנו כותבים לו כשהוא נפתח.',
  'מה שכתוב על תורן באתר הוא מה שהוא יעשה כשייפתח.',
].join('\n');
const pages = [
  soon
    ? { kind: 'about', title: 'מה פתוח עכשיו: תדר פתוח, תורן נפתח בקרוב', url: `${origin}/toran`, text: soonStatus }
    : { kind: 'about', title: 'מה תורן עושה היום, ומה עוד לא', url: `${origin}/toran`, text: `מה תורן עושה היום:\n${today.map((x) => `- ${x}`).join('\n')}\n\nמה עוד לא עובד בתורן:\n${notYet.map((x) => `- ${x}`).join('\n')}` },
  { kind: 'about', title: 'מי אנחנו', url: origin, text: `${cfg.get('about.who')}\n${cfg.get('about.why')}` },
  ...pricing.map((p) => ({ kind: 'payment', title: p.title, url: p.url, text: p.text })),
  ...legal,
];

const out = {
  // What Toran does today and what not yet (or, while it is soon, that it is not open yet and Teder is): the agent keeps
  // this in its prompt, above every other passage, since the site's own pages describe the product at launch.
  status: pages[0].text,
  ...(soon ? { products: { toran: 'soon', teder: 'live' } } : {}),
  domain: cfg.get('domain'),
  url: `${origin}/`,
  name: 'OpenFrequency',
  contact: { whatsapp: cfg.get('whatsapp'), email: cfg.get('legal.email') },
  tone: `${cfg.get('about.who')} ${cfg.get('about.why')}`,
  plans,
  faq,
  pages,
  generatedAt: new Date().toISOString(),
};
if (cfg.missing.size) {
  console.error(`Not exported. Empty in site.config.json:\n${[...cfg.missing].map(([k, l]) => `  ${k} (${l})`).join('\n')}`);
  process.exit(1);
}
const json = JSON.stringify(out, null, 2) + '\n';
const file = process.argv[2];
if (file) {
  fs.writeFileSync(file, json);
  console.error(`Exported to ${file}: ${plans.length} plans, ${faq.length} questions (${answers.size} with today's answer), ${pages.length} pages.`);
} else process.stdout.write(json);
