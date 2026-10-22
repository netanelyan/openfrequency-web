// The style kit: every token and component on one page, to check the look in both themes. Drafts only; the real
// build never writes it.
import { mark } from '../lib.mjs';

export default (cfg) => ({
  path: '/_kit',
  title: 'ערכת עיצוב, OpenFrequency',
  description: 'ערכת העיצוב של האתר, לבדיקה בלבד.',
  body: `
<style>
.kit h2 { margin-bottom: 20px; }
.kit .row { display: flex; flex-wrap: wrap; align-items: center; gap: 16px; }
.kit .tag { font: 500 12px/1.3 ui-monospace, Consolas, monospace; color: var(--ink-3); direction: ltr; }
.kit .sw { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 12px; }
.kit .sw div { padding: 14px; border-radius: 14px; background: var(--inset); box-shadow: inset 0 0 0 1px var(--line); }
.kit .sw i { display: block; height: 36px; margin-bottom: 8px; border-radius: 8px; box-shadow: inset 0 0 0 1px var(--line); }
.kit .panel { padding: 28px; }
.kit .stack > * + * { margin-top: 16px; }
</style>
<div class="kit">
<section class="sec">
<div class="wrap">
<p class="tag">h1 · lede</p>
<h1>מישהו שעונה בוואטסאפ של החנות שלכם, גם בשתיים בלילה</h1>
<p class="lede" style="max-width:60ch;margin-top:20px">תורן קורא את האתר של החנות ועונה ללקוחות בוואטסאפ. כשהוא לא יודע משהו, הוא שואל אתכם בוואטסאפ ושומר את התשובה לפעם הבאה.</p>
</div>
</section>

<section class="sec" style="padding-top:0">
<div class="wrap">
<h2>הסימנים</h2>
<div class="row">
${mark('openfrequency', 96, 'OpenFrequency')} ${mark('openfrequency', 48, 'OpenFrequency')} ${mark('openfrequency', 32, 'OpenFrequency')}
${mark('toran', 96, 'תורן')} ${mark('toran', 48, 'תורן')}
${mark('teder', 96, 'תדר')} ${mark('teder', 48, 'תדר')}
</div>
<p class="tag" style="margin-top:12px">openfrequency #2747D6 (5x5 at 48px and below) · toran #0F7A54 · teder #6A3FD6</p>
</div>
</section>

<section class="sec" style="padding-top:0">
<div class="wrap">
<h2>צבעים</h2>
<div class="sw">
<div><i style="background:var(--ink)"></i><span class="tag">--ink</span></div>
<div><i style="background:var(--ink-2)"></i><span class="tag">--ink-2</span></div>
<div><i style="background:var(--ink-p)"></i><span class="tag">--ink-p</span></div>
<div><i style="background:var(--ink-3)"></i><span class="tag">--ink-3</span></div>
<div><i style="background:var(--accent-fill)"></i><span class="tag">--accent-fill</span></div>
<div><i style="background:var(--accent-p)"></i><span class="tag">--accent-p</span></div>
<div><i style="background:var(--night)"></i><span class="tag">--night</span></div>
<div><i style="background:var(--fill)"></i><span class="tag">--fill</span></div>
</div>
</div>
</section>

<section class="sec" style="padding-top:0">
<div class="wrap narrow">
<div class="glass panel stack">
<p class="tag">.glass · h2 · h3 · body · buttons · field</p>
<h2>כמה זה עולה</h2>
<h3>מנוי חודשי</h3>
<p>פסקה רגילה בגוף הטקסט, ברוחב של עמודת טקסט. <a href="#">ככה נראה לינק בתוך משפט</a>, וככה נראה <mark class="ph">[פרט שחסר]</mark> בטיוטה.</p>
<p class="quiet">טקסט שקט, להערות ולפרטים קטנים.</p>
<label class="f">הכתובת של החנות<input type="url" placeholder="https://" dir="ltr"></label>
<div class="row"><a class="btn primary" href="#">לבנות דמו</a><a class="btn" href="#">כפתור משני</a><a class="btn primary sm" href="#">כפתור קטן</a></div>
</div>
</div>
</section>
</div>`,
});
