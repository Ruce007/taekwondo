// Creates a new page with every required field filled in as a template.
//   npm run new -- school "Eagle Taekwondo"
//   npm run new -- person "Lee Won-kuk"      (also: kwan, organization, article)
// Replace each TODO, then run `npm run build`. The build refuses to publish a page that still has TODO in it.

import { writeFile, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { collections } from '../src/site.config.mjs';
import { slugify } from '../src/lib/util.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const kinds = { school: 'schools', person: 'people', kwan: 'kwans', organization: 'organizations', article: 'articles', page: 'pages' };
const [kind, ...rest] = process.argv.slice(2);
const name = rest.join(' ').trim();
if (!kinds[kind] || !name) {
  console.error(`Usage: npm run new -- <${Object.keys(kinds).join('|')}> "Page title"`);
  process.exit(1);
}
const key = kinds[kind];
const col = collections[key];
const slug = slugify(name);
const today = new Date().toISOString().slice(0, 10);
const file = path.join(root, 'content', col.dir, `${slug}.md`);

const extra = {
  schools: ['country: US', 'region: TODO (two-letter state code, for example CA)', 'city: TODO', 'street: TODO', 'postal: TODO', 'phone: +1-TODO', 'website: https://TODO/', 'founded: TODO', 'meta: TODO city, state · est. year'],
  people: ['role: TODO (kwan-founder, later-kwan-founder, or delete this line for teachers and school founders)', 'meta: TODO'],
  kwans: ['generation: TODO (original or later)', 'founders: TODO', 'meta: TODO'],
  organizations: ['meta: TODO'],
  articles: ['category: TODO (Fundamentals, History, Practice, Competition or Directories)'],
  pages: [],
}[key];

const text = `---
title: ${name}
summary: TODO one sentence of 40 to 160 characters saying what this page is
updated: ${today}
status: provisional
${extra.join('\n')}
sources:
  - TODO Source title | https://TODO/
---
TODO opening paragraph. Cite sources with [^1] and link other pages with [[Page Title]].

## TODO first section

TODO
`;

try {
  await access(file);
  console.error(`Not created: content/${col.dir}/${slug}.md already exists.`);
  process.exit(1);
} catch {}
await writeFile(file, text);
console.log(`Created content/${col.dir}/${slug}.md\nFill in every TODO, then run: npm run build`);
