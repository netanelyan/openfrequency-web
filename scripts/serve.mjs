// Serves dist/ the way Caddy will: /toran is dist/toran/index.html, and anything else is the 404 page.
//   node scripts/serve.mjs [port]   (default 4730)
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../dist');
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml' };

function resolve(url) {
  const p = path.normalize(decodeURIComponent(new URL(url, 'http://x').pathname)).replace(/^([/\\])+/, '');
  for (const c of [p, path.join(p, 'index.html'), p + '.html']) {
    const f = path.join(DIST, c);
    if (f.startsWith(DIST) && fs.existsSync(f) && fs.statSync(f).isFile()) return f;
  }
  return null;
}

// /api/* goes to the lead endpoint, as Caddy sends it; when that isn't running, a plain post gets the try-again page
// and a script gets a 502, the same as on the server.
function proxy(req, res, apiPort) {
  const up = http.request({ host: '127.0.0.1', port: apiPort, path: req.url, method: req.method, headers: req.headers }, (r) => {
    res.writeHead(r.statusCode, r.headers);
    r.pipe(res);
  });
  up.on('error', () => {
    const page = path.join(DIST, 'try-again/index.html');
    const html = String(req.headers.accept || '').includes('text/html') && fs.existsSync(page);
    res.writeHead(502, { 'Content-Type': html ? TYPES['.html'] : 'text/plain' });
    res.end(html ? fs.readFileSync(page) : 'bad gateway');
  });
  req.pipe(up);
}

export function serve(port = 4730, apiPort = Number(process.env.API_PORT) || 4720) {
  const server = http.createServer((req, res) => {
    if (req.url.startsWith('/api/')) return proxy(req, res, apiPort);
    const f = resolve(req.url);
    const nf = path.join(DIST, '404.html');
    const file = f || (fs.existsSync(nf) ? nf : null);
    res.writeHead(f ? 200 : 404, { 'Content-Type': file ? TYPES[path.extname(file)] || 'application/octet-stream' : 'text/plain' });
    res.end(file ? fs.readFileSync(file) : 'not found');
  });
  return new Promise((ok) => server.listen(port, '127.0.0.1', () => ok(server)));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.argv[2]) || 4730;
  await serve(port);
  console.log(`http://127.0.0.1:${port}`);
}
