// Brings the covers of Teder's showcase slideshows into the site: the first slide of private/showcase/<pack>/<post>/
// (as Teder hands them over) into assets/teder/showcase/<pack>/, resized, with assets/teder/showcase.json for the
// pages to read. Only covers: a visitor looks for the topic they care about, not through a whole slideshow.
// And the three covers in the home page's WhatsApp example: private/assistant/<n>-<kind>/, which Teder writes from its
// fictional demo account (openfrequency-teder, node scripts/showcase.js), into assets/teder/assistant/<n>.jpg with
// assets/teder/assistant.json. Those come only from a made-up account (@demo.), never a store's or one of ours.
//   node scripts/showcase.mjs
// Every photo on a slide must be under the Pexels or Unsplash licence, or a free Wikimedia Commons one (public domain,
// CC0, CC BY, CC BY-SA: the list Teder searches by, never NC or ND) with a name to credit, or nothing is written.
// Uses the installed Chrome through playwright-core to resize; nothing is downloaded.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FROM = path.join(ROOT, 'private/showcase');
const TO = path.join(ROOT, 'assets/teder/showcase');
// The order on the page, and what each account is about: our three accounts, then the made-up one.
const SUBJECT = { 'ai-tips': 'בינה מלאכותית', football: 'כדורגל', money: 'כסף', demo: 'צמחי בית' };
const ORDER = Object.keys(SUBJECT);
// Twice the largest size each one is shown at.
const SIZE = { instagram: [640, 800], tiktok: [540, 960] };
const LICENCES = { Pexels: 'Pexels License', Unsplash: 'Unsplash License' };
const COMMONS_OK = /^(?:cc0|cc[- ]zero|public domain|pd(?:[- ].*)?|cc by(?:-sa)? \d(?:\.\d)?(?: .*)?|cc by(?:-sa)?|attribution(?:-sharealike)?)$/i;
const COMMONS_NO = /\bnc\b|non-?commercial|\bnd\b|no ?deriv|fair use|copyrighted|all rights reserved/i;
const licenceOk = (p) =>
  p.provider === 'Wikimedia Commons'
    ? COMMONS_OK.test(String(p.licence || '').trim()) && !COMMONS_NO.test(p.licence) && (!/\bby\b|attribution/i.test(p.licence) || Boolean(String(p.photographer || '').trim()))
    : LICENCES[p.provider] === p.licence;

const decks = [];
const problems = [];
const packs = fs.readdirSync(FROM).filter((p) => { if (!SUBJECT[p]) problems.push(`${p}: no subject in SUBJECT (scripts/showcase.mjs)`); return SUBJECT[p]; }).sort((a, b) => ORDER.indexOf(a) - ORDER.indexOf(b));
for (const pack of packs) {
  const posts = fs.readdirSync(path.join(FROM, pack));
  if (posts.length !== 1) { problems.push(`${pack}: expected one post, found ${posts.length}`); continue; }
  const dir = path.join(FROM, pack, posts[0]);
  const m = JSON.parse(fs.readFileSync(path.join(dir, 'manifest.json'), 'utf8'));
  const first = m.slides.find((s) => s.n === 1);
  for (const p of [m.background, first.photo].filter(Boolean)) {
    if (!licenceOk(p)) problems.push(`${pack}: a photo from ${p.provider} under "${p.licence}" (${p.page})`);
  }
  const cover = first.photo ?? m.background;
  decks.push({
    pack,
    subject: SUBJECT[pack],
    dir,
    account: m.account,
    handle: m.handle,
    topic: m.topic,
    fictional: m.handle.startsWith('@demo.'),
    // A Commons licence asks for its name beside the photo (CC BY, CC BY-SA); Pexels and Unsplash ask for nothing.
    photo: cover && { by: String(cover.photographer || '').replace(/\s+/g, ' ').trim(), provider: cover.provider, page: cover.page, ...(cover.provider === 'Wikimedia Commons' ? { licence: cover.licence } : {}) },
    slides: [first].map((s) => ({ n: s.n, files: s.files, alt: s.text.filter((t) => !t.startsWith('@')).map((t) => t.replace(/\s*\n\s*/g, ' ').trim()).join('. ').replace(/([.?!])\./g, '$1') })),
  });
}
// The WhatsApp example's three, in the order Teder numbered them.
const AFROM = path.join(ROOT, 'private/assistant');
const ATO = path.join(ROOT, 'assets/teder/assistant');
const thumbs = fs.readdirSync(AFROM).sort((a, b) => parseInt(a) - parseInt(b)).map((post) => {
  const dir = path.join(AFROM, post);
  const m = JSON.parse(fs.readFileSync(path.join(dir, 'manifest.json'), 'utf8'));
  const s = m.slides.find((x) => x.n === 1);
  if (!m.handle.startsWith('@demo.')) problems.push(`assistant/${post}: ${m.handle} is not a made-up account`);
  if (s.photo && !licenceOk(s.photo)) problems.push(`assistant/${post}: a photo from ${s.photo.provider} under "${s.photo.licence}" (${s.photo.page})`);
  return {
    dir,
    file: s.files.tiktok,
    topic: m.topic,
    alt: s.text.map((t) => t.replace(/\s*\n\s*/g, ' ').trim()).join('. ').replace(/([.?!])\./g, '$1'),
    photo: s.photo ? { by: String(s.photo.photographer || '').trim(), provider: s.photo.provider, page: s.photo.page } : null,
  };
});
if (thumbs.length !== 3) problems.push(`assistant: expected 3 covers, found ${thumbs.length}`);
if (problems.length) { console.error(problems.join('\n')); process.exit(1); }

fs.rmSync(TO, { recursive: true, force: true });
fs.rmSync(ATO, { recursive: true, force: true });
const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage();
const jpeg = (file) => 'data:image/jpeg;base64,' + fs.readFileSync(file).toString('base64');
const resize = (src, w, h) => page.evaluate(async ([src, w, h]) => {
  const im = new Image();
  im.src = src;
  await im.decode();
  const c = Object.assign(document.createElement('canvas'), { width: w, height: h });
  const x = c.getContext('2d');
  x.imageSmoothingQuality = 'high';
  x.drawImage(im, 0, 0, w, h);
  return c.toDataURL('image/jpeg', 0.84);
}, [src, w, h]);
// Shown about 90px wide in a chat bubble: twice that.
fs.mkdirSync(ATO, { recursive: true });
for (const [i, t] of thumbs.entries()) {
  const data = await resize(jpeg(path.join(t.dir, t.file)), 180, 320);
  fs.writeFileSync(path.join(ATO, `${i + 1}.jpg`), Buffer.from(data.split(',')[1], 'base64'));
}
fs.writeFileSync(path.join(ROOT, 'assets/teder/assistant.json'), JSON.stringify(thumbs.map(({ dir, file, ...t }, i) => ({ n: i + 1, ...t })), null, 2) + '\n');
for (const d of decks) {
  fs.mkdirSync(path.join(TO, d.pack), { recursive: true });
  for (const s of d.slides) {
    for (const [kind, [w, h]] of Object.entries(SIZE)) {
      const data = await resize(jpeg(path.join(d.dir, s.files[kind])), w, h);
      fs.writeFileSync(path.join(TO, d.pack, `${kind === 'instagram' ? 'ig' : 'tt'}-${String(s.n).padStart(2, '0')}.jpg`), Buffer.from(data.split(',')[1], 'base64'));
    }
  }
}
await browser.close();

const out = decks.map(({ dir, slides: [s], ...d }) => ({ ...d, alt: s.alt }));
fs.writeFileSync(path.join(ROOT, 'assets/teder/showcase.json'), JSON.stringify(out, null, 2) + '\n');
console.log([...decks.map((d) => `${d.pack}: the cover`), ...thumbs.map((t, i) => `assistant ${i + 1}: ${t.topic}`)].join('\n'));
