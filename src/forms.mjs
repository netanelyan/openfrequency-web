// The demo forms, Toran's and Teder's, and every word they can show: the thank-you that takes a form's place, and the messages under the
// button. They live in the page as <template>s, which src/form.js copies in.
// While sign-up is open (signup in site.config.json), joining Teder is accounts' sign-up, so Teder's forms ask for what
// they send, a sample slideshow, and the join form's button no longer says "join".
import { esc, mark, signupOpen, toranSoon } from './lib.mjs';

// The first words of a WhatsApp message to us, when the endpoint can't take the form. {store} is the typed address.
export const WA_TEXT = {
  demo: 'היי, אשמח לדמו של תורן לחנות {store}',
  teder: 'היי, אשמח למצגת לדוגמה של תדר לחנות {store}',
  join: 'היי, אשמח להצטרף עם החנות {store}',
  any: 'היי, אשמח לדמו של תורן לחנות שלי: ',
  waitlist: 'היי, אשמח לעדכון כשתורן נפתח',
};
// What a WhatsApp message to us starts with on the pages a form lands on; while Toran is soon, Teder's.
export const waAny = (cfg) => (toranSoon(cfg) ? 'היי, אשמח למצגת לדוגמה של תדר לחנות שלי: ' : WA_TEXT.any);

const honeypot = `<div class="hp" aria-hidden="true"><label>את השדה הזה משאירים ריק<input name="company" tabindex="-1" autocomplete="off"></label></div>`;

const open = (cfg, kind, page, cls, id = '') =>
  `<form class="${cls}"${id ? ` id="${id}"` : ''} action="/api/lead" method="post" data-form="${kind}" data-wa="${esc(cfg.get('whatsapp') || '')}" data-wa-text="${esc(WA_TEXT[kind])}">
<input type="hidden" name="source" value="${kind}">
<input type="hidden" name="page" value="${page}">
${honeypot}`;

// How long a demo takes, as the forms say it; until it is set, the public draft says only that it comes when ready.
const within = (cfg) => (cfg.has('demo.time') || cfg.banner ? `תוך ${cfg.t('demo.time')}` : null);

const status = (id) => `<div class="form-msg" id="msg-${id}" role="status" aria-live="polite" hidden></div>`;

// A demo form: Toran's (kind 'demo') or Teder's (kind 'teder'). A page can hold one twice (the first screen and the
// close), so each copy has its own id. Toran's takes the store's address only: its answer is a code and a button that
// writes it to Toran's demo number on WhatsApp, and the number that sends it is the one the demo answers. Teder's takes
// a WhatsApp number too, to send the slideshow to.
const storeField = (wide) => `<label class="f${wide ? ' wide' : ''}">הכתובת של החנות<input name="store" type="text" inputmode="url" autocomplete="url" dir="ltr" placeholder="shop.co.il" required></label>`;
const contactField = (label, required = true) => `<label class="f">${label}<input name="contact" type="tel" inputmode="tel" autocomplete="tel" dir="ltr" placeholder="050-0000000"${required ? ' required' : ''}></label>`;
const toranWhen = (cfg) => `בשלב הבא שולחים לנו הודעה מוכנה בוואטסאפ, ו${within(cfg) ? `${within(cfg)} נשלח לשם את הדמו.` : 'לשם נשלח את הדמו כשהוא מוכן.'}`;
const tederWhen = 'כשהמצגת לדוגמה מוכנה, נשלח אותה למספר הזה.';
export function demoForm(cfg, page, id = 'demo', kind = 'demo') {
  const fields = kind === 'teder' ? `${storeField(false)}\n${contactField('הוואטסאפ שלכם')}` : storeField(true);
  return `${open(cfg, kind, page, 'demo', id)}
${fields}
<button class="btn primary" type="submit">${kind === 'teder' ? (signupOpen(cfg) ? 'לקבל מצגת לדוגמה' : 'לנסות את תדר') : 'לנסות את תורן'}</button>
<p class="when">${kind === 'teder' ? tederWhen : toranWhen(cfg)}</p>
${status(id)}
</form>`;
}

// Toran's waitlist, while Toran is soon (products.toran in site.config.json): one field, a phone or an email, saved as a
// 'waitlist' lead (server/lead.mjs) and sent to the owner as "רשימת המתנה לתורן". Nothing else is asked or promised.
export function waitlistForm(cfg, page, id = 'waitlist-form') {
  return `${open(cfg, 'waitlist', page, 'demo waitlist', id)}
<label class="f wide">טלפון או מייל<input name="contact" type="text" autocomplete="email" dir="ltr" required></label>
<button class="btn" type="submit">לקבל עדכון</button>
<p class="when">נכתוב לכם פעם אחת, כשתורן נפתח.</p>
${status(id)}
</form>`;
}

// The join page's form: Toran, Teder or both, ticked on a card each, then the store's address, and the WhatsApp number
// that Teder's slideshow goes to. Toran is ticked to start with; a link to /join?p=teder ticks Teder instead. With JS
// the number and each line under the button show only for what is ticked (form.js); without it all of them show, and
// the endpoint asks for the number only when Teder is ticked.
// While Toran is soon its card is there, marked "בקרוב", and can't be ticked; Teder is ticked to start with.
export function joinForm(cfg) {
  const soon = toranSoon(cfg);
  const card = (name, label, what, on, off = false) => `<label class="pick${off ? ' off' : ''}"><input type="checkbox" name="${name === 'toran' ? 'toran' : 'teder'}" value="1"${on ? ' checked' : ''}${off ? ' disabled' : ''}><span class="pick-box">${mark(name, 44)}<span><b>${label}${off ? ' <span class="soon">בקרוב</span>' : ''}</b><small>${what}</small></span><span class="pick-tick" aria-hidden="true"></span></span></label>`;
  return `${open(cfg, 'join', '/join', 'demo join', 'join')}
<fieldset class="picks"><legend>במה מתחילים</legend>
<div class="pick-row">
${soon ? card('toran', 'תורן', 'יענה ללקוחות של החנות בוואטסאפ, באינסטגרם, במסנג׳ר ובמייל', false, true) : card('toran', 'תורן', 'עונה ללקוחות של החנות בוואטסאפ, באינסטגרם, במסנג׳ר ובמייל', true)}
${card('teder', 'תדר', 'כותב ומעצב מצגות בעברית לטיקטוק ולאינסטגרם', soon)}
</div>
</fieldset>
${storeField(false)}
${contactField('הוואטסאפ שלכם, למצגת של תדר', false)}
<button class="btn primary" type="submit">${!signupOpen(cfg) ? 'להצטרף' : soon ? 'לקבל מצגת לדוגמה' : 'לקבל דמו'}</button>
${soon ? '' : `<p class="when" data-for="toran">${toranWhen(cfg)}</p>`}
<p class="when" data-for="teder">${tederWhen}</p>
${status('join')}
</form>`;
}

// Once per page that has a form.
export function formCopy(cfg) {
  const wa = '<a class="btn sm primary" data-wa href="#">לשלוח בוואטסאפ</a>';
  // A Toran demo, from its form or the join page's: the request's code, and the button that writes it to the demo
  // number (form.js puts in the code and the link, and the Teder line when the join page asked for both). While Toran
  // is soon no form asks for its demo, so there is no code to show, and the waitlist has its own thank-you.
  return `${toranSoon(cfg) ? '' : `<template id="done-code"><div class="done" tabindex="-1"><h3>נשאר לשלוח לנו הודעה בוואטסאפ</h3><p>הקוד של הבקשה הוא <bdi class="code" data-code></bdi>, והוא כבר כתוב בהודעה שהכפתור פותח.</p><p>צריך לשלוח אותה מהמספר שהדמו יענה לו, ולשם יגיע הלינק${within(cfg) ? ` ${within(cfg)}` : ' כשהוא מוכן'}.</p><p data-teder hidden>את המצגת לדוגמה של תדר נשלח למספר שכתבתם בטופס.</p><a class="btn primary" data-wa-go href="#">לשלוח בוואטסאפ</a></div></template>
`}<template id="done-teder"><div class="done" tabindex="-1"><h3>קיבלנו את הכתובת של <bdi data-store></bdi></h3><p>כשהמצגת לדוגמה מוכנה, נשלח לכם אותה לוואטסאפ, בגודל של טיקטוק ושל אינסטגרם.</p></div></template>
${toranSoon(cfg) ? `<template id="done-waitlist"><div class="done" tabindex="-1"><h3>רשמנו אתכם</h3><p>כשתורן נפתח, נכתוב לכם לטלפון או למייל שהשארתם.</p></div></template>
<template id="msg-contact-waitlist"><p>צריך מספר נייד ישראלי, למשל 050-1234567, או כתובת מייל, כדי שנוכל לכתוב לכם כשתורן נפתח.</p></template>
` : ''}<template id="msg-products"><p>${toranSoon(cfg) ? 'צריך לסמן את תדר. תורן עוד לא פתוח.' : 'צריך לבחור לפחות אחד, תורן או תדר.'}</p></template>
<template id="msg-contact-join"><p>צריך מספר נייד ישראלי, למשל 050-1234567, כדי שנוכל לשלוח לשם את המצגת של תדר.</p></template>
<template id="msg-store"><p>הכתובת של החנות לא נראית לנו נכונה. אפשר לכתוב אותה כמו בדפדפן, למשל shop.co.il.</p></template>
<template id="msg-contact-teder"><p>צריך מספר נייד ישראלי, למשל 050-1234567, כדי שנוכל לשלוח לשם את המצגת.</p></template>
<template id="msg-dup"><p>כבר קיבלנו מהמספר הזה בקשה כזאת, והתשובה תגיע לוואטסאפ שלו. לחנות נוספת, אפשר לכתוב לנו בוואטסאפ.</p>${wa}</template>
<template id="msg-rate"><p>קיבלנו כבר כמה פניות מהחיבור הזה בשעה האחרונה. אפשר לנסות שוב בעוד שעה, או לשלוח לנו בוואטסאפ.</p>${wa}</template>
<template id="msg-down"><p>משהו אצלנו לא עובד כרגע, והפרטים לא הגיעו אלינו. אפשר לשלוח לנו אותם בוואטסאפ.</p>${wa}</template>
<template id="msg-bad"><p>הטופס לא נשלח. אפשר לנסות שוב, או לשלוח לנו בוואטסאפ.</p>${wa}</template>`;
}
