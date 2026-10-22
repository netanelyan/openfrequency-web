// Where a form lands without JS: a thank-you for each form, and a page for when it didn't go through (an invalid
// field, the rate limit, or the endpoint down, which Caddy sends here too). None of them is indexed.
import { esc } from '../lib.mjs';
import { WA_TEXT } from '../forms.mjs';

const plain = (path, title, body) => (cfg) => ({ path, title: `${title} | OpenFrequency`, description: title, noindex: true, closing: false, body: body(cfg) });

export const thanks = plain('/thanks', 'קיבלנו את הכתובת של החנות', (cfg) => `
<section class="sec after">
<div class="wrap narrow" data-rise>
<h1>קיבלנו את הכתובת של החנות</h1>
<p class="lede">תוך ${cfg.t('demo.time')} נשלח לכם לוואטסאפ לינק לעמוד עם הדמו. אם החנות לא על Shopify, נכתוב לכם ונגיד מה אפשר.</p>
<div class="actions"><a class="btn" href="/">לעמוד הבית</a></div>
</div>
</section>`);

export const thanksTeder = plain('/thanks/teder', 'רשמנו אתכם לרשימת ההמתנה של תדר', () => `
<section class="sec after">
<div class="wrap narrow" data-rise>
<h1>רשמנו אתכם לרשימת ההמתנה של תדר</h1>
<p class="lede">נכתוב לכם כשתדר ייפתח לחנויות. עד אז, אם יש לכם חנות, אפשר לבנות לה דמו של <a href="/toran">תורן</a>.</p>
<div class="actions"><a class="btn primary" href="/#demo">לבנות דמו לחנות</a><a class="btn" href="/">לעמוד הבית</a></div>
</div>
</section>`);

export const tryAgain = plain('/try-again', 'הפרטים לא הגיעו אלינו', (cfg) => {
  const wa = cfg.get('whatsapp');
  const button = wa
    ? `<a class="btn primary" href="https://wa.me/${wa}?text=${esc(encodeURIComponent(WA_TEXT.any))}">לשלוח בוואטסאפ</a>`
    : `<span class="btn primary">לשלוח בוואטסאפ ${cfg.ph('whatsapp')}</span>`;
  return `
<section class="sec after">
<div class="wrap narrow" data-rise>
<h1>הפרטים לא הגיעו אלינו</h1>
<p class="lede">הטופס לא נשלח. אפשר לשלוח לנו את הכתובת של החנות בוואטסאפ, או לנסות שוב בעוד כמה דקות.</p>
<div class="actions">${button}<a class="btn" href="/#demo">לנסות שוב</a></div>
</div>
</section>`;
});
