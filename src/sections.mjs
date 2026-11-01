// What more than one page uses: words that open WhatsApp to us, the prices, and the ways in.
import { SIGNUP_URL, esc, ils, mark, payProvider, signupOpen, signupUrl } from './lib.mjs';

// Words that open WhatsApp to us; plain words in a draft without the number.
export const waWords = (cfg, words) => {
  const wa = cfg.get('whatsapp');
  return wa ? `<a href="https://wa.me/${wa}">${words}</a>` : words;
};

// ---------------------------------------------------------------- the price

const vatOf = (cfg) => (cfg.get('price.vat') === 'included' ? 'כולל מע״מ' : cfg.get('price.vat') === 'excluded' ? 'לא כולל מע״מ' : cfg.ph('price.vat'));
const amount = (cfg, key) => (cfg.get(key) == null ? cfg.ph(key) : esc(ils(cfg.get(key))));
const count = (cfg, key) => (cfg.get(key) == null ? cfg.ph(key) : esc(cfg.get(key).toLocaleString('he-IL')));
const months = (n) => (n === 1 ? 'חודש' : n === 2 ? 'חודשיים' : `${n} חודשים`);
const days = (n) => (n === 7 ? 'שבוע' : n === 14 ? 'שבועיים' : n === 1 ? 'יום' : `${n} ימים`);
const said = (cfg, key, words) => (cfg.get(key) == null ? cfg.ph(key) : esc(words(cfg.get(key))));

// Teder's two plans, the small one first: [the plan as accounts takes it (plan=), its facts in the config, its name, and
// "in it" for a sentence].
const TEDER_PLANS = [
  ['small', 'teder.small', 'חבילה קטנה', 'בחבילה הקטנה'],
  ['full', 'teder', 'חבילה מלאה', 'בחבילה המלאה'],
];

// Teder's lowest monthly price and VAT, a few words for the home page's door while it is shut on a phone (the whole
// line, with each plan's setup fee, is inside it); null while a plan has no price yet.
export function tederFrom(cfg) {
  if (!TEDER_PLANS.every(([, k]) => cfg.has(`${k}.monthly`))) return null;
  return `מ-${esc(ils(Math.min(...TEDER_PLANS.map(([, k]) => cfg.get(`${k}.monthly`)))))} לחודש, ${vatOf(cfg)}`;
}

// Teder's price in one sentence, for /join, the questions, the home page's door, the terms and the sign-up buttons:
// each plan's monthly price and slideshows, VAT, then each plan's setup fee. Every number from the config.
export function tederPriceLine(cfg) {
  const fees = TEDER_PLANS.map(([, k, , inIt]) => {
    const fee = cfg.get(`${k}.setup`);
    return fee == null ? cfg.ph(`${k}.setup`) : fee === 0 ? `אין ${inIt}` : `${esc(ils(fee))} ${inIt}`;
  });
  const none = TEDER_PLANS.every(([, k]) => cfg.get(`${k}.setup`) === 0);
  const each = TEDER_PLANS.map(([, k]) => `${amount(cfg, `${k}.monthly`)} לחודש ל-${count(cfg, `${k}.slideshows`)} מצגות`);
  return `${each.join(', או ')}, ${vatOf(cfg)}. ${none ? 'אין דמי הקמה.' : `דמי ההקמה, פעם אחת: ${fees.join(', ו-')}.`}`;
}

// How a business pays for Teder once it has signed up (payment in site.config.json): until a payment provider is
// connected we email the details (sign-up asks for an email and no phone) and Teder opens once the payment reaches us;
// once one is, by card on the payment page in the account, and Teder opens once the payment is confirmed (accounts'
// paywall opens a product only for a payment that covers today).
export const payLine = (cfg) => (payProvider(cfg)
  ? 'משלמים מראש לכל חודש, בכרטיס אשראי, בעמוד התשלום שבחשבון שלכם. תדר נפתח כשהתשלום מאושר.'
  : 'אחרי שפותחים את החשבון, אנחנו שולחים לכם את פרטי התשלום במייל. משלמים מראש לכל חודש, ותדר נפתח כשהתשלום מגיע אלינו.');
// The setup fee, as the self-serve terms say it (legal.mjs tederSub): beside the plans while sign-up is open. Closed, the
// terms say Toran's rule (not refunded once we started building), so the plans say nothing more than the fee.
export const NO_REFUND = 'דמי ההקמה לא מוחזרים.';

// While sign-up is open (signup in site.config.json): Teder's way in, the button to accounts' sign-up with the price
// beside it, and, for who wants to see one first, the way to the free sample. sample: where the sample form is (null
// when it follows right after, as on /join). cls: the button's classes, for the violet fields. more: buttons that sit
// in the same row (the home page's door), whose row then takes the class act.
export const SIGNUP_LABEL = 'להצטרף לתדר';
export const sampleLine = (href) => `<p class="start-alt">רוצים קודם לראות מצגת מהחנות שלכם? <a href="${href}">לבקש מצגת לדוגמה</a></p>`;
export const tederStart = (cfg, { sample, cls = 'btn primary', wrap = 'start', more = '', act = 'start-act', price = true } = {}) => `<div class="${wrap}">
${more ? `<div class="${act}">` : ''}<a class="${cls}" href="${SIGNUP_URL}">${SIGNUP_LABEL}</a>${more ? `${more}</div>` : ''}
${price ? `<p class="start-price">${tederPriceLine(cfg)}</p>` : ''}
${sample ? sampleLine(sample) : ''}</div>`;

// Toran's way in once it is live and sign-up is open: the same button to accounts' sign-up, its price, and the demo
// for who wants to see Toran answer on their own store first.
export const TORAN_SIGNUP_LABEL = 'להצטרף לתורן';
export const toranStart = (cfg, { demo, cls = 'btn primary', wrap = 'start', more = '', act = 'start-act', price = true } = {}) => `<div class="${wrap}">
${more ? `<div class="${act}">` : ''}<a class="${cls}" href="${signupUrl('toran')}">${TORAN_SIGNUP_LABEL}</a>${more ? `${more}</div>` : ''}
${price ? `<p class="start-price">${toranPriceLine(cfg)}</p>` : ''}
${demo ? `<p class="start-alt">רוצים קודם לראות אותו עונה על החנות שלכם? <a href="${demo}">לנסות את תורן על החנות שלכם</a></p>` : ''}</div>`;

// The first screens (the home page's doors, a product page's top): sign-up and two more buttons; on a product's page no
// price, which waits on the price card, and on the home page's Teder door the price line under them (home.mjs), since
// that screen sells Teder. The demo shows the product working; the sample (Teder) or the demo form (Toran) is the
// store's own.
export const TEDER_DEMO = 'לראות דמו';
export const TEDER_SAMPLE = 'מצגת לדוגמה מהחנות שלכם';
export const TORAN_DEMO = 'לראות דמו';
export const TORAN_TRY = 'לנסות על החנות שלכם';

// How to stop, once the terms are set: the commitment, the last month, and (Toran) the number and the conversations.
function termsLine(cfg, toran) {
  const n = cfg.get('price.commitmentMonths');
  const stops = cfg.get('price.stops');
  if (!((n != null && stops) || cfg.banner)) return '';
  const stopWords = stops === 'period-end' ? 'החיוב נעצר בסוף החודש שכבר שולם' : stops === 'immediately' ? 'החיוב נעצר מאותו יום' : cfg.ph('price.stops');
  // Teder bought through sign-up is cancelled in the account, not by writing to us.
  const write = !toran && signupOpen(cfg) ? 'מבטלים בחשבון, בכל זמן' : waWords(cfg, 'כותבים לנו');
  const commit = n == null ? cfg.ph('price.commitmentMonths') : n === 0 ? 'אין התחייבות, משלמים חודש בחודש.' : `ההתחייבות היא ל-${n} חודשים.`;
  const stop = n > 0 ? 'אחרי זה, כדי להפסיק' : 'כדי להפסיק';
  return toran && stops === 'period-end'
    ? `${commit} ${stop}, ${write}. תורן עונה עד סוף החודש האחרון ששילמתם. ${afterStop(cfg)}`
    : `${commit} ${stop}, ${write}, ו${stopWords}.`;
}

// Teder's two plans, every number from site.config.json (teder.small and teder): a card each with its monthly price,
// its slideshows and redos and its setup fee, and while sign-up is open that the fee is not refunded (NO_REFUND) and its
// own button to accounts' sign-up with that plan picked (&plan=small or full); then what both include, beside how paying works and, with sign-up closed, the way
// in (cta); and the terms line. alt: a line under it (the sample). Left out of the public draft until both prices are set.
export function tederPricing(cfg, { includes, notes = [], cta = null, alt = '', id = 'price' }) {
  if (!TEDER_PLANS.every(([, k]) => cfg.has(`${k}.monthly`)) && !cfg.banner) return '';
  const open = signupOpen(cfg);
  const card = ([plan, k, name, inIt]) => {
    const fee = cfg.get(`${k}.setup`);
    return `<article class="plan glass">
<h3 class="plan-name">${name}</h3>
<p class="figure"><span class="num">${count(cfg, `${k}.monthly`)}</span><span class="cur">₪</span><span class="per">לחודש</span></p>
<p class="plan-vat">${vatOf(cfg)}</p>
<p class="plan-cap"><b>${count(cfg, `${k}.slideshows`)}</b> מצגות מוצעות בחודש, ועד <b>${count(cfg, `${k}.redos`)}</b> החלפות</p>
<p class="plan-fee">${fee == null ? cfg.ph(`${k}.setup`) : fee === 0 ? 'אין דמי הקמה.' : `בחודש הראשון יש גם ${esc(ils(fee))} דמי הקמה, פעם אחת.${open ? ` ${NO_REFUND}` : ''}`}</p>
${open ? `<a class="btn primary" href="${esc(signupUrl('teder', plan))}">להצטרף ${inIt}</a>` : ''}
</article>`;
  };
  const terms = termsLine(cfg, false);
  return `
<section class="sec price-sec teder" id="${id}" aria-labelledby="${id}-h">
<div class="wrap">
<div class="sec-head"><h2 id="${id}-h">כמה זה עולה</h2><p class="lede">שתי חבילות, לפי מספר המצגות בחודש. כל השאר זהה בשתיהן.</p></div>
<div class="plans">${TEDER_PLANS.map(card).join('\n')}</div>
<p class="plan-more">צריכים יותר מ-${count(cfg, 'teder.slideshows')} מצגות בחודש? ${waWords(cfg, 'כתבו לנו בוואטסאפ')}.</p>
<div class="price-card plan-both glass">
<div class="price-incl">
<h3>מה יש בשתי החבילות</h3>
<ul class="checks">${includes.map((x) => `<li>${x}</li>`).join('')}</ul>
${notes.map((x) => `<p class="incl-note">${x}</p>`).join('')}
</div>
<div class="price-main">
<p class="price-name">${mark('teder', 36)}<b>תדר</b></p>
<p class="price-notes">${open ? payLine(cfg) : 'משלמים מראש לכל חודש.'}</p>
${cta ? `<a class="btn primary" href="${cta[0]}">${cta[1]}</a>` : ''}
${alt}</div>
</div>
${terms ? `<p class="terms-line">${terms}</p>` : ''}
</div>
</section>`;
}

// Toran's two plans, every number from site.config.json (price.plans, price.founding, price.fair, price.setup): a
// card each with its monthly price and the conversations it covers, the founding offer on the smaller one while it
// is on, the way to talk to us past the bigger one, what both include, and how a store moves between them. The number
// of conversations a month is the only thing that sets the plan: no credits, nothing charged per conversation.
// Left out of the public draft until both prices are set.
const PLANS = [
  ['store', 'חנות'],
  ['big', 'חנות גדולה'],
];
export function toranPricing(cfg, { includes, cta, id = 'price' }) {
  if (!PLANS.every(([k]) => cfg.has(`price.plans.${k}.monthly`)) && !cfg.banner) return '';
  const vat = vatOf(cfg);
  const offer = cfg.get('price.founding.on') === true
    ? `<p class="plan-offer"><b>הצעת מייסדים</b> ל-${count(cfg, 'price.founding.stores')} החנויות הראשונות שמצטרפות: ${amount(cfg, 'price.founding.monthly')} לחודש, ${said(cfg, 'price.founding.months', (n) => `ב-${n} החודשים הראשונים`)}.</p>`
    : '';
  const card = ([k, name]) => `<article class="plan glass${k === 'store' && offer ? ' has-offer' : ''}">
<h3 class="plan-name">${name}</h3>
<p class="figure"><span class="num">${count(cfg, `price.plans.${k}.monthly`)}</span><span class="cur">₪</span><span class="per">לחודש</span></p>
<p class="plan-vat">${vat}</p>
<p class="plan-cap">עד <b>${count(cfg, `price.plans.${k}.conversations`)}</b> שיחות בחודש</p>
${k === 'store' ? offer : ''}
</article>`;
  const fee = cfg.get('price.setup');
  const setupLine = fee == null ? cfg.ph('price.setup') : fee === 0 ? 'אין דמי הקמה.' : `בחודש הראשון יש גם ${esc(ils(fee))} דמי הקמה, פעם אחת, ${vat}.`;
  const fair = `חודש עמוס אחד לא עולה לכם יותר. רק אחרי ${said(cfg, 'price.fair.upMonths', months)} ברצף מעל החבילה, החנות עוברת לחבילה הגדולה, ואנחנו כותבים לכם בוואטסאפ ${said(cfg, 'price.fair.noticeDays', days)} לפני. אחרי ${said(cfg, 'price.fair.downMonths', months)} ברצף מתחת ל-${count(cfg, 'price.plans.store.conversations')} שיחות, היא חוזרת לחבילת חנות.`;
  const terms = termsLine(cfg, true);
  return `
<section class="sec price-sec toran" id="${id}" aria-labelledby="${id}-h">
<div class="wrap">
<div class="sec-head"><h2 id="${id}-h">כמה זה עולה</h2><p class="lede">שתי חבילות, לפי מספר השיחות בחודש. כל השאר זהה בשתיהן.</p></div>
<div class="plans">${PLANS.map(card).join('\n')}</div>
<p class="plan-more">יותר מ-${count(cfg, 'price.plans.big.conversations')} שיחות בחודש? ${waWords(cfg, 'כתבו לנו בוואטסאפ')}, ונבנה חבילה לפי החנות.</p>
<div class="price-card plan-both glass">
<div class="price-incl">
<h3>מה יש בשתי החבילות</h3>
<ul class="checks">${includes.map((x) => `<li>${x}</li>`).join('')}</ul>
</div>
<div class="price-main">
<p class="price-name">${mark('toran', 36)}<b>תורן</b></p>
<p class="price-notes">${setupLine} הדמו בחינם.</p>
<a class="btn primary" href="${cta[0]}">${cta[1]}</a>
</div>
</div>
<p class="plan-fair"><b>כשמספר השיחות משתנה.</b> ${fair}</p>
${terms ? `<p class="terms-line">${terms}</p>` : ''}
</div>
</section>`;
}

// Toran's price in one sentence, for /join and the questions: both plans, VAT, the setup fee, and
// the founding offer while it is on. Every number from the config.
export function toranPriceLine(cfg) {
  const fee = cfg.get('price.setup');
  const offer = cfg.get('price.founding.on') === true
    ? ` ל-${count(cfg, 'price.founding.stores')} החנויות הראשונות, חבילת חנות ב-${amount(cfg, 'price.founding.monthly')} לחודש ${said(cfg, 'price.founding.months', (n) => `ב-${n} החודשים הראשונים`)}.`
    : '';
  return `${amount(cfg, 'price.plans.store.monthly')} לחודש עד ${count(cfg, 'price.plans.store.conversations')} שיחות, או ${amount(cfg, 'price.plans.big.monthly')} לחודש עד ${count(cfg, 'price.plans.big.conversations')} שיחות, ${vatOf(cfg)}${fee == null ? `, ${cfg.ph('price.setup')}` : fee > 0 ? `, ועוד ${esc(ils(fee))} דמי הקמה, פעם אחת` : ''}.${offer}`;
}

// What happens after the last paid month: the number, and how long the conversations are kept.
function afterStop(cfg) {
  const d = cfg.get('price.keepDays');
  return `מספר הוואטסאפ של החנות נשאר שלכם, ואנחנו מנתקים אותו מהצד שלנו. את השיחות אנחנו שומרים עוד ${d == null ? cfg.ph('price.keepDays') : esc(d)} יום, כדי שתוכלו לייצא אותן, ואחר כך מוחקים אותן.`;
}
