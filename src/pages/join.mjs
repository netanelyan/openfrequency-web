// The join page, for a store that hasn't picked a product yet: Toran, Teder or both on one form; what happens after it
// is sent; three of the owners' questions; the price, once it is set; and the way in for stores already with us. The
// forms at the end of /toran and /teder stay, for a visitor already on a product's page.
import { esc, ils } from '../lib.mjs';
import { joinForm } from '../forms.mjs';
import { TORAN } from './faq.mjs';

const TOOLS = 'https://accounts.openfrequency.co.il/';

const AFTER = [
  ['אנחנו בונים לכם דמו מהאתר', 'תורן שעונה בתור החנות שלכם, מתוך המוצרים ודפי המדיניות שבאתר, או מצגת לדוגמה של תדר מהחנות שלכם.'],
  ['הלינק מגיע לוואטסאפ', 'לאותו מספר שמילאתם בטופס.'],
  ['מנסים, ומחליטים', 'לתורן כותבים כמו לקוח ורואים מה הוא עונה. אם זה מתאים לכם, מחברים יחד את המספר של החנות. בתדר מאשרים את המצגת הראשונה, והוא ממשיך משם.'],
];

const ASKED = ['הלקוחות שלי יראו את הדמו?', 'צריך להתקין משהו בחנות?', 'החנות שלי על Wix. זה יעבוד?'];

// Toran's monthly price, once it is set; Teder's isn't a fact on the site yet, so it isn't named.
function price(cfg) {
  if (!cfg.has('price.monthly') && !cfg.banner) return '';
  const vat = cfg.get('price.vat');
  const vatWords = vat === 'included' ? 'כולל מע״מ' : vat === 'excluded' ? 'לא כולל מע״מ' : cfg.ph('price.vat');
  const monthly = cfg.get('price.monthly');
  return `
<section class="sec" aria-labelledby="join-price-h">
<div class="wrap narrow">
<h2 id="join-price-h">כמה זה עולה</h2>
<p class="lede">תורן עולה ${monthly == null ? cfg.ph('price.monthly') : esc(ils(monthly))} לחודש, ${vatWords}. מה שכלול במחיר, ואיך מפסיקים, כתובים <a href="/toran#price">בעמוד של תורן</a>.</p>
</div>
</section>`;
}

export default (cfg) => {
  const faq = TORAN(cfg).filter((x) => x && ASKED.includes(x[0]));
  return {
    path: '/join',
    forms: true,
    title: 'הצטרפות | OpenFrequency',
    description: 'בוחרים בתורן, בתדר או בשניהם, משאירים את הכתובת של החנות ומספר וואטסאפ, ואנחנו בונים לכם דמו מהאתר.',
    body: `
<section class="sec join-hero" aria-labelledby="hero-h">
<div class="wrap narrow">
<h1 id="hero-h">מתחילים עם תורן, עם תדר, או עם שניהם</h1>
<p class="lede">בוחרים במה להתחיל, משאירים את הכתובת של החנות ומספר וואטסאפ, ואנחנו בונים לכם דמו מהאתר שלכם.</p>
${joinForm(cfg)}
<p class="join-tools">כבר עובדים איתנו? <a href="${TOOLS}">לניהול הכלים</a></p>
</div>
</section>

<section class="sec" aria-labelledby="after-h">
<div class="wrap narrow">
<h2 id="after-h">מה קורה אחרי הטופס</h2>
<ol class="after-steps">
${AFTER.map(([h, p]) => `<li><h3>${h}</h3><p>${p}</p></li>`).join('\n')}
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
