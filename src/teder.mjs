// Teder's real slides, shared by its door on the home page and its own page: the cover of one slideshow for each
// subject, from assets/teder/showcase.json, which scripts/showcase.mjs writes from the slideshows Teder hands over.
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, esc, facebookOn, glyphOnly, mark } from './lib.mjs';
import { named, tabBox } from './channels.mjs';
import { LOGOS } from './logos.mjs';

export const COVERS = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets/teder/showcase.json'), 'utf8'));

const img = (c, kind, lazy) => {
  const [w, h] = kind === 'ig' ? [640, 800] : [540, 960];
  return `<img src="/teder/showcase/${c.pack}/${kind}-01.jpg" width="${w}" height="${h}" alt="${esc(c.alt)}"${lazy ? ' loading="lazy"' : ''} decoding="async">`;
};

// A phone playing the covers like stories, one subject after another, two of them fanned behind it, and the slideshow
// waiting for someone to approve it before it goes out. It repeats slides shown elsewhere, so it's hidden from readers.
const FAN = [COVERS[2], COVERS[3]];
export const reel = `<div class="phone-sit reel-sit" aria-hidden="true">
<div class="fan">${FAN.map((c) => img(c, 'tt', false)).join('')}</div>
<div class="phone"><div class="reel" data-reel><span class="bars">${COVERS.map(() => '<i></i>').join('')}</span>${COVERS.map((c) => img(c, 'tt', false)).join('')}</div></div>
<p class="pop" data-pop><span class="wave">${glyphOnly('teder')}</span><span class="pop-h"><b>תדר</b><small>מצגת חדשה מוכנה</small></span><span class="pop-t">מחכה לאישור לפני שהיא עולה.</span></p>
</div>`;

// Teder's page: its slideshows as each platform shows them, under tabs like Toran's channels (channels.mjs, tabBox):
// on TikTok the phone playing the covers like stories, on Instagram a post of the made-up houseplant account's cover,
// and (teder.facebook on) the same cover as a post on that account's Facebook Page, its text above the photo.
const SAMPLE = COVERS.find((c) => c.pack === 'demo');
const SHOW = { account: 'עציץ ושמש', handle: 'demo.atzitz', slides: 7 };
const icon = (d) => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${d}"/></svg>`;
const ICONS = {
  heart: icon('M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z'),
  comment: icon('M20 12a8 8 0 0 1-11.6 7.1L4 20l.9-4.4A8 8 0 1 1 20 12z'),
  send: icon('M21 4 3 11l7 2 2 7 9-16zM10 13l11-9'),
  like: icon('M7 21H4a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1h3zm0-10 4-8a2 2 0 0 1 3 2l-1 5h6a2 2 0 0 1 2 2.3l-1.4 7A2 2 0 0 1 17.6 21H7'),
  share: icon('M14 5l7 7-7 7v-4c-5 0-8 1.5-10 5 .8-5 3-9.5 10-10.5z'),
};
const facebookPost = () => `<figure class="igp fbp" data-ui aria-label="${esc(`${SHOW.account}, פייסבוק`)}">
<div class="chat-top"><span class="ava" aria-hidden="true">ע</span><span><b>${esc(SHOW.account)}</b><small>עמוד לדוגמה · עכשיו</small></span></div>
<p class="fbp-text">${esc(SAMPLE.topic)}</p>
${img(SAMPLE, 'ig', true)}
<div class="fbp-act" aria-hidden="true"><span>${ICONS.like}לייק</span><span>${ICONS.comment}תגובה</span><span>${ICONS.share}שיתוף</span></div>
</figure>`;
export const platformWindow = (cfg) => tabBox([
  // TikTok: the phone playing the covers like stories, on Teder's violet, as it stands on the home page.
  { key: 'tiktok', name: named('tiktok'), bare: true, window: `<div class="tt-stage">${reel}</div>` },
  { key: 'instagram', name: named('instagram'), window: `<figure class="igp" data-ui aria-label="${esc(`${SHOW.account}, אינסטגרם`)}">
<div class="chat-top"><span class="ava" aria-hidden="true">ע</span><span><b dir="ltr">${SHOW.handle}</b><small>${esc(SHOW.account)} · חשבון לדוגמה</small></span></div>
${img(SAMPLE, 'ig', true)}
<div class="igp-act" aria-hidden="true">${ICONS.heart}${ICONS.comment}${ICONS.send}<span class="igp-dots">${Array.from({ length: SHOW.slides }, (_, i) => `<i${i ? '' : ' class="on"'}></i>`).join('')}</span></div>
<figcaption><b dir="ltr">${SHOW.handle}</b> ${esc(SAMPLE.topic)}</figcaption>
</figure>` },
  ...(facebookOn(cfg) ? [{ key: 'facebook', name: named('facebook'), window: facebookPost() }] : []),
], { label: 'איפה המצגת עולה' });

// The approval screen: the slideshows of the day, each with where it goes out and what happened to it.
const STATUS = { yours: 'מחכה לאישור', fixed: 'אושרה, תעלה ב-19:40', alone: 'עלתה' };
const DAY = [['money', 'yours'], ['football', 'fixed'], ['ai-tips', 'alone'], ['demo', 'yours']];
export const approvals = (cfg) => `<div class="inbox approvals" data-ui role="group" aria-label="המצגות של היום, דוגמה">
<div class="inbox-top">${mark('teder', 28)}<b>המצגות של היום</b><span class="tag">דוגמה</span></div>
<ul>
${DAY.map(([pack, s]) => {
    const c = COVERS.find((x) => x.pack === pack);
    return `<li><span class="ap-thumb" aria-hidden="true">${img(c, 'ig', true).replace(/ alt="[^"]*"/, ' alt=""')}</span><span class="ib-text">${esc(c.topic)}</span><span class="ap-where">${LOGOS.tiktok}${LOGOS.instagram}${facebookOn(cfg) ? LOGOS.facebook : ''}</span><span class="ui-s ${s}">${STATUS[s]}</span>${s === 'yours' ? '<span class="ap-ok">לאשר</span>' : ''}</li>`;
  }).join('\n')}
</ul>
</div>`;

// One cover per subject, named by its subject first, so a visitor finds the one they care about at a glance.
export const cover = (c) => `<article class="cover glass" aria-labelledby="cover-${c.pack}">
<h3 id="cover-${c.pack}" class="cover-subject">${esc(c.subject)}</h3>
${img(c, 'ig', true)}
<p class="cover-topic">${esc(c.topic)}</p>
${c.photo ? `<p class="cover-from">צילום <a href="${esc(c.photo.page)}" rel="noopener"><bdi dir="ltr">${[c.photo.by, c.photo.provider, c.photo.licence].filter(Boolean).map(esc).join(', ')}</bdi></a></p>` : ''}
</article>`;
