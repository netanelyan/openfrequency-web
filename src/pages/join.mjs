// The join page, for a store that hasn't picked a product yet: Toran, Teder or both on one form; what happens after it
// is sent; three of the owners' questions; the price, once it is set; and the way in for stores already with us. The
// forms at the end of /toran and /teder stay, for a visitor already on a product's page.
// While Toran is soon (products.toran in site.config.json), the page is Teder's: Toran's card is there, marked
// "בקרוב", and can't be ticked; the steps, the price and the questions are Teder's, with the way to Toran's waitlist.
import { esc, ils, mark, toranSoon } from '../lib.mjs';
import { joinForm } from '../forms.mjs';
import { toranPriceLine } from '../sections.mjs';
import { TEDER, TORAN } from './faq.mjs';

const TOOLS = 'https://accounts.openfrequency.co.il/';

const AFTER = [
  ['אנחנו בונים לכם דמו מהאתר', 'תורן שעונה בתור החנות שלכם, מתוך המוצרים ודפי המדיניות שבאתר, או מצגת לדוגמה של תדר מהחנות שלכם.'],
  ['הלינק מגיע לוואטסאפ', 'בתורן, למספר ששלח לנו את ההודעה עם הקוד. בתדר, למספר שמילאתם בטופס.'],
  ['מנסים, ומחליטים', 'לתורן כותבים כמו לקוח ורואים מה הוא עונה. אם זה מתאים לכם, מחברים יחד את המספר של החנות. בתדר מאשרים את המצגת הראשונה, והוא ממשיך משם.'],
];

const ASKED = ['הלקוחות שלי יראו את הדמו?', 'צריך להתקין משהו בחנות?', 'החנות שלי על Wix. זה יעבוד?'];

const AFTER_SOON = [
  ['אנחנו מכינים לכם מצגת לדוגמה מהאתר', 'מצגת של תדר מהחנות שלכם, בגודל של טיקטוק ושל אינסטגרם.'],
  ['המצגת מגיעה לוואטסאפ', 'למספר שמילאתם בטופס.'],
  ['מנסים, ומחליטים', 'אם זה מתאים לכם, מאשרים את המצגת הראשונה, ותדר ממשיך משם.'],
];
const ASKED_SOON = ['תדר יכול לפרסם משהו בלי שאישרתי?', 'מה נחשב מצגת?', 'מאיפה הוא לוקח את העובדות?'];

// Each product's price, a tile each: the monthly figure and the setup fee, VAT as the config says. A product whose price
// isn't set is left out of the public draft.
export function priceLine(cfg, monthly, setup) {
  const m = cfg.get(monthly), s = cfg.get(setup);
  const vat = cfg.get('price.vat') === 'included' ? 'כולל מע״מ' : cfg.get('price.vat') === 'excluded' ? 'לא כולל מע״מ' : cfg.ph('price.vat');
  return `${m == null ? cfg.ph(monthly) : esc(ils(m))} לחודש, ${vat}${s == null ? `, ${cfg.ph(setup)}` : s > 0 ? `, ועוד ${esc(ils(s))} דמי הקמה, פעם אחת` : ''}.`;
}
function price(cfg) {
  const items = [['toran', 'תורן', 'price.plans.store.monthly', null, '/toran#price'], ['teder', 'תדר', 'teder.monthly', 'teder.setup', '/teder#price']]
    .filter(([name, , m]) => (cfg.has(m) || cfg.banner) && !(name === 'toran' && toranSoon(cfg)));
  if (!items.length) return '';
  return `
<section class="sec" aria-labelledby="join-price-h">
<div class="wrap narrow">
<h2 id="join-price-h">כמה זה עולה</h2>
<ul class="join-prices">
${items.map(([name, label, m, s, href]) => `<li>${mark(name, 40)}<span><b>${label}</b><span>${name === 'toran' ? toranPriceLine(cfg) : priceLine(cfg, m, s)}</span></span><a href="${href}">פרטים</a></li>`).join('\n')}
</ul>
</div>
</section>`;
}

export default (cfg) => {
  const soon = toranSoon(cfg);
  const faq = soon ? TEDER(cfg).filter((x) => x && ASKED_SOON.includes(x[0])) : TORAN(cfg).filter((x) => x && ASKED.includes(x[0]));
  return {
    path: '/join',
    forms: true,
    title: 'הצטרפות | OpenFrequency',
    description: soon
      ? 'משאירים את הכתובת של החנות ומספר וואטסאפ, ואנחנו מכינים לכם מצגת לדוגמה של תדר מהאתר. תורן נפתח בקרוב.'
      : 'בוחרים בתורן, בתדר או בשניהם, משאירים את הכתובת של החנות, ואנחנו בונים לכם דמו מהאתר.',
    body: `
<section class="sec join-hero" aria-labelledby="hero-h">
<div class="wrap narrow">
${soon ? `<h1 id="hero-h">מתחילים עם תדר</h1>
<p class="lede">משאירים את הכתובת של החנות ומספר וואטסאפ, ואנחנו מכינים לכם מצגת לדוגמה מהאתר שלכם. תורן נפתח בקרוב.</p>` : `<h1 id="hero-h">מתחילים עם תורן, עם תדר, או עם שניהם</h1>
<p class="lede">בוחרים במה להתחיל, משאירים את הכתובת של החנות, ואנחנו בונים לכם דמו מהאתר שלכם.</p>`}
${joinForm(cfg)}
${soon ? '<p class="join-tools">רוצים לדעת כשתורן נפתח? <a href="/toran#waitlist">לקבל עדכון</a></p>\n' : ''}<p class="join-tools">כבר עובדים איתנו? <a href="${TOOLS}">לניהול הכלים</a></p>
</div>
</section>

<section class="sec" aria-labelledby="after-h">
<div class="wrap narrow">
<h2 id="after-h">מה קורה אחרי הטופס</h2>
<ol class="after-steps">
${(soon ? AFTER_SOON : AFTER).map(([h, p]) => `<li><h3>${h}</h3><p>${p}</p></li>`).join('\n')}
</ol>
</div>
</section>
${price(cfg)}
<section class="sec" aria-labelledby="join-faq-h">
<div class="wrap narrow">
<h2 id="join-faq-h">מה ששואלים אותנו לפני שמצטרפים</h2>
<div class="faq">
${faq.map(([q, a]) => `<details name="faq"><summary><span>${q}</span><span class="pm" aria-hidden="true"></span></summary><p>${a}</p></details>`).join('\n')}
</div>
<p class="more">יש לכם עוד שאלות? <a href="/faq">כל השאלות והתשובות</a></p>
</div>
</section>`,
  };
};
