// What every page is built with: the config reader that refuses a guess, the brand marks, and the copy lint.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

// Each fact the site states: the words a draft shows in its place, and what a value must look like. A key in
// site.config.json that is not here is a build error, so a new fact gets a label before it gets a page.
//   kind: 'text', 'number' (0 or more), 'lines' (a list of sentences), or the list of allowed values
//   unless: the fact is not needed when this is true (the build then lets it stay empty)
const metaIncluded = (raw) => raw.price?.metaFees === 'included';
export const FACTS = {
  domain: { label: 'הדומיין', kind: 'text' },
  whatsapp: { label: 'מספר הוואטסאפ שלנו', kind: 'text' },
  'demo.time': { label: 'זמן הכנת דמו', kind: 'text' },
  'about.who': { label: 'משפט על מי אנחנו', kind: 'text' },
  'about.why': { label: 'משפט על למה בנינו את תורן', kind: 'text' },
  'price.monthly': { label: 'המחיר החודשי', kind: 'number' },
  'price.vat': { label: 'כולל או לא כולל מע״מ', kind: ['included', 'excluded'] },
  'price.setup': { label: 'דמי הקמה, 0 אם אין', kind: 'number' },
  'price.metaFees': { label: 'איך משלמים ל-Meta', kind: ['direct', 'billed', 'included'] },
  'price.metaMarketing': { label: 'מחיר הודעת שיווק של Meta', kind: 'number', unless: metaIncluded },
  'price.metaUtility': { label: 'מחיר הודעת עדכון של Meta', kind: 'number', unless: metaIncluded },
  'price.exampleCarts': { label: 'מספר תזכורות בדוגמה', kind: 'number' },
  'price.exampleUpdates': { label: 'מספר עדכוני משלוח בדוגמה', kind: 'number' },
  'price.commitmentMonths': { label: 'חודשי התחייבות, 0 אם אין', kind: 'number' },
  'price.stops': { label: 'מתי החיוב נעצר', kind: ['period-end', 'immediately'] },
  'toran.today': { label: 'מה תורן עושה היום', kind: 'lines' },
  'toran.notYet': { label: 'מה תורן עוד לא עושה', kind: 'lines' },
};

// The config, read so that nothing missing can be shown as a guess. An empty value ('' or null) is missing.
// The real build fails on any missing key, used or not; a draft shows each one as a visible [placeholder].
export function readConfig(draft) {
  const raw = JSON.parse(fs.readFileSync(path.join(ROOT, 'site.config.json'), 'utf8'));
  const missing = new Map();
  const empty = (v) => v === null || v === '' || v === undefined || (Array.isArray(v) && v.length === 0);
  const at = (key) => key.split('.').reduce((o, k) => (o == null ? undefined : o[k]), raw);
  const label = (key) => FACTS[key].label;

  const walk = (o, pre = '') => {
    for (const [k, v] of Object.entries(o)) {
      const key = pre + k;
      if (v && typeof v === 'object' && !Array.isArray(v)) { walk(v, key + '.'); continue; }
      const f = FACTS[key];
      if (!f) throw new Error(`site.config.json: "${key}" has no entry in FACTS (src/lib.mjs)`);
      if (empty(v)) { if (!f.unless?.(raw)) missing.set(key, f.label); continue; }
      if (f.kind === 'number' && !(typeof v === 'number' && v >= 0)) throw new Error(`site.config.json: "${key}" must be a number, 0 or more (got ${JSON.stringify(v)})`);
      if (f.kind === 'lines' && !(Array.isArray(v) && v.every((x) => typeof x === 'string' && x.trim()))) throw new Error(`site.config.json: "${key}" must be a list of sentences`);
      if (f.kind !== 'lines' && Array.isArray(v)) throw new Error(`site.config.json: "${key}" must not be a list`);
      if (Array.isArray(f.kind) && !f.kind.includes(v)) throw new Error(`site.config.json: "${key}" must be one of ${f.kind.join(', ')} (got ${JSON.stringify(v)})`);
    }
  };
  walk(raw);
  for (const key of Object.keys(FACTS)) if (at(key) === undefined) throw new Error(`site.config.json: "${key}" is not there (add it, empty if not decided)`);

  const get = (key) => {
    if (!FACTS[key]) throw new Error(`no fact called "${key}" in FACTS (src/lib.mjs)`);
    const v = at(key);
    if (empty(v)) { missing.set(key, label(key)); return null; }
    return v;
  };
  // A fact as text on the page: escaped, or a visible placeholder in a draft.
  const ph = (key) => `<mark class="ph">[${esc(label(key))}]</mark>`;
  const t = (key, fmt = String) => {
    const v = get(key);
    return v == null ? ph(key) : esc(fmt(v));
  };

  const wa = get('whatsapp');
  if (wa != null && !/^972[1-9]\d{7,8}$/.test(String(wa))) throw new Error(`site.config.json: whatsapp must be digits in international form, like 9725XXXXXXXX (got "${wa}")`);

  return { get, t, ph, missing, draft };
}

// Shekels the way the site writes them: 1,290 ₪, and 0.15 ₪ for a fraction.
export const ils = (n) => `${n.toLocaleString('he-IL', { maximumFractionDigits: 2 })} ₪`;

// ---------------------------------------------------------------- the marks

// The brand's glyphs, read from assets/brand and never redrawn. The tile is the product's colour with rx 24 on 100,
// as in the brand files; at 48px and below the company's mark is the simpler 5x5 halftone (assets/brand/README.md).
const glyphs = {};
const glyph = (file) =>
  (glyphs[file] ??= fs.readFileSync(path.join(ROOT, 'assets/brand/svg', file + '.svg'), 'utf8').trim().replace('<svg ', '<svg aria-hidden="true" focusable="false" '));

// A glyph alone, in currentColor, for a field already in the mark's own colour (Teder's wave on its violet).
export const glyphOnly = (name) => glyph(`${name}-glyph`);

export function mark(name, size, label = '') {
  const file = name === 'openfrequency' ? (size <= 48 ? 'openfrequency-glyph-small' : 'openfrequency-glyph') : `${name}-glyph`;
  const a11y = label ? ` role="img" aria-label="${esc(label)}"` : ' aria-hidden="true"';
  return `<span class="mark ${name}" style="--s:${size}px"${a11y}>${glyph(file)}</span>`;
}

// ---------------------------------------------------------------- the product names

// Toran and Teder are Hebrew words, so in a sentence a reader can take them for the plain words (a duty officer,
// a frequency). Every mention in running text is set as a name: <span class="pn toran">. A prefix letter (ו, ל,
// ש...) stays outside the span. A name standing alone (a door's heading), the nav, buttons, links and the
// product's own UI (data-ui) are left alone: they already carry the mark, or they are the product talking.
const SKIP = /^(?:head|script|style|title|nav|button|a|b|textarea|select|label)$/;
const NAME = /(^|[^֐-׿])([ובלמשהכ]{0,2})(תורן|תדר)(?![֐-׿])/g;
const ALONE = /^\s*(?:תורן|תדר)\s*$/;
export function markNames(html) {
  let skip = null; // [tag, depth] of the element being skipped
  return html.split(/(<[^>]+>)/).map((part) => {
    if (part.startsWith('<')) {
      const m = /^<(\/?)([a-z0-9]+)/i.exec(part);
      if (!m) return part;
      const close = m[1], tag = m[2].toLowerCase();
      if (skip) {
        if (tag === skip[0]) skip[1] += close ? -1 : 1;
        if (skip[1] === 0) skip = null;
      } else if (!close && !part.endsWith('/>') && (SKIP.test(tag) || /\sdata-ui[\s>=]/.test(part))) {
        skip = [tag, 1];
      }
      return part;
    }
    if (skip || ALONE.test(part)) return part;
    return part.replace(NAME, (_, pre, prefix, name) =>
      `${pre}${prefix}<span class="pn ${name === 'תורן' ? 'toran' : 'teder'}${prefix ? ' after' : ''}">${name}</span>`);
  }).join('');
}

// ---------------------------------------------------------------- the copy lint

// A backstop for the hebrew-voice rewrite pass, run on every built page. It catches the patterns that are easy to
// miss when copy is edited later; it does not replace reading the copy.
const BANNED = [
  ['על מנת', 'כדי'], ['במידה ו', 'אם'], ['ניתן ל', 'אפשר ל'], ['בגין', 'על'], ['הננו', ''], ['יש לציין', ''],
  ['לשירותכם', ''], ['בלי כרטיס אשראי', ''], ['בלי אותיות קטנות', ''], ['השליטה אצלכם', ''], ['אל תפספסו', ''],
  ['פתרון מתקדם', ''], ['חוויית משתמש', ''], ['לשלב הבא', ''], ['מהפכה', ''], ['ניסיון חינם', 'there is no free trial'],
  ['תקופת ניסיון', 'there is no free trial'],
];

export function lint(file, html, { draft }) {
  const errors = [];
  const body = html.replace(/<style[\s\S]*?<\/style>/g, '').replace(/<script[\s\S]*?<\/script>/g, '');
  const text = body.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ');
  const attrs = [...body.matchAll(/\b(?:alt|aria-label|title|content|placeholder)="([^"]*)"/g)].map((m) => m[1]).join('\n');
  const all = text + '\n' + attrs;

  if (/[–—]/.test(all)) errors.push('an em or en dash');
  if (/!!/.test(all)) errors.push('"!!"');
  if (/[֐-׿]\/[֐-׿]/.test(all)) errors.push('a gendered slash (like את/ה)');
  for (const m of body.matchAll(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/g)) {
    // a time of day (02:10) is not a heading's colon
    if (m[1].replace(/<[^>]+>/g, '').replace(/\d:\d/g, '').includes(':')) errors.push(`a colon in a heading: "${m[1].replace(/<[^>]+>/g, '').trim()}"`);
  }
  for (const [w, fix] of BANNED) if (all.includes(w)) errors.push(`"${w}"${fix ? ` (${fix})` : ''}`);
  if (!draft && /\[[^\]\n]{1,60}\]/.test(text)) errors.push('a [placeholder] left in the text');
  return errors.map((e) => `${file}: ${e}`);
}

// The stylesheet, small enough to inline whole: comments and spare whitespace out, nothing clever.
export const minifyCss = (css) =>
  css.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ').replace(/\s*([{};,>])\s*/g, '$1').replace(/;}/g, '}').trim();
