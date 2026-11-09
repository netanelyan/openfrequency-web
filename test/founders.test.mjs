// The founders' offer (sections.mjs foundersBox; the owner, 2026-11-09: "no דמי הקמה for the next 10 people"): on the
// home page, /join and both price cards while founders.on, gone when it is off or sign-up is closed. The count of spots
// left is never written into the page: site.js reads it from accounts (/public/founders.json), and the CSP lets it.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const config = JSON.parse(fs.readFileSync(path.join(ROOT, 'site.config.json'), 'utf8'));
const out = fs.mkdtempSync(path.join(os.tmpdir(), 'of-founders-'));
const PAGES = ['index.html', 'join/index.html', 'teder/index.html', 'toran/index.html'];
const pages = {};
const build = (name, patch) => {
  const cfg = path.join(out, `${name}.json`);
  fs.writeFileSync(cfg, JSON.stringify({ ...config, ...patch }));
  const dir = path.join(out, name);
  const b = spawnSync(process.execPath, ['build.mjs'], { cwd: ROOT, env: { ...process.env, SITE_CONFIG: cfg, SITE_OUT: dir }, encoding: 'utf8' });
  assert.equal(b.status, 0, `the build failed:\n${b.stdout}\n${b.stderr}`);
  for (const p of PAGES) pages[`${name}/${p}`] = fs.readFileSync(path.join(dir, p), 'utf8');
};
before(() => {
  build('on', { founders: { on: true, spots: 10 } });
  build('off', { founders: { on: false, spots: '' } });
});
after(() => fs.rmSync(out, { recursive: true, force: true }));

test('on: the offer on the home page, /join and both price cards, with the count left to accounts', () => {
  for (const p of PAGES) {
    const h = pages[`on/${p}`];
    assert.match(h, /<div class="founders glass[^"]*" data-founders="https:\/\/accounts\.openfrequency\.co\.il\/public\/founders\.json">/, p);
    assert.match(h, /10 העסקים הראשונים שנרשמים לא משלמים דמי הקמה/, p);
    assert.match(h, /<div class="founders-count" data-founders-count hidden>/, `${p}: the count waits for the real one`);
    assert.doesNotMatch(h.match(/<div class="founders [\s\S]*?<\/div>\n<\/div>/)[0], /נשארו|מתוך/, `${p}: no number written into the box`);
    assert.match(h, /connect-src 'self' https:\/\/accounts\.openfrequency\.co\.il/, `${p}: the CSP lets the count in`);
  }
});

test('off: no offer anywhere', () => {
  for (const p of PAGES) assert.doesNotMatch(pages[`off/${p}`].replace(/<script[\s\S]*?<\/script>/g, ''), /data-founders|מבצע מייסדים/, p);
});
