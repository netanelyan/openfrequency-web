// What every page is built with: the config reader that refuses a guess, the brand marks, and the copy lint.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

// Each fact the site states: the words a draft shows in its place, and what a value must look like. A key in
// site.config.json that is not here is a build error, so a new fact gets a label before it gets a page.
//   kind: 'text', 'number' (0 or more), 'flag' (true or false), 'lines' (a list of sentences), 'channels' (a list of CHANNELS), or the list of
//         allowed values
//   unless: the fact is not needed when this is true (the build then lets it stay empty)
//   renamed: { old value: its new name }, a value the build refuses with the new name instead of the plain list
const foundingOff = (raw) => raw.price?.founding?.on === false;
// Where a customer can write to a store; the ones in toran.channels are live, the rest are shown as coming.
export const CHANNELS = ['whatsapp', 'instagram', 'messenger', 'email'];
export const FACTS = {
  // The switch: whether Toran is on sale. 'live' is the site as it was; 'soon' keeps Toran on show with a "בקרוב"
  // badge, and every way to buy it, start it or ask for its demo becomes a waitlist (README, "Toran: live or soon").
  'products.toran': { label: 'תורן פתוח למכירה (live) או בקרוב (soon)', kind: ['live', 'soon'] },
  'products.assistant': { label: 'העוזר בוואטסאפ שלנו פועל (live) או בקרוב (soon)', kind: ['live', 'soon'] },
  // Whether a business can sign up to Teder on its own, at accounts' /signup, and pay there. 'closed' is the site as it
  // was (Teder's ways in are the free sample); 'open' sends them to sign-up with the price beside it, keeps the sample
  // as the second way, and shows the self-serve terms (README, "Sign-up: open or closed").
  signup: { label: 'ההרשמה לתדר פתוחה (open) או סגורה (closed)', kind: ['open', 'closed'] },
  // How a business that signed up pays, the same switch as accounts' OF_PAYMENT (README, "Paying: payment"): 'manual'
  // while no payment provider is connected (we email the payment details once the account is open), 'provider' once
  // accounts takes card payments on its payment page. Either way the product opens once the payment is in.
  payment: { label: 'איך משלמים: פרטי תשלום שאנחנו שולחים במייל (manual) או בכרטיס, בעמוד התשלום בחשבון (provider)', kind: ['manual', 'provider'], renamed: { online: 'provider' } },
  domain: { label: 'הדומיין', kind: 'text' },
  whatsapp: { label: 'מספר הוואטסאפ שלנו', kind: 'text' },
  'demo.time': { label: 'זמן הכנת דמו', kind: 'text' },
  'about.who': { label: 'משפט על מי אנחנו', kind: 'text' },
  'about.why': { label: 'משפט על למה בנינו את תורן', kind: 'text' },
  'price.vat': { label: 'כולל או לא כולל מע״מ', kind: ['included', 'excluded'] },
  'price.setup': { label: 'דמי הקמה של תורן, 0 אם אין', kind: 'number' },
  // Toran's two plans: a monthly price and the conversations a month it covers. Bigger stores talk to us.
  'price.plans.store.monthly': { label: 'המחיר החודשי של חבילת חנות', kind: 'number' },
  'price.plans.store.conversations': { label: 'כמה שיחות בחודש בחבילת חנות', kind: 'number' },
  'price.plans.big.monthly': { label: 'המחיר החודשי של חבילת חנות גדולה', kind: 'number' },
  'price.plans.big.conversations': { label: 'כמה שיחות בחודש בחבילת חנות גדולה', kind: 'number' },
  // The founding offer, while on: the first stores get the Store plan at a lower price for their first months.
  'price.founding.on': { label: 'הצעת המייסדים פעילה', kind: 'flag' },
  'price.founding.stores': { label: 'לכמה חנויות ראשונות הצעת המייסדים', kind: 'number', unless: foundingOff },
  'price.founding.monthly': { label: 'המחיר החודשי בהצעת המייסדים', kind: 'number', unless: foundingOff },
  'price.founding.months': { label: 'לכמה חודשים הצעת המייסדים', kind: 'number', unless: foundingOff },
  // How a store moves between the plans: up after this many months in a row above its plan, with notice this many
  // days ahead; down after this many months in a row under the smaller plan's conversations.
  'price.fair.upMonths': { label: 'אחרי כמה חודשים ברצף מעל החבילה עוברים למעלה', kind: 'number' },
  'price.fair.noticeDays': { label: 'כמה ימים לפני המעבר מודיעים', kind: 'number' },
  'price.fair.downMonths': { label: 'אחרי כמה חודשים ברצף מתחת לחבילה הקטנה יורדים', kind: 'number' },
  'price.commitmentMonths': { label: 'חודשי התחייבות, 0 אם אין', kind: 'number' },
  'price.stops': { label: 'מתי החיוב נעצר', kind: ['period-end', 'immediately'] },
  'price.keepDays': { label: 'כמה ימים שומרים את השיחות אחרי שמפסיקים', kind: 'number' },
  // For the privacy and terms pages, and nowhere else.
  'legal.name': { label: 'השם המשפטי', kind: 'text' },
  'legal.number': { label: 'מספר העוסק', kind: 'text' },
  'legal.email': { label: 'מייל ליצירת קשר', kind: 'text' },
  'legal.court': { label: 'העיר של בית המשפט המוסמך', kind: 'text' },
  'legal.host': { label: 'באיזו מדינה השרת', kind: 'text' },
  'legal.leadMonths': { label: 'כמה חודשים שומרים פניות מהטופס', kind: 'number' },
  'legal.updated': { label: 'תאריך העדכון של העמודים המשפטיים, YYYY-MM-DD', kind: 'text' },
  // The date of the terms with the self-serve section, shown on /terms while sign-up is open. It is the terms version
  // accounts stores on each sign-up (openfrequency-accounts, TERMS_VERSION in src/accounts/signup.js).
  'legal.signupUpdated': { label: 'תאריך תנאי השימוש כשההרשמה פתוחה, YYYY-MM-DD', kind: 'text', unless: (raw) => raw.signup !== 'open' },
  'toran.today': { label: 'מה תורן עושה היום', kind: 'lines' },
  'toran.notYet': { label: 'מה תורן עוד לא עושה', kind: 'lines' },
  // Teder's two plans, the same product with a different number of slideshows: the full one (teder.*) and the small one
  // (teder.small.*). accounts sells them as plan=full and plan=small (signupUrl below).
  'teder.monthly': { label: 'המחיר החודשי של החבילה המלאה של תדר', kind: 'number' },
  'teder.slideshows': { label: 'כמה מצגות מוצעות בחודש בחבילה המלאה', kind: 'number' },
  'teder.redos': { label: 'כמה החלפות בחודש בחבילה המלאה', kind: 'number' },
  'teder.setup': { label: 'דמי ההקמה של החבילה המלאה, 0 אם אין', kind: 'number' },
  'teder.small.monthly': { label: 'המחיר החודשי של החבילה הקטנה של תדר', kind: 'number' },
  'teder.small.slideshows': { label: 'כמה מצגות מוצעות בחודש בחבילה הקטנה', kind: 'number' },
  'teder.small.redos': { label: 'כמה החלפות בחודש בחבילה הקטנה', kind: 'number' },
  'teder.small.setup': { label: 'דמי ההקמה של החבילה הקטנה, 0 אם אין', kind: 'number' },
  // Whether Teder also posts to the customer's Facebook Page. Off, every page says TikTok and Instagram only (tederNets).
  'teder.facebook': { label: 'תדר מפרסם גם בפייסבוק', kind: 'flag' },
  'toran.channels': { label: 'הערוצים שתורן עונה בהם היום', kind: 'channels' },
  // Where the list of live channels comes from: 'config' (toran.channels above, whatever Toran says), or 'toran'
  // (Toran's own /channels.json at build time, with toran.channels only when Toran doesn't answer). build.mjs.
  'toran.channelsFrom': { label: 'מאיפה רשימת הערוצים, config או toran', kind: ['config', 'toran'] },
};

// The config, read so that nothing missing can be shown as a guess. An empty value ('' or null) is missing.
// The real build fails on any missing key, used or not; a draft shows each one as a visible [placeholder].
// SITE_CONFIG points at another file instead (the tests build both ways of the switch from a copy).
export function readConfig(draft) {
  const raw = JSON.parse(fs.readFileSync(process.env.SITE_CONFIG || path.join(ROOT, 'site.config.json'), 'utf8'));
  const missing = new Map();
  const empty = (v) => v === null || v === '' || v === undefined || (Array.isArray(v) && v.length === 0);
  const at = (key) => key.split('.').reduce((o, k) => (o == null ? undefined : o[k]), raw);
  const label = (key) => FACTS[key].label;

  const walk = (o, pre = '') => {
    for (const [k, v] of Object.entries(o)) {
      const key = pre + k;
      if (v && typeof v === 'object' && !Array.isArray(v)) { walk(v, key + '.'); continue; }
      const f = FACTS[key];
      if (!f) throw new Error(`site.config.json: "${key}" has no entry in FACTS (src/lib.mjs)`);
      if (empty(v)) { if (!f.unless?.(raw)) missing.set(key, f.label); continue; }
      if (f.kind === 'number' && !(typeof v === 'number' && v >= 0)) throw new Error(`site.config.json: "${key}" must be a number, 0 or more (got ${JSON.stringify(v)})`);
      if (f.kind === 'flag' && typeof v !== 'boolean') throw new Error(`site.config.json: "${key}" must be true or false (got ${JSON.stringify(v)})`);
      if (f.kind === 'lines' && !(Array.isArray(v) && v.every((x) => typeof x === 'string' && x.trim()))) throw new Error(`site.config.json: "${key}" must be a list of sentences`);
      if (f.kind === 'channels' && !(Array.isArray(v) && v.every((x) => CHANNELS.includes(x)))) throw new Error(`site.config.json: "${key}" must be a list of ${CHANNELS.join(', ')}`);
      if (f.kind !== 'lines' && f.kind !== 'channels' && Array.isArray(v)) throw new Error(`site.config.json: "${key}" must not be a list`);
      if (f.renamed && Object.hasOwn(f.renamed, v)) throw new Error(`site.config.json: "${key}": "${v}" is now called "${f.renamed[v]}" (must be one of ${f.kind.join(', ')})`);
      if (Array.isArray(f.kind) && !f.kind.includes(v)) throw new Error(`site.config.json: "${key}" must be one of ${f.kind.join(', ')} (got ${JSON.stringify(v)})`);
    }
  };
  walk(raw);
  for (const key of Object.keys(FACTS)) if (at(key) === undefined) throw new Error(`site.config.json: "${key}" is not there (add it, empty if not decided)`);

  const get = (key) => {
    if (!FACTS[key]) throw new Error(`no fact called "${key}" in FACTS (src/lib.mjs)`);
    const v = at(key);
    if (empty(v)) { missing.set(key, label(key)); return null; }
    return v;
  };
  // A fact as text on the page: escaped, or a visible placeholder in a draft.
  const ph = (key) => `<mark class="ph">[${esc(label(key))}]</mark>`;
  const t = (key, fmt = String) => {
    const v = get(key);
    return v == null ? ph(key) : esc(fmt(v));
  };

  const wa = get('whatsapp');
  if (wa != null && !/^972[1-9]\d{7,8}$/.test(String(wa))) throw new Error(`site.config.json: whatsapp must be digits in international form, like 9725XXXXXXXX (got "${wa}")`);

  // Whether a fact is there. A draft with the banner (dev) shows a missing one as a placeholder; the public draft leaves
  // out what it can't say yet.
  const has = (key) => !empty(at(key));
  return { get, t, ph, has, missing, draft, banner: false };
}

// While products.toran is 'soon', Toran is shown but not sold: no demo, no price, no way to start it, only a waitlist.
export const toranSoon = (cfg) => cfg.get('products.toran') === 'soon';
// The assistant on our WhatsApp number (Teder's approvals in a message, Toran's owner line) waits for that number to be
// connected at Meta, apart from whether Toran is sold: products.assistant "soon" until then, "live" after.
export const assistantSoon = (cfg) => cfg.get('products.assistant') === 'soon';
// While signup is 'open', Teder's main ways in go to accounts' sign-up, where a business opens its account and pays.
// p=teder is a hint for the form; accounts ignores what it doesn't read.
export const signupOpen = (cfg) => cfg.get('signup') === 'open';
// Accounts' sign-up, with the product the visitor came from ticked (?p=), and for Teder the plan they picked
// (&plan=small or full; without it accounts lets them choose). Raw: escape it (esc) before it goes into an attribute.
export const signupUrl = (product, plan = null) => `https://accounts.openfrequency.co.il/signup?p=${product}${plan ? `&plan=${plan}` : ''}`;
export const SIGNUP_URL = signupUrl('teder');
// Once a payment provider is connected (payment "provider" in site.config.json), a business pays by card on the payment
// page in its account; until then ("manual") it opens its account and we email it the payment details.
export const payProvider = (cfg) => cfg.get('payment') === 'provider';

// Where Teder posts, as a sentence needs it: to (לטיקטוק ולאינסטגרם), in (בטיקטוק ובאינסטגרם) or the (את טיקטוק ואת
// אינסטגרם), with Facebook while teder.facebook is on.
const NETS = {
  to: ['לטיקטוק ולאינסטגרם', 'לטיקטוק, לאינסטגרם ולפייסבוק'],
  in: ['בטיקטוק ובאינסטגרם', 'בטיקטוק, באינסטגרם ובפייסבוק'],
  the: ['את טיקטוק ואת אינסטגרם', 'את טיקטוק, את אינסטגרם ואת פייסבוק'],
};
export const facebookOn = (cfg) => cfg.get('teder.facebook') === true;
export const tederNets = (cfg, form = 'to') => NETS[form][facebookOn(cfg) ? 1 : 0];

// Shekels the way the site writes them: 1,290 ₪, and 0.15 ₪ for a fraction.
export const ils = (n) => `${n.toLocaleString('he-IL', { maximumFractionDigits: 2 })} ₪`;

// ---------------------------------------------------------------- the marks

// The brand's glyphs, read from assets/brand and never redrawn. The tile is the product's colour with rx 24 on 100,
// as in the brand files; at 48px and below the company's mark is the simpler 5x5 halftone (assets/brand/README.md).
const glyphs = {};
const glyph = (file) =>
  (glyphs[file] ??= fs.readFileSync(path.join(ROOT, 'assets/brand/svg', file + '.svg'), 'utf8').trim().replace('<svg ', '<svg aria-hidden="true" focusable="false" '));

// A glyph alone, in currentColor, for a field already in the mark's own colour (Teder's wave on its violet).
export const glyphOnly = (name) => glyph(`${name}-glyph`);

export function mark(name, size, label = '') {
  const file = name === 'openfrequency' ? (size <= 48 ? 'openfrequency-glyph-small' : 'openfrequency-glyph') : `${name}-glyph`;
  const a11y = label ? ` role="img" aria-label="${esc(label)}"` : ' aria-hidden="true"';
  return `<span class="mark ${name}" style="--s:${size}px"${a11y}>${glyph(file)}</span>`;
}

// ---------------------------------------------------------------- the product names

// Toran and Teder are Hebrew words, so in a sentence a reader can take them for the plain words (a duty officer,
// a frequency). Every mention in running text is set as a name: <span class="pn toran">. A prefix letter (ו, ל,
// ש...) stays outside the span. A name standing alone (a door's heading), the nav, buttons, links and the
// product's own UI (data-ui) are left alone: they already carry the mark, or they are the product talking.
const SKIP = /^(?:head|script|style|title|nav|button|a|b|textarea|select|label)$/;
const NAME = /(^|[^֐-׿])([ובלמשהכ]{0,2})(תורן|תדר)(?![֐-׿])/g;
const ALONE = /^\s*(?:תורן|תדר)\s*$/;
export function markNames(html) {
  let skip = null; // [tag, depth] of the element being skipped
  return html.split(/(<[^>]+>)/).map((part) => {
    if (part.startsWith('<')) {
      const m = /^<(\/?)([a-z0-9]+)/i.exec(part);
      if (!m) return part;
      const close = m[1], tag = m[2].toLowerCase();
      if (skip) {
        if (tag === skip[0]) skip[1] += close ? -1 : 1;
        if (skip[1] === 0) skip = null;
      } else if (!close && !part.endsWith('/>') && (SKIP.test(tag) || /\sdata-ui[\s>=]/.test(part))) {
        skip = [tag, 1];
      }
      return part;
    }
    if (skip || ALONE.test(part)) return part;
    return part.replace(NAME, (_, pre, prefix, name) =>
      `${pre}${prefix}<span class="pn ${name === 'תורן' ? 'toran' : 'teder'}">${name}</span>`);
  }).join('');
}

// ---------------------------------------------------------------- the copy lint

// A backstop for the hebrew-voice rewrite pass, run on every built page. It catches the patterns that are easy to
// miss when copy is edited later; it does not replace reading the copy.
const BANNED = [
  ['על מנת', 'כדי'], ['במידה ו', 'אם'], ['ניתן ל', 'אפשר ל'], ['בגין', 'על'], ['הננו', ''], ['יש לציין', ''],
  ['לשירותכם', ''], ['בלי כרטיס אשראי', ''], ['בלי אותיות קטנות', ''], ['השליטה אצלכם', ''], ['אל תפספסו', ''],
  ['פתרון מתקדם', ''], ['חוויית משתמש', ''], ['לשלב הבא', ''], ['מהפכה', ''], ['ניסיון חינם', 'there is no free trial'],
  ['תקופת ניסיון', 'there is no free trial'],
];

// A claim about our place in the market (the leading, the best, number one) that nothing on the page can back: the
// site states what the products do, never a rank. A prefix letter (ו, ש, כ...) is part of the word.
const RANK = /(?:^|[^֐-׿])[ובכלמשה]{0,2}(המוביל(?:ה|ים|ות)?|הכי|הטוב(?:ה|ים|ות)? ביותר|הגדול(?:ה|ים|ות)? ביותר|מספר (?:1|אחת?)(?= |[.,]|$)|#1(?![\w]))(?![֐-׿])/m;

export function lint(file, html, { draft }) {
  const errors = [];
  const body = html.replace(/<style[\s\S]*?<\/style>/g, '').replace(/<script[\s\S]*?<\/script>/g, '');
  const text = body.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ');
  const attrs = [...body.matchAll(/\b(?:alt|aria-label|title|content|placeholder)="([^"]*)"/g)].map((m) => m[1]).join('\n');
  const all = text + '\n' + attrs;

  if (/[–—]/.test(all)) errors.push('an em or en dash');
  if (/!!/.test(all)) errors.push('"!!"');
  if (/[֐-׿]\/[֐-׿]/.test(all)) errors.push('a gendered slash (like את/ה)');
  for (const m of body.matchAll(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/g)) {
    // a time of day (02:10) is not a heading's colon
    if (m[1].replace(/<[^>]+>/g, '').replace(/\d:\d/g, '').includes(':')) errors.push(`a colon in a heading: "${m[1].replace(/<[^>]+>/g, '').trim()}"`);
  }
  for (const [w, fix] of BANNED) if (all.includes(w)) errors.push(`"${w}"${fix ? ` (${fix})` : ''}`);
  const rank = RANK.exec(all);
  if (rank) errors.push(`a market claim, "${rank[1]}" (say what the product does, not where it ranks)`);
  if (!draft && /\[[^\]\n]{1,60}\]/.test(text)) errors.push('a [placeholder] left in the text');
  return errors.map((e) => `${file}: ${e}`);
}

// The stylesheet, small enough to inline whole: comments and spare whitespace out, nothing clever.
export const minifyCss = (css) =>
  css.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ').replace(/\s*([{};,>])\s*/g, '$1').replace(/;}/g, '}').trim();
