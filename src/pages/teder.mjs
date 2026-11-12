// Teder's page, in the shape of Toran's, on its own violet: the headline and a button down to the demo form, beside its
// slideshows under a tab for each platform it posts to; what it does alone and what is left for you; why Teder and not
// a slideshow made by hand in ChatGPT (#why); how the slideshows are meant to pay for themselves, right above the price
// (the owner, 2026-11-06: an investment that comes back in customers and an audience, not only a cost; no figure, and
// the price card's note that we promise the process and not the views stays as it is; what the monthly report shows is
// what openfrequency-teder's src/notify/email.js monthlyEmail writes); its two plans; and the demo
// form at the end. (The screen where the day's slideshows wait for approval is on the home page; here it said
// again what the first screen, the list and the plans already say, and on a phone it was 840px of a long page: the
// owner, 2026-11-01, "The mobile page is very long".) What it does comes from
// openfrequency-teder's README ("What it does", "Publishing").
// While sign-up is open (signup in site.config.json), the first screen's button goes to accounts' sign-up, each plan's
// card has its own (with the plan picked), and the form at the end is the second way, a sample slideshow first. The price
// card has no line down to that form (the owner, 2026-11-06: "dont give users too many things to do, or options"): the form is the next
// section, and its heading asks the line's own question. The
// lists say what a business that set Teder up on its own does: it picks the sources and connects its accounts.
// Facebook is in every list while teder.facebook is on (lib.mjs tederNets).
// On a phone (the owner, 2026-11-05: "too many things jump to the eyes at the same time") the first screen's line is its
// first sentence (the sizes are in the list, "מכין כל מצגת בגודל של טיקטוק ובגודל של אינסטגרם"), each list keeps three
// rows with the rest behind "עוד 2", and the price card's notes wait behind "עוד פרטים" (sections.mjs, a fold).
import { facebookOn, mark, signupOpen, tederNets } from '../lib.mjs';
import { platformWindow } from '../teder.mjs';
import { demoForm } from '../forms.mjs';
import { TEDER_SAMPLE, foldButton, moreOf, rowList, tederPricing, tederStart } from '../sections.mjs';

const alone = (cfg, open) => [
  'כותב את המצגת בקול של החשבון, לפי מדריך הכתיבה שלו',
  // A fact from the sources comes with its quote; one from the model's own knowledge is marked (src/sources/model.js).
  `${open ? 'קורא מהמקורות שבחרתם, ומאלה שתדר מוסיף בעצמו, כמו ויקיפדיה' : 'קורא ממקורות שאישרנו'}, וכל עובדה מהם מגיעה עם ציטוט מילה במילה. עובדה בלי מקור מסומנת "בלי מקור, כדאי לבדוק"`,
  'מעצב את השקפים, עם צילום ברישיון שנבדק מול השקף, או גרף מהמספרים שלו',
  'מכין כל מצגת בגודל של טיקטוק ובגודל של אינסטגרם',
  // TikTok's reminder is in Teder's own list and, where it was turned on, a browser notification (src/publish/index.js,
  // src/notify/index.js); never an email.
  `מפרסם ${facebookOn(cfg) ? 'באינסטגרם ובפייסבוק' : 'באינסטגרם'} בשעה שנקבעה, ובטיקטוק שם את המצגת בטיוטות, ובשעה שלה מזכיר לכם לפרסם, בתדר ובדפדפן אם הפעלתם התראות. בשבת ובחג לא מפרסם, אלא אם תבחרו אחרת`,
];
const yours = (cfg, open) => [
  ...(open ? ['בהקמה, לבחור את המקורות ולעבור על המצגות לדוגמה', `לחבר ${tederNets(cfg, 'the')}`] : []),
  'לאשר כל מצגת לפני שהיא עולה. לחיצה אחת מאשרת אותה',
  'לדחות מצגת שלא מתאימה, לכתוב למה, ולבחור: מצגת אחרת לאותו יום, או שתדר יכתוב אותה מחדש',
  'בטיקטוק, להוסיף סאונד ולפרסם את המצגת מהטיוטות',
];

// "Why not make it myself in ChatGPT?" (the owner, 2026-11-06), as a list of what happens around the text, each from
// openfrequency-teder: the formats from the 25 TikTok photo posts read slide by slide (20 of them over 500K views, so
// together over ten million, which is the figure the page gives: the owner, 2026-11-06, "drop the number") (docs/decisions.md, "What spreads
// on TikTok", 2026-10-27); each fact's quote on the post's card and "בלי מקור, כדאי לבדוק" beside a fact from the
// model's own knowledge (src/sources/model.js, src/web/pages.js factsBlock); photographs only under a licence that
// allows a business to post them (src/images: Pexels, Unsplash, and Commons and Openverse without NC, ND or the Public
// Domain Mark); the sources read again for each day's posts and the closing slide to the store (src/pipeline/closing.js);
// Instagram and Facebook at the slot, TikTok in its drafts with a reminder at the slot, and the monthly email
// (src/notify/email.js). TikTok's sound and its posting stay the customer's, as the list above says, so the second
// item says so too. On a phone three wait behind "עוד 3" (a fold).
const why = (cfg, open) => [
  ['פורמטים שכבר עובדים בטיקטוק.', 'פירקנו שקף אחרי שקף מצגות מטיקטוק שהגיעו יחד ליותר מעשרה מיליון צפיות, גם בעברית, ובנינו את הפורמטים של תדר לפיהן: תמונה חדה אחת בכל שקף, שורה קצרה עליה, ושער של כמה מילים שעוצר את הגלילה.'],
  ['מצגת שלמה, מוכנה לפרסום.', 'ChatGPT נותן לכם טקסט. אחריו עוד צריך לעצב את השקפים, למצוא תמונות, להתאים את הגודל לטיקטוק ולאינסטגרם ולכתוב כיתוב. תדר עושה את כל זה. לכם נשאר לאשר, ובטיקטוק גם להוסיף סאונד ולפרסם מהטיוטות.'],
  ['עובדות שאפשר לבדוק.', 'כל עובדה מהמקורות מגיעה עם הציטוט שלה, ואתם רואים אותו לפני שאתם מאשרים. עובדה שאין לה מקור מסומנת "בלי מקור, כדאי לבדוק". <span class="nw">ב-ChatGPT</span> קשה לדעת מה נכון ומה הומצא.'],
  // The photographs the owner added come first, then the licensed libraries (src/images/index.js).
  ['תמונות אמיתיות שמותר לפרסם.', 'התמונות שלכם, או תמונות ממאגרים עם רישיון שימוש, כמו Pexels, Unsplash ו-Wikimedia Commons. תדר לא מייצר תמונות ב-AI.'],
  ['מה שקורה עכשיו בתחום שלכם.', `תדר קורא כל יום את המקורות ${open ? 'שבחרתם' : 'שאישרנו'}, אז המצגות מדברות על מה שחדש אצל הקהל שלכם. השקף האחרון שולח את מי שצפה אל החנות.`],
  ['עולה בזמן שקבעתם.', `מצגת שאישרתם עולה ${facebookOn(cfg) ? 'לאינסטגרם ולפייסבוק' : 'לאינסטגרם'} בימים ובשעות שבחרתם. בטיקטוק היא מחכה לכם בטיוטות, ובשעה שלה מגיעה תזכורת לפרסם, בתדר ובדפדפן אם הפעלתם התראות. בכל חודש מגיע אליכם דוח תוצאות במייל.`],
];
const KEEP = 3;
const whyList = (items) => `<div class="fold" data-fold><dl class="why" id="why-list">${items.map(([t, s], i) => `<div${i >= KEEP ? ' class="fold-x"' : ''}><dt>${t}</dt><dd>${s}</dd></div>`).join('')}</dl>${foldButton('why-list', moreOf(items.length - KEEP))}</div>`;

export default (cfg) => {
  const open = signupOpen(cfg);
  return {
  path: '/teder',
    image: 'teder',
  // Teder's form only: with teder.demoBy "whatsapp", its thank-you with the code is Teder's (forms.mjs formCopy).
  forms: 'teder',
  title: `תדר, מצגות אוטומטיות בעברית ${tederNets(cfg)} | OpenFrequency`,
  description: `תדר כותב ומעצב מצגות בעברית ${tederNets(cfg)}, וכל מצגת עולה רק אחרי שאישרתם אותה.`,
  body: `
<section class="thero" aria-labelledby="hero-h">
<div class="teder-field ch-field">
<div class="thero-text">
${mark('teder', 72, 'תדר')}
<h1 id="hero-h"><span class="hl">מצגות אוטומטיות</span> בעברית ${tederNets(cfg)}</h1>
<p class="lede">תדר כותב ומעצב את המצגות, ומפרסם כל אחת רק אחרי שאישרתם אותה.<span class="desk"> אותה מצגת יוצאת בגודל של טיקטוק ובגודל של אינסטגרם.</span></p>
${open ? tederStart(cfg, { wrap: 'start hero-cta', cls: 'btn light', price: false, more: `<a class="btn on-color" href="#demo">${TEDER_SAMPLE}</a>` }) : '<a class="btn primary hero-cta" href="#demo">לנסות את תדר על החנות שלכם</a>'}
</div>
${platformWindow(cfg)}
</div>
</section>

<section class="sec" id="alone" aria-labelledby="alone-h">
<div class="wrap">
<div class="sec-head"><h2 id="alone-h">מה הוא עושה לבד, ומה נשאר לכם</h2></div>
<div class="two">
${rowList('עושה לבד', alone(cfg, open), { id: 'alone-list' })}
${rowList('נשאר לכם', yours(cfg, open), { cls: 'yours', id: 'yours-list' })}
</div>
<p class="more">יש לכם עוד שאלות? <a href="/faq">כל השאלות והתשובות</a></p>
</div>
</section>

<section class="sec why-sec" id="why" aria-labelledby="why-h">
<div class="wrap why-grid">
<div class="sec-head"><h2 id="why-h">למה דווקא אותנו</h2><p class="lede">"למה שלא אכין מצגת לבד <span class="nw">ב-ChatGPT</span>?" אפשר, ולפעמים זה יוצא טוב. ההבדל הוא בכל מה שקורה מסביב לטקסט, כל שבוע מחדש.</p></div>
${whyList(why(cfg, open))}
</div>
</section>

<section class="sec ret-sec" id="return" aria-labelledby="return-h">
<div class="wrap narrow">
<h2 id="return-h">השקעה בחנות שלכם</h2>
<p class="ret-sub">איך המצגות מחזירות את עצמן</p>
<p class="lede">כל מצגת נגמרת בשקף ששולח את מי שצפה בה אל החנות שלכם. מי שעוקב אחריכם ${tederNets(cfg, 'in')} רואה אתכם כמה פעמים בשבוע, ומכיר אתכם כשהוא מחפש לקנות. ככה החבילה אמורה להחזיר את עצמה: בלקוחות שמגיעים מהרשתות ובקהל שגדל סביב החנות.</p>
<p>בדוח החודשי רואים כמה מצגות עלו, כמה פעמים צפו בהן וכמה לייקים הן קיבלו, ואיזו מצגת נצפתה יותר מכולן.</p>
</div>
</section>

${tederPricing(cfg, {
  cta: open ? null : ['#demo', 'לנסות את תדר על החנות שלכם'],
  includes: [
    `מצגות מוכנות לפרסום ${tederNets(cfg)}`,
    'בסגנון של העסק שלכם, וכל עובדה בהן מגיעה עם המקור שלה, או מסומנת כשאין לה',
    'כל מצגת עולה רק אחרי שאישרתם אותה',
    'מצגת שדחיתם נכתבת מחדש כמו שביקשתם, עד מספר ההחלפות של החבילה',
    'דוח תוצאות שמגיע אליכם במייל בכל חודש',
  ],
  notes: [
    // Teder's month (src/budget/quota.js), said as /faq says it.
    'נספרות רק מצגות שאישרתם. מצגת שדחיתם לא נספרת. במקומה מגיעה מצגת אחרת לאותו יום, או שתדר כותב אותה מחדש אם ביקשתם, כל עוד נשארה מהיום יותר משעה.',
    'החלפה היא מצגת שדחיתם וביקשתם שתדר יכתוב אותה מחדש לפי מה שכתבתם. תיקון קטן בטקסט או בתמונה לא נחשב החלפה, ולא יורד מהחבילה.',
    'המצגות וההחלפות נספרות לפי חודש קלנדרי, מה-1 בחודש ועד סופו, גם כשאתם משלמים בתאריך אחר. מה שלא השתמשתם בו לא עובר לחודש הבא.',
    'אנחנו מתחייבים לתהליך ולמצגות. כמה צפיות, עוקבים או מכירות הן יביאו, את זה אנחנו לא יכולים להבטיח.',
  ],
})}
<section class="sec close-sec" aria-labelledby="demo-h">
<div class="wrap narrow">
<h2 id="demo-h">${open ? 'רוצים קודם לראות מצגת מהחנות שלכם?' : 'לנסות את תדר על החנות שלכם'}</h2>
<p class="lede">שולחים לנו את הכתובת של החנות, ואנחנו מכינים לכם מצגת לדוגמה מהאתר שלכם, בגודל של טיקטוק ושל אינסטגרם.</p>
${demoForm(cfg, '/teder', 'demo', 'teder')}
</div>
</section>`,
  };
};
