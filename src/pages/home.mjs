// The home page: OpenFrequency and its two products, side by side. The first screen opens a door to each, in its own
// material: Toran's chat answering on glass, Teder's real slides fanned on its violet. Then each product gets its own
// section (Toran: the question box and the form; Teder: a row of real covers and the waitlist), and who we are. All
// of Toran's depth (how it goes, the day, the eval, the price, the questions) lives on /toran.
import { mark, glyphOnly } from '../lib.mjs';
import { chat } from '../chat.mjs';
import { demoForm, tederForm } from '../forms.mjs';
import { askBox } from '../sections.mjs';

// Opening slides Teder made for our three accounts (openfrequency-teder, private/data/dry-media), resized into
// assets/teder. The alt text is each slide's own headline.
const SLIDES = [
  ['sheela-tova-1', '@sheela.tova', 'מה Gemini שומר ממה שאתם כותבים לו'],
  ['kav-emtza-1', '@kav.emtza', 'מסי או רונאלדו? הנה המספרים, תחליטו אתם'],
  ['shekel-leshekel-3', '@shekel.leshekel', 'כמה עולה חלב בפיקוח, לפי המחירים הרשמיים'],
  ['sheela-tova-2', '@sheela.tova', '4 דברים ש-Gemini יודע לעשות בתוך Gmail ואולי עוד לא ניסיתם'],
  ['kav-emtza-2', '@kav.emtza', 'טופ 5, איזו מדינה זכתה הכי הרבה בליגת האלופות'],
  ['shekel-leshekel-1', '@shekel.leshekel', 'כמה מס בלו משלמים על דלק, במספרים'],
  ['sheela-tova-3', '@sheela.tova', 'Projects ב-Claude, ככה זה עובד'],
  ['kav-emtza-3', '@kav.emtza', 'ליגת העל במספרים'],
  ['shekel-leshekel-2', '@shekel.leshekel', '4 ריביות של החשב הכללי, במספרים'],
];
const slide = ([file, handle, text], lazy = true) =>
  `<img src="/teder/${file}.jpg" width="540" height="960" alt="שקופית פתיחה של ${handle}, ${text}"${lazy ? ' loading="lazy"' : ''} decoding="async">`;

// Toran's door: the sample chat on the customer's phone. The first question it answers from the site; the second
// isn't there, so it tells the customer it's checking, and the question pops up on the owner's phone.
const DOOR_CHAT = [
  ['me', '02:14', 'היי, יש את שמלת הפשתן הירוקה במידה M?'],
  ['them', '02:14', 'יש, נשארו 2 במידה M. היא 289 ₪, והמשלוח לוקח 3 עד 5 ימי עסקים.'],
  ['me', '02:16', 'ואפשר לאסוף מהמחסן?'],
  ['them', '02:16', 'את זה אני לא יודע. אני בודק עם החנות, ואחזור אליך כאן.'],
];

// Teder's door: a phone playing three of its slides like stories, two more fanned behind it, and the slide waiting
// for someone to approve it before it goes out. All of it repeats the slides row below, so it's hidden from readers.
const REEL = [SLIDES[0], SLIDES[1], SLIDES[2]];

const hero = `
<section class="co-hero" aria-labelledby="hero-h">
<div class="wrap">
<h1 id="hero-h">עונים ללקוחות שלכם, ומכינים לכם תוכן</h1>
<p class="lede">בנינו שני מוצרים לחנויות אונליין. תורן עונה ללקוחות בוואטסאפ, גם בשתיים בלילה. תדר כותב ומעצב מצגות בעברית לטיקטוק ולאינסטגרם.</p>
<div class="doors">
<article class="door toran-door glass" aria-labelledby="door-toran">
<div class="door-top">${mark('toran', 48)}<div><h2 id="door-toran">תורן</h2><p>עונה ללקוחות של החנות בוואטסאפ, מתוך מה שכתוב באתר. מה שלא כתוב שם, הוא שואל אתכם.</p></div></div>
<div class="door-act"><a class="btn primary" href="#demo">לבנות דמו לחנות</a><a class="btn" href="/toran">עוד על תורן</a></div>
<div class="phone-sit" data-play>
<div class="phone">${chat({ id: 'door-chat', who: 'החנות שלכם', face: 'ח', msgs: DOOR_CHAT, names: { me: 'לקוח', them: 'החנות' } })}</div>
<p class="pop" data-pop>${mark('toran', 28)}<span class="pop-h"><b>תורן</b><small>בטלפון שלכם, 02:16</small></span><span class="pop-t">לקוח שואל אם אפשר לאסוף מהמחסן. זה לא כתוב באתר. מה לענות לו?</span></p>
</div>
</article>
<article class="door teder-door" aria-labelledby="door-teder">
<div class="door-top"><span class="wave" aria-hidden="true">${glyphOnly('teder')}</span><div><h2 id="door-teder">תדר</h2><p>כותב ומעצב מצגות בעברית לטיקטוק ולאינסטגרם. כל מצגת יוצאת רק אחרי שמישהו אישר אותה.</p></div></div>
<div class="door-act"><a class="btn light" href="#teder">להצטרף לרשימת ההמתנה</a></div>
<div class="phone-sit reel-sit" aria-hidden="true">
<div class="fan">${[SLIDES[4], SLIDES[5]].map((s) => slide(s, false)).join('')}</div>
<div class="phone"><div class="reel" data-reel><span class="bars">${REEL.map(() => '<i></i>').join('')}</span>${REEL.map((s) => slide(s, false)).join('')}</div></div>
<p class="pop" data-pop><span class="wave">${glyphOnly('teder')}</span><span class="pop-h"><b>תדר</b><small>מצגת חדשה מוכנה</small></span><span class="pop-t">מחכה לאישור לפני שהיא עולה.</span></p>
</div>
</article>
</div>
</div>
</section>`;

const toran = (cfg) => `
<section class="sec ask-sec" id="toran" aria-labelledby="ask-h">
<div class="wrap">
<div class="try-text">
<h2 id="ask-h">תכתבו לתורן שאלה של לקוח</h2>
<p class="lede">הוא עונה מתוך מה שכתוב באתר של החנות. מה שאין שם, הוא שולח אליכם בוואטסאפ במקום לנחש.</p>
<p>בבדיקה על 150 שאלות מחמש חנויות Shopify הוא לא המציא אף מחיר.</p>
<p class="ask-note">זו הדגמה בדפדפן, על חנות בגדים מומצאת ועם תשובות שכתבנו מראש. בדמו שנבנה לכם, תורן עונה מהאתר של החנות שלכם.</p>
</div>
${askBox}
<div class="toran-cta">
<div><h3>רוצים לראות אותו עונה על החנות שלכם?</h3><p>שולחים לנו את הכתובת, ותוך ${cfg.t('demo.time')} נשלח לכם עמוד עם דמו שבנינו על המוצרים שלכם. <a href="/toran">כל מה שתורן עושה, ומה עוד לא</a></p></div>
${demoForm(cfg, '/')}
</div>
</div>
</section>`;

const teder = (cfg) => `
<section class="sec teder-sec" id="teder" aria-labelledby="teder-h">
<div class="teder-field">
<div class="in head">
<div class="wave" aria-hidden="true">${glyphOnly('teder')}</div>
<h2 id="teder-h">מצגות בעברית לטיקטוק ולאינסטגרם</h2>
<p>תדר כותב ומעצב את המצגות, ומפרסם כל אחת רק אחרי שמישהו אישר אותה. כרגע הוא עובד על שלושה חשבונות שלנו, בבינה מלאכותית, בכדורגל ובכסף. כשיהיו לנו תוצאות להראות, נפתח אותו גם לחנויות.</p>
</div>
<div class="slides" tabindex="0" aria-label="שקופיות פתיחה שתדר הכין לשלושת החשבונות שלנו">
${SLIDES.map((s) => `<figure>${slide(s)}</figure>`).join('\n')}
</div>
<div class="in tail">
<p class="small">שקופיות הפתיחה של מצגות שתדר הכין לשלושת החשבונות שלנו. גוללים הצידה.</p>
<div>
${tederForm(cfg, '/')}
<p class="small">נכתוב לכם כשתדר ייפתח לחנויות.</p>
</div>
</div>
</div>
</section>`;

const about = (cfg) => `
<section class="sec about-sec" id="about" aria-labelledby="about-h">
<div class="wrap narrow">
<h2 id="about-h">מי אנחנו</h2>
<p class="lede">${cfg.t('about.who')} ${cfg.t('about.why')}</p>
</div>
</section>`;

export default (cfg) => ({
  path: '/',
  forms: true,
  closing: true,
  title: 'OpenFrequency, תורן ותדר לחנויות אונליין',
  description: 'בנינו שני מוצרים לחנויות אונליין. תורן עונה ללקוחות בוואטסאפ, גם בלילה. תדר כותב ומעצב מצגות בעברית לטיקטוק ולאינסטגרם.',
  body: [hero, toran(cfg), teder(cfg), about(cfg)].join('\n'),
});
