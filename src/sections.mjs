// Toran's sections, shown doing its job before it is described: the chat, the three steps on one held fragment, the
// question box and the price. The Toran page uses the chat, the steps and the price; the home page has the question box.
import { esc, ils, mark } from './lib.mjs';
import { chat } from './chat.mjs';
import { demoForm } from './forms.mjs';

// Words that open WhatsApp to us; plain words in a draft without the number.
export const waWords = (cfg, words) => {
  const wa = cfg.get('whatsapp');
  return wa ? `<a href="https://wa.me/${wa}">${words}</a>` : words;
};

// ---------------------------------------------------------------- the first screen

// The sample chat, as the customer sees it on their phone. The store, the dress and the price are made up, and the
// page says so; the "I don't know" line is the real agent's (openfrequency-toran, src/agent/prompt.ts).
// On a phone the first screen shows the first exchange; the second (marked true) joins from a tablet up.
export const CHAT = [
  ['me', '02:14', 'היי, יש את שמלת הפשתן הירוקה במידה M?'],
  ['them', '02:14', 'יש, נשארו 2 במידה M. היא 289 ₪, והמשלוח עד הבית לוקח 3 עד 5 ימי עסקים. <span class="lnk">לינק לשמלה</span>'],
  ['me', '02:16', 'ואפשר לאסוף מהמחסן?', true],
  ['them', '02:16', 'את זה אני לא יודע. אני בודק עם החנות, ואחזור אליך כאן.', true],
];

export const hero = (cfg) => `
<section class="hero" aria-labelledby="hero-h">
<div class="wrap">
<div class="hero-head">${mark('toran', 88, 'תורן')}<h1 id="hero-h">מישהו שעונה בוואטסאפ של החנות שלכם, גם בשתיים בלילה</h1></div>
<div class="hero-text">
<p class="lede">תורן קורא את האתר של החנות, את המוצרים ואת דפי המדיניות, ועונה ללקוחות בוואטסאפ. מה שהוא לא יודע הוא שולח אליכם, ואת התשובה שלכם הוא מעביר ללקוח.</p>
${demoForm(cfg, '/toran')}
</div>
<div class="stage glass" data-hero-chat data-play>
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

export const how = (cfg) => `
<section class="sec steps-sec" id="how" aria-labelledby="how-h">
<div class="wrap">
<div>
<div class="sec-head"><h2 id="how-h">ככה זה הולך</h2></div>
<ol class="steps">
${STEPS(cfg).map(([h, p], i) => `<li class="step${i === 0 ? ' on' : ''}" data-step="${i}"><h3>${h}</h3><p>${p}</p><div class="state">${STATES[i]}</div></li>`).join('\n')}
</ol>
</div>
<div class="held" aria-hidden="true"><div class="stage glass">${STATES.map((s, i) => `<div class="state${i === 0 ? ' on' : ''}" data-state="${i}">${s}</div>`).join('')}</div></div>
</div>
</section>`;

// ---------------------------------------------------------------- ask it

// The question box, with Toran answering for OpenFrequency itself. The script answers each question from what this
// site says, the way Toran answers from a store's site, and every suggested question has an answer. Without script,
// the prefilled question keeps its answer, written here.
export const askBox = `
<figure class="chat try" data-ui aria-label="OpenFrequency, שיחה עם תורן">
<div class="chat-top">${mark('openfrequency', 38)}<span><b>OpenFrequency</b><small>תורן עונה</small></span><span class="tag">דוגמה</span></div>
<ol class="msgs" data-ask-out aria-live="polite">
<li class="msg me">מה תורן עושה?<time aria-hidden="true">עכשיו</time></li>
<li class="msg them">תורן עונה ללקוחות של החנות בוואטסאפ, מתוך מה שכתוב באתר שלה: מוצרים, מחירים, מלאי ודפי המדיניות. מה שלא כתוב שם, הוא שואל אתכם ומעביר את התשובה ללקוח. <a class="lnk" href="/toran">לעמוד של תורן</a><time aria-hidden="true">עכשיו</time></li>
<li class="sys"><span class="ui-s alone">ענה לבד</span>מהעמוד של תורן</li>
</ol>
<div class="ask-ex" data-ask-ex hidden>
<button type="button">כמה זה עולה?</button>
<button type="button">מה זה תדר?</button>
<button type="button">איך מקבלים דמו?</button>
<button type="button">זה עובד עם Wix?</button>
<button type="button">ומה אם הוא טועה?</button>
</div>
<form class="ask-bar" data-ask-form hidden>
<label class="sr" for="ask-q">שאלה לתורן</label>
<input id="ask-q" type="text" placeholder="תכתבו שאלה" autocomplete="off" maxlength="80" enterkeyhint="send">
<button class="send" type="submit" aria-label="לשלוח"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12H5M11 6l-6 6 6 6"/></svg></button>
</form>
</figure>
`;

// ---------------------------------------------------------------- the price, in the serious register

export function price(cfg) {
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
<div class="sec-head"><h2 id="price-h">כמה זה עולה</h2><p>${vatLine} ${setupLine}</p></div>
<div>
<p class="figure"><span class="num">${figure}</span><span class="cur">₪</span><span class="per">לחודש</span></p>
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
