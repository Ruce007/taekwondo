// Reads content/<collection>/*.md, validates the front matter, and returns page records.

import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { collections, countryNames, articleCategories, statuses } from '../site.config.mjs';
import { parseFrontmatter } from './frontmatter.mjs';
import { asArray } from './util.mjs';

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export async function loadContent(root, errors) {
  const pages = [];
  for (const [key, col] of Object.entries(collections)) {
    const dir = path.join(root, 'content', col.dir);
    let files = [];
    try {
      files = (await readdir(dir)).filter((f) => f.endsWith('.md')).sort();
    } catch {
      continue;
    }
    for (const f of files) {
      const slug = f.slice(0, -3);
      const file = `content/${col.dir}/${f}`;
      const fail = (m) => errors.push(`${file}: ${m}`);
      if (!SLUG.test(slug)) fail(`file name must be lowercase-with-dashes (got "${slug}")`);

      let parsed;
      try {
        parsed = parseFrontmatter(await readFile(path.join(dir, f), 'utf8'), file);
      } catch (e) {
        fail(e.message);
        continue;
      }
      const fm = parsed.data;

      for (const field of ['title', 'summary', 'updated']) {
        if (!fm[field]) fail(`missing required field "${field}"`);
      }
      if (fm.summary && (fm.summary.length < 40 || fm.summary.length > 160)) {
        fail(`"summary" is used as the search-engine description: keep it 40-160 characters (now ${fm.summary.length})`);
      }
      if (fm.updated && !DATE.test(fm.updated)) fail('"updated" must look like 2026-10-30');
      fm.status = fm.status || 'provisional';
      if (!statuses[fm.status]) fail(`unknown status "${fm.status}" (use: ${Object.keys(statuses).join(', ')})`);

      if (key === 'articles' && !articleCategories.includes(fm.category)) {
        fail(`"category" must be one of: ${articleCategories.join(', ')}`);
      }
      if (key === 'schools') {
        if (!countryNames[fm.country]) fail(`"country" must be one of: ${Object.keys(countryNames).join(', ')}`);
        if (!fm.city) fail('missing required field "city"');
      }

      const sources = asArray(fm.sources).map((raw) => {
        const i = raw.lastIndexOf(' | ');
        if (i === -1) return { text: raw, url: null };
        return { text: raw.slice(0, i).trim(), url: raw.slice(i + 3).trim() };
      });
      for (const s of sources) {
        if (s.url && !/^https:\/\//.test(s.url)) fail(`source URL must start with https:// ("${s.url}")`);
      }

      pages.push({
        key,
        col,
        slug,
        file,
        path: `${col.base}/${slug}/`,
        title: fm.title,
        summary: fm.summary,
        updated: fm.updated,
        status: fm.status,
        aliases: asArray(fm.aliases),
        related: asArray(fm.related),
        infobox: asArray(fm.infobox),
        meta: fm.meta || '',
        order: fm.order ? Number(fm.order) : 0,
        sources,
        fm,
        body: parsed.body,
      });
    }
  }
  return pages;
}
