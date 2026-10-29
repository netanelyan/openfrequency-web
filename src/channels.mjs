// Toran in each place a customer writes to a store: the channel tabs and the window they change, and the owner's one
// inbox. Every window holds the same question and the same answer, so it reads as one agent that knows one store; only
// the look of the channel changes. Each channel's name goes with its own mark (logos.mjs).
//
// Which channels Toran answers in is toran.channels in site.config.json, or Toran's own /channels.json at build time
// when toran.channelsFrom is "toran" (build.mjs); every other one carries "בקרוב". Without a
// script the windows stand one under the other, each under its own name; site.js turns them into tabs.
import { CHANNELS, mark } from './lib.mjs';
import { chat } from './chat.mjs';
import { LOGOS } from './logos.mjs';

export const NAMES = { whatsapp: 'וואטסאפ', instagram: 'אינסטגרם', messenger: 'מסנג׳ר', email: 'מייל', tiktok: 'טיקטוק', facebook: 'פייסבוק' };
// A channel's name with its mark in front.
export const named = (c) => `${LOGOS[c]}${NAMES[c]}`;

// The sample: one store, one dress, one price, all made up, and the caption says so.
const Q = 'היי, יש את שמלת הפשתן הירוקה במידה M?';
const A = 'יש, נשארו 2 במידה M. היא 289 ₪, והמשלוח עד הבית לוקח 3 עד 5 ימי עסקים.';
const WHO = { me: 'לקוחה', them: 'החנות' };
const sr = (who, time) => `<span class="sr">${WHO[who]}${time ? `, ${time}` : ''}. </span>`;

const top = (face, name, sub, nameDir = '') => `<div class="chat-top"><span class="ava" aria-hidden="true">${face}</span><span><b${nameDir ? ` dir="${nameDir}"` : ''}>${name}</b><small>${sub}</small></span></div>`;

const WINDOWS = {
  // As the customer's phone shows it, the way the rest of the site's chats are drawn (chat.mjs).
  whatsapp: () => chat({ id: 'ch-wa-chat', who: 'החנות שלכם', sub: named('whatsapp'), face: 'ח', tag: '', msgs: [['me', '02:14', Q], ['them', '02:14', A]], names: WHO }),

  // A direct message that starts as a reply to the store's story: the story's thumbnail above the first message.
  instagram: () => `<figure class="chat ig" data-ui aria-label="החנות שלכם, אינסטגרם">
${top('ח', 'your.shop', named('instagram'), 'ltr')}
<ol class="msgs">
<li class="ig-story" aria-hidden="true"><small>תגובה לסטורי</small><span class="ig-thumb"><span>חדש בחנות</span></span></li>
<li class="msg me">${sr('me')}${Q}</li>
<li class="msg them">${sr('them')}${A}</li>
</ol>
</figure>`,

  messenger: () => `<figure class="chat fb" data-ui aria-label="החנות שלכם, מסנג׳ר">
${top('ח', 'החנות שלכם', named('messenger'))}
<ol class="msgs">
<li class="fb-time" aria-hidden="true">02:14</li>
<li class="msg me">${sr('me', '02:14')}${Q}</li>
<li class="msg them"><span class="ava" aria-hidden="true">ח</span><span>${sr('them', '02:14')}${A}</span></li>
</ol>
</figure>`,

  // A thread: the customer's mail, then the store's answer with its signature.
  email: () => `<figure class="chat mail" data-ui aria-label="החנות שלכם, מייל">
<div class="mail-subj"><small>${named('email')}<span aria-hidden="true"> · </span>נושא</small><b>שמלת פשתן ירוקה במידה M</b></div>
<div class="mail-msg"><div class="mail-from"><span class="ava" aria-hidden="true">ל</span><span><b>לקוחה</b><small>אל החנות שלכם</small></span><time>02:14</time></div><p>${Q}</p></div>
<div class="mail-msg"><div class="mail-from"><span class="ava store" aria-hidden="true">ח</span><span><b>החנות שלכם</b><small>אל לקוחה</small></span><time>02:14</time></div><p>${A}</p><p class="mail-sig">החנות שלכם<br><span dir="ltr">your-shop.co.il</span></p></div>
</figure>`,
};

const live = (cfg) => new Set(cfg.get('toran.channels') || []);
// The live channels, in the site's order.
export const liveChannels = (cfg) => CHANNELS.filter((c) => live(cfg).has(c));

// "בוואטסאפ, באינסטגרם ובמייל": each name after ב, the last one after ו.
export const inList = (ids) => {
  const b = ids.map((c) => 'ב' + NAMES[c]);
  return b.length < 2 ? b.join('') : `${b.slice(0, -1).join(', ')} ו${b.at(-1)}`;
};
const soon = '<span class="soon">בקרוב</span>';

// Tabs over one window, for Toran's channels and Teder's platforms alike: each item is { key, name (HTML), window
// (HTML), bare } (bare: the window brings its own stage, instead of the glass one). The tab list is hidden until the
// script makes it work (site.js, [data-channels]); until then the windows are a stacked list, each under its name.
export function tabBox(items, { label, note }) {
  return `<div class="ch-box" data-channels>
<div class="ch-tabs" role="tablist" aria-label="${label}" hidden>
${items.map((t, i) => `<button type="button" role="tab" id="tab-${t.key}" aria-controls="ch-${t.key}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">${t.name}</button>`).join('\n')}
</div>
${items.map((t) => `<div class="ch-panel" id="ch-${t.key}">
<h3 class="ch-name">${t.name}</h3>
${t.bare ? t.window : `<div class="stage glass">${t.window}</div>`}
</div>`).join('\n')}
${note ? `<p class="ch-note">${note}</p>` : ''}
</div>`;
}

// { all: true }: every channel without its "בקרוב" (Toran's page while all of Toran is soon).
export function channelWindow(cfg, { all = false } = {}) {
  const on = all ? new Set(CHANNELS) : live(cfg);
  return tabBox(CHANNELS.map((c) => ({ key: c, name: `${named(c)}${on.has(c) ? '' : soon}`, window: WINDOWS[c]() })), {
    label: 'איפה הלקוחה כותבת',
    note: 'שיחה לדוגמה. החנות, השמלה והמחיר מומצאים. בכל ערוץ זו אותה שאלה ואותה תשובה, כי זה אותו תורן שמכיר את אותה חנות.',
  });
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
<div class="inbox-top">${mark('toran', 28)}<b>השיחות של החנות</b><span class="tag">דוגמה</span></div>
<ul>
${INBOX.map(([c, time, text, s]) => `<li><span class="ch-tag ${c}">${named(c)}</span><span class="ib-text">${text}</span><span class="ib-time">${time}</span><span class="ui-s ${s}">${STATUS[s]}</span></li>`).join('\n')}
</ul>
</div>`;
