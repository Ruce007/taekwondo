// Local preview.   Run:  npm run dev   then open http://localhost:4321
// Rebuilds automatically when you save a file in content/, src/ or public/.

import http from 'node:http';
import { watch } from 'node:fs';
import { readFile, stat } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const port = Number(process.env.PORT) || 4321;

const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
};

let building = false;
let again = false;
function build() {
  if (building) {
    again = true;
    return;
  }
  building = true;
  const p = spawn(process.execPath, [path.join(root, 'scripts/build.mjs')], { stdio: 'inherit' });
  p.on('close', () => {
    building = false;
    if (again) {
      again = false;
      build();
    }
  });
}

let timer;
for (const dir of ['content', 'src', 'public']) {
  watch(path.join(root, dir), { recursive: true }, () => {
    clearTimeout(timer);
    timer = setTimeout(build, 150);
  });
}
build();

http
  .createServer(async (req, res) => {
    const urlPath = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    let file = path.join(dist, path.normalize(urlPath));
    if (!file.startsWith(dist)) {
      res.writeHead(403).end('Forbidden');
      return;
    }
    try {
      if ((await stat(file)).isDirectory()) file = path.join(file, 'index.html');
      const body = await readFile(file);
      res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' }).end(body);
    } catch {
      const body = await readFile(path.join(dist, '404.html')).catch(() => 'Not found');
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' }).end(body);
    }
  })
  .listen(port, () => console.log(`Preview running at http://localhost:${port}`));
