// HTML templates. Each function returns a string. Nothing here reads files or the network.

import { site, nav, collections, statuses, countryNames } from '../site.config.mjs';
import { esc, jsonLd, formatDate } from './util.mjs';

const abs = (p) => `${site.url}${p}`;

// LOGO SLOT: this is a placeholder only. Replace the <svg> below with the real logo
// once the brand is designed. The text name next to it stays.
const logoSlot = `<svg class="logo-slot" viewBox="0 0 40 40" width="40" height="40" aria-hidden="true" focusable="false"><rect x="1.5" y="1.5" width="37" height="37" rx="6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="4 3"/><text x="20" y="24" text-anchor="middle" font-size="9" font-family="system-ui, sans-serif" fill="currentColor">LOGO</text></svg>`;

export function layout(ctx, o) {
  const fullTitle = o.home ? `${site.name}: ${site.tagline}` : `${o.title} | ${site.name}`;
  const url = abs(o.path);
  const robots = o.noindex ? 'noindex, follow' : 'index, follow';
  const ld = (o.jsonld || []).map((j) => `<script type="application/ld+json">${jsonLd(j)}</script>`).join('\n');
  const navHtml = nav
    .map((n) => {
      const current = o.section === n.collection;
      return `<li><a href="${n.href}"${current ? ' aria-current="true"' : ''}>${esc(n.label)}</a></li>`;
    })
    .join('');

  return `<!doctype html>
<html lang="${site.locale}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(o.description)}">
<meta name="robots" content="${robots}">
<link rel="canonical" href="${url}">
<meta name="theme-color" content="#12304f">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<meta property="og:site_name" content="${esc(site.name)}">
<meta property="og:type" content="${o.ogType || 'website'}">
<meta property="og:title" content="${esc(o.home ? fullTitle : o.title)}">
<meta property="og:description" content="${esc(o.description)}">
<meta property="og:url" content="${url}">
<meta name="twitter:card" content="summary">
<link rel="stylesheet" href="/assets/${ctx.assets.css}">
${ld}
</head>
<body>
<a class="skip-link" href="#main">Skip to content</a>
<header class="site-header">
  <div class="wrap header-row">
    <a class="brand" href="/">
      ${logoSlot}
      <span class="brand-name">${esc(site.name)}</span>
    </a>
    <form class="header-search" role="search" action="/search/" method="get">
      <label class="visually-hidden" for="site-search">Search ${esc(site.name)}</label>
      <input id="site-search" name="q" type="search" placeholder="Search the wiki" autocomplete="off">
      <button type="submit">Search</button>
    </form>
  </div>
  <nav class="main-nav" aria-label="Main">
    <ul class="wrap">${navHtml}</ul>
  </nav>
</header>
<main id="main" class="wrap">
${o.body}
</main>
<footer class="site-footer">
  <div class="wrap footer-grid">
    <div>
      <p class="footer-title">${esc(site.name)}</p>
      <p>${esc(site.tagline)}.</p>
      <p class="muted">${esc(site.stage)}.</p>
    </div>
    <nav aria-label="Browse">
      <p class="footer-title">Browse</p>
      <ul>${nav.map((n) => `<li><a href="${n.href}">${esc(n.label)}</a></li>`).join('')}</ul>
    </nav>
    <nav aria-label="About this site">
      <p class="footer-title">About this site</p>
      <ul>
        <li><a href="/editorial-policy/">Editorial policy</a></li>
        <li><a href="/about/">About</a></li>
        <li><a href="/sitemap.xml">Sitemap</a></li>
      </ul>
    </nav>
  </div>
  <div class="wrap footer-base"><p>&copy; ${ctx.year} ${esc(site.publisher)}. Core access is free.</p></div>
</footer>
</body>
</html>
`;
}

function breadcrumb(items) {
  const lis = items
    .map((it, i) =>
      i === items.length - 1
        ? `<li aria-current="page">${esc(it.name)}</li>`
        : `<li><a href="${it.path}">${esc(it.name)}</a></li>`,
    )
    .join('');
  return `<nav class="breadcrumb" aria-label="Breadcrumb"><ol>${lis}</ol></nav>`;
}

function crumbsFor(page) {
  const items = [{ name: 'Home', path: '/' }];
  if (page.key !== 'pages') items.push({ name: page.col.plural, path: `${page.col.base}/` });
  items.push({ name: page.title, path: page.path });
  return items;
}

function toc(headings) {
  if (headings.filter((h) => h.level === 2).length < 3) return '';
  // Group each ## heading with the ### headings that follow it.
  const groups = [];
  for (const h of headings) {
    if (h.level === 2) groups.push({ h, kids: [] });
    else if (h.level === 3 && groups.length) groups[groups.length - 1].kids.push(h);
  }
  const link = (h) => `<a href="#${h.id}">${esc(h.text)}</a>`;
  const items = groups
    .map((g) => `<li>${link(g.h)}${g.kids.length ? `<ol>${g.kids.map((k) => `<li>${link(k)}</li>`).join('')}</ol>` : ''}</li>`)
    .join('');
  return `<nav class="toc" aria-labelledby="toc-title"><h2 id="toc-title" class="toc-title">Contents</h2><ol>${items}</ol></nav>`;
}

export function entryPage(ctx, page, r) {
  const st = statuses[page.status];
  const banner =
    page.status !== 'reviewed' && st.note
      ? `<aside class="notice" aria-label="Review status"><p><strong>${esc(st.label)}.</strong> ${esc(st.note)} <a href="/editorial-policy/">How we review</a>.</p></aside>`
      : '';
  const infobox = r.infobox.length
    ? `<aside class="infobox" aria-labelledby="infobox-title"><h2 id="infobox-title">Quick facts</h2><dl>${r.infobox
        .map((row) => `<div><dt>${esc(row.label)}</dt><dd>${row.html}</dd></div>`)
        .join('')}</dl></aside>`
    : '';
  const related = r.related.length
    ? `<section class="related" aria-labelledby="see-also"><h2 id="see-also">See also</h2><ul>${r.related
        .map((p) => `<li><a href="${p.path}">${esc(p.title)}</a> <span class="muted">${esc(p.col.label)}</span></li>`)
        .join('')}</ul></section>`
    : '';
  const sources = page.sources.length
    ? `<section class="sources" aria-labelledby="sources"><h2 id="sources">Sources</h2><ol>${page.sources
        .map((s, i) => {
          const body = s.url ? `${esc(s.text)} <a href="${esc(s.url)}" rel="noopener noreferrer">${esc(hostOf(s.url))}</a>` : esc(s.text);
          return `<li id="source-${i + 1}">${body}</li>`;
        })
        .join('')}</ol><p class="muted">Online sources last checked ${esc(formatDate(page.updated))}.</p></section>`
    : '';
  const back = r.backlinks.length
    ? `<section class="backlinks" aria-labelledby="what-links-here"><h2 id="what-links-here">What links here</h2><ul>${r.backlinks
        .map((p) => `<li><a href="${p.path}">${esc(p.title)}</a></li>`)
        .join('')}</ul></section>`
    : '';
  const kicker = page.key === 'pages' ? '' : `<p class="kicker">${esc(page.col.label)}${page.fm.category ? ` · ${esc(page.fm.category)}` : ''}</p>`;
  const body = `${breadcrumb(crumbsFor(page))}
<article class="entry">
  <header class="entry-header">
    ${kicker}
    <h1>${esc(page.title)}</h1>
    <p class="lede">${esc(page.summary)}</p>
  </header>
  ${page.key === 'pages' ? '' : banner}
  <div class="entry-body">
    ${infobox}
    ${toc(r.headings)}
    <div class="prose">
${r.html}
    </div>
  </div>
  ${related}
  ${sources}
  ${back}
  <footer class="entry-footer">
    <p>Last reviewed <time datetime="${page.updated}">${esc(formatDate(page.updated))}</time>${page.key === 'pages' ? '' : ` &middot; Status: ${esc(st.label)}`} &middot; <a href="/editorial-policy/">Editorial policy</a></p>
  </footer>
</article>`;
  return layout(ctx, {
    title: page.title,
    description: page.summary,
    path: page.path,
    section: page.key,
    ogType: page.key === 'articles' ? 'article' : 'website',
    jsonld: structuredData(page),
    body,
  });
}

export function indexPage(ctx, key, items) {
  const col = collections[key];
  const sorted = [...items].sort((a, b) => (a.order || 0) - (b.order || 0) || a.title.localeCompare(b.title));
  const lis = sorted
    .map(
      (p) =>
        `<li><a class="card-link" href="${p.path}">${esc(p.title)}</a>${p.meta ? ` <span class="meta">${esc(p.meta)}</span>` : ''}<span class="card-summary">${esc(p.summary)}</span></li>`,
    )
    .join('\n');
  const body = `${breadcrumb([{ name: 'Home', path: '/' }, { name: col.plural, path: `${col.base}/` }])}
<header class="entry-header">
  <p class="kicker">Index</p>
  <h1>${esc(col.plural)}</h1>
  <p class="lede">${esc(col.intro)}</p>
</header>
<ul class="card-list">
${lis}
</ul>`;
  return layout(ctx, {
    title: col.plural,
    description: col.description,
    path: `${col.base}/`,
    section: key,
    jsonld: [
      {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: `${col.plural} | ${site.name}`,
        description: col.description,
        url: abs(`${col.base}/`),
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: sorted.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: abs(p.path), name: p.title })),
        },
      },
      breadcrumbLd([{ name: 'Home', path: '/' }, { name: col.plural, path: `${col.base}/` }]),
    ],
    body,
  });
}

export function homePage(ctx, { pages, featured }) {
  const counts = Object.entries(collections)
    .filter(([k]) => k !== 'pages')
    .map(([k, c]) => ({ k, c, n: pages.filter((p) => p.key === k).length }));
  const recent = [...pages]
    .filter((p) => p.key !== 'pages')
    .sort((a, b) => b.updated.localeCompare(a.updated) || a.title.localeCompare(b.title))
    .slice(0, 6);
  const body = `<section class="hero" aria-labelledby="hero-title">
  <h1 id="hero-title">${esc(site.tagline)}</h1>
  <p class="lede">${esc(site.description)}</p>
  <form class="hero-search" role="search" action="/search/" method="get">
    <label for="hero-q" class="visually-hidden">Search the wiki</label>
    <input id="hero-q" name="q" type="search" placeholder="Try &ldquo;Song Moo Kwan&rdquo; or &ldquo;Kukkiwon&rdquo;" autocomplete="off">
    <button type="submit">Search</button>
  </form>
</section>
${
  featured.length
    ? `<section aria-labelledby="start-title"><h2 id="start-title">Start here</h2><ul class="card-list card-list--grid">${featured
        .map((p) => `<li><a class="card-link" href="${p.path}">${esc(p.title)}</a><span class="card-summary">${esc(p.summary)}</span></li>`)
        .join('')}</ul></section>`
    : ''
}
<section aria-labelledby="browse-title"><h2 id="browse-title">Browse the library</h2><ul class="card-list card-list--grid">${counts
    .map(
      ({ k, c, n }) =>
        `<li><a class="card-link" href="${c.base}/">${esc(c.plural)}</a> <span class="meta">${n} ${n === 1 ? 'entry' : 'entries'}</span><span class="card-summary">${esc(c.intro)}</span></li>`,
    )
    .join('')}</ul></section>
<section aria-labelledby="recent-title"><h2 id="recent-title">Recently updated</h2><ul class="plain-list">${recent
    .map((p) => `<li><a href="${p.path}">${esc(p.title)}</a> <span class="muted">${esc(p.col.label)} &middot; <time datetime="${p.updated}">${esc(formatDate(p.updated))}</time></span></li>`)
    .join('')}</ul></section>
<section class="notice" aria-labelledby="stage-title"><h2 id="stage-title">An early, curated edition</h2><p>${esc(site.name)} is being rebuilt as a long-term Taekwondo knowledge base and school directory. For now every page is curated by the editors and cites its sources. Core access is free and will stay free. <a href="/about/">Read about the project</a> or <a href="/editorial-policy/">how we handle facts</a>.</p></section>`;
  return layout(ctx, {
    home: true,
    title: site.name,
    description: site.description,
    path: '/',
    jsonld: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: site.name,
        url: abs('/'),
        description: site.description,
        inLanguage: site.locale,
        publisher: { '@type': 'Organization', name: site.publisher, url: abs('/') },
        potentialAction: {
          '@type': 'SearchAction',
          target: { '@type': 'EntryPoint', urlTemplate: `${site.url}/search/?q={search_term_string}` },
          'query-input': 'required name=search_term_string',
        },
      },
    ],
    body,
  });
}

export function searchPage(ctx) {
  const body = `${breadcrumb([{ name: 'Home', path: '/' }, { name: 'Search', path: '/search/' }])}
<header class="entry-header"><h1>Search</h1></header>
<form class="hero-search" role="search" action="/search/" method="get">
  <label for="search-q" class="visually-hidden">Search the wiki</label>
  <input id="search-q" name="q" type="search" autocomplete="off">
  <button type="submit">Search</button>
</form>
<div id="search-status" class="muted" role="status" aria-live="polite"></div>
<ul id="search-results" class="card-list"></ul>
<noscript><p>Search needs JavaScript. Without it, browse the <a href="/wiki/">wiki</a>, <a href="/people/">people</a>, <a href="/kwans/">kwans</a>, <a href="/organizations/">organizations</a> or <a href="/schools/">schools</a>.</p></noscript>
<script src="/assets/${ctx.assets.js}" defer></script>`;
  return layout(ctx, {
    title: 'Search',
    description: `Search ${site.name} for Taekwondo history, people, kwans, organizations and schools.`,
    path: '/search/',
    noindex: true,
    body,
  });
}

export function notFoundPage(ctx) {
  const body = `<header class="entry-header"><h1>Page not found</h1><p class="lede">That address does not exist. It may have moved while the site was being rebuilt.</p></header>
<p>Try the <a href="/">home page</a>, the <a href="/wiki/">wiki index</a>, or <a href="/search/">search</a>.</p>`;
  return layout(ctx, {
    title: 'Page not found',
    description: 'The page you were looking for could not be found.',
    path: '/404.html',
    noindex: true,
    body,
  });
}

// ---------- structured data (schema.org JSON-LD) ----------

function hostOf(u) {
  try {
    return new URL(u).hostname.replace(/^www\./, '');
  } catch {
    return u;
  }
}

function breadcrumbLd(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: abs(it.path) })),
  };
}

function structuredData(page) {
  const fm = page.fm;
  const url = abs(page.path);
  const base = { '@context': 'https://schema.org', url, name: page.title, description: page.summary };
  let main;
  switch (page.col.type) {
    case 'article':
      main = {
        ...base,
        '@type': 'Article',
        headline: page.title,
        inLanguage: site.locale,
        dateModified: page.updated,
        mainEntityOfPage: url,
        author: { '@type': 'Organization', name: site.publisher },
        publisher: { '@type': 'Organization', name: site.name, url: abs('/') },
      };
      break;
    case 'person':
      main = { ...base, '@type': 'Person' };
      if (fm.born) main.birthDate = fm.born;
      if (fm.died) main.deathDate = fm.died;
      break;
    case 'organization':
      main = { ...base, '@type': 'Organization' };
      if (fm.founded) main.foundingDate = fm.founded;
      if (fm.founders) main.founder = [].concat(fm.founders).map((n) => ({ '@type': 'Person', name: n }));
      if (fm.website) main.sameAs = [fm.website];
      break;
    case 'school':
      main = {
        ...base,
        '@type': 'SportsActivityLocation',
        address: {
          '@type': 'PostalAddress',
          ...(fm.street ? { streetAddress: fm.street } : {}),
          addressLocality: fm.city,
          ...(fm.region ? { addressRegion: fm.region } : {}),
          ...(fm.postal ? { postalCode: fm.postal } : {}),
          addressCountry: fm.country,
        },
      };
      if (fm.founded) main.foundingDate = fm.founded;
      if (fm.website) main.sameAs = [fm.website];
      break;
    default:
      main = { ...base, '@type': 'WebPage', inLanguage: site.locale, dateModified: page.updated };
  }
  return [main, breadcrumbLd(crumbsFor(page))];
}

export function sitemapXml(pages, extra) {
  const urls = [
    { loc: abs('/'), lastmod: extra.latest },
    ...extra.indexes.map((i) => ({ loc: abs(i.path), lastmod: i.lastmod })),
    ...pages.map((p) => ({ loc: abs(p.path), lastmod: p.updated })),
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${esc(u.loc)}</loc><lastmod>${u.lastmod}</lastmod></url>`).join('\n')}
</urlset>
`;
}

export { countryNames };
