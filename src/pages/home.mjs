// The home page. Toran is shown doing its job before it is described: a chat on the first screen, the three steps
// on one held fragment, a day on duty with now marked on it, a question box the visitor types into, and Toran's own
// eval as the proof. Then who we are, Teder, the price and the questions. The closing field and the footer come
// from the layout.
import { esc, ils, mark, glyphOnly } from '../lib.mjs';
import { chat } from '../chat.mjs';
import { demoForm, tederForm } from '../forms.mjs';

// Words that open WhatsApp to us; plain words in a draft without the number.
const waWords = (cfg, words) => {
  const wa = cfg.get('whatsapp');
  return wa ? `<a href="https://wa.me/${wa}">${words}</a>` : words;
};

// ---------------------------------------------------------------- the first screen

// The sample chat, as the customer sees it on their phone. The store, the dress and the price are made up, and the
// page says so; the "I don't know" line is the real agent's (openfrequency-toran, src/agent/prompt.ts).
const CHAT = [
  ['me', '02:14', 'היי, יש את שמלת הפשתן הירוקה במידה M?'],
  ['them', '02:14', 'יש, נשארו 2 במידה M. היא 289 ₪, והמשלוח עד הבית לוקח 3 עד 5 ימי עסקים. <span class="lnk">לינק לשמלה</span>'],
  ['me', '02:16', 'ואפשר לאסוף מהמחסן?'],
  ['them', '02:16', 'את זה אני לא יודע. אני בודק עם החנות, ואחזור אליך כאן.'],
];

const hero = (cfg) => `
<section class="hero" aria-labelledby="hero-h">
<div class="wrap">
<h1 id="hero-h">מישהו שעונה בוואטסאפ של החנות שלכם, גם בשתיים בלילה</h1>
<div class="hero-text">
<p class="lede"><a href="/toran">${mark('toran', 20).replace('class="mark toran"', 'class="mark toran inline"')}תורן</a> קורא את האתר של החנות, את המוצרים ואת דפי המדיניות, ועונה ללקוחות בוואטסאפ. מה שהוא לא יודע הוא שולח אליכם, ואת התשובה שלכם הוא מעביר ללקוח.</p>
${demoForm(cfg, '/')}
</div>
<div class="stage glass" data-hero-chat>
${chat({ id: 'chat-cap', who: 'החנות שלכם', face: 'ח', msgs: CHAT, names: { me: 'לקוח', them: 'החנות' }, caption: 'שיחה לדוגמה. החנות, השמלה והמחיר מומצאים.' })}
</div>
</div>
</section>`;

// ---------------------------------------------------------------- how it goes: one fragment, three states

// Each state is a crop of the real interface, made up and labelled: the address sent, the demo page, and the
// conversations the owner reads with us in the first two weeks.
const tag = '<span class="ui-s fixed">דוגמה</span>';
const STATES = [
  `<div class="ui-card" data-ui>
<div class="ui-t">${mark('openfrequency', 26)}<span>דמו לחנות שלכם</span></div>
<div class="ui-field">my-shop.co.il</div><div class="ui-field">050-1234567</div>
<div class="ui-btn">לבנות דמו</div>
<p class="ui-ok">קיבלנו את הכתובת. הדמו בדרך אליכם בוואטסאפ.</p>
</div>`,
  `<div class="ui-card" data-ui>
<div class="ui-t">${mark('toran', 26)}<span>הדמו של my-shop.co.il</span>${tag}</div>
<div class="ui-row"><span>מוצרים שקראנו מהאתר</span><b class="num">128</b></div>
<div class="ui-row"><span>דפי מדיניות</span><b>משלוחים, החזרות, תשלום</b></div>
<div class="ui-row"><span>לכתוב לדמו</span><b>מספר הדמו שלנו</b></div>
<div class="ui-btn">לכתוב לדמו בוואטסאפ</div>
</div>`,
  `<div class="ui-card" data-ui>
<div class="ui-t">${mark('toran', 26)}<span>השיחות של השבוע</span>${tag}</div>
<div class="ui-row"><span><span class="ui-k num">02:14</span> יש את השמלה במידה M?</span><span class="ui-s alone">ענה לבד</span></div>
<div class="ui-row"><span><span class="ui-k num">02:16</span> אפשר לאסוף מהמחסן?</span><span class="ui-s yours">הועבר אליכם</span></div>
<div class="ui-row"><span><span class="ui-k num">11:30</span> כמה זמן לוקח משלוח?</span><span class="ui-s fixed">תיקנו, היה ארוך</span></div>
</div>`,
];

const STEPS = (cfg) => [
  ['שולחים לנו את הכתובת של החנות', `בטופס למעלה, או ${waWords(cfg, 'בוואטסאפ')}.`],
  ['מקבלים עמוד עם דמו, ובודקים אותו כמו לקוח', 'אנחנו בונים את הדמו מהמוצרים ומדפי המדיניות שבאתר שלכם. כותבים לו בוואטסאפ את מה שלקוחות שואלים, ורואים מה הוא עונה. הוא רץ על מספר שלנו, אז הלקוחות שלכם לא רואים אותו.'],
  ['מחברים את המספר של החנות', 'החיבור עובר דרך WhatsApp Business Platform של Meta, ואנחנו עושים אותו איתכם. בשבועיים הראשונים אנחנו קוראים איתכם את השיחות ומתקנים מה שצריך, למשל תשובה שיצאה ארוכה מדי, או שאלה שחוזרת ואין לה תשובה באתר.'],
];

const how = (cfg) => `
<section class="sec steps-sec" id="how" aria-labelledby="how-h">
<div class="wrap">
<div>
<div class="sec-head" data-rise><h2 id="how-h">ככה זה הולך</h2></div>
<ol class="steps">
${STEPS(cfg).map(([h, p], i) => `<li class="step${i === 0 ? ' on' : ''}" data-step="${i}"><h3>${h}</h3><p>${p}</p><div class="state">${STATES[i]}</div></li>`).join('\n')}
</ol>
</div>
<div class="held" aria-hidden="true"><div class="stage glass">${STATES.map((s, i) => `<div class="state${i === 0 ? ' on' : ''}" data-state="${i}">${s}</div>`).join('')}</div></div>
</div>
</section>`;

// ---------------------------------------------------------------- a day on duty

// One store's day, made up and marked as such. It continues the first screen's chat: the pickup question at 02:16
// is the one the owner answers in the morning. The script adds now, in Israel, in its place among the times.
const DAY = [
  ['02:14', 'alone', 'לקוח שואל אם יש את שמלת הפשתן במידה M. תורן בודק באתר, עונה שנשארו 2 ושולח לינק.'],
  ['02:16', 'yours', 'הוא שואל אם אפשר לאסוף מהמחסן. זה לא כתוב באתר, אז תורן אומר לו שהוא בודק, ושולח לכם את השאלה בוואטסאפ. אתם ישנים, והשאלה מחכה לבוקר.'],
  ['08:20', 'you', 'אתם עונים לו בשורה אחת, תוך כדי קפה: "כן, בימים א׳ עד ה׳ עד 17:00". תורן מעביר את התשובה ללקוח ושומר אותה.'],
  ['13:05', 'alone', 'לקוחה אחרת שואלת על איסוף מהמחסן. הפעם תורן עונה לבד, לפי מה שכתבתם בבוקר.'],
  ['21:40', 'alone', 'לקוח רוצה להחזיר חולצה שקנה במבצע. תורן עונה לפי דף ההחזרות של החנות, ומצרף לינק לדף.'],
];

const day = `
<section class="sec day-sec" id="day" aria-labelledby="day-h">
<div class="wrap">
<div data-rise>
<div class="sec-head"><h2 id="day-h">יום רגיל עם תורן</h2><p class="quiet">דוגמה מחנות בגדים מומצאת. השורה הכחולה היא השעה בישראל עכשיו.</p></div>
<ol class="log" data-log>
${DAY.map(([t, who, text]) => `<li data-t="${t}"><span class="dot ${who}" aria-hidden="true"></span><span>${text}</span><time>${t}</time></li>`).join('\n')}
<li class="now" data-now hidden><span class="dot" aria-hidden="true"></span><span>עכשיו בישראל. אם לקוח כותב לחנות עכשיו, תורן עונה לו.</span><time data-now-time></time></li>
</ol>
<p class="key"><span><i class="dot alone" aria-hidden="true"></i>תורן ענה לבד</span><span><i class="dot yours" aria-hidden="true"></i>הועבר אליכם</span><span><i class="dot" aria-hidden="true"></i>אתם</span></p>
</div>
<figure class="photo drift" data-rise>
<div class="frame"><img src="/img/switchboard-1971-1400.jpg" srcset="/img/switchboard-1971-800.jpg 800w, /img/switchboard-1971-1400.jpg 1400w" sizes="(min-width: 900px) 560px, 100vw" width="1400" height="888" alt="חיילת יושבת מול מרכזיית טלפונים, ביד אחת מחברת כבל ובשנייה סופגנייה" loading="lazy" decoding="async"></div>
<figcaption>חיילת במרכזייה צבאית ביום הראשון של חנוכה, 1971.</figcaption>
</figure>
</div>
</section>`;

// ---------------------------------------------------------------- ask it

// The question box. The script answers each question from a made-up store's facts, the way Toran answers from a
// real store's site, and hands off the rest with Toran's real line. Without script, the prefilled question keeps
// its answer, written here.
const ask = `
<section class="sec ask-sec" id="ask" aria-labelledby="ask-h">
<div class="wrap">
<div class="sec-head" data-rise><h2 id="ask-h">תכתבו שאלה של לקוח</h2><p>ותראו אם תורן עונה לבד, או מעביר אליכם.</p></div>
<div class="ask-field" data-ui><label class="sr" for="ask-q">שאלה של לקוח</label><input class="ask-line" id="ask-q" type="text" value="יש את השמלה במידה M?" autocomplete="off" spellcheck="false" maxlength="80"></div>
<div class="ask-ui" data-ui data-ask-out aria-live="polite">
<ol class="msgs"><li class="msg me">יש את השמלה במידה M?<time aria-hidden="true">עכשיו</time></li><li class="msg them">יש. במידה M נשארו 2, ובמידה S יש 5. מידה L אזלה. <span class="lnk">לינק לשמלה</span><time aria-hidden="true">עכשיו</time></li></ol>
<p class="verdict"><span class="ui-s alone">ענה לבד</span>מדף המוצר</p>
</div>
<div>
<div class="ask-ex" data-ask-ex hidden>
<button type="button">כמה עולה משלוח?</button>
<button type="button">אפשר לאסוף מהמחסן?</button>
<button type="button">יש הנחה אם אקנה שתיים?</button>
<button type="button">אפשר להחזיר אם לא מתאים?</button>
</div>
<p class="ask-note">זו הדגמה בדפדפן, על חנות בגדים מומצאת ועם תשובות שכתבנו מראש. בדמו שנבנה לכם, תורן עונה מהאתר של החנות שלכם.</p>
</div>
</div>
</section>`;

// ---------------------------------------------------------------- the proof: Toran's eval

// From openfrequency-toran, docs/milestones.md, milestone 3: 30 questions a store, graded in code. Stores C, D and E
// passed on a rerun after three fixes; the first run was 147 of 150.
const STORES = [['חנות א׳', ''], ['חנות ב׳', ''], ['חנות ג׳', ', בריצה חוזרת'], ['חנות ד׳', ', בריצה חוזרת'], ['חנות ה׳', ', בריצה חוזרת']];
const K = ['שאלות שעבר', 'מחירים מומצאים שהגיעו ללקוח', 'שאלות בלי תשובה באתר שהעביר אליכם'];
const proof = `
<section class="sec proof-sec" id="proof" aria-labelledby="proof-h">
<div class="wrap">
<div data-rise>
<h2 class="proof-h" id="proof-h"><span>בדקנו אותו</span><span>על חמש חנויות אמיתיות</span></h2>
<p class="lede proof-lede">שאלנו את תורן 150 שאלות על חמש חנויות Shopify ישראליות: מחירים ומלאי, משלוחים והחזרות, מוצרים שהחנות לא מוכרת, ולקוחות שלוחצים על הנחה.</p>
</div>
<table class="results" data-rise>
<caption class="sr">תוצאות הבדיקה של תורן, לפי חנות</caption>
<thead><tr><th scope="col">חנות</th>${K.map((k) => `<th scope="col">${k}</th>`).join('')}</tr></thead>
<tbody>
${STORES.map(([s, note]) => `<tr><th scope="row">${s}</th><td data-k="${K[0]}">30 מתוך 30${note}</td><td data-k="${K[1]}" class="zero">0</td><td data-k="${K[2]}">8 מתוך 8</td></tr>`).join('\n')}
</tbody>
<tfoot><tr><th scope="row">ביחד</th><td data-k="${K[0]}">150 מתוך 150</td><td data-k="${K[1]}" class="zero">0</td><td data-k="${K[2]}">40 מתוך 40</td></tr></tfoot>
</table>
<div class="proof-notes">
<p>בריצה הראשונה עברו 147 מתוך 150. את שלוש השאלות שנכשלו בדקנו ותיקנו, ובחנויות ג׳, ד׳ וה׳ הריצה החוזרת עברה. את השמות של החנויות השארנו בחוץ.</p>
<p>היום תורן עובד עם חנויות על Shopify. החיבור ל-WooCommerce ול-Wix בדרך.</p>
</div>
</div>
</section>`;

// ---------------------------------------------------------------- who we are, from Ashdod

const about = (cfg) => `
<section class="sec about-sec" id="about" aria-labelledby="about-h">
<div class="wrap">
<div class="sec-head" data-rise><h2 id="about-h">מי אנחנו</h2></div>
<dl class="facts" data-rise>
<div><dt>איפה</dt><dd>${cfg.t('city')}</dd></div>
<div><dt>מה בנינו</dt><dd>תורן ותדר</dd></div>
<div><dt>איך מדברים איתנו</dt><dd>בוואטסאפ</dd></div>
</dl>
<p class="about-p" data-rise><span>${cfg.t('about.who')} ${cfg.t('about.why')}</span></p>
<div class="ashdod">
<figure class="photo" data-rise><div class="frame"><img src="/img/ashdod-map-1960-1000.jpg" width="1000" height="820" alt="קטע ממפה ישנה: חוף הים, דיונות החול, וגושי הבתים הראשונים של אשדוד" loading="lazy" decoding="async"></div><figcaption>אשדוד במפת מחלקת המדידות, 1960.</figcaption></figure>
<figure class="photo" data-rise><div class="frame"><img src="/img/ashdod-port-1964-1400.jpg" srcset="/img/ashdod-port-1964-800.jpg 800w, /img/ashdod-port-1964-1400.jpg 1400w" sizes="(min-width: 900px) 480px, 50vw" width="1400" height="1072" alt="מנוף מרים דלי אבנים מעל קטר קטן, ופועלים עומדים ליד המסילה" loading="lazy" decoding="async"></div><figcaption>בניית נמל אשדוד, 1964.</figcaption></figure>
</div>
</div>
</section>`;

// ---------------------------------------------------------------- Teder

const teder = (cfg) => `
<section class="sec teder-sec" id="teder" aria-labelledby="teder-h">
<div class="teder-field">
<div class="in" data-rise>
<div class="wave" role="img" aria-label="תדר">${glyphOnly('teder')}</div>
<h2 id="teder-h">ויש גם את תדר, לתוכן ברשתות</h2>
<p>תדר כותב ומעצב מצגות בעברית לטיקטוק ולאינסטגרם, ומפרסם כל אחת רק אחרי שמישהו אישר אותה. כרגע אנחנו מריצים אותו על שלושה חשבונות משלנו. כשיהיו לנו תוצאות להראות, נפתח אותו גם לחנויות.</p>
<div>
${tederForm(cfg, '/')}
<p class="small">נכתוב לכם כשתדר ייפתח לחנויות.</p>
</div>
</div>
</div>
</section>`;

// ---------------------------------------------------------------- the price, in the serious register

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
  const write = waWords(cfg, 'כותבים לנו');
  const cancel = months == null
    ? `${cfg.ph('price.commitmentMonths')} כדי להפסיק, ${write}, ו${stopWords}.`
    : months === 0
      ? `אין התחייבות. כדי להפסיק, ${write}, ו${stopWords}.`
      : `ההתחייבות היא ל-${months} חודשים מהיום שהמספר של החנות מחובר. אחרי זה אפשר להפסיק מתי שרוצים. ${write}, ו${stopWords}.`;

  const vatLine = vat ? `המחיר ${vatWords}.` : vatWords;
  const figure = monthly == null ? cfg.ph('price.monthly') : esc(monthly.toLocaleString('he-IL'));
  return `
<section class="sec price-sec" id="price" aria-labelledby="price-h">
<div class="wrap">
<div class="sec-head" data-rise><h2 id="price-h">כמה זה עולה</h2><p>${vatLine} ${setupLine}</p></div>
<div data-rise>
<p class="figure"><span class="num">${figure}<span class="bubble-tag msg them typing" data-ui aria-hidden="true"><span class="dots"><i></i><i></i><i></i></span></span></span><span class="cur">₪</span><span class="per">לחודש</span></p>
<ul class="terms">
<li><b>ההודעות של Meta</b>Meta גובה תשלום על הודעות שהחנות שולחת ביוזמתה, כמו תזכורת על עגלה נטושה או עדכון שההזמנה יצאה. תשובה ללקוח שכתב קודם, בתוך 24 שעות מההודעה שלו, לא עולה כלום, ורוב מה שתורן שולח הוא תשובות כאלה. ${feeLine} <a href="https://developers.facebook.com/docs/whatsapp/pricing" rel="noopener">המחירון של Meta</a></li>
<li><b>לדוגמה</b>${example}</li>
<li><b>איך מפסיקים</b>${cancel}</li>
</ul>
<a class="btn primary" href="#demo">לבנות דמו לחנות</a>
</div>
</div>
</section>`;
}

// ---------------------------------------------------------------- the questions, in the owner's words

const FAQ = (cfg) => [
  ['אפשר להשאיר את המספר שכבר יש לחנות?',
    'כן. הלקוחות ממשיכים לכתוב לאותו מספר, ואנחנו מחברים אותו ל-WhatsApp Business Platform של Meta יחד איתכם.'],
  ['ומה אם הוא עונה ללקוח משהו לא נכון?',
    'תורן עונה רק ממה שכתוב באתר של החנות, ומחיר הוא כותב רק אם הוא מופיע במוצר עצמו. כשאין לו תשובה, הוא מעביר את השאלה אליכם במקום לנחש. בבדיקה על 5 חנויות הוא לא כתב אף מחיר שלא מופיע באתר, ואת כל 40 השאלות שלא הייתה להן תשובה באתר הוא העביר הלאה. ואם בכל זאת יוצאת תשובה לא טובה, בשבועיים הראשונים אנחנו קוראים איתכם את השיחות ומתקנים.'],
  ['הלקוחות שלי יראו את הדמו?',
    'הדמו רץ על מספר וואטסאפ נפרד שלנו, ורק מי שקיבל את הלינק לעמוד יכול לכתוב לו. המספר של החנות נשאר כמו שהוא עד שתחליטו לחבר אותו.'],
  ['צריך להתקין משהו בחנות?',
    'לדמו לא צריך להתקין כלום. תורן קורא את מה שכבר מופיע באתר: המוצרים, המחירים, המלאי ודפי המדיניות. כדי לחבר את המספר של החנות צריך חשבון עסקי ב-Meta, ואת החיבור אנחנו עושים יחד איתכם.'],
  ['כמה זמן לוקח עד שאני רואה דמו?',
    `תוך ${cfg.t('demo.time')} מהרגע ששלחתם את הכתובת. הלינק לעמוד מגיע אליכם בוואטסאפ, ובעמוד יש מספר שכותבים אליו כמו לקוח.`],
];

const faq = (cfg) => `
<section class="sec faq-sec" id="faq" aria-labelledby="faq-h">
<div class="wrap">
<h2 id="faq-h">שאלות</h2>
<div class="faq" data-rise>
${FAQ(cfg).map(([q, a]) => `<details name="faq"><summary><span>${q}</span><span class="pm" aria-hidden="true"></span></summary><p>${a}</p></details>`).join('\n')}
</div>
</div>
</section>`;

export default (cfg) => ({
  path: '/',
  forms: true,
  closing: true,
  photos: true,
  title: 'תורן, מישהו שעונה בוואטסאפ של החנות שלכם | OpenFrequency',
  description: 'תורן קורא את האתר של החנות ועונה ללקוחות בוואטסאפ, גם בלילה. מה שהוא לא יודע הוא מעביר אליכם. שולחים לנו את הכתובת של החנות ומקבלים דמו.',
  body: [hero(cfg), how(cfg), day, ask, proof, about(cfg), teder(cfg), price(cfg), faq(cfg)].join('\n'),
});
