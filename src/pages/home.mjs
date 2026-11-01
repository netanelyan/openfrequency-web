// The home page: OpenFrequency and its two products. The first screen says what we make, with our mark large and
// faint behind it, and opens a door to each product in its own colour: Teder's real slides playing on its violet,
// Toran's chat answering on its green; on a phone the lines under the headline are left out (style.css), since the
// doors say them. Then what holds for every store, the businesses we run ourselves, what we do in a store like yours,
// and the assistant. Each product has its own page (/toran, /teder), the questions have theirs (/faq), and anyone can
// ask Toran itself about us on WhatsApp (the support button, layout.mjs).
// While Toran is soon (products.toran in site.config.json), the first screen sells Teder (the owner, 2026-11-01: "The
// hero: sell Teder, which you can buy now, and give Toran one line with the badge"): the headline is Teder's, its door
// comes first with its price, and Toran has one line with "בקרוב" and a door as finished as Teder's, in its own green,
// whose one button saves a place on its waitlist ("שמרו לי מקום", /toran#waitlist). Every line about Toran says what
// it will do, and the section on Toran as the owner's assistant waits for Toran.
// While sign-up is open (signup), Teder's door sends to accounts' sign-up with the price under it, and the sample
// slideshow is the line after.
import fs from 'node:fs';
import path from 'node:path';
import { CHANNELS, ROOT, esc, mark, glyphOnly, signupOpen, tederNets, toranSoon, assistantSoon } from '../lib.mjs';
import { chat } from '../chat.mjs';
import { TORAN_SAVE } from '../forms.mjs';
import { TEDER_DEMO, TEDER_SAMPLE, TORAN_DEMO, TORAN_TRY, tederFrom, tederStart, toranStart } from '../sections.mjs';
import { approvals, reel } from '../teder.mjs';
import { inList, liveChannels } from '../channels.mjs';
import { clients } from '../clients.mjs';
import { niches } from '../niches.mjs';

// Toran's door: the sample chat on the customer's phone. The first question it answers from the site; the second
// isn't there, so it tells the customer it's checking, and the question pops up on the owner's phone.
const DOOR_CHAT = [
  ['me', '02:14', 'היי, יש את שמלת הפשתן הירוקה במידה M?'],
  ['them', '02:14', 'יש, נשארו 2 במידה M. היא 289 ₪, והמשלוח לוקח 3 עד 5 ימי עסקים.'],
  ['me', '02:16', 'ואפשר לאסוף מהמחסן?'],
  ['them', '02:16', 'את זה אני לא יודע. אני בודק עם החנות, ואחזור אליך כאן.'],
];

// A door's top row: the mark, the name, and what it does. On a phone the door starts shut (site.js), showing the name
// and one short line, and the round button at the row's end (the whole row is its target) opens it; without script, or
// from 700px, the door is open and the button isn't there.
const doorTop = (id, face, name, short, say) => `<div class="door-top">${face}<div><h2 id="door-${id}">${name}</h2><p class="door-sum">${short}</p><p class="door-say">${say}</p></div><button type="button" class="door-open" aria-expanded="true" aria-controls="door-${id}-in" aria-labelledby="door-${id}" hidden><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9.5l6 6 6-6"/></svg></button></div>`;

const soonBadge = '<span class="soon">בקרוב</span>';
const hero = (cfg) => {
  const soon = toranSoon(cfg);
  const glyph = (name) => `<span class="wave" aria-hidden="true">${glyphOnly(name)}</span>`;
  const toranDoor = `<article class="door toran-door" aria-labelledby="door-toran" data-door>
${soon
    ? doorTop('toran', glyph('toran'), `תורן ${soonBadge}`, 'יענה ללקוחות של החנות 24/7', 'יענה ללקוחות של החנות מתוך מה שכתוב באתר, ומה שלא כתוב שם ישאל אתכם.')
    : doorTop('toran', glyph('toran'), 'תורן', 'עונה ללקוחות של החנות 24/7', 'עונה ללקוחות של החנות מתוך מה שכתוב באתר. מה שלא כתוב שם, הוא שואל אתכם.')}
<div class="door-in" id="door-toran-in">
${soon
    ? `<div class="start door-start"><div class="door-act"><a class="btn light" href="/toran#waitlist">${TORAN_SAVE}</a></div>\n<p class="start-alt">נכתוב לכם פעם אחת, כשתורן נפתח.</p></div>`
    : signupOpen(cfg)
      ? toranStart(cfg, { wrap: 'start door-start', cls: 'btn light', act: 'door-act', price: false, more: `<a class="btn on-color" href="/toran">${TORAN_DEMO}</a><a class="btn on-color" href="/toran#demo">${TORAN_TRY}</a>` })
      : '<div class="door-act"><a class="btn light" href="/toran#demo">לנסות את תורן על החנות שלכם</a><a class="btn on-color" href="/toran">עוד על תורן</a></div>'}
<div class="phone-sit" data-play>
<div class="phone">${chat({ id: 'door-chat', who: 'החנות שלכם', face: 'ח', msgs: DOOR_CHAT, names: { me: 'לקוח', them: 'החנות' } })}</div>
<p class="pop" data-pop>${mark('toran', 28)}<span class="pop-h"><b>תורן</b><small>בטלפון שלכם, 02:16</small></span><span class="pop-t">לקוח שואל אם אפשר לאסוף מהמחסן. זה לא כתוב באתר. מה לענות לו?</span></p>
</div>
</div>
</article>`;
  const tederDoor = `<article class="door teder-door" aria-labelledby="door-teder" data-door>
${doorTop('teder', glyph('teder'), 'תדר', tederFrom(cfg) || `מצגות ${tederNets(cfg)}`, `כותב ומעצב מצגות בעברית ${tederNets(cfg)}. כל מצגת יוצאת רק אחרי שמישהו אישר אותה.`)}
<div class="door-in" id="door-teder-in">
${signupOpen(cfg)
    ? tederStart(cfg, { wrap: 'start door-start', cls: 'btn light', act: 'door-act', more: `<a class="btn on-color" href="/teder">${TEDER_DEMO}</a><a class="btn on-color" href="/teder#demo">${TEDER_SAMPLE}</a>` })
    : '<div class="door-act"><a class="btn light" href="/teder#demo">לנסות את תדר על החנות שלכם</a><a class="btn on-color" href="/teder">עוד על תדר</a></div>'}
${reel}
</div>
</article>`;
  return `
<section class="co-hero" aria-labelledby="hero-h">
<div class="co-bg" aria-hidden="true">${glyphOnly('openfrequency')}</div>
<div class="wrap">
${soon ? `<h1 id="hero-h"><span class="hl">מצגות בעברית</span> ${tederNets(cfg)}</h1>
<p class="lede">תדר כותב ומעצב את המצגות, ומפרסם כל אחת רק אחרי שמישהו אישר אותה.</p>
<p class="co-soon">${soonBadge} תורן יענה ללקוחות שלכם 24/7 ${inList(CHANNELS)}, מתוך מה שכתוב באתר.</p>` : `<h1 id="hero-h">מצגות לרשתות ותשובות ללקוחות, <span class="hl">בעברית</span></h1>
<p class="lede">תדר כותב ומעצב לכם מצגות בעברית ${tederNets(cfg)}. תורן עונה ללקוחות שלכם 24/7 ${inList(liveChannels(cfg))}, מתוך מה שכתוב באתר.</p>`}
<div class="doors">
${soon ? `${tederDoor}\n${toranDoor}` : `${toranDoor}\n${tederDoor}`}
</div>
</div>
</section>`;
};

// Before the businesses that work with us: what holds for every store, said once, each a thing the products do.
const BADGES = [
  ['clock', 'עונה ללקוחות 24/7'],
  ['doc', 'עונה רק מתוך האתר שלכם'],
  ['check', 'תדר מפרסם רק מה שאישרתם'],
  ['lock', 'המידע של כל חנות נשאר רק אצלה'],
  ['gift', 'דמו חינם על החנות שלכם'],
];
const BADGE_ICON = {
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  doc: '<path d="M7 3.5h7l4 4V20a.5.5 0 0 1-.5.5h-10A.5.5 0 0 1 7 20z"/><path d="M14 3.5V8h4M9.5 12.5h5M9.5 16h5"/>',
  check: '<circle cx="12" cy="12" r="8.5"/><path d="M8 12.5l2.7 2.7L16 9.8"/>',
  lock: '<rect x="5.5" y="10.5" width="13" height="9.5" rx="2"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/>',
  gift: '<rect x="4.5" y="9" width="15" height="11" rx="1.5"/><path d="M4.5 13h15M12 9v11M12 9c-1.5-3.5-5-3.5-5-1.2C7 9 12 9 12 9zm0 0c1.5-3.5 5-3.5 5-1.2C17 9 12 9 12 9z"/>',
};
// While Toran is soon, only what Teder does.
const BADGES_SOON = [
  ['doc', 'כל עובדה במצגת נבדקת מול המקור'],
  ['check', 'תדר מפרסם רק מה שאישרתם'],
  ['lock', 'המידע של כל חנות נשאר רק אצלה'],
  ['gift', 'מצגת לדוגמה חינם מהחנות שלכם'],
];
const trust = (cfg) => `
<section class="trust-sec" aria-label="מה מובטח בכל חנות">
<ul class="trust wrap">${(toranSoon(cfg) ? BADGES_SOON : BADGES).map(([ic, t]) => `<li><svg viewBox="0 0 24 24" aria-hidden="true">${BADGE_ICON[ic]}</svg><span>${t}</span></li>`).join('')}</ul>
</section>`;

// Toran for the owner (openfrequency-toran src/assistant): the owner writes to Toran from their own WhatsApp and asks
// about the store; Toran answers from the conversations and the site, and acts only after "כן". Shown once Toran is
// live: while it is soon, this whole section was a promise about a product nobody can buy yet, and it went (the owner,
// 2026-11-01: "The mobile page is very long ... Cutting a section or two will help").
const OWNER_CHAT = [
  ['me', '20:41', 'מה קרה היום?'],
  ['them', '20:41', 'היום פנו 23 לקוחות: 17 בוואטסאפ, 4 באינסטגרם ו-2 במייל. עניתי לבד ל-21. שתי שאלות מחכות לכם.'],
  ['me', '20:42', 'מה שאלו?'],
  ['them', '20:42', 'לקוחה באינסטגרם שואלת אם אפשר לאסוף מהמחסן באשדוד. לקוח בוואטסאפ שואל אם השמלה הירוקה תחזור למלאי.'],
  ['me', '20:43', 'תעני לה שאפשר לאסוף בתיאום מראש'],
  ['them', '20:43', 'אשלח לה: "אפשר לאסוף מהמחסן באשדוד, בתיאום מראש." לשלוח?'],
  ['me', '20:43', 'כן'],
  ['them', '20:43', 'נשלח. שמרתי את התשובה, ובפעם הבאה אענה על זה לבד.'],
];
const assistant = (cfg) => `
<section class="sec owner-sec" id="owner" aria-labelledby="owner-h">
<div class="wrap owner-grid">
<div class="owner-text">
<p class="kicker">העוזר האישי שלכם</p>
<h2 id="owner-h">תורן עונה גם <span class="hl">לכם</span></h2>
<p class="lede">כתבו לתורן מהוואטסאפ שלכם, והוא עונה לכם על החנות: מי פנה, מה שאלו, ומה מחכה לכם. הוא עושה משהו רק אחרי שכתבתם לו כן.</p>
<ul class="checks">
<li><b>מה קרה היום.</b> כמה לקוחות פנו, בכל ערוץ, ועל כמה הוא ענה לבד.</li>
<li><b>מה מחכה לכם.</b> השאלות שהוא העביר אליכם, עם הלקוח שמחכה לתשובה.</li>
<li><b>עונים דרכו.</b> אומרים לו מה לענות, והוא שולח ללקוח רק אחרי שכתבתם כן. את התשובה הוא זוכר לפעם הבאה.</li>
<li><b>על מה שואלים.</b> המוצרים שלקוחות שואלים עליהם הרבה, ומה מהם אזל מהמלאי.</li>
</ul>
</div>
<div class="phone owner-phone">${chat({ id: 'owner-chat', who: 'תורן', sub: 'העוזר שלכם', face: mark('toran', 38), msgs: OWNER_CHAT, names: { me: 'אתם', them: 'תורן' } })}</div>
</div>
</section>`;

// The same assistant for Teder: the slideshows that are ready come to the owner's WhatsApp, and the owner approves or
// asks for a fix in a message. The three covers are Teder's own, from its made-up demo account (assets/teder/assistant,
// written by scripts/showcase.mjs from what Teder hands over); no store's slideshow, and nothing about views or sales.
const THUMBS = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets/teder/assistant.json'), 'utf8'));
const thumbs = `<span class="thumbs">${THUMBS.map((t) => `<span class="thumb"><img src="/teder/assistant/${t.n}.jpg" width="90" height="160" alt="מצגת ${t.n}: ${esc(t.alt)}" loading="lazy"><b aria-hidden="true">${t.n}</b></span>`).join('')}</span>`;
const TEDER_CHAT = [
  ['them', '09:02', `3 מצגות חדשות מוכנות. איזו לאשר?${thumbs}`],
  ['me', '09:15', 'אשר את 1 ו-3, את 2 תעשה קצר יותר'],
  ['them', '09:15', 'אישרתי את 1 ו-3. את 2 אקצר ואשלח לכם שוב לאישור.'],
  ['them', '18:30', 'המצגת על השרך מחכה בטיוטות של טיקטוק. מוסיפים סאונד ומפרסמים.'],
  ['me', '21:04', 'איך היה השבוע?'],
  ['them', '21:04', 'השבוע עלו 4 מצגות לטיקטוק ולאינסטגרם, ואחת עוד מחכה לכם בטיוטות. ביום ראשון אשלח לכם 3 חדשות לאישור.'],
];
const tederAssistant = (cfg) => `
<section class="sec owner-sec teder-owner" id="owner-teder" aria-labelledby="owner-teder-h">
<div class="wrap owner-grid">
<div class="owner-text">
<p class="kicker">${toranSoon(cfg) ? 'העוזר שלכם בוואטסאפ' : 'אותו עוזר, גם לתדר'}</p>
<h2 id="owner-teder-h">את המצגות של תדר מאשרים <span class="hl">בוואטסאפ</span></h2>
<p class="lede">${toranSoon(cfg) ? '' : 'העוזר שכותב לכם על החנות עובד גם עם תדר. '}כשמצגות מוכנות, הוא שולח לכם אותן לוואטסאפ, ושם מאשרים, מבקשים תיקון ומקבלים תזכורת לפרסם. אין אפליקציה חדשה ללמוד.</p>
<ul class="checks">
<li><b>מאשרים לפי מספר.</b> כותבים לו "אשר את 1 ו-3", ורק מה שאישרתם עולה.</li>
<li><b>מבקשים תיקון במילים שלכם.</b> "את 2 תעשה קצר יותר", ותדר מכין גרסה חדשה ושולח לכם אותה שוב לאישור.</li>
<li><b>תזכורת כשמצגת מחכה.</b> המצגת עולה לטיוטות של טיקטוק, והוא כותב לכם כשנשאר רק להוסיף סאונד ולפרסם.</li>
<li><b>מה היה השבוע.</b> כמה מצגות עלו, מה מחכה לכם, ומתי יגיעו החדשות.</li>
</ul>
</div>
<div class="phone owner-phone">${chat({ id: 'teder-chat', who: 'תורן', sub: 'העוזר שלכם', face: mark('toran', 38), msgs: TEDER_CHAT, names: { me: 'אתם', them: 'העוזר' } })}</div>
</div>
</section>`;

// While the assistant is soon (products.assistant), Teder's approvals are shown where they happen today: Teder's own
// screen, with the day's slideshows, one click each or all at once, a rejection with a reason that comes back
// rewritten, and the approved one waiting in TikTok's drafts. The WhatsApp way is one line, marked "בקרוב".
const tederDashboard = (cfg) => `
<section class="sec owner-sec teder-owner" id="owner-teder" aria-labelledby="owner-teder-h">
<div class="wrap owner-grid">
<div class="owner-text">
<p class="kicker">לפני שמשהו עולה</p>
<h2 id="owner-teder-h">כל מצגת של תדר <span class="hl">מחכה לאישור שלכם</span></h2>
<p class="lede">המצגות של היום מחכות לכם במסך אחד של תדר. רואים כל אחת, מאשרים, ורק מה שאישרתם עולה.</p>
<ul class="checks">
<li><b>מאשרים בלחיצה.</b> כל מצגת לבד, או את כל המצגות של היום בבת אחת.</li>
<li><b>מצגת שלא מתאימה חוזרת מתוקנת.</b> דוחים אותה, כותבים במילים שלכם מה לשנות, ותדר כותב גרסה חדשה לאישור.</li>
<li><b>מה שאישרתם מחכה בטיוטות של טיקטוק.</b> נשאר רק להוסיף סאונד ולפרסם.</li>
<li><b>לאשר מהוואטסאפ ${soonBadge}</b> העוזר ישלח לכם את המצגות לוואטסאפ, ותאשרו שם בהודעה.</li>
</ul>
</div>
<div class="stage glass">${approvals(cfg)}</div>
</div>
</section>`;

export default (cfg) => ({
  path: '/',
  title: 'OpenFrequency, תורן ותדר',
  description: toranSoon(cfg)
    ? `תדר כותב ומעצב מצגות בעברית ${tederNets(cfg)}. תורן, שיענה ללקוחות של החנות 24/7 מתוך מה שכתוב באתר, נפתח בקרוב.`
    : `תדר כותב ומעצב מצגות בעברית ${tederNets(cfg)}. תורן עונה ללקוחות של החנות 24/7 ${inList(liveChannels(cfg))}, מתוך מה שכתוב באתר.`,
  // "Who we are" is in the footer (layout.mjs), on every page.
  body: (() => {
    // The question box that was last (Toran answering about us from answers written in advance) went too: the support
    // button on every page is Toran itself, on WhatsApp, and the answers are on /faq.
    const teder = assistantSoon(cfg) ? tederDashboard(cfg) : tederAssistant(cfg);
    return (toranSoon(cfg)
      ? [hero(cfg), trust(cfg), clients(), niches(cfg), teder]
      : [hero(cfg), trust(cfg), clients(), niches(cfg), assistant(cfg), teder]).join('\n');
  })(),
});
