// Toran's page, built around where customers write: one agent and one inbox, whichever channel the customer picks.
// The headline, a button down to the demo form, and the tabs with the window that changes with them, the same question
// and answer in each; the owner's one inbox; what it answers alone and what it leaves for you; what it is meant to pay
// back (payBack); the price; and the demo form at the end.
// Which channels Toran answers in is toran.channels in site.config.json, or Toran's own /channels.json when
// toran.channelsFrom is "toran" (build.mjs); every sentence that names them is built from it, so the page never says
// a channel works before it does. The owners' questions are on /faq.
// While Toran is soon (products.toran in site.config.json) the page shows what it will do: a "בקרוב" banner on top,
// every line in the future, no price, and the waitlist where the demo form was.
// The banner is its one line, without a link: the first screen's button, the page's one blue, goes to the same waitlist
// (the owner, 2026-11-06: "every screen should have one action ... main button should look the most important").
// On a phone (the owner, 2026-11-05: "too many things jump to the eyes at the same time") the first screen's line is its first sentence
// (the chat's note under the tabs says the rest: the same answer in every channel), the inbox's "זו דוגמה" is the tag on
// the inbox itself, and the first screen's button spans the width. The lists stay whole: their rows are short.
import { CHANNELS, mark, signupOpen, signupUrl, toranSoon } from '../lib.mjs';
import { channelWindow, inList, inbox, liveChannels } from '../channels.mjs';
import { demoForm, waitlistForm } from '../forms.mjs';
import { TORAN_SIGNUP_LABEL, TORAN_TRY, rowList, toranPricing, toranStart } from '../sections.mjs';

// What it answers alone comes from the shapes of question in Toran's eval (openfrequency-toran, docs/milestones.md,
// milestone 3); what it leaves to the owner is what that eval checks it hands off.
const ALONE = [
  'מחיר, מבצע ומלאי של מוצר, ישר מדף המוצר',
  'מידות, צבעים ומה שכתוב בתיאור',
  'משלוחים, החזרות ותשלום, לפי דפי המדיניות שבאתר',
  'אם יש בחנות מוצר מסוים',
  'לקוחות שכותבים באנגלית',
];
// An order's status Toran answers itself once the store's orders are connected (#orders); a change or a cancellation
// it hands on, as it does an order question it can't look up.
const YOURS = [
  'שאלה שאין עליה תשובה באתר',
  'בקשה להנחה או להחזר כספי',
  'בקשה לשנות הזמנה או לבטל אותה',
  'שאלה על הזמנה, כשמערכת ההזמנות לא מחוברת',
];

// What Toran is meant to pay back (the owner, 2026-11-06: each product an investment that comes back in customers and
// time, not only a cost), with no figure: right above the waitlist while it is soon, in the future, and right above the
// price once it is live. It answers at night and on Shabbat because nothing in openfrequency-toran holds a reply: its
// quiet time (src/core/clock.ts customerQuiet) is for the store's automatic messages alone (src/auto/send.ts).
const payBack = (soon) => `
<section class="sec ret-sec" id="return" aria-labelledby="return-h">
<div class="wrap narrow">
<h2 id="return-h">השקעה בחנות שלכם</h2>
<p class="ret-sub">מה תורן אמור להחזיר</p>
<p class="lede">שאלה שנשארת בלי תשובה עד הבוקר היא לפעמים קנייה שלא קרתה. ${soon ? 'תורן יענה מיד, גם בלילה ובשבת, מתוך מה שכתוב באתר, ויעביר' : 'תורן עונה מיד, גם בלילה ובשבת, מתוך מה שכתוב באתר, ומעביר'} אליכם רק את מה שצריך אתכם. ככה הוא אמור להחזיר את עצמו: בקניות שלא הולכות לאיבוד ובזמן שלכם שמתפנה.</p>
</div>
</section>`;

// The page while Toran is soon. The channels are the ones it will answer in, all four, with no "בקרוב" on each: the
// whole of Toran is.
const soonPage = (cfg) => {
  const where = inList(CHANNELS);
  return {
    path: '/toran',
    image: 'toran',
    forms: true,
    title: 'תורן נפתח בקרוב | OpenFrequency',
    description: `תורן יענה ללקוחות של החנות 24/7 ${where}, מתוך מה שכתוב באתר. הוא נפתח בקרוב.`,
    body: `
<section class="soon-bar" aria-labelledby="soon-h">
<div class="wrap">
<p id="soon-h"><span class="soon">בקרוב</span> <b>תורן עוד לא פתוח לחנויות.</b></p>
</div>
</section>

<section class="hero ch-hero" aria-labelledby="hero-h">
<div class="wrap">
<div class="hero-head">${mark('toran', 72, 'תורן')}<h1 id="hero-h"><span class="hl">תורן אחד</span> יענה ללקוחות שלכם ${where}</h1></div>
<div class="hero-text">
<p class="lede">תורן יקרא את האתר של החנות ויענה ללקוחות <span class="hl" dir="ltr">24/7</span>, מתוך מה שכתוב בו.<span class="desk"> בכל מקום שיכתבו לו, הוא יענה אותו דבר, כי זו אותה חנות.</span></p>
<a class="btn primary hero-cta" href="#waitlist">לקבל עדכון כשתורן נפתח</a>
</div>
${channelWindow(cfg, { all: true })}
</div>
</section>

<section class="sec" id="inbox" aria-labelledby="inbox-h">
<div class="wrap side">
<div>
<h2 id="inbox-h">כל השיחות בתיבה אחת</h2>
<p class="lede">מה שלקוחות יכתבו ${where} יגיע לרשימה אחת אצלכם. ליד כל שיחה תראו מאיפה היא הגיעה ומה קרה איתה: תורן ענה לבד, היא מחכה לכם, או שתיקנתם והוא למד.</p>
<p class="quiet desk">זו דוגמה של התיבה.</p>
</div>
<div class="stage glass">${inbox()}</div>
</div>
</section>

<section class="sec" id="alone" aria-labelledby="alone-h">
<div class="wrap">
<div class="sec-head"><h2 id="alone-h">מה הוא יענה לבד, ומה ישאיר לכם</h2></div>
<div class="two">
${rowList('יענה לבד', ALONE)}
${rowList('ישאיר לכם', YOURS, { cls: 'yours', after: '<p class="quiet">כשאין באתר תשובה, הוא יגיד ללקוח שהוא בודק, במקום לנחש, וישלח לכם את השאלה. מה שתענו הוא יזכור לפעם הבאה.</p>' })}
</div>
<p class="more">יש לכם עוד שאלות? <a href="/faq">כל השאלות והתשובות</a></p>
</div>
</section>
${payBack(true)}
<section class="sec close-sec" id="waitlist" aria-labelledby="waitlist-h">
<div class="wrap narrow">
<h2 id="waitlist-h">רוצים לדעת כשתורן נפתח?</h2>
<p class="lede">משאירים טלפון או מייל, ונכתוב לכם כשאפשר להתחיל. את המחיר נפרסם באותו זמן.</p>
${waitlistForm(cfg, '/toran')}
</div>
</section>`,
  };
};

export default (cfg) => {
  if (toranSoon(cfg)) return soonPage(cfg);
  const live = liveChannels(cfg);
  const soon = CHANNELS.filter((c) => !live.includes(c));
  const where = `${inList(live)}${soon.length ? `, ובקרוב גם ${inList(soon)}` : ''}`;
  return {
    path: '/toran',
    image: 'toran',
    forms: true,
    title: 'תורן, עונה ללקוחות של החנות שלכם | OpenFrequency',
    description: `תורן עונה ללקוחות של החנות 24/7, מתוך מה שכתוב באתר. היום ${where}.`,
    body: `
<section class="hero ch-hero" aria-labelledby="hero-h">
<div class="wrap">
<div class="hero-head">${mark('toran', 72, 'תורן')}<h1 id="hero-h"><span class="hl">תורן אחד</span> עונה ללקוחות שלכם ${where}</h1></div>
<div class="hero-text">
<p class="lede">תורן קורא את האתר של החנות ועונה ללקוחות <span class="hl" dir="ltr">24/7</span>, מתוך מה שכתוב בו.<span class="desk"> בכל מקום שכותבים לו, הוא עונה אותו דבר, כי זו אותה חנות.</span></p>
${signupOpen(cfg) ? toranStart(cfg, { wrap: 'start hero-cta', price: false, more: `<a class="btn" href="#demo">${TORAN_TRY}</a>` }) : '<a class="btn primary hero-cta" href="#demo">לנסות את תורן על החנות שלכם</a>'}
</div>
${channelWindow(cfg)}
</div>
</section>

<section class="sec" id="inbox" aria-labelledby="inbox-h">
<div class="wrap side">
<div>
<h2 id="inbox-h">כל השיחות בתיבה אחת</h2>
<p class="lede">מה שלקוחות כותבים ${inList(liveChannels(cfg))} מגיע לרשימה אחת אצלכם. ליד כל שיחה רואים מאיפה היא הגיעה ומה קרה איתה: תורן ענה לבד, היא מחכה לכם, או שתיקנתם והוא למד.</p>
${soon.length ? `<p class="quiet">זו דוגמה. התיבה עוד בבנייה, והיום תורן עונה ${inList(live)}.</p>` : ''}
</div>
<div class="stage glass">${inbox()}</div>
</div>
</section>

<section class="sec" id="alone" aria-labelledby="alone-h">
<div class="wrap">
<div class="sec-head"><h2 id="alone-h">מה הוא עונה לבד, ומה הוא משאיר לכם</h2></div>
<div class="two">
${rowList('עונה לבד', ALONE)}
${rowList('משאיר לכם', YOURS, { cls: 'yours', after: '<p class="quiet">כשאין באתר תשובה, הוא אומר ללקוח שהוא בודק, במקום לנחש, ושולח לכם את השאלה. מה שתענו הוא יזכור לפעם הבאה.</p>' })}
</div>
${/* What we can show, and nothing invented (PRODUCT.md, "Evidence on Hand"; TORAN-READINESS.md P1-17): the eval's own numbers (openfrequency-toran docs/milestones.md: 150 questions, no invented price reached a customer though the guard cut one, and the 40 that had to go to the store, 8 a store: no answer on the site, an order, a discount or refund, one prompt injection), the example page built by Toran, and that the support button on every page is Toran. A card of its own with the numbers to scan, not a loose paragraph under the lists (the owner, 2026-11-09: "text like this looks like it was added outside of an html tag. design it better"). */ ''}<div class="proof glass" role="group" aria-labelledby="proof-h">
<h3 id="proof-h">בדקנו את תורן על 5 חנויות אמיתיות</h3>
<dl class="proof-nums">
<div><dt>שאלות של לקוחות</dt><dd class="num">150</dd></div>
<div><dt>מחירים מומצאים שהגיעו ללקוח</dt><dd class="num">0</dd></div>
<div><dt>שאלות שהיה צריך להעביר לחנות, כמו בקשה להנחה או שאלה בלי תשובה באתר, והוא העביר במקום לנחש</dt><dd class="num">40<span> מתוך 40</span></dd></div>
</dl>
<p class="proof-more"><a href="/toran/example">כך נראה עמוד דמו שתורן בונה לחנות</a><span>כפתור שירות הלקוחות שבכל עמוד באתר הזה הוא תורן, שעונה בשבילנו.</span></p>
</div>
<p class="more">יש לכם עוד שאלות? <a href="/faq">כל השאלות והתשובות</a></p>
</div>
</section>
${/* Abandoned carts as a feature of their own (the owner, 2026-11-08: "add abandonded cart reminders as a feature"),
   as openfrequency-toran sends them (src/auto: one reminder a checkout, consent, quiet hours, none once paid) and
   reports them (src/auto/report.ts: carts reminded, recovered and the money, per month). Meta bills a WhatsApp
   reminder to the store itself, said plainly. */ ''}<section class="sec carts-sec" id="carts" aria-labelledby="carts-h">
<div class="wrap narrow">
<h2 id="carts-h">עגלה שננטשה, <span class="hl">חוזרת</span></h2>
<p class="lede">לקוח שהשאיר מוצרים בעגלה ולא שילם מקבל מתורן תזכורת אחת, בוואטסאפ או במייל, עם לינק ישר לעגלה שלו.</p>
<ul class="checks">
<li><b>רק למי שהסכים.</b> התזכורת יוצאת רק ללקוח שאישר לקבל מכם הודעות, ובכל אחת יש דרך להפסיק.</li>
<li><b>בשעה סבירה.</b> לא בלילה, לא בשבת ולא בחג. היא מחכה לבוקר.</li>
<li><b>מי ששילם, לא מקבל.</b> אם ההזמנה נסגרה בינתיים, שום דבר לא יוצא.</li>
<li><b>רואים מה חזר.</b> בכל חודש: כמה עגלות קיבלו תזכורת, כמה מהן חזרו, וכמה כסף הן החזירו.</li>
</ul>
<p class="quiet">מדליקים את זה בהגדרות, ובוחרים אחרי כמה זמן התזכורת יוצאת. במייל אין תוספת. בוואטסאפ Meta גובה על כל תזכורת ישירות מכם, לפי המחירון שלה.</p>
</div>
</section>
${/* Order tracking (the owner, 2026-11-09: "add order tracking to toran. toran asks for an order number. a customer
   must write from the phone number the order was placed from, and if it does not match, toran should ask for the
   phone number"), as openfrequency-toran answers it (src/agent/tools.ts get_order_status, src/orders.ts fromOrder and
   phoneGiven: the order number only, the order's own phone or email address, else its phone asked for; nothing said
   before it matches; ORDER_TRIES = 3, then the store; Shopify, WooCommerce and Wix with a read-only key). */ ''}<section class="sec carts-sec" id="orders" aria-labelledby="orders-h">
<div class="wrap narrow">
<h2 id="orders-h">איפה ההזמנה שלי? <span class="hl">תורן בודק</span></h2>
<p class="lede">לקוח ששואל על הזמנה מקבל תשובה מתוך מערכת ההזמנות של החנות: מה הסטטוס, איזו חברת משלוחים לוקחת אותה, ולינק המעקב.</p>
<ul class="checks">
<li><b>מספיק מספר הזמנה.</b> תורן מבקש מהלקוח רק את מספר ההזמנה. כשהוא כותב מהטלפון שההזמנה נעשתה ממנו, התשובה מגיעה מיד.</li>
<li><b>מוודא שזה באמת הלקוח.</b> מי שכותב ממספר אחר, באינסטגרם, במסנג׳ר או בצ׳אט באתר, מתבקש קודם את מספר הטלפון שההזמנה נעשתה איתו, ומקבל תשובה רק כשהוא תואם.</li>
<li><b>שומר על הפרטים.</b> עד שהטלפון תואם, תורן לא אומר שום דבר על ההזמנה, גם לא אם היא קיימת. אחרי שלושה ניסיונות שלא תאמו, השאלה עוברת אליכם.</li>
<li><b>שינויים אצלכם.</b> תורן עונה על הסטטוס. בקשה לשנות הזמנה, לבטל אותה או לקבל החזר מגיעה אליכם לתיבה.</li>
</ul>
<p class="quiet">עובד עם <bdi dir="ltr">Shopify</bdi>, <bdi dir="ltr">WooCommerce</bdi> ו־<bdi dir="ltr">Wix</bdi>. מחברים פעם אחת מפתח שרק קורא הזמנות, בעמוד "מה הוא יודע" בחשבון.</p>
</div>
</section>
${payBack(false)}
${toranPricing(cfg, { cta: ['#demo', 'לנסות את תורן על החנות שלכם'], includes: [
  `עונה ללקוחות 24/7 ${soon.length ? `בכל הערוצים הפעילים, ${inList(live)}` : inList(live)}, מתוך מה שכתוב באתר שלכם`,
  // Under Kapso the store pays Meta itself for a WhatsApp message it starts (the contract's c-meta); by email nothing
  // more (the owner's default, 2026-11-08: say it honestly, not "included").
  'תזכורות על עגלה נטושה, למי שהסכים לקבל מכם הודעות. במייל זה בלי תוספת, ובוואטסאפ Meta גובה על כל תזכורת ישירות מכם',
  'סטטוס הזמנה ולינק מעקב, רק ללקוח שההזמנה שלו',
  'כל השיחות בתיבה אחת, ושאלה שאין עליה תשובה באתר מגיעה אליכם',
  'בשבועיים הראשונים אנחנו עוברים איתכם על השיחות ומתקנים מה שצריך',
] })}
<section class="sec close-sec" aria-labelledby="demo-h">
<div class="wrap narrow">
<h2 id="demo-h">לנסות את תורן על החנות שלכם</h2>
<p class="lede">שולחים לנו את הכתובת של החנות, ואנחנו בונים דמו מהמוצרים ומדפי המדיניות שבאתר. כותבים לו כמו לקוח, ורואים מה הוא עונה.</p>
${demoForm(cfg, '/toran')}
</div>
</section>`,
  };
};
