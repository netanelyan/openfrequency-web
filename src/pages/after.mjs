// Where a form lands without JS: the waitlist's thank-you, and a page for when it didn't go through (an invalid field,
// the rate limit, or the endpoint down, which Caddy sends here too). A demo request needs no page of its own: the
// endpoint sends it straight to WhatsApp, to the message that confirms it. None of them is indexed.
import { esc } from '../lib.mjs';
import { WA_TEXT } from '../forms.mjs';

const plain = (path, title, body) => (cfg) => ({ path, title: `${title} | OpenFrequency`, description: title, noindex: true, body: body(cfg) });

export const thanksTeder = plain('/thanks/teder', 'רשמנו אתכם לרשימת ההמתנה של תדר', () => `
<section class="sec after">
<div class="wrap narrow" data-rise>
<h1>רשמנו אתכם לרשימת ההמתנה של תדר</h1>
<p class="lede">נכתוב לכם כשתדר ייפתח לחנויות. עד אז, אם יש לכם חנות, אפשר לבנות לה דמו של <a href="/toran">תורן</a>.</p>
<div class="actions"><a class="btn primary" href="/toran#demo">לבנות דמו לחנות</a><a class="btn" href="/">לעמוד הבית</a></div>
</div>
</section>`);

// Our WhatsApp, for when the form can't take it.
const waButton = (cfg, label) => {
  const wa = cfg.get('whatsapp');
  return wa
    ? `<a class="btn primary" href="https://wa.me/${wa}?text=${esc(encodeURIComponent(WA_TEXT.any))}">${label}</a>`
    : `<span class="btn primary">${label} ${cfg.ph('whatsapp')}</span>`;
};

export const tryAgain = plain('/try-again', 'הפרטים לא הגיעו אלינו', (cfg) => {
  const button = waButton(cfg, 'לשלוח בוואטסאפ');
  return `
<section class="sec after">
<div class="wrap narrow" data-rise>
<h1>הפרטים לא הגיעו אלינו</h1>
<p class="lede">הטופס לא נשלח. אפשר לשלוח לנו את הכתובת של החנות בוואטסאפ, או לנסות שוב בעוד כמה דקות.</p>
<div class="actions">${button}<a class="btn" href="/toran#demo">לנסות שוב</a></div>
</div>
</section>`;
});
