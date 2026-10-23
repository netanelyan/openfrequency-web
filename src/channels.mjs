// Toran in each place a customer writes to a store: the channel tabs and the window they change, and the owner's one
// inbox. Every window holds the same question and the same answer, so it reads as one agent that knows one store; only
// the look of the channel changes. No channel's logo is drawn: its name and the shape of its chat are enough.
//
// Which channels Toran answers in comes from Toran's /channels.json at build time, or site.config.json (toran.channels)
// when Toran doesn't answer (build.mjs); every other one carries "בקרוב". Without a
// script the windows stand one under the other, each under its own name; site.js turns them into tabs.
import { CHANNELS, mark } from './lib.mjs';
import { chat } from './chat.mjs';

export const NAMES = { whatsapp: 'וואטסאפ', instagram: 'אינסטגרם', messenger: 'מסנג׳ר', email: 'מייל' };

// The sample: one store, one dress, one price, all made up, and the caption says so.
const Q = 'היי, יש את שמלת הפשתן הירוקה במידה M?';
const A = 'יש, נשארו 2 במידה M. היא 289 ₪, והמשלוח עד הבית לוקח 3 עד 5 ימי עסקים.';
const WHO = { me: 'לקוחה', them: 'החנות' };
const sr = (who, time) => `<span class="sr">${WHO[who]}${time ? `, ${time}` : ''}. </span>`;

const top = (face, name, sub, nameDir = '') => `<div class="chat-top"><span class="ava" aria-hidden="true">${face}</span><span><b${nameDir ? ` dir="${nameDir}"` : ''}>${name}</b><small>${sub}</small></span></div>`;

const WINDOWS = {
  // As the customer's phone shows it, the way the rest of the site's chats are drawn (chat.mjs).
  whatsapp: () => chat({ id: 'ch-wa-chat', who: 'החנות שלכם', face: 'ח', tag: '', msgs: [['me', '02:14', Q], ['them', '02:14', A]], names: WHO }),

  // A direct message that starts as a reply to the store's story: the story's thumbnail above the first message.
  instagram: () => `<figure class="chat ig" data-ui aria-label="החנות שלכם, אינסטגרם">
${top('ח', 'your.shop', 'אינסטגרם', 'ltr')}
<ol class="msgs">
<li class="ig-story" aria-hidden="true"><small>תגובה לסטורי</small><span class="ig-thumb"><span>חדש בחנות</span></span></li>
<li class="msg me">${sr('me')}${Q}</li>
<li class="msg them">${sr('them')}${A}</li>
</ol>
</figure>`,

  messenger: () => `<figure class="chat fb" data-ui aria-label="החנות שלכם, מסנג׳ר">
${top('ח', 'החנות שלכם', 'מסנג׳ר')}
<ol class="msgs">
<li class="fb-time" aria-hidden="true">02:14</li>
<li class="msg me">${sr('me', '02:14')}${Q}</li>
<li class="msg them"><span class="ava" aria-hidden="true">ח</span><span>${sr('them', '02:14')}${A}</span></li>
</ol>
</figure>`,

  // A thread: the customer's mail, then the store's answer with its signature.
  email: () => `<figure class="chat mail" data-ui aria-label="החנות שלכם, מייל">
<div class="mail-subj"><small>נושא</small><b>שמלת פשתן ירוקה במידה M</b></div>
<div class="mail-msg"><div class="mail-from"><span class="ava" aria-hidden="true">ל</span><span><b>לקוחה</b><small>אל החנות שלכם</small></span><time>02:14</time></div><p>${Q}</p></div>
<div class="mail-msg"><div class="mail-from"><span class="ava store" aria-hidden="true">ח</span><span><b>החנות שלכם</b><small>אל לקוחה</small></span><time>02:14</time></div><p>${A}</p><p class="mail-sig">החנות שלכם<br><span dir="ltr">your-shop.co.il</span></p></div>
</figure>`,
};

const live = (cfg) => new Set(cfg.get('toran.channels') || []);
const soon = '<span class="soon">בקרוב</span>';

// The tabs and the window. The tab list is hidden until the script makes it work; the windows are a stacked list
// until then, each under its own name.
export function channelWindow(cfg) {
  const on = live(cfg);
  return `<div class="ch-box" data-channels>
<div class="ch-tabs" role="tablist" aria-label="איפה הלקוחה כותבת" hidden>
${CHANNELS.map((c, i) => `<button type="button" role="tab" id="tab-${c}" aria-controls="ch-${c}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">${NAMES[c]}${on.has(c) ? '' : soon}</button>`).join('\n')}
</div>
${CHANNELS.map((c) => `<div class="ch-panel" id="ch-${c}">
<h3 class="ch-name">${NAMES[c]}${on.has(c) ? '' : soon}</h3>
<div class="stage glass">${WINDOWS[c]()}</div>
</div>`).join('\n')}
<p class="ch-note">שיחה לדוגמה. החנות, השמלה והמחיר מומצאים. בכל ערוץ זו אותה שאלה ואותה תשובה, כי זה אותו תורן שמכיר את אותה חנות.</p>
</div>`;
}

// The owner's screen: every conversation in one list, whatever channel it came from, with what happened to it.
const STATUS = { alone: 'ענה לבד', yours: 'מחכה לכם', fixed: 'תיקנתם' };
const INBOX = [
  ['whatsapp', '02:14', Q, 'alone'],
  ['instagram', '09:40', 'תגובה לסטורי: יש גם במידה S?', 'alone'],
  ['email', '11:05', 'אפשר לאסוף מהמחסן?', 'yours'],
  ['messenger', '13:22', 'ההזמנה שלי עוד לא הגיעה', 'yours'],
  ['whatsapp', 'אתמול', 'יש אריזת מתנה?', 'fixed'],
];

export const inbox = () => `<div class="inbox" data-ui role="group" aria-label="התיבה של החנות, דוגמה">
<div class="inbox-top">${mark('toran', 28)}<b>השיחות של החנות</b><span class="tag">דוגמה</span><span class="tag soon">בקרוב</span></div>
<ul>
${INBOX.map(([c, time, text, s]) => `<li><span class="ch-tag ${c}">${NAMES[c]}</span><span class="ib-text">${text}</span><span class="ib-time">${time}</span><span class="ui-s ${s}">${STATUS[s]}</span></li>`).join('\n')}
</ul>
</div>`;
