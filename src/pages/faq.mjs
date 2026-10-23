// The questions, in the owner's own words, one group per product.
import { ils, mark } from '../lib.mjs';
import { waWords } from '../sections.mjs';

const TORAN = (cfg) => [
  ['אפשר להשאיר את המספר שכבר יש לחנות?',
    'כן. הלקוחות ממשיכים לכתוב לאותו מספר, ואנחנו מחברים אותו ל-WhatsApp Business Platform של Meta יחד איתכם.'],
  ['ומה אם הוא עונה ללקוח משהו לא נכון?',
    'תורן לא ממציא תשובות. הוא עונה רק ממה שכתוב באתר של החנות, ומחיר הוא כותב רק אם הוא מופיע במוצר עצמו. כשאין לו תשובה, הוא מעביר את השאלה אליכם במקום לנחש. ואם בכל זאת יוצאת תשובה לא טובה, בשבועיים הראשונים אנחנו קוראים איתכם את השיחות ומתקנים.'],
  ['הלקוחות שלי יראו את הדמו?',
    'הדמו רץ על מספר וואטסאפ נפרד שלנו, ורק מי שקיבל את הלינק לעמוד יכול לכתוב לו. המספר של החנות נשאר כמו שהוא עד שתחליטו לחבר אותו.'],
  ['צריך להתקין משהו בחנות?',
    'לדמו לא צריך להתקין כלום. תורן קורא את מה שכבר מופיע באתר: המוצרים, המחירים, המלאי ודפי המדיניות. כדי לחבר את המספר של החנות צריך חשבון עסקי ב-Meta, ואת החיבור אנחנו עושים יחד איתכם.'],
  // A question whose answer is a fact we haven't set yet waits for it in the public draft.
  (cfg.has('demo.time') || cfg.banner) && ['כמה זמן לוקח עד שאני רואה דמו?',
    `תוך ${cfg.t('demo.time')} מהרגע ששלחתם את הכתובת. הלינק לעמוד מגיע אליכם בוואטסאפ, ובעמוד יש מספר שכותבים אליו כמו לקוח.`],
  ['החנות שלי על Wix. זה יעבוד?',
    'עוד לא. היום תורן עובד עם חנויות על Shopify, והחיבור ל-WooCommerce ול-Wix בדרך. אם תשלחו לנו את הכתובת, נכתוב לכם ונגיד מה אפשר.'],
  (cfg.has('price.monthly') || cfg.banner) && ['כמה זה עולה?',
    `${cfg.t('price.monthly', ils)} לחודש. מה שכלול בו, ואיך מפסיקים, כתובים <a href="/toran#price">בעמוד של תורן</a>.`],
];

const TEDER = [
  ['תדר יכול לפרסם משהו בלי שאישרתי?',
    'לא. כל מצגת יוצאת רק אחרי שמישהו אישר אותה, ובשבת ובחג הוא לא מפרסם בכלל.'],
  ['מאיפה הוא לוקח את העובדות?',
    'רק ממקורות שאישרנו מראש. כל עובדה בשקופית נשענת על ציטוט מילה במילה מהמקור, ומספר שלא מופיע בציטוט לא עולה על שקופית.'],
];

const group = (id, name, label, items) => `
<section class="sec faq-sec" aria-labelledby="${id}">
<div class="wrap">
<h2 id="${id}">${mark(name, 44)}${label}</h2>
<div class="faq">
${items.map(([q, a]) => `<details name="faq"><summary><span>${q}</span><span class="pm" aria-hidden="true"></span></summary><p>${a}</p></details>`).join('\n')}
</div>
</div>
</section>`;

export default (cfg) => ({
  path: '/faq',
  title: 'שאלות על תורן ועל תדר | OpenFrequency',
  description: 'מה ששואלים אותנו על תורן ועל תדר: המספר של החנות, תשובות לא נכונות, הדמו, המחיר, ואיך תדר עובד.',
  body: `
<section class="phero faq-hero" aria-labelledby="hero-h">
<div class="wrap narrow">
<h1 id="hero-h">שאלות</h1>
<p class="lede">מה ששואלים אותנו על תורן ועל תדר. לא מצאתם תשובה? ${waWords(cfg, 'תכתבו לנו בוואטסאפ')}.</p>
</div>
</section>
${group('faq-toran', 'toran', 'תורן', TORAN(cfg).filter(Boolean))}
${group('faq-teder', 'teder', 'תדר', TEDER)}`,
});
