// The two forms and every word they can show: the thank-you that takes a form's place, and the messages under the
// button. They live in the page as <template>s, which src/form.js copies in.
import { esc } from './lib.mjs';

// The first words of a WhatsApp message to us, when the endpoint can't take the form. {store} is the typed address.
export const WA_TEXT = {
  demo: 'היי, אשמח לדמו של תורן לחנות {store}',
  any: 'היי, אשמח לדמו של תורן לחנות שלי: ',
};

const honeypot = `<div class="hp" aria-hidden="true"><label>את השדה הזה משאירים ריק<input name="company" tabindex="-1" autocomplete="off"></label></div>`;

const open = (cfg, kind, page, cls, id = '') =>
  `<form class="${cls}"${id ? ` id="${id}"` : ''} action="/api/lead" method="post" data-form="${kind}" data-wa="${esc(cfg.get('whatsapp') || '')}" data-wa-text="${esc(WA_TEXT[kind])}">
<input type="hidden" name="source" value="${kind}">
<input type="hidden" name="page" value="${page}">
${honeypot}`;

// How long a demo takes, as the forms say it; until it is set, the public draft says only that it comes when ready.
const within = (cfg) => (cfg.has('demo.time') || cfg.banner ? `תוך ${cfg.t('demo.time')}` : null);

const status = (id) => `<div class="form-msg" id="msg-${id}" role="status" aria-live="polite" hidden></div>`;

// The demo form. A page can hold it twice (the first screen and the close), so each copy has its own id.
export function demoForm(cfg, page, id = 'demo') {
  return `${open(cfg, 'demo', page, 'demo', id)}
<label class="f">הכתובת של החנות<input name="store" type="text" inputmode="url" autocomplete="url" dir="ltr" placeholder="shop.co.il" required></label>
<label class="f">הוואטסאפ שלכם<input name="contact" type="tel" inputmode="tel" autocomplete="tel" dir="ltr" placeholder="050-0000000" required></label>
<button class="btn primary" type="submit">לבנות דמו</button>
<p class="when">${within(cfg) ? `הדמו מוכן ${within(cfg)}, ונשלח אותו למספר הזה.` : 'כשהדמו מוכן, נשלח אותו למספר הזה.'}</p>
${status(id)}
</form>`;
}

// Once per page that has a form.
export function formCopy(cfg) {
  const wa = '<a class="btn sm primary" data-wa href="#">לשלוח בוואטסאפ</a>';
  return `<template id="done-demo"><div class="done" tabindex="-1"><h3>קיבלנו את הכתובת של <bdi data-store></bdi></h3><p>${within(cfg) ? `${within(cfg)} נשלח` : 'כשהדמו מוכן, נשלח'} לכם לוואטסאפ לינק לעמוד עם הדמו. אם החנות לא על Shopify, נכתוב לכם ונגיד מה אפשר.</p></div></template>
<template id="msg-store"><p>הכתובת של החנות לא נראית לנו נכונה. אפשר לכתוב אותה כמו בדפדפן, למשל shop.co.il.</p></template>
<template id="msg-contact-demo"><p>צריך מספר נייד ישראלי, למשל 050-1234567, כדי שנוכל לשלוח לשם את הדמו.</p></template>
<template id="msg-dup"><p>כבר קיבלנו בקשה לדמו מהמספר הזה, והלינק יגיע לוואטסאפ הזה. לדמו לחנות נוספת, אפשר לכתוב לנו בוואטסאפ.</p>${wa}</template>
<template id="msg-rate"><p>קיבלנו כבר כמה פניות מהחיבור הזה בשעה האחרונה. אפשר לנסות שוב בעוד שעה, או לשלוח לנו בוואטסאפ.</p>${wa}</template>
<template id="msg-down"><p>משהו אצלנו לא עובד כרגע, והפרטים לא הגיעו אלינו. אפשר לשלוח לנו אותם בוואטסאפ.</p>${wa}</template>
<template id="msg-bad"><p>הטופס לא נשלח. אפשר לנסות שוב, או לשלוח לנו בוואטסאפ.</p>${wa}</template>`;
}
