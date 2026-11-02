// HTML templates. Each function returns a string. Nothing here reads files or the network.

import { site, nav, collections, statuses, countryNames, regionNames, articleCategories } from '../site.config.mjs';
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
  const statusNote = (page.fm && page.fm.statusNote) || st.note;
  const banner =
    page.status !== 'reviewed' && statusNote
      ? `<aside class="notice" aria-label="Review status"><p><strong>${esc(st.label)}.</strong> ${esc(statusNote)} <a href="/editorial-policy/">How we review</a>.</p></aside>`
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

const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// Schools directory: country > region (state/province) > city, with a jump menu.
function schoolsDirectory(sorted, list, ctx) {
  const tree = new Map();
  for (const p of sorted) {
    const fm = p.fm || {};
    const cc = fm.country || '';
    const rc = fm.region || '';
    const city = fm.city || 'Other';
    if (!tree.has(cc)) tree.set(cc, new Map());
    const regions = tree.get(cc);
    if (!regions.has(rc)) regions.set(rc, new Map());
    const cities = regions.get(rc);
    if (!cities.has(city)) cities.set(city, []);
    cities.get(city).push(p);
  }
  const countryLabel = (cc) => countryNames[cc] || cc || 'Other';
  const regionLabel = (cc, rc) => (regionNames[cc] && regionNames[cc][rc]) || rc || 'Other';
  const count = (m) => [...m.values()].reduce((n, v) => n + (Array.isArray(v) ? v.length : count(v)), 0);
  const nav = [...tree.entries()]
    .sort((a, b) => countryLabel(a[0]).localeCompare(countryLabel(b[0])))
    .map(([cc, regions]) => {
      const rs = [...regions.entries()]
        .sort((a, b) => regionLabel(cc, a[0]).localeCompare(regionLabel(cc, b[0])))
        .map(([rc, cities]) => {
          const cs = [...cities.keys()].sort().map((c) => `<a href="#${slug(`${cc}-${rc}-${c}`)}">${esc(c)}</a> (${cities.get(c).length})`).join(', ');
          return `<li><a href="#${slug(`${cc}-${rc}`)}"><strong>${esc(regionLabel(cc, rc))}</strong></a> (${count(cities)}): ${cs}</li>`;
        })
        .join('');
      return `<li><a href="#${slug(cc)}"><strong>${esc(countryLabel(cc))}</strong></a> (${count(regions)})<ul>${rs}</ul></li>`;
    })
    .join('');
  const jump = `<nav class="toc" aria-label="Browse schools by place"><h2 class="toc-title">Browse by place</h2><ul>${nav}</ul></nav>`;
  const sections = [...tree.entries()]
    .sort((a, b) => countryLabel(a[0]).localeCompare(countryLabel(b[0])))
    .map(([cc, regions]) => {
      const rs = [...regions.entries()]
        .sort((a, b) => regionLabel(cc, a[0]).localeCompare(regionLabel(cc, b[0])))
        .map(([rc, cities]) => {
          const cs = [...cities.entries()]
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([c, items]) => `<h4 class="index-city" id="${slug(`${cc}-${rc}-${c}`)}">${esc(c)} <span class="muted">(${items.length})</span></h4>\n${list(items)}`)
            .join('\n');
          return `<h3 class="index-region" id="${slug(`${cc}-${rc}`)}">${esc(regionLabel(cc, rc))}</h3>\n${cs}`;
        })
        .join('\n');
      return `<h2 class="index-group" id="${slug(cc)}">${esc(countryLabel(cc))}</h2>\n${rs}`;
    })
    .join('\n');
  const guides = ((ctx && ctx.pages) || []).filter((p) => p.fm && p.fm.category === 'Directories');
  const guideLinks = guides.length
    ? `<p class="note">Area guides with side-by-side tables: ${guides.map((g) => `<a href="${g.path}">${esc(g.title)}</a>`).join(' · ')}</p>`
    : '';
  return `${jump}\n${guideLinks}\n${sections}`;
}

export function indexPage(ctx, key, items) {
  const col = collections[key];
  const sorted = [...items].sort((a, b) => (a.order || 0) - (b.order || 0) || a.title.localeCompare(b.title));
  const card = (p) =>
    `<li><a class="card-link" href="${p.path}">${esc(p.title)}</a>${p.meta ? ` <span class="meta">${esc(p.meta)}</span>` : ''}<span class="card-summary">${esc(p.summary)}</span></li>`;
  // People: founders get their own group. Schools: grouped by city.
  let groups = null;
  if (key === 'people') {
    const isFounder = (p) => p.fm && p.fm.role === 'original-founder';
    groups = [
      ['Original founders of Taekwondo', sorted.filter(isFounder)],
      ['School founders and teachers', sorted.filter((p) => !isFounder(p))],
    ];
  } else if (key === 'articles') {
    groups = articleCategories.map((c) => [c, sorted.filter((p) => p.fm && p.fm.category === c)]);
  }
  const list = (items) => `<ul class="card-list">\n${items.map(card).join('\n')}\n</ul>`;
  const lis = key === 'schools' ? schoolsDirectory(sorted, list, ctx) : groups
    ? groups
        .filter(([, items]) => items.length)
        .map(([name, items]) => `<h2 class="index-group">${esc(name)}</h2>\n${list(items)}`)
        .join('\n')
    : list(sorted);
  const body = `${breadcrumb([{ name: 'Home', path: '/' }, { name: col.plural, path: `${col.base}/` }])}
<header class="entry-header">
  <p class="kicker">Index</p>
  <h1>${esc(col.plural)}</h1>
  <p class="lede">${esc(col.intro)}</p>
</header>
${lis}`;
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
  const byKey = (k) => pages.filter((p) => p.key === k);
  const recent = [...pages]
    .filter((p) => p.key !== 'pages')
    .sort((a, b) => b.updated.localeCompare(a.updated) || a.title.localeCompare(b.title))
    .slice(0, 6);
  const sorted = (list) => [...list].sort((a, b) => a.title.localeCompare(b.title));
  const card = (p, extra = '') =>
    `<li><a class="card-link" href="${p.path}">${esc(p.title)}</a>${extra}<span class="card-summary">${esc(p.summary)}</span></li>`;

  // Schools by place, with counts.
  const schools = byKey('schools');
  const places = new Map();
  for (const s of schools) {
    const fm = s.fm || {};
    const id = `${fm.country}-${fm.region}-${fm.city}`;
    if (!places.has(id)) places.set(id, { city: fm.city, region: (regionNames[fm.country] || {})[fm.region] || fm.region, n: 0, id });
    places.get(id).n += 1;
  }
  const placeList = [...places.values()].sort((a, b) => b.n - a.n || a.city.localeCompare(b.city));
  const cityCount = places.size;

  // How much of the site has been through full review.
  const content = pages.filter((p) => p.key !== 'pages');
  const reviewed = content.filter((p) => p.status === 'reviewed').length;

  const library = [
    ['articles', `${byKey('articles').length} articles`],
    ['people', `${byKey('people').length} people`],
    ['kwans', `${byKey('kwans').length} kwans`],
    ['organizations', `${byKey('organizations').length} organizations`],
    ['schools', `${schools.length} schools in ${cityCount} ${cityCount === 1 ? 'city' : 'cities'}`],
  ];

  const body = `<section class="hero" aria-labelledby="hero-title">
  <h1 id="hero-title">${esc(site.tagline)}</h1>
  <p class="lede">${esc(site.description)}</p>
  <p class="hero-actions"><a class="button" href="/wiki/taekwondo/">Start learning</a> <a class="button button--quiet" href="/schools/">Find a school</a></p>
</section>
${
  featured.length
    ? `<section aria-labelledby="start-title"><h2 id="start-title">Start here</h2><p class="muted section-note">A reading path, in order: what Taekwondo is, where it came from, who governs it, then training and competition.</p><ol class="card-list card-list--grid path">${featured
        .map((p) => card(p))
        .join('')}</ol></section>`
    : ''
}
<section aria-labelledby="kwan-title"><h2 id="kwan-title">The original kwans</h2><p class="muted section-note">Modern Taekwondo grew out of these Korean schools. Their founding dates are disputed, so they are listed alphabetically.</p><ul class="chip-list">${sorted(byKey('kwans'))
    .map((p) => `<li><a href="${p.path}">${esc(p.title)}</a></li>`)
    .join('')}</ul><p class="muted section-note"><a href="/kwans/">About the kwans</a> &middot; <a href="/people/">Their founders</a> &middot; <a href="/organizations/">Organizations today</a></p></section>
<section aria-labelledby="browse-title"><h2 id="browse-title">Browse the library</h2><ul class="card-list card-list--grid">${library
    .map(([k, label]) => `<li><a class="card-link" href="${collections[k].base}/">${esc(collections[k].plural)}</a> <span class="meta">${esc(label)}</span><span class="card-summary">${esc(collections[k].intro)}</span></li>`)
    .join('')}</ul></section>
${
  placeList.length
    ? `<section aria-labelledby="places-title"><h2 id="places-title">Find a school</h2><p class="muted section-note">The directory is free to browse and grows by place. Each entry cites the school's own website where we could reach it.</p><ul class="chip-list">${placeList
        .map((c) => `<li><a href="/schools/#${slug(c.id)}">${esc(c.city)}${c.region ? `, ${esc(c.region)}` : ''} <span class="muted">(${c.n})</span></a></li>`)
        .join('')}</ul><p class="muted section-note"><a href="/schools/">All schools by place</a></p></section>`
    : ''
}
<section aria-labelledby="recent-title"><h2 id="recent-title">Recently updated</h2><ul class="plain-list">${recent
    .map((p) => `<li><a href="${p.path}">${esc(p.title)}</a> <span class="muted">${esc(p.col.label)} &middot; <time datetime="${p.updated}">${esc(formatDate(p.updated))}</time></span></li>`)
    .join('')}</ul></section>
<section class="notice" aria-labelledby="stage-title"><h2 id="stage-title">How far to trust a page</h2><p>Every page shows its sources and a review status. ${reviewed ? `${reviewed} of ${content.length} pages are marked Reviewed; the rest are` : 'All pages are currently'} Provisional, which means ${reviewed ? 'they have' : 'they have not'} ${reviewed ? 'not ' : ''}had a full primary-source review. Pages move to Reviewed as their facts are confirmed. ${esc(site.name)} is curated by the editors, and core access is free and will stay free. <a href="/editorial-policy/">How we handle facts</a> &middot; <a href="/about/">About the project</a></p></section>`;
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
      if (fm.phone) main.telephone = fm.phone;
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
