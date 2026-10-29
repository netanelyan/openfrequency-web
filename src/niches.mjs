// "What it does in a store like yours": the kinds of online store, listed like a chat inbox, each with the question
// its customers ask most; picking one shows what Toran and Teder do for that kind of store. Every line is something
// the products do (the site's own pages say the same): Toran answers from the store's site and hands on what isn't
// there, reminds about a cart and sends a tracking link to whoever agreed, on WhatsApp, Instagram, Messenger and email;
// Teder writes slideshows about the store's field.
//
// No script needed: each row is the label of a radio button, and the stylesheet shows the card of the one checked
// (style.css, .niche-sec). Up to 820px the list and the card are one panel: the kinds a row of chips on top, the card
// under them. site.js adds the search box (from 821px) and keeps the picked chip in view. The list can be focused
// (tabindex), so a keyboard can scroll the row of chips where it scrolls sideways.
// While Toran is soon (products.toran), each of Toran's lines carries "בקרוב", and the card's button is Teder's demo.
import { toranSoon } from './lib.mjs';

export const NICHES = [
  {
    id: 'fashion', icon: '👗', name: 'אופנה ובגדים', ask: 'יש את השמלה הזאת במידה M?', time: '11:02', unread: 2, words: 'בגדים שמלות נעליים תיקים אקססוריז fashion',
    lines: [
      ['תורן', 'עונה על מידות, צבעים ומלאי של כל פריט באתר'],
      ['תורן', 'מסביר החלפות והחזרות כמו שכתוב בדף המדיניות שלכם'],
      ['תורן', 'מזכיר על עגלה שנשארה פתוחה, למי שהסכים לקבל מכם הודעות'],
      ['תדר', 'מכין מצגות על שילובים, בדים וטרנדים'],
    ],
  },
  {
    id: 'beauty', icon: '💄', name: 'קוסמטיקה וטיפוח', ask: 'זה מתאים לעור רגיש?', time: '12:18', unread: 1, words: 'איפור טיפוח שיער עור בשמים קוסמטיקה',
    lines: [
      ['תורן', 'עונה על רכיבים, נפח ואופן שימוש, מתוך דף המוצר'],
      ['תורן', 'מעביר אליכם שאלה שלא כתובה באתר, כמו התאמה לעור, וזוכר את התשובה שלכם'],
      ['תורן', 'שולח למי שהזמין לינק למעקב אחרי המשלוח'],
      ['תדר', 'מכין מצגות על שגרות טיפוח ועל מה שעומד מאחורי רכיבים מוכרים'],
    ],
  },
  {
    id: 'home', icon: '🛋️', name: 'בית ועיצוב', ask: 'תוך כמה זמן הספה מגיעה?', time: '10:47', unread: 1, words: 'רהיטים עיצוב מטבח כלי בית תאורה',
    lines: [
      ['תורן', 'עונה על מידות, חומרים וצבעים של כל רהיט'],
      ['תורן', 'מסביר זמני משלוח והרכבה כמו שכתוב באתר'],
      ['תורן', 'מעביר אליכם מה שלא כתוב, כמו הובלה לקומה רביעית בלי מעלית'],
      ['תדר', 'מכין מצגות על סגנונות עיצוב ורעיונות לחלל קטן'],
    ],
  },
  {
    id: 'tech', icon: '🎧', name: 'אלקטרוניקה וגאדג׳טים', ask: 'יש אחריות על האוזניות?', time: '15:30', unread: 0, words: 'אלקטרוניקה גאדג׳טים טלפונים מחשבים אוזניות',
    lines: [
      ['תורן', 'עונה על מפרט, תאימות ומחיר, מתוך דף המוצר'],
      ['תורן', 'מסביר אחריות והחזרות לפי דף המדיניות שלכם'],
      ['תורן', 'עונה גם באינסטגרם, במסנג׳ר ובמייל, וכל השיחות מגיעות לתיבה אחת'],
      ['תדר', 'מכין מצגות שמסבירות איך דברים עובדים, מסוללות ועד בלוטות׳'],
    ],
  },
  {
    id: 'kids', icon: '🧸', name: 'ילדים וצעצועים', ask: 'מאיזה גיל זה מתאים?', time: '20:15', unread: 3, words: 'ילדים תינוקות צעצועים משחקים',
    lines: [
      ['תורן', 'עונה על גילאים, מידות והוראות בטיחות כמו שכתוב בדף המוצר'],
      ['תורן', 'עונה גם בלילה, כשההורים סוף סוף פנויים לקנות'],
      ['תורן', 'מזכיר על עגלה שנשארה פתוחה, למי שהסכים לקבל מכם הודעות'],
      ['תדר', 'מכין מצגות על משחקים לפי גיל ורעיונות למתנות'],
    ],
  },
  {
    id: 'food', icon: '☕', name: 'אוכל, קפה ומעדנים', ask: 'מתי המשלוח הבא לחיפה?', time: '09:12', unread: 0, words: 'אוכל קפה תה יין מעדנים שוקולד',
    lines: [
      ['תורן', 'עונה על טעמים, משקל ותאריכי משלוח, מתוך האתר'],
      ['תורן', 'מסביר אזורי משלוח ומחירים כמו שכתוב בדף המשלוחים'],
      ['תורן', 'שולח למי שהזמין לינק למעקב אחרי המשלוח'],
      ['תדר', 'מכין מצגות על מקור הפולים, דרכי חליטה ומתכונים'],
    ],
  },
  {
    id: 'sport', icon: '⚽', name: 'ספורט ואוהדים', ask: 'יש חולצה של ברזיל במידה L?', time: '18:40', unread: 1, words: 'ספורט כדורגל חולצות אוהדים כושר',
    lines: [
      ['תורן', 'עונה על מידות וגרסאות של כל חולצה, ועל מה שנשאר במלאי'],
      ['תורן', 'עונה בוואטסאפ ובאינסטגרם, ושיחות משני המקומות מגיעות לתיבה אחת'],
      ['תורן', 'מעביר אליכם שאלה שהוא לא יודע, ובפעם הבאה הוא כבר יודע'],
      ['תדר', 'מכין מצגות על רגעים גדולים מהמגרש ועל הסיפור שמאחורי החולצות'],
    ],
  },
  {
    id: 'pets', icon: '🐾', name: 'חיות מחמד', ask: 'האוכל הזה מתאים לגור?', time: '13:05', unread: 0, words: 'חיות מחמד כלבים חתולים אוכל לכלבים',
    lines: [
      ['תורן', 'עונה על משקל, רכיבים וגיל מומלץ כמו שכתוב בדף המוצר'],
      ['תורן', 'מעביר אליכם שאלה שלא כתובה באתר, ובפעם הבאה הוא כבר יודע'],
      ['תורן', 'מזכיר על עגלה שנשארה פתוחה, למי שהסכים לקבל מכם הודעות'],
      ['תדר', 'מכין מצגות על גזעים, אילוף והרגלים של חיות מחמד'],
    ],
  },
];

const searchIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4"/></svg>';

export const niches = (cfg) => {
  const soon = toranSoon(cfg);
  const who = (p) => (soon && p === 'תורן' ? `<b>${p}</b> <span class="soon">בקרוב</span>` : `<b>${p}</b>`);
  return `
<section class="sec niche-sec" id="stores" aria-labelledby="niche-h">
<div class="wrap">
<div class="sec-head"><h2 id="niche-h">מה OpenFrequency עושה בחנות כמו שלכם?</h2><p class="lede">בחרו את סוג החנות שלכם ותראו</p></div>
<div class="niches">
${NICHES.map((n, i) => `<input type="radio" name="niche" id="niche-${n.id}" class="niche-pick"${i === 0 ? ' checked' : ''}>`).join('')}
<div class="niche-list glass" role="group" aria-label="סוגי החנויות" tabindex="0">
<label class="niche-search" data-niche-search hidden>${searchIcon}<input type="search" placeholder="חפשו את סוג החנות שלכם" aria-label="חיפוש סוג חנות" autocomplete="off"></label>
${NICHES.map((n) => `<label for="niche-${n.id}" class="niche-row" data-niche-row data-words="${n.name} ${n.words}"><span class="niche-ava" aria-hidden="true">${n.icon}</span><span class="niche-t"><b>${n.name}</b><small>${n.ask}</small></span><span class="niche-meta"><time>${n.time}</time>${n.unread ? `<i class="niche-badge" aria-hidden="true">${n.unread}</i>` : ''}</span></label>`).join('\n')}
<p class="niche-none" data-niche-none hidden>${soon ? 'לא מצאנו את סוג החנות הזה. תדר עובד מתוך האתר של החנות, אז אפשר לנסות אותו על החנות שלכם.' : 'לא מצאנו את סוג החנות הזה. תורן ותדר עובדים מתוך האתר של החנות, אז אפשר לנסות אותם על החנות שלכם.'}</p>
</div>
<div class="niche-cards" data-niche-cards>
${NICHES.map((n) => `<article class="niche-card glass" data-niche="${n.id}" aria-label="${n.name}">
<span class="niche-ava big" aria-hidden="true">${n.icon}</span>
<h3>${n.name}</h3>
<ul class="checks">${n.lines.map(([p, t]) => `<li>${who(p)} ${t}</li>`).join('')}</ul>
${soon ? '<a class="btn primary" href="/join">לנסות את תדר על החנות שלכם</a>\n<p class="niche-note">המצגת לדוגמה נבנית מהאתר שלכם</p>' : '<a class="btn primary" href="/join">לנסות על החנות שלכם</a>\n<p class="niche-note">הדמו נבנה מהמוצרים שבאתר שלכם</p>'}
</article>`).join('\n')}
</div>
</div>
</div>
</section>`;
};
