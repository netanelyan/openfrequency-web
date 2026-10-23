// Teder's real slideshows, shared by its door on the home page and its own page. They come from
// assets/teder/showcase.json, which scripts/showcase.mjs writes from the slideshows Teder hands over.
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, esc, glyphOnly } from './lib.mjs';

export const DECKS = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets/teder/showcase.json'), 'utf8'));

const file = (d, kind, n) => `/teder/showcase/${d.pack}/${kind}-${String(n).padStart(2, '0')}.jpg`;
const img = (d, s, kind, lazy) => {
  const [w, h] = kind === 'ig' ? [640, 800] : [540, 960];
  return `<img src="${file(d, kind, s.n)}" width="${w}" height="${h}" alt="${esc(s.alt)}"${lazy ? ' loading="lazy"' : ''} decoding="async">`;
};
const deck = (pack) => DECKS.find((d) => d.pack === pack);

// A phone playing one whole slideshow like stories, the covers of two others fanned behind it, and the slideshow
// waiting for someone to approve it before it goes out. It repeats slides shown elsewhere, so it's hidden from readers.
const PLAYS = deck('football');
const FAN = [deck('money'), deck('ai-tips')];
export const reel = `<div class="phone-sit reel-sit" aria-hidden="true">
<div class="fan">${FAN.map((d) => img(d, d.slides[0], 'tt', false)).join('')}</div>
<div class="phone"><div class="reel" data-reel><span class="bars">${PLAYS.slides.map(() => '<i></i>').join('')}</span>${PLAYS.slides.map((s, i) => img(PLAYS, s, 'tt', i > 0)).join('')}</div></div>
<p class="pop" data-pop><span class="wave">${glyphOnly('teder')}</span><span class="pop-h"><b>תדר</b><small>מצגת חדשה מוכנה</small></span><span class="pop-t">מחכה לאישור לפני שהיא עולה.</span></p>
</div>`;

// Each slideshow as it looks in an Instagram feed: the account on top, the slides one at a time, swiped or stepped
// with the arrows, and a dot for each slide. Without a script the slides still scroll sideways and stop on each one.
export const post = (d) => {
  const id = `deck-${d.pack}`;
  return `<article class="post glass" aria-labelledby="${id}" data-deck>
<header class="post-top"><span class="post-face" aria-hidden="true">${esc([...d.account][0])}</span><h3 id="${id}">${esc(d.account)}</h3>${d.fictional ? '<span class="post-tag">חשבון לדוגמה</span>' : `<span class="post-handle" dir="ltr">${esc(d.handle)}</span>`}</header>
<div class="post-frame">
<ul class="post-slides" tabindex="0" aria-label="${esc(`${d.slides.length} שקופיות של ${d.account}`)}">
${d.slides.map((s, i) => `<li>${img(d, s, 'ig', i > 0)}</li>`).join('\n')}
</ul>
<button class="post-go prev" type="button" aria-label="השקופית הקודמת" hidden><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg></button>
<button class="post-go next" type="button" aria-label="השקופית הבאה" hidden><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 6-6 6 6 6"/></svg></button>
<span class="post-count" aria-hidden="true" hidden>1/${d.slides.length}</span>
</div>
<div class="post-dots" aria-hidden="true">${d.slides.map((_, i) => `<i${i ? '' : ' class="on"'}></i>`).join('')}</div>
<p class="post-topic">${esc(d.topic)}</p>
${d.photo ? `<p class="post-credit">צילום השער <a href="${esc(d.photo.page)}" rel="noopener" dir="ltr">${esc(d.photo.by)}, ${esc(d.photo.provider)}</a></p>` : ''}
</article>`;
};
