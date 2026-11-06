// Builds the whole site into ./dist.   Run:  npm run build
//
// Steps: read content -> check it -> render pages -> write files -> check the output.
// Any problem in the content (broken link, missing field...) stops the build with a clear message.

import { mkdir, rm, writeFile, readFile, readdir, copyFile, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { collections, site, featured } from '../src/site.config.mjs';
import { loadContent } from '../src/lib/content.mjs';
import { renderMarkdown, inline } from '../src/lib/markdown.mjs';
import { autoFacts } from '../src/lib/facts.mjs';
import { entryPage, indexPage, homePage, searchPage, notFoundPage, placePage, lineagePage, sitemapXml } from '../src/lib/templates.mjs';
import { buildPlaces, finderIndex } from '../src/lib/places.mjs';
import { lintText } from '../src/lib/lint.mjs';
import { buildLineage, lineageBlock } from '../src/lib/lineage.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const errors = [];
const warnings = [];

async function main() {
  const started = Date.now();
  const pages = await loadContent(root, errors);

  // ---- 1. lookup table for [[wiki links]] -------------------------------------------------
  const lookup = new Map();
  const claim = (key, page) => {
    const k = key.toLowerCase();
    if (lookup.has(k) && lookup.get(k) !== page) {
      errors.push(`${page.file}: the name "${key}" is already used by ${lookup.get(k).file}`);
    }
    lookup.set(k, page);
  };
  for (const p of pages) {
    claim(`${p.col.dir}/${p.slug}`, p);
    claim(p.title, p);
    p.aliases.forEach((a) => claim(a, p));
  }

  // ---- 2. render every page ---------------------------------------------------------------
  const reserved = ['see-also', 'sources', 'what-links-here', 'toc-title', 'infobox-title', 'lineage-title'];
  const L = buildLineage(pages, (t) => lookup.get(t.toLowerCase()) || null, errors);
  for (const page of pages) {
    const out = new Set();
    const ctx = {
      resolve: (t) => lookup.get(t.toLowerCase()) || null,
      linked: (hit) => hit !== page && out.add(hit),
      sourceCount: page.sources.length,
      error: (m) => errors.push(`${page.file}: ${m}`),
    };
    const { html, headings } = renderMarkdown(page.body, ctx, reserved);
    const infobox = page.infobox
      .map((raw) => {
        const i = raw.indexOf(': ');
        if (i === -1) {
          errors.push(`${page.file}: infobox line needs "Label: value" (got "${raw}")`);
          return null;
        }
        return { label: raw.slice(0, i), html: inline(raw.slice(i + 2), ctx) };
      })
      .filter(Boolean);
    const related = page.related
      .map((t) => {
        const hit = ctx.resolve(t);
        if (!hit) errors.push(`${page.file}: unknown related page "${t}"`);
        else out.add(hit);
        return hit;
      })
      .filter(Boolean);
    // Editorial checks: repeated section headings, and the writing rules in src/lib/lint.mjs.
    const seen = new Set();
    for (const h of headings) {
      const k = `${h.level}:${h.text.toLowerCase()}`;
      if (seen.has(k)) errors.push(`${page.file}: the section "${h.text}" appears twice; merge the two`);
      seen.add(k);
    }
    const prose = [page.title, page.summary, page.fm.statusNote || '', page.infobox.join('\n'), page.body].join('\n');
    for (const hit of lintText(prose)) {
      (hit.level === 'error' ? errors : warnings).push(`${page.file}: "${hit.snippet}": ${hit.message}`);
    }
    // A page that mentions a kwan should link to it at least once, so readers can always click through.
    for (const k of pages.filter((p) => p.key === 'kwans' && p !== page)) {
      const bare = page.body
        .split('\n')
        .filter((l) => !l.startsWith('#'))
        .map((l) => l.replace(/\[\[[^\]]*\]\]/g, '').replace(/\]\([^)]*\)/g, ''))
        .some((l) => new RegExp(`(?<!Do )\\b${k.title}\\b`).test(l));
      if (bare && !page.body.includes(`[[${k.title}`)) warnings.push(`${page.file}: "${k.title}" is mentioned without a link`);
    }
    page.r = { html, headings, infobox: [...autoFacts(page), ...infobox], related, backlinks: [], lineage: lineageBlock(page, L) };
    page.out = out;
  }
  for (const p of pages) for (const target of p.out) target.r.backlinks.push(p);
  for (const p of pages) {
    p.r.backlinks.sort((a, b) => a.title.localeCompare(b.title));
    if (p.key !== 'pages' && p.r.backlinks.length === 0) {
      warnings.push(`${p.file}: no other page links here yet (only the index lists it)`);
    }
  }

  if (errors.length) return finish(errors, warnings);

  // ---- 3. write the output ----------------------------------------------------------------
  await rm(dist, { recursive: true, force: true });
  await mkdir(path.join(dist, 'assets'), { recursive: true });

  // Stylesheet: every file in src/styles/, joined in name order. Scripts: every file in src/scripts/.
  // Each output file gets a content hash in its name so browsers cache it until it changes.
  const hash = (b) => createHash('sha256').update(b).digest('hex').slice(0, 10);
  const styleDir = path.join(root, 'src/styles');
  const cssParts = [];
  for (const f of (await readdir(styleDir)).filter((n) => n.endsWith('.css')).sort()) {
    cssParts.push(await readFile(path.join(styleDir, f), 'utf8'));
  }
  const css = Buffer.from(cssParts.join('\n'));
  const assets = { css: `main.${hash(css)}.css` };
  await writeFile(path.join(dist, 'assets', assets.css), css);
  const scriptDir = path.join(root, 'src/scripts');
  for (const f of (await readdir(scriptDir)).filter((n) => n.endsWith('.js')).sort()) {
    const body = await readFile(path.join(scriptDir, f));
    const name = f.slice(0, -3);
    assets[name] = `${name}.${hash(body)}.js`;
    await writeFile(path.join(dist, 'assets', assets[name]), body);
  }

  const ctx = { assets, year: new Date().getFullYear(), pages };
  const put = async (urlPath, html) => {
    const target = urlPath.endsWith('/') ? path.join(dist, urlPath, 'index.html') : path.join(dist, urlPath);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, html);
  };

  const featuredPages = featured.map((k) => lookup.get(k.toLowerCase())).filter(Boolean);
  await put('/', homePage(ctx, { pages, featured: featuredPages }));
  await put('/search/', searchPage(ctx));
  await put('/lineage/', lineagePage(ctx, L));
  await put('/404.html', notFoundPage(ctx));

  const indexes = [{ path: '/lineage/', lastmod: pages.map((i) => i.updated).sort().at(-1) }];
  for (const key of Object.keys(collections)) {
    if (key === 'pages') continue;
    const items = pages.filter((p) => p.key === key);
    await put(`${collections[key].base}/`, indexPage(ctx, key, items));
    indexes.push({ path: `${collections[key].base}/`, lastmod: items.map((i) => i.updated).sort().at(-1) || '2026-01-01' });
  }
  for (const p of pages) await put(p.path, entryPage(ctx, p, p.r));

  // Generated place pages: /schools/us/, /schools/us/ca/, /schools/us/ca/irvine/
  const schoolPages = pages.filter((p) => p.key === 'schools');
  const places = buildPlaces(schoolPages);
  const taken = new Set(pages.map((p) => p.path));
  for (const node of places.all) {
    if (taken.has(node.path)) errors.push(`place page ${node.path} clashes with a page of the same address; rename that page`);
    await put(node.path, placePage(ctx, node));
    indexes.push({ path: node.path, lastmod: node.schools.map((s) => s.updated).sort().at(-1) });
  }
  await put('/schools-index.json', JSON.stringify(finderIndex(schoolPages)));

  // Redirects for renamed pages: list the old address in the page's `redirectFrom` field.
  const redirects = [];
  for (const p of pages) {
    for (const from of p.redirectFrom) {
      if (!from.startsWith('/')) errors.push(`${p.file}: redirectFrom "${from}" must start with /`);
      else if (taken.has(from)) errors.push(`${p.file}: redirectFrom "${from}" is the address of a live page`);
      else redirects.push(`${from} ${p.path} 301`);
    }
  }
  if (redirects.length) await writeFile(path.join(dist, '_redirects'), `${redirects.join('\n')}\n`);

  const latest = pages.map((p) => p.updated).sort().at(-1);
  await put('/sitemap.xml', sitemapXml(pages, { latest, indexes }));
  await put(
    '/search-index.json',
    JSON.stringify(pages.map((p) => ({ t: p.title, u: p.path, s: p.summary, k: p.col.label, a: p.aliases }))),
  );

  // Static files copied as they are (robots.txt, favicon.svg, _headers).
  for (const f of await readdir(path.join(root, 'public'))) {
    await copyFile(path.join(root, 'public', f), path.join(dist, f));
  }

  // ---- 4. check the finished site ---------------------------------------------------------
  await verifyOutput(pages);
  finish(errors, warnings, `${pages.length} content pages, ${Date.now() - started} ms`);
}

// Walks dist/ and checks links, anchors, headings and descriptions of every HTML page.
async function verifyOutput(pages) {
  const files = await walk(dist);
  const htmlFiles = files.filter((f) => f.endsWith('.html'));
  const cache = new Map();
  const read = async (f) => cache.get(f) ?? cache.set(f, await readFile(f, 'utf8')).get(f);
  const descriptions = new Map();

  for (const f of htmlFiles) {
    const rel = path.relative(dist, f);
    const html = await read(f);

    const h1 = (html.match(/<h1[\s>]/g) || []).length;
    if (h1 !== 1) errors.push(`${rel}: expected exactly one <h1>, found ${h1}`);

    let prev = 0;
    for (const m of html.matchAll(/<h([1-6])[\s>]/g)) {
      const lvl = Number(m[1]);
      if (prev && lvl > prev + 1) errors.push(`${rel}: heading jumps from h${prev} to h${lvl}`);
      prev = lvl;
    }

    const title = html.match(/<title>([^<]*)<\/title>/)?.[1] || '';
    if (title.length > 70) warnings.push(`${rel}: title is ${title.length} characters (aim for 60 or fewer)`);

    const desc = html.match(/<meta name="description" content="([^"]*)"/)?.[1];
    if (!desc) errors.push(`${rel}: missing meta description`);
    else if (!rel.startsWith('search') && rel !== '404.html') {
      if (descriptions.has(desc)) errors.push(`${rel}: same description as ${descriptions.get(desc)}`);
      descriptions.set(desc, rel);
    }

    for (const m of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      const url = m[1];
      if (!url.startsWith('/') || url.startsWith('//')) continue;
      const [p, frag] = url.split('#');
      const target = p.endsWith('/') ? path.join(dist, p, 'index.html') : path.join(dist, p);
      let ok = true;
      try {
        await stat(target);
      } catch {
        ok = false;
      }
      if (!ok) {
        errors.push(`${rel}: broken link ${url}`);
        continue;
      }
      if (frag && target.endsWith('.html')) {
        const th = await read(target);
        if (!th.includes(`id="${frag}"`)) errors.push(`${rel}: link ${url} points to a missing section`);
      }
    }
  }
}

async function walk(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else out.push(p);
  }
  return out;
}

function finish(errs, warns, summary = '') {
  for (const w of warns) console.warn(`  warning: ${w}`);
  if (errs.length) {
    console.error(`\nBuild stopped: ${errs.length} problem${errs.length === 1 ? '' : 's'} to fix\n`);
    for (const e of errs) console.error(`  x ${e}`);
    process.exitCode = 1;
    return;
  }
  console.log(`\nBuilt ${site.name}: ${summary}${warns.length ? `, ${warns.length} warning(s)` : ''}`);
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
