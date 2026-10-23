// The two forms and every word they can show: the thank-you that takes a form's place, and the messages under the
// button. They live in the page as <template>s, which src/form.js copies in.
import { esc } from './lib.mjs';

// The first words of a WhatsApp message to us, when the endpoint can't take the form. {store} is the typed address.
export const WA_TEXT = {
  demo: 'היי, אשמח לדמו של תורן לחנות {store}',
  teder: 'היי, אשמח להצטרף לרשימת ההמתנה של תדר',
  any: 'היי, אשמח לדמו של תורן לחנות שלי: ',
};

const honeypot = `<div class="hp" aria-hidden="true"><label>את השדה הזה משאירים ריק<input name="company" tabindex="-1" autocomplete="off"></label></div>`;

const open = (cfg, kind, page, cls, id = '') =>
  `<form class="${cls}"${id ? ` id="${id}"` : ''} action="/api/lead" method="post" data-form="${kind}" data-wa="${esc(cfg.get('whatsapp') || '')}" data-wa-text="${esc(WA_TEXT[kind])}">
<input type="hidden" name="source" value="${kind}">
<input type="hidden" name="page" value="${page}">
${honeypot}`;

const status = (id) => `<div class="form-msg" id="msg-${id}" role="status" aria-live="polite" hidden></div>`;

// The demo form. A page can hold it twice (the first screen and the close), so each copy has its own id. It asks only
// for the store's address: the number comes from the WhatsApp message that confirms the request (server/lead.mjs).
export function demoForm(cfg, page, id = 'demo') {
  return `${open(cfg, 'demo', page, 'demo', id)}
<label class="f">הכתובת של החנות<input name="store" type="text" inputmode="url" autocomplete="url" dir="ltr" placeholder="shop.co.il" required></label>
<button class="btn primary" type="submit">לבנות דמו</button>
<p class="when">אחרי הטופס שולחים לנו הודעה אחת בוואטסאפ, והדמו מוכן תוך ${cfg.t('demo.time')}.</p>
${status(id)}
</form>`;
}

export function tederForm(cfg, page) {
  return `${open(cfg, 'teder', page, 'wait')}
<label class="f">הוואטסאפ או המייל שלכם<input name="contact" type="text" autocomplete="email" dir="ltr" required></label>
<button class="btn" type="submit">להצטרף לרשימת ההמתנה</button>
${status('teder')}
</form>`;
}

// Once per page that has a form.
export function formCopy(cfg) {
  const wa = '<a class="btn sm primary" data-wa href="#">לשלוח בוואטסאפ</a>';
  return `<template id="done-demo"><div class="done" tabindex="-1"><h3>נשארה הודעה אחת בוואטסאפ</h3><p>ככה נדע שהבקשה שלכם. ההודעה כבר כתובה, עם הקוד של הבקשה, ונשאר רק לשלוח אותה. אחרי שהיא מגיעה, הדמו של <bdi data-store></bdi> מוכן תוך ${cfg.t('demo.time')}, והלינק מגיע לאותה שיחה.</p><a class="btn primary" data-req-wa href="#">לשלוח את ההודעה בוואטסאפ</a></div></template>
<template id="done-teder"><div class="done" tabindex="-1"><h3>רשמנו אתכם</h3><p>נכתוב לכם כשתדר ייפתח לחנויות.</p></div></template>
<template id="msg-store"><p>הכתובת של החנות לא נראית לנו נכונה. אפשר לכתוב אותה כמו בדפדפן, למשל shop.co.il.</p></template>
<template id="msg-contact-teder"><p>צריך מספר וואטסאפ או כתובת מייל, כדי שנוכל לכתוב לכם.</p></template>
<template id="msg-rate"><p>קיבלנו כבר כמה פניות מהחיבור הזה בשעה האחרונה. אפשר לנסות שוב בעוד שעה, או לשלוח לנו בוואטסאפ.</p>${wa}</template>
<template id="msg-down"><p>משהו אצלנו לא עובד כרגע, והפרטים לא הגיעו אלינו. אפשר לשלוח לנו אותם בוואטסאפ.</p>${wa}</template>
<template id="msg-bad"><p>הטופס לא נשלח. אפשר לנסות שוב, או לשלוח לנו בוואטסאפ.</p>${wa}</template>`;
}
