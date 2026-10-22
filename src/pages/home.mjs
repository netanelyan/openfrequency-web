// The home page: Toran first, then how it goes, a day with it, who we are, Teder, the price, and the questions.
import { esc, ils, mark } from '../lib.mjs';

// The sample chat, as the customer sees it on their phone: their own messages on the left, the store's on the right.
// The store, the product and the price are made up, and the page says so; the "I don't know" line is the real
// agent's (openfrequency-toran, src/agent/prompt.ts).
const CHAT = [
  ['me', '02:14', 'היי, יש את שמלת הפשתן הירוקה במידה M?'],
  ['them', '02:14', 'יש, נשארו 2 במידה M. היא 289 ₪, והמשלוח עד הבית לוקח 3 עד 5 ימי עסקים. <span class="lnk">לינק לשמלה</span>'],
  ['me', '02:16', 'ואפשר לאסוף מהמחסן?'],
  ['them', '02:16', 'את זה אני לא יודע. אני בודק עם החנות, ואחזור אליך כאן.'],
];

const chat = `<figure class="chat glass" aria-labelledby="chat-cap">
<div class="chat-top"><span class="ava" aria-hidden="true">ח</span><span><b>החנות שלכם</b><small>וואטסאפ</small></span><span class="tag">דוגמה</span></div>
<ol class="msgs">
${CHAT.map(([who, time, text]) => `<li class="msg ${who}"><span class="sr">${who === 'me' ? 'לקוח' : 'החנות'}, ${time}. </span>${text}<time aria-hidden="true">${time}</time></li>`).join('\n')}
</ol>
<figcaption id="chat-cap">שיחה לדוגמה. החנות, השמלה והמחיר מומצאים.</figcaption>
</figure>`;

// One store's day, made up and marked as such. It follows the sample chat: the pickup question at 02:16 is the one
// the owner answers in the morning.
const DAY = [
  ['02:14', 'לקוח שואל אם יש את שמלת הפשתן במידה M. תורן בודק באתר, עונה שנשארו 2 ושולח לינק.'],
  ['02:16', 'הוא שואל אם אפשר לאסוף מהמחסן. זה לא כתוב באתר, אז תורן אומר לו שהוא בודק, ושולח לכם את השאלה בוואטסאפ. אתם ישנים, והשאלה מחכה לבוקר.'],
  ['08:20', 'אתם עונים לו בשורה אחת, תוך כדי קפה: "כן, בימים א׳ עד ה׳ עד 17:00". תורן מעביר את התשובה ללקוח ושומר אותה.'],
  ['13:05', 'לקוחה אחרת שואלת על איסוף מהמחסן. הפעם תורן עונה לבד, לפי מה שכתבתם בבוקר.'],
  ['21:40', 'לקוח רוצה להחזיר חולצה שקנה במבצע. תורן עונה לפי דף ההחזרות של החנות, ומצרף לינק לדף.'],
];

// Words that open WhatsApp to us; plain words in a draft without the number.
const waLink = (cfg, words) => {
  const wa = cfg.get('whatsapp');
  return wa ? `<a href="https://wa.me/${wa}">${words}</a>` : words;
};

function price(cfg) {
  const n = (key) => cfg.get(key);
  const money = (key) => (n(key) == null ? cfg.ph(key) : esc(ils(n(key))));
  const monthly = n('price.monthly');
  const vat = n('price.vat');
  const setup = n('price.setup');
  const fees = n('price.metaFees');
  const carts = n('price.exampleCarts');
  const updates = n('price.exampleUpdates');
  const months = n('price.commitmentMonths');
  const stops = n('price.stops');

  const vatWords = vat === 'included' ? 'כולל מע״מ' : vat === 'excluded' ? 'לא כולל מע״מ' : cfg.ph('price.vat');
  const setupLine = setup == null ? cfg.ph('price.setup') : setup === 0 ? 'אין דמי הקמה.' : `בחודש הראשון יש גם ${esc(ils(setup))} דמי הקמה, פעם אחת.`;

  const feeLine = {
    direct: 'על ההודעות האלה Meta מחייבת ישירות, בכרטיס האשראי שמחובר לחשבון של החנות אצלם.',
    billed: 'את ההודעות האלה אנחנו מוסיפים לחשבונית החודשית, במחיר ש-Meta גובה מאיתנו.',
    included: 'ההודעות האלה כלולות במחיר החודשי.',
  }[fees] ?? cfg.ph('price.metaFees');

  const nums = (key) => (n(key) == null ? cfg.ph(key) : esc(n(key).toLocaleString('he-IL')));
  const who = `חנות ששולחת בחודש ${nums('price.exampleCarts')} תזכורות על עגלה נטושה ו-${nums('price.exampleUpdates')} עדכוני משלוח`;
  let example;
  if (fees === 'included') {
    example = `${who} משלמת ${money('price.monthly')} בחודש, ${vatWords}. ההודעות כבר בפנים.`;
  } else {
    const mk = n('price.metaMarketing');
    const ut = n('price.metaUtility');
    const ready = [monthly, mk, ut, carts, updates].every((v) => v != null);
    const meta = ready ? Math.round(carts * mk + updates * ut) : null;
    example = `${who} משלמת לנו ${money('price.monthly')}, ${vatWords}. ל-Meta היא משלמת בערך ${meta == null ? '<mark class="ph">[סכום ל-Meta]</mark>' : esc(ils(meta))}`
      + ` (${nums('price.exampleCarts')} כפול ${money('price.metaMarketing')}, ועוד ${nums('price.exampleUpdates')} כפול ${money('price.metaUtility')}).`
      + (ready ? ` ביחד בערך ${esc(ils(monthly + meta))} בחודש.` : '');
  }

  const stopWords = stops === 'period-end' ? 'החיוב נעצר בסוף החודש שכבר שולם' : stops === 'immediately' ? 'החיוב נעצר מאותו יום' : cfg.ph('price.stops');
  const write = waLink(cfg, 'כותבים לנו');
  const cancel = months == null
    ? `${cfg.ph('price.commitmentMonths')} כדי להפסיק, ${write}, ו${stopWords}.`
    : months === 0
      ? `אין התחייבות. כדי להפסיק, ${write}, ו${stopWords}.`
      : `ההתחייבות היא ל-${months} חודשים מהיום שהמספר של החנות מחובר. אחרי זה אפשר להפסיק מתי שרוצים. ${write}, ו${stopWords}.`;

  return `<section class="sec" id="price" aria-labelledby="price-h">
<div class="wrap narrow">
<h2 id="price-h">כמה זה עולה</h2>
<div class="glass panel price">
<p class="amount"><b>${money('price.monthly')}</b> לחודש, ${vatWords}.</p>
<p>${setupLine}</p>
<h3>ההודעות של Meta</h3>
<p>Meta גובה תשלום על הודעות שהחנות שולחת ביוזמתה, כמו תזכורת על עגלה נטושה או עדכון שההזמנה יצאה. תשובה ללקוח שכתב קודם, בתוך 24 שעות מההודעה שלו, לא עולה כלום, ורוב מה שתורן שולח הוא תשובות כאלה. ${feeLine} <a href="https://developers.facebook.com/docs/whatsapp/pricing" rel="noopener">המחירון של Meta</a></p>
<h3>לדוגמה</h3>
<p>${example}</p>
<h3>איך מפסיקים</h3>
<p>${cancel}</p>
</div>
</div>
</section>`;
}

const FAQ = [
  ['אפשר להשאיר את המספר שכבר יש לחנות?',
    'כן. הלקוחות ממשיכים לכתוב לאותו מספר, ואנחנו מחברים אותו ל-WhatsApp Business Platform של Meta יחד איתכם.'],
  ['ומה אם הוא עונה ללקוח משהו לא נכון?',
    'תורן עונה רק ממה שכתוב באתר של החנות, ומחיר הוא כותב רק אם הוא מופיע במוצר עצמו. כשאין לו תשובה, הוא מעביר את השאלה אליכם במקום לנחש. בדקנו אותו על 150 שאלות מ-5 חנויות Shopify אמיתיות. הוא לא כתב אף מחיר שלא מופיע באתר, ואת כל 40 השאלות שלא הייתה להן תשובה באתר הוא העביר הלאה. ואם בכל זאת יוצאת תשובה לא טובה, בשבועיים הראשונים אנחנו קוראים איתכם את השיחות ומתקנים.'],
  ['הלקוחות שלי יראו את הדמו?',
    'הדמו רץ על מספר וואטסאפ נפרד שלנו, ורק מי שקיבל את הלינק לעמוד יכול לכתוב לו. המספר של החנות נשאר כמו שהוא עד שתחליטו לחבר אותו.'],
  ['צריך להתקין משהו בחנות?',
    'לדמו לא צריך להתקין כלום. תורן קורא את מה שכבר מופיע באתר: המוצרים, המחירים, המלאי ודפי המדיניות. כדי לחבר את המספר של החנות צריך חשבון עסקי ב-Meta, ואת החיבור אנחנו עושים יחד איתכם.'],
];

export default (cfg) => ({
  path: '/',
  title: 'תורן, מישהו שעונה בוואטסאפ של החנות שלכם | OpenFrequency',
  description: 'תורן קורא את האתר של החנות ועונה ללקוחות בוואטסאפ, גם בלילה. מה שהוא לא יודע הוא מעביר אליכם. שולחים לנו את הכתובת של החנות ומקבלים דמו.',
  body: `
<section class="hero">
<div class="wrap">
<div class="hero-head">
<a class="chip" href="/toran">${mark('toran', 24)}<span>תורן</span></a>
<h1>מישהו שעונה בוואטסאפ של החנות שלכם, גם בשתיים בלילה</h1>
</div>
<div class="hero-text">
<p class="lede">תורן קורא את האתר של החנות, את המוצרים ואת דפי המדיניות, ועונה ללקוחות בוואטסאפ. מה שהוא לא יודע הוא שולח אליכם בוואטסאפ, ואת התשובה שלכם הוא מעביר ללקוח.</p>
<form class="glass demo" id="demo" action="/api/lead" method="post">
<input type="hidden" name="source" value="home-hero">
<label class="f">הכתובת של החנות<input name="store" type="text" inputmode="url" autocomplete="url" dir="ltr" placeholder="shop.co.il" required></label>
<label class="f">הוואטסאפ שלכם<input name="contact" type="tel" inputmode="tel" autocomplete="tel" dir="ltr" placeholder="050-0000000" required></label>
<button class="btn primary" type="submit">לבנות דמו</button>
<p class="when">הדמו מוכן תוך ${cfg.t('demo.time')}, ונשלח אותו למספר הזה.</p>
</form>
</div>
${chat}
</div>
</section>

<section class="sec" id="how" aria-labelledby="how-h">
<div class="wrap split">
<h2 id="how-h">ככה זה הולך</h2>
<ol class="steps">
<li><h3>שולחים לנו את הכתובת של החנות</h3><p>בטופס למעלה, או ${waLink(cfg, 'בוואטסאפ')}.</p></li>
<li><h3>מקבלים עמוד עם דמו, ובודקים אותו כמו לקוח</h3><p>אנחנו בונים את הדמו מהמוצרים ומדפי המדיניות שבאתר שלכם. כותבים לו בוואטסאפ את מה שלקוחות שואלים, ורואים מה הוא עונה. הוא רץ על מספר שלנו, אז הלקוחות שלכם לא רואים אותו.</p></li>
<li><h3>מחברים את המספר של החנות</h3><p>החיבור עובר דרך WhatsApp Business Platform של Meta, ואנחנו עושים אותו איתכם. בשבועיים הראשונים אנחנו קוראים איתכם את השיחות ומתקנים מה שצריך, למשל תשובה שיצאה ארוכה מדי, או שאלה שחוזרת ואין לה תשובה באתר.</p></li>
</ol>
</div>
<div class="wrap">
<p class="platforms">היום תורן עובד עם חנויות על Shopify. החיבור ל-WooCommerce ול-Wix בדרך.</p>
</div>
</section>

<section class="sec" id="day" aria-labelledby="day-h">
<div class="wrap narrow">
<div class="sec-head"><h2 id="day-h">יום רגיל עם תורן</h2><span class="tag">דוגמה, מחנות בגדים מומצאת</span></div>
<ol class="day glass">
${DAY.map(([time, text]) => `<li><time>${time}</time><p>${text}</p></li>`).join('\n')}
</ol>
</div>
</section>

<section class="sec" id="about" aria-labelledby="about-h">
<div class="wrap narrow about">
${mark('openfrequency', 56)}
<div>
<h2 id="about-h">מי אנחנו</h2>
<p class="lede">${cfg.t('about.who')} ${cfg.t('about.why')}</p>
</div>
</div>
</section>

<section class="sec" id="teder" aria-labelledby="teder-h">
<div class="wrap narrow">
<div class="glass panel teder">
${mark('teder', 56)}
<h2 id="teder-h">ויש גם את תדר, לתוכן ברשתות</h2>
<p>תדר כותב ומעצב מצגות בעברית לטיקטוק ולאינסטגרם, ומפרסם כל אחת רק אחרי שמישהו אישר אותה. כרגע אנחנו מריצים אותו על שלושה חשבונות משלנו. כשיהיו לנו תוצאות להראות, נפתח אותו גם לחנויות.</p>
<form class="wait" action="/api/lead" method="post">
<input type="hidden" name="source" value="home-teder">
<label class="f">הוואטסאפ או המייל שלכם<input name="contact" type="text" autocomplete="email" dir="ltr" required></label>
<button class="btn" type="submit">להצטרף לרשימת ההמתנה</button>
</form>
<p class="quiet small">נכתוב לכם כשתדר ייפתח לחנויות.</p>
</div>
</div>
</section>

${price(cfg)}

<section class="sec" id="faq" aria-labelledby="faq-h">
<div class="wrap narrow">
<h2 id="faq-h">שאלות</h2>
<div class="faq">
${FAQ.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join('\n')}
</div>
</div>
</section>`,
});
