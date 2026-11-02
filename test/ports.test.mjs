import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { BAD_PORTS, basePort, listenFree } from './ports.mjs';

// Test servers take only ports fetch accepts (test/ports.mjs): a deploy stopped on 2026-11-02 because the lead test's
// server sat on 5060, which fetch refuses.

const DIR = path.dirname(fileURLToPath(import.meta.url));

test('the list is fetch\'s own: a port on it is refused as a bad port, one beside it is only unreachable', async () => {
  const why = async (port) => {
    try {
      await fetch(`http://127.0.0.1:${port}/`, { signal: AbortSignal.timeout(3000) });
      return 'answered';
    } catch (e) {
      return String(e.cause?.message || e.message);
    }
  };
  for (const port of [5060, 5061, 6000, 10080]) {
    assert.ok(BAD_PORTS.has(port));
    assert.equal(await why(port), 'bad port', `${port}`);
  }
  for (const port of [5059, 5062]) assert.notEqual(await why(port), 'bad port', `${port}`);
  assert.equal(BAD_PORTS.size, 82);
});

test('basePort: every base it can give keeps every step clear; one that cannot be is refused', () => {
  const steps = [0, 100, 200, 300, 400, 500, 600, 700];
  for (let i = 0; i < 100; i++) {
    const base = basePort(4790, 100, steps, () => i / 100);
    for (const s of steps) assert.ok(!BAD_PORTS.has(base + s), `${base} + ${s}`);
  }
  // 4860 + 200 is 5060: never given.
  const given = new Set(Array.from({ length: 100 }, (_, i) => basePort(4790, 100, steps, () => i / 100)));
  assert.ok(!given.has(4860) && !given.has(4861));
  assert.throws(() => basePort(5060, 2), /no base/);
});

test('listenFree: a server that lands on a refused port listens again elsewhere', async () => {
  const server = http.createServer((req, res) => res.end('ok'));
  const realAddress = server.address.bind(server);
  let first = true;
  // The first listen reports 5060, as the system might pick it; the helper closes and listens again.
  server.address = () => (first ? ((first = false), { ...realAddress(), port: 5060 }) : realAddress());
  const port = await listenFree(server);
  try {
    assert.ok(!BAD_PORTS.has(port));
    assert.equal(await (await fetch(`http://127.0.0.1:${port}/`)).text(), 'ok');
  } finally {
    await new Promise((ok) => server.close(ok));
  }
});

test('no test listens on a port the system picks except through listenFree, nor picks a fixed port by hand', () => {
  const found = [];
  for (const f of fs.readdirSync(DIR).filter((n) => n.endsWith('.test.mjs') && n !== 'ports.test.mjs')) {
    fs.readFileSync(path.join(DIR, f), 'utf8')
      .split('\n')
      .forEach((line, i) => {
        if (/\.listen\(\s*0\b/.test(line) || /Math\.random\(\)\s*\*\s*\d+\)/.test(line) && /PORT|port/.test(line)) found.push(`${f}:${i + 1}: ${line.trim()}`);
      });
  }
  assert.deepEqual(found, [], 'listen through listenFree, and pick a base with basePort (test/ports.mjs)');
});
