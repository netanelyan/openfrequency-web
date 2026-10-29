// The join page, for a store that hasn't picked a product yet: Toran, Teder or both on one form; what happens after it
// is sent; three of the owners' questions; the price, once it is set; and the way in for stores already with us. The
// forms at the end of /toran and /teder stay, for a visitor already on a product's page.
// While Toran is soon (products.toran in site.config.json), the page is Teder's: Toran's card is there, marked
// "בקרוב", and can't be ticked; the steps, the price and the questions are Teder's, with the way to Toran's waitlist.
// While sign-up is open (signup in site.config.json), Teder's first action is the button to accounts' sign-up with its
// price, the form follows as the second way, for a store that wants to see a sample slideshow first, and the steps are
// sign-up's. With Toran live, the form stays first and Teder's sign-up button follows it.
// Until a payment provider is connected (payment in site.config.json), sign-up's first step says we send the payment
// details by WhatsApp or email once the account is open; with "online", that it is paid in the account.
import { mark, payOnline, signupOpen, tederNets, toranSoon } from '../lib.mjs';
import { joinForm } from '../forms.mjs';
import { tederPriceLine, tederStart, toranPriceLine, toranStart } from '../sections.mjs';
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

// After sign-up, Teder's own setup (openfrequency-teder, the new-account flow: account, sources, samples, live).
const PAY_STEP = (cfg) => (payOnline(cfg)
  ? ['נרשמים ומשלמים', 'פותחים חשבון עם המייל שלכם, בוחרים חבילה, ומשלמים בו את החודש הראשון ואת דמי ההקמה.']
  : ['נרשמים ומשלמים', 'פותחים חשבון עם המייל שלכם ובוחרים חבילה. אנחנו שולחים לכם את פרטי התשלום בוואטסאפ או במייל, על החודש הראשון ועל דמי ההקמה.']);
const SIGNUP_STEPS = (cfg) => [
  PAY_STEP(cfg),
  ['בוחרים מקורות', 'תדר מחפש מקורות שמתאימים לחנות שלכם, ואתם בוחרים מהם את אלה שהוא יקרא.'],
  ['עוברים על המצגות לדוגמה', 'תדר מכין חמש מצגות מהמקורות שבחרתם, ואתם עוברים עליהן לפני שמשהו עולה.'],
  ['מעלים לאוויר', `מחברים ${tederNets(cfg, 'the')}, ומכאן המצגות מחכות לאישור שלכם במסך אחד.`],
];
// With Toran live and sign-up open: the steps for either product, since the visitor picks on accounts' page.
const SIGNUP_STEPS_BOTH = (cfg) => [
  payOnline(cfg)
    ? ['נרשמים ומשלמים', 'פותחים חשבון עם המייל שלכם, בוחרים תורן, תדר או שניהם, ומשלמים בחשבון.']
    : ['נרשמים ומשלמים', 'פותחים חשבון עם המייל שלכם ובוחרים תורן, תדר או שניהם. אנחנו שולחים לכם את פרטי התשלום בוואטסאפ או במייל.'],
  ['מקימים לפי הצעדים', 'בתורן מוסיפים את האתר של החנות ומחברים את הוואטסאפ. בתדר בוחרים מקורות ועוברים על המצגות לדוגמה.'],
  ['מתחילים לעבוד', 'תורן עונה ללקוחות, ותדר שולח לכם מצגות לאישור. הכול מנוהל מהחשבון שלכם.'],
];
const ASKED_SIGNUP = ['תדר יכול לפרסם משהו בלי שאישרתי?', 'מאיפה הוא לוקח את העובדות?', 'איך מבטלים את תדר?'];

function price(cfg) {
  const items = [['toran', 'תורן', 'price.plans.store.monthly', '/toran#price'], ['teder', 'תדר', 'teder.monthly', '/teder#price']]
    .filter(([name, , m]) => (cfg.has(m) || cfg.banner) && !(name === 'toran' && toranSoon(cfg)));
  if (!items.length) return '';
  return `
<section class="sec" aria-labelledby="join-price-h">
<div class="wrap narrow">
<h2 id="join-price-h">כמה זה עולה</h2>
<ul class="join-prices">
${items.map(([name, label, , href]) => `<li>${mark(name, 40)}<span><b>${label}</b><span>${name === 'toran' ? toranPriceLine(cfg) : tederPriceLine(cfg)}</span></span><a href="${href}">פרטים</a></li>`).join('\n')}
</ul>
</div>
</section>`;
}

export default (cfg) => {
  const soon = toranSoon(cfg);
  const open = signupOpen(cfg);
  // Sign-up is the first way in whenever it is open; the demo or sample form follows, for who wants to see one first.
  const signupFirst = open;
  const asked = open ? ASKED_SIGNUP : ASKED_SOON;
  const faq = soon ? TEDER(cfg).filter((x) => x && asked.includes(x[0])) : TORAN(cfg).filter((x) => x && ASKED.includes(x[0]));
  const ways = `${soon ? '<p class="join-tools">רוצים לדעת כשתורן נפתח? <a href="/toran#waitlist">לקבל עדכון</a></p>\n' : ''}<p class="join-tools">כבר עובדים איתנו? <a href="${TOOLS}">לניהול הכלים</a></p>`;
  const first = signupFirst ? `
<section class="sec join-hero" aria-labelledby="hero-h">
<div class="wrap narrow">
${soon ? `<h1 id="hero-h">מתחילים עם תדר</h1>
<p class="lede">פותחים חשבון ומקימים את תדר בעצמכם. בוחרים מקורות, עוברים על המצגות לדוגמה שהוא מכין, ומעלים לאוויר. תורן נפתח בקרוב.</p>
${tederStart(cfg, { wrap: 'start join-start' })}` : `<h1 id="hero-h">מתחילים עם תורן, עם תדר או עם שניהם</h1>
<p class="lede">פותחים חשבון ומקימים בעצמכם, לפי הצעדים.</p>
${toranStart(cfg, { wrap: 'start join-start' })}
${tederStart(cfg, { wrap: 'start join-start' })}`}
</div>
</section>

<section class="sec" id="sample" aria-labelledby="sample-h">
<div class="wrap narrow">
${soon ? `<h2 id="sample-h">רוצים קודם לראות מצגת מהחנות שלכם?</h2>
<p class="lede">משאירים את הכתובת של החנות ומספר וואטסאפ, ואנחנו מכינים לכם מצגת לדוגמה מהאתר שלכם.</p>` : `<h2 id="sample-h">רוצים קודם לראות דמו מהחנות שלכם?</h2>
<p class="lede">בוחרים במה, משאירים את הכתובת של החנות, ואנחנו בונים לכם דמו מהאתר שלכם.</p>`}
${joinForm(cfg)}
${ways}
</div>
</section>` : `
<section class="sec join-hero" aria-labelledby="hero-h">
<div class="wrap narrow">
${soon ? `<h1 id="hero-h">מתחילים עם תדר</h1>
<p class="lede">משאירים את הכתובת של החנות ומספר וואטסאפ, ואנחנו מכינים לכם מצגת לדוגמה מהאתר שלכם. תורן נפתח בקרוב.</p>` : `<h1 id="hero-h">מתחילים עם תורן, עם תדר, או עם שניהם</h1>
<p class="lede">בוחרים במה להתחיל, משאירים את הכתובת של החנות, ואנחנו בונים לכם דמו מהאתר שלכם.</p>`}
${joinForm(cfg)}
${open ? `<p class="join-tools">את תדר אפשר גם לפתוח לבד, בחשבון, בלי לחכות לדמו.</p>\n${tederStart(cfg, { wrap: 'start join-start' })}\n` : ''}${ways}
</div>
</section>`;
  return {
    path: '/join',
    forms: true,
    title: 'הצטרפות | OpenFrequency',
    description: signupFirst
      ? soon
        ? 'פותחים חשבון בתדר ומקימים אותו בעצמכם, או משאירים את הכתובת של החנות ומקבלים קודם מצגת לדוגמה מהאתר. תורן נפתח בקרוב.'
        : 'פותחים חשבון בתורן, בתדר או בשניהם ומקימים בעצמכם, או משאירים את הכתובת של החנות ומקבלים קודם דמו מהאתר.'
      : soon
        ? 'משאירים את הכתובת של החנות ומספר וואטסאפ, ואנחנו מכינים לכם מצגת לדוגמה של תדר מהאתר. תורן נפתח בקרוב.'
        : 'בוחרים בתורן, בתדר או בשניהם, משאירים את הכתובת של החנות, ואנחנו בונים לכם דמו מהאתר.',
    body: `${first}

<section class="sec" aria-labelledby="after-h">
<div class="wrap narrow">
<h2 id="after-h">${signupFirst ? 'מה קורה אחרי ההרשמה' : 'מה קורה אחרי הטופס'}</h2>
<ol class="after-steps">
${(signupFirst ? (soon ? SIGNUP_STEPS(cfg) : SIGNUP_STEPS_BOTH(cfg)) : soon ? AFTER_SOON : AFTER).map(([h, p]) => `<li><h3>${h}</h3><p>${p}</p></li>`).join('\n')}
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
