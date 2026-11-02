// What Toran needs to answer OpenFrequency's own support, as one JSON object, from the same config and page modules the
// site is built from: the plans and their prices (the /toran and /teder price sections, word for word), the questions
// and answers of /faq, the legal pages, and what Toran does today and does not do yet.
//
// Two places make it, from this one function, so they can never say different things:
//   build.mjs             the real build publishes it as dist/support.json, https://<domain>/support.json, beside the
//                         pages it was made from. Toran reads it there once a day by itself (openfrequency-toran,
//                         docs/company.md, TORAN_SUPPORT_EXPORT_URL) and syncs it only when it changed
//   npm run support       scripts/support-export.mjs, the same object as a file, for `npm run company -- sync <file>`
//                         by hand
// Everything in it is already public: the site's own pages as text, our WhatsApp number and email as the footer shows
// them, and the status, which is support.json's "today" list (what Toran does today) or, while Toran is soon, that it
// is not open yet. Nothing of the leads, the server or the switches' reasons.
//
// support.json says what is true today where the site describes the product at launch: its "today" list replaces
// toran.today, and each of its answers replaces the site's answer to that question. An answer whose question is no
// longer on /faq stops the export (and with it the real build), so a reworded question never leaves a stale answer
// behind. Like the real build, it stops while a fact in site.config.json is empty.
//
// While Toran is soon (products.toran in site.config.json), the export follows the site: Toran is not for sale, so
// there are no Toran plans or Toran price section, the status says it opens soon and Teder is available, and the
// questions are /faq's own soon answers (support.json's answers describe a Toran that is running, so they wait).
//
// It also says, for each product, whether the site sends people to accounts' sign-up ("signup": "open" or "closed"):
// Teder while site.config.json's "signup" is "open", Toran only then and once it is no longer soon. Sign-up is one
// switch in three places (this, accounts' OF_SIGNUP and OF_SIGNUP_PRODUCTS, Teder's OF_SIGNUP_OPEN), and Teder reads
// this field once at start to check that the three agree (openfrequency-teder, docs/operator-notes.md).
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, SIGNUP_URL, ils, signupOpen, toranSoon } from './lib.mjs';
import toran from './pages/toran.mjs';
import teder from './pages/teder.mjs';
import { TORAN, TEDER } from './pages/faq.mjs';
import { NO_REFUND } from './sections.mjs';
import { terms, privacy, security, accessibility } from './pages/legal.mjs';

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'", nbsp: ' ' };
/** Page HTML as the plain text a person would read: links keep their address (on `origin`), headings and items their own lines. */
export function toText(html, origin) {
  const abs = (href) => (href.startsWith('/') ? origin + href : href.replace(/^mailto:/, ''));
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
/**
 * The export for this config (readConfig, or the build's own, so it follows whatever the pages it is published beside
 * followed). Throws when one of support.json's answers has no question on /faq left, or names an empty fact; the
 * callers stop on cfg.missing themselves, as the build does for the pages.
 */
export function supportExport(cfg) {
  const soon = toranSoon(cfg);
  const support = JSON.parse(fs.readFileSync(path.join(ROOT, 'support.json'), 'utf8'));
  const origin = `https://${cfg.get('domain')}`;
  const text = (html) => toText(html, origin);
  const fill = (s) => s.replace(/\{([\w.]+)\}/g, (_, key) => {
    const v = cfg.get(key);
    if (v == null) throw new Error(`support.json: {${key}} is empty in site.config.json`);
    return String(v);
  });
  const priceSection = (page) => {
    const m = /<section class="sec price-sec[^"]*" id="price"[\s\S]*?<\/section>/.exec(page.body);
    if (!m) throw new Error(`${page.path}: no price section`);
    return text(m[0]);
  };

  const num = (key) => cfg.get(key).toLocaleString('he-IL');
  const toranPage = toran(cfg);
  const tederPage = teder(cfg);
  const allPlans = [
    { key: 'toran-store', product: 'toran', title: 'תורן, חבילת חנות', monthly: cfg.get('price.plans.store.monthly'), setup: cfg.get('price.setup'), detail: `עד ${num('price.plans.store.conversations')} שיחות בחודש`, url: `${origin}/toran#price` },
    { key: 'toran-big', product: 'toran', title: 'תורן, חבילת חנות גדולה', monthly: cfg.get('price.plans.big.monthly'), setup: cfg.get('price.setup'), detail: `עד ${num('price.plans.big.conversations')} שיחות בחודש`, url: `${origin}/toran#price` },
    { key: 'teder-small', product: 'teder', title: 'תדר, חבילה קטנה', monthly: cfg.get('teder.small.monthly'), setup: cfg.get('teder.small.setup'), detail: `${cfg.get('teder.small.slideshows')} מצגות ו-${cfg.get('teder.small.redos')} החלפות בחודש`, url: `${origin}/teder#price` },
    { key: 'teder', product: 'teder', title: 'תדר, חבילה מלאה', monthly: cfg.get('teder.monthly'), setup: cfg.get('teder.setup'), detail: `${cfg.get('teder.slideshows')} מצגות ו-${cfg.get('teder.redos')} החלפות בחודש`, url: `${origin}/teder#price` },
  ];
  const plans = allPlans.filter((p) => !(soon && p.product === 'toran'));
  // Each plan in one sentence, the way the site says it: the monthly price, VAT, what it covers, the setup fee (and for
  // Teder while sign-up is open, as its plan cards say, that the fee is not refunded).
  const vat = cfg.get('price.vat') === 'included' ? 'כולל מע״מ' : 'לא כולל מע״מ';
  const noRefund = (p) => (p.product === 'teder' && signupOpen(cfg) ? ` ${NO_REFUND}` : '');
  for (const p of plans) p.text = `${ils(p.monthly)} לחודש, ${vat}, ${p.detail}. ${p.setup > 0 ? `בחודש הראשון יש גם ${ils(p.setup)} דמי הקמה, פעם אחת.${noRefund(p)}` : 'אין דמי הקמה.'}`;
  const pricing = [
    ...(soon ? [] : [{ product: 'toran', title: 'כמה עולה תורן', url: `${origin}/toran#price`, text: priceSection(toranPage) }]),
    { product: 'teder', title: 'כמה עולה תדר', url: `${origin}/teder#price`, text: priceSection(tederPage) },
  ];

  const answers = new Map(soon ? [] : (support.answers || []).map((x) => [x.q, fill(x.a)]));
  const faq = [...TORAN(cfg), ...TEDER(cfg)].filter(Boolean).map(([q, a]) => ({ q: text(q), a: text(a), today: answers.get(text(q)) ?? null, url: `${origin}/faq` }));
  const stale = [...answers.keys()].filter((q) => !faq.some((f) => f.q === q));
  if (stale.length) throw new Error(`support.json: these questions are not on /faq any more, so their answers would be lost:\n${stale.map((q) => `  ${q}`).join('\n')}`);

  const today = (support.today || cfg.get('toran.today')).map(fill);
  const notYet = cfg.get('toran.notYet') || [];
  const legal = [['terms', terms], ['privacy', privacy], ['security', security], ['accessibility', accessibility]].map(([kind, def]) => {
    const p = def(cfg);
    return { kind, title: p.title.replace(/ \| OpenFrequency$/, ''), url: origin + p.path, text: text(p.body) };
  });
  // While Toran is soon: what is open and what is not, said plainly, for the agent to put above everything else.
  const soonStatus = [
    signupOpen(cfg)
      ? 'תדר פתוח: אפשר לפתוח בו חשבון עכשיו ולהקים אותו לבד ב-' + SIGNUP_URL + ', או לקבל קודם מצגת לדוגמה מהחנות דרך הטופס ב-' + `${origin}/teder#demo` + ' או ב-' + `${origin}/join` + '.'
      : 'תדר פתוח: אפשר להצטרף אליו עכשיו, ולקבל מצגת לדוגמה מהחנות דרך הטופס ב-' + `${origin}/teder#demo` + ' או ב-' + `${origin}/join` + '.',
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
    // Where each product's ways in on the site lead: accounts' sign-up ("open"), or not ("closed").
    signup: { teder: signupOpen(cfg) ? 'open' : 'closed', toran: signupOpen(cfg) && !soon ? 'open' : 'closed' },
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
  return out;
}
