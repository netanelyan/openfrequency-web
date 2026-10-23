// Toran's page, built around where customers write: one agent and one inbox, whichever channel the customer picks.
// The headline, a button down to the demo form, and the tabs with the window that changes with them, the same question
// and answer in each; the owner's one inbox; what it answers alone and what it leaves for you; the price; and the demo
// form at the end.
// Which channels Toran answers in comes from Toran's /channels.json, or site.config.json (toran.channels) when Toran
// doesn't answer (build.mjs); every sentence that names them is built from
// it, so the page never says a channel works before it does. The owners' questions are on /faq.
import { CHANNELS, mark } from '../lib.mjs';
import { NAMES, channelWindow, inbox } from '../channels.mjs';
import { demoForm } from '../forms.mjs';
import { priceSection } from '../sections.mjs';

// "בוואטסאפ, באינסטגרם ובמייל": each name after ב, the last one after ו.
const inList = (ids) => {
  const b = ids.map((c) => 'ב' + NAMES[c]);
  return b.length < 2 ? b.join('') : `${b.slice(0, -1).join(', ')} ו${b.at(-1)}`;
};

// What it answers alone comes from the shapes of question in Toran's eval (openfrequency-toran, docs/milestones.md,
// milestone 3); what it leaves to the owner is what that eval checks it hands off.
const ALONE = [
  'מחיר, מבצע ומלאי של מוצר, ישר מדף המוצר',
  'מידות, צבעים ומה שכתוב בתיאור',
  'משלוחים, החזרות ותשלום, לפי דפי המדיניות שבאתר',
  'אם יש בחנות מוצר מסוים',
  'לקוחות שכותבים באנגלית',
];
const YOURS = [
  'שאלה שאין עליה תשובה באתר',
  'בקשה להנחה או להחזר כספי',
  'איפה הזמנה מסוימת נמצאת',
];
const rows = (items, cls = '') => `<ul class="rows${cls ? ' ' + cls : ''}">${items.map((s) => `<li><span class="dot" aria-hidden="true"></span><span>${s}</span></li>`).join('')}</ul>`;

export default (cfg) => {
  const on = new Set(cfg.get('toran.channels') || []);
  const live = CHANNELS.filter((c) => on.has(c));
  const soon = CHANNELS.filter((c) => !on.has(c));
  const where = `${inList(live)}${soon.length ? `, ובקרוב גם ${inList(soon)}` : ''}`;
  return {
    path: '/toran',
    forms: true,
    dock: true,
    title: 'תורן, עונה ללקוחות של החנות שלכם | OpenFrequency',
    description: `תורן עונה ללקוחות של החנות 24/7, מתוך מה שכתוב באתר. היום ${where}.`,
    body: `
<section class="hero ch-hero" aria-labelledby="hero-h">
<div class="wrap">
<div class="hero-head">${mark('toran', 72, 'תורן')}<h1 id="hero-h"><span class="hl">תורן אחד</span> עונה ללקוחות שלכם ${where}</h1></div>
<div class="hero-text">
<p class="lede">תורן קורא את האתר של החנות ועונה ללקוחות <span class="hl" dir="ltr">24/7</span>, מתוך מה שכתוב בו. בכל מקום שכותבים לו, הוא עונה אותו דבר, כי זו אותה חנות.</p>
<a class="btn primary hero-cta" href="#demo">לנסות את תורן על החנות שלכם</a>
</div>
${channelWindow(cfg)}
</div>
</section>

<section class="sec" id="inbox" aria-labelledby="inbox-h">
<div class="wrap side">
<div>
<h2 id="inbox-h">כל השיחות בתיבה אחת</h2>
<p class="lede">מה שלקוחות כותבים ${inList(CHANNELS)} מגיע לרשימה אחת אצלכם. ליד כל שיחה רואים מאיפה היא הגיעה ומה קרה איתה: תורן ענה לבד, היא מחכה לכם, או שתיקנתם והוא למד.</p>
${soon.length ? `<p class="quiet">זו דוגמה. התיבה עוד בבנייה, והיום תורן עונה ${inList(live)}.</p>` : ''}
</div>
<div class="stage glass">${inbox()}</div>
</div>
</section>

<section class="sec" id="alone" aria-labelledby="alone-h">
<div class="wrap">
<div class="sec-head"><h2 id="alone-h">מה הוא עונה לבד, ומה הוא משאיר לכם</h2></div>
<div class="two">
<div><h3>עונה לבד</h3>${rows(ALONE)}</div>
<div><h3>משאיר לכם</h3>${rows(YOURS, 'yours')}<p class="quiet">כשאין באתר תשובה, הוא אומר ללקוח שהוא בודק, במקום לנחש, ושולח לכם את השאלה. מה שתענו הוא יזכור לפעם הבאה.</p></div>
</div>
<p class="more">יש לכם עוד שאלות? <a href="/faq">כל השאלות והתשובות</a></p>
</div>
</section>
${priceSection(cfg, { monthly: 'price.monthly', setup: 'price.setup' })}
<section class="sec close-sec" aria-labelledby="demo-h">
<div class="wrap narrow">
<h2 id="demo-h">לנסות את תורן על החנות שלכם</h2>
<p class="lede">שולחים לנו את הכתובת של החנות, ואנחנו בונים דמו מהמוצרים ומדפי המדיניות שבאתר. כותבים לו כמו לקוח, ורואים מה הוא עונה.</p>
${demoForm(cfg, '/toran')}
</div>
</section>`,
  };
};
