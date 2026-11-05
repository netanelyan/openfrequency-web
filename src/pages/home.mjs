// The home page: OpenFrequency and its two products. The first screen says what we make, with our mark large and
// faint behind it, and opens a door to each product in its own colour: Teder's real slides playing on its violet,
// Toran's chat answering on its green; on a phone the lines under the headline are left out (style.css), since the
// doors say them. Then what holds for every store, the businesses we run ourselves, what we do in a store like yours,
// and the assistant. Each product has its own page (/toran, /teder), the questions have theirs (/faq), and anyone can
// ask Toran itself about us on WhatsApp (the support button, layout.mjs).
// On a phone each screen leads with one thing (the owner, 2026-11-05: "The mobile pages (each) has too many
// information, too many things jump to the eyes at the same time. Even the main page."): the first screen is the
// headline and Teder's door with its two buttons, Toran's door shut under it; the mark behind the headline, its marker
// and the badges aren't shown (each badge's fact is on another page: /teder, /security, the footer's free demo), the
// strip of businesses stands still as a row to swipe, and Teder's approvals keep their three lines a tap away (style.css).
// While Toran is soon (products.toran in site.config.json), the first screen sells Teder (the owner, 2026-11-01: "The
// hero: sell Teder, which you can buy now, and give Toran one line with the badge"): the headline is Teder's, its door
// comes first with its price, and Toran has one line with "בקרוב" and a door as finished as Teder's, in its own green,
// whose one button saves a place on its waitlist ("שמרו לי מקום", /toran#waitlist). Every line about Toran says what
// it will do, and the section on Toran as the owner's assistant waits for Toran.
// While sign-up is open (signup), Teder's door has two buttons (the owner, 2026-11-05): the sample slideshow for your
// store, and "להצטרף לתדר", which leads to /teder (whose own "להצטרף לתדר" is the one that goes to accounts' sign-up),
// with the price under them. The headline stands alone, with no lines under it (the owner, 2026-11-05).
import { mark, glyphOnly, signupOpen, tederNets, toranSoon } from '../lib.mjs';
import { chat } from '../chat.mjs';
import { TORAN_SAVE } from '../forms.mjs';
import { SIGNUP_LABEL, TEDER_SAMPLE, TORAN_DEMO, TORAN_TRY, foldButton, tederPriceLine, toranStart } from '../sections.mjs';
import { approvals, reel } from '../teder.mjs';
import { inList, liveChannels } from '../channels.mjs';
import { clients } from '../clients.mjs';
import { niches } from '../niches.mjs';

// Toran's door: the sample chat on the customer's phone, in the words Toran uses (openfrequency-toran src/agent/intro.ts
// and guard.ts). It says it is the store's bot, answers the first question from the site; the second isn't there, so
// it says it isn't sure and passed the question to someone from the store, and the question pops up on the owner's phone.
const DOOR_CHAT = [
  ['me', '02:14', 'היי, יש את שמלת הפשתן הירוקה במידה M?'],
  ['them', '02:14', 'כאן הבוט של החנות. יש, נשארו 2 במידה M. היא 289 ₪, והמשלוח לוקח 3 עד 5 ימי עסקים.'],
  ['me', '02:16', 'ואפשר לאסוף מהמחסן?'],
  ['them', '02:16', 'על זה אני לא בטוח, אז העברתי את השאלה לנציג מהחנות. הוא יחזור אליך כאן.'],
];

// A door's top row: the mark, the name, and what it does. On a phone the door starts shut (site.js), showing the name
// and one short line, and the round button at the row's end (the whole row is its target) opens it; without script, or
// from 700px, the door is open and the button isn't there. A door's buttons sit outside what the round button opens
// (Toran's waitlist button while it is soon aside), so a phone's first screen has the headline and one door to act on
// (the owner, 2026-11-05: "too many things jump to the eyes at the same time"); Teder's full price line waits with the
// rest of the door.
const doorTop = (id, face, name, short, say) => `<div class="door-top">${face}<div><h2 id="door-${id}">${name}</h2><p class="door-sum">${short}</p>${say ? `<p class="door-say">${say}</p>` : ''}</div><button type="button" class="door-open" aria-expanded="true" aria-controls="door-${id}-in" aria-labelledby="door-${id}" hidden><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9.5l6 6 6-6"/></svg></button></div>`;

const soonBadge = '<span class="soon">בקרוב</span>';
const hero = (cfg) => {
  const soon = toranSoon(cfg);
  const glyph = (name) => `<span class="wave" aria-hidden="true">${glyphOnly(name)}</span>`;
  // Toran's buttons once it is sold, outside the shut part like Teder's; while it is soon its one button, to the
  // waitlist, is inside, so Teder's are the first screen's only ones.
  const toranAct = signupOpen(cfg)
    ? toranStart(cfg, { wrap: 'start door-start', cls: 'btn light', act: 'door-act', price: false, more: `<a class="btn on-color" href="/toran">${TORAN_DEMO}</a><a class="btn on-color" href="/toran#demo">${TORAN_TRY}</a>` })
    : '<div class="door-act"><a class="btn light" href="/toran#demo">לנסות את תורן על החנות שלכם</a><a class="btn on-color" href="/toran">עוד על תורן</a></div>';
  const toranDoor = `<article class="door toran-door" aria-labelledby="door-toran" data-door>
${soon
    ? doorTop('toran', glyph('toran'), `תורן ${soonBadge}`, 'יענה בשבילכם ללקוחות של החנות 24/7, לפי מה שכתוב באתר שלכם.', '')
    : doorTop('toran', glyph('toran'), 'תורן', 'עונה ללקוחות של החנות 24/7', 'עונה ללקוחות של החנות מתוך מה שכתוב באתר. מה שלא כתוב שם, הוא שואל אתכם.')}
${soon ? '' : `${toranAct}\n`}<div class="door-in" id="door-toran-in">
${soon ? `<div class="start door-start"><div class="door-act"><a class="btn light" href="/toran#waitlist">${TORAN_SAVE}</a></div>\n<p class="start-alt">נכתוב לכם פעם אחת, כשתורן נפתח.</p></div>\n` : ''}<div class="phone-sit" data-play>
<div class="phone">${chat({ id: 'door-chat', who: 'החנות שלכם', face: 'ח', msgs: DOOR_CHAT, names: { me: 'לקוח', them: 'החנות' } })}</div>
<p class="pop" data-pop>${mark('toran', 28)}<span class="pop-h"><b>תורן</b><small>בטלפון שלכם, 02:16</small></span><span class="pop-t">לקוח שואל אם אפשר לאסוף מהמחסן. זה לא כתוב באתר. מה לענות לו?</span></p>
</div>
</div>
</article>`;
  const tederDoor = `<article class="door teder-door" aria-labelledby="door-teder" data-door>
${doorTop('teder', glyph('teder'), 'תדר', `מכין לחנות שלכם מצגות בעברית ${tederNets(cfg)}, ומעלה רק את מה שאישרתם.`, '')}
${signupOpen(cfg)
    ? `<div class="start door-start"><div class="door-act"><a class="btn light" href="/teder#demo">${TEDER_SAMPLE}</a><a class="btn on-color" href="/teder">${SIGNUP_LABEL}</a></div>
<p class="start-price">${tederPriceLine(cfg)}</p></div>`
    : '<div class="door-act"><a class="btn light" href="/teder#demo">לנסות את תדר על החנות שלכם</a><a class="btn on-color" href="/teder">עוד על תדר</a></div>'}
<div class="door-in" id="door-teder-in">
${reel}
</div>
</article>`;
  return `
<section class="co-hero" aria-labelledby="hero-h">
<div class="co-bg" aria-hidden="true">${glyphOnly('openfrequency')}</div>
<div class="wrap">
${soon ? `<h1 id="hero-h">מצגות לרשתות ותשובות ללקוחות, <span class="hl">בעברית</span></h1>` : `<h1 id="hero-h">מצגות לרשתות ותשובות ללקוחות, <span class="hl">בעברית</span></h1>
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

// Teder's approvals, where they happen: Teder's own screen, with the day's slideshows, one click each or all at once,
// a rejection with a reason that comes back rewritten, and the approved one waiting in TikTok's drafts. It is the only
// way (the owner, 2026-11-02: "managing teder through whatsapp, only through the dashboard"), so the line that promised
// approving on WhatsApp "soon", the products.assistant switch and the WhatsApp section it turned on are gone. On a phone
// its three lines wait behind "עוד פרטים" (a fold, sections.mjs) and the kicker isn't shown: the heading, its line and
// the screen say it.
const tederDashboard = (cfg) => `
<section class="sec owner-sec teder-owner" id="owner-teder" aria-labelledby="owner-teder-h">
<div class="wrap owner-grid">
<div class="owner-text fold" data-fold>
<p class="kicker">לפני שמשהו עולה</p>
<h2 id="owner-teder-h">כל מצגת של תדר <span class="hl">מחכה לאישור שלכם</span></h2>
<p class="lede">המצגות של היום מחכות לכם במסך אחד של תדר. רואים כל אחת, מאשרים, ורק מה שאישרתם עולה.</p>
<ul class="checks fold-x" id="owner-teder-more">
<li><b>מאשרים בלחיצה.</b> כל מצגת לבד, או את כל המצגות של היום בבת אחת.</li>
<li><b>מצגת שלא מתאימה חוזרת מתוקנת.</b> דוחים אותה, כותבים במילים שלכם מה לשנות, ותדר כותב גרסה חדשה לאישור.</li>
<li><b>מה שאישרתם מחכה בטיוטות של טיקטוק.</b> נשאר רק להוסיף סאונד ולפרסם.</li>
</ul>
${foldButton('owner-teder-more', 'עוד פרטים')}
</div>
<div class="stage glass">${approvals(cfg)}</div>
</div>
</section>`;

export default (cfg) => ({
  path: '/',
  title: 'מצגות בעברית לטיקטוק ולאינסטגרם לחנויות | OpenFrequency',
  description: toranSoon(cfg)
    ? `תדר כותב ומעצב מצגות בעברית ${tederNets(cfg)}. תורן, שיענה ללקוחות של החנות 24/7 מתוך מה שכתוב באתר, נפתח בקרוב.`
    : `תדר כותב ומעצב מצגות בעברית ${tederNets(cfg)}. תורן עונה ללקוחות של החנות 24/7 ${inList(liveChannels(cfg))}, מתוך מה שכתוב באתר.`,
  // "Who we are" is in the footer (layout.mjs), on every page.
  body: (() => {
    // The question box that was last (Toran answering about us from answers written in advance) went too: the support
    // button on every page is Toran itself, on WhatsApp, and the answers are on /faq.
    const teder = tederDashboard(cfg);
    return (toranSoon(cfg)
      ? [hero(cfg), trust(cfg), clients(), niches(cfg), teder]
      : [hero(cfg), trust(cfg), clients(), niches(cfg), assistant(cfg), teder]).join('\n');
  })(),
});
