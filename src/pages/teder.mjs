// Teder's page, in the shape of Toran's, on its own violet: the headline and a button down to the demo form, beside its
// slideshows under TikTok and Instagram tabs; the one screen where the day's slideshows wait for approval; what it
// does alone and what is left for you; and the demo form at the end. What it does comes from openfrequency-teder's
// README ("What it does").
import { mark } from '../lib.mjs';
import { approvals, platformWindow } from '../teder.mjs';
import { demoForm } from '../forms.mjs';

const ALONE = [
  'כותב את המצגת בקול של החשבון, לפי מדריך הכתיבה שלו',
  'קורא רק ממקורות שאישרנו, וכל עובדה בשקופית נשענת על ציטוט מילה במילה',
  'מעצב את השקופיות, עם צילום ברישיון שנבדק מול השקופית או גרף מהמספרים שלה',
  'מכין כל מצגת בגודל של טיקטוק ובגודל של אינסטגרם',
  'מפרסם בשעה שנקבעה, ובשבת ובחג לא מפרסם',
];
const YOURS = ['לאשר כל מצגת לפני שהיא עולה. לחיצה אחת מאשרת אותה'];
const rows = (items, cls = '') => `<ul class="rows${cls ? ' ' + cls : ''}">${items.map((s) => `<li><span class="dot" aria-hidden="true"></span><span>${s}</span></li>`).join('')}</ul>`;

export default (cfg) => ({
  path: '/teder',
  forms: true,
  title: 'תדר, מצגות אוטומטיות בעברית לטיקטוק ולאינסטגרם | OpenFrequency',
  description: 'תדר כותב ומעצב מצגות בעברית לטיקטוק ולאינסטגרם, וכל מצגת עולה רק אחרי שמישהו אישר אותה.',
  body: `
<section class="thero" aria-labelledby="hero-h">
<div class="teder-field ch-field">
<div class="thero-text">
${mark('teder', 72, 'תדר')}
<h1 id="hero-h"><span class="hl">מצגות אוטומטיות</span> בעברית לטיקטוק ולאינסטגרם</h1>
<p class="lede">תדר כותב ומעצב את המצגות, ומפרסם כל אחת רק אחרי שמישהו אישר אותה. אותה מצגת יוצאת בגודל של טיקטוק ובגודל של אינסטגרם.</p>
<a class="btn primary hero-cta" href="#demo">לנסות את תדר על החנות שלכם</a>
</div>
${platformWindow()}
</div>
</section>

<section class="sec" id="approve" aria-labelledby="approve-h">
<div class="wrap side">
<div>
<h2 id="approve-h">כל המצגות של היום במסך אחד</h2>
<p class="lede">המצגות של היום מחכות לכם במסך אחד, כל אחת עם המקום שבו היא תעלה. לחיצה אחת מאשרת מצגת, והיא עולה בשעה שנקבעה.</p>
<p class="quiet">מצגת שלא אישרתם לא עולה.</p>
</div>
<div class="stage glass">${approvals()}</div>
</div>
</section>

<section class="sec" id="alone" aria-labelledby="alone-h">
<div class="wrap">
<div class="sec-head"><h2 id="alone-h">מה הוא עושה לבד, ומה נשאר לכם</h2></div>
<div class="two">
<div><h3>עושה לבד</h3>${rows(ALONE)}</div>
<div><h3>נשאר לכם</h3>${rows(YOURS, 'yours')}</div>
</div>
<p class="more">יש לכם עוד שאלות? <a href="/faq">כל השאלות והתשובות</a></p>
</div>
</section>

<section class="sec close-sec" aria-labelledby="demo-h">
<div class="wrap narrow">
<h2 id="demo-h">לנסות את תדר על החנות שלכם</h2>
<p class="lede">שולחים לנו את הכתובת של החנות, ואנחנו מכינים לכם מצגת לדוגמה מהאתר שלכם, בגודל של טיקטוק ושל אינסטגרם.</p>
${demoForm(cfg, '/teder', 'demo', 'teder')}
</div>
</section>`,
});
