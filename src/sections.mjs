// What more than one page uses: words that open WhatsApp to us, and the question box on the home page.
import { SIGNUP_URL, esc, ils, mark, signupOpen, signupUrl, toranSoon } from './lib.mjs';

// Words that open WhatsApp to us; plain words in a draft without the number.
export const waWords = (cfg, words) => {
  const wa = cfg.get('whatsapp');
  return wa ? `<a href="https://wa.me/${wa}">${words}</a>` : words;
};

// ---------------------------------------------------------------- ask it

// The question box, with Toran answering for OpenFrequency itself. The script answers each question from what this
// site says, the way Toran answers from a store's site, and every suggested question has an answer. Without script,
// the prefilled question keeps its answer, written here. While Toran is soon, the answer says what it will do.
const FIRST = {
  live: 'תורן עונה ללקוחות של החנות בוואטסאפ, באינסטגרם, במסנג׳ר ובמייל, מתוך מה שכתוב באתר שלה: מוצרים, מחירים, מלאי ודפי המדיניות. מה שלא כתוב שם, הוא שואל אתכם ומעביר את התשובה ללקוח.',
  soon: 'תורן יענה ללקוחות של החנות בוואטסאפ, באינסטגרם, במסנג׳ר ובמייל, מתוך מה שכתוב באתר שלה: מוצרים, מחירים, מלאי ודפי המדיניות. מה שלא כתוב שם, הוא ישאל אתכם. אנחנו פותחים אותו בקרוב.',
};
export const askBox = (cfg) => `
<figure class="chat try" data-ui aria-label="OpenFrequency, שיחה עם תורן">
<div class="chat-top">${mark('openfrequency', 38)}<span><b>OpenFrequency</b><small>תורן עונה</small></span><span class="tag">דוגמה</span></div>
<ol class="msgs" data-ask-out aria-live="polite">
<li class="msg me">מה תורן עושה?<time aria-hidden="true">עכשיו</time></li>
<li class="msg them">${FIRST[toranSoon(cfg) ? 'soon' : 'live']} <a class="lnk" href="/toran">לעמוד של תורן</a><time aria-hidden="true">עכשיו</time></li>
<li class="sys"><span class="ui-s alone">ענה לבד</span>מהעמוד של תורן</li>
</ol>
<div class="ask-ex" data-ask-ex hidden>
<button type="button">כמה זה עולה?</button>
<button type="button">מה זה תדר?</button>
<button type="button">איך מקבלים דמו?</button>
<button type="button">זה עובד עם Wix?</button>
<button type="button">ומה אם הוא טועה?</button>
</div>
<form class="ask-bar" data-ask-form hidden>
<label class="sr" for="ask-q">שאלה לתורן</label>
<input id="ask-q" type="text" placeholder="תכתבו שאלה" autocomplete="off" maxlength="80" enterkeyhint="send">
<button class="send" type="submit" aria-label="לשלוח"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12H5M11 6l-6 6 6 6"/></svg></button>
</form>
</figure>
`;

// While Toran is soon, the box's answers about Toran say what it will do, and send to its waitlist or to Teder instead of
// a demo: site.js takes each <template id="ask-a-KEY"> in place of its own answer to KEY.
const SOON_ANSWERS = {
  toran: 'תורן יענה ללקוחות של החנות בוואטסאפ, באינסטגרם, במסנג׳ר ובמייל, מתוך מה שכתוב באתר שלה. הוא עוד לא פתוח, ואנחנו פותחים אותו בקרוב. <a class="lnk" href="/toran#waitlist">לקבל עדכון כשהוא נפתח</a>',
  demo: 'לתורן אין דמו כרגע, כי הוא עוד לא פתוח. לתדר אפשר לקבל מצגת לדוגמה מהחנות שלכם: שולחים את הכתובת של החנות ומספר וואטסאפ, ואנחנו שולחים לכם אותה. <a class="lnk" href="/teder#demo">לנסות את תדר על החנות שלכם</a>',
  store: 'כן. תורן יקרא חנויות על Shopify, על WooCommerce ועל Wix, ובחנות על Wix את 150 המוצרים החדשים ביותר. הוא נפתח בקרוב.',
  number: 'כן, זו הכוונה. כשתורן ייפתח, הלקוחות ימשיכו לכתוב לאותו מספר, ואנחנו נחבר אותו ל-WhatsApp Business Platform של Meta יחד איתכם.',
  install: 'לא צריך להתקין כלום. תורן קורא את מה שכבר מופיע באתר. כשהוא ייפתח, כדי לחבר את המספר של החנות יהיה צריך חשבון עסקי ב-Meta, ואת החיבור נעשה יחד.',
  night: 'כן. תורן יענה 24/7, ומה שהוא לא יודע יחכה לכם לבוקר. הוא נפתח בקרוב.',
  who: 'אנחנו OpenFrequency. בנינו את תדר, שכותב ומעצב מצגות בעברית לטיקטוק ולאינסטגרם, ואת תורן, שיענה ללקוחות של חנויות אונליין ונפתח בקרוב.',
  en: 'Toran will answer a store\'s customers on WhatsApp, Instagram, Messenger and email, from what\'s on the store\'s site, in Hebrew or in English. It opens soon. <a class="lnk" href="/toran#waitlist">Hear when it opens</a>',
};
export const askSoon = Object.entries(SOON_ANSWERS).map(([k, a]) => `<template id="ask-a-${k}">${a}</template>`).join('\n');

// ---------------------------------------------------------------- the price

const vatOf = (cfg) => (cfg.get('price.vat') === 'included' ? 'כולל מע״מ' : cfg.get('price.vat') === 'excluded' ? 'לא כולל מע״מ' : cfg.ph('price.vat'));
const amount = (cfg, key) => (cfg.get(key) == null ? cfg.ph(key) : esc(ils(cfg.get(key))));
const count = (cfg, key) => (cfg.get(key) == null ? cfg.ph(key) : esc(cfg.get(key).toLocaleString('he-IL')));
const months = (n) => (n === 1 ? 'חודש' : n === 2 ? 'חודשיים' : `${n} חודשים`);
const days = (n) => (n === 7 ? 'שבוע' : n === 14 ? 'שבועיים' : n === 1 ? 'יום' : `${n} ימים`);
const said = (cfg, key, words) => (cfg.get(key) == null ? cfg.ph(key) : esc(words(cfg.get(key))));

// Each product's price in one sentence: the monthly figure and the setup fee, VAT as the config says. For /join, the
// questions, the question box and Teder's sign-up button.
export function priceLine(cfg, monthly, setup) {
  const m = cfg.get(monthly), s = cfg.get(setup);
  const vat = cfg.get('price.vat') === 'included' ? 'כולל מע״מ' : cfg.get('price.vat') === 'excluded' ? 'לא כולל מע״מ' : cfg.ph('price.vat');
  return `${m == null ? cfg.ph(monthly) : esc(ils(m))} לחודש, ${vat}${s == null ? `, ${cfg.ph(setup)}` : s > 0 ? `, ועוד ${esc(ils(s))} דמי הקמה, פעם אחת` : ''}.`;
}

// While sign-up is open (signup in site.config.json): Teder's way in, the button to accounts' sign-up with the price
// beside it, and, for who wants to see one first, the way to the free sample. sample: where the sample form is (null
// when it follows right after, as on /join). cls: the button's classes, for the violet fields. more: buttons that sit
// in the same row (the home page's door), whose row then takes the class act.
export const SIGNUP_LABEL = 'להצטרף לתדר';
export const sampleLine = (href) => `<p class="start-alt">רוצים קודם לראות מצגת מהחנות שלכם? <a href="${href}">לבקש מצגת לדוגמה</a></p>`;
export const tederStart = (cfg, { sample, cls = 'btn primary', wrap = 'start', more = '', act = 'start-act' } = {}) => `<div class="${wrap}">
${more ? `<div class="${act}">` : ''}<a class="${cls}" href="${SIGNUP_URL}">${SIGNUP_LABEL}</a>${more ? `${more}</div>` : ''}
<p class="start-price">${priceLine(cfg, 'teder.monthly', 'teder.setup')}</p>
${sample ? sampleLine(sample) : ''}</div>`;

// Toran's way in once it is live and sign-up is open: the same button to accounts' sign-up, its price, and the demo
// for who wants to see Toran answer on their own store first.
export const TORAN_SIGNUP_LABEL = 'להצטרף לתורן';
export const toranStart = (cfg, { demo, cls = 'btn primary', wrap = 'start', more = '', act = 'start-act' } = {}) => `<div class="${wrap}">
${more ? `<div class="${act}">` : ''}<a class="${cls}" href="${signupUrl('toran')}">${TORAN_SIGNUP_LABEL}</a>${more ? `${more}</div>` : ''}
<p class="start-price">${toranPriceLine(cfg)}</p>
${demo ? `<p class="start-alt">רוצים קודם לראות אותו עונה על החנות שלכם? <a href="${demo}">לנסות את תורן על החנות שלכם</a></p>` : ''}</div>`;

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

// Teder's price, in the serious register, on one card: the monthly figure, VAT and the setup fee, the way to try it,
// and beside them what the price includes. monthly and setup are the facts' keys (teder.monthly, teder.setup);
// product is { name, label, includes: [html], notes?: [html], cta: [href, text], alt?: html under the button }. Left out of the public draft until
// the monthly price is set; the terms line waits for its own facts the same way.
export function priceSection(cfg, { monthly, setup, product, id = 'price' }) {
  if (!cfg.has(monthly) && !cfg.banner) return '';
  const fee = cfg.get(setup);
  const setupLine = fee == null ? cfg.ph(setup) : fee === 0 ? 'אין דמי הקמה.' : `בחודש הראשון יש גם ${esc(ils(fee))} דמי הקמה, פעם אחת.`;
  const figure = cfg.get(monthly) == null ? cfg.ph(monthly) : esc(cfg.get(monthly).toLocaleString('he-IL'));
  const terms = termsLine(cfg, false);
  return `
<section class="sec price-sec ${product.name}" id="${id}" aria-labelledby="${id}-h">
<div class="wrap">
<div class="sec-head"><h2 id="${id}-h">כמה זה עולה</h2></div>
<div class="price-card glass">
<div class="price-main">
<p class="price-name">${mark(product.name, 36)}<b>${product.label}</b></p>
<p class="figure"><span class="num">${figure}</span><span class="cur">₪</span><span class="per">לחודש</span></p>
<p class="price-notes">${vatOf(cfg)}. ${setupLine}</p>
<a class="btn primary" href="${product.cta[0]}">${product.cta[1]}</a>
${product.alt || ''}</div>
<div class="price-incl">
<h3>מה כלול במחיר</h3>
<ul class="checks">${product.includes.map((x) => `<li>${x}</li>`).join('')}</ul>
${(product.notes || []).map((x) => `<p class="incl-note">${x}</p>`).join('')}
</div>
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

// Toran's price in one sentence, for /join, the questions and the question box: both plans, VAT, the setup fee, and
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
