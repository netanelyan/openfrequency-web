// The businesses we run ourselves, on the home page under the two doors: our own online stores and sites, where we met
// what Toran and Teder do before we built them. The heading and the line under it say they are ours; they are not
// customers, and the strip never calls them that (the build's copy lint keeps market claims out too). To add one, put
// its square icon in assets/clients/ and add a row here. The line says what the business does, in its own words from
// its site. `pad` insets an icon that has no tile of its own, so it sits on white like the others.
import { esc, mark } from './lib.mjs';

export const CLIENTS = [
  // We run on our own tools too; no logo file, so the card shows our mark.
  { name: 'OpenFrequency', url: '/', line: 'תדר ותורן לחנויות אונליין' },
  { name: 'חנות השופט', url: 'https://hashofet.com', logo: 'hashofet.png', pad: 3, line: 'חולצות כדורגל לקבוצות, לנבחרות ורטרו' },
  { name: 'BrickDeal', url: 'https://brickdealil.com', logo: 'brickdeal.svg', line: 'דילים על אבני בנייה תואמות מאליאקספרס' },
  { name: 'טיול+', url: 'https://www.tiyulplus.com', logo: 'tiyulplus.svg', pad: 9, line: 'סוכן נסיעות חכם לישראלים' },
];

const card = (c, hidden) => `<li${hidden ? ' aria-hidden="true"' : ''}><a class="client glass" href="${esc(c.url)}" rel="noopener"${hidden ? ' tabindex="-1"' : ''}>
<span class="client-logo">${c.logo ? `<img src="/clients/${esc(c.logo)}" alt="" width="44" height="44" loading="lazy"${c.pad ? ` style="padding:${c.pad}px"` : ''}>` : mark('openfrequency', 44)}</span>
<span class="client-t"><b>${esc(c.name)}</b><small>${esc(c.line)}</small></span></a></li>`;

// A strip that moves on its own and pauses under the pointer or the keyboard. The row is two identical lists side by
// side, moved by exactly one list's width, so the loop has no seam. Each list repeats the businesses until it is
// wider than the widest screen (WIDEST: a 32:9 ultrawide, 5120px, zoomed out to 67%); narrower than the screen, an
// empty stretch slid in at the end of each loop (6 cards, 1,824px, on a 1920px screen; 15 cards on a 5120px one).
// STEP is a card and the gap after it (.client, .clients-list in style.css). Only the first copy is read out and
// reachable by Tab.
const WIDEST = 7680;
const STEP = 290 + 14;
export function clients() {
  const reps = Math.max(1, Math.ceil(WIDEST / STEP / CLIENTS.length));
  const list = (hidden) => Array.from({ length: reps }, (_, r) => CLIENTS.map((c) => card(c, hidden || r > 0)).join('')).join('');
  return `
<section class="clients-sec" aria-labelledby="clients-h">
<div class="wrap"><h2 id="clients-h" class="clients-h"><span>העסקים של</span> <span class="clients-of">${mark('openfrequency', 28)}<b>OpenFrequency</b></span></h2>
<p class="clients-sub">אנחנו מריצים את העסקים האלה בעצמנו, ובהם הכרנו קודם את מה שתורן ותדר פותרים.</p></div>
<div class="clients" style="--n:${CLIENTS.length * reps}">
<div class="clients-row">
<ul class="clients-list">${list(false)}</ul>
<ul class="clients-list" aria-hidden="true">${list(true)}</ul>
</div>
</div>
</section>`;
}
