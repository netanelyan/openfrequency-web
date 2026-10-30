import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// Every JavaScript file of the repository parses, the scripts no test runs included (scripts/*.mjs, src/form.js, which
// only the browser loads). On 2026-10-30 a quote inside a string of accounts' scripts/web.js stopped that service from
// starting, sign-in down for three minutes, with every one of its tests passing; this is the same test as accounts'
// test/syntax.test.js. node --check reads each file without running it.

const root = fileURLToPath(new URL('..', import.meta.url));
const files = execFileSync('git', ['ls-files', '*.js', '*.mjs', '*.cjs'], { cwd: root, encoding: 'utf8' }).split('\n').filter(Boolean);

test('every JavaScript file parses (node --check), the scripts no test runs included', () => {
  assert.ok(files.includes('server/lead.mjs') && files.includes('scripts/og.mjs'), 'the endpoint and the scripts are among the files checked');
  const bad = [];
  for (const f of files) {
    try {
      execFileSync(process.execPath, ['--check', f], { cwd: root, stdio: 'pipe' });
    } catch (e) {
      bad.push(`${f}: ${String(e.stderr || e.message).split('\n').find((l) => /Error/.test(l)) || 'does not parse'}`);
    }
  }
  assert.deepEqual(bad, [], bad.join('\n'));
});
