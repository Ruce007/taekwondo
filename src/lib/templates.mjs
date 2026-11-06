// HTML templates. Each function returns a string. Nothing here reads files or the network.

import { site, nav, collections, statuses, countryNames, regionNames, ads } from '../site.config.mjs';
import { card, cardList, chipList, groupPages, notice, infobox as infoboxHtml, hasToc, tocBar, tocSide, adSlot, fundingNote } from './components.mjs';
import { esc, jsonLd, formatDate } from './util.mjs';
import { buildPlaces, countryLabel, regionLabel } from './places.mjs';
import { lineageTree } from './lineage.mjs';

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
<meta property="og:image" content="${site.url}/og-default.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(site.name)}: ${esc(site.tagline)}">
<meta name="twitter:card" content="summary_large_image">
<script src="/assets/${ctx.assets.theme}"></script>
<link rel="stylesheet" href="/assets/${ctx.assets.css}">
${ld}
</head>
<body id="top">
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
    <div class="theme-switch" role="group" aria-label="Colour theme">
      <button type="button" data-theme-choice="light" aria-pressed="false" aria-label="Light theme" title="Light"><svg class="ico" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg><span class="lbl">Light</span></button>
      <button type="button" data-theme-choice="dark" aria-pressed="false" aria-label="Dark theme" title="Dark"><svg class="ico" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg><span class="lbl">Dark</span></button>
      <button type="button" data-theme-choice="system" aria-pressed="true" aria-label="Match device theme" title="Match device"><svg class="ico" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false"><rect x="3" y="4" width="18" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 20h8M12 16v4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg><span class="lbl">System</span></button>
    </div>
    <button type="button" class="menu-toggle" aria-expanded="false" aria-controls="site-nav"><svg class="ico" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false"><path class="bars" d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><path class="close" d="M6 6l12 12M6 18L18 6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg><span class="visually-hidden">Menu</span></button>
  </div>
  <nav class="main-nav" id="site-nav" aria-label="Main">
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
  <div class="wrap footer-base">${fundingNote()}<p>&copy; ${ctx.year} ${esc(site.publisher)}. Core access is free.</p></div>
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

export function entryPage(ctx, page, r) {
  const st = statuses[page.status];
  const statusNote = (page.fm && page.fm.statusNote) || st.note;
  const isPage = page.key === 'pages';
  const banner =
    !isPage && page.status !== 'reviewed' && statusNote
      ? notice(st.label, statusNote, '<a href="/editorial-policy/">How we review</a>.')
      : '';
  const facts = infoboxHtml(r.infobox);
  const toc = hasToc(r.headings);
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
  const kicker = isPage ? '' : `<p class="kicker">${esc(page.col.label)}${page.fm.category ? ` · ${esc(page.fm.category)}` : ''}</p>`;
  // Optional second ad unit inside long articles, placed before the Nth section heading.
  let prose = r.html;
  const inline = adSlot('article');
  if (inline) {
    const at = collections.articles && prose.split('<h2 ').length > 4 ? nthIndex(prose, '<h2 ', adsAfter()) : -1;
    if (at > 0) prose = `${prose.slice(0, at)}${inline}${prose.slice(at)}`;
  }
  const railAd = adSlot('rail');
  const rail = facts || railAd ? `<aside class="rail${railAd ? ' rail--ad' : ''}" aria-label="Page facts"><div class="rail-stack">${facts}${railAd}</div></aside>` : '';
  const body = `${breadcrumb(crumbsFor(page))}
<article class="entry${toc ? ' has-toc' : ''}${rail ? ' has-rail' : ''}">
  <div class="entry-head">
  <header class="entry-header">
    ${kicker}
    <h1>${esc(page.title)}</h1>
    <p class="lede">${esc(page.summary)}</p>
  </header>
  ${banner}
  ${toc ? '<button type="button" class="toc-show" hidden>Show contents</button>' : ''}
  </div>
  ${toc ? tocSide(r.headings) : ''}
  ${rail}
  ${toc ? tocBar(r.headings) : ''}
  <div class="entry-main">
  <div class="prose">
${prose}
  </div>
  ${r.lineage || ''}
  ${related}
  ${sources}
  ${back}
  <footer class="entry-footer">
    <p>Last reviewed <time datetime="${page.updated}">${esc(formatDate(page.updated))}</time>${isPage ? '' : ` &middot; Status: ${esc(st.label)}`} &middot; <a href="/editorial-policy/">Editorial policy</a></p>
  </footer>
  </div>
</article>
<script src="/assets/${ctx.assets.toc}" defer></script>`;
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

function adsAfter() {
  return (ads.slots.article && ads.slots.article.afterSection) || 3;
}
// Index of the nth occurrence (1-based) of `needle`, or -1.
function nthIndex(str, needle, n) {
  let at = -1;
  for (let i = 0; i < n; i++) {
    at = str.indexOf(needle, at + 1);
    if (at === -1) return -1;
  }
  return at;
}

const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// The school finder form. On /schools/ a script filters as you type; elsewhere it opens /schools/?q=...
export function finderForm(id = 'finder-q', hideLabel = false) {
  return `<form class="finder" role="search" action="/schools/" method="get">
  <label class="finder-label${hideLabel ? ' visually-hidden' : ''}" for="${id}">Find a school</label>
  <div class="finder-row">
    <input id="${id}" name="q" type="search" placeholder="City, state, ZIP or school name" autocomplete="off" enterkeyhint="search">
    <button type="submit">Search</button>
  </div>
</form>`;
}

const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
const CITY_PREVIEW = 12;

// Schools directory: a finder, then every place as a link to its own page.
function schoolsDirectory(sorted, ctx) {
  const { countries } = buildPlaces(sorted);
  const browse = countries
    .map((co) => {
      const regions = co.regionList
        .map((r) => {
          const shown = r.cityList.slice(0, CITY_PREVIEW);
          const more = r.cityList.length - shown.length;
          const chips = shown.map((c) => `<li><a href="${c.path}">${esc(c.name)} <span class="muted">(${c.schools.length})</span></a></li>`).join('');
          return `<div class="place-block"><h3 class="index-region"><a href="${r.path}">${esc(r.name)}</a> <span class="muted">(${r.schools.length})</span></h3><ul class="chip-list">${chips}${more > 0 ? `<li><a href="${r.path}">All ${r.cityList.length} cities</a></li>` : ''}</ul></div>`;
        })
        .join('');
      return `<h2 class="index-group"><a href="${co.path}">${esc(co.name)}</a> <span class="muted">(${co.schools.length})</span></h2>${regions}`;
    })
    .join('');
  const guides = ((ctx && ctx.pages) || []).filter((p) => p.fm && p.fm.category === 'Directories');
  const guideLinks = guides.length
    ? `<p class="note">Area guides with side-by-side tables: ${guides.map((g) => `<a href="${g.path}">${esc(g.title)}</a>`).join(' · ')}</p>`
    : '';
  return `${finderForm('finder-q')}
<div id="finder-status" class="finder-status muted" role="status" aria-live="polite"></div>
<ul id="finder-results" class="card-list finder-results"></ul>
<noscript><p class="muted">Searching needs JavaScript. Browse by place below instead.</p></noscript>
<div id="finder-browse">
<h2 class="visually-hidden">Browse by place</h2>
${browse}
${guideLinks}
</div>
<script src="/assets/${ctx.assets.schools}" defer></script>`;
}

// One generated page per country, region and city.
export function placePage(ctx, node) {
  const crumbs = [{ name: 'Home', path: '/' }, { name: 'Schools', path: '/schools/' }];
  if (node.kind !== 'country') crumbs.push({ name: node.country.name, path: node.country.path });
  if (node.kind === 'city') crumbs.push({ name: node.region.name, path: node.region.path });
  crumbs.push({ name: node.name, path: node.path });

  const n = node.schools.length;
  const schoolWord = plural(n, 'school', 'schools');
  let title, lede, description, content, kicker;
  if (node.kind === 'city') {
    const where = `${node.name}, ${node.region.name}`;
    title = `Taekwondo schools in ${where}`;
    kicker = 'Schools · City';
    lede = `${schoolWord} listed in ${where}, with address, phone number and website for each.`;
    const names = node.schools.slice(0, 3).map((p) => p.title).join(', ');
    description = `Taekwondo schools in ${where}: address, phone and website for ${schoolWord} including ${names}.`;
    const guides = ctx.pages.filter((p) => p.fm && p.fm.category === 'Directories' && p.title.toLowerCase().includes(node.name.toLowerCase()));
    const guideLinks = guides.length ? `<p class="note">Side-by-side comparison: ${guides.map((g) => `<a href="${g.path}">${esc(g.title)}</a>`).join(' · ')}</p>` : '';
    const others = node.region.cityList.filter((c) => c !== node);
    const nearby = others.length
      ? `<h2 class="index-group">Other cities in ${esc(node.region.name)}</h2>${chipList(others.map((c) => ({ href: c.path, html: `${esc(c.name)} <span class="muted">(${c.schools.length})</span>` })))}`
      : '';
    content = `${cardList([...node.schools].sort((a, b) => a.title.localeCompare(b.title)))}${guideLinks}${nearby}`;
  } else if (node.kind === 'region') {
    title = `Taekwondo schools in ${node.name}, ${node.country.name}`;
    kicker = 'Schools · Region';
    lede = `${schoolWord} in ${plural(node.cityList.length, 'city', 'cities')}.`;
    description = `Taekwondo schools in ${node.name}, ${node.country.name}: ${schoolWord} across ${plural(node.cityList.length, 'city', 'cities')}, including ${node.cityList.slice(0, 3).map((c) => c.name).join(', ')}.`;
    content = cardList(node.cityList.map((c) => ({ path: c.path, title: c.name, meta: plural(c.schools.length, 'school', 'schools'), summary: c.schools.map((p) => p.title).slice(0, 4).join(', ') + (c.schools.length > 4 ? ' and more' : '') })));
  } else {
    title = `Taekwondo schools in ${node.name}`;
    kicker = 'Schools · Country';
    lede = `${schoolWord} in ${plural(node.regionList.length, 'region', 'regions')}.`;
    description = `Taekwondo schools in ${node.name}: ${schoolWord} across ${plural(node.regionList.length, 'region', 'regions')}, including ${node.regionList.slice(0, 3).map((r) => r.name).join(', ')}.`;
    content = cardList(node.regionList.map((r) => ({ path: r.path, title: r.name, meta: plural(r.schools.length, 'school', 'schools'), summary: r.cityList.map((c) => c.name).slice(0, 6).join(', ') + (r.cityList.length > 6 ? ' and more' : '') })));
  }
  const body = `${breadcrumb(crumbs)}
<header class="entry-header">
  <p class="kicker">${esc(kicker)}</p>
  <h1>${esc(title)}</h1>
  <p class="lede">${esc(lede)}</p>
</header>
${finderForm('finder-q')}
${content}`;
  return layout(ctx, {
    title,
    description,
    path: node.path,
    section: 'schools',
    jsonld: [
      {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: `${title} | ${site.name}`,
        description,
        url: abs(node.path),
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: node.schools.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: abs(p.path), name: p.title })),
        },
      },
      breadcrumbLd(crumbs),
    ],
    body,
  });
}

export function indexPage(ctx, key, items) {
  const col = collections[key];
  const sorted = [...items].sort((a, b) => (a.order || 0) - (b.order || 0) || a.title.localeCompare(b.title));
  const groups = groupPages(col, sorted);
  const list = (items) => cardList(items);
  const lis = key === 'schools' ? schoolsDirectory(sorted, ctx) : groups
    ? groups.map(({ item, pages }) => `<h2 class="index-group">${esc(item.label)}</h2>\n${list(pages)}`).join('\n')
    : list(sorted);
  const body = `${breadcrumb([{ name: 'Home', path: '/' }, { name: col.plural, path: `${col.base}/` }])}
<header class="entry-header">
  <p class="kicker">Index</p>
  <h1>${esc(col.plural)}</h1>
  <p class="lede">${esc(col.intro)}</p>
  ${key === 'kwans' ? '<p class="note"><a href="/lineage/">See how the kwans connect: lineage chart</a></p>' : ''}
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
  // Schools by place, with counts.
  const schools = byKey('schools');
  const placeList = buildPlaces(schools)
    .all.filter((n) => n.kind === 'city')
    .map((c) => ({ city: c.name, region: c.region.name, n: c.schools.length, path: c.path }))
    .sort((x, y) => y.n - x.n || x.city.localeCompare(y.city));
  const cityCount = placeList.length;

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

  const kwanGroups = (groupPages(collections.kwans, sorted(byKey('kwans'))) || [])
    .map(({ item, pages }) => `<div class="chip-group"><p class="chip-label">${esc(item.short || item.label)}</p>${chipList(pages.map((p) => ({ href: p.path, html: esc(p.title) })))}</div>`)
    .join('');

  const body = `<section class="hero" aria-labelledby="hero-title">
  <h1 id="hero-title">${esc(site.tagline)}</h1>
  <p class="lede">${esc(site.description)}</p>
  <p class="hero-actions"><a class="button" href="/wiki/taekwondo/">Start learning</a> <a class="button button--quiet" href="/schools/">Find a school</a></p>
</section>
${
  featured.length
    ? `<section aria-labelledby="start-title"><h2 id="start-title">Start here</h2><p class="muted section-note">Read in this order: what Taekwondo is, where it came from, who governs it, then training and competition.</p><ol class="card-list card-list--grid">${featured
        .map((p) => card(p))
        .join('')}</ol></section>`
    : ''
}
<section aria-labelledby="kwan-title"><h2 id="kwan-title">The nine kwans</h2><p class="muted section-note">Modern Taekwondo grew out of these Korean schools: the original five of the mid-1940s and four later kwans of the 1950s.</p>${kwanGroups}<p class="muted section-note"><a href="/kwans/">About the kwans</a> &middot; <a href="/people/">Kwan founders</a> &middot; <a href="/organizations/">Organizations today</a></p></section>
<section aria-labelledby="browse-title"><h2 id="browse-title">Browse the library</h2><ul class="card-list card-list--grid">${library
    .map(([k, label]) => `<li><a class="card-link" href="${collections[k].base}/">${esc(collections[k].plural)}</a> <span class="meta">${esc(label)}</span><span class="card-summary">${esc(collections[k].intro)}</span></li>`)
    .join('')}</ul></section>
${
  placeList.length
    ? `<section aria-labelledby="places-title"><h2 id="places-title">Find a school</h2>${finderForm('home-finder', true)}<ul class="chip-list">${placeList
        .map((c) => `<li><a href="${c.path}">${esc(c.city)}${c.region ? `, ${esc(c.region)}` : ''} <span class="muted">(${c.n})</span></a></li>`)
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
<script src="/assets/${ctx.assets.search}" defer></script>`;
  return layout(ctx, {
    title: 'Search',
    description: `Search ${site.name} for Taekwondo history, people, kwans, organizations and schools.`,
    path: '/search/',
    noindex: true,
    body,
  });
}

export function lineagePage(ctx, L) {
  const body = `${breadcrumb([{ name: 'Home', path: '/' }, { name: 'Kwans', path: '/kwans/' }, { name: 'Lineage chart', path: '/lineage/' }])}
<header class="entry-header">
  <p class="kicker">Chart</p>
  <h1>Lineage of the kwans</h1>
  <p class="lede">Which kwans grew out of others, and the founders, students and schools connected to each.</p>
</header>
${lineageTree(L)}`;
  return layout(ctx, {
    title: 'Lineage of the kwans',
    description: 'A chart of how the Korean kwans connect: annexes, founders, students and the schools descended from each.',
    path: '/lineage/',
    section: 'kwans',
    jsonld: [breadcrumbLd([{ name: 'Home', path: '/' }, { name: 'Kwans', path: '/kwans/' }, { name: 'Lineage chart', path: '/lineage/' }])],
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
