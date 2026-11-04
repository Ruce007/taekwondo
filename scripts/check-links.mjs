// Checks every outside link in the content: source citations, links in the text and school websites.
//   npm run check:links
// Broken links (not found, gone, server error, no such site) fail the run. Sites that refuse automated
// visitors (403, 429, 999) are listed separately as "could not verify": open those by hand.

import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TIMEOUT = 15000;
const CONCURRENCY = 6;

async function files(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await files(p)));
    else if (p.endsWith('.md')) out.push(p);
  }
  return out;
}

const found = new Map(); // url -> [files]
const add = (url, file) => {
  url = url.replace(/[.,;]+$/, '');
  // Drop a closing bracket only when the link has no opening one (so Wikipedia's "Kwan_(martial_arts)" stays whole).
  while (url.endsWith(')') && (url.match(/\(/g) || []).length < (url.match(/\)/g) || []).length) url = url.slice(0, -1);
  if (!found.has(url)) found.set(url, new Set());
  found.get(url).add(file);
};
for (const f of await files(path.join(root, 'content'))) {
  const rel = path.relative(root, f);
  const text = await readFile(f, 'utf8');
  for (const m of text.matchAll(/https?:\/\/[^\s)\]>"']+/g)) add(m[0], rel);
}
for (const u of (process.env.LINKCHECK_EXTRA || '').split(',').filter(Boolean)) add(u, '(extra)');

async function check(url) {
  const attempt = async (method) => {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), TIMEOUT);
    try {
      return await fetch(url, { method, redirect: 'follow', signal: ctl.signal, headers: { 'user-agent': 'tkd.wiki link checker (+https://tkd.wiki)' } });
    } finally {
      clearTimeout(timer);
    }
  };
  try {
    let r = await attempt('HEAD');
    if (r.status >= 400) r = await attempt('GET'); // some servers refuse HEAD requests
    return { status: r.status };
  } catch (e) {
    return { error: e.cause?.code || e.name || 'error' };
  }
}

const urls = [...found.keys()];
const results = new Map();
let next = 0;
await Promise.all(
  Array.from({ length: CONCURRENCY }, async () => {
    while (next < urls.length) {
      const u = urls[next++];
      results.set(u, await check(u));
    }
  }),
);

const broken = [];
const unverified = [];
for (const [u, r] of results) {
  if (r.error) broken.push([u, r.error]);
  else if (r.status >= 400) (r.status === 403 || r.status === 429 || r.status === 999 ? unverified : broken).push([u, r.status]);
}
const where = (u) => [...found.get(u)].join(', ');
console.log(`Checked ${urls.length} outside links.`);
if (unverified.length) {
  console.log(`\nCould not verify (the site refuses automated visitors; open by hand): ${unverified.length}`);
  for (const [u, s] of unverified) console.log(`  ${s}  ${u}\n       in ${where(u)}`);
}
if (broken.length) {
  console.log(`\nBroken: ${broken.length}`);
  for (const [u, s] of broken) console.log(`  ${s}  ${u}\n       in ${where(u)}`);
  process.exitCode = 1;
} else {
  console.log('No broken links.');
}
