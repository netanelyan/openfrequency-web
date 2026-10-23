// Teder's page: what it makes, on its own violet, with the waitlist in reach; the opening slide of a slideshow it
// made in each subject; and how a slideshow gets made, from openfrequency-teder's README ("What it does").
import { mark } from '../lib.mjs';
import { tederForm } from '../forms.mjs';
import { COVERS, cover, reel } from '../teder.mjs';

const MAKING = [
  ['קורא רק ממקורות שאישרנו', 'אתרים, פידים, ויקיפדיה ו-data.gov.il. ליד כל מקור כתוב למה סומכים עליו ומה מותר לקחת ממנו.'],
  ['כל עובדה עם ציטוט', 'כל עובדה בשקופית נשענת על ציטוט, מילה במילה, ממקור מאושר. מספר שלא מופיע בציטוט לא עולה על שקופית.'],
  ['כותב בקול של החשבון', 'לכל חשבון יש מדריך כתיבה משלו, עם שורות טובות ושורות רעות. שורה שנשמעת כמו מכונה נכתבת מחדש.'],
  ['מצייר כמו שהוא כותב', 'לפחות בחצי מהשקופיות יש תמונה, צילום ברישיון שנבדק מול השקופית, או גרף מהמספרים שלה.'],
  ['עולה רק אחרי אישור', 'יש מסך אחד עם המצגות של היום, ולחיצה אחת מאשרת כל מצגת. בשבת ובחג הוא לא מפרסם.'],
];

export default (cfg) => ({
  path: '/teder',
  forms: true,
  title: 'תדר, מצגות בעברית לטיקטוק ולאינסטגרם | OpenFrequency',
  description: 'תדר כותב ומעצב מצגות בעברית לטיקטוק ולאינסטגרם, וכל מצגת עולה רק אחרי שמישהו אישר אותה. אפשר להצטרף לרשימת ההמתנה.',
  body: `
<section class="thero" aria-labelledby="hero-h">
<div class="teder-field">
<div class="thero-text">
${mark('teder', 72)}
<h1 id="hero-h">מצגות בעברית לטיקטוק ולאינסטגרם</h1>
<p class="lede">תדר כותב ומעצב את המצגות, ומפרסם כל אחת רק אחרי שמישהו אישר אותה.</p>
<p>כרגע הוא עובד על שלושה חשבונות שלנו, בבינה מלאכותית, בכדורגל ובכסף. כשיהיו לנו תוצאות להראות, נפתח אותו גם לחנויות.</p>
<div id="wait">
${tederForm(cfg, '/teder')}
<p class="small">נכתוב לכם כשתדר ייפתח לחנויות.</p>
</div>
</div>
${reel}
</div>
</section>

<section class="sec slides-sec" aria-labelledby="slides-h">
<div class="wrap">
<div class="sec-head"><h2 id="slides-h">מצגות שתדר הכין</h2><p class="quiet">שקופית הפתיחה של מצגת אחת בכל נושא. שלושה נושאים מהחשבונות שלנו, ואחד מחשבון בדיוני שבנינו כדי להדגים.</p></div>
<div class="covers">
${COVERS.map(cover).join('\n')}
</div>
</div>
</section>

<section class="sec" id="making" aria-labelledby="making-h">
<div class="wrap narrow">
<div class="sec-head"><h2 id="making-h">ככה נבנית מצגת</h2></div>
<dl class="auto">
${MAKING.map(([t, d]) => `<div><dt>${t}</dt><dd>${d}</dd></div>`).join('\n')}
</dl>
</div>
</section>`,
});
