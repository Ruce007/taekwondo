// Reusable page pieces. Every page is assembled from these, so a change here changes the whole site.

import { t } from '../i18n/index.mjs';
import { esc } from './util.mjs';
import { ads, funding } from '../site.config.mjs';

// ---- cards and chips ------------------------------------------------------------------------

export const card = (p) =>
  `<li><a class="card-link" href="${p.path}">${esc(p.title)}</a>${p.meta ? ` <span class="meta">${esc(p.meta)}</span>` : ''}<span class="card-summary">${esc(p.summary)}</span></li>`;

export const cardList = (items, cls = '') => `<ul class="card-list${cls ? ` ${cls}` : ''}">\n${items.map(card).join('\n')}\n</ul>`;

export const chipList = (items) =>
  `<ul class="chip-list">${items.map((c) => `<li><a href="${c.href}">${c.html}</a></li>`).join('')}</ul>`;

// ---- grouping (driven by `groups` in site.config.mjs) -----------------------------------------

// Splits pages into the labelled groups a collection declares. Pages that match no group
// go to the group marked `rest`, so a new value never makes a page disappear from its index.
export function groupPages(col, pages) {
  const g = col.groups;
  if (!g) return null;
  const hit = (p, item) => item.values && item.values.includes(p.fm && p.fm[g.by]);
  const claimed = new Set();
  const out = g.items.map((item) => ({ item, pages: item.rest ? [] : pages.filter((p) => hit(p, item)) }));
  out.forEach((o) => o.pages.forEach((p) => claimed.add(p)));
  out.forEach((o) => {
    if (o.item.rest) o.pages = pages.filter((p) => !claimed.has(p));
  });
  return out.filter((o) => o.pages.length);
}

// ---- notices --------------------------------------------------------------------------------

export const notice = (label, text, extra = '') =>
  `<aside class="notice" aria-label="${esc(label)}"><p><strong>${esc(label)}.</strong> ${esc(text)}${extra ? ` ${extra}` : ''}</p></aside>`;

// ---- quick facts ----------------------------------------------------------------------------

const FACTS_VISIBLE = 8;

export function infobox(rows) {
  if (!rows.length) return '';
  const row = (r) => `<div><dt>${esc(r.label)}</dt><dd>${r.html}</dd></div>`;
  const first = rows.slice(0, FACTS_VISIBLE).map(row).join('');
  const more = rows.slice(FACTS_VISIBLE);
  const rest = more.length
    ? `<details class="infobox-more"><summary>${esc(more.length === 1 ? t('moreFact', { n: more.length }) : t('moreFacts', { n: more.length }))}</summary><dl>${more.map(row).join('')}</dl></details>`
    : '';
  return `<aside class="infobox" aria-labelledby="infobox-title"><h2 id="infobox-title">${esc(t('quickFacts'))}</h2><dl>${first}</dl>${rest}</aside>`;
}

// ---- contents -------------------------------------------------------------------------------

// Contents need at least three sections to be worth showing.
export function hasToc(headings) {
  return headings.filter((h) => h.level === 2).length >= 3;
}

function tocItems(headings) {
  const groups = [];
  for (const h of headings) {
    if (h.level === 2) groups.push({ h, kids: [] });
    else if (h.level === 3 && groups.length) groups[groups.length - 1].kids.push(h);
  }
  const link = (h) => `<a href="#${h.id}">${esc(h.text)}</a>`;
  return groups
    .map((g) => `<li>${link(g.h)}${g.kids.length ? `<ol>${g.kids.map((k) => `<li>${link(k)}</li>`).join('')}</ol>` : ''}</li>`)
    .join('');
}

// Two presentations of the same list: a collapsible bar for narrow screens and a sticky
// column for wide ones. The stylesheet shows whichever fits.
export function tocBar(headings) {
  return `<nav class="toc toc--bar" aria-label="${esc(t('contents'))}"><details><summary>${esc(t('contents'))}</summary><ol>${tocItems(headings)}</ol></details></nav>`;
}
export function tocSide(headings) {
  return `<nav class="toc toc--side" aria-label="${esc(t('contents'))}"><div class="toc-inner"><div class="toc-head"><h2 class="toc-title">${esc(t('contents'))}</h2><button type="button" class="toc-hide" aria-expanded="true">${esc(t('hide'))}</button></div><ol><li class="toc-top"><a href="#top">${esc(t('top'))}</a></li>${tocItems(headings)}</ol></div></nav>`;
}

// ---- advertising ----------------------------------------------------------------------------

// Returns '' unless ads are switched on (or a design preview is requested at build time).
// Slots have a fixed reserved height so late-loading ads never shift the page.
export function adSlot(name) {
  const slot = ads.slots[name];
  const preview = process.env.ADS_PREVIEW === '1';
  if (!slot || slot.enabled === false || (!ads.enabled && !preview)) return '';
  const d = ads.direct[name];
  const label = d ? ads.sponsoredLabel : ads.label;
  const body = d
    ? `<a href="${esc(d.href)}" rel="sponsored noopener" target="_blank"><img src="${esc(d.image)}" alt="${esc(d.alt || '')}" width="${d.width}" height="${d.height}" loading="lazy"></a>`
    : ads.enabled
      ? `<div class="ad-unit" data-ad-slot="${esc(name)}"></div>`
      : `<div class="ad-preview">Ad space ${esc(slot.sizes)}</div>`;
  return `<aside class="ad ad--${esc(name)}" aria-label="${esc(label)}"><p class="ad-label">${esc(label)}</p><div class="ad-box" style="min-height:${esc(slot.minHeight)}">${body}</div></aside>`;
}

export const fundingNote = () => (ads.enabled ? `<p class="funding">${esc(funding)}</p>` : '');
