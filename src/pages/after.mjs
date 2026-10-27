// Where a form lands without JS: a thank-you for each form, one for a number that already asked for a demo, and a
// page for when it didn't go through (an invalid field, the rate limit, or the endpoint down, which Caddy sends here
// too). None of them is indexed.
import { esc, toranSoon } from '../lib.mjs';
import { waAny } from '../forms.mjs';

const plain = (path, title, body) => (cfg) => ({ path, title: `${title} | OpenFrequency`, description: title, noindex: true, body: body(cfg) });

export const thanks = plain('/thanks', 'קיבלנו את הכתובת של החנות', (cfg) => `
<section class="sec after">
<div class="wrap narrow" data-rise>
<h1>קיבלנו את הכתובת של החנות</h1>
<p class="lede">${cfg.has('demo.time') || cfg.banner ? `תוך ${cfg.t('demo.time')} נשלח` : 'כשהדמו מוכן, נשלח'} לכם לוואטסאפ לינק לעמוד עם הדמו. אם החנות לא על Shopify, WooCommerce או Wix, נכתוב לכם ונגיד מה אפשר.</p>
<div class="actions"><a class="btn" href="/">לעמוד הבית</a></div>
</div>
</section>`);

// Our WhatsApp, for when the form can't take it; until we have a number, the public draft doesn't offer it.
const hasWa = (cfg) => cfg.has('whatsapp') || cfg.banner;
const waButton = (cfg, label) => {
  const wa = cfg.get('whatsapp');
  return wa
    ? `<a class="btn primary" href="https://wa.me/${wa}?text=${esc(encodeURIComponent(waAny(cfg)))}">${label}</a>`
    : hasWa(cfg) ? `<span class="btn primary">${label} ${cfg.ph('whatsapp')}</span>` : '';
};

export const thanksTeder = plain('/thanks/teder', 'קיבלנו את הכתובת של החנות', () => `
<section class="sec after">
<div class="wrap narrow" data-rise>
<h1>קיבלנו את הכתובת של החנות</h1>
<p class="lede">כשהמצגת לדוגמה מוכנה, נשלח לכם אותה לוואטסאפ, בגודל של טיקטוק ושל אינסטגרם.</p>
<div class="actions"><a class="btn" href="/teder">חזרה לתדר</a></div>
</div>
</section>`);

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
<div class="actions">${button}<a class="btn" href="${toranSoon(cfg) ? '/join' : '/toran#demo'}">לנסות שוב</a></div>
</div>
</section>`;
});

// Toran's waitlist, posted without JS (built only while Toran is soon).
export const thanksWaitlist = plain('/thanks/waitlist', 'רשמנו אתכם', () => `
<section class="sec after">
<div class="wrap narrow" data-rise>
<h1>רשמנו אתכם</h1>
<p class="lede">כשתורן נפתח, נכתוב לכם לטלפון או למייל שהשארתם. בינתיים אפשר להכיר את תדר.</p>
<div class="actions"><a class="btn" href="/teder">לתדר</a><a class="btn" href="/">לעמוד הבית</a></div>
</div>
</section>`);

// The 404 page: Caddy answers any address that isn't there with it, with its 404 status (handle_errors).
export const notFound = (cfg) => ({ ...plain('/404', 'הדף הזה לא קיים', () => `
<section class="sec after">
<div class="wrap narrow" data-rise>
<h1>הדף הזה לא קיים</h1>
<p class="lede">אולי הקישור השתנה, ואולי משהו אצלנו נשבר. מכאן אפשר להמשיך:</p>
<div class="actions"><a class="btn primary" href="/">לעמוד הבית</a><a class="btn" href="/toran">תורן</a><a class="btn" href="/teder">תדר</a><a class="btn" href="/faq">שאלות</a></div>
</div>
</section>`)(cfg), file: '404.html' });
