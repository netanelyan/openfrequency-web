// Toran's page: everything about Toran, in the order an owner asks it. The chat and the form; how it goes; what
// happens to a question it can't answer; what it answers alone; a day on duty; its eval; the messages it sends by
// itself; the owner's own chat with it; the price; the owners' questions; and, last, which of that works today.
import { esc, mark } from '../lib.mjs';
import { chat } from '../chat.mjs';
import { hero, how, day, proof, price, faq } from '../sections.mjs';

// One question, seen on both phones. The customer's side continues the home page's sample chat; the owner's side is
// how Toran asks and what it does with the answer. Made up, and the captions say so.
const customer = chat({
  id: 'pair-c', who: 'החנות שלכם', sub: 'בטלפון של הלקוח', face: 'ח', tag: '', names: { me: 'לקוח', them: 'החנות' },
  msgs: [
    ['me', '02:16', 'ואפשר לאסוף מהמחסן?', false, 1],
    ['them', '02:16', 'את זה אני לא יודע. אני בודק עם החנות, ואחזור אליך כאן.', false, 2],
    ['them', '08:21', 'בדקתי. אפשר לאסוף מהמחסן בימים א׳ עד ה׳, עד 17:00.', false, 6],
  ],
});
const owner = chat({
  id: 'pair-o', who: 'תורן', sub: 'בטלפון שלכם', face: mark('toran', 36), tag: '', names: { me: 'אתם', them: 'תורן' },
  msgs: [
    ['them', '02:16', 'לקוח שואל אם אפשר לאסוף מהמחסן. זה לא כתוב באתר. מה לענות לו?', false, 3],
    ['me', '08:20', 'כן, בימים א׳ עד ה׳ עד 17:00', false, 4],
    ['them', '08:21', 'שלחתי לו. שמרתי את זה, ומהפעם הבאה אני עונה על זה לבד.', false, 5],
  ],
});

const talk = chat({
  id: 'talk-cap', who: 'תורן', face: mark('toran', 36), names: { me: 'אתם', them: 'תורן' },
  caption: 'שיחה לדוגמה. ההודעות מומצאות.',
  msgs: [
    ['me', '10:02', 'מהיום יש משלוח חינם בהזמנה מעל 300 ₪'],
    ['them', '10:02', 'רשמתי. מעכשיו אני עונה ללקוחות שמעל 300 ₪ המשלוח חינם.'],
    ['me', '18:40', 'על מה לא ידעת לענות השבוע?'],
    ['them', '18:40', 'על שלושה דברים. איסוף מהמחסן, שכבר עניתם עליו, אריזת מתנה ומשלוח לחו״ל. אפשר לענות לי על השניים האחרים כאן.'],
  ],
});

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

const AUTO = [
  ['עגלה נטושה', 'תזכורת ללקוח שהשאיר מוצרים בעגלה ולא סיים את ההזמנה.'],
  ['התשלום עבר', 'אישור שההזמנה התקבלה, עם מה שהוזמן.'],
  ['ההזמנה יצאה', 'עדכון שהחבילה בדרך, עם מספר המעקב כשיש.'],
  ['בקשה לביקורת', 'אחרי שההזמנה הגיעה, בקשה לכתוב כמה מילים על מה שקנו.'],
];

// A list of rows, each with a dot in the colour of who handles it. Items are HTML.
const rows = (items, cls = '') => `<ul class="rows${cls ? ' ' + cls : ''}">${items.map((s) => `<li><span class="dot" aria-hidden="true"></span><span>${s}</span></li>`).join('')}</ul>`;
// A list from site.config.json: each sentence escaped, or one placeholder in a draft.
const fromConfig = (cfg, key) => cfg.get(key)?.map(esc) ?? [cfg.ph(key)];

export default (cfg) => ({
  path: '/toran',
  forms: true,
  closing: true,
  photos: true,
  title: 'תורן, מישהו שעונה בוואטסאפ של החנות שלכם | OpenFrequency',
  description: 'תורן עונה ללקוחות של החנות בוואטסאפ מתוך מה שכתוב באתר, גם בלילה. מה שאין באתר הוא שואל אתכם, ואת התשובה הוא זוכר. כאן גם המחיר, ומה עובד היום ומה עוד לא.',
  body: [
    hero(cfg),
    how(cfg),
    `
<section class="sec" id="handoff" aria-labelledby="handoff-h">
<div class="wrap">
<div class="sec-head">
<h2 id="handoff-h">כשהוא לא יודע, הוא שואל אתכם</h2>
<p class="lede">כשלקוח שואל משהו שאין עליו תשובה באתר, תורן אומר לו שהוא בודק, ושולח לכם את השאלה בוואטסאפ. אתם עונים במשפט, הוא מעביר ללקוח, ומהפעם הבאה הוא עונה על זה לבד.</p>
</div>
<div class="stage glass" data-play>
<div class="pair">
${customer}
${owner}
</div>
</div>
<p class="quiet small pair-note">שיחה לדוגמה, משני הצדדים. ההודעות מומצאות.</p>
</div>
</section>

<section class="sec" id="alone" aria-labelledby="alone-h">
<div class="wrap">
<div class="sec-head"><h2 id="alone-h">מה הוא עונה לבד, ומה הוא משאיר לכם</h2></div>
<div class="two">
<div><h3>עונה לבד</h3>${rows(ALONE)}</div>
<div><h3>משאיר לכם</h3>${rows(YOURS, 'yours')}</div>
</div>
</div>
</section>`,
    day,
    proof,
    `
<section class="sec" id="auto" aria-labelledby="auto-h">
<div class="wrap narrow">
<div class="sec-head">
<h2 id="auto-h">הודעות שיוצאות לבד</h2>
<p class="lede">חוץ מלענות, תורן יכול לשלוח ארבע הודעות לפי מה שקורה בחנות. הן יוצאות רק ללקוחות שאישרו לקבל מהחנות הודעות בוואטסאפ, ו-Meta גובה על כל אחת מהן (<a href="#price">כמה זה עולה</a>).</p>
</div>
<dl class="auto">
${AUTO.map(([t, d]) => `<div><dt>${t}</dt><dd>${d}</dd></div>`).join('\n')}
</dl>
</div>
</section>

<section class="sec" id="talk" aria-labelledby="talk-h">
<div class="wrap side">
<div>
<h2 id="talk-h">ואפשר גם לכתוב לו</h2>
<p class="lede">כותבים לתורן בוואטסאפ כמו לעובד בחנות. מספרים לו על מבצע חדש, מעדכנים זמן משלוח, או שואלים על מה לקוחות שאלו השבוע.</p>
</div>
<div class="stage glass">${talk}</div>
</div>
</section>`,
    price(cfg),
    faq(cfg),
    `
<section class="sec" id="status" aria-labelledby="status-h">
<div class="wrap">
<div class="sec-head"><h2 id="status-h">מה עובד היום, ומה עוד לא</h2></div>
<div class="two">
<div><h3>עובד היום</h3>${rows(fromConfig(cfg, 'toran.today'))}</div>
<div><h3>עוד לא</h3>${rows(fromConfig(cfg, 'toran.notYet'), 'later')}</div>
</div>
</div>
</section>`,
  ].join('\n'),
});
