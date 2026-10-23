// Where a form lands without JS: a thank-you for each form, one for a number that already asked for a demo, and a
// page for when it didn't go through (an invalid field, the rate limit, or the endpoint down, which Caddy sends here
// too). None of them is indexed.
import { esc } from '../lib.mjs';
import { WA_TEXT } from '../forms.mjs';

const plain = (path, title, body) => (cfg) => ({ path, title: `${title} | OpenFrequency`, description: title, noindex: true, body: body(cfg) });

export const thanks = plain('/thanks', 'קיבלנו את הכתובת של החנות', (cfg) => `
<section class="sec after">
<div class="wrap narrow" data-rise>
<h1>קיבלנו את הכתובת של החנות</h1>
<p class="lede">${cfg.has('demo.time') || cfg.banner ? `תוך ${cfg.t('demo.time')} נשלח` : 'כשהדמו מוכן, נשלח'} לכם לוואטסאפ לינק לעמוד עם הדמו. אם החנות לא על Shopify, נכתוב לכם ונגיד מה אפשר.</p>
<div class="actions"><a class="btn" href="/">לעמוד הבית</a></div>
</div>
</section>`);

// Our WhatsApp, for when the form can't take it; until we have a number, the public draft doesn't offer it.
const hasWa = (cfg) => cfg.has('whatsapp') || cfg.banner;
const waButton = (cfg, label) => {
  const wa = cfg.get('whatsapp');
  return wa
    ? `<a class="btn primary" href="https://wa.me/${wa}?text=${esc(encodeURIComponent(WA_TEXT.any))}">${label}</a>`
    : hasWa(cfg) ? `<span class="btn primary">${label} ${cfg.ph('whatsapp')}</span>` : '';
};

export const thanksAgain = plain('/thanks/already', 'כבר קיבלנו בקשה מהמספר הזה', (cfg) => `
<section class="sec after">
<div class="wrap narrow" data-rise>
<h1>כבר קיבלנו בקשה מהמספר הזה</h1>
<p class="lede">יש לנו כבר בקשה לדמו מהמספר הזה, והלינק יגיע לוואטסאפ שלו.${hasWa(cfg) ? ' לדמו לחנות נוספת, אפשר לכתוב לנו בוואטסאפ.' : ''}</p>
<div class="actions">${waButton(cfg, 'לכתוב לנו בוואטסאפ')}<a class="btn" href="/">לעמוד הבית</a></div>
</div>
</section>`);

export const tryAgain = plain('/try-again', 'הפרטים לא הגיעו אלינו', (cfg) => {
  const button = waButton(cfg, 'לשלוח בוואטסאפ');
  return `
<section class="sec after">
<div class="wrap narrow" data-rise>
<h1>הפרטים לא הגיעו אלינו</h1>
<p class="lede">${hasWa(cfg) ? 'הטופס לא נשלח. אפשר לשלוח לנו את הכתובת של החנות בוואטסאפ, או לנסות שוב בעוד כמה דקות.' : 'הטופס לא נשלח. אפשר לנסות שוב בעוד כמה דקות.'}</p>
<div class="actions">${button}<a class="btn" href="/toran#demo">לנסות שוב</a></div>
</div>
</section>`;
});
