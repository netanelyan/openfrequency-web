// The demo forms, Toran's and Teder's, and every word they can show: the thank-you that takes a form's place, and the messages under the
// button. They live in the page as <template>s, which src/form.js copies in.
import { esc, mark } from './lib.mjs';

// The first words of a WhatsApp message to us, when the endpoint can't take the form. {store} is the typed address.
export const WA_TEXT = {
  demo: 'היי, אשמח לדמו של תורן לחנות {store}',
  teder: 'היי, אשמח למצגת לדוגמה של תדר לחנות {store}',
  join: 'היי, אשמח להצטרף עם החנות {store}',
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

// A demo form: Toran's (kind 'demo') or Teder's (kind 'teder'), the same two fields. A page can hold one twice (the
// first screen and the close), so each copy has its own id.
const KIND = {
  demo: { button: 'לנסות את תורן', when: (cfg) => (within(cfg) ? `הדמו מוכן ${within(cfg)}, ונשלח אותו למספר הזה.` : 'כשהדמו מוכן, נשלח אותו למספר הזה.') },
  teder: { button: 'לנסות את תדר', when: () => 'כשהמצגת לדוגמה מוכנה, נשלח אותה למספר הזה.' },
};
export function demoForm(cfg, page, id = 'demo', kind = 'demo') {
  return `${open(cfg, kind, page, 'demo', id)}
<label class="f">הכתובת של החנות<input name="store" type="text" inputmode="url" autocomplete="url" dir="ltr" placeholder="shop.co.il" required></label>
<label class="f">הוואטסאפ שלכם<input name="contact" type="tel" inputmode="tel" autocomplete="tel" dir="ltr" placeholder="050-0000000" required></label>
<button class="btn primary" type="submit">${KIND[kind].button}</button>
<p class="when">${KIND[kind].when(cfg)}</p>
${status(id)}
</form>`;
}

// The join page's form: Toran, Teder or both, ticked on a card each, then the same two fields. Toran is ticked to start
// with; a link to /join?p=teder ticks Teder instead (form.js).
export function joinForm(cfg) {
  const card = (name, label, what, on) => `<label class="pick"><input type="checkbox" name="${name === 'toran' ? 'toran' : 'teder'}" value="1"${on ? ' checked' : ''}><span class="pick-box">${mark(name, 44)}<span><b>${label}</b><small>${what}</small></span><span class="pick-tick" aria-hidden="true"></span></span></label>`;
  return `${open(cfg, 'join', '/join', 'demo join', 'join')}
<fieldset class="picks"><legend>במה מתחילים</legend>
<div class="pick-row">
${card('toran', 'תורן', 'עונה ללקוחות של החנות בוואטסאפ, באינסטגרם, במסנג׳ר ובמייל', true)}
${card('teder', 'תדר', 'כותב ומעצב מצגות בעברית לטיקטוק ולאינסטגרם', false)}
</div>
</fieldset>
<label class="f">הכתובת של החנות<input name="store" type="text" inputmode="url" autocomplete="url" dir="ltr" placeholder="shop.co.il" required></label>
<label class="f">הוואטסאפ שלכם<input name="contact" type="tel" inputmode="tel" autocomplete="tel" dir="ltr" placeholder="050-0000000" required></label>
<button class="btn primary" type="submit">להצטרף</button>
<p class="when">הלינק לדמו יגיע למספר הזה.</p>
${status('join')}
</form>`;
}

// Once per page that has a form.
export function formCopy(cfg) {
  const wa = '<a class="btn sm primary" data-wa href="#">לשלוח בוואטסאפ</a>';
  return `<template id="done-demo"><div class="done" tabindex="-1"><h3>קיבלנו את הכתובת של <bdi data-store></bdi></h3><p>${within(cfg) ? `${within(cfg)} נשלח` : 'כשהדמו מוכן, נשלח'} לכם לוואטסאפ לינק לעמוד עם הדמו. אם החנות לא על Shopify, נכתוב לכם ונגיד מה אפשר.</p></div></template>
<template id="done-teder"><div class="done" tabindex="-1"><h3>קיבלנו את הכתובת של <bdi data-store></bdi></h3><p>כשהמצגת לדוגמה מוכנה, נשלח לכם אותה לוואטסאפ, בגודל של טיקטוק ושל אינסטגרם.</p></div></template>
<template id="done-join"><div class="done" tabindex="-1"><h3>קיבלנו את הכתובת של <bdi data-store></bdi></h3><p>אנחנו בונים לכם דמו מהאתר, והלינק יגיע אליכם לוואטסאפ. אם החנות לא על Shopify, נכתוב לכם ונגיד מה אפשר.</p></div></template>
<template id="msg-products"><p>צריך לבחור לפחות אחד, תורן או תדר.</p></template>
<template id="msg-contact-join"><p>צריך מספר נייד ישראלי, למשל 050-1234567, כדי שנוכל לשלוח לשם את הדמו.</p></template>
<template id="msg-store"><p>הכתובת של החנות לא נראית לנו נכונה. אפשר לכתוב אותה כמו בדפדפן, למשל shop.co.il.</p></template>
<template id="msg-contact-demo"><p>צריך מספר נייד ישראלי, למשל 050-1234567, כדי שנוכל לשלוח לשם את הדמו.</p></template>
<template id="msg-contact-teder"><p>צריך מספר נייד ישראלי, למשל 050-1234567, כדי שנוכל לשלוח לשם את המצגת.</p></template>
<template id="msg-dup"><p>כבר קיבלנו מהמספר הזה בקשה כזאת, והתשובה תגיע לוואטסאפ שלו. לחנות נוספת, אפשר לכתוב לנו בוואטסאפ.</p>${wa}</template>
<template id="msg-rate"><p>קיבלנו כבר כמה פניות מהחיבור הזה בשעה האחרונה. אפשר לנסות שוב בעוד שעה, או לשלוח לנו בוואטסאפ.</p>${wa}</template>
<template id="msg-down"><p>משהו אצלנו לא עובד כרגע, והפרטים לא הגיעו אלינו. אפשר לשלוח לנו אותם בוואטסאפ.</p>${wa}</template>
<template id="msg-bad"><p>הטופס לא נשלח. אפשר לנסות שוב, או לשלוח לנו בוואטסאפ.</p>${wa}</template>`;
}
