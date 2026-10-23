// Teder's real slides, shared by its door on the home page and its own page: the cover of one slideshow for each
// subject, from assets/teder/showcase.json, which scripts/showcase.mjs writes from the slideshows Teder hands over.
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, esc, glyphOnly } from './lib.mjs';

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

// One cover per subject, named by its subject first, so a visitor finds the one they care about at a glance.
export const cover = (c) => `<article class="cover glass" aria-labelledby="cover-${c.pack}">
<h3 id="cover-${c.pack}" class="cover-subject">${esc(c.subject)}</h3>
${img(c, 'ig', true)}
<p class="cover-topic">${esc(c.topic)}</p>
<p class="cover-from"><bdi dir="ltr">${esc(c.handle)}</bdi>${c.fictional ? ', חשבון לדוגמה' : ''}${c.photo ? `<br>צילום <a href="${esc(c.photo.page)}" rel="noopener"><bdi dir="ltr">${esc(c.photo.by)}, ${esc(c.photo.provider)}</bdi></a>` : ''}</p>
</article>`;
