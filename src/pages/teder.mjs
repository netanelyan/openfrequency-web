// Teder's page, in the shape of Toran's, on its own violet: the headline and a button down to the demo form, beside its
// slideshows under a tab for each platform it posts to; what it does alone and what is left for you; its two plans; and
// the demo form at the end. (The screen where the day's slideshows wait for approval is on the home page; here it said
// again what the first screen, the list and the plans already say, and on a phone it was 840px of a long page: the
// owner, 2026-11-01, "The mobile page is very long".) What it does comes from
// openfrequency-teder's README ("What it does", "Publishing").
// While sign-up is open (signup in site.config.json), the first screen's button goes to accounts' sign-up, each plan's
// card has its own (with the plan picked), and the form at the end is the second way, a sample slideshow first. The
// lists say what a business that set Teder up on its own does: it picks the sources and connects its accounts.
// Facebook is in every list while teder.facebook is on (lib.mjs tederNets).
// On a phone (the owner, 2026-11-05: "too many things jump to the eyes at the same time") the first screen's line is its
// first sentence (the sizes are in the list, "מכין כל מצגת בגודל של טיקטוק ובגודל של אינסטגרם"), each list keeps three
// rows with the rest behind "עוד 2", and the price card's notes wait behind "עוד פרטים" (sections.mjs, a fold).
import { facebookOn, mark, signupOpen, tederNets } from '../lib.mjs';
import { platformWindow } from '../teder.mjs';
import { demoForm } from '../forms.mjs';
import { TEDER_SAMPLE, rowList, sampleLine, tederPricing, tederStart } from '../sections.mjs';

const alone = (cfg, open) => [
  'כותב את המצגת בקול של החשבון, לפי מדריך הכתיבה שלו',
  `${open ? 'קורא רק מהמקורות שבחרתם' : 'קורא רק ממקורות שאישרנו'}, וכל עובדה בשקופית נשענת על ציטוט מילה במילה`,
  'מעצב את השקופיות, עם צילום ברישיון שנבדק מול השקופית או גרף מהמספרים שלה',
  'מכין כל מצגת בגודל של טיקטוק ובגודל של אינסטגרם',
  `מפרסם ${facebookOn(cfg) ? 'באינסטגרם ובפייסבוק' : 'באינסטגרם'} בשעה שנקבעה, ובטיקטוק שם את המצגת בטיוטות ומזכיר לכם לפרסם. בשבת ובחג לא מפרסם, אלא אם תבחרו אחרת`,
];
const yours = (cfg, open) => [
  ...(open ? ['בהקמה, לבחור את המקורות ולעבור על המצגות לדוגמה', `לחבר ${tederNets(cfg, 'the')}, פעם אחת`] : []),
  'לאשר כל מצגת לפני שהיא עולה. לחיצה אחת מאשרת אותה',
  'לדחות מצגת שלא מתאימה, לכתוב למה, ולקבל גרסה חדשה',
  'בטיקטוק, להוסיף סאונד ולפרסם את המצגת מהטיוטות',
];

export default (cfg) => {
  const open = signupOpen(cfg);
  return {
  path: '/teder',
    image: 'teder',
  // Teder's form only: with teder.demoBy "whatsapp", its thank-you with the code is Teder's (forms.mjs formCopy).
  forms: 'teder',
  title: `תדר, מצגות אוטומטיות בעברית ${tederNets(cfg)} | OpenFrequency`,
  description: `תדר כותב ומעצב מצגות בעברית ${tederNets(cfg)}, וכל מצגת עולה רק אחרי שמישהו אישר אותה.`,
  body: `
<section class="thero" aria-labelledby="hero-h">
<div class="teder-field ch-field">
<div class="thero-text">
${mark('teder', 72, 'תדר')}
<h1 id="hero-h"><span class="hl">מצגות אוטומטיות</span> בעברית ${tederNets(cfg)}</h1>
<p class="lede">תדר כותב ומעצב את המצגות, ומפרסם כל אחת רק אחרי שמישהו אישר אותה.<span class="desk"> אותה מצגת יוצאת בגודל של טיקטוק ובגודל של אינסטגרם.</span></p>
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

${tederPricing(cfg, {
  cta: open ? null : ['#demo', 'לנסות את תדר על החנות שלכם'],
  alt: open ? sampleLine('#demo') : '',
  includes: [
    `מצגות מוכנות לפרסום ${tederNets(cfg)}`,
    'בסגנון של העסק שלכם, וכל עובדה בהן נבדקת מול המקור',
    'כל מצגת עולה רק אחרי שאישרתם אותה',
    'גרסה חדשה כשמצגת לא יצאה כמו שצריך, עד מספר ההחלפות של החבילה',
    'דוח תוצאות שמגיע אליכם במייל בכל חודש',
  ],
  notes: [
    'החלפה היא מצגת שדחיתם עם סיבה, ובמקומה מקבלים גרסה חדשה. תיקון קטן בטקסט או בתמונה לא נחשב החלפה, ואין עליו הגבלה.',
    'המצגות וההחלפות נספרות לפי חודש קלנדרי, מה-1 בחודש ועד סופו, גם כשהתשלום שלכם יורד בתאריך אחר. מה שלא השתמשתם בו לא עובר לחודש הבא.',
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
