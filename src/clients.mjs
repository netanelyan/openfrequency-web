// Businesses that work with OpenFrequency, on the home page under the two doors. To add one, put its square icon in
// assets/clients/ and add a row here. The line says what the business does, in its own words from its site. `pad`
// insets an icon that has no tile of its own, so it sits on white like the others.
import { esc, mark } from './lib.mjs';

export const CLIENTS = [
  { name: 'OpenFrequency', url: 'https://openfrequency.co.il', line: 'החברה שמאחורי תורן ותדר' },
  { name: 'חנות השופט', url: 'https://hashofet.com', logo: 'hashofet.png', pad: 3, line: 'חולצות כדורגל לקבוצות, לנבחרות ורטרו' },
  { name: 'BrickDeal', url: 'https://brickdealil.com', logo: 'brickdeal.svg', line: 'דילים על אבני בנייה תואמות מאליאקספרס' },
  { name: 'טיול+', url: 'https://www.tiyulplus.com', logo: 'tiyulplus.svg', pad: 9, line: 'סוכן נסיעות חכם לישראלים' },
];

const card = (c, hidden) => `<li${hidden ? ' aria-hidden="true"' : ''}><a class="client glass" href="${esc(c.url)}" rel="noopener"${hidden ? ' tabindex="-1"' : ''}>
<span class="client-logo">${c.logo ? `<img src="/clients/${esc(c.logo)}" alt="" width="44" height="44" loading="lazy"${c.pad ? ` style="padding:${c.pad}px"` : ''}>` : mark('openfrequency', 44)}</span>
<span class="client-t"><b>${esc(c.name)}</b><small>${esc(c.line)}</small></span></a></li>`;

// A strip that moves on its own and pauses under the pointer or the keyboard. The row is two identical lists side by
// side, moved by exactly one list's width, so the loop has no seam. Each list repeats the businesses until it is
// wider than a wide screen; only the first copy is read out and reachable by Tab.
export function clients() {
  const reps = Math.max(1, Math.ceil(6 / CLIENTS.length));
  const list = (hidden) => Array.from({ length: reps }, (_, r) => CLIENTS.map((c) => card(c, hidden || r > 0)).join('')).join('');
  return `
<section class="clients-sec" aria-labelledby="clients-h">
<div class="wrap"><h2 id="clients-h">עסקים שעובדים עם OpenFrequency</h2></div>
<div class="clients" style="--n:${CLIENTS.length * reps}">
<div class="clients-row">
<ul class="clients-list">${list(false)}</ul>
<ul class="clients-list" aria-hidden="true">${list(true)}</ul>
</div>
</div>
</section>`;
}
