// What every page is built with: the config reader that refuses a guess, the brand marks, and the copy lint.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

// Each fact the site states, with the words a draft shows in its place. A key missing here is a build error,
// so a new fact gets a label before it gets a page.
export const FACTS = {
  domain: 'הדומיין',
  city: 'העיר',
  whatsapp: 'מספר הוואטסאפ שלנו',
  'demo.time': 'זמן הכנת דמו',
};

// The config, read so that nothing missing can be shown as a guess. An empty value ('' or null) is missing.
// The real build fails on any missing key, used or not; a draft shows each one as a visible [placeholder].
export function readConfig(draft) {
  const raw = JSON.parse(fs.readFileSync(path.join(ROOT, 'site.config.json'), 'utf8'));
  const missing = new Map();
  const empty = (v) => v === null || v === '' || v === undefined;

  const walk = (o, pre = '') => {
    for (const [k, v] of Object.entries(o)) {
      const key = pre + k;
      if (v && typeof v === 'object' && !Array.isArray(v)) walk(v, key + '.');
      else {
        if (!(key in FACTS)) throw new Error(`site.config.json: "${key}" has no label in FACTS (src/lib.mjs)`);
        if (empty(v)) missing.set(key, FACTS[key]);
      }
    }
  };
  walk(raw);

  const get = (key) => {
    if (!(key in FACTS)) throw new Error(`no fact called "${key}" in FACTS (src/lib.mjs)`);
    const v = key.split('.').reduce((o, k) => (o == null ? undefined : o[k]), raw);
    if (empty(v)) { missing.set(key, FACTS[key]); return null; }
    return v;
  };
  // A fact as text on the page: escaped, or a visible placeholder in a draft.
  const t = (key, fmt = String) => {
    const v = get(key);
    return v == null ? `<mark class="ph">[${esc(FACTS[key])}]</mark>` : esc(fmt(v));
  };

  const wa = get('whatsapp');
  if (wa != null && !/^972[1-9]\d{7,8}$/.test(String(wa))) throw new Error(`site.config.json: whatsapp must be digits in international form, like 9725XXXXXXXX (got "${wa}")`);

  return { get, t, missing, draft };
}

// ---------------------------------------------------------------- the marks

// The brand's glyphs, read from assets/brand and never redrawn. The tile is the product's colour with rx 24 on 100,
// as in the brand files; at 48px and below the company's mark is the simpler 5x5 halftone (assets/brand/README.md).
const glyphs = {};
const glyph = (file) =>
  (glyphs[file] ??= fs.readFileSync(path.join(ROOT, 'assets/brand/svg', file + '.svg'), 'utf8').trim().replace('<svg ', '<svg aria-hidden="true" focusable="false" '));

export function mark(name, size, label = '') {
  const file = name === 'openfrequency' ? (size <= 48 ? 'openfrequency-glyph-small' : 'openfrequency-glyph') : `${name}-glyph`;
  const a11y = label ? ` role="img" aria-label="${esc(label)}"` : ' aria-hidden="true"';
  return `<span class="mark ${name}" style="--s:${size}px"${a11y}>${glyph(file)}</span>`;
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
