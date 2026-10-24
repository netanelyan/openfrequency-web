// The home page: OpenFrequency and its two products. The first screen says what we make, with our mark large and
// faint behind it, and opens a door to each product in its own material: Toran's chat answering on glass, Teder's
// real slides playing on its violet. Then what holds for every store, the businesses that work with us, what we do in a
// store like yours, Toran as the owner's assistant, and Toran answering questions about us. Each product has its own
// page (/toran, /teder), and the questions have theirs (/faq).
import { mark, glyphOnly } from '../lib.mjs';
import { chat } from '../chat.mjs';
import { askBox } from '../sections.mjs';
import { priceLine } from './join.mjs';
import { reel } from '../teder.mjs';
import { clients } from '../clients.mjs';
import { niches } from '../niches.mjs';

// Toran's door: the sample chat on the customer's phone. The first question it answers from the site; the second
// isn't there, so it tells the customer it's checking, and the question pops up on the owner's phone.
const DOOR_CHAT = [
  ['me', '02:14', 'היי, יש את שמלת הפשתן הירוקה במידה M?'],
  ['them', '02:14', 'יש, נשארו 2 במידה M. היא 289 ₪, והמשלוח לוקח 3 עד 5 ימי עסקים.'],
  ['me', '02:16', 'ואפשר לאסוף מהמחסן?'],
  ['them', '02:16', 'את זה אני לא יודע. אני בודק עם החנות, ואחזור אליך כאן.'],
];

const hero = `
<section class="co-hero" aria-labelledby="hero-h">
<div class="co-bg" aria-hidden="true">${glyphOnly('openfrequency')}</div>
<div class="wrap">
<h1 id="hero-h">פלטפורמות יצירת התוכן ושירות הלקוחות <span class="hl">המובילות בארץ</span></h1>
<p class="lede">תדר כותב ומעצב לכם מצגות בעברית לטיקטוק ולאינסטגרם. תורן עונה ללקוחות שלכם בוואטסאפ 24/7, מתוך מה שכתוב באתר.</p>
<div class="doors">
<article class="door toran-door glass" aria-labelledby="door-toran">
<div class="door-top">${mark('toran', 48)}<div><h2 id="door-toran">תורן</h2><p>עונה ללקוחות של החנות בוואטסאפ, מתוך מה שכתוב באתר. מה שלא כתוב שם, הוא שואל אתכם.</p></div></div>
<div class="door-act"><a class="btn primary" href="/toran#demo">לנסות את תורן על החנות שלכם</a><a class="btn" href="/toran">עוד על תורן</a></div>
<div class="phone-sit" data-play>
<div class="phone">${chat({ id: 'door-chat', who: 'החנות שלכם', face: 'ח', msgs: DOOR_CHAT, names: { me: 'לקוח', them: 'החנות' } })}</div>
<p class="pop" data-pop>${mark('toran', 28)}<span class="pop-h"><b>תורן</b><small>בטלפון שלכם, 02:16</small></span><span class="pop-t">לקוח שואל אם אפשר לאסוף מהמחסן. זה לא כתוב באתר. מה לענות לו?</span></p>
</div>
</article>
<article class="door teder-door" aria-labelledby="door-teder">
<div class="door-top"><span class="wave" aria-hidden="true">${glyphOnly('teder')}</span><div><h2 id="door-teder">תדר</h2><p>כותב ומעצב מצגות בעברית לטיקטוק ולאינסטגרם. כל מצגת יוצאת רק אחרי שמישהו אישר אותה.</p></div></div>
<div class="door-act"><a class="btn light" href="/teder#demo">לנסות את תדר על החנות שלכם</a><a class="btn on-color" href="/teder">עוד על תדר</a></div>
${reel}
</article>
</div>
</div>
</section>`;

const ask = (cfg) => `
<section class="sec ask-sec" id="ask" aria-labelledby="ask-h">
<div class="wrap">
<div class="try-text">
<h2 id="ask-h">תשאלו את תורן עלינו</h2>
<p class="lede">כאן תורן עונה בשביל OpenFrequency, מתוך מה שכתוב באתר הזה. בחנות שלכם הוא יענה ככה מתוך האתר שלכם.</p>
<p>תורן לא ממציא תשובות. כל מה שהוא עונה כתוב באתר, ומה שלא כתוב שם, הוא שואל אתכם.</p>
<p class="ask-note">זו הדגמה בדפדפן, עם תשובות שכתבנו מראש מתוך האתר הזה.</p>
</div>
${askBox}
${cfg.has('price.monthly') && cfg.has('teder.monthly') ? `<template id="ask-price">תורן עולה ${priceLine(cfg, 'price.monthly', 'price.setup')} תדר עולה ${priceLine(cfg, 'teder.monthly', 'teder.setup')}</template>` : ''}
</div>
</section>`;

// Before the businesses that work with us: what holds for every store, said once, each a thing the products do.
const BADGES = [
  ['clock', 'עונה ללקוחות 24/7'],
  ['doc', 'עונה רק מתוך האתר שלכם'],
  ['check', 'תדר מפרסם רק מה שאישרתם'],
  ['lock', 'המידע של כל חנות נשאר רק אצלה'],
  ['gift', 'דמו חינם על החנות שלכם'],
];
const BADGE_ICON = {
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  doc: '<path d="M7 3.5h7l4 4V20a.5.5 0 0 1-.5.5h-10A.5.5 0 0 1 7 20z"/><path d="M14 3.5V8h4M9.5 12.5h5M9.5 16h5"/>',
  check: '<circle cx="12" cy="12" r="8.5"/><path d="M8 12.5l2.7 2.7L16 9.8"/>',
  lock: '<rect x="5.5" y="10.5" width="13" height="9.5" rx="2"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/>',
  gift: '<rect x="4.5" y="9" width="15" height="11" rx="1.5"/><path d="M4.5 13h15M12 9v11M12 9c-1.5-3.5-5-3.5-5-1.2C7 9 12 9 12 9zm0 0c1.5-3.5 5-3.5 5-1.2C17 9 12 9 12 9z"/>',
};
const trust = () => `
<section class="trust-sec" aria-label="מה מובטח בכל חנות">
<ul class="trust wrap">${BADGES.map(([ic, t]) => `<li><svg viewBox="0 0 24 24" aria-hidden="true">${BADGE_ICON[ic]}</svg><span>${t}</span></li>`).join('')}</ul>
</section>`;

// Toran for the owner (openfrequency-toran src/assistant): the owner writes to Toran from their own WhatsApp and asks
// about the store; Toran answers from the conversations and the site, and acts only after "כן".
const OWNER_CHAT = [
  ['me', '20:41', 'מה קרה היום?'],
  ['them', '20:41', 'היום פנו 23 לקוחות: 17 בוואטסאפ, 4 באינסטגרם ו-2 במייל. עניתי לבד ל-21. שתי שאלות מחכות לכם.'],
  ['me', '20:42', 'מה שאלו?'],
  ['them', '20:42', 'לקוחה באינסטגרם שואלת אם אפשר לאסוף מהמחסן באשדוד. לקוח בוואטסאפ שואל אם השמלה הירוקה תחזור למלאי.'],
  ['me', '20:43', 'תעני לה שאפשר לאסוף בתיאום מראש'],
  ['them', '20:43', 'אשלח לה: "אפשר לאסוף מהמחסן באשדוד, בתיאום מראש." לשלוח?'],
  ['me', '20:43', 'כן'],
  ['them', '20:43', 'נשלח. שמרתי את התשובה, ובפעם הבאה אענה על זה לבד.'],
];
const assistant = () => `
<section class="sec owner-sec" id="owner" aria-labelledby="owner-h">
<div class="wrap owner-grid">
<div class="owner-text">
<p class="kicker">העוזר האישי שלכם</p>
<h2 id="owner-h">תורן עונה גם <span class="hl">לכם</span></h2>
<p class="lede">כתבו לתורן מהוואטסאפ שלכם, והוא עונה לכם על החנות: מי פנה, מה שאלו, ומה מחכה לכם. הוא עושה משהו רק אחרי שכתבתם לו כן.</p>
<ul class="checks">
<li><b>מה קרה היום.</b> כמה לקוחות פנו, בכל ערוץ, ועל כמה הוא ענה לבד.</li>
<li><b>מה מחכה לכם.</b> השאלות שהוא העביר אליכם, עם הלקוח שמחכה לתשובה.</li>
<li><b>עונים דרכו.</b> אומרים לו מה לענות, והוא שולח ללקוח רק אחרי שכתבתם כן. את התשובה הוא זוכר לפעם הבאה.</li>
<li><b>על מה שואלים.</b> המוצרים שלקוחות שאלו עליהם הכי הרבה, ומה מהם אזל מהמלאי.</li>
</ul>
</div>
<div class="phone owner-phone">${chat({ id: 'owner-chat', who: 'תורן', sub: 'העוזר שלכם', face: mark('toran', 38), msgs: OWNER_CHAT, names: { me: 'אתם', them: 'תורן' } })}</div>
</div>
</section>`;

export default (cfg) => ({
  path: '/',
  dock: true,
  title: 'OpenFrequency, תורן ותדר',
  description: 'תדר כותב ומעצב מצגות בעברית לטיקטוק ולאינסטגרם. תורן עונה ללקוחות של החנות בוואטסאפ 24/7, מתוך מה שכתוב באתר.',
  // "Who we are" is in the footer (layout.mjs), on every page.
  body: [hero, trust(), clients(), niches(), assistant(), ask(cfg)].join('\n'),
});
